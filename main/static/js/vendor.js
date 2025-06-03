/**
 * @popperjs/core v2.11.8 - MIT License
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Popper = {}));
}(this, (function (exports) { 'use strict';

  function getWindow(node) {
    if (node == null) {
      return window;
    }

    if (node.toString() !== '[object Window]') {
      var ownerDocument = node.ownerDocument;
      return ownerDocument ? ownerDocument.defaultView || window : window;
    }

    return node;
  }

  function isElement(node) {
    var OwnElement = getWindow(node).Element;
    return node instanceof OwnElement || node instanceof Element;
  }

  function isHTMLElement(node) {
    var OwnElement = getWindow(node).HTMLElement;
    return node instanceof OwnElement || node instanceof HTMLElement;
  }

  function isShadowRoot(node) {
    // IE 11 has no ShadowRoot
    if (typeof ShadowRoot === 'undefined') {
      return false;
    }

    var OwnElement = getWindow(node).ShadowRoot;
    return node instanceof OwnElement || node instanceof ShadowRoot;
  }

  var max = Math.max;
  var min = Math.min;
  var round = Math.round;

  function getUAString() {
    var uaData = navigator.userAgentData;

    if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
      return uaData.brands.map(function (item) {
        return item.brand + "/" + item.version;
      }).join(' ');
    }

    return navigator.userAgent;
  }

  function isLayoutViewport() {
    return !/^((?!chrome|android).)*safari/i.test(getUAString());
  }

  function getBoundingClientRect(element, includeScale, isFixedStrategy) {
    if (includeScale === void 0) {
      includeScale = false;
    }

    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }

    var clientRect = element.getBoundingClientRect();
    var scaleX = 1;
    var scaleY = 1;

    if (includeScale && isHTMLElement(element)) {
      scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
      scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
    }

    var _ref = isElement(element) ? getWindow(element) : window,
        visualViewport = _ref.visualViewport;

    var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
    var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
    var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
    var width = clientRect.width / scaleX;
    var height = clientRect.height / scaleY;
    return {
      width: width,
      height: height,
      top: y,
      right: x + width,
      bottom: y + height,
      left: x,
      x: x,
      y: y
    };
  }

  function getWindowScroll(node) {
    var win = getWindow(node);
    var scrollLeft = win.pageXOffset;
    var scrollTop = win.pageYOffset;
    return {
      scrollLeft: scrollLeft,
      scrollTop: scrollTop
    };
  }

  function getHTMLElementScroll(element) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }

  function getNodeScroll(node) {
    if (node === getWindow(node) || !isHTMLElement(node)) {
      return getWindowScroll(node);
    } else {
      return getHTMLElementScroll(node);
    }
  }

  function getNodeName(element) {
    return element ? (element.nodeName || '').toLowerCase() : null;
  }

  function getDocumentElement(element) {
    // $FlowFixMe[incompatible-return]: assume body is always available
    return ((isElement(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
    element.document) || window.document).documentElement;
  }

  function getWindowScrollBarX(element) {
    // If <html> has a CSS width greater than the viewport, then this will be
    // incorrect for RTL.
    // Popper 1 is broken in this case and never had a bug report so let's assume
    // it's not an issue. I don't think anyone ever specifies width on <html>
    // anyway.
    // Browsers where the left scrollbar doesn't cause an issue report `0` for
    // this (e.g. Edge 2019, IE11, Safari)
    return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
  }

  function getComputedStyle(element) {
    return getWindow(element).getComputedStyle(element);
  }

  function isScrollParent(element) {
    // Firefox wants us to check `-x` and `-y` variations as well
    var _getComputedStyle = getComputedStyle(element),
        overflow = _getComputedStyle.overflow,
        overflowX = _getComputedStyle.overflowX,
        overflowY = _getComputedStyle.overflowY;

    return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
  }

  function isElementScaled(element) {
    var rect = element.getBoundingClientRect();
    var scaleX = round(rect.width) / element.offsetWidth || 1;
    var scaleY = round(rect.height) / element.offsetHeight || 1;
    return scaleX !== 1 || scaleY !== 1;
  } // Returns the composite rect of an element relative to its offsetParent.
  // Composite means it takes into account transforms as well as layout.


  function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
    if (isFixed === void 0) {
      isFixed = false;
    }

    var isOffsetParentAnElement = isHTMLElement(offsetParent);
    var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
    var documentElement = getDocumentElement(offsetParent);
    var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
    var scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    var offsets = {
      x: 0,
      y: 0
    };

    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
      isScrollParent(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }

      if (isHTMLElement(offsetParent)) {
        offsets = getBoundingClientRect(offsetParent, true);
        offsets.x += offsetParent.clientLeft;
        offsets.y += offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }

    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height
    };
  }

  // means it doesn't take into account transforms.

  function getLayoutRect(element) {
    var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
    // Fixes https://github.com/popperjs/popper-core/issues/1223

    var width = element.offsetWidth;
    var height = element.offsetHeight;

    if (Math.abs(clientRect.width - width) <= 1) {
      width = clientRect.width;
    }

    if (Math.abs(clientRect.height - height) <= 1) {
      height = clientRect.height;
    }

    return {
      x: element.offsetLeft,
      y: element.offsetTop,
      width: width,
      height: height
    };
  }

  function getParentNode(element) {
    if (getNodeName(element) === 'html') {
      return element;
    }

    return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
      // $FlowFixMe[incompatible-return]
      // $FlowFixMe[prop-missing]
      element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
      element.parentNode || ( // DOM Element detected
      isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
      // $FlowFixMe[incompatible-call]: HTMLElement is a Node
      getDocumentElement(element) // fallback

    );
  }

  function getScrollParent(node) {
    if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
      // $FlowFixMe[incompatible-return]: assume body is always available
      return node.ownerDocument.body;
    }

    if (isHTMLElement(node) && isScrollParent(node)) {
      return node;
    }

    return getScrollParent(getParentNode(node));
  }

  /*
  given a DOM element, return the list of all scroll parents, up the list of ancesors
  until we get to the top window object. This list is what we attach scroll listeners
  to, because if any of these parent elements scroll, we'll need to re-calculate the
  reference element's position.
  */

  function listScrollParents(element, list) {
    var _element$ownerDocumen;

    if (list === void 0) {
      list = [];
    }

    var scrollParent = getScrollParent(element);
    var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
    var win = getWindow(scrollParent);
    var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
    var updatedList = list.concat(target);
    return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    updatedList.concat(listScrollParents(getParentNode(target)));
  }

  function isTableElement(element) {
    return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
  }

  function getTrueOffsetParent(element) {
    if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
    getComputedStyle(element).position === 'fixed') {
      return null;
    }

    return element.offsetParent;
  } // `.offsetParent` reports `null` for fixed elements, while absolute elements
  // return the containing block


  function getContainingBlock(element) {
    var isFirefox = /firefox/i.test(getUAString());
    var isIE = /Trident/i.test(getUAString());

    if (isIE && isHTMLElement(element)) {
      // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
      var elementCss = getComputedStyle(element);

      if (elementCss.position === 'fixed') {
        return null;
      }
    }

    var currentNode = getParentNode(element);

    if (isShadowRoot(currentNode)) {
      currentNode = currentNode.host;
    }

    while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
      var css = getComputedStyle(currentNode); // This is non-exhaustive but covers the most common CSS properties that
      // create a containing block.
      // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

      if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
        return currentNode;
      } else {
        currentNode = currentNode.parentNode;
      }
    }

    return null;
  } // Gets the closest ancestor positioned element. Handles some edge cases,
  // such as table ancestors and cross browser bugs.


  function getOffsetParent(element) {
    var window = getWindow(element);
    var offsetParent = getTrueOffsetParent(element);

    while (offsetParent && isTableElement(offsetParent) && getComputedStyle(offsetParent).position === 'static') {
      offsetParent = getTrueOffsetParent(offsetParent);
    }

    if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle(offsetParent).position === 'static')) {
      return window;
    }

    return offsetParent || getContainingBlock(element) || window;
  }

  var top = 'top';
  var bottom = 'bottom';
  var right = 'right';
  var left = 'left';
  var auto = 'auto';
  var basePlacements = [top, bottom, right, left];
  var start = 'start';
  var end = 'end';
  var clippingParents = 'clippingParents';
  var viewport = 'viewport';
  var popper = 'popper';
  var reference = 'reference';
  var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
    return acc.concat([placement + "-" + start, placement + "-" + end]);
  }, []);
  var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
    return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
  }, []); // modifiers that need to read the DOM

  var beforeRead = 'beforeRead';
  var read = 'read';
  var afterRead = 'afterRead'; // pure-logic modifiers

  var beforeMain = 'beforeMain';
  var main = 'main';
  var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

  var beforeWrite = 'beforeWrite';
  var write = 'write';
  var afterWrite = 'afterWrite';
  var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

  function order(modifiers) {
    var map = new Map();
    var visited = new Set();
    var result = [];
    modifiers.forEach(function (modifier) {
      map.set(modifier.name, modifier);
    }); // On visiting object, check for its dependencies and visit them recursively

    function sort(modifier) {
      visited.add(modifier.name);
      var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
      requires.forEach(function (dep) {
        if (!visited.has(dep)) {
          var depModifier = map.get(dep);

          if (depModifier) {
            sort(depModifier);
          }
        }
      });
      result.push(modifier);
    }

    modifiers.forEach(function (modifier) {
      if (!visited.has(modifier.name)) {
        // check for visited object
        sort(modifier);
      }
    });
    return result;
  }

  function orderModifiers(modifiers) {
    // order based on dependencies
    var orderedModifiers = order(modifiers); // order based on phase

    return modifierPhases.reduce(function (acc, phase) {
      return acc.concat(orderedModifiers.filter(function (modifier) {
        return modifier.phase === phase;
      }));
    }, []);
  }

  function debounce(fn) {
    var pending;
    return function () {
      if (!pending) {
        pending = new Promise(function (resolve) {
          Promise.resolve().then(function () {
            pending = undefined;
            resolve(fn());
          });
        });
      }

      return pending;
    };
  }

  function mergeByName(modifiers) {
    var merged = modifiers.reduce(function (merged, current) {
      var existing = merged[current.name];
      merged[current.name] = existing ? Object.assign({}, existing, current, {
        options: Object.assign({}, existing.options, current.options),
        data: Object.assign({}, existing.data, current.data)
      }) : current;
      return merged;
    }, {}); // IE11 does not support Object.values

    return Object.keys(merged).map(function (key) {
      return merged[key];
    });
  }

  function getViewportRect(element, strategy) {
    var win = getWindow(element);
    var html = getDocumentElement(element);
    var visualViewport = win.visualViewport;
    var width = html.clientWidth;
    var height = html.clientHeight;
    var x = 0;
    var y = 0;

    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      var layoutViewport = isLayoutViewport();

      if (layoutViewport || !layoutViewport && strategy === 'fixed') {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }

    return {
      width: width,
      height: height,
      x: x + getWindowScrollBarX(element),
      y: y
    };
  }

  // of the `<html>` and `<body>` rect bounds if horizontally scrollable

  function getDocumentRect(element) {
    var _element$ownerDocumen;

    var html = getDocumentElement(element);
    var winScroll = getWindowScroll(element);
    var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
    var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
    var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
    var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
    var y = -winScroll.scrollTop;

    if (getComputedStyle(body || html).direction === 'rtl') {
      x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
    }

    return {
      width: width,
      height: height,
      x: x,
      y: y
    };
  }

  function contains(parent, child) {
    var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

    if (parent.contains(child)) {
      return true;
    } // then fallback to custom implementation with Shadow DOM support
    else if (rootNode && isShadowRoot(rootNode)) {
        var next = child;

        do {
          if (next && parent.isSameNode(next)) {
            return true;
          } // $FlowFixMe[prop-missing]: need a better way to handle this...


          next = next.parentNode || next.host;
        } while (next);
      } // Give up, the result is false


    return false;
  }

  function rectToClientRect(rect) {
    return Object.assign({}, rect, {
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    });
  }

  function getInnerBoundingClientRect(element, strategy) {
    var rect = getBoundingClientRect(element, false, strategy === 'fixed');
    rect.top = rect.top + element.clientTop;
    rect.left = rect.left + element.clientLeft;
    rect.bottom = rect.top + element.clientHeight;
    rect.right = rect.left + element.clientWidth;
    rect.width = element.clientWidth;
    rect.height = element.clientHeight;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }

  function getClientRectFromMixedType(element, clippingParent, strategy) {
    return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
  } // A "clipping parent" is an overflowable container with the characteristic of
  // clipping (or hiding) overflowing elements with a position different from
  // `initial`


  function getClippingParents(element) {
    var clippingParents = listScrollParents(getParentNode(element));
    var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle(element).position) >= 0;
    var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;

    if (!isElement(clipperElement)) {
      return [];
    } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414


    return clippingParents.filter(function (clippingParent) {
      return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body';
    });
  } // Gets the maximum area that the element is visible in due to any number of
  // clipping parents


  function getClippingRect(element, boundary, rootBoundary, strategy) {
    var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
    var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
    var firstClippingParent = clippingParents[0];
    var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
      var rect = getClientRectFromMixedType(element, clippingParent, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromMixedType(element, firstClippingParent, strategy));
    clippingRect.width = clippingRect.right - clippingRect.left;
    clippingRect.height = clippingRect.bottom - clippingRect.top;
    clippingRect.x = clippingRect.left;
    clippingRect.y = clippingRect.top;
    return clippingRect;
  }

  function getBasePlacement(placement) {
    return placement.split('-')[0];
  }

  function getVariation(placement) {
    return placement.split('-')[1];
  }

  function getMainAxisFromPlacement(placement) {
    return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
  }

  function computeOffsets(_ref) {
    var reference = _ref.reference,
        element = _ref.element,
        placement = _ref.placement;
    var basePlacement = placement ? getBasePlacement(placement) : null;
    var variation = placement ? getVariation(placement) : null;
    var commonX = reference.x + reference.width / 2 - element.width / 2;
    var commonY = reference.y + reference.height / 2 - element.height / 2;
    var offsets;

    switch (basePlacement) {
      case top:
        offsets = {
          x: commonX,
          y: reference.y - element.height
        };
        break;

      case bottom:
        offsets = {
          x: commonX,
          y: reference.y + reference.height
        };
        break;

      case right:
        offsets = {
          x: reference.x + reference.width,
          y: commonY
        };
        break;

      case left:
        offsets = {
          x: reference.x - element.width,
          y: commonY
        };
        break;

      default:
        offsets = {
          x: reference.x,
          y: reference.y
        };
    }

    var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;

    if (mainAxis != null) {
      var len = mainAxis === 'y' ? 'height' : 'width';

      switch (variation) {
        case start:
          offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
          break;

        case end:
          offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
          break;
      }
    }

    return offsets;
  }

  function getFreshSideObject() {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }

  function mergePaddingObject(paddingObject) {
    return Object.assign({}, getFreshSideObject(), paddingObject);
  }

  function expandToHashMap(value, keys) {
    return keys.reduce(function (hashMap, key) {
      hashMap[key] = value;
      return hashMap;
    }, {});
  }

  function detectOverflow(state, options) {
    if (options === void 0) {
      options = {};
    }

    var _options = options,
        _options$placement = _options.placement,
        placement = _options$placement === void 0 ? state.placement : _options$placement,
        _options$strategy = _options.strategy,
        strategy = _options$strategy === void 0 ? state.strategy : _options$strategy,
        _options$boundary = _options.boundary,
        boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
        _options$rootBoundary = _options.rootBoundary,
        rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
        _options$elementConte = _options.elementContext,
        elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
        _options$altBoundary = _options.altBoundary,
        altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
        _options$padding = _options.padding,
        padding = _options$padding === void 0 ? 0 : _options$padding;
    var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
    var altContext = elementContext === popper ? reference : popper;
    var popperRect = state.rects.popper;
    var element = state.elements[altBoundary ? altContext : elementContext];
    var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
    var referenceClientRect = getBoundingClientRect(state.elements.reference);
    var popperOffsets = computeOffsets({
      reference: referenceClientRect,
      element: popperRect,
      strategy: 'absolute',
      placement: placement
    });
    var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
    var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
    // 0 or negative = within the clipping rect

    var overflowOffsets = {
      top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
      bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
      left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
      right: elementClientRect.right - clippingClientRect.right + paddingObject.right
    };
    var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

    if (elementContext === popper && offsetData) {
      var offset = offsetData[placement];
      Object.keys(overflowOffsets).forEach(function (key) {
        var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
        var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
        overflowOffsets[key] += offset[axis] * multiply;
      });
    }

    return overflowOffsets;
  }

  var DEFAULT_OPTIONS = {
    placement: 'bottom',
    modifiers: [],
    strategy: 'absolute'
  };

  function areValidElements() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return !args.some(function (element) {
      return !(element && typeof element.getBoundingClientRect === 'function');
    });
  }

  function popperGenerator(generatorOptions) {
    if (generatorOptions === void 0) {
      generatorOptions = {};
    }

    var _generatorOptions = generatorOptions,
        _generatorOptions$def = _generatorOptions.defaultModifiers,
        defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
        _generatorOptions$def2 = _generatorOptions.defaultOptions,
        defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
    return function createPopper(reference, popper, options) {
      if (options === void 0) {
        options = defaultOptions;
      }

      var state = {
        placement: 'bottom',
        orderedModifiers: [],
        options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
        modifiersData: {},
        elements: {
          reference: reference,
          popper: popper
        },
        attributes: {},
        styles: {}
      };
      var effectCleanupFns = [];
      var isDestroyed = false;
      var instance = {
        state: state,
        setOptions: function setOptions(setOptionsAction) {
          var options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
          cleanupModifierEffects();
          state.options = Object.assign({}, defaultOptions, state.options, options);
          state.scrollParents = {
            reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
            popper: listScrollParents(popper)
          }; // Orders the modifiers based on their dependencies and `phase`
          // properties

          var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers

          state.orderedModifiers = orderedModifiers.filter(function (m) {
            return m.enabled;
          });
          runModifierEffects();
          return instance.update();
        },
        // Sync update – it will always be executed, even if not necessary. This
        // is useful for low frequency updates where sync behavior simplifies the
        // logic.
        // For high frequency updates (e.g. `resize` and `scroll` events), always
        // prefer the async Popper#update method
        forceUpdate: function forceUpdate() {
          if (isDestroyed) {
            return;
          }

          var _state$elements = state.elements,
              reference = _state$elements.reference,
              popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
          // anymore

          if (!areValidElements(reference, popper)) {
            return;
          } // Store the reference and popper rects to be read by modifiers


          state.rects = {
            reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
            popper: getLayoutRect(popper)
          }; // Modifiers have the ability to reset the current update cycle. The
          // most common use case for this is the `flip` modifier changing the
          // placement, which then needs to re-run all the modifiers, because the
          // logic was previously ran for the previous placement and is therefore
          // stale/incorrect

          state.reset = false;
          state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
          // is filled with the initial data specified by the modifier. This means
          // it doesn't persist and is fresh on each update.
          // To ensure persistent data, use `${name}#persistent`

          state.orderedModifiers.forEach(function (modifier) {
            return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
          });

          for (var index = 0; index < state.orderedModifiers.length; index++) {
            if (state.reset === true) {
              state.reset = false;
              index = -1;
              continue;
            }

            var _state$orderedModifie = state.orderedModifiers[index],
                fn = _state$orderedModifie.fn,
                _state$orderedModifie2 = _state$orderedModifie.options,
                _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
                name = _state$orderedModifie.name;

            if (typeof fn === 'function') {
              state = fn({
                state: state,
                options: _options,
                name: name,
                instance: instance
              }) || state;
            }
          }
        },
        // Async and optimistically optimized update – it will not be executed if
        // not necessary (debounced to run at most once-per-tick)
        update: debounce(function () {
          return new Promise(function (resolve) {
            instance.forceUpdate();
            resolve(state);
          });
        }),
        destroy: function destroy() {
          cleanupModifierEffects();
          isDestroyed = true;
        }
      };

      if (!areValidElements(reference, popper)) {
        return instance;
      }

      instance.setOptions(options).then(function (state) {
        if (!isDestroyed && options.onFirstUpdate) {
          options.onFirstUpdate(state);
        }
      }); // Modifiers have the ability to execute arbitrary code before the first
      // update cycle runs. They will be executed in the same order as the update
      // cycle. This is useful when a modifier adds some persistent data that
      // other modifiers need to use, but the modifier is run after the dependent
      // one.

      function runModifierEffects() {
        state.orderedModifiers.forEach(function (_ref) {
          var name = _ref.name,
              _ref$options = _ref.options,
              options = _ref$options === void 0 ? {} : _ref$options,
              effect = _ref.effect;

          if (typeof effect === 'function') {
            var cleanupFn = effect({
              state: state,
              name: name,
              instance: instance,
              options: options
            });

            var noopFn = function noopFn() {};

            effectCleanupFns.push(cleanupFn || noopFn);
          }
        });
      }

      function cleanupModifierEffects() {
        effectCleanupFns.forEach(function (fn) {
          return fn();
        });
        effectCleanupFns = [];
      }

      return instance;
    };
  }

  var passive = {
    passive: true
  };

  function effect$2(_ref) {
    var state = _ref.state,
        instance = _ref.instance,
        options = _ref.options;
    var _options$scroll = options.scroll,
        scroll = _options$scroll === void 0 ? true : _options$scroll,
        _options$resize = options.resize,
        resize = _options$resize === void 0 ? true : _options$resize;
    var window = getWindow(state.elements.popper);
    var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

    if (scroll) {
      scrollParents.forEach(function (scrollParent) {
        scrollParent.addEventListener('scroll', instance.update, passive);
      });
    }

    if (resize) {
      window.addEventListener('resize', instance.update, passive);
    }

    return function () {
      if (scroll) {
        scrollParents.forEach(function (scrollParent) {
          scrollParent.removeEventListener('scroll', instance.update, passive);
        });
      }

      if (resize) {
        window.removeEventListener('resize', instance.update, passive);
      }
    };
  } // eslint-disable-next-line import/no-unused-modules


  var eventListeners = {
    name: 'eventListeners',
    enabled: true,
    phase: 'write',
    fn: function fn() {},
    effect: effect$2,
    data: {}
  };

  function popperOffsets(_ref) {
    var state = _ref.state,
        name = _ref.name;
    // Offsets are the actual position the popper needs to have to be
    // properly positioned near its reference element
    // This is the most basic placement, and will be adjusted by
    // the modifiers in the next step
    state.modifiersData[name] = computeOffsets({
      reference: state.rects.reference,
      element: state.rects.popper,
      strategy: 'absolute',
      placement: state.placement
    });
  } // eslint-disable-next-line import/no-unused-modules


  var popperOffsets$1 = {
    name: 'popperOffsets',
    enabled: true,
    phase: 'read',
    fn: popperOffsets,
    data: {}
  };

  var unsetSides = {
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto'
  }; // Round the offsets to the nearest suitable subpixel based on the DPR.
  // Zooming can change the DPR, but it seems to report a value that will
  // cleanly divide the values into the appropriate subpixels.

  function roundOffsetsByDPR(_ref, win) {
    var x = _ref.x,
        y = _ref.y;
    var dpr = win.devicePixelRatio || 1;
    return {
      x: round(x * dpr) / dpr || 0,
      y: round(y * dpr) / dpr || 0
    };
  }

  function mapToStyles(_ref2) {
    var _Object$assign2;

    var popper = _ref2.popper,
        popperRect = _ref2.popperRect,
        placement = _ref2.placement,
        variation = _ref2.variation,
        offsets = _ref2.offsets,
        position = _ref2.position,
        gpuAcceleration = _ref2.gpuAcceleration,
        adaptive = _ref2.adaptive,
        roundOffsets = _ref2.roundOffsets,
        isFixed = _ref2.isFixed;
    var _offsets$x = offsets.x,
        x = _offsets$x === void 0 ? 0 : _offsets$x,
        _offsets$y = offsets.y,
        y = _offsets$y === void 0 ? 0 : _offsets$y;

    var _ref3 = typeof roundOffsets === 'function' ? roundOffsets({
      x: x,
      y: y
    }) : {
      x: x,
      y: y
    };

    x = _ref3.x;
    y = _ref3.y;
    var hasX = offsets.hasOwnProperty('x');
    var hasY = offsets.hasOwnProperty('y');
    var sideX = left;
    var sideY = top;
    var win = window;

    if (adaptive) {
      var offsetParent = getOffsetParent(popper);
      var heightProp = 'clientHeight';
      var widthProp = 'clientWidth';

      if (offsetParent === getWindow(popper)) {
        offsetParent = getDocumentElement(popper);

        if (getComputedStyle(offsetParent).position !== 'static' && position === 'absolute') {
          heightProp = 'scrollHeight';
          widthProp = 'scrollWidth';
        }
      } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it


      offsetParent = offsetParent;

      if (placement === top || (placement === left || placement === right) && variation === end) {
        sideY = bottom;
        var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : // $FlowFixMe[prop-missing]
        offsetParent[heightProp];
        y -= offsetY - popperRect.height;
        y *= gpuAcceleration ? 1 : -1;
      }

      if (placement === left || (placement === top || placement === bottom) && variation === end) {
        sideX = right;
        var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : // $FlowFixMe[prop-missing]
        offsetParent[widthProp];
        x -= offsetX - popperRect.width;
        x *= gpuAcceleration ? 1 : -1;
      }
    }

    var commonStyles = Object.assign({
      position: position
    }, adaptive && unsetSides);

    var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
      x: x,
      y: y
    }, getWindow(popper)) : {
      x: x,
      y: y
    };

    x = _ref4.x;
    y = _ref4.y;

    if (gpuAcceleration) {
      var _Object$assign;

      return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
    }

    return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
  }

  function computeStyles(_ref5) {
    var state = _ref5.state,
        options = _ref5.options;
    var _options$gpuAccelerat = options.gpuAcceleration,
        gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
        _options$adaptive = options.adaptive,
        adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
        _options$roundOffsets = options.roundOffsets,
        roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
    var commonStyles = {
      placement: getBasePlacement(state.placement),
      variation: getVariation(state.placement),
      popper: state.elements.popper,
      popperRect: state.rects.popper,
      gpuAcceleration: gpuAcceleration,
      isFixed: state.options.strategy === 'fixed'
    };

    if (state.modifiersData.popperOffsets != null) {
      state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.popperOffsets,
        position: state.options.strategy,
        adaptive: adaptive,
        roundOffsets: roundOffsets
      })));
    }

    if (state.modifiersData.arrow != null) {
      state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.arrow,
        position: 'absolute',
        adaptive: false,
        roundOffsets: roundOffsets
      })));
    }

    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      'data-popper-placement': state.placement
    });
  } // eslint-disable-next-line import/no-unused-modules


  var computeStyles$1 = {
    name: 'computeStyles',
    enabled: true,
    phase: 'beforeWrite',
    fn: computeStyles,
    data: {}
  };

  // and applies them to the HTMLElements such as popper and arrow

  function applyStyles(_ref) {
    var state = _ref.state;
    Object.keys(state.elements).forEach(function (name) {
      var style = state.styles[name] || {};
      var attributes = state.attributes[name] || {};
      var element = state.elements[name]; // arrow is optional + virtual elements

      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      } // Flow doesn't support to extend this property, but it's the most
      // effective way to apply styles to an HTMLElement
      // $FlowFixMe[cannot-write]


      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function (name) {
        var value = attributes[name];

        if (value === false) {
          element.removeAttribute(name);
        } else {
          element.setAttribute(name, value === true ? '' : value);
        }
      });
    });
  }

  function effect$1(_ref2) {
    var state = _ref2.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: '0',
        top: '0',
        margin: '0'
      },
      arrow: {
        position: 'absolute'
      },
      reference: {}
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;

    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    }

    return function () {
      Object.keys(state.elements).forEach(function (name) {
        var element = state.elements[name];
        var attributes = state.attributes[name] || {};
        var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

        var style = styleProperties.reduce(function (style, property) {
          style[property] = '';
          return style;
        }, {}); // arrow is optional + virtual elements

        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        }

        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function (attribute) {
          element.removeAttribute(attribute);
        });
      });
    };
  } // eslint-disable-next-line import/no-unused-modules


  var applyStyles$1 = {
    name: 'applyStyles',
    enabled: true,
    phase: 'write',
    fn: applyStyles,
    effect: effect$1,
    requires: ['computeStyles']
  };

  function distanceAndSkiddingToXY(placement, rects, offset) {
    var basePlacement = getBasePlacement(placement);
    var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;

    var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
      placement: placement
    })) : offset,
        skidding = _ref[0],
        distance = _ref[1];

    skidding = skidding || 0;
    distance = (distance || 0) * invertDistance;
    return [left, right].indexOf(basePlacement) >= 0 ? {
      x: distance,
      y: skidding
    } : {
      x: skidding,
      y: distance
    };
  }

  function offset(_ref2) {
    var state = _ref2.state,
        options = _ref2.options,
        name = _ref2.name;
    var _options$offset = options.offset,
        offset = _options$offset === void 0 ? [0, 0] : _options$offset;
    var data = placements.reduce(function (acc, placement) {
      acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
      return acc;
    }, {});
    var _data$state$placement = data[state.placement],
        x = _data$state$placement.x,
        y = _data$state$placement.y;

    if (state.modifiersData.popperOffsets != null) {
      state.modifiersData.popperOffsets.x += x;
      state.modifiersData.popperOffsets.y += y;
    }

    state.modifiersData[name] = data;
  } // eslint-disable-next-line import/no-unused-modules


  var offset$1 = {
    name: 'offset',
    enabled: true,
    phase: 'main',
    requires: ['popperOffsets'],
    fn: offset
  };

  var hash$1 = {
    left: 'right',
    right: 'left',
    bottom: 'top',
    top: 'bottom'
  };
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, function (matched) {
      return hash$1[matched];
    });
  }

  var hash = {
    start: 'end',
    end: 'start'
  };
  function getOppositeVariationPlacement(placement) {
    return placement.replace(/start|end/g, function (matched) {
      return hash[matched];
    });
  }

  function computeAutoPlacement(state, options) {
    if (options === void 0) {
      options = {};
    }

    var _options = options,
        placement = _options.placement,
        boundary = _options.boundary,
        rootBoundary = _options.rootBoundary,
        padding = _options.padding,
        flipVariations = _options.flipVariations,
        _options$allowedAutoP = _options.allowedAutoPlacements,
        allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
    var variation = getVariation(placement);
    var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
      return getVariation(placement) === variation;
    }) : basePlacements;
    var allowedPlacements = placements$1.filter(function (placement) {
      return allowedAutoPlacements.indexOf(placement) >= 0;
    });

    if (allowedPlacements.length === 0) {
      allowedPlacements = placements$1;
    } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...


    var overflows = allowedPlacements.reduce(function (acc, placement) {
      acc[placement] = detectOverflow(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        padding: padding
      })[getBasePlacement(placement)];
      return acc;
    }, {});
    return Object.keys(overflows).sort(function (a, b) {
      return overflows[a] - overflows[b];
    });
  }

  function getExpandedFallbackPlacements(placement) {
    if (getBasePlacement(placement) === auto) {
      return [];
    }

    var oppositePlacement = getOppositePlacement(placement);
    return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
  }

  function flip(_ref) {
    var state = _ref.state,
        options = _ref.options,
        name = _ref.name;

    if (state.modifiersData[name]._skip) {
      return;
    }

    var _options$mainAxis = options.mainAxis,
        checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
        _options$altAxis = options.altAxis,
        checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
        specifiedFallbackPlacements = options.fallbackPlacements,
        padding = options.padding,
        boundary = options.boundary,
        rootBoundary = options.rootBoundary,
        altBoundary = options.altBoundary,
        _options$flipVariatio = options.flipVariations,
        flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
        allowedAutoPlacements = options.allowedAutoPlacements;
    var preferredPlacement = state.options.placement;
    var basePlacement = getBasePlacement(preferredPlacement);
    var isBasePlacement = basePlacement === preferredPlacement;
    var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
    var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
      return acc.concat(getBasePlacement(placement) === auto ? computeAutoPlacement(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        padding: padding,
        flipVariations: flipVariations,
        allowedAutoPlacements: allowedAutoPlacements
      }) : placement);
    }, []);
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var checksMap = new Map();
    var makeFallbackChecks = true;
    var firstFittingPlacement = placements[0];

    for (var i = 0; i < placements.length; i++) {
      var placement = placements[i];

      var _basePlacement = getBasePlacement(placement);

      var isStartVariation = getVariation(placement) === start;
      var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
      var len = isVertical ? 'width' : 'height';
      var overflow = detectOverflow(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        altBoundary: altBoundary,
        padding: padding
      });
      var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;

      if (referenceRect[len] > popperRect[len]) {
        mainVariationSide = getOppositePlacement(mainVariationSide);
      }

      var altVariationSide = getOppositePlacement(mainVariationSide);
      var checks = [];

      if (checkMainAxis) {
        checks.push(overflow[_basePlacement] <= 0);
      }

      if (checkAltAxis) {
        checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
      }

      if (checks.every(function (check) {
        return check;
      })) {
        firstFittingPlacement = placement;
        makeFallbackChecks = false;
        break;
      }

      checksMap.set(placement, checks);
    }

    if (makeFallbackChecks) {
      // `2` may be desired in some cases – research later
      var numberOfChecks = flipVariations ? 3 : 1;

      var _loop = function _loop(_i) {
        var fittingPlacement = placements.find(function (placement) {
          var checks = checksMap.get(placement);

          if (checks) {
            return checks.slice(0, _i).every(function (check) {
              return check;
            });
          }
        });

        if (fittingPlacement) {
          firstFittingPlacement = fittingPlacement;
          return "break";
        }
      };

      for (var _i = numberOfChecks; _i > 0; _i--) {
        var _ret = _loop(_i);

        if (_ret === "break") break;
      }
    }

    if (state.placement !== firstFittingPlacement) {
      state.modifiersData[name]._skip = true;
      state.placement = firstFittingPlacement;
      state.reset = true;
    }
  } // eslint-disable-next-line import/no-unused-modules


  var flip$1 = {
    name: 'flip',
    enabled: true,
    phase: 'main',
    fn: flip,
    requiresIfExists: ['offset'],
    data: {
      _skip: false
    }
  };

  function getAltAxis(axis) {
    return axis === 'x' ? 'y' : 'x';
  }

  function within(min$1, value, max$1) {
    return max(min$1, min(value, max$1));
  }
  function withinMaxClamp(min, value, max) {
    var v = within(min, value, max);
    return v > max ? max : v;
  }

  function preventOverflow(_ref) {
    var state = _ref.state,
        options = _ref.options,
        name = _ref.name;
    var _options$mainAxis = options.mainAxis,
        checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
        _options$altAxis = options.altAxis,
        checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
        boundary = options.boundary,
        rootBoundary = options.rootBoundary,
        altBoundary = options.altBoundary,
        padding = options.padding,
        _options$tether = options.tether,
        tether = _options$tether === void 0 ? true : _options$tether,
        _options$tetherOffset = options.tetherOffset,
        tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
    var overflow = detectOverflow(state, {
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding,
      altBoundary: altBoundary
    });
    var basePlacement = getBasePlacement(state.placement);
    var variation = getVariation(state.placement);
    var isBasePlacement = !variation;
    var mainAxis = getMainAxisFromPlacement(basePlacement);
    var altAxis = getAltAxis(mainAxis);
    var popperOffsets = state.modifiersData.popperOffsets;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
      placement: state.placement
    })) : tetherOffset;
    var normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
      mainAxis: tetherOffsetValue,
      altAxis: tetherOffsetValue
    } : Object.assign({
      mainAxis: 0,
      altAxis: 0
    }, tetherOffsetValue);
    var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
    var data = {
      x: 0,
      y: 0
    };

    if (!popperOffsets) {
      return;
    }

    if (checkMainAxis) {
      var _offsetModifierState$;

      var mainSide = mainAxis === 'y' ? top : left;
      var altSide = mainAxis === 'y' ? bottom : right;
      var len = mainAxis === 'y' ? 'height' : 'width';
      var offset = popperOffsets[mainAxis];
      var min$1 = offset + overflow[mainSide];
      var max$1 = offset - overflow[altSide];
      var additive = tether ? -popperRect[len] / 2 : 0;
      var minLen = variation === start ? referenceRect[len] : popperRect[len];
      var maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
      // outside the reference bounds

      var arrowElement = state.elements.arrow;
      var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
        width: 0,
        height: 0
      };
      var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
      var arrowPaddingMin = arrowPaddingObject[mainSide];
      var arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
      // to include its full size in the calculation. If the reference is small
      // and near the edge of a boundary, the popper can overflow even if the
      // reference is not overflowing as well (e.g. virtual elements with no
      // width or height)

      var arrowLen = within(0, referenceRect[len], arrowRect[len]);
      var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
      var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
      var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
      var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
      var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
      var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
      var tetherMax = offset + maxOffset - offsetModifierValue;
      var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
      popperOffsets[mainAxis] = preventedOffset;
      data[mainAxis] = preventedOffset - offset;
    }

    if (checkAltAxis) {
      var _offsetModifierState$2;

      var _mainSide = mainAxis === 'x' ? top : left;

      var _altSide = mainAxis === 'x' ? bottom : right;

      var _offset = popperOffsets[altAxis];

      var _len = altAxis === 'y' ? 'height' : 'width';

      var _min = _offset + overflow[_mainSide];

      var _max = _offset - overflow[_altSide];

      var isOriginSide = [top, left].indexOf(basePlacement) !== -1;

      var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;

      var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;

      var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;

      var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);

      popperOffsets[altAxis] = _preventedOffset;
      data[altAxis] = _preventedOffset - _offset;
    }

    state.modifiersData[name] = data;
  } // eslint-disable-next-line import/no-unused-modules


  var preventOverflow$1 = {
    name: 'preventOverflow',
    enabled: true,
    phase: 'main',
    fn: preventOverflow,
    requiresIfExists: ['offset']
  };

  var toPaddingObject = function toPaddingObject(padding, state) {
    padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
      placement: state.placement
    })) : padding;
    return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  };

  function arrow(_ref) {
    var _state$modifiersData$;

    var state = _ref.state,
        name = _ref.name,
        options = _ref.options;
    var arrowElement = state.elements.arrow;
    var popperOffsets = state.modifiersData.popperOffsets;
    var basePlacement = getBasePlacement(state.placement);
    var axis = getMainAxisFromPlacement(basePlacement);
    var isVertical = [left, right].indexOf(basePlacement) >= 0;
    var len = isVertical ? 'height' : 'width';

    if (!arrowElement || !popperOffsets) {
      return;
    }

    var paddingObject = toPaddingObject(options.padding, state);
    var arrowRect = getLayoutRect(arrowElement);
    var minProp = axis === 'y' ? top : left;
    var maxProp = axis === 'y' ? bottom : right;
    var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
    var startDiff = popperOffsets[axis] - state.rects.reference[axis];
    var arrowOffsetParent = getOffsetParent(arrowElement);
    var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
    var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
    // outside of the popper bounds

    var min = paddingObject[minProp];
    var max = clientSize - arrowRect[len] - paddingObject[maxProp];
    var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
    var offset = within(min, center, max); // Prevents breaking syntax highlighting...

    var axisProp = axis;
    state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
  }

  function effect(_ref2) {
    var state = _ref2.state,
        options = _ref2.options;
    var _options$element = options.element,
        arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;

    if (arrowElement == null) {
      return;
    } // CSS selector


    if (typeof arrowElement === 'string') {
      arrowElement = state.elements.popper.querySelector(arrowElement);

      if (!arrowElement) {
        return;
      }
    }

    if (!contains(state.elements.popper, arrowElement)) {
      return;
    }

    state.elements.arrow = arrowElement;
  } // eslint-disable-next-line import/no-unused-modules


  var arrow$1 = {
    name: 'arrow',
    enabled: true,
    phase: 'main',
    fn: arrow,
    effect: effect,
    requires: ['popperOffsets'],
    requiresIfExists: ['preventOverflow']
  };

  function getSideOffsets(overflow, rect, preventedOffsets) {
    if (preventedOffsets === void 0) {
      preventedOffsets = {
        x: 0,
        y: 0
      };
    }

    return {
      top: overflow.top - rect.height - preventedOffsets.y,
      right: overflow.right - rect.width + preventedOffsets.x,
      bottom: overflow.bottom - rect.height + preventedOffsets.y,
      left: overflow.left - rect.width - preventedOffsets.x
    };
  }

  function isAnySideFullyClipped(overflow) {
    return [top, right, bottom, left].some(function (side) {
      return overflow[side] >= 0;
    });
  }

  function hide(_ref) {
    var state = _ref.state,
        name = _ref.name;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var preventedOffsets = state.modifiersData.preventOverflow;
    var referenceOverflow = detectOverflow(state, {
      elementContext: 'reference'
    });
    var popperAltOverflow = detectOverflow(state, {
      altBoundary: true
    });
    var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
    var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
    var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
    var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
    state.modifiersData[name] = {
      referenceClippingOffsets: referenceClippingOffsets,
      popperEscapeOffsets: popperEscapeOffsets,
      isReferenceHidden: isReferenceHidden,
      hasPopperEscaped: hasPopperEscaped
    };
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      'data-popper-reference-hidden': isReferenceHidden,
      'data-popper-escaped': hasPopperEscaped
    });
  } // eslint-disable-next-line import/no-unused-modules


  var hide$1 = {
    name: 'hide',
    enabled: true,
    phase: 'main',
    requiresIfExists: ['preventOverflow'],
    fn: hide
  };

  var defaultModifiers$1 = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1];
  var createPopper$1 = /*#__PURE__*/popperGenerator({
    defaultModifiers: defaultModifiers$1
  }); // eslint-disable-next-line import/no-unused-modules

  var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
  var createPopper = /*#__PURE__*/popperGenerator({
    defaultModifiers: defaultModifiers
  }); // eslint-disable-next-line import/no-unused-modules

  exports.applyStyles = applyStyles$1;
  exports.arrow = arrow$1;
  exports.computeStyles = computeStyles$1;
  exports.createPopper = createPopper;
  exports.createPopperLite = createPopper$1;
  exports.defaultModifiers = defaultModifiers;
  exports.detectOverflow = detectOverflow;
  exports.eventListeners = eventListeners;
  exports.flip = flip$1;
  exports.hide = hide$1;
  exports.offset = offset$1;
  exports.popperGenerator = popperGenerator;
  exports.popperOffsets = popperOffsets$1;
  exports.preventOverflow = preventOverflow$1;

  Object.defineProperty(exports, '__esModule', { value: true });

})));


/*!
  * Bootstrap v5.3.3 (https://getbootstrap.com/)
  * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@popperjs/core')) :
  typeof define === 'function' && define.amd ? define(['@popperjs/core'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bootstrap = factory(global.Popper));
})(this, (function (Popper) { 'use strict';

  function _interopNamespaceDefault(e) {
    const n = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
    if (e) {
      for (const k in e) {
        if (k !== 'default') {
          const d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    }
    n.default = e;
    return Object.freeze(n);
  }

  const Popper__namespace = /*#__PURE__*/_interopNamespaceDefault(Popper);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/data.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  /**
   * Constants
   */

  const elementMap = new Map();
  const Data = {
    set(element, key, instance) {
      if (!elementMap.has(element)) {
        elementMap.set(element, new Map());
      }
      const instanceMap = elementMap.get(element);

      // make it clear we only want one instance per element
      // can be removed later when multiple key/instances are fine to be used
      if (!instanceMap.has(key) && instanceMap.size !== 0) {
        // eslint-disable-next-line no-console
        console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
        return;
      }
      instanceMap.set(key, instance);
    },
    get(element, key) {
      if (elementMap.has(element)) {
        return elementMap.get(element).get(key) || null;
      }
      return null;
    },
    remove(element, key) {
      if (!elementMap.has(element)) {
        return;
      }
      const instanceMap = elementMap.get(element);
      instanceMap.delete(key);

      // free up element references if there are no instances left for an element
      if (instanceMap.size === 0) {
        elementMap.delete(element);
      }
    }
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/index.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const MAX_UID = 1000000;
  const MILLISECONDS_MULTIPLIER = 1000;
  const TRANSITION_END = 'transitionend';

  /**
   * Properly escape IDs selectors to handle weird IDs
   * @param {string} selector
   * @returns {string}
   */
  const parseSelector = selector => {
    if (selector && window.CSS && window.CSS.escape) {
      // document.querySelector needs escaping to handle IDs (html5+) containing for instance /
      selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
    }
    return selector;
  };

  // Shout-out Angus Croll (https://goo.gl/pxwQGp)
  const toType = object => {
    if (object === null || object === undefined) {
      return `${object}`;
    }
    return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
  };

  /**
   * Public Util API
   */

  const getUID = prefix => {
    do {
      prefix += Math.floor(Math.random() * MAX_UID);
    } while (document.getElementById(prefix));
    return prefix;
  };
  const getTransitionDurationFromElement = element => {
    if (!element) {
      return 0;
    }

    // Get transition-duration of the element
    let {
      transitionDuration,
      transitionDelay
    } = window.getComputedStyle(element);
    const floatTransitionDuration = Number.parseFloat(transitionDuration);
    const floatTransitionDelay = Number.parseFloat(transitionDelay);

    // Return 0 if element or transition duration is not found
    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0;
    }

    // If multiple durations are defined, take the first
    transitionDuration = transitionDuration.split(',')[0];
    transitionDelay = transitionDelay.split(',')[0];
    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
  };
  const triggerTransitionEnd = element => {
    element.dispatchEvent(new Event(TRANSITION_END));
  };
  const isElement = object => {
    if (!object || typeof object !== 'object') {
      return false;
    }
    if (typeof object.jquery !== 'undefined') {
      object = object[0];
    }
    return typeof object.nodeType !== 'undefined';
  };
  const getElement = object => {
    // it's a jQuery object or a node element
    if (isElement(object)) {
      return object.jquery ? object[0] : object;
    }
    if (typeof object === 'string' && object.length > 0) {
      return document.querySelector(parseSelector(object));
    }
    return null;
  };
  const isVisible = element => {
    if (!isElement(element) || element.getClientRects().length === 0) {
      return false;
    }
    const elementIsVisible = getComputedStyle(element).getPropertyValue('visibility') === 'visible';
    // Handle `details` element as its content may falsie appear visible when it is closed
    const closedDetails = element.closest('details:not([open])');
    if (!closedDetails) {
      return elementIsVisible;
    }
    if (closedDetails !== element) {
      const summary = element.closest('summary');
      if (summary && summary.parentNode !== closedDetails) {
        return false;
      }
      if (summary === null) {
        return false;
      }
    }
    return elementIsVisible;
  };
  const isDisabled = element => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return true;
    }
    if (element.classList.contains('disabled')) {
      return true;
    }
    if (typeof element.disabled !== 'undefined') {
      return element.disabled;
    }
    return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false';
  };
  const findShadowRoot = element => {
    if (!document.documentElement.attachShadow) {
      return null;
    }

    // Can find the shadow root otherwise it'll return the document
    if (typeof element.getRootNode === 'function') {
      const root = element.getRootNode();
      return root instanceof ShadowRoot ? root : null;
    }
    if (element instanceof ShadowRoot) {
      return element;
    }

    // when we don't find a shadow root
    if (!element.parentNode) {
      return null;
    }
    return findShadowRoot(element.parentNode);
  };
  const noop = () => {};

  /**
   * Trick to restart an element's animation
   *
   * @param {HTMLElement} element
   * @return void
   *
   * @see https://www.charistheo.io/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
   */
  const reflow = element => {
    element.offsetHeight; // eslint-disable-line no-unused-expressions
  };
  const getjQuery = () => {
    if (window.jQuery && !document.body.hasAttribute('data-bs-no-jquery')) {
      return window.jQuery;
    }
    return null;
  };
  const DOMContentLoadedCallbacks = [];
  const onDOMContentLoaded = callback => {
    if (document.readyState === 'loading') {
      // add listener on the first call when the document is in loading state
      if (!DOMContentLoadedCallbacks.length) {
        document.addEventListener('DOMContentLoaded', () => {
          for (const callback of DOMContentLoadedCallbacks) {
            callback();
          }
        });
      }
      DOMContentLoadedCallbacks.push(callback);
    } else {
      callback();
    }
  };
  const isRTL = () => document.documentElement.dir === 'rtl';
  const defineJQueryPlugin = plugin => {
    onDOMContentLoaded(() => {
      const $ = getjQuery();
      /* istanbul ignore if */
      if ($) {
        const name = plugin.NAME;
        const JQUERY_NO_CONFLICT = $.fn[name];
        $.fn[name] = plugin.jQueryInterface;
        $.fn[name].Constructor = plugin;
        $.fn[name].noConflict = () => {
          $.fn[name] = JQUERY_NO_CONFLICT;
          return plugin.jQueryInterface;
        };
      }
    });
  };
  const execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
    return typeof possibleCallback === 'function' ? possibleCallback(...args) : defaultValue;
  };
  const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
    if (!waitForTransition) {
      execute(callback);
      return;
    }
    const durationPadding = 5;
    const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
    let called = false;
    const handler = ({
      target
    }) => {
      if (target !== transitionElement) {
        return;
      }
      called = true;
      transitionElement.removeEventListener(TRANSITION_END, handler);
      execute(callback);
    };
    transitionElement.addEventListener(TRANSITION_END, handler);
    setTimeout(() => {
      if (!called) {
        triggerTransitionEnd(transitionElement);
      }
    }, emulatedDuration);
  };

  /**
   * Return the previous/next element of a list.
   *
   * @param {array} list    The list of elements
   * @param activeElement   The active element
   * @param shouldGetNext   Choose to get next or previous element
   * @param isCycleAllowed
   * @return {Element|elem} The proper element
   */
  const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
    const listLength = list.length;
    let index = list.indexOf(activeElement);

    // if the element does not exist in the list return an element
    // depending on the direction and if cycle is allowed
    if (index === -1) {
      return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
    }
    index += shouldGetNext ? 1 : -1;
    if (isCycleAllowed) {
      index = (index + listLength) % listLength;
    }
    return list[Math.max(0, Math.min(index, listLength - 1))];
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/event-handler.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
  const stripNameRegex = /\..*/;
  const stripUidRegex = /::\d+$/;
  const eventRegistry = {}; // Events storage
  let uidEvent = 1;
  const customEvents = {
    mouseenter: 'mouseover',
    mouseleave: 'mouseout'
  };
  const nativeEvents = new Set(['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', 'mousewheel', 'DOMMouseScroll', 'mouseover', 'mouseout', 'mousemove', 'selectstart', 'selectend', 'keydown', 'keypress', 'keyup', 'orientationchange', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup', 'pointerleave', 'pointercancel', 'gesturestart', 'gesturechange', 'gestureend', 'focus', 'blur', 'change', 'reset', 'select', 'submit', 'focusin', 'focusout', 'load', 'unload', 'beforeunload', 'resize', 'move', 'DOMContentLoaded', 'readystatechange', 'error', 'abort', 'scroll']);

  /**
   * Private methods
   */

  function makeEventUid(element, uid) {
    return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
  }
  function getElementEvents(element) {
    const uid = makeEventUid(element);
    element.uidEvent = uid;
    eventRegistry[uid] = eventRegistry[uid] || {};
    return eventRegistry[uid];
  }
  function bootstrapHandler(element, fn) {
    return function handler(event) {
      hydrateObj(event, {
        delegateTarget: element
      });
      if (handler.oneOff) {
        EventHandler.off(element, event.type, fn);
      }
      return fn.apply(element, [event]);
    };
  }
  function bootstrapDelegationHandler(element, selector, fn) {
    return function handler(event) {
      const domElements = element.querySelectorAll(selector);
      for (let {
        target
      } = event; target && target !== this; target = target.parentNode) {
        for (const domElement of domElements) {
          if (domElement !== target) {
            continue;
          }
          hydrateObj(event, {
            delegateTarget: target
          });
          if (handler.oneOff) {
            EventHandler.off(element, event.type, selector, fn);
          }
          return fn.apply(target, [event]);
        }
      }
    };
  }
  function findHandler(events, callable, delegationSelector = null) {
    return Object.values(events).find(event => event.callable === callable && event.delegationSelector === delegationSelector);
  }
  function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
    const isDelegated = typeof handler === 'string';
    // TODO: tooltip passes `false` instead of selector, so we need to check
    const callable = isDelegated ? delegationFunction : handler || delegationFunction;
    let typeEvent = getTypeEvent(originalTypeEvent);
    if (!nativeEvents.has(typeEvent)) {
      typeEvent = originalTypeEvent;
    }
    return [isDelegated, callable, typeEvent];
  }
  function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
    if (typeof originalTypeEvent !== 'string' || !element) {
      return;
    }
    let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);

    // in case of mouseenter or mouseleave wrap the handler within a function that checks for its DOM position
    // this prevents the handler from being dispatched the same way as mouseover or mouseout does
    if (originalTypeEvent in customEvents) {
      const wrapFunction = fn => {
        return function (event) {
          if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
            return fn.call(this, event);
          }
        };
      };
      callable = wrapFunction(callable);
    }
    const events = getElementEvents(element);
    const handlers = events[typeEvent] || (events[typeEvent] = {});
    const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
    if (previousFunction) {
      previousFunction.oneOff = previousFunction.oneOff && oneOff;
      return;
    }
    const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ''));
    const fn = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
    fn.delegationSelector = isDelegated ? handler : null;
    fn.callable = callable;
    fn.oneOff = oneOff;
    fn.uidEvent = uid;
    handlers[uid] = fn;
    element.addEventListener(typeEvent, fn, isDelegated);
  }
  function removeHandler(element, events, typeEvent, handler, delegationSelector) {
    const fn = findHandler(events[typeEvent], handler, delegationSelector);
    if (!fn) {
      return;
    }
    element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
    delete events[typeEvent][fn.uidEvent];
  }
  function removeNamespacedHandlers(element, events, typeEvent, namespace) {
    const storeElementEvent = events[typeEvent] || {};
    for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
      if (handlerKey.includes(namespace)) {
        removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
      }
    }
  }
  function getTypeEvent(event) {
    // allow to get the native events from namespaced events ('click.bs.button' --> 'click')
    event = event.replace(stripNameRegex, '');
    return customEvents[event] || event;
  }
  const EventHandler = {
    on(element, event, handler, delegationFunction) {
      addHandler(element, event, handler, delegationFunction, false);
    },
    one(element, event, handler, delegationFunction) {
      addHandler(element, event, handler, delegationFunction, true);
    },
    off(element, originalTypeEvent, handler, delegationFunction) {
      if (typeof originalTypeEvent !== 'string' || !element) {
        return;
      }
      const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
      const inNamespace = typeEvent !== originalTypeEvent;
      const events = getElementEvents(element);
      const storeElementEvent = events[typeEvent] || {};
      const isNamespace = originalTypeEvent.startsWith('.');
      if (typeof callable !== 'undefined') {
        // Simplest case: handler is passed, remove that listener ONLY.
        if (!Object.keys(storeElementEvent).length) {
          return;
        }
        removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
        return;
      }
      if (isNamespace) {
        for (const elementEvent of Object.keys(events)) {
          removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
        }
      }
      for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
        const handlerKey = keyHandlers.replace(stripUidRegex, '');
        if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
          removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
        }
      }
    },
    trigger(element, event, args) {
      if (typeof event !== 'string' || !element) {
        return null;
      }
      const $ = getjQuery();
      const typeEvent = getTypeEvent(event);
      const inNamespace = event !== typeEvent;
      let jQueryEvent = null;
      let bubbles = true;
      let nativeDispatch = true;
      let defaultPrevented = false;
      if (inNamespace && $) {
        jQueryEvent = $.Event(event, args);
        $(element).trigger(jQueryEvent);
        bubbles = !jQueryEvent.isPropagationStopped();
        nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
        defaultPrevented = jQueryEvent.isDefaultPrevented();
      }
      const evt = hydrateObj(new Event(event, {
        bubbles,
        cancelable: true
      }), args);
      if (defaultPrevented) {
        evt.preventDefault();
      }
      if (nativeDispatch) {
        element.dispatchEvent(evt);
      }
      if (evt.defaultPrevented && jQueryEvent) {
        jQueryEvent.preventDefault();
      }
      return evt;
    }
  };
  function hydrateObj(obj, meta = {}) {
    for (const [key, value] of Object.entries(meta)) {
      try {
        obj[key] = value;
      } catch (_unused) {
        Object.defineProperty(obj, key, {
          configurable: true,
          get() {
            return value;
          }
        });
      }
    }
    return obj;
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/manipulator.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  function normalizeData(value) {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    if (value === Number(value).toString()) {
      return Number(value);
    }
    if (value === '' || value === 'null') {
      return null;
    }
    if (typeof value !== 'string') {
      return value;
    }
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch (_unused) {
      return value;
    }
  }
  function normalizeDataKey(key) {
    return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
  }
  const Manipulator = {
    setDataAttribute(element, key, value) {
      element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
    },
    removeDataAttribute(element, key) {
      element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
    },
    getDataAttributes(element) {
      if (!element) {
        return {};
      }
      const attributes = {};
      const bsKeys = Object.keys(element.dataset).filter(key => key.startsWith('bs') && !key.startsWith('bsConfig'));
      for (const key of bsKeys) {
        let pureKey = key.replace(/^bs/, '');
        pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
        attributes[pureKey] = normalizeData(element.dataset[key]);
      }
      return attributes;
    },
    getDataAttribute(element, key) {
      return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
    }
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/config.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Class definition
   */

  class Config {
    // Getters
    static get Default() {
      return {};
    }
    static get DefaultType() {
      return {};
    }
    static get NAME() {
      throw new Error('You have to implement the static method "NAME", for each component!');
    }
    _getConfig(config) {
      config = this._mergeConfigObj(config);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }
    _configAfterMerge(config) {
      return config;
    }
    _mergeConfigObj(config, element) {
      const jsonConfig = isElement(element) ? Manipulator.getDataAttribute(element, 'config') : {}; // try to parse

      return {
        ...this.constructor.Default,
        ...(typeof jsonConfig === 'object' ? jsonConfig : {}),
        ...(isElement(element) ? Manipulator.getDataAttributes(element) : {}),
        ...(typeof config === 'object' ? config : {})
      };
    }
    _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
      for (const [property, expectedTypes] of Object.entries(configTypes)) {
        const value = config[property];
        const valueType = isElement(value) ? 'element' : toType(value);
        if (!new RegExp(expectedTypes).test(valueType)) {
          throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
        }
      }
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap base-component.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const VERSION = '5.3.3';

  /**
   * Class definition
   */

  class BaseComponent extends Config {
    constructor(element, config) {
      super();
      element = getElement(element);
      if (!element) {
        return;
      }
      this._element = element;
      this._config = this._getConfig(config);
      Data.set(this._element, this.constructor.DATA_KEY, this);
    }

    // Public
    dispose() {
      Data.remove(this._element, this.constructor.DATA_KEY);
      EventHandler.off(this._element, this.constructor.EVENT_KEY);
      for (const propertyName of Object.getOwnPropertyNames(this)) {
        this[propertyName] = null;
      }
    }
    _queueCallback(callback, element, isAnimated = true) {
      executeAfterTransition(callback, element, isAnimated);
    }
    _getConfig(config) {
      config = this._mergeConfigObj(config, this._element);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }

    // Static
    static getInstance(element) {
      return Data.get(getElement(element), this.DATA_KEY);
    }
    static getOrCreateInstance(element, config = {}) {
      return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
    }
    static get VERSION() {
      return VERSION;
    }
    static get DATA_KEY() {
      return `bs.${this.NAME}`;
    }
    static get EVENT_KEY() {
      return `.${this.DATA_KEY}`;
    }
    static eventName(name) {
      return `${name}${this.EVENT_KEY}`;
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/selector-engine.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const getSelector = element => {
    let selector = element.getAttribute('data-bs-target');
    if (!selector || selector === '#') {
      let hrefAttribute = element.getAttribute('href');

      // The only valid content that could double as a selector are IDs or classes,
      // so everything starting with `#` or `.`. If a "real" URL is used as the selector,
      // `document.querySelector` will rightfully complain it is invalid.
      // See https://github.com/twbs/bootstrap/issues/32273
      if (!hrefAttribute || !hrefAttribute.includes('#') && !hrefAttribute.startsWith('.')) {
        return null;
      }

      // Just in case some CMS puts out a full URL with the anchor appended
      if (hrefAttribute.includes('#') && !hrefAttribute.startsWith('#')) {
        hrefAttribute = `#${hrefAttribute.split('#')[1]}`;
      }
      selector = hrefAttribute && hrefAttribute !== '#' ? hrefAttribute.trim() : null;
    }
    return selector ? selector.split(',').map(sel => parseSelector(sel)).join(',') : null;
  };
  const SelectorEngine = {
    find(selector, element = document.documentElement) {
      return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
    },
    findOne(selector, element = document.documentElement) {
      return Element.prototype.querySelector.call(element, selector);
    },
    children(element, selector) {
      return [].concat(...element.children).filter(child => child.matches(selector));
    },
    parents(element, selector) {
      const parents = [];
      let ancestor = element.parentNode.closest(selector);
      while (ancestor) {
        parents.push(ancestor);
        ancestor = ancestor.parentNode.closest(selector);
      }
      return parents;
    },
    prev(element, selector) {
      let previous = element.previousElementSibling;
      while (previous) {
        if (previous.matches(selector)) {
          return [previous];
        }
        previous = previous.previousElementSibling;
      }
      return [];
    },
    // TODO: this is now unused; remove later along with prev()
    next(element, selector) {
      let next = element.nextElementSibling;
      while (next) {
        if (next.matches(selector)) {
          return [next];
        }
        next = next.nextElementSibling;
      }
      return [];
    },
    focusableChildren(element) {
      const focusables = ['a', 'button', 'input', 'textarea', 'select', 'details', '[tabindex]', '[contenteditable="true"]'].map(selector => `${selector}:not([tabindex^="-"])`).join(',');
      return this.find(focusables, element).filter(el => !isDisabled(el) && isVisible(el));
    },
    getSelectorFromElement(element) {
      const selector = getSelector(element);
      if (selector) {
        return SelectorEngine.findOne(selector) ? selector : null;
      }
      return null;
    },
    getElementFromSelector(element) {
      const selector = getSelector(element);
      return selector ? SelectorEngine.findOne(selector) : null;
    },
    getMultipleElementsFromSelector(element) {
      const selector = getSelector(element);
      return selector ? SelectorEngine.find(selector) : [];
    }
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/component-functions.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const enableDismissTrigger = (component, method = 'hide') => {
    const clickEvent = `click.dismiss${component.EVENT_KEY}`;
    const name = component.NAME;
    EventHandler.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function (event) {
      if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
      }
      if (isDisabled(this)) {
        return;
      }
      const target = SelectorEngine.getElementFromSelector(this) || this.closest(`.${name}`);
      const instance = component.getOrCreateInstance(target);

      // Method argument is left, for Alert and only, as it doesn't implement the 'hide' method
      instance[method]();
    });
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap alert.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$f = 'alert';
  const DATA_KEY$a = 'bs.alert';
  const EVENT_KEY$b = `.${DATA_KEY$a}`;
  const EVENT_CLOSE = `close${EVENT_KEY$b}`;
  const EVENT_CLOSED = `closed${EVENT_KEY$b}`;
  const CLASS_NAME_FADE$5 = 'fade';
  const CLASS_NAME_SHOW$8 = 'show';

  /**
   * Class definition
   */

  class Alert extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$f;
    }

    // Public
    close() {
      const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);
      if (closeEvent.defaultPrevented) {
        return;
      }
      this._element.classList.remove(CLASS_NAME_SHOW$8);
      const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);
      this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
    }

    // Private
    _destroyElement() {
      this._element.remove();
      EventHandler.trigger(this._element, EVENT_CLOSED);
      this.dispose();
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Alert.getOrCreateInstance(this);
        if (typeof config !== 'string') {
          return;
        }
        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](this);
      });
    }
  }

  /**
   * Data API implementation
   */

  enableDismissTrigger(Alert, 'close');

  /**
   * jQuery
   */

  defineJQueryPlugin(Alert);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap button.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$e = 'button';
  const DATA_KEY$9 = 'bs.button';
  const EVENT_KEY$a = `.${DATA_KEY$9}`;
  const DATA_API_KEY$6 = '.data-api';
  const CLASS_NAME_ACTIVE$3 = 'active';
  const SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
  const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`;

  /**
   * Class definition
   */

  class Button extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$e;
    }

    // Public
    toggle() {
      // Toggle class and sync the `aria-pressed` attribute with the return value of the `.toggle()` method
      this._element.setAttribute('aria-pressed', this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Button.getOrCreateInstance(this);
        if (config === 'toggle') {
          data[config]();
        }
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$5, event => {
    event.preventDefault();
    const button = event.target.closest(SELECTOR_DATA_TOGGLE$5);
    const data = Button.getOrCreateInstance(button);
    data.toggle();
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(Button);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/swipe.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$d = 'swipe';
  const EVENT_KEY$9 = '.bs.swipe';
  const EVENT_TOUCHSTART = `touchstart${EVENT_KEY$9}`;
  const EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$9}`;
  const EVENT_TOUCHEND = `touchend${EVENT_KEY$9}`;
  const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$9}`;
  const EVENT_POINTERUP = `pointerup${EVENT_KEY$9}`;
  const POINTER_TYPE_TOUCH = 'touch';
  const POINTER_TYPE_PEN = 'pen';
  const CLASS_NAME_POINTER_EVENT = 'pointer-event';
  const SWIPE_THRESHOLD = 40;
  const Default$c = {
    endCallback: null,
    leftCallback: null,
    rightCallback: null
  };
  const DefaultType$c = {
    endCallback: '(function|null)',
    leftCallback: '(function|null)',
    rightCallback: '(function|null)'
  };

  /**
   * Class definition
   */

  class Swipe extends Config {
    constructor(element, config) {
      super();
      this._element = element;
      if (!element || !Swipe.isSupported()) {
        return;
      }
      this._config = this._getConfig(config);
      this._deltaX = 0;
      this._supportPointerEvents = Boolean(window.PointerEvent);
      this._initEvents();
    }

    // Getters
    static get Default() {
      return Default$c;
    }
    static get DefaultType() {
      return DefaultType$c;
    }
    static get NAME() {
      return NAME$d;
    }

    // Public
    dispose() {
      EventHandler.off(this._element, EVENT_KEY$9);
    }

    // Private
    _start(event) {
      if (!this._supportPointerEvents) {
        this._deltaX = event.touches[0].clientX;
        return;
      }
      if (this._eventIsPointerPenTouch(event)) {
        this._deltaX = event.clientX;
      }
    }
    _end(event) {
      if (this._eventIsPointerPenTouch(event)) {
        this._deltaX = event.clientX - this._deltaX;
      }
      this._handleSwipe();
      execute(this._config.endCallback);
    }
    _move(event) {
      this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
    }
    _handleSwipe() {
      const absDeltaX = Math.abs(this._deltaX);
      if (absDeltaX <= SWIPE_THRESHOLD) {
        return;
      }
      const direction = absDeltaX / this._deltaX;
      this._deltaX = 0;
      if (!direction) {
        return;
      }
      execute(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
    }
    _initEvents() {
      if (this._supportPointerEvents) {
        EventHandler.on(this._element, EVENT_POINTERDOWN, event => this._start(event));
        EventHandler.on(this._element, EVENT_POINTERUP, event => this._end(event));
        this._element.classList.add(CLASS_NAME_POINTER_EVENT);
      } else {
        EventHandler.on(this._element, EVENT_TOUCHSTART, event => this._start(event));
        EventHandler.on(this._element, EVENT_TOUCHMOVE, event => this._move(event));
        EventHandler.on(this._element, EVENT_TOUCHEND, event => this._end(event));
      }
    }
    _eventIsPointerPenTouch(event) {
      return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
    }

    // Static
    static isSupported() {
      return 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap carousel.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$c = 'carousel';
  const DATA_KEY$8 = 'bs.carousel';
  const EVENT_KEY$8 = `.${DATA_KEY$8}`;
  const DATA_API_KEY$5 = '.data-api';
  const ARROW_LEFT_KEY$1 = 'ArrowLeft';
  const ARROW_RIGHT_KEY$1 = 'ArrowRight';
  const TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

  const ORDER_NEXT = 'next';
  const ORDER_PREV = 'prev';
  const DIRECTION_LEFT = 'left';
  const DIRECTION_RIGHT = 'right';
  const EVENT_SLIDE = `slide${EVENT_KEY$8}`;
  const EVENT_SLID = `slid${EVENT_KEY$8}`;
  const EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$8}`;
  const EVENT_MOUSEENTER$1 = `mouseenter${EVENT_KEY$8}`;
  const EVENT_MOUSELEAVE$1 = `mouseleave${EVENT_KEY$8}`;
  const EVENT_DRAG_START = `dragstart${EVENT_KEY$8}`;
  const EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$8}${DATA_API_KEY$5}`;
  const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$8}${DATA_API_KEY$5}`;
  const CLASS_NAME_CAROUSEL = 'carousel';
  const CLASS_NAME_ACTIVE$2 = 'active';
  const CLASS_NAME_SLIDE = 'slide';
  const CLASS_NAME_END = 'carousel-item-end';
  const CLASS_NAME_START = 'carousel-item-start';
  const CLASS_NAME_NEXT = 'carousel-item-next';
  const CLASS_NAME_PREV = 'carousel-item-prev';
  const SELECTOR_ACTIVE = '.active';
  const SELECTOR_ITEM = '.carousel-item';
  const SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
  const SELECTOR_ITEM_IMG = '.carousel-item img';
  const SELECTOR_INDICATORS = '.carousel-indicators';
  const SELECTOR_DATA_SLIDE = '[data-bs-slide], [data-bs-slide-to]';
  const SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
  const KEY_TO_DIRECTION = {
    [ARROW_LEFT_KEY$1]: DIRECTION_RIGHT,
    [ARROW_RIGHT_KEY$1]: DIRECTION_LEFT
  };
  const Default$b = {
    interval: 5000,
    keyboard: true,
    pause: 'hover',
    ride: false,
    touch: true,
    wrap: true
  };
  const DefaultType$b = {
    interval: '(number|boolean)',
    // TODO:v6 remove boolean support
    keyboard: 'boolean',
    pause: '(string|boolean)',
    ride: '(boolean|string)',
    touch: 'boolean',
    wrap: 'boolean'
  };

  /**
   * Class definition
   */

  class Carousel extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._interval = null;
      this._activeElement = null;
      this._isSliding = false;
      this.touchTimeout = null;
      this._swipeHelper = null;
      this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
      this._addEventListeners();
      if (this._config.ride === CLASS_NAME_CAROUSEL) {
        this.cycle();
      }
    }

    // Getters
    static get Default() {
      return Default$b;
    }
    static get DefaultType() {
      return DefaultType$b;
    }
    static get NAME() {
      return NAME$c;
    }

    // Public
    next() {
      this._slide(ORDER_NEXT);
    }
    nextWhenVisible() {
      // FIXME TODO use `document.visibilityState`
      // Don't call next when the page isn't visible
      // or the carousel or its parent isn't visible
      if (!document.hidden && isVisible(this._element)) {
        this.next();
      }
    }
    prev() {
      this._slide(ORDER_PREV);
    }
    pause() {
      if (this._isSliding) {
        triggerTransitionEnd(this._element);
      }
      this._clearInterval();
    }
    cycle() {
      this._clearInterval();
      this._updateInterval();
      this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
    }
    _maybeEnableCycle() {
      if (!this._config.ride) {
        return;
      }
      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.cycle());
        return;
      }
      this.cycle();
    }
    to(index) {
      const items = this._getItems();
      if (index > items.length - 1 || index < 0) {
        return;
      }
      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
        return;
      }
      const activeIndex = this._getItemIndex(this._getActive());
      if (activeIndex === index) {
        return;
      }
      const order = index > activeIndex ? ORDER_NEXT : ORDER_PREV;
      this._slide(order, items[index]);
    }
    dispose() {
      if (this._swipeHelper) {
        this._swipeHelper.dispose();
      }
      super.dispose();
    }

    // Private
    _configAfterMerge(config) {
      config.defaultInterval = config.interval;
      return config;
    }
    _addEventListeners() {
      if (this._config.keyboard) {
        EventHandler.on(this._element, EVENT_KEYDOWN$1, event => this._keydown(event));
      }
      if (this._config.pause === 'hover') {
        EventHandler.on(this._element, EVENT_MOUSEENTER$1, () => this.pause());
        EventHandler.on(this._element, EVENT_MOUSELEAVE$1, () => this._maybeEnableCycle());
      }
      if (this._config.touch && Swipe.isSupported()) {
        this._addTouchEventListeners();
      }
    }
    _addTouchEventListeners() {
      for (const img of SelectorEngine.find(SELECTOR_ITEM_IMG, this._element)) {
        EventHandler.on(img, EVENT_DRAG_START, event => event.preventDefault());
      }
      const endCallBack = () => {
        if (this._config.pause !== 'hover') {
          return;
        }

        // If it's a touch-enabled device, mouseenter/leave are fired as
        // part of the mouse compatibility events on first tap - the carousel
        // would stop cycling until user tapped out of it;
        // here, we listen for touchend, explicitly pause the carousel
        // (as if it's the second time we tap on it, mouseenter compat event
        // is NOT fired) and after a timeout (to allow for mouse compatibility
        // events to fire) we explicitly restart cycling

        this.pause();
        if (this.touchTimeout) {
          clearTimeout(this.touchTimeout);
        }
        this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
      };
      const swipeConfig = {
        leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
        rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
        endCallback: endCallBack
      };
      this._swipeHelper = new Swipe(this._element, swipeConfig);
    }
    _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }
      const direction = KEY_TO_DIRECTION[event.key];
      if (direction) {
        event.preventDefault();
        this._slide(this._directionToOrder(direction));
      }
    }
    _getItemIndex(element) {
      return this._getItems().indexOf(element);
    }
    _setActiveIndicatorElement(index) {
      if (!this._indicatorsElement) {
        return;
      }
      const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
      activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
      activeIndicator.removeAttribute('aria-current');
      const newActiveIndicator = SelectorEngine.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);
      if (newActiveIndicator) {
        newActiveIndicator.classList.add(CLASS_NAME_ACTIVE$2);
        newActiveIndicator.setAttribute('aria-current', 'true');
      }
    }
    _updateInterval() {
      const element = this._activeElement || this._getActive();
      if (!element) {
        return;
      }
      const elementInterval = Number.parseInt(element.getAttribute('data-bs-interval'), 10);
      this._config.interval = elementInterval || this._config.defaultInterval;
    }
    _slide(order, element = null) {
      if (this._isSliding) {
        return;
      }
      const activeElement = this._getActive();
      const isNext = order === ORDER_NEXT;
      const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);
      if (nextElement === activeElement) {
        return;
      }
      const nextElementIndex = this._getItemIndex(nextElement);
      const triggerEvent = eventName => {
        return EventHandler.trigger(this._element, eventName, {
          relatedTarget: nextElement,
          direction: this._orderToDirection(order),
          from: this._getItemIndex(activeElement),
          to: nextElementIndex
        });
      };
      const slideEvent = triggerEvent(EVENT_SLIDE);
      if (slideEvent.defaultPrevented) {
        return;
      }
      if (!activeElement || !nextElement) {
        // Some weirdness is happening, so we bail
        // TODO: change tests that use empty divs to avoid this check
        return;
      }
      const isCycling = Boolean(this._interval);
      this.pause();
      this._isSliding = true;
      this._setActiveIndicatorElement(nextElementIndex);
      this._activeElement = nextElement;
      const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
      const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;
      nextElement.classList.add(orderClassName);
      reflow(nextElement);
      activeElement.classList.add(directionalClassName);
      nextElement.classList.add(directionalClassName);
      const completeCallBack = () => {
        nextElement.classList.remove(directionalClassName, orderClassName);
        nextElement.classList.add(CLASS_NAME_ACTIVE$2);
        activeElement.classList.remove(CLASS_NAME_ACTIVE$2, orderClassName, directionalClassName);
        this._isSliding = false;
        triggerEvent(EVENT_SLID);
      };
      this._queueCallback(completeCallBack, activeElement, this._isAnimated());
      if (isCycling) {
        this.cycle();
      }
    }
    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_SLIDE);
    }
    _getActive() {
      return SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
    }
    _getItems() {
      return SelectorEngine.find(SELECTOR_ITEM, this._element);
    }
    _clearInterval() {
      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }
    }
    _directionToOrder(direction) {
      if (isRTL()) {
        return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
      }
      return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
    }
    _orderToDirection(order) {
      if (isRTL()) {
        return order === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
      }
      return order === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Carousel.getOrCreateInstance(this, config);
        if (typeof config === 'number') {
          data.to(config);
          return;
        }
        if (typeof config === 'string') {
          if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        }
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_SLIDE, function (event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
      return;
    }
    event.preventDefault();
    const carousel = Carousel.getOrCreateInstance(target);
    const slideIndex = this.getAttribute('data-bs-slide-to');
    if (slideIndex) {
      carousel.to(slideIndex);
      carousel._maybeEnableCycle();
      return;
    }
    if (Manipulator.getDataAttribute(this, 'slide') === 'next') {
      carousel.next();
      carousel._maybeEnableCycle();
      return;
    }
    carousel.prev();
    carousel._maybeEnableCycle();
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API$3, () => {
    const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);
    for (const carousel of carousels) {
      Carousel.getOrCreateInstance(carousel);
    }
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(Carousel);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap collapse.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$b = 'collapse';
  const DATA_KEY$7 = 'bs.collapse';
  const EVENT_KEY$7 = `.${DATA_KEY$7}`;
  const DATA_API_KEY$4 = '.data-api';
  const EVENT_SHOW$6 = `show${EVENT_KEY$7}`;
  const EVENT_SHOWN$6 = `shown${EVENT_KEY$7}`;
  const EVENT_HIDE$6 = `hide${EVENT_KEY$7}`;
  const EVENT_HIDDEN$6 = `hidden${EVENT_KEY$7}`;
  const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$7}${DATA_API_KEY$4}`;
  const CLASS_NAME_SHOW$7 = 'show';
  const CLASS_NAME_COLLAPSE = 'collapse';
  const CLASS_NAME_COLLAPSING = 'collapsing';
  const CLASS_NAME_COLLAPSED = 'collapsed';
  const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
  const CLASS_NAME_HORIZONTAL = 'collapse-horizontal';
  const WIDTH = 'width';
  const HEIGHT = 'height';
  const SELECTOR_ACTIVES = '.collapse.show, .collapse.collapsing';
  const SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';
  const Default$a = {
    parent: null,
    toggle: true
  };
  const DefaultType$a = {
    parent: '(null|element)',
    toggle: 'boolean'
  };

  /**
   * Class definition
   */

  class Collapse extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._isTransitioning = false;
      this._triggerArray = [];
      const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);
      for (const elem of toggleList) {
        const selector = SelectorEngine.getSelectorFromElement(elem);
        const filterElement = SelectorEngine.find(selector).filter(foundElement => foundElement === this._element);
        if (selector !== null && filterElement.length) {
          this._triggerArray.push(elem);
        }
      }
      this._initializeChildren();
      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
      }
      if (this._config.toggle) {
        this.toggle();
      }
    }

    // Getters
    static get Default() {
      return Default$a;
    }
    static get DefaultType() {
      return DefaultType$a;
    }
    static get NAME() {
      return NAME$b;
    }

    // Public
    toggle() {
      if (this._isShown()) {
        this.hide();
      } else {
        this.show();
      }
    }
    show() {
      if (this._isTransitioning || this._isShown()) {
        return;
      }
      let activeChildren = [];

      // find active children
      if (this._config.parent) {
        activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter(element => element !== this._element).map(element => Collapse.getOrCreateInstance(element, {
          toggle: false
        }));
      }
      if (activeChildren.length && activeChildren[0]._isTransitioning) {
        return;
      }
      const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$6);
      if (startEvent.defaultPrevented) {
        return;
      }
      for (const activeInstance of activeChildren) {
        activeInstance.hide();
      }
      const dimension = this._getDimension();
      this._element.classList.remove(CLASS_NAME_COLLAPSE);
      this._element.classList.add(CLASS_NAME_COLLAPSING);
      this._element.style[dimension] = 0;
      this._addAriaAndCollapsedClass(this._triggerArray, true);
      this._isTransitioning = true;
      const complete = () => {
        this._isTransitioning = false;
        this._element.classList.remove(CLASS_NAME_COLLAPSING);
        this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
        this._element.style[dimension] = '';
        EventHandler.trigger(this._element, EVENT_SHOWN$6);
      };
      const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      const scrollSize = `scroll${capitalizedDimension}`;
      this._queueCallback(complete, this._element, true);
      this._element.style[dimension] = `${this._element[scrollSize]}px`;
    }
    hide() {
      if (this._isTransitioning || !this._isShown()) {
        return;
      }
      const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$6);
      if (startEvent.defaultPrevented) {
        return;
      }
      const dimension = this._getDimension();
      this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_COLLAPSING);
      this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
      for (const trigger of this._triggerArray) {
        const element = SelectorEngine.getElementFromSelector(trigger);
        if (element && !this._isShown(element)) {
          this._addAriaAndCollapsedClass([trigger], false);
        }
      }
      this._isTransitioning = true;
      const complete = () => {
        this._isTransitioning = false;
        this._element.classList.remove(CLASS_NAME_COLLAPSING);
        this._element.classList.add(CLASS_NAME_COLLAPSE);
        EventHandler.trigger(this._element, EVENT_HIDDEN$6);
      };
      this._element.style[dimension] = '';
      this._queueCallback(complete, this._element, true);
    }
    _isShown(element = this._element) {
      return element.classList.contains(CLASS_NAME_SHOW$7);
    }

    // Private
    _configAfterMerge(config) {
      config.toggle = Boolean(config.toggle); // Coerce string values
      config.parent = getElement(config.parent);
      return config;
    }
    _getDimension() {
      return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
    }
    _initializeChildren() {
      if (!this._config.parent) {
        return;
      }
      const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$4);
      for (const element of children) {
        const selected = SelectorEngine.getElementFromSelector(element);
        if (selected) {
          this._addAriaAndCollapsedClass([element], this._isShown(selected));
        }
      }
    }
    _getFirstLevelChildren(selector) {
      const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
      // remove children if greater depth
      return SelectorEngine.find(selector, this._config.parent).filter(element => !children.includes(element));
    }
    _addAriaAndCollapsedClass(triggerArray, isOpen) {
      if (!triggerArray.length) {
        return;
      }
      for (const element of triggerArray) {
        element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
        element.setAttribute('aria-expanded', isOpen);
      }
    }

    // Static
    static jQueryInterface(config) {
      const _config = {};
      if (typeof config === 'string' && /show|hide/.test(config)) {
        _config.toggle = false;
      }
      return this.each(function () {
        const data = Collapse.getOrCreateInstance(this, _config);
        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        }
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$4, function (event) {
    // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
    if (event.target.tagName === 'A' || event.delegateTarget && event.delegateTarget.tagName === 'A') {
      event.preventDefault();
    }
    for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) {
      Collapse.getOrCreateInstance(element, {
        toggle: false
      }).toggle();
    }
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(Collapse);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dropdown.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$a = 'dropdown';
  const DATA_KEY$6 = 'bs.dropdown';
  const EVENT_KEY$6 = `.${DATA_KEY$6}`;
  const DATA_API_KEY$3 = '.data-api';
  const ESCAPE_KEY$2 = 'Escape';
  const TAB_KEY$1 = 'Tab';
  const ARROW_UP_KEY$1 = 'ArrowUp';
  const ARROW_DOWN_KEY$1 = 'ArrowDown';
  const RIGHT_MOUSE_BUTTON = 2; // MouseEvent.button value for the secondary button, usually the right button

  const EVENT_HIDE$5 = `hide${EVENT_KEY$6}`;
  const EVENT_HIDDEN$5 = `hidden${EVENT_KEY$6}`;
  const EVENT_SHOW$5 = `show${EVENT_KEY$6}`;
  const EVENT_SHOWN$5 = `shown${EVENT_KEY$6}`;
  const EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const CLASS_NAME_SHOW$6 = 'show';
  const CLASS_NAME_DROPUP = 'dropup';
  const CLASS_NAME_DROPEND = 'dropend';
  const CLASS_NAME_DROPSTART = 'dropstart';
  const CLASS_NAME_DROPUP_CENTER = 'dropup-center';
  const CLASS_NAME_DROPDOWN_CENTER = 'dropdown-center';
  const SELECTOR_DATA_TOGGLE$3 = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
  const SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE$3}.${CLASS_NAME_SHOW$6}`;
  const SELECTOR_MENU = '.dropdown-menu';
  const SELECTOR_NAVBAR = '.navbar';
  const SELECTOR_NAVBAR_NAV = '.navbar-nav';
  const SELECTOR_VISIBLE_ITEMS = '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)';
  const PLACEMENT_TOP = isRTL() ? 'top-end' : 'top-start';
  const PLACEMENT_TOPEND = isRTL() ? 'top-start' : 'top-end';
  const PLACEMENT_BOTTOM = isRTL() ? 'bottom-end' : 'bottom-start';
  const PLACEMENT_BOTTOMEND = isRTL() ? 'bottom-start' : 'bottom-end';
  const PLACEMENT_RIGHT = isRTL() ? 'left-start' : 'right-start';
  const PLACEMENT_LEFT = isRTL() ? 'right-start' : 'left-start';
  const PLACEMENT_TOPCENTER = 'top';
  const PLACEMENT_BOTTOMCENTER = 'bottom';
  const Default$9 = {
    autoClose: true,
    boundary: 'clippingParents',
    display: 'dynamic',
    offset: [0, 2],
    popperConfig: null,
    reference: 'toggle'
  };
  const DefaultType$9 = {
    autoClose: '(boolean|string)',
    boundary: '(string|element)',
    display: 'string',
    offset: '(array|string|function)',
    popperConfig: '(null|object|function)',
    reference: '(string|element|object)'
  };

  /**
   * Class definition
   */

  class Dropdown extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._popper = null;
      this._parent = this._element.parentNode; // dropdown wrapper
      // TODO: v6 revert #37011 & change markup https://getbootstrap.com/docs/5.3/forms/input-group/
      this._menu = SelectorEngine.next(this._element, SELECTOR_MENU)[0] || SelectorEngine.prev(this._element, SELECTOR_MENU)[0] || SelectorEngine.findOne(SELECTOR_MENU, this._parent);
      this._inNavbar = this._detectNavbar();
    }

    // Getters
    static get Default() {
      return Default$9;
    }
    static get DefaultType() {
      return DefaultType$9;
    }
    static get NAME() {
      return NAME$a;
    }

    // Public
    toggle() {
      return this._isShown() ? this.hide() : this.show();
    }
    show() {
      if (isDisabled(this._element) || this._isShown()) {
        return;
      }
      const relatedTarget = {
        relatedTarget: this._element
      };
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$5, relatedTarget);
      if (showEvent.defaultPrevented) {
        return;
      }
      this._createPopper();

      // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
      if ('ontouchstart' in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.on(element, 'mouseover', noop);
        }
      }
      this._element.focus();
      this._element.setAttribute('aria-expanded', true);
      this._menu.classList.add(CLASS_NAME_SHOW$6);
      this._element.classList.add(CLASS_NAME_SHOW$6);
      EventHandler.trigger(this._element, EVENT_SHOWN$5, relatedTarget);
    }
    hide() {
      if (isDisabled(this._element) || !this._isShown()) {
        return;
      }
      const relatedTarget = {
        relatedTarget: this._element
      };
      this._completeHide(relatedTarget);
    }
    dispose() {
      if (this._popper) {
        this._popper.destroy();
      }
      super.dispose();
    }
    update() {
      this._inNavbar = this._detectNavbar();
      if (this._popper) {
        this._popper.update();
      }
    }

    // Private
    _completeHide(relatedTarget) {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$5, relatedTarget);
      if (hideEvent.defaultPrevented) {
        return;
      }

      // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support
      if ('ontouchstart' in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.off(element, 'mouseover', noop);
        }
      }
      if (this._popper) {
        this._popper.destroy();
      }
      this._menu.classList.remove(CLASS_NAME_SHOW$6);
      this._element.classList.remove(CLASS_NAME_SHOW$6);
      this._element.setAttribute('aria-expanded', 'false');
      Manipulator.removeDataAttribute(this._menu, 'popper');
      EventHandler.trigger(this._element, EVENT_HIDDEN$5, relatedTarget);
    }
    _getConfig(config) {
      config = super._getConfig(config);
      if (typeof config.reference === 'object' && !isElement(config.reference) && typeof config.reference.getBoundingClientRect !== 'function') {
        // Popper virtual elements require a getBoundingClientRect method
        throw new TypeError(`${NAME$a.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
      }
      return config;
    }
    _createPopper() {
      if (typeof Popper__namespace === 'undefined') {
        throw new TypeError('Bootstrap\'s dropdowns require Popper (https://popper.js.org)');
      }
      let referenceElement = this._element;
      if (this._config.reference === 'parent') {
        referenceElement = this._parent;
      } else if (isElement(this._config.reference)) {
        referenceElement = getElement(this._config.reference);
      } else if (typeof this._config.reference === 'object') {
        referenceElement = this._config.reference;
      }
      const popperConfig = this._getPopperConfig();
      this._popper = Popper__namespace.createPopper(referenceElement, this._menu, popperConfig);
    }
    _isShown() {
      return this._menu.classList.contains(CLASS_NAME_SHOW$6);
    }
    _getPlacement() {
      const parentDropdown = this._parent;
      if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
        return PLACEMENT_RIGHT;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
        return PLACEMENT_LEFT;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
        return PLACEMENT_TOPCENTER;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
        return PLACEMENT_BOTTOMCENTER;
      }

      // We need to trim the value because custom properties can also include spaces
      const isEnd = getComputedStyle(this._menu).getPropertyValue('--bs-position').trim() === 'end';
      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
        return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
      }
      return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
    }
    _detectNavbar() {
      return this._element.closest(SELECTOR_NAVBAR) !== null;
    }
    _getOffset() {
      const {
        offset
      } = this._config;
      if (typeof offset === 'string') {
        return offset.split(',').map(value => Number.parseInt(value, 10));
      }
      if (typeof offset === 'function') {
        return popperData => offset(popperData, this._element);
      }
      return offset;
    }
    _getPopperConfig() {
      const defaultBsPopperConfig = {
        placement: this._getPlacement(),
        modifiers: [{
          name: 'preventOverflow',
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: 'offset',
          options: {
            offset: this._getOffset()
          }
        }]
      };

      // Disable Popper if we have a static display or Dropdown is in Navbar
      if (this._inNavbar || this._config.display === 'static') {
        Manipulator.setDataAttribute(this._menu, 'popper', 'static'); // TODO: v6 remove
        defaultBsPopperConfig.modifiers = [{
          name: 'applyStyles',
          enabled: false
        }];
      }
      return {
        ...defaultBsPopperConfig,
        ...execute(this._config.popperConfig, [defaultBsPopperConfig])
      };
    }
    _selectMenuItem({
      key,
      target
    }) {
      const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter(element => isVisible(element));
      if (!items.length) {
        return;
      }

      // if target isn't included in items (e.g. when expanding the dropdown)
      // allow cycling to get the last item in case key equals ARROW_UP_KEY
      getNextActiveElement(items, target, key === ARROW_DOWN_KEY$1, !items.includes(target)).focus();
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Dropdown.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
    static clearMenus(event) {
      if (event.button === RIGHT_MOUSE_BUTTON || event.type === 'keyup' && event.key !== TAB_KEY$1) {
        return;
      }
      const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);
      for (const toggle of openToggles) {
        const context = Dropdown.getInstance(toggle);
        if (!context || context._config.autoClose === false) {
          continue;
        }
        const composedPath = event.composedPath();
        const isMenuTarget = composedPath.includes(context._menu);
        if (composedPath.includes(context._element) || context._config.autoClose === 'inside' && !isMenuTarget || context._config.autoClose === 'outside' && isMenuTarget) {
          continue;
        }

        // Tab navigation through the dropdown menu or events from contained inputs shouldn't close the menu
        if (context._menu.contains(event.target) && (event.type === 'keyup' && event.key === TAB_KEY$1 || /input|select|option|textarea|form/i.test(event.target.tagName))) {
          continue;
        }
        const relatedTarget = {
          relatedTarget: context._element
        };
        if (event.type === 'click') {
          relatedTarget.clickEvent = event;
        }
        context._completeHide(relatedTarget);
      }
    }
    static dataApiKeydownHandler(event) {
      // If not an UP | DOWN | ESCAPE key => not a dropdown command
      // If input/textarea && if key is other than ESCAPE => not a dropdown command

      const isInput = /input|textarea/i.test(event.target.tagName);
      const isEscapeEvent = event.key === ESCAPE_KEY$2;
      const isUpOrDownEvent = [ARROW_UP_KEY$1, ARROW_DOWN_KEY$1].includes(event.key);
      if (!isUpOrDownEvent && !isEscapeEvent) {
        return;
      }
      if (isInput && !isEscapeEvent) {
        return;
      }
      event.preventDefault();

      // TODO: v6 revert #37011 & change markup https://getbootstrap.com/docs/5.3/forms/input-group/
      const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE$3) ? this : SelectorEngine.prev(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.next(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.findOne(SELECTOR_DATA_TOGGLE$3, event.delegateTarget.parentNode);
      const instance = Dropdown.getOrCreateInstance(getToggleButton);
      if (isUpOrDownEvent) {
        event.stopPropagation();
        instance.show();
        instance._selectMenuItem(event);
        return;
      }
      if (instance._isShown()) {
        // else is escape and we check if it is shown
        event.stopPropagation();
        instance.hide();
        getToggleButton.focus();
      }
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$3, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_CLICK_DATA_API$3, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$3, function (event) {
    event.preventDefault();
    Dropdown.getOrCreateInstance(this).toggle();
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(Dropdown);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/backdrop.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$9 = 'backdrop';
  const CLASS_NAME_FADE$4 = 'fade';
  const CLASS_NAME_SHOW$5 = 'show';
  const EVENT_MOUSEDOWN = `mousedown.bs.${NAME$9}`;
  const Default$8 = {
    className: 'modal-backdrop',
    clickCallback: null,
    isAnimated: false,
    isVisible: true,
    // if false, we use the backdrop helper without adding any element to the dom
    rootElement: 'body' // give the choice to place backdrop under different elements
  };
  const DefaultType$8 = {
    className: 'string',
    clickCallback: '(function|null)',
    isAnimated: 'boolean',
    isVisible: 'boolean',
    rootElement: '(element|string)'
  };

  /**
   * Class definition
   */

  class Backdrop extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
      this._isAppended = false;
      this._element = null;
    }

    // Getters
    static get Default() {
      return Default$8;
    }
    static get DefaultType() {
      return DefaultType$8;
    }
    static get NAME() {
      return NAME$9;
    }

    // Public
    show(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }
      this._append();
      const element = this._getElement();
      if (this._config.isAnimated) {
        reflow(element);
      }
      element.classList.add(CLASS_NAME_SHOW$5);
      this._emulateAnimation(() => {
        execute(callback);
      });
    }
    hide(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }
      this._getElement().classList.remove(CLASS_NAME_SHOW$5);
      this._emulateAnimation(() => {
        this.dispose();
        execute(callback);
      });
    }
    dispose() {
      if (!this._isAppended) {
        return;
      }
      EventHandler.off(this._element, EVENT_MOUSEDOWN);
      this._element.remove();
      this._isAppended = false;
    }

    // Private
    _getElement() {
      if (!this._element) {
        const backdrop = document.createElement('div');
        backdrop.className = this._config.className;
        if (this._config.isAnimated) {
          backdrop.classList.add(CLASS_NAME_FADE$4);
        }
        this._element = backdrop;
      }
      return this._element;
    }
    _configAfterMerge(config) {
      // use getElement() with the default "body" to get a fresh Element on each instantiation
      config.rootElement = getElement(config.rootElement);
      return config;
    }
    _append() {
      if (this._isAppended) {
        return;
      }
      const element = this._getElement();
      this._config.rootElement.append(element);
      EventHandler.on(element, EVENT_MOUSEDOWN, () => {
        execute(this._config.clickCallback);
      });
      this._isAppended = true;
    }
    _emulateAnimation(callback) {
      executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/focustrap.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$8 = 'focustrap';
  const DATA_KEY$5 = 'bs.focustrap';
  const EVENT_KEY$5 = `.${DATA_KEY$5}`;
  const EVENT_FOCUSIN$2 = `focusin${EVENT_KEY$5}`;
  const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$5}`;
  const TAB_KEY = 'Tab';
  const TAB_NAV_FORWARD = 'forward';
  const TAB_NAV_BACKWARD = 'backward';
  const Default$7 = {
    autofocus: true,
    trapElement: null // The element to trap focus inside of
  };
  const DefaultType$7 = {
    autofocus: 'boolean',
    trapElement: 'element'
  };

  /**
   * Class definition
   */

  class FocusTrap extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
      this._isActive = false;
      this._lastTabNavDirection = null;
    }

    // Getters
    static get Default() {
      return Default$7;
    }
    static get DefaultType() {
      return DefaultType$7;
    }
    static get NAME() {
      return NAME$8;
    }

    // Public
    activate() {
      if (this._isActive) {
        return;
      }
      if (this._config.autofocus) {
        this._config.trapElement.focus();
      }
      EventHandler.off(document, EVENT_KEY$5); // guard against infinite focus loop
      EventHandler.on(document, EVENT_FOCUSIN$2, event => this._handleFocusin(event));
      EventHandler.on(document, EVENT_KEYDOWN_TAB, event => this._handleKeydown(event));
      this._isActive = true;
    }
    deactivate() {
      if (!this._isActive) {
        return;
      }
      this._isActive = false;
      EventHandler.off(document, EVENT_KEY$5);
    }

    // Private
    _handleFocusin(event) {
      const {
        trapElement
      } = this._config;
      if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
        return;
      }
      const elements = SelectorEngine.focusableChildren(trapElement);
      if (elements.length === 0) {
        trapElement.focus();
      } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
        elements[elements.length - 1].focus();
      } else {
        elements[0].focus();
      }
    }
    _handleKeydown(event) {
      if (event.key !== TAB_KEY) {
        return;
      }
      this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/scrollBar.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const SELECTOR_FIXED_CONTENT = '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top';
  const SELECTOR_STICKY_CONTENT = '.sticky-top';
  const PROPERTY_PADDING = 'padding-right';
  const PROPERTY_MARGIN = 'margin-right';

  /**
   * Class definition
   */

  class ScrollBarHelper {
    constructor() {
      this._element = document.body;
    }

    // Public
    getWidth() {
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
      const documentWidth = document.documentElement.clientWidth;
      return Math.abs(window.innerWidth - documentWidth);
    }
    hide() {
      const width = this.getWidth();
      this._disableOverFlow();
      // give padding to element to balance the hidden scrollbar width
      this._setElementAttributes(this._element, PROPERTY_PADDING, calculatedValue => calculatedValue + width);
      // trick: We adjust positive paddingRight and negative marginRight to sticky-top elements to keep showing fullwidth
      this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, calculatedValue => calculatedValue + width);
      this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, calculatedValue => calculatedValue - width);
    }
    reset() {
      this._resetElementAttributes(this._element, 'overflow');
      this._resetElementAttributes(this._element, PROPERTY_PADDING);
      this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
      this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
    }
    isOverflowing() {
      return this.getWidth() > 0;
    }

    // Private
    _disableOverFlow() {
      this._saveInitialAttribute(this._element, 'overflow');
      this._element.style.overflow = 'hidden';
    }
    _setElementAttributes(selector, styleProperty, callback) {
      const scrollbarWidth = this.getWidth();
      const manipulationCallBack = element => {
        if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
          return;
        }
        this._saveInitialAttribute(element, styleProperty);
        const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
        element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
      };
      this._applyManipulationCallback(selector, manipulationCallBack);
    }
    _saveInitialAttribute(element, styleProperty) {
      const actualValue = element.style.getPropertyValue(styleProperty);
      if (actualValue) {
        Manipulator.setDataAttribute(element, styleProperty, actualValue);
      }
    }
    _resetElementAttributes(selector, styleProperty) {
      const manipulationCallBack = element => {
        const value = Manipulator.getDataAttribute(element, styleProperty);
        // We only want to remove the property if the value is `null`; the value can also be zero
        if (value === null) {
          element.style.removeProperty(styleProperty);
          return;
        }
        Manipulator.removeDataAttribute(element, styleProperty);
        element.style.setProperty(styleProperty, value);
      };
      this._applyManipulationCallback(selector, manipulationCallBack);
    }
    _applyManipulationCallback(selector, callBack) {
      if (isElement(selector)) {
        callBack(selector);
        return;
      }
      for (const sel of SelectorEngine.find(selector, this._element)) {
        callBack(sel);
      }
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap modal.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$7 = 'modal';
  const DATA_KEY$4 = 'bs.modal';
  const EVENT_KEY$4 = `.${DATA_KEY$4}`;
  const DATA_API_KEY$2 = '.data-api';
  const ESCAPE_KEY$1 = 'Escape';
  const EVENT_HIDE$4 = `hide${EVENT_KEY$4}`;
  const EVENT_HIDE_PREVENTED$1 = `hidePrevented${EVENT_KEY$4}`;
  const EVENT_HIDDEN$4 = `hidden${EVENT_KEY$4}`;
  const EVENT_SHOW$4 = `show${EVENT_KEY$4}`;
  const EVENT_SHOWN$4 = `shown${EVENT_KEY$4}`;
  const EVENT_RESIZE$1 = `resize${EVENT_KEY$4}`;
  const EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY$4}`;
  const EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY$4}`;
  const EVENT_KEYDOWN_DISMISS$1 = `keydown.dismiss${EVENT_KEY$4}`;
  const EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$4}${DATA_API_KEY$2}`;
  const CLASS_NAME_OPEN = 'modal-open';
  const CLASS_NAME_FADE$3 = 'fade';
  const CLASS_NAME_SHOW$4 = 'show';
  const CLASS_NAME_STATIC = 'modal-static';
  const OPEN_SELECTOR$1 = '.modal.show';
  const SELECTOR_DIALOG = '.modal-dialog';
  const SELECTOR_MODAL_BODY = '.modal-body';
  const SELECTOR_DATA_TOGGLE$2 = '[data-bs-toggle="modal"]';
  const Default$6 = {
    backdrop: true,
    focus: true,
    keyboard: true
  };
  const DefaultType$6 = {
    backdrop: '(boolean|string)',
    focus: 'boolean',
    keyboard: 'boolean'
  };

  /**
   * Class definition
   */

  class Modal extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._isShown = false;
      this._isTransitioning = false;
      this._scrollBar = new ScrollBarHelper();
      this._addEventListeners();
    }

    // Getters
    static get Default() {
      return Default$6;
    }
    static get DefaultType() {
      return DefaultType$6;
    }
    static get NAME() {
      return NAME$7;
    }

    // Public
    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }
    show(relatedTarget) {
      if (this._isShown || this._isTransitioning) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$4, {
        relatedTarget
      });
      if (showEvent.defaultPrevented) {
        return;
      }
      this._isShown = true;
      this._isTransitioning = true;
      this._scrollBar.hide();
      document.body.classList.add(CLASS_NAME_OPEN);
      this._adjustDialog();
      this._backdrop.show(() => this._showElement(relatedTarget));
    }
    hide() {
      if (!this._isShown || this._isTransitioning) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$4);
      if (hideEvent.defaultPrevented) {
        return;
      }
      this._isShown = false;
      this._isTransitioning = true;
      this._focustrap.deactivate();
      this._element.classList.remove(CLASS_NAME_SHOW$4);
      this._queueCallback(() => this._hideModal(), this._element, this._isAnimated());
    }
    dispose() {
      EventHandler.off(window, EVENT_KEY$4);
      EventHandler.off(this._dialog, EVENT_KEY$4);
      this._backdrop.dispose();
      this._focustrap.deactivate();
      super.dispose();
    }
    handleUpdate() {
      this._adjustDialog();
    }

    // Private
    _initializeBackDrop() {
      return new Backdrop({
        isVisible: Boolean(this._config.backdrop),
        // 'static' option will be translated to true, and booleans will keep their value,
        isAnimated: this._isAnimated()
      });
    }
    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }
    _showElement(relatedTarget) {
      // try to append dynamic modal
      if (!document.body.contains(this._element)) {
        document.body.append(this._element);
      }
      this._element.style.display = 'block';
      this._element.removeAttribute('aria-hidden');
      this._element.setAttribute('aria-modal', true);
      this._element.setAttribute('role', 'dialog');
      this._element.scrollTop = 0;
      const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog);
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_SHOW$4);
      const transitionComplete = () => {
        if (this._config.focus) {
          this._focustrap.activate();
        }
        this._isTransitioning = false;
        EventHandler.trigger(this._element, EVENT_SHOWN$4, {
          relatedTarget
        });
      };
      this._queueCallback(transitionComplete, this._dialog, this._isAnimated());
    }
    _addEventListeners() {
      EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS$1, event => {
        if (event.key !== ESCAPE_KEY$1) {
          return;
        }
        if (this._config.keyboard) {
          this.hide();
          return;
        }
        this._triggerBackdropTransition();
      });
      EventHandler.on(window, EVENT_RESIZE$1, () => {
        if (this._isShown && !this._isTransitioning) {
          this._adjustDialog();
        }
      });
      EventHandler.on(this._element, EVENT_MOUSEDOWN_DISMISS, event => {
        // a bad trick to segregate clicks that may start inside dialog but end outside, and avoid listen to scrollbar clicks
        EventHandler.one(this._element, EVENT_CLICK_DISMISS, event2 => {
          if (this._element !== event.target || this._element !== event2.target) {
            return;
          }
          if (this._config.backdrop === 'static') {
            this._triggerBackdropTransition();
            return;
          }
          if (this._config.backdrop) {
            this.hide();
          }
        });
      });
    }
    _hideModal() {
      this._element.style.display = 'none';
      this._element.setAttribute('aria-hidden', true);
      this._element.removeAttribute('aria-modal');
      this._element.removeAttribute('role');
      this._isTransitioning = false;
      this._backdrop.hide(() => {
        document.body.classList.remove(CLASS_NAME_OPEN);
        this._resetAdjustments();
        this._scrollBar.reset();
        EventHandler.trigger(this._element, EVENT_HIDDEN$4);
      });
    }
    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_FADE$3);
    }
    _triggerBackdropTransition() {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED$1);
      if (hideEvent.defaultPrevented) {
        return;
      }
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
      const initialOverflowY = this._element.style.overflowY;
      // return if the following background transition hasn't yet completed
      if (initialOverflowY === 'hidden' || this._element.classList.contains(CLASS_NAME_STATIC)) {
        return;
      }
      if (!isModalOverflowing) {
        this._element.style.overflowY = 'hidden';
      }
      this._element.classList.add(CLASS_NAME_STATIC);
      this._queueCallback(() => {
        this._element.classList.remove(CLASS_NAME_STATIC);
        this._queueCallback(() => {
          this._element.style.overflowY = initialOverflowY;
        }, this._dialog);
      }, this._dialog);
      this._element.focus();
    }

    /**
     * The following methods are used to handle overflowing modals
     */

    _adjustDialog() {
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
      const scrollbarWidth = this._scrollBar.getWidth();
      const isBodyOverflowing = scrollbarWidth > 0;
      if (isBodyOverflowing && !isModalOverflowing) {
        const property = isRTL() ? 'paddingLeft' : 'paddingRight';
        this._element.style[property] = `${scrollbarWidth}px`;
      }
      if (!isBodyOverflowing && isModalOverflowing) {
        const property = isRTL() ? 'paddingRight' : 'paddingLeft';
        this._element.style[property] = `${scrollbarWidth}px`;
      }
    }
    _resetAdjustments() {
      this._element.style.paddingLeft = '';
      this._element.style.paddingRight = '';
    }

    // Static
    static jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        const data = Modal.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](relatedTarget);
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$2, function (event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }
    EventHandler.one(target, EVENT_SHOW$4, showEvent => {
      if (showEvent.defaultPrevented) {
        // only register focus restorer if modal will actually get shown
        return;
      }
      EventHandler.one(target, EVENT_HIDDEN$4, () => {
        if (isVisible(this)) {
          this.focus();
        }
      });
    });

    // avoid conflict when clicking modal toggler while another one is open
    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);
    if (alreadyOpen) {
      Modal.getInstance(alreadyOpen).hide();
    }
    const data = Modal.getOrCreateInstance(target);
    data.toggle(this);
  });
  enableDismissTrigger(Modal);

  /**
   * jQuery
   */

  defineJQueryPlugin(Modal);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap offcanvas.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$6 = 'offcanvas';
  const DATA_KEY$3 = 'bs.offcanvas';
  const EVENT_KEY$3 = `.${DATA_KEY$3}`;
  const DATA_API_KEY$1 = '.data-api';
  const EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$3}${DATA_API_KEY$1}`;
  const ESCAPE_KEY = 'Escape';
  const CLASS_NAME_SHOW$3 = 'show';
  const CLASS_NAME_SHOWING$1 = 'showing';
  const CLASS_NAME_HIDING = 'hiding';
  const CLASS_NAME_BACKDROP = 'offcanvas-backdrop';
  const OPEN_SELECTOR = '.offcanvas.show';
  const EVENT_SHOW$3 = `show${EVENT_KEY$3}`;
  const EVENT_SHOWN$3 = `shown${EVENT_KEY$3}`;
  const EVENT_HIDE$3 = `hide${EVENT_KEY$3}`;
  const EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY$3}`;
  const EVENT_HIDDEN$3 = `hidden${EVENT_KEY$3}`;
  const EVENT_RESIZE = `resize${EVENT_KEY$3}`;
  const EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$3}${DATA_API_KEY$1}`;
  const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY$3}`;
  const SELECTOR_DATA_TOGGLE$1 = '[data-bs-toggle="offcanvas"]';
  const Default$5 = {
    backdrop: true,
    keyboard: true,
    scroll: false
  };
  const DefaultType$5 = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    scroll: 'boolean'
  };

  /**
   * Class definition
   */

  class Offcanvas extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._isShown = false;
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._addEventListeners();
    }

    // Getters
    static get Default() {
      return Default$5;
    }
    static get DefaultType() {
      return DefaultType$5;
    }
    static get NAME() {
      return NAME$6;
    }

    // Public
    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }
    show(relatedTarget) {
      if (this._isShown) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$3, {
        relatedTarget
      });
      if (showEvent.defaultPrevented) {
        return;
      }
      this._isShown = true;
      this._backdrop.show();
      if (!this._config.scroll) {
        new ScrollBarHelper().hide();
      }
      this._element.setAttribute('aria-modal', true);
      this._element.setAttribute('role', 'dialog');
      this._element.classList.add(CLASS_NAME_SHOWING$1);
      const completeCallBack = () => {
        if (!this._config.scroll || this._config.backdrop) {
          this._focustrap.activate();
        }
        this._element.classList.add(CLASS_NAME_SHOW$3);
        this._element.classList.remove(CLASS_NAME_SHOWING$1);
        EventHandler.trigger(this._element, EVENT_SHOWN$3, {
          relatedTarget
        });
      };
      this._queueCallback(completeCallBack, this._element, true);
    }
    hide() {
      if (!this._isShown) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$3);
      if (hideEvent.defaultPrevented) {
        return;
      }
      this._focustrap.deactivate();
      this._element.blur();
      this._isShown = false;
      this._element.classList.add(CLASS_NAME_HIDING);
      this._backdrop.hide();
      const completeCallback = () => {
        this._element.classList.remove(CLASS_NAME_SHOW$3, CLASS_NAME_HIDING);
        this._element.removeAttribute('aria-modal');
        this._element.removeAttribute('role');
        if (!this._config.scroll) {
          new ScrollBarHelper().reset();
        }
        EventHandler.trigger(this._element, EVENT_HIDDEN$3);
      };
      this._queueCallback(completeCallback, this._element, true);
    }
    dispose() {
      this._backdrop.dispose();
      this._focustrap.deactivate();
      super.dispose();
    }

    // Private
    _initializeBackDrop() {
      const clickCallback = () => {
        if (this._config.backdrop === 'static') {
          EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
          return;
        }
        this.hide();
      };

      // 'static' option will be translated to true, and booleans will keep their value
      const isVisible = Boolean(this._config.backdrop);
      return new Backdrop({
        className: CLASS_NAME_BACKDROP,
        isVisible,
        isAnimated: true,
        rootElement: this._element.parentNode,
        clickCallback: isVisible ? clickCallback : null
      });
    }
    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }
    _addEventListeners() {
      EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, event => {
        if (event.key !== ESCAPE_KEY) {
          return;
        }
        if (this._config.keyboard) {
          this.hide();
          return;
        }
        EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
      });
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Offcanvas.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](this);
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$1, function (event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }
    if (isDisabled(this)) {
      return;
    }
    EventHandler.one(target, EVENT_HIDDEN$3, () => {
      // focus on trigger when it is closed
      if (isVisible(this)) {
        this.focus();
      }
    });

    // avoid conflict when clicking a toggler of an offcanvas, while another is open
    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);
    if (alreadyOpen && alreadyOpen !== target) {
      Offcanvas.getInstance(alreadyOpen).hide();
    }
    const data = Offcanvas.getOrCreateInstance(target);
    data.toggle(this);
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
    for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
      Offcanvas.getOrCreateInstance(selector).show();
    }
  });
  EventHandler.on(window, EVENT_RESIZE, () => {
    for (const element of SelectorEngine.find('[aria-modal][class*=show][class*=offcanvas-]')) {
      if (getComputedStyle(element).position !== 'fixed') {
        Offcanvas.getOrCreateInstance(element).hide();
      }
    }
  });
  enableDismissTrigger(Offcanvas);

  /**
   * jQuery
   */

  defineJQueryPlugin(Offcanvas);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/sanitizer.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  // js-docs-start allow-list
  const ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  const DefaultAllowlist = {
    // Global attributes allowed on any supplied element below.
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    dd: [],
    div: [],
    dl: [],
    dt: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  };
  // js-docs-end allow-list

  const uriAttributes = new Set(['background', 'cite', 'href', 'itemtype', 'longdesc', 'poster', 'src', 'xlink:href']);

  /**
   * A pattern that recognizes URLs that are safe wrt. XSS in URL navigation
   * contexts.
   *
   * Shout-out to Angular https://github.com/angular/angular/blob/15.2.8/packages/core/src/sanitization/url_sanitizer.ts#L38
   */
  // eslint-disable-next-line unicorn/better-regex
  const SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
  const allowedAttribute = (attribute, allowedAttributeList) => {
    const attributeName = attribute.nodeName.toLowerCase();
    if (allowedAttributeList.includes(attributeName)) {
      if (uriAttributes.has(attributeName)) {
        return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue));
      }
      return true;
    }

    // Check if a regular expression validates the attribute.
    return allowedAttributeList.filter(attributeRegex => attributeRegex instanceof RegExp).some(regex => regex.test(attributeName));
  };
  function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
    if (!unsafeHtml.length) {
      return unsafeHtml;
    }
    if (sanitizeFunction && typeof sanitizeFunction === 'function') {
      return sanitizeFunction(unsafeHtml);
    }
    const domParser = new window.DOMParser();
    const createdDocument = domParser.parseFromString(unsafeHtml, 'text/html');
    const elements = [].concat(...createdDocument.body.querySelectorAll('*'));
    for (const element of elements) {
      const elementName = element.nodeName.toLowerCase();
      if (!Object.keys(allowList).includes(elementName)) {
        element.remove();
        continue;
      }
      const attributeList = [].concat(...element.attributes);
      const allowedAttributes = [].concat(allowList['*'] || [], allowList[elementName] || []);
      for (const attribute of attributeList) {
        if (!allowedAttribute(attribute, allowedAttributes)) {
          element.removeAttribute(attribute.nodeName);
        }
      }
    }
    return createdDocument.body.innerHTML;
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/template-factory.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$5 = 'TemplateFactory';
  const Default$4 = {
    allowList: DefaultAllowlist,
    content: {},
    // { selector : text ,  selector2 : text2 , }
    extraClass: '',
    html: false,
    sanitize: true,
    sanitizeFn: null,
    template: '<div></div>'
  };
  const DefaultType$4 = {
    allowList: 'object',
    content: 'object',
    extraClass: '(string|function)',
    html: 'boolean',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    template: 'string'
  };
  const DefaultContentType = {
    entry: '(string|element|function|null)',
    selector: '(string|element)'
  };

  /**
   * Class definition
   */

  class TemplateFactory extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
    }

    // Getters
    static get Default() {
      return Default$4;
    }
    static get DefaultType() {
      return DefaultType$4;
    }
    static get NAME() {
      return NAME$5;
    }

    // Public
    getContent() {
      return Object.values(this._config.content).map(config => this._resolvePossibleFunction(config)).filter(Boolean);
    }
    hasContent() {
      return this.getContent().length > 0;
    }
    changeContent(content) {
      this._checkContent(content);
      this._config.content = {
        ...this._config.content,
        ...content
      };
      return this;
    }
    toHtml() {
      const templateWrapper = document.createElement('div');
      templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
      for (const [selector, text] of Object.entries(this._config.content)) {
        this._setContent(templateWrapper, text, selector);
      }
      const template = templateWrapper.children[0];
      const extraClass = this._resolvePossibleFunction(this._config.extraClass);
      if (extraClass) {
        template.classList.add(...extraClass.split(' '));
      }
      return template;
    }

    // Private
    _typeCheckConfig(config) {
      super._typeCheckConfig(config);
      this._checkContent(config.content);
    }
    _checkContent(arg) {
      for (const [selector, content] of Object.entries(arg)) {
        super._typeCheckConfig({
          selector,
          entry: content
        }, DefaultContentType);
      }
    }
    _setContent(template, content, selector) {
      const templateElement = SelectorEngine.findOne(selector, template);
      if (!templateElement) {
        return;
      }
      content = this._resolvePossibleFunction(content);
      if (!content) {
        templateElement.remove();
        return;
      }
      if (isElement(content)) {
        this._putElementInTemplate(getElement(content), templateElement);
        return;
      }
      if (this._config.html) {
        templateElement.innerHTML = this._maybeSanitize(content);
        return;
      }
      templateElement.textContent = content;
    }
    _maybeSanitize(arg) {
      return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
    }
    _resolvePossibleFunction(arg) {
      return execute(arg, [this]);
    }
    _putElementInTemplate(element, templateElement) {
      if (this._config.html) {
        templateElement.innerHTML = '';
        templateElement.append(element);
        return;
      }
      templateElement.textContent = element.textContent;
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap tooltip.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$4 = 'tooltip';
  const DISALLOWED_ATTRIBUTES = new Set(['sanitize', 'allowList', 'sanitizeFn']);
  const CLASS_NAME_FADE$2 = 'fade';
  const CLASS_NAME_MODAL = 'modal';
  const CLASS_NAME_SHOW$2 = 'show';
  const SELECTOR_TOOLTIP_INNER = '.tooltip-inner';
  const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
  const EVENT_MODAL_HIDE = 'hide.bs.modal';
  const TRIGGER_HOVER = 'hover';
  const TRIGGER_FOCUS = 'focus';
  const TRIGGER_CLICK = 'click';
  const TRIGGER_MANUAL = 'manual';
  const EVENT_HIDE$2 = 'hide';
  const EVENT_HIDDEN$2 = 'hidden';
  const EVENT_SHOW$2 = 'show';
  const EVENT_SHOWN$2 = 'shown';
  const EVENT_INSERTED = 'inserted';
  const EVENT_CLICK$1 = 'click';
  const EVENT_FOCUSIN$1 = 'focusin';
  const EVENT_FOCUSOUT$1 = 'focusout';
  const EVENT_MOUSEENTER = 'mouseenter';
  const EVENT_MOUSELEAVE = 'mouseleave';
  const AttachmentMap = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: isRTL() ? 'left' : 'right',
    BOTTOM: 'bottom',
    LEFT: isRTL() ? 'right' : 'left'
  };
  const Default$3 = {
    allowList: DefaultAllowlist,
    animation: true,
    boundary: 'clippingParents',
    container: false,
    customClass: '',
    delay: 0,
    fallbackPlacements: ['top', 'right', 'bottom', 'left'],
    html: false,
    offset: [0, 6],
    placement: 'top',
    popperConfig: null,
    sanitize: true,
    sanitizeFn: null,
    selector: false,
    template: '<div class="tooltip" role="tooltip">' + '<div class="tooltip-arrow"></div>' + '<div class="tooltip-inner"></div>' + '</div>',
    title: '',
    trigger: 'hover focus'
  };
  const DefaultType$3 = {
    allowList: 'object',
    animation: 'boolean',
    boundary: '(string|element)',
    container: '(string|element|boolean)',
    customClass: '(string|function)',
    delay: '(number|object)',
    fallbackPlacements: 'array',
    html: 'boolean',
    offset: '(array|string|function)',
    placement: '(string|function)',
    popperConfig: '(null|object|function)',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    selector: '(string|boolean)',
    template: 'string',
    title: '(string|element|function)',
    trigger: 'string'
  };

  /**
   * Class definition
   */

  class Tooltip extends BaseComponent {
    constructor(element, config) {
      if (typeof Popper__namespace === 'undefined') {
        throw new TypeError('Bootstrap\'s tooltips require Popper (https://popper.js.org)');
      }
      super(element, config);

      // Private
      this._isEnabled = true;
      this._timeout = 0;
      this._isHovered = null;
      this._activeTrigger = {};
      this._popper = null;
      this._templateFactory = null;
      this._newContent = null;

      // Protected
      this.tip = null;
      this._setListeners();
      if (!this._config.selector) {
        this._fixTitle();
      }
    }

    // Getters
    static get Default() {
      return Default$3;
    }
    static get DefaultType() {
      return DefaultType$3;
    }
    static get NAME() {
      return NAME$4;
    }

    // Public
    enable() {
      this._isEnabled = true;
    }
    disable() {
      this._isEnabled = false;
    }
    toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    }
    toggle() {
      if (!this._isEnabled) {
        return;
      }
      this._activeTrigger.click = !this._activeTrigger.click;
      if (this._isShown()) {
        this._leave();
        return;
      }
      this._enter();
    }
    dispose() {
      clearTimeout(this._timeout);
      EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
      if (this._element.getAttribute('data-bs-original-title')) {
        this._element.setAttribute('title', this._element.getAttribute('data-bs-original-title'));
      }
      this._disposePopper();
      super.dispose();
    }
    show() {
      if (this._element.style.display === 'none') {
        throw new Error('Please use show on visible elements');
      }
      if (!(this._isWithContent() && this._isEnabled)) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOW$2));
      const shadowRoot = findShadowRoot(this._element);
      const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element);
      if (showEvent.defaultPrevented || !isInTheDom) {
        return;
      }

      // TODO: v6 remove this or make it optional
      this._disposePopper();
      const tip = this._getTipElement();
      this._element.setAttribute('aria-describedby', tip.getAttribute('id'));
      const {
        container
      } = this._config;
      if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
        container.append(tip);
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
      }
      this._popper = this._createPopper(tip);
      tip.classList.add(CLASS_NAME_SHOW$2);

      // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
      if ('ontouchstart' in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.on(element, 'mouseover', noop);
        }
      }
      const complete = () => {
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOWN$2));
        if (this._isHovered === false) {
          this._leave();
        }
        this._isHovered = false;
      };
      this._queueCallback(complete, this.tip, this._isAnimated());
    }
    hide() {
      if (!this._isShown()) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDE$2));
      if (hideEvent.defaultPrevented) {
        return;
      }
      const tip = this._getTipElement();
      tip.classList.remove(CLASS_NAME_SHOW$2);

      // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support
      if ('ontouchstart' in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.off(element, 'mouseover', noop);
        }
      }
      this._activeTrigger[TRIGGER_CLICK] = false;
      this._activeTrigger[TRIGGER_FOCUS] = false;
      this._activeTrigger[TRIGGER_HOVER] = false;
      this._isHovered = null; // it is a trick to support manual triggering

      const complete = () => {
        if (this._isWithActiveTrigger()) {
          return;
        }
        if (!this._isHovered) {
          this._disposePopper();
        }
        this._element.removeAttribute('aria-describedby');
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN$2));
      };
      this._queueCallback(complete, this.tip, this._isAnimated());
    }
    update() {
      if (this._popper) {
        this._popper.update();
      }
    }

    // Protected
    _isWithContent() {
      return Boolean(this._getTitle());
    }
    _getTipElement() {
      if (!this.tip) {
        this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
      }
      return this.tip;
    }
    _createTipElement(content) {
      const tip = this._getTemplateFactory(content).toHtml();

      // TODO: remove this check in v6
      if (!tip) {
        return null;
      }
      tip.classList.remove(CLASS_NAME_FADE$2, CLASS_NAME_SHOW$2);
      // TODO: v6 the following can be achieved with CSS only
      tip.classList.add(`bs-${this.constructor.NAME}-auto`);
      const tipId = getUID(this.constructor.NAME).toString();
      tip.setAttribute('id', tipId);
      if (this._isAnimated()) {
        tip.classList.add(CLASS_NAME_FADE$2);
      }
      return tip;
    }
    setContent(content) {
      this._newContent = content;
      if (this._isShown()) {
        this._disposePopper();
        this.show();
      }
    }
    _getTemplateFactory(content) {
      if (this._templateFactory) {
        this._templateFactory.changeContent(content);
      } else {
        this._templateFactory = new TemplateFactory({
          ...this._config,
          // the `content` var has to be after `this._config`
          // to override config.content in case of popover
          content,
          extraClass: this._resolvePossibleFunction(this._config.customClass)
        });
      }
      return this._templateFactory;
    }
    _getContentForTemplate() {
      return {
        [SELECTOR_TOOLTIP_INNER]: this._getTitle()
      };
    }
    _getTitle() {
      return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute('data-bs-original-title');
    }

    // Private
    _initializeOnDelegatedTarget(event) {
      return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
    }
    _isAnimated() {
      return this._config.animation || this.tip && this.tip.classList.contains(CLASS_NAME_FADE$2);
    }
    _isShown() {
      return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW$2);
    }
    _createPopper(tip) {
      const placement = execute(this._config.placement, [this, tip, this._element]);
      const attachment = AttachmentMap[placement.toUpperCase()];
      return Popper__namespace.createPopper(this._element, tip, this._getPopperConfig(attachment));
    }
    _getOffset() {
      const {
        offset
      } = this._config;
      if (typeof offset === 'string') {
        return offset.split(',').map(value => Number.parseInt(value, 10));
      }
      if (typeof offset === 'function') {
        return popperData => offset(popperData, this._element);
      }
      return offset;
    }
    _resolvePossibleFunction(arg) {
      return execute(arg, [this._element]);
    }
    _getPopperConfig(attachment) {
      const defaultBsPopperConfig = {
        placement: attachment,
        modifiers: [{
          name: 'flip',
          options: {
            fallbackPlacements: this._config.fallbackPlacements
          }
        }, {
          name: 'offset',
          options: {
            offset: this._getOffset()
          }
        }, {
          name: 'preventOverflow',
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: 'arrow',
          options: {
            element: `.${this.constructor.NAME}-arrow`
          }
        }, {
          name: 'preSetPlacement',
          enabled: true,
          phase: 'beforeMain',
          fn: data => {
            // Pre-set Popper's placement attribute in order to read the arrow sizes properly.
            // Otherwise, Popper mixes up the width and height dimensions since the initial arrow style is for top placement
            this._getTipElement().setAttribute('data-popper-placement', data.state.placement);
          }
        }]
      };
      return {
        ...defaultBsPopperConfig,
        ...execute(this._config.popperConfig, [defaultBsPopperConfig])
      };
    }
    _setListeners() {
      const triggers = this._config.trigger.split(' ');
      for (const trigger of triggers) {
        if (trigger === 'click') {
          EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$1), this._config.selector, event => {
            const context = this._initializeOnDelegatedTarget(event);
            context.toggle();
          });
        } else if (trigger !== TRIGGER_MANUAL) {
          const eventIn = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSEENTER) : this.constructor.eventName(EVENT_FOCUSIN$1);
          const eventOut = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSELEAVE) : this.constructor.eventName(EVENT_FOCUSOUT$1);
          EventHandler.on(this._element, eventIn, this._config.selector, event => {
            const context = this._initializeOnDelegatedTarget(event);
            context._activeTrigger[event.type === 'focusin' ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
            context._enter();
          });
          EventHandler.on(this._element, eventOut, this._config.selector, event => {
            const context = this._initializeOnDelegatedTarget(event);
            context._activeTrigger[event.type === 'focusout' ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);
            context._leave();
          });
        }
      }
      this._hideModalHandler = () => {
        if (this._element) {
          this.hide();
        }
      };
      EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
    }
    _fixTitle() {
      const title = this._element.getAttribute('title');
      if (!title) {
        return;
      }
      if (!this._element.getAttribute('aria-label') && !this._element.textContent.trim()) {
        this._element.setAttribute('aria-label', title);
      }
      this._element.setAttribute('data-bs-original-title', title); // DO NOT USE IT. Is only for backwards compatibility
      this._element.removeAttribute('title');
    }
    _enter() {
      if (this._isShown() || this._isHovered) {
        this._isHovered = true;
        return;
      }
      this._isHovered = true;
      this._setTimeout(() => {
        if (this._isHovered) {
          this.show();
        }
      }, this._config.delay.show);
    }
    _leave() {
      if (this._isWithActiveTrigger()) {
        return;
      }
      this._isHovered = false;
      this._setTimeout(() => {
        if (!this._isHovered) {
          this.hide();
        }
      }, this._config.delay.hide);
    }
    _setTimeout(handler, timeout) {
      clearTimeout(this._timeout);
      this._timeout = setTimeout(handler, timeout);
    }
    _isWithActiveTrigger() {
      return Object.values(this._activeTrigger).includes(true);
    }
    _getConfig(config) {
      const dataAttributes = Manipulator.getDataAttributes(this._element);
      for (const dataAttribute of Object.keys(dataAttributes)) {
        if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
          delete dataAttributes[dataAttribute];
        }
      }
      config = {
        ...dataAttributes,
        ...(typeof config === 'object' && config ? config : {})
      };
      config = this._mergeConfigObj(config);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }
    _configAfterMerge(config) {
      config.container = config.container === false ? document.body : getElement(config.container);
      if (typeof config.delay === 'number') {
        config.delay = {
          show: config.delay,
          hide: config.delay
        };
      }
      if (typeof config.title === 'number') {
        config.title = config.title.toString();
      }
      if (typeof config.content === 'number') {
        config.content = config.content.toString();
      }
      return config;
    }
    _getDelegateConfig() {
      const config = {};
      for (const [key, value] of Object.entries(this._config)) {
        if (this.constructor.Default[key] !== value) {
          config[key] = value;
        }
      }
      config.selector = false;
      config.trigger = 'manual';

      // In the future can be replaced with:
      // const keysWithDifferentValues = Object.entries(this._config).filter(entry => this.constructor.Default[entry[0]] !== this._config[entry[0]])
      // `Object.fromEntries(keysWithDifferentValues)`
      return config;
    }
    _disposePopper() {
      if (this._popper) {
        this._popper.destroy();
        this._popper = null;
      }
      if (this.tip) {
        this.tip.remove();
        this.tip = null;
      }
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Tooltip.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  }

  /**
   * jQuery
   */

  defineJQueryPlugin(Tooltip);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap popover.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$3 = 'popover';
  const SELECTOR_TITLE = '.popover-header';
  const SELECTOR_CONTENT = '.popover-body';
  const Default$2 = {
    ...Tooltip.Default,
    content: '',
    offset: [0, 8],
    placement: 'right',
    template: '<div class="popover" role="tooltip">' + '<div class="popover-arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div>' + '</div>',
    trigger: 'click'
  };
  const DefaultType$2 = {
    ...Tooltip.DefaultType,
    content: '(null|string|element|function)'
  };

  /**
   * Class definition
   */

  class Popover extends Tooltip {
    // Getters
    static get Default() {
      return Default$2;
    }
    static get DefaultType() {
      return DefaultType$2;
    }
    static get NAME() {
      return NAME$3;
    }

    // Overrides
    _isWithContent() {
      return this._getTitle() || this._getContent();
    }

    // Private
    _getContentForTemplate() {
      return {
        [SELECTOR_TITLE]: this._getTitle(),
        [SELECTOR_CONTENT]: this._getContent()
      };
    }
    _getContent() {
      return this._resolvePossibleFunction(this._config.content);
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Popover.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  }

  /**
   * jQuery
   */

  defineJQueryPlugin(Popover);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap scrollspy.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$2 = 'scrollspy';
  const DATA_KEY$2 = 'bs.scrollspy';
  const EVENT_KEY$2 = `.${DATA_KEY$2}`;
  const DATA_API_KEY = '.data-api';
  const EVENT_ACTIVATE = `activate${EVENT_KEY$2}`;
  const EVENT_CLICK = `click${EVENT_KEY$2}`;
  const EVENT_LOAD_DATA_API$1 = `load${EVENT_KEY$2}${DATA_API_KEY}`;
  const CLASS_NAME_DROPDOWN_ITEM = 'dropdown-item';
  const CLASS_NAME_ACTIVE$1 = 'active';
  const SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
  const SELECTOR_TARGET_LINKS = '[href]';
  const SELECTOR_NAV_LIST_GROUP = '.nav, .list-group';
  const SELECTOR_NAV_LINKS = '.nav-link';
  const SELECTOR_NAV_ITEMS = '.nav-item';
  const SELECTOR_LIST_ITEMS = '.list-group-item';
  const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_NAV_ITEMS} > ${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`;
  const SELECTOR_DROPDOWN = '.dropdown';
  const SELECTOR_DROPDOWN_TOGGLE$1 = '.dropdown-toggle';
  const Default$1 = {
    offset: null,
    // TODO: v6 @deprecated, keep it for backwards compatibility reasons
    rootMargin: '0px 0px -25%',
    smoothScroll: false,
    target: null,
    threshold: [0.1, 0.5, 1]
  };
  const DefaultType$1 = {
    offset: '(number|null)',
    // TODO v6 @deprecated, keep it for backwards compatibility reasons
    rootMargin: 'string',
    smoothScroll: 'boolean',
    target: 'element',
    threshold: 'array'
  };

  /**
   * Class definition
   */

  class ScrollSpy extends BaseComponent {
    constructor(element, config) {
      super(element, config);

      // this._element is the observablesContainer and config.target the menu links wrapper
      this._targetLinks = new Map();
      this._observableSections = new Map();
      this._rootElement = getComputedStyle(this._element).overflowY === 'visible' ? null : this._element;
      this._activeTarget = null;
      this._observer = null;
      this._previousScrollData = {
        visibleEntryTop: 0,
        parentScrollTop: 0
      };
      this.refresh(); // initialize
    }

    // Getters
    static get Default() {
      return Default$1;
    }
    static get DefaultType() {
      return DefaultType$1;
    }
    static get NAME() {
      return NAME$2;
    }

    // Public
    refresh() {
      this._initializeTargetsAndObservables();
      this._maybeEnableSmoothScroll();
      if (this._observer) {
        this._observer.disconnect();
      } else {
        this._observer = this._getNewObserver();
      }
      for (const section of this._observableSections.values()) {
        this._observer.observe(section);
      }
    }
    dispose() {
      this._observer.disconnect();
      super.dispose();
    }

    // Private
    _configAfterMerge(config) {
      // TODO: on v6 target should be given explicitly & remove the {target: 'ss-target'} case
      config.target = getElement(config.target) || document.body;

      // TODO: v6 Only for backwards compatibility reasons. Use rootMargin only
      config.rootMargin = config.offset ? `${config.offset}px 0px -30%` : config.rootMargin;
      if (typeof config.threshold === 'string') {
        config.threshold = config.threshold.split(',').map(value => Number.parseFloat(value));
      }
      return config;
    }
    _maybeEnableSmoothScroll() {
      if (!this._config.smoothScroll) {
        return;
      }

      // unregister any previous listeners
      EventHandler.off(this._config.target, EVENT_CLICK);
      EventHandler.on(this._config.target, EVENT_CLICK, SELECTOR_TARGET_LINKS, event => {
        const observableSection = this._observableSections.get(event.target.hash);
        if (observableSection) {
          event.preventDefault();
          const root = this._rootElement || window;
          const height = observableSection.offsetTop - this._element.offsetTop;
          if (root.scrollTo) {
            root.scrollTo({
              top: height,
              behavior: 'smooth'
            });
            return;
          }

          // Chrome 60 doesn't support `scrollTo`
          root.scrollTop = height;
        }
      });
    }
    _getNewObserver() {
      const options = {
        root: this._rootElement,
        threshold: this._config.threshold,
        rootMargin: this._config.rootMargin
      };
      return new IntersectionObserver(entries => this._observerCallback(entries), options);
    }

    // The logic of selection
    _observerCallback(entries) {
      const targetElement = entry => this._targetLinks.get(`#${entry.target.id}`);
      const activate = entry => {
        this._previousScrollData.visibleEntryTop = entry.target.offsetTop;
        this._process(targetElement(entry));
      };
      const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
      const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
      this._previousScrollData.parentScrollTop = parentScrollTop;
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          this._activeTarget = null;
          this._clearActiveClass(targetElement(entry));
          continue;
        }
        const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop;
        // if we are scrolling down, pick the bigger offsetTop
        if (userScrollsDown && entryIsLowerThanPrevious) {
          activate(entry);
          // if parent isn't scrolled, let's keep the first visible item, breaking the iteration
          if (!parentScrollTop) {
            return;
          }
          continue;
        }

        // if we are scrolling up, pick the smallest offsetTop
        if (!userScrollsDown && !entryIsLowerThanPrevious) {
          activate(entry);
        }
      }
    }
    _initializeTargetsAndObservables() {
      this._targetLinks = new Map();
      this._observableSections = new Map();
      const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);
      for (const anchor of targetLinks) {
        // ensure that the anchor has an id and is not disabled
        if (!anchor.hash || isDisabled(anchor)) {
          continue;
        }
        const observableSection = SelectorEngine.findOne(decodeURI(anchor.hash), this._element);

        // ensure that the observableSection exists & is visible
        if (isVisible(observableSection)) {
          this._targetLinks.set(decodeURI(anchor.hash), anchor);
          this._observableSections.set(anchor.hash, observableSection);
        }
      }
    }
    _process(target) {
      if (this._activeTarget === target) {
        return;
      }
      this._clearActiveClass(this._config.target);
      this._activeTarget = target;
      target.classList.add(CLASS_NAME_ACTIVE$1);
      this._activateParents(target);
      EventHandler.trigger(this._element, EVENT_ACTIVATE, {
        relatedTarget: target
      });
    }
    _activateParents(target) {
      // Activate dropdown parents
      if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
        SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE$1);
        return;
      }
      for (const listGroup of SelectorEngine.parents(target, SELECTOR_NAV_LIST_GROUP)) {
        // Set triggered links parents as active
        // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor
        for (const item of SelectorEngine.prev(listGroup, SELECTOR_LINK_ITEMS)) {
          item.classList.add(CLASS_NAME_ACTIVE$1);
        }
      }
    }
    _clearActiveClass(parent) {
      parent.classList.remove(CLASS_NAME_ACTIVE$1);
      const activeNodes = SelectorEngine.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE$1}`, parent);
      for (const node of activeNodes) {
        node.classList.remove(CLASS_NAME_ACTIVE$1);
      }
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = ScrollSpy.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => {
    for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) {
      ScrollSpy.getOrCreateInstance(spy);
    }
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(ScrollSpy);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap tab.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$1 = 'tab';
  const DATA_KEY$1 = 'bs.tab';
  const EVENT_KEY$1 = `.${DATA_KEY$1}`;
  const EVENT_HIDE$1 = `hide${EVENT_KEY$1}`;
  const EVENT_HIDDEN$1 = `hidden${EVENT_KEY$1}`;
  const EVENT_SHOW$1 = `show${EVENT_KEY$1}`;
  const EVENT_SHOWN$1 = `shown${EVENT_KEY$1}`;
  const EVENT_CLICK_DATA_API = `click${EVENT_KEY$1}`;
  const EVENT_KEYDOWN = `keydown${EVENT_KEY$1}`;
  const EVENT_LOAD_DATA_API = `load${EVENT_KEY$1}`;
  const ARROW_LEFT_KEY = 'ArrowLeft';
  const ARROW_RIGHT_KEY = 'ArrowRight';
  const ARROW_UP_KEY = 'ArrowUp';
  const ARROW_DOWN_KEY = 'ArrowDown';
  const HOME_KEY = 'Home';
  const END_KEY = 'End';
  const CLASS_NAME_ACTIVE = 'active';
  const CLASS_NAME_FADE$1 = 'fade';
  const CLASS_NAME_SHOW$1 = 'show';
  const CLASS_DROPDOWN = 'dropdown';
  const SELECTOR_DROPDOWN_TOGGLE = '.dropdown-toggle';
  const SELECTOR_DROPDOWN_MENU = '.dropdown-menu';
  const NOT_SELECTOR_DROPDOWN_TOGGLE = `:not(${SELECTOR_DROPDOWN_TOGGLE})`;
  const SELECTOR_TAB_PANEL = '.list-group, .nav, [role="tablist"]';
  const SELECTOR_OUTER = '.nav-item, .list-group-item';
  const SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
  const SELECTOR_DATA_TOGGLE = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]'; // TODO: could only be `tab` in v6
  const SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE}`;
  const SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-bs-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="list"]`;

  /**
   * Class definition
   */

  class Tab extends BaseComponent {
    constructor(element) {
      super(element);
      this._parent = this._element.closest(SELECTOR_TAB_PANEL);
      if (!this._parent) {
        return;
        // TODO: should throw exception in v6
        // throw new TypeError(`${element.outerHTML} has not a valid parent ${SELECTOR_INNER_ELEM}`)
      }

      // Set up initial aria attributes
      this._setInitialAttributes(this._parent, this._getChildren());
      EventHandler.on(this._element, EVENT_KEYDOWN, event => this._keydown(event));
    }

    // Getters
    static get NAME() {
      return NAME$1;
    }

    // Public
    show() {
      // Shows this elem and deactivate the active sibling if exists
      const innerElem = this._element;
      if (this._elemIsActive(innerElem)) {
        return;
      }

      // Search for active tab on same parent to deactivate it
      const active = this._getActiveElem();
      const hideEvent = active ? EventHandler.trigger(active, EVENT_HIDE$1, {
        relatedTarget: innerElem
      }) : null;
      const showEvent = EventHandler.trigger(innerElem, EVENT_SHOW$1, {
        relatedTarget: active
      });
      if (showEvent.defaultPrevented || hideEvent && hideEvent.defaultPrevented) {
        return;
      }
      this._deactivate(active, innerElem);
      this._activate(innerElem, active);
    }

    // Private
    _activate(element, relatedElem) {
      if (!element) {
        return;
      }
      element.classList.add(CLASS_NAME_ACTIVE);
      this._activate(SelectorEngine.getElementFromSelector(element)); // Search and activate/show the proper section

      const complete = () => {
        if (element.getAttribute('role') !== 'tab') {
          element.classList.add(CLASS_NAME_SHOW$1);
          return;
        }
        element.removeAttribute('tabindex');
        element.setAttribute('aria-selected', true);
        this._toggleDropDown(element, true);
        EventHandler.trigger(element, EVENT_SHOWN$1, {
          relatedTarget: relatedElem
        });
      };
      this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
    }
    _deactivate(element, relatedElem) {
      if (!element) {
        return;
      }
      element.classList.remove(CLASS_NAME_ACTIVE);
      element.blur();
      this._deactivate(SelectorEngine.getElementFromSelector(element)); // Search and deactivate the shown section too

      const complete = () => {
        if (element.getAttribute('role') !== 'tab') {
          element.classList.remove(CLASS_NAME_SHOW$1);
          return;
        }
        element.setAttribute('aria-selected', false);
        element.setAttribute('tabindex', '-1');
        this._toggleDropDown(element, false);
        EventHandler.trigger(element, EVENT_HIDDEN$1, {
          relatedTarget: relatedElem
        });
      };
      this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
    }
    _keydown(event) {
      if (![ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY, HOME_KEY, END_KEY].includes(event.key)) {
        return;
      }
      event.stopPropagation(); // stopPropagation/preventDefault both added to support up/down keys without scrolling the page
      event.preventDefault();
      const children = this._getChildren().filter(element => !isDisabled(element));
      let nextActiveElement;
      if ([HOME_KEY, END_KEY].includes(event.key)) {
        nextActiveElement = children[event.key === HOME_KEY ? 0 : children.length - 1];
      } else {
        const isNext = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY].includes(event.key);
        nextActiveElement = getNextActiveElement(children, event.target, isNext, true);
      }
      if (nextActiveElement) {
        nextActiveElement.focus({
          preventScroll: true
        });
        Tab.getOrCreateInstance(nextActiveElement).show();
      }
    }
    _getChildren() {
      // collection of inner elements
      return SelectorEngine.find(SELECTOR_INNER_ELEM, this._parent);
    }
    _getActiveElem() {
      return this._getChildren().find(child => this._elemIsActive(child)) || null;
    }
    _setInitialAttributes(parent, children) {
      this._setAttributeIfNotExists(parent, 'role', 'tablist');
      for (const child of children) {
        this._setInitialAttributesOnChild(child);
      }
    }
    _setInitialAttributesOnChild(child) {
      child = this._getInnerElement(child);
      const isActive = this._elemIsActive(child);
      const outerElem = this._getOuterElement(child);
      child.setAttribute('aria-selected', isActive);
      if (outerElem !== child) {
        this._setAttributeIfNotExists(outerElem, 'role', 'presentation');
      }
      if (!isActive) {
        child.setAttribute('tabindex', '-1');
      }
      this._setAttributeIfNotExists(child, 'role', 'tab');

      // set attributes to the related panel too
      this._setInitialAttributesOnTargetPanel(child);
    }
    _setInitialAttributesOnTargetPanel(child) {
      const target = SelectorEngine.getElementFromSelector(child);
      if (!target) {
        return;
      }
      this._setAttributeIfNotExists(target, 'role', 'tabpanel');
      if (child.id) {
        this._setAttributeIfNotExists(target, 'aria-labelledby', `${child.id}`);
      }
    }
    _toggleDropDown(element, open) {
      const outerElem = this._getOuterElement(element);
      if (!outerElem.classList.contains(CLASS_DROPDOWN)) {
        return;
      }
      const toggle = (selector, className) => {
        const element = SelectorEngine.findOne(selector, outerElem);
        if (element) {
          element.classList.toggle(className, open);
        }
      };
      toggle(SELECTOR_DROPDOWN_TOGGLE, CLASS_NAME_ACTIVE);
      toggle(SELECTOR_DROPDOWN_MENU, CLASS_NAME_SHOW$1);
      outerElem.setAttribute('aria-expanded', open);
    }
    _setAttributeIfNotExists(element, attribute, value) {
      if (!element.hasAttribute(attribute)) {
        element.setAttribute(attribute, value);
      }
    }
    _elemIsActive(elem) {
      return elem.classList.contains(CLASS_NAME_ACTIVE);
    }

    // Try to get the inner element (usually the .nav-link)
    _getInnerElement(elem) {
      return elem.matches(SELECTOR_INNER_ELEM) ? elem : SelectorEngine.findOne(SELECTOR_INNER_ELEM, elem);
    }

    // Try to get the outer element (usually the .nav-item)
    _getOuterElement(elem) {
      return elem.closest(SELECTOR_OUTER) || elem;
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Tab.getOrCreateInstance(this);
        if (typeof config !== 'string') {
          return;
        }
        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }
    if (isDisabled(this)) {
      return;
    }
    Tab.getOrCreateInstance(this).show();
  });

  /**
   * Initialize on focus
   */
  EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
    for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE)) {
      Tab.getOrCreateInstance(element);
    }
  });
  /**
   * jQuery
   */

  defineJQueryPlugin(Tab);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap toast.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME = 'toast';
  const DATA_KEY = 'bs.toast';
  const EVENT_KEY = `.${DATA_KEY}`;
  const EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`;
  const EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`;
  const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
  const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
  const EVENT_HIDE = `hide${EVENT_KEY}`;
  const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
  const EVENT_SHOW = `show${EVENT_KEY}`;
  const EVENT_SHOWN = `shown${EVENT_KEY}`;
  const CLASS_NAME_FADE = 'fade';
  const CLASS_NAME_HIDE = 'hide'; // @deprecated - kept here only for backwards compatibility
  const CLASS_NAME_SHOW = 'show';
  const CLASS_NAME_SHOWING = 'showing';
  const DefaultType = {
    animation: 'boolean',
    autohide: 'boolean',
    delay: 'number'
  };
  const Default = {
    animation: true,
    autohide: true,
    delay: 5000
  };

  /**
   * Class definition
   */

  class Toast extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._timeout = null;
      this._hasMouseInteraction = false;
      this._hasKeyboardInteraction = false;
      this._setListeners();
    }

    // Getters
    static get Default() {
      return Default;
    }
    static get DefaultType() {
      return DefaultType;
    }
    static get NAME() {
      return NAME;
    }

    // Public
    show() {
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW);
      if (showEvent.defaultPrevented) {
        return;
      }
      this._clearTimeout();
      if (this._config.animation) {
        this._element.classList.add(CLASS_NAME_FADE);
      }
      const complete = () => {
        this._element.classList.remove(CLASS_NAME_SHOWING);
        EventHandler.trigger(this._element, EVENT_SHOWN);
        this._maybeScheduleHide();
      };
      this._element.classList.remove(CLASS_NAME_HIDE); // @deprecated
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_SHOW, CLASS_NAME_SHOWING);
      this._queueCallback(complete, this._element, this._config.animation);
    }
    hide() {
      if (!this.isShown()) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE);
      if (hideEvent.defaultPrevented) {
        return;
      }
      const complete = () => {
        this._element.classList.add(CLASS_NAME_HIDE); // @deprecated
        this._element.classList.remove(CLASS_NAME_SHOWING, CLASS_NAME_SHOW);
        EventHandler.trigger(this._element, EVENT_HIDDEN);
      };
      this._element.classList.add(CLASS_NAME_SHOWING);
      this._queueCallback(complete, this._element, this._config.animation);
    }
    dispose() {
      this._clearTimeout();
      if (this.isShown()) {
        this._element.classList.remove(CLASS_NAME_SHOW);
      }
      super.dispose();
    }
    isShown() {
      return this._element.classList.contains(CLASS_NAME_SHOW);
    }

    // Private

    _maybeScheduleHide() {
      if (!this._config.autohide) {
        return;
      }
      if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
        return;
      }
      this._timeout = setTimeout(() => {
        this.hide();
      }, this._config.delay);
    }
    _onInteraction(event, isInteracting) {
      switch (event.type) {
        case 'mouseover':
        case 'mouseout':
          {
            this._hasMouseInteraction = isInteracting;
            break;
          }
        case 'focusin':
        case 'focusout':
          {
            this._hasKeyboardInteraction = isInteracting;
            break;
          }
      }
      if (isInteracting) {
        this._clearTimeout();
        return;
      }
      const nextElement = event.relatedTarget;
      if (this._element === nextElement || this._element.contains(nextElement)) {
        return;
      }
      this._maybeScheduleHide();
    }
    _setListeners() {
      EventHandler.on(this._element, EVENT_MOUSEOVER, event => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_MOUSEOUT, event => this._onInteraction(event, false));
      EventHandler.on(this._element, EVENT_FOCUSIN, event => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_FOCUSOUT, event => this._onInteraction(event, false));
    }
    _clearTimeout() {
      clearTimeout(this._timeout);
      this._timeout = null;
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Toast.getOrCreateInstance(this, config);
        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config](this);
        }
      });
    }
  }

  /**
   * Data API implementation
   */

  enableDismissTrigger(Toast);

  /**
   * jQuery
   */

  defineJQueryPlugin(Toast);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap index.umd.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const index_umd = {
    Alert,
    Button,
    Carousel,
    Collapse,
    Dropdown,
    Modal,
    Offcanvas,
    Popover,
    ScrollSpy,
    Tab,
    Toast,
    Tooltip
  };

  return index_umd;

}));


/*! jQuery v3.7.1 | (c) OpenJS Foundation and other contributors | jquery.org/license */
!function(e,t){"use strict";"object"==typeof module&&"object"==typeof module.exports?module.exports=e.document?t(e,!0):function(e){if(!e.document)throw new Error("jQuery requires a window with a document");return t(e)}:t(e)}("undefined"!=typeof window?window:this,function(ie,e){"use strict";var oe=[],r=Object.getPrototypeOf,ae=oe.slice,g=oe.flat?function(e){return oe.flat.call(e)}:function(e){return oe.concat.apply([],e)},s=oe.push,se=oe.indexOf,n={},i=n.toString,ue=n.hasOwnProperty,o=ue.toString,a=o.call(Object),le={},v=function(e){return"function"==typeof e&&"number"!=typeof e.nodeType&&"function"!=typeof e.item},y=function(e){return null!=e&&e===e.window},C=ie.document,u={type:!0,src:!0,nonce:!0,noModule:!0};function m(e,t,n){var r,i,o=(n=n||C).createElement("script");if(o.text=e,t)for(r in u)(i=t[r]||t.getAttribute&&t.getAttribute(r))&&o.setAttribute(r,i);n.head.appendChild(o).parentNode.removeChild(o)}function x(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?n[i.call(e)]||"object":typeof e}var t="3.7.1",l=/HTML$/i,ce=function(e,t){return new ce.fn.init(e,t)};function c(e){var t=!!e&&"length"in e&&e.length,n=x(e);return!v(e)&&!y(e)&&("array"===n||0===t||"number"==typeof t&&0<t&&t-1 in e)}function fe(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()}ce.fn=ce.prototype={jquery:t,constructor:ce,length:0,toArray:function(){return ae.call(this)},get:function(e){return null==e?ae.call(this):e<0?this[e+this.length]:this[e]},pushStack:function(e){var t=ce.merge(this.constructor(),e);return t.prevObject=this,t},each:function(e){return ce.each(this,e)},map:function(n){return this.pushStack(ce.map(this,function(e,t){return n.call(e,t,e)}))},slice:function(){return this.pushStack(ae.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},even:function(){return this.pushStack(ce.grep(this,function(e,t){return(t+1)%2}))},odd:function(){return this.pushStack(ce.grep(this,function(e,t){return t%2}))},eq:function(e){var t=this.length,n=+e+(e<0?t:0);return this.pushStack(0<=n&&n<t?[this[n]]:[])},end:function(){return this.prevObject||this.constructor()},push:s,sort:oe.sort,splice:oe.splice},ce.extend=ce.fn.extend=function(){var e,t,n,r,i,o,a=arguments[0]||{},s=1,u=arguments.length,l=!1;for("boolean"==typeof a&&(l=a,a=arguments[s]||{},s++),"object"==typeof a||v(a)||(a={}),s===u&&(a=this,s--);s<u;s++)if(null!=(e=arguments[s]))for(t in e)r=e[t],"__proto__"!==t&&a!==r&&(l&&r&&(ce.isPlainObject(r)||(i=Array.isArray(r)))?(n=a[t],o=i&&!Array.isArray(n)?[]:i||ce.isPlainObject(n)?n:{},i=!1,a[t]=ce.extend(l,o,r)):void 0!==r&&(a[t]=r));return a},ce.extend({expando:"jQuery"+(t+Math.random()).replace(/\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isPlainObject:function(e){var t,n;return!(!e||"[object Object]"!==i.call(e))&&(!(t=r(e))||"function"==typeof(n=ue.call(t,"constructor")&&t.constructor)&&o.call(n)===a)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},globalEval:function(e,t,n){m(e,{nonce:t&&t.nonce},n)},each:function(e,t){var n,r=0;if(c(e)){for(n=e.length;r<n;r++)if(!1===t.call(e[r],r,e[r]))break}else for(r in e)if(!1===t.call(e[r],r,e[r]))break;return e},text:function(e){var t,n="",r=0,i=e.nodeType;if(!i)while(t=e[r++])n+=ce.text(t);return 1===i||11===i?e.textContent:9===i?e.documentElement.textContent:3===i||4===i?e.nodeValue:n},makeArray:function(e,t){var n=t||[];return null!=e&&(c(Object(e))?ce.merge(n,"string"==typeof e?[e]:e):s.call(n,e)),n},inArray:function(e,t,n){return null==t?-1:se.call(t,e,n)},isXMLDoc:function(e){var t=e&&e.namespaceURI,n=e&&(e.ownerDocument||e).documentElement;return!l.test(t||n&&n.nodeName||"HTML")},merge:function(e,t){for(var n=+t.length,r=0,i=e.length;r<n;r++)e[i++]=t[r];return e.length=i,e},grep:function(e,t,n){for(var r=[],i=0,o=e.length,a=!n;i<o;i++)!t(e[i],i)!==a&&r.push(e[i]);return r},map:function(e,t,n){var r,i,o=0,a=[];if(c(e))for(r=e.length;o<r;o++)null!=(i=t(e[o],o,n))&&a.push(i);else for(o in e)null!=(i=t(e[o],o,n))&&a.push(i);return g(a)},guid:1,support:le}),"function"==typeof Symbol&&(ce.fn[Symbol.iterator]=oe[Symbol.iterator]),ce.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(e,t){n["[object "+t+"]"]=t.toLowerCase()});var pe=oe.pop,de=oe.sort,he=oe.splice,ge="[\\x20\\t\\r\\n\\f]",ve=new RegExp("^"+ge+"+|((?:^|[^\\\\])(?:\\\\.)*)"+ge+"+$","g");ce.contains=function(e,t){var n=t&&t.parentNode;return e===n||!(!n||1!==n.nodeType||!(e.contains?e.contains(n):e.compareDocumentPosition&&16&e.compareDocumentPosition(n)))};var f=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;function p(e,t){return t?"\0"===e?"\ufffd":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e}ce.escapeSelector=function(e){return(e+"").replace(f,p)};var ye=C,me=s;!function(){var e,b,w,o,a,T,r,C,d,i,k=me,S=ce.expando,E=0,n=0,s=W(),c=W(),u=W(),h=W(),l=function(e,t){return e===t&&(a=!0),0},f="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",t="(?:\\\\[\\da-fA-F]{1,6}"+ge+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",p="\\["+ge+"*("+t+")(?:"+ge+"*([*^$|!~]?=)"+ge+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+t+"))|)"+ge+"*\\]",g=":("+t+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+p+")*)|.*)\\)|)",v=new RegExp(ge+"+","g"),y=new RegExp("^"+ge+"*,"+ge+"*"),m=new RegExp("^"+ge+"*([>+~]|"+ge+")"+ge+"*"),x=new RegExp(ge+"|>"),j=new RegExp(g),A=new RegExp("^"+t+"$"),D={ID:new RegExp("^#("+t+")"),CLASS:new RegExp("^\\.("+t+")"),TAG:new RegExp("^("+t+"|[*])"),ATTR:new RegExp("^"+p),PSEUDO:new RegExp("^"+g),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+ge+"*(even|odd|(([+-]|)(\\d*)n|)"+ge+"*(?:([+-]|)"+ge+"*(\\d+)|))"+ge+"*\\)|)","i"),bool:new RegExp("^(?:"+f+")$","i"),needsContext:new RegExp("^"+ge+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+ge+"*((?:-\\d)?\\d*)"+ge+"*\\)|)(?=[^-]|$)","i")},N=/^(?:input|select|textarea|button)$/i,q=/^h\d$/i,L=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,H=/[+~]/,O=new RegExp("\\\\[\\da-fA-F]{1,6}"+ge+"?|\\\\([^\\r\\n\\f])","g"),P=function(e,t){var n="0x"+e.slice(1)-65536;return t||(n<0?String.fromCharCode(n+65536):String.fromCharCode(n>>10|55296,1023&n|56320))},M=function(){V()},R=J(function(e){return!0===e.disabled&&fe(e,"fieldset")},{dir:"parentNode",next:"legend"});try{k.apply(oe=ae.call(ye.childNodes),ye.childNodes),oe[ye.childNodes.length].nodeType}catch(e){k={apply:function(e,t){me.apply(e,ae.call(t))},call:function(e){me.apply(e,ae.call(arguments,1))}}}function I(t,e,n,r){var i,o,a,s,u,l,c,f=e&&e.ownerDocument,p=e?e.nodeType:9;if(n=n||[],"string"!=typeof t||!t||1!==p&&9!==p&&11!==p)return n;if(!r&&(V(e),e=e||T,C)){if(11!==p&&(u=L.exec(t)))if(i=u[1]){if(9===p){if(!(a=e.getElementById(i)))return n;if(a.id===i)return k.call(n,a),n}else if(f&&(a=f.getElementById(i))&&I.contains(e,a)&&a.id===i)return k.call(n,a),n}else{if(u[2])return k.apply(n,e.getElementsByTagName(t)),n;if((i=u[3])&&e.getElementsByClassName)return k.apply(n,e.getElementsByClassName(i)),n}if(!(h[t+" "]||d&&d.test(t))){if(c=t,f=e,1===p&&(x.test(t)||m.test(t))){(f=H.test(t)&&U(e.parentNode)||e)==e&&le.scope||((s=e.getAttribute("id"))?s=ce.escapeSelector(s):e.setAttribute("id",s=S)),o=(l=Y(t)).length;while(o--)l[o]=(s?"#"+s:":scope")+" "+Q(l[o]);c=l.join(",")}try{return k.apply(n,f.querySelectorAll(c)),n}catch(e){h(t,!0)}finally{s===S&&e.removeAttribute("id")}}}return re(t.replace(ve,"$1"),e,n,r)}function W(){var r=[];return function e(t,n){return r.push(t+" ")>b.cacheLength&&delete e[r.shift()],e[t+" "]=n}}function F(e){return e[S]=!0,e}function $(e){var t=T.createElement("fieldset");try{return!!e(t)}catch(e){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function B(t){return function(e){return fe(e,"input")&&e.type===t}}function _(t){return function(e){return(fe(e,"input")||fe(e,"button"))&&e.type===t}}function z(t){return function(e){return"form"in e?e.parentNode&&!1===e.disabled?"label"in e?"label"in e.parentNode?e.parentNode.disabled===t:e.disabled===t:e.isDisabled===t||e.isDisabled!==!t&&R(e)===t:e.disabled===t:"label"in e&&e.disabled===t}}function X(a){return F(function(o){return o=+o,F(function(e,t){var n,r=a([],e.length,o),i=r.length;while(i--)e[n=r[i]]&&(e[n]=!(t[n]=e[n]))})})}function U(e){return e&&"undefined"!=typeof e.getElementsByTagName&&e}function V(e){var t,n=e?e.ownerDocument||e:ye;return n!=T&&9===n.nodeType&&n.documentElement&&(r=(T=n).documentElement,C=!ce.isXMLDoc(T),i=r.matches||r.webkitMatchesSelector||r.msMatchesSelector,r.msMatchesSelector&&ye!=T&&(t=T.defaultView)&&t.top!==t&&t.addEventListener("unload",M),le.getById=$(function(e){return r.appendChild(e).id=ce.expando,!T.getElementsByName||!T.getElementsByName(ce.expando).length}),le.disconnectedMatch=$(function(e){return i.call(e,"*")}),le.scope=$(function(){return T.querySelectorAll(":scope")}),le.cssHas=$(function(){try{return T.querySelector(":has(*,:jqfake)"),!1}catch(e){return!0}}),le.getById?(b.filter.ID=function(e){var t=e.replace(O,P);return function(e){return e.getAttribute("id")===t}},b.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&C){var n=t.getElementById(e);return n?[n]:[]}}):(b.filter.ID=function(e){var n=e.replace(O,P);return function(e){var t="undefined"!=typeof e.getAttributeNode&&e.getAttributeNode("id");return t&&t.value===n}},b.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&C){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return[o];i=t.getElementsByName(e),r=0;while(o=i[r++])if((n=o.getAttributeNode("id"))&&n.value===e)return[o]}return[]}}),b.find.TAG=function(e,t){return"undefined"!=typeof t.getElementsByTagName?t.getElementsByTagName(e):t.querySelectorAll(e)},b.find.CLASS=function(e,t){if("undefined"!=typeof t.getElementsByClassName&&C)return t.getElementsByClassName(e)},d=[],$(function(e){var t;r.appendChild(e).innerHTML="<a id='"+S+"' href='' disabled='disabled'></a><select id='"+S+"-\r\\' disabled='disabled'><option selected=''></option></select>",e.querySelectorAll("[selected]").length||d.push("\\["+ge+"*(?:value|"+f+")"),e.querySelectorAll("[id~="+S+"-]").length||d.push("~="),e.querySelectorAll("a#"+S+"+*").length||d.push(".#.+[+~]"),e.querySelectorAll(":checked").length||d.push(":checked"),(t=T.createElement("input")).setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),r.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&d.push(":enabled",":disabled"),(t=T.createElement("input")).setAttribute("name",""),e.appendChild(t),e.querySelectorAll("[name='']").length||d.push("\\["+ge+"*name"+ge+"*="+ge+"*(?:''|\"\")")}),le.cssHas||d.push(":has"),d=d.length&&new RegExp(d.join("|")),l=function(e,t){if(e===t)return a=!0,0;var n=!e.compareDocumentPosition-!t.compareDocumentPosition;return n||(1&(n=(e.ownerDocument||e)==(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!le.sortDetached&&t.compareDocumentPosition(e)===n?e===T||e.ownerDocument==ye&&I.contains(ye,e)?-1:t===T||t.ownerDocument==ye&&I.contains(ye,t)?1:o?se.call(o,e)-se.call(o,t):0:4&n?-1:1)}),T}for(e in I.matches=function(e,t){return I(e,null,null,t)},I.matchesSelector=function(e,t){if(V(e),C&&!h[t+" "]&&(!d||!d.test(t)))try{var n=i.call(e,t);if(n||le.disconnectedMatch||e.document&&11!==e.document.nodeType)return n}catch(e){h(t,!0)}return 0<I(t,T,null,[e]).length},I.contains=function(e,t){return(e.ownerDocument||e)!=T&&V(e),ce.contains(e,t)},I.attr=function(e,t){(e.ownerDocument||e)!=T&&V(e);var n=b.attrHandle[t.toLowerCase()],r=n&&ue.call(b.attrHandle,t.toLowerCase())?n(e,t,!C):void 0;return void 0!==r?r:e.getAttribute(t)},I.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},ce.uniqueSort=function(e){var t,n=[],r=0,i=0;if(a=!le.sortStable,o=!le.sortStable&&ae.call(e,0),de.call(e,l),a){while(t=e[i++])t===e[i]&&(r=n.push(i));while(r--)he.call(e,n[r],1)}return o=null,e},ce.fn.uniqueSort=function(){return this.pushStack(ce.uniqueSort(ae.apply(this)))},(b=ce.expr={cacheLength:50,createPseudo:F,match:D,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(O,P),e[3]=(e[3]||e[4]||e[5]||"").replace(O,P),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||I.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&I.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return D.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&j.test(n)&&(t=Y(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(O,P).toLowerCase();return"*"===e?function(){return!0}:function(e){return fe(e,t)}},CLASS:function(e){var t=s[e+" "];return t||(t=new RegExp("(^|"+ge+")"+e+"("+ge+"|$)"))&&s(e,function(e){return t.test("string"==typeof e.className&&e.className||"undefined"!=typeof e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(n,r,i){return function(e){var t=I.attr(e,n);return null==t?"!="===r:!r||(t+="","="===r?t===i:"!="===r?t!==i:"^="===r?i&&0===t.indexOf(i):"*="===r?i&&-1<t.indexOf(i):"$="===r?i&&t.slice(-i.length)===i:"~="===r?-1<(" "+t.replace(v," ")+" ").indexOf(i):"|="===r&&(t===i||t.slice(0,i.length+1)===i+"-"))}},CHILD:function(d,e,t,h,g){var v="nth"!==d.slice(0,3),y="last"!==d.slice(-4),m="of-type"===e;return 1===h&&0===g?function(e){return!!e.parentNode}:function(e,t,n){var r,i,o,a,s,u=v!==y?"nextSibling":"previousSibling",l=e.parentNode,c=m&&e.nodeName.toLowerCase(),f=!n&&!m,p=!1;if(l){if(v){while(u){o=e;while(o=o[u])if(m?fe(o,c):1===o.nodeType)return!1;s=u="only"===d&&!s&&"nextSibling"}return!0}if(s=[y?l.firstChild:l.lastChild],y&&f){p=(a=(r=(i=l[S]||(l[S]={}))[d]||[])[0]===E&&r[1])&&r[2],o=a&&l.childNodes[a];while(o=++a&&o&&o[u]||(p=a=0)||s.pop())if(1===o.nodeType&&++p&&o===e){i[d]=[E,a,p];break}}else if(f&&(p=a=(r=(i=e[S]||(e[S]={}))[d]||[])[0]===E&&r[1]),!1===p)while(o=++a&&o&&o[u]||(p=a=0)||s.pop())if((m?fe(o,c):1===o.nodeType)&&++p&&(f&&((i=o[S]||(o[S]={}))[d]=[E,p]),o===e))break;return(p-=g)===h||p%h==0&&0<=p/h}}},PSEUDO:function(e,o){var t,a=b.pseudos[e]||b.setFilters[e.toLowerCase()]||I.error("unsupported pseudo: "+e);return a[S]?a(o):1<a.length?(t=[e,e,"",o],b.setFilters.hasOwnProperty(e.toLowerCase())?F(function(e,t){var n,r=a(e,o),i=r.length;while(i--)e[n=se.call(e,r[i])]=!(t[n]=r[i])}):function(e){return a(e,0,t)}):a}},pseudos:{not:F(function(e){var r=[],i=[],s=ne(e.replace(ve,"$1"));return s[S]?F(function(e,t,n,r){var i,o=s(e,null,r,[]),a=e.length;while(a--)(i=o[a])&&(e[a]=!(t[a]=i))}):function(e,t,n){return r[0]=e,s(r,null,n,i),r[0]=null,!i.pop()}}),has:F(function(t){return function(e){return 0<I(t,e).length}}),contains:F(function(t){return t=t.replace(O,P),function(e){return-1<(e.textContent||ce.text(e)).indexOf(t)}}),lang:F(function(n){return A.test(n||"")||I.error("unsupported lang: "+n),n=n.replace(O,P).toLowerCase(),function(e){var t;do{if(t=C?e.lang:e.getAttribute("xml:lang")||e.getAttribute("lang"))return(t=t.toLowerCase())===n||0===t.indexOf(n+"-")}while((e=e.parentNode)&&1===e.nodeType);return!1}}),target:function(e){var t=ie.location&&ie.location.hash;return t&&t.slice(1)===e.id},root:function(e){return e===r},focus:function(e){return e===function(){try{return T.activeElement}catch(e){}}()&&T.hasFocus()&&!!(e.type||e.href||~e.tabIndex)},enabled:z(!1),disabled:z(!0),checked:function(e){return fe(e,"input")&&!!e.checked||fe(e,"option")&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return!1;return!0},parent:function(e){return!b.pseudos.empty(e)},header:function(e){return q.test(e.nodeName)},input:function(e){return N.test(e.nodeName)},button:function(e){return fe(e,"input")&&"button"===e.type||fe(e,"button")},text:function(e){var t;return fe(e,"input")&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:X(function(){return[0]}),last:X(function(e,t){return[t-1]}),eq:X(function(e,t,n){return[n<0?n+t:n]}),even:X(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:X(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:X(function(e,t,n){var r;for(r=n<0?n+t:t<n?t:n;0<=--r;)e.push(r);return e}),gt:X(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}}).pseudos.nth=b.pseudos.eq,{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})b.pseudos[e]=B(e);for(e in{submit:!0,reset:!0})b.pseudos[e]=_(e);function G(){}function Y(e,t){var n,r,i,o,a,s,u,l=c[e+" "];if(l)return t?0:l.slice(0);a=e,s=[],u=b.preFilter;while(a){for(o in n&&!(r=y.exec(a))||(r&&(a=a.slice(r[0].length)||a),s.push(i=[])),n=!1,(r=m.exec(a))&&(n=r.shift(),i.push({value:n,type:r[0].replace(ve," ")}),a=a.slice(n.length)),b.filter)!(r=D[o].exec(a))||u[o]&&!(r=u[o](r))||(n=r.shift(),i.push({value:n,type:o,matches:r}),a=a.slice(n.length));if(!n)break}return t?a.length:a?I.error(e):c(e,s).slice(0)}function Q(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function J(a,e,t){var s=e.dir,u=e.next,l=u||s,c=t&&"parentNode"===l,f=n++;return e.first?function(e,t,n){while(e=e[s])if(1===e.nodeType||c)return a(e,t,n);return!1}:function(e,t,n){var r,i,o=[E,f];if(n){while(e=e[s])if((1===e.nodeType||c)&&a(e,t,n))return!0}else while(e=e[s])if(1===e.nodeType||c)if(i=e[S]||(e[S]={}),u&&fe(e,u))e=e[s]||e;else{if((r=i[l])&&r[0]===E&&r[1]===f)return o[2]=r[2];if((i[l]=o)[2]=a(e,t,n))return!0}return!1}}function K(i){return 1<i.length?function(e,t,n){var r=i.length;while(r--)if(!i[r](e,t,n))return!1;return!0}:i[0]}function Z(e,t,n,r,i){for(var o,a=[],s=0,u=e.length,l=null!=t;s<u;s++)(o=e[s])&&(n&&!n(o,r,i)||(a.push(o),l&&t.push(s)));return a}function ee(d,h,g,v,y,e){return v&&!v[S]&&(v=ee(v)),y&&!y[S]&&(y=ee(y,e)),F(function(e,t,n,r){var i,o,a,s,u=[],l=[],c=t.length,f=e||function(e,t,n){for(var r=0,i=t.length;r<i;r++)I(e,t[r],n);return n}(h||"*",n.nodeType?[n]:n,[]),p=!d||!e&&h?f:Z(f,u,d,n,r);if(g?g(p,s=y||(e?d:c||v)?[]:t,n,r):s=p,v){i=Z(s,l),v(i,[],n,r),o=i.length;while(o--)(a=i[o])&&(s[l[o]]=!(p[l[o]]=a))}if(e){if(y||d){if(y){i=[],o=s.length;while(o--)(a=s[o])&&i.push(p[o]=a);y(null,s=[],i,r)}o=s.length;while(o--)(a=s[o])&&-1<(i=y?se.call(e,a):u[o])&&(e[i]=!(t[i]=a))}}else s=Z(s===t?s.splice(c,s.length):s),y?y(null,t,s,r):k.apply(t,s)})}function te(e){for(var i,t,n,r=e.length,o=b.relative[e[0].type],a=o||b.relative[" "],s=o?1:0,u=J(function(e){return e===i},a,!0),l=J(function(e){return-1<se.call(i,e)},a,!0),c=[function(e,t,n){var r=!o&&(n||t!=w)||((i=t).nodeType?u(e,t,n):l(e,t,n));return i=null,r}];s<r;s++)if(t=b.relative[e[s].type])c=[J(K(c),t)];else{if((t=b.filter[e[s].type].apply(null,e[s].matches))[S]){for(n=++s;n<r;n++)if(b.relative[e[n].type])break;return ee(1<s&&K(c),1<s&&Q(e.slice(0,s-1).concat({value:" "===e[s-2].type?"*":""})).replace(ve,"$1"),t,s<n&&te(e.slice(s,n)),n<r&&te(e=e.slice(n)),n<r&&Q(e))}c.push(t)}return K(c)}function ne(e,t){var n,v,y,m,x,r,i=[],o=[],a=u[e+" "];if(!a){t||(t=Y(e)),n=t.length;while(n--)(a=te(t[n]))[S]?i.push(a):o.push(a);(a=u(e,(v=o,m=0<(y=i).length,x=0<v.length,r=function(e,t,n,r,i){var o,a,s,u=0,l="0",c=e&&[],f=[],p=w,d=e||x&&b.find.TAG("*",i),h=E+=null==p?1:Math.random()||.1,g=d.length;for(i&&(w=t==T||t||i);l!==g&&null!=(o=d[l]);l++){if(x&&o){a=0,t||o.ownerDocument==T||(V(o),n=!C);while(s=v[a++])if(s(o,t||T,n)){k.call(r,o);break}i&&(E=h)}m&&((o=!s&&o)&&u--,e&&c.push(o))}if(u+=l,m&&l!==u){a=0;while(s=y[a++])s(c,f,t,n);if(e){if(0<u)while(l--)c[l]||f[l]||(f[l]=pe.call(r));f=Z(f)}k.apply(r,f),i&&!e&&0<f.length&&1<u+y.length&&ce.uniqueSort(r)}return i&&(E=h,w=p),c},m?F(r):r))).selector=e}return a}function re(e,t,n,r){var i,o,a,s,u,l="function"==typeof e&&e,c=!r&&Y(e=l.selector||e);if(n=n||[],1===c.length){if(2<(o=c[0]=c[0].slice(0)).length&&"ID"===(a=o[0]).type&&9===t.nodeType&&C&&b.relative[o[1].type]){if(!(t=(b.find.ID(a.matches[0].replace(O,P),t)||[])[0]))return n;l&&(t=t.parentNode),e=e.slice(o.shift().value.length)}i=D.needsContext.test(e)?0:o.length;while(i--){if(a=o[i],b.relative[s=a.type])break;if((u=b.find[s])&&(r=u(a.matches[0].replace(O,P),H.test(o[0].type)&&U(t.parentNode)||t))){if(o.splice(i,1),!(e=r.length&&Q(o)))return k.apply(n,r),n;break}}}return(l||ne(e,c))(r,t,!C,n,!t||H.test(e)&&U(t.parentNode)||t),n}G.prototype=b.filters=b.pseudos,b.setFilters=new G,le.sortStable=S.split("").sort(l).join("")===S,V(),le.sortDetached=$(function(e){return 1&e.compareDocumentPosition(T.createElement("fieldset"))}),ce.find=I,ce.expr[":"]=ce.expr.pseudos,ce.unique=ce.uniqueSort,I.compile=ne,I.select=re,I.setDocument=V,I.tokenize=Y,I.escape=ce.escapeSelector,I.getText=ce.text,I.isXML=ce.isXMLDoc,I.selectors=ce.expr,I.support=ce.support,I.uniqueSort=ce.uniqueSort}();var d=function(e,t,n){var r=[],i=void 0!==n;while((e=e[t])&&9!==e.nodeType)if(1===e.nodeType){if(i&&ce(e).is(n))break;r.push(e)}return r},h=function(e,t){for(var n=[];e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n},b=ce.expr.match.needsContext,w=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;function T(e,n,r){return v(n)?ce.grep(e,function(e,t){return!!n.call(e,t,e)!==r}):n.nodeType?ce.grep(e,function(e){return e===n!==r}):"string"!=typeof n?ce.grep(e,function(e){return-1<se.call(n,e)!==r}):ce.filter(n,e,r)}ce.filter=function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?ce.find.matchesSelector(r,e)?[r]:[]:ce.find.matches(e,ce.grep(t,function(e){return 1===e.nodeType}))},ce.fn.extend({find:function(e){var t,n,r=this.length,i=this;if("string"!=typeof e)return this.pushStack(ce(e).filter(function(){for(t=0;t<r;t++)if(ce.contains(i[t],this))return!0}));for(n=this.pushStack([]),t=0;t<r;t++)ce.find(e,i[t],n);return 1<r?ce.uniqueSort(n):n},filter:function(e){return this.pushStack(T(this,e||[],!1))},not:function(e){return this.pushStack(T(this,e||[],!0))},is:function(e){return!!T(this,"string"==typeof e&&b.test(e)?ce(e):e||[],!1).length}});var k,S=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;(ce.fn.init=function(e,t,n){var r,i;if(!e)return this;if(n=n||k,"string"==typeof e){if(!(r="<"===e[0]&&">"===e[e.length-1]&&3<=e.length?[null,e,null]:S.exec(e))||!r[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(r[1]){if(t=t instanceof ce?t[0]:t,ce.merge(this,ce.parseHTML(r[1],t&&t.nodeType?t.ownerDocument||t:C,!0)),w.test(r[1])&&ce.isPlainObject(t))for(r in t)v(this[r])?this[r](t[r]):this.attr(r,t[r]);return this}return(i=C.getElementById(r[2]))&&(this[0]=i,this.length=1),this}return e.nodeType?(this[0]=e,this.length=1,this):v(e)?void 0!==n.ready?n.ready(e):e(ce):ce.makeArray(e,this)}).prototype=ce.fn,k=ce(C);var E=/^(?:parents|prev(?:Until|All))/,j={children:!0,contents:!0,next:!0,prev:!0};function A(e,t){while((e=e[t])&&1!==e.nodeType);return e}ce.fn.extend({has:function(e){var t=ce(e,this),n=t.length;return this.filter(function(){for(var e=0;e<n;e++)if(ce.contains(this,t[e]))return!0})},closest:function(e,t){var n,r=0,i=this.length,o=[],a="string"!=typeof e&&ce(e);if(!b.test(e))for(;r<i;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(n.nodeType<11&&(a?-1<a.index(n):1===n.nodeType&&ce.find.matchesSelector(n,e))){o.push(n);break}return this.pushStack(1<o.length?ce.uniqueSort(o):o)},index:function(e){return e?"string"==typeof e?se.call(ce(e),this[0]):se.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(ce.uniqueSort(ce.merge(this.get(),ce(e,t))))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}}),ce.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return d(e,"parentNode")},parentsUntil:function(e,t,n){return d(e,"parentNode",n)},next:function(e){return A(e,"nextSibling")},prev:function(e){return A(e,"previousSibling")},nextAll:function(e){return d(e,"nextSibling")},prevAll:function(e){return d(e,"previousSibling")},nextUntil:function(e,t,n){return d(e,"nextSibling",n)},prevUntil:function(e,t,n){return d(e,"previousSibling",n)},siblings:function(e){return h((e.parentNode||{}).firstChild,e)},children:function(e){return h(e.firstChild)},contents:function(e){return null!=e.contentDocument&&r(e.contentDocument)?e.contentDocument:(fe(e,"template")&&(e=e.content||e),ce.merge([],e.childNodes))}},function(r,i){ce.fn[r]=function(e,t){var n=ce.map(this,i,e);return"Until"!==r.slice(-5)&&(t=e),t&&"string"==typeof t&&(n=ce.filter(t,n)),1<this.length&&(j[r]||ce.uniqueSort(n),E.test(r)&&n.reverse()),this.pushStack(n)}});var D=/[^\x20\t\r\n\f]+/g;function N(e){return e}function q(e){throw e}function L(e,t,n,r){var i;try{e&&v(i=e.promise)?i.call(e).done(t).fail(n):e&&v(i=e.then)?i.call(e,t,n):t.apply(void 0,[e].slice(r))}catch(e){n.apply(void 0,[e])}}ce.Callbacks=function(r){var e,n;r="string"==typeof r?(e=r,n={},ce.each(e.match(D)||[],function(e,t){n[t]=!0}),n):ce.extend({},r);var i,t,o,a,s=[],u=[],l=-1,c=function(){for(a=a||r.once,o=i=!0;u.length;l=-1){t=u.shift();while(++l<s.length)!1===s[l].apply(t[0],t[1])&&r.stopOnFalse&&(l=s.length,t=!1)}r.memory||(t=!1),i=!1,a&&(s=t?[]:"")},f={add:function(){return s&&(t&&!i&&(l=s.length-1,u.push(t)),function n(e){ce.each(e,function(e,t){v(t)?r.unique&&f.has(t)||s.push(t):t&&t.length&&"string"!==x(t)&&n(t)})}(arguments),t&&!i&&c()),this},remove:function(){return ce.each(arguments,function(e,t){var n;while(-1<(n=ce.inArray(t,s,n)))s.splice(n,1),n<=l&&l--}),this},has:function(e){return e?-1<ce.inArray(e,s):0<s.length},empty:function(){return s&&(s=[]),this},disable:function(){return a=u=[],s=t="",this},disabled:function(){return!s},lock:function(){return a=u=[],t||i||(s=t=""),this},locked:function(){return!!a},fireWith:function(e,t){return a||(t=[e,(t=t||[]).slice?t.slice():t],u.push(t),i||c()),this},fire:function(){return f.fireWith(this,arguments),this},fired:function(){return!!o}};return f},ce.extend({Deferred:function(e){var o=[["notify","progress",ce.Callbacks("memory"),ce.Callbacks("memory"),2],["resolve","done",ce.Callbacks("once memory"),ce.Callbacks("once memory"),0,"resolved"],["reject","fail",ce.Callbacks("once memory"),ce.Callbacks("once memory"),1,"rejected"]],i="pending",a={state:function(){return i},always:function(){return s.done(arguments).fail(arguments),this},"catch":function(e){return a.then(null,e)},pipe:function(){var i=arguments;return ce.Deferred(function(r){ce.each(o,function(e,t){var n=v(i[t[4]])&&i[t[4]];s[t[1]](function(){var e=n&&n.apply(this,arguments);e&&v(e.promise)?e.promise().progress(r.notify).done(r.resolve).fail(r.reject):r[t[0]+"With"](this,n?[e]:arguments)})}),i=null}).promise()},then:function(t,n,r){var u=0;function l(i,o,a,s){return function(){var n=this,r=arguments,e=function(){var e,t;if(!(i<u)){if((e=a.apply(n,r))===o.promise())throw new TypeError("Thenable self-resolution");t=e&&("object"==typeof e||"function"==typeof e)&&e.then,v(t)?s?t.call(e,l(u,o,N,s),l(u,o,q,s)):(u++,t.call(e,l(u,o,N,s),l(u,o,q,s),l(u,o,N,o.notifyWith))):(a!==N&&(n=void 0,r=[e]),(s||o.resolveWith)(n,r))}},t=s?e:function(){try{e()}catch(e){ce.Deferred.exceptionHook&&ce.Deferred.exceptionHook(e,t.error),u<=i+1&&(a!==q&&(n=void 0,r=[e]),o.rejectWith(n,r))}};i?t():(ce.Deferred.getErrorHook?t.error=ce.Deferred.getErrorHook():ce.Deferred.getStackHook&&(t.error=ce.Deferred.getStackHook()),ie.setTimeout(t))}}return ce.Deferred(function(e){o[0][3].add(l(0,e,v(r)?r:N,e.notifyWith)),o[1][3].add(l(0,e,v(t)?t:N)),o[2][3].add(l(0,e,v(n)?n:q))}).promise()},promise:function(e){return null!=e?ce.extend(e,a):a}},s={};return ce.each(o,function(e,t){var n=t[2],r=t[5];a[t[1]]=n.add,r&&n.add(function(){i=r},o[3-e][2].disable,o[3-e][3].disable,o[0][2].lock,o[0][3].lock),n.add(t[3].fire),s[t[0]]=function(){return s[t[0]+"With"](this===s?void 0:this,arguments),this},s[t[0]+"With"]=n.fireWith}),a.promise(s),e&&e.call(s,s),s},when:function(e){var n=arguments.length,t=n,r=Array(t),i=ae.call(arguments),o=ce.Deferred(),a=function(t){return function(e){r[t]=this,i[t]=1<arguments.length?ae.call(arguments):e,--n||o.resolveWith(r,i)}};if(n<=1&&(L(e,o.done(a(t)).resolve,o.reject,!n),"pending"===o.state()||v(i[t]&&i[t].then)))return o.then();while(t--)L(i[t],a(t),o.reject);return o.promise()}});var H=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;ce.Deferred.exceptionHook=function(e,t){ie.console&&ie.console.warn&&e&&H.test(e.name)&&ie.console.warn("jQuery.Deferred exception: "+e.message,e.stack,t)},ce.readyException=function(e){ie.setTimeout(function(){throw e})};var O=ce.Deferred();function P(){C.removeEventListener("DOMContentLoaded",P),ie.removeEventListener("load",P),ce.ready()}ce.fn.ready=function(e){return O.then(e)["catch"](function(e){ce.readyException(e)}),this},ce.extend({isReady:!1,readyWait:1,ready:function(e){(!0===e?--ce.readyWait:ce.isReady)||(ce.isReady=!0)!==e&&0<--ce.readyWait||O.resolveWith(C,[ce])}}),ce.ready.then=O.then,"complete"===C.readyState||"loading"!==C.readyState&&!C.documentElement.doScroll?ie.setTimeout(ce.ready):(C.addEventListener("DOMContentLoaded",P),ie.addEventListener("load",P));var M=function(e,t,n,r,i,o,a){var s=0,u=e.length,l=null==n;if("object"===x(n))for(s in i=!0,n)M(e,t,s,n[s],!0,o,a);else if(void 0!==r&&(i=!0,v(r)||(a=!0),l&&(a?(t.call(e,r),t=null):(l=t,t=function(e,t,n){return l.call(ce(e),n)})),t))for(;s<u;s++)t(e[s],n,a?r:r.call(e[s],s,t(e[s],n)));return i?e:l?t.call(e):u?t(e[0],n):o},R=/^-ms-/,I=/-([a-z])/g;function W(e,t){return t.toUpperCase()}function F(e){return e.replace(R,"ms-").replace(I,W)}var $=function(e){return 1===e.nodeType||9===e.nodeType||!+e.nodeType};function B(){this.expando=ce.expando+B.uid++}B.uid=1,B.prototype={cache:function(e){var t=e[this.expando];return t||(t={},$(e)&&(e.nodeType?e[this.expando]=t:Object.defineProperty(e,this.expando,{value:t,configurable:!0}))),t},set:function(e,t,n){var r,i=this.cache(e);if("string"==typeof t)i[F(t)]=n;else for(r in t)i[F(r)]=t[r];return i},get:function(e,t){return void 0===t?this.cache(e):e[this.expando]&&e[this.expando][F(t)]},access:function(e,t,n){return void 0===t||t&&"string"==typeof t&&void 0===n?this.get(e,t):(this.set(e,t,n),void 0!==n?n:t)},remove:function(e,t){var n,r=e[this.expando];if(void 0!==r){if(void 0!==t){n=(t=Array.isArray(t)?t.map(F):(t=F(t))in r?[t]:t.match(D)||[]).length;while(n--)delete r[t[n]]}(void 0===t||ce.isEmptyObject(r))&&(e.nodeType?e[this.expando]=void 0:delete e[this.expando])}},hasData:function(e){var t=e[this.expando];return void 0!==t&&!ce.isEmptyObject(t)}};var _=new B,z=new B,X=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,U=/[A-Z]/g;function V(e,t,n){var r,i;if(void 0===n&&1===e.nodeType)if(r="data-"+t.replace(U,"-$&").toLowerCase(),"string"==typeof(n=e.getAttribute(r))){try{n="true"===(i=n)||"false"!==i&&("null"===i?null:i===+i+""?+i:X.test(i)?JSON.parse(i):i)}catch(e){}z.set(e,t,n)}else n=void 0;return n}ce.extend({hasData:function(e){return z.hasData(e)||_.hasData(e)},data:function(e,t,n){return z.access(e,t,n)},removeData:function(e,t){z.remove(e,t)},_data:function(e,t,n){return _.access(e,t,n)},_removeData:function(e,t){_.remove(e,t)}}),ce.fn.extend({data:function(n,e){var t,r,i,o=this[0],a=o&&o.attributes;if(void 0===n){if(this.length&&(i=z.get(o),1===o.nodeType&&!_.get(o,"hasDataAttrs"))){t=a.length;while(t--)a[t]&&0===(r=a[t].name).indexOf("data-")&&(r=F(r.slice(5)),V(o,r,i[r]));_.set(o,"hasDataAttrs",!0)}return i}return"object"==typeof n?this.each(function(){z.set(this,n)}):M(this,function(e){var t;if(o&&void 0===e)return void 0!==(t=z.get(o,n))?t:void 0!==(t=V(o,n))?t:void 0;this.each(function(){z.set(this,n,e)})},null,e,1<arguments.length,null,!0)},removeData:function(e){return this.each(function(){z.remove(this,e)})}}),ce.extend({queue:function(e,t,n){var r;if(e)return t=(t||"fx")+"queue",r=_.get(e,t),n&&(!r||Array.isArray(n)?r=_.access(e,t,ce.makeArray(n)):r.push(n)),r||[]},dequeue:function(e,t){t=t||"fx";var n=ce.queue(e,t),r=n.length,i=n.shift(),o=ce._queueHooks(e,t);"inprogress"===i&&(i=n.shift(),r--),i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,function(){ce.dequeue(e,t)},o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return _.get(e,n)||_.access(e,n,{empty:ce.Callbacks("once memory").add(function(){_.remove(e,[t+"queue",n])})})}}),ce.fn.extend({queue:function(t,n){var e=2;return"string"!=typeof t&&(n=t,t="fx",e--),arguments.length<e?ce.queue(this[0],t):void 0===n?this:this.each(function(){var e=ce.queue(this,t,n);ce._queueHooks(this,t),"fx"===t&&"inprogress"!==e[0]&&ce.dequeue(this,t)})},dequeue:function(e){return this.each(function(){ce.dequeue(this,e)})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=ce.Deferred(),o=this,a=this.length,s=function(){--r||i.resolveWith(o,[o])};"string"!=typeof e&&(t=e,e=void 0),e=e||"fx";while(a--)(n=_.get(o[a],e+"queueHooks"))&&n.empty&&(r++,n.empty.add(s));return s(),i.promise(t)}});var G=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,Y=new RegExp("^(?:([+-])=|)("+G+")([a-z%]*)$","i"),Q=["Top","Right","Bottom","Left"],J=C.documentElement,K=function(e){return ce.contains(e.ownerDocument,e)},Z={composed:!0};J.getRootNode&&(K=function(e){return ce.contains(e.ownerDocument,e)||e.getRootNode(Z)===e.ownerDocument});var ee=function(e,t){return"none"===(e=t||e).style.display||""===e.style.display&&K(e)&&"none"===ce.css(e,"display")};function te(e,t,n,r){var i,o,a=20,s=r?function(){return r.cur()}:function(){return ce.css(e,t,"")},u=s(),l=n&&n[3]||(ce.cssNumber[t]?"":"px"),c=e.nodeType&&(ce.cssNumber[t]||"px"!==l&&+u)&&Y.exec(ce.css(e,t));if(c&&c[3]!==l){u/=2,l=l||c[3],c=+u||1;while(a--)ce.style(e,t,c+l),(1-o)*(1-(o=s()/u||.5))<=0&&(a=0),c/=o;c*=2,ce.style(e,t,c+l),n=n||[]}return n&&(c=+c||+u||0,i=n[1]?c+(n[1]+1)*n[2]:+n[2],r&&(r.unit=l,r.start=c,r.end=i)),i}var ne={};function re(e,t){for(var n,r,i,o,a,s,u,l=[],c=0,f=e.length;c<f;c++)(r=e[c]).style&&(n=r.style.display,t?("none"===n&&(l[c]=_.get(r,"display")||null,l[c]||(r.style.display="")),""===r.style.display&&ee(r)&&(l[c]=(u=a=o=void 0,a=(i=r).ownerDocument,s=i.nodeName,(u=ne[s])||(o=a.body.appendChild(a.createElement(s)),u=ce.css(o,"display"),o.parentNode.removeChild(o),"none"===u&&(u="block"),ne[s]=u)))):"none"!==n&&(l[c]="none",_.set(r,"display",n)));for(c=0;c<f;c++)null!=l[c]&&(e[c].style.display=l[c]);return e}ce.fn.extend({show:function(){return re(this,!0)},hide:function(){return re(this)},toggle:function(e){return"boolean"==typeof e?e?this.show():this.hide():this.each(function(){ee(this)?ce(this).show():ce(this).hide()})}});var xe,be,we=/^(?:checkbox|radio)$/i,Te=/<([a-z][^\/\0>\x20\t\r\n\f]*)/i,Ce=/^$|^module$|\/(?:java|ecma)script/i;xe=C.createDocumentFragment().appendChild(C.createElement("div")),(be=C.createElement("input")).setAttribute("type","radio"),be.setAttribute("checked","checked"),be.setAttribute("name","t"),xe.appendChild(be),le.checkClone=xe.cloneNode(!0).cloneNode(!0).lastChild.checked,xe.innerHTML="<textarea>x</textarea>",le.noCloneChecked=!!xe.cloneNode(!0).lastChild.defaultValue,xe.innerHTML="<option></option>",le.option=!!xe.lastChild;var ke={thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};function Se(e,t){var n;return n="undefined"!=typeof e.getElementsByTagName?e.getElementsByTagName(t||"*"):"undefined"!=typeof e.querySelectorAll?e.querySelectorAll(t||"*"):[],void 0===t||t&&fe(e,t)?ce.merge([e],n):n}function Ee(e,t){for(var n=0,r=e.length;n<r;n++)_.set(e[n],"globalEval",!t||_.get(t[n],"globalEval"))}ke.tbody=ke.tfoot=ke.colgroup=ke.caption=ke.thead,ke.th=ke.td,le.option||(ke.optgroup=ke.option=[1,"<select multiple='multiple'>","</select>"]);var je=/<|&#?\w+;/;function Ae(e,t,n,r,i){for(var o,a,s,u,l,c,f=t.createDocumentFragment(),p=[],d=0,h=e.length;d<h;d++)if((o=e[d])||0===o)if("object"===x(o))ce.merge(p,o.nodeType?[o]:o);else if(je.test(o)){a=a||f.appendChild(t.createElement("div")),s=(Te.exec(o)||["",""])[1].toLowerCase(),u=ke[s]||ke._default,a.innerHTML=u[1]+ce.htmlPrefilter(o)+u[2],c=u[0];while(c--)a=a.lastChild;ce.merge(p,a.childNodes),(a=f.firstChild).textContent=""}else p.push(t.createTextNode(o));f.textContent="",d=0;while(o=p[d++])if(r&&-1<ce.inArray(o,r))i&&i.push(o);else if(l=K(o),a=Se(f.appendChild(o),"script"),l&&Ee(a),n){c=0;while(o=a[c++])Ce.test(o.type||"")&&n.push(o)}return f}var De=/^([^.]*)(?:\.(.+)|)/;function Ne(){return!0}function qe(){return!1}function Le(e,t,n,r,i,o){var a,s;if("object"==typeof t){for(s in"string"!=typeof n&&(r=r||n,n=void 0),t)Le(e,s,n,r,t[s],o);return e}if(null==r&&null==i?(i=n,r=n=void 0):null==i&&("string"==typeof n?(i=r,r=void 0):(i=r,r=n,n=void 0)),!1===i)i=qe;else if(!i)return e;return 1===o&&(a=i,(i=function(e){return ce().off(e),a.apply(this,arguments)}).guid=a.guid||(a.guid=ce.guid++)),e.each(function(){ce.event.add(this,t,i,r,n)})}function He(e,r,t){t?(_.set(e,r,!1),ce.event.add(e,r,{namespace:!1,handler:function(e){var t,n=_.get(this,r);if(1&e.isTrigger&&this[r]){if(n)(ce.event.special[r]||{}).delegateType&&e.stopPropagation();else if(n=ae.call(arguments),_.set(this,r,n),this[r](),t=_.get(this,r),_.set(this,r,!1),n!==t)return e.stopImmediatePropagation(),e.preventDefault(),t}else n&&(_.set(this,r,ce.event.trigger(n[0],n.slice(1),this)),e.stopPropagation(),e.isImmediatePropagationStopped=Ne)}})):void 0===_.get(e,r)&&ce.event.add(e,r,Ne)}ce.event={global:{},add:function(t,e,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,v=_.get(t);if($(t)){n.handler&&(n=(o=n).handler,i=o.selector),i&&ce.find.matchesSelector(J,i),n.guid||(n.guid=ce.guid++),(u=v.events)||(u=v.events=Object.create(null)),(a=v.handle)||(a=v.handle=function(e){return"undefined"!=typeof ce&&ce.event.triggered!==e.type?ce.event.dispatch.apply(t,arguments):void 0}),l=(e=(e||"").match(D)||[""]).length;while(l--)d=g=(s=De.exec(e[l])||[])[1],h=(s[2]||"").split(".").sort(),d&&(f=ce.event.special[d]||{},d=(i?f.delegateType:f.bindType)||d,f=ce.event.special[d]||{},c=ce.extend({type:d,origType:g,data:r,handler:n,guid:n.guid,selector:i,needsContext:i&&ce.expr.match.needsContext.test(i),namespace:h.join(".")},o),(p=u[d])||((p=u[d]=[]).delegateCount=0,f.setup&&!1!==f.setup.call(t,r,h,a)||t.addEventListener&&t.addEventListener(d,a)),f.add&&(f.add.call(t,c),c.handler.guid||(c.handler.guid=n.guid)),i?p.splice(p.delegateCount++,0,c):p.push(c),ce.event.global[d]=!0)}},remove:function(e,t,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,v=_.hasData(e)&&_.get(e);if(v&&(u=v.events)){l=(t=(t||"").match(D)||[""]).length;while(l--)if(d=g=(s=De.exec(t[l])||[])[1],h=(s[2]||"").split(".").sort(),d){f=ce.event.special[d]||{},p=u[d=(r?f.delegateType:f.bindType)||d]||[],s=s[2]&&new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"),a=o=p.length;while(o--)c=p[o],!i&&g!==c.origType||n&&n.guid!==c.guid||s&&!s.test(c.namespace)||r&&r!==c.selector&&("**"!==r||!c.selector)||(p.splice(o,1),c.selector&&p.delegateCount--,f.remove&&f.remove.call(e,c));a&&!p.length&&(f.teardown&&!1!==f.teardown.call(e,h,v.handle)||ce.removeEvent(e,d,v.handle),delete u[d])}else for(d in u)ce.event.remove(e,d+t[l],n,r,!0);ce.isEmptyObject(u)&&_.remove(e,"handle events")}},dispatch:function(e){var t,n,r,i,o,a,s=new Array(arguments.length),u=ce.event.fix(e),l=(_.get(this,"events")||Object.create(null))[u.type]||[],c=ce.event.special[u.type]||{};for(s[0]=u,t=1;t<arguments.length;t++)s[t]=arguments[t];if(u.delegateTarget=this,!c.preDispatch||!1!==c.preDispatch.call(this,u)){a=ce.event.handlers.call(this,u,l),t=0;while((i=a[t++])&&!u.isPropagationStopped()){u.currentTarget=i.elem,n=0;while((o=i.handlers[n++])&&!u.isImmediatePropagationStopped())u.rnamespace&&!1!==o.namespace&&!u.rnamespace.test(o.namespace)||(u.handleObj=o,u.data=o.data,void 0!==(r=((ce.event.special[o.origType]||{}).handle||o.handler).apply(i.elem,s))&&!1===(u.result=r)&&(u.preventDefault(),u.stopPropagation()))}return c.postDispatch&&c.postDispatch.call(this,u),u.result}},handlers:function(e,t){var n,r,i,o,a,s=[],u=t.delegateCount,l=e.target;if(u&&l.nodeType&&!("click"===e.type&&1<=e.button))for(;l!==this;l=l.parentNode||this)if(1===l.nodeType&&("click"!==e.type||!0!==l.disabled)){for(o=[],a={},n=0;n<u;n++)void 0===a[i=(r=t[n]).selector+" "]&&(a[i]=r.needsContext?-1<ce(i,this).index(l):ce.find(i,this,null,[l]).length),a[i]&&o.push(r);o.length&&s.push({elem:l,handlers:o})}return l=this,u<t.length&&s.push({elem:l,handlers:t.slice(u)}),s},addProp:function(t,e){Object.defineProperty(ce.Event.prototype,t,{enumerable:!0,configurable:!0,get:v(e)?function(){if(this.originalEvent)return e(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[t]},set:function(e){Object.defineProperty(this,t,{enumerable:!0,configurable:!0,writable:!0,value:e})}})},fix:function(e){return e[ce.expando]?e:new ce.Event(e)},special:{load:{noBubble:!0},click:{setup:function(e){var t=this||e;return we.test(t.type)&&t.click&&fe(t,"input")&&He(t,"click",!0),!1},trigger:function(e){var t=this||e;return we.test(t.type)&&t.click&&fe(t,"input")&&He(t,"click"),!0},_default:function(e){var t=e.target;return we.test(t.type)&&t.click&&fe(t,"input")&&_.get(t,"click")||fe(t,"a")}},beforeunload:{postDispatch:function(e){void 0!==e.result&&e.originalEvent&&(e.originalEvent.returnValue=e.result)}}}},ce.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n)},ce.Event=function(e,t){if(!(this instanceof ce.Event))return new ce.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||void 0===e.defaultPrevented&&!1===e.returnValue?Ne:qe,this.target=e.target&&3===e.target.nodeType?e.target.parentNode:e.target,this.currentTarget=e.currentTarget,this.relatedTarget=e.relatedTarget):this.type=e,t&&ce.extend(this,t),this.timeStamp=e&&e.timeStamp||Date.now(),this[ce.expando]=!0},ce.Event.prototype={constructor:ce.Event,isDefaultPrevented:qe,isPropagationStopped:qe,isImmediatePropagationStopped:qe,isSimulated:!1,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=Ne,e&&!this.isSimulated&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=Ne,e&&!this.isSimulated&&e.stopPropagation()},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=Ne,e&&!this.isSimulated&&e.stopImmediatePropagation(),this.stopPropagation()}},ce.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,"char":!0,code:!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:!0},ce.event.addProp),ce.each({focus:"focusin",blur:"focusout"},function(r,i){function o(e){if(C.documentMode){var t=_.get(this,"handle"),n=ce.event.fix(e);n.type="focusin"===e.type?"focus":"blur",n.isSimulated=!0,t(e),n.target===n.currentTarget&&t(n)}else ce.event.simulate(i,e.target,ce.event.fix(e))}ce.event.special[r]={setup:function(){var e;if(He(this,r,!0),!C.documentMode)return!1;(e=_.get(this,i))||this.addEventListener(i,o),_.set(this,i,(e||0)+1)},trigger:function(){return He(this,r),!0},teardown:function(){var e;if(!C.documentMode)return!1;(e=_.get(this,i)-1)?_.set(this,i,e):(this.removeEventListener(i,o),_.remove(this,i))},_default:function(e){return _.get(e.target,r)},delegateType:i},ce.event.special[i]={setup:function(){var e=this.ownerDocument||this.document||this,t=C.documentMode?this:e,n=_.get(t,i);n||(C.documentMode?this.addEventListener(i,o):e.addEventListener(r,o,!0)),_.set(t,i,(n||0)+1)},teardown:function(){var e=this.ownerDocument||this.document||this,t=C.documentMode?this:e,n=_.get(t,i)-1;n?_.set(t,i,n):(C.documentMode?this.removeEventListener(i,o):e.removeEventListener(r,o,!0),_.remove(t,i))}}}),ce.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(e,i){ce.event.special[e]={delegateType:i,bindType:i,handle:function(e){var t,n=e.relatedTarget,r=e.handleObj;return n&&(n===this||ce.contains(this,n))||(e.type=r.origType,t=r.handler.apply(this,arguments),e.type=i),t}}}),ce.fn.extend({on:function(e,t,n,r){return Le(this,e,t,n,r)},one:function(e,t,n,r){return Le(this,e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,ce(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if("object"==typeof e){for(i in e)this.off(i,t,e[i]);return this}return!1!==t&&"function"!=typeof t||(n=t,t=void 0),!1===n&&(n=qe),this.each(function(){ce.event.remove(this,e,n,t)})}});var Oe=/<script|<style|<link/i,Pe=/checked\s*(?:[^=]|=\s*.checked.)/i,Me=/^\s*<!\[CDATA\[|\]\]>\s*$/g;function Re(e,t){return fe(e,"table")&&fe(11!==t.nodeType?t:t.firstChild,"tr")&&ce(e).children("tbody")[0]||e}function Ie(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function We(e){return"true/"===(e.type||"").slice(0,5)?e.type=e.type.slice(5):e.removeAttribute("type"),e}function Fe(e,t){var n,r,i,o,a,s;if(1===t.nodeType){if(_.hasData(e)&&(s=_.get(e).events))for(i in _.remove(t,"handle events"),s)for(n=0,r=s[i].length;n<r;n++)ce.event.add(t,i,s[i][n]);z.hasData(e)&&(o=z.access(e),a=ce.extend({},o),z.set(t,a))}}function $e(n,r,i,o){r=g(r);var e,t,a,s,u,l,c=0,f=n.length,p=f-1,d=r[0],h=v(d);if(h||1<f&&"string"==typeof d&&!le.checkClone&&Pe.test(d))return n.each(function(e){var t=n.eq(e);h&&(r[0]=d.call(this,e,t.html())),$e(t,r,i,o)});if(f&&(t=(e=Ae(r,n[0].ownerDocument,!1,n,o)).firstChild,1===e.childNodes.length&&(e=t),t||o)){for(s=(a=ce.map(Se(e,"script"),Ie)).length;c<f;c++)u=e,c!==p&&(u=ce.clone(u,!0,!0),s&&ce.merge(a,Se(u,"script"))),i.call(n[c],u,c);if(s)for(l=a[a.length-1].ownerDocument,ce.map(a,We),c=0;c<s;c++)u=a[c],Ce.test(u.type||"")&&!_.access(u,"globalEval")&&ce.contains(l,u)&&(u.src&&"module"!==(u.type||"").toLowerCase()?ce._evalUrl&&!u.noModule&&ce._evalUrl(u.src,{nonce:u.nonce||u.getAttribute("nonce")},l):m(u.textContent.replace(Me,""),u,l))}return n}function Be(e,t,n){for(var r,i=t?ce.filter(t,e):e,o=0;null!=(r=i[o]);o++)n||1!==r.nodeType||ce.cleanData(Se(r)),r.parentNode&&(n&&K(r)&&Ee(Se(r,"script")),r.parentNode.removeChild(r));return e}ce.extend({htmlPrefilter:function(e){return e},clone:function(e,t,n){var r,i,o,a,s,u,l,c=e.cloneNode(!0),f=K(e);if(!(le.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||ce.isXMLDoc(e)))for(a=Se(c),r=0,i=(o=Se(e)).length;r<i;r++)s=o[r],u=a[r],void 0,"input"===(l=u.nodeName.toLowerCase())&&we.test(s.type)?u.checked=s.checked:"input"!==l&&"textarea"!==l||(u.defaultValue=s.defaultValue);if(t)if(n)for(o=o||Se(e),a=a||Se(c),r=0,i=o.length;r<i;r++)Fe(o[r],a[r]);else Fe(e,c);return 0<(a=Se(c,"script")).length&&Ee(a,!f&&Se(e,"script")),c},cleanData:function(e){for(var t,n,r,i=ce.event.special,o=0;void 0!==(n=e[o]);o++)if($(n)){if(t=n[_.expando]){if(t.events)for(r in t.events)i[r]?ce.event.remove(n,r):ce.removeEvent(n,r,t.handle);n[_.expando]=void 0}n[z.expando]&&(n[z.expando]=void 0)}}}),ce.fn.extend({detach:function(e){return Be(this,e,!0)},remove:function(e){return Be(this,e)},text:function(e){return M(this,function(e){return void 0===e?ce.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=e)})},null,e,arguments.length)},append:function(){return $e(this,arguments,function(e){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||Re(this,e).appendChild(e)})},prepend:function(){return $e(this,arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=Re(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return $e(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return $e(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},empty:function(){for(var e,t=0;null!=(e=this[t]);t++)1===e.nodeType&&(ce.cleanData(Se(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null!=e&&e,t=null==t?e:t,this.map(function(){return ce.clone(this,e,t)})},html:function(e){return M(this,function(e){var t=this[0]||{},n=0,r=this.length;if(void 0===e&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!Oe.test(e)&&!ke[(Te.exec(e)||["",""])[1].toLowerCase()]){e=ce.htmlPrefilter(e);try{for(;n<r;n++)1===(t=this[n]||{}).nodeType&&(ce.cleanData(Se(t,!1)),t.innerHTML=e);t=0}catch(e){}}t&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var n=[];return $e(this,arguments,function(e){var t=this.parentNode;ce.inArray(this,n)<0&&(ce.cleanData(Se(this)),t&&t.replaceChild(e,this))},n)}}),ce.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,a){ce.fn[e]=function(e){for(var t,n=[],r=ce(e),i=r.length-1,o=0;o<=i;o++)t=o===i?this:this.clone(!0),ce(r[o])[a](t),s.apply(n,t.get());return this.pushStack(n)}});var _e=new RegExp("^("+G+")(?!px)[a-z%]+$","i"),ze=/^--/,Xe=function(e){var t=e.ownerDocument.defaultView;return t&&t.opener||(t=ie),t.getComputedStyle(e)},Ue=function(e,t,n){var r,i,o={};for(i in t)o[i]=e.style[i],e.style[i]=t[i];for(i in r=n.call(e),t)e.style[i]=o[i];return r},Ve=new RegExp(Q.join("|"),"i");function Ge(e,t,n){var r,i,o,a,s=ze.test(t),u=e.style;return(n=n||Xe(e))&&(a=n.getPropertyValue(t)||n[t],s&&a&&(a=a.replace(ve,"$1")||void 0),""!==a||K(e)||(a=ce.style(e,t)),!le.pixelBoxStyles()&&_e.test(a)&&Ve.test(t)&&(r=u.width,i=u.minWidth,o=u.maxWidth,u.minWidth=u.maxWidth=u.width=a,a=n.width,u.width=r,u.minWidth=i,u.maxWidth=o)),void 0!==a?a+"":a}function Ye(e,t){return{get:function(){if(!e())return(this.get=t).apply(this,arguments);delete this.get}}}!function(){function e(){if(l){u.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",l.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",J.appendChild(u).appendChild(l);var e=ie.getComputedStyle(l);n="1%"!==e.top,s=12===t(e.marginLeft),l.style.right="60%",o=36===t(e.right),r=36===t(e.width),l.style.position="absolute",i=12===t(l.offsetWidth/3),J.removeChild(u),l=null}}function t(e){return Math.round(parseFloat(e))}var n,r,i,o,a,s,u=C.createElement("div"),l=C.createElement("div");l.style&&(l.style.backgroundClip="content-box",l.cloneNode(!0).style.backgroundClip="",le.clearCloneStyle="content-box"===l.style.backgroundClip,ce.extend(le,{boxSizingReliable:function(){return e(),r},pixelBoxStyles:function(){return e(),o},pixelPosition:function(){return e(),n},reliableMarginLeft:function(){return e(),s},scrollboxSize:function(){return e(),i},reliableTrDimensions:function(){var e,t,n,r;return null==a&&(e=C.createElement("table"),t=C.createElement("tr"),n=C.createElement("div"),e.style.cssText="position:absolute;left:-11111px;border-collapse:separate",t.style.cssText="box-sizing:content-box;border:1px solid",t.style.height="1px",n.style.height="9px",n.style.display="block",J.appendChild(e).appendChild(t).appendChild(n),r=ie.getComputedStyle(t),a=parseInt(r.height,10)+parseInt(r.borderTopWidth,10)+parseInt(r.borderBottomWidth,10)===t.offsetHeight,J.removeChild(e)),a}}))}();var Qe=["Webkit","Moz","ms"],Je=C.createElement("div").style,Ke={};function Ze(e){var t=ce.cssProps[e]||Ke[e];return t||(e in Je?e:Ke[e]=function(e){var t=e[0].toUpperCase()+e.slice(1),n=Qe.length;while(n--)if((e=Qe[n]+t)in Je)return e}(e)||e)}var et=/^(none|table(?!-c[ea]).+)/,tt={position:"absolute",visibility:"hidden",display:"block"},nt={letterSpacing:"0",fontWeight:"400"};function rt(e,t,n){var r=Y.exec(t);return r?Math.max(0,r[2]-(n||0))+(r[3]||"px"):t}function it(e,t,n,r,i,o){var a="width"===t?1:0,s=0,u=0,l=0;if(n===(r?"border":"content"))return 0;for(;a<4;a+=2)"margin"===n&&(l+=ce.css(e,n+Q[a],!0,i)),r?("content"===n&&(u-=ce.css(e,"padding"+Q[a],!0,i)),"margin"!==n&&(u-=ce.css(e,"border"+Q[a]+"Width",!0,i))):(u+=ce.css(e,"padding"+Q[a],!0,i),"padding"!==n?u+=ce.css(e,"border"+Q[a]+"Width",!0,i):s+=ce.css(e,"border"+Q[a]+"Width",!0,i));return!r&&0<=o&&(u+=Math.max(0,Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-o-u-s-.5))||0),u+l}function ot(e,t,n){var r=Xe(e),i=(!le.boxSizingReliable()||n)&&"border-box"===ce.css(e,"boxSizing",!1,r),o=i,a=Ge(e,t,r),s="offset"+t[0].toUpperCase()+t.slice(1);if(_e.test(a)){if(!n)return a;a="auto"}return(!le.boxSizingReliable()&&i||!le.reliableTrDimensions()&&fe(e,"tr")||"auto"===a||!parseFloat(a)&&"inline"===ce.css(e,"display",!1,r))&&e.getClientRects().length&&(i="border-box"===ce.css(e,"boxSizing",!1,r),(o=s in e)&&(a=e[s])),(a=parseFloat(a)||0)+it(e,t,n||(i?"border":"content"),o,r,a)+"px"}function at(e,t,n,r,i){return new at.prototype.init(e,t,n,r,i)}ce.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Ge(e,"opacity");return""===n?"1":n}}}},cssNumber:{animationIterationCount:!0,aspectRatio:!0,borderImageSlice:!0,columnCount:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,gridArea:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnStart:!0,gridRow:!0,gridRowEnd:!0,gridRowStart:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,scale:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeMiterlimit:!0,strokeOpacity:!0},cssProps:{},style:function(e,t,n,r){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var i,o,a,s=F(t),u=ze.test(t),l=e.style;if(u||(t=Ze(s)),a=ce.cssHooks[t]||ce.cssHooks[s],void 0===n)return a&&"get"in a&&void 0!==(i=a.get(e,!1,r))?i:l[t];"string"===(o=typeof n)&&(i=Y.exec(n))&&i[1]&&(n=te(e,t,i),o="number"),null!=n&&n==n&&("number"!==o||u||(n+=i&&i[3]||(ce.cssNumber[s]?"":"px")),le.clearCloneStyle||""!==n||0!==t.indexOf("background")||(l[t]="inherit"),a&&"set"in a&&void 0===(n=a.set(e,n,r))||(u?l.setProperty(t,n):l[t]=n))}},css:function(e,t,n,r){var i,o,a,s=F(t);return ze.test(t)||(t=Ze(s)),(a=ce.cssHooks[t]||ce.cssHooks[s])&&"get"in a&&(i=a.get(e,!0,n)),void 0===i&&(i=Ge(e,t,r)),"normal"===i&&t in nt&&(i=nt[t]),""===n||n?(o=parseFloat(i),!0===n||isFinite(o)?o||0:i):i}}),ce.each(["height","width"],function(e,u){ce.cssHooks[u]={get:function(e,t,n){if(t)return!et.test(ce.css(e,"display"))||e.getClientRects().length&&e.getBoundingClientRect().width?ot(e,u,n):Ue(e,tt,function(){return ot(e,u,n)})},set:function(e,t,n){var r,i=Xe(e),o=!le.scrollboxSize()&&"absolute"===i.position,a=(o||n)&&"border-box"===ce.css(e,"boxSizing",!1,i),s=n?it(e,u,n,a,i):0;return a&&o&&(s-=Math.ceil(e["offset"+u[0].toUpperCase()+u.slice(1)]-parseFloat(i[u])-it(e,u,"border",!1,i)-.5)),s&&(r=Y.exec(t))&&"px"!==(r[3]||"px")&&(e.style[u]=t,t=ce.css(e,u)),rt(0,t,s)}}}),ce.cssHooks.marginLeft=Ye(le.reliableMarginLeft,function(e,t){if(t)return(parseFloat(Ge(e,"marginLeft"))||e.getBoundingClientRect().left-Ue(e,{marginLeft:0},function(){return e.getBoundingClientRect().left}))+"px"}),ce.each({margin:"",padding:"",border:"Width"},function(i,o){ce.cssHooks[i+o]={expand:function(e){for(var t=0,n={},r="string"==typeof e?e.split(" "):[e];t<4;t++)n[i+Q[t]+o]=r[t]||r[t-2]||r[0];return n}},"margin"!==i&&(ce.cssHooks[i+o].set=rt)}),ce.fn.extend({css:function(e,t){return M(this,function(e,t,n){var r,i,o={},a=0;if(Array.isArray(t)){for(r=Xe(e),i=t.length;a<i;a++)o[t[a]]=ce.css(e,t[a],!1,r);return o}return void 0!==n?ce.style(e,t,n):ce.css(e,t)},e,t,1<arguments.length)}}),((ce.Tween=at).prototype={constructor:at,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||ce.easing._default,this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(ce.cssNumber[n]?"":"px")},cur:function(){var e=at.propHooks[this.prop];return e&&e.get?e.get(this):at.propHooks._default.get(this)},run:function(e){var t,n=at.propHooks[this.prop];return this.options.duration?this.pos=t=ce.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):at.propHooks._default.set(this),this}}).init.prototype=at.prototype,(at.propHooks={_default:{get:function(e){var t;return 1!==e.elem.nodeType||null!=e.elem[e.prop]&&null==e.elem.style[e.prop]?e.elem[e.prop]:(t=ce.css(e.elem,e.prop,""))&&"auto"!==t?t:0},set:function(e){ce.fx.step[e.prop]?ce.fx.step[e.prop](e):1!==e.elem.nodeType||!ce.cssHooks[e.prop]&&null==e.elem.style[Ze(e.prop)]?e.elem[e.prop]=e.now:ce.style(e.elem,e.prop,e.now+e.unit)}}}).scrollTop=at.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},ce.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},_default:"swing"},ce.fx=at.prototype.init,ce.fx.step={};var st,ut,lt,ct,ft=/^(?:toggle|show|hide)$/,pt=/queueHooks$/;function dt(){ut&&(!1===C.hidden&&ie.requestAnimationFrame?ie.requestAnimationFrame(dt):ie.setTimeout(dt,ce.fx.interval),ce.fx.tick())}function ht(){return ie.setTimeout(function(){st=void 0}),st=Date.now()}function gt(e,t){var n,r=0,i={height:e};for(t=t?1:0;r<4;r+=2-t)i["margin"+(n=Q[r])]=i["padding"+n]=e;return t&&(i.opacity=i.width=e),i}function vt(e,t,n){for(var r,i=(yt.tweeners[t]||[]).concat(yt.tweeners["*"]),o=0,a=i.length;o<a;o++)if(r=i[o].call(n,t,e))return r}function yt(o,e,t){var n,a,r=0,i=yt.prefilters.length,s=ce.Deferred().always(function(){delete u.elem}),u=function(){if(a)return!1;for(var e=st||ht(),t=Math.max(0,l.startTime+l.duration-e),n=1-(t/l.duration||0),r=0,i=l.tweens.length;r<i;r++)l.tweens[r].run(n);return s.notifyWith(o,[l,n,t]),n<1&&i?t:(i||s.notifyWith(o,[l,1,0]),s.resolveWith(o,[l]),!1)},l=s.promise({elem:o,props:ce.extend({},e),opts:ce.extend(!0,{specialEasing:{},easing:ce.easing._default},t),originalProperties:e,originalOptions:t,startTime:st||ht(),duration:t.duration,tweens:[],createTween:function(e,t){var n=ce.Tween(o,l.opts,e,t,l.opts.specialEasing[e]||l.opts.easing);return l.tweens.push(n),n},stop:function(e){var t=0,n=e?l.tweens.length:0;if(a)return this;for(a=!0;t<n;t++)l.tweens[t].run(1);return e?(s.notifyWith(o,[l,1,0]),s.resolveWith(o,[l,e])):s.rejectWith(o,[l,e]),this}}),c=l.props;for(!function(e,t){var n,r,i,o,a;for(n in e)if(i=t[r=F(n)],o=e[n],Array.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),(a=ce.cssHooks[r])&&"expand"in a)for(n in o=a.expand(o),delete e[r],o)n in e||(e[n]=o[n],t[n]=i);else t[r]=i}(c,l.opts.specialEasing);r<i;r++)if(n=yt.prefilters[r].call(l,o,c,l.opts))return v(n.stop)&&(ce._queueHooks(l.elem,l.opts.queue).stop=n.stop.bind(n)),n;return ce.map(c,vt,l),v(l.opts.start)&&l.opts.start.call(o,l),l.progress(l.opts.progress).done(l.opts.done,l.opts.complete).fail(l.opts.fail).always(l.opts.always),ce.fx.timer(ce.extend(u,{elem:o,anim:l,queue:l.opts.queue})),l}ce.Animation=ce.extend(yt,{tweeners:{"*":[function(e,t){var n=this.createTween(e,t);return te(n.elem,e,Y.exec(t),n),n}]},tweener:function(e,t){v(e)?(t=e,e=["*"]):e=e.match(D);for(var n,r=0,i=e.length;r<i;r++)n=e[r],yt.tweeners[n]=yt.tweeners[n]||[],yt.tweeners[n].unshift(t)},prefilters:[function(e,t,n){var r,i,o,a,s,u,l,c,f="width"in t||"height"in t,p=this,d={},h=e.style,g=e.nodeType&&ee(e),v=_.get(e,"fxshow");for(r in n.queue||(null==(a=ce._queueHooks(e,"fx")).unqueued&&(a.unqueued=0,s=a.empty.fire,a.empty.fire=function(){a.unqueued||s()}),a.unqueued++,p.always(function(){p.always(function(){a.unqueued--,ce.queue(e,"fx").length||a.empty.fire()})})),t)if(i=t[r],ft.test(i)){if(delete t[r],o=o||"toggle"===i,i===(g?"hide":"show")){if("show"!==i||!v||void 0===v[r])continue;g=!0}d[r]=v&&v[r]||ce.style(e,r)}if((u=!ce.isEmptyObject(t))||!ce.isEmptyObject(d))for(r in f&&1===e.nodeType&&(n.overflow=[h.overflow,h.overflowX,h.overflowY],null==(l=v&&v.display)&&(l=_.get(e,"display")),"none"===(c=ce.css(e,"display"))&&(l?c=l:(re([e],!0),l=e.style.display||l,c=ce.css(e,"display"),re([e]))),("inline"===c||"inline-block"===c&&null!=l)&&"none"===ce.css(e,"float")&&(u||(p.done(function(){h.display=l}),null==l&&(c=h.display,l="none"===c?"":c)),h.display="inline-block")),n.overflow&&(h.overflow="hidden",p.always(function(){h.overflow=n.overflow[0],h.overflowX=n.overflow[1],h.overflowY=n.overflow[2]})),u=!1,d)u||(v?"hidden"in v&&(g=v.hidden):v=_.access(e,"fxshow",{display:l}),o&&(v.hidden=!g),g&&re([e],!0),p.done(function(){for(r in g||re([e]),_.remove(e,"fxshow"),d)ce.style(e,r,d[r])})),u=vt(g?v[r]:0,r,p),r in v||(v[r]=u.start,g&&(u.end=u.start,u.start=0))}],prefilter:function(e,t){t?yt.prefilters.unshift(e):yt.prefilters.push(e)}}),ce.speed=function(e,t,n){var r=e&&"object"==typeof e?ce.extend({},e):{complete:n||!n&&t||v(e)&&e,duration:e,easing:n&&t||t&&!v(t)&&t};return ce.fx.off?r.duration=0:"number"!=typeof r.duration&&(r.duration in ce.fx.speeds?r.duration=ce.fx.speeds[r.duration]:r.duration=ce.fx.speeds._default),null!=r.queue&&!0!==r.queue||(r.queue="fx"),r.old=r.complete,r.complete=function(){v(r.old)&&r.old.call(this),r.queue&&ce.dequeue(this,r.queue)},r},ce.fn.extend({fadeTo:function(e,t,n,r){return this.filter(ee).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(t,e,n,r){var i=ce.isEmptyObject(t),o=ce.speed(e,n,r),a=function(){var e=yt(this,ce.extend({},t),o);(i||_.get(this,"finish"))&&e.stop(!0)};return a.finish=a,i||!1===o.queue?this.each(a):this.queue(o.queue,a)},stop:function(i,e,o){var a=function(e){var t=e.stop;delete e.stop,t(o)};return"string"!=typeof i&&(o=e,e=i,i=void 0),e&&this.queue(i||"fx",[]),this.each(function(){var e=!0,t=null!=i&&i+"queueHooks",n=ce.timers,r=_.get(this);if(t)r[t]&&r[t].stop&&a(r[t]);else for(t in r)r[t]&&r[t].stop&&pt.test(t)&&a(r[t]);for(t=n.length;t--;)n[t].elem!==this||null!=i&&n[t].queue!==i||(n[t].anim.stop(o),e=!1,n.splice(t,1));!e&&o||ce.dequeue(this,i)})},finish:function(a){return!1!==a&&(a=a||"fx"),this.each(function(){var e,t=_.get(this),n=t[a+"queue"],r=t[a+"queueHooks"],i=ce.timers,o=n?n.length:0;for(t.finish=!0,ce.queue(this,a,[]),r&&r.stop&&r.stop.call(this,!0),e=i.length;e--;)i[e].elem===this&&i[e].queue===a&&(i[e].anim.stop(!0),i.splice(e,1));for(e=0;e<o;e++)n[e]&&n[e].finish&&n[e].finish.call(this);delete t.finish})}}),ce.each(["toggle","show","hide"],function(e,r){var i=ce.fn[r];ce.fn[r]=function(e,t,n){return null==e||"boolean"==typeof e?i.apply(this,arguments):this.animate(gt(r,!0),e,t,n)}}),ce.each({slideDown:gt("show"),slideUp:gt("hide"),slideToggle:gt("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,r){ce.fn[e]=function(e,t,n){return this.animate(r,e,t,n)}}),ce.timers=[],ce.fx.tick=function(){var e,t=0,n=ce.timers;for(st=Date.now();t<n.length;t++)(e=n[t])()||n[t]!==e||n.splice(t--,1);n.length||ce.fx.stop(),st=void 0},ce.fx.timer=function(e){ce.timers.push(e),ce.fx.start()},ce.fx.interval=13,ce.fx.start=function(){ut||(ut=!0,dt())},ce.fx.stop=function(){ut=null},ce.fx.speeds={slow:600,fast:200,_default:400},ce.fn.delay=function(r,e){return r=ce.fx&&ce.fx.speeds[r]||r,e=e||"fx",this.queue(e,function(e,t){var n=ie.setTimeout(e,r);t.stop=function(){ie.clearTimeout(n)}})},lt=C.createElement("input"),ct=C.createElement("select").appendChild(C.createElement("option")),lt.type="checkbox",le.checkOn=""!==lt.value,le.optSelected=ct.selected,(lt=C.createElement("input")).value="t",lt.type="radio",le.radioValue="t"===lt.value;var mt,xt=ce.expr.attrHandle;ce.fn.extend({attr:function(e,t){return M(this,ce.attr,e,t,1<arguments.length)},removeAttr:function(e){return this.each(function(){ce.removeAttr(this,e)})}}),ce.extend({attr:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return"undefined"==typeof e.getAttribute?ce.prop(e,t,n):(1===o&&ce.isXMLDoc(e)||(i=ce.attrHooks[t.toLowerCase()]||(ce.expr.match.bool.test(t)?mt:void 0)),void 0!==n?null===n?void ce.removeAttr(e,t):i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:(e.setAttribute(t,n+""),n):i&&"get"in i&&null!==(r=i.get(e,t))?r:null==(r=ce.find.attr(e,t))?void 0:r)},attrHooks:{type:{set:function(e,t){if(!le.radioValue&&"radio"===t&&fe(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},removeAttr:function(e,t){var n,r=0,i=t&&t.match(D);if(i&&1===e.nodeType)while(n=i[r++])e.removeAttribute(n)}}),mt={set:function(e,t,n){return!1===t?ce.removeAttr(e,n):e.setAttribute(n,n),n}},ce.each(ce.expr.match.bool.source.match(/\w+/g),function(e,t){var a=xt[t]||ce.find.attr;xt[t]=function(e,t,n){var r,i,o=t.toLowerCase();return n||(i=xt[o],xt[o]=r,r=null!=a(e,t,n)?o:null,xt[o]=i),r}});var bt=/^(?:input|select|textarea|button)$/i,wt=/^(?:a|area)$/i;function Tt(e){return(e.match(D)||[]).join(" ")}function Ct(e){return e.getAttribute&&e.getAttribute("class")||""}function kt(e){return Array.isArray(e)?e:"string"==typeof e&&e.match(D)||[]}ce.fn.extend({prop:function(e,t){return M(this,ce.prop,e,t,1<arguments.length)},removeProp:function(e){return this.each(function(){delete this[ce.propFix[e]||e]})}}),ce.extend({prop:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return 1===o&&ce.isXMLDoc(e)||(t=ce.propFix[t]||t,i=ce.propHooks[t]),void 0!==n?i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:e[t]=n:i&&"get"in i&&null!==(r=i.get(e,t))?r:e[t]},propHooks:{tabIndex:{get:function(e){var t=ce.find.attr(e,"tabindex");return t?parseInt(t,10):bt.test(e.nodeName)||wt.test(e.nodeName)&&e.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),le.optSelected||(ce.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null},set:function(e){var t=e.parentNode;t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex)}}),ce.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){ce.propFix[this.toLowerCase()]=this}),ce.fn.extend({addClass:function(t){var e,n,r,i,o,a;return v(t)?this.each(function(e){ce(this).addClass(t.call(this,e,Ct(this)))}):(e=kt(t)).length?this.each(function(){if(r=Ct(this),n=1===this.nodeType&&" "+Tt(r)+" "){for(o=0;o<e.length;o++)i=e[o],n.indexOf(" "+i+" ")<0&&(n+=i+" ");a=Tt(n),r!==a&&this.setAttribute("class",a)}}):this},removeClass:function(t){var e,n,r,i,o,a;return v(t)?this.each(function(e){ce(this).removeClass(t.call(this,e,Ct(this)))}):arguments.length?(e=kt(t)).length?this.each(function(){if(r=Ct(this),n=1===this.nodeType&&" "+Tt(r)+" "){for(o=0;o<e.length;o++){i=e[o];while(-1<n.indexOf(" "+i+" "))n=n.replace(" "+i+" "," ")}a=Tt(n),r!==a&&this.setAttribute("class",a)}}):this:this.attr("class","")},toggleClass:function(t,n){var e,r,i,o,a=typeof t,s="string"===a||Array.isArray(t);return v(t)?this.each(function(e){ce(this).toggleClass(t.call(this,e,Ct(this),n),n)}):"boolean"==typeof n&&s?n?this.addClass(t):this.removeClass(t):(e=kt(t),this.each(function(){if(s)for(o=ce(this),i=0;i<e.length;i++)r=e[i],o.hasClass(r)?o.removeClass(r):o.addClass(r);else void 0!==t&&"boolean"!==a||((r=Ct(this))&&_.set(this,"__className__",r),this.setAttribute&&this.setAttribute("class",r||!1===t?"":_.get(this,"__className__")||""))}))},hasClass:function(e){var t,n,r=0;t=" "+e+" ";while(n=this[r++])if(1===n.nodeType&&-1<(" "+Tt(Ct(n))+" ").indexOf(t))return!0;return!1}});var St=/\r/g;ce.fn.extend({val:function(n){var r,e,i,t=this[0];return arguments.length?(i=v(n),this.each(function(e){var t;1===this.nodeType&&(null==(t=i?n.call(this,e,ce(this).val()):n)?t="":"number"==typeof t?t+="":Array.isArray(t)&&(t=ce.map(t,function(e){return null==e?"":e+""})),(r=ce.valHooks[this.type]||ce.valHooks[this.nodeName.toLowerCase()])&&"set"in r&&void 0!==r.set(this,t,"value")||(this.value=t))})):t?(r=ce.valHooks[t.type]||ce.valHooks[t.nodeName.toLowerCase()])&&"get"in r&&void 0!==(e=r.get(t,"value"))?e:"string"==typeof(e=t.value)?e.replace(St,""):null==e?"":e:void 0}}),ce.extend({valHooks:{option:{get:function(e){var t=ce.find.attr(e,"value");return null!=t?t:Tt(ce.text(e))}},select:{get:function(e){var t,n,r,i=e.options,o=e.selectedIndex,a="select-one"===e.type,s=a?null:[],u=a?o+1:i.length;for(r=o<0?u:a?o:0;r<u;r++)if(((n=i[r]).selected||r===o)&&!n.disabled&&(!n.parentNode.disabled||!fe(n.parentNode,"optgroup"))){if(t=ce(n).val(),a)return t;s.push(t)}return s},set:function(e,t){var n,r,i=e.options,o=ce.makeArray(t),a=i.length;while(a--)((r=i[a]).selected=-1<ce.inArray(ce.valHooks.option.get(r),o))&&(n=!0);return n||(e.selectedIndex=-1),o}}}}),ce.each(["radio","checkbox"],function(){ce.valHooks[this]={set:function(e,t){if(Array.isArray(t))return e.checked=-1<ce.inArray(ce(e).val(),t)}},le.checkOn||(ce.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})});var Et=ie.location,jt={guid:Date.now()},At=/\?/;ce.parseXML=function(e){var t,n;if(!e||"string"!=typeof e)return null;try{t=(new ie.DOMParser).parseFromString(e,"text/xml")}catch(e){}return n=t&&t.getElementsByTagName("parsererror")[0],t&&!n||ce.error("Invalid XML: "+(n?ce.map(n.childNodes,function(e){return e.textContent}).join("\n"):e)),t};var Dt=/^(?:focusinfocus|focusoutblur)$/,Nt=function(e){e.stopPropagation()};ce.extend(ce.event,{trigger:function(e,t,n,r){var i,o,a,s,u,l,c,f,p=[n||C],d=ue.call(e,"type")?e.type:e,h=ue.call(e,"namespace")?e.namespace.split("."):[];if(o=f=a=n=n||C,3!==n.nodeType&&8!==n.nodeType&&!Dt.test(d+ce.event.triggered)&&(-1<d.indexOf(".")&&(d=(h=d.split(".")).shift(),h.sort()),u=d.indexOf(":")<0&&"on"+d,(e=e[ce.expando]?e:new ce.Event(d,"object"==typeof e&&e)).isTrigger=r?2:3,e.namespace=h.join("."),e.rnamespace=e.namespace?new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,e.result=void 0,e.target||(e.target=n),t=null==t?[e]:ce.makeArray(t,[e]),c=ce.event.special[d]||{},r||!c.trigger||!1!==c.trigger.apply(n,t))){if(!r&&!c.noBubble&&!y(n)){for(s=c.delegateType||d,Dt.test(s+d)||(o=o.parentNode);o;o=o.parentNode)p.push(o),a=o;a===(n.ownerDocument||C)&&p.push(a.defaultView||a.parentWindow||ie)}i=0;while((o=p[i++])&&!e.isPropagationStopped())f=o,e.type=1<i?s:c.bindType||d,(l=(_.get(o,"events")||Object.create(null))[e.type]&&_.get(o,"handle"))&&l.apply(o,t),(l=u&&o[u])&&l.apply&&$(o)&&(e.result=l.apply(o,t),!1===e.result&&e.preventDefault());return e.type=d,r||e.isDefaultPrevented()||c._default&&!1!==c._default.apply(p.pop(),t)||!$(n)||u&&v(n[d])&&!y(n)&&((a=n[u])&&(n[u]=null),ce.event.triggered=d,e.isPropagationStopped()&&f.addEventListener(d,Nt),n[d](),e.isPropagationStopped()&&f.removeEventListener(d,Nt),ce.event.triggered=void 0,a&&(n[u]=a)),e.result}},simulate:function(e,t,n){var r=ce.extend(new ce.Event,n,{type:e,isSimulated:!0});ce.event.trigger(r,null,t)}}),ce.fn.extend({trigger:function(e,t){return this.each(function(){ce.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];if(n)return ce.event.trigger(e,t,n,!0)}});var qt=/\[\]$/,Lt=/\r?\n/g,Ht=/^(?:submit|button|image|reset|file)$/i,Ot=/^(?:input|select|textarea|keygen)/i;function Pt(n,e,r,i){var t;if(Array.isArray(e))ce.each(e,function(e,t){r||qt.test(n)?i(n,t):Pt(n+"["+("object"==typeof t&&null!=t?e:"")+"]",t,r,i)});else if(r||"object"!==x(e))i(n,e);else for(t in e)Pt(n+"["+t+"]",e[t],r,i)}ce.param=function(e,t){var n,r=[],i=function(e,t){var n=v(t)?t():t;r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(null==n?"":n)};if(null==e)return"";if(Array.isArray(e)||e.jquery&&!ce.isPlainObject(e))ce.each(e,function(){i(this.name,this.value)});else for(n in e)Pt(n,e[n],t,i);return r.join("&")},ce.fn.extend({serialize:function(){return ce.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=ce.prop(this,"elements");return e?ce.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!ce(this).is(":disabled")&&Ot.test(this.nodeName)&&!Ht.test(e)&&(this.checked||!we.test(e))}).map(function(e,t){var n=ce(this).val();return null==n?null:Array.isArray(n)?ce.map(n,function(e){return{name:t.name,value:e.replace(Lt,"\r\n")}}):{name:t.name,value:n.replace(Lt,"\r\n")}}).get()}});var Mt=/%20/g,Rt=/#.*$/,It=/([?&])_=[^&]*/,Wt=/^(.*?):[ \t]*([^\r\n]*)$/gm,Ft=/^(?:GET|HEAD)$/,$t=/^\/\//,Bt={},_t={},zt="*/".concat("*"),Xt=C.createElement("a");function Ut(o){return function(e,t){"string"!=typeof e&&(t=e,e="*");var n,r=0,i=e.toLowerCase().match(D)||[];if(v(t))while(n=i[r++])"+"===n[0]?(n=n.slice(1)||"*",(o[n]=o[n]||[]).unshift(t)):(o[n]=o[n]||[]).push(t)}}function Vt(t,i,o,a){var s={},u=t===_t;function l(e){var r;return s[e]=!0,ce.each(t[e]||[],function(e,t){var n=t(i,o,a);return"string"!=typeof n||u||s[n]?u?!(r=n):void 0:(i.dataTypes.unshift(n),l(n),!1)}),r}return l(i.dataTypes[0])||!s["*"]&&l("*")}function Gt(e,t){var n,r,i=ce.ajaxSettings.flatOptions||{};for(n in t)void 0!==t[n]&&((i[n]?e:r||(r={}))[n]=t[n]);return r&&ce.extend(!0,e,r),e}Xt.href=Et.href,ce.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Et.href,type:"GET",isLocal:/^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(Et.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":zt,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":ce.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?Gt(Gt(e,ce.ajaxSettings),t):Gt(ce.ajaxSettings,e)},ajaxPrefilter:Ut(Bt),ajaxTransport:Ut(_t),ajax:function(e,t){"object"==typeof e&&(t=e,e=void 0),t=t||{};var c,f,p,n,d,r,h,g,i,o,v=ce.ajaxSetup({},t),y=v.context||v,m=v.context&&(y.nodeType||y.jquery)?ce(y):ce.event,x=ce.Deferred(),b=ce.Callbacks("once memory"),w=v.statusCode||{},a={},s={},u="canceled",T={readyState:0,getResponseHeader:function(e){var t;if(h){if(!n){n={};while(t=Wt.exec(p))n[t[1].toLowerCase()+" "]=(n[t[1].toLowerCase()+" "]||[]).concat(t[2])}t=n[e.toLowerCase()+" "]}return null==t?null:t.join(", ")},getAllResponseHeaders:function(){return h?p:null},setRequestHeader:function(e,t){return null==h&&(e=s[e.toLowerCase()]=s[e.toLowerCase()]||e,a[e]=t),this},overrideMimeType:function(e){return null==h&&(v.mimeType=e),this},statusCode:function(e){var t;if(e)if(h)T.always(e[T.status]);else for(t in e)w[t]=[w[t],e[t]];return this},abort:function(e){var t=e||u;return c&&c.abort(t),l(0,t),this}};if(x.promise(T),v.url=((e||v.url||Et.href)+"").replace($t,Et.protocol+"//"),v.type=t.method||t.type||v.method||v.type,v.dataTypes=(v.dataType||"*").toLowerCase().match(D)||[""],null==v.crossDomain){r=C.createElement("a");try{r.href=v.url,r.href=r.href,v.crossDomain=Xt.protocol+"//"+Xt.host!=r.protocol+"//"+r.host}catch(e){v.crossDomain=!0}}if(v.data&&v.processData&&"string"!=typeof v.data&&(v.data=ce.param(v.data,v.traditional)),Vt(Bt,v,t,T),h)return T;for(i in(g=ce.event&&v.global)&&0==ce.active++&&ce.event.trigger("ajaxStart"),v.type=v.type.toUpperCase(),v.hasContent=!Ft.test(v.type),f=v.url.replace(Rt,""),v.hasContent?v.data&&v.processData&&0===(v.contentType||"").indexOf("application/x-www-form-urlencoded")&&(v.data=v.data.replace(Mt,"+")):(o=v.url.slice(f.length),v.data&&(v.processData||"string"==typeof v.data)&&(f+=(At.test(f)?"&":"?")+v.data,delete v.data),!1===v.cache&&(f=f.replace(It,"$1"),o=(At.test(f)?"&":"?")+"_="+jt.guid+++o),v.url=f+o),v.ifModified&&(ce.lastModified[f]&&T.setRequestHeader("If-Modified-Since",ce.lastModified[f]),ce.etag[f]&&T.setRequestHeader("If-None-Match",ce.etag[f])),(v.data&&v.hasContent&&!1!==v.contentType||t.contentType)&&T.setRequestHeader("Content-Type",v.contentType),T.setRequestHeader("Accept",v.dataTypes[0]&&v.accepts[v.dataTypes[0]]?v.accepts[v.dataTypes[0]]+("*"!==v.dataTypes[0]?", "+zt+"; q=0.01":""):v.accepts["*"]),v.headers)T.setRequestHeader(i,v.headers[i]);if(v.beforeSend&&(!1===v.beforeSend.call(y,T,v)||h))return T.abort();if(u="abort",b.add(v.complete),T.done(v.success),T.fail(v.error),c=Vt(_t,v,t,T)){if(T.readyState=1,g&&m.trigger("ajaxSend",[T,v]),h)return T;v.async&&0<v.timeout&&(d=ie.setTimeout(function(){T.abort("timeout")},v.timeout));try{h=!1,c.send(a,l)}catch(e){if(h)throw e;l(-1,e)}}else l(-1,"No Transport");function l(e,t,n,r){var i,o,a,s,u,l=t;h||(h=!0,d&&ie.clearTimeout(d),c=void 0,p=r||"",T.readyState=0<e?4:0,i=200<=e&&e<300||304===e,n&&(s=function(e,t,n){var r,i,o,a,s=e.contents,u=e.dataTypes;while("*"===u[0])u.shift(),void 0===r&&(r=e.mimeType||t.getResponseHeader("Content-Type"));if(r)for(i in s)if(s[i]&&s[i].test(r)){u.unshift(i);break}if(u[0]in n)o=u[0];else{for(i in n){if(!u[0]||e.converters[i+" "+u[0]]){o=i;break}a||(a=i)}o=o||a}if(o)return o!==u[0]&&u.unshift(o),n[o]}(v,T,n)),!i&&-1<ce.inArray("script",v.dataTypes)&&ce.inArray("json",v.dataTypes)<0&&(v.converters["text script"]=function(){}),s=function(e,t,n,r){var i,o,a,s,u,l={},c=e.dataTypes.slice();if(c[1])for(a in e.converters)l[a.toLowerCase()]=e.converters[a];o=c.shift();while(o)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!u&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),u=o,o=c.shift())if("*"===o)o=u;else if("*"!==u&&u!==o){if(!(a=l[u+" "+o]||l["* "+o]))for(i in l)if((s=i.split(" "))[1]===o&&(a=l[u+" "+s[0]]||l["* "+s[0]])){!0===a?a=l[i]:!0!==l[i]&&(o=s[0],c.unshift(s[1]));break}if(!0!==a)if(a&&e["throws"])t=a(t);else try{t=a(t)}catch(e){return{state:"parsererror",error:a?e:"No conversion from "+u+" to "+o}}}return{state:"success",data:t}}(v,s,T,i),i?(v.ifModified&&((u=T.getResponseHeader("Last-Modified"))&&(ce.lastModified[f]=u),(u=T.getResponseHeader("etag"))&&(ce.etag[f]=u)),204===e||"HEAD"===v.type?l="nocontent":304===e?l="notmodified":(l=s.state,o=s.data,i=!(a=s.error))):(a=l,!e&&l||(l="error",e<0&&(e=0))),T.status=e,T.statusText=(t||l)+"",i?x.resolveWith(y,[o,l,T]):x.rejectWith(y,[T,l,a]),T.statusCode(w),w=void 0,g&&m.trigger(i?"ajaxSuccess":"ajaxError",[T,v,i?o:a]),b.fireWith(y,[T,l]),g&&(m.trigger("ajaxComplete",[T,v]),--ce.active||ce.event.trigger("ajaxStop")))}return T},getJSON:function(e,t,n){return ce.get(e,t,n,"json")},getScript:function(e,t){return ce.get(e,void 0,t,"script")}}),ce.each(["get","post"],function(e,i){ce[i]=function(e,t,n,r){return v(t)&&(r=r||n,n=t,t=void 0),ce.ajax(ce.extend({url:e,type:i,dataType:r,data:t,success:n},ce.isPlainObject(e)&&e))}}),ce.ajaxPrefilter(function(e){var t;for(t in e.headers)"content-type"===t.toLowerCase()&&(e.contentType=e.headers[t]||"")}),ce._evalUrl=function(e,t,n){return ce.ajax({url:e,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,converters:{"text script":function(){}},dataFilter:function(e){ce.globalEval(e,t,n)}})},ce.fn.extend({wrapAll:function(e){var t;return this[0]&&(v(e)&&(e=e.call(this[0])),t=ce(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstElementChild)e=e.firstElementChild;return e}).append(this)),this},wrapInner:function(n){return v(n)?this.each(function(e){ce(this).wrapInner(n.call(this,e))}):this.each(function(){var e=ce(this),t=e.contents();t.length?t.wrapAll(n):e.append(n)})},wrap:function(t){var n=v(t);return this.each(function(e){ce(this).wrapAll(n?t.call(this,e):t)})},unwrap:function(e){return this.parent(e).not("body").each(function(){ce(this).replaceWith(this.childNodes)}),this}}),ce.expr.pseudos.hidden=function(e){return!ce.expr.pseudos.visible(e)},ce.expr.pseudos.visible=function(e){return!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)},ce.ajaxSettings.xhr=function(){try{return new ie.XMLHttpRequest}catch(e){}};var Yt={0:200,1223:204},Qt=ce.ajaxSettings.xhr();le.cors=!!Qt&&"withCredentials"in Qt,le.ajax=Qt=!!Qt,ce.ajaxTransport(function(i){var o,a;if(le.cors||Qt&&!i.crossDomain)return{send:function(e,t){var n,r=i.xhr();if(r.open(i.type,i.url,i.async,i.username,i.password),i.xhrFields)for(n in i.xhrFields)r[n]=i.xhrFields[n];for(n in i.mimeType&&r.overrideMimeType&&r.overrideMimeType(i.mimeType),i.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest"),e)r.setRequestHeader(n,e[n]);o=function(e){return function(){o&&(o=a=r.onload=r.onerror=r.onabort=r.ontimeout=r.onreadystatechange=null,"abort"===e?r.abort():"error"===e?"number"!=typeof r.status?t(0,"error"):t(r.status,r.statusText):t(Yt[r.status]||r.status,r.statusText,"text"!==(r.responseType||"text")||"string"!=typeof r.responseText?{binary:r.response}:{text:r.responseText},r.getAllResponseHeaders()))}},r.onload=o(),a=r.onerror=r.ontimeout=o("error"),void 0!==r.onabort?r.onabort=a:r.onreadystatechange=function(){4===r.readyState&&ie.setTimeout(function(){o&&a()})},o=o("abort");try{r.send(i.hasContent&&i.data||null)}catch(e){if(o)throw e}},abort:function(){o&&o()}}}),ce.ajaxPrefilter(function(e){e.crossDomain&&(e.contents.script=!1)}),ce.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(e){return ce.globalEval(e),e}}}),ce.ajaxPrefilter("script",function(e){void 0===e.cache&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),ce.ajaxTransport("script",function(n){var r,i;if(n.crossDomain||n.scriptAttrs)return{send:function(e,t){r=ce("<script>").attr(n.scriptAttrs||{}).prop({charset:n.scriptCharset,src:n.url}).on("load error",i=function(e){r.remove(),i=null,e&&t("error"===e.type?404:200,e.type)}),C.head.appendChild(r[0])},abort:function(){i&&i()}}});var Jt,Kt=[],Zt=/(=)\?(?=&|$)|\?\?/;ce.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Kt.pop()||ce.expando+"_"+jt.guid++;return this[e]=!0,e}}),ce.ajaxPrefilter("json jsonp",function(e,t,n){var r,i,o,a=!1!==e.jsonp&&(Zt.test(e.url)?"url":"string"==typeof e.data&&0===(e.contentType||"").indexOf("application/x-www-form-urlencoded")&&Zt.test(e.data)&&"data");if(a||"jsonp"===e.dataTypes[0])return r=e.jsonpCallback=v(e.jsonpCallback)?e.jsonpCallback():e.jsonpCallback,a?e[a]=e[a].replace(Zt,"$1"+r):!1!==e.jsonp&&(e.url+=(At.test(e.url)?"&":"?")+e.jsonp+"="+r),e.converters["script json"]=function(){return o||ce.error(r+" was not called"),o[0]},e.dataTypes[0]="json",i=ie[r],ie[r]=function(){o=arguments},n.always(function(){void 0===i?ce(ie).removeProp(r):ie[r]=i,e[r]&&(e.jsonpCallback=t.jsonpCallback,Kt.push(r)),o&&v(i)&&i(o[0]),o=i=void 0}),"script"}),le.createHTMLDocument=((Jt=C.implementation.createHTMLDocument("").body).innerHTML="<form></form><form></form>",2===Jt.childNodes.length),ce.parseHTML=function(e,t,n){return"string"!=typeof e?[]:("boolean"==typeof t&&(n=t,t=!1),t||(le.createHTMLDocument?((r=(t=C.implementation.createHTMLDocument("")).createElement("base")).href=C.location.href,t.head.appendChild(r)):t=C),o=!n&&[],(i=w.exec(e))?[t.createElement(i[1])]:(i=Ae([e],t,o),o&&o.length&&ce(o).remove(),ce.merge([],i.childNodes)));var r,i,o},ce.fn.load=function(e,t,n){var r,i,o,a=this,s=e.indexOf(" ");return-1<s&&(r=Tt(e.slice(s)),e=e.slice(0,s)),v(t)?(n=t,t=void 0):t&&"object"==typeof t&&(i="POST"),0<a.length&&ce.ajax({url:e,type:i||"GET",dataType:"html",data:t}).done(function(e){o=arguments,a.html(r?ce("<div>").append(ce.parseHTML(e)).find(r):e)}).always(n&&function(e,t){a.each(function(){n.apply(this,o||[e.responseText,t,e])})}),this},ce.expr.pseudos.animated=function(t){return ce.grep(ce.timers,function(e){return t===e.elem}).length},ce.offset={setOffset:function(e,t,n){var r,i,o,a,s,u,l=ce.css(e,"position"),c=ce(e),f={};"static"===l&&(e.style.position="relative"),s=c.offset(),o=ce.css(e,"top"),u=ce.css(e,"left"),("absolute"===l||"fixed"===l)&&-1<(o+u).indexOf("auto")?(a=(r=c.position()).top,i=r.left):(a=parseFloat(o)||0,i=parseFloat(u)||0),v(t)&&(t=t.call(e,n,ce.extend({},s))),null!=t.top&&(f.top=t.top-s.top+a),null!=t.left&&(f.left=t.left-s.left+i),"using"in t?t.using.call(e,f):c.css(f)}},ce.fn.extend({offset:function(t){if(arguments.length)return void 0===t?this:this.each(function(e){ce.offset.setOffset(this,t,e)});var e,n,r=this[0];return r?r.getClientRects().length?(e=r.getBoundingClientRect(),n=r.ownerDocument.defaultView,{top:e.top+n.pageYOffset,left:e.left+n.pageXOffset}):{top:0,left:0}:void 0},position:function(){if(this[0]){var e,t,n,r=this[0],i={top:0,left:0};if("fixed"===ce.css(r,"position"))t=r.getBoundingClientRect();else{t=this.offset(),n=r.ownerDocument,e=r.offsetParent||n.documentElement;while(e&&(e===n.body||e===n.documentElement)&&"static"===ce.css(e,"position"))e=e.parentNode;e&&e!==r&&1===e.nodeType&&((i=ce(e).offset()).top+=ce.css(e,"borderTopWidth",!0),i.left+=ce.css(e,"borderLeftWidth",!0))}return{top:t.top-i.top-ce.css(r,"marginTop",!0),left:t.left-i.left-ce.css(r,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var e=this.offsetParent;while(e&&"static"===ce.css(e,"position"))e=e.offsetParent;return e||J})}}),ce.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(t,i){var o="pageYOffset"===i;ce.fn[t]=function(e){return M(this,function(e,t,n){var r;if(y(e)?r=e:9===e.nodeType&&(r=e.defaultView),void 0===n)return r?r[i]:e[t];r?r.scrollTo(o?r.pageXOffset:n,o?n:r.pageYOffset):e[t]=n},t,e,arguments.length)}}),ce.each(["top","left"],function(e,n){ce.cssHooks[n]=Ye(le.pixelPosition,function(e,t){if(t)return t=Ge(e,n),_e.test(t)?ce(e).position()[n]+"px":t})}),ce.each({Height:"height",Width:"width"},function(a,s){ce.each({padding:"inner"+a,content:s,"":"outer"+a},function(r,o){ce.fn[o]=function(e,t){var n=arguments.length&&(r||"boolean"!=typeof e),i=r||(!0===e||!0===t?"margin":"border");return M(this,function(e,t,n){var r;return y(e)?0===o.indexOf("outer")?e["inner"+a]:e.document.documentElement["client"+a]:9===e.nodeType?(r=e.documentElement,Math.max(e.body["scroll"+a],r["scroll"+a],e.body["offset"+a],r["offset"+a],r["client"+a])):void 0===n?ce.css(e,t,i):ce.style(e,t,n,i)},s,n?e:void 0,n)}})}),ce.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){ce.fn[t]=function(e){return this.on(t,e)}}),ce.fn.extend({bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)},hover:function(e,t){return this.on("mouseenter",e).on("mouseleave",t||e)}}),ce.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(e,n){ce.fn[n]=function(e,t){return 0<arguments.length?this.on(n,null,e,t):this.trigger(n)}});var en=/^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;ce.proxy=function(e,t){var n,r,i;if("string"==typeof t&&(n=e[t],t=e,e=n),v(e))return r=ae.call(arguments,2),(i=function(){return e.apply(t||this,r.concat(ae.call(arguments)))}).guid=e.guid=e.guid||ce.guid++,i},ce.holdReady=function(e){e?ce.readyWait++:ce.ready(!0)},ce.isArray=Array.isArray,ce.parseJSON=JSON.parse,ce.nodeName=fe,ce.isFunction=v,ce.isWindow=y,ce.camelCase=F,ce.type=x,ce.now=Date.now,ce.isNumeric=function(e){var t=ce.type(e);return("number"===t||"string"===t)&&!isNaN(e-parseFloat(e))},ce.trim=function(e){return null==e?"":(e+"").replace(en,"$1")},"function"==typeof define&&define.amd&&define("jquery",[],function(){return ce});var tn=ie.jQuery,nn=ie.$;return ce.noConflict=function(e){return ie.$===ce&&(ie.$=nn),e&&ie.jQuery===ce&&(ie.jQuery=tn),ce},"undefined"==typeof e&&(ie.jQuery=ie.$=ce),ce});

/**
 * simplebar - v6.3.0
 * Scrollbars, simpler.
 * https://grsmto.github.io/simplebar/
 *
 * Made by Adrien Denat from a fork by Jonathan Nicol
 * Under MIT License
 */

var SimpleBar=function(){"use strict";var e=function(t,i){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i])},e(t,i)};var t="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};var i=function(e){var t=typeof e;return null!=e&&("object"==t||"function"==t)},s="object"==typeof t&&t&&t.Object===Object&&t,r="object"==typeof self&&self&&self.Object===Object&&self,l=s||r||Function("return this")(),o=l,n=function(){return o.Date.now()},a=/\s/;var c=function(e){for(var t=e.length;t--&&a.test(e.charAt(t)););return t},h=/^\s+/;var u=function(e){return e?e.slice(0,c(e)+1).replace(h,""):e},d=l.Symbol,p=d,v=Object.prototype,f=v.hasOwnProperty,m=v.toString,b=p?p.toStringTag:void 0;var g=function(e){var t=f.call(e,b),i=e[b];try{e[b]=void 0;var s=!0}catch(e){}var r=m.call(e);return s&&(t?e[b]=i:delete e[b]),r},x=Object.prototype.toString;var y=g,E=function(e){return x.call(e)},w=d?d.toStringTag:void 0;var O=function(e){return null==e?void 0===e?"[object Undefined]":"[object Null]":w&&w in Object(e)?y(e):E(e)},S=function(e){return null!=e&&"object"==typeof e};var A=u,k=i,W=function(e){return"symbol"==typeof e||S(e)&&"[object Symbol]"==O(e)},M=/^[-+]0x[0-9a-f]+$/i,N=/^0b[01]+$/i,L=/^0o[0-7]+$/i,z=parseInt;var C=i,T=n,D=function(e){if("number"==typeof e)return e;if(W(e))return NaN;if(k(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=k(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=A(e);var i=N.test(e);return i||L.test(e)?z(e.slice(2),i?2:8):M.test(e)?NaN:+e},R=Math.max,V=Math.min;var H=function(e,t,i){var s,r,l,o,n,a,c=0,h=!1,u=!1,d=!0;if("function"!=typeof e)throw new TypeError("Expected a function");function p(t){var i=s,l=r;return s=r=void 0,c=t,o=e.apply(l,i)}function v(e){return c=e,n=setTimeout(m,t),h?p(e):o}function f(e){var i=e-a;return void 0===a||i>=t||i<0||u&&e-c>=l}function m(){var e=T();if(f(e))return b(e);n=setTimeout(m,function(e){var i=t-(e-a);return u?V(i,l-(e-c)):i}(e))}function b(e){return n=void 0,d&&s?p(e):(s=r=void 0,o)}function g(){var e=T(),i=f(e);if(s=arguments,r=this,a=e,i){if(void 0===n)return v(a);if(u)return clearTimeout(n),n=setTimeout(m,t),p(a)}return void 0===n&&(n=setTimeout(m,t)),o}return t=D(t)||0,C(i)&&(h=!!i.leading,l=(u="maxWait"in i)?R(D(i.maxWait)||0,t):l,d="trailing"in i?!!i.trailing:d),g.cancel=function(){void 0!==n&&clearTimeout(n),c=0,s=a=r=n=void 0},g.flush=function(){return void 0===n?o:b(T())},g},j=H,B=i;var _=function(e,t,i){var s=!0,r=!0;if("function"!=typeof e)throw new TypeError("Expected a function");return B(i)&&(s="leading"in i?!!i.leading:s,r="trailing"in i?!!i.trailing:r),j(e,t,{leading:s,maxWait:t,trailing:r})},q=function(){return q=Object.assign||function(e){for(var t,i=1,s=arguments.length;i<s;i++)for(var r in t=arguments[i])Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e},q.apply(this,arguments)};function P(e){return e&&e.ownerDocument&&e.ownerDocument.defaultView?e.ownerDocument.defaultView:window}function X(e){return e&&e.ownerDocument?e.ownerDocument:document}var Y=function(e){return Array.prototype.reduce.call(e,(function(e,t){var i=t.name.match(/data-simplebar-(.+)/);if(i){var s=i[1].replace(/\W+(.)/g,(function(e,t){return t.toUpperCase()}));switch(t.value){case"true":e[s]=!0;break;case"false":e[s]=!1;break;case void 0:e[s]=!0;break;default:e[s]=t.value}}return e}),{})};function F(e,t){var i;e&&(i=e.classList).add.apply(i,t.split(" "))}function I(e,t){e&&t.split(" ").forEach((function(t){e.classList.remove(t)}))}function U(e){return".".concat(e.split(" ").join("."))}var $=!("undefined"==typeof window||!window.document||!window.document.createElement),Z=Object.freeze({__proto__:null,addClasses:F,canUseDOM:$,classNamesToQuery:U,getElementDocument:X,getElementWindow:P,getOptions:Y,removeClasses:I}),Q=null,G=null;function J(){if(null===Q){if("undefined"==typeof document)return Q=0;var e=document.body,t=document.createElement("div");t.classList.add("simplebar-hide-scrollbar"),e.appendChild(t);var i=t.getBoundingClientRect().right;e.removeChild(t),Q=i}return Q}$&&window.addEventListener("resize",(function(){G!==window.devicePixelRatio&&(G=window.devicePixelRatio,Q=null)}));var K=P,ee=X,te=Y,ie=F,se=I,re=U,le=function(){function e(t,i){void 0===i&&(i={});var s=this;if(this.removePreventClickId=null,this.minScrollbarWidth=20,this.stopScrollDelay=175,this.isScrolling=!1,this.isMouseEntering=!1,this.isDragging=!1,this.scrollXTicking=!1,this.scrollYTicking=!1,this.wrapperEl=null,this.contentWrapperEl=null,this.contentEl=null,this.offsetEl=null,this.maskEl=null,this.placeholderEl=null,this.heightAutoObserverWrapperEl=null,this.heightAutoObserverEl=null,this.rtlHelpers=null,this.scrollbarWidth=0,this.resizeObserver=null,this.mutationObserver=null,this.elStyles=null,this.isRtl=null,this.mouseX=0,this.mouseY=0,this.onMouseMove=function(){},this.onWindowResize=function(){},this.onStopScrolling=function(){},this.onMouseEntered=function(){},this.onScroll=function(){var e=K(s.el);s.scrollXTicking||(e.requestAnimationFrame(s.scrollX),s.scrollXTicking=!0),s.scrollYTicking||(e.requestAnimationFrame(s.scrollY),s.scrollYTicking=!0),s.isScrolling||(s.isScrolling=!0,ie(s.el,s.classNames.scrolling)),s.showScrollbar("x"),s.showScrollbar("y"),s.onStopScrolling()},this.scrollX=function(){s.axis.x.isOverflowing&&s.positionScrollbar("x"),s.scrollXTicking=!1},this.scrollY=function(){s.axis.y.isOverflowing&&s.positionScrollbar("y"),s.scrollYTicking=!1},this._onStopScrolling=function(){se(s.el,s.classNames.scrolling),s.options.autoHide&&(s.hideScrollbar("x"),s.hideScrollbar("y")),s.isScrolling=!1},this.onMouseEnter=function(){s.isMouseEntering||(ie(s.el,s.classNames.mouseEntered),s.showScrollbar("x"),s.showScrollbar("y"),s.isMouseEntering=!0),s.onMouseEntered()},this._onMouseEntered=function(){se(s.el,s.classNames.mouseEntered),s.options.autoHide&&(s.hideScrollbar("x"),s.hideScrollbar("y")),s.isMouseEntering=!1},this._onMouseMove=function(e){s.mouseX=e.clientX,s.mouseY=e.clientY,(s.axis.x.isOverflowing||s.axis.x.forceVisible)&&s.onMouseMoveForAxis("x"),(s.axis.y.isOverflowing||s.axis.y.forceVisible)&&s.onMouseMoveForAxis("y")},this.onMouseLeave=function(){s.onMouseMove.cancel(),(s.axis.x.isOverflowing||s.axis.x.forceVisible)&&s.onMouseLeaveForAxis("x"),(s.axis.y.isOverflowing||s.axis.y.forceVisible)&&s.onMouseLeaveForAxis("y"),s.mouseX=-1,s.mouseY=-1},this._onWindowResize=function(){s.scrollbarWidth=s.getScrollbarWidth(),s.hideNativeScrollbar()},this.onPointerEvent=function(e){var t,i;s.axis.x.track.el&&s.axis.y.track.el&&s.axis.x.scrollbar.el&&s.axis.y.scrollbar.el&&(s.axis.x.track.rect=s.axis.x.track.el.getBoundingClientRect(),s.axis.y.track.rect=s.axis.y.track.el.getBoundingClientRect(),(s.axis.x.isOverflowing||s.axis.x.forceVisible)&&(t=s.isWithinBounds(s.axis.x.track.rect)),(s.axis.y.isOverflowing||s.axis.y.forceVisible)&&(i=s.isWithinBounds(s.axis.y.track.rect)),(t||i)&&(e.stopPropagation(),"pointerdown"===e.type&&"touch"!==e.pointerType&&(t&&(s.axis.x.scrollbar.rect=s.axis.x.scrollbar.el.getBoundingClientRect(),s.isWithinBounds(s.axis.x.scrollbar.rect)?s.onDragStart(e,"x"):s.onTrackClick(e,"x")),i&&(s.axis.y.scrollbar.rect=s.axis.y.scrollbar.el.getBoundingClientRect(),s.isWithinBounds(s.axis.y.scrollbar.rect)?s.onDragStart(e,"y"):s.onTrackClick(e,"y")))))},this.drag=function(t){var i,r,l,o,n,a,c,h,u,d,p;if(s.draggedAxis&&s.contentWrapperEl){var v=s.axis[s.draggedAxis].track,f=null!==(r=null===(i=v.rect)||void 0===i?void 0:i[s.axis[s.draggedAxis].sizeAttr])&&void 0!==r?r:0,m=s.axis[s.draggedAxis].scrollbar,b=null!==(o=null===(l=s.contentWrapperEl)||void 0===l?void 0:l[s.axis[s.draggedAxis].scrollSizeAttr])&&void 0!==o?o:0,g=parseInt(null!==(a=null===(n=s.elStyles)||void 0===n?void 0:n[s.axis[s.draggedAxis].sizeAttr])&&void 0!==a?a:"0px",10);t.preventDefault(),t.stopPropagation();var x=("y"===s.draggedAxis?t.pageY:t.pageX)-(null!==(h=null===(c=v.rect)||void 0===c?void 0:c[s.axis[s.draggedAxis].offsetAttr])&&void 0!==h?h:0)-s.axis[s.draggedAxis].dragOffset,y=(x="x"===s.draggedAxis&&s.isRtl?(null!==(d=null===(u=v.rect)||void 0===u?void 0:u[s.axis[s.draggedAxis].sizeAttr])&&void 0!==d?d:0)-m.size-x:x)/(f-m.size)*(b-g);"x"===s.draggedAxis&&s.isRtl&&(y=(null===(p=e.getRtlHelpers())||void 0===p?void 0:p.isScrollingToNegative)?-y:y),s.contentWrapperEl[s.axis[s.draggedAxis].scrollOffsetAttr]=y}},this.onEndDrag=function(e){s.isDragging=!1;var t=ee(s.el),i=K(s.el);e.preventDefault(),e.stopPropagation(),se(s.el,s.classNames.dragging),s.onStopScrolling(),t.removeEventListener("mousemove",s.drag,!0),t.removeEventListener("mouseup",s.onEndDrag,!0),s.removePreventClickId=i.setTimeout((function(){t.removeEventListener("click",s.preventClick,!0),t.removeEventListener("dblclick",s.preventClick,!0),s.removePreventClickId=null}))},this.preventClick=function(e){e.preventDefault(),e.stopPropagation()},this.el=t,this.options=q(q({},e.defaultOptions),i),this.classNames=q(q({},e.defaultOptions.classNames),i.classNames),this.axis={x:{scrollOffsetAttr:"scrollLeft",sizeAttr:"width",scrollSizeAttr:"scrollWidth",offsetSizeAttr:"offsetWidth",offsetAttr:"left",overflowAttr:"overflowX",dragOffset:0,isOverflowing:!0,forceVisible:!1,track:{size:null,el:null,rect:null,isVisible:!1},scrollbar:{size:null,el:null,rect:null,isVisible:!1}},y:{scrollOffsetAttr:"scrollTop",sizeAttr:"height",scrollSizeAttr:"scrollHeight",offsetSizeAttr:"offsetHeight",offsetAttr:"top",overflowAttr:"overflowY",dragOffset:0,isOverflowing:!0,forceVisible:!1,track:{size:null,el:null,rect:null,isVisible:!1},scrollbar:{size:null,el:null,rect:null,isVisible:!1}}},"object"!=typeof this.el||!this.el.nodeName)throw new Error("Argument passed to SimpleBar must be an HTML element instead of ".concat(this.el));this.onMouseMove=_(this._onMouseMove,64),this.onWindowResize=H(this._onWindowResize,64,{leading:!0}),this.onStopScrolling=H(this._onStopScrolling,this.stopScrollDelay),this.onMouseEntered=H(this._onMouseEntered,this.stopScrollDelay),this.init()}return e.getRtlHelpers=function(){if(e.rtlHelpers)return e.rtlHelpers;var t=document.createElement("div");t.innerHTML='<div class="simplebar-dummy-scrollbar-size"><div></div></div>';var i=t.firstElementChild,s=null==i?void 0:i.firstElementChild;if(!s)return null;document.body.appendChild(i),i.scrollLeft=0;var r=e.getOffset(i),l=e.getOffset(s);i.scrollLeft=-999;var o=e.getOffset(s);return document.body.removeChild(i),e.rtlHelpers={isScrollOriginAtZero:r.left!==l.left,isScrollingToNegative:l.left!==o.left},e.rtlHelpers},e.prototype.getScrollbarWidth=function(){try{return this.contentWrapperEl&&"none"===getComputedStyle(this.contentWrapperEl,"::-webkit-scrollbar").display||"scrollbarWidth"in document.documentElement.style||"-ms-overflow-style"in document.documentElement.style?0:J()}catch(e){return J()}},e.getOffset=function(e){var t=e.getBoundingClientRect(),i=ee(e),s=K(e);return{top:t.top+(s.pageYOffset||i.documentElement.scrollTop),left:t.left+(s.pageXOffset||i.documentElement.scrollLeft)}},e.prototype.init=function(){$&&(this.initDOM(),this.rtlHelpers=e.getRtlHelpers(),this.scrollbarWidth=this.getScrollbarWidth(),this.recalculate(),this.initListeners())},e.prototype.initDOM=function(){var e,t;this.wrapperEl=this.el.querySelector(re(this.classNames.wrapper)),this.contentWrapperEl=this.options.scrollableNode||this.el.querySelector(re(this.classNames.contentWrapper)),this.contentEl=this.options.contentNode||this.el.querySelector(re(this.classNames.contentEl)),this.offsetEl=this.el.querySelector(re(this.classNames.offset)),this.maskEl=this.el.querySelector(re(this.classNames.mask)),this.placeholderEl=this.findChild(this.wrapperEl,re(this.classNames.placeholder)),this.heightAutoObserverWrapperEl=this.el.querySelector(re(this.classNames.heightAutoObserverWrapperEl)),this.heightAutoObserverEl=this.el.querySelector(re(this.classNames.heightAutoObserverEl)),this.axis.x.track.el=this.findChild(this.el,"".concat(re(this.classNames.track)).concat(re(this.classNames.horizontal))),this.axis.y.track.el=this.findChild(this.el,"".concat(re(this.classNames.track)).concat(re(this.classNames.vertical))),this.axis.x.scrollbar.el=(null===(e=this.axis.x.track.el)||void 0===e?void 0:e.querySelector(re(this.classNames.scrollbar)))||null,this.axis.y.scrollbar.el=(null===(t=this.axis.y.track.el)||void 0===t?void 0:t.querySelector(re(this.classNames.scrollbar)))||null,this.options.autoHide||(ie(this.axis.x.scrollbar.el,this.classNames.visible),ie(this.axis.y.scrollbar.el,this.classNames.visible))},e.prototype.initListeners=function(){var e,t=this,i=K(this.el);if(this.el.addEventListener("mouseenter",this.onMouseEnter),this.el.addEventListener("pointerdown",this.onPointerEvent,!0),this.el.addEventListener("mousemove",this.onMouseMove),this.el.addEventListener("mouseleave",this.onMouseLeave),null===(e=this.contentWrapperEl)||void 0===e||e.addEventListener("scroll",this.onScroll),i.addEventListener("resize",this.onWindowResize),this.contentEl){if(window.ResizeObserver){var s=!1,r=i.ResizeObserver||ResizeObserver;this.resizeObserver=new r((function(){s&&i.requestAnimationFrame((function(){t.recalculate()}))})),this.resizeObserver.observe(this.el),this.resizeObserver.observe(this.contentEl),i.requestAnimationFrame((function(){s=!0}))}this.mutationObserver=new i.MutationObserver((function(){i.requestAnimationFrame((function(){t.recalculate()}))})),this.mutationObserver.observe(this.contentEl,{childList:!0,subtree:!0,characterData:!0})}},e.prototype.recalculate=function(){if(this.heightAutoObserverEl&&this.contentEl&&this.contentWrapperEl&&this.wrapperEl&&this.placeholderEl){var e=K(this.el);this.elStyles=e.getComputedStyle(this.el),this.isRtl="rtl"===this.elStyles.direction;var t=this.contentEl.offsetWidth,i=this.heightAutoObserverEl.offsetHeight<=1,s=this.heightAutoObserverEl.offsetWidth<=1||t>0,r=this.contentWrapperEl.offsetWidth,l=this.elStyles.overflowX,o=this.elStyles.overflowY;this.contentEl.style.padding="".concat(this.elStyles.paddingTop," ").concat(this.elStyles.paddingRight," ").concat(this.elStyles.paddingBottom," ").concat(this.elStyles.paddingLeft),this.wrapperEl.style.margin="-".concat(this.elStyles.paddingTop," -").concat(this.elStyles.paddingRight," -").concat(this.elStyles.paddingBottom," -").concat(this.elStyles.paddingLeft);var n=this.contentEl.scrollHeight,a=this.contentEl.scrollWidth;this.contentWrapperEl.style.height=i?"auto":"100%",this.placeholderEl.style.width=s?"".concat(t||a,"px"):"auto",this.placeholderEl.style.height="".concat(n,"px");var c=this.contentWrapperEl.offsetHeight;this.axis.x.isOverflowing=0!==t&&a>t,this.axis.y.isOverflowing=n>c,this.axis.x.isOverflowing="hidden"!==l&&this.axis.x.isOverflowing,this.axis.y.isOverflowing="hidden"!==o&&this.axis.y.isOverflowing,this.axis.x.forceVisible="x"===this.options.forceVisible||!0===this.options.forceVisible,this.axis.y.forceVisible="y"===this.options.forceVisible||!0===this.options.forceVisible,this.hideNativeScrollbar();var h=this.axis.x.isOverflowing?this.scrollbarWidth:0,u=this.axis.y.isOverflowing?this.scrollbarWidth:0;this.axis.x.isOverflowing=this.axis.x.isOverflowing&&a>r-u,this.axis.y.isOverflowing=this.axis.y.isOverflowing&&n>c-h,this.axis.x.scrollbar.size=this.getScrollbarSize("x"),this.axis.y.scrollbar.size=this.getScrollbarSize("y"),this.axis.x.scrollbar.el&&(this.axis.x.scrollbar.el.style.width="".concat(this.axis.x.scrollbar.size,"px")),this.axis.y.scrollbar.el&&(this.axis.y.scrollbar.el.style.height="".concat(this.axis.y.scrollbar.size,"px")),this.positionScrollbar("x"),this.positionScrollbar("y"),this.toggleTrackVisibility("x"),this.toggleTrackVisibility("y")}},e.prototype.getScrollbarSize=function(e){var t,i;if(void 0===e&&(e="y"),!this.axis[e].isOverflowing||!this.contentEl)return 0;var s,r=this.contentEl[this.axis[e].scrollSizeAttr],l=null!==(i=null===(t=this.axis[e].track.el)||void 0===t?void 0:t[this.axis[e].offsetSizeAttr])&&void 0!==i?i:0,o=l/r;return s=Math.max(~~(o*l),this.options.scrollbarMinSize),this.options.scrollbarMaxSize&&(s=Math.min(s,this.options.scrollbarMaxSize)),s},e.prototype.positionScrollbar=function(t){var i,s,r;void 0===t&&(t="y");var l=this.axis[t].scrollbar;if(this.axis[t].isOverflowing&&this.contentWrapperEl&&l.el&&this.elStyles){var o=this.contentWrapperEl[this.axis[t].scrollSizeAttr],n=(null===(i=this.axis[t].track.el)||void 0===i?void 0:i[this.axis[t].offsetSizeAttr])||0,a=parseInt(this.elStyles[this.axis[t].sizeAttr],10),c=this.contentWrapperEl[this.axis[t].scrollOffsetAttr];c="x"===t&&this.isRtl&&(null===(s=e.getRtlHelpers())||void 0===s?void 0:s.isScrollOriginAtZero)?-c:c,"x"===t&&this.isRtl&&(c=(null===(r=e.getRtlHelpers())||void 0===r?void 0:r.isScrollingToNegative)?c:-c);var h=c/(o-a),u=~~((n-l.size)*h);u="x"===t&&this.isRtl?-u+(n-l.size):u,l.el.style.transform="x"===t?"translate3d(".concat(u,"px, 0, 0)"):"translate3d(0, ".concat(u,"px, 0)")}},e.prototype.toggleTrackVisibility=function(e){void 0===e&&(e="y");var t=this.axis[e].track.el,i=this.axis[e].scrollbar.el;t&&i&&this.contentWrapperEl&&(this.axis[e].isOverflowing||this.axis[e].forceVisible?(t.style.visibility="visible",this.contentWrapperEl.style[this.axis[e].overflowAttr]="scroll",this.el.classList.add("".concat(this.classNames.scrollable,"-").concat(e))):(t.style.visibility="hidden",this.contentWrapperEl.style[this.axis[e].overflowAttr]="hidden",this.el.classList.remove("".concat(this.classNames.scrollable,"-").concat(e))),this.axis[e].isOverflowing?i.style.display="block":i.style.display="none")},e.prototype.showScrollbar=function(e){void 0===e&&(e="y"),this.axis[e].isOverflowing&&!this.axis[e].scrollbar.isVisible&&(ie(this.axis[e].scrollbar.el,this.classNames.visible),this.axis[e].scrollbar.isVisible=!0)},e.prototype.hideScrollbar=function(e){void 0===e&&(e="y"),this.isDragging||this.axis[e].isOverflowing&&this.axis[e].scrollbar.isVisible&&(se(this.axis[e].scrollbar.el,this.classNames.visible),this.axis[e].scrollbar.isVisible=!1)},e.prototype.hideNativeScrollbar=function(){this.offsetEl&&(this.offsetEl.style[this.isRtl?"left":"right"]=this.axis.y.isOverflowing||this.axis.y.forceVisible?"-".concat(this.scrollbarWidth,"px"):"0px",this.offsetEl.style.bottom=this.axis.x.isOverflowing||this.axis.x.forceVisible?"-".concat(this.scrollbarWidth,"px"):"0px")},e.prototype.onMouseMoveForAxis=function(e){void 0===e&&(e="y");var t=this.axis[e];t.track.el&&t.scrollbar.el&&(t.track.rect=t.track.el.getBoundingClientRect(),t.scrollbar.rect=t.scrollbar.el.getBoundingClientRect(),this.isWithinBounds(t.track.rect)?(this.showScrollbar(e),ie(t.track.el,this.classNames.hover),this.isWithinBounds(t.scrollbar.rect)?ie(t.scrollbar.el,this.classNames.hover):se(t.scrollbar.el,this.classNames.hover)):(se(t.track.el,this.classNames.hover),this.options.autoHide&&this.hideScrollbar(e)))},e.prototype.onMouseLeaveForAxis=function(e){void 0===e&&(e="y"),se(this.axis[e].track.el,this.classNames.hover),se(this.axis[e].scrollbar.el,this.classNames.hover),this.options.autoHide&&this.hideScrollbar(e)},e.prototype.onDragStart=function(e,t){var i;void 0===t&&(t="y"),this.isDragging=!0;var s=ee(this.el),r=K(this.el),l=this.axis[t].scrollbar,o="y"===t?e.pageY:e.pageX;this.axis[t].dragOffset=o-((null===(i=l.rect)||void 0===i?void 0:i[this.axis[t].offsetAttr])||0),this.draggedAxis=t,ie(this.el,this.classNames.dragging),s.addEventListener("mousemove",this.drag,!0),s.addEventListener("mouseup",this.onEndDrag,!0),null===this.removePreventClickId?(s.addEventListener("click",this.preventClick,!0),s.addEventListener("dblclick",this.preventClick,!0)):(r.clearTimeout(this.removePreventClickId),this.removePreventClickId=null)},e.prototype.onTrackClick=function(e,t){var i,s,r,l,o=this;void 0===t&&(t="y");var n=this.axis[t];if(this.options.clickOnTrack&&n.scrollbar.el&&this.contentWrapperEl){e.preventDefault();var a=K(this.el);this.axis[t].scrollbar.rect=n.scrollbar.el.getBoundingClientRect();var c=null!==(s=null===(i=this.axis[t].scrollbar.rect)||void 0===i?void 0:i[this.axis[t].offsetAttr])&&void 0!==s?s:0,h=parseInt(null!==(l=null===(r=this.elStyles)||void 0===r?void 0:r[this.axis[t].sizeAttr])&&void 0!==l?l:"0px",10),u=this.contentWrapperEl[this.axis[t].scrollOffsetAttr],d=("y"===t?this.mouseY-c:this.mouseX-c)<0?-1:1,p=-1===d?u-h:u+h,v=function(){o.contentWrapperEl&&(-1===d?u>p&&(u-=40,o.contentWrapperEl[o.axis[t].scrollOffsetAttr]=u,a.requestAnimationFrame(v)):u<p&&(u+=40,o.contentWrapperEl[o.axis[t].scrollOffsetAttr]=u,a.requestAnimationFrame(v)))};v()}},e.prototype.getContentElement=function(){return this.contentEl},e.prototype.getScrollElement=function(){return this.contentWrapperEl},e.prototype.removeListeners=function(){var e=K(this.el);this.el.removeEventListener("mouseenter",this.onMouseEnter),this.el.removeEventListener("pointerdown",this.onPointerEvent,!0),this.el.removeEventListener("mousemove",this.onMouseMove),this.el.removeEventListener("mouseleave",this.onMouseLeave),this.contentWrapperEl&&this.contentWrapperEl.removeEventListener("scroll",this.onScroll),e.removeEventListener("resize",this.onWindowResize),this.mutationObserver&&this.mutationObserver.disconnect(),this.resizeObserver&&this.resizeObserver.disconnect(),this.onMouseMove.cancel(),this.onWindowResize.cancel(),this.onStopScrolling.cancel(),this.onMouseEntered.cancel()},e.prototype.unMount=function(){this.removeListeners()},e.prototype.isWithinBounds=function(e){return this.mouseX>=e.left&&this.mouseX<=e.left+e.width&&this.mouseY>=e.top&&this.mouseY<=e.top+e.height},e.prototype.findChild=function(e,t){var i=e.matches||e.webkitMatchesSelector||e.mozMatchesSelector||e.msMatchesSelector;return Array.prototype.filter.call(e.children,(function(e){return i.call(e,t)}))[0]},e.rtlHelpers=null,e.defaultOptions={forceVisible:!1,clickOnTrack:!0,scrollbarMinSize:25,scrollbarMaxSize:0,ariaLabel:"scrollable content",tabIndex:0,classNames:{contentEl:"simplebar-content",contentWrapper:"simplebar-content-wrapper",offset:"simplebar-offset",mask:"simplebar-mask",wrapper:"simplebar-wrapper",placeholder:"simplebar-placeholder",scrollbar:"simplebar-scrollbar",track:"simplebar-track",heightAutoObserverWrapperEl:"simplebar-height-auto-observer-wrapper",heightAutoObserverEl:"simplebar-height-auto-observer",visible:"simplebar-visible",horizontal:"simplebar-horizontal",vertical:"simplebar-vertical",hover:"simplebar-hover",dragging:"simplebar-dragging",scrolling:"simplebar-scrolling",scrollable:"simplebar-scrollable",mouseEntered:"simplebar-mouse-entered"},scrollableNode:null,contentNode:null,autoHide:!0},e.getOptions=te,e.helpers=Z,e}(),oe=le.helpers,ne=oe.getOptions,ae=oe.addClasses,ce=oe.canUseDOM,he=function(t){function i(){for(var e=[],s=0;s<arguments.length;s++)e[s]=arguments[s];var r=t.apply(this,e)||this;return i.instances.set(e[0],r),r}return function(t,i){if("function"!=typeof i&&null!==i)throw new TypeError("Class extends value "+String(i)+" is not a constructor or null");function s(){this.constructor=t}e(t,i),t.prototype=null===i?Object.create(i):(s.prototype=i.prototype,new s)}(i,t),i.initDOMLoadedElements=function(){document.removeEventListener("DOMContentLoaded",this.initDOMLoadedElements),window.removeEventListener("load",this.initDOMLoadedElements),Array.prototype.forEach.call(document.querySelectorAll("[data-simplebar]"),(function(e){"init"===e.getAttribute("data-simplebar")||i.instances.has(e)||new i(e,ne(e.attributes))}))},i.removeObserver=function(){var e;null===(e=i.globalObserver)||void 0===e||e.disconnect()},i.prototype.initDOM=function(){var e,t,i,s=this;if(!Array.prototype.filter.call(this.el.children,(function(e){return e.classList.contains(s.classNames.wrapper)})).length){for(this.wrapperEl=document.createElement("div"),this.contentWrapperEl=document.createElement("div"),this.offsetEl=document.createElement("div"),this.maskEl=document.createElement("div"),this.contentEl=document.createElement("div"),this.placeholderEl=document.createElement("div"),this.heightAutoObserverWrapperEl=document.createElement("div"),this.heightAutoObserverEl=document.createElement("div"),ae(this.wrapperEl,this.classNames.wrapper),ae(this.contentWrapperEl,this.classNames.contentWrapper),ae(this.offsetEl,this.classNames.offset),ae(this.maskEl,this.classNames.mask),ae(this.contentEl,this.classNames.contentEl),ae(this.placeholderEl,this.classNames.placeholder),ae(this.heightAutoObserverWrapperEl,this.classNames.heightAutoObserverWrapperEl),ae(this.heightAutoObserverEl,this.classNames.heightAutoObserverEl);this.el.firstChild;)this.contentEl.appendChild(this.el.firstChild);this.contentWrapperEl.appendChild(this.contentEl),this.offsetEl.appendChild(this.contentWrapperEl),this.maskEl.appendChild(this.offsetEl),this.heightAutoObserverWrapperEl.appendChild(this.heightAutoObserverEl),this.wrapperEl.appendChild(this.heightAutoObserverWrapperEl),this.wrapperEl.appendChild(this.maskEl),this.wrapperEl.appendChild(this.placeholderEl),this.el.appendChild(this.wrapperEl),null===(e=this.contentWrapperEl)||void 0===e||e.setAttribute("tabindex",this.options.tabIndex.toString()),null===(t=this.contentWrapperEl)||void 0===t||t.setAttribute("role","region"),null===(i=this.contentWrapperEl)||void 0===i||i.setAttribute("aria-label",this.options.ariaLabel)}if(!this.axis.x.track.el||!this.axis.y.track.el){var r=document.createElement("div"),l=document.createElement("div");ae(r,this.classNames.track),ae(l,this.classNames.scrollbar),r.appendChild(l),this.axis.x.track.el=r.cloneNode(!0),ae(this.axis.x.track.el,this.classNames.horizontal),this.axis.y.track.el=r.cloneNode(!0),ae(this.axis.y.track.el,this.classNames.vertical),this.el.appendChild(this.axis.x.track.el),this.el.appendChild(this.axis.y.track.el)}le.prototype.initDOM.call(this),this.el.setAttribute("data-simplebar","init")},i.prototype.unMount=function(){le.prototype.unMount.call(this),i.instances.delete(this.el)},i.initHtmlApi=function(){this.initDOMLoadedElements=this.initDOMLoadedElements.bind(this),"undefined"!=typeof MutationObserver&&(this.globalObserver=new MutationObserver(i.handleMutations),this.globalObserver.observe(document,{childList:!0,subtree:!0})),"complete"===document.readyState||"loading"!==document.readyState&&!document.documentElement.doScroll?window.setTimeout(this.initDOMLoadedElements):(document.addEventListener("DOMContentLoaded",this.initDOMLoadedElements),window.addEventListener("load",this.initDOMLoadedElements))},i.handleMutations=function(e){e.forEach((function(e){e.addedNodes.forEach((function(e){1===e.nodeType&&(e.hasAttribute("data-simplebar")?!i.instances.has(e)&&document.documentElement.contains(e)&&new i(e,ne(e.attributes)):e.querySelectorAll("[data-simplebar]").forEach((function(e){"init"!==e.getAttribute("data-simplebar")&&!i.instances.has(e)&&document.documentElement.contains(e)&&new i(e,ne(e.attributes))})))})),e.removedNodes.forEach((function(e){var t;1===e.nodeType&&("init"===e.getAttribute("data-simplebar")?!document.documentElement.contains(e)&&(null===(t=i.instances.get(e))||void 0===t||t.unMount()):Array.prototype.forEach.call(e.querySelectorAll('[data-simplebar="init"]'),(function(e){var t;!document.documentElement.contains(e)&&(null===(t=i.instances.get(e))||void 0===t||t.unMount())})))}))}))},i.instances=new WeakMap,i}(le);return ce&&he.initHtmlApi(),he}();

!function(t,e){"use strict";"function"==typeof define&&define.amd?define([],function(){return t.Waves=e.call(t),t.Waves}):"object"==typeof exports?module.exports=e.call(t):t.Waves=e.call(t)}("object"==typeof global?global:this,function(){"use strict";function t(t){return null!==t&&t===t.window}function e(e){return t(e)?e:9===e.nodeType&&e.defaultView}function n(t){var e=typeof t;return"function"===e||"object"===e&&!!t}function o(t){return n(t)&&t.nodeType>0}function a(t){var e=f.call(t);return"[object String]"===e?d(t):n(t)&&/^\[object (Array|HTMLCollection|NodeList|Object)\]$/.test(e)&&t.hasOwnProperty("length")?t:o(t)?[t]:[]}function i(t){var n,o,a={top:0,left:0},i=t&&t.ownerDocument;return n=i.documentElement,void 0!==t.getBoundingClientRect&&(a=t.getBoundingClientRect()),o=e(i),{top:a.top+o.pageYOffset-n.clientTop,left:a.left+o.pageXOffset-n.clientLeft}}function r(t){var e="";for(var n in t)t.hasOwnProperty(n)&&(e+=n+":"+t[n]+";");return e}function s(t,e,n){if(n){n.classList.remove("waves-rippling");var o=n.getAttribute("data-x"),a=n.getAttribute("data-y"),i=n.getAttribute("data-scale"),s=n.getAttribute("data-translate"),u=350-(Date.now()-Number(n.getAttribute("data-hold")));u<0&&(u=0),"mousemove"===t.type&&(u=150);var c="mousemove"===t.type?2500:v.duration;setTimeout(function(){var t={top:a+"px",left:o+"px",opacity:"0","-webkit-transition-duration":c+"ms","-moz-transition-duration":c+"ms","-o-transition-duration":c+"ms","transition-duration":c+"ms","-webkit-transform":i+" "+s,"-moz-transform":i+" "+s,"-ms-transform":i+" "+s,"-o-transform":i+" "+s,transform:i+" "+s};n.setAttribute("style",r(t)),setTimeout(function(){try{e.removeChild(n)}catch(t){return!1}},c)},u)}}function u(t){if(!1===h.allowEvent(t))return null;for(var e=null,n=t.target||t.srcElement;n.parentElement;){if(!(n instanceof SVGElement)&&n.classList.contains("waves-effect")){e=n;break}n=n.parentElement}return e}function c(t){var e=u(t);if(null!==e){if(e.disabled||e.getAttribute("disabled")||e.classList.contains("disabled"))return;if(h.registerEvent(t),"touchstart"===t.type&&v.delay){var n=!1,o=setTimeout(function(){o=null,v.show(t,e)},v.delay),a=function(a){o&&(clearTimeout(o),o=null,v.show(t,e)),n||(n=!0,v.hide(a,e)),r()},i=function(t){o&&(clearTimeout(o),o=null),a(t),r()};e.addEventListener("touchmove",i,!1),e.addEventListener("touchend",a,!1),e.addEventListener("touchcancel",a,!1);var r=function(){e.removeEventListener("touchmove",i),e.removeEventListener("touchend",a),e.removeEventListener("touchcancel",a)}}else v.show(t,e),m&&(e.addEventListener("touchend",v.hide,!1),e.addEventListener("touchcancel",v.hide,!1)),e.addEventListener("mouseup",v.hide,!1),e.addEventListener("mouseleave",v.hide,!1)}}var l=l||{},d=document.querySelectorAll.bind(document),f=Object.prototype.toString,m="ontouchstart"in window,v={duration:750,delay:200,show:function(t,e,n){if(2===t.button)return!1;e=e||this;var o=document.createElement("div");o.className="waves-ripple waves-rippling",e.appendChild(o);var a=i(e),s=0,u=0;"touches"in t&&t.touches.length?(s=t.touches[0].pageY-a.top,u=t.touches[0].pageX-a.left):(s=t.pageY-a.top,u=t.pageX-a.left),u=u>=0?u:0,s=s>=0?s:0;var c="scale("+e.clientWidth/100*3+")",l="translate(0,0)";n&&(l="translate("+n.x+"px, "+n.y+"px)"),o.setAttribute("data-hold",Date.now()),o.setAttribute("data-x",u),o.setAttribute("data-y",s),o.setAttribute("data-scale",c),o.setAttribute("data-translate",l);var d={top:s+"px",left:u+"px"};o.classList.add("waves-notransition"),o.setAttribute("style",r(d)),o.classList.remove("waves-notransition"),d["-webkit-transform"]=c+" "+l,d["-moz-transform"]=c+" "+l,d["-ms-transform"]=c+" "+l,d["-o-transform"]=c+" "+l,d.transform=c+" "+l,d.opacity="1";var f="mousemove"===t.type?2500:v.duration;d["-webkit-transition-duration"]=f+"ms",d["-moz-transition-duration"]=f+"ms",d["-o-transition-duration"]=f+"ms",d["transition-duration"]=f+"ms",o.setAttribute("style",r(d))},hide:function(t,e){for(var n=(e=e||this).getElementsByClassName("waves-rippling"),o=0,a=n.length;o<a;o++)s(t,e,n[o]);m&&(e.removeEventListener("touchend",v.hide),e.removeEventListener("touchcancel",v.hide)),e.removeEventListener("mouseup",v.hide),e.removeEventListener("mouseleave",v.hide)}},p={input:function(t){var e=t.parentNode;if("i"!==e.tagName.toLowerCase()||!e.classList.contains("waves-effect")){var n=document.createElement("i");n.className=t.className+" waves-input-wrapper",t.className="waves-button-input",e.replaceChild(n,t),n.appendChild(t);var o=window.getComputedStyle(t,null),a=o.color,i=o.backgroundColor;n.setAttribute("style","color:"+a+";background:"+i),t.setAttribute("style","background-color:rgba(0,0,0,0);")}},img:function(t){var e=t.parentNode;if("i"!==e.tagName.toLowerCase()||!e.classList.contains("waves-effect")){var n=document.createElement("i");e.replaceChild(n,t),n.appendChild(t)}}},h={touches:0,allowEvent:function(t){var e=!0;return/^(mousedown|mousemove)$/.test(t.type)&&h.touches&&(e=!1),e},registerEvent:function(t){var e=t.type;"touchstart"===e?h.touches+=1:/^(touchend|touchcancel)$/.test(e)&&setTimeout(function(){h.touches&&(h.touches-=1)},500)}};return l.init=function(t){var e=document.body;"duration"in(t=t||{})&&(v.duration=t.duration),"delay"in t&&(v.delay=t.delay),m&&(e.addEventListener("touchstart",c,!1),e.addEventListener("touchcancel",h.registerEvent,!1),e.addEventListener("touchend",h.registerEvent,!1)),e.addEventListener("mousedown",c,!1)},l.attach=function(t,e){t=a(t),"[object Array]"===f.call(e)&&(e=e.join(" ")),e=e?" "+e:"";for(var n,o,i=0,r=t.length;i<r;i++)o=(n=t[i]).tagName.toLowerCase(),-1!==["input","img"].indexOf(o)&&(p[o](n),n=n.parentElement),-1===n.className.indexOf("waves-effect")&&(n.className+=" waves-effect"+e)},l.ripple=function(t,e){var n=(t=a(t)).length;if(e=e||{},e.wait=e.wait||0,e.position=e.position||null,n)for(var o,r,s,u={},c=0,l={type:"mousedown",button:1};c<n;c++)if(o=t[c],r=e.position||{x:o.clientWidth/2,y:o.clientHeight/2},s=i(o),u.x=s.left+r.x,u.y=s.top+r.y,l.pageX=u.x,l.pageY=u.y,v.show(l,o),e.wait>=0&&null!==e.wait){var d={type:"mouseup",button:1};setTimeout(function(t,e){return function(){v.hide(t,e)}}(d,o),e.wait)}},l.calm=function(t){for(var e={type:"mouseup",button:1},n=0,o=(t=a(t)).length;n<o;n++)v.hide(e,t[n])},l.displayEffect=function(t){l.init(t)},l});

/*!
Waypoints - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
!function(){"use strict";function t(o){if(!o)throw new Error("No options passed to Waypoint constructor");if(!o.element)throw new Error("No element option passed to Waypoint constructor");if(!o.handler)throw new Error("No handler option passed to Waypoint constructor");this.key="waypoint-"+e,this.options=t.Adapter.extend({},t.defaults,o),this.element=this.options.element,this.adapter=new t.Adapter(this.element),this.callback=o.handler,this.axis=this.options.horizontal?"horizontal":"vertical",this.enabled=this.options.enabled,this.triggerPoint=null,this.group=t.Group.findOrCreate({name:this.options.group,axis:this.axis}),this.context=t.Context.findOrCreateByElement(this.options.context),t.offsetAliases[this.options.offset]&&(this.options.offset=t.offsetAliases[this.options.offset]),this.group.add(this),this.context.add(this),i[this.key]=this,e+=1}var e=0,i={};t.prototype.queueTrigger=function(t){this.group.queueTrigger(this,t)},t.prototype.trigger=function(t){this.enabled&&this.callback&&this.callback.apply(this,t)},t.prototype.destroy=function(){this.context.remove(this),this.group.remove(this),delete i[this.key]},t.prototype.disable=function(){return this.enabled=!1,this},t.prototype.enable=function(){return this.context.refresh(),this.enabled=!0,this},t.prototype.next=function(){return this.group.next(this)},t.prototype.previous=function(){return this.group.previous(this)},t.invokeAll=function(t){var e=[];for(var o in i)e.push(i[o]);for(var n=0,r=e.length;r>n;n++)e[n][t]()},t.destroyAll=function(){t.invokeAll("destroy")},t.disableAll=function(){t.invokeAll("disable")},t.enableAll=function(){t.Context.refreshAll();for(var e in i)i[e].enabled=!0;return this},t.refreshAll=function(){t.Context.refreshAll()},t.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight},t.viewportWidth=function(){return document.documentElement.clientWidth},t.adapters=[],t.defaults={context:window,continuous:!0,enabled:!0,group:"default",horizontal:!1,offset:0},t.offsetAliases={"bottom-in-view":function(){return this.context.innerHeight()-this.adapter.outerHeight()},"right-in-view":function(){return this.context.innerWidth()-this.adapter.outerWidth()}},window.Waypoint=t}(),function(){"use strict";function t(t){window.setTimeout(t,1e3/60)}function e(t){this.element=t,this.Adapter=n.Adapter,this.adapter=new this.Adapter(t),this.key="waypoint-context-"+i,this.didScroll=!1,this.didResize=!1,this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()},this.waypoints={vertical:{},horizontal:{}},t.waypointContextKey=this.key,o[t.waypointContextKey]=this,i+=1,n.windowContext||(n.windowContext=!0,n.windowContext=new e(window)),this.createThrottledScrollHandler(),this.createThrottledResizeHandler()}var i=0,o={},n=window.Waypoint,r=window.onload;e.prototype.add=function(t){var e=t.options.horizontal?"horizontal":"vertical";this.waypoints[e][t.key]=t,this.refresh()},e.prototype.checkEmpty=function(){var t=this.Adapter.isEmptyObject(this.waypoints.horizontal),e=this.Adapter.isEmptyObject(this.waypoints.vertical),i=this.element==this.element.window;t&&e&&!i&&(this.adapter.off(".waypoints"),delete o[this.key])},e.prototype.createThrottledResizeHandler=function(){function t(){e.handleResize(),e.didResize=!1}var e=this;this.adapter.on("resize.waypoints",function(){e.didResize||(e.didResize=!0,n.requestAnimationFrame(t))})},e.prototype.createThrottledScrollHandler=function(){function t(){e.handleScroll(),e.didScroll=!1}var e=this;this.adapter.on("scroll.waypoints",function(){(!e.didScroll||n.isTouch)&&(e.didScroll=!0,n.requestAnimationFrame(t))})},e.prototype.handleResize=function(){n.Context.refreshAll()},e.prototype.handleScroll=function(){var t={},e={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};for(var i in e){var o=e[i],n=o.newScroll>o.oldScroll,r=n?o.forward:o.backward;for(var s in this.waypoints[i]){var a=this.waypoints[i][s];if(null!==a.triggerPoint){var l=o.oldScroll<a.triggerPoint,h=o.newScroll>=a.triggerPoint,p=l&&h,u=!l&&!h;(p||u)&&(a.queueTrigger(r),t[a.group.id]=a.group)}}}for(var c in t)t[c].flushTriggers();this.oldScroll={x:e.horizontal.newScroll,y:e.vertical.newScroll}},e.prototype.innerHeight=function(){return this.element==this.element.window?n.viewportHeight():this.adapter.innerHeight()},e.prototype.remove=function(t){delete this.waypoints[t.axis][t.key],this.checkEmpty()},e.prototype.innerWidth=function(){return this.element==this.element.window?n.viewportWidth():this.adapter.innerWidth()},e.prototype.destroy=function(){var t=[];for(var e in this.waypoints)for(var i in this.waypoints[e])t.push(this.waypoints[e][i]);for(var o=0,n=t.length;n>o;o++)t[o].destroy()},e.prototype.refresh=function(){var t,e=this.element==this.element.window,i=e?void 0:this.adapter.offset(),o={};this.handleScroll(),t={horizontal:{contextOffset:e?0:i.left,contextScroll:e?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:e?0:i.top,contextScroll:e?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};for(var r in t){var s=t[r];for(var a in this.waypoints[r]){var l,h,p,u,c,d=this.waypoints[r][a],f=d.options.offset,w=d.triggerPoint,y=0,g=null==w;d.element!==d.element.window&&(y=d.adapter.offset()[s.offsetProp]),"function"==typeof f?f=f.apply(d):"string"==typeof f&&(f=parseFloat(f),d.options.offset.indexOf("%")>-1&&(f=Math.ceil(s.contextDimension*f/100))),l=s.contextScroll-s.contextOffset,d.triggerPoint=Math.floor(y+l-f),h=w<s.oldScroll,p=d.triggerPoint>=s.oldScroll,u=h&&p,c=!h&&!p,!g&&u?(d.queueTrigger(s.backward),o[d.group.id]=d.group):!g&&c?(d.queueTrigger(s.forward),o[d.group.id]=d.group):g&&s.oldScroll>=d.triggerPoint&&(d.queueTrigger(s.forward),o[d.group.id]=d.group)}}return n.requestAnimationFrame(function(){for(var t in o)o[t].flushTriggers()}),this},e.findOrCreateByElement=function(t){return e.findByElement(t)||new e(t)},e.refreshAll=function(){for(var t in o)o[t].refresh()},e.findByElement=function(t){return o[t.waypointContextKey]},window.onload=function(){r&&r(),e.refreshAll()},n.requestAnimationFrame=function(e){var i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||t;i.call(window,e)},n.Context=e}(),function(){"use strict";function t(t,e){return t.triggerPoint-e.triggerPoint}function e(t,e){return e.triggerPoint-t.triggerPoint}function i(t){this.name=t.name,this.axis=t.axis,this.id=this.name+"-"+this.axis,this.waypoints=[],this.clearTriggerQueues(),o[this.axis][this.name]=this}var o={vertical:{},horizontal:{}},n=window.Waypoint;i.prototype.add=function(t){this.waypoints.push(t)},i.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}},i.prototype.flushTriggers=function(){for(var i in this.triggerQueues){var o=this.triggerQueues[i],n="up"===i||"left"===i;o.sort(n?e:t);for(var r=0,s=o.length;s>r;r+=1){var a=o[r];(a.options.continuous||r===o.length-1)&&a.trigger([i])}}this.clearTriggerQueues()},i.prototype.next=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints),o=i===this.waypoints.length-1;return o?null:this.waypoints[i+1]},i.prototype.previous=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints);return i?this.waypoints[i-1]:null},i.prototype.queueTrigger=function(t,e){this.triggerQueues[e].push(t)},i.prototype.remove=function(t){var e=n.Adapter.inArray(t,this.waypoints);e>-1&&this.waypoints.splice(e,1)},i.prototype.first=function(){return this.waypoints[0]},i.prototype.last=function(){return this.waypoints[this.waypoints.length-1]},i.findOrCreate=function(t){return o[t.axis][t.name]||new i(t)},n.Group=i}(),function(){"use strict";function t(t){this.$element=e(t)}var e=window.jQuery,i=window.Waypoint;e.each(["innerHeight","innerWidth","off","offset","on","outerHeight","outerWidth","scrollLeft","scrollTop"],function(e,i){t.prototype[i]=function(){var t=Array.prototype.slice.call(arguments);return this.$element[i].apply(this.$element,t)}}),e.each(["extend","inArray","isEmptyObject"],function(i,o){t[o]=e[o]}),i.adapters.push({name:"jquery",Adapter:t}),i.Adapter=t}(),function(){"use strict";function t(t){return function(){var i=[],o=arguments[0];return t.isFunction(arguments[0])&&(o=t.extend({},arguments[1]),o.handler=arguments[0]),this.each(function(){var n=t.extend({},o,{element:this});"string"==typeof n.context&&(n.context=t(this).closest(n.context)[0]),i.push(new e(n))}),i}}var e=window.Waypoint;window.jQuery&&(window.jQuery.fn.waypoint=t(window.jQuery)),window.Zepto&&(window.Zepto.fn.waypoint=t(window.Zepto))}();
(function($){"use strict";$.fn.counterUp=function(options){var settings=$.extend({time:400,delay:10,offset:100,beginAt:0,formatter:false,context:"window",callback:function(){}},options),s;return this.each(function(){var $this=$(this),counter={time:$(this).data("counterup-time")||settings.time,delay:$(this).data("counterup-delay")||settings.delay,offset:$(this).data("counterup-offset")||settings.offset,beginAt:$(this).data("counterup-beginat")||settings.beginAt,context:$(this).data("counterup-context")||settings.context};var counterUpper=function(){var nums=[];var divisions=counter.time/counter.delay;var num=$(this).attr("data-num")?$(this).attr("data-num"):$this.text();var isComma=/[0-9]+,[0-9]+/.test(num);num=num.replace(/,/g,"");var decimalPlaces=(num.split(".")[1]||[]).length;if(counter.beginAt>num)counter.beginAt=num;var isTime=/[0-9]+:[0-9]+:[0-9]+/.test(num);if(isTime){var times=num.split(":"),m=1;s=0;while(times.length>0){s+=m*parseInt(times.pop(),10);m*=60}}for(var i=divisions;i>=counter.beginAt/num*divisions;i--){var newNum=parseFloat(num/divisions*i).toFixed(decimalPlaces);if(isTime){newNum=parseInt(s/divisions*i);var hours=parseInt(newNum/3600)%24;var minutes=parseInt(newNum/60)%60;var seconds=parseInt(newNum%60,10);newNum=(hours<10?"0"+hours:hours)+":"+(minutes<10?"0"+minutes:minutes)+":"+(seconds<10?"0"+seconds:seconds)}if(isComma){while(/(\d+)(\d{3})/.test(newNum.toString())){newNum=newNum.toString().replace(/(\d+)(\d{3})/,"$1"+","+"$2")}}if(settings.formatter){newNum=settings.formatter.call(this,newNum)}nums.unshift(newNum)}$this.data("counterup-nums",nums);$this.text(counter.beginAt);var f=function(){if(!$this.data("counterup-nums")){settings.callback.call(this);return}$this.html($this.data("counterup-nums").shift());if($this.data("counterup-nums").length){setTimeout($this.data("counterup-func"),counter.delay)}else{$this.data("counterup-nums",null);$this.data("counterup-func",null);settings.callback.call(this)}};$this.data("counterup-func",f);setTimeout($this.data("counterup-func"),counter.delay)};$this.waypoint(function(direction){counterUpper();this.destroy()},{offset:counter.offset+"%",context:counter.context})})}})(jQuery);

!function(e,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports.feather=n():e.feather=n()}("undefined"!=typeof self?self:this,function(){return function(e){var n={};function i(t){if(n[t])return n[t].exports;var l=n[t]={i:t,l:!1,exports:{}};return e[t].call(l.exports,l,l.exports,i),l.l=!0,l.exports}return i.m=e,i.c=n,i.d=function(e,n,t){i.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:t})},i.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},i.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(n,"a",n),n},i.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},i.p="",i(i.s=80)}([function(e,n,i){(function(n){var i="object",t=function(e){return e&&e.Math==Math&&e};e.exports=t(typeof globalThis==i&&globalThis)||t(typeof window==i&&window)||t(typeof self==i&&self)||t(typeof n==i&&n)||Function("return this")()}).call(this,i(75))},function(e,n){var i={}.hasOwnProperty;e.exports=function(e,n){return i.call(e,n)}},function(e,n,i){var t=i(0),l=i(11),r=i(33),o=i(62),a=t.Symbol,c=l("wks");e.exports=function(e){return c[e]||(c[e]=o&&a[e]||(o?a:r)("Symbol."+e))}},function(e,n,i){var t=i(6);e.exports=function(e){if(!t(e))throw TypeError(String(e)+" is not an object");return e}},function(e,n){e.exports=function(e){try{return!!e()}catch(e){return!0}}},function(e,n,i){var t=i(8),l=i(7),r=i(10);e.exports=t?function(e,n,i){return l.f(e,n,r(1,i))}:function(e,n,i){return e[n]=i,e}},function(e,n){e.exports=function(e){return"object"==typeof e?null!==e:"function"==typeof e}},function(e,n,i){var t=i(8),l=i(35),r=i(3),o=i(18),a=Object.defineProperty;n.f=t?a:function(e,n,i){if(r(e),n=o(n,!0),r(i),l)try{return a(e,n,i)}catch(e){}if("get"in i||"set"in i)throw TypeError("Accessors not supported");return"value"in i&&(e[n]=i.value),e}},function(e,n,i){var t=i(4);e.exports=!t(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(e,n){e.exports={}},function(e,n){e.exports=function(e,n){return{enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:n}}},function(e,n,i){var t=i(0),l=i(19),r=i(17),o=t["__core-js_shared__"]||l("__core-js_shared__",{});(e.exports=function(e,n){return o[e]||(o[e]=void 0!==n?n:{})})("versions",[]).push({version:"3.1.3",mode:r?"pure":"global",copyright:"© 2019 Denis Pushkarev (zloirock.ru)"})},function(e,n,i){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var t=o(i(43)),l=o(i(41)),r=o(i(40));function o(e){return e&&e.__esModule?e:{default:e}}n.default=Object.keys(l.default).map(function(e){return new t.default(e,l.default[e],r.default[e])}).reduce(function(e,n){return e[n.name]=n,e},{})},function(e,n){e.exports=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"]},function(e,n,i){var t=i(72),l=i(20);e.exports=function(e){return t(l(e))}},function(e,n){e.exports={}},function(e,n,i){var t=i(11),l=i(33),r=t("keys");e.exports=function(e){return r[e]||(r[e]=l(e))}},function(e,n){e.exports=!1},function(e,n,i){var t=i(6);e.exports=function(e,n){if(!t(e))return e;var i,l;if(n&&"function"==typeof(i=e.toString)&&!t(l=i.call(e)))return l;if("function"==typeof(i=e.valueOf)&&!t(l=i.call(e)))return l;if(!n&&"function"==typeof(i=e.toString)&&!t(l=i.call(e)))return l;throw TypeError("Can't convert object to primitive value")}},function(e,n,i){var t=i(0),l=i(5);e.exports=function(e,n){try{l(t,e,n)}catch(i){t[e]=n}return n}},function(e,n){e.exports=function(e){if(void 0==e)throw TypeError("Can't call method on "+e);return e}},function(e,n){var i=Math.ceil,t=Math.floor;e.exports=function(e){return isNaN(e=+e)?0:(e>0?t:i)(e)}},function(e,n,i){var t;
/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
!function(){"use strict";var i=function(){function e(){}function n(e,n){for(var i=n.length,t=0;t<i;++t)l(e,n[t])}e.prototype=Object.create(null);var i={}.hasOwnProperty;var t=/\s+/;function l(e,l){if(l){var r=typeof l;"string"===r?function(e,n){for(var i=n.split(t),l=i.length,r=0;r<l;++r)e[i[r]]=!0}(e,l):Array.isArray(l)?n(e,l):"object"===r?function(e,n){for(var t in n)i.call(n,t)&&(e[t]=!!n[t])}(e,l):"number"===r&&function(e,n){e[n]=!0}(e,l)}}return function(){for(var i=arguments.length,t=Array(i),l=0;l<i;l++)t[l]=arguments[l];var r=new e;n(r,t);var o=[];for(var a in r)r[a]&&o.push(a);return o.join(" ")}}();void 0!==e&&e.exports?e.exports=i:void 0===(t=function(){return i}.apply(n,[]))||(e.exports=t)}()},function(e,n,i){var t=i(7).f,l=i(1),r=i(2)("toStringTag");e.exports=function(e,n,i){e&&!l(e=i?e:e.prototype,r)&&t(e,r,{configurable:!0,value:n})}},function(e,n,i){var t=i(20);e.exports=function(e){return Object(t(e))}},function(e,n,i){var t=i(1),l=i(24),r=i(16),o=i(63),a=r("IE_PROTO"),c=Object.prototype;e.exports=o?Object.getPrototypeOf:function(e){return e=l(e),t(e,a)?e[a]:"function"==typeof e.constructor&&e instanceof e.constructor?e.constructor.prototype:e instanceof Object?c:null}},function(e,n,i){"use strict";var t,l,r,o=i(25),a=i(5),c=i(1),p=i(2),y=i(17),h=p("iterator"),x=!1;[].keys&&("next"in(r=[].keys())?(l=o(o(r)))!==Object.prototype&&(t=l):x=!0),void 0==t&&(t={}),y||c(t,h)||a(t,h,function(){return this}),e.exports={IteratorPrototype:t,BUGGY_SAFARI_ITERATORS:x}},function(e,n,i){var t=i(21),l=Math.min;e.exports=function(e){return e>0?l(t(e),9007199254740991):0}},function(e,n,i){var t=i(1),l=i(14),r=i(68),o=i(15),a=r(!1);e.exports=function(e,n){var i,r=l(e),c=0,p=[];for(i in r)!t(o,i)&&t(r,i)&&p.push(i);for(;n.length>c;)t(r,i=n[c++])&&(~a(p,i)||p.push(i));return p}},function(e,n,i){var t=i(0),l=i(11),r=i(5),o=i(1),a=i(19),c=i(36),p=i(37),y=p.get,h=p.enforce,x=String(c).split("toString");l("inspectSource",function(e){return c.call(e)}),(e.exports=function(e,n,i,l){var c=!!l&&!!l.unsafe,p=!!l&&!!l.enumerable,y=!!l&&!!l.noTargetGet;"function"==typeof i&&("string"!=typeof n||o(i,"name")||r(i,"name",n),h(i).source=x.join("string"==typeof n?n:"")),e!==t?(c?!y&&e[n]&&(p=!0):delete e[n],p?e[n]=i:r(e,n,i)):p?e[n]=i:a(n,i)})(Function.prototype,"toString",function(){return"function"==typeof this&&y(this).source||c.call(this)})},function(e,n){var i={}.toString;e.exports=function(e){return i.call(e).slice(8,-1)}},function(e,n,i){var t=i(8),l=i(73),r=i(10),o=i(14),a=i(18),c=i(1),p=i(35),y=Object.getOwnPropertyDescriptor;n.f=t?y:function(e,n){if(e=o(e),n=a(n,!0),p)try{return y(e,n)}catch(e){}if(c(e,n))return r(!l.f.call(e,n),e[n])}},function(e,n,i){var t=i(0),l=i(31).f,r=i(5),o=i(29),a=i(19),c=i(71),p=i(65);e.exports=function(e,n){var i,y,h,x,s,u=e.target,d=e.global,f=e.stat;if(i=d?t:f?t[u]||a(u,{}):(t[u]||{}).prototype)for(y in n){if(x=n[y],h=e.noTargetGet?(s=l(i,y))&&s.value:i[y],!p(d?y:u+(f?".":"#")+y,e.forced)&&void 0!==h){if(typeof x==typeof h)continue;c(x,h)}(e.sham||h&&h.sham)&&r(x,"sham",!0),o(i,y,x,e)}}},function(e,n){var i=0,t=Math.random();e.exports=function(e){return"Symbol(".concat(void 0===e?"":e,")_",(++i+t).toString(36))}},function(e,n,i){var t=i(0),l=i(6),r=t.document,o=l(r)&&l(r.createElement);e.exports=function(e){return o?r.createElement(e):{}}},function(e,n,i){var t=i(8),l=i(4),r=i(34);e.exports=!t&&!l(function(){return 7!=Object.defineProperty(r("div"),"a",{get:function(){return 7}}).a})},function(e,n,i){var t=i(11);e.exports=t("native-function-to-string",Function.toString)},function(e,n,i){var t,l,r,o=i(76),a=i(0),c=i(6),p=i(5),y=i(1),h=i(16),x=i(15),s=a.WeakMap;if(o){var u=new s,d=u.get,f=u.has,g=u.set;t=function(e,n){return g.call(u,e,n),n},l=function(e){return d.call(u,e)||{}},r=function(e){return f.call(u,e)}}else{var v=h("state");x[v]=!0,t=function(e,n){return p(e,v,n),n},l=function(e){return y(e,v)?e[v]:{}},r=function(e){return y(e,v)}}e.exports={set:t,get:l,has:r,enforce:function(e){return r(e)?l(e):t(e,{})},getterFor:function(e){return function(n){var i;if(!c(n)||(i=l(n)).type!==e)throw TypeError("Incompatible receiver, "+e+" required");return i}}}},function(e,n,i){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var t=Object.assign||function(e){for(var n=1;n<arguments.length;n++){var i=arguments[n];for(var t in i)Object.prototype.hasOwnProperty.call(i,t)&&(e[t]=i[t])}return e},l=o(i(22)),r=o(i(12));function o(e){return e&&e.__esModule?e:{default:e}}n.default=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if("undefined"==typeof document)throw new Error("`feather.replace()` only works in a browser environment.");var n=document.querySelectorAll("[data-feather]");Array.from(n).forEach(function(n){return function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=function(e){return Array.from(e.attributes).reduce(function(e,n){return e[n.name]=n.value,e},{})}(e),o=i["data-feather"];if(delete i["data-feather"],void 0!==r.default[o]){var a=r.default[o].toSvg(t({},n,i,{class:(0,l.default)(n.class,i.class)})),c=(new DOMParser).parseFromString(a,"image/svg+xml").querySelector("svg");e.parentNode.replaceChild(c,e)}else console.warn("feather: '"+o+"' is not a valid icon")}(n,e)})}},function(e,n,i){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var t,l=i(12),r=(t=l)&&t.__esModule?t:{default:t};n.default=function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(console.warn("feather.toSvg() is deprecated. Please use feather.icons[name].toSvg() instead."),!e)throw new Error("The required `key` (icon name) parameter is missing.");if(!r.default[e])throw new Error("No icon matching '"+e+"'. See the complete list of icons at https://feathericons.com");return r.default[e].toSvg(n)}},function(e){e.exports={activity:["pulse","health","action","motion"],airplay:["stream","cast","mirroring"],"alert-circle":["warning","alert","danger"],"alert-octagon":["warning","alert","danger"],"alert-triangle":["warning","alert","danger"],"align-center":["text alignment","center"],"align-justify":["text alignment","justified"],"align-left":["text alignment","left"],"align-right":["text alignment","right"],anchor:[],archive:["index","box"],"at-sign":["mention","at","email","message"],award:["achievement","badge"],aperture:["camera","photo"],"bar-chart":["statistics","diagram","graph"],"bar-chart-2":["statistics","diagram","graph"],battery:["power","electricity"],"battery-charging":["power","electricity"],bell:["alarm","notification","sound"],"bell-off":["alarm","notification","silent"],bluetooth:["wireless"],"book-open":["read","library"],book:["read","dictionary","booklet","magazine","library"],bookmark:["read","clip","marker","tag"],box:["cube"],briefcase:["work","bag","baggage","folder"],calendar:["date"],camera:["photo"],cast:["chromecast","airplay"],"chevron-down":["expand"],"chevron-up":["collapse"],circle:["off","zero","record"],clipboard:["copy"],clock:["time","watch","alarm"],"cloud-drizzle":["weather","shower"],"cloud-lightning":["weather","bolt"],"cloud-rain":["weather"],"cloud-snow":["weather","blizzard"],cloud:["weather"],codepen:["logo"],codesandbox:["logo"],code:["source","programming"],coffee:["drink","cup","mug","tea","cafe","hot","beverage"],columns:["layout"],command:["keyboard","cmd","terminal","prompt"],compass:["navigation","safari","travel","direction"],copy:["clone","duplicate"],"corner-down-left":["arrow","return"],"corner-down-right":["arrow"],"corner-left-down":["arrow"],"corner-left-up":["arrow"],"corner-right-down":["arrow"],"corner-right-up":["arrow"],"corner-up-left":["arrow"],"corner-up-right":["arrow"],cpu:["processor","technology"],"credit-card":["purchase","payment","cc"],crop:["photo","image"],crosshair:["aim","target"],database:["storage","memory"],delete:["remove"],disc:["album","cd","dvd","music"],"dollar-sign":["currency","money","payment"],droplet:["water"],edit:["pencil","change"],"edit-2":["pencil","change"],"edit-3":["pencil","change"],eye:["view","watch"],"eye-off":["view","watch","hide","hidden"],"external-link":["outbound"],facebook:["logo","social"],"fast-forward":["music"],figma:["logo","design","tool"],"file-minus":["delete","remove","erase"],"file-plus":["add","create","new"],"file-text":["data","txt","pdf"],film:["movie","video"],filter:["funnel","hopper"],flag:["report"],"folder-minus":["directory"],"folder-plus":["directory"],folder:["directory"],framer:["logo","design","tool"],frown:["emoji","face","bad","sad","emotion"],gift:["present","box","birthday","party"],"git-branch":["code","version control"],"git-commit":["code","version control"],"git-merge":["code","version control"],"git-pull-request":["code","version control"],github:["logo","version control"],gitlab:["logo","version control"],globe:["world","browser","language","translate"],"hard-drive":["computer","server","memory","data"],hash:["hashtag","number","pound"],headphones:["music","audio","sound"],heart:["like","love","emotion"],"help-circle":["question mark"],hexagon:["shape","node.js","logo"],home:["house","living"],image:["picture"],inbox:["email"],instagram:["logo","camera"],key:["password","login","authentication","secure"],layers:["stack"],layout:["window","webpage"],"life-buoy":["help","life ring","support"],link:["chain","url"],"link-2":["chain","url"],linkedin:["logo","social media"],list:["options"],lock:["security","password","secure"],"log-in":["sign in","arrow","enter"],"log-out":["sign out","arrow","exit"],mail:["email","message"],"map-pin":["location","navigation","travel","marker"],map:["location","navigation","travel"],maximize:["fullscreen"],"maximize-2":["fullscreen","arrows","expand"],meh:["emoji","face","neutral","emotion"],menu:["bars","navigation","hamburger"],"message-circle":["comment","chat"],"message-square":["comment","chat"],"mic-off":["record","sound","mute"],mic:["record","sound","listen"],minimize:["exit fullscreen","close"],"minimize-2":["exit fullscreen","arrows","close"],minus:["subtract"],monitor:["tv","screen","display"],moon:["dark","night"],"more-horizontal":["ellipsis"],"more-vertical":["ellipsis"],"mouse-pointer":["arrow","cursor"],move:["arrows"],music:["note"],navigation:["location","travel"],"navigation-2":["location","travel"],octagon:["stop"],package:["box","container"],paperclip:["attachment"],pause:["music","stop"],"pause-circle":["music","audio","stop"],"pen-tool":["vector","drawing"],percent:["discount"],"phone-call":["ring"],"phone-forwarded":["call"],"phone-incoming":["call"],"phone-missed":["call"],"phone-off":["call","mute"],"phone-outgoing":["call"],phone:["call"],play:["music","start"],"pie-chart":["statistics","diagram"],"play-circle":["music","start"],plus:["add","new"],"plus-circle":["add","new"],"plus-square":["add","new"],pocket:["logo","save"],power:["on","off"],printer:["fax","office","device"],radio:["signal"],"refresh-cw":["synchronise","arrows"],"refresh-ccw":["arrows"],repeat:["loop","arrows"],rewind:["music"],"rotate-ccw":["arrow"],"rotate-cw":["arrow"],rss:["feed","subscribe"],save:["floppy disk"],scissors:["cut"],search:["find","magnifier","magnifying glass"],send:["message","mail","email","paper airplane","paper aeroplane"],settings:["cog","edit","gear","preferences"],"share-2":["network","connections"],shield:["security","secure"],"shield-off":["security","insecure"],"shopping-bag":["ecommerce","cart","purchase","store"],"shopping-cart":["ecommerce","cart","purchase","store"],shuffle:["music"],"skip-back":["music"],"skip-forward":["music"],slack:["logo"],slash:["ban","no"],sliders:["settings","controls"],smartphone:["cellphone","device"],smile:["emoji","face","happy","good","emotion"],speaker:["audio","music"],star:["bookmark","favorite","like"],"stop-circle":["media","music"],sun:["brightness","weather","light"],sunrise:["weather","time","morning","day"],sunset:["weather","time","evening","night"],tablet:["device"],tag:["label"],target:["logo","bullseye"],terminal:["code","command line","prompt"],thermometer:["temperature","celsius","fahrenheit","weather"],"thumbs-down":["dislike","bad","emotion"],"thumbs-up":["like","good","emotion"],"toggle-left":["on","off","switch"],"toggle-right":["on","off","switch"],tool:["settings","spanner"],trash:["garbage","delete","remove","bin"],"trash-2":["garbage","delete","remove","bin"],triangle:["delta"],truck:["delivery","van","shipping","transport","lorry"],tv:["television","stream"],twitch:["logo"],twitter:["logo","social"],type:["text"],umbrella:["rain","weather"],unlock:["security"],"user-check":["followed","subscribed"],"user-minus":["delete","remove","unfollow","unsubscribe"],"user-plus":["new","add","create","follow","subscribe"],"user-x":["delete","remove","unfollow","unsubscribe","unavailable"],user:["person","account"],users:["group"],"video-off":["camera","movie","film"],video:["camera","movie","film"],voicemail:["phone"],volume:["music","sound","mute"],"volume-1":["music","sound"],"volume-2":["music","sound"],"volume-x":["music","sound","mute"],watch:["clock","time"],"wifi-off":["disabled"],wifi:["connection","signal","wireless"],wind:["weather","air"],"x-circle":["cancel","close","delete","remove","times","clear"],"x-octagon":["delete","stop","alert","warning","times","clear"],"x-square":["cancel","close","delete","remove","times","clear"],x:["cancel","close","delete","remove","times","clear"],youtube:["logo","video","play"],"zap-off":["flash","camera","lightning"],zap:["flash","camera","lightning"],"zoom-in":["magnifying glass"],"zoom-out":["magnifying glass"]}},function(e){e.exports={activity:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',airplay:'<path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path><polygon points="12 15 17 21 7 21 12 15"></polygon>',"alert-circle":'<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',"alert-octagon":'<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',"alert-triangle":'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',"align-center":'<line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line>',"align-justify":'<line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line>',"align-left":'<line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line>',"align-right":'<line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line>',anchor:'<circle cx="12" cy="5" r="3"></circle><line x1="12" y1="22" x2="12" y2="8"></line><path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>',aperture:'<circle cx="12" cy="12" r="10"></circle><line x1="14.31" y1="8" x2="20.05" y2="17.94"></line><line x1="9.69" y1="8" x2="21.17" y2="8"></line><line x1="7.38" y1="12" x2="13.12" y2="2.06"></line><line x1="9.69" y1="16" x2="3.95" y2="6.06"></line><line x1="14.31" y1="16" x2="2.83" y2="16"></line><line x1="16.62" y1="12" x2="10.88" y2="21.94"></line>',archive:'<polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line>',"arrow-down-circle":'<circle cx="12" cy="12" r="10"></circle><polyline points="8 12 12 16 16 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line>',"arrow-down-left":'<line x1="17" y1="7" x2="7" y2="17"></line><polyline points="17 17 7 17 7 7"></polyline>',"arrow-down-right":'<line x1="7" y1="7" x2="17" y2="17"></line><polyline points="17 7 17 17 7 17"></polyline>',"arrow-down":'<line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline>',"arrow-left-circle":'<circle cx="12" cy="12" r="10"></circle><polyline points="12 8 8 12 12 16"></polyline><line x1="16" y1="12" x2="8" y2="12"></line>',"arrow-left":'<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>',"arrow-right-circle":'<circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line>',"arrow-right":'<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>',"arrow-up-circle":'<circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line>',"arrow-up-left":'<line x1="17" y1="17" x2="7" y2="7"></line><polyline points="7 17 7 7 17 7"></polyline>',"arrow-up-right":'<line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline>',"arrow-up":'<line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline>',"at-sign":'<circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>',award:'<circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>',"bar-chart-2":'<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',"bar-chart":'<line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line>',"battery-charging":'<path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.19"></path><line x1="23" y1="13" x2="23" y2="11"></line><polyline points="11 6 7 12 13 12 9 18"></polyline>',battery:'<rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line>',"bell-off":'<path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path><path d="M18 8a6 6 0 0 0-9.33-5"></path><line x1="1" y1="1" x2="23" y2="23"></line>',bell:'<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',bluetooth:'<polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"></polyline>',bold:'<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>',"book-open":'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>',book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>',bookmark:'<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>',box:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>',briefcase:'<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',calendar:'<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',"camera-off":'<line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"></path>',camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>',cast:'<path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path><line x1="2" y1="20" x2="2.01" y2="20"></line>',"check-circle":'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',"check-square":'<polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',check:'<polyline points="20 6 9 17 4 12"></polyline>',"chevron-down":'<polyline points="6 9 12 15 18 9"></polyline>',"chevron-left":'<polyline points="15 18 9 12 15 6"></polyline>',"chevron-right":'<polyline points="9 18 15 12 9 6"></polyline>',"chevron-up":'<polyline points="18 15 12 9 6 15"></polyline>',"chevrons-down":'<polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline>',"chevrons-left":'<polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline>',"chevrons-right":'<polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline>',"chevrons-up":'<polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline>',chrome:'<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>',circle:'<circle cx="12" cy="12" r="10"></circle>',clipboard:'<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>',clock:'<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',"cloud-drizzle":'<line x1="8" y1="19" x2="8" y2="21"></line><line x1="8" y1="13" x2="8" y2="15"></line><line x1="16" y1="19" x2="16" y2="21"></line><line x1="16" y1="13" x2="16" y2="15"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="12" y1="15" x2="12" y2="17"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>',"cloud-lightning":'<path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path><polyline points="13 11 9 17 15 17 11 23"></polyline>',"cloud-off":'<path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"></path><line x1="1" y1="1" x2="23" y2="23"></line>',"cloud-rain":'<line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>',"cloud-snow":'<path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="8" y1="20" x2="8.01" y2="20"></line><line x1="12" y1="18" x2="12.01" y2="18"></line><line x1="12" y1="22" x2="12.01" y2="22"></line><line x1="16" y1="16" x2="16.01" y2="16"></line><line x1="16" y1="20" x2="16.01" y2="20"></line>',cloud:'<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>',code:'<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',codepen:'<polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon><line x1="12" y1="22" x2="12" y2="15.5"></line><polyline points="22 8.5 12 15.5 2 8.5"></polyline><polyline points="2 15.5 12 8.5 22 15.5"></polyline><line x1="12" y1="2" x2="12" y2="8.5"></line>',codesandbox:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline><polyline points="7.5 19.79 7.5 14.6 3 12"></polyline><polyline points="21 12 16.5 14.6 16.5 19.79"></polyline><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>',coffee:'<path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line>',columns:'<path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"></path>',command:'<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>',compass:'<circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>',copy:'<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',"corner-down-left":'<polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path>',"corner-down-right":'<polyline points="15 10 20 15 15 20"></polyline><path d="M4 4v7a4 4 0 0 0 4 4h12"></path>',"corner-left-down":'<polyline points="14 15 9 20 4 15"></polyline><path d="M20 4h-7a4 4 0 0 0-4 4v12"></path>',"corner-left-up":'<polyline points="14 9 9 4 4 9"></polyline><path d="M20 20h-7a4 4 0 0 1-4-4V4"></path>',"corner-right-down":'<polyline points="10 15 15 20 20 15"></polyline><path d="M4 4h7a4 4 0 0 1 4 4v12"></path>',"corner-right-up":'<polyline points="10 9 15 4 20 9"></polyline><path d="M4 20h7a4 4 0 0 0 4-4V4"></path>',"corner-up-left":'<polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>',"corner-up-right":'<polyline points="15 14 20 9 15 4"></polyline><path d="M4 20v-7a4 4 0 0 1 4-4h12"></path>',cpu:'<rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line>',"credit-card":'<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>',crop:'<path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path>',crosshair:'<circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line>',database:'<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>',delete:'<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line>',disc:'<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle>',"divide-circle":'<line x1="8" y1="12" x2="16" y2="12"></line><line x1="12" y1="16" x2="12" y2="16"></line><line x1="12" y1="8" x2="12" y2="8"></line><circle cx="12" cy="12" r="10"></circle>',"divide-square":'<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line><line x1="12" y1="16" x2="12" y2="16"></line><line x1="12" y1="8" x2="12" y2="8"></line>',divide:'<circle cx="12" cy="6" r="2"></circle><line x1="5" y1="12" x2="19" y2="12"></line><circle cx="12" cy="18" r="2"></circle>',"dollar-sign":'<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',"download-cloud":'<polyline points="8 17 12 21 16 17"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path>',download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>',dribbble:'<circle cx="12" cy="12" r="10"></circle><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"></path>',droplet:'<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>',"edit-2":'<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>',"edit-3":'<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',"external-link":'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',"eye-off":'<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>',eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>',facebook:'<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>',"fast-forward":'<polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon>',feather:'<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line>',figma:'<path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path>',"file-minus":'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line>',"file-plus":'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line>',"file-text":'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>',file:'<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline>',film:'<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line>',filter:'<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>',flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>',"folder-minus":'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="9" y1="14" x2="15" y2="14"></line>',"folder-plus":'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line>',folder:'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>',framer:'<path d="M5 16V9h14V2H5l14 14h-7m-7 0l7 7v-7m-7 0h7"></path>',frown:'<circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>',gift:'<polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>',"git-branch":'<line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path>',"git-commit":'<circle cx="12" cy="12" r="4"></circle><line x1="1.05" y1="12" x2="7" y2="12"></line><line x1="17.01" y1="12" x2="22.96" y2="12"></line>',"git-merge":'<circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M6 21V9a9 9 0 0 0 9 9"></path>',"git-pull-request":'<circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line>',github:'<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>',gitlab:'<path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"></path>',globe:'<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',grid:'<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',"hard-drive":'<line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line>',hash:'<line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line>',headphones:'<path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>',heart:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',"help-circle":'<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>',hexagon:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>',home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',image:'<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>',inbox:'<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>',info:'<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',instagram:'<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',italic:'<line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line>',key:'<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>',layers:'<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',layout:'<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>',"life-buoy":'<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>',"link-2":'<path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"></path><line x1="8" y1="12" x2="16" y2="12"></line>',link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>',linkedin:'<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>',list:'<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>',loader:'<line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>',lock:'<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',"log-in":'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line>',"log-out":'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>',mail:'<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',"map-pin":'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',map:'<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line>',"maximize-2":'<polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>',maximize:'<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>',meh:'<circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>',menu:'<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>',"message-circle":'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>',"message-square":'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',"mic-off":'<line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line>',mic:'<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line>',"minimize-2":'<polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line>',minimize:'<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>',"minus-circle":'<circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line>',"minus-square":'<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line>',minus:'<line x1="5" y1="12" x2="19" y2="12"></line>',monitor:'<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',moon:'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',"more-horizontal":'<circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>',"more-vertical":'<circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>',"mouse-pointer":'<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path><path d="M13 13l6 6"></path>',move:'<polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="15 19 12 22 9 19"></polyline><polyline points="19 9 22 12 19 15"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line>',music:'<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>',"navigation-2":'<polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>',navigation:'<polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>',octagon:'<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>',package:'<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>',paperclip:'<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>',"pause-circle":'<circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line>',pause:'<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>',"pen-tool":'<path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle>',percent:'<line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle>',"phone-call":'<path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',"phone-forwarded":'<polyline points="19 1 23 5 19 9"></polyline><line x1="15" y1="5" x2="23" y2="5"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',"phone-incoming":'<polyline points="16 2 16 8 22 8"></polyline><line x1="23" y1="1" x2="16" y2="8"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',"phone-missed":'<line x1="23" y1="1" x2="17" y2="7"></line><line x1="17" y1="1" x2="23" y2="7"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',"phone-off":'<path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line>',"phone-outgoing":'<polyline points="23 7 23 1 17 1"></polyline><line x1="16" y1="8" x2="23" y2="1"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',"pie-chart":'<path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>',"play-circle":'<circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon>',play:'<polygon points="5 3 19 12 5 21 5 3"></polygon>',"plus-circle":'<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>',"plus-square":'<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>',plus:'<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',pocket:'<path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z"></path><polyline points="8 10 12 14 16 10"></polyline>',power:'<path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line>',printer:'<polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect>',radio:'<circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path>',"refresh-ccw":'<polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>',"refresh-cw":'<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>',repeat:'<polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>',rewind:'<polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon>',"rotate-ccw":'<polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>',"rotate-cw":'<polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>',rss:'<path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline>',scissors:'<circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line>',search:'<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',send:'<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>',server:'<rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line>',settings:'<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',"share-2":'<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>',share:'<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line>',"shield-off":'<path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18"></path><path d="M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38"></path><line x1="1" y1="1" x2="23" y2="23"></line>',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',"shopping-bag":'<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>',"shopping-cart":'<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>',shuffle:'<polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line>',sidebar:'<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line>',"skip-back":'<polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line>',"skip-forward":'<polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line>',slack:'<path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"></path><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"></path><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"></path><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"></path><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"></path><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"></path><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"></path>',slash:'<circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>',sliders:'<line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line>',smartphone:'<rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>',smile:'<circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>',speaker:'<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><circle cx="12" cy="14" r="4"></circle><line x1="12" y1="6" x2="12.01" y2="6"></line>',square:'<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>',star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',"stop-circle":'<circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6"></rect>',sun:'<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>',sunrise:'<path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="2" x2="12" y2="9"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="8 6 12 2 16 6"></polyline>',sunset:'<path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="9" x2="12" y2="2"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="16 5 12 9 8 5"></polyline>',table:'<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path>',tablet:'<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>',tag:'<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>',target:'<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>',terminal:'<polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line>',thermometer:'<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>',"thumbs-down":'<path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>',"thumbs-up":'<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>',"toggle-left":'<rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect><circle cx="8" cy="12" r="3"></circle>',"toggle-right":'<rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect><circle cx="16" cy="12" r="3"></circle>',tool:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>',"trash-2":'<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>',trash:'<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>',trello:'<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="9"></rect><rect x="14" y="7" width="3" height="5"></rect>',"trending-down":'<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline>',"trending-up":'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>',triangle:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>',truck:'<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>',tv:'<rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline>',twitch:'<path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"></path>',twitter:'<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>',type:'<polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line>',umbrella:'<path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"></path>',underline:'<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line>',unlock:'<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>',"upload-cloud":'<polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>',"user-check":'<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline>',"user-minus":'<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="23" y1="11" x2="17" y2="11"></line>',"user-plus":'<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line>',"user-x":'<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line>',user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',"video-off":'<path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line>',video:'<polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>',voicemail:'<circle cx="5.5" cy="11.5" r="4.5"></circle><circle cx="18.5" cy="11.5" r="4.5"></circle><line x1="5.5" y1="16" x2="18.5" y2="16"></line>',"volume-1":'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>',"volume-2":'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>',"volume-x":'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>',volume:'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>',watch:'<circle cx="12" cy="12" r="7"></circle><polyline points="12 9 12 12 13.5 13.5"></polyline><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"></path>',"wifi-off":'<line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line>',wifi:'<path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line>',wind:'<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>',"x-circle":'<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>',"x-octagon":'<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>',"x-square":'<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line>',x:'<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',youtube:'<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>',"zap-off":'<polyline points="12.41 6.75 13 2 10.57 4.92"></polyline><polyline points="18.57 12.91 21 10 15.66 10"></polyline><polyline points="8 8 3 14 12 14 11 22 16 16"></polyline><line x1="1" y1="1" x2="23" y2="23"></line>',zap:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',"zoom-in":'<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line>',"zoom-out":'<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line>'}},function(e){e.exports={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"}},function(e,n,i){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var t=Object.assign||function(e){for(var n=1;n<arguments.length;n++){var i=arguments[n];for(var t in i)Object.prototype.hasOwnProperty.call(i,t)&&(e[t]=i[t])}return e},l=function(){function e(e,n){for(var i=0;i<n.length;i++){var t=n[i];t.enumerable=t.enumerable||!1,t.configurable=!0,"value"in t&&(t.writable=!0),Object.defineProperty(e,t.key,t)}}return function(n,i,t){return i&&e(n.prototype,i),t&&e(n,t),n}}(),r=a(i(22)),o=a(i(42));function a(e){return e&&e.__esModule?e:{default:e}}var c=function(){function e(n,i){var l=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[];!function(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}(this,e),this.name=n,this.contents=i,this.tags=l,this.attrs=t({},o.default,{class:"feather feather-"+n})}return l(e,[{key:"toSvg",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return"<svg "+function(e){return Object.keys(e).map(function(n){return n+'="'+e[n]+'"'}).join(" ")}(t({},this.attrs,e,{class:(0,r.default)(this.attrs.class,e.class)}))+">"+this.contents+"</svg>"}},{key:"toString",value:function(){return this.contents}}]),e}();n.default=c},function(e,n,i){"use strict";var t=o(i(12)),l=o(i(39)),r=o(i(38));function o(e){return e&&e.__esModule?e:{default:e}}e.exports={icons:t.default,toSvg:l.default,replace:r.default}},function(e,n,i){e.exports=i(0)},function(e,n,i){var t=i(2)("iterator"),l=!1;try{var r=0,o={next:function(){return{done:!!r++}},return:function(){l=!0}};o[t]=function(){return this},Array.from(o,function(){throw 2})}catch(e){}e.exports=function(e,n){if(!n&&!l)return!1;var i=!1;try{var r={};r[t]=function(){return{next:function(){return{done:i=!0}}}},e(r)}catch(e){}return i}},function(e,n,i){var t=i(30),l=i(2)("toStringTag"),r="Arguments"==t(function(){return arguments}());e.exports=function(e){var n,i,o;return void 0===e?"Undefined":null===e?"Null":"string"==typeof(i=function(e,n){try{return e[n]}catch(e){}}(n=Object(e),l))?i:r?t(n):"Object"==(o=t(n))&&"function"==typeof n.callee?"Arguments":o}},function(e,n,i){var t=i(47),l=i(9),r=i(2)("iterator");e.exports=function(e){if(void 0!=e)return e[r]||e["@@iterator"]||l[t(e)]}},function(e,n,i){"use strict";var t=i(18),l=i(7),r=i(10);e.exports=function(e,n,i){var o=t(n);o in e?l.f(e,o,r(0,i)):e[o]=i}},function(e,n,i){var t=i(2),l=i(9),r=t("iterator"),o=Array.prototype;e.exports=function(e){return void 0!==e&&(l.Array===e||o[r]===e)}},function(e,n,i){var t=i(3);e.exports=function(e,n,i,l){try{return l?n(t(i)[0],i[1]):n(i)}catch(n){var r=e.return;throw void 0!==r&&t(r.call(e)),n}}},function(e,n){e.exports=function(e){if("function"!=typeof e)throw TypeError(String(e)+" is not a function");return e}},function(e,n,i){var t=i(52);e.exports=function(e,n,i){if(t(e),void 0===n)return e;switch(i){case 0:return function(){return e.call(n)};case 1:return function(i){return e.call(n,i)};case 2:return function(i,t){return e.call(n,i,t)};case 3:return function(i,t,l){return e.call(n,i,t,l)}}return function(){return e.apply(n,arguments)}}},function(e,n,i){"use strict";var t=i(53),l=i(24),r=i(51),o=i(50),a=i(27),c=i(49),p=i(48);e.exports=function(e){var n,i,y,h,x=l(e),s="function"==typeof this?this:Array,u=arguments.length,d=u>1?arguments[1]:void 0,f=void 0!==d,g=0,v=p(x);if(f&&(d=t(d,u>2?arguments[2]:void 0,2)),void 0==v||s==Array&&o(v))for(i=new s(n=a(x.length));n>g;g++)c(i,g,f?d(x[g],g):x[g]);else for(h=v.call(x),i=new s;!(y=h.next()).done;g++)c(i,g,f?r(h,d,[y.value,g],!0):y.value);return i.length=g,i}},function(e,n,i){var t=i(32),l=i(54);t({target:"Array",stat:!0,forced:!i(46)(function(e){Array.from(e)})},{from:l})},function(e,n,i){var t=i(6),l=i(3);e.exports=function(e,n){if(l(e),!t(n)&&null!==n)throw TypeError("Can't set "+String(n)+" as a prototype")}},function(e,n,i){var t=i(56);e.exports=Object.setPrototypeOf||("__proto__"in{}?function(){var e,n=!1,i={};try{(e=Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set).call(i,[]),n=i instanceof Array}catch(e){}return function(i,l){return t(i,l),n?e.call(i,l):i.__proto__=l,i}}():void 0)},function(e,n,i){var t=i(0).document;e.exports=t&&t.documentElement},function(e,n,i){var t=i(28),l=i(13);e.exports=Object.keys||function(e){return t(e,l)}},function(e,n,i){var t=i(8),l=i(7),r=i(3),o=i(59);e.exports=t?Object.defineProperties:function(e,n){r(e);for(var i,t=o(n),a=t.length,c=0;a>c;)l.f(e,i=t[c++],n[i]);return e}},function(e,n,i){var t=i(3),l=i(60),r=i(13),o=i(15),a=i(58),c=i(34),p=i(16)("IE_PROTO"),y=function(){},h=function(){var e,n=c("iframe"),i=r.length;for(n.style.display="none",a.appendChild(n),n.src=String("javascript:"),(e=n.contentWindow.document).open(),e.write("<script>document.F=Object<\/script>"),e.close(),h=e.F;i--;)delete h.prototype[r[i]];return h()};e.exports=Object.create||function(e,n){var i;return null!==e?(y.prototype=t(e),i=new y,y.prototype=null,i[p]=e):i=h(),void 0===n?i:l(i,n)},o[p]=!0},function(e,n,i){var t=i(4);e.exports=!!Object.getOwnPropertySymbols&&!t(function(){return!String(Symbol())})},function(e,n,i){var t=i(4);e.exports=!t(function(){function e(){}return e.prototype.constructor=null,Object.getPrototypeOf(new e)!==e.prototype})},function(e,n,i){"use strict";var t=i(26).IteratorPrototype,l=i(61),r=i(10),o=i(23),a=i(9),c=function(){return this};e.exports=function(e,n,i){var p=n+" Iterator";return e.prototype=l(t,{next:r(1,i)}),o(e,p,!1,!0),a[p]=c,e}},function(e,n,i){var t=i(4),l=/#|\.prototype\./,r=function(e,n){var i=a[o(e)];return i==p||i!=c&&("function"==typeof n?t(n):!!n)},o=r.normalize=function(e){return String(e).replace(l,".").toLowerCase()},a=r.data={},c=r.NATIVE="N",p=r.POLYFILL="P";e.exports=r},function(e,n){n.f=Object.getOwnPropertySymbols},function(e,n,i){var t=i(21),l=Math.max,r=Math.min;e.exports=function(e,n){var i=t(e);return i<0?l(i+n,0):r(i,n)}},function(e,n,i){var t=i(14),l=i(27),r=i(67);e.exports=function(e){return function(n,i,o){var a,c=t(n),p=l(c.length),y=r(o,p);if(e&&i!=i){for(;p>y;)if((a=c[y++])!=a)return!0}else for(;p>y;y++)if((e||y in c)&&c[y]===i)return e||y||0;return!e&&-1}}},function(e,n,i){var t=i(28),l=i(13).concat("length","prototype");n.f=Object.getOwnPropertyNames||function(e){return t(e,l)}},function(e,n,i){var t=i(0),l=i(69),r=i(66),o=i(3),a=t.Reflect;e.exports=a&&a.ownKeys||function(e){var n=l.f(o(e)),i=r.f;return i?n.concat(i(e)):n}},function(e,n,i){var t=i(1),l=i(70),r=i(31),o=i(7);e.exports=function(e,n){for(var i=l(n),a=o.f,c=r.f,p=0;p<i.length;p++){var y=i[p];t(e,y)||a(e,y,c(n,y))}}},function(e,n,i){var t=i(4),l=i(30),r="".split;e.exports=t(function(){return!Object("z").propertyIsEnumerable(0)})?function(e){return"String"==l(e)?r.call(e,""):Object(e)}:Object},function(e,n,i){"use strict";var t={}.propertyIsEnumerable,l=Object.getOwnPropertyDescriptor,r=l&&!t.call({1:2},1);n.f=r?function(e){var n=l(this,e);return!!n&&n.enumerable}:t},function(e,n,i){"use strict";var t=i(32),l=i(64),r=i(25),o=i(57),a=i(23),c=i(5),p=i(29),y=i(2),h=i(17),x=i(9),s=i(26),u=s.IteratorPrototype,d=s.BUGGY_SAFARI_ITERATORS,f=y("iterator"),g=function(){return this};e.exports=function(e,n,i,y,s,v,m){l(i,n,y);var w,M,b,z=function(e){if(e===s&&O)return O;if(!d&&e in H)return H[e];switch(e){case"keys":case"values":case"entries":return function(){return new i(this,e)}}return function(){return new i(this)}},A=n+" Iterator",k=!1,H=e.prototype,V=H[f]||H["@@iterator"]||s&&H[s],O=!d&&V||z(s),j="Array"==n&&H.entries||V;if(j&&(w=r(j.call(new e)),u!==Object.prototype&&w.next&&(h||r(w)===u||(o?o(w,u):"function"!=typeof w[f]&&c(w,f,g)),a(w,A,!0,!0),h&&(x[A]=g))),"values"==s&&V&&"values"!==V.name&&(k=!0,O=function(){return V.call(this)}),h&&!m||H[f]===O||c(H,f,O),x[n]=O,s)if(M={values:z("values"),keys:v?O:z("keys"),entries:z("entries")},m)for(b in M)!d&&!k&&b in H||p(H,b,M[b]);else t({target:n,proto:!0,forced:d||k},M);return M}},function(e,n){var i;i=function(){return this}();try{i=i||Function("return this")()||(0,eval)("this")}catch(e){"object"==typeof window&&(i=window)}e.exports=i},function(e,n,i){var t=i(0),l=i(36),r=t.WeakMap;e.exports="function"==typeof r&&/native code/.test(l.call(r))},function(e,n,i){var t=i(21),l=i(20);e.exports=function(e,n,i){var r,o,a=String(l(e)),c=t(n),p=a.length;return c<0||c>=p?i?"":void 0:(r=a.charCodeAt(c))<55296||r>56319||c+1===p||(o=a.charCodeAt(c+1))<56320||o>57343?i?a.charAt(c):r:i?a.slice(c,c+2):o-56320+(r-55296<<10)+65536}},function(e,n,i){"use strict";var t=i(77),l=i(37),r=i(74),o=l.set,a=l.getterFor("String Iterator");r(String,"String",function(e){o(this,{type:"String Iterator",string:String(e),index:0})},function(){var e,n=a(this),i=n.string,l=n.index;return l>=i.length?{value:void 0,done:!0}:(e=t(i,l,!0),n.index+=e.length,{value:e,done:!1})})},function(e,n,i){i(78),i(55);var t=i(45);e.exports=t.Array.from},function(e,n,i){i(79),e.exports=i(44)}])});

/**
 * AutoNumeric.js v4.10.7
 * © 2016-2024 Alexandre Bonneau <alexandre.bonneau@linuxfr.eu>
 * © 2009-2016 Bob Knothe <bob@decorplanit.com>
 * Released under the MIT License.
 * See https://docs.autonumeric.org
 */
var e,t;e=this,t=()=>(()=>{var e={d:(t,i)=>{for(var n in i)e.o(i,n)&&!e.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:i[n]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},t={};e.d(t,{default:()=>ue});var i={allowedTagList:["b","caption","cite","code","const","dd","del","div","dfn","dt","em","h1","h2","h3","h4","h5","h6","input","ins","kdb","label","li","option","output","p","q","s","sample","span","strong","td","th","u"]};Object.freeze(i.allowedTagList),Object.defineProperty(i,"allowedTagList",{configurable:!1,writable:!1}),i.fromCharCodeKeyCode={0:"LaunchCalculator",8:"Backspace",9:"Tab",13:"Enter",16:"Shift",17:"Ctrl",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",91:"OS",92:"OSRight",93:"ContextMenu",96:"0",97:"1",98:"2",99:"3",100:"4",101:"5",102:"6",103:"7",104:"8",105:"9",106:"*",107:"+",109:"-",110:".",111:"/",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",173:"-",182:"MyComputer",183:"MyCalculator",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'",224:"Meta",225:"AltGraph"},Object.freeze(i.fromCharCodeKeyCode),Object.defineProperty(i,"fromCharCodeKeyCode",{configurable:!1,writable:!1}),i.keyName={Unidentified:"Unidentified",AndroidDefault:"AndroidDefault",Alt:"Alt",AltGr:"AltGraph",CapsLock:"CapsLock",Ctrl:"Control",Fn:"Fn",FnLock:"FnLock",Hyper:"Hyper",Meta:"Meta",OSLeft:"OS",OSRight:"OS",Command:"OS",NumLock:"NumLock",ScrollLock:"ScrollLock",Shift:"Shift",Super:"Super",Symbol:"Symbol",SymbolLock:"SymbolLock",Enter:"Enter",Tab:"Tab",Space:" ",LeftArrow:"ArrowLeft",UpArrow:"ArrowUp",RightArrow:"ArrowRight",DownArrow:"ArrowDown",End:"End",Home:"Home",PageUp:"PageUp",PageDown:"PageDown",Backspace:"Backspace",Clear:"Clear",Copy:"Copy",CrSel:"CrSel",Cut:"Cut",Delete:"Delete",EraseEof:"EraseEof",ExSel:"ExSel",Insert:"Insert",Paste:"Paste",Redo:"Redo",Undo:"Undo",Accept:"Accept",Again:"Again",Attn:"Attn",Cancel:"Cancel",ContextMenu:"ContextMenu",Esc:"Escape",Execute:"Execute",Find:"Find",Finish:"Finish",Help:"Help",Pause:"Pause",Play:"Play",Props:"Props",Select:"Select",ZoomIn:"ZoomIn",ZoomOut:"ZoomOut",BrightnessDown:"BrightnessDown",BrightnessUp:"BrightnessUp",Eject:"Eject",LogOff:"LogOff",Power:"Power",PowerOff:"PowerOff",PrintScreen:"PrintScreen",Hibernate:"Hibernate",Standby:"Standby",WakeUp:"WakeUp",Compose:"Compose",Dead:"Dead",F1:"F1",F2:"F2",F3:"F3",F4:"F4",F5:"F5",F6:"F6",F7:"F7",F8:"F8",F9:"F9",F10:"F10",F11:"F11",F12:"F12",Print:"Print",num0:"0",num1:"1",num2:"2",num3:"3",num4:"4",num5:"5",num6:"6",num7:"7",num8:"8",num9:"9",a:"a",b:"b",c:"c",d:"d",e:"e",f:"f",g:"g",h:"h",i:"i",j:"j",k:"k",l:"l",m:"m",n:"n",o:"o",p:"p",q:"q",r:"r",s:"s",t:"t",u:"u",v:"v",w:"w",x:"x",y:"y",z:"z",A:"A",B:"B",C:"C",D:"D",E:"E",F:"F",G:"G",H:"H",I:"I",J:"J",K:"K",L:"L",M:"M",N:"N",O:"O",P:"P",Q:"Q",R:"R",S:"S",T:"T",U:"U",V:"V",W:"W",X:"X",Y:"Y",Z:"Z",Semicolon:";",Equal:"=",Comma:",",Hyphen:"-",Minus:"-",Plus:"+",Dot:".",Slash:"/",Backquote:"`",LeftParenthesis:"(",RightParenthesis:")",LeftBracket:"[",RightBracket:"]",Backslash:"\\",Quote:"'",numpad0:"0",numpad1:"1",numpad2:"2",numpad3:"3",numpad4:"4",numpad5:"5",numpad6:"6",numpad7:"7",numpad8:"8",numpad9:"9",NumpadDot:".",NumpadDotAlt:",",NumpadMultiply:"*",NumpadPlus:"+",NumpadMinus:"-",NumpadSubtract:"-",NumpadSlash:"/",NumpadDotObsoleteBrowsers:"Decimal",NumpadMultiplyObsoleteBrowsers:"Multiply",NumpadPlusObsoleteBrowsers:"Add",NumpadMinusObsoleteBrowsers:"Subtract",NumpadSlashObsoleteBrowsers:"Divide",_allFnKeys:["F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12"],_someNonPrintableKeys:["Tab","Enter","Shift","ShiftLeft","ShiftRight","Control","ControlLeft","ControlRight","Alt","AltLeft","AltRight","Pause","CapsLock","Escape"],_directionKeys:["PageUp","PageDown","End","Home","ArrowDown","ArrowLeft","ArrowRight","ArrowUp"]},Object.freeze(i.keyName._allFnKeys),Object.freeze(i.keyName._someNonPrintableKeys),Object.freeze(i.keyName._directionKeys),Object.freeze(i.keyName),Object.defineProperty(i,"keyName",{configurable:!1,writable:!1}),Object.freeze(i);const n=i;function a(e){return function(e){if(Array.isArray(e))return l(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||s(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function r(){return r=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var i=arguments[t];for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(e[n]=i[n])}return e},r.apply(this,arguments)}function o(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var i=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=i){var n,a,r,o,s=[],l=!0,u=!1;try{if(r=(i=i.call(e)).next,0===t){if(Object(i)!==i)return;l=!1}else for(;!(l=(n=r.call(i)).done)&&(s.push(n.value),s.length!==t);l=!0);}catch(c){u=!0,a=c}finally{try{if(!l&&null!=i.return&&(o=i.return(),Object(o)!==o))return}finally{if(u)throw a}}return s}}(e,t)||s(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function s(e,t){if(e){if("string"==typeof e)return l(e,t);var i=Object.prototype.toString.call(e).slice(8,-1);return"Object"===i&&e.constructor&&(i=e.constructor.name),"Map"===i||"Set"===i?Array.from(e):"Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)?l(e,t):void 0}}function l(e,t){(null==t||t>e.length)&&(t=e.length);for(var i=0,n=new Array(t);i<t;i++)n[i]=e[i];return n}function u(e){return u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},u(e)}function c(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,(a=n.key,r=void 0,r=function(e,t){if("object"!==u(e)||null===e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var n=i.call(e,t||"default");if("object"!==u(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(a,"string"),"symbol"===u(r)?r:String(r)),n)}var a,r}var h=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e)}var t,i,s;return t=e,s=[{key:"isNull",value:function(e){return null===e}},{key:"isUndefined",value:function(e){return void 0===e}},{key:"isUndefinedOrNullOrEmpty",value:function(e){return null==e||""===e}},{key:"isString",value:function(e){return"string"==typeof e||e instanceof String}},{key:"isEmptyString",value:function(e){return""===e}},{key:"isBoolean",value:function(e){return"boolean"==typeof e}},{key:"isTrueOrFalseString",value:function(e){var t=String(e).toLowerCase();return"true"===t||"false"===t}},{key:"isObject",value:function(e){return"object"===u(e)&&null!==e&&!Array.isArray(e)}},{key:"isEmptyObj",value:function(e){for(var t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}},{key:"isNumberStrict",value:function(e){return"number"==typeof e}},{key:"isNumber",value:function(e){return!this.isArray(e)&&!isNaN(parseFloat(e))&&isFinite(e)}},{key:"isDigit",value:function(e){return/\d/.test(e)}},{key:"isNumberOrArabic",value:function(e){var t=this.arabicToLatinNumbers(e,!1,!0,!0);return this.isNumber(t)}},{key:"isInt",value:function(e){return"number"==typeof e&&parseFloat(e)===parseInt(e,10)&&!isNaN(e)}},{key:"isFunction",value:function(e){return"function"==typeof e}},{key:"contains",value:function(e,t){return!(!this.isString(e)||!this.isString(t)||""===e||""===t)&&-1!==e.indexOf(t)}},{key:"isInArray",value:function(e,t){return!(!this.isArray(t)||t===[]||this.isUndefined(e))&&-1!==t.indexOf(e)}},{key:"isArray",value:function(e){if("[object Array]"===Object.prototype.toString.call([]))return Array.isArray(e)||"object"===u(e)&&"[object Array]"===Object.prototype.toString.call(e);throw new Error("toString message changed for Object Array")}},{key:"isElement",value:function(e){return"undefined"!=typeof Element&&e instanceof Element}},{key:"isInputElement",value:function(e){return this.isElement(e)&&"input"===e.tagName.toLowerCase()}},{key:"decimalPlaces",value:function(e){var t=o(e.split("."),2)[1];return this.isUndefined(t)?0:t.length}},{key:"indexFirstNonZeroDecimalPlace",value:function(e){var t=o(String(Math.abs(e)).split("."),2)[1];if(this.isUndefined(t))return 0;var i=t.lastIndexOf("0");return-1===i?i=0:i+=2,i}},{key:"keyCodeNumber",value:function(e){return void 0===e.which?e.keyCode:e.which}},{key:"character",value:function(t){var i;if("Unidentified"===t.key||void 0===t.key||this.isSeleniumBot()){var a=this.keyCodeNumber(t);if(229===a)return n.keyName.AndroidDefault;var r=n.fromCharCodeKeyCode[a];i=e.isUndefinedOrNullOrEmpty(r)?String.fromCharCode(a):r}else switch(t.key){case"Add":i=n.keyName.NumpadPlus;break;case"Apps":i=n.keyName.ContextMenu;break;case"Crsel":i=n.keyName.CrSel;break;case"Decimal":i=t.char?t.char:n.keyName.NumpadDot;break;case"Del":i=n.keyName.Delete;break;case"Divide":i=n.keyName.NumpadSlash;break;case"Down":i=n.keyName.DownArrow;break;case"Esc":i=n.keyName.Esc;break;case"Exsel":i=n.keyName.ExSel;break;case"Left":i=n.keyName.LeftArrow;break;case"Meta":case"Super":i=n.keyName.OSLeft;break;case"Multiply":i=n.keyName.NumpadMultiply;break;case"Right":i=n.keyName.RightArrow;break;case"Spacebar":i=n.keyName.Space;break;case"Subtract":i=n.keyName.NumpadMinus;break;case"Up":i=n.keyName.UpArrow;break;default:i=t.key}return i}},{key:"browser",value:function(){var e,t=navigator.userAgent,i=t.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i)||[];return/trident/i.test(i[1])?{name:"ie",version:(e=/\brv[ :]+(\d+)/g.exec(t)||[])[1]||""}:"Chrome"===i[1]&&null!==(e=t.match(/\b(OPR|Edge)\/(\d+)/))?{name:e[1].replace("OPR","opera"),version:e[2]}:(i=i[2]?[i[1],i[2]]:[navigator.appName,navigator.appVersion,"-?"],null!==(e=t.match(/version\/(\d+)/i))&&i.splice(1,1,e[1]),{name:i[0].toLowerCase(),version:i[1]})}},{key:"isSeleniumBot",value:function(){return!0===window.navigator.webdriver}},{key:"isNegative",value:function(t){var i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"-",n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];return t===i||""!==t&&(e.isNumber(t)?t<0:n?this.contains(t,i):this.isNegativeStrict(t,i))}},{key:"isNegativeStrict",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"-";return e.charAt(0)===t}},{key:"isNegativeWithBrackets",value:function(e,t,i){return e.charAt(0)===t&&this.contains(e,i)}},{key:"isZeroOrHasNoValue",value:function(e){return!/[1-9]/g.test(e)}},{key:"setRawNegativeSign",value:function(e){return this.isNegativeStrict(e,"-")?e:"-".concat(e)}},{key:"replaceCharAt",value:function(e,t,i){return"".concat(e.substr(0,t)).concat(i).concat(e.substr(t+i.length))}},{key:"clampToRangeLimits",value:function(e,t){return Math.max(t.minimumValue,Math.min(t.maximumValue,e))}},{key:"countNumberCharactersOnTheCaretLeftSide",value:function(e,t,i){for(var n=new RegExp("[0-9".concat(i,"-]")),a=0,r=0;r<t;r++)n.test(e[r])&&a++;return a}},{key:"findCaretPositionInFormattedNumber",value:function(e,t,i,n){var a,r=i.length,o=e.length,s=0;for(a=0;a<r&&s<o&&s<t;a++)(e[s]===i[a]||"."===e[s]&&i[a]===n)&&s++;return a}},{key:"countCharInText",value:function(e,t){for(var i=0,n=0;n<t.length;n++)t[n]===e&&i++;return i}},{key:"convertCharacterCountToIndexPosition",value:function(e){return Math.max(e,e-1)}},{key:"getElementSelection",value:function(e){var t,i={};try{t=this.isUndefined(e.selectionStart)}catch(a){t=!1}try{if(t){var n=window.getSelection().getRangeAt(0);i.start=n.startOffset,i.end=n.endOffset,i.length=i.end-i.start}else i.start=e.selectionStart,i.end=e.selectionEnd,i.length=i.end-i.start}catch(a){i.start=0,i.end=0,i.length=0}return i}},{key:"setElementSelection",value:function(t,i){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(this.isUndefinedOrNullOrEmpty(n)&&(n=i),this.isInputElement(t))t.setSelectionRange(i,n);else if(!e.isNull(t.firstChild)){var a=document.createRange();a.setStart(t.firstChild,i),a.setEnd(t.firstChild,n);var r=window.getSelection();r.removeAllRanges(),r.addRange(a)}}},{key:"throwError",value:function(e){throw new Error(e)}},{key:"warning",value:function(e){(!(arguments.length>1&&void 0!==arguments[1])||arguments[1])&&console.warn("Warning: ".concat(e))}},{key:"isWheelEvent",value:function(e){return e instanceof WheelEvent}},{key:"isWheelUpEvent",value:function(e){return this.isWheelEvent(e)&&!this.isUndefinedOrNullOrEmpty(e.deltaY)||this.throwError("The event passed as a parameter is not a valid wheel event, '".concat(e.type,"' given.")),e.deltaY<0}},{key:"isWheelDownEvent",value:function(e){return this.isWheelEvent(e)&&!this.isUndefinedOrNullOrEmpty(e.deltaY)||this.throwError("The event passed as a parameter is not a valid wheel event, '".concat(e.type,"' given.")),e.deltaY>0}},{key:"isWheelEventWithZeroDeltaY",value:function(e){return this.isWheelEvent(e)&&!this.isUndefinedOrNullOrEmpty(e.deltaY)&&0===e.deltaY}},{key:"forceDecimalPlaces",value:function(e,t){var i=o(String(e).split("."),2),n=i[0],a=i[1];return a?"".concat(n,".").concat(a.substr(0,t)):e}},{key:"roundToNearest",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1e3;return 0===e?0:(0===t&&this.throwError("The `stepPlace` used to round is equal to `0`. This value must not be equal to zero."),Math.round(e/t)*t)}},{key:"modifyAndRoundToNearestAuto",value:function(e,t,i){e=Number(this.forceDecimalPlaces(e,i));var n=Math.abs(e);if(n>=0&&n<1){var a,r=Math.pow(10,-i);if(0===e)return t?r:-r;var o,s=i,l=this.indexFirstNonZeroDecimalPlace(e);return a=l>=s-1?r:Math.pow(10,-(l+1)),o=t?e+a:e-a,this.roundToNearest(o,a)}e=parseInt(e,10);var u,c=Math.abs(e).toString().length;switch(c){case 1:u=0;break;case 2:case 3:u=1;break;case 4:case 5:u=2;break;default:u=c-3}var h,m=Math.pow(10,u);return(h=t?e+m:e-m)<=10&&h>=-10?h:this.roundToNearest(h,m)}},{key:"addAndRoundToNearestAuto",value:function(e,t){return this.modifyAndRoundToNearestAuto(e,!0,t)}},{key:"subtractAndRoundToNearestAuto",value:function(e,t){return this.modifyAndRoundToNearestAuto(e,!1,t)}},{key:"arabicToLatinNumbers",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],i=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=arguments.length>3&&void 0!==arguments[3]&&arguments[3];if(this.isNull(e))return e;var a=e.toString();if(""===a)return e;if(null===a.match(/[٠١٢٣٤٥٦٧٨٩۴۵۶]/g))return t&&(a=Number(a)),a;i&&(a=a.replace(/٫/,".")),n&&(a=a.replace(/٬/g,"")),a=a.replace(/[٠١٢٣٤٥٦٧٨٩]/g,(function(e){return e.charCodeAt(0)-1632})).replace(/[۰۱۲۳۴۵۶۷۸۹]/g,(function(e){return e.charCodeAt(0)-1776}));var r=Number(a);return isNaN(r)?r:(t&&(a=r),a)}},{key:"triggerEvent",value:function(e){var t,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:document,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,a=!(arguments.length>3&&void 0!==arguments[3])||arguments[3],r=!(arguments.length>4&&void 0!==arguments[4])||arguments[4];window.CustomEvent?t=new CustomEvent(e,{detail:n,bubbles:a,cancelable:r}):(t=document.createEvent("CustomEvent")).initCustomEvent(e,a,r,{detail:n}),i.dispatchEvent(t)}},{key:"parseStr",value:function(e){var t,i,n,a,r={};if(0===e&&1/e<0&&(e="-0"),e=e.toString(),this.isNegativeStrict(e,"-")?(e=e.slice(1),r.s=-1):r.s=1,(t=e.indexOf("."))>-1&&(e=e.replace(".","")),t<0&&(t=e.length),(i=-1===e.search(/[1-9]/i)?e.length:e.search(/[1-9]/i))===(n=e.length))r.e=0,r.c=[0];else{for(a=n-1;"0"===e.charAt(a);a-=1)n-=1;for(n-=1,r.e=t-i-1,r.c=[],t=0;i<=n;i+=1)r.c[t]=+e.charAt(i),t+=1}return r}},{key:"testMinMax",value:function(e,t){var i=t.c,n=e.c,a=t.s,r=e.s,o=t.e,s=e.e;if(!i[0]||!n[0])return i[0]?a:n[0]?-r:0;if(a!==r)return a;var l=a<0;if(o!==s)return o>s^l?1:-1;for(a=-1,r=(o=i.length)<(s=n.length)?o:s,a+=1;a<r;a+=1)if(i[a]!==n[a])return i[a]>n[a]^l?1:-1;return o===s?0:o>s^l?1:-1}},{key:"randomString",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:5;return Math.random().toString(36).substr(2,e)}},{key:"domElement",value:function(t){var i;return i=e.isString(t)?document.querySelector(t):t,i}},{key:"getElementValue",value:function(e){return"input"===e.tagName.toLowerCase()?e.value:this.text(e)}},{key:"setElementValue",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;"input"===e.tagName.toLowerCase()?e.value=t:e.textContent=t}},{key:"setInvalidState",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"Invalid";(""===t||this.isNull(t))&&this.throwError("Cannot set the invalid state with an empty message."),e.setCustomValidity(t)}},{key:"setValidState",value:function(e){e.setCustomValidity("")}},{key:"cloneObject",value:function(e){return r({},e)}},{key:"camelize",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"-",i=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],n=!(arguments.length>3&&void 0!==arguments[3])||arguments[3];if(this.isNull(e))return null;i&&(e=e.replace(/^data-/,""));var a=e.split(t).map((function(e){return"".concat(e.charAt(0).toUpperCase()).concat(e.slice(1))}));return a=a.join(""),n&&(a="".concat(a.charAt(0).toLowerCase()).concat(a.slice(1))),a}},{key:"text",value:function(e){var t=e.nodeType;return t===Node.ELEMENT_NODE||t===Node.DOCUMENT_NODE||t===Node.DOCUMENT_FRAGMENT_NODE?e.textContent:t===Node.TEXT_NODE?e.nodeValue:""}},{key:"setText",value:function(e,t){var i=e.nodeType;i!==Node.ELEMENT_NODE&&i!==Node.DOCUMENT_NODE&&i!==Node.DOCUMENT_FRAGMENT_NODE||(e.textContent=t)}},{key:"filterOut",value:function(e,t){var i=this;return e.filter((function(e){return!i.isInArray(e,t)}))}},{key:"trimPaddedZerosFromDecimalPlaces",value:function(e){if(""===(e=String(e)))return"";var t=o(e.split("."),2),i=t[0],n=t[1];if(this.isUndefinedOrNullOrEmpty(n))return i;var a=n.replace(/0+$/g,"");return""===a?i:"".concat(i,".").concat(a)}},{key:"getHoveredElement",value:function(){var e=a(document.querySelectorAll(":hover"));return e[e.length-1]}},{key:"arrayTrim",value:function(e,t){var i=e.length;return 0===i||t>i?e:t<0?[]:(e.length=parseInt(t,10),e)}},{key:"arrayUnique",value:function(){var e;return a(new Set((e=[]).concat.apply(e,arguments)))}},{key:"mergeMaps",value:function(){for(var e=arguments.length,t=new Array(e),i=0;i<e;i++)t[i]=arguments[i];return new Map(t.reduce((function(e,t){return e.concat(a(t))}),[]))}},{key:"objectKeyLookup",value:function(e,t){var i=Object.entries(e).find((function(e){return e[1]===t})),n=null;return void 0!==i&&(n=i[0]),n}},{key:"insertAt",value:function(e,t,i){if(i>(e=String(e)).length)throw new Error("The given index is out of the string range.");if(1!==t.length)throw new Error("The given string `char` should be only one character long.");return""===e&&0===i?t:"".concat(e.slice(0,i)).concat(t).concat(e.slice(i))}},{key:"scientificToDecimal",value:function(e){var t=Number(e);if(isNaN(t))return NaN;if(e=String(e),!this.contains(e,"e")&&!this.contains(e,"E"))return e;var i=o(e.split(/e/i),2),n=i[0],a=i[1],r=n<0;r&&(n=n.replace("-",""));var s=+a<0;s&&(a=a.replace("-",""));var l,u=o(n.split(/\./),2),c=u[0],h=u[1];return s?(l=c.length>a?this.insertAt(c,".",c.length-a):"0.".concat("0".repeat(a-c.length)).concat(c),l="".concat(l).concat(h||"")):h?(n="".concat(c).concat(h),l=a<h.length?this.insertAt(n,".",+a+c.length):"".concat(n).concat("0".repeat(a-h.length))):(n=n.replace(".",""),l="".concat(n).concat("0".repeat(Number(a)))),r&&(l="-".concat(l)),l}}],(i=null)&&c(t.prototype,i),s&&c(t,s),Object.defineProperty(t,"prototype",{writable:!1}),e}();function m(e){return m="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},m(e)}function g(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,(a=n.key,r=void 0,r=function(e,t){if("object"!==m(e)||null===e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var n=i.call(e,t||"default");if("object"!==m(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(a,"string"),"symbol"===m(r)?r:String(r)),n)}var a,r}var d=function(){function e(t){if(function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),null===t)throw new Error("Invalid AST")}var t,i,n;return t=e,(i=[{key:"evaluate",value:function(e){if(null==e)throw new Error("Invalid AST sub-tree");if("number"===e.type)return e.value;if("unaryMinus"===e.type)return-this.evaluate(e.left);var t=this.evaluate(e.left),i=this.evaluate(e.right);switch(e.type){case"op_+":return Number(t)+Number(i);case"op_-":return t-i;case"op_*":return t*i;case"op_/":return t/i;default:throw new Error("Invalid operator '".concat(e.type,"'"))}}}])&&g(t.prototype,i),n&&g(t,n),Object.defineProperty(t,"prototype",{writable:!1}),e}();function v(e){return v="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},v(e)}function p(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,(a=n.key,r=void 0,r=function(e,t){if("object"!==v(e)||null===e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var n=i.call(e,t||"default");if("object"!==v(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(a,"string"),"symbol"===v(r)?r:String(r)),n)}var a,r}var f=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e)}var t,i,n;return t=e,n=[{key:"createNode",value:function(t,i,n){var a=new e;return a.type=t,a.left=i,a.right=n,a}},{key:"createUnaryNode",value:function(t){var i=new e;return i.type="unaryMinus",i.left=t,i.right=null,i}},{key:"createLeaf",value:function(t){var i=new e;return i.type="number",i.value=t,i}}],(i=null)&&p(t.prototype,i),n&&p(t,n),Object.defineProperty(t,"prototype",{writable:!1}),e}();function y(e){return y="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},y(e)}function S(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,(a=n.key,r=void 0,r=function(e,t){if("object"!==y(e)||null===e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var n=i.call(e,t||"default");if("object"!==y(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(a,"string"),"symbol"===y(r)?r:String(r)),n)}var a,r}function b(e,t,i){return t&&S(e.prototype,t),i&&S(e,i),Object.defineProperty(e,"prototype",{writable:!1}),e}var w=b((function e(t,i,n){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.type=t,this.value=i,this.symbol=n}));function P(e){return P="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},P(e)}function O(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,(a=n.key,r=void 0,r=function(e,t){if("object"!==P(e)||null===e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var n=i.call(e,t||"default");if("object"!==P(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(a,"string"),"symbol"===P(r)?r:String(r)),n)}var a,r}var N=function(){function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.text=t,this.textLength=t.length,this.index=0,this.token=new w("Error",0,0)}var t,i,n;return t=e,i=[{key:"_skipSpaces",value:function(){for(;" "===this.text[this.index]&&this.index<=this.textLength;)this.index++}},{key:"getIndex",value:function(){return this.index}},{key:"getNextToken",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:".";if(this._skipSpaces(),this.textLength===this.index)return this.token.type="EOT",this.token;if(h.isDigit(this.text[this.index]))return this.token.type="num",this.token.value=this._getNumber(e),this.token;switch(this.token.type="Error",this.text[this.index]){case"+":this.token.type="+";break;case"-":this.token.type="-";break;case"*":this.token.type="*";break;case"/":this.token.type="/";break;case"(":this.token.type="(";break;case")":this.token.type=")"}if("Error"===this.token.type)throw new Error("Unexpected token '".concat(this.token.symbol,"' at position '").concat(this.token.index,"' in the token function"));return this.token.symbol=this.text[this.index],this.index++,this.token}},{key:"_getNumber",value:function(e){this._skipSpaces();for(var t=this.index;this.index<=this.textLength&&h.isDigit(this.text[this.index]);)this.index++;for(this.text[this.index]===e&&this.index++;this.index<=this.textLength&&h.isDigit(this.text[this.index]);)this.index++;if(this.index===t)throw new Error("No number has been found while it was expected");return this.text.substring(t,this.index).replace(e,".")}}],i&&O(t.prototype,i),n&&O(t,n),Object.defineProperty(t,"prototype",{writable:!1}),e}();function k(e){return k="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},k(e)}function E(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,(a=n.key,r=void 0,r=function(e,t){if("object"!==k(e)||null===e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var n=i.call(e,t||"default");if("object"!==k(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(a,"string"),"symbol"===k(r)?r:String(r)),n)}var a,r}var _=function(){function e(t){var i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:".";return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.text=t,this.decimalCharacter=i,this.lexer=new N(t),this.token=this.lexer.getNextToken(this.decimalCharacter),this._exp()}var t,i,n;return t=e,(i=[{key:"_exp",value:function(){var e=this._term(),t=this._moreExp();return f.createNode("op_+",e,t)}},{key:"_moreExp",value:function(){var e,t;switch(this.token.type){case"+":return this.token=this.lexer.getNextToken(this.decimalCharacter),e=this._term(),t=this._moreExp(),f.createNode("op_+",t,e);case"-":return this.token=this.lexer.getNextToken(this.decimalCharacter),e=this._term(),t=this._moreExp(),f.createNode("op_-",t,e)}return f.createLeaf(0)}},{key:"_term",value:function(){var e=this._factor(),t=this._moreTerms();return f.createNode("op_*",e,t)}},{key:"_moreTerms",value:function(){var e,t;switch(this.token.type){case"*":return this.token=this.lexer.getNextToken(this.decimalCharacter),e=this._factor(),t=this._moreTerms(),f.createNode("op_*",t,e);case"/":return this.token=this.lexer.getNextToken(this.decimalCharacter),e=this._factor(),t=this._moreTerms(),f.createNode("op_/",t,e)}return f.createLeaf(1)}},{key:"_factor",value:function(){var e,t,i;switch(this.token.type){case"num":return i=this.token.value,this.token=this.lexer.getNextToken(this.decimalCharacter),f.createLeaf(i);case"-":return this.token=this.lexer.getNextToken(this.decimalCharacter),t=this._factor(),f.createUnaryNode(t);case"(":return this.token=this.lexer.getNextToken(this.decimalCharacter),e=this._exp(),this._match(")"),e;default:throw new Error("Unexpected token '".concat(this.token.symbol,"' with type '").concat(this.token.type,"' at position '").concat(this.token.index,"' in the factor function"))}}},{key:"_match",value:function(e){var t=this.lexer.getIndex()-1;if(this.text[t]!==e)throw new Error("Unexpected token '".concat(this.token.symbol,"' at position '").concat(t,"' in the match function"));this.token=this.lexer.getNextToken(this.decimalCharacter)}}])&&E(t.prototype,i),n&&E(t,n),Object.defineProperty(t,"prototype",{writable:!1}),e}();function C(e){return function(e){if(Array.isArray(e))return x(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||V(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function F(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var i=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=i){var n,a,r,o,s=[],l=!0,u=!1;try{if(r=(i=i.call(e)).next,0===t){if(Object(i)!==i)return;l=!1}else for(;!(l=(n=r.call(i)).done)&&(s.push(n.value),s.length!==t);l=!0);}catch(c){u=!0,a=c}finally{try{if(!l&&null!=i.return&&(o=i.return(),Object(o)!==o))return}finally{if(u)throw a}}return s}}(e,t)||V(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function V(e,t){if(e){if("string"==typeof e)return x(e,t);var i=Object.prototype.toString.call(e).slice(8,-1);return"Object"===i&&e.constructor&&(i=e.constructor.name),"Map"===i||"Set"===i?Array.from(e):"Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)?x(e,t):void 0}}function x(e,t){(null==t||t>e.length)&&(t=e.length);for(var i=0,n=new Array(t);i<t;i++)n[i]=e[i];return n}function T(){return T=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var i=arguments[t];for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(e[n]=i[n])}return e},T.apply(this,arguments)}function A(e){return A="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},A(e)}function L(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,B(n.key),n)}}function D(e,t,i){return(t=B(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function B(e){var t=function(e,t){if("object"!==A(e)||null===e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var n=i.call(e,t||"default");if("object"!==A(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"===A(t)?t:String(t)}var I,M=function(){function e(){var t=this,i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);var r=e._setArgumentsValues(i,n,a),o=r.domElement,s=r.initialValue,l=r.userOptions;if(this.domElement=o,this.defaultRawValue="",this._setSettings(l,!1),this._checkElement(),this.savedCancellableValue=null,this.historyTable=[],this.historyTableIndex=-1,this.onGoingRedo=!1,this.parentForm=this._getParentForm(),!this.runOnce&&this.settings.formatOnPageLoad)this._formatDefaultValueOnPageLoad(s);else{var u;if(h.isNull(s))switch(this.settings.emptyInputBehavior){case e.options.emptyInputBehavior.min:u=this.settings.minimumValue;break;case e.options.emptyInputBehavior.max:u=this.settings.maximumValue;break;case e.options.emptyInputBehavior.zero:u="0";break;case e.options.emptyInputBehavior.focus:case e.options.emptyInputBehavior.press:case e.options.emptyInputBehavior.always:u="";break;case e.options.emptyInputBehavior.null:u=null;break;default:u=this.settings.emptyInputBehavior}else u=s;this._setElementAndRawValue(u)}this.runOnce=!0,this.hasEventListeners=!1,(this.isInputElement||this.isContentEditable)&&(this.settings.noEventListeners||this._createEventListeners(),this._setWritePermissions(!0)),this._saveInitialValues(s),this.storageNamePrefix="AUTO_",this._setPersistentStorageName(),this.validState=!0,this.isFocused=!1,this.isWheelEvent=!1,this.isDropEvent=!1,this.isEditing=!1,this.rawValueOnFocus=void 0,this.internalModification=!1,this.attributeToWatch=this._getAttributeToWatch(),this.getterSetter=Object.getOwnPropertyDescriptor(this.domElement.__proto__,this.attributeToWatch),this._addWatcher(),this.settings.createLocalList&&this._createLocalList(),this.constructor._addToGlobalList(this),this.global={set:function(e){var i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;t.autoNumericLocalList.forEach((function(t){t.set(e,i)}))},setUnformatted:function(e){var i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;t.autoNumericLocalList.forEach((function(t){t.setUnformatted(e,i)}))},get:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,i=[];return t.autoNumericLocalList.forEach((function(e){i.push(e.get())})),t._executeCallback(i,e),i},getNumericString:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,i=[];return t.autoNumericLocalList.forEach((function(e){i.push(e.getNumericString())})),t._executeCallback(i,e),i},getFormatted:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,i=[];return t.autoNumericLocalList.forEach((function(e){i.push(e.getFormatted())})),t._executeCallback(i,e),i},getNumber:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,i=[];return t.autoNumericLocalList.forEach((function(e){i.push(e.getNumber())})),t._executeCallback(i,e),i},getLocalized:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,i=[];return t.autoNumericLocalList.forEach((function(e){i.push(e.getLocalized())})),t._executeCallback(i,e),i},reformat:function(){t.autoNumericLocalList.forEach((function(e){e.reformat()}))},unformat:function(){t.autoNumericLocalList.forEach((function(e){e.unformat()}))},unformatLocalized:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;t.autoNumericLocalList.forEach((function(t){t.unformatLocalized(e)}))},update:function(){for(var e=arguments.length,i=new Array(e),n=0;n<e;n++)i[n]=arguments[n];t.autoNumericLocalList.forEach((function(e){e.update.apply(e,i)}))},isPristine:function(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0],i=!0;return t.autoNumericLocalList.forEach((function(t){i&&!t.isPristine(e)&&(i=!1)})),i},clear:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];t.autoNumericLocalList.forEach((function(t){t.clear(e)}))},remove:function(){t.autoNumericLocalList.forEach((function(e){e.remove()}))},wipe:function(){t.autoNumericLocalList.forEach((function(e){e.wipe()}))},nuke:function(){t.autoNumericLocalList.forEach((function(e){e.nuke()}))},has:function(i){return i instanceof e?t.autoNumericLocalList.has(i.node()):t.autoNumericLocalList.has(i)},addObject:function(i){var n,a;i instanceof e?(n=i.node(),a=i):(n=i,a=e.getAutoNumericElement(n)),t._hasLocalList()||t._createLocalList();var r,o=a._getLocalList();0===o.size&&(a._createLocalList(),o=a._getLocalList()),o instanceof Map?r=h.mergeMaps(t._getLocalList(),o):(t._addToLocalList(n,a),r=t._getLocalList()),r.forEach((function(e){e._setLocalList(r)}))},removeObject:function(i){var n,a,r=arguments.length>1&&void 0!==arguments[1]&&arguments[1];i instanceof e?(n=i.node(),a=i):(n=i,a=e.getAutoNumericElement(n));var o=t.autoNumericLocalList;t.autoNumericLocalList.delete(n),o.forEach((function(e){e._setLocalList(t.autoNumericLocalList)})),r||n!==t.node()?a._createLocalList():a._setLocalList(new Map)},empty:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];t.autoNumericLocalList.forEach((function(t){e?t._createLocalList():t._setLocalList(new Map)}))},elements:function(){var e=[];return t.autoNumericLocalList.forEach((function(t){e.push(t.node())})),e},getList:function(){return t.autoNumericLocalList},size:function(){return t.autoNumericLocalList.size}},this.options={reset:function(){return t.settings={rawValue:t.defaultRawValue},t.update(e.defaultSettings),t},allowDecimalPadding:function(e){return t.update({allowDecimalPadding:e}),t},alwaysAllowDecimalCharacter:function(e){return t.update({alwaysAllowDecimalCharacter:e}),t},caretPositionOnFocus:function(e){return t.settings.caretPositionOnFocus=e,t},createLocalList:function(e){return t.settings.createLocalList=e,t.settings.createLocalList?t._hasLocalList()||t._createLocalList():t._deleteLocalList(),t},currencySymbol:function(e){return t.update({currencySymbol:e}),t},currencySymbolPlacement:function(e){return t.update({currencySymbolPlacement:e}),t},decimalCharacter:function(e){return t.update({decimalCharacter:e}),t},decimalCharacterAlternative:function(e){return t.settings.decimalCharacterAlternative=e,t},decimalPlaces:function(e){return h.warning("Using `options.decimalPlaces()` instead of calling the specific `options.decimalPlacesRawValue()`, `options.decimalPlacesShownOnFocus()` and `options.decimalPlacesShownOnBlur()` methods will reset those options.\nPlease call the specific methods if you do not want to reset those.",t.settings.showWarnings),t.update({decimalPlaces:e}),t},decimalPlacesRawValue:function(e){return t.update({decimalPlacesRawValue:e}),t},decimalPlacesShownOnBlur:function(e){return t.update({decimalPlacesShownOnBlur:e}),t},decimalPlacesShownOnFocus:function(e){return t.update({decimalPlacesShownOnFocus:e}),t},defaultValueOverride:function(e){return t.update({defaultValueOverride:e}),t},digitalGroupSpacing:function(e){return t.update({digitalGroupSpacing:e}),t},digitGroupSeparator:function(e){return t.update({digitGroupSeparator:e}),t},divisorWhenUnfocused:function(e){return t.update({divisorWhenUnfocused:e}),t},emptyInputBehavior:function(i){return null===t.rawValue&&i!==e.options.emptyInputBehavior.null&&(h.warning("You are trying to modify the `emptyInputBehavior` option to something different than `'null'` (".concat(i,"), but the element raw value is currently set to `null`. This would result in an invalid `rawValue`. In order to fix that, the element value has been changed to the empty string `''`."),t.settings.showWarnings),t.rawValue=""),t.update({emptyInputBehavior:i}),t},eventBubbles:function(e){return t.settings.eventBubbles=e,t},eventIsCancelable:function(e){return t.settings.eventIsCancelable=e,t},failOnUnknownOption:function(e){return t.settings.failOnUnknownOption=e,t},formatOnPageLoad:function(e){return t.settings.formatOnPageLoad=e,t},formulaMode:function(e){return t.settings.formulaMode=e,t},historySize:function(e){return t.settings.historySize=e,t},invalidClass:function(e){return t.settings.invalidClass=e,t},isCancellable:function(e){return t.settings.isCancellable=e,t},leadingZero:function(e){return t.update({leadingZero:e}),t},maximumValue:function(e){return t.update({maximumValue:e}),t},minimumValue:function(e){return t.update({minimumValue:e}),t},modifyValueOnUpDownArrow:function(e){return t.settings.modifyValueOnUpDownArrow=e,t},modifyValueOnWheel:function(e){return t.settings.modifyValueOnWheel=e,t},negativeBracketsTypeOnBlur:function(e){return t.update({negativeBracketsTypeOnBlur:e}),t},negativePositiveSignPlacement:function(e){return t.update({negativePositiveSignPlacement:e}),t},negativeSignCharacter:function(e){return t.update({negativeSignCharacter:e}),t},negativePositiveSignBehavior:function(e){return t.settings.negativePositiveSignBehavior=e,t},noEventListeners:function(i){return i===e.options.noEventListeners.noEvents&&t.settings.noEventListeners===e.options.noEventListeners.addEvents&&t._removeEventListeners(),t.update({noEventListeners:i}),t},onInvalidPaste:function(e){return t.settings.onInvalidPaste=e,t},outputFormat:function(e){return t.settings.outputFormat=e,t},overrideMinMaxLimits:function(e){return t.update({overrideMinMaxLimits:e}),t},positiveSignCharacter:function(e){return t.update({positiveSignCharacter:e}),t},rawValueDivisor:function(e){return t.update({rawValueDivisor:e}),t},readOnly:function(e){return t.settings.readOnly=e,t._setWritePermissions(),t},roundingMethod:function(e){return t.update({roundingMethod:e}),t},saveValueToSessionStorage:function(e){return t.update({saveValueToSessionStorage:e}),t},symbolWhenUnfocused:function(e){return t.update({symbolWhenUnfocused:e}),t},selectNumberOnly:function(e){return t.settings.selectNumberOnly=e,t},selectOnFocus:function(e){return t.settings.selectOnFocus=e,t},serializeSpaces:function(e){return t.settings.serializeSpaces=e,t},showOnlyNumbersOnFocus:function(e){return t.update({showOnlyNumbersOnFocus:e}),t},showPositiveSign:function(e){return t.update({showPositiveSign:e}),t},showWarnings:function(e){return t.settings.showWarnings=e,t},styleRules:function(e){return t.update({styleRules:e}),t},suffixText:function(e){return t.update({suffixText:e}),t},unformatOnHover:function(e){return t.settings.unformatOnHover=e,t},unformatOnSubmit:function(e){return t.settings.unformatOnSubmit=e,t},upDownStep:function(e){return t.settings.upDownStep=e,t},valuesToStrings:function(e){return t.update({valuesToStrings:e}),t},watchExternalChanges:function(e){return t.update({watchExternalChanges:e}),t},wheelOn:function(e){return t.settings.wheelOn=e,t},wheelStep:function(e){return t.settings.wheelStep=e,t}},this._triggerEvent(e.events.initialized,this.domElement,{newValue:h.getElementValue(this.domElement),newRawValue:this.rawValue,error:null,aNElement:this})}var t,i,a;return t=e,i=[{key:"_saveInitialValues",value:function(e){this.initialValueHtmlAttribute=h.scientificToDecimal(this.domElement.getAttribute("value")),h.isNull(this.initialValueHtmlAttribute)&&(this.initialValueHtmlAttribute=""),this.initialValue=e,h.isNull(this.initialValue)&&(this.initialValue="")}},{key:"_createEventListeners",value:function(){var t=this;this.formulaMode=!1,this._onFocusInFunc=function(e){t._onFocusIn(e)},this._onFocusInAndMouseEnterFunc=function(e){t._onFocusInAndMouseEnter(e)},this._onFocusFunc=function(){t._onFocus()},this._onKeydownFunc=function(e){t._onKeydown(e)},this._onKeypressFunc=function(e){t._onKeypress(e)},this._onKeyupFunc=function(e){t._onKeyup(e)},this._onFocusOutAndMouseLeaveFunc=function(e){t._onFocusOutAndMouseLeave(e)},this._onPasteFunc=function(e){t._onPaste(e)},this._onWheelFunc=function(e){t._onWheel(e)},this._onDropFunc=function(e){t._onDrop(e)},this._onKeydownGlobalFunc=function(e){t._onKeydownGlobal(e)},this._onKeyupGlobalFunc=function(e){t._onKeyupGlobal(e)},this.domElement.addEventListener("focusin",this._onFocusInFunc,!1),this.domElement.addEventListener("focus",this._onFocusInAndMouseEnterFunc,!1),this.domElement.addEventListener("focus",this._onFocusFunc,!1),this.domElement.addEventListener("mouseenter",this._onFocusInAndMouseEnterFunc,!1),this.domElement.addEventListener("keydown",this._onKeydownFunc,!1),this.domElement.addEventListener("keypress",this._onKeypressFunc,!1),this.domElement.addEventListener("keyup",this._onKeyupFunc,!1),this.domElement.addEventListener("blur",this._onFocusOutAndMouseLeaveFunc,!1),this.domElement.addEventListener("mouseleave",this._onFocusOutAndMouseLeaveFunc,!1),this.domElement.addEventListener("paste",this._onPasteFunc,!1),this.domElement.addEventListener("wheel",this._onWheelFunc,!1),this.domElement.addEventListener("drop",this._onDropFunc,!1),this._setupFormListener(),this.hasEventListeners=!0,e._doesGlobalListExists()||(document.addEventListener("keydown",this._onKeydownGlobalFunc,!1),document.addEventListener("keyup",this._onKeyupGlobalFunc,!1))}},{key:"_removeEventListeners",value:function(){this.domElement.removeEventListener("focusin",this._onFocusInFunc,!1),this.domElement.removeEventListener("focus",this._onFocusInAndMouseEnterFunc,!1),this.domElement.removeEventListener("focus",this._onFocusFunc,!1),this.domElement.removeEventListener("mouseenter",this._onFocusInAndMouseEnterFunc,!1),this.domElement.removeEventListener("blur",this._onFocusOutAndMouseLeaveFunc,!1),this.domElement.removeEventListener("mouseleave",this._onFocusOutAndMouseLeaveFunc,!1),this.domElement.removeEventListener("keydown",this._onKeydownFunc,!1),this.domElement.removeEventListener("keypress",this._onKeypressFunc,!1),this.domElement.removeEventListener("keyup",this._onKeyupFunc,!1),this.domElement.removeEventListener("paste",this._onPasteFunc,!1),this.domElement.removeEventListener("wheel",this._onWheelFunc,!1),this.domElement.removeEventListener("drop",this._onDropFunc,!1),this._removeFormListener(),this.hasEventListeners=!1,document.removeEventListener("keydown",this._onKeydownGlobalFunc,!1),document.removeEventListener("keyup",this._onKeyupGlobalFunc,!1)}},{key:"_updateEventListeners",value:function(){this.settings.noEventListeners||this.hasEventListeners||this._createEventListeners(),this.settings.noEventListeners&&this.hasEventListeners&&this._removeEventListeners()}},{key:"_setupFormListener",value:function(){var e=this;h.isNull(this.parentForm)||(this._onFormSubmitFunc=function(){e._onFormSubmit()},this._onFormResetFunc=function(){e._onFormReset()},this._hasParentFormCounter()?this._incrementParentFormCounter():(this._initializeFormCounterToOne(),this.parentForm.addEventListener("submit",this._onFormSubmitFunc,!1),this.parentForm.addEventListener("reset",this._onFormResetFunc,!1),this._storeFormHandlerFunction()))}},{key:"_removeFormListener",value:function(){if(!h.isNull(this.parentForm)){var e=this._getParentFormCounter();1===e?(this.parentForm.removeEventListener("submit",this._getFormHandlerFunction().submitFn,!1),this.parentForm.removeEventListener("reset",this._getFormHandlerFunction().resetFn,!1),this._removeFormDataSetInfo()):e>1?this._decrementParentFormCounter():h.throwError("The AutoNumeric object count on the form is incoherent.")}}},{key:"_hasParentFormCounter",value:function(){return"anCount"in this.parentForm.dataset}},{key:"_getParentFormCounter",value:function(){return Number(this.parentForm.dataset.anCount)}},{key:"_initializeFormCounterToOne",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;this._getFormElement(e).dataset.anCount=1}},{key:"_incrementParentFormCounter",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;this._getFormElement(e).dataset.anCount++}},{key:"_decrementParentFormCounter",value:function(){this.parentForm.dataset.anCount--}},{key:"_hasFormHandlerFunction",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return"anFormHandler"in this._getFormElement(e).dataset}},{key:"_getFormElement",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return h.isNull(e)?this.parentForm:e}},{key:"_storeFormHandlerFunction",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;this.constructor._doesFormHandlerListExists()||this.constructor._createFormHandlerList();var t=h.randomString();this._getFormElement(e).dataset.anFormHandler=t,window.aNFormHandlerMap.set(t,{submitFn:this._onFormSubmitFunc,resetFn:this._onFormResetFunc})}},{key:"_getFormHandlerKey",value:function(){this._hasFormHandlerFunction()||h.throwError("Unable to retrieve the form handler name");var e=this.parentForm.dataset.anFormHandler;return""===e&&h.throwError("The form handler name is invalid"),e}},{key:"_getFormHandlerFunction",value:function(){var e=this._getFormHandlerKey();return window.aNFormHandlerMap.get(e)}},{key:"_removeFormDataSetInfo",value:function(){this._decrementParentFormCounter(),window.aNFormHandlerMap.delete(this._getFormHandlerKey()),this.parentForm.removeAttribute("data-an-count"),this.parentForm.removeAttribute("data-an-form-handler")}},{key:"_setWritePermissions",value:function(){arguments.length>0&&void 0!==arguments[0]&&arguments[0]&&this.domElement.readOnly||this.settings.readOnly?this._setReadOnly():this._setReadWrite()}},{key:"_setReadOnly",value:function(){this.isInputElement?this.domElement.readOnly=!0:this.domElement.setAttribute("contenteditable",!1)}},{key:"_setReadWrite",value:function(){this.isInputElement?this.domElement.readOnly=!1:this.domElement.setAttribute("contenteditable",!0)}},{key:"_addWatcher",value:function(){var e=this;if(!h.isUndefined(this.getterSetter)){var t=this.getterSetter,i=t.set,n=t.get;Object.defineProperty(this.domElement,this.attributeToWatch,{configurable:!0,get:function(){return n.call(e.domElement)},set:function(t){i.call(e.domElement,t),e.settings.watchExternalChanges&&!e.internalModification&&e.set(t)}})}}},{key:"_removeWatcher",value:function(){var e=this;if(!h.isUndefined(this.getterSetter)){var t=this.getterSetter,i=t.set,n=t.get;Object.defineProperty(this.domElement,this.attributeToWatch,{configurable:!0,get:function(){return n.call(e.domElement)},set:function(t){i.call(e.domElement,t)}})}}},{key:"_getAttributeToWatch",value:function(){var e;if(this.isInputElement)e="value";else{var t=this.domElement.nodeType;t===Node.ELEMENT_NODE||t===Node.DOCUMENT_NODE||t===Node.DOCUMENT_FRAGMENT_NODE?e="textContent":t===Node.TEXT_NODE&&(e="nodeValue")}return e}},{key:"_historyTableAdd",value:function(){var e=0===this.historyTable.length;if(e||this.rawValue!==this._historyTableCurrentValueUsed()){var t=!0;if(!e){var i=this.historyTableIndex+1;i<this.historyTable.length&&this.rawValue===this.historyTable[i].value?t=!1:h.arrayTrim(this.historyTable,this.historyTableIndex+1)}if(this.historyTableIndex++,t){var n=h.getElementSelection(this.domElement);this.selectionStart=n.start,this.selectionEnd=n.end,this.historyTable.push({value:this.rawValue,start:this.selectionStart+1,end:this.selectionEnd+1}),this.historyTable.length>1&&(this.historyTable[this.historyTableIndex-1].start=this.selectionStart,this.historyTable[this.historyTableIndex-1].end=this.selectionEnd)}this.historyTable.length>this.settings.historySize&&this._historyTableForget()}}},{key:"_historyTableUndoOrRedo",value:function(){var e;if(arguments.length>0&&void 0!==arguments[0]&&!arguments[0]?(e=this.historyTableIndex+1<this.historyTable.length)&&this.historyTableIndex++:(e=this.historyTableIndex>0)&&this.historyTableIndex--,e){var t=this.historyTable[this.historyTableIndex];this.set(t.value,null,!1),h.setElementSelection(this.domElement,t.start,t.end)}}},{key:"_historyTableUndo",value:function(){this._historyTableUndoOrRedo(!0)}},{key:"_historyTableRedo",value:function(){this._historyTableUndoOrRedo(!1)}},{key:"_historyTableForget",value:function(){for(var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,t=[],i=0;i<e;i++)t.push(this.historyTable.shift()),this.historyTableIndex--,this.historyTableIndex<0&&(this.historyTableIndex=0);return 1===t.length?t[0]:t}},{key:"_historyTableCurrentValueUsed",value:function(){var e=this.historyTableIndex;return e<0&&(e=0),h.isUndefinedOrNullOrEmpty(this.historyTable[e])?"":this.historyTable[e].value}},{key:"_parseStyleRules",value:function(){var e=this;h.isUndefinedOrNullOrEmpty(this.settings.styleRules)||""===this.rawValue||(h.isUndefinedOrNullOrEmpty(this.settings.styleRules.positive)||(this.rawValue>=0?this._addCSSClass(this.settings.styleRules.positive):this._removeCSSClass(this.settings.styleRules.positive)),h.isUndefinedOrNullOrEmpty(this.settings.styleRules.negative)||(this.rawValue<0?this._addCSSClass(this.settings.styleRules.negative):this._removeCSSClass(this.settings.styleRules.negative)),h.isUndefinedOrNullOrEmpty(this.settings.styleRules.ranges)||0===this.settings.styleRules.ranges.length||this.settings.styleRules.ranges.forEach((function(t){e.rawValue>=t.min&&e.rawValue<t.max?e._addCSSClass(t.class):e._removeCSSClass(t.class)})),h.isUndefinedOrNullOrEmpty(this.settings.styleRules.userDefined)||0===this.settings.styleRules.userDefined.length||this.settings.styleRules.userDefined.forEach((function(t){if(h.isFunction(t.callback))if(h.isString(t.classes))t.callback(e.rawValue)?e._addCSSClass(t.classes):e._removeCSSClass(t.classes);else if(h.isArray(t.classes))if(2===t.classes.length)t.callback(e.rawValue)?(e._addCSSClass(t.classes[0]),e._removeCSSClass(t.classes[1])):(e._removeCSSClass(t.classes[0]),e._addCSSClass(t.classes[1]));else if(t.classes.length>2){var i=t.callback(e.rawValue);h.isArray(i)?t.classes.forEach((function(t,n){h.isInArray(n,i)?e._addCSSClass(t):e._removeCSSClass(t)})):h.isInt(i)?t.classes.forEach((function(t,n){n===i?e._addCSSClass(t):e._removeCSSClass(t)})):h.isNull(i)?t.classes.forEach((function(t){e._removeCSSClass(t)})):h.throwError("The callback result is not an array nor a valid array index, ".concat(A(i)," given."))}else h.throwError("The classes attribute is not valid for the `styleRules` option.");else h.isUndefinedOrNullOrEmpty(t.classes)?t.callback(e):h.throwError("The callback/classes structure is not valid for the `styleRules` option.");else h.warning("The given `styleRules` callback is not a function, ".concat(A(t.callback)," given."),e.settings.showWarnings)})))}},{key:"_addCSSClass",value:function(e){this.domElement.classList.add(e)}},{key:"_removeCSSClass",value:function(e){this.domElement.classList.remove(e)}},{key:"update",value:function(){for(var e=this,t=arguments.length,i=new Array(t),n=0;n<t;n++)i[n]=arguments[n];Array.isArray(i)&&Array.isArray(i[0])&&(i=i[0]);var a=h.cloneObject(this.settings),r=this.rawValue,o={};h.isUndefinedOrNullOrEmpty(i)||0===i.length?o=null:i.length>=1&&i.forEach((function(t){e.constructor._isPreDefinedOptionValid(t)&&(t=e.constructor._getOptionObject(t)),T(o,t)}));try{this._setSettings(o,!0),this._setWritePermissions(),this._updateEventListeners(),this.set(r)}catch(s){return this._setSettings(a,!0),h.throwError("Unable to update the settings, those are invalid: [".concat(s,"]")),this}return this}},{key:"getSettings",value:function(){return this.settings}},{key:"set",value:function(t){var i,n,a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,r=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];if(h.isUndefined(t))return h.warning("You are trying to set an 'undefined' value ; an error could have occurred.",this.settings.showWarnings),this;if(h.isNull(a)||this._setSettings(a,!0),null===t&&this.settings.emptyInputBehavior!==e.options.emptyInputBehavior.null)return h.warning("You are trying to set the `null` value while the `emptyInputBehavior` option is set to ".concat(this.settings.emptyInputBehavior,". If you want to be able to set the `null` value, you need to change the 'emptyInputBehavior' option to `'null'`."),this.settings.showWarnings),this;if(null===t)return this._setElementAndRawValue(null,null,r),this._saveValueToPersistentStorage(),this;if(i=this.constructor._toNumericValue(t,this.settings),isNaN(Number(i)))return h.warning("The value you are trying to set results in `NaN`. The element value is set to the empty string instead.",this.settings.showWarnings),this.setValue("",r),this;if(""===i)switch(this.settings.emptyInputBehavior){case e.options.emptyInputBehavior.zero:i=0;break;case e.options.emptyInputBehavior.min:i=this.settings.minimumValue;break;case e.options.emptyInputBehavior.max:i=this.settings.maximumValue;break;default:h.isNumber(this.settings.emptyInputBehavior)&&(i=Number(this.settings.emptyInputBehavior))}if(""!==i){var o=F(this.constructor._checkIfInRangeWithOverrideOption(i,this.settings),2),s=o[0],l=o[1];if(s&&l&&this.settings.valuesToStrings&&this._checkValuesToStrings(i))return this._setElementAndRawValue(this.settings.valuesToStrings[i],i,r),this._saveValueToPersistentStorage(),this;if(h.isZeroOrHasNoValue(i)&&(i="0"),s&&l){var u=this.constructor._roundRawValue(i,this.settings);return u=this._trimLeadingAndTrailingZeros(u.replace(this.settings.decimalCharacter,".")),i=this._getRawValueToFormat(i),this.isFocused?i=this.constructor._roundFormattedValueShownOnFocus(i,this.settings):(this.settings.divisorWhenUnfocused&&(i=(i/=this.settings.divisorWhenUnfocused).toString()),i=this.constructor._roundFormattedValueShownOnBlur(i,this.settings)),i=this.constructor._modifyNegativeSignAndDecimalCharacterForFormattedValue(i,this.settings),i=this.constructor._addGroupSeparators(i,this.settings,this.isFocused,this.rawValue,u),!this.isFocused&&this.settings.symbolWhenUnfocused&&(i="".concat(i).concat(this.settings.symbolWhenUnfocused)),(this.settings.decimalPlacesShownOnFocus||this.settings.divisorWhenUnfocused)&&this._saveValueToPersistentStorage(),this._setElementAndRawValue(i,u,r),this._setValidOrInvalidState(u),this}return this._triggerRangeEvents(s,l),h.throwError("The value [".concat(i,"] being set falls outside of the minimumValue [").concat(this.settings.minimumValue,"] and maximumValue [").concat(this.settings.maximumValue,"] range set for this element")),this._removeValueFromPersistentStorage(),this.setValue("",r),this}return n=this.settings.emptyInputBehavior===e.options.emptyInputBehavior.always?this.settings.currencySymbol:"",this._setElementAndRawValue(n,"",r),this}},{key:"setUnformatted",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(null===e||h.isUndefined(e))return this;h.isNull(t)||this._setSettings(t,!0);var i=this.constructor._removeBrackets(e,this.settings),n=this.constructor._stripAllNonNumberCharacters(i,this.settings,!0,this.isFocused);return h.isNumber(n)||h.throwError("The value is not a valid one, it's not a numeric string nor a recognized currency."),this.constructor._isWithinRangeWithOverrideOption(n,this.settings)?this.setValue(e):h.throwError("The value is out of the range limits [".concat(this.settings.minimumValue,", ").concat(this.settings.maximumValue,"].")),this}},{key:"setValue",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];return this._setElementAndRawValue(e,t),this}},{key:"_setRawValue",value:function(t){var i=this,n=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];if(this.rawValue!==t){var a=this.rawValue;this.rawValue=t,!h.isNull(this.settings.rawValueDivisor)&&0!==this.settings.rawValueDivisor&&""!==t&&null!==t&&this._isUserManuallyEditingTheValue()&&(this.rawValue/=this.settings.rawValueDivisor),this._triggerEvent(e.events.rawValueModified,this.domElement,{oldRawValue:a,newRawValue:this.rawValue,isPristine:this.isPristine(!0),error:null,aNElement:this}),this._parseStyleRules(),n&&window.requestAnimationFrame((function(){return i._historyTableAdd()}))}}},{key:"_setElementValue",value:function(t){var i=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n=h.getElementValue(this.domElement);return t!==n&&(this.internalModification=!0,h.setElementValue(this.domElement,t),this.internalModification=!1,i&&this._triggerEvent(e.events.formatted,this.domElement,{oldValue:n,newValue:t,oldRawValue:this.rawValue,newRawValue:this.rawValue,isPristine:this.isPristine(!1),error:null,aNElement:this})),this}},{key:"_setElementAndRawValue",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,i=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];return h.isNull(t)?t=e:h.isBoolean(t)&&(i=t,t=e),this._setElementValue(e),this._setRawValue(t,i),this}},{key:"_getRawValueToFormat",value:function(e){return h.isNull(this.settings.rawValueDivisor)||0===this.settings.rawValueDivisor||""===e||null===e?e:e*this.settings.rawValueDivisor}},{key:"_checkValuesToStrings",value:function(e){return this.constructor._checkValuesToStringsArray(e,this.valuesToStringsKeys)}},{key:"_isUserManuallyEditingTheValue",value:function(){return this.isFocused&&this.isEditing||this.isDropEvent}},{key:"_executeCallback",value:function(e,t){!h.isNull(t)&&h.isFunction(t)&&t(e,this)}},{key:"_triggerEvent",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:document,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;h.triggerEvent(e,t,i,this.settings.eventBubbles,this.settings.eventIsCancelable)}},{key:"get",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return this.getNumericString(e)}},{key:"getNumericString",value:function(){var e,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return e=h.isNull(this.rawValue)?null:h.trimPaddedZerosFromDecimalPlaces(this.rawValue),this._executeCallback(e,t),e}},{key:"getFormatted",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;"value"in this.domElement||"textContent"in this.domElement||h.throwError("Unable to get the formatted string from the element.");var t=h.getElementValue(this.domElement);return this._executeCallback(t,e),t}},{key:"getNumber",value:function(){var e,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return e=null===this.rawValue?null:this.constructor._toLocale(this.getNumericString(),"number",this.settings),this._executeCallback(e,t),e}},{key:"getLocalized",value:function(){var t,i,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;h.isFunction(n)&&h.isNull(a)&&(a=n,n=null),""!=(t=h.isEmptyString(this.rawValue)?"":""+Number(this.rawValue))&&0===Number(t)&&this.settings.leadingZero!==e.options.leadingZero.keep&&(t="0"),i=h.isNull(n)?this.settings.outputFormat:n;var r=this.constructor._toLocale(t,i,this.settings);return this._executeCallback(r,a),r}},{key:"reformat",value:function(){return this.set(this.rawValue),this}},{key:"unformat",value:function(){return this._setElementValue(this.getNumericString()),this}},{key:"unformatLocalized",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return this._setElementValue(this.getLocalized(e)),this}},{key:"isPristine",value:function(){return arguments.length>0&&void 0!==arguments[0]&&!arguments[0]?this.initialValueHtmlAttribute===this.getFormatted():this.initialValue===this.getNumericString()}},{key:"select",value:function(){return this.settings.selectNumberOnly?this.selectNumber():this._defaultSelectAll(),this}},{key:"_defaultSelectAll",value:function(){h.setElementSelection(this.domElement,0,h.getElementValue(this.domElement).length)}},{key:"selectNumber",value:function(){var t,i,n=h.getElementValue(this.domElement),a=n.length,r=this.settings.currencySymbol.length,o=this.settings.currencySymbolPlacement,s=h.isNegative(n,this.settings.negativeSignCharacter)?1:0,l=this.settings.suffixText.length;if(t=o===e.options.currencySymbolPlacement.suffix?0:this.settings.negativePositiveSignPlacement===e.options.negativePositiveSignPlacement.left&&1===s&&r>0?r+1:r,o===e.options.currencySymbolPlacement.prefix)i=a-l;else switch(this.settings.negativePositiveSignPlacement){case e.options.negativePositiveSignPlacement.left:i=a-(l+r);break;case e.options.negativePositiveSignPlacement.right:i=r>0?a-(r+s+l):a-(r+l);break;default:i=a-(r+l)}return h.setElementSelection(this.domElement,t,i),this}},{key:"selectInteger",value:function(){var t=0,i=this.rawValue>=0;this.settings.currencySymbolPlacement!==e.options.currencySymbolPlacement.prefix&&(this.settings.currencySymbolPlacement!==e.options.currencySymbolPlacement.suffix||this.settings.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.prefix&&this.settings.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.none)||(this.settings.showPositiveSign&&i||!i&&this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.prefix&&this.settings.negativePositiveSignPlacement===e.options.negativePositiveSignPlacement.left)&&(t+=1),this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.prefix&&(t+=this.settings.currencySymbol.length);var n=h.getElementValue(this.domElement),a=n.indexOf(this.settings.decimalCharacter);return-1===a&&(a=this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.suffix?n.length-this.settings.currencySymbol.length:n.length,i||this.settings.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.suffix&&this.settings.currencySymbolPlacement!==e.options.currencySymbolPlacement.suffix||(a-=1),a-=this.settings.suffixText.length),h.setElementSelection(this.domElement,t,a),this}},{key:"selectDecimal",value:function(){var e,t,i=h.getElementValue(this.domElement).indexOf(this.settings.decimalCharacter);return-1===i?(i=0,e=0):(i+=1,t=this.isFocused?this.settings.decimalPlacesShownOnFocus:this.settings.decimalPlacesShownOnBlur,e=i+Number(t)),h.setElementSelection(this.domElement,i,e),this}},{key:"node",value:function(){return this.domElement}},{key:"parent",value:function(){return this.domElement.parentNode}},{key:"detach",value:function(){var e,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return e=h.isNull(t)?this.domElement:t.node(),this._removeFromLocalList(e),this}},{key:"attach",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];return this._addToLocalList(e.node()),t&&e.update(this.settings),this}},{key:"formatOther",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return this._formatOrUnformatOther(!0,e,t)}},{key:"unformatOther",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return this._formatOrUnformatOther(!1,e,t)}},{key:"_formatOrUnformatOther",value:function(t,i){var n,a,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(n=h.isNull(r)?this.settings:this._cloneAndMergeSettings(r),h.isElement(i)){var o=h.getElementValue(i);return a=t?e.format(o,n):e.unformat(o,n),h.setElementValue(i,a),null}return a=t?e.format(i,n):e.unformat(i,n)}},{key:"init",value:function(t){var i=this,n=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],a=!1,r=[];if(h.isString(t)?r=C(document.querySelectorAll(t)):h.isElement(t)?(r.push(t),a=!0):h.isArray(t)?r=t:h.throwError("The given parameters to the 'init' function are invalid."),0===r.length)return h.warning("No valid DOM elements were given hence no AutoNumeric object were instantiated.",!0),[];var o=this._getLocalList(),s=[];return r.forEach((function(t){var a=i.settings.createLocalList;n&&(i.settings.createLocalList=!1);var r=new e(t,h.getElementValue(t),i.settings);n&&(r._setLocalList(o),i._addToLocalList(t,r),i.settings.createLocalList=a),s.push(r)})),a?s[0]:s}},{key:"clear",value:function(){if(arguments.length>0&&void 0!==arguments[0]&&arguments[0]){var t={emptyInputBehavior:e.options.emptyInputBehavior.focus};this.set("",t)}else this.set("");return this}},{key:"remove",value:function(){this._removeValueFromPersistentStorage(),this._removeEventListeners(),this._removeWatcher(),this._removeFromLocalList(this.domElement),this.constructor._removeFromGlobalList(this)}},{key:"wipe",value:function(){this._setElementValue("",!1),this.remove()}},{key:"nuke",value:function(){this.remove(),this.domElement.parentNode.removeChild(this.domElement)}},{key:"form",value:function(){if(arguments.length>0&&void 0!==arguments[0]&&arguments[0]||h.isUndefinedOrNullOrEmpty(this.parentForm)){var e=this._getParentForm();if(!h.isNull(e)&&e!==this.parentForm){var t=this._getFormAutoNumericChildren(this.parentForm);this.parentForm.dataset.anCount=t.length,this._hasFormHandlerFunction(e)?this._incrementParentFormCounter(e):(this._storeFormHandlerFunction(e),this._initializeFormCounterToOne(e))}this.parentForm=e}return this.parentForm}},{key:"_getFormAutoNumericChildren",value:function(e){var t=this,i=C(e.elements),n=this._getContenteditableElements(e);return h.arrayUnique(i,n).filter((function(e){return t.constructor.isManagedByAutoNumeric(e)}))}},{key:"_getContenteditableElements",value:function(e){if(h.isUndefinedOrNullOrEmpty(e)||!e.hasAttribute("id"))return[];var t=C(e.querySelectorAll("[contenteditable=true]")),i=C(document.querySelectorAll("*:not(input)[form=".concat(e.getAttribute("id"),"][contenteditable=true]")));return h.arrayUnique(t,i)}},{key:"_getParentForm",value:function(){if(!h.isUndefined(this.domElement.form))return this.domElement.form;if("body"===this.domElement.tagName.toLowerCase())return null;var e,t=this.domElement;do{if(t=t.parentNode,h.isNull(t))return null;if("body"===(e=t.tagName?t.tagName.toLowerCase():""))break}while("form"!==e);return"form"===e?t:null}},{key:"formNumericString",value:function(){return this.constructor._serializeNumericString(this.form(),this.settings.serializeSpaces)}},{key:"formFormatted",value:function(){return this.constructor._serializeFormatted(this.form(),this.settings.serializeSpaces)}},{key:"formLocalized",value:function(){var e,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return e=h.isNull(t)?this.settings.outputFormat:t,this.constructor._serializeLocalized(this.form(),this.settings.serializeSpaces,e)}},{key:"formArrayNumericString",value:function(){return this.constructor._serializeNumericStringArray(this.form(),this.settings.serializeSpaces)}},{key:"formArrayFormatted",value:function(){return this.constructor._serializeFormattedArray(this.form(),this.settings.serializeSpaces)}},{key:"formArrayLocalized",value:function(){var e,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return e=h.isNull(t)?this.settings.outputFormat:t,this.constructor._serializeLocalizedArray(this.form(),this.settings.serializeSpaces,e)}},{key:"formJsonNumericString",value:function(){return JSON.stringify(this.formArrayNumericString())}},{key:"formJsonFormatted",value:function(){return JSON.stringify(this.formArrayFormatted())}},{key:"formJsonLocalized",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return JSON.stringify(this.formArrayLocalized(e))}},{key:"formUnformat",value:function(){return this.constructor._getChildANInputElement(this.form()).forEach((function(t){e.getAutoNumericElement(t).unformat()})),this}},{key:"formUnformatLocalized",value:function(){return this.constructor._getChildANInputElement(this.form()).forEach((function(t){e.getAutoNumericElement(t).unformatLocalized()})),this}},{key:"formReformat",value:function(){return this.constructor._getChildANInputElement(this.form()).forEach((function(t){e.getAutoNumericElement(t).reformat()})),this}},{key:"formSubmitNumericString",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return h.isNull(e)?(this.formUnformat(),this.form().submit(),this.formReformat()):h.isFunction(e)?e(this.formNumericString()):h.throwError("The given callback is not a function."),this}},{key:"formSubmitFormatted",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return h.isNull(e)?this.form().submit():h.isFunction(e)?e(this.formFormatted()):h.throwError("The given callback is not a function."),this}},{key:"formSubmitLocalized",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return h.isNull(t)?(this.formUnformatLocalized(),this.form().submit(),this.formReformat()):h.isFunction(t)?t(this.formLocalized(e)):h.throwError("The given callback is not a function."),this}},{key:"formSubmitArrayNumericString",value:function(e){return h.isFunction(e)?e(this.formArrayNumericString()):h.throwError("The given callback is not a function."),this}},{key:"formSubmitArrayFormatted",value:function(e){return h.isFunction(e)?e(this.formArrayFormatted()):h.throwError("The given callback is not a function."),this}},{key:"formSubmitArrayLocalized",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return h.isFunction(e)?e(this.formArrayLocalized(t)):h.throwError("The given callback is not a function."),this}},{key:"formSubmitJsonNumericString",value:function(e){return h.isFunction(e)?e(this.formJsonNumericString()):h.throwError("The given callback is not a function."),this}},{key:"formSubmitJsonFormatted",value:function(e){return h.isFunction(e)?e(this.formJsonFormatted()):h.throwError("The given callback is not a function."),this}},{key:"formSubmitJsonLocalized",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return h.isFunction(e)?e(this.formJsonLocalized(t)):h.throwError("The given callback is not a function."),this}},{key:"_createLocalList",value:function(){this.autoNumericLocalList=new Map,this._addToLocalList(this.domElement)}},{key:"_deleteLocalList",value:function(){delete this.autoNumericLocalList}},{key:"_setLocalList",value:function(e){this.autoNumericLocalList=e}},{key:"_getLocalList",value:function(){return this.autoNumericLocalList}},{key:"_hasLocalList",value:function(){return this.autoNumericLocalList instanceof Map&&0!==this.autoNumericLocalList.size}},{key:"_addToLocalList",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;h.isNull(t)&&(t=this),h.isUndefined(this.autoNumericLocalList)?h.throwError("The local list provided does not exists when trying to add an element. [".concat(this.autoNumericLocalList,"] given.")):this.autoNumericLocalList.set(e,t)}},{key:"_removeFromLocalList",value:function(e){h.isUndefined(this.autoNumericLocalList)?this.settings.createLocalList&&h.throwError("The local list provided does not exists when trying to remove an element. [".concat(this.autoNumericLocalList,"] given.")):this.autoNumericLocalList.delete(e)}},{key:"_mergeSettings",value:function(){for(var e=arguments.length,t=new Array(e),i=0;i<e;i++)t[i]=arguments[i];T.apply(void 0,[this.settings].concat(t))}},{key:"_cloneAndMergeSettings",value:function(){for(var e={},t=arguments.length,i=new Array(t),n=0;n<t;n++)i[n]=arguments[n];return T.apply(void 0,[e,this.settings].concat(i)),e}},{key:"_updatePredefinedOptions",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return h.isNull(t)?this.update(e):(this._mergeSettings(e,t),this.update(this.settings)),this}},{key:"french",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return this._updatePredefinedOptions(e.getPredefinedOptions().French,t),this}},{key:"northAmerican",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return this._updatePredefinedOptions(e.getPredefinedOptions().NorthAmerican,t),this}},{key:"british",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return this._updatePredefinedOptions(e.getPredefinedOptions().British,t),this}},{key:"swiss",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return this._updatePredefinedOptions(e.getPredefinedOptions().Swiss,t),this}},{key:"japanese",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return this._updatePredefinedOptions(e.getPredefinedOptions().Japanese,t),this}},{key:"spanish",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return this._updatePredefinedOptions(e.getPredefinedOptions().Spanish,t),this}},{key:"chinese",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return this._updatePredefinedOptions(e.getPredefinedOptions().Chinese,t),this}},{key:"brazilian",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return this._updatePredefinedOptions(e.getPredefinedOptions().Brazilian,t),this}},{key:"_runCallbacksFoundInTheSettingsObject",value:function(){for(var e in this.settings)if(Object.prototype.hasOwnProperty.call(this.settings,e)){var t=this.settings[e];if("function"==typeof t)this.settings[e]=t(this,e);else{var i="";e in this.domElement.dataset&&(i=this.domElement.dataset[e]),i=h.camelize(i),"function"==typeof this.settings[i]&&(this.settings[e]=i(this,e))}}}},{key:"_setTrailingNegativeSignInfo",value:function(){this.isTrailingNegative=this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.prefix&&this.settings.negativePositiveSignPlacement===e.options.negativePositiveSignPlacement.suffix||this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.suffix&&(this.settings.negativePositiveSignPlacement===e.options.negativePositiveSignPlacement.left||this.settings.negativePositiveSignPlacement===e.options.negativePositiveSignPlacement.right)}},{key:"_modifyNegativeSignAndDecimalCharacterForRawValue",value:function(e){return"."!==this.settings.decimalCharacter&&(e=e.replace(this.settings.decimalCharacter,".")),"-"!==this.settings.negativeSignCharacter&&this.settings.isNegativeSignAllowed&&(e=e.replace(this.settings.negativeSignCharacter,"-")),e.match(/\d/)||(e+="0"),e}},{key:"_initialCaretPosition",value:function(t){h.isNull(this.settings.caretPositionOnFocus)&&this.settings.selectOnFocus===e.options.selectOnFocus.doNotSelect&&h.throwError("`_initialCaretPosition()` should never be called when the `caretPositionOnFocus` option is `null`.");var i=this.rawValue<0,n=h.isZeroOrHasNoValue(t),a=t.length,r=0,o=0,s=!1,l=0;this.settings.caretPositionOnFocus!==e.options.caretPositionOnFocus.start&&(r=(t=(t=(t=t.replace(this.settings.negativeSignCharacter,"")).replace(this.settings.positiveSignCharacter,"")).replace(this.settings.currencySymbol,"")).length,s=h.contains(t,this.settings.decimalCharacter),this.settings.caretPositionOnFocus!==e.options.caretPositionOnFocus.decimalLeft&&this.settings.caretPositionOnFocus!==e.options.caretPositionOnFocus.decimalRight||(s?(o=t.indexOf(this.settings.decimalCharacter),l=this.settings.decimalCharacter.length):(o=r,l=0)));var u="";i?u=this.settings.negativeSignCharacter:this.settings.showPositiveSign&&!n&&(u=this.settings.positiveSignCharacter);var c,m=u.length,g=this.settings.currencySymbol.length;if(this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.prefix){if(this.settings.caretPositionOnFocus===e.options.caretPositionOnFocus.start)if(this.settings.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.none&&(i||!i&&this.settings.showPositiveSign&&!n))switch(this.settings.negativePositiveSignPlacement){case e.options.negativePositiveSignPlacement.prefix:case e.options.negativePositiveSignPlacement.left:case e.options.negativePositiveSignPlacement.right:c=m+g;break;case e.options.negativePositiveSignPlacement.suffix:c=g}else c=g;else if(this.settings.caretPositionOnFocus===e.options.caretPositionOnFocus.end)if(this.settings.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.none&&(i||!i&&this.settings.showPositiveSign&&!n))switch(this.settings.negativePositiveSignPlacement){case e.options.negativePositiveSignPlacement.prefix:case e.options.negativePositiveSignPlacement.left:case e.options.negativePositiveSignPlacement.right:c=a;break;case e.options.negativePositiveSignPlacement.suffix:c=g+r}else c=a;else if(this.settings.caretPositionOnFocus===e.options.caretPositionOnFocus.decimalLeft)if(this.settings.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.none&&(i||!i&&this.settings.showPositiveSign&&!n))switch(this.settings.negativePositiveSignPlacement){case e.options.negativePositiveSignPlacement.prefix:case e.options.negativePositiveSignPlacement.left:case e.options.negativePositiveSignPlacement.right:c=m+g+o;break;case e.options.negativePositiveSignPlacement.suffix:c=g+o}else c=g+o;else if(this.settings.caretPositionOnFocus===e.options.caretPositionOnFocus.decimalRight)if(this.settings.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.none&&(i||!i&&this.settings.showPositiveSign&&!n))switch(this.settings.negativePositiveSignPlacement){case e.options.negativePositiveSignPlacement.prefix:case e.options.negativePositiveSignPlacement.left:case e.options.negativePositiveSignPlacement.right:c=m+g+o+l;break;case e.options.negativePositiveSignPlacement.suffix:c=g+o+l}else c=g+o+l}else if(this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.suffix)if(this.settings.caretPositionOnFocus===e.options.caretPositionOnFocus.start)if(this.settings.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.none&&(i||!i&&this.settings.showPositiveSign&&!n))switch(this.settings.negativePositiveSignPlacement){case e.options.negativePositiveSignPlacement.suffix:case e.options.negativePositiveSignPlacement.right:case e.options.negativePositiveSignPlacement.left:c=0;break;case e.options.negativePositiveSignPlacement.prefix:c=m}else c=0;else if(this.settings.caretPositionOnFocus===e.options.caretPositionOnFocus.end)if(this.settings.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.none&&(i||!i&&this.settings.showPositiveSign&&!n))switch(this.settings.negativePositiveSignPlacement){case e.options.negativePositiveSignPlacement.suffix:case e.options.negativePositiveSignPlacement.right:case e.options.negativePositiveSignPlacement.left:c=r;break;case e.options.negativePositiveSignPlacement.prefix:c=m+r}else c=r;else if(this.settings.caretPositionOnFocus===e.options.caretPositionOnFocus.decimalLeft)if(this.settings.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.none&&(i||!i&&this.settings.showPositiveSign&&!n))switch(this.settings.negativePositiveSignPlacement){case e.options.negativePositiveSignPlacement.suffix:case e.options.negativePositiveSignPlacement.right:case e.options.negativePositiveSignPlacement.left:c=o;break;case e.options.negativePositiveSignPlacement.prefix:c=m+o}else c=o;else if(this.settings.caretPositionOnFocus===e.options.caretPositionOnFocus.decimalRight)if(this.settings.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.none&&(i||!i&&this.settings.showPositiveSign&&!n))switch(this.settings.negativePositiveSignPlacement){case e.options.negativePositiveSignPlacement.suffix:case e.options.negativePositiveSignPlacement.right:case e.options.negativePositiveSignPlacement.left:c=o+l;break;case e.options.negativePositiveSignPlacement.prefix:c=m+o+l}else c=o+l;return c}},{key:"_triggerRangeEvents",value:function(t,i){t||this._triggerEvent(e.events.minRangeExceeded,this.domElement),i||this._triggerEvent(e.events.maxRangeExceeded,this.domElement)}},{key:"_setInvalidState",value:function(){this.isInputElement?h.setInvalidState(this.domElement):this._addCSSClass(this.settings.invalidClass),this._triggerEvent(e.events.invalidValue,this.domElement),this.validState=!1}},{key:"_setValidState",value:function(){this.isInputElement?h.setValidState(this.domElement):this._removeCSSClass(this.settings.invalidClass),this.validState||this._triggerEvent(e.events.correctedValue,this.domElement),this.validState=!0}},{key:"_setValidOrInvalidState",value:function(t){if(this.settings.overrideMinMaxLimits===e.options.overrideMinMaxLimits.invalid){var i=this.constructor._isMinimumRangeRespected(t,this.settings),n=this.constructor._isMaximumRangeRespected(t,this.settings);i&&n?this._setValidState():this._setInvalidState(),this._triggerRangeEvents(i,n)}}},{key:"_keepAnOriginalSettingsCopy",value:function(){this.originalDigitGroupSeparator=this.settings.digitGroupSeparator,this.originalCurrencySymbol=this.settings.currencySymbol,this.originalSuffixText=this.settings.suffixText}},{key:"_trimLeadingAndTrailingZeros",value:function(t){if(""===t||null===t)return t;if(this.settings.leadingZero!==e.options.leadingZero.keep){if(0===Number(t))return"0";t=t.replace(/^(-)?0+(?=\d)/g,"$1")}return h.contains(t,".")&&(t=t.replace(/(\.[0-9]*?)0+$/,"$1")),t=t.replace(/\.$/,"")}},{key:"_setPersistentStorageName",value:function(){this.settings.saveValueToSessionStorage&&(""===this.domElement.name||h.isUndefined(this.domElement.name)?this.rawValueStorageName="".concat(this.storageNamePrefix).concat(this.domElement.id):this.rawValueStorageName="".concat(this.storageNamePrefix).concat(decodeURIComponent(this.domElement.name)))}},{key:"_saveValueToPersistentStorage",value:function(){this.settings.saveValueToSessionStorage&&sessionStorage.setItem(this.rawValueStorageName,this.rawValue)}},{key:"_getValueFromPersistentStorage",value:function(){return this.settings.saveValueToSessionStorage?sessionStorage.getItem(this.rawValueStorageName):(h.warning("`_getValueFromPersistentStorage()` is called but `settings.saveValueToSessionStorage` is false. There must be an error that needs fixing.",this.settings.showWarnings),null)}},{key:"_removeValueFromPersistentStorage",value:function(){this.settings.saveValueToSessionStorage&&sessionStorage.removeItem(this.rawValueStorageName)}},{key:"_getDefaultValue",value:function(e){var t=e.getAttribute("value");return h.isNull(t)?"":t}},{key:"_onFocusInAndMouseEnter",value:function(t){if(this.isEditing=!1,!this.formulaMode&&this.settings.unformatOnHover&&"mouseenter"===t.type&&t.altKey)this.constructor._unformatAltHovered(this);else if("focus"===t.type&&(this.isFocused=!0,this.rawValueOnFocus=this.rawValue),"focus"===t.type&&this.settings.unformatOnHover&&this.hoveredWithAlt&&this.constructor._reformatAltHovered(this),"focus"===t.type||"mouseenter"===t.type&&!this.isFocused){var i=null;this.settings.emptyInputBehavior===e.options.emptyInputBehavior.focus&&this.rawValue<0&&null!==this.settings.negativeBracketsTypeOnBlur&&this.settings.isNegativeSignAllowed&&(i=this.constructor._removeBrackets(h.getElementValue(this.domElement),this.settings));var n=this._getRawValueToFormat(this.rawValue);if(""!==n){var a=this.constructor._roundFormattedValueShownOnFocusOrBlur(n,this.settings,this.isFocused);this.settings.showOnlyNumbersOnFocus===e.options.showOnlyNumbersOnFocus.onlyNumbers?(this.settings.digitGroupSeparator="",this.settings.currencySymbol="",this.settings.suffixText="",i=a.replace(".",this.settings.decimalCharacter)):i=h.isNull(a)?"":this.constructor._addGroupSeparators(a.replace(".",this.settings.decimalCharacter),this.settings,this.isFocused,n)}h.isNull(i)?this.valueOnFocus="":this.valueOnFocus=i,this.lastVal=this.valueOnFocus;var r=this.constructor._isElementValueEmptyOrOnlyTheNegativeSign(this.valueOnFocus,this.settings),o=this.constructor._orderValueCurrencySymbolAndSuffixText(this.valueOnFocus,this.settings,!0),s=r&&""!==o&&this.settings.emptyInputBehavior===e.options.emptyInputBehavior.focus;s&&(i=o),h.isNull(i)||this._setElementValue(i),s&&o===this.settings.currencySymbol&&this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.suffix&&h.setElementSelection(t.target,0)}}},{key:"_onFocus",value:function(){this.settings.isCancellable&&this._saveCancellableValue()}},{key:"_onFocusIn",value:function(e){this.settings.selectOnFocus?this.select():h.isNull(this.settings.caretPositionOnFocus)||h.setElementSelection(e.target,this._initialCaretPosition(h.getElementValue(this.domElement)))}},{key:"_enterFormulaMode",value:function(){this.settings.formulaMode&&(this.formulaMode=!0,h.setElementValue(this.domElement,"="),h.setElementSelection(this.domElement,1))}},{key:"_exitFormulaMode",value:function(){var t,i=h.getElementValue(this.domElement);i=i.replace(/^\s*=/,"");try{var n=new _(i,this.settings.decimalCharacter);t=(new d).evaluate(n)}catch(a){return this._triggerEvent(e.events.invalidFormula,this.domElement,{formula:i,aNElement:this}),this.reformat(),void(this.formulaMode=!1)}this._triggerEvent(e.events.validFormula,this.domElement,{formula:i,result:t,aNElement:this}),this.set(t),this.formulaMode=!1}},{key:"_acceptNonPrintableKeysInFormulaMode",value:function(){return this.eventKey===n.keyName.Backspace||this.eventKey===n.keyName.Delete||this.eventKey===n.keyName.LeftArrow||this.eventKey===n.keyName.RightArrow||this.eventKey===n.keyName.Home||this.eventKey===n.keyName.End}},{key:"_onKeydown",value:function(t){if(this.formatted=!1,this.isEditing=!0,this.formulaMode||this.isFocused||!this.settings.unformatOnHover||!t.altKey||this.domElement!==h.getHoveredElement()){if(this._updateEventKeyInfo(t),this.keydownEventCounter+=1,1===this.keydownEventCounter&&(this.initialValueOnFirstKeydown=h.getElementValue(t.target),this.initialRawValueOnFirstKeydown=this.rawValue),this.formulaMode){if(this.eventKey===n.keyName.Esc)return this.formulaMode=!1,void this.reformat();if(this.eventKey===n.keyName.Enter)return void this._exitFormulaMode();if(this._acceptNonPrintableKeysInFormulaMode())return}else{if(this.eventKey===n.keyName.Equal)return void this._enterFormulaMode();if(this.settings.modifyValueOnUpDownArrow&&(this.eventKey===n.keyName.UpArrow||this.eventKey===n.keyName.DownArrow))return void this.upDownArrowAction(t)}if(this.domElement.readOnly||this.settings.readOnly||this.domElement.disabled)this.processed=!0;else{this.eventKey===n.keyName.Esc&&(t.preventDefault(),this.settings.isCancellable&&this.rawValue!==this.savedCancellableValue&&(this.set(this.savedCancellableValue),this._triggerEvent(e.events.native.input,t.target)),this.select());var i=h.getElementValue(t.target);if(this.eventKey===n.keyName.Enter&&this.rawValue!==this.rawValueOnFocus&&(this._triggerEvent(e.events.native.change,t.target),this.valueOnFocus=i,this.rawValueOnFocus=this.rawValue,this.settings.isCancellable&&this._saveCancellableValue()),this._updateInternalProperties(t),this._processNonPrintableKeysAndShortcuts(t))this.processed=!0;else if(this.eventKey===n.keyName.Backspace||this.eventKey===n.keyName.Delete){var a=this._processCharacterDeletion(t);if(this.processed=!0,!a)return void t.preventDefault();this._formatValue(t),(i=h.getElementValue(t.target))!==this.lastVal&&this.throwInput&&(this._triggerEvent(e.events.native.input,t.target),t.preventDefault()),this.lastVal=i,this.throwInput=!0}}}else this.constructor._unformatAltHovered(this)}},{key:"_onKeypress",value:function(t){if(this.formulaMode){if(this._acceptNonPrintableKeysInFormulaMode())return;if(this.settings.formulaChars.test(this.eventKey))return;t.preventDefault()}else if(this.eventKey!==n.keyName.Insert){var i=this.processed;if(this._updateInternalProperties(t),!this._processNonPrintableKeysAndShortcuts(t))if(i)t.preventDefault();else{if(this._processCharacterInsertion()){this._formatValue(t);var a=h.getElementValue(t.target);if(a!==this.lastVal&&this.throwInput)this._triggerEvent(e.events.native.input,t.target),t.preventDefault();else{if((this.eventKey===this.settings.decimalCharacter||this.eventKey===this.settings.decimalCharacterAlternative)&&h.getElementSelection(t.target).start===h.getElementSelection(t.target).end&&h.getElementSelection(t.target).start===a.indexOf(this.settings.decimalCharacter)){var r=h.getElementSelection(t.target).start+1;h.setElementSelection(t.target,r)}t.preventDefault()}return this.lastVal=h.getElementValue(t.target),this.throwInput=!0,void this._setValidOrInvalidState(this.rawValue)}t.preventDefault()}}}},{key:"_onKeyup",value:function(t){if(this.isEditing=!1,this.keydownEventCounter=0,!this.formulaMode)if(this.settings.isCancellable&&this.eventKey===n.keyName.Esc)t.preventDefault();else{if(this._updateEventKeyInfo(t),this.eventKey===n.keyName.Z||this.eventKey===n.keyName.z){if(t.ctrlKey&&t.shiftKey)return t.preventDefault(),this._historyTableRedo(),this._triggerEvent(e.events.native.input,t.target),void(this.onGoingRedo=!0);if(t.ctrlKey&&!t.shiftKey){if(!this.onGoingRedo)return t.preventDefault(),this._historyTableUndo(),void this._triggerEvent(e.events.native.input,t.target);this.onGoingRedo=!1}}else if((this.eventKey===n.keyName.Y||this.eventKey===n.keyName.y)&&t.ctrlKey)return t.preventDefault(),this._historyTableRedo(),this._triggerEvent(e.events.native.input,t.target),void(this.onGoingRedo=!0);if(this.onGoingRedo&&(t.ctrlKey||t.shiftKey)&&(this.onGoingRedo=!1),(t.ctrlKey||t.metaKey)&&(this.eventKey===n.keyName.X||this.eventKey===n.keyName.x)){var i=h.getElementSelection(this.domElement).start,a=this.constructor._toNumericValue(h.getElementValue(t.target),this.settings);this.set(a),this._setCaretPosition(i)}if(this.eventKey===n.keyName.Alt&&this.settings.unformatOnHover&&this.hoveredWithAlt)this.constructor._reformatAltHovered(this);else if(!t.ctrlKey&&!t.metaKey||this.eventKey!==n.keyName.Backspace&&this.eventKey!==n.keyName.Delete){this._updateInternalProperties(t);var r=this._processNonPrintableKeysAndShortcuts(t);delete this.valuePartsBeforePaste;var o=h.getElementValue(t.target);if(!(r||""===o&&""===this.initialValueOnFirstKeydown)&&(o===this.settings.currencySymbol?this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.suffix?h.setElementSelection(t.target,0):h.setElementSelection(t.target,this.settings.currencySymbol.length):this.eventKey===n.keyName.Tab&&h.setElementSelection(t.target,0,o.length),(o===this.settings.suffixText||""===this.rawValue&&""!==this.settings.currencySymbol&&""!==this.settings.suffixText)&&h.setElementSelection(t.target,0),null!==this.settings.decimalPlacesShownOnFocus&&this._saveValueToPersistentStorage(),this.formatted||this._formatValue(t),this._setValidOrInvalidState(this.rawValue),this._saveRawValueForAndroid(),o!==this.initialValueOnFirstKeydown&&this._triggerEvent(e.events.formatted,t.target,{oldValue:this.initialValueOnFirstKeydown,newValue:o,oldRawValue:this.initialRawValueOnFirstKeydown,newRawValue:this.rawValue,isPristine:this.isPristine(!1),error:null,aNElement:this}),this.historyTable.length>1)){var s=h.getElementSelection(this.domElement);this.selectionStart=s.start,this.selectionEnd=s.end,this.historyTable[this.historyTableIndex].start=this.selectionStart,this.historyTable[this.historyTableIndex].end=this.selectionEnd}}else{var l=h.getElementValue(t.target);this._setRawValue(this._formatOrUnformatOther(!1,l))}}}},{key:"_saveRawValueForAndroid",value:function(){if(this.eventKey===n.keyName.AndroidDefault){var e=this.constructor._stripAllNonNumberCharactersExceptCustomDecimalChar(this.getFormatted(),this.settings,!0,this.isFocused);e=this.constructor._convertToNumericString(e,this.settings),this._setRawValue(e)}}},{key:"_onFocusOutAndMouseLeave",value:function(t){if(this.isEditing=!1,"mouseleave"!==t.type||!this.formulaMode)if(this.settings.unformatOnHover&&"mouseleave"===t.type&&this.hoveredWithAlt)this.constructor._reformatAltHovered(this);else if("mouseleave"===t.type&&!this.isFocused||"blur"===t.type){"blur"===t.type&&this.formulaMode&&this._exitFormulaMode(),this._saveValueToPersistentStorage(),this.settings.showOnlyNumbersOnFocus===e.options.showOnlyNumbersOnFocus.onlyNumbers&&(this.settings.digitGroupSeparator=this.originalDigitGroupSeparator,this.settings.currencySymbol=this.originalCurrencySymbol,this.settings.suffixText=this.originalSuffixText);var i=this._getRawValueToFormat(this.rawValue),n=h.isNull(i),a=F(this.constructor._checkIfInRangeWithOverrideOption(i,this.settings),2),r=a[0],o=a[1],s=!1;if(""===i||n||(this._triggerRangeEvents(r,o),this.settings.valuesToStrings&&this._checkValuesToStrings(i)&&(this._setElementValue(this.settings.valuesToStrings[i]),s=!0)),!s){var l;if(l=n||""===i?i:String(i),""===i||n){if(""===i)switch(this.settings.emptyInputBehavior){case e.options.emptyInputBehavior.zero:this._setRawValue("0"),l=this.constructor._roundValue("0",this.settings,0);break;case e.options.emptyInputBehavior.min:this._setRawValue(this.settings.minimumValue),l=this.constructor._roundFormattedValueShownOnFocusOrBlur(this.settings.minimumValue,this.settings,this.isFocused);break;case e.options.emptyInputBehavior.max:this._setRawValue(this.settings.maximumValue),l=this.constructor._roundFormattedValueShownOnFocusOrBlur(this.settings.maximumValue,this.settings,this.isFocused);break;default:h.isNumber(this.settings.emptyInputBehavior)&&(this._setRawValue(this.settings.emptyInputBehavior),l=this.constructor._roundFormattedValueShownOnFocusOrBlur(this.settings.emptyInputBehavior,this.settings,this.isFocused))}}else r&&o&&!this.constructor._isElementValueEmptyOrOnlyTheNegativeSign(i,this.settings)?(l=this._modifyNegativeSignAndDecimalCharacterForRawValue(l),this.settings.divisorWhenUnfocused&&!h.isNull(l)&&(l=(l/=this.settings.divisorWhenUnfocused).toString()),l=this.constructor._roundFormattedValueShownOnBlur(l,this.settings),l=this.constructor._modifyNegativeSignAndDecimalCharacterForFormattedValue(l,this.settings)):this._triggerRangeEvents(r,o);var u=this.constructor._orderValueCurrencySymbolAndSuffixText(l,this.settings,!1);this.constructor._isElementValueEmptyOrOnlyTheNegativeSign(l,this.settings)||n&&this.settings.emptyInputBehavior===e.options.emptyInputBehavior.null||(u=this.constructor._addGroupSeparators(l,this.settings,!1,i)),u===i&&""!==i&&this.settings.allowDecimalPadding!==e.options.allowDecimalPadding.never&&this.settings.allowDecimalPadding!==e.options.allowDecimalPadding.floats||(this.settings.symbolWhenUnfocused&&""!==i&&null!==i&&(u="".concat(u).concat(this.settings.symbolWhenUnfocused)),this._setElementValue(u))}this._setValidOrInvalidState(this.rawValue),"blur"===t.type&&this._onBlur(t)}}},{key:"_onPaste",value:function(t){if(t.preventDefault(),!(this.settings.readOnly||this.domElement.readOnly||this.domElement.disabled)){var i,n;t.clipboardData&&t.clipboardData.getData?i=t.clipboardData.getData("text/plain"):h.throwError("Unable to retrieve the pasted value. Please use a modern browser (i.e. Firefox or Chromium)."),n=t.target.tagName?t.target:t.explicitOriginalTarget;var a=h.getElementValue(n),r=n.selectionStart||0,o=n.selectionEnd||0,s=o-r;if(s===a.length){var l=this._preparePastedText(i),u=h.arabicToLatinNumbers(l,!1,!1,!1);return"."===u||""===u||"."!==u&&!h.isNumber(u)?(this.formatted=!0,void(this.settings.onInvalidPaste===e.options.onInvalidPaste.error&&h.throwError("The pasted value '".concat(i,"' is not a valid paste content.")))):(this.set(u),this.formatted=!0,void this._triggerEvent(e.events.native.input,n))}var c=h.isNegativeStrict(i,this.settings.negativeSignCharacter);c&&(i=i.slice(1,i.length));var m,g,d=this._preparePastedText(i);if("."!==(m="."===d?".":h.arabicToLatinNumbers(d,!1,!1,!1))&&(!h.isNumber(m)||""===m))return this.formatted=!0,void(this.settings.onInvalidPaste===e.options.onInvalidPaste.error&&h.throwError("The pasted value '".concat(i,"' is not a valid paste content.")));var v,p,f=h.isNegativeStrict(this.getNumericString(),this.settings.negativeSignCharacter);c&&!f?(f=!0,v=!0):v=!1;var y=a.slice(0,r),S=a.slice(o,a.length);p=r!==o?this._preparePastedText(y+S):this._preparePastedText(a),f&&(p=h.setRawNegativeSign(p)),g=h.convertCharacterCountToIndexPosition(h.countNumberCharactersOnTheCaretLeftSide(a,r,this.settings.decimalCharacter)),v&&g++;var b=p.slice(0,g),w=p.slice(g,p.length),P=!1;"."===m&&(h.contains(b,".")&&(P=!0,b=b.replace(".","")),w=w.replace(".",""));var O=!1;switch(""===b&&"-"===w&&(b="-",w="",O=!0),this.settings.onInvalidPaste){case e.options.onInvalidPaste.truncate:case e.options.onInvalidPaste.replace:for(var N=h.parseStr(this.settings.minimumValue),k=h.parseStr(this.settings.maximumValue),E=p,_=0,C=b;_<m.length&&(p=(C+=m[_])+w,this.constructor._checkIfInRange(p,N,k));)E=p,_++;if(g+=_,O&&g++,this.settings.onInvalidPaste===e.options.onInvalidPaste.truncate){p=E,P&&g--;break}for(var F=g,V=E.length;_<m.length&&F<V;)if("."!==E[F]){if(p=h.replaceCharAt(E,F,m[_]),!this.constructor._checkIfInRange(p,N,k))break;E=p,_++,F++}else F++;g=F,P&&g--,p=E;break;case e.options.onInvalidPaste.error:case e.options.onInvalidPaste.ignore:case e.options.onInvalidPaste.clamp:default:if(p="".concat(b).concat(m).concat(w),r===o)g=h.convertCharacterCountToIndexPosition(h.countNumberCharactersOnTheCaretLeftSide(a,r,this.settings.decimalCharacter))+m.length;else if(""===w)g=h.convertCharacterCountToIndexPosition(h.countNumberCharactersOnTheCaretLeftSide(a,r,this.settings.decimalCharacter))+m.length,O&&g++;else{var x=h.convertCharacterCountToIndexPosition(h.countNumberCharactersOnTheCaretLeftSide(a,o,this.settings.decimalCharacter)),T=h.getElementValue(n).slice(r,o);g=x-s+h.countCharInText(this.settings.digitGroupSeparator,T)+m.length}v&&g++,P&&g--}if(h.isNumber(p)&&""!==p){var A=!1,L=!1;try{this.set(p),A=!0}catch(M){var D;switch(this.settings.onInvalidPaste){case e.options.onInvalidPaste.clamp:D=h.clampToRangeLimits(p,this.settings);try{this.set(D)}catch(M){h.throwError("Fatal error: Unable to set the clamped value '".concat(D,"'."))}L=!0,A=!0,p=D;break;case e.options.onInvalidPaste.error:case e.options.onInvalidPaste.truncate:case e.options.onInvalidPaste.replace:h.throwError("The pasted value '".concat(i,"' results in a value '").concat(p,"' that is outside of the minimum [").concat(this.settings.minimumValue,"] and maximum [").concat(this.settings.maximumValue,"] value range."));case e.options.onInvalidPaste.ignore:default:return}}var B,I=h.getElementValue(n);if(A)switch(this.settings.onInvalidPaste){case e.options.onInvalidPaste.clamp:if(L){this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.suffix?h.setElementSelection(n,I.length-this.settings.currencySymbol.length):h.setElementSelection(n,I.length);break}case e.options.onInvalidPaste.error:case e.options.onInvalidPaste.ignore:case e.options.onInvalidPaste.truncate:case e.options.onInvalidPaste.replace:default:B=h.findCaretPositionInFormattedNumber(p,g,I,this.settings.decimalCharacter),h.setElementSelection(n,B)}A&&a!==I&&this._triggerEvent(e.events.native.input,n)}else this.settings.onInvalidPaste===e.options.onInvalidPaste.error&&h.throwError("The pasted value '".concat(i,"' would result into an invalid content '").concat(p,"'."))}}},{key:"_onBlur",value:function(t){this.isFocused=!1,this.isEditing=!1,h.trimPaddedZerosFromDecimalPlaces(this.rawValue)!==h.trimPaddedZerosFromDecimalPlaces(this.rawValueOnFocus)&&this._triggerEvent(e.events.native.change,t.target),this.rawValueOnFocus=void 0}},{key:"_wheelAndUpDownActions",value:function(t,i,n,a){var r,o=t.target.selectionStart||0,s=t.target.selectionEnd||0,l=this.rawValue;if(r=+(r=h.isUndefinedOrNullOrEmpty(l)?this.settings.minimumValue>0||this.settings.maximumValue<0?i?this.settings.minimumValue:this.settings.maximumValue:0:l),h.isNumber(a)){var u=+a;i?r+=u:n&&(r-=u)}else i?r=h.addAndRoundToNearestAuto(r,this.settings.decimalPlacesRawValue):n&&(r=h.subtractAndRoundToNearestAuto(r,this.settings.decimalPlacesRawValue));(r=h.clampToRangeLimits(r,this.settings))!==+l&&(this.set(r),this._triggerEvent(e.events.native.input,t.target)),t.preventDefault(),this._setSelection(o,s)}},{key:"upDownArrowAction",value:function(e){if(!(this.formulaMode||this.settings.readOnly||this.domElement.readOnly||this.domElement.disabled)){var t=!1,i=!1;this.eventKey===n.keyName.UpArrow?t=!0:this.eventKey===n.keyName.DownArrow?i=!0:h.throwError("Something has gone wrong since neither an Up or Down arrow key is detected, but the function was still called!"),this._wheelAndUpDownActions(e,t,i,this.settings.upDownStep)}}},{key:"_onWheel",value:function(t){this.formulaMode||this.settings.readOnly||this.domElement.readOnly||this.domElement.disabled||this.settings.modifyValueOnWheel&&(this.settings.wheelOn===e.options.wheelOn.focus?this.isFocused?t.shiftKey||this.wheelAction(t):t.shiftKey&&this.wheelAction(t):this.settings.wheelOn===e.options.wheelOn.hover?t.shiftKey?(t.preventDefault(),window.scrollBy(0,h.isNegativeStrict(String(t.deltaY))?-50:50)):this.wheelAction(t):h.throwError("Unknown `wheelOn` option."))}},{key:"wheelAction",value:function(e){this.isWheelEvent=!0;var t=!1,i=!1,n=!1;h.isWheelUpEvent(e)?t=!0:h.isWheelDownEvent(e)?i=!0:h.isWheelEventWithZeroDeltaY(e)?n=!0:h.throwError("The event is not a 'wheel' event."),n||this._wheelAndUpDownActions(e,t,i,this.settings.wheelStep),this.isWheelEvent=!1}},{key:"_onDrop",value:function(t){if(!this.formulaMode){this.isDropEvent=!0,t.preventDefault();var i=t.dataTransfer.getData("text/plain"),n=this.unformatOther(i),a=this.rawValue;this.set(n),this.isDropEvent=!1;var r=this.constructor._toNumericValue(n,this.settings);isNaN(Number(r))||h.trimPaddedZerosFromDecimalPlaces(a)!==h.trimPaddedZerosFromDecimalPlaces(r)&&this._triggerEvent(e.events.native.change,this.domElement)}}},{key:"_onFormSubmit",value:function(){var e=this;return this._getFormAutoNumericChildren(this.parentForm).map((function(t){return e.constructor.getAutoNumericElement(t)})).forEach((function(e){return e._unformatOnSubmit()})),!0}},{key:"_onFormReset",value:function(){var e=this;this._getFormAutoNumericChildren(this.parentForm).map((function(t){return e.constructor.getAutoNumericElement(t)})).forEach((function(t){var i=e._getDefaultValue(t.node());setTimeout((function(){return t.set(i)}),0)}))}},{key:"_unformatOnSubmit",value:function(){this.settings.unformatOnSubmit&&this._setElementValue(this.rawValue)}},{key:"_onKeydownGlobal",value:function(t){if(h.character(t)===n.keyName.Alt){var i=h.getHoveredElement();if(e.isManagedByAutoNumeric(i)){var a=e.getAutoNumericElement(i);!a.formulaMode&&a.settings.unformatOnHover&&this.constructor._unformatAltHovered(a)}}}},{key:"_onKeyupGlobal",value:function(t){if(h.character(t)===n.keyName.Alt){var i=h.getHoveredElement();if(e.isManagedByAutoNumeric(i)){var a=e.getAutoNumericElement(i);if(a.formulaMode||!a.settings.unformatOnHover)return;this.constructor._reformatAltHovered(a)}}}},{key:"_isElementTagSupported",value:function(){return h.isElement(this.domElement)||h.throwError("The DOM element is not valid, ".concat(this.domElement," given.")),h.isInArray(this.domElement.tagName.toLowerCase(),this.allowedTagList)}},{key:"_isInputElement",value:function(){return"input"===this.domElement.tagName.toLowerCase()}},{key:"_isInputTypeSupported",value:function(){return"text"===this.domElement.type||"hidden"===this.domElement.type||"tel"===this.domElement.type||h.isUndefinedOrNullOrEmpty(this.domElement.type)}},{key:"_checkElement",value:function(){var e=this.domElement.tagName.toLowerCase();this._isElementTagSupported()||h.throwError("The <".concat(e,"> tag is not supported by autoNumeric")),this._isInputElement()?(this._isInputTypeSupported()||h.throwError('The input type "'.concat(this.domElement.type,'" is not supported by autoNumeric')),this.isInputElement=!0):(this.isInputElement=!1,this.isContentEditable=this._isContentEditable(this.domElement))}},{key:"_isContentEditable",value:function(e){return e.hasAttribute("contenteditable")&&"true"===e.getAttribute("contenteditable")}},{key:"_formatDefaultValueOnPageLoad",value:function(){var t,i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,n=!0;if(h.isNull(i)?(t=h.getElementValue(this.domElement).trim(),this.domElement.setAttribute("value",t)):t=i,this.isInputElement||this.isContentEditable){var a=this.constructor._toNumericValue(t,this.settings);if(this.domElement.hasAttribute("value")&&""!==this.domElement.getAttribute("value")){if(null!==this.settings.defaultValueOverride&&this.settings.defaultValueOverride.toString()!==t||null===this.settings.defaultValueOverride&&""!==t&&t!==this.domElement.getAttribute("value")||""!==t&&"hidden"===this.domElement.getAttribute("type")&&!h.isNumber(a)){if(this.settings.saveValueToSessionStorage&&(null!==this.settings.decimalPlacesShownOnFocus||this.settings.divisorWhenUnfocused)&&this._setRawValue(this._getValueFromPersistentStorage()),!this.settings.saveValueToSessionStorage){var r=this.constructor._removeBrackets(t,this.settings);(this.settings.negativePositiveSignPlacement===e.options.negativePositiveSignPlacement.suffix||this.settings.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.prefix&&this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.suffix)&&""!==this.settings.negativeSignCharacter&&h.isNegative(t,this.settings.negativeSignCharacter)?this._setRawValue("-".concat(this.constructor._stripAllNonNumberCharacters(r,this.settings,!0,this.isFocused))):this._setRawValue(this.constructor._stripAllNonNumberCharacters(r,this.settings,!0,this.isFocused))}n=!1}}else isNaN(Number(a))||Infinity===a?h.throwError("The value [".concat(t,"] used in the input is not a valid value autoNumeric can work with.")):(this.set(a),n=!1);if(""===t)switch(this.settings.emptyInputBehavior){case e.options.emptyInputBehavior.focus:case e.options.emptyInputBehavior.press:break;case e.options.emptyInputBehavior.always:this._setElementValue(this.settings.currencySymbol);break;case e.options.emptyInputBehavior.min:this.set(this.settings.minimumValue);break;case e.options.emptyInputBehavior.max:this.set(this.settings.maximumValue);break;case e.options.emptyInputBehavior.zero:this.set("0");break;case e.options.emptyInputBehavior.null:this.set(null);break;default:this.set(this.settings.emptyInputBehavior)}else n&&t===this.domElement.getAttribute("value")&&this.set(t)}else null!==this.settings.defaultValueOverride&&this.settings.defaultValueOverride!==t||this.set(t)}},{key:"_calculateVMinAndVMaxIntegerSizes",value:function(){var e=F(this.settings.maximumValue.toString().split("."),1)[0],t=F(this.settings.minimumValue||0===this.settings.minimumValue?this.settings.minimumValue.toString().split("."):[],1)[0];e=e.replace(this.settings.negativeSignCharacter,""),t=t.replace(this.settings.negativeSignCharacter,""),this.settings.mIntPos=Math.max(e.length,1),this.settings.mIntNeg=Math.max(t.length,1)}},{key:"_calculateValuesToStringsKeys",value:function(){this.settings.valuesToStrings?this.valuesToStringsKeys=Object.keys(this.settings.valuesToStrings):this.valuesToStringsKeys=[]}},{key:"_transformOptionsValuesToDefaultTypes",value:function(){for(var e in this.settings)if(Object.prototype.hasOwnProperty.call(this.settings,e)){var t=this.settings[e];"true"!==t&&"false"!==t||(this.settings[e]="true"===t),"number"==typeof t&&(this.settings[e]=t.toString())}}},{key:"_setSettings",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];!t&&h.isNull(e)||this.constructor._convertOldOptionsToNewOnes(e),t?("decimalPlacesRawValue"in e&&(this.settings.originalDecimalPlacesRawValue=e.decimalPlacesRawValue),"decimalPlaces"in e&&(this.settings.originalDecimalPlaces=e.decimalPlaces),this.constructor._calculateDecimalPlacesOnUpdate(e,this.settings),this._mergeSettings(e)):(this.settings={},this._mergeSettings(this.constructor.getDefaultConfig(),this.domElement.dataset,e,{rawValue:this.defaultRawValue}),this.caretFix=!1,this.throwInput=!0,this.allowedTagList=n.allowedTagList,this.runOnce=!1,this.hoveredWithAlt=!1),this._transformOptionsValuesToDefaultTypes(),this._runCallbacksFoundInTheSettingsObject(),this.constructor._correctNegativePositiveSignPlacementOption(this.settings),this.constructor._correctCaretPositionOnFocusAndSelectOnFocusOptions(this.settings),this.constructor._setNegativePositiveSignPermissions(this.settings),t||(h.isNull(e)||!e.decimalPlaces?this.settings.originalDecimalPlaces=null:this.settings.originalDecimalPlaces=e.decimalPlaces,this.settings.originalDecimalPlacesRawValue=this.settings.decimalPlacesRawValue,this.constructor._calculateDecimalPlacesOnInit(this.settings)),this._calculateVMinAndVMaxIntegerSizes(),this._setTrailingNegativeSignInfo(),this.regex={},this.constructor._cachesUsualRegularExpressions(this.settings,this.regex),this.constructor._setBrackets(this.settings),this._calculateValuesToStringsKeys(),h.isEmptyObj(this.settings)&&h.throwError("Unable to set the settings, those are invalid ; an empty object was given."),this.constructor.validate(this.settings,!1,e),this._keepAnOriginalSettingsCopy()}},{key:"_preparePastedText",value:function(e){return this.constructor._stripAllNonNumberCharacters(e,this.settings,!0,this.isFocused)}},{key:"_updateInternalProperties",value:function(){this.selection=h.getElementSelection(this.domElement),this.processed=!1}},{key:"_updateEventKeyInfo",value:function(e){this.eventKey=h.character(e)}},{key:"_saveCancellableValue",value:function(){this.savedCancellableValue=this.rawValue}},{key:"_setSelection",value:function(e,t){e=Math.max(e,0),t=Math.min(t,h.getElementValue(this.domElement).length),this.selection={start:e,end:t,length:t-e},h.setElementSelection(this.domElement,e,t)}},{key:"_setCaretPosition",value:function(e){this._setSelection(e,e)}},{key:"_getLeftAndRightPartAroundTheSelection",value:function(){var e=h.getElementValue(this.domElement);return[e.substring(0,this.selection.start),e.substring(this.selection.end,e.length)]}},{key:"_getUnformattedLeftAndRightPartAroundTheSelection",value:function(){var t=F(this._getLeftAndRightPartAroundTheSelection(),2),i=t[0],a=t[1];if(""===i&&""===a)return["",""];var r=!0;return this.eventKey!==n.keyName.Hyphen&&this.eventKey!==n.keyName.Minus||0!==Number(i)||(r=!1),this.isTrailingNegative&&(h.isNegative(a,this.settings.negativeSignCharacter)&&!h.isNegative(i,this.settings.negativeSignCharacter)||""===a&&h.isNegative(i,this.settings.negativeSignCharacter,!0))&&(i=i.replace(this.settings.negativeSignCharacter,""),a=a.replace(this.settings.negativeSignCharacter,""),i=i.replace("-",""),a=a.replace("-",""),i="-".concat(i)),[i=e._stripAllNonNumberCharactersExceptCustomDecimalChar(i,this.settings,r,this.isFocused),a=e._stripAllNonNumberCharactersExceptCustomDecimalChar(a,this.settings,!1,this.isFocused)]}},{key:"_normalizeParts",value:function(t,i){var a=!0;this.eventKey!==n.keyName.Hyphen&&this.eventKey!==n.keyName.Minus||0!==Number(t)||(a=!1),this.isTrailingNegative&&h.isNegative(i,this.settings.negativeSignCharacter)&&!h.isNegative(t,this.settings.negativeSignCharacter)&&(t="-".concat(t),i=i.replace(this.settings.negativeSignCharacter,"")),t=e._stripAllNonNumberCharactersExceptCustomDecimalChar(t,this.settings,a,this.isFocused),i=e._stripAllNonNumberCharactersExceptCustomDecimalChar(i,this.settings,!1,this.isFocused),this.settings.leadingZero!==e.options.leadingZero.deny||this.eventKey!==n.keyName.num0&&this.eventKey!==n.keyName.numpad0||0!==Number(t)||h.contains(t,this.settings.decimalCharacter)||""===i||(t=t.substring(0,t.length-1));var r=t+i;if(this.settings.decimalCharacter){var o=r.match(new RegExp("^".concat(this.regex.aNegRegAutoStrip,"\\").concat(this.settings.decimalCharacter)));o&&(r=(t=t.replace(o[1],o[1]+"0"))+i)}return[t,i,r]}},{key:"_setValueParts",value:function(t,i){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],a=F(this._normalizeParts(t,i),3),r=a[0],o=a[1],s=a[2],l=F(e._checkIfInRangeWithOverrideOption(s,this.settings),2),u=l[0],c=l[1];if(u&&c){var h=e._truncateDecimalPlaces(s,this.settings,n,this.settings.decimalPlacesRawValue).replace(this.settings.decimalCharacter,".");if(""===h||h===this.settings.negativeSignCharacter){var m;switch(this.settings.emptyInputBehavior){case e.options.emptyInputBehavior.focus:case e.options.emptyInputBehavior.press:case e.options.emptyInputBehavior.always:m="";break;case e.options.emptyInputBehavior.min:m=this.settings.minimumValue;break;case e.options.emptyInputBehavior.max:m=this.settings.maximumValue;break;case e.options.emptyInputBehavior.zero:m="0";break;case e.options.emptyInputBehavior.null:m=null;break;default:m=this.settings.emptyInputBehavior}this._setRawValue(m)}else this._setRawValue(this._trimLeadingAndTrailingZeros(h));var g=e._truncateDecimalPlaces(s,this.settings,n,this.settings.decimalPlacesShownOnFocus),d=r.length;return d>g.length&&(d=g.length),1===d&&"0"===r&&this.settings.leadingZero===e.options.leadingZero.deny&&(d=""===o||"0"===r&&""!==o?1:0),this._setElementValue(g,!1),this._setCaretPosition(d),!0}return this._triggerRangeEvents(u,c),!1}},{key:"_getSignPosition",value:function(){var t;if(this.settings.currencySymbol){var i=this.settings.currencySymbol.length,n=h.getElementValue(this.domElement);if(this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.prefix)t=this.settings.negativeSignCharacter&&n&&n.charAt(0)===this.settings.negativeSignCharacter?[1,i+1]:[0,i];else{var a=n.length;t=[a-i,a]}}else t=[1e3,-1];return t}},{key:"_expandSelectionOnSign",value:function(){var e=F(this._getSignPosition(),2),t=e[0],i=e[1],n=this.selection;n.start<i&&n.end>t&&((n.start<t||n.end>i)&&h.getElementValue(this.domElement).substring(Math.max(n.start,t),Math.min(n.end,i)).match(/^\s*$/)?n.start<t?this._setSelection(n.start,t):this._setSelection(i,n.end):this._setSelection(Math.min(n.start,t),Math.max(n.end,i)))}},{key:"_checkPaste",value:function(){if(!this.formatted&&!h.isUndefined(this.valuePartsBeforePaste)){var t=this.valuePartsBeforePaste,i=F(this._getLeftAndRightPartAroundTheSelection(),2),n=i[0],a=i[1];delete this.valuePartsBeforePaste;var r=n.substr(0,t[0].length)+e._stripAllNonNumberCharactersExceptCustomDecimalChar(n.substr(t[0].length),this.settings,!0,this.isFocused);this._setValueParts(r,a,!0)||(this._setElementValue(t.join(""),!1),this._setCaretPosition(t[0].length))}}},{key:"_processNonPrintableKeysAndShortcuts",value:function(e){if((e.ctrlKey||e.metaKey)&&"keyup"===e.type&&!h.isUndefined(this.valuePartsBeforePaste)||e.shiftKey&&this.eventKey===n.keyName.Insert)return this._checkPaste(),!1;if(this.constructor._shouldSkipEventKey(this.eventKey))return!0;if((e.ctrlKey||e.metaKey)&&this.eventKey===n.keyName.a)return this.settings.selectNumberOnly&&(e.preventDefault(),this.selectNumber()),!0;if((e.ctrlKey||e.metaKey)&&(this.eventKey===n.keyName.c||this.eventKey===n.keyName.v||this.eventKey===n.keyName.x))return"keydown"===e.type&&this._expandSelectionOnSign(),this.eventKey!==n.keyName.v&&this.eventKey!==n.keyName.Insert||("keydown"===e.type||"keypress"===e.type?h.isUndefined(this.valuePartsBeforePaste)&&(this.valuePartsBeforePaste=this._getLeftAndRightPartAroundTheSelection()):this._checkPaste()),"keydown"===e.type||"keypress"===e.type||this.eventKey===n.keyName.c;if(e.ctrlKey||e.metaKey)return!(this.eventKey===n.keyName.Z||this.eventKey===n.keyName.z);if(this.eventKey===n.keyName.LeftArrow||this.eventKey===n.keyName.RightArrow){if("keydown"===e.type&&!e.shiftKey){var t=h.getElementValue(this.domElement);this.eventKey!==n.keyName.LeftArrow||t.charAt(this.selection.start-2)!==this.settings.digitGroupSeparator&&t.charAt(this.selection.start-2)!==this.settings.decimalCharacter?this.eventKey!==n.keyName.RightArrow||t.charAt(this.selection.start+1)!==this.settings.digitGroupSeparator&&t.charAt(this.selection.start+1)!==this.settings.decimalCharacter||this._setCaretPosition(this.selection.start+1):this._setCaretPosition(this.selection.start-1)}return!0}return h.isInArray(this.eventKey,n.keyName._directionKeys)}},{key:"_processCharacterDeletionIfTrailingNegativeSign",value:function(t){var i=F(t,2),a=i[0],r=i[1],o=h.getElementValue(this.domElement),s=h.isNegative(o,this.settings.negativeSignCharacter);if(this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.prefix&&this.settings.negativePositiveSignPlacement===e.options.negativePositiveSignPlacement.suffix&&(this.eventKey===n.keyName.Backspace?(this.caretFix=this.selection.start>=o.indexOf(this.settings.suffixText)&&""!==this.settings.suffixText,"-"===o.charAt(this.selection.start-1)?a=a.substring(1):this.selection.start<=o.length-this.settings.suffixText.length&&(a=a.substring(0,a.length-1))):(this.caretFix=this.selection.start>=o.indexOf(this.settings.suffixText)&&""!==this.settings.suffixText,this.selection.start>=o.indexOf(this.settings.currencySymbol)+this.settings.currencySymbol.length&&(r=r.substring(1,r.length)),h.isNegative(a,this.settings.negativeSignCharacter)&&"-"===o.charAt(this.selection.start)&&(a=a.substring(1)))),this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.suffix)switch(this.settings.negativePositiveSignPlacement){case e.options.negativePositiveSignPlacement.left:this.caretFix=this.selection.start>=o.indexOf(this.settings.negativeSignCharacter)+this.settings.negativeSignCharacter.length,this.eventKey===n.keyName.Backspace?this.selection.start===o.indexOf(this.settings.negativeSignCharacter)+this.settings.negativeSignCharacter.length&&s?a=a.substring(1):"-"!==a&&(this.selection.start<=o.indexOf(this.settings.negativeSignCharacter)||!s)&&(a=a.substring(0,a.length-1)):("-"===a[0]&&(r=r.substring(1)),this.selection.start===o.indexOf(this.settings.negativeSignCharacter)&&s&&(a=a.substring(1)));break;case e.options.negativePositiveSignPlacement.right:this.caretFix=this.selection.start>=o.indexOf(this.settings.negativeSignCharacter)+this.settings.negativeSignCharacter.length,this.eventKey===n.keyName.Backspace?this.selection.start===o.indexOf(this.settings.negativeSignCharacter)+this.settings.negativeSignCharacter.length?a=a.substring(1):"-"!==a&&this.selection.start<=o.indexOf(this.settings.negativeSignCharacter)-this.settings.currencySymbol.length?a=a.substring(0,a.length-1):""===a||s||(a=a.substring(0,a.length-1)):(this.caretFix=this.selection.start>=o.indexOf(this.settings.currencySymbol)&&""!==this.settings.currencySymbol,this.selection.start===o.indexOf(this.settings.negativeSignCharacter)&&(a=a.substring(1)),r=r.substring(1))}return[a,r]}},{key:"_processCharacterDeletion",value:function(e){var t,i;if(this.selection.length){this._expandSelectionOnSign();var a=F(this._getUnformattedLeftAndRightPartAroundTheSelection(),2);t=a[0],i=a[1]}else{var r=F(this._getUnformattedLeftAndRightPartAroundTheSelection(),2);if(t=r[0],i=r[1],""===t&&""===i&&(this.throwInput=!1),this.isTrailingNegative&&h.isNegative(h.getElementValue(this.domElement),this.settings.negativeSignCharacter)){var o=F(this._processCharacterDeletionIfTrailingNegativeSign([t,i]),2);t=o[0],i=o[1]}else this.eventKey===n.keyName.Backspace?t=t.substring(0,t.length-1):i=i.substring(1,i.length)}return!!this.constructor._isWithinRangeWithOverrideOption("".concat(t).concat(i),this.settings)&&h.getElementValue(e.target)!==this.settings.currencySymbol&&(this._setValueParts(t,i),!0)}},{key:"_isDecimalCharacterInsertionAllowed",value:function(){return String(this.settings.decimalPlacesShownOnFocus)!==String(e.options.decimalPlacesShownOnFocus.none)&&String(this.settings.decimalPlaces)!==String(e.options.decimalPlaces.none)}},{key:"_processCharacterInsertion",value:function(){var e=F(this._getUnformattedLeftAndRightPartAroundTheSelection(),2),t=e[0],i=e[1];if(this.eventKey!==n.keyName.AndroidDefault&&(this.throwInput=!0),this.eventKey===this.settings.decimalCharacter||this.settings.decimalCharacterAlternative&&this.eventKey===this.settings.decimalCharacterAlternative){if(!this._isDecimalCharacterInsertionAllowed()||!this.settings.decimalCharacter)return!1;if(this.settings.alwaysAllowDecimalCharacter)t=t.replace(this.settings.decimalCharacter,""),i=i.replace(this.settings.decimalCharacter,"");else{if(h.contains(t,this.settings.decimalCharacter))return!0;if(i.indexOf(this.settings.decimalCharacter)>0)return!0;0===i.indexOf(this.settings.decimalCharacter)&&(i=i.substr(1))}return this.settings.negativeSignCharacter&&h.contains(i,this.settings.negativeSignCharacter)&&(t="".concat(this.settings.negativeSignCharacter).concat(t),i=i.replace(this.settings.negativeSignCharacter,"")),this._setValueParts(t+this.settings.decimalCharacter,i),!0}if(("-"===this.eventKey||"+"===this.eventKey)&&this.settings.isNegativeSignAllowed)return""===t&&h.contains(i,"-")?(this.settings.negativePositiveSignBehavior||!this.settings.negativePositiveSignBehavior&&"+"===this.eventKey)&&(i=i.replace("-","")):h.isNegativeStrict(t,"-")?(this.settings.negativePositiveSignBehavior||!this.settings.negativePositiveSignBehavior&&"+"===this.eventKey)&&(t=t.replace("-","")):(this.settings.negativePositiveSignBehavior||!this.settings.negativePositiveSignBehavior&&"-"===this.eventKey)&&(t="".concat(this.settings.negativeSignCharacter).concat(t)),this._setValueParts(t,i),!0;var a=Number(this.eventKey);return a>=0&&a<=9?(this.settings.isNegativeSignAllowed&&""===t&&h.contains(i,"-")&&(t="-",i=i.substring(1,i.length)),this.settings.maximumValue<=0&&this.settings.minimumValue<this.settings.maximumValue&&!h.contains(h.getElementValue(this.domElement),this.settings.negativeSignCharacter)&&"0"!==this.eventKey&&(t="-".concat(t)),this._setValueParts("".concat(t).concat(this.eventKey),i),!0):(this.throwInput=!1,!1)}},{key:"_formatValue",value:function(t){var i=h.getElementValue(this.domElement),a=F(this._getUnformattedLeftAndRightPartAroundTheSelection(),1)[0];if((""===this.settings.digitGroupSeparator||""!==this.settings.digitGroupSeparator&&!h.contains(i,this.settings.digitGroupSeparator))&&(""===this.settings.currencySymbol||""!==this.settings.currencySymbol&&!h.contains(i,this.settings.currencySymbol))){var r=F(i.split(this.settings.decimalCharacter),1)[0],o="";h.isNegative(r,this.settings.negativeSignCharacter)&&(o=this.settings.negativeSignCharacter,r=r.replace(this.settings.negativeSignCharacter,""),a=a.replace("-","")),""===o&&r.length>this.settings.mIntPos&&"0"===a.charAt(0)&&(a=a.slice(1)),o===this.settings.negativeSignCharacter&&r.length>this.settings.mIntNeg&&"0"===a.charAt(0)&&(a=a.slice(1)),this.isTrailingNegative||(a="".concat(o).concat(a))}var s=this.constructor._addGroupSeparators(i,this.settings,this.isFocused,this.rawValue),l=s.length;if(s){var u,c=a.split("");if((this.settings.negativePositiveSignPlacement===e.options.negativePositiveSignPlacement.suffix||this.settings.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.prefix&&this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.suffix)&&c[0]===this.settings.negativeSignCharacter&&!this.settings.isNegativeSignAllowed&&(c.shift(),(this.eventKey===n.keyName.Backspace||this.eventKey===n.keyName.Delete)&&this.caretFix&&((this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.suffix&&this.settings.negativePositiveSignPlacement===e.options.negativePositiveSignPlacement.left||this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.prefix&&this.settings.negativePositiveSignPlacement===e.options.negativePositiveSignPlacement.suffix)&&(c.push(this.settings.negativeSignCharacter),this.caretFix="keydown"===t.type),this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.suffix&&this.settings.negativePositiveSignPlacement===e.options.negativePositiveSignPlacement.right))){var m=this.settings.currencySymbol.split(""),g=["\\","^","$",".","|","?","*","+","(",")","["],d=[];m.forEach((function(e,t){t=m[e],h.isInArray(t,g)?d.push("\\"+t):d.push(t)})),this.eventKey===n.keyName.Backspace&&"-"===this.settings.negativeSignCharacter&&d.push("-"),c.push(d.join("")),this.caretFix="keydown"===t.type}for(var v=0;v<c.length;v++)c[v].match("\\d")||(c[v]="\\"+c[v]);u=this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.suffix?new RegExp("^.*?".concat(c.join(".*?"))):new RegExp("^.*?[".concat(this.settings.currencySymbol,"]*").concat(c.join(".*?")));var p=s.match(u);p?(l=p[0].length,this.settings.showPositiveSign&&(0===l&&p.input.charAt(0)===this.settings.positiveSignCharacter&&(l=1===p.input.indexOf(this.settings.currencySymbol)?this.settings.currencySymbol.length+1:1),0===l&&p.input.charAt(this.settings.currencySymbol.length)===this.settings.positiveSignCharacter&&(l=this.settings.currencySymbol.length+1)),(0===l&&s.charAt(0)!==this.settings.negativeSignCharacter||1===l&&s.charAt(0)===this.settings.negativeSignCharacter)&&this.settings.currencySymbol&&this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.prefix&&(l=this.settings.currencySymbol.length+(h.isNegativeStrict(s,this.settings.negativeSignCharacter)?1:0))):(this.settings.currencySymbol&&this.settings.currencySymbolPlacement===e.options.currencySymbolPlacement.suffix&&(l-=this.settings.currencySymbol.length),this.settings.suffixText&&(l-=this.settings.suffixText.length))}s!==i&&(this._setElementValue(s,!1),this._setCaretPosition(l)),this.formatted=!0}}],a=[{key:"version",value:function(){return"4.10.6"}},{key:"_setArgumentsValues",value:function(e,t,i){h.isNull(e)&&h.throwError("At least one valid parameter is needed in order to initialize an AutoNumeric object");var n,a,r,o=h.isElement(e),s=h.isString(e),l=h.isObject(t),u=Array.isArray(t)&&t.length>0,c=h.isNumberOrArabic(t)||""===t,m=this._isPreDefinedOptionValid(t),g=h.isNull(t),d=h.isEmptyString(t),v=h.isObject(i),p=Array.isArray(i)&&i.length>0,f=h.isNull(i),y=this._isPreDefinedOptionValid(i);return o&&g&&f?(n=e,r=null,a=null):o&&c&&f?(n=e,r=t,a=null):o&&l&&f?(n=e,r=null,a=t):o&&m&&f?(n=e,r=null,a=this._getOptionObject(t)):o&&u&&f?(n=e,r=null,a=this.mergeOptions(t)):o&&(g||d)&&v?(n=e,r=null,a=i):o&&(g||d)&&p?(n=e,r=null,a=this.mergeOptions(i)):s&&g&&f?(n=document.querySelector(e),r=null,a=null):s&&l&&f?(n=document.querySelector(e),r=null,a=t):s&&m&&f?(n=document.querySelector(e),r=null,a=this._getOptionObject(t)):s&&u&&f?(n=document.querySelector(e),r=null,a=this.mergeOptions(t)):s&&(g||d)&&v?(n=document.querySelector(e),r=null,a=i):s&&(g||d)&&p?(n=document.querySelector(e),r=null,a=this.mergeOptions(i)):s&&c&&f?(n=document.querySelector(e),r=t,a=null):s&&c&&v?(n=document.querySelector(e),r=t,a=i):s&&c&&y?(n=document.querySelector(e),r=t,a=this._getOptionObject(i)):s&&c&&p?(n=document.querySelector(e),r=t,a=this.mergeOptions(i)):o&&c&&v?(n=e,r=t,a=i):o&&c&&y?(n=e,r=t,a=this._getOptionObject(i)):o&&c&&p?(n=e,r=t,a=this.mergeOptions(i)):h.throwError("The parameters given to the AutoNumeric object are not valid, '".concat(e,"', '").concat(t,"' and '").concat(i,"' given.")),h.isNull(n)&&h.throwError("The selector '".concat(e,"' did not select any valid DOM element. Please check on which element you called AutoNumeric.")),{domElement:n,initialValue:r,userOptions:a}}},{key:"mergeOptions",value:function(e){var t=this,i={};return e.forEach((function(e){T(i,t._getOptionObject(e))})),i}},{key:"_isPreDefinedOptionValid",value:function(t){return Object.prototype.hasOwnProperty.call(e.predefinedOptions,t)}},{key:"_getOptionObject",value:function(t){var i;return h.isString(t)?null==(i=e.getPredefinedOptions()[t])&&h.warning("The given pre-defined option [".concat(t,"] is not recognized by autoNumeric. Please check that pre-defined option name."),!0):i=t,i}},{key:"_doesFormHandlerListExists",value:function(){var e=A(window.aNFormHandlerMap);return"undefined"!==e&&"object"===e}},{key:"_createFormHandlerList",value:function(){window.aNFormHandlerMap=new Map}},{key:"_checkValuesToStringsArray",value:function(e,t){return h.isInArray(String(e),t)}},{key:"_checkValuesToStringsSettings",value:function(e,t){return this._checkValuesToStringsArray(e,Object.keys(t.valuesToStrings))}},{key:"_checkStringsToValuesSettings",value:function(e,t){return this._checkValuesToStringsArray(e,Object.values(t.valuesToStrings))}},{key:"_unformatAltHovered",value:function(e){e.hoveredWithAlt=!0,e.unformat()}},{key:"_reformatAltHovered",value:function(e){e.hoveredWithAlt=!1,e.reformat()}},{key:"_getChildANInputElement",value:function(e){var t=this,i=e.getElementsByTagName("input"),n=[];return Array.prototype.slice.call(i,0).forEach((function(e){t.test(e)&&n.push(e)})),n}},{key:"test",value:function(e){return this._isInGlobalList(h.domElement(e))}},{key:"_createWeakMap",value:function(e){window[e]=new WeakMap}},{key:"_createGlobalList",value:function(){this.autoNumericGlobalListName="autoNumericGlobalList",this._createWeakMap(this.autoNumericGlobalListName)}},{key:"_doesGlobalListExists",value:function(){var e=A(window[this.autoNumericGlobalListName]);return"undefined"!==e&&"object"===e}},{key:"_addToGlobalList",value:function(e){this._doesGlobalListExists()||this._createGlobalList();var t=e.node();if(this._isInGlobalList(t)){if(this._getFromGlobalList(t)===this)return;h.warning("A reference to the DOM element you just initialized already exists in the global AutoNumeric element list. Please make sure to not initialize the same DOM element multiple times.",e.getSettings().showWarnings)}window[this.autoNumericGlobalListName].set(t,e)}},{key:"_removeFromGlobalList",value:function(e){this._doesGlobalListExists()&&window[this.autoNumericGlobalListName].delete(e.node())}},{key:"_getFromGlobalList",value:function(e){return this._doesGlobalListExists()?window[this.autoNumericGlobalListName].get(e):null}},{key:"_isInGlobalList",value:function(e){return!!this._doesGlobalListExists()&&window[this.autoNumericGlobalListName].has(e)}},{key:"validate",value:function(t){var i=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;!h.isUndefinedOrNullOrEmpty(t)&&h.isObject(t)||h.throwError("The userOptions are invalid ; it should be a valid object, [".concat(t,"] given."));var a,r=h.isObject(n);r||h.isNull(n)||h.throwError("The 'originalOptions' parameter is invalid ; it should either be a valid option object or `null`, [".concat(t,"] given.")),h.isNull(t)||this._convertOldOptionsToNewOnes(t),a=i?T({},this.getDefaultConfig(),t):t,h.isTrueOrFalseString(a.showWarnings)||h.isBoolean(a.showWarnings)||h.throwError("The debug option 'showWarnings' is invalid ; it should be either 'true' or 'false', [".concat(a.showWarnings,"] given."));var o,s=/^[0-9]+$/,l=/[0-9]+/,u=/^-?[0-9]+(\.?[0-9]+)?$/,c=/^[0-9]+(\.?[0-9]+)?$/;h.isTrueOrFalseString(a.allowDecimalPadding)||h.isBoolean(a.allowDecimalPadding)||a.allowDecimalPadding===e.options.allowDecimalPadding.floats||h.isNumber(a.allowDecimalPadding)&&a.allowDecimalPadding>0||h.throwError("The decimal padding option 'allowDecimalPadding' is invalid ; it should either be `false`, `true`, `'floats'` or a positive integer superior to 0, [".concat(a.allowDecimalPadding,"] given.")),h.isNumber(a.allowDecimalPadding)&&a.allowDecimalPadding>a.decimalPlaces&&h.warning("Setting 'allowDecimalPadding' to a number [".concat(a.allowDecimalPadding,"] superior to the current 'decimalPlaces' settings [").concat(a.decimalPlaces,"] is useless, since the padding will not be shown."),a.showWarnings),a.allowDecimalPadding!==e.options.allowDecimalPadding.never&&"false"!==a.allowDecimalPadding||a.decimalPlaces===e.options.decimalPlaces.none&&a.decimalPlacesShownOnBlur===e.options.decimalPlacesShownOnBlur.none&&a.decimalPlacesShownOnFocus===e.options.decimalPlacesShownOnFocus.none||h.warning("Setting 'allowDecimalPadding' to [".concat(a.allowDecimalPadding,"] will override the current 'decimalPlaces*' settings [").concat(a.decimalPlaces,", ").concat(a.decimalPlacesShownOnBlur," and ").concat(a.decimalPlacesShownOnFocus,"]."),a.showWarnings),h.isTrueOrFalseString(a.alwaysAllowDecimalCharacter)||h.isBoolean(a.alwaysAllowDecimalCharacter)||h.throwError("The option 'alwaysAllowDecimalCharacter' is invalid ; it should either be `true` or `false`, [".concat(a.alwaysAllowDecimalCharacter,"] given.")),h.isNull(a.caretPositionOnFocus)||h.isInArray(a.caretPositionOnFocus,[e.options.caretPositionOnFocus.start,e.options.caretPositionOnFocus.end,e.options.caretPositionOnFocus.decimalLeft,e.options.caretPositionOnFocus.decimalRight])||h.throwError("The display on empty string option 'caretPositionOnFocus' is invalid ; it should either be `null`, 'focus', 'press', 'always' or 'zero', [".concat(a.caretPositionOnFocus,"] given.")),o=r?n:this._correctCaretPositionOnFocusAndSelectOnFocusOptions(t),h.isNull(o)||o.caretPositionOnFocus===e.options.caretPositionOnFocus.doNoForceCaretPosition||o.selectOnFocus!==e.options.selectOnFocus.select||h.warning("The 'selectOnFocus' option is set to 'select', which is in conflict with the 'caretPositionOnFocus' which is set to '".concat(o.caretPositionOnFocus,"'. As a result, if this has been called when instantiating an AutoNumeric object, the 'selectOnFocus' option is forced to 'doNotSelect'."),a.showWarnings),h.isInArray(a.digitGroupSeparator,[e.options.digitGroupSeparator.comma,e.options.digitGroupSeparator.dot,e.options.digitGroupSeparator.normalSpace,e.options.digitGroupSeparator.thinSpace,e.options.digitGroupSeparator.narrowNoBreakSpace,e.options.digitGroupSeparator.noBreakSpace,e.options.digitGroupSeparator.noSeparator,e.options.digitGroupSeparator.apostrophe,e.options.digitGroupSeparator.arabicThousandsSeparator,e.options.digitGroupSeparator.dotAbove,e.options.digitGroupSeparator.privateUseTwo])||h.throwError("The thousand separator character option 'digitGroupSeparator' is invalid ; it should be ',', '.', '٬', '˙', \"'\", '', ' ', ' ', ' ', ' ' or empty (''), [".concat(a.digitGroupSeparator,"] given.")),h.isTrueOrFalseString(a.showOnlyNumbersOnFocus)||h.isBoolean(a.showOnlyNumbersOnFocus)||h.throwError("The 'showOnlyNumbersOnFocus' option is invalid ; it should be either 'true' or 'false', [".concat(a.showOnlyNumbersOnFocus,"] given.")),h.isInArray(a.digitalGroupSpacing,[e.options.digitalGroupSpacing.two,e.options.digitalGroupSpacing.twoThree,e.options.digitalGroupSpacing.twoScaled,e.options.digitalGroupSpacing.three,e.options.digitalGroupSpacing.four])||a.digitalGroupSpacing>=2&&a.digitalGroupSpacing<=4||h.throwError("The grouping separator option for thousands 'digitalGroupSpacing' is invalid ; it should be '2', '2t', '2s', '3', or '4', [".concat(a.digitalGroupSpacing,"] given.")),h.isInArray(a.decimalCharacter,[e.options.decimalCharacter.comma,e.options.decimalCharacter.dot,e.options.decimalCharacter.middleDot,e.options.decimalCharacter.arabicDecimalSeparator,e.options.decimalCharacter.decimalSeparatorKeySymbol])||h.throwError("The decimal separator character option 'decimalCharacter' is invalid ; it should be '.', ',', '·', '⎖' or '٫', [".concat(a.decimalCharacter,"] given.")),a.decimalCharacter===a.digitGroupSeparator&&h.throwError("autoNumeric will not function properly when the decimal character 'decimalCharacter' [".concat(a.decimalCharacter,"] and the thousand separator 'digitGroupSeparator' [").concat(a.digitGroupSeparator,"] are the same character.")),h.isNull(a.decimalCharacterAlternative)||h.isString(a.decimalCharacterAlternative)||h.throwError("The alternate decimal separator character option 'decimalCharacterAlternative' is invalid ; it should be a string, [".concat(a.decimalCharacterAlternative,"] given.")),""===a.currencySymbol||h.isString(a.currencySymbol)||h.throwError("The currency symbol option 'currencySymbol' is invalid ; it should be a string, [".concat(a.currencySymbol,"] given.")),h.isInArray(a.currencySymbolPlacement,[e.options.currencySymbolPlacement.prefix,e.options.currencySymbolPlacement.suffix])||h.throwError("The placement of the currency sign option 'currencySymbolPlacement' is invalid ; it should either be 'p' (prefix) or 's' (suffix), [".concat(a.currencySymbolPlacement,"] given.")),h.isInArray(a.negativePositiveSignPlacement,[e.options.negativePositiveSignPlacement.prefix,e.options.negativePositiveSignPlacement.suffix,e.options.negativePositiveSignPlacement.left,e.options.negativePositiveSignPlacement.right,e.options.negativePositiveSignPlacement.none])||h.throwError("The placement of the negative sign option 'negativePositiveSignPlacement' is invalid ; it should either be 'p' (prefix), 's' (suffix), 'l' (left), 'r' (right) or 'null', [".concat(a.negativePositiveSignPlacement,"] given.")),h.isTrueOrFalseString(a.showPositiveSign)||h.isBoolean(a.showPositiveSign)||h.throwError("The show positive sign option 'showPositiveSign' is invalid ; it should be either 'true' or 'false', [".concat(a.showPositiveSign,"] given.")),(!h.isString(a.suffixText)||""!==a.suffixText&&(h.isNegative(a.suffixText,a.negativeSignCharacter)||l.test(a.suffixText)))&&h.throwError("The additional suffix option 'suffixText' is invalid ; it should not contains the negative sign '".concat(a.negativeSignCharacter,"' nor any numerical characters, [").concat(a.suffixText,"] given.")),(!h.isString(a.negativeSignCharacter)||1!==a.negativeSignCharacter.length||h.isUndefinedOrNullOrEmpty(a.negativeSignCharacter)||l.test(a.negativeSignCharacter))&&h.throwError("The negative sign character option 'negativeSignCharacter' is invalid ; it should be a single character, and cannot be any numerical characters, [".concat(a.negativeSignCharacter,"] given.")),(!h.isString(a.positiveSignCharacter)||1!==a.positiveSignCharacter.length||h.isUndefinedOrNullOrEmpty(a.positiveSignCharacter)||l.test(a.positiveSignCharacter))&&h.throwError("The positive sign character option 'positiveSignCharacter' is invalid ; it should be a single character, and cannot be any numerical characters, [".concat(a.positiveSignCharacter,"] given.\nIf you want to show the positive sign character, you need to set the `showPositiveSign` option to `true`.")),a.negativeSignCharacter===a.positiveSignCharacter&&h.throwError("The positive 'positiveSignCharacter' and negative 'negativeSignCharacter' sign characters cannot be identical ; [".concat(a.negativeSignCharacter,"] given.")),h.isTrueOrFalseString(a.negativePositiveSignBehavior)||h.isBoolean(a.negativePositiveSignBehavior)||h.throwError("The option 'negativePositiveSignBehavior' is invalid ; it should be either 'true' or 'false', [".concat(a.negativePositiveSignBehavior,"] given."));var m=F(h.isNull(a.negativeBracketsTypeOnBlur)?["",""]:a.negativeBracketsTypeOnBlur.split(","),2),g=m[0],d=m[1];(h.contains(a.digitGroupSeparator,a.negativeSignCharacter)||h.contains(a.decimalCharacter,a.negativeSignCharacter)||h.contains(a.decimalCharacterAlternative,a.negativeSignCharacter)||h.contains(g,a.negativeSignCharacter)||h.contains(d,a.negativeSignCharacter)||h.contains(a.suffixText,a.negativeSignCharacter))&&h.throwError("The negative sign character option 'negativeSignCharacter' is invalid ; it should not be equal or a part of the digit separator, the decimal character, the decimal character alternative, the negative brackets or the suffix text, [".concat(a.negativeSignCharacter,"] given.")),(h.contains(a.digitGroupSeparator,a.positiveSignCharacter)||h.contains(a.decimalCharacter,a.positiveSignCharacter)||h.contains(a.decimalCharacterAlternative,a.positiveSignCharacter)||h.contains(g,a.positiveSignCharacter)||h.contains(d,a.positiveSignCharacter)||h.contains(a.suffixText,a.positiveSignCharacter))&&h.throwError("The positive sign character option 'positiveSignCharacter' is invalid ; it should not be equal or a part of the digit separator, the decimal character, the decimal character alternative, the negative brackets or the suffix text, [".concat(a.positiveSignCharacter,"] given.")),h.isNull(a.overrideMinMaxLimits)||h.isInArray(a.overrideMinMaxLimits,[e.options.overrideMinMaxLimits.ceiling,e.options.overrideMinMaxLimits.floor,e.options.overrideMinMaxLimits.ignore,e.options.overrideMinMaxLimits.invalid])||h.throwError("The override min & max limits option 'overrideMinMaxLimits' is invalid ; it should either be 'ceiling', 'floor', 'ignore' or 'invalid', [".concat(a.overrideMinMaxLimits,"] given.")),a.overrideMinMaxLimits!==e.options.overrideMinMaxLimits.invalid&&a.overrideMinMaxLimits!==e.options.overrideMinMaxLimits.ignore&&(a.minimumValue>0||a.maximumValue<0)&&h.warning("You've set a `minimumValue` or a `maximumValue` excluding the value `0`. AutoNumeric will force the users to always have a valid value in the input, hence preventing them to clear the field. If you want to allow for temporary invalid values (i.e. out-of-range), you should use the 'invalid' option for the 'overrideMinMaxLimits' setting."),h.isString(a.maximumValue)&&u.test(a.maximumValue)||h.throwError("The maximum possible value option 'maximumValue' is invalid ; it should be a string that represents a positive or negative number, [".concat(a.maximumValue,"] given.")),h.isString(a.minimumValue)&&u.test(a.minimumValue)||h.throwError("The minimum possible value option 'minimumValue' is invalid ; it should be a string that represents a positive or negative number, [".concat(a.minimumValue,"] given.")),parseFloat(a.minimumValue)>parseFloat(a.maximumValue)&&h.throwError("The minimum possible value option is greater than the maximum possible value option ; 'minimumValue' [".concat(a.minimumValue,"] should be smaller than 'maximumValue' [").concat(a.maximumValue,"].")),h.isInt(a.decimalPlaces)&&a.decimalPlaces>=0||h.isString(a.decimalPlaces)&&s.test(a.decimalPlaces)||h.throwError("The number of decimal places option 'decimalPlaces' is invalid ; it should be a positive integer, [".concat(a.decimalPlaces,"] given.")),h.isNull(a.decimalPlacesRawValue)||h.isInt(a.decimalPlacesRawValue)&&a.decimalPlacesRawValue>=0||h.isString(a.decimalPlacesRawValue)&&s.test(a.decimalPlacesRawValue)||h.throwError("The number of decimal places for the raw value option 'decimalPlacesRawValue' is invalid ; it should be a positive integer or `null`, [".concat(a.decimalPlacesRawValue,"] given.")),this._validateDecimalPlacesRawValue(a),h.isNull(a.decimalPlacesShownOnFocus)||s.test(String(a.decimalPlacesShownOnFocus))||h.throwError("The number of expanded decimal places option 'decimalPlacesShownOnFocus' is invalid ; it should be a positive integer or `null`, [".concat(a.decimalPlacesShownOnFocus,"] given.")),!h.isNull(a.decimalPlacesShownOnFocus)&&Number(a.decimalPlaces)>Number(a.decimalPlacesShownOnFocus)&&h.warning("The extended decimal places 'decimalPlacesShownOnFocus' [".concat(a.decimalPlacesShownOnFocus,"] should be greater than the 'decimalPlaces' [").concat(a.decimalPlaces,"] value. Currently, this will limit the ability of your user to manually change some of the decimal places. Do you really want to do that?"),a.showWarnings),(h.isNull(a.divisorWhenUnfocused)||c.test(a.divisorWhenUnfocused))&&0!==a.divisorWhenUnfocused&&"0"!==a.divisorWhenUnfocused&&1!==a.divisorWhenUnfocused&&"1"!==a.divisorWhenUnfocused||h.throwError("The divisor option 'divisorWhenUnfocused' is invalid ; it should be a positive number higher than one, preferably an integer, [".concat(a.divisorWhenUnfocused,"] given.")),h.isNull(a.decimalPlacesShownOnBlur)||s.test(a.decimalPlacesShownOnBlur)||h.throwError("The number of decimals shown when unfocused option 'decimalPlacesShownOnBlur' is invalid ; it should be a positive integer or `null`, [".concat(a.decimalPlacesShownOnBlur,"] given.")),h.isNull(a.symbolWhenUnfocused)||h.isString(a.symbolWhenUnfocused)||h.throwError("The symbol to show when unfocused option 'symbolWhenUnfocused' is invalid ; it should be a string, [".concat(a.symbolWhenUnfocused,"] given.")),h.isTrueOrFalseString(a.saveValueToSessionStorage)||h.isBoolean(a.saveValueToSessionStorage)||h.throwError("The save to session storage option 'saveValueToSessionStorage' is invalid ; it should be either 'true' or 'false', [".concat(a.saveValueToSessionStorage,"] given.")),h.isInArray(a.onInvalidPaste,[e.options.onInvalidPaste.error,e.options.onInvalidPaste.ignore,e.options.onInvalidPaste.clamp,e.options.onInvalidPaste.truncate,e.options.onInvalidPaste.replace])||h.throwError("The paste behavior option 'onInvalidPaste' is invalid ; it should either be 'error', 'ignore', 'clamp', 'truncate' or 'replace' (cf. documentation), [".concat(a.onInvalidPaste,"] given.")),h.isInArray(a.roundingMethod,[e.options.roundingMethod.halfUpSymmetric,e.options.roundingMethod.halfUpAsymmetric,e.options.roundingMethod.halfDownSymmetric,e.options.roundingMethod.halfDownAsymmetric,e.options.roundingMethod.halfEvenBankersRounding,e.options.roundingMethod.upRoundAwayFromZero,e.options.roundingMethod.downRoundTowardZero,e.options.roundingMethod.toCeilingTowardPositiveInfinity,e.options.roundingMethod.toFloorTowardNegativeInfinity,e.options.roundingMethod.toNearest05,e.options.roundingMethod.toNearest05Alt,e.options.roundingMethod.upToNext05,e.options.roundingMethod.downToNext05])||h.throwError("The rounding method option 'roundingMethod' is invalid ; it should either be 'S', 'A', 's', 'a', 'B', 'U', 'D', 'C', 'F', 'N05', 'CHF', 'U05' or 'D05' (cf. documentation), [".concat(a.roundingMethod,"] given.")),h.isNull(a.negativeBracketsTypeOnBlur)||h.isInArray(a.negativeBracketsTypeOnBlur,[e.options.negativeBracketsTypeOnBlur.parentheses,e.options.negativeBracketsTypeOnBlur.brackets,e.options.negativeBracketsTypeOnBlur.chevrons,e.options.negativeBracketsTypeOnBlur.curlyBraces,e.options.negativeBracketsTypeOnBlur.angleBrackets,e.options.negativeBracketsTypeOnBlur.japaneseQuotationMarks,e.options.negativeBracketsTypeOnBlur.halfBrackets,e.options.negativeBracketsTypeOnBlur.whiteSquareBrackets,e.options.negativeBracketsTypeOnBlur.quotationMarks,e.options.negativeBracketsTypeOnBlur.guillemets])||h.throwError("The brackets for negative values option 'negativeBracketsTypeOnBlur' is invalid ; it should either be '(,)', '[,]', '<,>', '{,}', '〈,〉', '｢,｣', '⸤,⸥', '⟦,⟧', '‹,›' or '«,»', [".concat(a.negativeBracketsTypeOnBlur,"] given.")),(h.isString(a.emptyInputBehavior)||h.isNumber(a.emptyInputBehavior))&&(h.isInArray(a.emptyInputBehavior,[e.options.emptyInputBehavior.focus,e.options.emptyInputBehavior.press,e.options.emptyInputBehavior.always,e.options.emptyInputBehavior.min,e.options.emptyInputBehavior.max,e.options.emptyInputBehavior.zero,e.options.emptyInputBehavior.null])||u.test(a.emptyInputBehavior))||h.throwError("The display on empty string option 'emptyInputBehavior' is invalid ; it should either be 'focus', 'press', 'always', 'min', 'max', 'zero', 'null', a number, or a string that represents a number, [".concat(a.emptyInputBehavior,"] given.")),a.emptyInputBehavior===e.options.emptyInputBehavior.zero&&(a.minimumValue>0||a.maximumValue<0)&&h.throwError("The 'emptyInputBehavior' option is set to 'zero', but this value is outside of the range defined by 'minimumValue' and 'maximumValue' [".concat(a.minimumValue,", ").concat(a.maximumValue,"].")),u.test(String(a.emptyInputBehavior))&&(this._isWithinRangeWithOverrideOption(a.emptyInputBehavior,a)||h.throwError("The 'emptyInputBehavior' option is set to a number or a string that represents a number, but its value [".concat(a.emptyInputBehavior,"] is outside of the range defined by the 'minimumValue' and 'maximumValue' options [").concat(a.minimumValue,", ").concat(a.maximumValue,"]."))),h.isTrueOrFalseString(a.eventBubbles)||h.isBoolean(a.eventBubbles)||h.throwError("The event bubbles option 'eventBubbles' is invalid ; it should be either 'true' or 'false', [".concat(a.eventBubbles,"] given.")),h.isTrueOrFalseString(a.eventIsCancelable)||h.isBoolean(a.eventIsCancelable)||h.throwError("The event is cancelable option 'eventIsCancelable' is invalid ; it should be either 'true' or 'false', [".concat(a.eventIsCancelable,"] given.")),!h.isBoolean(a.invalidClass)&&/^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/.test(a.invalidClass)||h.throwError("The name of the 'invalidClass' option is not a valid CSS class name ; it should not be empty, and should follow the '^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$' regex, [".concat(a.invalidClass,"] given.")),h.isInArray(a.leadingZero,[e.options.leadingZero.allow,e.options.leadingZero.deny,e.options.leadingZero.keep])||h.throwError("The leading zero behavior option 'leadingZero' is invalid ; it should either be 'allow', 'deny' or 'keep', [".concat(a.leadingZero,"] given.")),h.isTrueOrFalseString(a.formatOnPageLoad)||h.isBoolean(a.formatOnPageLoad)||h.throwError("The format on initialization option 'formatOnPageLoad' is invalid ; it should be either 'true' or 'false', [".concat(a.formatOnPageLoad,"] given.")),h.isTrueOrFalseString(a.formulaMode)||h.isBoolean(a.formulaMode)||h.throwError("The formula mode option 'formulaMode' is invalid ; it should be either 'true' or 'false', [".concat(a.formulaMode,"] given.")),s.test(a.historySize)&&0!==a.historySize||h.throwError("The history size option 'historySize' is invalid ; it should be a positive integer, [".concat(a.historySize,"] given.")),h.isTrueOrFalseString(a.selectNumberOnly)||h.isBoolean(a.selectNumberOnly)||h.throwError("The select number only option 'selectNumberOnly' is invalid ; it should be either 'true' or 'false', [".concat(a.selectNumberOnly,"] given.")),h.isTrueOrFalseString(a.selectOnFocus)||h.isBoolean(a.selectOnFocus)||h.throwError("The select on focus option 'selectOnFocus' is invalid ; it should be either 'true' or 'false', [".concat(a.selectOnFocus,"] given.")),h.isNull(a.defaultValueOverride)||""===a.defaultValueOverride||u.test(a.defaultValueOverride)||h.throwError("The unformatted default value option 'defaultValueOverride' is invalid ; it should be a string that represents a positive or negative number, [".concat(a.defaultValueOverride,"] given.")),h.isTrueOrFalseString(a.unformatOnSubmit)||h.isBoolean(a.unformatOnSubmit)||h.throwError("The remove formatting on submit option 'unformatOnSubmit' is invalid ; it should be either 'true' or 'false', [".concat(a.unformatOnSubmit,"] given.")),h.isNull(a.valuesToStrings)||h.isObject(a.valuesToStrings)||h.throwError("The option 'valuesToStrings' is invalid ; it should be an object, ideally with 'key -> value' entries, [".concat(a.valuesToStrings,"] given.")),h.isNull(a.outputFormat)||h.isInArray(a.outputFormat,[e.options.outputFormat.string,e.options.outputFormat.number,e.options.outputFormat.dot,e.options.outputFormat.negativeDot,e.options.outputFormat.comma,e.options.outputFormat.negativeComma,e.options.outputFormat.dotNegative,e.options.outputFormat.commaNegative])||h.throwError("The custom locale format option 'outputFormat' is invalid ; it should either be null, 'string', 'number', '.', '-.', ',', '-,', '.-' or ',-', [".concat(a.outputFormat,"] given.")),h.isTrueOrFalseString(a.isCancellable)||h.isBoolean(a.isCancellable)||h.throwError("The cancellable behavior option 'isCancellable' is invalid ; it should be either 'true' or 'false', [".concat(a.isCancellable,"] given.")),h.isTrueOrFalseString(a.modifyValueOnUpDownArrow)||h.isBoolean(a.modifyValueOnUpDownArrow)||h.throwError("The increment/decrement on up and down arrow keys 'modifyValueOnUpDownArrow' is invalid ; it should be either 'true' or 'false', [".concat(a.modifyValueOnUpDownArrow,"] given.")),h.isTrueOrFalseString(a.modifyValueOnWheel)||h.isBoolean(a.modifyValueOnWheel)||h.throwError("The increment/decrement on mouse wheel option 'modifyValueOnWheel' is invalid ; it should be either 'true' or 'false', [".concat(a.modifyValueOnWheel,"] given.")),h.isTrueOrFalseString(a.watchExternalChanges)||h.isBoolean(a.watchExternalChanges)||h.throwError("The option 'watchExternalChanges' is invalid ; it should be either 'true' or 'false', [".concat(a.watchExternalChanges,"] given.")),h.isInArray(a.wheelOn,[e.options.wheelOn.focus,e.options.wheelOn.hover])||h.throwError("The wheel behavior option 'wheelOn' is invalid ; it should either be 'focus' or 'hover', [".concat(a.wheelOn,"] given.")),(!h.isString(a.upDownStep)&&!h.isNumber(a.upDownStep)||"progressive"!==a.upDownStep&&!c.test(a.upDownStep)||0===Number(a.upDownStep))&&h.throwError("The up/down arrow step value option 'upDownStep' is invalid ; it should either be the string 'progressive', or a number or a string that represents a positive number (excluding zero), [".concat(a.upDownStep,"] given.")),(!h.isString(a.wheelStep)&&!h.isNumber(a.wheelStep)||"progressive"!==a.wheelStep&&!c.test(a.wheelStep)||0===Number(a.wheelStep))&&h.throwError("The wheel step value option 'wheelStep' is invalid ; it should either be the string 'progressive', or a number or a string that represents a positive number (excluding zero), [".concat(a.wheelStep,"] given.")),h.isInArray(a.serializeSpaces,[e.options.serializeSpaces.plus,e.options.serializeSpaces.percent])||h.throwError("The space replacement character option 'serializeSpaces' is invalid ; it should either be '+' or '%20', [".concat(a.serializeSpaces,"] given.")),h.isTrueOrFalseString(a.noEventListeners)||h.isBoolean(a.noEventListeners)||h.throwError("The option 'noEventListeners' that prevent the creation of event listeners is invalid ; it should be either 'true' or 'false', [".concat(a.noEventListeners,"] given.")),h.isNull(a.styleRules)||h.isObject(a.styleRules)&&(Object.prototype.hasOwnProperty.call(a.styleRules,"positive")||Object.prototype.hasOwnProperty.call(a.styleRules,"negative")||Object.prototype.hasOwnProperty.call(a.styleRules,"ranges")||Object.prototype.hasOwnProperty.call(a.styleRules,"userDefined"))||h.throwError("The option 'styleRules' is invalid ; it should be a correctly structured object, with one or more 'positive', 'negative', 'ranges' or 'userDefined' attributes, [".concat(a.styleRules,"] given.")),h.isNull(a.styleRules)||!Object.prototype.hasOwnProperty.call(a.styleRules,"userDefined")||h.isNull(a.styleRules.userDefined)||a.styleRules.userDefined.forEach((function(e){Object.prototype.hasOwnProperty.call(e,"callback")&&!h.isFunction(e.callback)&&h.throwError("The callback defined in the `userDefined` attribute is not a function, ".concat(A(e.callback)," given."))})),(h.isNull(a.rawValueDivisor)||c.test(a.rawValueDivisor))&&0!==a.rawValueDivisor&&"0"!==a.rawValueDivisor&&1!==a.rawValueDivisor&&"1"!==a.rawValueDivisor||h.throwError("The raw value divisor option 'rawValueDivisor' is invalid ; it should be a positive number higher than one, preferably an integer, [".concat(a.rawValueDivisor,"] given.")),h.isTrueOrFalseString(a.readOnly)||h.isBoolean(a.readOnly)||h.throwError("The option 'readOnly' is invalid ; it should be either 'true' or 'false', [".concat(a.readOnly,"] given.")),h.isTrueOrFalseString(a.unformatOnHover)||h.isBoolean(a.unformatOnHover)||h.throwError("The option 'unformatOnHover' is invalid ; it should be either 'true' or 'false', [".concat(a.unformatOnHover,"] given.")),h.isTrueOrFalseString(a.failOnUnknownOption)||h.isBoolean(a.failOnUnknownOption)||h.throwError("The debug option 'failOnUnknownOption' is invalid ; it should be either 'true' or 'false', [".concat(a.failOnUnknownOption,"] given.")),h.isTrueOrFalseString(a.createLocalList)||h.isBoolean(a.createLocalList)||h.throwError("The debug option 'createLocalList' is invalid ; it should be either 'true' or 'false', [".concat(a.createLocalList,"] given."))}},{key:"_validateDecimalPlacesRawValue",value:function(e){h.isNull(e.decimalPlacesRawValue)||(e.decimalPlacesRawValue<e.decimalPlaces&&h.warning("The number of decimal places to store in the raw value [".concat(e.decimalPlacesRawValue,"] is lower than the ones to display [").concat(e.decimalPlaces,"]. This will likely confuse your users.\nTo solve that, you'd need to either set `decimalPlacesRawValue` to `null`, or set a number of decimal places for the raw value equal of bigger than `decimalPlaces`."),e.showWarnings),e.decimalPlacesRawValue<e.decimalPlacesShownOnFocus&&h.warning("The number of decimal places to store in the raw value [".concat(e.decimalPlacesRawValue,"] is lower than the ones shown on focus [").concat(e.decimalPlacesShownOnFocus,"]. This will likely confuse your users.\nTo solve that, you'd need to either set `decimalPlacesRawValue` to `null`, or set a number of decimal places for the raw value equal of bigger than `decimalPlacesShownOnFocus`."),e.showWarnings),e.decimalPlacesRawValue<e.decimalPlacesShownOnBlur&&h.warning("The number of decimal places to store in the raw value [".concat(e.decimalPlacesRawValue,"] is lower than the ones shown when unfocused [").concat(e.decimalPlacesShownOnBlur,"]. This will likely confuse your users.\nTo solve that, you'd need to either set `decimalPlacesRawValue` to `null`, or set a number of decimal places for the raw value equal of bigger than `decimalPlacesShownOnBlur`."),e.showWarnings))}},{key:"areSettingsValid",value:function(e){var t=!0;try{this.validate(e,!0)}catch(i){t=!1}return t}},{key:"getDefaultConfig",value:function(){return e.defaultSettings}},{key:"getPredefinedOptions",value:function(){return e.predefinedOptions}},{key:"_generateOptionsObjectFromOptionsArray",value:function(e){var t,i=this;return h.isUndefinedOrNullOrEmpty(e)||0===e.length?t=null:(t={},1===e.length&&Array.isArray(e[0])?e[0].forEach((function(e){T(t,i._getOptionObject(e))})):e.length>=1&&e.forEach((function(e){T(t,i._getOptionObject(e))}))),t}},{key:"format",value:function(t){if(h.isUndefined(t)||null===t)return null;var i;i=h.isElement(t)?h.getElementValue(t):t,h.isString(i)||h.isNumber(i)||h.throwError('The value "'.concat(i,'" being "set" is not numeric and therefore cannot be used appropriately.'));for(var n=arguments.length,a=new Array(n>1?n-1:0),r=1;r<n;r++)a[r-1]=arguments[r];var o=this._generateOptionsObjectFromOptionsArray(a),s=T({},this.getDefaultConfig(),o);s.isNegativeSignAllowed=i<0,s.isPositiveSignAllowed=i>=0,this._setBrackets(s),this._cachesUsualRegularExpressions(s,{});var l=this._toNumericValue(i,s);return isNaN(Number(l))&&h.throwError("The value [".concat(l,"] that you are trying to format is not a recognized number.")),this._isWithinRangeWithOverrideOption(l,s)||(h.triggerEvent(e.events.formatted,document,{oldValue:null,newValue:null,oldRawValue:null,newRawValue:null,isPristine:null,error:"Range test failed",aNElement:null},!0,!0),h.throwError("The value [".concat(l,"] being set falls outside of the minimumValue [").concat(s.minimumValue,"] and maximumValue [").concat(s.maximumValue,"] range set for this element"))),s.valuesToStrings&&this._checkValuesToStringsSettings(i,s)?s.valuesToStrings[i]:(this._correctNegativePositiveSignPlacementOption(s),this._calculateDecimalPlacesOnInit(s),h.isUndefinedOrNullOrEmpty(s.rawValueDivisor)||0===s.rawValueDivisor||""===l||null===l||(l*=s.rawValueDivisor),l=this._roundFormattedValueShownOnFocus(l,s),l=this._modifyNegativeSignAndDecimalCharacterForFormattedValue(l,s),l=this._addGroupSeparators(l,s,!1,l))}},{key:"formatAndSet",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,i=this.format(e,t);return h.setElementValue(e,i),i}},{key:"unformat",value:function(e){if(h.isNumberStrict(e))return e;var t;if(""===(t=h.isElement(e)?h.getElementValue(e):e))return"";if(h.isUndefined(t)||null===t)return null;(h.isArray(t)||h.isObject(t))&&h.throwError("A number or a string representing a number is needed to be able to unformat it, [".concat(t,"] given."));for(var i=arguments.length,n=new Array(i>1?i-1:0),a=1;a<i;a++)n[a-1]=arguments[a];var r=this._generateOptionsObjectFromOptionsArray(n),o=T({},this.getDefaultConfig(),r);if(o.isNegativeSignAllowed=!1,o.isPositiveSignAllowed=!0,t=t.toString(),o.valuesToStrings&&this._checkStringsToValuesSettings(t,o))return h.objectKeyLookup(o.valuesToStrings,t);if(h.isNegative(t,o.negativeSignCharacter))o.isNegativeSignAllowed=!0,o.isPositiveSignAllowed=!1;else if(!h.isNull(o.negativeBracketsTypeOnBlur)){var s=F(o.negativeBracketsTypeOnBlur.split(","),2);o.firstBracket=s[0],o.lastBracket=s[1],t.charAt(0)===o.firstBracket&&t.charAt(t.length-1)===o.lastBracket&&(o.isNegativeSignAllowed=!0,o.isPositiveSignAllowed=!1,t=this._removeBrackets(t,o,!1))}return t=this._convertToNumericString(t,o),h.isNumber(Number(t))&&(t=h.scientificToDecimal(t)),new RegExp("[^+-0123456789.]","gi").test(t)?NaN:(this._correctNegativePositiveSignPlacementOption(o),o.decimalPlacesRawValue?o.originalDecimalPlacesRawValue=o.decimalPlacesRawValue:o.originalDecimalPlacesRawValue=o.decimalPlaces,this._calculateDecimalPlacesOnInit(o),h.isUndefinedOrNullOrEmpty(o.rawValueDivisor)||0===o.rawValueDivisor||""===t||null===t||(t/=o.rawValueDivisor),t=(t=this._roundRawValue(t,o)).replace(o.decimalCharacter,"."),t=this._toLocale(t,o.outputFormat,o))}},{key:"unformatAndSet",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,i=this.unformat(e,t);return h.setElementValue(e,i),i}},{key:"localize",value:function(t){var i,n,a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return""===(i=h.isElement(t)?h.getElementValue(t):t)?"":(h.isNull(a)&&(a=e.defaultSettings),i=this.unformat(i,a),0===Number(i)&&a.leadingZero!==e.options.leadingZero.keep&&(i="0"),n=h.isNull(a)?a.outputFormat:e.defaultSettings.outputFormat,this._toLocale(i,n,a))}},{key:"localizeAndSet",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,i=this.localize(e,t);return h.setElementValue(e,i),i}},{key:"isManagedByAutoNumeric",value:function(e){return this._isInGlobalList(h.domElement(e))}},{key:"getAutoNumericElement",value:function(e){var t=h.domElement(e);return this.isManagedByAutoNumeric(t)?this._getFromGlobalList(t):null}},{key:"set",value:function(e,t){var i,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,a=!(arguments.length>3&&void 0!==arguments[3])||arguments[3],r=h.domElement(e);return this.isManagedByAutoNumeric(r)?this.getAutoNumericElement(r).set(t,n,a):(i=!(!h.isNull(n)&&Object.prototype.hasOwnProperty.call(n,"showWarnings"))||n.showWarnings,h.warning("Impossible to find an AutoNumeric object for the given DOM element or selector.",i),null)}},{key:"getNumericString",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return this._get(e,"getNumericString",t)}},{key:"getFormatted",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return this._get(e,"getFormatted",t)}},{key:"getNumber",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return this._get(e,"getNumber",t)}},{key:"_get",value:function(e,t){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,n=h.domElement(e);return this.isManagedByAutoNumeric(n)||h.throwError("Impossible to find an AutoNumeric object for the given DOM element or selector."),this.getAutoNumericElement(n)[t](i)}},{key:"getLocalized",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,n=h.domElement(e);return this.isManagedByAutoNumeric(n)||h.throwError("Impossible to find an AutoNumeric object for the given DOM element or selector."),this.getAutoNumericElement(n).getLocalized(t,i)}},{key:"_stripAllNonNumberCharacters",value:function(e,t,i,n){return this._stripAllNonNumberCharactersExceptCustomDecimalChar(e,t,i,n).replace(t.decimalCharacter,".")}},{key:"_stripAllNonNumberCharactersExceptCustomDecimalChar",value:function(t,i,n,a){var r=(t=(t=this._normalizeCurrencySuffixAndNegativeSignCharacters(t,i)).replace(i.allowedAutoStrip,"")).match(i.numRegAutoStrip);if(t=r?[r[1],r[2],r[3]].join(""):"",i.leadingZero===e.options.leadingZero.allow||i.leadingZero===e.options.leadingZero.keep){var o="",s=F(t.split(i.decimalCharacter),2),l=s[0],u=s[1],c=l;h.contains(c,i.negativeSignCharacter)&&(o=i.negativeSignCharacter,c=c.replace(i.negativeSignCharacter,"")),""===o&&c.length>i.mIntPos&&"0"===c.charAt(0)&&(c=c.slice(1)),""!==o&&c.length>i.mIntNeg&&"0"===c.charAt(0)&&(c=c.slice(1)),t="".concat(o).concat(c).concat(h.isUndefined(u)?"":i.decimalCharacter+u)}return(n&&i.leadingZero===e.options.leadingZero.deny||!a&&i.leadingZero===e.options.leadingZero.allow)&&(t=t.replace(i.stripReg,"$1$2")),t}},{key:"_toggleNegativeBracket",value:function(e,t,i){return i?this._removeBrackets(e,t):this._addBrackets(e,t)}},{key:"_addBrackets",value:function(e,t){return h.isNull(t.negativeBracketsTypeOnBlur)?e:"".concat(t.firstBracket).concat(e.replace(t.negativeSignCharacter,"")).concat(t.lastBracket)}},{key:"_removeBrackets",value:function(e,t){var i,n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];return h.isNull(t.negativeBracketsTypeOnBlur)||e.charAt(0)!==t.firstBracket?i=e:(i=(i=e.replace(t.firstBracket,"")).replace(t.lastBracket,""),n?(i=i.replace(t.currencySymbol,""),i=this._mergeCurrencySignNegativePositiveSignAndValue(i,t,!0,!1)):i="".concat(t.negativeSignCharacter).concat(i)),i}},{key:"_setBrackets",value:function(e){if(h.isNull(e.negativeBracketsTypeOnBlur))e.firstBracket="",e.lastBracket="";else{var t=F(e.negativeBracketsTypeOnBlur.split(","),2),i=t[0],n=t[1];e.firstBracket=i,e.lastBracket=n}}},{key:"_convertToNumericString",value:function(t,i){t=this._removeBrackets(t,i,!1),t=(t=this._normalizeCurrencySuffixAndNegativeSignCharacters(t,i)).replace(new RegExp("[".concat(i.digitGroupSeparator,"]"),"g"),""),"."!==i.decimalCharacter&&(t=t.replace(i.decimalCharacter,".")),h.isNegative(t)&&t.lastIndexOf("-")===t.length-1&&(t=t.replace("-",""),t="-".concat(t)),i.showPositiveSign&&(t=t.replace(i.positiveSignCharacter,""));var n=i.leadingZero!==e.options.leadingZero.keep,a=h.arabicToLatinNumbers(t,n,!1,!1);return isNaN(a)||(t=a.toString()),t}},{key:"_normalizeCurrencySuffixAndNegativeSignCharacters",value:function(t,i){return t=String(t),i.currencySymbol!==e.options.currencySymbol.none&&(t=t.replace(i.currencySymbol,"")),i.suffixText!==e.options.suffixText.none&&(t=t.replace(i.suffixText,"")),i.negativeSignCharacter!==e.options.negativeSignCharacter.hyphen&&(t=t.replace(i.negativeSignCharacter,"-")),t}},{key:"_toLocale",value:function(t,i,n){if(h.isNull(i)||i===e.options.outputFormat.string)return t;var a;switch(i){case e.options.outputFormat.number:a=Number(t);break;case e.options.outputFormat.dotNegative:a=h.isNegative(t)?t.replace("-","")+"-":t;break;case e.options.outputFormat.comma:case e.options.outputFormat.negativeComma:a=t.replace(".",",");break;case e.options.outputFormat.commaNegative:a=t.replace(".",","),a=h.isNegative(a)?a.replace("-","")+"-":a;break;case e.options.outputFormat.dot:case e.options.outputFormat.negativeDot:a=t;break;default:h.throwError("The given outputFormat [".concat(i,"] option is not recognized."))}return i!==e.options.outputFormat.number&&"-"!==n.negativeSignCharacter&&(a=a.replace("-",n.negativeSignCharacter)),a}},{key:"_modifyNegativeSignAndDecimalCharacterForFormattedValue",value:function(e,t){return"-"!==t.negativeSignCharacter&&(e=e.replace("-",t.negativeSignCharacter)),"."!==t.decimalCharacter&&(e=e.replace(".",t.decimalCharacter)),e}},{key:"_isElementValueEmptyOrOnlyTheNegativeSign",value:function(e,t){return""===e||e===t.negativeSignCharacter}},{key:"_orderValueCurrencySymbolAndSuffixText",value:function(t,i,n){var a;if(i.emptyInputBehavior===e.options.emptyInputBehavior.always||n)switch(i.negativePositiveSignPlacement){case e.options.negativePositiveSignPlacement.left:case e.options.negativePositiveSignPlacement.prefix:case e.options.negativePositiveSignPlacement.none:a=t+i.currencySymbol+i.suffixText;break;default:a=i.currencySymbol+t+i.suffixText}else a=t;return a}},{key:"_addGroupSeparators",value:function(t,i,n,a){var r,o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:null;if(r=h.isNull(o)?h.isNegative(t,i.negativeSignCharacter)||h.isNegativeWithBrackets(t,i.firstBracket,i.lastBracket):o<0,t=this._stripAllNonNumberCharactersExceptCustomDecimalChar(t,i,!1,n),this._isElementValueEmptyOrOnlyTheNegativeSign(t,i))return this._orderValueCurrencySymbolAndSuffixText(t,i,!0);var s=h.isZeroOrHasNoValue(t);r&&(t=t.replace("-",""));var l,u=F(t.split(i.decimalCharacter),2),c=u[0],m=u[1];if(i.decimalCharacterAlternative&&h.isUndefined(m)){var g=F(t.split(i.decimalCharacterAlternative),2);c=g[0],m=g[1]}if(""!==i.digitGroupSeparator){var d;switch(i.digitalGroupSpacing=i.digitalGroupSpacing.toString(),i.digitalGroupSpacing){case e.options.digitalGroupSpacing.twoThree:d=/(\d)((\d)(\d{2}?)+)$/;break;case e.options.digitalGroupSpacing.twoScaled:d=/(\d)((?:\d{2}){0,2}\d{3}(?:(?:\d{2}){2}\d{3})*?)$/;break;case e.options.digitalGroupSpacing.two:case e.options.digitalGroupSpacing.three:case e.options.digitalGroupSpacing.four:default:d=new RegExp("(\\d)((\\d{".concat(i.digitalGroupSpacing,"}?)+)$"))}for(;d.test(c);)c=c.replace(d,"$1".concat(i.digitGroupSeparator,"$2"))}return 0===(l=n?i.decimalPlacesShownOnFocus:i.decimalPlacesShownOnBlur)||h.isUndefined(m)?t=c:(m.length>l&&(m=m.substring(0,l)),t="".concat(c).concat(i.decimalCharacter).concat(m)),t=e._mergeCurrencySignNegativePositiveSignAndValue(t,i,r,s),h.isNull(o)&&(o=a),null!==i.negativeBracketsTypeOnBlur&&(o<0||h.isNegativeStrict(t,i.negativeSignCharacter))&&(t=this._toggleNegativeBracket(t,i,n)),i.suffixText?"".concat(t).concat(i.suffixText):t}},{key:"_mergeCurrencySignNegativePositiveSignAndValue",value:function(t,i,n,a){var r,o="";if(n?o=i.negativeSignCharacter:i.showPositiveSign&&!a&&(o=i.positiveSignCharacter),i.currencySymbolPlacement===e.options.currencySymbolPlacement.prefix)if(i.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.none&&(n||!n&&i.showPositiveSign&&!a))switch(i.negativePositiveSignPlacement){case e.options.negativePositiveSignPlacement.prefix:case e.options.negativePositiveSignPlacement.left:r="".concat(o).concat(i.currencySymbol).concat(t);break;case e.options.negativePositiveSignPlacement.right:r="".concat(i.currencySymbol).concat(o).concat(t);break;case e.options.negativePositiveSignPlacement.suffix:r="".concat(i.currencySymbol).concat(t).concat(o)}else r=i.currencySymbol+t;else if(i.currencySymbolPlacement===e.options.currencySymbolPlacement.suffix)if(i.negativePositiveSignPlacement!==e.options.negativePositiveSignPlacement.none&&(n||!n&&i.showPositiveSign&&!a))switch(i.negativePositiveSignPlacement){case e.options.negativePositiveSignPlacement.suffix:case e.options.negativePositiveSignPlacement.right:r="".concat(t).concat(i.currencySymbol).concat(o);break;case e.options.negativePositiveSignPlacement.left:r="".concat(t).concat(o).concat(i.currencySymbol);break;case e.options.negativePositiveSignPlacement.prefix:r="".concat(o).concat(t).concat(i.currencySymbol)}else r=t+i.currencySymbol;return r}},{key:"_truncateZeros",value:function(e,t){var i;switch(t){case 0:i=/(\.(?:\d*[1-9])?)0*$/;break;case 1:i=/(\.\d(?:\d*[1-9])?)0*$/;break;default:i=new RegExp("(\\.\\d{".concat(t,"}(?:\\d*[1-9])?)0*"))}return e=e.replace(i,"$1"),0===t&&(e=e.replace(/\.$/,"")),e}},{key:"_roundRawValue",value:function(e,t){return this._roundValue(e,t,t.decimalPlacesRawValue)}},{key:"_roundFormattedValueShownOnFocus",value:function(e,t){return this._roundValue(e,t,Number(t.decimalPlacesShownOnFocus))}},{key:"_roundFormattedValueShownOnBlur",value:function(e,t){return this._roundValue(e,t,Number(t.decimalPlacesShownOnBlur))}},{key:"_roundFormattedValueShownOnFocusOrBlur",value:function(e,t,i){return i?this._roundFormattedValueShownOnFocus(e,t):this._roundFormattedValueShownOnBlur(e,t)}},{key:"_roundValue",value:function(t,i,n){if(h.isNull(t))return t;if(t=""===t?"0":t.toString(),i.roundingMethod===e.options.roundingMethod.toNearest05||i.roundingMethod===e.options.roundingMethod.toNearest05Alt||i.roundingMethod===e.options.roundingMethod.upToNext05||i.roundingMethod===e.options.roundingMethod.downToNext05)return this._roundCloseTo05(t,i);var a,r=F(e._prepareValueForRounding(t,i),2),o=r[0],s=(t=r[1]).lastIndexOf("."),l=-1===s,u=F(t.split("."),2),c=u[0];if(!(u[1]>0||i.allowDecimalPadding!==e.options.allowDecimalPadding.never&&i.allowDecimalPadding!==e.options.allowDecimalPadding.floats))return 0===Number(t)?c:"".concat(o).concat(c);a=i.allowDecimalPadding===e.options.allowDecimalPadding.always||i.allowDecimalPadding===e.options.allowDecimalPadding.floats?n:i.allowDecimalPadding>0?i.allowDecimalPadding:0;var m,g=l?t.length-1:s,d=t.length-1-g,v="";if(d<=n){if(v=t,d<a){l&&(v="".concat(v).concat(i.decimalCharacter));for(var p="000000";d<a;)v+=p=p.substring(0,a-d),d+=p.length}else d>a?v=this._truncateZeros(v,a):0===d&&0===a&&(v=v.replace(/\.$/,""));return 0===Number(v)?v:"".concat(o).concat(v)}m=l?n-1:Number(n)+Number(s);var f,y=Number(t.charAt(m+1)),S=t.substring(0,m+1).split("");if(f="."===t.charAt(m)?t.charAt(m-1)%2:t.charAt(m)%2,this._shouldRoundUp(y,i,o,f))for(var b=S.length-1;b>=0;b-=1)if("."!==S[b]){if(S[b]=+S[b]+1,S[b]<10)break;b>0&&(S[b]="0")}return S=S.slice(0,m+1),v=this._truncateZeros(S.join(""),a),0===Number(v)?v:"".concat(o).concat(v)}},{key:"_roundCloseTo05",value:function(t,i){switch(i.roundingMethod){case e.options.roundingMethod.toNearest05:case e.options.roundingMethod.toNearest05Alt:t=(Math.round(20*t)/20).toString();break;case e.options.roundingMethod.upToNext05:t=(Math.ceil(20*t)/20).toString();break;default:t=(Math.floor(20*t)/20).toString()}return h.contains(t,".")?t.length-t.indexOf(".")<3?t+"0":t:t+".00"}},{key:"_prepareValueForRounding",value:function(t,i){var n="";return h.isNegativeStrict(t,"-")&&(n="-",t=t.replace("-","")),t.match(/^\d/)||(t="0".concat(t)),0===Number(t)&&(n=""),(Number(t)>0&&i.leadingZero!==e.options.leadingZero.keep||t.length>0&&i.leadingZero===e.options.leadingZero.allow)&&(t=t.replace(/^0*(\d)/,"$1")),[n,t]}},{key:"_shouldRoundUp",value:function(t,i,n,a){return t>4&&i.roundingMethod===e.options.roundingMethod.halfUpSymmetric||t>4&&i.roundingMethod===e.options.roundingMethod.halfUpAsymmetric&&""===n||t>5&&i.roundingMethod===e.options.roundingMethod.halfUpAsymmetric&&"-"===n||t>5&&i.roundingMethod===e.options.roundingMethod.halfDownSymmetric||t>5&&i.roundingMethod===e.options.roundingMethod.halfDownAsymmetric&&""===n||t>4&&i.roundingMethod===e.options.roundingMethod.halfDownAsymmetric&&"-"===n||t>5&&i.roundingMethod===e.options.roundingMethod.halfEvenBankersRounding||5===t&&i.roundingMethod===e.options.roundingMethod.halfEvenBankersRounding&&1===a||t>0&&i.roundingMethod===e.options.roundingMethod.toCeilingTowardPositiveInfinity&&""===n||t>0&&i.roundingMethod===e.options.roundingMethod.toFloorTowardNegativeInfinity&&"-"===n||t>0&&i.roundingMethod===e.options.roundingMethod.upRoundAwayFromZero}},{key:"_truncateDecimalPlaces",value:function(e,t,i,n){i&&(e=this._roundFormattedValueShownOnFocus(e,t));var a=F(e.split(t.decimalCharacter),2),r=a[0],o=a[1];if(o&&o.length>n)if(n>0){var s=o.substring(0,n);e="".concat(r).concat(t.decimalCharacter).concat(s)}else e=r;return e}},{key:"_checkIfInRangeWithOverrideOption",value:function(t,i){if(h.isNull(t)&&i.emptyInputBehavior===e.options.emptyInputBehavior.null||i.overrideMinMaxLimits===e.options.overrideMinMaxLimits.ignore||i.overrideMinMaxLimits===e.options.overrideMinMaxLimits.invalid)return[!0,!0];t=(t=t.toString()).replace(",",".");var n,a=h.parseStr(i.minimumValue),r=h.parseStr(i.maximumValue),o=h.parseStr(t);switch(i.overrideMinMaxLimits){case e.options.overrideMinMaxLimits.floor:n=[h.testMinMax(a,o)>-1,!0];break;case e.options.overrideMinMaxLimits.ceiling:n=[!0,h.testMinMax(r,o)<1];break;default:n=[h.testMinMax(a,o)>-1,h.testMinMax(r,o)<1]}return n}},{key:"_isWithinRangeWithOverrideOption",value:function(e,t){var i=F(this._checkIfInRangeWithOverrideOption(e,t),2),n=i[0],a=i[1];return n&&a}},{key:"_cleanValueForRangeParse",value:function(e){return e=e.toString().replace(",","."),h.parseStr(e)}},{key:"_isMinimumRangeRespected",value:function(e,t){return h.testMinMax(h.parseStr(t.minimumValue),this._cleanValueForRangeParse(e))>-1}},{key:"_isMaximumRangeRespected",value:function(e,t){return h.testMinMax(h.parseStr(t.maximumValue),this._cleanValueForRangeParse(e))<1}},{key:"_correctNegativePositiveSignPlacementOption",value:function(t){if(h.isNull(t.negativePositiveSignPlacement))if(h.isUndefined(t)||!h.isUndefinedOrNullOrEmpty(t.negativePositiveSignPlacement)||h.isUndefinedOrNullOrEmpty(t.currencySymbol))t.negativePositiveSignPlacement=e.options.negativePositiveSignPlacement.left;else switch(t.currencySymbolPlacement){case e.options.currencySymbolPlacement.suffix:t.negativePositiveSignPlacement=e.options.negativePositiveSignPlacement.prefix;break;case e.options.currencySymbolPlacement.prefix:t.negativePositiveSignPlacement=e.options.negativePositiveSignPlacement.left}}},{key:"_correctCaretPositionOnFocusAndSelectOnFocusOptions",value:function(t){return h.isNull(t)?null:(!h.isUndefinedOrNullOrEmpty(t.caretPositionOnFocus)&&h.isUndefinedOrNullOrEmpty(t.selectOnFocus)&&(t.selectOnFocus=e.options.selectOnFocus.doNotSelect),h.isUndefinedOrNullOrEmpty(t.caretPositionOnFocus)&&!h.isUndefinedOrNullOrEmpty(t.selectOnFocus)&&t.selectOnFocus===e.options.selectOnFocus.select&&(t.caretPositionOnFocus=e.options.caretPositionOnFocus.doNoForceCaretPosition),t)}},{key:"_calculateDecimalPlacesOnInit",value:function(t){this._validateDecimalPlacesRawValue(t),t.decimalPlacesShownOnFocus===e.options.decimalPlacesShownOnFocus.useDefault&&(t.decimalPlacesShownOnFocus=t.decimalPlaces),t.decimalPlacesShownOnBlur===e.options.decimalPlacesShownOnBlur.useDefault&&(t.decimalPlacesShownOnBlur=t.decimalPlaces),t.decimalPlacesRawValue===e.options.decimalPlacesRawValue.useDefault&&(t.decimalPlacesRawValue=t.decimalPlaces);var i=0;t.rawValueDivisor&&t.rawValueDivisor!==e.options.rawValueDivisor.none&&(i=String(t.rawValueDivisor).length-1)<0&&(i=0),t.decimalPlacesRawValue=Math.max(Math.max(t.decimalPlacesShownOnBlur,t.decimalPlacesShownOnFocus)+i,Number(t.originalDecimalPlacesRawValue)+i)}},{key:"_calculateDecimalPlacesOnUpdate",value:function(t){var i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;this._validateDecimalPlacesRawValue(t),h.isNull(i)&&h.throwError("When updating the settings, the previous ones should be passed as an argument.");var n="decimalPlaces"in t;if(n||"decimalPlacesRawValue"in t||"decimalPlacesShownOnFocus"in t||"decimalPlacesShownOnBlur"in t||"rawValueDivisor"in t){n?("decimalPlacesShownOnFocus"in t&&t.decimalPlacesShownOnFocus!==e.options.decimalPlacesShownOnFocus.useDefault||(t.decimalPlacesShownOnFocus=t.decimalPlaces),"decimalPlacesShownOnBlur"in t&&t.decimalPlacesShownOnBlur!==e.options.decimalPlacesShownOnBlur.useDefault||(t.decimalPlacesShownOnBlur=t.decimalPlaces),"decimalPlacesRawValue"in t&&t.decimalPlacesRawValue!==e.options.decimalPlacesRawValue.useDefault||(t.decimalPlacesRawValue=t.decimalPlaces)):(h.isUndefined(t.decimalPlacesShownOnFocus)&&(t.decimalPlacesShownOnFocus=i.decimalPlacesShownOnFocus),h.isUndefined(t.decimalPlacesShownOnBlur)&&(t.decimalPlacesShownOnBlur=i.decimalPlacesShownOnBlur));var a=0;t.rawValueDivisor&&t.rawValueDivisor!==e.options.rawValueDivisor.none&&(a=String(t.rawValueDivisor).length-1)<0&&(a=0),t.decimalPlaces||t.decimalPlacesRawValue?t.decimalPlacesRawValue=Math.max(Math.max(t.decimalPlacesShownOnBlur,t.decimalPlacesShownOnFocus)+a,Number(t.decimalPlacesRawValue)+a):t.decimalPlacesRawValue=Math.max(Math.max(t.decimalPlacesShownOnBlur,t.decimalPlacesShownOnFocus)+a,Number(i.originalDecimalPlacesRawValue)+a)}}},{key:"_cachesUsualRegularExpressions",value:function(t,i){var n;n=t.negativeSignCharacter!==e.options.negativeSignCharacter.hyphen?"([-\\".concat(t.negativeSignCharacter,"]?)"):"(-?)",i.aNegRegAutoStrip=n,t.allowedAutoStrip=new RegExp("[^-0123456789\\".concat(t.decimalCharacter,"]"),"g"),t.numRegAutoStrip=new RegExp("".concat(n,"(?:\\").concat(t.decimalCharacter,"?([0-9]+\\").concat(t.decimalCharacter,"[0-9]+)|([0-9]*(?:\\").concat(t.decimalCharacter,"[0-9]*)?))")),t.stripReg=new RegExp("^".concat(i.aNegRegAutoStrip,"0*([0-9])")),t.formulaChars=new RegExp("[0-9".concat(t.decimalCharacter,"+\\-*/() ]"))}},{key:"_convertOldOptionsToNewOnes",value:function(e){var t={aSep:"digitGroupSeparator",nSep:"showOnlyNumbersOnFocus",dGroup:"digitalGroupSpacing",aDec:"decimalCharacter",altDec:"decimalCharacterAlternative",aSign:"currencySymbol",pSign:"currencySymbolPlacement",pNeg:"negativePositiveSignPlacement",aSuffix:"suffixText",oLimits:"overrideMinMaxLimits",vMax:"maximumValue",vMin:"minimumValue",mDec:"decimalPlacesOverride",eDec:"decimalPlacesShownOnFocus",scaleDecimal:"decimalPlacesShownOnBlur",aStor:"saveValueToSessionStorage",mRound:"roundingMethod",aPad:"allowDecimalPadding",nBracket:"negativeBracketsTypeOnBlur",wEmpty:"emptyInputBehavior",lZero:"leadingZero",aForm:"formatOnPageLoad",sNumber:"selectNumberOnly",anDefault:"defaultValueOverride",unSetOnSubmit:"unformatOnSubmit",outputType:"outputFormat",debug:"showWarnings",allowDecimalPadding:!0,alwaysAllowDecimalCharacter:!0,caretPositionOnFocus:!0,createLocalList:!0,currencySymbol:!0,currencySymbolPlacement:!0,decimalCharacter:!0,decimalCharacterAlternative:!0,decimalPlaces:!0,decimalPlacesRawValue:!0,decimalPlacesShownOnBlur:!0,decimalPlacesShownOnFocus:!0,defaultValueOverride:!0,digitalGroupSpacing:!0,digitGroupSeparator:!0,divisorWhenUnfocused:!0,emptyInputBehavior:!0,eventBubbles:!0,eventIsCancelable:!0,failOnUnknownOption:!0,formatOnPageLoad:!0,formulaMode:!0,historySize:!0,isCancellable:!0,leadingZero:!0,maximumValue:!0,minimumValue:!0,modifyValueOnUpDownArrow:!0,modifyValueOnWheel:!0,negativeBracketsTypeOnBlur:!0,negativePositiveSignPlacement:!0,negativeSignCharacter:!0,negativePositiveSignBehavior:!0,noEventListeners:!0,onInvalidPaste:!0,outputFormat:!0,overrideMinMaxLimits:!0,positiveSignCharacter:!0,rawValueDivisor:!0,readOnly:!0,roundingMethod:!0,saveValueToSessionStorage:!0,selectNumberOnly:!0,selectOnFocus:!0,serializeSpaces:!0,showOnlyNumbersOnFocus:!0,showPositiveSign:!0,showWarnings:!0,styleRules:!0,suffixText:!0,symbolWhenUnfocused:!0,upDownStep:!0,unformatOnHover:!0,unformatOnSubmit:!0,valuesToStrings:!0,watchExternalChanges:!0,wheelOn:!0,wheelStep:!0,allowedAutoStrip:!0,formulaChars:!0,isNegativeSignAllowed:!0,isPositiveSignAllowed:!0,mIntNeg:!0,mIntPos:!0,numRegAutoStrip:!0,originalDecimalPlaces:!0,originalDecimalPlacesRawValue:!0,stripReg:!0};for(var i in e)if(Object.prototype.hasOwnProperty.call(e,i)){if(!0===t[i])continue;Object.prototype.hasOwnProperty.call(t,i)?(h.warning("You are using the deprecated option name '".concat(i,"'. Please use '").concat(t[i],"' instead from now on. The old option name will be dropped very soon™."),!0),e[t[i]]=e[i],delete e[i]):e.failOnUnknownOption&&h.throwError("Option name '".concat(i,"' is unknown. Please fix the options passed to autoNumeric"))}"mDec"in e&&h.warning("The old `mDec` option has been deprecated in favor of more accurate options ; `decimalPlaces`, `decimalPlacesRawValue`, `decimalPlacesShownOnFocus` and `decimalPlacesShownOnBlur`.",!0)}},{key:"_setNegativePositiveSignPermissions",value:function(e){e.isNegativeSignAllowed=e.minimumValue<0,e.isPositiveSignAllowed=e.maximumValue>=0}},{key:"_toNumericValue",value:function(e,t){var i;return h.isNumber(Number(e))?(h.isNumberStrict(e)||(e=String(e).trim()),i=h.scientificToDecimal(e)):(i=this._convertToNumericString(e.toString(),t),h.isNumber(Number(i))||(h.warning('The given value "'.concat(e,'" cannot be converted to a numeric one and therefore cannot be used appropriately.'),t.showWarnings),i=NaN)),i}},{key:"_checkIfInRange",value:function(e,t,i){var n=h.parseStr(e);return h.testMinMax(t,n)>-1&&h.testMinMax(i,n)<1}},{key:"_shouldSkipEventKey",value:function(e){var t=h.isInArray(e,n.keyName._allFnKeys),i=e===n.keyName.OSLeft||e===n.keyName.OSRight,a=e===n.keyName.ContextMenu,r=h.isInArray(e,n.keyName._someNonPrintableKeys),o=e===n.keyName.NumLock||e===n.keyName.ScrollLock||e===n.keyName.Insert||e===n.keyName.Command,s=e===n.keyName.Unidentified;return t||i||a||r||s||o}},{key:"_serialize",value:function(e){var t,i=this,n=arguments.length>1&&void 0!==arguments[1]&&arguments[1],a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"unformatted",r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"+",o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:null,s=[];return"object"===A(e)&&"form"===e.nodeName.toLowerCase()&&Array.prototype.slice.call(e.elements).forEach((function(e){if(e.name&&!e.disabled&&-1===["file","reset","submit","button"].indexOf(e.type))if("select-multiple"===e.type)Array.prototype.slice.call(e.options).forEach((function(t){t.selected&&(n?s.push({name:e.name,value:t.value}):s.push("".concat(encodeURIComponent(e.name),"=").concat(encodeURIComponent(t.value))))}));else if(-1===["checkbox","radio"].indexOf(e.type)||e.checked){var t,r;if(i.isManagedByAutoNumeric(e))switch(a){case"unformatted":r=i.getAutoNumericElement(e),h.isNull(r)||(t=i.unformat(e,r.getSettings()));break;case"localized":if(r=i.getAutoNumericElement(e),!h.isNull(r)){var l=h.cloneObject(r.getSettings());h.isNull(o)||(l.outputFormat=o),t=i.localize(e,l)}break;default:t=e.value}else t=e.value;h.isUndefined(t)&&h.throwError("This error should never be hit. If it has, something really wrong happened!"),n?s.push({name:e.name,value:t}):s.push("".concat(encodeURIComponent(e.name),"=").concat(encodeURIComponent(t)))}})),n?t=s:(t=s.join("&"),"+"===r&&(t=t.replace(/%20/g,"+"))),t}},{key:"_serializeNumericString",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"+";return this._serialize(e,!1,"unformatted",t)}},{key:"_serializeFormatted",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"+";return this._serialize(e,!1,"formatted",t)}},{key:"_serializeLocalized",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"+",i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;return this._serialize(e,!1,"localized",t,i)}},{key:"_serializeNumericStringArray",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"+";return this._serialize(e,!0,"unformatted",t)}},{key:"_serializeFormattedArray",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"+";return this._serialize(e,!0,"formatted",t)}},{key:"_serializeLocalizedArray",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"+",i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;return this._serialize(e,!0,"localized",t,i)}}],i&&L(t.prototype,i),a&&L(t,a),Object.defineProperty(t,"prototype",{writable:!1}),e}();D(M,"options",void 0),D(M,"events",void 0),D(M,"defaultSettings",void 0),D(M,"predefinedOptions",void 0),M.multiple=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,n=[];if(h.isObject(t)&&(i=t,t=null),h.isString(e))e=C(document.querySelectorAll(e));else if(h.isObject(e)){Object.prototype.hasOwnProperty.call(e,"rootElement")||h.throwError("The object passed to the 'multiple' function is invalid ; no 'rootElement' attribute found.");var a=C(e.rootElement.querySelectorAll("input"));Object.prototype.hasOwnProperty.call(e,"exclude")?(Array.isArray(e.exclude)||h.throwError("The 'exclude' array passed to the 'multiple' function is invalid."),e=h.filterOut(a,e.exclude)):e=a}else h.isArray(e)||h.throwError("The given parameters to the 'multiple' function are invalid.");if(0===e.length){var r=!0;return!h.isNull(i)&&h.isBoolean(i.showWarnings)&&(r=i.showWarnings),h.warning("No valid DOM elements were given hence no AutoNumeric objects were instantiated.",r),[]}var o=h.isArray(t)&&t.length>=1,s=!1,l=!1;if(o){var u=A(Number(t[0]));(s="number"===u&&!isNaN(Number(t[0])))||("string"===u||isNaN(u)||"object"===u)&&(l=!0)}var c,m=!1;if(h.isArray(i)&&i.length>=1){var g=A(i[0]);"string"!==g&&"object"!==g||(m=!0)}c=l?M.mergeOptions(t):m?M.mergeOptions(i):i;var d,v=h.isNumber(t);return s&&(d=t.length),e.forEach((function(e,i){v?n.push(new M(e,t,c)):s&&i<=d?n.push(new M(e,t[i],c)):n.push(new M(e,null,c))})),n},M.events={correctedValue:"autoNumeric:correctedValue",initialized:"autoNumeric:initialized",invalidFormula:"autoNumeric:invalidFormula",invalidValue:"autoNumeric:invalidValue",formatted:"autoNumeric:formatted",rawValueModified:"autoNumeric:rawValueModified",minRangeExceeded:"autoNumeric:minExceeded",maxRangeExceeded:"autoNumeric:maxExceeded",native:{input:"input",change:"change"},validFormula:"autoNumeric:validFormula"},Object.freeze(M.events.native),Object.freeze(M.events),Object.defineProperty(M,"events",{configurable:!1,writable:!1}),M.options={allowDecimalPadding:{always:!0,never:!1,floats:"floats"},alwaysAllowDecimalCharacter:{alwaysAllow:!0,doNotAllow:!1},caretPositionOnFocus:{start:"start",end:"end",decimalLeft:"decimalLeft",decimalRight:"decimalRight",doNoForceCaretPosition:null},createLocalList:{createList:!0,doNotCreateList:!1},currencySymbol:{none:"",currencySign:"¤",austral:"₳",australCentavo:"¢",baht:"฿",cedi:"₵",cent:"¢",colon:"₡",cruzeiro:"₢",dollar:"$",dong:"₫",drachma:"₯",dram:"​֏",european:"₠",euro:"€",florin:"ƒ",franc:"₣",guarani:"₲",hryvnia:"₴",kip:"₭",att:"ອັດ",lepton:"Λ.",lira:"₺",liraOld:"₤",lari:"₾",mark:"ℳ",mill:"₥",naira:"₦",peseta:"₧",peso:"₱",pfennig:"₰",pound:"£",real:"R$ ",riel:"៛",ruble:"₽",rupee:"₹",rupeeOld:"₨",shekel:"₪",shekelAlt:"ש״ח‎‎",taka:"৳",tenge:"₸",togrog:"₮",won:"₩",yen:"¥"},currencySymbolPlacement:{prefix:"p",suffix:"s"},decimalCharacter:{comma:",",dot:".",middleDot:"·",arabicDecimalSeparator:"٫",decimalSeparatorKeySymbol:"⎖"},decimalCharacterAlternative:{none:null,comma:",",dot:"."},decimalPlaces:{none:0,one:1,two:2,three:3,four:4,five:5,six:6},decimalPlacesRawValue:{useDefault:null,none:0,one:1,two:2,three:3,four:4,five:5,six:6},decimalPlacesShownOnBlur:{useDefault:null,none:0,one:1,two:2,three:3,four:4,five:5,six:6},decimalPlacesShownOnFocus:{useDefault:null,none:0,one:1,two:2,three:3,four:4,five:5,six:6},defaultValueOverride:{doNotOverride:null},digitalGroupSpacing:{two:"2",twoThree:"2t",twoScaled:"2s",three:"3",four:"4"},digitGroupSeparator:{comma:",",dot:".",normalSpace:" ",thinSpace:" ",narrowNoBreakSpace:" ",noBreakSpace:" ",noSeparator:"",apostrophe:"'",arabicThousandsSeparator:"٬",dotAbove:"˙",privateUseTwo:"’"},divisorWhenUnfocused:{none:null,percentage:100,permille:1e3,basisPoint:1e4},emptyInputBehavior:{focus:"focus",press:"press",always:"always",zero:"zero",min:"min",max:"max",null:"null"},eventBubbles:{bubbles:!0,doesNotBubble:!1},eventIsCancelable:{isCancelable:!0,isNotCancelable:!1},failOnUnknownOption:{fail:!0,ignore:!1},formatOnPageLoad:{format:!0,doNotFormat:!1},formulaMode:{enabled:!0,disabled:!1},historySize:{verySmall:5,small:10,medium:20,large:50,veryLarge:100,insane:Number.MAX_SAFE_INTEGER},invalidClass:"an-invalid",isCancellable:{cancellable:!0,notCancellable:!1},leadingZero:{allow:"allow",deny:"deny",keep:"keep"},maximumValue:{tenTrillions:"10000000000000",oneBillion:"1000000000",zero:"0"},minimumValue:{tenTrillions:"-10000000000000",oneBillion:"-1000000000",zero:"0"},modifyValueOnUpDownArrow:{modifyValue:!0,doNothing:!1},modifyValueOnWheel:{modifyValue:!0,doNothing:!1},negativeBracketsTypeOnBlur:{parentheses:"(,)",brackets:"[,]",chevrons:"<,>",curlyBraces:"{,}",angleBrackets:"〈,〉",japaneseQuotationMarks:"｢,｣",halfBrackets:"⸤,⸥",whiteSquareBrackets:"⟦,⟧",quotationMarks:"‹,›",guillemets:"«,»",none:null},negativePositiveSignPlacement:{prefix:"p",suffix:"s",left:"l",right:"r",none:null},negativeSignCharacter:{hyphen:"-",minus:"−",heavyMinus:"➖",fullWidthHyphen:"－",circledMinus:"⊖",squaredMinus:"⊟",triangleMinus:"⨺",plusMinus:"±",minusPlus:"∓",dotMinus:"∸",minusTilde:"≂",not:"¬"},negativePositiveSignBehavior:{toggle:!0,doNotToggle:!1},noEventListeners:{noEvents:!0,addEvents:!1},onInvalidPaste:{error:"error",ignore:"ignore",clamp:"clamp",truncate:"truncate",replace:"replace"},outputFormat:{string:"string",number:"number",dot:".",negativeDot:"-.",comma:",",negativeComma:"-,",dotNegative:".-",commaNegative:",-",none:null},overrideMinMaxLimits:{ceiling:"ceiling",floor:"floor",ignore:"ignore",invalid:"invalid",doNotOverride:null},positiveSignCharacter:{plus:"+",fullWidthPlus:"＋",heavyPlus:"➕",doublePlus:"⧺",triplePlus:"⧻",circledPlus:"⊕",squaredPlus:"⊞",trianglePlus:"⨹",plusMinus:"±",minusPlus:"∓",dotPlus:"∔",altHebrewPlus:"﬩",normalSpace:" ",thinSpace:" ",narrowNoBreakSpace:" ",noBreakSpace:" "},rawValueDivisor:{none:null,percentage:100,permille:1e3,basisPoint:1e4},readOnly:{readOnly:!0,readWrite:!1},roundingMethod:{halfUpSymmetric:"S",halfUpAsymmetric:"A",halfDownSymmetric:"s",halfDownAsymmetric:"a",halfEvenBankersRounding:"B",upRoundAwayFromZero:"U",downRoundTowardZero:"D",toCeilingTowardPositiveInfinity:"C",toFloorTowardNegativeInfinity:"F",toNearest05:"N05",toNearest05Alt:"CHF",upToNext05:"U05",downToNext05:"D05"},saveValueToSessionStorage:{save:!0,doNotSave:!1},selectNumberOnly:{selectNumbersOnly:!0,selectAll:!1},selectOnFocus:{select:!0,doNotSelect:!1},serializeSpaces:{plus:"+",percent:"%20"},showOnlyNumbersOnFocus:{onlyNumbers:!0,showAll:!1},showPositiveSign:{show:!0,hide:!1},showWarnings:{show:!0,hide:!1},styleRules:{none:null,positiveNegative:{positive:"autoNumeric-positive",negative:"autoNumeric-negative"},range0To100With4Steps:{ranges:[{min:0,max:25,class:"autoNumeric-red"},{min:25,max:50,class:"autoNumeric-orange"},{min:50,max:75,class:"autoNumeric-yellow"},{min:75,max:100,class:"autoNumeric-green"}]},evenOdd:{userDefined:[{callback:function(e){return e%2==0},classes:["autoNumeric-even","autoNumeric-odd"]}]},rangeSmallAndZero:{userDefined:[{callback:function(e){return e>=-1&&e<0?0:0===Number(e)?1:e>0&&e<=1?2:null},classes:["autoNumeric-small-negative","autoNumeric-zero","autoNumeric-small-positive"]}]}},suffixText:{none:"",percentage:"%",permille:"‰",basisPoint:"‱"},symbolWhenUnfocused:{none:null,percentage:"%",permille:"‰",basisPoint:"‱"},unformatOnHover:{unformat:!0,doNotUnformat:!1},unformatOnSubmit:{unformat:!0,keepCurrentValue:!1},upDownStep:{progressive:"progressive"},valuesToStrings:{none:null,zeroDash:{0:"-"},oneAroundZero:{"-1":"Min",1:"Max"}},watchExternalChanges:{watch:!0,doNotWatch:!1},wheelOn:{focus:"focus",hover:"hover"},wheelStep:{progressive:"progressive"}},I=M.options,Object.getOwnPropertyNames(I).forEach((function(e){"valuesToStrings"===e?Object.getOwnPropertyNames(I.valuesToStrings).forEach((function(e){null!==I.valuesToStrings[e]&&Object.freeze(I.valuesToStrings[e])})):"styleRules"!==e&&null!==I[e]&&Object.freeze(I[e])})),Object.freeze(I),Object.defineProperty(M,"options",{configurable:!1,writable:!1}),M.defaultSettings={allowDecimalPadding:M.options.allowDecimalPadding.always,alwaysAllowDecimalCharacter:M.options.alwaysAllowDecimalCharacter.doNotAllow,caretPositionOnFocus:M.options.caretPositionOnFocus.doNoForceCaretPosition,createLocalList:M.options.createLocalList.createList,currencySymbol:M.options.currencySymbol.none,currencySymbolPlacement:M.options.currencySymbolPlacement.prefix,decimalCharacter:M.options.decimalCharacter.dot,decimalCharacterAlternative:M.options.decimalCharacterAlternative.none,decimalPlaces:M.options.decimalPlaces.two,decimalPlacesRawValue:M.options.decimalPlacesRawValue.useDefault,decimalPlacesShownOnBlur:M.options.decimalPlacesShownOnBlur.useDefault,decimalPlacesShownOnFocus:M.options.decimalPlacesShownOnFocus.useDefault,defaultValueOverride:M.options.defaultValueOverride.doNotOverride,digitalGroupSpacing:M.options.digitalGroupSpacing.three,digitGroupSeparator:M.options.digitGroupSeparator.comma,divisorWhenUnfocused:M.options.divisorWhenUnfocused.none,emptyInputBehavior:M.options.emptyInputBehavior.focus,eventBubbles:M.options.eventBubbles.bubbles,eventIsCancelable:M.options.eventIsCancelable.isCancelable,failOnUnknownOption:M.options.failOnUnknownOption.ignore,formatOnPageLoad:M.options.formatOnPageLoad.format,formulaMode:M.options.formulaMode.disabled,historySize:M.options.historySize.medium,invalidClass:M.options.invalidClass,isCancellable:M.options.isCancellable.cancellable,leadingZero:M.options.leadingZero.deny,maximumValue:M.options.maximumValue.tenTrillions,minimumValue:M.options.minimumValue.tenTrillions,modifyValueOnUpDownArrow:M.options.modifyValueOnUpDownArrow.modifyValue,modifyValueOnWheel:M.options.modifyValueOnWheel.modifyValue,negativeBracketsTypeOnBlur:M.options.negativeBracketsTypeOnBlur.none,negativePositiveSignPlacement:M.options.negativePositiveSignPlacement.none,negativeSignCharacter:M.options.negativeSignCharacter.hyphen,negativePositiveSignBehavior:M.options.negativePositiveSignBehavior.doNotToggle,noEventListeners:M.options.noEventListeners.addEvents,onInvalidPaste:M.options.onInvalidPaste.error,outputFormat:M.options.outputFormat.none,overrideMinMaxLimits:M.options.overrideMinMaxLimits.doNotOverride,positiveSignCharacter:M.options.positiveSignCharacter.plus,rawValueDivisor:M.options.rawValueDivisor.none,readOnly:M.options.readOnly.readWrite,roundingMethod:M.options.roundingMethod.halfUpSymmetric,saveValueToSessionStorage:M.options.saveValueToSessionStorage.doNotSave,selectNumberOnly:M.options.selectNumberOnly.selectNumbersOnly,selectOnFocus:M.options.selectOnFocus.select,serializeSpaces:M.options.serializeSpaces.plus,showOnlyNumbersOnFocus:M.options.showOnlyNumbersOnFocus.showAll,showPositiveSign:M.options.showPositiveSign.hide,showWarnings:M.options.showWarnings.show,styleRules:M.options.styleRules.none,suffixText:M.options.suffixText.none,symbolWhenUnfocused:M.options.symbolWhenUnfocused.none,unformatOnHover:M.options.unformatOnHover.unformat,unformatOnSubmit:M.options.unformatOnSubmit.keepCurrentValue,upDownStep:"1",valuesToStrings:M.options.valuesToStrings.none,watchExternalChanges:M.options.watchExternalChanges.doNotWatch,wheelOn:M.options.wheelOn.focus,wheelStep:M.options.wheelStep.progressive},Object.freeze(M.defaultSettings),Object.defineProperty(M,"defaultSettings",{configurable:!1,writable:!1});var R={digitGroupSeparator:M.options.digitGroupSeparator.dot,decimalCharacter:M.options.decimalCharacter.comma,decimalCharacterAlternative:M.options.decimalCharacterAlternative.dot,currencySymbol:" €",currencySymbolPlacement:M.options.currencySymbolPlacement.suffix,negativePositiveSignPlacement:M.options.negativePositiveSignPlacement.prefix},U={digitGroupSeparator:M.options.digitGroupSeparator.comma,decimalCharacter:M.options.decimalCharacter.dot,currencySymbol:M.options.currencySymbol.dollar,currencySymbolPlacement:M.options.currencySymbolPlacement.prefix,negativePositiveSignPlacement:M.options.negativePositiveSignPlacement.right},j={digitGroupSeparator:M.options.digitGroupSeparator.comma,decimalCharacter:M.options.decimalCharacter.dot,currencySymbol:M.options.currencySymbol.yen,currencySymbolPlacement:M.options.currencySymbolPlacement.prefix,negativePositiveSignPlacement:M.options.negativePositiveSignPlacement.right};h.cloneObject(R).formulaMode=M.options.formulaMode.enabled;var K=h.cloneObject(R);K.minimumValue=0;var z=h.cloneObject(R);z.maximumValue=0,z.negativePositiveSignPlacement=M.options.negativePositiveSignPlacement.prefix;var W=h.cloneObject(R);W.digitGroupSeparator=M.options.digitGroupSeparator.normalSpace;var G=h.cloneObject(W);G.minimumValue=0;var H=h.cloneObject(W);H.maximumValue=0,H.negativePositiveSignPlacement=M.options.negativePositiveSignPlacement.prefix;var Z=h.cloneObject(R);Z.currencySymbol=M.options.currencySymbol.none,Z.suffixText=" ".concat(M.options.suffixText.percentage),Z.wheelStep=1e-4,Z.rawValueDivisor=M.options.rawValueDivisor.percentage;var q=h.cloneObject(Z);q.minimumValue=0;var $=h.cloneObject(Z);$.maximumValue=0,$.negativePositiveSignPlacement=M.options.negativePositiveSignPlacement.prefix;var Y=h.cloneObject(Z);Y.decimalPlaces=3;var J=h.cloneObject(q);J.decimalPlaces=3;var X=h.cloneObject($);X.decimalPlaces=3,h.cloneObject(U).formulaMode=M.options.formulaMode.enabled;var Q=h.cloneObject(U);Q.minimumValue=0;var ee=h.cloneObject(U);ee.maximumValue=0,ee.negativePositiveSignPlacement=M.options.negativePositiveSignPlacement.prefix;var te=h.cloneObject(ee);te.negativeBracketsTypeOnBlur=M.options.negativeBracketsTypeOnBlur.parentheses;var ie=h.cloneObject(U);ie.currencySymbol=M.options.currencySymbol.none,ie.suffixText=M.options.suffixText.percentage,ie.wheelStep=1e-4,ie.rawValueDivisor=M.options.rawValueDivisor.percentage;var ne=h.cloneObject(ie);ne.minimumValue=0;var ae=h.cloneObject(ie);ae.maximumValue=0,ae.negativePositiveSignPlacement=M.options.negativePositiveSignPlacement.prefix;var re=h.cloneObject(ie);re.decimalPlaces=3;var oe=h.cloneObject(ne);oe.decimalPlaces=3;var se=h.cloneObject(ae);se.decimalPlaces=3;var le=h.cloneObject(R);le.currencySymbol=M.options.currencySymbol.lira,M.predefinedOptions={euro:R,euroPos:K,euroNeg:z,euroSpace:W,euroSpacePos:G,euroSpaceNeg:H,percentageEU2dec:Z,percentageEU2decPos:q,percentageEU2decNeg:$,percentageEU3dec:Y,percentageEU3decPos:J,percentageEU3decNeg:X,dollar:U,dollarPos:Q,dollarNeg:ee,dollarNegBrackets:te,percentageUS2dec:ie,percentageUS2decPos:ne,percentageUS2decNeg:ae,percentageUS3dec:re,percentageUS3decPos:oe,percentageUS3decNeg:se,French:R,Spanish:R,NorthAmerican:U,British:{digitGroupSeparator:M.options.digitGroupSeparator.comma,decimalCharacter:M.options.decimalCharacter.dot,currencySymbol:M.options.currencySymbol.pound,currencySymbolPlacement:M.options.currencySymbolPlacement.prefix,negativePositiveSignPlacement:M.options.negativePositiveSignPlacement.right},Swiss:{digitGroupSeparator:M.options.digitGroupSeparator.apostrophe,decimalCharacter:M.options.decimalCharacter.dot,currencySymbol:" CHF",currencySymbolPlacement:M.options.currencySymbolPlacement.suffix,negativePositiveSignPlacement:M.options.negativePositiveSignPlacement.prefix},Japanese:j,Chinese:j,Brazilian:{digitGroupSeparator:M.options.digitGroupSeparator.dot,decimalCharacter:M.options.decimalCharacter.comma,currencySymbol:M.options.currencySymbol.real,currencySymbolPlacement:M.options.currencySymbolPlacement.prefix,negativePositiveSignPlacement:M.options.negativePositiveSignPlacement.right},Turkish:le,dotDecimalCharCommaSeparator:{digitGroupSeparator:M.options.digitGroupSeparator.comma,decimalCharacter:M.options.decimalCharacter.dot},commaDecimalCharDotSeparator:{digitGroupSeparator:M.options.digitGroupSeparator.dot,decimalCharacter:M.options.decimalCharacter.comma,decimalCharacterAlternative:M.options.decimalCharacterAlternative.dot},integer:{decimalPlaces:0},integerPos:{minimumValue:M.options.minimumValue.zero,decimalPlaces:0},integerNeg:{maximumValue:M.options.maximumValue.zero,decimalPlaces:0},float:{allowDecimalPadding:M.options.allowDecimalPadding.never},floatPos:{allowDecimalPadding:M.options.allowDecimalPadding.never,minimumValue:M.options.minimumValue.zero,maximumValue:M.options.maximumValue.tenTrillions},floatNeg:{allowDecimalPadding:M.options.allowDecimalPadding.never,minimumValue:M.options.minimumValue.tenTrillions,maximumValue:M.options.maximumValue.zero},numeric:{digitGroupSeparator:M.options.digitGroupSeparator.noSeparator,decimalCharacter:M.options.decimalCharacter.dot,currencySymbol:M.options.currencySymbol.none},numericPos:{digitGroupSeparator:M.options.digitGroupSeparator.noSeparator,decimalCharacter:M.options.decimalCharacter.dot,currencySymbol:M.options.currencySymbol.none,minimumValue:M.options.minimumValue.zero,maximumValue:M.options.maximumValue.tenTrillions},numericNeg:{digitGroupSeparator:M.options.digitGroupSeparator.noSeparator,decimalCharacter:M.options.decimalCharacter.dot,currencySymbol:M.options.currencySymbol.none,minimumValue:M.options.minimumValue.tenTrillions,maximumValue:M.options.maximumValue.zero}},Object.getOwnPropertyNames(M.predefinedOptions).forEach((function(e){Object.freeze(M.predefinedOptions[e])})),Object.freeze(M.predefinedOptions),Object.defineProperty(M,"predefinedOptions",{configurable:!1,writable:!1});const ue=M;return t=t.default})(),"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.AutoNumeric=t():e.AutoNumeric=t();
