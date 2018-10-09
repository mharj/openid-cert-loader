import CertLoader from './CertLoader';
import fetch from 'cross-fetch';
import {wrapX5C} from './util';

interface Token {
	jwks_uri: string,
}

interface IKey {
	[key: string]: string;
}

interface CertConfig {
	keys: Array<CertKey>,
}

interface CertKey {
	x5c: Array<string>,
	kid: string,
}
interface CertList {
	[key: string]: string;
}

let azureConfig: Object | null = null;
export class AzureCertLoader extends CertLoader {
	private tenant: string;
	constructor(tenant: string) {
		super();
		this.tenant = tenant;
	}
	private getAzureConfig(tenant: string) {
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
	getAzureCertConfig(url: string) {
		return fetch(url).then((resp) => resp.json());
	}
	get() {
		return this.getAzureConfig(this.tenant)
			.then( (config: Token) => {
				return this.getAzureCertConfig(config.jwks_uri);
			})
			.then(function(certConfig: CertConfig) {
				let certList: IKey = {};
				if (certConfig.keys) {
					certConfig.keys.forEach( (key) => {
						certList[key.kid] = wrapX5C(key.x5c[0]); // store kid + cert mapping
					});
				}
				return certList;
			});
	}
}

/*
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
*/
