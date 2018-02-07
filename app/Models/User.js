'use strict'

const Model = use('Model')

class User extends Model {

  // --- RELATIONS
  accounts() {
    return this.hasMany('App/Models/Account')
  }

  tokens() {
    return this.hasMany('App/Models/Token')
  }

  // --- CONFIGURATION
  static get dates() {
    return super.dates.concat(['dob'])
  }

  // --- CUSTOM
  async fetchMainAccount() {
    return await this.accounts().where('type', 'main').first()
  }

}

module.exports = User
