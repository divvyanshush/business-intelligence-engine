import { useEffect, useRef } from 'react'

export default function RadarChart({ scores }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !scores) return

    const labels = ['Market Size', 'Differentiation', 'Margin Quality', 'Capital Efficiency', 'Exec. Complexity', 'Scalability']
    const keys = ['marketSize', 'differentiation', 'marginQuality', 'capitalEfficiency', 'executionComplexity', 'scalability']
    const values = keys.map(k => scores[k] ?? 0)

    import('chart.js').then(({ Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip }) => {
      Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }

      chartRef.current = new Chart(canvasRef.current, {
        type: 'radar',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            borderColor: '#6366f1',
            borderWidth: 1.5,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#6366f1',
            pointRadius: 4,
            pointHoverRadius: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#111111',
              borderColor: '#1e1e1e',
              borderWidth: 1,
              titleColor: '#ffffff',
              bodyColor: '#888888',
              padding: 10,
            }
          },
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: {
                stepSize: 25,
                font: { size: 9 },
                color: '#444444',
                backdropColor: 'transparent',
              },
              grid: { color: 'rgba(255,255,255,0.05)' },
              angleLines: { color: 'rgba(255,255,255,0.05)' },
              pointLabels: {
                font: { size: 11, family: "'DM Sans', sans-serif" },
                color: '#888888',
              },
            }
          },
          animation: {
            duration: 800,
            easing: 'easeInOutQuart',
          }
        }
      })
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [scores])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '16px 0' }}>
      <canvas ref={canvasRef} style={{ width: '300px', height: '300px', maxWidth: '300px', maxHeight: '300px' }} />
    </div>
  )
}
