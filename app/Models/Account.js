'use strict'

const Model = use('Model')

class Account extends Model {

  static boot() {
    super.boot()

    this.addTrait('CastDate')
    // run before create and before update...
    this.addHook('beforeSave', 'Account.hashPassword')
  }

  user() {
    return this.belongsTo('App/Models/User')
  }

  static get hidden () {
    return ['password']
  }

}

module.exports = Account
