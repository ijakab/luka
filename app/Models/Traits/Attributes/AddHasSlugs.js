'use strict'
const AttributeTraitBase = use('App/Models/Traits/Attributes/AttributeTraitBase')

class AddAllowed extends AttributeTraitBase{
    register (Model, attributeConfig) {
        Model.hasSlugs = !!attributeConfig.find(attr => attr.name === 'slug')
    }
}

module.exports = AddAllowed
