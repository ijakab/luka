'use strict'

const Model = use('Model')

class User extends Model {

    // --- VALIDATION
    static get rules() {
        return {
            username: 'string|min:4|max:20|regex:^[0-9a-zA-Z-_]+$', // allow alpha numeric + _- from 4 to 20 chars
            password: 'min:6',
            language: 'string|min:2|max:2'
        }
    }

    // --- CONFIGURATION
    static boot() {
        super.boot()
        this.addTrait('CastDate')
    }

    static get dates() {
        return super.dates.concat(['dob', 'terms_accepted'])
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
