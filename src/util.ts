export function insertNewlines(certificate: string): string {
	for (let i = 64; i < certificate.length; i += 65) {
		certificate = certificate.slice(0, i) + '\n' + certificate.slice(i);
	}
	return certificate;
}

export function wrapX5C(data: string): string {
	return '-----BEGIN CERTIFICATE-----\n' + insertNewlines(data) + '\n-----END CERTIFICATE-----\n';
}
