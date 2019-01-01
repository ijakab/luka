'use strict'

const Antl = use('Antl')
const Env = use('Env')
const Logger = use('Logger')

const Locale = use('App/Models/Locale')

const defaultLocale = Env.get('APP_LOCALE', 'en')

module.exports = function (locale = '', message = '', options) {

    // check if translation is needed
    if (!/^[\w/-]+\.[\w\./-]+$/.test(message)) return message

    // check if right locale is provided and fallback to default
    if (!/^[a-z]{2}$/.test(locale)) locale = defaultLocale

    try {
        message = Antl.forLocale(locale).formatMessage(message, options)
    } catch (err) {

        handleMissingTranslation(err, locale, message)

        // try to return default translation, so we don't return system string if not needed
        if (locale !== defaultLocale) {
            try {
                message = Antl.forLocale(defaultLocale).formatMessage(message, options)
            } catch (err) {
                handleMissingTranslation(err, defaultLocale, message)
            }
        }
    }

    // return translated string
    return message

}


function handleMissingTranslation(err, locale, message) {

    // message translation is not existing in db or params were not sent correctly
    Logger.warning('Message "%s" is missing translation for locale %s!\n%s', message, locale.toUpperCase(), err.message)

    // save untranslated string to db...
    let details = message.split('.')

    try {
        (async () => {
            await Locale.create({
                locale,
                group: details.shift(),
                item: details.join('.'),
                text: message
            })

            // call bootLoader to refresh localizations
            await Antl.bootLoader()
        })()
    } catch (err) {

        // TODO Read NOTE below
        // ****************************************** NOTE ******************************************
        // This error will not block user... If you think this error is important, for example, for
        // admin... Please implement some kind of database model to keep track of errors like these
        // ****************************************** **** ******************************************
        Logger.error('TRANSLATE SERVICE - ', err)
    }
}
