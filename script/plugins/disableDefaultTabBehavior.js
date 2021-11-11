import { Plugin } from 'prosemirror-state';

/**
 * Disable the browser's default behavior on tab, which is required to support indentation using Tab/Shift-Tab
 */
export function disableDefaultTabBehavior() {
    function preventTab(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    let setupComplete = false;

    return new Plugin({
        view: () => ({
            update: () => {
                if (setupComplete) return;

                window.addEventListener('keydown', preventTab);
                setupComplete = true;
            },
            destroy: () => {
                window.removeEventListener('keydown', preventTab);
            },
        }),
    });
}

export default disableDefaultTabBehavior;
