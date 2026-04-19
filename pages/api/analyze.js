export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { idea } = req.body;
  if (!idea) return res.status(400).json({ error: 'No idea provided' });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `You are a business analyst. Return ONLY valid JSON with no markdown, no backticks, no explanation. Use this exact structure with realistic data for the business idea given: {"decision":"GO — reason","decisionClass":"v-go","dtc":"go-t","dbc":"go-b","decisionReason":"2-3 sentences","metrics":[{"l":"Year-1 revenue","v":"$500K","s":"estimate"},{"l":"Net margin","v":"35%","s":"after costs"},{"l":"Launch capital","v":"$15000","s":"to start"},{"l":"Success probability","v":"45%","s":"with USP"}],"scores":{"marketSize":70,"differentiation":65,"marginQuality":72,"capitalEfficiency":68,"executionComplexity":60,"scalability":75},"gaps":["gap 1","gap 2","gap 3","gap 4"],"competitors":[{"name":"Name","share":30,"weakness":"weakness","threat":"high"},{"name":"Name","share":25,"weakness":"weakness","threat":"med"},{"name":"Name","share":20,"weakness":"weakness","threat":"med"},{"name":"Name","share":15,"weakness":"weakness","threat":"low"},{"name":"Others","share":10,"weakness":"fragmented","threat":"low"}],"personas":[{"name":"Persona","tag":"Primary","age":"25-40","channels":"Instagram","pain":"pain point","trigger":"trigger"},{"name":"Persona","tag":"Secondary","age":"30-50","channels":"Google","pain":"pain","trigger":"trigger"},{"name":"Persona","tag":"Tertiary","age":"35-55","channels":"Search","pain":"pain","trigger":"trigger"}],"channels":[{"name":"Channel","cac":"$10-20","fit":"Primary","note":"note"},{"name":"Channel","cac":"$15-25","fit":"High","note":"note"},{"name":"Channel","cac":"$20-35","fit":"Medium","note":"note"},{"name":"Channel","cac":"$5-15","fit":"High","note":"note"},{"name":"Channel","cac":"$25-50","fit":"Medium","note":"note"}],"legal":["item 1","item 2","item 3","item 4"],"exit":{"yr3Rev":"$2M","multiple":"2-4x","yr3Val":"$4-8M","buyers":"Strategic acquirers"},"risks":["risk 1","risk 2","risk 3","risk 4","risk 5"],"roadmap":[["Weeks 1-4","action"],["Weeks 5-8","action"],["Month 3","action"],["Month 4-6","action"],["Month 7-12","action"]],"spec":[["Product","desc"],["Price","$X"],["Target","audience"],["Feature","detail"],["Channel","channel"]],"forecastBars":[{"label":"Month 1","val":"early","pct":5},{"label":"Month 3","val":"growing","pct":20},{"label":"Month 6","val":"scaling","pct":50},{"label":"Month 12","val":"mature","pct":100}]}` },
          { role: 'user', content: `Analyze this business idea and return JSON only: "${idea}"` }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    
    let text = data.choices[0].message.content.trim();
    
    // Strip markdown if present
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    
    // Find JSON object
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON found in response');
    
    text = text.slice(start, end + 1);
    
    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
