export default class SmileyConf {
    static getRegex() {
        return /(8-\))|(8-0)|(:-\()|(:-\))|(;-\))|(\^_\^)|(:\?:)|(LOL)|(FIXME)|(DELETEME)$/;
    }

    static getFilename(syntax) {
        console.log(syntax);
        let icon;
        switch (syntax) {
        case '8-)':
            icon = 'icon_cool.gif';
            break;
        case '8-O':
            icon = 'icon_eek.gif';
            break;
        case ':-(':
            icon = 'icon_sad.gif';
            break;
        case ':-)':
            icon = 'icon_smile.gif';
            break;
        case ';-)':
            icon = 'icon_wink.gif';
            break;
        case '^_^':
            icon = 'icon_fun.gif';
            break;
        case ':?:':
            icon = 'icon_question.gif';
            break;
        case 'LOL':
            icon = 'icon_lol.gif';
            break;
        case 'FIXME':
            icon = 'fixme.gif';
            break;
        case 'DELETEME':
            icon = 'delete.gif';
            break;
        default:
            icon = '';
        }
        return icon;
    }
}
