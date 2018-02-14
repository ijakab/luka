'use strict'

const Model = use('Model')

class Locale extends Model {

    // --- CONFIGURATION
    static boot() {
        super.boot()
        this.addTrait('CastDate')
    }

}

module.exports = Locale
