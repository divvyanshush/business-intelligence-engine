export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { idea } = req.body;
  if (!idea) return res.status(400).json({ error: 'No idea provided' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: `You are a senior VC partner with 20 years experience. Analyze business ideas brutally honestly. RULES: Use REAL competitor names. Give SPECIFIC numbers. Market gaps must name the source (G2, Capterra, Reddit, etc) or be qualitative — never invent stats. Risks must name a specific company/regulation/dynamic with timeframe — NEVER generic phrases like 'technical debt' or 'scalability issues'. Scores: most ideas score 45-70. Decision: GO=clear path to $1M ARR in 18 months. PIVOT=opportunity exists but wrong angle, must name the specific repositioning. NO-GO=only if zero viable path. If market gaps exist AND exit potential above $30M, verdict MUST be PIVOT not NO-GO. Return ONLY raw valid JSON, no markdown, no backticks, no trailing commas.` }] },
          contents: [{ role: 'user', parts: [{ text: `Analyze this business idea and return only this exact JSON structure with real data filled in: {"decision":"GO — reason","decisionClass":"v-go","dtc":"go-t","dbc":"go-b","decisionReason":"3 sentences with specific insight and numbers","pivotAngle":"specific repositioning if PIVOT/NO-GO, empty string if GO","metrics":[{"l":"Year-1 revenue","v":"$X","s":"basis"},{"l":"Gross margin","v":"X%","s":"after COGS"},{"l":"Launch capital","v":"$X","s":"what it covers"},{"l":"Payback period","v":"X months","s":"at target CAC"}],"scores":{"marketSize":0,"differentiation":0,"marginQuality":0,"capitalEfficiency":0,"executionComplexity":0,"scalability":0},"gaps":["gap with source","gap","gap","gap"],"competitors":[{"name":"Real name","share":30,"weakness":"specific","threat":"high"},{"name":"Real","share":25,"weakness":"specific","threat":"med"},{"name":"Real","share":20,"weakness":"specific","threat":"med"},{"name":"Real","share":15,"weakness":"specific","threat":"low"},{"name":"Long tail","share":10,"weakness":"fragmented","threat":"low"}],"personas":[{"name":"Name","tag":"Primary — X%","age":"28-42","channels":"platforms","pain":"specific pain","trigger":"specific trigger"},{"name":"Name","tag":"Secondary","age":"30-50","channels":"platforms","pain":"pain","trigger":"trigger"},{"name":"Name","tag":"Tertiary","age":"35-55","channels":"platforms","pain":"pain","trigger":"trigger"}],"channels":[{"name":"Channel","cac":"$X-Y","fit":"Primary","note":"specific"},{"name":"Channel","cac":"$X-Y","fit":"High","note":"specific"},{"name":"Channel","cac":"$X-Y","fit":"Medium","note":"specific"},{"name":"Channel","cac":"$X-Y","fit":"High","note":"specific"},{"name":"Channel","cac":"$X-Y","fit":"Medium","note":"specific"}],"legal":["requirement","IP consideration","compliance","entity recommendation"],"exit":{"yr3Rev":"$XM","multiple":"X-Yx","yr3Val":"$XM-$YM","buyers":"Named acquirers"},"risks":[{"r":"Specific named risk with company and timeframe","m":"concrete mitigation"},{"r":"risk","m":"mitigation"},{"r":"risk","m":"mitigation"},{"r":"risk","m":"mitigation"},{"r":"risk","m":"mitigation"}],"roadmap":[["Weeks 1-4","action with output"],["Weeks 5-8","action"],["Weeks 9-12","action"],["Month 4","action"],["Month 5-6","action"],["Month 7-9","action"],["Month 10-12","action"]],"spec":[["Product/service","description"],["Core differentiator","unique thing"],["Price point","$X — rationale"],["Unit economics","COGS $X, price $Y, margin Z%"],["MOQ or minimum","X"],["Launch market","specific segment"],["Scale path","how it grows"]],"forecastBars":[{"label":"Month 1","val":"X customers","pct":5},{"label":"Month 3","val":"X customers","pct":20},{"label":"Month 6","val":"X customers","pct":50},{"label":"Month 12","val":"X customers","pct":100}]}\n\nBusiness idea: "${idea.trim()}"` }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 4000 },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error('No response from Gemini');

    text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON found');
    text = text.slice(start, end + 1);
    text = text.replace(/,(\s*[}\]])/g, '$1').replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

    const parsed = JSON.parse(text);
    if (parsed.risks) parsed.risks = parsed.risks.map(r => typeof r === 'string' ? { r, m: '' } : r);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
