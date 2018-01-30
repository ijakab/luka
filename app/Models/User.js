'use strict'

const Model = use('Model')

class User extends Model {
  accounts() {
    return this.hasMany('App/Models/Account')
  }

  tokens() {
    return this.hasMany('App/Models/Token')
  }

  static get dates() {
    return super.dates.concat(['dob'])
  }

}

module.exports = User
