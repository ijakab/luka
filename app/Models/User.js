'use strict'

const Model = use('Model')

class User extends Model {
  accounts() {
    return this.hasMany('App/Models/Account')
  }

  tokens() {
    return this.hasMany('App/Models/Token')
  }
}

module.exports = User
