const fetch = require('cross-fetch');

// TODO: build v3 loader
module.exports = function() {
	return fetch('https://www.googleapis.com/oauth2/v1/certs').then((resp) => resp.json());
};
