const Env = use('Env')

const debug = Env.get('DEBUG', false)
const node_env = Env.get('NODE_ENV', 'development')

module.exports = function formatResponse(data = '', options = {}) {

  data = data.toJSON ? data.toJSON() : data
  options.defaultMsg = options.defaultMsg || 'Server response'

  let payload = {
    data: (typeof data === 'string' || data instanceof Error) ? [] : (Array.isArray(data) ? data : (Object.keys(data).length ? [data] : [])),
    message: (data && typeof data === 'string') ? data : (typeof data === 'object' ? (data.message || data[0] && data[0].message) : options.defaultMsg)
  }
  // show errors and options when developing
  if (node_env !== 'production' || debug) {
    payload.options = options
    if (data instanceof Error) {
      payload.error = {details: data, stack: data.stack}
    }
  }

  return payload
}
