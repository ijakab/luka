'use strict'

const Model = use('Model')
const addStandardTraits = use('App/Helpers/AddStandardTraits')

class Account extends Model {

    static boot() {
        super.boot()
        addStandardTraits(this)
        // run before create and before update...
        this.addHook('beforeSave', 'Account.hashPassword')
    }
    
    static get Serializer() {
        return 'App/Models/Serializers/Base'
    }
    
    static get _AttributeConfig() {
        return 'App/Models/Attributes/Account'
    }
    
    user() {
        return this.belongsTo('App/Models/User')
    }


    static get hidden() {
        return ['password']
    }

}

module.exports = Account
