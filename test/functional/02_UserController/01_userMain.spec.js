'use strict'

const {test, trait} = use('Test/Suite')('User - user main')

trait('Test/ApiClient')
trait(require('../../Traits/Validate'))

const testData = require('../../testData')
const testUser = testData.testUser

test('Should not get protected route without token', async ({client}) => {

    const response = await client.get('/api/user/me').end()
    response.assertStatus(400)

})

test('Should get protected route with token', async ({client}) => {

    const response = await client.get('/api/user/me').header('Authorization', `Bearer ${testData.token}`).end()
    response.assertStatus(200)

})
