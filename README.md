![Adonis starter](project-image.png)

# Adonis starter

Jumpstart for a new backend project based on AdonisJS framework.

## Installation
Just fork this project and use it as you would use any other AdonisJS project

## What's in a box? *missing for now
- Cleaned up AdonisJS installation for API usage only
- Slug generator logic *
- Basic User model with separate Account model
- Account model has support for Google+, Facebook and LinkedIn logins
- Logic to connect social accounts together with standard *
- User signup and login logic using JWT tokens
- Refresh JWT token logic
- Email service with templates *
- User password reset and account e-mail confirmation *
- Custom responses with built-in response format logic
- Built-in language translation for response messages *
- Auto served public folder via static serve and middleware for basic auth for static files
- Auto documentation builder script using apidoc
- Default basic pm2 config for staging/production purposes
- Basic unit test logic bootstrap *

## package.json scripts

`npm run test` -  runs unit tests

`npm run docs` - builds documentation using [apidoc specification](http://apidocjs.com/)
