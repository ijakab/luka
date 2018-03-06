const User = use('App/Models/User')

module.exports = {
    testUser: {
        username: 'oO-tester-_-',
        firstname: 'Tester',
        lastname: 'Test',
        email: 'test@gmail.com',
        password: 'testPass123', // later on in test it will be changed to Pass123
        password_confirmation: 'testPass123'
    },

    validation: {
        user: {
            user: 'required|object',
            'user.firstname': 'required|string',
            'user.lastname': 'required|string',
            'user.username': `${User.rules.username}|required`,
            'user.email': 'required|email',
            token: 'required|string',
            refreshToken: 'required|string'
        }
    }
}
