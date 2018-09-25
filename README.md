# openid-cert-loader
[![Build Status](https://travis-ci.org/mharj/openid-cert-loader.svg?branch=master)](https://travis-ci.org/mharj/openid-cert-loader)
[![Dependency Status ](https://david-dm.org/mharj/openid-cert-loader.svg)](https://david-dm.org/mharj/openid-cert-loader)

Basic loader for OpenID provider certificates

### Example
```javascript
let ocl = new OpenIDCertLoader();
ocl.addLoader(googleCertLoader);
ocl.addLoader(()=>azureCertLoader('common'));
...
...
ocl.getCert(someKid)
	.then( (cert) => {
		jwt.verify(token, cert, ....
	})

```
### Old example (deprecated)
```javascript
const OpenIDCertLoader = require('openid-cert-loader');
let certs = {};
function loadCerts() {
	console.log('loading certs');
	let ocl = new OpenIDCertLoader();
	return Promise.all([
		ocl.getGoogleCerts(), // Google
	]).then(function(_certLists) {
		_certLists.forEach( (_certs) => {
			Object.keys(_certs).forEach(function(kid) {
				certs[kid] =_certs[kid];
			});
		});
	});
}
function getCert(kid) {
	if ( certs[kid] ) {
		return Promise.resolve(certs[kid]);
	} else {
		return loadCerts()
			.then( () => {
				if ( certs[kid] ) {
					return Promise.resolve(certs[kid]);
				} else {
					throw new Error('Certificate problem, no Key ID found');
				}
			});
	}
}

module.exports.loadCerts = loadCerts;
module.exports.getCert = getCert;
```
