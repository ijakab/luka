'use strict'

const Schema = use('Schema')

class AccountSchema extends Schema {
  up() {
    this.create('accounts', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.enum('type', ['main', 'facebook', 'google', 'linkedIn'])
      table.string('email', 254).notNullable().unique()

      // social id and password are not strictly required because one excludes another
      table.string('socialId', 60)
      table.string('password', 60)
      table.timestamps()
    })
  }

  down() {
    this.drop('accounts')
  }
}

module.exports = AccountSchema