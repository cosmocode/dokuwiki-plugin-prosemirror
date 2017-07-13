<!doctype html>
<html>
<header>
    <meta charset="utf8">
    <link rel="stylesheet" href="node_modules/prosemirror-view/style/prosemirror.css">
    <link rel="stylesheet" href="node_modules/prosemirror-menu/style/menu.css">
</header>
<body>


<div id="prosemirror__editor"></div>


<textarea id="prosemirror_json" style="width: 100%; height: 300px"><?php
    if(!defined('DOKU_INC')) define('DOKU_INC', dirname(__FILE__) . '/../../../');
    require_once(DOKU_INC . 'inc/init.php');
    global $INPUT;
    $id = $INPUT->str('id','wiki:syntax');
    $doc = p_cached_output(wikiFN($id), 'prosemirror', $id);
    echo $doc;
    ?></textarea>

<script src="lib/bundle.js"></script>
<pre><?php print_r(p_get_instructions(io_readWikiPage(wikiFN($id),$id))) ?></pre>
</body>
</html>
