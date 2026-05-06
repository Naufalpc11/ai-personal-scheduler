const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

function buildHeaders(token, hasBody) {
  const headers = {}
  if (hasBody) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export async function apiRequest(path, { method = 'GET', token, body } = {}) {
  const hasBody = body !== undefined
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: buildHeaders(token, hasBody),
    body: hasBody ? JSON.stringify(body) : undefined
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const message = payload?.message || 'Request failed'
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}
