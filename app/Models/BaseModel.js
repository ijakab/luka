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

    // --- CUSTOM
    // gets and sanitizes editable params for you
    static getAllowedParams(params, overrideEditable) {
        return sanitize(pick(params, overrideEditable || this.editable), this.sanitize)
    }

    // validation helper on model...
    static async validateParams(params, overrideRules) {
        return validate(params, overrideRules || this.rules)
    }

}

module.exports = BaseModel
