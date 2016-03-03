var app =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const animate = __webpack_require__(2);

	const diaryApp = angular.module('diary', ['ngAnimate']);

	diaryApp.component('menu', __webpack_require__(4));

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	module.exports = 'ngAnimate';


/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * @license AngularJS v1.5.0
	 * (c) 2010-2016 Google, Inc. http://angularjs.org
	 * License: MIT
	 */
	(function(window, angular, undefined) {'use strict';

	/* jshint ignore:start */
	var noop        = angular.noop;
	var copy        = angular.copy;
	var extend      = angular.extend;
	var jqLite      = angular.element;
	var forEach     = angular.forEach;
	var isArray     = angular.isArray;
	var isString    = angular.isString;
	var isObject    = angular.isObject;
	var isUndefined = angular.isUndefined;
	var isDefined   = angular.isDefined;
	var isFunction  = angular.isFunction;
	var isElement   = angular.isElement;

	var ELEMENT_NODE = 1;
	var COMMENT_NODE = 8;

	var ADD_CLASS_SUFFIX = '-add';
	var REMOVE_CLASS_SUFFIX = '-remove';
	var EVENT_CLASS_PREFIX = 'ng-';
	var ACTIVE_CLASS_SUFFIX = '-active';
	var PREPARE_CLASS_SUFFIX = '-prepare';

	var NG_ANIMATE_CLASSNAME = 'ng-animate';
	var NG_ANIMATE_CHILDREN_DATA = '$$ngAnimateChildren';

	// Detect proper transitionend/animationend event names.
	var CSS_PREFIX = '', TRANSITION_PROP, TRANSITIONEND_EVENT, ANIMATION_PROP, ANIMATIONEND_EVENT;

	// If unprefixed events are not supported but webkit-prefixed are, use the latter.
	// Otherwise, just use W3C names, browsers not supporting them at all will just ignore them.
	// Note: Chrome implements `window.onwebkitanimationend` and doesn't implement `window.onanimationend`
	// but at the same time dispatches the `animationend` event and not `webkitAnimationEnd`.
	// Register both events in case `window.onanimationend` is not supported because of that,
	// do the same for `transitionend` as Safari is likely to exhibit similar behavior.
	// Also, the only modern browser that uses vendor prefixes for transitions/keyframes is webkit
	// therefore there is no reason to test anymore for other vendor prefixes:
	// http://caniuse.com/#search=transition
	if (isUndefined(window.ontransitionend) && isDefined(window.onwebkittransitionend)) {
	  CSS_PREFIX = '-webkit-';
	  TRANSITION_PROP = 'WebkitTransition';
	  TRANSITIONEND_EVENT = 'webkitTransitionEnd transitionend';
	} else {
	  TRANSITION_PROP = 'transition';
	  TRANSITIONEND_EVENT = 'transitionend';
	}

	if (isUndefined(window.onanimationend) && isDefined(window.onwebkitanimationend)) {
	  CSS_PREFIX = '-webkit-';
	  ANIMATION_PROP = 'WebkitAnimation';
	  ANIMATIONEND_EVENT = 'webkitAnimationEnd animationend';
	} else {
	  ANIMATION_PROP = 'animation';
	  ANIMATIONEND_EVENT = 'animationend';
	}

	var DURATION_KEY = 'Duration';
	var PROPERTY_KEY = 'Property';
	var DELAY_KEY = 'Delay';
	var TIMING_KEY = 'TimingFunction';
	var ANIMATION_ITERATION_COUNT_KEY = 'IterationCount';
	var ANIMATION_PLAYSTATE_KEY = 'PlayState';
	var SAFE_FAST_FORWARD_DURATION_VALUE = 9999;

	var ANIMATION_DELAY_PROP = ANIMATION_PROP + DELAY_KEY;
	var ANIMATION_DURATION_PROP = ANIMATION_PROP + DURATION_KEY;
	var TRANSITION_DELAY_PROP = TRANSITION_PROP + DELAY_KEY;
	var TRANSITION_DURATION_PROP = TRANSITION_PROP + DURATION_KEY;

	var isPromiseLike = function(p) {
	  return p && p.then ? true : false;
	};

	var ngMinErr = angular.$$minErr('ng');
	function assertArg(arg, name, reason) {
	  if (!arg) {
	    throw ngMinErr('areq', "Argument '{0}' is {1}", (name || '?'), (reason || "required"));
	  }
	  return arg;
	}

	function mergeClasses(a,b) {
	  if (!a && !b) return '';
	  if (!a) return b;
	  if (!b) return a;
	  if (isArray(a)) a = a.join(' ');
	  if (isArray(b)) b = b.join(' ');
	  return a + ' ' + b;
	}

	function packageStyles(options) {
	  var styles = {};
	  if (options && (options.to || options.from)) {
	    styles.to = options.to;
	    styles.from = options.from;
	  }
	  return styles;
	}

	function pendClasses(classes, fix, isPrefix) {
	  var className = '';
	  classes = isArray(classes)
	      ? classes
	      : classes && isString(classes) && classes.length
	          ? classes.split(/\s+/)
	          : [];
	  forEach(classes, function(klass, i) {
	    if (klass && klass.length > 0) {
	      className += (i > 0) ? ' ' : '';
	      className += isPrefix ? fix + klass
	                            : klass + fix;
	    }
	  });
	  return className;
	}

	function removeFromArray(arr, val) {
	  var index = arr.indexOf(val);
	  if (val >= 0) {
	    arr.splice(index, 1);
	  }
	}

	function stripCommentsFromElement(element) {
	  if (element instanceof jqLite) {
	    switch (element.length) {
	      case 0:
	        return [];
	        break;

	      case 1:
	        // there is no point of stripping anything if the element
	        // is the only element within the jqLite wrapper.
	        // (it's important that we retain the element instance.)
	        if (element[0].nodeType === ELEMENT_NODE) {
	          return element;
	        }
	        break;

	      default:
	        return jqLite(extractElementNode(element));
	        break;
	    }
	  }

	  if (element.nodeType === ELEMENT_NODE) {
	    return jqLite(element);
	  }
	}

	function extractElementNode(element) {
	  if (!element[0]) return element;
	  for (var i = 0; i < element.length; i++) {
	    var elm = element[i];
	    if (elm.nodeType == ELEMENT_NODE) {
	      return elm;
	    }
	  }
	}

	function $$addClass($$jqLite, element, className) {
	  forEach(element, function(elm) {
	    $$jqLite.addClass(elm, className);
	  });
	}

	function $$removeClass($$jqLite, element, className) {
	  forEach(element, function(elm) {
	    $$jqLite.removeClass(elm, className);
	  });
	}

	function applyAnimationClassesFactory($$jqLite) {
	  return function(element, options) {
	    if (options.addClass) {
	      $$addClass($$jqLite, element, options.addClass);
	      options.addClass = null;
	    }
	    if (options.removeClass) {
	      $$removeClass($$jqLite, element, options.removeClass);
	      options.removeClass = null;
	    }
	  }
	}

	function prepareAnimationOptions(options) {
	  options = options || {};
	  if (!options.$$prepared) {
	    var domOperation = options.domOperation || noop;
	    options.domOperation = function() {
	      options.$$domOperationFired = true;
	      domOperation();
	      domOperation = noop;
	    };
	    options.$$prepared = true;
	  }
	  return options;
	}

	function applyAnimationStyles(element, options) {
	  applyAnimationFromStyles(element, options);
	  applyAnimationToStyles(element, options);
	}

	function applyAnimationFromStyles(element, options) {
	  if (options.from) {
	    element.css(options.from);
	    options.from = null;
	  }
	}

	function applyAnimationToStyles(element, options) {
	  if (options.to) {
	    element.css(options.to);
	    options.to = null;
	  }
	}

	function mergeAnimationDetails(element, oldAnimation, newAnimation) {
	  var target = oldAnimation.options || {};
	  var newOptions = newAnimation.options || {};

	  var toAdd = (target.addClass || '') + ' ' + (newOptions.addClass || '');
	  var toRemove = (target.removeClass || '') + ' ' + (newOptions.removeClass || '');
	  var classes = resolveElementClasses(element.attr('class'), toAdd, toRemove);

	  if (newOptions.preparationClasses) {
	    target.preparationClasses = concatWithSpace(newOptions.preparationClasses, target.preparationClasses);
	    delete newOptions.preparationClasses;
	  }

	  // noop is basically when there is no callback; otherwise something has been set
	  var realDomOperation = target.domOperation !== noop ? target.domOperation : null;

	  extend(target, newOptions);

	  // TODO(matsko or sreeramu): proper fix is to maintain all animation callback in array and call at last,but now only leave has the callback so no issue with this.
	  if (realDomOperation) {
	    target.domOperation = realDomOperation;
	  }

	  if (classes.addClass) {
	    target.addClass = classes.addClass;
	  } else {
	    target.addClass = null;
	  }

	  if (classes.removeClass) {
	    target.removeClass = classes.removeClass;
	  } else {
	    target.removeClass = null;
	  }

	  oldAnimation.addClass = target.addClass;
	  oldAnimation.removeClass = target.removeClass;

	  return target;
	}

	function resolveElementClasses(existing, toAdd, toRemove) {
	  var ADD_CLASS = 1;
	  var REMOVE_CLASS = -1;

	  var flags = {};
	  existing = splitClassesToLookup(existing);

	  toAdd = splitClassesToLookup(toAdd);
	  forEach(toAdd, function(value, key) {
	    flags[key] = ADD_CLASS;
	  });

	  toRemove = splitClassesToLookup(toRemove);
	  forEach(toRemove, function(value, key) {
	    flags[key] = flags[key] === ADD_CLASS ? null : REMOVE_CLASS;
	  });

	  var classes = {
	    addClass: '',
	    removeClass: ''
	  };

	  forEach(flags, function(val, klass) {
	    var prop, allow;
	    if (val === ADD_CLASS) {
	      prop = 'addClass';
	      allow = !existing[klass];
	    } else if (val === REMOVE_CLASS) {
	      prop = 'removeClass';
	      allow = existing[klass];
	    }
	    if (allow) {
	      if (classes[prop].length) {
	        classes[prop] += ' ';
	      }
	      classes[prop] += klass;
	    }
	  });

	  function splitClassesToLookup(classes) {
	    if (isString(classes)) {
	      classes = classes.split(' ');
	    }

	    var obj = {};
	    forEach(classes, function(klass) {
	      // sometimes the split leaves empty string values
	      // incase extra spaces were applied to the options
	      if (klass.length) {
	        obj[klass] = true;
	      }
	    });
	    return obj;
	  }

	  return classes;
	}

	function getDomNode(element) {
	  return (element instanceof angular.element) ? element[0] : element;
	}

	function applyGeneratedPreparationClasses(element, event, options) {
	  var classes = '';
	  if (event) {
	    classes = pendClasses(event, EVENT_CLASS_PREFIX, true);
	  }
	  if (options.addClass) {
	    classes = concatWithSpace(classes, pendClasses(options.addClass, ADD_CLASS_SUFFIX));
	  }
	  if (options.removeClass) {
	    classes = concatWithSpace(classes, pendClasses(options.removeClass, REMOVE_CLASS_SUFFIX));
	  }
	  if (classes.length) {
	    options.preparationClasses = classes;
	    element.addClass(classes);
	  }
	}

	function clearGeneratedClasses(element, options) {
	  if (options.preparationClasses) {
	    element.removeClass(options.preparationClasses);
	    options.preparationClasses = null;
	  }
	  if (options.activeClasses) {
	    element.removeClass(options.activeClasses);
	    options.activeClasses = null;
	  }
	}

	function blockTransitions(node, duration) {
	  // we use a negative delay value since it performs blocking
	  // yet it doesn't kill any existing transitions running on the
	  // same element which makes this safe for class-based animations
	  var value = duration ? '-' + duration + 's' : '';
	  applyInlineStyle(node, [TRANSITION_DELAY_PROP, value]);
	  return [TRANSITION_DELAY_PROP, value];
	}

	function blockKeyframeAnimations(node, applyBlock) {
	  var value = applyBlock ? 'paused' : '';
	  var key = ANIMATION_PROP + ANIMATION_PLAYSTATE_KEY;
	  applyInlineStyle(node, [key, value]);
	  return [key, value];
	}

	function applyInlineStyle(node, styleTuple) {
	  var prop = styleTuple[0];
	  var value = styleTuple[1];
	  node.style[prop] = value;
	}

	function concatWithSpace(a,b) {
	  if (!a) return b;
	  if (!b) return a;
	  return a + ' ' + b;
	}

	var $$rAFSchedulerFactory = ['$$rAF', function($$rAF) {
	  var queue, cancelFn;

	  function scheduler(tasks) {
	    // we make a copy since RAFScheduler mutates the state
	    // of the passed in array variable and this would be difficult
	    // to track down on the outside code
	    queue = queue.concat(tasks);
	    nextTick();
	  }

	  queue = scheduler.queue = [];

	  /* waitUntilQuiet does two things:
	   * 1. It will run the FINAL `fn` value only when an uncanceled RAF has passed through
	   * 2. It will delay the next wave of tasks from running until the quiet `fn` has run.
	   *
	   * The motivation here is that animation code can request more time from the scheduler
	   * before the next wave runs. This allows for certain DOM properties such as classes to
	   * be resolved in time for the next animation to run.
	   */
	  scheduler.waitUntilQuiet = function(fn) {
	    if (cancelFn) cancelFn();

	    cancelFn = $$rAF(function() {
	      cancelFn = null;
	      fn();
	      nextTick();
	    });
	  };

	  return scheduler;

	  function nextTick() {
	    if (!queue.length) return;

	    var items = queue.shift();
	    for (var i = 0; i < items.length; i++) {
	      items[i]();
	    }

	    if (!cancelFn) {
	      $$rAF(function() {
	        if (!cancelFn) nextTick();
	      });
	    }
	  }
	}];

	/**
	 * @ngdoc directive
	 * @name ngAnimateChildren
	 * @restrict AE
	 * @element ANY
	 *
	 * @description
	 *
	 * ngAnimateChildren allows you to specify that children of this element should animate even if any
	 * of the children's parents are currently animating. By default, when an element has an active `enter`, `leave`, or `move`
	 * (structural) animation, child elements that also have an active structural animation are not animated.
	 *
	 * Note that even if `ngAnimteChildren` is set, no child animations will run when the parent element is removed from the DOM (`leave` animation).
	 *
	 *
	 * @param {string} ngAnimateChildren If the value is empty, `true` or `on`,
	 *     then child animations are allowed. If the value is `false`, child animations are not allowed.
	 *
	 * @example
	 * <example module="ngAnimateChildren" name="ngAnimateChildren" deps="angular-animate.js" animations="true">
	     <file name="index.html">
	       <div ng-controller="mainController as main">
	         <label>Show container? <input type="checkbox" ng-model="main.enterElement" /></label>
	         <label>Animate children? <input type="checkbox" ng-model="main.animateChildren" /></label>
	         <hr>
	         <div ng-animate-children="{{main.animateChildren}}">
	           <div ng-if="main.enterElement" class="container">
	             List of items:
	             <div ng-repeat="item in [0, 1, 2, 3]" class="item">Item {{item}}</div>
	           </div>
	         </div>
	       </div>
	     </file>
	     <file name="animations.css">

	      .container.ng-enter,
	      .container.ng-leave {
	        transition: all ease 1.5s;
	      }

	      .container.ng-enter,
	      .container.ng-leave-active {
	        opacity: 0;
	      }

	      .container.ng-leave,
	      .container.ng-enter-active {
	        opacity: 1;
	      }

	      .item {
	        background: firebrick;
	        color: #FFF;
	        margin-bottom: 10px;
	      }

	      .item.ng-enter,
	      .item.ng-leave {
	        transition: transform 1.5s ease;
	      }

	      .item.ng-enter {
	        transform: translateX(50px);
	      }

	      .item.ng-enter-active {
	        transform: translateX(0);
	      }
	    </file>
	    <file name="script.js">
	      angular.module('ngAnimateChildren', ['ngAnimate'])
	        .controller('mainController', function() {
	          this.animateChildren = false;
	          this.enterElement = false;
	        });
	    </file>
	  </example>
	 */
	var $$AnimateChildrenDirective = ['$interpolate', function($interpolate) {
	  return {
	    link: function(scope, element, attrs) {
	      var val = attrs.ngAnimateChildren;
	      if (angular.isString(val) && val.length === 0) { //empty attribute
	        element.data(NG_ANIMATE_CHILDREN_DATA, true);
	      } else {
	        // Interpolate and set the value, so that it is available to
	        // animations that run right after compilation
	        setData($interpolate(val)(scope));
	        attrs.$observe('ngAnimateChildren', setData);
	      }

	      function setData(value) {
	        value = value === 'on' || value === 'true';
	        element.data(NG_ANIMATE_CHILDREN_DATA, value);
	      }
	    }
	  };
	}];

	var ANIMATE_TIMER_KEY = '$$animateCss';

	/**
	 * @ngdoc service
	 * @name $animateCss
	 * @kind object
	 *
	 * @description
	 * The `$animateCss` service is a useful utility to trigger customized CSS-based transitions/keyframes
	 * from a JavaScript-based animation or directly from a directive. The purpose of `$animateCss` is NOT
	 * to side-step how `$animate` and ngAnimate work, but the goal is to allow pre-existing animations or
	 * directives to create more complex animations that can be purely driven using CSS code.
	 *
	 * Note that only browsers that support CSS transitions and/or keyframe animations are capable of
	 * rendering animations triggered via `$animateCss` (bad news for IE9 and lower).
	 *
	 * ## Usage
	 * Once again, `$animateCss` is designed to be used inside of a registered JavaScript animation that
	 * is powered by ngAnimate. It is possible to use `$animateCss` directly inside of a directive, however,
	 * any automatic control over cancelling animations and/or preventing animations from being run on
	 * child elements will not be handled by Angular. For this to work as expected, please use `$animate` to
	 * trigger the animation and then setup a JavaScript animation that injects `$animateCss` to trigger
	 * the CSS animation.
	 *
	 * The example below shows how we can create a folding animation on an element using `ng-if`:
	 *
	 * ```html
	 * <!-- notice the `fold-animation` CSS class -->
	 * <div ng-if="onOff" class="fold-animation">
	 *   This element will go BOOM
	 * </div>
	 * <button ng-click="onOff=true">Fold In</button>
	 * ```
	 *
	 * Now we create the **JavaScript animation** that will trigger the CSS transition:
	 *
	 * ```js
	 * ngModule.animation('.fold-animation', ['$animateCss', function($animateCss) {
	 *   return {
	 *     enter: function(element, doneFn) {
	 *       var height = element[0].offsetHeight;
	 *       return $animateCss(element, {
	 *         from: { height:'0px' },
	 *         to: { height:height + 'px' },
	 *         duration: 1 // one second
	 *       });
	 *     }
	 *   }
	 * }]);
	 * ```
	 *
	 * ## More Advanced Uses
	 *
	 * `$animateCss` is the underlying code that ngAnimate uses to power **CSS-based animations** behind the scenes. Therefore CSS hooks
	 * like `.ng-EVENT`, `.ng-EVENT-active`, `.ng-EVENT-stagger` are all features that can be triggered using `$animateCss` via JavaScript code.
	 *
	 * This also means that just about any combination of adding classes, removing classes, setting styles, dynamically setting a keyframe animation,
	 * applying a hardcoded duration or delay value, changing the animation easing or applying a stagger animation are all options that work with
	 * `$animateCss`. The service itself is smart enough to figure out the combination of options and examine the element styling properties in order
	 * to provide a working animation that will run in CSS.
	 *
	 * The example below showcases a more advanced version of the `.fold-animation` from the example above:
	 *
	 * ```js
	 * ngModule.animation('.fold-animation', ['$animateCss', function($animateCss) {
	 *   return {
	 *     enter: function(element, doneFn) {
	 *       var height = element[0].offsetHeight;
	 *       return $animateCss(element, {
	 *         addClass: 'red large-text pulse-twice',
	 *         easing: 'ease-out',
	 *         from: { height:'0px' },
	 *         to: { height:height + 'px' },
	 *         duration: 1 // one second
	 *       });
	 *     }
	 *   }
	 * }]);
	 * ```
	 *
	 * Since we're adding/removing CSS classes then the CSS transition will also pick those up:
	 *
	 * ```css
	 * /&#42; since a hardcoded duration value of 1 was provided in the JavaScript animation code,
	 * the CSS classes below will be transitioned despite them being defined as regular CSS classes &#42;/
	 * .red { background:red; }
	 * .large-text { font-size:20px; }
	 *
	 * /&#42; we can also use a keyframe animation and $animateCss will make it work alongside the transition &#42;/
	 * .pulse-twice {
	 *   animation: 0.5s pulse linear 2;
	 *   -webkit-animation: 0.5s pulse linear 2;
	 * }
	 *
	 * @keyframes pulse {
	 *   from { transform: scale(0.5); }
	 *   to { transform: scale(1.5); }
	 * }
	 *
	 * @-webkit-keyframes pulse {
	 *   from { -webkit-transform: scale(0.5); }
	 *   to { -webkit-transform: scale(1.5); }
	 * }
	 * ```
	 *
	 * Given this complex combination of CSS classes, styles and options, `$animateCss` will figure everything out and make the animation happen.
	 *
	 * ## How the Options are handled
	 *
	 * `$animateCss` is very versatile and intelligent when it comes to figuring out what configurations to apply to the element to ensure the animation
	 * works with the options provided. Say for example we were adding a class that contained a keyframe value and we wanted to also animate some inline
	 * styles using the `from` and `to` properties.
	 *
	 * ```js
	 * var animator = $animateCss(element, {
	 *   from: { background:'red' },
	 *   to: { background:'blue' }
	 * });
	 * animator.start();
	 * ```
	 *
	 * ```css
	 * .rotating-animation {
	 *   animation:0.5s rotate linear;
	 *   -webkit-animation:0.5s rotate linear;
	 * }
	 *
	 * @keyframes rotate {
	 *   from { transform: rotate(0deg); }
	 *   to { transform: rotate(360deg); }
	 * }
	 *
	 * @-webkit-keyframes rotate {
	 *   from { -webkit-transform: rotate(0deg); }
	 *   to { -webkit-transform: rotate(360deg); }
	 * }
	 * ```
	 *
	 * The missing pieces here are that we do not have a transition set (within the CSS code nor within the `$animateCss` options) and the duration of the animation is
	 * going to be detected from what the keyframe styles on the CSS class are. In this event, `$animateCss` will automatically create an inline transition
	 * style matching the duration detected from the keyframe style (which is present in the CSS class that is being added) and then prepare both the transition
	 * and keyframe animations to run in parallel on the element. Then when the animation is underway the provided `from` and `to` CSS styles will be applied
	 * and spread across the transition and keyframe animation.
	 *
	 * ## What is returned
	 *
	 * `$animateCss` works in two stages: a preparation phase and an animation phase. Therefore when `$animateCss` is first called it will NOT actually
	 * start the animation. All that is going on here is that the element is being prepared for the animation (which means that the generated CSS classes are
	 * added and removed on the element). Once `$animateCss` is called it will return an object with the following properties:
	 *
	 * ```js
	 * var animator = $animateCss(element, { ... });
	 * ```
	 *
	 * Now what do the contents of our `animator` variable look like:
	 *
	 * ```js
	 * {
	 *   // starts the animation
	 *   start: Function,
	 *
	 *   // ends (aborts) the animation
	 *   end: Function
	 * }
	 * ```
	 *
	 * To actually start the animation we need to run `animation.start()` which will then return a promise that we can hook into to detect when the animation ends.
	 * If we choose not to run the animation then we MUST run `animation.end()` to perform a cleanup on the element (since some CSS classes and styles may have been
	 * applied to the element during the preparation phase). Note that all other properties such as duration, delay, transitions and keyframes are just properties
	 * and that changing them will not reconfigure the parameters of the animation.
	 *
	 * ### runner.done() vs runner.then()
	 * It is documented that `animation.start()` will return a promise object and this is true, however, there is also an additional method available on the
	 * runner called `.done(callbackFn)`. The done method works the same as `.finally(callbackFn)`, however, it does **not trigger a digest to occur**.
	 * Therefore, for performance reasons, it's always best to use `runner.done(callback)` instead of `runner.then()`, `runner.catch()` or `runner.finally()`
	 * unless you really need a digest to kick off afterwards.
	 *
	 * Keep in mind that, to make this easier, ngAnimate has tweaked the JS animations API to recognize when a runner instance is returned from $animateCss
	 * (so there is no need to call `runner.done(doneFn)` inside of your JavaScript animation code).
	 * Check the {@link ngAnimate.$animateCss#usage animation code above} to see how this works.
	 *
	 * @param {DOMElement} element the element that will be animated
	 * @param {object} options the animation-related options that will be applied during the animation
	 *
	 * * `event` - The DOM event (e.g. enter, leave, move). When used, a generated CSS class of `ng-EVENT` and `ng-EVENT-active` will be applied
	 * to the element during the animation. Multiple events can be provided when spaces are used as a separator. (Note that this will not perform any DOM operation.)
	 * * `structural` - Indicates that the `ng-` prefix will be added to the event class. Setting to `false` or omitting will turn `ng-EVENT` and
	 * `ng-EVENT-active` in `EVENT` and `EVENT-active`. Unused if `event` is omitted.
	 * * `easing` - The CSS easing value that will be applied to the transition or keyframe animation (or both).
	 * * `transitionStyle` - The raw CSS transition style that will be used (e.g. `1s linear all`).
	 * * `keyframeStyle` - The raw CSS keyframe animation style that will be used (e.g. `1s my_animation linear`).
	 * * `from` - The starting CSS styles (a key/value object) that will be applied at the start of the animation.
	 * * `to` - The ending CSS styles (a key/value object) that will be applied across the animation via a CSS transition.
	 * * `addClass` - A space separated list of CSS classes that will be added to the element and spread across the animation.
	 * * `removeClass` - A space separated list of CSS classes that will be removed from the element and spread across the animation.
	 * * `duration` - A number value representing the total duration of the transition and/or keyframe (note that a value of 1 is 1000ms). If a value of `0`
	 * is provided then the animation will be skipped entirely.
	 * * `delay` - A number value representing the total delay of the transition and/or keyframe (note that a value of 1 is 1000ms). If a value of `true` is
	 * used then whatever delay value is detected from the CSS classes will be mirrored on the elements styles (e.g. by setting delay true then the style value
	 * of the element will be `transition-delay: DETECTED_VALUE`). Using `true` is useful when you want the CSS classes and inline styles to all share the same
	 * CSS delay value.
	 * * `stagger` - A numeric time value representing the delay between successively animated elements
	 * ({@link ngAnimate#css-staggering-animations Click here to learn how CSS-based staggering works in ngAnimate.})
	 * * `staggerIndex` - The numeric index representing the stagger item (e.g. a value of 5 is equal to the sixth item in the stagger; therefore when a
	 *   `stagger` option value of `0.1` is used then there will be a stagger delay of `600ms`)
	 * * `applyClassesEarly` - Whether or not the classes being added or removed will be used when detecting the animation. This is set by `$animate` when enter/leave/move animations are fired to ensure that the CSS classes are resolved in time. (Note that this will prevent any transitions from occurring on the classes being added and removed.)
	 * * `cleanupStyles` - Whether or not the provided `from` and `to` styles will be removed once
	 *    the animation is closed. This is useful for when the styles are used purely for the sake of
	 *    the animation and do not have a lasting visual effect on the element (e.g. a collapse and open animation).
	 *    By default this value is set to `false`.
	 *
	 * @return {object} an object with start and end methods and details about the animation.
	 *
	 * * `start` - The method to start the animation. This will return a `Promise` when called.
	 * * `end` - This method will cancel the animation and remove all applied CSS classes and styles.
	 */
	var ONE_SECOND = 1000;
	var BASE_TEN = 10;

	var ELAPSED_TIME_MAX_DECIMAL_PLACES = 3;
	var CLOSING_TIME_BUFFER = 1.5;

	var DETECT_CSS_PROPERTIES = {
	  transitionDuration:      TRANSITION_DURATION_PROP,
	  transitionDelay:         TRANSITION_DELAY_PROP,
	  transitionProperty:      TRANSITION_PROP + PROPERTY_KEY,
	  animationDuration:       ANIMATION_DURATION_PROP,
	  animationDelay:          ANIMATION_DELAY_PROP,
	  animationIterationCount: ANIMATION_PROP + ANIMATION_ITERATION_COUNT_KEY
	};

	var DETECT_STAGGER_CSS_PROPERTIES = {
	  transitionDuration:      TRANSITION_DURATION_PROP,
	  transitionDelay:         TRANSITION_DELAY_PROP,
	  animationDuration:       ANIMATION_DURATION_PROP,
	  animationDelay:          ANIMATION_DELAY_PROP
	};

	function getCssKeyframeDurationStyle(duration) {
	  return [ANIMATION_DURATION_PROP, duration + 's'];
	}

	function getCssDelayStyle(delay, isKeyframeAnimation) {
	  var prop = isKeyframeAnimation ? ANIMATION_DELAY_PROP : TRANSITION_DELAY_PROP;
	  return [prop, delay + 's'];
	}

	function computeCssStyles($window, element, properties) {
	  var styles = Object.create(null);
	  var detectedStyles = $window.getComputedStyle(element) || {};
	  forEach(properties, function(formalStyleName, actualStyleName) {
	    var val = detectedStyles[formalStyleName];
	    if (val) {
	      var c = val.charAt(0);

	      // only numerical-based values have a negative sign or digit as the first value
	      if (c === '-' || c === '+' || c >= 0) {
	        val = parseMaxTime(val);
	      }

	      // by setting this to null in the event that the delay is not set or is set directly as 0
	      // then we can still allow for negative values to be used later on and not mistake this
	      // value for being greater than any other negative value.
	      if (val === 0) {
	        val = null;
	      }
	      styles[actualStyleName] = val;
	    }
	  });

	  return styles;
	}

	function parseMaxTime(str) {
	  var maxValue = 0;
	  var values = str.split(/\s*,\s*/);
	  forEach(values, function(value) {
	    // it's always safe to consider only second values and omit `ms` values since
	    // getComputedStyle will always handle the conversion for us
	    if (value.charAt(value.length - 1) == 's') {
	      value = value.substring(0, value.length - 1);
	    }
	    value = parseFloat(value) || 0;
	    maxValue = maxValue ? Math.max(value, maxValue) : value;
	  });
	  return maxValue;
	}

	function truthyTimingValue(val) {
	  return val === 0 || val != null;
	}

	function getCssTransitionDurationStyle(duration, applyOnlyDuration) {
	  var style = TRANSITION_PROP;
	  var value = duration + 's';
	  if (applyOnlyDuration) {
	    style += DURATION_KEY;
	  } else {
	    value += ' linear all';
	  }
	  return [style, value];
	}

	function createLocalCacheLookup() {
	  var cache = Object.create(null);
	  return {
	    flush: function() {
	      cache = Object.create(null);
	    },

	    count: function(key) {
	      var entry = cache[key];
	      return entry ? entry.total : 0;
	    },

	    get: function(key) {
	      var entry = cache[key];
	      return entry && entry.value;
	    },

	    put: function(key, value) {
	      if (!cache[key]) {
	        cache[key] = { total: 1, value: value };
	      } else {
	        cache[key].total++;
	      }
	    }
	  };
	}

	// we do not reassign an already present style value since
	// if we detect the style property value again we may be
	// detecting styles that were added via the `from` styles.
	// We make use of `isDefined` here since an empty string
	// or null value (which is what getPropertyValue will return
	// for a non-existing style) will still be marked as a valid
	// value for the style (a falsy value implies that the style
	// is to be removed at the end of the animation). If we had a simple
	// "OR" statement then it would not be enough to catch that.
	function registerRestorableStyles(backup, node, properties) {
	  forEach(properties, function(prop) {
	    backup[prop] = isDefined(backup[prop])
	        ? backup[prop]
	        : node.style.getPropertyValue(prop);
	  });
	}

	var $AnimateCssProvider = ['$animateProvider', function($animateProvider) {
	  var gcsLookup = createLocalCacheLookup();
	  var gcsStaggerLookup = createLocalCacheLookup();

	  this.$get = ['$window', '$$jqLite', '$$AnimateRunner', '$timeout',
	               '$$forceReflow', '$sniffer', '$$rAFScheduler', '$$animateQueue',
	       function($window,   $$jqLite,   $$AnimateRunner,   $timeout,
	                $$forceReflow,   $sniffer,   $$rAFScheduler, $$animateQueue) {

	    var applyAnimationClasses = applyAnimationClassesFactory($$jqLite);

	    var parentCounter = 0;
	    function gcsHashFn(node, extraClasses) {
	      var KEY = "$$ngAnimateParentKey";
	      var parentNode = node.parentNode;
	      var parentID = parentNode[KEY] || (parentNode[KEY] = ++parentCounter);
	      return parentID + '-' + node.getAttribute('class') + '-' + extraClasses;
	    }

	    function computeCachedCssStyles(node, className, cacheKey, properties) {
	      var timings = gcsLookup.get(cacheKey);

	      if (!timings) {
	        timings = computeCssStyles($window, node, properties);
	        if (timings.animationIterationCount === 'infinite') {
	          timings.animationIterationCount = 1;
	        }
	      }

	      // we keep putting this in multiple times even though the value and the cacheKey are the same
	      // because we're keeping an internal tally of how many duplicate animations are detected.
	      gcsLookup.put(cacheKey, timings);
	      return timings;
	    }

	    function computeCachedCssStaggerStyles(node, className, cacheKey, properties) {
	      var stagger;

	      // if we have one or more existing matches of matching elements
	      // containing the same parent + CSS styles (which is how cacheKey works)
	      // then staggering is possible
	      if (gcsLookup.count(cacheKey) > 0) {
	        stagger = gcsStaggerLookup.get(cacheKey);

	        if (!stagger) {
	          var staggerClassName = pendClasses(className, '-stagger');

	          $$jqLite.addClass(node, staggerClassName);

	          stagger = computeCssStyles($window, node, properties);

	          // force the conversion of a null value to zero incase not set
	          stagger.animationDuration = Math.max(stagger.animationDuration, 0);
	          stagger.transitionDuration = Math.max(stagger.transitionDuration, 0);

	          $$jqLite.removeClass(node, staggerClassName);

	          gcsStaggerLookup.put(cacheKey, stagger);
	        }
	      }

	      return stagger || {};
	    }

	    var cancelLastRAFRequest;
	    var rafWaitQueue = [];
	    function waitUntilQuiet(callback) {
	      rafWaitQueue.push(callback);
	      $$rAFScheduler.waitUntilQuiet(function() {
	        gcsLookup.flush();
	        gcsStaggerLookup.flush();

	        // DO NOT REMOVE THIS LINE OR REFACTOR OUT THE `pageWidth` variable.
	        // PLEASE EXAMINE THE `$$forceReflow` service to understand why.
	        var pageWidth = $$forceReflow();

	        // we use a for loop to ensure that if the queue is changed
	        // during this looping then it will consider new requests
	        for (var i = 0; i < rafWaitQueue.length; i++) {
	          rafWaitQueue[i](pageWidth);
	        }
	        rafWaitQueue.length = 0;
	      });
	    }

	    function computeTimings(node, className, cacheKey) {
	      var timings = computeCachedCssStyles(node, className, cacheKey, DETECT_CSS_PROPERTIES);
	      var aD = timings.animationDelay;
	      var tD = timings.transitionDelay;
	      timings.maxDelay = aD && tD
	          ? Math.max(aD, tD)
	          : (aD || tD);
	      timings.maxDuration = Math.max(
	          timings.animationDuration * timings.animationIterationCount,
	          timings.transitionDuration);

	      return timings;
	    }

	    return function init(element, initialOptions) {
	      // all of the animation functions should create
	      // a copy of the options data, however, if a
	      // parent service has already created a copy then
	      // we should stick to using that
	      var options = initialOptions || {};
	      if (!options.$$prepared) {
	        options = prepareAnimationOptions(copy(options));
	      }

	      var restoreStyles = {};
	      var node = getDomNode(element);
	      if (!node
	          || !node.parentNode
	          || !$$animateQueue.enabled()) {
	        return closeAndReturnNoopAnimator();
	      }

	      var temporaryStyles = [];
	      var classes = element.attr('class');
	      var styles = packageStyles(options);
	      var animationClosed;
	      var animationPaused;
	      var animationCompleted;
	      var runner;
	      var runnerHost;
	      var maxDelay;
	      var maxDelayTime;
	      var maxDuration;
	      var maxDurationTime;
	      var startTime;
	      var events = [];

	      if (options.duration === 0 || (!$sniffer.animations && !$sniffer.transitions)) {
	        return closeAndReturnNoopAnimator();
	      }

	      var method = options.event && isArray(options.event)
	            ? options.event.join(' ')
	            : options.event;

	      var isStructural = method && options.structural;
	      var structuralClassName = '';
	      var addRemoveClassName = '';

	      if (isStructural) {
	        structuralClassName = pendClasses(method, EVENT_CLASS_PREFIX, true);
	      } else if (method) {
	        structuralClassName = method;
	      }

	      if (options.addClass) {
	        addRemoveClassName += pendClasses(options.addClass, ADD_CLASS_SUFFIX);
	      }

	      if (options.removeClass) {
	        if (addRemoveClassName.length) {
	          addRemoveClassName += ' ';
	        }
	        addRemoveClassName += pendClasses(options.removeClass, REMOVE_CLASS_SUFFIX);
	      }

	      // there may be a situation where a structural animation is combined together
	      // with CSS classes that need to resolve before the animation is computed.
	      // However this means that there is no explicit CSS code to block the animation
	      // from happening (by setting 0s none in the class name). If this is the case
	      // we need to apply the classes before the first rAF so we know to continue if
	      // there actually is a detected transition or keyframe animation
	      if (options.applyClassesEarly && addRemoveClassName.length) {
	        applyAnimationClasses(element, options);
	      }

	      var preparationClasses = [structuralClassName, addRemoveClassName].join(' ').trim();
	      var fullClassName = classes + ' ' + preparationClasses;
	      var activeClasses = pendClasses(preparationClasses, ACTIVE_CLASS_SUFFIX);
	      var hasToStyles = styles.to && Object.keys(styles.to).length > 0;
	      var containsKeyframeAnimation = (options.keyframeStyle || '').length > 0;

	      // there is no way we can trigger an animation if no styles and
	      // no classes are being applied which would then trigger a transition,
	      // unless there a is raw keyframe value that is applied to the element.
	      if (!containsKeyframeAnimation
	           && !hasToStyles
	           && !preparationClasses) {
	        return closeAndReturnNoopAnimator();
	      }

	      var cacheKey, stagger;
	      if (options.stagger > 0) {
	        var staggerVal = parseFloat(options.stagger);
	        stagger = {
	          transitionDelay: staggerVal,
	          animationDelay: staggerVal,
	          transitionDuration: 0,
	          animationDuration: 0
	        };
	      } else {
	        cacheKey = gcsHashFn(node, fullClassName);
	        stagger = computeCachedCssStaggerStyles(node, preparationClasses, cacheKey, DETECT_STAGGER_CSS_PROPERTIES);
	      }

	      if (!options.$$skipPreparationClasses) {
	        $$jqLite.addClass(element, preparationClasses);
	      }

	      var applyOnlyDuration;

	      if (options.transitionStyle) {
	        var transitionStyle = [TRANSITION_PROP, options.transitionStyle];
	        applyInlineStyle(node, transitionStyle);
	        temporaryStyles.push(transitionStyle);
	      }

	      if (options.duration >= 0) {
	        applyOnlyDuration = node.style[TRANSITION_PROP].length > 0;
	        var durationStyle = getCssTransitionDurationStyle(options.duration, applyOnlyDuration);

	        // we set the duration so that it will be picked up by getComputedStyle later
	        applyInlineStyle(node, durationStyle);
	        temporaryStyles.push(durationStyle);
	      }

	      if (options.keyframeStyle) {
	        var keyframeStyle = [ANIMATION_PROP, options.keyframeStyle];
	        applyInlineStyle(node, keyframeStyle);
	        temporaryStyles.push(keyframeStyle);
	      }

	      var itemIndex = stagger
	          ? options.staggerIndex >= 0
	              ? options.staggerIndex
	              : gcsLookup.count(cacheKey)
	          : 0;

	      var isFirst = itemIndex === 0;

	      // this is a pre-emptive way of forcing the setup classes to be added and applied INSTANTLY
	      // without causing any combination of transitions to kick in. By adding a negative delay value
	      // it forces the setup class' transition to end immediately. We later then remove the negative
	      // transition delay to allow for the transition to naturally do it's thing. The beauty here is
	      // that if there is no transition defined then nothing will happen and this will also allow
	      // other transitions to be stacked on top of each other without any chopping them out.
	      if (isFirst && !options.skipBlocking) {
	        blockTransitions(node, SAFE_FAST_FORWARD_DURATION_VALUE);
	      }

	      var timings = computeTimings(node, fullClassName, cacheKey);
	      var relativeDelay = timings.maxDelay;
	      maxDelay = Math.max(relativeDelay, 0);
	      maxDuration = timings.maxDuration;

	      var flags = {};
	      flags.hasTransitions          = timings.transitionDuration > 0;
	      flags.hasAnimations           = timings.animationDuration > 0;
	      flags.hasTransitionAll        = flags.hasTransitions && timings.transitionProperty == 'all';
	      flags.applyTransitionDuration = hasToStyles && (
	                                        (flags.hasTransitions && !flags.hasTransitionAll)
	                                         || (flags.hasAnimations && !flags.hasTransitions));
	      flags.applyAnimationDuration  = options.duration && flags.hasAnimations;
	      flags.applyTransitionDelay    = truthyTimingValue(options.delay) && (flags.applyTransitionDuration || flags.hasTransitions);
	      flags.applyAnimationDelay     = truthyTimingValue(options.delay) && flags.hasAnimations;
	      flags.recalculateTimingStyles = addRemoveClassName.length > 0;

	      if (flags.applyTransitionDuration || flags.applyAnimationDuration) {
	        maxDuration = options.duration ? parseFloat(options.duration) : maxDuration;

	        if (flags.applyTransitionDuration) {
	          flags.hasTransitions = true;
	          timings.transitionDuration = maxDuration;
	          applyOnlyDuration = node.style[TRANSITION_PROP + PROPERTY_KEY].length > 0;
	          temporaryStyles.push(getCssTransitionDurationStyle(maxDuration, applyOnlyDuration));
	        }

	        if (flags.applyAnimationDuration) {
	          flags.hasAnimations = true;
	          timings.animationDuration = maxDuration;
	          temporaryStyles.push(getCssKeyframeDurationStyle(maxDuration));
	        }
	      }

	      if (maxDuration === 0 && !flags.recalculateTimingStyles) {
	        return closeAndReturnNoopAnimator();
	      }

	      if (options.delay != null) {
	        var delayStyle;
	        if (typeof options.delay !== "boolean") {
	          delayStyle = parseFloat(options.delay);
	          // number in options.delay means we have to recalculate the delay for the closing timeout
	          maxDelay = Math.max(delayStyle, 0);
	        }

	        if (flags.applyTransitionDelay) {
	          temporaryStyles.push(getCssDelayStyle(delayStyle));
	        }

	        if (flags.applyAnimationDelay) {
	          temporaryStyles.push(getCssDelayStyle(delayStyle, true));
	        }
	      }

	      // we need to recalculate the delay value since we used a pre-emptive negative
	      // delay value and the delay value is required for the final event checking. This
	      // property will ensure that this will happen after the RAF phase has passed.
	      if (options.duration == null && timings.transitionDuration > 0) {
	        flags.recalculateTimingStyles = flags.recalculateTimingStyles || isFirst;
	      }

	      maxDelayTime = maxDelay * ONE_SECOND;
	      maxDurationTime = maxDuration * ONE_SECOND;
	      if (!options.skipBlocking) {
	        flags.blockTransition = timings.transitionDuration > 0;
	        flags.blockKeyframeAnimation = timings.animationDuration > 0 &&
	                                       stagger.animationDelay > 0 &&
	                                       stagger.animationDuration === 0;
	      }

	      if (options.from) {
	        if (options.cleanupStyles) {
	          registerRestorableStyles(restoreStyles, node, Object.keys(options.from));
	        }
	        applyAnimationFromStyles(element, options);
	      }

	      if (flags.blockTransition || flags.blockKeyframeAnimation) {
	        applyBlocking(maxDuration);
	      } else if (!options.skipBlocking) {
	        blockTransitions(node, false);
	      }

	      // TODO(matsko): for 1.5 change this code to have an animator object for better debugging
	      return {
	        $$willAnimate: true,
	        end: endFn,
	        start: function() {
	          if (animationClosed) return;

	          runnerHost = {
	            end: endFn,
	            cancel: cancelFn,
	            resume: null, //this will be set during the start() phase
	            pause: null
	          };

	          runner = new $$AnimateRunner(runnerHost);

	          waitUntilQuiet(start);

	          // we don't have access to pause/resume the animation
	          // since it hasn't run yet. AnimateRunner will therefore
	          // set noop functions for resume and pause and they will
	          // later be overridden once the animation is triggered
	          return runner;
	        }
	      };

	      function endFn() {
	        close();
	      }

	      function cancelFn() {
	        close(true);
	      }

	      function close(rejected) { // jshint ignore:line
	        // if the promise has been called already then we shouldn't close
	        // the animation again
	        if (animationClosed || (animationCompleted && animationPaused)) return;
	        animationClosed = true;
	        animationPaused = false;

	        if (!options.$$skipPreparationClasses) {
	          $$jqLite.removeClass(element, preparationClasses);
	        }
	        $$jqLite.removeClass(element, activeClasses);

	        blockKeyframeAnimations(node, false);
	        blockTransitions(node, false);

	        forEach(temporaryStyles, function(entry) {
	          // There is only one way to remove inline style properties entirely from elements.
	          // By using `removeProperty` this works, but we need to convert camel-cased CSS
	          // styles down to hyphenated values.
	          node.style[entry[0]] = '';
	        });

	        applyAnimationClasses(element, options);
	        applyAnimationStyles(element, options);

	        if (Object.keys(restoreStyles).length) {
	          forEach(restoreStyles, function(value, prop) {
	            value ? node.style.setProperty(prop, value)
	                  : node.style.removeProperty(prop);
	          });
	        }

	        // the reason why we have this option is to allow a synchronous closing callback
	        // that is fired as SOON as the animation ends (when the CSS is removed) or if
	        // the animation never takes off at all. A good example is a leave animation since
	        // the element must be removed just after the animation is over or else the element
	        // will appear on screen for one animation frame causing an overbearing flicker.
	        if (options.onDone) {
	          options.onDone();
	        }

	        if (events && events.length) {
	          // Remove the transitionend / animationend listener(s)
	          element.off(events.join(' '), onAnimationProgress);
	        }

	        //Cancel the fallback closing timeout and remove the timer data
	        var animationTimerData = element.data(ANIMATE_TIMER_KEY);
	        if (animationTimerData) {
	          $timeout.cancel(animationTimerData[0].timer);
	          element.removeData(ANIMATE_TIMER_KEY);
	        }

	        // if the preparation function fails then the promise is not setup
	        if (runner) {
	          runner.complete(!rejected);
	        }
	      }

	      function applyBlocking(duration) {
	        if (flags.blockTransition) {
	          blockTransitions(node, duration);
	        }

	        if (flags.blockKeyframeAnimation) {
	          blockKeyframeAnimations(node, !!duration);
	        }
	      }

	      function closeAndReturnNoopAnimator() {
	        runner = new $$AnimateRunner({
	          end: endFn,
	          cancel: cancelFn
	        });

	        // should flush the cache animation
	        waitUntilQuiet(noop);
	        close();

	        return {
	          $$willAnimate: false,
	          start: function() {
	            return runner;
	          },
	          end: endFn
	        };
	      }

	      function onAnimationProgress(event) {
	        event.stopPropagation();
	        var ev = event.originalEvent || event;

	        // we now always use `Date.now()` due to the recent changes with
	        // event.timeStamp in Firefox, Webkit and Chrome (see #13494 for more info)
	        var timeStamp = ev.$manualTimeStamp || Date.now();

	        /* Firefox (or possibly just Gecko) likes to not round values up
	         * when a ms measurement is used for the animation */
	        var elapsedTime = parseFloat(ev.elapsedTime.toFixed(ELAPSED_TIME_MAX_DECIMAL_PLACES));

	        /* $manualTimeStamp is a mocked timeStamp value which is set
	         * within browserTrigger(). This is only here so that tests can
	         * mock animations properly. Real events fallback to event.timeStamp,
	         * or, if they don't, then a timeStamp is automatically created for them.
	         * We're checking to see if the timeStamp surpasses the expected delay,
	         * but we're using elapsedTime instead of the timeStamp on the 2nd
	         * pre-condition since animationPauseds sometimes close off early */
	        if (Math.max(timeStamp - startTime, 0) >= maxDelayTime && elapsedTime >= maxDuration) {
	          // we set this flag to ensure that if the transition is paused then, when resumed,
	          // the animation will automatically close itself since transitions cannot be paused.
	          animationCompleted = true;
	          close();
	        }
	      }

	      function start() {
	        if (animationClosed) return;
	        if (!node.parentNode) {
	          close();
	          return;
	        }

	        // even though we only pause keyframe animations here the pause flag
	        // will still happen when transitions are used. Only the transition will
	        // not be paused since that is not possible. If the animation ends when
	        // paused then it will not complete until unpaused or cancelled.
	        var playPause = function(playAnimation) {
	          if (!animationCompleted) {
	            animationPaused = !playAnimation;
	            if (timings.animationDuration) {
	              var value = blockKeyframeAnimations(node, animationPaused);
	              animationPaused
	                  ? temporaryStyles.push(value)
	                  : removeFromArray(temporaryStyles, value);
	            }
	          } else if (animationPaused && playAnimation) {
	            animationPaused = false;
	            close();
	          }
	        };

	        // checking the stagger duration prevents an accidentally cascade of the CSS delay style
	        // being inherited from the parent. If the transition duration is zero then we can safely
	        // rely that the delay value is an intentional stagger delay style.
	        var maxStagger = itemIndex > 0
	                         && ((timings.transitionDuration && stagger.transitionDuration === 0) ||
	                            (timings.animationDuration && stagger.animationDuration === 0))
	                         && Math.max(stagger.animationDelay, stagger.transitionDelay);
	        if (maxStagger) {
	          $timeout(triggerAnimationStart,
	                   Math.floor(maxStagger * itemIndex * ONE_SECOND),
	                   false);
	        } else {
	          triggerAnimationStart();
	        }

	        // this will decorate the existing promise runner with pause/resume methods
	        runnerHost.resume = function() {
	          playPause(true);
	        };

	        runnerHost.pause = function() {
	          playPause(false);
	        };

	        function triggerAnimationStart() {
	          // just incase a stagger animation kicks in when the animation
	          // itself was cancelled entirely
	          if (animationClosed) return;

	          applyBlocking(false);

	          forEach(temporaryStyles, function(entry) {
	            var key = entry[0];
	            var value = entry[1];
	            node.style[key] = value;
	          });

	          applyAnimationClasses(element, options);
	          $$jqLite.addClass(element, activeClasses);

	          if (flags.recalculateTimingStyles) {
	            fullClassName = node.className + ' ' + preparationClasses;
	            cacheKey = gcsHashFn(node, fullClassName);

	            timings = computeTimings(node, fullClassName, cacheKey);
	            relativeDelay = timings.maxDelay;
	            maxDelay = Math.max(relativeDelay, 0);
	            maxDuration = timings.maxDuration;

	            if (maxDuration === 0) {
	              close();
	              return;
	            }

	            flags.hasTransitions = timings.transitionDuration > 0;
	            flags.hasAnimations = timings.animationDuration > 0;
	          }

	          if (flags.applyAnimationDelay) {
	            relativeDelay = typeof options.delay !== "boolean" && truthyTimingValue(options.delay)
	                  ? parseFloat(options.delay)
	                  : relativeDelay;

	            maxDelay = Math.max(relativeDelay, 0);
	            timings.animationDelay = relativeDelay;
	            delayStyle = getCssDelayStyle(relativeDelay, true);
	            temporaryStyles.push(delayStyle);
	            node.style[delayStyle[0]] = delayStyle[1];
	          }

	          maxDelayTime = maxDelay * ONE_SECOND;
	          maxDurationTime = maxDuration * ONE_SECOND;

	          if (options.easing) {
	            var easeProp, easeVal = options.easing;
	            if (flags.hasTransitions) {
	              easeProp = TRANSITION_PROP + TIMING_KEY;
	              temporaryStyles.push([easeProp, easeVal]);
	              node.style[easeProp] = easeVal;
	            }
	            if (flags.hasAnimations) {
	              easeProp = ANIMATION_PROP + TIMING_KEY;
	              temporaryStyles.push([easeProp, easeVal]);
	              node.style[easeProp] = easeVal;
	            }
	          }

	          if (timings.transitionDuration) {
	            events.push(TRANSITIONEND_EVENT);
	          }

	          if (timings.animationDuration) {
	            events.push(ANIMATIONEND_EVENT);
	          }

	          startTime = Date.now();
	          var timerTime = maxDelayTime + CLOSING_TIME_BUFFER * maxDurationTime;
	          var endTime = startTime + timerTime;

	          var animationsData = element.data(ANIMATE_TIMER_KEY) || [];
	          var setupFallbackTimer = true;
	          if (animationsData.length) {
	            var currentTimerData = animationsData[0];
	            setupFallbackTimer = endTime > currentTimerData.expectedEndTime;
	            if (setupFallbackTimer) {
	              $timeout.cancel(currentTimerData.timer);
	            } else {
	              animationsData.push(close);
	            }
	          }

	          if (setupFallbackTimer) {
	            var timer = $timeout(onAnimationExpired, timerTime, false);
	            animationsData[0] = {
	              timer: timer,
	              expectedEndTime: endTime
	            };
	            animationsData.push(close);
	            element.data(ANIMATE_TIMER_KEY, animationsData);
	          }

	          if (events.length) {
	            element.on(events.join(' '), onAnimationProgress);
	          }

	          if (options.to) {
	            if (options.cleanupStyles) {
	              registerRestorableStyles(restoreStyles, node, Object.keys(options.to));
	            }
	            applyAnimationToStyles(element, options);
	          }
	        }

	        function onAnimationExpired() {
	          var animationsData = element.data(ANIMATE_TIMER_KEY);

	          // this will be false in the event that the element was
	          // removed from the DOM (via a leave animation or something
	          // similar)
	          if (animationsData) {
	            for (var i = 1; i < animationsData.length; i++) {
	              animationsData[i]();
	            }
	            element.removeData(ANIMATE_TIMER_KEY);
	          }
	        }
	      }
	    };
	  }];
	}];

	var $$AnimateCssDriverProvider = ['$$animationProvider', function($$animationProvider) {
	  $$animationProvider.drivers.push('$$animateCssDriver');

	  var NG_ANIMATE_SHIM_CLASS_NAME = 'ng-animate-shim';
	  var NG_ANIMATE_ANCHOR_CLASS_NAME = 'ng-anchor';

	  var NG_OUT_ANCHOR_CLASS_NAME = 'ng-anchor-out';
	  var NG_IN_ANCHOR_CLASS_NAME = 'ng-anchor-in';

	  function isDocumentFragment(node) {
	    return node.parentNode && node.parentNode.nodeType === 11;
	  }

	  this.$get = ['$animateCss', '$rootScope', '$$AnimateRunner', '$rootElement', '$sniffer', '$$jqLite', '$document',
	       function($animateCss,   $rootScope,   $$AnimateRunner,   $rootElement,   $sniffer,   $$jqLite,   $document) {

	    // only browsers that support these properties can render animations
	    if (!$sniffer.animations && !$sniffer.transitions) return noop;

	    var bodyNode = $document[0].body;
	    var rootNode = getDomNode($rootElement);

	    var rootBodyElement = jqLite(
	      // this is to avoid using something that exists outside of the body
	      // we also special case the doc fragment case because our unit test code
	      // appends the $rootElement to the body after the app has been bootstrapped
	      isDocumentFragment(rootNode) || bodyNode.contains(rootNode) ? rootNode : bodyNode
	    );

	    var applyAnimationClasses = applyAnimationClassesFactory($$jqLite);

	    return function initDriverFn(animationDetails) {
	      return animationDetails.from && animationDetails.to
	          ? prepareFromToAnchorAnimation(animationDetails.from,
	                                         animationDetails.to,
	                                         animationDetails.classes,
	                                         animationDetails.anchors)
	          : prepareRegularAnimation(animationDetails);
	    };

	    function filterCssClasses(classes) {
	      //remove all the `ng-` stuff
	      return classes.replace(/\bng-\S+\b/g, '');
	    }

	    function getUniqueValues(a, b) {
	      if (isString(a)) a = a.split(' ');
	      if (isString(b)) b = b.split(' ');
	      return a.filter(function(val) {
	        return b.indexOf(val) === -1;
	      }).join(' ');
	    }

	    function prepareAnchoredAnimation(classes, outAnchor, inAnchor) {
	      var clone = jqLite(getDomNode(outAnchor).cloneNode(true));
	      var startingClasses = filterCssClasses(getClassVal(clone));

	      outAnchor.addClass(NG_ANIMATE_SHIM_CLASS_NAME);
	      inAnchor.addClass(NG_ANIMATE_SHIM_CLASS_NAME);

	      clone.addClass(NG_ANIMATE_ANCHOR_CLASS_NAME);

	      rootBodyElement.append(clone);

	      var animatorIn, animatorOut = prepareOutAnimation();

	      // the user may not end up using the `out` animation and
	      // only making use of the `in` animation or vice-versa.
	      // In either case we should allow this and not assume the
	      // animation is over unless both animations are not used.
	      if (!animatorOut) {
	        animatorIn = prepareInAnimation();
	        if (!animatorIn) {
	          return end();
	        }
	      }

	      var startingAnimator = animatorOut || animatorIn;

	      return {
	        start: function() {
	          var runner;

	          var currentAnimation = startingAnimator.start();
	          currentAnimation.done(function() {
	            currentAnimation = null;
	            if (!animatorIn) {
	              animatorIn = prepareInAnimation();
	              if (animatorIn) {
	                currentAnimation = animatorIn.start();
	                currentAnimation.done(function() {
	                  currentAnimation = null;
	                  end();
	                  runner.complete();
	                });
	                return currentAnimation;
	              }
	            }
	            // in the event that there is no `in` animation
	            end();
	            runner.complete();
	          });

	          runner = new $$AnimateRunner({
	            end: endFn,
	            cancel: endFn
	          });

	          return runner;

	          function endFn() {
	            if (currentAnimation) {
	              currentAnimation.end();
	            }
	          }
	        }
	      };

	      function calculateAnchorStyles(anchor) {
	        var styles = {};

	        var coords = getDomNode(anchor).getBoundingClientRect();

	        // we iterate directly since safari messes up and doesn't return
	        // all the keys for the coords object when iterated
	        forEach(['width','height','top','left'], function(key) {
	          var value = coords[key];
	          switch (key) {
	            case 'top':
	              value += bodyNode.scrollTop;
	              break;
	            case 'left':
	              value += bodyNode.scrollLeft;
	              break;
	          }
	          styles[key] = Math.floor(value) + 'px';
	        });
	        return styles;
	      }

	      function prepareOutAnimation() {
	        var animator = $animateCss(clone, {
	          addClass: NG_OUT_ANCHOR_CLASS_NAME,
	          delay: true,
	          from: calculateAnchorStyles(outAnchor)
	        });

	        // read the comment within `prepareRegularAnimation` to understand
	        // why this check is necessary
	        return animator.$$willAnimate ? animator : null;
	      }

	      function getClassVal(element) {
	        return element.attr('class') || '';
	      }

	      function prepareInAnimation() {
	        var endingClasses = filterCssClasses(getClassVal(inAnchor));
	        var toAdd = getUniqueValues(endingClasses, startingClasses);
	        var toRemove = getUniqueValues(startingClasses, endingClasses);

	        var animator = $animateCss(clone, {
	          to: calculateAnchorStyles(inAnchor),
	          addClass: NG_IN_ANCHOR_CLASS_NAME + ' ' + toAdd,
	          removeClass: NG_OUT_ANCHOR_CLASS_NAME + ' ' + toRemove,
	          delay: true
	        });

	        // read the comment within `prepareRegularAnimation` to understand
	        // why this check is necessary
	        return animator.$$willAnimate ? animator : null;
	      }

	      function end() {
	        clone.remove();
	        outAnchor.removeClass(NG_ANIMATE_SHIM_CLASS_NAME);
	        inAnchor.removeClass(NG_ANIMATE_SHIM_CLASS_NAME);
	      }
	    }

	    function prepareFromToAnchorAnimation(from, to, classes, anchors) {
	      var fromAnimation = prepareRegularAnimation(from, noop);
	      var toAnimation = prepareRegularAnimation(to, noop);

	      var anchorAnimations = [];
	      forEach(anchors, function(anchor) {
	        var outElement = anchor['out'];
	        var inElement = anchor['in'];
	        var animator = prepareAnchoredAnimation(classes, outElement, inElement);
	        if (animator) {
	          anchorAnimations.push(animator);
	        }
	      });

	      // no point in doing anything when there are no elements to animate
	      if (!fromAnimation && !toAnimation && anchorAnimations.length === 0) return;

	      return {
	        start: function() {
	          var animationRunners = [];

	          if (fromAnimation) {
	            animationRunners.push(fromAnimation.start());
	          }

	          if (toAnimation) {
	            animationRunners.push(toAnimation.start());
	          }

	          forEach(anchorAnimations, function(animation) {
	            animationRunners.push(animation.start());
	          });

	          var runner = new $$AnimateRunner({
	            end: endFn,
	            cancel: endFn // CSS-driven animations cannot be cancelled, only ended
	          });

	          $$AnimateRunner.all(animationRunners, function(status) {
	            runner.complete(status);
	          });

	          return runner;

	          function endFn() {
	            forEach(animationRunners, function(runner) {
	              runner.end();
	            });
	          }
	        }
	      };
	    }

	    function prepareRegularAnimation(animationDetails) {
	      var element = animationDetails.element;
	      var options = animationDetails.options || {};

	      if (animationDetails.structural) {
	        options.event = animationDetails.event;
	        options.structural = true;
	        options.applyClassesEarly = true;

	        // we special case the leave animation since we want to ensure that
	        // the element is removed as soon as the animation is over. Otherwise
	        // a flicker might appear or the element may not be removed at all
	        if (animationDetails.event === 'leave') {
	          options.onDone = options.domOperation;
	        }
	      }

	      // We assign the preparationClasses as the actual animation event since
	      // the internals of $animateCss will just suffix the event token values
	      // with `-active` to trigger the animation.
	      if (options.preparationClasses) {
	        options.event = concatWithSpace(options.event, options.preparationClasses);
	      }

	      var animator = $animateCss(element, options);

	      // the driver lookup code inside of $$animation attempts to spawn a
	      // driver one by one until a driver returns a.$$willAnimate animator object.
	      // $animateCss will always return an object, however, it will pass in
	      // a flag as a hint as to whether an animation was detected or not
	      return animator.$$willAnimate ? animator : null;
	    }
	  }];
	}];

	// TODO(matsko): use caching here to speed things up for detection
	// TODO(matsko): add documentation
	//  by the time...

	var $$AnimateJsProvider = ['$animateProvider', function($animateProvider) {
	  this.$get = ['$injector', '$$AnimateRunner', '$$jqLite',
	       function($injector,   $$AnimateRunner,   $$jqLite) {

	    var applyAnimationClasses = applyAnimationClassesFactory($$jqLite);
	         // $animateJs(element, 'enter');
	    return function(element, event, classes, options) {
	      var animationClosed = false;

	      // the `classes` argument is optional and if it is not used
	      // then the classes will be resolved from the element's className
	      // property as well as options.addClass/options.removeClass.
	      if (arguments.length === 3 && isObject(classes)) {
	        options = classes;
	        classes = null;
	      }

	      options = prepareAnimationOptions(options);
	      if (!classes) {
	        classes = element.attr('class') || '';
	        if (options.addClass) {
	          classes += ' ' + options.addClass;
	        }
	        if (options.removeClass) {
	          classes += ' ' + options.removeClass;
	        }
	      }

	      var classesToAdd = options.addClass;
	      var classesToRemove = options.removeClass;

	      // the lookupAnimations function returns a series of animation objects that are
	      // matched up with one or more of the CSS classes. These animation objects are
	      // defined via the module.animation factory function. If nothing is detected then
	      // we don't return anything which then makes $animation query the next driver.
	      var animations = lookupAnimations(classes);
	      var before, after;
	      if (animations.length) {
	        var afterFn, beforeFn;
	        if (event == 'leave') {
	          beforeFn = 'leave';
	          afterFn = 'afterLeave'; // TODO(matsko): get rid of this
	        } else {
	          beforeFn = 'before' + event.charAt(0).toUpperCase() + event.substr(1);
	          afterFn = event;
	        }

	        if (event !== 'enter' && event !== 'move') {
	          before = packageAnimations(element, event, options, animations, beforeFn);
	        }
	        after  = packageAnimations(element, event, options, animations, afterFn);
	      }

	      // no matching animations
	      if (!before && !after) return;

	      function applyOptions() {
	        options.domOperation();
	        applyAnimationClasses(element, options);
	      }

	      function close() {
	        animationClosed = true;
	        applyOptions();
	        applyAnimationStyles(element, options);
	      }

	      var runner;

	      return {
	        $$willAnimate: true,
	        end: function() {
	          if (runner) {
	            runner.end();
	          } else {
	            close();
	            runner = new $$AnimateRunner();
	            runner.complete(true);
	          }
	          return runner;
	        },
	        start: function() {
	          if (runner) {
	            return runner;
	          }

	          runner = new $$AnimateRunner();
	          var closeActiveAnimations;
	          var chain = [];

	          if (before) {
	            chain.push(function(fn) {
	              closeActiveAnimations = before(fn);
	            });
	          }

	          if (chain.length) {
	            chain.push(function(fn) {
	              applyOptions();
	              fn(true);
	            });
	          } else {
	            applyOptions();
	          }

	          if (after) {
	            chain.push(function(fn) {
	              closeActiveAnimations = after(fn);
	            });
	          }

	          runner.setHost({
	            end: function() {
	              endAnimations();
	            },
	            cancel: function() {
	              endAnimations(true);
	            }
	          });

	          $$AnimateRunner.chain(chain, onComplete);
	          return runner;

	          function onComplete(success) {
	            close(success);
	            runner.complete(success);
	          }

	          function endAnimations(cancelled) {
	            if (!animationClosed) {
	              (closeActiveAnimations || noop)(cancelled);
	              onComplete(cancelled);
	            }
	          }
	        }
	      };

	      function executeAnimationFn(fn, element, event, options, onDone) {
	        var args;
	        switch (event) {
	          case 'animate':
	            args = [element, options.from, options.to, onDone];
	            break;

	          case 'setClass':
	            args = [element, classesToAdd, classesToRemove, onDone];
	            break;

	          case 'addClass':
	            args = [element, classesToAdd, onDone];
	            break;

	          case 'removeClass':
	            args = [element, classesToRemove, onDone];
	            break;

	          default:
	            args = [element, onDone];
	            break;
	        }

	        args.push(options);

	        var value = fn.apply(fn, args);
	        if (value) {
	          if (isFunction(value.start)) {
	            value = value.start();
	          }

	          if (value instanceof $$AnimateRunner) {
	            value.done(onDone);
	          } else if (isFunction(value)) {
	            // optional onEnd / onCancel callback
	            return value;
	          }
	        }

	        return noop;
	      }

	      function groupEventedAnimations(element, event, options, animations, fnName) {
	        var operations = [];
	        forEach(animations, function(ani) {
	          var animation = ani[fnName];
	          if (!animation) return;

	          // note that all of these animations will run in parallel
	          operations.push(function() {
	            var runner;
	            var endProgressCb;

	            var resolved = false;
	            var onAnimationComplete = function(rejected) {
	              if (!resolved) {
	                resolved = true;
	                (endProgressCb || noop)(rejected);
	                runner.complete(!rejected);
	              }
	            };

	            runner = new $$AnimateRunner({
	              end: function() {
	                onAnimationComplete();
	              },
	              cancel: function() {
	                onAnimationComplete(true);
	              }
	            });

	            endProgressCb = executeAnimationFn(animation, element, event, options, function(result) {
	              var cancelled = result === false;
	              onAnimationComplete(cancelled);
	            });

	            return runner;
	          });
	        });

	        return operations;
	      }

	      function packageAnimations(element, event, options, animations, fnName) {
	        var operations = groupEventedAnimations(element, event, options, animations, fnName);
	        if (operations.length === 0) {
	          var a,b;
	          if (fnName === 'beforeSetClass') {
	            a = groupEventedAnimations(element, 'removeClass', options, animations, 'beforeRemoveClass');
	            b = groupEventedAnimations(element, 'addClass', options, animations, 'beforeAddClass');
	          } else if (fnName === 'setClass') {
	            a = groupEventedAnimations(element, 'removeClass', options, animations, 'removeClass');
	            b = groupEventedAnimations(element, 'addClass', options, animations, 'addClass');
	          }

	          if (a) {
	            operations = operations.concat(a);
	          }
	          if (b) {
	            operations = operations.concat(b);
	          }
	        }

	        if (operations.length === 0) return;

	        // TODO(matsko): add documentation
	        return function startAnimation(callback) {
	          var runners = [];
	          if (operations.length) {
	            forEach(operations, function(animateFn) {
	              runners.push(animateFn());
	            });
	          }

	          runners.length ? $$AnimateRunner.all(runners, callback) : callback();

	          return function endFn(reject) {
	            forEach(runners, function(runner) {
	              reject ? runner.cancel() : runner.end();
	            });
	          };
	        };
	      }
	    };

	    function lookupAnimations(classes) {
	      classes = isArray(classes) ? classes : classes.split(' ');
	      var matches = [], flagMap = {};
	      for (var i=0; i < classes.length; i++) {
	        var klass = classes[i],
	            animationFactory = $animateProvider.$$registeredAnimations[klass];
	        if (animationFactory && !flagMap[klass]) {
	          matches.push($injector.get(animationFactory));
	          flagMap[klass] = true;
	        }
	      }
	      return matches;
	    }
	  }];
	}];

	var $$AnimateJsDriverProvider = ['$$animationProvider', function($$animationProvider) {
	  $$animationProvider.drivers.push('$$animateJsDriver');
	  this.$get = ['$$animateJs', '$$AnimateRunner', function($$animateJs, $$AnimateRunner) {
	    return function initDriverFn(animationDetails) {
	      if (animationDetails.from && animationDetails.to) {
	        var fromAnimation = prepareAnimation(animationDetails.from);
	        var toAnimation = prepareAnimation(animationDetails.to);
	        if (!fromAnimation && !toAnimation) return;

	        return {
	          start: function() {
	            var animationRunners = [];

	            if (fromAnimation) {
	              animationRunners.push(fromAnimation.start());
	            }

	            if (toAnimation) {
	              animationRunners.push(toAnimation.start());
	            }

	            $$AnimateRunner.all(animationRunners, done);

	            var runner = new $$AnimateRunner({
	              end: endFnFactory(),
	              cancel: endFnFactory()
	            });

	            return runner;

	            function endFnFactory() {
	              return function() {
	                forEach(animationRunners, function(runner) {
	                  // at this point we cannot cancel animations for groups just yet. 1.5+
	                  runner.end();
	                });
	              };
	            }

	            function done(status) {
	              runner.complete(status);
	            }
	          }
	        };
	      } else {
	        return prepareAnimation(animationDetails);
	      }
	    };

	    function prepareAnimation(animationDetails) {
	      // TODO(matsko): make sure to check for grouped animations and delegate down to normal animations
	      var element = animationDetails.element;
	      var event = animationDetails.event;
	      var options = animationDetails.options;
	      var classes = animationDetails.classes;
	      return $$animateJs(element, event, classes, options);
	    }
	  }];
	}];

	var NG_ANIMATE_ATTR_NAME = 'data-ng-animate';
	var NG_ANIMATE_PIN_DATA = '$ngAnimatePin';
	var $$AnimateQueueProvider = ['$animateProvider', function($animateProvider) {
	  var PRE_DIGEST_STATE = 1;
	  var RUNNING_STATE = 2;
	  var ONE_SPACE = ' ';

	  var rules = this.rules = {
	    skip: [],
	    cancel: [],
	    join: []
	  };

	  function makeTruthyCssClassMap(classString) {
	    if (!classString) {
	      return null;
	    }

	    var keys = classString.split(ONE_SPACE);
	    var map = Object.create(null);

	    forEach(keys, function(key) {
	      map[key] = true;
	    });
	    return map;
	  }

	  function hasMatchingClasses(newClassString, currentClassString) {
	    if (newClassString && currentClassString) {
	      var currentClassMap = makeTruthyCssClassMap(currentClassString);
	      return newClassString.split(ONE_SPACE).some(function(className) {
	        return currentClassMap[className];
	      });
	    }
	  }

	  function isAllowed(ruleType, element, currentAnimation, previousAnimation) {
	    return rules[ruleType].some(function(fn) {
	      return fn(element, currentAnimation, previousAnimation);
	    });
	  }

	  function hasAnimationClasses(animation, and) {
	    var a = (animation.addClass || '').length > 0;
	    var b = (animation.removeClass || '').length > 0;
	    return and ? a && b : a || b;
	  }

	  rules.join.push(function(element, newAnimation, currentAnimation) {
	    // if the new animation is class-based then we can just tack that on
	    return !newAnimation.structural && hasAnimationClasses(newAnimation);
	  });

	  rules.skip.push(function(element, newAnimation, currentAnimation) {
	    // there is no need to animate anything if no classes are being added and
	    // there is no structural animation that will be triggered
	    return !newAnimation.structural && !hasAnimationClasses(newAnimation);
	  });

	  rules.skip.push(function(element, newAnimation, currentAnimation) {
	    // why should we trigger a new structural animation if the element will
	    // be removed from the DOM anyway?
	    return currentAnimation.event == 'leave' && newAnimation.structural;
	  });

	  rules.skip.push(function(element, newAnimation, currentAnimation) {
	    // if there is an ongoing current animation then don't even bother running the class-based animation
	    return currentAnimation.structural && currentAnimation.state === RUNNING_STATE && !newAnimation.structural;
	  });

	  rules.cancel.push(function(element, newAnimation, currentAnimation) {
	    // there can never be two structural animations running at the same time
	    return currentAnimation.structural && newAnimation.structural;
	  });

	  rules.cancel.push(function(element, newAnimation, currentAnimation) {
	    // if the previous animation is already running, but the new animation will
	    // be triggered, but the new animation is structural
	    return currentAnimation.state === RUNNING_STATE && newAnimation.structural;
	  });

	  rules.cancel.push(function(element, newAnimation, currentAnimation) {
	    var nA = newAnimation.addClass;
	    var nR = newAnimation.removeClass;
	    var cA = currentAnimation.addClass;
	    var cR = currentAnimation.removeClass;

	    // early detection to save the global CPU shortage :)
	    if ((isUndefined(nA) && isUndefined(nR)) || (isUndefined(cA) && isUndefined(cR))) {
	      return false;
	    }

	    return hasMatchingClasses(nA, cR) || hasMatchingClasses(nR, cA);
	  });

	  this.$get = ['$$rAF', '$rootScope', '$rootElement', '$document', '$$HashMap',
	               '$$animation', '$$AnimateRunner', '$templateRequest', '$$jqLite', '$$forceReflow',
	       function($$rAF,   $rootScope,   $rootElement,   $document,   $$HashMap,
	                $$animation,   $$AnimateRunner,   $templateRequest,   $$jqLite,   $$forceReflow) {

	    var activeAnimationsLookup = new $$HashMap();
	    var disabledElementsLookup = new $$HashMap();
	    var animationsEnabled = null;

	    function postDigestTaskFactory() {
	      var postDigestCalled = false;
	      return function(fn) {
	        // we only issue a call to postDigest before
	        // it has first passed. This prevents any callbacks
	        // from not firing once the animation has completed
	        // since it will be out of the digest cycle.
	        if (postDigestCalled) {
	          fn();
	        } else {
	          $rootScope.$$postDigest(function() {
	            postDigestCalled = true;
	            fn();
	          });
	        }
	      };
	    }

	    // Wait until all directive and route-related templates are downloaded and
	    // compiled. The $templateRequest.totalPendingRequests variable keeps track of
	    // all of the remote templates being currently downloaded. If there are no
	    // templates currently downloading then the watcher will still fire anyway.
	    var deregisterWatch = $rootScope.$watch(
	      function() { return $templateRequest.totalPendingRequests === 0; },
	      function(isEmpty) {
	        if (!isEmpty) return;
	        deregisterWatch();

	        // Now that all templates have been downloaded, $animate will wait until
	        // the post digest queue is empty before enabling animations. By having two
	        // calls to $postDigest calls we can ensure that the flag is enabled at the
	        // very end of the post digest queue. Since all of the animations in $animate
	        // use $postDigest, it's important that the code below executes at the end.
	        // This basically means that the page is fully downloaded and compiled before
	        // any animations are triggered.
	        $rootScope.$$postDigest(function() {
	          $rootScope.$$postDigest(function() {
	            // we check for null directly in the event that the application already called
	            // .enabled() with whatever arguments that it provided it with
	            if (animationsEnabled === null) {
	              animationsEnabled = true;
	            }
	          });
	        });
	      }
	    );

	    var callbackRegistry = {};

	    // remember that the classNameFilter is set during the provider/config
	    // stage therefore we can optimize here and setup a helper function
	    var classNameFilter = $animateProvider.classNameFilter();
	    var isAnimatableClassName = !classNameFilter
	              ? function() { return true; }
	              : function(className) {
	                return classNameFilter.test(className);
	              };

	    var applyAnimationClasses = applyAnimationClassesFactory($$jqLite);

	    function normalizeAnimationDetails(element, animation) {
	      return mergeAnimationDetails(element, animation, {});
	    }

	    // IE9-11 has no method "contains" in SVG element and in Node.prototype. Bug #10259.
	    var contains = Node.prototype.contains || function(arg) {
	      // jshint bitwise: false
	      return this === arg || !!(this.compareDocumentPosition(arg) & 16);
	      // jshint bitwise: true
	    };

	    function findCallbacks(parent, element, event) {
	      var targetNode = getDomNode(element);
	      var targetParentNode = getDomNode(parent);

	      var matches = [];
	      var entries = callbackRegistry[event];
	      if (entries) {
	        forEach(entries, function(entry) {
	          if (contains.call(entry.node, targetNode)) {
	            matches.push(entry.callback);
	          } else if (event === 'leave' && contains.call(entry.node, targetParentNode)) {
	            matches.push(entry.callback);
	          }
	        });
	      }

	      return matches;
	    }

	    return {
	      on: function(event, container, callback) {
	        var node = extractElementNode(container);
	        callbackRegistry[event] = callbackRegistry[event] || [];
	        callbackRegistry[event].push({
	          node: node,
	          callback: callback
	        });
	      },

	      off: function(event, container, callback) {
	        var entries = callbackRegistry[event];
	        if (!entries) return;

	        callbackRegistry[event] = arguments.length === 1
	            ? null
	            : filterFromRegistry(entries, container, callback);

	        function filterFromRegistry(list, matchContainer, matchCallback) {
	          var containerNode = extractElementNode(matchContainer);
	          return list.filter(function(entry) {
	            var isMatch = entry.node === containerNode &&
	                            (!matchCallback || entry.callback === matchCallback);
	            return !isMatch;
	          });
	        }
	      },

	      pin: function(element, parentElement) {
	        assertArg(isElement(element), 'element', 'not an element');
	        assertArg(isElement(parentElement), 'parentElement', 'not an element');
	        element.data(NG_ANIMATE_PIN_DATA, parentElement);
	      },

	      push: function(element, event, options, domOperation) {
	        options = options || {};
	        options.domOperation = domOperation;
	        return queueAnimation(element, event, options);
	      },

	      // this method has four signatures:
	      //  () - global getter
	      //  (bool) - global setter
	      //  (element) - element getter
	      //  (element, bool) - element setter<F37>
	      enabled: function(element, bool) {
	        var argCount = arguments.length;

	        if (argCount === 0) {
	          // () - Global getter
	          bool = !!animationsEnabled;
	        } else {
	          var hasElement = isElement(element);

	          if (!hasElement) {
	            // (bool) - Global setter
	            bool = animationsEnabled = !!element;
	          } else {
	            var node = getDomNode(element);
	            var recordExists = disabledElementsLookup.get(node);

	            if (argCount === 1) {
	              // (element) - Element getter
	              bool = !recordExists;
	            } else {
	              // (element, bool) - Element setter
	              disabledElementsLookup.put(node, !bool);
	            }
	          }
	        }

	        return bool;
	      }
	    };

	    function queueAnimation(element, event, initialOptions) {
	      // we always make a copy of the options since
	      // there should never be any side effects on
	      // the input data when running `$animateCss`.
	      var options = copy(initialOptions);

	      var node, parent;
	      element = stripCommentsFromElement(element);
	      if (element) {
	        node = getDomNode(element);
	        parent = element.parent();
	      }

	      options = prepareAnimationOptions(options);

	      // we create a fake runner with a working promise.
	      // These methods will become available after the digest has passed
	      var runner = new $$AnimateRunner();

	      // this is used to trigger callbacks in postDigest mode
	      var runInNextPostDigestOrNow = postDigestTaskFactory();

	      if (isArray(options.addClass)) {
	        options.addClass = options.addClass.join(' ');
	      }

	      if (options.addClass && !isString(options.addClass)) {
	        options.addClass = null;
	      }

	      if (isArray(options.removeClass)) {
	        options.removeClass = options.removeClass.join(' ');
	      }

	      if (options.removeClass && !isString(options.removeClass)) {
	        options.removeClass = null;
	      }

	      if (options.from && !isObject(options.from)) {
	        options.from = null;
	      }

	      if (options.to && !isObject(options.to)) {
	        options.to = null;
	      }

	      // there are situations where a directive issues an animation for
	      // a jqLite wrapper that contains only comment nodes... If this
	      // happens then there is no way we can perform an animation
	      if (!node) {
	        close();
	        return runner;
	      }

	      var className = [node.className, options.addClass, options.removeClass].join(' ');
	      if (!isAnimatableClassName(className)) {
	        close();
	        return runner;
	      }

	      var isStructural = ['enter', 'move', 'leave'].indexOf(event) >= 0;

	      // this is a hard disable of all animations for the application or on
	      // the element itself, therefore  there is no need to continue further
	      // past this point if not enabled
	      // Animations are also disabled if the document is currently hidden (page is not visible
	      // to the user), because browsers slow down or do not flush calls to requestAnimationFrame
	      var skipAnimations = !animationsEnabled || $document[0].hidden || disabledElementsLookup.get(node);
	      var existingAnimation = (!skipAnimations && activeAnimationsLookup.get(node)) || {};
	      var hasExistingAnimation = !!existingAnimation.state;

	      // there is no point in traversing the same collection of parent ancestors if a followup
	      // animation will be run on the same element that already did all that checking work
	      if (!skipAnimations && (!hasExistingAnimation || existingAnimation.state != PRE_DIGEST_STATE)) {
	        skipAnimations = !areAnimationsAllowed(element, parent, event);
	      }

	      if (skipAnimations) {
	        close();
	        return runner;
	      }

	      if (isStructural) {
	        closeChildAnimations(element);
	      }

	      var newAnimation = {
	        structural: isStructural,
	        element: element,
	        event: event,
	        addClass: options.addClass,
	        removeClass: options.removeClass,
	        close: close,
	        options: options,
	        runner: runner
	      };

	      if (hasExistingAnimation) {
	        var skipAnimationFlag = isAllowed('skip', element, newAnimation, existingAnimation);
	        if (skipAnimationFlag) {
	          if (existingAnimation.state === RUNNING_STATE) {
	            close();
	            return runner;
	          } else {
	            mergeAnimationDetails(element, existingAnimation, newAnimation);
	            return existingAnimation.runner;
	          }
	        }
	        var cancelAnimationFlag = isAllowed('cancel', element, newAnimation, existingAnimation);
	        if (cancelAnimationFlag) {
	          if (existingAnimation.state === RUNNING_STATE) {
	            // this will end the animation right away and it is safe
	            // to do so since the animation is already running and the
	            // runner callback code will run in async
	            existingAnimation.runner.end();
	          } else if (existingAnimation.structural) {
	            // this means that the animation is queued into a digest, but
	            // hasn't started yet. Therefore it is safe to run the close
	            // method which will call the runner methods in async.
	            existingAnimation.close();
	          } else {
	            // this will merge the new animation options into existing animation options
	            mergeAnimationDetails(element, existingAnimation, newAnimation);

	            return existingAnimation.runner;
	          }
	        } else {
	          // a joined animation means that this animation will take over the existing one
	          // so an example would involve a leave animation taking over an enter. Then when
	          // the postDigest kicks in the enter will be ignored.
	          var joinAnimationFlag = isAllowed('join', element, newAnimation, existingAnimation);
	          if (joinAnimationFlag) {
	            if (existingAnimation.state === RUNNING_STATE) {
	              normalizeAnimationDetails(element, newAnimation);
	            } else {
	              applyGeneratedPreparationClasses(element, isStructural ? event : null, options);

	              event = newAnimation.event = existingAnimation.event;
	              options = mergeAnimationDetails(element, existingAnimation, newAnimation);

	              //we return the same runner since only the option values of this animation will
	              //be fed into the `existingAnimation`.
	              return existingAnimation.runner;
	            }
	          }
	        }
	      } else {
	        // normalization in this case means that it removes redundant CSS classes that
	        // already exist (addClass) or do not exist (removeClass) on the element
	        normalizeAnimationDetails(element, newAnimation);
	      }

	      // when the options are merged and cleaned up we may end up not having to do
	      // an animation at all, therefore we should check this before issuing a post
	      // digest callback. Structural animations will always run no matter what.
	      var isValidAnimation = newAnimation.structural;
	      if (!isValidAnimation) {
	        // animate (from/to) can be quickly checked first, otherwise we check if any classes are present
	        isValidAnimation = (newAnimation.event === 'animate' && Object.keys(newAnimation.options.to || {}).length > 0)
	                            || hasAnimationClasses(newAnimation);
	      }

	      if (!isValidAnimation) {
	        close();
	        clearElementAnimationState(element);
	        return runner;
	      }

	      // the counter keeps track of cancelled animations
	      var counter = (existingAnimation.counter || 0) + 1;
	      newAnimation.counter = counter;

	      markElementAnimationState(element, PRE_DIGEST_STATE, newAnimation);

	      $rootScope.$$postDigest(function() {
	        var animationDetails = activeAnimationsLookup.get(node);
	        var animationCancelled = !animationDetails;
	        animationDetails = animationDetails || {};

	        // if addClass/removeClass is called before something like enter then the
	        // registered parent element may not be present. The code below will ensure
	        // that a final value for parent element is obtained
	        var parentElement = element.parent() || [];

	        // animate/structural/class-based animations all have requirements. Otherwise there
	        // is no point in performing an animation. The parent node must also be set.
	        var isValidAnimation = parentElement.length > 0
	                                && (animationDetails.event === 'animate'
	                                    || animationDetails.structural
	                                    || hasAnimationClasses(animationDetails));

	        // this means that the previous animation was cancelled
	        // even if the follow-up animation is the same event
	        if (animationCancelled || animationDetails.counter !== counter || !isValidAnimation) {
	          // if another animation did not take over then we need
	          // to make sure that the domOperation and options are
	          // handled accordingly
	          if (animationCancelled) {
	            applyAnimationClasses(element, options);
	            applyAnimationStyles(element, options);
	          }

	          // if the event changed from something like enter to leave then we do
	          // it, otherwise if it's the same then the end result will be the same too
	          if (animationCancelled || (isStructural && animationDetails.event !== event)) {
	            options.domOperation();
	            runner.end();
	          }

	          // in the event that the element animation was not cancelled or a follow-up animation
	          // isn't allowed to animate from here then we need to clear the state of the element
	          // so that any future animations won't read the expired animation data.
	          if (!isValidAnimation) {
	            clearElementAnimationState(element);
	          }

	          return;
	        }

	        // this combined multiple class to addClass / removeClass into a setClass event
	        // so long as a structural event did not take over the animation
	        event = !animationDetails.structural && hasAnimationClasses(animationDetails, true)
	            ? 'setClass'
	            : animationDetails.event;

	        markElementAnimationState(element, RUNNING_STATE);
	        var realRunner = $$animation(element, event, animationDetails.options);

	        realRunner.done(function(status) {
	          close(!status);
	          var animationDetails = activeAnimationsLookup.get(node);
	          if (animationDetails && animationDetails.counter === counter) {
	            clearElementAnimationState(getDomNode(element));
	          }
	          notifyProgress(runner, event, 'close', {});
	        });

	        // this will update the runner's flow-control events based on
	        // the `realRunner` object.
	        runner.setHost(realRunner);
	        notifyProgress(runner, event, 'start', {});
	      });

	      return runner;

	      function notifyProgress(runner, event, phase, data) {
	        runInNextPostDigestOrNow(function() {
	          var callbacks = findCallbacks(parent, element, event);
	          if (callbacks.length) {
	            // do not optimize this call here to RAF because
	            // we don't know how heavy the callback code here will
	            // be and if this code is buffered then this can
	            // lead to a performance regression.
	            $$rAF(function() {
	              forEach(callbacks, function(callback) {
	                callback(element, phase, data);
	              });
	            });
	          }
	        });
	        runner.progress(event, phase, data);
	      }

	      function close(reject) { // jshint ignore:line
	        clearGeneratedClasses(element, options);
	        applyAnimationClasses(element, options);
	        applyAnimationStyles(element, options);
	        options.domOperation();
	        runner.complete(!reject);
	      }
	    }

	    function closeChildAnimations(element) {
	      var node = getDomNode(element);
	      var children = node.querySelectorAll('[' + NG_ANIMATE_ATTR_NAME + ']');
	      forEach(children, function(child) {
	        var state = parseInt(child.getAttribute(NG_ANIMATE_ATTR_NAME));
	        var animationDetails = activeAnimationsLookup.get(child);
	        if (animationDetails) {
	          switch (state) {
	            case RUNNING_STATE:
	              animationDetails.runner.end();
	              /* falls through */
	            case PRE_DIGEST_STATE:
	              activeAnimationsLookup.remove(child);
	              break;
	          }
	        }
	      });
	    }

	    function clearElementAnimationState(element) {
	      var node = getDomNode(element);
	      node.removeAttribute(NG_ANIMATE_ATTR_NAME);
	      activeAnimationsLookup.remove(node);
	    }

	    function isMatchingElement(nodeOrElmA, nodeOrElmB) {
	      return getDomNode(nodeOrElmA) === getDomNode(nodeOrElmB);
	    }

	    /**
	     * This fn returns false if any of the following is true:
	     * a) animations on any parent element are disabled, and animations on the element aren't explicitly allowed
	     * b) a parent element has an ongoing structural animation, and animateChildren is false
	     * c) the element is not a child of the body
	     * d) the element is not a child of the $rootElement
	     */
	    function areAnimationsAllowed(element, parentElement, event) {
	      var bodyElement = jqLite($document[0].body);
	      var bodyElementDetected = isMatchingElement(element, bodyElement) || element[0].nodeName === 'HTML';
	      var rootElementDetected = isMatchingElement(element, $rootElement);
	      var parentAnimationDetected = false;
	      var animateChildren;
	      var elementDisabled = disabledElementsLookup.get(getDomNode(element));

	      var parentHost = element.data(NG_ANIMATE_PIN_DATA);
	      if (parentHost) {
	        parentElement = parentHost;
	      }

	      while (parentElement && parentElement.length) {
	        if (!rootElementDetected) {
	          // angular doesn't want to attempt to animate elements outside of the application
	          // therefore we need to ensure that the rootElement is an ancestor of the current element
	          rootElementDetected = isMatchingElement(parentElement, $rootElement);
	        }

	        var parentNode = parentElement[0];
	        if (parentNode.nodeType !== ELEMENT_NODE) {
	          // no point in inspecting the #document element
	          break;
	        }

	        var details = activeAnimationsLookup.get(parentNode) || {};
	        // either an enter, leave or move animation will commence
	        // therefore we can't allow any animations to take place
	        // but if a parent animation is class-based then that's ok
	        if (!parentAnimationDetected) {
	          var parentElementDisabled = disabledElementsLookup.get(parentNode);

	          if (parentElementDisabled === true && elementDisabled !== false) {
	            // disable animations if the user hasn't explicitly enabled animations on the
	            // current element
	            elementDisabled = true;
	            // element is disabled via parent element, no need to check anything else
	            break;
	          } else if (parentElementDisabled === false) {
	            elementDisabled = false;
	          }
	          parentAnimationDetected = details.structural;
	        }

	        if (isUndefined(animateChildren) || animateChildren === true) {
	          var value = parentElement.data(NG_ANIMATE_CHILDREN_DATA);
	          if (isDefined(value)) {
	            animateChildren = value;
	          }
	        }

	        // there is no need to continue traversing at this point
	        if (parentAnimationDetected && animateChildren === false) break;

	        if (!bodyElementDetected) {
	          // we also need to ensure that the element is or will be a part of the body element
	          // otherwise it is pointless to even issue an animation to be rendered
	          bodyElementDetected = isMatchingElement(parentElement, bodyElement);
	        }

	        if (bodyElementDetected && rootElementDetected) {
	          // If both body and root have been found, any other checks are pointless,
	          // as no animation data should live outside the application
	          break;
	        }

	        if (!rootElementDetected) {
	          // If no rootElement is detected, check if the parentElement is pinned to another element
	          parentHost = parentElement.data(NG_ANIMATE_PIN_DATA);
	          if (parentHost) {
	            // The pin target element becomes the next parent element
	            parentElement = parentHost;
	            continue;
	          }
	        }

	        parentElement = parentElement.parent();
	      }

	      var allowAnimation = (!parentAnimationDetected || animateChildren) && elementDisabled !== true;
	      return allowAnimation && rootElementDetected && bodyElementDetected;
	    }

	    function markElementAnimationState(element, state, details) {
	      details = details || {};
	      details.state = state;

	      var node = getDomNode(element);
	      node.setAttribute(NG_ANIMATE_ATTR_NAME, state);

	      var oldValue = activeAnimationsLookup.get(node);
	      var newValue = oldValue
	          ? extend(oldValue, details)
	          : details;
	      activeAnimationsLookup.put(node, newValue);
	    }
	  }];
	}];

	var $$AnimationProvider = ['$animateProvider', function($animateProvider) {
	  var NG_ANIMATE_REF_ATTR = 'ng-animate-ref';

	  var drivers = this.drivers = [];

	  var RUNNER_STORAGE_KEY = '$$animationRunner';

	  function setRunner(element, runner) {
	    element.data(RUNNER_STORAGE_KEY, runner);
	  }

	  function removeRunner(element) {
	    element.removeData(RUNNER_STORAGE_KEY);
	  }

	  function getRunner(element) {
	    return element.data(RUNNER_STORAGE_KEY);
	  }

	  this.$get = ['$$jqLite', '$rootScope', '$injector', '$$AnimateRunner', '$$HashMap', '$$rAFScheduler',
	       function($$jqLite,   $rootScope,   $injector,   $$AnimateRunner,   $$HashMap,   $$rAFScheduler) {

	    var animationQueue = [];
	    var applyAnimationClasses = applyAnimationClassesFactory($$jqLite);

	    function sortAnimations(animations) {
	      var tree = { children: [] };
	      var i, lookup = new $$HashMap();

	      // this is done first beforehand so that the hashmap
	      // is filled with a list of the elements that will be animated
	      for (i = 0; i < animations.length; i++) {
	        var animation = animations[i];
	        lookup.put(animation.domNode, animations[i] = {
	          domNode: animation.domNode,
	          fn: animation.fn,
	          children: []
	        });
	      }

	      for (i = 0; i < animations.length; i++) {
	        processNode(animations[i]);
	      }

	      return flatten(tree);

	      function processNode(entry) {
	        if (entry.processed) return entry;
	        entry.processed = true;

	        var elementNode = entry.domNode;
	        var parentNode = elementNode.parentNode;
	        lookup.put(elementNode, entry);

	        var parentEntry;
	        while (parentNode) {
	          parentEntry = lookup.get(parentNode);
	          if (parentEntry) {
	            if (!parentEntry.processed) {
	              parentEntry = processNode(parentEntry);
	            }
	            break;
	          }
	          parentNode = parentNode.parentNode;
	        }

	        (parentEntry || tree).children.push(entry);
	        return entry;
	      }

	      function flatten(tree) {
	        var result = [];
	        var queue = [];
	        var i;

	        for (i = 0; i < tree.children.length; i++) {
	          queue.push(tree.children[i]);
	        }

	        var remainingLevelEntries = queue.length;
	        var nextLevelEntries = 0;
	        var row = [];

	        for (i = 0; i < queue.length; i++) {
	          var entry = queue[i];
	          if (remainingLevelEntries <= 0) {
	            remainingLevelEntries = nextLevelEntries;
	            nextLevelEntries = 0;
	            result.push(row);
	            row = [];
	          }
	          row.push(entry.fn);
	          entry.children.forEach(function(childEntry) {
	            nextLevelEntries++;
	            queue.push(childEntry);
	          });
	          remainingLevelEntries--;
	        }

	        if (row.length) {
	          result.push(row);
	        }

	        return result;
	      }
	    }

	    // TODO(matsko): document the signature in a better way
	    return function(element, event, options) {
	      options = prepareAnimationOptions(options);
	      var isStructural = ['enter', 'move', 'leave'].indexOf(event) >= 0;

	      // there is no animation at the current moment, however
	      // these runner methods will get later updated with the
	      // methods leading into the driver's end/cancel methods
	      // for now they just stop the animation from starting
	      var runner = new $$AnimateRunner({
	        end: function() { close(); },
	        cancel: function() { close(true); }
	      });

	      if (!drivers.length) {
	        close();
	        return runner;
	      }

	      setRunner(element, runner);

	      var classes = mergeClasses(element.attr('class'), mergeClasses(options.addClass, options.removeClass));
	      var tempClasses = options.tempClasses;
	      if (tempClasses) {
	        classes += ' ' + tempClasses;
	        options.tempClasses = null;
	      }

	      var prepareClassName;
	      if (isStructural) {
	        prepareClassName = 'ng-' + event + PREPARE_CLASS_SUFFIX;
	        $$jqLite.addClass(element, prepareClassName);
	      }

	      animationQueue.push({
	        // this data is used by the postDigest code and passed into
	        // the driver step function
	        element: element,
	        classes: classes,
	        event: event,
	        structural: isStructural,
	        options: options,
	        beforeStart: beforeStart,
	        close: close
	      });

	      element.on('$destroy', handleDestroyedElement);

	      // we only want there to be one function called within the post digest
	      // block. This way we can group animations for all the animations that
	      // were apart of the same postDigest flush call.
	      if (animationQueue.length > 1) return runner;

	      $rootScope.$$postDigest(function() {
	        var animations = [];
	        forEach(animationQueue, function(entry) {
	          // the element was destroyed early on which removed the runner
	          // form its storage. This means we can't animate this element
	          // at all and it already has been closed due to destruction.
	          if (getRunner(entry.element)) {
	            animations.push(entry);
	          } else {
	            entry.close();
	          }
	        });

	        // now any future animations will be in another postDigest
	        animationQueue.length = 0;

	        var groupedAnimations = groupAnimations(animations);
	        var toBeSortedAnimations = [];

	        forEach(groupedAnimations, function(animationEntry) {
	          toBeSortedAnimations.push({
	            domNode: getDomNode(animationEntry.from ? animationEntry.from.element : animationEntry.element),
	            fn: function triggerAnimationStart() {
	              // it's important that we apply the `ng-animate` CSS class and the
	              // temporary classes before we do any driver invoking since these
	              // CSS classes may be required for proper CSS detection.
	              animationEntry.beforeStart();

	              var startAnimationFn, closeFn = animationEntry.close;

	              // in the event that the element was removed before the digest runs or
	              // during the RAF sequencing then we should not trigger the animation.
	              var targetElement = animationEntry.anchors
	                  ? (animationEntry.from.element || animationEntry.to.element)
	                  : animationEntry.element;

	              if (getRunner(targetElement)) {
	                var operation = invokeFirstDriver(animationEntry);
	                if (operation) {
	                  startAnimationFn = operation.start;
	                }
	              }

	              if (!startAnimationFn) {
	                closeFn();
	              } else {
	                var animationRunner = startAnimationFn();
	                animationRunner.done(function(status) {
	                  closeFn(!status);
	                });
	                updateAnimationRunners(animationEntry, animationRunner);
	              }
	            }
	          });
	        });

	        // we need to sort each of the animations in order of parent to child
	        // relationships. This ensures that the child classes are applied at the
	        // right time.
	        $$rAFScheduler(sortAnimations(toBeSortedAnimations));
	      });

	      return runner;

	      // TODO(matsko): change to reference nodes
	      function getAnchorNodes(node) {
	        var SELECTOR = '[' + NG_ANIMATE_REF_ATTR + ']';
	        var items = node.hasAttribute(NG_ANIMATE_REF_ATTR)
	              ? [node]
	              : node.querySelectorAll(SELECTOR);
	        var anchors = [];
	        forEach(items, function(node) {
	          var attr = node.getAttribute(NG_ANIMATE_REF_ATTR);
	          if (attr && attr.length) {
	            anchors.push(node);
	          }
	        });
	        return anchors;
	      }

	      function groupAnimations(animations) {
	        var preparedAnimations = [];
	        var refLookup = {};
	        forEach(animations, function(animation, index) {
	          var element = animation.element;
	          var node = getDomNode(element);
	          var event = animation.event;
	          var enterOrMove = ['enter', 'move'].indexOf(event) >= 0;
	          var anchorNodes = animation.structural ? getAnchorNodes(node) : [];

	          if (anchorNodes.length) {
	            var direction = enterOrMove ? 'to' : 'from';

	            forEach(anchorNodes, function(anchor) {
	              var key = anchor.getAttribute(NG_ANIMATE_REF_ATTR);
	              refLookup[key] = refLookup[key] || {};
	              refLookup[key][direction] = {
	                animationID: index,
	                element: jqLite(anchor)
	              };
	            });
	          } else {
	            preparedAnimations.push(animation);
	          }
	        });

	        var usedIndicesLookup = {};
	        var anchorGroups = {};
	        forEach(refLookup, function(operations, key) {
	          var from = operations.from;
	          var to = operations.to;

	          if (!from || !to) {
	            // only one of these is set therefore we can't have an
	            // anchor animation since all three pieces are required
	            var index = from ? from.animationID : to.animationID;
	            var indexKey = index.toString();
	            if (!usedIndicesLookup[indexKey]) {
	              usedIndicesLookup[indexKey] = true;
	              preparedAnimations.push(animations[index]);
	            }
	            return;
	          }

	          var fromAnimation = animations[from.animationID];
	          var toAnimation = animations[to.animationID];
	          var lookupKey = from.animationID.toString();
	          if (!anchorGroups[lookupKey]) {
	            var group = anchorGroups[lookupKey] = {
	              structural: true,
	              beforeStart: function() {
	                fromAnimation.beforeStart();
	                toAnimation.beforeStart();
	              },
	              close: function() {
	                fromAnimation.close();
	                toAnimation.close();
	              },
	              classes: cssClassesIntersection(fromAnimation.classes, toAnimation.classes),
	              from: fromAnimation,
	              to: toAnimation,
	              anchors: [] // TODO(matsko): change to reference nodes
	            };

	            // the anchor animations require that the from and to elements both have at least
	            // one shared CSS class which effectively marries the two elements together to use
	            // the same animation driver and to properly sequence the anchor animation.
	            if (group.classes.length) {
	              preparedAnimations.push(group);
	            } else {
	              preparedAnimations.push(fromAnimation);
	              preparedAnimations.push(toAnimation);
	            }
	          }

	          anchorGroups[lookupKey].anchors.push({
	            'out': from.element, 'in': to.element
	          });
	        });

	        return preparedAnimations;
	      }

	      function cssClassesIntersection(a,b) {
	        a = a.split(' ');
	        b = b.split(' ');
	        var matches = [];

	        for (var i = 0; i < a.length; i++) {
	          var aa = a[i];
	          if (aa.substring(0,3) === 'ng-') continue;

	          for (var j = 0; j < b.length; j++) {
	            if (aa === b[j]) {
	              matches.push(aa);
	              break;
	            }
	          }
	        }

	        return matches.join(' ');
	      }

	      function invokeFirstDriver(animationDetails) {
	        // we loop in reverse order since the more general drivers (like CSS and JS)
	        // may attempt more elements, but custom drivers are more particular
	        for (var i = drivers.length - 1; i >= 0; i--) {
	          var driverName = drivers[i];
	          if (!$injector.has(driverName)) continue; // TODO(matsko): remove this check

	          var factory = $injector.get(driverName);
	          var driver = factory(animationDetails);
	          if (driver) {
	            return driver;
	          }
	        }
	      }

	      function beforeStart() {
	        element.addClass(NG_ANIMATE_CLASSNAME);
	        if (tempClasses) {
	          $$jqLite.addClass(element, tempClasses);
	        }
	        if (prepareClassName) {
	          $$jqLite.removeClass(element, prepareClassName);
	          prepareClassName = null;
	        }
	      }

	      function updateAnimationRunners(animation, newRunner) {
	        if (animation.from && animation.to) {
	          update(animation.from.element);
	          update(animation.to.element);
	        } else {
	          update(animation.element);
	        }

	        function update(element) {
	          getRunner(element).setHost(newRunner);
	        }
	      }

	      function handleDestroyedElement() {
	        var runner = getRunner(element);
	        if (runner && (event !== 'leave' || !options.$$domOperationFired)) {
	          runner.end();
	        }
	      }

	      function close(rejected) { // jshint ignore:line
	        element.off('$destroy', handleDestroyedElement);
	        removeRunner(element);

	        applyAnimationClasses(element, options);
	        applyAnimationStyles(element, options);
	        options.domOperation();

	        if (tempClasses) {
	          $$jqLite.removeClass(element, tempClasses);
	        }

	        element.removeClass(NG_ANIMATE_CLASSNAME);
	        runner.complete(!rejected);
	      }
	    };
	  }];
	}];

	/**
	 * @ngdoc directive
	 * @name ngAnimateSwap
	 * @restrict A
	 * @scope
	 *
	 * @description
	 *
	 * ngAnimateSwap is a animation-oriented directive that allows for the container to
	 * be removed and entered in whenever the associated expression changes. A
	 * common usecase for this directive is a rotating banner component which
	 * contains one image being present at a time. When the active image changes
	 * then the old image will perform a `leave` animation and the new element
	 * will be inserted via an `enter` animation.
	 *
	 * @example
	 * <example name="ngAnimateSwap-directive" module="ngAnimateSwapExample"
	 *          deps="angular-animate.js"
	 *          animations="true" fixBase="true">
	 *   <file name="index.html">
	 *     <div class="container" ng-controller="AppCtrl">
	 *       <div ng-animate-swap="number" class="cell swap-animation" ng-class="colorClass(number)">
	 *         {{ number }}
	 *       </div>
	 *     </div>
	 *   </file>
	 *   <file name="script.js">
	 *     angular.module('ngAnimateSwapExample', ['ngAnimate'])
	 *       .controller('AppCtrl', ['$scope', '$interval', function($scope, $interval) {
	 *         $scope.number = 0;
	 *         $interval(function() {
	 *           $scope.number++;
	 *         }, 1000);
	 *
	 *         var colors = ['red','blue','green','yellow','orange'];
	 *         $scope.colorClass = function(number) {
	 *           return colors[number % colors.length];
	 *         };
	 *       }]);
	 *   </file>
	 *  <file name="animations.css">
	 *  .container {
	 *    height:250px;
	 *    width:250px;
	 *    position:relative;
	 *    overflow:hidden;
	 *    border:2px solid black;
	 *  }
	 *  .container .cell {
	 *    font-size:150px;
	 *    text-align:center;
	 *    line-height:250px;
	 *    position:absolute;
	 *    top:0;
	 *    left:0;
	 *    right:0;
	 *    border-bottom:2px solid black;
	 *  }
	 *  .swap-animation.ng-enter, .swap-animation.ng-leave {
	 *    transition:0.5s linear all;
	 *  }
	 *  .swap-animation.ng-enter {
	 *    top:-250px;
	 *  }
	 *  .swap-animation.ng-enter-active {
	 *    top:0px;
	 *  }
	 *  .swap-animation.ng-leave {
	 *    top:0px;
	 *  }
	 *  .swap-animation.ng-leave-active {
	 *    top:250px;
	 *  }
	 *  .red { background:red; }
	 *  .green { background:green; }
	 *  .blue { background:blue; }
	 *  .yellow { background:yellow; }
	 *  .orange { background:orange; }
	 *  </file>
	 * </example>
	 */
	var ngAnimateSwapDirective = ['$animate', '$rootScope', function($animate, $rootScope) {
	  return {
	    restrict: 'A',
	    transclude: 'element',
	    terminal: true,
	    priority: 600, // we use 600 here to ensure that the directive is caught before others
	    link: function(scope, $element, attrs, ctrl, $transclude) {
	      var previousElement, previousScope;
	      scope.$watchCollection(attrs.ngAnimateSwap || attrs['for'], function(value) {
	        if (previousElement) {
	          $animate.leave(previousElement);
	        }
	        if (previousScope) {
	          previousScope.$destroy();
	          previousScope = null;
	        }
	        if (value || value === 0) {
	          previousScope = scope.$new();
	          $transclude(previousScope, function(element) {
	            previousElement = element;
	            $animate.enter(element, null, $element);
	          });
	        }
	      });
	    }
	  };
	}];

	/* global angularAnimateModule: true,

	   ngAnimateSwapDirective,
	   $$AnimateAsyncRunFactory,
	   $$rAFSchedulerFactory,
	   $$AnimateChildrenDirective,
	   $$AnimateQueueProvider,
	   $$AnimationProvider,
	   $AnimateCssProvider,
	   $$AnimateCssDriverProvider,
	   $$AnimateJsProvider,
	   $$AnimateJsDriverProvider,
	*/

	/**
	 * @ngdoc module
	 * @name ngAnimate
	 * @description
	 *
	 * The `ngAnimate` module provides support for CSS-based animations (keyframes and transitions) as well as JavaScript-based animations via
	 * callback hooks. Animations are not enabled by default, however, by including `ngAnimate` the animation hooks are enabled for an Angular app.
	 *
	 * <div doc-module-components="ngAnimate"></div>
	 *
	 * # Usage
	 * Simply put, there are two ways to make use of animations when ngAnimate is used: by using **CSS** and **JavaScript**. The former works purely based
	 * using CSS (by using matching CSS selectors/styles) and the latter triggers animations that are registered via `module.animation()`. For
	 * both CSS and JS animations the sole requirement is to have a matching `CSS class` that exists both in the registered animation and within
	 * the HTML element that the animation will be triggered on.
	 *
	 * ## Directive Support
	 * The following directives are "animation aware":
	 *
	 * | Directive                                                                                                | Supported Animations                                                     |
	 * |----------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
	 * | {@link ng.directive:ngRepeat#animations ngRepeat}                                                        | enter, leave and move                                                    |
	 * | {@link ngRoute.directive:ngView#animations ngView}                                                       | enter and leave                                                          |
	 * | {@link ng.directive:ngInclude#animations ngInclude}                                                      | enter and leave                                                          |
	 * | {@link ng.directive:ngSwitch#animations ngSwitch}                                                        | enter and leave                                                          |
	 * | {@link ng.directive:ngIf#animations ngIf}                                                                | enter and leave                                                          |
	 * | {@link ng.directive:ngClass#animations ngClass}                                                          | add and remove (the CSS class(es) present)                               |
	 * | {@link ng.directive:ngShow#animations ngShow} & {@link ng.directive:ngHide#animations ngHide}            | add and remove (the ng-hide class value)                                 |
	 * | {@link ng.directive:form#animation-hooks form} & {@link ng.directive:ngModel#animation-hooks ngModel}    | add and remove (dirty, pristine, valid, invalid & all other validations) |
	 * | {@link module:ngMessages#animations ngMessages}                                                          | add and remove (ng-active & ng-inactive)                                 |
	 * | {@link module:ngMessages#animations ngMessage}                                                           | enter and leave                                                          |
	 *
	 * (More information can be found by visiting each the documentation associated with each directive.)
	 *
	 * ## CSS-based Animations
	 *
	 * CSS-based animations with ngAnimate are unique since they require no JavaScript code at all. By using a CSS class that we reference between our HTML
	 * and CSS code we can create an animation that will be picked up by Angular when an the underlying directive performs an operation.
	 *
	 * The example below shows how an `enter` animation can be made possible on an element using `ng-if`:
	 *
	 * ```html
	 * <div ng-if="bool" class="fade">
	 *    Fade me in out
	 * </div>
	 * <button ng-click="bool=true">Fade In!</button>
	 * <button ng-click="bool=false">Fade Out!</button>
	 * ```
	 *
	 * Notice the CSS class **fade**? We can now create the CSS transition code that references this class:
	 *
	 * ```css
	 * /&#42; The starting CSS styles for the enter animation &#42;/
	 * .fade.ng-enter {
	 *   transition:0.5s linear all;
	 *   opacity:0;
	 * }
	 *
	 * /&#42; The finishing CSS styles for the enter animation &#42;/
	 * .fade.ng-enter.ng-enter-active {
	 *   opacity:1;
	 * }
	 * ```
	 *
	 * The key thing to remember here is that, depending on the animation event (which each of the directives above trigger depending on what's going on) two
	 * generated CSS classes will be applied to the element; in the example above we have `.ng-enter` and `.ng-enter-active`. For CSS transitions, the transition
	 * code **must** be defined within the starting CSS class (in this case `.ng-enter`). The destination class is what the transition will animate towards.
	 *
	 * If for example we wanted to create animations for `leave` and `move` (ngRepeat triggers move) then we can do so using the same CSS naming conventions:
	 *
	 * ```css
	 * /&#42; now the element will fade out before it is removed from the DOM &#42;/
	 * .fade.ng-leave {
	 *   transition:0.5s linear all;
	 *   opacity:1;
	 * }
	 * .fade.ng-leave.ng-leave-active {
	 *   opacity:0;
	 * }
	 * ```
	 *
	 * We can also make use of **CSS Keyframes** by referencing the keyframe animation within the starting CSS class:
	 *
	 * ```css
	 * /&#42; there is no need to define anything inside of the destination
	 * CSS class since the keyframe will take charge of the animation &#42;/
	 * .fade.ng-leave {
	 *   animation: my_fade_animation 0.5s linear;
	 *   -webkit-animation: my_fade_animation 0.5s linear;
	 * }
	 *
	 * @keyframes my_fade_animation {
	 *   from { opacity:1; }
	 *   to { opacity:0; }
	 * }
	 *
	 * @-webkit-keyframes my_fade_animation {
	 *   from { opacity:1; }
	 *   to { opacity:0; }
	 * }
	 * ```
	 *
	 * Feel free also mix transitions and keyframes together as well as any other CSS classes on the same element.
	 *
	 * ### CSS Class-based Animations
	 *
	 * Class-based animations (animations that are triggered via `ngClass`, `ngShow`, `ngHide` and some other directives) have a slightly different
	 * naming convention. Class-based animations are basic enough that a standard transition or keyframe can be referenced on the class being added
	 * and removed.
	 *
	 * For example if we wanted to do a CSS animation for `ngHide` then we place an animation on the `.ng-hide` CSS class:
	 *
	 * ```html
	 * <div ng-show="bool" class="fade">
	 *   Show and hide me
	 * </div>
	 * <button ng-click="bool=true">Toggle</button>
	 *
	 * <style>
	 * .fade.ng-hide {
	 *   transition:0.5s linear all;
	 *   opacity:0;
	 * }
	 * </style>
	 * ```
	 *
	 * All that is going on here with ngShow/ngHide behind the scenes is the `.ng-hide` class is added/removed (when the hidden state is valid). Since
	 * ngShow and ngHide are animation aware then we can match up a transition and ngAnimate handles the rest.
	 *
	 * In addition the addition and removal of the CSS class, ngAnimate also provides two helper methods that we can use to further decorate the animation
	 * with CSS styles.
	 *
	 * ```html
	 * <div ng-class="{on:onOff}" class="highlight">
	 *   Highlight this box
	 * </div>
	 * <button ng-click="onOff=!onOff">Toggle</button>
	 *
	 * <style>
	 * .highlight {
	 *   transition:0.5s linear all;
	 * }
	 * .highlight.on-add {
	 *   background:white;
	 * }
	 * .highlight.on {
	 *   background:yellow;
	 * }
	 * .highlight.on-remove {
	 *   background:black;
	 * }
	 * </style>
	 * ```
	 *
	 * We can also make use of CSS keyframes by placing them within the CSS classes.
	 *
	 *
	 * ### CSS Staggering Animations
	 * A Staggering animation is a collection of animations that are issued with a slight delay in between each successive operation resulting in a
	 * curtain-like effect. The ngAnimate module (versions >=1.2) supports staggering animations and the stagger effect can be
	 * performed by creating a **ng-EVENT-stagger** CSS class and attaching that class to the base CSS class used for
	 * the animation. The style property expected within the stagger class can either be a **transition-delay** or an
	 * **animation-delay** property (or both if your animation contains both transitions and keyframe animations).
	 *
	 * ```css
	 * .my-animation.ng-enter {
	 *   /&#42; standard transition code &#42;/
	 *   transition: 1s linear all;
	 *   opacity:0;
	 * }
	 * .my-animation.ng-enter-stagger {
	 *   /&#42; this will have a 100ms delay between each successive leave animation &#42;/
	 *   transition-delay: 0.1s;
	 *
	 *   /&#42; As of 1.4.4, this must always be set: it signals ngAnimate
	 *     to not accidentally inherit a delay property from another CSS class &#42;/
	 *   transition-duration: 0s;
	 * }
	 * .my-animation.ng-enter.ng-enter-active {
	 *   /&#42; standard transition styles &#42;/
	 *   opacity:1;
	 * }
	 * ```
	 *
	 * Staggering animations work by default in ngRepeat (so long as the CSS class is defined). Outside of ngRepeat, to use staggering animations
	 * on your own, they can be triggered by firing multiple calls to the same event on $animate. However, the restrictions surrounding this
	 * are that each of the elements must have the same CSS className value as well as the same parent element. A stagger operation
	 * will also be reset if one or more animation frames have passed since the multiple calls to `$animate` were fired.
	 *
	 * The following code will issue the **ng-leave-stagger** event on the element provided:
	 *
	 * ```js
	 * var kids = parent.children();
	 *
	 * $animate.leave(kids[0]); //stagger index=0
	 * $animate.leave(kids[1]); //stagger index=1
	 * $animate.leave(kids[2]); //stagger index=2
	 * $animate.leave(kids[3]); //stagger index=3
	 * $animate.leave(kids[4]); //stagger index=4
	 *
	 * window.requestAnimationFrame(function() {
	 *   //stagger has reset itself
	 *   $animate.leave(kids[5]); //stagger index=0
	 *   $animate.leave(kids[6]); //stagger index=1
	 *
	 *   $scope.$digest();
	 * });
	 * ```
	 *
	 * Stagger animations are currently only supported within CSS-defined animations.
	 *
	 * ### The `ng-animate` CSS class
	 *
	 * When ngAnimate is animating an element it will apply the `ng-animate` CSS class to the element for the duration of the animation.
	 * This is a temporary CSS class and it will be removed once the animation is over (for both JavaScript and CSS-based animations).
	 *
	 * Therefore, animations can be applied to an element using this temporary class directly via CSS.
	 *
	 * ```css
	 * .zipper.ng-animate {
	 *   transition:0.5s linear all;
	 * }
	 * .zipper.ng-enter {
	 *   opacity:0;
	 * }
	 * .zipper.ng-enter.ng-enter-active {
	 *   opacity:1;
	 * }
	 * .zipper.ng-leave {
	 *   opacity:1;
	 * }
	 * .zipper.ng-leave.ng-leave-active {
	 *   opacity:0;
	 * }
	 * ```
	 *
	 * (Note that the `ng-animate` CSS class is reserved and it cannot be applied on an element directly since ngAnimate will always remove
	 * the CSS class once an animation has completed.)
	 *
	 *
	 * ### The `ng-[event]-prepare` class
	 *
	 * This is a special class that can be used to prevent unwanted flickering / flash of content before
	 * the actual animation starts. The class is added as soon as an animation is initialized, but removed
	 * before the actual animation starts (after waiting for a $digest).
	 * It is also only added for *structural* animations (`enter`, `move`, and `leave`).
	 *
	 * In practice, flickering can appear when nesting elements with structural animations such as `ngIf`
	 * into elements that have class-based animations such as `ngClass`.
	 *
	 * ```html
	 * <div ng-class="{red: myProp}">
	 *   <div ng-class="{blue: myProp}">
	 *     <div class="message" ng-if="myProp"></div>
	 *   </div>
	 * </div>
	 * ```
	 *
	 * It is possible that during the `enter` animation, the `.message` div will be briefly visible before it starts animating.
	 * In that case, you can add styles to the CSS that make sure the element stays hidden before the animation starts:
	 *
	 * ```css
	 * .message.ng-enter-prepare {
	 *   opacity: 0;
	 * }
	 *
	 * ```
	 *
	 * ## JavaScript-based Animations
	 *
	 * ngAnimate also allows for animations to be consumed by JavaScript code. The approach is similar to CSS-based animations (where there is a shared
	 * CSS class that is referenced in our HTML code) but in addition we need to register the JavaScript animation on the module. By making use of the
	 * `module.animation()` module function we can register the animation.
	 *
	 * Let's see an example of a enter/leave animation using `ngRepeat`:
	 *
	 * ```html
	 * <div ng-repeat="item in items" class="slide">
	 *   {{ item }}
	 * </div>
	 * ```
	 *
	 * See the **slide** CSS class? Let's use that class to define an animation that we'll structure in our module code by using `module.animation`:
	 *
	 * ```js
	 * myModule.animation('.slide', [function() {
	 *   return {
	 *     // make note that other events (like addClass/removeClass)
	 *     // have different function input parameters
	 *     enter: function(element, doneFn) {
	 *       jQuery(element).fadeIn(1000, doneFn);
	 *
	 *       // remember to call doneFn so that angular
	 *       // knows that the animation has concluded
	 *     },
	 *
	 *     move: function(element, doneFn) {
	 *       jQuery(element).fadeIn(1000, doneFn);
	 *     },
	 *
	 *     leave: function(element, doneFn) {
	 *       jQuery(element).fadeOut(1000, doneFn);
	 *     }
	 *   }
	 * }]);
	 * ```
	 *
	 * The nice thing about JS-based animations is that we can inject other services and make use of advanced animation libraries such as
	 * greensock.js and velocity.js.
	 *
	 * If our animation code class-based (meaning that something like `ngClass`, `ngHide` and `ngShow` triggers it) then we can still define
	 * our animations inside of the same registered animation, however, the function input arguments are a bit different:
	 *
	 * ```html
	 * <div ng-class="color" class="colorful">
	 *   this box is moody
	 * </div>
	 * <button ng-click="color='red'">Change to red</button>
	 * <button ng-click="color='blue'">Change to blue</button>
	 * <button ng-click="color='green'">Change to green</button>
	 * ```
	 *
	 * ```js
	 * myModule.animation('.colorful', [function() {
	 *   return {
	 *     addClass: function(element, className, doneFn) {
	 *       // do some cool animation and call the doneFn
	 *     },
	 *     removeClass: function(element, className, doneFn) {
	 *       // do some cool animation and call the doneFn
	 *     },
	 *     setClass: function(element, addedClass, removedClass, doneFn) {
	 *       // do some cool animation and call the doneFn
	 *     }
	 *   }
	 * }]);
	 * ```
	 *
	 * ## CSS + JS Animations Together
	 *
	 * AngularJS 1.4 and higher has taken steps to make the amalgamation of CSS and JS animations more flexible. However, unlike earlier versions of Angular,
	 * defining CSS and JS animations to work off of the same CSS class will not work anymore. Therefore the example below will only result in **JS animations taking
	 * charge of the animation**:
	 *
	 * ```html
	 * <div ng-if="bool" class="slide">
	 *   Slide in and out
	 * </div>
	 * ```
	 *
	 * ```js
	 * myModule.animation('.slide', [function() {
	 *   return {
	 *     enter: function(element, doneFn) {
	 *       jQuery(element).slideIn(1000, doneFn);
	 *     }
	 *   }
	 * }]);
	 * ```
	 *
	 * ```css
	 * .slide.ng-enter {
	 *   transition:0.5s linear all;
	 *   transform:translateY(-100px);
	 * }
	 * .slide.ng-enter.ng-enter-active {
	 *   transform:translateY(0);
	 * }
	 * ```
	 *
	 * Does this mean that CSS and JS animations cannot be used together? Do JS-based animations always have higher priority? We can make up for the
	 * lack of CSS animations by using the `$animateCss` service to trigger our own tweaked-out, CSS-based animations directly from
	 * our own JS-based animation code:
	 *
	 * ```js
	 * myModule.animation('.slide', ['$animateCss', function($animateCss) {
	 *   return {
	 *     enter: function(element) {
	*        // this will trigger `.slide.ng-enter` and `.slide.ng-enter-active`.
	 *       return $animateCss(element, {
	 *         event: 'enter',
	 *         structural: true
	 *       });
	 *     }
	 *   }
	 * }]);
	 * ```
	 *
	 * The nice thing here is that we can save bandwidth by sticking to our CSS-based animation code and we don't need to rely on a 3rd-party animation framework.
	 *
	 * The `$animateCss` service is very powerful since we can feed in all kinds of extra properties that will be evaluated and fed into a CSS transition or
	 * keyframe animation. For example if we wanted to animate the height of an element while adding and removing classes then we can do so by providing that
	 * data into `$animateCss` directly:
	 *
	 * ```js
	 * myModule.animation('.slide', ['$animateCss', function($animateCss) {
	 *   return {
	 *     enter: function(element) {
	 *       return $animateCss(element, {
	 *         event: 'enter',
	 *         structural: true,
	 *         addClass: 'maroon-setting',
	 *         from: { height:0 },
	 *         to: { height: 200 }
	 *       });
	 *     }
	 *   }
	 * }]);
	 * ```
	 *
	 * Now we can fill in the rest via our transition CSS code:
	 *
	 * ```css
	 * /&#42; the transition tells ngAnimate to make the animation happen &#42;/
	 * .slide.ng-enter { transition:0.5s linear all; }
	 *
	 * /&#42; this extra CSS class will be absorbed into the transition
	 * since the $animateCss code is adding the class &#42;/
	 * .maroon-setting { background:red; }
	 * ```
	 *
	 * And `$animateCss` will figure out the rest. Just make sure to have the `done()` callback fire the `doneFn` function to signal when the animation is over.
	 *
	 * To learn more about what's possible be sure to visit the {@link ngAnimate.$animateCss $animateCss service}.
	 *
	 * ## Animation Anchoring (via `ng-animate-ref`)
	 *
	 * ngAnimate in AngularJS 1.4 comes packed with the ability to cross-animate elements between
	 * structural areas of an application (like views) by pairing up elements using an attribute
	 * called `ng-animate-ref`.
	 *
	 * Let's say for example we have two views that are managed by `ng-view` and we want to show
	 * that there is a relationship between two components situated in within these views. By using the
	 * `ng-animate-ref` attribute we can identify that the two components are paired together and we
	 * can then attach an animation, which is triggered when the view changes.
	 *
	 * Say for example we have the following template code:
	 *
	 * ```html
	 * <!-- index.html -->
	 * <div ng-view class="view-animation">
	 * </div>
	 *
	 * <!-- home.html -->
	 * <a href="#/banner-page">
	 *   <img src="./banner.jpg" class="banner" ng-animate-ref="banner">
	 * </a>
	 *
	 * <!-- banner-page.html -->
	 * <img src="./banner.jpg" class="banner" ng-animate-ref="banner">
	 * ```
	 *
	 * Now, when the view changes (once the link is clicked), ngAnimate will examine the
	 * HTML contents to see if there is a match reference between any components in the view
	 * that is leaving and the view that is entering. It will scan both the view which is being
	 * removed (leave) and inserted (enter) to see if there are any paired DOM elements that
	 * contain a matching ref value.
	 *
	 * The two images match since they share the same ref value. ngAnimate will now create a
	 * transport element (which is a clone of the first image element) and it will then attempt
	 * to animate to the position of the second image element in the next view. For the animation to
	 * work a special CSS class called `ng-anchor` will be added to the transported element.
	 *
	 * We can now attach a transition onto the `.banner.ng-anchor` CSS class and then
	 * ngAnimate will handle the entire transition for us as well as the addition and removal of
	 * any changes of CSS classes between the elements:
	 *
	 * ```css
	 * .banner.ng-anchor {
	 *   /&#42; this animation will last for 1 second since there are
	 *          two phases to the animation (an `in` and an `out` phase) &#42;/
	 *   transition:0.5s linear all;
	 * }
	 * ```
	 *
	 * We also **must** include animations for the views that are being entered and removed
	 * (otherwise anchoring wouldn't be possible since the new view would be inserted right away).
	 *
	 * ```css
	 * .view-animation.ng-enter, .view-animation.ng-leave {
	 *   transition:0.5s linear all;
	 *   position:fixed;
	 *   left:0;
	 *   top:0;
	 *   width:100%;
	 * }
	 * .view-animation.ng-enter {
	 *   transform:translateX(100%);
	 * }
	 * .view-animation.ng-leave,
	 * .view-animation.ng-enter.ng-enter-active {
	 *   transform:translateX(0%);
	 * }
	 * .view-animation.ng-leave.ng-leave-active {
	 *   transform:translateX(-100%);
	 * }
	 * ```
	 *
	 * Now we can jump back to the anchor animation. When the animation happens, there are two stages that occur:
	 * an `out` and an `in` stage. The `out` stage happens first and that is when the element is animated away
	 * from its origin. Once that animation is over then the `in` stage occurs which animates the
	 * element to its destination. The reason why there are two animations is to give enough time
	 * for the enter animation on the new element to be ready.
	 *
	 * The example above sets up a transition for both the in and out phases, but we can also target the out or
	 * in phases directly via `ng-anchor-out` and `ng-anchor-in`.
	 *
	 * ```css
	 * .banner.ng-anchor-out {
	 *   transition: 0.5s linear all;
	 *
	 *   /&#42; the scale will be applied during the out animation,
	 *          but will be animated away when the in animation runs &#42;/
	 *   transform: scale(1.2);
	 * }
	 *
	 * .banner.ng-anchor-in {
	 *   transition: 1s linear all;
	 * }
	 * ```
	 *
	 *
	 *
	 *
	 * ### Anchoring Demo
	 *
	  <example module="anchoringExample"
	           name="anchoringExample"
	           id="anchoringExample"
	           deps="angular-animate.js;angular-route.js"
	           animations="true">
	    <file name="index.html">
	      <a href="#/">Home</a>
	      <hr />
	      <div class="view-container">
	        <div ng-view class="view"></div>
	      </div>
	    </file>
	    <file name="script.js">
	      angular.module('anchoringExample', ['ngAnimate', 'ngRoute'])
	        .config(['$routeProvider', function($routeProvider) {
	          $routeProvider.when('/', {
	            templateUrl: 'home.html',
	            controller: 'HomeController as home'
	          });
	          $routeProvider.when('/profile/:id', {
	            templateUrl: 'profile.html',
	            controller: 'ProfileController as profile'
	          });
	        }])
	        .run(['$rootScope', function($rootScope) {
	          $rootScope.records = [
	            { id:1, title: "Miss Beulah Roob" },
	            { id:2, title: "Trent Morissette" },
	            { id:3, title: "Miss Ava Pouros" },
	            { id:4, title: "Rod Pouros" },
	            { id:5, title: "Abdul Rice" },
	            { id:6, title: "Laurie Rutherford Sr." },
	            { id:7, title: "Nakia McLaughlin" },
	            { id:8, title: "Jordon Blanda DVM" },
	            { id:9, title: "Rhoda Hand" },
	            { id:10, title: "Alexandrea Sauer" }
	          ];
	        }])
	        .controller('HomeController', [function() {
	          //empty
	        }])
	        .controller('ProfileController', ['$rootScope', '$routeParams', function($rootScope, $routeParams) {
	          var index = parseInt($routeParams.id, 10);
	          var record = $rootScope.records[index - 1];

	          this.title = record.title;
	          this.id = record.id;
	        }]);
	    </file>
	    <file name="home.html">
	      <h2>Welcome to the home page</h1>
	      <p>Please click on an element</p>
	      <a class="record"
	         ng-href="#/profile/{{ record.id }}"
	         ng-animate-ref="{{ record.id }}"
	         ng-repeat="record in records">
	        {{ record.title }}
	      </a>
	    </file>
	    <file name="profile.html">
	      <div class="profile record" ng-animate-ref="{{ profile.id }}">
	        {{ profile.title }}
	      </div>
	    </file>
	    <file name="animations.css">
	      .record {
	        display:block;
	        font-size:20px;
	      }
	      .profile {
	        background:black;
	        color:white;
	        font-size:100px;
	      }
	      .view-container {
	        position:relative;
	      }
	      .view-container > .view.ng-animate {
	        position:absolute;
	        top:0;
	        left:0;
	        width:100%;
	        min-height:500px;
	      }
	      .view.ng-enter, .view.ng-leave,
	      .record.ng-anchor {
	        transition:0.5s linear all;
	      }
	      .view.ng-enter {
	        transform:translateX(100%);
	      }
	      .view.ng-enter.ng-enter-active, .view.ng-leave {
	        transform:translateX(0%);
	      }
	      .view.ng-leave.ng-leave-active {
	        transform:translateX(-100%);
	      }
	      .record.ng-anchor-out {
	        background:red;
	      }
	    </file>
	  </example>
	 *
	 * ### How is the element transported?
	 *
	 * When an anchor animation occurs, ngAnimate will clone the starting element and position it exactly where the starting
	 * element is located on screen via absolute positioning. The cloned element will be placed inside of the root element
	 * of the application (where ng-app was defined) and all of the CSS classes of the starting element will be applied. The
	 * element will then animate into the `out` and `in` animations and will eventually reach the coordinates and match
	 * the dimensions of the destination element. During the entire animation a CSS class of `.ng-animate-shim` will be applied
	 * to both the starting and destination elements in order to hide them from being visible (the CSS styling for the class
	 * is: `visibility:hidden`). Once the anchor reaches its destination then it will be removed and the destination element
	 * will become visible since the shim class will be removed.
	 *
	 * ### How is the morphing handled?
	 *
	 * CSS Anchoring relies on transitions and keyframes and the internal code is intelligent enough to figure out
	 * what CSS classes differ between the starting element and the destination element. These different CSS classes
	 * will be added/removed on the anchor element and a transition will be applied (the transition that is provided
	 * in the anchor class). Long story short, ngAnimate will figure out what classes to add and remove which will
	 * make the transition of the element as smooth and automatic as possible. Be sure to use simple CSS classes that
	 * do not rely on DOM nesting structure so that the anchor element appears the same as the starting element (since
	 * the cloned element is placed inside of root element which is likely close to the body element).
	 *
	 * Note that if the root element is on the `<html>` element then the cloned node will be placed inside of body.
	 *
	 *
	 * ## Using $animate in your directive code
	 *
	 * So far we've explored how to feed in animations into an Angular application, but how do we trigger animations within our own directives in our application?
	 * By injecting the `$animate` service into our directive code, we can trigger structural and class-based hooks which can then be consumed by animations. Let's
	 * imagine we have a greeting box that shows and hides itself when the data changes
	 *
	 * ```html
	 * <greeting-box active="onOrOff">Hi there</greeting-box>
	 * ```
	 *
	 * ```js
	 * ngModule.directive('greetingBox', ['$animate', function($animate) {
	 *   return function(scope, element, attrs) {
	 *     attrs.$observe('active', function(value) {
	 *       value ? $animate.addClass(element, 'on') : $animate.removeClass(element, 'on');
	 *     });
	 *   });
	 * }]);
	 * ```
	 *
	 * Now the `on` CSS class is added and removed on the greeting box component. Now if we add a CSS class on top of the greeting box element
	 * in our HTML code then we can trigger a CSS or JS animation to happen.
	 *
	 * ```css
	 * /&#42; normally we would create a CSS class to reference on the element &#42;/
	 * greeting-box.on { transition:0.5s linear all; background:green; color:white; }
	 * ```
	 *
	 * The `$animate` service contains a variety of other methods like `enter`, `leave`, `animate` and `setClass`. To learn more about what's
	 * possible be sure to visit the {@link ng.$animate $animate service API page}.
	 *
	 *
	 * ### Preventing Collisions With Third Party Libraries
	 *
	 * Some third-party frameworks place animation duration defaults across many element or className
	 * selectors in order to make their code small and reuseable. This can lead to issues with ngAnimate, which
	 * is expecting actual animations on these elements and has to wait for their completion.
	 *
	 * You can prevent this unwanted behavior by using a prefix on all your animation classes:
	 *
	 * ```css
	 * /&#42; prefixed with animate- &#42;/
	 * .animate-fade-add.animate-fade-add-active {
	 *   transition:1s linear all;
	 *   opacity:0;
	 * }
	 * ```
	 *
	 * You then configure `$animate` to enforce this prefix:
	 *
	 * ```js
	 * $animateProvider.classNameFilter(/animate-/);
	 * ```
	 *
	 * This also may provide your application with a speed boost since only specific elements containing CSS class prefix
	 * will be evaluated for animation when any DOM changes occur in the application.
	 *
	 * ## Callbacks and Promises
	 *
	 * When `$animate` is called it returns a promise that can be used to capture when the animation has ended. Therefore if we were to trigger
	 * an animation (within our directive code) then we can continue performing directive and scope related activities after the animation has
	 * ended by chaining onto the returned promise that animation method returns.
	 *
	 * ```js
	 * // somewhere within the depths of the directive
	 * $animate.enter(element, parent).then(function() {
	 *   //the animation has completed
	 * });
	 * ```
	 *
	 * (Note that earlier versions of Angular prior to v1.4 required the promise code to be wrapped using `$scope.$apply(...)`. This is not the case
	 * anymore.)
	 *
	 * In addition to the animation promise, we can also make use of animation-related callbacks within our directives and controller code by registering
	 * an event listener using the `$animate` service. Let's say for example that an animation was triggered on our view
	 * routing controller to hook into that:
	 *
	 * ```js
	 * ngModule.controller('HomePageController', ['$animate', function($animate) {
	 *   $animate.on('enter', ngViewElement, function(element) {
	 *     // the animation for this route has completed
	 *   }]);
	 * }])
	 * ```
	 *
	 * (Note that you will need to trigger a digest within the callback to get angular to notice any scope-related changes.)
	 */

	/**
	 * @ngdoc service
	 * @name $animate
	 * @kind object
	 *
	 * @description
	 * The ngAnimate `$animate` service documentation is the same for the core `$animate` service.
	 *
	 * Click here {@link ng.$animate to learn more about animations with `$animate`}.
	 */
	angular.module('ngAnimate', [])
	  .directive('ngAnimateSwap', ngAnimateSwapDirective)

	  .directive('ngAnimateChildren', $$AnimateChildrenDirective)
	  .factory('$$rAFScheduler', $$rAFSchedulerFactory)

	  .provider('$$animateQueue', $$AnimateQueueProvider)
	  .provider('$$animation', $$AnimationProvider)

	  .provider('$animateCss', $AnimateCssProvider)
	  .provider('$$animateCssDriver', $$AnimateCssDriverProvider)

	  .provider('$$animateJs', $$AnimateJsProvider)
	  .provider('$$animateJsDriver', $$AnimateJsDriverProvider);


	})(window, window.angular);


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var menuTemplate = __webpack_require__(5);

	const menu = {
	    controller: function($timeout) {
	        this.carbohydrates = false;
	        this.proteins = false;
	        this.setDiet = function(diet) {
	            if(this[diet]) {
	                this[diet] = false;
	                $timeout(() => this[diet] = true, 0);
	                return;
	            }
	            this.carbohydrates = diet === 'carbohydrates';
	            this.proteins = diet === 'proteins'
	        };

	        this.className = 'start';
	        this.setClassName = function(phaseId) {
	            if (this.className !== 'start') return;
	            this.className = 'active' + phaseId;
	        };
	        this.moveLeft = function() {
	            debugger;
	            let numb = +this.className.slice(-1);
	            numb -= 1;
	            if (!numb) numb = 3;
	            this.className = 'active' + numb;
	        };
	        this.moveRight = function() {
	            let numb = +this.className.slice(-1);
	            numb += 1;
	            if (numb > 3) numb = 1;
	            this.className = 'active' + numb;
	        }

	    },
	    template: menuTemplate
	};

	module.exports = menu;

/***/ },
/* 5 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"menu-br\"></div> <div id=\"menu\"> <div class=\"diet-menu\"> <div class=\"diet-tittle\">Вид диеты:</div> <div class=\"diet-choose\"> <span class=\"diet\" ng-class=\"{active: $ctrl.proteins}\" ng-click=\"$ctrl.setDiet('proteins')\">Высокопротеиновая комбинация замен</span>\n<span class=\"slash\">/</span>\n<span class=\"diet\" ng-class=\"{active: $ctrl.carbohydrates}\" ng-click=\"$ctrl.setDiet('carbohydrates')\">Высокоуглеводная комбинация замен</span> </div> </div> <div class=\"phase-menu\"> <div class=\"phase-tittle\">Выберете Вашу фазу:</div> <div class=\"phase-choose\"> <div id=\"arrow-left\" ng-class=\"$ctrl.className\" ng-click=\"$ctrl.moveLeft()\"></div> <a href=\"#\" ng-class=\"$ctrl.className\" class=\"first-phase\" ng-click=\"$ctrl.setClassName(1)\">1</a>\n<a href=\"#\" ng-class=\"$ctrl.className\" class=\"second-phase\" ng-click=\"$ctrl.setClassName(2)\">2</a>\n<a href=\"#\" ng-class=\"$ctrl.className\" class=\"third-phase\" ng-click=\"$ctrl.setClassName(3)\">3</a> <div id=\"arrow-right\" ng-class=\"$ctrl.className\" ng-click=\"$ctrl.moveRight()\"></div> </div> </div> </div> <div class=\"menu-br\"></div>";
	ngModule.run(["$templateCache",function(c){c.put("menu-template.html",v1)}]);
	module.exports=v1;

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIDMxZjMwOGEyMzVhNjE1M2I5OWEyIiwid2VicGFjazovLy8uL2pzL2RpYXJ5QXBwLmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2FuZ3VsYXItYW5pbWF0ZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2FuZ3VsYXItYW5pbWF0ZS9hbmd1bGFyLWFuaW1hdGUuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL21lbnUvbWVudS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL21lbnUvdGVtcGxhdGUvbWVudS10ZW1wbGF0ZS5odG1sIl0sInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgMzFmMzA4YTIzNWE2MTUzYjk5YTJcbiAqKi8iLCJyZXF1aXJlKCcuL2FwcCcpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9kaWFyeUFwcC5qc1xuICoqIG1vZHVsZSBpZCA9IDBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuY29uc3QgYW5pbWF0ZSA9IHJlcXVpcmUoJ2FuZ3VsYXItYW5pbWF0ZScpO1xyXG5cclxuY29uc3QgZGlhcnlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnZGlhcnknLCBbJ25nQW5pbWF0ZSddKTtcclxuXHJcbmRpYXJ5QXBwLmNvbXBvbmVudCgnbWVudScsIHJlcXVpcmUoJy4vbWVudS9tZW51LWNvbXBvbmVudCcpKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2luZGV4LmpzXG4gKiogbW9kdWxlIGlkID0gMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi9hbmd1bGFyLWFuaW1hdGUnKTtcbm1vZHVsZS5leHBvcnRzID0gJ25nQW5pbWF0ZSc7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9hbmd1bGFyLWFuaW1hdGUvaW5kZXguanNcbiAqKiBtb2R1bGUgaWQgPSAyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEBsaWNlbnNlIEFuZ3VsYXJKUyB2MS41LjBcbiAqIChjKSAyMDEwLTIwMTYgR29vZ2xlLCBJbmMuIGh0dHA6Ly9hbmd1bGFyanMub3JnXG4gKiBMaWNlbnNlOiBNSVRcbiAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgYW5ndWxhciwgdW5kZWZpbmVkKSB7J3VzZSBzdHJpY3QnO1xuXG4vKiBqc2hpbnQgaWdub3JlOnN0YXJ0ICovXG52YXIgbm9vcCAgICAgICAgPSBhbmd1bGFyLm5vb3A7XG52YXIgY29weSAgICAgICAgPSBhbmd1bGFyLmNvcHk7XG52YXIgZXh0ZW5kICAgICAgPSBhbmd1bGFyLmV4dGVuZDtcbnZhciBqcUxpdGUgICAgICA9IGFuZ3VsYXIuZWxlbWVudDtcbnZhciBmb3JFYWNoICAgICA9IGFuZ3VsYXIuZm9yRWFjaDtcbnZhciBpc0FycmF5ICAgICA9IGFuZ3VsYXIuaXNBcnJheTtcbnZhciBpc1N0cmluZyAgICA9IGFuZ3VsYXIuaXNTdHJpbmc7XG52YXIgaXNPYmplY3QgICAgPSBhbmd1bGFyLmlzT2JqZWN0O1xudmFyIGlzVW5kZWZpbmVkID0gYW5ndWxhci5pc1VuZGVmaW5lZDtcbnZhciBpc0RlZmluZWQgICA9IGFuZ3VsYXIuaXNEZWZpbmVkO1xudmFyIGlzRnVuY3Rpb24gID0gYW5ndWxhci5pc0Z1bmN0aW9uO1xudmFyIGlzRWxlbWVudCAgID0gYW5ndWxhci5pc0VsZW1lbnQ7XG5cbnZhciBFTEVNRU5UX05PREUgPSAxO1xudmFyIENPTU1FTlRfTk9ERSA9IDg7XG5cbnZhciBBRERfQ0xBU1NfU1VGRklYID0gJy1hZGQnO1xudmFyIFJFTU9WRV9DTEFTU19TVUZGSVggPSAnLXJlbW92ZSc7XG52YXIgRVZFTlRfQ0xBU1NfUFJFRklYID0gJ25nLSc7XG52YXIgQUNUSVZFX0NMQVNTX1NVRkZJWCA9ICctYWN0aXZlJztcbnZhciBQUkVQQVJFX0NMQVNTX1NVRkZJWCA9ICctcHJlcGFyZSc7XG5cbnZhciBOR19BTklNQVRFX0NMQVNTTkFNRSA9ICduZy1hbmltYXRlJztcbnZhciBOR19BTklNQVRFX0NISUxEUkVOX0RBVEEgPSAnJCRuZ0FuaW1hdGVDaGlsZHJlbic7XG5cbi8vIERldGVjdCBwcm9wZXIgdHJhbnNpdGlvbmVuZC9hbmltYXRpb25lbmQgZXZlbnQgbmFtZXMuXG52YXIgQ1NTX1BSRUZJWCA9ICcnLCBUUkFOU0lUSU9OX1BST1AsIFRSQU5TSVRJT05FTkRfRVZFTlQsIEFOSU1BVElPTl9QUk9QLCBBTklNQVRJT05FTkRfRVZFTlQ7XG5cbi8vIElmIHVucHJlZml4ZWQgZXZlbnRzIGFyZSBub3Qgc3VwcG9ydGVkIGJ1dCB3ZWJraXQtcHJlZml4ZWQgYXJlLCB1c2UgdGhlIGxhdHRlci5cbi8vIE90aGVyd2lzZSwganVzdCB1c2UgVzNDIG5hbWVzLCBicm93c2VycyBub3Qgc3VwcG9ydGluZyB0aGVtIGF0IGFsbCB3aWxsIGp1c3QgaWdub3JlIHRoZW0uXG4vLyBOb3RlOiBDaHJvbWUgaW1wbGVtZW50cyBgd2luZG93Lm9ud2Via2l0YW5pbWF0aW9uZW5kYCBhbmQgZG9lc24ndCBpbXBsZW1lbnQgYHdpbmRvdy5vbmFuaW1hdGlvbmVuZGBcbi8vIGJ1dCBhdCB0aGUgc2FtZSB0aW1lIGRpc3BhdGNoZXMgdGhlIGBhbmltYXRpb25lbmRgIGV2ZW50IGFuZCBub3QgYHdlYmtpdEFuaW1hdGlvbkVuZGAuXG4vLyBSZWdpc3RlciBib3RoIGV2ZW50cyBpbiBjYXNlIGB3aW5kb3cub25hbmltYXRpb25lbmRgIGlzIG5vdCBzdXBwb3J0ZWQgYmVjYXVzZSBvZiB0aGF0LFxuLy8gZG8gdGhlIHNhbWUgZm9yIGB0cmFuc2l0aW9uZW5kYCBhcyBTYWZhcmkgaXMgbGlrZWx5IHRvIGV4aGliaXQgc2ltaWxhciBiZWhhdmlvci5cbi8vIEFsc28sIHRoZSBvbmx5IG1vZGVybiBicm93c2VyIHRoYXQgdXNlcyB2ZW5kb3IgcHJlZml4ZXMgZm9yIHRyYW5zaXRpb25zL2tleWZyYW1lcyBpcyB3ZWJraXRcbi8vIHRoZXJlZm9yZSB0aGVyZSBpcyBubyByZWFzb24gdG8gdGVzdCBhbnltb3JlIGZvciBvdGhlciB2ZW5kb3IgcHJlZml4ZXM6XG4vLyBodHRwOi8vY2FuaXVzZS5jb20vI3NlYXJjaD10cmFuc2l0aW9uXG5pZiAoaXNVbmRlZmluZWQod2luZG93Lm9udHJhbnNpdGlvbmVuZCkgJiYgaXNEZWZpbmVkKHdpbmRvdy5vbndlYmtpdHRyYW5zaXRpb25lbmQpKSB7XG4gIENTU19QUkVGSVggPSAnLXdlYmtpdC0nO1xuICBUUkFOU0lUSU9OX1BST1AgPSAnV2Via2l0VHJhbnNpdGlvbic7XG4gIFRSQU5TSVRJT05FTkRfRVZFTlQgPSAnd2Via2l0VHJhbnNpdGlvbkVuZCB0cmFuc2l0aW9uZW5kJztcbn0gZWxzZSB7XG4gIFRSQU5TSVRJT05fUFJPUCA9ICd0cmFuc2l0aW9uJztcbiAgVFJBTlNJVElPTkVORF9FVkVOVCA9ICd0cmFuc2l0aW9uZW5kJztcbn1cblxuaWYgKGlzVW5kZWZpbmVkKHdpbmRvdy5vbmFuaW1hdGlvbmVuZCkgJiYgaXNEZWZpbmVkKHdpbmRvdy5vbndlYmtpdGFuaW1hdGlvbmVuZCkpIHtcbiAgQ1NTX1BSRUZJWCA9ICctd2Via2l0LSc7XG4gIEFOSU1BVElPTl9QUk9QID0gJ1dlYmtpdEFuaW1hdGlvbic7XG4gIEFOSU1BVElPTkVORF9FVkVOVCA9ICd3ZWJraXRBbmltYXRpb25FbmQgYW5pbWF0aW9uZW5kJztcbn0gZWxzZSB7XG4gIEFOSU1BVElPTl9QUk9QID0gJ2FuaW1hdGlvbic7XG4gIEFOSU1BVElPTkVORF9FVkVOVCA9ICdhbmltYXRpb25lbmQnO1xufVxuXG52YXIgRFVSQVRJT05fS0VZID0gJ0R1cmF0aW9uJztcbnZhciBQUk9QRVJUWV9LRVkgPSAnUHJvcGVydHknO1xudmFyIERFTEFZX0tFWSA9ICdEZWxheSc7XG52YXIgVElNSU5HX0tFWSA9ICdUaW1pbmdGdW5jdGlvbic7XG52YXIgQU5JTUFUSU9OX0lURVJBVElPTl9DT1VOVF9LRVkgPSAnSXRlcmF0aW9uQ291bnQnO1xudmFyIEFOSU1BVElPTl9QTEFZU1RBVEVfS0VZID0gJ1BsYXlTdGF0ZSc7XG52YXIgU0FGRV9GQVNUX0ZPUldBUkRfRFVSQVRJT05fVkFMVUUgPSA5OTk5O1xuXG52YXIgQU5JTUFUSU9OX0RFTEFZX1BST1AgPSBBTklNQVRJT05fUFJPUCArIERFTEFZX0tFWTtcbnZhciBBTklNQVRJT05fRFVSQVRJT05fUFJPUCA9IEFOSU1BVElPTl9QUk9QICsgRFVSQVRJT05fS0VZO1xudmFyIFRSQU5TSVRJT05fREVMQVlfUFJPUCA9IFRSQU5TSVRJT05fUFJPUCArIERFTEFZX0tFWTtcbnZhciBUUkFOU0lUSU9OX0RVUkFUSU9OX1BST1AgPSBUUkFOU0lUSU9OX1BST1AgKyBEVVJBVElPTl9LRVk7XG5cbnZhciBpc1Byb21pc2VMaWtlID0gZnVuY3Rpb24ocCkge1xuICByZXR1cm4gcCAmJiBwLnRoZW4gPyB0cnVlIDogZmFsc2U7XG59O1xuXG52YXIgbmdNaW5FcnIgPSBhbmd1bGFyLiQkbWluRXJyKCduZycpO1xuZnVuY3Rpb24gYXNzZXJ0QXJnKGFyZywgbmFtZSwgcmVhc29uKSB7XG4gIGlmICghYXJnKSB7XG4gICAgdGhyb3cgbmdNaW5FcnIoJ2FyZXEnLCBcIkFyZ3VtZW50ICd7MH0nIGlzIHsxfVwiLCAobmFtZSB8fCAnPycpLCAocmVhc29uIHx8IFwicmVxdWlyZWRcIikpO1xuICB9XG4gIHJldHVybiBhcmc7XG59XG5cbmZ1bmN0aW9uIG1lcmdlQ2xhc3NlcyhhLGIpIHtcbiAgaWYgKCFhICYmICFiKSByZXR1cm4gJyc7XG4gIGlmICghYSkgcmV0dXJuIGI7XG4gIGlmICghYikgcmV0dXJuIGE7XG4gIGlmIChpc0FycmF5KGEpKSBhID0gYS5qb2luKCcgJyk7XG4gIGlmIChpc0FycmF5KGIpKSBiID0gYi5qb2luKCcgJyk7XG4gIHJldHVybiBhICsgJyAnICsgYjtcbn1cblxuZnVuY3Rpb24gcGFja2FnZVN0eWxlcyhvcHRpb25zKSB7XG4gIHZhciBzdHlsZXMgPSB7fTtcbiAgaWYgKG9wdGlvbnMgJiYgKG9wdGlvbnMudG8gfHwgb3B0aW9ucy5mcm9tKSkge1xuICAgIHN0eWxlcy50byA9IG9wdGlvbnMudG87XG4gICAgc3R5bGVzLmZyb20gPSBvcHRpb25zLmZyb207XG4gIH1cbiAgcmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gcGVuZENsYXNzZXMoY2xhc3NlcywgZml4LCBpc1ByZWZpeCkge1xuICB2YXIgY2xhc3NOYW1lID0gJyc7XG4gIGNsYXNzZXMgPSBpc0FycmF5KGNsYXNzZXMpXG4gICAgICA/IGNsYXNzZXNcbiAgICAgIDogY2xhc3NlcyAmJiBpc1N0cmluZyhjbGFzc2VzKSAmJiBjbGFzc2VzLmxlbmd0aFxuICAgICAgICAgID8gY2xhc3Nlcy5zcGxpdCgvXFxzKy8pXG4gICAgICAgICAgOiBbXTtcbiAgZm9yRWFjaChjbGFzc2VzLCBmdW5jdGlvbihrbGFzcywgaSkge1xuICAgIGlmIChrbGFzcyAmJiBrbGFzcy5sZW5ndGggPiAwKSB7XG4gICAgICBjbGFzc05hbWUgKz0gKGkgPiAwKSA/ICcgJyA6ICcnO1xuICAgICAgY2xhc3NOYW1lICs9IGlzUHJlZml4ID8gZml4ICsga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGtsYXNzICsgZml4O1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBjbGFzc05hbWU7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUZyb21BcnJheShhcnIsIHZhbCkge1xuICB2YXIgaW5kZXggPSBhcnIuaW5kZXhPZih2YWwpO1xuICBpZiAodmFsID49IDApIHtcbiAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdHJpcENvbW1lbnRzRnJvbUVsZW1lbnQoZWxlbWVudCkge1xuICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIGpxTGl0ZSkge1xuICAgIHN3aXRjaCAoZWxlbWVudC5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAxOlxuICAgICAgICAvLyB0aGVyZSBpcyBubyBwb2ludCBvZiBzdHJpcHBpbmcgYW55dGhpbmcgaWYgdGhlIGVsZW1lbnRcbiAgICAgICAgLy8gaXMgdGhlIG9ubHkgZWxlbWVudCB3aXRoaW4gdGhlIGpxTGl0ZSB3cmFwcGVyLlxuICAgICAgICAvLyAoaXQncyBpbXBvcnRhbnQgdGhhdCB3ZSByZXRhaW4gdGhlIGVsZW1lbnQgaW5zdGFuY2UuKVxuICAgICAgICBpZiAoZWxlbWVudFswXS5ub2RlVHlwZSA9PT0gRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBqcUxpdGUoZXh0cmFjdEVsZW1lbnROb2RlKGVsZW1lbnQpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYgKGVsZW1lbnQubm9kZVR5cGUgPT09IEVMRU1FTlRfTk9ERSkge1xuICAgIHJldHVybiBqcUxpdGUoZWxlbWVudCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0cmFjdEVsZW1lbnROb2RlKGVsZW1lbnQpIHtcbiAgaWYgKCFlbGVtZW50WzBdKSByZXR1cm4gZWxlbWVudDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGVsbSA9IGVsZW1lbnRbaV07XG4gICAgaWYgKGVsbS5ub2RlVHlwZSA9PSBFTEVNRU5UX05PREUpIHtcbiAgICAgIHJldHVybiBlbG07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uICQkYWRkQ2xhc3MoJCRqcUxpdGUsIGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICBmb3JFYWNoKGVsZW1lbnQsIGZ1bmN0aW9uKGVsbSkge1xuICAgICQkanFMaXRlLmFkZENsYXNzKGVsbSwgY2xhc3NOYW1lKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uICQkcmVtb3ZlQ2xhc3MoJCRqcUxpdGUsIGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICBmb3JFYWNoKGVsZW1lbnQsIGZ1bmN0aW9uKGVsbSkge1xuICAgICQkanFMaXRlLnJlbW92ZUNsYXNzKGVsbSwgY2xhc3NOYW1lKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5QW5pbWF0aW9uQ2xhc3Nlc0ZhY3RvcnkoJCRqcUxpdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5hZGRDbGFzcykge1xuICAgICAgJCRhZGRDbGFzcygkJGpxTGl0ZSwgZWxlbWVudCwgb3B0aW9ucy5hZGRDbGFzcyk7XG4gICAgICBvcHRpb25zLmFkZENsYXNzID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMucmVtb3ZlQ2xhc3MpIHtcbiAgICAgICQkcmVtb3ZlQ2xhc3MoJCRqcUxpdGUsIGVsZW1lbnQsIG9wdGlvbnMucmVtb3ZlQ2xhc3MpO1xuICAgICAgb3B0aW9ucy5yZW1vdmVDbGFzcyA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVBbmltYXRpb25PcHRpb25zKG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGlmICghb3B0aW9ucy4kJHByZXBhcmVkKSB7XG4gICAgdmFyIGRvbU9wZXJhdGlvbiA9IG9wdGlvbnMuZG9tT3BlcmF0aW9uIHx8IG5vb3A7XG4gICAgb3B0aW9ucy5kb21PcGVyYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIG9wdGlvbnMuJCRkb21PcGVyYXRpb25GaXJlZCA9IHRydWU7XG4gICAgICBkb21PcGVyYXRpb24oKTtcbiAgICAgIGRvbU9wZXJhdGlvbiA9IG5vb3A7XG4gICAgfTtcbiAgICBvcHRpb25zLiQkcHJlcGFyZWQgPSB0cnVlO1xuICB9XG4gIHJldHVybiBvcHRpb25zO1xufVxuXG5mdW5jdGlvbiBhcHBseUFuaW1hdGlvblN0eWxlcyhlbGVtZW50LCBvcHRpb25zKSB7XG4gIGFwcGx5QW5pbWF0aW9uRnJvbVN0eWxlcyhlbGVtZW50LCBvcHRpb25zKTtcbiAgYXBwbHlBbmltYXRpb25Ub1N0eWxlcyhlbGVtZW50LCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gYXBwbHlBbmltYXRpb25Gcm9tU3R5bGVzKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMuZnJvbSkge1xuICAgIGVsZW1lbnQuY3NzKG9wdGlvbnMuZnJvbSk7XG4gICAgb3B0aW9ucy5mcm9tID0gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseUFuaW1hdGlvblRvU3R5bGVzKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMudG8pIHtcbiAgICBlbGVtZW50LmNzcyhvcHRpb25zLnRvKTtcbiAgICBvcHRpb25zLnRvID0gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZXJnZUFuaW1hdGlvbkRldGFpbHMoZWxlbWVudCwgb2xkQW5pbWF0aW9uLCBuZXdBbmltYXRpb24pIHtcbiAgdmFyIHRhcmdldCA9IG9sZEFuaW1hdGlvbi5vcHRpb25zIHx8IHt9O1xuICB2YXIgbmV3T3B0aW9ucyA9IG5ld0FuaW1hdGlvbi5vcHRpb25zIHx8IHt9O1xuXG4gIHZhciB0b0FkZCA9ICh0YXJnZXQuYWRkQ2xhc3MgfHwgJycpICsgJyAnICsgKG5ld09wdGlvbnMuYWRkQ2xhc3MgfHwgJycpO1xuICB2YXIgdG9SZW1vdmUgPSAodGFyZ2V0LnJlbW92ZUNsYXNzIHx8ICcnKSArICcgJyArIChuZXdPcHRpb25zLnJlbW92ZUNsYXNzIHx8ICcnKTtcbiAgdmFyIGNsYXNzZXMgPSByZXNvbHZlRWxlbWVudENsYXNzZXMoZWxlbWVudC5hdHRyKCdjbGFzcycpLCB0b0FkZCwgdG9SZW1vdmUpO1xuXG4gIGlmIChuZXdPcHRpb25zLnByZXBhcmF0aW9uQ2xhc3Nlcykge1xuICAgIHRhcmdldC5wcmVwYXJhdGlvbkNsYXNzZXMgPSBjb25jYXRXaXRoU3BhY2UobmV3T3B0aW9ucy5wcmVwYXJhdGlvbkNsYXNzZXMsIHRhcmdldC5wcmVwYXJhdGlvbkNsYXNzZXMpO1xuICAgIGRlbGV0ZSBuZXdPcHRpb25zLnByZXBhcmF0aW9uQ2xhc3NlcztcbiAgfVxuXG4gIC8vIG5vb3AgaXMgYmFzaWNhbGx5IHdoZW4gdGhlcmUgaXMgbm8gY2FsbGJhY2s7IG90aGVyd2lzZSBzb21ldGhpbmcgaGFzIGJlZW4gc2V0XG4gIHZhciByZWFsRG9tT3BlcmF0aW9uID0gdGFyZ2V0LmRvbU9wZXJhdGlvbiAhPT0gbm9vcCA/IHRhcmdldC5kb21PcGVyYXRpb24gOiBudWxsO1xuXG4gIGV4dGVuZCh0YXJnZXQsIG5ld09wdGlvbnMpO1xuXG4gIC8vIFRPRE8obWF0c2tvIG9yIHNyZWVyYW11KTogcHJvcGVyIGZpeCBpcyB0byBtYWludGFpbiBhbGwgYW5pbWF0aW9uIGNhbGxiYWNrIGluIGFycmF5IGFuZCBjYWxsIGF0IGxhc3QsYnV0IG5vdyBvbmx5IGxlYXZlIGhhcyB0aGUgY2FsbGJhY2sgc28gbm8gaXNzdWUgd2l0aCB0aGlzLlxuICBpZiAocmVhbERvbU9wZXJhdGlvbikge1xuICAgIHRhcmdldC5kb21PcGVyYXRpb24gPSByZWFsRG9tT3BlcmF0aW9uO1xuICB9XG5cbiAgaWYgKGNsYXNzZXMuYWRkQ2xhc3MpIHtcbiAgICB0YXJnZXQuYWRkQ2xhc3MgPSBjbGFzc2VzLmFkZENsYXNzO1xuICB9IGVsc2Uge1xuICAgIHRhcmdldC5hZGRDbGFzcyA9IG51bGw7XG4gIH1cblxuICBpZiAoY2xhc3Nlcy5yZW1vdmVDbGFzcykge1xuICAgIHRhcmdldC5yZW1vdmVDbGFzcyA9IGNsYXNzZXMucmVtb3ZlQ2xhc3M7XG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0LnJlbW92ZUNsYXNzID0gbnVsbDtcbiAgfVxuXG4gIG9sZEFuaW1hdGlvbi5hZGRDbGFzcyA9IHRhcmdldC5hZGRDbGFzcztcbiAgb2xkQW5pbWF0aW9uLnJlbW92ZUNsYXNzID0gdGFyZ2V0LnJlbW92ZUNsYXNzO1xuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVFbGVtZW50Q2xhc3NlcyhleGlzdGluZywgdG9BZGQsIHRvUmVtb3ZlKSB7XG4gIHZhciBBRERfQ0xBU1MgPSAxO1xuICB2YXIgUkVNT1ZFX0NMQVNTID0gLTE7XG5cbiAgdmFyIGZsYWdzID0ge307XG4gIGV4aXN0aW5nID0gc3BsaXRDbGFzc2VzVG9Mb29rdXAoZXhpc3RpbmcpO1xuXG4gIHRvQWRkID0gc3BsaXRDbGFzc2VzVG9Mb29rdXAodG9BZGQpO1xuICBmb3JFYWNoKHRvQWRkLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgZmxhZ3Nba2V5XSA9IEFERF9DTEFTUztcbiAgfSk7XG5cbiAgdG9SZW1vdmUgPSBzcGxpdENsYXNzZXNUb0xvb2t1cCh0b1JlbW92ZSk7XG4gIGZvckVhY2godG9SZW1vdmUsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICBmbGFnc1trZXldID0gZmxhZ3Nba2V5XSA9PT0gQUREX0NMQVNTID8gbnVsbCA6IFJFTU9WRV9DTEFTUztcbiAgfSk7XG5cbiAgdmFyIGNsYXNzZXMgPSB7XG4gICAgYWRkQ2xhc3M6ICcnLFxuICAgIHJlbW92ZUNsYXNzOiAnJ1xuICB9O1xuXG4gIGZvckVhY2goZmxhZ3MsIGZ1bmN0aW9uKHZhbCwga2xhc3MpIHtcbiAgICB2YXIgcHJvcCwgYWxsb3c7XG4gICAgaWYgKHZhbCA9PT0gQUREX0NMQVNTKSB7XG4gICAgICBwcm9wID0gJ2FkZENsYXNzJztcbiAgICAgIGFsbG93ID0gIWV4aXN0aW5nW2tsYXNzXTtcbiAgICB9IGVsc2UgaWYgKHZhbCA9PT0gUkVNT1ZFX0NMQVNTKSB7XG4gICAgICBwcm9wID0gJ3JlbW92ZUNsYXNzJztcbiAgICAgIGFsbG93ID0gZXhpc3Rpbmdba2xhc3NdO1xuICAgIH1cbiAgICBpZiAoYWxsb3cpIHtcbiAgICAgIGlmIChjbGFzc2VzW3Byb3BdLmxlbmd0aCkge1xuICAgICAgICBjbGFzc2VzW3Byb3BdICs9ICcgJztcbiAgICAgIH1cbiAgICAgIGNsYXNzZXNbcHJvcF0gKz0ga2xhc3M7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBzcGxpdENsYXNzZXNUb0xvb2t1cChjbGFzc2VzKSB7XG4gICAgaWYgKGlzU3RyaW5nKGNsYXNzZXMpKSB7XG4gICAgICBjbGFzc2VzID0gY2xhc3Nlcy5zcGxpdCgnICcpO1xuICAgIH1cblxuICAgIHZhciBvYmogPSB7fTtcbiAgICBmb3JFYWNoKGNsYXNzZXMsIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgICAvLyBzb21ldGltZXMgdGhlIHNwbGl0IGxlYXZlcyBlbXB0eSBzdHJpbmcgdmFsdWVzXG4gICAgICAvLyBpbmNhc2UgZXh0cmEgc3BhY2VzIHdlcmUgYXBwbGllZCB0byB0aGUgb3B0aW9uc1xuICAgICAgaWYgKGtsYXNzLmxlbmd0aCkge1xuICAgICAgICBvYmpba2xhc3NdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzZXM7XG59XG5cbmZ1bmN0aW9uIGdldERvbU5vZGUoZWxlbWVudCkge1xuICByZXR1cm4gKGVsZW1lbnQgaW5zdGFuY2VvZiBhbmd1bGFyLmVsZW1lbnQpID8gZWxlbWVudFswXSA6IGVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGFwcGx5R2VuZXJhdGVkUHJlcGFyYXRpb25DbGFzc2VzKGVsZW1lbnQsIGV2ZW50LCBvcHRpb25zKSB7XG4gIHZhciBjbGFzc2VzID0gJyc7XG4gIGlmIChldmVudCkge1xuICAgIGNsYXNzZXMgPSBwZW5kQ2xhc3NlcyhldmVudCwgRVZFTlRfQ0xBU1NfUFJFRklYLCB0cnVlKTtcbiAgfVxuICBpZiAob3B0aW9ucy5hZGRDbGFzcykge1xuICAgIGNsYXNzZXMgPSBjb25jYXRXaXRoU3BhY2UoY2xhc3NlcywgcGVuZENsYXNzZXMob3B0aW9ucy5hZGRDbGFzcywgQUREX0NMQVNTX1NVRkZJWCkpO1xuICB9XG4gIGlmIChvcHRpb25zLnJlbW92ZUNsYXNzKSB7XG4gICAgY2xhc3NlcyA9IGNvbmNhdFdpdGhTcGFjZShjbGFzc2VzLCBwZW5kQ2xhc3NlcyhvcHRpb25zLnJlbW92ZUNsYXNzLCBSRU1PVkVfQ0xBU1NfU1VGRklYKSk7XG4gIH1cbiAgaWYgKGNsYXNzZXMubGVuZ3RoKSB7XG4gICAgb3B0aW9ucy5wcmVwYXJhdGlvbkNsYXNzZXMgPSBjbGFzc2VzO1xuICAgIGVsZW1lbnQuYWRkQ2xhc3MoY2xhc3Nlcyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xlYXJHZW5lcmF0ZWRDbGFzc2VzKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMucHJlcGFyYXRpb25DbGFzc2VzKSB7XG4gICAgZWxlbWVudC5yZW1vdmVDbGFzcyhvcHRpb25zLnByZXBhcmF0aW9uQ2xhc3Nlcyk7XG4gICAgb3B0aW9ucy5wcmVwYXJhdGlvbkNsYXNzZXMgPSBudWxsO1xuICB9XG4gIGlmIChvcHRpb25zLmFjdGl2ZUNsYXNzZXMpIHtcbiAgICBlbGVtZW50LnJlbW92ZUNsYXNzKG9wdGlvbnMuYWN0aXZlQ2xhc3Nlcyk7XG4gICAgb3B0aW9ucy5hY3RpdmVDbGFzc2VzID0gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBibG9ja1RyYW5zaXRpb25zKG5vZGUsIGR1cmF0aW9uKSB7XG4gIC8vIHdlIHVzZSBhIG5lZ2F0aXZlIGRlbGF5IHZhbHVlIHNpbmNlIGl0IHBlcmZvcm1zIGJsb2NraW5nXG4gIC8vIHlldCBpdCBkb2Vzbid0IGtpbGwgYW55IGV4aXN0aW5nIHRyYW5zaXRpb25zIHJ1bm5pbmcgb24gdGhlXG4gIC8vIHNhbWUgZWxlbWVudCB3aGljaCBtYWtlcyB0aGlzIHNhZmUgZm9yIGNsYXNzLWJhc2VkIGFuaW1hdGlvbnNcbiAgdmFyIHZhbHVlID0gZHVyYXRpb24gPyAnLScgKyBkdXJhdGlvbiArICdzJyA6ICcnO1xuICBhcHBseUlubGluZVN0eWxlKG5vZGUsIFtUUkFOU0lUSU9OX0RFTEFZX1BST1AsIHZhbHVlXSk7XG4gIHJldHVybiBbVFJBTlNJVElPTl9ERUxBWV9QUk9QLCB2YWx1ZV07XG59XG5cbmZ1bmN0aW9uIGJsb2NrS2V5ZnJhbWVBbmltYXRpb25zKG5vZGUsIGFwcGx5QmxvY2spIHtcbiAgdmFyIHZhbHVlID0gYXBwbHlCbG9jayA/ICdwYXVzZWQnIDogJyc7XG4gIHZhciBrZXkgPSBBTklNQVRJT05fUFJPUCArIEFOSU1BVElPTl9QTEFZU1RBVEVfS0VZO1xuICBhcHBseUlubGluZVN0eWxlKG5vZGUsIFtrZXksIHZhbHVlXSk7XG4gIHJldHVybiBba2V5LCB2YWx1ZV07XG59XG5cbmZ1bmN0aW9uIGFwcGx5SW5saW5lU3R5bGUobm9kZSwgc3R5bGVUdXBsZSkge1xuICB2YXIgcHJvcCA9IHN0eWxlVHVwbGVbMF07XG4gIHZhciB2YWx1ZSA9IHN0eWxlVHVwbGVbMV07XG4gIG5vZGUuc3R5bGVbcHJvcF0gPSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gY29uY2F0V2l0aFNwYWNlKGEsYikge1xuICBpZiAoIWEpIHJldHVybiBiO1xuICBpZiAoIWIpIHJldHVybiBhO1xuICByZXR1cm4gYSArICcgJyArIGI7XG59XG5cbnZhciAkJHJBRlNjaGVkdWxlckZhY3RvcnkgPSBbJyQkckFGJywgZnVuY3Rpb24oJCRyQUYpIHtcbiAgdmFyIHF1ZXVlLCBjYW5jZWxGbjtcblxuICBmdW5jdGlvbiBzY2hlZHVsZXIodGFza3MpIHtcbiAgICAvLyB3ZSBtYWtlIGEgY29weSBzaW5jZSBSQUZTY2hlZHVsZXIgbXV0YXRlcyB0aGUgc3RhdGVcbiAgICAvLyBvZiB0aGUgcGFzc2VkIGluIGFycmF5IHZhcmlhYmxlIGFuZCB0aGlzIHdvdWxkIGJlIGRpZmZpY3VsdFxuICAgIC8vIHRvIHRyYWNrIGRvd24gb24gdGhlIG91dHNpZGUgY29kZVxuICAgIHF1ZXVlID0gcXVldWUuY29uY2F0KHRhc2tzKTtcbiAgICBuZXh0VGljaygpO1xuICB9XG5cbiAgcXVldWUgPSBzY2hlZHVsZXIucXVldWUgPSBbXTtcblxuICAvKiB3YWl0VW50aWxRdWlldCBkb2VzIHR3byB0aGluZ3M6XG4gICAqIDEuIEl0IHdpbGwgcnVuIHRoZSBGSU5BTCBgZm5gIHZhbHVlIG9ubHkgd2hlbiBhbiB1bmNhbmNlbGVkIFJBRiBoYXMgcGFzc2VkIHRocm91Z2hcbiAgICogMi4gSXQgd2lsbCBkZWxheSB0aGUgbmV4dCB3YXZlIG9mIHRhc2tzIGZyb20gcnVubmluZyB1bnRpbCB0aGUgcXVpZXQgYGZuYCBoYXMgcnVuLlxuICAgKlxuICAgKiBUaGUgbW90aXZhdGlvbiBoZXJlIGlzIHRoYXQgYW5pbWF0aW9uIGNvZGUgY2FuIHJlcXVlc3QgbW9yZSB0aW1lIGZyb20gdGhlIHNjaGVkdWxlclxuICAgKiBiZWZvcmUgdGhlIG5leHQgd2F2ZSBydW5zLiBUaGlzIGFsbG93cyBmb3IgY2VydGFpbiBET00gcHJvcGVydGllcyBzdWNoIGFzIGNsYXNzZXMgdG9cbiAgICogYmUgcmVzb2x2ZWQgaW4gdGltZSBmb3IgdGhlIG5leHQgYW5pbWF0aW9uIHRvIHJ1bi5cbiAgICovXG4gIHNjaGVkdWxlci53YWl0VW50aWxRdWlldCA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgaWYgKGNhbmNlbEZuKSBjYW5jZWxGbigpO1xuXG4gICAgY2FuY2VsRm4gPSAkJHJBRihmdW5jdGlvbigpIHtcbiAgICAgIGNhbmNlbEZuID0gbnVsbDtcbiAgICAgIGZuKCk7XG4gICAgICBuZXh0VGljaygpO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBzY2hlZHVsZXI7XG5cbiAgZnVuY3Rpb24gbmV4dFRpY2soKSB7XG4gICAgaWYgKCFxdWV1ZS5sZW5ndGgpIHJldHVybjtcblxuICAgIHZhciBpdGVtcyA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgaXRlbXNbaV0oKTtcbiAgICB9XG5cbiAgICBpZiAoIWNhbmNlbEZuKSB7XG4gICAgICAkJHJBRihmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFjYW5jZWxGbikgbmV4dFRpY2soKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufV07XG5cbi8qKlxuICogQG5nZG9jIGRpcmVjdGl2ZVxuICogQG5hbWUgbmdBbmltYXRlQ2hpbGRyZW5cbiAqIEByZXN0cmljdCBBRVxuICogQGVsZW1lbnQgQU5ZXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogbmdBbmltYXRlQ2hpbGRyZW4gYWxsb3dzIHlvdSB0byBzcGVjaWZ5IHRoYXQgY2hpbGRyZW4gb2YgdGhpcyBlbGVtZW50IHNob3VsZCBhbmltYXRlIGV2ZW4gaWYgYW55XG4gKiBvZiB0aGUgY2hpbGRyZW4ncyBwYXJlbnRzIGFyZSBjdXJyZW50bHkgYW5pbWF0aW5nLiBCeSBkZWZhdWx0LCB3aGVuIGFuIGVsZW1lbnQgaGFzIGFuIGFjdGl2ZSBgZW50ZXJgLCBgbGVhdmVgLCBvciBgbW92ZWBcbiAqIChzdHJ1Y3R1cmFsKSBhbmltYXRpb24sIGNoaWxkIGVsZW1lbnRzIHRoYXQgYWxzbyBoYXZlIGFuIGFjdGl2ZSBzdHJ1Y3R1cmFsIGFuaW1hdGlvbiBhcmUgbm90IGFuaW1hdGVkLlxuICpcbiAqIE5vdGUgdGhhdCBldmVuIGlmIGBuZ0FuaW10ZUNoaWxkcmVuYCBpcyBzZXQsIG5vIGNoaWxkIGFuaW1hdGlvbnMgd2lsbCBydW4gd2hlbiB0aGUgcGFyZW50IGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIHRoZSBET00gKGBsZWF2ZWAgYW5pbWF0aW9uKS5cbiAqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5nQW5pbWF0ZUNoaWxkcmVuIElmIHRoZSB2YWx1ZSBpcyBlbXB0eSwgYHRydWVgIG9yIGBvbmAsXG4gKiAgICAgdGhlbiBjaGlsZCBhbmltYXRpb25zIGFyZSBhbGxvd2VkLiBJZiB0aGUgdmFsdWUgaXMgYGZhbHNlYCwgY2hpbGQgYW5pbWF0aW9ucyBhcmUgbm90IGFsbG93ZWQuXG4gKlxuICogQGV4YW1wbGVcbiAqIDxleGFtcGxlIG1vZHVsZT1cIm5nQW5pbWF0ZUNoaWxkcmVuXCIgbmFtZT1cIm5nQW5pbWF0ZUNoaWxkcmVuXCIgZGVwcz1cImFuZ3VsYXItYW5pbWF0ZS5qc1wiIGFuaW1hdGlvbnM9XCJ0cnVlXCI+XG4gICAgIDxmaWxlIG5hbWU9XCJpbmRleC5odG1sXCI+XG4gICAgICAgPGRpdiBuZy1jb250cm9sbGVyPVwibWFpbkNvbnRyb2xsZXIgYXMgbWFpblwiPlxuICAgICAgICAgPGxhYmVsPlNob3cgY29udGFpbmVyPyA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmctbW9kZWw9XCJtYWluLmVudGVyRWxlbWVudFwiIC8+PC9sYWJlbD5cbiAgICAgICAgIDxsYWJlbD5BbmltYXRlIGNoaWxkcmVuPyA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmctbW9kZWw9XCJtYWluLmFuaW1hdGVDaGlsZHJlblwiIC8+PC9sYWJlbD5cbiAgICAgICAgIDxocj5cbiAgICAgICAgIDxkaXYgbmctYW5pbWF0ZS1jaGlsZHJlbj1cInt7bWFpbi5hbmltYXRlQ2hpbGRyZW59fVwiPlxuICAgICAgICAgICA8ZGl2IG5nLWlmPVwibWFpbi5lbnRlckVsZW1lbnRcIiBjbGFzcz1cImNvbnRhaW5lclwiPlxuICAgICAgICAgICAgIExpc3Qgb2YgaXRlbXM6XG4gICAgICAgICAgICAgPGRpdiBuZy1yZXBlYXQ9XCJpdGVtIGluIFswLCAxLCAyLCAzXVwiIGNsYXNzPVwiaXRlbVwiPkl0ZW0ge3tpdGVtfX08L2Rpdj5cbiAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICA8L2Rpdj5cbiAgICAgICA8L2Rpdj5cbiAgICAgPC9maWxlPlxuICAgICA8ZmlsZSBuYW1lPVwiYW5pbWF0aW9ucy5jc3NcIj5cblxuICAgICAgLmNvbnRhaW5lci5uZy1lbnRlcixcbiAgICAgIC5jb250YWluZXIubmctbGVhdmUge1xuICAgICAgICB0cmFuc2l0aW9uOiBhbGwgZWFzZSAxLjVzO1xuICAgICAgfVxuXG4gICAgICAuY29udGFpbmVyLm5nLWVudGVyLFxuICAgICAgLmNvbnRhaW5lci5uZy1sZWF2ZS1hY3RpdmUge1xuICAgICAgICBvcGFjaXR5OiAwO1xuICAgICAgfVxuXG4gICAgICAuY29udGFpbmVyLm5nLWxlYXZlLFxuICAgICAgLmNvbnRhaW5lci5uZy1lbnRlci1hY3RpdmUge1xuICAgICAgICBvcGFjaXR5OiAxO1xuICAgICAgfVxuXG4gICAgICAuaXRlbSB7XG4gICAgICAgIGJhY2tncm91bmQ6IGZpcmVicmljaztcbiAgICAgICAgY29sb3I6ICNGRkY7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDEwcHg7XG4gICAgICB9XG5cbiAgICAgIC5pdGVtLm5nLWVudGVyLFxuICAgICAgLml0ZW0ubmctbGVhdmUge1xuICAgICAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMS41cyBlYXNlO1xuICAgICAgfVxuXG4gICAgICAuaXRlbS5uZy1lbnRlciB7XG4gICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCg1MHB4KTtcbiAgICAgIH1cblxuICAgICAgLml0ZW0ubmctZW50ZXItYWN0aXZlIHtcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xuICAgICAgfVxuICAgIDwvZmlsZT5cbiAgICA8ZmlsZSBuYW1lPVwic2NyaXB0LmpzXCI+XG4gICAgICBhbmd1bGFyLm1vZHVsZSgnbmdBbmltYXRlQ2hpbGRyZW4nLCBbJ25nQW5pbWF0ZSddKVxuICAgICAgICAuY29udHJvbGxlcignbWFpbkNvbnRyb2xsZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLmFuaW1hdGVDaGlsZHJlbiA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuZW50ZXJFbGVtZW50ID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIDwvZmlsZT5cbiAgPC9leGFtcGxlPlxuICovXG52YXIgJCRBbmltYXRlQ2hpbGRyZW5EaXJlY3RpdmUgPSBbJyRpbnRlcnBvbGF0ZScsIGZ1bmN0aW9uKCRpbnRlcnBvbGF0ZSkge1xuICByZXR1cm4ge1xuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgdmFyIHZhbCA9IGF0dHJzLm5nQW5pbWF0ZUNoaWxkcmVuO1xuICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcodmFsKSAmJiB2YWwubGVuZ3RoID09PSAwKSB7IC8vZW1wdHkgYXR0cmlidXRlXG4gICAgICAgIGVsZW1lbnQuZGF0YShOR19BTklNQVRFX0NISUxEUkVOX0RBVEEsIHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSW50ZXJwb2xhdGUgYW5kIHNldCB0aGUgdmFsdWUsIHNvIHRoYXQgaXQgaXMgYXZhaWxhYmxlIHRvXG4gICAgICAgIC8vIGFuaW1hdGlvbnMgdGhhdCBydW4gcmlnaHQgYWZ0ZXIgY29tcGlsYXRpb25cbiAgICAgICAgc2V0RGF0YSgkaW50ZXJwb2xhdGUodmFsKShzY29wZSkpO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnbmdBbmltYXRlQ2hpbGRyZW4nLCBzZXREYXRhKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2V0RGF0YSh2YWx1ZSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSAnb24nIHx8IHZhbHVlID09PSAndHJ1ZSc7XG4gICAgICAgIGVsZW1lbnQuZGF0YShOR19BTklNQVRFX0NISUxEUkVOX0RBVEEsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XTtcblxudmFyIEFOSU1BVEVfVElNRVJfS0VZID0gJyQkYW5pbWF0ZUNzcyc7XG5cbi8qKlxuICogQG5nZG9jIHNlcnZpY2VcbiAqIEBuYW1lICRhbmltYXRlQ3NzXG4gKiBAa2luZCBvYmplY3RcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRoZSBgJGFuaW1hdGVDc3NgIHNlcnZpY2UgaXMgYSB1c2VmdWwgdXRpbGl0eSB0byB0cmlnZ2VyIGN1c3RvbWl6ZWQgQ1NTLWJhc2VkIHRyYW5zaXRpb25zL2tleWZyYW1lc1xuICogZnJvbSBhIEphdmFTY3JpcHQtYmFzZWQgYW5pbWF0aW9uIG9yIGRpcmVjdGx5IGZyb20gYSBkaXJlY3RpdmUuIFRoZSBwdXJwb3NlIG9mIGAkYW5pbWF0ZUNzc2AgaXMgTk9UXG4gKiB0byBzaWRlLXN0ZXAgaG93IGAkYW5pbWF0ZWAgYW5kIG5nQW5pbWF0ZSB3b3JrLCBidXQgdGhlIGdvYWwgaXMgdG8gYWxsb3cgcHJlLWV4aXN0aW5nIGFuaW1hdGlvbnMgb3JcbiAqIGRpcmVjdGl2ZXMgdG8gY3JlYXRlIG1vcmUgY29tcGxleCBhbmltYXRpb25zIHRoYXQgY2FuIGJlIHB1cmVseSBkcml2ZW4gdXNpbmcgQ1NTIGNvZGUuXG4gKlxuICogTm90ZSB0aGF0IG9ubHkgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IENTUyB0cmFuc2l0aW9ucyBhbmQvb3Iga2V5ZnJhbWUgYW5pbWF0aW9ucyBhcmUgY2FwYWJsZSBvZlxuICogcmVuZGVyaW5nIGFuaW1hdGlvbnMgdHJpZ2dlcmVkIHZpYSBgJGFuaW1hdGVDc3NgIChiYWQgbmV3cyBmb3IgSUU5IGFuZCBsb3dlcikuXG4gKlxuICogIyMgVXNhZ2VcbiAqIE9uY2UgYWdhaW4sIGAkYW5pbWF0ZUNzc2AgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgYSByZWdpc3RlcmVkIEphdmFTY3JpcHQgYW5pbWF0aW9uIHRoYXRcbiAqIGlzIHBvd2VyZWQgYnkgbmdBbmltYXRlLiBJdCBpcyBwb3NzaWJsZSB0byB1c2UgYCRhbmltYXRlQ3NzYCBkaXJlY3RseSBpbnNpZGUgb2YgYSBkaXJlY3RpdmUsIGhvd2V2ZXIsXG4gKiBhbnkgYXV0b21hdGljIGNvbnRyb2wgb3ZlciBjYW5jZWxsaW5nIGFuaW1hdGlvbnMgYW5kL29yIHByZXZlbnRpbmcgYW5pbWF0aW9ucyBmcm9tIGJlaW5nIHJ1biBvblxuICogY2hpbGQgZWxlbWVudHMgd2lsbCBub3QgYmUgaGFuZGxlZCBieSBBbmd1bGFyLiBGb3IgdGhpcyB0byB3b3JrIGFzIGV4cGVjdGVkLCBwbGVhc2UgdXNlIGAkYW5pbWF0ZWAgdG9cbiAqIHRyaWdnZXIgdGhlIGFuaW1hdGlvbiBhbmQgdGhlbiBzZXR1cCBhIEphdmFTY3JpcHQgYW5pbWF0aW9uIHRoYXQgaW5qZWN0cyBgJGFuaW1hdGVDc3NgIHRvIHRyaWdnZXJcbiAqIHRoZSBDU1MgYW5pbWF0aW9uLlxuICpcbiAqIFRoZSBleGFtcGxlIGJlbG93IHNob3dzIGhvdyB3ZSBjYW4gY3JlYXRlIGEgZm9sZGluZyBhbmltYXRpb24gb24gYW4gZWxlbWVudCB1c2luZyBgbmctaWZgOlxuICpcbiAqIGBgYGh0bWxcbiAqIDwhLS0gbm90aWNlIHRoZSBgZm9sZC1hbmltYXRpb25gIENTUyBjbGFzcyAtLT5cbiAqIDxkaXYgbmctaWY9XCJvbk9mZlwiIGNsYXNzPVwiZm9sZC1hbmltYXRpb25cIj5cbiAqICAgVGhpcyBlbGVtZW50IHdpbGwgZ28gQk9PTVxuICogPC9kaXY+XG4gKiA8YnV0dG9uIG5nLWNsaWNrPVwib25PZmY9dHJ1ZVwiPkZvbGQgSW48L2J1dHRvbj5cbiAqIGBgYFxuICpcbiAqIE5vdyB3ZSBjcmVhdGUgdGhlICoqSmF2YVNjcmlwdCBhbmltYXRpb24qKiB0aGF0IHdpbGwgdHJpZ2dlciB0aGUgQ1NTIHRyYW5zaXRpb246XG4gKlxuICogYGBganNcbiAqIG5nTW9kdWxlLmFuaW1hdGlvbignLmZvbGQtYW5pbWF0aW9uJywgWyckYW5pbWF0ZUNzcycsIGZ1bmN0aW9uKCRhbmltYXRlQ3NzKSB7XG4gKiAgIHJldHVybiB7XG4gKiAgICAgZW50ZXI6IGZ1bmN0aW9uKGVsZW1lbnQsIGRvbmVGbikge1xuICogICAgICAgdmFyIGhlaWdodCA9IGVsZW1lbnRbMF0ub2Zmc2V0SGVpZ2h0O1xuICogICAgICAgcmV0dXJuICRhbmltYXRlQ3NzKGVsZW1lbnQsIHtcbiAqICAgICAgICAgZnJvbTogeyBoZWlnaHQ6JzBweCcgfSxcbiAqICAgICAgICAgdG86IHsgaGVpZ2h0OmhlaWdodCArICdweCcgfSxcbiAqICAgICAgICAgZHVyYXRpb246IDEgLy8gb25lIHNlY29uZFxuICogICAgICAgfSk7XG4gKiAgICAgfVxuICogICB9XG4gKiB9XSk7XG4gKiBgYGBcbiAqXG4gKiAjIyBNb3JlIEFkdmFuY2VkIFVzZXNcbiAqXG4gKiBgJGFuaW1hdGVDc3NgIGlzIHRoZSB1bmRlcmx5aW5nIGNvZGUgdGhhdCBuZ0FuaW1hdGUgdXNlcyB0byBwb3dlciAqKkNTUy1iYXNlZCBhbmltYXRpb25zKiogYmVoaW5kIHRoZSBzY2VuZXMuIFRoZXJlZm9yZSBDU1MgaG9va3NcbiAqIGxpa2UgYC5uZy1FVkVOVGAsIGAubmctRVZFTlQtYWN0aXZlYCwgYC5uZy1FVkVOVC1zdGFnZ2VyYCBhcmUgYWxsIGZlYXR1cmVzIHRoYXQgY2FuIGJlIHRyaWdnZXJlZCB1c2luZyBgJGFuaW1hdGVDc3NgIHZpYSBKYXZhU2NyaXB0IGNvZGUuXG4gKlxuICogVGhpcyBhbHNvIG1lYW5zIHRoYXQganVzdCBhYm91dCBhbnkgY29tYmluYXRpb24gb2YgYWRkaW5nIGNsYXNzZXMsIHJlbW92aW5nIGNsYXNzZXMsIHNldHRpbmcgc3R5bGVzLCBkeW5hbWljYWxseSBzZXR0aW5nIGEga2V5ZnJhbWUgYW5pbWF0aW9uLFxuICogYXBwbHlpbmcgYSBoYXJkY29kZWQgZHVyYXRpb24gb3IgZGVsYXkgdmFsdWUsIGNoYW5naW5nIHRoZSBhbmltYXRpb24gZWFzaW5nIG9yIGFwcGx5aW5nIGEgc3RhZ2dlciBhbmltYXRpb24gYXJlIGFsbCBvcHRpb25zIHRoYXQgd29yayB3aXRoXG4gKiBgJGFuaW1hdGVDc3NgLiBUaGUgc2VydmljZSBpdHNlbGYgaXMgc21hcnQgZW5vdWdoIHRvIGZpZ3VyZSBvdXQgdGhlIGNvbWJpbmF0aW9uIG9mIG9wdGlvbnMgYW5kIGV4YW1pbmUgdGhlIGVsZW1lbnQgc3R5bGluZyBwcm9wZXJ0aWVzIGluIG9yZGVyXG4gKiB0byBwcm92aWRlIGEgd29ya2luZyBhbmltYXRpb24gdGhhdCB3aWxsIHJ1biBpbiBDU1MuXG4gKlxuICogVGhlIGV4YW1wbGUgYmVsb3cgc2hvd2Nhc2VzIGEgbW9yZSBhZHZhbmNlZCB2ZXJzaW9uIG9mIHRoZSBgLmZvbGQtYW5pbWF0aW9uYCBmcm9tIHRoZSBleGFtcGxlIGFib3ZlOlxuICpcbiAqIGBgYGpzXG4gKiBuZ01vZHVsZS5hbmltYXRpb24oJy5mb2xkLWFuaW1hdGlvbicsIFsnJGFuaW1hdGVDc3MnLCBmdW5jdGlvbigkYW5pbWF0ZUNzcykge1xuICogICByZXR1cm4ge1xuICogICAgIGVudGVyOiBmdW5jdGlvbihlbGVtZW50LCBkb25lRm4pIHtcbiAqICAgICAgIHZhciBoZWlnaHQgPSBlbGVtZW50WzBdLm9mZnNldEhlaWdodDtcbiAqICAgICAgIHJldHVybiAkYW5pbWF0ZUNzcyhlbGVtZW50LCB7XG4gKiAgICAgICAgIGFkZENsYXNzOiAncmVkIGxhcmdlLXRleHQgcHVsc2UtdHdpY2UnLFxuICogICAgICAgICBlYXNpbmc6ICdlYXNlLW91dCcsXG4gKiAgICAgICAgIGZyb206IHsgaGVpZ2h0OicwcHgnIH0sXG4gKiAgICAgICAgIHRvOiB7IGhlaWdodDpoZWlnaHQgKyAncHgnIH0sXG4gKiAgICAgICAgIGR1cmF0aW9uOiAxIC8vIG9uZSBzZWNvbmRcbiAqICAgICAgIH0pO1xuICogICAgIH1cbiAqICAgfVxuICogfV0pO1xuICogYGBgXG4gKlxuICogU2luY2Ugd2UncmUgYWRkaW5nL3JlbW92aW5nIENTUyBjbGFzc2VzIHRoZW4gdGhlIENTUyB0cmFuc2l0aW9uIHdpbGwgYWxzbyBwaWNrIHRob3NlIHVwOlxuICpcbiAqIGBgYGNzc1xuICogLyYjNDI7IHNpbmNlIGEgaGFyZGNvZGVkIGR1cmF0aW9uIHZhbHVlIG9mIDEgd2FzIHByb3ZpZGVkIGluIHRoZSBKYXZhU2NyaXB0IGFuaW1hdGlvbiBjb2RlLFxuICogdGhlIENTUyBjbGFzc2VzIGJlbG93IHdpbGwgYmUgdHJhbnNpdGlvbmVkIGRlc3BpdGUgdGhlbSBiZWluZyBkZWZpbmVkIGFzIHJlZ3VsYXIgQ1NTIGNsYXNzZXMgJiM0MjsvXG4gKiAucmVkIHsgYmFja2dyb3VuZDpyZWQ7IH1cbiAqIC5sYXJnZS10ZXh0IHsgZm9udC1zaXplOjIwcHg7IH1cbiAqXG4gKiAvJiM0Mjsgd2UgY2FuIGFsc28gdXNlIGEga2V5ZnJhbWUgYW5pbWF0aW9uIGFuZCAkYW5pbWF0ZUNzcyB3aWxsIG1ha2UgaXQgd29yayBhbG9uZ3NpZGUgdGhlIHRyYW5zaXRpb24gJiM0MjsvXG4gKiAucHVsc2UtdHdpY2Uge1xuICogICBhbmltYXRpb246IDAuNXMgcHVsc2UgbGluZWFyIDI7XG4gKiAgIC13ZWJraXQtYW5pbWF0aW9uOiAwLjVzIHB1bHNlIGxpbmVhciAyO1xuICogfVxuICpcbiAqIEBrZXlmcmFtZXMgcHVsc2Uge1xuICogICBmcm9tIHsgdHJhbnNmb3JtOiBzY2FsZSgwLjUpOyB9XG4gKiAgIHRvIHsgdHJhbnNmb3JtOiBzY2FsZSgxLjUpOyB9XG4gKiB9XG4gKlxuICogQC13ZWJraXQta2V5ZnJhbWVzIHB1bHNlIHtcbiAqICAgZnJvbSB7IC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgwLjUpOyB9XG4gKiAgIHRvIHsgLXdlYmtpdC10cmFuc2Zvcm06IHNjYWxlKDEuNSk7IH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEdpdmVuIHRoaXMgY29tcGxleCBjb21iaW5hdGlvbiBvZiBDU1MgY2xhc3Nlcywgc3R5bGVzIGFuZCBvcHRpb25zLCBgJGFuaW1hdGVDc3NgIHdpbGwgZmlndXJlIGV2ZXJ5dGhpbmcgb3V0IGFuZCBtYWtlIHRoZSBhbmltYXRpb24gaGFwcGVuLlxuICpcbiAqICMjIEhvdyB0aGUgT3B0aW9ucyBhcmUgaGFuZGxlZFxuICpcbiAqIGAkYW5pbWF0ZUNzc2AgaXMgdmVyeSB2ZXJzYXRpbGUgYW5kIGludGVsbGlnZW50IHdoZW4gaXQgY29tZXMgdG8gZmlndXJpbmcgb3V0IHdoYXQgY29uZmlndXJhdGlvbnMgdG8gYXBwbHkgdG8gdGhlIGVsZW1lbnQgdG8gZW5zdXJlIHRoZSBhbmltYXRpb25cbiAqIHdvcmtzIHdpdGggdGhlIG9wdGlvbnMgcHJvdmlkZWQuIFNheSBmb3IgZXhhbXBsZSB3ZSB3ZXJlIGFkZGluZyBhIGNsYXNzIHRoYXQgY29udGFpbmVkIGEga2V5ZnJhbWUgdmFsdWUgYW5kIHdlIHdhbnRlZCB0byBhbHNvIGFuaW1hdGUgc29tZSBpbmxpbmVcbiAqIHN0eWxlcyB1c2luZyB0aGUgYGZyb21gIGFuZCBgdG9gIHByb3BlcnRpZXMuXG4gKlxuICogYGBganNcbiAqIHZhciBhbmltYXRvciA9ICRhbmltYXRlQ3NzKGVsZW1lbnQsIHtcbiAqICAgZnJvbTogeyBiYWNrZ3JvdW5kOidyZWQnIH0sXG4gKiAgIHRvOiB7IGJhY2tncm91bmQ6J2JsdWUnIH1cbiAqIH0pO1xuICogYW5pbWF0b3Iuc3RhcnQoKTtcbiAqIGBgYFxuICpcbiAqIGBgYGNzc1xuICogLnJvdGF0aW5nLWFuaW1hdGlvbiB7XG4gKiAgIGFuaW1hdGlvbjowLjVzIHJvdGF0ZSBsaW5lYXI7XG4gKiAgIC13ZWJraXQtYW5pbWF0aW9uOjAuNXMgcm90YXRlIGxpbmVhcjtcbiAqIH1cbiAqXG4gKiBAa2V5ZnJhbWVzIHJvdGF0ZSB7XG4gKiAgIGZyb20geyB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsgfVxuICogICB0byB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH1cbiAqIH1cbiAqXG4gKiBALXdlYmtpdC1rZXlmcmFtZXMgcm90YXRlIHtcbiAqICAgZnJvbSB7IC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cbiAqICAgdG8geyAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoZSBtaXNzaW5nIHBpZWNlcyBoZXJlIGFyZSB0aGF0IHdlIGRvIG5vdCBoYXZlIGEgdHJhbnNpdGlvbiBzZXQgKHdpdGhpbiB0aGUgQ1NTIGNvZGUgbm9yIHdpdGhpbiB0aGUgYCRhbmltYXRlQ3NzYCBvcHRpb25zKSBhbmQgdGhlIGR1cmF0aW9uIG9mIHRoZSBhbmltYXRpb24gaXNcbiAqIGdvaW5nIHRvIGJlIGRldGVjdGVkIGZyb20gd2hhdCB0aGUga2V5ZnJhbWUgc3R5bGVzIG9uIHRoZSBDU1MgY2xhc3MgYXJlLiBJbiB0aGlzIGV2ZW50LCBgJGFuaW1hdGVDc3NgIHdpbGwgYXV0b21hdGljYWxseSBjcmVhdGUgYW4gaW5saW5lIHRyYW5zaXRpb25cbiAqIHN0eWxlIG1hdGNoaW5nIHRoZSBkdXJhdGlvbiBkZXRlY3RlZCBmcm9tIHRoZSBrZXlmcmFtZSBzdHlsZSAod2hpY2ggaXMgcHJlc2VudCBpbiB0aGUgQ1NTIGNsYXNzIHRoYXQgaXMgYmVpbmcgYWRkZWQpIGFuZCB0aGVuIHByZXBhcmUgYm90aCB0aGUgdHJhbnNpdGlvblxuICogYW5kIGtleWZyYW1lIGFuaW1hdGlvbnMgdG8gcnVuIGluIHBhcmFsbGVsIG9uIHRoZSBlbGVtZW50LiBUaGVuIHdoZW4gdGhlIGFuaW1hdGlvbiBpcyB1bmRlcndheSB0aGUgcHJvdmlkZWQgYGZyb21gIGFuZCBgdG9gIENTUyBzdHlsZXMgd2lsbCBiZSBhcHBsaWVkXG4gKiBhbmQgc3ByZWFkIGFjcm9zcyB0aGUgdHJhbnNpdGlvbiBhbmQga2V5ZnJhbWUgYW5pbWF0aW9uLlxuICpcbiAqICMjIFdoYXQgaXMgcmV0dXJuZWRcbiAqXG4gKiBgJGFuaW1hdGVDc3NgIHdvcmtzIGluIHR3byBzdGFnZXM6IGEgcHJlcGFyYXRpb24gcGhhc2UgYW5kIGFuIGFuaW1hdGlvbiBwaGFzZS4gVGhlcmVmb3JlIHdoZW4gYCRhbmltYXRlQ3NzYCBpcyBmaXJzdCBjYWxsZWQgaXQgd2lsbCBOT1QgYWN0dWFsbHlcbiAqIHN0YXJ0IHRoZSBhbmltYXRpb24uIEFsbCB0aGF0IGlzIGdvaW5nIG9uIGhlcmUgaXMgdGhhdCB0aGUgZWxlbWVudCBpcyBiZWluZyBwcmVwYXJlZCBmb3IgdGhlIGFuaW1hdGlvbiAod2hpY2ggbWVhbnMgdGhhdCB0aGUgZ2VuZXJhdGVkIENTUyBjbGFzc2VzIGFyZVxuICogYWRkZWQgYW5kIHJlbW92ZWQgb24gdGhlIGVsZW1lbnQpLiBPbmNlIGAkYW5pbWF0ZUNzc2AgaXMgY2FsbGVkIGl0IHdpbGwgcmV0dXJuIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiBgYGBqc1xuICogdmFyIGFuaW1hdG9yID0gJGFuaW1hdGVDc3MoZWxlbWVudCwgeyAuLi4gfSk7XG4gKiBgYGBcbiAqXG4gKiBOb3cgd2hhdCBkbyB0aGUgY29udGVudHMgb2Ygb3VyIGBhbmltYXRvcmAgdmFyaWFibGUgbG9vayBsaWtlOlxuICpcbiAqIGBgYGpzXG4gKiB7XG4gKiAgIC8vIHN0YXJ0cyB0aGUgYW5pbWF0aW9uXG4gKiAgIHN0YXJ0OiBGdW5jdGlvbixcbiAqXG4gKiAgIC8vIGVuZHMgKGFib3J0cykgdGhlIGFuaW1hdGlvblxuICogICBlbmQ6IEZ1bmN0aW9uXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUbyBhY3R1YWxseSBzdGFydCB0aGUgYW5pbWF0aW9uIHdlIG5lZWQgdG8gcnVuIGBhbmltYXRpb24uc3RhcnQoKWAgd2hpY2ggd2lsbCB0aGVuIHJldHVybiBhIHByb21pc2UgdGhhdCB3ZSBjYW4gaG9vayBpbnRvIHRvIGRldGVjdCB3aGVuIHRoZSBhbmltYXRpb24gZW5kcy5cbiAqIElmIHdlIGNob29zZSBub3QgdG8gcnVuIHRoZSBhbmltYXRpb24gdGhlbiB3ZSBNVVNUIHJ1biBgYW5pbWF0aW9uLmVuZCgpYCB0byBwZXJmb3JtIGEgY2xlYW51cCBvbiB0aGUgZWxlbWVudCAoc2luY2Ugc29tZSBDU1MgY2xhc3NlcyBhbmQgc3R5bGVzIG1heSBoYXZlIGJlZW5cbiAqIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQgZHVyaW5nIHRoZSBwcmVwYXJhdGlvbiBwaGFzZSkuIE5vdGUgdGhhdCBhbGwgb3RoZXIgcHJvcGVydGllcyBzdWNoIGFzIGR1cmF0aW9uLCBkZWxheSwgdHJhbnNpdGlvbnMgYW5kIGtleWZyYW1lcyBhcmUganVzdCBwcm9wZXJ0aWVzXG4gKiBhbmQgdGhhdCBjaGFuZ2luZyB0aGVtIHdpbGwgbm90IHJlY29uZmlndXJlIHRoZSBwYXJhbWV0ZXJzIG9mIHRoZSBhbmltYXRpb24uXG4gKlxuICogIyMjIHJ1bm5lci5kb25lKCkgdnMgcnVubmVyLnRoZW4oKVxuICogSXQgaXMgZG9jdW1lbnRlZCB0aGF0IGBhbmltYXRpb24uc3RhcnQoKWAgd2lsbCByZXR1cm4gYSBwcm9taXNlIG9iamVjdCBhbmQgdGhpcyBpcyB0cnVlLCBob3dldmVyLCB0aGVyZSBpcyBhbHNvIGFuIGFkZGl0aW9uYWwgbWV0aG9kIGF2YWlsYWJsZSBvbiB0aGVcbiAqIHJ1bm5lciBjYWxsZWQgYC5kb25lKGNhbGxiYWNrRm4pYC4gVGhlIGRvbmUgbWV0aG9kIHdvcmtzIHRoZSBzYW1lIGFzIGAuZmluYWxseShjYWxsYmFja0ZuKWAsIGhvd2V2ZXIsIGl0IGRvZXMgKipub3QgdHJpZ2dlciBhIGRpZ2VzdCB0byBvY2N1cioqLlxuICogVGhlcmVmb3JlLCBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucywgaXQncyBhbHdheXMgYmVzdCB0byB1c2UgYHJ1bm5lci5kb25lKGNhbGxiYWNrKWAgaW5zdGVhZCBvZiBgcnVubmVyLnRoZW4oKWAsIGBydW5uZXIuY2F0Y2goKWAgb3IgYHJ1bm5lci5maW5hbGx5KClgXG4gKiB1bmxlc3MgeW91IHJlYWxseSBuZWVkIGEgZGlnZXN0IHRvIGtpY2sgb2ZmIGFmdGVyd2FyZHMuXG4gKlxuICogS2VlcCBpbiBtaW5kIHRoYXQsIHRvIG1ha2UgdGhpcyBlYXNpZXIsIG5nQW5pbWF0ZSBoYXMgdHdlYWtlZCB0aGUgSlMgYW5pbWF0aW9ucyBBUEkgdG8gcmVjb2duaXplIHdoZW4gYSBydW5uZXIgaW5zdGFuY2UgaXMgcmV0dXJuZWQgZnJvbSAkYW5pbWF0ZUNzc1xuICogKHNvIHRoZXJlIGlzIG5vIG5lZWQgdG8gY2FsbCBgcnVubmVyLmRvbmUoZG9uZUZuKWAgaW5zaWRlIG9mIHlvdXIgSmF2YVNjcmlwdCBhbmltYXRpb24gY29kZSkuXG4gKiBDaGVjayB0aGUge0BsaW5rIG5nQW5pbWF0ZS4kYW5pbWF0ZUNzcyN1c2FnZSBhbmltYXRpb24gY29kZSBhYm92ZX0gdG8gc2VlIGhvdyB0aGlzIHdvcmtzLlxuICpcbiAqIEBwYXJhbSB7RE9NRWxlbWVudH0gZWxlbWVudCB0aGUgZWxlbWVudCB0aGF0IHdpbGwgYmUgYW5pbWF0ZWRcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHRoZSBhbmltYXRpb24tcmVsYXRlZCBvcHRpb25zIHRoYXQgd2lsbCBiZSBhcHBsaWVkIGR1cmluZyB0aGUgYW5pbWF0aW9uXG4gKlxuICogKiBgZXZlbnRgIC0gVGhlIERPTSBldmVudCAoZS5nLiBlbnRlciwgbGVhdmUsIG1vdmUpLiBXaGVuIHVzZWQsIGEgZ2VuZXJhdGVkIENTUyBjbGFzcyBvZiBgbmctRVZFTlRgIGFuZCBgbmctRVZFTlQtYWN0aXZlYCB3aWxsIGJlIGFwcGxpZWRcbiAqIHRvIHRoZSBlbGVtZW50IGR1cmluZyB0aGUgYW5pbWF0aW9uLiBNdWx0aXBsZSBldmVudHMgY2FuIGJlIHByb3ZpZGVkIHdoZW4gc3BhY2VzIGFyZSB1c2VkIGFzIGEgc2VwYXJhdG9yLiAoTm90ZSB0aGF0IHRoaXMgd2lsbCBub3QgcGVyZm9ybSBhbnkgRE9NIG9wZXJhdGlvbi4pXG4gKiAqIGBzdHJ1Y3R1cmFsYCAtIEluZGljYXRlcyB0aGF0IHRoZSBgbmctYCBwcmVmaXggd2lsbCBiZSBhZGRlZCB0byB0aGUgZXZlbnQgY2xhc3MuIFNldHRpbmcgdG8gYGZhbHNlYCBvciBvbWl0dGluZyB3aWxsIHR1cm4gYG5nLUVWRU5UYCBhbmRcbiAqIGBuZy1FVkVOVC1hY3RpdmVgIGluIGBFVkVOVGAgYW5kIGBFVkVOVC1hY3RpdmVgLiBVbnVzZWQgaWYgYGV2ZW50YCBpcyBvbWl0dGVkLlxuICogKiBgZWFzaW5nYCAtIFRoZSBDU1MgZWFzaW5nIHZhbHVlIHRoYXQgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSB0cmFuc2l0aW9uIG9yIGtleWZyYW1lIGFuaW1hdGlvbiAob3IgYm90aCkuXG4gKiAqIGB0cmFuc2l0aW9uU3R5bGVgIC0gVGhlIHJhdyBDU1MgdHJhbnNpdGlvbiBzdHlsZSB0aGF0IHdpbGwgYmUgdXNlZCAoZS5nLiBgMXMgbGluZWFyIGFsbGApLlxuICogKiBga2V5ZnJhbWVTdHlsZWAgLSBUaGUgcmF3IENTUyBrZXlmcmFtZSBhbmltYXRpb24gc3R5bGUgdGhhdCB3aWxsIGJlIHVzZWQgKGUuZy4gYDFzIG15X2FuaW1hdGlvbiBsaW5lYXJgKS5cbiAqICogYGZyb21gIC0gVGhlIHN0YXJ0aW5nIENTUyBzdHlsZXMgKGEga2V5L3ZhbHVlIG9iamVjdCkgdGhhdCB3aWxsIGJlIGFwcGxpZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBhbmltYXRpb24uXG4gKiAqIGB0b2AgLSBUaGUgZW5kaW5nIENTUyBzdHlsZXMgKGEga2V5L3ZhbHVlIG9iamVjdCkgdGhhdCB3aWxsIGJlIGFwcGxpZWQgYWNyb3NzIHRoZSBhbmltYXRpb24gdmlhIGEgQ1NTIHRyYW5zaXRpb24uXG4gKiAqIGBhZGRDbGFzc2AgLSBBIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIENTUyBjbGFzc2VzIHRoYXQgd2lsbCBiZSBhZGRlZCB0byB0aGUgZWxlbWVudCBhbmQgc3ByZWFkIGFjcm9zcyB0aGUgYW5pbWF0aW9uLlxuICogKiBgcmVtb3ZlQ2xhc3NgIC0gQSBzcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBDU1MgY2xhc3NlcyB0aGF0IHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBlbGVtZW50IGFuZCBzcHJlYWQgYWNyb3NzIHRoZSBhbmltYXRpb24uXG4gKiAqIGBkdXJhdGlvbmAgLSBBIG51bWJlciB2YWx1ZSByZXByZXNlbnRpbmcgdGhlIHRvdGFsIGR1cmF0aW9uIG9mIHRoZSB0cmFuc2l0aW9uIGFuZC9vciBrZXlmcmFtZSAobm90ZSB0aGF0IGEgdmFsdWUgb2YgMSBpcyAxMDAwbXMpLiBJZiBhIHZhbHVlIG9mIGAwYFxuICogaXMgcHJvdmlkZWQgdGhlbiB0aGUgYW5pbWF0aW9uIHdpbGwgYmUgc2tpcHBlZCBlbnRpcmVseS5cbiAqICogYGRlbGF5YCAtIEEgbnVtYmVyIHZhbHVlIHJlcHJlc2VudGluZyB0aGUgdG90YWwgZGVsYXkgb2YgdGhlIHRyYW5zaXRpb24gYW5kL29yIGtleWZyYW1lIChub3RlIHRoYXQgYSB2YWx1ZSBvZiAxIGlzIDEwMDBtcykuIElmIGEgdmFsdWUgb2YgYHRydWVgIGlzXG4gKiB1c2VkIHRoZW4gd2hhdGV2ZXIgZGVsYXkgdmFsdWUgaXMgZGV0ZWN0ZWQgZnJvbSB0aGUgQ1NTIGNsYXNzZXMgd2lsbCBiZSBtaXJyb3JlZCBvbiB0aGUgZWxlbWVudHMgc3R5bGVzIChlLmcuIGJ5IHNldHRpbmcgZGVsYXkgdHJ1ZSB0aGVuIHRoZSBzdHlsZSB2YWx1ZVxuICogb2YgdGhlIGVsZW1lbnQgd2lsbCBiZSBgdHJhbnNpdGlvbi1kZWxheTogREVURUNURURfVkFMVUVgKS4gVXNpbmcgYHRydWVgIGlzIHVzZWZ1bCB3aGVuIHlvdSB3YW50IHRoZSBDU1MgY2xhc3NlcyBhbmQgaW5saW5lIHN0eWxlcyB0byBhbGwgc2hhcmUgdGhlIHNhbWVcbiAqIENTUyBkZWxheSB2YWx1ZS5cbiAqICogYHN0YWdnZXJgIC0gQSBudW1lcmljIHRpbWUgdmFsdWUgcmVwcmVzZW50aW5nIHRoZSBkZWxheSBiZXR3ZWVuIHN1Y2Nlc3NpdmVseSBhbmltYXRlZCBlbGVtZW50c1xuICogKHtAbGluayBuZ0FuaW1hdGUjY3NzLXN0YWdnZXJpbmctYW5pbWF0aW9ucyBDbGljayBoZXJlIHRvIGxlYXJuIGhvdyBDU1MtYmFzZWQgc3RhZ2dlcmluZyB3b3JrcyBpbiBuZ0FuaW1hdGUufSlcbiAqICogYHN0YWdnZXJJbmRleGAgLSBUaGUgbnVtZXJpYyBpbmRleCByZXByZXNlbnRpbmcgdGhlIHN0YWdnZXIgaXRlbSAoZS5nLiBhIHZhbHVlIG9mIDUgaXMgZXF1YWwgdG8gdGhlIHNpeHRoIGl0ZW0gaW4gdGhlIHN0YWdnZXI7IHRoZXJlZm9yZSB3aGVuIGFcbiAqICAgYHN0YWdnZXJgIG9wdGlvbiB2YWx1ZSBvZiBgMC4xYCBpcyB1c2VkIHRoZW4gdGhlcmUgd2lsbCBiZSBhIHN0YWdnZXIgZGVsYXkgb2YgYDYwMG1zYClcbiAqICogYGFwcGx5Q2xhc3Nlc0Vhcmx5YCAtIFdoZXRoZXIgb3Igbm90IHRoZSBjbGFzc2VzIGJlaW5nIGFkZGVkIG9yIHJlbW92ZWQgd2lsbCBiZSB1c2VkIHdoZW4gZGV0ZWN0aW5nIHRoZSBhbmltYXRpb24uIFRoaXMgaXMgc2V0IGJ5IGAkYW5pbWF0ZWAgd2hlbiBlbnRlci9sZWF2ZS9tb3ZlIGFuaW1hdGlvbnMgYXJlIGZpcmVkIHRvIGVuc3VyZSB0aGF0IHRoZSBDU1MgY2xhc3NlcyBhcmUgcmVzb2x2ZWQgaW4gdGltZS4gKE5vdGUgdGhhdCB0aGlzIHdpbGwgcHJldmVudCBhbnkgdHJhbnNpdGlvbnMgZnJvbSBvY2N1cnJpbmcgb24gdGhlIGNsYXNzZXMgYmVpbmcgYWRkZWQgYW5kIHJlbW92ZWQuKVxuICogKiBgY2xlYW51cFN0eWxlc2AgLSBXaGV0aGVyIG9yIG5vdCB0aGUgcHJvdmlkZWQgYGZyb21gIGFuZCBgdG9gIHN0eWxlcyB3aWxsIGJlIHJlbW92ZWQgb25jZVxuICogICAgdGhlIGFuaW1hdGlvbiBpcyBjbG9zZWQuIFRoaXMgaXMgdXNlZnVsIGZvciB3aGVuIHRoZSBzdHlsZXMgYXJlIHVzZWQgcHVyZWx5IGZvciB0aGUgc2FrZSBvZlxuICogICAgdGhlIGFuaW1hdGlvbiBhbmQgZG8gbm90IGhhdmUgYSBsYXN0aW5nIHZpc3VhbCBlZmZlY3Qgb24gdGhlIGVsZW1lbnQgKGUuZy4gYSBjb2xsYXBzZSBhbmQgb3BlbiBhbmltYXRpb24pLlxuICogICAgQnkgZGVmYXVsdCB0aGlzIHZhbHVlIGlzIHNldCB0byBgZmFsc2VgLlxuICpcbiAqIEByZXR1cm4ge29iamVjdH0gYW4gb2JqZWN0IHdpdGggc3RhcnQgYW5kIGVuZCBtZXRob2RzIGFuZCBkZXRhaWxzIGFib3V0IHRoZSBhbmltYXRpb24uXG4gKlxuICogKiBgc3RhcnRgIC0gVGhlIG1ldGhvZCB0byBzdGFydCB0aGUgYW5pbWF0aW9uLiBUaGlzIHdpbGwgcmV0dXJuIGEgYFByb21pc2VgIHdoZW4gY2FsbGVkLlxuICogKiBgZW5kYCAtIFRoaXMgbWV0aG9kIHdpbGwgY2FuY2VsIHRoZSBhbmltYXRpb24gYW5kIHJlbW92ZSBhbGwgYXBwbGllZCBDU1MgY2xhc3NlcyBhbmQgc3R5bGVzLlxuICovXG52YXIgT05FX1NFQ09ORCA9IDEwMDA7XG52YXIgQkFTRV9URU4gPSAxMDtcblxudmFyIEVMQVBTRURfVElNRV9NQVhfREVDSU1BTF9QTEFDRVMgPSAzO1xudmFyIENMT1NJTkdfVElNRV9CVUZGRVIgPSAxLjU7XG5cbnZhciBERVRFQ1RfQ1NTX1BST1BFUlRJRVMgPSB7XG4gIHRyYW5zaXRpb25EdXJhdGlvbjogICAgICBUUkFOU0lUSU9OX0RVUkFUSU9OX1BST1AsXG4gIHRyYW5zaXRpb25EZWxheTogICAgICAgICBUUkFOU0lUSU9OX0RFTEFZX1BST1AsXG4gIHRyYW5zaXRpb25Qcm9wZXJ0eTogICAgICBUUkFOU0lUSU9OX1BST1AgKyBQUk9QRVJUWV9LRVksXG4gIGFuaW1hdGlvbkR1cmF0aW9uOiAgICAgICBBTklNQVRJT05fRFVSQVRJT05fUFJPUCxcbiAgYW5pbWF0aW9uRGVsYXk6ICAgICAgICAgIEFOSU1BVElPTl9ERUxBWV9QUk9QLFxuICBhbmltYXRpb25JdGVyYXRpb25Db3VudDogQU5JTUFUSU9OX1BST1AgKyBBTklNQVRJT05fSVRFUkFUSU9OX0NPVU5UX0tFWVxufTtcblxudmFyIERFVEVDVF9TVEFHR0VSX0NTU19QUk9QRVJUSUVTID0ge1xuICB0cmFuc2l0aW9uRHVyYXRpb246ICAgICAgVFJBTlNJVElPTl9EVVJBVElPTl9QUk9QLFxuICB0cmFuc2l0aW9uRGVsYXk6ICAgICAgICAgVFJBTlNJVElPTl9ERUxBWV9QUk9QLFxuICBhbmltYXRpb25EdXJhdGlvbjogICAgICAgQU5JTUFUSU9OX0RVUkFUSU9OX1BST1AsXG4gIGFuaW1hdGlvbkRlbGF5OiAgICAgICAgICBBTklNQVRJT05fREVMQVlfUFJPUFxufTtcblxuZnVuY3Rpb24gZ2V0Q3NzS2V5ZnJhbWVEdXJhdGlvblN0eWxlKGR1cmF0aW9uKSB7XG4gIHJldHVybiBbQU5JTUFUSU9OX0RVUkFUSU9OX1BST1AsIGR1cmF0aW9uICsgJ3MnXTtcbn1cblxuZnVuY3Rpb24gZ2V0Q3NzRGVsYXlTdHlsZShkZWxheSwgaXNLZXlmcmFtZUFuaW1hdGlvbikge1xuICB2YXIgcHJvcCA9IGlzS2V5ZnJhbWVBbmltYXRpb24gPyBBTklNQVRJT05fREVMQVlfUFJPUCA6IFRSQU5TSVRJT05fREVMQVlfUFJPUDtcbiAgcmV0dXJuIFtwcm9wLCBkZWxheSArICdzJ107XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVDc3NTdHlsZXMoJHdpbmRvdywgZWxlbWVudCwgcHJvcGVydGllcykge1xuICB2YXIgc3R5bGVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdmFyIGRldGVjdGVkU3R5bGVzID0gJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpIHx8IHt9O1xuICBmb3JFYWNoKHByb3BlcnRpZXMsIGZ1bmN0aW9uKGZvcm1hbFN0eWxlTmFtZSwgYWN0dWFsU3R5bGVOYW1lKSB7XG4gICAgdmFyIHZhbCA9IGRldGVjdGVkU3R5bGVzW2Zvcm1hbFN0eWxlTmFtZV07XG4gICAgaWYgKHZhbCkge1xuICAgICAgdmFyIGMgPSB2YWwuY2hhckF0KDApO1xuXG4gICAgICAvLyBvbmx5IG51bWVyaWNhbC1iYXNlZCB2YWx1ZXMgaGF2ZSBhIG5lZ2F0aXZlIHNpZ24gb3IgZGlnaXQgYXMgdGhlIGZpcnN0IHZhbHVlXG4gICAgICBpZiAoYyA9PT0gJy0nIHx8IGMgPT09ICcrJyB8fCBjID49IDApIHtcbiAgICAgICAgdmFsID0gcGFyc2VNYXhUaW1lKHZhbCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGJ5IHNldHRpbmcgdGhpcyB0byBudWxsIGluIHRoZSBldmVudCB0aGF0IHRoZSBkZWxheSBpcyBub3Qgc2V0IG9yIGlzIHNldCBkaXJlY3RseSBhcyAwXG4gICAgICAvLyB0aGVuIHdlIGNhbiBzdGlsbCBhbGxvdyBmb3IgbmVnYXRpdmUgdmFsdWVzIHRvIGJlIHVzZWQgbGF0ZXIgb24gYW5kIG5vdCBtaXN0YWtlIHRoaXNcbiAgICAgIC8vIHZhbHVlIGZvciBiZWluZyBncmVhdGVyIHRoYW4gYW55IG90aGVyIG5lZ2F0aXZlIHZhbHVlLlxuICAgICAgaWYgKHZhbCA9PT0gMCkge1xuICAgICAgICB2YWwgPSBudWxsO1xuICAgICAgfVxuICAgICAgc3R5bGVzW2FjdHVhbFN0eWxlTmFtZV0gPSB2YWw7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gc3R5bGVzO1xufVxuXG5mdW5jdGlvbiBwYXJzZU1heFRpbWUoc3RyKSB7XG4gIHZhciBtYXhWYWx1ZSA9IDA7XG4gIHZhciB2YWx1ZXMgPSBzdHIuc3BsaXQoL1xccyosXFxzKi8pO1xuICBmb3JFYWNoKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAvLyBpdCdzIGFsd2F5cyBzYWZlIHRvIGNvbnNpZGVyIG9ubHkgc2Vjb25kIHZhbHVlcyBhbmQgb21pdCBgbXNgIHZhbHVlcyBzaW5jZVxuICAgIC8vIGdldENvbXB1dGVkU3R5bGUgd2lsbCBhbHdheXMgaGFuZGxlIHRoZSBjb252ZXJzaW9uIGZvciB1c1xuICAgIGlmICh2YWx1ZS5jaGFyQXQodmFsdWUubGVuZ3RoIC0gMSkgPT0gJ3MnKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnN1YnN0cmluZygwLCB2YWx1ZS5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKSB8fCAwO1xuICAgIG1heFZhbHVlID0gbWF4VmFsdWUgPyBNYXRoLm1heCh2YWx1ZSwgbWF4VmFsdWUpIDogdmFsdWU7XG4gIH0pO1xuICByZXR1cm4gbWF4VmFsdWU7XG59XG5cbmZ1bmN0aW9uIHRydXRoeVRpbWluZ1ZhbHVlKHZhbCkge1xuICByZXR1cm4gdmFsID09PSAwIHx8IHZhbCAhPSBudWxsO1xufVxuXG5mdW5jdGlvbiBnZXRDc3NUcmFuc2l0aW9uRHVyYXRpb25TdHlsZShkdXJhdGlvbiwgYXBwbHlPbmx5RHVyYXRpb24pIHtcbiAgdmFyIHN0eWxlID0gVFJBTlNJVElPTl9QUk9QO1xuICB2YXIgdmFsdWUgPSBkdXJhdGlvbiArICdzJztcbiAgaWYgKGFwcGx5T25seUR1cmF0aW9uKSB7XG4gICAgc3R5bGUgKz0gRFVSQVRJT05fS0VZO1xuICB9IGVsc2Uge1xuICAgIHZhbHVlICs9ICcgbGluZWFyIGFsbCc7XG4gIH1cbiAgcmV0dXJuIFtzdHlsZSwgdmFsdWVdO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVMb2NhbENhY2hlTG9va3VwKCkge1xuICB2YXIgY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICByZXR1cm4ge1xuICAgIGZsdXNoOiBmdW5jdGlvbigpIHtcbiAgICAgIGNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB9LFxuXG4gICAgY291bnQ6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIGVudHJ5ID0gY2FjaGVba2V5XTtcbiAgICAgIHJldHVybiBlbnRyeSA/IGVudHJ5LnRvdGFsIDogMDtcbiAgICB9LFxuXG4gICAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBlbnRyeSA9IGNhY2hlW2tleV07XG4gICAgICByZXR1cm4gZW50cnkgJiYgZW50cnkudmFsdWU7XG4gICAgfSxcblxuICAgIHB1dDogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKCFjYWNoZVtrZXldKSB7XG4gICAgICAgIGNhY2hlW2tleV0gPSB7IHRvdGFsOiAxLCB2YWx1ZTogdmFsdWUgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhY2hlW2tleV0udG90YWwrKztcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbi8vIHdlIGRvIG5vdCByZWFzc2lnbiBhbiBhbHJlYWR5IHByZXNlbnQgc3R5bGUgdmFsdWUgc2luY2Vcbi8vIGlmIHdlIGRldGVjdCB0aGUgc3R5bGUgcHJvcGVydHkgdmFsdWUgYWdhaW4gd2UgbWF5IGJlXG4vLyBkZXRlY3Rpbmcgc3R5bGVzIHRoYXQgd2VyZSBhZGRlZCB2aWEgdGhlIGBmcm9tYCBzdHlsZXMuXG4vLyBXZSBtYWtlIHVzZSBvZiBgaXNEZWZpbmVkYCBoZXJlIHNpbmNlIGFuIGVtcHR5IHN0cmluZ1xuLy8gb3IgbnVsbCB2YWx1ZSAod2hpY2ggaXMgd2hhdCBnZXRQcm9wZXJ0eVZhbHVlIHdpbGwgcmV0dXJuXG4vLyBmb3IgYSBub24tZXhpc3Rpbmcgc3R5bGUpIHdpbGwgc3RpbGwgYmUgbWFya2VkIGFzIGEgdmFsaWRcbi8vIHZhbHVlIGZvciB0aGUgc3R5bGUgKGEgZmFsc3kgdmFsdWUgaW1wbGllcyB0aGF0IHRoZSBzdHlsZVxuLy8gaXMgdG8gYmUgcmVtb3ZlZCBhdCB0aGUgZW5kIG9mIHRoZSBhbmltYXRpb24pLiBJZiB3ZSBoYWQgYSBzaW1wbGVcbi8vIFwiT1JcIiBzdGF0ZW1lbnQgdGhlbiBpdCB3b3VsZCBub3QgYmUgZW5vdWdoIHRvIGNhdGNoIHRoYXQuXG5mdW5jdGlvbiByZWdpc3RlclJlc3RvcmFibGVTdHlsZXMoYmFja3VwLCBub2RlLCBwcm9wZXJ0aWVzKSB7XG4gIGZvckVhY2gocHJvcGVydGllcywgZnVuY3Rpb24ocHJvcCkge1xuICAgIGJhY2t1cFtwcm9wXSA9IGlzRGVmaW5lZChiYWNrdXBbcHJvcF0pXG4gICAgICAgID8gYmFja3VwW3Byb3BdXG4gICAgICAgIDogbm9kZS5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHByb3ApO1xuICB9KTtcbn1cblxudmFyICRBbmltYXRlQ3NzUHJvdmlkZXIgPSBbJyRhbmltYXRlUHJvdmlkZXInLCBmdW5jdGlvbigkYW5pbWF0ZVByb3ZpZGVyKSB7XG4gIHZhciBnY3NMb29rdXAgPSBjcmVhdGVMb2NhbENhY2hlTG9va3VwKCk7XG4gIHZhciBnY3NTdGFnZ2VyTG9va3VwID0gY3JlYXRlTG9jYWxDYWNoZUxvb2t1cCgpO1xuXG4gIHRoaXMuJGdldCA9IFsnJHdpbmRvdycsICckJGpxTGl0ZScsICckJEFuaW1hdGVSdW5uZXInLCAnJHRpbWVvdXQnLFxuICAgICAgICAgICAgICAgJyQkZm9yY2VSZWZsb3cnLCAnJHNuaWZmZXInLCAnJCRyQUZTY2hlZHVsZXInLCAnJCRhbmltYXRlUXVldWUnLFxuICAgICAgIGZ1bmN0aW9uKCR3aW5kb3csICAgJCRqcUxpdGUsICAgJCRBbmltYXRlUnVubmVyLCAgICR0aW1lb3V0LFxuICAgICAgICAgICAgICAgICQkZm9yY2VSZWZsb3csICAgJHNuaWZmZXIsICAgJCRyQUZTY2hlZHVsZXIsICQkYW5pbWF0ZVF1ZXVlKSB7XG5cbiAgICB2YXIgYXBwbHlBbmltYXRpb25DbGFzc2VzID0gYXBwbHlBbmltYXRpb25DbGFzc2VzRmFjdG9yeSgkJGpxTGl0ZSk7XG5cbiAgICB2YXIgcGFyZW50Q291bnRlciA9IDA7XG4gICAgZnVuY3Rpb24gZ2NzSGFzaEZuKG5vZGUsIGV4dHJhQ2xhc3Nlcykge1xuICAgICAgdmFyIEtFWSA9IFwiJCRuZ0FuaW1hdGVQYXJlbnRLZXlcIjtcbiAgICAgIHZhciBwYXJlbnROb2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgdmFyIHBhcmVudElEID0gcGFyZW50Tm9kZVtLRVldIHx8IChwYXJlbnROb2RlW0tFWV0gPSArK3BhcmVudENvdW50ZXIpO1xuICAgICAgcmV0dXJuIHBhcmVudElEICsgJy0nICsgbm9kZS5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgKyAnLScgKyBleHRyYUNsYXNzZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tcHV0ZUNhY2hlZENzc1N0eWxlcyhub2RlLCBjbGFzc05hbWUsIGNhY2hlS2V5LCBwcm9wZXJ0aWVzKSB7XG4gICAgICB2YXIgdGltaW5ncyA9IGdjc0xvb2t1cC5nZXQoY2FjaGVLZXkpO1xuXG4gICAgICBpZiAoIXRpbWluZ3MpIHtcbiAgICAgICAgdGltaW5ncyA9IGNvbXB1dGVDc3NTdHlsZXMoJHdpbmRvdywgbm9kZSwgcHJvcGVydGllcyk7XG4gICAgICAgIGlmICh0aW1pbmdzLmFuaW1hdGlvbkl0ZXJhdGlvbkNvdW50ID09PSAnaW5maW5pdGUnKSB7XG4gICAgICAgICAgdGltaW5ncy5hbmltYXRpb25JdGVyYXRpb25Db3VudCA9IDE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gd2Uga2VlcCBwdXR0aW5nIHRoaXMgaW4gbXVsdGlwbGUgdGltZXMgZXZlbiB0aG91Z2ggdGhlIHZhbHVlIGFuZCB0aGUgY2FjaGVLZXkgYXJlIHRoZSBzYW1lXG4gICAgICAvLyBiZWNhdXNlIHdlJ3JlIGtlZXBpbmcgYW4gaW50ZXJuYWwgdGFsbHkgb2YgaG93IG1hbnkgZHVwbGljYXRlIGFuaW1hdGlvbnMgYXJlIGRldGVjdGVkLlxuICAgICAgZ2NzTG9va3VwLnB1dChjYWNoZUtleSwgdGltaW5ncyk7XG4gICAgICByZXR1cm4gdGltaW5ncztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb21wdXRlQ2FjaGVkQ3NzU3RhZ2dlclN0eWxlcyhub2RlLCBjbGFzc05hbWUsIGNhY2hlS2V5LCBwcm9wZXJ0aWVzKSB7XG4gICAgICB2YXIgc3RhZ2dlcjtcblxuICAgICAgLy8gaWYgd2UgaGF2ZSBvbmUgb3IgbW9yZSBleGlzdGluZyBtYXRjaGVzIG9mIG1hdGNoaW5nIGVsZW1lbnRzXG4gICAgICAvLyBjb250YWluaW5nIHRoZSBzYW1lIHBhcmVudCArIENTUyBzdHlsZXMgKHdoaWNoIGlzIGhvdyBjYWNoZUtleSB3b3JrcylcbiAgICAgIC8vIHRoZW4gc3RhZ2dlcmluZyBpcyBwb3NzaWJsZVxuICAgICAgaWYgKGdjc0xvb2t1cC5jb3VudChjYWNoZUtleSkgPiAwKSB7XG4gICAgICAgIHN0YWdnZXIgPSBnY3NTdGFnZ2VyTG9va3VwLmdldChjYWNoZUtleSk7XG5cbiAgICAgICAgaWYgKCFzdGFnZ2VyKSB7XG4gICAgICAgICAgdmFyIHN0YWdnZXJDbGFzc05hbWUgPSBwZW5kQ2xhc3NlcyhjbGFzc05hbWUsICctc3RhZ2dlcicpO1xuXG4gICAgICAgICAgJCRqcUxpdGUuYWRkQ2xhc3Mobm9kZSwgc3RhZ2dlckNsYXNzTmFtZSk7XG5cbiAgICAgICAgICBzdGFnZ2VyID0gY29tcHV0ZUNzc1N0eWxlcygkd2luZG93LCBub2RlLCBwcm9wZXJ0aWVzKTtcblxuICAgICAgICAgIC8vIGZvcmNlIHRoZSBjb252ZXJzaW9uIG9mIGEgbnVsbCB2YWx1ZSB0byB6ZXJvIGluY2FzZSBub3Qgc2V0XG4gICAgICAgICAgc3RhZ2dlci5hbmltYXRpb25EdXJhdGlvbiA9IE1hdGgubWF4KHN0YWdnZXIuYW5pbWF0aW9uRHVyYXRpb24sIDApO1xuICAgICAgICAgIHN0YWdnZXIudHJhbnNpdGlvbkR1cmF0aW9uID0gTWF0aC5tYXgoc3RhZ2dlci50cmFuc2l0aW9uRHVyYXRpb24sIDApO1xuXG4gICAgICAgICAgJCRqcUxpdGUucmVtb3ZlQ2xhc3Mobm9kZSwgc3RhZ2dlckNsYXNzTmFtZSk7XG5cbiAgICAgICAgICBnY3NTdGFnZ2VyTG9va3VwLnB1dChjYWNoZUtleSwgc3RhZ2dlcik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0YWdnZXIgfHwge307XG4gICAgfVxuXG4gICAgdmFyIGNhbmNlbExhc3RSQUZSZXF1ZXN0O1xuICAgIHZhciByYWZXYWl0UXVldWUgPSBbXTtcbiAgICBmdW5jdGlvbiB3YWl0VW50aWxRdWlldChjYWxsYmFjaykge1xuICAgICAgcmFmV2FpdFF1ZXVlLnB1c2goY2FsbGJhY2spO1xuICAgICAgJCRyQUZTY2hlZHVsZXIud2FpdFVudGlsUXVpZXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGdjc0xvb2t1cC5mbHVzaCgpO1xuICAgICAgICBnY3NTdGFnZ2VyTG9va3VwLmZsdXNoKCk7XG5cbiAgICAgICAgLy8gRE8gTk9UIFJFTU9WRSBUSElTIExJTkUgT1IgUkVGQUNUT1IgT1VUIFRIRSBgcGFnZVdpZHRoYCB2YXJpYWJsZS5cbiAgICAgICAgLy8gUExFQVNFIEVYQU1JTkUgVEhFIGAkJGZvcmNlUmVmbG93YCBzZXJ2aWNlIHRvIHVuZGVyc3RhbmQgd2h5LlxuICAgICAgICB2YXIgcGFnZVdpZHRoID0gJCRmb3JjZVJlZmxvdygpO1xuXG4gICAgICAgIC8vIHdlIHVzZSBhIGZvciBsb29wIHRvIGVuc3VyZSB0aGF0IGlmIHRoZSBxdWV1ZSBpcyBjaGFuZ2VkXG4gICAgICAgIC8vIGR1cmluZyB0aGlzIGxvb3BpbmcgdGhlbiBpdCB3aWxsIGNvbnNpZGVyIG5ldyByZXF1ZXN0c1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhZldhaXRRdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHJhZldhaXRRdWV1ZVtpXShwYWdlV2lkdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJhZldhaXRRdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tcHV0ZVRpbWluZ3Mobm9kZSwgY2xhc3NOYW1lLCBjYWNoZUtleSkge1xuICAgICAgdmFyIHRpbWluZ3MgPSBjb21wdXRlQ2FjaGVkQ3NzU3R5bGVzKG5vZGUsIGNsYXNzTmFtZSwgY2FjaGVLZXksIERFVEVDVF9DU1NfUFJPUEVSVElFUyk7XG4gICAgICB2YXIgYUQgPSB0aW1pbmdzLmFuaW1hdGlvbkRlbGF5O1xuICAgICAgdmFyIHREID0gdGltaW5ncy50cmFuc2l0aW9uRGVsYXk7XG4gICAgICB0aW1pbmdzLm1heERlbGF5ID0gYUQgJiYgdERcbiAgICAgICAgICA/IE1hdGgubWF4KGFELCB0RClcbiAgICAgICAgICA6IChhRCB8fCB0RCk7XG4gICAgICB0aW1pbmdzLm1heER1cmF0aW9uID0gTWF0aC5tYXgoXG4gICAgICAgICAgdGltaW5ncy5hbmltYXRpb25EdXJhdGlvbiAqIHRpbWluZ3MuYW5pbWF0aW9uSXRlcmF0aW9uQ291bnQsXG4gICAgICAgICAgdGltaW5ncy50cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgICByZXR1cm4gdGltaW5ncztcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW5pdChlbGVtZW50LCBpbml0aWFsT3B0aW9ucykge1xuICAgICAgLy8gYWxsIG9mIHRoZSBhbmltYXRpb24gZnVuY3Rpb25zIHNob3VsZCBjcmVhdGVcbiAgICAgIC8vIGEgY29weSBvZiB0aGUgb3B0aW9ucyBkYXRhLCBob3dldmVyLCBpZiBhXG4gICAgICAvLyBwYXJlbnQgc2VydmljZSBoYXMgYWxyZWFkeSBjcmVhdGVkIGEgY29weSB0aGVuXG4gICAgICAvLyB3ZSBzaG91bGQgc3RpY2sgdG8gdXNpbmcgdGhhdFxuICAgICAgdmFyIG9wdGlvbnMgPSBpbml0aWFsT3B0aW9ucyB8fCB7fTtcbiAgICAgIGlmICghb3B0aW9ucy4kJHByZXBhcmVkKSB7XG4gICAgICAgIG9wdGlvbnMgPSBwcmVwYXJlQW5pbWF0aW9uT3B0aW9ucyhjb3B5KG9wdGlvbnMpKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlc3RvcmVTdHlsZXMgPSB7fTtcbiAgICAgIHZhciBub2RlID0gZ2V0RG9tTm9kZShlbGVtZW50KTtcbiAgICAgIGlmICghbm9kZVxuICAgICAgICAgIHx8ICFub2RlLnBhcmVudE5vZGVcbiAgICAgICAgICB8fCAhJCRhbmltYXRlUXVldWUuZW5hYmxlZCgpKSB7XG4gICAgICAgIHJldHVybiBjbG9zZUFuZFJldHVybk5vb3BBbmltYXRvcigpO1xuICAgICAgfVxuXG4gICAgICB2YXIgdGVtcG9yYXJ5U3R5bGVzID0gW107XG4gICAgICB2YXIgY2xhc3NlcyA9IGVsZW1lbnQuYXR0cignY2xhc3MnKTtcbiAgICAgIHZhciBzdHlsZXMgPSBwYWNrYWdlU3R5bGVzKG9wdGlvbnMpO1xuICAgICAgdmFyIGFuaW1hdGlvbkNsb3NlZDtcbiAgICAgIHZhciBhbmltYXRpb25QYXVzZWQ7XG4gICAgICB2YXIgYW5pbWF0aW9uQ29tcGxldGVkO1xuICAgICAgdmFyIHJ1bm5lcjtcbiAgICAgIHZhciBydW5uZXJIb3N0O1xuICAgICAgdmFyIG1heERlbGF5O1xuICAgICAgdmFyIG1heERlbGF5VGltZTtcbiAgICAgIHZhciBtYXhEdXJhdGlvbjtcbiAgICAgIHZhciBtYXhEdXJhdGlvblRpbWU7XG4gICAgICB2YXIgc3RhcnRUaW1lO1xuICAgICAgdmFyIGV2ZW50cyA9IFtdO1xuXG4gICAgICBpZiAob3B0aW9ucy5kdXJhdGlvbiA9PT0gMCB8fCAoISRzbmlmZmVyLmFuaW1hdGlvbnMgJiYgISRzbmlmZmVyLnRyYW5zaXRpb25zKSkge1xuICAgICAgICByZXR1cm4gY2xvc2VBbmRSZXR1cm5Ob29wQW5pbWF0b3IoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG1ldGhvZCA9IG9wdGlvbnMuZXZlbnQgJiYgaXNBcnJheShvcHRpb25zLmV2ZW50KVxuICAgICAgICAgICAgPyBvcHRpb25zLmV2ZW50LmpvaW4oJyAnKVxuICAgICAgICAgICAgOiBvcHRpb25zLmV2ZW50O1xuXG4gICAgICB2YXIgaXNTdHJ1Y3R1cmFsID0gbWV0aG9kICYmIG9wdGlvbnMuc3RydWN0dXJhbDtcbiAgICAgIHZhciBzdHJ1Y3R1cmFsQ2xhc3NOYW1lID0gJyc7XG4gICAgICB2YXIgYWRkUmVtb3ZlQ2xhc3NOYW1lID0gJyc7XG5cbiAgICAgIGlmIChpc1N0cnVjdHVyYWwpIHtcbiAgICAgICAgc3RydWN0dXJhbENsYXNzTmFtZSA9IHBlbmRDbGFzc2VzKG1ldGhvZCwgRVZFTlRfQ0xBU1NfUFJFRklYLCB0cnVlKTtcbiAgICAgIH0gZWxzZSBpZiAobWV0aG9kKSB7XG4gICAgICAgIHN0cnVjdHVyYWxDbGFzc05hbWUgPSBtZXRob2Q7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmFkZENsYXNzKSB7XG4gICAgICAgIGFkZFJlbW92ZUNsYXNzTmFtZSArPSBwZW5kQ2xhc3NlcyhvcHRpb25zLmFkZENsYXNzLCBBRERfQ0xBU1NfU1VGRklYKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMucmVtb3ZlQ2xhc3MpIHtcbiAgICAgICAgaWYgKGFkZFJlbW92ZUNsYXNzTmFtZS5sZW5ndGgpIHtcbiAgICAgICAgICBhZGRSZW1vdmVDbGFzc05hbWUgKz0gJyAnO1xuICAgICAgICB9XG4gICAgICAgIGFkZFJlbW92ZUNsYXNzTmFtZSArPSBwZW5kQ2xhc3NlcyhvcHRpb25zLnJlbW92ZUNsYXNzLCBSRU1PVkVfQ0xBU1NfU1VGRklYKTtcbiAgICAgIH1cblxuICAgICAgLy8gdGhlcmUgbWF5IGJlIGEgc2l0dWF0aW9uIHdoZXJlIGEgc3RydWN0dXJhbCBhbmltYXRpb24gaXMgY29tYmluZWQgdG9nZXRoZXJcbiAgICAgIC8vIHdpdGggQ1NTIGNsYXNzZXMgdGhhdCBuZWVkIHRvIHJlc29sdmUgYmVmb3JlIHRoZSBhbmltYXRpb24gaXMgY29tcHV0ZWQuXG4gICAgICAvLyBIb3dldmVyIHRoaXMgbWVhbnMgdGhhdCB0aGVyZSBpcyBubyBleHBsaWNpdCBDU1MgY29kZSB0byBibG9jayB0aGUgYW5pbWF0aW9uXG4gICAgICAvLyBmcm9tIGhhcHBlbmluZyAoYnkgc2V0dGluZyAwcyBub25lIGluIHRoZSBjbGFzcyBuYW1lKS4gSWYgdGhpcyBpcyB0aGUgY2FzZVxuICAgICAgLy8gd2UgbmVlZCB0byBhcHBseSB0aGUgY2xhc3NlcyBiZWZvcmUgdGhlIGZpcnN0IHJBRiBzbyB3ZSBrbm93IHRvIGNvbnRpbnVlIGlmXG4gICAgICAvLyB0aGVyZSBhY3R1YWxseSBpcyBhIGRldGVjdGVkIHRyYW5zaXRpb24gb3Iga2V5ZnJhbWUgYW5pbWF0aW9uXG4gICAgICBpZiAob3B0aW9ucy5hcHBseUNsYXNzZXNFYXJseSAmJiBhZGRSZW1vdmVDbGFzc05hbWUubGVuZ3RoKSB7XG4gICAgICAgIGFwcGx5QW5pbWF0aW9uQ2xhc3NlcyhlbGVtZW50LCBvcHRpb25zKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHByZXBhcmF0aW9uQ2xhc3NlcyA9IFtzdHJ1Y3R1cmFsQ2xhc3NOYW1lLCBhZGRSZW1vdmVDbGFzc05hbWVdLmpvaW4oJyAnKS50cmltKCk7XG4gICAgICB2YXIgZnVsbENsYXNzTmFtZSA9IGNsYXNzZXMgKyAnICcgKyBwcmVwYXJhdGlvbkNsYXNzZXM7XG4gICAgICB2YXIgYWN0aXZlQ2xhc3NlcyA9IHBlbmRDbGFzc2VzKHByZXBhcmF0aW9uQ2xhc3NlcywgQUNUSVZFX0NMQVNTX1NVRkZJWCk7XG4gICAgICB2YXIgaGFzVG9TdHlsZXMgPSBzdHlsZXMudG8gJiYgT2JqZWN0LmtleXMoc3R5bGVzLnRvKS5sZW5ndGggPiAwO1xuICAgICAgdmFyIGNvbnRhaW5zS2V5ZnJhbWVBbmltYXRpb24gPSAob3B0aW9ucy5rZXlmcmFtZVN0eWxlIHx8ICcnKS5sZW5ndGggPiAwO1xuXG4gICAgICAvLyB0aGVyZSBpcyBubyB3YXkgd2UgY2FuIHRyaWdnZXIgYW4gYW5pbWF0aW9uIGlmIG5vIHN0eWxlcyBhbmRcbiAgICAgIC8vIG5vIGNsYXNzZXMgYXJlIGJlaW5nIGFwcGxpZWQgd2hpY2ggd291bGQgdGhlbiB0cmlnZ2VyIGEgdHJhbnNpdGlvbixcbiAgICAgIC8vIHVubGVzcyB0aGVyZSBhIGlzIHJhdyBrZXlmcmFtZSB2YWx1ZSB0aGF0IGlzIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQuXG4gICAgICBpZiAoIWNvbnRhaW5zS2V5ZnJhbWVBbmltYXRpb25cbiAgICAgICAgICAgJiYgIWhhc1RvU3R5bGVzXG4gICAgICAgICAgICYmICFwcmVwYXJhdGlvbkNsYXNzZXMpIHtcbiAgICAgICAgcmV0dXJuIGNsb3NlQW5kUmV0dXJuTm9vcEFuaW1hdG9yKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBjYWNoZUtleSwgc3RhZ2dlcjtcbiAgICAgIGlmIChvcHRpb25zLnN0YWdnZXIgPiAwKSB7XG4gICAgICAgIHZhciBzdGFnZ2VyVmFsID0gcGFyc2VGbG9hdChvcHRpb25zLnN0YWdnZXIpO1xuICAgICAgICBzdGFnZ2VyID0ge1xuICAgICAgICAgIHRyYW5zaXRpb25EZWxheTogc3RhZ2dlclZhbCxcbiAgICAgICAgICBhbmltYXRpb25EZWxheTogc3RhZ2dlclZhbCxcbiAgICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb246IDAsXG4gICAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246IDBcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhY2hlS2V5ID0gZ2NzSGFzaEZuKG5vZGUsIGZ1bGxDbGFzc05hbWUpO1xuICAgICAgICBzdGFnZ2VyID0gY29tcHV0ZUNhY2hlZENzc1N0YWdnZXJTdHlsZXMobm9kZSwgcHJlcGFyYXRpb25DbGFzc2VzLCBjYWNoZUtleSwgREVURUNUX1NUQUdHRVJfQ1NTX1BST1BFUlRJRVMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIW9wdGlvbnMuJCRza2lwUHJlcGFyYXRpb25DbGFzc2VzKSB7XG4gICAgICAgICQkanFMaXRlLmFkZENsYXNzKGVsZW1lbnQsIHByZXBhcmF0aW9uQ2xhc3Nlcyk7XG4gICAgICB9XG5cbiAgICAgIHZhciBhcHBseU9ubHlEdXJhdGlvbjtcblxuICAgICAgaWYgKG9wdGlvbnMudHJhbnNpdGlvblN0eWxlKSB7XG4gICAgICAgIHZhciB0cmFuc2l0aW9uU3R5bGUgPSBbVFJBTlNJVElPTl9QUk9QLCBvcHRpb25zLnRyYW5zaXRpb25TdHlsZV07XG4gICAgICAgIGFwcGx5SW5saW5lU3R5bGUobm9kZSwgdHJhbnNpdGlvblN0eWxlKTtcbiAgICAgICAgdGVtcG9yYXJ5U3R5bGVzLnB1c2godHJhbnNpdGlvblN0eWxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuZHVyYXRpb24gPj0gMCkge1xuICAgICAgICBhcHBseU9ubHlEdXJhdGlvbiA9IG5vZGUuc3R5bGVbVFJBTlNJVElPTl9QUk9QXS5sZW5ndGggPiAwO1xuICAgICAgICB2YXIgZHVyYXRpb25TdHlsZSA9IGdldENzc1RyYW5zaXRpb25EdXJhdGlvblN0eWxlKG9wdGlvbnMuZHVyYXRpb24sIGFwcGx5T25seUR1cmF0aW9uKTtcblxuICAgICAgICAvLyB3ZSBzZXQgdGhlIGR1cmF0aW9uIHNvIHRoYXQgaXQgd2lsbCBiZSBwaWNrZWQgdXAgYnkgZ2V0Q29tcHV0ZWRTdHlsZSBsYXRlclxuICAgICAgICBhcHBseUlubGluZVN0eWxlKG5vZGUsIGR1cmF0aW9uU3R5bGUpO1xuICAgICAgICB0ZW1wb3JhcnlTdHlsZXMucHVzaChkdXJhdGlvblN0eWxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMua2V5ZnJhbWVTdHlsZSkge1xuICAgICAgICB2YXIga2V5ZnJhbWVTdHlsZSA9IFtBTklNQVRJT05fUFJPUCwgb3B0aW9ucy5rZXlmcmFtZVN0eWxlXTtcbiAgICAgICAgYXBwbHlJbmxpbmVTdHlsZShub2RlLCBrZXlmcmFtZVN0eWxlKTtcbiAgICAgICAgdGVtcG9yYXJ5U3R5bGVzLnB1c2goa2V5ZnJhbWVTdHlsZSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBpdGVtSW5kZXggPSBzdGFnZ2VyXG4gICAgICAgICAgPyBvcHRpb25zLnN0YWdnZXJJbmRleCA+PSAwXG4gICAgICAgICAgICAgID8gb3B0aW9ucy5zdGFnZ2VySW5kZXhcbiAgICAgICAgICAgICAgOiBnY3NMb29rdXAuY291bnQoY2FjaGVLZXkpXG4gICAgICAgICAgOiAwO1xuXG4gICAgICB2YXIgaXNGaXJzdCA9IGl0ZW1JbmRleCA9PT0gMDtcblxuICAgICAgLy8gdGhpcyBpcyBhIHByZS1lbXB0aXZlIHdheSBvZiBmb3JjaW5nIHRoZSBzZXR1cCBjbGFzc2VzIHRvIGJlIGFkZGVkIGFuZCBhcHBsaWVkIElOU1RBTlRMWVxuICAgICAgLy8gd2l0aG91dCBjYXVzaW5nIGFueSBjb21iaW5hdGlvbiBvZiB0cmFuc2l0aW9ucyB0byBraWNrIGluLiBCeSBhZGRpbmcgYSBuZWdhdGl2ZSBkZWxheSB2YWx1ZVxuICAgICAgLy8gaXQgZm9yY2VzIHRoZSBzZXR1cCBjbGFzcycgdHJhbnNpdGlvbiB0byBlbmQgaW1tZWRpYXRlbHkuIFdlIGxhdGVyIHRoZW4gcmVtb3ZlIHRoZSBuZWdhdGl2ZVxuICAgICAgLy8gdHJhbnNpdGlvbiBkZWxheSB0byBhbGxvdyBmb3IgdGhlIHRyYW5zaXRpb24gdG8gbmF0dXJhbGx5IGRvIGl0J3MgdGhpbmcuIFRoZSBiZWF1dHkgaGVyZSBpc1xuICAgICAgLy8gdGhhdCBpZiB0aGVyZSBpcyBubyB0cmFuc2l0aW9uIGRlZmluZWQgdGhlbiBub3RoaW5nIHdpbGwgaGFwcGVuIGFuZCB0aGlzIHdpbGwgYWxzbyBhbGxvd1xuICAgICAgLy8gb3RoZXIgdHJhbnNpdGlvbnMgdG8gYmUgc3RhY2tlZCBvbiB0b3Agb2YgZWFjaCBvdGhlciB3aXRob3V0IGFueSBjaG9wcGluZyB0aGVtIG91dC5cbiAgICAgIGlmIChpc0ZpcnN0ICYmICFvcHRpb25zLnNraXBCbG9ja2luZykge1xuICAgICAgICBibG9ja1RyYW5zaXRpb25zKG5vZGUsIFNBRkVfRkFTVF9GT1JXQVJEX0RVUkFUSU9OX1ZBTFVFKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRpbWluZ3MgPSBjb21wdXRlVGltaW5ncyhub2RlLCBmdWxsQ2xhc3NOYW1lLCBjYWNoZUtleSk7XG4gICAgICB2YXIgcmVsYXRpdmVEZWxheSA9IHRpbWluZ3MubWF4RGVsYXk7XG4gICAgICBtYXhEZWxheSA9IE1hdGgubWF4KHJlbGF0aXZlRGVsYXksIDApO1xuICAgICAgbWF4RHVyYXRpb24gPSB0aW1pbmdzLm1heER1cmF0aW9uO1xuXG4gICAgICB2YXIgZmxhZ3MgPSB7fTtcbiAgICAgIGZsYWdzLmhhc1RyYW5zaXRpb25zICAgICAgICAgID0gdGltaW5ncy50cmFuc2l0aW9uRHVyYXRpb24gPiAwO1xuICAgICAgZmxhZ3MuaGFzQW5pbWF0aW9ucyAgICAgICAgICAgPSB0aW1pbmdzLmFuaW1hdGlvbkR1cmF0aW9uID4gMDtcbiAgICAgIGZsYWdzLmhhc1RyYW5zaXRpb25BbGwgICAgICAgID0gZmxhZ3MuaGFzVHJhbnNpdGlvbnMgJiYgdGltaW5ncy50cmFuc2l0aW9uUHJvcGVydHkgPT0gJ2FsbCc7XG4gICAgICBmbGFncy5hcHBseVRyYW5zaXRpb25EdXJhdGlvbiA9IGhhc1RvU3R5bGVzICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZmxhZ3MuaGFzVHJhbnNpdGlvbnMgJiYgIWZsYWdzLmhhc1RyYW5zaXRpb25BbGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IChmbGFncy5oYXNBbmltYXRpb25zICYmICFmbGFncy5oYXNUcmFuc2l0aW9ucykpO1xuICAgICAgZmxhZ3MuYXBwbHlBbmltYXRpb25EdXJhdGlvbiAgPSBvcHRpb25zLmR1cmF0aW9uICYmIGZsYWdzLmhhc0FuaW1hdGlvbnM7XG4gICAgICBmbGFncy5hcHBseVRyYW5zaXRpb25EZWxheSAgICA9IHRydXRoeVRpbWluZ1ZhbHVlKG9wdGlvbnMuZGVsYXkpICYmIChmbGFncy5hcHBseVRyYW5zaXRpb25EdXJhdGlvbiB8fCBmbGFncy5oYXNUcmFuc2l0aW9ucyk7XG4gICAgICBmbGFncy5hcHBseUFuaW1hdGlvbkRlbGF5ICAgICA9IHRydXRoeVRpbWluZ1ZhbHVlKG9wdGlvbnMuZGVsYXkpICYmIGZsYWdzLmhhc0FuaW1hdGlvbnM7XG4gICAgICBmbGFncy5yZWNhbGN1bGF0ZVRpbWluZ1N0eWxlcyA9IGFkZFJlbW92ZUNsYXNzTmFtZS5sZW5ndGggPiAwO1xuXG4gICAgICBpZiAoZmxhZ3MuYXBwbHlUcmFuc2l0aW9uRHVyYXRpb24gfHwgZmxhZ3MuYXBwbHlBbmltYXRpb25EdXJhdGlvbikge1xuICAgICAgICBtYXhEdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24gPyBwYXJzZUZsb2F0KG9wdGlvbnMuZHVyYXRpb24pIDogbWF4RHVyYXRpb247XG5cbiAgICAgICAgaWYgKGZsYWdzLmFwcGx5VHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgICAgICAgZmxhZ3MuaGFzVHJhbnNpdGlvbnMgPSB0cnVlO1xuICAgICAgICAgIHRpbWluZ3MudHJhbnNpdGlvbkR1cmF0aW9uID0gbWF4RHVyYXRpb247XG4gICAgICAgICAgYXBwbHlPbmx5RHVyYXRpb24gPSBub2RlLnN0eWxlW1RSQU5TSVRJT05fUFJPUCArIFBST1BFUlRZX0tFWV0ubGVuZ3RoID4gMDtcbiAgICAgICAgICB0ZW1wb3JhcnlTdHlsZXMucHVzaChnZXRDc3NUcmFuc2l0aW9uRHVyYXRpb25TdHlsZShtYXhEdXJhdGlvbiwgYXBwbHlPbmx5RHVyYXRpb24pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmbGFncy5hcHBseUFuaW1hdGlvbkR1cmF0aW9uKSB7XG4gICAgICAgICAgZmxhZ3MuaGFzQW5pbWF0aW9ucyA9IHRydWU7XG4gICAgICAgICAgdGltaW5ncy5hbmltYXRpb25EdXJhdGlvbiA9IG1heER1cmF0aW9uO1xuICAgICAgICAgIHRlbXBvcmFyeVN0eWxlcy5wdXNoKGdldENzc0tleWZyYW1lRHVyYXRpb25TdHlsZShtYXhEdXJhdGlvbikpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtYXhEdXJhdGlvbiA9PT0gMCAmJiAhZmxhZ3MucmVjYWxjdWxhdGVUaW1pbmdTdHlsZXMpIHtcbiAgICAgICAgcmV0dXJuIGNsb3NlQW5kUmV0dXJuTm9vcEFuaW1hdG9yKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmRlbGF5ICE9IG51bGwpIHtcbiAgICAgICAgdmFyIGRlbGF5U3R5bGU7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5kZWxheSAhPT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICBkZWxheVN0eWxlID0gcGFyc2VGbG9hdChvcHRpb25zLmRlbGF5KTtcbiAgICAgICAgICAvLyBudW1iZXIgaW4gb3B0aW9ucy5kZWxheSBtZWFucyB3ZSBoYXZlIHRvIHJlY2FsY3VsYXRlIHRoZSBkZWxheSBmb3IgdGhlIGNsb3NpbmcgdGltZW91dFxuICAgICAgICAgIG1heERlbGF5ID0gTWF0aC5tYXgoZGVsYXlTdHlsZSwgMCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmxhZ3MuYXBwbHlUcmFuc2l0aW9uRGVsYXkpIHtcbiAgICAgICAgICB0ZW1wb3JhcnlTdHlsZXMucHVzaChnZXRDc3NEZWxheVN0eWxlKGRlbGF5U3R5bGUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmbGFncy5hcHBseUFuaW1hdGlvbkRlbGF5KSB7XG4gICAgICAgICAgdGVtcG9yYXJ5U3R5bGVzLnB1c2goZ2V0Q3NzRGVsYXlTdHlsZShkZWxheVN0eWxlLCB0cnVlKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gd2UgbmVlZCB0byByZWNhbGN1bGF0ZSB0aGUgZGVsYXkgdmFsdWUgc2luY2Ugd2UgdXNlZCBhIHByZS1lbXB0aXZlIG5lZ2F0aXZlXG4gICAgICAvLyBkZWxheSB2YWx1ZSBhbmQgdGhlIGRlbGF5IHZhbHVlIGlzIHJlcXVpcmVkIGZvciB0aGUgZmluYWwgZXZlbnQgY2hlY2tpbmcuIFRoaXNcbiAgICAgIC8vIHByb3BlcnR5IHdpbGwgZW5zdXJlIHRoYXQgdGhpcyB3aWxsIGhhcHBlbiBhZnRlciB0aGUgUkFGIHBoYXNlIGhhcyBwYXNzZWQuXG4gICAgICBpZiAob3B0aW9ucy5kdXJhdGlvbiA9PSBudWxsICYmIHRpbWluZ3MudHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICBmbGFncy5yZWNhbGN1bGF0ZVRpbWluZ1N0eWxlcyA9IGZsYWdzLnJlY2FsY3VsYXRlVGltaW5nU3R5bGVzIHx8IGlzRmlyc3Q7XG4gICAgICB9XG5cbiAgICAgIG1heERlbGF5VGltZSA9IG1heERlbGF5ICogT05FX1NFQ09ORDtcbiAgICAgIG1heER1cmF0aW9uVGltZSA9IG1heER1cmF0aW9uICogT05FX1NFQ09ORDtcbiAgICAgIGlmICghb3B0aW9ucy5za2lwQmxvY2tpbmcpIHtcbiAgICAgICAgZmxhZ3MuYmxvY2tUcmFuc2l0aW9uID0gdGltaW5ncy50cmFuc2l0aW9uRHVyYXRpb24gPiAwO1xuICAgICAgICBmbGFncy5ibG9ja0tleWZyYW1lQW5pbWF0aW9uID0gdGltaW5ncy5hbmltYXRpb25EdXJhdGlvbiA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWdnZXIuYW5pbWF0aW9uRGVsYXkgPiAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFnZ2VyLmFuaW1hdGlvbkR1cmF0aW9uID09PSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5mcm9tKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmNsZWFudXBTdHlsZXMpIHtcbiAgICAgICAgICByZWdpc3RlclJlc3RvcmFibGVTdHlsZXMocmVzdG9yZVN0eWxlcywgbm9kZSwgT2JqZWN0LmtleXMob3B0aW9ucy5mcm9tKSk7XG4gICAgICAgIH1cbiAgICAgICAgYXBwbHlBbmltYXRpb25Gcm9tU3R5bGVzKGVsZW1lbnQsIG9wdGlvbnMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmxhZ3MuYmxvY2tUcmFuc2l0aW9uIHx8IGZsYWdzLmJsb2NrS2V5ZnJhbWVBbmltYXRpb24pIHtcbiAgICAgICAgYXBwbHlCbG9ja2luZyhtYXhEdXJhdGlvbik7XG4gICAgICB9IGVsc2UgaWYgKCFvcHRpb25zLnNraXBCbG9ja2luZykge1xuICAgICAgICBibG9ja1RyYW5zaXRpb25zKG5vZGUsIGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETyhtYXRza28pOiBmb3IgMS41IGNoYW5nZSB0aGlzIGNvZGUgdG8gaGF2ZSBhbiBhbmltYXRvciBvYmplY3QgZm9yIGJldHRlciBkZWJ1Z2dpbmdcbiAgICAgIHJldHVybiB7XG4gICAgICAgICQkd2lsbEFuaW1hdGU6IHRydWUsXG4gICAgICAgIGVuZDogZW5kRm4sXG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoYW5pbWF0aW9uQ2xvc2VkKSByZXR1cm47XG5cbiAgICAgICAgICBydW5uZXJIb3N0ID0ge1xuICAgICAgICAgICAgZW5kOiBlbmRGbixcbiAgICAgICAgICAgIGNhbmNlbDogY2FuY2VsRm4sXG4gICAgICAgICAgICByZXN1bWU6IG51bGwsIC8vdGhpcyB3aWxsIGJlIHNldCBkdXJpbmcgdGhlIHN0YXJ0KCkgcGhhc2VcbiAgICAgICAgICAgIHBhdXNlOiBudWxsXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJ1bm5lciA9IG5ldyAkJEFuaW1hdGVSdW5uZXIocnVubmVySG9zdCk7XG5cbiAgICAgICAgICB3YWl0VW50aWxRdWlldChzdGFydCk7XG5cbiAgICAgICAgICAvLyB3ZSBkb24ndCBoYXZlIGFjY2VzcyB0byBwYXVzZS9yZXN1bWUgdGhlIGFuaW1hdGlvblxuICAgICAgICAgIC8vIHNpbmNlIGl0IGhhc24ndCBydW4geWV0LiBBbmltYXRlUnVubmVyIHdpbGwgdGhlcmVmb3JlXG4gICAgICAgICAgLy8gc2V0IG5vb3AgZnVuY3Rpb25zIGZvciByZXN1bWUgYW5kIHBhdXNlIGFuZCB0aGV5IHdpbGxcbiAgICAgICAgICAvLyBsYXRlciBiZSBvdmVycmlkZGVuIG9uY2UgdGhlIGFuaW1hdGlvbiBpcyB0cmlnZ2VyZWRcbiAgICAgICAgICByZXR1cm4gcnVubmVyO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBmdW5jdGlvbiBlbmRGbigpIHtcbiAgICAgICAgY2xvc2UoKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2FuY2VsRm4oKSB7XG4gICAgICAgIGNsb3NlKHRydWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjbG9zZShyZWplY3RlZCkgeyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcbiAgICAgICAgLy8gaWYgdGhlIHByb21pc2UgaGFzIGJlZW4gY2FsbGVkIGFscmVhZHkgdGhlbiB3ZSBzaG91bGRuJ3QgY2xvc2VcbiAgICAgICAgLy8gdGhlIGFuaW1hdGlvbiBhZ2FpblxuICAgICAgICBpZiAoYW5pbWF0aW9uQ2xvc2VkIHx8IChhbmltYXRpb25Db21wbGV0ZWQgJiYgYW5pbWF0aW9uUGF1c2VkKSkgcmV0dXJuO1xuICAgICAgICBhbmltYXRpb25DbG9zZWQgPSB0cnVlO1xuICAgICAgICBhbmltYXRpb25QYXVzZWQgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIW9wdGlvbnMuJCRza2lwUHJlcGFyYXRpb25DbGFzc2VzKSB7XG4gICAgICAgICAgJCRqcUxpdGUucmVtb3ZlQ2xhc3MoZWxlbWVudCwgcHJlcGFyYXRpb25DbGFzc2VzKTtcbiAgICAgICAgfVxuICAgICAgICAkJGpxTGl0ZS5yZW1vdmVDbGFzcyhlbGVtZW50LCBhY3RpdmVDbGFzc2VzKTtcblxuICAgICAgICBibG9ja0tleWZyYW1lQW5pbWF0aW9ucyhub2RlLCBmYWxzZSk7XG4gICAgICAgIGJsb2NrVHJhbnNpdGlvbnMobm9kZSwgZmFsc2UpO1xuXG4gICAgICAgIGZvckVhY2godGVtcG9yYXJ5U3R5bGVzLCBmdW5jdGlvbihlbnRyeSkge1xuICAgICAgICAgIC8vIFRoZXJlIGlzIG9ubHkgb25lIHdheSB0byByZW1vdmUgaW5saW5lIHN0eWxlIHByb3BlcnRpZXMgZW50aXJlbHkgZnJvbSBlbGVtZW50cy5cbiAgICAgICAgICAvLyBCeSB1c2luZyBgcmVtb3ZlUHJvcGVydHlgIHRoaXMgd29ya3MsIGJ1dCB3ZSBuZWVkIHRvIGNvbnZlcnQgY2FtZWwtY2FzZWQgQ1NTXG4gICAgICAgICAgLy8gc3R5bGVzIGRvd24gdG8gaHlwaGVuYXRlZCB2YWx1ZXMuXG4gICAgICAgICAgbm9kZS5zdHlsZVtlbnRyeVswXV0gPSAnJztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwbHlBbmltYXRpb25DbGFzc2VzKGVsZW1lbnQsIG9wdGlvbnMpO1xuICAgICAgICBhcHBseUFuaW1hdGlvblN0eWxlcyhlbGVtZW50LCBvcHRpb25zKTtcblxuICAgICAgICBpZiAoT2JqZWN0LmtleXMocmVzdG9yZVN0eWxlcykubGVuZ3RoKSB7XG4gICAgICAgICAgZm9yRWFjaChyZXN0b3JlU3R5bGVzLCBmdW5jdGlvbih2YWx1ZSwgcHJvcCkge1xuICAgICAgICAgICAgdmFsdWUgPyBub2RlLnN0eWxlLnNldFByb3BlcnR5KHByb3AsIHZhbHVlKVxuICAgICAgICAgICAgICAgICAgOiBub2RlLnN0eWxlLnJlbW92ZVByb3BlcnR5KHByb3ApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhlIHJlYXNvbiB3aHkgd2UgaGF2ZSB0aGlzIG9wdGlvbiBpcyB0byBhbGxvdyBhIHN5bmNocm9ub3VzIGNsb3NpbmcgY2FsbGJhY2tcbiAgICAgICAgLy8gdGhhdCBpcyBmaXJlZCBhcyBTT09OIGFzIHRoZSBhbmltYXRpb24gZW5kcyAod2hlbiB0aGUgQ1NTIGlzIHJlbW92ZWQpIG9yIGlmXG4gICAgICAgIC8vIHRoZSBhbmltYXRpb24gbmV2ZXIgdGFrZXMgb2ZmIGF0IGFsbC4gQSBnb29kIGV4YW1wbGUgaXMgYSBsZWF2ZSBhbmltYXRpb24gc2luY2VcbiAgICAgICAgLy8gdGhlIGVsZW1lbnQgbXVzdCBiZSByZW1vdmVkIGp1c3QgYWZ0ZXIgdGhlIGFuaW1hdGlvbiBpcyBvdmVyIG9yIGVsc2UgdGhlIGVsZW1lbnRcbiAgICAgICAgLy8gd2lsbCBhcHBlYXIgb24gc2NyZWVuIGZvciBvbmUgYW5pbWF0aW9uIGZyYW1lIGNhdXNpbmcgYW4gb3ZlcmJlYXJpbmcgZmxpY2tlci5cbiAgICAgICAgaWYgKG9wdGlvbnMub25Eb25lKSB7XG4gICAgICAgICAgb3B0aW9ucy5vbkRvbmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzLmxlbmd0aCkge1xuICAgICAgICAgIC8vIFJlbW92ZSB0aGUgdHJhbnNpdGlvbmVuZCAvIGFuaW1hdGlvbmVuZCBsaXN0ZW5lcihzKVxuICAgICAgICAgIGVsZW1lbnQub2ZmKGV2ZW50cy5qb2luKCcgJyksIG9uQW5pbWF0aW9uUHJvZ3Jlc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9DYW5jZWwgdGhlIGZhbGxiYWNrIGNsb3NpbmcgdGltZW91dCBhbmQgcmVtb3ZlIHRoZSB0aW1lciBkYXRhXG4gICAgICAgIHZhciBhbmltYXRpb25UaW1lckRhdGEgPSBlbGVtZW50LmRhdGEoQU5JTUFURV9USU1FUl9LRVkpO1xuICAgICAgICBpZiAoYW5pbWF0aW9uVGltZXJEYXRhKSB7XG4gICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKGFuaW1hdGlvblRpbWVyRGF0YVswXS50aW1lcik7XG4gICAgICAgICAgZWxlbWVudC5yZW1vdmVEYXRhKEFOSU1BVEVfVElNRVJfS0VZKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHRoZSBwcmVwYXJhdGlvbiBmdW5jdGlvbiBmYWlscyB0aGVuIHRoZSBwcm9taXNlIGlzIG5vdCBzZXR1cFxuICAgICAgICBpZiAocnVubmVyKSB7XG4gICAgICAgICAgcnVubmVyLmNvbXBsZXRlKCFyZWplY3RlZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYXBwbHlCbG9ja2luZyhkdXJhdGlvbikge1xuICAgICAgICBpZiAoZmxhZ3MuYmxvY2tUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgYmxvY2tUcmFuc2l0aW9ucyhub2RlLCBkdXJhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmxhZ3MuYmxvY2tLZXlmcmFtZUFuaW1hdGlvbikge1xuICAgICAgICAgIGJsb2NrS2V5ZnJhbWVBbmltYXRpb25zKG5vZGUsICEhZHVyYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNsb3NlQW5kUmV0dXJuTm9vcEFuaW1hdG9yKCkge1xuICAgICAgICBydW5uZXIgPSBuZXcgJCRBbmltYXRlUnVubmVyKHtcbiAgICAgICAgICBlbmQ6IGVuZEZuLFxuICAgICAgICAgIGNhbmNlbDogY2FuY2VsRm5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gc2hvdWxkIGZsdXNoIHRoZSBjYWNoZSBhbmltYXRpb25cbiAgICAgICAgd2FpdFVudGlsUXVpZXQobm9vcCk7XG4gICAgICAgIGNsb3NlKCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAkJHdpbGxBbmltYXRlOiBmYWxzZSxcbiAgICAgICAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gcnVubmVyO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZW5kOiBlbmRGblxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvbkFuaW1hdGlvblByb2dyZXNzKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB2YXIgZXYgPSBldmVudC5vcmlnaW5hbEV2ZW50IHx8IGV2ZW50O1xuXG4gICAgICAgIC8vIHdlIG5vdyBhbHdheXMgdXNlIGBEYXRlLm5vdygpYCBkdWUgdG8gdGhlIHJlY2VudCBjaGFuZ2VzIHdpdGhcbiAgICAgICAgLy8gZXZlbnQudGltZVN0YW1wIGluIEZpcmVmb3gsIFdlYmtpdCBhbmQgQ2hyb21lIChzZWUgIzEzNDk0IGZvciBtb3JlIGluZm8pXG4gICAgICAgIHZhciB0aW1lU3RhbXAgPSBldi4kbWFudWFsVGltZVN0YW1wIHx8IERhdGUubm93KCk7XG5cbiAgICAgICAgLyogRmlyZWZveCAob3IgcG9zc2libHkganVzdCBHZWNrbykgbGlrZXMgdG8gbm90IHJvdW5kIHZhbHVlcyB1cFxuICAgICAgICAgKiB3aGVuIGEgbXMgbWVhc3VyZW1lbnQgaXMgdXNlZCBmb3IgdGhlIGFuaW1hdGlvbiAqL1xuICAgICAgICB2YXIgZWxhcHNlZFRpbWUgPSBwYXJzZUZsb2F0KGV2LmVsYXBzZWRUaW1lLnRvRml4ZWQoRUxBUFNFRF9USU1FX01BWF9ERUNJTUFMX1BMQUNFUykpO1xuXG4gICAgICAgIC8qICRtYW51YWxUaW1lU3RhbXAgaXMgYSBtb2NrZWQgdGltZVN0YW1wIHZhbHVlIHdoaWNoIGlzIHNldFxuICAgICAgICAgKiB3aXRoaW4gYnJvd3NlclRyaWdnZXIoKS4gVGhpcyBpcyBvbmx5IGhlcmUgc28gdGhhdCB0ZXN0cyBjYW5cbiAgICAgICAgICogbW9jayBhbmltYXRpb25zIHByb3Blcmx5LiBSZWFsIGV2ZW50cyBmYWxsYmFjayB0byBldmVudC50aW1lU3RhbXAsXG4gICAgICAgICAqIG9yLCBpZiB0aGV5IGRvbid0LCB0aGVuIGEgdGltZVN0YW1wIGlzIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBmb3IgdGhlbS5cbiAgICAgICAgICogV2UncmUgY2hlY2tpbmcgdG8gc2VlIGlmIHRoZSB0aW1lU3RhbXAgc3VycGFzc2VzIHRoZSBleHBlY3RlZCBkZWxheSxcbiAgICAgICAgICogYnV0IHdlJ3JlIHVzaW5nIGVsYXBzZWRUaW1lIGluc3RlYWQgb2YgdGhlIHRpbWVTdGFtcCBvbiB0aGUgMm5kXG4gICAgICAgICAqIHByZS1jb25kaXRpb24gc2luY2UgYW5pbWF0aW9uUGF1c2VkcyBzb21ldGltZXMgY2xvc2Ugb2ZmIGVhcmx5ICovXG4gICAgICAgIGlmIChNYXRoLm1heCh0aW1lU3RhbXAgLSBzdGFydFRpbWUsIDApID49IG1heERlbGF5VGltZSAmJiBlbGFwc2VkVGltZSA+PSBtYXhEdXJhdGlvbikge1xuICAgICAgICAgIC8vIHdlIHNldCB0aGlzIGZsYWcgdG8gZW5zdXJlIHRoYXQgaWYgdGhlIHRyYW5zaXRpb24gaXMgcGF1c2VkIHRoZW4sIHdoZW4gcmVzdW1lZCxcbiAgICAgICAgICAvLyB0aGUgYW5pbWF0aW9uIHdpbGwgYXV0b21hdGljYWxseSBjbG9zZSBpdHNlbGYgc2luY2UgdHJhbnNpdGlvbnMgY2Fubm90IGJlIHBhdXNlZC5cbiAgICAgICAgICBhbmltYXRpb25Db21wbGV0ZWQgPSB0cnVlO1xuICAgICAgICAgIGNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICAgIGlmIChhbmltYXRpb25DbG9zZWQpIHJldHVybjtcbiAgICAgICAgaWYgKCFub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICBjbG9zZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGV2ZW4gdGhvdWdoIHdlIG9ubHkgcGF1c2Uga2V5ZnJhbWUgYW5pbWF0aW9ucyBoZXJlIHRoZSBwYXVzZSBmbGFnXG4gICAgICAgIC8vIHdpbGwgc3RpbGwgaGFwcGVuIHdoZW4gdHJhbnNpdGlvbnMgYXJlIHVzZWQuIE9ubHkgdGhlIHRyYW5zaXRpb24gd2lsbFxuICAgICAgICAvLyBub3QgYmUgcGF1c2VkIHNpbmNlIHRoYXQgaXMgbm90IHBvc3NpYmxlLiBJZiB0aGUgYW5pbWF0aW9uIGVuZHMgd2hlblxuICAgICAgICAvLyBwYXVzZWQgdGhlbiBpdCB3aWxsIG5vdCBjb21wbGV0ZSB1bnRpbCB1bnBhdXNlZCBvciBjYW5jZWxsZWQuXG4gICAgICAgIHZhciBwbGF5UGF1c2UgPSBmdW5jdGlvbihwbGF5QW5pbWF0aW9uKSB7XG4gICAgICAgICAgaWYgKCFhbmltYXRpb25Db21wbGV0ZWQpIHtcbiAgICAgICAgICAgIGFuaW1hdGlvblBhdXNlZCA9ICFwbGF5QW5pbWF0aW9uO1xuICAgICAgICAgICAgaWYgKHRpbWluZ3MuYW5pbWF0aW9uRHVyYXRpb24pIHtcbiAgICAgICAgICAgICAgdmFyIHZhbHVlID0gYmxvY2tLZXlmcmFtZUFuaW1hdGlvbnMobm9kZSwgYW5pbWF0aW9uUGF1c2VkKTtcbiAgICAgICAgICAgICAgYW5pbWF0aW9uUGF1c2VkXG4gICAgICAgICAgICAgICAgICA/IHRlbXBvcmFyeVN0eWxlcy5wdXNoKHZhbHVlKVxuICAgICAgICAgICAgICAgICAgOiByZW1vdmVGcm9tQXJyYXkodGVtcG9yYXJ5U3R5bGVzLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChhbmltYXRpb25QYXVzZWQgJiYgcGxheUFuaW1hdGlvbikge1xuICAgICAgICAgICAgYW5pbWF0aW9uUGF1c2VkID0gZmFsc2U7XG4gICAgICAgICAgICBjbG9zZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBjaGVja2luZyB0aGUgc3RhZ2dlciBkdXJhdGlvbiBwcmV2ZW50cyBhbiBhY2NpZGVudGFsbHkgY2FzY2FkZSBvZiB0aGUgQ1NTIGRlbGF5IHN0eWxlXG4gICAgICAgIC8vIGJlaW5nIGluaGVyaXRlZCBmcm9tIHRoZSBwYXJlbnQuIElmIHRoZSB0cmFuc2l0aW9uIGR1cmF0aW9uIGlzIHplcm8gdGhlbiB3ZSBjYW4gc2FmZWx5XG4gICAgICAgIC8vIHJlbHkgdGhhdCB0aGUgZGVsYXkgdmFsdWUgaXMgYW4gaW50ZW50aW9uYWwgc3RhZ2dlciBkZWxheSBzdHlsZS5cbiAgICAgICAgdmFyIG1heFN0YWdnZXIgPSBpdGVtSW5kZXggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCh0aW1pbmdzLnRyYW5zaXRpb25EdXJhdGlvbiAmJiBzdGFnZ2VyLnRyYW5zaXRpb25EdXJhdGlvbiA9PT0gMCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAodGltaW5ncy5hbmltYXRpb25EdXJhdGlvbiAmJiBzdGFnZ2VyLmFuaW1hdGlvbkR1cmF0aW9uID09PSAwKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAmJiBNYXRoLm1heChzdGFnZ2VyLmFuaW1hdGlvbkRlbGF5LCBzdGFnZ2VyLnRyYW5zaXRpb25EZWxheSk7XG4gICAgICAgIGlmIChtYXhTdGFnZ2VyKSB7XG4gICAgICAgICAgJHRpbWVvdXQodHJpZ2dlckFuaW1hdGlvblN0YXJ0LFxuICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IobWF4U3RhZ2dlciAqIGl0ZW1JbmRleCAqIE9ORV9TRUNPTkQpLFxuICAgICAgICAgICAgICAgICAgIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0cmlnZ2VyQW5pbWF0aW9uU3RhcnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoaXMgd2lsbCBkZWNvcmF0ZSB0aGUgZXhpc3RpbmcgcHJvbWlzZSBydW5uZXIgd2l0aCBwYXVzZS9yZXN1bWUgbWV0aG9kc1xuICAgICAgICBydW5uZXJIb3N0LnJlc3VtZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHBsYXlQYXVzZSh0cnVlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBydW5uZXJIb3N0LnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcGxheVBhdXNlKGZhbHNlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiB0cmlnZ2VyQW5pbWF0aW9uU3RhcnQoKSB7XG4gICAgICAgICAgLy8ganVzdCBpbmNhc2UgYSBzdGFnZ2VyIGFuaW1hdGlvbiBraWNrcyBpbiB3aGVuIHRoZSBhbmltYXRpb25cbiAgICAgICAgICAvLyBpdHNlbGYgd2FzIGNhbmNlbGxlZCBlbnRpcmVseVxuICAgICAgICAgIGlmIChhbmltYXRpb25DbG9zZWQpIHJldHVybjtcblxuICAgICAgICAgIGFwcGx5QmxvY2tpbmcoZmFsc2UpO1xuXG4gICAgICAgICAgZm9yRWFjaCh0ZW1wb3JhcnlTdHlsZXMsIGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gZW50cnlbMF07XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBlbnRyeVsxXTtcbiAgICAgICAgICAgIG5vZGUuc3R5bGVba2V5XSA9IHZhbHVlO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgYXBwbHlBbmltYXRpb25DbGFzc2VzKGVsZW1lbnQsIG9wdGlvbnMpO1xuICAgICAgICAgICQkanFMaXRlLmFkZENsYXNzKGVsZW1lbnQsIGFjdGl2ZUNsYXNzZXMpO1xuXG4gICAgICAgICAgaWYgKGZsYWdzLnJlY2FsY3VsYXRlVGltaW5nU3R5bGVzKSB7XG4gICAgICAgICAgICBmdWxsQ2xhc3NOYW1lID0gbm9kZS5jbGFzc05hbWUgKyAnICcgKyBwcmVwYXJhdGlvbkNsYXNzZXM7XG4gICAgICAgICAgICBjYWNoZUtleSA9IGdjc0hhc2hGbihub2RlLCBmdWxsQ2xhc3NOYW1lKTtcblxuICAgICAgICAgICAgdGltaW5ncyA9IGNvbXB1dGVUaW1pbmdzKG5vZGUsIGZ1bGxDbGFzc05hbWUsIGNhY2hlS2V5KTtcbiAgICAgICAgICAgIHJlbGF0aXZlRGVsYXkgPSB0aW1pbmdzLm1heERlbGF5O1xuICAgICAgICAgICAgbWF4RGVsYXkgPSBNYXRoLm1heChyZWxhdGl2ZURlbGF5LCAwKTtcbiAgICAgICAgICAgIG1heER1cmF0aW9uID0gdGltaW5ncy5tYXhEdXJhdGlvbjtcblxuICAgICAgICAgICAgaWYgKG1heER1cmF0aW9uID09PSAwKSB7XG4gICAgICAgICAgICAgIGNsb3NlKCk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZmxhZ3MuaGFzVHJhbnNpdGlvbnMgPSB0aW1pbmdzLnRyYW5zaXRpb25EdXJhdGlvbiA+IDA7XG4gICAgICAgICAgICBmbGFncy5oYXNBbmltYXRpb25zID0gdGltaW5ncy5hbmltYXRpb25EdXJhdGlvbiA+IDA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGZsYWdzLmFwcGx5QW5pbWF0aW9uRGVsYXkpIHtcbiAgICAgICAgICAgIHJlbGF0aXZlRGVsYXkgPSB0eXBlb2Ygb3B0aW9ucy5kZWxheSAhPT0gXCJib29sZWFuXCIgJiYgdHJ1dGh5VGltaW5nVmFsdWUob3B0aW9ucy5kZWxheSlcbiAgICAgICAgICAgICAgICAgID8gcGFyc2VGbG9hdChvcHRpb25zLmRlbGF5KVxuICAgICAgICAgICAgICAgICAgOiByZWxhdGl2ZURlbGF5O1xuXG4gICAgICAgICAgICBtYXhEZWxheSA9IE1hdGgubWF4KHJlbGF0aXZlRGVsYXksIDApO1xuICAgICAgICAgICAgdGltaW5ncy5hbmltYXRpb25EZWxheSA9IHJlbGF0aXZlRGVsYXk7XG4gICAgICAgICAgICBkZWxheVN0eWxlID0gZ2V0Q3NzRGVsYXlTdHlsZShyZWxhdGl2ZURlbGF5LCB0cnVlKTtcbiAgICAgICAgICAgIHRlbXBvcmFyeVN0eWxlcy5wdXNoKGRlbGF5U3R5bGUpO1xuICAgICAgICAgICAgbm9kZS5zdHlsZVtkZWxheVN0eWxlWzBdXSA9IGRlbGF5U3R5bGVbMV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWF4RGVsYXlUaW1lID0gbWF4RGVsYXkgKiBPTkVfU0VDT05EO1xuICAgICAgICAgIG1heER1cmF0aW9uVGltZSA9IG1heER1cmF0aW9uICogT05FX1NFQ09ORDtcblxuICAgICAgICAgIGlmIChvcHRpb25zLmVhc2luZykge1xuICAgICAgICAgICAgdmFyIGVhc2VQcm9wLCBlYXNlVmFsID0gb3B0aW9ucy5lYXNpbmc7XG4gICAgICAgICAgICBpZiAoZmxhZ3MuaGFzVHJhbnNpdGlvbnMpIHtcbiAgICAgICAgICAgICAgZWFzZVByb3AgPSBUUkFOU0lUSU9OX1BST1AgKyBUSU1JTkdfS0VZO1xuICAgICAgICAgICAgICB0ZW1wb3JhcnlTdHlsZXMucHVzaChbZWFzZVByb3AsIGVhc2VWYWxdKTtcbiAgICAgICAgICAgICAgbm9kZS5zdHlsZVtlYXNlUHJvcF0gPSBlYXNlVmFsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZsYWdzLmhhc0FuaW1hdGlvbnMpIHtcbiAgICAgICAgICAgICAgZWFzZVByb3AgPSBBTklNQVRJT05fUFJPUCArIFRJTUlOR19LRVk7XG4gICAgICAgICAgICAgIHRlbXBvcmFyeVN0eWxlcy5wdXNoKFtlYXNlUHJvcCwgZWFzZVZhbF0pO1xuICAgICAgICAgICAgICBub2RlLnN0eWxlW2Vhc2VQcm9wXSA9IGVhc2VWYWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRpbWluZ3MudHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgICAgICAgICBldmVudHMucHVzaChUUkFOU0lUSU9ORU5EX0VWRU5UKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGltaW5ncy5hbmltYXRpb25EdXJhdGlvbikge1xuICAgICAgICAgICAgZXZlbnRzLnB1c2goQU5JTUFUSU9ORU5EX0VWRU5UKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgIHZhciB0aW1lclRpbWUgPSBtYXhEZWxheVRpbWUgKyBDTE9TSU5HX1RJTUVfQlVGRkVSICogbWF4RHVyYXRpb25UaW1lO1xuICAgICAgICAgIHZhciBlbmRUaW1lID0gc3RhcnRUaW1lICsgdGltZXJUaW1lO1xuXG4gICAgICAgICAgdmFyIGFuaW1hdGlvbnNEYXRhID0gZWxlbWVudC5kYXRhKEFOSU1BVEVfVElNRVJfS0VZKSB8fCBbXTtcbiAgICAgICAgICB2YXIgc2V0dXBGYWxsYmFja1RpbWVyID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoYW5pbWF0aW9uc0RhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudFRpbWVyRGF0YSA9IGFuaW1hdGlvbnNEYXRhWzBdO1xuICAgICAgICAgICAgc2V0dXBGYWxsYmFja1RpbWVyID0gZW5kVGltZSA+IGN1cnJlbnRUaW1lckRhdGEuZXhwZWN0ZWRFbmRUaW1lO1xuICAgICAgICAgICAgaWYgKHNldHVwRmFsbGJhY2tUaW1lcikge1xuICAgICAgICAgICAgICAkdGltZW91dC5jYW5jZWwoY3VycmVudFRpbWVyRGF0YS50aW1lcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBhbmltYXRpb25zRGF0YS5wdXNoKGNsb3NlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2V0dXBGYWxsYmFja1RpbWVyKSB7XG4gICAgICAgICAgICB2YXIgdGltZXIgPSAkdGltZW91dChvbkFuaW1hdGlvbkV4cGlyZWQsIHRpbWVyVGltZSwgZmFsc2UpO1xuICAgICAgICAgICAgYW5pbWF0aW9uc0RhdGFbMF0gPSB7XG4gICAgICAgICAgICAgIHRpbWVyOiB0aW1lcixcbiAgICAgICAgICAgICAgZXhwZWN0ZWRFbmRUaW1lOiBlbmRUaW1lXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYW5pbWF0aW9uc0RhdGEucHVzaChjbG9zZSk7XG4gICAgICAgICAgICBlbGVtZW50LmRhdGEoQU5JTUFURV9USU1FUl9LRVksIGFuaW1hdGlvbnNEYXRhKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZXZlbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgZWxlbWVudC5vbihldmVudHMuam9pbignICcpLCBvbkFuaW1hdGlvblByb2dyZXNzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAob3B0aW9ucy50bykge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuY2xlYW51cFN0eWxlcykge1xuICAgICAgICAgICAgICByZWdpc3RlclJlc3RvcmFibGVTdHlsZXMocmVzdG9yZVN0eWxlcywgbm9kZSwgT2JqZWN0LmtleXMob3B0aW9ucy50bykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXBwbHlBbmltYXRpb25Ub1N0eWxlcyhlbGVtZW50LCBvcHRpb25zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvbkFuaW1hdGlvbkV4cGlyZWQoKSB7XG4gICAgICAgICAgdmFyIGFuaW1hdGlvbnNEYXRhID0gZWxlbWVudC5kYXRhKEFOSU1BVEVfVElNRVJfS0VZKTtcblxuICAgICAgICAgIC8vIHRoaXMgd2lsbCBiZSBmYWxzZSBpbiB0aGUgZXZlbnQgdGhhdCB0aGUgZWxlbWVudCB3YXNcbiAgICAgICAgICAvLyByZW1vdmVkIGZyb20gdGhlIERPTSAodmlhIGEgbGVhdmUgYW5pbWF0aW9uIG9yIHNvbWV0aGluZ1xuICAgICAgICAgIC8vIHNpbWlsYXIpXG4gICAgICAgICAgaWYgKGFuaW1hdGlvbnNEYXRhKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFuaW1hdGlvbnNEYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGFuaW1hdGlvbnNEYXRhW2ldKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZURhdGEoQU5JTUFURV9USU1FUl9LRVkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1dO1xufV07XG5cbnZhciAkJEFuaW1hdGVDc3NEcml2ZXJQcm92aWRlciA9IFsnJCRhbmltYXRpb25Qcm92aWRlcicsIGZ1bmN0aW9uKCQkYW5pbWF0aW9uUHJvdmlkZXIpIHtcbiAgJCRhbmltYXRpb25Qcm92aWRlci5kcml2ZXJzLnB1c2goJyQkYW5pbWF0ZUNzc0RyaXZlcicpO1xuXG4gIHZhciBOR19BTklNQVRFX1NISU1fQ0xBU1NfTkFNRSA9ICduZy1hbmltYXRlLXNoaW0nO1xuICB2YXIgTkdfQU5JTUFURV9BTkNIT1JfQ0xBU1NfTkFNRSA9ICduZy1hbmNob3InO1xuXG4gIHZhciBOR19PVVRfQU5DSE9SX0NMQVNTX05BTUUgPSAnbmctYW5jaG9yLW91dCc7XG4gIHZhciBOR19JTl9BTkNIT1JfQ0xBU1NfTkFNRSA9ICduZy1hbmNob3ItaW4nO1xuXG4gIGZ1bmN0aW9uIGlzRG9jdW1lbnRGcmFnbWVudChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUucGFyZW50Tm9kZSAmJiBub2RlLnBhcmVudE5vZGUubm9kZVR5cGUgPT09IDExO1xuICB9XG5cbiAgdGhpcy4kZ2V0ID0gWyckYW5pbWF0ZUNzcycsICckcm9vdFNjb3BlJywgJyQkQW5pbWF0ZVJ1bm5lcicsICckcm9vdEVsZW1lbnQnLCAnJHNuaWZmZXInLCAnJCRqcUxpdGUnLCAnJGRvY3VtZW50JyxcbiAgICAgICBmdW5jdGlvbigkYW5pbWF0ZUNzcywgICAkcm9vdFNjb3BlLCAgICQkQW5pbWF0ZVJ1bm5lciwgICAkcm9vdEVsZW1lbnQsICAgJHNuaWZmZXIsICAgJCRqcUxpdGUsICAgJGRvY3VtZW50KSB7XG5cbiAgICAvLyBvbmx5IGJyb3dzZXJzIHRoYXQgc3VwcG9ydCB0aGVzZSBwcm9wZXJ0aWVzIGNhbiByZW5kZXIgYW5pbWF0aW9uc1xuICAgIGlmICghJHNuaWZmZXIuYW5pbWF0aW9ucyAmJiAhJHNuaWZmZXIudHJhbnNpdGlvbnMpIHJldHVybiBub29wO1xuXG4gICAgdmFyIGJvZHlOb2RlID0gJGRvY3VtZW50WzBdLmJvZHk7XG4gICAgdmFyIHJvb3ROb2RlID0gZ2V0RG9tTm9kZSgkcm9vdEVsZW1lbnQpO1xuXG4gICAgdmFyIHJvb3RCb2R5RWxlbWVudCA9IGpxTGl0ZShcbiAgICAgIC8vIHRoaXMgaXMgdG8gYXZvaWQgdXNpbmcgc29tZXRoaW5nIHRoYXQgZXhpc3RzIG91dHNpZGUgb2YgdGhlIGJvZHlcbiAgICAgIC8vIHdlIGFsc28gc3BlY2lhbCBjYXNlIHRoZSBkb2MgZnJhZ21lbnQgY2FzZSBiZWNhdXNlIG91ciB1bml0IHRlc3QgY29kZVxuICAgICAgLy8gYXBwZW5kcyB0aGUgJHJvb3RFbGVtZW50IHRvIHRoZSBib2R5IGFmdGVyIHRoZSBhcHAgaGFzIGJlZW4gYm9vdHN0cmFwcGVkXG4gICAgICBpc0RvY3VtZW50RnJhZ21lbnQocm9vdE5vZGUpIHx8IGJvZHlOb2RlLmNvbnRhaW5zKHJvb3ROb2RlKSA/IHJvb3ROb2RlIDogYm9keU5vZGVcbiAgICApO1xuXG4gICAgdmFyIGFwcGx5QW5pbWF0aW9uQ2xhc3NlcyA9IGFwcGx5QW5pbWF0aW9uQ2xhc3Nlc0ZhY3RvcnkoJCRqcUxpdGUpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGluaXREcml2ZXJGbihhbmltYXRpb25EZXRhaWxzKSB7XG4gICAgICByZXR1cm4gYW5pbWF0aW9uRGV0YWlscy5mcm9tICYmIGFuaW1hdGlvbkRldGFpbHMudG9cbiAgICAgICAgICA/IHByZXBhcmVGcm9tVG9BbmNob3JBbmltYXRpb24oYW5pbWF0aW9uRGV0YWlscy5mcm9tLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25EZXRhaWxzLnRvLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25EZXRhaWxzLmNsYXNzZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkRldGFpbHMuYW5jaG9ycylcbiAgICAgICAgICA6IHByZXBhcmVSZWd1bGFyQW5pbWF0aW9uKGFuaW1hdGlvbkRldGFpbHMpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBmaWx0ZXJDc3NDbGFzc2VzKGNsYXNzZXMpIHtcbiAgICAgIC8vcmVtb3ZlIGFsbCB0aGUgYG5nLWAgc3R1ZmZcbiAgICAgIHJldHVybiBjbGFzc2VzLnJlcGxhY2UoL1xcYm5nLVxcUytcXGIvZywgJycpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFVuaXF1ZVZhbHVlcyhhLCBiKSB7XG4gICAgICBpZiAoaXNTdHJpbmcoYSkpIGEgPSBhLnNwbGl0KCcgJyk7XG4gICAgICBpZiAoaXNTdHJpbmcoYikpIGIgPSBiLnNwbGl0KCcgJyk7XG4gICAgICByZXR1cm4gYS5maWx0ZXIoZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiBiLmluZGV4T2YodmFsKSA9PT0gLTE7XG4gICAgICB9KS5qb2luKCcgJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJlcGFyZUFuY2hvcmVkQW5pbWF0aW9uKGNsYXNzZXMsIG91dEFuY2hvciwgaW5BbmNob3IpIHtcbiAgICAgIHZhciBjbG9uZSA9IGpxTGl0ZShnZXREb21Ob2RlKG91dEFuY2hvcikuY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgIHZhciBzdGFydGluZ0NsYXNzZXMgPSBmaWx0ZXJDc3NDbGFzc2VzKGdldENsYXNzVmFsKGNsb25lKSk7XG5cbiAgICAgIG91dEFuY2hvci5hZGRDbGFzcyhOR19BTklNQVRFX1NISU1fQ0xBU1NfTkFNRSk7XG4gICAgICBpbkFuY2hvci5hZGRDbGFzcyhOR19BTklNQVRFX1NISU1fQ0xBU1NfTkFNRSk7XG5cbiAgICAgIGNsb25lLmFkZENsYXNzKE5HX0FOSU1BVEVfQU5DSE9SX0NMQVNTX05BTUUpO1xuXG4gICAgICByb290Qm9keUVsZW1lbnQuYXBwZW5kKGNsb25lKTtcblxuICAgICAgdmFyIGFuaW1hdG9ySW4sIGFuaW1hdG9yT3V0ID0gcHJlcGFyZU91dEFuaW1hdGlvbigpO1xuXG4gICAgICAvLyB0aGUgdXNlciBtYXkgbm90IGVuZCB1cCB1c2luZyB0aGUgYG91dGAgYW5pbWF0aW9uIGFuZFxuICAgICAgLy8gb25seSBtYWtpbmcgdXNlIG9mIHRoZSBgaW5gIGFuaW1hdGlvbiBvciB2aWNlLXZlcnNhLlxuICAgICAgLy8gSW4gZWl0aGVyIGNhc2Ugd2Ugc2hvdWxkIGFsbG93IHRoaXMgYW5kIG5vdCBhc3N1bWUgdGhlXG4gICAgICAvLyBhbmltYXRpb24gaXMgb3ZlciB1bmxlc3MgYm90aCBhbmltYXRpb25zIGFyZSBub3QgdXNlZC5cbiAgICAgIGlmICghYW5pbWF0b3JPdXQpIHtcbiAgICAgICAgYW5pbWF0b3JJbiA9IHByZXBhcmVJbkFuaW1hdGlvbigpO1xuICAgICAgICBpZiAoIWFuaW1hdG9ySW4pIHtcbiAgICAgICAgICByZXR1cm4gZW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHN0YXJ0aW5nQW5pbWF0b3IgPSBhbmltYXRvck91dCB8fCBhbmltYXRvckluO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHJ1bm5lcjtcblxuICAgICAgICAgIHZhciBjdXJyZW50QW5pbWF0aW9uID0gc3RhcnRpbmdBbmltYXRvci5zdGFydCgpO1xuICAgICAgICAgIGN1cnJlbnRBbmltYXRpb24uZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGN1cnJlbnRBbmltYXRpb24gPSBudWxsO1xuICAgICAgICAgICAgaWYgKCFhbmltYXRvckluKSB7XG4gICAgICAgICAgICAgIGFuaW1hdG9ySW4gPSBwcmVwYXJlSW5BbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgaWYgKGFuaW1hdG9ySW4pIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50QW5pbWF0aW9uID0gYW5pbWF0b3JJbi5zdGFydCgpO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRBbmltYXRpb24uZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRBbmltYXRpb24gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgZW5kKCk7XG4gICAgICAgICAgICAgICAgICBydW5uZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudEFuaW1hdGlvbjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaW4gdGhlIGV2ZW50IHRoYXQgdGhlcmUgaXMgbm8gYGluYCBhbmltYXRpb25cbiAgICAgICAgICAgIGVuZCgpO1xuICAgICAgICAgICAgcnVubmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBydW5uZXIgPSBuZXcgJCRBbmltYXRlUnVubmVyKHtcbiAgICAgICAgICAgIGVuZDogZW5kRm4sXG4gICAgICAgICAgICBjYW5jZWw6IGVuZEZuXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gcnVubmVyO1xuXG4gICAgICAgICAgZnVuY3Rpb24gZW5kRm4oKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudEFuaW1hdGlvbikge1xuICAgICAgICAgICAgICBjdXJyZW50QW5pbWF0aW9uLmVuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgZnVuY3Rpb24gY2FsY3VsYXRlQW5jaG9yU3R5bGVzKGFuY2hvcikge1xuICAgICAgICB2YXIgc3R5bGVzID0ge307XG5cbiAgICAgICAgdmFyIGNvb3JkcyA9IGdldERvbU5vZGUoYW5jaG9yKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAvLyB3ZSBpdGVyYXRlIGRpcmVjdGx5IHNpbmNlIHNhZmFyaSBtZXNzZXMgdXAgYW5kIGRvZXNuJ3QgcmV0dXJuXG4gICAgICAgIC8vIGFsbCB0aGUga2V5cyBmb3IgdGhlIGNvb3JkcyBvYmplY3Qgd2hlbiBpdGVyYXRlZFxuICAgICAgICBmb3JFYWNoKFsnd2lkdGgnLCdoZWlnaHQnLCd0b3AnLCdsZWZ0J10sIGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IGNvb3Jkc1trZXldO1xuICAgICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICB2YWx1ZSArPSBib2R5Tm9kZS5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgIHZhbHVlICs9IGJvZHlOb2RlLnNjcm9sbExlZnQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdHlsZXNba2V5XSA9IE1hdGguZmxvb3IodmFsdWUpICsgJ3B4JztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzdHlsZXM7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHByZXBhcmVPdXRBbmltYXRpb24oKSB7XG4gICAgICAgIHZhciBhbmltYXRvciA9ICRhbmltYXRlQ3NzKGNsb25lLCB7XG4gICAgICAgICAgYWRkQ2xhc3M6IE5HX09VVF9BTkNIT1JfQ0xBU1NfTkFNRSxcbiAgICAgICAgICBkZWxheTogdHJ1ZSxcbiAgICAgICAgICBmcm9tOiBjYWxjdWxhdGVBbmNob3JTdHlsZXMob3V0QW5jaG9yKVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyByZWFkIHRoZSBjb21tZW50IHdpdGhpbiBgcHJlcGFyZVJlZ3VsYXJBbmltYXRpb25gIHRvIHVuZGVyc3RhbmRcbiAgICAgICAgLy8gd2h5IHRoaXMgY2hlY2sgaXMgbmVjZXNzYXJ5XG4gICAgICAgIHJldHVybiBhbmltYXRvci4kJHdpbGxBbmltYXRlID8gYW5pbWF0b3IgOiBudWxsO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBnZXRDbGFzc1ZhbChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50LmF0dHIoJ2NsYXNzJykgfHwgJyc7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHByZXBhcmVJbkFuaW1hdGlvbigpIHtcbiAgICAgICAgdmFyIGVuZGluZ0NsYXNzZXMgPSBmaWx0ZXJDc3NDbGFzc2VzKGdldENsYXNzVmFsKGluQW5jaG9yKSk7XG4gICAgICAgIHZhciB0b0FkZCA9IGdldFVuaXF1ZVZhbHVlcyhlbmRpbmdDbGFzc2VzLCBzdGFydGluZ0NsYXNzZXMpO1xuICAgICAgICB2YXIgdG9SZW1vdmUgPSBnZXRVbmlxdWVWYWx1ZXMoc3RhcnRpbmdDbGFzc2VzLCBlbmRpbmdDbGFzc2VzKTtcblxuICAgICAgICB2YXIgYW5pbWF0b3IgPSAkYW5pbWF0ZUNzcyhjbG9uZSwge1xuICAgICAgICAgIHRvOiBjYWxjdWxhdGVBbmNob3JTdHlsZXMoaW5BbmNob3IpLFxuICAgICAgICAgIGFkZENsYXNzOiBOR19JTl9BTkNIT1JfQ0xBU1NfTkFNRSArICcgJyArIHRvQWRkLFxuICAgICAgICAgIHJlbW92ZUNsYXNzOiBOR19PVVRfQU5DSE9SX0NMQVNTX05BTUUgKyAnICcgKyB0b1JlbW92ZSxcbiAgICAgICAgICBkZWxheTogdHJ1ZVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyByZWFkIHRoZSBjb21tZW50IHdpdGhpbiBgcHJlcGFyZVJlZ3VsYXJBbmltYXRpb25gIHRvIHVuZGVyc3RhbmRcbiAgICAgICAgLy8gd2h5IHRoaXMgY2hlY2sgaXMgbmVjZXNzYXJ5XG4gICAgICAgIHJldHVybiBhbmltYXRvci4kJHdpbGxBbmltYXRlID8gYW5pbWF0b3IgOiBudWxsO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBlbmQoKSB7XG4gICAgICAgIGNsb25lLnJlbW92ZSgpO1xuICAgICAgICBvdXRBbmNob3IucmVtb3ZlQ2xhc3MoTkdfQU5JTUFURV9TSElNX0NMQVNTX05BTUUpO1xuICAgICAgICBpbkFuY2hvci5yZW1vdmVDbGFzcyhOR19BTklNQVRFX1NISU1fQ0xBU1NfTkFNRSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJlcGFyZUZyb21Ub0FuY2hvckFuaW1hdGlvbihmcm9tLCB0bywgY2xhc3NlcywgYW5jaG9ycykge1xuICAgICAgdmFyIGZyb21BbmltYXRpb24gPSBwcmVwYXJlUmVndWxhckFuaW1hdGlvbihmcm9tLCBub29wKTtcbiAgICAgIHZhciB0b0FuaW1hdGlvbiA9IHByZXBhcmVSZWd1bGFyQW5pbWF0aW9uKHRvLCBub29wKTtcblxuICAgICAgdmFyIGFuY2hvckFuaW1hdGlvbnMgPSBbXTtcbiAgICAgIGZvckVhY2goYW5jaG9ycywgZnVuY3Rpb24oYW5jaG9yKSB7XG4gICAgICAgIHZhciBvdXRFbGVtZW50ID0gYW5jaG9yWydvdXQnXTtcbiAgICAgICAgdmFyIGluRWxlbWVudCA9IGFuY2hvclsnaW4nXTtcbiAgICAgICAgdmFyIGFuaW1hdG9yID0gcHJlcGFyZUFuY2hvcmVkQW5pbWF0aW9uKGNsYXNzZXMsIG91dEVsZW1lbnQsIGluRWxlbWVudCk7XG4gICAgICAgIGlmIChhbmltYXRvcikge1xuICAgICAgICAgIGFuY2hvckFuaW1hdGlvbnMucHVzaChhbmltYXRvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBubyBwb2ludCBpbiBkb2luZyBhbnl0aGluZyB3aGVuIHRoZXJlIGFyZSBubyBlbGVtZW50cyB0byBhbmltYXRlXG4gICAgICBpZiAoIWZyb21BbmltYXRpb24gJiYgIXRvQW5pbWF0aW9uICYmIGFuY2hvckFuaW1hdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgYW5pbWF0aW9uUnVubmVycyA9IFtdO1xuXG4gICAgICAgICAgaWYgKGZyb21BbmltYXRpb24pIHtcbiAgICAgICAgICAgIGFuaW1hdGlvblJ1bm5lcnMucHVzaChmcm9tQW5pbWF0aW9uLnN0YXJ0KCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0b0FuaW1hdGlvbikge1xuICAgICAgICAgICAgYW5pbWF0aW9uUnVubmVycy5wdXNoKHRvQW5pbWF0aW9uLnN0YXJ0KCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZvckVhY2goYW5jaG9yQW5pbWF0aW9ucywgZnVuY3Rpb24oYW5pbWF0aW9uKSB7XG4gICAgICAgICAgICBhbmltYXRpb25SdW5uZXJzLnB1c2goYW5pbWF0aW9uLnN0YXJ0KCkpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdmFyIHJ1bm5lciA9IG5ldyAkJEFuaW1hdGVSdW5uZXIoe1xuICAgICAgICAgICAgZW5kOiBlbmRGbixcbiAgICAgICAgICAgIGNhbmNlbDogZW5kRm4gLy8gQ1NTLWRyaXZlbiBhbmltYXRpb25zIGNhbm5vdCBiZSBjYW5jZWxsZWQsIG9ubHkgZW5kZWRcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgICQkQW5pbWF0ZVJ1bm5lci5hbGwoYW5pbWF0aW9uUnVubmVycywgZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgICAgICAgICBydW5uZXIuY29tcGxldGUoc3RhdHVzKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiBydW5uZXI7XG5cbiAgICAgICAgICBmdW5jdGlvbiBlbmRGbigpIHtcbiAgICAgICAgICAgIGZvckVhY2goYW5pbWF0aW9uUnVubmVycywgZnVuY3Rpb24ocnVubmVyKSB7XG4gICAgICAgICAgICAgIHJ1bm5lci5lbmQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmVwYXJlUmVndWxhckFuaW1hdGlvbihhbmltYXRpb25EZXRhaWxzKSB7XG4gICAgICB2YXIgZWxlbWVudCA9IGFuaW1hdGlvbkRldGFpbHMuZWxlbWVudDtcbiAgICAgIHZhciBvcHRpb25zID0gYW5pbWF0aW9uRGV0YWlscy5vcHRpb25zIHx8IHt9O1xuXG4gICAgICBpZiAoYW5pbWF0aW9uRGV0YWlscy5zdHJ1Y3R1cmFsKSB7XG4gICAgICAgIG9wdGlvbnMuZXZlbnQgPSBhbmltYXRpb25EZXRhaWxzLmV2ZW50O1xuICAgICAgICBvcHRpb25zLnN0cnVjdHVyYWwgPSB0cnVlO1xuICAgICAgICBvcHRpb25zLmFwcGx5Q2xhc3Nlc0Vhcmx5ID0gdHJ1ZTtcblxuICAgICAgICAvLyB3ZSBzcGVjaWFsIGNhc2UgdGhlIGxlYXZlIGFuaW1hdGlvbiBzaW5jZSB3ZSB3YW50IHRvIGVuc3VyZSB0aGF0XG4gICAgICAgIC8vIHRoZSBlbGVtZW50IGlzIHJlbW92ZWQgYXMgc29vbiBhcyB0aGUgYW5pbWF0aW9uIGlzIG92ZXIuIE90aGVyd2lzZVxuICAgICAgICAvLyBhIGZsaWNrZXIgbWlnaHQgYXBwZWFyIG9yIHRoZSBlbGVtZW50IG1heSBub3QgYmUgcmVtb3ZlZCBhdCBhbGxcbiAgICAgICAgaWYgKGFuaW1hdGlvbkRldGFpbHMuZXZlbnQgPT09ICdsZWF2ZScpIHtcbiAgICAgICAgICBvcHRpb25zLm9uRG9uZSA9IG9wdGlvbnMuZG9tT3BlcmF0aW9uO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIGFzc2lnbiB0aGUgcHJlcGFyYXRpb25DbGFzc2VzIGFzIHRoZSBhY3R1YWwgYW5pbWF0aW9uIGV2ZW50IHNpbmNlXG4gICAgICAvLyB0aGUgaW50ZXJuYWxzIG9mICRhbmltYXRlQ3NzIHdpbGwganVzdCBzdWZmaXggdGhlIGV2ZW50IHRva2VuIHZhbHVlc1xuICAgICAgLy8gd2l0aCBgLWFjdGl2ZWAgdG8gdHJpZ2dlciB0aGUgYW5pbWF0aW9uLlxuICAgICAgaWYgKG9wdGlvbnMucHJlcGFyYXRpb25DbGFzc2VzKSB7XG4gICAgICAgIG9wdGlvbnMuZXZlbnQgPSBjb25jYXRXaXRoU3BhY2Uob3B0aW9ucy5ldmVudCwgb3B0aW9ucy5wcmVwYXJhdGlvbkNsYXNzZXMpO1xuICAgICAgfVxuXG4gICAgICB2YXIgYW5pbWF0b3IgPSAkYW5pbWF0ZUNzcyhlbGVtZW50LCBvcHRpb25zKTtcblxuICAgICAgLy8gdGhlIGRyaXZlciBsb29rdXAgY29kZSBpbnNpZGUgb2YgJCRhbmltYXRpb24gYXR0ZW1wdHMgdG8gc3Bhd24gYVxuICAgICAgLy8gZHJpdmVyIG9uZSBieSBvbmUgdW50aWwgYSBkcml2ZXIgcmV0dXJucyBhLiQkd2lsbEFuaW1hdGUgYW5pbWF0b3Igb2JqZWN0LlxuICAgICAgLy8gJGFuaW1hdGVDc3Mgd2lsbCBhbHdheXMgcmV0dXJuIGFuIG9iamVjdCwgaG93ZXZlciwgaXQgd2lsbCBwYXNzIGluXG4gICAgICAvLyBhIGZsYWcgYXMgYSBoaW50IGFzIHRvIHdoZXRoZXIgYW4gYW5pbWF0aW9uIHdhcyBkZXRlY3RlZCBvciBub3RcbiAgICAgIHJldHVybiBhbmltYXRvci4kJHdpbGxBbmltYXRlID8gYW5pbWF0b3IgOiBudWxsO1xuICAgIH1cbiAgfV07XG59XTtcblxuLy8gVE9ETyhtYXRza28pOiB1c2UgY2FjaGluZyBoZXJlIHRvIHNwZWVkIHRoaW5ncyB1cCBmb3IgZGV0ZWN0aW9uXG4vLyBUT0RPKG1hdHNrbyk6IGFkZCBkb2N1bWVudGF0aW9uXG4vLyAgYnkgdGhlIHRpbWUuLi5cblxudmFyICQkQW5pbWF0ZUpzUHJvdmlkZXIgPSBbJyRhbmltYXRlUHJvdmlkZXInLCBmdW5jdGlvbigkYW5pbWF0ZVByb3ZpZGVyKSB7XG4gIHRoaXMuJGdldCA9IFsnJGluamVjdG9yJywgJyQkQW5pbWF0ZVJ1bm5lcicsICckJGpxTGl0ZScsXG4gICAgICAgZnVuY3Rpb24oJGluamVjdG9yLCAgICQkQW5pbWF0ZVJ1bm5lciwgICAkJGpxTGl0ZSkge1xuXG4gICAgdmFyIGFwcGx5QW5pbWF0aW9uQ2xhc3NlcyA9IGFwcGx5QW5pbWF0aW9uQ2xhc3Nlc0ZhY3RvcnkoJCRqcUxpdGUpO1xuICAgICAgICAgLy8gJGFuaW1hdGVKcyhlbGVtZW50LCAnZW50ZXInKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWxlbWVudCwgZXZlbnQsIGNsYXNzZXMsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBhbmltYXRpb25DbG9zZWQgPSBmYWxzZTtcblxuICAgICAgLy8gdGhlIGBjbGFzc2VzYCBhcmd1bWVudCBpcyBvcHRpb25hbCBhbmQgaWYgaXQgaXMgbm90IHVzZWRcbiAgICAgIC8vIHRoZW4gdGhlIGNsYXNzZXMgd2lsbCBiZSByZXNvbHZlZCBmcm9tIHRoZSBlbGVtZW50J3MgY2xhc3NOYW1lXG4gICAgICAvLyBwcm9wZXJ0eSBhcyB3ZWxsIGFzIG9wdGlvbnMuYWRkQ2xhc3Mvb3B0aW9ucy5yZW1vdmVDbGFzcy5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzICYmIGlzT2JqZWN0KGNsYXNzZXMpKSB7XG4gICAgICAgIG9wdGlvbnMgPSBjbGFzc2VzO1xuICAgICAgICBjbGFzc2VzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgb3B0aW9ucyA9IHByZXBhcmVBbmltYXRpb25PcHRpb25zKG9wdGlvbnMpO1xuICAgICAgaWYgKCFjbGFzc2VzKSB7XG4gICAgICAgIGNsYXNzZXMgPSBlbGVtZW50LmF0dHIoJ2NsYXNzJykgfHwgJyc7XG4gICAgICAgIGlmIChvcHRpb25zLmFkZENsYXNzKSB7XG4gICAgICAgICAgY2xhc3NlcyArPSAnICcgKyBvcHRpb25zLmFkZENsYXNzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLnJlbW92ZUNsYXNzKSB7XG4gICAgICAgICAgY2xhc3NlcyArPSAnICcgKyBvcHRpb25zLnJlbW92ZUNsYXNzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBjbGFzc2VzVG9BZGQgPSBvcHRpb25zLmFkZENsYXNzO1xuICAgICAgdmFyIGNsYXNzZXNUb1JlbW92ZSA9IG9wdGlvbnMucmVtb3ZlQ2xhc3M7XG5cbiAgICAgIC8vIHRoZSBsb29rdXBBbmltYXRpb25zIGZ1bmN0aW9uIHJldHVybnMgYSBzZXJpZXMgb2YgYW5pbWF0aW9uIG9iamVjdHMgdGhhdCBhcmVcbiAgICAgIC8vIG1hdGNoZWQgdXAgd2l0aCBvbmUgb3IgbW9yZSBvZiB0aGUgQ1NTIGNsYXNzZXMuIFRoZXNlIGFuaW1hdGlvbiBvYmplY3RzIGFyZVxuICAgICAgLy8gZGVmaW5lZCB2aWEgdGhlIG1vZHVsZS5hbmltYXRpb24gZmFjdG9yeSBmdW5jdGlvbi4gSWYgbm90aGluZyBpcyBkZXRlY3RlZCB0aGVuXG4gICAgICAvLyB3ZSBkb24ndCByZXR1cm4gYW55dGhpbmcgd2hpY2ggdGhlbiBtYWtlcyAkYW5pbWF0aW9uIHF1ZXJ5IHRoZSBuZXh0IGRyaXZlci5cbiAgICAgIHZhciBhbmltYXRpb25zID0gbG9va3VwQW5pbWF0aW9ucyhjbGFzc2VzKTtcbiAgICAgIHZhciBiZWZvcmUsIGFmdGVyO1xuICAgICAgaWYgKGFuaW1hdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBhZnRlckZuLCBiZWZvcmVGbjtcbiAgICAgICAgaWYgKGV2ZW50ID09ICdsZWF2ZScpIHtcbiAgICAgICAgICBiZWZvcmVGbiA9ICdsZWF2ZSc7XG4gICAgICAgICAgYWZ0ZXJGbiA9ICdhZnRlckxlYXZlJzsgLy8gVE9ETyhtYXRza28pOiBnZXQgcmlkIG9mIHRoaXNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiZWZvcmVGbiA9ICdiZWZvcmUnICsgZXZlbnQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBldmVudC5zdWJzdHIoMSk7XG4gICAgICAgICAgYWZ0ZXJGbiA9IGV2ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50ICE9PSAnZW50ZXInICYmIGV2ZW50ICE9PSAnbW92ZScpIHtcbiAgICAgICAgICBiZWZvcmUgPSBwYWNrYWdlQW5pbWF0aW9ucyhlbGVtZW50LCBldmVudCwgb3B0aW9ucywgYW5pbWF0aW9ucywgYmVmb3JlRm4pO1xuICAgICAgICB9XG4gICAgICAgIGFmdGVyICA9IHBhY2thZ2VBbmltYXRpb25zKGVsZW1lbnQsIGV2ZW50LCBvcHRpb25zLCBhbmltYXRpb25zLCBhZnRlckZuKTtcbiAgICAgIH1cblxuICAgICAgLy8gbm8gbWF0Y2hpbmcgYW5pbWF0aW9uc1xuICAgICAgaWYgKCFiZWZvcmUgJiYgIWFmdGVyKSByZXR1cm47XG5cbiAgICAgIGZ1bmN0aW9uIGFwcGx5T3B0aW9ucygpIHtcbiAgICAgICAgb3B0aW9ucy5kb21PcGVyYXRpb24oKTtcbiAgICAgICAgYXBwbHlBbmltYXRpb25DbGFzc2VzKGVsZW1lbnQsIG9wdGlvbnMpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAgICAgYW5pbWF0aW9uQ2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgYXBwbHlPcHRpb25zKCk7XG4gICAgICAgIGFwcGx5QW5pbWF0aW9uU3R5bGVzKGVsZW1lbnQsIG9wdGlvbnMpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcnVubmVyO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAkJHdpbGxBbmltYXRlOiB0cnVlLFxuICAgICAgICBlbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChydW5uZXIpIHtcbiAgICAgICAgICAgIHJ1bm5lci5lbmQoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgICAgIHJ1bm5lciA9IG5ldyAkJEFuaW1hdGVSdW5uZXIoKTtcbiAgICAgICAgICAgIHJ1bm5lci5jb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJ1bm5lcjtcbiAgICAgICAgfSxcbiAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChydW5uZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBydW5uZXI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcnVubmVyID0gbmV3ICQkQW5pbWF0ZVJ1bm5lcigpO1xuICAgICAgICAgIHZhciBjbG9zZUFjdGl2ZUFuaW1hdGlvbnM7XG4gICAgICAgICAgdmFyIGNoYWluID0gW107XG5cbiAgICAgICAgICBpZiAoYmVmb3JlKSB7XG4gICAgICAgICAgICBjaGFpbi5wdXNoKGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgICAgICAgIGNsb3NlQWN0aXZlQW5pbWF0aW9ucyA9IGJlZm9yZShmbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICBjaGFpbi5wdXNoKGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgICAgICAgIGFwcGx5T3B0aW9ucygpO1xuICAgICAgICAgICAgICBmbih0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBseU9wdGlvbnMoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoYWZ0ZXIpIHtcbiAgICAgICAgICAgIGNoYWluLnB1c2goZnVuY3Rpb24oZm4pIHtcbiAgICAgICAgICAgICAgY2xvc2VBY3RpdmVBbmltYXRpb25zID0gYWZ0ZXIoZm4pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcnVubmVyLnNldEhvc3Qoe1xuICAgICAgICAgICAgZW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgZW5kQW5pbWF0aW9ucygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNhbmNlbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGVuZEFuaW1hdGlvbnModHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAkJEFuaW1hdGVSdW5uZXIuY2hhaW4oY2hhaW4sIG9uQ29tcGxldGUpO1xuICAgICAgICAgIHJldHVybiBydW5uZXI7XG5cbiAgICAgICAgICBmdW5jdGlvbiBvbkNvbXBsZXRlKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGNsb3NlKHN1Y2Nlc3MpO1xuICAgICAgICAgICAgcnVubmVyLmNvbXBsZXRlKHN1Y2Nlc3MpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZ1bmN0aW9uIGVuZEFuaW1hdGlvbnMoY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICBpZiAoIWFuaW1hdGlvbkNsb3NlZCkge1xuICAgICAgICAgICAgICAoY2xvc2VBY3RpdmVBbmltYXRpb25zIHx8IG5vb3ApKGNhbmNlbGxlZCk7XG4gICAgICAgICAgICAgIG9uQ29tcGxldGUoY2FuY2VsbGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIGV4ZWN1dGVBbmltYXRpb25GbihmbiwgZWxlbWVudCwgZXZlbnQsIG9wdGlvbnMsIG9uRG9uZSkge1xuICAgICAgICB2YXIgYXJncztcbiAgICAgICAgc3dpdGNoIChldmVudCkge1xuICAgICAgICAgIGNhc2UgJ2FuaW1hdGUnOlxuICAgICAgICAgICAgYXJncyA9IFtlbGVtZW50LCBvcHRpb25zLmZyb20sIG9wdGlvbnMudG8sIG9uRG9uZV07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgJ3NldENsYXNzJzpcbiAgICAgICAgICAgIGFyZ3MgPSBbZWxlbWVudCwgY2xhc3Nlc1RvQWRkLCBjbGFzc2VzVG9SZW1vdmUsIG9uRG9uZV07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgJ2FkZENsYXNzJzpcbiAgICAgICAgICAgIGFyZ3MgPSBbZWxlbWVudCwgY2xhc3Nlc1RvQWRkLCBvbkRvbmVdO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICdyZW1vdmVDbGFzcyc6XG4gICAgICAgICAgICBhcmdzID0gW2VsZW1lbnQsIGNsYXNzZXNUb1JlbW92ZSwgb25Eb25lXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGFyZ3MgPSBbZWxlbWVudCwgb25Eb25lXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJncy5wdXNoKG9wdGlvbnMpO1xuXG4gICAgICAgIHZhciB2YWx1ZSA9IGZuLmFwcGx5KGZuLCBhcmdzKTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKGlzRnVuY3Rpb24odmFsdWUuc3RhcnQpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnN0YXJ0KCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgJCRBbmltYXRlUnVubmVyKSB7XG4gICAgICAgICAgICB2YWx1ZS5kb25lKG9uRG9uZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgICAgICAgLy8gb3B0aW9uYWwgb25FbmQgLyBvbkNhbmNlbCBjYWxsYmFja1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBub29wO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBncm91cEV2ZW50ZWRBbmltYXRpb25zKGVsZW1lbnQsIGV2ZW50LCBvcHRpb25zLCBhbmltYXRpb25zLCBmbk5hbWUpIHtcbiAgICAgICAgdmFyIG9wZXJhdGlvbnMgPSBbXTtcbiAgICAgICAgZm9yRWFjaChhbmltYXRpb25zLCBmdW5jdGlvbihhbmkpIHtcbiAgICAgICAgICB2YXIgYW5pbWF0aW9uID0gYW5pW2ZuTmFtZV07XG4gICAgICAgICAgaWYgKCFhbmltYXRpb24pIHJldHVybjtcblxuICAgICAgICAgIC8vIG5vdGUgdGhhdCBhbGwgb2YgdGhlc2UgYW5pbWF0aW9ucyB3aWxsIHJ1biBpbiBwYXJhbGxlbFxuICAgICAgICAgIG9wZXJhdGlvbnMucHVzaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBydW5uZXI7XG4gICAgICAgICAgICB2YXIgZW5kUHJvZ3Jlc3NDYjtcblxuICAgICAgICAgICAgdmFyIHJlc29sdmVkID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgb25BbmltYXRpb25Db21wbGV0ZSA9IGZ1bmN0aW9uKHJlamVjdGVkKSB7XG4gICAgICAgICAgICAgIGlmICghcmVzb2x2ZWQpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgKGVuZFByb2dyZXNzQ2IgfHwgbm9vcCkocmVqZWN0ZWQpO1xuICAgICAgICAgICAgICAgIHJ1bm5lci5jb21wbGV0ZSghcmVqZWN0ZWQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBydW5uZXIgPSBuZXcgJCRBbmltYXRlUnVubmVyKHtcbiAgICAgICAgICAgICAgZW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBvbkFuaW1hdGlvbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNhbmNlbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgb25BbmltYXRpb25Db21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVuZFByb2dyZXNzQ2IgPSBleGVjdXRlQW5pbWF0aW9uRm4oYW5pbWF0aW9uLCBlbGVtZW50LCBldmVudCwgb3B0aW9ucywgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgIHZhciBjYW5jZWxsZWQgPSByZXN1bHQgPT09IGZhbHNlO1xuICAgICAgICAgICAgICBvbkFuaW1hdGlvbkNvbXBsZXRlKGNhbmNlbGxlZCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHJ1bm5lcjtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG9wZXJhdGlvbnM7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHBhY2thZ2VBbmltYXRpb25zKGVsZW1lbnQsIGV2ZW50LCBvcHRpb25zLCBhbmltYXRpb25zLCBmbk5hbWUpIHtcbiAgICAgICAgdmFyIG9wZXJhdGlvbnMgPSBncm91cEV2ZW50ZWRBbmltYXRpb25zKGVsZW1lbnQsIGV2ZW50LCBvcHRpb25zLCBhbmltYXRpb25zLCBmbk5hbWUpO1xuICAgICAgICBpZiAob3BlcmF0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB2YXIgYSxiO1xuICAgICAgICAgIGlmIChmbk5hbWUgPT09ICdiZWZvcmVTZXRDbGFzcycpIHtcbiAgICAgICAgICAgIGEgPSBncm91cEV2ZW50ZWRBbmltYXRpb25zKGVsZW1lbnQsICdyZW1vdmVDbGFzcycsIG9wdGlvbnMsIGFuaW1hdGlvbnMsICdiZWZvcmVSZW1vdmVDbGFzcycpO1xuICAgICAgICAgICAgYiA9IGdyb3VwRXZlbnRlZEFuaW1hdGlvbnMoZWxlbWVudCwgJ2FkZENsYXNzJywgb3B0aW9ucywgYW5pbWF0aW9ucywgJ2JlZm9yZUFkZENsYXNzJyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChmbk5hbWUgPT09ICdzZXRDbGFzcycpIHtcbiAgICAgICAgICAgIGEgPSBncm91cEV2ZW50ZWRBbmltYXRpb25zKGVsZW1lbnQsICdyZW1vdmVDbGFzcycsIG9wdGlvbnMsIGFuaW1hdGlvbnMsICdyZW1vdmVDbGFzcycpO1xuICAgICAgICAgICAgYiA9IGdyb3VwRXZlbnRlZEFuaW1hdGlvbnMoZWxlbWVudCwgJ2FkZENsYXNzJywgb3B0aW9ucywgYW5pbWF0aW9ucywgJ2FkZENsYXNzJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGEpIHtcbiAgICAgICAgICAgIG9wZXJhdGlvbnMgPSBvcGVyYXRpb25zLmNvbmNhdChhKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGIpIHtcbiAgICAgICAgICAgIG9wZXJhdGlvbnMgPSBvcGVyYXRpb25zLmNvbmNhdChiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3BlcmF0aW9ucy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgICAgICAvLyBUT0RPKG1hdHNrbyk6IGFkZCBkb2N1bWVudGF0aW9uXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBzdGFydEFuaW1hdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgIHZhciBydW5uZXJzID0gW107XG4gICAgICAgICAgaWYgKG9wZXJhdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3JFYWNoKG9wZXJhdGlvbnMsIGZ1bmN0aW9uKGFuaW1hdGVGbikge1xuICAgICAgICAgICAgICBydW5uZXJzLnB1c2goYW5pbWF0ZUZuKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcnVubmVycy5sZW5ndGggPyAkJEFuaW1hdGVSdW5uZXIuYWxsKHJ1bm5lcnMsIGNhbGxiYWNrKSA6IGNhbGxiYWNrKCk7XG5cbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gZW5kRm4ocmVqZWN0KSB7XG4gICAgICAgICAgICBmb3JFYWNoKHJ1bm5lcnMsIGZ1bmN0aW9uKHJ1bm5lcikge1xuICAgICAgICAgICAgICByZWplY3QgPyBydW5uZXIuY2FuY2VsKCkgOiBydW5uZXIuZW5kKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBsb29rdXBBbmltYXRpb25zKGNsYXNzZXMpIHtcbiAgICAgIGNsYXNzZXMgPSBpc0FycmF5KGNsYXNzZXMpID8gY2xhc3NlcyA6IGNsYXNzZXMuc3BsaXQoJyAnKTtcbiAgICAgIHZhciBtYXRjaGVzID0gW10sIGZsYWdNYXAgPSB7fTtcbiAgICAgIGZvciAodmFyIGk9MDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGtsYXNzID0gY2xhc3Nlc1tpXSxcbiAgICAgICAgICAgIGFuaW1hdGlvbkZhY3RvcnkgPSAkYW5pbWF0ZVByb3ZpZGVyLiQkcmVnaXN0ZXJlZEFuaW1hdGlvbnNba2xhc3NdO1xuICAgICAgICBpZiAoYW5pbWF0aW9uRmFjdG9yeSAmJiAhZmxhZ01hcFtrbGFzc10pIHtcbiAgICAgICAgICBtYXRjaGVzLnB1c2goJGluamVjdG9yLmdldChhbmltYXRpb25GYWN0b3J5KSk7XG4gICAgICAgICAgZmxhZ01hcFtrbGFzc10gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF0Y2hlcztcbiAgICB9XG4gIH1dO1xufV07XG5cbnZhciAkJEFuaW1hdGVKc0RyaXZlclByb3ZpZGVyID0gWyckJGFuaW1hdGlvblByb3ZpZGVyJywgZnVuY3Rpb24oJCRhbmltYXRpb25Qcm92aWRlcikge1xuICAkJGFuaW1hdGlvblByb3ZpZGVyLmRyaXZlcnMucHVzaCgnJCRhbmltYXRlSnNEcml2ZXInKTtcbiAgdGhpcy4kZ2V0ID0gWyckJGFuaW1hdGVKcycsICckJEFuaW1hdGVSdW5uZXInLCBmdW5jdGlvbigkJGFuaW1hdGVKcywgJCRBbmltYXRlUnVubmVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGluaXREcml2ZXJGbihhbmltYXRpb25EZXRhaWxzKSB7XG4gICAgICBpZiAoYW5pbWF0aW9uRGV0YWlscy5mcm9tICYmIGFuaW1hdGlvbkRldGFpbHMudG8pIHtcbiAgICAgICAgdmFyIGZyb21BbmltYXRpb24gPSBwcmVwYXJlQW5pbWF0aW9uKGFuaW1hdGlvbkRldGFpbHMuZnJvbSk7XG4gICAgICAgIHZhciB0b0FuaW1hdGlvbiA9IHByZXBhcmVBbmltYXRpb24oYW5pbWF0aW9uRGV0YWlscy50byk7XG4gICAgICAgIGlmICghZnJvbUFuaW1hdGlvbiAmJiAhdG9BbmltYXRpb24pIHJldHVybjtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBhbmltYXRpb25SdW5uZXJzID0gW107XG5cbiAgICAgICAgICAgIGlmIChmcm9tQW5pbWF0aW9uKSB7XG4gICAgICAgICAgICAgIGFuaW1hdGlvblJ1bm5lcnMucHVzaChmcm9tQW5pbWF0aW9uLnN0YXJ0KCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodG9BbmltYXRpb24pIHtcbiAgICAgICAgICAgICAgYW5pbWF0aW9uUnVubmVycy5wdXNoKHRvQW5pbWF0aW9uLnN0YXJ0KCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkJEFuaW1hdGVSdW5uZXIuYWxsKGFuaW1hdGlvblJ1bm5lcnMsIGRvbmUpO1xuXG4gICAgICAgICAgICB2YXIgcnVubmVyID0gbmV3ICQkQW5pbWF0ZVJ1bm5lcih7XG4gICAgICAgICAgICAgIGVuZDogZW5kRm5GYWN0b3J5KCksXG4gICAgICAgICAgICAgIGNhbmNlbDogZW5kRm5GYWN0b3J5KClcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gcnVubmVyO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBlbmRGbkZhY3RvcnkoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBmb3JFYWNoKGFuaW1hdGlvblJ1bm5lcnMsIGZ1bmN0aW9uKHJ1bm5lcikge1xuICAgICAgICAgICAgICAgICAgLy8gYXQgdGhpcyBwb2ludCB3ZSBjYW5ub3QgY2FuY2VsIGFuaW1hdGlvbnMgZm9yIGdyb3VwcyBqdXN0IHlldC4gMS41K1xuICAgICAgICAgICAgICAgICAgcnVubmVyLmVuZCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBkb25lKHN0YXR1cykge1xuICAgICAgICAgICAgICBydW5uZXIuY29tcGxldGUoc3RhdHVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcHJlcGFyZUFuaW1hdGlvbihhbmltYXRpb25EZXRhaWxzKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcHJlcGFyZUFuaW1hdGlvbihhbmltYXRpb25EZXRhaWxzKSB7XG4gICAgICAvLyBUT0RPKG1hdHNrbyk6IG1ha2Ugc3VyZSB0byBjaGVjayBmb3IgZ3JvdXBlZCBhbmltYXRpb25zIGFuZCBkZWxlZ2F0ZSBkb3duIHRvIG5vcm1hbCBhbmltYXRpb25zXG4gICAgICB2YXIgZWxlbWVudCA9IGFuaW1hdGlvbkRldGFpbHMuZWxlbWVudDtcbiAgICAgIHZhciBldmVudCA9IGFuaW1hdGlvbkRldGFpbHMuZXZlbnQ7XG4gICAgICB2YXIgb3B0aW9ucyA9IGFuaW1hdGlvbkRldGFpbHMub3B0aW9ucztcbiAgICAgIHZhciBjbGFzc2VzID0gYW5pbWF0aW9uRGV0YWlscy5jbGFzc2VzO1xuICAgICAgcmV0dXJuICQkYW5pbWF0ZUpzKGVsZW1lbnQsIGV2ZW50LCBjbGFzc2VzLCBvcHRpb25zKTtcbiAgICB9XG4gIH1dO1xufV07XG5cbnZhciBOR19BTklNQVRFX0FUVFJfTkFNRSA9ICdkYXRhLW5nLWFuaW1hdGUnO1xudmFyIE5HX0FOSU1BVEVfUElOX0RBVEEgPSAnJG5nQW5pbWF0ZVBpbic7XG52YXIgJCRBbmltYXRlUXVldWVQcm92aWRlciA9IFsnJGFuaW1hdGVQcm92aWRlcicsIGZ1bmN0aW9uKCRhbmltYXRlUHJvdmlkZXIpIHtcbiAgdmFyIFBSRV9ESUdFU1RfU1RBVEUgPSAxO1xuICB2YXIgUlVOTklOR19TVEFURSA9IDI7XG4gIHZhciBPTkVfU1BBQ0UgPSAnICc7XG5cbiAgdmFyIHJ1bGVzID0gdGhpcy5ydWxlcyA9IHtcbiAgICBza2lwOiBbXSxcbiAgICBjYW5jZWw6IFtdLFxuICAgIGpvaW46IFtdXG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZVRydXRoeUNzc0NsYXNzTWFwKGNsYXNzU3RyaW5nKSB7XG4gICAgaWYgKCFjbGFzc1N0cmluZykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGtleXMgPSBjbGFzc1N0cmluZy5zcGxpdChPTkVfU1BBQ0UpO1xuICAgIHZhciBtYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgZm9yRWFjaChrZXlzLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgIG1hcFtrZXldID0gdHJ1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gbWFwO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFzTWF0Y2hpbmdDbGFzc2VzKG5ld0NsYXNzU3RyaW5nLCBjdXJyZW50Q2xhc3NTdHJpbmcpIHtcbiAgICBpZiAobmV3Q2xhc3NTdHJpbmcgJiYgY3VycmVudENsYXNzU3RyaW5nKSB7XG4gICAgICB2YXIgY3VycmVudENsYXNzTWFwID0gbWFrZVRydXRoeUNzc0NsYXNzTWFwKGN1cnJlbnRDbGFzc1N0cmluZyk7XG4gICAgICByZXR1cm4gbmV3Q2xhc3NTdHJpbmcuc3BsaXQoT05FX1NQQUNFKS5zb21lKGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xuICAgICAgICByZXR1cm4gY3VycmVudENsYXNzTWFwW2NsYXNzTmFtZV07XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpc0FsbG93ZWQocnVsZVR5cGUsIGVsZW1lbnQsIGN1cnJlbnRBbmltYXRpb24sIHByZXZpb3VzQW5pbWF0aW9uKSB7XG4gICAgcmV0dXJuIHJ1bGVzW3J1bGVUeXBlXS5zb21lKGZ1bmN0aW9uKGZuKSB7XG4gICAgICByZXR1cm4gZm4oZWxlbWVudCwgY3VycmVudEFuaW1hdGlvbiwgcHJldmlvdXNBbmltYXRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFzQW5pbWF0aW9uQ2xhc3NlcyhhbmltYXRpb24sIGFuZCkge1xuICAgIHZhciBhID0gKGFuaW1hdGlvbi5hZGRDbGFzcyB8fCAnJykubGVuZ3RoID4gMDtcbiAgICB2YXIgYiA9IChhbmltYXRpb24ucmVtb3ZlQ2xhc3MgfHwgJycpLmxlbmd0aCA+IDA7XG4gICAgcmV0dXJuIGFuZCA/IGEgJiYgYiA6IGEgfHwgYjtcbiAgfVxuXG4gIHJ1bGVzLmpvaW4ucHVzaChmdW5jdGlvbihlbGVtZW50LCBuZXdBbmltYXRpb24sIGN1cnJlbnRBbmltYXRpb24pIHtcbiAgICAvLyBpZiB0aGUgbmV3IGFuaW1hdGlvbiBpcyBjbGFzcy1iYXNlZCB0aGVuIHdlIGNhbiBqdXN0IHRhY2sgdGhhdCBvblxuICAgIHJldHVybiAhbmV3QW5pbWF0aW9uLnN0cnVjdHVyYWwgJiYgaGFzQW5pbWF0aW9uQ2xhc3NlcyhuZXdBbmltYXRpb24pO1xuICB9KTtcblxuICBydWxlcy5za2lwLnB1c2goZnVuY3Rpb24oZWxlbWVudCwgbmV3QW5pbWF0aW9uLCBjdXJyZW50QW5pbWF0aW9uKSB7XG4gICAgLy8gdGhlcmUgaXMgbm8gbmVlZCB0byBhbmltYXRlIGFueXRoaW5nIGlmIG5vIGNsYXNzZXMgYXJlIGJlaW5nIGFkZGVkIGFuZFxuICAgIC8vIHRoZXJlIGlzIG5vIHN0cnVjdHVyYWwgYW5pbWF0aW9uIHRoYXQgd2lsbCBiZSB0cmlnZ2VyZWRcbiAgICByZXR1cm4gIW5ld0FuaW1hdGlvbi5zdHJ1Y3R1cmFsICYmICFoYXNBbmltYXRpb25DbGFzc2VzKG5ld0FuaW1hdGlvbik7XG4gIH0pO1xuXG4gIHJ1bGVzLnNraXAucHVzaChmdW5jdGlvbihlbGVtZW50LCBuZXdBbmltYXRpb24sIGN1cnJlbnRBbmltYXRpb24pIHtcbiAgICAvLyB3aHkgc2hvdWxkIHdlIHRyaWdnZXIgYSBuZXcgc3RydWN0dXJhbCBhbmltYXRpb24gaWYgdGhlIGVsZW1lbnQgd2lsbFxuICAgIC8vIGJlIHJlbW92ZWQgZnJvbSB0aGUgRE9NIGFueXdheT9cbiAgICByZXR1cm4gY3VycmVudEFuaW1hdGlvbi5ldmVudCA9PSAnbGVhdmUnICYmIG5ld0FuaW1hdGlvbi5zdHJ1Y3R1cmFsO1xuICB9KTtcblxuICBydWxlcy5za2lwLnB1c2goZnVuY3Rpb24oZWxlbWVudCwgbmV3QW5pbWF0aW9uLCBjdXJyZW50QW5pbWF0aW9uKSB7XG4gICAgLy8gaWYgdGhlcmUgaXMgYW4gb25nb2luZyBjdXJyZW50IGFuaW1hdGlvbiB0aGVuIGRvbid0IGV2ZW4gYm90aGVyIHJ1bm5pbmcgdGhlIGNsYXNzLWJhc2VkIGFuaW1hdGlvblxuICAgIHJldHVybiBjdXJyZW50QW5pbWF0aW9uLnN0cnVjdHVyYWwgJiYgY3VycmVudEFuaW1hdGlvbi5zdGF0ZSA9PT0gUlVOTklOR19TVEFURSAmJiAhbmV3QW5pbWF0aW9uLnN0cnVjdHVyYWw7XG4gIH0pO1xuXG4gIHJ1bGVzLmNhbmNlbC5wdXNoKGZ1bmN0aW9uKGVsZW1lbnQsIG5ld0FuaW1hdGlvbiwgY3VycmVudEFuaW1hdGlvbikge1xuICAgIC8vIHRoZXJlIGNhbiBuZXZlciBiZSB0d28gc3RydWN0dXJhbCBhbmltYXRpb25zIHJ1bm5pbmcgYXQgdGhlIHNhbWUgdGltZVxuICAgIHJldHVybiBjdXJyZW50QW5pbWF0aW9uLnN0cnVjdHVyYWwgJiYgbmV3QW5pbWF0aW9uLnN0cnVjdHVyYWw7XG4gIH0pO1xuXG4gIHJ1bGVzLmNhbmNlbC5wdXNoKGZ1bmN0aW9uKGVsZW1lbnQsIG5ld0FuaW1hdGlvbiwgY3VycmVudEFuaW1hdGlvbikge1xuICAgIC8vIGlmIHRoZSBwcmV2aW91cyBhbmltYXRpb24gaXMgYWxyZWFkeSBydW5uaW5nLCBidXQgdGhlIG5ldyBhbmltYXRpb24gd2lsbFxuICAgIC8vIGJlIHRyaWdnZXJlZCwgYnV0IHRoZSBuZXcgYW5pbWF0aW9uIGlzIHN0cnVjdHVyYWxcbiAgICByZXR1cm4gY3VycmVudEFuaW1hdGlvbi5zdGF0ZSA9PT0gUlVOTklOR19TVEFURSAmJiBuZXdBbmltYXRpb24uc3RydWN0dXJhbDtcbiAgfSk7XG5cbiAgcnVsZXMuY2FuY2VsLnB1c2goZnVuY3Rpb24oZWxlbWVudCwgbmV3QW5pbWF0aW9uLCBjdXJyZW50QW5pbWF0aW9uKSB7XG4gICAgdmFyIG5BID0gbmV3QW5pbWF0aW9uLmFkZENsYXNzO1xuICAgIHZhciBuUiA9IG5ld0FuaW1hdGlvbi5yZW1vdmVDbGFzcztcbiAgICB2YXIgY0EgPSBjdXJyZW50QW5pbWF0aW9uLmFkZENsYXNzO1xuICAgIHZhciBjUiA9IGN1cnJlbnRBbmltYXRpb24ucmVtb3ZlQ2xhc3M7XG5cbiAgICAvLyBlYXJseSBkZXRlY3Rpb24gdG8gc2F2ZSB0aGUgZ2xvYmFsIENQVSBzaG9ydGFnZSA6KVxuICAgIGlmICgoaXNVbmRlZmluZWQobkEpICYmIGlzVW5kZWZpbmVkKG5SKSkgfHwgKGlzVW5kZWZpbmVkKGNBKSAmJiBpc1VuZGVmaW5lZChjUikpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhhc01hdGNoaW5nQ2xhc3NlcyhuQSwgY1IpIHx8IGhhc01hdGNoaW5nQ2xhc3NlcyhuUiwgY0EpO1xuICB9KTtcblxuICB0aGlzLiRnZXQgPSBbJyQkckFGJywgJyRyb290U2NvcGUnLCAnJHJvb3RFbGVtZW50JywgJyRkb2N1bWVudCcsICckJEhhc2hNYXAnLFxuICAgICAgICAgICAgICAgJyQkYW5pbWF0aW9uJywgJyQkQW5pbWF0ZVJ1bm5lcicsICckdGVtcGxhdGVSZXF1ZXN0JywgJyQkanFMaXRlJywgJyQkZm9yY2VSZWZsb3cnLFxuICAgICAgIGZ1bmN0aW9uKCQkckFGLCAgICRyb290U2NvcGUsICAgJHJvb3RFbGVtZW50LCAgICRkb2N1bWVudCwgICAkJEhhc2hNYXAsXG4gICAgICAgICAgICAgICAgJCRhbmltYXRpb24sICAgJCRBbmltYXRlUnVubmVyLCAgICR0ZW1wbGF0ZVJlcXVlc3QsICAgJCRqcUxpdGUsICAgJCRmb3JjZVJlZmxvdykge1xuXG4gICAgdmFyIGFjdGl2ZUFuaW1hdGlvbnNMb29rdXAgPSBuZXcgJCRIYXNoTWFwKCk7XG4gICAgdmFyIGRpc2FibGVkRWxlbWVudHNMb29rdXAgPSBuZXcgJCRIYXNoTWFwKCk7XG4gICAgdmFyIGFuaW1hdGlvbnNFbmFibGVkID0gbnVsbDtcblxuICAgIGZ1bmN0aW9uIHBvc3REaWdlc3RUYXNrRmFjdG9yeSgpIHtcbiAgICAgIHZhciBwb3N0RGlnZXN0Q2FsbGVkID0gZmFsc2U7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZm4pIHtcbiAgICAgICAgLy8gd2Ugb25seSBpc3N1ZSBhIGNhbGwgdG8gcG9zdERpZ2VzdCBiZWZvcmVcbiAgICAgICAgLy8gaXQgaGFzIGZpcnN0IHBhc3NlZC4gVGhpcyBwcmV2ZW50cyBhbnkgY2FsbGJhY2tzXG4gICAgICAgIC8vIGZyb20gbm90IGZpcmluZyBvbmNlIHRoZSBhbmltYXRpb24gaGFzIGNvbXBsZXRlZFxuICAgICAgICAvLyBzaW5jZSBpdCB3aWxsIGJlIG91dCBvZiB0aGUgZGlnZXN0IGN5Y2xlLlxuICAgICAgICBpZiAocG9zdERpZ2VzdENhbGxlZCkge1xuICAgICAgICAgIGZuKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHJvb3RTY29wZS4kJHBvc3REaWdlc3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBwb3N0RGlnZXN0Q2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gV2FpdCB1bnRpbCBhbGwgZGlyZWN0aXZlIGFuZCByb3V0ZS1yZWxhdGVkIHRlbXBsYXRlcyBhcmUgZG93bmxvYWRlZCBhbmRcbiAgICAvLyBjb21waWxlZC4gVGhlICR0ZW1wbGF0ZVJlcXVlc3QudG90YWxQZW5kaW5nUmVxdWVzdHMgdmFyaWFibGUga2VlcHMgdHJhY2sgb2ZcbiAgICAvLyBhbGwgb2YgdGhlIHJlbW90ZSB0ZW1wbGF0ZXMgYmVpbmcgY3VycmVudGx5IGRvd25sb2FkZWQuIElmIHRoZXJlIGFyZSBub1xuICAgIC8vIHRlbXBsYXRlcyBjdXJyZW50bHkgZG93bmxvYWRpbmcgdGhlbiB0aGUgd2F0Y2hlciB3aWxsIHN0aWxsIGZpcmUgYW55d2F5LlxuICAgIHZhciBkZXJlZ2lzdGVyV2F0Y2ggPSAkcm9vdFNjb3BlLiR3YXRjaChcbiAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gJHRlbXBsYXRlUmVxdWVzdC50b3RhbFBlbmRpbmdSZXF1ZXN0cyA9PT0gMDsgfSxcbiAgICAgIGZ1bmN0aW9uKGlzRW1wdHkpIHtcbiAgICAgICAgaWYgKCFpc0VtcHR5KSByZXR1cm47XG4gICAgICAgIGRlcmVnaXN0ZXJXYXRjaCgpO1xuXG4gICAgICAgIC8vIE5vdyB0aGF0IGFsbCB0ZW1wbGF0ZXMgaGF2ZSBiZWVuIGRvd25sb2FkZWQsICRhbmltYXRlIHdpbGwgd2FpdCB1bnRpbFxuICAgICAgICAvLyB0aGUgcG9zdCBkaWdlc3QgcXVldWUgaXMgZW1wdHkgYmVmb3JlIGVuYWJsaW5nIGFuaW1hdGlvbnMuIEJ5IGhhdmluZyB0d29cbiAgICAgICAgLy8gY2FsbHMgdG8gJHBvc3REaWdlc3QgY2FsbHMgd2UgY2FuIGVuc3VyZSB0aGF0IHRoZSBmbGFnIGlzIGVuYWJsZWQgYXQgdGhlXG4gICAgICAgIC8vIHZlcnkgZW5kIG9mIHRoZSBwb3N0IGRpZ2VzdCBxdWV1ZS4gU2luY2UgYWxsIG9mIHRoZSBhbmltYXRpb25zIGluICRhbmltYXRlXG4gICAgICAgIC8vIHVzZSAkcG9zdERpZ2VzdCwgaXQncyBpbXBvcnRhbnQgdGhhdCB0aGUgY29kZSBiZWxvdyBleGVjdXRlcyBhdCB0aGUgZW5kLlxuICAgICAgICAvLyBUaGlzIGJhc2ljYWxseSBtZWFucyB0aGF0IHRoZSBwYWdlIGlzIGZ1bGx5IGRvd25sb2FkZWQgYW5kIGNvbXBpbGVkIGJlZm9yZVxuICAgICAgICAvLyBhbnkgYW5pbWF0aW9ucyBhcmUgdHJpZ2dlcmVkLlxuICAgICAgICAkcm9vdFNjb3BlLiQkcG9zdERpZ2VzdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAkcm9vdFNjb3BlLiQkcG9zdERpZ2VzdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIHdlIGNoZWNrIGZvciBudWxsIGRpcmVjdGx5IGluIHRoZSBldmVudCB0aGF0IHRoZSBhcHBsaWNhdGlvbiBhbHJlYWR5IGNhbGxlZFxuICAgICAgICAgICAgLy8gLmVuYWJsZWQoKSB3aXRoIHdoYXRldmVyIGFyZ3VtZW50cyB0aGF0IGl0IHByb3ZpZGVkIGl0IHdpdGhcbiAgICAgICAgICAgIGlmIChhbmltYXRpb25zRW5hYmxlZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICBhbmltYXRpb25zRW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB2YXIgY2FsbGJhY2tSZWdpc3RyeSA9IHt9O1xuXG4gICAgLy8gcmVtZW1iZXIgdGhhdCB0aGUgY2xhc3NOYW1lRmlsdGVyIGlzIHNldCBkdXJpbmcgdGhlIHByb3ZpZGVyL2NvbmZpZ1xuICAgIC8vIHN0YWdlIHRoZXJlZm9yZSB3ZSBjYW4gb3B0aW1pemUgaGVyZSBhbmQgc2V0dXAgYSBoZWxwZXIgZnVuY3Rpb25cbiAgICB2YXIgY2xhc3NOYW1lRmlsdGVyID0gJGFuaW1hdGVQcm92aWRlci5jbGFzc05hbWVGaWx0ZXIoKTtcbiAgICB2YXIgaXNBbmltYXRhYmxlQ2xhc3NOYW1lID0gIWNsYXNzTmFtZUZpbHRlclxuICAgICAgICAgICAgICA/IGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgICAgICAgICA6IGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjbGFzc05hbWVGaWx0ZXIudGVzdChjbGFzc05hbWUpO1xuICAgICAgICAgICAgICB9O1xuXG4gICAgdmFyIGFwcGx5QW5pbWF0aW9uQ2xhc3NlcyA9IGFwcGx5QW5pbWF0aW9uQ2xhc3Nlc0ZhY3RvcnkoJCRqcUxpdGUpO1xuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplQW5pbWF0aW9uRGV0YWlscyhlbGVtZW50LCBhbmltYXRpb24pIHtcbiAgICAgIHJldHVybiBtZXJnZUFuaW1hdGlvbkRldGFpbHMoZWxlbWVudCwgYW5pbWF0aW9uLCB7fSk7XG4gICAgfVxuXG4gICAgLy8gSUU5LTExIGhhcyBubyBtZXRob2QgXCJjb250YWluc1wiIGluIFNWRyBlbGVtZW50IGFuZCBpbiBOb2RlLnByb3RvdHlwZS4gQnVnICMxMDI1OS5cbiAgICB2YXIgY29udGFpbnMgPSBOb2RlLnByb3RvdHlwZS5jb250YWlucyB8fCBmdW5jdGlvbihhcmcpIHtcbiAgICAgIC8vIGpzaGludCBiaXR3aXNlOiBmYWxzZVxuICAgICAgcmV0dXJuIHRoaXMgPT09IGFyZyB8fCAhISh0aGlzLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKGFyZykgJiAxNik7XG4gICAgICAvLyBqc2hpbnQgYml0d2lzZTogdHJ1ZVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBmaW5kQ2FsbGJhY2tzKHBhcmVudCwgZWxlbWVudCwgZXZlbnQpIHtcbiAgICAgIHZhciB0YXJnZXROb2RlID0gZ2V0RG9tTm9kZShlbGVtZW50KTtcbiAgICAgIHZhciB0YXJnZXRQYXJlbnROb2RlID0gZ2V0RG9tTm9kZShwYXJlbnQpO1xuXG4gICAgICB2YXIgbWF0Y2hlcyA9IFtdO1xuICAgICAgdmFyIGVudHJpZXMgPSBjYWxsYmFja1JlZ2lzdHJ5W2V2ZW50XTtcbiAgICAgIGlmIChlbnRyaWVzKSB7XG4gICAgICAgIGZvckVhY2goZW50cmllcywgZnVuY3Rpb24oZW50cnkpIHtcbiAgICAgICAgICBpZiAoY29udGFpbnMuY2FsbChlbnRyeS5ub2RlLCB0YXJnZXROb2RlKSkge1xuICAgICAgICAgICAgbWF0Y2hlcy5wdXNoKGVudHJ5LmNhbGxiYWNrKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50ID09PSAnbGVhdmUnICYmIGNvbnRhaW5zLmNhbGwoZW50cnkubm9kZSwgdGFyZ2V0UGFyZW50Tm9kZSkpIHtcbiAgICAgICAgICAgIG1hdGNoZXMucHVzaChlbnRyeS5jYWxsYmFjayk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1hdGNoZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG9uOiBmdW5jdGlvbihldmVudCwgY29udGFpbmVyLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgbm9kZSA9IGV4dHJhY3RFbGVtZW50Tm9kZShjb250YWluZXIpO1xuICAgICAgICBjYWxsYmFja1JlZ2lzdHJ5W2V2ZW50XSA9IGNhbGxiYWNrUmVnaXN0cnlbZXZlbnRdIHx8IFtdO1xuICAgICAgICBjYWxsYmFja1JlZ2lzdHJ5W2V2ZW50XS5wdXNoKHtcbiAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFja1xuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIG9mZjogZnVuY3Rpb24oZXZlbnQsIGNvbnRhaW5lciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGVudHJpZXMgPSBjYWxsYmFja1JlZ2lzdHJ5W2V2ZW50XTtcbiAgICAgICAgaWYgKCFlbnRyaWVzKSByZXR1cm47XG5cbiAgICAgICAgY2FsbGJhY2tSZWdpc3RyeVtldmVudF0gPSBhcmd1bWVudHMubGVuZ3RoID09PSAxXG4gICAgICAgICAgICA/IG51bGxcbiAgICAgICAgICAgIDogZmlsdGVyRnJvbVJlZ2lzdHJ5KGVudHJpZXMsIGNvbnRhaW5lciwgY2FsbGJhY2spO1xuXG4gICAgICAgIGZ1bmN0aW9uIGZpbHRlckZyb21SZWdpc3RyeShsaXN0LCBtYXRjaENvbnRhaW5lciwgbWF0Y2hDYWxsYmFjaykge1xuICAgICAgICAgIHZhciBjb250YWluZXJOb2RlID0gZXh0cmFjdEVsZW1lbnROb2RlKG1hdGNoQ29udGFpbmVyKTtcbiAgICAgICAgICByZXR1cm4gbGlzdC5maWx0ZXIoZnVuY3Rpb24oZW50cnkpIHtcbiAgICAgICAgICAgIHZhciBpc01hdGNoID0gZW50cnkubm9kZSA9PT0gY29udGFpbmVyTm9kZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICghbWF0Y2hDYWxsYmFjayB8fCBlbnRyeS5jYWxsYmFjayA9PT0gbWF0Y2hDYWxsYmFjayk7XG4gICAgICAgICAgICByZXR1cm4gIWlzTWF0Y2g7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIHBpbjogZnVuY3Rpb24oZWxlbWVudCwgcGFyZW50RWxlbWVudCkge1xuICAgICAgICBhc3NlcnRBcmcoaXNFbGVtZW50KGVsZW1lbnQpLCAnZWxlbWVudCcsICdub3QgYW4gZWxlbWVudCcpO1xuICAgICAgICBhc3NlcnRBcmcoaXNFbGVtZW50KHBhcmVudEVsZW1lbnQpLCAncGFyZW50RWxlbWVudCcsICdub3QgYW4gZWxlbWVudCcpO1xuICAgICAgICBlbGVtZW50LmRhdGEoTkdfQU5JTUFURV9QSU5fREFUQSwgcGFyZW50RWxlbWVudCk7XG4gICAgICB9LFxuXG4gICAgICBwdXNoOiBmdW5jdGlvbihlbGVtZW50LCBldmVudCwgb3B0aW9ucywgZG9tT3BlcmF0aW9uKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBvcHRpb25zLmRvbU9wZXJhdGlvbiA9IGRvbU9wZXJhdGlvbjtcbiAgICAgICAgcmV0dXJuIHF1ZXVlQW5pbWF0aW9uKGVsZW1lbnQsIGV2ZW50LCBvcHRpb25zKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIHRoaXMgbWV0aG9kIGhhcyBmb3VyIHNpZ25hdHVyZXM6XG4gICAgICAvLyAgKCkgLSBnbG9iYWwgZ2V0dGVyXG4gICAgICAvLyAgKGJvb2wpIC0gZ2xvYmFsIHNldHRlclxuICAgICAgLy8gIChlbGVtZW50KSAtIGVsZW1lbnQgZ2V0dGVyXG4gICAgICAvLyAgKGVsZW1lbnQsIGJvb2wpIC0gZWxlbWVudCBzZXR0ZXI8RjM3PlxuICAgICAgZW5hYmxlZDogZnVuY3Rpb24oZWxlbWVudCwgYm9vbCkge1xuICAgICAgICB2YXIgYXJnQ291bnQgPSBhcmd1bWVudHMubGVuZ3RoO1xuXG4gICAgICAgIGlmIChhcmdDb3VudCA9PT0gMCkge1xuICAgICAgICAgIC8vICgpIC0gR2xvYmFsIGdldHRlclxuICAgICAgICAgIGJvb2wgPSAhIWFuaW1hdGlvbnNFbmFibGVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBoYXNFbGVtZW50ID0gaXNFbGVtZW50KGVsZW1lbnQpO1xuXG4gICAgICAgICAgaWYgKCFoYXNFbGVtZW50KSB7XG4gICAgICAgICAgICAvLyAoYm9vbCkgLSBHbG9iYWwgc2V0dGVyXG4gICAgICAgICAgICBib29sID0gYW5pbWF0aW9uc0VuYWJsZWQgPSAhIWVsZW1lbnQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gZ2V0RG9tTm9kZShlbGVtZW50KTtcbiAgICAgICAgICAgIHZhciByZWNvcmRFeGlzdHMgPSBkaXNhYmxlZEVsZW1lbnRzTG9va3VwLmdldChub2RlKTtcblxuICAgICAgICAgICAgaWYgKGFyZ0NvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgIC8vIChlbGVtZW50KSAtIEVsZW1lbnQgZ2V0dGVyXG4gICAgICAgICAgICAgIGJvb2wgPSAhcmVjb3JkRXhpc3RzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gKGVsZW1lbnQsIGJvb2wpIC0gRWxlbWVudCBzZXR0ZXJcbiAgICAgICAgICAgICAgZGlzYWJsZWRFbGVtZW50c0xvb2t1cC5wdXQobm9kZSwgIWJvb2wpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBib29sO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBxdWV1ZUFuaW1hdGlvbihlbGVtZW50LCBldmVudCwgaW5pdGlhbE9wdGlvbnMpIHtcbiAgICAgIC8vIHdlIGFsd2F5cyBtYWtlIGEgY29weSBvZiB0aGUgb3B0aW9ucyBzaW5jZVxuICAgICAgLy8gdGhlcmUgc2hvdWxkIG5ldmVyIGJlIGFueSBzaWRlIGVmZmVjdHMgb25cbiAgICAgIC8vIHRoZSBpbnB1dCBkYXRhIHdoZW4gcnVubmluZyBgJGFuaW1hdGVDc3NgLlxuICAgICAgdmFyIG9wdGlvbnMgPSBjb3B5KGluaXRpYWxPcHRpb25zKTtcblxuICAgICAgdmFyIG5vZGUsIHBhcmVudDtcbiAgICAgIGVsZW1lbnQgPSBzdHJpcENvbW1lbnRzRnJvbUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICBub2RlID0gZ2V0RG9tTm9kZShlbGVtZW50KTtcbiAgICAgICAgcGFyZW50ID0gZWxlbWVudC5wYXJlbnQoKTtcbiAgICAgIH1cblxuICAgICAgb3B0aW9ucyA9IHByZXBhcmVBbmltYXRpb25PcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAvLyB3ZSBjcmVhdGUgYSBmYWtlIHJ1bm5lciB3aXRoIGEgd29ya2luZyBwcm9taXNlLlxuICAgICAgLy8gVGhlc2UgbWV0aG9kcyB3aWxsIGJlY29tZSBhdmFpbGFibGUgYWZ0ZXIgdGhlIGRpZ2VzdCBoYXMgcGFzc2VkXG4gICAgICB2YXIgcnVubmVyID0gbmV3ICQkQW5pbWF0ZVJ1bm5lcigpO1xuXG4gICAgICAvLyB0aGlzIGlzIHVzZWQgdG8gdHJpZ2dlciBjYWxsYmFja3MgaW4gcG9zdERpZ2VzdCBtb2RlXG4gICAgICB2YXIgcnVuSW5OZXh0UG9zdERpZ2VzdE9yTm93ID0gcG9zdERpZ2VzdFRhc2tGYWN0b3J5KCk7XG5cbiAgICAgIGlmIChpc0FycmF5KG9wdGlvbnMuYWRkQ2xhc3MpKSB7XG4gICAgICAgIG9wdGlvbnMuYWRkQ2xhc3MgPSBvcHRpb25zLmFkZENsYXNzLmpvaW4oJyAnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuYWRkQ2xhc3MgJiYgIWlzU3RyaW5nKG9wdGlvbnMuYWRkQ2xhc3MpKSB7XG4gICAgICAgIG9wdGlvbnMuYWRkQ2xhc3MgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNBcnJheShvcHRpb25zLnJlbW92ZUNsYXNzKSkge1xuICAgICAgICBvcHRpb25zLnJlbW92ZUNsYXNzID0gb3B0aW9ucy5yZW1vdmVDbGFzcy5qb2luKCcgJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLnJlbW92ZUNsYXNzICYmICFpc1N0cmluZyhvcHRpb25zLnJlbW92ZUNsYXNzKSkge1xuICAgICAgICBvcHRpb25zLnJlbW92ZUNsYXNzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuZnJvbSAmJiAhaXNPYmplY3Qob3B0aW9ucy5mcm9tKSkge1xuICAgICAgICBvcHRpb25zLmZyb20gPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy50byAmJiAhaXNPYmplY3Qob3B0aW9ucy50bykpIHtcbiAgICAgICAgb3B0aW9ucy50byA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIHRoZXJlIGFyZSBzaXR1YXRpb25zIHdoZXJlIGEgZGlyZWN0aXZlIGlzc3VlcyBhbiBhbmltYXRpb24gZm9yXG4gICAgICAvLyBhIGpxTGl0ZSB3cmFwcGVyIHRoYXQgY29udGFpbnMgb25seSBjb21tZW50IG5vZGVzLi4uIElmIHRoaXNcbiAgICAgIC8vIGhhcHBlbnMgdGhlbiB0aGVyZSBpcyBubyB3YXkgd2UgY2FuIHBlcmZvcm0gYW4gYW5pbWF0aW9uXG4gICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgcmV0dXJuIHJ1bm5lcjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNsYXNzTmFtZSA9IFtub2RlLmNsYXNzTmFtZSwgb3B0aW9ucy5hZGRDbGFzcywgb3B0aW9ucy5yZW1vdmVDbGFzc10uam9pbignICcpO1xuICAgICAgaWYgKCFpc0FuaW1hdGFibGVDbGFzc05hbWUoY2xhc3NOYW1lKSkge1xuICAgICAgICBjbG9zZSgpO1xuICAgICAgICByZXR1cm4gcnVubmVyO1xuICAgICAgfVxuXG4gICAgICB2YXIgaXNTdHJ1Y3R1cmFsID0gWydlbnRlcicsICdtb3ZlJywgJ2xlYXZlJ10uaW5kZXhPZihldmVudCkgPj0gMDtcblxuICAgICAgLy8gdGhpcyBpcyBhIGhhcmQgZGlzYWJsZSBvZiBhbGwgYW5pbWF0aW9ucyBmb3IgdGhlIGFwcGxpY2F0aW9uIG9yIG9uXG4gICAgICAvLyB0aGUgZWxlbWVudCBpdHNlbGYsIHRoZXJlZm9yZSAgdGhlcmUgaXMgbm8gbmVlZCB0byBjb250aW51ZSBmdXJ0aGVyXG4gICAgICAvLyBwYXN0IHRoaXMgcG9pbnQgaWYgbm90IGVuYWJsZWRcbiAgICAgIC8vIEFuaW1hdGlvbnMgYXJlIGFsc28gZGlzYWJsZWQgaWYgdGhlIGRvY3VtZW50IGlzIGN1cnJlbnRseSBoaWRkZW4gKHBhZ2UgaXMgbm90IHZpc2libGVcbiAgICAgIC8vIHRvIHRoZSB1c2VyKSwgYmVjYXVzZSBicm93c2VycyBzbG93IGRvd24gb3IgZG8gbm90IGZsdXNoIGNhbGxzIHRvIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgdmFyIHNraXBBbmltYXRpb25zID0gIWFuaW1hdGlvbnNFbmFibGVkIHx8ICRkb2N1bWVudFswXS5oaWRkZW4gfHwgZGlzYWJsZWRFbGVtZW50c0xvb2t1cC5nZXQobm9kZSk7XG4gICAgICB2YXIgZXhpc3RpbmdBbmltYXRpb24gPSAoIXNraXBBbmltYXRpb25zICYmIGFjdGl2ZUFuaW1hdGlvbnNMb29rdXAuZ2V0KG5vZGUpKSB8fCB7fTtcbiAgICAgIHZhciBoYXNFeGlzdGluZ0FuaW1hdGlvbiA9ICEhZXhpc3RpbmdBbmltYXRpb24uc3RhdGU7XG5cbiAgICAgIC8vIHRoZXJlIGlzIG5vIHBvaW50IGluIHRyYXZlcnNpbmcgdGhlIHNhbWUgY29sbGVjdGlvbiBvZiBwYXJlbnQgYW5jZXN0b3JzIGlmIGEgZm9sbG93dXBcbiAgICAgIC8vIGFuaW1hdGlvbiB3aWxsIGJlIHJ1biBvbiB0aGUgc2FtZSBlbGVtZW50IHRoYXQgYWxyZWFkeSBkaWQgYWxsIHRoYXQgY2hlY2tpbmcgd29ya1xuICAgICAgaWYgKCFza2lwQW5pbWF0aW9ucyAmJiAoIWhhc0V4aXN0aW5nQW5pbWF0aW9uIHx8IGV4aXN0aW5nQW5pbWF0aW9uLnN0YXRlICE9IFBSRV9ESUdFU1RfU1RBVEUpKSB7XG4gICAgICAgIHNraXBBbmltYXRpb25zID0gIWFyZUFuaW1hdGlvbnNBbGxvd2VkKGVsZW1lbnQsIHBhcmVudCwgZXZlbnQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2tpcEFuaW1hdGlvbnMpIHtcbiAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgcmV0dXJuIHJ1bm5lcjtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzU3RydWN0dXJhbCkge1xuICAgICAgICBjbG9zZUNoaWxkQW5pbWF0aW9ucyhlbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgdmFyIG5ld0FuaW1hdGlvbiA9IHtcbiAgICAgICAgc3RydWN0dXJhbDogaXNTdHJ1Y3R1cmFsLFxuICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICBldmVudDogZXZlbnQsXG4gICAgICAgIGFkZENsYXNzOiBvcHRpb25zLmFkZENsYXNzLFxuICAgICAgICByZW1vdmVDbGFzczogb3B0aW9ucy5yZW1vdmVDbGFzcyxcbiAgICAgICAgY2xvc2U6IGNsb3NlLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICBydW5uZXI6IHJ1bm5lclxuICAgICAgfTtcblxuICAgICAgaWYgKGhhc0V4aXN0aW5nQW5pbWF0aW9uKSB7XG4gICAgICAgIHZhciBza2lwQW5pbWF0aW9uRmxhZyA9IGlzQWxsb3dlZCgnc2tpcCcsIGVsZW1lbnQsIG5ld0FuaW1hdGlvbiwgZXhpc3RpbmdBbmltYXRpb24pO1xuICAgICAgICBpZiAoc2tpcEFuaW1hdGlvbkZsYWcpIHtcbiAgICAgICAgICBpZiAoZXhpc3RpbmdBbmltYXRpb24uc3RhdGUgPT09IFJVTk5JTkdfU1RBVEUpIHtcbiAgICAgICAgICAgIGNsb3NlKCk7XG4gICAgICAgICAgICByZXR1cm4gcnVubmVyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXJnZUFuaW1hdGlvbkRldGFpbHMoZWxlbWVudCwgZXhpc3RpbmdBbmltYXRpb24sIG5ld0FuaW1hdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gZXhpc3RpbmdBbmltYXRpb24ucnVubmVyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgY2FuY2VsQW5pbWF0aW9uRmxhZyA9IGlzQWxsb3dlZCgnY2FuY2VsJywgZWxlbWVudCwgbmV3QW5pbWF0aW9uLCBleGlzdGluZ0FuaW1hdGlvbik7XG4gICAgICAgIGlmIChjYW5jZWxBbmltYXRpb25GbGFnKSB7XG4gICAgICAgICAgaWYgKGV4aXN0aW5nQW5pbWF0aW9uLnN0YXRlID09PSBSVU5OSU5HX1NUQVRFKSB7XG4gICAgICAgICAgICAvLyB0aGlzIHdpbGwgZW5kIHRoZSBhbmltYXRpb24gcmlnaHQgYXdheSBhbmQgaXQgaXMgc2FmZVxuICAgICAgICAgICAgLy8gdG8gZG8gc28gc2luY2UgdGhlIGFuaW1hdGlvbiBpcyBhbHJlYWR5IHJ1bm5pbmcgYW5kIHRoZVxuICAgICAgICAgICAgLy8gcnVubmVyIGNhbGxiYWNrIGNvZGUgd2lsbCBydW4gaW4gYXN5bmNcbiAgICAgICAgICAgIGV4aXN0aW5nQW5pbWF0aW9uLnJ1bm5lci5lbmQoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGV4aXN0aW5nQW5pbWF0aW9uLnN0cnVjdHVyYWwpIHtcbiAgICAgICAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCB0aGUgYW5pbWF0aW9uIGlzIHF1ZXVlZCBpbnRvIGEgZGlnZXN0LCBidXRcbiAgICAgICAgICAgIC8vIGhhc24ndCBzdGFydGVkIHlldC4gVGhlcmVmb3JlIGl0IGlzIHNhZmUgdG8gcnVuIHRoZSBjbG9zZVxuICAgICAgICAgICAgLy8gbWV0aG9kIHdoaWNoIHdpbGwgY2FsbCB0aGUgcnVubmVyIG1ldGhvZHMgaW4gYXN5bmMuXG4gICAgICAgICAgICBleGlzdGluZ0FuaW1hdGlvbi5jbG9zZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGlzIHdpbGwgbWVyZ2UgdGhlIG5ldyBhbmltYXRpb24gb3B0aW9ucyBpbnRvIGV4aXN0aW5nIGFuaW1hdGlvbiBvcHRpb25zXG4gICAgICAgICAgICBtZXJnZUFuaW1hdGlvbkRldGFpbHMoZWxlbWVudCwgZXhpc3RpbmdBbmltYXRpb24sIG5ld0FuaW1hdGlvbik7XG5cbiAgICAgICAgICAgIHJldHVybiBleGlzdGluZ0FuaW1hdGlvbi5ydW5uZXI7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGEgam9pbmVkIGFuaW1hdGlvbiBtZWFucyB0aGF0IHRoaXMgYW5pbWF0aW9uIHdpbGwgdGFrZSBvdmVyIHRoZSBleGlzdGluZyBvbmVcbiAgICAgICAgICAvLyBzbyBhbiBleGFtcGxlIHdvdWxkIGludm9sdmUgYSBsZWF2ZSBhbmltYXRpb24gdGFraW5nIG92ZXIgYW4gZW50ZXIuIFRoZW4gd2hlblxuICAgICAgICAgIC8vIHRoZSBwb3N0RGlnZXN0IGtpY2tzIGluIHRoZSBlbnRlciB3aWxsIGJlIGlnbm9yZWQuXG4gICAgICAgICAgdmFyIGpvaW5BbmltYXRpb25GbGFnID0gaXNBbGxvd2VkKCdqb2luJywgZWxlbWVudCwgbmV3QW5pbWF0aW9uLCBleGlzdGluZ0FuaW1hdGlvbik7XG4gICAgICAgICAgaWYgKGpvaW5BbmltYXRpb25GbGFnKSB7XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmdBbmltYXRpb24uc3RhdGUgPT09IFJVTk5JTkdfU1RBVEUpIHtcbiAgICAgICAgICAgICAgbm9ybWFsaXplQW5pbWF0aW9uRGV0YWlscyhlbGVtZW50LCBuZXdBbmltYXRpb24pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYXBwbHlHZW5lcmF0ZWRQcmVwYXJhdGlvbkNsYXNzZXMoZWxlbWVudCwgaXNTdHJ1Y3R1cmFsID8gZXZlbnQgOiBudWxsLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgICBldmVudCA9IG5ld0FuaW1hdGlvbi5ldmVudCA9IGV4aXN0aW5nQW5pbWF0aW9uLmV2ZW50O1xuICAgICAgICAgICAgICBvcHRpb25zID0gbWVyZ2VBbmltYXRpb25EZXRhaWxzKGVsZW1lbnQsIGV4aXN0aW5nQW5pbWF0aW9uLCBuZXdBbmltYXRpb24pO1xuXG4gICAgICAgICAgICAgIC8vd2UgcmV0dXJuIHRoZSBzYW1lIHJ1bm5lciBzaW5jZSBvbmx5IHRoZSBvcHRpb24gdmFsdWVzIG9mIHRoaXMgYW5pbWF0aW9uIHdpbGxcbiAgICAgICAgICAgICAgLy9iZSBmZWQgaW50byB0aGUgYGV4aXN0aW5nQW5pbWF0aW9uYC5cbiAgICAgICAgICAgICAgcmV0dXJuIGV4aXN0aW5nQW5pbWF0aW9uLnJ1bm5lcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG5vcm1hbGl6YXRpb24gaW4gdGhpcyBjYXNlIG1lYW5zIHRoYXQgaXQgcmVtb3ZlcyByZWR1bmRhbnQgQ1NTIGNsYXNzZXMgdGhhdFxuICAgICAgICAvLyBhbHJlYWR5IGV4aXN0IChhZGRDbGFzcykgb3IgZG8gbm90IGV4aXN0IChyZW1vdmVDbGFzcykgb24gdGhlIGVsZW1lbnRcbiAgICAgICAgbm9ybWFsaXplQW5pbWF0aW9uRGV0YWlscyhlbGVtZW50LCBuZXdBbmltYXRpb24pO1xuICAgICAgfVxuXG4gICAgICAvLyB3aGVuIHRoZSBvcHRpb25zIGFyZSBtZXJnZWQgYW5kIGNsZWFuZWQgdXAgd2UgbWF5IGVuZCB1cCBub3QgaGF2aW5nIHRvIGRvXG4gICAgICAvLyBhbiBhbmltYXRpb24gYXQgYWxsLCB0aGVyZWZvcmUgd2Ugc2hvdWxkIGNoZWNrIHRoaXMgYmVmb3JlIGlzc3VpbmcgYSBwb3N0XG4gICAgICAvLyBkaWdlc3QgY2FsbGJhY2suIFN0cnVjdHVyYWwgYW5pbWF0aW9ucyB3aWxsIGFsd2F5cyBydW4gbm8gbWF0dGVyIHdoYXQuXG4gICAgICB2YXIgaXNWYWxpZEFuaW1hdGlvbiA9IG5ld0FuaW1hdGlvbi5zdHJ1Y3R1cmFsO1xuICAgICAgaWYgKCFpc1ZhbGlkQW5pbWF0aW9uKSB7XG4gICAgICAgIC8vIGFuaW1hdGUgKGZyb20vdG8pIGNhbiBiZSBxdWlja2x5IGNoZWNrZWQgZmlyc3QsIG90aGVyd2lzZSB3ZSBjaGVjayBpZiBhbnkgY2xhc3NlcyBhcmUgcHJlc2VudFxuICAgICAgICBpc1ZhbGlkQW5pbWF0aW9uID0gKG5ld0FuaW1hdGlvbi5ldmVudCA9PT0gJ2FuaW1hdGUnICYmIE9iamVjdC5rZXlzKG5ld0FuaW1hdGlvbi5vcHRpb25zLnRvIHx8IHt9KS5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IGhhc0FuaW1hdGlvbkNsYXNzZXMobmV3QW5pbWF0aW9uKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc1ZhbGlkQW5pbWF0aW9uKSB7XG4gICAgICAgIGNsb3NlKCk7XG4gICAgICAgIGNsZWFyRWxlbWVudEFuaW1hdGlvblN0YXRlKGVsZW1lbnQpO1xuICAgICAgICByZXR1cm4gcnVubmVyO1xuICAgICAgfVxuXG4gICAgICAvLyB0aGUgY291bnRlciBrZWVwcyB0cmFjayBvZiBjYW5jZWxsZWQgYW5pbWF0aW9uc1xuICAgICAgdmFyIGNvdW50ZXIgPSAoZXhpc3RpbmdBbmltYXRpb24uY291bnRlciB8fCAwKSArIDE7XG4gICAgICBuZXdBbmltYXRpb24uY291bnRlciA9IGNvdW50ZXI7XG5cbiAgICAgIG1hcmtFbGVtZW50QW5pbWF0aW9uU3RhdGUoZWxlbWVudCwgUFJFX0RJR0VTVF9TVEFURSwgbmV3QW5pbWF0aW9uKTtcblxuICAgICAgJHJvb3RTY29wZS4kJHBvc3REaWdlc3QoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhbmltYXRpb25EZXRhaWxzID0gYWN0aXZlQW5pbWF0aW9uc0xvb2t1cC5nZXQobm9kZSk7XG4gICAgICAgIHZhciBhbmltYXRpb25DYW5jZWxsZWQgPSAhYW5pbWF0aW9uRGV0YWlscztcbiAgICAgICAgYW5pbWF0aW9uRGV0YWlscyA9IGFuaW1hdGlvbkRldGFpbHMgfHwge307XG5cbiAgICAgICAgLy8gaWYgYWRkQ2xhc3MvcmVtb3ZlQ2xhc3MgaXMgY2FsbGVkIGJlZm9yZSBzb21ldGhpbmcgbGlrZSBlbnRlciB0aGVuIHRoZVxuICAgICAgICAvLyByZWdpc3RlcmVkIHBhcmVudCBlbGVtZW50IG1heSBub3QgYmUgcHJlc2VudC4gVGhlIGNvZGUgYmVsb3cgd2lsbCBlbnN1cmVcbiAgICAgICAgLy8gdGhhdCBhIGZpbmFsIHZhbHVlIGZvciBwYXJlbnQgZWxlbWVudCBpcyBvYnRhaW5lZFxuICAgICAgICB2YXIgcGFyZW50RWxlbWVudCA9IGVsZW1lbnQucGFyZW50KCkgfHwgW107XG5cbiAgICAgICAgLy8gYW5pbWF0ZS9zdHJ1Y3R1cmFsL2NsYXNzLWJhc2VkIGFuaW1hdGlvbnMgYWxsIGhhdmUgcmVxdWlyZW1lbnRzLiBPdGhlcndpc2UgdGhlcmVcbiAgICAgICAgLy8gaXMgbm8gcG9pbnQgaW4gcGVyZm9ybWluZyBhbiBhbmltYXRpb24uIFRoZSBwYXJlbnQgbm9kZSBtdXN0IGFsc28gYmUgc2V0LlxuICAgICAgICB2YXIgaXNWYWxpZEFuaW1hdGlvbiA9IHBhcmVudEVsZW1lbnQubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAoYW5pbWF0aW9uRGV0YWlscy5ldmVudCA9PT0gJ2FuaW1hdGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCBhbmltYXRpb25EZXRhaWxzLnN0cnVjdHVyYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IGhhc0FuaW1hdGlvbkNsYXNzZXMoYW5pbWF0aW9uRGV0YWlscykpO1xuXG4gICAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCB0aGUgcHJldmlvdXMgYW5pbWF0aW9uIHdhcyBjYW5jZWxsZWRcbiAgICAgICAgLy8gZXZlbiBpZiB0aGUgZm9sbG93LXVwIGFuaW1hdGlvbiBpcyB0aGUgc2FtZSBldmVudFxuICAgICAgICBpZiAoYW5pbWF0aW9uQ2FuY2VsbGVkIHx8IGFuaW1hdGlvbkRldGFpbHMuY291bnRlciAhPT0gY291bnRlciB8fCAhaXNWYWxpZEFuaW1hdGlvbikge1xuICAgICAgICAgIC8vIGlmIGFub3RoZXIgYW5pbWF0aW9uIGRpZCBub3QgdGFrZSBvdmVyIHRoZW4gd2UgbmVlZFxuICAgICAgICAgIC8vIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBkb21PcGVyYXRpb24gYW5kIG9wdGlvbnMgYXJlXG4gICAgICAgICAgLy8gaGFuZGxlZCBhY2NvcmRpbmdseVxuICAgICAgICAgIGlmIChhbmltYXRpb25DYW5jZWxsZWQpIHtcbiAgICAgICAgICAgIGFwcGx5QW5pbWF0aW9uQ2xhc3NlcyhlbGVtZW50LCBvcHRpb25zKTtcbiAgICAgICAgICAgIGFwcGx5QW5pbWF0aW9uU3R5bGVzKGVsZW1lbnQsIG9wdGlvbnMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGlmIHRoZSBldmVudCBjaGFuZ2VkIGZyb20gc29tZXRoaW5nIGxpa2UgZW50ZXIgdG8gbGVhdmUgdGhlbiB3ZSBkb1xuICAgICAgICAgIC8vIGl0LCBvdGhlcndpc2UgaWYgaXQncyB0aGUgc2FtZSB0aGVuIHRoZSBlbmQgcmVzdWx0IHdpbGwgYmUgdGhlIHNhbWUgdG9vXG4gICAgICAgICAgaWYgKGFuaW1hdGlvbkNhbmNlbGxlZCB8fCAoaXNTdHJ1Y3R1cmFsICYmIGFuaW1hdGlvbkRldGFpbHMuZXZlbnQgIT09IGV2ZW50KSkge1xuICAgICAgICAgICAgb3B0aW9ucy5kb21PcGVyYXRpb24oKTtcbiAgICAgICAgICAgIHJ1bm5lci5lbmQoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBpbiB0aGUgZXZlbnQgdGhhdCB0aGUgZWxlbWVudCBhbmltYXRpb24gd2FzIG5vdCBjYW5jZWxsZWQgb3IgYSBmb2xsb3ctdXAgYW5pbWF0aW9uXG4gICAgICAgICAgLy8gaXNuJ3QgYWxsb3dlZCB0byBhbmltYXRlIGZyb20gaGVyZSB0aGVuIHdlIG5lZWQgdG8gY2xlYXIgdGhlIHN0YXRlIG9mIHRoZSBlbGVtZW50XG4gICAgICAgICAgLy8gc28gdGhhdCBhbnkgZnV0dXJlIGFuaW1hdGlvbnMgd29uJ3QgcmVhZCB0aGUgZXhwaXJlZCBhbmltYXRpb24gZGF0YS5cbiAgICAgICAgICBpZiAoIWlzVmFsaWRBbmltYXRpb24pIHtcbiAgICAgICAgICAgIGNsZWFyRWxlbWVudEFuaW1hdGlvblN0YXRlKGVsZW1lbnQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoaXMgY29tYmluZWQgbXVsdGlwbGUgY2xhc3MgdG8gYWRkQ2xhc3MgLyByZW1vdmVDbGFzcyBpbnRvIGEgc2V0Q2xhc3MgZXZlbnRcbiAgICAgICAgLy8gc28gbG9uZyBhcyBhIHN0cnVjdHVyYWwgZXZlbnQgZGlkIG5vdCB0YWtlIG92ZXIgdGhlIGFuaW1hdGlvblxuICAgICAgICBldmVudCA9ICFhbmltYXRpb25EZXRhaWxzLnN0cnVjdHVyYWwgJiYgaGFzQW5pbWF0aW9uQ2xhc3NlcyhhbmltYXRpb25EZXRhaWxzLCB0cnVlKVxuICAgICAgICAgICAgPyAnc2V0Q2xhc3MnXG4gICAgICAgICAgICA6IGFuaW1hdGlvbkRldGFpbHMuZXZlbnQ7XG5cbiAgICAgICAgbWFya0VsZW1lbnRBbmltYXRpb25TdGF0ZShlbGVtZW50LCBSVU5OSU5HX1NUQVRFKTtcbiAgICAgICAgdmFyIHJlYWxSdW5uZXIgPSAkJGFuaW1hdGlvbihlbGVtZW50LCBldmVudCwgYW5pbWF0aW9uRGV0YWlscy5vcHRpb25zKTtcblxuICAgICAgICByZWFsUnVubmVyLmRvbmUoZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgICAgICAgY2xvc2UoIXN0YXR1cyk7XG4gICAgICAgICAgdmFyIGFuaW1hdGlvbkRldGFpbHMgPSBhY3RpdmVBbmltYXRpb25zTG9va3VwLmdldChub2RlKTtcbiAgICAgICAgICBpZiAoYW5pbWF0aW9uRGV0YWlscyAmJiBhbmltYXRpb25EZXRhaWxzLmNvdW50ZXIgPT09IGNvdW50ZXIpIHtcbiAgICAgICAgICAgIGNsZWFyRWxlbWVudEFuaW1hdGlvblN0YXRlKGdldERvbU5vZGUoZWxlbWVudCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBub3RpZnlQcm9ncmVzcyhydW5uZXIsIGV2ZW50LCAnY2xvc2UnLCB7fSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHRoaXMgd2lsbCB1cGRhdGUgdGhlIHJ1bm5lcidzIGZsb3ctY29udHJvbCBldmVudHMgYmFzZWQgb25cbiAgICAgICAgLy8gdGhlIGByZWFsUnVubmVyYCBvYmplY3QuXG4gICAgICAgIHJ1bm5lci5zZXRIb3N0KHJlYWxSdW5uZXIpO1xuICAgICAgICBub3RpZnlQcm9ncmVzcyhydW5uZXIsIGV2ZW50LCAnc3RhcnQnLCB7fSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJ1bm5lcjtcblxuICAgICAgZnVuY3Rpb24gbm90aWZ5UHJvZ3Jlc3MocnVubmVyLCBldmVudCwgcGhhc2UsIGRhdGEpIHtcbiAgICAgICAgcnVuSW5OZXh0UG9zdERpZ2VzdE9yTm93KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBjYWxsYmFja3MgPSBmaW5kQ2FsbGJhY2tzKHBhcmVudCwgZWxlbWVudCwgZXZlbnQpO1xuICAgICAgICAgIGlmIChjYWxsYmFja3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBkbyBub3Qgb3B0aW1pemUgdGhpcyBjYWxsIGhlcmUgdG8gUkFGIGJlY2F1c2VcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IGtub3cgaG93IGhlYXZ5IHRoZSBjYWxsYmFjayBjb2RlIGhlcmUgd2lsbFxuICAgICAgICAgICAgLy8gYmUgYW5kIGlmIHRoaXMgY29kZSBpcyBidWZmZXJlZCB0aGVuIHRoaXMgY2FuXG4gICAgICAgICAgICAvLyBsZWFkIHRvIGEgcGVyZm9ybWFuY2UgcmVncmVzc2lvbi5cbiAgICAgICAgICAgICQkckFGKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBmb3JFYWNoKGNhbGxiYWNrcywgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlbGVtZW50LCBwaGFzZSwgZGF0YSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcnVubmVyLnByb2dyZXNzKGV2ZW50LCBwaGFzZSwgZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNsb3NlKHJlamVjdCkgeyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcbiAgICAgICAgY2xlYXJHZW5lcmF0ZWRDbGFzc2VzKGVsZW1lbnQsIG9wdGlvbnMpO1xuICAgICAgICBhcHBseUFuaW1hdGlvbkNsYXNzZXMoZWxlbWVudCwgb3B0aW9ucyk7XG4gICAgICAgIGFwcGx5QW5pbWF0aW9uU3R5bGVzKGVsZW1lbnQsIG9wdGlvbnMpO1xuICAgICAgICBvcHRpb25zLmRvbU9wZXJhdGlvbigpO1xuICAgICAgICBydW5uZXIuY29tcGxldGUoIXJlamVjdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xvc2VDaGlsZEFuaW1hdGlvbnMoZWxlbWVudCkge1xuICAgICAgdmFyIG5vZGUgPSBnZXREb21Ob2RlKGVsZW1lbnQpO1xuICAgICAgdmFyIGNoaWxkcmVuID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCdbJyArIE5HX0FOSU1BVEVfQVRUUl9OQU1FICsgJ10nKTtcbiAgICAgIGZvckVhY2goY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgIHZhciBzdGF0ZSA9IHBhcnNlSW50KGNoaWxkLmdldEF0dHJpYnV0ZShOR19BTklNQVRFX0FUVFJfTkFNRSkpO1xuICAgICAgICB2YXIgYW5pbWF0aW9uRGV0YWlscyA9IGFjdGl2ZUFuaW1hdGlvbnNMb29rdXAuZ2V0KGNoaWxkKTtcbiAgICAgICAgaWYgKGFuaW1hdGlvbkRldGFpbHMpIHtcbiAgICAgICAgICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIFJVTk5JTkdfU1RBVEU6XG4gICAgICAgICAgICAgIGFuaW1hdGlvbkRldGFpbHMucnVubmVyLmVuZCgpO1xuICAgICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgICAgICBjYXNlIFBSRV9ESUdFU1RfU1RBVEU6XG4gICAgICAgICAgICAgIGFjdGl2ZUFuaW1hdGlvbnNMb29rdXAucmVtb3ZlKGNoaWxkKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGVhckVsZW1lbnRBbmltYXRpb25TdGF0ZShlbGVtZW50KSB7XG4gICAgICB2YXIgbm9kZSA9IGdldERvbU5vZGUoZWxlbWVudCk7XG4gICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShOR19BTklNQVRFX0FUVFJfTkFNRSk7XG4gICAgICBhY3RpdmVBbmltYXRpb25zTG9va3VwLnJlbW92ZShub2RlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc01hdGNoaW5nRWxlbWVudChub2RlT3JFbG1BLCBub2RlT3JFbG1CKSB7XG4gICAgICByZXR1cm4gZ2V0RG9tTm9kZShub2RlT3JFbG1BKSA9PT0gZ2V0RG9tTm9kZShub2RlT3JFbG1CKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZuIHJldHVybnMgZmFsc2UgaWYgYW55IG9mIHRoZSBmb2xsb3dpbmcgaXMgdHJ1ZTpcbiAgICAgKiBhKSBhbmltYXRpb25zIG9uIGFueSBwYXJlbnQgZWxlbWVudCBhcmUgZGlzYWJsZWQsIGFuZCBhbmltYXRpb25zIG9uIHRoZSBlbGVtZW50IGFyZW4ndCBleHBsaWNpdGx5IGFsbG93ZWRcbiAgICAgKiBiKSBhIHBhcmVudCBlbGVtZW50IGhhcyBhbiBvbmdvaW5nIHN0cnVjdHVyYWwgYW5pbWF0aW9uLCBhbmQgYW5pbWF0ZUNoaWxkcmVuIGlzIGZhbHNlXG4gICAgICogYykgdGhlIGVsZW1lbnQgaXMgbm90IGEgY2hpbGQgb2YgdGhlIGJvZHlcbiAgICAgKiBkKSB0aGUgZWxlbWVudCBpcyBub3QgYSBjaGlsZCBvZiB0aGUgJHJvb3RFbGVtZW50XG4gICAgICovXG4gICAgZnVuY3Rpb24gYXJlQW5pbWF0aW9uc0FsbG93ZWQoZWxlbWVudCwgcGFyZW50RWxlbWVudCwgZXZlbnQpIHtcbiAgICAgIHZhciBib2R5RWxlbWVudCA9IGpxTGl0ZSgkZG9jdW1lbnRbMF0uYm9keSk7XG4gICAgICB2YXIgYm9keUVsZW1lbnREZXRlY3RlZCA9IGlzTWF0Y2hpbmdFbGVtZW50KGVsZW1lbnQsIGJvZHlFbGVtZW50KSB8fCBlbGVtZW50WzBdLm5vZGVOYW1lID09PSAnSFRNTCc7XG4gICAgICB2YXIgcm9vdEVsZW1lbnREZXRlY3RlZCA9IGlzTWF0Y2hpbmdFbGVtZW50KGVsZW1lbnQsICRyb290RWxlbWVudCk7XG4gICAgICB2YXIgcGFyZW50QW5pbWF0aW9uRGV0ZWN0ZWQgPSBmYWxzZTtcbiAgICAgIHZhciBhbmltYXRlQ2hpbGRyZW47XG4gICAgICB2YXIgZWxlbWVudERpc2FibGVkID0gZGlzYWJsZWRFbGVtZW50c0xvb2t1cC5nZXQoZ2V0RG9tTm9kZShlbGVtZW50KSk7XG5cbiAgICAgIHZhciBwYXJlbnRIb3N0ID0gZWxlbWVudC5kYXRhKE5HX0FOSU1BVEVfUElOX0RBVEEpO1xuICAgICAgaWYgKHBhcmVudEhvc3QpIHtcbiAgICAgICAgcGFyZW50RWxlbWVudCA9IHBhcmVudEhvc3Q7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChwYXJlbnRFbGVtZW50ICYmIHBhcmVudEVsZW1lbnQubGVuZ3RoKSB7XG4gICAgICAgIGlmICghcm9vdEVsZW1lbnREZXRlY3RlZCkge1xuICAgICAgICAgIC8vIGFuZ3VsYXIgZG9lc24ndCB3YW50IHRvIGF0dGVtcHQgdG8gYW5pbWF0ZSBlbGVtZW50cyBvdXRzaWRlIG9mIHRoZSBhcHBsaWNhdGlvblxuICAgICAgICAgIC8vIHRoZXJlZm9yZSB3ZSBuZWVkIHRvIGVuc3VyZSB0aGF0IHRoZSByb290RWxlbWVudCBpcyBhbiBhbmNlc3RvciBvZiB0aGUgY3VycmVudCBlbGVtZW50XG4gICAgICAgICAgcm9vdEVsZW1lbnREZXRlY3RlZCA9IGlzTWF0Y2hpbmdFbGVtZW50KHBhcmVudEVsZW1lbnQsICRyb290RWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcGFyZW50Tm9kZSA9IHBhcmVudEVsZW1lbnRbMF07XG4gICAgICAgIGlmIChwYXJlbnROb2RlLm5vZGVUeXBlICE9PSBFTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAvLyBubyBwb2ludCBpbiBpbnNwZWN0aW5nIHRoZSAjZG9jdW1lbnQgZWxlbWVudFxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRldGFpbHMgPSBhY3RpdmVBbmltYXRpb25zTG9va3VwLmdldChwYXJlbnROb2RlKSB8fCB7fTtcbiAgICAgICAgLy8gZWl0aGVyIGFuIGVudGVyLCBsZWF2ZSBvciBtb3ZlIGFuaW1hdGlvbiB3aWxsIGNvbW1lbmNlXG4gICAgICAgIC8vIHRoZXJlZm9yZSB3ZSBjYW4ndCBhbGxvdyBhbnkgYW5pbWF0aW9ucyB0byB0YWtlIHBsYWNlXG4gICAgICAgIC8vIGJ1dCBpZiBhIHBhcmVudCBhbmltYXRpb24gaXMgY2xhc3MtYmFzZWQgdGhlbiB0aGF0J3Mgb2tcbiAgICAgICAgaWYgKCFwYXJlbnRBbmltYXRpb25EZXRlY3RlZCkge1xuICAgICAgICAgIHZhciBwYXJlbnRFbGVtZW50RGlzYWJsZWQgPSBkaXNhYmxlZEVsZW1lbnRzTG9va3VwLmdldChwYXJlbnROb2RlKTtcblxuICAgICAgICAgIGlmIChwYXJlbnRFbGVtZW50RGlzYWJsZWQgPT09IHRydWUgJiYgZWxlbWVudERpc2FibGVkICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgLy8gZGlzYWJsZSBhbmltYXRpb25zIGlmIHRoZSB1c2VyIGhhc24ndCBleHBsaWNpdGx5IGVuYWJsZWQgYW5pbWF0aW9ucyBvbiB0aGVcbiAgICAgICAgICAgIC8vIGN1cnJlbnQgZWxlbWVudFxuICAgICAgICAgICAgZWxlbWVudERpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGVsZW1lbnQgaXMgZGlzYWJsZWQgdmlhIHBhcmVudCBlbGVtZW50LCBubyBuZWVkIHRvIGNoZWNrIGFueXRoaW5nIGVsc2VcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGFyZW50RWxlbWVudERpc2FibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgZWxlbWVudERpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhcmVudEFuaW1hdGlvbkRldGVjdGVkID0gZGV0YWlscy5zdHJ1Y3R1cmFsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzVW5kZWZpbmVkKGFuaW1hdGVDaGlsZHJlbikgfHwgYW5pbWF0ZUNoaWxkcmVuID09PSB0cnVlKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gcGFyZW50RWxlbWVudC5kYXRhKE5HX0FOSU1BVEVfQ0hJTERSRU5fREFUQSk7XG4gICAgICAgICAgaWYgKGlzRGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGFuaW1hdGVDaGlsZHJlbiA9IHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoZXJlIGlzIG5vIG5lZWQgdG8gY29udGludWUgdHJhdmVyc2luZyBhdCB0aGlzIHBvaW50XG4gICAgICAgIGlmIChwYXJlbnRBbmltYXRpb25EZXRlY3RlZCAmJiBhbmltYXRlQ2hpbGRyZW4gPT09IGZhbHNlKSBicmVhaztcblxuICAgICAgICBpZiAoIWJvZHlFbGVtZW50RGV0ZWN0ZWQpIHtcbiAgICAgICAgICAvLyB3ZSBhbHNvIG5lZWQgdG8gZW5zdXJlIHRoYXQgdGhlIGVsZW1lbnQgaXMgb3Igd2lsbCBiZSBhIHBhcnQgb2YgdGhlIGJvZHkgZWxlbWVudFxuICAgICAgICAgIC8vIG90aGVyd2lzZSBpdCBpcyBwb2ludGxlc3MgdG8gZXZlbiBpc3N1ZSBhbiBhbmltYXRpb24gdG8gYmUgcmVuZGVyZWRcbiAgICAgICAgICBib2R5RWxlbWVudERldGVjdGVkID0gaXNNYXRjaGluZ0VsZW1lbnQocGFyZW50RWxlbWVudCwgYm9keUVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJvZHlFbGVtZW50RGV0ZWN0ZWQgJiYgcm9vdEVsZW1lbnREZXRlY3RlZCkge1xuICAgICAgICAgIC8vIElmIGJvdGggYm9keSBhbmQgcm9vdCBoYXZlIGJlZW4gZm91bmQsIGFueSBvdGhlciBjaGVja3MgYXJlIHBvaW50bGVzcyxcbiAgICAgICAgICAvLyBhcyBubyBhbmltYXRpb24gZGF0YSBzaG91bGQgbGl2ZSBvdXRzaWRlIHRoZSBhcHBsaWNhdGlvblxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFyb290RWxlbWVudERldGVjdGVkKSB7XG4gICAgICAgICAgLy8gSWYgbm8gcm9vdEVsZW1lbnQgaXMgZGV0ZWN0ZWQsIGNoZWNrIGlmIHRoZSBwYXJlbnRFbGVtZW50IGlzIHBpbm5lZCB0byBhbm90aGVyIGVsZW1lbnRcbiAgICAgICAgICBwYXJlbnRIb3N0ID0gcGFyZW50RWxlbWVudC5kYXRhKE5HX0FOSU1BVEVfUElOX0RBVEEpO1xuICAgICAgICAgIGlmIChwYXJlbnRIb3N0KSB7XG4gICAgICAgICAgICAvLyBUaGUgcGluIHRhcmdldCBlbGVtZW50IGJlY29tZXMgdGhlIG5leHQgcGFyZW50IGVsZW1lbnRcbiAgICAgICAgICAgIHBhcmVudEVsZW1lbnQgPSBwYXJlbnRIb3N0O1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcGFyZW50RWxlbWVudCA9IHBhcmVudEVsZW1lbnQucGFyZW50KCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBhbGxvd0FuaW1hdGlvbiA9ICghcGFyZW50QW5pbWF0aW9uRGV0ZWN0ZWQgfHwgYW5pbWF0ZUNoaWxkcmVuKSAmJiBlbGVtZW50RGlzYWJsZWQgIT09IHRydWU7XG4gICAgICByZXR1cm4gYWxsb3dBbmltYXRpb24gJiYgcm9vdEVsZW1lbnREZXRlY3RlZCAmJiBib2R5RWxlbWVudERldGVjdGVkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hcmtFbGVtZW50QW5pbWF0aW9uU3RhdGUoZWxlbWVudCwgc3RhdGUsIGRldGFpbHMpIHtcbiAgICAgIGRldGFpbHMgPSBkZXRhaWxzIHx8IHt9O1xuICAgICAgZGV0YWlscy5zdGF0ZSA9IHN0YXRlO1xuXG4gICAgICB2YXIgbm9kZSA9IGdldERvbU5vZGUoZWxlbWVudCk7XG4gICAgICBub2RlLnNldEF0dHJpYnV0ZShOR19BTklNQVRFX0FUVFJfTkFNRSwgc3RhdGUpO1xuXG4gICAgICB2YXIgb2xkVmFsdWUgPSBhY3RpdmVBbmltYXRpb25zTG9va3VwLmdldChub2RlKTtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IG9sZFZhbHVlXG4gICAgICAgICAgPyBleHRlbmQob2xkVmFsdWUsIGRldGFpbHMpXG4gICAgICAgICAgOiBkZXRhaWxzO1xuICAgICAgYWN0aXZlQW5pbWF0aW9uc0xvb2t1cC5wdXQobm9kZSwgbmV3VmFsdWUpO1xuICAgIH1cbiAgfV07XG59XTtcblxudmFyICQkQW5pbWF0aW9uUHJvdmlkZXIgPSBbJyRhbmltYXRlUHJvdmlkZXInLCBmdW5jdGlvbigkYW5pbWF0ZVByb3ZpZGVyKSB7XG4gIHZhciBOR19BTklNQVRFX1JFRl9BVFRSID0gJ25nLWFuaW1hdGUtcmVmJztcblxuICB2YXIgZHJpdmVycyA9IHRoaXMuZHJpdmVycyA9IFtdO1xuXG4gIHZhciBSVU5ORVJfU1RPUkFHRV9LRVkgPSAnJCRhbmltYXRpb25SdW5uZXInO1xuXG4gIGZ1bmN0aW9uIHNldFJ1bm5lcihlbGVtZW50LCBydW5uZXIpIHtcbiAgICBlbGVtZW50LmRhdGEoUlVOTkVSX1NUT1JBR0VfS0VZLCBydW5uZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlUnVubmVyKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnJlbW92ZURhdGEoUlVOTkVSX1NUT1JBR0VfS0VZKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFJ1bm5lcihlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuZGF0YShSVU5ORVJfU1RPUkFHRV9LRVkpO1xuICB9XG5cbiAgdGhpcy4kZ2V0ID0gWyckJGpxTGl0ZScsICckcm9vdFNjb3BlJywgJyRpbmplY3RvcicsICckJEFuaW1hdGVSdW5uZXInLCAnJCRIYXNoTWFwJywgJyQkckFGU2NoZWR1bGVyJyxcbiAgICAgICBmdW5jdGlvbigkJGpxTGl0ZSwgICAkcm9vdFNjb3BlLCAgICRpbmplY3RvciwgICAkJEFuaW1hdGVSdW5uZXIsICAgJCRIYXNoTWFwLCAgICQkckFGU2NoZWR1bGVyKSB7XG5cbiAgICB2YXIgYW5pbWF0aW9uUXVldWUgPSBbXTtcbiAgICB2YXIgYXBwbHlBbmltYXRpb25DbGFzc2VzID0gYXBwbHlBbmltYXRpb25DbGFzc2VzRmFjdG9yeSgkJGpxTGl0ZSk7XG5cbiAgICBmdW5jdGlvbiBzb3J0QW5pbWF0aW9ucyhhbmltYXRpb25zKSB7XG4gICAgICB2YXIgdHJlZSA9IHsgY2hpbGRyZW46IFtdIH07XG4gICAgICB2YXIgaSwgbG9va3VwID0gbmV3ICQkSGFzaE1hcCgpO1xuXG4gICAgICAvLyB0aGlzIGlzIGRvbmUgZmlyc3QgYmVmb3JlaGFuZCBzbyB0aGF0IHRoZSBoYXNobWFwXG4gICAgICAvLyBpcyBmaWxsZWQgd2l0aCBhIGxpc3Qgb2YgdGhlIGVsZW1lbnRzIHRoYXQgd2lsbCBiZSBhbmltYXRlZFxuICAgICAgZm9yIChpID0gMDsgaSA8IGFuaW1hdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGFuaW1hdGlvbiA9IGFuaW1hdGlvbnNbaV07XG4gICAgICAgIGxvb2t1cC5wdXQoYW5pbWF0aW9uLmRvbU5vZGUsIGFuaW1hdGlvbnNbaV0gPSB7XG4gICAgICAgICAgZG9tTm9kZTogYW5pbWF0aW9uLmRvbU5vZGUsXG4gICAgICAgICAgZm46IGFuaW1hdGlvbi5mbixcbiAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBhbmltYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHByb2Nlc3NOb2RlKGFuaW1hdGlvbnNbaV0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmxhdHRlbih0cmVlKTtcblxuICAgICAgZnVuY3Rpb24gcHJvY2Vzc05vZGUoZW50cnkpIHtcbiAgICAgICAgaWYgKGVudHJ5LnByb2Nlc3NlZCkgcmV0dXJuIGVudHJ5O1xuICAgICAgICBlbnRyeS5wcm9jZXNzZWQgPSB0cnVlO1xuXG4gICAgICAgIHZhciBlbGVtZW50Tm9kZSA9IGVudHJ5LmRvbU5vZGU7XG4gICAgICAgIHZhciBwYXJlbnROb2RlID0gZWxlbWVudE5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgbG9va3VwLnB1dChlbGVtZW50Tm9kZSwgZW50cnkpO1xuXG4gICAgICAgIHZhciBwYXJlbnRFbnRyeTtcbiAgICAgICAgd2hpbGUgKHBhcmVudE5vZGUpIHtcbiAgICAgICAgICBwYXJlbnRFbnRyeSA9IGxvb2t1cC5nZXQocGFyZW50Tm9kZSk7XG4gICAgICAgICAgaWYgKHBhcmVudEVudHJ5KSB7XG4gICAgICAgICAgICBpZiAoIXBhcmVudEVudHJ5LnByb2Nlc3NlZCkge1xuICAgICAgICAgICAgICBwYXJlbnRFbnRyeSA9IHByb2Nlc3NOb2RlKHBhcmVudEVudHJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJlbnROb2RlID0gcGFyZW50Tm9kZS5wYXJlbnROb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgKHBhcmVudEVudHJ5IHx8IHRyZWUpLmNoaWxkcmVuLnB1c2goZW50cnkpO1xuICAgICAgICByZXR1cm4gZW50cnk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGZsYXR0ZW4odHJlZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB2YXIgaTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdHJlZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHF1ZXVlLnB1c2godHJlZS5jaGlsZHJlbltpXSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVtYWluaW5nTGV2ZWxFbnRyaWVzID0gcXVldWUubGVuZ3RoO1xuICAgICAgICB2YXIgbmV4dExldmVsRW50cmllcyA9IDA7XG4gICAgICAgIHZhciByb3cgPSBbXTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgZW50cnkgPSBxdWV1ZVtpXTtcbiAgICAgICAgICBpZiAocmVtYWluaW5nTGV2ZWxFbnRyaWVzIDw9IDApIHtcbiAgICAgICAgICAgIHJlbWFpbmluZ0xldmVsRW50cmllcyA9IG5leHRMZXZlbEVudHJpZXM7XG4gICAgICAgICAgICBuZXh0TGV2ZWxFbnRyaWVzID0gMDtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHJvdyk7XG4gICAgICAgICAgICByb3cgPSBbXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcm93LnB1c2goZW50cnkuZm4pO1xuICAgICAgICAgIGVudHJ5LmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGRFbnRyeSkge1xuICAgICAgICAgICAgbmV4dExldmVsRW50cmllcysrO1xuICAgICAgICAgICAgcXVldWUucHVzaChjaGlsZEVudHJ5KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZW1haW5pbmdMZXZlbEVudHJpZXMtLTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyb3cubGVuZ3RoKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2gocm93KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVE9ETyhtYXRza28pOiBkb2N1bWVudCB0aGUgc2lnbmF0dXJlIGluIGEgYmV0dGVyIHdheVxuICAgIHJldHVybiBmdW5jdGlvbihlbGVtZW50LCBldmVudCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHByZXBhcmVBbmltYXRpb25PcHRpb25zKG9wdGlvbnMpO1xuICAgICAgdmFyIGlzU3RydWN0dXJhbCA9IFsnZW50ZXInLCAnbW92ZScsICdsZWF2ZSddLmluZGV4T2YoZXZlbnQpID49IDA7XG5cbiAgICAgIC8vIHRoZXJlIGlzIG5vIGFuaW1hdGlvbiBhdCB0aGUgY3VycmVudCBtb21lbnQsIGhvd2V2ZXJcbiAgICAgIC8vIHRoZXNlIHJ1bm5lciBtZXRob2RzIHdpbGwgZ2V0IGxhdGVyIHVwZGF0ZWQgd2l0aCB0aGVcbiAgICAgIC8vIG1ldGhvZHMgbGVhZGluZyBpbnRvIHRoZSBkcml2ZXIncyBlbmQvY2FuY2VsIG1ldGhvZHNcbiAgICAgIC8vIGZvciBub3cgdGhleSBqdXN0IHN0b3AgdGhlIGFuaW1hdGlvbiBmcm9tIHN0YXJ0aW5nXG4gICAgICB2YXIgcnVubmVyID0gbmV3ICQkQW5pbWF0ZVJ1bm5lcih7XG4gICAgICAgIGVuZDogZnVuY3Rpb24oKSB7IGNsb3NlKCk7IH0sXG4gICAgICAgIGNhbmNlbDogZnVuY3Rpb24oKSB7IGNsb3NlKHRydWUpOyB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKCFkcml2ZXJzLmxlbmd0aCkge1xuICAgICAgICBjbG9zZSgpO1xuICAgICAgICByZXR1cm4gcnVubmVyO1xuICAgICAgfVxuXG4gICAgICBzZXRSdW5uZXIoZWxlbWVudCwgcnVubmVyKTtcblxuICAgICAgdmFyIGNsYXNzZXMgPSBtZXJnZUNsYXNzZXMoZWxlbWVudC5hdHRyKCdjbGFzcycpLCBtZXJnZUNsYXNzZXMob3B0aW9ucy5hZGRDbGFzcywgb3B0aW9ucy5yZW1vdmVDbGFzcykpO1xuICAgICAgdmFyIHRlbXBDbGFzc2VzID0gb3B0aW9ucy50ZW1wQ2xhc3NlcztcbiAgICAgIGlmICh0ZW1wQ2xhc3Nlcykge1xuICAgICAgICBjbGFzc2VzICs9ICcgJyArIHRlbXBDbGFzc2VzO1xuICAgICAgICBvcHRpb25zLnRlbXBDbGFzc2VzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHByZXBhcmVDbGFzc05hbWU7XG4gICAgICBpZiAoaXNTdHJ1Y3R1cmFsKSB7XG4gICAgICAgIHByZXBhcmVDbGFzc05hbWUgPSAnbmctJyArIGV2ZW50ICsgUFJFUEFSRV9DTEFTU19TVUZGSVg7XG4gICAgICAgICQkanFMaXRlLmFkZENsYXNzKGVsZW1lbnQsIHByZXBhcmVDbGFzc05hbWUpO1xuICAgICAgfVxuXG4gICAgICBhbmltYXRpb25RdWV1ZS5wdXNoKHtcbiAgICAgICAgLy8gdGhpcyBkYXRhIGlzIHVzZWQgYnkgdGhlIHBvc3REaWdlc3QgY29kZSBhbmQgcGFzc2VkIGludG9cbiAgICAgICAgLy8gdGhlIGRyaXZlciBzdGVwIGZ1bmN0aW9uXG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgIGNsYXNzZXM6IGNsYXNzZXMsXG4gICAgICAgIGV2ZW50OiBldmVudCxcbiAgICAgICAgc3RydWN0dXJhbDogaXNTdHJ1Y3R1cmFsLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICBiZWZvcmVTdGFydDogYmVmb3JlU3RhcnQsXG4gICAgICAgIGNsb3NlOiBjbG9zZVxuICAgICAgfSk7XG5cbiAgICAgIGVsZW1lbnQub24oJyRkZXN0cm95JywgaGFuZGxlRGVzdHJveWVkRWxlbWVudCk7XG5cbiAgICAgIC8vIHdlIG9ubHkgd2FudCB0aGVyZSB0byBiZSBvbmUgZnVuY3Rpb24gY2FsbGVkIHdpdGhpbiB0aGUgcG9zdCBkaWdlc3RcbiAgICAgIC8vIGJsb2NrLiBUaGlzIHdheSB3ZSBjYW4gZ3JvdXAgYW5pbWF0aW9ucyBmb3IgYWxsIHRoZSBhbmltYXRpb25zIHRoYXRcbiAgICAgIC8vIHdlcmUgYXBhcnQgb2YgdGhlIHNhbWUgcG9zdERpZ2VzdCBmbHVzaCBjYWxsLlxuICAgICAgaWYgKGFuaW1hdGlvblF1ZXVlLmxlbmd0aCA+IDEpIHJldHVybiBydW5uZXI7XG5cbiAgICAgICRyb290U2NvcGUuJCRwb3N0RGlnZXN0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYW5pbWF0aW9ucyA9IFtdO1xuICAgICAgICBmb3JFYWNoKGFuaW1hdGlvblF1ZXVlLCBmdW5jdGlvbihlbnRyeSkge1xuICAgICAgICAgIC8vIHRoZSBlbGVtZW50IHdhcyBkZXN0cm95ZWQgZWFybHkgb24gd2hpY2ggcmVtb3ZlZCB0aGUgcnVubmVyXG4gICAgICAgICAgLy8gZm9ybSBpdHMgc3RvcmFnZS4gVGhpcyBtZWFucyB3ZSBjYW4ndCBhbmltYXRlIHRoaXMgZWxlbWVudFxuICAgICAgICAgIC8vIGF0IGFsbCBhbmQgaXQgYWxyZWFkeSBoYXMgYmVlbiBjbG9zZWQgZHVlIHRvIGRlc3RydWN0aW9uLlxuICAgICAgICAgIGlmIChnZXRSdW5uZXIoZW50cnkuZWxlbWVudCkpIHtcbiAgICAgICAgICAgIGFuaW1hdGlvbnMucHVzaChlbnRyeSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVudHJ5LmNsb3NlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBub3cgYW55IGZ1dHVyZSBhbmltYXRpb25zIHdpbGwgYmUgaW4gYW5vdGhlciBwb3N0RGlnZXN0XG4gICAgICAgIGFuaW1hdGlvblF1ZXVlLmxlbmd0aCA9IDA7XG5cbiAgICAgICAgdmFyIGdyb3VwZWRBbmltYXRpb25zID0gZ3JvdXBBbmltYXRpb25zKGFuaW1hdGlvbnMpO1xuICAgICAgICB2YXIgdG9CZVNvcnRlZEFuaW1hdGlvbnMgPSBbXTtcblxuICAgICAgICBmb3JFYWNoKGdyb3VwZWRBbmltYXRpb25zLCBmdW5jdGlvbihhbmltYXRpb25FbnRyeSkge1xuICAgICAgICAgIHRvQmVTb3J0ZWRBbmltYXRpb25zLnB1c2goe1xuICAgICAgICAgICAgZG9tTm9kZTogZ2V0RG9tTm9kZShhbmltYXRpb25FbnRyeS5mcm9tID8gYW5pbWF0aW9uRW50cnkuZnJvbS5lbGVtZW50IDogYW5pbWF0aW9uRW50cnkuZWxlbWVudCksXG4gICAgICAgICAgICBmbjogZnVuY3Rpb24gdHJpZ2dlckFuaW1hdGlvblN0YXJ0KCkge1xuICAgICAgICAgICAgICAvLyBpdCdzIGltcG9ydGFudCB0aGF0IHdlIGFwcGx5IHRoZSBgbmctYW5pbWF0ZWAgQ1NTIGNsYXNzIGFuZCB0aGVcbiAgICAgICAgICAgICAgLy8gdGVtcG9yYXJ5IGNsYXNzZXMgYmVmb3JlIHdlIGRvIGFueSBkcml2ZXIgaW52b2tpbmcgc2luY2UgdGhlc2VcbiAgICAgICAgICAgICAgLy8gQ1NTIGNsYXNzZXMgbWF5IGJlIHJlcXVpcmVkIGZvciBwcm9wZXIgQ1NTIGRldGVjdGlvbi5cbiAgICAgICAgICAgICAgYW5pbWF0aW9uRW50cnkuYmVmb3JlU3RhcnQoKTtcblxuICAgICAgICAgICAgICB2YXIgc3RhcnRBbmltYXRpb25GbiwgY2xvc2VGbiA9IGFuaW1hdGlvbkVudHJ5LmNsb3NlO1xuXG4gICAgICAgICAgICAgIC8vIGluIHRoZSBldmVudCB0aGF0IHRoZSBlbGVtZW50IHdhcyByZW1vdmVkIGJlZm9yZSB0aGUgZGlnZXN0IHJ1bnMgb3JcbiAgICAgICAgICAgICAgLy8gZHVyaW5nIHRoZSBSQUYgc2VxdWVuY2luZyB0aGVuIHdlIHNob3VsZCBub3QgdHJpZ2dlciB0aGUgYW5pbWF0aW9uLlxuICAgICAgICAgICAgICB2YXIgdGFyZ2V0RWxlbWVudCA9IGFuaW1hdGlvbkVudHJ5LmFuY2hvcnNcbiAgICAgICAgICAgICAgICAgID8gKGFuaW1hdGlvbkVudHJ5LmZyb20uZWxlbWVudCB8fCBhbmltYXRpb25FbnRyeS50by5lbGVtZW50KVxuICAgICAgICAgICAgICAgICAgOiBhbmltYXRpb25FbnRyeS5lbGVtZW50O1xuXG4gICAgICAgICAgICAgIGlmIChnZXRSdW5uZXIodGFyZ2V0RWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgb3BlcmF0aW9uID0gaW52b2tlRmlyc3REcml2ZXIoYW5pbWF0aW9uRW50cnkpO1xuICAgICAgICAgICAgICAgIGlmIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgIHN0YXJ0QW5pbWF0aW9uRm4gPSBvcGVyYXRpb24uc3RhcnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKCFzdGFydEFuaW1hdGlvbkZuKSB7XG4gICAgICAgICAgICAgICAgY2xvc2VGbigpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBhbmltYXRpb25SdW5uZXIgPSBzdGFydEFuaW1hdGlvbkZuKCk7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uUnVubmVyLmRvbmUoZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICBjbG9zZUZuKCFzdGF0dXMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHVwZGF0ZUFuaW1hdGlvblJ1bm5lcnMoYW5pbWF0aW9uRW50cnksIGFuaW1hdGlvblJ1bm5lcik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gd2UgbmVlZCB0byBzb3J0IGVhY2ggb2YgdGhlIGFuaW1hdGlvbnMgaW4gb3JkZXIgb2YgcGFyZW50IHRvIGNoaWxkXG4gICAgICAgIC8vIHJlbGF0aW9uc2hpcHMuIFRoaXMgZW5zdXJlcyB0aGF0IHRoZSBjaGlsZCBjbGFzc2VzIGFyZSBhcHBsaWVkIGF0IHRoZVxuICAgICAgICAvLyByaWdodCB0aW1lLlxuICAgICAgICAkJHJBRlNjaGVkdWxlcihzb3J0QW5pbWF0aW9ucyh0b0JlU29ydGVkQW5pbWF0aW9ucykpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBydW5uZXI7XG5cbiAgICAgIC8vIFRPRE8obWF0c2tvKTogY2hhbmdlIHRvIHJlZmVyZW5jZSBub2Rlc1xuICAgICAgZnVuY3Rpb24gZ2V0QW5jaG9yTm9kZXMobm9kZSkge1xuICAgICAgICB2YXIgU0VMRUNUT1IgPSAnWycgKyBOR19BTklNQVRFX1JFRl9BVFRSICsgJ10nO1xuICAgICAgICB2YXIgaXRlbXMgPSBub2RlLmhhc0F0dHJpYnV0ZShOR19BTklNQVRFX1JFRl9BVFRSKVxuICAgICAgICAgICAgICA/IFtub2RlXVxuICAgICAgICAgICAgICA6IG5vZGUucXVlcnlTZWxlY3RvckFsbChTRUxFQ1RPUik7XG4gICAgICAgIHZhciBhbmNob3JzID0gW107XG4gICAgICAgIGZvckVhY2goaXRlbXMsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICB2YXIgYXR0ciA9IG5vZGUuZ2V0QXR0cmlidXRlKE5HX0FOSU1BVEVfUkVGX0FUVFIpO1xuICAgICAgICAgIGlmIChhdHRyICYmIGF0dHIubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbmNob3JzLnB1c2gobm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFuY2hvcnM7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGdyb3VwQW5pbWF0aW9ucyhhbmltYXRpb25zKSB7XG4gICAgICAgIHZhciBwcmVwYXJlZEFuaW1hdGlvbnMgPSBbXTtcbiAgICAgICAgdmFyIHJlZkxvb2t1cCA9IHt9O1xuICAgICAgICBmb3JFYWNoKGFuaW1hdGlvbnMsIGZ1bmN0aW9uKGFuaW1hdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgICB2YXIgZWxlbWVudCA9IGFuaW1hdGlvbi5lbGVtZW50O1xuICAgICAgICAgIHZhciBub2RlID0gZ2V0RG9tTm9kZShlbGVtZW50KTtcbiAgICAgICAgICB2YXIgZXZlbnQgPSBhbmltYXRpb24uZXZlbnQ7XG4gICAgICAgICAgdmFyIGVudGVyT3JNb3ZlID0gWydlbnRlcicsICdtb3ZlJ10uaW5kZXhPZihldmVudCkgPj0gMDtcbiAgICAgICAgICB2YXIgYW5jaG9yTm9kZXMgPSBhbmltYXRpb24uc3RydWN0dXJhbCA/IGdldEFuY2hvck5vZGVzKG5vZGUpIDogW107XG5cbiAgICAgICAgICBpZiAoYW5jaG9yTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gZW50ZXJPck1vdmUgPyAndG8nIDogJ2Zyb20nO1xuXG4gICAgICAgICAgICBmb3JFYWNoKGFuY2hvck5vZGVzLCBmdW5jdGlvbihhbmNob3IpIHtcbiAgICAgICAgICAgICAgdmFyIGtleSA9IGFuY2hvci5nZXRBdHRyaWJ1dGUoTkdfQU5JTUFURV9SRUZfQVRUUik7XG4gICAgICAgICAgICAgIHJlZkxvb2t1cFtrZXldID0gcmVmTG9va3VwW2tleV0gfHwge307XG4gICAgICAgICAgICAgIHJlZkxvb2t1cFtrZXldW2RpcmVjdGlvbl0gPSB7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uSUQ6IGluZGV4LFxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGpxTGl0ZShhbmNob3IpXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJlcGFyZWRBbmltYXRpb25zLnB1c2goYW5pbWF0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciB1c2VkSW5kaWNlc0xvb2t1cCA9IHt9O1xuICAgICAgICB2YXIgYW5jaG9yR3JvdXBzID0ge307XG4gICAgICAgIGZvckVhY2gocmVmTG9va3VwLCBmdW5jdGlvbihvcGVyYXRpb25zLCBrZXkpIHtcbiAgICAgICAgICB2YXIgZnJvbSA9IG9wZXJhdGlvbnMuZnJvbTtcbiAgICAgICAgICB2YXIgdG8gPSBvcGVyYXRpb25zLnRvO1xuXG4gICAgICAgICAgaWYgKCFmcm9tIHx8ICF0bykge1xuICAgICAgICAgICAgLy8gb25seSBvbmUgb2YgdGhlc2UgaXMgc2V0IHRoZXJlZm9yZSB3ZSBjYW4ndCBoYXZlIGFuXG4gICAgICAgICAgICAvLyBhbmNob3IgYW5pbWF0aW9uIHNpbmNlIGFsbCB0aHJlZSBwaWVjZXMgYXJlIHJlcXVpcmVkXG4gICAgICAgICAgICB2YXIgaW5kZXggPSBmcm9tID8gZnJvbS5hbmltYXRpb25JRCA6IHRvLmFuaW1hdGlvbklEO1xuICAgICAgICAgICAgdmFyIGluZGV4S2V5ID0gaW5kZXgudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGlmICghdXNlZEluZGljZXNMb29rdXBbaW5kZXhLZXldKSB7XG4gICAgICAgICAgICAgIHVzZWRJbmRpY2VzTG9va3VwW2luZGV4S2V5XSA9IHRydWU7XG4gICAgICAgICAgICAgIHByZXBhcmVkQW5pbWF0aW9ucy5wdXNoKGFuaW1hdGlvbnNbaW5kZXhdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgZnJvbUFuaW1hdGlvbiA9IGFuaW1hdGlvbnNbZnJvbS5hbmltYXRpb25JRF07XG4gICAgICAgICAgdmFyIHRvQW5pbWF0aW9uID0gYW5pbWF0aW9uc1t0by5hbmltYXRpb25JRF07XG4gICAgICAgICAgdmFyIGxvb2t1cEtleSA9IGZyb20uYW5pbWF0aW9uSUQudG9TdHJpbmcoKTtcbiAgICAgICAgICBpZiAoIWFuY2hvckdyb3Vwc1tsb29rdXBLZXldKSB7XG4gICAgICAgICAgICB2YXIgZ3JvdXAgPSBhbmNob3JHcm91cHNbbG9va3VwS2V5XSA9IHtcbiAgICAgICAgICAgICAgc3RydWN0dXJhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgYmVmb3JlU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGZyb21BbmltYXRpb24uYmVmb3JlU3RhcnQoKTtcbiAgICAgICAgICAgICAgICB0b0FuaW1hdGlvbi5iZWZvcmVTdGFydCgpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZnJvbUFuaW1hdGlvbi5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIHRvQW5pbWF0aW9uLmNsb3NlKCk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNsYXNzZXM6IGNzc0NsYXNzZXNJbnRlcnNlY3Rpb24oZnJvbUFuaW1hdGlvbi5jbGFzc2VzLCB0b0FuaW1hdGlvbi5jbGFzc2VzKSxcbiAgICAgICAgICAgICAgZnJvbTogZnJvbUFuaW1hdGlvbixcbiAgICAgICAgICAgICAgdG86IHRvQW5pbWF0aW9uLFxuICAgICAgICAgICAgICBhbmNob3JzOiBbXSAvLyBUT0RPKG1hdHNrbyk6IGNoYW5nZSB0byByZWZlcmVuY2Ugbm9kZXNcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIHRoZSBhbmNob3IgYW5pbWF0aW9ucyByZXF1aXJlIHRoYXQgdGhlIGZyb20gYW5kIHRvIGVsZW1lbnRzIGJvdGggaGF2ZSBhdCBsZWFzdFxuICAgICAgICAgICAgLy8gb25lIHNoYXJlZCBDU1MgY2xhc3Mgd2hpY2ggZWZmZWN0aXZlbHkgbWFycmllcyB0aGUgdHdvIGVsZW1lbnRzIHRvZ2V0aGVyIHRvIHVzZVxuICAgICAgICAgICAgLy8gdGhlIHNhbWUgYW5pbWF0aW9uIGRyaXZlciBhbmQgdG8gcHJvcGVybHkgc2VxdWVuY2UgdGhlIGFuY2hvciBhbmltYXRpb24uXG4gICAgICAgICAgICBpZiAoZ3JvdXAuY2xhc3Nlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgcHJlcGFyZWRBbmltYXRpb25zLnB1c2goZ3JvdXApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcHJlcGFyZWRBbmltYXRpb25zLnB1c2goZnJvbUFuaW1hdGlvbik7XG4gICAgICAgICAgICAgIHByZXBhcmVkQW5pbWF0aW9ucy5wdXNoKHRvQW5pbWF0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhbmNob3JHcm91cHNbbG9va3VwS2V5XS5hbmNob3JzLnB1c2goe1xuICAgICAgICAgICAgJ291dCc6IGZyb20uZWxlbWVudCwgJ2luJzogdG8uZWxlbWVudFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcHJlcGFyZWRBbmltYXRpb25zO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjc3NDbGFzc2VzSW50ZXJzZWN0aW9uKGEsYikge1xuICAgICAgICBhID0gYS5zcGxpdCgnICcpO1xuICAgICAgICBiID0gYi5zcGxpdCgnICcpO1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBhYSA9IGFbaV07XG4gICAgICAgICAgaWYgKGFhLnN1YnN0cmluZygwLDMpID09PSAnbmctJykgY29udGludWU7XG5cbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChhYSA9PT0gYltqXSkge1xuICAgICAgICAgICAgICBtYXRjaGVzLnB1c2goYWEpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWF0Y2hlcy5qb2luKCcgJyk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGludm9rZUZpcnN0RHJpdmVyKGFuaW1hdGlvbkRldGFpbHMpIHtcbiAgICAgICAgLy8gd2UgbG9vcCBpbiByZXZlcnNlIG9yZGVyIHNpbmNlIHRoZSBtb3JlIGdlbmVyYWwgZHJpdmVycyAobGlrZSBDU1MgYW5kIEpTKVxuICAgICAgICAvLyBtYXkgYXR0ZW1wdCBtb3JlIGVsZW1lbnRzLCBidXQgY3VzdG9tIGRyaXZlcnMgYXJlIG1vcmUgcGFydGljdWxhclxuICAgICAgICBmb3IgKHZhciBpID0gZHJpdmVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIHZhciBkcml2ZXJOYW1lID0gZHJpdmVyc1tpXTtcbiAgICAgICAgICBpZiAoISRpbmplY3Rvci5oYXMoZHJpdmVyTmFtZSkpIGNvbnRpbnVlOyAvLyBUT0RPKG1hdHNrbyk6IHJlbW92ZSB0aGlzIGNoZWNrXG5cbiAgICAgICAgICB2YXIgZmFjdG9yeSA9ICRpbmplY3Rvci5nZXQoZHJpdmVyTmFtZSk7XG4gICAgICAgICAgdmFyIGRyaXZlciA9IGZhY3RvcnkoYW5pbWF0aW9uRGV0YWlscyk7XG4gICAgICAgICAgaWYgKGRyaXZlcikge1xuICAgICAgICAgICAgcmV0dXJuIGRyaXZlcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYmVmb3JlU3RhcnQoKSB7XG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoTkdfQU5JTUFURV9DTEFTU05BTUUpO1xuICAgICAgICBpZiAodGVtcENsYXNzZXMpIHtcbiAgICAgICAgICAkJGpxTGl0ZS5hZGRDbGFzcyhlbGVtZW50LCB0ZW1wQ2xhc3Nlcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByZXBhcmVDbGFzc05hbWUpIHtcbiAgICAgICAgICAkJGpxTGl0ZS5yZW1vdmVDbGFzcyhlbGVtZW50LCBwcmVwYXJlQ2xhc3NOYW1lKTtcbiAgICAgICAgICBwcmVwYXJlQ2xhc3NOYW1lID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB1cGRhdGVBbmltYXRpb25SdW5uZXJzKGFuaW1hdGlvbiwgbmV3UnVubmVyKSB7XG4gICAgICAgIGlmIChhbmltYXRpb24uZnJvbSAmJiBhbmltYXRpb24udG8pIHtcbiAgICAgICAgICB1cGRhdGUoYW5pbWF0aW9uLmZyb20uZWxlbWVudCk7XG4gICAgICAgICAgdXBkYXRlKGFuaW1hdGlvbi50by5lbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1cGRhdGUoYW5pbWF0aW9uLmVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlKGVsZW1lbnQpIHtcbiAgICAgICAgICBnZXRSdW5uZXIoZWxlbWVudCkuc2V0SG9zdChuZXdSdW5uZXIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZURlc3Ryb3llZEVsZW1lbnQoKSB7XG4gICAgICAgIHZhciBydW5uZXIgPSBnZXRSdW5uZXIoZWxlbWVudCk7XG4gICAgICAgIGlmIChydW5uZXIgJiYgKGV2ZW50ICE9PSAnbGVhdmUnIHx8ICFvcHRpb25zLiQkZG9tT3BlcmF0aW9uRmlyZWQpKSB7XG4gICAgICAgICAgcnVubmVyLmVuZCgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNsb3NlKHJlamVjdGVkKSB7IC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICBlbGVtZW50Lm9mZignJGRlc3Ryb3knLCBoYW5kbGVEZXN0cm95ZWRFbGVtZW50KTtcbiAgICAgICAgcmVtb3ZlUnVubmVyKGVsZW1lbnQpO1xuXG4gICAgICAgIGFwcGx5QW5pbWF0aW9uQ2xhc3NlcyhlbGVtZW50LCBvcHRpb25zKTtcbiAgICAgICAgYXBwbHlBbmltYXRpb25TdHlsZXMoZWxlbWVudCwgb3B0aW9ucyk7XG4gICAgICAgIG9wdGlvbnMuZG9tT3BlcmF0aW9uKCk7XG5cbiAgICAgICAgaWYgKHRlbXBDbGFzc2VzKSB7XG4gICAgICAgICAgJCRqcUxpdGUucmVtb3ZlQ2xhc3MoZWxlbWVudCwgdGVtcENsYXNzZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcyhOR19BTklNQVRFX0NMQVNTTkFNRSk7XG4gICAgICAgIHJ1bm5lci5jb21wbGV0ZSghcmVqZWN0ZWQpO1xuICAgICAgfVxuICAgIH07XG4gIH1dO1xufV07XG5cbi8qKlxuICogQG5nZG9jIGRpcmVjdGl2ZVxuICogQG5hbWUgbmdBbmltYXRlU3dhcFxuICogQHJlc3RyaWN0IEFcbiAqIEBzY29wZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIG5nQW5pbWF0ZVN3YXAgaXMgYSBhbmltYXRpb24tb3JpZW50ZWQgZGlyZWN0aXZlIHRoYXQgYWxsb3dzIGZvciB0aGUgY29udGFpbmVyIHRvXG4gKiBiZSByZW1vdmVkIGFuZCBlbnRlcmVkIGluIHdoZW5ldmVyIHRoZSBhc3NvY2lhdGVkIGV4cHJlc3Npb24gY2hhbmdlcy4gQVxuICogY29tbW9uIHVzZWNhc2UgZm9yIHRoaXMgZGlyZWN0aXZlIGlzIGEgcm90YXRpbmcgYmFubmVyIGNvbXBvbmVudCB3aGljaFxuICogY29udGFpbnMgb25lIGltYWdlIGJlaW5nIHByZXNlbnQgYXQgYSB0aW1lLiBXaGVuIHRoZSBhY3RpdmUgaW1hZ2UgY2hhbmdlc1xuICogdGhlbiB0aGUgb2xkIGltYWdlIHdpbGwgcGVyZm9ybSBhIGBsZWF2ZWAgYW5pbWF0aW9uIGFuZCB0aGUgbmV3IGVsZW1lbnRcbiAqIHdpbGwgYmUgaW5zZXJ0ZWQgdmlhIGFuIGBlbnRlcmAgYW5pbWF0aW9uLlxuICpcbiAqIEBleGFtcGxlXG4gKiA8ZXhhbXBsZSBuYW1lPVwibmdBbmltYXRlU3dhcC1kaXJlY3RpdmVcIiBtb2R1bGU9XCJuZ0FuaW1hdGVTd2FwRXhhbXBsZVwiXG4gKiAgICAgICAgICBkZXBzPVwiYW5ndWxhci1hbmltYXRlLmpzXCJcbiAqICAgICAgICAgIGFuaW1hdGlvbnM9XCJ0cnVlXCIgZml4QmFzZT1cInRydWVcIj5cbiAqICAgPGZpbGUgbmFtZT1cImluZGV4Lmh0bWxcIj5cbiAqICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCIgbmctY29udHJvbGxlcj1cIkFwcEN0cmxcIj5cbiAqICAgICAgIDxkaXYgbmctYW5pbWF0ZS1zd2FwPVwibnVtYmVyXCIgY2xhc3M9XCJjZWxsIHN3YXAtYW5pbWF0aW9uXCIgbmctY2xhc3M9XCJjb2xvckNsYXNzKG51bWJlcilcIj5cbiAqICAgICAgICAge3sgbnVtYmVyIH19XG4gKiAgICAgICA8L2Rpdj5cbiAqICAgICA8L2Rpdj5cbiAqICAgPC9maWxlPlxuICogICA8ZmlsZSBuYW1lPVwic2NyaXB0LmpzXCI+XG4gKiAgICAgYW5ndWxhci5tb2R1bGUoJ25nQW5pbWF0ZVN3YXBFeGFtcGxlJywgWyduZ0FuaW1hdGUnXSlcbiAqICAgICAgIC5jb250cm9sbGVyKCdBcHBDdHJsJywgWyckc2NvcGUnLCAnJGludGVydmFsJywgZnVuY3Rpb24oJHNjb3BlLCAkaW50ZXJ2YWwpIHtcbiAqICAgICAgICAgJHNjb3BlLm51bWJlciA9IDA7XG4gKiAgICAgICAgICRpbnRlcnZhbChmdW5jdGlvbigpIHtcbiAqICAgICAgICAgICAkc2NvcGUubnVtYmVyKys7XG4gKiAgICAgICAgIH0sIDEwMDApO1xuICpcbiAqICAgICAgICAgdmFyIGNvbG9ycyA9IFsncmVkJywnYmx1ZScsJ2dyZWVuJywneWVsbG93Jywnb3JhbmdlJ107XG4gKiAgICAgICAgICRzY29wZS5jb2xvckNsYXNzID0gZnVuY3Rpb24obnVtYmVyKSB7XG4gKiAgICAgICAgICAgcmV0dXJuIGNvbG9yc1tudW1iZXIgJSBjb2xvcnMubGVuZ3RoXTtcbiAqICAgICAgICAgfTtcbiAqICAgICAgIH1dKTtcbiAqICAgPC9maWxlPlxuICogIDxmaWxlIG5hbWU9XCJhbmltYXRpb25zLmNzc1wiPlxuICogIC5jb250YWluZXIge1xuICogICAgaGVpZ2h0OjI1MHB4O1xuICogICAgd2lkdGg6MjUwcHg7XG4gKiAgICBwb3NpdGlvbjpyZWxhdGl2ZTtcbiAqICAgIG92ZXJmbG93OmhpZGRlbjtcbiAqICAgIGJvcmRlcjoycHggc29saWQgYmxhY2s7XG4gKiAgfVxuICogIC5jb250YWluZXIgLmNlbGwge1xuICogICAgZm9udC1zaXplOjE1MHB4O1xuICogICAgdGV4dC1hbGlnbjpjZW50ZXI7XG4gKiAgICBsaW5lLWhlaWdodDoyNTBweDtcbiAqICAgIHBvc2l0aW9uOmFic29sdXRlO1xuICogICAgdG9wOjA7XG4gKiAgICBsZWZ0OjA7XG4gKiAgICByaWdodDowO1xuICogICAgYm9yZGVyLWJvdHRvbToycHggc29saWQgYmxhY2s7XG4gKiAgfVxuICogIC5zd2FwLWFuaW1hdGlvbi5uZy1lbnRlciwgLnN3YXAtYW5pbWF0aW9uLm5nLWxlYXZlIHtcbiAqICAgIHRyYW5zaXRpb246MC41cyBsaW5lYXIgYWxsO1xuICogIH1cbiAqICAuc3dhcC1hbmltYXRpb24ubmctZW50ZXIge1xuICogICAgdG9wOi0yNTBweDtcbiAqICB9XG4gKiAgLnN3YXAtYW5pbWF0aW9uLm5nLWVudGVyLWFjdGl2ZSB7XG4gKiAgICB0b3A6MHB4O1xuICogIH1cbiAqICAuc3dhcC1hbmltYXRpb24ubmctbGVhdmUge1xuICogICAgdG9wOjBweDtcbiAqICB9XG4gKiAgLnN3YXAtYW5pbWF0aW9uLm5nLWxlYXZlLWFjdGl2ZSB7XG4gKiAgICB0b3A6MjUwcHg7XG4gKiAgfVxuICogIC5yZWQgeyBiYWNrZ3JvdW5kOnJlZDsgfVxuICogIC5ncmVlbiB7IGJhY2tncm91bmQ6Z3JlZW47IH1cbiAqICAuYmx1ZSB7IGJhY2tncm91bmQ6Ymx1ZTsgfVxuICogIC55ZWxsb3cgeyBiYWNrZ3JvdW5kOnllbGxvdzsgfVxuICogIC5vcmFuZ2UgeyBiYWNrZ3JvdW5kOm9yYW5nZTsgfVxuICogIDwvZmlsZT5cbiAqIDwvZXhhbXBsZT5cbiAqL1xudmFyIG5nQW5pbWF0ZVN3YXBEaXJlY3RpdmUgPSBbJyRhbmltYXRlJywgJyRyb290U2NvcGUnLCBmdW5jdGlvbigkYW5pbWF0ZSwgJHJvb3RTY29wZSkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgdHJhbnNjbHVkZTogJ2VsZW1lbnQnLFxuICAgIHRlcm1pbmFsOiB0cnVlLFxuICAgIHByaW9yaXR5OiA2MDAsIC8vIHdlIHVzZSA2MDAgaGVyZSB0byBlbnN1cmUgdGhhdCB0aGUgZGlyZWN0aXZlIGlzIGNhdWdodCBiZWZvcmUgb3RoZXJzXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsICRlbGVtZW50LCBhdHRycywgY3RybCwgJHRyYW5zY2x1ZGUpIHtcbiAgICAgIHZhciBwcmV2aW91c0VsZW1lbnQsIHByZXZpb3VzU2NvcGU7XG4gICAgICBzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKGF0dHJzLm5nQW5pbWF0ZVN3YXAgfHwgYXR0cnNbJ2ZvciddLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAocHJldmlvdXNFbGVtZW50KSB7XG4gICAgICAgICAgJGFuaW1hdGUubGVhdmUocHJldmlvdXNFbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJldmlvdXNTY29wZSkge1xuICAgICAgICAgIHByZXZpb3VzU2NvcGUuJGRlc3Ryb3koKTtcbiAgICAgICAgICBwcmV2aW91c1Njb3BlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUgfHwgdmFsdWUgPT09IDApIHtcbiAgICAgICAgICBwcmV2aW91c1Njb3BlID0gc2NvcGUuJG5ldygpO1xuICAgICAgICAgICR0cmFuc2NsdWRlKHByZXZpb3VzU2NvcGUsIGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHByZXZpb3VzRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgICAgICAkYW5pbWF0ZS5lbnRlcihlbGVtZW50LCBudWxsLCAkZWxlbWVudCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dO1xuXG4vKiBnbG9iYWwgYW5ndWxhckFuaW1hdGVNb2R1bGU6IHRydWUsXG5cbiAgIG5nQW5pbWF0ZVN3YXBEaXJlY3RpdmUsXG4gICAkJEFuaW1hdGVBc3luY1J1bkZhY3RvcnksXG4gICAkJHJBRlNjaGVkdWxlckZhY3RvcnksXG4gICAkJEFuaW1hdGVDaGlsZHJlbkRpcmVjdGl2ZSxcbiAgICQkQW5pbWF0ZVF1ZXVlUHJvdmlkZXIsXG4gICAkJEFuaW1hdGlvblByb3ZpZGVyLFxuICAgJEFuaW1hdGVDc3NQcm92aWRlcixcbiAgICQkQW5pbWF0ZUNzc0RyaXZlclByb3ZpZGVyLFxuICAgJCRBbmltYXRlSnNQcm92aWRlcixcbiAgICQkQW5pbWF0ZUpzRHJpdmVyUHJvdmlkZXIsXG4qL1xuXG4vKipcbiAqIEBuZ2RvYyBtb2R1bGVcbiAqIEBuYW1lIG5nQW5pbWF0ZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogVGhlIGBuZ0FuaW1hdGVgIG1vZHVsZSBwcm92aWRlcyBzdXBwb3J0IGZvciBDU1MtYmFzZWQgYW5pbWF0aW9ucyAoa2V5ZnJhbWVzIGFuZCB0cmFuc2l0aW9ucykgYXMgd2VsbCBhcyBKYXZhU2NyaXB0LWJhc2VkIGFuaW1hdGlvbnMgdmlhXG4gKiBjYWxsYmFjayBob29rcy4gQW5pbWF0aW9ucyBhcmUgbm90IGVuYWJsZWQgYnkgZGVmYXVsdCwgaG93ZXZlciwgYnkgaW5jbHVkaW5nIGBuZ0FuaW1hdGVgIHRoZSBhbmltYXRpb24gaG9va3MgYXJlIGVuYWJsZWQgZm9yIGFuIEFuZ3VsYXIgYXBwLlxuICpcbiAqIDxkaXYgZG9jLW1vZHVsZS1jb21wb25lbnRzPVwibmdBbmltYXRlXCI+PC9kaXY+XG4gKlxuICogIyBVc2FnZVxuICogU2ltcGx5IHB1dCwgdGhlcmUgYXJlIHR3byB3YXlzIHRvIG1ha2UgdXNlIG9mIGFuaW1hdGlvbnMgd2hlbiBuZ0FuaW1hdGUgaXMgdXNlZDogYnkgdXNpbmcgKipDU1MqKiBhbmQgKipKYXZhU2NyaXB0KiouIFRoZSBmb3JtZXIgd29ya3MgcHVyZWx5IGJhc2VkXG4gKiB1c2luZyBDU1MgKGJ5IHVzaW5nIG1hdGNoaW5nIENTUyBzZWxlY3RvcnMvc3R5bGVzKSBhbmQgdGhlIGxhdHRlciB0cmlnZ2VycyBhbmltYXRpb25zIHRoYXQgYXJlIHJlZ2lzdGVyZWQgdmlhIGBtb2R1bGUuYW5pbWF0aW9uKClgLiBGb3JcbiAqIGJvdGggQ1NTIGFuZCBKUyBhbmltYXRpb25zIHRoZSBzb2xlIHJlcXVpcmVtZW50IGlzIHRvIGhhdmUgYSBtYXRjaGluZyBgQ1NTIGNsYXNzYCB0aGF0IGV4aXN0cyBib3RoIGluIHRoZSByZWdpc3RlcmVkIGFuaW1hdGlvbiBhbmQgd2l0aGluXG4gKiB0aGUgSFRNTCBlbGVtZW50IHRoYXQgdGhlIGFuaW1hdGlvbiB3aWxsIGJlIHRyaWdnZXJlZCBvbi5cbiAqXG4gKiAjIyBEaXJlY3RpdmUgU3VwcG9ydFxuICogVGhlIGZvbGxvd2luZyBkaXJlY3RpdmVzIGFyZSBcImFuaW1hdGlvbiBhd2FyZVwiOlxuICpcbiAqIHwgRGlyZWN0aXZlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBTdXBwb3J0ZWQgQW5pbWF0aW9ucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XG4gKiB8IHtAbGluayBuZy5kaXJlY3RpdmU6bmdSZXBlYXQjYW5pbWF0aW9ucyBuZ1JlcGVhdH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgZW50ZXIsIGxlYXZlIGFuZCBtb3ZlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwge0BsaW5rIG5nUm91dGUuZGlyZWN0aXZlOm5nVmlldyNhbmltYXRpb25zIG5nVmlld30gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBlbnRlciBhbmQgbGVhdmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCB7QGxpbmsgbmcuZGlyZWN0aXZlOm5nSW5jbHVkZSNhbmltYXRpb25zIG5nSW5jbHVkZX0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGVudGVyIGFuZCBsZWF2ZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IHtAbGluayBuZy5kaXJlY3RpdmU6bmdTd2l0Y2gjYW5pbWF0aW9ucyBuZ1N3aXRjaH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgZW50ZXIgYW5kIGxlYXZlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwge0BsaW5rIG5nLmRpcmVjdGl2ZTpuZ0lmI2FuaW1hdGlvbnMgbmdJZn0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBlbnRlciBhbmQgbGVhdmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCB7QGxpbmsgbmcuZGlyZWN0aXZlOm5nQ2xhc3MjYW5pbWF0aW9ucyBuZ0NsYXNzfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGFkZCBhbmQgcmVtb3ZlICh0aGUgQ1NTIGNsYXNzKGVzKSBwcmVzZW50KSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IHtAbGluayBuZy5kaXJlY3RpdmU6bmdTaG93I2FuaW1hdGlvbnMgbmdTaG93fSAmIHtAbGluayBuZy5kaXJlY3RpdmU6bmdIaWRlI2FuaW1hdGlvbnMgbmdIaWRlfSAgICAgICAgICAgIHwgYWRkIGFuZCByZW1vdmUgKHRoZSBuZy1oaWRlIGNsYXNzIHZhbHVlKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwge0BsaW5rIG5nLmRpcmVjdGl2ZTpmb3JtI2FuaW1hdGlvbi1ob29rcyBmb3JtfSAmIHtAbGluayBuZy5kaXJlY3RpdmU6bmdNb2RlbCNhbmltYXRpb24taG9va3MgbmdNb2RlbH0gICAgfCBhZGQgYW5kIHJlbW92ZSAoZGlydHksIHByaXN0aW5lLCB2YWxpZCwgaW52YWxpZCAmIGFsbCBvdGhlciB2YWxpZGF0aW9ucykgfFxuICogfCB7QGxpbmsgbW9kdWxlOm5nTWVzc2FnZXMjYW5pbWF0aW9ucyBuZ01lc3NhZ2VzfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGFkZCBhbmQgcmVtb3ZlIChuZy1hY3RpdmUgJiBuZy1pbmFjdGl2ZSkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IHtAbGluayBtb2R1bGU6bmdNZXNzYWdlcyNhbmltYXRpb25zIG5nTWVzc2FnZX0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgZW50ZXIgYW5kIGxlYXZlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqXG4gKiAoTW9yZSBpbmZvcm1hdGlvbiBjYW4gYmUgZm91bmQgYnkgdmlzaXRpbmcgZWFjaCB0aGUgZG9jdW1lbnRhdGlvbiBhc3NvY2lhdGVkIHdpdGggZWFjaCBkaXJlY3RpdmUuKVxuICpcbiAqICMjIENTUy1iYXNlZCBBbmltYXRpb25zXG4gKlxuICogQ1NTLWJhc2VkIGFuaW1hdGlvbnMgd2l0aCBuZ0FuaW1hdGUgYXJlIHVuaXF1ZSBzaW5jZSB0aGV5IHJlcXVpcmUgbm8gSmF2YVNjcmlwdCBjb2RlIGF0IGFsbC4gQnkgdXNpbmcgYSBDU1MgY2xhc3MgdGhhdCB3ZSByZWZlcmVuY2UgYmV0d2VlbiBvdXIgSFRNTFxuICogYW5kIENTUyBjb2RlIHdlIGNhbiBjcmVhdGUgYW4gYW5pbWF0aW9uIHRoYXQgd2lsbCBiZSBwaWNrZWQgdXAgYnkgQW5ndWxhciB3aGVuIGFuIHRoZSB1bmRlcmx5aW5nIGRpcmVjdGl2ZSBwZXJmb3JtcyBhbiBvcGVyYXRpb24uXG4gKlxuICogVGhlIGV4YW1wbGUgYmVsb3cgc2hvd3MgaG93IGFuIGBlbnRlcmAgYW5pbWF0aW9uIGNhbiBiZSBtYWRlIHBvc3NpYmxlIG9uIGFuIGVsZW1lbnQgdXNpbmcgYG5nLWlmYDpcbiAqXG4gKiBgYGBodG1sXG4gKiA8ZGl2IG5nLWlmPVwiYm9vbFwiIGNsYXNzPVwiZmFkZVwiPlxuICogICAgRmFkZSBtZSBpbiBvdXRcbiAqIDwvZGl2PlxuICogPGJ1dHRvbiBuZy1jbGljaz1cImJvb2w9dHJ1ZVwiPkZhZGUgSW4hPC9idXR0b24+XG4gKiA8YnV0dG9uIG5nLWNsaWNrPVwiYm9vbD1mYWxzZVwiPkZhZGUgT3V0ITwvYnV0dG9uPlxuICogYGBgXG4gKlxuICogTm90aWNlIHRoZSBDU1MgY2xhc3MgKipmYWRlKio/IFdlIGNhbiBub3cgY3JlYXRlIHRoZSBDU1MgdHJhbnNpdGlvbiBjb2RlIHRoYXQgcmVmZXJlbmNlcyB0aGlzIGNsYXNzOlxuICpcbiAqIGBgYGNzc1xuICogLyYjNDI7IFRoZSBzdGFydGluZyBDU1Mgc3R5bGVzIGZvciB0aGUgZW50ZXIgYW5pbWF0aW9uICYjNDI7L1xuICogLmZhZGUubmctZW50ZXIge1xuICogICB0cmFuc2l0aW9uOjAuNXMgbGluZWFyIGFsbDtcbiAqICAgb3BhY2l0eTowO1xuICogfVxuICpcbiAqIC8mIzQyOyBUaGUgZmluaXNoaW5nIENTUyBzdHlsZXMgZm9yIHRoZSBlbnRlciBhbmltYXRpb24gJiM0MjsvXG4gKiAuZmFkZS5uZy1lbnRlci5uZy1lbnRlci1hY3RpdmUge1xuICogICBvcGFjaXR5OjE7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGUga2V5IHRoaW5nIHRvIHJlbWVtYmVyIGhlcmUgaXMgdGhhdCwgZGVwZW5kaW5nIG9uIHRoZSBhbmltYXRpb24gZXZlbnQgKHdoaWNoIGVhY2ggb2YgdGhlIGRpcmVjdGl2ZXMgYWJvdmUgdHJpZ2dlciBkZXBlbmRpbmcgb24gd2hhdCdzIGdvaW5nIG9uKSB0d29cbiAqIGdlbmVyYXRlZCBDU1MgY2xhc3NlcyB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQ7IGluIHRoZSBleGFtcGxlIGFib3ZlIHdlIGhhdmUgYC5uZy1lbnRlcmAgYW5kIGAubmctZW50ZXItYWN0aXZlYC4gRm9yIENTUyB0cmFuc2l0aW9ucywgdGhlIHRyYW5zaXRpb25cbiAqIGNvZGUgKiptdXN0KiogYmUgZGVmaW5lZCB3aXRoaW4gdGhlIHN0YXJ0aW5nIENTUyBjbGFzcyAoaW4gdGhpcyBjYXNlIGAubmctZW50ZXJgKS4gVGhlIGRlc3RpbmF0aW9uIGNsYXNzIGlzIHdoYXQgdGhlIHRyYW5zaXRpb24gd2lsbCBhbmltYXRlIHRvd2FyZHMuXG4gKlxuICogSWYgZm9yIGV4YW1wbGUgd2Ugd2FudGVkIHRvIGNyZWF0ZSBhbmltYXRpb25zIGZvciBgbGVhdmVgIGFuZCBgbW92ZWAgKG5nUmVwZWF0IHRyaWdnZXJzIG1vdmUpIHRoZW4gd2UgY2FuIGRvIHNvIHVzaW5nIHRoZSBzYW1lIENTUyBuYW1pbmcgY29udmVudGlvbnM6XG4gKlxuICogYGBgY3NzXG4gKiAvJiM0Mjsgbm93IHRoZSBlbGVtZW50IHdpbGwgZmFkZSBvdXQgYmVmb3JlIGl0IGlzIHJlbW92ZWQgZnJvbSB0aGUgRE9NICYjNDI7L1xuICogLmZhZGUubmctbGVhdmUge1xuICogICB0cmFuc2l0aW9uOjAuNXMgbGluZWFyIGFsbDtcbiAqICAgb3BhY2l0eToxO1xuICogfVxuICogLmZhZGUubmctbGVhdmUubmctbGVhdmUtYWN0aXZlIHtcbiAqICAgb3BhY2l0eTowO1xuICogfVxuICogYGBgXG4gKlxuICogV2UgY2FuIGFsc28gbWFrZSB1c2Ugb2YgKipDU1MgS2V5ZnJhbWVzKiogYnkgcmVmZXJlbmNpbmcgdGhlIGtleWZyYW1lIGFuaW1hdGlvbiB3aXRoaW4gdGhlIHN0YXJ0aW5nIENTUyBjbGFzczpcbiAqXG4gKiBgYGBjc3NcbiAqIC8mIzQyOyB0aGVyZSBpcyBubyBuZWVkIHRvIGRlZmluZSBhbnl0aGluZyBpbnNpZGUgb2YgdGhlIGRlc3RpbmF0aW9uXG4gKiBDU1MgY2xhc3Mgc2luY2UgdGhlIGtleWZyYW1lIHdpbGwgdGFrZSBjaGFyZ2Ugb2YgdGhlIGFuaW1hdGlvbiAmIzQyOy9cbiAqIC5mYWRlLm5nLWxlYXZlIHtcbiAqICAgYW5pbWF0aW9uOiBteV9mYWRlX2FuaW1hdGlvbiAwLjVzIGxpbmVhcjtcbiAqICAgLXdlYmtpdC1hbmltYXRpb246IG15X2ZhZGVfYW5pbWF0aW9uIDAuNXMgbGluZWFyO1xuICogfVxuICpcbiAqIEBrZXlmcmFtZXMgbXlfZmFkZV9hbmltYXRpb24ge1xuICogICBmcm9tIHsgb3BhY2l0eToxOyB9XG4gKiAgIHRvIHsgb3BhY2l0eTowOyB9XG4gKiB9XG4gKlxuICogQC13ZWJraXQta2V5ZnJhbWVzIG15X2ZhZGVfYW5pbWF0aW9uIHtcbiAqICAgZnJvbSB7IG9wYWNpdHk6MTsgfVxuICogICB0byB7IG9wYWNpdHk6MDsgfVxuICogfVxuICogYGBgXG4gKlxuICogRmVlbCBmcmVlIGFsc28gbWl4IHRyYW5zaXRpb25zIGFuZCBrZXlmcmFtZXMgdG9nZXRoZXIgYXMgd2VsbCBhcyBhbnkgb3RoZXIgQ1NTIGNsYXNzZXMgb24gdGhlIHNhbWUgZWxlbWVudC5cbiAqXG4gKiAjIyMgQ1NTIENsYXNzLWJhc2VkIEFuaW1hdGlvbnNcbiAqXG4gKiBDbGFzcy1iYXNlZCBhbmltYXRpb25zIChhbmltYXRpb25zIHRoYXQgYXJlIHRyaWdnZXJlZCB2aWEgYG5nQ2xhc3NgLCBgbmdTaG93YCwgYG5nSGlkZWAgYW5kIHNvbWUgb3RoZXIgZGlyZWN0aXZlcykgaGF2ZSBhIHNsaWdodGx5IGRpZmZlcmVudFxuICogbmFtaW5nIGNvbnZlbnRpb24uIENsYXNzLWJhc2VkIGFuaW1hdGlvbnMgYXJlIGJhc2ljIGVub3VnaCB0aGF0IGEgc3RhbmRhcmQgdHJhbnNpdGlvbiBvciBrZXlmcmFtZSBjYW4gYmUgcmVmZXJlbmNlZCBvbiB0aGUgY2xhc3MgYmVpbmcgYWRkZWRcbiAqIGFuZCByZW1vdmVkLlxuICpcbiAqIEZvciBleGFtcGxlIGlmIHdlIHdhbnRlZCB0byBkbyBhIENTUyBhbmltYXRpb24gZm9yIGBuZ0hpZGVgIHRoZW4gd2UgcGxhY2UgYW4gYW5pbWF0aW9uIG9uIHRoZSBgLm5nLWhpZGVgIENTUyBjbGFzczpcbiAqXG4gKiBgYGBodG1sXG4gKiA8ZGl2IG5nLXNob3c9XCJib29sXCIgY2xhc3M9XCJmYWRlXCI+XG4gKiAgIFNob3cgYW5kIGhpZGUgbWVcbiAqIDwvZGl2PlxuICogPGJ1dHRvbiBuZy1jbGljaz1cImJvb2w9dHJ1ZVwiPlRvZ2dsZTwvYnV0dG9uPlxuICpcbiAqIDxzdHlsZT5cbiAqIC5mYWRlLm5nLWhpZGUge1xuICogICB0cmFuc2l0aW9uOjAuNXMgbGluZWFyIGFsbDtcbiAqICAgb3BhY2l0eTowO1xuICogfVxuICogPC9zdHlsZT5cbiAqIGBgYFxuICpcbiAqIEFsbCB0aGF0IGlzIGdvaW5nIG9uIGhlcmUgd2l0aCBuZ1Nob3cvbmdIaWRlIGJlaGluZCB0aGUgc2NlbmVzIGlzIHRoZSBgLm5nLWhpZGVgIGNsYXNzIGlzIGFkZGVkL3JlbW92ZWQgKHdoZW4gdGhlIGhpZGRlbiBzdGF0ZSBpcyB2YWxpZCkuIFNpbmNlXG4gKiBuZ1Nob3cgYW5kIG5nSGlkZSBhcmUgYW5pbWF0aW9uIGF3YXJlIHRoZW4gd2UgY2FuIG1hdGNoIHVwIGEgdHJhbnNpdGlvbiBhbmQgbmdBbmltYXRlIGhhbmRsZXMgdGhlIHJlc3QuXG4gKlxuICogSW4gYWRkaXRpb24gdGhlIGFkZGl0aW9uIGFuZCByZW1vdmFsIG9mIHRoZSBDU1MgY2xhc3MsIG5nQW5pbWF0ZSBhbHNvIHByb3ZpZGVzIHR3byBoZWxwZXIgbWV0aG9kcyB0aGF0IHdlIGNhbiB1c2UgdG8gZnVydGhlciBkZWNvcmF0ZSB0aGUgYW5pbWF0aW9uXG4gKiB3aXRoIENTUyBzdHlsZXMuXG4gKlxuICogYGBgaHRtbFxuICogPGRpdiBuZy1jbGFzcz1cIntvbjpvbk9mZn1cIiBjbGFzcz1cImhpZ2hsaWdodFwiPlxuICogICBIaWdobGlnaHQgdGhpcyBib3hcbiAqIDwvZGl2PlxuICogPGJ1dHRvbiBuZy1jbGljaz1cIm9uT2ZmPSFvbk9mZlwiPlRvZ2dsZTwvYnV0dG9uPlxuICpcbiAqIDxzdHlsZT5cbiAqIC5oaWdobGlnaHQge1xuICogICB0cmFuc2l0aW9uOjAuNXMgbGluZWFyIGFsbDtcbiAqIH1cbiAqIC5oaWdobGlnaHQub24tYWRkIHtcbiAqICAgYmFja2dyb3VuZDp3aGl0ZTtcbiAqIH1cbiAqIC5oaWdobGlnaHQub24ge1xuICogICBiYWNrZ3JvdW5kOnllbGxvdztcbiAqIH1cbiAqIC5oaWdobGlnaHQub24tcmVtb3ZlIHtcbiAqICAgYmFja2dyb3VuZDpibGFjaztcbiAqIH1cbiAqIDwvc3R5bGU+XG4gKiBgYGBcbiAqXG4gKiBXZSBjYW4gYWxzbyBtYWtlIHVzZSBvZiBDU1Mga2V5ZnJhbWVzIGJ5IHBsYWNpbmcgdGhlbSB3aXRoaW4gdGhlIENTUyBjbGFzc2VzLlxuICpcbiAqXG4gKiAjIyMgQ1NTIFN0YWdnZXJpbmcgQW5pbWF0aW9uc1xuICogQSBTdGFnZ2VyaW5nIGFuaW1hdGlvbiBpcyBhIGNvbGxlY3Rpb24gb2YgYW5pbWF0aW9ucyB0aGF0IGFyZSBpc3N1ZWQgd2l0aCBhIHNsaWdodCBkZWxheSBpbiBiZXR3ZWVuIGVhY2ggc3VjY2Vzc2l2ZSBvcGVyYXRpb24gcmVzdWx0aW5nIGluIGFcbiAqIGN1cnRhaW4tbGlrZSBlZmZlY3QuIFRoZSBuZ0FuaW1hdGUgbW9kdWxlICh2ZXJzaW9ucyA+PTEuMikgc3VwcG9ydHMgc3RhZ2dlcmluZyBhbmltYXRpb25zIGFuZCB0aGUgc3RhZ2dlciBlZmZlY3QgY2FuIGJlXG4gKiBwZXJmb3JtZWQgYnkgY3JlYXRpbmcgYSAqKm5nLUVWRU5ULXN0YWdnZXIqKiBDU1MgY2xhc3MgYW5kIGF0dGFjaGluZyB0aGF0IGNsYXNzIHRvIHRoZSBiYXNlIENTUyBjbGFzcyB1c2VkIGZvclxuICogdGhlIGFuaW1hdGlvbi4gVGhlIHN0eWxlIHByb3BlcnR5IGV4cGVjdGVkIHdpdGhpbiB0aGUgc3RhZ2dlciBjbGFzcyBjYW4gZWl0aGVyIGJlIGEgKip0cmFuc2l0aW9uLWRlbGF5Kiogb3IgYW5cbiAqICoqYW5pbWF0aW9uLWRlbGF5KiogcHJvcGVydHkgKG9yIGJvdGggaWYgeW91ciBhbmltYXRpb24gY29udGFpbnMgYm90aCB0cmFuc2l0aW9ucyBhbmQga2V5ZnJhbWUgYW5pbWF0aW9ucykuXG4gKlxuICogYGBgY3NzXG4gKiAubXktYW5pbWF0aW9uLm5nLWVudGVyIHtcbiAqICAgLyYjNDI7IHN0YW5kYXJkIHRyYW5zaXRpb24gY29kZSAmIzQyOy9cbiAqICAgdHJhbnNpdGlvbjogMXMgbGluZWFyIGFsbDtcbiAqICAgb3BhY2l0eTowO1xuICogfVxuICogLm15LWFuaW1hdGlvbi5uZy1lbnRlci1zdGFnZ2VyIHtcbiAqICAgLyYjNDI7IHRoaXMgd2lsbCBoYXZlIGEgMTAwbXMgZGVsYXkgYmV0d2VlbiBlYWNoIHN1Y2Nlc3NpdmUgbGVhdmUgYW5pbWF0aW9uICYjNDI7L1xuICogICB0cmFuc2l0aW9uLWRlbGF5OiAwLjFzO1xuICpcbiAqICAgLyYjNDI7IEFzIG9mIDEuNC40LCB0aGlzIG11c3QgYWx3YXlzIGJlIHNldDogaXQgc2lnbmFscyBuZ0FuaW1hdGVcbiAqICAgICB0byBub3QgYWNjaWRlbnRhbGx5IGluaGVyaXQgYSBkZWxheSBwcm9wZXJ0eSBmcm9tIGFub3RoZXIgQ1NTIGNsYXNzICYjNDI7L1xuICogICB0cmFuc2l0aW9uLWR1cmF0aW9uOiAwcztcbiAqIH1cbiAqIC5teS1hbmltYXRpb24ubmctZW50ZXIubmctZW50ZXItYWN0aXZlIHtcbiAqICAgLyYjNDI7IHN0YW5kYXJkIHRyYW5zaXRpb24gc3R5bGVzICYjNDI7L1xuICogICBvcGFjaXR5OjE7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBTdGFnZ2VyaW5nIGFuaW1hdGlvbnMgd29yayBieSBkZWZhdWx0IGluIG5nUmVwZWF0IChzbyBsb25nIGFzIHRoZSBDU1MgY2xhc3MgaXMgZGVmaW5lZCkuIE91dHNpZGUgb2YgbmdSZXBlYXQsIHRvIHVzZSBzdGFnZ2VyaW5nIGFuaW1hdGlvbnNcbiAqIG9uIHlvdXIgb3duLCB0aGV5IGNhbiBiZSB0cmlnZ2VyZWQgYnkgZmlyaW5nIG11bHRpcGxlIGNhbGxzIHRvIHRoZSBzYW1lIGV2ZW50IG9uICRhbmltYXRlLiBIb3dldmVyLCB0aGUgcmVzdHJpY3Rpb25zIHN1cnJvdW5kaW5nIHRoaXNcbiAqIGFyZSB0aGF0IGVhY2ggb2YgdGhlIGVsZW1lbnRzIG11c3QgaGF2ZSB0aGUgc2FtZSBDU1MgY2xhc3NOYW1lIHZhbHVlIGFzIHdlbGwgYXMgdGhlIHNhbWUgcGFyZW50IGVsZW1lbnQuIEEgc3RhZ2dlciBvcGVyYXRpb25cbiAqIHdpbGwgYWxzbyBiZSByZXNldCBpZiBvbmUgb3IgbW9yZSBhbmltYXRpb24gZnJhbWVzIGhhdmUgcGFzc2VkIHNpbmNlIHRoZSBtdWx0aXBsZSBjYWxscyB0byBgJGFuaW1hdGVgIHdlcmUgZmlyZWQuXG4gKlxuICogVGhlIGZvbGxvd2luZyBjb2RlIHdpbGwgaXNzdWUgdGhlICoqbmctbGVhdmUtc3RhZ2dlcioqIGV2ZW50IG9uIHRoZSBlbGVtZW50IHByb3ZpZGVkOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIga2lkcyA9IHBhcmVudC5jaGlsZHJlbigpO1xuICpcbiAqICRhbmltYXRlLmxlYXZlKGtpZHNbMF0pOyAvL3N0YWdnZXIgaW5kZXg9MFxuICogJGFuaW1hdGUubGVhdmUoa2lkc1sxXSk7IC8vc3RhZ2dlciBpbmRleD0xXG4gKiAkYW5pbWF0ZS5sZWF2ZShraWRzWzJdKTsgLy9zdGFnZ2VyIGluZGV4PTJcbiAqICRhbmltYXRlLmxlYXZlKGtpZHNbM10pOyAvL3N0YWdnZXIgaW5kZXg9M1xuICogJGFuaW1hdGUubGVhdmUoa2lkc1s0XSk7IC8vc3RhZ2dlciBpbmRleD00XG4gKlxuICogd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAqICAgLy9zdGFnZ2VyIGhhcyByZXNldCBpdHNlbGZcbiAqICAgJGFuaW1hdGUubGVhdmUoa2lkc1s1XSk7IC8vc3RhZ2dlciBpbmRleD0wXG4gKiAgICRhbmltYXRlLmxlYXZlKGtpZHNbNl0pOyAvL3N0YWdnZXIgaW5kZXg9MVxuICpcbiAqICAgJHNjb3BlLiRkaWdlc3QoKTtcbiAqIH0pO1xuICogYGBgXG4gKlxuICogU3RhZ2dlciBhbmltYXRpb25zIGFyZSBjdXJyZW50bHkgb25seSBzdXBwb3J0ZWQgd2l0aGluIENTUy1kZWZpbmVkIGFuaW1hdGlvbnMuXG4gKlxuICogIyMjIFRoZSBgbmctYW5pbWF0ZWAgQ1NTIGNsYXNzXG4gKlxuICogV2hlbiBuZ0FuaW1hdGUgaXMgYW5pbWF0aW5nIGFuIGVsZW1lbnQgaXQgd2lsbCBhcHBseSB0aGUgYG5nLWFuaW1hdGVgIENTUyBjbGFzcyB0byB0aGUgZWxlbWVudCBmb3IgdGhlIGR1cmF0aW9uIG9mIHRoZSBhbmltYXRpb24uXG4gKiBUaGlzIGlzIGEgdGVtcG9yYXJ5IENTUyBjbGFzcyBhbmQgaXQgd2lsbCBiZSByZW1vdmVkIG9uY2UgdGhlIGFuaW1hdGlvbiBpcyBvdmVyIChmb3IgYm90aCBKYXZhU2NyaXB0IGFuZCBDU1MtYmFzZWQgYW5pbWF0aW9ucykuXG4gKlxuICogVGhlcmVmb3JlLCBhbmltYXRpb25zIGNhbiBiZSBhcHBsaWVkIHRvIGFuIGVsZW1lbnQgdXNpbmcgdGhpcyB0ZW1wb3JhcnkgY2xhc3MgZGlyZWN0bHkgdmlhIENTUy5cbiAqXG4gKiBgYGBjc3NcbiAqIC56aXBwZXIubmctYW5pbWF0ZSB7XG4gKiAgIHRyYW5zaXRpb246MC41cyBsaW5lYXIgYWxsO1xuICogfVxuICogLnppcHBlci5uZy1lbnRlciB7XG4gKiAgIG9wYWNpdHk6MDtcbiAqIH1cbiAqIC56aXBwZXIubmctZW50ZXIubmctZW50ZXItYWN0aXZlIHtcbiAqICAgb3BhY2l0eToxO1xuICogfVxuICogLnppcHBlci5uZy1sZWF2ZSB7XG4gKiAgIG9wYWNpdHk6MTtcbiAqIH1cbiAqIC56aXBwZXIubmctbGVhdmUubmctbGVhdmUtYWN0aXZlIHtcbiAqICAgb3BhY2l0eTowO1xuICogfVxuICogYGBgXG4gKlxuICogKE5vdGUgdGhhdCB0aGUgYG5nLWFuaW1hdGVgIENTUyBjbGFzcyBpcyByZXNlcnZlZCBhbmQgaXQgY2Fubm90IGJlIGFwcGxpZWQgb24gYW4gZWxlbWVudCBkaXJlY3RseSBzaW5jZSBuZ0FuaW1hdGUgd2lsbCBhbHdheXMgcmVtb3ZlXG4gKiB0aGUgQ1NTIGNsYXNzIG9uY2UgYW4gYW5pbWF0aW9uIGhhcyBjb21wbGV0ZWQuKVxuICpcbiAqXG4gKiAjIyMgVGhlIGBuZy1bZXZlbnRdLXByZXBhcmVgIGNsYXNzXG4gKlxuICogVGhpcyBpcyBhIHNwZWNpYWwgY2xhc3MgdGhhdCBjYW4gYmUgdXNlZCB0byBwcmV2ZW50IHVud2FudGVkIGZsaWNrZXJpbmcgLyBmbGFzaCBvZiBjb250ZW50IGJlZm9yZVxuICogdGhlIGFjdHVhbCBhbmltYXRpb24gc3RhcnRzLiBUaGUgY2xhc3MgaXMgYWRkZWQgYXMgc29vbiBhcyBhbiBhbmltYXRpb24gaXMgaW5pdGlhbGl6ZWQsIGJ1dCByZW1vdmVkXG4gKiBiZWZvcmUgdGhlIGFjdHVhbCBhbmltYXRpb24gc3RhcnRzIChhZnRlciB3YWl0aW5nIGZvciBhICRkaWdlc3QpLlxuICogSXQgaXMgYWxzbyBvbmx5IGFkZGVkIGZvciAqc3RydWN0dXJhbCogYW5pbWF0aW9ucyAoYGVudGVyYCwgYG1vdmVgLCBhbmQgYGxlYXZlYCkuXG4gKlxuICogSW4gcHJhY3RpY2UsIGZsaWNrZXJpbmcgY2FuIGFwcGVhciB3aGVuIG5lc3RpbmcgZWxlbWVudHMgd2l0aCBzdHJ1Y3R1cmFsIGFuaW1hdGlvbnMgc3VjaCBhcyBgbmdJZmBcbiAqIGludG8gZWxlbWVudHMgdGhhdCBoYXZlIGNsYXNzLWJhc2VkIGFuaW1hdGlvbnMgc3VjaCBhcyBgbmdDbGFzc2AuXG4gKlxuICogYGBgaHRtbFxuICogPGRpdiBuZy1jbGFzcz1cIntyZWQ6IG15UHJvcH1cIj5cbiAqICAgPGRpdiBuZy1jbGFzcz1cIntibHVlOiBteVByb3B9XCI+XG4gKiAgICAgPGRpdiBjbGFzcz1cIm1lc3NhZ2VcIiBuZy1pZj1cIm15UHJvcFwiPjwvZGl2PlxuICogICA8L2Rpdj5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogSXQgaXMgcG9zc2libGUgdGhhdCBkdXJpbmcgdGhlIGBlbnRlcmAgYW5pbWF0aW9uLCB0aGUgYC5tZXNzYWdlYCBkaXYgd2lsbCBiZSBicmllZmx5IHZpc2libGUgYmVmb3JlIGl0IHN0YXJ0cyBhbmltYXRpbmcuXG4gKiBJbiB0aGF0IGNhc2UsIHlvdSBjYW4gYWRkIHN0eWxlcyB0byB0aGUgQ1NTIHRoYXQgbWFrZSBzdXJlIHRoZSBlbGVtZW50IHN0YXlzIGhpZGRlbiBiZWZvcmUgdGhlIGFuaW1hdGlvbiBzdGFydHM6XG4gKlxuICogYGBgY3NzXG4gKiAubWVzc2FnZS5uZy1lbnRlci1wcmVwYXJlIHtcbiAqICAgb3BhY2l0eTogMDtcbiAqIH1cbiAqXG4gKiBgYGBcbiAqXG4gKiAjIyBKYXZhU2NyaXB0LWJhc2VkIEFuaW1hdGlvbnNcbiAqXG4gKiBuZ0FuaW1hdGUgYWxzbyBhbGxvd3MgZm9yIGFuaW1hdGlvbnMgdG8gYmUgY29uc3VtZWQgYnkgSmF2YVNjcmlwdCBjb2RlLiBUaGUgYXBwcm9hY2ggaXMgc2ltaWxhciB0byBDU1MtYmFzZWQgYW5pbWF0aW9ucyAod2hlcmUgdGhlcmUgaXMgYSBzaGFyZWRcbiAqIENTUyBjbGFzcyB0aGF0IGlzIHJlZmVyZW5jZWQgaW4gb3VyIEhUTUwgY29kZSkgYnV0IGluIGFkZGl0aW9uIHdlIG5lZWQgdG8gcmVnaXN0ZXIgdGhlIEphdmFTY3JpcHQgYW5pbWF0aW9uIG9uIHRoZSBtb2R1bGUuIEJ5IG1ha2luZyB1c2Ugb2YgdGhlXG4gKiBgbW9kdWxlLmFuaW1hdGlvbigpYCBtb2R1bGUgZnVuY3Rpb24gd2UgY2FuIHJlZ2lzdGVyIHRoZSBhbmltYXRpb24uXG4gKlxuICogTGV0J3Mgc2VlIGFuIGV4YW1wbGUgb2YgYSBlbnRlci9sZWF2ZSBhbmltYXRpb24gdXNpbmcgYG5nUmVwZWF0YDpcbiAqXG4gKiBgYGBodG1sXG4gKiA8ZGl2IG5nLXJlcGVhdD1cIml0ZW0gaW4gaXRlbXNcIiBjbGFzcz1cInNsaWRlXCI+XG4gKiAgIHt7IGl0ZW0gfX1cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogU2VlIHRoZSAqKnNsaWRlKiogQ1NTIGNsYXNzPyBMZXQncyB1c2UgdGhhdCBjbGFzcyB0byBkZWZpbmUgYW4gYW5pbWF0aW9uIHRoYXQgd2UnbGwgc3RydWN0dXJlIGluIG91ciBtb2R1bGUgY29kZSBieSB1c2luZyBgbW9kdWxlLmFuaW1hdGlvbmA6XG4gKlxuICogYGBganNcbiAqIG15TW9kdWxlLmFuaW1hdGlvbignLnNsaWRlJywgW2Z1bmN0aW9uKCkge1xuICogICByZXR1cm4ge1xuICogICAgIC8vIG1ha2Ugbm90ZSB0aGF0IG90aGVyIGV2ZW50cyAobGlrZSBhZGRDbGFzcy9yZW1vdmVDbGFzcylcbiAqICAgICAvLyBoYXZlIGRpZmZlcmVudCBmdW5jdGlvbiBpbnB1dCBwYXJhbWV0ZXJzXG4gKiAgICAgZW50ZXI6IGZ1bmN0aW9uKGVsZW1lbnQsIGRvbmVGbikge1xuICogICAgICAgalF1ZXJ5KGVsZW1lbnQpLmZhZGVJbigxMDAwLCBkb25lRm4pO1xuICpcbiAqICAgICAgIC8vIHJlbWVtYmVyIHRvIGNhbGwgZG9uZUZuIHNvIHRoYXQgYW5ndWxhclxuICogICAgICAgLy8ga25vd3MgdGhhdCB0aGUgYW5pbWF0aW9uIGhhcyBjb25jbHVkZWRcbiAqICAgICB9LFxuICpcbiAqICAgICBtb3ZlOiBmdW5jdGlvbihlbGVtZW50LCBkb25lRm4pIHtcbiAqICAgICAgIGpRdWVyeShlbGVtZW50KS5mYWRlSW4oMTAwMCwgZG9uZUZuKTtcbiAqICAgICB9LFxuICpcbiAqICAgICBsZWF2ZTogZnVuY3Rpb24oZWxlbWVudCwgZG9uZUZuKSB7XG4gKiAgICAgICBqUXVlcnkoZWxlbWVudCkuZmFkZU91dCgxMDAwLCBkb25lRm4pO1xuICogICAgIH1cbiAqICAgfVxuICogfV0pO1xuICogYGBgXG4gKlxuICogVGhlIG5pY2UgdGhpbmcgYWJvdXQgSlMtYmFzZWQgYW5pbWF0aW9ucyBpcyB0aGF0IHdlIGNhbiBpbmplY3Qgb3RoZXIgc2VydmljZXMgYW5kIG1ha2UgdXNlIG9mIGFkdmFuY2VkIGFuaW1hdGlvbiBsaWJyYXJpZXMgc3VjaCBhc1xuICogZ3JlZW5zb2NrLmpzIGFuZCB2ZWxvY2l0eS5qcy5cbiAqXG4gKiBJZiBvdXIgYW5pbWF0aW9uIGNvZGUgY2xhc3MtYmFzZWQgKG1lYW5pbmcgdGhhdCBzb21ldGhpbmcgbGlrZSBgbmdDbGFzc2AsIGBuZ0hpZGVgIGFuZCBgbmdTaG93YCB0cmlnZ2VycyBpdCkgdGhlbiB3ZSBjYW4gc3RpbGwgZGVmaW5lXG4gKiBvdXIgYW5pbWF0aW9ucyBpbnNpZGUgb2YgdGhlIHNhbWUgcmVnaXN0ZXJlZCBhbmltYXRpb24sIGhvd2V2ZXIsIHRoZSBmdW5jdGlvbiBpbnB1dCBhcmd1bWVudHMgYXJlIGEgYml0IGRpZmZlcmVudDpcbiAqXG4gKiBgYGBodG1sXG4gKiA8ZGl2IG5nLWNsYXNzPVwiY29sb3JcIiBjbGFzcz1cImNvbG9yZnVsXCI+XG4gKiAgIHRoaXMgYm94IGlzIG1vb2R5XG4gKiA8L2Rpdj5cbiAqIDxidXR0b24gbmctY2xpY2s9XCJjb2xvcj0ncmVkJ1wiPkNoYW5nZSB0byByZWQ8L2J1dHRvbj5cbiAqIDxidXR0b24gbmctY2xpY2s9XCJjb2xvcj0nYmx1ZSdcIj5DaGFuZ2UgdG8gYmx1ZTwvYnV0dG9uPlxuICogPGJ1dHRvbiBuZy1jbGljaz1cImNvbG9yPSdncmVlbidcIj5DaGFuZ2UgdG8gZ3JlZW48L2J1dHRvbj5cbiAqIGBgYFxuICpcbiAqIGBgYGpzXG4gKiBteU1vZHVsZS5hbmltYXRpb24oJy5jb2xvcmZ1bCcsIFtmdW5jdGlvbigpIHtcbiAqICAgcmV0dXJuIHtcbiAqICAgICBhZGRDbGFzczogZnVuY3Rpb24oZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lRm4pIHtcbiAqICAgICAgIC8vIGRvIHNvbWUgY29vbCBhbmltYXRpb24gYW5kIGNhbGwgdGhlIGRvbmVGblxuICogICAgIH0sXG4gKiAgICAgcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uKGVsZW1lbnQsIGNsYXNzTmFtZSwgZG9uZUZuKSB7XG4gKiAgICAgICAvLyBkbyBzb21lIGNvb2wgYW5pbWF0aW9uIGFuZCBjYWxsIHRoZSBkb25lRm5cbiAqICAgICB9LFxuICogICAgIHNldENsYXNzOiBmdW5jdGlvbihlbGVtZW50LCBhZGRlZENsYXNzLCByZW1vdmVkQ2xhc3MsIGRvbmVGbikge1xuICogICAgICAgLy8gZG8gc29tZSBjb29sIGFuaW1hdGlvbiBhbmQgY2FsbCB0aGUgZG9uZUZuXG4gKiAgICAgfVxuICogICB9XG4gKiB9XSk7XG4gKiBgYGBcbiAqXG4gKiAjIyBDU1MgKyBKUyBBbmltYXRpb25zIFRvZ2V0aGVyXG4gKlxuICogQW5ndWxhckpTIDEuNCBhbmQgaGlnaGVyIGhhcyB0YWtlbiBzdGVwcyB0byBtYWtlIHRoZSBhbWFsZ2FtYXRpb24gb2YgQ1NTIGFuZCBKUyBhbmltYXRpb25zIG1vcmUgZmxleGlibGUuIEhvd2V2ZXIsIHVubGlrZSBlYXJsaWVyIHZlcnNpb25zIG9mIEFuZ3VsYXIsXG4gKiBkZWZpbmluZyBDU1MgYW5kIEpTIGFuaW1hdGlvbnMgdG8gd29yayBvZmYgb2YgdGhlIHNhbWUgQ1NTIGNsYXNzIHdpbGwgbm90IHdvcmsgYW55bW9yZS4gVGhlcmVmb3JlIHRoZSBleGFtcGxlIGJlbG93IHdpbGwgb25seSByZXN1bHQgaW4gKipKUyBhbmltYXRpb25zIHRha2luZ1xuICogY2hhcmdlIG9mIHRoZSBhbmltYXRpb24qKjpcbiAqXG4gKiBgYGBodG1sXG4gKiA8ZGl2IG5nLWlmPVwiYm9vbFwiIGNsYXNzPVwic2xpZGVcIj5cbiAqICAgU2xpZGUgaW4gYW5kIG91dFxuICogPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBgYGBqc1xuICogbXlNb2R1bGUuYW5pbWF0aW9uKCcuc2xpZGUnLCBbZnVuY3Rpb24oKSB7XG4gKiAgIHJldHVybiB7XG4gKiAgICAgZW50ZXI6IGZ1bmN0aW9uKGVsZW1lbnQsIGRvbmVGbikge1xuICogICAgICAgalF1ZXJ5KGVsZW1lbnQpLnNsaWRlSW4oMTAwMCwgZG9uZUZuKTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1dKTtcbiAqIGBgYFxuICpcbiAqIGBgYGNzc1xuICogLnNsaWRlLm5nLWVudGVyIHtcbiAqICAgdHJhbnNpdGlvbjowLjVzIGxpbmVhciBhbGw7XG4gKiAgIHRyYW5zZm9ybTp0cmFuc2xhdGVZKC0xMDBweCk7XG4gKiB9XG4gKiAuc2xpZGUubmctZW50ZXIubmctZW50ZXItYWN0aXZlIHtcbiAqICAgdHJhbnNmb3JtOnRyYW5zbGF0ZVkoMCk7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBEb2VzIHRoaXMgbWVhbiB0aGF0IENTUyBhbmQgSlMgYW5pbWF0aW9ucyBjYW5ub3QgYmUgdXNlZCB0b2dldGhlcj8gRG8gSlMtYmFzZWQgYW5pbWF0aW9ucyBhbHdheXMgaGF2ZSBoaWdoZXIgcHJpb3JpdHk/IFdlIGNhbiBtYWtlIHVwIGZvciB0aGVcbiAqIGxhY2sgb2YgQ1NTIGFuaW1hdGlvbnMgYnkgdXNpbmcgdGhlIGAkYW5pbWF0ZUNzc2Agc2VydmljZSB0byB0cmlnZ2VyIG91ciBvd24gdHdlYWtlZC1vdXQsIENTUy1iYXNlZCBhbmltYXRpb25zIGRpcmVjdGx5IGZyb21cbiAqIG91ciBvd24gSlMtYmFzZWQgYW5pbWF0aW9uIGNvZGU6XG4gKlxuICogYGBganNcbiAqIG15TW9kdWxlLmFuaW1hdGlvbignLnNsaWRlJywgWyckYW5pbWF0ZUNzcycsIGZ1bmN0aW9uKCRhbmltYXRlQ3NzKSB7XG4gKiAgIHJldHVybiB7XG4gKiAgICAgZW50ZXI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiogICAgICAgIC8vIHRoaXMgd2lsbCB0cmlnZ2VyIGAuc2xpZGUubmctZW50ZXJgIGFuZCBgLnNsaWRlLm5nLWVudGVyLWFjdGl2ZWAuXG4gKiAgICAgICByZXR1cm4gJGFuaW1hdGVDc3MoZWxlbWVudCwge1xuICogICAgICAgICBldmVudDogJ2VudGVyJyxcbiAqICAgICAgICAgc3RydWN0dXJhbDogdHJ1ZVxuICogICAgICAgfSk7XG4gKiAgICAgfVxuICogICB9XG4gKiB9XSk7XG4gKiBgYGBcbiAqXG4gKiBUaGUgbmljZSB0aGluZyBoZXJlIGlzIHRoYXQgd2UgY2FuIHNhdmUgYmFuZHdpZHRoIGJ5IHN0aWNraW5nIHRvIG91ciBDU1MtYmFzZWQgYW5pbWF0aW9uIGNvZGUgYW5kIHdlIGRvbid0IG5lZWQgdG8gcmVseSBvbiBhIDNyZC1wYXJ0eSBhbmltYXRpb24gZnJhbWV3b3JrLlxuICpcbiAqIFRoZSBgJGFuaW1hdGVDc3NgIHNlcnZpY2UgaXMgdmVyeSBwb3dlcmZ1bCBzaW5jZSB3ZSBjYW4gZmVlZCBpbiBhbGwga2luZHMgb2YgZXh0cmEgcHJvcGVydGllcyB0aGF0IHdpbGwgYmUgZXZhbHVhdGVkIGFuZCBmZWQgaW50byBhIENTUyB0cmFuc2l0aW9uIG9yXG4gKiBrZXlmcmFtZSBhbmltYXRpb24uIEZvciBleGFtcGxlIGlmIHdlIHdhbnRlZCB0byBhbmltYXRlIHRoZSBoZWlnaHQgb2YgYW4gZWxlbWVudCB3aGlsZSBhZGRpbmcgYW5kIHJlbW92aW5nIGNsYXNzZXMgdGhlbiB3ZSBjYW4gZG8gc28gYnkgcHJvdmlkaW5nIHRoYXRcbiAqIGRhdGEgaW50byBgJGFuaW1hdGVDc3NgIGRpcmVjdGx5OlxuICpcbiAqIGBgYGpzXG4gKiBteU1vZHVsZS5hbmltYXRpb24oJy5zbGlkZScsIFsnJGFuaW1hdGVDc3MnLCBmdW5jdGlvbigkYW5pbWF0ZUNzcykge1xuICogICByZXR1cm4ge1xuICogICAgIGVudGVyOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gKiAgICAgICByZXR1cm4gJGFuaW1hdGVDc3MoZWxlbWVudCwge1xuICogICAgICAgICBldmVudDogJ2VudGVyJyxcbiAqICAgICAgICAgc3RydWN0dXJhbDogdHJ1ZSxcbiAqICAgICAgICAgYWRkQ2xhc3M6ICdtYXJvb24tc2V0dGluZycsXG4gKiAgICAgICAgIGZyb206IHsgaGVpZ2h0OjAgfSxcbiAqICAgICAgICAgdG86IHsgaGVpZ2h0OiAyMDAgfVxuICogICAgICAgfSk7XG4gKiAgICAgfVxuICogICB9XG4gKiB9XSk7XG4gKiBgYGBcbiAqXG4gKiBOb3cgd2UgY2FuIGZpbGwgaW4gdGhlIHJlc3QgdmlhIG91ciB0cmFuc2l0aW9uIENTUyBjb2RlOlxuICpcbiAqIGBgYGNzc1xuICogLyYjNDI7IHRoZSB0cmFuc2l0aW9uIHRlbGxzIG5nQW5pbWF0ZSB0byBtYWtlIHRoZSBhbmltYXRpb24gaGFwcGVuICYjNDI7L1xuICogLnNsaWRlLm5nLWVudGVyIHsgdHJhbnNpdGlvbjowLjVzIGxpbmVhciBhbGw7IH1cbiAqXG4gKiAvJiM0MjsgdGhpcyBleHRyYSBDU1MgY2xhc3Mgd2lsbCBiZSBhYnNvcmJlZCBpbnRvIHRoZSB0cmFuc2l0aW9uXG4gKiBzaW5jZSB0aGUgJGFuaW1hdGVDc3MgY29kZSBpcyBhZGRpbmcgdGhlIGNsYXNzICYjNDI7L1xuICogLm1hcm9vbi1zZXR0aW5nIHsgYmFja2dyb3VuZDpyZWQ7IH1cbiAqIGBgYFxuICpcbiAqIEFuZCBgJGFuaW1hdGVDc3NgIHdpbGwgZmlndXJlIG91dCB0aGUgcmVzdC4gSnVzdCBtYWtlIHN1cmUgdG8gaGF2ZSB0aGUgYGRvbmUoKWAgY2FsbGJhY2sgZmlyZSB0aGUgYGRvbmVGbmAgZnVuY3Rpb24gdG8gc2lnbmFsIHdoZW4gdGhlIGFuaW1hdGlvbiBpcyBvdmVyLlxuICpcbiAqIFRvIGxlYXJuIG1vcmUgYWJvdXQgd2hhdCdzIHBvc3NpYmxlIGJlIHN1cmUgdG8gdmlzaXQgdGhlIHtAbGluayBuZ0FuaW1hdGUuJGFuaW1hdGVDc3MgJGFuaW1hdGVDc3Mgc2VydmljZX0uXG4gKlxuICogIyMgQW5pbWF0aW9uIEFuY2hvcmluZyAodmlhIGBuZy1hbmltYXRlLXJlZmApXG4gKlxuICogbmdBbmltYXRlIGluIEFuZ3VsYXJKUyAxLjQgY29tZXMgcGFja2VkIHdpdGggdGhlIGFiaWxpdHkgdG8gY3Jvc3MtYW5pbWF0ZSBlbGVtZW50cyBiZXR3ZWVuXG4gKiBzdHJ1Y3R1cmFsIGFyZWFzIG9mIGFuIGFwcGxpY2F0aW9uIChsaWtlIHZpZXdzKSBieSBwYWlyaW5nIHVwIGVsZW1lbnRzIHVzaW5nIGFuIGF0dHJpYnV0ZVxuICogY2FsbGVkIGBuZy1hbmltYXRlLXJlZmAuXG4gKlxuICogTGV0J3Mgc2F5IGZvciBleGFtcGxlIHdlIGhhdmUgdHdvIHZpZXdzIHRoYXQgYXJlIG1hbmFnZWQgYnkgYG5nLXZpZXdgIGFuZCB3ZSB3YW50IHRvIHNob3dcbiAqIHRoYXQgdGhlcmUgaXMgYSByZWxhdGlvbnNoaXAgYmV0d2VlbiB0d28gY29tcG9uZW50cyBzaXR1YXRlZCBpbiB3aXRoaW4gdGhlc2Ugdmlld3MuIEJ5IHVzaW5nIHRoZVxuICogYG5nLWFuaW1hdGUtcmVmYCBhdHRyaWJ1dGUgd2UgY2FuIGlkZW50aWZ5IHRoYXQgdGhlIHR3byBjb21wb25lbnRzIGFyZSBwYWlyZWQgdG9nZXRoZXIgYW5kIHdlXG4gKiBjYW4gdGhlbiBhdHRhY2ggYW4gYW5pbWF0aW9uLCB3aGljaCBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgdmlldyBjaGFuZ2VzLlxuICpcbiAqIFNheSBmb3IgZXhhbXBsZSB3ZSBoYXZlIHRoZSBmb2xsb3dpbmcgdGVtcGxhdGUgY29kZTpcbiAqXG4gKiBgYGBodG1sXG4gKiA8IS0tIGluZGV4Lmh0bWwgLS0+XG4gKiA8ZGl2IG5nLXZpZXcgY2xhc3M9XCJ2aWV3LWFuaW1hdGlvblwiPlxuICogPC9kaXY+XG4gKlxuICogPCEtLSBob21lLmh0bWwgLS0+XG4gKiA8YSBocmVmPVwiIy9iYW5uZXItcGFnZVwiPlxuICogICA8aW1nIHNyYz1cIi4vYmFubmVyLmpwZ1wiIGNsYXNzPVwiYmFubmVyXCIgbmctYW5pbWF0ZS1yZWY9XCJiYW5uZXJcIj5cbiAqIDwvYT5cbiAqXG4gKiA8IS0tIGJhbm5lci1wYWdlLmh0bWwgLS0+XG4gKiA8aW1nIHNyYz1cIi4vYmFubmVyLmpwZ1wiIGNsYXNzPVwiYmFubmVyXCIgbmctYW5pbWF0ZS1yZWY9XCJiYW5uZXJcIj5cbiAqIGBgYFxuICpcbiAqIE5vdywgd2hlbiB0aGUgdmlldyBjaGFuZ2VzIChvbmNlIHRoZSBsaW5rIGlzIGNsaWNrZWQpLCBuZ0FuaW1hdGUgd2lsbCBleGFtaW5lIHRoZVxuICogSFRNTCBjb250ZW50cyB0byBzZWUgaWYgdGhlcmUgaXMgYSBtYXRjaCByZWZlcmVuY2UgYmV0d2VlbiBhbnkgY29tcG9uZW50cyBpbiB0aGUgdmlld1xuICogdGhhdCBpcyBsZWF2aW5nIGFuZCB0aGUgdmlldyB0aGF0IGlzIGVudGVyaW5nLiBJdCB3aWxsIHNjYW4gYm90aCB0aGUgdmlldyB3aGljaCBpcyBiZWluZ1xuICogcmVtb3ZlZCAobGVhdmUpIGFuZCBpbnNlcnRlZCAoZW50ZXIpIHRvIHNlZSBpZiB0aGVyZSBhcmUgYW55IHBhaXJlZCBET00gZWxlbWVudHMgdGhhdFxuICogY29udGFpbiBhIG1hdGNoaW5nIHJlZiB2YWx1ZS5cbiAqXG4gKiBUaGUgdHdvIGltYWdlcyBtYXRjaCBzaW5jZSB0aGV5IHNoYXJlIHRoZSBzYW1lIHJlZiB2YWx1ZS4gbmdBbmltYXRlIHdpbGwgbm93IGNyZWF0ZSBhXG4gKiB0cmFuc3BvcnQgZWxlbWVudCAod2hpY2ggaXMgYSBjbG9uZSBvZiB0aGUgZmlyc3QgaW1hZ2UgZWxlbWVudCkgYW5kIGl0IHdpbGwgdGhlbiBhdHRlbXB0XG4gKiB0byBhbmltYXRlIHRvIHRoZSBwb3NpdGlvbiBvZiB0aGUgc2Vjb25kIGltYWdlIGVsZW1lbnQgaW4gdGhlIG5leHQgdmlldy4gRm9yIHRoZSBhbmltYXRpb24gdG9cbiAqIHdvcmsgYSBzcGVjaWFsIENTUyBjbGFzcyBjYWxsZWQgYG5nLWFuY2hvcmAgd2lsbCBiZSBhZGRlZCB0byB0aGUgdHJhbnNwb3J0ZWQgZWxlbWVudC5cbiAqXG4gKiBXZSBjYW4gbm93IGF0dGFjaCBhIHRyYW5zaXRpb24gb250byB0aGUgYC5iYW5uZXIubmctYW5jaG9yYCBDU1MgY2xhc3MgYW5kIHRoZW5cbiAqIG5nQW5pbWF0ZSB3aWxsIGhhbmRsZSB0aGUgZW50aXJlIHRyYW5zaXRpb24gZm9yIHVzIGFzIHdlbGwgYXMgdGhlIGFkZGl0aW9uIGFuZCByZW1vdmFsIG9mXG4gKiBhbnkgY2hhbmdlcyBvZiBDU1MgY2xhc3NlcyBiZXR3ZWVuIHRoZSBlbGVtZW50czpcbiAqXG4gKiBgYGBjc3NcbiAqIC5iYW5uZXIubmctYW5jaG9yIHtcbiAqICAgLyYjNDI7IHRoaXMgYW5pbWF0aW9uIHdpbGwgbGFzdCBmb3IgMSBzZWNvbmQgc2luY2UgdGhlcmUgYXJlXG4gKiAgICAgICAgICB0d28gcGhhc2VzIHRvIHRoZSBhbmltYXRpb24gKGFuIGBpbmAgYW5kIGFuIGBvdXRgIHBoYXNlKSAmIzQyOy9cbiAqICAgdHJhbnNpdGlvbjowLjVzIGxpbmVhciBhbGw7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBXZSBhbHNvICoqbXVzdCoqIGluY2x1ZGUgYW5pbWF0aW9ucyBmb3IgdGhlIHZpZXdzIHRoYXQgYXJlIGJlaW5nIGVudGVyZWQgYW5kIHJlbW92ZWRcbiAqIChvdGhlcndpc2UgYW5jaG9yaW5nIHdvdWxkbid0IGJlIHBvc3NpYmxlIHNpbmNlIHRoZSBuZXcgdmlldyB3b3VsZCBiZSBpbnNlcnRlZCByaWdodCBhd2F5KS5cbiAqXG4gKiBgYGBjc3NcbiAqIC52aWV3LWFuaW1hdGlvbi5uZy1lbnRlciwgLnZpZXctYW5pbWF0aW9uLm5nLWxlYXZlIHtcbiAqICAgdHJhbnNpdGlvbjowLjVzIGxpbmVhciBhbGw7XG4gKiAgIHBvc2l0aW9uOmZpeGVkO1xuICogICBsZWZ0OjA7XG4gKiAgIHRvcDowO1xuICogICB3aWR0aDoxMDAlO1xuICogfVxuICogLnZpZXctYW5pbWF0aW9uLm5nLWVudGVyIHtcbiAqICAgdHJhbnNmb3JtOnRyYW5zbGF0ZVgoMTAwJSk7XG4gKiB9XG4gKiAudmlldy1hbmltYXRpb24ubmctbGVhdmUsXG4gKiAudmlldy1hbmltYXRpb24ubmctZW50ZXIubmctZW50ZXItYWN0aXZlIHtcbiAqICAgdHJhbnNmb3JtOnRyYW5zbGF0ZVgoMCUpO1xuICogfVxuICogLnZpZXctYW5pbWF0aW9uLm5nLWxlYXZlLm5nLWxlYXZlLWFjdGl2ZSB7XG4gKiAgIHRyYW5zZm9ybTp0cmFuc2xhdGVYKC0xMDAlKTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIE5vdyB3ZSBjYW4ganVtcCBiYWNrIHRvIHRoZSBhbmNob3IgYW5pbWF0aW9uLiBXaGVuIHRoZSBhbmltYXRpb24gaGFwcGVucywgdGhlcmUgYXJlIHR3byBzdGFnZXMgdGhhdCBvY2N1cjpcbiAqIGFuIGBvdXRgIGFuZCBhbiBgaW5gIHN0YWdlLiBUaGUgYG91dGAgc3RhZ2UgaGFwcGVucyBmaXJzdCBhbmQgdGhhdCBpcyB3aGVuIHRoZSBlbGVtZW50IGlzIGFuaW1hdGVkIGF3YXlcbiAqIGZyb20gaXRzIG9yaWdpbi4gT25jZSB0aGF0IGFuaW1hdGlvbiBpcyBvdmVyIHRoZW4gdGhlIGBpbmAgc3RhZ2Ugb2NjdXJzIHdoaWNoIGFuaW1hdGVzIHRoZVxuICogZWxlbWVudCB0byBpdHMgZGVzdGluYXRpb24uIFRoZSByZWFzb24gd2h5IHRoZXJlIGFyZSB0d28gYW5pbWF0aW9ucyBpcyB0byBnaXZlIGVub3VnaCB0aW1lXG4gKiBmb3IgdGhlIGVudGVyIGFuaW1hdGlvbiBvbiB0aGUgbmV3IGVsZW1lbnQgdG8gYmUgcmVhZHkuXG4gKlxuICogVGhlIGV4YW1wbGUgYWJvdmUgc2V0cyB1cCBhIHRyYW5zaXRpb24gZm9yIGJvdGggdGhlIGluIGFuZCBvdXQgcGhhc2VzLCBidXQgd2UgY2FuIGFsc28gdGFyZ2V0IHRoZSBvdXQgb3JcbiAqIGluIHBoYXNlcyBkaXJlY3RseSB2aWEgYG5nLWFuY2hvci1vdXRgIGFuZCBgbmctYW5jaG9yLWluYC5cbiAqXG4gKiBgYGBjc3NcbiAqIC5iYW5uZXIubmctYW5jaG9yLW91dCB7XG4gKiAgIHRyYW5zaXRpb246IDAuNXMgbGluZWFyIGFsbDtcbiAqXG4gKiAgIC8mIzQyOyB0aGUgc2NhbGUgd2lsbCBiZSBhcHBsaWVkIGR1cmluZyB0aGUgb3V0IGFuaW1hdGlvbixcbiAqICAgICAgICAgIGJ1dCB3aWxsIGJlIGFuaW1hdGVkIGF3YXkgd2hlbiB0aGUgaW4gYW5pbWF0aW9uIHJ1bnMgJiM0MjsvXG4gKiAgIHRyYW5zZm9ybTogc2NhbGUoMS4yKTtcbiAqIH1cbiAqXG4gKiAuYmFubmVyLm5nLWFuY2hvci1pbiB7XG4gKiAgIHRyYW5zaXRpb246IDFzIGxpbmVhciBhbGw7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKlxuICpcbiAqXG4gKiAjIyMgQW5jaG9yaW5nIERlbW9cbiAqXG4gIDxleGFtcGxlIG1vZHVsZT1cImFuY2hvcmluZ0V4YW1wbGVcIlxuICAgICAgICAgICBuYW1lPVwiYW5jaG9yaW5nRXhhbXBsZVwiXG4gICAgICAgICAgIGlkPVwiYW5jaG9yaW5nRXhhbXBsZVwiXG4gICAgICAgICAgIGRlcHM9XCJhbmd1bGFyLWFuaW1hdGUuanM7YW5ndWxhci1yb3V0ZS5qc1wiXG4gICAgICAgICAgIGFuaW1hdGlvbnM9XCJ0cnVlXCI+XG4gICAgPGZpbGUgbmFtZT1cImluZGV4Lmh0bWxcIj5cbiAgICAgIDxhIGhyZWY9XCIjL1wiPkhvbWU8L2E+XG4gICAgICA8aHIgLz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ2aWV3LWNvbnRhaW5lclwiPlxuICAgICAgICA8ZGl2IG5nLXZpZXcgY2xhc3M9XCJ2aWV3XCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2ZpbGU+XG4gICAgPGZpbGUgbmFtZT1cInNjcmlwdC5qc1wiPlxuICAgICAgYW5ndWxhci5tb2R1bGUoJ2FuY2hvcmluZ0V4YW1wbGUnLCBbJ25nQW5pbWF0ZScsICduZ1JvdXRlJ10pXG4gICAgICAgIC5jb25maWcoWyckcm91dGVQcm92aWRlcicsIGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG4gICAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignLycsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnaG9tZS5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlciBhcyBob21lJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9wcm9maWxlLzppZCcsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncHJvZmlsZS5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ29udHJvbGxlciBhcyBwcm9maWxlJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XSlcbiAgICAgICAgLnJ1bihbJyRyb290U2NvcGUnLCBmdW5jdGlvbigkcm9vdFNjb3BlKSB7XG4gICAgICAgICAgJHJvb3RTY29wZS5yZWNvcmRzID0gW1xuICAgICAgICAgICAgeyBpZDoxLCB0aXRsZTogXCJNaXNzIEJldWxhaCBSb29iXCIgfSxcbiAgICAgICAgICAgIHsgaWQ6MiwgdGl0bGU6IFwiVHJlbnQgTW9yaXNzZXR0ZVwiIH0sXG4gICAgICAgICAgICB7IGlkOjMsIHRpdGxlOiBcIk1pc3MgQXZhIFBvdXJvc1wiIH0sXG4gICAgICAgICAgICB7IGlkOjQsIHRpdGxlOiBcIlJvZCBQb3Vyb3NcIiB9LFxuICAgICAgICAgICAgeyBpZDo1LCB0aXRsZTogXCJBYmR1bCBSaWNlXCIgfSxcbiAgICAgICAgICAgIHsgaWQ6NiwgdGl0bGU6IFwiTGF1cmllIFJ1dGhlcmZvcmQgU3IuXCIgfSxcbiAgICAgICAgICAgIHsgaWQ6NywgdGl0bGU6IFwiTmFraWEgTWNMYXVnaGxpblwiIH0sXG4gICAgICAgICAgICB7IGlkOjgsIHRpdGxlOiBcIkpvcmRvbiBCbGFuZGEgRFZNXCIgfSxcbiAgICAgICAgICAgIHsgaWQ6OSwgdGl0bGU6IFwiUmhvZGEgSGFuZFwiIH0sXG4gICAgICAgICAgICB7IGlkOjEwLCB0aXRsZTogXCJBbGV4YW5kcmVhIFNhdWVyXCIgfVxuICAgICAgICAgIF07XG4gICAgICAgIH1dKVxuICAgICAgICAuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBbZnVuY3Rpb24oKSB7XG4gICAgICAgICAgLy9lbXB0eVxuICAgICAgICB9XSlcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1Byb2ZpbGVDb250cm9sbGVyJywgWyckcm9vdFNjb3BlJywgJyRyb3V0ZVBhcmFtcycsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRyb3V0ZVBhcmFtcykge1xuICAgICAgICAgIHZhciBpbmRleCA9IHBhcnNlSW50KCRyb3V0ZVBhcmFtcy5pZCwgMTApO1xuICAgICAgICAgIHZhciByZWNvcmQgPSAkcm9vdFNjb3BlLnJlY29yZHNbaW5kZXggLSAxXTtcblxuICAgICAgICAgIHRoaXMudGl0bGUgPSByZWNvcmQudGl0bGU7XG4gICAgICAgICAgdGhpcy5pZCA9IHJlY29yZC5pZDtcbiAgICAgICAgfV0pO1xuICAgIDwvZmlsZT5cbiAgICA8ZmlsZSBuYW1lPVwiaG9tZS5odG1sXCI+XG4gICAgICA8aDI+V2VsY29tZSB0byB0aGUgaG9tZSBwYWdlPC9oMT5cbiAgICAgIDxwPlBsZWFzZSBjbGljayBvbiBhbiBlbGVtZW50PC9wPlxuICAgICAgPGEgY2xhc3M9XCJyZWNvcmRcIlxuICAgICAgICAgbmctaHJlZj1cIiMvcHJvZmlsZS97eyByZWNvcmQuaWQgfX1cIlxuICAgICAgICAgbmctYW5pbWF0ZS1yZWY9XCJ7eyByZWNvcmQuaWQgfX1cIlxuICAgICAgICAgbmctcmVwZWF0PVwicmVjb3JkIGluIHJlY29yZHNcIj5cbiAgICAgICAge3sgcmVjb3JkLnRpdGxlIH19XG4gICAgICA8L2E+XG4gICAgPC9maWxlPlxuICAgIDxmaWxlIG5hbWU9XCJwcm9maWxlLmh0bWxcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJwcm9maWxlIHJlY29yZFwiIG5nLWFuaW1hdGUtcmVmPVwie3sgcHJvZmlsZS5pZCB9fVwiPlxuICAgICAgICB7eyBwcm9maWxlLnRpdGxlIH19XG4gICAgICA8L2Rpdj5cbiAgICA8L2ZpbGU+XG4gICAgPGZpbGUgbmFtZT1cImFuaW1hdGlvbnMuY3NzXCI+XG4gICAgICAucmVjb3JkIHtcbiAgICAgICAgZGlzcGxheTpibG9jaztcbiAgICAgICAgZm9udC1zaXplOjIwcHg7XG4gICAgICB9XG4gICAgICAucHJvZmlsZSB7XG4gICAgICAgIGJhY2tncm91bmQ6YmxhY2s7XG4gICAgICAgIGNvbG9yOndoaXRlO1xuICAgICAgICBmb250LXNpemU6MTAwcHg7XG4gICAgICB9XG4gICAgICAudmlldy1jb250YWluZXIge1xuICAgICAgICBwb3NpdGlvbjpyZWxhdGl2ZTtcbiAgICAgIH1cbiAgICAgIC52aWV3LWNvbnRhaW5lciA+IC52aWV3Lm5nLWFuaW1hdGUge1xuICAgICAgICBwb3NpdGlvbjphYnNvbHV0ZTtcbiAgICAgICAgdG9wOjA7XG4gICAgICAgIGxlZnQ6MDtcbiAgICAgICAgd2lkdGg6MTAwJTtcbiAgICAgICAgbWluLWhlaWdodDo1MDBweDtcbiAgICAgIH1cbiAgICAgIC52aWV3Lm5nLWVudGVyLCAudmlldy5uZy1sZWF2ZSxcbiAgICAgIC5yZWNvcmQubmctYW5jaG9yIHtcbiAgICAgICAgdHJhbnNpdGlvbjowLjVzIGxpbmVhciBhbGw7XG4gICAgICB9XG4gICAgICAudmlldy5uZy1lbnRlciB7XG4gICAgICAgIHRyYW5zZm9ybTp0cmFuc2xhdGVYKDEwMCUpO1xuICAgICAgfVxuICAgICAgLnZpZXcubmctZW50ZXIubmctZW50ZXItYWN0aXZlLCAudmlldy5uZy1sZWF2ZSB7XG4gICAgICAgIHRyYW5zZm9ybTp0cmFuc2xhdGVYKDAlKTtcbiAgICAgIH1cbiAgICAgIC52aWV3Lm5nLWxlYXZlLm5nLWxlYXZlLWFjdGl2ZSB7XG4gICAgICAgIHRyYW5zZm9ybTp0cmFuc2xhdGVYKC0xMDAlKTtcbiAgICAgIH1cbiAgICAgIC5yZWNvcmQubmctYW5jaG9yLW91dCB7XG4gICAgICAgIGJhY2tncm91bmQ6cmVkO1xuICAgICAgfVxuICAgIDwvZmlsZT5cbiAgPC9leGFtcGxlPlxuICpcbiAqICMjIyBIb3cgaXMgdGhlIGVsZW1lbnQgdHJhbnNwb3J0ZWQ/XG4gKlxuICogV2hlbiBhbiBhbmNob3IgYW5pbWF0aW9uIG9jY3VycywgbmdBbmltYXRlIHdpbGwgY2xvbmUgdGhlIHN0YXJ0aW5nIGVsZW1lbnQgYW5kIHBvc2l0aW9uIGl0IGV4YWN0bHkgd2hlcmUgdGhlIHN0YXJ0aW5nXG4gKiBlbGVtZW50IGlzIGxvY2F0ZWQgb24gc2NyZWVuIHZpYSBhYnNvbHV0ZSBwb3NpdGlvbmluZy4gVGhlIGNsb25lZCBlbGVtZW50IHdpbGwgYmUgcGxhY2VkIGluc2lkZSBvZiB0aGUgcm9vdCBlbGVtZW50XG4gKiBvZiB0aGUgYXBwbGljYXRpb24gKHdoZXJlIG5nLWFwcCB3YXMgZGVmaW5lZCkgYW5kIGFsbCBvZiB0aGUgQ1NTIGNsYXNzZXMgb2YgdGhlIHN0YXJ0aW5nIGVsZW1lbnQgd2lsbCBiZSBhcHBsaWVkLiBUaGVcbiAqIGVsZW1lbnQgd2lsbCB0aGVuIGFuaW1hdGUgaW50byB0aGUgYG91dGAgYW5kIGBpbmAgYW5pbWF0aW9ucyBhbmQgd2lsbCBldmVudHVhbGx5IHJlYWNoIHRoZSBjb29yZGluYXRlcyBhbmQgbWF0Y2hcbiAqIHRoZSBkaW1lbnNpb25zIG9mIHRoZSBkZXN0aW5hdGlvbiBlbGVtZW50LiBEdXJpbmcgdGhlIGVudGlyZSBhbmltYXRpb24gYSBDU1MgY2xhc3Mgb2YgYC5uZy1hbmltYXRlLXNoaW1gIHdpbGwgYmUgYXBwbGllZFxuICogdG8gYm90aCB0aGUgc3RhcnRpbmcgYW5kIGRlc3RpbmF0aW9uIGVsZW1lbnRzIGluIG9yZGVyIHRvIGhpZGUgdGhlbSBmcm9tIGJlaW5nIHZpc2libGUgKHRoZSBDU1Mgc3R5bGluZyBmb3IgdGhlIGNsYXNzXG4gKiBpczogYHZpc2liaWxpdHk6aGlkZGVuYCkuIE9uY2UgdGhlIGFuY2hvciByZWFjaGVzIGl0cyBkZXN0aW5hdGlvbiB0aGVuIGl0IHdpbGwgYmUgcmVtb3ZlZCBhbmQgdGhlIGRlc3RpbmF0aW9uIGVsZW1lbnRcbiAqIHdpbGwgYmVjb21lIHZpc2libGUgc2luY2UgdGhlIHNoaW0gY2xhc3Mgd2lsbCBiZSByZW1vdmVkLlxuICpcbiAqICMjIyBIb3cgaXMgdGhlIG1vcnBoaW5nIGhhbmRsZWQ/XG4gKlxuICogQ1NTIEFuY2hvcmluZyByZWxpZXMgb24gdHJhbnNpdGlvbnMgYW5kIGtleWZyYW1lcyBhbmQgdGhlIGludGVybmFsIGNvZGUgaXMgaW50ZWxsaWdlbnQgZW5vdWdoIHRvIGZpZ3VyZSBvdXRcbiAqIHdoYXQgQ1NTIGNsYXNzZXMgZGlmZmVyIGJldHdlZW4gdGhlIHN0YXJ0aW5nIGVsZW1lbnQgYW5kIHRoZSBkZXN0aW5hdGlvbiBlbGVtZW50LiBUaGVzZSBkaWZmZXJlbnQgQ1NTIGNsYXNzZXNcbiAqIHdpbGwgYmUgYWRkZWQvcmVtb3ZlZCBvbiB0aGUgYW5jaG9yIGVsZW1lbnQgYW5kIGEgdHJhbnNpdGlvbiB3aWxsIGJlIGFwcGxpZWQgKHRoZSB0cmFuc2l0aW9uIHRoYXQgaXMgcHJvdmlkZWRcbiAqIGluIHRoZSBhbmNob3IgY2xhc3MpLiBMb25nIHN0b3J5IHNob3J0LCBuZ0FuaW1hdGUgd2lsbCBmaWd1cmUgb3V0IHdoYXQgY2xhc3NlcyB0byBhZGQgYW5kIHJlbW92ZSB3aGljaCB3aWxsXG4gKiBtYWtlIHRoZSB0cmFuc2l0aW9uIG9mIHRoZSBlbGVtZW50IGFzIHNtb290aCBhbmQgYXV0b21hdGljIGFzIHBvc3NpYmxlLiBCZSBzdXJlIHRvIHVzZSBzaW1wbGUgQ1NTIGNsYXNzZXMgdGhhdFxuICogZG8gbm90IHJlbHkgb24gRE9NIG5lc3Rpbmcgc3RydWN0dXJlIHNvIHRoYXQgdGhlIGFuY2hvciBlbGVtZW50IGFwcGVhcnMgdGhlIHNhbWUgYXMgdGhlIHN0YXJ0aW5nIGVsZW1lbnQgKHNpbmNlXG4gKiB0aGUgY2xvbmVkIGVsZW1lbnQgaXMgcGxhY2VkIGluc2lkZSBvZiByb290IGVsZW1lbnQgd2hpY2ggaXMgbGlrZWx5IGNsb3NlIHRvIHRoZSBib2R5IGVsZW1lbnQpLlxuICpcbiAqIE5vdGUgdGhhdCBpZiB0aGUgcm9vdCBlbGVtZW50IGlzIG9uIHRoZSBgPGh0bWw+YCBlbGVtZW50IHRoZW4gdGhlIGNsb25lZCBub2RlIHdpbGwgYmUgcGxhY2VkIGluc2lkZSBvZiBib2R5LlxuICpcbiAqXG4gKiAjIyBVc2luZyAkYW5pbWF0ZSBpbiB5b3VyIGRpcmVjdGl2ZSBjb2RlXG4gKlxuICogU28gZmFyIHdlJ3ZlIGV4cGxvcmVkIGhvdyB0byBmZWVkIGluIGFuaW1hdGlvbnMgaW50byBhbiBBbmd1bGFyIGFwcGxpY2F0aW9uLCBidXQgaG93IGRvIHdlIHRyaWdnZXIgYW5pbWF0aW9ucyB3aXRoaW4gb3VyIG93biBkaXJlY3RpdmVzIGluIG91ciBhcHBsaWNhdGlvbj9cbiAqIEJ5IGluamVjdGluZyB0aGUgYCRhbmltYXRlYCBzZXJ2aWNlIGludG8gb3VyIGRpcmVjdGl2ZSBjb2RlLCB3ZSBjYW4gdHJpZ2dlciBzdHJ1Y3R1cmFsIGFuZCBjbGFzcy1iYXNlZCBob29rcyB3aGljaCBjYW4gdGhlbiBiZSBjb25zdW1lZCBieSBhbmltYXRpb25zLiBMZXQnc1xuICogaW1hZ2luZSB3ZSBoYXZlIGEgZ3JlZXRpbmcgYm94IHRoYXQgc2hvd3MgYW5kIGhpZGVzIGl0c2VsZiB3aGVuIHRoZSBkYXRhIGNoYW5nZXNcbiAqXG4gKiBgYGBodG1sXG4gKiA8Z3JlZXRpbmctYm94IGFjdGl2ZT1cIm9uT3JPZmZcIj5IaSB0aGVyZTwvZ3JlZXRpbmctYm94PlxuICogYGBgXG4gKlxuICogYGBganNcbiAqIG5nTW9kdWxlLmRpcmVjdGl2ZSgnZ3JlZXRpbmdCb3gnLCBbJyRhbmltYXRlJywgZnVuY3Rpb24oJGFuaW1hdGUpIHtcbiAqICAgcmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICogICAgIGF0dHJzLiRvYnNlcnZlKCdhY3RpdmUnLCBmdW5jdGlvbih2YWx1ZSkge1xuICogICAgICAgdmFsdWUgPyAkYW5pbWF0ZS5hZGRDbGFzcyhlbGVtZW50LCAnb24nKSA6ICRhbmltYXRlLnJlbW92ZUNsYXNzKGVsZW1lbnQsICdvbicpO1xuICogICAgIH0pO1xuICogICB9KTtcbiAqIH1dKTtcbiAqIGBgYFxuICpcbiAqIE5vdyB0aGUgYG9uYCBDU1MgY2xhc3MgaXMgYWRkZWQgYW5kIHJlbW92ZWQgb24gdGhlIGdyZWV0aW5nIGJveCBjb21wb25lbnQuIE5vdyBpZiB3ZSBhZGQgYSBDU1MgY2xhc3Mgb24gdG9wIG9mIHRoZSBncmVldGluZyBib3ggZWxlbWVudFxuICogaW4gb3VyIEhUTUwgY29kZSB0aGVuIHdlIGNhbiB0cmlnZ2VyIGEgQ1NTIG9yIEpTIGFuaW1hdGlvbiB0byBoYXBwZW4uXG4gKlxuICogYGBgY3NzXG4gKiAvJiM0Mjsgbm9ybWFsbHkgd2Ugd291bGQgY3JlYXRlIGEgQ1NTIGNsYXNzIHRvIHJlZmVyZW5jZSBvbiB0aGUgZWxlbWVudCAmIzQyOy9cbiAqIGdyZWV0aW5nLWJveC5vbiB7IHRyYW5zaXRpb246MC41cyBsaW5lYXIgYWxsOyBiYWNrZ3JvdW5kOmdyZWVuOyBjb2xvcjp3aGl0ZTsgfVxuICogYGBgXG4gKlxuICogVGhlIGAkYW5pbWF0ZWAgc2VydmljZSBjb250YWlucyBhIHZhcmlldHkgb2Ygb3RoZXIgbWV0aG9kcyBsaWtlIGBlbnRlcmAsIGBsZWF2ZWAsIGBhbmltYXRlYCBhbmQgYHNldENsYXNzYC4gVG8gbGVhcm4gbW9yZSBhYm91dCB3aGF0J3NcbiAqIHBvc3NpYmxlIGJlIHN1cmUgdG8gdmlzaXQgdGhlIHtAbGluayBuZy4kYW5pbWF0ZSAkYW5pbWF0ZSBzZXJ2aWNlIEFQSSBwYWdlfS5cbiAqXG4gKlxuICogIyMjIFByZXZlbnRpbmcgQ29sbGlzaW9ucyBXaXRoIFRoaXJkIFBhcnR5IExpYnJhcmllc1xuICpcbiAqIFNvbWUgdGhpcmQtcGFydHkgZnJhbWV3b3JrcyBwbGFjZSBhbmltYXRpb24gZHVyYXRpb24gZGVmYXVsdHMgYWNyb3NzIG1hbnkgZWxlbWVudCBvciBjbGFzc05hbWVcbiAqIHNlbGVjdG9ycyBpbiBvcmRlciB0byBtYWtlIHRoZWlyIGNvZGUgc21hbGwgYW5kIHJldXNlYWJsZS4gVGhpcyBjYW4gbGVhZCB0byBpc3N1ZXMgd2l0aCBuZ0FuaW1hdGUsIHdoaWNoXG4gKiBpcyBleHBlY3RpbmcgYWN0dWFsIGFuaW1hdGlvbnMgb24gdGhlc2UgZWxlbWVudHMgYW5kIGhhcyB0byB3YWl0IGZvciB0aGVpciBjb21wbGV0aW9uLlxuICpcbiAqIFlvdSBjYW4gcHJldmVudCB0aGlzIHVud2FudGVkIGJlaGF2aW9yIGJ5IHVzaW5nIGEgcHJlZml4IG9uIGFsbCB5b3VyIGFuaW1hdGlvbiBjbGFzc2VzOlxuICpcbiAqIGBgYGNzc1xuICogLyYjNDI7IHByZWZpeGVkIHdpdGggYW5pbWF0ZS0gJiM0MjsvXG4gKiAuYW5pbWF0ZS1mYWRlLWFkZC5hbmltYXRlLWZhZGUtYWRkLWFjdGl2ZSB7XG4gKiAgIHRyYW5zaXRpb246MXMgbGluZWFyIGFsbDtcbiAqICAgb3BhY2l0eTowO1xuICogfVxuICogYGBgXG4gKlxuICogWW91IHRoZW4gY29uZmlndXJlIGAkYW5pbWF0ZWAgdG8gZW5mb3JjZSB0aGlzIHByZWZpeDpcbiAqXG4gKiBgYGBqc1xuICogJGFuaW1hdGVQcm92aWRlci5jbGFzc05hbWVGaWx0ZXIoL2FuaW1hdGUtLyk7XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGFsc28gbWF5IHByb3ZpZGUgeW91ciBhcHBsaWNhdGlvbiB3aXRoIGEgc3BlZWQgYm9vc3Qgc2luY2Ugb25seSBzcGVjaWZpYyBlbGVtZW50cyBjb250YWluaW5nIENTUyBjbGFzcyBwcmVmaXhcbiAqIHdpbGwgYmUgZXZhbHVhdGVkIGZvciBhbmltYXRpb24gd2hlbiBhbnkgRE9NIGNoYW5nZXMgb2NjdXIgaW4gdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIENhbGxiYWNrcyBhbmQgUHJvbWlzZXNcbiAqXG4gKiBXaGVuIGAkYW5pbWF0ZWAgaXMgY2FsbGVkIGl0IHJldHVybnMgYSBwcm9taXNlIHRoYXQgY2FuIGJlIHVzZWQgdG8gY2FwdHVyZSB3aGVuIHRoZSBhbmltYXRpb24gaGFzIGVuZGVkLiBUaGVyZWZvcmUgaWYgd2Ugd2VyZSB0byB0cmlnZ2VyXG4gKiBhbiBhbmltYXRpb24gKHdpdGhpbiBvdXIgZGlyZWN0aXZlIGNvZGUpIHRoZW4gd2UgY2FuIGNvbnRpbnVlIHBlcmZvcm1pbmcgZGlyZWN0aXZlIGFuZCBzY29wZSByZWxhdGVkIGFjdGl2aXRpZXMgYWZ0ZXIgdGhlIGFuaW1hdGlvbiBoYXNcbiAqIGVuZGVkIGJ5IGNoYWluaW5nIG9udG8gdGhlIHJldHVybmVkIHByb21pc2UgdGhhdCBhbmltYXRpb24gbWV0aG9kIHJldHVybnMuXG4gKlxuICogYGBganNcbiAqIC8vIHNvbWV3aGVyZSB3aXRoaW4gdGhlIGRlcHRocyBvZiB0aGUgZGlyZWN0aXZlXG4gKiAkYW5pbWF0ZS5lbnRlcihlbGVtZW50LCBwYXJlbnQpLnRoZW4oZnVuY3Rpb24oKSB7XG4gKiAgIC8vdGhlIGFuaW1hdGlvbiBoYXMgY29tcGxldGVkXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIChOb3RlIHRoYXQgZWFybGllciB2ZXJzaW9ucyBvZiBBbmd1bGFyIHByaW9yIHRvIHYxLjQgcmVxdWlyZWQgdGhlIHByb21pc2UgY29kZSB0byBiZSB3cmFwcGVkIHVzaW5nIGAkc2NvcGUuJGFwcGx5KC4uLilgLiBUaGlzIGlzIG5vdCB0aGUgY2FzZVxuICogYW55bW9yZS4pXG4gKlxuICogSW4gYWRkaXRpb24gdG8gdGhlIGFuaW1hdGlvbiBwcm9taXNlLCB3ZSBjYW4gYWxzbyBtYWtlIHVzZSBvZiBhbmltYXRpb24tcmVsYXRlZCBjYWxsYmFja3Mgd2l0aGluIG91ciBkaXJlY3RpdmVzIGFuZCBjb250cm9sbGVyIGNvZGUgYnkgcmVnaXN0ZXJpbmdcbiAqIGFuIGV2ZW50IGxpc3RlbmVyIHVzaW5nIHRoZSBgJGFuaW1hdGVgIHNlcnZpY2UuIExldCdzIHNheSBmb3IgZXhhbXBsZSB0aGF0IGFuIGFuaW1hdGlvbiB3YXMgdHJpZ2dlcmVkIG9uIG91ciB2aWV3XG4gKiByb3V0aW5nIGNvbnRyb2xsZXIgdG8gaG9vayBpbnRvIHRoYXQ6XG4gKlxuICogYGBganNcbiAqIG5nTW9kdWxlLmNvbnRyb2xsZXIoJ0hvbWVQYWdlQ29udHJvbGxlcicsIFsnJGFuaW1hdGUnLCBmdW5jdGlvbigkYW5pbWF0ZSkge1xuICogICAkYW5pbWF0ZS5vbignZW50ZXInLCBuZ1ZpZXdFbGVtZW50LCBmdW5jdGlvbihlbGVtZW50KSB7XG4gKiAgICAgLy8gdGhlIGFuaW1hdGlvbiBmb3IgdGhpcyByb3V0ZSBoYXMgY29tcGxldGVkXG4gKiAgIH1dKTtcbiAqIH1dKVxuICogYGBgXG4gKlxuICogKE5vdGUgdGhhdCB5b3Ugd2lsbCBuZWVkIHRvIHRyaWdnZXIgYSBkaWdlc3Qgd2l0aGluIHRoZSBjYWxsYmFjayB0byBnZXQgYW5ndWxhciB0byBub3RpY2UgYW55IHNjb3BlLXJlbGF0ZWQgY2hhbmdlcy4pXG4gKi9cblxuLyoqXG4gKiBAbmdkb2Mgc2VydmljZVxuICogQG5hbWUgJGFuaW1hdGVcbiAqIEBraW5kIG9iamVjdFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogVGhlIG5nQW5pbWF0ZSBgJGFuaW1hdGVgIHNlcnZpY2UgZG9jdW1lbnRhdGlvbiBpcyB0aGUgc2FtZSBmb3IgdGhlIGNvcmUgYCRhbmltYXRlYCBzZXJ2aWNlLlxuICpcbiAqIENsaWNrIGhlcmUge0BsaW5rIG5nLiRhbmltYXRlIHRvIGxlYXJuIG1vcmUgYWJvdXQgYW5pbWF0aW9ucyB3aXRoIGAkYW5pbWF0ZWB9LlxuICovXG5hbmd1bGFyLm1vZHVsZSgnbmdBbmltYXRlJywgW10pXG4gIC5kaXJlY3RpdmUoJ25nQW5pbWF0ZVN3YXAnLCBuZ0FuaW1hdGVTd2FwRGlyZWN0aXZlKVxuXG4gIC5kaXJlY3RpdmUoJ25nQW5pbWF0ZUNoaWxkcmVuJywgJCRBbmltYXRlQ2hpbGRyZW5EaXJlY3RpdmUpXG4gIC5mYWN0b3J5KCckJHJBRlNjaGVkdWxlcicsICQkckFGU2NoZWR1bGVyRmFjdG9yeSlcblxuICAucHJvdmlkZXIoJyQkYW5pbWF0ZVF1ZXVlJywgJCRBbmltYXRlUXVldWVQcm92aWRlcilcbiAgLnByb3ZpZGVyKCckJGFuaW1hdGlvbicsICQkQW5pbWF0aW9uUHJvdmlkZXIpXG5cbiAgLnByb3ZpZGVyKCckYW5pbWF0ZUNzcycsICRBbmltYXRlQ3NzUHJvdmlkZXIpXG4gIC5wcm92aWRlcignJCRhbmltYXRlQ3NzRHJpdmVyJywgJCRBbmltYXRlQ3NzRHJpdmVyUHJvdmlkZXIpXG5cbiAgLnByb3ZpZGVyKCckJGFuaW1hdGVKcycsICQkQW5pbWF0ZUpzUHJvdmlkZXIpXG4gIC5wcm92aWRlcignJCRhbmltYXRlSnNEcml2ZXInLCAkJEFuaW1hdGVKc0RyaXZlclByb3ZpZGVyKTtcblxuXG59KSh3aW5kb3csIHdpbmRvdy5hbmd1bGFyKTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2FuZ3VsYXItYW5pbWF0ZS9hbmd1bGFyLWFuaW1hdGUuanNcbiAqKiBtb2R1bGUgaWQgPSAzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgbWVudVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9tZW51LXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IG1lbnUgPSB7XHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkdGltZW91dCkge1xyXG4gICAgICAgIHRoaXMuY2FyYm9oeWRyYXRlcyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucHJvdGVpbnMgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNldERpZXQgPSBmdW5jdGlvbihkaWV0KSB7XHJcbiAgICAgICAgICAgIGlmKHRoaXNbZGlldF0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXNbZGlldF0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHRoaXNbZGlldF0gPSB0cnVlLCAwKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNhcmJvaHlkcmF0ZXMgPSBkaWV0ID09PSAnY2FyYm9oeWRyYXRlcyc7XHJcbiAgICAgICAgICAgIHRoaXMucHJvdGVpbnMgPSBkaWV0ID09PSAncHJvdGVpbnMnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnc3RhcnQnO1xyXG4gICAgICAgIHRoaXMuc2V0Q2xhc3NOYW1lID0gZnVuY3Rpb24ocGhhc2VJZCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jbGFzc05hbWUgIT09ICdzdGFydCcpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnYWN0aXZlJyArIHBoYXNlSWQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLm1vdmVMZWZ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICBsZXQgbnVtYiA9ICt0aGlzLmNsYXNzTmFtZS5zbGljZSgtMSk7XHJcbiAgICAgICAgICAgIG51bWIgLT0gMTtcclxuICAgICAgICAgICAgaWYgKCFudW1iKSBudW1iID0gMztcclxuICAgICAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnYWN0aXZlJyArIG51bWI7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLm1vdmVSaWdodCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgbnVtYiA9ICt0aGlzLmNsYXNzTmFtZS5zbGljZSgtMSk7XHJcbiAgICAgICAgICAgIG51bWIgKz0gMTtcclxuICAgICAgICAgICAgaWYgKG51bWIgPiAzKSBudW1iID0gMTtcclxuICAgICAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnYWN0aXZlJyArIG51bWI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogbWVudVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1lbnU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC9tZW51L21lbnUtY29tcG9uZW50LmpzXG4gKiogbW9kdWxlIGlkID0gNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJtZW51LWJyXFxcIj48L2Rpdj4gPGRpdiBpZD1cXFwibWVudVxcXCI+IDxkaXYgY2xhc3M9XFxcImRpZXQtbWVudVxcXCI+IDxkaXYgY2xhc3M9XFxcImRpZXQtdGl0dGxlXFxcIj7QktC40LQg0LTQuNC10YLRizo8L2Rpdj4gPGRpdiBjbGFzcz1cXFwiZGlldC1jaG9vc2VcXFwiPiA8c3BhbiBjbGFzcz1cXFwiZGlldFxcXCIgbmctY2xhc3M9XFxcInthY3RpdmU6ICRjdHJsLnByb3RlaW5zfVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldERpZXQoJ3Byb3RlaW5zJylcXFwiPtCS0YvRgdC+0LrQvtC/0YDQvtGC0LXQuNC90L7QstCw0Y8g0LrQvtC80LHQuNC90LDRhtC40Y8g0LfQsNC80LXQvTwvc3Bhbj5cXG48c3BhbiBjbGFzcz1cXFwic2xhc2hcXFwiPi88L3NwYW4+XFxuPHNwYW4gY2xhc3M9XFxcImRpZXRcXFwiIG5nLWNsYXNzPVxcXCJ7YWN0aXZlOiAkY3RybC5jYXJib2h5ZHJhdGVzfVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldERpZXQoJ2NhcmJvaHlkcmF0ZXMnKVxcXCI+0JLRi9GB0L7QutC+0YPQs9C70LXQstC+0LTQvdCw0Y8g0LrQvtC80LHQuNC90LDRhtC40Y8g0LfQsNC80LXQvTwvc3Bhbj4gPC9kaXY+IDwvZGl2PiA8ZGl2IGNsYXNzPVxcXCJwaGFzZS1tZW51XFxcIj4gPGRpdiBjbGFzcz1cXFwicGhhc2UtdGl0dGxlXFxcIj7QktGL0LHQtdGA0LXRgtC1INCS0LDRiNGDINGE0LDQt9GDOjwvZGl2PiA8ZGl2IGNsYXNzPVxcXCJwaGFzZS1jaG9vc2VcXFwiPiA8ZGl2IGlkPVxcXCJhcnJvdy1sZWZ0XFxcIiBuZy1jbGFzcz1cXFwiJGN0cmwuY2xhc3NOYW1lXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwubW92ZUxlZnQoKVxcXCI+PC9kaXY+IDxhIGhyZWY9XFxcIiNcXFwiIG5nLWNsYXNzPVxcXCIkY3RybC5jbGFzc05hbWVcXFwiIGNsYXNzPVxcXCJmaXJzdC1waGFzZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldENsYXNzTmFtZSgxKVxcXCI+MTwvYT5cXG48YSBocmVmPVxcXCIjXFxcIiBuZy1jbGFzcz1cXFwiJGN0cmwuY2xhc3NOYW1lXFxcIiBjbGFzcz1cXFwic2Vjb25kLXBoYXNlXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2V0Q2xhc3NOYW1lKDIpXFxcIj4yPC9hPlxcbjxhIGhyZWY9XFxcIiNcXFwiIG5nLWNsYXNzPVxcXCIkY3RybC5jbGFzc05hbWVcXFwiIGNsYXNzPVxcXCJ0aGlyZC1waGFzZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldENsYXNzTmFtZSgzKVxcXCI+MzwvYT4gPGRpdiBpZD1cXFwiYXJyb3ctcmlnaHRcXFwiIG5nLWNsYXNzPVxcXCIkY3RybC5jbGFzc05hbWVcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5tb3ZlUmlnaHQoKVxcXCI+PC9kaXY+IDwvZGl2PiA8L2Rpdj4gPC9kaXY+IDxkaXYgY2xhc3M9XFxcIm1lbnUtYnJcXFwiPjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJtZW51LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL21lbnUvdGVtcGxhdGUvbWVudS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3RDQTs7Ozs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBOzs7Ozs7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3hoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Iiwic291cmNlUm9vdCI6IiJ9