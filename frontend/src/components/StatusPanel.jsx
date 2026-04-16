function statusLedClass(status) {
  if (status === 'normal') return 'led led--normal'
  if (status === 'warning') return 'led led--warning'
  if (status === 'abnormal') return 'led led--abnormal'
  return 'led led--unknown'
}

function warningLampClass(status) {
  if (status === 'warning') return 'led led--warning led--pulse'
  if (status === 'abnormal') return 'led led--abnormal'
  if (status === 'normal') return 'led led--normal led--dim'
  return 'led led--unknown'
}

function sleepChipClass(sleepState) {
  if (sleepState === 'sleep') return 'chip chip--sleep'
  if (sleepState === 'awake') return 'chip chip--awake'
  if (sleepState === 'disturbed') return 'chip chip--disturbed'
  return 'chip chip--unknown'
}

function formatTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return '—'
  }
}

export default function StatusPanel({ latest }) {
  const status = latest?.status ?? null
  const sleepState = latest?.sleepState ?? null
  const score = latest?.score
  const confidence = latest?.confidence
  const alert = latest?.alert
  const ts = latest?.timestamp

  return (
    <section className="status-panel" aria-label="Live status">
      <div className="status-panel__grid">
        <article className="status-card">
          <h3 className="status-card__title">Clinical state</h3>
          <p className="status-card__hint">Normal · warning · abnormal</p>
          <div className="status-card__body">
            <span className={statusLedClass(status)} role="img" aria-label={status || 'unknown'} />
            <div>
              <p className="status-card__value">
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'No data'}
              </p>
              <p className="status-card__meta">
                Traffic light reflects the latest processed reading.
              </p>
            </div>
          </div>
        </article>

        <article className="status-card">
          <h3 className="status-card__title">Warning band</h3>
          <p className="status-card__hint">Elevated risk before critical</p>
          <div className="status-card__body">
            <span className={warningLampClass(status)} role="img" aria-label="warning level" />
            <div>
              <p className="status-card__value">
                {status === 'warning'
                  ? 'Warning — review trends'
                  : status === 'abnormal'
                    ? 'Critical attention'
                    : status === 'normal'
                      ? 'No active warning'
                      : '—'}
              </p>
              <p className="status-card__meta">
                Score {score != null ? score : '—'} · Alert {alert ? 'yes' : 'no'}
              </p>
            </div>
          </div>
        </article>

        <article className="status-card">
          <h3 className="status-card__title">Sleep state</h3>
          <p className="status-card__hint">Sleep · awake · disturbed</p>
          <div className="status-card__body status-card__body--sleep">
            <span className={sleepChipClass(sleepState)}>{sleepState ?? '—'}</span>
            <div>
              <p className="status-card__meta">
                Confidence {confidence != null ? `${Math.round(confidence * 100)}%` : '—'}
              </p>
              <p className="status-card__meta">Last sample {formatTime(ts)}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
