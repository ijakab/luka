'use strict'

const {test, trait} = use('Test/Suite')('Auth - register main')
const Env = use('Env')
const User = use('App/Models/User')
const _ = use('lodash')
const jwt = use('jsonwebtoken')

trait('Test/ApiClient')
trait('CustomTest/Validate')
trait('CustomTest/Sleep')
trait('CustomTest/GetEmail')

const testData = require('../../testData')
const testUser = testData.testUser

let emailToken

test('Register user and check email', async ({client, validate, getEmail, assert}) => {

    const response = await client.post('/api/auth/register').send(testUser).end()
    response.assertStatus(200)

    // catch sent email using getEmail trait
    const recentEmail = await getEmail()

    assert.equal(_.first(recentEmail.message.to).address, testUser.email)
    // check if jwt token is inside email html, and fetch it for later use
    try {
        emailToken = recentEmail.message.html.split(/href=.*?token\=(.+)?"/gmi)[1]
    } catch (err) {
        throw new Error('Email token was not found using regex pattern inside email sent to user on registration!')
    }

})

test('Should NOT register same user', async ({client}) => {

    const response = await client.post('/api/auth/register').send(testUser).end()

    response.assertStatus(400)
})

test('Should NOT register user with invalid or same email (also using .+ for gmail)', async ({client}) => {

    const emailTester = {
        fullName: 'Email tester',
        username: 'validUsername',
        password: 'testPass123',
        passwordRepeat: 'testPass123'
    }

    const invalidEmails = ['nomonkey.gmail.com', 'ilooksovalid@gmail..com', 'ihaveacomma@gmail,com']
    // valid email is test@gmail.com
    const validExistingEmails = ['t.e.s.t@gmail.com', 'test+04@gmail.com'] // check . and + syntax as same email if gmail account

    await Promise.all(invalidEmails.map(async (email) => {

        const userPayload = Object.assign({email}, emailTester)

        const response = await client.post('/api/auth/register').send(userPayload).end()
        response.assertStatus(400)
    }))


    // test if valid emails return emailExists error if slightly edited
    await Promise.all(validExistingEmails.map(async (email) => {

        const userPayload = Object.assign({email}, emailTester)

        const response = await client.post('/api/auth/register').send(userPayload).end()
        response.assertStatus(400)
        response.assertJSONSubset({
            debug: {
                untranslatedMsg: 'auth.emailExists'
            }
        })
    }))
})

test('Should NOT register user with special chars inside username', async ({client}) => {

    const usernameTester = {
        fullName: 'Username tester',
        email: 'username_tester@gmail.com',
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

test('Should not login user while account is not verified', async ({client}) => {

    const response = await client.post('/api/auth/login').send({
        username: testUser.username,
        password: testUser.password
    }).end()

    response.assertStatus(403)

})

test('Should not validate email of user when wrong token is sent', async ({client, sleep}) => {

    const noTokenInPayload = await client.post('/api/auth/validateEmail').send().end()

    const totallyWrongResponse = await client.post('/api/auth/validateEmail').send({token: 'WRONG TOKEN!'}).end()

    // get real user from db
    const user = await User.first()
    const expiredToken = await jwt.sign({
        mailValidation: user.id
    }, Env.get('APP_KEY'), {
        expiresIn: '1 second'
    })

    // wait that one second, and a little bit so token expires :)
    await sleep(1337)

    const validJwtButExpired = await client.post('/api/auth/validateEmail').send({
        token: expiredToken
    }).end()


    const validJwtButNotValidToken = await client.post('/api/auth/validateEmail').send({
        token: await jwt.sign({
            mailValidation: user.id
        }, 'Wrong app key! Token was forged by some nasty guy', {
            expiresIn: '1 day'
        })
    }).end()


    // also validate response messages so we are sure token errors were thrown
    validJwtButExpired.assertStatus(400)
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

test('It should resend validation for email of user', async ({client, getEmail, assert}) => {

    const response = await client.post('/api/auth/resendValidation').send({resendEmail: testUser.email}).end()
    response.assertStatus(200)

    // catch sent email using getEmail trait
    const recentEmail = await getEmail()

    assert.equal(_.first(recentEmail.message.to).address, testUser.email)
    // check if jwt token is inside email html, and fetch it for later use
    try {
        emailToken = recentEmail.message.html.split(/href=.*?token\=(.+)?"/gmi)[1]
    } catch (err) {
        throw new Error('Email token was not found using regex pattern inside email sent to user on registration!')
    }

    assert.exists(emailToken)

})

test('Should not allow password reset while account is not activated', async ({client}) => {

    const response = await client.post('/api/auth/forgotPassword').send({
        username: testUser.username
    }).end()
    response.assertStatus(403)

    response.assertJSONSubset({
        debug: {
            untranslatedMsg: 'auth.mailNotValidated'
        }
    })

})

test('Should validate email if token is sent correctly', async ({client, assert}) => {

    const user = await User.first()

    // check if he is already validated
    assert.isNotTrue(user.validated)

    const response = await client.post('/api/auth/validateEmail').send({token: emailToken}).end()
    response.assertStatus(200)

})

test('It should respond that email is already validated', async ({client}) => {

    const response = await client.post('/api/auth/resendValidation').send({resendEmail: testUser.email}).end()
    response.assertStatus(400)
    response.assertJSONSubset({
        debug: {
            untranslatedMsg: 'auth.emailAlreadyValidated'
        }
    })


})

test('Resend validation should fail with 404 if wrong email', async ({client}) => {
    // this is to prevent people of using this route to fetch emails in our db
    const response = await client.post('/api/auth/resendValidation').send({resendEmail: 'somestrangeguy@gmail.com'}).end()
    response.assertStatus(404)
    response.assertJSONSubset({
        debug: {
            untranslatedMsg: 'auth.emailOrUsernameNotFound'
        }
    })

})
