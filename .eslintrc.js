module.exports = {
	extends: [ "leankit", "leankit/es6" ],
	rules: {
		strict: [ "error", "global" ],
		"no-unused-expressions": 2,
		"prefer-arrow-callback": 0,
		"init-declarations": 0
	},
	parserOptions: {
		ecmaVersion: 2018
	}
};
