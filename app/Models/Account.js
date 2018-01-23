'use strict'

const Model = use('Model')

class Account extends Model {
  static boot() {
    super.boot()

    this.addHook('beforeCreate', 'Account.hashPassword')
  }
}

module.exports = Account
