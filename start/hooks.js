const {hooks} = require('@adonisjs/ignitor')

hooks.after.providersBooted(() => {
    const View = use('View')
    const translate = use('App/Helpers/Translate')

    const {castArray} = use('lodash')
    const Database = use('Database')
    const Validator = use('Validator')

    // expose translate function to views also...
    View.global('translate', function (message, options) {
        return translate(this.resolve('locale'), message, options)
    })

    Validator.sanitizor.phoneStandardE164 = (val) => {
        if (!val) return ''
        val = typeof val === 'string' ? val : val.toString()

        // 00 385 98 1337 --> +385981337
        return val.trim().replace(/^00/, '+').replace(/ /g, '')
    }

    Validator.extend('exists', async (data, field, message, args, get) => {
        const value = get(data, field)

        // skip if no ids
        if (!value) return

        const resourceIds = castArray(value)

        const [table, column] = args
        const rows = await Database.table(table).whereIn(column, resourceIds)

        if (rows.length !== resourceIds.length) throw message
    })

    Validator.extend('customUrl', async (data, field, message, args, get) => {
        const value = get(data, field)

        // empty string is also allowed url value (but not bool false or 0)...
        if (value === undefined || value === null || value === '') return

        const urlRegex = /https?:\/\/(www\.)?([-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,63}|localhost)\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/i
        if (!urlRegex.test(value)) throw message
    })

    // create for slugs... especially if you are querying by slug
    Validator.extend('notNumber', async (data, field, message, args, get) => {
        const value = get(data, field)

        if (!value) return

        if (Number(value)) throw(message)
    })
})
