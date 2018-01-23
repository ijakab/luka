'use strict'

const Model = use('Model')

class Account extends Model {
  static boot() {
    super.boot()

    this.addHook('beforeCreate', 'Account.hashPassword')
  }

  static get hidden () {
    return ['password']
  }
}

module.exports = Account
