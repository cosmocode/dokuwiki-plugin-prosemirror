import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import MenuItem from '../MenuItem';
import LinkForm from '../../../nodeviews/LinkForm';
import { svgIcon } from '../MDI';

export default class LinkMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable({ nodes }) {
        return !!nodes.link;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Link node not available in schema!');
        }
        return new MenuItem({
            command: (state, dispatch) => {
                const { $from } = state.selection;

                const index = $from.index();
                if (!$from.parent.canReplaceWith(index, index, schema.nodes.link)) {
                    return false;
                }

                if (dispatch) {
                    let textContent = '';
                    state.selection.content().content.descendants((node) => {
                        textContent += node.textContent;
                        return false;
                    });
                    const linkForm = new LinkForm();
                    linkForm.setLinkType('internallink');
                    if (textContent) {
                        linkForm.setLinkTarget(false, textContent);
                        linkForm.setLinkNameType('custom', textContent);
                    }

                    linkForm.on('submit', LinkForm.resolveSubmittedLinkData(
                        linkForm,
                        {},
                        (newAttrs) => {
                            const linkNode = schema.nodes.link.create(newAttrs);
                            dispatch(state.tr.replaceSelectionWith(linkNode));
                            linkForm.off('submit');
                            linkForm.hide();
                            linkForm.resetForm();
                        },
                    ));
                    linkForm.show();
                }
                return true;
            },
            icon: svgIcon('link-variant'),
            label: 'Insert Link',
        });
    }
}
