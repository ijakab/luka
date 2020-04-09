'use strict'
const AttributeTraitBase = use('App/Models/Traits/Attributes/AttributeTraitBase')

class AddAllowed extends AttributeTraitBase{
    register (Model, attributeConfig) {
        Model.mandatorySelects = AttributeTraitBase.namesOnly(attributeConfig.filter(attr => attr.listConfig.mandatory))
    }
}

module.exports = AddAllowed
