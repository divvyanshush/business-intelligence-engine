export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { idea } = req.body;
  if (!idea) return res.status(400).json({ error: 'No idea provided' });

  const SYSTEM = `You are a business analyst. Return ONLY valid JSON, no markdown, no explanation. Analyze the business idea and return this exact structure:
{"decision":"GO — reason","decisionClass":"v-go","dtc":"go-t","dbc":"go-b","decisionReason":"2-3 sentence analysis","metrics":[{"l":"Year-1 revenue","v":"$500K","s":"estimate"},{"l":"Net margin","v":"35%","s":"after costs"},{"l":"Launch capital","v":"$15,000","s":"to start"},{"l":"Success probability","v":"45%","s":"with USP"}],"scores":{"marketSize":70,"differentiation":65,"marginQuality":72,"capitalEfficiency":68,"executionComplexity":60,"scalability":75},"gaps":["gap1","gap2","gap3","gap4"],"competitors":[{"name":"Competitor 1","share":30,"weakness":"weakness","threat":"high"},{"name":"Competitor 2","share":25,"weakness":"weakness","threat":"med"},{"name":"Competitor 3","share":20,"weakness":"weakness","threat":"med"},{"name":"Competitor 4","share":15,"weakness":"weakness","threat":"low"},{"name":"Others","share":10,"weakness":"fragmented","threat":"low"}],"personas":[{"name":"Persona 1","tag":"Primary","age":"25-40","channels":"Instagram, Google","pain":"main pain","trigger":"purchase trigger"},{"name":"Persona 2","tag":"Secondary","age":"30-50","channels":"LinkedIn","pain":"pain","trigger":"trigger"},{"name":"Persona 3","tag":"Tertiary","age":"35-55","channels":"Google","pain":"pain","trigger":"trigger"}],"channels":[{"name":"Channel 1","cac":"$10-20","fit":"Primary","note":"details"},{"name":"Channel 2","cac":"$15-25","fit":"High","note":"details"},{"name":"Channel 3","cac":"$20-35","fit":"Medium","note":"details"},{"name":"Channel 4","cac":"$5-15","fit":"High","note":"details"},{"name":"Channel 5","cac":"$25-50","fit":"Medium","note":"details"}],"legal":["legal1","legal2","legal3","legal4"],"exit":{"yr3Rev":"$2M","multiple":"2-4x","yr3Val":"$4-8M","buyers":"Strategic acquirers"},"risks":["risk1","risk2","risk3","risk4","risk5"],"roadmap":[["Weeks 1-4","action"],["Weeks 5-8","action"],["Month 3","action"],["Month 4-6","action"],["Month 7-12","action"]],"spec":[["Product","description"],["Price","$X"],["Target","audience"],["Key feature","feature"],["Launch channel","channel"]],"forecastBars":[{"label":"Month 1","val":"early","pct":5},{"label":"Month 3","val":"growing","pct":20},{"label":"Month 6","val":"scaling","pct":50},{"label":"Month 12","val":"mature","pct":100}]}`;

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
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `Analyze this business idea: "${idea}"` }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    
    const text = data.choices[0].message.content;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in response');
    
    return res.status(200).json(JSON.parse(match[0]));
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
