const TransformerAbstract = use('App/Transformers/BaseTransformer')

class UserTransformer extends TransformerAbstract {
    static get availableInclude() {
        return [
            'accounts'
        ]
    }

    static get defaultInclude() {
        return []
    }

    transform(model, ctx) {

        const json = this._jsonFromModel(model) // call getters if needed

        // ****************************************** NOTE ******************************************
        // adapt however you want...
        // ****************************************** **** ******************************************
        const fullname = `${json.firstname} ${json.lastname}`.trim()

        return {
            id: json.id,
            username: json.username,
            firstname: json.firstname,
            lastname: json.lastname,
            fullname,
            initials: fullname.split(' ').map(n => n[0]).splice(0, 3).join('').toUpperCase(),
            email: json.email,
            dob: json.dob,
            language: json.language,
            created_at: json.created_at,
            updated_at: json.updated_at
        }
    }

    includeAccounts(model) {
        return this.collection(model.getRelated('accounts'), 'Account')
    }

}

module.exports = UserTransformer
