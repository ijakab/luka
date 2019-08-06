'use strict'

const BaseModel = use('App/Models/BaseModel')

class Account extends BaseModel {

    static boot() {
        super.boot()
        // run before create and before update...
        this.addHook('beforeSave', 'Account.hashPassword')
    }

    user() {
        return this.belongsTo('App/Models/User')
    }

    static get hidden() {
        return ['password']
    }

}

module.exports = Account
