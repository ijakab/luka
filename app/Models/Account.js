'use strict'

const Model = use('Model')

class Account extends Model {
  static boot() {
    super.boot()

    this.addHook('beforeCreate', 'Account.hashPassword')
  }

  user() {
    return this.belongsTo('App/Models/User')
  }

  static get hidden () {
    return ['password']
  }
}

module.exports = Account
