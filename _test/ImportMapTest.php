<?php

namespace dokuwiki\plugin\prosemirror\test;

use DokuWikiTest;
use TestRequest;

/**
 * Tests for the import map and the modulepreload links of the editor modules
 *
 * @group plugin_prosemirror
 * @group plugins
 */
class ImportMapTest extends DokuWikiTest
{
    protected $pluginsEnabled = ['prosemirror'];

    /**
     * All files the browser loads as modules, relative to the plugin directory
     *
     * @return string[]
     */
    protected function getModuleFiles(): array
    {
        $files = array_merge($this->getJsFiles('script'), $this->getJsFiles('vendor'));
        sort($files);
        return $files;
    }

    /**
     * All `.js` files in a directory of the plugin, recursively
     *
     * @param string $subdir directory relative to the plugin directory
     * @return string[] paths relative to the plugin directory
     */
    protected function getJsFiles(string $subdir): array
    {
        $dir = DOKU_PLUGIN . 'prosemirror/';
        $files = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir . $subdir, \FilesystemIterator::SKIP_DOTS)
        );
        foreach ($iterator as $file) {
            if ($file->getExtension() === 'js') {
                $files[] = substr($file->getPathname(), strlen($dir));
            }
        }
        return $files;
    }

    /**
     * The edit page maps every module to a versioned URL and preloads it, after the map
     */
    public function testEditPage(): void
    {
        saveWikiText('importmap', 'text', 'created');
        $response = (new TestRequest())->get(['id' => 'importmap', 'do' => 'edit']);
        $html = $response->getContent();

        $this->assertSame(1, preg_match_all('/<script type="importmap"[^>]*>(.*?)<\/script>/s', $html, $m));
        $map = json_decode($m[1][0], true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame(['imports'], array_keys($map));

        $base = DOKU_BASE . 'lib/plugins/prosemirror/';
        $expected = [];
        foreach ($this->getModuleFiles() as $file) {
            $mtime = filemtime(DOKU_PLUGIN . 'prosemirror/' . $file);
            $expected[$base . $file] = $base . $file . '?v=' . $mtime;
        }
        $this->assertContains($base . 'script/main.js', array_keys($map['imports']));
        $this->assertEquals($expected, $map['imports']);

        preg_match_all('/<link rel="modulepreload" href="([^"]*)"/', $html, $preloads);
        $this->assertEquals(array_values($expected), array_map('htmlspecialchars_decode', $preloads[1]));

        // the map must come before every module request, including the preloads and js.php
        $mapPos = strpos($html, '<script type="importmap"');
        $this->assertLessThan(strpos($html, 'rel="modulepreload"'), $mapPos);
        $this->assertLessThan(strpos($html, 'lib/exe/js.php'), $mapPos);
    }

    /**
     * Every module the browser can reach from script/main.js is in the import map, and vendor/
     * holds only such modules
     *
     * Follows the relative imports (static, re-exports and string-literal `import()`). A module
     * missing from the map would load unversioned and stay cached, e.g. one added outside
     * script/ and vendor/. A file in vendor/ that no module imports would be mapped and
     * preloaded on every edit page; build tools belong in _jsbuild/.
     */
    public function testMapCoversImportGraph(): void
    {
        $plugin = plugin_load('action', 'prosemirror_editor');
        $map = $this->callInaccessibleMethod($plugin, 'getVersionedModuleUrls', []);
        $base = DOKU_BASE . 'lib/plugins/prosemirror/';
        $dir = DOKU_PLUGIN . 'prosemirror/';

        $todo = ['script/main.js'];
        $seen = [];
        while ($todo) {
            $file = array_pop($todo);
            if (isset($seen[$file])) continue;
            $seen[$file] = true;

            $this->assertFileExists($dir . $file);
            $this->assertArrayHasKey($base . $file, $map, "$file is loaded by the browser but not in the import map");

            preg_match_all(
                '/(?:\bfrom|\bimport)\s*\(?\s*([\'"])(\.\.?\/[^\'"]+)\1/',
                file_get_contents($dir . $file),
                $matches
            );
            foreach ($matches[2] as $specifier) {
                $todo[] = $this->resolvePath(dirname($file) . '/' . $specifier);
            }
        }

        foreach ($this->getJsFiles('vendor') as $file) {
            $this->assertArrayHasKey(
                $file,
                $seen,
                "$file is not imported by the editor modules; build tools belong in _jsbuild/"
            );
        }
    }

    /**
     * Remove `.` and `..` segments from a relative path
     *
     * @param string $path e.g. `script/nodeviews/../schema.js`
     * @return string e.g. `script/schema.js`
     */
    protected function resolvePath(string $path): string
    {
        $parts = [];
        foreach (explode('/', $path) as $part) {
            if ($part === '.' || $part === '') continue;
            if ($part === '..') {
                array_pop($parts);
            } else {
                $parts[] = $part;
            }
        }
        return implode('/', $parts);
    }

    /**
     * Pages without the editor get neither the map nor the preloads
     */
    public function testShowPage(): void
    {
        saveWikiText('importmap', 'text', 'created');
        $html = (new TestRequest())->get(['id' => 'importmap'])->getContent();

        $this->assertStringNotContainsString('<script type="importmap"', $html);
        $this->assertStringNotContainsString('modulepreload', $html);
    }

    /**
     * Editing something other than a section (e.g. a table with the edittable plugin) has no editor
     */
    public function testOtherEditTarget(): void
    {
        saveWikiText('importmap', 'text', 'created');
        $html = (new TestRequest())->get(['id' => 'importmap', 'do' => 'edit', 'target' => 'table'])->getContent();

        $this->assertStringNotContainsString('<script type="importmap"', $html);
        $this->assertStringNotContainsString('modulepreload', $html);
    }
}
