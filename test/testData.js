module.exports = {
  testUser: {
    username: 'oO-tester-_-',
    fullName: 'Tester Test',
    email: 'test@gmail.com',
    password: 'testPass123',
    passwordRepeat: 'testPass123'
  },

  validation: {
    user: {
      user: 'required|object',
      'user.fullName': 'required|string',
      'user.username': 'required|string|min:3|max:20|regex:^[0-9a-zA-Z-_]+$',
      'user.email': 'required|email',
      token: 'required|string',
      refreshToken: 'required|string'
    }
  }
}
