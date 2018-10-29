import CertLoader from './CertLoader';
import fetch from 'cross-fetch';

// TODO: build v3 loader
export class GoogleCertLoader extends CertLoader {
	public get() {
		return fetch('https://www.googleapis.com/oauth2/v1/certs').then((resp) => resp.json());
	}
}