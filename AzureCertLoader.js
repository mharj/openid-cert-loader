const fetch = require('cross-fetch');
const wrapX5C = require('./util').wrapX5C;
let azureConfig = null;

function getAzureConfig(tenant) {
	if (azureConfig === null) {
		return fetch('https://login.microsoftonline.com/' + tenant + '/.well-known/openid-configuration')
			.then((resp) => resp.json())
			.then((json) => {
				azureConfig = json;
				return json;
			});
	} else {
		return Promise.resolve(azureConfig);
	}
}

function getAzureCertConfig(url, certs) {
	return fetch(url).then((resp) => resp.json());
}

module.exports = AzureCertLoader = function(tenant) {
	return getAzureConfig(tenant)
		.then(function(config) {
			return getAzureCertConfig(config.jwks_uri);
		})
		.then(function(certConfig) {
			let certList = {};
			if (certConfig.keys) {
				certConfig.keys.forEach(function(key) {
					certList[key.kid] = wrapX5C(key.x5c[0]); // store kid + cert mapping
				});
			}
			return certList;
		});
};
