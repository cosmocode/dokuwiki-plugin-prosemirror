(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//Copyright (C) 2012 Kory Nunn

//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/*

    This code is not formatted for readability, but rather run-speed and to assist compilers.

    However, the code's intention should be transparent.

    *** IE SUPPORT ***

    If you require this library to work in IE7, add the following after declaring crel.

    var testDiv = document.createElement('div'),
        testLabel = document.createElement('label');

    testDiv.setAttribute('class', 'a');
    testDiv['className'] !== 'a' ? crel.attrMap['class'] = 'className':undefined;
    testDiv.setAttribute('name','a');
    testDiv['name'] !== 'a' ? crel.attrMap['name'] = function(element, value){
        element.id = value;
    }:undefined;


    testLabel.setAttribute('for', 'a');
    testLabel['htmlFor'] !== 'a' ? crel.attrMap['for'] = 'htmlFor':undefined;



*/

(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.crel = factory();
    }
}(this, function () {
    var fn = 'function',
        obj = 'object',
        nodeType = 'nodeType',
        textContent = 'textContent',
        setAttribute = 'setAttribute',
        attrMapString = 'attrMap',
        isNodeString = 'isNode',
        isElementString = 'isElement',
        d = typeof document === obj ? document : {},
        isType = function(a, type){
            return typeof a === type;
        },
        isNode = typeof Node === fn ? function (object) {
            return object instanceof Node;
        } :
        // in IE <= 8 Node is an object, obviously..
        function(object){
            return object &&
                isType(object, obj) &&
                (nodeType in object) &&
                isType(object.ownerDocument,obj);
        },
        isElement = function (object) {
            return crel[isNodeString](object) && object[nodeType] === 1;
        },
        isArray = function(a){
            return a instanceof Array;
        },
        appendChild = function(element, child) {
          if(!crel[isNodeString](child)){
              child = d.createTextNode(child);
          }
          element.appendChild(child);
        };


    function crel(){
        var args = arguments, //Note: assigned to a variable to assist compilers. Saves about 40 bytes in closure compiler. Has negligable effect on performance.
            element = args[0],
            child,
            settings = args[1],
            childIndex = 2,
            argumentsLength = args.length,
            attributeMap = crel[attrMapString];

        element = crel[isElementString](element) ? element : d.createElement(element);
        // shortcut
        if(argumentsLength === 1){
            return element;
        }

        if(!isType(settings,obj) || crel[isNodeString](settings) || isArray(settings)) {
            --childIndex;
            settings = null;
        }

        // shortcut if there is only one child that is a string
        if((argumentsLength - childIndex) === 1 && isType(args[childIndex], 'string') && element[textContent] !== undefined){
            element[textContent] = args[childIndex];
        }else{
            for(; childIndex < argumentsLength; ++childIndex){
                child = args[childIndex];

                if(child == null){
                    continue;
                }

                if (isArray(child)) {
                  for (var i=0; i < child.length; ++i) {
                    appendChild(element, child[i]);
                  }
                } else {
                  appendChild(element, child);
                }
            }
        }

        for(var key in settings){
            if(!attributeMap[key]){
                element[setAttribute](key, settings[key]);
            }else{
                var attr = attributeMap[key];
                if(typeof attr === fn){
                    attr(element, settings[key]);
                }else{
                    element[setAttribute](attr, settings[key]);
                }
            }
        }

        return element;
    }

    // Used for mapping one kind of attribute to the supported version of that in bad browsers.
    crel[attrMapString] = {};

    crel[isElementString] = isElement;

    crel[isNodeString] = isNode;

    if(typeof Proxy !== 'undefined'){
        crel.proxy = new Proxy(crel, {
            get: function(target, key){
                !(key in crel) && (crel[key] = crel.bind(null, key));
                return crel[key];
            }
        });
    }

    return crel;
}));

},{}],2:[function(require,module,exports){
// ::- Persistent data structure representing an ordered mapping from
// strings to values, with some convenient update methods.
function OrderedMap(content) {
  this.content = content
}

OrderedMap.prototype = {
  constructor: OrderedMap,

  find: function(key) {
    for (var i = 0; i < this.content.length; i += 2)
      if (this.content[i] === key) return i
    return -1
  },

  // :: (string) → ?any
  // Retrieve the value stored under `key`, or return undefined when
  // no such key exists.
  get: function(key) {
    var found = this.find(key)
    return found == -1 ? undefined : this.content[found + 1]
  },

  // :: (string, any, ?string) → OrderedMap
  // Create a new map by replacing the value of `key` with a new
  // value, or adding a binding to the end of the map. If `newKey` is
  // given, the key of the binding will be replaced with that key.
  update: function(key, value, newKey) {
    var self = newKey && newKey != key ? this.remove(newKey) : this
    var found = self.find(key), content = self.content.slice()
    if (found == -1) {
      content.push(newKey || key, value)
    } else {
      content[found + 1] = value
      if (newKey) content[found] = newKey
    }
    return new OrderedMap(content)
  },

  // :: (string) → OrderedMap
  // Return a map with the given key removed, if it existed.
  remove: function(key) {
    var found = this.find(key)
    if (found == -1) return this
    var content = this.content.slice()
    content.splice(found, 2)
    return new OrderedMap(content)
  },

  // :: (string, any) → OrderedMap
  // Add a new key to the start of the map.
  addToStart: function(key, value) {
    return new OrderedMap([key, value].concat(this.remove(key).content))
  },

  // :: (string, any) → OrderedMap
  // Add a new key to the end of the map.
  addToEnd: function(key, value) {
    var content = this.remove(key).content.slice()
    content.push(key, value)
    return new OrderedMap(content)
  },

  // :: (string, string, any) → OrderedMap
  // Add a key after the given key. If `place` is not found, the new
  // key is added to the end.
  addBefore: function(place, key, value) {
    var without = this.remove(key), content = without.content.slice()
    var found = without.find(place)
    content.splice(found == -1 ? content.length : found, 0, key, value)
    return new OrderedMap(content)
  },

  // :: ((key: string, value: any))
  // Call the given function for each key/value pair in the map, in
  // order.
  forEach: function(f) {
    for (var i = 0; i < this.content.length; i += 2)
      f(this.content[i], this.content[i + 1])
  },

  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by prepending the keys in this map that don't
  // appear in `map` before the keys in `map`.
  prepend: function(map) {
    map = OrderedMap.from(map)
    if (!map.size) return this
    return new OrderedMap(map.content.concat(this.subtract(map).content))
  },

  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by appending the keys in this map that don't
  // appear in `map` after the keys in `map`.
  append: function(map) {
    map = OrderedMap.from(map)
    if (!map.size) return this
    return new OrderedMap(this.subtract(map).content.concat(map.content))
  },

  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a map containing all the keys in this map that don't
  // appear in `map`.
  subtract: function(map) {
    var result = this
    map = OrderedMap.from(map)
    for (var i = 0; i < map.content.length; i += 2)
      result = result.remove(map.content[i])
    return result
  },

  // :: number
  // The amount of keys in this map.
  get size() {
    return this.content.length >> 1
  }
}

// :: (?union<Object, OrderedMap>) → OrderedMap
// Return a map with the given content. If null, create an empty
// map. If given an ordered map, return that map itself. If given an
// object, create a map from the object's properties.
OrderedMap.from = function(value) {
  if (value instanceof OrderedMap) return value
  var content = []
  if (value) for (var prop in value) content.push(prop, value[prop])
  return new OrderedMap(content)
}

module.exports = OrderedMap

},{}],3:[function(require,module,exports){
var ref = require("prosemirror-transform");
var joinPoint = ref.joinPoint;
var canJoin = ref.canJoin;
var findWrapping = ref.findWrapping;
var liftTarget = ref.liftTarget;
var canSplit = ref.canSplit;
var ReplaceAroundStep = ref.ReplaceAroundStep;
var ref$1 = require("prosemirror-model");
var Slice = ref$1.Slice;
var Fragment = ref$1.Fragment;
var ref$2 = require("prosemirror-state");
var Selection = ref$2.Selection;
var TextSelection = ref$2.TextSelection;
var NodeSelection = ref$2.NodeSelection;

// :: (EditorState, ?(tr: Transaction)) → bool
// Delete the selection, if there is one.
function deleteSelection(state, dispatch) {
  if (state.selection.empty) { return false }
  if (dispatch) {
    var ref = state.selection;
    var $from = ref.$from;
    var $to = ref.$to;
    var tr = state.tr.deleteSelection().scrollIntoView()
    if ($from.sameParent($to) && $from.parent.isTextblock)
      { tr.setStoredMarks($from.marks(true)) }
    dispatch(tr)
  }
  return true
}
exports.deleteSelection = deleteSelection

// :: (EditorState, ?(tr: Transaction), ?EditorView) → bool
// If the selection is empty and at the start of a textblock, move
// that block closer to the block before it, by lifting it out of its
// parent or, if it has no parent it doesn't share with the node
// before it, moving it into a parent of that node, or joining it with
// that. Will use the view for accurate start-of-textblock detection
// if given.
function joinBackward(state, dispatch, view) {
  var ref = state.selection;
  var $head = ref.$head;
  var empty = ref.empty;
  if (!empty || (view ? !view.endOfTextblock("backward", state)
                      : $head.parentOffset > 0))
    { return false }

  // Find the node before this one
  var before, cut
  for (var i = $head.depth - 1; !before && i >= 0; i--) { if ($head.index(i) > 0) {
    cut = $head.before(i + 1)
    before = $head.node(i).child($head.index(i) - 1)
  } }

  // If there is no node before this, try to lift
  if (!before) {
    var range = $head.blockRange(), target = range && liftTarget(range)
    if (target == null) { return false }
    if (dispatch) { dispatch(state.tr.lift(range, target).scrollIntoView()) }
    return true
  }

  // If the node below has no content and the node above is
  // selectable, delete the node below and select the one above.
  if (before.isLeaf && NodeSelection.isSelectable(before) && $head.parent.content.size == 0) {
    if (dispatch) {
      var tr = state.tr.delete(cut, cut + $head.parent.nodeSize)
      tr.setSelection(NodeSelection.create(tr.doc, cut - before.nodeSize))
      dispatch(tr.scrollIntoView())
    }
    return true
  }

  // If the node doesn't allow children, delete it
  if (before.isLeaf) {
    if (dispatch) { dispatch(state.tr.delete(cut - before.nodeSize, cut).scrollIntoView()) }
    return true
  }

  // Apply the joining algorithm
  return deleteBarrier(state, cut, dispatch) || selectNextNode(state, cut, -1, dispatch)
}
exports.joinBackward = joinBackward

// :: (EditorState, ?(tr: Transaction), ?EditorView) → bool
// If the selection is empty and the cursor is at the end of a
// textblock, move the node after it closer to the node with the
// cursor (lifting it out of parents that aren't shared, moving it
// into parents of the cursor block, or joining the two when they are
// siblings). Will use the view for accurate start-of-textblock
// detection if given.
function joinForward(state, dispatch, view) {
  var ref = state.selection;
  var $head = ref.$head;
  var empty = ref.empty;
  if (!empty || (view ? !view.endOfTextblock("forward", state)
                      : $head.parentOffset < $head.parent.content.size))
    { return false }

  // Find the node after this one
  var after, cut
  for (var i = $head.depth - 1; !after && i >= 0; i--) {
    var parent = $head.node(i)
    if ($head.index(i) + 1 < parent.childCount) {
      after = parent.child($head.index(i) + 1)
      cut = $head.after(i + 1)
    }
  }

  // If there is no node after this, there's nothing to do
  if (!after) { return false }

  // If the node doesn't allow children, delete it
  if (after.isLeaf) {
    if (dispatch) { dispatch(state.tr.delete(cut, cut + after.nodeSize).scrollIntoView()) }
    return true
  }
  // Apply the joining algorithm
  return deleteBarrier(state, cut, dispatch) || selectNextNode(state, cut, 1, dispatch)
}
exports.joinForward = joinForward

// :: (EditorState, ?(tr: Transaction)) → bool
// Join the selected block or, if there is a text selection, the
// closest ancestor block of the selection that can be joined, with
// the sibling above it.
function joinUp(state, dispatch) {
  var ref = state.selection;
  var node = ref.node;
  var from = ref.from;
  var point
  if (node) {
    if (node.isTextblock || !canJoin(state.doc, from)) { return false }
    point = from
  } else {
    point = joinPoint(state.doc, from, -1)
    if (point == null) { return false }
  }
  if (dispatch) {
    var tr = state.tr.join(point)
    if (state.selection.node) { tr.setSelection(NodeSelection.create(tr.doc, point - state.doc.resolve(point).nodeBefore.nodeSize)) }
    dispatch(tr.scrollIntoView())
  }
  return true
}
exports.joinUp = joinUp

// :: (EditorState, ?(tr: Transaction)) → bool
// Join the selected block, or the closest ancestor of the selection
// that can be joined, with the sibling after it.
function joinDown(state, dispatch) {
  var node = state.selection.node, nodeAt = state.selection.from
  var point = joinPointBelow(state)
  if (!point) { return false }
  if (dispatch) {
    var tr = state.tr.join(point)
    if (node) { tr.setSelection(NodeSelection.create(tr.doc, nodeAt)) }
    dispatch(tr.scrollIntoView())
  }
  return true
}
exports.joinDown = joinDown

// :: (EditorState, ?(tr: Transaction)) → bool
// Lift the selected block, or the closest ancestor block of the
// selection that can be lifted, out of its parent node.
function lift(state, dispatch) {
  var ref = state.selection;
  var $from = ref.$from;
  var $to = ref.$to;
  var range = $from.blockRange($to), target = range && liftTarget(range)
  if (target == null) { return false }
  if (dispatch) { dispatch(state.tr.lift(range, target).scrollIntoView()) }
  return true
}
exports.lift = lift

// :: (EditorState, ?(tr: Transaction)) → bool
// If the selection is in a node whose type has a truthy
// [`code`](#model.NodeSpec.code) property in its spec, replace the
// selection with a newline character.
function newlineInCode(state, dispatch) {
  var ref = state.selection;
  var $head = ref.$head;
  var anchor = ref.anchor;
  if (!$head || !$head.parent.type.spec.code || $head.sharedDepth(anchor) != $head.depth) { return false }
  if (dispatch) { dispatch(state.tr.insertText("\n").scrollIntoView()) }
  return true
}
exports.newlineInCode = newlineInCode

// :: (EditorState, ?(tr: Transaction)) → bool
// When the selection is in a node with a truthy
// [`code`](#model.NodeSpec.code) property in its spec, create a
// default block after the code block, and move the cursor there.
function exitCode(state, dispatch) {
  var ref = state.selection;
  var $head = ref.$head;
  var anchor = ref.anchor;
  if (!$head || !$head.parent.type.spec.code || $head.sharedDepth(anchor) != $head.depth) { return false }
  var above = $head.node(-1), after = $head.indexAfter(-1), type = above.defaultContentType(after)
  if (!above.canReplaceWith(after, after, type)) { return false }
  if (dispatch) {
    var pos = $head.after(), tr = state.tr.replaceWith(pos, pos, type.createAndFill())
    tr.setSelection(Selection.near(tr.doc.resolve(pos), 1))
    dispatch(tr.scrollIntoView())
  }
  return true
}
exports.exitCode = exitCode

// :: (EditorState, ?(tr: Transaction)) → bool
// If a block node is selected, create an empty paragraph before (if
// it is its parent's first child) or after it.
function createParagraphNear(state, dispatch) {
  var ref = state.selection;
  var $from = ref.$from;
  var $to = ref.$to;
  var node = ref.node;
  if (!node || !node.isBlock) { return false }
  var type = $from.parent.defaultContentType($to.indexAfter())
  if (!type || !type.isTextblock) { return false }
  if (dispatch) {
    var side = ($from.parentOffset ? $to : $from).pos
    var tr = state.tr.insert(side, type.createAndFill())
    tr.setSelection(TextSelection.create(tr.doc, side + 1))
    dispatch(tr.scrollIntoView())
  }
  return true
}
exports.createParagraphNear = createParagraphNear

// :: (EditorState, ?(tr: Transaction)) → bool
// If the cursor is in an empty textblock that can be lifted, lift the
// block.
function liftEmptyBlock(state, dispatch) {
  var ref = state.selection;
  var $head = ref.$head;
  var empty = ref.empty;
  if (!empty || $head.parent.content.size) { return false }
  if ($head.depth > 1 && $head.after() != $head.end(-1)) {
    var before = $head.before()
    if (canSplit(state.doc, before)) {
      if (dispatch) { dispatch(state.tr.split(before).scrollIntoView()) }
      return true
    }
  }
  var range = $head.blockRange(), target = range && liftTarget(range)
  if (target == null) { return false }
  if (dispatch) { dispatch(state.tr.lift(range, target).scrollIntoView()) }
  return true
}
exports.liftEmptyBlock = liftEmptyBlock

// :: (EditorState, ?(tr: Transaction)) → bool
// Split the parent block of the selection. If the selection is a text
// selection, also delete its content.
function splitBlock(state, dispatch) {
  var ref = state.selection;
  var $from = ref.$from;
  var $to = ref.$to;
  var node = ref.node;
  if (node && node.isBlock) {
    if (!$from.parentOffset || !canSplit(state.doc, $from.pos)) { return false }
    if (dispatch) { dispatch(state.tr.split($from.pos).scrollIntoView()) }
    return true
  }

  if (dispatch) {
    var atEnd = $to.parentOffset == $to.parent.content.size
    var tr = state.tr.delete($from.pos, $to.pos)
    var deflt = $from.depth == 0 ? null : $from.node(-1).defaultContentType($from.indexAfter(-1))
    var types = atEnd ? [{type: deflt}] : null
    var can = canSplit(tr.doc, $from.pos, 1, types)
    if (!types && !can && canSplit(tr.doc, $from.pos, 1, [{type: deflt}])) {
      types = [{type: deflt}]
      can = true
    }
    if (can) {
      tr.split($from.pos, 1, types)
      if (!atEnd && !$from.parentOffset && $from.parent.type != deflt &&
          $from.node(-1).canReplace($from.index(-1), $from.indexAfter(-1), Fragment.from(deflt.create(), $from.parent)))
        { tr.setNodeType($from.before(), deflt) }
    }
    dispatch(tr.scrollIntoView())
  }
  return true
}
exports.splitBlock = splitBlock

// :: (EditorState, ?(tr: Transaction)) → bool
// Move the selection to the node wrapping the current selection, if
// any. (Will not select the document node.)
function selectParentNode(state, dispatch) {
  var sel = state.selection, pos
  if (sel.node) {
    if (!sel.$from.depth) { return false }
    pos = sel.$from.before()
  } else {
    var same = sel.$head.sharedDepth(sel.anchor)
    if (same == 0) { return false }
    pos = sel.$head.before(same)
  }
  if (dispatch) { dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos))) }
  return true
}
exports.selectParentNode = selectParentNode

function joinMaybeClear(state, $pos, dispatch) {
  var before = $pos.nodeBefore, after = $pos.nodeAfter, index = $pos.index()
  if (!before || !after || !before.type.compatibleContent(after.type)) { return false }
  if (!before.content.size && $pos.parent.canReplace(index - 1, index)) {
    if (dispatch) { dispatch(state.tr.delete($pos.pos - before.nodeSize, $pos.pos).scrollIntoView()) }
    return true
  }
  if (!$pos.parent.canReplace(index, index + 1)) { return false }
  if (dispatch)
    { dispatch(state.tr
             .clearNonMatching($pos.pos, before.contentMatchAt(before.childCount))
             .join($pos.pos)
             .scrollIntoView()) }
  return true
}

function deleteBarrier(state, cut, dispatch) {
  var $cut = state.doc.resolve(cut), before = $cut.nodeBefore, after = $cut.nodeAfter, conn, match
  if (joinMaybeClear(state, $cut, dispatch)) {
    return true
  } else if (after.isTextblock && $cut.parent.canReplace($cut.index(), $cut.index() + 1) &&
             (conn = (match = before.contentMatchAt(before.childCount)).findWrappingFor(after)) &&
             match.matchType((conn[0] || after).type, (conn[0] || after).attrs).validEnd()) {
    if (dispatch) {
      var end = cut + after.nodeSize, wrap = Fragment.empty
      for (var i = conn.length - 1; i >= 0; i--)
        { wrap = Fragment.from(conn[i].type.create(conn[i].attrs, wrap)) }
      wrap = Fragment.from(before.copy(wrap))
      var tr = state.tr.step(new ReplaceAroundStep(cut - 1, end, cut, end, new Slice(wrap, 1, 0), conn.length, true))
      var joinAt = end + 2 * conn.length
      if (canJoin(tr.doc, joinAt)) { tr.join(joinAt) }
      dispatch(tr.scrollIntoView())
    }
    return true
  } else {
    var selAfter = Selection.findFrom($cut, 1)
    var range = selAfter.$from.blockRange(selAfter.$to), target = range && liftTarget(range)
    if (target == null) { return false }
    if (dispatch) { dispatch(state.tr.lift(range, target).scrollIntoView()) }
    return true
  }
}

function selectNextNode(state, cut, dir, dispatch) {
  var $cut = state.doc.resolve(cut)
  var node = dir > 0 ? $cut.nodeAfter : $cut.nodeBefore
  if (!node || !NodeSelection.isSelectable(node)) { return false }
  if (dispatch)
    { dispatch(state.tr.setSelection(NodeSelection.create(state.doc, cut - (dir > 0 ? 0 : node.nodeSize))).scrollIntoView()) }
  return true
}

// Parameterized commands

function joinPointBelow(state) {
  var ref = state.selection;
  var node = ref.node;
  var to = ref.to;
  if (node) { return canJoin(state.doc, to) ? to : null }
  else { return joinPoint(state.doc, to, 1) }
}

// :: (NodeType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Wrap the selection in a node of the given type with the given
// attributes.
function wrapIn(nodeType, attrs) {
  return function(state, dispatch) {
    var ref = state.selection;
    var $from = ref.$from;
    var $to = ref.$to;
    var range = $from.blockRange($to), wrapping = range && findWrapping(range, nodeType, attrs)
    if (!wrapping) { return false }
    if (dispatch) { dispatch(state.tr.wrap(range, wrapping).scrollIntoView()) }
    return true
  }
}
exports.wrapIn = wrapIn

// :: (NodeType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Returns a command that tries to set the textblock around the
// selection to the given node type with the given attributes.
function setBlockType(nodeType, attrs) {
  return function(state, dispatch) {
    var ref = state.selection;
    var $from = ref.$from;
    var $to = ref.$to;
    var node = ref.node;
    var depth
    if (node) {
      depth = $from.depth
    } else {
      if (!$from.depth || $to.pos > $from.end()) { return false }
      depth = $from.depth - 1
    }
    var target = node || $from.parent
    if (!target.isTextblock || target.hasMarkup(nodeType, attrs)) { return false }
    var index = $from.index(depth)
    if (!$from.node(depth).canReplaceWith(index, index + 1, nodeType)) { return false }
    if (dispatch) {
      var where = $from.before(depth + 1)
      dispatch(state.tr
               .clearNonMatching(where, nodeType.contentExpr.start(attrs))
               .setNodeType(where, nodeType, attrs)
               .scrollIntoView())
    }
    return true
  }
}
exports.setBlockType = setBlockType

function markApplies(doc, from, to, type) {
  var can = doc.contentMatchAt(0).allowsMark(type)
  doc.nodesBetween(from, to, function (node) {
    if (can) { return false }
    can = node.isTextblock && node.contentMatchAt(0).allowsMark(type)
  })
  return can
}

// :: (MarkType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Create a command function that toggles the given mark with the
// given attributes. Will return `false` when the current selection
// doesn't support that mark. This will remove the mark if any marks
// of that type exist in the selection, or add it otherwise. If the
// selection is empty, this applies to the [stored
// marks](#state.EditorState.storedMarks) instead of a range of the
// document.
function toggleMark(markType, attrs) {
  return function(state, dispatch) {
    var ref = state.selection;
    var empty = ref.empty;
    var from = ref.from;
    var to = ref.to;
    var $from = ref.$from;
    if (!markApplies(state.doc, from, to, markType)) { return false }
    if (dispatch) {
      if (empty) {
        if (markType.isInSet(state.storedMarks || $from.marks()))
          { dispatch(state.tr.removeStoredMark(markType)) }
        else
          { dispatch(state.tr.addStoredMark(markType.create(attrs))) }
      } else {
        if (state.doc.rangeHasMark(from, to, markType))
          { dispatch(state.tr.removeMark(from, to, markType).scrollIntoView()) }
        else
          { dispatch(state.tr.addMark(from, to, markType.create(attrs)).scrollIntoView()) }
      }
    }
    return true
  }
}
exports.toggleMark = toggleMark

function wrapDispatchForJoin(dispatch, isJoinable) {
  return function (tr) {
    if (!tr.isGeneric) { return dispatch(tr) }

    var ranges = []
    for (var i = 0; i < tr.mapping.maps.length; i++) {
      var map = tr.mapping.maps[i]
      for (var j = 0; j < ranges.length; j++)
        { ranges[j] = map.map(ranges[j]) }
      map.forEach(function (_s, _e, from, to) { return ranges.push(from, to); })
    }

    // Figure out which joinable points exist inside those ranges,
    // by checking all node boundaries in their parent nodes.
    var joinable = []
    for (var i$1 = 0; i$1 < ranges.length; i$1 += 2) {
      var from = ranges[i$1], to = ranges[i$1 + 1]
      var $from = tr.doc.resolve(from), depth = $from.sharedDepth(to), parent = $from.node(depth)
      for (var index = $from.indexAfter(depth), pos = $from.after(depth + 1); pos <= to; ++index) {
        var after = parent.maybeChild(index)
        if (!after) { break }
        if (index && joinable.indexOf(pos) == -1) {
          var before = parent.child(index - 1)
          if (before.type == after.type && isJoinable(before, after))
            { joinable.push(pos) }
        }
        pos += after.nodeSize
      }
    }
    // Join the joinable points
    joinable.sort(function (a, b) { return a - b; })
    for (var i$2 = joinable.length - 1; i$2 >= 0; i$2--) {
      if (canJoin(tr.doc, joinable[i$2])) { tr.join(joinable[i$2]) }
    }
    dispatch(tr)
  }
}

// :: ((state: EditorState, ?(tr: Transaction)) → bool, union<(before: Node, after: Node) → bool, [string]>) → (state: EditorState, ?(tr: Transaction)) → bool
// Wrap a command so that, when it produces a transform that causes
// two joinable nodes to end up next to each other, those are joined.
// Nodes are considered joinable when they are of the same type and
// when the `isJoinable` predicate returns true for them or, if an
// array of strings was passed, if their node type name is in that
// array.
function autoJoin(command, isJoinable) {
  if (Array.isArray(isJoinable)) {
    var types = isJoinable
    isJoinable = function (node) { return types.indexOf(node.type.name) > -1; }
  }
  return function (state, dispatch) { return command(state, dispatch && wrapDispatchForJoin(dispatch, isJoinable)); }
}
exports.autoJoin = autoJoin

// :: (...[(EditorState, ?(tr: Transaction)) → bool]) → (EditorState, ?(tr: Transaction)) → bool
// Combine a number of command functions into a single function (which
// calls them one by one until one returns true).
function chainCommands() {
  var commands = [], len = arguments.length;
  while ( len-- ) commands[ len ] = arguments[ len ];

  return function(state, dispatch, view) {
    for (var i = 0; i < commands.length; i++)
      { if (commands[i](state, dispatch, view)) { return true } }
    return false
  }
}
exports.chainCommands = chainCommands

// :: Object
// A basic keymap containing bindings not specific to any schema.
// Binds the following keys (when multiple commands are listed, they
// are chained with [`chainCommands`](#commands.chainCommands):
//
// * **Enter** to `newlineInCode`, `createParagraphNear`, `liftEmptyBlock`, `splitBlock`
// * **Mod-Enter** to `exitCode`
// * **Backspace** to `deleteSelection`, `joinBackward`
// * **Mod-Backspace** to `deleteSelection`, `joinBackward`
// * **Delete** to `deleteSelection`, `joinForward`
// * **Mod-Delete** to `deleteSelection`, `joinForward`
// * **Alt-ArrowUp** to `joinUp`
// * **Alt-ArrowDown** to `joinDown`
// * **Mod-BracketLeft** to `lift`
// * **Escape** to `selectParentNode`
var baseKeymap = {
  "Enter": chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock),
  "Mod-Enter": exitCode,

  "Backspace": chainCommands(deleteSelection, joinBackward),
  "Mod-Backspace": chainCommands(deleteSelection, joinBackward),
  "Delete": chainCommands(deleteSelection, joinForward),
  "Mod-Delete": chainCommands(deleteSelection, joinForward),

  "Alt-ArrowUp": joinUp,
  "Alt-ArrowDown": joinDown,
  "Mod-BracketLeft": lift,
  "Escape": selectParentNode
}

// declare global: os, navigator
var mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform)
          : typeof os != "undefined" ? os.platform() == "darwin" : false

if (mac) {
  var extra = {
    "Ctrl-h": baseKeymap["Backspace"],
    "Alt-Backspace": baseKeymap["Mod-Backspace"],
    "Ctrl-d": baseKeymap["Delete"],
    "Ctrl-Alt-Backspace": baseKeymap["Mod-Delete"],
    "Alt-Delete": baseKeymap["Mod-Delete"],
    "Alt-d": baseKeymap["Mod-Delete"]
  }
  for (var prop in extra) { baseKeymap[prop] = extra[prop] }
}

exports.baseKeymap = baseKeymap

},{"prosemirror-model":24,"prosemirror-state":34,"prosemirror-transform":39}],4:[function(require,module,exports){
var ref = require("prosemirror-state");
var Plugin = ref.Plugin;
var ref$1 = require("prosemirror-view");
var Decoration = ref$1.Decoration;
var DecorationSet = ref$1.DecorationSet;

var gecko = typeof navigator != "undefined" && /gecko\/\d/i.test(navigator.userAgent)
var linux = typeof navigator != "undefined" && /linux/i.test(navigator.platform)

function dropCursor(options) {
  function dispatch(view, data) {
    view.dispatch(view.state.tr.setMeta(plugin, data))
  }

  var timeout = null
  function scheduleRemoval(view) {
    clearTimeout(timeout)
    timeout = setTimeout(function () {
      if (plugin.getState(view.state)) { dispatch(view, {type: "remove"}) }
    }, 1000)
  }

  var plugin = new Plugin({
    state: {
      init: function init() { return null },
      apply: function apply(tr, prev, state) {
        // Firefox on Linux gets really confused an breaks dragging when we
        // mess with the nodes around the target node during a drag. So
        // disable this plugin there. See https://bugzilla.mozilla.org/show_bug.cgi?id=1323170
        if (gecko && linux) { return null }
        var command = tr.getMeta(plugin)
        if (!command) { return prev }
        if (command.type == "set") { return pluginStateFor(state, command.pos, options) }
        return null
      }
    },
    props: {
      handleDOMEvents: {
        dragover: function dragover(view, event) {
          var active = plugin.getState(view.state)
          var pos = view.posAtCoords({left: event.clientX, top: event.clientY})
          if (pos && (!active || active.pos != pos.pos))
            { dispatch(view, {type: "set", pos: pos.pos}) }
          scheduleRemoval(view)
          return false
        },

        dragend: function dragend(view) {
          if (plugin.getState(view.state)) { dispatch(view, {type: "remove"}) }
          return false
        },

        drop: function drop(view) {
          if (plugin.getState(view.state)) { dispatch(view, {type: "remove"}) }
          return false
        },

        dragleave: function dragleave(view, event) {
          if (event.target == view.content) { dispatch(view, {type: "remove"}) }
          return false
        }
      },
      decorations: function decorations(state) {
        var active = plugin.getState(state)
        return active && active.deco
      }
    }
  })
  return plugin
}
exports.dropCursor = dropCursor

function style(options, side) {
  var width = (options && options.width) || 1
  var color = (options && options.color) || "black"
  return ("border-" + side + ": " + width + "px solid " + color + "; margin-" + side + ": -" + width + "px")
}

function pluginStateFor(state, pos, options) {
  var $pos = state.doc.resolve(pos), deco
  if (!$pos.parent.isTextblock) {
    var before, after
    if (before = $pos.nodeBefore)
      { deco = Decoration.node(pos - before.nodeSize, pos, {nodeName: "div", style: style(options, "right")}) }
    else if (after = $pos.nodeAfter)
      { deco = Decoration.node(pos, pos + after.nodeSize, {nodeName: "div", style: style(options, "left")}) }
  }
  if (!deco) {
    var node = document.createElement("span")
    node.textContent = "\u200b"
    node.style.cssText = style(options, "left") + "; display: inline-block; pointer-events: none"
    deco = Decoration.widget(pos, node)
  }
  return {pos: pos, deco: DecorationSet.create(state.doc, [deco])}
}

},{"prosemirror-state":34,"prosemirror-view":54}],5:[function(require,module,exports){
var ref = require("prosemirror-inputrules");
var blockQuoteRule = ref.blockQuoteRule;
var orderedListRule = ref.orderedListRule;
var bulletListRule = ref.bulletListRule;
var codeBlockRule = ref.codeBlockRule;
var headingRule = ref.headingRule;
var inputRules = ref.inputRules;
var allInputRules = ref.allInputRules;
var ref$1 = require("prosemirror-keymap");
var keymap = ref$1.keymap;
var ref$2 = require("prosemirror-history");
var history = ref$2.history;
var ref$3 = require("prosemirror-commands");
var baseKeymap = ref$3.baseKeymap;
var ref$4 = require("prosemirror-state");
var Plugin = ref$4.Plugin;
var ref$5 = require("prosemirror-dropcursor");
var dropCursor = ref$5.dropCursor;

var ref$6 = require("./menu");
var buildMenuItems = ref$6.buildMenuItems;
exports.buildMenuItems = buildMenuItems
var ref$7 = require("./keymap");
var buildKeymap = ref$7.buildKeymap;
exports.buildKeymap = buildKeymap

// !! This module exports helper functions for deriving a set of basic
// menu items, input rules, or key bindings from a schema. These
// values need to know about the schema for two reasons—they need
// access to specific instances of node and mark types, and they need
// to know which of the node and mark types that they know about are
// actually present in the schema.
//
// The `exampleSetup` plugin ties these together into a plugin that
// will automatically enable this basic functionality in an editor.

// :: (Object) → [Plugin]
// A convenience plugin that bundles together a simple menu with basic
// key bindings, input rules, and styling for the example schema.
// Probably only useful for quickly setting up a passable
// editor—you'll need more control over your settings in most
// real-world situations.
//
//   options::- The following options are recognized:
//
//     schema:: Schema
//     The schema to generate key bindings and menu items for.
//
//     mapKeys:: ?Object
//     Can be used to [adjust](#example-setup.buildKeymap) the key bindings created.
function exampleSetup(options) {
  var plugins = [
    inputRules({rules: allInputRules.concat(buildInputRules(options.schema))}),
    keymap(buildKeymap(options.schema, options.mapKeys)),
    keymap(baseKeymap),
    dropCursor()
  ]
  if (options.history !== false) { plugins.push(history()) }

  return plugins.concat(new Plugin({
    props: {
      attributes: {class: "ProseMirror-example-setup-style"},
      menuContent: buildMenuItems(options.schema).fullMenu,
      floatingMenu: true
    }
  }))
}
exports.exampleSetup = exampleSetup

// :: (Schema) → [InputRule]
// A set of input rules for creating the basic block quotes, lists,
// code blocks, and heading.
function buildInputRules(schema) {
  var result = [], type
  if (type = schema.nodes.blockquote) { result.push(blockQuoteRule(type)) }
  if (type = schema.nodes.ordered_list) { result.push(orderedListRule(type)) }
  if (type = schema.nodes.bullet_list) { result.push(bulletListRule(type)) }
  if (type = schema.nodes.code_block) { result.push(codeBlockRule(type)) }
  if (type = schema.nodes.heading) { result.push(headingRule(type, 6)) }
  return result
}
exports.buildInputRules = buildInputRules

},{"./keymap":6,"./menu":7,"prosemirror-commands":3,"prosemirror-dropcursor":4,"prosemirror-history":9,"prosemirror-inputrules":10,"prosemirror-keymap":14,"prosemirror-state":34}],6:[function(require,module,exports){
var ref = require("prosemirror-commands");
var wrapIn = ref.wrapIn;
var setBlockType = ref.setBlockType;
var chainCommands = ref.chainCommands;
var toggleMark = ref.toggleMark;
var exitCode = ref.exitCode;
var ref$1 = require("prosemirror-schema-table");
var selectNextCell = ref$1.selectNextCell;
var selectPreviousCell = ref$1.selectPreviousCell;
var ref$2 = require("prosemirror-schema-list");
var wrapInList = ref$2.wrapInList;
var splitListItem = ref$2.splitListItem;
var liftListItem = ref$2.liftListItem;
var sinkListItem = ref$2.sinkListItem;
var ref$3 = require("prosemirror-history");
var undo = ref$3.undo;
var redo = ref$3.redo;

var mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false

// :: (Schema, ?Object) → Object
// Inspect the given schema looking for marks and nodes from the
// basic schema, and if found, add key bindings related to them.
// This will add:
//
// * **Mod-b** for toggling [strong](#schema-basic.StrongMark)
// * **Mod-i** for toggling [emphasis](#schema-basic.EmMark)
// * **Mod-`** for toggling [code font](#schema-basic.CodeMark)
// * **Ctrl-Shift-0** for making the current textblock a paragraph
// * **Ctrl-Shift-1** to **Ctrl-Shift-Digit6** for making the current
//   textblock a heading of the corresponding level
// * **Ctrl-Shift-Backslash** to make the current textblock a code block
// * **Ctrl-Shift-8** to wrap the selection in an ordered list
// * **Ctrl-Shift-9** to wrap the selection in a bullet list
// * **Ctrl->** to wrap the selection in a block quote
// * **Enter** to split a non-empty textblock in a list item while at
//   the same time splitting the list item
// * **Mod-Enter** to insert a hard break
// * **Mod-_** to insert a horizontal rule
//
// You can suppress or map these bindings by passing a `mapKeys`
// argument, which maps key names (say `"Mod-B"` to either `false`, to
// remove the binding, or a new key name string.
function buildKeymap(schema, mapKeys) {
  var keys = {}, type
  function bind(key, cmd) {
    if (mapKeys) {
      var mapped = mapKeys[key]
      if (mapped === false) { return }
      if (mapped) { key = mapped }
    }
    keys[key] = cmd
  }

  bind("Mod-z", undo)
  bind("Shift-Mod-z", redo)
  if (!mac) { bind("Mod-y", redo) }

  if (type = schema.marks.strong)
    { bind("Mod-b", toggleMark(type)) }
  if (type = schema.marks.em)
    { bind("Mod-i", toggleMark(type)) }
  if (type = schema.marks.code)
    { bind("Mod-`", toggleMark(type)) }

  if (type = schema.nodes.bullet_list)
    { bind("Shift-Ctrl-8", wrapInList(type)) }
  if (type = schema.nodes.ordered_list)
    { bind("Shift-Ctrl-9", wrapInList(type)) }
  if (type = schema.nodes.blockquote)
    { bind("Ctrl->", wrapIn(type)) }
  if (type = schema.nodes.hard_break) {
    var br = type, cmd = chainCommands(exitCode, function (state, dispatch) {
      dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
      return true
    })
    bind("Mod-Enter", cmd)
    bind("Shift-Enter", cmd)
    if (mac) { bind("Ctrl-Enter", cmd) }
  }
  if (type = schema.nodes.list_item) {
    bind("Enter", splitListItem(type))
    bind("Mod-[", liftListItem(type))
    bind("Mod-]", sinkListItem(type))
  }
  if (type = schema.nodes.paragraph)
    { bind("Shift-Ctrl-0", setBlockType(type)) }
  if (type = schema.nodes.code_block)
    { bind("Shift-Ctrl-\\", setBlockType(type)) }
  if (type = schema.nodes.heading)
    { for (var i = 1; i <= 6; i++) { bind("Shift-Ctrl-" + i, setBlockType(type, {level: i})) } }
  if (type = schema.nodes.horizontal_rule) {
    var hr = type
    bind("Mod-_", function (state, dispatch) {
      dispatch(state.tr.replaceSelectionWith(hr.create()).scrollIntoView())
      return true
    })
  }

  if (schema.nodes.table_row) {
    bind("Tab", selectNextCell)
    bind("Shift-Tab", selectPreviousCell)
  }
  return keys
}
exports.buildKeymap = buildKeymap

},{"prosemirror-commands":3,"prosemirror-history":9,"prosemirror-schema-list":32,"prosemirror-schema-table":33}],7:[function(require,module,exports){
var ref = require("prosemirror-menu");
var wrapItem = ref.wrapItem;
var blockTypeItem = ref.blockTypeItem;
var Dropdown = ref.Dropdown;
var DropdownSubmenu = ref.DropdownSubmenu;
var joinUpItem = ref.joinUpItem;
var liftItem = ref.liftItem;
var selectParentNodeItem = ref.selectParentNodeItem;
var undoItem = ref.undoItem;
var redoItem = ref.redoItem;
var icons = ref.icons;
var MenuItem = ref.MenuItem;
var ref$1 = require("prosemirror-schema-table");
var createTable = ref$1.createTable;
var addColumnBefore = ref$1.addColumnBefore;
var addColumnAfter = ref$1.addColumnAfter;
var removeColumn = ref$1.removeColumn;
var addRowBefore = ref$1.addRowBefore;
var addRowAfter = ref$1.addRowAfter;
var removeRow = ref$1.removeRow;
var ref$2 = require("prosemirror-state");
var Selection = ref$2.Selection;
var ref$3 = require("prosemirror-commands");
var toggleMark = ref$3.toggleMark;
var ref$4 = require("prosemirror-schema-list");
var wrapInList = ref$4.wrapInList;
var ref$5 = require("./prompt");
var TextField = ref$5.TextField;
var openPrompt = ref$5.openPrompt;

// Helpers to create specific types of items

function canInsert(state, nodeType, attrs) {
  var $from = state.selection.$from
  for (var d = $from.depth; d >= 0; d--) {
    var index = $from.index(d)
    if ($from.node(d).canReplaceWith(index, index, nodeType, attrs)) { return true }
  }
  return false
}

function insertImageItem(nodeType) {
  return new MenuItem({
    title: "Insert image",
    label: "Image",
    select: function select(state) { return canInsert(state, nodeType) },
    run: function run(state, _, view) {
      var ref = state.selection;
      var node = ref.node;
      var from = ref.from;
      var to = ref.to;
      var attrs = nodeType && node && node.type == nodeType && node.attrs
      openPrompt({
        title: "Insert image",
        fields: {
          src: new TextField({label: "Location", required: true, value: attrs && attrs.src}),
          title: new TextField({label: "Title", value: attrs && attrs.title}),
          alt: new TextField({label: "Description",
                              value: attrs ? attrs.title : state.doc.textBetween(from, to, " ")})
        },
        // FIXME this (and similar uses) won't have the current state
        // when it runs, leading to problems in, for example, a
        // collaborative setup
        callback: function callback(attrs) {
          view.dispatch(view.state.tr.replaceSelectionWith(nodeType.createAndFill(attrs)))
          view.focus()
        }
      })
    }
  })
}

function positiveInteger(value) {
  if (!/^[1-9]\d*$/.test(value)) { return "Should be a positive integer" }
}

function insertTableItem(tableType) {
  return new MenuItem({
    title: "Insert a table",
    run: function run(_, _a, view) {
      openPrompt({
        title: "Insert table",
        fields: {
          rows: new TextField({label: "Rows", validate: positiveInteger}),
          cols: new TextField({label: "Columns", validate: positiveInteger})
        },
        callback: function callback(ref) {
          var rows = ref.rows;
          var cols = ref.cols;

          var tr = view.state.tr.replaceSelectionWith(createTable(tableType, +rows, +cols))
          tr.setSelection(Selection.near(tr.doc.resolve(view.state.selection.from)))
          view.dispatch(tr.scrollIntoView())
          view.focus()
        }
      })
    },
    select: function select(state) {
      var $from = state.selection.$from
      for (var d = $from.depth; d >= 0; d--) {
        var index = $from.index(d)
        if ($from.node(d).canReplaceWith(index, index, tableType)) { return true }
      }
      return false
    },
    label: "Table"
  })
}

function cmdItem(cmd, options) {
  var passedOptions = {
    label: options.title,
    run: cmd,
    select: function select(state) { return cmd(state) }
  }
  for (var prop in options) { passedOptions[prop] = options[prop] }
  return new MenuItem(passedOptions)
}

function markActive(state, type) {
  var ref = state.selection;
  var from = ref.from;
  var $from = ref.$from;
  var to = ref.to;
  var empty = ref.empty;
  if (empty) { return type.isInSet(state.storedMarks || $from.marks()) }
  else { return state.doc.rangeHasMark(from, to, type) }
}

function markItem(markType, options) {
  var passedOptions = {
    active: function active(state) { return markActive(state, markType) }
  }
  for (var prop in options) { passedOptions[prop] = options[prop] }
  return cmdItem(toggleMark(markType), passedOptions)
}

function linkItem(markType) {
  return markItem(markType, {
    title: "Add or remove link",
    icon: icons.link,
    run: function run(state, dispatch, view) {
      if (markActive(state, markType)) {
        toggleMark(markType)(state, dispatch)
        return true
      }
      openPrompt({
        title: "Create a link",
        fields: {
          href: new TextField({
            label: "Link target",
            required: true,
            clean: function (val) {
              if (!/^https?:\/\//i.test(val))
                { val = 'http://' + val }
              return val
            }
          }),
          title: new TextField({label: "Title"})
        },
        callback: function callback(attrs) {
          toggleMark(markType, attrs)(view.state, view.dispatch)
          view.focus()
        }
      })
    }
  })
}

function wrapListItem(nodeType, options) {
  return cmdItem(wrapInList(nodeType, options.attrs), options)
}

// :: (Schema) → Object
// Given a schema, look for default mark and node types in it and
// return an object with relevant menu items relating to those marks:
//
// **`toggleStrong`**`: MenuItem`
//   : A menu item to toggle the [strong mark](#schema-basic.StrongMark).
//
// **`toggleEm`**`: MenuItem`
//   : A menu item to toggle the [emphasis mark](#schema-basic.EmMark).
//
// **`toggleCode`**`: MenuItem`
//   : A menu item to toggle the [code font mark](#schema-basic.CodeMark).
//
// **`toggleLink`**`: MenuItem`
//   : A menu item to toggle the [link mark](#schema-basic.LinkMark).
//
// **`insertImage`**`: MenuItem`
//   : A menu item to insert an [image](#schema-basic.Image).
//
// **`wrapBulletList`**`: MenuItem`
//   : A menu item to wrap the selection in a [bullet list](#schema-list.BulletList).
//
// **`wrapOrderedList`**`: MenuItem`
//   : A menu item to wrap the selection in an [ordered list](#schema-list.OrderedList).
//
// **`wrapBlockQuote`**`: MenuItem`
//   : A menu item to wrap the selection in a [block quote](#schema-basic.BlockQuote).
//
// **`makeParagraph`**`: MenuItem`
//   : A menu item to set the current textblock to be a normal
//     [paragraph](#schema-basic.Paragraph).
//
// **`makeCodeBlock`**`: MenuItem`
//   : A menu item to set the current textblock to be a
//     [code block](#schema-basic.CodeBlock).
//
// **`insertTable`**`: MenuItem`
//   : An item to insert a [table](#schema-table).
//
// **`addRowBefore`**, **`addRowAfter`**, **`removeRow`**, **`addColumnBefore`**, **`addColumnAfter`**, **`removeColumn`**`: MenuItem`
//   : Table-manipulation items.
//
// **`makeHead[N]`**`: MenuItem`
//   : Where _N_ is 1 to 6. Menu items to set the current textblock to
//     be a [heading](#schema-basic.Heading) of level _N_.
//
// **`insertHorizontalRule`**`: MenuItem`
//   : A menu item to insert a horizontal rule.
//
// The return value also contains some prefabricated menu elements and
// menus, that you can use instead of composing your own menu from
// scratch:
//
// **`insertMenu`**`: Dropdown`
//   : A dropdown containing the `insertImage` and
//     `insertHorizontalRule` items.
//
// **`typeMenu`**`: Dropdown`
//   : A dropdown containing the items for making the current
//     textblock a paragraph, code block, or heading.
//
// **`fullMenu`**`: [[MenuElement]]`
//   : An array of arrays of menu elements for use as the full menu
//     for, for example the [menu bar](#menu.MenuBarEditorView).
function buildMenuItems(schema) {
  var r = {}, type
  if (type = schema.marks.strong)
    { r.toggleStrong = markItem(type, {title: "Toggle strong style", icon: icons.strong}) }
  if (type = schema.marks.em)
    { r.toggleEm = markItem(type, {title: "Toggle emphasis", icon: icons.em}) }
  if (type = schema.marks.code)
    { r.toggleCode = markItem(type, {title: "Toggle code font", icon: icons.code}) }
  if (type = schema.marks.link)
    { r.toggleLink = linkItem(type) }

  if (type = schema.nodes.image)
    { r.insertImage = insertImageItem(type) }
  if (type = schema.nodes.bullet_list)
    { r.wrapBulletList = wrapListItem(type, {
      title: "Wrap in bullet list",
      icon: icons.bulletList
    }) }
  if (type = schema.nodes.ordered_list)
    { r.wrapOrderedList = wrapListItem(type, {
      title: "Wrap in ordered list",
      icon: icons.orderedList
    }) }
  if (type = schema.nodes.blockquote)
    { r.wrapBlockQuote = wrapItem(type, {
      title: "Wrap in block quote",
      icon: icons.blockquote
    }) }
  if (type = schema.nodes.paragraph)
    { r.makeParagraph = blockTypeItem(type, {
      title: "Change to paragraph",
      label: "Plain"
    }) }
  if (type = schema.nodes.code_block)
    { r.makeCodeBlock = blockTypeItem(type, {
      title: "Change to code block",
      label: "Code"
    }) }
  if (type = schema.nodes.heading)
    { for (var i = 1; i <= 10; i++)
      { r["makeHead" + i] = blockTypeItem(type, {
        title: "Change to heading " + i,
        label: "Level " + i,
        attrs: {level: i}
      }) } }
  if (type = schema.nodes.horizontal_rule) {
    var hr = type
    r.insertHorizontalRule = new MenuItem({
      title: "Insert horizontal rule",
      label: "Horizontal rule",
      select: function select(state) { return canInsert(state, hr) },
      run: function run(state, dispatch) { dispatch(state.tr.replaceSelectionWith(hr.create())) }
    })
  }
  if (type = schema.nodes.table)
    { r.insertTable = insertTableItem(type) }
  if (type = schema.nodes.table_row) {
    r.addRowBefore = cmdItem(addRowBefore, {title: "Add row before"})
    r.addRowAfter = cmdItem(addRowAfter, {title: "Add row after"})
    r.removeRow = cmdItem(removeRow, {title: "Remove row"})
    r.addColumnBefore = cmdItem(addColumnBefore, {title: "Add column before"})
    r.addColumnAfter = cmdItem(addColumnAfter, {title: "Add column after"})
    r.removeColumn = cmdItem(removeColumn, {title: "Remove column"})
  }

  var cut = function (arr) { return arr.filter(function (x) { return x; }); }
  r.insertMenu = new Dropdown(cut([r.insertImage, r.insertHorizontalRule, r.insertTable]), {label: "Insert"})
  r.typeMenu = new Dropdown(cut([r.makeParagraph, r.makeCodeBlock, r.makeHead1 && new DropdownSubmenu(cut([
    r.makeHead1, r.makeHead2, r.makeHead3, r.makeHead4, r.makeHead5, r.makeHead6
  ]), {label: "Heading"})]), {label: "Type..."})
  var tableItems = cut([r.addRowBefore, r.addRowAfter, r.removeRow, r.addColumnBefore, r.addColumnAfter, r.removeColumn])
  if (tableItems.length)
    { r.tableMenu = new Dropdown(tableItems, {label: "Table"}) }

  r.inlineMenu = [cut([r.toggleStrong, r.toggleEm, r.toggleCode, r.toggleLink]), [r.insertMenu]]
  r.blockMenu = [cut([r.typeMenu, r.tableMenu, r.wrapBulletList, r.wrapOrderedList, r.wrapBlockQuote, joinUpItem,
                      liftItem, selectParentNodeItem])]
  r.fullMenu = r.inlineMenu.concat(r.blockMenu).concat([[undoItem, redoItem]])

  return r
}
exports.buildMenuItems = buildMenuItems

},{"./prompt":8,"prosemirror-commands":3,"prosemirror-menu":16,"prosemirror-schema-list":32,"prosemirror-schema-table":33,"prosemirror-state":34}],8:[function(require,module,exports){
var prefix = "ProseMirror-prompt"

function openPrompt(options) {
  var wrapper = document.body.appendChild(document.createElement("div"))
  wrapper.className = prefix

  var mouseOutside = function (e) { if (!wrapper.contains(e.target)) { close() } }
  setTimeout(function () { return window.addEventListener("mousedown", mouseOutside); }, 50)
  var close = function () {
    window.removeEventListener("mousedown", mouseOutside)
    if (wrapper.parentNode) { wrapper.parentNode.removeChild(wrapper) }
  }

  var domFields = []
  for (var name in options.fields) { domFields.push(options.fields[name].render()) }

  var submitButton = document.createElement("button")
  submitButton.type = "submit"
  submitButton.className = prefix + "-submit"
  submitButton.textContent = "OK"
  var cancelButton = document.createElement("button")
  cancelButton.type = "button"
  cancelButton.className = prefix + "-cancel"
  cancelButton.textContent = "Cancel"
  cancelButton.addEventListener("click", close)

  var form = wrapper.appendChild(document.createElement("form"))
  if (options.title) { form.appendChild(document.createElement("h5")).textContent = options.title }
  domFields.forEach(function (field) {
    form.appendChild(document.createElement("div")).appendChild(field)
  })
  var buttons = form.appendChild(document.createElement("div"))
  buttons.className = prefix + "-buttons"
  buttons.appendChild(submitButton)
  buttons.appendChild(document.createTextNode(" "))
  buttons.appendChild(cancelButton)

  var box = wrapper.getBoundingClientRect()
  wrapper.style.top = ((window.innerHeight - box.height) / 2) + "px"
  wrapper.style.left = ((window.innerWidth - box.width) / 2) + "px"

  var submit = function () {
    var params = getValues(options.fields, domFields)
    if (params) {
      close()
      options.callback(params)
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault()
    submit()
  })

  form.addEventListener("keydown", function (e) {
    if (e.keyCode == 27) {
      e.preventDefault()
      close()
    } else if (e.keyCode == 13 && !(e.ctrlKey || e.metaKey || e.shiftKey)) {
      e.preventDefault()
      submit()
    } else if (e.keyCode == 9) {
      window.setTimeout(function () {
        if (!wrapper.contains(document.activeElement)) { close() }
      }, 500)
    }
  })

  var input = form.elements[0]
  if (input) { input.focus() }
}
exports.openPrompt = openPrompt

function getValues(fields, domFields) {
  var result = Object.create(null), i = 0
  for (var name in fields) {
    var field = fields[name], dom = domFields[i++]
    var value = field.read(dom), bad = field.validate(value)
    if (bad) {
      reportInvalid(dom, bad)
      return null
    }
    result[name] = field.clean(value)
  }
  return result
}

function reportInvalid(dom, message) {
  // FIXME this is awful and needs a lot more work
  var parent = dom.parentNode
  var msg = parent.appendChild(document.createElement("div"))
  msg.style.left = (dom.offsetLeft + dom.offsetWidth + 2) + "px"
  msg.style.top = (dom.offsetTop - 5) + "px"
  msg.className = "ProseMirror-invalid"
  msg.textContent = message
  setTimeout(function () { return parent.removeChild(msg); }, 1500)
}

// ::- The type of field that `FieldPrompt` expects to be passed to it.
var Field = function Field(options) { this.options = options };

// render:: (state: EditorState, props: Object) → dom.Node
// Render the field to the DOM. Should be implemented by all subclasses.

// :: (dom.Node) → any
// Read the field's value from its DOM node.
Field.prototype.read = function read (dom) { return dom.value };

// :: (any) → ?string
// A field-type-specific validation function.
Field.prototype.validateType = function validateType (_value) {};

Field.prototype.validate = function validate (value) {
  if (!value && this.options.required)
    { return "Required field" }
  return this.validateType(value) || (this.options.validate && this.options.validate(value))
};

Field.prototype.clean = function clean (value) {
  return this.options.clean ? this.options.clean(value) : value
};
exports.Field = Field

// ::- A field class for single-line text fields.
var TextField = (function (Field) {
  function TextField () {
    Field.apply(this, arguments);
  }

  if ( Field ) TextField.__proto__ = Field;
  TextField.prototype = Object.create( Field && Field.prototype );
  TextField.prototype.constructor = TextField;

  TextField.prototype.render = function render () {
    var input = document.createElement("input")
    input.type = "text"
    input.placeholder = this.options.label
    input.value = this.options.value || ""
    input.autocomplete = "off"
    return input
  };

  return TextField;
}(Field));
exports.TextField = TextField


// ::- A field class for dropdown fields based on a plain `<select>`
// tag. Expects an option `options`, which should be an array of
// `{value: string, label: string}` objects, or a function taking a
// `ProseMirror` instance and returning such an array.
var SelectField = (function (Field) {
  function SelectField () {
    Field.apply(this, arguments);
  }

  if ( Field ) SelectField.__proto__ = Field;
  SelectField.prototype = Object.create( Field && Field.prototype );
  SelectField.prototype.constructor = SelectField;

  SelectField.prototype.render = function render () {
    var this$1 = this;

    var select = document.createElement("select")
    this.options.options.forEach(function (o) {
      var opt = select.appendChild(document.createElement("option"))
      opt.value = o.value
      opt.selected = o.value == this$1.options.value
      opt.label = o.label
    })
    return select
  };

  return SelectField;
}(Field));
exports.SelectField = SelectField

},{}],9:[function(require,module,exports){
var RopeSequence = require("rope-sequence")
var ref = require("prosemirror-transform");
var Mapping = ref.Mapping;
var ref$1 = require("prosemirror-state");
var Selection = ref$1.Selection;
var Plugin = ref$1.Plugin;
var PluginKey = ref$1.PluginKey;

// ProseMirror's history isn't simply a way to roll back to a previous
// state, because ProseMirror supports applying changes without adding
// them to the history (for example during collaboration).
//
// To this end, each 'Branch' (one for the undo history and one for
// the redo history) keeps an array of 'Items', which can optionally
// hold a step (an actual undoable change), and always hold a position
// map (which is needed to move changes below them to apply to the
// current document).
//
// An item that has both a step and a selection JSON representation is
// the start of an 'event' — a group of changes that will be undone
// or redone at once. (It stores only the JSON, since that way we don't
// have to provide a document until the selection is actually applied,
// which is useful when compressing.)

// Used to schedule history compression
var max_empty_items = 500

var Branch = function Branch(items, eventCount) {
  this.items = items
  this.eventCount = eventCount
};

// : (Node, bool, ?Item) → ?{transform: Transform, selection: Object}
// Pop the latest event off the branch's history and apply it
// to a document transform.
Branch.prototype.popEvent = function popEvent (state, preserveItems) {
    var this$1 = this;

  if (this.eventCount == 0) { return null }

  var end = this.items.length
  for (;; end--) {
    var next = this$1.items.get(end - 1)
    if (next.selection) { --end; break }
  }

  var remap, mapFrom
  if (preserveItems) {
    remap = this.remapping(end, this.items.length)
    mapFrom = remap.maps.length
  }
  var transform = state.tr
  var selection, remaining
  var addAfter = [], addBefore = []

  this.items.forEach(function (item, i) {
    if (!item.step) {
      if (!remap) {
        remap = this$1.remapping(end, i + 1)
        mapFrom = remap.maps.length
      }
      mapFrom--
      addBefore.push(item)
      return
    }

    if (remap) {
      addBefore.push(new Item(item.map))
      var step = item.step.map(remap.slice(mapFrom)), map

      if (step && transform.maybeStep(step).doc) {
        map = transform.mapping.maps[transform.mapping.maps.length - 1]
        addAfter.push(new Item(map, null, null, addAfter.length + addBefore.length))
      }
      mapFrom--
      if (map) { remap.appendMap(map, mapFrom) }
    } else {
      transform.maybeStep(item.step)
    }

    if (item.selection) {
      selection = remap ? Selection.mapJSON(item.selection, remap.slice(mapFrom)) : item.selection
      remaining = new Branch(this$1.items.slice(0, end).append(addBefore.reverse().concat(addAfter)), this$1.eventCount - 1)
      return false
    }
  }, this.items.length, 0)

  return {remaining: remaining, transform: transform, selection: selection}
};

// : (Transform, Selection, Object)
// Create a new branch with the given transform added.
Branch.prototype.addTransform = function addTransform (transform, selection, histOptions) {
  var newItems = [], eventCount = this.eventCount + (selection ? 1 : 0)
  var oldItems = this.items, lastItem = !histOptions.preserveItems && oldItems.length ? oldItems.get(oldItems.length - 1) : null

  for (var i = 0; i < transform.steps.length; i++) {
    var step = transform.steps[i].invert(transform.docs[i])
    var item = new Item(transform.mapping.maps[i], step, selection), merged = (void 0)
    if (merged = lastItem && lastItem.merge(item)) {
      item = merged
      if (i) { newItems.pop() }
      else { oldItems = oldItems.slice(0, oldItems.length - 1) }
    }
    newItems.push(item)
    selection = null
    if (!histOptions.preserveItems) { lastItem = item }
  }
  var overflow = this.eventCount - histOptions.depth
  if (overflow > DEPTH_OVERFLOW) { oldItems = cutOffEvents(oldItems, overflow) }
  return new Branch(oldItems.append(newItems), eventCount)
};

Branch.prototype.remapping = function remapping (from, to) {
  var maps = [], mirrors = []
  this.items.forEach(function (item, i) {
    if (item.mirrorOffset != null) {
      var mirrorPos = i - item.mirrorOffset
      if (mirrorPos >= from) { mirrors.push(maps.length - item.mirrorOffset, maps.length) }
    }
    maps.push(item.map)
  }, from, to)
  return new Mapping(maps, mirrors)
};

Branch.prototype.addMaps = function addMaps (array) {
  if (this.eventCount == 0) { return this }
  return new Branch(this.items.append(array.map(function (map) { return new Item(map); })), this.eventCount)
};

// : ([StepMap], Transform, [number])
// When the collab module receives remote changes, the history has
// to know about those, so that it can adjust the steps that were
// rebased on top of the remote changes, and include the position
// maps for the remote changes in its array of items.
Branch.prototype.rebased = function rebased (rebasedTransform, rebasedCount) {
  if (!this.eventCount) { return this }

  var rebasedItems = [], start = this.items.length - rebasedCount, startPos = 0
  if (start < 0) {
    startPos = -start
    start = 0
  }

  var mapping = rebasedTransform.mapping
  var newUntil = rebasedTransform.steps.length

  var iRebased = startPos
  this.items.forEach(function (item) {
    var pos = mapping.getMirror(iRebased++)
    if (pos == null) { return }
    newUntil = Math.min(newUntil, pos)
    var map = mapping.maps[pos]
    if (item.step) {
      var step = rebasedTransform.steps[pos].invert(rebasedTransform.docs[pos])
      var selection = item.selection && Selection.mapJSON(item.selection, mapping.slice(iRebased - 1, pos))
      rebasedItems.push(new Item(map, step, selection))
    } else {
      rebasedItems.push(new Item(map))
    }
  }, start)

  var newMaps = []
  for (var i = rebasedCount; i < newUntil; i++)
    { newMaps.push(new Item(mapping.maps[i])) }
  var items = this.items.slice(0, start).append(newMaps).append(rebasedItems)
  var branch = new Branch(items, this.eventCount) // FIXME might update event count
  if (branch.emptyItemCount() > max_empty_items)
    { branch = branch.compress(this.items.length - rebasedItems.length) }
  return branch
};

Branch.prototype.emptyItemCount = function emptyItemCount () {
  var count = 0
  this.items.forEach(function (item) { if (!item.step) { count++ } })
  return count
};

// Compressing a branch means rewriting it to push the air (map-only
// items) out. During collaboration, these naturally accumulate
// because each remote change adds one. The `upto` argument is used
// to ensure that only the items below a given level are compressed,
// because `rebased` relies on a clean, untouched set of items in
// order to associate old items with rebased steps.
Branch.prototype.compress = function compress (upto) {
    if ( upto === void 0 ) upto = this.items.length;

  var remap = this.remapping(0, upto), mapFrom = remap.maps.length
  var items = [], events = 0
  this.items.forEach(function (item, i) {
    if (i >= upto) {
      items.push(item)
    } else if (item.step) {
      var step = item.step.map(remap.slice(mapFrom)), map = step && step.getMap()
      mapFrom--
      if (map) { remap.appendMap(map, mapFrom) }
      if (step) {
        var selection = item.selection && Selection.mapJSON(item.selection, remap.slice(mapFrom))
        if (selection) { events++ }
        var newItem = new Item(map.invert(), step, selection), merged, last = items.length - 1
        if (merged = items.length && items[last].merge(newItem))
          { items[last] = merged }
        else
          { items.push(newItem) }
      }
    } else if (item.map) {
      mapFrom--
    }
  }, this.items.length, 0)
  return new Branch(RopeSequence.from(items.reverse()), events)
};

Branch.empty = new Branch(RopeSequence.empty, 0)

function cutOffEvents(items, n) {
  var cutPoint
  items.forEach(function (item, i) {
    if (item.selection && (--n == 0)) {
      cutPoint = i
      return false
    }
  })
  return items.slice(cutPoint)
}

var Item = function Item(map, step, selection, mirrorOffset) {
  this.map = map
  this.step = step
  this.selection = selection
  this.mirrorOffset = mirrorOffset
};

Item.prototype.merge = function merge (other) {
  if (this.step && other.step && !other.selection) {
    var step = other.step.merge(this.step)
    if (step) { return new Item(step.getMap().invert(), step, this.selection) }
  }
};

// The value of the state field that tracks undo/redo history for that
// state. Will be stored in the plugin state when the history plugin
// is active.
var HistoryState = function HistoryState(done, undone, prevMap, prevTime) {
  this.done = done
  this.undone = undone
  this.prevMap = prevMap
  this.prevTime = prevTime
};
exports.HistoryState = HistoryState

var DEPTH_OVERFLOW = 20

// : (EditorState, Transform, Selection, Object)
// Record a transformation in undo history.
function applyTransaction(history, selection, tr, options) {
  var newState = tr.getMeta(historyKey), rebased
  if (newState) {
    return newState
  } else if (tr.steps.length == 0) {
    if (tr.getMeta(closeHistoryKey)) { return new HistoryState(history.done, history.undone, null, 0) }
    else { return history }
  } else if (tr.getMeta("addToHistory") !== false) {
    // Group transforms that occur in quick succession into one event.
    var newGroup = history.prevTime < (tr.time || 0) - options.newGroupDelay ||
        !isAdjacentToLastStep(tr, history.prevMap, history.done)
    return new HistoryState(history.done.addTransform(tr, newGroup ? selection.toJSON() : null, options),
                            Branch.empty, tr.mapping.maps[tr.steps.length - 1], tr.time)
  } else if (rebased = tr.getMeta("rebased")) {
    // Used by the collab module to tell the history that some of its
    // content has been rebased.
    return new HistoryState(history.done.rebased(tr, rebased),
                            history.undone.rebased(tr, rebased),
                            history.prevMap && tr.mapping.maps[tr.steps.length - 1], history.prevTime)
  } else {
    return new HistoryState(history.done.addMaps(tr.mapping.maps),
                            history.undone.addMaps(tr.mapping.maps),
                            history.prevMap, history.prevTime)
  }
}

function isAdjacentToLastStep(transform, prevMap, done) {
  if (!prevMap) { return false }
  var firstMap = transform.mapping.maps[0], adjacent = false
  if (!firstMap) { return true }
  firstMap.forEach(function (start, end) {
    done.items.forEach(function (item) {
      if (item.step) {
        prevMap.forEach(function (_start, _end, rStart, rEnd) {
          if (start <= rEnd && end >= rStart) { adjacent = true }
        })
        return false
      } else {
        start = item.map.invert().map(start, -1)
        end = item.map.invert().map(end, 1)
      }
    }, done.items.length, 0)
  })
  return adjacent
}

// : (HistoryState, EditorState, (tr: Transaction), bool)
// Apply the latest event from one branch to the document and optionally
// shift the event onto the other branch. Returns true when an event could
// be shifted.
function histTransaction(history, state, dispatch, redo) {
  var histOptions = historyKey.get(state).options.config
  var pop = (redo ? history.undone : history.done).popEvent(state, histOptions.preserveItems)
  if (!pop) { return }

  var selectionBefore = state.selection
  var selection = Selection.fromJSON(pop.transform.doc, pop.selection)
  var added = (redo ? history.done : history.undone).addTransform(pop.transform, selectionBefore.toJSON(), histOptions)

  var newHist = new HistoryState(redo ? added : pop.remaining, redo ? pop.remaining : added, null, 0)
  dispatch(pop.transform.setSelection(selection).setMeta(historyKey, newHist).scrollIntoView())
}

function closeHistory(state) {
  return state.tr.setMeta(closeHistoryKey, true)
}
exports.closeHistory = closeHistory

var historyKey = new PluginKey("history")
var closeHistoryKey = new PluginKey("closeHistory")

// :: (?Object) → Plugin
// Returns a plugin that enables the undo history for an editor. The
// plugin will track undo and redo stacks, which the
// [`undo`](##history.undo) and [`redo`](##history.redo) commands can
// use to move the state back and forward.
//
// Note that this implementation doesn't implement history by simply
// resetting back to some previous state. In order to support
// collaborative editing (as well as some other use cases), it
// selectively rolls back some transactions, but not other (for
// example, not the changes made by other users). You can set an
// `"addToHistory"` [metadata property](##state.Transaction.setMeta)
// of `false` on a transaction to prevent it from being rolled back by
// undo.
//
//   config::-
//   Supports the following configuration options:
//
//     depth:: ?number
//     The amount of history events that are collected before the
//     oldest events are discarded. Defaults to 100.
//
//     newGroupDelay:: number
//     The delay between changes after which a new group should be
//     started. Defaults to 500 (milliseconds). Note that when changes
//     aren't adjacent, a new group is always started.
//
//     preserveItems:: ?bool
//     Whether to preserve the steps exactly as they came in. **Must**
//     be true when using the history together with the collaborative
//     editing plugin, to allow syncing the history when concurrent
//     changes come in. Defaults to false.
function history(config) {
  config = {depth: config && config.depth || 100,
            preserveItems: !!(config && config.preserveItems),
            newGroupDelay: config && config.newGroupDelay || 500}
  return new Plugin({
    key: historyKey,

    state: {
      init: function init() {
        return new HistoryState(Branch.empty, Branch.empty, null, 0)
      },
      apply: function apply(tr, hist, state) {
        return applyTransaction(hist, state.selection, tr, config)
      }
    },

    config: config
  })
}
exports.history = history

// :: (EditorState, ?(tr: Transaction)) → bool
// A command function that undoes the last change, if any.
function undo(state, dispatch) {
  var hist = historyKey.getState(state)
  if (!hist || hist.done.eventCount == 0) { return false }
  if (dispatch) { histTransaction(hist, state, dispatch, false) }
  return true
}
exports.undo = undo

// :: (EditorState, ?(tr: Transaction)) → bool
// A command function that redoes the last undone change, if any.
function redo(state, dispatch) {
  var hist = historyKey.getState(state)
  if (!hist || hist.undone.eventCount == 0) { return false }
  if (dispatch) { histTransaction(hist, state, dispatch, true) }
  return true
}
exports.redo = redo

// :: (EditorState) → number
// The amount of undoable events available in a given state.
function undoDepth(state) {
  var hist = historyKey.getState(state)
  return hist ? hist.done.eventCount : 0
}
exports.undoDepth = undoDepth

// :: (EditorState) → number
// The amount of redoable events available in a given editor state.
function redoDepth(state) {
  var hist = historyKey.getState(state)
  return hist ? hist.undone.eventCount : 0
}
exports.redoDepth = redoDepth

},{"prosemirror-state":34,"prosemirror-transform":39,"rope-sequence":59}],10:[function(require,module,exports){
;var assign;
((assign = require("./inputrules"), exports.InputRule = assign.InputRule, exports.inputRules = assign.inputRules))
;var assign$1;
((assign$1 = require("./rules"), exports.emDash = assign$1.emDash, exports.ellipsis = assign$1.ellipsis, exports.openDoubleQuote = assign$1.openDoubleQuote, exports.closeDoubleQuote = assign$1.closeDoubleQuote, exports.openSingleQuote = assign$1.openSingleQuote, exports.closeSingleQuote = assign$1.closeSingleQuote, exports.smartQuotes = assign$1.smartQuotes, exports.allInputRules = assign$1.allInputRules))
;var assign$2;
((assign$2 = require("./util"), exports.wrappingInputRule = assign$2.wrappingInputRule, exports.textblockTypeInputRule = assign$2.textblockTypeInputRule, exports.blockQuoteRule = assign$2.blockQuoteRule, exports.orderedListRule = assign$2.orderedListRule, exports.bulletListRule = assign$2.bulletListRule, exports.codeBlockRule = assign$2.codeBlockRule, exports.headingRule = assign$2.headingRule))

},{"./inputrules":11,"./rules":12,"./util":13}],11:[function(require,module,exports){
var ref = require("prosemirror-state");
var Plugin = ref.Plugin;
var PluginKey = ref.PluginKey;

// ::- Input rules are regular expressions describing a piece of text
// that, when typed, causes something to happen. This might be
// changing two dashes into an emdash, wrapping a paragraph starting
// with `"> "` into a blockquote, or something entirely different.
var InputRule = function InputRule(match, handler) {
  this.match = match
  this.handler = typeof handler == "string" ? stringHandler(handler) : handler
};
exports.InputRule = InputRule

function stringHandler(string) {
  return function(state, match, start, end) {
    var insert = string
    if (match[1]) {
      var offset = match[0].lastIndexOf(match[1])
      insert += match[0].slice(offset + match[1].length)
      start += offset
      var cutOff = start - end
      if (cutOff > 0) {
        insert = match[0].slice(offset - cutOff, offset) + insert
        start = end
      }
    }
    var marks = state.doc.resolve(start).marks()
    return state.tr.replaceWith(start, end, state.schema.text(insert, marks))
  }
}

var MAX_MATCH = 100

var stateKey = new PluginKey("fromInputRule")

// :: (config: {rules: [InputRule]}) → Plugin
// Create an input rules plugin. When enabled, it will cause text
// input that matches any of the given rules to trigger the rule's
// action, and binds the backspace key, when applied directly after an
// input rule triggered, to undo the rule's effect.
function inputRules(ref) {
  var rules = ref.rules;

  return new Plugin({
    state: {
      init: function init() { return null },
      apply: function apply(tr, prev) {
        var stored = tr.getMeta(stateKey)
        if (stored) { return stored }
        return tr.selectionSet || tr.docChanged ? null : prev
      }
    },

    props: {
      handleTextInput: function handleTextInput(view, from, to, text) {
        var state = view.state, $from = state.doc.resolve(from)
        var textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - MAX_MATCH), $from.parentOffset,
                                                  null, "\ufffc") + text
        for (var i = 0; i < rules.length; i++) {
          var match = rules[i].match.exec(textBefore)
          var tr = match && rules[i].handler(state, match, from - (match[0].length - text.length), to)
          if (!tr) { continue }
          view.dispatch(tr.setMeta(stateKey, {transform: tr, from: from, to: to, text: text}))
          return true
        }
        return false
      },

      handleKeyDown: function handleKeyDown(view, event) {
        if (event.keyCode == 8) { return maybeUndoInputRule(view.state, view.dispatch, this.getState(view.state)) }
        return false
      }
    }
  })
}
exports.inputRules = inputRules

function maybeUndoInputRule(state, dispatch, undoable) {
  if (!undoable) { return false }
  var tr = state.tr, toUndo = undoable.transform
  for (var i = toUndo.steps.length - 1; i >= 0; i--)
    { tr.step(toUndo.steps[i].invert(toUndo.docs[i])) }
  var marks = tr.doc.resolve(undoable.from).marks()
  dispatch(tr.replaceWith(undoable.from, undoable.to, state.schema.text(undoable.text, marks)))
  return true
}

},{"prosemirror-state":34}],12:[function(require,module,exports){
var ref = require("./inputrules");
var InputRule = ref.InputRule;

// :: InputRule Converts double dashes to an emdash.
var emDash = new InputRule(/--$/, "—")
exports.emDash = emDash
// :: InputRule Converts three dots to an ellipsis character.
var ellipsis = new InputRule(/\.\.\.$/, "…")
exports.ellipsis = ellipsis
// :: InputRule “Smart” opening double quotes.
var openDoubleQuote = new InputRule(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(")$/, "“")
exports.openDoubleQuote = openDoubleQuote
// :: InputRule “Smart” closing double quotes.
var closeDoubleQuote = new InputRule(/"$/, "”")
exports.closeDoubleQuote = closeDoubleQuote
// :: InputRule “Smart” opening single quotes.
var openSingleQuote = new InputRule(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(')$/, "‘")
exports.openSingleQuote = openSingleQuote
// :: InputRule “Smart” closing single quotes.
var closeSingleQuote = new InputRule(/'$/, "’")
exports.closeSingleQuote = closeSingleQuote

// :: [InputRule] Smart-quote related input rules.
var smartQuotes = [openDoubleQuote, closeDoubleQuote, openSingleQuote, closeSingleQuote]
exports.smartQuotes = smartQuotes

// :: [InputRule] All schema-independent input rules defined in this module.
var allInputRules = [emDash, ellipsis].concat(smartQuotes)
exports.allInputRules = allInputRules

},{"./inputrules":11}],13:[function(require,module,exports){
var ref = require("./inputrules");
var InputRule = ref.InputRule;
var ref$1 = require("prosemirror-transform");
var findWrapping = ref$1.findWrapping;
var canJoin = ref$1.canJoin;

// :: (RegExp, NodeType, ?union<Object, ([string]) → ?Object>, ?([string], Node) → bool) → InputRule
// Build an input rule for automatically wrapping a textblock when a
// given string is typed. The `regexp` argument is
// directly passed through to the `InputRule` constructor. You'll
// probably want the regexp to start with `^`, so that the pattern can
// only occur at the start of a textblock.
//
// `nodeType` is the type of node to wrap in. If it needs attributes,
// you can either pass them directly, or pass a function that will
// compute them from the regular expression match.
//
// By default, if there's a node with the same type above the newly
// wrapped node, the rule will try to [join](#transform.Transform.join) those
// two nodes. You can pass a join predicate, which takes a regular
// expression match and the node before the wrapped node, and can
// return a boolean to indicate whether a join should happen.
function wrappingInputRule(regexp, nodeType, getAttrs, joinPredicate) {
  return new InputRule(regexp, function (state, match, start, end) {
    var attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
    var tr = state.tr.delete(start, end)
    var $start = tr.doc.resolve(start), range = $start.blockRange(), wrapping = range && findWrapping(range, nodeType, attrs)
    if (!wrapping) { return null }
    tr.wrap(range, wrapping)
    var before = tr.doc.resolve(start - 1).nodeBefore
    if (before && before.type == nodeType && canJoin(tr.doc, start - 1) &&
        (!joinPredicate || joinPredicate(match, before)))
      { tr.join(start - 1) }
    return tr
  })
}
exports.wrappingInputRule = wrappingInputRule

// :: (RegExp, NodeType, ?union<Object, ([string]) → ?Object>) → InputRule
// Build an input rule that changes the type of a textblock when the
// matched text is typed into it. You'll usually want to start your
// regexp with `^` to that it is only matched at the start of a
// textblock. The optional `getAttrs` parameter can be used to compute
// the new node's attributes, and works the same as in the
// `wrappingInputRule` function.
function textblockTypeInputRule(regexp, nodeType, getAttrs) {
  return new InputRule(regexp, function (state, match, start, end) {
    var $start = state.doc.resolve(start)
    var attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
    if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType, attrs)) { return null }
    return state.tr
      .delete(start, end)
      .setBlockType(start, start, nodeType, attrs)
  })
}
exports.textblockTypeInputRule = textblockTypeInputRule


// :: (NodeType) → InputRule
// Given a blockquote node type, returns an input rule that turns `"> "`
// at the start of a textblock into a blockquote.
function blockQuoteRule(nodeType) {
  return wrappingInputRule(/^\s*> $/, nodeType)
}
exports.blockQuoteRule = blockQuoteRule

// :: (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a number
// followed by a dot at the start of a textblock into an ordered list.
function orderedListRule(nodeType) {
  return wrappingInputRule(/^(\d+)\. $/, nodeType, function (match) { return ({order: +match[1]}); },
                           function (match, node) { return node.childCount + node.attrs.order == +match[1]; })
}
exports.orderedListRule = orderedListRule

// :: (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a bullet
// (dash, plush, or asterisk) at the start of a textblock into a
// bullet list.
function bulletListRule(nodeType) {
  return wrappingInputRule(/^\s*([-+*]) $/, nodeType)
}
exports.bulletListRule = bulletListRule

// :: (NodeType) → InputRule
// Given a code block node type, returns an input rule that turns a
// textblock starting with three backticks into a code block.
function codeBlockRule(nodeType) {
  return textblockTypeInputRule(/^```$/, nodeType)
}
exports.codeBlockRule = codeBlockRule

// :: (NodeType, number) → InputRule
// Given a node type and a maximum level, creates an input rule that
// turns up to that number of `#` characters followed by a space at
// the start of a textblock into a heading whose level corresponds to
// the number of `#` signs.
function headingRule(nodeType, maxLevel) {
  return textblockTypeInputRule(new RegExp("^(#{1," + maxLevel + "}) $"),
                                nodeType, function (match) { return ({level: match[1].length}); })
}
exports.headingRule = headingRule

},{"./inputrules":11,"prosemirror-transform":39}],14:[function(require,module,exports){
var keyName = require("w3c-keyname")
var ref = require("prosemirror-state");
var Plugin = ref.Plugin;

// declare global: navigator

var mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false

function normalizeKeyName(name) {
  var parts = name.split(/-(?!$)/), result = parts[parts.length - 1]
  if (result == "Space") { result = " " }
  var alt, ctrl, shift, meta
  for (var i = 0; i < parts.length - 1; i++) {
    var mod = parts[i]
    if (/^(cmd|meta|m)$/i.test(mod)) { meta = true }
    else if (/^a(lt)?$/i.test(mod)) { alt = true }
    else if (/^(c|ctrl|control)$/i.test(mod)) { ctrl = true }
    else if (/^s(hift)?$/i.test(mod)) { shift = true }
    else if (/^mod$/i.test(mod)) { if (mac) { meta = true; } else { ctrl = true } }
    else { throw new Error("Unrecognized modifier name: " + mod) }
  }
  if (alt) { result = "Alt-" + result }
  if (ctrl) { result = "Ctrl-" + result }
  if (meta) { result = "Meta-" + result }
  if (shift) { result = "Shift-" + result }
  return result
}

function normalize(map) {
  var copy = Object.create(null)
  for (var prop in map) { copy[normalizeKeyName(prop)] = map[prop] }
  return copy
}

function modifiers(name, event, shift) {
  if (event.altKey) { name = "Alt-" + name }
  if (event.ctrlKey) { name = "Ctrl-" + name }
  if (event.metaKey) { name = "Meta-" + name }
  if (shift !== false && event.shiftKey) { name = "Shift-" + name }
  return name
}

// :: (Object) → Plugin
// Create a keymap plugin for the given set of bindings.
//
// Bindings should map key names to [command](#commands)-style
// functions, which will be called with `(EditorState, dispatch,
// EditorView)` arguments, and should return true when they've handled
// the key. Note that the view argument isn't part of the command
// protocol, but can be used as an escape hatch if a binding needs to
// directly interact with the UI.
//
// Key names may be strings like `"Shift-Ctrl-Enter"`, a key
// identifier prefixed with zero or more modifiers. Key identifiers
// are based on the strings that can appear in
// [`KeyEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
// Use lowercase letters to refer to letter keys (or uppercase letters
// if you want shift to be held). You may use `"Space"` as an alias
// for the `" "` name.
//
// Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
// `a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or
// `Meta-`) are recognized. For characters that are created by holding
// shift, the `Shift-` prefix is implied, and should not be added
// explicitly.
//
// You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
// other platforms.
//
// You can add multiple keymap plugins to an editor. The order in
// which they appear determines their precedence (the ones early in
// the array get to dispatch first).
function keymap(bindings) {
  var map = normalize(bindings)

  return new Plugin({
    props: {
      handleKeyDown: function handleKeyDown(view, event) {
        var name = keyName(event), isChar = name.length == 1 && name != " ", baseName
        var direct = map[modifiers(name, event, !isChar)]
        if (direct && direct(view.state, view.dispatch, view)) { return true }
        if (event.shiftKey && isChar && (baseName = keyName.base[event.keyCode])) {
          var withShift = map[modifiers(baseName, event, true)]
          if (withShift && withShift(view.state, view.dispatch, view)) { return true }
        }
        return false
      }
    }
  })
}
exports.keymap = keymap

},{"prosemirror-state":34,"w3c-keyname":60}],15:[function(require,module,exports){
var SVG = "http://www.w3.org/2000/svg"
var XLINK = "http://www.w3.org/1999/xlink"

var prefix = "ProseMirror-icon"

function hashPath(path) {
  var hash = 0
  for (var i = 0; i < path.length; i++)
    { hash = (((hash << 5) - hash) + path.charCodeAt(i)) | 0 }
  return hash
}

function getIcon(icon) {
  var node = document.createElement("div")
  node.className = prefix
  if (icon.path) {
    var name = "pm-icon-" + hashPath(icon.path).toString(16)
    if (!document.getElementById(name)) { buildSVG(name, icon) }
    var svg = node.appendChild(document.createElementNS(SVG, "svg"))
    svg.style.width = (icon.width / icon.height) + "em"
    var use = svg.appendChild(document.createElementNS(SVG, "use"))
    use.setAttributeNS(XLINK, "href", /([^#]*)/.exec(document.location)[1] + "#" + name)
  } else if (icon.dom) {
    node.appendChild(icon.dom.cloneNode(true))
  } else {
    node.appendChild(document.createElement("span")).textContent = icon.text || ''
    if (icon.css) { node.firstChild.style.cssText = icon.css }
  }
  return node
}
exports.getIcon = getIcon

function buildSVG(name, data) {
  var collection = document.getElementById(prefix + "-collection")
  if (!collection) {
    collection = document.createElementNS(SVG, "svg")
    collection.id = prefix + "-collection"
    collection.style.display = "none"
    document.body.insertBefore(collection, document.body.firstChild)
  }
  var sym = document.createElementNS(SVG, "symbol")
  sym.id = name
  sym.setAttribute("viewBox", "0 0 " + data.width + " " + data.height)
  var path = sym.appendChild(document.createElementNS(SVG, "path"))
  path.setAttribute("d", data.path)
  collection.appendChild(sym)
}

},{}],16:[function(require,module,exports){
;var assign;
((assign = require("./menu"), exports.MenuItem = assign.MenuItem, exports.Dropdown = assign.Dropdown, exports.DropdownSubmenu = assign.DropdownSubmenu, exports.renderGrouped = assign.renderGrouped, exports.icons = assign.icons, exports.joinUpItem = assign.joinUpItem, exports.liftItem = assign.liftItem, exports.selectParentNodeItem = assign.selectParentNodeItem, exports.undoItem = assign.undoItem, exports.redoItem = assign.redoItem, exports.wrapItem = assign.wrapItem, exports.blockTypeItem = assign.blockTypeItem))
exports.MenuBarEditorView = require("./menubar").MenuBarEditorView

// !! This module defines a number of building blocks for ProseMirror
// menus, along with a [menu bar](#menu.MenuBarEditorView) implementation.

// MenuElement:: interface
// The types defined in this module aren't the only thing you can
// display in your menu. Anything that conforms to this interface can
// be put into a menu structure.
//
//   render:: (pm: ProseMirror) → ?dom.Node
//   Render the element for display in the menu. Returning `null` can be
//   used to signal that this element shouldn't be displayed for the
//   given editor state.

},{"./menu":17,"./menubar":18}],17:[function(require,module,exports){
var crel = require("crel")
var ref = require("prosemirror-commands");
var lift = ref.lift;
var joinUp = ref.joinUp;
var selectParentNode = ref.selectParentNode;
var wrapIn = ref.wrapIn;
var setBlockType = ref.setBlockType;
var ref$1 = require("prosemirror-history");
var undo = ref$1.undo;
var redo = ref$1.redo;

var ref$2 = require("./icons");
var getIcon = ref$2.getIcon;

var prefix = "ProseMirror-menu"

// ::- An icon or label that, when clicked, executes a command.
var MenuItem = function MenuItem(spec) {
  // :: MenuItemSpec
  // The spec used to create the menu item.
  this.spec = spec
};

// :: (EditorView) → dom.Node
// Renders the icon according to its [display
// spec](#menu.MenuItemSpec.display), and adds an event handler which
// executes the command when the representation is clicked.
MenuItem.prototype.render = function render (view) {
  var disabled = false, spec = this.spec
  if (spec.select && !spec.select(view.state)) {
    if (spec.onDeselected == "disable") { disabled = true }
    else { return null }
  }
  var active = spec.active && !disabled && spec.active(view.state)

  var dom
  if (spec.render) {
    dom = spec.render(view)
  } else if (spec.icon) {
    dom = getIcon(spec.icon)
    if (active) { dom.classList.add(prefix + "-active") }
  } else if (spec.label) {
    dom = crel("div", null, translate(view, spec.label))
  } else {
    throw new RangeError("MenuItem without render, icon, or label property")
  }

  if (spec.title) { dom.setAttribute("title", translate(view, spec.title)) }
  if (spec.class) { dom.classList.add(spec.class) }
  if (disabled) { dom.classList.add(prefix + "-disabled") }
  if (spec.css) { dom.style.cssText += spec.css }
  if (!disabled) { dom.addEventListener(spec.execEvent || "mousedown", function (e) {
    e.preventDefault()
    spec.run(view.state, view.dispatch, view)
  }) }
  return dom
};
exports.MenuItem = MenuItem

function translate(view, text) {
  return view.props.translate ? view.props.translate(text) : text
}

// MenuItemSpec:: interface
// The configuration object passed to the `MenuItem` constructor.
//
//   run:: (EditorState, (Transaction), EditorView)
//   The function to execute when the menu item is activated.
//
//   select:: ?(EditorState) → bool
//   Optional function that is used to determine whether the item is
//   appropriate at the moment.
//
//   onDeselect:: ?string
//   Determines what happens when [`select`](#menu.MenuItemSpec.select)
//   returns false. The default is to hide the item, you can set this to
//   `"disable"` to instead render the item with a disabled style.
//
//   active:: ?(EditorState) → bool
//   A predicate function to determine whether the item is 'active' (for
//   example, the item for toggling the strong mark might be active then
//   the cursor is in strong text).
//
//   render:: ?(EditorView) → dom.Node
//   A function that renders the item. You must provide either this,
//   [`icon`](#menu.MenuItemSpec.icon), or [`label`](#MenuItemSpec.label).
//
//   icon:: ?Object
//   Describes an icon to show for this item. The object may specify
//   an SVG icon, in which case its `path` property should be an [SVG
//   path
//   spec](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d),
//   and `width` and `height` should provide the viewbox in which that
//   path exists. Alternatively, it may have a `text` property
//   specifying a string of text that makes up the icon, with an
//   optional `css` property giving additional CSS styling for the
//   text. _Or_ it may contain `dom` property containing a DOM node.
//
//   label:: ?string
//   Makes the item show up as a text label. Mostly useful for items
//   wrapped in a [drop-down](#menu.Dropdown) or similar menu. The object
//   should have a `label` property providing the text to display.
//
//   title:: ?string
//   Defines DOM title (mouseover) text for the item.
//
//   class:: string
//   Optionally adds a CSS class to the item's DOM representation.
//
//   css:: string
//   Optionally adds a string of inline CSS to the item's DOM
//   representation.
//
//   execEvent:: string
//   Defines which event on the command's DOM representation should
//   trigger the execution of the command. Defaults to mousedown.

var lastMenuEvent = {time: 0, node: null}
function markMenuEvent(e) {
  lastMenuEvent.time = Date.now()
  lastMenuEvent.node = e.target
}
function isMenuEvent(wrapper) {
  return Date.now() - 100 < lastMenuEvent.time &&
    lastMenuEvent.node && wrapper.contains(lastMenuEvent.node)
}

// ::- A drop-down menu, displayed as a label with a downwards-pointing
// triangle to the right of it.
var Dropdown = function Dropdown(content, options) {
  this.options = options || {}
  this.content = Array.isArray(content) ? content : [content]
};

// :: (EditorView) → dom.Node
// Returns a node showing the collapsed menu, which expands when clicked.
Dropdown.prototype.render = function render (view) {
    var this$1 = this;

  var items = renderDropdownItems(this.content, view)
  if (!items.length) { return null }

  var label = crel("div", {class: prefix + "-dropdown " + (this.options.class || ""),
                           style: this.options.css,
                           title: this.options.title && translate(view, this.options.title)},
                  translate(view, this.options.label))
  var wrap = crel("div", {class: prefix + "-dropdown-wrap"}, label)
  var open = null, listeningOnClose = null
  var close = function () {
    if (open && open.close()) {
      open = null
      window.removeEventListener("mousedown", listeningOnClose)
    }
  }
  label.addEventListener("mousedown", function (e) {
    e.preventDefault()
    markMenuEvent(e)
    if (open) {
      close()
    } else {
      open = this$1.expand(wrap, items)
      window.addEventListener("mousedown", listeningOnClose = function () {
        if (!isMenuEvent(wrap)) { close() }
      })
    }
  })
  return wrap
};

Dropdown.prototype.expand = function expand (dom, items) {
  var menuDOM = crel("div", {class: prefix + "-dropdown-menu " + (this.options.class || "")}, items)

  var done = false
  function close() {
    if (done) { return }
    done = true
    dom.removeChild(menuDOM)
    return true
  }
  dom.appendChild(menuDOM)
  return {close: close, node: menuDOM}
};
exports.Dropdown = Dropdown

function renderDropdownItems(items, view) {
  var rendered = []
  for (var i = 0; i < items.length; i++) {
    var inner = items[i].render(view)
    if (inner) { rendered.push(crel("div", {class: prefix + "-dropdown-item"}, inner)) }
  }
  return rendered
}

// ::- Represents a submenu wrapping a group of elements that start
// hidden and expand to the right when hovered over or tapped.
var DropdownSubmenu = function DropdownSubmenu(content, options) {
  this.options = options || {}
  this.content = Array.isArray(content) ? content : [content]
};

// :: (EditorView) → dom.Node
// Renders the submenu.
DropdownSubmenu.prototype.render = function render (view) {
  var items = renderDropdownItems(this.content, view)
  if (!items.length) { return null }

  var label = crel("div", {class: prefix + "-submenu-label"}, translate(view, this.options.label))
  var wrap = crel("div", {class: prefix + "-submenu-wrap"}, label,
                 crel("div", {class: prefix + "-submenu"}, items))
  var listeningOnClose = null
  label.addEventListener("mousedown", function (e) {
    e.preventDefault()
    markMenuEvent(e)
    wrap.classList.toggle(prefix + "-submenu-wrap-active")
    if (!listeningOnClose)
      { window.addEventListener("mousedown", listeningOnClose = function () {
        if (!isMenuEvent(wrap)) {
          wrap.classList.remove(prefix + "-submenu-wrap-active")
          window.removeEventListener("mousedown", listeningOnClose)
          listeningOnClose = null
        }
      }) }
  })
  return wrap
};
exports.DropdownSubmenu = DropdownSubmenu

// :: (EditorView, [union<MenuElement, [MenuElement]>]) → ?dom.DocumentFragment
// Render the given, possibly nested, array of menu elements into a
// document fragment, placing separators between them (and ensuring no
// superfluous separators appear when some of the groups turn out to
// be empty).
function renderGrouped(view, content) {
  var result = document.createDocumentFragment(), needSep = false
  for (var i = 0; i < content.length; i++) {
    var items = content[i], added = false
    for (var j = 0; j < items.length; j++) {
      var rendered = items[j].render(view)
      if (rendered) {
        if (!added && needSep) { result.appendChild(separator()) }
        result.appendChild(crel("span", {class: prefix + "item"}, rendered))
        added = true
      }
    }
    if (added) { needSep = true }
  }
  return result
}
exports.renderGrouped = renderGrouped

function separator() {
  return crel("span", {class: prefix + "separator"})
}

// :: Object
// A set of basic editor-related icons. Contains the properties
// `join`, `lift`, `selectParentNode`, `undo`, `redo`, `strong`, `em`,
// `code`, `link`, `bulletList`, `orderedList`, and `blockquote`, each
// holding an object that can be used as the `icon` option to
// `MenuItem`.
var icons = {
  join: {
    width: 800, height: 900,
    path: "M0 75h800v125h-800z M0 825h800v-125h-800z M250 400h100v-100h100v100h100v100h-100v100h-100v-100h-100z"
  },
  lift: {
    width: 1024, height: 1024,
    path: "M219 310v329q0 7-5 12t-12 5q-8 0-13-5l-164-164q-5-5-5-13t5-13l164-164q5-5 13-5 7 0 12 5t5 12zM1024 749v109q0 7-5 12t-12 5h-987q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h987q7 0 12 5t5 12zM1024 530v109q0 7-5 12t-12 5h-621q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h621q7 0 12 5t5 12zM1024 310v109q0 7-5 12t-12 5h-621q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h621q7 0 12 5t5 12zM1024 91v109q0 7-5 12t-12 5h-987q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h987q7 0 12 5t5 12z"
  },
  selectParentNode: {text: "\u2b1a", css: "font-weight: bold"},
  undo: {
    width: 1024, height: 1024,
    path: "M761 1024c113-206 132-520-313-509v253l-384-384 384-384v248c534-13 594 472 313 775z"
  },
  redo: {
    width: 1024, height: 1024,
    path: "M576 248v-248l384 384-384 384v-253c-446-10-427 303-313 509-280-303-221-789 313-775z"
  },
  strong: {
    width: 805, height: 1024,
    path: "M317 869q42 18 80 18 214 0 214-191 0-65-23-102-15-25-35-42t-38-26-46-14-48-6-54-1q-41 0-57 5 0 30-0 90t-0 90q0 4-0 38t-0 55 2 47 6 38zM309 442q24 4 62 4 46 0 81-7t62-25 42-51 14-81q0-40-16-70t-45-46-61-24-70-8q-28 0-74 7 0 28 2 86t2 86q0 15-0 45t-0 45q0 26 0 39zM0 950l1-53q8-2 48-9t60-15q4-6 7-15t4-19 3-18 1-21 0-19v-37q0-561-12-585-2-4-12-8t-25-6-28-4-27-2-17-1l-2-47q56-1 194-6t213-5q13 0 39 0t38 0q40 0 78 7t73 24 61 40 42 59 16 78q0 29-9 54t-22 41-36 32-41 25-48 22q88 20 146 76t58 141q0 57-20 102t-53 74-78 48-93 27-100 8q-25 0-75-1t-75-1q-60 0-175 6t-132 6z"
  },
  em: {
    width: 585, height: 1024,
    path: "M0 949l9-48q3-1 46-12t63-21q16-20 23-57 0-4 35-165t65-310 29-169v-14q-13-7-31-10t-39-4-33-3l10-58q18 1 68 3t85 4 68 1q27 0 56-1t69-4 56-3q-2 22-10 50-17 5-58 16t-62 19q-4 10-8 24t-5 22-4 26-3 24q-15 84-50 239t-44 203q-1 5-7 33t-11 51-9 47-3 32l0 10q9 2 105 17-1 25-9 56-6 0-18 0t-18 0q-16 0-49-5t-49-5q-78-1-117-1-29 0-81 5t-69 6z"
  },
  code: {
    width: 896, height: 1024,
    path: "M608 192l-96 96 224 224-224 224 96 96 288-320-288-320zM288 192l-288 320 288 320 96-96-224-224 224-224-96-96z"
  },
  link: {
    width: 951, height: 1024,
    path: "M832 694q0-22-16-38l-118-118q-16-16-38-16-24 0-41 18 1 1 10 10t12 12 8 10 7 14 2 15q0 22-16 38t-38 16q-8 0-15-2t-14-7-10-8-12-12-10-10q-18 17-18 41 0 22 16 38l117 118q15 15 38 15 22 0 38-14l84-83q16-16 16-38zM430 292q0-22-16-38l-117-118q-16-16-38-16-22 0-38 15l-84 83q-16 16-16 38 0 22 16 38l118 118q15 15 38 15 24 0 41-17-1-1-10-10t-12-12-8-10-7-14-2-15q0-22 16-38t38-16q8 0 15 2t14 7 10 8 12 12 10 10q18-17 18-41zM941 694q0 68-48 116l-84 83q-47 47-116 47-69 0-116-48l-117-118q-47-47-47-116 0-70 50-119l-50-50q-49 50-118 50-68 0-116-48l-118-118q-48-48-48-116t48-116l84-83q47-47 116-47 69 0 116 48l117 118q47 47 47 116 0 70-50 119l50 50q49-50 118-50 68 0 116 48l118 118q48 48 48 116z"
  },
  bulletList: {
    width: 768, height: 896,
    path: "M0 512h128v-128h-128v128zM0 256h128v-128h-128v128zM0 768h128v-128h-128v128zM256 512h512v-128h-512v128zM256 256h512v-128h-512v128zM256 768h512v-128h-512v128z"
  },
  orderedList: {
    width: 768, height: 896,
    path: "M320 512h448v-128h-448v128zM320 768h448v-128h-448v128zM320 128v128h448v-128h-448zM79 384h78v-256h-36l-85 23v50l43-2v185zM189 590c0-36-12-78-96-78-33 0-64 6-83 16l1 66c21-10 42-15 67-15s32 11 32 28c0 26-30 58-110 112v50h192v-67l-91 2c49-30 87-66 87-113l1-1z"
  },
  blockquote: {
    width: 640, height: 896,
    path: "M0 448v256h256v-256h-128c0 0 0-128 128-128v-128c0 0-256 0-256 256zM640 320v-128c0 0-256 0-256 256v256h256v-256h-128c0 0 0-128 128-128z"
  }
}
exports.icons = icons

// :: MenuItem
// Menu item for the `joinUp` command.
var joinUpItem = new MenuItem({
  title: "Join with above block",
  run: joinUp,
  select: function (state) { return joinUp(state); },
  icon: icons.join
})
exports.joinUpItem = joinUpItem

// :: MenuItem
// Menu item for the `lift` command.
var liftItem = new MenuItem({
  title: "Lift out of enclosing block",
  run: lift,
  select: function (state) { return lift(state); },
  icon: icons.lift
})
exports.liftItem = liftItem

// :: MenuItem
// Menu item for the `selectParentNode` command.
var selectParentNodeItem = new MenuItem({
  title: "Select parent node",
  run: selectParentNode,
  select: function (state) { return selectParentNode(state); },
  icon: icons.selectParentNode
})
exports.selectParentNodeItem = selectParentNodeItem

// :: (Object) → MenuItem
// Menu item for the `undo` command.
var undoItem = new MenuItem({
  title: "Undo last change",
  run: undo,
  select: function (state) { return undo(state); },
  icon: icons.undo
})
exports.undoItem = undoItem

// :: (Object) → MenuItem
// Menu item for the `redo` command.
var redoItem = new MenuItem({
  title: "Redo last undone change",
  run: redo,
  select: function (state) { return redo(state); },
  icon: icons.redo
})
exports.redoItem = redoItem

// :: (NodeType, Object) → MenuItem
// Build a menu item for wrapping the selection in a given node type.
// Adds `run` and `select` properties to the ones present in
// `options`. `options.attrs` may be an object or a function, as in
// `toggleMarkItem`.
function wrapItem(nodeType, options) {
  var passedOptions = {
    run: function run(state, dispatch) {
      // FIXME if (options.attrs instanceof Function) options.attrs(state, attrs => wrapIn(nodeType, attrs)(state))
      return wrapIn(nodeType, options.attrs)(state, dispatch)
    },
    select: function select(state) {
      return wrapIn(nodeType, options.attrs instanceof Function ? null : options.attrs)(state)
    }
  }
  for (var prop in options) { passedOptions[prop] = options[prop] }
  return new MenuItem(passedOptions)
}
exports.wrapItem = wrapItem

// :: (NodeType, Object) → MenuItem
// Build a menu item for changing the type of the textblock around the
// selection to the given type. Provides `run`, `active`, and `select`
// properties. Others must be given in `options`. `options.attrs` may
// be an object to provide the attributes for the textblock node.
function blockTypeItem(nodeType, options) {
  var command = setBlockType(nodeType, options.attrs)
  var passedOptions = {
    run: command,
    select: function select(state) { return command(state) },
    active: function active(state) {
      var ref = state.selection;
      var $from = ref.$from;
      var to = ref.to;
      var node = ref.node;
      if (node) { return node.hasMarkup(nodeType, options.attrs) }
      return to <= $from.end() && $from.parent.hasMarkup(nodeType, options.attrs)
    }
  }
  for (var prop in options) { passedOptions[prop] = options[prop] }
  return new MenuItem(passedOptions)
}
exports.blockTypeItem = blockTypeItem

},{"./icons":15,"crel":1,"prosemirror-commands":3,"prosemirror-history":9}],18:[function(require,module,exports){
var crel = require("crel")
var ref = require("prosemirror-view");
var EditorView = ref.EditorView;

var ref$1 = require("./menu");
var renderGrouped = ref$1.renderGrouped;

var prefix = "ProseMirror-menubar"

// ::- A wrapper around
// [`EditorView`](http://prosemirror.net/ref.html#view.EditorView)
// that adds a menubar above the editor.
//
// Supports the following additional props:
//
// - **`floatingMenu`**`: ?bool` determines whether the menu floats,
//   i.e. whether it sticks to the top of the viewport when the editor
//   is partially scrolled out of view.
//
// - **`menuContent`**`: [[MenuElement]]` provides the content of the
//   menu, as a nested array to be passed to `renderGrouped`.
var MenuBarEditorView = function MenuBarEditorView(place, props) {
  var this$1 = this;

  // :: dom.Node The wrapping DOM element around the editor and the
  // menu. Will get the CSS class `ProseMirror-menubar-wrapper`.
  this.wrapper = crel("div", {class: prefix + "-wrapper"})
  if (place && place.appendChild) { place.appendChild(this.wrapper) }
  else if (place) { place(this.wrapper) }
  if (!props.dispatchTransaction)
    { props.dispatchTransaction = function (tr) { return this$1.updateState(this$1.editor.state.apply(tr)); } }
  // :: EditorView The wrapped editor view. _Don't_ directly call
  // `update` or `updateState` on this, always go through the
  // wrapping view.
  this.editor = new EditorView(this.wrapper, props)

  this.menu = crel("div", {class: prefix})
  this.menu.className = prefix
  this.spacer = null

  this.wrapper.insertBefore(this.menu, this.wrapper.firstChild)

  this.maxHeight = 0
  this.widthForMaxHeight = 0
  this.floating = false

  // :: EditorProps The current props of this view.
  this.props = props
  this.updateMenu()

  if (this.editor.someProp("floatingMenu")) {
    this.updateFloat()
    this.scrollFunc = function () {
      if (!this$1.editor.root.contains(this$1.wrapper))
        { window.removeEventListener("scroll", this$1.scrollFunc) }
      else
        { this$1.updateFloat() }
    }
    window.addEventListener("scroll", this.scrollFunc)
  }
};

// :: (EditorProps) Update the view's props.
MenuBarEditorView.prototype.update = function update (props) {
  this.props = props
  this.editor.update(props)
  this.updateMenu()
};

// :: (EditorState) Update only the state of the editor.
MenuBarEditorView.prototype.updateState = function updateState (state) {
  this.editor.updateState(state)
  this.updateMenu()
};

MenuBarEditorView.prototype.updateMenu = function updateMenu () {
  this.menu.textContent = ""
  this.menu.appendChild(renderGrouped(this.editor, this.editor.someProp("menuContent")))

  if (this.floating) {
    this.updateScrollCursor()
  } else {
    if (this.menu.offsetWidth != this.widthForMaxHeight) {
      this.widthForMaxHeight = this.menu.offsetWidth
      this.maxHeight = 0
    }
    if (this.menu.offsetHeight > this.maxHeight) {
      this.maxHeight = this.menu.offsetHeight
      this.menu.style.minHeight = this.maxHeight + "px"
    }
  }
};


MenuBarEditorView.prototype.updateScrollCursor = function updateScrollCursor () {
  var selection = this.editor.root.getSelection()
  if (!selection.focusNode) { return }
  var rects = selection.getRangeAt(0).getClientRects()
  var selRect = rects[selectionIsInverted(selection) ? 0 : rects.length - 1]
  if (!selRect) { return }
  var menuRect = this.menu.getBoundingClientRect()
  if (selRect.top < menuRect.bottom && selRect.bottom > menuRect.top) {
    var scrollable = findWrappingScrollable(this.wrapper)
    if (scrollable) { scrollable.scrollTop -= (menuRect.bottom - selRect.top) }
  }
};

MenuBarEditorView.prototype.updateFloat = function updateFloat () {
  var parent = this.wrapper, editorRect = parent.getBoundingClientRect()
  if (this.floating) {
    if (editorRect.top >= 0 || editorRect.bottom < this.menu.offsetHeight + 10) {
      this.floating = false
      this.menu.style.position = this.menu.style.left = this.menu.style.width = ""
      this.menu.style.display = ""
      this.spacer.parentNode.removeChild(this.spacer)
      this.spacer = null
    } else {
      var border = (parent.offsetWidth - parent.clientWidth) / 2
      this.menu.style.left = (editorRect.left + border) + "px"
      this.menu.style.display = (editorRect.top > window.innerHeight ? "none" : "")
    }
  } else {
    if (editorRect.top < 0 && editorRect.bottom >= this.menu.offsetHeight + 10) {
      this.floating = true
      var menuRect = this.menu.getBoundingClientRect()
      this.menu.style.left = menuRect.left + "px"
      this.menu.style.width = menuRect.width + "px"
      this.menu.style.position = "fixed"
      this.spacer = crel("div", {class: prefix + "-spacer", style: ("height: " + (menuRect.height) + "px")})
      parent.insertBefore(this.spacer, this.menu)
    }
  }
};

// :: ()
// Destroy the editor instance.
MenuBarEditorView.prototype.destroy = function destroy () {
  this.editor.destroy()
};
exports.MenuBarEditorView = MenuBarEditorView

// Not precise, but close enough
function selectionIsInverted(selection) {
  if (selection.anchorNode == selection.focusNode) { return selection.anchorOffset > selection.focusOffset }
  return selection.anchorNode.compareDocumentPosition(selection.focusNode) == Node.DOCUMENT_POSITION_FOLLOWING
}

function findWrappingScrollable(node) {
  for (var cur = node.parentNode; cur; cur = cur.parentNode)
    { if (cur.scrollHeight > cur.clientHeight) { return cur } }
}

},{"./menu":17,"crel":1,"prosemirror-view":54}],19:[function(require,module,exports){
function compareDeep(a, b) {
  if (a === b) { return true }
  if (!(a && typeof a == "object") ||
      !(b && typeof b == "object")) { return false }
  var array = Array.isArray(a)
  if (Array.isArray(b) != array) { return false }
  if (array) {
    if (a.length != b.length) { return false }
    for (var i = 0; i < a.length; i++) { if (!compareDeep(a[i], b[i])) { return false } }
  } else {
    for (var p in a) { if (!(p in b) || !compareDeep(a[p], b[p])) { return false } }
    for (var p$1 in b) { if (!(p$1 in a)) { return false } }
  }
  return true
}
exports.compareDeep = compareDeep

},{}],20:[function(require,module,exports){
var ref = require("./fragment");
var Fragment = ref.Fragment;
var ref$1 = require("./mark");
var Mark = ref$1.Mark;

var ContentExpr = function(nodeType, elements, inlineContent) {
  this.nodeType = nodeType
  this.elements = elements
  this.inlineContent = inlineContent
};

var prototypeAccessors = { isLeaf: {} };

prototypeAccessors.isLeaf.get = function () {
  return this.elements.length == 0
};

// : (?Object) → ContentMatch
// The content match at the start of this expression.
ContentExpr.prototype.start = function (attrs) {
  return new ContentMatch(this, attrs, 0, 0)
};

// : (NodeType, ?Object, ?Object) → ?ContentMatch
// Try to find a match that matches the given node, anywhere in the
// expression. (Useful when synthesizing a match for a node that's
// open to the left.)
ContentExpr.prototype.atType = function (parentAttrs, type, attrs, marks) {
    var this$1 = this;
    if ( marks === void 0 ) marks = Mark.none;

  for (var i = 0; i < this.elements.length; i++)
    { if (this$1.elements[i].matchesType(type, attrs, marks, parentAttrs, this$1))
      { return new ContentMatch(this$1, parentAttrs, i, 0) } }
};

ContentExpr.prototype.matches = function (attrs, fragment, from, to) {
  return this.start(attrs).matchToEnd(fragment, from, to)
};

// Get a position in a known-valid fragment. If this is a simple
// (single-element) expression, we don't have to do any matching,
// and can simply skip to the position with count `index`.
ContentExpr.prototype.getMatchAt = function (attrs, fragment, index) {
    if ( index === void 0 ) index = fragment.childCount;

  if (this.elements.length == 1)
    { return new ContentMatch(this, attrs, 0, index) }
  else
    { return this.start(attrs).matchFragment(fragment, 0, index) }
};

ContentExpr.prototype.checkReplace = function (attrs, content, from, to, replacement, start, end) {
    var this$1 = this;
    if ( replacement === void 0 ) replacement = Fragment.empty;
    if ( start === void 0 ) start = 0;
    if ( end === void 0 ) end = replacement.childCount;

  // Check for simple case, where the expression only has a single element
  // (Optimization to avoid matching more than we need)
  if (this.elements.length == 1) {
    var elt = this.elements[0]
    if (!checkCount(elt, content.childCount - (to - from) + (end - start), attrs, this)) { return false }
    for (var i = start; i < end; i++) { if (!elt.matches(replacement.child(i), attrs, this$1)) { return false } }
    return true
  }

  var match = this.getMatchAt(attrs, content, from).matchFragment(replacement, start, end)
  return match ? match.matchToEnd(content, to) : false
};

ContentExpr.prototype.checkReplaceWith = function (attrs, content, from, to, type, typeAttrs, marks) {
  if (this.elements.length == 1) {
    var elt = this.elements[0]
    if (!checkCount(elt, content.childCount - (to - from) + 1, attrs, this)) { return false }
    return elt.matchesType(type, typeAttrs, marks, attrs, this)
  }

  var match = this.getMatchAt(attrs, content, from).matchType(type, typeAttrs, marks)
  return match ? match.matchToEnd(content, to) : false
};

ContentExpr.prototype.compatible = function (other) {
    var this$1 = this;

  for (var i = 0; i < this.elements.length; i++) {
    var elt = this$1.elements[i]
    for (var j = 0; j < other.elements.length; j++)
      { if (other.elements[j].compatible(elt)) { return true } }
  }
  return false
};

ContentExpr.prototype.generateContent = function (attrs) {
  return this.start(attrs).fillBefore(Fragment.empty, true)
};

ContentExpr.parse = function (nodeType, expr, specs) {
  var elements = [], pos = 0, inline = null
  for (;;) {
    pos += /^\s*/.exec(expr.slice(pos))[0].length
    if (pos == expr.length) { break }

    var types = /^(?:(\w+)|\(\s*(\w+(?:\s*\|\s*\w+)*)\s*\))/.exec(expr.slice(pos))
    if (!types) { throw new SyntaxError("Invalid content expression '" + expr + "' at " + pos) }
    pos += types[0].length
    var attrs = /^\[([^\]]+)\]/.exec(expr.slice(pos))
    if (attrs) { pos += attrs[0].length }
    var marks = /^<(?:(_)|\s*(\w+(?:\s+\w+)*)\s*)>/.exec(expr.slice(pos))
    if (marks) { pos += marks[0].length }
    var repeat = /^(?:([+*?])|\{\s*(\d+|\.\w+)\s*(,\s*(\d+|\.\w+)?)?\s*\})/.exec(expr.slice(pos))
    if (repeat) { pos += repeat[0].length }

    var nodeTypes = expandTypes(nodeType.schema, specs, types[1] ? [types[1]] : types[2].split(/\s*\|\s*/))
    for (var i = 0; i < nodeTypes.length; i++) {
      if (inline == null) { inline = nodeTypes[i].isInline }
      else if (inline != nodeTypes[i].isInline) { throw new SyntaxError("Mixing inline and block content in a single node") }
    }
    var attrSet = !attrs ? null : parseAttrs(nodeType, attrs[1])
    var markSet = !marks ? false : marks[1] ? true : checkMarks(nodeType.schema, marks[2].split(/\s+/))
    var ref = parseRepeat(nodeType, repeat);
      var min = ref.min;
      var max = ref.max;
    if (min != 0 && (nodeTypes[0].hasRequiredAttrs(attrSet) || nodeTypes[0].isText))
      { throw new SyntaxError("Node type " + types[0] + " in type " + nodeType.name +
                            " is required, but has non-optional attributes") }
    var newElt = new ContentElement(nodeTypes, attrSet, markSet, min, max)
    for (var i$1 = elements.length - 1; i$1 >= 0; i$1--) {
      var prev = elements[i$1]
      if (prev.min != prev.max && prev.overlaps(newElt))
        { throw new SyntaxError("Possibly ambiguous overlapping adjacent content expressions in '" + expr + "'") }
      if (prev.min != 0) { break }
    }
    elements.push(newElt)
  }

  return new ContentExpr(nodeType, elements, !!inline)
};

Object.defineProperties( ContentExpr.prototype, prototypeAccessors );
exports.ContentExpr = ContentExpr

var ContentElement = function(nodeTypes, attrs, marks, min, max) {
  this.nodeTypes = nodeTypes
  this.attrs = attrs
  this.marks = marks
  this.min = min
  this.max = max
};

ContentElement.prototype.matchesType = function (type, attrs, marks, parentAttrs, parentExpr) {
    var this$1 = this;

  if (this.nodeTypes.indexOf(type) == -1) { return false }
  if (this.attrs) {
    if (!attrs) { return false }
    for (var prop in this$1.attrs)
      { if (attrs[prop] != resolveValue(this$1.attrs[prop], parentAttrs, parentExpr)) { return false } }
  }
  if (this.marks === true) { return true }
  if (this.marks === false) { return marks.length == 0 }
  for (var i = 0; i < marks.length; i++)
    { if (this$1.marks.indexOf(marks[i].type) == -1) { return false } }
  return true
};

ContentElement.prototype.matches = function (node, parentAttrs, parentExpr) {
  return this.matchesType(node.type, node.attrs, node.marks, parentAttrs, parentExpr)
};

ContentElement.prototype.compatible = function (other) {
    var this$1 = this;

  for (var i = 0; i < this.nodeTypes.length; i++)
    { if (other.nodeTypes.indexOf(this$1.nodeTypes[i]) != -1) { return true } }
  return false
};

ContentElement.prototype.constrainedAttrs = function (parentAttrs, expr) {
    var this$1 = this;

  if (!this.attrs) { return null }
  var attrs = Object.create(null)
  for (var prop in this$1.attrs)
    { attrs[prop] = resolveValue(this$1.attrs[prop], parentAttrs, expr) }
  return attrs
};

ContentElement.prototype.createFiller = function (parentAttrs, expr) {
  var type = this.nodeTypes[0], attrs = type.computeAttrs(this.constrainedAttrs(parentAttrs, expr))
  return type.create(attrs, type.contentExpr.generateContent(attrs))
};

ContentElement.prototype.defaultType = function () {
  var first = this.nodeTypes[0]
  if (!(first.hasRequiredAttrs() || first.isText)) { return first }
};

ContentElement.prototype.overlaps = function (other) {
  return this.nodeTypes.some(function (t) { return other.nodeTypes.indexOf(t) > -1; })
};

ContentElement.prototype.allowsMark = function (markType) {
  return this.marks === true || this.marks && this.marks.indexOf(markType) > -1
};

// ::- Represents a partial match of a node type's [content
// expression](#model.NodeSpec), and can be used to find out whether further
// content matches here, and whether a given position is a valid end
// of the parent node.
var ContentMatch = function(expr, attrs, index, count) {
  this.expr = expr
  this.attrs = attrs
  this.index = index
  this.count = count
};

var prototypeAccessors$1 = { element: {},nextElement: {} };

prototypeAccessors$1.element.get = function () { return this.expr.elements[this.index] };

prototypeAccessors$1.nextElement.get = function () {
    var this$1 = this;

  for (var i = this.index, count = this.count; i < this.expr.elements.length; i++) {
    var element = this$1.expr.elements[i]
    if (this$1.resolveValue(element.max) > count) { return element }
    count = 0
  }
};

ContentMatch.prototype.move = function (index, count) {
  return new ContentMatch(this.expr, this.attrs, index, count)
};

ContentMatch.prototype.resolveValue = function (value) {
  return value instanceof AttrValue ? resolveValue(value, this.attrs, this.expr) : value
};

// :: (Node) → ?ContentMatch
// Match a node, returning a new match after the node if successful.
ContentMatch.prototype.matchNode = function (node) {
  return this.matchType(node.type, node.attrs, node.marks)
};

// :: (NodeType, ?Object, [Mark]) → ?ContentMatch
// Match a node type and marks, returning an match after that node
// if successful.
ContentMatch.prototype.matchType = function (type, attrs, marks) {
    var this$1 = this;
    if ( marks === void 0 ) marks = Mark.none;

  for (var ref = this, index = ref.index, count = ref.count; index < this.expr.elements.length; index++, count = 0) {
    var elt = this$1.expr.elements[index], max = this$1.resolveValue(elt.max)
    if (count < max && elt.matchesType(type, attrs, marks, this$1.attrs, this$1.expr)) {
      count++
      return this$1.move(index, count)
    }
    if (count < this$1.resolveValue(elt.min)) { return null }
  }
};

// :: (Fragment, ?number, ?number) → ?union<ContentMatch, bool>
// Try to match a fragment. Returns a new match when successful,
// `null` when it ran into a required element it couldn't fit, and
// `false` if it reached the end of the expression without
// matching all nodes.
ContentMatch.prototype.matchFragment = function (fragment, from, to) {
    var this$1 = this;
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = fragment.childCount;

  if (from == to) { return this }
  var fragPos = from, end = this.expr.elements.length
  for (var ref = this, index = ref.index, count = ref.count; index < end; index++, count = 0) {
    var elt = this$1.expr.elements[index], max = this$1.resolveValue(elt.max)

    while (count < max && fragPos < to) {
      if (elt.matches(fragment.child(fragPos), this$1.attrs, this$1.expr)) {
        count++
        if (++fragPos == to) { return this$1.move(index, count) }
      } else {
        break
      }
    }
    if (count < this$1.resolveValue(elt.min)) { return null }
  }
  return false
};

// :: (Fragment, ?number, ?number) → bool
// Returns true only if the fragment matches here, and reaches all
// the way to the end of the content expression.
ContentMatch.prototype.matchToEnd = function (fragment, start, end) {
  var matched = this.matchFragment(fragment, start, end)
  return matched && matched.validEnd() || false
};

// :: () → bool
// Returns true if this position represents a valid end of the
// expression (no required content follows after it).
ContentMatch.prototype.validEnd = function () {
    var this$1 = this;

  for (var i = this.index, count = this.count; i < this.expr.elements.length; i++, count = 0)
    { if (count < this$1.resolveValue(this$1.expr.elements[i].min)) { return false } }
  return true
};

// :: (Fragment, bool, ?number) → ?Fragment
// Try to match the given fragment, and if that fails, see if it can
// be made to match by inserting nodes in front of it. When
// successful, return a fragment of inserted nodes (which may be
// empty if nothing had to be inserted). When `toEnd` is true, only
// return a fragment if the resulting match goes to the end of the
// content expression.
ContentMatch.prototype.fillBefore = function (after, toEnd, startIndex) {
    var this$1 = this;

  var added = [], match = this, index = startIndex || 0, end = this.expr.elements.length
  for (;;) {
    var fits = match.matchFragment(after, index)
    if (fits && (!toEnd || fits.validEnd())) { return Fragment.from(added) }
    if (fits === false) { return null } // Matched to end with content remaining

    var elt = match.element
    if (match.count < this$1.resolveValue(elt.min)) {
      added.push(elt.createFiller(this$1.attrs, this$1.expr))
      match = match.move(match.index, match.count + 1)
    } else if (match.index < end) {
      match = match.move(match.index + 1, 0)
    } else if (after.childCount > index) {
      return null
    } else {
      return Fragment.from(added)
    }
  }
};

ContentMatch.prototype.possibleContent = function () {
    var this$1 = this;

  var found = []
  for (var i = this.index, count = this.count; i < this.expr.elements.length; i++, count = 0) {
    var elt = this$1.expr.elements[i], attrs = elt.constrainedAttrs(this$1.attrs, this$1.expr)
    if (count < this$1.resolveValue(elt.max)) { for (var j = 0; j < elt.nodeTypes.length; j++) {
      var type = elt.nodeTypes[j]
      if (!type.hasRequiredAttrs(attrs) && !type.isText) { found.push({type: type, attrs: attrs}) }
    } }
    if (this$1.resolveValue(elt.min) > count) { break }
  }
  return found
};

// :: (MarkType) → bool
// Check whether a node with the given mark type is allowed after
// this position.
ContentMatch.prototype.allowsMark = function (markType) {
  return this.element.allowsMark(markType)
};

// :: (NodeType, ?Object, ?[Mark]) → ?[{type: NodeType, attrs: Object}]
// Find a set of wrapping node types that would allow a node of type
// `target` with attributes `targetAttrs` to appear at this
// position. The result may be empty (when it fits directly) and
// will be null when no such wrapping exists.
ContentMatch.prototype.findWrapping = function (target, targetAttrs, targetMarks) {
  var seen = Object.create(null), first = {match: this, via: null}, active = [first]
  while (active.length) {
    var current = active.shift(), match = current.match
    if (match.matchType(target, targetAttrs, targetMarks)) {
      var result = []
      for (var obj = current; obj != first; obj = obj.via)
        { result.push({type: obj.match.expr.nodeType, attrs: obj.match.attrs}) }
      return result.reverse()
    }
    var possible = match.possibleContent()
    for (var i = 0; i < possible.length; i++) {
      var ref = possible[i];
        var type = ref.type;
        var attrs = ref.attrs;
        var fullAttrs = type.computeAttrs(attrs)
      if (!type.isLeaf && !(type.name in seen) &&
          (current == first || match.matchType(type, fullAttrs).validEnd())) {
        active.push({match: type.contentExpr.start(fullAttrs), via: current})
        seen[type.name] = true
      }
    }
  }
};

// :: (Node) → ?[{type: NodeType, attrs: Object}]
// Call [`findWrapping`](#model.ContentMatch.findWrapping) with the
// properties of the given node.
ContentMatch.prototype.findWrappingFor = function (node) {
  return this.findWrapping(node.type, node.attrs, node.marks)
};

Object.defineProperties( ContentMatch.prototype, prototypeAccessors$1 );
exports.ContentMatch = ContentMatch

var AttrValue = function(attr) { this.attr = attr };

function parseValue(nodeType, value) {
  if (value.charAt(0) == ".") {
    var attr = value.slice(1)
    if (!nodeType.attrs[attr]) { throw new SyntaxError("Node type " + nodeType.name + " has no attribute " + attr) }
    return new AttrValue(attr)
  } else {
    return JSON.parse(value)
  }
}

function checkMarks(schema, marks) {
  var found = []
  for (var i = 0; i < marks.length; i++) {
    var mark = schema.marks[marks[i]]
    if (mark) { found.push(mark) }
    else { throw new SyntaxError("Unknown mark type: '" + marks[i] + "'") }
  }
  return found
}

function resolveValue(value, attrs, expr) {
  if (!(value instanceof AttrValue)) { return value }
  var attrVal = attrs && attrs[value.attr]
  return attrVal !== undefined ? attrVal : expr.nodeType.defaultAttrs[value.attr]
}

function checkCount(elt, count, attrs, expr) {
  return count >= resolveValue(elt.min, attrs, expr) &&
    count <= resolveValue(elt.max, attrs, expr)
}

function expandTypes(schema, specs, types) {
  var result = []
  types.forEach(function (type) {
    var found = schema.nodes[type]
    if (found) {
      if (result.indexOf(found) == -1) { result.push(found) }
    } else {
      specs.forEach(function (name, spec) {
        if (spec.group && spec.group.split(" ").indexOf(type) > -1) {
          found = schema.nodes[name]
          if (result.indexOf(found) == -1) { result.push(found) }
        }
      })
    }
    if (!found)
      { throw new SyntaxError("Node type or group '" + type + "' does not exist") }
  })
  return result
}

var many = 2e9 // Big number representable as a 32-bit int

function parseRepeat(nodeType, match) {
  var min = 1, max = 1
  if (match) {
    if (match[1] == "+") {
      max = many
    } else if (match[1] == "*") {
      min = 0
      max = many
    } else if (match[1] == "?") {
      min = 0
    } else if (match[2]) {
      min = parseValue(nodeType, match[2])
      if (match[3])
        { max = match[4] ? parseValue(nodeType, match[4]) : many }
      else
        { max = min }
    }
    if (max == 0 || min > max)
      { throw new SyntaxError("Invalid repeat count in '" + match[0] + "'") }
  }
  return {min: min, max: max}
}

function parseAttrs(nodeType, expr) {
  var parts = expr.split(/\s*,\s*/)
  var attrs = Object.create(null)
  for (var i = 0; i < parts.length; i++) {
    var match = /^(\w+)=(\w+|\"(?:\\.|[^\\])*\"|\.\w+)$/.exec(parts[i])
    if (!match) { throw new SyntaxError("Invalid attribute syntax: " + parts[i]) }
    attrs[match[1]] = parseValue(nodeType, match[2])
  }
  return attrs
}

},{"./fragment":22,"./mark":25}],21:[function(require,module,exports){
function findDiffStart(a, b, pos) {
  for (var i = 0;; i++) {
    if (i == a.childCount || i == b.childCount)
      { return a.childCount == b.childCount ? null : pos }

    var childA = a.child(i), childB = b.child(i)
    if (childA == childB) { pos += childA.nodeSize; continue }

    if (!childA.sameMarkup(childB)) { return pos }

    if (childA.isText && childA.text != childB.text) {
      for (var j = 0; childA.text[j] == childB.text[j]; j++)
        { pos++ }
      return pos
    }
    if (childA.content.size || childB.content.size) {
      var inner = findDiffStart(childA.content, childB.content, pos + 1)
      if (inner != null) { return inner }
    }
    pos += childA.nodeSize
  }
}
exports.findDiffStart = findDiffStart

function findDiffEnd(a, b, posA, posB) {
  for (var iA = a.childCount, iB = b.childCount;;) {
    if (iA == 0 || iB == 0)
      { return iA == iB ? null : {a: posA, b: posB} }

    var childA = a.child(--iA), childB = b.child(--iB), size = childA.nodeSize
    if (childA == childB) {
      posA -= size; posB -= size
      continue
    }

    if (!childA.sameMarkup(childB)) { return {a: posA, b: posB} }

    if (childA.isText && childA.text != childB.text) {
      var same = 0, minSize = Math.min(childA.text.length, childB.text.length)
      while (same < minSize && childA.text[childA.text.length - same - 1] == childB.text[childB.text.length - same - 1]) {
        same++; posA--; posB--
      }
      return {a: posA, b: posB}
    }
    if (childA.content.size || childB.content.size) {
      var inner = findDiffEnd(childA.content, childB.content, posA - 1, posB - 1)
      if (inner) { return inner }
    }
    posA -= size; posB -= size
  }
}
exports.findDiffEnd = findDiffEnd

},{}],22:[function(require,module,exports){
var ref = require("./diff");
var findDiffStart = ref.findDiffStart;
var findDiffEnd = ref.findDiffEnd;

// ::- Fragment is the type used to represent a node's collection of
// child nodes.
//
// Fragments are persistent data structures. That means you should
// _not_ mutate them or their content, but create new instances
// whenever needed. The API tries to make this easy.
var Fragment = function(content, size) {
  var this$1 = this;

  this.content = content
  this.size = size || 0
  if (size == null) { for (var i = 0; i < content.length; i++)
    { this$1.size += content[i].nodeSize } }
};

var prototypeAccessors = { firstChild: {},lastChild: {},childCount: {} };

Fragment.prototype.nodesBetween = function (from, to, f, nodeStart, parent) {
    var this$1 = this;

  for (var i = 0, pos = 0; pos < to; i++) {
    var child = this$1.content[i], end = pos + child.nodeSize
    if (end > from && f(child, nodeStart + pos, parent, i) !== false && child.content.size) {
      var start = pos + 1
      child.nodesBetween(Math.max(0, from - start),
                         Math.min(child.content.size, to - start),
                         f, nodeStart + start)
    }
    pos = end
  }
};

// : (number, number, ?string, ?string) → string
Fragment.prototype.textBetween = function (from, to, blockSeparator, leafText) {
  var text = "", separated = true
  this.nodesBetween(from, to, function (node, pos) {
    if (node.isText) {
      text += node.text.slice(Math.max(from, pos) - pos, to - pos)
      separated = !blockSeparator
    } else if (node.isLeaf && leafText) {
      text += leafText
      separated = !blockSeparator
    } else if (!separated && node.isBlock) {
      text += blockSeparator
      separated = true
    }
  }, 0)
  return text
};

// :: (Fragment) → Fragment
// Create a new fragment containing the content of this fragment and
// `other`.
Fragment.prototype.append = function (other) {
  if (!other.size) { return this }
  if (!this.size) { return other }
  var last = this.lastChild, first = other.firstChild, content = this.content.slice(), i = 0
  if (last.isText && last.sameMarkup(first)) {
    content[content.length - 1] = last.withText(last.text + first.text)
    i = 1
  }
  for (; i < other.content.length; i++) { content.push(other.content[i]) }
  return new Fragment(content, this.size + other.size)
};

// :: (number, ?number) → Fragment
// Cut out the sub-fragment between the two given positions.
Fragment.prototype.cut = function (from, to) {
    var this$1 = this;

  if (to == null) { to = this.size }
  if (from == 0 && to == this.size) { return this }
  var result = [], size = 0
  if (to > from) { for (var i = 0, pos = 0; pos < to; i++) {
    var child = this$1.content[i], end = pos + child.nodeSize
    if (end > from) {
      if (pos < from || end > to) {
        if (child.isText)
          { child = child.cut(Math.max(0, from - pos), Math.min(child.text.length, to - pos)) }
        else
          { child = child.cut(Math.max(0, from - pos - 1), Math.min(child.content.size, to - pos - 1)) }
      }
      result.push(child)
      size += child.nodeSize
    }
    pos = end
  } }
  return new Fragment(result, size)
};

Fragment.prototype.cutByIndex = function (from, to) {
  if (from == to) { return Fragment.empty }
  if (from == 0 && to == this.content.length) { return this }
  return new Fragment(this.content.slice(from, to))
};

// :: (number, Node) → Fragment
// Create a new fragment in which the node at the given index is
// replaced by the given node.
Fragment.prototype.replaceChild = function (index, node) {
  var current = this.content[index]
  if (current == node) { return this }
  var copy = this.content.slice()
  var size = this.size + node.nodeSize - current.nodeSize
  copy[index] = node
  return new Fragment(copy, size)
};

// : (Node) → Fragment
// Create a new fragment by prepending the given node to this
// fragment.
Fragment.prototype.addToStart = function (node) {
  return new Fragment([node].concat(this.content), this.size + node.nodeSize)
};

// : (Node) → Fragment
// Create a new fragment by appending the given node to this
// fragment.
Fragment.prototype.addToEnd = function (node) {
  return new Fragment(this.content.concat(node), this.size + node.nodeSize)
};

// :: (Fragment) → bool
// Compare this fragment to another one.
Fragment.prototype.eq = function (other) {
    var this$1 = this;

  if (this.content.length != other.content.length) { return false }
  for (var i = 0; i < this.content.length; i++)
    { if (!this$1.content[i].eq(other.content[i])) { return false } }
  return true
};

// :: ?Node
// The first child of the fragment, or `null` if it is empty.
prototypeAccessors.firstChild.get = function () { return this.content.length ? this.content[0] : null };

// :: ?Node
// The last child of the fragment, or `null` if it is empty.
prototypeAccessors.lastChild.get = function () { return this.content.length ? this.content[this.content.length - 1] : null };

// :: number
// The number of child nodes in this fragment.
prototypeAccessors.childCount.get = function () { return this.content.length };

// :: (number) → Node
// Get the child node at the given index. Raise an error when the
// index is out of range.
Fragment.prototype.child = function (index) {
  var found = this.content[index]
  if (!found) { throw new RangeError("Index " + index + " out of range for " + this) }
  return found
};

// :: (number) → number
// Get the offset at (size of children before) the given index.
Fragment.prototype.offsetAt = function (index) {
    var this$1 = this;

  var offset = 0
  for (var i = 0; i < index; i++) { offset += this$1.content[i].nodeSize }
  return offset
};

// :: (number) → ?Node
// Get the child node at the given index, if it exists.
Fragment.prototype.maybeChild = function (index) {
  return this.content[index]
};

// :: ((node: Node, offset: number, index: number))
// Call `f` for every child node, passing the node, its offset
// into this parent node, and its index.
Fragment.prototype.forEach = function (f) {
    var this$1 = this;

  for (var i = 0, p = 0; i < this.content.length; i++) {
    var child = this$1.content[i]
    f(child, p, i)
    p += child.nodeSize
  }
};

// :: (Fragment) → ?number
// Find the first position at which this fragment and another
// fragment differ, or `null` if they are the same.
Fragment.prototype.findDiffStart = function (other, pos) {
    if ( pos === void 0 ) pos = 0;

  return findDiffStart(this, other, pos)
};

// :: (Node) → ?{a: number, b: number}
// Find the first position, searching from the end, at which this
// fragment and the given fragment differ, or `null` if they are the
// same. Since this position will not be the same in both nodes, an
// object with two separate positions is returned.
Fragment.prototype.findDiffEnd = function (other, pos, otherPos) {
    if ( pos === void 0 ) pos = this.size;
    if ( otherPos === void 0 ) otherPos = other.size;

  return findDiffEnd(this, other, pos, otherPos)
};

// : (number, ?number) → {index: number, offset: number}
// Find the index and inner offset corresponding to a given relative
// position in this fragment. The result object will be reused
// (overwritten) the next time the function is called. (Not public.)
Fragment.prototype.findIndex = function (pos, round) {
    var this$1 = this;
    if ( round === void 0 ) round = -1;

  if (pos == 0) { return retIndex(0, pos) }
  if (pos == this.size) { return retIndex(this.content.length, pos) }
  if (pos > this.size || pos < 0) { throw new RangeError(("Position " + pos + " outside of fragment (" + (this) + ")")) }
  for (var i = 0, curPos = 0;; i++) {
    var cur = this$1.child(i), end = curPos + cur.nodeSize
    if (end >= pos) {
      if (end == pos || round > 0) { return retIndex(i + 1, end) }
      return retIndex(i, curPos)
    }
    curPos = end
  }
};

// :: () → string
// Return a debugging string that describes this fragment.
Fragment.prototype.toString = function () { return "<" + this.toStringInner() + ">" };

Fragment.prototype.toStringInner = function () { return this.content.join(", ") };

// :: () → ?Object
// Create a JSON-serializeable representation of this fragment.
Fragment.prototype.toJSON = function () {
  return this.content.length ? this.content.map(function (n) { return n.toJSON(); }) : null
};

// :: (Schema, ?Object) → Fragment
// Deserialize a fragment from its JSON representation.
Fragment.fromJSON = function (schema, value) {
  return value ? new Fragment(value.map(schema.nodeFromJSON)) : Fragment.empty
};

// :: ([Node]) → Fragment
// Build a fragment from an array of nodes. Ensures that adjacent
// text nodes with the same style are joined together.
Fragment.fromArray = function (array) {
  if (!array.length) { return Fragment.empty }
  var joined, size = 0
  for (var i = 0; i < array.length; i++) {
    var node = array[i]
    size += node.nodeSize
    if (i && node.isText && array[i - 1].sameMarkup(node)) {
      if (!joined) { joined = array.slice(0, i) }
      joined[joined.length - 1] = node.withText(joined[joined.length - 1].text + node.text)
    } else if (joined) {
      joined.push(node)
    }
  }
  return new Fragment(joined || array, size)
};

// :: (?union<Fragment, Node, [Node]>) → Fragment
// Create a fragment from something that can be interpreted as a set
// of nodes. For `null`, it returns the empty fragment. For a
// fragment, the fragment itself. For a node or array of nodes, a
// fragment containing those nodes.
Fragment.from = function (nodes) {
  if (!nodes) { return Fragment.empty }
  if (nodes instanceof Fragment) { return nodes }
  if (Array.isArray(nodes)) { return this.fromArray(nodes) }
  return new Fragment([nodes], nodes.nodeSize)
};

Object.defineProperties( Fragment.prototype, prototypeAccessors );
exports.Fragment = Fragment

var found = {index: 0, offset: 0}
function retIndex(index, offset) {
  found.index = index
  found.offset = offset
  return found
}

// :: Fragment
// An empty fragment. Intended to be reused whenever a node doesn't
// contain anything (rather than allocating a new empty fragment for
// each leaf node).
Fragment.empty = new Fragment([], 0)

},{"./diff":21}],23:[function(require,module,exports){
var ref = require("./fragment");
var Fragment = ref.Fragment;
var ref$1 = require("./replace");
var Slice = ref$1.Slice;
var ref$2 = require("./mark");
var Mark = ref$2.Mark;

// ParseRule:: interface
// A value that describes how to parse a given DOM node or inline
// style as a ProseMirror node or mark.
//
//   tag:: ?string
//   A CSS selector describing the kind of DOM elements to match. A
//   single rule should have _either_ a `tag` or a `style` property.
//
//   style:: ?string
//   A CSS property name to match. When given, this rule matches
//   inline styles that list that property.
//
//   node:: ?string
//   The name of the node type to create when this rule matches. Only
//   valid for rules with a `tag` property, not for style rules. Each
//   rule should have one of a `node`, `mark`, or `ignore` property
//   (except when it appears in a [node](#model.NodeSpec.parseDOM) or
//   [mark spec](#model.MarkSpec.parseDOM), in which case the `node`
//   or `mark` property will be derived from its position).
//
//   mark:: ?string
//   The name of the mark type to wrap the matched content in.
//
//   priority:: ?number
//   Can be used to change the order in which the parse rules in a
//   schema are tried. Those with higher priority come first. Rules
//   without a priority are counted as having priority 50. This
//   property is only meaningful in a schema—when directly
//   constructing a parser, the order of the rule array is used.
//
//   ignore:: ?bool
//   When true, ignore content that matches this rule.
//
//   skip:: ?bool
//   When true, ignore the node that matches this rule, but do parse
//   its content.
//
//   attrs:: ?Object
//   Attributes for the node or mark created by this rule. When
//   `getAttrs` is provided, it takes precedence.
//
//   getAttrs:: ?(union<dom.Node, string>) → ?union<bool, Object>
//   A function used to compute the attributes for the node or mark
//   created by this rule. Can also be used to describe further
//   conditions the DOM element or style must match. When it returns
//   `false`, the rule won't match. When it returns null or undefined,
//   that is interpreted as an empty/default set of attributes.
//
//   Called with a DOM Element for `tag` rules, and with a string (the
//   style's value) for `style` rules.
//
//   contentElement:: ?string
//   For `tag` rules that produce non-leaf nodes or marks, by default
//   the content of the DOM element is parsed as content of the mark
//   or node. If the child nodes are in a descendent node, this may be
//   a CSS selector string that the parser must use to find the actual
//   content element.
//
//   getContent:: ?(dom.Node) → Fragment
//   Can be used to override the content of a matched node. Will be
//   called, and its result used, instead of parsing the node's child
//   node.
//
//   preserveWhitespace:: ?bool
//   Controls whether whitespace should be preserved when parsing the
//   content inside the matched element.

// ::- A DOM parser represents a strategy for parsing DOM content into
// a ProseMirror document conforming to a given schema. Its behavior
// is defined by an array of [rules](#model.ParseRule).
var DOMParser = function(schema, rules) {
  var this$1 = this;

  // :: Schema
  this.schema = schema
  // :: [ParseRule]
  this.rules = rules
  this.tags = []
  this.styles = []

  rules.forEach(function (rule) {
    if (rule.tag) { this$1.tags.push(rule) }
    else if (rule.style) { this$1.styles.push(rule) }
  })
};

// :: (dom.Node, ?Object) → Node
// Parse a document from the content of a DOM node.
//
// options::- Configuration options.
//
//   preserveWhitespace:: ?bool
//   By default, whitespace is collapsed as per HTML's rules. Pass
//   true here to prevent the parser from doing that.
//
//   findPositions:: ?[{node: dom.Node, offset: number}]
//   When given, the parser will, beside parsing the content,
//   record the document positions of the given DOM positions. It
//   will do so by writing to the objects, adding a `pos` property
//   that holds the document position. DOM positions that are not
//   in the parsed content will not be written to.
//
//   from:: ?number
//   The child node index to start parsing from.
//
//   to:: ?number
//   The child node index to stop parsing at.
//
//   topNode:: ?Node
//   By default, the content is parsed into a `doc` node. You can
//   pass this option to use the type and attributes from a
//   different node as the top container.
//
//   topStart:: ?number
//   Can be used to influence the content match at the start of
//   the topnode. When given, should be a valid index into
//   `topNode`.
DOMParser.prototype.parse = function (dom, options) {
    if ( options === void 0 ) options = {};

  var context = new ParseContext(this, options, false)
  context.addAll(dom, null, options.from, options.to)
  return context.finish()
};

// :: (dom.Node, ?Object) → Slice
// Parses the content of the given DOM node, like
// [`parse`](#model.DOMParser.parse), and takes the same set of
// options. But unlike that method, which produces a whole node,
// this one returns a slice that is open at the sides, meaning that
// the schema constraints aren't applied to the start of nodes to
// the left of the input and the end of nodes at the end.
DOMParser.prototype.parseSlice = function (dom, options) {
    if ( options === void 0 ) options = {};

  var context = new ParseContext(this, options, true)
  context.addAll(dom, null, options.from, options.to)
  return Slice.maxOpen(context.finish())
};

DOMParser.prototype.matchTag = function (dom) {
    var this$1 = this;

  for (var i = 0; i < this.tags.length; i++) {
    var rule = this$1.tags[i]
    if (matches(dom, rule.tag)) {
      if (rule.getAttrs) {
        var result = rule.getAttrs(dom)
        if (result === false) { continue }
        rule.attrs = result
      }
      return rule
    }
  }
};

DOMParser.prototype.matchStyle = function (prop, value) {
    var this$1 = this;

  for (var i = 0; i < this.styles.length; i++) {
    var rule = this$1.styles[i]
    if (rule.style == prop) {
      if (rule.getAttrs) {
        var result = rule.getAttrs(value)
        if (result === false) { continue }
        rule.attrs = result
      }
      return rule
    }
  }
};

// :: (Schema) → [ParseRule]
// Extract the parse rules listed in a schema's [node
// specs](#model.NodeSpec.parseDOM).
DOMParser.schemaRules = function (schema) {
  var result = []
  function insert(rule) {
    var priority = rule.priority == null ? 50 : rule.priority, i = 0
    for (; i < result.length; i++) {
      var next = result[i], nextPriority = next.priority == null ? 50 : next.priority
      if (nextPriority < priority) { break }
    }
    result.splice(i, 0, rule)
  }

  var loop = function ( name ) {
    var rules = schema.marks[name].spec.parseDOM
    if (rules) { rules.forEach(function (rule) {
      insert(rule = copy(rule))
      rule.mark = name
    }) }
  };

    for (var name in schema.marks) loop( name );
  var loop$1 = function ( name ) {
    var rules$1 = schema.nodes[name$1].spec.parseDOM
    if (rules$1) { rules$1.forEach(function (rule) {
      insert(rule = copy(rule))
      rule.node = name$1
    }) }
  };

    for (var name$1 in schema.nodes) loop$1( name );
  return result
};

// :: (Schema) → DOMParser
// Construct a DOM parser using the parsing rules listed in a
// schema's [node specs](#model.NodeSpec.parseDOM).
DOMParser.fromSchema = function (schema) {
  return schema.cached.domParser ||
    (schema.cached.domParser = new DOMParser(schema, DOMParser.schemaRules(schema)))
};
exports.DOMParser = DOMParser

// : Object<bool> The block-level tags in HTML5
var blockTags = {
  address: true, article: true, aside: true, blockquote: true, canvas: true,
  dd: true, div: true, dl: true, fieldset: true, figcaption: true, figure: true,
  footer: true, form: true, h1: true, h2: true, h3: true, h4: true, h5: true,
  h6: true, header: true, hgroup: true, hr: true, li: true, noscript: true, ol: true,
  output: true, p: true, pre: true, section: true, table: true, tfoot: true, ul: true
}

// : Object<bool> The tags that we normally ignore.
var ignoreTags = {
  head: true, noscript: true, object: true, script: true, style: true, title: true
}

// : Object<bool> List tags.
var listTags = {ol: true, ul: true}

// Using a bitfield for node context options
var OPT_PRESERVE_WS = 1, OPT_OPEN_LEFT = 2

var NodeContext = function(type, attrs, solid, match, options) {
  this.type = type
  this.attrs = attrs
  this.solid = solid
  this.match = match || (options & OPT_OPEN_LEFT ? null : type.contentExpr.start(attrs))
  this.options = options
  this.content = []
};

NodeContext.prototype.findWrapping = function (type, attrs) {
  if (!this.match) {
    if (!this.type) { return [] }
    var found = this.type.contentExpr.atType(this.attrs, type, attrs)
    if (!found) {
      var start = this.type.contentExpr.start(this.attrs), wrap
      if (wrap = start.findWrapping(type, attrs)) {
        this.match = start
        return wrap
      }
    }
    if (found) { this.match = found }
    else { return null }
  }
  return this.match.findWrapping(type, attrs)
};

NodeContext.prototype.finish = function (openRight) {
  if (!(this.options & OPT_PRESERVE_WS)) { // Strip trailing whitespace
    var last = this.content[this.content.length - 1], m
    if (last && last.isText && (m = /\s+$/.exec(last.text))) {
      if (last.text.length == m[0].length) { this.content.pop() }
      else { this.content[this.content.length - 1] = last.withText(last.text.slice(0, last.text.length - m[0].length)) }
    }
  }
  var content = Fragment.from(this.content)
  if (!openRight && this.match)
    { content = content.append(this.match.fillBefore(Fragment.empty, true)) }
  return this.type ? this.type.create(this.attrs, content) : content
};

var ParseContext = function(parser, options, open) {
  // : DOMParser The parser we are using.
  this.parser = parser
  // : Object The options passed to this parse.
  this.options = options
  this.isOpen = open
  var topNode = options.topNode, topContext
  var topOptions = (options.preserveWhitespace ? OPT_PRESERVE_WS : 0) | (open ? OPT_OPEN_LEFT : 0)
  if (topNode)
    { topContext = new NodeContext(topNode.type, topNode.attrs, true,
                                 topNode.contentMatchAt(options.topStart || 0), topOptions) }
  else if (open)
    { topContext = new NodeContext(null, null, true, null, topOptions) }
  else
    { topContext = new NodeContext(parser.schema.nodes.doc, null, true, null, topOptions) }
  this.nodes = [topContext]
  // : [Mark] The current set of marks
  this.marks = Mark.none
  this.open = 0
  this.find = options.findPositions
};

var prototypeAccessors = { top: {},currentPos: {} };

prototypeAccessors.top.get = function () {
  return this.nodes[this.open]
};

// : (Mark) → [Mark]
// Add a mark to the current set of marks, return the old set.
ParseContext.prototype.addMark = function (mark) {
  var old = this.marks
  this.marks = mark.addToSet(this.marks)
  return old
};

// : (dom.Node)
// Add a DOM node to the content. Text is inserted as text node,
// otherwise, the node is passed to `addElement` or, if it has a
// `style` attribute, `addElementWithStyles`.
ParseContext.prototype.addDOM = function (dom) {
  if (dom.nodeType == 3) {
    this.addTextNode(dom)
  } else if (dom.nodeType == 1) {
    var style = dom.getAttribute("style")
    if (style) { this.addElementWithStyles(parseStyles(style), dom) }
    else { this.addElement(dom) }
  }
};

ParseContext.prototype.addTextNode = function (dom) {
  var value = dom.nodeValue
  var top = this.top
  if ((top.type && top.type.isTextblock) || /\S/.test(value)) {
    if (!(top.options & OPT_PRESERVE_WS)) {
      value = value.replace(/\s+/g, " ")
      // If this starts with whitespace, and there is either no node
      // before it or a node that ends with whitespace, strip the
      // leading space.
      if (/^\s/.test(value)) {
        var nodeBefore = top.content[top.content.length - 1]
        if (!nodeBefore || nodeBefore.isText && /\s$/.test(nodeBefore.text))
          { value = value.slice(1) }
      }
    }
    if (value) { this.insertNode(this.parser.schema.text(value, this.marks)) }
    this.findInText(dom)
  } else {
    this.findInside(dom)
  }
};

// : (dom.Element)
// Try to find a handler for the given tag and use that to parse. If
// none is found, the element's content nodes are added directly.
ParseContext.prototype.addElement = function (dom) {
  var name = dom.nodeName.toLowerCase()
  if (listTags.hasOwnProperty(name)) { normalizeList(dom) }
  var rule = (this.options.ruleFromNode && this.options.ruleFromNode(dom)) || this.parser.matchTag(dom)
  if (rule ? rule.ignore : ignoreTags.hasOwnProperty(name)) {
    this.findInside(dom)
  } else if (!rule || rule.skip) {
    if (rule && rule.skip.nodeType) { dom = rule.skip }
    var sync = blockTags.hasOwnProperty(name) && this.top
    this.addAll(dom)
    if (sync) { this.sync(sync) }
  } else {
    this.addElementByRule(dom, rule)
  }
};

// Run any style parser associated with the node's styles. After
// that, if no style parser suppressed the node's content, pass it
// through to `addElement`.
ParseContext.prototype.addElementWithStyles = function (styles, dom) {
    var this$1 = this;

  var oldMarks = this.marks, ignore = false
  for (var i = 0; i < styles.length; i += 2) {
    var rule = this$1.parser.matchStyle(styles[i], styles[i + 1])
    if (!rule) { continue }
    if (rule.ignore) { ignore = true; break }
    this$1.addMark(this$1.parser.schema.marks[rule.mark].create(rule.attrs))
  }
  if (!ignore) { this.addElement(dom) }
  this.marks = oldMarks
};

// : (dom.Element, ParseRule) → bool
// Look up a handler for the given node. If none are found, return
// false. Otherwise, apply it, use its return value to drive the way
// the node's content is wrapped, and return true.
ParseContext.prototype.addElementByRule = function (dom, rule) {
    var this$1 = this;

  var sync, before, nodeType, markType, mark
  if (rule.node) {
    nodeType = this.parser.schema.nodes[rule.node]
    if (nodeType.isLeaf) { this.insertNode(nodeType.create(rule.attrs, null, this.marks)) }
    else { sync = this.enter(nodeType, rule.attrs, rule.preserveWhitespace) && this.top }
  } else {
    markType = this.parser.schema.marks[rule.mark]
    before = this.addMark(mark = markType.create(rule.attrs))
  }

  if (nodeType && nodeType.isLeaf) {
    this.findInside(dom)
  } else if (rule.getContent) {
    this.findInside(dom)
    rule.getContent(dom).forEach(function (node) { return this$1.insertNode(mark ? node.mark(mark.addToSet(node.marks)) : node); })
  } else {
    var contentDOM = rule.contentElement
    if (typeof contentDOM == "string") { contentDOM = dom.querySelector(contentDOM) }
    if (!contentDOM) { contentDOM = dom }
    this.findAround(dom, contentDOM, true)
    this.addAll(contentDOM, sync)
    if (sync) { this.sync(sync); this.open-- }
    else if (before) { this.marks = before }
    this.findAround(dom, contentDOM, true)
  }
  return true
};

// : (dom.Node, ?NodeBuilder, ?number, ?number)
// Add all child nodes between `startIndex` and `endIndex` (or the
// whole node, if not given). If `sync` is passed, use it to
// synchronize after every block element.
ParseContext.prototype.addAll = function (parent, sync, startIndex, endIndex) {
    var this$1 = this;

  var index = startIndex || 0
  for (var dom = startIndex ? parent.childNodes[startIndex] : parent.firstChild,
           end = endIndex == null ? null : parent.childNodes[endIndex];
       dom != end; dom = dom.nextSibling, ++index) {
    this$1.findAtPoint(parent, index)
    this$1.addDOM(dom)
    if (sync && blockTags.hasOwnProperty(dom.nodeName.toLowerCase()))
      { this$1.sync(sync) }
  }
  this.findAtPoint(parent, index)
};

// Try to find a way to fit the given node type into the current
// context. May add intermediate wrappers and/or leave non-solid
// nodes that we're in.
ParseContext.prototype.findPlace = function (type, attrs) {
    var this$1 = this;

  var route, sync
  for (var depth = this.open; depth >= 0; depth--) {
    var node = this$1.nodes[depth]
    var found = node.findWrapping(type, attrs)
    if (found && (!route || route.length > found.length)) {
      route = found
      sync = node
      if (!found.length) { break }
    }
    if (node.solid) { break }
  }
  if (!route) { return false }
  this.sync(sync)
  for (var i = 0; i < route.length; i++)
    { this$1.enterInner(route[i].type, route[i].attrs, false) }
  return true
};

// : (Node) → ?Node
// Try to insert the given node, adjusting the context when needed.
ParseContext.prototype.insertNode = function (node) {
  if (this.findPlace(node.type, node.attrs)) {
    this.closeExtra()
    var top = this.top
    if (top.match) {
      var match = top.match.matchNode(node)
      if (!match) {
        node = node.mark(node.marks.filter(function (mark) { return top.match.allowsMark(mark.type); }))
        match = top.match.matchNode(node)
      }
      top.match = match
    }
    top.content.push(node)
  }
};

// : (NodeType, ?Object) → bool
// Try to start a node of the given type, adjusting the context when
// necessary.
ParseContext.prototype.enter = function (type, attrs, preserveWS) {
  var ok = this.findPlace(type, attrs)
  if (ok) { this.enterInner(type, attrs, true, preserveWS) }
  return ok
};

// Open a node of the given type
ParseContext.prototype.enterInner = function (type, attrs, solid, preserveWS) {
  this.closeExtra()
  var top = this.top
  top.match = top.match && top.match.matchType(type, attrs)
  var options = preserveWS == null ? top.options & OPT_PRESERVE_WS : preserveWS ? OPT_PRESERVE_WS : 0
  if ((top.options & OPT_OPEN_LEFT) && top.content.length == 0) { options |= OPT_OPEN_LEFT }
  this.nodes.push(new NodeContext(type, attrs, solid, null, options))
  this.open++
};

// Make sure all nodes above this.open are finished and added to
// their parents
ParseContext.prototype.closeExtra = function (openRight) {
    var this$1 = this;

  var i = this.nodes.length - 1
  if (i > this.open) {
    this.marks = Mark.none
    for (; i > this.open; i--) { this$1.nodes[i - 1].content.push(this$1.nodes[i].finish(openRight)) }
    this.nodes.length = this.open + 1
  }
};

ParseContext.prototype.finish = function () {
  this.open = 0
  this.closeExtra(this.isOpen)
  return this.nodes[0].finish(this.isOpen || this.options.topOpen)
};

ParseContext.prototype.sync = function (to) {
    var this$1 = this;

  for (var i = this.open; i >= 0; i--) { if (this$1.nodes[i] == to) {
    this$1.open = i
    return
  } }
};

prototypeAccessors.currentPos.get = function () {
    var this$1 = this;

  this.closeExtra()
  var pos = 0
  for (var i = this.open; i >= 0; i--) {
    var content = this$1.nodes[i].content
    for (var j = content.length - 1; j >= 0; j--)
      { pos += content[j].nodeSize }
    if (i) { pos++ }
  }
  return pos
};

ParseContext.prototype.findAtPoint = function (parent, offset) {
    var this$1 = this;

  if (this.find) { for (var i = 0; i < this.find.length; i++) {
    if (this$1.find[i].node == parent && this$1.find[i].offset == offset)
      { this$1.find[i].pos = this$1.currentPos }
  } }
};

ParseContext.prototype.findInside = function (parent) {
    var this$1 = this;

  if (this.find) { for (var i = 0; i < this.find.length; i++) {
    if (this$1.find[i].pos == null && parent.contains(this$1.find[i].node))
      { this$1.find[i].pos = this$1.currentPos }
  } }
};

ParseContext.prototype.findAround = function (parent, content, before) {
    var this$1 = this;

  if (parent != content && this.find) { for (var i = 0; i < this.find.length; i++) {
    if (this$1.find[i].pos == null && parent.contains(this$1.find[i].node)) {
      var pos = content.compareDocumentPosition(this$1.find[i].node)
      if (pos & (before ? 2 : 4))
        { this$1.find[i].pos = this$1.currentPos }
    }
  } }
};

ParseContext.prototype.findInText = function (textNode) {
    var this$1 = this;

  if (this.find) { for (var i = 0; i < this.find.length; i++) {
    if (this$1.find[i].node == textNode)
      { this$1.find[i].pos = this$1.currentPos - (textNode.nodeValue.length - this$1.find[i].offset) }
  } }
};

Object.defineProperties( ParseContext.prototype, prototypeAccessors );

// Kludge to work around directly nested list nodes produced by some
// tools and allowed by browsers to mean that the nested list is
// actually part of the list item above it.
function normalizeList(dom) {
  for (var child = dom.firstChild, prevItem = null; child; child = child.nextSibling) {
    var name = child.nodeType == 1 ? child.nodeName.toLowerCase() : null
    if (name && listTags.hasOwnProperty(name) && prevItem) {
      prevItem.appendChild(child)
      child = prevItem
    } else if (name == "li") {
      prevItem = child
    } else if (name) {
      prevItem = null
    }
  }
}

// Apply a CSS selector.
function matches(dom, selector) {
  return (dom.matches || dom.msMatchesSelector || dom.webkitMatchesSelector || dom.mozMatchesSelector).call(dom, selector)
}

// : (string) → [string]
// Tokenize a style attribute into property/value pairs.
function parseStyles(style) {
  var re = /\s*([\w-]+)\s*:\s*([^;]+)/g, m, result = []
  while (m = re.exec(style)) { result.push(m[1], m[2].trim()) }
  return result
}

function copy(obj) {
  var copy = {}
  for (var prop in obj) { copy[prop] = obj[prop] }
  return copy
}

},{"./fragment":22,"./mark":25,"./replace":27}],24:[function(require,module,exports){
exports.Node = require("./node").Node
;var assign;
((assign = require("./resolvedpos"), exports.ResolvedPos = assign.ResolvedPos, exports.NodeRange = assign.NodeRange))
exports.Fragment = require("./fragment").Fragment
;var assign$1;
((assign$1 = require("./replace"), exports.Slice = assign$1.Slice, exports.ReplaceError = assign$1.ReplaceError))
exports.Mark = require("./mark").Mark

;var assign$2;
((assign$2 = require("./schema"), exports.Schema = assign$2.Schema, exports.NodeType = assign$2.NodeType, exports.MarkType = assign$2.MarkType))
;var assign$3;
((assign$3 = require("./content"), exports.ContentMatch = assign$3.ContentMatch))

exports.DOMParser = require("./from_dom").DOMParser
exports.DOMSerializer =  require("./to_dom").DOMSerializer

},{"./content":20,"./fragment":22,"./from_dom":23,"./mark":25,"./node":26,"./replace":27,"./resolvedpos":28,"./schema":29,"./to_dom":30}],25:[function(require,module,exports){
var ref = require("./comparedeep");
var compareDeep = ref.compareDeep;

// ::- A mark is a piece of information that can be attached to a node,
// such as it being emphasized, in code font, or a link. It has a type
// and optionally a set of attributes that provide further information
// (such as the target of the link). Marks are created through a
// `Schema`, which controls which types exist and which
// attributes they have.
var Mark = function(type, attrs) {
  // :: MarkType
  // The type of this mark.
  this.type = type
  // :: Object
  // The attributes associated with this mark.
  this.attrs = attrs
};

// :: ([Mark]) → [Mark]
// Given a set of marks, create a new set which contains this one as
// well, in the right position. If this mark is already in the set,
// the set itself is returned. If a mark of this type with different
// attributes is already in the set, a set in which it is replaced
// by this one is returned.
Mark.prototype.addToSet = function (set) {
    var this$1 = this;

  for (var i = 0; i < set.length; i++) {
    var other = set[i]
    if (other.type == this$1.type) {
      if (this$1.eq(other)) { return set }
      var copy = set.slice()
      copy[i] = this$1
      return copy
    }
    if (other.type.rank > this$1.type.rank)
      { return set.slice(0, i).concat(this$1).concat(set.slice(i)) }
  }
  return set.concat(this)
};

// :: ([Mark]) → [Mark]
// Remove this mark from the given set, returning a new set. If this
// mark is not in the set, the set itself is returned.
Mark.prototype.removeFromSet = function (set) {
    var this$1 = this;

  for (var i = 0; i < set.length; i++)
    { if (this$1.eq(set[i]))
      { return set.slice(0, i).concat(set.slice(i + 1)) } }
  return set
};

// :: ([Mark]) → bool
// Test whether this mark is in the given set of marks.
Mark.prototype.isInSet = function (set) {
    var this$1 = this;

  for (var i = 0; i < set.length; i++)
    { if (this$1.eq(set[i])) { return true } }
  return false
};

// :: (Mark) → bool
// Test whether this mark has the same type and attributes as
// another mark.
Mark.prototype.eq = function (other) {
  if (this == other) { return true }
  if (this.type != other.type) { return false }
  if (!compareDeep(other.attrs, this.attrs)) { return false }
  return true
};

// :: () → Object
// Convert this mark to a JSON-serializeable representation.
Mark.prototype.toJSON = function () {
    var this$1 = this;

  var obj = {type: this.type.name}
  for (var _ in this$1.attrs) {
    obj.attrs = this$1.attrs
    break
  }
  return obj
};

// :: (Schema, Object) → Mark
Mark.fromJSON = function (schema, json) {
  return schema.marks[json.type].create(json.attrs)
};

// :: ([Mark], [Mark]) → bool
// Test whether two sets of marks are identical.
Mark.sameSet = function (a, b) {
  if (a == b) { return true }
  if (a.length != b.length) { return false }
  for (var i = 0; i < a.length; i++)
    { if (!a[i].eq(b[i])) { return false } }
  return true
};

// :: (?union<Mark, [Mark]>) → [Mark]
// Create a properly sorted mark set from null, a single mark, or an
// unsorted array of marks.
Mark.setFrom = function (marks) {
  if (!marks || marks.length == 0) { return Mark.none }
  if (marks instanceof Mark) { return [marks] }
  var copy = marks.slice()
  copy.sort(function (a, b) { return a.type.rank - b.type.rank; })
  return copy
};
exports.Mark = Mark

// :: [Mark] The empty set of marks.
Mark.none = []

},{"./comparedeep":19}],26:[function(require,module,exports){
var ref = require("./fragment");
var Fragment = ref.Fragment;
var ref$1 = require("./mark");
var Mark = ref$1.Mark;
var ref$2 = require("./replace");
var Slice = ref$2.Slice;
var replace = ref$2.replace;
var ref$3 = require("./resolvedpos");
var ResolvedPos = ref$3.ResolvedPos;
var ref$4 = require("./comparedeep");
var compareDeep = ref$4.compareDeep;

var emptyAttrs = Object.create(null)

var warnedAboutMarksAt = false

// ::- This class represents a node in the tree that makes up a
// ProseMirror document. So a document is an instance of `Node`, with
// children that are also instances of `Node`.
//
// Nodes are persistent data structures. Instead of changing them, you
// create new ones with the content you want. Old ones keep pointing
// at the old document shape. This is made cheaper by sharing
// structure between the old and new data as much as possible, which a
// tree shape like this (without back pointers) makes easy.
//
// **Never** directly mutate the properties of a `Node` object. See
// [this guide](guide/doc.html) for more information.
var Node = function(type, attrs, content, marks) {
  // :: NodeType
  // The type of node that this is.
  this.type = type

  // :: Object
  // An object mapping attribute names to values. The kind of
  // attributes allowed and required are determined by the node
  // type.
  this.attrs = attrs

  // :: Fragment
  // A container holding the node's children.
  this.content = content || Fragment.empty

  // :: [Mark]
  // The marks (things like whether it is emphasized or part of a
  // link) associated with this node.
  this.marks = marks || Mark.none
};

var prototypeAccessors = { nodeSize: {},childCount: {},textContent: {},firstChild: {},lastChild: {},isBlock: {},isTextblock: {},isInline: {},isText: {},isLeaf: {} };

// text:: ?string
// For text nodes, this contains the node's text content.

// :: number
// The size of this node, as defined by the integer-based [indexing
// scheme](guide/doc.html#indexing). For text nodes, this is the
// amount of characters. For other leaf nodes, it is one. And for
// non-leaf nodes, it is the size of the content plus two (the start
// and end token).
prototypeAccessors.nodeSize.get = function () { return this.isLeaf ? 1 : 2 + this.content.size };

// :: number
// The number of children that the node has.
prototypeAccessors.childCount.get = function () { return this.content.childCount };

// :: (number) → Node
// Get the child node at the given index. Raises an error when the
// index is out of range.
Node.prototype.child = function (index) { return this.content.child(index) };

// :: (number) → ?Node
// Get the child node at the given index, if it exists.
Node.prototype.maybeChild = function (index) { return this.content.maybeChild(index) };

// :: ((node: Node, offset: number, index: number))
// Call `f` for every child node, passing the node, its offset
// into this parent node, and its index.
Node.prototype.forEach = function (f) { this.content.forEach(f) };

// :: (?number, ?number, (node: Node, pos: number, parent: Node, index: number))
// Invoke a callback for all descendant nodes recursively between
// the given two positions that are relative to start of this node's content.
// The callback is invoked with the node, its parent-relative position,
// its parent node, and its child index. If the callback returns false,
// the current node's children will not be recursed over.
Node.prototype.nodesBetween = function (from, to, f, pos) {
    if ( pos === void 0 ) pos = 0;

  this.content.nodesBetween(from, to, f, pos, this)
};

// :: ((node: Node, pos: number, parent: Node))
// Call the given callback for every descendant node.
Node.prototype.descendants = function (f) {
  this.nodesBetween(0, this.content.size, f)
};

// :: string
// Concatenates all the text nodes found in this fragment and its
// children.
prototypeAccessors.textContent.get = function () { return this.textBetween(0, this.content.size, "") };

// :: (number, number, ?string, ?string) → string
// Get all text between positions `from` and `to`. When
// `blockSeparator` is given, it will be inserted whenever a new
// block node is started. When `leafText` is given, it'll be
// inserted for every non-text leaf node encountered.
Node.prototype.textBetween = function (from, to, blockSeparator, leafText) {
  return this.content.textBetween(from, to, blockSeparator, leafText)
};

// :: ?Node
// Returns this node's first child, or `null` if there are no
// children.
prototypeAccessors.firstChild.get = function () { return this.content.firstChild };

// :: ?Node
// Returns this node's last child, or `null` if there are no
// children.
prototypeAccessors.lastChild.get = function () { return this.content.lastChild };

// :: (Node) → bool
// Test whether two nodes represent the same content.
Node.prototype.eq = function (other) {
  return this == other || (this.sameMarkup(other) && this.content.eq(other.content))
};

// :: (Node) → bool
// Compare the markup (type, attributes, and marks) of this node to
// those of another. Returns `true` if both have the same markup.
Node.prototype.sameMarkup = function (other) {
  return this.hasMarkup(other.type, other.attrs, other.marks)
};

// :: (NodeType, ?Object, ?[Mark]) → bool
// Check whether this node's markup correspond to the given type,
// attributes, and marks.
Node.prototype.hasMarkup = function (type, attrs, marks) {
  return this.type == type &&
    compareDeep(this.attrs, attrs || type.defaultAttrs || emptyAttrs) &&
    Mark.sameSet(this.marks, marks || Mark.none)
};

// :: (?Fragment) → Node
// Create a new node with the same markup as this node, containing
// the given content (or empty, if no content is given).
Node.prototype.copy = function (content) {
    if ( content === void 0 ) content = null;

  if (content == this.content) { return this }
  return new this.constructor(this.type, this.attrs, content, this.marks)
};

// :: ([Mark]) → Node
// Create a copy of this node, with the given set of marks instead
// of the node's own marks.
Node.prototype.mark = function (marks) {
  return marks == this.marks ? this : new this.constructor(this.type, this.attrs, this.content, marks)
};

// :: (number, ?number) → Node
// Create a copy of this node with only the content between the
// given offsets. If `to` is not given, it defaults to the end of
// the node.
Node.prototype.cut = function (from, to) {
  if (from == 0 && to == this.content.size) { return this }
  return this.copy(this.content.cut(from, to))
};

// :: (number, ?number) → Slice
// Cut out the part of the document between the given positions, and
// return it as a `Slice` object.
Node.prototype.slice = function (from, to, includeParents) {
    if ( to === void 0 ) to = this.content.size;
    if ( includeParents === void 0 ) includeParents = false;

  if (from == to) { return Slice.empty }

  var $from = this.resolve(from), $to = this.resolve(to)
  var depth = includeParents ? 0 : $from.sharedDepth(to)
  var start = $from.start(depth), node = $from.node(depth)
  var content = node.content.cut($from.pos - start, $to.pos - start)
  return new Slice(content, $from.depth - depth, $to.depth - depth)
};

// :: (number, number, Slice) → Node
// Replace the part of the document between the given positions with
// the given slice. The slice must 'fit', meaning its open sides
// must be able to connect to the surrounding content, and its
// content nodes must be valid children for the node they are placed
// into. If any of this is violated, an error of type
// [`ReplaceError`](#model.ReplaceError) is thrown.
Node.prototype.replace = function (from, to, slice) {
  return replace(this.resolve(from), this.resolve(to), slice)
};

// :: (number) → ?Node
// Find the node after the given position.
Node.prototype.nodeAt = function (pos) {
  for (var node = this;;) {
    var ref = node.content.findIndex(pos);
      var index = ref.index;
      var offset = ref.offset;
    node = node.maybeChild(index)
    if (!node) { return null }
    if (offset == pos || node.isText) { return node }
    pos -= offset + 1
  }
};

// :: (number) → {node: ?Node, index: number, offset: number}
// Find the (direct) child node after the given offset, if any,
// and return it along with its index and offset relative to this
// node.
Node.prototype.childAfter = function (pos) {
  var ref = this.content.findIndex(pos);
    var index = ref.index;
    var offset = ref.offset;
  return {node: this.content.maybeChild(index), index: index, offset: offset}
};

// :: (number) → {node: ?Node, index: number, offset: number}
// Find the (direct) child node before the given offset, if any,
// and return it along with its index and offset relative to this
// node.
Node.prototype.childBefore = function (pos) {
  if (pos == 0) { return {node: null, index: 0, offset: 0} }
  var ref = this.content.findIndex(pos);
    var index = ref.index;
    var offset = ref.offset;
  if (offset < pos) { return {node: this.content.child(index), index: index, offset: offset} }
  var node = this.content.child(index - 1)
  return {node: node, index: index - 1, offset: offset - node.nodeSize}
};

// :: (number) → ResolvedPos
// Resolve the given position in the document, returning an object
// describing its path through the document.
Node.prototype.resolve = function (pos) { return ResolvedPos.resolveCached(this, pos) };

Node.prototype.resolveNoCache = function (pos) { return ResolvedPos.resolve(this, pos) };

Node.prototype.marksAt = function (pos, useAfter) {
  if (!warnedAboutMarksAt && typeof console != "undefined" && console.warn) {
    warnedAboutMarksAt = true
    console.warn("Node.marksAt is deprecated. Use ResolvedPos.marks instead.")
  }
  return this.resolve(pos).marks(useAfter)
};

// :: (?number, ?number, MarkType) → bool
// Test whether a mark of the given type occurs in this document
// between the two given positions.
Node.prototype.rangeHasMark = function (from, to, type) {
  var found = false
  this.nodesBetween(from, to, function (node) {
    if (type.isInSet(node.marks)) { found = true }
    return !found
  })
  return found
};

// :: bool
// True when this is a block (non-inline node)
prototypeAccessors.isBlock.get = function () { return this.type.isBlock };

// :: bool
// True when this is a textblock node, a block node with inline
// content.
prototypeAccessors.isTextblock.get = function () { return this.type.isTextblock };

// :: bool
// True when this is an inline node (a text node or a node that can
// appear among text).
prototypeAccessors.isInline.get = function () { return this.type.isInline };

// :: bool
// True when this is a text node.
prototypeAccessors.isText.get = function () { return this.type.isText };

// :: bool
// True when this is a leaf node.
prototypeAccessors.isLeaf.get = function () { return this.type.isLeaf };

// :: () → string
// Return a string representation of this node for debugging
// purposes.
Node.prototype.toString = function () {
  var name = this.type.name
  if (this.content.size)
    { name += "(" + this.content.toStringInner() + ")" }
  return wrapMarks(this.marks, name)
};

// :: (number) → ContentMatch
// Get the content match in this node at the given index.
Node.prototype.contentMatchAt = function (index) {
  return this.type.contentExpr.getMatchAt(this.attrs, this.content, index)
};

// :: (number, number, ?Fragment, ?number, ?number) → bool
// Test whether replacing the range `from` to `to` (by index) with
// the given replacement fragment (which defaults to the empty
// fragment) would leave the node's content valid. You can
// optionally pass `start` and `end` indices into the replacement
// fragment.
Node.prototype.canReplace = function (from, to, replacement, start, end) {
  return this.type.contentExpr.checkReplace(this.attrs, this.content, from, to, replacement, start, end)
};

// :: (number, number, NodeType, ?[Mark]) → bool
// Test whether replacing the range `from` to `to` (by index) with a
// node of the given type with the given attributes and marks would
// be valid.
Node.prototype.canReplaceWith = function (from, to, type, attrs, marks) {
  return this.type.contentExpr.checkReplaceWith(this.attrs, this.content, from, to, type, attrs, marks || Mark.none)
};

// :: (Node) → bool
// Test whether the given node's content could be appended to this
// node. If that node is empty, this will only return true if there
// is at least one node type that can appear in both nodes (to avoid
// merging completely incompatible nodes).
Node.prototype.canAppend = function (other) {
  if (other.content.size) { return this.canReplace(this.childCount, this.childCount, other.content) }
  else { return this.type.compatibleContent(other.type) }
};

Node.prototype.defaultContentType = function (at) {
  var elt = this.contentMatchAt(at).nextElement
  return elt && elt.defaultType()
};

// :: () → Object
// Return a JSON-serializeable representation of this node.
Node.prototype.toJSON = function () {
    var this$1 = this;

  var obj = {type: this.type.name}
  for (var _ in this$1.attrs) {
    obj.attrs = this$1.attrs
    break
  }
  if (this.content.size)
    { obj.content = this.content.toJSON() }
  if (this.marks.length)
    { obj.marks = this.marks.map(function (n) { return n.toJSON(); }) }
  return obj
};

// :: (Schema, Object) → Node
// Deserialize a node from its JSON representation.
Node.fromJSON = function (schema, json) {
  var marks = json.marks && json.marks.map(schema.markFromJSON)
  if (json.type == "text") { return schema.text(json.text, marks) }
  return schema.nodeType(json.type).create(json.attrs, Fragment.fromJSON(schema, json.content), marks)
};

Object.defineProperties( Node.prototype, prototypeAccessors );
exports.Node = Node

var TextNode = (function (Node) {
  function TextNode(type, attrs, content, marks) {
    Node.call(this, type, attrs, null, marks)

    if (!content) { throw new RangeError("Empty text nodes are not allowed") }

    this.text = content
  }

  if ( Node ) TextNode.__proto__ = Node;
  TextNode.prototype = Object.create( Node && Node.prototype );
  TextNode.prototype.constructor = TextNode;

  var prototypeAccessors$1 = { textContent: {},nodeSize: {} };

  TextNode.prototype.toString = function () { return wrapMarks(this.marks, JSON.stringify(this.text)) };

  prototypeAccessors$1.textContent.get = function () { return this.text };

  TextNode.prototype.textBetween = function (from, to) { return this.text.slice(from, to) };

  prototypeAccessors$1.nodeSize.get = function () { return this.text.length };

  TextNode.prototype.mark = function (marks) {
    return new TextNode(this.type, this.attrs, this.text, marks)
  };

  TextNode.prototype.withText = function (text) {
    if (text == this.text) { return this }
    return new TextNode(this.type, this.attrs, text, this.marks)
  };

  TextNode.prototype.cut = function (from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.text.length;

    if (from == 0 && to == this.text.length) { return this }
    return this.withText(this.text.slice(from, to))
  };

  TextNode.prototype.eq = function (other) {
    return this.sameMarkup(other) && this.text == other.text
  };

  TextNode.prototype.toJSON = function () {
    var base = Node.prototype.toJSON.call(this)
    base.text = this.text
    return base
  };

  Object.defineProperties( TextNode.prototype, prototypeAccessors$1 );

  return TextNode;
}(Node));
exports.TextNode = TextNode

function wrapMarks(marks, str) {
  for (var i = marks.length - 1; i >= 0; i--)
    { str = marks[i].type.name + "(" + str + ")" }
  return str
}

},{"./comparedeep":19,"./fragment":22,"./mark":25,"./replace":27,"./resolvedpos":28}],27:[function(require,module,exports){
var ref = require("./fragment");
var Fragment = ref.Fragment;

// ::- Error type raised by [`Node.replace`](#model.Node.replace) when
// given an invalid replacement.
var ReplaceError = (function (Error) {
  function ReplaceError(message) {
    Error.call(this, message)
    this.message = message
  }

  if ( Error ) ReplaceError.__proto__ = Error;
  ReplaceError.prototype = Object.create( Error && Error.prototype );
  ReplaceError.prototype.constructor = ReplaceError;

  return ReplaceError;
}(Error));
exports.ReplaceError = ReplaceError

// ::- A slice represents a piece cut out of a larger document. It
// stores not only a fragment, but also the depth up to which nodes on
// both side are 'open' / cut through.
var Slice = function(content, openLeft, openRight) {
  // :: Fragment The slice's content nodes.
  this.content = content
  // :: number The open depth at the start.
  this.openLeft = openLeft
  // :: number The open depth at the end.
  this.openRight = openRight
};

var prototypeAccessors = { size: {} };

// :: number
// The size this slice would add when inserted into a document.
prototypeAccessors.size.get = function () {
  return this.content.size - this.openLeft - this.openRight
};

Slice.prototype.insertAt = function (pos, fragment) {
  var content = insertInto(this.content, pos + this.openLeft, fragment, null)
  return content && new Slice(content, this.openLeft, this.openRight)
};

Slice.prototype.removeBetween = function (from, to) {
  return new Slice(removeRange(this.content, from + this.openLeft, to + this.openLeft), this.openLeft, this.openRight)
};

Slice.prototype.eq = function (other) {
  return this.content.eq(other.content) && this.openLeft == other.openLeft && this.openRight == other.openRight
};

Slice.prototype.toString = function () {
  return this.content + "(" + this.openLeft + "," + this.openRight + ")"
};

// :: () → ?Object
// Convert a slice to a JSON-serializable representation.
Slice.prototype.toJSON = function () {
  if (!this.content.size) { return null }
  return {content: this.content.toJSON(),
          openLeft: this.openLeft,
          openRight: this.openRight}
};

// :: (Schema, ?Object) → Slice
// Deserialize a slice from its JSON representation.
Slice.fromJSON = function (schema, json) {
  if (!json) { return Slice.empty }
  return new Slice(Fragment.fromJSON(schema, json.content), json.openLeft, json.openRight)
};

// :: (Fragment) → Slice
// Create a slice from a fragment by taking the maximum possible
// open value on both side of the fragment.
Slice.maxOpen = function (fragment) {
  var openLeft = 0, openRight = 0
  for (var n = fragment.firstChild; n && !n.isLeaf; n = n.firstChild) { openLeft++ }
  for (var n$1 = fragment.lastChild; n$1 && !n$1.isLeaf; n$1 = n$1.lastChild) { openRight++ }
  return new Slice(fragment, openLeft, openRight)
};

Object.defineProperties( Slice.prototype, prototypeAccessors );
exports.Slice = Slice

function removeRange(content, from, to) {
  var ref = content.findIndex(from);
  var index = ref.index;
  var offset = ref.offset;
  var child = content.maybeChild(index)
  var ref$1 = content.findIndex(to);
  var indexTo = ref$1.index;
  var offsetTo = ref$1.offset;
  if (offset == from || child.isText) {
    if (offsetTo != to && !content.child(indexTo).isText) { throw new RangeError("Removing non-flat range") }
    return content.cut(0, from).append(content.cut(to))
  }
  if (index != indexTo) { throw new RangeError("Removing non-flat range") }
  return content.replaceChild(index, child.copy(removeRange(child.content, from - offset - 1, to - offset - 1)))
}

function insertInto(content, dist, insert, parent) {
  var ref = content.findIndex(dist);
  var index = ref.index;
  var offset = ref.offset;
  var child = content.maybeChild(index)
  if (offset == dist || child.isText) {
    if (parent && !parent.canReplace(index, index, insert)) { return null }
    return content.cut(0, dist).append(insert).append(content.cut(dist))
  }
  var inner = insertInto(child.content, dist - offset - 1, insert)
  return inner && content.replaceChild(index, child.copy(inner))
}

// :: Slice
// The empty slice.
Slice.empty = new Slice(Fragment.empty, 0, 0)

function replace($from, $to, slice) {
  if (slice.openLeft > $from.depth)
    { throw new ReplaceError("Inserted content deeper than insertion position") }
  if ($from.depth - slice.openLeft != $to.depth - slice.openRight)
    { throw new ReplaceError("Inconsistent open depths") }
  return replaceOuter($from, $to, slice, 0)
}
exports.replace = replace

function replaceOuter($from, $to, slice, depth) {
  var index = $from.index(depth), node = $from.node(depth)
  if (index == $to.index(depth) && depth < $from.depth - slice.openLeft) {
    var inner = replaceOuter($from, $to, slice, depth + 1)
    return node.copy(node.content.replaceChild(index, inner))
  } else if (!slice.content.size) {
    return close(node, replaceTwoWay($from, $to, depth))
  } else if (!slice.openLeft && !slice.openRight && $from.depth == depth && $to.depth == depth) { // Simple, flat case
    var parent = $from.parent, content = parent.content
    return close(parent, content.cut(0, $from.parentOffset).append(slice.content).append(content.cut($to.parentOffset)))
  } else {
    var ref = prepareSliceForReplace(slice, $from);
    var start = ref.start;
    var end = ref.end;
    return close(node, replaceThreeWay($from, start, end, $to, depth))
  }
}

function checkJoin(main, sub) {
  if (!sub.type.compatibleContent(main.type))
    { throw new ReplaceError("Cannot join " + sub.type.name + " onto " + main.type.name) }
}

function joinable($before, $after, depth) {
  var node = $before.node(depth)
  checkJoin(node, $after.node(depth))
  return node
}

function addNode(child, target) {
  var last = target.length - 1
  if (last >= 0 && child.isText && child.sameMarkup(target[last]))
    { target[last] = child.withText(target[last].text + child.text) }
  else
    { target.push(child) }
}

function addRange($start, $end, depth, target) {
  var node = ($end || $start).node(depth)
  var startIndex = 0, endIndex = $end ? $end.index(depth) : node.childCount
  if ($start) {
    startIndex = $start.index(depth)
    if ($start.depth > depth) {
      startIndex++
    } else if ($start.textOffset) {
      addNode($start.nodeAfter, target)
      startIndex++
    }
  }
  for (var i = startIndex; i < endIndex; i++) { addNode(node.child(i), target) }
  if ($end && $end.depth == depth && $end.textOffset)
    { addNode($end.nodeBefore, target) }
}

function close(node, content) {
  if (!node.type.validContent(content, node.attrs))
    { throw new ReplaceError("Invalid content for node " + node.type.name) }
  return node.copy(content)
}

function replaceThreeWay($from, $start, $end, $to, depth) {
  var openLeft = $from.depth > depth && joinable($from, $start, depth + 1)
  var openRight = $to.depth > depth && joinable($end, $to, depth + 1)

  var content = []
  addRange(null, $from, depth, content)
  if (openLeft && openRight && $start.index(depth) == $end.index(depth)) {
    checkJoin(openLeft, openRight)
    addNode(close(openLeft, replaceThreeWay($from, $start, $end, $to, depth + 1)), content)
  } else {
    if (openLeft)
      { addNode(close(openLeft, replaceTwoWay($from, $start, depth + 1)), content) }
    addRange($start, $end, depth, content)
    if (openRight)
      { addNode(close(openRight, replaceTwoWay($end, $to, depth + 1)), content) }
  }
  addRange($to, null, depth, content)
  return new Fragment(content)
}

function replaceTwoWay($from, $to, depth) {
  var content = []
  addRange(null, $from, depth, content)
  if ($from.depth > depth) {
    var type = joinable($from, $to, depth + 1)
    addNode(close(type, replaceTwoWay($from, $to, depth + 1)), content)
  }
  addRange($to, null, depth, content)
  return new Fragment(content)
}

function prepareSliceForReplace(slice, $along) {
  var extra = $along.depth - slice.openLeft, parent = $along.node(extra)
  var node = parent.copy(slice.content)
  for (var i = extra - 1; i >= 0; i--)
    { node = $along.node(i).copy(Fragment.from(node)) }
  return {start: node.resolveNoCache(slice.openLeft + extra),
          end: node.resolveNoCache(node.content.size - slice.openRight - extra)}
}

},{"./fragment":22}],28:[function(require,module,exports){
var ref = require("./mark");
var Mark = ref.Mark;

// ::- You'll often have to '[resolve](#model.Node.resolve)' a
// position to get the context you need. Objects of this class
// represent such a resolved position, providing various pieces of
// context information and helper methods.
//
// Throughout this interface, methods that take an optional `depth`
// parameter will interpret undefined as `this.depth` and negative
// numbers as `this.depth + value`.
var ResolvedPos = function(pos, path, parentOffset) {
  // :: number The position that was resolved.
  this.pos = pos
  this.path = path
  // :: number
  // The number of levels the parent node is from the root. If this
  // position points directly into the root, it is 0. If it points
  // into a top-level paragraph, 1, and so on.
  this.depth = path.length / 3 - 1
  // :: number The offset this position has into its parent node.
  this.parentOffset = parentOffset
};

var prototypeAccessors = { parent: {},textOffset: {},nodeAfter: {},nodeBefore: {} };

ResolvedPos.prototype.resolveDepth = function (val) {
  if (val == null) { return this.depth }
  if (val < 0) { return this.depth + val }
  return val
};

// :: Node
// The parent node that the position points into. Note that even if
// a position points into a text node, that node is not considered
// the parent—text nodes are 'flat' in this model.
prototypeAccessors.parent.get = function () { return this.node(this.depth) };

// :: (?number) → Node
// The ancestor node at the given level. `p.node(p.depth)` is the
// same as `p.parent`.
ResolvedPos.prototype.node = function (depth) { return this.path[this.resolveDepth(depth) * 3] };

// :: (?number) → number
// The index into the ancestor at the given level. If this points at
// the 3rd node in the 2nd paragraph on the top level, for example,
// `p.index(0)` is 2 and `p.index(1)` is 3.
ResolvedPos.prototype.index = function (depth) { return this.path[this.resolveDepth(depth) * 3 + 1] };

// :: (?number) → number
// The index pointing after this position into the ancestor at the
// given level.
ResolvedPos.prototype.indexAfter = function (depth) {
  depth = this.resolveDepth(depth)
  return this.index(depth) + (depth == this.depth && !this.textOffset ? 0 : 1)
};

// :: (?number) → number
// The (absolute) position at the start of the node at the given
// level.
ResolvedPos.prototype.start = function (depth) {
  depth = this.resolveDepth(depth)
  return depth == 0 ? 0 : this.path[depth * 3 - 1] + 1
};

// :: (?number) → number
// The (absolute) position at the end of the node at the given
// level.
ResolvedPos.prototype.end = function (depth) {
  depth = this.resolveDepth(depth)
  return this.start(depth) + this.node(depth).content.size
};

// :: (?number) → number
// The (absolute) position directly before the node at the given
// level, or, when `level` is `this.level + 1`, the original
// position.
ResolvedPos.prototype.before = function (depth) {
  depth = this.resolveDepth(depth)
  if (!depth) { throw new RangeError("There is no position before the top-level node") }
  return depth == this.depth + 1 ? this.pos : this.path[depth * 3 - 1]
};

// :: (?number) → number
// The (absolute) position directly after the node at the given
// level, or, when `level` is `this.level + 1`, the original
// position.
ResolvedPos.prototype.after = function (depth) {
  depth = this.resolveDepth(depth)
  if (!depth) { throw new RangeError("There is no position after the top-level node") }
  return depth == this.depth + 1 ? this.pos : this.path[depth * 3 - 1] + this.path[depth * 3].nodeSize
};

// :: number
// When this position points into a text node, this returns the
// distance between the position and the start of the text node.
// Will be zero for positions that point between nodes.
prototypeAccessors.textOffset.get = function () { return this.pos - this.path[this.path.length - 1] };

// :: ?Node
// Get the node directly after the position, if any. If the position
// points into a text node, only the part of that node after the
// position is returned.
prototypeAccessors.nodeAfter.get = function () {
  var parent = this.parent, index = this.index(this.depth)
  if (index == parent.childCount) { return null }
  var dOff = this.pos - this.path[this.path.length - 1], child = parent.child(index)
  return dOff ? parent.child(index).cut(dOff) : child
};

// :: ?Node
// Get the node directly before the position, if any. If the
// position points into a text node, only the part of that node
// before the position is returned.
prototypeAccessors.nodeBefore.get = function () {
  var index = this.index(this.depth)
  var dOff = this.pos - this.path[this.path.length - 1]
  if (dOff) { return this.parent.child(index).cut(0, dOff) }
  return index == 0 ? null : this.parent.child(index - 1)
};

// :: (?bool) → [Mark]
// Get the marks at this position, factoring in the surrounding
// marks' inclusiveRight property. If the position is at the start
// of a non-empty node, or `after` is true, the marks of the node
// after it (if any) are returned.
ResolvedPos.prototype.marks = function (after) {
  var parent = this.parent, index = this.index()

  // In an empty parent, return the empty array
  if (parent.content.size == 0) { return Mark.none }
  // When inside a text node or at the start of the parent node, return the node's marks
  if ((after && index < parent.childCount) || index == 0 || this.textOffset)
    { return parent.child(index).marks }

  var marks = parent.child(index - 1).marks
  for (var i = 0; i < marks.length; i++) { if (marks[i].type.spec.inclusiveRight === false)
    { marks = marks[i--].removeFromSet(marks) } }
  return marks
};

// :: (number) → number
// The depth up to which this position and the given (non-resolved)
// position share the same parent nodes.
ResolvedPos.prototype.sharedDepth = function (pos) {
    var this$1 = this;

  for (var depth = this.depth; depth > 0; depth--)
    { if (this$1.start(depth) <= pos && this$1.end(depth) >= pos) { return depth } }
  return 0
};

// :: (?ResolvedPos, ?(Node) → bool) → ?NodeRange
// Returns a range based on the place where this position and the
// given position diverge around block content. If both point into
// the same textblock, for example, a range around that textblock
// will be returned. If they point into different blocks, the range
// around those blocks or their ancestors in their common ancestor
// is returned. You can pass in an optional predicate that will be
// called with a parent node to see if a range into that parent is
// acceptable.
ResolvedPos.prototype.blockRange = function (other, pred) {
    var this$1 = this;
    if ( other === void 0 ) other = this;

  if (other.pos < this.pos) { return other.blockRange(this) }
  for (var d = this.depth - (this.parent.isTextblock || this.pos == other.pos ? 1 : 0); d >= 0; d--)
    { if (other.pos <= this$1.end(d) && (!pred || pred(this$1.node(d))))
      { return new NodeRange(this$1, other, d) } }
};

// :: (ResolvedPos) → bool
// Query whether the given position shares the same parent node.
ResolvedPos.prototype.sameParent = function (other) {
  return this.pos - this.parentOffset == other.pos - other.parentOffset
};

ResolvedPos.prototype.toString = function () {
    var this$1 = this;

  var str = ""
  for (var i = 1; i <= this.depth; i++)
    { str += (str ? "/" : "") + this$1.node(i).type.name + "_" + this$1.index(i - 1) }
  return str + ":" + this.parentOffset
};

ResolvedPos.resolve = function (doc, pos) {
  if (!(pos >= 0 && pos <= doc.content.size)) { throw new RangeError("Position " + pos + " out of range") }
  var path = []
  var start = 0, parentOffset = pos
  for (var node = doc;;) {
    var ref = node.content.findIndex(parentOffset);
      var index = ref.index;
      var offset = ref.offset;
    var rem = parentOffset - offset
    path.push(node, index, start + offset)
    if (!rem) { break }
    node = node.child(index)
    if (node.isText) { break }
    parentOffset = rem - 1
    start += offset + 1
  }
  return new ResolvedPos(pos, path, parentOffset)
};

ResolvedPos.resolveCached = function (doc, pos) {
  for (var i = 0; i < resolveCache.length; i++) {
    var cached = resolveCache[i]
    if (cached.pos == pos && cached.node(0) == doc) { return cached }
  }
  var result = resolveCache[resolveCachePos] = ResolvedPos.resolve(doc, pos)
  resolveCachePos = (resolveCachePos + 1) % resolveCacheSize
  return result
};

Object.defineProperties( ResolvedPos.prototype, prototypeAccessors );
exports.ResolvedPos = ResolvedPos

var resolveCache = [], resolveCachePos = 0, resolveCacheSize = 6

// ::- Represents a flat range of content.
var NodeRange = function($from, $to, depth) {
  // :: ResolvedPos A resolved position along the start of the
  // content. May have a `depth` greater than this object's `depth`
  // property, since these are the positions that were used to
  // compute the range, not re-resolved positions directly at its
  // boundaries.
  this.$from = $from
  // :: ResolvedPos A position along the end of the content. See
  // caveat for [`$from`](#model.NodeRange.$from).
  this.$to = $to
  // :: number The depth of the node that this range points into.
  this.depth = depth
};

var prototypeAccessors$1 = { start: {},end: {},parent: {},startIndex: {},endIndex: {} };

// :: number The position at the start of the range.
prototypeAccessors$1.start.get = function () { return this.$from.before(this.depth + 1) };
// :: number The position at the end of the range.
prototypeAccessors$1.end.get = function () { return this.$to.after(this.depth + 1) };

// :: Node The parent node that the range points into.
prototypeAccessors$1.parent.get = function () { return this.$from.node(this.depth) };
// :: number The start index of the range in the parent node.
prototypeAccessors$1.startIndex.get = function () { return this.$from.index(this.depth) };
// :: number The end index of the range in the parent node.
prototypeAccessors$1.endIndex.get = function () { return this.$to.indexAfter(this.depth) };

Object.defineProperties( NodeRange.prototype, prototypeAccessors$1 );
exports.NodeRange = NodeRange

},{"./mark":25}],29:[function(require,module,exports){
var OrderedMap = require("orderedmap")

var ref = require("./node");
var Node = ref.Node;
var TextNode = ref.TextNode;
var ref$1 = require("./fragment");
var Fragment = ref$1.Fragment;
var ref$2 = require("./mark");
var Mark = ref$2.Mark;
var ref$3 = require("./content");
var ContentExpr = ref$3.ContentExpr;

// For node types where all attrs have a default value (or which don't
// have any attributes), build up a single reusable default attribute
// object, and use it for all nodes that don't specify specific
// attributes.
function defaultAttrs(attrs) {
  var defaults = Object.create(null)
  for (var attrName in attrs) {
    var attr = attrs[attrName]
    if (attr.default === undefined) { return null }
    defaults[attrName] = attr.default
  }
  return defaults
}

function computeAttrs(attrs, value) {
  var built = Object.create(null)
  for (var name in attrs) {
    var given = value && value[name]
    if (given == null) {
      var attr = attrs[name]
      if (attr.default !== undefined)
        { given = attr.default }
      else if (attr.compute)
        { given = attr.compute() }
      else
        { throw new RangeError("No value supplied for attribute " + name) }
    }
    built[name] = given
  }
  return built
}

function initAttrs(attrs) {
  var result = Object.create(null)
  if (attrs) { for (var name in attrs) { result[name] = new Attribute(attrs[name]) } }
  return result
}

// ::- Node types are objects allocated once per `Schema` and used to
// tag `Node` instances with a type. They contain information about
// the node type, such as its name and what kind of node it
// represents.
var NodeType = function(name, schema, spec) {
  // :: string
  // The name the node type has in this schema.
  this.name = name

  // :: Schema
  // A link back to the `Schema` the node type belongs to.
  this.schema = schema

  // :: NodeSpec
  // The spec that this type is based on
  this.spec = spec

  this.attrs = initAttrs(spec.attrs)

  this.defaultAttrs = defaultAttrs(this.attrs)
  this.contentExpr = null

  // :: bool
  // True if this is a block type
  this.isBlock = !(spec.inline || name == "text")

  // :: bool
  // True if this is the text node type.
  this.isText = name == "text"
};

var prototypeAccessors = { isInline: {},isTextblock: {},isLeaf: {} };

// :: bool
// True if this is an inline type.
prototypeAccessors.isInline.get = function () { return !this.isBlock };

// :: bool
// True if this is a textblock type, a block that contains inline
// content.
prototypeAccessors.isTextblock.get = function () { return this.isBlock && this.contentExpr.inlineContent };

// :: bool
// True for node types that allow no content.
prototypeAccessors.isLeaf.get = function () { return this.contentExpr.isLeaf };

NodeType.prototype.hasRequiredAttrs = function (ignore) {
    var this$1 = this;

  for (var n in this$1.attrs)
    { if (this$1.attrs[n].isRequired && (!ignore || !(n in ignore))) { return true } }
  return false
};

NodeType.prototype.compatibleContent = function (other) {
  return this == other || this.contentExpr.compatible(other.contentExpr)
};

NodeType.prototype.computeAttrs = function (attrs) {
  if (!attrs && this.defaultAttrs) { return this.defaultAttrs }
  else { return computeAttrs(this.attrs, attrs) }
};

// :: (?Object, ?union<Fragment, Node, [Node]>, ?[Mark]) → Node
// Create a `Node` of this type. The given attributes are
// checked and defaulted (you can pass `null` to use the type's
// defaults entirely, if no required attributes exist). `content`
// may be a `Fragment`, a node, an array of nodes, or
// `null`. Similarly `marks` may be `null` to default to the empty
// set of marks.
NodeType.prototype.create = function (attrs, content, marks) {
  if (typeof content == "string") { throw new Error("Calling create with string") }
  return new Node(this, this.computeAttrs(attrs), Fragment.from(content), Mark.setFrom(marks))
};

// :: (?Object, ?union<Fragment, Node, [Node]>, ?[Mark]) → Node
// Like [`create`](#model.NodeType.create), but check the given content
// against the node type's content restrictions, and throw an error
// if it doesn't match.
NodeType.prototype.createChecked = function (attrs, content, marks) {
  attrs = this.computeAttrs(attrs)
  content = Fragment.from(content)
  if (!this.validContent(content, attrs))
    { throw new RangeError("Invalid content for node " + this.name) }
  return new Node(this, attrs, content, Mark.setFrom(marks))
};

// :: (?Object, ?union<Fragment, Node, [Node]>, ?[Mark]) → ?Node
// Like [`create`](#model.NodeType.create), but see if it is necessary to
// add nodes to the start or end of the given fragment to make it
// fit the node. If no fitting wrapping can be found, return null.
// Note that, due to the fact that required nodes can always be
// created, this will always succeed if you pass null or
// `Fragment.empty` as content.
NodeType.prototype.createAndFill = function (attrs, content, marks) {
  attrs = this.computeAttrs(attrs)
  content = Fragment.from(content)
  if (content.size) {
    var before = this.contentExpr.start(attrs).fillBefore(content)
    if (!before) { return null }
    content = before.append(content)
  }
  var after = this.contentExpr.getMatchAt(attrs, content).fillBefore(Fragment.empty, true)
  if (!after) { return null }
  return new Node(this, attrs, content.append(after), Mark.setFrom(marks))
};

// :: (Fragment, ?Object) → bool
// Returns true if the given fragment is valid content for this node
// type with the given attributes.
NodeType.prototype.validContent = function (content, attrs) {
  return this.contentExpr.matches(attrs, content)
};

NodeType.compile = function (nodes, schema) {
  var result = Object.create(null)
  nodes.forEach(function (name, spec) { return result[name] = new NodeType(name, schema, spec); })

  if (!result.doc) { throw new RangeError("Every schema needs a 'doc' type") }
  if (!result.text) { throw new RangeError("Every schema needs a 'text' type") }

  return result
};

Object.defineProperties( NodeType.prototype, prototypeAccessors );
exports.NodeType = NodeType

// Attribute descriptors

var Attribute = function(options) {
  this.default = options.default
  this.compute = options.compute
};

var prototypeAccessors$1 = { isRequired: {} };

prototypeAccessors$1.isRequired.get = function () {
  return this.default === undefined && !this.compute
};

Object.defineProperties( Attribute.prototype, prototypeAccessors$1 );

// Marks

// ::- Like nodes, marks (which are associated with nodes to signify
// things like emphasis or being part of a link) are tagged with type
// objects, which are instantiated once per `Schema`.
var MarkType = function(name, rank, schema, spec) {
  // :: string
  // The name of the mark type.
  this.name = name

  // :: Schema
  // The schema that this mark type instance is part of.
  this.schema = schema

  // :: MarkSpec
  // The spec on which the type is based.
  this.spec = spec

  this.attrs = initAttrs(spec.attrs)

  this.rank = rank
  var defaults = defaultAttrs(this.attrs)
  this.instance = defaults && new Mark(this, defaults)
};

// :: (?Object) → Mark
// Create a mark of this type. `attrs` may be `null` or an object
// containing only some of the mark's attributes. The others, if
// they have defaults, will be added.
MarkType.prototype.create = function (attrs) {
  if (!attrs && this.instance) { return this.instance }
  return new Mark(this, computeAttrs(this.attrs, attrs))
};

MarkType.compile = function (marks, schema) {
  var result = Object.create(null), rank = 0
  marks.forEach(function (name, spec) { return result[name] = new MarkType(name, rank++, schema, spec); })
  return result
};

// :: ([Mark]) → [Mark]
// When there is a mark of this type in the given set, a new set
// without it is returned. Otherwise, the input set is returned.
MarkType.prototype.removeFromSet = function (set) {
    var this$1 = this;

  for (var i = 0; i < set.length; i++)
    { if (set[i].type == this$1)
      { return set.slice(0, i).concat(set.slice(i + 1)) } }
  return set
};

// :: ([Mark]) → ?Mark
// Tests whether there is a mark of this type in the given set.
MarkType.prototype.isInSet = function (set) {
    var this$1 = this;

  for (var i = 0; i < set.length; i++)
    { if (set[i].type == this$1) { return set[i] } }
};
exports.MarkType = MarkType

// SchemaSpec:: interface
// An object describing a schema, as passed to the `Schema`
// constructor.
//
//   nodes:: union<Object<NodeSpec>, OrderedMap<NodeSpec>>
//   The node types in this schema. Maps names to `NodeSpec` objects
//   describing the node to be associated with that name. Their order
//   is significant
//
//   marks:: ?union<Object<MarkSpec>, OrderedMap<MarkSpec>>
//   The mark types that exist in this schema.

// NodeSpec:: interface
//
//   content:: ?string
//   The content expression for this node, as described in the [schema
//   guide](guide/schema.html). When not given, the node does not allow
//   any content.
//
//   group:: ?string
//   The group or space-separated groups to which this node belongs, as
//   referred to in the content expressions for the schema.
//
//   inline:: ?bool
//   Should be set to a truthy value for inline nodes. (Implied for
//   text nodes.)
//
//   attrs:: ?Object<AttributeSpec>
//   The attributes that nodes of this type get.
//
//   selectable:: ?bool
//   Controls whether nodes of this type can be selected (as a [node
//   selection](#state.NodeSelection)). Defaults to true for non-text
//   nodes.
//
//   draggable:: ?bool
//   Determines whether nodes of this type can be dragged. Enabling it
//   causes ProseMirror to set a `draggable` attribute on its DOM
//   representation, and to put its HTML serialization into the drag
//   event's [data
//   transfer](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer)
//   when dragged. Defaults to false.
//
//   code:: ?bool
//   Can be used to indicate that this node contains code, which
//   causes some commands to behave differently.
//
//   defining:: ?bool
//   Determines whether this node is considered an important parent
//   node during replace operations (such as paste). Non-defining (the
//   default) nodes get dropped when their entire content is replaced,
//   whereas defining nodes persist and wrap the inserted content.
//   Likewise, the the _inserted_ content, when not inserting into a
//   textblock, the defining parents of the content are preserved.
//   Typically, non-default-paragraph textblock types, and possible
//   list items, are marked as defining.
//
//   toDOM:: ?(Node) → DOMOutputSpec
//   Defines the default way a node of this type should be serialized
//   to DOM/HTML (as used by
//   [`DOMSerializer.fromSchema`](#model.DOMSerializer^fromSchema).
//   Should return an [array structure](#model.DOMOutputSpec) that
//   describes the resulting DOM structure, with an optional number
//   zero (“hole”) in it to indicate where the node's content should
//   be inserted.
//
//   parseDOM:: ?[ParseRule]
//   Associates DOM parser information with this node, which can be
//   used by [`DOMParser.fromSchema`](#model.DOMParser^fromSchema) to
//   automatically derive a parser. The `node` field in the rules is
//   implied (the name of this node will be filled in automatically).
//   If you supply your own parser, you do not need to also specify
//   parsing rules in your schema.

// MarkSpec:: interface
//
//   attrs:: ?Object<AttributeSpec>
//   The attributes that marks of this type get.
//
//   inclusiveRight:: ?bool
//   Whether this mark should be active when the cursor is positioned
//   at the end of the mark. Defaults to true.
//
//   toDOM:: ?(mark: Mark) → DOMOutputSpec
//   Defines the default way marks of this type should be serialized
//   to DOM/HTML.
//
//   parseDOM:: ?[ParseRule]
//   Associates DOM parser information with this mark (see the
//   corresponding [node spec field](#model.NodeSpec.parseDOM). The
//   `mark` field in the rules is implied.

// AttributeSpec:: interface
//
// Used to define attributes. Attributes that have no default or
// compute property must be provided whenever a node or mark of a type
// that has them is created.
//
// The following fields are supported:
//
//   default:: ?any
//   The default value for this attribute, to choose when no
//   explicit value is provided.
//
//   compute:: ?() → any
//   A function that computes a default value for the attribute.

// ::- A document schema.
var Schema = function(spec) {
  var this$1 = this;

  // :: OrderedMap<NodeSpec> The node specs that the schema is based on.
  this.nodeSpec = OrderedMap.from(spec.nodes)
  // :: OrderedMap<MarkSpec> The mark spec that the schema is based on.
  this.markSpec = OrderedMap.from(spec.marks)

  // :: Object<NodeType>
  // An object mapping the schema's node names to node type objects.
  this.nodes = NodeType.compile(this.nodeSpec, this)

  // :: Object<MarkType>
  // A map from mark names to mark type objects.
  this.marks = MarkType.compile(this.markSpec, this)

  for (var prop in this$1.nodes) {
    if (prop in this$1.marks)
      { throw new RangeError(prop + " can not be both a node and a mark") }
    var type = this$1.nodes[prop]
    type.contentExpr = ContentExpr.parse(type, this$1.nodeSpec.get(prop).content || "", this$1.nodeSpec)
  }

  // :: Object
  // An object for storing whatever values modules may want to
  // compute and cache per schema. (If you want to store something
  // in it, try to use property names unlikely to clash.)
  this.cached = Object.create(null)
  this.cached.wrappings = Object.create(null)

  this.nodeFromJSON = this.nodeFromJSON.bind(this)
  this.markFromJSON = this.markFromJSON.bind(this)
};

// :: (union<string, NodeType>, ?Object, ?union<Fragment, Node, [Node]>, ?[Mark]) → Node
// Create a node in this schema. The `type` may be a string or a
// `NodeType` instance. Attributes will be extended
// with defaults, `content` may be a `Fragment`,
// `null`, a `Node`, or an array of nodes.
Schema.prototype.node = function (type, attrs, content, marks) {
  if (typeof type == "string")
    { type = this.nodeType(type) }
  else if (!(type instanceof NodeType))
    { throw new RangeError("Invalid node type: " + type) }
  else if (type.schema != this)
    { throw new RangeError("Node type from different schema used (" + type.name + ")") }

  return type.createChecked(attrs, content, marks)
};

// :: (string, ?[Mark]) → Node
// Create a text node in the schema. Empty text nodes are not
// allowed.
Schema.prototype.text = function (text$1, marks) {
  var type = this.nodes.text
  return new TextNode(type, type.defaultAttrs, text$1, Mark.setFrom(marks))
};

// :: (union<string, MarkType>, ?Object) → Mark
// Create a mark with the given type and attributes.
Schema.prototype.mark = function (type, attrs) {
  if (typeof type == "string") { type = this.marks[type] }
  return type.create(attrs)
};

// :: (Object) → Node
// Deserialize a node from its JSON representation. This method is
// bound.
Schema.prototype.nodeFromJSON = function (json) {
  return Node.fromJSON(this, json)
};

// :: (Object) → Mark
// Deserialize a mark from its JSON representation. This method is
// bound.
Schema.prototype.markFromJSON = function (json) {
  return Mark.fromJSON(this, json)
};

Schema.prototype.nodeType = function (name) {
  var found = this.nodes[name]
  if (!found) { throw new RangeError("Unknown node type: " + name) }
  return found
};
exports.Schema = Schema

},{"./content":20,"./fragment":22,"./mark":25,"./node":26,"orderedmap":2}],30:[function(require,module,exports){
// DOMOutputSpec:: interface
// A description of a DOM structure. Can be either a string, which is
// interpreted as a text node, a DOM node, which is interpreted as
// itself, or an array.
//
// An array describes a DOM element. The first element in the array
// should be a string, and is the name of the DOM element. If the
// second element is a non-Array, non-DOM node object, it is
// interpreted as an object providing the DOM element's attributes.
// Any elements after that (including the 2nd if it's not an attribute
// object) are interpreted as children of the DOM elements, and must
// either be valid `DOMOutputSpec` values, or the number zero.
//
// The number zero (pronounced “hole”) is used to indicate the place
// where a ProseMirror node's content should be inserted.

// ::- A DOM serializer knows how to convert ProseMirror nodes and
// marks of various types to DOM nodes.
var DOMSerializer = function(nodes, marks) {
  // :: Object<(node: Node) → DOMOutputSpec>
  this.nodes = nodes || {}
  // :: Object<(mark: Mark) → DOMOutputSpec>
  this.marks = marks || {}
};

// :: (Fragment, ?Object) → dom.DocumentFragment
// Serialize the content of this fragment to a DOM fragment. When
// not in the browser, the `document` option, containing a DOM
// document, should be passed so that the serialize can create
// nodes.
DOMSerializer.prototype.serializeFragment = function (fragment, options, target) {
    var this$1 = this;
    if ( options === void 0 ) options = {};

  if (!target) { target = doc(options).createDocumentFragment() }

  var top = target, active = null
  fragment.forEach(function (node) {
    if (active || node.marks.length) {
      if (!active) { active = [] }
      var keep = 0
      for (; keep < Math.min(active.length, node.marks.length); ++keep)
        { if (!node.marks[keep].eq(active[keep])) { break } }
      while (keep < active.length) {
        active.pop()
        top = top.parentNode
      }
      while (active.length < node.marks.length) {
        var add = node.marks[active.length]
        active.push(add)
        top = top.appendChild(this$1.serializeMark(add, options))
      }
    }
    top.appendChild(this$1.serializeNode(node, options))
  })

  return target
};

// :: (Node, ?Object) → dom.Node
// Serialize this node to a DOM node. This can be useful when you
// need to serialize a part of a document, as opposed to the whole
// document. To serialize a whole document, use
// [`serializeFragment`](#model.DOMSerializer.serializeFragment) on
// its [`content`](#model.Node.content).
DOMSerializer.prototype.serializeNode = function (node, options) {
    if ( options === void 0 ) options = {};

  return this.renderStructure(this.nodes[node.type.name](node), node, options)
};

DOMSerializer.prototype.serializeNodeAndMarks = function (node, options) {
    var this$1 = this;
    if ( options === void 0 ) options = {};

  var dom = this.serializeNode(node, options)
  for (var i = node.marks.length - 1; i >= 0; i--) {
    var wrap = this$1.serializeMark(node.marks[i], options)
    wrap.appendChild(dom)
    dom = wrap
  }
  return dom
};

DOMSerializer.prototype.serializeMark = function (mark, options) {
    if ( options === void 0 ) options = {};

  return this.renderStructure(this.marks[mark.type.name](mark), null, options)
};

// :: (dom.Document, DOMOutputSpec) → {dom: dom.Node, contentDOM: ?dom.Node}
// Render an [output spec](##model.DOMOutputSpec).
DOMSerializer.renderSpec = function (doc, structure) {
  if (typeof structure == "string")
    { return {dom: doc.createTextNode(structure)} }
  if (structure.nodeType != null)
    { return {dom: structure} }
  var dom = doc.createElement(structure[0]), contentDOM = null
  var attrs = structure[1], start = 1
  if (attrs && typeof attrs == "object" && attrs.nodeType == null && !Array.isArray(attrs)) {
    start = 2
    for (var name in attrs) {
      if (name == "style") { dom.style.cssText = attrs[name] }
      else if (attrs[name] != null) { dom.setAttribute(name, attrs[name]) }
    }
  }
  for (var i = start; i < structure.length; i++) {
    var child = structure[i]
    if (child === 0) {
      if (i < structure.length - 1 || i > start)
        { throw new RangeError("Content hole must be the only child of its parent node") }
      return {dom: dom, contentDOM: dom}
    } else {
      var ref = DOMSerializer.renderSpec(doc, child);
        var inner = ref.dom;
        var innerContent = ref.contentDOM;
      dom.appendChild(inner)
      if (innerContent) {
        if (contentDOM) { throw new RangeError("Multiple content holes") }
        contentDOM = innerContent
      }
    }
  }
  return {dom: dom, contentDOM: contentDOM}
};

DOMSerializer.prototype.renderStructure = function (structure, node, options) {
  var ref = DOMSerializer.renderSpec(doc(options), structure);
    var dom = ref.dom;
    var contentDOM = ref.contentDOM;
  if (node && !node.isLeaf) {
    if (!contentDOM) { throw new RangeError("No content hole in template for non-leaf node") }
    if (options.onContent)
      { options.onContent(node, contentDOM, options) }
    else
      { this.serializeFragment(node.content, options, contentDOM) }
  } else if (contentDOM) {
    throw new RangeError("Content hole not allowed in a mark or leaf node spec")
  }
  return dom
};

// :: (Schema) → DOMSerializer
// Build a serializer using the [`toDOM`](#model.NodeSpec.toDOM)
// properties in a schema's node and mark specs.
DOMSerializer.fromSchema = function (schema) {
  return schema.cached.domSerializer ||
    (schema.cached.domSerializer = new DOMSerializer(this.nodesFromSchema(schema), this.marksFromSchema(schema)))
};

// :: (Schema) → Object<(node: Node) → DOMOutputSpec>
// Gather the serializers in a schema's node specs into an object.
// This can be useful as a base to build a custom serializer from.
DOMSerializer.nodesFromSchema = function (schema) {
  return gatherToDOM(schema.nodes)
};

// :: (Schema) → Object<(mark: Mark) → DOMOutputSpec>
// Gather the serializers in a schema's mark specs into an object.
DOMSerializer.marksFromSchema = function (schema) {
  return gatherToDOM(schema.marks)
};
exports.DOMSerializer = DOMSerializer

function gatherToDOM(obj) {
  var result = {}
  for (var name in obj) {
    var toDOM = obj[name].spec.toDOM
    if (toDOM) { result[name] = toDOM }
  }
  return result
}

function doc(options) {
  // declare global: window
  return options.document || window.document
}

},{}],31:[function(require,module,exports){
var ref = require("prosemirror-model");
var Schema = ref.Schema;

// :: Object
//
//   doc:: NodeSpec The top level document node.
//
//   paragraph:: NodeSpec A plain paragraph textblock.
//
//   blockquote:: NodeSpec A blockquote wrapping one or more blocks.
//
//   horizontal_rule:: NodeSpec A horizontal rule.
//
//   heading:: NodeSpec A heading textblock, with a `level`
//   attribute that should hold the number 1 to 6.
//
//   code_block:: NodeSpec A code listing. Disallows marks or
//   non-text inline nodes by default.
//
//   text:: NodeSpec The text node.
//
//   image:: NodeSpec An inline image node. Supports `src`, `alt`, and
//   `href` attributes. The latter two default to the empty string.
//
//   hard_break:: NodeSpec A hard line break.
var nodes = {
  doc: {
    content: "block+"
  },

  paragraph: {
    content: "inline<_>*",
    group: "block",
    parseDOM: [{tag: "p"}],
    toDOM: function toDOM() { return ["p", 0] }
  },

  blockquote: {
    content: "block+",
    group: "block",
    defining: true,
    parseDOM: [{tag: "blockquote"}],
    toDOM: function toDOM() { return ["blockquote", 0] }
  },

  horizontal_rule: {
    group: "block",
    parseDOM: [{tag: "hr"}],
    toDOM: function toDOM() { return ["hr"] }
  },

  heading: {
    attrs: {level: {default: 1}},
    content: "inline<_>*",
    group: "block",
    defining: true,
    parseDOM: [{tag: "h1", attrs: {level: 1}},
               {tag: "h2", attrs: {level: 2}},
               {tag: "h3", attrs: {level: 3}},
               {tag: "h4", attrs: {level: 4}},
               {tag: "h5", attrs: {level: 5}},
               {tag: "h6", attrs: {level: 6}}],
    toDOM: function toDOM(node) { return ["h" + node.attrs.level, 0] }
  },

  code_block: {
    content: "text*",
    group: "block",
    code: true,
    defining: true,
    parseDOM: [{tag: "pre", preserveWhitespace: true}],
    toDOM: function toDOM() { return ["pre", ["code", 0]] }
  },

  text: {
    group: "inline",
    toDOM: function toDOM(node) { return node.text }
  },

  image: {
    inline: true,
    attrs: {
      src: {},
      alt: {default: null},
      title: {default: null}
    },
    group: "inline",
    draggable: true,
    parseDOM: [{tag: "img[src]", getAttrs: function getAttrs(dom) {
      return {
        src: dom.getAttribute("src"),
        title: dom.getAttribute("title"),
        alt: dom.getAttribute("alt")
      }
    }}],
    toDOM: function toDOM(node) { return ["img", node.attrs] }
  },

  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{tag: "br"}],
    toDOM: function toDOM() { return ["br"] }
  }
}
exports.nodes = nodes

// :: Object
//
//  em:: MarkSpec An emphasis mark.
//
//  strong:: MarkSpec A strong mark.
//
//  link:: MarkSpec A link. Has `href` and `title` attributes.
//  `title` defaults to the empty string.
//
//  code:: MarkSpec Code font mark.
var marks = {
  em: {
    parseDOM: [{tag: "i"}, {tag: "em"},
               {style: "font-style", getAttrs: function (value) { return value == "italic" && null; }}],
    toDOM: function toDOM() { return ["em"] }
  },

  strong: {
    parseDOM: [{tag: "strong"},
               // This works around a Google Docs misbehavior where
               // pasted content will be inexplicably wrapped in `<b>`
               // tags with a font-weight normal.
               {tag: "b", getAttrs: function (node) { return node.style.fontWeight != "normal" && null; }},
               {style: "font-weight", getAttrs: function (value) { return /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null; }}],
    toDOM: function toDOM() { return ["strong"] }
  },

  link: {
    attrs: {
      href: {},
      title: {default: null}
    },
    parseDOM: [{tag: "a[href]", getAttrs: function getAttrs(dom) {
      return {href: dom.getAttribute("href"), title: dom.getAttribute("title")}
    }}],
    toDOM: function toDOM(node) { return ["a", node.attrs] }
  },

  code: {
    parseDOM: [{tag: "code"}],
    toDOM: function toDOM() { return ["code"] }
  }
}
exports.marks = marks

// :: Schema
// This schema rougly corresponds to the document schema used by
// CommonMark, minus the list elements, which are defined in the
// [schema-list](#schema-list) module.
//
// To reuse elements from this schema, extend or read from its
// [`nodeSpec`](#model.Schema.nodeSpec) and
// [`markSpec`](#model.Schema.markSpec) properties.
var schema = new Schema({nodes: nodes, marks: marks})
exports.schema = schema

},{"prosemirror-model":24}],32:[function(require,module,exports){
var ref = require("prosemirror-transform");
var findWrapping = ref.findWrapping;
var liftTarget = ref.liftTarget;
var canSplit = ref.canSplit;
var ReplaceAroundStep = ref.ReplaceAroundStep;
var ref$1 = require("prosemirror-model");
var Slice = ref$1.Slice;
var Fragment = ref$1.Fragment;
var NodeRange = ref$1.NodeRange;

// :: NodeSpec
// An ordered list node type spec. Has a single attribute, `order`,
// which determines the number at which the list starts counting, and
// defaults to 1.
var orderedList = {
  attrs: {order: {default: 1}},
  parseDOM: [{tag: "ol", getAttrs: function getAttrs(dom) {
    return {order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1}
  }}],
  toDOM: function toDOM(node) {
    return ["ol", {start: node.attrs.order == 1 ? null : node.attrs.order}, 0]
  }
}
exports.orderedList = orderedList

// :: NodeSpec
// A bullet list node spec.
var bulletList = {
  parseDOM: [{tag: "ul"}],
  toDOM: function toDOM() { return ["ul", 0] }
}
exports.bulletList = bulletList

// :: NodeSpec
// A list item node spec.
var listItem = {
  parseDOM: [{tag: "li"}],
  toDOM: function toDOM() { return ["li", 0] },
  defining: true
}
exports.listItem = listItem

function add(obj, props) {
  var copy = {}
  for (var prop in obj) { copy[prop] = obj[prop] }
  for (var prop$1 in props) { copy[prop$1] = props[prop$1] }
  return copy
}

// :: (OrderedMap, string, ?string) → OrderedMap
// Convenience function for adding list-related node types to a map
// describing the nodes in a schema. Adds `OrderedList` as
// `"ordered_list"`, `BulletList` as `"bullet_list"`, and `ListItem`
// as `"list_item"`. `itemContent` determines the content expression
// for the list items. If you want the commands defined in this module
// to apply to your list structure, it should have a shape like
// `"paragraph block*"`, a plain textblock type followed by zero or
// more arbitrary nodes. `listGroup` can be given to assign a group
// name to the list node types, for example `"block"`.
function addListNodes(nodes, itemContent, listGroup) {
  return nodes.append({
    ordered_list: add(orderedList, {content: "list_item+", group: listGroup}),
    bullet_list: add(bulletList, {content: "list_item+", group: listGroup}),
    list_item: add(listItem, {content: itemContent})
  })
}
exports.addListNodes = addListNodes

// :: (NodeType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Returns a command function that wraps the selection in a list with
// the given type an attributes. If `apply` is `false`, only return a
// value to indicate whether this is possible, but don't actually
// perform the change.
function wrapInList(nodeType, attrs) {
  return function(state, dispatch) {
    var ref = state.selection;
    var $from = ref.$from;
    var $to = ref.$to;
    var range = $from.blockRange($to), doJoin = false, outerRange = range
    // This is at the top of an existing list item
    if (range.depth >= 2 && $from.node(range.depth - 1).type.compatibleContent(nodeType) && range.startIndex == 0) {
      // Don't do anything if this is the top of the list
      if ($from.index(range.depth - 1) == 0) { return false }
      var $insert = state.doc.resolve(range.start - 2)
      outerRange = new NodeRange($insert, $insert, range.depth)
      if (range.endIndex < range.parent.childCount)
        { range = new NodeRange($from, state.doc.resolve($to.end(range.depth)), range.depth) }
      doJoin = true
    }
    var wrap = findWrapping(outerRange, nodeType, attrs, range)
    if (!wrap) { return false }
    if (dispatch) { dispatch(doWrapInList(state.tr, range, wrap, doJoin, nodeType).scrollIntoView()) }
    return true
  }
}
exports.wrapInList = wrapInList

function doWrapInList(tr, range, wrappers, joinBefore, nodeType) {
  var content = Fragment.empty
  for (var i = wrappers.length - 1; i >= 0; i--)
    { content = Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content)) }

  tr.step(new ReplaceAroundStep(range.start - (joinBefore ? 2 : 0), range.end, range.start, range.end,
                                new Slice(content, 0, 0), wrappers.length, true))

  var found = 0
  for (var i$1 = 0; i$1 < wrappers.length; i$1++) { if (wrappers[i$1].type == nodeType) { found = i$1 + 1 } }
  var splitDepth = wrappers.length - found

  var splitPos = range.start + wrappers.length - (joinBefore ? 2 : 0), parent = range.parent
  for (var i$2 = range.startIndex, e = range.endIndex, first = true; i$2 < e; i$2++, first = false) {
    if (!first && canSplit(tr.doc, splitPos, splitDepth)) { tr.split(splitPos, splitDepth) }
    splitPos += parent.child(i$2).nodeSize + (first ? 0 : 2 * splitDepth)
  }
  return tr
}

// :: (NodeType) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Build a command that splits a non-empty textblock at the top level
// of a list item by also splitting that list item.
function splitListItem(nodeType) {
  return function(state, dispatch) {
    var ref = state.selection;
    var $from = ref.$from;
    var $to = ref.$to;
    var node = ref.node;
    if ((node && node.isBlock) || !$from.parent.content.size ||
        $from.depth < 2 || !$from.sameParent($to)) { return false }
    var grandParent = $from.node(-1)
    if (grandParent.type != nodeType) { return false }
    var nextType = $to.pos == $from.end() ? grandParent.defaultContentType($from.indexAfter(-1)) : null
    var tr = state.tr.delete($from.pos, $to.pos)
    var types = nextType && [null, {type: nextType}]
    if (!canSplit(tr.doc, $from.pos, 2, types)) { return false }
    if (dispatch) { dispatch(tr.split($from.pos, 2, types).scrollIntoView()) }
    return true
  }
}
exports.splitListItem = splitListItem

// :: (NodeType) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Create a command to lift the list item around the selection up into
// a wrapping list.
function liftListItem(nodeType) {
  return function(state, dispatch) {
    var ref = state.selection;
    var $from = ref.$from;
    var $to = ref.$to;
    var range = $from.blockRange($to, function (node) { return node.childCount && node.firstChild.type == nodeType; })
    if (!range || range.depth < 2 || $from.node(range.depth - 1).type != nodeType) { return false }
    if (dispatch) {
      var tr = state.tr, end = range.end, endOfList = $to.end(range.depth)
      if (end < endOfList) {
        // There are siblings after the lifted items, which must become
        // children of the last item
        tr.step(new ReplaceAroundStep(end - 1, endOfList, end, endOfList,
                                      new Slice(Fragment.from(nodeType.create(null, range.parent.copy())), 1, 0), 1, true))
        range = new NodeRange(tr.doc.resolveNoCache($from.pos), tr.doc.resolveNoCache(endOfList), range.depth)
      }
      dispatch(tr.lift(range, liftTarget(range)).scrollIntoView())
    }
    return true
  }
}
exports.liftListItem = liftListItem

// :: (NodeType) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Create a command to sink the list item around the selection down
// into an inner list.
function sinkListItem(nodeType) {
  return function(state, dispatch) {
    var ref = state.selection;
    var $from = ref.$from;
    var $to = ref.$to;
    var range = $from.blockRange($to, function (node) { return node.childCount && node.firstChild.type == nodeType; })
    if (!range) { return false }
    var startIndex = range.startIndex
    if (startIndex == 0) { return false }
    var parent = range.parent, nodeBefore = parent.child(startIndex - 1)
    if (nodeBefore.type != nodeType) { return false }

    if (dispatch) {
      var nestedBefore = nodeBefore.lastChild && nodeBefore.lastChild.type == parent.type
      var inner = Fragment.from(nestedBefore ? nodeType.create() : null)
      var slice = new Slice(Fragment.from(nodeType.create(null, Fragment.from(parent.copy(inner)))),
                            nestedBefore ? 3 : 1, 0)
      var before = range.start, after = range.end
      dispatch(state.tr.step(new ReplaceAroundStep(before - (nestedBefore ? 3 : 1), after,
                                                   before, after, slice, 1, true))
               .scrollIntoView())
    }
    return true
  }
}
exports.sinkListItem = sinkListItem

},{"prosemirror-model":24,"prosemirror-transform":39}],33:[function(require,module,exports){
var ref = require("prosemirror-model");
var Fragment = ref.Fragment;
var Slice = ref.Slice;
var ref$1 = require("prosemirror-transform");
var Step = ref$1.Step;
var StepResult = ref$1.StepResult;
var StepMap = ref$1.StepMap;
var ReplaceStep = ref$1.ReplaceStep;
var ref$2 = require("prosemirror-state");
var Selection = ref$2.Selection;

// :: NodeSpec
// A table node spec. Has one attribute, **`columns`**, which holds
// a number indicating the amount of columns in the table.
var table = {
  attrs: {columns: {default: 1}},
  parseDOM: [{tag: "table", getAttrs: function getAttrs(dom) {
    var row = dom.querySelector("tr")
    if (!row || !row.children.length) { return false }
    // FIXME using the child count as column width is problematic
    // when parsing document fragments
    return {columns: row.children.length}
  }}],
  toDOM: function toDOM() { return ["table", ["tbody", 0]] }
}
exports.table = table

// :: NodeSpec
// A table row node spec. Has one attribute, **`columns`**, which
// holds a number indicating the amount of columns in the table.
var tableRow = {
  attrs: {columns: {default: 1}},
  parseDOM: [{tag: "tr", getAttrs: function (dom) { return dom.children.length ? {columns: dom.children.length} : false; }}],
  toDOM: function toDOM() { return ["tr", 0] },
  tableRow: true
}
exports.tableRow = tableRow

// :: NodeSpec
// A table cell node spec.
var tableCell = {
  parseDOM: [{tag: "td"}],
  toDOM: function toDOM() { return ["td", 0] }
}
exports.tableCell = tableCell

function add(obj, props) {
  var copy = {}
  for (var prop in obj) { copy[prop] = obj[prop] }
  for (var prop$1 in props) { copy[prop$1] = props[prop$1] }
  return copy
}

// :: (OrderedMap, string, ?string) → OrderedMap
// Convenience function for adding table-related node types to a map
// describing the nodes in a schema. Adds `Table` as `"table"`,
// `TableRow` as `"table_row"`, and `TableCell` as `"table_cell"`.
// `cellContent` should be a content expression describing what may
// occur inside cells.
function addTableNodes(nodes, cellContent, tableGroup) {
  return nodes.append({
    table: add(table, {content: "table_row[columns=.columns]+", group: tableGroup}),
    table_row: add(tableRow, {content: "table_cell{.columns}"}),
    table_cell: add(tableCell, {content: cellContent})
  })
}
exports.addTableNodes = addTableNodes

// :: (NodeType, number, number, ?Object) → Node
// Create a table node with the given number of rows and columns.
function createTable(nodeType, rows, columns, attrs) {
  attrs = setColumns(attrs, columns)
  var rowType = nodeType.contentExpr.elements[0].nodeTypes[0]
  var cellType = rowType.contentExpr.elements[0].nodeTypes[0]
  var cell = cellType.createAndFill(), cells = []
  for (var i = 0; i < columns; i++) { cells.push(cell) }
  var row = rowType.create({columns: columns}, Fragment.from(cells)), rowNodes = []
  for (var i$1 = 0; i$1 < rows; i$1++) { rowNodes.push(row) }
  return nodeType.create(attrs, Fragment.from(rowNodes))
}
exports.createTable = createTable

// Steps to add and remove a column

function setColumns(attrs, columns) {
  var result = Object.create(null)
  if (attrs) { for (var prop in attrs) { result[prop] = attrs[prop] } }
  result.columns = columns
  return result
}

function adjustColumns(attrs, diff) {
  return setColumns(attrs, attrs.columns + diff)
}

// ::- A `Step` subclass for adding a column to a table in a single
// atomic step.
var AddColumnStep = (function (Step) {
  function AddColumnStep(positions, cells) {
    Step.call(this)
    this.positions = positions
    this.cells = cells
  }

  if ( Step ) AddColumnStep.__proto__ = Step;
  AddColumnStep.prototype = Object.create( Step && Step.prototype );
  AddColumnStep.prototype.constructor = AddColumnStep;

  // :: (Node, number, number, NodeType, ?Object) → AddColumnStep
  // Create a step that inserts a column into the table after
  // `tablePos`, at the index given by `columnIndex`, using cells with
  // the given type and attributes.
  AddColumnStep.create = function create (doc, tablePos, columnIndex, cellType, cellAttrs) {
    var cell = cellType.createAndFill(cellAttrs)
    var positions = [], cells = []
    var table = doc.nodeAt(tablePos)
    table.forEach(function (row, rowOff) {
      var cellPos = tablePos + 2 + rowOff
      for (var i = 0; i < columnIndex; i++) { cellPos += row.child(i).nodeSize }
      positions.push(cellPos)
      cells.push(cell)
    })
    return new AddColumnStep(positions, cells)
  };

  AddColumnStep.prototype.apply = function apply (doc) {
    var this$1 = this;

    var index = null, table = null, tablePos = null
    for (var i = 0; i < this.positions.length; i++) {
      var $pos = doc.resolve(this$1.positions[i])
      if ($pos.depth < 2 || $pos.index(-1) != i)
        { return StepResult.fail("Invalid cell insert position") }
      if (table == null) {
        table = $pos.node(-1)
        if (table.childCount != this$1.positions.length)
          { return StepResult.fail("Mismatch in number of rows") }
        tablePos = $pos.before(-1)
        index = $pos.index()
      } else if ($pos.before(-1) != tablePos || $pos.index() != index) {
        return StepResult.fail("Column insert positions not consistent")
      }
    }

    var updatedRows = []
    for (var i$1 = 0; i$1 < table.childCount; i$1++) {
      var row = table.child(i$1), rowCells = index ? [] : [this$1.cells[i$1]]
      for (var j = 0; j < row.childCount; j++) {
        rowCells.push(row.child(j))
        if (j + 1 == index) { rowCells.push(this$1.cells[i$1]) }
      }
      updatedRows.push(row.type.create(adjustColumns(row.attrs, 1), Fragment.from(rowCells)))
    }
    var updatedTable = table.type.create(adjustColumns(table.attrs, 1),  Fragment.from(updatedRows))
    return StepResult.fromReplace(doc, tablePos, tablePos + table.nodeSize,
                                  new Slice(Fragment.from(updatedTable), 0, 0))
  };

  AddColumnStep.prototype.getMap = function getMap () {
    var this$1 = this;

    var ranges = []
    for (var i = 0; i < this.positions.length; i++)
      { ranges.push(this$1.positions[i], 0, this$1.cells[i].nodeSize) }
    return new StepMap(ranges)
  };

  AddColumnStep.prototype.invert = function invert (doc) {
    var this$1 = this;

    var $first = doc.resolve(this.positions[0])
    var table = $first.node(-1)
    var from = [], to = [], dPos = 0
    for (var i = 0; i < table.childCount; i++) {
      var pos = this$1.positions[i] + dPos, size = this$1.cells[i].nodeSize
      from.push(pos)
      to.push(pos + size)
      dPos += size
    }
    return new RemoveColumnStep(from, to)
  };

  AddColumnStep.prototype.map = function map (mapping) {
    return new AddColumnStep(this.positions.map(function (p) { return mapping.map(p); }), this.cells)
  };

  AddColumnStep.prototype.toJSON = function toJSON () {
    return {stepType: this.jsonID,
            positions: this.positions,
            cells: this.cells.map(function (c) { return c.toJSON(); })}
  };

  AddColumnStep.fromJSON = function fromJSON (schema, json) {
    return new AddColumnStep(json.positions, json.cells.map(schema.nodeFromJSON))
  };

  return AddColumnStep;
}(Step));
exports.AddColumnStep = AddColumnStep

Step.jsonID("addTableColumn", AddColumnStep)

// ::- A subclass of `Step` that removes a column from a table.
var RemoveColumnStep = (function (Step) {
  function RemoveColumnStep(from, to) {
    Step.call(this)
    this.from = from
    this.to = to
  }

  if ( Step ) RemoveColumnStep.__proto__ = Step;
  RemoveColumnStep.prototype = Object.create( Step && Step.prototype );
  RemoveColumnStep.prototype.constructor = RemoveColumnStep;

  // :: (Node, number, number) → RemoveColumnStep
  // Create a step that deletes the column at `columnIndex` in the
  // table after `tablePos`.
  RemoveColumnStep.create = function create (doc, tablePos, columnIndex) {
    var from = [], to = []
    var table = doc.nodeAt(tablePos)
    table.forEach(function (row, rowOff) {
      var cellPos = tablePos + 2 + rowOff
      for (var i = 0; i < columnIndex; i++) { cellPos += row.child(i).nodeSize }
      from.push(cellPos)
      to.push(cellPos + row.child(columnIndex).nodeSize)
    })
    return new RemoveColumnStep(from, to)
  };

  RemoveColumnStep.prototype.apply = function apply (doc) {
    var this$1 = this;

    var index = null, table = null, tablePos = null
    for (var i = 0; i < this.from.length; i++) {
      var $from = doc.resolve(this$1.from[i]), after = $from.nodeAfter
      if ($from.depth < 2 || $from.index(-1) != i || !after || this$1.from[i] + after.nodeSize != this$1.to[i])
        { return StepResult.fail("Invalid cell delete positions") }
      if (table == null) {
        table = $from.node(-1)
        if (table.childCount != this$1.from.length)
          { return StepResult.fail("Mismatch in number of rows") }
        tablePos = $from.before(-1)
        index = $from.index()
      } else if ($from.before(-1) != tablePos || $from.index() != index) {
        return StepResult.fail("Column delete positions not consistent")
      }
    }

    var updatedRows = []
    for (var i$1 = 0; i$1 < table.childCount; i$1++) {
      var row = table.child(i$1), rowCells = []
      for (var j = 0; j < row.childCount; j++)
        { if (j != index) { rowCells.push(row.child(j)) } }
      updatedRows.push(row.type.create(adjustColumns(row.attrs, -1), Fragment.from(rowCells)))
    }
    var updatedTable = table.type.create(adjustColumns(table.attrs, -1),  Fragment.from(updatedRows))
    return StepResult.fromReplace(doc, tablePos, tablePos + table.nodeSize,
                                  new Slice(Fragment.from(updatedTable), 0, 0))
  };

  RemoveColumnStep.prototype.getMap = function getMap () {
    var this$1 = this;

    var ranges = []
    for (var i = 0; i < this.from.length; i++)
      { ranges.push(this$1.from[i], this$1.to[i] - this$1.from[i], 0) }
    return new StepMap(ranges)
  };

  RemoveColumnStep.prototype.invert = function invert (doc) {
    var this$1 = this;

    var $first = doc.resolve(this.from[0])
    var table = $first.node(-1), index = $first.index()
    var positions = [], cells = [], dPos = 0
    for (var i = 0; i < table.childCount; i++) {
      positions.push(this$1.from[i] - dPos)
      var cell = table.child(i).child(index)
      dPos += cell.nodeSize
      cells.push(cell)
    }
    return new AddColumnStep(positions, cells)
  };

  RemoveColumnStep.prototype.map = function map (mapping) {
    var this$1 = this;

    var from = [], to = []
    for (var i = 0; i < this.from.length; i++) {
      var start = mapping.map(this$1.from[i], 1), end = mapping.map(this$1.to[i], -1)
      if (end <= start) { return null }
      from.push(start)
      to.push(end)
    }
    return new RemoveColumnStep(from, to)
  };

  RemoveColumnStep.fromJSON = function fromJSON (_schema, json) {
    return new RemoveColumnStep(json.from, json.to)
  };

  return RemoveColumnStep;
}(Step));
exports.RemoveColumnStep = RemoveColumnStep

Step.jsonID("removeTableColumn", RemoveColumnStep)

// Table-related command functions

function findRow($pos, pred) {
  for (var d = $pos.depth; d > 0; d--)
    { if ($pos.node(d).type.spec.tableRow && (!pred || pred(d))) { return d } }
  return -1
}

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Command function that adds a column before the column with the
// selection.
function addColumnBefore(state, dispatch) {
  var $from = state.selection.$from, cellFrom
  var rowDepth = findRow($from, function (d) { return cellFrom = d == $from.depth ? $from.nodeBefore : $from.node(d + 1); })
  if (rowDepth == -1) { return false }
  if (dispatch)
    { dispatch(state.tr.step(AddColumnStep.create(state.doc, $from.before(rowDepth - 1), $from.index(rowDepth),
                                                cellFrom.type, cellFrom.attrs))) }
  return true
}
exports.addColumnBefore = addColumnBefore

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Command function that adds a column after the column with the
// selection.
function addColumnAfter(state, dispatch) {
  var $from = state.selection.$from, cellFrom
  var rowDepth = findRow($from, function (d) { return cellFrom = d == $from.depth ? $from.nodeAfter : $from.node(d + 1); })
  if (rowDepth == -1) { return false }
  if (dispatch)
    { dispatch(state.tr.step(AddColumnStep.create(state.doc, $from.before(rowDepth - 1),
                                                $from.indexAfter(rowDepth) + (rowDepth == $from.depth ? 1 : 0),
                                                cellFrom.type, cellFrom.attrs))) }
  return true
}
exports.addColumnAfter = addColumnAfter

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Command function that removes the column with the selection.
function removeColumn(state, dispatch) {
  var $from = state.selection.$from
  var rowDepth = findRow($from, function (d) { return $from.node(d).childCount > 1; })
  if (rowDepth == -1) { return false }
  if (dispatch)
    { dispatch(state.tr.step(RemoveColumnStep.create(state.doc, $from.before(rowDepth - 1), $from.index(rowDepth)))) }
  return true
}
exports.removeColumn = removeColumn

function addRow(state, dispatch, side) {
  var $from = state.selection.$from
  var rowDepth = findRow($from)
  if (rowDepth == -1) { return false }
  if (dispatch) {
    var exampleRow = $from.node(rowDepth)
    var cells = [], pos = side < 0 ? $from.before(rowDepth) : $from.after(rowDepth)
    exampleRow.forEach(function (cell) { return cells.push(cell.type.createAndFill(cell.attrs)); })
    var row = exampleRow.copy(Fragment.from(cells))
    dispatch(state.tr.step(new ReplaceStep(pos, pos, new Slice(Fragment.from(row), 0, 0))))
  }
  return true
}

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Command function that adds a row after the row with the
// selection.
function addRowBefore(state, dispatch) {
  return addRow(state, dispatch, -1)
}
exports.addRowBefore = addRowBefore

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Command function that adds a row before the row with the
// selection.
function addRowAfter(state, dispatch) {
  return addRow(state, dispatch, 1)
}
exports.addRowAfter = addRowAfter

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Command function that removes the row with the selection.
function removeRow(state, dispatch) {
  var $from = state.selection.$from
  var rowDepth = findRow($from, function (d) { return $from.node(d - 1).childCount > 1; })
  if (rowDepth == -1) { return false }
  if (dispatch)
    { dispatch(state.tr.step(new ReplaceStep($from.before(rowDepth), $from.after(rowDepth), Slice.empty))) }
  return true
}
exports.removeRow = removeRow

function moveCell(state, dir, dispatch) {
  var ref = state.selection;
  var $from = ref.$from;
  var rowDepth = findRow($from)
  if (rowDepth == -1) { return false }
  var row = $from.node(rowDepth), newIndex = $from.index(rowDepth) + dir
  if (newIndex >= 0 && newIndex < row.childCount) {
    var $cellStart = state.doc.resolve(row.content.offsetAt(newIndex) + $from.start(rowDepth))
    var sel = Selection.findFrom($cellStart, 1)
    if (!sel || sel.from >= $cellStart.end()) { return false }
    if (dispatch) { dispatch(state.tr.setSelection(sel).scrollIntoView()) }
    return true
  } else {
    var rowIndex = $from.index(rowDepth - 1) + dir, table = $from.node(rowDepth - 1)
    if (rowIndex < 0 || rowIndex >= table.childCount) { return false }
    var cellStart = dir > 0 ? $from.after(rowDepth) + 2 : $from.before(rowDepth) - 2 - table.child(rowIndex).lastChild.content.size
    var $cellStart$1 = state.doc.resolve(cellStart), sel$1 = Selection.findFrom($cellStart$1, 1)
    if (!sel$1 || sel$1.from >= $cellStart$1.end()) { return false }
    if (dispatch) { dispatch(state.tr.setSelection(sel$1).scrollIntoView()) }
    return true
  }
}

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Move to the next cell in the current table, if there is one.
function selectNextCell(state, dispatch) { return moveCell(state, 1, dispatch) }
exports.selectNextCell = selectNextCell

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Move to the previous cell in the current table, if there is one.
function selectPreviousCell(state, dispatch) { return moveCell(state, -1, dispatch) }
exports.selectPreviousCell = selectPreviousCell

},{"prosemirror-model":24,"prosemirror-state":34,"prosemirror-transform":39}],34:[function(require,module,exports){
;var assign;
((assign = require("./selection"), exports.Selection = assign.Selection, exports.TextSelection = assign.TextSelection, exports.NodeSelection = assign.NodeSelection))

exports.Transaction = require("./transaction").Transaction

exports.EditorState = require("./state").EditorState

;var assign$1;
((assign$1 = require("./plugin"), exports.Plugin = assign$1.Plugin, exports.PluginKey = assign$1.PluginKey))

},{"./plugin":35,"./selection":36,"./state":37,"./transaction":38}],35:[function(require,module,exports){
// ::- Plugins wrap extra functionality that can be added to an
// editor. They can define new [state fields](#state.StateField), and
// add [view props](#view.EditorProps).
var Plugin = function Plugin(options) {
  var this$1 = this;

  // :: EditorProps
  // The props exported by this plugin.
  this.props = {}
  if (options.props) { for (var prop in options.props) {
    var val = options.props[prop]
    if (val instanceof Function) { val = val.bind(this$1) }
    this$1.props[prop] = val
  } }
  // :: Object
  // The plugin's configuration object.
  this.options = options
  this.key = options.key ? options.key.key : createKey("plugin")
};

// :: (EditorState) → any
// Get the state field for this plugin.
Plugin.prototype.getState = function getState (state) { return state[this.key] };
exports.Plugin = Plugin

// StateField:: interface<T>
// A plugin may provide a state field (under its `state` property) of
// this type, which describes the state it wants to keep. Functions
// provided here are always called with the plugin instance as their
// `this` binding.
//
//   init:: (config: Object, instance: EditorState) → T
//   Initialize the value of this field. `config` will be the object
//   passed to [`EditorState.create`](#state.EditorState^create). Note
//   that `instance` is a half-initialized state instance, and will
//   not have values for any fields initialzed after this one.
//
//   apply:: (tr: Transaction, value: T, oldState: EditorState, newState: EditorState) → T
//   Apply the given transaction to this state field, producing a new
//   field value. Note that the `newState` argument is a partially
//   constructed state does not yet contain the state from plugins
//   coming after this plugin.
//
//   toJSON:: ?(value: T) → *
//   Convert this field to JSON. Optional, can be left off to disable
//   JSON serialization for the field.
//
//   fromJSON:: ?(config: Object, value: *, state: EditorState) → T
//   Deserialize the JSON representation of this field. Note that the
//   `state` argument is again a half-initialized state.

var keys = Object.create(null)

function createKey(name) {
  if (name in keys) { return name + "$" + ++keys[name] }
  keys[name] = 0
  return name + "$"
}

// ::- A key is used to [tag](#state.Plugin.constructor^options.key)
// plugins in a way that makes it possible to find them, given an
// editor state. Assigning a key does mean only one plugin of that
// type can be active in a state.
var PluginKey = function PluginKey(name) {
if ( name === void 0 ) name = "key";
 this.key = createKey(name) };

// :: (EditorState) → ?Plugin
// Get the active plugin with this key, if any, from an editor
// state.
PluginKey.prototype.get = function get (state) { return state.config.pluginsByKey[this.key] };

// :: (EditorState) → ?any
// Get the plugin's state from an editor state.
PluginKey.prototype.getState = function getState (state) { return state[this.key] };
exports.PluginKey = PluginKey

},{}],36:[function(require,module,exports){
// ::- Superclass for editor selections.
var Selection = function Selection($from, $to) {
  // :: ResolvedPos
  // The resolved lower bound of the selection
  this.$from = $from
  // :: ResolvedPos
  // The resolved upper bound of the selection
  this.$to = $to
};

var prototypeAccessors = { from: {},to: {},empty: {} };

// :: bool
// True if the selection is an empty text selection (head an anchor
// are the same).
prototypeAccessors.from.get = function () { return this.$from.pos };

// :: number
// The upper bound of the selection.
prototypeAccessors.to.get = function () { return this.$to.pos };

prototypeAccessors.empty.get = function () {
  return this.from == this.to
};

// eq:: (other: Selection) → bool
// Test whether the selection is the same as another selection.

// map:: (doc: Node, mapping: Mappable) → Selection
// Map this selection through a [mappable](#transform.Mappable) thing. `doc`
// should be the new document, to which we are mapping.

// toJSON:: () → Object
// Convert the selection to a JSON representation.

// :: (ResolvedPos, number, ?bool) → ?Selection
// Find a valid cursor or leaf node selection starting at the given
// position and searching back if `dir` is negative, and forward if
// negative. When `textOnly` is true, only consider cursor
// selections.
Selection.findFrom = function findFrom ($pos, dir, textOnly) {
  var inner = $pos.parent.isTextblock ? new TextSelection($pos)
      : findSelectionIn($pos.node(0), $pos.parent, $pos.pos, $pos.index(), dir, textOnly)
  if (inner) { return inner }

  for (var depth = $pos.depth - 1; depth >= 0; depth--) {
    var found = dir < 0
        ? findSelectionIn($pos.node(0), $pos.node(depth), $pos.before(depth + 1), $pos.index(depth), dir, textOnly)
        : findSelectionIn($pos.node(0), $pos.node(depth), $pos.after(depth + 1), $pos.index(depth) + 1, dir, textOnly)
    if (found) { return found }
  }
};

// :: (ResolvedPos, ?number, ?bool) → Selection
// Find a valid cursor or leaf node selection near the given
// position. Searches forward first by default, but if `bias` is
// negative, it will search backwards first.
Selection.near = function near ($pos, bias) {
    if ( bias === void 0 ) bias = 1;

  var result = this.findFrom($pos, bias) || this.findFrom($pos, -bias)
  if (!result) { throw new RangeError("Searching for selection in invalid document " + $pos.node(0)) }
  return result
};

// :: (Node, ?bool) → ?Selection
// Find the cursor or leaf node selection closest to the start of
// the given document. When `textOnly` is true, only consider cursor
// selections.
Selection.atStart = function atStart (doc, textOnly) {
  return findSelectionIn(doc, doc, 0, 0, 1, textOnly)
};

// :: (Node, ?bool) → ?Selection
// Find the cursor or leaf node selection closest to the end of
// the given document. When `textOnly` is true, only consider cursor
// selections.
Selection.atEnd = function atEnd (doc, textOnly) {
  return findSelectionIn(doc, doc, doc.content.size, doc.childCount, -1, textOnly)
};

// :: (ResolvedPos, ResolvedPos, ?number) → Selection
// Find a selection that spans the given positions, if both are text
// positions. If not, return some other selection nearby, where
// `bias` determines whether the method searches forward (default)
// or backwards (negative number) first.
Selection.between = function between ($anchor, $head, bias) {
  var found = Selection.near($head, bias)
  if (found instanceof TextSelection) {
    var nearAnchor = Selection.findFrom($anchor, $anchor.pos > found.to ? -1 : 1, true)
    found = new TextSelection(nearAnchor.$anchor, found.$head)
  } else if ($anchor.pos < found.from || $anchor.pos > found.to) {
    // If head falls on a node, but anchor falls outside of it, create
    // a text selection between them
    var inv = $anchor.pos > found.to
    var foundAnchor = Selection.findFrom($anchor, inv ? -1 : 1, true)
    var foundHead = Selection.findFrom(inv ? found.$from : found.$to, inv ? 1 : -1, true)
    if (foundAnchor && foundHead)
      { found = new TextSelection(foundAnchor.$anchor, foundHead.$head) }
  }
  return found
};

Selection.mapJSON = function mapJSON (json, mapping) {
  if (json.anchor != null)
    { return {head: mapping.map(json.head), anchor: mapping.map(json.anchor)} }
  else
    { return {node: mapping.map(json.node), after: mapping.map(json.after, -1)} }
};

// :: (Node, Object) → Selection
// Deserialize a JSON representation of a selection.
Selection.fromJSON = function fromJSON (doc, json) {
  // This is cautious, because the history will blindly map
  // selections and then try to deserialize them, and the endpoints
  // might not point at appropriate positions anymore (though they
  // are guaranteed to be inside of the document's range).
  if (json.head != null) {
    var $anchor = doc.resolve(json.anchor), $head = doc.resolve(json.head)
    if ($anchor.parent.isTextblock && $head.parent.isTextblock) { return new TextSelection($anchor, $head) }
    else { return Selection.between($anchor, $head) }
  } else {
    var $pos = doc.resolve(json.node), after = $pos.nodeAfter
    if (after && json.after == json.pos + after.nodeSize && NodeSelection.isSelectable(after)) { return new NodeSelection($pos) }
    else { return Selection.near($pos) }
  }
};

Object.defineProperties( Selection.prototype, prototypeAccessors );
exports.Selection = Selection

// ::- A text selection represents a classical editor
// selection, with a head (the moving side) and anchor (immobile
// side), both of which point into textblock nodes. It can be empty (a
// regular cursor position).
var TextSelection = (function (Selection) {
  function TextSelection($anchor, $head) {
    if ( $head === void 0 ) $head = $anchor;

    var inv = $anchor.pos > $head.pos
    Selection.call(this, inv ? $head : $anchor, inv ? $anchor : $head)
    // :: ResolvedPos The resolved anchor of the selection.
    this.$anchor = $anchor
    // :: ResolvedPos The resolved head of the selection.
    this.$head = $head
  }

  if ( Selection ) TextSelection.__proto__ = Selection;
  TextSelection.prototype = Object.create( Selection && Selection.prototype );
  TextSelection.prototype.constructor = TextSelection;

  var prototypeAccessors$1 = { anchor: {},head: {},inverted: {} };

  prototypeAccessors$1.anchor.get = function () { return this.$anchor.pos };
  // :: number
  // The selection's mobile side (the side that moves when pressing
  // shift-arrow).
  prototypeAccessors$1.head.get = function () { return this.$head.pos };

  prototypeAccessors$1.inverted.get = function () { return this.anchor > this.head };

  TextSelection.prototype.eq = function eq (other) {
    return other instanceof TextSelection && other.head == this.head && other.anchor == this.anchor
  };

  TextSelection.prototype.map = function map (doc, mapping) {
    var $head = doc.resolve(mapping.map(this.head))
    if (!$head.parent.isTextblock) { return Selection.near($head) }
    var $anchor = doc.resolve(mapping.map(this.anchor))
    return new TextSelection($anchor.parent.isTextblock ? $anchor : $head, $head)
  };

  TextSelection.prototype.toJSON = function toJSON () {
    return {head: this.head, anchor: this.anchor}
  };

  // :: (Node, number, ?number) → TextSelection
  // Create a text selection from non-resolved positions.
  TextSelection.create = function create (doc, anchor, head) {
    if ( head === void 0 ) head = anchor;

    var $anchor = doc.resolve(anchor)
    return new this($anchor, head == anchor ? $anchor : doc.resolve(head))
  };

  Object.defineProperties( TextSelection.prototype, prototypeAccessors$1 );

  return TextSelection;
}(Selection));
exports.TextSelection = TextSelection

// ::- A node selection is a selection that points at a
// single node. All nodes marked [selectable](#model.NodeSpec.selectable)
// can be the target of a node selection. In such an object, `from`
// and `to` point directly before and after the selected node.
var NodeSelection = (function (Selection) {
  function NodeSelection($from) {
    var $to = $from.node(0).resolve($from.pos + $from.nodeAfter.nodeSize)
    Selection.call(this, $from, $to)
    // :: Node The selected node.
    this.node = $from.nodeAfter
  }

  if ( Selection ) NodeSelection.__proto__ = Selection;
  NodeSelection.prototype = Object.create( Selection && Selection.prototype );
  NodeSelection.prototype.constructor = NodeSelection;

  NodeSelection.prototype.eq = function eq (other) {
    return other instanceof NodeSelection && this.from == other.from
  };

  NodeSelection.prototype.map = function map (doc, mapping) {
    var from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1)
    var $from = doc.resolve(from.pos), node = $from.nodeAfter
    if (!from.deleted && !to.deleted && node && to.pos == from.pos + node.nodeSize && NodeSelection.isSelectable(node))
      { return new NodeSelection($from) }
    return Selection.near($from)
  };

  NodeSelection.prototype.toJSON = function toJSON () {
    return {node: this.from, after: this.to}
  };

  // :: (Node, number, ?number) → TextSelection
  // Create a node selection from non-resolved positions.
  NodeSelection.create = function create (doc, from) {
    return new this(doc.resolve(from))
  };

  // :: (Node) → bool
  // Determines whether the given node may be selected as a node
  // selection.
  NodeSelection.isSelectable = function isSelectable (node) {
    return !node.isText && node.type.spec.selectable !== false
  };

  return NodeSelection;
}(Selection));
exports.NodeSelection = NodeSelection

// FIXME we'll need some awareness of text direction when scanning for selections

// Try to find a selection inside the given node. `pos` points at the
// position where the search starts. When `text` is true, only return
// text selections.
function findSelectionIn(doc, node, pos, index, dir, text) {
  if (node.isTextblock) { return TextSelection.create(doc, pos) }
  for (var i = index - (dir > 0 ? 0 : 1); dir > 0 ? i < node.childCount : i >= 0; i += dir) {
    var child = node.child(i)
    if (!child.isLeaf) {
      var inner = findSelectionIn(doc, child, pos + dir, dir < 0 ? child.childCount : 0, dir, text)
      if (inner) { return inner }
    } else if (!text && NodeSelection.isSelectable(child)) {
      return NodeSelection.create(doc, pos - (dir < 0 ? child.nodeSize : 0))
    }
    pos += child.nodeSize * dir
  }
}

},{}],37:[function(require,module,exports){
var ref = require("prosemirror-model");
var Node = ref.Node;

var ref$1 = require("./selection");
var Selection = ref$1.Selection;
var ref$2 = require("./transaction");
var Transaction = ref$2.Transaction;

function bind(f, self) {
  return !self || !f ? f : f.bind(self)
}

var FieldDesc = function FieldDesc(name, desc, self) {
  this.name = name
  this.init = bind(desc.init, self)
  this.apply = bind(desc.apply, self)
};

var baseFields = [
  new FieldDesc("doc", {
    init: function init(config) { return config.doc || config.schema.nodes.doc.createAndFill() },
    apply: function apply(tr) { return tr.doc }
  }),

  new FieldDesc("selection", {
    init: function init(config, instance) { return config.selection || Selection.atStart(instance.doc) },
    apply: function apply(tr) { return tr.selection }
  }),

  new FieldDesc("storedMarks", {
    init: function init() { return null },
    apply: function apply(tr, _marks, _old, state) { return state.selection.empty ? tr.storedMarks : null }
  }),

  new FieldDesc("scrollToSelection", {
    init: function init() { return 0 },
    apply: function apply(tr, prev) { return tr.scrolledIntoView ? prev + 1 : prev }
  })
]

// Object wrapping the part of a state object that stays the same
// across transactions. Stored in the state's `config` property.
var Configuration = function Configuration(schema, plugins) {
  var this$1 = this;

  this.schema = schema
  this.fields = baseFields.concat()
  this.plugins = []
  this.pluginsByKey = Object.create(null)
  if (plugins) { plugins.forEach(function (plugin) {
    if (this$1.pluginsByKey[plugin.key])
      { throw new RangeError("Adding different instances of a keyed plugin (" + plugin.key + ")") }
    this$1.plugins.push(plugin)
    this$1.pluginsByKey[plugin.key] = plugin
    if (plugin.options.state)
      { this$1.fields.push(new FieldDesc(plugin.key, plugin.options.state, plugin)) }
  }) }
};

// ::- The state of a ProseMirror editor is represented by an object
// of this type. This is a persistent data structure—it isn't updated,
// but rather a new state value is computed from an old one with the
// [`apply`](#state.EditorState.apply) method.
//
// In addition to the built-in state fields, plugins can define
// additional pieces of state.
var EditorState = function EditorState(config) {
  this.config = config
};

var prototypeAccessors = { schema: {},plugins: {},tr: {} };

// doc:: Node
// The current document.

// selection:: Selection
// The selection.

// storedMarks:: ?[Mark]
// A set of marks to apply to the next character that's typed. Will
// be null whenever no explicit marks have been set.

// :: Schema
// The schema of the state's document.
prototypeAccessors.schema.get = function () {
  return this.config.schema
};

// :: [Plugin]
// The plugins that are active in this state.
prototypeAccessors.plugins.get = function () {
  return this.config.plugins
};

// :: (Transaction) → EditorState
// Apply the given transaction to produce a new state.
EditorState.prototype.apply = function apply (tr) {
  return this.applyTransaction(tr).state
};

// : (Transaction) → ?Transaction
EditorState.prototype.filterTransaction = function filterTransaction (tr, ignore) {
    var this$1 = this;
    if ( ignore === void 0 ) ignore = -1;

  for (var i = 0; i < this.config.plugins.length; i++) { if (i != ignore) {
    var plugin = this$1.config.plugins[i]
    if (plugin.options.filterTransaction && !plugin.options.filterTransaction.call(plugin, tr, this$1))
      { return false }
  } }
  return true
};

// :: (Transaction) → {state: EditorState, transactions: [Transaction]}
// Verbose variant of [`apply`](##state.EditorState.apply) that
// returns the precise transactions that were applied (which might
// be influenced by the [transaction
// hooks](##state.Plugin.constructor^options.filterTransaction) of
// plugins) along with the new state.
EditorState.prototype.applyTransaction = function applyTransaction (tr) {
    var this$1 = this;

  if (!this.filterTransaction(tr)) { return {state: this, transactions: []} }

  var trs = [tr], newState = this.applyInner(tr), seen = null
  // This loop repeatedly gives plugins a chance to respond to
  // transactions as new transactions are added, making sure to only
  // pass the transactions the plugin did not see before.
  outer: for (;;) {
    var haveNew = false
    for (var i = 0; i < this.config.plugins.length; i++) {
      var plugin = this$1.config.plugins[i]
      if (plugin.options.appendTransaction) {
        var n = seen ? seen[i].n : 0, oldState = seen ? seen[i].state : this$1
        var tr$1 = n < trs.length &&
            plugin.options.appendTransaction.call(plugin, n ? trs.slice(n) : trs, oldState, newState)
        if (tr$1 && newState.filterTransaction(tr$1, i)) {
          if (!seen) {
            seen = []
            for (var j = 0; j < this.config.plugins.length; j++)
              { seen.push(j < i ? {state: newState, n: trs.length} : {state: this$1, n: 0}) }
          }
          trs.push(tr$1)
          newState = newState.applyInner(tr$1)
          haveNew = true
        }
        if (seen) { seen[i] = {state: newState, n: trs.length} }
      }
    }
    if (!haveNew) { return {state: newState, transactions: trs} }
  }
};

// : (Transaction) → EditorState
EditorState.prototype.applyInner = function applyInner (tr) {
    var this$1 = this;

  if (!tr.before.eq(this.doc)) { throw new RangeError("Applying a mismatched transaction") }
  var newInstance = new EditorState(this.config), fields = this.config.fields
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i]
    newInstance[field.name] = field.apply(tr, this$1[field.name], this$1, newInstance)
  }
  for (var i$1 = 0; i$1 < applyListeners.length; i$1++) { applyListeners[i$1](this$1, tr, newInstance) }
  return newInstance
};

// :: Transaction
// Start a [transaction](#state.Transaction) from this state.
prototypeAccessors.tr.get = function () { return new Transaction(this) };

// :: (Object) → EditorState
// Create a state. `config` must be an object containing at least a
// `schema` (the schema to use) or `doc` (the starting document)
// property. When it has a `selection` property, that should be a
// valid [selection](#state.Selection) in the given document, to use
// as starting selection. Plugins, which are specified as an array
// in the `plugins` property, may read additional fields from the
// config object.
EditorState.create = function create (config) {
  var $config = new Configuration(config.schema || config.doc.type.schema, config.plugins)
  var instance = new EditorState($config)
  for (var i = 0; i < $config.fields.length; i++)
    { instance[$config.fields[i].name] = $config.fields[i].init(config, instance) }
  return instance
};

// :: (Object) → EditorState
// Create a new state based on this one, but with an adjusted set of
// active plugins. State fields that exist in both sets of plugins
// are kept unchanged. Those that no longer exist are dropped, and
// those that are new are initialized using their
// [`init`](#state.StateField.init) method, passing in the new
// configuration object..
EditorState.prototype.reconfigure = function reconfigure (config) {
    var this$1 = this;

  var $config = new Configuration(config.schema || this.schema, config.plugins)
  var fields = $config.fields, instance = new EditorState($config)
  for (var i = 0; i < fields.length; i++) {
    var name = fields[i].name
    instance[name] = this$1.hasOwnProperty(name) ? this$1[name] : fields[i].init(config, instance)
  }
  return instance
};

// :: (?Object<Plugin>) → Object
// Serialize this state to JSON. If you want to serialize the state
// of plugins, pass an object mapping property names to use in the
// resulting JSON object to plugin objects.
EditorState.prototype.toJSON = function toJSON (pluginFields) {
    var this$1 = this;

  var result = {doc: this.doc.toJSON(), selection: this.selection.toJSON()}
  if (pluginFields) { for (var prop in pluginFields) {
    if (prop == "doc" || prop == "selection")
      { throw new RangeError("The JSON fields `doc` and `selection` are reserved") }
    var plugin = pluginFields[prop], state = plugin.options.state
    if (state && state.toJSON) { result[prop] = state.toJSON.call(plugin, this$1[plugin.key]) }
  } }
  return result
};

// :: (Object, Object, ?Object<Plugin>) → EditorState
// Deserialize a JSON representation of a state. `config` should
// have at least a `schema` field, and should contain array of
// plugins to initialize the state with. `pluginFields` can be used
// to deserialize the state of plugins, by associating plugin
// instances with the property names they use in the JSON object.
EditorState.fromJSON = function fromJSON (config, json, pluginFields) {
  if (!config.schema) { throw new RangeError("Required config field 'schema' missing") }
  var $config = new Configuration(config.schema, config.plugins)
  var instance = new EditorState($config)
  $config.fields.forEach(function (field) {
    if (field.name == "doc") {
      instance.doc = Node.fromJSON(config.schema, json.doc)
    } else if (field.name == "selection") {
      instance.selection = Selection.fromJSON(instance.doc, json.selection)
    } else {
      if (pluginFields) { for (var prop in pluginFields) {
        var plugin = pluginFields[prop], state = plugin.options.state
        if (plugin.key == field.name && state && state.fromJSON &&
            Object.prototype.hasOwnProperty.call(json, prop)) {
          // This field belongs to a plugin mapped to a JSON field, read it from there.
          instance[field.name] = state.fromJSON.call(plugin, config, json[prop], instance)
          return
        }
      } }
      instance[field.name] = field.init(config, instance)
    }
  })
  return instance
};

// Kludge to allow the view to track mappings between different
// instances of a state.
EditorState.addApplyListener = function addApplyListener (f) {
  applyListeners.push(f)
};
EditorState.removeApplyListener = function removeApplyListener (f) {
  var found = applyListeners.indexOf(f)
  if (found > -1) { applyListeners.splice(found, 1) }
};

Object.defineProperties( EditorState.prototype, prototypeAccessors );
exports.EditorState = EditorState

var applyListeners = []

},{"./selection":36,"./transaction":38,"prosemirror-model":24}],38:[function(require,module,exports){
var ref = require("prosemirror-transform");
var Transform = ref.Transform;
var ref$1 = require("prosemirror-model");
var Mark = ref$1.Mark;
var ref$2 = require("./selection");
var Selection = ref$2.Selection;

var UPDATED_SEL = 1, UPDATED_MARKS = 2, UPDATED_SCROLL = 4

// ::- An editor state transaction, which can be applied to a state to
// create an updated state. Use
// [`EditorState.tr`](#state.EditorState.tr) to create an instance.
//
// Transactions track changes to the document (they are a subclass of
// [`Transform`](#transform.Transform)), but also other state changes,
// like selection updates and adjustments of the set of [stored
// marks](##state.EditorState.storedMarks). In addition, you can store
// metadata properties in a transaction, which are extra pieces of
// informations that client code or plugins can use to describe what a
// transacion represents, so that they can update their [own
// state](##state.StateField) accordingly.
//
// The [editor view](##view.EditorView) uses a single metadata
// property: it will attach a property `"pointer"` with the value
// `true` to selection transactions directly caused by mouse or touch
// input.
var Transaction = (function (Transform) {
  function Transaction(state) {
    Transform.call(this, state.doc)
    // :: number
    // The timestamp associated with this transaction.
    this.time = Date.now()
    this.curSelection = state.selection
    // The step count for which the current selection is valid.
    this.curSelectionFor = 0
    // :: ?[Mark]
    // The stored marks in this transaction.
    this.storedMarks = state.storedMarks
    // Bitfield to track which aspects of the state were updated by
    // this transaction.
    this.updated = 0
    // Object used to store metadata properties for the transaction.
    this.meta = Object.create(null)
  }

  if ( Transform ) Transaction.__proto__ = Transform;
  Transaction.prototype = Object.create( Transform && Transform.prototype );
  Transaction.prototype.constructor = Transaction;

  var prototypeAccessors = { docChanged: {},selection: {},selectionSet: {},storedMarksSet: {},isGeneric: {},scrolledIntoView: {} };

  // :: bool
  // True when this transaction changes the document.
  prototypeAccessors.docChanged.get = function () {
    return this.steps.length > 0
  };

  // :: Selection
  // The transform's current selection. This defaults to the
  // editor selection [mapped](#state.Selection.map) through the steps in
  // this transform, but can be overwritten with
  // [`setSelection`](#state.Transaction.setSelection).
  prototypeAccessors.selection.get = function () {
    if (this.curSelectionFor < this.steps.length) {
      this.curSelection = this.curSelection.map(this.doc, this.mapping.slice(this.curSelectionFor))
      this.curSelectionFor = this.steps.length
    }
    return this.curSelection
  };

  // :: (Selection) → Transaction
  // Update the transaction's current selection. This will determine
  // the selection that the editor gets when the transaction is
  // applied.
  Transaction.prototype.setSelection = function setSelection (selection) {
    this.curSelection = selection
    this.curSelectionFor = this.steps.length
    this.updated = (this.updated | UPDATED_SEL) & ~UPDATED_MARKS
    this.storedMarks = null
    return this
  };

  // :: bool
  // Whether the selection was explicitly updated by this transaction.
  prototypeAccessors.selectionSet.get = function () {
    return this.updated & UPDATED_SEL > 0
  };

  // :: (?[Mark]) → Transaction
  // Replace the set of stored marks.
  Transaction.prototype.setStoredMarks = function setStoredMarks (marks) {
    this.storedMarks = marks
    this.updated |= UPDATED_MARKS
    return this
  };

  // :: bool
  // Whether the stored marks were explicitly set for this transaction.
  prototypeAccessors.storedMarksSet.get = function () {
    return this.updated & UPDATED_MARKS > 0
  };

  Transaction.prototype.addStep = function addStep (step, doc) {
    Transform.prototype.addStep.call(this, step, doc)
    this.updated = this.updated & ~UPDATED_MARKS
    this.storedMarks = null
  };

  // :: (number) → Transaction
  // Update the timestamp for the transaction.
  Transaction.prototype.setTime = function setTime (time) {
    this.time = time
    return this
  };

  // :: (Slice) → Transaction
  Transaction.prototype.replaceSelection = function replaceSelection (slice) {
    var ref = this.selection;
    var from = ref.from;
    var to = ref.to;
    var startLen = this.steps.length
    this.replaceRange(from, to, slice)
    // Move the selection to the position after the inserted content.
    // When that ended in an inline node, search backwards, to get the
    // position after that node. If not, search forward.
    var lastNode = slice.content.lastChild, lastParent = null
    for (var i = 0; i < slice.openRight; i++) {
      lastParent = lastNode
      lastNode = lastNode.lastChild
    }
    selectionToInsertionEnd(this, startLen, (lastNode ? lastNode.isInline : lastParent && lastParent.isTextblock) ? -1 : 1)
    return this
  };

  // :: (Node, ?bool) → Transaction
  // Replace the selection with the given node or slice, or delete it
  // if `content` is null. When `inheritMarks` is true and the content
  // is inline, it inherits the marks from the place where it is
  // inserted.
  Transaction.prototype.replaceSelectionWith = function replaceSelectionWith (node, inheritMarks) {
    var ref = this.selection;
    var $from = ref.$from;
    var from = ref.from;
    var to = ref.to;
    var startLen = this.steps.length
    if (inheritMarks !== false)
      { node = node.mark(this.storedMarks || $from.marks(to > from)) }
    this.replaceRangeWith(from, to, node)
    selectionToInsertionEnd(this, startLen, node.isInline ? -1 : 1)
    return this
  };

  // :: () → Transaction
  // Delete the selection.
  Transaction.prototype.deleteSelection = function deleteSelection () {
    var ref = this.selection;
    var from = ref.from;
    var to = ref.to;
    return this.deleteRange(from, to)
  };

  // :: (string, from: ?number, to: ?number) → Transaction
  // Replace the given range, or the selection if no range is given,
  // with a text node containing the given string.
  Transaction.prototype.insertText = function insertText (text, from, to) {
    if ( to === void 0 ) to = from;

    var schema = this.doc.type.schema
    if (from == null) {
      if (!text) { return this.deleteSelection() }
      return this.replaceSelectionWith(schema.text(text), true)
    } else {
      if (!text) { return this.deleteRange(from, to) }
      var node = schema.text(text, this.storedMarks || this.doc.resolve(from).marks(to > from))
      return this.replaceRangeWith(from, to, node)
    }
  };

  // :: (union<string, Plugin, PluginKey>, any) → Transaction
  // Store a metadata property in this transaction, keyed either by
  // name or by plugin.
  Transaction.prototype.setMeta = function setMeta (key, value) {
    this.meta[typeof key == "string" ? key : key.key] = value
    return this
  };

  // :: (union<string, Plugin, PluginKey>) → any
  // Retrieve a metadata property for a given name or plugin.
  Transaction.prototype.getMeta = function getMeta (key) {
    return this.meta[typeof key == "string" ? key : key.key]
  };

  // :: bool
  // Returns true if this transaction doesn't contain any metadata,
  // and can thus be safely extended.
  prototypeAccessors.isGeneric.get = function () {
    var this$1 = this;

    for (var _ in this$1.meta) { return false }
    return true
  };

  // :: () → Transaction
  // Indicate that the editor should scroll the selection into view
  // when updated to the state produced by this transaction.
  Transaction.prototype.scrollIntoView = function scrollIntoView () {
    this.updated |= UPDATED_SCROLL
    return this
  };

  prototypeAccessors.scrolledIntoView.get = function () {
    return this.updated | UPDATED_SCROLL > 0
  };

  // :: (Mark) → Transaction
  // Add a mark to the set of stored marks.
  Transaction.prototype.addStoredMark = function addStoredMark (mark) {
    this.storedMarks = mark.addToSet(this.storedMarks || currentMarks(this.selection))
    return this
  };

  // :: (union<Mark, MarkType>) → Transaction
  // Remove a mark or mark type from the set of stored marks.
  Transaction.prototype.removeStoredMark = function removeStoredMark (mark) {
    this.storedMarks = mark.removeFromSet(this.storedMarks || currentMarks(this.selection))
    return this
  };

  Object.defineProperties( Transaction.prototype, prototypeAccessors );

  return Transaction;
}(Transform));
exports.Transaction = Transaction

function selectionToInsertionEnd(tr, startLen, bias) {
  if (tr.steps.length == startLen) { return }
  var map = tr.mapping.maps[tr.mapping.maps.length - 1], end
  map.forEach(function (_from, _to, _newFrom, newTo) { return end = newTo; })
  if (end != null) { tr.setSelection(Selection.near(tr.doc.resolve(end), bias)) }
}

function currentMarks(selection) {
  return selection.head == null ? Mark.none : selection.$head.marks()
}

},{"./selection":36,"prosemirror-model":24,"prosemirror-transform":39}],39:[function(require,module,exports){
;var assign;
((assign = require("./transform"), exports.Transform = assign.Transform, exports.TransformError = assign.TransformError))
;var assign$1;
((assign$1 = require("./step"), exports.Step = assign$1.Step, exports.StepResult = assign$1.StepResult))
;var assign$2;
((assign$2 = require("./structure"), exports.joinPoint = assign$2.joinPoint, exports.canJoin = assign$2.canJoin, exports.canSplit = assign$2.canSplit, exports.insertPoint = assign$2.insertPoint, exports.liftTarget = assign$2.liftTarget, exports.findWrapping = assign$2.findWrapping))
;var assign$3;
((assign$3 = require("./map"), exports.StepMap = assign$3.StepMap, exports.MapResult = assign$3.MapResult, exports.Mapping = assign$3.Mapping))
;var assign$4;
((assign$4 = require("./mark_step"), exports.AddMarkStep = assign$4.AddMarkStep, exports.RemoveMarkStep = assign$4.RemoveMarkStep))
;var assign$5;
((assign$5 = require("./replace_step"), exports.ReplaceStep = assign$5.ReplaceStep, exports.ReplaceAroundStep = assign$5.ReplaceAroundStep))
require("./mark")
;var assign$6;
((assign$6 = require("./replace"), exports.replaceStep = assign$6.replaceStep))

},{"./map":40,"./mark":41,"./mark_step":42,"./replace":43,"./replace_step":44,"./step":45,"./structure":46,"./transform":47}],40:[function(require,module,exports){
// Mappable:: interface
// There are several things that positions can be mapped through.
// We'll denote those as 'mappable'.
//
//   map:: (pos: number, assoc: ?number) → number
//   Map a position through this object. When given, `assoc` (should
//   be -1 or 1, defaults to 1) determines with which side the
//   position is associated, which determines in which direction to
//   move when a chunk of content is inserted at the mapped position,
//   and when to consider the position to be deleted.
//
//   mapResult:: (pos: number, assoc: ?number) → MapResult
//   Map a position, and return an object containing additional
//   information about the mapping. The result's `deleted` field tells
//   you whether the position was deleted (completely enclosed in a
//   replaced range) during the mapping.

// Recovery values encode a range index and an offset. They are
// represented as numbers, because tons of them will be created when
// mapping, for example, a large number of marked ranges. The number's
// lower 16 bits provide the index, the remaining bits the offset.
//
// Note: We intentionally don't use bit shift operators to en- and
// decode these, since those clip to 32 bits, which we might in rare
// cases want to overflow. A 64-bit float can represent 48-bit
// integers precisely.

var lower16 = 0xffff
var factor16 = Math.pow(2, 16)

function makeRecover(index, offset) { return index + offset * factor16 }
function recoverIndex(value) { return value & lower16 }
function recoverOffset(value) { return (value - (value & lower16)) / factor16 }

// ::- An object representing a mapped position with extra
// information.
var MapResult = function MapResult(pos, deleted, recover) {
  if ( deleted === void 0 ) deleted = false;
  if ( recover === void 0 ) recover = null;

  // :: number The mapped version of the position.
  this.pos = pos
  // :: bool Tells you whether the position was deleted, that is,
  // whether the step removed its surroundings from the document.
  this.deleted = deleted
  this.recover = recover
};
exports.MapResult = MapResult

// ::- A map describing the deletions and insertions made by a step,
// which can be used to find the correspondence between positions in
// the pre-step version of a document and the same position in the
// post-step version. This class implements [`Mappable`](#transform.Mappable).
var StepMap = function StepMap(ranges, inverted) {
  if ( inverted === void 0 ) inverted = false;

  this.ranges = ranges
  this.inverted = inverted
};

StepMap.prototype.recover = function recover (value) {
    var this$1 = this;

  var diff = 0, index = recoverIndex(value)
  if (!this.inverted) { for (var i = 0; i < index; i++)
    { diff += this$1.ranges[i * 3 + 2] - this$1.ranges[i * 3 + 1] } }
  return this.ranges[index * 3] + diff + recoverOffset(value)
};

// :: (number, ?number) → MapResult
// Map the given position through this map. The `assoc` parameter can
// be used to control what happens when the transform inserted
// content at (or around) this position—if `assoc` is negative, the a
// position before the inserted content will be returned, if it is
// positive, a position after the insertion is returned.
StepMap.prototype.mapResult = function mapResult (pos, assoc) { return this._map(pos, assoc, false) };

// :: (number, ?number) → number
// Map the given position through this map, returning only the
// mapped position.
StepMap.prototype.map = function map (pos, assoc) { return this._map(pos, assoc, true) };

StepMap.prototype._map = function _map (pos, assoc, simple) {
    var this$1 = this;

  var diff = 0, oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2
  for (var i = 0; i < this.ranges.length; i += 3) {
    var start = this$1.ranges[i] - (this$1.inverted ? diff : 0)
    if (start > pos) { break }
    var oldSize = this$1.ranges[i + oldIndex], newSize = this$1.ranges[i + newIndex], end = start + oldSize
    if (pos <= end) {
      var side = !oldSize ? assoc : pos == start ? -1 : pos == end ? 1 : assoc
      var result = start + diff + (side < 0 ? 0 : newSize)
      if (simple) { return result }
      var recover = makeRecover(i / 3, pos - start)
      return new MapResult(result, assoc < 0 ? pos != start : pos != end, recover)
    }
    diff += newSize - oldSize
  }
  return simple ? pos + diff : new MapResult(pos + diff)
};

StepMap.prototype.touches = function touches (pos, recover) {
    var this$1 = this;

  var diff = 0, index = recoverIndex(recover)
  var oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2
  for (var i = 0; i < this.ranges.length; i += 3) {
    var start = this$1.ranges[i] - (this$1.inverted ? diff : 0)
    if (start > pos) { break }
    var oldSize = this$1.ranges[i + oldIndex], end = start + oldSize
    if (pos <= end && i == index * 3) { return true }
    diff += this$1.ranges[i + newIndex] - oldSize
  }
  return false
};

// :: ((oldStart: number, oldEnd: number, newStart: number, newEnd: number))
// Calls the given function on each of the changed ranges denoted by
// this map.
StepMap.prototype.forEach = function forEach (f) {
    var this$1 = this;

  var oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2
  for (var i = 0, diff = 0; i < this.ranges.length; i += 3) {
    var start = this$1.ranges[i], oldStart = start - (this$1.inverted ? diff : 0), newStart = start + (this$1.inverted ? 0 : diff)
    var oldSize = this$1.ranges[i + oldIndex], newSize = this$1.ranges[i + newIndex]
    f(oldStart, oldStart + oldSize, newStart, newStart + newSize)
    diff += newSize - oldSize
  }
};

// :: () → StepMap
// Create an inverted version of this map. The result can be used to
// map positions in the post-step document to the pre-step document.
StepMap.prototype.invert = function invert () {
  return new StepMap(this.ranges, !this.inverted)
};

StepMap.prototype.toString = function toString () {
  return (this.inverted ? "-" : "") + JSON.stringify(this.ranges)
};
exports.StepMap = StepMap

StepMap.empty = new StepMap([])

// ::- A mapping represents a pipeline of zero or more [step
// maps](#transform.StepMap). It has special provisions for losslessly
// handling mapping positions through a series of steps in which some
// steps are inverted versions of earlier steps. (This comes up when
// ‘rebasing’ steps for collaboration or history management.) This
// class implements [`Mappable`](#transform.Mappable).
var Mapping = function Mapping(maps, mirror, from, to) {
  // :: [StepMap]
  // The step maps in this mapping.
  this.maps = maps || []
  // :: number
  // The starting position in the `maps` array, used when `map` or
  // `mapResult` is called.
  this.from = from || 0
  // :: number
  // The end positions in the `maps` array.
  this.to = to == null ? this.maps.length : to
  this.mirror = mirror
};

// :: (?number, ?number) → Mapping
// Create a remapping that maps only through a part of this one.
Mapping.prototype.slice = function slice (from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.maps.length;

  return new Mapping(this.maps, this.mirror, from, to)
};

Mapping.prototype.copy = function copy () {
  return new Mapping(this.maps.slice(), this.mirror && this.mirror.slice(), this.from, this.to)
};

Mapping.prototype.getMirror = function getMirror (n) {
    var this$1 = this;

  if (this.mirror) { for (var i = 0; i < this.mirror.length; i++)
    { if (this$1.mirror[i] == n) { return this$1.mirror[i + (i % 2 ? -1 : 1)] } } }
};

Mapping.prototype.setMirror = function setMirror (n, m) {
  if (!this.mirror) { this.mirror = [] }
  this.mirror.push(n, m)
};

// :: (StepMap, ?number)
// Add a step map to the end of this remapping. If `mirrors` is
// given, it should be the index of the step map that is the mirror
// image of this one.
Mapping.prototype.appendMap = function appendMap (map, mirrors) {
  this.to = this.maps.push(map)
  if (mirrors != null) { this.setMirror(this.maps.length - 1, mirrors) }
};

// :: (Mapping)
// Add all the step maps in a given mapping to this one (preserving
// mirroring information).
Mapping.prototype.appendMapping = function appendMapping (mapping) {
    var this$1 = this;

  for (var i = 0, startSize = this.maps.length; i < mapping.maps.length; i++) {
    var mirr = mapping.getMirror(i)
    this$1.appendMap(mapping.maps[i], mirr != null && mirr < i ? startSize + mirr : null)
  }
};

// :: (number, ?number) → number
// Map a position through this remapping.
Mapping.prototype.map = function map (pos, assoc) {
    var this$1 = this;

  if (this.mirror) { return this._map(pos, assoc, true) }
  for (var i = this.from; i < this.to; i++)
    { pos = this$1.maps[i].map(pos, assoc) }
  return pos
};

// :: (number, ?number) → MapResult
// Map a position through this remapping, returning a mapping
// result.
Mapping.prototype.mapResult = function mapResult (pos, assoc) { return this._map(pos, assoc, false) };

Mapping.prototype._map = function _map (pos, assoc, simple) {
    var this$1 = this;

  var deleted = false, recoverables = null

  for (var i = this.from; i < this.to; i++) {
    var map = this$1.maps[i], rec = recoverables && recoverables[i]
    if (rec != null && map.touches(pos, rec)) {
      pos = map.recover(rec)
      continue
    }

    var result = map.mapResult(pos, assoc)
    if (result.recover != null) {
      var corr = this$1.getMirror(i)
      if (corr != null && corr > i && corr < this$1.to) {
        if (result.deleted) {
          i = corr
          pos = this$1.maps[corr].recover(result.recover)
          continue
        } else {
          ;(recoverables || (recoverables = Object.create(null)))[corr] = result.recover
        }
      }
    }

    if (result.deleted) { deleted = true }
    pos = result.pos
  }

  return simple ? pos : new MapResult(pos, deleted)
};
exports.Mapping = Mapping

},{}],41:[function(require,module,exports){
var ref = require("prosemirror-model");
var MarkType = ref.MarkType;
var Slice = ref.Slice;
var Fragment = ref.Fragment;

var ref$1 = require("./transform");
var Transform = ref$1.Transform;
var ref$2 = require("./mark_step");
var AddMarkStep = ref$2.AddMarkStep;
var RemoveMarkStep = ref$2.RemoveMarkStep;
var ref$3 = require("./replace_step");
var ReplaceStep = ref$3.ReplaceStep;

// :: (number, number, Mark) → Transform
// Add the given mark to the inline content between `from` and `to`.
Transform.prototype.addMark = function(from, to, mark) {
  var this$1 = this;

  var removed = [], added = [], removing = null, adding = null
  this.doc.nodesBetween(from, to, function (node, pos, parent, index) {
    if (!node.isInline) { return }
    var marks = node.marks
    if (mark.isInSet(marks) || !parent.contentMatchAt(index + 1).allowsMark(mark.type)) {
      adding = removing = null
    } else {
      var start = Math.max(pos, from), end = Math.min(pos + node.nodeSize, to)
      var rm = mark.type.isInSet(marks)

      if (!rm)
        { removing = null }
      else if (removing && removing.mark.eq(rm))
        { removing.to = end }
      else
        { removed.push(removing = new RemoveMarkStep(start, end, rm)) }

      if (adding)
        { adding.to = end }
      else
        { added.push(adding = new AddMarkStep(start, end, mark)) }
    }
  })

  removed.forEach(function (s) { return this$1.step(s); })
  added.forEach(function (s) { return this$1.step(s); })
  return this
}

// :: (number, number, ?union<Mark, MarkType>) → Transform
// Remove the given mark, or all marks of the given type, from inline
// nodes between `from` and `to`.
Transform.prototype.removeMark = function(from, to, mark) {
  var this$1 = this;
  if ( mark === void 0 ) mark = null;

  var matched = [], step = 0
  this.doc.nodesBetween(from, to, function (node, pos) {
    if (!node.isInline) { return }
    step++
    var toRemove = null
    if (mark instanceof MarkType) {
      var found = mark.isInSet(node.marks)
      if (found) { toRemove = [found] }
    } else if (mark) {
      if (mark.isInSet(node.marks)) { toRemove = [mark] }
    } else {
      toRemove = node.marks
    }
    if (toRemove && toRemove.length) {
      var end = Math.min(pos + node.nodeSize, to)
      for (var i = 0; i < toRemove.length; i++) {
        var style = toRemove[i], found$1 = (void 0)
        for (var j = 0; j < matched.length; j++) {
          var m = matched[j]
          if (m.step == step - 1 && style.eq(matched[j].style)) { found$1 = m }
        }
        if (found$1) {
          found$1.to = end
          found$1.step = step
        } else {
          matched.push({style: style, from: Math.max(pos, from), to: end, step: step})
        }
      }
    }
  })
  matched.forEach(function (m) { return this$1.step(new RemoveMarkStep(m.from, m.to, m.style)); })
  return this
}

// :: (number, number) → Transform
// Remove all marks and non-text inline nodes from the given range.
Transform.prototype.clearMarkup = function(from, to) {
  var this$1 = this;

  var delSteps = [] // Must be accumulated and applied in inverse order
  this.doc.nodesBetween(from, to, function (node, pos) {
    if (!node.isInline) { return }
    if (!node.type.isText) {
      delSteps.push(new ReplaceStep(pos, pos + node.nodeSize, Slice.empty))
      return
    }
    for (var i = 0; i < node.marks.length; i++)
      { this$1.step(new RemoveMarkStep(Math.max(pos, from), Math.min(pos + node.nodeSize, to), node.marks[i])) }
  })
  for (var i = delSteps.length - 1; i >= 0; i--) { this$1.step(delSteps[i]) }
  return this
}

Transform.prototype.clearNonMatching = function(pos, match) {
  var this$1 = this;

  var node = this.doc.nodeAt(pos)
  var delSteps = [], cur = pos + 1
  for (var i = 0; i < node.childCount; i++) {
    var child = node.child(i), end = cur + child.nodeSize
    var allowed = match.matchType(child.type, child.attrs)
    if (!allowed) {
      delSteps.push(new ReplaceStep(cur, end, Slice.empty))
    } else {
      match = allowed
      for (var j = 0; j < child.marks.length; j++) { if (!match.allowsMark(child.marks[j]))
        { this$1.step(new RemoveMarkStep(cur, end, child.marks[j])) } }
    }
    cur = end
  }
  if (!match.validEnd()) {
    var fill = match.fillBefore(Fragment.empty, true)
    this.replace(cur, cur, new Slice(fill, 0, 0))
  }
  for (var i$1 = delSteps.length - 1; i$1 >= 0; i$1--) { this$1.step(delSteps[i$1]) }
  return this
}

},{"./mark_step":42,"./replace_step":44,"./transform":47,"prosemirror-model":24}],42:[function(require,module,exports){
var ref = require("prosemirror-model");
var Fragment = ref.Fragment;
var Slice = ref.Slice;
var ref$1 = require("./step");
var Step = ref$1.Step;
var StepResult = ref$1.StepResult;

function mapFragment(fragment, f, parent) {
  var mapped = []
  for (var i = 0; i < fragment.childCount; i++) {
    var child = fragment.child(i)
    if (child.content.size) { child = child.copy(mapFragment(child.content, f, child)) }
    if (child.isInline) { child = f(child, parent, i) }
    mapped.push(child)
  }
  return Fragment.fromArray(mapped)
}

// ::- Add a mark to all inline content between two positions.
var AddMarkStep = (function (Step) {
  function AddMarkStep(from, to, mark) {
    Step.call(this)
    this.from = from
    this.to = to
    this.mark = mark
  }

  if ( Step ) AddMarkStep.__proto__ = Step;
  AddMarkStep.prototype = Object.create( Step && Step.prototype );
  AddMarkStep.prototype.constructor = AddMarkStep;

  AddMarkStep.prototype.apply = function apply (doc) {
    var this$1 = this;

    var oldSlice = doc.slice(this.from, this.to), $from = doc.resolve(this.from)
    var parent = $from.node($from.sharedDepth(this.to))
    var slice = new Slice(mapFragment(oldSlice.content, function (node, parent, index) {
      if (!parent.contentMatchAt(index + 1).allowsMark(this$1.mark.type)) { return node }
      return node.mark(this$1.mark.addToSet(node.marks))
    }, parent), oldSlice.openLeft, oldSlice.openRight)
    return StepResult.fromReplace(doc, this.from, this.to, slice)
  };

  AddMarkStep.prototype.invert = function invert () {
    return new RemoveMarkStep(this.from, this.to, this.mark)
  };

  AddMarkStep.prototype.map = function map (mapping) {
    var from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1)
    if (from.deleted && to.deleted || from.pos >= to.pos) { return null }
    return new AddMarkStep(from.pos, to.pos, this.mark)
  };

  AddMarkStep.prototype.merge = function merge (other) {
    if (other instanceof AddMarkStep &&
        other.mark.eq(this.mark) &&
        this.from <= other.to && this.to >= other.from)
      { return new AddMarkStep(Math.min(this.from, other.from),
                             Math.max(this.to, other.to), this.mark) }
  };

  AddMarkStep.fromJSON = function fromJSON (schema, json) {
    return new AddMarkStep(json.from, json.to, schema.markFromJSON(json.mark))
  };

  return AddMarkStep;
}(Step));
exports.AddMarkStep = AddMarkStep

Step.jsonID("addMark", AddMarkStep)

// ::- Remove a mark from all inline content between two positions.
var RemoveMarkStep = (function (Step) {
  function RemoveMarkStep(from, to, mark) {
    Step.call(this)
    this.from = from
    this.to = to
    this.mark = mark
  }

  if ( Step ) RemoveMarkStep.__proto__ = Step;
  RemoveMarkStep.prototype = Object.create( Step && Step.prototype );
  RemoveMarkStep.prototype.constructor = RemoveMarkStep;

  RemoveMarkStep.prototype.apply = function apply (doc) {
    var this$1 = this;

    var oldSlice = doc.slice(this.from, this.to)
    var slice = new Slice(mapFragment(oldSlice.content, function (node) {
      return node.mark(this$1.mark.removeFromSet(node.marks))
    }), oldSlice.openLeft, oldSlice.openRight)
    return StepResult.fromReplace(doc, this.from, this.to, slice)
  };

  RemoveMarkStep.prototype.invert = function invert () {
    return new AddMarkStep(this.from, this.to, this.mark)
  };

  RemoveMarkStep.prototype.map = function map (mapping) {
    var from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1)
    if (from.deleted && to.deleted || from.pos >= to.pos) { return null }
    return new RemoveMarkStep(from.pos, to.pos, this.mark)
  };

  RemoveMarkStep.prototype.merge = function merge (other) {
    if (other instanceof RemoveMarkStep &&
        other.mark.eq(this.mark) &&
        this.from <= other.to && this.to >= other.from)
      { return new RemoveMarkStep(Math.min(this.from, other.from),
                                Math.max(this.to, other.to), this.mark) }
  };

  RemoveMarkStep.fromJSON = function fromJSON (schema, json) {
    return new RemoveMarkStep(json.from, json.to, schema.markFromJSON(json.mark))
  };

  return RemoveMarkStep;
}(Step));
exports.RemoveMarkStep = RemoveMarkStep

Step.jsonID("removeMark", RemoveMarkStep)

},{"./step":45,"prosemirror-model":24}],43:[function(require,module,exports){
var ref = require("prosemirror-model");
var Fragment = ref.Fragment;
var Slice = ref.Slice;

var ref$1 = require("./replace_step");
var ReplaceStep = ref$1.ReplaceStep;
var ReplaceAroundStep = ref$1.ReplaceAroundStep;
var ref$2 = require("./transform");
var Transform = ref$2.Transform;
var ref$3 = require("./structure");
var insertPoint = ref$3.insertPoint;

// :: (number, number, Slice) → Transform
// Replace a range of the document with a given slice, using `from`,
// `to`, and the slice's [`openLeft`](#model.Slice.openLeft) property
// as hints, rather than fixed start and end points. This method may
// grow the replaced area or close open nodes in the slice in order to
// get a fit that is more in line with WYSIWYG expectations, by
// dropping fully covered parent nodes of the replaced region when
// they are marked [non-defining](#model.NodeSpec.defining), or
// including an open parent node from the slice that _is_ marked as
// [defining](#model.NodeSpec.defining).
//
// This is the method, for example, to handle paste. The similar
// [`replace`](#transform.Transform.replace) method is a more
// primitive tool which will _not_ move the start and end of its given
// range, and is useful in situations where you need more precise
// control over what happens.
Transform.prototype.replaceRange = function(from, to, slice) {
  var this$1 = this;

  if (!slice.size) { return this.deleteRange(from, to) }

  var $from = this.doc.resolve(from)
  if (fitsTrivially($from, this.doc.resolve(to), slice))
    { return this.step(new ReplaceStep(from, to, slice)) }

  var canExpand = coveredDepths($from, this.doc.resolve(to)), preferredExpand = 0
  canExpand.unshift($from.depth + 1)
  for (var d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.spec.defining) { break }
    var found = canExpand.indexOf(d, 1)
    if (found > -1) { preferredExpand = found }
  }

  var leftNodes = [], preferredDepth = slice.openLeft
  for (var content = slice.content, i = 0;; i++) {
    var node = content.firstChild
    leftNodes.push(node)
    if (i == slice.openLeft) { break }
    content = node.content
  }
  // Back up if the node directly above openLeft, or the node above
  // that separated only by a non-defining textblock node, is defining.
  if (preferredDepth > 0 && leftNodes[preferredDepth - 1].type.spec.defining)
    { preferredDepth -= 1 }
  else if (preferredDepth >= 2 && leftNodes[preferredDepth - 1].isTextblock && leftNodes[preferredDepth - 2].type.spec.defining)
    { preferredDepth -= 2 }

  for (var j = slice.openLeft; j >= 0; j--) {
    var openDepth = (j + preferredDepth + 1) % (slice.openLeft + 1)
    var insert = leftNodes[openDepth]
    if (!insert) { continue }
    for (var i$1 = 0; i$1 < canExpand.length; i$1++) {
      // Loop over possible expansion levels, starting with the
      // preferred one
      var expandDepth = canExpand[(i$1 + preferredExpand) % canExpand.length]
      var parent = $from.node(expandDepth - 1), index = $from.index(expandDepth - 1)
      if (parent.canReplaceWith(index, index, insert.type, insert.attrs, insert.marks))
        { return this$1.replace($from.before(expandDepth), expandDepth > $from.depth ? to : $from.after(expandDepth),
                            new Slice(closeFragment(slice.content, 0, slice.openLeft, openDepth),
                                      openDepth, slice.openRight)) }
    }
  }

  return this.replace(from, to, slice)
}

function closeFragment(fragment, depth, oldOpen, newOpen, parent) {
  if (depth < oldOpen) {
    var first = fragment.firstChild
    fragment = fragment.replaceChild(0, first.copy(closeFragment(first.content, depth + 1, oldOpen, newOpen, first)))
  }
  if (depth > newOpen)
    { fragment = parent.contentMatchAt(0).fillBefore(fragment).append(fragment) }
  return fragment
}

// :: (number, number, Node) → Transform
// Replace the given range with a node, but use `from` and `to` as
// hints, rather than precise positions. When from and to are the same
// and are at the start or end of a parent node in which the given
// node doesn't fit, this method may _move_ them out towards a parent
// that does allow the given node to be placed. When the given range
// completely covers a parent node, this method may completely replace
// that parent node.
Transform.prototype.replaceRangeWith = function(from, to, node) {
  if (!node.isInline && from == to && this.doc.resolve(from).parent.content.size) {
    var point = insertPoint(this.doc, from, node.type, node.attrs)
    if (point != null) { from = to = point }
  }
  return this.replaceRange(from, to, new Slice(Fragment.from(node), 0, 0))
}

// :: (number, number) → Transform
// Delete the given range, and any fully covered parent nodes that are
// not allowed to be empty.
Transform.prototype.deleteRange = function(from, to) {
  var $from = this.doc.resolve(from)
  var covered = coveredDepths($from, this.doc.resolve(to)), grown = false
  // Find the innermost covered node that allows its whole content to
  // be deleted
  for (var i = 0; i < covered.length; i++) {
    if ($from.node(covered[i]).contentMatchAt(0).validEnd()) {
      from = $from.start(covered[i])
      to = $from.end(covered[i])
      grown = true
      break
    }
  }
  // If no such node was found and the outermose covered node can be
  // deleted entirely, do that
  if (!grown && covered.length) {
    var depth = covered[covered.length - 1]
    if ($from.node(depth - 1).canReplace($from.index(depth - 1), $from.indexAfter(depth - 1))) {
      from = $from.before(depth)
      to = $from.after(depth)
    }
  }
  return this.delete(from, to)
}

// : (ResolvedPos, ResolvedPos) → [number]
// Returns an array of all depths for which $from - $to spans the
// whole content of the node at that depth.
function coveredDepths($from, $to) {
  var result = []
  for (var i = 0; i < $from.depth; i++) {
    var depth = $from.depth - i
    if ($from.pos - i > $from.start(depth)) { break }
    if ($to.depth >= depth && $to.pos + ($to.depth - depth) == $from.end(depth)) { result.push(depth) }
  }
  return result
}

// :: (number, number) → Transform
// Delete the content between the given positions.
Transform.prototype.delete = function(from, to) {
  return this.replace(from, to, Slice.empty)
}

// :: (Node, number, ?number, ?Slice) → ?Step
// "Fit" a slice into a given position in the document, producing a
// [step](#transform.Step) that inserts it.
function replaceStep(doc, from, to, slice) {
  if ( to === void 0 ) to = from;
  if ( slice === void 0 ) slice = Slice.empty;

  if (from == to && !slice.size) { return null }

  var $from = doc.resolve(from), $to = doc.resolve(to)
  // Optimization -- avoid work if it's obvious that it's not needed.
  if (fitsTrivially($from, $to, slice)) { return new ReplaceStep(from, to, slice) }
  var placed = placeSlice($from, slice)

  var fittedLeft = fitLeft($from, placed)
  var fitted = fitRight($from, $to, fittedLeft)
  if (!fitted) { return null }
  if (fittedLeft.size != fitted.size && canMoveText($from, $to, fittedLeft)) {
    var d = $to.depth, after = $to.after(d)
    while (d > 1 && after == $to.end(--d)) { ++after }
    var fittedAfter = fitRight($from, doc.resolve(after), fittedLeft)
    if (fittedAfter)
      { return new ReplaceAroundStep(from, after, to, $to.end(), fittedAfter, fittedLeft.size) }
  }
  return new ReplaceStep(from, to, fitted)
}
exports.replaceStep = replaceStep

// :: (number, ?number, ?Slice) → Transform
// Replace the part of the document between `from` and `to` with the
// given `slice`.
Transform.prototype.replace = function(from, to, slice) {
  if ( to === void 0 ) to = from;
  if ( slice === void 0 ) slice = Slice.empty;

  var step = replaceStep(this.doc, from, to, slice)
  if (step) { this.step(step) }
  return this
}

// :: (number, number, union<Fragment, Node, [Node]>) → Transform
// Replace the given range with the given content, which may be a
// fragment, node, or array of nodes.
Transform.prototype.replaceWith = function(from, to, content) {
  return this.replace(from, to, new Slice(Fragment.from(content), 0, 0))
}

// :: (number, union<Fragment, Node, [Node]>) → Transform
// Insert the given content at the given position.
Transform.prototype.insert = function(pos, content) {
  return this.replaceWith(pos, pos, content)
}



function fitLeftInner($from, depth, placed, placedBelow) {
  var content = Fragment.empty, openRight = 0, placedHere = placed[depth]
  if ($from.depth > depth) {
    var inner = fitLeftInner($from, depth + 1, placed, placedBelow || placedHere)
    openRight = inner.openRight + 1
    content = Fragment.from($from.node(depth + 1).copy(inner.content))
  }

  if (placedHere) {
    content = content.append(placedHere.content)
    openRight = placedHere.openRight
  }
  if (placedBelow) {
    content = content.append($from.node(depth).contentMatchAt($from.indexAfter(depth)).fillBefore(Fragment.empty, true))
    openRight = 0
  }

  return {content: content, openRight: openRight}
}

function fitLeft($from, placed) {
  var ref = fitLeftInner($from, 0, placed, false);
  var content = ref.content;
  var openRight = ref.openRight;
  return new Slice(content, $from.depth, openRight || 0)
}

function fitRightJoin(content, parent, $from, $to, depth, openLeft, openRight) {
  var match, count = content.childCount, matchCount = count - (openRight > 0 ? 1 : 0)
  if (openLeft < 0)
    { match = parent.contentMatchAt(matchCount) }
  else if (count == 1 && openRight > 0)
    { match = $from.node(depth).contentMatchAt(openLeft ? $from.index(depth) : $from.indexAfter(depth)) }
  else
    { match = $from.node(depth).contentMatchAt($from.indexAfter(depth))
      .matchFragment(content, count > 0 && openLeft ? 1 : 0, matchCount) }

  var toNode = $to.node(depth)
  if (openRight > 0 && depth < $to.depth) {
    var after = toNode.content.cutByIndex($to.indexAfter(depth)).addToStart(content.lastChild)
    var joinable$1 = match.fillBefore(after, true)
    // Can't insert content if there's a single node stretched across this gap
    if (joinable$1 && joinable$1.size && openLeft > 0 && count == 1) { joinable$1 = null }

    if (joinable$1) {
      var inner = fitRightJoin(content.lastChild.content, content.lastChild, $from, $to,
                               depth + 1, count == 1 ? openLeft - 1 : -1, openRight - 1)
      if (inner) {
        var last = content.lastChild.copy(inner)
        if (joinable$1.size)
          { return content.cutByIndex(0, count - 1).append(joinable$1).addToEnd(last) }
        else
          { return content.replaceChild(count - 1, last) }
      }
    }
  }
  if (openRight > 0)
    { match = match.matchNode(count == 1 && openLeft > 0 ? $from.node(depth + 1) : content.lastChild) }

  // If we're here, the next level can't be joined, so we see what
  // happens if we leave it open.
  var toIndex = $to.index(depth)
  if (toIndex == toNode.childCount && !toNode.type.compatibleContent(parent.type)) { return null }
  var joinable = match.fillBefore(toNode.content, true, toIndex)
  if (!joinable) { return null }

  if (openRight > 0) {
    var closed = fitRightClosed(content.lastChild, openRight - 1, $from, depth + 1,
                                count == 1 ? openLeft - 1 : -1)
    content = content.replaceChild(count - 1, closed)
  }
  content = content.append(joinable)
  if ($to.depth > depth)
    { content = content.addToEnd(fitRightSeparate($to, depth + 1)) }
  return content
}

function fitRightClosed(node, openRight, $from, depth, openLeft) {
  var match, content = node.content, count = content.childCount
  if (openLeft >= 0)
    { match = $from.node(depth).contentMatchAt($from.indexAfter(depth))
      .matchFragment(content, openLeft > 0 ? 1 : 0, count) }
  else
    { match = node.contentMatchAt(count) }

  if (openRight > 0) {
    var closed = fitRightClosed(content.lastChild, openRight - 1, $from, depth + 1,
                                count == 1 ? openLeft - 1 : -1)
    content = content.replaceChild(count - 1, closed)
  }

  return node.copy(content.append(match.fillBefore(Fragment.empty, true)))
}

function fitRightSeparate($to, depth) {
  var node = $to.node(depth)
  var fill = node.contentMatchAt(0).fillBefore(node.content, true, $to.index(depth))
  if ($to.depth > depth) { fill = fill.addToEnd(fitRightSeparate($to, depth + 1)) }
  return node.copy(fill)
}

function normalizeSlice(content, openLeft, openRight) {
  while (openLeft > 0 && openRight > 0 && content.childCount == 1) {
    content = content.firstChild.content
    openLeft--
    openRight--
  }
  return new Slice(content, openLeft, openRight)
}

// : (ResolvedPos, ResolvedPos, number, Slice) → Slice
function fitRight($from, $to, slice) {
  var fitted = fitRightJoin(slice.content, $from.node(0), $from, $to, 0, slice.openLeft, slice.openRight)
  if (!fitted) { return null }
  return normalizeSlice(fitted, slice.openLeft, $to.depth)
}

function fitsTrivially($from, $to, slice) {
  return !slice.openLeft && !slice.openRight && $from.start() == $to.start() &&
    $from.parent.canReplace($from.index(), $to.index(), slice.content)
}

function canMoveText($from, $to, slice) {
  if (!$to.parent.isTextblock) { return false }

  var match
  if (!slice.openRight) {
    var parent = $from.node($from.depth - (slice.openLeft - slice.openRight))
    if (!parent.isTextblock) { return false }
    match = parent.contentMatchAt(parent.childCount)
    if (slice.size)
      { match = match.matchFragment(slice.content, slice.openLeft ? 1 : 0) }
  } else {
    var parent$1 = nodeRight(slice.content, slice.openRight)
    if (!parent$1.isTextblock) { return false }
    match = parent$1.contentMatchAt(parent$1.childCount)
  }
  match = match.matchFragment($to.parent.content, $to.index())
  return match && match.validEnd()
}

// Algorithm for 'placing' the elements of a slice into a gap:
//
// We consider the content of each node that is open to the left to be
// independently placeable. I.e. in <p("foo"), p("bar")>, when the
// paragraph on the left is open, "foo" can be placed (somewhere on
// the left side of the replacement gap) independently from p("bar").
//
// So placeSlice splits up a slice into a number of sub-slices,
// along with information on where they can be placed on the given
// left-side edge. It works by walking the open side of the slice,
// from the inside out, and trying to find a landing spot for each
// element, by simultaneously scanning over the gap side. When no
// place is found for an open node's content, it is left in that node.
//
// If the outer content can't be placed, a set of wrapper nodes is
// made up for it (by rooting it in the document node type using
// findWrapping), and the algorithm continues to iterate over those.
// This is guaranteed to find a fit, since both stacks now start with
// the same node type (doc).

function nodeLeft(content, depth) {
  for (var i = 1; i < depth; i++) { content = content.firstChild.content }
  return content.firstChild
}

function nodeRight(content, depth) {
  for (var i = 1; i < depth; i++) { content = content.lastChild.content }
  return content.lastChild
}

// : (ResolvedPos, Slice) → [{content: Fragment, openRight: number, depth: number}]
function placeSlice($from, slice) {
  var dFrom = $from.depth, unplaced = null
  var placed = [], parents = null

  // Loop over the open side of the slice, trying to find a place for
  // each open fragment.
  for (var dSlice = slice.openLeft;; --dSlice) {
    // Get the components of the node at this level
    var curType = (void 0), curAttrs = (void 0), curFragment = (void 0)
    if (dSlice >= 0) {
      if (dSlice > 0) { // Inside slice
        ;var assign;
        ((assign = nodeLeft(slice.content, dSlice), curType = assign.type, curAttrs = assign.attrs, curFragment = assign.content))
      } else if (dSlice == 0) { // Top of slice
        curFragment = slice.content
      }
      if (dSlice < slice.openLeft) { curFragment = curFragment.cut(curFragment.firstChild.nodeSize) }
    } else { // Outside slice, in generated wrappers (see below)
      curFragment = Fragment.empty
      var parent = parents[parents.length + dSlice - 1]
      curType = parent.type
      curAttrs = parent.attrs
    }
    // If the last iteration left unplaced content, include it in the fragment
    if (unplaced) { curFragment = curFragment.addToStart(unplaced) }

    // If there's nothing left to place, we're done
    if (curFragment.size == 0 && dSlice <= 0) { break }

    // This will go through the positions in $from, down from dFrom,
    // to find a fit
    var found = findPlacement(curFragment, $from, dFrom, placed)
    if (found) {
      // If there was a fit, store it, and consider this content placed
      if (found.fragment.size > 0) { placed[found.depth] = {
        content: found.fragment,
        openRight: endOfContent(slice, dSlice) ? slice.openRight - dSlice : 0,
        depth: found.depth
      } }
      // If that was the last of the content, we're done
      if (dSlice <= 0) { break }
      unplaced = null
      dFrom = found.depth - (curType == $from.node(found.depth).type ? 1 : 0)
    } else {
      if (dSlice == 0) {
        // This is the top of the slice, and we haven't found a place to insert it.
        var top = $from.node(0)
        // Try to find a wrapping that makes its first child fit in the top node.
        var wrap = top.contentMatchAt($from.index(0)).findWrappingFor(curFragment.firstChild)
        // If no such thing exists, give up.
        if (!wrap || wrap.length == 0) { break }
        var last = wrap[wrap.length - 1]
        // Check that the fragment actually fits in the wrapping.
        if (!last.type.contentExpr.matches(last.attrs, curFragment)) { break }
        // Store the result for subsequent iterations.
        parents = [{type: top.type, attrs: top.attrs}].concat(wrap)
        ;var assign$1;
        ((assign$1 = last, curType = assign$1.type, curAttrs = assign$1.attrs))
      }
      if (curFragment.size) {
        curFragment = curType.contentExpr.start(curAttrs).fillBefore(curFragment, true).append(curFragment)
        unplaced = curType.create(curAttrs, curFragment)
      } else {
        unplaced = null
      }
    }
  }

  return placed
}

function endOfContent(slice, depth) {
  for (var i = 0, content = slice.content; i < depth; i++) {
    if (content.childCount > 1) { return false }
    content = content.firstChild.content
  }
  return true
}

function findPlacement(fragment, $from, start, placed) {
  var hasMarks = false
  for (var i = 0; i < fragment.childCount; i++)
    { if (fragment.child(i).marks.length) { hasMarks = true } }
  for (var d = start; d >= 0; d--) {
    var startMatch = $from.node(d).contentMatchAt($from.indexAfter(d))
    var existing = placed[d]
    if (existing) { startMatch = startMatch.matchFragment(existing.content) }
    var match = startMatch.fillBefore(fragment)
    if (match) { return {depth: d, fragment: (existing ? existing.content.append(match) : match).append(fragment)} }
    if (hasMarks) {
      var stripped = matchStrippingMarks(startMatch, fragment)
      if (stripped) { return {depth: d, fragment: existing ? existing.content.append(stripped) : stripped} }
    }
  }
}

function matchStrippingMarks(match, fragment) {
  var newNodes = []
  for (var i = 0; i < fragment.childCount; i++) {
    var node = fragment.child(i), stripped = node.mark(node.marks.filter(function (m) { return match.allowsMark(m.type); }))
    match = match.matchNode(stripped)
    if (!match) { return null }
    newNodes.push(stripped)
  }
  return Fragment.from(newNodes)
}

},{"./replace_step":44,"./structure":46,"./transform":47,"prosemirror-model":24}],44:[function(require,module,exports){
var ref = require("prosemirror-model");
var Slice = ref.Slice;

var ref$1 = require("./step");
var Step = ref$1.Step;
var StepResult = ref$1.StepResult;
var ref$2 = require("./map");
var StepMap = ref$2.StepMap;

// ::- Replace a part of the document with a slice of new content.
var ReplaceStep = (function (Step) {
  function ReplaceStep(from, to, slice, structure) {
    Step.call(this)
    this.from = from
    this.to = to
    this.slice = slice
    this.structure = !!structure
  }

  if ( Step ) ReplaceStep.__proto__ = Step;
  ReplaceStep.prototype = Object.create( Step && Step.prototype );
  ReplaceStep.prototype.constructor = ReplaceStep;

  ReplaceStep.prototype.apply = function apply (doc) {
    if (this.structure && contentBetween(doc, this.from, this.to))
      { return StepResult.fail("Structure replace would overwrite content") }
    return StepResult.fromReplace(doc, this.from, this.to, this.slice)
  };

  ReplaceStep.prototype.getMap = function getMap () {
    return new StepMap([this.from, this.to - this.from, this.slice.size])
  };

  ReplaceStep.prototype.invert = function invert (doc) {
    return new ReplaceStep(this.from, this.from + this.slice.size, doc.slice(this.from, this.to))
  };

  ReplaceStep.prototype.map = function map (mapping) {
    var from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1)
    if (from.deleted && to.deleted) { return null }
    return new ReplaceStep(from.pos, Math.max(from.pos, to.pos), this.slice)
  };

  ReplaceStep.prototype.merge = function merge (other) {
    if (!(other instanceof ReplaceStep) || other.structure != this.structure) { return null }

    if (this.from + this.slice.size == other.from && !this.slice.openRight && !other.slice.openLeft) {
      var slice = this.slice.size + other.slice.size == 0 ? Slice.empty
          : new Slice(this.slice.content.append(other.slice.content), this.slice.openLeft, other.slice.openRight)
      return new ReplaceStep(this.from, this.to + (other.to - other.from), slice, this.structure)
    } else if (other.to == this.from && !this.slice.openLeft && !other.slice.openRight) {
      var slice$1 = this.slice.size + other.slice.size == 0 ? Slice.empty
          : new Slice(other.slice.content.append(this.slice.content), other.slice.openLeft, this.slice.openRight)
      return new ReplaceStep(other.from, this.to, slice$1, this.structure)
    } else {
      return null
    }
  };

  ReplaceStep.prototype.toJSON = function toJSON () {
    var json = {stepType: "replace", from: this.from, to: this.to}
    if (this.slice.size) { json.slice = this.slice.toJSON() }
    if (this.structure) { json.structure = true }
    return json
  };

  ReplaceStep.fromJSON = function fromJSON (schema, json) {
    return new ReplaceStep(json.from, json.to, Slice.fromJSON(schema, json.slice), !!json.structure)
  };

  return ReplaceStep;
}(Step));
exports.ReplaceStep = ReplaceStep

Step.jsonID("replace", ReplaceStep)

// ::- Replace a part of the document with a slice of content, but
// preserve a range of the replaced content by moving it into the
// slice.
var ReplaceAroundStep = (function (Step) {
  function ReplaceAroundStep(from, to, gapFrom, gapTo, slice, insert, structure) {
    Step.call(this)
    this.from = from
    this.to = to
    this.gapFrom = gapFrom
    this.gapTo = gapTo
    this.slice = slice
    this.insert = insert
    this.structure = !!structure
  }

  if ( Step ) ReplaceAroundStep.__proto__ = Step;
  ReplaceAroundStep.prototype = Object.create( Step && Step.prototype );
  ReplaceAroundStep.prototype.constructor = ReplaceAroundStep;

  ReplaceAroundStep.prototype.apply = function apply (doc) {
    if (this.structure && (contentBetween(doc, this.from, this.gapFrom) ||
                           contentBetween(doc, this.gapTo, this.to)))
      { return StepResult.fail("Structure gap-replace would overwrite content") }

    var gap = doc.slice(this.gapFrom, this.gapTo)
    if (gap.openLeft || gap.openRight)
      { return StepResult.fail("Gap is not a flat range") }
    var inserted = this.slice.insertAt(this.insert, gap.content)
    if (!inserted) { return StepResult.fail("Content does not fit in gap") }
    return StepResult.fromReplace(doc, this.from, this.to, inserted)
  };

  ReplaceAroundStep.prototype.getMap = function getMap () {
    return new StepMap([this.from, this.gapFrom - this.from, this.insert,
                        this.gapTo, this.to - this.gapTo, this.slice.size - this.insert])
  };

  ReplaceAroundStep.prototype.invert = function invert (doc) {
    var gap = this.gapTo - this.gapFrom
    return new ReplaceAroundStep(this.from, this.from + this.slice.size + gap,
                                 this.from + this.insert, this.from + this.insert + gap,
                                 doc.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from),
                                 this.gapFrom - this.from, this.structure)
  };

  ReplaceAroundStep.prototype.map = function map (mapping) {
    var from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1)
    var gapFrom = mapping.map(this.gapFrom, -1), gapTo = mapping.map(this.gapTo, 1)
    if ((from.deleted && to.deleted) || gapFrom < from.pos || gapTo > to.pos) { return null }
    return new ReplaceAroundStep(from.pos, to.pos, gapFrom, gapTo, this.slice, this.insert, this.structure)
  };

  ReplaceAroundStep.toJSON = function toJSON () {
    var json = {stepType: "replaceAround", from: this.from, to: this.to,
                gapFrom: this.gapFrom, gapTo: this.gapTo, slice: this.slice.toJSON()}
    if (this.structure) { json.structure = true }
    return true
  };

  ReplaceAroundStep.fromJSON = function fromJSON (schema, json) {
    return new ReplaceAroundStep(json.from, json.to, json.gapFrom, json.gapTo,
                                 Slice.fromJSON(schema, json.slice), json.insert, !!json.structure)
  };

  return ReplaceAroundStep;
}(Step));
exports.ReplaceAroundStep = ReplaceAroundStep

Step.jsonID("replaceAround", ReplaceAroundStep)

function contentBetween(doc, from, to) {
  var $from = doc.resolve(from), dist = to - from, depth = $from.depth
  while (dist > 0 && depth > 0 && $from.indexAfter(depth) == $from.node(depth).childCount) {
    depth--
    dist--
  }
  if (dist > 0) {
    var next = $from.node(depth).maybeChild($from.indexAfter(depth))
    while (dist > 0) {
      if (!next || next.isLeaf) { return true }
      next = next.firstChild
      dist--
    }
  }
  return false
}

},{"./map":40,"./step":45,"prosemirror-model":24}],45:[function(require,module,exports){
var ref = require("prosemirror-model");
var ReplaceError = ref.ReplaceError;

var ref$1 = require("./map");
var StepMap = ref$1.StepMap;

function mustOverride() { throw new Error("Override me") }

var stepsByID = Object.create(null)

// ::- A step object wraps an atomic operation. It generally applies
// only to the document it was created for, since the positions
// associated with it will only make sense for that document.
//
// New steps are defined by creating classes that extend `Step`,
// overriding the `apply`, `invert`, `map`, `getMap` and `fromJSON`
// methods, and registering your class with a unique
// JSON-serialization identifier using
// [`Step.jsonID`](#transform.Step^jsonID).
var Step = function Step () {};

Step.prototype.apply = function apply (_doc) { return mustOverride() };

// :: () → StepMap
// Get the step map that represents the changes made by this
// step.
Step.prototype.getMap = function getMap () { return StepMap.empty };

// :: (doc: Node) → Step
// Create an inverted version of this step. Needs the document as it
// was before the step as argument.
Step.prototype.invert = function invert (_doc) { return mustOverride() };

// :: (mapping: Mappable) → ?Step
// Map this step through a mappable thing, returning either a
// version of that step with its positions adjusted, or `null` if
// the step was entirely deleted by the mapping.
Step.prototype.map = function map (_mapping) { return mustOverride() };

// :: (other: Step) → ?Step
// Try to merge this step with another one, to be applied directly
// after it. Returns the merged step when possible, null if the
// steps can't be merged.
Step.prototype.merge = function merge (_other) { return null };

// :: () → Object
// Create a JSON-serializeable representation of this step. By
// default, it'll create an object with the step's [JSON
// id](#transform.Step^jsonID), and each of the steps's own properties,
// automatically calling `toJSON` on the property values that have
// such a method.
Step.prototype.toJSON = function toJSON () {
    var this$1 = this;

  var obj = {stepType: this.jsonID}
  for (var prop in this$1) { if (this$1.hasOwnProperty(prop)) {
    var val = this$1[prop]
    obj[prop] = val && val.toJSON ? val.toJSON() : val
  } }
  return obj
};

// :: (Schema, Object) → Step
// Deserialize a step from its JSON representation. Will call
// through to the step class' own implementation of this method.
Step.fromJSON = function fromJSON (schema, json) {
  return stepsByID[json.stepType].fromJSON(schema, json)
};

// :: (string, constructor<Step>)
// To be able to serialize steps to JSON, each step needs a string
// ID to attach to its JSON representation. Use this method to
// register an ID for your step classes. Try to pick something
// that's unlikely to clash with steps from other modules.
Step.jsonID = function jsonID (id, stepClass) {
  if (id in stepsByID) { throw new RangeError("Duplicate use of step JSON ID " + id) }
  stepsByID[id] = stepClass
  stepClass.prototype.jsonID = id
  return stepClass
};
exports.Step = Step

// ::- The result of [applying](#transform.Step.apply) a step. Contains either a
// new document or a failure value.
var StepResult = function StepResult(doc, failed) {
  // :: ?Node The transformed document.
  this.doc = doc
  // :: ?string Text providing information about a failed step.
  this.failed = failed
};

// :: (Node) → StepResult
// Create a successful step result.
StepResult.ok = function ok (doc) { return new StepResult(doc, null) };

// :: (string) → StepResult
// Create a failed step result.
StepResult.fail = function fail (message) { return new StepResult(null, message) };

// :: (Node, number, number, Slice) → StepResult
// Call [`Node.replace`](#model.Node.replace) with the given
// arguments. Create a successful result if it succeeds, and a
// failed one if it throws a `ReplaceError`.
StepResult.fromReplace = function fromReplace (doc, from, to, slice) {
  try {
    return StepResult.ok(doc.replace(from, to, slice))
  } catch (e) {
    if (e instanceof ReplaceError) { return StepResult.fail(e.message) }
    throw e
  }
};
exports.StepResult = StepResult

},{"./map":40,"prosemirror-model":24}],46:[function(require,module,exports){
var ref = require("prosemirror-model");
var Slice = ref.Slice;
var Fragment = ref.Fragment;

var ref$1 = require("./transform");
var Transform = ref$1.Transform;
var ref$2 = require("./replace_step");
var ReplaceStep = ref$2.ReplaceStep;
var ReplaceAroundStep = ref$2.ReplaceAroundStep;

function canCut(node, start, end) {
  return (start == 0 || node.canReplace(start, node.childCount)) &&
    (end == node.childCount || node.canReplace(0, end))
}

// :: (NodeRange) → ?number
// Try to find a target depth to which the content in the given range
// can be lifted.
function liftTarget(range) {
  var parent = range.parent
  var content = parent.content.cutByIndex(range.startIndex, range.endIndex)
  for (var depth = range.depth;; --depth) {
    var node = range.$from.node(depth), index = range.$from.index(depth), endIndex = range.$to.indexAfter(depth)
    if (depth < range.depth && node.canReplace(index, endIndex, content))
      { return depth }
    if (depth == 0 || !canCut(node, index, endIndex)) { break }
  }
}
exports.liftTarget = liftTarget

// :: (NodeRange, number) → Transform
// Split the content in the given range off from its parent, if there
// is sibling content before or after it, and move it up the tree to
// the depth specified by `target`. You'll probably want to use
// `liftTarget` to compute `target`, in order to be sure the lift is
// valid.
Transform.prototype.lift = function(range, target) {
  var $from = range.$from;
  var $to = range.$to;
  var depth = range.depth;

  var gapStart = $from.before(depth + 1), gapEnd = $to.after(depth + 1)
  var start = gapStart, end = gapEnd

  var before = Fragment.empty, openLeft = 0
  for (var d = depth, splitting = false; d > target; d--)
    { if (splitting || $from.index(d) > 0) {
      splitting = true
      before = Fragment.from($from.node(d).copy(before))
      openLeft++
    } else {
      start--
    } }
  var after = Fragment.empty, openRight = 0
  for (var d$1 = depth, splitting$1 = false; d$1 > target; d$1--)
    { if (splitting$1 || $to.after(d$1 + 1) < $to.end(d$1)) {
      splitting$1 = true
      after = Fragment.from($to.node(d$1).copy(after))
      openRight++
    } else {
      end++
    } }

  return this.step(new ReplaceAroundStep(start, end, gapStart, gapEnd,
                                         new Slice(before.append(after), openLeft, openRight),
                                         before.size - openLeft, true))
}

// :: (NodeRange, NodeType, ?Object) → ?[{type: NodeType, attrs: ?Object}]
// Try to find a valid way to wrap the content in the given range in a
// node of the given type. May introduce extra nodes around and inside
// the wrapper node, if necessary. Returns null if no valid wrapping
// could be found.
function findWrapping(range, nodeType, attrs, innerRange) {
  if ( innerRange === void 0 ) innerRange = range;

  var wrap = {type: nodeType, attrs: attrs}
  var around = findWrappingOutside(range, wrap)
  var inner = around && findWrappingInside(innerRange, wrap)
  if (!inner) { return null }
  return around.concat(wrap).concat(inner)
}
exports.findWrapping = findWrapping

function findWrappingOutside(range, wrap) {
  var parent = range.parent;
  var startIndex = range.startIndex;
  var endIndex = range.endIndex;
  var around = parent.contentMatchAt(startIndex).findWrapping(wrap.type, wrap.attrs)
  if (!around) { return null }
  var outer = around.length ? around[0] : wrap
  if (!parent.canReplaceWith(startIndex, endIndex, outer.type, outer.attrs))
    { return null }
  return around
}

function findWrappingInside(range, wrap) {
  var parent = range.parent;
  var startIndex = range.startIndex;
  var endIndex = range.endIndex;
  var inner = parent.child(startIndex)
  var inside = wrap.type.contentExpr.start(wrap.attrs).findWrappingFor(inner)
  if (!inside) { return null }
  var last = inside.length ? inside[inside.length - 1] : wrap
  var innerMatch = last.type.contentExpr.start(last.attrs)
  for (var i = startIndex; i < endIndex; i++)
    { innerMatch = innerMatch && innerMatch.matchNode(parent.child(i)) }
  if (!innerMatch || !innerMatch.validEnd()) { return null }
  return inside
}

// :: (NodeRange, [{type: NodeType, attrs: ?Object}]) → Transform
// Wrap the given [range](#model.NodeRange) in the given set of wrappers.
// The wrappers are assumed to be valid in this position, and should
// probably be computed with `findWrapping`.
Transform.prototype.wrap = function(range, wrappers) {
  var content = Fragment.empty
  for (var i = wrappers.length - 1; i >= 0; i--)
    { content = Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content)) }

  var start = range.start, end = range.end
  return this.step(new ReplaceAroundStep(start, end, start, end, new Slice(content, 0, 0), wrappers.length, true))
}

// :: (number, ?number, NodeType, ?Object) → Transform
// Set the type of all textblocks (partly) between `from` and `to` to
// the given node type with the given attributes.
Transform.prototype.setBlockType = function(from, to, type, attrs) {
  var this$1 = this;
  if ( to === void 0 ) to = from;

  if (!type.isTextblock) { throw new RangeError("Type given to setBlockType should be a textblock") }
  var mapFrom = this.steps.length
  this.doc.nodesBetween(from, to, function (node, pos) {
    if (node.isTextblock && !node.hasMarkup(type, attrs)) {
      // Ensure all markup that isn't allowed in the new node type is cleared
      this$1.clearNonMatching(this$1.mapping.slice(mapFrom).map(pos, 1), type.contentExpr.start(attrs))
      var mapping = this$1.mapping.slice(mapFrom)
      var startM = mapping.map(pos, 1), endM = mapping.map(pos + node.nodeSize, 1)
      this$1.step(new ReplaceAroundStep(startM, endM, startM + 1, endM - 1,
                                      new Slice(Fragment.from(type.create(attrs)), 0, 0), 1, true))
      return false
    }
  })
  return this
}

// :: (number, ?NodeType, ?Object) → Transform
// Change the type and attributes of the node after `pos`.
Transform.prototype.setNodeType = function(pos, type, attrs) {
  var node = this.doc.nodeAt(pos)
  if (!node) { throw new RangeError("No node at given position") }
  if (!type) { type = node.type }
  if (node.isLeaf)
    { return this.replaceWith(pos, pos + node.nodeSize, type.create(attrs, null, node.marks)) }

  if (!type.validContent(node.content, attrs))
    { throw new RangeError("Invalid content for node type " + type.name) }

  return this.step(new ReplaceAroundStep(pos, pos + node.nodeSize, pos + 1, pos + node.nodeSize - 1,
                                         new Slice(Fragment.from(type.create(attrs)), 0, 0), 1, true))
}

// :: (Node, number, ?[?{type: NodeType, attrs: ?Object}]) → bool
// Check whether splitting at the given position is allowed.
function canSplit(doc, pos, depth, typesAfter) {
  if ( depth === void 0 ) depth = 1;

  var $pos = doc.resolve(pos), base = $pos.depth - depth
  if (base < 0 ||
      !$pos.parent.canReplace($pos.index(), $pos.parent.childCount) ||
      !$pos.parent.canReplace(0, $pos.indexAfter()))
    { return false }
  for (var d = $pos.depth - 1, i = depth - 1; d > base; d--, i--) {
    var node = $pos.node(d), index$1 = $pos.index(d)
    var typeAfter = typesAfter && typesAfter[i]
    if (!node.canReplace(0, index$1) ||
        !node.canReplaceWith(index$1, node.childCount, typeAfter ? typeAfter.type : $pos.node(d + 1).type,
                             typeAfter ? typeAfter.attrs : $pos.node(d + 1).attrs))
      { return false }
  }
  var index = $pos.indexAfter(base)
  var baseType = typesAfter && typesAfter[0]
  return $pos.node(base).canReplaceWith(index, index, baseType ? baseType.type : $pos.node(base + 1).type,
                                        baseType ? baseType.attrs : $pos.node(base + 1).attrs)
}
exports.canSplit = canSplit

// :: (number, ?number, ?[?{type: NodeType, attrs: ?Object}]) → Transform
// Split the node at the given position, and optionally, if `depth` is
// greater than one, any number of nodes above that. By default, the
// parts split off will inherit the node type of the original node.
// This can be changed by passing an array of types and attributes to
// use after the split.
Transform.prototype.split = function(pos, depth, typesAfter) {
  if ( depth === void 0 ) depth = 1;

  var $pos = this.doc.resolve(pos), before = Fragment.empty, after = Fragment.empty
  for (var d = $pos.depth, e = $pos.depth - depth, i = depth - 1; d > e; d--, i--) {
    before = Fragment.from($pos.node(d).copy(before))
    var typeAfter = typesAfter && typesAfter[i]
    after = Fragment.from(typeAfter ? typeAfter.type.create(typeAfter.attrs, after) : $pos.node(d).copy(after))
  }
  return this.step(new ReplaceStep(pos, pos, new Slice(before.append(after), depth, depth, true)))
}

// :: (Node, number) → bool
// Test whether the blocks before and after a given position can be
// joined.
function canJoin(doc, pos) {
  var $pos = doc.resolve(pos), index = $pos.index()
  return joinable($pos.nodeBefore, $pos.nodeAfter) &&
    $pos.parent.canReplace(index, index + 1)
}
exports.canJoin = canJoin

function joinable(a, b) {
  return a && b && !a.isLeaf && a.canAppend(b)
}

// :: (Node, number, ?number) → ?number
// Find an ancestor of the given position that can be joined to the
// block before (or after if `dir` is positive). Returns the joinable
// point, if any.
function joinPoint(doc, pos, dir) {
  if ( dir === void 0 ) dir = -1;

  var $pos = doc.resolve(pos)
  for (var d = $pos.depth;; d--) {
    var before = (void 0), after = (void 0)
    if (d == $pos.depth) {
      before = $pos.nodeBefore
      after = $pos.nodeAfter
    } else if (dir > 0) {
      before = $pos.node(d + 1)
      after = $pos.node(d).maybeChild($pos.index(d) + 1)
    } else {
      before = $pos.node(d).maybeChild($pos.index(d) - 1)
      after = $pos.node(d + 1)
    }
    if (before && !before.isTextblock && joinable(before, after)) { return pos }
    if (d == 0) { break }
    pos = dir < 0 ? $pos.before(d) : $pos.after(d)
  }
}
exports.joinPoint = joinPoint

// :: (number, ?number, ?bool) → Transform
// Join the blocks around the given position. If depth is 2, their
// last and first siblings are also joined, and so on.
Transform.prototype.join = function(pos, depth) {
  if ( depth === void 0 ) depth = 1;

  var step = new ReplaceStep(pos - depth, pos + depth, Slice.empty, true)
  return this.step(step)
}

// :: (Node, number, NodeType, ?Object) → ?number
// Try to find a point where a node of the given type can be inserted
// near `pos`, by searching up the node hierarchy when `pos` itself
// isn't a valid place but is at the start or end of a node. Return
// null if no position was found.
function insertPoint(doc, pos, nodeType, attrs) {
  var $pos = doc.resolve(pos)
  if ($pos.parent.canReplaceWith($pos.index(), $pos.index(), nodeType, attrs)) { return pos }

  if ($pos.parentOffset == 0)
    { for (var d = $pos.depth - 1; d >= 0; d--) {
      var index = $pos.index(d)
      if ($pos.node(d).canReplaceWith(index, index, nodeType, attrs)) { return $pos.before(d + 1) }
      if (index > 0) { return null }
    } }
  if ($pos.parentOffset == $pos.parent.content.size)
    { for (var d$1 = $pos.depth - 1; d$1 >= 0; d$1--) {
      var index$1 = $pos.indexAfter(d$1)
      if ($pos.node(d$1).canReplaceWith(index$1, index$1, nodeType, attrs)) { return $pos.after(d$1 + 1) }
      if (index$1 < $pos.node(d$1).childCount) { return null }
    } }
}
exports.insertPoint = insertPoint

},{"./replace_step":44,"./transform":47,"prosemirror-model":24}],47:[function(require,module,exports){
var ref = require("./map");
var Mapping = ref.Mapping;

var TransformError = (function (Error) {
  function TransformError () {
    Error.apply(this, arguments);
  }if ( Error ) TransformError.__proto__ = Error;
  TransformError.prototype = Object.create( Error && Error.prototype );
  TransformError.prototype.constructor = TransformError;

  

  return TransformError;
}(Error));
exports.TransformError = TransformError

// ::- Abstraction to build up and track such an array of
// [steps](#transform.Step).
//
// The high-level transforming methods return the `Transform` object
// itself, so that they can be chained.
var Transform = function Transform(doc) {
  // :: Node
  // The current document (the result of applying the steps in the
  // transform).
  this.doc = doc
  // :: [Step]
  // The steps in this transform.
  this.steps = []
  // :: [Node]
  // The documents before each of the steps.
  this.docs = []
  // :: Mapping
  // A mapping with the maps for each of the steps in this transform.
  this.mapping = new Mapping
};

var prototypeAccessors = { before: {} };

// :: Node The document at the start of the transformation.
prototypeAccessors.before.get = function () { return this.docs.length ? this.docs[0] : this.doc };

// :: (step: Step) → Transform
// Apply a new step in this transformation, saving the result.
// Throws an error when the step fails.
Transform.prototype.step = function step (object) {
  var result = this.maybeStep(object)
  if (result.failed) { throw new TransformError(result.failed) }
  return this
};

// :: (Step) → StepResult
// Try to apply a step in this transformation, ignoring it if it
// fails. Returns the step result.
Transform.prototype.maybeStep = function maybeStep (step) {
  var result = step.apply(this.doc)
  if (!result.failed) { this.addStep(step, result.doc) }
  return result
};

Transform.prototype.addStep = function addStep (step, doc) {
  this.docs.push(this.doc)
  this.steps.push(step)
  this.mapping.appendMap(step.getMap())
  this.doc = doc
};

Object.defineProperties( Transform.prototype, prototypeAccessors );
exports.Transform = Transform

},{"./map":40}],48:[function(require,module,exports){
var result = module.exports = {}

if (typeof navigator != "undefined") {
  var ie_upto10 = /MSIE \d/.test(navigator.userAgent)
  var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent)

  result.mac = /Mac/.test(navigator.platform)
  result.ie = ie_upto10 || !!ie_11up
  result.ie_version = ie_upto10 ? document.documentMode || 6 : ie_11up && +ie_11up[1]
  result.gecko = /gecko\/\d/i.test(navigator.userAgent)
  result.ios = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent)
  result.webkit = 'WebkitAppearance' in document.documentElement.style
}

},{}],49:[function(require,module,exports){
var ref = require("prosemirror-state");
var Selection = ref.Selection;
var NodeSelection = ref.NodeSelection;
var TextSelection = ref.TextSelection;
var browser = require("./browser")

function moveSelectionBlock(state, dir) {
  var ref = state.selection;
  var $from = ref.$from;
  var $to = ref.$to;
  var node = ref.node;
  var $side = dir > 0 ? $to : $from
  var $start = node && node.isBlock ? $side : $side.depth ? state.doc.resolve(dir > 0 ? $side.after() : $side.before()) : null
  return $start && Selection.findFrom($start, dir)
}

function apply(view, sel) {
  view.dispatch(view.state.tr.setSelection(sel).scrollIntoView())
  return true
}

function selectHorizontally(view, dir) {
  var ref = view.state.selection;
  var empty = ref.empty;
  var node = ref.node;
  var $from = ref.$from;
  var $to = ref.$to;
  if (!empty && !node) { return false }

  if (node && node.isInline)
    { return apply(view, new TextSelection(dir > 0 ? $to : $from)) }

  if (!node && !view.endOfTextblock(dir > 0 ? "right" : "left")) {
    var ref$1 = dir > 0
        ? $from.parent.childAfter($from.parentOffset)
        : $from.parent.childBefore($from.parentOffset);
    var nextNode = ref$1.node;
    var offset = ref$1.offset;
    if (nextNode && NodeSelection.isSelectable(nextNode) && offset == $from.parentOffset - (dir > 0 ? 0 : nextNode.nodeSize))
      { return apply(view, new NodeSelection(dir < 0 ? view.state.doc.resolve($from.pos - nextNode.nodeSize) : $from)) }
    return false
  }

  var next = moveSelectionBlock(view.state, dir)
  if (next && (next instanceof NodeSelection || node))
    { return apply(view, next) }

  return false
}

function nodeLen(node) {
  return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length
}

function isIgnorable(dom) {
  var desc = dom.pmViewDesc
  return desc && desc.size == 0
}

// Make sure the cursor isn't directly after one or more ignored
// nodes, which will confuse the browser's cursor motion logic.
function skipIgnoredNodesLeft(view) {
  var sel = view.root.getSelection()
  var node = sel.anchorNode, offset = sel.anchorOffset
  var moveNode, moveOffset
  for (;;) {
    if (offset > 0) {
      if (node.nodeType != 1) { break }
      var before = node.childNodes[offset - 1]
      if (isIgnorable(before)) {
        moveNode = node
        moveOffset = --offset
      }
      else { break }
    } else if (isBlockNode(node)) {
      break
    } else {
      var prev = node.previousSibling
      while (prev && isIgnorable(prev)) {
        moveNode = node.parentNode
        moveOffset = Array.prototype.indexOf.call(moveNode.childNodes, prev)
        prev = prev.previousSibling
      }
      if (!prev) {
        node = node.parentNode
        if (node == view.content) { break }
        offset = 0
      } else {
        node = prev
        offset = nodeLen(node)
      }
    }
  }
  if (moveNode) { setSel(sel, moveNode, moveOffset) }
}

// Make sure the cursor isn't directly before one or more ignored
// nodes.
function skipIgnoredNodesRight(view) {
  var sel = view.root.getSelection()
  var node = sel.anchorNode, offset = sel.anchorOffset, len = nodeLen(node)
  var moveNode, moveOffset
  for (;;) {
    if (offset < len) {
      if (node.nodeType != 1) { break }
      var after = node.childNodes[offset]
      if (isIgnorable(after)) {
        moveNode = node
        moveOffset = ++offset
      }
      else { break }
    } else if (isBlockNode(node)) {
      break
    } else {
      var next = node.nextSibling
      while (next && isIgnorable(next)) {
        moveNode = next.parentNode
        moveOffset = Array.prototype.indexOf.call(moveNode.childNodes, next) + 1
        next = next.nextSibling
      }
      if (!next) {
        node = node.parentNode
        if (node == view.content) { break }
        offset = len = 0
      } else {
        node = next
        offset = 0
        len = nodeLen(node)
      }
    }
  }
  if (moveNode) { setSel(sel, moveNode, moveOffset) }
}

function isBlockNode(dom) {
  var desc = dom.pmViewDesc
  return desc && desc.node && desc.node.isBlock
}

function setSel(sel, node, offset) {
  var range = document.createRange()
  range.setEnd(node, offset)
  range.setStart(node, offset)
  sel.removeAllRanges()
  sel.addRange(range)
}

// : (EditorState, number)
// Check whether vertical selection motion would involve node
// selections. If so, apply it (if not, the result is left to the
// browser)
function selectVertically(view, dir) {
  var ref = view.state.selection;
  var empty = ref.empty;
  var node = ref.node;
  var $from = ref.$from;
  var $to = ref.$to;
  if (!empty && !node) { return false }

  var leavingTextblock = true, $start = dir < 0 ? $from : $to
  if (!node || node.isInline)
    { leavingTextblock = view.endOfTextblock(dir < 0 ? "up" : "down") }

  if (leavingTextblock) {
    var next = moveSelectionBlock(view.state, dir)
    if (next && (next instanceof NodeSelection))
      { return apply(view, next) }
  }

  if (!node || node.isInline) { return false }

  var beyond = Selection.findFrom($start, dir)
  return beyond ? apply(view, beyond) : true
}

function stopNativeHorizontalDelete(view, dir) {
  var ref = view.state.selection;
  var $head = ref.$head;
  var $anchor = ref.$anchor;
  var empty = ref.empty;
  if (!$head || !$head.sameParent($anchor) || !$head.parent.isTextblock) { return true }
  if (!empty) { return false }
  if (view.endOfTextblock(dir > 0 ? "forward" : "backward")) { return true }
  var nextNode = !$head.textOffset && (dir < 0 ? $head.nodeBefore : $head.nodeAfter)
  if (nextNode && !nextNode.isText) {
    var tr = view.state.tr
    if (dir < 0) { tr.delete($head.pos - nextNode.nodeSize, $head.pos) }
    else { tr.delete($head.pos, $head.pos + nextNode.nodeSize) }
    view.dispatch(tr)
    return true
  }
  return false
}

// A backdrop keymap used to make sure we always suppress keys that
// have a dangerous default effect, even if the commands they are
// bound to return false, and to make sure that cursor-motion keys
// find a cursor (as opposed to a node selection) when pressed. For
// cursor-motion keys, the code in the handlers also takes care of
// block selections.

function captureKeyDown(view, event) {
  var code = event.keyCode, mod = browser.mac ? event.metaKey : event.ctrlKey
  if (code == 8) { // Backspace
    return stopNativeHorizontalDelete(view, -1) || skipIgnoredNodesLeft(view)
  } else if (code == 46) { // Delete
    return stopNativeHorizontalDelete(view, 1) || skipIgnoredNodesRight(view)
  } else if (code == 13 || code == 27) { // Enter, Esc
    return true
  } else if (code == 37) { // Left arrow
    return selectHorizontally(view, -1) || skipIgnoredNodesLeft(view)
  } else if (code == 39) { // Right arrow
    return selectHorizontally(view, 1) || skipIgnoredNodesRight(view)
  } else if (code == 38) { // Up arrow
    return selectVertically(view, -1)
  } else if (code == 40) { // Down arrow
    return selectVertically(view, 1)
  } else if (mod && !event.altKey && !event.shiftKey) { // Mod-
    if (code == 66 || code == 73 || code == 89 || code == 90) // Mod-[biyz]
      { return true }
    if (browser.mac && code == 68) // Mod-d
      { return stopNativeHorizontalDelete(view, 1) || skipIgnoredNodesRight(view) }
    if (browser.mac && code == 72) // Mod-h
      { return stopNativeHorizontalDelete(view, -1) || skipIgnoredNodesLeft(view) }
  } else if (browser.mac && code == 68 && event.altKey && !mod && !event.shiftKey) { // Alt-d
    return stopNativeHorizontalDelete(view, 1) || skipIgnoredNodesRight(view)
  }
  return false
}
exports.captureKeyDown = captureKeyDown

},{"./browser":48,"prosemirror-state":34}],50:[function(require,module,exports){
var ref = require("prosemirror-model");
var Slice = ref.Slice;
var Fragment = ref.Fragment;
var DOMParser = ref.DOMParser;
var DOMSerializer = ref.DOMSerializer;

// : (EditorView, Selection, dom.DataTransfer) → Slice
// Store the content of a selection in the clipboard (or whatever the
// given data transfer refers to)
function toClipboard(view, range, dataTransfer) {
  // Node selections are copied using just the node, text selection include parents
  var doc = view.state.doc, fullSlice = doc.slice(range.from, range.to, !range.node)
  var slice = fullSlice, context
  if (!range.node) {
    // Shrink slices for non-node selections to hold only the parent
    // node, store rest in context string, so that other tools don't
    // get confused
    var cut = Math.max(0, range.$from.sharedDepth(range.to) - 1)
    context = sliceContext(slice, cut)
    var content = slice.content
    for (var i = 0; i < cut; i++) { content = content.firstChild.content }
    slice = new Slice(content, slice.openLeft - cut, slice.openRight - cut)
  }

  var serializer = view.someProp("clipboardSerializer") || DOMSerializer.fromSchema(view.state.schema)
  var dom = serializer.serializeFragment(slice.content), wrap = document.createElement("div")
  wrap.appendChild(dom)
  var child = wrap.firstChild.nodeType == 1 && wrap.firstChild
  if (child) {
    if (range.node)
      { child.setAttribute("data-pm-node-selection", true) }
    else
      { child.setAttribute("data-pm-context", context) }
  }

  dataTransfer.clearData()
  dataTransfer.setData("text/html", wrap.innerHTML)
  dataTransfer.setData("text/plain", slice.content.textBetween(0, slice.content.size, "\n\n"))
  return fullSlice
}
exports.toClipboard = toClipboard

var cachedCanUpdateClipboard = null
function canUpdateClipboard(dataTransfer) {
  if (cachedCanUpdateClipboard != null) { return cachedCanUpdateClipboard }
  dataTransfer.setData("text/html", "<hr>")
  return cachedCanUpdateClipboard = dataTransfer.getData("text/html") == "<hr>"
}
exports.canUpdateClipboard = canUpdateClipboard

// : (EditorView, dom.DataTransfer, ?bool, ResolvedPos) → ?Slice
// Read a slice of content from the clipboard (or drop data).
function fromClipboard(view, dataTransfer, plainText, $context) {
  var txt = dataTransfer.getData("text/plain")
  var html = dataTransfer.getData("text/html")
  if (!html && !txt) { return null }
  var dom, inCode = $context.parent.type.spec.code
  if ((plainText || inCode || !html) && txt) {
    view.someProp("transformPastedText", function (f) { return txt = f(txt); })
    if (inCode) { return new Slice(Fragment.from(view.state.schema.text(txt)), 0, 0) }
    dom = document.createElement("div")
    txt.split(/(?:\r\n?|\n)+/).forEach(function (block) {
      dom.appendChild(document.createElement("p")).textContent = block
    })
  } else {
    view.someProp("transformPastedHTML", function (f) { return html = f(html); })
    dom = readHTML(html)
  }

  var parser = view.someProp("clipboardParser") || view.someProp("domParser") || DOMParser.fromSchema(view.state.schema)
  var slice = parser.parseSlice(dom, {preserveWhitespace: true}), context
  if (dom.querySelector("[data-pm-node-selection]"))
    { slice = new Slice(slice.content, 0, 0) }
  else if (context = dom.querySelector("[data-pm-context]"))
    { slice = addContext(slice, context.getAttribute("data-pm-context")) }
  else // HTML wasn't created by ProseMirror. Make sure top-level siblings are coherent
    { slice = normalizeSiblings(slice, $context) }
  return slice
}
exports.fromClipboard = fromClipboard

// Takes a slice parsed with parseSlice, which means there hasn't been
// any content-expression checking done on the top nodes, tries to
// find a parent node in the current context that might fit the nodes,
// and if successful, rebuilds the slice so that it fits into that parent.
//
// This addresses the problem that Transform.replace expects a
// coherent slice, and will fail to place a set of siblings that don't
// fit anywhere in the schema.
function normalizeSiblings(slice, $context) {
  if (slice.content.childCount < 2) { return slice }
  var loop = function ( d ) {
    var parent = $context.node(d)
    var match = parent.contentMatchAt($context.index(d))
    var lastWrap = (void 0), result = []
    slice.content.forEach(function (node) {
      if (!result) { return }
      var wrap = match.findWrappingFor(node), inLast
      if (!wrap) { return result = null }
      if (inLast = result.length && lastWrap.length && addToSibling(wrap, lastWrap, node, result[result.length - 1], 0)) {
        result[result.length - 1] = inLast
      } else {
        if (result.length) { result[result.length - 1] = closeRight(result[result.length - 1], lastWrap.length) }
        var wrapped = withWrappers(node, wrap)
        result.push(wrapped)
        match = match.matchType(wrapped.type, wrapped.attrs)
        lastWrap = wrap
      }
    })
    if (result) { return { v: Slice.maxOpen(Fragment.from(result)) } }
  };

  for (var d = $context.depth; d >= 0; d--) {
    var returned = loop( d );

    if ( returned ) return returned.v;
  }
  return slice
}

function withWrappers(node, wrap, from) {
  if ( from === void 0 ) from = 0;

  for (var i = wrap.length - 1; i >= from; i--)
    { node = wrap[i].type.create(wrap[i].attrs, Fragment.from(node)) }
  return node
}

// Used to group adjacent nodes wrapped in similar parents by
// normalizeSiblings into the same parent node
function addToSibling(wrap, lastWrap, node, sibling, depth) {
  if (depth < wrap.length && depth < lastWrap.length && wrap[depth].type == lastWrap[depth].type) {
    var inner = addToSibling(wrap, lastWrap, node, sibling.lastChild, depth + 1)
    if (inner) { return sibling.copy(sibling.content.replaceChild(sibling.childCount - 1, inner)) }
    var match = sibling.contentMatchAt(sibling.childCount)
    if (depth == wrap.length - 1 ? match.matchNode(node) : match.matchType(wrap[depth + 1].type, wrap[depth + 1].attrs))
      { return sibling.copy(sibling.content.append(Fragment.from(withWrappers(node, wrap, depth + 1)))) }
  }
}

function closeRight(node, depth) {
  if (depth == 0) { return node }
  var fragment = node.content.replaceChild(node.childCount - 1, closeRight(node.lastChild, depth - 1))
  var fill = node.contentMatchAt(node.childCount).fillBefore(Fragment.empty, true)
  return node.copy(fragment.append(fill))
}

// Trick from jQuery -- some elements must be wrapped in other
// elements for innerHTML to work. I.e. if you do `div.innerHTML =
// "<td>..</td>"` the table cells are ignored.
var wrapMap = {thead: "table", colgroup: "table", col: "table colgroup",
                 tr: "table tbody", td: "table tbody tr", th: "table tbody tr"}
var detachedDoc = null
function readHTML(html) {
  var metas = /(\s*<meta [^>]*>)*/.exec(html)
  if (metas) { html = html.slice(metas[0].length) }
  var doc = detachedDoc || (detachedDoc = document.implementation.createHTMLDocument("title"))
  var elt = doc.createElement("div")
  var firstTag = /(?:<meta [^>]*>)*<([a-z][^>\s]+)/i.exec(html), wrap, depth = 0
  if (wrap = firstTag && wrapMap[firstTag[1].toLowerCase()]) {
    var nodes = wrap.split(" ")
    html = nodes.map(function (n) { return "<" + n + ">"; }).join("") + html + nodes.map(function (n) { return "</" + n + ">"; }).reverse().join("")
    depth = nodes.length
  }
  elt.innerHTML = html
  for (var i = 0; i < depth; i++) { elt = elt.firstChild }
  return elt
}

function sliceContext(slice, depth) {
  var result = [], content = slice.content
  for (var i = 0; i < depth; i++) {
    var node = content.firstChild
    result.push(node.type.name, node.type.hasRequiredAttrs() ? node.attrs : null)
    content = node.content
  }
  return JSON.stringify(result)
}

function addContext(slice, context) {
  if (!slice.size) { return slice }
  var schema = slice.content.firstChild.type.schema, array
  try { array = JSON.parse(context) }
  catch(e) { return slice }
  var content = slice.content;
  var openLeft = slice.openLeft;
  var openRight = slice.openRight;
  for (var i = array.length - 2; i >= 0; i -= 2) {
    var type = schema.nodes[array[i]]
    if (!type || type.hasRequiredAttrs()) { break }
    content = Fragment.from(type.create(array[i + 1], content))
    openLeft++; openRight++
  }
  return new Slice(content, openLeft, openRight)
}

},{"prosemirror-model":24}],51:[function(require,module,exports){
function compareObjs(a, b) {
  if (a == b) { return true }
  for (var p in a) { if (a[p] !== b[p]) { return false } }
  for (var p$1 in b) { if (!(p$1 in a)) { return false } }
  return true
}

var WidgetType = function(widget, options) {
  if (widget.nodeType != 1) {
    var wrap = document.createElement("span")
    wrap.appendChild(widget)
    widget = wrap
  }
  widget.contentEditable = false
  widget.classList.add("ProseMirror-widget")
  this.widget = widget
  this.options = options || noOptions
};

WidgetType.prototype.map = function (mapping, span, offset, oldOffset) {
  var ref = mapping.mapResult(span.from + oldOffset, this.options.associative == "left" ? -1 : 1);
    var pos = ref.pos;
    var deleted = ref.deleted;
  return deleted ? null : new Decoration(pos - offset, pos - offset, this)
};

WidgetType.prototype.valid = function () { return true };

WidgetType.prototype.eq = function (other) {
  return this == other ||
    (other instanceof WidgetType && (this.widget == other.widget || this.options.key) &&
     compareObjs(this.options, other.options))
};

var InlineType = function(attrs, options) {
  this.options = options || noOptions
  this.attrs = attrs
};

InlineType.prototype.map = function (mapping, span, offset, oldOffset) {
  var from = mapping.map(span.from + oldOffset, this.options.inclusiveLeft ? -1 : 1) - offset
  var to = mapping.map(span.to + oldOffset, this.options.inclusiveRight ? 1 : -1) - offset
  return from >= to ? null : new Decoration(from, to, this)
};

InlineType.prototype.valid = function (_, span) { return span.from < span.to };

InlineType.prototype.eq = function (other) {
  return this == other ||
    (other instanceof InlineType && compareObjs(this.attrs, other.attrs) &&
     compareObjs(this.options, other.options))
};

InlineType.is = function (span) { return span.type instanceof InlineType };

var NodeType = function(attrs, options) {
  this.attrs = attrs
  this.options = options || noOptions
};

NodeType.prototype.map = function (mapping, span, offset, oldOffset) {
  var from = mapping.mapResult(span.from + oldOffset, 1)
  if (from.deleted) { return null }
  var to = mapping.mapResult(span.to + oldOffset, -1)
  if (to.deleted || to.pos <= from.pos) { return null }
  return new Decoration(from.pos - offset, to.pos - offset, this)
};

NodeType.prototype.valid = function (node, span) {
  var ref = node.content.findIndex(span.from);
    var index = ref.index;
    var offset = ref.offset;
  return offset == span.from && offset + node.child(index).nodeSize == span.to
};

NodeType.prototype.eq = function (other) {
  return this == other ||
    (other instanceof NodeType && compareObjs(this.attrs, other.attrs) &&
     compareObjs(this.options, other.options))
};

// ::- Decorations can be provided to the view (through the
// [`decorations` prop](#view.EditorProps.decorations)) to adjust the
// way the document is drawn. They come in several variants. See the
// static members of this class for details.
var Decoration = function(from, to, type) {
  this.from = from
  this.to = to
  this.type = type
};

var prototypeAccessors = { options: {} };

Decoration.prototype.copy = function (from, to) {
  return new Decoration(from, to, this.type)
};

Decoration.prototype.eq = function (other) {
  return this.type.eq(other.type) && this.from == other.from && this.to == other.to
};

Decoration.prototype.map = function (mapping, offset, oldOffset) {
  return this.type.map(mapping, this, offset, oldOffset)
};

// :: (number, dom.Node, ?Object) → Decoration
// Creates a widget decoration, which is a DOM node that's shown in
// the document at the given position.
//
// options::- These options are supported:
//
//   associative:: ?string
//   By default, widgets are right-associative, meaning they end
//   up to the right of content inserted at their position. You
//   can set this to `"left"` to make it left-associative, so that
//   the inserted content will end up after the widget.
//
//   stopEvent:: ?(event: dom.Event) → bool
//   Can be used to control which DOM events, when they bubble out
//   of this widget, the editor view should ignore.
//
//   key:: ?string
//   When comparing decorations of this type (in order to decide
//   whether it needs to be redrawn), ProseMirror will by default
//   compare the widget DOM node by identity. If you pass a key,
//   that key will be compared instead, which can be useful when
//   you generate decorations on the fly and don't want to store
//   and reuse DOM nodes.
Decoration.widget = function (pos, dom, options) {
  return new Decoration(pos, pos, new WidgetType(dom, options))
};

// :: (number, number, DecorationAttrs, ?Object) → Decoration
// Creates an inline decoration, which adds the given attributes to
// each inline node between `from` and `to`.
//
// options::- These options are recognized:
//
//   inclusiveLeft:: ?bool
//   Determines how the left side of the decoration is
//   [mapped](#transform.Position_Mapping) when content is
//   inserted directly at that positon. By default, the decoration
//   won't include the new content, but you can set this to `true`
//   to make it inclusive.
//
//   inclusiveRight:: ?bool
//   Determines how the right side of the decoration is mapped.
//   See
//   [`inclusiveLeft`](#view.Decoration^inline^options.inclusiveLeft).
Decoration.inline = function (from, to, attrs, options) {
  return new Decoration(from, to, new InlineType(attrs, options))
};

// :: (number, number, DecorationAttrs, ?Object) → Decoration
// Creates a node decoration. `from` and `to` should point precisely
// before and after a node in the document. That node, and only that
// node, will receive the given attributes.
Decoration.node = function (from, to, attrs, options) {
  return new Decoration(from, to, new NodeType(attrs, options))
};

// :: Object
// The options provided when creating this decoration. Can be useful
// if you've stored extra information in that object.
prototypeAccessors.options.get = function () { return this.type.options };

Object.defineProperties( Decoration.prototype, prototypeAccessors );
exports.Decoration = Decoration

// DecorationAttrs:: interface
// A set of attributes to add to a decorated node. Most properties
// simply directly correspond to DOM attributes of the same name,
// which will be set to the property's value. These are exceptions:
//
//   class:: ?string
//   A CSS class name or a space-separated set of class names to be
//   _added_ to the classes that the node already had.
//
//   style:: ?string
//   A string of CSS to be _added_ to the node's existing `style` property.
//
//   nodeName:: ?string
//   When non-null, the target node is wrapped in a DOM element of
//   this type (and the other attributes are applied to this element).

var none = [], noOptions = {}

// ::- A collection of [decorations](#view.Decoration), organized in
// such a way that the drawing algorithm can efficiently use and
// compare them. This is a persistent data structure—it is not
// modified, updates create a new value.
var DecorationSet = function(local, children) {
  this.local = local && local.length ? local : none
  this.children = children && children.length ? children : none
};

// :: (Node, [Decoration]) → DecorationSet
// Create a set of decorations, using the structure of the given
// document.
DecorationSet.create = function (doc, decorations) {
  return decorations.length ? buildTree(decorations, doc, 0, noOptions) : empty
};

// :: (?number, ?number) → [Decoration]
// Find all decorations in this set which touch the given range
// (including decorations that start or end directly at the
// boundaries). When the arguments are omitted, all decorations in
// the set are collected.
DecorationSet.prototype.find = function (start, end) {
  var result = []
  this.findInner(start == null ? 0 : start, end == null ? 1e9 : end, result, 0)
  return result
};

DecorationSet.prototype.findInner = function (start, end, result, offset) {
    var this$1 = this;

  for (var i = 0; i < this.local.length; i++) {
    var span = this$1.local[i]
    if (span.from <= end && span.to >= start)
      { result.push(span.copy(span.from + offset, span.to + offset)) }
  }
  for (var i$1 = 0; i$1 < this.children.length; i$1 += 3) {
    if (this$1.children[i$1] < end && this$1.children[i$1 + 1] > start) {
      var childOff = this$1.children[i$1] + 1
      this$1.children[i$1 + 2].findInner(start - childOff, end - childOff, result, offset + childOff)
    }
  }
};

// :: (Mapping, Node, ?Object) → DecorationSet
// Map the set of decorations in response to a change in the
// document.
//
// options::- An optional set of options.
//
//   onRemove:: ?(decorationOptions: Object)
//   When given, this function will be called for each decoration
//   that gets dropped as a result of the mapping, passing the
//   options of that decoration.
DecorationSet.prototype.map = function (mapping, doc, options) {
  if (this == empty || mapping.maps.length == 0) { return this }
  return this.mapInner(mapping, doc, 0, 0, options || noOptions)
};

DecorationSet.prototype.mapInner = function (mapping, node, offset, oldOffset, options) {
    var this$1 = this;

  var newLocal
  for (var i = 0; i < this.local.length; i++) {
    var mapped = this$1.local[i].map(mapping, offset, oldOffset)
    if (mapped && mapped.type.valid(node, mapped)) { (newLocal || (newLocal = [])).push(mapped) }
    else if (options.onRemove) { options.onRemove(this$1.local[i].options) }
  }

  if (this.children.length)
    { return mapChildren(this.children, newLocal, mapping, node, offset, oldOffset, options) }
  else
    { return newLocal ? new DecorationSet(newLocal.sort(byPos)) : empty }
};

// :: (Node, [Decoration]) → DecorationSet
// Add the given array of decorations to the ones in the set,
// producing a new set. Needs access to the current document to
// create the appropriate tree structure.
DecorationSet.prototype.add = function (doc, decorations) {
  if (!decorations.length) { return this }
  if (this == empty) { return DecorationSet.create(doc, decorations) }
  return this.addInner(doc, decorations, 0)
};

DecorationSet.prototype.addInner = function (doc, decorations, offset) {
    var this$1 = this;

  var children, childIndex = 0
  doc.forEach(function (childNode, childOffset) {
    var baseOffset = childOffset + offset, found
    if (!(found = takeSpansForNode(decorations, childNode, baseOffset))) { return }

    if (!children) { children = this$1.children.slice() }
    while (childIndex < children.length && children[childIndex] < childOffset) { childIndex += 3 }
    if (children[childIndex] == childOffset)
      { children[childIndex + 2] = children[childIndex + 2].addInner(childNode, found, baseOffset + 1) }
    else
      { children.splice(childIndex, 0, childOffset, childOffset + childNode.nodeSize, buildTree(found, childNode, baseOffset + 1, noOptions)) }
    childIndex += 3
  })

  var local = moveSpans(childIndex ? withoutNulls(decorations) : decorations, -offset)
  return new DecorationSet(local.length ? this.local.concat(local).sort(byPos) : this.local,
                           children || this.children)
};

// :: ([Decoration]) → DecorationSet
// Create a new set that contains the decorations in this set, minus
// the ones in the given array.
DecorationSet.prototype.remove = function (decorations) {
  if (decorations.length == 0 || this == empty) { return this }
  return this.removeInner(decorations, 0)
};

DecorationSet.prototype.removeInner = function (decorations, offset) {
    var this$1 = this;

  var children = this.children, local = this.local
  for (var i = 0; i < children.length; i += 3) {
    var found = (void 0), from = children[i] + offset, to = children[i + 1] + offset
    for (var j = 0, span = (void 0); j < decorations.length; j++) { if (span = decorations[j]) {
      if (span.from > from && span.to < to) {
        decorations[j] = null
        ;(found || (found = [])).push(span)
      }
    } }
    if (!found) { continue }
    if (children == this$1.children) { children = this$1.children.slice() }
    var removed = children[i + 2].removeInner(found, from + 1)
    if (removed != empty) {
      children[i + 2] = removed
    } else {
      children.splice(i, 3)
      i -= 3
    }
  }
  if (local.length) { for (var i$1 = 0, span$1 = (void 0); i$1 < decorations.length; i$1++) { if (span$1 = decorations[i$1]) {
    for (var j$1 = 0; j$1 < local.length; j$1++) { if (local[j$1].type == span$1.type) {
      if (local == this$1.local) { local = this$1.local.slice() }
      local.splice(j$1--, 1)
    } }
  } } }
  if (children == this.children && local == this.local) { return this }
  return local.length || children.length ? new DecorationSet(local, children) : empty
};

DecorationSet.prototype.forChild = function (offset, node) {
    var this$1 = this;

  if (this == empty) { return this }
  if (node.isLeaf) { return DecorationSet.empty }

  var child, local
  for (var i = 0; i < this.children.length; i += 3) { if (this$1.children[i] >= offset) {
    if (this$1.children[i] == offset) { child = this$1.children[i + 2] }
    break
  } }
  var start = offset + 1, end = start + node.content.size
  for (var i$1 = 0; i$1 < this.local.length; i$1++) {
    var dec = this$1.local[i$1]
    if (dec.from < end && dec.to > start && (dec.type instanceof InlineType)) {
      var from = Math.max(start, dec.from) - start, to = Math.min(end, dec.to) - start
      if (from < to) { (local || (local = [])).push(dec.copy(from, to)) }
    }
  }
  if (local) {
    var localSet = new DecorationSet(local)
    return child ? new DecorationGroup([localSet, child]) : localSet
  }
  return child || empty
};

DecorationSet.prototype.eq = function (other) {
    var this$1 = this;

  if (this == other) { return true }
  if (!(other instanceof DecorationSet) ||
      this.local.length != other.local.length ||
      this.children.length != other.children.length) { return false }
  for (var i = 0; i < this.local.length; i++)
    { if (!this$1.local[i].eq(other.local[i])) { return false } }
  for (var i$1 = 0; i$1 < this.children.length; i$1 += 3)
    { if (this$1.children[i$1] != other.children[i$1] ||
        this$1.children[i$1 + 1] != other.children[i$1 + 1] ||
        !this$1.children[i$1 + 2].eq(other.children[i$1 + 2])) { return false } }
  return false
};

DecorationSet.prototype.locals = function (node) {
  return removeOverlap(this.localsInner(node))
};

DecorationSet.prototype.localsInner = function (node) {
    var this$1 = this;

  if (this == empty) { return none }
  if (node.isTextblock || !this.local.some(InlineType.is)) { return this.local }
  var result = []
  for (var i = 0; i < this.local.length; i++) {
    if (!(this$1.local[i].type instanceof InlineType))
      { result.push(this$1.local[i]) }
  }
  return result
};
exports.DecorationSet = DecorationSet

var empty = new DecorationSet()

// :: DecorationSet
// The empty set of decorations.
DecorationSet.empty = empty

var DecorationGroup = function(members) {
  this.members = members
};

DecorationGroup.prototype.forChild = function (offset, child) {
    var this$1 = this;

  if (child.isLeaf) { return DecorationSet.empty }
  var found = []
  for (var i = 0; i < this.members.length; i++) {
    var result = this$1.members[i].forChild(offset, child)
    if (result == empty) { continue }
    if (result instanceof DecorationGroup) { found = found.concat(result.members) }
    else { found.push(result) }
  }
  return DecorationGroup.from(found)
};

DecorationGroup.prototype.eq = function (other) {
    var this$1 = this;

  if (!(other instanceof DecorationGroup) ||
      other.members.length != this.members.length) { return false }
  for (var i = 0; i < this.members.length; i++)
    { if (!this$1.members[i].eq(other.members[i])) { return false } }
  return true
};

DecorationGroup.prototype.locals = function (node) {
    var this$1 = this;

  var result, sorted = true
  for (var i = 0; i < this.members.length; i++) {
    var locals = this$1.members[i].localsInner(node)
    if (!locals.length) { continue }
    if (!result) {
      result = locals
    } else {
      if (sorted) {
        result = result.slice()
        sorted = false
      }
      for (var j = 0; j < locals.length; j++) { result.push(locals[j]) }
    }
  }
  return result ? removeOverlap(sorted ? result : result.sort(byPos)) : none
};

DecorationGroup.from = function (members) {
  switch (members.length) {
    case 0: return empty
    case 1: return members[0]
    default: return new DecorationGroup(members)
  }
};
exports.DecorationGroup = DecorationGroup

function mapChildren(oldChildren, newLocal, mapping, node, offset, oldOffset, options) {
  var children = oldChildren.slice()

  // Mark the children that are directly touched by changes, and
  // move those that are after the changes.
  var shift = function (oldStart, oldEnd, newStart, newEnd) {
    for (var i = 0; i < children.length; i += 3) {
      var end = children[i + 1], dSize = (void 0)
      if (end == -1 || oldStart > end + oldOffset) { continue }
      if (oldEnd >= children[i] + oldOffset) {
        children[i + 1] = -1
      } else if (dSize = (newEnd - newStart) - (oldEnd - oldStart)) {
        children[i] += dSize
        children[i + 1] += dSize
      }
    }
  }
  for (var i = 0; i < mapping.maps.length; i++) { mapping.maps[i].forEach(shift) }

  // Find the child nodes that still correspond to a single node,
  // recursively call mapInner on them and update their positions.
  var mustRebuild = false
  for (var i$1 = 0; i$1 < children.length; i$1 += 3) { if (children[i$1 + 1] == -1) { // Touched nodes
    var from = mapping.map(children[i$1] + oldOffset), fromLocal = from - offset
    if (fromLocal < 0 || fromLocal >= node.content.size) {
      mustRebuild = true
      continue
    }
    // Must read oldChildren because children was tagged with -1
    var to = mapping.map(oldChildren[i$1 + 1] + oldOffset, -1), toLocal = to - offset
    var ref = node.content.findIndex(fromLocal);
    var index = ref.index;
    var childOffset = ref.offset;
    var childNode = node.maybeChild(index)
    if (childNode && childOffset == fromLocal && childOffset + childNode.nodeSize == toLocal) {
      var mapped = children[i$1 + 2].mapInner(mapping, childNode, from + 1, children[i$1] + oldOffset + 1, options)
      if (mapped != empty) {
        children[i$1] = fromLocal
        children[i$1 + 1] = toLocal
        children[i$1 + 2] = mapped
      } else {
        children.splice(i$1, 3)
        i$1 -= 3
      }
    } else {
      mustRebuild = true
    }
  } }

  // Remaining children must be collected and rebuilt into the appropriate structure
  if (mustRebuild) {
    var decorations = mapAndGatherRemainingDecorations(children, newLocal ? moveSpans(newLocal, offset) : [], mapping, oldOffset, options)
    var built = buildTree(decorations, node, 0, options)
    newLocal = built.local
    for (var i$2 = 0; i$2 < children.length; i$2 += 3) { if (children[i$2 + 1] == -1) {
      children.splice(i$2, 3)
      i$2 -= 3
    } }
    for (var i$3 = 0, j = 0; i$3 < built.children.length; i$3 += 3) {
      var from$1 = built.children[i$3]
      while (j < children.length && children[j] < from$1) { j += 3 }
      children.splice(j, 0, built.children[i$3], built.children[i$3 + 1], built.children[i$3 + 2])
    }
  }

  return new DecorationSet(newLocal && newLocal.sort(byPos), children)
}

function moveSpans(spans, offset) {
  if (!offset || !spans.length) { return spans }
  var result = []
  for (var i = 0; i < spans.length; i++) {
    var span = spans[i]
    result.push(new Decoration(span.from + offset, span.to + offset, span.type))
  }
  return result
}

function mapAndGatherRemainingDecorations(children, decorations, mapping, oldOffset, options) {
  // Gather all decorations from the remaining marked children
  function gather(set, oldOffset) {
    for (var i = 0; i < set.local.length; i++) {
      var mapped = set.local[i].map(mapping, 0, oldOffset)
      if (mapped) { decorations.push(mapped) }
      else if (options.onRemove) { options.onRemove(set.local[i].options) }
    }
    for (var i$1 = 0; i$1 < set.children.length; i$1 += 3)
      { gather(set.children[i$1 + 2], set.children[i$1] + oldOffset + 1) }
  }
  for (var i = 0; i < children.length; i += 3) { if (children[i + 1] == -1)
    { gather(children[i + 2], children[i] + oldOffset + 1) } }

  return decorations
}

function takeSpansForNode(spans, node, offset) {
  if (node.isLeaf) { return null }
  var end = offset + node.nodeSize, found = null
  for (var i = 0, span = (void 0); i < spans.length; i++) {
    if ((span = spans[i]) && span.from > offset && span.to < end) {
      ;(found || (found = [])).push(span)
      spans[i] = null
    }
  }
  return found
}

function withoutNulls(array) {
  var result = []
  for (var i = 0; i < array.length; i++)
    { if (array[i] != null) { result.push(array[i]) } }
  return result
}

// : ([Decoration], Node, number) → DecorationSet
// Build up a tree that corresponds to a set of decorations. `offset`
// is a base offset that should be subtractet from the `from` and `to`
// positions in the spans (so that we don't have to allocate new spans
// for recursive calls).
function buildTree(spans, node, offset, options) {
  var children = [], hasNulls = false
  node.forEach(function (childNode, localStart) {
    var found = takeSpansForNode(spans, childNode, localStart + offset)
    if (found) {
      hasNulls = true
      var subtree = buildTree(found, childNode, offset + localStart + 1, options)
      if (subtree != empty)
        { children.push(localStart, localStart + childNode.nodeSize, subtree) }
    }
  })
  var locals = moveSpans(hasNulls ? withoutNulls(spans) : spans, -offset).sort(byPos)
  for (var i = 0; i < locals.length; i++) { if (!locals[i].type.valid(node, locals[i])) {
    if (options.onRemove) { options.onRemove(locals[i].options) }
    locals.splice(i--, 1)
  } }
  return locals.length || children.length ? new DecorationSet(locals, children) : empty
}

// : (Decoration, Decoration) → number
// Used to sort decorations so that ones with a low start position
// come first, and within a set with the same start position, those
// with an smaller end position come first.
function byPos(a, b) {
  return a.from - b.from || a.to - b.to
}

// : ([Decoration]) → [Decorations]
// Scan a sorted array of decorations for partially overlapping spans,
// and split those so that only fully overlapping spans are left (to
// make subsequent rendering easier). Will return the input array if
// no partially overlapping spans are found (the common case).
function removeOverlap(spans) {
  var working = spans
  for (var i = 0; i < working.length - 1; i++) {
    var span = working[i]
    if (span.from != span.to) { for (var j = i + 1; j < working.length; j++) {
      var next = working[j]
      if (next.from == span.from) {
        if (next.to != span.to) {
          if (working == spans) { working = spans.slice() }
          // Followed by a partially overlapping larger span. Split that
          // span.
          working[j] = next.copy(next.from, span.to)
          insertAhead(working, j + 1, next.copy(span.to, next.to))
        }
        continue
      } else {
        if (next.from < span.to) {
          if (working == spans) { working = spans.slice() }
          // The end of this one overlaps with a subsequent span. Split
          // this one.
          working[i] = span.copy(span.from, next.from)
          insertAhead(working, j, span.copy(next.from, span.to))
        }
        break
      }
    } }
  }
  return working
}
exports.removeOverlap = removeOverlap

function insertAhead(array, i, deco) {
  while (i < array.length && byPos(deco, array[i]) > 0) { i++ }
  array.splice(i, 0, deco)
}

// : (EditorView) → union<DecorationSet, DecorationGroup>
// Get the decorations associated with the current props of a view.
function viewDecorations(view) {
  var found = []
  view.someProp("decorations", function (f) {
    var result = f(view.state)
    if (result && result != empty) { found.push(result) }
  })
  return DecorationGroup.from(found)
}
exports.viewDecorations = viewDecorations

},{}],52:[function(require,module,exports){
var ref = require("prosemirror-model");
var Fragment = ref.Fragment;
var DOMParser = ref.DOMParser;
var ref$1 = require("prosemirror-state");
var Selection = ref$1.Selection;

var ref$2 = require("./trackmappings");
var TrackMappings = ref$2.TrackMappings;

var DOMChange = function(view, id, composing) {
  var this$1 = this;

  this.view = view
  this.id = id
  this.state = view.state
  this.composing = composing
  this.from = this.to = null
  this.timeout = composing ? null : setTimeout(function () { return this$1.finish(); }, 20)
  this.mappings = new TrackMappings(view.state)
};

DOMChange.prototype.addRange = function (from, to) {
  if (this.from == null) {
    this.from = from
    this.to = to
  } else {
    this.from = Math.min(from, this.from)
    this.to = Math.max(to, this.to)
  }
};

DOMChange.prototype.changedRange = function () {
  if (this.from == null) { return rangeAroundSelection(this.state.selection) }
  var $from = this.state.doc.resolve(Math.min(this.from, this.state.selection.from)), $to = this.state.doc.resolve(this.to)
  var shared = $from.sharedDepth(this.to)
  return {from: $from.before(shared + 1), to: $to.after(shared + 1)}
};

DOMChange.prototype.finish = function (force) {
  clearTimeout(this.timeout)
  if (this.composing && !force) { return }
  var range = this.changedRange()
  if (this.from == null) { this.view.docView.markDirty(range.from, range.to) }
  else { this.view.docView.markDirty(this.from, this.to) }

  // If there have been changes since this DOM update started, we must
  // map our start and end positions, as well as the new selection
  // positions, through them.
  var mapping = this.mappings.getMapping(this.view.state)
  this.destroy()
  if (mapping) { readDOMChange(this.view, mapping, this.state, range) }

  // If the reading didn't result in a view update, force one by
  // resetting the view to its current state.
  if (this.view.docView.dirty) { this.view.updateState(this.view.state) }
};

DOMChange.prototype.destroy = function () {
  this.mappings.destroy()
  this.view.inDOMChange = null
};

DOMChange.prototype.compositionEnd = function () {
    var this$1 = this;

  if (this.composing) {
    this.composing = false
    this.timeout = setTimeout(function () { return this$1.finish(); }, 50)
  }
};

DOMChange.start = function (view, composing) {
  if (view.inDOMChange) {
    if (composing) {
      clearTimeout(view.inDOMChange.timeout)
      view.inDOMChange.composing = true
    }
  } else {
    var id = Math.floor(Math.random() * 0xffffffff)
    view.inDOMChange = new DOMChange(view, id, composing)
  }
};
exports.DOMChange = DOMChange

// Note that all referencing and parsing is done with the
// start-of-operation selection and document, since that's the one
// that the DOM represents. If any changes came in in the meantime,
// the modification is mapped over those before it is applied, in
// readDOMChange.

function parseBetween(view, oldState, from, to) {
  var ref = view.docView.domFromPos(from, -1);
  var parent = ref.node;
  var startOff = ref.offset;
  var ref$1 = view.docView.domFromPos(to, 1);
  var parentRight = ref$1.node;
  var endOff = ref$1.offset;
  if (parent != parentRight) { return null }
  // If there's non-view nodes directly after the end of this region,
  // fail and let the caller try again with a wider range.
  if (endOff == parent.childNodes.length) { for (var scan = parent; scan != view.content;) {
    if (!scan) { return null }
    if (scan.nextSibling) {
      if (!scan.nextSibling.pmViewDesc) { return null }
      break
    }
    scan = scan.parentNode
  } }

  var domSel = view.root.getSelection(), find = null
  if (domSel.anchorNode && view.content.contains(domSel.anchorNode)) {
    find = [{node: domSel.anchorNode, offset: domSel.anchorOffset}]
    if (!domSel.isCollapsed)
      { find.push({node: domSel.focusNode, offset: domSel.focusOffset}) }
  }
  var startDoc = oldState.doc
  var parser = view.someProp("domParser") || DOMParser.fromSchema(view.state.schema)
  var $from = startDoc.resolve(from)
  var sel = null, doc = parser.parse(parent, {
    topNode: $from.parent.copy(),
    topStart: $from.index(),
    topOpen: true,
    from: startOff,
    to: endOff,
    preserveWhitespace: true,
    editableContent: true,
    findPositions: find,
    ruleFromNode: ruleFromNode
  })
  if (find && find[0].pos != null) {
    var anchor = find[0].pos, head = find[1] && find[1].pos
    if (head == null) { head = anchor }
    sel = {anchor: anchor + from, head: head + from}
  }
  return {doc: doc, sel: sel}
}

function ruleFromNode(dom) {
  var desc = dom.pmViewDesc
  if (desc) { return desc.parseRule() }
  else if (dom.nodeName == "BR" && dom.parentNode && dom.parentNode.lastChild == dom) { return {ignore: true} }
}

function isAtEnd($pos, depth) {
  for (var i = depth || 0; i < $pos.depth; i++)
    { if ($pos.index(i) + 1 < $pos.node(i).childCount) { return false } }
  return $pos.parentOffset == $pos.parent.content.size
}
function isAtStart($pos, depth) {
  for (var i = depth || 0; i < $pos.depth; i++)
    { if ($pos.index(0) > 0) { return false } }
  return $pos.parentOffset == 0
}

function rangeAroundSelection(selection) {
  var $from = selection.$from;
  var $to = selection.$to;

  if ($from.sameParent($to) && $from.parent.isTextblock && $from.parentOffset && $to.parentOffset < $to.parent.content.size) {
    var startOff = Math.max(0, $from.parentOffset)
    var size = $from.parent.content.size
    var endOff = Math.min(size, $to.parentOffset)

    if (startOff > 0)
      { startOff = $from.parent.childBefore(startOff).offset }
    if (endOff < size) {
      var after = $from.parent.childAfter(endOff)
      endOff = after.offset + after.node.nodeSize
    }
    var nodeStart = $from.start()
    return {from: nodeStart + startOff, to: nodeStart + endOff}
  } else {
    for (var depth = 0;; depth++) {
      var fromStart = isAtStart($from, depth + 1), toEnd = isAtEnd($to, depth + 1)
      if (fromStart || toEnd || $from.index(depth) != $to.index(depth) || $to.node(depth).isTextblock) {
        var from = $from.before(depth + 1), to = $to.after(depth + 1)
        if (fromStart && $from.index(depth) > 0)
          { from -= $from.node(depth).child($from.index(depth) - 1).nodeSize }
        if (toEnd && $to.index(depth) + 1 < $to.node(depth).childCount)
          { to += $to.node(depth).child($to.index(depth) + 1).nodeSize }
        return {from: from, to: to}
      }
    }
  }
}

function keyEvent(keyCode, key) {
  var event = document.createEvent("Event")
  event.initEvent("keydown", true, true)
  event.keyCode = keyCode
  event.key = event.code = key
  return event
}

function readDOMChange(view, mapping, oldState, range) {
  var parseResult, doc = oldState.doc

  for (;;) {
    parseResult = parseBetween(view, oldState, range.from, range.to)
    if (parseResult) { break }
    var $from$1 = doc.resolve(range.from), $to$1 = doc.resolve(range.to)
    range = {from: $from$1.depth ? $from$1.before() : 0,
             to: $to$1.depth ? $to$1.after() : doc.content.size}
  }
  var parsed = parseResult.doc;
  var parsedSel = parseResult.sel;

  var compare = doc.slice(range.from, range.to)
  var change = findDiff(compare.content, parsed.content, range.from, oldState.selection.from)

  if (!change) {
    if (parsedSel) {
      var sel = resolveSelection(view.state.doc, mapping, parsedSel)
      if (sel && !sel.eq(view.state.selection)) { view.dispatch(view.state.tr.setSelection(sel)) }
    }
    return
  }

  var $from = parsed.resolveNoCache(change.start - range.from)
  var $to = parsed.resolveNoCache(change.endB - range.from)
  var nextSel
  // If this looks like the effect of pressing Enter, just dispatch an
  // Enter key instead.
  if (!$from.sameParent($to) && $from.pos < parsed.content.size &&
      (nextSel = Selection.findFrom(parsed.resolve($from.pos + 1), 1, true)) &&
      nextSel.head == $to.pos &&
      view.someProp("handleKeyDown", function (f) { return f(view, keyEvent(13, "Enter")); }))
    { return }
  // Same for backspace
  if (oldState.selection.anchor > change.start &&
      looksLikeJoin(doc, change.start, change.endA, $from, $to) &&
      view.someProp("handleKeyDown", function (f) { return f(view, keyEvent(8, "Backspace")); }))
    { return }

  var from = mapping.map(change.start), to = mapping.map(change.endA, -1)

  var tr, storedMarks, markChange, $from1
  if ($from.sameParent($to) && $from.parent.isTextblock) {
    if ($from.pos == $to.pos) { // Deletion
      tr = view.state.tr.delete(from, to)
      var $start = doc.resolve(change.start)
      if ($start.parentOffset < $start.parent.content.size) { storedMarks = $start.marks(true) }
    } else if ( // Adding or removing a mark
      change.endA == change.endB && ($from1 = doc.resolve(change.start)) &&
      (markChange = isMarkChange($from.parent.content.cut($from.parentOffset, $to.parentOffset),
                                 $from1.parent.content.cut($from1.parentOffset, change.endA - $from1.start())))
    ) {
      tr = view.state.tr
      if (markChange.type == "add") { tr.addMark(from, to, markChange.mark) }
      else { tr.removeMark(from, to, markChange.mark) }
    } else if ($from.parent.child($from.index()).isText && $from.index() == $to.index() - ($to.textOffset ? 0 : 1)) {
      // Both positions in the same text node -- simply insert text
      var text = $from.parent.textBetween($from.parentOffset, $to.parentOffset)
      if (view.someProp("handleTextInput", function (f) { return f(view, from, to, text); })) { return }
      tr = view.state.tr.insertText(text, from, to)
    }
  }

  if (!tr)
    { tr = view.state.tr.replace(from, to, parsed.slice(change.start - range.from, change.endB - range.from)) }
  if (parsedSel) {
    var sel$1 = resolveSelection(tr.doc, mapping, parsedSel)
    if (sel$1) { tr.setSelection(sel$1) }
  }
  if (storedMarks) { tr.setStoredMarks(storedMarks) }
  view.dispatch(tr.scrollIntoView())
}

function resolveSelection(doc, mapping, parsedSel) {
  if (Math.max(parsedSel.anchor, parsedSel.head) > doc.content.size) { return null }
  return Selection.between(doc.resolve(mapping.map(parsedSel.anchor)),
                           doc.resolve(mapping.map(parsedSel.head)))
}

// : (Fragment, Fragment) → ?{mark: Mark, type: string}
// Given two same-length, non-empty fragments of inline content,
// determine whether the first could be created from the second by
// removing or adding a single mark type.
function isMarkChange(cur, prev) {
  var curMarks = cur.firstChild.marks, prevMarks = prev.firstChild.marks
  var added = curMarks, removed = prevMarks, type, mark, update
  for (var i = 0; i < prevMarks.length; i++) { added = prevMarks[i].removeFromSet(added) }
  for (var i$1 = 0; i$1 < curMarks.length; i$1++) { removed = curMarks[i$1].removeFromSet(removed) }
  if (added.length == 1 && removed.length == 0) {
    mark = added[0]
    type = "add"
    update = function (node) { return node.mark(mark.addToSet(node.marks)); }
  } else if (added.length == 0 && removed.length == 1) {
    mark = removed[0]
    type = "remove"
    update = function (node) { return node.mark(mark.removeFromSet(node.marks)); }
  } else {
    return null
  }
  var updated = []
  for (var i$2 = 0; i$2 < prev.childCount; i$2++) { updated.push(update(prev.child(i$2))) }
  if (Fragment.from(updated).eq(cur)) { return {mark: mark, type: type} }
}

function looksLikeJoin(old, start, end, $newStart, $newEnd) {
  if (!$newStart.parent.isTextblock ||
      // The content must have shrunk
      end - start <= $newEnd.pos - $newStart.pos ||
      // newEnd must point directly at or after the end of the block that newStart points into
      skipClosingAndOpening($newStart, true, false) < $newEnd.pos)
    { return false }

  var $start = old.resolve(start)
  // Start must be at the end of a block
  if ($start.parentOffset < $start.parent.content.size || !$start.parent.isTextblock)
    { return false }
  var $next = old.resolve(skipClosingAndOpening($start, true, true))
  // The next textblock must start before end and end near it
  if (!$next.parent.isTextblock || $next.pos > end ||
      skipClosingAndOpening($next, true, false) < end)
    { return false }

  // The fragments after the join point must match
  return $newStart.parent.content.cut($newStart.parentOffset).eq($next.parent.content)
}

function skipClosingAndOpening($pos, fromEnd, mayOpen) {
  var depth = $pos.depth, end = fromEnd ? $pos.end() : $pos.pos
  while (depth > 0 && (fromEnd || $pos.indexAfter(depth) == $pos.node(depth).childCount)) {
    depth--
    end++
    fromEnd = false
  }
  if (mayOpen) {
    var next = $pos.node(depth).maybeChild($pos.indexAfter(depth))
    while (next && !next.isLeaf) {
      next = next.firstChild
      end++
    }
  }
  return end
}

function findDiff(a, b, pos, preferedStart) {
  var start = a.findDiffStart(b, pos)
  if (start == null) { return null }
  var ref = a.findDiffEnd(b, pos + a.size, pos + b.size);
  var endA = ref.a;
  var endB = ref.b;
  if (endA < start && a.size < b.size) {
    var move = preferedStart <= start && preferedStart >= endA ? start - preferedStart : 0
    start -= move
    endB = start + (endB - endA)
    endA = start
  } else if (endB < start) {
    var move$1 = preferedStart <= start && preferedStart >= endB ? start - preferedStart : 0
    start -= move$1
    endA = start + (endA - endB)
    endB = start
  }
  return {start: start, endA: endA, endB: endB}
}

},{"./trackmappings":57,"prosemirror-model":24,"prosemirror-state":34}],53:[function(require,module,exports){
function windowRect() {
  return {left: 0, right: window.innerWidth,
          top: 0, bottom: window.innerHeight}
}

function parentNode(node) {
  var parent = node.parentNode
  return parent.nodeType == 11 ? parent.host : parent
}

function scrollRectIntoView(view, rect) {
  var scrollThreshold = view.someProp("scrollThreshold") || 0, scrollMargin = view.someProp("scrollMargin")
  if (scrollMargin == null) { scrollMargin = 5 }
  for (var parent = view.content;; parent = parentNode(parent)) {
    var atBody = parent == document.body
    var bounding = atBody ? windowRect() : parent.getBoundingClientRect()
    var moveX = 0, moveY = 0
    if (rect.top < bounding.top + scrollThreshold)
      { moveY = -(bounding.top - rect.top + scrollMargin) }
    else if (rect.bottom > bounding.bottom - scrollThreshold)
      { moveY = rect.bottom - bounding.bottom + scrollMargin }
    if (rect.left < bounding.left + scrollThreshold)
      { moveX = -(bounding.left - rect.left + scrollMargin) }
    else if (rect.right > bounding.right - scrollThreshold)
      { moveX = rect.right - bounding.right + scrollMargin }
    if (moveX || moveY) {
      if (atBody) {
        window.scrollBy(moveX, moveY)
      } else {
        if (moveY) { parent.scrollTop += moveY }
        if (moveX) { parent.scrollLeft += moveX }
      }
    }
    if (atBody) { break }
  }
}
exports.scrollRectIntoView = scrollRectIntoView

function findOffsetInNode(node, coords) {
  var closest, dxClosest = 2e8, coordsClosest, offset = 0
  var rowBot = coords.top, rowTop = coords.top
  for (var child = node.firstChild, childIndex = 0; child; child = child.nextSibling, childIndex++) {
    var rects = (void 0)
    if (child.nodeType == 1) { rects = child.getClientRects() }
    else if (child.nodeType == 3) { rects = textRange(child).getClientRects() }
    else { continue }

    for (var i = 0; i < rects.length; i++) {
      var rect = rects[i]
      if (rect.top <= rowBot && rect.bottom >= rowTop) {
        rowBot = Math.max(rect.bottom, rowBot)
        rowTop = Math.min(rect.top, rowTop)
        var dx = rect.left > coords.left ? rect.left - coords.left
            : rect.right < coords.left ? coords.left - rect.right : 0
        if (dx < dxClosest) {
          closest = child
          dxClosest = dx
          coordsClosest = dx && closest.nodeType == 3 ? {left: rect.right < coords.left ? rect.right : rect.left, top: coords.top} : coords
          if (child.nodeType == 1 && dx)
            { offset = childIndex + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0) }
          continue
        }
      }
      if (!closest && (coords.left >= rect.right && coords.top >= rect.top ||
                       coords.left >= rect.left && coords.top >= rect.bottom))
        { offset = childIndex + 1 }
    }
  }
  if (closest && closest.nodeType == 3) { return findOffsetInText(closest, coordsClosest) }
  if (!closest || (dxClosest && closest.nodeType == 1)) { return {node: node, offset: offset} }
  return findOffsetInNode(closest, coordsClosest)
}

function findOffsetInText(node, coords) {
  var len = node.nodeValue.length
  var range = document.createRange()
  for (var i = 0; i < len; i++) {
    range.setEnd(node, i + 1)
    range.setStart(node, i)
    var rect = singleRect(range, 1)
    if (rect.top == rect.bottom) { continue }
    if (rect.left - 1 <= coords.left && rect.right + 1 >= coords.left &&
        rect.top - 1 <= coords.top && rect.bottom + 1 >= coords.top)
      { return {node: node, offset: i + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0)} }
  }
  return {node: node, offset: 0}
}

function targetKludge(dom, coords) {
  if (/^[uo]l$/i.test(dom.nodeName)) {
    for (var child = dom.firstChild; child; child = child.nextSibling) {
      if (!child.pmViewDesc || !/^li$/i.test(child.nodeName)) { continue }
      var childBox = child.getBoundingClientRect()
      if (coords.left > childBox.left - 2) { break }
      if (childBox.top <= coords.top && childBox.bottom >= coords.top) { return child }
    }
  }
  return dom
}

// Given an x,y position on the editor, get the position in the document.
function posAtCoords(view, coords) {
  var elt = targetKludge(view.root.elementFromPoint(coords.left, coords.top + 1), coords)
  if (!view.content.contains(elt.nodeType == 3 ? elt.parentNode : elt)) { return null }

  var ref = findOffsetInNode(elt, coords);
  var node = ref.node;
  var offset = ref.offset;
  var bias = -1
  if (node.nodeType == 1 && !node.firstChild) {
    var rect = node.getBoundingClientRect()
    bias = rect.left != rect.right && coords.left > (rect.left + rect.right) / 2 ? 1 : -1
  }

  var desc = view.docView.nearestDesc(elt, true)
  return {pos: view.docView.posFromDOM(node, offset, bias),
          inside: desc && (desc.posAtStart - desc.border)}
}
exports.posAtCoords = posAtCoords

function textRange(node, from, to) {
  var range = document.createRange()
  range.setEnd(node, to == null ? node.nodeValue.length : to)
  range.setStart(node, from || 0)
  return range
}

function singleRect(object, bias) {
  var rects = object.getClientRects()
  return !rects.length ? object.getBoundingClientRect() : rects[bias < 0 ? 0 : rects.length - 1]
}

// : (ProseMirror, number) → {left: number, top: number, right: number, bottom: number}
// Given a position in the document model, get a bounding box of the
// character at that position, relative to the window.
function coordsAtPos(view, pos) {
  var ref = view.docView.domFromPos(pos);
  var node = ref.node;
  var offset = ref.offset;
  var side, rect
  if (node.nodeType == 3) {
    if (offset < node.nodeValue.length) {
      rect = singleRect(textRange(node, offset, offset + 1), -1)
      side = "left"
    }
    if ((!rect || rect.left == rect.right) && offset) {
      rect = singleRect(textRange(node, offset - 1, offset), 1)
      side = "right"
    }
  } else if (node.firstChild) {
    if (offset < node.childNodes.length) {
      var child = node.childNodes[offset]
      rect = singleRect(child.nodeType == 3 ? textRange(child) : child, -1)
      side = "left"
    }
    if ((!rect || rect.top == rect.bottom) && offset) {
      var child$1 = node.childNodes[offset - 1]
      rect = singleRect(child$1.nodeType == 3 ? textRange(child$1) : child$1, 1)
      side = "right"
    }
  } else {
    rect = node.getBoundingClientRect()
    side = "left"
  }
  var x = rect[side]
  return {top: rect.top, bottom: rect.bottom, left: x, right: x}
}
exports.coordsAtPos = coordsAtPos

function withFlushedState(view, state, f) {
  var viewState = view.state, active = view.root.activeElement
  if (viewState != state || !view.inDOMChange) { view.updateState(state) }
  if (active != view.content) { view.focus() }
  try {
    return f()
  } finally {
    if (viewState != state) { view.updateState(viewState) }
    if (active != view.content) { active.focus() }
  }
}

// : (ProseMirror, number, number)
// Whether vertical position motion in a given direction
// from a position would leave a text block.
function endOfTextblockVertical(view, state, dir) {
  var $pos = dir == "up" ? state.selection.$from : state.selection.$to
  if (!$pos.depth) { return false }
  return withFlushedState(view, state, function () {
    var dom = view.docView.domAfterPos($pos.before())
    var coords = coordsAtPos(view, $pos.pos)
    for (var child = dom.firstChild; child; child = child.nextSibling) {
      var boxes = (void 0)
      if (child.nodeType == 1) { boxes = child.getClientRects() }
      else if (child.nodeType == 3) { boxes = textRange(child, 0, child.nodeValue.length).getClientRects() }
      else { continue }
      for (var i = 0; i < boxes.length; i++) {
        var box = boxes[i]
        if (dir == "up" ? box.bottom < coords.top + 1 : box.top > coords.bottom - 1)
          { return false }
      }
    }
    return true
  })
}

var maybeRTL = /[\u0590-\u08ac]/

function endOfTextblockHorizontal(view, state, dir) {
  var ref = state.selection;
  var $head = ref.$head;
  var empty = ref.empty;
  if (!empty || !$head.parent.isTextblock || !$head.depth) { return false }
  var offset = $head.parentOffset, atStart = !offset, atEnd = offset == $head.parent.content.size
  // If the textblock is all LTR and the cursor isn't at the sides, we don't need to touch the DOM
  if (!atStart && !atEnd && !maybeRTL.test($head.parent.textContent)) { return false }
  var sel = getSelection()
  // Fall back to a primitive approach if the necessary selection method isn't supported (Edge)
  if (!sel.modify) { return dir == "left" || dir == "backward" ? atStart : atEnd }

  return withFlushedState(view, state, function () {
    // This is a huge hack, but appears to be the best we can
    // currently do: use `Selection.modify` to move the selection by
    // one character, and see if that moves the cursor out of the
    // textblock (or doesn't move it at all, when at the start/end of
    // the document).
    var oldRange = sel.getRangeAt(0)
    sel.modify("move", dir, "character")
    var parentDOM = view.docView.domAfterPos($head.before())
    var result = !parentDOM.contains(sel.focusNode.nodeType == 1 ? sel.focusNode : sel.focusNode.parentNode) ||
        view.docView.posFromDOM(sel.focusNode, sel.focusOffset) == $head.pos
    // Restore the previous selection
    sel.removeAllRanges()
    sel.addRange(oldRange)
    return result
  })
}

var cachedState = null, cachedDir = null, cachedResult = false
function endOfTextblock(view, state, dir) {
  if (cachedState == state && cachedDir == dir) { return cachedResult }
  cachedState = state; cachedDir = dir
  return cachedResult = dir == "up" || dir == "down"
    ? endOfTextblockVertical(view, state, dir)
    : endOfTextblockHorizontal(view, state, dir)
}
exports.endOfTextblock = endOfTextblock

},{}],54:[function(require,module,exports){
var ref = require("./domcoords");
var scrollRectIntoView = ref.scrollRectIntoView;
var posAtCoords = ref.posAtCoords;
var coordsAtPos = ref.coordsAtPos;
var endOfTextblock = ref.endOfTextblock;
var ref$1 = require("./viewdesc");
var docViewDesc = ref$1.docViewDesc;
var ref$2 = require("./input");
var initInput = ref$2.initInput;
var destroyInput = ref$2.destroyInput;
var dispatchEvent = ref$2.dispatchEvent;
var startObserving = ref$2.startObserving;
var stopObserving = ref$2.stopObserving;
var ensureListeners = ref$2.ensureListeners;
var ref$3 = require("./selection");
var SelectionReader = ref$3.SelectionReader;
var selectionToDOM = ref$3.selectionToDOM;
var ref$4 = require("./decoration");
var viewDecorations = ref$4.viewDecorations;
var Decoration = ref$4.Decoration;var assign;
((assign = require("./decoration"), exports.Decoration = assign.Decoration, exports.DecorationSet = assign.DecorationSet))

// ::- An editor view manages the DOM structure that represents an
// editor. Its state and behavior are determined by its
// [props](#view.EditorProps).
var EditorView = function(place, props) {
  // :: EditorProps
  // The view's current [props](#view.EditorProps).
  this.props = props
  // :: EditorState
  // The view's current [state](#state.EditorState).
  this.state = props.state

  this.dispatch = this.dispatch.bind(this)

  this._root = null
  this.focused = false

  // :: dom.Element
  // The editable DOM node containing the document. (You probably
  // should not be directly interfering with its child nodes.)
  this.content = document.createElement("div")

  if (place && place.appendChild) { place.appendChild(this.content) }
  else if (place) { place(this.content) }

  this.editable = getEditable(this)
  this.docView = docViewDesc(this.state.doc, computeDocDeco(this), viewDecorations(this), this.content, this)

  this.lastSelectedViewDesc = null
  this.selectionReader = new SelectionReader(this)
  initInput(this)

  this.pluginViews = []
  this.updatePluginViews()
};

var prototypeAccessors = { root: {} };

// :: (EditorProps)
// Update the view's props. Will immediately cause an update to
// the view's DOM.
EditorView.prototype.update = function (props) {
  if (props.handleDOMEvents != this.props.handleDOMEvents) { ensureListeners(this) }
  this.props = props
  this.updateState(props.state)
};

// :: (EditorState)
// Update the editor's `state` prop, without touching any of the
// other props.
EditorView.prototype.updateState = function (state) {
  var prev = this.state
  this.state = state
  if (prev.plugins != state.plugins) { ensureListeners(this) }

  if (this.inDOMChange) { return }

  var prevEditable = this.editable
  this.editable = getEditable(this)
  var innerDeco = viewDecorations(this), outerDeco = computeDocDeco(this)

  if (!this.docView.matchesNode(state.doc, outerDeco, innerDeco)) {
    stopObserving(this)
    this.docView.update(state.doc, outerDeco, innerDeco, this)
    selectionToDOM(this, state.selection)
    startObserving(this)
  } else if (!state.selection.eq(prev.selection) || this.selectionReader.domChanged()) {
    stopObserving(this)
    selectionToDOM(this, state.selection)
    startObserving(this)
  }

  if (prevEditable != this.editable) { this.selectionReader.editableChanged() }
  this.updatePluginViews(prev)

  if (state.scrollToSelection > prev.scrollToSelection || prev.config != state.config) {
    if (state.selection.node)
      { scrollRectIntoView(this, this.docView.domAfterPos(state.selection.from).getBoundingClientRect()) }
    else
      { scrollRectIntoView(this, this.coordsAtPos(state.selection.head)) }
  }
};

EditorView.prototype.destroyPluginViews = function () {
  var view
  while (view = this.pluginViews.pop()) { if (view.destroy) { view.destroy() } }
};

EditorView.prototype.updatePluginViews = function (prevState) {
    var this$1 = this;

  var plugins = this.state.plugins
  if (!prevState || prevState.plugins != plugins) {
    this.destroyPluginViews()
    for (var i = 0; i < plugins.length; i++) {
      var plugin = plugins[i]
      if (plugin.options.view) { this$1.pluginViews.push(plugin.options.view(this$1)) }
    }
  } else {
    for (var i$1 = 0; i$1 < this.pluginViews.length; i$1++) {
      var pluginView = this$1.pluginViews[i$1]
      if (pluginView.update) { pluginView.update(this$1) }
    }
  }
};

// :: () → bool
// Query whether the view has focus.
EditorView.prototype.hasFocus = function () {
  if (this.editable && this.content.ownerDocument.activeElement != this.content) { return false }
  var sel = this.root.getSelection()
  return sel.rangeCount && this.content.contains(sel.anchorNode.nodeType == 3 ? sel.anchorNode.parentNode : sel.anchorNode)
};

// :: (string, (prop: *) → *) → *
// Goes over the values of a prop, first those provided directly,
// then those from plugins (in order), and calls `f` every time a
// non-undefined value is found. When `f` returns a truthy value,
// that is immediately returned. When `f` isn't provided, it is
// treated as the identity function (the prop value is returned
// directly).
EditorView.prototype.someProp = function (propName, f) {
  var prop = this.props && this.props[propName], value
  if (prop != null && (value = f ? f(prop) : prop)) { return value }
  var plugins = this.state.plugins
  if (plugins) { for (var i = 0; i < plugins.length; i++) {
    var prop$1 = plugins[i].props[propName]
    if (prop$1 != null && (value = f ? f(prop$1) : prop$1)) { return value }
  } }
};

// :: ()
// Focus the editor.
EditorView.prototype.focus = function () {
  stopObserving(this)
  selectionToDOM(this, this.state.selection, true)
  startObserving(this)
  if (this.editable) { this.content.focus() }
};

// :: union<dom.Document, dom.DocumentFragment>
// Get the document root in which the editor exists. This will
// usually be the top-level `document`, but might be a shadow DOM
// root if the editor is inside a shadow DOM.
prototypeAccessors.root.get = function () {
    var this$1 = this;

  var cached = this._root
  if (cached == null) { for (var search = this.content.parentNode; search; search = search.parentNode) {
    if (search.nodeType == 9 || (search.nodeType == 11 && search.host))
      { return this$1._root = search }
  } }
  return cached || document
};

// :: ({left: number, top: number}) → ?{pos: number, inside: number}
// Given a pair of coordinates, return the document position that
// corresponds to them. May return null if the given coordinates
// aren't inside of the visible editor. When an object is returned,
// its `pos` property is the position nearest to the coordinates,
// and its `inside` property holds the position before the inner
// node that the click happened inside of, or -1 if the click was at
// the top level.
EditorView.prototype.posAtCoords = function (coords) { return posAtCoords(this, coords) };

// :: (number) → {left: number, right: number, top: number, bottom: number}
// Returns the screen rectangle at a given document position. `left`
// and `right` will be the same number, as this returns a flat
// cursor-ish rectangle.
EditorView.prototype.coordsAtPos = function (pos) { return coordsAtPos(this, pos) };

// :: (union<"up", "down", "left", "right", "forward", "backward">, ?EditorState) → bool
// Find out whether the selection is at the end of a textblock when
// moving in a given direction. When, for example, given `"left"`,
// it will return true if moving left from the current cursor
// position would leave that position's parent textblock. For
// horizontal motion, it will always return false if the selection
// isn't a cursor selection.
EditorView.prototype.endOfTextblock = function (dir, state) {
  return endOfTextblock(this, state || this.state, dir)
};

// :: ()
// Removes the editor from the DOM and destroys all [node
// views](#view.NodeView).
EditorView.prototype.destroy = function () {
  destroyInput(this)
  this.destroyPluginViews()
  this.docView.destroy()
  this.selectionReader.destroy()
  if (this.content.parentNode) { this.content.parentNode.removeChild(this.content) }
};

// Used for testing.
EditorView.prototype.dispatchEvent = function (event) {
  return dispatchEvent(this, event)
};

// :: (Transaction)
// Dispatch a transaction. Will call the
// [`dispatchTransaction`](#view.EditorProps.dispatchTransaction) when given,
// and defaults to applying the transaction to the current state and
// calling [`updateState`](#view.EditorView.updateState) otherwise.
// This method is bound to the view instance, so that it can be
// easily passed around.
EditorView.prototype.dispatch = function (tr) {
  var dispatchTransaction = this.props.dispatchTransaction
  if (dispatchTransaction) { dispatchTransaction(tr) }
  else { this.updateState(this.state.apply(tr)) }
};

Object.defineProperties( EditorView.prototype, prototypeAccessors );
exports.EditorView = EditorView

function computeDocDeco(view) {
  var attrs = Object.create(null)
  attrs.class = "ProseMirror" + (view.focused ? " ProseMirror-focused" : "") +
    (view.state.selection.node ? " ProseMirror-nodeselection" : "")
  attrs.contenteditable = String(view.editable)

  view.someProp("attributes", function (value) {
    if (typeof value == "function") { value = value(view.state) }
    if (value) { for (var attr in value) {
      if (attr == "class")
        { attrs.class += " " + value[attr] }
      else if (!attrs[attr] && attr != "contenteditable" && attr != "nodeName")
        { attrs[attr] = String(value[attr]) }
    } }
  })

  return [Decoration.node(0, view.state.doc.content.size, attrs)]
}

function getEditable(view) {
  return !view.someProp("editable", function (value) { return value(view.state) === false; })
}

// EditorProps:: interface
//
// The configuration object that can be passed to an editor view. It
// supports the following properties (only `state` is required).
//
// The various event-handling functions may all return `true` to
// indicate that they handled the given event. The view will then take
// care to call `preventDefault` on the event, except with
// `handleDOMEvents`, where the handler itself is responsible for that.
//
// Except for `state` and `dispatchTransaction`, these may also be
// present on the `props` property of plugins. How a prop is resolved
// depends on the prop. Handler functions are called one at a time,
// starting with the plugins (in order of appearance), and finally
// looking at the base props, until one of them returns true. For some
// props, the first plugin that yields a value gets precedence. For
// `class`, all the classes returned are combined.
//
//   state:: EditorState
//   The state of the editor.
//
//   dispatchTransaction:: ?(tr: Transaction)
//   The callback over which to send transactions (state updates)
//   produced by the view. You'll usually want to make sure this ends
//   up calling the view's
//   [`updateState`](#view.EditorView.updateState) method with a new
//   state that has the transaction
//   [applied](#state.EditorState.apply).
//
//   handleDOMEvents:: ?Object<(view: EditorView, event: dom.Event) → bool>
//   Can be an object mapping DOM event type names to functions that
//   handle them. Such functions will be called before any handling
//   ProseMirror does of events fired on the editable DOM element.
//   Contrary to the other event handling props, when returning true
//   from such a function, you are responsible for calling
//   `preventDefault` yourself (or not, if you want to allow the
//   default behavior).
//
//   handleKeyDown:: ?(view: EditorView, event: dom.KeyboardEvent) → bool
//   Called when the editor receives a `keydown` event.
//
//   handleKeyPress:: ?(view: EditorView, event: dom.KeyboardEvent) → bool
//   Handler for `keypress` events.
//
//   handleTextInput:: ?(view: EditorView, from: number, to: number, text: string) → bool
//   Whenever the user directly input text, this handler is called
//   before the input is applied. If it returns `true`, the default
//   effect of actually inserting the text is suppressed.
//
//   handleClickOn:: ?(view: EditorView, pos: number, node: Node, nodePos: number, event: dom.MouseEvent, direct: bool) → bool
//   Called for each node around a click, from the inside out. The
//   `direct` flag will be true for the inner node.
//
//   handleClick:: ?(view: EditorView, pos: number, event: dom.MouseEvent) → bool
//   Called when the editor is clicked, after `handleClickOn` handlers
//   have been called.
//
//   handleDoubleClickOn:: ?(view: EditorView, pos: number, node: Node, nodePos: number, event: dom.MouseEvent, direct: bool) → bool
//   Called for each node around a double click.
//
//   handleDoubleClick:: ?(view: EditorView, pos: number, event: dom.MouseEvent) → bool
//   Called when the editor is double-clicked, after `handleDoubleClickOn`.
//
//   handleTripleClickOn:: ?(view: EditorView, pos: number, node: Node, nodePos: number, event: dom.MouseEvent, direct: bool) → bool
//   Called for each node around a triple click.
//
//   handleTripleClick:: ?(view: EditorView, pos: number, event: dom.MouseEvent) → bool
//   Called when the editor is triple-clicked, after `handleTripleClickOn`.
//
//   handleContextMenu:: ?(view: EditorView, pos: number, event: dom.MouseEvent) → bool
//   Called when a context menu event is fired in the editor.
//
//   onFocus:: ?(view: EditorView, event: dom.Event)
//   Called when the editor is focused.
//
//   onBlur:: ?(view: EditorView, event: dom.Event)
//   Called when the editor loses focus.
//
//   domParser:: ?DOMParser
//   The [parser](#model.DOMParser) to use when reading editor changes
//   from the DOM. Defaults to calling
//   [`DOMParser.fromSchema`](#model.DOMParser^fromSchema) on the
//   editor's schema.
//
//   clipboardParser:: ?DOMParser
//   The [parser](#model.DOMParser) to use when reading content from
//   the clipboard. When not given, the value of the
//   [`domParser`](#view.EditorProps.domParser) prop is used.
//
//   transformPasted:: ?(Slice) → Slice
//   Can be used to transform pasted content before it is applied to
//   the document.
//
//   transformPastedHTML:: ?(string) → string
//   Can be used to transform pasted HTML text, _before_ it is parsed,
//   for example to clean it up.
//
//   transformPastedText:: ?(string) → string
//   Transform pasted plain text.
//
//   nodeViews:: ?Object<(node: Node, view: EditorView, getPos: () → number, decorations: [Decoration]) → NodeView>
//   Allows you to pass custom rendering and behavior logic for nodes
//   and marks. Should map node and mark names to constructor function
//   that produce a [`NodeView`](#view.NodeView) object implementing
//   the node's display behavior. `getPos` is a function that can be
//   called to get the node's current position, which can be useful
//   when creating transactions that update it.
//
//   `decorations` is an array of node or inline decorations that are
//   active around the node. They are automatically drawn in the
//   normal way, and you will usually just want to ignore this, but
//   they can also be used as a way to provide context information to
//   the node view without adding it to the document itself.
//
//   clipboardSerializer:: ?DOMSerializer
//   The DOM serializer to use when putting content onto the
//   clipboard. If not given, the result of
//   [`DOMSerializer.fromSchema`](#model.DOMSerializer^fromSchema)
//   will be used.
//
//   decorations:: (EditorState) → ?DecorationSet
//   A set of [document decorations](#view.Decoration) to add to the
//   view.
//
//   editable:: ?(EditorState) → bool
//   When this returns false, the content of the view is not directly
//   editable.
//
//   attributes:: ?union<Object<string>, (EditorState) → ?Object<string>>
//   Control the DOM attributes of the editable element. May be either
//   an object or a function going from an editor state to an object.
//   By default, the element will get a class `"ProseMirror"`, and
//   will have its `contentEditable` attribute determined by the
//   [`editable` prop](#view.EditorProps.editable). Additional classes
//   provided here will be added to the class. For other attributes,
//   the value provided first (as in
//   [`someProp`](#view.EditorView.someProp)) will be used.
//
//   scrollThreshold:: ?number
//   Determines the distance (in pixels) between the cursor and the
//   end of the visible viewport at which point, when scrolling the
//   cursor into view, scrolling takes place. Defaults to 0.
//
//   scrollMargin:: ?number
//   Determines the extra space (in pixels) that is left above or
//   below the cursor when it is scrolled into view. Defaults to 5.

},{"./decoration":51,"./domcoords":53,"./input":55,"./selection":56,"./viewdesc":58}],55:[function(require,module,exports){
var ref = require("prosemirror-state");
var Selection = ref.Selection;
var NodeSelection = ref.NodeSelection;
var TextSelection = ref.TextSelection;

var browser = require("./browser")
var ref$1 = require("./capturekeys");
var captureKeyDown = ref$1.captureKeyDown;
var ref$2 = require("./domchange");
var DOMChange = ref$2.DOMChange;
var ref$3 = require("./clipboard");
var fromClipboard = ref$3.fromClipboard;
var toClipboard = ref$3.toClipboard;
var canUpdateClipboard = ref$3.canUpdateClipboard;
var ref$4 = require("./trackmappings");
var TrackMappings = ref$4.TrackMappings;

// A collection of DOM events that occur within the editor, and callback functions
// to invoke when the event fires.
var handlers = {}, editHandlers = {}

function initInput(view) {
  view.shiftKey = false
  view.mouseDown = null
  view.dragging = null
  view.inDOMChange = null
  view.mutationObserver = window.MutationObserver &&
    new window.MutationObserver(function (mutations) { return registerMutations(view, mutations); })
  startObserving(view)

  var loop = function ( event ) {
    var handler = handlers[event]
    view.content.addEventListener(event, function (event) {
      if (eventBelongsToView(view, event) && !runCustomHandler(view, event) &&
          (view.editable || !(event.type in editHandlers)))
        { handler(view, event) }
    })
  };

  for (var event in handlers) loop( event );
  view.extraHandlers = Object.create(null)
  ensureListeners(view)
}
exports.initInput = initInput

function destroyInput(view) {
  stopObserving(view)
  if (view.inDOMChange) { view.inDOMChange.destroy() }
  if (view.dragging) { view.dragging.destroy() }
}
exports.destroyInput = destroyInput

function ensureListeners(view) {
  view.someProp("handleDOMEvents", function (handlers) {
    for (var type in handlers) { if (!view.extraHandlers[type] && !handlers.hasOwnProperty(type)) {
      view.extraHandlers[type] = true
      view.content.addEventListener(type, function (event) { return runCustomHandler(view, event); })
    } }
  })
}
exports.ensureListeners = ensureListeners

function runCustomHandler(view, event) {
  return view.someProp("handleDOMEvents", function (handlers) {
    var handler = handlers[event.type]
    return handler ? handler(view, event) : false
  })
}

function eventBelongsToView(view, event) {
  if (!event.bubbles) { return true }
  if (event.defaultPrevented) { return false }
  for (var node = event.target; node != view.content; node = node.parentNode)
    { if (!node || node.nodeType == 11 ||
        (node.pmViewDesc && node.pmViewDesc.stopEvent(event)))
      { return false } }
  return true
}

function dispatchEvent(view, event) {
  if (!runCustomHandler(view, event) && handlers[event.type] &&
      (view.editable || !(event.type in editHandlers)))
    { handlers[event.type](view, event) }
}
exports.dispatchEvent = dispatchEvent

editHandlers.keydown = function (view, event) {
  if (event.keyCode == 16) { view.shiftKey = true }
  if (view.inDOMChange) { return }
  if (view.someProp("handleKeyDown", function (f) { return f(view, event); }) || captureKeyDown(view, event))
    { event.preventDefault() }
  else
    { view.selectionReader.poll() }
}

editHandlers.keyup = function (view, e) {
  if (e.keyCode == 16) { view.shiftKey = false }
}

editHandlers.keypress = function (view, event) {
  if (view.inDOMChange || !event.charCode ||
      event.ctrlKey && !event.altKey || browser.mac && event.metaKey) { return }

  if (view.someProp("handleKeyPress", function (f) { return f(view, event); })) {
    event.preventDefault()
    return
  }

  var ref = view.state.selection;
  var node = ref.node;
  var $from = ref.$from;
  var $to = ref.$to;
  if (node || !$from.sameParent($to)) {
    var text = String.fromCharCode(event.charCode)
    if (!view.someProp("handleTextInput", function (f) { return f(view, $from.pos, $to.pos, text); }))
      { view.dispatch(view.state.tr.insertText(text).scrollIntoView()) }
    event.preventDefault()
  }
}

function eventCoords(event) { return {left: event.clientX, top: event.clientY} }

var lastClick = {time: 0, x: 0, y: 0}, oneButLastClick = lastClick

function isNear(event, click) {
  var dx = click.x - event.clientX, dy = click.y - event.clientY
  return dx * dx + dy * dy < 100
}

function runHandlerOnContext(view, propName, pos, inside, event) {
  if (inside == -1) { return false }
  var $pos = view.state.doc.resolve(inside)
  var loop = function ( i ) {
    if (view.someProp(propName, function (f) { return i > $pos.depth ? f(view, pos, $pos.nodeAfter, $pos.before(i), event, true)
                                                    : f(view, pos, $pos.node(i), $pos.before(i), event, false); }))
      { return { v: true } }
  };

  for (var i = $pos.depth + 1; i > 0; i--) {
    var returned = loop( i );

    if ( returned ) return returned.v;
  }
  return false
}

function updateSelection(view, selection, origin) {
  view.focus()
  var tr = view.state.tr.setSelection(selection)
  if (origin == "pointer") { tr.setMeta("pointer", true) }
  view.dispatch(tr)
}

function selectClickedLeaf(view, inside) {
  if (inside == -1) { return false }
  var $pos = view.state.doc.resolve(inside), node = $pos.nodeAfter
  if (node && node.isLeaf && NodeSelection.isSelectable(node)) {
    updateSelection(view, new NodeSelection($pos), "pointer")
    return true
  }
  return false
}

function selectClickedNode(view, inside) {
  if (inside == -1) { return false }
  var ref = view.state.selection;
  var selectedNode = ref.node;
  var $from = ref.$from;
  var selectAt

  var $pos = view.state.doc.resolve(inside)
  for (var i = $pos.depth + 1; i > 0; i--) {
    var node = i > $pos.depth ? $pos.nodeAfter : $pos.node(i)
    if (NodeSelection.isSelectable(node)) {
     if (selectedNode && $from.depth > 0 &&
          i >= $from.depth && $pos.before($from.depth + 1) == $from.pos)
        { selectAt = $pos.before($from.depth) }
      else
        { selectAt = $pos.before(i) }
      break
    }
  }

  if (selectAt != null) {
    updateSelection(view, NodeSelection.create(view.state.doc, selectAt), "pointer")
    return true
  } else {
    return false
  }
}

function handleSingleClick(view, pos, inside, event, selectNode) {
  return runHandlerOnContext(view, "handleClickOn", pos, inside, event) ||
    view.someProp("handleClick", function (f) { return f(view, pos, event); }) ||
    (selectNode ? selectClickedNode(view, inside) : selectClickedLeaf(view, inside))
}

function handleDoubleClick(view, pos, inside, event) {
  return runHandlerOnContext(view, "handleDoubleClickOn", pos, inside, event) ||
    view.someProp("handleDoubleClick", function (f) { return f(view, pos, event); })
}

function handleTripleClick(view, pos, inside, event) {
  return runHandlerOnContext(view, "handleTripleClickOn", pos, inside, event) ||
    view.someProp("handleTripleClick", function (f) { return f(view, pos, event); }) ||
    defaultTripleClick(view, inside)
}

function defaultTripleClick(view, inside) {
  var doc = view.state.doc
  if (inside == -1) {
    if (doc.isTextblock) {
      updateSelection(view, TextSelection.create(doc, 0, doc.content.size), "pointer")
      return true
    }
    return false
  }

  var $pos = doc.resolve(inside)
  for (var i = $pos.depth + 1; i > 0; i--) {
    var node = i > $pos.depth ? $pos.nodeAfter : $pos.node(i)
    var nodePos = $pos.before(i)
    if (node.isTextblock)
      { updateSelection(view, TextSelection.create(doc, nodePos + 1, nodePos + 1 + node.content.size), "pointer") }
    else if (NodeSelection.isSelectable(node))
      { updateSelection(view, NodeSelection.create(doc, nodePos), "pointer") }
    else
      { continue }
    return true
  }
}

function forceDOMFlush(view) {
  if (!view.inDOMChange) { return false }
  view.inDOMChange.finish(true)
  return true
}

var selectNodeModifier = browser.mac ? "metaKey" : "ctrlKey"

handlers.mousedown = function (view, event) {
  var flushed = forceDOMFlush(view)
  var now = Date.now(), type
  if (now - lastClick.time >= 500 || !isNear(event, lastClick) || event[selectNodeModifier]) { type = "singleClick" }
  else if (now - oneButLastClick.time >= 600 || !isNear(event, oneButLastClick)) { type = "doubleClick" }
  else { type = "tripleClick" }
  oneButLastClick = lastClick
  lastClick = {time: now, x: event.clientX, y: event.clientY}

  var pos = view.posAtCoords(eventCoords(event))
  if (!pos) { return }

  if (type == "singleClick")
    { view.mouseDown = new MouseDown(view, pos, event, flushed) }
  else if ((type == "doubleClick" ? handleDoubleClick : handleTripleClick)(view, pos.pos, pos.inside, event))
    { event.preventDefault() }
  else
    { view.selectionReader.poll("pointer") }
}

var MouseDown = function(view, pos, event, flushed) {
  var this$1 = this;

  this.view = view
  this.pos = pos
  this.flushed = flushed
  this.selectNode = event[selectNodeModifier]
  this.allowDefault = event.shiftKey

  var targetNode, targetPos
  if (pos.inside > -1) {
    targetNode = view.state.doc.nodeAt(pos.inside)
    targetPos = pos.inside
  } else {
    var $pos = view.state.doc.resolve(pos.pos)
    targetNode = $pos.parent
    targetPos = $pos.depth ? $pos.before() : 0
  }

  this.mightDrag = (targetNode.type.spec.draggable || targetNode == view.state.selection.node) ? {node: targetNode, pos: targetPos} : null
  this.target = flushed ? null : event.target
  if (this.target && this.mightDrag) {
    stopObserving(this.view)
    this.target.draggable = true
    if (browser.gecko && (this.setContentEditable = !this.target.hasAttribute("contentEditable")))
      { setTimeout(function () { return this$1.target.setAttribute("contentEditable", "false"); }, 20) }
    startObserving(this.view)
  }

  view.root.addEventListener("mouseup", this.up = this.up.bind(this))
  view.root.addEventListener("mousemove", this.move = this.move.bind(this))
  view.selectionReader.poll("pointer")
};

MouseDown.prototype.done = function () {
  this.view.root.removeEventListener("mouseup", this.up)
  this.view.root.removeEventListener("mousemove", this.move)
  if (this.mightDrag && this.target) {
    stopObserving(this.view)
    this.target.draggable = false
    if (browser.gecko && this.setContentEditable)
      { this.target.removeAttribute("contentEditable") }
    startObserving(this.view)
  }
};

MouseDown.prototype.up = function (event) {
  this.done()

  if (!this.view.content.contains(event.target.nodeType == 3 ? event.target.parentNode : event.target))
    { return }

  if (this.allowDefault) {
    this.view.selectionReader.poll("pointer")
  } else if (handleSingleClick(this.view, this.pos.pos, this.pos.inside, event, this.selectNode)) {
    event.preventDefault()
  } else if (this.flushed) {
    updateSelection(this.view, Selection.near(this.view.state.doc.resolve(this.pos.pos)), "pointer")
    event.preventDefault()
  } else {
    this.view.selectionReader.poll("pointer")
  }
};

MouseDown.prototype.move = function (event) {
  if (!this.allowDefault && (Math.abs(this.x - event.clientX) > 4 ||
                             Math.abs(this.y - event.clientY) > 4))
    { this.allowDefault = true }
  this.view.selectionReader.poll("pointer")
};

handlers.touchdown = function (view) {
  forceDOMFlush(view)
  view.selectionReader.poll("pointer")
}

handlers.contextmenu = function (view, e) {
  forceDOMFlush(view)
  var pos = view.posAtCoords(eventCoords(e))
  if (pos && view.someProp("handleContextMenu", function (f) { return f(view, pos.pos, e); }))
    { e.preventDefault() }
}

// Input compositions are hard. Mostly because the events fired by
// browsers are A) very unpredictable and inconsistent, and B) not
// cancelable.
//
// ProseMirror has the problem that it must not update the DOM during
// a composition, or the browser will cancel it. What it does is keep
// long-running operations (delayed DOM updates) when a composition is
// active.
//
// We _do not_ trust the information in the composition events which,
// apart from being very uninformative to begin with, is often just
// plain wrong. Instead, when a composition ends, we parse the dom
// around the original selection, and derive an update from that.

editHandlers.compositionstart = editHandlers.compositionupdate = function (view) {
  DOMChange.start(view, true)
  if (view.state.storedMarks) { view.inDOMChange.finish(true) }
}

editHandlers.compositionend = function (view, e) {
  if (!view.inDOMChange) {
    // We received a compositionend without having seen any previous
    // events for the composition. If there's data in the event
    // object, we assume that it's a real change, and start a
    // composition. Otherwise, we just ignore it.
    if (e.data) { DOMChange.start(view, true) }
    else { return }
  }

  view.inDOMChange.compositionEnd()
}

var observeOptions = {childList: true, characterData: true, attributes: true, subtree: true}
function startObserving(view) {
  if (view.mutationObserver) { view.mutationObserver.observe(view.content, observeOptions) }
}
exports.startObserving = startObserving

function stopObserving(view) {
  if (view.mutationObserver) { view.mutationObserver.disconnect() }
}
exports.stopObserving = stopObserving

function registerMutations(view, mutations) {
  if (view.editable) { for (var i = 0; i < mutations.length; i++) {
    var mut = mutations[i], desc = view.docView.nearestDesc(mut.target)
    if (mut.type == "attributes" &&
        (desc == view.docView || mut.attributeName == "contenteditable")) { continue }
    if (!desc || desc.ignoreMutation(mut)) { continue }

    var from = (void 0), to = (void 0)
    if (mut.type == "childList") {
      var fromOffset = mut.previousSibling && mut.previousSibling.parentNode == mut.target
          ? Array.prototype.indexOf.call(mut.target.childNodes, mut.previousSibling) + 1 : 0
      if (fromOffset == -1) { continue }
      from = desc.localPosFromDOM(mut.target, fromOffset, -1)
      var toOffset = mut.nextSibling && mut.nextSibling.parentNode == mut.target
          ? Array.prototype.indexOf.call(mut.target.childNodes, mut.nextSibling) : mut.target.childNodes.length
      if (toOffset == -1) { continue }
      to = desc.localPosFromDOM(mut.target, toOffset, 1)
    } else if (mut.type == "attributes") {
      from = desc.posAtStart - desc.border
      to = desc.posAtEnd + desc.border
    } else { // "characterData"
      from = desc.posAtStart
      to = desc.posAtEnd
    }

    DOMChange.start(view)
    view.inDOMChange.addRange(from, to)
  } }
}

editHandlers.input = function (view) { return DOMChange.start(view); }

handlers.copy = editHandlers.cut = function (view, e) {
  var sel = view.state.selection, cut = e.type == "cut"
  if (sel.empty) { return }
  if (!e.clipboardData || !canUpdateClipboard(e.clipboardData)) {
    if (cut && browser.ie && browser.ie_version <= 11) { DOMChange.start(view) }
    return
  }
  toClipboard(view, sel, e.clipboardData)
  e.preventDefault()
  if (cut) { view.dispatch(view.state.tr.deleteRange(sel.from, sel.to).scrollIntoView()) }
}

function sliceSingleNode(slice) {
  return slice.openLeft == 0 && slice.openRight == 0 && slice.content.childCount == 1 ? slice.content.firstChild : null
}

editHandlers.paste = function (view, e) {
  if (!e.clipboardData) {
    if (browser.ie && browser.ie_version <= 11) { DOMChange.start(view) }
    return
  }
  var slice = fromClipboard(view, e.clipboardData, view.shiftKey, view.state.selection.$from)
  if (slice) {
    e.preventDefault()
    view.someProp("transformPasted", function (f) { slice = f(slice) })
    var singleNode = sliceSingleNode(slice)
    var tr = singleNode ? view.state.tr.replaceSelectionWith(singleNode) : view.state.tr.replaceSelection(slice)
    view.dispatch(tr.scrollIntoView())
  }
}

var Dragging = function(state, slice, range, move) {
  this.slice = slice
  this.range = range
  this.move = move && new TrackMappings(state)
};

Dragging.prototype.destroy = function () {
  if (this.move) { this.move.destroy() }
};

function clearDragging(view) {
  if (view.dragging) {
    view.dragging.destroy()
    view.dragging = null
  }
}

function dropPos(slice, $pos) {
  if (!slice || !slice.content.size) { return $pos.pos }
  var content = slice.content
  for (var i = 0; i < slice.openLeft; i++) { content = content.firstChild.content }
  for (var d = $pos.depth; d >= 0; d--) {
    var bias = d == $pos.depth ? 0 : $pos.pos <= ($pos.start(d + 1) + $pos.end(d + 1)) / 2 ? -1 : 1
    var insertPos = $pos.index(d) + (bias > 0 ? 1 : 0)
    if ($pos.node(d).canReplace(insertPos, insertPos, content))
      { return bias == 0 ? $pos.pos : bias < 0 ? $pos.before(d + 1) : $pos.after(d + 1) }
  }
  return $pos.pos
}

handlers.dragstart = function (view, e) {
  var mouseDown = view.mouseDown
  if (mouseDown) { mouseDown.done() }
  if (!e.dataTransfer) { return }

  var sel = view.state.selection, draggedRange
  var pos = sel.empty ? null : view.posAtCoords(eventCoords(e))
  if (pos != null && pos.pos >= sel.from && pos.pos <= sel.to)
    { draggedRange = sel }
  else if (mouseDown && mouseDown.mightDrag)
    { draggedRange = NodeSelection.create(view.state.doc, mouseDown.mightDrag.pos) }

  if (draggedRange) {
    var slice = toClipboard(view, draggedRange, e.dataTransfer)
    view.dragging = new Dragging(view.state, slice, draggedRange, !e.ctrlKey)
  }
}

handlers.dragend = function (view) {
  window.setTimeout(function () { return clearDragging(view); }, 50)
}

editHandlers.dragover = editHandlers.dragenter = function (_, e) { return e.preventDefault(); }

editHandlers.drop = function (view, e) {
  var dragging = view.dragging
  clearDragging(view)

  if (!e.dataTransfer) { return }

  var $mouse = view.state.doc.resolve(view.posAtCoords(eventCoords(e)).pos)
  if (!$mouse) { return }
  var slice = dragging && dragging.slice || fromClipboard(view, e.dataTransfer, false, $mouse)
  if (!slice) { return }
  var insertPos = dropPos(slice, view.state.doc.resolve($mouse.pos))

  e.preventDefault()
  var tr = view.state.tr
  if (dragging && dragging.move) {
    var ref = dragging.range;
    var from = ref.from;
    var to = ref.to;
    var mapping = dragging.move.getMapping(view.state)
    if (mapping) { tr.deleteRange(mapping.map(from, 1), mapping.map(to, -1)) }
  }
  view.someProp("transformPasted", function (f) { slice = f(slice) })
  var pos = tr.mapping.map(insertPos)
  var isNode = slice.openLeft == 0 && slice.openRight == 0 && slice.content.childCount == 1
  if (isNode)
    { tr.replaceRangeWith(pos, pos, slice.content.firstChild) }
  else
    { tr.replaceRange(pos, pos, slice) }
  var $pos = tr.doc.resolve(pos)
  if (isNode && NodeSelection.isSelectable(slice.content.firstChild) &&
      $pos.nodeAfter && $pos.nodeAfter.sameMarkup(slice.content.firstChild))
    { tr.setSelection(new NodeSelection($pos)) }
  else
    { tr.setSelection(Selection.between($pos, tr.doc.resolve(tr.mapping.map(insertPos)))) }
  view.focus()
  view.dispatch(tr)
}

handlers.focus = function (view, event) {
  if (!view.focused) {
    view.content.classList.add("ProseMirror-focused")
    view.focused = true
  }
  view.someProp("onFocus", function (f) { f(view, event) })
}

handlers.blur = function (view, event) {
  if (view.focused) {
    view.content.classList.remove("ProseMirror-focused")
    view.focused = false
  }
  view.someProp("onBlur", function (f) { f(view, event) })
}

// Make sure all handlers get registered
for (var prop in editHandlers) { handlers[prop] = editHandlers[prop] }

},{"./browser":48,"./capturekeys":49,"./clipboard":50,"./domchange":52,"./trackmappings":57,"prosemirror-state":34}],56:[function(require,module,exports){
var ref = require("prosemirror-state");
var Selection = ref.Selection;
var NodeSelection = ref.NodeSelection;

var browser = require("./browser")

// Track the state of the current editor selection. Keeps the editor
// selection in sync with the DOM selection by polling for changes,
// as there is no DOM event for DOM selection changes.
var SelectionReader = function(view) {
  var this$1 = this;

  this.view = view

  // Track the state of the DOM selection.
  this.lastAnchorNode = this.lastHeadNode = this.lastAnchorOffset = this.lastHeadOffset = null
  this.lastSelection = view.state.selection
  this.poller = poller(this)

  view.content.addEventListener("focus", function () { return this$1.poller.start(); })
  view.content.addEventListener("blur", function () { return this$1.poller.stop(); })

  if (!view.editable) { this.poller.start() }
};

SelectionReader.prototype.destroy = function () { this.poller.stop() };

SelectionReader.prototype.poll = function (origin) { this.poller.poll(origin) };

SelectionReader.prototype.editableChanged = function () {
  if (!this.view.editable) { this.poller.start() }
  else if (!this.view.hasFocus()) { this.poller.stop() }
};

// : () → bool
// Whether the DOM selection has changed from the last known state.
SelectionReader.prototype.domChanged = function () {
  var sel = this.view.root.getSelection()
  return sel.anchorNode != this.lastAnchorNode || sel.anchorOffset != this.lastAnchorOffset ||
    sel.focusNode != this.lastHeadNode || sel.focusOffset != this.lastHeadOffset
};

// Store the current state of the DOM selection.
SelectionReader.prototype.storeDOMState = function (selection) {
  var sel = this.view.root.getSelection()
  this.lastAnchorNode = sel.anchorNode; this.lastAnchorOffset = sel.anchorOffset
  this.lastHeadNode = sel.focusNode; this.lastHeadOffset = sel.focusOffset
  this.lastSelection = selection
};

// : (?string) → bool
// When the DOM selection changes in a notable manner, modify the
// current selection state to match.
SelectionReader.prototype.readFromDOM = function (origin) {
  if (!this.view.hasFocus() || this.view.inDOMChange || !this.domChanged()) { return }

  var domSel = this.view.root.getSelection(), doc = this.view.state.doc
  var nearestDesc = this.view.docView.nearestDesc(domSel.focusNode)
  // If the selection is in a non-document part of the view, ignore it
  if (!nearestDesc.size) {
    this.storeDOMState()
    return
  }
  var head = this.view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset)
  var $head = doc.resolve(head), $anchor, selection
  if (domSel.isCollapsed) {
    $anchor = $head
    while (nearestDesc && !nearestDesc.node) { nearestDesc = nearestDesc.parent }
    if (nearestDesc && nearestDesc.node.isLeaf && NodeSelection.isSelectable(nearestDesc.node)) {
      var pos = nearestDesc.posAtStart
      selection = new NodeSelection(head == pos ? $head : doc.resolve(pos))
    }
  } else {
    $anchor = doc.resolve(this.view.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset))
  }

  if (!selection) {
    var bias = this.view.state.selection.head != null && this.view.state.selection.head < $head.pos ? 1 : -1
    selection = Selection.between($anchor, $head, bias)
    if (bias == -1 && selection.node)
      { selection = Selection.between($anchor, $head, 1) }
  }
  if ($head.pos == selection.head && $anchor.pos == selection.anchor)
    { this.storeDOMState(selection) }
  var tr = this.view.state.tr.setSelection(selection)
  if (origin == "pointer") { tr.setMeta("pointer", true) }
  this.view.dispatch(tr)
};
exports.SelectionReader = SelectionReader

// There's two polling models. On browsers that support the
// selectionchange event (everything except Firefox, basically), we
// register a listener for that whenever the editor is focused.
var SelectionChangePoller = function(reader) {
  var this$1 = this;

  this.listening = false
  this.curOrigin = null
  this.originTime = 0

  this.readFunc = function () { return reader.readFromDOM(this$1.originTime > Date.now() - 50 ? this$1.curOrigin : null); }
};

SelectionChangePoller.prototype.poll = function (origin) {
  this.curOrigin = origin
  this.originTime = Date.now()
};

SelectionChangePoller.prototype.start = function () {
  if (!this.listening) {
    document.addEventListener("selectionchange", this.readFunc)
    this.listening = true
  }
};

SelectionChangePoller.prototype.stop = function () {
  if (this.listening) {
    document.removeEventListener("selectionchange", this.readFunc)
    this.listening = false
  }
};

// On Firefox, we use timeout-based polling.
var TimeoutPoller = function(reader) {
  // The timeout ID for the poller when active.
  this.polling = null
  this.reader = reader
  this.pollFunc = this.doPoll.bind(this, null)
};

TimeoutPoller.prototype.doPoll = function (origin) {
  var view = this.reader.view
  if (view.focused || !view.editable) {
    this.reader.readFromDOM(origin)
    this.polling = setTimeout(this.pollFunc, 100)
  } else {
    this.polling = null
  }
};

TimeoutPoller.prototype.poll = function (origin) {
  clearTimeout(this.polling)
  this.polling = setTimeout(origin ? this.doPoll.bind(this, origin) : this.pollFunc, 0)
};

TimeoutPoller.prototype.start = function () {
  if (this.polling == null) { this.poll() }
};

TimeoutPoller.prototype.stop = function () {
  clearTimeout(this.polling)
  this.polling = null
};

function poller(reader) {
  return new ("onselectionchange" in document ? SelectionChangePoller : TimeoutPoller)(reader)
}

function selectionToDOM(view, sel, takeFocus) {
  syncNodeSelection(view, sel)

  if (!view.hasFocus()) {
    if (!takeFocus) { return }
    // See https://bugzilla.mozilla.org/show_bug.cgi?id=921444
    else if (browser.gecko && view.editable) { view.content.focus() }
  }

  var reader = view.selectionReader
  if (sel == reader.lastSelection && !reader.domChanged()) { return }
  var anchor = sel.anchor;
  var head = sel.head;
  var resetEditable
  if (anchor == null) {
    anchor = sel.from
    head = sel.to
    if (browser.webkit && sel.node.isBlock) {
      var desc = view.docView.descAt(sel.from)
      if (!desc.contentDOM && desc.dom.contentEditable == "false") {
        resetEditable = desc.dom
        desc.dom.contentEditable = "true"
      }
    }
  }
  view.docView.setSelection(anchor, head, view.root)
  if (resetEditable) { resetEditable.contentEditable = "false" }
  reader.storeDOMState(sel)
}
exports.selectionToDOM = selectionToDOM

function syncNodeSelection(view, sel) {
  if (sel instanceof NodeSelection) {
    var desc = view.docView.descAt(sel.from)
    if (desc != view.lastSelectedViewDesc) {
      clearNodeSelection(view)
      if (desc) { desc.selectNode() }
      view.lastSelectedViewDesc = desc
    }
  } else {
    clearNodeSelection(view)
  }
}

// Clear all DOM statefulness of the last node selection.
function clearNodeSelection(view) {
  if (view.lastSelectedViewDesc) {
    view.lastSelectedViewDesc.deselectNode()
    view.lastSelectedViewDesc = null
  }
}

},{"./browser":48,"prosemirror-state":34}],57:[function(require,module,exports){
var ref = require("prosemirror-state");
var EditorState = ref.EditorState;
var ref$1 = require("prosemirror-transform");
var Mapping = ref$1.Mapping;

var TrackedRecord = function(prev, mapping, state) {
  this.prev = prev
  this.mapping = mapping
  this.state = state
};

var TrackMappings = function(state) {
  this.seen = [new TrackedRecord(null, null, state)]
  // Kludge to listen to state changes globally in order to be able
  // to find mappings from a given state to another.
  EditorState.addApplyListener(this.track = this.track.bind(this))
};

TrackMappings.prototype.destroy = function () {
  EditorState.removeApplyListener(this.track)
};

TrackMappings.prototype.find = function (state) {
    var this$1 = this;

  for (var i = this.seen.length - 1; i >= 0; i--) {
    var record = this$1.seen[i]
    if (record.state == state) { return record }
  }
};

TrackMappings.prototype.track = function (old, tr, state) {
  var found = this.seen.length < 200 ? this.find(old) : null
  if (found)
    { this.seen.push(new TrackedRecord(found, tr.docChanged ? tr.mapping : null, state)) }
};

TrackMappings.prototype.getMapping = function (state) {
  var found = this.find(state)
  if (!found) { return null }
  var mappings = []
  for (var rec = found; rec; rec = rec.prev)
    { if (rec.mapping) { mappings.push(rec.mapping) } }
  var result = new Mapping
  for (var i = mappings.length - 1; i >= 0; i--)
    { result.appendMapping(mappings[i]) }
  return result
};
exports.TrackMappings = TrackMappings

},{"prosemirror-state":34,"prosemirror-transform":39}],58:[function(require,module,exports){
var ref = require("prosemirror-model");
var DOMSerializer = ref.DOMSerializer;

var browser = require("./browser")

// NodeView:: interface
//
// By default, document nodes are rendered using the result of the
// [`toDOM`](#view.NodeSpec.toDOM) method of their spec, and managed
// entirely by the editor. For some use cases, such as embedded
// node-specific editing interfaces, when you need more control over
// the behavior of a node's in-editor representation, and can
// [define](#view.EditorProps.nodeViews) a custom node view.
//
//   dom:: ?dom.Node
//   The outer DOM node that represents the document node. When not
//   given, the default strategy is used to create a DOM node.
//
//   contentDOM:: ?dom.Node
//   The DOM node that should hold the node's content. Only meaningful
//   if the node view also defines a `dom` property and if its node
//   type is not a leaf node type. When this is present, ProseMirror
//   will take care of rendering the node's children into it. When it
//   is not present, the node view itself is responsible for rendering
//   (or deciding not to render) its child nodes.
//
//   update:: ?(node: Node, decorations: [Decoration]) → bool
//   When given, this will be called when the view is updating itself.
//   It will be given a node (possibly of a different type), and an
//   array of active decorations (which are automatically drawn, and
//   the node view may ignore if it isn't interested in them), and
//   should return true if it was able to update to that node, and
//   false otherwise. If the node view has a `contentDOM` property (or
//   no `dom` property), updating its child nodes will be handled by
//   ProseMirror.
//
//   selectNode:: ?()
//   Can be used to override the way the node's selected status (as a
//   node selection) is displayed.
//
//   deselectNode:: ?()
//   When defining a `selectNode` method, you should also provide a
//   `deselectNode` method to disable it again.
//
//   setSelection:: ?(anchor: number, head: number, root: dom.Document)
//   This will be called to handle setting the selection inside the
//   node. By default, a DOM selection will be created between the DOM
//   positions corresponding to the given anchor and head positions,
//   but if you override it you can do something else.
//
//   stopEvent:: ?(event: dom.Event) → bool
//   Can be used to prevent the editor view from trying to handle some
//   or all DOM events that bubble up from the node view.
//
//   ignoreMutation:: ?(dom.MutationRecord) → bool
//   Called when a DOM
//   [mutation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
//   happens within the view. Return false if the editor should
//   re-parse the range around the mutation, true if it can safely be
//   ignored.
//
//   destroy:: ?()
//   Called when the node view is removed from the editor or the whole
//   editor is detached.

// View descriptions are data structures that describe the DOM that is
// used to represent the editor's content. They are used for:
//
// - Incremental redrawing when the document changes
//
// - Figuring out what part of the document a given DOM position
//   corresponds to
//
// - Wiring in custom implementations of the editing interface for a
//   given node
//
// They form a doubly-linked mutable tree, starting at `view.docView`.

var NOT_DIRTY = 0, CHILD_DIRTY = 1, CONTENT_DIRTY = 2, NODE_DIRTY = 3

// Superclass for the various kinds of descriptions. Defines their
// basic structure and shared methods.
var ViewDesc = function(parent, children, dom, contentDOM) {
  this.parent = parent
  this.children = children
  this.dom = dom
  // An expando property on the DOM node provides a link back to its
  // description.
  dom.pmViewDesc = this
  // This is the node that holds the child views. It may be null for
  // descs that don't have children.
  this.contentDOM = contentDOM
  this.dirty = NOT_DIRTY
};

var prototypeAccessors = { size: {},border: {},posAtStart: {},posAtEnd: {},contentLost: {} };

// Used to check whether a given description corresponds to a
// widget/mark/node.
ViewDesc.prototype.matchesWidget = function () { return false };
ViewDesc.prototype.matchesMark = function () { return false };
ViewDesc.prototype.matchesNode = function () { return false };
ViewDesc.prototype.matchesHack = function () { return false };

// : () → ?ParseRule
// When parsing in-editor content (in domchange.js), we allow
// descriptions to determine the parse rules that should be used to
// parse them.
ViewDesc.prototype.parseRule = function () { return null };

// : (dom.Event) → bool
// Used by the editor's event handler to ignore events that come
// from certain descs.
ViewDesc.prototype.stopEvent = function () { return false };

// The size of the content represented by this desc.
prototypeAccessors.size.get = function () {
    var this$1 = this;

  var size = 0
  for (var i = 0; i < this.children.length; i++) { size += this$1.children[i].size }
  return size
};

// For block nodes, this represents the space taken up by their
// start/end tokens.
prototypeAccessors.border.get = function () { return 0 };

ViewDesc.prototype.destroy = function () {
    var this$1 = this;

  this.parent = this.dom.pmViewDesc = null
  for (var i = 0; i < this.children.length; i++)
    { this$1.children[i].destroy() }
};

ViewDesc.prototype.posBeforeChild = function (child) {
    var this$1 = this;

  for (var i = 0, pos = this.posAtStart; i < this.children.length; i++) {
    var cur = this$1.children[i]
    if (cur == child) { return pos }
    pos += cur.size
  }
};

prototypeAccessors.posAtStart.get = function () {
  return this.parent ? this.parent.posBeforeChild(this) + this.border : 0
};

prototypeAccessors.posAtEnd.get = function () {
  return this.posAtStart + this.size - 2 * this.border
};

// : (dom.Node, number, ?number) → number
ViewDesc.prototype.localPosFromDOM = function (dom, offset, bias) {
    var this$1 = this;

  // If the DOM position is in the content, use the child desc after
  // it to figure out a position.
  if (this.contentDOM && this.contentDOM.contains(dom.nodeType == 1 ? dom : dom.parentNode)) {
    if (bias < 0) {
      var domBefore, desc
      if (dom == this.contentDOM) {
        domBefore = dom.childNodes[offset - 1]
      } else {
        while (dom.parentNode != this.contentDOM) { dom = dom.parentNode }
        domBefore = dom.previousSibling
      }
      while (domBefore && !((desc = domBefore.pmViewDesc) && desc.parent == this)) { domBefore = domBefore.previousSibling }
      return domBefore ? this.posBeforeChild(desc) + desc.size : this.posAtStart
    } else {
      var domAfter, desc$1
      if (dom == this.contentDOM) {
        domAfter = dom.childNodes[offset]
      } else {
        while (dom.parentNode != this.contentDOM) { dom = dom.parentNode }
        domAfter = dom.nextSibling
      }
      while (domAfter && !((desc$1 = domAfter.pmViewDesc) && desc$1.parent == this)) { domAfter = domAfter.nextSibling }
      return domAfter ? this.posBeforeChild(desc$1) : this.posAtEnd
    }
  }
  // Otherwise, use various heuristics, falling back on the bias
  // parameter, to determine whether to return the position at the
  // start or at the end of this view desc.
  var atEnd
  if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM)) {
    atEnd = dom.compareDocumentPosition(this.contentDOM) & 2
  } else if (this.dom.firstChild) {
    if (offset == 0) { for (var search = dom;; search = search.parentNode) {
      if (search == this$1.dom) { atEnd = false; break }
      if (search.parentNode.firstChild != search) { break }
    } }
    if (atEnd == null && offset == dom.childNodes.length) { for (var search$1 = dom;; search$1 = search$1.parentNode) {
      if (search$1 == this$1.dom) { atEnd = true; break }
      if (search$1.parentNode.lastChild != search$1) { break }
    } }
  }
  return (atEnd == null ? bias > 0 : atEnd) ? this.posAtEnd : this.posAtStart
};

// Scan up the dom finding the first desc that is a descendant of
// this one.
ViewDesc.prototype.nearestDesc = function (dom, onlyNodes) {
    var this$1 = this;

  for (var first = true, cur = dom; cur; cur = cur.parentNode) {
    var desc = this$1.getDesc(cur)
    if (desc && (!onlyNodes || desc.node)) {
      if (first && desc.nodeDOM && !desc.nodeDOM.contains(dom)) { first = false }
      else { return desc }
    }
  }
};

ViewDesc.prototype.getDesc = function (dom) {
    var this$1 = this;

  var desc = dom.pmViewDesc
  for (var cur = desc; cur; cur = cur.parent) { if (cur == this$1) { return desc } }
};

ViewDesc.prototype.posFromDOM = function (dom, offset, bias) {
    var this$1 = this;

  for (var scan = dom;; scan = scan.parentNode) {
    var desc = this$1.getDesc(scan)
    if (desc) { return desc.localPosFromDOM(dom, offset, bias) }
  }
};

// : (number) → ?NodeViewDesc
// Find the desc for the node after the given pos, if any. (When a
// parent node overrode rendering, there might not be one.)
ViewDesc.prototype.descAt = function (pos) {
    var this$1 = this;

  for (var i = 0, offset = 0; i < this.children.length; i++) {
    var child = this$1.children[i], end = offset + child.size
    if (offset == pos && end != offset) {
      while (!child.border && child.children.length) { child = child.children[0] }
      return child
    }
    if (pos < end) { return child.descAt(pos - offset - child.border) }
    offset = end
  }
};

// : (number, ?bool) → {node: dom.Node, offset: number}
ViewDesc.prototype.domFromPos = function (pos, searchDOM) {
    var this$1 = this;

  if (!this.contentDOM) { return {node: this.dom, offset: 0} }
  for (var offset = 0, i = 0;; i++) {
    if (offset == pos)
      { return {node: this$1.contentDOM,
              offset: searchDOM ? this$1.findDOMOffset(i, searchDOM) : i} }
    if (i == this$1.children.length) { throw new Error("Invalid position " + pos) }
    var child = this$1.children[i], end = offset + child.size
    if (pos < end) { return child.domFromPos(pos - offset - child.border, searchDOM) }
    offset = end
  }
};

// If the DOM was directly edited, we can't trust the child view
// desc offsets anymore, so we search the actual DOM to figure out
// the offset that corresponds to a given child.
ViewDesc.prototype.findDOMOffset = function (i, searchDOM) {
    var this$1 = this;

  var content = this.contentDOM
  if (searchDOM < 0) {
    for (var j = i - 1; j >= 0; j--) {
      var child = this$1.children[j]
      if (!child.size) { continue }
      var found = Array.prototype.indexOf.call(content.childNodes, child.dom)
      if (found > -1) { return found + 1 }
    }
    return 0
  } else {
    for (var j$1 = i; j$1 < this.children.length; j$1++) {
      var child$1 = this$1.children[j$1]
      if (!child$1.size) { continue }
      var found$1 = Array.prototype.indexOf.call(content.childNodes, child$1.dom)
      if (found$1 > -1) { return found$1 }
    }
    return content.childNodes.length
  }
};

// : (number) → dom.Node
ViewDesc.prototype.domAfterPos = function (pos) {
  var ref = this.domFromPos(pos);
    var node = ref.node;
    var offset = ref.offset;
  if (node.nodeType != 1 || offset == node.childNodes.length)
    { throw new RangeError("No node after pos " + pos) }
  return node.childNodes[offset]
};

// : (number, number, dom.Document)
// View descs are responsible for setting any selection that falls
// entirely inside of them, so that custom implementations can do
// custom things with the selection. Note that this falls apart when
// a selection starts in such a node and ends in another, in which
// case we just use whatever domFromPos produces as a best effort.
ViewDesc.prototype.setSelection = function (anchor, head, root) {
    var this$1 = this;

  // If the selection falls entirely in a child, give it to that child
  var from = Math.min(anchor, head), to = Math.max(anchor, head)
  for (var i = 0, offset = 0; i < this.children.length; i++) {
    var child = this$1.children[i], end = offset + child.size
    if (from > offset && to < end)
      { return child.setSelection(anchor - offset - child.border, head - offset - child.border, root) }
    offset = end
  }

  var anchorDOM = this.domFromPos(anchor), headDOM = this.domFromPos(head)
  var domSel = root.getSelection(), range = document.createRange()

  // Selection.extend can be used to create an 'inverted' selection
  // (one where the focus is before the anchor), but not all
  // browsers support it yet.
  if (domSel.extend) {
    range.setEnd(anchorDOM.node, anchorDOM.offset)
    range.collapse(false)
  } else {
    if (anchor > head) { var tmp = anchorDOM; anchorDOM = headDOM; headDOM = tmp }
    range.setEnd(headDOM.node, headDOM.offset)
    range.setStart(anchorDOM.node, anchorDOM.offset)
  }
  domSel.removeAllRanges()
  domSel.addRange(range)
  if (domSel.extend)
    { domSel.extend(headDOM.node, headDOM.offset) }
};

// : (dom.MutationRecord) → bool
ViewDesc.prototype.ignoreMutation = function (_mutation) {
  return !this.contentDOM
};

prototypeAccessors.contentLost.get = function () {
  return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM)
};

// Remove a subtree of the element tree that has been touched
// by a DOM change, so that the next update will redraw it.
ViewDesc.prototype.markDirty = function (from, to) {
    var this$1 = this;

  for (var offset = 0, i = 0; i < this.children.length; i++) {
    var child = this$1.children[i], end = offset + child.size
    if (offset == end ? from <= end && to >= offset : from < end && to > offset) {
      var startInside = offset + child.border, endInside = end - child.border
      if (from >= startInside && to <= endInside) {
        this$1.dirty = from == offset || to == end ? CONTENT_DIRTY : CHILD_DIRTY
        if (from == startInside && to == endInside && child.contentLost) { child.dirty = NODE_DIRTY }
        else { child.markDirty(from - startInside, to - startInside) }
        return
      } else {
        child.dirty = NODE_DIRTY
      }
    }
    offset = end
  }
  this.dirty = CONTENT_DIRTY
};

Object.defineProperties( ViewDesc.prototype, prototypeAccessors );

// Reused array to avoid allocating fresh arrays for things that will
// stay empty anyway.
var nothing = []

// A widget desc represents a widget decoration, which is a DOM node
// drawn between the document nodes.
var WidgetViewDesc = (function (ViewDesc) {
  function WidgetViewDesc(parent, widget) {
    ViewDesc.call(this, parent, nothing, widget.type.widget, null)
    this.widget = widget
  }

  if ( ViewDesc ) WidgetViewDesc.__proto__ = ViewDesc;
  WidgetViewDesc.prototype = Object.create( ViewDesc && ViewDesc.prototype );
  WidgetViewDesc.prototype.constructor = WidgetViewDesc;

  WidgetViewDesc.prototype.matchesWidget = function (widget) { return this.dirty == NOT_DIRTY && widget.type == this.widget.type };

  WidgetViewDesc.prototype.parseRule = function () { return {ignore: true} };

  WidgetViewDesc.prototype.stopEvent = function (event) {
    var stop = this.widget.type.options.stopEvent
    return stop ? stop(event) : false
  };

  return WidgetViewDesc;
}(ViewDesc));

// A mark desc represents a mark. May have multiple children,
// depending on how the mark is split. Note that marks are drawn using
// a fixed nesting order, for simplicity and predictability, so in
// some cases they will be split more often than would appear
// necessary.
var MarkViewDesc = (function (ViewDesc) {
  function MarkViewDesc(parent, mark, dom) {
    ViewDesc.call(this, parent, [], dom, dom)
    this.mark = mark
  }

  if ( ViewDesc ) MarkViewDesc.__proto__ = ViewDesc;
  MarkViewDesc.prototype = Object.create( ViewDesc && ViewDesc.prototype );
  MarkViewDesc.prototype.constructor = MarkViewDesc;

  MarkViewDesc.create = function (parent, mark, view) {
    var custom = customNodeViews(view)[mark.type.name]
    var spec = custom && custom(mark, view)
    var dom = spec && spec.dom || DOMSerializer.renderSpec(document, mark.type.spec.toDOM(mark)).dom
    return new MarkViewDesc(parent, mark, dom)
  };

  MarkViewDesc.prototype.parseRule = function () { return {mark: this.mark.type.name, attrs: this.mark.attrs, contentElement: this.contentDOM} };

  MarkViewDesc.prototype.matchesMark = function (mark) { return this.dirty != NODE_DIRTY && this.mark.eq(mark) };

  return MarkViewDesc;
}(ViewDesc));

// Node view descs are the main, most common type of view desc, and
// correspond to an actual node in the document. Unlike mark descs,
// they populate their child array themselves.
var NodeViewDesc = (function (ViewDesc) {
  function NodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view) {
    ViewDesc.call(this, parent, node.isLeaf ? nothing : [], dom, contentDOM)
    this.nodeDOM = nodeDOM
    this.node = node
    this.outerDeco = outerDeco
    this.innerDeco = innerDeco
    if (contentDOM) { this.updateChildren(view) }
  }

  if ( ViewDesc ) NodeViewDesc.__proto__ = ViewDesc;
  NodeViewDesc.prototype = Object.create( ViewDesc && ViewDesc.prototype );
  NodeViewDesc.prototype.constructor = NodeViewDesc;

  var prototypeAccessors$1 = { size: {},border: {} };

  // By default, a node is rendered using the `toDOM` method from the
  // node type spec. But client code can use the `nodeViews` spec to
  // supply a custom node view, which can influence various aspects of
  // the way the node works.
  //
  // (Using subclassing for this was intentionally decided against,
  // since it'd require exposing a whole slew of finnicky
  // implementation details to the user code that they probably will
  // never need.)
  NodeViewDesc.create = function (parent, node, outerDeco, innerDeco, view) {
    var custom = customNodeViews(view)[node.type.name], descObj
    var spec = custom && custom(node, view, function () {
      // (This is a function that allows the custom view to find its
      // own position)
      if (descObj && descObj.parent) { return descObj.parent.posBeforeChild(descObj) }
    }, outerDeco)

    var dom = spec && spec.dom, contentDOM = spec && spec.contentDOM
    if (!dom) { var assign;
      ((assign = DOMSerializer.renderSpec(document, node.type.spec.toDOM(node)), dom = assign.dom, contentDOM = assign.contentDOM)) }
    if (!contentDOM && !node.isText) { dom.contentEditable = false }

    var nodeDOM = dom
    dom = applyOuterDeco(dom, outerDeco, node)

    if (spec)
      { return descObj = new CustomNodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, spec, view) }
    else if (node.isText)
      { return new TextViewDesc(parent, node, outerDeco, innerDeco, dom, nodeDOM, view) }
    else
      { return new NodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view) }
  };

  NodeViewDesc.prototype.parseRule = function () {
    return {node: this.node.type.name, attrs: this.node.attrs, contentElement: this.contentLost ? null : this.contentDOM}
  };

  NodeViewDesc.prototype.matchesNode = function (node, outerDeco, innerDeco) {
    return this.dirty == NOT_DIRTY && node.eq(this.node) &&
      sameOuterDeco(outerDeco, this.outerDeco) && innerDeco.eq(this.innerDeco)
  };

  prototypeAccessors$1.size.get = function () { return this.node.nodeSize };

  prototypeAccessors$1.border.get = function () { return this.node.isLeaf ? 0 : 1 };

  // Syncs `this.children` to match `this.node.content` and the local
  // decorations, possibly introducing nesting for marks. Then, in a
  // separate step, syncs the DOM inside `this.contentDOM` to
  // `this.children`.
  NodeViewDesc.prototype.updateChildren = function (view) {
    var this$1 = this;

    var updater = new ViewTreeUpdater(this)
    iterDeco(this.node, this.innerDeco, function (widget) {
      // If the next node is a desc matching this widget, reuse it,
      // otherwise insert the widget as a new view desc.
      updater.placeWidget(widget)
    }, function (child, outerDeco, innerDeco, i) {
      // Make sure the wrapping mark descs match the node's marks.
      updater.syncToMarks(child.marks, view)
      // Either find an existing desc that exactly matches this node,
      // and drop the descs before it.
      updater.findNodeMatch(child, outerDeco, innerDeco) ||
        // Or try updating the next desc to reflect this node.
        updater.updateNextNode(child, outerDeco, innerDeco, view, this$1.node.content, i) ||
        // Or just add it as a new desc.
        updater.addNode(child, outerDeco, innerDeco, view)
    })
    // Drop all remaining descs after the current position.
    updater.syncToMarks(nothing, view)
    if (this.node.isTextblock) { updater.addTextblockHacks() }
    updater.destroyRest()

    // Sync the DOM if anything changed
    if (updater.changed || this.dirty == CONTENT_DIRTY) { this.renderChildren() }
  };

  NodeViewDesc.prototype.renderChildren = function () {
    renderDescs(this.contentDOM, this.children, NodeViewDesc.is)
    if (browser.ios) { iosHacks(this.dom) }
  };

  // : (Node, [Decoration], DecorationSet, EditorView) → bool
  // If this desc be updated to match the given node decoration,
  // do so and return true.
  NodeViewDesc.prototype.update = function (node, outerDeco, innerDeco, view) {
    if (this.dirty == NODE_DIRTY ||
        !node.sameMarkup(this.node)) { return false }
    this.updateOuterDeco(outerDeco)
    this.node = node
    this.innerDeco = innerDeco
    if (!node.isLeaf) { this.updateChildren(view) }
    this.dirty = NOT_DIRTY
    return true
  };

  NodeViewDesc.prototype.updateOuterDeco = function (outerDeco) {
    if (sameOuterDeco(outerDeco, this.outerDeco)) { return }
    var needsWrap = this.nodeDOM.nodeType != 1
    this.dom = patchOuterDeco(this.dom, this.nodeDOM,
                              computeOuterDeco(this.outerDeco, this.node, needsWrap),
                              computeOuterDeco(outerDeco, this.node, needsWrap))
    this.outerDeco = outerDeco
  };

  // Mark this node as being the selected node.
  NodeViewDesc.prototype.selectNode = function () {
    this.nodeDOM.classList.add("ProseMirror-selectednode")
  };

  // Remove selected node marking from this node.
  NodeViewDesc.prototype.deselectNode = function () {
    this.nodeDOM.classList.remove("ProseMirror-selectednode")
  };

  Object.defineProperties( NodeViewDesc.prototype, prototypeAccessors$1 );

  return NodeViewDesc;
}(ViewDesc));

// Create a view desc for the top-level document node, to be exported
// and used by the view class.
function docViewDesc(doc, outerDeco, innerDeco, dom, view) {
  applyOuterDeco(dom, outerDeco, doc, true)
  return new NodeViewDesc(null, doc, outerDeco, innerDeco, dom, dom, dom, view)
}
exports.docViewDesc = docViewDesc

var TextViewDesc = (function (NodeViewDesc) {
  function TextViewDesc(parent, node, outerDeco, innerDeco, dom, nodeDOM, view) {
    NodeViewDesc.call(this, parent, node, outerDeco, innerDeco, dom, null, nodeDOM, view)
  }

  if ( NodeViewDesc ) TextViewDesc.__proto__ = NodeViewDesc;
  TextViewDesc.prototype = Object.create( NodeViewDesc && NodeViewDesc.prototype );
  TextViewDesc.prototype.constructor = TextViewDesc;

  TextViewDesc.prototype.parseRule = function () {
    return {skip: this.nodeDOM.parentNode}
  };

  TextViewDesc.prototype.update = function (node, outerDeco) {
    if (this.dirty == NODE_DIRTY || (this.dirty != NOT_DIRTY && !this.inParent()) ||
        !node.sameMarkup(this.node)) { return false }
    this.updateOuterDeco(outerDeco)
    if ((this.dirty != NOT_DIRTY || node.text != this.node.text) && node.text != this.nodeDOM.nodeValue)
      { this.nodeDOM.nodeValue = node.text }
    this.node = node
    this.dirty = NOT_DIRTY
    return true
  };

  TextViewDesc.prototype.inParent = function () {
    var parentDOM = this.parent.contentDOM
    for (var n = this.nodeDOM; n; n = n.parentNode) { if (n == parentDOM) { return true } }
    return false
  };

  TextViewDesc.prototype.domFromPos = function (pos, searchDOM) {
    return {node: this.nodeDOM, offset: searchDOM ? Math.max(pos, this.nodeDOM.nodeValue.length) : pos}
  };

  TextViewDesc.prototype.localPosFromDOM = function (dom, offset, bias) {
    if (dom == this.nodeDOM) { return this.posAtStart + Math.min(offset, this.node.text.length) }
    return NodeViewDesc.prototype.localPosFromDOM.call(this, dom, offset, bias)
  };

  TextViewDesc.prototype.ignoreMutation = function (mutation) {
    return mutation.type != "characterData"
  };

  return TextViewDesc;
}(NodeViewDesc));

// A dummy desc used to tag trailing BR or span nodes created to work
// around contentEditable terribleness.
var BRHackViewDesc = (function (ViewDesc) {
  function BRHackViewDesc () {
    ViewDesc.apply(this, arguments);
  }

  if ( ViewDesc ) BRHackViewDesc.__proto__ = ViewDesc;
  BRHackViewDesc.prototype = Object.create( ViewDesc && ViewDesc.prototype );
  BRHackViewDesc.prototype.constructor = BRHackViewDesc;

  BRHackViewDesc.prototype.parseRule = function () { return {ignore: true} };
  BRHackViewDesc.prototype.matchesHack = function () { return this.dirty == NOT_DIRTY };

  return BRHackViewDesc;
}(ViewDesc));

// A separate subclass is used for customized node views, so that the
// extra checks only have to be made for nodes that are actually
// customized.
var CustomNodeViewDesc = (function (NodeViewDesc) {
  function CustomNodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, spec, view) {
    NodeViewDesc.call(this, parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view)
    this.spec = spec
  }

  if ( NodeViewDesc ) CustomNodeViewDesc.__proto__ = NodeViewDesc;
  CustomNodeViewDesc.prototype = Object.create( NodeViewDesc && NodeViewDesc.prototype );
  CustomNodeViewDesc.prototype.constructor = CustomNodeViewDesc;

  // A custom `update` method gets to decide whether the update goes
  // through. If it does, and there's a `contentDOM` node, our logic
  // updates the children.
  CustomNodeViewDesc.prototype.update = function (node, outerDeco, innerDeco, view) {
    if (this.dirty == NODE_DIRTY) { return false }
    if (this.spec.update) {
      var result = this.spec.update(node, outerDeco)
      if (result) {
        this.node = node
        if (this.contentDOM) { this.updateChildren(view) }
      }
      return result
    } else if (!this.contentDOM && !node.isLeaf) {
      return false
    } else {
      return NodeViewDesc.prototype.update.call(this, node, outerDeco, this.contentDOM ? this.innerDeco : innerDeco, view)
    }
  };

  CustomNodeViewDesc.prototype.selectNode = function () {
    this.spec.selectNode ? this.spec.selectNode() : NodeViewDesc.prototype.selectNode.call(this)
  };

  CustomNodeViewDesc.prototype.deselectNode = function () {
    this.spec.deselectNode ? this.spec.deselectNode() : NodeViewDesc.prototype.deselectNode.call(this)
  };

  CustomNodeViewDesc.prototype.setSelection = function (anchor, head, root) {
    this.spec.setSelection ? this.spec.setSelection(anchor, head, root) : NodeViewDesc.prototype.setSelection.call(this, anchor, head, root)
  };

  CustomNodeViewDesc.prototype.destroy = function () {
    if (this.spec.destroy) { this.spec.destroy() }
    NodeViewDesc.prototype.destroy.call(this)
  };

  CustomNodeViewDesc.prototype.stopEvent = function (event) {
    return this.spec.stopEvent ? this.spec.stopEvent(event) : false
  };

  CustomNodeViewDesc.prototype.ignoreMutation = function (mutation) {
    return this.spec.ignoreMutation ? this.spec.ignoreMutation(mutation) : NodeViewDesc.prototype.ignoreMutation.call(this, mutation)
  };

  return CustomNodeViewDesc;
}(NodeViewDesc));

// : (dom.Node, [ViewDesc])
// Sync the content of the given DOM node with the nodes associated
// with the given array of view descs, recursing into mark descs
// because this should sync the subtree for a whole node at a time.
function renderDescs(parentDOM, descs) {
  var dom = parentDOM.firstChild
  for (var i = 0; i < descs.length; i++) {
    var desc = descs[i], childDOM = desc.dom
    if (childDOM.parentNode == parentDOM) {
      while (childDOM != dom) { dom = rm(dom) }
      dom = dom.nextSibling
    } else {
      parentDOM.insertBefore(childDOM, dom)
    }
    if (desc instanceof MarkViewDesc)
      { renderDescs(desc.contentDOM, desc.children) }
  }
  while (dom) { dom = rm(dom) }
}

var OuterDecoLevel = function(nodeName) {
  if (nodeName) { this.nodeName = nodeName }
};
OuterDecoLevel.prototype = Object.create(null)

var noDeco = [new OuterDecoLevel]

function computeOuterDeco(outerDeco, node, needsWrap) {
  if (outerDeco.length == 0) { return noDeco }

  var top = needsWrap ? noDeco[0] : new OuterDecoLevel, result = [top]

  for (var i = 0; i < outerDeco.length; i++) {
    var attrs = outerDeco[i].type.attrs, cur = top
    if (!attrs) { continue }
    if (attrs.nodeName)
      { result.push(cur = new OuterDecoLevel(attrs.nodeName)) }

    for (var name in attrs) {
      var val = attrs[name]
      if (val == null) { continue }
      if (needsWrap && result.length == 1)
        { result.push(cur = top = new OuterDecoLevel(node.isInline ? "span" : "div")) }
      if (name == "class") { cur.class = (cur.class ? cur.class + " " : "") + val }
      else if (name == "style") { cur.style = (cur.style ? cur.style + ";" : "") + val }
      else if (name != "nodeName") { cur[name] = val }
    }
  }

  return result
}

function patchOuterDeco(outerDOM, nodeDOM, prevComputed, curComputed) {
  // Shortcut for trivial case
  if (prevComputed == noDeco && curComputed == noDeco) { return nodeDOM }

  var curDOM = nodeDOM
  for (var i = 0; i < curComputed.length; i++) {
    var deco = curComputed[i], prev = prevComputed[i]
    if (i) {
      var parent = (void 0)
      if (prev && prev.nodeName == deco.nodeName && curDOM != outerDOM &&
          (parent = nodeDOM.parentNode) && parent.tagName.toLowerCase() == deco.nodeName) {
        curDOM = parent
      } else {
        parent = document.createElement(deco.nodeName)
        parent.appendChild(curDOM)
        curDOM = parent
      }
    }
    patchAttributes(curDOM, prev || noDeco[0], deco)
  }
  return curDOM
}

function patchAttributes(dom, prev, cur) {
  for (var name in prev)
    { if (name != "class" && name != "style" && name != "nodeName" && !(name in cur))
      { dom.removeAttribute(name) } }
  for (var name$1 in cur)
    { if (name$1 != "class" && name$1 != "style" && name$1 != "nodeName" && cur[name$1] != prev[name$1])
      { dom.setAttribute(name$1, cur[name$1]) } }
  if (prev.class != cur.class) {
    var prevList = prev.class ? prev.class.split(" ") : nothing
    var curList = cur.class ? cur.class.split(" ") : nothing
    for (var i = 0; i < prevList.length; i++) { if (curList.indexOf(prevList[i]) == -1)
      { dom.classList.remove(prevList[i]) } }
    for (var i$1 = 0; i$1 < curList.length; i$1++) { if (prevList.indexOf(curList[i$1]) == -1)
      { dom.classList.add(curList[i$1]) } }
  }
  if (prev.style != cur.style) {
    var text = dom.style.cssText, found
    if (prev.style && (found = text.indexOf(prev.style)) > -1)
      { text = text.slice(0, found) + text.slice(found + prev.style.length) }
    dom.style.cssText = text + (cur.style || "")
  }
}

function applyOuterDeco(dom, deco, node) {
  return patchOuterDeco(dom, dom, noDeco, computeOuterDeco(deco, node, dom.nodeType != 1))
}

// : ([Decoration], [Decoration]) → bool
function sameOuterDeco(a, b) {
  if (a.length != b.length) { return false }
  for (var i = 0; i < a.length; i++) { if (!a[i].type.eq(b[i].type)) { return false } }
  return true
}

// Remove a DOM node and return its next sibling.
function rm(dom) {
  var next = dom.nextSibling
  dom.parentNode.removeChild(dom)
  return next
}

// Helper class for incrementally updating a tree of mark descs and
// the widget and node descs inside of them.
var ViewTreeUpdater = function(top) {
  this.top = top
  // Index into `this.top`'s child array, represents the current
  // update position.
  this.index = 0
  // When entering a mark, the current top and index are pushed
  // onto this.
  this.stack = []
  // Tracks whether anything was changed
  this.changed = false
};

// Destroy and remove the children between the given indices in
// `this.top`.
ViewTreeUpdater.prototype.destroyBetween = function (start, end) {
    var this$1 = this;

  if (start == end) { return }
  for (var i = start; i < end; i++) { this$1.top.children[i].destroy() }
  this.top.children.splice(start, end - start)
  this.changed = true
};

// Destroy all remaining children in `this.top`.
ViewTreeUpdater.prototype.destroyRest = function () {
  this.destroyBetween(this.index, this.top.children.length)
};

// : ([Mark], EditorView)
// Sync the current stack of mark descs with the given array of
// marks, reusing existing mark descs when possible.
ViewTreeUpdater.prototype.syncToMarks = function (marks, view) {
    var this$1 = this;

  var keep = 0, depth = this.stack.length >> 1
  var maxKeep = Math.min(depth, marks.length), next
  while (keep < maxKeep &&
         (keep == depth - 1 ? this.top : this.stack[(keep + 1) << 1]).matchesMark(marks[keep]))
    { keep++ }

  while (keep < depth) {
    this$1.destroyRest()
    this$1.top.dirty = NOT_DIRTY
    this$1.index = this$1.stack.pop()
    this$1.top = this$1.stack.pop()
    depth--
  }
  while (depth < marks.length) {
    this$1.stack.push(this$1.top, this$1.index + 1)
    if (this$1.index < this$1.top.children.length &&
        (next = this$1.top.children[this$1.index]).matchesMark(marks[depth])) {
      this$1.top = next
    } else {
      var markDesc = MarkViewDesc.create(this$1.top, marks[depth], view)
      this$1.top.children.splice(this$1.index, 0, markDesc)
      this$1.top = markDesc
      this$1.changed = true
    }
    this$1.index = 0
    depth++
  }
};

// : (Node, [Decoration], DecorationSet) → bool
// Try to find a node desc matching the given data. Skip over it and
// return true when successful.
ViewTreeUpdater.prototype.findNodeMatch = function (node, outerDeco, innerDeco) {
    var this$1 = this;

  for (var i = this.index, children = this.top.children, e = Math.min(children.length, i + 5); i < e; i++) {
    if (children[i].matchesNode(node, outerDeco, innerDeco)) {
      this$1.destroyBetween(this$1.index, i)
      this$1.index++
      return true
    }
  }
  return false
};

// : (Node, [Decoration], DecorationSet, EditorView, Fragment, number) → bool
// Try to update the next node, if any, to the given data. First
// tries scanning ahead in the siblings fragment to see if the next
// node matches any of those, and if so, doesn't touch it, to avoid
// overwriting nodes that could still be used.
ViewTreeUpdater.prototype.updateNextNode = function (node, outerDeco, innerDeco, view, siblings, index) {
  if (this.index == this.top.children.length) { return false }
  var next = this.top.children[this.index]
  if (next instanceof NodeViewDesc) {
    for (var i = index + 1, e = Math.min(siblings.childCount, i + 5); i < e; i++)
      { if (next.node == siblings.child(i)) { return false } }
    var nextDOM = next.dom
    if (next.update(node, outerDeco, innerDeco, view)) {
      if (next.dom != nextDOM) { this.changed = true }
      this.index++
      return true
    }
  }
  return false
};

// : (Node, [Decoration], DecorationSet, EditorView)
// Insert the node as a newly created node desc.
ViewTreeUpdater.prototype.addNode = function (node, outerDeco, innerDeco, view) {
  this.top.children.splice(this.index++, 0, NodeViewDesc.create(this.top, node, outerDeco, innerDeco, view))
  this.changed = true
};

ViewTreeUpdater.prototype.placeWidget = function (widget) {
  if (this.index < this.top.children.length && this.top.children[this.index].matchesWidget(widget)) {
    this.index++
  } else {
    this.top.children.splice(this.index++, 0, new WidgetViewDesc(this.top, widget))
    this.changed = true
  }
};

// Make sure a textblock looks and behaves correctly in
// contentEditable.
ViewTreeUpdater.prototype.addTextblockHacks = function () {
  var lastChild = this.top.children[this.index - 1]
  while (lastChild instanceof MarkViewDesc) { lastChild = lastChild.children[lastChild.children.length - 1] }

  if (!lastChild || // Empty textblock
      !(lastChild instanceof TextViewDesc) ||
      /\n$/.test(lastChild.node.text)) {
    if (this.index < this.top.children.length && this.top.children[this.index].matchesHack()) {
      this.index++
    } else {
      var dom = document.createElement("br")
      this.top.children.splice(this.index++, 0, new BRHackViewDesc(this.top, nothing, dom, null))
      this.changed = true
    }
  }
};

// : (ViewDesc, DecorationSet, (Decoration), (Node, [Decoration], DecorationSet))
// This function abstracts iterating over the nodes and decorations in
// a fragment. Calls `onNode` for each node, with its local and child
// decorations. Splits text nodes when there is a decoration starting
// or ending inside of them. Calls `onWidget` for each widget.
function iterDeco(parent, deco, onWidget, onNode) {
  var locals = deco.locals(parent), offset = 0
  // Simple, cheap variant for when there are no local decorations
  if (locals.length == 0) {
    for (var i = 0; i < parent.childCount; i++) {
      var child = parent.child(i)
      onNode(child, locals, deco.forChild(offset, child), i)
      offset += child.nodeSize
    }
    return
  }

  var decoIndex = 0, active = [], restNode = null
  for (var parentIndex = 0;;) {
    while (decoIndex < locals.length && locals[decoIndex].to == offset)
      { onWidget(locals[decoIndex++]) }

    var child$1 = (void 0)
    if (restNode) {
      child$1 = restNode
      restNode = null
    } else if (parentIndex < parent.childCount) {
      child$1 = parent.child(parentIndex++)
    } else {
      break
    }

    for (var i$1 = 0; i$1 < active.length; i$1++) { if (active[i$1].to <= offset) { active.splice(i$1--, 1) } }
    while (decoIndex < locals.length && locals[decoIndex].from == offset) { active.push(locals[decoIndex++]) }

    var end = offset + child$1.nodeSize
    if (child$1.isText) {
      var cutAt = end
      if (decoIndex < locals.length && locals[decoIndex].from < cutAt) { cutAt = locals[decoIndex].from }
      for (var i$2 = 0; i$2 < active.length; i$2++) { if (active[i$2].to < cutAt) { cutAt = active[i$2].to } }
      if (cutAt < end) {
        restNode = child$1.cut(cutAt - offset)
        child$1 = child$1.cut(0, cutAt - offset)
        end = cutAt
      }
    }

    onNode(child$1, active.length ? active.slice() : nothing, deco.forChild(offset, child$1), parentIndex - 1)
    offset = end
  }
}

// Pre-calculate and cache the set of custom view specs for a given
// prop object.
var cachedCustomViews, cachedCustomFor
function customNodeViews(view) {
  if (cachedCustomFor == view.props) { return cachedCustomViews }
  cachedCustomFor = view.props
  return cachedCustomViews = buildCustomViews(view)
}
function buildCustomViews(view) {
  var result = {}
  view.someProp("nodeViews", function (obj) {
    for (var prop in obj) { if (!Object.prototype.hasOwnProperty.call(result, prop))
      { result[prop] = obj[prop] } }
  })
  return result
}

// List markers in Mobile Safari will mysteriously disappear
// sometimes. This works around that.
function iosHacks(dom) {
  if (dom.nodeName == "UL" || dom.nodeName == "OL") {
    var oldCSS = dom.style.cssText
    dom.style.cssText = oldCSS + "; list-style: square !important"
    window.getComputedStyle(dom).listStyle
    dom.style.cssText = oldCSS
  }
}

},{"./browser":48,"prosemirror-model":24}],59:[function(require,module,exports){
var GOOD_LEAF_SIZE = 200

// :: class<T> A rope sequence is a persistent sequence data structure
// that supports appending, prepending, and slicing without doing a
// full copy. It is represented as a mostly-balanced tree.
var RopeSequence = function RopeSequence () {};

RopeSequence.prototype.append = function append (other) {
  if (!other.length) { return this }
  other = RopeSequence.from(other)

  return (!this.length && other) ||
    (other.length < GOOD_LEAF_SIZE && this.leafAppend(other)) ||
    (this.length < GOOD_LEAF_SIZE && other.leafPrepend(this)) ||
    this.appendInner(other)
};

// :: (union<[T], RopeSequence<T>>) → RopeSequence<T>
// Prepend an array or other rope to this one, returning a new rope.
RopeSequence.prototype.prepend = function prepend (other) {
  if (!other.length) { return this }
  return RopeSequence.from(other).append(this)
};

RopeSequence.prototype.appendInner = function appendInner (other) {
  return new Append(this, other)
};

// :: (?number, ?number) → RopeSequence<T>
// Create a rope repesenting a sub-sequence of this rope.
RopeSequence.prototype.slice = function slice (from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.length;

  if (from >= to) { return RopeSequence.empty }
  return this.sliceInner(Math.max(0, from), Math.min(this.length, to))
};

// :: (number) → T
// Retrieve the element at the given position from this rope.
RopeSequence.prototype.get = function get (i) {
  if (i < 0 || i >= this.length) { return undefined }
  return this.getInner(i)
};

// :: ((element: T, index: number) → ?bool, ?number, ?number)
// Call the given function for each element between the given
// indices. This tends to be more efficient than looping over the
// indices and calling `get`, because it doesn't have to descend the
// tree for every element.
RopeSequence.prototype.forEach = function forEach (f, from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.length;

  if (from <= to)
    { this.forEachInner(f, from, to, 0) }
  else
    { this.forEachInvertedInner(f, from, to, 0) }
};

// :: ((element: T, index: number) → U, ?number, ?number) → [U]
// Map the given functions over the elements of the rope, producing
// a flat array.
RopeSequence.prototype.map = function map (f, from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.length;

  var result = []
  this.forEach(function (elt, i) { return result.push(f(elt, i)); }, from, to)
  return result
};

// :: (?union<[T], RopeSequence<T>>) → RopeSequence<T>
// Create a rope representing the given array, or return the rope
// itself if a rope was given.
RopeSequence.from = function from (values) {
  if (values instanceof RopeSequence) { return values }
  return values && values.length ? new Leaf(values) : RopeSequence.empty
};

var Leaf = (function (RopeSequence) {
  function Leaf(values) {
    RopeSequence.call(this)
    this.values = values
  }

  if ( RopeSequence ) Leaf.__proto__ = RopeSequence;
  Leaf.prototype = Object.create( RopeSequence && RopeSequence.prototype );
  Leaf.prototype.constructor = Leaf;

  var prototypeAccessors = { length: {},depth: {} };

  Leaf.prototype.flatten = function flatten () {
    return this.values
  };

  Leaf.prototype.sliceInner = function sliceInner (from, to) {
    if (from == 0 && to == this.length) { return this }
    return new Leaf(this.values.slice(from, to))
  };

  Leaf.prototype.getInner = function getInner (i) {
    return this.values[i]
  };

  Leaf.prototype.forEachInner = function forEachInner (f, from, to, start) {
    var this$1 = this;

    for (var i = from; i < to; i++)
      { if (f(this$1.values[i], start + i) === false) { return false } }
  };

  Leaf.prototype.forEachInvertedInner = function forEachInvertedInner (f, from, to, start) {
    var this$1 = this;

    for (var i = from - 1; i >= to; i--)
      { if (f(this$1.values[i], start + i) === false) { return false } }
  };

  Leaf.prototype.leafAppend = function leafAppend (other) {
    if (this.length + other.length <= GOOD_LEAF_SIZE)
      { return new Leaf(this.values.concat(other.flatten())) }
  };

  Leaf.prototype.leafPrepend = function leafPrepend (other) {
    if (this.length + other.length <= GOOD_LEAF_SIZE)
      { return new Leaf(other.flatten().concat(this.values)) }
  };

  prototypeAccessors.length.get = function () { return this.values.length };

  prototypeAccessors.depth.get = function () { return 0 };

  Object.defineProperties( Leaf.prototype, prototypeAccessors );

  return Leaf;
}(RopeSequence));

// :: RopeSequence
// The empty rope sequence.
RopeSequence.empty = new Leaf([])

var Append = (function (RopeSequence) {
  function Append(left, right) {
    RopeSequence.call(this)
    this.left = left
    this.right = right
    this.length = left.length + right.length
    this.depth = Math.max(left.depth, right.depth) + 1
  }

  if ( RopeSequence ) Append.__proto__ = RopeSequence;
  Append.prototype = Object.create( RopeSequence && RopeSequence.prototype );
  Append.prototype.constructor = Append;

  Append.prototype.flatten = function flatten () {
    return this.left.flatten().concat(this.right.flatten())
  };

  Append.prototype.getInner = function getInner (i) {
    return i < this.left.length ? this.left.get(i) : this.right.get(i - this.left.length)
  };

  Append.prototype.forEachInner = function forEachInner (f, from, to, start) {
    var leftLen = this.left.length
    if (from < leftLen &&
        this.left.forEachInner(f, from, Math.min(to, leftLen), start) === false)
      { return false }
    if (to > leftLen &&
        this.right.forEachInner(f, Math.max(from - leftLen, 0), Math.min(this.length, to) - leftLen, start + leftLen) === false)
      { return false }
  };

  Append.prototype.forEachInvertedInner = function forEachInvertedInner (f, from, to, start) {
    var leftLen = this.left.length
    if (from > leftLen &&
        this.right.forEachInvertedInner(f, from - leftLen, Math.max(to, leftLen) - leftLen, start + leftLen) === false)
      { return false }
    if (to < leftLen &&
        this.left.forEachInvertedInner(f, Math.min(from, leftLen), to, start) === false)
      { return false }
  };

  Append.prototype.sliceInner = function sliceInner (from, to) {
    if (from == 0 && to == this.length) { return this }
    var leftLen = this.left.length
    if (to <= leftLen) { return this.left.slice(from, to) }
    if (from >= leftLen) { return this.right.slice(from - leftLen, to - leftLen) }
    return this.left.slice(from, leftLen).append(this.right.slice(0, to - leftLen))
  };

  Append.prototype.leafAppend = function leafAppend (other) {
    var inner = this.right.leafAppend(other)
    if (inner) { return new Append(this.left, inner) }
  };

  Append.prototype.leafPrepend = function leafPrepend (other) {
    var inner = this.left.leafPrepend(other)
    if (inner) { return new Append(inner, this.right) }
  };

  Append.prototype.appendInner = function appendInner (other) {
    if (this.left.depth >= Math.max(this.right.depth, other.depth) + 1)
      { return new Append(this.left, new Append(this.right, other)) }
    return new Append(this, other)
  };

  return Append;
}(RopeSequence));

module.exports = RopeSequence

},{}],60:[function(require,module,exports){
var base = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'",
  229: "q"
}
var shift = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ";",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: "\"",
  229: "Q"
}

var chrome = typeof navigator != "undefined" && /Chrome\/(\d+)/.exec(navigator.userAgent)
var brokenModifierNames = chrome && +chrome[1] < 57

// Fill in the digit keys
for (var i = 0; i < 10; i++) base[48 + i] = base[96 + i] = String(i)

// The function keys
for (var i = 1; i <= 24; i++) base[i + 111] = "F" + i

// And the alphabetic keys
for (var i = 65; i <= 90; i++) {
  base[i] = String.fromCharCode(i + 32)
  shift[i] = String.fromCharCode(i)
}

// For each code that doesn't have a shift-equivalent, copy the base name
for (var code in base) if (!shift.hasOwnProperty(code)) shift[code] = base[code]

function keyName(event) {
  // Don't trust event.key in Chrome when there are modifiers until
  // they fix https://bugs.chromium.org/p/chromium/issues/detail?id=633838
  var name = ((!brokenModifierNames || !event.ctrlKey && !event.altKey && !event.metaKey) && event.key) ||
    (event.shiftKey ? shift : base)[event.keyCode] ||
    event.key || "Unidentified"
  // Edge sometimes produces wrong names (Issue #3)
  if (name == "Esc") name = "Escape"
  if (name == "Del") name = "Delete"
  return name
}

module.exports = keyName
keyName.base = base
keyName.shift = shift

},{}],61:[function(require,module,exports){
const {EditorState} = require("prosemirror-state");
const {MenuBarEditorView} = require("prosemirror-menu");
const {Node} = require("prosemirror-model");
const {exampleSetup} = require("prosemirror-example-setup");

const {schema} = require("./schema");

// textarea holds our intial data and will be updated on editor changes
const json = document.getElementById('json');

let view = new MenuBarEditorView(document.querySelector("#editor"), {
    state: EditorState.create({
        doc: Node.fromJSON(schema, JSON.parse(json.value)),
        schema: schema,
        plugins: exampleSetup({schema})
    }),
    onAction(action) {
        view.updateState(view.editor.state.applyAction(action));

        //current state as json in text area
        json.value =  JSON.stringify(view.editor.state.doc.toJSON(), null, 4);
    }
});
window.view = view.editor;



},{"./schema":62,"prosemirror-example-setup":5,"prosemirror-menu":16,"prosemirror-model":24,"prosemirror-state":34}],62:[function(require,module,exports){
/**
 * Defines a custom Schema for DokuWiki
 *
 * extends the basic schemas provided by ProseMirror
 */

// load default schema definitions
const {Schema} = require("prosemirror-model");
const {nodes, marks} = require("prosemirror-schema-basic");
//const {addListNodes} = require("prosemirror-schema-list");

// heading shall only contain unmarked text
nodes.heading.content = 'text*';
nodes.heading.defining = false; // unsure if this does anything


exports.schema = new Schema({
    nodes: nodes,
    marks: marks
});

},{"prosemirror-model":24,"prosemirror-schema-basic":31}]},{},[61]);
