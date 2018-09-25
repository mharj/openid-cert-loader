function insertNewlines(certificate) {
	for (let i = 64; i < certificate.length; i += 65) {
		certificate = certificate.slice(0, i) + '\n' + certificate.slice(i);
	}
	return certificate;
}

function wrapX5C(data) {
	return '-----BEGIN CERTIFICATE-----\n' + insertNewlines(data) + '\n-----END CERTIFICATE-----\n';
}
module.exports = function() {};
module.exports.wrapX5C = wrapX5C;
