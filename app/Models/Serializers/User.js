const AdvancedSerializer = use('AdvancedSerializer')

class UserSerializer extends AdvancedSerializer {
    serializeSingle(modelInstance) {
        const json = modelInstance.toObject()

        const fullname = `${json.firstname} ${json.lastname}`.trim()

        return {
            id: json.id,
            resourceType: 'user',
            username: json.username,
            firstname: json.firstname,
            lastname: json.lastname,
            fullname,
            initials: fullname.split(' ').map(n => n[0]).splice(0, 3).join('').toUpperCase(),
            email: json.email,
            dob: json.dob,
            language: json.language,
        }
    }

    _attachMeta(modelInstance, output) {
        const meta = modelInstance.$sideLoaded || {}

    }
}

module.exports = UserSerializer
