const fetch = require('cross-fetch');
const AzureCertLoader = require('./AzureCertLoader');
const GoogleCertLoader = require('./GoogleCertLoader');
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

function getGoogleCerts() {
	return fetch('https://www.googleapis.com/oauth2/v1/certs').then((resp) => resp.json());
}

/**
 * OpenIDCertLoader
 */
function OpenIDCertLoader() {
	let certs = {};
	let loaders = [];
	/**
	 * @deprecated use "addLoader" and "getCert" instead
	 * @return {Promise}
	 */
	this.getGoogleCerts = getGoogleCerts;
	/**
	 * @param {String} tenant Azure tenant id
	 * @deprecated use "addLoader" and "getCert" instead
	 * @return {Promise}
	 */
	this.getAzureCerts = function(tenant) {
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
			})
			.catch(function(err) {
				Promise.reject(err);
			});
	};
	/**
	 * Add Cert loader function (Promise)
	 * @param {Function<Promise>} loader function
	 */
	this.addLoader = function(loader) {
		loaders.push(loader);
	};
	/**
	 * get Certificate
	 * @param {String} kid Certificate key ID
	 * @return {Promise<String>}
	 */
	this.getCert = function(kid) {
		if (certs[kid]) {
			return Promise.resolve(certs[kid]);
		} else {
			return Promise.all(loaders.map((loader) => loader()))
				.then((loadersData) => {
					loadersData.forEach((loaderData) => {
						Object.keys(loaderData).forEach((loaderKid) => {
							certs[loaderKid] = loaderData[loaderKid];
						});
					});
					return Promise.resolve();
				})
				.then(() => {
					if (certs[kid]) {
						return Promise.resolve(certs[kid]);
					} else {
						throw new Error('Certificate problem, no Key ID found');
					}
				});
		}
	};
}

module.exports = OpenIDCertLoader;
module.exports.GoogleCertLoader = GoogleCertLoader;
module.exports.AzureCertLoader = AzureCertLoader;
