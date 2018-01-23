'use strict'

const Model = use('Model')

class User extends Model {
  accounts() {
    return this.hasMany('App/Models/Account')
  }

  tokens() {
    return this.hasMany('App/Models/Token')
  }

  static get hidden() {
    return ['primaryEmail']
  }

  static get dates() {
    return super.dates.concat(['dob'])
  }

  static get computed() {
    return ['email']
  }

  getEmail({primaryEmail}) {
    return primaryEmail
  }
}

module.exports = User
