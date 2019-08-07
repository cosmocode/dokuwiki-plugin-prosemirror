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
     * Regex from conf
     *
     * @returns {RegExp}
     */
    static getRegex() {
        const smileyGroups = this.getSmileys().map(smiley => `(${SmileyConf.escapeRegExp(smiley.syntax)})`);
        const regexstring = smileyGroups.join('|');
        return new RegExp(regexstring);
    }
}
