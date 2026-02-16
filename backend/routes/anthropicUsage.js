const express = require('express');
const router = express.Router();

// GET /api/admin/anthropic-usage — Fetch usage data from Anthropic Admin API
router.get('/', async (req, res) => {
  const adminKey = process.env.ANTHROPIC_ADMIN_API_KEY;

  if (!adminKey) {
    return res.json({
      configured: false,
      message: 'ANTHROPIC_ADMIN_API_KEY not configured. Add it to your environment variables to see account-wide usage data.',
    });
  }

  try {
    // Query last 31 days of cost data (max for 1d buckets)
    const now = new Date();
    const thirtyOneDaysAgo = new Date(now);
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

    const startingAt = thirtyOneDaysAgo.toISOString();
    const endingAt = now.toISOString();

    const headers = {
      'anthropic-version': '2023-06-01',
      'x-api-key': adminKey,
    };

    // Fetch cost data (grouped by description for model + token type breakdown)
    const costUrl = `https://api.anthropic.com/v1/organizations/cost_report?` +
      `starting_at=${encodeURIComponent(startingAt)}&` +
      `ending_at=${encodeURIComponent(endingAt)}&` +
      `bucket_width=1d&` +
      `limit=31`;

    // Fetch usage data (grouped by model for token counts)
    const usageUrl = `https://api.anthropic.com/v1/organizations/usage_report/messages?` +
      `starting_at=${encodeURIComponent(startingAt)}&` +
      `ending_at=${encodeURIComponent(endingAt)}&` +
      `bucket_width=1d&` +
      `group_by[]=model&` +
      `limit=31`;

    const [costResponse, usageResponse] = await Promise.all([
      fetch(costUrl, { headers }),
      fetch(usageUrl, { headers }),
    ]);

    if (!costResponse.ok) {
      const errText = await costResponse.text();
      console.error('Anthropic Cost API error:', costResponse.status, errText);
      return res.status(502).json({
        configured: true,
        error: `Anthropic Cost API returned ${costResponse.status}`,
      });
    }

    if (!usageResponse.ok) {
      const errText = await usageResponse.text();
      console.error('Anthropic Usage API error:', usageResponse.status, errText);
      return res.status(502).json({
        configured: true,
        error: `Anthropic Usage API returned ${usageResponse.status}`,
      });
    }

    const costData = await costResponse.json();
    const usageData = await usageResponse.json();

    // Process cost data: sum daily costs (amounts are in cents as decimal strings)
    let totalCostCents = 0;
    const dailyCosts = [];

    for (const bucket of costData.data) {
      let bucketCostCents = 0;
      for (const result of bucket.results) {
        bucketCostCents += parseFloat(result.amount) || 0;
      }
      totalCostCents += bucketCostCents;
      dailyCosts.push({
        date: bucket.starting_at.split('T')[0],
        cost: bucketCostCents / 100, // Convert cents to dollars
      });
    }

    // Process usage data: aggregate token counts per model
    const modelUsage = {};
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCacheReadTokens = 0;
    let totalCacheCreateTokens = 0;

    for (const bucket of usageData.data) {
      for (const result of bucket.results) {
        const model = result.model || 'unknown';
        if (!modelUsage[model]) {
          modelUsage[model] = { input_tokens: 0, output_tokens: 0, cache_read: 0, cache_create: 0 };
        }
        const uncached = result.uncached_input_tokens || 0;
        const output = result.output_tokens || 0;
        const cacheRead = result.cache_read_input_tokens || 0;
        const cacheCreate = (result.cache_creation?.ephemeral_5m_input_tokens || 0) +
                            (result.cache_creation?.ephemeral_1h_input_tokens || 0);

        modelUsage[model].input_tokens += uncached;
        modelUsage[model].output_tokens += output;
        modelUsage[model].cache_read += cacheRead;
        modelUsage[model].cache_create += cacheCreate;

        totalInputTokens += uncached;
        totalOutputTokens += output;
        totalCacheReadTokens += cacheRead;
        totalCacheCreateTokens += cacheCreate;
      }
    }

    // Sort daily costs chronologically
    dailyCosts.sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      configured: true,
      totals: {
        total_cost: totalCostCents / 100, // Dollars
        total_input_tokens: totalInputTokens,
        total_output_tokens: totalOutputTokens,
        total_cache_read_tokens: totalCacheReadTokens,
        total_cache_create_tokens: totalCacheCreateTokens,
      },
      daily: dailyCosts,
      byModel: Object.entries(modelUsage).map(([model, usage]) => ({
        model,
        ...usage,
      })),
      period: {
        from: startingAt.split('T')[0],
        to: endingAt.split('T')[0],
      },
    });
  } catch (error) {
    console.error('Error fetching Anthropic usage:', error);
    res.status(500).json({
      configured: true,
      error: 'Failed to fetch usage data from Anthropic.',
    });
  }
});

module.exports = router;
