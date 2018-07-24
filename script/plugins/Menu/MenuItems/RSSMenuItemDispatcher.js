import { setBlockTypeNoAttrCheck } from '../../../customCommands';
import RSSView from '../../../nodeviews/RSSView';
import MenuItem from '../MenuItem';
import KeyValueForm from '../../../nodeviews/KeyValueForm';
import { svgIcon } from '../MDI';
import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';

class RSSMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable({ nodes }) {
        return !!nodes.rss;
    }

    static getMenuItem({ nodes }) {
        if (!nodes.rss) {
            throw new Error('Node type RSS is missing in Schema!');
        }
        return new MenuItem({
            command: (state, dispatch) => {
                if (!setBlockTypeNoAttrCheck(nodes.rss)(state)) {
                    return false;
                }
                if (dispatch) {
                    const rssForm = new KeyValueForm(
                        'New RSS feed',
                        RSSView.getFields(Object.entries(nodes.rss.attrs).reduce((acc, [name, value]) => {
                            acc[name] = value.default;
                            return acc;
                        }, {})),
                    );
                    rssForm.show();
                    rssForm.on('submit', (event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        const attrs = rssForm.$form.serializeArray().reduce((acc, { name, value }) => {
                            acc[name] = value;
                            return acc;
                        }, {});

                        dispatch(state.tr.replaceSelectionWith(nodes.rss.create(attrs)));
                        rssForm.destroy();
                    });
                }
                return true;
            },
            icon: svgIcon('rss'),
            label: 'Add new RSS feed',
        });
    }
}

export default RSSMenuItemDispatcher;
