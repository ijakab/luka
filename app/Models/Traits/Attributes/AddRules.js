'use strict'
const AttributeTraitBase = use('App/Models/Traits/Attributes/AttributeTraitBase')

class AddRules extends AttributeTraitBase{
    register (Model, attributeConfig) {
        Model.required = AttributeTraitBase.whereTrueNameOnly(attributeConfig, 'required')
        Model.rules = {}
        Model.sanitize = {}

        for(let attr of attributeConfig) {
            if(attr.validateRule) Model.rules[attr.name] = attr.validateRule
            if(attr.sanitizeRule) Model.sanitize[attr.name] = attr.sanitizeRule
        }
    }
}

module.exports = AddRules
