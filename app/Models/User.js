'use strict'

const Model = use('Model')

class User extends Model {
  accounts() {
    return this.hasMany('App/Models/Account')
  }

  tokens() {
    return this.hasMany('App/Models/Token')
  }

  async getMainAccount() {
    return await this.accounts().where('type', 'main').first()

  }

  static get dates() {
    return super.dates.concat(['dob'])
  }

}

module.exports = User
