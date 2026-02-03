// Simple navigation helper
export function navigate(path) {
  window.location.hash = path
}

export function getCurrentPath() {
  const hash = window.location.hash
  // Remove the hash and any query parameters
  const path = hash.split('?')[0].slice(1) || '/'
  return path
}

export function getHashParams() {
  const hash = window.location.hash
  const queryString = hash.split('?')[1]
  if (!queryString) return {}

  const params = {}
  queryString.split('&').forEach((param) => {
    const [key, value] = param.split('=')
    params[key] = decodeURIComponent(value)
  })
  return params
}
