'use strict'

const {test, trait} = use('Test/Suite')('Auth - login main')
const User = use('App/Models/User')
const Env = use('Env')
const _ = use('lodash')
const jwt = use('jsonwebtoken')

trait('Test/ApiClient')
trait('CustomTest/Validate')
trait('CustomTest/Sleep')
trait('CustomTest/GetEmail')

const testData = require('../../testData')
const testUser = testData.testUser

let usernameEmailToken, emailEmailToken

test('Should respond with 400 invalidPasswordOrUsername if unknown user on login', async ({client}) => {

    const response = await client.post('/api/auth/login').send({
        username: 'notExisting',
        password: 'testPass123'
    }).end()

    response.assertStatus(400)
    response.assertJSONSubset({
        debug: {
            untranslatedMsg: 'auth.invalidPasswordOrUsername'
        }
    })

})

test('Should not login user with wrong password', async ({client}) => {

    const response = await client.post('/api/auth/login').send({
        username: testUser.username,
        password: 'wrongPassword!'
    }).end()

    response.assertStatus(400)
    response.assertJSONSubset({
        debug: {
            untranslatedMsg: 'auth.invalidPasswordOrUsername'
        }
    })

})

test('Should login user using username or email', async ({client, validate}) => {

    const responseUsername = await client.post('/api/auth/login').send({
        username: testUser.username,
        password: testUser.password
    }).end()

    responseUsername.assertStatus(200)

    const responseEmail = await client.post('/api/auth/login').send({
        username: testUser.email,
        password: testUser.password
    }).end()

    responseEmail.assertStatus(200)

    // validate both response payloads
    await validate([
        responseUsername.body.data,
        responseEmail.body.data
    ], testData.validation.user)

})

test('Should get password reset token email using email or username', async ({client, getEmail, assert}) => {

    const responseUsername = await client.post('/api/auth/forgotPassword').send({
        username: testUser.username
    }).end()
    responseUsername.assertStatus(200)

    const usernameEmail = await getEmail()

    assert.equal(_.first(usernameEmail.message.to).address, testUser.email)
    // check if jwt token is inside email html, and fetch it for later use
    try {
        usernameEmailToken = usernameEmail.message.html.split(/href=.*?token\=(.+)?"/gmi)[1]
    } catch (err) {
        throw new Error('Email token was not found using regex pattern inside email sent to user on registration with username!')
    }
    assert.exists(usernameEmailToken)


    // check when sending password forgot with email
    const responseEmail = await client.post('/api/auth/forgotPassword').send({
        username: testUser.email
    }).end()
    responseEmail.assertStatus(200)

    const emailEmail = await getEmail()

    assert.equal(_.first(emailEmail.message.to).address, testUser.email)
    // check if jwt token is inside email html, and fetch it for later use
    try {
        emailEmailToken = emailEmail.message.html.split(/href=.*?token\=(.+)?"/gmi)[1]
    } catch (err) {
        throw new Error('Email token was not found using regex pattern inside email sent to user on registration with username!')
    }
    assert.exists(emailEmailToken)
})

test('Should not allow password reset if invalid token', async ({client, sleep}) => {

    const noTokenInPayload = await client.post('/api/auth/resetPassword').send({
        password: 'newShinyPassword123',
        password_confirmation: 'newShinyPassword123'
    }).end()

    const totallyWrongResponse = await client.post('/api/auth/resetPassword').send({
        token: 'WRONG TOKEN!',
        password: 'newShinyPassword123',
        password_confirmation: 'newShinyPassword123'
    }).end()

    // get real user from db
    const user = await User.first()
    const expiredToken = await jwt.sign({
        passwordReset: user.id
    }, Env.get('APP_KEY'), {
        expiresIn: '1 second'
    })

    // wait that one second, and a little bit so token expires :)
    await sleep(1337)

    const validJwtButExpired = await client.post('/api/auth/resetPassword').send({
        token: expiredToken,
        password: 'newShinyPassword123',
        password_confirmation: 'newShinyPassword123'
    }).end()


    const validJwtButNotValidToken = await client.post('/api/auth/resetPassword').send({
        token: await jwt.sign({
            passwordReset: user.id
        }, 'Wrong app key! Token was forged by some nasty guy', {
            expiresIn: '1 day'
        }),
        password: 'newShinyPassword123',
        password_confirmation: 'newShinyPassword123'
    }).end()


    // also validate response messages so we are sure token errors were thrown
    validJwtButExpired.assertStatus(401)
    validJwtButExpired.assertJSONSubset({
        debug: {
            untranslatedMsg: 'error.tokenExpired'
        }
    })

    const otherResponses = [noTokenInPayload, totallyWrongResponse, validJwtButNotValidToken]
    otherResponses.forEach((res) => {
        res.assertStatus(400)
        res.assertJSONSubset({
            debug: {
                untranslatedMsg: 'error.invalidToken'
            }
        })
    })

})

test('Should not allow password reset if password is not the same or too few characters', async ({client}) => {

    const passwordNotSame = await client.post('/api/auth/resetPassword').send({
        token: usernameEmailToken,
        password: 'newShinyPassword123',
        password_confirmation: 'newShinyPassword123Whooops!'
    }).end()
    passwordNotSame.assertStatus(400)

    const shortPass = await client.post('/api/auth/resetPassword').send({
        token: usernameEmailToken,
        password: '123',
        password_confirmation: '123'
    }).end()
    shortPass.assertStatus(400)

})

test('Should reset user password to a new password', async ({client}) => {

    const response = await client.post('/api/auth/resetPassword').send({
        token: usernameEmailToken,
        password: 'Pass123',
        password_confirmation: 'Pass123'
    }).end()
    response.assertStatus(200)

    response.assertJSONSubset({
        debug: {
            untranslatedMsg: 'auth.passwordReseted'
        }
    })

})

test('Should NOT login user using old password', async ({client}) => {

    const response = await client.post('/api/auth/login').send({
        username: testUser.username,
        password: testUser.password
    }).end()

    response.assertStatus(400)

})

test('Should login user using new password', async ({client, validate}) => {

    // also set test data password to new password if we ever need it
    testUser.password = 'Pass123'

    const response = await client.post('/api/auth/login').send({
        username: testUser.username,
        password: testUser.password
    }).end()

    response.assertStatus(200)
    await validate(response.body.data, testData.validation.user)

    // save token and refresh token for other tests...
    testData.token = response.body.data.token
    testData.refreshToken = response.body.data.refreshToken

})

test('Should not refresh token if wrong token is sent', async ({client}) => {

    const noTokenInPayload = await client.post('/api/auth/refreshToken').send({}).end()
    noTokenInPayload.assertStatus(400)

    const totallyWrongResponse = await client.post('/api/auth/refreshToken').send({token: 'WRONG TOKEN!'}).end()
    totallyWrongResponse.assertStatus(400)

})

test('Should refresh token if good token is sent', async ({client}) => {

    const response = await client.post('/api/auth/refreshToken').send({
        token: testData.refreshToken
    }).end()

    response.assertStatus(200)

})
