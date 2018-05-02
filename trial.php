<!doctype html>
<html>
<header>
    <meta charset="utf8">
    <link rel="stylesheet" href="node_modules/prosemirror-view/style/prosemirror.css">
    <link rel="stylesheet" href="node_modules/prosemirror-menu/style/menu.css">
    <link rel="stylesheet" href="trial.css">
    <script type="text/javascript" charset="utf-8"
            src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <script type="text/javascript" charset="utf-8"
            src="https://cdnjs.cloudflare.com/ajax/libs/jquery-migrate/3.0.0/jquery-migrate.min.js"></script>
    <script type="text/javascript" charset="utf-8"
            src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
</header>
<body>


<div id="prosemirror__editor"></div>


<textarea id="prosemirror_json" style="width: 100%; height: 300px">
    <?php
    if (!defined('DOKU_INC')) {
        define('DOKU_INC', dirname(__FILE__) . '/../../../');
    }
    require_once(DOKU_INC . 'inc/init.php');
    global $INPUT;
    $id = $INPUT->str('id', 'wiki:syntax');
    $doc = p_cached_output(wikiFN($id), 'prosemirror', $id);
    echo $doc;
    ?>
</textarea>

<script src="lib/bundle.js"></script>
<pre><?php print_r(p_get_instructions(io_readWikiPage(wikiFN($id), $id))) ?></pre>
<form class="plugin_prosemirror_linkform" id="prosemirror-linkform">
    <fieldset>
        <label for="prosemirror-linktarget-input">Link target</label>
        <input type="text" id="prosemirror-linktarget-input"/>
        <label for="prosemirror-linkname-input">Link name</label>
        <input type="text" id="prosemirror-linkname-input" placeholder="(automatic)"/>
        <button type="submit" class="plugin_prosemirror_linkform__ok_button" name="ok-button">OK</button>
        <button type="button" class="plugin_prosemirror_linkform__cancel_button" name="cancel-button">Cancel</button>
    </fieldset>
</form>
</body>
</html>
