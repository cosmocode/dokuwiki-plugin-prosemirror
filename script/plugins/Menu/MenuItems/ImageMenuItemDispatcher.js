import AbstractMenuItemDispatcher from './AbstractMenuItemDispatcher';
import MediaForm from '../../../nodeviews/MediaForm';
import MenuItem from '../MenuItem';
import { svgIcon } from '../MDI';

export default class ImageMenuItemDispatcher extends AbstractMenuItemDispatcher {
    static isAvailable(schema) {
        return !!schema.nodes.image;
    }

    static getMenuItem(schema) {
        if (!this.isAvailable(schema)) {
            throw new Error('Image is missing in provided Schema!');
        }
        return new MenuItem({
            command: (state, dispatch) => {
                const { $from } = state.selection;

                const index = $from.index();
                if (!$from.parent.canReplaceWith(index, index, schema.nodes.image)) {
                    return false;
                }
                if (dispatch) {
                    let textContent = '';
                    state.selection.content().content.descendants((node) => {
                        textContent += node.textContent;
                        return false;
                    });

                    const mediaForm = new MediaForm();
                    if (textContent) {
                        mediaForm.setCaption(textContent);
                        mediaForm.setSource(textContent);
                    }

                    mediaForm.show();

                    mediaForm.on('submit', MediaForm.resolveSubmittedLinkData(
                        {},
                        mediaForm,
                        (newAttrs) => {
                            dispatch(state.tr.replaceSelectionWith(schema.nodes.image.create(newAttrs)));
                            mediaForm.off('submit');
                            mediaForm.hide();
                            mediaForm.resetForm();
                        },
                    ));
                }
                return true;
            },
            icon: svgIcon('image'),
            label: LANG.plugins.prosemirror['label:image'],
        });
    }
}
