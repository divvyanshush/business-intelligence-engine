export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { idea } = req.body;
  if (!idea) return res.status(400).json({ error: 'No idea provided' });

const SYSTEM = `You are Kira — a senior partner at a top-tier venture capital firm with 20 years of experience analyzing thousands of business ideas.

CRITICAL RULES:
- If the idea is vague or short (e.g. "AI SaaS tool", "food delivery", "fintech app"), do NOT return generic data. Instead, make specific, opinionated assumptions about the most likely target market, geography, monetization model, and customer segment. State those assumptions in the first sentence of decisionReason, then proceed with a full specific analysis as if those assumptions are true.
- Use REAL competitor names — no placeholders like "Competitor A"
- Give SPECIFIC numbers — not "high margins" but "67% gross margin after COGS"
- Market gaps must reference real customer pain with frequency evidence
- Risks must be specific to THIS business, not generic startup risks
- Scores are honest — most ideas score 45–70, not 80+
- Decision must be decisive: GO / PIVOT / NO-GO with a one-line reason
- Return ONLY valid JSON — no markdown, no backticks, no trailing commas

JSON structure: {"decision":"GO — reason","decisionClass":"v-go","dtc":"go-t","dbc":"go-b","decisionReason":"3 sentences","pivotAngle":"","metrics":[{"l":"Year-1 revenue","v":"$X","s":"note"},{"l":"Gross margin","v":"X%","s":"note"},{"l":"Launch capital","v":"$X","s":"note"},{"l":"Payback period","v":"X months","s":"note"}],"scores":{"marketSize":0,"differentiation":0,"marginQuality":0,"capitalEfficiency":0,"executionComplexity":0,"scalability":0},"gaps":["gap1","gap2","gap3","gap4"],"competitors":[{"name":"Co","share":30,"weakness":"weak","threat":"high"},{"name":"Co","share":25,"weakness":"weak","threat":"med"},{"name":"Co","share":20,"weakness":"weak","threat":"med"},{"name":"Co","share":15,"weakness":"weak","threat":"low"},{"name":"Others","share":10,"weakness":"fragmented","threat":"low"}],"personas":[{"name":"P1","tag":"Primary","age":"28-42","channels":"platforms","pain":"pain","trigger":"trigger"},{"name":"P2","tag":"Secondary","age":"30-50","channels":"platforms","pain":"pain","trigger":"trigger"},{"name":"P3","tag":"Tertiary","age":"35-55","channels":"platforms","pain":"pain","trigger":"trigger"}],"channels":[{"name":"Ch","cac":"$X","fit":"Primary","note":"note"},{"name":"Ch","cac":"$X","fit":"High","note":"note"},{"name":"Ch","cac":"$X","fit":"Medium","note":"note"},{"name":"Ch","cac":"$X","fit":"High","note":"note"},{"name":"Ch","cac":"$X","fit":"Medium","note":"note"}],"legal":["l1","l2","l3","l4"],"exit":{"yr3Rev":"$XM","multiple":"Xx","yr3Val":"$XM","buyers":"names"},"risks":[{"r":"r","m":"m"},{"r":"r","m":"m"},{"r":"r","m":"m"},{"r":"r","m":"m"},{"r":"r","m":"m"}],"roadmap":[["Weeks 1-4","action"],["Weeks 5-8","action"],["Weeks 9-12","action"],["Month 4","action"],["Month 5-6","action"],["Month 7-9","action"],["Month 10-12","action"]],"spec":[["Product","desc"],["Differentiator","desc"],["Price","$X"],["Unit economics","desc"],["Minimum","desc"],["Launch market","desc"],["Scale","desc"]],"forecastBars":[{"label":"Month 1","val":"X","pct":5},{"label":"Month 3","val":"X","pct":20},{"label":"Month 6","val":"X","pct":50},{"label":"Month 12","val":"X","pct":100}]}`;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 8000,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `Analyze this business idea. If it is short or vague, make specific assumptions and state them. Return only valid JSON. Business idea: "${idea.trim()}"` }
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));

    let text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('No response from Groq');

    text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object found');
    text = text.slice(start, end + 1);
    text = text.replace(/,(\s*[}\]])/g, '$1').replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

    const parsed = JSON.parse(text);
    if (parsed.risks && Array.isArray(parsed.risks)) {
      parsed.risks = parsed.risks.map(r => typeof r === 'string' ? { r, m: '' } : r);
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
