const TransformerAbstract = use('App/Transformers/BaseTransformer')

class UserTransformer extends TransformerAbstract {
    availableInclude() {
        return [
            'accounts'
        ]
    }

    defaultInclude() {
        return []
    }

    transform(model, ctx) {

        const json = this._jsonFromModel(model) // call getters if needed

        // ****************************************** NOTE ******************************************
        // adapt however you want...
        // ****************************************** **** ******************************************

        return {
            id: json.id,
            username: json.username,
            firstname: json.firstname,
            lastname: json.lastname,
            email: json.email,
            dob: json.dob,
            language: json.language
        }
    }

    includeAccounts(model) {
        return this.collection(model.getRelated('accounts'), 'Account')
    }

}

module.exports = UserTransformer
