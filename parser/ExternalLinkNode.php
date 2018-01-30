<?php

namespace dokuwiki\plugin\prosemirror\parser;


class ExternalLinkNode extends LinkNode
{

    public function toSyntax()
    {
        $href = $this->attrs['href'];

        return $this->getDefaultLinkSyntax($href, $href);
    }
}
