import { insertParagraphAtPos } from '../customCommands';

/**
 * @param {function} getView function that returns the current EditorView
 * @param {string}   direction should be either 'before' or 'after'
 * @return HTMLElement
 */
function getInsertParagraphButton(getView, direction) {
    if (typeof jQuery === 'undefined') {
        // early return during js schema testing
        return null;
    }

    function dispatchInsertingParagraph(event) {
        event.preventDefault();
        event.stopPropagation();
        const view = getView();
        const pos = view.posAtDOM(event.target.parentNode);
        const command = insertParagraphAtPos(pos, direction);
        command(view.state, view.dispatch);
    }

    const $paragraphButton = jQuery('<button>');
    $paragraphButton.css('visibility', 'hidden');
    $paragraphButton.on('click', dispatchInsertingParagraph);
    $paragraphButton.text('Add paragraph');
    const $buttonWrapper = jQuery('<div>').append($paragraphButton);
    $buttonWrapper.on('mouseleave', () => {
        $paragraphButton.css('visibility', 'hidden');
    });
    $buttonWrapper.on('mouseenter', (event) => {
        const view = getView();
        const pos = view.posAtDOM(event.target.parentNode);
        const command = insertParagraphAtPos(pos, direction);
        if (command(view.state)) {
            $paragraphButton.css('visibility', 'visible');
        }
    });

    return $buttonWrapper.get(0);
}

/**
 * Returns a DOM.Node for a div with a button to insert a new paragraph before the node to which it is attached
 *
 * This button has functionality to only appear when it is actually available
 *
 * @param {function} getView function that returns the current EditorView
 * @return HTMLElement
 */
export function getInsertParagraphBeforeButton(getView) {
    return getInsertParagraphButton(getView, 'before');
}

/**
 * Returns a DOM.Node for a div with a button to insert a new paragraph after the node to which it is attached
 *
 * This button has functionality to only appear when it is actually available
 *
 * @param {function} getView function that returns the current EditorView
 * @return HTMLElement
 */
export function getInsertParagraphAfterButton(getView) {
    return getInsertParagraphButton(getView, 'after');
}
