export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { idea } = req.body;
  if (!idea) return res.status(400).json({ error: 'No idea provided' });

  const SYSTEM = `You are a senior partner at a top-tier venture capital firm with 20 years of experience analyzing thousands of business ideas. You have deep expertise in market sizing, unit economics, competitive dynamics, and go-to-market strategy.

Your job: give a brutally honest, data-specific analysis of the business idea. No fluff. No generic advice. Think like someone who has seen this category fail 50 times and knows exactly why.

RULES:
- Use REAL competitor names, not placeholders
- Give SPECIFIC numbers — not "high margins" but "62% gross margin after COGS"
- Market gaps must reference real customer pain points with frequency data. You MUST name the source: G2 reviews, Trustpilot, Capterra, Reddit threads, App Store reviews, or a named survey. If you cannot name a real source, describe the pain qualitatively instead — never invent a percentage stat.
- Channels must include specific CAC ranges based on category benchmarks
- Risks must be specific to THIS business — NEVER write risks as single words or generic phrases like "technical debt", "scalability issues", or "competition". Each risk must name a specific company, regulation, cost structure, or market dynamic with a timeframe or trigger.
- Roadmap actions must be concrete and executable with measurable outputs, not vague
- Scores must be honest — most ideas score 45-70, not 80+
- Decision must be decisive:
  * GO — strong conviction, clear path to $1M ARR within 18 months
  * PIVOT — real opportunity exists but current angle is wrong; MUST name the specific repositioning
  * NO-GO — only if there is genuinely zero viable path

CRITICAL JSON RULES: Return ONLY a valid JSON object. No markdown. No backticks. No explanation. No trailing commas. All keys must be double-quoted. Just raw valid JSON.

JSON structure:
{"decision":"GO — one line reason","decisionClass":"v-go","dtc":"go-t","dbc":"go-b","decisionReason":"3 sentences with specific insight, numbers, and the key insight a founder needs to hear","pivotAngle":"","metrics":[{"l":"Year-1 revenue","v":"$X","s":"basis for estimate"},{"l":"Gross margin","v":"X%","s":"after COGS breakdown"},{"l":"Launch capital","v":"$X","s":"what it covers"},{"l":"Payback period","v":"X months","s":"at target CAC"}],"scores":{"marketSize":0,"differentiation":0,"marginQuality":0,"capitalEfficiency":0,"executionComplexity":0,"scalability":0},"gaps":["gap1","gap2","gap3","gap4"],"competitors":[{"name":"Real company","share":30,"weakness":"specific weakness","threat":"high"},{"name":"Real company","share":25,"weakness":"specific weakness","threat":"med"},{"name":"Real company","share":20,"weakness":"specific weakness","threat":"med"},{"name":"Real company","share":15,"weakness":"specific weakness","threat":"low"},{"name":"Long tail","share":10,"weakness":"fragmented","threat":"low"}],"personas":[{"name":"Persona 1","tag":"Primary","age":"28-42","channels":"platforms","pain":"pain","trigger":"trigger"},{"name":"Persona 2","tag":"Secondary","age":"30-50","channels":"platforms","pain":"pain","trigger":"trigger"},{"name":"Persona 3","tag":"Tertiary","age":"35-55","channels":"platforms","pain":"pain","trigger":"trigger"}],"channels":[{"name":"Channel","cac":"$X-Y","fit":"Primary","note":"note"},{"name":"Channel","cac":"$X-Y","fit":"High","note":"note"},{"name":"Channel","cac":"$X-Y","fit":"Medium","note":"note"},{"name":"Channel","cac":"$X-Y","fit":"High","note":"note"},{"name":"Channel","cac":"$X-Y","fit":"Medium","note":"note"}],"legal":["req1","req2","req3","req4"],"exit":{"yr3Rev":"$XM","multiple":"X-Yx","yr3Val":"$XM-$YM","buyers":"named acquirers"},"risks":[{"r":"risk","m":"mitigation"},{"r":"risk","m":"mitigation"},{"r":"risk","m":"mitigation"},{"r":"risk","m":"mitigation"},{"r":"risk","m":"mitigation"}],"roadmap":[["Weeks 1-4","action"],["Weeks 5-8","action"],["Weeks 9-12","action"],["Month 4","action"],["Month 5-6","action"],["Month 7-9","action"],["Month 10-12","action"]],"spec":[["Product/service","desc"],["Core differentiator","desc"],["Price point","$X"],["Unit economics","desc"],["MOQ or minimum","desc"],["Launch market","desc"],["Scale path","desc"]],"forecastBars":[{"label":"Month 1","val":"X customers","pct":5},{"label":"Month 3","val":"X customers","pct":20},{"label":"Month 6","val":"X customers","pct":50},{"label":"Month 12","val":"X customers","pct":100}]}`;

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 4000,
          messages: [
            { role: 'system', content: SYSTEM },
            { role: 'user', content: `Analyze this business idea. Return only valid JSON. Business idea: "${idea.trim()}"` }
          ],
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));

    let text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('No response from Groq');

    text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object found in response');
    text = text.slice(start, end + 1);

    text = text
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

    const parsed = JSON.parse(text);

    if (parsed.risks && Array.isArray(parsed.risks)) {
      parsed.risks = parsed.risks.map(r =>
        typeof r === 'string' ? { r, m: '' } : r
      );
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
