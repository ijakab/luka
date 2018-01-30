'use strict'

const Env = use('Env')
const Logger = use('Logger')
const debug = Env.get('DEBUG', false)
const node_env = Env.get('NODE_ENV', 'development')

// const Locale = use('App/Models/Locale')

class FormatResponseMiddleware {

  async handle({response, antl, locale}, next) {
    // await everything downstream
    await next()
    // after everything is finished, handle response logic upstream

    return response.ok(antl.formatMessage('response.eta'));



    // get response data
    const existingResponse = response._lazyBody.content

    // format it to json if needed
    let data = (existingResponse && existingResponse.toJSON) ? existingResponse.toJSON() : (existingResponse || '')

    // fetch message as a string always
    let message = (data && typeof data === 'string') ? data : (typeof data === 'object' ? (data.message || data[0] && data[0].message) : 'Server response')

    // translate response if needed
    if (/^[\w/-]+\.[\w\./-]+$/.test(message)) {

      // get locale

      try {
        message = antl.forLocale(locale).formatMessage(message) // if params are needed for string format... use it in controller
      } catch (err) {
        // message translation is not existing in db or params were not sent correctly

        // save untranslated string to db...
        // let details = message.split('.')
        // Locale.create({
        //   locale,
        //   group: details.shift(),
        //   item: details.join('.'),
        //   text: message
        // }).catch(console.error)


        Logger.warning('Message "%s" is missing translation for locale %s!\n%s', message, locale.toUpperCase(), err.message)
      }
    }


    // create payload
    let payload = {
      data: (typeof data === 'string' || data instanceof Error) ? [] : (Array.isArray(data) ? data : (Object.keys(data).length ? [data] : [])),
      message: message
    }

    // show errors and options when developing
    if (node_env !== 'production' || debug) {
      payload.options = {}

      if (data instanceof Error) {
        payload.error = {details: data, stack: data.stack}
      }
    }


    response.send(payload)

  }
}


module.exports = FormatResponseMiddleware
