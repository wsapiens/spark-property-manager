module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'es2021': true,
        'node': true,
        'jquery': true
    },
    'extends': 'eslint:recommended',
    'overrides': [
        {
            'files': ['public/javascripts/*.js', 'test/*.js'],
            'rules': {
                "no-undef": 'off'
            }
        }
    ],
    'parserOptions': {
        'ecmaVersion': 'latest'
    },
    'rules': {
        'indent': 'off' ,
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': 'off',
        'semi': 'off',
        'no-unused-vars': 'off'
    }
};
