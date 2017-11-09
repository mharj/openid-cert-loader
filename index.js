const https = require('https');

function getAzureConfig(tenant) {
	return new Promise(function(resolve, reject) {
		let options = {
			host: 'login.microsoftonline.com',
			path: '/'+tenant+'/.well-known/openid-configuration',
		};
		let req = https.request(options, function(res) {
			let str = '';
			res.on('data', function(chunk) {
				str += chunk;
			});
			res.on('end', function() {
				resolve(JSON.parse(str));
			});
		});
		req.on('error', function(err) {
			reject(err);
		});
		req.end();
	});
}

function getAzureCertConfig(url, certs) {
	return new Promise(function(resolve, reject) {
		let req = https.request(url, function(res) {
			let str = '';
			res.on('data', function(chunk) {
				str += chunk;
			});
			res.on('end', function() {
				resolve(JSON.parse(str));
			});
		});
		req.on('error', function(err) {
			reject(err);
		});
		req.end();
	});
}

function getGoogleCerts() {
	return new Promise(function(resolve, reject) {
		let req = https.request('https://www.googleapis.com/oauth2/v1/certs', function(res) {
			let str = '';
			res.on('data', function(chunk) {
				str += chunk;
			});
			res.on('end', function() {
				resolve(JSON.parse(str));
			});
		});
		req.on('error', function(err) {
			reject(err);
		});
		req.end();
	});
}

function OpenIDCertLoader() {
	this.getGoogleCerts = getGoogleCerts;
	this.getAzureCerts = function(tenant) {
		getAzureConfig(tenant)
			.then(function(config) {
				return getAzureCertConfig(config.jwks_uri);
			})
			.then(function(certConfig) {
				let certList = {};
				if ( certConfig.keys ) {
					certConfig.keys.forEach(function(key) {
						let cert = '-----BEGIN CERTIFICATE-----\n'+insertNewlines(key.x5c[0])+'\n-----END CERTIFICATE-----\n';
						certList[key.kid] = Buffer.from(cert); // store kid + cert mapping
					});
				}
				return certList;
			});
	}
}

module.exports = OpenIDCertLoader;

