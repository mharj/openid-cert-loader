import CertLoader from './CertLoader';
import {ICertKeys} from './CertLoader';

/**
 * OpenIDCertLoader
 */
export default class OpenIDCertLoader {
	private certs: ICertKeys = {};
	private loaders: Array<CertLoader> = [];
	/**
	 * Add Cert loader function (Promise)
	 * @param {CertLoader} loader class
	 */
	addLoader(loader: CertLoader) {
		this.loaders.push(loader);
	};
	/**
	 * get Certificate
	 * @param {string} kid Certificate key ID
	 * @return {Promise<string>}
	 */
	getCert(kid: string): Promise<string> {
		if ( this.certs[kid] ) {
			return Promise.resolve(this.certs[kid]);
		} else {
			return Promise.all(this.loaders.map((loader) => loader.get()))
				.then((loadersData) => {
					loadersData.forEach((loaderData) => {
						Object.keys(loaderData).forEach((loaderKid: string) => {
							this.certs[loaderKid] = loaderData[loaderKid];
						});
					});
					return Promise.resolve();
				})
				.then(() => {
					if (this.certs[kid]) {
						return Promise.resolve(this.certs[kid]);
					} else {
						throw new Error('Certificate problem, no Key ID found');
					}
				});
		}
	};
}
