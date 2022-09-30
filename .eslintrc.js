module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'es2021': true,
        'node': true
    },
    'extends': 'eslint:recommended',
    'overrides': [
    ],
    'parserOptions': {
        'ecmaVersion': 'latest'
    },
    'rules': {
        'indent': [ 'off' ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [ 'off' ],
        'semi': [ 'off' ],
        'no-unused-vars': [ 'off' ],
    }
};
