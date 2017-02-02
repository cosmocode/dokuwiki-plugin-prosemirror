module.exports = {
    "extends": "airbnb-base",
    "plugins": [
        "import"
    ],
    "env": {
        "browser": true,
    },
    "rules": {
        "indent": ["error", 4],
        "no-magic-numbers": ["warn", { "ignore": [0, 1]}],
    },
};
