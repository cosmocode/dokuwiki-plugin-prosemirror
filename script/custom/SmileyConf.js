export default class SmileyConf {
    static getSmileys() {
        return JSINFO.SMILEY_CONF;
    }

    /**
     * Regex escape as recommended by MDN
     *
     * @param {string} string
     * @returns {string}
     */
    static escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    /**
     * Build Regex from conf
     *
     * Similar to DokuWiki parser but without lookbehind (currently supported only by Chrome)
     * @see \Doku_Parser_Mode_smiley
     *
     * @returns {RegExp}
     */
    static getRegex() {
        const smileyGroups = Object.keys(this.getSmileys())
            .map(smiley => SmileyConf.escapeRegExp(smiley));
        return new RegExp(`(?:\\W|^)(${smileyGroups.join('|')})(?=\\W|$)`);
    }
}
