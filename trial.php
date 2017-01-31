<!doctype html>
<meta charset="utf8">
<link rel="stylesheet" href="node_modules/prosemirror-view/style/prosemirror.css">
<link rel="stylesheet" href="node_modules/prosemirror-menu/style/menu.css">




<body>


<div id="editor"></div>


<textarea id="json" style="width: 100%; height: 300px"><?php
if(!defined('DOKU_INC')) define('DOKU_INC',dirname(__FILE__).'/../../../');
require_once(DOKU_INC.'inc/init.php');

$doc = p_cached_output(wikiFN('wiki:syntax'), 'prosemirror', 'wiki:syntax');
echo $doc;
?></textarea>

<script src="load.js"></script>
</body>
