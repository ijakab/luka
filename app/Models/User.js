'use strict'

const Model = use('Model')

class User extends Model {

  // --- CONFIGURATION
  static boot() {
    super.boot()
    this.addTrait('CastDate')
  }

  static get dates() {
    return super.dates.concat(['dob'])
  }

  // --- RELATIONS
  accounts() {
    return this.hasMany('App/Models/Account')
  }

  tokens() {
    return this.hasMany('App/Models/Token')
  }

  // --- CUSTOM
  async fetchMainAccount() {
    return await this.accounts().where('type', 'main').first()
  }

}

module.exports = User
