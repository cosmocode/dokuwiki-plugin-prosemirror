jQuery(() => {

    jQuery('.plugin_prosemirror_useWYSIWYG').on('click', function() {
        const $current = DokuCookie.getValue('plugin_prosemirror_useWYSIWYG');
        DokuCookie.setValue('plugin_prosemirror_useWYSIWYG', $current ? '' : '1');
    });

    const $jsonField = jQuery('#dw__editform').find('[name=prosemirror_json]');
    if (!$jsonField.length) {
        return;
    }
    $jsonField.attr('id', 'prosemirror_json');
    /* DOKUWIKI:include lib/bundle.js */

    jQuery('#wiki__text').hide();
    jQuery('.editBox > .toolbar').hide();
});
