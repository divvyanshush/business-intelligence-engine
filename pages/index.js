import { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

const RadarChart = dynamic(() => import('../components/RadarChart'), { ssr: false })

const PHASE_LOGS = [
  { tag: 'IDEA', cls: 'tag-idea', lines: ['Parsing business idea into category taxonomy...', 'Mapping sub-markets and buyer intent clusters...', 'Estimating price bands and purchase frequency...'] },
  { tag: 'DEMAND', cls: 'tag-demand', lines: ['Scanning search volume and trend data...', 'Checking marketplace unit velocity and YoY growth...', 'Assessing seasonality and saturation level...'] },
  { tag: 'PROFIT', cls: 'tag-profit', lines: ['Analyzing price distribution across competitors...', 'Modeling fee structures, COGS, and channel costs...', 'Identifying margin compression dynamics...'] },
  { tag: 'GAP', cls: 'tag-gap', lines: ['Mining customer reviews and social complaints...', 'Clustering pain points by frequency × severity...', 'Ranking differentiation vectors by defensibility...'] },
  { tag: 'SUPPLY', cls: 'tag-supply', lines: ['Reverse-engineering BOM and cost structure...', 'Matching supplier profiles to required spec...', 'Estimating landed cost and MOQ capital needs...'] },
  { tag: 'SALES', cls: 'tag-sales', lines: ['Modeling revenue and unit forecast curves...', 'Running review velocity and ranking analysis...', 'Calculating Year-1 projections with confidence interval...'] },
  { tag: 'COMP', cls: 'tag-comp', lines: ['Identifying top 5 competitors by market share...', 'Analyzing weaknesses and threat levels...', 'Mapping white space in competitive landscape...'] },
  { tag: 'PERSONA', cls: 'tag-persona', lines: ['Building buyer personas from demographic + behavioral data...', 'Mapping pain points to purchase triggers...', 'Identifying channels and messaging angles per persona...'] },
  { tag: 'CHANNEL', cls: 'tag-channel', lines: ['Scoring acquisition channels by CAC and fit...', 'Recommending launch vs scale channel sequencing...', 'Flagging channel risks and dependencies...'] },
  { tag: 'LEGAL', cls: 'tag-legal', lines: ['Checking licensing and registration requirements...', 'Flagging IP, compliance, and certification needs...', 'Identifying legal risks before capital deployment...'] },
  { tag: 'EXIT', cls: 'tag-exit', lines: ['Projecting Year-3 revenue and EBITDA...', 'Modeling valuation at 2–5x revenue multiples...', 'Identifying likely acquirers and exit paths...'] },
  { tag: 'SCORE', cls: 'tag-go', lines: ['Scoring across 6 dimensions: market, margin, differentiation...', 'Calculating overall opportunity score...', 'Calibrating decision confidence level...'] },
  { tag: 'PLAN', cls: 'tag-plan', lines: ['Generating execution-ready product spec...', 'Building week-by-week launch roadmap...', 'Blueprint ready.'] },
]

const QUICK_STARTS = [
  'Water bottle brand with a modular design',
  'Premium coffee subscription box',
  'SaaS tool for freelance invoice management',
  'Fitness apparel brand for women over 40',
  'Meal-prep delivery service',
  'Handmade soy candles on Etsy',
  'Sustainable kids clothing brand',
  'Mobile pet grooming van business',
]

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

export default function Home() {
  const router = useRouter()
  const [idea, setIdea] = useState('')
  const [phase, setPhase] = useState('input') // input | running | results | error
  const [logs, setLogs] = useState([])
  const [activePhase, setActivePhase] = useState(-1)
  const [donePhases, setDonePhases] = useState([])
  const [reportData, setReportData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [currentIdea, setCurrentIdea] = useState('')
  const [error, setError] = useState('')
  const [forecastAnimated, setForecastAnimated] = useState(false)
  const [compAnimated, setCompAnimated] = useState(false)
  const logRef = useRef(null)
  const abortRef = useRef(null)

  // Load from URL on mount
  useEffect(() => {
    if (router.isReady) {
      const { idea: urlIdea, data: urlData } = router.query
      if (urlIdea && urlData) {
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(urlData)))
          setCurrentIdea(decodeURIComponent(urlIdea))
          setReportData(decoded)
          setPhase('results')
        } catch (e) {
          // ignore bad URL data
        }
      }
    }
  }, [router.isReady])

  const addLog = useCallback((tag, cls, text) => {
    setLogs(prev => [...prev, { tag, cls, text, id: Date.now() + Math.random() }])
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
    }, 50)
  }, [])

  const runAnalysis = async (ideaText) => {
    setCurrentIdea(ideaText)
    setPhase('running')
    setLogs([])
    setActivePhase(0)
    setDonePhases([])
    setError('')

    // Start log animation in parallel with API call
    const logPromise = (async () => {
      for (let i = 0; i < PHASE_LOGS.length; i++) {
        setActivePhase(i)
        for (const line of PHASE_LOGS[i].lines) {
          addLog(PHASE_LOGS[i].tag, PHASE_LOGS[i].cls, line)
          await sleep(300)
        }
        setDonePhases(prev => [...prev, i])
        await sleep(100)
      }
    })()

    // API call
    const apiPromise = fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: ideaText }),
    }).then(r => r.json())

    try {
      const [, data] = await Promise.all([logPromise, apiPromise])
      if (data.error) throw new Error(data.error)
      setReportData(data)
      setActivePhase(PHASE_LOGS.length)
      setPhase('results')
      setActiveTab('overview')
      setForecastAnimated(false)
      setCompAnimated(false)
      setTimeout(() => { setForecastAnimated(true); setCompAnimated(true) }, 150)
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.')
      setPhase('error')
    }
  }

  const handleSubmit = () => {
    if (!idea.trim()) return
    runAnalysis(idea.trim())
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const handleReset = () => {
    setPhase('input')
    setIdea('')
    setLogs([])
    setReportData(null)
    setActivePhase(-1)
    setDonePhases([])
    router.replace('/', undefined, { shallow: true })
  }

  const handleShare = () => {
    if (!reportData) return
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(reportData)))
      const url = `${window.location.origin}?idea=${encodeURIComponent(currentIdea)}&data=${encoded}`
      navigator.clipboard.writeText(url)
      showToast('🔗 Share link copied to clipboard!')
    } catch (e) {
      showToast('Link too long to share — try Export instead')
    }
  }

  const showToast = (msg) => {
    const toast = document.getElementById('toast')
    if (toast) {
      toast.textContent = msg
      toast.classList.add('show')
      setTimeout(() => toast.classList.remove('show'), 3000)
    }
  }

  const exportMarkdown = () => {
    if (!reportData) return
    const d = reportData
    const overall = Math.round(Object.values(d.scores).reduce((a, b) => a + b, 0) / 6)
    const lines = [
      `# Business Intelligence Report`,
      ``,
      `**Idea:** ${currentIdea}`,
      `**Decision:** ${d.decision}`,
      ``,
      `> ${d.decisionReason}`,
      ``,
      `## Key Metrics`,
      ...d.metrics.map(m => `- **${m.l}:** ${m.v} *(${m.s})*`),
      ``,
      `## Opportunity Score: ${overall}/100`,
      ``,
      ...Object.entries({ marketSize: 'Market size', differentiation: 'Differentiation', marginQuality: 'Margin quality', capitalEfficiency: 'Capital efficiency', executionComplexity: 'Execution complexity', scalability: 'Scalability' })
        .map(([k, l]) => `- ${l}: ${d.scores[k]}/100`),
      ``,
      `## Market Gaps`,
      ...d.gaps.map(g => `- ${g}`),
      ``,
      `## Competitors`,
      ...d.competitors.map(c => `- **${c.name}** (${c.share}%) — ${c.weakness} [${c.threat} threat]`),
      ``,
      `## Buyer Personas`,
      ...d.personas.map(p => `### ${p.name}\n- Age: ${p.age} | Channels: ${p.channels}\n- Pain: ${p.pain}\n- Trigger: ${p.trigger}`),
      ``,
      `## Acquisition Channels`,
      ...d.channels.map(c => `- **${c.name}** — CAC: ${c.cac} | ${c.note} [${c.fit}]`),
      ``,
      `## Legal & Compliance`,
      ...d.legal.map(l => `- ${l}`),
      ``,
      `## Exit Potential (Year 3)`,
      `- Revenue: ${d.exit.yr3Rev}`,
      `- Valuation: ${d.exit.yr3Val} (${d.exit.multiple})`,
      `- Likely buyers: ${d.exit.buyers}`,
      ``,
      `## Launch Roadmap`,
      ...d.roadmap.map(r => `- **${r[0]}:** ${r[1]}`),
      ``,
      `## Risk Warnings`,
      ...d.risks.map(r => `- ${r}`),
      ``,
      `---`,
      `*Business Intelligence Engine — Powered by Groq + Llama 3*`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'business-report.md'; a.click()
    URL.revokeObjectURL(url)
  }

  const overall = reportData ? Math.round(Object.values(reportData.scores).reduce((a, b) => a + b, 0) / 6) : 0

  return (
    <>
      <Head>
        <title>Business Intelligence Engine</title>
        <meta name="description" content="AI-powered business idea analysis — demand, margins, competitors, personas, channels & more" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </Head>

      <div className="glow-blob" />

      <div className="page">
        <div className="header">
          <div className="header-eyebrow">AI-Powered Analysis</div>
          <h1>Business Intelligence Engine</h1>
          <p>13-agent deep analysis — demand, margins, gaps, competitors, personas, channels, legal & exit</p>
        </div>

        {/* INPUT */}
        {phase === 'input' && (
          <>
            <div className="input-card">
              <div className="input-row">
                <textarea
                  value={idea}
                  onChange={e => setIdea(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='Describe any business idea... e.g. "I want to launch a premium pet food brand"'
                  rows={2}
                  autoFocus
                />
                <button className="run-btn" onClick={handleSubmit} disabled={!idea.trim()}>
                  Analyze ↗
                </button>
              </div>
            </div>
            <div className="chips-label">Quick starts</div>
            <div className="chips">
              {QUICK_STARTS.map(q => (
                <div key={q} className="chip" onClick={() => setIdea(q)}>{q}</div>
              ))}
            </div>
          </>
        )}

        {/* RUNNING */}
        {phase === 'running' && (
          <>
            <div className="phase-bar">
              {PHASE_LOGS.map((p, i) => (
                <div key={i} className={`phase-pill${activePhase === i ? ' active' : ''}${donePhases.includes(i) ? ' done' : ''}`}>
                  {p.tag}
                </div>
              ))}
            </div>
            <div className="agent-log" ref={logRef}>
              <div className="log-line" style={{ fontWeight: 500, marginBottom: 6 }}>
                <span>13 agents running</span><span className="pulse" />
              </div>
              {logs.map(log => (
                <div key={log.id} className="log-line">
                  <span className={`log-tag ${log.cls}`}>{log.tag}</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ERROR */}
        {phase === 'error' && (
          <>
            <div className="error-card">
              <strong>Analysis failed</strong><br />
              {error}<br /><br />
              Make sure your <code>GROQ_API_KEY</code> environment variable is set in Vercel.
            </div>
            <button className="reset-btn" onClick={handleReset} style={{ marginTop: '1rem' }}>
              ← Try again
            </button>
          </>
        )}

        {/* RESULTS */}
        {phase === 'results' && reportData && (
          <>
            {/* Phase bar — all done */}
            <div className="phase-bar">
              {PHASE_LOGS.map((p, i) => (
                <div key={i} className="phase-pill done">{p.tag}</div>
              ))}
            </div>

            {/* Verdict */}
            <div className={`verdict-card ${reportData.decisionClass}`}>
              <div className={`vt ${reportData.dtc}`}>{reportData.decision}</div>
              <div className={`vb ${reportData.dbc}`}>{reportData.decisionReason}</div>
            </div>

            {/* Tabs */}
            <div className="section-tabs">
              {['overview', 'score', 'market', 'personas', 'channels', 'legal', 'blueprint'].map(tab => (
                <button key={tab} className={`tab${activeTab === tab ? ' active' : ''}`} onClick={() => {
                  setActiveTab(tab)
                  if (tab === 'overview') { setForecastAnimated(false); setTimeout(() => setForecastAnimated(true), 80) }
                  if (tab === 'market') { setCompAnimated(false); setTimeout(() => setCompAnimated(true), 80) }
                }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div>
                <div className="metrics-grid">
                  {reportData.metrics.map((m, i) => (
                    <div key={i} className="metric-card">
                      <div className="label">{m.l}</div>
                      <div className="value">{m.v}</div>
                      <div className="sub">{m.s}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3>Market gaps</h3>
                  {reportData.gaps.map((g, i) => (
                    <div key={i} className="ins-row">
                      <div className="dot dot-a" />
                      <div className="ins-text">{g}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3>Revenue forecast</h3>
                  {reportData.forecastBars.map((b, i) => (
                    <div key={i} className="fb-wrap">
                      <div className="fb-label"><span>{b.label}</span><span>{b.val}</span></div>
                      <div className="fb-track">
                        <div className="fb-fill" style={{ width: forecastAnimated ? `${b.pct}%` : '0%' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3>Risk warnings</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {reportData.risks.map((r, i) => <span key={i} className="risk-chip">{r}</span>)}
                  </div>
                </div>
              </div>
            )}

            {/* SCORE TAB */}
            {activeTab === 'score' && (
              <div>
                <div className="overall-score">
                  <div className="os-num">{overall}</div>
                  <div className="os-label">Overall opportunity score / 100</div>
                </div>
                <RadarChart scores={reportData.scores} />
                <div className="card" style={{ marginTop: '1rem' }}>
                  <h3>Score breakdown</h3>
                  {Object.entries({
                    marketSize: 'Market size',
                    differentiation: 'Differentiation',
                    marginQuality: 'Margin quality',
                    capitalEfficiency: 'Capital efficiency',
                    executionComplexity: 'Execution complexity',
                    scalability: 'Scalability',
                  }).map(([k, l]) => (
                    <div key={k} className="spec-row">
                      <span className="sk">{l}</span>
                      <span className="sv" style={{ color: reportData.scores[k] >= 70 ? '#10b981' : reportData.scores[k] >= 55 ? '#f59e0b' : '#ef4444' }}>
                        {reportData.scores[k]}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MARKET TAB */}
            {activeTab === 'market' && (
              <div>
                <div className="card">
                  <h3>Competitive landscape</h3>
                  {reportData.competitors.map((c, i) => {
                    const color = c.threat === 'high' ? '#ef4444' : c.threat === 'med' ? '#f59e0b' : '#10b981'
                    const chipBg = c.threat === 'high' ? 'rgba(239,68,68,0.1)' : c.threat === 'med' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)'
                    return (
                      <div key={i} className="comp-row">
                        <div className="comp-name">{c.name}</div>
                        <div className="comp-bar-wrap">
                          <div className="comp-bar-track">
                            <div className="comp-bar-fill" style={{ width: compAnimated ? `${c.share}%` : '0%', background: color }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text2)', minWidth: 32 }}>{c.share}%</span>
                        <span className="comp-chip" style={{ background: chipBg, color, border: `1px solid ${color}22` }}>{c.threat}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="card">
                  <h3>Weaknesses to exploit</h3>
                  {reportData.competitors.slice(0, 3).map((c, i) => (
                    <div key={i} className="ins-row">
                      <div className="dot dot-p" />
                      <div className="ins-text"><strong>{c.name}:</strong> {c.weakness}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PERSONAS TAB */}
            {activeTab === 'personas' && (
              <div>
                {reportData.personas.map((p, i) => (
                  <div key={i} className="persona-card">
                    <div className="pname">{p.name}</div>
                    <span className="ptag">{p.tag}</span>
                    <div className="pdet">
                      <strong>Age:</strong> {p.age} &nbsp;|&nbsp; <strong>Channels:</strong> {p.channels}<br />
                      <strong>Pain:</strong> {p.pain}<br />
                      <strong>Trigger:</strong> {p.trigger}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CHANNELS TAB */}
            {activeTab === 'channels' && (
              <div className="card">
                <h3>Acquisition channels — ranked by fit</h3>
                {reportData.channels.map((c, i) => {
                  const isPrimary = c.fit === 'Primary' || c.fit === 'High'
                  return (
                    <div key={i} className="ch-row">
                      <div className="ch-name">{c.name}</div>
                      <div className="ch-cac">CAC: {c.cac}</div>
                      <div style={{ flex: 1, fontSize: 12, color: 'var(--text2)' }}>{c.note}</div>
                      <span className="fit-badge" style={{
                        background: isPrimary ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: isPrimary ? '#10b981' : '#f59e0b',
                      }}>{c.fit}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* LEGAL TAB */}
            {activeTab === 'legal' && (
              <div>
                <div className="card">
                  <h3>Legal & compliance checklist</h3>
                  {reportData.legal.map((l, i) => (
                    <div key={i} className="ins-row">
                      <div className="dot dot-r" />
                      <div className="ins-text">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3>Exit potential (Year 3)</h3>
                  {[
                    ['Projected revenue', reportData.exit.yr3Rev],
                    ['Valuation multiple', reportData.exit.multiple],
                    ['Estimated exit value', reportData.exit.yr3Val],
                    ['Likely buyers', reportData.exit.buyers],
                  ].map(([k, v], i) => (
                    <div key={i} className="spec-row">
                      <span className="sk">{k}</span>
                      <span className="sv" style={{ fontSize: k === 'Likely buyers' ? 11 : undefined }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BLUEPRINT TAB */}
            {activeTab === 'blueprint' && (
              <div>
                <div className="card">
                  <h3>Product / service spec</h3>
                  {reportData.spec.map(([k, v], i) => (
                    <div key={i} className="spec-row">
                      <span className="sk">{k}</span>
                      <span className="sv">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3>Launch roadmap</h3>
                  {reportData.roadmap.map(([k, v], i) => (
                    <div key={i} className="spec-row">
                      <span className="sk" style={{ color: 'var(--accent2)', fontWeight: 500 }}>{k}</span>
                      <span className="sv">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export bar */}
            <div className="export-bar">
              <button className="exp-btn primary" onClick={exportMarkdown}>Export report (.md)</button>
              <button className="share-btn" onClick={handleShare}>🔗 Share report</button>
              <button className="exp-btn" onClick={() => {
                const d = reportData
                const text = `BUSINESS REPORT\n\nIdea: ${currentIdea}\nDecision: ${d.decision}\n\n${d.decisionReason}\n\nScore: ${overall}/100\n\nMetrics:\n${d.metrics.map(m => `${m.l}: ${m.v}`).join('\n')}\n\nGaps:\n${d.gaps.map(g => `• ${g}`).join('\n')}\n\nRisks:\n${d.risks.map(r => `• ${r}`).join('\n')}`
                navigator.clipboard.writeText(text)
                showToast('📋 Copied to clipboard!')
              }}>Copy as text</button>
            </div>

            <button className="reset-btn" onClick={handleReset}>← Analyze a different idea</button>
          </>
        )}
      </div>

      <div id="toast" className="toast" />
    </>
  )
}
