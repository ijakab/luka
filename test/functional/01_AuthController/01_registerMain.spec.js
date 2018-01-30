'use strict'

const {test, trait} = use('Test/Suite')('Auth - register main')

trait('Test/ApiClient')
trait('App/Traits/Test/Validate')

const testData = require('../../testData')
const testUser = testData.testUser


test('Register user', async ({client, validate}) => {

  const response = await client.post('/api/auth/register').send(testUser).end()

  await validate(response.body.data[0], testData.validation.user)

  response.assertStatus(200)
})


test('Should NOT register same user', async ({client}) => {

  const response = await client.post('/api/auth/register').send(testUser).end()

  response.assertStatus(400)
})


test('Should NOT register user with special chars inside username', async ({client}) => {

  const usernameTester = {
    fullName: 'Username tester',
    email: 'username_tester@email.com',
    password: 'testPass123',
    passwordRepeat: 'testPass123'
  }

  const usernames = ['$$$richy$$$', 'I have space chars', 'NO', 'My-username-is-waaaaaaay-to-loooong']

  await Promise.all(usernames.map(async (username) => {

    const userPayload = Object.assign({username}, usernameTester)

    const response = await client.post('/api/auth/register').send(userPayload).end()

    response.assertStatus(400)
  }))


})
