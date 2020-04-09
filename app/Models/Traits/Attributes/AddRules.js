'use strict'
const AttributeTraitBase = use('App/Models/Traits/Attributes/AttributeTraitBase')

class AddRules extends AttributeTraitBase{
    register (Model, attributeConfig) {
        Model.required = AttributeTraitBase.whereTrueNameOnly(attributeConfig, 'required')
        Model.attributeRules = {}
        Model.attributeSanitize = {}

        for(let attr of attributeConfig) {
            if(attr.validateRule) Model.attributeRules[attr.name] = attr.validateRule
            if(attr.sanitizeRule) Model.attributeSanitize[attr.name] = attr.sanitizeRule
        }
    }
}

module.exports = AddRules
