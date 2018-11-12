import CertLoader from './CertLoader';
import fetch from 'cross-fetch';

// TODO: build v3 loader
// check https://github.com/tracker1/node-rsa-pem-from-mod-exp for Google public mod/exp 
export class GoogleCertLoader extends CertLoader {
	private static instance: CertLoader = new GoogleCertLoader();
	public get() {
		return fetch('https://www.googleapis.com/oauth2/v1/certs').then((resp) => resp.json());
	}
	public static getInstance(){
		return this.instance;
	}
}
