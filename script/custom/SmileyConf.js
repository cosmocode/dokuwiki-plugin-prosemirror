export default class SmileyConf {
    static getSmileys() {
        return [
            {
                syntax: '8-)',
                icon: 'icon_cool.gif',
            },
            {
                syntax: '8-O',
                icon: 'icon_eek.gif',
            },
            {
                syntax: '8-o',
                icon: 'icon_eek.gif',
            },
            {
                syntax: ':-(',
                icon: 'icon_sad.gif',
            },
            {
                syntax: ':-)',
                icon: 'icon_smile.gif',
            },
            {
                syntax: '=)',
                icon: 'icon_smile2.gif',
            },
            {
                syntax: ':-/',
                icon: 'icon_doubt.gif',
            },
            {
                syntax: ':-\\',
                icon: 'icon_doubt2.gif',
            },
            {
                syntax: ':-?',
                icon: 'icon_confused.gif',
            },
            {
                syntax: ':-D',
                icon: 'icon_biggrin.gif',
            },
            {
                syntax: ':-P',
                icon: 'icon_razz.gif',
            },
            {
                syntax: ':-o',
                icon: 'icon_surprised.gif',
            },
            {
                syntax: ':-O',
                icon: 'icon_surprised.gif',
            },
            {
                syntax: ':-x',
                icon: 'icon_silenced.gif',
            },
            {
                syntax: ':-X',
                icon: 'icon_silenced.gif',
            },
            {
                syntax: ':-|',
                icon: 'icon_neutral.gif',
            },
            {
                syntax: ';-)',
                icon: 'icon_wink.gif',
            },
            {
                syntax: 'm(',
                icon: 'facepalm.gif',
            },
            {
                syntax: '^_^',
                icon: 'icon_fun.gif',
            },
            {
                syntax: ':?:',
                icon: 'icon_question.gif',
            },
            {
                syntax: ':!:',
                icon: 'icon_exclaim.gif',
            },
            {
                syntax: 'LOL',
                icon: 'icon_lol.gif',
            },
            {
                syntax: 'FIXME',
                icon: 'fixme.gif',
            },
            {
                syntax: 'DELETEME',
                icon: 'delete.gif',
            },
        ];
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
        return new RegExp(`${regexstring}`);
    }
}
