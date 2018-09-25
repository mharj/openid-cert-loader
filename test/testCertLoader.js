const fetch = require('cross-fetch');
const chai = require('chai');
const OpenIDCertLoader = require('../index');
const googleCertLoader = require('../index').GoogleCertLoader;
const azureCertLoader = require('../index').AzureCertLoader;
const wrapX5C = require('../util').wrapX5C;
chai.should();
let googleCert = null;
let googleKid = null;
let azureCert = null;
let azureKid = null;

/**
 * Old example loader
 */
let certs = {};
function loadCerts() {
	let ocl = new OpenIDCertLoader();
	return Promise.all([
		ocl.getGoogleCerts(), // Google
		ocl.getAzureCerts('common'), // Azure
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


describe('OpenIDCertLoader', function() {
	describe('GoogleCertLoader', function() {
		before((done) => {
			fetch('https://www.googleapis.com/oauth2/v1/certs')
				.then((resp) => resp.json())
				.then((data) => {
					let kids = Object.keys(data);
					googleKid = kids[0];
					googleCert = data[googleKid];
					done();
				});
		});
		it('should match with cert', function(done) {
			let ocl = new OpenIDCertLoader();
			ocl.addLoader(googleCertLoader);
			ocl.getCert(googleKid).then((cert) => {
				cert.should.be.equal(googleCert);
				done();
			});
		});
		it('should get error when can\' find correct kid', function(done) {
			let ocl = new OpenIDCertLoader();
			ocl.addLoader(googleCertLoader);
			ocl
				.getCert('something-borked')
				.catch((err) => {
					done();
				});
		});
	});
	describe('AzureCertLoader', function() {
		before((done) => {
			fetch('https://login.microsoftonline.com/common/.well-known/openid-configuration')
				.then((resp) => resp.json())
				.then( (config) => {
					return fetch(config.jwks_uri).then( (jwkResp) => jwkResp.json());
				})
				.then((data) => {
					azureKid = data.keys[0].kid;
					azureCert = wrapX5C(data.keys[0].x5c[0]);
					done();
				});
		});
		it('should match with cert', function(done) {
			let ocl = new OpenIDCertLoader();
			ocl.addLoader(()=>azureCertLoader('common'));
			ocl.getCert(azureKid).then((cert) => {
				cert.should.be.equal(azureCert);
				done();
			});
		});
		it('should get error when can\' find correct kid', function(done) {
			let ocl = new OpenIDCertLoader();
			ocl.addLoader(()=>azureCertLoader('common'));
			ocl
				.getCert('something-borked')
				.catch((err) => {
					done();
				});
		});
	});
	describe('Test Dual Loader', function() {
		it('should match with certs', function(done) {
			let ocl = new OpenIDCertLoader();
			ocl.addLoader(googleCertLoader);
			ocl.addLoader(()=>azureCertLoader('common'));
			Promise.all([
				ocl.getCert(googleKid),
				ocl.getCert(azureKid),
			]).then((certs) => {
				certs[0].should.be.equal(googleCert);
				certs[1].should.be.equal(azureCert);
				done();
			});
		});
	});
	describe('Test old example loader (deprecated)', function() {
		it('should match with both certs', function(done) {
			Promise.all([
				getCert(azureKid),
				getCert(googleKid),
			]).then( (certs) => {
				certs[0].should.be.equal(azureCert);
				certs[1].should.be.equal(googleCert);
				done();
			});
		});
	});
});
