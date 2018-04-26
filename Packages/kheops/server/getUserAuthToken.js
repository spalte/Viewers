import { Meteor } from 'meteor/meteor'
import { OHIF } from 'meteor/ohif:core';

KHEOPS.subFromJWT = function (jwt) {
    let payload = jwt.split('.')[1];
    let payloadJSON = Buffer.from(payload, 'base64').toString();
    let payloadObject = JSON.parse(payloadJSON);

    return payloadObject['sub'];
};

KHEOPS.shareStudyWithUser = function (studyInstanceUID, user) {

    let authToken = KHEOPS.getUserAuthToken();

    let options = {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + authToken,
        }
    };

    try {
        makeTokenRequestSync('http://localhost:7575/users/' + user + '/studies/' + studyInstanceUID, options);
    } catch (error) {
        OHIF.log.trace();
        throw error;
    }
};

KHEOPS.shareSeriesWithUser = function (studyInstanceUID, seriesInstanceUID, user) {

    let authToken = KHEOPS.getUserAuthToken();

    if (!user) {
        user = Meteor.user();
    }

    let options = {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + authToken,
        }
    };

    try {
        makeTokenRequestSync('http://localhost:7575/users/' + user + '/studies/' + studyInstanceUID + '/series/' + seriesInstanceUID, options);
    } catch (error) {
        OHIF.log.trace();
        throw error;
    }
};


KHEOPS.deleteStudy = function (studyInstanceUID) {
    let authToken = KHEOPS.getUserAuthToken();
    let userId = Meteor.user().services.google.id;

    let options = {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + authToken,
        }
    };

    try {
        makeTokenRequestSync('http://localhost:7575/users/' + userId + '/studies/' + studyInstanceUID, options);
    } catch (error) {
        OHIF.log.trace();
        throw error;
    }
};

KHEOPS.getSeriesAuthToken = function (seriesUID, user) {
    if (!user) {
        user = Meteor.user();
    }

    // get the user's Oauth token
    let googleOAuthIdToken = user.services.google.idToken;

    let options = {
        userJWT: googleOAuthIdToken,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        postData: {
            'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion': googleOAuthIdToken,
            'scope': 'seriesInstanceUID=' + seriesUID,
        },
    };

    let result;
    try {
        result = makeTokenRequestSync('http://localhost:7575/token', options);
    } catch (error) {
        OHIF.log.trace();
        throw error;
    }

    return result.data.access_token;
};

// returns a JWT access token from the Authorization server.
KHEOPS.getUserAuthToken = function() {

    // get the user's Oauth token
    let googleOAuthIdToken = Meteor.user().services.google.idToken;

    let options = {
        userJWT: googleOAuthIdToken,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        postData: {
            'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion': googleOAuthIdToken,
        },
    };

    let result;
    try {
        result = makeTokenRequestSync('http://localhost:7575/token', options);
    } catch (error) {
        OHIF.log.trace();
        throw error;
    }

    return result.data.access_token;
};

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
        path: parsed.path,
        method: 'POST'
    };

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

    if (options.method) {
        requestOpt.method = options.method;
    }

    const postData = options.postData;

    if (options.headers) {
        requestOpt.headers = Object.assign({}, options.headers);
    }

    const req = requester(requestOpt, function(resp) {
        // TODO: handle errors with 400+ code
        if (resp.statusCode < 200 || resp.statusCode >= 300) {
            const contentType = (resp.headers['content-type'] || '').split(';')[0];
            if (jsonHeaders.indexOf(contentType) === -1) {
                const errorMessage = `We only support json but "${contentType}" was sent by the server`;
                callback(new Error(errorMessage), null);
                return;
            }
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
            if (output) {
                callback(null, {data: JSON.parse(output)});
            } else {
                callback(null, null);
            }
        });
    });

    req.on('error', function (requestError) {
        OHIF.log.error('Couldn\'t connect to the Kheops Authentication server.');
        OHIF.log.error('Make sure you are trying to connect to the right server and that it is up and running.');
        OHIF.log.error(requestError.stack);
        OHIF.log.trace();

        callback(new Meteor.Error('server-connection-error', requestError.message), null);
    });

    if (postData) {
        req.write(querystring.stringify(postData));
    }
    req.end();
}
