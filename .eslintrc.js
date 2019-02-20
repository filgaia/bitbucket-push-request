module.exports = {
    "env": {
        "browser": true,
        "node": true
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "extends": "eslint:recommended",
    "globals": {
        "appRoot": false
    },
    "rules": {
        "no-console": 0,
        "no-unused-vars": 1,
        "semi": ["error", "always"],
        "eol-last": ["error", "always"],
        "indent": [
            "error",
            4,
            { "SwitchCase": 1 }
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single",
            { "allowTemplateLiterals": true }
        ]
    }
};
