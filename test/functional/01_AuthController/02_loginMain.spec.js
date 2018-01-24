'use strict'

const {test, trait} = use('Test/Suite')('Auth - login main')

trait('Test/ApiClient')
trait('App/Traits/Test/Validate')

const testData = require('../../testData')
const testUser = testData.testUser

test('Should respond with 404 if unknown user on login', async ({client}) => {

  const response = await client.post('/api/auth/login').send({
    username: 'notExisting',
    password: 'testPass123'
  }).end()

  response.assertStatus(404)

})


test('Should not login user with wrong password', async ({client}) => {

  const response = await client.post('/api/auth/login').send({
    username: testUser.username,
    password: 'wrongPassword!'
  }).end()

  response.assertStatus(400)

})


test('Should login user using username or email', async ({client, validate}) => {

  const responseUsername = await client.post('/api/auth/login').send({
    username: testUser.username,
    password: testUser.password
  }).end()

  responseUsername.assertStatus(200)

  const responseEmail = await client.post('/api/auth/login').send({
    email: testUser.email,
    password: testUser.password
  }).end()

  responseEmail.assertStatus(200)

  await validate([
    responseUsername.body.data[0],
    responseEmail.body.data[0]
  ], testData.validation.user)


})
