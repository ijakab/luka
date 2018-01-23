'use strict'

const Schema = use('Schema')

class UserSchema extends Schema {
  up() {
    this.create('users', table => {
      table.increments()
      table.string('username', 80).notNullable().unique()

      // user can have multiple emails (ex. facebook account and google account have different email for login)
      // but, there can be only one true email :)
      table.string('primaryEmail', 254).notNullable().unique()

      table.string('fullName', 80).notNullable()
      table.string('avatar', 80)
      table.timestamps()
    })
  }

  down() {
    this.drop('users')
  }
}

module.exports = UserSchema
