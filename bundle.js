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

	'use strict';

		__webpack_require__(1);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var autocomplite = __webpack_require__(2);
	var diaryModule = __webpack_require__(3);
	var tableModule = __webpack_require__(14);

	var app = angular.module('app', ['diary', 'table', 'ngAnimate', 'angucomplete-alt']);

	app.filter('limit', __webpack_require__(19));
	app.factory('dataService', __webpack_require__(20)).factory('validationService', __webpack_require__(21)).factory('calculationService', __webpack_require__(22)).factory('limitsService', __webpack_require__(23));

		module.exports = app;

/***/ },
/* 2 */
/***/ function(module, exports) {

	/*
	 * angucomplete-alt
	 * Autocomplete directive for AngularJS
	 * This is a fork of Daryl Rowland's angucomplete with some extra features.
	 * By Hidenari Nozaki
	 */

	/*! Copyright (c) 2014 Hidenari Nozaki and contributors | Licensed under the MIT license */

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	angular.module('angucomplete-alt', []).directive('angucompleteAlt', ['$q', '$parse', '$http', '$sce', '$timeout', '$templateCache', '$interpolate', function ($q, $parse, $http, $sce, $timeout, $templateCache, $interpolate) {
	  // keyboard events
	  var KEY_DW = 40;
	  var KEY_RT = 39;
	  var KEY_UP = 38;
	  var KEY_LF = 37;
	  var KEY_ES = 27;
	  var KEY_EN = 13;
	  var KEY_TAB = 9;

	  var MIN_LENGTH = 3;
	  var MAX_LENGTH = 524288; // the default max length per the html maxlength attribute
	  var PAUSE = 500;
	  var BLUR_TIMEOUT = 200;

	  // string constants
	  var REQUIRED_CLASS = 'autocomplete-required';
	  var TEXT_SEARCHING = 'Поиск...';
	  var TEXT_NORESULTS = 'Нет совпадений';
	  var TEMPLATE_URL = '/angucomplete-alt/index.html';

	  // Set the default template for this directive
	  $templateCache.put(TEMPLATE_URL, '<div class="angucomplete-holder" ng-class="{\'angucomplete-dropdown-visible\': showDropdown}">' + '  <input id="{{id}}_value" name="{{inputName}}" tabindex="{{fieldTabindex}}" ng-class="{\'angucomplete-input-not-empty\': notEmpty}" ng-model="searchStr" ng-disabled="disableInput" type="{{inputType}}" placeholder="{{placeholder}}" maxlength="{{maxlength}}" ng-focus="onFocusHandler()" class="{{inputClass}}" ng-focus="resetHideResults()" ng-blur="hideResults($event)" autocapitalize="off" autocorrect="off" autocomplete="off" ng-change="inputChangeHandler(searchStr)"/>' + '  <div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-show="showDropdown">' + '    <div class="angucomplete-searching" ng-show="searching" ng-bind="textSearching"></div>' + '    <div class="angucomplete-searching" ng-show="!searching && (!results || results.length == 0)" ng-bind="textNoResults"></div>' + '    <div class="angucomplete-row" ng-repeat="result in results" ng-click="selectResult(result)" ng-mouseenter="hoverRow($index)" ng-class="{\'angucomplete-selected-row\': $index == currentIndex}">' + '      <div ng-if="imageField" class="angucomplete-image-holder">' + '        <img ng-if="result.image && result.image != \'\'" ng-src="{{result.image}}" class="angucomplete-image"/>' + '        <div ng-if="!result.image && result.image != \'\'" class="angucomplete-image-default"></div>' + '      </div>' + '      <div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div>' + '      <div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div>' + '      <div ng-if="matchClass && result.description && result.description != \'\'" class="angucomplete-description" ng-bind-html="result.description"></div>' + '      <div ng-if="!matchClass && result.description && result.description != \'\'" class="angucomplete-description">{{result.description}}</div>' + '    </div>' + '  </div>' + '</div>');

	  function link(scope, elem, attrs, ctrl) {
	    var inputField = elem.find('input');
	    var minlength = MIN_LENGTH;
	    var searchTimer = null;
	    var hideTimer;
	    var requiredClassName = REQUIRED_CLASS;
	    var responseFormatter;
	    var validState = null;
	    var httpCanceller = null;
	    var dd = elem[0].querySelector('.angucomplete-dropdown');
	    var isScrollOn = false;
	    var mousedownOn = null;
	    var unbindInitialValue;
	    var displaySearching;
	    var displayNoResults;

	    elem.on('mousedown', function (event) {
	      if (event.target.id) {
	        mousedownOn = event.target.id;
	        if (mousedownOn === scope.id + '_dropdown') {
	          document.body.addEventListener('click', clickoutHandlerForDropdown);
	        }
	      } else {
	        mousedownOn = event.target.className;
	      }
	    });

	    scope.currentIndex = scope.focusFirst ? 0 : null;
	    scope.searching = false;
	    unbindInitialValue = scope.$watch('initialValue', function (newval) {
	      if (newval) {
	        // remove scope listener
	        unbindInitialValue();
	        // change input
	        handleInputChange(newval, true);
	      }
	    });

	    scope.$watch('fieldRequired', function (newval, oldval) {
	      if (newval !== oldval) {
	        if (!newval) {
	          ctrl[scope.inputName].$setValidity(requiredClassName, true);
	        } else if (!validState || scope.currentIndex === -1) {
	          handleRequired(false);
	        } else {
	          handleRequired(true);
	        }
	      }
	    });

	    scope.$on('angucomplete-alt:clearInput', function (event, elementId) {
	      if (!elementId || elementId === scope.id) {
	        scope.searchStr = null;
	        callOrAssign();
	        handleRequired(false);
	        clearResults();
	      }
	    });

	    scope.$on('angucomplete-alt:changeInput', function (event, elementId, newval) {
	      if (!!elementId && elementId === scope.id) {
	        handleInputChange(newval);
	      }
	    });

	    function handleInputChange(newval, initial) {
	      if (newval) {
	        if ((typeof newval === 'undefined' ? 'undefined' : _typeof(newval)) === 'object') {
	          scope.searchStr = extractTitle(newval);
	          callOrAssign({ originalObject: newval });
	        } else if (typeof newval === 'string' && newval.length > 0) {
	          scope.searchStr = newval;
	        } else {
	          if (console && console.error) {
	            console.error('Tried to set ' + (!!initial ? 'initial' : '') + ' value of angucomplete to', newval, 'which is an invalid value');
	          }
	        }

	        handleRequired(true);
	      }
	    }

	    // #194 dropdown list not consistent in collapsing (bug).
	    function clickoutHandlerForDropdown(event) {
	      mousedownOn = null;
	      scope.hideResults(event);
	      document.body.removeEventListener('click', clickoutHandlerForDropdown);
	    }

	    // for IE8 quirkiness about event.which
	    function ie8EventNormalizer(event) {
	      return event.which ? event.which : event.keyCode;
	    }

	    function callOrAssign(value) {
	      if (typeof scope.selectedObject === 'function') {
	        scope.selectedObject(value);
	      } else {
	        scope.selectedObject = value;
	      }

	      if (value) {
	        handleRequired(true);
	      } else {
	        handleRequired(false);
	      }
	    }

	    function callFunctionOrIdentity(fn) {
	      return function (data) {
	        return scope[fn] ? scope[fn](data) : data;
	      };
	    }

	    function setInputString(str) {
	      callOrAssign({ originalObject: str });

	      if (scope.clearSelected) {
	        scope.searchStr = null;
	      }
	      clearResults();
	    }

	    function extractTitle(data) {
	      // split title fields and run extractValue for each and join with ' '
	      return scope.titleField.split(',').map(function (field) {
	        return extractValue(data, field);
	      }).join(' ');
	    }

	    function extractValue(obj, key) {
	      var keys, result;
	      if (key) {
	        keys = key.split('.');
	        result = obj;
	        for (var i = 0; i < keys.length; i++) {
	          result = result[keys[i]];
	        }
	      } else {
	        result = obj;
	      }
	      return result;
	    }

	    function findMatchString(target, str) {
	      var result, matches, re;
	      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
	      // Escape user input to be treated as a literal string within a regular expression
	      re = new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
	      if (!target) {
	        return;
	      }
	      if (!target.match || !target.replace) {
	        target = target.toString();
	      }
	      matches = target.match(re);
	      if (matches) {
	        result = target.replace(re, '<span class="' + scope.matchClass + '">' + matches[0] + '</span>');
	      } else {
	        result = target;
	      }
	      return $sce.trustAsHtml(result);
	    }

	    function handleRequired(valid) {
	      scope.notEmpty = valid;
	      validState = scope.searchStr;
	      if (scope.fieldRequired && ctrl && scope.inputName) {
	        ctrl[scope.inputName].$setValidity(requiredClassName, valid);
	      }
	    }

	    function keyupHandler(event) {
	      var which = ie8EventNormalizer(event);
	      if (which === KEY_LF || which === KEY_RT) {
	        // do nothing
	        return;
	      }

	      if (which === KEY_UP || which === KEY_EN) {
	        event.preventDefault();
	      } else if (which === KEY_DW) {
	        event.preventDefault();
	        if (!scope.showDropdown && scope.searchStr && scope.searchStr.length >= minlength) {
	          initResults();
	          scope.searching = true;
	          searchTimerComplete(scope.searchStr);
	        }
	      } else if (which === KEY_ES) {
	        clearResults();
	        scope.$apply(function () {
	          inputField.val(scope.searchStr);
	        });
	      } else {
	        if (minlength === 0 && !scope.searchStr) {
	          return;
	        }

	        if (!scope.searchStr || scope.searchStr === '') {
	          scope.showDropdown = false;
	        } else if (scope.searchStr.length >= minlength) {
	          initResults();

	          if (searchTimer) {
	            $timeout.cancel(searchTimer);
	          }

	          scope.searching = true;

	          searchTimer = $timeout(function () {
	            searchTimerComplete(scope.searchStr);
	          }, scope.pause);
	        }

	        if (validState && validState !== scope.searchStr && !scope.clearSelected) {
	          scope.$apply(function () {
	            callOrAssign();
	          });
	        }
	      }
	    }

	    function handleOverrideSuggestions(event) {
	      if (scope.overrideSuggestions && !(scope.selectedObject && scope.selectedObject.originalObject === scope.searchStr)) {
	        if (event) {
	          event.preventDefault();
	        }

	        // cancel search timer
	        $timeout.cancel(searchTimer);
	        // cancel http request
	        cancelHttpRequest();

	        setInputString(scope.searchStr);
	      }
	    }

	    function dropdownRowOffsetHeight(row) {
	      var css = getComputedStyle(row);
	      return row.offsetHeight + parseInt(css.marginTop, 10) + parseInt(css.marginBottom, 10);
	    }

	    function dropdownHeight() {
	      return dd.getBoundingClientRect().top + parseInt(getComputedStyle(dd).maxHeight, 10);
	    }

	    function dropdownRow() {
	      return elem[0].querySelectorAll('.angucomplete-row')[scope.currentIndex];
	    }

	    function dropdownRowTop() {
	      return dropdownRow().getBoundingClientRect().top - (dd.getBoundingClientRect().top + parseInt(getComputedStyle(dd).paddingTop, 10));
	    }

	    function dropdownScrollTopTo(offset) {
	      dd.scrollTop = dd.scrollTop + offset;
	    }

	    function updateInputField() {
	      var current = scope.results[scope.currentIndex];
	      if (scope.matchClass) {
	        inputField.val(extractTitle(current.originalObject));
	      } else {
	        inputField.val(current.title);
	      }
	    }

	    function keydownHandler(event) {
	      var which = ie8EventNormalizer(event);
	      var row = null;
	      var rowTop = null;

	      if (which === KEY_EN && scope.results) {
	        if (scope.currentIndex >= 0 && scope.currentIndex < scope.results.length) {
	          event.preventDefault();
	          scope.selectResult(scope.results[scope.currentIndex]);
	        } else {
	          handleOverrideSuggestions(event);
	          clearResults();
	        }
	        scope.$apply();
	      } else if (which === KEY_DW && scope.results) {
	        event.preventDefault();
	        if (scope.currentIndex + 1 < scope.results.length && scope.showDropdown) {
	          scope.$apply(function () {
	            scope.currentIndex++;
	            updateInputField();
	          });

	          if (isScrollOn) {
	            row = dropdownRow();
	            if (dropdownHeight() < row.getBoundingClientRect().bottom) {
	              dropdownScrollTopTo(dropdownRowOffsetHeight(row));
	            }
	          }
	        }
	      } else if (which === KEY_UP && scope.results) {
	        event.preventDefault();
	        if (scope.currentIndex >= 1) {
	          scope.$apply(function () {
	            scope.currentIndex--;
	            updateInputField();
	          });

	          if (isScrollOn) {
	            rowTop = dropdownRowTop();
	            if (rowTop < 0) {
	              dropdownScrollTopTo(rowTop - 1);
	            }
	          }
	        } else if (scope.currentIndex === 0) {
	          scope.$apply(function () {
	            scope.currentIndex = -1;
	            inputField.val(scope.searchStr);
	          });
	        }
	      } else if (which === KEY_TAB) {
	        if (scope.results && scope.results.length > 0 && scope.showDropdown) {
	          if (scope.currentIndex === -1 && scope.overrideSuggestions) {
	            // intentionally not sending event so that it does not
	            // prevent default tab behavior
	            handleOverrideSuggestions();
	          } else {
	            if (scope.currentIndex === -1) {
	              scope.currentIndex = 0;
	            }
	            scope.selectResult(scope.results[scope.currentIndex]);
	            scope.$digest();
	          }
	        } else {
	          // no results
	          // intentionally not sending event so that it does not
	          // prevent default tab behavior
	          if (scope.searchStr && scope.searchStr.length > 0) {
	            handleOverrideSuggestions();
	          }
	        }
	      } else if (which === KEY_ES) {
	        // This is very specific to IE10/11 #272
	        // without this, IE clears the input text
	        event.preventDefault();
	      }
	    }

	    function httpSuccessCallbackGen(str) {
	      return function (responseData, status, headers, config) {
	        // normalize return obejct from promise
	        if (!status && !headers && !config && responseData.data) {
	          responseData = responseData.data;
	        }
	        scope.searching = false;
	        processResults(extractValue(responseFormatter(responseData), scope.remoteUrlDataField), str);
	      };
	    }

	    function httpErrorCallback(errorRes, status, headers, config) {
	      // cancelled/aborted
	      if (status === 0 || status === -1) {
	        return;
	      }

	      // normalize return obejct from promise
	      if (!status && !headers && !config) {
	        status = errorRes.status;
	      }
	      if (scope.remoteUrlErrorCallback) {
	        scope.remoteUrlErrorCallback(errorRes, status, headers, config);
	      } else {
	        if (console && console.error) {
	          console.error('http error');
	        }
	      }
	    }

	    function cancelHttpRequest() {
	      if (httpCanceller) {
	        httpCanceller.resolve();
	      }
	    }

	    function getRemoteResults(str) {
	      var params = {},
	          url = scope.remoteUrl + encodeURIComponent(str);
	      if (scope.remoteUrlRequestFormatter) {
	        params = { params: scope.remoteUrlRequestFormatter(str) };
	        url = scope.remoteUrl;
	      }
	      if (!!scope.remoteUrlRequestWithCredentials) {
	        params.withCredentials = true;
	      }
	      cancelHttpRequest();
	      httpCanceller = $q.defer();
	      params.timeout = httpCanceller.promise;
	      $http.get(url, params).success(httpSuccessCallbackGen(str)).error(httpErrorCallback);
	    }

	    function getRemoteResultsWithCustomHandler(str) {
	      cancelHttpRequest();

	      httpCanceller = $q.defer();

	      scope.remoteApiHandler(str, httpCanceller.promise).then(httpSuccessCallbackGen(str)).catch(httpErrorCallback);

	      /* IE8 compatible
	       scope.remoteApiHandler(str, httpCanceller.promise)
	       ['then'](httpSuccessCallbackGen(str))
	       ['catch'](httpErrorCallback);
	       */
	    }

	    function clearResults() {
	      scope.showDropdown = false;
	      scope.results = [];
	      if (dd) {
	        dd.scrollTop = 0;
	      }
	    }

	    function initResults() {
	      scope.showDropdown = displaySearching;
	      scope.currentIndex = scope.focusFirst ? 0 : -1;
	      scope.results = [];
	    }

	    function getLocalResults(str) {
	      var i,
	          match,
	          s,
	          value,
	          searchFields = scope.searchFields.split(','),
	          matches = [];
	      if (typeof scope.parseInput() !== 'undefined') {
	        str = scope.parseInput()(str);
	      }
	      for (i = 0; i < scope.localData.length; i++) {
	        match = false;

	        for (s = 0; s < searchFields.length; s++) {
	          value = extractValue(scope.localData[i], searchFields[s]) || '';
	          match = match || value.toString().toLowerCase().indexOf(str.toString().toLowerCase()) >= 0;
	        }

	        if (match) {
	          matches[matches.length] = scope.localData[i];
	        }
	      }
	      return matches;
	    }

	    function checkExactMatch(result, obj, str) {
	      if (!str) {
	        return false;
	      }
	      for (var key in obj) {
	        if (obj[key].toLowerCase() === str.toLowerCase()) {
	          scope.selectResult(result);
	          return true;
	        }
	      }
	      return false;
	    }

	    function searchTimerComplete(str) {
	      // Begin the search
	      if (!str || str.length < minlength) {
	        return;
	      }
	      if (scope.localData) {
	        scope.$apply(function () {
	          var matches;
	          if (typeof scope.localSearch() !== 'undefined') {
	            matches = scope.localSearch()(str);
	          } else {
	            matches = getLocalResults(str);
	          }
	          scope.searching = false;
	          processResults(matches, str);
	        });
	      } else if (scope.remoteApiHandler) {
	        getRemoteResultsWithCustomHandler(str);
	      } else {
	        getRemoteResults(str);
	      }
	    }

	    function processResults(responseData, str) {
	      var i, description, image, text, formattedText, formattedDesc;

	      if (responseData && responseData.length > 0) {
	        scope.results = [];

	        for (i = 0; i < responseData.length; i++) {
	          if (scope.titleField && scope.titleField !== '') {
	            text = formattedText = extractTitle(responseData[i]);
	          }

	          description = '';
	          if (scope.descriptionField) {
	            description = formattedDesc = extractValue(responseData[i], scope.descriptionField);
	          }

	          image = '';
	          if (scope.imageField) {
	            image = extractValue(responseData[i], scope.imageField);
	          }

	          if (scope.matchClass) {
	            formattedText = findMatchString(text, str);
	            formattedDesc = findMatchString(description, str);
	          }

	          scope.results[scope.results.length] = {
	            title: formattedText,
	            description: formattedDesc,
	            image: image,
	            originalObject: responseData[i]
	          };
	        }
	      } else {
	        scope.results = [];
	      }

	      if (scope.autoMatch && scope.results.length === 1 && checkExactMatch(scope.results[0], { title: text, desc: description || '' }, scope.searchStr)) {
	        scope.showDropdown = false;
	      } else if (scope.results.length === 0 && !displayNoResults) {
	        scope.showDropdown = false;
	      } else {
	        scope.showDropdown = true;
	      }
	    }

	    function showAll() {
	      if (scope.localData) {
	        processResults(scope.localData, '');
	      } else if (scope.remoteApiHandler) {
	        getRemoteResultsWithCustomHandler('');
	      } else {
	        getRemoteResults('');
	      }
	    }

	    scope.onFocusHandler = function () {
	      if (scope.focusIn) {
	        scope.focusIn();
	      }
	      if (minlength === 0 && (!scope.searchStr || scope.searchStr.length === 0)) {
	        scope.currentIndex = scope.focusFirst ? 0 : scope.currentIndex;
	        scope.showDropdown = true;
	        showAll();
	      }
	    };

	    scope.hideResults = function () {
	      if (mousedownOn && (mousedownOn === scope.id + '_dropdown' || mousedownOn.indexOf('angucomplete') >= 0)) {
	        mousedownOn = null;
	      } else {
	        hideTimer = $timeout(function () {
	          clearResults();
	          scope.$apply(function () {
	            if (scope.searchStr && scope.searchStr.length > 0) {
	              inputField.val(scope.searchStr);
	            }
	          });
	        }, BLUR_TIMEOUT);
	        cancelHttpRequest();

	        if (scope.focusOut) {
	          scope.focusOut();
	        }

	        if (scope.overrideSuggestions) {
	          if (scope.searchStr && scope.searchStr.length > 0 && scope.currentIndex === -1) {
	            handleOverrideSuggestions();
	          }
	        }
	      }
	    };

	    scope.resetHideResults = function () {
	      if (hideTimer) {
	        $timeout.cancel(hideTimer);
	      }
	    };

	    scope.hoverRow = function (index) {
	      scope.currentIndex = index;
	    };

	    scope.selectResult = function (result) {
	      // Restore original values
	      if (scope.matchClass) {
	        result.title = extractTitle(result.originalObject);
	        result.description = extractValue(result.originalObject, scope.descriptionField);
	      }

	      if (scope.clearSelected) {
	        scope.searchStr = null;
	      } else {
	        scope.searchStr = result.title;
	      }
	      callOrAssign(result);
	      clearResults();
	    };

	    scope.inputChangeHandler = function (str) {
	      if (str.length < minlength) {
	        cancelHttpRequest();
	        clearResults();
	      } else if (str.length === 0 && minlength === 0) {
	        scope.searching = false;
	        showAll();
	      }

	      if (scope.inputChanged) {
	        str = scope.inputChanged(str);
	      }
	      return str;
	    };

	    // check required
	    if (scope.fieldRequiredClass && scope.fieldRequiredClass !== '') {
	      requiredClassName = scope.fieldRequiredClass;
	    }

	    // check min length
	    if (scope.minlength && scope.minlength !== '') {
	      minlength = parseInt(scope.minlength, 10);
	    }

	    // check pause time
	    if (!scope.pause) {
	      scope.pause = PAUSE;
	    }

	    // check clearSelected
	    if (!scope.clearSelected) {
	      scope.clearSelected = false;
	    }

	    // check override suggestions
	    if (!scope.overrideSuggestions) {
	      scope.overrideSuggestions = false;
	    }

	    // check required field
	    if (scope.fieldRequired && ctrl) {
	      // check initial value, if given, set validitity to true
	      if (scope.initialValue) {
	        handleRequired(true);
	      } else {
	        handleRequired(false);
	      }
	    }

	    scope.inputType = attrs.type ? attrs.type : 'text';

	    // set strings for "Searching..." and "No results"
	    scope.textSearching = attrs.textSearching ? attrs.textSearching : TEXT_SEARCHING;
	    scope.textNoResults = attrs.textNoResults ? attrs.textNoResults : TEXT_NORESULTS;
	    displaySearching = scope.textSearching === 'false' ? false : true;
	    displayNoResults = scope.textNoResults === 'false' ? false : true;

	    // set max length (default to maxlength deault from html
	    scope.maxlength = attrs.maxlength ? attrs.maxlength : MAX_LENGTH;

	    // register events
	    inputField.on('keydown', keydownHandler);
	    inputField.on('keyup', keyupHandler);

	    // set response formatter
	    responseFormatter = callFunctionOrIdentity('remoteUrlResponseFormatter');

	    // set isScrollOn
	    $timeout(function () {
	      var css = getComputedStyle(dd);
	      isScrollOn = css.maxHeight && css.overflowY === 'auto';
	    });
	  }

	  return {
	    restrict: 'EA',
	    require: '^?form',
	    scope: {
	      selectedObject: '=',
	      disableInput: '=',
	      initialValue: '=',
	      localData: '=',
	      localSearch: '&',
	      remoteUrlRequestFormatter: '=',
	      remoteUrlRequestWithCredentials: '@',
	      remoteUrlResponseFormatter: '=',
	      remoteUrlErrorCallback: '=',
	      remoteApiHandler: '=',
	      id: '@',
	      type: '@',
	      placeholder: '@',
	      remoteUrl: '@',
	      remoteUrlDataField: '@',
	      titleField: '@',
	      descriptionField: '@',
	      imageField: '@',
	      inputClass: '@',
	      pause: '@',
	      searchFields: '@',
	      minlength: '@',
	      matchClass: '@',
	      clearSelected: '@',
	      overrideSuggestions: '@',
	      fieldRequired: '=',
	      fieldRequiredClass: '@',
	      inputChanged: '=',
	      autoMatch: '@',
	      focusOut: '&',
	      focusIn: '&',
	      fieldTabindex: '@',
	      inputName: '@',
	      focusFirst: '@',
	      parseInput: '&'
	    },
	    templateUrl: function templateUrl(element, attrs) {
	      return attrs.templateUrl || TEMPLATE_URL;
	    },
	    compile: function compile(tElement) {
	      var startSym = $interpolate.startSymbol();
	      var endSym = $interpolate.endSymbol();
	      if (!(startSym === '{{' && endSym === '}}')) {
	        var interpolatedHtml = tElement.html().replace(/\{\{/g, startSym).replace(/\}\}/g, endSym);
	        tElement.html(interpolatedHtml);
	      }
	      return link;
	    }
	  };
		}]);

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var diaryModule = angular.module('diary', []);

	diaryModule.component('menu', __webpack_require__(4)).component('mainView', __webpack_require__(6)).component('dayTime', __webpack_require__(8)).component('food', __webpack_require__(10)).component('saveMenu', __webpack_require__(12));

		module.exports = diaryModule;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var menuTemplate = __webpack_require__(5);

	var menu = {
	    controller: function controller($window, $timeout, validationService, limitsService) {
	        this.carbohydrates = false;
	        this.proteins = false;

	        this.setDiet = function (diet) {
	            var _this = this;

	            if (this[diet]) {
	                this[diet] = false;
	                $timeout(function () {
	                    return _this[diet] = true;
	                }, 0);
	                return;
	            }
	            this.carbohydrates = diet === 'carbohydrates';
	            this.proteins = diet === 'proteins';
	            if (validationService.validateLimitsChoose(this.carbohydrates, this.proteins, this.className)) this.setLimits();
	        };

	        this.className = 'start';

	        this.setClassName = function (phaseId) {
	            if (this.className !== 'start') return;
	            this.className = 'active' + phaseId;
	            if (validationService.validateLimitsChoose(this.carbohydrates, this.proteins, this.className)) this.setLimits();
	        };
	        this.moveLeft = function () {
	            var numb = +this.className.slice(-1);
	            numb -= 1;
	            if (!numb) numb = 3;
	            this.className = 'active' + numb;
	            if (validationService.validateLimitsChoose(this.carbohydrates, this.proteins, this.className)) this.setLimits();
	        };
	        this.moveRight = function () {
	            var numb = +this.className.slice(-1);
	            numb += 1;
	            if (numb > 3) numb = 1;
	            this.className = 'active' + numb;
	            if (validationService.validateLimitsChoose(this.carbohydrates, this.proteins, this.className)) this.setLimits();
	        };

	        this.setLimits = function () {
	            var diet = this.carbohydrates ? 'carbohydrates' : 'proteins',
	                phase = this.className.slice(-1);
	            limitsService.setLimits(diet, phase);

	            $window.sessionStorage.savedLimits = JSON.stringify({ diet: diet, phaseId: phase });
	        };

	        if ($window.localStorage.savedLimits) {
	            var data = JSON.parse($window.localStorage.savedLimits);
	            this.setDiet(data.diet);
	            this.setClassName(data.phaseId);
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

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mainViewTemplate = __webpack_require__(7);

	var mainView = {
	    controller: function controller(dataService, limitsService, $window) {
	        var _this = this;

	        var empty = {
	            empty: true,
	            name: '---------',
	            portion: '---',
	            carbohyd: '---',
	            prot: '---',
	            fat: '---',
	            kall: '---'
	        };

	        this.base = {};
	        this.viewData = {
	            limitsData: limitsService.limitsData
	        };

	        dataService.getFoodBase().then(function (data) {
	            return _this.base.foods = data;
	        });

	        if ($window.localStorage.saveData) {
	            var data = JSON.parse($window.localStorage.saveData);
	            this.viewData.dayTimes = data.daysData;
	            this.viewData.resultFinal = data.resultFinal;
	        } else {
	            dataService.getDayTimesData().then(function (data) {
	                return _this.viewData.dayTimes = data.data;
	            });

	            this.viewData.resultFinal = {
	                carbohyd: 0,
	                prot: 0,
	                fat: 0,
	                kall: 0
	            };
	        }

	        this.compare = function (key) {
	            if (!this.viewData.limitsData.limits) return;
	            if (this.viewData.limitsData.limits["Итог"][key] < this.viewData.resultFinal[key]) return true;
	        };

	        this.addFood = function (dayTimeId, food) {
	            var collection = this.viewData.dayTimes[dayTimeId].foods;
	            if (collection[0].empty) collection.splice(0, 1);

	            collection.push(food);
	            this.calcResult(dayTimeId, food, true);

	            if ($window.localStorage._lastSaveId) $window.localStorage.removeItem('_lastSaveId');
	        };

	        this.removeFood = function (dayTimeId, food) {
	            var collection = this.viewData.dayTimes[dayTimeId].foods;
	            var index = collection.indexOf(food);
	            collection.splice(index, 1);

	            if (collection.length === 0) collection.push(empty);
	            this.calcResult(dayTimeId, food, false);
	            if ($window.localStorage._lastSaveId) $window.localStorage.removeItem('_lastSaveId');
	        };

	        this.toggleDayTime = function (id) {
	            this.viewData.dayTimes[id].show = !this.viewData.dayTimes[id].show;
	        };

	        this.calcResult = function (dayTimeId, food, bool) {
	            var result = this.viewData.dayTimes[dayTimeId].result;
	            if (bool) {
	                for (var key in result) {
	                    result[key] += food[key];
	                    this.viewData.resultFinal[key] += food[key];
	                }
	            } else {
	                for (var _key in result) {
	                    result[_key] -= food[_key];
	                    this.viewData.resultFinal[_key] -= food[_key];
	                }
	            }
	        };
	    },
	    template: mainViewTemplate
	};

		module.exports = mainView;

/***/ },
/* 7 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"main-view\"> <day-time ng-repeat=\"time in $ctrl.viewData.dayTimes\" time=\"time\" base=\"$ctrl.base\" day-time-limits=\"$ctrl.viewData.limitsData\" add=\"$ctrl.addFood(dayTimeId, food)\" remove=\"$ctrl.removeFood(dayTimeId, food)\" toggle=\"$ctrl.toggleDayTime(id)\"></day-time> <div class=\"result\"> <div class=\"result-tittle\">Итого</div> <section class=\"table-result\"> <div class=\"table-result-tittle\"> <span class=\"result-no-name\">----------------</span>\n<span class=\"portion\">Порция(гр)</span>\n<span class=\"carbohyd\">Углеводы</span>\n<span class=\"prot\">Белки</span>\n<span class=\"fat\">Жиры</span>\n<span class=\"kall\">Калории</span> </div> <div class=\"result-final\"> <span class=\"name\"></span>\n<span class=\"portion\">---</span>\n<span class=\"carbohyd\" ng-class=\"{'active-limit': $ctrl.compare('carbohyd')}\">{{ $ctrl.viewData.resultFinal.carbohyd }} {{'(' + $ctrl.viewData.limitsData.limits[\"Итог\"].carbohyd + ')' | limit }}</span>\n<span class=\"prot\" ng-class=\"{'active-limit': $ctrl.compare('prot')}\">{{ $ctrl.viewData.resultFinal.prot }} {{'(' + $ctrl.viewData.limitsData.limits[\"Итог\"].prot + ')' | limit }}</span>\n<span class=\"fat\" ng-class=\"{'active-limit': $ctrl.compare('fat')}\">{{ $ctrl.viewData.resultFinal.fat }} {{'(' + $ctrl.viewData.limitsData.limits[\"Итог\"].fat + ')' | limit }}</span>\n<span class=\"kall\" ng-class=\"{'active-limit': $ctrl.compare('kall')}\">{{ $ctrl.viewData.resultFinal.kall }} {{'(' + $ctrl.viewData.limitsData.limits[\"Итог\"].kall + ')' | limit }}</span> </div> </section> </div> </div> <save-menu day-times-data=\"$ctrl.viewData.dayTimes\" result=\"$ctrl.viewData.resultFinal\"></save-menu>";
	ngModule.run(["$templateCache",function(c){c.put("main-view.html",v1)}]);
	module.exports=v1;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var dayTimeTemplate = __webpack_require__(9);

	var dayTime = {
	    bindings: {
	        base: '<',
	        time: '<',
	        toggle: '&',
	        add: '&',
	        remove: '&',
	        dayTimeLimits: '<'
	    },
	    controller: function controller(dataService, validationService, calculationService, $scope) {
	        var text = '';
	        this.onInput = function (str) {
	            text = str;
	        };

	        this.limits = function () {
	            if (this.dayTimeLimits.limits) return this.dayTimeLimits.limits[this.time.dayTime];
	        };

	        this.compare = function (key) {
	            if (!this.limits()) return;
	            if (this.limits()[key] < this.time.result[key]) return true;
	        };

	        this.removeFood = function (food) {
	            this.remove({ dayTimeId: this.time.id, food: food });
	        };

	        this.addFood = function () {
	            var portion = Math.round(+this.portion);
	            var name = this.foodName ? this.foodName.title : text;

	            //Проверить поля ввода, вычислить значения
	            if (!validationService.foodAddValidation(name, portion)) return;
	            var food = calculationService.calculateValues(name, portion);

	            //Добавить в массив
	            this.add({ dayTimeId: this.time.id, food: food });

	            //Очистить поля ввода
	            $scope.$broadcast('angucomplete-alt:clearInput');
	            this.portion = '';

	            //Открыть, если скрыто
	            if (!this.time.show) this.toggle({ id: this.time.id });
	        };

	        this.enter = function (event) {
	            if (event.keyCode !== 13) return;
	            this.addFood();
	        };
	    },
	    template: dayTimeTemplate
	};

		module.exports = dayTime;

/***/ },
/* 9 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"day-time\"> <h3 class=\"day-time-tittle\">{{ $ctrl.time.dayTime }}</h3> <div class=\"input\"> <form> <label>Наименование: <angucomplete-alt ng-keypress=\"$ctrl.enter($event)\" id=\"ex1\" placeholder=\"Введите продукт\" pause=\"100\" selected-object=\"$ctrl.foodName\" local-data=\"$ctrl.base.foods.keys\" search-fields=\"foodName\" title-field=\"foodName\" minlength=\"1\" input-changed=\"$ctrl.onInput\" input-class=\"food form-control-small\" match-class=\"highlight\"></angucomplete-alt></label> <label>Порция(гр): <input type=\"text\" class=\"portion_input\" size=\"2\" ng-model=\"$ctrl.portion\" ng-keypress=\"$ctrl.enter($event)\"/></label> </form> <div class=\"add-button\" ng-click=\"$ctrl.addFood()\">+</div> <div class=\"toggle-table\" ng-click=\"$ctrl.toggle({id: $ctrl.time.id})\" ng-class=\"{down: !$ctrl.time.show, up: $ctrl.time.show}\"></div> </div> <div class=\"table-border\" ng-if=\"$ctrl.time.show\"> <div class=\"table\"> <div class=\"table-tittle\"> <span class=\"name\">Наименование продукта</span>\n<span class=\"portion\">Порция(гр)</span>\n<span class=\"carbohyd\">Углеводы</span>\n<span class=\"prot\">Белки</span>\n<span class=\"fat\">Жиры</span>\n<span class=\"kall\">Калории</span> </div> <food ng-repeat=\"food in $ctrl.time.foods\" food=\"food\" remove=\"$ctrl.removeFood(food)\"></food> <div class=\"summary\"> <span class=\"name\">Подытог</span>\n<span class=\"portion\">---</span>\n<span class=\"carbohyd\" ng-class=\"{'active-limit': $ctrl.compare('carbohyd')}\">{{ $ctrl.time.result.carbohyd }} {{'(' + $ctrl.limits().carbohyd + ')' | limit }}</span>\n<span class=\"prot\" ng-class=\"{'active-limit': $ctrl.compare('prot')}\">{{ $ctrl.time.result.prot }} {{'(' + $ctrl.limits().prot + ')' | limit }}</span>\n<span class=\"fat\" ng-class=\"{'active-limit': $ctrl.compare('fat')}\">{{ $ctrl.time.result.fat }} {{'(' + $ctrl.limits().fat + ')' | limit }}</span>\n<span class=\"kall\" ng-class=\"{'active-limit': $ctrl.compare('kall')}\">{{ $ctrl.time.result.kall }} {{'(' + $ctrl.limits().kall + ')' | limit }}</span> </div> </div> </div> </div> <div class=\"br\"></div>";
	ngModule.run(["$templateCache",function(c){c.put("day-time-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var foodTemplate = __webpack_require__(11);

	var food = {
	    bindings: {
	        food: '<',
	        remove: '&'
	    },
	    controller: function controller() {
	        this.checkEmptyFood = function (food) {
	            if (isNaN(food.kall)) return 'empty';
	        };
	    },
	    template: foodTemplate
	};

		module.exports = food;

/***/ },
/* 11 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"food\" ng-class=\"$ctrl.checkEmptyFood($ctrl.food)\"> <span class=\"name\">{{ $ctrl.food.name }}</span>\n<span class=\"portion\">{{ $ctrl.food.portion }}</span>\n<span class=\"carbohyd\">{{ $ctrl.food.carbohyd }}</span>\n<span class=\"prot\">{{ $ctrl.food.prot }}</span>\n<span class=\"fat\">{{ $ctrl.food.fat }}</span>\n<span class=\"kall\">{{ $ctrl.food.kall }}</span> <div class=\"remove-food\" ng-click=\"$ctrl.remove({food: $ctrl.food})\"></div> </div>";
	ngModule.run(["$templateCache",function(c){c.put("food-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var saveMenuTemplate = __webpack_require__(13);

	var saveMenu = {
	    bindings: {
	        dayTimesData: '<',
	        result: '<'
	    },
	    controller: function controller($window, validationService) {
	        this.active = false;

	        this.toggle = function () {
	            this.active = !this.active;
	        };

	        this.saveForPrint = function () {
	            var data = $window.localStorage.daysData ? JSON.parse($window.localStorage.daysData) : [];
	            //Проверки
	            if (data.length > 0 && new Date(data[data.length - 1].saveTime).getDay() === new Date().getDay()) {
	                if (data[data.length - 1].saveTimeId === $window.localStorage._lastSaveId) {
	                    alert('Нет новых данных для сохранения');
	                    return;
	                }
	                if (!confirm('Перезаписать данные печати текушего дня?')) return;
	                data.pop();
	            }
	            //Сохранение
	            var date = new Date();
	            var id = (Math.random() + '').slice(2);
	            var dayData = { saveTime: date, dayTimes: this.dayTimesData, result: this.result, saveTimeId: id };
	            data.push(dayData);
	            $window.localStorage.daysData = JSON.stringify(data);
	            $window.localStorage._lastSaveId = id;
	            alert('Данные успешно сохранены');
	        };

	        this.removePrintSaves = function () {
	            if ($window.localStorage.daysData && confirm('Удалить сохранения для печати?')) {
	                $window.localStorage.removeItem('daysData');
	                $window.localStorage.removeItem('_lastSaveId');
	            }
	        };

	        this.preview = function () {
	            var data = $window.localStorage.daysData;
	            if (!data) {
	                if (confirm('Сохранить текущие данные для просмотра?')) {
	                    this.saveForPrint();
	                } else {
	                    alert('Нет данных для просмотра!');
	                    return;
	                }
	            } else {
	                data = JSON.parse(data);
	                if (data[data.length - 1].saveTimeId !== $window.localStorage._lastSaveId && confirm('Сохранить данные для просмотра?')) this.saveForPrint();
	            }

	            $window.open('./print.html');
	        };

	        this.saveData = function () {
	            if (confirm('Сохранить текущие данные?')) {
	                $window.localStorage.saveData = JSON.stringify({ daysData: this.dayTimesData, resultFinal: this.result });
	                $window.localStorage.savedLimits = $window.sessionStorage.savedLimits;
	                alert('Данные успешно сохранены');
	            }
	        };
	    },
	    template: saveMenuTemplate
	};

		module.exports = saveMenu;

/***/ },
/* 13 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"save-menu group\"> <div class=\"print-button group\" ng-class=\"{'print-button-active': $ctrl.active}\" ng-click=\"$ctrl.toggle()\">Для печати</div> <div class=\"save-button group\" ng-click=\"$ctrl.saveData()\">Сохранить изменения</div> <div class=\"print-menu group\" ng-if=\"$ctrl.active\"> <div class=\"to-print\" ng-click=\"$ctrl.preview()\">Предпросмотр</div> <div class=\"print-to-localStorage\" ng-click=\"$ctrl.saveForPrint()\">Сохранить для печати</div> <div class=\"delte-print-localStorage\" ng-click=\"$ctrl.removePrintSaves()\">Удалить сохранения</div> </div> </div> <div class=\"br\"></div>";
	ngModule.run(["$templateCache",function(c){c.put("save-menu-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var tableModule = angular.module('table', []);

	tableModule.component('tableView', __webpack_require__(15)).component('tableAdd', __webpack_require__(17)).component('foodTable', __webpack_require__(24));

		module.exports = tableModule;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var tableViewTemplate = __webpack_require__(16);

	var tableView = {
	    controller: function controller(dataService) {
	        var _this = this;

	        dataService.getTableData().then(function (data) {
	            _this.foodsObjs = data;
	        });
	    },
	    template: tableViewTemplate
	};

		module.exports = tableView;

/***/ },
/* 16 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<table-add></table-add> <div class=\"table-container\"> <food-table ng-repeat=\"foodsObj in $ctrl.foodsObjs\" foods-obj=\"foodsObj\"></food-table> </div>";
	ngModule.run(["$templateCache",function(c){c.put("table-view-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var addToTableTemplate = __webpack_require__(18);

	var addToTable = {
	    bindings: {},
	    controller: function controller() {},
	    template: addToTableTemplate
	};

		module.exports = addToTable;

/***/ },
/* 18 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"add-to-table-form\"> <h3 class=\"add-form-title\">Добавить продукт в таблицу</h3> <form class=\"table-form\"> <label>Наименование:\n<input type=\"text\" class=\"food-name\"/></label> <label>Порция(гр):\n<input type=\"text\" class=\"table-form-portion\" size=\"2\"/></label> <label>Углеводы:\n<input type=\"text\" class=\"table-form-carbohyd\" size=\"2\"/></label> <label>Белки:\n<input type=\"text\" class=\"table-form-prot\" size=\"2\"/></label> <label>Жиры:\n<input type=\"text\" class=\"table-form-fat\" size=\"2\"/></label> <label>Калории:\n<input type=\"text\" class=\"table-form-kal\" size=\"2\"/></label> <div class=\"add-to-table-button\">+</div> </form> </div>";
	ngModule.run(["$templateCache",function(c){c.put("add-to-table-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
	    return function (value) {
	        if (value.length === 2) return '';
	        return value;
	    };
		};

/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function ($http, $window) {
	    function getFoodBase() {
	        return $http.get('./JSONdata/food.json').then(function (data) {
	            var base = {},
	                keys = [];
	            data.data.forEach(function (obj) {
	                for (var key in obj) {
	                    if (key === 'name') continue;
	                    base[key] = obj[key];
	                }
	            });
	            Object.keys(base).forEach(function (key) {
	                return keys.push({ foodName: key });
	            });
	            base.keys = keys;
	            return base;
	        });
	    }

	    function getFoodObjects() {
	        return $http.get('./JSONdata/food.json');
	    }

	    function getDayTimesData() {
	        return $http.get('./JSONdata/day-times-data.json');
	    }

	    function getLimitsData(diet, phase) {
	        var path = './JSONdata/limits-data/' + diet + '-phase' + phase + '.json';
	        return $http.get(path);
	    }

	    function getTableData() {
	        return $http.get('./JSONdata/food.json').then(function (data) {
	            var tableData = [];

	            data.data.forEach(function (obj) {
	                var newObj = {
	                    foods: []
	                },
	                    count = 20;

	                for (var key in obj) {
	                    if (key === 'name') {
	                        newObj.title = obj.name;
	                        continue;
	                    }
	                    if (count >= 20) {
	                        var titleData = {
	                            className: 'color',
	                            values: {
	                                name: 'Наименование продукта',
	                                portion: 'Порция',
	                                carbohyd: 'Углеводы',
	                                prot: 'Белки',
	                                fat: 'Жиры',
	                                kall: 'Калории'
	                            }
	                        };
	                        newObj.foods.push(titleData);
	                        count = 0;
	                    }
	                    var food = { className: '', values: {} };
	                    food.values.name = key;
	                    food.values.portion = obj[key][0];
	                    food.values.carbohyd = obj[key][1];
	                    food.values.prot = obj[key][2];
	                    food.values.fat = obj[key][3];
	                    food.values.kall = obj[key][4];
	                    newObj.foods.push(food);
	                    count += 1;
	                }

	                tableData.push(newObj);
	            });

	            return tableData;
	        });
	    }

	    if ($window.localStorage.saveData && !confirm('Загрузить сохранения?')) {
	        if (confirm('Удалить имеющиеся сохранения?')) {
	            $window.localStorage.removeItem('saveData');
	            $window.localStorage.removeItem('savedLimits');
	        }
	    }

	    return {
	        getFoodBase: getFoodBase,
	        getFoodObjects: getFoodObjects,
	        getTableData: getTableData,
	        getDayTimesData: getDayTimesData,
	        getLimitsData: getLimitsData
	    };
		};

/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (dataService) {
	    var food;
	    dataService.getFoodBase().then(function (data) {
	        return food = data;
	    });

	    function foodAddValidation(name, portion) {
	        if (!name) {
	            alert('Введите название продукта');
	        } else if (!food[name]) {
	            alert('Такого продукта нет в базе. Со списком продуктов Вы можете ознакомиться в разделе' + '"Таблицы", либо добавить свой продукт');
	        } else if (!portion) {
	            alert('Введите порцию в граммах');
	        } else if (isNaN(+portion)) {
	            alert('В поле "Порция" введите число');
	        } else if (portion <= 0) {
	            alert('Введите число больше чем 0');
	        } else {
	            return true;
	        }
	    }

	    function validateLimitsChoose(diet1, diet2, phaseClass) {
	        if ((diet1 || diet2) && phaseClass !== 'start') return true;
	    }

	    return {
	        foodAddValidation: foodAddValidation,
	        validateLimitsChoose: validateLimitsChoose
	    };
		};

/***/ },
/* 22 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (dataService) {
	    var food;
	    dataService.getFoodBase().then(function (data) {
	        return food = data;
	    });

	    function calculateValues(foodName, portion) {
	        var values = food[foodName];
	        return {
	            name: foodName,
	            portion: portion,
	            carbohyd: Math.round(values[1] / values[0] * portion),
	            prot: Math.round(values[2] / values[0] * portion),
	            fat: Math.round(values[3] / values[0] * portion),
	            kall: Math.round(values[4] / values[0] * portion)
	        };
	    }

	    return {
	        calculateValues: calculateValues
	    };
		};

/***/ },
/* 23 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (dataService) {
	    var limitsData = {};

	    function setLimits(diet, phase) {
	        dataService.getLimitsData(diet, phase).then(function (data) {
	            return limitsData.limits = data.data;
	        });
	    }

	    return {
	        limitsData: limitsData,
	        setLimits: setLimits
	    };
		};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var tableTemplate = __webpack_require__(25);

	var table = {
	    bindings: {
	        foodsObj: '<'
	    },
	    controller: function controller() {
	        var _this = this;

	        setTimeout(function () {
	            return console.log(_this.foodsObj);
	        }, 10000);
	    },
	    template: tableTemplate
	};

		module.exports = table;

/***/ },
/* 25 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<table class=\"tb\"> <caption class=\"tb-title\">{{ $ctrl.foodsObj.title }}</caption> <tr ng-repeat=\"food in $ctrl.foodsObj.foods\"> <td class=\"td-name name-color\" ng-class=\"food.className\">{{ food.values.name }}</td> <td class=\"portion-color\" ng-class=\"food.className\">{{ food.values.portion }}</td> <td class=\"carbohyd-color\" ng-class=\"food.className\">{{ food.values.carbohyd }}</td> <td class=\"prot-color\" ng-class=\"food.className\">{{ food.values.prot }}</td> <td class=\"fat-color\" ng-class=\"food.className\">{{ food.values.fat }}</td> <td class=\"kall-color\" ng-class=\"food.className\">{{ food.values.kall }}</td> </tr> </table>";
	ngModule.run(["$templateCache",function(c){c.put("table-template.html",v1)}]);
	module.exports=v1;

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIDg1YmRjYWVmMWZjNWE4NDU0MjAwIiwid2VicGFjazovLy9qcy9kaWFyeUFwcC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL2luZGV4LmpzIiwid2VicGFjazovLy9ub2RlX21vZHVsZXMvYW5ndWNvbXBsZXRlLWFsdC9hbmd1Y29tcGxldGUtYWx0LmpzIiwid2VicGFjazovLy9qcy9hcHAvZGlhcnktbW9kdWxlL2luZGV4LmpzIiwid2VicGFjazovLy9qcy9hcHAvZGlhcnktbW9kdWxlL21lbnUvbWVudS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9tZW51L3RlbXBsYXRlL21lbnUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9tYWluLXZpZXcvbWFpbi12aWV3LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvZGlhcnktbW9kdWxlL21haW4tdmlldy90ZW1wbGF0ZS9tYWluLXZpZXcuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9kYXktdGltZS9kYXktdGltZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9kYXktdGltZS90ZW1wbGF0ZS9kYXktdGltZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvZGlhcnktbW9kdWxlL2Zvb2QvZm9vZC1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9mb29kL3RlbXBsYXRlL2Zvb2QtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9zYXZlLW1lbnUvc2F2ZS1tZW51LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvZGlhcnktbW9kdWxlL3NhdmUtbWVudS90ZW1wbGF0ZS9zYXZlLW1lbnUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS12aWV3LWNvbXBvbmVudC90YWJsZS12aWV3LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLXZpZXctY29tcG9uZW50L3RlbXBsYXRlL3RhYmxlLXZpZXctdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L2FkZC10by10YWJsZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvc2VydmljZXMvbGltaXRzLWZpbHRlci5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2RhdGEtc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL3ZhbGlkYXRpb24tc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2NhbGN1bGF0aW9uLXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9zZXJ2aWNlcy9saW1pdHMtc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS1jb21wb25lbnQvdGFibGUtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC90YWJsZS1tb2R1bGUvdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL3RhYmxlLXRlbXBsYXRlLmh0bWwiXSwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCA4NWJkY2FlZjFmYzVhODQ1NDIwMFxuICoqLyIsInJlcXVpcmUoJy4vYXBwJyk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvZGlhcnlBcHAuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcbmNvbnN0IGF1dG9jb21wbGl0ZSA9IHJlcXVpcmUoJ2FuZ3Vjb21wbGV0ZS1hbHQnKTtcclxuY29uc3QgZGlhcnlNb2R1bGUgPSByZXF1aXJlKCcuL2RpYXJ5LW1vZHVsZScpO1xyXG5jb25zdCB0YWJsZU1vZHVsZSA9IHJlcXVpcmUoJy4vdGFibGUtbW9kdWxlJyk7XHJcblxyXG5jb25zdCBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWydkaWFyeScsICd0YWJsZScsICduZ0FuaW1hdGUnLCAnYW5ndWNvbXBsZXRlLWFsdCddKTtcclxuXHJcbmFwcC5maWx0ZXIoJ2xpbWl0JywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9saW1pdHMtZmlsdGVyJykpO1xyXG5hcHBcclxuICAgIC5mYWN0b3J5KCdkYXRhU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvZGF0YS1zZXJ2aWNlJykpXHJcbiAgICAuZmFjdG9yeSgndmFsaWRhdGlvblNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL3ZhbGlkYXRpb24tc2VydmljZScpKVxyXG4gICAgLmZhY3RvcnkoJ2NhbGN1bGF0aW9uU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvY2FsY3VsYXRpb24tc2VydmljZScpKVxyXG4gICAgLmZhY3RvcnkoJ2xpbWl0c1NlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL2xpbWl0cy1zZXJ2aWNlJykpO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYXBwO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9pbmRleC5qc1xuICoqLyIsIi8qXG4gKiBhbmd1Y29tcGxldGUtYWx0XG4gKiBBdXRvY29tcGxldGUgZGlyZWN0aXZlIGZvciBBbmd1bGFySlNcbiAqIFRoaXMgaXMgYSBmb3JrIG9mIERhcnlsIFJvd2xhbmQncyBhbmd1Y29tcGxldGUgd2l0aCBzb21lIGV4dHJhIGZlYXR1cmVzLlxuICogQnkgSGlkZW5hcmkgTm96YWtpXG4gKi9cblxuLyohIENvcHlyaWdodCAoYykgMjAxNCBIaWRlbmFyaSBOb3pha2kgYW5kIGNvbnRyaWJ1dG9ycyB8IExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSAqL1xuXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FuZ3Vjb21wbGV0ZS1hbHQnLCBbXSkuZGlyZWN0aXZlKCdhbmd1Y29tcGxldGVBbHQnLCBbJyRxJywgJyRwYXJzZScsICckaHR0cCcsICckc2NlJywgJyR0aW1lb3V0JywgJyR0ZW1wbGF0ZUNhY2hlJywgJyRpbnRlcnBvbGF0ZScsIGZ1bmN0aW9uICgkcSwgJHBhcnNlLCAkaHR0cCwgJHNjZSwgJHRpbWVvdXQsICR0ZW1wbGF0ZUNhY2hlLCAkaW50ZXJwb2xhdGUpIHtcbiAgLy8ga2V5Ym9hcmQgZXZlbnRzXG4gIHZhciBLRVlfRFcgPSA0MDtcbiAgdmFyIEtFWV9SVCA9IDM5O1xuICB2YXIgS0VZX1VQID0gMzg7XG4gIHZhciBLRVlfTEYgPSAzNztcbiAgdmFyIEtFWV9FUyA9IDI3O1xuICB2YXIgS0VZX0VOID0gMTM7XG4gIHZhciBLRVlfVEFCID0gOTtcblxuICB2YXIgTUlOX0xFTkdUSCA9IDM7XG4gIHZhciBNQVhfTEVOR1RIID0gNTI0Mjg4OyAgLy8gdGhlIGRlZmF1bHQgbWF4IGxlbmd0aCBwZXIgdGhlIGh0bWwgbWF4bGVuZ3RoIGF0dHJpYnV0ZVxuICB2YXIgUEFVU0UgPSA1MDA7XG4gIHZhciBCTFVSX1RJTUVPVVQgPSAyMDA7XG5cbiAgLy8gc3RyaW5nIGNvbnN0YW50c1xuICB2YXIgUkVRVUlSRURfQ0xBU1MgPSAnYXV0b2NvbXBsZXRlLXJlcXVpcmVkJztcbiAgdmFyIFRFWFRfU0VBUkNISU5HID0gJ9Cf0L7QuNGB0LouLi4nO1xuICB2YXIgVEVYVF9OT1JFU1VMVFMgPSAn0J3QtdGCINGB0L7QstC/0LDQtNC10L3QuNC5JztcbiAgdmFyIFRFTVBMQVRFX1VSTCA9ICcvYW5ndWNvbXBsZXRlLWFsdC9pbmRleC5odG1sJztcblxuICAvLyBTZXQgdGhlIGRlZmF1bHQgdGVtcGxhdGUgZm9yIHRoaXMgZGlyZWN0aXZlXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChURU1QTEFURV9VUkwsXG4gICAgJzxkaXYgY2xhc3M9XCJhbmd1Y29tcGxldGUtaG9sZGVyXCIgbmctY2xhc3M9XCJ7XFwnYW5ndWNvbXBsZXRlLWRyb3Bkb3duLXZpc2libGVcXCc6IHNob3dEcm9wZG93bn1cIj4nICtcbiAgICAnICA8aW5wdXQgaWQ9XCJ7e2lkfX1fdmFsdWVcIiBuYW1lPVwie3tpbnB1dE5hbWV9fVwiIHRhYmluZGV4PVwie3tmaWVsZFRhYmluZGV4fX1cIiBuZy1jbGFzcz1cIntcXCdhbmd1Y29tcGxldGUtaW5wdXQtbm90LWVtcHR5XFwnOiBub3RFbXB0eX1cIiBuZy1tb2RlbD1cInNlYXJjaFN0clwiIG5nLWRpc2FibGVkPVwiZGlzYWJsZUlucHV0XCIgdHlwZT1cInt7aW5wdXRUeXBlfX1cIiBwbGFjZWhvbGRlcj1cInt7cGxhY2Vob2xkZXJ9fVwiIG1heGxlbmd0aD1cInt7bWF4bGVuZ3RofX1cIiBuZy1mb2N1cz1cIm9uRm9jdXNIYW5kbGVyKClcIiBjbGFzcz1cInt7aW5wdXRDbGFzc319XCIgbmctZm9jdXM9XCJyZXNldEhpZGVSZXN1bHRzKClcIiBuZy1ibHVyPVwiaGlkZVJlc3VsdHMoJGV2ZW50KVwiIGF1dG9jYXBpdGFsaXplPVwib2ZmXCIgYXV0b2NvcnJlY3Q9XCJvZmZcIiBhdXRvY29tcGxldGU9XCJvZmZcIiBuZy1jaGFuZ2U9XCJpbnB1dENoYW5nZUhhbmRsZXIoc2VhcmNoU3RyKVwiLz4nICtcbiAgICAnICA8ZGl2IGlkPVwie3tpZH19X2Ryb3Bkb3duXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtZHJvcGRvd25cIiBuZy1zaG93PVwic2hvd0Ryb3Bkb3duXCI+JyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYW5ndWNvbXBsZXRlLXNlYXJjaGluZ1wiIG5nLXNob3c9XCJzZWFyY2hpbmdcIiBuZy1iaW5kPVwidGV4dFNlYXJjaGluZ1wiPjwvZGl2PicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1zZWFyY2hpbmdcIiBuZy1zaG93PVwiIXNlYXJjaGluZyAmJiAoIXJlc3VsdHMgfHwgcmVzdWx0cy5sZW5ndGggPT0gMClcIiBuZy1iaW5kPVwidGV4dE5vUmVzdWx0c1wiPjwvZGl2PicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1yb3dcIiBuZy1yZXBlYXQ9XCJyZXN1bHQgaW4gcmVzdWx0c1wiIG5nLWNsaWNrPVwic2VsZWN0UmVzdWx0KHJlc3VsdClcIiBuZy1tb3VzZWVudGVyPVwiaG92ZXJSb3coJGluZGV4KVwiIG5nLWNsYXNzPVwie1xcJ2FuZ3Vjb21wbGV0ZS1zZWxlY3RlZC1yb3dcXCc6ICRpbmRleCA9PSBjdXJyZW50SW5kZXh9XCI+JyArXG4gICAgJyAgICAgIDxkaXYgbmctaWY9XCJpbWFnZUZpZWxkXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtaW1hZ2UtaG9sZGVyXCI+JyArXG4gICAgJyAgICAgICAgPGltZyBuZy1pZj1cInJlc3VsdC5pbWFnZSAmJiByZXN1bHQuaW1hZ2UgIT0gXFwnXFwnXCIgbmctc3JjPVwie3tyZXN1bHQuaW1hZ2V9fVwiIGNsYXNzPVwiYW5ndWNvbXBsZXRlLWltYWdlXCIvPicgK1xuICAgICcgICAgICAgIDxkaXYgbmctaWY9XCIhcmVzdWx0LmltYWdlICYmIHJlc3VsdC5pbWFnZSAhPSBcXCdcXCdcIiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1pbWFnZS1kZWZhdWx0XCI+PC9kaXY+JyArXG4gICAgJyAgICAgIDwvZGl2PicgK1xuICAgICcgICAgICA8ZGl2IGNsYXNzPVwiYW5ndWNvbXBsZXRlLXRpdGxlXCIgbmctaWY9XCJtYXRjaENsYXNzXCIgbmctYmluZC1odG1sPVwicmVzdWx0LnRpdGxlXCI+PC9kaXY+JyArXG4gICAgJyAgICAgIDxkaXYgY2xhc3M9XCJhbmd1Y29tcGxldGUtdGl0bGVcIiBuZy1pZj1cIiFtYXRjaENsYXNzXCI+e3sgcmVzdWx0LnRpdGxlIH19PC9kaXY+JyArXG4gICAgJyAgICAgIDxkaXYgbmctaWY9XCJtYXRjaENsYXNzICYmIHJlc3VsdC5kZXNjcmlwdGlvbiAmJiByZXN1bHQuZGVzY3JpcHRpb24gIT0gXFwnXFwnXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtZGVzY3JpcHRpb25cIiBuZy1iaW5kLWh0bWw9XCJyZXN1bHQuZGVzY3JpcHRpb25cIj48L2Rpdj4nICtcbiAgICAnICAgICAgPGRpdiBuZy1pZj1cIiFtYXRjaENsYXNzICYmIHJlc3VsdC5kZXNjcmlwdGlvbiAmJiByZXN1bHQuZGVzY3JpcHRpb24gIT0gXFwnXFwnXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtZGVzY3JpcHRpb25cIj57e3Jlc3VsdC5kZXNjcmlwdGlvbn19PC9kaXY+JyArXG4gICAgJyAgICA8L2Rpdj4nICtcbiAgICAnICA8L2Rpdj4nICtcbiAgICAnPC9kaXY+J1xuICApO1xuXG4gIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW0sIGF0dHJzLCBjdHJsKSB7XG4gICAgdmFyIGlucHV0RmllbGQgPSBlbGVtLmZpbmQoJ2lucHV0Jyk7XG4gICAgdmFyIG1pbmxlbmd0aCA9IE1JTl9MRU5HVEg7XG4gICAgdmFyIHNlYXJjaFRpbWVyID0gbnVsbDtcbiAgICB2YXIgaGlkZVRpbWVyO1xuICAgIHZhciByZXF1aXJlZENsYXNzTmFtZSA9IFJFUVVJUkVEX0NMQVNTO1xuICAgIHZhciByZXNwb25zZUZvcm1hdHRlcjtcbiAgICB2YXIgdmFsaWRTdGF0ZSA9IG51bGw7XG4gICAgdmFyIGh0dHBDYW5jZWxsZXIgPSBudWxsO1xuICAgIHZhciBkZCA9IGVsZW1bMF0ucXVlcnlTZWxlY3RvcignLmFuZ3Vjb21wbGV0ZS1kcm9wZG93bicpO1xuICAgIHZhciBpc1Njcm9sbE9uID0gZmFsc2U7XG4gICAgdmFyIG1vdXNlZG93bk9uID0gbnVsbDtcbiAgICB2YXIgdW5iaW5kSW5pdGlhbFZhbHVlO1xuICAgIHZhciBkaXNwbGF5U2VhcmNoaW5nO1xuICAgIHZhciBkaXNwbGF5Tm9SZXN1bHRzO1xuXG4gICAgZWxlbS5vbignbW91c2Vkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0LmlkKSB7XG4gICAgICAgIG1vdXNlZG93bk9uID0gZXZlbnQudGFyZ2V0LmlkO1xuICAgICAgICBpZiAobW91c2Vkb3duT24gPT09IHNjb3BlLmlkICsgJ19kcm9wZG93bicpIHtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xpY2tvdXRIYW5kbGVyRm9yRHJvcGRvd24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgbW91c2Vkb3duT24gPSBldmVudC50YXJnZXQuY2xhc3NOYW1lO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2NvcGUuY3VycmVudEluZGV4ID0gc2NvcGUuZm9jdXNGaXJzdCA/IDAgOiBudWxsO1xuICAgIHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xuICAgIHVuYmluZEluaXRpYWxWYWx1ZSA9IHNjb3BlLiR3YXRjaCgnaW5pdGlhbFZhbHVlJywgZnVuY3Rpb24gKG5ld3ZhbCkge1xuICAgICAgaWYgKG5ld3ZhbCkge1xuICAgICAgICAvLyByZW1vdmUgc2NvcGUgbGlzdGVuZXJcbiAgICAgICAgdW5iaW5kSW5pdGlhbFZhbHVlKCk7XG4gICAgICAgIC8vIGNoYW5nZSBpbnB1dFxuICAgICAgICBoYW5kbGVJbnB1dENoYW5nZShuZXd2YWwsIHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2NvcGUuJHdhdGNoKCdmaWVsZFJlcXVpcmVkJywgZnVuY3Rpb24gKG5ld3ZhbCwgb2xkdmFsKSB7XG4gICAgICBpZiAobmV3dmFsICE9PSBvbGR2YWwpIHtcbiAgICAgICAgaWYgKCFuZXd2YWwpIHtcbiAgICAgICAgICBjdHJsW3Njb3BlLmlucHV0TmFtZV0uJHNldFZhbGlkaXR5KHJlcXVpcmVkQ2xhc3NOYW1lLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghdmFsaWRTdGF0ZSB8fCBzY29wZS5jdXJyZW50SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgaGFuZGxlUmVxdWlyZWQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGhhbmRsZVJlcXVpcmVkKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzY29wZS4kb24oJ2FuZ3Vjb21wbGV0ZS1hbHQ6Y2xlYXJJbnB1dCcsIGZ1bmN0aW9uIChldmVudCwgZWxlbWVudElkKSB7XG4gICAgICBpZiAoIWVsZW1lbnRJZCB8fCBlbGVtZW50SWQgPT09IHNjb3BlLmlkKSB7XG4gICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IG51bGw7XG4gICAgICAgIGNhbGxPckFzc2lnbigpO1xuICAgICAgICBoYW5kbGVSZXF1aXJlZChmYWxzZSk7XG4gICAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2NvcGUuJG9uKCdhbmd1Y29tcGxldGUtYWx0OmNoYW5nZUlucHV0JywgZnVuY3Rpb24gKGV2ZW50LCBlbGVtZW50SWQsIG5ld3ZhbCkge1xuICAgICAgaWYgKCEhZWxlbWVudElkICYmIGVsZW1lbnRJZCA9PT0gc2NvcGUuaWQpIHtcbiAgICAgICAgaGFuZGxlSW5wdXRDaGFuZ2UobmV3dmFsKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZUlucHV0Q2hhbmdlKG5ld3ZhbCwgaW5pdGlhbCkge1xuICAgICAgaWYgKG5ld3ZhbCkge1xuICAgICAgICBpZiAodHlwZW9mIG5ld3ZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBzY29wZS5zZWFyY2hTdHIgPSBleHRyYWN0VGl0bGUobmV3dmFsKTtcbiAgICAgICAgICBjYWxsT3JBc3NpZ24oe29yaWdpbmFsT2JqZWN0OiBuZXd2YWx9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbmV3dmFsID09PSAnc3RyaW5nJyAmJiBuZXd2YWwubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IG5ld3ZhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY29uc29sZSAmJiBjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdUcmllZCB0byBzZXQgJyArICghIWluaXRpYWwgPyAnaW5pdGlhbCcgOiAnJykgKyAnIHZhbHVlIG9mIGFuZ3Vjb21wbGV0ZSB0bycsIG5ld3ZhbCwgJ3doaWNoIGlzIGFuIGludmFsaWQgdmFsdWUnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBoYW5kbGVSZXF1aXJlZCh0cnVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAjMTk0IGRyb3Bkb3duIGxpc3Qgbm90IGNvbnNpc3RlbnQgaW4gY29sbGFwc2luZyAoYnVnKS5cbiAgICBmdW5jdGlvbiBjbGlja291dEhhbmRsZXJGb3JEcm9wZG93bihldmVudCkge1xuICAgICAgbW91c2Vkb3duT24gPSBudWxsO1xuICAgICAgc2NvcGUuaGlkZVJlc3VsdHMoZXZlbnQpO1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrb3V0SGFuZGxlckZvckRyb3Bkb3duKTtcbiAgICB9XG5cbiAgICAvLyBmb3IgSUU4IHF1aXJraW5lc3MgYWJvdXQgZXZlbnQud2hpY2hcbiAgICBmdW5jdGlvbiBpZThFdmVudE5vcm1hbGl6ZXIoZXZlbnQpIHtcbiAgICAgIHJldHVybiBldmVudC53aGljaCA/IGV2ZW50LndoaWNoIDogZXZlbnQua2V5Q29kZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxsT3JBc3NpZ24odmFsdWUpIHtcbiAgICAgIGlmICh0eXBlb2Ygc2NvcGUuc2VsZWN0ZWRPYmplY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc2NvcGUuc2VsZWN0ZWRPYmplY3QodmFsdWUpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNjb3BlLnNlbGVjdGVkT2JqZWN0ID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBoYW5kbGVSZXF1aXJlZCh0cnVlKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBoYW5kbGVSZXF1aXJlZChmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsbEZ1bmN0aW9uT3JJZGVudGl0eShmbikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBzY29wZVtmbl0gPyBzY29wZVtmbl0oZGF0YSkgOiBkYXRhO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRJbnB1dFN0cmluZyhzdHIpIHtcbiAgICAgIGNhbGxPckFzc2lnbih7b3JpZ2luYWxPYmplY3Q6IHN0cn0pO1xuXG4gICAgICBpZiAoc2NvcGUuY2xlYXJTZWxlY3RlZCkge1xuICAgICAgICBzY29wZS5zZWFyY2hTdHIgPSBudWxsO1xuICAgICAgfVxuICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXh0cmFjdFRpdGxlKGRhdGEpIHtcbiAgICAgIC8vIHNwbGl0IHRpdGxlIGZpZWxkcyBhbmQgcnVuIGV4dHJhY3RWYWx1ZSBmb3IgZWFjaCBhbmQgam9pbiB3aXRoICcgJ1xuICAgICAgcmV0dXJuIHNjb3BlLnRpdGxlRmllbGQuc3BsaXQoJywnKVxuICAgICAgICAubWFwKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICAgIHJldHVybiBleHRyYWN0VmFsdWUoZGF0YSwgZmllbGQpO1xuICAgICAgICB9KVxuICAgICAgICAuam9pbignICcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4dHJhY3RWYWx1ZShvYmosIGtleSkge1xuICAgICAgdmFyIGtleXMsIHJlc3VsdDtcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAga2V5cyA9IGtleS5zcGxpdCgnLicpO1xuICAgICAgICByZXN1bHQgPSBvYmo7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdFtrZXlzW2ldXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IG9iajtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmluZE1hdGNoU3RyaW5nKHRhcmdldCwgc3RyKSB7XG4gICAgICB2YXIgcmVzdWx0LCBtYXRjaGVzLCByZTtcbiAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvR3VpZGUvUmVndWxhcl9FeHByZXNzaW9uc1xuICAgICAgLy8gRXNjYXBlIHVzZXIgaW5wdXQgdG8gYmUgdHJlYXRlZCBhcyBhIGxpdGVyYWwgc3RyaW5nIHdpdGhpbiBhIHJlZ3VsYXIgZXhwcmVzc2lvblxuICAgICAgcmUgPSBuZXcgUmVnRXhwKHN0ci5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpLCAnaScpO1xuICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCF0YXJnZXQubWF0Y2ggfHwgIXRhcmdldC5yZXBsYWNlKSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldC50b1N0cmluZygpO1xuICAgICAgfVxuICAgICAgbWF0Y2hlcyA9IHRhcmdldC5tYXRjaChyZSk7XG4gICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICByZXN1bHQgPSB0YXJnZXQucmVwbGFjZShyZSxcbiAgICAgICAgICAnPHNwYW4gY2xhc3M9XCInICsgc2NvcGUubWF0Y2hDbGFzcyArICdcIj4nICsgbWF0Y2hlc1swXSArICc8L3NwYW4+Jyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gdGFyZ2V0O1xuICAgICAgfVxuICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwocmVzdWx0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVSZXF1aXJlZCh2YWxpZCkge1xuICAgICAgc2NvcGUubm90RW1wdHkgPSB2YWxpZDtcbiAgICAgIHZhbGlkU3RhdGUgPSBzY29wZS5zZWFyY2hTdHI7XG4gICAgICBpZiAoc2NvcGUuZmllbGRSZXF1aXJlZCAmJiBjdHJsICYmIHNjb3BlLmlucHV0TmFtZSkge1xuICAgICAgICBjdHJsW3Njb3BlLmlucHV0TmFtZV0uJHNldFZhbGlkaXR5KHJlcXVpcmVkQ2xhc3NOYW1lLCB2YWxpZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2V5dXBIYW5kbGVyKGV2ZW50KSB7XG4gICAgICB2YXIgd2hpY2ggPSBpZThFdmVudE5vcm1hbGl6ZXIoZXZlbnQpO1xuICAgICAgaWYgKHdoaWNoID09PSBLRVlfTEYgfHwgd2hpY2ggPT09IEtFWV9SVCkge1xuICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHdoaWNoID09PSBLRVlfVVAgfHwgd2hpY2ggPT09IEtFWV9FTikge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAod2hpY2ggPT09IEtFWV9EVykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoIXNjb3BlLnNob3dEcm9wZG93biAmJiBzY29wZS5zZWFyY2hTdHIgJiYgc2NvcGUuc2VhcmNoU3RyLmxlbmd0aCA+PSBtaW5sZW5ndGgpIHtcbiAgICAgICAgICBpbml0UmVzdWx0cygpO1xuICAgICAgICAgIHNjb3BlLnNlYXJjaGluZyA9IHRydWU7XG4gICAgICAgICAgc2VhcmNoVGltZXJDb21wbGV0ZShzY29wZS5zZWFyY2hTdHIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmICh3aGljaCA9PT0gS0VZX0VTKSB7XG4gICAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlucHV0RmllbGQudmFsKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChtaW5sZW5ndGggPT09IDAgJiYgIXNjb3BlLnNlYXJjaFN0cikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc2NvcGUuc2VhcmNoU3RyIHx8IHNjb3BlLnNlYXJjaFN0ciA9PT0gJycpIHtcbiAgICAgICAgICBzY29wZS5zaG93RHJvcGRvd24gPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChzY29wZS5zZWFyY2hTdHIubGVuZ3RoID49IG1pbmxlbmd0aCkge1xuICAgICAgICAgIGluaXRSZXN1bHRzKCk7XG5cbiAgICAgICAgICBpZiAoc2VhcmNoVGltZXIpIHtcbiAgICAgICAgICAgICR0aW1lb3V0LmNhbmNlbChzZWFyY2hUaW1lcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2NvcGUuc2VhcmNoaW5nID0gdHJ1ZTtcblxuICAgICAgICAgIHNlYXJjaFRpbWVyID0gJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VhcmNoVGltZXJDb21wbGV0ZShzY29wZS5zZWFyY2hTdHIpO1xuICAgICAgICAgIH0sIHNjb3BlLnBhdXNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWxpZFN0YXRlICYmIHZhbGlkU3RhdGUgIT09IHNjb3BlLnNlYXJjaFN0ciAmJiAhc2NvcGUuY2xlYXJTZWxlY3RlZCkge1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsT3JBc3NpZ24oKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZU92ZXJyaWRlU3VnZ2VzdGlvbnMoZXZlbnQpIHtcbiAgICAgIGlmIChzY29wZS5vdmVycmlkZVN1Z2dlc3Rpb25zICYmICEoc2NvcGUuc2VsZWN0ZWRPYmplY3QgJiYgc2NvcGUuc2VsZWN0ZWRPYmplY3Qub3JpZ2luYWxPYmplY3QgPT09IHNjb3BlLnNlYXJjaFN0cikpIHtcbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhbmNlbCBzZWFyY2ggdGltZXJcbiAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHNlYXJjaFRpbWVyKTtcbiAgICAgICAgLy8gY2FuY2VsIGh0dHAgcmVxdWVzdFxuICAgICAgICBjYW5jZWxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgIHNldElucHV0U3RyaW5nKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJvcGRvd25Sb3dPZmZzZXRIZWlnaHQocm93KSB7XG4gICAgICB2YXIgY3NzID0gZ2V0Q29tcHV0ZWRTdHlsZShyb3cpO1xuICAgICAgcmV0dXJuIHJvdy5vZmZzZXRIZWlnaHQgK1xuICAgICAgICBwYXJzZUludChjc3MubWFyZ2luVG9wLCAxMCkgKyBwYXJzZUludChjc3MubWFyZ2luQm90dG9tLCAxMCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJvcGRvd25IZWlnaHQoKSB7XG4gICAgICByZXR1cm4gZGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICtcbiAgICAgICAgcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShkZCkubWF4SGVpZ2h0LCAxMCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJvcGRvd25Sb3coKSB7XG4gICAgICByZXR1cm4gZWxlbVswXS5xdWVyeVNlbGVjdG9yQWxsKCcuYW5ndWNvbXBsZXRlLXJvdycpW3Njb3BlLmN1cnJlbnRJbmRleF07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJvcGRvd25Sb3dUb3AoKSB7XG4gICAgICByZXR1cm4gZHJvcGRvd25Sb3coKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgLVxuICAgICAgICAoZGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICtcbiAgICAgICAgcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShkZCkucGFkZGluZ1RvcCwgMTApKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcm9wZG93blNjcm9sbFRvcFRvKG9mZnNldCkge1xuICAgICAgZGQuc2Nyb2xsVG9wID0gZGQuc2Nyb2xsVG9wICsgb2Zmc2V0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUlucHV0RmllbGQoKSB7XG4gICAgICB2YXIgY3VycmVudCA9IHNjb3BlLnJlc3VsdHNbc2NvcGUuY3VycmVudEluZGV4XTtcbiAgICAgIGlmIChzY29wZS5tYXRjaENsYXNzKSB7XG4gICAgICAgIGlucHV0RmllbGQudmFsKGV4dHJhY3RUaXRsZShjdXJyZW50Lm9yaWdpbmFsT2JqZWN0KSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaW5wdXRGaWVsZC52YWwoY3VycmVudC50aXRsZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2V5ZG93bkhhbmRsZXIoZXZlbnQpIHtcbiAgICAgIHZhciB3aGljaCA9IGllOEV2ZW50Tm9ybWFsaXplcihldmVudCk7XG4gICAgICB2YXIgcm93ID0gbnVsbDtcbiAgICAgIHZhciByb3dUb3AgPSBudWxsO1xuXG4gICAgICBpZiAod2hpY2ggPT09IEtFWV9FTiAmJiBzY29wZS5yZXN1bHRzKSB7XG4gICAgICAgIGlmIChzY29wZS5jdXJyZW50SW5kZXggPj0gMCAmJiBzY29wZS5jdXJyZW50SW5kZXggPCBzY29wZS5yZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgc2NvcGUuc2VsZWN0UmVzdWx0KHNjb3BlLnJlc3VsdHNbc2NvcGUuY3VycmVudEluZGV4XSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaGFuZGxlT3ZlcnJpZGVTdWdnZXN0aW9ucyhldmVudCk7XG4gICAgICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICB9IGVsc2UgaWYgKHdoaWNoID09PSBLRVlfRFcgJiYgc2NvcGUucmVzdWx0cykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoKHNjb3BlLmN1cnJlbnRJbmRleCArIDEpIDwgc2NvcGUucmVzdWx0cy5sZW5ndGggJiYgc2NvcGUuc2hvd0Ryb3Bkb3duKSB7XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCsrO1xuICAgICAgICAgICAgdXBkYXRlSW5wdXRGaWVsZCgpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKGlzU2Nyb2xsT24pIHtcbiAgICAgICAgICAgIHJvdyA9IGRyb3Bkb3duUm93KCk7XG4gICAgICAgICAgICBpZiAoZHJvcGRvd25IZWlnaHQoKSA8IHJvdy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5ib3R0b20pIHtcbiAgICAgICAgICAgICAgZHJvcGRvd25TY3JvbGxUb3BUbyhkcm9wZG93blJvd09mZnNldEhlaWdodChyb3cpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAod2hpY2ggPT09IEtFWV9VUCAmJiBzY29wZS5yZXN1bHRzKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChzY29wZS5jdXJyZW50SW5kZXggPj0gMSkge1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXgtLTtcbiAgICAgICAgICAgIHVwZGF0ZUlucHV0RmllbGQoKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChpc1Njcm9sbE9uKSB7XG4gICAgICAgICAgICByb3dUb3AgPSBkcm9wZG93blJvd1RvcCgpO1xuICAgICAgICAgICAgaWYgKHJvd1RvcCA8IDApIHtcbiAgICAgICAgICAgICAgZHJvcGRvd25TY3JvbGxUb3BUbyhyb3dUb3AgLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2NvcGUuY3VycmVudEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICAgICAgaW5wdXRGaWVsZC52YWwoc2NvcGUuc2VhcmNoU3RyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh3aGljaCA9PT0gS0VZX1RBQikge1xuICAgICAgICBpZiAoc2NvcGUucmVzdWx0cyAmJiBzY29wZS5yZXN1bHRzLmxlbmd0aCA+IDAgJiYgc2NvcGUuc2hvd0Ryb3Bkb3duKSB7XG4gICAgICAgICAgaWYgKHNjb3BlLmN1cnJlbnRJbmRleCA9PT0gLTEgJiYgc2NvcGUub3ZlcnJpZGVTdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgLy8gaW50ZW50aW9uYWxseSBub3Qgc2VuZGluZyBldmVudCBzbyB0aGF0IGl0IGRvZXMgbm90XG4gICAgICAgICAgICAvLyBwcmV2ZW50IGRlZmF1bHQgdGFiIGJlaGF2aW9yXG4gICAgICAgICAgICBoYW5kbGVPdmVycmlkZVN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNjb3BlLmN1cnJlbnRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjb3BlLnNlbGVjdFJlc3VsdChzY29wZS5yZXN1bHRzW3Njb3BlLmN1cnJlbnRJbmRleF0pO1xuICAgICAgICAgICAgc2NvcGUuJGRpZ2VzdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBubyByZXN1bHRzXG4gICAgICAgICAgLy8gaW50ZW50aW9uYWxseSBub3Qgc2VuZGluZyBldmVudCBzbyB0aGF0IGl0IGRvZXMgbm90XG4gICAgICAgICAgLy8gcHJldmVudCBkZWZhdWx0IHRhYiBiZWhhdmlvclxuICAgICAgICAgIGlmIChzY29wZS5zZWFyY2hTdHIgJiYgc2NvcGUuc2VhcmNoU3RyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGhhbmRsZU92ZXJyaWRlU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAod2hpY2ggPT09IEtFWV9FUykge1xuICAgICAgICAvLyBUaGlzIGlzIHZlcnkgc3BlY2lmaWMgdG8gSUUxMC8xMSAjMjcyXG4gICAgICAgIC8vIHdpdGhvdXQgdGhpcywgSUUgY2xlYXJzIHRoZSBpbnB1dCB0ZXh0XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaHR0cFN1Y2Nlc3NDYWxsYmFja0dlbihzdHIpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAocmVzcG9uc2VEYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICAvLyBub3JtYWxpemUgcmV0dXJuIG9iZWpjdCBmcm9tIHByb21pc2VcbiAgICAgICAgaWYgKCFzdGF0dXMgJiYgIWhlYWRlcnMgJiYgIWNvbmZpZyAmJiByZXNwb25zZURhdGEuZGF0YSkge1xuICAgICAgICAgIHJlc3BvbnNlRGF0YSA9IHJlc3BvbnNlRGF0YS5kYXRhO1xuICAgICAgICB9XG4gICAgICAgIHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xuICAgICAgICBwcm9jZXNzUmVzdWx0cyhcbiAgICAgICAgICBleHRyYWN0VmFsdWUocmVzcG9uc2VGb3JtYXR0ZXIocmVzcG9uc2VEYXRhKSwgc2NvcGUucmVtb3RlVXJsRGF0YUZpZWxkKSxcbiAgICAgICAgICBzdHIpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBodHRwRXJyb3JDYWxsYmFjayhlcnJvclJlcywgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIC8vIGNhbmNlbGxlZC9hYm9ydGVkXG4gICAgICBpZiAoc3RhdHVzID09PSAwIHx8IHN0YXR1cyA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBub3JtYWxpemUgcmV0dXJuIG9iZWpjdCBmcm9tIHByb21pc2VcbiAgICAgIGlmICghc3RhdHVzICYmICFoZWFkZXJzICYmICFjb25maWcpIHtcbiAgICAgICAgc3RhdHVzID0gZXJyb3JSZXMuc3RhdHVzO1xuICAgICAgfVxuICAgICAgaWYgKHNjb3BlLnJlbW90ZVVybEVycm9yQ2FsbGJhY2spIHtcbiAgICAgICAgc2NvcGUucmVtb3RlVXJsRXJyb3JDYWxsYmFjayhlcnJvclJlcywgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUuZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdodHRwIGVycm9yJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5jZWxIdHRwUmVxdWVzdCgpIHtcbiAgICAgIGlmIChodHRwQ2FuY2VsbGVyKSB7XG4gICAgICAgIGh0dHBDYW5jZWxsZXIucmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFJlbW90ZVJlc3VsdHMoc3RyKSB7XG4gICAgICB2YXIgcGFyYW1zID0ge30sXG4gICAgICAgIHVybCA9IHNjb3BlLnJlbW90ZVVybCArIGVuY29kZVVSSUNvbXBvbmVudChzdHIpO1xuICAgICAgaWYgKHNjb3BlLnJlbW90ZVVybFJlcXVlc3RGb3JtYXR0ZXIpIHtcbiAgICAgICAgcGFyYW1zID0ge3BhcmFtczogc2NvcGUucmVtb3RlVXJsUmVxdWVzdEZvcm1hdHRlcihzdHIpfTtcbiAgICAgICAgdXJsID0gc2NvcGUucmVtb3RlVXJsO1xuICAgICAgfVxuICAgICAgaWYgKCEhc2NvcGUucmVtb3RlVXJsUmVxdWVzdFdpdGhDcmVkZW50aWFscykge1xuICAgICAgICBwYXJhbXMud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGNhbmNlbEh0dHBSZXF1ZXN0KCk7XG4gICAgICBodHRwQ2FuY2VsbGVyID0gJHEuZGVmZXIoKTtcbiAgICAgIHBhcmFtcy50aW1lb3V0ID0gaHR0cENhbmNlbGxlci5wcm9taXNlO1xuICAgICAgJGh0dHAuZ2V0KHVybCwgcGFyYW1zKVxuICAgICAgICAuc3VjY2VzcyhodHRwU3VjY2Vzc0NhbGxiYWNrR2VuKHN0cikpXG4gICAgICAgIC5lcnJvcihodHRwRXJyb3JDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UmVtb3RlUmVzdWx0c1dpdGhDdXN0b21IYW5kbGVyKHN0cikge1xuICAgICAgY2FuY2VsSHR0cFJlcXVlc3QoKTtcblxuICAgICAgaHR0cENhbmNlbGxlciA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIHNjb3BlLnJlbW90ZUFwaUhhbmRsZXIoc3RyLCBodHRwQ2FuY2VsbGVyLnByb21pc2UpXG4gICAgICAgIC50aGVuKGh0dHBTdWNjZXNzQ2FsbGJhY2tHZW4oc3RyKSlcbiAgICAgICAgLmNhdGNoKGh0dHBFcnJvckNhbGxiYWNrKTtcblxuICAgICAgLyogSUU4IGNvbXBhdGlibGVcbiAgICAgICBzY29wZS5yZW1vdGVBcGlIYW5kbGVyKHN0ciwgaHR0cENhbmNlbGxlci5wcm9taXNlKVxuICAgICAgIFsndGhlbiddKGh0dHBTdWNjZXNzQ2FsbGJhY2tHZW4oc3RyKSlcbiAgICAgICBbJ2NhdGNoJ10oaHR0cEVycm9yQ2FsbGJhY2spO1xuICAgICAgICovXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xlYXJSZXN1bHRzKCkge1xuICAgICAgc2NvcGUuc2hvd0Ryb3Bkb3duID0gZmFsc2U7XG4gICAgICBzY29wZS5yZXN1bHRzID0gW107XG4gICAgICBpZiAoZGQpIHtcbiAgICAgICAgZGQuc2Nyb2xsVG9wID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0UmVzdWx0cygpIHtcbiAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IGRpc3BsYXlTZWFyY2hpbmc7XG4gICAgICBzY29wZS5jdXJyZW50SW5kZXggPSBzY29wZS5mb2N1c0ZpcnN0ID8gMCA6IC0xO1xuICAgICAgc2NvcGUucmVzdWx0cyA9IFtdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldExvY2FsUmVzdWx0cyhzdHIpIHtcbiAgICAgIHZhciBpLCBtYXRjaCwgcywgdmFsdWUsXG4gICAgICAgIHNlYXJjaEZpZWxkcyA9IHNjb3BlLnNlYXJjaEZpZWxkcy5zcGxpdCgnLCcpLFxuICAgICAgICBtYXRjaGVzID0gW107XG4gICAgICBpZiAodHlwZW9mIHNjb3BlLnBhcnNlSW5wdXQoKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgc3RyID0gc2NvcGUucGFyc2VJbnB1dCgpKHN0cik7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgc2NvcGUubG9jYWxEYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG1hdGNoID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChzID0gMDsgcyA8IHNlYXJjaEZpZWxkcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgIHZhbHVlID0gZXh0cmFjdFZhbHVlKHNjb3BlLmxvY2FsRGF0YVtpXSwgc2VhcmNoRmllbGRzW3NdKSB8fCAnJztcbiAgICAgICAgICBtYXRjaCA9IG1hdGNoIHx8ICh2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzdHIudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpKSA+PSAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIG1hdGNoZXNbbWF0Y2hlcy5sZW5ndGhdID0gc2NvcGUubG9jYWxEYXRhW2ldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF0Y2hlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja0V4YWN0TWF0Y2gocmVzdWx0LCBvYmosIHN0cikge1xuICAgICAgaWYgKCFzdHIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAob2JqW2tleV0udG9Mb3dlckNhc2UoKSA9PT0gc3RyLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICBzY29wZS5zZWxlY3RSZXN1bHQocmVzdWx0KTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlYXJjaFRpbWVyQ29tcGxldGUoc3RyKSB7XG4gICAgICAvLyBCZWdpbiB0aGUgc2VhcmNoXG4gICAgICBpZiAoIXN0ciB8fCBzdHIubGVuZ3RoIDwgbWlubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChzY29wZS5sb2NhbERhdGEpIHtcbiAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgbWF0Y2hlcztcbiAgICAgICAgICBpZiAodHlwZW9mIHNjb3BlLmxvY2FsU2VhcmNoKCkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBtYXRjaGVzID0gc2NvcGUubG9jYWxTZWFyY2goKShzdHIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXRjaGVzID0gZ2V0TG9jYWxSZXN1bHRzKHN0cik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xuICAgICAgICAgIHByb2Nlc3NSZXN1bHRzKG1hdGNoZXMsIHN0cik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoc2NvcGUucmVtb3RlQXBpSGFuZGxlcikge1xuICAgICAgICBnZXRSZW1vdGVSZXN1bHRzV2l0aEN1c3RvbUhhbmRsZXIoc3RyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdldFJlbW90ZVJlc3VsdHMoc3RyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcm9jZXNzUmVzdWx0cyhyZXNwb25zZURhdGEsIHN0cikge1xuICAgICAgdmFyIGksIGRlc2NyaXB0aW9uLCBpbWFnZSwgdGV4dCwgZm9ybWF0dGVkVGV4dCwgZm9ybWF0dGVkRGVzYztcblxuICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICBzY29wZS5yZXN1bHRzID0gW107XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHJlc3BvbnNlRGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChzY29wZS50aXRsZUZpZWxkICYmIHNjb3BlLnRpdGxlRmllbGQgIT09ICcnKSB7XG4gICAgICAgICAgICB0ZXh0ID0gZm9ybWF0dGVkVGV4dCA9IGV4dHJhY3RUaXRsZShyZXNwb25zZURhdGFbaV0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRlc2NyaXB0aW9uID0gJyc7XG4gICAgICAgICAgaWYgKHNjb3BlLmRlc2NyaXB0aW9uRmllbGQpIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gZm9ybWF0dGVkRGVzYyA9IGV4dHJhY3RWYWx1ZShyZXNwb25zZURhdGFbaV0sIHNjb3BlLmRlc2NyaXB0aW9uRmllbGQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGltYWdlID0gJyc7XG4gICAgICAgICAgaWYgKHNjb3BlLmltYWdlRmllbGQpIHtcbiAgICAgICAgICAgIGltYWdlID0gZXh0cmFjdFZhbHVlKHJlc3BvbnNlRGF0YVtpXSwgc2NvcGUuaW1hZ2VGaWVsZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNjb3BlLm1hdGNoQ2xhc3MpIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZFRleHQgPSBmaW5kTWF0Y2hTdHJpbmcodGV4dCwgc3RyKTtcbiAgICAgICAgICAgIGZvcm1hdHRlZERlc2MgPSBmaW5kTWF0Y2hTdHJpbmcoZGVzY3JpcHRpb24sIHN0cik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2NvcGUucmVzdWx0c1tzY29wZS5yZXN1bHRzLmxlbmd0aF0gPSB7XG4gICAgICAgICAgICB0aXRsZTogZm9ybWF0dGVkVGV4dCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBmb3JtYXR0ZWREZXNjLFxuICAgICAgICAgICAgaW1hZ2U6IGltYWdlLFxuICAgICAgICAgICAgb3JpZ2luYWxPYmplY3Q6IHJlc3BvbnNlRGF0YVtpXVxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NvcGUucmVzdWx0cyA9IFtdO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2NvcGUuYXV0b01hdGNoICYmIHNjb3BlLnJlc3VsdHMubGVuZ3RoID09PSAxICYmXG4gICAgICAgIGNoZWNrRXhhY3RNYXRjaChzY29wZS5yZXN1bHRzWzBdLFxuICAgICAgICAgIHt0aXRsZTogdGV4dCwgZGVzYzogZGVzY3JpcHRpb24gfHwgJyd9LCBzY29wZS5zZWFyY2hTdHIpKSB7XG4gICAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmIChzY29wZS5yZXN1bHRzLmxlbmd0aCA9PT0gMCAmJiAhZGlzcGxheU5vUmVzdWx0cykge1xuICAgICAgICBzY29wZS5zaG93RHJvcGRvd24gPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2hvd0FsbCgpIHtcbiAgICAgIGlmIChzY29wZS5sb2NhbERhdGEpIHtcbiAgICAgICAgcHJvY2Vzc1Jlc3VsdHMoc2NvcGUubG9jYWxEYXRhLCAnJyk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChzY29wZS5yZW1vdGVBcGlIYW5kbGVyKSB7XG4gICAgICAgIGdldFJlbW90ZVJlc3VsdHNXaXRoQ3VzdG9tSGFuZGxlcignJyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZ2V0UmVtb3RlUmVzdWx0cygnJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NvcGUub25Gb2N1c0hhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2NvcGUuZm9jdXNJbikge1xuICAgICAgICBzY29wZS5mb2N1c0luKCk7XG4gICAgICB9XG4gICAgICBpZiAobWlubGVuZ3RoID09PSAwICYmICghc2NvcGUuc2VhcmNoU3RyIHx8IHNjb3BlLnNlYXJjaFN0ci5sZW5ndGggPT09IDApKSB7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IHNjb3BlLmZvY3VzRmlyc3QgPyAwIDogc2NvcGUuY3VycmVudEluZGV4O1xuICAgICAgICBzY29wZS5zaG93RHJvcGRvd24gPSB0cnVlO1xuICAgICAgICBzaG93QWxsKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNjb3BlLmhpZGVSZXN1bHRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG1vdXNlZG93bk9uICYmXG4gICAgICAgIChtb3VzZWRvd25PbiA9PT0gc2NvcGUuaWQgKyAnX2Ryb3Bkb3duJyB8fFxuICAgICAgICBtb3VzZWRvd25Pbi5pbmRleE9mKCdhbmd1Y29tcGxldGUnKSA+PSAwKSkge1xuICAgICAgICBtb3VzZWRvd25PbiA9IG51bGw7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaGlkZVRpbWVyID0gJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoc2NvcGUuc2VhcmNoU3RyICYmIHNjb3BlLnNlYXJjaFN0ci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGlucHV0RmllbGQudmFsKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIEJMVVJfVElNRU9VVCk7XG4gICAgICAgIGNhbmNlbEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgaWYgKHNjb3BlLmZvY3VzT3V0KSB7XG4gICAgICAgICAgc2NvcGUuZm9jdXNPdXQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzY29wZS5vdmVycmlkZVN1Z2dlc3Rpb25zKSB7XG4gICAgICAgICAgaWYgKHNjb3BlLnNlYXJjaFN0ciAmJiBzY29wZS5zZWFyY2hTdHIubGVuZ3RoID4gMCAmJiBzY29wZS5jdXJyZW50SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICBoYW5kbGVPdmVycmlkZVN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNjb3BlLnJlc2V0SGlkZVJlc3VsdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoaGlkZVRpbWVyKSB7XG4gICAgICAgICR0aW1lb3V0LmNhbmNlbChoaWRlVGltZXIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBzY29wZS5ob3ZlclJvdyA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gaW5kZXg7XG4gICAgfTtcblxuICAgIHNjb3BlLnNlbGVjdFJlc3VsdCA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgIC8vIFJlc3RvcmUgb3JpZ2luYWwgdmFsdWVzXG4gICAgICBpZiAoc2NvcGUubWF0Y2hDbGFzcykge1xuICAgICAgICByZXN1bHQudGl0bGUgPSBleHRyYWN0VGl0bGUocmVzdWx0Lm9yaWdpbmFsT2JqZWN0KTtcbiAgICAgICAgcmVzdWx0LmRlc2NyaXB0aW9uID0gZXh0cmFjdFZhbHVlKHJlc3VsdC5vcmlnaW5hbE9iamVjdCwgc2NvcGUuZGVzY3JpcHRpb25GaWVsZCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzY29wZS5jbGVhclNlbGVjdGVkKSB7XG4gICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IG51bGw7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2NvcGUuc2VhcmNoU3RyID0gcmVzdWx0LnRpdGxlO1xuICAgICAgfVxuICAgICAgY2FsbE9yQXNzaWduKHJlc3VsdCk7XG4gICAgICBjbGVhclJlc3VsdHMoKTtcbiAgICB9O1xuXG4gICAgc2NvcGUuaW5wdXRDaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgaWYgKHN0ci5sZW5ndGggPCBtaW5sZW5ndGgpIHtcbiAgICAgICAgY2FuY2VsSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChzdHIubGVuZ3RoID09PSAwICYmIG1pbmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBzY29wZS5zZWFyY2hpbmcgPSBmYWxzZTtcbiAgICAgICAgc2hvd0FsbCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2NvcGUuaW5wdXRDaGFuZ2VkKSB7XG4gICAgICAgIHN0ciA9IHNjb3BlLmlucHV0Q2hhbmdlZChzdHIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9O1xuXG4gICAgLy8gY2hlY2sgcmVxdWlyZWRcbiAgICBpZiAoc2NvcGUuZmllbGRSZXF1aXJlZENsYXNzICYmIHNjb3BlLmZpZWxkUmVxdWlyZWRDbGFzcyAhPT0gJycpIHtcbiAgICAgIHJlcXVpcmVkQ2xhc3NOYW1lID0gc2NvcGUuZmllbGRSZXF1aXJlZENsYXNzO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIG1pbiBsZW5ndGhcbiAgICBpZiAoc2NvcGUubWlubGVuZ3RoICYmIHNjb3BlLm1pbmxlbmd0aCAhPT0gJycpIHtcbiAgICAgIG1pbmxlbmd0aCA9IHBhcnNlSW50KHNjb3BlLm1pbmxlbmd0aCwgMTApO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIHBhdXNlIHRpbWVcbiAgICBpZiAoIXNjb3BlLnBhdXNlKSB7XG4gICAgICBzY29wZS5wYXVzZSA9IFBBVVNFO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGNsZWFyU2VsZWN0ZWRcbiAgICBpZiAoIXNjb3BlLmNsZWFyU2VsZWN0ZWQpIHtcbiAgICAgIHNjb3BlLmNsZWFyU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayBvdmVycmlkZSBzdWdnZXN0aW9uc1xuICAgIGlmICghc2NvcGUub3ZlcnJpZGVTdWdnZXN0aW9ucykge1xuICAgICAgc2NvcGUub3ZlcnJpZGVTdWdnZXN0aW9ucyA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIHJlcXVpcmVkIGZpZWxkXG4gICAgaWYgKHNjb3BlLmZpZWxkUmVxdWlyZWQgJiYgY3RybCkge1xuICAgICAgLy8gY2hlY2sgaW5pdGlhbCB2YWx1ZSwgaWYgZ2l2ZW4sIHNldCB2YWxpZGl0aXR5IHRvIHRydWVcbiAgICAgIGlmIChzY29wZS5pbml0aWFsVmFsdWUpIHtcbiAgICAgICAgaGFuZGxlUmVxdWlyZWQodHJ1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaGFuZGxlUmVxdWlyZWQoZmFsc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNjb3BlLmlucHV0VHlwZSA9IGF0dHJzLnR5cGUgPyBhdHRycy50eXBlIDogJ3RleHQnO1xuXG4gICAgLy8gc2V0IHN0cmluZ3MgZm9yIFwiU2VhcmNoaW5nLi4uXCIgYW5kIFwiTm8gcmVzdWx0c1wiXG4gICAgc2NvcGUudGV4dFNlYXJjaGluZyA9IGF0dHJzLnRleHRTZWFyY2hpbmcgPyBhdHRycy50ZXh0U2VhcmNoaW5nIDogVEVYVF9TRUFSQ0hJTkc7XG4gICAgc2NvcGUudGV4dE5vUmVzdWx0cyA9IGF0dHJzLnRleHROb1Jlc3VsdHMgPyBhdHRycy50ZXh0Tm9SZXN1bHRzIDogVEVYVF9OT1JFU1VMVFM7XG4gICAgZGlzcGxheVNlYXJjaGluZyA9IHNjb3BlLnRleHRTZWFyY2hpbmcgPT09ICdmYWxzZScgPyBmYWxzZSA6IHRydWU7XG4gICAgZGlzcGxheU5vUmVzdWx0cyA9IHNjb3BlLnRleHROb1Jlc3VsdHMgPT09ICdmYWxzZScgPyBmYWxzZSA6IHRydWU7XG5cbiAgICAvLyBzZXQgbWF4IGxlbmd0aCAoZGVmYXVsdCB0byBtYXhsZW5ndGggZGVhdWx0IGZyb20gaHRtbFxuICAgIHNjb3BlLm1heGxlbmd0aCA9IGF0dHJzLm1heGxlbmd0aCA/IGF0dHJzLm1heGxlbmd0aCA6IE1BWF9MRU5HVEg7XG5cbiAgICAvLyByZWdpc3RlciBldmVudHNcbiAgICBpbnB1dEZpZWxkLm9uKCdrZXlkb3duJywga2V5ZG93bkhhbmRsZXIpO1xuICAgIGlucHV0RmllbGQub24oJ2tleXVwJywga2V5dXBIYW5kbGVyKTtcblxuICAgIC8vIHNldCByZXNwb25zZSBmb3JtYXR0ZXJcbiAgICByZXNwb25zZUZvcm1hdHRlciA9IGNhbGxGdW5jdGlvbk9ySWRlbnRpdHkoJ3JlbW90ZVVybFJlc3BvbnNlRm9ybWF0dGVyJyk7XG5cbiAgICAvLyBzZXQgaXNTY3JvbGxPblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjc3MgPSBnZXRDb21wdXRlZFN0eWxlKGRkKTtcbiAgICAgIGlzU2Nyb2xsT24gPSBjc3MubWF4SGVpZ2h0ICYmIGNzcy5vdmVyZmxvd1kgPT09ICdhdXRvJztcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgcmVxdWlyZTogJ14/Zm9ybScsXG4gICAgc2NvcGU6IHtcbiAgICAgIHNlbGVjdGVkT2JqZWN0OiAnPScsXG4gICAgICBkaXNhYmxlSW5wdXQ6ICc9JyxcbiAgICAgIGluaXRpYWxWYWx1ZTogJz0nLFxuICAgICAgbG9jYWxEYXRhOiAnPScsXG4gICAgICBsb2NhbFNlYXJjaDogJyYnLFxuICAgICAgcmVtb3RlVXJsUmVxdWVzdEZvcm1hdHRlcjogJz0nLFxuICAgICAgcmVtb3RlVXJsUmVxdWVzdFdpdGhDcmVkZW50aWFsczogJ0AnLFxuICAgICAgcmVtb3RlVXJsUmVzcG9uc2VGb3JtYXR0ZXI6ICc9JyxcbiAgICAgIHJlbW90ZVVybEVycm9yQ2FsbGJhY2s6ICc9JyxcbiAgICAgIHJlbW90ZUFwaUhhbmRsZXI6ICc9JyxcbiAgICAgIGlkOiAnQCcsXG4gICAgICB0eXBlOiAnQCcsXG4gICAgICBwbGFjZWhvbGRlcjogJ0AnLFxuICAgICAgcmVtb3RlVXJsOiAnQCcsXG4gICAgICByZW1vdGVVcmxEYXRhRmllbGQ6ICdAJyxcbiAgICAgIHRpdGxlRmllbGQ6ICdAJyxcbiAgICAgIGRlc2NyaXB0aW9uRmllbGQ6ICdAJyxcbiAgICAgIGltYWdlRmllbGQ6ICdAJyxcbiAgICAgIGlucHV0Q2xhc3M6ICdAJyxcbiAgICAgIHBhdXNlOiAnQCcsXG4gICAgICBzZWFyY2hGaWVsZHM6ICdAJyxcbiAgICAgIG1pbmxlbmd0aDogJ0AnLFxuICAgICAgbWF0Y2hDbGFzczogJ0AnLFxuICAgICAgY2xlYXJTZWxlY3RlZDogJ0AnLFxuICAgICAgb3ZlcnJpZGVTdWdnZXN0aW9uczogJ0AnLFxuICAgICAgZmllbGRSZXF1aXJlZDogJz0nLFxuICAgICAgZmllbGRSZXF1aXJlZENsYXNzOiAnQCcsXG4gICAgICBpbnB1dENoYW5nZWQ6ICc9JyxcbiAgICAgIGF1dG9NYXRjaDogJ0AnLFxuICAgICAgZm9jdXNPdXQ6ICcmJyxcbiAgICAgIGZvY3VzSW46ICcmJyxcbiAgICAgIGZpZWxkVGFiaW5kZXg6ICdAJyxcbiAgICAgIGlucHV0TmFtZTogJ0AnLFxuICAgICAgZm9jdXNGaXJzdDogJ0AnLFxuICAgICAgcGFyc2VJbnB1dDogJyYnXG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgVEVNUExBVEVfVVJMO1xuICAgIH0sXG4gICAgY29tcGlsZTogZnVuY3Rpb24gKHRFbGVtZW50KSB7XG4gICAgICB2YXIgc3RhcnRTeW0gPSAkaW50ZXJwb2xhdGUuc3RhcnRTeW1ib2woKTtcbiAgICAgIHZhciBlbmRTeW0gPSAkaW50ZXJwb2xhdGUuZW5kU3ltYm9sKCk7XG4gICAgICBpZiAoIShzdGFydFN5bSA9PT0gJ3t7JyAmJiBlbmRTeW0gPT09ICd9fScpKSB7XG4gICAgICAgIHZhciBpbnRlcnBvbGF0ZWRIdG1sID0gdEVsZW1lbnQuaHRtbCgpXG4gICAgICAgICAgLnJlcGxhY2UoL1xce1xcey9nLCBzdGFydFN5bSlcbiAgICAgICAgICAucmVwbGFjZSgvXFx9XFx9L2csIGVuZFN5bSk7XG4gICAgICAgIHRFbGVtZW50Lmh0bWwoaW50ZXJwb2xhdGVkSHRtbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGluaztcbiAgICB9XG4gIH07XG59XSk7XG5cblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogbm9kZV9tb2R1bGVzL2FuZ3Vjb21wbGV0ZS1hbHQvYW5ndWNvbXBsZXRlLWFsdC5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGRpYXJ5TW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ2RpYXJ5JywgW10pO1xyXG5cclxuZGlhcnlNb2R1bGVcclxuICAgIC5jb21wb25lbnQoJ21lbnUnLCByZXF1aXJlKCcuL21lbnUvbWVudS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ21haW5WaWV3JywgcmVxdWlyZSgnLi9tYWluLXZpZXcvbWFpbi12aWV3LWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgnZGF5VGltZScsIHJlcXVpcmUoJy4vZGF5LXRpbWUvZGF5LXRpbWUtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdmb29kJywgcmVxdWlyZSgnLi9mb29kL2Zvb2QtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdzYXZlTWVudScsIHJlcXVpcmUoJy4vc2F2ZS1tZW51L3NhdmUtbWVudS1jb21wb25lbnQnKSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRpYXJ5TW9kdWxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvaW5kZXguanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgbWVudVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9tZW51LXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IG1lbnUgPSB7XHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHdpbmRvdywgJHRpbWVvdXQsIHZhbGlkYXRpb25TZXJ2aWNlLCBsaW1pdHNTZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5jYXJib2h5ZHJhdGVzID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wcm90ZWlucyA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnNldERpZXQgPSBmdW5jdGlvbiAoZGlldCkge1xyXG4gICAgICAgICAgICBpZiAodGhpc1tkaWV0XSkge1xyXG4gICAgICAgICAgICAgICAgdGhpc1tkaWV0XSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4gdGhpc1tkaWV0XSA9IHRydWUsIDApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2FyYm9oeWRyYXRlcyA9IGRpZXQgPT09ICdjYXJib2h5ZHJhdGVzJztcclxuICAgICAgICAgICAgdGhpcy5wcm90ZWlucyA9IGRpZXQgPT09ICdwcm90ZWlucyc7XHJcbiAgICAgICAgICAgIGlmICh2YWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUxpbWl0c0Nob29zZSh0aGlzLmNhcmJvaHlkcmF0ZXMsIHRoaXMucHJvdGVpbnMsIHRoaXMuY2xhc3NOYW1lKSkgdGhpcy5zZXRMaW1pdHMoKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnc3RhcnQnO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5zZXRDbGFzc05hbWUgPSBmdW5jdGlvbiAocGhhc2VJZCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jbGFzc05hbWUgIT09ICdzdGFydCcpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5jbGFzc05hbWUgPSAnYWN0aXZlJyArIHBoYXNlSWQ7XHJcbiAgICAgICAgICAgIGlmICh2YWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUxpbWl0c0Nob29zZSh0aGlzLmNhcmJvaHlkcmF0ZXMsIHRoaXMucHJvdGVpbnMsIHRoaXMuY2xhc3NOYW1lKSkgdGhpcy5zZXRMaW1pdHMoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMubW92ZUxlZnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW1iID0gK3RoaXMuY2xhc3NOYW1lLnNsaWNlKC0xKTtcclxuICAgICAgICAgICAgbnVtYiAtPSAxO1xyXG4gICAgICAgICAgICBpZiAoIW51bWIpIG51bWIgPSAzO1xyXG4gICAgICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICdhY3RpdmUnICsgbnVtYjtcclxuICAgICAgICAgICAgaWYgKHZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlTGltaXRzQ2hvb3NlKHRoaXMuY2FyYm9oeWRyYXRlcywgdGhpcy5wcm90ZWlucywgdGhpcy5jbGFzc05hbWUpKSB0aGlzLnNldExpbWl0cygpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5tb3ZlUmlnaHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBudW1iID0gK3RoaXMuY2xhc3NOYW1lLnNsaWNlKC0xKTtcclxuICAgICAgICAgICAgbnVtYiArPSAxO1xyXG4gICAgICAgICAgICBpZiAobnVtYiA+IDMpIG51bWIgPSAxO1xyXG4gICAgICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICdhY3RpdmUnICsgbnVtYjtcclxuICAgICAgICAgICAgaWYgKHZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlTGltaXRzQ2hvb3NlKHRoaXMuY2FyYm9oeWRyYXRlcywgdGhpcy5wcm90ZWlucywgdGhpcy5jbGFzc05hbWUpKSB0aGlzLnNldExpbWl0cygpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0TGltaXRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBsZXQgZGlldCA9IHRoaXMuY2FyYm9oeWRyYXRlcyA/ICdjYXJib2h5ZHJhdGVzJyA6ICdwcm90ZWlucycsXHJcbiAgICAgICAgICAgICAgICBwaGFzZSA9IHRoaXMuY2xhc3NOYW1lLnNsaWNlKC0xKTtcclxuICAgICAgICAgICAgbGltaXRzU2VydmljZS5zZXRMaW1pdHMoZGlldCwgcGhhc2UpO1xyXG5cclxuICAgICAgICAgICAgJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zYXZlZExpbWl0cyA9IEpTT04uc3RyaW5naWZ5KHtkaWV0OiBkaWV0LCBwaGFzZUlkOiBwaGFzZX0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlZExpbWl0cykge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZWRMaW1pdHMpO1xyXG4gICAgICAgICAgICB0aGlzLnNldERpZXQoZGF0YS5kaWV0KTtcclxuICAgICAgICAgICAgdGhpcy5zZXRDbGFzc05hbWUoZGF0YS5waGFzZUlkKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IG1lbnVUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBtZW51O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvbWVudS9tZW51LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwibWVudS1iclxcXCI+PC9kaXY+IDxkaXYgaWQ9XFxcIm1lbnVcXFwiPiA8ZGl2IGNsYXNzPVxcXCJkaWV0LW1lbnVcXFwiPiA8ZGl2IGNsYXNzPVxcXCJkaWV0LXRpdHRsZVxcXCI+0JLQuNC0INC00LjQtdGC0Ys6PC9kaXY+IDxkaXYgY2xhc3M9XFxcImRpZXQtY2hvb3NlXFxcIj4gPHNwYW4gY2xhc3M9XFxcImRpZXRcXFwiIG5nLWNsYXNzPVxcXCJ7YWN0aXZlOiAkY3RybC5wcm90ZWluc31cXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zZXREaWV0KCdwcm90ZWlucycpXFxcIj7QktGL0YHQvtC60L7Qv9GA0L7RgtC10LjQvdC+0LLQsNGPINC60L7QvNCx0LjQvdCw0YbQuNGPINC30LDQvNC10L08L3NwYW4+XFxuPHNwYW4gY2xhc3M9XFxcInNsYXNoXFxcIj4vPC9zcGFuPlxcbjxzcGFuIGNsYXNzPVxcXCJkaWV0XFxcIiBuZy1jbGFzcz1cXFwie2FjdGl2ZTogJGN0cmwuY2FyYm9oeWRyYXRlc31cXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zZXREaWV0KCdjYXJib2h5ZHJhdGVzJylcXFwiPtCS0YvRgdC+0LrQvtGD0LPQu9C10LLQvtC00L3QsNGPINC60L7QvNCx0LjQvdCw0YbQuNGPINC30LDQvNC10L08L3NwYW4+IDwvZGl2PiA8L2Rpdj4gPGRpdiBjbGFzcz1cXFwicGhhc2UtbWVudVxcXCI+IDxkaXYgY2xhc3M9XFxcInBoYXNlLXRpdHRsZVxcXCI+0JLRi9Cx0LXRgNC10YLQtSDQktCw0YjRgyDRhNCw0LfRgzo8L2Rpdj4gPGRpdiBjbGFzcz1cXFwicGhhc2UtY2hvb3NlXFxcIj4gPGRpdiBpZD1cXFwiYXJyb3ctbGVmdFxcXCIgbmctY2xhc3M9XFxcIiRjdHJsLmNsYXNzTmFtZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLm1vdmVMZWZ0KClcXFwiPjwvZGl2PiA8YSBocmVmPVxcXCIjXFxcIiBuZy1jbGFzcz1cXFwiJGN0cmwuY2xhc3NOYW1lXFxcIiBjbGFzcz1cXFwiZmlyc3QtcGhhc2VcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zZXRDbGFzc05hbWUoMSlcXFwiPjE8L2E+XFxuPGEgaHJlZj1cXFwiI1xcXCIgbmctY2xhc3M9XFxcIiRjdHJsLmNsYXNzTmFtZVxcXCIgY2xhc3M9XFxcInNlY29uZC1waGFzZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldENsYXNzTmFtZSgyKVxcXCI+MjwvYT5cXG48YSBocmVmPVxcXCIjXFxcIiBuZy1jbGFzcz1cXFwiJGN0cmwuY2xhc3NOYW1lXFxcIiBjbGFzcz1cXFwidGhpcmQtcGhhc2VcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zZXRDbGFzc05hbWUoMylcXFwiPjM8L2E+IDxkaXYgaWQ9XFxcImFycm93LXJpZ2h0XFxcIiBuZy1jbGFzcz1cXFwiJGN0cmwuY2xhc3NOYW1lXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwubW92ZVJpZ2h0KClcXFwiPjwvZGl2PiA8L2Rpdj4gPC9kaXY+IDwvZGl2PiA8ZGl2IGNsYXNzPVxcXCJtZW51LWJyXFxcIj48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwibWVudS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC9kaWFyeS1tb2R1bGUvbWVudS90ZW1wbGF0ZS9tZW51LXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSA1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IG1haW5WaWV3VGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL21haW4tdmlldy5odG1sJyk7XG5cbmNvbnN0IG1haW5WaWV3ID0ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIChkYXRhU2VydmljZSwgbGltaXRzU2VydmljZSwgJHdpbmRvdykge1xuICAgICAgICBjb25zdCBlbXB0eSA9IHtcbiAgICAgICAgICAgIGVtcHR5OiB0cnVlLFxuICAgICAgICAgICAgbmFtZTogJy0tLS0tLS0tLScsXG4gICAgICAgICAgICBwb3J0aW9uOiAnLS0tJyxcbiAgICAgICAgICAgIGNhcmJvaHlkOiAnLS0tJyxcbiAgICAgICAgICAgIHByb3Q6ICctLS0nLFxuICAgICAgICAgICAgZmF0OiAnLS0tJyxcbiAgICAgICAgICAgIGthbGw6ICctLS0nXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5iYXNlID0ge307XG4gICAgICAgIHRoaXMudmlld0RhdGEgPSB7XG4gICAgICAgICAgICBsaW1pdHNEYXRhOiBsaW1pdHNTZXJ2aWNlLmxpbWl0c0RhdGFcbiAgICAgICAgfTtcblxuXG5cbiAgICAgICAgZGF0YVNlcnZpY2UuZ2V0Rm9vZEJhc2UoKVxuICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHRoaXMuYmFzZS5mb29kcyA9IGRhdGEpO1xuXG4gICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlRGF0YSkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVEYXRhKTtcbiAgICAgICAgICAgIHRoaXMudmlld0RhdGEuZGF5VGltZXMgPSBkYXRhLmRheXNEYXRhO1xuICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbCA9IGRhdGEucmVzdWx0RmluYWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXRhU2VydmljZS5nZXREYXlUaW1lc0RhdGEoKVxuICAgICAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB0aGlzLnZpZXdEYXRhLmRheVRpbWVzID0gZGF0YS5kYXRhKTtcblxuICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbCA9IHtcbiAgICAgICAgICAgICAgICBjYXJib2h5ZDogMCxcbiAgICAgICAgICAgICAgICBwcm90OiAwLFxuICAgICAgICAgICAgICAgIGZhdDogMCxcbiAgICAgICAgICAgICAgICBrYWxsOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIHRoaXMuY29tcGFyZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnZpZXdEYXRhLmxpbWl0c0RhdGEubGltaXRzKSByZXR1cm47XG4gICAgICAgICAgICBpZiAodGhpcy52aWV3RGF0YS5saW1pdHNEYXRhLmxpbWl0c1tcItCY0YLQvtCzXCJdW2tleV0gPCB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsW2tleV0pIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgdGhpcy5hZGRGb29kID0gZnVuY3Rpb24oZGF5VGltZUlkLCBmb29kKSB7XG4gICAgICAgICAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMudmlld0RhdGEuZGF5VGltZXNbZGF5VGltZUlkXS5mb29kcztcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9uWzBdLmVtcHR5KSBjb2xsZWN0aW9uLnNwbGljZSgwLCAxKTtcblxuICAgICAgICAgICAgY29sbGVjdGlvbi5wdXNoKGZvb2QpO1xuICAgICAgICAgICAgdGhpcy5jYWxjUmVzdWx0KGRheVRpbWVJZCwgZm9vZCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCkgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnX2xhc3RTYXZlSWQnKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZUZvb2QgPSBmdW5jdGlvbihkYXlUaW1lSWQsIGZvb2QpIHtcbiAgICAgICAgICAgIGxldCBjb2xsZWN0aW9uID0gdGhpcy52aWV3RGF0YS5kYXlUaW1lc1tkYXlUaW1lSWRdLmZvb2RzO1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gY29sbGVjdGlvbi5pbmRleE9mKGZvb2QpO1xuICAgICAgICAgICAgY29sbGVjdGlvbi5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbi5sZW5ndGggPT09IDApIGNvbGxlY3Rpb24ucHVzaChlbXB0eSk7XG4gICAgICAgICAgICB0aGlzLmNhbGNSZXN1bHQoZGF5VGltZUlkLCBmb29kLCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuX2xhc3RTYXZlSWQpICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ19sYXN0U2F2ZUlkJyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy50b2dnbGVEYXlUaW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIHRoaXMudmlld0RhdGEuZGF5VGltZXNbaWRdLnNob3cgPSAhdGhpcy52aWV3RGF0YS5kYXlUaW1lc1tpZF0uc2hvd1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgdGhpcy5jYWxjUmVzdWx0ID0gZnVuY3Rpb24gKGRheVRpbWVJZCwgZm9vZCwgYm9vbCkge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHRoaXMudmlld0RhdGEuZGF5VGltZXNbZGF5VGltZUlkXS5yZXN1bHQ7XG4gICAgICAgICAgICBpZiAoYm9vbCkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gKz0gZm9vZFtrZXldO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsW2tleV0gKz0gZm9vZFtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSAtPSBmb29kW2tleV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld0RhdGEucmVzdWx0RmluYWxba2V5XSAtPSBmb29kW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogbWFpblZpZXdUZW1wbGF0ZVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBtYWluVmlldztcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvZGlhcnktbW9kdWxlL21haW4tdmlldy9tYWluLXZpZXctY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJtYWluLXZpZXdcXFwiPiA8ZGF5LXRpbWUgbmctcmVwZWF0PVxcXCJ0aW1lIGluICRjdHJsLnZpZXdEYXRhLmRheVRpbWVzXFxcIiB0aW1lPVxcXCJ0aW1lXFxcIiBiYXNlPVxcXCIkY3RybC5iYXNlXFxcIiBkYXktdGltZS1saW1pdHM9XFxcIiRjdHJsLnZpZXdEYXRhLmxpbWl0c0RhdGFcXFwiIGFkZD1cXFwiJGN0cmwuYWRkRm9vZChkYXlUaW1lSWQsIGZvb2QpXFxcIiByZW1vdmU9XFxcIiRjdHJsLnJlbW92ZUZvb2QoZGF5VGltZUlkLCBmb29kKVxcXCIgdG9nZ2xlPVxcXCIkY3RybC50b2dnbGVEYXlUaW1lKGlkKVxcXCI+PC9kYXktdGltZT4gPGRpdiBjbGFzcz1cXFwicmVzdWx0XFxcIj4gPGRpdiBjbGFzcz1cXFwicmVzdWx0LXRpdHRsZVxcXCI+0JjRgtC+0LPQvjwvZGl2PiA8c2VjdGlvbiBjbGFzcz1cXFwidGFibGUtcmVzdWx0XFxcIj4gPGRpdiBjbGFzcz1cXFwidGFibGUtcmVzdWx0LXRpdHRsZVxcXCI+IDxzcGFuIGNsYXNzPVxcXCJyZXN1bHQtbm8tbmFtZVxcXCI+LS0tLS0tLS0tLS0tLS0tLTwvc3Bhbj5cXG48c3BhbiBjbGFzcz1cXFwicG9ydGlvblxcXCI+0J/QvtGA0YbQuNGPKNCz0YApPC9zcGFuPlxcbjxzcGFuIGNsYXNzPVxcXCJjYXJib2h5ZFxcXCI+0KPQs9C70LXQstC+0LTRizwvc3Bhbj5cXG48c3BhbiBjbGFzcz1cXFwicHJvdFxcXCI+0JHQtdC70LrQuDwvc3Bhbj5cXG48c3BhbiBjbGFzcz1cXFwiZmF0XFxcIj7QltC40YDRizwvc3Bhbj5cXG48c3BhbiBjbGFzcz1cXFwia2FsbFxcXCI+0JrQsNC70L7RgNC40Lg8L3NwYW4+IDwvZGl2PiA8ZGl2IGNsYXNzPVxcXCJyZXN1bHQtZmluYWxcXFwiPiA8c3BhbiBjbGFzcz1cXFwibmFtZVxcXCI+PC9zcGFuPlxcbjxzcGFuIGNsYXNzPVxcXCJwb3J0aW9uXFxcIj4tLS08L3NwYW4+XFxuPHNwYW4gY2xhc3M9XFxcImNhcmJvaHlkXFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtbGltaXQnOiAkY3RybC5jb21wYXJlKCdjYXJib2h5ZCcpfVxcXCI+e3sgJGN0cmwudmlld0RhdGEucmVzdWx0RmluYWwuY2FyYm9oeWQgfX0ge3snKCcgKyAkY3RybC52aWV3RGF0YS5saW1pdHNEYXRhLmxpbWl0c1tcXFwi0JjRgtC+0LNcXFwiXS5jYXJib2h5ZCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcbjxzcGFuIGNsYXNzPVxcXCJwcm90XFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtbGltaXQnOiAkY3RybC5jb21wYXJlKCdwcm90Jyl9XFxcIj57eyAkY3RybC52aWV3RGF0YS5yZXN1bHRGaW5hbC5wcm90IH19IHt7JygnICsgJGN0cmwudmlld0RhdGEubGltaXRzRGF0YS5saW1pdHNbXFxcItCY0YLQvtCzXFxcIl0ucHJvdCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcbjxzcGFuIGNsYXNzPVxcXCJmYXRcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2ZhdCcpfVxcXCI+e3sgJGN0cmwudmlld0RhdGEucmVzdWx0RmluYWwuZmF0IH19IHt7JygnICsgJGN0cmwudmlld0RhdGEubGltaXRzRGF0YS5saW1pdHNbXFxcItCY0YLQvtCzXFxcIl0uZmF0ICsgJyknIHwgbGltaXQgfX08L3NwYW4+XFxuPHNwYW4gY2xhc3M9XFxcImthbGxcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2thbGwnKX1cXFwiPnt7ICRjdHJsLnZpZXdEYXRhLnJlc3VsdEZpbmFsLmthbGwgfX0ge3snKCcgKyAkY3RybC52aWV3RGF0YS5saW1pdHNEYXRhLmxpbWl0c1tcXFwi0JjRgtC+0LNcXFwiXS5rYWxsICsgJyknIHwgbGltaXQgfX08L3NwYW4+IDwvZGl2PiA8L3NlY3Rpb24+IDwvZGl2PiA8L2Rpdj4gPHNhdmUtbWVudSBkYXktdGltZXMtZGF0YT1cXFwiJGN0cmwudmlld0RhdGEuZGF5VGltZXNcXFwiIHJlc3VsdD1cXFwiJGN0cmwudmlld0RhdGEucmVzdWx0RmluYWxcXFwiPjwvc2F2ZS1tZW51PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJtYWluLXZpZXcuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvZGlhcnktbW9kdWxlL21haW4tdmlldy90ZW1wbGF0ZS9tYWluLXZpZXcuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgZGF5VGltZVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9kYXktdGltZS10ZW1wbGF0ZS5odG1sJyk7XG5cbmNvbnN0IGRheVRpbWUgPSB7XG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgYmFzZTogJzwnLFxuICAgICAgICB0aW1lOiAnPCcsXG4gICAgICAgIHRvZ2dsZTogJyYnLFxuICAgICAgICBhZGQ6ICcmJyxcbiAgICAgICAgcmVtb3ZlOiAnJicsXG4gICAgICAgIGRheVRpbWVMaW1pdHM6ICc8J1xuICAgIH0sXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oZGF0YVNlcnZpY2UsIHZhbGlkYXRpb25TZXJ2aWNlLCBjYWxjdWxhdGlvblNlcnZpY2UsICRzY29wZSkge1xuICAgICAgICB2YXIgdGV4dCA9ICcnO1xuICAgICAgICB0aGlzLm9uSW5wdXQgPSBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgICAgIHRleHQgPSBzdHI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5saW1pdHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRheVRpbWVMaW1pdHMubGltaXRzKSByZXR1cm4gdGhpcy5kYXlUaW1lTGltaXRzLmxpbWl0c1t0aGlzLnRpbWUuZGF5VGltZV07XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jb21wYXJlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubGltaXRzKCkpIHJldHVybjtcbiAgICAgICAgICAgIGlmICh0aGlzLmxpbWl0cygpW2tleV0gPCB0aGlzLnRpbWUucmVzdWx0W2tleV0pIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVtb3ZlRm9vZCA9IGZ1bmN0aW9uKGZvb2QpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKHtkYXlUaW1lSWQ6IHRoaXMudGltZS5pZCwgZm9vZDogZm9vZH0pXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5hZGRGb29kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgcG9ydGlvbiA9IE1hdGgucm91bmQoK3RoaXMucG9ydGlvbik7XG4gICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZm9vZE5hbWUgPyB0aGlzLmZvb2ROYW1lLnRpdGxlIDogdGV4dDtcblxuICAgICAgICAgICAgLy/Qn9GA0L7QstC10YDQuNGC0Ywg0L/QvtC70Y8g0LLQstC+0LTQsCwg0LLRi9GH0LjRgdC70LjRgtGMINC30L3QsNGH0LXQvdC40Y9cbiAgICAgICAgICAgIGlmICghdmFsaWRhdGlvblNlcnZpY2UuZm9vZEFkZFZhbGlkYXRpb24obmFtZSwgcG9ydGlvbikpIHJldHVybjtcbiAgICAgICAgICAgIHZhciBmb29kID0gY2FsY3VsYXRpb25TZXJ2aWNlLmNhbGN1bGF0ZVZhbHVlcyhuYW1lLCBwb3J0aW9uKTtcblxuICAgICAgICAgICAgLy/QlNC+0LHQsNCy0LjRgtGMINCyINC80LDRgdGB0LjQslxuICAgICAgICAgICAgdGhpcy5hZGQoe2RheVRpbWVJZDogdGhpcy50aW1lLmlkLCBmb29kOiBmb29kfSk7XG5cbiAgICAgICAgICAgIC8v0J7Rh9C40YHRgtC40YLRjCDQv9C+0LvRjyDQstCy0L7QtNCwXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnYW5ndWNvbXBsZXRlLWFsdDpjbGVhcklucHV0Jyk7XG4gICAgICAgICAgICB0aGlzLnBvcnRpb24gPScnO1xuXG4gICAgICAgICAgICAvL9Ce0YLQutGA0YvRgtGMLCDQtdGB0LvQuCDRgdC60YDRi9GC0L5cbiAgICAgICAgICAgIGlmICghdGhpcy50aW1lLnNob3cpIHRoaXMudG9nZ2xlKHtpZDogdGhpcy50aW1lLmlkfSk7XG4gICAgICAgIH07XG5cblxuICAgICAgICB0aGlzLmVudGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlICE9PSAxMykgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5hZGRGb29kKCk7XG4gICAgICAgIH07XG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogZGF5VGltZVRlbXBsYXRlXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRheVRpbWU7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL2RpYXJ5LW1vZHVsZS9kYXktdGltZS9kYXktdGltZS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcImRheS10aW1lXFxcIj4gPGgzIGNsYXNzPVxcXCJkYXktdGltZS10aXR0bGVcXFwiPnt7ICRjdHJsLnRpbWUuZGF5VGltZSB9fTwvaDM+IDxkaXYgY2xhc3M9XFxcImlucHV0XFxcIj4gPGZvcm0+IDxsYWJlbD7QndCw0LjQvNC10L3QvtCy0LDQvdC40LU6IDxhbmd1Y29tcGxldGUtYWx0IG5nLWtleXByZXNzPVxcXCIkY3RybC5lbnRlcigkZXZlbnQpXFxcIiBpZD1cXFwiZXgxXFxcIiBwbGFjZWhvbGRlcj1cXFwi0JLQstC10LTQuNGC0LUg0L/RgNC+0LTRg9C60YJcXFwiIHBhdXNlPVxcXCIxMDBcXFwiIHNlbGVjdGVkLW9iamVjdD1cXFwiJGN0cmwuZm9vZE5hbWVcXFwiIGxvY2FsLWRhdGE9XFxcIiRjdHJsLmJhc2UuZm9vZHMua2V5c1xcXCIgc2VhcmNoLWZpZWxkcz1cXFwiZm9vZE5hbWVcXFwiIHRpdGxlLWZpZWxkPVxcXCJmb29kTmFtZVxcXCIgbWlubGVuZ3RoPVxcXCIxXFxcIiBpbnB1dC1jaGFuZ2VkPVxcXCIkY3RybC5vbklucHV0XFxcIiBpbnB1dC1jbGFzcz1cXFwiZm9vZCBmb3JtLWNvbnRyb2wtc21hbGxcXFwiIG1hdGNoLWNsYXNzPVxcXCJoaWdobGlnaHRcXFwiPjwvYW5ndWNvbXBsZXRlLWFsdD48L2xhYmVsPiA8bGFiZWw+0J/QvtGA0YbQuNGPKNCz0YApOiA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcInBvcnRpb25faW5wdXRcXFwiIHNpemU9XFxcIjJcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC5wb3J0aW9uXFxcIiBuZy1rZXlwcmVzcz1cXFwiJGN0cmwuZW50ZXIoJGV2ZW50KVxcXCIvPjwvbGFiZWw+IDwvZm9ybT4gPGRpdiBjbGFzcz1cXFwiYWRkLWJ1dHRvblxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmFkZEZvb2QoKVxcXCI+KzwvZGl2PiA8ZGl2IGNsYXNzPVxcXCJ0b2dnbGUtdGFibGVcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC50b2dnbGUoe2lkOiAkY3RybC50aW1lLmlkfSlcXFwiIG5nLWNsYXNzPVxcXCJ7ZG93bjogISRjdHJsLnRpbWUuc2hvdywgdXA6ICRjdHJsLnRpbWUuc2hvd31cXFwiPjwvZGl2PiA8L2Rpdj4gPGRpdiBjbGFzcz1cXFwidGFibGUtYm9yZGVyXFxcIiBuZy1pZj1cXFwiJGN0cmwudGltZS5zaG93XFxcIj4gPGRpdiBjbGFzcz1cXFwidGFibGVcXFwiPiA8ZGl2IGNsYXNzPVxcXCJ0YWJsZS10aXR0bGVcXFwiPiA8c3BhbiBjbGFzcz1cXFwibmFtZVxcXCI+0J3QsNC40LzQtdC90L7QstCw0L3QuNC1INC/0YDQvtC00YPQutGC0LA8L3NwYW4+XFxuPHNwYW4gY2xhc3M9XFxcInBvcnRpb25cXFwiPtCf0L7RgNGG0LjRjyjQs9GAKTwvc3Bhbj5cXG48c3BhbiBjbGFzcz1cXFwiY2FyYm9oeWRcXFwiPtCj0LPQu9C10LLQvtC00Ys8L3NwYW4+XFxuPHNwYW4gY2xhc3M9XFxcInByb3RcXFwiPtCR0LXQu9C60Lg8L3NwYW4+XFxuPHNwYW4gY2xhc3M9XFxcImZhdFxcXCI+0JbQuNGA0Ys8L3NwYW4+XFxuPHNwYW4gY2xhc3M9XFxcImthbGxcXFwiPtCa0LDQu9C+0YDQuNC4PC9zcGFuPiA8L2Rpdj4gPGZvb2QgbmctcmVwZWF0PVxcXCJmb29kIGluICRjdHJsLnRpbWUuZm9vZHNcXFwiIGZvb2Q9XFxcImZvb2RcXFwiIHJlbW92ZT1cXFwiJGN0cmwucmVtb3ZlRm9vZChmb29kKVxcXCI+PC9mb29kPiA8ZGl2IGNsYXNzPVxcXCJzdW1tYXJ5XFxcIj4gPHNwYW4gY2xhc3M9XFxcIm5hbWVcXFwiPtCf0L7QtNGL0YLQvtCzPC9zcGFuPlxcbjxzcGFuIGNsYXNzPVxcXCJwb3J0aW9uXFxcIj4tLS08L3NwYW4+XFxuPHNwYW4gY2xhc3M9XFxcImNhcmJvaHlkXFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtbGltaXQnOiAkY3RybC5jb21wYXJlKCdjYXJib2h5ZCcpfVxcXCI+e3sgJGN0cmwudGltZS5yZXN1bHQuY2FyYm9oeWQgfX0ge3snKCcgKyAkY3RybC5saW1pdHMoKS5jYXJib2h5ZCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcbjxzcGFuIGNsYXNzPVxcXCJwcm90XFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtbGltaXQnOiAkY3RybC5jb21wYXJlKCdwcm90Jyl9XFxcIj57eyAkY3RybC50aW1lLnJlc3VsdC5wcm90IH19IHt7JygnICsgJGN0cmwubGltaXRzKCkucHJvdCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcbjxzcGFuIGNsYXNzPVxcXCJmYXRcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2ZhdCcpfVxcXCI+e3sgJGN0cmwudGltZS5yZXN1bHQuZmF0IH19IHt7JygnICsgJGN0cmwubGltaXRzKCkuZmF0ICsgJyknIHwgbGltaXQgfX08L3NwYW4+XFxuPHNwYW4gY2xhc3M9XFxcImthbGxcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2thbGwnKX1cXFwiPnt7ICRjdHJsLnRpbWUucmVzdWx0LmthbGwgfX0ge3snKCcgKyAkY3RybC5saW1pdHMoKS5rYWxsICsgJyknIHwgbGltaXQgfX08L3NwYW4+IDwvZGl2PiA8L2Rpdj4gPC9kaXY+IDwvZGl2PiA8ZGl2IGNsYXNzPVxcXCJiclxcXCI+PC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcImRheS10aW1lLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9kYXktdGltZS90ZW1wbGF0ZS9kYXktdGltZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgZm9vZFRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9mb29kLXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IGZvb2QgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGZvb2Q6ICc8JyxcclxuICAgICAgICByZW1vdmU6ICcmJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY2hlY2tFbXB0eUZvb2QgPSBmdW5jdGlvbihmb29kKSB7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihmb29kLmthbGwpKSByZXR1cm4gJ2VtcHR5J1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogZm9vZFRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZvb2Q7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL2RpYXJ5LW1vZHVsZS9mb29kL2Zvb2QtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJmb29kXFxcIiBuZy1jbGFzcz1cXFwiJGN0cmwuY2hlY2tFbXB0eUZvb2QoJGN0cmwuZm9vZClcXFwiPiA8c3BhbiBjbGFzcz1cXFwibmFtZVxcXCI+e3sgJGN0cmwuZm9vZC5uYW1lIH19PC9zcGFuPlxcbjxzcGFuIGNsYXNzPVxcXCJwb3J0aW9uXFxcIj57eyAkY3RybC5mb29kLnBvcnRpb24gfX08L3NwYW4+XFxuPHNwYW4gY2xhc3M9XFxcImNhcmJvaHlkXFxcIj57eyAkY3RybC5mb29kLmNhcmJvaHlkIH19PC9zcGFuPlxcbjxzcGFuIGNsYXNzPVxcXCJwcm90XFxcIj57eyAkY3RybC5mb29kLnByb3QgfX08L3NwYW4+XFxuPHNwYW4gY2xhc3M9XFxcImZhdFxcXCI+e3sgJGN0cmwuZm9vZC5mYXQgfX08L3NwYW4+XFxuPHNwYW4gY2xhc3M9XFxcImthbGxcXFwiPnt7ICRjdHJsLmZvb2Qua2FsbCB9fTwvc3Bhbj4gPGRpdiBjbGFzcz1cXFwicmVtb3ZlLWZvb2RcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5yZW1vdmUoe2Zvb2Q6ICRjdHJsLmZvb2R9KVxcXCI+PC9kaXY+IDwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJmb29kLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9mb29kL3RlbXBsYXRlL2Zvb2QtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDExXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBzYXZlTWVudVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9zYXZlLW1lbnUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3Qgc2F2ZU1lbnUgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGRheVRpbWVzRGF0YTogJzwnLFxyXG4gICAgICAgIHJlc3VsdDogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHdpbmRvdywgdmFsaWRhdGlvblNlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSA9ICF0aGlzLmFjdGl2ZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNhdmVGb3JQcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9ICR3aW5kb3cubG9jYWxTdG9yYWdlLmRheXNEYXRhID8gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5kYXlzRGF0YSkgOiBbXTtcclxuICAgICAgICAgICAgLy/Qn9GA0L7QstC10YDQutC4XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA+IDAgJiYgbmV3IERhdGUoZGF0YVtkYXRhLmxlbmd0aCAtIDFdLnNhdmVUaW1lKS5nZXREYXkoKSA9PT0gbmV3IERhdGUoKS5nZXREYXkoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZGF0YS5sZW5ndGggLSAxXS5zYXZlVGltZUlkID09PSAkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KCfQndC10YIg0L3QvtCy0YvRhSDQtNCw0L3QvdGL0YUg0LTQu9GPINGB0L7RhdGA0LDQvdC10L3QuNGPJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFjb25maXJtKCfQn9C10YDQtdC30LDQv9C40YHQsNGC0Ywg0LTQsNC90L3Ri9C1INC/0LXRh9Cw0YLQuCDRgtC10LrRg9GI0LXQs9C+INC00L3Rjz8nKSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgZGF0YS5wb3AoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL9Ch0L7RhdGA0LDQvdC10L3QuNC1XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgbGV0IGlkID0gKE1hdGgucmFuZG9tKCkgKyAnJykuc2xpY2UoMik7XHJcbiAgICAgICAgICAgIGxldCBkYXlEYXRhID0ge3NhdmVUaW1lOiBkYXRlLCBkYXlUaW1lczogdGhpcy5kYXlUaW1lc0RhdGEsIHJlc3VsdDogdGhpcy5yZXN1bHQsIHNhdmVUaW1lSWQ6IGlkfTtcclxuICAgICAgICAgICAgZGF0YS5wdXNoKGRheURhdGEpO1xyXG4gICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5kYXlzRGF0YSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xyXG4gICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCA9IGlkO1xyXG4gICAgICAgICAgICBhbGVydCgn0JTQsNC90L3Ri9C1INGD0YHQv9C10YjQvdC+INGB0L7RhdGA0LDQvdC10L3RiycpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMucmVtb3ZlUHJpbnRTYXZlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZGF5c0RhdGEgJiYgY29uZmlybSgn0KPQtNCw0LvQuNGC0Ywg0YHQvtGF0YDQsNC90LXQvdC40Y8g0LTQu9GPINC/0LXRh9Cw0YLQuD8nKSkge1xyXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnZGF5c0RhdGEnKTtcclxuICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ19sYXN0U2F2ZUlkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5wcmV2aWV3ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZGF5c0RhdGE7XHJcbiAgICAgICAgICAgIGlmICghZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpcm0oJ9Ch0L7RhdGA0LDQvdC40YLRjCDRgtC10LrRg9GJ0LjQtSDQtNCw0L3QvdGL0LUg0LTQu9GPINC/0YDQvtGB0LzQvtGC0YDQsD8nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZUZvclByaW50KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KCfQndC10YIg0LTQsNC90L3Ri9GFINC00LvRjyDQv9GA0L7RgdC80L7RgtGA0LAhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YVtkYXRhLmxlbmd0aCAtIDFdLnNhdmVUaW1lSWQgIT09ICR3aW5kb3cubG9jYWxTdG9yYWdlLl9sYXN0U2F2ZUlkICYmIGNvbmZpcm0oJ9Ch0L7RhdGA0LDQvdC40YLRjCDQtNCw0L3QvdGL0LUg0LTQu9GPINC/0YDQvtGB0LzQvtGC0YDQsD8nKSkgdGhpcy5zYXZlRm9yUHJpbnQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcuL3ByaW50Lmh0bWwnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNhdmVEYXRhID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChjb25maXJtKCfQodC+0YXRgNCw0L3QuNGC0Ywg0YLQtdC60YPRidC40LUg0LTQsNC90L3Ri9C1PycpKSB7XHJcbiAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlRGF0YSA9IEpTT04uc3RyaW5naWZ5KHtkYXlzRGF0YTogdGhpcy5kYXlUaW1lc0RhdGEsIHJlc3VsdEZpbmFsOiB0aGlzLnJlc3VsdH0pO1xyXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZWRMaW1pdHMgPSAkd2luZG93LnNlc3Npb25TdG9yYWdlLnNhdmVkTGltaXRzO1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoJ9CU0LDQvdC90YvQtSDRg9GB0L/QtdGI0L3QviDRgdC+0YXRgNCw0L3QtdC90YsnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogc2F2ZU1lbnVUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzYXZlTWVudTtcclxuXHJcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvc2F2ZS1tZW51L3NhdmUtbWVudS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcInNhdmUtbWVudSBncm91cFxcXCI+IDxkaXYgY2xhc3M9XFxcInByaW50LWJ1dHRvbiBncm91cFxcXCIgbmctY2xhc3M9XFxcInsncHJpbnQtYnV0dG9uLWFjdGl2ZSc6ICRjdHJsLmFjdGl2ZX1cXFwiIG5nLWNsaWNrPVxcXCIkY3RybC50b2dnbGUoKVxcXCI+0JTQu9GPINC/0LXRh9Cw0YLQuDwvZGl2PiA8ZGl2IGNsYXNzPVxcXCJzYXZlLWJ1dHRvbiBncm91cFxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNhdmVEYXRhKClcXFwiPtCh0L7RhdGA0LDQvdC40YLRjCDQuNC30LzQtdC90LXQvdC40Y88L2Rpdj4gPGRpdiBjbGFzcz1cXFwicHJpbnQtbWVudSBncm91cFxcXCIgbmctaWY9XFxcIiRjdHJsLmFjdGl2ZVxcXCI+IDxkaXYgY2xhc3M9XFxcInRvLXByaW50XFxcIiBuZy1jbGljaz1cXFwiJGN0cmwucHJldmlldygpXFxcIj7Qn9GA0LXQtNC/0YDQvtGB0LzQvtGC0YA8L2Rpdj4gPGRpdiBjbGFzcz1cXFwicHJpbnQtdG8tbG9jYWxTdG9yYWdlXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2F2ZUZvclByaW50KClcXFwiPtCh0L7RhdGA0LDQvdC40YLRjCDQtNC70Y8g0L/QtdGH0LDRgtC4PC9kaXY+IDxkaXYgY2xhc3M9XFxcImRlbHRlLXByaW50LWxvY2FsU3RvcmFnZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnJlbW92ZVByaW50U2F2ZXMoKVxcXCI+0KPQtNCw0LvQuNGC0Ywg0YHQvtGF0YDQsNC90LXQvdC40Y88L2Rpdj4gPC9kaXY+IDwvZGl2PiA8ZGl2IGNsYXNzPVxcXCJiclxcXCI+PC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcInNhdmUtbWVudS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC9kaWFyeS1tb2R1bGUvc2F2ZS1tZW51L3RlbXBsYXRlL3NhdmUtbWVudS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMTNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHRhYmxlTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3RhYmxlJywgW10pO1xyXG5cclxudGFibGVNb2R1bGVcclxuICAgIC5jb21wb25lbnQoJ3RhYmxlVmlldycsIHJlcXVpcmUoJy4vdGFibGUtdmlldy1jb21wb25lbnQvdGFibGUtdmlldy1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ3RhYmxlQWRkJywgcmVxdWlyZSgnLi9hZGQtdG8tdGFibGUtY29tcG9uZW50L2FkZC10by10YWJsZS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ2Zvb2RUYWJsZScsIHJlcXVpcmUoJy4vdGFibGUtY29tcG9uZW50L3RhYmxlLWNvbXBvbmVudCcpKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdGFibGVNb2R1bGU7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3RhYmxlLW1vZHVsZS9pbmRleC5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHRhYmxlVmlld1RlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS90YWJsZS12aWV3LXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IHRhYmxlVmlldyA9IHtcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGRhdGFTZXJ2aWNlKSB7XHJcbiAgICAgICAgZGF0YVNlcnZpY2UuZ2V0VGFibGVEYXRhKClcclxuICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9vZHNPYmpzID0gZGF0YTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IHRhYmxlVmlld1RlbXBsYXRlXHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0YWJsZVZpZXc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS12aWV3LWNvbXBvbmVudC90YWJsZS12aWV3LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPHRhYmxlLWFkZD48L3RhYmxlLWFkZD4gPGRpdiBjbGFzcz1cXFwidGFibGUtY29udGFpbmVyXFxcIj4gPGZvb2QtdGFibGUgbmctcmVwZWF0PVxcXCJmb29kc09iaiBpbiAkY3RybC5mb29kc09ianNcXFwiIGZvb2RzLW9iaj1cXFwiZm9vZHNPYmpcXFwiPjwvZm9vZC10YWJsZT4gPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcInRhYmxlLXZpZXctdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLXZpZXctY29tcG9uZW50L3RlbXBsYXRlL3RhYmxlLXZpZXctdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDE2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBhZGRUb1RhYmxlVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBhZGRUb1RhYmxlID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiBhZGRUb1RhYmxlVGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYWRkVG9UYWJsZTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvdGFibGUtbW9kdWxlL2FkZC10by10YWJsZS1jb21wb25lbnQvYWRkLXRvLXRhYmxlLWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwiYWRkLXRvLXRhYmxlLWZvcm1cXFwiPiA8aDMgY2xhc3M9XFxcImFkZC1mb3JtLXRpdGxlXFxcIj7QlNC+0LHQsNCy0LjRgtGMINC/0YDQvtC00YPQutGCINCyINGC0LDQsdC70LjRhtGDPC9oMz4gPGZvcm0gY2xhc3M9XFxcInRhYmxlLWZvcm1cXFwiPiA8bGFiZWw+0J3QsNC40LzQtdC90L7QstCw0L3QuNC1OlxcbjxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwiZm9vZC1uYW1lXFxcIi8+PC9sYWJlbD4gPGxhYmVsPtCf0L7RgNGG0LjRjyjQs9GAKTpcXG48aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcInRhYmxlLWZvcm0tcG9ydGlvblxcXCIgc2l6ZT1cXFwiMlxcXCIvPjwvbGFiZWw+IDxsYWJlbD7Qo9Cz0LvQtdCy0L7QtNGLOlxcbjxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwidGFibGUtZm9ybS1jYXJib2h5ZFxcXCIgc2l6ZT1cXFwiMlxcXCIvPjwvbGFiZWw+IDxsYWJlbD7QkdC10LvQutC4OlxcbjxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwidGFibGUtZm9ybS1wcm90XFxcIiBzaXplPVxcXCIyXFxcIi8+PC9sYWJlbD4gPGxhYmVsPtCW0LjRgNGLOlxcbjxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwidGFibGUtZm9ybS1mYXRcXFwiIHNpemU9XFxcIjJcXFwiLz48L2xhYmVsPiA8bGFiZWw+0JrQsNC70L7RgNC40Lg6XFxuPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJ0YWJsZS1mb3JtLWthbFxcXCIgc2l6ZT1cXFwiMlxcXCIvPjwvbGFiZWw+IDxkaXYgY2xhc3M9XFxcImFkZC10by10YWJsZS1idXR0b25cXFwiPis8L2Rpdj4gPC9mb3JtPiA8L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwiYWRkLXRvLXRhYmxlLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMThcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAyKSByZXR1cm4gJyc7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9saW1pdHMtZmlsdGVyLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkaHR0cCwgJHdpbmRvdykge1xyXG4gICAgZnVuY3Rpb24gZ2V0Rm9vZEJhc2UoKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnLi9KU09OZGF0YS9mb29kLmpzb24nKS50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBiYXNlID0ge30sIGtleXMgPSBbXTtcclxuICAgICAgICAgICAgZGF0YS5kYXRhLmZvckVhY2goKG9iaikgPT4ge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIG9iaikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09ICduYW1lJykgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFzZVtrZXldID0gb2JqW2tleV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhiYXNlKS5mb3JFYWNoKChrZXkpID0+IGtleXMucHVzaCh7Zm9vZE5hbWU6IGtleX0pKTtcclxuICAgICAgICAgICAgYmFzZS5rZXlzID0ga2V5cztcclxuICAgICAgICAgICAgcmV0dXJuIGJhc2U7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRGb29kT2JqZWN0cygpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcuL0pTT05kYXRhL2Zvb2QuanNvbicpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0RGF5VGltZXNEYXRhKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy4vSlNPTmRhdGEvZGF5LXRpbWVzLWRhdGEuanNvbicpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0TGltaXRzRGF0YShkaWV0LCBwaGFzZSkge1xyXG4gICAgICAgIGxldCBwYXRoID0gJy4vSlNPTmRhdGEvbGltaXRzLWRhdGEvJyArIGRpZXQgKyAnLXBoYXNlJyArIHBoYXNlICsgJy5qc29uJztcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KHBhdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFRhYmxlRGF0YSgpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcuL0pTT05kYXRhL2Zvb2QuanNvbicpXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGFibGVEYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0YS5kYXRhLmZvckVhY2goKG9iaikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdPYmogPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb29kczogW11cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQgPSAyMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIG9iaikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAnbmFtZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld09iai50aXRsZSA9IG9iai5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjb3VudCA+PSAyMCApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0aXRsZURhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnY29sb3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAn0J3QsNC40LzQtdC90L7QstCw0L3QuNC1INC/0YDQvtC00YPQutGC0LAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3J0aW9uOiAn0J/QvtGA0YbQuNGPJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyYm9oeWQ6ICfQo9Cz0LvQtdCy0L7QtNGLJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdDogJ9CR0LXQu9C60LgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYXQ6ICfQltC40YDRiycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGthbGw6ICfQmtCw0LvQvtGA0LjQuCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3T2JqLmZvb2RzLnB1c2godGl0bGVEYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZm9vZCA9IHtjbGFzc05hbWU6ICcnLCB2YWx1ZXM6IHt9fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9vZC52YWx1ZXMubmFtZSA9IGtleTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9vZC52YWx1ZXMucG9ydGlvbiA9IG9ialtrZXldWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5jYXJib2h5ZCA9IG9ialtrZXldWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5wcm90ID0gb2JqW2tleV1bMl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvb2QudmFsdWVzLmZhdCA9IG9ialtrZXldWzNdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5rYWxsID0gb2JqW2tleV1bNF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld09iai5mb29kcy5wdXNoKGZvb2QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEYXRhLnB1c2gobmV3T2JqKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB0YWJsZURhdGE7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVEYXRhICYmICFjb25maXJtKCfQl9Cw0LPRgNGD0LfQuNGC0Ywg0YHQvtGF0YDQsNC90LXQvdC40Y8/JykpIHtcclxuICAgICAgICBpZiAoY29uZmlybSgn0KPQtNCw0LvQuNGC0Ywg0LjQvNC10Y7RidC40LXRgdGPINGB0L7RhdGA0LDQvdC10L3QuNGPPycpKSB7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3NhdmVEYXRhJyk7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3NhdmVkTGltaXRzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0Rm9vZEJhc2U6IGdldEZvb2RCYXNlLFxyXG4gICAgICAgIGdldEZvb2RPYmplY3RzOiBnZXRGb29kT2JqZWN0cyxcclxuICAgICAgICBnZXRUYWJsZURhdGE6IGdldFRhYmxlRGF0YSxcclxuICAgICAgICBnZXREYXlUaW1lc0RhdGE6IGdldERheVRpbWVzRGF0YSxcclxuICAgICAgICBnZXRMaW1pdHNEYXRhOiBnZXRMaW1pdHNEYXRhXHJcbiAgICB9O1xyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9kYXRhLXNlcnZpY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YVNlcnZpY2UpIHtcbiAgICB2YXIgZm9vZDtcbiAgICBkYXRhU2VydmljZS5nZXRGb29kQmFzZSgpXG4gICAgICAgIC50aGVuKChkYXRhKSA9PiBmb29kID0gZGF0YSk7XG5cblxuXG4gICAgZnVuY3Rpb24gZm9vZEFkZFZhbGlkYXRpb24obmFtZSwgcG9ydGlvbikge1xuICAgICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfQktCy0LXQtNC40YLQtSDQvdCw0LfQstCw0L3QuNC1INC/0YDQvtC00YPQutGC0LAnKTtcbiAgICAgICAgfSBlbHNlIGlmICghZm9vZFtuYW1lXSkge1xuICAgICAgICAgICAgYWxlcnQoJ9Ci0LDQutC+0LPQviDQv9GA0L7QtNGD0LrRgtCwINC90LXRgiDQsiDQsdCw0LfQtS4g0KHQviDRgdC/0LjRgdC60L7QvCDQv9GA0L7QtNGD0LrRgtC+0LIg0JLRiyDQvNC+0LbQtdGC0LUg0L7Qt9C90LDQutC+0LzQuNGC0YzRgdGPINCyINGA0LDQt9C00LXQu9C1JyArXG4gICAgICAgICAgICAgICAgJ1wi0KLQsNCx0LvQuNGG0YtcIiwg0LvQuNCx0L4g0LTQvtCx0LDQstC40YLRjCDRgdCy0L7QuSDQv9GA0L7QtNGD0LrRgicpO1xuICAgICAgICB9IGVsc2UgaWYgKCFwb3J0aW9uKSB7XG4gICAgICAgICAgICBhbGVydCgn0JLQstC10LTQuNGC0LUg0L/QvtGA0YbQuNGOINCyINCz0YDQsNC80LzQsNGFJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNOYU4oK3BvcnRpb24pKSB7XG4gICAgICAgICAgICBhbGVydCgn0JIg0L/QvtC70LUgXCLQn9C+0YDRhtC40Y9cIiDQstCy0LXQtNC40YLQtSDRh9C40YHQu9C+Jyk7XG4gICAgICAgIH1lbHNlIGlmIChwb3J0aW9uIDw9IDApIHtcbiAgICAgICAgICAgIGFsZXJ0KCfQktCy0LXQtNC40YLQtSDRh9C40YHQu9C+INCx0L7Qu9GM0YjQtSDRh9C10LwgMCcpXG4gICAgICAgIH0gZWxzZSB7IHJldHVybiB0cnVlfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZhbGlkYXRlTGltaXRzQ2hvb3NlKGRpZXQxLCBkaWV0MiwgcGhhc2VDbGFzcykge1xuICAgICAgICBpZiggKGRpZXQxIHx8IGRpZXQyKSAmJiBwaGFzZUNsYXNzICE9PSAnc3RhcnQnKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBmb29kQWRkVmFsaWRhdGlvbjogZm9vZEFkZFZhbGlkYXRpb24sXG4gICAgICAgIHZhbGlkYXRlTGltaXRzQ2hvb3NlOiB2YWxpZGF0ZUxpbWl0c0Nob29zZVxuICAgIH1cbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3NlcnZpY2VzL3ZhbGlkYXRpb24tc2VydmljZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YVNlcnZpY2UpIHtcclxuICAgIHZhciBmb29kO1xyXG4gICAgZGF0YVNlcnZpY2UuZ2V0Rm9vZEJhc2UoKVxyXG4gICAgICAgIC50aGVuKChkYXRhKSA9PiBmb29kID0gZGF0YSk7XHJcblxyXG4gICAgZnVuY3Rpb24gY2FsY3VsYXRlVmFsdWVzKGZvb2ROYW1lLCBwb3J0aW9uKSB7XHJcbiAgICAgICAgbGV0IHZhbHVlcyA9IGZvb2RbZm9vZE5hbWVdO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5hbWU6IGZvb2ROYW1lLFxyXG4gICAgICAgICAgICBwb3J0aW9uOiBwb3J0aW9uLFxyXG4gICAgICAgICAgICBjYXJib2h5ZDogTWF0aC5yb3VuZCh2YWx1ZXNbMV0vdmFsdWVzWzBdKnBvcnRpb24pLFxyXG4gICAgICAgICAgICBwcm90OiBNYXRoLnJvdW5kKHZhbHVlc1syXS92YWx1ZXNbMF0qcG9ydGlvbiksXHJcbiAgICAgICAgICAgIGZhdDogTWF0aC5yb3VuZCh2YWx1ZXNbM10vdmFsdWVzWzBdKnBvcnRpb24pLFxyXG4gICAgICAgICAgICBrYWxsOiBNYXRoLnJvdW5kKHZhbHVlc1s0XS92YWx1ZXNbMF0qcG9ydGlvbilcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjYWxjdWxhdGVWYWx1ZXM6IGNhbGN1bGF0ZVZhbHVlc1xyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9jYWxjdWxhdGlvbi1zZXJ2aWNlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhU2VydmljZSkge1xyXG4gICAgdmFyIGxpbWl0c0RhdGEgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBzZXRMaW1pdHMoZGlldCwgcGhhc2UpIHtcclxuICAgICAgICBkYXRhU2VydmljZS5nZXRMaW1pdHNEYXRhKGRpZXQsIHBoYXNlKVxyXG4gICAgICAgICAgICAudGhlbigoZGF0YSkgPT4gbGltaXRzRGF0YS5saW1pdHMgPSBkYXRhLmRhdGEpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsaW1pdHNEYXRhOiBsaW1pdHNEYXRhLFxyXG4gICAgICAgIHNldExpbWl0czogc2V0TGltaXRzXHJcbiAgICB9XHJcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3NlcnZpY2VzL2xpbWl0cy1zZXJ2aWNlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgdGFibGVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvdGFibGUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgdGFibGUgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGZvb2RzT2JqOiAnPCdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGNvbnNvbGUubG9nKHRoaXMuZm9vZHNPYmopLCAxMDAwMClcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogdGFibGVUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0YWJsZTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLWNvbXBvbmVudC90YWJsZS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjx0YWJsZSBjbGFzcz1cXFwidGJcXFwiPiA8Y2FwdGlvbiBjbGFzcz1cXFwidGItdGl0bGVcXFwiPnt7ICRjdHJsLmZvb2RzT2JqLnRpdGxlIH19PC9jYXB0aW9uPiA8dHIgbmctcmVwZWF0PVxcXCJmb29kIGluICRjdHJsLmZvb2RzT2JqLmZvb2RzXFxcIj4gPHRkIGNsYXNzPVxcXCJ0ZC1uYW1lIG5hbWUtY29sb3JcXFwiIG5nLWNsYXNzPVxcXCJmb29kLmNsYXNzTmFtZVxcXCI+e3sgZm9vZC52YWx1ZXMubmFtZSB9fTwvdGQ+IDx0ZCBjbGFzcz1cXFwicG9ydGlvbi1jb2xvclxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj57eyBmb29kLnZhbHVlcy5wb3J0aW9uIH19PC90ZD4gPHRkIGNsYXNzPVxcXCJjYXJib2h5ZC1jb2xvclxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj57eyBmb29kLnZhbHVlcy5jYXJib2h5ZCB9fTwvdGQ+IDx0ZCBjbGFzcz1cXFwicHJvdC1jb2xvclxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj57eyBmb29kLnZhbHVlcy5wcm90IH19PC90ZD4gPHRkIGNsYXNzPVxcXCJmYXQtY29sb3JcXFwiIG5nLWNsYXNzPVxcXCJmb29kLmNsYXNzTmFtZVxcXCI+e3sgZm9vZC52YWx1ZXMuZmF0IH19PC90ZD4gPHRkIGNsYXNzPVxcXCJrYWxsLWNvbG9yXFxcIiBuZy1jbGFzcz1cXFwiZm9vZC5jbGFzc05hbWVcXFwiPnt7IGZvb2QudmFsdWVzLmthbGwgfX08L3RkPiA8L3RyPiA8L3RhYmxlPlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJ0YWJsZS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC90YWJsZS1tb2R1bGUvdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL3RhYmxlLXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAyNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FDdENBOzs7Ozs7QUNBQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTUE7Ozs7Ozs7Ozs7Ozs7OztBQ0xBO0FBQ0E7OztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWEE7QUFhQTtBQUNBOztBQWRBO0FBaUJBO0FBQ0E7QUFDQTtBQUNBOztBQXBCQTtBQUNBO0FBeUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBRkE7QUFPQTtBQVBBO0FBREE7QUFDQTtBQVdBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUZBO0FBQUE7QUFEQTtBQUNBO0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUlBO0FBREE7QUFJQTtBQUpBO0FBSkE7QUFEQTtBQUNBO0FBYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFEQTtBQUNBO0FBUUE7QUFDQTtBQUNBO0FBREE7QUFEQTtBQUNBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFEQTtBQUdBO0FBQ0E7QUFEQTtBQUhBO0FBQ0E7QUFPQTtBQVpBO0FBREE7QUFDQTs7QUFyRUE7QUF1RkE7QUFDQTtBQUNBO0FBSEE7QUFDQTs7QUF2RkE7QUE4RkE7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBREE7QUFJQTtBQUpBO0FBQ0E7QUFNQTtBQUNBO0FBREE7QUFJQTtBQUpBO0FBUkE7QUFDQTtBQWVBO0FBQ0E7QUFDQTtBQURBO0FBREE7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBTkE7QUFDQTtBQVFBOztBQUVBO0FBRUE7QUFEQTtBQUhBO0FBQ0E7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSEE7QUFRQTtBQVJBO0FBVUE7QUFaQTtBQUNBO0FBY0E7QUFDQTs7O0FBREE7QUFLQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFEQTtBQUtBO0FBTEE7QUFPQTtBQW5CQTtBQUNBO0FBcUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtB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R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdBO0FBSkE7QUFNQTtBQVRBO0FBM0NBO0FBdHZCQTs7Ozs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTUE7Ozs7OztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQVJBO0FBQ0E7QUFXQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUxBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUxBO0FBQ0E7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBL0NBO0FBc0RBO0FBdkRBO0FBQ0E7QUF5REE7Ozs7OztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBS0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFSQTtBQUNBO0FBZ0JBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEE7QUFDQTtBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFQQTtBQUNBO0FBU0E7QUFDQTtBQURBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQURBO0FBTUE7QUFDQTtBQUNBO0FBRkE7QUFOQTtBQUZBO0FBckVBO0FBb0ZBO0FB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