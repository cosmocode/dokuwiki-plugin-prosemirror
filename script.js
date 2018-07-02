/**
 * Hide Prosemirror and show the default editor
 *
 * @param {string} text the wiki syntax to be shown in the textarea
 */
function showDefaultEditor(text) {
    window.Prosemirror.destroyProsemirror();
    window.proseMirrorIsActive = false;
    dw_locktimer.init(dw_locktimer.timeout/1000, dw_locktimer.draft);
    jQuery('#wiki__text').val(text).show();
    jQuery('#size__ctl').show();
    jQuery('.editBox > .toolbar').show();
}

/**
 * Hide the default editor and start a new Prosemirror Editor
 *
 * @param {string} json the prosemirror document json
 */
function showProsemirror(json) {
    const $textArea = jQuery('#wiki__text');
    const $prosemirrorJsonInput = jQuery('#dw__editform').find('[name=prosemirror_json]').val(json);
    try {
        window.Prosemirror.enableProsemirror();
    } catch (e) {
        console.error(e);
        let message = 'There was an error in the WYSIWYG editor. You will be redirected to the syntax editor in 5 seconds.';
        if (window.SentryPlugin) {
            SentryPlugin.logSentryException(e, {
                tags: {
                    plugin: 'prosemirror',
                    'id': JSINFO.id,
                },
                extra: {
                    'content': $textArea.val(),
                    'json': $prosemirrorJsonInput.val(),
                }
            });
            message += ' The error has been logged to sentry.';
        }
        showErrorMessage(message);
        setTimeout(function() {
            jQuery('.plugin_prosemirror_useWYSIWYG').click();
        }, 5000);
    }
    window.proseMirrorIsActive = true;
    $textArea.hide();
    jQuery('#size__ctl').hide();
    jQuery('.editBox > .toolbar').hide();

    if (dw_locktimer.addField) {
        // todo remove this guard after the next stable DokuWiki release after Greebo
        dw_locktimer.init(dw_locktimer.timeout/1000, dw_locktimer.draft, 'prosemirror__editor');
        dw_locktimer.addField('input[name=prosemirror_json]');
    } else {
        console.warn('Draft saving in WYSIWYG is not available. Please upgrade your wiki to the current development snapshot.')
    }
}

/**
 * Initialize the prosemirror framework
 *
 * (This shouldn't do much until we actually use the editor, but we maybe shouldn't do this twice)
 */
function initializeProsemirror() {
    try {
        /* DOKUWIKI:include lib/bundle.js */
    } catch (e) {
        const $textArea = jQuery('#wiki__text');
        console.error(e);
        let message = 'There was an error initializing the WYSIWYG editor.';
        if (window.SentryPlugin) {
            SentryPlugin.logSentryException(e, {
                tags: {
                    plugin: 'prosemirror',
                    'id': JSINFO.id,
                },
                extra: {
                    'content': $textArea.val(),
                }
            });
            message += ' The error has been logged to sentry.';
        }

        showErrorMessage(message);

        DokuCookie.setValue('plugin_prosemirror_useWYSIWYG', '');
    }
}

/**
 * Add the error message above the editor
 *
 * @param {string} errorMsg
 */
function showErrorMessage(errorMsg) {
    jQuery('#draft__status').after(
        jQuery('<div class="error"></div>').text(errorMsg)
    );
}

jQuery(function () {
    window.proseMirrorIsActive = false;
    const $jsonField = jQuery('#dw__editform').find('[name=prosemirror_json]');
    if (!$jsonField.length) {
        // this is not an edit session
        return;
    }

    const $toggleEditorButton = jQuery('.plugin_prosemirror_useWYSIWYG');
    $toggleEditorButton.on('click', function() {
        const $textArea = jQuery('#wiki__text');
        jQuery.post(DOKU_BASE + 'lib/exe/ajax.php', {
            call: 'plugin_prosemirror_switch_editors',
            data: window.proseMirrorIsActive ? $jsonField.val() : $textArea.val(),
            getJSON: window.proseMirrorIsActive ? '0' : '1',
        }).done(function handleSwitchEditorResponse(data) {
            if (window.proseMirrorIsActive) {
                showDefaultEditor(data.text);
            } else {
                showProsemirror(data.json);
            }
        }).fail(function (jqXHR) {
            console.error(jqXHR); // FIXME: proper error handling
        });

        const $current = DokuCookie.getValue('plugin_prosemirror_useWYSIWYG');
        DokuCookie.setValue('plugin_prosemirror_useWYSIWYG', $current ? '' : '1');
    });

    initializeProsemirror();

    if (DokuCookie.getValue('plugin_prosemirror_useWYSIWYG')) {
        showProsemirror($jsonField.val());
    }
});
