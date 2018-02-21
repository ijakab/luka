// holds specific rules for validating user inputs... so it can be easily reused across app

const rules = {
    username: 'string|min:3|max:20|regex:^[0-9a-zA-Z-_]+$', // allow alpha numeric + _- from 3 to 20 chars
    password: 'min:6',
    language: 'string|min:2|max:2'
}

module.exports = function (validation, additional) {

    // return rule + concatenated additional if needed
    // if validation is not found just return additional

    return rules[validation] ? `${rules[validation]}${additional ? `|${additional}` : ''}` : additional
}

/* example

const validationRule = use('App/Helpers/ValidationRule')

validationRule('username', 'required|required_without_any:password') will return:

'string|min:3|max:20|regex:^[0-9a-zA-Z-_]+$|required|required_without_any:password'

*/