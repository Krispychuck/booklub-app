import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './MindMapVisualization.css';
import { API_URL } from '../config';

const getTypeColor = (type, opacity) => {
  const colors = {
    central: `rgba(255, 255, 255, ${opacity})`,
    theme: `rgba(200, 170, 110, ${opacity})`,
    argument: `rgba(140, 180, 140, ${opacity})`,
    counterpoint: `rgba(180, 120, 120, ${opacity})`,
    revelation: `rgba(170, 140, 200, ${opacity})`,
    question: `rgba(130, 165, 200, ${opacity})`,
  };
  return colors[type] || colors.theme;
};

const truncate = (text, max) =>
  text.length > max ? text.substring(0, max - 1) + '…' : text;

function renderMindMap(data, svgRef, containerRef, setSelectedNode) {
  const svg = d3.select(svgRef.current);
  svg.selectAll('*').remove();

  const container = containerRef.current;
  const width = container.clientWidth;
  const height = container.clientHeight;

  svg.attr('width', width).attr('height', height);

  // Build hierarchy from flat nodes
  const root = {
    name: data.centralTheme,
    type: 'central',
    participants: [],
    summary: '',
    messageIds: [],
    children: (data.nodes || []).map(node => ({
      name: node.label,
      type: node.type || 'theme',
      participants: node.participants || [],
      summary: node.summary || '',
      messageIds: node.messageIds || [],
      id: node.id,
      children: (node.children || []).map(child => ({
        name: child.label,
        type: child.type || 'argument',
        participants: child.participants || [],
        summary: child.summary || '',
        messageIds: child.messageIds || [],
        id: child.id,
      })),
    })),
  };

  const hierarchy = d3.hierarchy(root);

  // Radial tree layout — wide separation to prevent label overlap
  const radius = Math.min(width, height) / 2 - 100;
  const tree = d3.tree()
    .size([2 * Math.PI, radius * 0.55])
    .separation((a, b) => (a.parent === b.parent ? 2 : 3) / (a.depth || 1));

  tree(hierarchy);

  // Push leaf nodes further out so labels don't overlap branch labels
  hierarchy.each(d => {
    if (d.depth === 2) {
      d.y = radius * 0.85;
    }
  });

  // Center the visualization
  const g = svg.append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

  // Zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.3, 3])
    .on('zoom', (event) => {
      g.attr('transform', `translate(${width / 2 + event.transform.x}, ${height / 2 + event.transform.y}) scale(${event.transform.k})`);
    });

  svg.call(zoom);

  // Draw links as smooth curves
  g.selectAll('.mind-map-link')
    .data(hierarchy.links())
    .join('path')
    .attr('class', 'mind-map-link')
    .attr('d', d3.linkRadial()
      .angle(d => d.x)
      .radius(d => d.y)
    )
    .attr('fill', 'none')
    .attr('stroke', d => getTypeColor(d.target.data.type, 0.35))
    .attr('stroke-width', d => d.source.depth === 0 ? 2 : 1.5);

  // Draw nodes
  const nodes = g.selectAll('.mind-map-node')
    .data(hierarchy.descendants())
    .join('g')
    .attr('class', d => `mind-map-node mind-map-node--${d.data.type}`)
    .attr('transform', d => {
      if (d.depth === 0) return 'translate(0, 0)';
      const angle = d.x - Math.PI / 2;
      const r = d.y;
      return `translate(${r * Math.cos(angle)}, ${r * Math.sin(angle)})`;
    })
    .style('cursor', d => d.depth === 0 ? 'default' : 'pointer')
    .on('click', (event, d) => {
      event.stopPropagation();
      if (d.depth === 0) return;
      setSelectedNode(prev =>
        prev && prev.id === d.data.id ? null : d.data
      );
    });

  // Central node: large circle with wrapped text inside
  const centralNodes = nodes.filter(d => d.depth === 0);
  centralNodes.append('circle')
    .attr('r', 55)
    .attr('fill', getTypeColor('central', 1))
    .attr('stroke', '#555')
    .attr('stroke-width', 2);

  centralNodes.each(function (d) {
    const node = d3.select(this);
    const label = d.data.name;
    const words = label.split(/\s+/);
    const lineHeight = 14;
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length > 16 && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);

    const startY = -(lines.length - 1) * lineHeight / 2;
    lines.forEach((line, i) => {
      node.append('text')
        .attr('class', 'mind-map-label mind-map-label--central')
        .attr('y', startY + i * lineHeight)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text(line);
    });
  });

  // Branch nodes (depth 1): small dot + label placed OUTSIDE
  const branchNodes = nodes.filter(d => d.depth === 1);
  branchNodes.append('circle')
    .attr('r', 6)
    .attr('fill', d => getTypeColor(d.data.type, 1))
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5);

  branchNodes.each(function (d) {
    const node = d3.select(this);
    const angle = d.x - Math.PI / 2;
    const angleDeg = (angle * 180) / Math.PI;
    const flip = angleDeg > 90 || angleDeg < -90;
    const textAnchor = flip ? 'end' : 'start';
    const dx = flip ? -14 : 14;
    const rotation = flip ? angleDeg + 180 : angleDeg;

    node.append('text')
      .attr('class', 'mind-map-label mind-map-label--branch')
      .attr('transform', `rotate(${rotation})`)
      .attr('dx', dx)
      .attr('dy', '0.35em')
      .attr('text-anchor', textAnchor)
      .text(truncate(d.data.name, 22));
  });

  // Leaf nodes (depth 2): tiny dot + label outside
  const leafNodes = nodes.filter(d => d.depth >= 2);
  leafNodes.append('circle')
    .attr('r', 4)
    .attr('fill', d => getTypeColor(d.data.type, 0.8))
    .attr('stroke', '#fff')
    .attr('stroke-width', 1);

  leafNodes.each(function (d) {
    const node = d3.select(this);
    const angle = d.x - Math.PI / 2;
    const angleDeg = (angle * 180) / Math.PI;
    const flip = angleDeg > 90 || angleDeg < -90;
    const textAnchor = flip ? 'end' : 'start';
    const dx = flip ? -10 : 10;
    const rotation = flip ? angleDeg + 180 : angleDeg;

    node.append('text')
      .attr('class', 'mind-map-label mind-map-label--leaf')
      .attr('transform', `rotate(${rotation})`)
      .attr('dx', dx)
      .attr('dy', '0.35em')
      .attr('text-anchor', textAnchor)
      .text(truncate(d.data.name, 20));
  });

  // Type legend
  const legendData = [
    { type: 'theme', label: 'Theme' },
    { type: 'argument', label: 'Argument' },
    { type: 'counterpoint', label: 'Counterpoint' },
    { type: 'revelation', label: 'Revelation' },
    { type: 'question', label: 'Question' },
  ];

  const legend = svg.append('g')
    .attr('class', 'mind-map-legend')
    .attr('transform', `translate(24, ${height - legendData.length * 22 - 20})`);

  legendData.forEach((item, i) => {
    const row = legend.append('g').attr('transform', `translate(0, ${i * 22})`);
    row.append('circle')
      .attr('r', 5)
      .attr('fill', getTypeColor(item.type, 1));
    row.append('text')
      .attr('x', 14)
      .attr('dy', '0.35em')
      .attr('class', 'mind-map-legend-text')
      .text(item.label);
  });
}

function MindMapVisualization({ clubId, bookTitle, bookAuthor, messages: chatMessages, onClose }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const fetchAndRender = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/messages/club/${clubId}/mind-map`,
          { method: 'POST' }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to generate mind map');
        }

        const data = await response.json();
        renderMindMap(data, svgRef, containerRef, setSelectedNode);
      } catch (err) {
        console.error('Mind map error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndRender();
  }, [clubId]);

  // Look up related messages for the selected node
  const relatedMessages = selectedNode?.messageIds
    ? selectedNode.messageIds
        .map(id => chatMessages?.find(m => String(m.id) === String(id)))
        .filter(Boolean)
    : [];

  return (
    <div className="mind-map-overlay" onClick={onClose}>
      <div className="mind-map-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mind-map-header">
          <div className="mind-map-title">
            <h2>Discussion Mind Map</h2>
            <p>{bookTitle} by {bookAuthor}</p>
          </div>
          <button className="mind-map-close-btn" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Visualization Area */}
        <div className="mind-map-body" ref={containerRef}>
          {loading && (
            <div className="mind-map-loading">
              <p>Mapping your discussion...</p>
              <div className="mind-map-spinner" />
            </div>
          )}

          {error && (
            <div className="mind-map-error">
              <p>{error}</p>
              <button onClick={onClose}>Close</button>
            </div>
          )}

          <svg ref={svgRef} className="mind-map-svg" />
        </div>

        {/* Selected Node Detail Panel */}
        {selectedNode && (
          <div className="mind-map-detail">
            <div className="mind-map-detail-header">
              <h3>{selectedNode.name}</h3>
              <span className={`mind-map-type-badge mind-map-type-badge--${selectedNode.type}`}>
                {selectedNode.type}
              </span>
            </div>
            {selectedNode.summary && (
              <p className="mind-map-detail-summary">{selectedNode.summary}</p>
            )}
            {selectedNode.participants && selectedNode.participants.length > 0 && (
              <p className="mind-map-detail-participants">
                Participants: {selectedNode.participants.join(', ')}
              </p>
            )}

            {/* Related Messages */}
            <div className="mind-map-detail-messages">
              <h4>Related Messages:</h4>
              {relatedMessages.length > 0 ? (
                relatedMessages.map(msg => (
                  <div key={msg.id} className="mind-map-detail-message">
                    <span className="mind-map-detail-message-sender">
                      {msg.sender_type === 'ai' ? msg.sender_ai_name : (msg.sender_name || 'User')}:
                    </span>
                    <span className="mind-map-detail-message-content">
                      {msg.content.length > 120
                        ? msg.content.substring(0, 120) + '...'
                        : msg.content}
                    </span>
                  </div>
                ))
              ) : (
                <p className="mind-map-detail-no-messages">No linked messages</p>
              )}
            </div>

            <button
              className="mind-map-detail-close"
              onClick={() => setSelectedNode(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mind-map-instructions">
          Scroll to zoom &middot; Drag to pan &middot; Click a node for details
        </div>
      </div>
    </div>
  );
}

export default MindMapVisualization;
