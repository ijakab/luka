const AdvancedSerializer = use('AdvancedSerializer')
const getResponseSubset = use('App/Helpers/GetResponseSubset')

class BaseSerializer extends AdvancedSerializer{
    
    serializeSingle(modelInstance) {
        return getResponseSubset(modelInstance)
    }
}

module.exports = BaseSerializer
