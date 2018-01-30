<?php

namespace dokuwiki\plugin\prosemirror\parser;


class EmailLinkNode extends LinkNode
{

    public function toSyntax()
    {
        list(, $href) = explode(':', $this->attrs['href'], 2);

        return $this->getDefaultLinkSyntax($href, $href);
    }
}
