'use strict'

const Model = use('Model')
const {validate, sanitize} = use('Validator')
const {pick} = use('lodash')

class BaseModel extends Model {

    // --- VALIDATION
    static get rules() {
        return {}
    }

    static get sanitize() {
        return {}
    }

    static get fields() {
        return []
    }

    static get editable() {
        return []
    }

    // --- CONFIGURATION
    static boot() {
        super.boot()
        this.addTrait('CastDate')
    }

    // --- CUSTOM
    static getAllowedParams(params, overrideEditable) {
        return pick(overrideEditable || this.editable)
    }

    static sanitizeParams(params, overrideSanirization) {
        return sanitize(params, overrideSanirization || this.sanitize)
    }

    static async validateParams(params, overrideRules) {
        return validate(params, overrideRules || this.rules)
    }

}

module.exports = BaseModel
