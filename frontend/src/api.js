const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.DEV ? '' : 'http://localhost:5000')

function url(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}

export async function fetchPatients() {
  const res = await fetch(url('/api/patients'))
  if (!res.ok) throw new Error('Failed to load patients')
  const body = await res.json()
  return body.patients ?? []
}

export async function fetchPatientSeries(patientId) {
  const res = await fetch(url(`/api/patient/${patientId}/data`))
  if (!res.ok) throw new Error('Failed to load patient data')
  const body = await res.json()
  return body.data ?? []
}
