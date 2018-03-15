const querystring = require("querystring");
const url = require("url");

WADOProxy.convertURL = (url, serverConfiguration) => {
    if (!Settings.enabled) {
        return url;
    }

    if (!url) {
        return null;
    }

    const serverId = serverConfiguration._id;
    const query = querystring.stringify({url, serverId});
    return `${Settings.uri}?${query}`;
}

WADOProxy.seriesFromWadoURL = function (wadoURL) {
    // find first instance of the term series in the url
    let path = url.parse(wadoURL).pathname;

    console.log(path);

    return '1.1.1.1';
}