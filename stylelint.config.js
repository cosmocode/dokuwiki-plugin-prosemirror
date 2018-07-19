const config = {
    "extends": [
        "stylelint-config-standard",
        "stylelint-config-rational-order",
    ],
    "rules": {
        "indentation": 4,
        "declaration-colon-newline-after": null, // conflicts with IDEA's auto reformatting
    }
};

module.exports = config;
