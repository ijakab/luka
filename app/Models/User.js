'use strict'

const Model = use('Model')

class User extends Model {

    // --- CONFIGURATION
    static boot() {
        super.boot()
        this.addTrait('BaseModel')
        this.addTrait('CastDate')
        this.addTrait('Paginable')
        this.addTrait('IdOrSlug', {slug: 'username'})
    }

    static get Serializer() {
        return 'App/Models/Serializers/User'
    }


    static get dates() {
        return super.dates.concat(['dob', 'terms_accepted'])
    }

    static get editable() {
        return [
            'firstname',
            'lastname',
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
            'language',
            'role'
        ]
    }

    // --- VALIDATION & SANITIZATION
    static get sanitize() {
        return {
            email: 'normalize_email'
        }
    }

    static get rules() {
        return {
            firstname: 'required|string|max:50',
            lastname: 'string|max:80',
            dob: 'date',
            // password is not required on update, but it is required on registration
            password: 'confirmed|min:6',
            language: 'string|min:2|max:2'
        }
    }

    // user model is specific... it has registration process too, handled by Account model
    static get registrationRules() {
        return {
            ...this.rules,
            terms_accepted: 'required|date',
            terms_ip: 'ip',
            // allow alpha numeric + _- from 4 to 20 chars (from 4 because minimum word length in mysql full text search indexes is 4 characters)
            // also don't allow only numerical username, because slug will not work (it will search for id on or statement because of mysql issue)
            // email and username are not under unique:users rule because of auto merge account rule (handled on controller level)
            username: 'required|notNumber|min:4|max:20|regex:^[0-9a-zA-Z-_]+$',
            email: 'required|email',
            password: `required|${this.rules.password}`, // we added required logic on registration
            role: 'required|in:user,superAdmin'
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
