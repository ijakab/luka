const Mail = use('Mail')
const Env = use('Env')
const Antl = use('Antl')
const Logger = use('Logger')

const defaultLocale = Env.get('APP_LOCALE', 'en')

const User = use('App/Models/User')
const translateService = use('App/Services/Translate')

const _ = use('lodash')

const NO_REPLY_EMAIL = Env.get('SEND_EMAIL_FROM', 'Admin <no-reply@starter.com>')

module.exports = {

  // simple mail function... will be used most of the times...
  // accepts single email or id, or array of ids or emails... preferably email so we can skip one query...
  send: async function (template, to, data) {

    // ensure array
    to = _.castArray(to)

    // check if to is array of emails or ids... if ids, we need to map ids to emails
    if (!/@/.test(_.first(to))) {
      to = await User.query().select('email').whereIn('id', to).fetch()

      to = _.map(to.toJSON(), 'email')
    }

    // get subject from data, or try to get subject from translate service
    const subject = translateService(data.locale || defaultLocale, data.subject || `${template}.subject`)

    // send email
    try {
      await Mail.send(template, data, (message) => {
        message
          .to(to)
          .from(NO_REPLY_EMAIL)
          .subject(subject)
      })
    } catch (err) {
      Logger.error(err) // todo make helper for handling async errors in db...
    }


  },


  // email sending function that takes care of users language... use this if sending mails in a bulk and you want
  // every user to get email on his language.
  // uses this.send simple email function under the hood
  sendTranslated: async function (template, to, data) {

    // ensure array
    to = _.castArray(to)

    // get users depending on to array... if email query by email, if id then go by id :)
    let users = await User.query().whereIn(/@/.test(_.first(to)) ? 'email' : 'id', to).fetch()


    // separate users by languages
    users = _.groupBy(users.toJSON(), 'language')

    // for each language, change locale, and send
    for (let lang in users) {

      let emailsToSend = _.map(users[lang], 'email')
      let newData = Object.assign(data, {locale: lang})

      await this.send(template, emailsToSend, newData)
    }


  }

}

