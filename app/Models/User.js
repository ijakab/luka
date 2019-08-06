'use strict'

const BaseModel = use('App/Models/BaseModel')

class User extends BaseModel {

    // --- CONFIGURATION
    static boot() {
        super.boot()
        this.addTrait('Paginable')
        this.addTrait('IdOrSlug', {slug: 'username'})
    }

    static get dates() {
        return super.dates.concat(['dob', 'terms_accepted'])
    }

    static get editable() {
        return [
            'firstname',
            'lastname',
            'avatar',
            'dob'
        ]
    }

    static get fields() {
        return [
            ...this.editable,
            'terms_accepted',
            'terms_ip',
            'username',
            'email',
            'language'
        ]
    }

    // --- VALIDATION & SANITIZATION
    static get rules() {
        return {
            firstname: 'string|max:50',
            lastname: 'string|max:80',
            dob: 'date',
            terms_accepted: 'required|date',
            terms_ip: 'ip',
            // allow alpha numeric + _- from 4 to 20 chars (from 4 because minimum word length in mysql full text search indexes is 4 characters)
            // also don't allow only numerical username, because slug will not work (it will search for id on or statement because of mysql issue)
            // email and username are not under unique:users rule because of auto merge account rule (handled on controller level)
            username: 'required|notNumber|not_in:admin,super|min:4|max:20|regex:^[0-9a-zA-Z-_]+$',
            email: 'required|email',
            language: 'string|min:2|max:2'
        }
    }

    // user model is specific... it has registration process too, handled by Account model
    static get registrationRules() {
        return {
            ...this.rules,
            password: 'required|confirmed|min:6'
        }
    }

    static get sanitize() {
        return {
            email: 'normalize_email'
        }
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
