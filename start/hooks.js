const {hooks} = require('@adonisjs/ignitor')

hooks.after.providersBooted(() => {
  const View = use('View')
  const translateService = use('App/Services/Translate')

  // expose translate function to views also...
  View.global('translate', function (message, options) {
    return translateService(this.resolve('locale'), message, options)
  })
})
