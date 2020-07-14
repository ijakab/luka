'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const addStandardTraits = use('App/Helpers/AddStandardTraits')

class Playlist extends Model {
    static boot() {
        super.boot()
        addStandardTraits(this)
    }
    
    static get Serializer() {
        return 'App/Models/Serializers/Base'
    }
    
    static get _AttributeConfig() {
        return 'App/Models/Attributes/Playlist'
    }
    
    // --- RELATIONS
    playlist() {
        return this.belongsToMany('App/Models/Song')
    }
    
}

module.exports = Playlist
