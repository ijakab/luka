'use strict'

const {test, trait} = use('Test/Suite')('Auth - register')

trait('Test/ApiClient')
trait('App/Traits/Test/Validate')


test('register user', async ({client, validate}) => {

  const response = await client.post('/api/auth/register').send({
    username: 'pero',
    fullName: 'Pero Peric',
    email: 'pero@peric.com',
    password: '123456',
    passwordRepeat: '123456'
  }).end()


  await validate(response.body.data[0], {
    user: 'required|object',
    'user.fullName': 'required|string',
    'user.username': 'required|string',
    'user.email': 'required|string',
    token: 'required|string',
    refreshToken: 'required|string'
  })

  response.assertStatus(200)
})
