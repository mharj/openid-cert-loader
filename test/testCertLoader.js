const fetch = require('cross-fetch');
const chai = require('chai');
const {OpenIDCertLoader, GoogleCertLoader, AzureCertLoader, wrapX5C} = require('../lib/index.js');
chai.should();
let googleCert = null;
let googleKid = null;
let azureCert = null;
let azureKid = null;

describe('OpenIDCertLoader', function() {
	describe('GoogleCertLoader', function() {
		before((done) => {
			fetch('https://www.googleapis.com/oauth2/v1/certs')
				.then((resp) => resp.json())
				.then((data) => {
					const kids = Object.keys(data);
					googleKid = kids[0];
					googleCert = data[googleKid];
					done();
				});
		});
		it('should match with cert', function(done) {
			const ocl = new OpenIDCertLoader();
			ocl.addLoader(GoogleCertLoader.getInstance());
			ocl.getCert(googleKid).then((cert) => {
				cert.should.be.equal(googleCert);
				done();
			});
		});
		it('should get error when can\' find correct kid', function(done) {
			const ocl = new OpenIDCertLoader();
			ocl.addLoader(GoogleCertLoader.getInstance());
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
			const ocl = new OpenIDCertLoader();
			ocl.addLoader(AzureCertLoader.getInstance({tenant: 'common'}));
			ocl.getCert(azureKid).then((cert) => {
				cert.should.be.equal(azureCert);
				done();
			});
		});
		it('should get error when can\' find correct kid', function(done) {
			const ocl = new OpenIDCertLoader();
			ocl.addLoader(AzureCertLoader.getInstance({tenant: 'common'}));
			ocl
				.getCert('something-borked')
				.catch((err) => {
					done();
				});
		});
	});
	describe('Test Dual Loader', function() {
		it('should match with certs', function(done) {
			const ocl = new OpenIDCertLoader();
			ocl.addLoader(GoogleCertLoader.getInstance());
			ocl.addLoader(AzureCertLoader.getInstance({tenant: 'common'}));
			Promise.all([
				ocl.getCert(googleKid),
				ocl.getCert(azureKid),
			]).then((certs) => {
				certs[0].should.be.equal(googleCert);
				certs[1].should.be.equal(azureCert);
				done();
			});
		});
		it('should not work with wrong loader', function(done) {
			try {
				const ocl = new OpenIDCertLoader();
				ocl.addLoader({});
			} catch (err) {
				done();
			}
		});
	});
});
