import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a world-class business analyst and startup strategist. When given a business idea, you analyze it deeply and return ONLY a valid JSON object — no markdown, no explanation, just raw JSON.

The JSON must follow this exact structure:
{
  "decision": "string — one of: GO, PIVOT, NO-GO followed by a short reason",
  "decisionClass": "string — one of: v-go, v-pivot, v-no",
  "dtc": "string — one of: go-t, pivot-t, no-t",
  "dbc": "string — one of: go-b, pivot-b, no-b",
  "decisionReason": "string — 2-3 sentences explaining the verdict with specific insight",
  "metrics": [
    { "l": "label", "v": "value", "s": "sub-note" }
  ],
  "scores": {
    "marketSize": number 0-100,
    "differentiation": number 0-100,
    "marginQuality": number 0-100,
    "capitalEfficiency": number 0-100,
    "executionComplexity": number 0-100,
    "scalability": number 0-100
  },
  "gaps": ["string", "string", "string", "string"],
  "competitors": [
    { "name": "string", "share": number, "weakness": "string", "threat": "high|med|low" }
  ],
  "personas": [
    { "name": "string", "tag": "string", "age": "string", "channels": "string", "pain": "string", "trigger": "string" }
  ],
  "channels": [
    { "name": "string", "cac": "string", "fit": "Primary|High|Medium|Low", "note": "string" }
  ],
  "legal": ["string", "string", "string", "string"],
  "exit": {
    "yr3Rev": "string",
    "multiple": "string",
    "yr3Val": "string",
    "buyers": "string"
  },
  "risks": ["string", "string", "string", "string", "string"],
  "roadmap": [
    ["timeframe", "action"]
  ],
  "spec": [
    ["label", "value"]
  ],
  "forecastBars": [
    { "label": "string", "val": "string", "pct": number }
  ]
}

Requirements:
- metrics: exactly 4 items with realistic numbers specific to this business
- scores: all numbers between 0-100, be honest and critical
- gaps: exactly 4 specific market gaps with data-backed insights
- competitors: exactly 5 competitors with realistic market share percentages that sum to 100
- personas: exactly 3 personas
- channels: exactly 5 channels
- legal: exactly 4 legal items
- risks: exactly 5 risks
- roadmap: 6-8 entries covering weeks 1-4 through month 12
- spec: 6-8 product/service specification rows
- forecastBars: exactly 4 entries (Month 1, Month 3, Month 6, Month 12) with pct values 5-100
- Be specific, realistic, and honest. Use real competitor names. Give real numbers.
- For "decision" field format: "GO — reason" or "PIVOT — reason" or "NO-GO — reason"`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { idea } = req.body;
  if (!idea || idea.trim().length < 5) {
    return res.status(400).json({ error: 'Please provide a valid business idea' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this business idea in detail: "${idea.trim()}"` }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const raw = completion.choices[0]?.message?.content || '';

    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);
    return res.status(200).json(data);

  } catch (err) {
    console.error('Groq API error:', err);
    return res.status(500).json({ 
      error: 'Analysis failed. Please check your GROQ_API_KEY and try again.',
      details: err.message 
    });
  }
}
