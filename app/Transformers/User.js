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
        return this.collection(model.getRelated('accounts'), AccountTransformer)
    }

}

module.exports = UserTransformer

// ****************************************** NOTE ******************************************
// THIS IS VERY IMPORTANT!!! PUT ALL TRANSFORMERS HERE WHEN YOU USE use(transformer......)
// ****************************************** **** ******************************************

// put all cyclic transformers to bottom // https://stackoverflow.com/questions/10869276/how-to-deal-with-cyclic-dependencies-in-node-js#answer-14098262
const AccountTransformer = use('App/Transformers/Account')