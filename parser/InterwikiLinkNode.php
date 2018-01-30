<?php

namespace dokuwiki\plugin\prosemirror\parser;

class InterwikiLinkNode extends LinkNode {

    public function toSyntax() {
        $inner = $this->attrs['data-shortcut'];
        $inner .= '>';
        $reference = $this->attrs['data-reference'];
        $inner .= $reference;

        return $this->getDefaultLinkSyntax($inner, $reference);
    }
}
