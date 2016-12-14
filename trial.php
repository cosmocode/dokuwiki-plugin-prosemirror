<!doctype html>
<meta charset="utf8">
<link rel="stylesheet" href="node_modules/prosemirror-view/style/prosemirror.css">
<link rel="stylesheet" href="node_modules/prosemirror-menu/style/menu.css">




<body>


<div id="editor"></div>


<textarea id="jsof">{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"asfdasfa as as "},{"type":"text","marks":[{"type":"strong"}],"text":"asf"},{"type":"text","text":" asf asf "},{"type":"text","marks":[{"type":"link","attrs":{"href":"https://www.splitbrain.org","title":"test"}}],"text":"asfda"}]},{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"gfggfsgsf"}]},{"type":"horizontal_rule"},{"type":"ordered_list","attrs":{"order":1},"content":[{"type":"list_item","content":[{"type":"paragraph","content":[{"type":"text","text":"tstetwtrwew"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"gsfds"},{"type":"text","marks":[{"type":"em"},{"type":"strong"}],"text":"dg"},{"type":"text","text":"sdgs sgsdgsdgsdgf"}]}]}</textarea>


<textarea id="json"><?php
if(!defined('DOKU_INC')) define('DOKU_INC',dirname(__FILE__).'/../../../');
require_once(DOKU_INC.'inc/init.php');

$doc = p_cached_output(wikiFN('wiki:syntax'), 'prosemirror', 'wiki:syntax');
echo $doc;
?></textarea>

<script src="script.js"></script>
</body>
