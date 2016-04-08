var bundle =
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
	var mainModule = __webpack_require__(3);
	var diaryModule = __webpack_require__(14);
	var tableModule = __webpack_require__(25);

	var app = angular.module('app', ['main', 'diary', 'table', 'ngAnimate', 'angucomplete-alt']);

	app.filter('limit', __webpack_require__(34));
	app.factory('dataService', __webpack_require__(35)).factory('validationService', __webpack_require__(36)).factory('calculationService', __webpack_require__(37)).factory('limitsService', __webpack_require__(38)).factory('indexService', __webpack_require__(39)).factory('activeClassService', __webpack_require__(40)).factory('dietChoose', __webpack_require__(41)).factory('modal', __webpack_require__(42));

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

	var main = angular.module('main', ['ui.router']);

	main.component('leftSideMenu', __webpack_require__(4)).component('daytimeChoose', __webpack_require__(6)).component('home', __webpack_require__(8)).component('view', __webpack_require__(10)).component('modal', __webpack_require__(12));

	main.config(function ($stateProvider, $urlRouterProvider) {
	    $stateProvider.state('home', {
	        url: '/home',
	        template: '<home></home>'
	    }).state('diary', {
	        url: '/diary/:daytime',
	        template: '<day-time base="$ctrl.base" daytimes="$ctrl.viewData.dayTimes" add="$ctrl.addFood(dayTimeId, food)" remove="$ctrl.removeFood(dayTimeId, food)" day-time-limits="$ctrl.viewData.limitsData"></day-time>'
	    }).state('settings', {
	        url: '/settings',
	        template: '<menu></menu>'
	    }).state('result', {
	        url: '/result',
	        template: '<result result="$ctrl.viewData.resultFinal"></result>'
	    }).state('tables', {
	        url: '/tables',
	        template: '<tables foods-objs="$ctrl.viewData.tablesData.foodsObjs" my-foods="$ctrl.viewData.tablesData.myFoods" remove-my-food="$ctrl.removeMyFood(name)"></tables>'
	    }).state('add-food', {
	        url: '/add-food',
	        template: '<table-add my-foods="$ctrl.viewData.tablesData.myFoods" remove-my-food="$ctrl.removeMyFood(name)" add-my-food="$ctrl.addMyFood(name, values)"></table-add>'
	    }).state('save', {
	        url: '/save',
	        template: '<save-menu day-times-data="$ctrl.viewData.dayTimes" result="$ctrl.viewData.resultFinal"></save-menu>'
	    });

	    $urlRouterProvider.otherwise('home');
	});

	main.run(function ($rootScope, activeClassService, $state, $stateParams) {
	    $rootScope.$on('$stateChangeSuccess', function () {
	        var className = $state.current.name === 'diary' ? $stateParams.daytime : $state.current.name;
	        activeClassService.setClassName(className);
	    });
	});

		module.exports = main;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var leftSideMenuTemplate = __webpack_require__(5);

	var leftSideMenu = {
	    controller: function controller($state, activeClassService, modal) {
	        var _this = this;

	        this.activeClass = activeClassService.getClassName;

	        this.menuItems = [{ className: 'home', tooltip: 'На главную', tooltipShow: false }, { className: 'settings', tooltip: 'Настройки', tooltipShow: false }, { className: 'result', tooltip: 'Итог дня', tooltipShow: false }, { className: 'save', tooltip: 'Сохранить', tooltipShow: false }, { className: 'tables', tooltip: 'Таблицы', tooltipShow: false }, { className: 'add-food', tooltip: 'Добавить еду в таблицу', tooltipShow: false }];

	        this.toggle = function (item) {
	            if (item.className === this.activeClass) return;
	            item.tooltipShow = !item.tooltipShow;
	        };

	        this.setState = function (className) {
	            $state.go(className);
	        };

	        (function () {
	            var numb = Math.ceil(Math.random() * 3);
	            _this.backIconClassName = 'icon' + numb;
	        })();
	    },
	    template: leftSideMenuTemplate
	};

		module.exports = leftSideMenu;

/***/ },
/* 5 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"left-side-menu\">\r\n    <div class=\"to-another-design\" ng-class=\"$ctrl.backIconClassName\"><a href=\"../first-design/\" id=\"go\"></a></div>\r\n\r\n    <div class=\"menu-items\">\r\n        <div class=\"menu-item\" ng-repeat=\"item in $ctrl.menuItems\" ng-class=\"[item.className, $ctrl.activeClass()]\" ng-click=\"$ctrl.setState(item.className)\" ng-mouseenter=\"$ctrl.toggle(item)\" ng-mouseleave=\"$ctrl.toggle(item)\">\r\n            <div class=\"tooltip\" ng-if=\"item.tooltipShow\">{{item.tooltip}}</div>\r\n        </div>\r\n    </div>\r\n\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("left-side-menu-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var daytimeChooseTemplate = __webpack_require__(7);

	var daytimeChoose = {
	    controller: function controller($state, activeClassService) {
	        this.daytimes = [{ time: 'Завтрак', className: 'breakfast', state: 'breakfast' }, { time: 'Перекус 1', className: false, state: 'first-snack' }, { time: 'Обед', className: false, state: 'dinner' }, { time: 'Перекус 2', className: false, state: 'second-snack' }, { time: 'Ужин', className: false, state: 'evening-meal' }];

	        this.activeClass = activeClassService.getClassName;

	        this.setState = function (daytime) {
	            $state.go('diary', { daytime: daytime.state });
	        };
	    },
	    template: daytimeChooseTemplate
	};

		module.exports = daytimeChoose;

/***/ },
/* 7 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"daytime-choose\">\r\n    <div class=\"daytime\" ng-repeat=\"daytime in $ctrl.daytimes\" ng-click=\"$ctrl.setState(daytime)\" ng-class=\"[$ctrl.activeClass(), daytime.state]\">{{ daytime.time }}</div>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("daytime-choose-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var homePageTemplate = __webpack_require__(9);

	var homePage = {
	    controller: function controller($timeout) {
	        var _this = this;

	        this.classDaytime = false;
	        this.classMenu = false;

	        $timeout(function () {
	            return _this.classDaytime = true;
	        }, 0);
	        $timeout(function () {
	            return _this.classMenu = true;
	        }, 1000);
	    },
	    template: homePageTemplate
	};

		module.exports = homePage;

/***/ },
/* 9 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"home-page\">\r\n    <div class=\"daytime-select-tooltip\" ng-class=\"{'active': $ctrl.classDaytime}\">Выберете время дня,\r\n        чтобы приступить к заполнению дневника</div>\r\n    <div class=\"home-header\">\r\n        <div class=\"left-line\"></div>\r\n        <div class=\"right-line\"></div>\r\n        <h2 ng-click=\"$ctrl.toggle()\">Дневник питания</h2>\r\n    </div>\r\n\r\n    <div class=\"menu-select-tooltip\" ng-class=\"{'active': $ctrl.classMenu}\">Чтобы установить лимиты,\r\n        сохранить данные, добавить еду либо\r\n        просмотреть итог и таблицы воспользуйтесь меню</div>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("home-page-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var viewTemplate = __webpack_require__(11);

	var view = {
	    controller: function controller(dataService, limitsService, $window, modal, dietChoose) {
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

	        this.base = dataService.base;
	        this.viewData = {
	            limitsData: limitsService.limitsData,
	            tablesData: {},
	            resultFinal: {
	                carbohyd: { name: 'Угдеводы', value: 0 },
	                prot: { name: 'Протеины', value: 0 },
	                fat: { name: 'Жиры', value: 0 },
	                kall: { name: 'Калории', value: 0 }
	            }
	        };

	        dataService.getTableData().then(function (data) {
	            _this.viewData.tablesData.foodsObjs = data;
	        });
	        dataService.getDayTimesData().then(function (data) {
	            return _this.viewData.dayTimes = data.data;
	        });

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

	        this.calcResult = function (dayTimeId, food, bool) {
	            var result = this.viewData.dayTimes[dayTimeId].result;
	            if (bool) {
	                for (var key in result) {
	                    result[key] += food[key];
	                    this.viewData.resultFinal[key].value += food[key];
	                }
	            } else {
	                for (var _key in result) {
	                    result[_key] -= food[_key];
	                    this.viewData.resultFinal[_key].value -= food[_key];
	                }
	            }
	        };

	        this.removeMyFood = function (name) {

	            delete this.viewData.tablesData.myFoods[name];
	            $window.localStorage.myFoods = JSON.stringify(this.viewData.tablesData.myFoods);

	            dataService.removeFromBase(name);
	        };

	        this.addMyFood = function (name, values) {
	            debugger;
	            if (!this.viewData.tablesData.myFoods) this.viewData.tablesData.myFoods = {};
	            if (this.viewData.tablesData.myFoods[name]) {
	                if (!confirm('Перезаписать существующий продукт?')) return;
	                dataService.removeFromBase(name);
	            }
	            this.viewData.tablesData.myFoods[name] = values;
	            $window.localStorage.myFoods = JSON.stringify(this.viewData.tablesData.myFoods);

	            dataService.addToBase(name, values);
	        };

	        //LS

	        if ($window.localStorage.myFoods) this.viewData.tablesData.myFoods = JSON.parse($window.localStorage.myFoods);

	        if ($window.localStorage.saveData) {
	            modal.open({ title: 'Загрузка', message: 'Загрузить сохраненные данные?' }, 'confirm').then(function () {
	                var data = JSON.parse($window.localStorage.saveData);
	                _this.viewData.dayTimes = data.daysData;
	                _this.viewData.resultFinal = data.resultFinal;

	                dietChoose.loadLimits();
	            }, function () {
	                modal.open({ title: 'Загрузка', message: 'Удалить сохраненные данные?' }, 'confirm').then(function () {
	                    $window.localStorage.removeItem('saveData');
	                    $window.localStorage.removeItem('savedLimits');
	                });
	            });
	        }
	    },
	    template: viewTemplate
	};

		module.exports = view;

/***/ },
/* 11 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<left-side-menu></left-side-menu>\r\n<daytime-choose></daytime-choose>\r\n\r\n<div class=\"main-view\" ui-view></div>\r\n\r\n<modal></modal>";
	ngModule.run(["$templateCache",function(c){c.put("view-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var modalTemplate = __webpack_require__(13);

	var modal = {
	    controller: function controller(modal) {
	        this.modalViewData = modal.modalViewData;
	        this.checkOpen = function () {
	            return modal.getState() === 'open';
	        };
	        this.checkType = function (type) {
	            return modal.getType() === type;
	        };
	        this.type = modal.getType;

	        this.close = modal.close;

	        this.stopPropagation = function (event) {
	            event.stopImmediatePropagation();
	        };
	    },
	    template: modalTemplate
	};

		module.exports = modal;

/***/ },
/* 13 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"modal-background\" ng-if=\"$ctrl.checkOpen()\">\r\n    <div class=\"window an\" ng-if=\"$ctrl.checkOpen()\">\r\n        <div class=\"title\">{{ $ctrl.modalViewData.data.title }}</div>\r\n        <div class=\"message\">{{ $ctrl.modalViewData.data.message }}</div>\r\n        <div class=\"buttons group\">\r\n            <div class=\"confirm\" ng-if=\"$ctrl.checkType('confirm')\">\r\n                <div class=\"reject\" ng-click=\"$ctrl.close()\">Отмена</div>\r\n                <div class=\"ok\" ng-click=\"$ctrl.close(true)\">OK</div>\r\n            </div>\r\n            <div class=\"alert\" ng-if=\"$ctrl.checkType('alert')\" ng-click=\"$ctrl.close()\">Закрыть</div>\r\n        </div>\r\n        <div class=\"close\" ng-click=\"$ctrl.close()\">x</div>\r\n    </div>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("modal-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var diaryModule = angular.module('diary', []);

	diaryModule.component('menu', __webpack_require__(15)).component('dayTime', __webpack_require__(17)).component('food', __webpack_require__(19)).component('saveMenu', __webpack_require__(21)).component('result', __webpack_require__(23));

		module.exports = diaryModule;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var menuTemplate = __webpack_require__(16);

	var menu = {
	    controller: function controller($window, dietChoose) {
	        this.diets = dietChoose.diets;
	        this.setDiet = dietChoose.setDiet;

	        this.className = dietChoose.className;
	        this.setClassName = dietChoose.setClassName;

	        this.setLimits = dietChoose.setLimits;
	        this.resetChoose = dietChoose.resetChoose;
	    },
	    template: menuTemplate
	};

		module.exports = menu;

/***/ },
/* 16 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div id=\"menu\">\r\n    <div class=\"diet-menu\">\r\n        <div class=\"diet-tittle\">Вид диеты:</div>\r\n        <div class=\"diet-choose\">\r\n            <span class=\"diet\" ng-class=\"{active: $ctrl.diets.proteins}\" ng-click=\"$ctrl.setDiet('proteins')\">Высокопротеиновая комбинация замен</span>\r\n            <br>\r\n            <span class=\"diet\" ng-class=\"{active: $ctrl.diets.carbohydrates}\" ng-click=\"$ctrl.setDiet('carbohydrates')\">Высокоуглеводная комбинация замен</span>\r\n        </div>\r\n    </div>\r\n    <div class=\"phase-menu\">\r\n        <div class=\"phase-tittle\">Выберете Вашу фазу:</div>\r\n        <div class=\"phase-choose\">\r\n\r\n            <div ng-class=\"$ctrl.className.name\" class=\"first-phase\" ng-click=\"$ctrl.setClassName(1)\"><span>-</span> 1 <span>-</span></div>\r\n            <div ng-class=\"$ctrl.className.name\" class=\"second-phase\" ng-click=\"$ctrl.setClassName(2)\"><span>-</span> 2 <span>-</span></div>\r\n            <div ng-class=\"$ctrl.className.name\" class=\"third-phase\" ng-click=\"$ctrl.setClassName(3)\"><span>-</span> 3 <span>-</span></div>\r\n\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"clear-limits\" ng-click=\"$ctrl.resetChoose()\">Сбросить лимиты</div>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("menu-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var dayTimeTemplate = __webpack_require__(18);

	var dayTime = {
	    bindings: {
	        base: '<',
	        daytimes: '<',
	        add: '&',
	        remove: '&',
	        dayTimeLimits: '<'
	    },
	    controller: function controller(dataService, validationService, calculationService, $scope, $stateParams, indexService) {
	        var daytime = $stateParams.daytime;
	        this.index = indexService(daytime);

	        var text = '';
	        this.onInput = function (str) {
	            text = str;
	        };

	        this.limits = function () {
	            if (this.dayTimeLimits.limits) return this.dayTimeLimits.limits[this.daytimes[this.index].dayTime];
	        };

	        this.compare = function (key) {
	            if (!this.limits()) return;
	            if (this.limits()[key] < this.daytimes[this.index].result[key]) return true;
	        };

	        this.removeFood = function (food) {
	            this.remove({ dayTimeId: this.index, food: food });
	        };

	        this.addFood = function () {
	            var portion = Math.round(+this.portion);
	            var name = this.foodName ? this.foodName.title : text;

	            //Проверить поля ввода, вычислить значения
	            if (!validationService.foodAddValidation(name, portion)) return;
	            var food = calculationService.calculateValues(name, portion);

	            //Добавить в массив
	            this.add({ dayTimeId: this.daytimes[this.index].id, food: food });

	            //Очистить поля ввода
	            $scope.$broadcast('angucomplete-alt:clearInput');
	            this.portion = '';
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
/* 18 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"day-time\">\r\n    <div class=\"input\">\r\n        <form>\r\n            <label>Наименование: <angucomplete-alt ng-keypress=\"$ctrl.enter($event)\" id=\"ex1\" placeholder=\"Введите продукт\" pause=\"100\" selected-object=\"$ctrl.foodName\" local-data=\"$ctrl.base.foods.keys\" search-fields=\"foodName\" title-field=\"foodName\" minlength=\"1\" input-changed=\"$ctrl.onInput\" input-class=\"food form-control-small\" match-class=\"highlight\"></angucomplete-alt></label>\r\n            <br>\r\n\r\n            <label>Порция(гр): <input type=\"text\" class=\"portion-input\" size=\"2\" ng-model=\"$ctrl.portion\" ng-keypress=\"$ctrl.enter($event)\"/></label>\r\n        </form>\r\n        <div class=\"add-button\" ng-click=\"$ctrl.addFood()\">+</div>\r\n    </div>\r\n\r\n    <div class=\"table-border\">\r\n        <div class=\"table\">\r\n            <div class=\"table-tittle\">\r\n                <span class=\"name\">Наименование продукта</span>\r\n                <span class=\"portion\">Порция (гр)</span>\r\n                <span class=\"carbohyd\">Углеводы</span>\r\n                <span class=\"prot\">Белки</span>\r\n                <span class=\"fat\">Жиры</span>\r\n                <span class=\"kall\">Калории</span>\r\n            </div>\r\n\r\n\r\n            <food ng-repeat=\"food in $ctrl.daytimes[$ctrl.index].foods\" food=\"food\" remove=\"$ctrl.removeFood(food)\"></food>\r\n\r\n\r\n            <div class=\"summary\">\r\n                <span class=\"name\">Подытог</span>\r\n                <span class=\"portion\">---</span>\r\n                <span class=\"carbohyd\" ng-class=\"{'active-limit': $ctrl.compare('carbohyd')}\">{{ $ctrl.daytimes[$ctrl.index].result.carbohyd }} {{'(' + $ctrl.limits().carbohyd + ')' | limit }}</span>\r\n                <span class=\"prot\" ng-class=\"{'active-limit': $ctrl.compare('prot')}\">{{ $ctrl.daytimes[$ctrl.index].result.prot }} {{'(' + $ctrl.limits().prot + ')' | limit }}</span>\r\n                <span class=\"fat\" ng-class=\"{'active-limit': $ctrl.compare('fat')}\">{{ $ctrl.daytimes[$ctrl.index].result.fat }} {{'(' + $ctrl.limits().fat + ')' | limit }}</span>\r\n                <span class=\"kall\" ng-class=\"{'active-limit': $ctrl.compare('kall')}\">{{ $ctrl.daytimes[$ctrl.index].result.kall }} {{'(' + $ctrl.limits().kall + ')' | limit }}</span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n</div>\r\n\r\n\r\n<div class=\"br\"></div>";
	ngModule.run(["$templateCache",function(c){c.put("day-time-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var foodTemplate = __webpack_require__(20);

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
/* 20 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"food\" ng-class=\"$ctrl.checkEmptyFood($ctrl.food)\">\r\n    <span class=\"name\">{{ $ctrl.food.name }}</span>\r\n    <span class=\"portion\">{{ $ctrl.food.portion }}</span>\r\n    <span class=\"carbohyd\">{{ $ctrl.food.carbohyd }}</span>\r\n    <span class=\"prot\">{{ $ctrl.food.prot }}</span>\r\n    <span class=\"fat\">{{ $ctrl.food.fat }}</span>\r\n    <span class=\"kall\">{{ $ctrl.food.kall }}</span>\r\n    <div class=\"remove-food\" ng-click=\"$ctrl.remove({food: $ctrl.food})\"></div>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("food-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var saveMenuTemplate = __webpack_require__(22);

	var saveMenu = {
	    bindings: {
	        dayTimesData: '<',
	        result: '<'
	    },
	    controller: function controller($window, modal) {

	        this.saveForPrint = function () {
	            var _this = this;

	            var data = $window.localStorage.daysData ? JSON.parse($window.localStorage.daysData) : [];
	            //Проверки
	            if (data.length > 0 && new Date(data[data.length - 1].saveTime).getDay() === new Date().getDay()) {
	                if (data[data.length - 1].saveTimeId === $window.localStorage._lastSaveId) {
	                    modal.open({ title: 'Ошибка сохранения', message: 'Нет новых данных для сохранения' }, 'alert');
	                    return;
	                }
	                return modal.open({ title: 'Подтвердите', message: 'Перезаписать данные печати текушего дня?' }, 'confirm').then(function () {
	                    data.pop();

	                    //Сохранение
	                    var date = new Date();
	                    var id = (Math.random() + '').slice(2);
	                    var dayData = { saveTime: date, dayTimes: _this.dayTimesData, result: _this.result, saveTimeId: id };
	                    data.push(dayData);
	                    $window.localStorage.daysData = JSON.stringify(data);
	                    $window.localStorage._lastSaveId = id;

	                    modal.open({ title: 'Сохранение данных', message: 'Данные успешно сохранены' }, 'alert');
	                });
	            } else {
	                //Сохранение
	                var date = new Date();
	                var id = (Math.random() + '').slice(2);
	                var dayData = { saveTime: date, dayTimes: this.dayTimesData, result: this.result, saveTimeId: id };
	                data.push(dayData);
	                $window.localStorage.daysData = JSON.stringify(data);
	                $window.localStorage._lastSaveId = id;
	                modal.open({ title: 'Сохранение данных', message: 'Данные успешно сохранены' }, 'alert');
	            }
	        };

	        this.removePrintSaves = function () {
	            if ($window.localStorage.daysData) {
	                modal.open({ title: 'Удаление', message: 'Удалить сохранения для печати?' }, 'confirm').then(function () {
	                    $window.localStorage.removeItem('daysData');
	                    $window.localStorage.removeItem('_lastSaveId');
	                });
	            }
	        };

	        this.preview = function () {
	            var _this2 = this;

	            var data = $window.localStorage.daysData;
	            if (!data) {
	                modal.open({ title: 'Сохранение', message: 'Сохранить текущие данные для просмотра?' }, 'confirm').then(function () {
	                    _this2.saveForPrint();
	                    $window.open('./print.html');
	                }, function () {
	                    modal.open({ title: 'Ошибка предпросмотра', message: 'Нет данных для просмотра!' }, 'alert');
	                });
	            } else {
	                data = JSON.parse(data);
	                if (data[data.length - 1].saveTimeId !== $window.localStorage._lastSaveId) {
	                    modal.open({ title: 'Сохранение', message: 'Сохранить текущие данные для просмотра?' }, 'confirm').then(function () {
	                        _this2.saveForPrint().then(function () {
	                            return $window.open('./print.html');
	                        }, function () {
	                            return $window.open('./print.html');
	                        });
	                    }, function () {
	                        return $window.open('./print.html');
	                    });
	                } else {
	                    $window.open('./print.html');
	                }
	            }
	        };

	        this.saveData = function () {
	            var _this3 = this;

	            modal.open({ title: 'Сохранение', message: 'Сохранить текущие данные?' }, 'confirm').then(function () {
	                $window.localStorage.saveData = JSON.stringify({ daysData: _this3.dayTimesData, resultFinal: _this3.result });
	                if ($window.sessionStorage.savedLimits) {
	                    $window.localStorage.savedLimits = $window.sessionStorage.savedLimits;
	                } else if (!$window.sessionStorage.savedLimits && $window.localStorage.savedLimits) {
	                    $window.localStorage.removeItem('savedLimits');
	                }
	                modal.open({ title: 'Сохранение данных', message: 'Данные успешно сохранены' }, 'alert');
	            });
	        };

	        this.removeData = function () {
	            if ($window.localStorage.saveData) {
	                modal.open({ title: 'Удаление', message: 'Удалить сохраненные данные?' }, 'confirm').then(function () {
	                    $window.localStorage.removeItem('saveData');
	                    $window.localStorage.removeItem('savedLimits');
	                    modal.open({ title: 'Удаление', message: 'Данные успешно удалены' }, 'alert');
	                });
	            } else {
	                modal.open({ title: 'Ошибка', message: 'Нет сохраненных данных' }, 'alert');
	            }
	        };
	    },
	    template: saveMenuTemplate
	};

		module.exports = saveMenu;

/***/ },
/* 22 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"save-menu\">\r\n    <div class=\"title\">Управление данными</div>\r\n\r\n    <div>\r\n        <div class=\"button save-button\" ng-click=\"$ctrl.saveData()\">Сохранить изменения</div>\r\n        <div class=\"button remove-data\" ng-click=\"$ctrl.removeData()\">Удалить сохранения</div>\r\n    </div>\r\n\r\n    <div class=\"title\">Для печати</div>\r\n\r\n    <div class=\"print-menu\">\r\n        <div class=\"button to-print\" ng-click=\"$ctrl.preview()\">Предпросмотр</div>\r\n        <div class=\"button print-to-localStorage\" ng-click=\"$ctrl.saveForPrint()\">Сохранить для печати</div>\r\n        <div class=\"button remove-print-localStorage\" ng-click=\"$ctrl.removePrintSaves()\">Удалить сохранения</div>\r\n    </div>\r\n</div>\r\n\r\n\r\n<div class=\"br\"></div>";
	ngModule.run(["$templateCache",function(c){c.put("save-menu-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var resultTemplate = __webpack_require__(24);

	var result = {
	    bindings: {
	        result: '<'
	    },
	    controller: function controller(limitsService) {
	        this.limitsData = limitsService.limitsData;

	        this.calcPercent = function (value, limit) {
	            if (!value) return '0%';
	            return (value / (limit / 100)).toFixed() + '%';
	        };

	        this.calcGraph = function (value, limit) {
	            if (!value) return;
	            var percent = (value / (limit / 100)).toFixed();
	            var color = percent > 100 ? 'rgba(202, 22, 41, 0.2)' : 'rgba(27, 201, 142, 0.1)';
	            if (percent > 100) percent = 100;

	            return {
	                'background-color': color,
	                'width': percent + '%'
	            };
	        };
	    },
	    template: resultTemplate
	};

		module.exports = result;

/***/ },
/* 24 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"result\">\r\n    <div class=\"result-title\">Итог дня</div>\r\n\r\n    <div class=\"result-table\" ng-repeat=\"(key, element) in $ctrl.result\">\r\n        <div class=\"title\" ng-class=\"{}\">\r\n            {{element.name}} <span ng-if=\"!!$ctrl.limitsData.limits\">(max {{$ctrl.limitsData.limits['Итог'][key]}})</span>\r\n        </div>\r\n        <div class=\"value\" ng-class=\"{'limits': !!$ctrl.limitsData.limits}\">\r\n            {{element.value}}\r\n            <span ng-if=\"!!$ctrl.limitsData.limits\">{{ $ctrl.calcPercent(element.value, $ctrl.limitsData.limits['Итог'][key]) }}</span>\r\n            <div class=\"graph\" ng-if=\"!!$ctrl.limitsData.limits\" ng-style=\"$ctrl.calcGraph(element.value, $ctrl.limitsData.limits['Итог'][key])\"></div>\r\n        </div>\r\n    </div>\r\n\r\n\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("result-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var tableModule = angular.module('table', []);

	tableModule.component('tableAdd', __webpack_require__(26)).component('foodTable', __webpack_require__(28)).component('storageTable', __webpack_require__(30)).component('tables', __webpack_require__(32));

		module.exports = tableModule;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var addToTableTemplate = __webpack_require__(27);

	var addToTable = {
	    bindings: {
	        myFoods: '<',
	        removeMyFood: '&',
	        addMyFood: '&'
	    },
	    controller: function controller(validationService) {
	        console.log('test');
	        this.values = [0, 0, 0, 0, 0];

	        this.add = function (event) {
	            var _this = this;

	            if (event && event.keyCode !== 13) return;

	            this.values.forEach(function (value, index) {
	                _this.values[index] = +value;
	            });
	            if (!validationService.addMyFoodValidation(this.name, this.values)) return;

	            this.addMyFood({ name: this.name, values: this.values });
	            this.values = [0, 0, 0, 0, 0];
	            this.name = '';
	        };

	        this.remove = function (name) {
	            this.removeMyFood({ name: name });
	        };
	    },
	    template: addToTableTemplate
	};

		module.exports = addToTable;

/***/ },
/* 27 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"add-to-table-form\">\r\n    <h3 class=\"add-form-title\">Добавить продукт в таблицу</h3>\r\n    <form class=\"table-form\">\r\n        <table>\r\n            <tr><td><label for=\"food-name\">Наименование:</label></td><td><input type=\"text\" id=\"food-name\" ng-model=\"$ctrl.name\" ng-keydown=\"$ctrl.add($event)\"/></td></tr>\r\n            <tr><td><label for=\"table-form-portion\">Порция(гр):</label></td><td><input type=\"text\" id=\"table-form-portion\" size=\"2\" ng-model=\"$ctrl.values[0]\" ng-keydown=\"$ctrl.add($event)\"/></td></tr>\r\n            <tr><td><label for=\"table-form-carbohyd\">Углеводы:</label></td><td><input type=\"text\" id=\"table-form-carbohyd\" size=\"2\" ng-model=\"$ctrl.values[1]\" ng-keydown=\"$ctrl.add($event)\"/></td></tr>\r\n            <tr><td><label for=\"table-form-prot\">Белки:</label></td><td><input type=\"text\" id=\"table-form-prot\" size=\"2\" ng-model=\"$ctrl.values[2]\" ng-keydown=\"$ctrl.add($event)\"/></td></tr>\r\n            <tr><td><label for=\"table-form-fat\">Жиры:</label></td><td><input type=\"text\" id=\"table-form-fat\" size=\"2\" ng-model=\"$ctrl.values[3]\" ng-keydown=\"$ctrl.add($event)\"/></td></tr>\r\n            <tr><td><label for=\"table-form-kal\">Калории:</label></td><td><input type=\"text\" id=\"table-form-kal\" size=\"2\" ng-model=\"$ctrl.values[4]\" ng-keydown=\"$ctrl.add($event)\"/></td></tr>\r\n        </table>\r\n\r\n        <div class=\"add-to-table-button\" ng-click=\"$ctrl.add()\">+</div>\r\n    </form>\r\n\r\n</div>\r\n\r\n<div class=\"my-table\">\r\n<storage-table my-foods=\"$ctrl.myFoods\" remove=\"$ctrl.remove(name)\"></storage-table></div>";
	ngModule.run(["$templateCache",function(c){c.put("add-to-table-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var tableTemplate = __webpack_require__(29);

	var table = {
	    bindings: {
	        foodsObj: '<'
	    },
	    controller: function controller() {},
	    template: tableTemplate
	};

		module.exports = table;

/***/ },
/* 29 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<table class=\"tb\">\r\n    <caption class=\"tb-title\">{{ $ctrl.foodsObj.title }}</caption>\r\n    <tr ng-repeat=\"food in $ctrl.foodsObj.foods\" ng-click=\"$ctrl.remove({food: food, obj: $ctrl.foodsObj.foods})\" ng-class=\"food.className\">\r\n        <td class=\"td-name name-color\" ng-class=\"food.className\">{{ food.values.name }}</td>\r\n        <td class=\"portion-color\" ng-class=\"food.className\">{{ food.values.portion }}</td>\r\n        <td class=\"carbohyd-color\" ng-class=\"food.className\">{{ food.values.carbohyd }}</td>\r\n        <td class=\"prot-color\" ng-class=\"food.className\">{{ food.values.prot }}</td>\r\n        <td class=\"fat-color\" ng-class=\"food.className\">{{ food.values.fat }}</td>\r\n        <td class=\"kall-color\" ng-class=\"food.className\">{{ food.values.kall }}</td>\r\n    </tr>\r\n</table>";
	ngModule.run(["$templateCache",function(c){c.put("table-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var storageTableTemplate = __webpack_require__(31);

	var storageTable = {
	    bindings: {
	        myFoods: '<',
	        remove: '&'
	    },
	    controller: function controller() {
	        this.show = function () {
	            if (!this.myFoods) return false;
	            return Object.keys(this.myFoods).length > 0;
	        };
	    },
	    template: storageTableTemplate
	};

		module.exports = storageTable;

/***/ },
/* 31 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<table class=\"tb\" ng-if=\"$ctrl.show()\">\r\n    <caption class=\"tb-title\">Добавленые продукты</caption>\r\n    <tr>\r\n        <td class=\"td-name name-color color\">Наименование продукта</td>\r\n        <td class=\"portion-color color\">Порция</td>\r\n        <td class=\"carbohyd-color color\">Углеводы</td>\r\n        <td class=\"prot-color color\">Белки</td>\r\n        <td class=\"fat-color color\">Жиры</td>\r\n        <td class=\"kall-color color\">Калории</td>\r\n    </tr>\r\n\r\n    <tr class=\"my-food\" ng-repeat=\"(foodName, values) in $ctrl.myFoods\" ng-click=\"$ctrl.remove({name: foodName})\">\r\n        <td class=\"td-name\">{{ foodName }}</td>\r\n        <td>{{ values[0] }}</td>\r\n        <td>{{ values[1] }}</td>\r\n        <td>{{ values[2] }}</td>\r\n        <td>{{ values[3] }}</td>\r\n        <td>{{ values[4] }}</td>\r\n    </tr>\r\n</table>";
	ngModule.run(["$templateCache",function(c){c.put("storage-table-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var template = __webpack_require__(33);

	var tables = {
	    bindings: {
	        foodsObjs: '<',
	        myFoods: '<',
	        removeMyFood: '&'
	    },
	    controller: function controller($timeout) {
	        var _this = this;

	        this.showTable = function (hashKey) {
	            this.$$hashKey = hashKey;
	        };

	        $timeout(function () {
	            return _this.showTable(_this.foodsObjs[0].$$hashKey);
	        }, 0);

	        this.remove = function (obj) {
	            this.removeMyFood({ name: obj });
	        };

	        this.showMyFoodTitle = function () {
	            if (!this.myFoods) return false;
	            return !!Object.keys(this.myFoods).length;
	        };
	    },
	    template: template
	};

		module.exports = tables;

/***/ },
/* 33 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"tables-list\">\r\n    <div class=\"title\">Таблицы</div>\r\n    <div class=\"list\">\r\n        <div ng-repeat=\"obj in $ctrl.foodsObjs\" ng-click=\"$ctrl.showTable(obj.$$hashKey, obj)\" ng-class=\"{'active-table-title': $ctrl.$$hashKey === obj.$$hashKey}\">\r\n            - {{obj.title}}\r\n        </div>\r\n        <div ng-if=\"$ctrl.showMyFoodTitle()\" ng-click=\"$ctrl.showTable('add-food')\" ng-class=\"{'active-table-title': $ctrl.$$hashKey === 'add-food'}\">- Добавленные продукты</div>\r\n    </div>\r\n</div>\r\n\r\n<div class=\"table-container\">\r\n    <food-table ng-repeat=\"foodsObj in $ctrl.foodsObjs\" foods-obj=\"foodsObj\" ng-if=\"$ctrl.$$hashKey === foodsObj.$$hashKey\"></food-table>\r\n    <storage-table my-foods=\"$ctrl.myFoods\" remove=\"$ctrl.remove(name)\" ng-if=\"$ctrl.$$hashKey === 'add-food'\"></storage-table>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("single-page-tables-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 34 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
	    return function (value) {
	        if (value.length === 2) return '';
	        return value;
	    };
		};

/***/ },
/* 35 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function ($http, $window) {
	    var base = {};

	    function getFoodBase() {
	        return $http.get('./JSONdata/food.json').then(function (data) {
	            var base = {},
	                keys = [];
	            if ($window.localStorage.myFoods) data.data.push(JSON.parse($window.localStorage.myFoods));

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

	    getFoodBase().then(function (data) {
	        return base.foods = data;
	    });

	    function addToBase(name, values) {
	        base.foods[name] = values;
	        base.foods.keys.push({ foodName: name });
	    }

	    function removeFromBase(name) {
	        delete base.foods[name];

	        base.foods.keys.forEach(function (obj, index) {
	            if (obj.foodName === name) base.foods.keys.splice(index, 1);
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

	    return {
	        base: base,
	        addToBase: addToBase,
	        removeFromBase: removeFromBase,
	        getFoodBase: getFoodBase,
	        getFoodObjects: getFoodObjects,
	        getTableData: getTableData,
	        getDayTimesData: getDayTimesData,
	        getLimitsData: getLimitsData
	    };
		};

/***/ },
/* 36 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (dataService, modal) {
	    var food = dataService.base;

	    function foodAddValidation(name, portion) {
	        if (!name) {
	            modal.open({ title: 'Ошибка', message: 'Введите название продукта' }, 'alert');
	        } else if (!food.foods[name]) {
	            modal.open({ title: 'Ошибка', message: 'Такого продукта нет в базе. Со списком продуктов Вы можете ознакомиться в разделе "Таблицы", либо добавить свой продукт' }, 'alert');
	        } else if (!portion) {
	            modal.open({ title: 'Ошибка', message: 'Введите порцию в граммах' }, 'alert');
	        } else if (isNaN(+portion)) {
	            modal.open({ title: 'Ошибка', message: 'В поле "Порция" введите число' }, 'alert');
	        } else if (portion <= 0) {
	            modal.open({ title: 'Ошибка', message: 'Введите число больше чем 0' }, 'alert');
	        } else {
	            return true;
	        }
	    }

	    function validateLimitsChoose(diet1, diet2, phaseClass) {
	        if ((diet1 || diet2) && phaseClass !== 'start') return true;
	    }

	    function addMyFoodValidation(name, values) {
	        var success = true;
	        if (!name) {
	            modal.open({ title: 'Ошибка', message: 'Введите наименование продукта' }, 'alert');
	            success = false;
	            return;
	        }
	        if (values[0] === 0) {
	            modal.open({ title: 'Ошибка', message: 'Порция не может быть равна нулю' }, 'alert');
	            success = false;
	            return;
	        }
	        values.forEach(function (value) {
	            if (isNaN(value) || value < 0) {
	                modal.open({ title: 'Ошибка', message: 'Значения должны быть числами со значением большим или равным нулю' }, 'alert');
	                success = false;
	                return;
	            }
	        });
	        return success;
	    }

	    return {
	        foodAddValidation: foodAddValidation,
	        validateLimitsChoose: validateLimitsChoose,
	        addMyFoodValidation: addMyFoodValidation
	    };
		};

/***/ },
/* 37 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (dataService) {
	    var food = dataService.base;

	    function calculateValues(foodName, portion) {
	        var values = food.foods[foodName];
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
/* 38 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (dataService) {
	    var limitsData = {};

	    function setLimits(diet, phase) {
	        dataService.getLimitsData(diet, phase).then(function (data) {
	            return limitsData.limits = data.data;
	        });
	    }

	    function clearLimits() {
	        if (limitsData.limits) delete limitsData.limits;
	    }

	    return {
	        limitsData: limitsData,
	        setLimits: setLimits,
	        clearLimits: clearLimits
	    };
		};

/***/ },
/* 39 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
	    return function (daytime) {
	        switch (daytime) {
	            case 'breakfast':
	                return 0;
	                break;
	            case 'first-snack':
	                return 1;
	                break;
	            case 'dinner':
	                return 2;
	                break;
	            case 'second-snack':
	                return 3;
	                break;
	            case 'evening-meal':
	                return 4;
	                break;
	            default:
	                return false;
	        }
	    };
		};

/***/ },
/* 40 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
	    var activeClass = '';

	    function setClassName(className) {
	        activeClass = 'active-' + className;
	    }

	    function getClassName() {
	        return activeClass;
	    }

	    return {
	        getClassName: getClassName,
	        setClassName: setClassName
	    };
		};

/***/ },
/* 41 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function ($timeout, validationService, limitsService, $window, modal) {
	    var diets = {
	        carbohydrates: false,
	        proteins: false
	    },
	        className = { name: 'start' };

	    function setDiet(diet) {
	        if (diets[diet]) {
	            diets[diet] = false;
	            $timeout(function () {
	                return diets[diet] = true;
	            }, 0);
	            return;
	        }
	        diets.carbohydrates = diet === 'carbohydrates';
	        diets.proteins = diet === 'proteins';
	        if (validationService.validateLimitsChoose(diets.carbohydrates, diets.proteins, className.name)) setLimits();
	    }

	    function setClassName(phaseId) {
	        className.name = 'active' + phaseId;
	        if (validationService.validateLimitsChoose(diets.carbohydrates, diets.proteins, className.name)) setLimits();
	    }

	    function setLimits() {
	        var diet = diets.carbohydrates ? 'carbohydrates' : 'proteins',
	            phase = className.name.slice(-1);
	        limitsService.setLimits(diet, phase);

	        $window.sessionStorage.savedLimits = JSON.stringify({ diet: diet, phaseId: phase });
	    }

	    function resetChoose() {
	        if (!limitsService.limitsData.limits) {
	            diets.carbohydrates = false;
	            diets.proteins = false;
	            className.name = 'start';
	            return;
	        }
	        modal.open({ title: 'Подтверждение', message: 'Вы точно хотите сбросить установленные лимиты?' }, 'confirm').then(function () {
	            diets.carbohydrates = false;
	            diets.proteins = false;
	            className.name = 'start';

	            $window.sessionStorage.removeItem('savedLimits');
	            limitsService.clearLimits();
	        });
	    }

	    function loadLimits() {
	        if ($window.localStorage.savedLimits) {
	            var data = JSON.parse($window.localStorage.savedLimits);
	            setDiet(data.diet);
	            setClassName(data.phaseId);
	        }
	    }

	    return {
	        diets: diets,
	        className: className,
	        setDiet: setDiet,
	        setClassName: setClassName,
	        setLimits: setLimits,
	        resetChoose: resetChoose,
	        loadLimits: loadLimits
	    };
		};

/***/ },
/* 42 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function ($q) {
	    var state = 'close',
	        type = null,
	        defer = void 0;

	    var modalViewData = {};

	    function getState() {
	        return state;
	    }

	    function getType() {
	        return type;
	    }

	    function open(data, modal_type) {
	        modalViewData.data = data;
	        type = modal_type;
	        state = 'open';
	        if (modal_type === 'confirm') {
	            defer = $q.defer();
	            return defer.promise;
	        }
	    }

	    function close(bool) {
	        if (bool) {
	            defer.resolve();
	        } else if (type === 'confirm') {
	            defer.reject();
	        }
	        state = 'close';
	        type = null;
	        delete modalViewData.data;
	    }

	    return {
	        modalViewData: modalViewData,
	        getState: getState,
	        getType: getType,
	        open: open,
	        close: close
	    };
		};

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIDg0YjRkNzE1Yzg0NjdmNjlkYmFmIiwid2VicGFjazovLy9qcy9kaWFyeUFwcC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL2luZGV4LmpzIiwid2VicGFjazovLy9ub2RlX21vZHVsZXMvYW5ndWNvbXBsZXRlLWFsdC9hbmd1Y29tcGxldGUtYWx0LmpzIiwid2VicGFjazovLy9qcy9hcHAvbWFpbi1tb2R1bGUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9tYWluLW1vZHVsZS9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQvbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9tYWluLW1vZHVsZS9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQvdGVtcGxhdGUvbGVmdC1zaWRlLW1lbnUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL21haW4tbW9kdWxlL2RheXRpbWUtY2hvb3NlLWNvbXBvbmVudC9kYXl0aW1lLWNob29zZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL21haW4tbW9kdWxlL2RheXRpbWUtY2hvb3NlLWNvbXBvbmVudC90ZW1wbGF0ZS9kYXl0aW1lLWNob29zZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvbWFpbi1tb2R1bGUvaG9tZS1wYWdlLW1vZHVsZS9ob21lLXBhZ2UtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9tYWluLW1vZHVsZS9ob21lLXBhZ2UtbW9kdWxlL3RlbXBsYXRlL2hvbWUtcGFnZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvbWFpbi1tb2R1bGUvdmlldy1jb21wb25lbnQvdmlldy1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL21haW4tbW9kdWxlL3ZpZXctY29tcG9uZW50L3RlbXBsYXRlL3ZpZXctdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL21haW4tbW9kdWxlL21vZGFsLXdpbmRvdy1jb21wb25lbnQvbW9kYWwtd2luZG93LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvbWFpbi1tb2R1bGUvbW9kYWwtd2luZG93LWNvbXBvbmVudC90ZW1wbGF0ZS9tb2RhbC10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvZGlhcnktbW9kdWxlL2luZGV4LmpzIiwid2VicGFjazovLy9qcy9hcHAvZGlhcnktbW9kdWxlL21lbnUvbWVudS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9tZW51L3RlbXBsYXRlL21lbnUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9kYXktdGltZS9kYXktdGltZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9kYXktdGltZS90ZW1wbGF0ZS9kYXktdGltZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvZGlhcnktbW9kdWxlL2Zvb2QvZm9vZC1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9mb29kL3RlbXBsYXRlL2Zvb2QtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9zYXZlLW1lbnUvc2F2ZS1tZW51LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvZGlhcnktbW9kdWxlL3NhdmUtbWVudS90ZW1wbGF0ZS9zYXZlLW1lbnUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9yZXN1bHQtY29tcG9uZW50L3Jlc3VsdC1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9yZXN1bHQtY29tcG9uZW50L3RlbXBsYXRlL3Jlc3VsdC10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvdGFibGUtbW9kdWxlL2luZGV4LmpzIiwid2VicGFjazovLy9qcy9hcHAvdGFibGUtbW9kdWxlL2FkZC10by10YWJsZS1jb21wb25lbnQvYWRkLXRvLXRhYmxlLWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvdGFibGUtbW9kdWxlL2FkZC10by10YWJsZS1jb21wb25lbnQvdGVtcGxhdGUvYWRkLXRvLXRhYmxlLXRlbXBsYXRlLmh0bWwiLCJ3ZWJwYWNrOi8vL2pzL2FwcC90YWJsZS1tb2R1bGUvdGFibGUtY29tcG9uZW50L3RhYmxlLWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLWNvbXBvbmVudC90ZW1wbGF0ZS90YWJsZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvdGFibGUtbW9kdWxlL3N0b3JhZ2UtdGFibGUtY29tcG9uZW50L3N0b3JhZ2UtdGFibGUtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC90YWJsZS1tb2R1bGUvc3RvcmFnZS10YWJsZS1jb21wb25lbnQvdGVtcGxhdGUvc3RvcmFnZS10YWJsZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvdGFibGUtbW9kdWxlL3NpbmdsZS1wYWdlLXRhYmxlcy1jb21wb25lbnQvc2luZ2xlLXBhZ2UtdGFibGVzLWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvdGFibGUtbW9kdWxlL3NpbmdsZS1wYWdlLXRhYmxlcy1jb21wb25lbnQvdGVtcGxhdGUvc2luZ2xlLXBhZ2UtdGFibGVzLXRlbXBsYXRlLmh0bWwiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9zZXJ2aWNlcy9saW1pdHMtZmlsdGVyLmpzIiwid2VicGFjazovLy9qcy9hcHAvc2VydmljZXMvZGF0YS1zZXJ2aWNlLmpzIiwid2VicGFjazovLy9qcy9hcHAvc2VydmljZXMvdmFsaWRhdGlvbi1zZXJ2aWNlLmpzIiwid2VicGFjazovLy9qcy9hcHAvc2VydmljZXMvY2FsY3VsYXRpb24tc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2xpbWl0cy1zZXJ2aWNlLmpzIiwid2VicGFjazovLy9qcy9hcHAvc2VydmljZXMvaW5kZXgtc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2FjdGl2ZS1jbGFzcy1zZXJ2aWNlLmpzIiwid2VicGFjazovLy9qcy9hcHAvc2VydmljZXMvZGlldC1jaG9vc2Utc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL21vZGFsLXNlcnZpY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCA4NGI0ZDcxNWM4NDY3ZjY5ZGJhZlxuICoqLyIsInJlcXVpcmUoJy4vYXBwJyk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvZGlhcnlBcHAuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcbmNvbnN0IGF1dG9jb21wbGl0ZSA9IHJlcXVpcmUoJ2FuZ3Vjb21wbGV0ZS1hbHQnKTtcclxuY29uc3QgbWFpbk1vZHVsZSA9IHJlcXVpcmUoJy4vbWFpbi1tb2R1bGUnKTtcclxuY29uc3QgZGlhcnlNb2R1bGUgPSByZXF1aXJlKCcuL2RpYXJ5LW1vZHVsZScpO1xyXG5jb25zdCB0YWJsZU1vZHVsZSA9IHJlcXVpcmUoJy4vdGFibGUtbW9kdWxlJyk7XHJcblxyXG5jb25zdCBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWydtYWluJywgJ2RpYXJ5JywgJ3RhYmxlJywgJ25nQW5pbWF0ZScsICdhbmd1Y29tcGxldGUtYWx0J10pO1xyXG5cclxuYXBwLmZpbHRlcignbGltaXQnLCByZXF1aXJlKCcuL3NlcnZpY2VzL2xpbWl0cy1maWx0ZXInKSk7XHJcbmFwcFxyXG4gICAgLmZhY3RvcnkoJ2RhdGFTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9kYXRhLXNlcnZpY2UnKSlcclxuICAgIC5mYWN0b3J5KCd2YWxpZGF0aW9uU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvdmFsaWRhdGlvbi1zZXJ2aWNlJykpXHJcbiAgICAuZmFjdG9yeSgnY2FsY3VsYXRpb25TZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9jYWxjdWxhdGlvbi1zZXJ2aWNlJykpXHJcbiAgICAuZmFjdG9yeSgnbGltaXRzU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvbGltaXRzLXNlcnZpY2UnKSlcclxuICAgIC5mYWN0b3J5KCdpbmRleFNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL2luZGV4LXNlcnZpY2UnKSlcclxuICAgIC5mYWN0b3J5KCdhY3RpdmVDbGFzc1NlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL2FjdGl2ZS1jbGFzcy1zZXJ2aWNlJykpXHJcbiAgICAuZmFjdG9yeSgnZGlldENob29zZScsIHJlcXVpcmUoJy4vc2VydmljZXMvZGlldC1jaG9vc2Utc2VydmljZScpKVxyXG4gICAgLmZhY3RvcnkoJ21vZGFsJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9tb2RhbC1zZXJ2aWNlJykpO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYXBwO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9pbmRleC5qc1xuICoqLyIsIi8qXG4gKiBhbmd1Y29tcGxldGUtYWx0XG4gKiBBdXRvY29tcGxldGUgZGlyZWN0aXZlIGZvciBBbmd1bGFySlNcbiAqIFRoaXMgaXMgYSBmb3JrIG9mIERhcnlsIFJvd2xhbmQncyBhbmd1Y29tcGxldGUgd2l0aCBzb21lIGV4dHJhIGZlYXR1cmVzLlxuICogQnkgSGlkZW5hcmkgTm96YWtpXG4gKi9cblxuLyohIENvcHlyaWdodCAoYykgMjAxNCBIaWRlbmFyaSBOb3pha2kgYW5kIGNvbnRyaWJ1dG9ycyB8IExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSAqL1xuXG5cbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXIubW9kdWxlKCdhbmd1Y29tcGxldGUtYWx0JywgW10pLmRpcmVjdGl2ZSgnYW5ndWNvbXBsZXRlQWx0JywgWyckcScsICckcGFyc2UnLCAnJGh0dHAnLCAnJHNjZScsICckdGltZW91dCcsICckdGVtcGxhdGVDYWNoZScsICckaW50ZXJwb2xhdGUnLCBmdW5jdGlvbiAoJHEsICRwYXJzZSwgJGh0dHAsICRzY2UsICR0aW1lb3V0LCAkdGVtcGxhdGVDYWNoZSwgJGludGVycG9sYXRlKSB7XG4gICAgLy8ga2V5Ym9hcmQgZXZlbnRzXG4gICAgdmFyIEtFWV9EVyAgPSA0MDtcbiAgICB2YXIgS0VZX1JUICA9IDM5O1xuICAgIHZhciBLRVlfVVAgID0gMzg7XG4gICAgdmFyIEtFWV9MRiAgPSAzNztcbiAgICB2YXIgS0VZX0VTICA9IDI3O1xuICAgIHZhciBLRVlfRU4gID0gMTM7XG4gICAgdmFyIEtFWV9UQUIgPSAgOTtcblxuICAgIHZhciBNSU5fTEVOR1RIID0gMztcbiAgICB2YXIgTUFYX0xFTkdUSCA9IDUyNDI4ODsgIC8vIHRoZSBkZWZhdWx0IG1heCBsZW5ndGggcGVyIHRoZSBodG1sIG1heGxlbmd0aCBhdHRyaWJ1dGVcbiAgICB2YXIgUEFVU0UgPSA1MDA7XG4gICAgdmFyIEJMVVJfVElNRU9VVCA9IDIwMDtcblxuICAgIC8vIHN0cmluZyBjb25zdGFudHNcbiAgICB2YXIgUkVRVUlSRURfQ0xBU1MgPSAnYXV0b2NvbXBsZXRlLXJlcXVpcmVkJztcbiAgICB2YXIgVEVYVF9TRUFSQ0hJTkcgPSAn0J/QvtC40YHQui4uLic7XG4gICAgdmFyIFRFWFRfTk9SRVNVTFRTID0gJ9Cd0LXRgiDRgdC+0LLQv9Cw0LTQtdC90LjQuSc7XG4gICAgdmFyIFRFTVBMQVRFX1VSTCA9ICcvYW5ndWNvbXBsZXRlLWFsdC9pbmRleC5odG1sJztcblxuICAgIC8vIFNldCB0aGUgZGVmYXVsdCB0ZW1wbGF0ZSBmb3IgdGhpcyBkaXJlY3RpdmVcbiAgICAkdGVtcGxhdGVDYWNoZS5wdXQoVEVNUExBVEVfVVJMLFxuICAgICAgICAnPGRpdiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1ob2xkZXJcIiBuZy1jbGFzcz1cIntcXCdhbmd1Y29tcGxldGUtZHJvcGRvd24tdmlzaWJsZVxcJzogc2hvd0Ryb3Bkb3dufVwiPicgK1xuICAgICAgICAnICA8aW5wdXQgaWQ9XCJ7e2lkfX1fdmFsdWVcIiBuYW1lPVwie3tpbnB1dE5hbWV9fVwiIHRhYmluZGV4PVwie3tmaWVsZFRhYmluZGV4fX1cIiBuZy1jbGFzcz1cIntcXCdhbmd1Y29tcGxldGUtaW5wdXQtbm90LWVtcHR5XFwnOiBub3RFbXB0eX1cIiBuZy1tb2RlbD1cInNlYXJjaFN0clwiIG5nLWRpc2FibGVkPVwiZGlzYWJsZUlucHV0XCIgdHlwZT1cInt7aW5wdXRUeXBlfX1cIiBwbGFjZWhvbGRlcj1cInt7cGxhY2Vob2xkZXJ9fVwiIG1heGxlbmd0aD1cInt7bWF4bGVuZ3RofX1cIiBuZy1mb2N1cz1cIm9uRm9jdXNIYW5kbGVyKClcIiBjbGFzcz1cInt7aW5wdXRDbGFzc319XCIgbmctZm9jdXM9XCJyZXNldEhpZGVSZXN1bHRzKClcIiBuZy1ibHVyPVwiaGlkZVJlc3VsdHMoJGV2ZW50KVwiIGF1dG9jYXBpdGFsaXplPVwib2ZmXCIgYXV0b2NvcnJlY3Q9XCJvZmZcIiBhdXRvY29tcGxldGU9XCJvZmZcIiBuZy1jaGFuZ2U9XCJpbnB1dENoYW5nZUhhbmRsZXIoc2VhcmNoU3RyKVwiLz4nICtcbiAgICAgICAgJyAgPGRpdiBpZD1cInt7aWR9fV9kcm9wZG93blwiIGNsYXNzPVwiYW5ndWNvbXBsZXRlLWRyb3Bkb3duXCIgbmctc2hvdz1cInNob3dEcm9wZG93blwiPicgK1xuICAgICAgICAnICAgIDxkaXYgY2xhc3M9XCJhbmd1Y29tcGxldGUtc2VhcmNoaW5nXCIgbmctc2hvdz1cInNlYXJjaGluZ1wiIG5nLWJpbmQ9XCJ0ZXh0U2VhcmNoaW5nXCI+PC9kaXY+JyArXG4gICAgICAgICcgICAgPGRpdiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1zZWFyY2hpbmdcIiBuZy1zaG93PVwiIXNlYXJjaGluZyAmJiAoIXJlc3VsdHMgfHwgcmVzdWx0cy5sZW5ndGggPT0gMClcIiBuZy1iaW5kPVwidGV4dE5vUmVzdWx0c1wiPjwvZGl2PicgK1xuICAgICAgICAnICAgIDxkaXYgY2xhc3M9XCJhbmd1Y29tcGxldGUtcm93XCIgbmctcmVwZWF0PVwicmVzdWx0IGluIHJlc3VsdHNcIiBuZy1jbGljaz1cInNlbGVjdFJlc3VsdChyZXN1bHQpXCIgbmctbW91c2VlbnRlcj1cImhvdmVyUm93KCRpbmRleClcIiBuZy1jbGFzcz1cIntcXCdhbmd1Y29tcGxldGUtc2VsZWN0ZWQtcm93XFwnOiAkaW5kZXggPT0gY3VycmVudEluZGV4fVwiPicgK1xuICAgICAgICAnICAgICAgPGRpdiBuZy1pZj1cImltYWdlRmllbGRcIiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1pbWFnZS1ob2xkZXJcIj4nICtcbiAgICAgICAgJyAgICAgICAgPGltZyBuZy1pZj1cInJlc3VsdC5pbWFnZSAmJiByZXN1bHQuaW1hZ2UgIT0gXFwnXFwnXCIgbmctc3JjPVwie3tyZXN1bHQuaW1hZ2V9fVwiIGNsYXNzPVwiYW5ndWNvbXBsZXRlLWltYWdlXCIvPicgK1xuICAgICAgICAnICAgICAgICA8ZGl2IG5nLWlmPVwiIXJlc3VsdC5pbWFnZSAmJiByZXN1bHQuaW1hZ2UgIT0gXFwnXFwnXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtaW1hZ2UtZGVmYXVsdFwiPjwvZGl2PicgK1xuICAgICAgICAnICAgICAgPC9kaXY+JyArXG4gICAgICAgICcgICAgICA8ZGl2IGNsYXNzPVwiYW5ndWNvbXBsZXRlLXRpdGxlXCIgbmctaWY9XCJtYXRjaENsYXNzXCIgbmctYmluZC1odG1sPVwicmVzdWx0LnRpdGxlXCI+PC9kaXY+JyArXG4gICAgICAgICcgICAgICA8ZGl2IGNsYXNzPVwiYW5ndWNvbXBsZXRlLXRpdGxlXCIgbmctaWY9XCIhbWF0Y2hDbGFzc1wiPnt7IHJlc3VsdC50aXRsZSB9fTwvZGl2PicgK1xuICAgICAgICAnICAgICAgPGRpdiBuZy1pZj1cIm1hdGNoQ2xhc3MgJiYgcmVzdWx0LmRlc2NyaXB0aW9uICYmIHJlc3VsdC5kZXNjcmlwdGlvbiAhPSBcXCdcXCdcIiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1kZXNjcmlwdGlvblwiIG5nLWJpbmQtaHRtbD1cInJlc3VsdC5kZXNjcmlwdGlvblwiPjwvZGl2PicgK1xuICAgICAgICAnICAgICAgPGRpdiBuZy1pZj1cIiFtYXRjaENsYXNzICYmIHJlc3VsdC5kZXNjcmlwdGlvbiAmJiByZXN1bHQuZGVzY3JpcHRpb24gIT0gXFwnXFwnXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtZGVzY3JpcHRpb25cIj57e3Jlc3VsdC5kZXNjcmlwdGlvbn19PC9kaXY+JyArXG4gICAgICAgICcgICAgPC9kaXY+JyArXG4gICAgICAgICcgIDwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+J1xuICAgICk7XG5cbiAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtLCBhdHRycywgY3RybCkge1xuICAgICAgdmFyIGlucHV0RmllbGQgPSBlbGVtLmZpbmQoJ2lucHV0Jyk7XG4gICAgICB2YXIgbWlubGVuZ3RoID0gTUlOX0xFTkdUSDtcbiAgICAgIHZhciBzZWFyY2hUaW1lciA9IG51bGw7XG4gICAgICB2YXIgaGlkZVRpbWVyO1xuICAgICAgdmFyIHJlcXVpcmVkQ2xhc3NOYW1lID0gUkVRVUlSRURfQ0xBU1M7XG4gICAgICB2YXIgcmVzcG9uc2VGb3JtYXR0ZXI7XG4gICAgICB2YXIgdmFsaWRTdGF0ZSA9IG51bGw7XG4gICAgICB2YXIgaHR0cENhbmNlbGxlciA9IG51bGw7XG4gICAgICB2YXIgZGQgPSBlbGVtWzBdLnF1ZXJ5U2VsZWN0b3IoJy5hbmd1Y29tcGxldGUtZHJvcGRvd24nKTtcbiAgICAgIHZhciBpc1Njcm9sbE9uID0gZmFsc2U7XG4gICAgICB2YXIgbW91c2Vkb3duT24gPSBudWxsO1xuICAgICAgdmFyIHVuYmluZEluaXRpYWxWYWx1ZTtcbiAgICAgIHZhciBkaXNwbGF5U2VhcmNoaW5nO1xuICAgICAgdmFyIGRpc3BsYXlOb1Jlc3VsdHM7XG5cbiAgICAgIGVsZW0ub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQuaWQpIHtcbiAgICAgICAgICBtb3VzZWRvd25PbiA9IGV2ZW50LnRhcmdldC5pZDtcbiAgICAgICAgICBpZiAobW91c2Vkb3duT24gPT09IHNjb3BlLmlkICsgJ19kcm9wZG93bicpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGlja291dEhhbmRsZXJGb3JEcm9wZG93bik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIG1vdXNlZG93bk9uID0gZXZlbnQudGFyZ2V0LmNsYXNzTmFtZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IHNjb3BlLmZvY3VzRmlyc3QgPyAwIDogbnVsbDtcbiAgICAgIHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xuICAgICAgdW5iaW5kSW5pdGlhbFZhbHVlID0gc2NvcGUuJHdhdGNoKCdpbml0aWFsVmFsdWUnLCBmdW5jdGlvbihuZXd2YWwpIHtcbiAgICAgICAgaWYgKG5ld3ZhbCkge1xuICAgICAgICAgIC8vIHJlbW92ZSBzY29wZSBsaXN0ZW5lclxuICAgICAgICAgIHVuYmluZEluaXRpYWxWYWx1ZSgpO1xuICAgICAgICAgIC8vIGNoYW5nZSBpbnB1dFxuICAgICAgICAgIGhhbmRsZUlucHV0Q2hhbmdlKG5ld3ZhbCwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBzY29wZS4kd2F0Y2goJ2ZpZWxkUmVxdWlyZWQnLCBmdW5jdGlvbihuZXd2YWwsIG9sZHZhbCkge1xuICAgICAgICBpZiAobmV3dmFsICE9PSBvbGR2YWwpIHtcbiAgICAgICAgICBpZiAoIW5ld3ZhbCkge1xuICAgICAgICAgICAgY3RybFtzY29wZS5pbnB1dE5hbWVdLiRzZXRWYWxpZGl0eShyZXF1aXJlZENsYXNzTmFtZSwgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCF2YWxpZFN0YXRlIHx8IHNjb3BlLmN1cnJlbnRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGhhbmRsZVJlcXVpcmVkKGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVSZXF1aXJlZCh0cnVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBzY29wZS4kb24oJ2FuZ3Vjb21wbGV0ZS1hbHQ6Y2xlYXJJbnB1dCcsIGZ1bmN0aW9uIChldmVudCwgZWxlbWVudElkKSB7XG4gICAgICAgIGlmICghZWxlbWVudElkIHx8IGVsZW1lbnRJZCA9PT0gc2NvcGUuaWQpIHtcbiAgICAgICAgICBzY29wZS5zZWFyY2hTdHIgPSBudWxsO1xuICAgICAgICAgIGNhbGxPckFzc2lnbigpO1xuICAgICAgICAgIGhhbmRsZVJlcXVpcmVkKGZhbHNlKTtcbiAgICAgICAgICBjbGVhclJlc3VsdHMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHNjb3BlLiRvbignYW5ndWNvbXBsZXRlLWFsdDpjaGFuZ2VJbnB1dCcsIGZ1bmN0aW9uIChldmVudCwgZWxlbWVudElkLCBuZXd2YWwpIHtcbiAgICAgICAgaWYgKCEhZWxlbWVudElkICYmIGVsZW1lbnRJZCA9PT0gc2NvcGUuaWQpIHtcbiAgICAgICAgICBoYW5kbGVJbnB1dENoYW5nZShuZXd2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gaGFuZGxlSW5wdXRDaGFuZ2UobmV3dmFsLCBpbml0aWFsKSB7XG4gICAgICAgIGlmIChuZXd2YWwpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIG5ld3ZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IGV4dHJhY3RUaXRsZShuZXd2YWwpO1xuICAgICAgICAgICAgY2FsbE9yQXNzaWduKHtvcmlnaW5hbE9iamVjdDogbmV3dmFsfSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbmV3dmFsID09PSAnc3RyaW5nJyAmJiBuZXd2YWwubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc2NvcGUuc2VhcmNoU3RyID0gbmV3dmFsO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoY29uc29sZSAmJiBjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RyaWVkIHRvIHNldCAnICsgKCEhaW5pdGlhbCA/ICdpbml0aWFsJyA6ICcnKSArICcgdmFsdWUgb2YgYW5ndWNvbXBsZXRlIHRvJywgbmV3dmFsLCAnd2hpY2ggaXMgYW4gaW52YWxpZCB2YWx1ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGhhbmRsZVJlcXVpcmVkKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vICMxOTQgZHJvcGRvd24gbGlzdCBub3QgY29uc2lzdGVudCBpbiBjb2xsYXBzaW5nIChidWcpLlxuICAgICAgZnVuY3Rpb24gY2xpY2tvdXRIYW5kbGVyRm9yRHJvcGRvd24oZXZlbnQpIHtcbiAgICAgICAgbW91c2Vkb3duT24gPSBudWxsO1xuICAgICAgICBzY29wZS5oaWRlUmVzdWx0cyhldmVudCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGlja291dEhhbmRsZXJGb3JEcm9wZG93bik7XG4gICAgICB9XG5cbiAgICAgIC8vIGZvciBJRTggcXVpcmtpbmVzcyBhYm91dCBldmVudC53aGljaFxuICAgICAgZnVuY3Rpb24gaWU4RXZlbnROb3JtYWxpemVyKGV2ZW50KSB7XG4gICAgICAgIHJldHVybiBldmVudC53aGljaCA/IGV2ZW50LndoaWNoIDogZXZlbnQua2V5Q29kZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2FsbE9yQXNzaWduKHZhbHVlKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2NvcGUuc2VsZWN0ZWRPYmplY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBzY29wZS5zZWxlY3RlZE9iamVjdCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgc2NvcGUuc2VsZWN0ZWRPYmplY3QgPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgIGhhbmRsZVJlcXVpcmVkKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGhhbmRsZVJlcXVpcmVkKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjYWxsRnVuY3Rpb25PcklkZW50aXR5KGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgcmV0dXJuIHNjb3BlW2ZuXSA/IHNjb3BlW2ZuXShkYXRhKSA6IGRhdGE7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNldElucHV0U3RyaW5nKHN0cikge1xuICAgICAgICBjYWxsT3JBc3NpZ24oe29yaWdpbmFsT2JqZWN0OiBzdHJ9KTtcblxuICAgICAgICBpZiAoc2NvcGUuY2xlYXJTZWxlY3RlZCkge1xuICAgICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGV4dHJhY3RUaXRsZShkYXRhKSB7XG4gICAgICAgIC8vIHNwbGl0IHRpdGxlIGZpZWxkcyBhbmQgcnVuIGV4dHJhY3RWYWx1ZSBmb3IgZWFjaCBhbmQgam9pbiB3aXRoICcgJ1xuICAgICAgICByZXR1cm4gc2NvcGUudGl0bGVGaWVsZC5zcGxpdCgnLCcpXG4gICAgICAgICAgLm1hcChmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICAgcmV0dXJuIGV4dHJhY3RWYWx1ZShkYXRhLCBmaWVsZCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuam9pbignICcpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBleHRyYWN0VmFsdWUob2JqLCBrZXkpIHtcbiAgICAgICAgdmFyIGtleXMsIHJlc3VsdDtcbiAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgIGtleXM9IGtleS5zcGxpdCgnLicpO1xuICAgICAgICAgIHJlc3VsdCA9IG9iajtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdFtrZXlzW2ldXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmVzdWx0ID0gb2JqO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGZpbmRNYXRjaFN0cmluZyh0YXJnZXQsIHN0cikge1xuICAgICAgICB2YXIgcmVzdWx0LCBtYXRjaGVzLCByZTtcbiAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9HdWlkZS9SZWd1bGFyX0V4cHJlc3Npb25zXG4gICAgICAgIC8vIEVzY2FwZSB1c2VyIGlucHV0IHRvIGJlIHRyZWF0ZWQgYXMgYSBsaXRlcmFsIHN0cmluZyB3aXRoaW4gYSByZWd1bGFyIGV4cHJlc3Npb25cbiAgICAgICAgcmUgPSBuZXcgUmVnRXhwKHN0ci5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpLCAnaScpO1xuICAgICAgICBpZiAoIXRhcmdldCkgeyByZXR1cm47IH1cbiAgICAgICAgaWYgKCF0YXJnZXQubWF0Y2ggfHwgIXRhcmdldC5yZXBsYWNlKSB7IHRhcmdldCA9IHRhcmdldC50b1N0cmluZygpOyB9XG4gICAgICAgIG1hdGNoZXMgPSB0YXJnZXQubWF0Y2gocmUpO1xuICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgIHJlc3VsdCA9IHRhcmdldC5yZXBsYWNlKHJlLFxuICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCInKyBzY29wZS5tYXRjaENsYXNzICsnXCI+JysgbWF0Y2hlc1swXSArJzwvc3Bhbj4nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXN1bHQgPSB0YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwocmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGFuZGxlUmVxdWlyZWQodmFsaWQpIHtcbiAgICAgICAgc2NvcGUubm90RW1wdHkgPSB2YWxpZDtcbiAgICAgICAgdmFsaWRTdGF0ZSA9IHNjb3BlLnNlYXJjaFN0cjtcbiAgICAgICAgaWYgKHNjb3BlLmZpZWxkUmVxdWlyZWQgJiYgY3RybCAmJiBzY29wZS5pbnB1dE5hbWUpIHtcbiAgICAgICAgICBjdHJsW3Njb3BlLmlucHV0TmFtZV0uJHNldFZhbGlkaXR5KHJlcXVpcmVkQ2xhc3NOYW1lLCB2YWxpZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24ga2V5dXBIYW5kbGVyKGV2ZW50KSB7XG4gICAgICAgIHZhciB3aGljaCA9IGllOEV2ZW50Tm9ybWFsaXplcihldmVudCk7XG4gICAgICAgIGlmICh3aGljaCA9PT0gS0VZX0xGIHx8IHdoaWNoID09PSBLRVlfUlQpIHtcbiAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdoaWNoID09PSBLRVlfVVAgfHwgd2hpY2ggPT09IEtFWV9FTikge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAod2hpY2ggPT09IEtFWV9EVykge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgaWYgKCFzY29wZS5zaG93RHJvcGRvd24gJiYgc2NvcGUuc2VhcmNoU3RyICYmIHNjb3BlLnNlYXJjaFN0ci5sZW5ndGggPj0gbWlubGVuZ3RoKSB7XG4gICAgICAgICAgICBpbml0UmVzdWx0cygpO1xuICAgICAgICAgICAgc2NvcGUuc2VhcmNoaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlYXJjaFRpbWVyQ29tcGxldGUoc2NvcGUuc2VhcmNoU3RyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAod2hpY2ggPT09IEtFWV9FUykge1xuICAgICAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlucHV0RmllbGQudmFsKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKG1pbmxlbmd0aCA9PT0gMCAmJiAhc2NvcGUuc2VhcmNoU3RyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFzY29wZS5zZWFyY2hTdHIgfHwgc2NvcGUuc2VhcmNoU3RyID09PSAnJykge1xuICAgICAgICAgICAgc2NvcGUuc2hvd0Ryb3Bkb3duID0gZmFsc2U7XG4gICAgICAgICAgfSBlbHNlIGlmIChzY29wZS5zZWFyY2hTdHIubGVuZ3RoID49IG1pbmxlbmd0aCkge1xuICAgICAgICAgICAgaW5pdFJlc3VsdHMoKTtcblxuICAgICAgICAgICAgaWYgKHNlYXJjaFRpbWVyKSB7XG4gICAgICAgICAgICAgICR0aW1lb3V0LmNhbmNlbChzZWFyY2hUaW1lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNjb3BlLnNlYXJjaGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgIHNlYXJjaFRpbWVyID0gJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHNlYXJjaFRpbWVyQ29tcGxldGUoc2NvcGUuc2VhcmNoU3RyKTtcbiAgICAgICAgICAgIH0sIHNjb3BlLnBhdXNlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodmFsaWRTdGF0ZSAmJiB2YWxpZFN0YXRlICE9PSBzY29wZS5zZWFyY2hTdHIgJiYgIXNjb3BlLmNsZWFyU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgY2FsbE9yQXNzaWduKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGFuZGxlT3ZlcnJpZGVTdWdnZXN0aW9ucyhldmVudCkge1xuICAgICAgICBpZiAoc2NvcGUub3ZlcnJpZGVTdWdnZXN0aW9ucyAmJlxuICAgICAgICAgICAgIShzY29wZS5zZWxlY3RlZE9iamVjdCAmJiBzY29wZS5zZWxlY3RlZE9iamVjdC5vcmlnaW5hbE9iamVjdCA9PT0gc2NvcGUuc2VhcmNoU3RyKSkge1xuICAgICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBjYW5jZWwgc2VhcmNoIHRpbWVyXG4gICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHNlYXJjaFRpbWVyKTtcbiAgICAgICAgICAvLyBjYW5jZWwgaHR0cCByZXF1ZXN0XG4gICAgICAgICAgY2FuY2VsSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICAgIHNldElucHV0U3RyaW5nKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZHJvcGRvd25Sb3dPZmZzZXRIZWlnaHQocm93KSB7XG4gICAgICAgIHZhciBjc3MgPSBnZXRDb21wdXRlZFN0eWxlKHJvdyk7XG4gICAgICAgIHJldHVybiByb3cub2Zmc2V0SGVpZ2h0ICtcbiAgICAgICAgICBwYXJzZUludChjc3MubWFyZ2luVG9wLCAxMCkgKyBwYXJzZUludChjc3MubWFyZ2luQm90dG9tLCAxMCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGRyb3Bkb3duSGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gZGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICtcbiAgICAgICAgICBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKGRkKS5tYXhIZWlnaHQsIDEwKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZHJvcGRvd25Sb3coKSB7XG4gICAgICAgIHJldHVybiBlbGVtWzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5hbmd1Y29tcGxldGUtcm93Jylbc2NvcGUuY3VycmVudEluZGV4XTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZHJvcGRvd25Sb3dUb3AoKSB7XG4gICAgICAgIHJldHVybiBkcm9wZG93blJvdygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCAtXG4gICAgICAgICAgKGRkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCArXG4gICAgICAgICAgIHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUoZGQpLnBhZGRpbmdUb3AsIDEwKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGRyb3Bkb3duU2Nyb2xsVG9wVG8ob2Zmc2V0KSB7XG4gICAgICAgIGRkLnNjcm9sbFRvcCA9IGRkLnNjcm9sbFRvcCArIG9mZnNldDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdXBkYXRlSW5wdXRGaWVsZCgpe1xuICAgICAgICB2YXIgY3VycmVudCA9IHNjb3BlLnJlc3VsdHNbc2NvcGUuY3VycmVudEluZGV4XTtcbiAgICAgICAgaWYgKHNjb3BlLm1hdGNoQ2xhc3MpIHtcbiAgICAgICAgICBpbnB1dEZpZWxkLnZhbChleHRyYWN0VGl0bGUoY3VycmVudC5vcmlnaW5hbE9iamVjdCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlucHV0RmllbGQudmFsKGN1cnJlbnQudGl0bGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGtleWRvd25IYW5kbGVyKGV2ZW50KSB7XG4gICAgICAgIHZhciB3aGljaCA9IGllOEV2ZW50Tm9ybWFsaXplcihldmVudCk7XG4gICAgICAgIHZhciByb3cgPSBudWxsO1xuICAgICAgICB2YXIgcm93VG9wID0gbnVsbDtcblxuICAgICAgICBpZiAod2hpY2ggPT09IEtFWV9FTiAmJiBzY29wZS5yZXN1bHRzKSB7XG4gICAgICAgICAgaWYgKHNjb3BlLmN1cnJlbnRJbmRleCA+PSAwICYmIHNjb3BlLmN1cnJlbnRJbmRleCA8IHNjb3BlLnJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgc2NvcGUuc2VsZWN0UmVzdWx0KHNjb3BlLnJlc3VsdHNbc2NvcGUuY3VycmVudEluZGV4XSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZU92ZXJyaWRlU3VnZ2VzdGlvbnMoZXZlbnQpO1xuICAgICAgICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHdoaWNoID09PSBLRVlfRFcgJiYgc2NvcGUucmVzdWx0cykge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgaWYgKChzY29wZS5jdXJyZW50SW5kZXggKyAxKSA8IHNjb3BlLnJlc3VsdHMubGVuZ3RoICYmIHNjb3BlLnNob3dEcm9wZG93bikge1xuICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggKys7XG4gICAgICAgICAgICAgIHVwZGF0ZUlucHV0RmllbGQoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoaXNTY3JvbGxPbikge1xuICAgICAgICAgICAgICByb3cgPSBkcm9wZG93blJvdygpO1xuICAgICAgICAgICAgICBpZiAoZHJvcGRvd25IZWlnaHQoKSA8IHJvdy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5ib3R0b20pIHtcbiAgICAgICAgICAgICAgICBkcm9wZG93blNjcm9sbFRvcFRvKGRyb3Bkb3duUm93T2Zmc2V0SGVpZ2h0KHJvdykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHdoaWNoID09PSBLRVlfVVAgJiYgc2NvcGUucmVzdWx0cykge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgaWYgKHNjb3BlLmN1cnJlbnRJbmRleCA+PSAxKSB7XG4gICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCAtLTtcbiAgICAgICAgICAgICAgdXBkYXRlSW5wdXRGaWVsZCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChpc1Njcm9sbE9uKSB7XG4gICAgICAgICAgICAgIHJvd1RvcCA9IGRyb3Bkb3duUm93VG9wKCk7XG4gICAgICAgICAgICAgIGlmIChyb3dUb3AgPCAwKSB7XG4gICAgICAgICAgICAgICAgZHJvcGRvd25TY3JvbGxUb3BUbyhyb3dUb3AgLSAxKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmIChzY29wZS5jdXJyZW50SW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gLTE7XG4gICAgICAgICAgICAgIGlucHV0RmllbGQudmFsKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAod2hpY2ggPT09IEtFWV9UQUIpIHtcbiAgICAgICAgICBpZiAoc2NvcGUucmVzdWx0cyAmJiBzY29wZS5yZXN1bHRzLmxlbmd0aCA+IDAgJiYgc2NvcGUuc2hvd0Ryb3Bkb3duKSB7XG4gICAgICAgICAgICBpZiAoc2NvcGUuY3VycmVudEluZGV4ID09PSAtMSAmJiBzY29wZS5vdmVycmlkZVN1Z2dlc3Rpb25zKSB7XG4gICAgICAgICAgICAgIC8vIGludGVudGlvbmFsbHkgbm90IHNlbmRpbmcgZXZlbnQgc28gdGhhdCBpdCBkb2VzIG5vdFxuICAgICAgICAgICAgICAvLyBwcmV2ZW50IGRlZmF1bHQgdGFiIGJlaGF2aW9yXG4gICAgICAgICAgICAgIGhhbmRsZU92ZXJyaWRlU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoc2NvcGUuY3VycmVudEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IDA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2NvcGUuc2VsZWN0UmVzdWx0KHNjb3BlLnJlc3VsdHNbc2NvcGUuY3VycmVudEluZGV4XSk7XG4gICAgICAgICAgICAgIHNjb3BlLiRkaWdlc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBubyByZXN1bHRzXG4gICAgICAgICAgICAvLyBpbnRlbnRpb25hbGx5IG5vdCBzZW5kaW5nIGV2ZW50IHNvIHRoYXQgaXQgZG9lcyBub3RcbiAgICAgICAgICAgIC8vIHByZXZlbnQgZGVmYXVsdCB0YWIgYmVoYXZpb3JcbiAgICAgICAgICAgIGlmIChzY29wZS5zZWFyY2hTdHIgJiYgc2NvcGUuc2VhcmNoU3RyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgaGFuZGxlT3ZlcnJpZGVTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh3aGljaCA9PT0gS0VZX0VTKSB7XG4gICAgICAgICAgLy8gVGhpcyBpcyB2ZXJ5IHNwZWNpZmljIHRvIElFMTAvMTEgIzI3MlxuICAgICAgICAgIC8vIHdpdGhvdXQgdGhpcywgSUUgY2xlYXJzIHRoZSBpbnB1dCB0ZXh0XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBodHRwU3VjY2Vzc0NhbGxiYWNrR2VuKHN0cikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmVzcG9uc2VEYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICAgIC8vIG5vcm1hbGl6ZSByZXR1cm4gb2JlamN0IGZyb20gcHJvbWlzZVxuICAgICAgICAgIGlmICghc3RhdHVzICYmICFoZWFkZXJzICYmICFjb25maWcgJiYgcmVzcG9uc2VEYXRhLmRhdGEpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRGF0YSA9IHJlc3BvbnNlRGF0YS5kYXRhO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzY29wZS5zZWFyY2hpbmcgPSBmYWxzZTtcbiAgICAgICAgICBwcm9jZXNzUmVzdWx0cyhcbiAgICAgICAgICAgIGV4dHJhY3RWYWx1ZShyZXNwb25zZUZvcm1hdHRlcihyZXNwb25zZURhdGEpLCBzY29wZS5yZW1vdGVVcmxEYXRhRmllbGQpLFxuICAgICAgICAgICAgc3RyKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaHR0cEVycm9yQ2FsbGJhY2soZXJyb3JSZXMsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgIC8vIGNhbmNlbGxlZC9hYm9ydGVkXG4gICAgICAgIGlmIChzdGF0dXMgPT09IDAgfHwgc3RhdHVzID09PSAtMSkgeyByZXR1cm47IH1cblxuICAgICAgICAvLyBub3JtYWxpemUgcmV0dXJuIG9iZWpjdCBmcm9tIHByb21pc2VcbiAgICAgICAgaWYgKCFzdGF0dXMgJiYgIWhlYWRlcnMgJiYgIWNvbmZpZykge1xuICAgICAgICAgIHN0YXR1cyA9IGVycm9yUmVzLnN0YXR1cztcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2NvcGUucmVtb3RlVXJsRXJyb3JDYWxsYmFjaykge1xuICAgICAgICAgIHNjb3BlLnJlbW90ZVVybEVycm9yQ2FsbGJhY2soZXJyb3JSZXMsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoY29uc29sZSAmJiBjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdodHRwIGVycm9yJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNhbmNlbEh0dHBSZXF1ZXN0KCkge1xuICAgICAgICBpZiAoaHR0cENhbmNlbGxlcikge1xuICAgICAgICAgIGh0dHBDYW5jZWxsZXIucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGdldFJlbW90ZVJlc3VsdHMoc3RyKSB7XG4gICAgICAgIHZhciBwYXJhbXMgPSB7fSxcbiAgICAgICAgICAgIHVybCA9IHNjb3BlLnJlbW90ZVVybCArIGVuY29kZVVSSUNvbXBvbmVudChzdHIpO1xuICAgICAgICBpZiAoc2NvcGUucmVtb3RlVXJsUmVxdWVzdEZvcm1hdHRlcikge1xuICAgICAgICAgIHBhcmFtcyA9IHtwYXJhbXM6IHNjb3BlLnJlbW90ZVVybFJlcXVlc3RGb3JtYXR0ZXIoc3RyKX07XG4gICAgICAgICAgdXJsID0gc2NvcGUucmVtb3RlVXJsO1xuICAgICAgICB9XG4gICAgICAgIGlmICghIXNjb3BlLnJlbW90ZVVybFJlcXVlc3RXaXRoQ3JlZGVudGlhbHMpIHtcbiAgICAgICAgICBwYXJhbXMud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjYW5jZWxIdHRwUmVxdWVzdCgpO1xuICAgICAgICBodHRwQ2FuY2VsbGVyID0gJHEuZGVmZXIoKTtcbiAgICAgICAgcGFyYW1zLnRpbWVvdXQgPSBodHRwQ2FuY2VsbGVyLnByb21pc2U7XG4gICAgICAgICRodHRwLmdldCh1cmwsIHBhcmFtcylcbiAgICAgICAgICAuc3VjY2VzcyhodHRwU3VjY2Vzc0NhbGxiYWNrR2VuKHN0cikpXG4gICAgICAgICAgLmVycm9yKGh0dHBFcnJvckNhbGxiYWNrKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZ2V0UmVtb3RlUmVzdWx0c1dpdGhDdXN0b21IYW5kbGVyKHN0cikge1xuICAgICAgICBjYW5jZWxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgIGh0dHBDYW5jZWxsZXIgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIHNjb3BlLnJlbW90ZUFwaUhhbmRsZXIoc3RyLCBodHRwQ2FuY2VsbGVyLnByb21pc2UpXG4gICAgICAgICAgLnRoZW4oaHR0cFN1Y2Nlc3NDYWxsYmFja0dlbihzdHIpKVxuICAgICAgICAgIC5jYXRjaChodHRwRXJyb3JDYWxsYmFjayk7XG5cbiAgICAgICAgLyogSUU4IGNvbXBhdGlibGVcbiAgICAgICAgc2NvcGUucmVtb3RlQXBpSGFuZGxlcihzdHIsIGh0dHBDYW5jZWxsZXIucHJvbWlzZSlcbiAgICAgICAgICBbJ3RoZW4nXShodHRwU3VjY2Vzc0NhbGxiYWNrR2VuKHN0cikpXG4gICAgICAgICAgWydjYXRjaCddKGh0dHBFcnJvckNhbGxiYWNrKTtcbiAgICAgICAgKi9cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2xlYXJSZXN1bHRzKCkge1xuICAgICAgICBzY29wZS5zaG93RHJvcGRvd24gPSBmYWxzZTtcbiAgICAgICAgc2NvcGUucmVzdWx0cyA9IFtdO1xuICAgICAgICBpZiAoZGQpIHtcbiAgICAgICAgICBkZC5zY3JvbGxUb3AgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGluaXRSZXN1bHRzKCkge1xuICAgICAgICBzY29wZS5zaG93RHJvcGRvd24gPSBkaXNwbGF5U2VhcmNoaW5nO1xuICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPSBzY29wZS5mb2N1c0ZpcnN0ID8gMCA6IC0xO1xuICAgICAgICBzY29wZS5yZXN1bHRzID0gW107XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGdldExvY2FsUmVzdWx0cyhzdHIpIHtcbiAgICAgICAgdmFyIGksIG1hdGNoLCBzLCB2YWx1ZSxcbiAgICAgICAgICAgIHNlYXJjaEZpZWxkcyA9IHNjb3BlLnNlYXJjaEZpZWxkcy5zcGxpdCgnLCcpLFxuICAgICAgICAgICAgbWF0Y2hlcyA9IFtdO1xuICAgICAgICBpZiAodHlwZW9mIHNjb3BlLnBhcnNlSW5wdXQoKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBzdHIgPSBzY29wZS5wYXJzZUlucHV0KCkoc3RyKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc2NvcGUubG9jYWxEYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcblxuICAgICAgICAgIGZvciAocyA9IDA7IHMgPCBzZWFyY2hGaWVsZHMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgIHZhbHVlID0gZXh0cmFjdFZhbHVlKHNjb3BlLmxvY2FsRGF0YVtpXSwgc2VhcmNoRmllbGRzW3NdKSB8fCAnJztcbiAgICAgICAgICAgIG1hdGNoID0gbWF0Y2ggfHwgKHZhbHVlLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHN0ci50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpID49IDApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgbWF0Y2hlc1ttYXRjaGVzLmxlbmd0aF0gPSBzY29wZS5sb2NhbERhdGFbaV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXRjaGVzO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjaGVja0V4YWN0TWF0Y2gocmVzdWx0LCBvYmosIHN0cil7XG4gICAgICAgIGlmICghc3RyKSB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICBmb3IodmFyIGtleSBpbiBvYmope1xuICAgICAgICAgIGlmKG9ialtrZXldLnRvTG93ZXJDYXNlKCkgPT09IHN0ci50b0xvd2VyQ2FzZSgpKXtcbiAgICAgICAgICAgIHNjb3BlLnNlbGVjdFJlc3VsdChyZXN1bHQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2VhcmNoVGltZXJDb21wbGV0ZShzdHIpIHtcbiAgICAgICAgLy8gQmVnaW4gdGhlIHNlYXJjaFxuICAgICAgICBpZiAoIXN0ciB8fCBzdHIubGVuZ3RoIDwgbWlubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzY29wZS5sb2NhbERhdGEpIHtcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbWF0Y2hlcztcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2NvcGUubG9jYWxTZWFyY2goKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgbWF0Y2hlcyA9IHNjb3BlLmxvY2FsU2VhcmNoKCkoc3RyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1hdGNoZXMgPSBnZXRMb2NhbFJlc3VsdHMoc3RyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgcHJvY2Vzc1Jlc3VsdHMobWF0Y2hlcywgc3RyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzY29wZS5yZW1vdGVBcGlIYW5kbGVyKSB7XG4gICAgICAgICAgZ2V0UmVtb3RlUmVzdWx0c1dpdGhDdXN0b21IYW5kbGVyKHN0cik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZ2V0UmVtb3RlUmVzdWx0cyhzdHIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHByb2Nlc3NSZXN1bHRzKHJlc3BvbnNlRGF0YSwgc3RyKSB7XG4gICAgICAgIHZhciBpLCBkZXNjcmlwdGlvbiwgaW1hZ2UsIHRleHQsIGZvcm1hdHRlZFRleHQsIGZvcm1hdHRlZERlc2M7XG5cbiAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHNjb3BlLnJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCByZXNwb25zZURhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChzY29wZS50aXRsZUZpZWxkICYmIHNjb3BlLnRpdGxlRmllbGQgIT09ICcnKSB7XG4gICAgICAgICAgICAgIHRleHQgPSBmb3JtYXR0ZWRUZXh0ID0gZXh0cmFjdFRpdGxlKHJlc3BvbnNlRGF0YVtpXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gJyc7XG4gICAgICAgICAgICBpZiAoc2NvcGUuZGVzY3JpcHRpb25GaWVsZCkge1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IGZvcm1hdHRlZERlc2MgPSBleHRyYWN0VmFsdWUocmVzcG9uc2VEYXRhW2ldLCBzY29wZS5kZXNjcmlwdGlvbkZpZWxkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW1hZ2UgPSAnJztcbiAgICAgICAgICAgIGlmIChzY29wZS5pbWFnZUZpZWxkKSB7XG4gICAgICAgICAgICAgIGltYWdlID0gZXh0cmFjdFZhbHVlKHJlc3BvbnNlRGF0YVtpXSwgc2NvcGUuaW1hZ2VGaWVsZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzY29wZS5tYXRjaENsYXNzKSB7XG4gICAgICAgICAgICAgIGZvcm1hdHRlZFRleHQgPSBmaW5kTWF0Y2hTdHJpbmcodGV4dCwgc3RyKTtcbiAgICAgICAgICAgICAgZm9ybWF0dGVkRGVzYyA9IGZpbmRNYXRjaFN0cmluZyhkZXNjcmlwdGlvbiwgc3RyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2NvcGUucmVzdWx0c1tzY29wZS5yZXN1bHRzLmxlbmd0aF0gPSB7XG4gICAgICAgICAgICAgIHRpdGxlOiBmb3JtYXR0ZWRUZXh0LFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZm9ybWF0dGVkRGVzYyxcbiAgICAgICAgICAgICAgaW1hZ2U6IGltYWdlLFxuICAgICAgICAgICAgICBvcmlnaW5hbE9iamVjdDogcmVzcG9uc2VEYXRhW2ldXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNjb3BlLnJlc3VsdHMgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzY29wZS5hdXRvTWF0Y2ggJiYgc2NvcGUucmVzdWx0cy5sZW5ndGggPT09IDEgJiZcbiAgICAgICAgICAgIGNoZWNrRXhhY3RNYXRjaChzY29wZS5yZXN1bHRzWzBdLFxuICAgICAgICAgICAgICB7dGl0bGU6IHRleHQsIGRlc2M6IGRlc2NyaXB0aW9uIHx8ICcnfSwgc2NvcGUuc2VhcmNoU3RyKSkge1xuICAgICAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHNjb3BlLnJlc3VsdHMubGVuZ3RoID09PSAwICYmICFkaXNwbGF5Tm9SZXN1bHRzKSB7XG4gICAgICAgICAgc2NvcGUuc2hvd0Ryb3Bkb3duID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2NvcGUuc2hvd0Ryb3Bkb3duID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaG93QWxsKCkge1xuICAgICAgICBpZiAoc2NvcGUubG9jYWxEYXRhKSB7XG4gICAgICAgICAgcHJvY2Vzc1Jlc3VsdHMoc2NvcGUubG9jYWxEYXRhLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2NvcGUucmVtb3RlQXBpSGFuZGxlcikge1xuICAgICAgICAgIGdldFJlbW90ZVJlc3VsdHNXaXRoQ3VzdG9tSGFuZGxlcignJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZ2V0UmVtb3RlUmVzdWx0cygnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2NvcGUub25Gb2N1c0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNjb3BlLmZvY3VzSW4pIHtcbiAgICAgICAgICBzY29wZS5mb2N1c0luKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1pbmxlbmd0aCA9PT0gMCAmJiAoIXNjb3BlLnNlYXJjaFN0ciB8fCBzY29wZS5zZWFyY2hTdHIubGVuZ3RoID09PSAwKSkge1xuICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IHNjb3BlLmZvY3VzRmlyc3QgPyAwIDogc2NvcGUuY3VycmVudEluZGV4O1xuICAgICAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IHRydWU7XG4gICAgICAgICAgc2hvd0FsbCgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5oaWRlUmVzdWx0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAobW91c2Vkb3duT24gJiZcbiAgICAgICAgICAgIChtb3VzZWRvd25PbiA9PT0gc2NvcGUuaWQgKyAnX2Ryb3Bkb3duJyB8fFxuICAgICAgICAgICAgIG1vdXNlZG93bk9uLmluZGV4T2YoJ2FuZ3Vjb21wbGV0ZScpID49IDApKSB7XG4gICAgICAgICAgbW91c2Vkb3duT24gPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGhpZGVUaW1lciA9ICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGlmIChzY29wZS5zZWFyY2hTdHIgJiYgc2NvcGUuc2VhcmNoU3RyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLnZhbChzY29wZS5zZWFyY2hTdHIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LCBCTFVSX1RJTUVPVVQpO1xuICAgICAgICAgIGNhbmNlbEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgICBpZiAoc2NvcGUuZm9jdXNPdXQpIHtcbiAgICAgICAgICAgIHNjb3BlLmZvY3VzT3V0KCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNjb3BlLm92ZXJyaWRlU3VnZ2VzdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChzY29wZS5zZWFyY2hTdHIgJiYgc2NvcGUuc2VhcmNoU3RyLmxlbmd0aCA+IDAgJiYgc2NvcGUuY3VycmVudEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICBoYW5kbGVPdmVycmlkZVN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5yZXNldEhpZGVSZXN1bHRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChoaWRlVGltZXIpIHtcbiAgICAgICAgICAkdGltZW91dC5jYW5jZWwoaGlkZVRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgc2NvcGUuaG92ZXJSb3cgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLnNlbGVjdFJlc3VsdCA9IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAvLyBSZXN0b3JlIG9yaWdpbmFsIHZhbHVlc1xuICAgICAgICBpZiAoc2NvcGUubWF0Y2hDbGFzcykge1xuICAgICAgICAgIHJlc3VsdC50aXRsZSA9IGV4dHJhY3RUaXRsZShyZXN1bHQub3JpZ2luYWxPYmplY3QpO1xuICAgICAgICAgIHJlc3VsdC5kZXNjcmlwdGlvbiA9IGV4dHJhY3RWYWx1ZShyZXN1bHQub3JpZ2luYWxPYmplY3QsIHNjb3BlLmRlc2NyaXB0aW9uRmllbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNjb3BlLmNsZWFyU2VsZWN0ZWQpIHtcbiAgICAgICAgICBzY29wZS5zZWFyY2hTdHIgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IHJlc3VsdC50aXRsZTtcbiAgICAgICAgfVxuICAgICAgICBjYWxsT3JBc3NpZ24ocmVzdWx0KTtcbiAgICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5pbnB1dENoYW5nZUhhbmRsZXIgPSBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgaWYgKHN0ci5sZW5ndGggPCBtaW5sZW5ndGgpIHtcbiAgICAgICAgICBjYW5jZWxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHN0ci5sZW5ndGggPT09IDAgJiYgbWlubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgc2NvcGUuc2VhcmNoaW5nID0gZmFsc2U7XG4gICAgICAgICAgc2hvd0FsbCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNjb3BlLmlucHV0Q2hhbmdlZCkge1xuICAgICAgICAgIHN0ciA9IHNjb3BlLmlucHV0Q2hhbmdlZChzdHIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgICB9O1xuXG4gICAgICAvLyBjaGVjayByZXF1aXJlZFxuICAgICAgaWYgKHNjb3BlLmZpZWxkUmVxdWlyZWRDbGFzcyAmJiBzY29wZS5maWVsZFJlcXVpcmVkQ2xhc3MgIT09ICcnKSB7XG4gICAgICAgIHJlcXVpcmVkQ2xhc3NOYW1lID0gc2NvcGUuZmllbGRSZXF1aXJlZENsYXNzO1xuICAgICAgfVxuXG4gICAgICAvLyBjaGVjayBtaW4gbGVuZ3RoXG4gICAgICBpZiAoc2NvcGUubWlubGVuZ3RoICYmIHNjb3BlLm1pbmxlbmd0aCAhPT0gJycpIHtcbiAgICAgICAgbWlubGVuZ3RoID0gcGFyc2VJbnQoc2NvcGUubWlubGVuZ3RoLCAxMCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNoZWNrIHBhdXNlIHRpbWVcbiAgICAgIGlmICghc2NvcGUucGF1c2UpIHtcbiAgICAgICAgc2NvcGUucGF1c2UgPSBQQVVTRTtcbiAgICAgIH1cblxuICAgICAgLy8gY2hlY2sgY2xlYXJTZWxlY3RlZFxuICAgICAgaWYgKCFzY29wZS5jbGVhclNlbGVjdGVkKSB7XG4gICAgICAgIHNjb3BlLmNsZWFyU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gY2hlY2sgb3ZlcnJpZGUgc3VnZ2VzdGlvbnNcbiAgICAgIGlmICghc2NvcGUub3ZlcnJpZGVTdWdnZXN0aW9ucykge1xuICAgICAgICBzY29wZS5vdmVycmlkZVN1Z2dlc3Rpb25zID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIGNoZWNrIHJlcXVpcmVkIGZpZWxkXG4gICAgICBpZiAoc2NvcGUuZmllbGRSZXF1aXJlZCAmJiBjdHJsKSB7XG4gICAgICAgIC8vIGNoZWNrIGluaXRpYWwgdmFsdWUsIGlmIGdpdmVuLCBzZXQgdmFsaWRpdGl0eSB0byB0cnVlXG4gICAgICAgIGlmIChzY29wZS5pbml0aWFsVmFsdWUpIHtcbiAgICAgICAgICBoYW5kbGVSZXF1aXJlZCh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBoYW5kbGVSZXF1aXJlZChmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2NvcGUuaW5wdXRUeXBlID0gYXR0cnMudHlwZSA/IGF0dHJzLnR5cGUgOiAndGV4dCc7XG5cbiAgICAgIC8vIHNldCBzdHJpbmdzIGZvciBcIlNlYXJjaGluZy4uLlwiIGFuZCBcIk5vIHJlc3VsdHNcIlxuICAgICAgc2NvcGUudGV4dFNlYXJjaGluZyA9IGF0dHJzLnRleHRTZWFyY2hpbmcgPyBhdHRycy50ZXh0U2VhcmNoaW5nIDogVEVYVF9TRUFSQ0hJTkc7XG4gICAgICBzY29wZS50ZXh0Tm9SZXN1bHRzID0gYXR0cnMudGV4dE5vUmVzdWx0cyA/IGF0dHJzLnRleHROb1Jlc3VsdHMgOiBURVhUX05PUkVTVUxUUztcbiAgICAgIGRpc3BsYXlTZWFyY2hpbmcgPSBzY29wZS50ZXh0U2VhcmNoaW5nID09PSAnZmFsc2UnID8gZmFsc2UgOiB0cnVlO1xuICAgICAgZGlzcGxheU5vUmVzdWx0cyA9IHNjb3BlLnRleHROb1Jlc3VsdHMgPT09ICdmYWxzZScgPyBmYWxzZSA6IHRydWU7XG5cbiAgICAgIC8vIHNldCBtYXggbGVuZ3RoIChkZWZhdWx0IHRvIG1heGxlbmd0aCBkZWF1bHQgZnJvbSBodG1sXG4gICAgICBzY29wZS5tYXhsZW5ndGggPSBhdHRycy5tYXhsZW5ndGggPyBhdHRycy5tYXhsZW5ndGggOiBNQVhfTEVOR1RIO1xuXG4gICAgICAvLyByZWdpc3RlciBldmVudHNcbiAgICAgIGlucHV0RmllbGQub24oJ2tleWRvd24nLCBrZXlkb3duSGFuZGxlcik7XG4gICAgICBpbnB1dEZpZWxkLm9uKCdrZXl1cCcsIGtleXVwSGFuZGxlcik7XG5cbiAgICAgIC8vIHNldCByZXNwb25zZSBmb3JtYXR0ZXJcbiAgICAgIHJlc3BvbnNlRm9ybWF0dGVyID0gY2FsbEZ1bmN0aW9uT3JJZGVudGl0eSgncmVtb3RlVXJsUmVzcG9uc2VGb3JtYXR0ZXInKTtcblxuICAgICAgLy8gc2V0IGlzU2Nyb2xsT25cbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3NzID0gZ2V0Q29tcHV0ZWRTdHlsZShkZCk7XG4gICAgICAgIGlzU2Nyb2xsT24gPSBjc3MubWF4SGVpZ2h0ICYmIGNzcy5vdmVyZmxvd1kgPT09ICdhdXRvJztcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgIHJlcXVpcmU6ICdeP2Zvcm0nLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgc2VsZWN0ZWRPYmplY3Q6ICc9JyxcbiAgICAgICAgZGlzYWJsZUlucHV0OiAnPScsXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJz0nLFxuICAgICAgICBsb2NhbERhdGE6ICc9JyxcbiAgICAgICAgbG9jYWxTZWFyY2g6ICcmJyxcbiAgICAgICAgcmVtb3RlVXJsUmVxdWVzdEZvcm1hdHRlcjogJz0nLFxuICAgICAgICByZW1vdGVVcmxSZXF1ZXN0V2l0aENyZWRlbnRpYWxzOiAnQCcsXG4gICAgICAgIHJlbW90ZVVybFJlc3BvbnNlRm9ybWF0dGVyOiAnPScsXG4gICAgICAgIHJlbW90ZVVybEVycm9yQ2FsbGJhY2s6ICc9JyxcbiAgICAgICAgcmVtb3RlQXBpSGFuZGxlcjogJz0nLFxuICAgICAgICBpZDogJ0AnLFxuICAgICAgICB0eXBlOiAnQCcsXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnQCcsXG4gICAgICAgIHJlbW90ZVVybDogJ0AnLFxuICAgICAgICByZW1vdGVVcmxEYXRhRmllbGQ6ICdAJyxcbiAgICAgICAgdGl0bGVGaWVsZDogJ0AnLFxuICAgICAgICBkZXNjcmlwdGlvbkZpZWxkOiAnQCcsXG4gICAgICAgIGltYWdlRmllbGQ6ICdAJyxcbiAgICAgICAgaW5wdXRDbGFzczogJ0AnLFxuICAgICAgICBwYXVzZTogJ0AnLFxuICAgICAgICBzZWFyY2hGaWVsZHM6ICdAJyxcbiAgICAgICAgbWlubGVuZ3RoOiAnQCcsXG4gICAgICAgIG1hdGNoQ2xhc3M6ICdAJyxcbiAgICAgICAgY2xlYXJTZWxlY3RlZDogJ0AnLFxuICAgICAgICBvdmVycmlkZVN1Z2dlc3Rpb25zOiAnQCcsXG4gICAgICAgIGZpZWxkUmVxdWlyZWQ6ICc9JyxcbiAgICAgICAgZmllbGRSZXF1aXJlZENsYXNzOiAnQCcsXG4gICAgICAgIGlucHV0Q2hhbmdlZDogJz0nLFxuICAgICAgICBhdXRvTWF0Y2g6ICdAJyxcbiAgICAgICAgZm9jdXNPdXQ6ICcmJyxcbiAgICAgICAgZm9jdXNJbjogJyYnLFxuICAgICAgICBmaWVsZFRhYmluZGV4OiAnQCcsXG4gICAgICAgIGlucHV0TmFtZTogJ0AnLFxuICAgICAgICBmb2N1c0ZpcnN0OiAnQCcsXG4gICAgICAgIHBhcnNlSW5wdXQ6ICcmJ1xuICAgICAgfSxcbiAgICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xuICAgICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgVEVNUExBVEVfVVJMO1xuICAgICAgfSxcbiAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uKHRFbGVtZW50KSB7XG4gICAgICAgIHZhciBzdGFydFN5bSA9ICRpbnRlcnBvbGF0ZS5zdGFydFN5bWJvbCgpO1xuICAgICAgICB2YXIgZW5kU3ltID0gJGludGVycG9sYXRlLmVuZFN5bWJvbCgpO1xuICAgICAgICBpZiAoIShzdGFydFN5bSA9PT0gJ3t7JyAmJiBlbmRTeW0gPT09ICd9fScpKSB7XG4gICAgICAgICAgdmFyIGludGVycG9sYXRlZEh0bWwgPSB0RWxlbWVudC5odG1sKClcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXHtcXHsvZywgc3RhcnRTeW0pXG4gICAgICAgICAgICAucmVwbGFjZSgvXFx9XFx9L2csIGVuZFN5bSk7XG4gICAgICAgICAgdEVsZW1lbnQuaHRtbChpbnRlcnBvbGF0ZWRIdG1sKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGluaztcbiAgICAgIH1cbiAgICB9O1xuICB9XSk7XG5cblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogbm9kZV9tb2R1bGVzL2FuZ3Vjb21wbGV0ZS1hbHQvYW5ndWNvbXBsZXRlLWFsdC5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IG1haW4gPSBhbmd1bGFyLm1vZHVsZSgnbWFpbicsIFsndWkucm91dGVyJ10pO1xyXG5cclxubWFpblxyXG4gICAgLmNvbXBvbmVudCgnbGVmdFNpZGVNZW51JywgcmVxdWlyZSgnLi9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQvbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdkYXl0aW1lQ2hvb3NlJywgcmVxdWlyZSgnLi9kYXl0aW1lLWNob29zZS1jb21wb25lbnQvZGF5dGltZS1jaG9vc2UtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdob21lJywgcmVxdWlyZSgnLi9ob21lLXBhZ2UtbW9kdWxlL2hvbWUtcGFnZS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ3ZpZXcnLCByZXF1aXJlKCcuL3ZpZXctY29tcG9uZW50L3ZpZXctY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdtb2RhbCcsIHJlcXVpcmUoJy4vbW9kYWwtd2luZG93LWNvbXBvbmVudC9tb2RhbC13aW5kb3ctY29tcG9uZW50JykpO1xyXG5cclxubWFpbi5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xyXG4gICAgJHN0YXRlUHJvdmlkZXJcclxuICAgICAgICAuc3RhdGUoJ2hvbWUnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9ob21lJyxcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8aG9tZT48L2hvbWU+J1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKCdkaWFyeScsIHtcclxuICAgICAgICAgICAgdXJsOiAnL2RpYXJ5LzpkYXl0aW1lJyxcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGF5LXRpbWUgYmFzZT1cIiRjdHJsLmJhc2VcIiBkYXl0aW1lcz1cIiRjdHJsLnZpZXdEYXRhLmRheVRpbWVzXCIgYWRkPVwiJGN0cmwuYWRkRm9vZChkYXlUaW1lSWQsIGZvb2QpXCIgcmVtb3ZlPVwiJGN0cmwucmVtb3ZlRm9vZChkYXlUaW1lSWQsIGZvb2QpXCIgZGF5LXRpbWUtbGltaXRzPVwiJGN0cmwudmlld0RhdGEubGltaXRzRGF0YVwiPjwvZGF5LXRpbWU+J1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKCdzZXR0aW5ncycsIHtcclxuICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzJyxcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8bWVudT48L21lbnU+J1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKCdyZXN1bHQnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9yZXN1bHQnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxyZXN1bHQgcmVzdWx0PVwiJGN0cmwudmlld0RhdGEucmVzdWx0RmluYWxcIj48L3Jlc3VsdD4nXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoJ3RhYmxlcycsIHtcclxuICAgICAgICAgICAgdXJsOiAnL3RhYmxlcycsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPHRhYmxlcyBmb29kcy1vYmpzPVwiJGN0cmwudmlld0RhdGEudGFibGVzRGF0YS5mb29kc09ianNcIiBteS1mb29kcz1cIiRjdHJsLnZpZXdEYXRhLnRhYmxlc0RhdGEubXlGb29kc1wiIHJlbW92ZS1teS1mb29kPVwiJGN0cmwucmVtb3ZlTXlGb29kKG5hbWUpXCI+PC90YWJsZXM+J1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKCdhZGQtZm9vZCcsIHtcclxuICAgICAgICAgICAgdXJsOiAnL2FkZC1mb29kJyxcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8dGFibGUtYWRkIG15LWZvb2RzPVwiJGN0cmwudmlld0RhdGEudGFibGVzRGF0YS5teUZvb2RzXCIgcmVtb3ZlLW15LWZvb2Q9XCIkY3RybC5yZW1vdmVNeUZvb2QobmFtZSlcIiBhZGQtbXktZm9vZD1cIiRjdHJsLmFkZE15Rm9vZChuYW1lLCB2YWx1ZXMpXCI+PC90YWJsZS1hZGQ+J1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKCdzYXZlJywge1xyXG4gICAgICAgICAgICB1cmw6ICcvc2F2ZScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPHNhdmUtbWVudSBkYXktdGltZXMtZGF0YT1cIiRjdHJsLnZpZXdEYXRhLmRheVRpbWVzXCIgcmVzdWx0PVwiJGN0cmwudmlld0RhdGEucmVzdWx0RmluYWxcIj48L3NhdmUtbWVudT4nXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnaG9tZScpO1xyXG59KTtcclxuXHJcbm1haW4ucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsIGFjdGl2ZUNsYXNzU2VydmljZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMpIHtcclxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdWNjZXNzJywgKCkgPT4ge1xyXG4gICAgICAgIHZhciBjbGFzc05hbWUgPSAkc3RhdGUuY3VycmVudC5uYW1lID09PSAnZGlhcnknPyAkc3RhdGVQYXJhbXMuZGF5dGltZSA6ICRzdGF0ZS5jdXJyZW50Lm5hbWU7XHJcbiAgICAgICAgYWN0aXZlQ2xhc3NTZXJ2aWNlLnNldENsYXNzTmFtZShjbGFzc05hbWUpO1xyXG4gICAgfSlcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1haW47XHJcblxyXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvbWFpbi1tb2R1bGUvaW5kZXguanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBsZWZ0U2lkZU1lbnVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvbGVmdC1zaWRlLW1lbnUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgbGVmdFNpZGVNZW51ID0ge1xyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzdGF0ZSwgYWN0aXZlQ2xhc3NTZXJ2aWNlLCBtb2RhbCkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlQ2xhc3MgPSBhY3RpdmVDbGFzc1NlcnZpY2UuZ2V0Q2xhc3NOYW1lO1xyXG5cclxuICAgICAgICB0aGlzLm1lbnVJdGVtcyA9IFtcclxuICAgICAgICAgICAge2NsYXNzTmFtZTogJ2hvbWUnLCB0b29sdGlwOiAn0J3QsCDQs9C70LDQstC90YPRjicsIHRvb2x0aXBTaG93OiBmYWxzZX0sXHJcbiAgICAgICAgICAgIHtjbGFzc05hbWU6ICdzZXR0aW5ncycsIHRvb2x0aXA6ICfQndCw0YHRgtGA0L7QudC60LgnLCB0b29sdGlwU2hvdzogZmFsc2V9LFxyXG4gICAgICAgICAgICB7Y2xhc3NOYW1lOiAncmVzdWx0JywgdG9vbHRpcDogJ9CY0YLQvtCzINC00L3RjycsIHRvb2x0aXBTaG93OiBmYWxzZX0sXHJcbiAgICAgICAgICAgIHtjbGFzc05hbWU6ICdzYXZlJywgdG9vbHRpcDogJ9Ch0L7RhdGA0LDQvdC40YLRjCcsIHRvb2x0aXBTaG93OiBmYWxzZX0sXHJcbiAgICAgICAgICAgIHtjbGFzc05hbWU6ICd0YWJsZXMnLCB0b29sdGlwOiAn0KLQsNCx0LvQuNGG0YsnLCB0b29sdGlwU2hvdzogZmFsc2V9LFxyXG4gICAgICAgICAgICB7Y2xhc3NOYW1lOiAnYWRkLWZvb2QnLCB0b29sdGlwOiAn0JTQvtCx0LDQstC40YLRjCDQtdC00YMg0LIg0YLQsNCx0LvQuNGG0YMnLCB0b29sdGlwU2hvdzogZmFsc2V9XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgdGhpcy50b2dnbGUgPSBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmNsYXNzTmFtZSA9PT0gdGhpcy5hY3RpdmVDbGFzcykgcmV0dXJuO1xyXG4gICAgICAgICAgICBpdGVtLnRvb2x0aXBTaG93ID0gIWl0ZW0udG9vbHRpcFNob3c7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbihjbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgKCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IG51bWIgPSBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIDMpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tJY29uQ2xhc3NOYW1lID0gJ2ljb24nICsgbnVtYjtcclxuICAgICAgICB9KSgpXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGxlZnRTaWRlTWVudVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGxlZnRTaWRlTWVudTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvbWFpbi1tb2R1bGUvbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50L2xlZnQtc2lkZS1tZW51LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwibGVmdC1zaWRlLW1lbnVcXFwiPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJ0by1hbm90aGVyLWRlc2lnblxcXCIgbmctY2xhc3M9XFxcIiRjdHJsLmJhY2tJY29uQ2xhc3NOYW1lXFxcIj48YSBocmVmPVxcXCIuLi9maXJzdC1kZXNpZ24vXFxcIiBpZD1cXFwiZ29cXFwiPjwvYT48L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwibWVudS1pdGVtc1xcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtZW51LWl0ZW1cXFwiIG5nLXJlcGVhdD1cXFwiaXRlbSBpbiAkY3RybC5tZW51SXRlbXNcXFwiIG5nLWNsYXNzPVxcXCJbaXRlbS5jbGFzc05hbWUsICRjdHJsLmFjdGl2ZUNsYXNzKCldXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2V0U3RhdGUoaXRlbS5jbGFzc05hbWUpXFxcIiBuZy1tb3VzZWVudGVyPVxcXCIkY3RybC50b2dnbGUoaXRlbSlcXFwiIG5nLW1vdXNlbGVhdmU9XFxcIiRjdHJsLnRvZ2dsZShpdGVtKVxcXCI+XFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidG9vbHRpcFxcXCIgbmctaWY9XFxcIml0ZW0udG9vbHRpcFNob3dcXFwiPnt7aXRlbS50b29sdGlwfX08L2Rpdj5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cXHJcXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwibGVmdC1zaWRlLW1lbnUtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvbWFpbi1tb2R1bGUvbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50L3RlbXBsYXRlL2xlZnQtc2lkZS1tZW51LXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSA1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBkYXl0aW1lQ2hvb3NlVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL2RheXRpbWUtY2hvb3NlLXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IGRheXRpbWVDaG9vc2UgPSB7XHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc3RhdGUsIGFjdGl2ZUNsYXNzU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuZGF5dGltZXMgPSBbXHJcbiAgICAgICAgICAgIHt0aW1lOiAn0JfQsNCy0YLRgNCw0LonLCBjbGFzc05hbWU6ICdicmVha2Zhc3QnLCBzdGF0ZTogJ2JyZWFrZmFzdCd9LFxyXG4gICAgICAgICAgICB7dGltZTogJ9Cf0LXRgNC10LrRg9GBIDEnLCBjbGFzc05hbWU6IGZhbHNlLCBzdGF0ZTogJ2ZpcnN0LXNuYWNrJ30sXHJcbiAgICAgICAgICAgIHt0aW1lOiAn0J7QsdC10LQnLCBjbGFzc05hbWU6IGZhbHNlLCBzdGF0ZTogJ2Rpbm5lcid9LFxyXG4gICAgICAgICAgICB7dGltZTogJ9Cf0LXRgNC10LrRg9GBIDInLCBjbGFzc05hbWU6IGZhbHNlLCBzdGF0ZTogJ3NlY29uZC1zbmFjayd9LFxyXG4gICAgICAgICAgICB7dGltZTogJ9Cj0LbQuNC9JywgY2xhc3NOYW1lOiBmYWxzZSwgc3RhdGU6ICdldmVuaW5nLW1lYWwnfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHRoaXMuYWN0aXZlQ2xhc3MgPSBhY3RpdmVDbGFzc1NlcnZpY2UuZ2V0Q2xhc3NOYW1lO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN0YXRlID0gZnVuY3Rpb24oZGF5dGltZSkge1xyXG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2RpYXJ5Jywge2RheXRpbWU6IGRheXRpbWUuc3RhdGV9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogZGF5dGltZUNob29zZVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRheXRpbWVDaG9vc2U7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL21haW4tbW9kdWxlL2RheXRpbWUtY2hvb3NlLWNvbXBvbmVudC9kYXl0aW1lLWNob29zZS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcImRheXRpbWUtY2hvb3NlXFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiZGF5dGltZVxcXCIgbmctcmVwZWF0PVxcXCJkYXl0aW1lIGluICRjdHJsLmRheXRpbWVzXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2V0U3RhdGUoZGF5dGltZSlcXFwiIG5nLWNsYXNzPVxcXCJbJGN0cmwuYWN0aXZlQ2xhc3MoKSwgZGF5dGltZS5zdGF0ZV1cXFwiPnt7IGRheXRpbWUudGltZSB9fTwvZGl2PlxcclxcbjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJkYXl0aW1lLWNob29zZS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC9tYWluLW1vZHVsZS9kYXl0aW1lLWNob29zZS1jb21wb25lbnQvdGVtcGxhdGUvZGF5dGltZS1jaG9vc2UtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGhvbWVQYWdlVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL2hvbWUtcGFnZS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBob21lUGFnZSA9IHtcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCR0aW1lb3V0KSB7XHJcbiAgICAgICAgdGhpcy5jbGFzc0RheXRpbWUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNsYXNzTWVudSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkdGltZW91dCgoKSA9PiB0aGlzLmNsYXNzRGF5dGltZSA9IHRydWUsIDApO1xyXG4gICAgICAgICR0aW1lb3V0KCgpID0+IHRoaXMuY2xhc3NNZW51ID0gdHJ1ZSwgMTAwMCk7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGhvbWVQYWdlVGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gaG9tZVBhZ2U7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL21haW4tbW9kdWxlL2hvbWUtcGFnZS1tb2R1bGUvaG9tZS1wYWdlLWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwiaG9tZS1wYWdlXFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiZGF5dGltZS1zZWxlY3QtdG9vbHRpcFxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlJzogJGN0cmwuY2xhc3NEYXl0aW1lfVxcXCI+0JLRi9Cx0LXRgNC10YLQtSDQstGA0LXQvNGPINC00L3RjyxcXHJcXG4gICAgICAgINGH0YLQvtCx0Ysg0L/RgNC40YHRgtGD0L/QuNGC0Ywg0Log0LfQsNC/0L7Qu9C90LXQvdC40Y4g0LTQvdC10LLQvdC40LrQsDwvZGl2PlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJob21lLWhlYWRlclxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJsZWZ0LWxpbmVcXFwiPjwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwicmlnaHQtbGluZVxcXCI+PC9kaXY+XFxyXFxuICAgICAgICA8aDIgbmctY2xpY2s9XFxcIiRjdHJsLnRvZ2dsZSgpXFxcIj7QlNC90LXQstC90LjQuiDQv9C40YLQsNC90LjRjzwvaDI+XFxyXFxuICAgIDwvZGl2PlxcclxcblxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJtZW51LXNlbGVjdC10b29sdGlwXFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUnOiAkY3RybC5jbGFzc01lbnV9XFxcIj7Qp9GC0L7QsdGLINGD0YHRgtCw0L3QvtCy0LjRgtGMINC70LjQvNC40YLRiyxcXHJcXG4gICAgICAgINGB0L7RhdGA0LDQvdC40YLRjCDQtNCw0L3QvdGL0LUsINC00L7QsdCw0LLQuNGC0Ywg0LXQtNGDINC70LjQsdC+XFxyXFxuICAgICAgICDQv9GA0L7RgdC80L7RgtGA0LXRgtGMINC40YLQvtCzINC4INGC0LDQsdC70LjRhtGLINCy0L7RgdC/0L7Qu9GM0LfRg9C50YLQtdGB0Ywg0LzQtdC90Y48L2Rpdj5cXHJcXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwiaG9tZS1wYWdlLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL21haW4tbW9kdWxlL2hvbWUtcGFnZS1tb2R1bGUvdGVtcGxhdGUvaG9tZS1wYWdlLXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSA5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCB2aWV3VGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL3ZpZXctdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgdmlldyA9IHtcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIChkYXRhU2VydmljZSwgbGltaXRzU2VydmljZSwgJHdpbmRvdywgbW9kYWwsIGRpZXRDaG9vc2UpIHtcclxuICAgICAgICBjb25zdCBlbXB0eSA9IHtcclxuICAgICAgICAgICAgZW1wdHk6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWU6ICctLS0tLS0tLS0nLFxyXG4gICAgICAgICAgICBwb3J0aW9uOiAnLS0tJyxcclxuICAgICAgICAgICAgY2FyYm9oeWQ6ICctLS0nLFxyXG4gICAgICAgICAgICBwcm90OiAnLS0tJyxcclxuICAgICAgICAgICAgZmF0OiAnLS0tJyxcclxuICAgICAgICAgICAga2FsbDogJy0tLSdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmJhc2UgPSBkYXRhU2VydmljZS5iYXNlO1xyXG4gICAgICAgIHRoaXMudmlld0RhdGEgPSB7XHJcbiAgICAgICAgICAgIGxpbWl0c0RhdGE6IGxpbWl0c1NlcnZpY2UubGltaXRzRGF0YSxcclxuICAgICAgICAgICAgdGFibGVzRGF0YToge30sXHJcbiAgICAgICAgICAgIHJlc3VsdEZpbmFsOiB7XHJcbiAgICAgICAgICAgICAgICBjYXJib2h5ZDoge25hbWU6ICfQo9Cz0LTQtdCy0L7QtNGLJywgdmFsdWU6IDB9LFxyXG4gICAgICAgICAgICAgICAgcHJvdDoge25hbWU6ICfQn9GA0L7RgtC10LjQvdGLJywgdmFsdWU6IDB9LFxyXG4gICAgICAgICAgICAgICAgZmF0OiB7bmFtZTogJ9CW0LjRgNGLJywgdmFsdWU6IDB9LFxyXG4gICAgICAgICAgICAgICAga2FsbDoge25hbWU6ICfQmtCw0LvQvtGA0LjQuCcsIHZhbHVlOiAwfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZGF0YVNlcnZpY2UuZ2V0VGFibGVEYXRhKClcclxuICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmlld0RhdGEudGFibGVzRGF0YS5mb29kc09ianMgPSBkYXRhO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICBkYXRhU2VydmljZS5nZXREYXlUaW1lc0RhdGEoKVxyXG4gICAgICAgICAgICAudGhlbigoZGF0YSkgPT4gdGhpcy52aWV3RGF0YS5kYXlUaW1lcyA9IGRhdGEuZGF0YSk7XHJcblxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5jb21wYXJlID0gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMudmlld0RhdGEubGltaXRzRGF0YS5saW1pdHMpIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKHRoaXMudmlld0RhdGEubGltaXRzRGF0YS5saW1pdHNbXCLQmNGC0L7Qs1wiXVtrZXldIDwgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbFtrZXldKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5hZGRGb29kID0gZnVuY3Rpb24gKGRheVRpbWVJZCwgZm9vZCkge1xyXG4gICAgICAgICAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMudmlld0RhdGEuZGF5VGltZXNbZGF5VGltZUlkXS5mb29kcztcclxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb25bMF0uZW1wdHkpIGNvbGxlY3Rpb24uc3BsaWNlKDAsIDEpO1xyXG5cclxuICAgICAgICAgICAgY29sbGVjdGlvbi5wdXNoKGZvb2QpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGNSZXN1bHQoZGF5VGltZUlkLCBmb29kLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCkgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnX2xhc3RTYXZlSWQnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZUZvb2QgPSBmdW5jdGlvbiAoZGF5VGltZUlkLCBmb29kKSB7XHJcbiAgICAgICAgICAgIGxldCBjb2xsZWN0aW9uID0gdGhpcy52aWV3RGF0YS5kYXlUaW1lc1tkYXlUaW1lSWRdLmZvb2RzO1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBjb2xsZWN0aW9uLmluZGV4T2YoZm9vZCk7XHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb24uc3BsaWNlKGluZGV4LCAxKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9uLmxlbmd0aCA9PT0gMCkgY29sbGVjdGlvbi5wdXNoKGVtcHR5KTtcclxuICAgICAgICAgICAgdGhpcy5jYWxjUmVzdWx0KGRheVRpbWVJZCwgZm9vZCwgZmFsc2UpO1xyXG4gICAgICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuX2xhc3RTYXZlSWQpICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ19sYXN0U2F2ZUlkJyk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuY2FsY1Jlc3VsdCA9IGZ1bmN0aW9uIChkYXlUaW1lSWQsIGZvb2QsIGJvb2wpIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHRoaXMudmlld0RhdGEuZGF5VGltZXNbZGF5VGltZUlkXS5yZXN1bHQ7XHJcbiAgICAgICAgICAgIGlmIChib29sKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gKz0gZm9vZFtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld0RhdGEucmVzdWx0RmluYWxba2V5XS52YWx1ZSArPSBmb29kW2tleV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gLT0gZm9vZFtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld0RhdGEucmVzdWx0RmluYWxba2V5XS52YWx1ZSAtPSBmb29kW2tleV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZU15Rm9vZCA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcblxyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy52aWV3RGF0YS50YWJsZXNEYXRhLm15Rm9vZHNbbmFtZV07XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLm15Rm9vZHMgPSBKU09OLnN0cmluZ2lmeSh0aGlzLnZpZXdEYXRhLnRhYmxlc0RhdGEubXlGb29kcyk7XHJcblxyXG4gICAgICAgICAgICBkYXRhU2VydmljZS5yZW1vdmVGcm9tQmFzZShuYW1lKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmFkZE15Rm9vZCA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZXMpIHtcclxuICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy52aWV3RGF0YS50YWJsZXNEYXRhLm15Rm9vZHMpIHRoaXMudmlld0RhdGEudGFibGVzRGF0YS5teUZvb2RzID0ge307XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZpZXdEYXRhLnRhYmxlc0RhdGEubXlGb29kc1tuYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFjb25maXJtKCfQn9C10YDQtdC30LDQv9C40YHQsNGC0Ywg0YHRg9GJ0LXRgdGC0LLRg9GO0YnQuNC5INC/0YDQvtC00YPQutGCPycpKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBkYXRhU2VydmljZS5yZW1vdmVGcm9tQmFzZShuYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnRhYmxlc0RhdGEubXlGb29kc1tuYW1lXSA9IHZhbHVlcztcclxuICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UubXlGb29kcyA9IEpTT04uc3RyaW5naWZ5KHRoaXMudmlld0RhdGEudGFibGVzRGF0YS5teUZvb2RzKTtcclxuXHJcbiAgICAgICAgICAgIGRhdGFTZXJ2aWNlLmFkZFRvQmFzZShuYW1lLCB2YWx1ZXMpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vTFNcclxuXHJcbiAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLm15Rm9vZHMpIHRoaXMudmlld0RhdGEudGFibGVzRGF0YS5teUZvb2RzID0gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5teUZvb2RzKTtcclxuXHJcblxyXG5cclxuICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZURhdGEpIHtcclxuICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQl9Cw0LPRgNGD0LfQutCwJywgbWVzc2FnZTogJ9CX0LDQs9GA0YPQt9C40YLRjCDRgdC+0YXRgNCw0L3QtdC90L3Ri9C1INC00LDQvdC90YvQtT8nfSwgJ2NvbmZpcm0nKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlRGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5kYXlUaW1lcyA9IGRhdGEuZGF5c0RhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbCA9IGRhdGEucmVzdWx0RmluYWw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRpZXRDaG9vc2UubG9hZExpbWl0cygpXHJcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQl9Cw0LPRgNGD0LfQutCwJywgbWVzc2FnZTogJ9Cj0LTQsNC70LjRgtGMINGB0L7RhdGA0LDQvdC10L3QvdGL0LUg0LTQsNC90L3Ri9C1Pyd9LCAnY29uZmlybScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3NhdmVEYXRhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdzYXZlZExpbWl0cycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IHZpZXdUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9tYWluLW1vZHVsZS92aWV3LWNvbXBvbmVudC92aWV3LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGxlZnQtc2lkZS1tZW51PjwvbGVmdC1zaWRlLW1lbnU+XFxyXFxuPGRheXRpbWUtY2hvb3NlPjwvZGF5dGltZS1jaG9vc2U+XFxyXFxuXFxyXFxuPGRpdiBjbGFzcz1cXFwibWFpbi12aWV3XFxcIiB1aS12aWV3PjwvZGl2Plxcclxcblxcclxcbjxtb2RhbD48L21vZGFsPlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJ2aWV3LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL21haW4tbW9kdWxlL3ZpZXctY29tcG9uZW50L3RlbXBsYXRlL3ZpZXctdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDExXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBtb2RhbFRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9tb2RhbC10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBtb2RhbCA9IHtcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKG1vZGFsKSB7XHJcbiAgICAgICAgdGhpcy5tb2RhbFZpZXdEYXRhID0gbW9kYWwubW9kYWxWaWV3RGF0YTtcclxuICAgICAgICB0aGlzLmNoZWNrT3BlbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kYWwuZ2V0U3RhdGUoKSA9PT0gJ29wZW4nO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5jaGVja1R5cGUgPSBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2RhbC5nZXRUeXBlKCkgPT09IHR5cGU7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBtb2RhbC5nZXRUeXBlO1xyXG5cclxuICAgICAgICB0aGlzLmNsb3NlID0gbW9kYWwuY2xvc2U7XHJcblxyXG4gICAgICAgIHRoaXMuc3RvcFByb3BhZ2F0aW9uID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogbW9kYWxUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBtb2RhbDtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvbWFpbi1tb2R1bGUvbW9kYWwtd2luZG93LWNvbXBvbmVudC9tb2RhbC13aW5kb3ctY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJtb2RhbC1iYWNrZ3JvdW5kXFxcIiBuZy1pZj1cXFwiJGN0cmwuY2hlY2tPcGVuKClcXFwiPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJ3aW5kb3cgYW5cXFwiIG5nLWlmPVxcXCIkY3RybC5jaGVja09wZW4oKVxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0aXRsZVxcXCI+e3sgJGN0cmwubW9kYWxWaWV3RGF0YS5kYXRhLnRpdGxlIH19PC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtZXNzYWdlXFxcIj57eyAkY3RybC5tb2RhbFZpZXdEYXRhLmRhdGEubWVzc2FnZSB9fTwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYnV0dG9ucyBncm91cFxcXCI+XFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29uZmlybVxcXCIgbmctaWY9XFxcIiRjdHJsLmNoZWNrVHlwZSgnY29uZmlybScpXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwicmVqZWN0XFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuY2xvc2UoKVxcXCI+0J7RgtC80LXQvdCwPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIm9rXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuY2xvc2UodHJ1ZSlcXFwiPk9LPC9kaXY+XFxyXFxuICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYWxlcnRcXFwiIG5nLWlmPVxcXCIkY3RybC5jaGVja1R5cGUoJ2FsZXJ0JylcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5jbG9zZSgpXFxcIj7Ql9Cw0LrRgNGL0YLRjDwvZGl2PlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjbG9zZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmNsb3NlKClcXFwiPng8L2Rpdj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcIm1vZGFsLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL21haW4tbW9kdWxlL21vZGFsLXdpbmRvdy1jb21wb25lbnQvdGVtcGxhdGUvbW9kYWwtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDEzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBkaWFyeU1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdkaWFyeScsIFtdKTtcclxuXHJcbmRpYXJ5TW9kdWxlXHJcbiAgICAuY29tcG9uZW50KCdtZW51JywgcmVxdWlyZSgnLi9tZW51L21lbnUtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdkYXlUaW1lJywgcmVxdWlyZSgnLi9kYXktdGltZS9kYXktdGltZS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ2Zvb2QnLCByZXF1aXJlKCcuL2Zvb2QvZm9vZC1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ3NhdmVNZW51JywgcmVxdWlyZSgnLi9zYXZlLW1lbnUvc2F2ZS1tZW51LWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgncmVzdWx0JywgcmVxdWlyZSgnLi9yZXN1bHQtY29tcG9uZW50L3Jlc3VsdC1jb21wb25lbnQnKSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRpYXJ5TW9kdWxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvaW5kZXguanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgbWVudVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9tZW51LXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IG1lbnUgPSB7XHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHdpbmRvdywgZGlldENob29zZSkge1xyXG4gICAgICAgIHRoaXMuZGlldHMgPSBkaWV0Q2hvb3NlLmRpZXRzO1xyXG4gICAgICAgIHRoaXMuc2V0RGlldCA9IGRpZXRDaG9vc2Uuc2V0RGlldDtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuY2xhc3NOYW1lID0gZGlldENob29zZS5jbGFzc05hbWU7XHJcbiAgICAgICAgdGhpcy5zZXRDbGFzc05hbWUgPSBkaWV0Q2hvb3NlLnNldENsYXNzTmFtZTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuc2V0TGltaXRzID0gZGlldENob29zZS5zZXRMaW1pdHM7XHJcbiAgICAgICAgdGhpcy5yZXNldENob29zZSA9IGRpZXRDaG9vc2UucmVzZXRDaG9vc2U7XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IG1lbnVUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBtZW51O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvbWVudS9tZW51LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBpZD1cXFwibWVudVxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImRpZXQtbWVudVxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJkaWV0LXRpdHRsZVxcXCI+0JLQuNC0INC00LjQtdGC0Ys6PC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJkaWV0LWNob29zZVxcXCI+XFxyXFxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImRpZXRcXFwiIG5nLWNsYXNzPVxcXCJ7YWN0aXZlOiAkY3RybC5kaWV0cy5wcm90ZWluc31cXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zZXREaWV0KCdwcm90ZWlucycpXFxcIj7QktGL0YHQvtC60L7Qv9GA0L7RgtC10LjQvdC+0LLQsNGPINC60L7QvNCx0LjQvdCw0YbQuNGPINC30LDQvNC10L08L3NwYW4+XFxyXFxuICAgICAgICAgICAgPGJyPlxcclxcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJkaWV0XFxcIiBuZy1jbGFzcz1cXFwie2FjdGl2ZTogJGN0cmwuZGlldHMuY2FyYm9oeWRyYXRlc31cXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zZXREaWV0KCdjYXJib2h5ZHJhdGVzJylcXFwiPtCS0YvRgdC+0LrQvtGD0LPQu9C10LLQvtC00L3QsNGPINC60L7QvNCx0LjQvdCw0YbQuNGPINC30LDQvNC10L08L3NwYW4+XFxyXFxuICAgICAgICA8L2Rpdj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcInBoYXNlLW1lbnVcXFwiPlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwicGhhc2UtdGl0dGxlXFxcIj7QktGL0LHQtdGA0LXRgtC1INCS0LDRiNGDINGE0LDQt9GDOjwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwicGhhc2UtY2hvb3NlXFxcIj5cXHJcXG5cXHJcXG4gICAgICAgICAgICA8ZGl2IG5nLWNsYXNzPVxcXCIkY3RybC5jbGFzc05hbWUubmFtZVxcXCIgY2xhc3M9XFxcImZpcnN0LXBoYXNlXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2V0Q2xhc3NOYW1lKDEpXFxcIj48c3Bhbj4tPC9zcGFuPiAxIDxzcGFuPi08L3NwYW4+PC9kaXY+XFxyXFxuICAgICAgICAgICAgPGRpdiBuZy1jbGFzcz1cXFwiJGN0cmwuY2xhc3NOYW1lLm5hbWVcXFwiIGNsYXNzPVxcXCJzZWNvbmQtcGhhc2VcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zZXRDbGFzc05hbWUoMilcXFwiPjxzcGFuPi08L3NwYW4+IDIgPHNwYW4+LTwvc3Bhbj48L2Rpdj5cXHJcXG4gICAgICAgICAgICA8ZGl2IG5nLWNsYXNzPVxcXCIkY3RybC5jbGFzc05hbWUubmFtZVxcXCIgY2xhc3M9XFxcInRoaXJkLXBoYXNlXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2V0Q2xhc3NOYW1lKDMpXFxcIj48c3Bhbj4tPC9zcGFuPiAzIDxzcGFuPi08L3NwYW4+PC9kaXY+XFxyXFxuXFxyXFxuICAgICAgICA8L2Rpdj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuXFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImNsZWFyLWxpbWl0c1xcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnJlc2V0Q2hvb3NlKClcXFwiPtCh0LHRgNC+0YHQuNGC0Ywg0LvQuNC80LjRgtGLPC9kaXY+XFxyXFxuPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcIm1lbnUtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvZGlhcnktbW9kdWxlL21lbnUvdGVtcGxhdGUvbWVudS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMTZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGRheVRpbWVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvZGF5LXRpbWUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgZGF5VGltZSA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgYmFzZTogJzwnLFxyXG4gICAgICAgIGRheXRpbWVzOiAnPCcsXHJcbiAgICAgICAgYWRkOiAnJicsXHJcbiAgICAgICAgcmVtb3ZlOiAnJicsXHJcbiAgICAgICAgZGF5VGltZUxpbWl0czogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oZGF0YVNlcnZpY2UsIHZhbGlkYXRpb25TZXJ2aWNlLCBjYWxjdWxhdGlvblNlcnZpY2UsICRzY29wZSwgJHN0YXRlUGFyYW1zLCBpbmRleFNlcnZpY2UpIHtcclxuICAgICAgICBsZXQgZGF5dGltZSA9ICRzdGF0ZVBhcmFtcy5kYXl0aW1lO1xyXG4gICAgICAgIHRoaXMuaW5kZXggPSBpbmRleFNlcnZpY2UoZGF5dGltZSk7XHJcblxyXG4gICAgICAgIHZhciB0ZXh0ID0gJyc7XHJcbiAgICAgICAgdGhpcy5vbklucHV0ID0gZnVuY3Rpb24oc3RyKSB7XHJcbiAgICAgICAgICAgIHRleHQgPSBzdHI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5saW1pdHMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF5VGltZUxpbWl0cy5saW1pdHMpIHJldHVybiB0aGlzLmRheVRpbWVMaW1pdHMubGltaXRzW3RoaXMuZGF5dGltZXNbdGhpcy5pbmRleF0uZGF5VGltZV07XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jb21wYXJlID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5saW1pdHMoKSkgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5saW1pdHMoKVtrZXldIDwgdGhpcy5kYXl0aW1lc1t0aGlzLmluZGV4XS5yZXN1bHRba2V5XSkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVGb29kID0gZnVuY3Rpb24oZm9vZCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZSh7ZGF5VGltZUlkOiB0aGlzLmluZGV4LCBmb29kOiBmb29kfSlcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEZvb2QgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHBvcnRpb24gPSBNYXRoLnJvdW5kKCt0aGlzLnBvcnRpb24pO1xyXG4gICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZm9vZE5hbWUgPyB0aGlzLmZvb2ROYW1lLnRpdGxlIDogdGV4dDtcclxuXHJcbiAgICAgICAgICAgIC8v0J/RgNC+0LLQtdGA0LjRgtGMINC/0L7Qu9GPINCy0LLQvtC00LAsINCy0YvRh9C40YHQu9C40YLRjCDQt9C90LDRh9C10L3QuNGPXHJcbiAgICAgICAgICAgIGlmICghdmFsaWRhdGlvblNlcnZpY2UuZm9vZEFkZFZhbGlkYXRpb24obmFtZSwgcG9ydGlvbikpIHJldHVybjtcclxuICAgICAgICAgICAgdmFyIGZvb2QgPSBjYWxjdWxhdGlvblNlcnZpY2UuY2FsY3VsYXRlVmFsdWVzKG5hbWUsIHBvcnRpb24pO1xyXG5cclxuICAgICAgICAgICAgLy/QlNC+0LHQsNCy0LjRgtGMINCyINC80LDRgdGB0LjQslxyXG4gICAgICAgICAgICB0aGlzLmFkZCh7ZGF5VGltZUlkOiB0aGlzLmRheXRpbWVzW3RoaXMuaW5kZXhdLmlkLCBmb29kOiBmb29kfSk7XHJcblxyXG4gICAgICAgICAgICAvL9Ce0YfQuNGB0YLQuNGC0Ywg0L/QvtC70Y8g0LLQstC+0LTQsFxyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnYW5ndWNvbXBsZXRlLWFsdDpjbGVhcklucHV0Jyk7XHJcbiAgICAgICAgICAgIHRoaXMucG9ydGlvbiA9Jyc7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuZW50ZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSAhPT0gMTMpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5hZGRGb29kKCk7XHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogZGF5VGltZVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRheVRpbWU7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL2RpYXJ5LW1vZHVsZS9kYXktdGltZS9kYXktdGltZS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcImRheS10aW1lXFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiaW5wdXRcXFwiPlxcclxcbiAgICAgICAgPGZvcm0+XFxyXFxuICAgICAgICAgICAgPGxhYmVsPtCd0LDQuNC80LXQvdC+0LLQsNC90LjQtTogPGFuZ3Vjb21wbGV0ZS1hbHQgbmcta2V5cHJlc3M9XFxcIiRjdHJsLmVudGVyKCRldmVudClcXFwiIGlkPVxcXCJleDFcXFwiIHBsYWNlaG9sZGVyPVxcXCLQktCy0LXQtNC40YLQtSDQv9GA0L7QtNGD0LrRglxcXCIgcGF1c2U9XFxcIjEwMFxcXCIgc2VsZWN0ZWQtb2JqZWN0PVxcXCIkY3RybC5mb29kTmFtZVxcXCIgbG9jYWwtZGF0YT1cXFwiJGN0cmwuYmFzZS5mb29kcy5rZXlzXFxcIiBzZWFyY2gtZmllbGRzPVxcXCJmb29kTmFtZVxcXCIgdGl0bGUtZmllbGQ9XFxcImZvb2ROYW1lXFxcIiBtaW5sZW5ndGg9XFxcIjFcXFwiIGlucHV0LWNoYW5nZWQ9XFxcIiRjdHJsLm9uSW5wdXRcXFwiIGlucHV0LWNsYXNzPVxcXCJmb29kIGZvcm0tY29udHJvbC1zbWFsbFxcXCIgbWF0Y2gtY2xhc3M9XFxcImhpZ2hsaWdodFxcXCI+PC9hbmd1Y29tcGxldGUtYWx0PjwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgPGJyPlxcclxcblxcclxcbiAgICAgICAgICAgIDxsYWJlbD7Qn9C+0YDRhtC40Y8o0LPRgCk6IDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwicG9ydGlvbi1pbnB1dFxcXCIgc2l6ZT1cXFwiMlxcXCIgbmctbW9kZWw9XFxcIiRjdHJsLnBvcnRpb25cXFwiIG5nLWtleXByZXNzPVxcXCIkY3RybC5lbnRlcigkZXZlbnQpXFxcIi8+PC9sYWJlbD5cXHJcXG4gICAgICAgIDwvZm9ybT5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImFkZC1idXR0b25cXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5hZGRGb29kKClcXFwiPis8L2Rpdj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuXFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcInRhYmxlLWJvcmRlclxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0YWJsZVxcXCI+XFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidGFibGUtdGl0dGxlXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm5hbWVcXFwiPtCd0LDQuNC80LXQvdC+0LLQsNC90LjQtSDQv9GA0L7QtNGD0LrRgtCwPC9zcGFuPlxcclxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicG9ydGlvblxcXCI+0J/QvtGA0YbQuNGPICjQs9GAKTwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNhcmJvaHlkXFxcIj7Qo9Cz0LvQtdCy0L7QtNGLPC9zcGFuPlxcclxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicHJvdFxcXCI+0JHQtdC70LrQuDwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImZhdFxcXCI+0JbQuNGA0Ys8L3NwYW4+XFxyXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJrYWxsXFxcIj7QmtCw0LvQvtGA0LjQuDwvc3Bhbj5cXHJcXG4gICAgICAgICAgICA8L2Rpdj5cXHJcXG5cXHJcXG5cXHJcXG4gICAgICAgICAgICA8Zm9vZCBuZy1yZXBlYXQ9XFxcImZvb2QgaW4gJGN0cmwuZGF5dGltZXNbJGN0cmwuaW5kZXhdLmZvb2RzXFxcIiBmb29kPVxcXCJmb29kXFxcIiByZW1vdmU9XFxcIiRjdHJsLnJlbW92ZUZvb2QoZm9vZClcXFwiPjwvZm9vZD5cXHJcXG5cXHJcXG5cXHJcXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJzdW1tYXJ5XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm5hbWVcXFwiPtCf0L7QtNGL0YLQvtCzPC9zcGFuPlxcclxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicG9ydGlvblxcXCI+LS0tPC9zcGFuPlxcclxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiY2FyYm9oeWRcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2NhcmJvaHlkJyl9XFxcIj57eyAkY3RybC5kYXl0aW1lc1skY3RybC5pbmRleF0ucmVzdWx0LmNhcmJvaHlkIH19IHt7JygnICsgJGN0cmwubGltaXRzKCkuY2FyYm9oeWQgKyAnKScgfCBsaW1pdCB9fTwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInByb3RcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ3Byb3QnKX1cXFwiPnt7ICRjdHJsLmRheXRpbWVzWyRjdHJsLmluZGV4XS5yZXN1bHQucHJvdCB9fSB7eycoJyArICRjdHJsLmxpbWl0cygpLnByb3QgKyAnKScgfCBsaW1pdCB9fTwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImZhdFxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlLWxpbWl0JzogJGN0cmwuY29tcGFyZSgnZmF0Jyl9XFxcIj57eyAkY3RybC5kYXl0aW1lc1skY3RybC5pbmRleF0ucmVzdWx0LmZhdCB9fSB7eycoJyArICRjdHJsLmxpbWl0cygpLmZhdCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcclxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwia2FsbFxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlLWxpbWl0JzogJGN0cmwuY29tcGFyZSgna2FsbCcpfVxcXCI+e3sgJGN0cmwuZGF5dGltZXNbJGN0cmwuaW5kZXhdLnJlc3VsdC5rYWxsIH19IHt7JygnICsgJGN0cmwubGltaXRzKCkua2FsbCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcblxcclxcbjwvZGl2PlxcclxcblxcclxcblxcclxcbjxkaXYgY2xhc3M9XFxcImJyXFxcIj48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwiZGF5LXRpbWUtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvZGlhcnktbW9kdWxlL2RheS10aW1lL3RlbXBsYXRlL2RheS10aW1lLXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAxOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgZm9vZFRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9mb29kLXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IGZvb2QgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGZvb2Q6ICc8JyxcclxuICAgICAgICByZW1vdmU6ICcmJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY2hlY2tFbXB0eUZvb2QgPSBmdW5jdGlvbihmb29kKSB7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihmb29kLmthbGwpKSByZXR1cm4gJ2VtcHR5J1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGZvb2RUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmb29kO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvZm9vZC9mb29kLWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwiZm9vZFxcXCIgbmctY2xhc3M9XFxcIiRjdHJsLmNoZWNrRW1wdHlGb29kKCRjdHJsLmZvb2QpXFxcIj5cXHJcXG4gICAgPHNwYW4gY2xhc3M9XFxcIm5hbWVcXFwiPnt7ICRjdHJsLmZvb2QubmFtZSB9fTwvc3Bhbj5cXHJcXG4gICAgPHNwYW4gY2xhc3M9XFxcInBvcnRpb25cXFwiPnt7ICRjdHJsLmZvb2QucG9ydGlvbiB9fTwvc3Bhbj5cXHJcXG4gICAgPHNwYW4gY2xhc3M9XFxcImNhcmJvaHlkXFxcIj57eyAkY3RybC5mb29kLmNhcmJvaHlkIH19PC9zcGFuPlxcclxcbiAgICA8c3BhbiBjbGFzcz1cXFwicHJvdFxcXCI+e3sgJGN0cmwuZm9vZC5wcm90IH19PC9zcGFuPlxcclxcbiAgICA8c3BhbiBjbGFzcz1cXFwiZmF0XFxcIj57eyAkY3RybC5mb29kLmZhdCB9fTwvc3Bhbj5cXHJcXG4gICAgPHNwYW4gY2xhc3M9XFxcImthbGxcXFwiPnt7ICRjdHJsLmZvb2Qua2FsbCB9fTwvc3Bhbj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwicmVtb3ZlLWZvb2RcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5yZW1vdmUoe2Zvb2Q6ICRjdHJsLmZvb2R9KVxcXCI+PC9kaXY+XFxyXFxuPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcImZvb2QtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvZGlhcnktbW9kdWxlL2Zvb2QvdGVtcGxhdGUvZm9vZC10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMjBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHNhdmVNZW51VGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL3NhdmUtbWVudS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBzYXZlTWVudSA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgZGF5VGltZXNEYXRhOiAnPCcsXHJcbiAgICAgICAgcmVzdWx0OiAnPCdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkd2luZG93LCBtb2RhbCkge1xyXG5cclxuICAgICAgICB0aGlzLnNhdmVGb3JQcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9ICR3aW5kb3cubG9jYWxTdG9yYWdlLmRheXNEYXRhID8gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5kYXlzRGF0YSkgOiBbXTtcclxuICAgICAgICAgICAgLy/Qn9GA0L7QstC10YDQutC4XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA+IDAgJiYgbmV3IERhdGUoZGF0YVtkYXRhLmxlbmd0aCAtIDFdLnNhdmVUaW1lKS5nZXREYXkoKSA9PT0gbmV3IERhdGUoKS5nZXREYXkoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZGF0YS5sZW5ndGggLSAxXS5zYXZlVGltZUlkID09PSAkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwINGB0L7RhdGA0LDQvdC10L3QuNGPJywgbWVzc2FnZTogJ9Cd0LXRgiDQvdC+0LLRi9GFINC00LDQvdC90YvRhSDQtNC70Y8g0YHQvtGF0YDQsNC90LXQvdC40Y8nfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J/QvtC00YLQstC10YDQtNC40YLQtScsIG1lc3NhZ2U6ICfQn9C10YDQtdC30LDQv9C40YHQsNGC0Ywg0LTQsNC90L3Ri9C1INC/0LXRh9Cw0YLQuCDRgtC10LrRg9GI0LXQs9C+INC00L3Rjz8nfSwgJ2NvbmZpcm0nKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wb3AoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v0KHQvtGF0YDQsNC90LXQvdC40LVcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaWQgPSAoTWF0aC5yYW5kb20oKSArICcnKS5zbGljZSgyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRheURhdGEgPSB7c2F2ZVRpbWU6IGRhdGUsIGRheVRpbWVzOiB0aGlzLmRheVRpbWVzRGF0YSwgcmVzdWx0OiB0aGlzLnJlc3VsdCwgc2F2ZVRpbWVJZDogaWR9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goZGF5RGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLmRheXNEYXRhID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLl9sYXN0U2F2ZUlkID0gaWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ch0L7RhdGA0LDQvdC10L3QuNC1INC00LDQvdC90YvRhScsIG1lc3NhZ2U6ICfQlNCw0L3QvdGL0LUg0YPRgdC/0LXRiNC90L4g0YHQvtGF0YDQsNC90LXQvdGLJ30sICdhbGVydCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvL9Ch0L7RhdGA0LDQvdC10L3QuNC1XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSAoTWF0aC5yYW5kb20oKSArICcnKS5zbGljZSgyKTtcclxuICAgICAgICAgICAgICAgIGxldCBkYXlEYXRhID0ge3NhdmVUaW1lOiBkYXRlLCBkYXlUaW1lczogdGhpcy5kYXlUaW1lc0RhdGEsIHJlc3VsdDogdGhpcy5yZXN1bHQsIHNhdmVUaW1lSWQ6IGlkfTtcclxuICAgICAgICAgICAgICAgIGRhdGEucHVzaChkYXlEYXRhKTtcclxuICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLmRheXNEYXRhID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCA9IGlkO1xyXG4gICAgICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQodC+0YXRgNCw0L3QtdC90LjQtSDQtNCw0L3QvdGL0YUnLCBtZXNzYWdlOiAn0JTQsNC90L3Ri9C1INGD0YHQv9C10YjQvdC+INGB0L7RhdGA0LDQvdC10L3Riyd9LCAnYWxlcnQnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZVByaW50U2F2ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLmRheXNEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Cj0LTQsNC70LXQvdC40LUnLCBtZXNzYWdlOiAn0KPQtNCw0LvQuNGC0Ywg0YHQvtGF0YDQsNC90LXQvdC40Y8g0LTQu9GPINC/0LXRh9Cw0YLQuD8nfSwgJ2NvbmZpcm0nKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnZGF5c0RhdGEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnX2xhc3RTYXZlSWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICB0aGlzLnByZXZpZXcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSAkd2luZG93LmxvY2FsU3RvcmFnZS5kYXlzRGF0YTtcclxuICAgICAgICAgICAgaWYgKCFkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ch0L7RhdGA0LDQvdC10L3QuNC1JywgbWVzc2FnZTogJ9Ch0L7RhdGA0LDQvdC40YLRjCDRgtC10LrRg9GJ0LjQtSDQtNCw0L3QvdGL0LUg0LTQu9GPINC/0YDQvtGB0LzQvtGC0YDQsD8nfSwgJ2NvbmZpcm0nKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlRm9yUHJpbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcuL3ByaW50Lmh0bWwnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwINC/0YDQtdC00L/RgNC+0YHQvNC+0YLRgNCwJywgbWVzc2FnZTogJ9Cd0LXRgiDQtNCw0L3QvdGL0YUg0LTQu9GPINC/0YDQvtGB0LzQvtGC0YDQsCEnfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhW2RhdGEubGVuZ3RoIC0gMV0uc2F2ZVRpbWVJZCAhPT0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UuX2xhc3RTYXZlSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ch0L7RhdGA0LDQvdC10L3QuNC1JywgbWVzc2FnZTogJ9Ch0L7RhdGA0LDQvdC40YLRjCDRgtC10LrRg9GJ0LjQtSDQtNCw0L3QvdGL0LUg0LTQu9GPINC/0YDQvtGB0LzQvtGC0YDQsD8nfSwgJ2NvbmZpcm0nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVGb3JQcmludCgpLnRoZW4oKCkgPT4gJHdpbmRvdy5vcGVuKCcuL3ByaW50Lmh0bWwnKSwgKCkgPT4gJHdpbmRvdy5vcGVuKCcuL3ByaW50Lmh0bWwnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiAkd2luZG93Lm9wZW4oJy4vcHJpbnQuaHRtbCcpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcuL3ByaW50Lmh0bWwnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zYXZlRGF0YSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ch0L7RhdGA0LDQvdC10L3QuNC1JywgbWVzc2FnZTogJ9Ch0L7RhdGA0LDQvdC40YLRjCDRgtC10LrRg9GJ0LjQtSDQtNCw0L3QvdGL0LU/J30sICdjb25maXJtJylcclxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlRGF0YSA9IEpTT04uc3RyaW5naWZ5KHtkYXlzRGF0YTogdGhpcy5kYXlUaW1lc0RhdGEsIHJlc3VsdEZpbmFsOiB0aGlzLnJlc3VsdH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkd2luZG93LnNlc3Npb25TdG9yYWdlLnNhdmVkTGltaXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVkTGltaXRzID0gJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zYXZlZExpbWl0cztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCEkd2luZG93LnNlc3Npb25TdG9yYWdlLnNhdmVkTGltaXRzICYmICR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVkTGltaXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3NhdmVkTGltaXRzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0KHQvtGF0YDQsNC90LXQvdC40LUg0LTQsNC90L3Ri9GFJywgbWVzc2FnZTogJ9CU0LDQvdC90YvQtSDRg9GB0L/QtdGI0L3QviDRgdC+0YXRgNCw0L3QtdC90YsnfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZURhdGEgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0KPQtNCw0LvQtdC90LjQtScsIG1lc3NhZ2U6ICfQo9C00LDQu9C40YLRjCDRgdC+0YXRgNCw0L3QtdC90L3Ri9C1INC00LDQvdC90YvQtT8nfSwgJ2NvbmZpcm0nKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnc2F2ZURhdGEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnc2F2ZWRMaW1pdHMnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQo9C00LDQu9C10L3QuNC1JywgbWVzc2FnZTogJ9CU0LDQvdC90YvQtSDRg9GB0L/QtdGI0L3QviDRg9C00LDQu9C10L3Riyd9LCAnYWxlcnQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwJywgbWVzc2FnZTogJ9Cd0LXRgiDRgdC+0YXRgNCw0L3QtdC90L3Ri9GFINC00LDQvdC90YvRhSd9LCAnYWxlcnQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogc2F2ZU1lbnVUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzYXZlTWVudTtcclxuXHJcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvc2F2ZS1tZW51L3NhdmUtbWVudS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcInNhdmUtbWVudVxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcInRpdGxlXFxcIj7Qo9C/0YDQsNCy0LvQtdC90LjQtSDQtNCw0L3QvdGL0LzQuDwvZGl2PlxcclxcblxcclxcbiAgICA8ZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYnV0dG9uIHNhdmUtYnV0dG9uXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2F2ZURhdGEoKVxcXCI+0KHQvtGF0YDQsNC90LjRgtGMINC40LfQvNC10L3QtdC90LjRjzwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYnV0dG9uIHJlbW92ZS1kYXRhXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwucmVtb3ZlRGF0YSgpXFxcIj7Qo9C00LDQu9C40YLRjCDRgdC+0YXRgNCw0L3QtdC90LjRjzwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwidGl0bGVcXFwiPtCU0LvRjyDQv9C10YfQsNGC0Lg8L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwicHJpbnQtbWVudVxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJidXR0b24gdG8tcHJpbnRcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5wcmV2aWV3KClcXFwiPtCf0YDQtdC00L/RgNC+0YHQvNC+0YLRgDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYnV0dG9uIHByaW50LXRvLWxvY2FsU3RvcmFnZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNhdmVGb3JQcmludCgpXFxcIj7QodC+0YXRgNCw0L3QuNGC0Ywg0LTQu9GPINC/0LXRh9Cw0YLQuDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYnV0dG9uIHJlbW92ZS1wcmludC1sb2NhbFN0b3JhZ2VcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5yZW1vdmVQcmludFNhdmVzKClcXFwiPtCj0LTQsNC70LjRgtGMINGB0L7RhdGA0LDQvdC10L3QuNGPPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcbjwvZGl2PlxcclxcblxcclxcblxcclxcbjxkaXYgY2xhc3M9XFxcImJyXFxcIj48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwic2F2ZS1tZW51LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9zYXZlLW1lbnUvdGVtcGxhdGUvc2F2ZS1tZW51LXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAyMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgcmVzdWx0VGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL3Jlc3VsdC10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCByZXN1bHQgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHJlc3VsdDogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24obGltaXRzU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMubGltaXRzRGF0YSA9IGxpbWl0c1NlcnZpY2UubGltaXRzRGF0YTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjUGVyY2VudCA9IGZ1bmN0aW9uKHZhbHVlLCBsaW1pdCkge1xyXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm4gJzAlJztcclxuICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSAvIChsaW1pdCAvIDEwMCkgKS50b0ZpeGVkKCkgKyAnJSc7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjR3JhcGggPSBmdW5jdGlvbih2YWx1ZSwgbGltaXQpIHtcclxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICBsZXQgcGVyY2VudCA9ICh2YWx1ZSAvIChsaW1pdCAvIDEwMCkgKS50b0ZpeGVkKCk7XHJcbiAgICAgICAgICAgIGxldCBjb2xvciA9IHBlcmNlbnQgPiAxMDAgPyAncmdiYSgyMDIsIDIyLCA0MSwgMC4yKScgOiAncmdiYSgyNywgMjAxLCAxNDIsIDAuMSknO1xyXG4gICAgICAgICAgICBpZiAocGVyY2VudCA+IDEwMCkgcGVyY2VudCA9IDEwMDtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6IGNvbG9yLFxyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogcGVyY2VudCArICclJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiByZXN1bHRUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSByZXN1bHQ7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL2RpYXJ5LW1vZHVsZS9yZXN1bHQtY29tcG9uZW50L3Jlc3VsdC1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcInJlc3VsdFxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcInJlc3VsdC10aXRsZVxcXCI+0JjRgtC+0LMg0LTQvdGPPC9kaXY+XFxyXFxuXFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcInJlc3VsdC10YWJsZVxcXCIgbmctcmVwZWF0PVxcXCIoa2V5LCBlbGVtZW50KSBpbiAkY3RybC5yZXN1bHRcXFwiPlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwidGl0bGVcXFwiIG5nLWNsYXNzPVxcXCJ7fVxcXCI+XFxyXFxuICAgICAgICAgICAge3tlbGVtZW50Lm5hbWV9fSA8c3BhbiBuZy1pZj1cXFwiISEkY3RybC5saW1pdHNEYXRhLmxpbWl0c1xcXCI+KG1heCB7eyRjdHJsLmxpbWl0c0RhdGEubGltaXRzWyfQmNGC0L7QsyddW2tleV19fSk8L3NwYW4+XFxyXFxuICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInZhbHVlXFxcIiBuZy1jbGFzcz1cXFwieydsaW1pdHMnOiAhISRjdHJsLmxpbWl0c0RhdGEubGltaXRzfVxcXCI+XFxyXFxuICAgICAgICAgICAge3tlbGVtZW50LnZhbHVlfX1cXHJcXG4gICAgICAgICAgICA8c3BhbiBuZy1pZj1cXFwiISEkY3RybC5saW1pdHNEYXRhLmxpbWl0c1xcXCI+e3sgJGN0cmwuY2FsY1BlcmNlbnQoZWxlbWVudC52YWx1ZSwgJGN0cmwubGltaXRzRGF0YS5saW1pdHNbJ9CY0YLQvtCzJ11ba2V5XSkgfX08L3NwYW4+XFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZ3JhcGhcXFwiIG5nLWlmPVxcXCIhISRjdHJsLmxpbWl0c0RhdGEubGltaXRzXFxcIiBuZy1zdHlsZT1cXFwiJGN0cmwuY2FsY0dyYXBoKGVsZW1lbnQudmFsdWUsICRjdHJsLmxpbWl0c0RhdGEubGltaXRzWyfQmNGC0L7QsyddW2tleV0pXFxcIj48L2Rpdj5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cXHJcXG5cXHJcXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwicmVzdWx0LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9yZXN1bHQtY29tcG9uZW50L3RlbXBsYXRlL3Jlc3VsdC10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMjRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHRhYmxlTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3RhYmxlJywgW10pO1xyXG5cclxudGFibGVNb2R1bGVcclxuICAgIC5jb21wb25lbnQoJ3RhYmxlQWRkJywgcmVxdWlyZSgnLi9hZGQtdG8tdGFibGUtY29tcG9uZW50L2FkZC10by10YWJsZS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ2Zvb2RUYWJsZScsIHJlcXVpcmUoJy4vdGFibGUtY29tcG9uZW50L3RhYmxlLWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgnc3RvcmFnZVRhYmxlJywgcmVxdWlyZSgnLi9zdG9yYWdlLXRhYmxlLWNvbXBvbmVudC9zdG9yYWdlLXRhYmxlLWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgndGFibGVzJywgcmVxdWlyZSgnLi9zaW5nbGUtcGFnZS10YWJsZXMtY29tcG9uZW50L3NpbmdsZS1wYWdlLXRhYmxlcy1jb21wb25lbnQnKSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRhYmxlTW9kdWxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvaW5kZXguanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBhZGRUb1RhYmxlVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBhZGRUb1RhYmxlID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBteUZvb2RzOiAnPCcsXHJcbiAgICAgICAgcmVtb3ZlTXlGb29kOiAnJicsXHJcbiAgICAgICAgYWRkTXlGb29kOiAnJidcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAodmFsaWRhdGlvblNlcnZpY2UpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygndGVzdCcpO1xyXG4gICAgICAgIHRoaXMudmFsdWVzID0gWzAsIDAsIDAsIDAsIDBdO1xyXG5cclxuICAgICAgICB0aGlzLmFkZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudCAmJiBldmVudC5rZXlDb2RlICE9PSAxMykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52YWx1ZXMuZm9yRWFjaCgodmFsdWUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlc1tpbmRleF0gPSArdmFsdWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICghdmFsaWRhdGlvblNlcnZpY2UuYWRkTXlGb29kVmFsaWRhdGlvbih0aGlzLm5hbWUsIHRoaXMudmFsdWVzKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGRNeUZvb2Qoe25hbWU6IHRoaXMubmFtZSwgdmFsdWVzOiB0aGlzLnZhbHVlc30pO1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlcyA9IFswLCAwLCAwLCAwLCAwXTtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gJyc7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbihuYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTXlGb29kKHtuYW1lOiBuYW1lfSlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGFkZFRvVGFibGVUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBhZGRUb1RhYmxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvYWRkLXRvLXRhYmxlLWNvbXBvbmVudC9hZGQtdG8tdGFibGUtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJhZGQtdG8tdGFibGUtZm9ybVxcXCI+XFxyXFxuICAgIDxoMyBjbGFzcz1cXFwiYWRkLWZvcm0tdGl0bGVcXFwiPtCU0L7QsdCw0LLQuNGC0Ywg0L/RgNC+0LTRg9C60YIg0LIg0YLQsNCx0LvQuNGG0YM8L2gzPlxcclxcbiAgICA8Zm9ybSBjbGFzcz1cXFwidGFibGUtZm9ybVxcXCI+XFxyXFxuICAgICAgICA8dGFibGU+XFxyXFxuICAgICAgICAgICAgPHRyPjx0ZD48bGFiZWwgZm9yPVxcXCJmb29kLW5hbWVcXFwiPtCd0LDQuNC80LXQvdC+0LLQsNC90LjQtTo8L2xhYmVsPjwvdGQ+PHRkPjxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBpZD1cXFwiZm9vZC1uYW1lXFxcIiBuZy1tb2RlbD1cXFwiJGN0cmwubmFtZVxcXCIgbmcta2V5ZG93bj1cXFwiJGN0cmwuYWRkKCRldmVudClcXFwiLz48L3RkPjwvdHI+XFxyXFxuICAgICAgICAgICAgPHRyPjx0ZD48bGFiZWwgZm9yPVxcXCJ0YWJsZS1mb3JtLXBvcnRpb25cXFwiPtCf0L7RgNGG0LjRjyjQs9GAKTo8L2xhYmVsPjwvdGQ+PHRkPjxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBpZD1cXFwidGFibGUtZm9ybS1wb3J0aW9uXFxcIiBzaXplPVxcXCIyXFxcIiBuZy1tb2RlbD1cXFwiJGN0cmwudmFsdWVzWzBdXFxcIiBuZy1rZXlkb3duPVxcXCIkY3RybC5hZGQoJGV2ZW50KVxcXCIvPjwvdGQ+PC90cj5cXHJcXG4gICAgICAgICAgICA8dHI+PHRkPjxsYWJlbCBmb3I9XFxcInRhYmxlLWZvcm0tY2FyYm9oeWRcXFwiPtCj0LPQu9C10LLQvtC00Ys6PC9sYWJlbD48L3RkPjx0ZD48aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgaWQ9XFxcInRhYmxlLWZvcm0tY2FyYm9oeWRcXFwiIHNpemU9XFxcIjJcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC52YWx1ZXNbMV1cXFwiIG5nLWtleWRvd249XFxcIiRjdHJsLmFkZCgkZXZlbnQpXFxcIi8+PC90ZD48L3RyPlxcclxcbiAgICAgICAgICAgIDx0cj48dGQ+PGxhYmVsIGZvcj1cXFwidGFibGUtZm9ybS1wcm90XFxcIj7QkdC10LvQutC4OjwvbGFiZWw+PC90ZD48dGQ+PGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGlkPVxcXCJ0YWJsZS1mb3JtLXByb3RcXFwiIHNpemU9XFxcIjJcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC52YWx1ZXNbMl1cXFwiIG5nLWtleWRvd249XFxcIiRjdHJsLmFkZCgkZXZlbnQpXFxcIi8+PC90ZD48L3RyPlxcclxcbiAgICAgICAgICAgIDx0cj48dGQ+PGxhYmVsIGZvcj1cXFwidGFibGUtZm9ybS1mYXRcXFwiPtCW0LjRgNGLOjwvbGFiZWw+PC90ZD48dGQ+PGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGlkPVxcXCJ0YWJsZS1mb3JtLWZhdFxcXCIgc2l6ZT1cXFwiMlxcXCIgbmctbW9kZWw9XFxcIiRjdHJsLnZhbHVlc1szXVxcXCIgbmcta2V5ZG93bj1cXFwiJGN0cmwuYWRkKCRldmVudClcXFwiLz48L3RkPjwvdHI+XFxyXFxuICAgICAgICAgICAgPHRyPjx0ZD48bGFiZWwgZm9yPVxcXCJ0YWJsZS1mb3JtLWthbFxcXCI+0JrQsNC70L7RgNC40Lg6PC9sYWJlbD48L3RkPjx0ZD48aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgaWQ9XFxcInRhYmxlLWZvcm0ta2FsXFxcIiBzaXplPVxcXCIyXFxcIiBuZy1tb2RlbD1cXFwiJGN0cmwudmFsdWVzWzRdXFxcIiBuZy1rZXlkb3duPVxcXCIkY3RybC5hZGQoJGV2ZW50KVxcXCIvPjwvdGQ+PC90cj5cXHJcXG4gICAgICAgIDwvdGFibGU+XFxyXFxuXFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhZGQtdG8tdGFibGUtYnV0dG9uXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuYWRkKClcXFwiPis8L2Rpdj5cXHJcXG4gICAgPC9mb3JtPlxcclxcblxcclxcbjwvZGl2PlxcclxcblxcclxcbjxkaXYgY2xhc3M9XFxcIm15LXRhYmxlXFxcIj5cXHJcXG48c3RvcmFnZS10YWJsZSBteS1mb29kcz1cXFwiJGN0cmwubXlGb29kc1xcXCIgcmVtb3ZlPVxcXCIkY3RybC5yZW1vdmUobmFtZSlcXFwiPjwvc3RvcmFnZS10YWJsZT48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwiYWRkLXRvLXRhYmxlLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMjdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHRhYmxlVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL3RhYmxlLXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IHRhYmxlID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBmb29kc09iajogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiB0YWJsZVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRhYmxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvdGFibGUtY29tcG9uZW50L3RhYmxlLWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPHRhYmxlIGNsYXNzPVxcXCJ0YlxcXCI+XFxyXFxuICAgIDxjYXB0aW9uIGNsYXNzPVxcXCJ0Yi10aXRsZVxcXCI+e3sgJGN0cmwuZm9vZHNPYmoudGl0bGUgfX08L2NhcHRpb24+XFxyXFxuICAgIDx0ciBuZy1yZXBlYXQ9XFxcImZvb2QgaW4gJGN0cmwuZm9vZHNPYmouZm9vZHNcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5yZW1vdmUoe2Zvb2Q6IGZvb2QsIG9iajogJGN0cmwuZm9vZHNPYmouZm9vZHN9KVxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj5cXHJcXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwidGQtbmFtZSBuYW1lLWNvbG9yXFxcIiBuZy1jbGFzcz1cXFwiZm9vZC5jbGFzc05hbWVcXFwiPnt7IGZvb2QudmFsdWVzLm5hbWUgfX08L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJwb3J0aW9uLWNvbG9yXFxcIiBuZy1jbGFzcz1cXFwiZm9vZC5jbGFzc05hbWVcXFwiPnt7IGZvb2QudmFsdWVzLnBvcnRpb24gfX08L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJjYXJib2h5ZC1jb2xvclxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj57eyBmb29kLnZhbHVlcy5jYXJib2h5ZCB9fTwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcInByb3QtY29sb3JcXFwiIG5nLWNsYXNzPVxcXCJmb29kLmNsYXNzTmFtZVxcXCI+e3sgZm9vZC52YWx1ZXMucHJvdCB9fTwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcImZhdC1jb2xvclxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj57eyBmb29kLnZhbHVlcy5mYXQgfX08L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJrYWxsLWNvbG9yXFxcIiBuZy1jbGFzcz1cXFwiZm9vZC5jbGFzc05hbWVcXFwiPnt7IGZvb2QudmFsdWVzLmthbGwgfX08L3RkPlxcclxcbiAgICA8L3RyPlxcclxcbjwvdGFibGU+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcInRhYmxlLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS1jb21wb25lbnQvdGVtcGxhdGUvdGFibGUtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDI5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBzdG9yYWdlVGFibGVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvc3RvcmFnZS10YWJsZS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBzdG9yYWdlVGFibGUgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIG15Rm9vZHM6ICc8JyxcclxuICAgICAgICByZW1vdmU6ICcmJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2hvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMubXlGb29kcykgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5teUZvb2RzKS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogc3RvcmFnZVRhYmxlVGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc3RvcmFnZVRhYmxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvc3RvcmFnZS10YWJsZS1jb21wb25lbnQvc3RvcmFnZS10YWJsZS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjx0YWJsZSBjbGFzcz1cXFwidGJcXFwiIG5nLWlmPVxcXCIkY3RybC5zaG93KClcXFwiPlxcclxcbiAgICA8Y2FwdGlvbiBjbGFzcz1cXFwidGItdGl0bGVcXFwiPtCU0L7QsdCw0LLQu9C10L3Ri9C1INC/0YDQvtC00YPQutGC0Ys8L2NhcHRpb24+XFxyXFxuICAgIDx0cj5cXHJcXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwidGQtbmFtZSBuYW1lLWNvbG9yIGNvbG9yXFxcIj7QndCw0LjQvNC10L3QvtCy0LDQvdC40LUg0L/RgNC+0LTRg9C60YLQsDwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcInBvcnRpb24tY29sb3IgY29sb3JcXFwiPtCf0L7RgNGG0LjRjzwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcImNhcmJvaHlkLWNvbG9yIGNvbG9yXFxcIj7Qo9Cz0LvQtdCy0L7QtNGLPC90ZD5cXHJcXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwicHJvdC1jb2xvciBjb2xvclxcXCI+0JHQtdC70LrQuDwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcImZhdC1jb2xvciBjb2xvclxcXCI+0JbQuNGA0Ys8L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJrYWxsLWNvbG9yIGNvbG9yXFxcIj7QmtCw0LvQvtGA0LjQuDwvdGQ+XFxyXFxuICAgIDwvdHI+XFxyXFxuXFxyXFxuICAgIDx0ciBjbGFzcz1cXFwibXktZm9vZFxcXCIgbmctcmVwZWF0PVxcXCIoZm9vZE5hbWUsIHZhbHVlcykgaW4gJGN0cmwubXlGb29kc1xcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnJlbW92ZSh7bmFtZTogZm9vZE5hbWV9KVxcXCI+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcInRkLW5hbWVcXFwiPnt7IGZvb2ROYW1lIH19PC90ZD5cXHJcXG4gICAgICAgIDx0ZD57eyB2YWx1ZXNbMF0gfX08L3RkPlxcclxcbiAgICAgICAgPHRkPnt7IHZhbHVlc1sxXSB9fTwvdGQ+XFxyXFxuICAgICAgICA8dGQ+e3sgdmFsdWVzWzJdIH19PC90ZD5cXHJcXG4gICAgICAgIDx0ZD57eyB2YWx1ZXNbM10gfX08L3RkPlxcclxcbiAgICAgICAgPHRkPnt7IHZhbHVlc1s0XSB9fTwvdGQ+XFxyXFxuICAgIDwvdHI+XFxyXFxuPC90YWJsZT5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwic3RvcmFnZS10YWJsZS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC90YWJsZS1tb2R1bGUvc3RvcmFnZS10YWJsZS1jb21wb25lbnQvdGVtcGxhdGUvc3RvcmFnZS10YWJsZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMzFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9zaW5nbGUtcGFnZS10YWJsZXMtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgdGFibGVzID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBmb29kc09ianM6ICc8JyxcclxuICAgICAgICBteUZvb2RzOiAnPCcsXHJcbiAgICAgICAgcmVtb3ZlTXlGb29kOiAnJidcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkdGltZW91dCkge1xyXG4gICAgICAgIHRoaXMuc2hvd1RhYmxlID0gZnVuY3Rpb24oaGFzaEtleSkge1xyXG4gICAgICAgICAgICB0aGlzLiQkaGFzaEtleSA9IGhhc2hLZXk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHRpbWVvdXQoKCkgPT4gdGhpcy5zaG93VGFibGUodGhpcy5mb29kc09ianNbMF0uJCRoYXNoS2V5KSwwKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbihvYmopIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVNeUZvb2Qoe25hbWU6IG9ian0pXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93TXlGb29kVGl0bGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm15Rm9vZHMpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuICEhT2JqZWN0LmtleXModGhpcy5teUZvb2RzKS5sZW5ndGhcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXHJcbn0gO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0YWJsZXM7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3RhYmxlLW1vZHVsZS9zaW5nbGUtcGFnZS10YWJsZXMtY29tcG9uZW50L3NpbmdsZS1wYWdlLXRhYmxlcy1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcInRhYmxlcy1saXN0XFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwidGl0bGVcXFwiPtCi0LDQsdC70LjRhtGLPC9kaXY+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImxpc3RcXFwiPlxcclxcbiAgICAgICAgPGRpdiBuZy1yZXBlYXQ9XFxcIm9iaiBpbiAkY3RybC5mb29kc09ianNcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zaG93VGFibGUob2JqLiQkaGFzaEtleSwgb2JqKVxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlLXRhYmxlLXRpdGxlJzogJGN0cmwuJCRoYXNoS2V5ID09PSBvYmouJCRoYXNoS2V5fVxcXCI+XFxyXFxuICAgICAgICAgICAgLSB7e29iai50aXRsZX19XFxyXFxuICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgIDxkaXYgbmctaWY9XFxcIiRjdHJsLnNob3dNeUZvb2RUaXRsZSgpXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2hvd1RhYmxlKCdhZGQtZm9vZCcpXFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtdGFibGUtdGl0bGUnOiAkY3RybC4kJGhhc2hLZXkgPT09ICdhZGQtZm9vZCd9XFxcIj4tINCU0L7QsdCw0LLQu9C10L3QvdGL0LUg0L/RgNC+0LTRg9C60YLRizwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG48L2Rpdj5cXHJcXG5cXHJcXG48ZGl2IGNsYXNzPVxcXCJ0YWJsZS1jb250YWluZXJcXFwiPlxcclxcbiAgICA8Zm9vZC10YWJsZSBuZy1yZXBlYXQ9XFxcImZvb2RzT2JqIGluICRjdHJsLmZvb2RzT2Jqc1xcXCIgZm9vZHMtb2JqPVxcXCJmb29kc09ialxcXCIgbmctaWY9XFxcIiRjdHJsLiQkaGFzaEtleSA9PT0gZm9vZHNPYmouJCRoYXNoS2V5XFxcIj48L2Zvb2QtdGFibGU+XFxyXFxuICAgIDxzdG9yYWdlLXRhYmxlIG15LWZvb2RzPVxcXCIkY3RybC5teUZvb2RzXFxcIiByZW1vdmU9XFxcIiRjdHJsLnJlbW92ZShuYW1lKVxcXCIgbmctaWY9XFxcIiRjdHJsLiQkaGFzaEtleSA9PT0gJ2FkZC1mb29kJ1xcXCI+PC9zdG9yYWdlLXRhYmxlPlxcclxcbjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJzaW5nbGUtcGFnZS10YWJsZXMtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvdGFibGUtbW9kdWxlL3NpbmdsZS1wYWdlLXRhYmxlcy1jb21wb25lbnQvdGVtcGxhdGUvc2luZ2xlLXBhZ2UtdGFibGVzLXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAzM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPT09IDIpIHJldHVybiAnJztcclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3NlcnZpY2VzL2xpbWl0cy1maWx0ZXIuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRodHRwLCAkd2luZG93KSB7XHJcbiAgICB2YXIgYmFzZSA9IHt9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldEZvb2RCYXNlKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy4vSlNPTmRhdGEvZm9vZC5qc29uJykudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgYmFzZSA9IHt9LCBrZXlzID0gW107XHJcbiAgICAgICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5teUZvb2RzKSBkYXRhLmRhdGEucHVzaChKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLm15Rm9vZHMpKTtcclxuXHJcbiAgICAgICAgICAgIGRhdGEuZGF0YS5mb3JFYWNoKChvYmopID0+IHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBvYmopIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAnbmFtZScpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJhc2Vba2V5XSA9IG9ialtrZXldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoYmFzZSkuZm9yRWFjaCgoa2V5KSA9PiBrZXlzLnB1c2goe2Zvb2ROYW1lOiBrZXl9KSk7XHJcbiAgICAgICAgICAgIGJhc2Uua2V5cyA9IGtleXM7XHJcbiAgICAgICAgICAgIHJldHVybiBiYXNlO1xyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Rm9vZEJhc2UoKS50aGVuKChkYXRhKSA9PiBiYXNlLmZvb2RzID0gZGF0YSk7XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkVG9CYXNlKG5hbWUsIHZhbHVlcykge1xyXG4gICAgICAgIGJhc2UuZm9vZHNbbmFtZV0gPSB2YWx1ZXM7XHJcbiAgICAgICAgYmFzZS5mb29kcy5rZXlzLnB1c2goe2Zvb2ROYW1lOiBuYW1lfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlRnJvbUJhc2UobmFtZSkge1xyXG4gICAgICAgIGRlbGV0ZSBiYXNlLmZvb2RzW25hbWVdO1xyXG5cclxuICAgICAgICBiYXNlLmZvb2RzLmtleXMuZm9yRWFjaCgob2JqLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAob2JqLmZvb2ROYW1lID09PSBuYW1lKSBiYXNlLmZvb2RzLmtleXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldEZvb2RPYmplY3RzKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy4vSlNPTmRhdGEvZm9vZC5qc29uJylcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXREYXlUaW1lc0RhdGEoKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnLi9KU09OZGF0YS9kYXktdGltZXMtZGF0YS5qc29uJylcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRMaW1pdHNEYXRhKGRpZXQsIHBoYXNlKSB7XHJcbiAgICAgICAgbGV0IHBhdGggPSAnLi9KU09OZGF0YS9saW1pdHMtZGF0YS8nICsgZGlldCArICctcGhhc2UnICsgcGhhc2UgKyAnLmpzb24nO1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQocGF0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0VGFibGVEYXRhKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy4vSlNPTmRhdGEvZm9vZC5qc29uJylcclxuICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCB0YWJsZURhdGEgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBkYXRhLmRhdGEuZm9yRWFjaCgob2JqKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld09iaiA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvb2RzOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudCA9IDIwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gb2JqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09ICduYW1lJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3T2JqLnRpdGxlID0gb2JqLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGNvdW50ID49IDIwICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRpdGxlRGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdjb2xvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICfQndCw0LjQvNC10L3QvtCy0LDQvdC40LUg0L/RgNC+0LTRg9C60YLQsCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcnRpb246ICfQn9C+0YDRhtC40Y8nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJib2h5ZDogJ9Cj0LPQu9C10LLQvtC00YsnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm90OiAn0JHQtdC70LrQuCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhdDogJ9CW0LjRgNGLJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2FsbDogJ9Ca0LDQu9C+0YDQuNC4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdPYmouZm9vZHMucHVzaCh0aXRsZURhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmb29kID0ge2NsYXNzTmFtZTogJycsIHZhbHVlczoge319O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5uYW1lID0ga2V5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5wb3J0aW9uID0gb2JqW2tleV1bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvb2QudmFsdWVzLmNhcmJvaHlkID0gb2JqW2tleV1bMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvb2QudmFsdWVzLnByb3QgPSBvYmpba2V5XVsyXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9vZC52YWx1ZXMuZmF0ID0gb2JqW2tleV1bM107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvb2QudmFsdWVzLmthbGwgPSBvYmpba2V5XVs0XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3T2JqLmZvb2RzLnB1c2goZm9vZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0YWJsZURhdGEucHVzaChuZXdPYmopO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhYmxlRGF0YTtcclxuICAgICAgICAgICAgfSlcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgYmFzZTogYmFzZSxcclxuICAgICAgICBhZGRUb0Jhc2U6IGFkZFRvQmFzZSxcclxuICAgICAgICByZW1vdmVGcm9tQmFzZTogcmVtb3ZlRnJvbUJhc2UsXHJcbiAgICAgICAgZ2V0Rm9vZEJhc2U6IGdldEZvb2RCYXNlLFxyXG4gICAgICAgIGdldEZvb2RPYmplY3RzOiBnZXRGb29kT2JqZWN0cyxcclxuICAgICAgICBnZXRUYWJsZURhdGE6IGdldFRhYmxlRGF0YSxcclxuICAgICAgICBnZXREYXlUaW1lc0RhdGE6IGdldERheVRpbWVzRGF0YSxcclxuICAgICAgICBnZXRMaW1pdHNEYXRhOiBnZXRMaW1pdHNEYXRhXHJcbiAgICB9O1xyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9kYXRhLXNlcnZpY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGFTZXJ2aWNlLCBtb2RhbCkge1xyXG4gICAgdmFyIGZvb2QgPSBkYXRhU2VydmljZS5iYXNlO1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBmb29kQWRkVmFsaWRhdGlvbihuYW1lLCBwb3J0aW9uKSB7XHJcbiAgICAgICAgaWYgKCFuYW1lKSB7XHJcbiAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwJywgbWVzc2FnZTogJ9CS0LLQtdC00LjRgtC1INC90LDQt9Cy0LDQvdC40LUg0L/RgNC+0LTRg9C60YLQsCd9LCAnYWxlcnQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCFmb29kLmZvb2RzW25hbWVdKSB7XHJcbiAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwJywgbWVzc2FnZTogJ9Ci0LDQutC+0LPQviDQv9GA0L7QtNGD0LrRgtCwINC90LXRgiDQsiDQsdCw0LfQtS4g0KHQviDRgdC/0LjRgdC60L7QvCDQv9GA0L7QtNGD0LrRgtC+0LIg0JLRiyDQvNC+0LbQtdGC0LUg0L7Qt9C90LDQutC+0LzQuNGC0YzRgdGPINCyINGA0LDQt9C00LXQu9C1IFwi0KLQsNCx0LvQuNGG0YtcIiwg0LvQuNCx0L4g0LTQvtCx0LDQstC40YLRjCDRgdCy0L7QuSDQv9GA0L7QtNGD0LrRgid9LCAnYWxlcnQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCFwb3J0aW9uKSB7XHJcbiAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwJywgbWVzc2FnZTogJ9CS0LLQtdC00LjRgtC1INC/0L7RgNGG0LjRjiDQsiDQs9GA0LDQvNC80LDRhSd9LCAnYWxlcnQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGlzTmFOKCtwb3J0aW9uKSkge1xyXG4gICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIG1lc3NhZ2U6ICfQkiDQv9C+0LvQtSBcItCf0L7RgNGG0LjRj1wiINCy0LLQtdC00LjRgtC1INGH0LjRgdC70L4nfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgfWVsc2UgaWYgKHBvcnRpb24gPD0gMCkge1xyXG4gICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIG1lc3NhZ2U6ICfQktCy0LXQtNC40YLQtSDRh9C40YHQu9C+INCx0L7Qu9GM0YjQtSDRh9C10LwgMCd9LCAnYWxlcnQnKTtcclxuICAgICAgICB9IGVsc2UgeyByZXR1cm4gdHJ1ZX1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB2YWxpZGF0ZUxpbWl0c0Nob29zZShkaWV0MSwgZGlldDIsIHBoYXNlQ2xhc3MpIHtcclxuICAgICAgICBpZiggKGRpZXQxIHx8IGRpZXQyKSAmJiBwaGFzZUNsYXNzICE9PSAnc3RhcnQnKSByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGRNeUZvb2RWYWxpZGF0aW9uKG5hbWUsIHZhbHVlcykge1xyXG4gICAgICAgIGxldCBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQntGI0LjQsdC60LAnLCBtZXNzYWdlOiAn0JLQstC10LTQuNGC0LUg0L3QsNC40LzQtdC90L7QstCw0L3QuNC1INC/0YDQvtC00YPQutGC0LAnfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWVzWzBdID09PSAwKSB7XHJcbiAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwJywgbWVzc2FnZTogJ9Cf0L7RgNGG0LjRjyDQvdC1INC80L7QttC10YIg0LHRi9GC0Ywg0YDQsNCy0L3QsCDQvdGD0LvRjid9LCAnYWxlcnQnKTtcclxuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhbHVlcy5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4odmFsdWUpfHwgdmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIG1lc3NhZ2U6ICfQl9C90LDRh9C10L3QuNGPINC00L7Qu9C20L3RiyDQsdGL0YLRjCDRh9C40YHQu9Cw0LzQuCDRgdC+INC30L3QsNGH0LXQvdC40LXQvCDQsdC+0LvRjNGI0LjQvCDQuNC70Lgg0YDQsNCy0L3Ri9C8INC90YPQu9GOJ30sICdhbGVydCcpO1xyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBmb29kQWRkVmFsaWRhdGlvbjogZm9vZEFkZFZhbGlkYXRpb24sXHJcbiAgICAgICAgdmFsaWRhdGVMaW1pdHNDaG9vc2U6IHZhbGlkYXRlTGltaXRzQ2hvb3NlLFxyXG4gICAgICAgIGFkZE15Rm9vZFZhbGlkYXRpb246IGFkZE15Rm9vZFZhbGlkYXRpb25cclxuICAgIH1cclxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvc2VydmljZXMvdmFsaWRhdGlvbi1zZXJ2aWNlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhU2VydmljZSkge1xyXG4gICAgdmFyIGZvb2QgPSBkYXRhU2VydmljZS5iYXNlO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZVZhbHVlcyhmb29kTmFtZSwgcG9ydGlvbikge1xyXG4gICAgICAgIGxldCB2YWx1ZXMgPSBmb29kLmZvb2RzW2Zvb2ROYW1lXTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBuYW1lOiBmb29kTmFtZSxcclxuICAgICAgICAgICAgcG9ydGlvbjogcG9ydGlvbixcclxuICAgICAgICAgICAgY2FyYm9oeWQ6IE1hdGgucm91bmQodmFsdWVzWzFdL3ZhbHVlc1swXSpwb3J0aW9uKSxcclxuICAgICAgICAgICAgcHJvdDogTWF0aC5yb3VuZCh2YWx1ZXNbMl0vdmFsdWVzWzBdKnBvcnRpb24pLFxyXG4gICAgICAgICAgICBmYXQ6IE1hdGgucm91bmQodmFsdWVzWzNdL3ZhbHVlc1swXSpwb3J0aW9uKSxcclxuICAgICAgICAgICAga2FsbDogTWF0aC5yb3VuZCh2YWx1ZXNbNF0vdmFsdWVzWzBdKnBvcnRpb24pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY2FsY3VsYXRlVmFsdWVzOiBjYWxjdWxhdGVWYWx1ZXNcclxuICAgIH1cclxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvc2VydmljZXMvY2FsY3VsYXRpb24tc2VydmljZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YVNlcnZpY2UpIHtcclxuICAgIHZhciBsaW1pdHNEYXRhID0ge307XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0TGltaXRzKGRpZXQsIHBoYXNlKSB7XHJcbiAgICAgICAgZGF0YVNlcnZpY2UuZ2V0TGltaXRzRGF0YShkaWV0LCBwaGFzZSlcclxuICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IGxpbWl0c0RhdGEubGltaXRzID0gZGF0YS5kYXRhKVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBjbGVhckxpbWl0cygpIHtcclxuICAgICAgICBpZiAobGltaXRzRGF0YS5saW1pdHMpIGRlbGV0ZSBsaW1pdHNEYXRhLmxpbWl0c1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbGltaXRzRGF0YTogbGltaXRzRGF0YSxcclxuICAgICAgICBzZXRMaW1pdHM6IHNldExpbWl0cyxcclxuICAgICAgICBjbGVhckxpbWl0czogY2xlYXJMaW1pdHNcclxuICAgIH1cclxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvc2VydmljZXMvbGltaXRzLXNlcnZpY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRheXRpbWUpIHtcclxuICAgICAgICBzd2l0Y2ggKGRheXRpbWUpIHtcclxuICAgICAgICAgICAgY2FzZSAnYnJlYWtmYXN0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2ZpcnN0LXNuYWNrJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2Rpbm5lcic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdzZWNvbmQtc25hY2snOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZXZlbmluZy1tZWFsJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9pbmRleC1zZXJ2aWNlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBhY3RpdmVDbGFzcyA9ICcnO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNldENsYXNzTmFtZShjbGFzc05hbWUpIHtcclxuICAgICAgICBhY3RpdmVDbGFzcyA9ICdhY3RpdmUtJyArIGNsYXNzTmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDbGFzc05hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIGFjdGl2ZUNsYXNzXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRDbGFzc05hbWU6IGdldENsYXNzTmFtZSxcclxuICAgICAgICBzZXRDbGFzc05hbWU6IHNldENsYXNzTmFtZVxyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9hY3RpdmUtY2xhc3Mtc2VydmljZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHRpbWVvdXQsIHZhbGlkYXRpb25TZXJ2aWNlLCBsaW1pdHNTZXJ2aWNlLCAkd2luZG93LCBtb2RhbCkge1xyXG4gICAgdmFyIGRpZXRzID0ge1xyXG4gICAgICAgIGNhcmJvaHlkcmF0ZXM6IGZhbHNlLFxyXG4gICAgICAgIHByb3RlaW5zOiBmYWxzZVxyXG4gICAgfSxcclxuICAgICAgICBjbGFzc05hbWUgPSB7bmFtZTogJ3N0YXJ0J307XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHNldERpZXQoZGlldCkge1xyXG4gICAgICAgIGlmIChkaWV0c1tkaWV0XSkge1xyXG4gICAgICAgICAgICBkaWV0c1tkaWV0XSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiBkaWV0c1tkaWV0XSA9IHRydWUsIDApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRpZXRzLmNhcmJvaHlkcmF0ZXMgPSBkaWV0ID09PSAnY2FyYm9oeWRyYXRlcyc7XHJcbiAgICAgICAgZGlldHMucHJvdGVpbnMgPSBkaWV0ID09PSAncHJvdGVpbnMnO1xyXG4gICAgICAgIGlmICh2YWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUxpbWl0c0Nob29zZShkaWV0cy5jYXJib2h5ZHJhdGVzLCBkaWV0cy5wcm90ZWlucywgY2xhc3NOYW1lLm5hbWUpKSBzZXRMaW1pdHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRDbGFzc05hbWUocGhhc2VJZCkge1xyXG4gICAgICAgIGNsYXNzTmFtZS5uYW1lID0gJ2FjdGl2ZScgKyBwaGFzZUlkO1xyXG4gICAgICAgIGlmICh2YWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUxpbWl0c0Nob29zZShkaWV0cy5jYXJib2h5ZHJhdGVzLCBkaWV0cy5wcm90ZWlucywgY2xhc3NOYW1lLm5hbWUpKSBzZXRMaW1pdHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRMaW1pdHMoKSB7XHJcbiAgICAgICAgbGV0IGRpZXQgPSBkaWV0cy5jYXJib2h5ZHJhdGVzID8gJ2NhcmJvaHlkcmF0ZXMnIDogJ3Byb3RlaW5zJyxcclxuICAgICAgICAgICAgcGhhc2UgPSBjbGFzc05hbWUubmFtZS5zbGljZSgtMSk7XHJcbiAgICAgICAgbGltaXRzU2VydmljZS5zZXRMaW1pdHMoZGlldCwgcGhhc2UpO1xyXG5cclxuICAgICAgICAkd2luZG93LnNlc3Npb25TdG9yYWdlLnNhdmVkTGltaXRzID0gSlNPTi5zdHJpbmdpZnkoe2RpZXQ6IGRpZXQsIHBoYXNlSWQ6IHBoYXNlfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVzZXRDaG9vc2UoKSB7XHJcbiAgICAgICAgaWYgKCFsaW1pdHNTZXJ2aWNlLmxpbWl0c0RhdGEubGltaXRzKSB7XHJcbiAgICAgICAgICAgIGRpZXRzLmNhcmJvaHlkcmF0ZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGlldHMucHJvdGVpbnMgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2xhc3NOYW1lLm5hbWUgPSAnc3RhcnQnO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J/QvtC00YLQstC10YDQttC00LXQvdC40LUnLCBtZXNzYWdlOiAn0JLRiyDRgtC+0YfQvdC+INGF0L7RgtC40YLQtSDRgdCx0YDQvtGB0LjRgtGMINGD0YHRgtCw0L3QvtCy0LvQtdC90L3Ri9C1INC70LjQvNC40YLRiz8nfSwgJ2NvbmZpcm0nKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkaWV0cy5jYXJib2h5ZHJhdGVzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBkaWV0cy5wcm90ZWlucyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lLm5hbWUgPSAnc3RhcnQnO1xyXG5cclxuICAgICAgICAgICAgICAgICR3aW5kb3cuc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgnc2F2ZWRMaW1pdHMnKTtcclxuICAgICAgICAgICAgICAgIGxpbWl0c1NlcnZpY2UuY2xlYXJMaW1pdHMoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbG9hZExpbWl0cygpIHtcclxuICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZWRMaW1pdHMpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVkTGltaXRzKTtcclxuICAgICAgICAgICAgc2V0RGlldChkYXRhLmRpZXQpO1xyXG4gICAgICAgICAgICBzZXRDbGFzc05hbWUoZGF0YS5waGFzZUlkKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBkaWV0czogZGlldHMsXHJcbiAgICAgICAgY2xhc3NOYW1lOiBjbGFzc05hbWUsXHJcbiAgICAgICAgc2V0RGlldDogc2V0RGlldCxcclxuICAgICAgICBzZXRDbGFzc05hbWU6IHNldENsYXNzTmFtZSxcclxuICAgICAgICBzZXRMaW1pdHM6IHNldExpbWl0cyxcclxuICAgICAgICByZXNldENob29zZTogcmVzZXRDaG9vc2UsXHJcbiAgICAgICAgbG9hZExpbWl0czogbG9hZExpbWl0c1xyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9kaWV0LWNob29zZS1zZXJ2aWNlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkcSkge1xyXG4gICAgbGV0IHN0YXRlID0gJ2Nsb3NlJyxcclxuICAgICAgICB0eXBlID0gbnVsbCxcclxuICAgICAgICBkZWZlcjtcclxuXHJcbiAgICBsZXQgbW9kYWxWaWV3RGF0YSA9IHt9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldFN0YXRlKCkge1xyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiB0eXBlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG9wZW4oZGF0YSwgbW9kYWxfdHlwZSkge1xyXG4gICAgICAgIG1vZGFsVmlld0RhdGEuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdHlwZSA9IG1vZGFsX3R5cGU7XHJcbiAgICAgICAgc3RhdGUgPSAnb3Blbic7XHJcbiAgICAgICAgaWYgKG1vZGFsX3R5cGUgPT09ICdjb25maXJtJykge1xyXG4gICAgICAgICAgICBkZWZlciA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjbG9zZShib29sKSB7XHJcbiAgICAgICAgaWYgKGJvb2wpIHtcclxuICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2NvbmZpcm0nKSB7XHJcbiAgICAgICAgICAgIGRlZmVyLnJlamVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdGF0ZSA9ICdjbG9zZSc7XHJcbiAgICAgICAgdHlwZSA9IG51bGw7XHJcbiAgICAgICAgZGVsZXRlIG1vZGFsVmlld0RhdGEuZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1vZGFsVmlld0RhdGE6IG1vZGFsVmlld0RhdGEsXHJcbiAgICAgICAgZ2V0U3RhdGU6IGdldFN0YXRlLFxyXG4gICAgICAgIGdldFR5cGU6IGdldFR5cGUsXHJcbiAgICAgICAgb3Blbjogb3BlbixcclxuICAgICAgICBjbG9zZTogY2xvc2VcclxuICAgIH1cclxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvc2VydmljZXMvbW9kYWwtc2VydmljZS5qc1xuICoqLyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQ3RDQTs7Ozs7O0FDQUE7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVUE7Ozs7Ozs7Ozs7Ozs7OztBQ1ZBO0FBQ0E7OztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWEE7QUFhQTtBQUNBOztBQWRBO0FBaUJBO0FBQ0E7QUFDQTtBQUNBOztBQXBCQTtBQUNBO0FBeUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBRkE7QUFPQTtBQVBBO0FBREE7QUFDQTtBQVdBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUZBO0FBQUE7QUFEQTtBQUNBO0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUlBO0FBREE7QUFJQTtBQUpBO0FBSkE7QUFEQTtBQUNBO0FBYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFEQTtBQUNBO0FBUUE7QUFDQTtBQUNBO0FBREE7QUFEQTtBQUNBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFEQTtBQUdBO0FBQ0E7QUFEQTtBQUhBO0FBQ0E7QUFPQTtBQVpBO0FBREE7QUFDQTs7QUFyRUE7QUF1RkE7QUFDQTtBQUNBO0FBSEE7QUFDQTs7QUF2RkE7QUE4RkE7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBREE7QUFJQTtBQUpBO0FBQ0E7QUFNQTtBQUNBO0FBREE7QUFJQTtBQUpBO0FBUkE7QUFDQTtBQWVBO0FBQ0E7QUFDQTtBQURBO0FBREE7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBTkE7QUFDQTtBQVFBOztBQUVBO0FBRUE7QUFEQTtBQUhBO0FBQ0E7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSEE7QUFRQTtBQVJBO0FBVUE7QUFaQTtBQUNBO0FBY0E7QUFDQTs7O0FBREE7QUFLQTtBQUFBO0FBQUE7QUFDQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUtBO0FBTEE7QUFPQTtBQWZBO0FBQ0E7QUFpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSEE7QUFDQTtBQU9BO0FBQ0E7QUFDQTs7QUFFQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBREE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFGQTtBQVNBO0FBQ0E7QUFDQTtBQURBO0FBRkE7QUFPQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFUQTtBQUNBO0FBYUE7QUFDQTtBQUNBO0FBREE7QUFEQTtBQTNCQTtBQWxCQTtBQUNBO0FBb0RBO0FBQ0E7QUFFQTtBQUNBO0FBREE7QUFDQTs7QUFGQTs7QUFBQTtBQUNBO0FBU0E7QUFYQTtBQURBO0FBQ0E7QUFlQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBS0E7QUFDQTtBQURBO0FBQ0E7QUFJQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUNBO0FBS0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSUE7QUFKQTtBQUZBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFMQTtBQU9BO0FBUkE7QUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFGQTtBQU5BO0FBRkE7QUFnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBRkE7QUFOQTtBQWNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7QUFmQTtBQXNCQTtBQUNBOzs7QUFHQTtBQUhBO0FBTUE7QUFDQTtBQURBO0FBR0E7QUFDQTtBQVZBO0FBREE7Ozs7QUFrQkE7QUFDQTtBQURBO0FBbEJBO0FBREE7OztBQTBCQTtBQUhBO0FBekVBO0FBQ0E7QUErRUE7QUFDQTs7QUFFQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBTkE7QUFEQTtBQUNBO0FBWUE7O0FBRUE7QUFBQTtBQUFBO0FBQ0E7O0FBSEE7QUFNQTtBQURBO0FBR0E7QUFDQTtBQURBO0FBSUE7QUFDQTtBQURBO0FBSkE7QUFSQTtBQUNBO0FBaUJBO0FBQ0E7QUFDQTtBQURBO0FBREE7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFiQTtBQUNBO0FBaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUFOQTtBQUNBO0FBZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSEE7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFDQTtBQUtBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFEQTtBQVJBO0FBWUE7QUFuQkE7QUFDQTtBQXFCQTtBQUNBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQU1BO0FBUkE7QUFDQTtBQVVBOztBQUVBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBSEE7QUFLQTtBQUNBO0FBUkE7QUFEQTtBQWFBO0FBREE7QUFHQTtBQUhBO0FBakJBO0FBQ0E7QUF1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFKQTtBQXBCQTtBQUhBO0FBZ0NBO0FBaENBO0FBQ0E7QUFrQ0E7QUFHQTtBQUhBO0FBS0E7QUFEQTtBQUdBO0FBSEE7QUExQ0E7QUFDQTtBQWdEQTtBQUNBO0FBQ0E7QUFEQTtBQUlBO0FBREE7QUFJQTtBQUpBO0FBSkE7QUFDQTtBQVdBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUpBO0FBQ0E7QUFVQTtBQUNBO0FBR0E7QUFIQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBRkE7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBcEJBO0FBREE7QUFDQTtBQTRCQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBQ0E7QUFLQTtBQUNBO0FBREE7QUFDQTtBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBREE7QUFJQTtBQUpBO0FBTUE7QUFDQTtBQWRBO0FBQ0E7QUFnQkE7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUtBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQURBO0FBR0E7QUFiQTtBQUNBOztBQXpuQkE7QUEwb0JBO0FBREE7QUFDQTs7QUExb0JBO0FBK29CQTtBQURBO0FBQ0E7O0FBL29CQTtBQW9wQkE7QUFEQTtBQUNBOztBQXBwQkE7QUF5cEJBO0FBREE7QUFDQTs7QUF6cEJBO0FBOHBCQTtBQURBO0FBQ0E7O0FBOXBCQTs7QUFvcUJBO0FBQ0E7QUFEQTtBQUlBO0FBSkE7QUFGQTtBQUNBO0FBU0E7QUFDQTs7QUE3cUJBO0FBZ3JCQTtBQUNBO0FBQ0E7QUFDQTs7QUFuckJBO0FBQ0E7O0FBREE7QUF5ckJBO0FBQ0E7O0FBMXJCQTtBQUNBOztBQURBO0FBZ3NCQTtBQUNBO0FBRkE7QUEvckJBO0FBQ0E7QUFvc0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW5DQTtBQXFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBR0E7QUFKQTtBQU1BO0FBVEE7QUEzQ0E7QUEvdUJBOzs7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFNQTtBQUNBO0FBRUE7QUFDQTtBQUhBO0FBTUE7QUFDQTtBQVBBO0FBVUE7QUFDQTtBQVhBO0FBY0E7QUFDQTtBQWZBO0FBa0JBO0FBQ0E7QUFuQkE7QUFzQkE7QUFDQTtBQXZCQTtBQTBCQTtBQUNBO0FBM0JBO0FBQ0E7QUE2QkE7QUEvQkE7QUFDQTtBQWlDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7QUFDQTtBQU1BOzs7Ozs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVFBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFLQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUZBO0FBdEJBO0FBMkJBO0FBNUJBO0FBQ0E7QUE4QkE7Ozs7OztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBWEE7QUFnQkE7QUFqQkE7QUFDQTtBQW1CQTs7Ozs7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFDQTtBQUFBO0FBQUE7QUFMQTtBQU9BO0FBUkE7QUFDQTtBQVVBOzs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFKQTtBQUhBO0FBQ0E7QUFVQTtBQUVBO0FBREE7QUFHQTtBQUNBO0FBQUE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEE7QUFDQTtBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFQQTtBQUNBO0FBVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQU1BO0FBQ0E7QUFDQTtBQUZBO0FBTkE7QUFGQTtBQUNBO0FBY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFWQTtBQUNBOzs7QUFuRkE7QUFDQTtBQW9HQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUxBO0FBT0E7QUFFQTtBQUNBO0FBRkE7QUFGQTtBQVJBO0FBckdBO0FBMEhBO0FBM0hBO0FBQ0E7QUE2SEE7Ozs7OztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFaQTtBQWlCQTtBQWxCQTtBQUNBO0FBb0JBOzs7Ozs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFNQTs7Ozs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQVZBO0FBWUE7QUFiQTtBQUNBO0FBZUE7Ozs7OztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBSEE7QUFNQTtBQUNBOztBQVBBO0FBQ0E7O0FBREE7QUFhQTtBQWJBO0FBQ0E7QUFnQkE7QUFDQTtBQUNBO0FBRkE7QUF2Q0E7QUE0Q0E7QUFwREE7QUFDQTtBQXNEQTs7Ozs7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBREE7QUFEQTtBQUtBO0FBVkE7QUFDQTtBQVlBOzs7Ozs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7OztBQUNBOztBQURBO0FBSUE7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUVBO0FBQ0E7O0FBRkE7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVhBO0FBTkE7O0FBdUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBN0JBO0FBSEE7QUFDQTtBQW9DQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRkE7QUFGQTtBQURBO0FBQ0E7QUFVQTs7O0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUZBO0FBSUE7QUFEQTtBQUxBO0FBU0E7QUFDQTtBQUNBO0FBRUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQURBO0FBR0E7QUFBQTtBQUxBO0FBT0E7QUFQQTtBQVZBO0FBRkE7QUFDQTtBQXlCQTs7O0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBREE7QUFHQTtBQVBBO0FBRkE7QUFDQTtBQVlBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUhBO0FBRkE7QUFRQTtBQVJBO0FBREE7QUF6RkE7QUFzR0E7QUEzR0E7QUFDQTtBQTZHQTs7Ozs7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQU5BO0FBUkE7QUFvQkE7QUF4QkE7QUFDQTtBQTBCQTs7Ozs7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBS0E7Ozs7OztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFWQTtBQUNBO0FBWUE7QUFDQTtBQURBO0FBakJBO0FBcUJBO0FBM0JBO0FBQ0E7QUE2QkE7Ozs7OztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUdBO0FBUEE7QUFDQTtBQVNBOzs7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQU1BO0FBWEE7QUFDQTtBQWFBOzs7Ozs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBOzs7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFGQTtBQVhBO0FBZ0JBO0FBdEJBO0FBQ0E7QUF3QkE7Ozs7OztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7QUFNQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBWkE7QUFEQTtBQUNBO0FBZ0JBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUhBO0FBQ0E7QUFPQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTkE7QUFGQTtBQVdBO0FBQ0E7QUFiQTtBQWVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQTVCQTtBQUNBO0FBOEJBO0FBckNBO0FBQ0E7QUF1Q0E7QUEzQ0E7QUFGQTtBQUNBO0FBa0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVJBO0FBbkdBOzs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBREE7QUFHQTtBQURBO0FBR0E7QUFEQTtBQUdBO0FBREE7QUFHQTtBQURBO0FBRUE7QUFGQTtBQVRBO0FBQ0E7QUFhQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQURBO0FBT0E7QUFuQkE7QUFDQTtBQXFCQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBNUNBOzs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTkE7QUFGQTtBQUNBO0FBV0E7QUFDQTtBQURBO0FBZkE7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUZBO0FBQ0E7QUFLQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFiQTs7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQU5BO0FBUUE7QUFDQTtBQVRBO0FBV0E7QUFDQTtBQVpBO0FBY0E7QUFDQTtBQWZBO0FBaUJBO0FBakJBO0FBREE7QUFEQTs7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFGQTtBQVhBOzs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBUkE7QUFDQTtBQVVBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMQTtBQUNBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFNQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU5BO0FBUkE7QUFDQTtBQWlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFEQTtBQUNBO0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBBO0FBM0RBOzs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUpBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFSQTtBQUNBO0FBVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFwQ0E7OzsiLCJzb3VyY2VSb290IjoiIn0=