const BaseSerializer = use('App/Models/Serializers/')

class UserSerializer extends BaseSerializer {
    serializeSingle(modelInstance) {
        const json = super.serializeSingle(modelInstance)

        const fullname = `${json.firstname} ${json.lastname}`.trim()
        json.initials = fullname.split(' ').map(n => n[0]).splice(0, 3).join('').toUpperCase()

        return json
    }
}

module.exports = UserSerializer
