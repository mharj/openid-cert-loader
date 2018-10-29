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
interface TenantCertLoader {
	name: string,
	instance: CertLoader,
}
let azureConfig: Object | null = null;
export class AzureCertLoader extends CertLoader {
	private static instance: TenantCertLoader[] = [];
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
	private getAzureCertConfig(url: string) {
		return fetch(url).then((resp) => resp.json());
	}
	public get() {
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
	public static getInstance({tenant}: {tenant: string}) {
		this.instance.forEach( (i) => {
			if ( i.name === tenant ) {
				return i.instance;
			}
		});
		let ob = {
			name: tenant,
			instance: new AzureCertLoader(tenant),
		}
		this.instance.push(ob)
		return ob.instance;
	}
}
