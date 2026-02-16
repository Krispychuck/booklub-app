// API pricing constants — update when model or pricing changes
// Source: https://docs.anthropic.com/en/docs/about-claude/models
const MODEL_PRICING = {
  'claude-sonnet-4-20250514': {
    input_cost_per_token: 3.00 / 1_000_000,   // $3.00 per million tokens
    output_cost_per_token: 15.00 / 1_000_000,  // $15.00 per million tokens
  }
};

function calculateCost(model, inputTokens, outputTokens) {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    console.warn(`Unknown model pricing: ${model}`);
    return null;
  }
  const inputCost = inputTokens * pricing.input_cost_per_token;
  const outputCost = outputTokens * pricing.output_cost_per_token;
  return {
    input_cost: inputCost,
    output_cost: outputCost,
    total_cost: inputCost + outputCost,
  };
}

module.exports = { MODEL_PRICING, calculateCost };
