module.exports = (Model) => {
    Model.addTrait('App/Models/Traits/AppSplit')
    Model.addTrait('App/Models/Traits/AddStaticAttributes')
    Model.addTrait('App/Models/Traits/Paginable')
    Model.addTrait('@provider:SerializerExtender')
    Model.addTrait('CastDate')
    Model.addTrait('BaseModel')
    if(Model.AttributeConfig) {
        Model.addTrait('App/Models/Traits/Attributes/AddKeyedAttributeConfig', Model.AttributeConfig)
        Model.addTrait('App/Models/Traits/Attributes/AddAllowed', Model.AttributeConfig)
        Model.addTrait('App/Models/Traits/Attributes/AddBools', Model.AttributeConfig)
        Model.addTrait('App/Models/Traits/Attributes/AddJSON', Model.AttributeConfig)
        Model.addTrait('App/Models/Traits/Attributes/AddRules', Model.AttributeConfig)
        Model.addTrait('App/Models/Traits/Attributes/AddListConfig', Model.AttributeConfig)
        Model.addTrait('App/Models/Traits/Attributes/AddHasSlugs', Model.AttributeConfig)
        Model.addTrait('App/Models/Traits/StandardFiltering')
    }
}
