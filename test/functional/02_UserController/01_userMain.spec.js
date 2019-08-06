'use strict'

const {test, trait, before} = use('Test/Suite')('02-01 User - user main')

before(async () => {
    this.testData = global.testData
})

trait('Test/ApiClient')
trait('CustomTest/Validate')
trait('CustomTest/AssertStatus')

test('Should not get protected route without token', async ({client, assertStatus}) => {

    const response = await client.get('/api/users/me').end()
    assertStatus(response, 400)

})

test('Should get protected route with token', async ({client, assertStatus}) => {

    const response = await client.get('/api/users/me').header('Authorization', `Bearer ${this.testData.token}`).end()
    assertStatus(response, 200)

})
