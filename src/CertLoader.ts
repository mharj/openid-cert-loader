
export interface ICertKeys {
	[key: string]: string;
}


export default abstract class CertLoader {
	abstract get(): Promise<ICertKeys>;
}