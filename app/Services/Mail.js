const Mail = use('Mail')
const Env = use('Env')
const Logger = use('Logger')

const User = use('App/Models/User')
const translate = use('App/Helpers/Translate')

const {castArray, map, first, groupBy} = use('lodash')

const DEFAULT_LOCALE = Env.get('APP_LOCALE', 'en')
const NO_REPLY_EMAIL = Env.get('MAIL_NO_REPLY', 'Admin <no-reply@starter.com>')

module.exports = {

    // simple mail function... will be used most of the times...
    // accepts single email or id, or array of ids or emails... preferably email so we can skip one query...
    send: async function (template, to, data = {}, from = null) {

        // ensure array
        to = castArray(to)

        // check if to is array of emails or ids... if ids, we need to map ids to emails
        if (!/@/.test(first(to))) {
            to = await User.query().select('email').whereIn('id', to).fetch()

            to = map(to.rows, 'email')
        }

        if (!data.locale) data.locale = DEFAULT_LOCALE

        // get subject from data, or try to get subject from translate service
        const subject = translate(data.locale, data.subject || `${template}.subject`)

        // send email
        try {
            await Mail.send(`${template}.${data.locale}`, data, (message) => {
                message
                    .to(to)
                    .from(from || NO_REPLY_EMAIL)
                    .subject(subject)
            })
        } catch (err) {
            // TODO Read NOTE below
            // ****************************************** NOTE ******************************************
            // Services like this often happen in background. Called by events or just called without
            // await keyword that would wait for it to finish. Because of that reason it's a little bit
            // harder to notify user about error that could have happened.
            //
            // Think about async events error handling in your app and adapt this code accordingly!
            // ****************************************** **** ******************************************
            Logger.error('MAIL SERVICE - ', err)
        }


    },


    // email sending function that takes care of users language... use this if sending mails in a bulk and you want
    // every user to get email on his language.
    // uses this.send simple email function under the hood
    sendTranslated: async function (template, to, data, from = null) {

        // ensure array
        to = castArray(to)

        // get users depending on to array... if email query by email, if id then go by id :)
        let users = await User.query().whereIn(/@/.test(first(to)) ? 'email' : 'id', to).fetch()


        // separate users by languages
        users = groupBy(users.rows, 'language')

        // for each language, change locale, and send
        for (let lang in users) {

            let emailsToSend = map(users[lang], 'email')
            let newData = Object.assign(data, {locale: lang})

            await this.send(template, emailsToSend, newData, from)
        }


    }

}

