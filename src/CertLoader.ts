
export interface ICertKeys {
	[key: string]: string;
}


export default abstract class CertLoader {
	public abstract get(): Promise<ICertKeys>;
}