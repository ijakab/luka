'use strict'

const Schema = use('Schema')

const Env = use('Env')


class UserSchema extends Schema {
    up() {
        this.create('users', table => {
            table.increments()
            table.string('username', 20).notNullable().unique()

            // user can have multiple emails (ex. facebook account and google account have different email for login)
            // but, there can be only one true email :) ...other are inside account model
            table.string('email', 254).notNullable().unique()

            table.string('firstname', 50).notNullable()
            table.string('lastname', 80)
            table.string('language', 2).defaultTo(Env.get('APP_LOCALE', 'en')).notNullable()
            table.date('dob')
            table.string('avatar', 80)
            table.timestamps()
        })
    }

    down() {
        this.drop('users')
    }
}

module.exports = UserSchema
