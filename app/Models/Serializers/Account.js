const AdvancedSerializer = use('AdvancedSerializer')

class AccountSerializer extends AdvancedSerializer {
    serializeSingle(modelInstance) {
        const json = modelInstance.toObject()

        return {
            id: json.id,
            type: json.type,
            email: json.email,
            validated: json.validated,
            social_id: json.social_id,
        }
    }
}

module.exports = AccountSerializer
