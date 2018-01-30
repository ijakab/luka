'use strict'

const Env = use('Env')
const Logger = use('Logger')
const debug = Env.get('DEBUG', false)
const node_env = Env.get('NODE_ENV', 'development')
const Antl = use('Antl')

const Locale = use('App/Models/Locale')
const defaultLocale = Env.get('APP_LOCALE', 'en')

module.exports = async function (existingResponse, locale = defaultLocale) {

  // format it to json if needed
  let data = (existingResponse && existingResponse.toJSON) ? existingResponse.toJSON() : (existingResponse || '')

  // fetch message as a string always
  let message = (data && typeof data === 'string') ? data : (typeof data === 'object' ? (data.message || data[0] && data[0].message) : 'Server response')

  // translate response if needed
  if (/^[\w/-]+\.[\w\./-]+$/.test(message)) {

    if (!/^[a-z]{2}$/.test(locale)) locale = defaultLocale

    try {
      message = Antl.forLocale(locale).formatMessage(message) // if params are needed for string format... use it in controller
    } catch (err) {
      // message translation is not existing in db or params were not sent correctly
      if(node_env !== 'testing') Logger.warning('Message "%s" is missing translation for locale %s!\n%s', message, locale.toUpperCase(), err.message)

      // save untranslated string to db...
      let details = message.split('.')

      try {
        await Locale.create({
          locale,
          group: details.shift(),
          item: details.join('.'),
          text: message
        })

        // call bootLoader to refresh localizations
        await Antl.bootLoader()

      } catch (err) {
        Logger.error(err) // todo make helper for handling async errors in db...
      }

    }
  }

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
