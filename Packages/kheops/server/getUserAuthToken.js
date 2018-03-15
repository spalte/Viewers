import { Meteor } from 'meteor/meteor'
import { OHIF } from 'meteor/ohif:core';

KHEOPS.subFromJWT = function (jwt) {
    let payload = jwt.split('.')[1];
    let payloadJSON = Buffer.from(payload, 'base64').toString();
    let payloadObject = JSON.parse(payloadJSON);

    return payloadObject['sub'];
}

KHEOPS.getSeriesAuthToken = function (seriesUID) {

}

// returns a JWT access token from the Authorization server.
KHEOPS.getUserAuthToken = function() {

    // get the user's Oauth token
    let googleOAuthIdToken = Meteor.user().services.google.idToken;

    let options = {
        userJWT: googleOAuthIdToken,
    };

    let result;
    try {
        result = makeTokenRequestSync('http://localhost:7575/token', options);
    } catch (error) {
        OHIF.log.trace();
        throw error;
    }


    return result.data.access_token;
}

const http = Npm.require('http');
const https = Npm.require('https');
const url = Npm.require('url');
const querystring = Npm.require('querystring');

const makeTokenRequestSync = Meteor.wrapAsync(makeTokenRequest);

function makeTokenRequest(geturl, options, callback) {
    const parsed = url.parse(geturl);
    const jsonHeaders = ['application/json'];

    let requestOpt = {
        hostname: parsed.hostname,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        path: parsed.path,
        method: 'POST'
    };

    const postData = querystring.stringify({
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion': options.userJWT
    });

    let requester;
    if (parsed.protocol === 'https:') {
        requester = https.request;

        const allowUnauthorizedAgent = new https.Agent({ rejectUnauthorized: false });
        requestOpt.agent = allowUnauthorizedAgent;
    } else {
        requester = http.request;
    }


    if (parsed.port) {
        requestOpt.port = parsed.port;
    }

    if (options.auth) {
        requestOpt.auth = options.auth;
    }

    if (options.headers) {
        Object.keys(options.headers).forEach(key => {
            const value = options.headers[key];
            requestOpt.headers[key] = value;
        });
    }

    const req = requester(requestOpt, function(resp) {
        // TODO: handle errors with 400+ code
        const contentType = (resp.headers['content-type'] || '').split(';')[0];
        if (jsonHeaders.indexOf(contentType) === -1) {
            const errorMessage = `We only support json but "${contentType}" was sent by the server`;
            callback(new Error(errorMessage), null);
            return;
        }

        let output = '';

        resp.setEncoding('utf8');

        resp.on('data', function(chunk){
            output += chunk;
        });

        resp.on('error', function (responseError) {
            OHIF.log.error('There was an error in the Kheops Authentication Server')
            OHIF.log.error(error.stack);
            OHIF.log.trace();

            callback(new Meteor.Error('server-internal-error', responseError.message), null);
        });

        resp.on('end', function(){
            callback(null, { data: JSON.parse(output) });
        });
    });

    req.on('error', function (requestError) {
        OHIF.log.error('Couldn\'t connect to the Kheops Authentication server.');
        OHIF.log.error('Make sure you are trying to connect to the right server and that it is up and running.');
        OHIF.log.error(requestError.stack);
        OHIF.log.trace();

        callback(new Meteor.Error('server-connection-error', requestError.message), null);
    });

    req.write(postData);
    req.end();
}
