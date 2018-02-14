const {hooks} = require('@adonisjs/ignitor')

hooks.after.providersBooted(() => {
    const View = use('View')
    const translate = use('App/Helpers/Translate')

    // expose translate function to views also...
    View.global('translate', function (message, options) {
        return translate(this.resolve('locale'), message, options)
    })
})
