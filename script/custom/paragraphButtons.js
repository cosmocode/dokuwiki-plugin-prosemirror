import { insertParagraphAtPos } from '../customCommands';

/**
 * Attach event handler to buttons for inserting a paragraph
 *
 * @return {void}
 */
export function initializeButtons() {
    if (window.Prosemirror.paragraphHandlingIsInitialized) {
        return;
    }
    window.Prosemirror.paragraphHandlingIsInitialized = true;
    jQuery(document).on('click', '.ProseMirror button.addParagraphButton', function insertParagraph(event) {
        event.stopPropagation();
        event.preventDefault();
        const $button = jQuery(this);
        const viewID = $button.data('viewid');
        const direction = $button.data('direction');
        const view = window.Prosemirror.views[viewID];

        const pos = view.posAtDOM(event.target.parentNode);
        const command = insertParagraphAtPos(pos, direction);
        command(view.state, view.dispatch);
    });
}

/**
 * Produce the spec for a button to insert a paragraph before or after the respective element
 *
 * @param viewID
 * @param direction
 * @return {array}
 */
export function getButtonSpec(viewID, direction) {
    if (typeof LANG === 'undefined') {
        // early return during js schema testing
        return [];
    }
    return [
        'button',
        {
            class: 'addParagraphButton',
            type: 'button',
            'data-direction': direction,
            'data-viewid': viewID,
        },
        LANG.plugins.prosemirror['button:insert paragraph'],
    ];
}
