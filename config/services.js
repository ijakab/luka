'use strict'

const Env = use('Env')


// ****************************************** NOTE ******************************************
// redirectUri is url to your frontend which will handle social login after oAuth redirect
// take care when entering this url... If you fail / or protocol or anything you will lose
// sooooo much time, like I did because of one stupid mistake of not setting / before ?
// ****************************************** **** ******************************************


module.exports = {
    ally: {

        facebook: {
            clientId: Env.get('FB_CLIENT_ID'),
            clientSecret: Env.get('FB_CLIENT_SECRET'),
            redirectUri: Env.get('FB_REDIRECT_URL') // put your frontend route here which will handle login with returned token from oauth process
        },


        google: {
            clientId: Env.get('GOOGLE_CLIENT_ID'),
            clientSecret: Env.get('GOOGLE_CLIENT_SECRET'),
            redirectUri: Env.get('GOOGLE_REDIRECT_URL') // put your frontend route here which will handle login with returned token from oauth process
        },


        linkedin: {
            clientId: Env.get('LINKEDIN_ID'),
            clientSecret: Env.get('LINKEDIN_SECRET'),
            redirectUri: Env.get('LINKEDIN_REDIRECT_URL') // put your frontend route here which will handle login with returned token from oauth process
        }
    }
}
