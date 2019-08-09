'use strict'

class BaseModel {
    register(Model, customOptions = {}) {
        const {validate, sanitize} = use('Validator')
        const {pick} = use('lodash')

        const defaultOptions = {}
        const options = Object.assign(defaultOptions, customOptions)

        // NOTE!
        // before using this methods you should have getters for editable, sanitize and rules
        // check user model if in doubt

        // gets and sanitizes editable params for you
        Model.getAllowedParams = (params, overrideEditable) => {
            return sanitize(pick(params, overrideEditable || Model.editable), Model.sanitize)
        }

        // validation helper on model...
        Model.validateParams = async (params, overrideRules) => {
            return validate(params, overrideRules || Model.rules)
        }

    }
}

module.exports = BaseModel

