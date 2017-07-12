jQuery(() => {
    jQuery('#dw__editform').find('[name=prosemirror_json]').attr('id', 'prosemirror_json');
    /* DOKUWIKI:include lib/bundle.js */

    jQuery('#wiki__text').hide();
    jQuery('.editBox > .toolbar').hide();
});
