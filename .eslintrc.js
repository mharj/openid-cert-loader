module.exports = {
	"extends": "google",
	"env": {
		"es6": true,
		"node" : true,
		"browser": true,
	},
	"rules": {
		"require-jsdoc": 0,
		"indent": ["error", "tab", {"SwitchCase": 1}],
		"no-tabs": 0,
		'max-len': [ 2, {
			code: 240,
			tabWidth: 2,
			ignoreUrls: true,
			ignoreTrailingComments: true
		}],
		'eqeqeq': "warn",
		'quotes': ["error", "single"],
		'curly': ['error', 'all'],
		'newline-per-chained-call': ['error',{ "ignoreChainWithDepth": 2 }],
		'key-spacing': ["error", {"mode": "minimum",}]
	}
};