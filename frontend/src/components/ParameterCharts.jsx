import { Line } from 'react-chartjs-2'

const CHART_H = 220

function pointColors(statuses, fallback) {
  return (statuses || []).map((s) => {
    if (s === 'normal') return 'rgba(52, 211, 153, 0.95)'
    if (s === 'warning') return 'rgba(250, 204, 21, 0.95)'
    if (s === 'abnormal') return 'rgba(248, 113, 113, 0.95)'
    return fallback
  })
}

function baseScales() {
  return {
    x: {
      grid: { color: 'rgba(148, 163, 184, 0.12)' },
      ticks: {
        color: 'var(--chart-tick)',
        maxRotation: 45,
        minRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8,
      },
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.12)' },
      ticks: { color: 'var(--chart-tick)' },
    },
  }
}

function buildOptions(title, meta) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        color: 'var(--chart-title)',
        font: { size: 14, weight: '600', family: 'inherit' },
        padding: { bottom: 8 },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        titleColor: '#e2e8f0',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(148, 163, 184, 0.25)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          afterBody(items) {
            const i = items[0]?.dataIndex
            if (i == null || !meta?.[i]) return ''
            const raw = meta[i]
            const lines = []
            if (raw.status) lines.push(`State: ${raw.status}`)
            if (raw.sleepState) lines.push(`Sleep: ${raw.sleepState}`)
            if (raw.score != null) lines.push(`Score: ${raw.score}`)
            if (raw.confidence != null) lines.push(`Confidence: ${Math.round(raw.confidence * 100)}%`)
            return lines
          },
        },
      },
    },
    scales: baseScales(),
  }
}

function sleepYScale() {
  const sleepLabels = ['Sleep', 'Awake', 'Disturbed']
  return {
    ...baseScales(),
    y: {
      ...baseScales().y,
      min: -0.25,
      max: 2.25,
      ticks: {
        ...baseScales().y.ticks,
        stepSize: 1,
        callback(value) {
          const v = Number(value)
          if (v >= 0 && v <= 2 && Number.isInteger(v)) return sleepLabels[v]
          return ''
        },
      },
    },
  }
}

export default function ParameterCharts({ labels, series }) {
  const { movement, heartRate, sleepNumeric, statuses, meta } = series

  const movementData = {
    labels,
    datasets: [
      {
        label: 'Movement',
        data: movement,
        borderColor: 'rgba(56, 189, 248, 0.9)',
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart
          if (!chartArea) return 'rgba(56, 189, 248, 0.15)'
          const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          g.addColorStop(0, 'rgba(56, 189, 248, 0.35)')
          g.addColorStop(1, 'rgba(56, 189, 248, 0.02)')
          return g
        },
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: pointColors(statuses, 'rgba(56, 189, 248, 0.9)'),
        pointBorderColor: 'rgba(15, 23, 42, 0.85)',
        pointBorderWidth: 1.5,
        borderWidth: 2,
      },
    ],
  }

  const hrData = {
    labels,
    datasets: [
      {
        label: 'Heart rate',
        data: heartRate,
        borderColor: 'rgba(244, 114, 182, 0.95)',
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart
          if (!chartArea) return 'rgba(244, 114, 182, 0.12)'
          const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          g.addColorStop(0, 'rgba(244, 114, 182, 0.3)')
          g.addColorStop(1, 'rgba(244, 114, 182, 0.02)')
          return g
        },
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: pointColors(statuses, 'rgba(244, 114, 182, 0.95)'),
        pointBorderColor: 'rgba(15, 23, 42, 0.85)',
        pointBorderWidth: 1.5,
        borderWidth: 2,
      },
    ],
  }

  const sleepData = {
    labels,
    datasets: [
      {
        label: 'Sleep pattern',
        data: sleepNumeric,
        stepped: true,
        borderColor: 'rgba(167, 139, 250, 0.95)',
        backgroundColor: 'rgba(167, 139, 250, 0.12)',
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: pointColors(statuses, 'rgba(167, 139, 250, 0.95)'),
        pointBorderColor: 'rgba(15, 23, 42, 0.85)',
        pointBorderWidth: 1.5,
        borderWidth: 2,
      },
    ],
  }

  const sleepOptions = {
    ...buildOptions('Sleep pattern (ordinal: sleep → awake → disturbed)', meta),
    scales: sleepYScale(),
  }

  return (
    <div className="charts-grid">
      <div className="chart-wrap" style={{ height: CHART_H }}>
        <Line data={movementData} options={buildOptions('Movement intensity', meta)} />
      </div>
      <div className="chart-wrap" style={{ height: CHART_H }}>
        <Line data={hrData} options={buildOptions('Heart rate (bpm)', meta)} />
      </div>
      <div className="chart-wrap" style={{ height: CHART_H }}>
        <Line data={sleepData} options={sleepOptions} />
      </div>
    </div>
  )
}
