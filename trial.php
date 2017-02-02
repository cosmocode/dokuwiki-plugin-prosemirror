<!doctype html>
<meta charset="utf8">
<header>
    <link rel="stylesheet" href="node_modules/prosemirror-view/style/prosemirror.css">
    <link rel="stylesheet" href="node_modules/prosemirror-menu/style/menu.css">
</header>
<body>


<div id="editor"></div>


<textarea id="json" style="width: 100%; height: 300px"><?php
    if(!defined('DOKU_INC')) define('DOKU_INC', dirname(__FILE__) . '/../../../');
    require_once(DOKU_INC . 'inc/init.php');
    global $INPUT;
    $id = $INPUT->str(id,'wiki:syntax');
    $doc = p_cached_output(wikiFN($id), 'prosemirror', 'wiki:syntax');
    echo $doc;
    ?></textarea>

<script src="load.js"></script>
</body>
