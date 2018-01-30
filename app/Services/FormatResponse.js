'use strict'

const Env = use('Env')
const debug = Env.get('DEBUG', false)
const node_env = Env.get('NODE_ENV', 'development')

const translateService = use('App/Services/Translate')


module.exports = async function (existingResponse, locale) {

  // format it to json if needed
  let data = (existingResponse && existingResponse.toJSON) ? existingResponse.toJSON() : (existingResponse || '')
  let message

  // check if we are dealing with validation.messages()
  if (Array.isArray(data) && data.length && data[0].field && data[0].validation) {
    message = `validation.${data[0].field}.${data[0].validation}`
    data = [] // reset data to empty response
  } else {
    // fetch message as a string always
    message = (data && typeof data === 'string') ? data : (typeof data === 'object' ? (data.message || data[0] && data[0].message) : 'Server response')
  }

  // translate message if needed
  message = translateService(locale, message)

  // create payload
  let payload = {
    data: (typeof data === 'string' || data instanceof Error) ? [] : (Array.isArray(data) ? data : (Object.keys(data).length ? [data] : [])),
    message: message
  }

  // show errors when developing
  if (node_env !== 'production' || debug) {

    if (existingResponse instanceof Error) {
      payload.error = {details: existingResponse, stack: existingResponse.stack}
    }
  }

  // finally return formatted payload
  return payload
}
