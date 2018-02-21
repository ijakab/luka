const validationRule = require('../app/Helpers/ValidationRule')

module.exports = {
    testUser: {
        username: 'oO-tester-_-',
        fullName: 'Tester Test',
        email: 'test@gmail.com',
        password: 'testPass123', // later on in test it will be changed to Pass123
        passwordRepeat: 'testPass123'
    },

    validation: {
        user: {
            user: 'required|object',
            'user.fullName': 'required|string',
            'user.username': validationRule('username', 'required'),
            'user.email': 'required|email',
            token: 'required|string',
            refreshToken: 'required|string'
        }
    }
}
