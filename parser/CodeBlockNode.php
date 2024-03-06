<?php

namespace dokuwiki\plugin\prosemirror\parser;

class CodeBlockNode extends Node
{

    protected $parent;
    protected $data;

    public function __construct($data, Node $parent)
    {
        $this->parent = &$parent;
        $this->data = $data;
    }

    public function toSyntax()
    {
// 555
		$TAG = $this->data['attrs'];
        $openingTag = '<code';
        if (!empty($TAG['data-language'])) {
            $openingTag .= ' ' . $TAG['data-language'];
        } else {
            $openingTag .= ' -';
        }
        if (!empty($TAG['data-filename'])) {
            $openingTag .= ' ' . $TAG['data-filename'];
        }
		$extraTag = '';
		if (isset($TAG['data-sln-old']))
		{
			$sln_old = $TAG['data-sln-old'];
			if (is_numeric($sln_old))
			{
				$sln_old = (int) $sln_old;
			}
			else
			{
				$sln_old = 1;
			}
		}
		if (isset($TAG['data-sln']))
		{
			$start_line_numbers_at = $TAG['data-sln'];
			if (is_numeric($start_line_numbers_at))
			{
				$start_line_numbers_at = (int) $start_line_numbers_at;
				if (!$extraTag) $extraTag = '[';
				if ($start_line_numbers_at > 0) 
					$extraTag .= 'enable_line_numbers="true", ';
				else
					$extraTag .= 'enable_line_numbers="false", ';
				$extraTag .= 'start_line_numbers_at="' . abs($start_line_numbers_at) .'"';
			}
			else
			{
				$extraTag = '[enable_line_numbers="false"';
			}
		}
		if (isset($TAG['data-hle']))
		{
			$highlight_lines_extra = $TAG['data-hle'];
			$arr = explode(',', $highlight_lines_extra);
			$str = '';
			foreach($arr as $val)
			{
				if ($str) $str .= ',';
				if (is_numeric($val)) 
				{	
					$ival = (int) $val;
					if ($sln_old > 0 && $ival > 0)
						$str .= $ival - $sln_old + 1;
					else
						$str .= abs($ival);
				}
			}
			if ($str)
			{
				if (!$extraTag)
					$extraTag = '[';
				else 
					$extraTag .= ', ';
				$extraTag .= 'highlight_lines_extra="' . $str . '"]';
			}
			elseif ($extraTag) $extraTag .= ']';
		}
		if ($extraTag) $openingTag .= ' ' . $extraTag;
// 555---
        $openingTag .= '>';
        return $openingTag . "\n" . $this->data['content'][0]['text'] . "\n</code>";
    }
}
