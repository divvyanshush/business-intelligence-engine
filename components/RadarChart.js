import { useEffect, useRef } from 'react'

export default function RadarChart({ scores }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !scores) return

    // Dynamically import Chart.js to avoid SSR issues
    import('chart.js').then(({ Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend }) => {
      Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

      if (chartRef.current) {
        chartRef.current.destroy()
      }

      chartRef.current = new Chart(canvasRef.current, {
        type: 'radar',
        data: {
          labels: ['Market size', 'Differentiation', 'Margin quality', 'Capital efficiency', 'Exec. complexity', 'Scalability'],
          datasets: [{
            label: 'Score',
            data: Object.values(scores),
            backgroundColor: 'rgba(108,99,255,0.15)',
            borderColor: '#6c63ff',
            borderWidth: 2,
            pointBackgroundColor: '#6c63ff',
            pointBorderColor: '#a78bfa',
            pointRadius: 5,
            pointHoverRadius: 7,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1c1c28',
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              titleColor: '#f0efe8',
              bodyColor: '#8b8a9b',
            }
          },
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: {
                stepSize: 25,
                font: { size: 9 },
                color: '#4a4a5e',
                backdropColor: 'transparent',
              },
              grid: { color: 'rgba(255,255,255,0.06)' },
              angleLines: { color: 'rgba(255,255,255,0.06)' },
              pointLabels: {
                font: { size: 11, family: "'DM Sans', sans-serif" },
                color: '#8b8a9b',
              },
            }
          },
          animation: {
            duration: 1000,
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
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <canvas ref={canvasRef} style={{ maxWidth: 320, maxHeight: 320 }} />
    </div>
  )
}
