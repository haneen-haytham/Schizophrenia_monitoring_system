function barColor(status) {
  if (status === 'normal') return 'var(--ok)'
  if (status === 'warning') return 'var(--warn)'
  if (status === 'abnormal') return 'var(--bad)'
  return 'var(--muted-2)'
}

export default function StatusTimeline({ points }) {
  if (!points?.length) {
    return (
      <div className="timeline timeline--empty">
        <span>No timeline — ingest readings to see status over time.</span>
      </div>
    )
  }

  return (
    <div className="timeline" role="img" aria-label="Status over time">
      <div className="timeline__track">
        {points.map((p, i) => (
          <div
            key={`${p.timestamp}-${i}`}
            className="timeline__seg"
            style={{ background: barColor(p.status) }}
            title={`${p.status ?? '?'} @ ${p.timestamp ? new Date(p.timestamp).toLocaleString() : ''}`}
          />
        ))}
      </div>
      <div className="timeline__labels">
        <span>Older</span>
        <span>Newer</span>
      </div>
    </div>
  )
}
