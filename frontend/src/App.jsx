import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchPatients, fetchPatientSeries } from './api'
import StatusPanel from './components/StatusPanel'
import StatusTimeline from './components/StatusTimeline'
import ParameterCharts from './components/ParameterCharts'

const SLEEP_NUM = { sleep: 0, awake: 1, disturbed: 2 }

function formatAxisTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return ''
  }
}

function buildSeries(points) {
  const labels = points.map((p) => formatAxisTime(p.timestamp))
  const movement = points.map((p) => p.movement)
  const heartRate = points.map((p) => p.heartRate)
  const sleepNumeric = points.map((p) =>
    p.sleepState != null ? (SLEEP_NUM[p.sleepState] ?? 1) : null
  )
  const statuses = points.map((p) => p.status)
  const meta = points.map((p) => ({
    status: p.status,
    sleepState: p.sleepState,
    score: p.score,
    confidence: p.confidence,
  }))
  return { labels, movement, heartRate, sleepNumeric, statuses, meta }
}

export default function App() {
  const [patients, setPatients] = useState([])
  const [patientId, setPatientId] = useState('')
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPatients = useCallback(async () => {
    setError(null)
    try {
      const list = await fetchPatients()
      setPatients(list)
      setPatientId((prev) => prev || (list[0]?.id ?? ''))
    } catch (e) {
      setError(e.message || 'Could not load patients')
    }
  }, [])

  const loadData = useCallback(async () => {
    if (!patientId) {
      setPoints([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPatientSeries(patientId)
      setPoints(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Could not load series')
      setPoints([])
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    loadPatients()
  }, [loadPatients])

  useEffect(() => {
    loadData()
  }, [loadData])

  const latest = useMemo(() => {
    if (!points.length) return null
    return points[points.length - 1]
  }, [points])

  const series = useMemo(() => buildSeries(points), [points])

  return (
    <div className="app">
      <header className="header">
        <div className="header__brand">
          <span className="header__logo" aria-hidden />
          <div>
            <h1 className="header__title">Patient monitoring</h1>
            <p className="header__subtitle">
              Movement, heart rate, and sleep pattern over time — with live clinical state.
            </p>
          </div>
        </div>
        <div className="header__actions">
          <label className="field">
            <span className="field__label">Patient</span>
            <select
              className="field__select"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              disabled={!patients.length}
            >
              {!patients.length ? (
                <option value="">No patients</option>
              ) : (
                patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.age}y · {p.gender}
                  </option>
                ))
              )}
            </select>
          </label>
          <button type="button" className="btn btn--ghost" onClick={loadPatients}>
            Refresh list
          </button>
          <button type="button" className="btn" onClick={loadData} disabled={loading || !patientId}>
            {loading ? 'Loading…' : 'Reload data'}
          </button>
        </div>
      </header>

      {error ? (
        <div className="banner banner--error" role="alert">
          {error}
        </div>
      ) : null}

      <main className="main">
        <StatusPanel latest={latest} />
        <StatusTimeline points={points} />

        <section className="panel">
          <div className="panel__head">
            <h2 className="panel__title">Vital trends</h2>
            <p className="panel__desc">
              Time on the horizontal axis. Point colors match clinical state:{' '}
              <span className="key key--ok">normal</span>
              <span className="key key--warn">warning</span>
              <span className="key key--bad">abnormal</span>
            </p>
          </div>
          {points.length === 0 && !loading ? (
            <p className="empty">No samples for this patient yet. POST readings to `/api/data` to populate charts.</p>
          ) : (
            <ParameterCharts labels={series.labels} series={series} />
          )}
        </section>
      </main>

      <footer className="footer">
        <span>API: `/api/patients` · `/api/patient/:id/data`</span>
      </footer>
    </div>
  )
}
