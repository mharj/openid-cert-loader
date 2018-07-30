# openid-cert-loader
Basic loader for OpenID provider certificates

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
