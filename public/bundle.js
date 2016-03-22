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
	var diaryModule = __webpack_require__(15);
	var tableModule = __webpack_require__(28);

	var app = angular.module('app', ['main', 'diary', 'table', 'ngAnimate', 'angucomplete-alt']);

	app.filter('limit', __webpack_require__(39));
	app.factory('dataService', __webpack_require__(40)).factory('validationService', __webpack_require__(41)).factory('calculationService', __webpack_require__(42)).factory('limitsService', __webpack_require__(43)).factory('indexService', __webpack_require__(44)).factory('activeClassService', __webpack_require__(45)).factory('dietChoose', __webpack_require__(46)).factory('modal', __webpack_require__(101));

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

	main.config(function ($stateProvider) {
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
	var v1="<div class=\"left-side-menu\">\r\n    <div class=\"to-another-design\" ng-class=\"$ctrl.backIconClassName\"></div>\r\n\r\n    <div class=\"menu-item\" ng-repeat=\"item in $ctrl.menuItems\" ng-class=\"[item.className, $ctrl.activeClass()]\" ng-click=\"$ctrl.setState(item.className)\" ng-mouseenter=\"$ctrl.toggle(item)\" ng-mouseleave=\"$ctrl.toggle(item)\">\r\n        <div class=\"tooltip\" ng-if=\"item.tooltipShow\">{{item.tooltip}}</div>\r\n    </div>\r\n\r\n</div>";
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
	    controller: function controller() {},
	    template: homePageTemplate
	};

		module.exports = homePage;

/***/ },
/* 9 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"home-page\">\r\n    <div class=\"daytime-select-tooltip\">Выберете время дня,\r\n        чтобы приступить к заполнению дневника</div>\r\n    <div class=\"home-header\">\r\n        <div class=\"left-line\"></div>\r\n        <div class=\"right-line\"></div>\r\n        <h2>Дневник питания</h2>\r\n    </div>\r\n\r\n    <div class=\"menu-select-tooltip\">Чтобы установить лимиты,\r\n        сохранить данные, добавить еду либо\r\n        просмотреть итог и таблицы воспользуйтесь меню</div>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("home-page-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var viewTemplate = __webpack_require__(11);

	var view = {
	    controller: function controller(dataService, limitsService, $window, $stateParams, $state, $timeout) {
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
	            tablesData: {}
	        };

	        dataService.getTableData().then(function (data) {
	            _this.viewData.tablesData.foodsObjs = data;
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
	                carbohyd: { name: 'Угдеводы', value: 0 },
	                prot: { name: 'Протеины', value: 0 },
	                fat: { name: 'Жиры', value: 0 },
	                kall: { name: 'Калории', value: 0 }
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

	var modalTemplate = __webpack_require__(100);

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
/* 13 */,
/* 14 */,
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var diaryModule = angular.module('diary', []);

	diaryModule.component('menu', __webpack_require__(16)).component('mainView', __webpack_require__(18)).component('dayTime', __webpack_require__(20)).component('food', __webpack_require__(22)).component('saveMenu', __webpack_require__(24)).component('result', __webpack_require__(26));

		module.exports = diaryModule;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var menuTemplate = __webpack_require__(17);

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
/* 17 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div id=\"menu\">\r\n    <div class=\"diet-menu\">\r\n        <div class=\"diet-tittle\">Вид диеты:</div>\r\n        <div class=\"diet-choose\">\r\n            <span class=\"diet\" ng-class=\"{active: $ctrl.diets.proteins}\" ng-click=\"$ctrl.setDiet('proteins')\">Высокопротеиновая комбинация замен</span>\r\n            <br>\r\n            <span class=\"diet\" ng-class=\"{active: $ctrl.diets.carbohydrates}\" ng-click=\"$ctrl.setDiet('carbohydrates')\">Высокоуглеводная комбинация замен</span>\r\n        </div>\r\n    </div>\r\n    <div class=\"phase-menu\">\r\n        <div class=\"phase-tittle\">Выберете Вашу фазу:</div>\r\n        <div class=\"phase-choose\">\r\n\r\n            <div ng-class=\"$ctrl.className.name\" class=\"first-phase\" ng-click=\"$ctrl.setClassName(1)\"><span>-</span> 1 <span>-</span></div>\r\n            <div ng-class=\"$ctrl.className.name\" class=\"second-phase\" ng-click=\"$ctrl.setClassName(2)\"><span>-</span> 2 <span>-</span></div>\r\n            <div ng-class=\"$ctrl.className.name\" class=\"third-phase\" ng-click=\"$ctrl.setClassName(3)\"><span>-</span> 3 <span>-</span></div>\r\n\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"clear-limits\" ng-click=\"$ctrl.resetChoose()\">Сбросить лимиты</div>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("menu-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mainViewTemplate = __webpack_require__(19);

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

	        this.base = dataService.base;
	        this.viewData = {
	            limitsData: limitsService.limitsData
	        };

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
/* 19 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"main-view\">\n    <day-time ng-repeat=\"time in $ctrl.viewData.dayTimes\" time=\"time\" base=\"$ctrl.base\" day-time-limits=\"$ctrl.viewData.limitsData\" add=\"$ctrl.addFood(dayTimeId, food)\" remove=\"$ctrl.removeFood(dayTimeId, food)\" toggle=\"$ctrl.toggleDayTime(id)\"></day-time>\n\n    <div class=\"result\">\n        <div class=\"result-tittle\">Итого</div>\n\n        <section class=\"table-result\">\n            <div class=\"table-result-tittle\">\n                <span class=\"result-no-name\">----------------</span>\n                <span class=\"portion\">Порция(гр)</span>\n                <span class=\"carbohyd\">Углеводы</span>\n                <span class=\"prot\">Белки</span>\n                <span class=\"fat\">Жиры</span>\n                <span class=\"kall\">Калории</span>\n            </div>\n\n            <div class=\"result-final\">\n                <span class=\"name\"></span>\n                <span class=\"portion\">---</span>\n                <span class=\"carbohyd\" ng-class=\"{'active-limit': $ctrl.compare('carbohyd')}\">{{ $ctrl.viewData.resultFinal.carbohyd }} {{'(' + $ctrl.viewData.limitsData.limits[\"Итог\"].carbohyd + ')' | limit }}</span>\n                <span class=\"prot\" ng-class=\"{'active-limit': $ctrl.compare('prot')}\">{{ $ctrl.viewData.resultFinal.prot  }} {{'(' + $ctrl.viewData.limitsData.limits[\"Итог\"].prot + ')' | limit }}</span>\n                <span class=\"fat\" ng-class=\"{'active-limit': $ctrl.compare('fat')}\">{{ $ctrl.viewData.resultFinal.fat }} {{'(' + $ctrl.viewData.limitsData.limits[\"Итог\"].fat + ')' | limit }}</span>\n                <span class=\"kall\" ng-class=\"{'active-limit': $ctrl.compare('kall')}\">{{ $ctrl.viewData.resultFinal.kall }} {{'(' + $ctrl.viewData.limitsData.limits[\"Итог\"].kall + ')' | limit }}</span>\n            </div>\n\n        </section>\n    </div>\n</div>\n<save-menu day-times-data=\"$ctrl.viewData.dayTimes\" result=\"$ctrl.viewData.resultFinal\"></save-menu>";
	ngModule.run(["$templateCache",function(c){c.put("main-view.html",v1)}]);
	module.exports=v1;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var dayTimeTemplate = __webpack_require__(21);

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
/* 21 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"day-time\">\r\n    <div class=\"input\">\r\n        <form>\r\n            <label>Наименование: <angucomplete-alt ng-keypress=\"$ctrl.enter($event)\" id=\"ex1\" placeholder=\"Введите продукт\" pause=\"100\" selected-object=\"$ctrl.foodName\" local-data=\"$ctrl.base.foods.keys\" search-fields=\"foodName\" title-field=\"foodName\" minlength=\"1\" input-changed=\"$ctrl.onInput\" input-class=\"food form-control-small\" match-class=\"highlight\"></angucomplete-alt></label>\r\n            <br>\r\n\r\n            <label>Порция(гр): <input type=\"text\" class=\"portion-input\" size=\"2\" ng-model=\"$ctrl.portion\" ng-keypress=\"$ctrl.enter($event)\"/></label>\r\n        </form>\r\n        <div class=\"add-button\" ng-click=\"$ctrl.addFood()\">+</div>\r\n    </div>\r\n\r\n    <div class=\"table-border\">\r\n        <div class=\"table\">\r\n            <div class=\"table-tittle\">\r\n                <span class=\"name\">Наименование продукта</span>\r\n                <span class=\"portion\">Порция (гр)</span>\r\n                <span class=\"carbohyd\">Углеводы</span>\r\n                <span class=\"prot\">Белки</span>\r\n                <span class=\"fat\">Жиры</span>\r\n                <span class=\"kall\">Калории</span>\r\n            </div>\r\n\r\n\r\n            <food ng-repeat=\"food in $ctrl.daytimes[$ctrl.index].foods\" food=\"food\" remove=\"$ctrl.removeFood(food)\"></food>\r\n\r\n\r\n            <div class=\"summary\">\r\n                <span class=\"name\">Подытог</span>\r\n                <span class=\"portion\">---</span>\r\n                <span class=\"carbohyd\" ng-class=\"{'active-limit': $ctrl.compare('carbohyd')}\">{{ $ctrl.daytimes[$ctrl.index].result.carbohyd }} {{'(' + $ctrl.limits().carbohyd + ')' | limit }}</span>\r\n                <span class=\"prot\" ng-class=\"{'active-limit': $ctrl.compare('prot')}\">{{ $ctrl.daytimes[$ctrl.index].result.prot }} {{'(' + $ctrl.limits().prot + ')' | limit }}</span>\r\n                <span class=\"fat\" ng-class=\"{'active-limit': $ctrl.compare('fat')}\">{{ $ctrl.daytimes[$ctrl.index].result.fat }} {{'(' + $ctrl.limits().fat + ')' | limit }}</span>\r\n                <span class=\"kall\" ng-class=\"{'active-limit': $ctrl.compare('kall')}\">{{ $ctrl.daytimes[$ctrl.index].result.kall }} {{'(' + $ctrl.limits().kall + ')' | limit }}</span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n</div>\r\n\r\n\r\n<div class=\"br\"></div>";
	ngModule.run(["$templateCache",function(c){c.put("day-time-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var foodTemplate = __webpack_require__(23);

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
/* 23 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"food\" ng-class=\"$ctrl.checkEmptyFood($ctrl.food)\">\r\n    <span class=\"name\">{{ $ctrl.food.name }}</span>\r\n    <span class=\"portion\">{{ $ctrl.food.portion }}</span>\r\n    <span class=\"carbohyd\">{{ $ctrl.food.carbohyd }}</span>\r\n    <span class=\"prot\">{{ $ctrl.food.prot }}</span>\r\n    <span class=\"fat\">{{ $ctrl.food.fat }}</span>\r\n    <span class=\"kall\">{{ $ctrl.food.kall }}</span>\r\n    <div class=\"remove-food\" ng-click=\"$ctrl.remove({food: $ctrl.food})\"></div>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("food-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var saveMenuTemplate = __webpack_require__(25);

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
	    },
	    template: saveMenuTemplate
	};

		module.exports = saveMenu;

/***/ },
/* 25 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"save-menu\">\r\n    <div class=\"title\">Управление данными</div>\r\n\r\n    <div>\r\n        <div class=\"button save-button\" ng-click=\"$ctrl.saveData()\">Сохранить изменения</div>\r\n        <div class=\"button remove-data\">Удалить сохранения</div>\r\n    </div>\r\n\r\n    <div class=\"title\">Для печати</div>\r\n\r\n    <div class=\"print-menu\">\r\n        <div class=\"button to-print\" ng-click=\"$ctrl.preview()\">Предпросмотр</div>\r\n        <div class=\"button print-to-localStorage\" ng-click=\"$ctrl.saveForPrint()\">Сохранить для печати</div>\r\n        <div class=\"button remove-print-localStorage\" ng-click=\"$ctrl.removePrintSaves()\">Удалить сохранения</div>\r\n    </div>\r\n</div>\r\n\r\n\r\n<div class=\"br\"></div>";
	ngModule.run(["$templateCache",function(c){c.put("save-menu-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var resultTemplate = __webpack_require__(27);

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
/* 27 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"result\">\r\n    <div class=\"result-title\">Итог дня</div>\r\n\r\n    <div class=\"result-table\" ng-repeat=\"(key, element) in $ctrl.result\">\r\n        <div class=\"title\" ng-class=\"{}\">\r\n            {{element.name}} <span ng-if=\"!!$ctrl.limitsData.limits\">(max {{$ctrl.limitsData.limits['Итог'][key]}})</span>\r\n        </div>\r\n        <div class=\"value\" ng-class=\"{'limits': !!$ctrl.limitsData.limits}\">\r\n            {{element.value}}\r\n            <span ng-if=\"!!$ctrl.limitsData.limits\">{{ $ctrl.calcPercent(element.value, $ctrl.limitsData.limits['Итог'][key]) }}</span>\r\n            <div class=\"graph\" ng-if=\"!!$ctrl.limitsData.limits\" ng-style=\"$ctrl.calcGraph(element.value, $ctrl.limitsData.limits['Итог'][key])\"></div>\r\n        </div>\r\n    </div>\r\n\r\n\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("result-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var tableModule = angular.module('table', []);

	tableModule.component('tableView', __webpack_require__(29)).component('tableAdd', __webpack_require__(31)).component('foodTable', __webpack_require__(33)).component('storageTable', __webpack_require__(35)).component('tables', __webpack_require__(37));

		module.exports = tableModule;

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var tableViewTemplate = __webpack_require__(30);

	var tableView = {
	    controller: function controller(dataService, $window) {
	        var _this = this;

	        dataService.getTableData().then(function (data) {
	            _this.foodsObjs = data;
	        });

	        if ($window.localStorage.myFoods) this.myFoods = JSON.parse($window.localStorage.myFoods);

	        this.removeMyFood = function (name) {
	            delete this.myFoods[name];
	            $window.localStorage.myFoods = JSON.stringify(this.myFoods);

	            dataService.removeFromBase(name);
	        };

	        this.addMyFood = function (name, values) {
	            if (this.myFoods[name]) {
	                if (!confirm('Перезаписать существующий продукт?')) return;
	                dataService.removeFromBase(name);
	            }
	            this.myFoods[name] = values;
	            $window.localStorage.myFoods = JSON.stringify(this.myFoods);

	            dataService.addToBase(name, values);
	        };
	    },
	    template: tableViewTemplate
	};

		module.exports = tableView;

/***/ },
/* 30 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<table-add add-my-food=\"$ctrl.addMyFood(name, values)\"></table-add>\r\n\r\n<div class=\"table-container\">\r\n    <food-table ng-repeat=\"foodsObj in $ctrl.foodsObjs\" foods-obj=\"foodsObj\"></food-table>\r\n    <storage-table my-foods=\"$ctrl.myFoods\" remove-my-food=\"$ctrl.removeMyFood(name)\"></storage-table>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("table-view-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var addToTableTemplate = __webpack_require__(32);

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
/* 32 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"add-to-table-form\">\r\n    <h3 class=\"add-form-title\">Добавить продукт в таблицу</h3>\r\n    <form class=\"table-form\">\r\n        <table>\r\n            <tr><td><label for=\"food-name\">Наименование:</label></td><td><input type=\"text\" id=\"food-name\" ng-model=\"$ctrl.name\" ng-keydown=\"$ctrl.add($event)\"/></td></tr>\r\n            <tr><td><label for=\"table-form-portion\">Порция(гр):</label></td><td><input type=\"text\" id=\"table-form-portion\" size=\"2\" ng-model=\"$ctrl.values[0]\" ng-keydown=\"$ctrl.add($event)\"/></td></tr>\r\n            <tr><td><label for=\"table-form-carbohyd\">Углеводы:</label></td><td><input type=\"text\" id=\"table-form-carbohyd\" size=\"2\" ng-model=\"$ctrl.values[1]\" ng-keydown=\"$ctrl.add($event)\"/></td></tr>\r\n            <tr><td><label for=\"table-form-prot\">Белки:</label></td><td><input type=\"text\" id=\"table-form-prot\" size=\"2\" ng-model=\"$ctrl.values[2]\" ng-keydown=\"$ctrl.add($event)\"/></td></tr>\r\n            <tr><td><label for=\"table-form-fat\">Жиры:</label></td><td><input type=\"text\" id=\"table-form-fat\" size=\"2\" ng-model=\"$ctrl.values[3]\" ng-keydown=\"$ctrl.add($event)\"/></td></tr>\r\n            <tr><td><label for=\"table-form-kal\">Калории:</label></td><td><input type=\"text\" id=\"table-form-kal\" size=\"2\" ng-model=\"$ctrl.values[4]\" ng-keydown=\"$ctrl.add($event)\"/></td></tr>\r\n        </table>\r\n\r\n        <div class=\"add-to-table-button\" ng-click=\"$ctrl.add()\">+</div>\r\n    </form>\r\n\r\n</div>\r\n\r\n<div class=\"my-table\">\r\n<storage-table my-foods=\"$ctrl.myFoods\" remove=\"$ctrl.remove(name)\"></storage-table></div>";
	ngModule.run(["$templateCache",function(c){c.put("add-to-table-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var tableTemplate = __webpack_require__(34);

	var table = {
	    bindings: {
	        foodsObj: '<'
	    },
	    controller: function controller() {},
	    template: tableTemplate
	};

		module.exports = table;

/***/ },
/* 34 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<table class=\"tb\">\r\n    <caption class=\"tb-title\">{{ $ctrl.foodsObj.title }}</caption>\r\n    <tr ng-repeat=\"food in $ctrl.foodsObj.foods\" ng-click=\"$ctrl.remove({food: food, obj: $ctrl.foodsObj.foods})\" ng-class=\"food.className\">\r\n        <td class=\"td-name name-color\" ng-class=\"food.className\">{{ food.values.name }}</td>\r\n        <td class=\"portion-color\" ng-class=\"food.className\">{{ food.values.portion }}</td>\r\n        <td class=\"carbohyd-color\" ng-class=\"food.className\">{{ food.values.carbohyd }}</td>\r\n        <td class=\"prot-color\" ng-class=\"food.className\">{{ food.values.prot }}</td>\r\n        <td class=\"fat-color\" ng-class=\"food.className\">{{ food.values.fat }}</td>\r\n        <td class=\"kall-color\" ng-class=\"food.className\">{{ food.values.kall }}</td>\r\n    </tr>\r\n</table>";
	ngModule.run(["$templateCache",function(c){c.put("table-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var storageTableTemplate = __webpack_require__(36);

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
/* 36 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<table class=\"tb\" ng-if=\"$ctrl.show()\">\r\n    <caption class=\"tb-title\">Добавленые продукты</caption>\r\n    <tr>\r\n        <td class=\"td-name name-color color\">Наименование продукта</td>\r\n        <td class=\"portion-color color\">Порция</td>\r\n        <td class=\"carbohyd-color color\">Углеводы</td>\r\n        <td class=\"prot-color color\">Белки</td>\r\n        <td class=\"fat-color color\">Жиры</td>\r\n        <td class=\"kall-color color\">Калории</td>\r\n    </tr>\r\n\r\n    <tr class=\"my-food\" ng-repeat=\"(foodName, values) in $ctrl.myFoods\" ng-click=\"$ctrl.remove({name: foodName})\">\r\n        <td class=\"td-name\">{{ foodName }}</td>\r\n        <td>{{ values[0] }}</td>\r\n        <td>{{ values[1] }}</td>\r\n        <td>{{ values[2] }}</td>\r\n        <td>{{ values[3] }}</td>\r\n        <td>{{ values[4] }}</td>\r\n    </tr>\r\n</table>";
	ngModule.run(["$templateCache",function(c){c.put("storage-table-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var template = __webpack_require__(38);

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
/* 38 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"tables-list\">\r\n    <div class=\"title\">Таблицы</div>\r\n    <div class=\"list\">\r\n        <div ng-repeat=\"obj in $ctrl.foodsObjs\" ng-click=\"$ctrl.showTable(obj.$$hashKey)\" ng-class=\"{'active-table-title': $ctrl.$$hashKey === obj.$$hashKey}\">\r\n            - {{obj.title}}\r\n        </div>\r\n        <div ng-if=\"$ctrl.showMyFoodTitle()\" ng-click=\"$ctrl.showTable('add-food')\" ng-class=\"{'active-table-title': $ctrl.$$hashKey === 'add-food'}\">- Добавленные продукты</div>\r\n    </div>\r\n</div>\r\n\r\n<div class=\"table-container\">\r\n    <food-table ng-repeat=\"foodsObj in $ctrl.foodsObjs\" foods-obj=\"foodsObj\" ng-if=\"$ctrl.$$hashKey === foodsObj.$$hashKey\"></food-table>\r\n    <storage-table my-foods=\"$ctrl.myFoods\" remove=\"$ctrl.remove(name)\" ng-if=\"$ctrl.$$hashKey === 'add-food'\"></storage-table>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("single-page-tables-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 39 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
	    return function (value) {
	        if (value.length === 2) return '';
	        return value;
	    };
		};

/***/ },
/* 40 */
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

	    if ($window.localStorage.saveData && !confirm('Загрузить сохранения?')) {
	        if (confirm('Удалить имеющиеся сохранения?')) {
	            $window.localStorage.removeItem('saveData');
	            $window.localStorage.removeItem('savedLimits');
	        }
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
/* 41 */
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
/* 42 */
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
/* 43 */
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
/* 44 */
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
/* 45 */
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
/* 46 */
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

	    if ($window.localStorage.savedLimits) {
	        var data = JSON.parse($window.localStorage.savedLimits);
	        setDiet(data.diet);
	        setClassName(data.phaseId);
	    }

	    return {
	        diets: diets,
	        className: className,
	        setDiet: setDiet,
	        setClassName: setClassName,
	        setLimits: setLimits,
	        resetChoose: resetChoose
	    };
		};

/***/ },
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"modal-background\" ng-if=\"$ctrl.checkOpen()\">\r\n    <div class=\"window an\" ng-if=\"$ctrl.checkOpen()\">\r\n        <div class=\"title\">{{ $ctrl.modalViewData.data.title }}</div>\r\n        <div class=\"message\">{{ $ctrl.modalViewData.data.message }}</div>\r\n        <div class=\"buttons group\">\r\n            <div class=\"confirm\" ng-if=\"$ctrl.checkType('confirm')\">\r\n                <div class=\"reject\" ng-click=\"$ctrl.close()\">Отмена</div>\r\n                <div class=\"ok\" ng-click=\"$ctrl.close(true)\">OK</div>\r\n            </div>\r\n            <div class=\"alert\" ng-if=\"$ctrl.checkType('alert')\" ng-click=\"$ctrl.close()\">Закрыть</div>\r\n        </div>\r\n        <div class=\"close\" ng-click=\"$ctrl.close()\">x</div>\r\n    </div>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("modal-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 101 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIDBmYWZiOGZlZTY3MmQxMGE4YTMzIiwid2VicGFjazovLy9qcy9kaWFyeUFwcC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL2luZGV4LmpzIiwid2VicGFjazovLy9ub2RlX21vZHVsZXMvYW5ndWNvbXBsZXRlLWFsdC9hbmd1Y29tcGxldGUtYWx0LmpzIiwid2VicGFjazovLy9qcy9hcHAvbWFpbi1tb2R1bGUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9tYWluLW1vZHVsZS9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQvbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9tYWluLW1vZHVsZS9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQvdGVtcGxhdGUvbGVmdC1zaWRlLW1lbnUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL21haW4tbW9kdWxlL2RheXRpbWUtY2hvb3NlLWNvbXBvbmVudC9kYXl0aW1lLWNob29zZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL21haW4tbW9kdWxlL2RheXRpbWUtY2hvb3NlLWNvbXBvbmVudC90ZW1wbGF0ZS9kYXl0aW1lLWNob29zZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvbWFpbi1tb2R1bGUvaG9tZS1wYWdlLW1vZHVsZS9ob21lLXBhZ2UtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9tYWluLW1vZHVsZS9ob21lLXBhZ2UtbW9kdWxlL3RlbXBsYXRlL2hvbWUtcGFnZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvbWFpbi1tb2R1bGUvdmlldy1jb21wb25lbnQvdmlldy1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL21haW4tbW9kdWxlL3ZpZXctY29tcG9uZW50L3RlbXBsYXRlL3ZpZXctdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL21haW4tbW9kdWxlL21vZGFsLXdpbmRvdy1jb21wb25lbnQvbW9kYWwtd2luZG93LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9tZW51L21lbnUtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9kaWFyeS1tb2R1bGUvbWVudS90ZW1wbGF0ZS9tZW51LXRlbXBsYXRlLmh0bWwiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9kaWFyeS1tb2R1bGUvbWFpbi12aWV3L21haW4tdmlldy1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9tYWluLXZpZXcvdGVtcGxhdGUvbWFpbi12aWV3Lmh0bWwiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9kaWFyeS1tb2R1bGUvZGF5LXRpbWUvZGF5LXRpbWUtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9kaWFyeS1tb2R1bGUvZGF5LXRpbWUvdGVtcGxhdGUvZGF5LXRpbWUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9mb29kL2Zvb2QtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9kaWFyeS1tb2R1bGUvZm9vZC90ZW1wbGF0ZS9mb29kLXRlbXBsYXRlLmh0bWwiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9kaWFyeS1tb2R1bGUvc2F2ZS1tZW51L3NhdmUtbWVudS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9zYXZlLW1lbnUvdGVtcGxhdGUvc2F2ZS1tZW51LXRlbXBsYXRlLmh0bWwiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9kaWFyeS1tb2R1bGUvcmVzdWx0LWNvbXBvbmVudC9yZXN1bHQtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9kaWFyeS1tb2R1bGUvcmVzdWx0LWNvbXBvbmVudC90ZW1wbGF0ZS9yZXN1bHQtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS12aWV3LWNvbXBvbmVudC90YWJsZS12aWV3LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLXZpZXctY29tcG9uZW50L3RlbXBsYXRlL3RhYmxlLXZpZXctdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L2FkZC10by10YWJsZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLWNvbXBvbmVudC90YWJsZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS1jb21wb25lbnQvdGVtcGxhdGUvdGFibGUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9zdG9yYWdlLXRhYmxlLWNvbXBvbmVudC9zdG9yYWdlLXRhYmxlLWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvdGFibGUtbW9kdWxlL3N0b3JhZ2UtdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL3N0b3JhZ2UtdGFibGUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9zaW5nbGUtcGFnZS10YWJsZXMtY29tcG9uZW50L3NpbmdsZS1wYWdlLXRhYmxlcy1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL3RhYmxlLW1vZHVsZS9zaW5nbGUtcGFnZS10YWJsZXMtY29tcG9uZW50L3RlbXBsYXRlL3NpbmdsZS1wYWdlLXRhYmxlcy10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvc2VydmljZXMvbGltaXRzLWZpbHRlci5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2RhdGEtc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL3ZhbGlkYXRpb24tc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2NhbGN1bGF0aW9uLXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9zZXJ2aWNlcy9saW1pdHMtc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2luZGV4LXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9zZXJ2aWNlcy9hY3RpdmUtY2xhc3Mtc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2RpZXQtY2hvb3NlLXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL21haW4tbW9kdWxlL21vZGFsLXdpbmRvdy1jb21wb25lbnQvdGVtcGxhdGUvbW9kYWwtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL21vZGFsLXNlcnZpY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCAwZmFmYjhmZWU2NzJkMTBhOGEzM1xuICoqLyIsInJlcXVpcmUoJy4vYXBwJyk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvZGlhcnlBcHAuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcbmNvbnN0IGF1dG9jb21wbGl0ZSA9IHJlcXVpcmUoJ2FuZ3Vjb21wbGV0ZS1hbHQnKTtcclxuY29uc3QgbWFpbk1vZHVsZSA9IHJlcXVpcmUoJy4vbWFpbi1tb2R1bGUnKTtcclxuY29uc3QgZGlhcnlNb2R1bGUgPSByZXF1aXJlKCcuL2RpYXJ5LW1vZHVsZScpO1xyXG5jb25zdCB0YWJsZU1vZHVsZSA9IHJlcXVpcmUoJy4vdGFibGUtbW9kdWxlJyk7XHJcblxyXG5jb25zdCBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWydtYWluJywgJ2RpYXJ5JywgJ3RhYmxlJywgJ25nQW5pbWF0ZScsICdhbmd1Y29tcGxldGUtYWx0J10pO1xyXG5cclxuYXBwLmZpbHRlcignbGltaXQnLCByZXF1aXJlKCcuL3NlcnZpY2VzL2xpbWl0cy1maWx0ZXInKSk7XHJcbmFwcFxyXG4gICAgLmZhY3RvcnkoJ2RhdGFTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9kYXRhLXNlcnZpY2UnKSlcclxuICAgIC5mYWN0b3J5KCd2YWxpZGF0aW9uU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvdmFsaWRhdGlvbi1zZXJ2aWNlJykpXHJcbiAgICAuZmFjdG9yeSgnY2FsY3VsYXRpb25TZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9jYWxjdWxhdGlvbi1zZXJ2aWNlJykpXHJcbiAgICAuZmFjdG9yeSgnbGltaXRzU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvbGltaXRzLXNlcnZpY2UnKSlcclxuICAgIC5mYWN0b3J5KCdpbmRleFNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL2luZGV4LXNlcnZpY2UnKSlcclxuICAgIC5mYWN0b3J5KCdhY3RpdmVDbGFzc1NlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL2FjdGl2ZS1jbGFzcy1zZXJ2aWNlJykpXHJcbiAgICAuZmFjdG9yeSgnZGlldENob29zZScsIHJlcXVpcmUoJy4vc2VydmljZXMvZGlldC1jaG9vc2Utc2VydmljZScpKVxyXG4gICAgLmZhY3RvcnkoJ21vZGFsJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9tb2RhbC1zZXJ2aWNlJykpO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYXBwO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9pbmRleC5qc1xuICoqLyIsIi8qXG4gKiBhbmd1Y29tcGxldGUtYWx0XG4gKiBBdXRvY29tcGxldGUgZGlyZWN0aXZlIGZvciBBbmd1bGFySlNcbiAqIFRoaXMgaXMgYSBmb3JrIG9mIERhcnlsIFJvd2xhbmQncyBhbmd1Y29tcGxldGUgd2l0aCBzb21lIGV4dHJhIGZlYXR1cmVzLlxuICogQnkgSGlkZW5hcmkgTm96YWtpXG4gKi9cblxuLyohIENvcHlyaWdodCAoYykgMjAxNCBIaWRlbmFyaSBOb3pha2kgYW5kIGNvbnRyaWJ1dG9ycyB8IExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSAqL1xuXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FuZ3Vjb21wbGV0ZS1hbHQnLCBbXSkuZGlyZWN0aXZlKCdhbmd1Y29tcGxldGVBbHQnLCBbJyRxJywgJyRwYXJzZScsICckaHR0cCcsICckc2NlJywgJyR0aW1lb3V0JywgJyR0ZW1wbGF0ZUNhY2hlJywgJyRpbnRlcnBvbGF0ZScsIGZ1bmN0aW9uICgkcSwgJHBhcnNlLCAkaHR0cCwgJHNjZSwgJHRpbWVvdXQsICR0ZW1wbGF0ZUNhY2hlLCAkaW50ZXJwb2xhdGUpIHtcbiAgLy8ga2V5Ym9hcmQgZXZlbnRzXG4gIHZhciBLRVlfRFcgPSA0MDtcbiAgdmFyIEtFWV9SVCA9IDM5O1xuICB2YXIgS0VZX1VQID0gMzg7XG4gIHZhciBLRVlfTEYgPSAzNztcbiAgdmFyIEtFWV9FUyA9IDI3O1xuICB2YXIgS0VZX0VOID0gMTM7XG4gIHZhciBLRVlfVEFCID0gOTtcblxuICB2YXIgTUlOX0xFTkdUSCA9IDM7XG4gIHZhciBNQVhfTEVOR1RIID0gNTI0Mjg4OyAgLy8gdGhlIGRlZmF1bHQgbWF4IGxlbmd0aCBwZXIgdGhlIGh0bWwgbWF4bGVuZ3RoIGF0dHJpYnV0ZVxuICB2YXIgUEFVU0UgPSA1MDA7XG4gIHZhciBCTFVSX1RJTUVPVVQgPSAyMDA7XG5cbiAgLy8gc3RyaW5nIGNvbnN0YW50c1xuICB2YXIgUkVRVUlSRURfQ0xBU1MgPSAnYXV0b2NvbXBsZXRlLXJlcXVpcmVkJztcbiAgdmFyIFRFWFRfU0VBUkNISU5HID0gJ9Cf0L7QuNGB0LouLi4nO1xuICB2YXIgVEVYVF9OT1JFU1VMVFMgPSAn0J3QtdGCINGB0L7QstC/0LDQtNC10L3QuNC5JztcbiAgdmFyIFRFTVBMQVRFX1VSTCA9ICcvYW5ndWNvbXBsZXRlLWFsdC9pbmRleC5odG1sJztcblxuICAvLyBTZXQgdGhlIGRlZmF1bHQgdGVtcGxhdGUgZm9yIHRoaXMgZGlyZWN0aXZlXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChURU1QTEFURV9VUkwsXG4gICAgJzxkaXYgY2xhc3M9XCJhbmd1Y29tcGxldGUtaG9sZGVyXCIgbmctY2xhc3M9XCJ7XFwnYW5ndWNvbXBsZXRlLWRyb3Bkb3duLXZpc2libGVcXCc6IHNob3dEcm9wZG93bn1cIj4nICtcbiAgICAnICA8aW5wdXQgaWQ9XCJ7e2lkfX1fdmFsdWVcIiBuYW1lPVwie3tpbnB1dE5hbWV9fVwiIHRhYmluZGV4PVwie3tmaWVsZFRhYmluZGV4fX1cIiBuZy1jbGFzcz1cIntcXCdhbmd1Y29tcGxldGUtaW5wdXQtbm90LWVtcHR5XFwnOiBub3RFbXB0eX1cIiBuZy1tb2RlbD1cInNlYXJjaFN0clwiIG5nLWRpc2FibGVkPVwiZGlzYWJsZUlucHV0XCIgdHlwZT1cInt7aW5wdXRUeXBlfX1cIiBwbGFjZWhvbGRlcj1cInt7cGxhY2Vob2xkZXJ9fVwiIG1heGxlbmd0aD1cInt7bWF4bGVuZ3RofX1cIiBuZy1mb2N1cz1cIm9uRm9jdXNIYW5kbGVyKClcIiBjbGFzcz1cInt7aW5wdXRDbGFzc319XCIgbmctZm9jdXM9XCJyZXNldEhpZGVSZXN1bHRzKClcIiBuZy1ibHVyPVwiaGlkZVJlc3VsdHMoJGV2ZW50KVwiIGF1dG9jYXBpdGFsaXplPVwib2ZmXCIgYXV0b2NvcnJlY3Q9XCJvZmZcIiBhdXRvY29tcGxldGU9XCJvZmZcIiBuZy1jaGFuZ2U9XCJpbnB1dENoYW5nZUhhbmRsZXIoc2VhcmNoU3RyKVwiLz4nICtcbiAgICAnICA8ZGl2IGlkPVwie3tpZH19X2Ryb3Bkb3duXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtZHJvcGRvd25cIiBuZy1zaG93PVwic2hvd0Ryb3Bkb3duXCI+JyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYW5ndWNvbXBsZXRlLXNlYXJjaGluZ1wiIG5nLXNob3c9XCJzZWFyY2hpbmdcIiBuZy1iaW5kPVwidGV4dFNlYXJjaGluZ1wiPjwvZGl2PicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1zZWFyY2hpbmdcIiBuZy1zaG93PVwiIXNlYXJjaGluZyAmJiAoIXJlc3VsdHMgfHwgcmVzdWx0cy5sZW5ndGggPT0gMClcIiBuZy1iaW5kPVwidGV4dE5vUmVzdWx0c1wiPjwvZGl2PicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1yb3dcIiBuZy1yZXBlYXQ9XCJyZXN1bHQgaW4gcmVzdWx0c1wiIG5nLWNsaWNrPVwic2VsZWN0UmVzdWx0KHJlc3VsdClcIiBuZy1tb3VzZWVudGVyPVwiaG92ZXJSb3coJGluZGV4KVwiIG5nLWNsYXNzPVwie1xcJ2FuZ3Vjb21wbGV0ZS1zZWxlY3RlZC1yb3dcXCc6ICRpbmRleCA9PSBjdXJyZW50SW5kZXh9XCI+JyArXG4gICAgJyAgICAgIDxkaXYgbmctaWY9XCJpbWFnZUZpZWxkXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtaW1hZ2UtaG9sZGVyXCI+JyArXG4gICAgJyAgICAgICAgPGltZyBuZy1pZj1cInJlc3VsdC5pbWFnZSAmJiByZXN1bHQuaW1hZ2UgIT0gXFwnXFwnXCIgbmctc3JjPVwie3tyZXN1bHQuaW1hZ2V9fVwiIGNsYXNzPVwiYW5ndWNvbXBsZXRlLWltYWdlXCIvPicgK1xuICAgICcgICAgICAgIDxkaXYgbmctaWY9XCIhcmVzdWx0LmltYWdlICYmIHJlc3VsdC5pbWFnZSAhPSBcXCdcXCdcIiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1pbWFnZS1kZWZhdWx0XCI+PC9kaXY+JyArXG4gICAgJyAgICAgIDwvZGl2PicgK1xuICAgICcgICAgICA8ZGl2IGNsYXNzPVwiYW5ndWNvbXBsZXRlLXRpdGxlXCIgbmctaWY9XCJtYXRjaENsYXNzXCIgbmctYmluZC1odG1sPVwicmVzdWx0LnRpdGxlXCI+PC9kaXY+JyArXG4gICAgJyAgICAgIDxkaXYgY2xhc3M9XCJhbmd1Y29tcGxldGUtdGl0bGVcIiBuZy1pZj1cIiFtYXRjaENsYXNzXCI+e3sgcmVzdWx0LnRpdGxlIH19PC9kaXY+JyArXG4gICAgJyAgICAgIDxkaXYgbmctaWY9XCJtYXRjaENsYXNzICYmIHJlc3VsdC5kZXNjcmlwdGlvbiAmJiByZXN1bHQuZGVzY3JpcHRpb24gIT0gXFwnXFwnXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtZGVzY3JpcHRpb25cIiBuZy1iaW5kLWh0bWw9XCJyZXN1bHQuZGVzY3JpcHRpb25cIj48L2Rpdj4nICtcbiAgICAnICAgICAgPGRpdiBuZy1pZj1cIiFtYXRjaENsYXNzICYmIHJlc3VsdC5kZXNjcmlwdGlvbiAmJiByZXN1bHQuZGVzY3JpcHRpb24gIT0gXFwnXFwnXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtZGVzY3JpcHRpb25cIj57e3Jlc3VsdC5kZXNjcmlwdGlvbn19PC9kaXY+JyArXG4gICAgJyAgICA8L2Rpdj4nICtcbiAgICAnICA8L2Rpdj4nICtcbiAgICAnPC9kaXY+J1xuICApO1xuXG4gIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW0sIGF0dHJzLCBjdHJsKSB7XG4gICAgdmFyIGlucHV0RmllbGQgPSBlbGVtLmZpbmQoJ2lucHV0Jyk7XG4gICAgdmFyIG1pbmxlbmd0aCA9IE1JTl9MRU5HVEg7XG4gICAgdmFyIHNlYXJjaFRpbWVyID0gbnVsbDtcbiAgICB2YXIgaGlkZVRpbWVyO1xuICAgIHZhciByZXF1aXJlZENsYXNzTmFtZSA9IFJFUVVJUkVEX0NMQVNTO1xuICAgIHZhciByZXNwb25zZUZvcm1hdHRlcjtcbiAgICB2YXIgdmFsaWRTdGF0ZSA9IG51bGw7XG4gICAgdmFyIGh0dHBDYW5jZWxsZXIgPSBudWxsO1xuICAgIHZhciBkZCA9IGVsZW1bMF0ucXVlcnlTZWxlY3RvcignLmFuZ3Vjb21wbGV0ZS1kcm9wZG93bicpO1xuICAgIHZhciBpc1Njcm9sbE9uID0gZmFsc2U7XG4gICAgdmFyIG1vdXNlZG93bk9uID0gbnVsbDtcbiAgICB2YXIgdW5iaW5kSW5pdGlhbFZhbHVlO1xuICAgIHZhciBkaXNwbGF5U2VhcmNoaW5nO1xuICAgIHZhciBkaXNwbGF5Tm9SZXN1bHRzO1xuXG4gICAgZWxlbS5vbignbW91c2Vkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0LmlkKSB7XG4gICAgICAgIG1vdXNlZG93bk9uID0gZXZlbnQudGFyZ2V0LmlkO1xuICAgICAgICBpZiAobW91c2Vkb3duT24gPT09IHNjb3BlLmlkICsgJ19kcm9wZG93bicpIHtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xpY2tvdXRIYW5kbGVyRm9yRHJvcGRvd24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgbW91c2Vkb3duT24gPSBldmVudC50YXJnZXQuY2xhc3NOYW1lO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2NvcGUuY3VycmVudEluZGV4ID0gc2NvcGUuZm9jdXNGaXJzdCA/IDAgOiBudWxsO1xuICAgIHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xuICAgIHVuYmluZEluaXRpYWxWYWx1ZSA9IHNjb3BlLiR3YXRjaCgnaW5pdGlhbFZhbHVlJywgZnVuY3Rpb24gKG5ld3ZhbCkge1xuICAgICAgaWYgKG5ld3ZhbCkge1xuICAgICAgICAvLyByZW1vdmUgc2NvcGUgbGlzdGVuZXJcbiAgICAgICAgdW5iaW5kSW5pdGlhbFZhbHVlKCk7XG4gICAgICAgIC8vIGNoYW5nZSBpbnB1dFxuICAgICAgICBoYW5kbGVJbnB1dENoYW5nZShuZXd2YWwsIHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2NvcGUuJHdhdGNoKCdmaWVsZFJlcXVpcmVkJywgZnVuY3Rpb24gKG5ld3ZhbCwgb2xkdmFsKSB7XG4gICAgICBpZiAobmV3dmFsICE9PSBvbGR2YWwpIHtcbiAgICAgICAgaWYgKCFuZXd2YWwpIHtcbiAgICAgICAgICBjdHJsW3Njb3BlLmlucHV0TmFtZV0uJHNldFZhbGlkaXR5KHJlcXVpcmVkQ2xhc3NOYW1lLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghdmFsaWRTdGF0ZSB8fCBzY29wZS5jdXJyZW50SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgaGFuZGxlUmVxdWlyZWQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGhhbmRsZVJlcXVpcmVkKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzY29wZS4kb24oJ2FuZ3Vjb21wbGV0ZS1hbHQ6Y2xlYXJJbnB1dCcsIGZ1bmN0aW9uIChldmVudCwgZWxlbWVudElkKSB7XG4gICAgICBpZiAoIWVsZW1lbnRJZCB8fCBlbGVtZW50SWQgPT09IHNjb3BlLmlkKSB7XG4gICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IG51bGw7XG4gICAgICAgIGNhbGxPckFzc2lnbigpO1xuICAgICAgICBoYW5kbGVSZXF1aXJlZChmYWxzZSk7XG4gICAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2NvcGUuJG9uKCdhbmd1Y29tcGxldGUtYWx0OmNoYW5nZUlucHV0JywgZnVuY3Rpb24gKGV2ZW50LCBlbGVtZW50SWQsIG5ld3ZhbCkge1xuICAgICAgaWYgKCEhZWxlbWVudElkICYmIGVsZW1lbnRJZCA9PT0gc2NvcGUuaWQpIHtcbiAgICAgICAgaGFuZGxlSW5wdXRDaGFuZ2UobmV3dmFsKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZUlucHV0Q2hhbmdlKG5ld3ZhbCwgaW5pdGlhbCkge1xuICAgICAgaWYgKG5ld3ZhbCkge1xuICAgICAgICBpZiAodHlwZW9mIG5ld3ZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBzY29wZS5zZWFyY2hTdHIgPSBleHRyYWN0VGl0bGUobmV3dmFsKTtcbiAgICAgICAgICBjYWxsT3JBc3NpZ24oe29yaWdpbmFsT2JqZWN0OiBuZXd2YWx9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbmV3dmFsID09PSAnc3RyaW5nJyAmJiBuZXd2YWwubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IG5ld3ZhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY29uc29sZSAmJiBjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdUcmllZCB0byBzZXQgJyArICghIWluaXRpYWwgPyAnaW5pdGlhbCcgOiAnJykgKyAnIHZhbHVlIG9mIGFuZ3Vjb21wbGV0ZSB0bycsIG5ld3ZhbCwgJ3doaWNoIGlzIGFuIGludmFsaWQgdmFsdWUnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBoYW5kbGVSZXF1aXJlZCh0cnVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAjMTk0IGRyb3Bkb3duIGxpc3Qgbm90IGNvbnNpc3RlbnQgaW4gY29sbGFwc2luZyAoYnVnKS5cbiAgICBmdW5jdGlvbiBjbGlja291dEhhbmRsZXJGb3JEcm9wZG93bihldmVudCkge1xuICAgICAgbW91c2Vkb3duT24gPSBudWxsO1xuICAgICAgc2NvcGUuaGlkZVJlc3VsdHMoZXZlbnQpO1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrb3V0SGFuZGxlckZvckRyb3Bkb3duKTtcbiAgICB9XG5cbiAgICAvLyBmb3IgSUU4IHF1aXJraW5lc3MgYWJvdXQgZXZlbnQud2hpY2hcbiAgICBmdW5jdGlvbiBpZThFdmVudE5vcm1hbGl6ZXIoZXZlbnQpIHtcbiAgICAgIHJldHVybiBldmVudC53aGljaCA/IGV2ZW50LndoaWNoIDogZXZlbnQua2V5Q29kZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxsT3JBc3NpZ24odmFsdWUpIHtcbiAgICAgIGlmICh0eXBlb2Ygc2NvcGUuc2VsZWN0ZWRPYmplY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc2NvcGUuc2VsZWN0ZWRPYmplY3QodmFsdWUpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNjb3BlLnNlbGVjdGVkT2JqZWN0ID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBoYW5kbGVSZXF1aXJlZCh0cnVlKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBoYW5kbGVSZXF1aXJlZChmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsbEZ1bmN0aW9uT3JJZGVudGl0eShmbikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBzY29wZVtmbl0gPyBzY29wZVtmbl0oZGF0YSkgOiBkYXRhO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRJbnB1dFN0cmluZyhzdHIpIHtcbiAgICAgIGNhbGxPckFzc2lnbih7b3JpZ2luYWxPYmplY3Q6IHN0cn0pO1xuXG4gICAgICBpZiAoc2NvcGUuY2xlYXJTZWxlY3RlZCkge1xuICAgICAgICBzY29wZS5zZWFyY2hTdHIgPSBudWxsO1xuICAgICAgfVxuICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXh0cmFjdFRpdGxlKGRhdGEpIHtcbiAgICAgIC8vIHNwbGl0IHRpdGxlIGZpZWxkcyBhbmQgcnVuIGV4dHJhY3RWYWx1ZSBmb3IgZWFjaCBhbmQgam9pbiB3aXRoICcgJ1xuICAgICAgcmV0dXJuIHNjb3BlLnRpdGxlRmllbGQuc3BsaXQoJywnKVxuICAgICAgICAubWFwKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICAgIHJldHVybiBleHRyYWN0VmFsdWUoZGF0YSwgZmllbGQpO1xuICAgICAgICB9KVxuICAgICAgICAuam9pbignICcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4dHJhY3RWYWx1ZShvYmosIGtleSkge1xuICAgICAgdmFyIGtleXMsIHJlc3VsdDtcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAga2V5cyA9IGtleS5zcGxpdCgnLicpO1xuICAgICAgICByZXN1bHQgPSBvYmo7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdFtrZXlzW2ldXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IG9iajtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmluZE1hdGNoU3RyaW5nKHRhcmdldCwgc3RyKSB7XG4gICAgICB2YXIgcmVzdWx0LCBtYXRjaGVzLCByZTtcbiAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvR3VpZGUvUmVndWxhcl9FeHByZXNzaW9uc1xuICAgICAgLy8gRXNjYXBlIHVzZXIgaW5wdXQgdG8gYmUgdHJlYXRlZCBhcyBhIGxpdGVyYWwgc3RyaW5nIHdpdGhpbiBhIHJlZ3VsYXIgZXhwcmVzc2lvblxuICAgICAgcmUgPSBuZXcgUmVnRXhwKHN0ci5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpLCAnaScpO1xuICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCF0YXJnZXQubWF0Y2ggfHwgIXRhcmdldC5yZXBsYWNlKSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldC50b1N0cmluZygpO1xuICAgICAgfVxuICAgICAgbWF0Y2hlcyA9IHRhcmdldC5tYXRjaChyZSk7XG4gICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICByZXN1bHQgPSB0YXJnZXQucmVwbGFjZShyZSxcbiAgICAgICAgICAnPHNwYW4gY2xhc3M9XCInICsgc2NvcGUubWF0Y2hDbGFzcyArICdcIj4nICsgbWF0Y2hlc1swXSArICc8L3NwYW4+Jyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gdGFyZ2V0O1xuICAgICAgfVxuICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwocmVzdWx0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVSZXF1aXJlZCh2YWxpZCkge1xuICAgICAgc2NvcGUubm90RW1wdHkgPSB2YWxpZDtcbiAgICAgIHZhbGlkU3RhdGUgPSBzY29wZS5zZWFyY2hTdHI7XG4gICAgICBpZiAoc2NvcGUuZmllbGRSZXF1aXJlZCAmJiBjdHJsICYmIHNjb3BlLmlucHV0TmFtZSkge1xuICAgICAgICBjdHJsW3Njb3BlLmlucHV0TmFtZV0uJHNldFZhbGlkaXR5KHJlcXVpcmVkQ2xhc3NOYW1lLCB2YWxpZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2V5dXBIYW5kbGVyKGV2ZW50KSB7XG4gICAgICB2YXIgd2hpY2ggPSBpZThFdmVudE5vcm1hbGl6ZXIoZXZlbnQpO1xuICAgICAgaWYgKHdoaWNoID09PSBLRVlfTEYgfHwgd2hpY2ggPT09IEtFWV9SVCkge1xuICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHdoaWNoID09PSBLRVlfVVAgfHwgd2hpY2ggPT09IEtFWV9FTikge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAod2hpY2ggPT09IEtFWV9EVykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoIXNjb3BlLnNob3dEcm9wZG93biAmJiBzY29wZS5zZWFyY2hTdHIgJiYgc2NvcGUuc2VhcmNoU3RyLmxlbmd0aCA+PSBtaW5sZW5ndGgpIHtcbiAgICAgICAgICBpbml0UmVzdWx0cygpO1xuICAgICAgICAgIHNjb3BlLnNlYXJjaGluZyA9IHRydWU7XG4gICAgICAgICAgc2VhcmNoVGltZXJDb21wbGV0ZShzY29wZS5zZWFyY2hTdHIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmICh3aGljaCA9PT0gS0VZX0VTKSB7XG4gICAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlucHV0RmllbGQudmFsKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChtaW5sZW5ndGggPT09IDAgJiYgIXNjb3BlLnNlYXJjaFN0cikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc2NvcGUuc2VhcmNoU3RyIHx8IHNjb3BlLnNlYXJjaFN0ciA9PT0gJycpIHtcbiAgICAgICAgICBzY29wZS5zaG93RHJvcGRvd24gPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChzY29wZS5zZWFyY2hTdHIubGVuZ3RoID49IG1pbmxlbmd0aCkge1xuICAgICAgICAgIGluaXRSZXN1bHRzKCk7XG5cbiAgICAgICAgICBpZiAoc2VhcmNoVGltZXIpIHtcbiAgICAgICAgICAgICR0aW1lb3V0LmNhbmNlbChzZWFyY2hUaW1lcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2NvcGUuc2VhcmNoaW5nID0gdHJ1ZTtcblxuICAgICAgICAgIHNlYXJjaFRpbWVyID0gJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VhcmNoVGltZXJDb21wbGV0ZShzY29wZS5zZWFyY2hTdHIpO1xuICAgICAgICAgIH0sIHNjb3BlLnBhdXNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWxpZFN0YXRlICYmIHZhbGlkU3RhdGUgIT09IHNjb3BlLnNlYXJjaFN0ciAmJiAhc2NvcGUuY2xlYXJTZWxlY3RlZCkge1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsT3JBc3NpZ24oKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZU92ZXJyaWRlU3VnZ2VzdGlvbnMoZXZlbnQpIHtcbiAgICAgIGlmIChzY29wZS5vdmVycmlkZVN1Z2dlc3Rpb25zICYmICEoc2NvcGUuc2VsZWN0ZWRPYmplY3QgJiYgc2NvcGUuc2VsZWN0ZWRPYmplY3Qub3JpZ2luYWxPYmplY3QgPT09IHNjb3BlLnNlYXJjaFN0cikpIHtcbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhbmNlbCBzZWFyY2ggdGltZXJcbiAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHNlYXJjaFRpbWVyKTtcbiAgICAgICAgLy8gY2FuY2VsIGh0dHAgcmVxdWVzdFxuICAgICAgICBjYW5jZWxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgIHNldElucHV0U3RyaW5nKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJvcGRvd25Sb3dPZmZzZXRIZWlnaHQocm93KSB7XG4gICAgICB2YXIgY3NzID0gZ2V0Q29tcHV0ZWRTdHlsZShyb3cpO1xuICAgICAgcmV0dXJuIHJvdy5vZmZzZXRIZWlnaHQgK1xuICAgICAgICBwYXJzZUludChjc3MubWFyZ2luVG9wLCAxMCkgKyBwYXJzZUludChjc3MubWFyZ2luQm90dG9tLCAxMCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJvcGRvd25IZWlnaHQoKSB7XG4gICAgICByZXR1cm4gZGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICtcbiAgICAgICAgcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShkZCkubWF4SGVpZ2h0LCAxMCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJvcGRvd25Sb3coKSB7XG4gICAgICByZXR1cm4gZWxlbVswXS5xdWVyeVNlbGVjdG9yQWxsKCcuYW5ndWNvbXBsZXRlLXJvdycpW3Njb3BlLmN1cnJlbnRJbmRleF07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJvcGRvd25Sb3dUb3AoKSB7XG4gICAgICByZXR1cm4gZHJvcGRvd25Sb3coKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgLVxuICAgICAgICAoZGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICtcbiAgICAgICAgcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShkZCkucGFkZGluZ1RvcCwgMTApKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcm9wZG93blNjcm9sbFRvcFRvKG9mZnNldCkge1xuICAgICAgZGQuc2Nyb2xsVG9wID0gZGQuc2Nyb2xsVG9wICsgb2Zmc2V0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUlucHV0RmllbGQoKSB7XG4gICAgICB2YXIgY3VycmVudCA9IHNjb3BlLnJlc3VsdHNbc2NvcGUuY3VycmVudEluZGV4XTtcbiAgICAgIGlmIChzY29wZS5tYXRjaENsYXNzKSB7XG4gICAgICAgIGlucHV0RmllbGQudmFsKGV4dHJhY3RUaXRsZShjdXJyZW50Lm9yaWdpbmFsT2JqZWN0KSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaW5wdXRGaWVsZC52YWwoY3VycmVudC50aXRsZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2V5ZG93bkhhbmRsZXIoZXZlbnQpIHtcbiAgICAgIHZhciB3aGljaCA9IGllOEV2ZW50Tm9ybWFsaXplcihldmVudCk7XG4gICAgICB2YXIgcm93ID0gbnVsbDtcbiAgICAgIHZhciByb3dUb3AgPSBudWxsO1xuXG4gICAgICBpZiAod2hpY2ggPT09IEtFWV9FTiAmJiBzY29wZS5yZXN1bHRzKSB7XG4gICAgICAgIGlmIChzY29wZS5jdXJyZW50SW5kZXggPj0gMCAmJiBzY29wZS5jdXJyZW50SW5kZXggPCBzY29wZS5yZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgc2NvcGUuc2VsZWN0UmVzdWx0KHNjb3BlLnJlc3VsdHNbc2NvcGUuY3VycmVudEluZGV4XSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaGFuZGxlT3ZlcnJpZGVTdWdnZXN0aW9ucyhldmVudCk7XG4gICAgICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICB9IGVsc2UgaWYgKHdoaWNoID09PSBLRVlfRFcgJiYgc2NvcGUucmVzdWx0cykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoKHNjb3BlLmN1cnJlbnRJbmRleCArIDEpIDwgc2NvcGUucmVzdWx0cy5sZW5ndGggJiYgc2NvcGUuc2hvd0Ryb3Bkb3duKSB7XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCsrO1xuICAgICAgICAgICAgdXBkYXRlSW5wdXRGaWVsZCgpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKGlzU2Nyb2xsT24pIHtcbiAgICAgICAgICAgIHJvdyA9IGRyb3Bkb3duUm93KCk7XG4gICAgICAgICAgICBpZiAoZHJvcGRvd25IZWlnaHQoKSA8IHJvdy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5ib3R0b20pIHtcbiAgICAgICAgICAgICAgZHJvcGRvd25TY3JvbGxUb3BUbyhkcm9wZG93blJvd09mZnNldEhlaWdodChyb3cpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAod2hpY2ggPT09IEtFWV9VUCAmJiBzY29wZS5yZXN1bHRzKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChzY29wZS5jdXJyZW50SW5kZXggPj0gMSkge1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXgtLTtcbiAgICAgICAgICAgIHVwZGF0ZUlucHV0RmllbGQoKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChpc1Njcm9sbE9uKSB7XG4gICAgICAgICAgICByb3dUb3AgPSBkcm9wZG93blJvd1RvcCgpO1xuICAgICAgICAgICAgaWYgKHJvd1RvcCA8IDApIHtcbiAgICAgICAgICAgICAgZHJvcGRvd25TY3JvbGxUb3BUbyhyb3dUb3AgLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2NvcGUuY3VycmVudEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICAgICAgaW5wdXRGaWVsZC52YWwoc2NvcGUuc2VhcmNoU3RyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh3aGljaCA9PT0gS0VZX1RBQikge1xuICAgICAgICBpZiAoc2NvcGUucmVzdWx0cyAmJiBzY29wZS5yZXN1bHRzLmxlbmd0aCA+IDAgJiYgc2NvcGUuc2hvd0Ryb3Bkb3duKSB7XG4gICAgICAgICAgaWYgKHNjb3BlLmN1cnJlbnRJbmRleCA9PT0gLTEgJiYgc2NvcGUub3ZlcnJpZGVTdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgLy8gaW50ZW50aW9uYWxseSBub3Qgc2VuZGluZyBldmVudCBzbyB0aGF0IGl0IGRvZXMgbm90XG4gICAgICAgICAgICAvLyBwcmV2ZW50IGRlZmF1bHQgdGFiIGJlaGF2aW9yXG4gICAgICAgICAgICBoYW5kbGVPdmVycmlkZVN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNjb3BlLmN1cnJlbnRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjb3BlLnNlbGVjdFJlc3VsdChzY29wZS5yZXN1bHRzW3Njb3BlLmN1cnJlbnRJbmRleF0pO1xuICAgICAgICAgICAgc2NvcGUuJGRpZ2VzdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBubyByZXN1bHRzXG4gICAgICAgICAgLy8gaW50ZW50aW9uYWxseSBub3Qgc2VuZGluZyBldmVudCBzbyB0aGF0IGl0IGRvZXMgbm90XG4gICAgICAgICAgLy8gcHJldmVudCBkZWZhdWx0IHRhYiBiZWhhdmlvclxuICAgICAgICAgIGlmIChzY29wZS5zZWFyY2hTdHIgJiYgc2NvcGUuc2VhcmNoU3RyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGhhbmRsZU92ZXJyaWRlU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAod2hpY2ggPT09IEtFWV9FUykge1xuICAgICAgICAvLyBUaGlzIGlzIHZlcnkgc3BlY2lmaWMgdG8gSUUxMC8xMSAjMjcyXG4gICAgICAgIC8vIHdpdGhvdXQgdGhpcywgSUUgY2xlYXJzIHRoZSBpbnB1dCB0ZXh0XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaHR0cFN1Y2Nlc3NDYWxsYmFja0dlbihzdHIpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAocmVzcG9uc2VEYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICAvLyBub3JtYWxpemUgcmV0dXJuIG9iZWpjdCBmcm9tIHByb21pc2VcbiAgICAgICAgaWYgKCFzdGF0dXMgJiYgIWhlYWRlcnMgJiYgIWNvbmZpZyAmJiByZXNwb25zZURhdGEuZGF0YSkge1xuICAgICAgICAgIHJlc3BvbnNlRGF0YSA9IHJlc3BvbnNlRGF0YS5kYXRhO1xuICAgICAgICB9XG4gICAgICAgIHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xuICAgICAgICBwcm9jZXNzUmVzdWx0cyhcbiAgICAgICAgICBleHRyYWN0VmFsdWUocmVzcG9uc2VGb3JtYXR0ZXIocmVzcG9uc2VEYXRhKSwgc2NvcGUucmVtb3RlVXJsRGF0YUZpZWxkKSxcbiAgICAgICAgICBzdHIpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBodHRwRXJyb3JDYWxsYmFjayhlcnJvclJlcywgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIC8vIGNhbmNlbGxlZC9hYm9ydGVkXG4gICAgICBpZiAoc3RhdHVzID09PSAwIHx8IHN0YXR1cyA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBub3JtYWxpemUgcmV0dXJuIG9iZWpjdCBmcm9tIHByb21pc2VcbiAgICAgIGlmICghc3RhdHVzICYmICFoZWFkZXJzICYmICFjb25maWcpIHtcbiAgICAgICAgc3RhdHVzID0gZXJyb3JSZXMuc3RhdHVzO1xuICAgICAgfVxuICAgICAgaWYgKHNjb3BlLnJlbW90ZVVybEVycm9yQ2FsbGJhY2spIHtcbiAgICAgICAgc2NvcGUucmVtb3RlVXJsRXJyb3JDYWxsYmFjayhlcnJvclJlcywgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUuZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdodHRwIGVycm9yJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5jZWxIdHRwUmVxdWVzdCgpIHtcbiAgICAgIGlmIChodHRwQ2FuY2VsbGVyKSB7XG4gICAgICAgIGh0dHBDYW5jZWxsZXIucmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFJlbW90ZVJlc3VsdHMoc3RyKSB7XG4gICAgICB2YXIgcGFyYW1zID0ge30sXG4gICAgICAgIHVybCA9IHNjb3BlLnJlbW90ZVVybCArIGVuY29kZVVSSUNvbXBvbmVudChzdHIpO1xuICAgICAgaWYgKHNjb3BlLnJlbW90ZVVybFJlcXVlc3RGb3JtYXR0ZXIpIHtcbiAgICAgICAgcGFyYW1zID0ge3BhcmFtczogc2NvcGUucmVtb3RlVXJsUmVxdWVzdEZvcm1hdHRlcihzdHIpfTtcbiAgICAgICAgdXJsID0gc2NvcGUucmVtb3RlVXJsO1xuICAgICAgfVxuICAgICAgaWYgKCEhc2NvcGUucmVtb3RlVXJsUmVxdWVzdFdpdGhDcmVkZW50aWFscykge1xuICAgICAgICBwYXJhbXMud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGNhbmNlbEh0dHBSZXF1ZXN0KCk7XG4gICAgICBodHRwQ2FuY2VsbGVyID0gJHEuZGVmZXIoKTtcbiAgICAgIHBhcmFtcy50aW1lb3V0ID0gaHR0cENhbmNlbGxlci5wcm9taXNlO1xuICAgICAgJGh0dHAuZ2V0KHVybCwgcGFyYW1zKVxuICAgICAgICAuc3VjY2VzcyhodHRwU3VjY2Vzc0NhbGxiYWNrR2VuKHN0cikpXG4gICAgICAgIC5lcnJvcihodHRwRXJyb3JDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UmVtb3RlUmVzdWx0c1dpdGhDdXN0b21IYW5kbGVyKHN0cikge1xuICAgICAgY2FuY2VsSHR0cFJlcXVlc3QoKTtcblxuICAgICAgaHR0cENhbmNlbGxlciA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIHNjb3BlLnJlbW90ZUFwaUhhbmRsZXIoc3RyLCBodHRwQ2FuY2VsbGVyLnByb21pc2UpXG4gICAgICAgIC50aGVuKGh0dHBTdWNjZXNzQ2FsbGJhY2tHZW4oc3RyKSlcbiAgICAgICAgLmNhdGNoKGh0dHBFcnJvckNhbGxiYWNrKTtcblxuICAgICAgLyogSUU4IGNvbXBhdGlibGVcbiAgICAgICBzY29wZS5yZW1vdGVBcGlIYW5kbGVyKHN0ciwgaHR0cENhbmNlbGxlci5wcm9taXNlKVxuICAgICAgIFsndGhlbiddKGh0dHBTdWNjZXNzQ2FsbGJhY2tHZW4oc3RyKSlcbiAgICAgICBbJ2NhdGNoJ10oaHR0cEVycm9yQ2FsbGJhY2spO1xuICAgICAgICovXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xlYXJSZXN1bHRzKCkge1xuICAgICAgc2NvcGUuc2hvd0Ryb3Bkb3duID0gZmFsc2U7XG4gICAgICBzY29wZS5yZXN1bHRzID0gW107XG4gICAgICBpZiAoZGQpIHtcbiAgICAgICAgZGQuc2Nyb2xsVG9wID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0UmVzdWx0cygpIHtcbiAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IGRpc3BsYXlTZWFyY2hpbmc7XG4gICAgICBzY29wZS5jdXJyZW50SW5kZXggPSBzY29wZS5mb2N1c0ZpcnN0ID8gMCA6IC0xO1xuICAgICAgc2NvcGUucmVzdWx0cyA9IFtdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldExvY2FsUmVzdWx0cyhzdHIpIHtcbiAgICAgIHZhciBpLCBtYXRjaCwgcywgdmFsdWUsXG4gICAgICAgIHNlYXJjaEZpZWxkcyA9IHNjb3BlLnNlYXJjaEZpZWxkcy5zcGxpdCgnLCcpLFxuICAgICAgICBtYXRjaGVzID0gW107XG4gICAgICBpZiAodHlwZW9mIHNjb3BlLnBhcnNlSW5wdXQoKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgc3RyID0gc2NvcGUucGFyc2VJbnB1dCgpKHN0cik7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgc2NvcGUubG9jYWxEYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG1hdGNoID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChzID0gMDsgcyA8IHNlYXJjaEZpZWxkcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgIHZhbHVlID0gZXh0cmFjdFZhbHVlKHNjb3BlLmxvY2FsRGF0YVtpXSwgc2VhcmNoRmllbGRzW3NdKSB8fCAnJztcbiAgICAgICAgICBtYXRjaCA9IG1hdGNoIHx8ICh2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzdHIudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpKSA+PSAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIG1hdGNoZXNbbWF0Y2hlcy5sZW5ndGhdID0gc2NvcGUubG9jYWxEYXRhW2ldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF0Y2hlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja0V4YWN0TWF0Y2gocmVzdWx0LCBvYmosIHN0cikge1xuICAgICAgaWYgKCFzdHIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAob2JqW2tleV0udG9Mb3dlckNhc2UoKSA9PT0gc3RyLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICBzY29wZS5zZWxlY3RSZXN1bHQocmVzdWx0KTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlYXJjaFRpbWVyQ29tcGxldGUoc3RyKSB7XG4gICAgICAvLyBCZWdpbiB0aGUgc2VhcmNoXG4gICAgICBpZiAoIXN0ciB8fCBzdHIubGVuZ3RoIDwgbWlubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChzY29wZS5sb2NhbERhdGEpIHtcbiAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgbWF0Y2hlcztcbiAgICAgICAgICBpZiAodHlwZW9mIHNjb3BlLmxvY2FsU2VhcmNoKCkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBtYXRjaGVzID0gc2NvcGUubG9jYWxTZWFyY2goKShzdHIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXRjaGVzID0gZ2V0TG9jYWxSZXN1bHRzKHN0cik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xuICAgICAgICAgIHByb2Nlc3NSZXN1bHRzKG1hdGNoZXMsIHN0cik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoc2NvcGUucmVtb3RlQXBpSGFuZGxlcikge1xuICAgICAgICBnZXRSZW1vdGVSZXN1bHRzV2l0aEN1c3RvbUhhbmRsZXIoc3RyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdldFJlbW90ZVJlc3VsdHMoc3RyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcm9jZXNzUmVzdWx0cyhyZXNwb25zZURhdGEsIHN0cikge1xuICAgICAgdmFyIGksIGRlc2NyaXB0aW9uLCBpbWFnZSwgdGV4dCwgZm9ybWF0dGVkVGV4dCwgZm9ybWF0dGVkRGVzYztcblxuICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICBzY29wZS5yZXN1bHRzID0gW107XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHJlc3BvbnNlRGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChzY29wZS50aXRsZUZpZWxkICYmIHNjb3BlLnRpdGxlRmllbGQgIT09ICcnKSB7XG4gICAgICAgICAgICB0ZXh0ID0gZm9ybWF0dGVkVGV4dCA9IGV4dHJhY3RUaXRsZShyZXNwb25zZURhdGFbaV0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRlc2NyaXB0aW9uID0gJyc7XG4gICAgICAgICAgaWYgKHNjb3BlLmRlc2NyaXB0aW9uRmllbGQpIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gZm9ybWF0dGVkRGVzYyA9IGV4dHJhY3RWYWx1ZShyZXNwb25zZURhdGFbaV0sIHNjb3BlLmRlc2NyaXB0aW9uRmllbGQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGltYWdlID0gJyc7XG4gICAgICAgICAgaWYgKHNjb3BlLmltYWdlRmllbGQpIHtcbiAgICAgICAgICAgIGltYWdlID0gZXh0cmFjdFZhbHVlKHJlc3BvbnNlRGF0YVtpXSwgc2NvcGUuaW1hZ2VGaWVsZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNjb3BlLm1hdGNoQ2xhc3MpIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZFRleHQgPSBmaW5kTWF0Y2hTdHJpbmcodGV4dCwgc3RyKTtcbiAgICAgICAgICAgIGZvcm1hdHRlZERlc2MgPSBmaW5kTWF0Y2hTdHJpbmcoZGVzY3JpcHRpb24sIHN0cik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2NvcGUucmVzdWx0c1tzY29wZS5yZXN1bHRzLmxlbmd0aF0gPSB7XG4gICAgICAgICAgICB0aXRsZTogZm9ybWF0dGVkVGV4dCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBmb3JtYXR0ZWREZXNjLFxuICAgICAgICAgICAgaW1hZ2U6IGltYWdlLFxuICAgICAgICAgICAgb3JpZ2luYWxPYmplY3Q6IHJlc3BvbnNlRGF0YVtpXVxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NvcGUucmVzdWx0cyA9IFtdO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2NvcGUuYXV0b01hdGNoICYmIHNjb3BlLnJlc3VsdHMubGVuZ3RoID09PSAxICYmXG4gICAgICAgIGNoZWNrRXhhY3RNYXRjaChzY29wZS5yZXN1bHRzWzBdLFxuICAgICAgICAgIHt0aXRsZTogdGV4dCwgZGVzYzogZGVzY3JpcHRpb24gfHwgJyd9LCBzY29wZS5zZWFyY2hTdHIpKSB7XG4gICAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmIChzY29wZS5yZXN1bHRzLmxlbmd0aCA9PT0gMCAmJiAhZGlzcGxheU5vUmVzdWx0cykge1xuICAgICAgICBzY29wZS5zaG93RHJvcGRvd24gPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2hvd0FsbCgpIHtcbiAgICAgIGlmIChzY29wZS5sb2NhbERhdGEpIHtcbiAgICAgICAgcHJvY2Vzc1Jlc3VsdHMoc2NvcGUubG9jYWxEYXRhLCAnJyk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChzY29wZS5yZW1vdGVBcGlIYW5kbGVyKSB7XG4gICAgICAgIGdldFJlbW90ZVJlc3VsdHNXaXRoQ3VzdG9tSGFuZGxlcignJyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZ2V0UmVtb3RlUmVzdWx0cygnJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NvcGUub25Gb2N1c0hhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2NvcGUuZm9jdXNJbikge1xuICAgICAgICBzY29wZS5mb2N1c0luKCk7XG4gICAgICB9XG4gICAgICBpZiAobWlubGVuZ3RoID09PSAwICYmICghc2NvcGUuc2VhcmNoU3RyIHx8IHNjb3BlLnNlYXJjaFN0ci5sZW5ndGggPT09IDApKSB7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IHNjb3BlLmZvY3VzRmlyc3QgPyAwIDogc2NvcGUuY3VycmVudEluZGV4O1xuICAgICAgICBzY29wZS5zaG93RHJvcGRvd24gPSB0cnVlO1xuICAgICAgICBzaG93QWxsKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNjb3BlLmhpZGVSZXN1bHRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG1vdXNlZG93bk9uICYmXG4gICAgICAgIChtb3VzZWRvd25PbiA9PT0gc2NvcGUuaWQgKyAnX2Ryb3Bkb3duJyB8fFxuICAgICAgICBtb3VzZWRvd25Pbi5pbmRleE9mKCdhbmd1Y29tcGxldGUnKSA+PSAwKSkge1xuICAgICAgICBtb3VzZWRvd25PbiA9IG51bGw7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaGlkZVRpbWVyID0gJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoc2NvcGUuc2VhcmNoU3RyICYmIHNjb3BlLnNlYXJjaFN0ci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGlucHV0RmllbGQudmFsKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIEJMVVJfVElNRU9VVCk7XG4gICAgICAgIGNhbmNlbEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgaWYgKHNjb3BlLmZvY3VzT3V0KSB7XG4gICAgICAgICAgc2NvcGUuZm9jdXNPdXQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzY29wZS5vdmVycmlkZVN1Z2dlc3Rpb25zKSB7XG4gICAgICAgICAgaWYgKHNjb3BlLnNlYXJjaFN0ciAmJiBzY29wZS5zZWFyY2hTdHIubGVuZ3RoID4gMCAmJiBzY29wZS5jdXJyZW50SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICBoYW5kbGVPdmVycmlkZVN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNjb3BlLnJlc2V0SGlkZVJlc3VsdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoaGlkZVRpbWVyKSB7XG4gICAgICAgICR0aW1lb3V0LmNhbmNlbChoaWRlVGltZXIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBzY29wZS5ob3ZlclJvdyA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gaW5kZXg7XG4gICAgfTtcblxuICAgIHNjb3BlLnNlbGVjdFJlc3VsdCA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgIC8vIFJlc3RvcmUgb3JpZ2luYWwgdmFsdWVzXG4gICAgICBpZiAoc2NvcGUubWF0Y2hDbGFzcykge1xuICAgICAgICByZXN1bHQudGl0bGUgPSBleHRyYWN0VGl0bGUocmVzdWx0Lm9yaWdpbmFsT2JqZWN0KTtcbiAgICAgICAgcmVzdWx0LmRlc2NyaXB0aW9uID0gZXh0cmFjdFZhbHVlKHJlc3VsdC5vcmlnaW5hbE9iamVjdCwgc2NvcGUuZGVzY3JpcHRpb25GaWVsZCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzY29wZS5jbGVhclNlbGVjdGVkKSB7XG4gICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IG51bGw7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2NvcGUuc2VhcmNoU3RyID0gcmVzdWx0LnRpdGxlO1xuICAgICAgfVxuICAgICAgY2FsbE9yQXNzaWduKHJlc3VsdCk7XG4gICAgICBjbGVhclJlc3VsdHMoKTtcbiAgICB9O1xuXG4gICAgc2NvcGUuaW5wdXRDaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgaWYgKHN0ci5sZW5ndGggPCBtaW5sZW5ndGgpIHtcbiAgICAgICAgY2FuY2VsSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChzdHIubGVuZ3RoID09PSAwICYmIG1pbmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBzY29wZS5zZWFyY2hpbmcgPSBmYWxzZTtcbiAgICAgICAgc2hvd0FsbCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2NvcGUuaW5wdXRDaGFuZ2VkKSB7XG4gICAgICAgIHN0ciA9IHNjb3BlLmlucHV0Q2hhbmdlZChzdHIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9O1xuXG4gICAgLy8gY2hlY2sgcmVxdWlyZWRcbiAgICBpZiAoc2NvcGUuZmllbGRSZXF1aXJlZENsYXNzICYmIHNjb3BlLmZpZWxkUmVxdWlyZWRDbGFzcyAhPT0gJycpIHtcbiAgICAgIHJlcXVpcmVkQ2xhc3NOYW1lID0gc2NvcGUuZmllbGRSZXF1aXJlZENsYXNzO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIG1pbiBsZW5ndGhcbiAgICBpZiAoc2NvcGUubWlubGVuZ3RoICYmIHNjb3BlLm1pbmxlbmd0aCAhPT0gJycpIHtcbiAgICAgIG1pbmxlbmd0aCA9IHBhcnNlSW50KHNjb3BlLm1pbmxlbmd0aCwgMTApO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIHBhdXNlIHRpbWVcbiAgICBpZiAoIXNjb3BlLnBhdXNlKSB7XG4gICAgICBzY29wZS5wYXVzZSA9IFBBVVNFO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGNsZWFyU2VsZWN0ZWRcbiAgICBpZiAoIXNjb3BlLmNsZWFyU2VsZWN0ZWQpIHtcbiAgICAgIHNjb3BlLmNsZWFyU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayBvdmVycmlkZSBzdWdnZXN0aW9uc1xuICAgIGlmICghc2NvcGUub3ZlcnJpZGVTdWdnZXN0aW9ucykge1xuICAgICAgc2NvcGUub3ZlcnJpZGVTdWdnZXN0aW9ucyA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIHJlcXVpcmVkIGZpZWxkXG4gICAgaWYgKHNjb3BlLmZpZWxkUmVxdWlyZWQgJiYgY3RybCkge1xuICAgICAgLy8gY2hlY2sgaW5pdGlhbCB2YWx1ZSwgaWYgZ2l2ZW4sIHNldCB2YWxpZGl0aXR5IHRvIHRydWVcbiAgICAgIGlmIChzY29wZS5pbml0aWFsVmFsdWUpIHtcbiAgICAgICAgaGFuZGxlUmVxdWlyZWQodHJ1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaGFuZGxlUmVxdWlyZWQoZmFsc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNjb3BlLmlucHV0VHlwZSA9IGF0dHJzLnR5cGUgPyBhdHRycy50eXBlIDogJ3RleHQnO1xuXG4gICAgLy8gc2V0IHN0cmluZ3MgZm9yIFwiU2VhcmNoaW5nLi4uXCIgYW5kIFwiTm8gcmVzdWx0c1wiXG4gICAgc2NvcGUudGV4dFNlYXJjaGluZyA9IGF0dHJzLnRleHRTZWFyY2hpbmcgPyBhdHRycy50ZXh0U2VhcmNoaW5nIDogVEVYVF9TRUFSQ0hJTkc7XG4gICAgc2NvcGUudGV4dE5vUmVzdWx0cyA9IGF0dHJzLnRleHROb1Jlc3VsdHMgPyBhdHRycy50ZXh0Tm9SZXN1bHRzIDogVEVYVF9OT1JFU1VMVFM7XG4gICAgZGlzcGxheVNlYXJjaGluZyA9IHNjb3BlLnRleHRTZWFyY2hpbmcgPT09ICdmYWxzZScgPyBmYWxzZSA6IHRydWU7XG4gICAgZGlzcGxheU5vUmVzdWx0cyA9IHNjb3BlLnRleHROb1Jlc3VsdHMgPT09ICdmYWxzZScgPyBmYWxzZSA6IHRydWU7XG5cbiAgICAvLyBzZXQgbWF4IGxlbmd0aCAoZGVmYXVsdCB0byBtYXhsZW5ndGggZGVhdWx0IGZyb20gaHRtbFxuICAgIHNjb3BlLm1heGxlbmd0aCA9IGF0dHJzLm1heGxlbmd0aCA/IGF0dHJzLm1heGxlbmd0aCA6IE1BWF9MRU5HVEg7XG5cbiAgICAvLyByZWdpc3RlciBldmVudHNcbiAgICBpbnB1dEZpZWxkLm9uKCdrZXlkb3duJywga2V5ZG93bkhhbmRsZXIpO1xuICAgIGlucHV0RmllbGQub24oJ2tleXVwJywga2V5dXBIYW5kbGVyKTtcblxuICAgIC8vIHNldCByZXNwb25zZSBmb3JtYXR0ZXJcbiAgICByZXNwb25zZUZvcm1hdHRlciA9IGNhbGxGdW5jdGlvbk9ySWRlbnRpdHkoJ3JlbW90ZVVybFJlc3BvbnNlRm9ybWF0dGVyJyk7XG5cbiAgICAvLyBzZXQgaXNTY3JvbGxPblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjc3MgPSBnZXRDb21wdXRlZFN0eWxlKGRkKTtcbiAgICAgIGlzU2Nyb2xsT24gPSBjc3MubWF4SGVpZ2h0ICYmIGNzcy5vdmVyZmxvd1kgPT09ICdhdXRvJztcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgcmVxdWlyZTogJ14/Zm9ybScsXG4gICAgc2NvcGU6IHtcbiAgICAgIHNlbGVjdGVkT2JqZWN0OiAnPScsXG4gICAgICBkaXNhYmxlSW5wdXQ6ICc9JyxcbiAgICAgIGluaXRpYWxWYWx1ZTogJz0nLFxuICAgICAgbG9jYWxEYXRhOiAnPScsXG4gICAgICBsb2NhbFNlYXJjaDogJyYnLFxuICAgICAgcmVtb3RlVXJsUmVxdWVzdEZvcm1hdHRlcjogJz0nLFxuICAgICAgcmVtb3RlVXJsUmVxdWVzdFdpdGhDcmVkZW50aWFsczogJ0AnLFxuICAgICAgcmVtb3RlVXJsUmVzcG9uc2VGb3JtYXR0ZXI6ICc9JyxcbiAgICAgIHJlbW90ZVVybEVycm9yQ2FsbGJhY2s6ICc9JyxcbiAgICAgIHJlbW90ZUFwaUhhbmRsZXI6ICc9JyxcbiAgICAgIGlkOiAnQCcsXG4gICAgICB0eXBlOiAnQCcsXG4gICAgICBwbGFjZWhvbGRlcjogJ0AnLFxuICAgICAgcmVtb3RlVXJsOiAnQCcsXG4gICAgICByZW1vdGVVcmxEYXRhRmllbGQ6ICdAJyxcbiAgICAgIHRpdGxlRmllbGQ6ICdAJyxcbiAgICAgIGRlc2NyaXB0aW9uRmllbGQ6ICdAJyxcbiAgICAgIGltYWdlRmllbGQ6ICdAJyxcbiAgICAgIGlucHV0Q2xhc3M6ICdAJyxcbiAgICAgIHBhdXNlOiAnQCcsXG4gICAgICBzZWFyY2hGaWVsZHM6ICdAJyxcbiAgICAgIG1pbmxlbmd0aDogJ0AnLFxuICAgICAgbWF0Y2hDbGFzczogJ0AnLFxuICAgICAgY2xlYXJTZWxlY3RlZDogJ0AnLFxuICAgICAgb3ZlcnJpZGVTdWdnZXN0aW9uczogJ0AnLFxuICAgICAgZmllbGRSZXF1aXJlZDogJz0nLFxuICAgICAgZmllbGRSZXF1aXJlZENsYXNzOiAnQCcsXG4gICAgICBpbnB1dENoYW5nZWQ6ICc9JyxcbiAgICAgIGF1dG9NYXRjaDogJ0AnLFxuICAgICAgZm9jdXNPdXQ6ICcmJyxcbiAgICAgIGZvY3VzSW46ICcmJyxcbiAgICAgIGZpZWxkVGFiaW5kZXg6ICdAJyxcbiAgICAgIGlucHV0TmFtZTogJ0AnLFxuICAgICAgZm9jdXNGaXJzdDogJ0AnLFxuICAgICAgcGFyc2VJbnB1dDogJyYnXG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgVEVNUExBVEVfVVJMO1xuICAgIH0sXG4gICAgY29tcGlsZTogZnVuY3Rpb24gKHRFbGVtZW50KSB7XG4gICAgICB2YXIgc3RhcnRTeW0gPSAkaW50ZXJwb2xhdGUuc3RhcnRTeW1ib2woKTtcbiAgICAgIHZhciBlbmRTeW0gPSAkaW50ZXJwb2xhdGUuZW5kU3ltYm9sKCk7XG4gICAgICBpZiAoIShzdGFydFN5bSA9PT0gJ3t7JyAmJiBlbmRTeW0gPT09ICd9fScpKSB7XG4gICAgICAgIHZhciBpbnRlcnBvbGF0ZWRIdG1sID0gdEVsZW1lbnQuaHRtbCgpXG4gICAgICAgICAgLnJlcGxhY2UoL1xce1xcey9nLCBzdGFydFN5bSlcbiAgICAgICAgICAucmVwbGFjZSgvXFx9XFx9L2csIGVuZFN5bSk7XG4gICAgICAgIHRFbGVtZW50Lmh0bWwoaW50ZXJwb2xhdGVkSHRtbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGluaztcbiAgICB9XG4gIH07XG59XSk7XG5cblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogbm9kZV9tb2R1bGVzL2FuZ3Vjb21wbGV0ZS1hbHQvYW5ndWNvbXBsZXRlLWFsdC5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IG1haW4gPSBhbmd1bGFyLm1vZHVsZSgnbWFpbicsIFsndWkucm91dGVyJ10pO1xyXG5cclxubWFpblxyXG4gICAgLmNvbXBvbmVudCgnbGVmdFNpZGVNZW51JywgcmVxdWlyZSgnLi9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQvbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdkYXl0aW1lQ2hvb3NlJywgcmVxdWlyZSgnLi9kYXl0aW1lLWNob29zZS1jb21wb25lbnQvZGF5dGltZS1jaG9vc2UtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdob21lJywgcmVxdWlyZSgnLi9ob21lLXBhZ2UtbW9kdWxlL2hvbWUtcGFnZS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ3ZpZXcnLCByZXF1aXJlKCcuL3ZpZXctY29tcG9uZW50L3ZpZXctY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdtb2RhbCcsIHJlcXVpcmUoJy4vbW9kYWwtd2luZG93LWNvbXBvbmVudC9tb2RhbC13aW5kb3ctY29tcG9uZW50JykpO1xyXG5cclxubWFpbi5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAgICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAgICAgLnN0YXRlKCdob21lJywge1xyXG4gICAgICAgICAgICB1cmw6ICcvaG9tZScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGhvbWU+PC9ob21lPidcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZSgnZGlhcnknLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9kaWFyeS86ZGF5dGltZScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRheS10aW1lIGJhc2U9XCIkY3RybC5iYXNlXCIgZGF5dGltZXM9XCIkY3RybC52aWV3RGF0YS5kYXlUaW1lc1wiIGFkZD1cIiRjdHJsLmFkZEZvb2QoZGF5VGltZUlkLCBmb29kKVwiIHJlbW92ZT1cIiRjdHJsLnJlbW92ZUZvb2QoZGF5VGltZUlkLCBmb29kKVwiIGRheS10aW1lLWxpbWl0cz1cIiRjdHJsLnZpZXdEYXRhLmxpbWl0c0RhdGFcIj48L2RheS10aW1lPidcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZSgnc2V0dGluZ3MnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncycsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPG1lbnU+PC9tZW51PidcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZSgncmVzdWx0Jywge1xyXG4gICAgICAgICAgICB1cmw6ICcvcmVzdWx0JyxcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8cmVzdWx0IHJlc3VsdD1cIiRjdHJsLnZpZXdEYXRhLnJlc3VsdEZpbmFsXCI+PC9yZXN1bHQ+J1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKCd0YWJsZXMnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy90YWJsZXMnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzx0YWJsZXMgZm9vZHMtb2Jqcz1cIiRjdHJsLnZpZXdEYXRhLnRhYmxlc0RhdGEuZm9vZHNPYmpzXCIgbXktZm9vZHM9XCIkY3RybC52aWV3RGF0YS50YWJsZXNEYXRhLm15Rm9vZHNcIiByZW1vdmUtbXktZm9vZD1cIiRjdHJsLnJlbW92ZU15Rm9vZChuYW1lKVwiPjwvdGFibGVzPidcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZSgnYWRkLWZvb2QnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9hZGQtZm9vZCcsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPHRhYmxlLWFkZCBteS1mb29kcz1cIiRjdHJsLnZpZXdEYXRhLnRhYmxlc0RhdGEubXlGb29kc1wiIHJlbW92ZS1teS1mb29kPVwiJGN0cmwucmVtb3ZlTXlGb29kKG5hbWUpXCIgYWRkLW15LWZvb2Q9XCIkY3RybC5hZGRNeUZvb2QobmFtZSwgdmFsdWVzKVwiPjwvdGFibGUtYWRkPidcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZSgnc2F2ZScsIHtcclxuICAgICAgICAgICAgdXJsOiAnL3NhdmUnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxzYXZlLW1lbnUgZGF5LXRpbWVzLWRhdGE9XCIkY3RybC52aWV3RGF0YS5kYXlUaW1lc1wiIHJlc3VsdD1cIiRjdHJsLnZpZXdEYXRhLnJlc3VsdEZpbmFsXCI+PC9zYXZlLW1lbnU+J1xyXG4gICAgICAgIH0pO1xyXG59KTtcclxuXHJcbm1haW4ucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsIGFjdGl2ZUNsYXNzU2VydmljZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMpIHtcclxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdWNjZXNzJywgKCkgPT4ge1xyXG4gICAgICAgIHZhciBjbGFzc05hbWUgPSAkc3RhdGUuY3VycmVudC5uYW1lID09PSAnZGlhcnknPyAkc3RhdGVQYXJhbXMuZGF5dGltZSA6ICRzdGF0ZS5jdXJyZW50Lm5hbWU7XHJcbiAgICAgICAgYWN0aXZlQ2xhc3NTZXJ2aWNlLnNldENsYXNzTmFtZShjbGFzc05hbWUpO1xyXG4gICAgfSlcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1haW47XHJcblxyXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvbWFpbi1tb2R1bGUvaW5kZXguanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBsZWZ0U2lkZU1lbnVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvbGVmdC1zaWRlLW1lbnUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgbGVmdFNpZGVNZW51ID0ge1xyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzdGF0ZSwgYWN0aXZlQ2xhc3NTZXJ2aWNlLCBtb2RhbCkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlQ2xhc3MgPSBhY3RpdmVDbGFzc1NlcnZpY2UuZ2V0Q2xhc3NOYW1lO1xyXG5cclxuICAgICAgICB0aGlzLm1lbnVJdGVtcyA9IFtcclxuICAgICAgICAgICAge2NsYXNzTmFtZTogJ2hvbWUnLCB0b29sdGlwOiAn0J3QsCDQs9C70LDQstC90YPRjicsIHRvb2x0aXBTaG93OiBmYWxzZX0sXHJcbiAgICAgICAgICAgIHtjbGFzc05hbWU6ICdzZXR0aW5ncycsIHRvb2x0aXA6ICfQndCw0YHRgtGA0L7QudC60LgnLCB0b29sdGlwU2hvdzogZmFsc2V9LFxyXG4gICAgICAgICAgICB7Y2xhc3NOYW1lOiAncmVzdWx0JywgdG9vbHRpcDogJ9CY0YLQvtCzINC00L3RjycsIHRvb2x0aXBTaG93OiBmYWxzZX0sXHJcbiAgICAgICAgICAgIHtjbGFzc05hbWU6ICdzYXZlJywgdG9vbHRpcDogJ9Ch0L7RhdGA0LDQvdC40YLRjCcsIHRvb2x0aXBTaG93OiBmYWxzZX0sXHJcbiAgICAgICAgICAgIHtjbGFzc05hbWU6ICd0YWJsZXMnLCB0b29sdGlwOiAn0KLQsNCx0LvQuNGG0YsnLCB0b29sdGlwU2hvdzogZmFsc2V9LFxyXG4gICAgICAgICAgICB7Y2xhc3NOYW1lOiAnYWRkLWZvb2QnLCB0b29sdGlwOiAn0JTQvtCx0LDQstC40YLRjCDQtdC00YMg0LIg0YLQsNCx0LvQuNGG0YMnLCB0b29sdGlwU2hvdzogZmFsc2V9XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgdGhpcy50b2dnbGUgPSBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmNsYXNzTmFtZSA9PT0gdGhpcy5hY3RpdmVDbGFzcykgcmV0dXJuO1xyXG4gICAgICAgICAgICBpdGVtLnRvb2x0aXBTaG93ID0gIWl0ZW0udG9vbHRpcFNob3c7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbihjbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgKCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IG51bWIgPSBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIDMpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tJY29uQ2xhc3NOYW1lID0gJ2ljb24nICsgbnVtYjtcclxuICAgICAgICB9KSgpXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGxlZnRTaWRlTWVudVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGxlZnRTaWRlTWVudTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvbWFpbi1tb2R1bGUvbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50L2xlZnQtc2lkZS1tZW51LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwibGVmdC1zaWRlLW1lbnVcXFwiPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJ0by1hbm90aGVyLWRlc2lnblxcXCIgbmctY2xhc3M9XFxcIiRjdHJsLmJhY2tJY29uQ2xhc3NOYW1lXFxcIj48L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwibWVudS1pdGVtXFxcIiBuZy1yZXBlYXQ9XFxcIml0ZW0gaW4gJGN0cmwubWVudUl0ZW1zXFxcIiBuZy1jbGFzcz1cXFwiW2l0ZW0uY2xhc3NOYW1lLCAkY3RybC5hY3RpdmVDbGFzcygpXVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldFN0YXRlKGl0ZW0uY2xhc3NOYW1lKVxcXCIgbmctbW91c2VlbnRlcj1cXFwiJGN0cmwudG9nZ2xlKGl0ZW0pXFxcIiBuZy1tb3VzZWxlYXZlPVxcXCIkY3RybC50b2dnbGUoaXRlbSlcXFwiPlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwidG9vbHRpcFxcXCIgbmctaWY9XFxcIml0ZW0udG9vbHRpcFNob3dcXFwiPnt7aXRlbS50b29sdGlwfX08L2Rpdj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuXFxyXFxuPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcImxlZnQtc2lkZS1tZW51LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL21haW4tbW9kdWxlL2xlZnQtc2lkZS1tZW51LWNvbXBvbmVudC90ZW1wbGF0ZS9sZWZ0LXNpZGUtbWVudS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgZGF5dGltZUNob29zZVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9kYXl0aW1lLWNob29zZS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBkYXl0aW1lQ2hvb3NlID0ge1xyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHN0YXRlLCBhY3RpdmVDbGFzc1NlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLmRheXRpbWVzID0gW1xyXG4gICAgICAgICAgICB7dGltZTogJ9CX0LDQstGC0YDQsNC6JywgY2xhc3NOYW1lOiAnYnJlYWtmYXN0Jywgc3RhdGU6ICdicmVha2Zhc3QnfSxcclxuICAgICAgICAgICAge3RpbWU6ICfQn9C10YDQtdC60YPRgSAxJywgY2xhc3NOYW1lOiBmYWxzZSwgc3RhdGU6ICdmaXJzdC1zbmFjayd9LFxyXG4gICAgICAgICAgICB7dGltZTogJ9Ce0LHQtdC0JywgY2xhc3NOYW1lOiBmYWxzZSwgc3RhdGU6ICdkaW5uZXInfSxcclxuICAgICAgICAgICAge3RpbWU6ICfQn9C10YDQtdC60YPRgSAyJywgY2xhc3NOYW1lOiBmYWxzZSwgc3RhdGU6ICdzZWNvbmQtc25hY2snfSxcclxuICAgICAgICAgICAge3RpbWU6ICfQo9C20LjQvScsIGNsYXNzTmFtZTogZmFsc2UsIHN0YXRlOiAnZXZlbmluZy1tZWFsJ31cclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB0aGlzLmFjdGl2ZUNsYXNzID0gYWN0aXZlQ2xhc3NTZXJ2aWNlLmdldENsYXNzTmFtZTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSA9IGZ1bmN0aW9uKGRheXRpbWUpIHtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKCdkaWFyeScsIHtkYXl0aW1lOiBkYXl0aW1lLnN0YXRlfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGRheXRpbWVDaG9vc2VUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkYXl0aW1lQ2hvb3NlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9tYWluLW1vZHVsZS9kYXl0aW1lLWNob29zZS1jb21wb25lbnQvZGF5dGltZS1jaG9vc2UtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJkYXl0aW1lLWNob29zZVxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImRheXRpbWVcXFwiIG5nLXJlcGVhdD1cXFwiZGF5dGltZSBpbiAkY3RybC5kYXl0aW1lc1xcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldFN0YXRlKGRheXRpbWUpXFxcIiBuZy1jbGFzcz1cXFwiWyRjdHJsLmFjdGl2ZUNsYXNzKCksIGRheXRpbWUuc3RhdGVdXFxcIj57eyBkYXl0aW1lLnRpbWUgfX08L2Rpdj5cXHJcXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwiZGF5dGltZS1jaG9vc2UtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvbWFpbi1tb2R1bGUvZGF5dGltZS1jaG9vc2UtY29tcG9uZW50L3RlbXBsYXRlL2RheXRpbWUtY2hvb3NlLXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSA3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBob21lUGFnZVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9ob21lLXBhZ2UtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgaG9tZVBhZ2UgPSB7XHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGhvbWVQYWdlVGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gaG9tZVBhZ2U7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL21haW4tbW9kdWxlL2hvbWUtcGFnZS1tb2R1bGUvaG9tZS1wYWdlLWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwiaG9tZS1wYWdlXFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiZGF5dGltZS1zZWxlY3QtdG9vbHRpcFxcXCI+0JLRi9Cx0LXRgNC10YLQtSDQstGA0LXQvNGPINC00L3RjyxcXHJcXG4gICAgICAgINGH0YLQvtCx0Ysg0L/RgNC40YHRgtGD0L/QuNGC0Ywg0Log0LfQsNC/0L7Qu9C90LXQvdC40Y4g0LTQvdC10LLQvdC40LrQsDwvZGl2PlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJob21lLWhlYWRlclxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJsZWZ0LWxpbmVcXFwiPjwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwicmlnaHQtbGluZVxcXCI+PC9kaXY+XFxyXFxuICAgICAgICA8aDI+0JTQvdC10LLQvdC40Log0L/QuNGC0LDQvdC40Y88L2gyPlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwibWVudS1zZWxlY3QtdG9vbHRpcFxcXCI+0KfRgtC+0LHRiyDRg9GB0YLQsNC90L7QstC40YLRjCDQu9C40LzQuNGC0YssXFxyXFxuICAgICAgICDRgdC+0YXRgNCw0L3QuNGC0Ywg0LTQsNC90L3Ri9C1LCDQtNC+0LHQsNCy0LjRgtGMINC10LTRgyDQu9C40LHQvlxcclxcbiAgICAgICAg0L/RgNC+0YHQvNC+0YLRgNC10YLRjCDQuNGC0L7QsyDQuCDRgtCw0LHQu9C40YbRiyDQstC+0YHQv9C+0LvRjNC30YPQudGC0LXRgdGMINC80LXQvdGOPC9kaXY+XFxyXFxuPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcImhvbWUtcGFnZS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC9tYWluLW1vZHVsZS9ob21lLXBhZ2UtbW9kdWxlL3RlbXBsYXRlL2hvbWUtcGFnZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3Qgdmlld1RlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS92aWV3LXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IHZpZXcgPSB7XHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoZGF0YVNlcnZpY2UsIGxpbWl0c1NlcnZpY2UsICR3aW5kb3csICRzdGF0ZVBhcmFtcywgJHN0YXRlLCAkdGltZW91dCkge1xyXG4gICAgICAgIGNvbnN0IGVtcHR5ID0ge1xyXG4gICAgICAgICAgICBlbXB0eTogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZTogJy0tLS0tLS0tLScsXHJcbiAgICAgICAgICAgIHBvcnRpb246ICctLS0nLFxyXG4gICAgICAgICAgICBjYXJib2h5ZDogJy0tLScsXHJcbiAgICAgICAgICAgIHByb3Q6ICctLS0nLFxyXG4gICAgICAgICAgICBmYXQ6ICctLS0nLFxyXG4gICAgICAgICAgICBrYWxsOiAnLS0tJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYmFzZSA9IGRhdGFTZXJ2aWNlLmJhc2U7XHJcbiAgICAgICAgdGhpcy52aWV3RGF0YSA9IHtcclxuICAgICAgICAgICAgbGltaXRzRGF0YTogbGltaXRzU2VydmljZS5saW1pdHNEYXRhLFxyXG4gICAgICAgICAgICB0YWJsZXNEYXRhOiB7fVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRhdGFTZXJ2aWNlLmdldFRhYmxlRGF0YSgpXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnRhYmxlc0RhdGEuZm9vZHNPYmpzID0gZGF0YTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuXHJcbiAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVEYXRhKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlRGF0YSk7XHJcbiAgICAgICAgICAgIHRoaXMudmlld0RhdGEuZGF5VGltZXMgPSBkYXRhLmRheXNEYXRhO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsID0gZGF0YS5yZXN1bHRGaW5hbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkYXRhU2VydmljZS5nZXREYXlUaW1lc0RhdGEoKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHRoaXMudmlld0RhdGEuZGF5VGltZXMgPSBkYXRhLmRhdGEpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbCA9IHtcclxuICAgICAgICAgICAgICAgIGNhcmJvaHlkOiB7bmFtZTogJ9Cj0LPQtNC10LLQvtC00YsnLCB2YWx1ZTogMH0sXHJcbiAgICAgICAgICAgICAgICBwcm90OiB7bmFtZTogJ9Cf0YDQvtGC0LXQuNC90YsnLCB2YWx1ZTogMH0sXHJcbiAgICAgICAgICAgICAgICBmYXQ6IHtuYW1lOiAn0JbQuNGA0YsnLCB2YWx1ZTogMH0sXHJcbiAgICAgICAgICAgICAgICBrYWxsOiB7bmFtZTogJ9Ca0LDQu9C+0YDQuNC4JywgdmFsdWU6IDB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB0aGlzLmNvbXBhcmUgPSBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy52aWV3RGF0YS5saW1pdHNEYXRhLmxpbWl0cykgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAodGhpcy52aWV3RGF0YS5saW1pdHNEYXRhLmxpbWl0c1tcItCY0YLQvtCzXCJdW2tleV0gPCB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsW2tleV0pIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICB0aGlzLmFkZEZvb2QgPSBmdW5jdGlvbiAoZGF5VGltZUlkLCBmb29kKSB7XHJcbiAgICAgICAgICAgIGxldCBjb2xsZWN0aW9uID0gdGhpcy52aWV3RGF0YS5kYXlUaW1lc1tkYXlUaW1lSWRdLmZvb2RzO1xyXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvblswXS5lbXB0eSkgY29sbGVjdGlvbi5zcGxpY2UoMCwgMSk7XHJcblxyXG4gICAgICAgICAgICBjb2xsZWN0aW9uLnB1c2goZm9vZCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsY1Jlc3VsdChkYXlUaW1lSWQsIGZvb2QsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLl9sYXN0U2F2ZUlkKSAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdfbGFzdFNhdmVJZCcpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMucmVtb3ZlRm9vZCA9IGZ1bmN0aW9uIChkYXlUaW1lSWQsIGZvb2QpIHtcclxuICAgICAgICAgICAgbGV0IGNvbGxlY3Rpb24gPSB0aGlzLnZpZXdEYXRhLmRheVRpbWVzW2RheVRpbWVJZF0uZm9vZHM7XHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGNvbGxlY3Rpb24uaW5kZXhPZihmb29kKTtcclxuICAgICAgICAgICAgY29sbGVjdGlvbi5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb24ubGVuZ3RoID09PSAwKSBjb2xsZWN0aW9uLnB1c2goZW1wdHkpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGNSZXN1bHQoZGF5VGltZUlkLCBmb29kLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCkgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnX2xhc3RTYXZlSWQnKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5jYWxjUmVzdWx0ID0gZnVuY3Rpb24gKGRheVRpbWVJZCwgZm9vZCwgYm9vbCkge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy52aWV3RGF0YS5kYXlUaW1lc1tkYXlUaW1lSWRdLnJlc3VsdDtcclxuICAgICAgICAgICAgaWYgKGJvb2wpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiByZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSArPSBmb29kW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbFtrZXldLnZhbHVlICs9IGZvb2Rba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiByZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSAtPSBmb29kW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbFtrZXldLnZhbHVlIC09IGZvb2Rba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMucmVtb3ZlTXlGb29kID0gZnVuY3Rpb24obmFtZSkge1xyXG5cclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMudmlld0RhdGEudGFibGVzRGF0YS5teUZvb2RzW25hbWVdO1xyXG4gICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5teUZvb2RzID0gSlNPTi5zdHJpbmdpZnkodGhpcy52aWV3RGF0YS50YWJsZXNEYXRhLm15Rm9vZHMpO1xyXG5cclxuICAgICAgICAgICAgZGF0YVNlcnZpY2UucmVtb3ZlRnJvbUJhc2UobmFtZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRNeUZvb2QgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZXMpIHtcclxuICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy52aWV3RGF0YS50YWJsZXNEYXRhLm15Rm9vZHMpIHRoaXMudmlld0RhdGEudGFibGVzRGF0YS5teUZvb2RzID0ge307XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZpZXdEYXRhLnRhYmxlc0RhdGEubXlGb29kc1tuYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFjb25maXJtKCfQn9C10YDQtdC30LDQv9C40YHQsNGC0Ywg0YHRg9GJ0LXRgdGC0LLRg9GO0YnQuNC5INC/0YDQvtC00YPQutGCPycpKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBkYXRhU2VydmljZS5yZW1vdmVGcm9tQmFzZShuYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnRhYmxlc0RhdGEubXlGb29kc1tuYW1lXSA9IHZhbHVlcztcclxuICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UubXlGb29kcyA9IEpTT04uc3RyaW5naWZ5KHRoaXMudmlld0RhdGEudGFibGVzRGF0YS5teUZvb2RzKTtcclxuXHJcbiAgICAgICAgICAgIGRhdGFTZXJ2aWNlLmFkZFRvQmFzZShuYW1lLCB2YWx1ZXMpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vTFNcclxuXHJcbiAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLm15Rm9vZHMpIHRoaXMudmlld0RhdGEudGFibGVzRGF0YS5teUZvb2RzID0gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5teUZvb2RzKTtcclxuXHJcblxyXG5cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogdmlld1RlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL21haW4tbW9kdWxlL3ZpZXctY29tcG9uZW50L3ZpZXctY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8bGVmdC1zaWRlLW1lbnU+PC9sZWZ0LXNpZGUtbWVudT5cXHJcXG48ZGF5dGltZS1jaG9vc2U+PC9kYXl0aW1lLWNob29zZT5cXHJcXG5cXHJcXG48ZGl2IGNsYXNzPVxcXCJtYWluLXZpZXdcXFwiIHVpLXZpZXc+PC9kaXY+XFxyXFxuXFxyXFxuPG1vZGFsPjwvbW9kYWw+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcInZpZXctdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvbWFpbi1tb2R1bGUvdmlldy1jb21wb25lbnQvdGVtcGxhdGUvdmlldy10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMTFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IG1vZGFsVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL21vZGFsLXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IG1vZGFsID0ge1xyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24obW9kYWwpIHtcclxuICAgICAgICB0aGlzLm1vZGFsVmlld0RhdGEgPSBtb2RhbC5tb2RhbFZpZXdEYXRhO1xyXG4gICAgICAgIHRoaXMuY2hlY2tPcGVuID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2RhbC5nZXRTdGF0ZSgpID09PSAnb3Blbic7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmNoZWNrVHlwZSA9IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZGFsLmdldFR5cGUoKSA9PT0gdHlwZTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMudHlwZSA9IG1vZGFsLmdldFR5cGU7XHJcblxyXG4gICAgICAgIHRoaXMuY2xvc2UgPSBtb2RhbC5jbG9zZTtcclxuXHJcbiAgICAgICAgdGhpcy5zdG9wUHJvcGFnYXRpb24gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiBtb2RhbFRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1vZGFsO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9tYWluLW1vZHVsZS9tb2RhbC13aW5kb3ctY29tcG9uZW50L21vZGFsLXdpbmRvdy1jb21wb25lbnQuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBkaWFyeU1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdkaWFyeScsIFtdKTtcclxuXHJcbmRpYXJ5TW9kdWxlXHJcbiAgICAuY29tcG9uZW50KCdtZW51JywgcmVxdWlyZSgnLi9tZW51L21lbnUtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdtYWluVmlldycsIHJlcXVpcmUoJy4vbWFpbi12aWV3L21haW4tdmlldy1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ2RheVRpbWUnLCByZXF1aXJlKCcuL2RheS10aW1lL2RheS10aW1lLWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgnZm9vZCcsIHJlcXVpcmUoJy4vZm9vZC9mb29kLWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgnc2F2ZU1lbnUnLCByZXF1aXJlKCcuL3NhdmUtbWVudS9zYXZlLW1lbnUtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdyZXN1bHQnLCByZXF1aXJlKCcuL3Jlc3VsdC1jb21wb25lbnQvcmVzdWx0LWNvbXBvbmVudCcpKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZGlhcnlNb2R1bGU7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL2RpYXJ5LW1vZHVsZS9pbmRleC5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBtZW51VGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL21lbnUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgbWVudSA9IHtcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkd2luZG93LCBkaWV0Q2hvb3NlKSB7XHJcbiAgICAgICAgdGhpcy5kaWV0cyA9IGRpZXRDaG9vc2UuZGlldHM7XHJcbiAgICAgICAgdGhpcy5zZXREaWV0ID0gZGlldENob29zZS5zZXREaWV0O1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSBkaWV0Q2hvb3NlLmNsYXNzTmFtZTtcclxuICAgICAgICB0aGlzLnNldENsYXNzTmFtZSA9IGRpZXRDaG9vc2Uuc2V0Q2xhc3NOYW1lO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5zZXRMaW1pdHMgPSBkaWV0Q2hvb3NlLnNldExpbWl0cztcclxuICAgICAgICB0aGlzLnJlc2V0Q2hvb3NlID0gZGlldENob29zZS5yZXNldENob29zZTtcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogbWVudVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1lbnU7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL2RpYXJ5LW1vZHVsZS9tZW51L21lbnUtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGlkPVxcXCJtZW51XFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiZGlldC1tZW51XFxcIj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImRpZXQtdGl0dGxlXFxcIj7QktC40LQg0LTQuNC10YLRizo8L2Rpdj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImRpZXQtY2hvb3NlXFxcIj5cXHJcXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiZGlldFxcXCIgbmctY2xhc3M9XFxcInthY3RpdmU6ICRjdHJsLmRpZXRzLnByb3RlaW5zfVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldERpZXQoJ3Byb3RlaW5zJylcXFwiPtCS0YvRgdC+0LrQvtC/0YDQvtGC0LXQuNC90L7QstCw0Y8g0LrQvtC80LHQuNC90LDRhtC40Y8g0LfQsNC80LXQvTwvc3Bhbj5cXHJcXG4gICAgICAgICAgICA8YnI+XFxyXFxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImRpZXRcXFwiIG5nLWNsYXNzPVxcXCJ7YWN0aXZlOiAkY3RybC5kaWV0cy5jYXJib2h5ZHJhdGVzfVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldERpZXQoJ2NhcmJvaHlkcmF0ZXMnKVxcXCI+0JLRi9GB0L7QutC+0YPQs9C70LXQstC+0LTQvdCw0Y8g0LrQvtC80LHQuNC90LDRhtC40Y8g0LfQsNC80LXQvTwvc3Bhbj5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwicGhhc2UtbWVudVxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJwaGFzZS10aXR0bGVcXFwiPtCS0YvQsdC10YDQtdGC0LUg0JLQsNGI0YMg0YTQsNC30YM6PC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJwaGFzZS1jaG9vc2VcXFwiPlxcclxcblxcclxcbiAgICAgICAgICAgIDxkaXYgbmctY2xhc3M9XFxcIiRjdHJsLmNsYXNzTmFtZS5uYW1lXFxcIiBjbGFzcz1cXFwiZmlyc3QtcGhhc2VcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zZXRDbGFzc05hbWUoMSlcXFwiPjxzcGFuPi08L3NwYW4+IDEgPHNwYW4+LTwvc3Bhbj48L2Rpdj5cXHJcXG4gICAgICAgICAgICA8ZGl2IG5nLWNsYXNzPVxcXCIkY3RybC5jbGFzc05hbWUubmFtZVxcXCIgY2xhc3M9XFxcInNlY29uZC1waGFzZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldENsYXNzTmFtZSgyKVxcXCI+PHNwYW4+LTwvc3Bhbj4gMiA8c3Bhbj4tPC9zcGFuPjwvZGl2PlxcclxcbiAgICAgICAgICAgIDxkaXYgbmctY2xhc3M9XFxcIiRjdHJsLmNsYXNzTmFtZS5uYW1lXFxcIiBjbGFzcz1cXFwidGhpcmQtcGhhc2VcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zZXRDbGFzc05hbWUoMylcXFwiPjxzcGFuPi08L3NwYW4+IDMgPHNwYW4+LTwvc3Bhbj48L2Rpdj5cXHJcXG5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiY2xlYXItbGltaXRzXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwucmVzZXRDaG9vc2UoKVxcXCI+0KHQsdGA0L7RgdC40YLRjCDQu9C40LzQuNGC0Ys8L2Rpdj5cXHJcXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwibWVudS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC9kaWFyeS1tb2R1bGUvbWVudS90ZW1wbGF0ZS9tZW51LXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAxN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBtYWluVmlld1RlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9tYWluLXZpZXcuaHRtbCcpO1xuXG5jb25zdCBtYWluVmlldyA9IHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoZGF0YVNlcnZpY2UsIGxpbWl0c1NlcnZpY2UsICR3aW5kb3cpIHtcbiAgICAgICAgY29uc3QgZW1wdHkgPSB7XG4gICAgICAgICAgICBlbXB0eTogdHJ1ZSxcbiAgICAgICAgICAgIG5hbWU6ICctLS0tLS0tLS0nLFxuICAgICAgICAgICAgcG9ydGlvbjogJy0tLScsXG4gICAgICAgICAgICBjYXJib2h5ZDogJy0tLScsXG4gICAgICAgICAgICBwcm90OiAnLS0tJyxcbiAgICAgICAgICAgIGZhdDogJy0tLScsXG4gICAgICAgICAgICBrYWxsOiAnLS0tJ1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYmFzZSA9IGRhdGFTZXJ2aWNlLmJhc2U7XG4gICAgICAgIHRoaXMudmlld0RhdGEgPSB7XG4gICAgICAgICAgICBsaW1pdHNEYXRhOiBsaW1pdHNTZXJ2aWNlLmxpbWl0c0RhdGFcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZURhdGEpIHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlRGF0YSk7XG4gICAgICAgICAgICB0aGlzLnZpZXdEYXRhLmRheVRpbWVzID0gZGF0YS5kYXlzRGF0YTtcbiAgICAgICAgICAgIHRoaXMudmlld0RhdGEucmVzdWx0RmluYWwgPSBkYXRhLnJlc3VsdEZpbmFsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGF0YVNlcnZpY2UuZ2V0RGF5VGltZXNEYXRhKClcbiAgICAgICAgICAgICAgICAudGhlbigoZGF0YSkgPT4gdGhpcy52aWV3RGF0YS5kYXlUaW1lcyA9IGRhdGEuZGF0YSk7XG5cbiAgICAgICAgICAgIHRoaXMudmlld0RhdGEucmVzdWx0RmluYWwgPSB7XG4gICAgICAgICAgICAgICAgY2FyYm9oeWQ6IDAsXG4gICAgICAgICAgICAgICAgcHJvdDogMCxcbiAgICAgICAgICAgICAgICBmYXQ6IDAsXG4gICAgICAgICAgICAgICAga2FsbDogMFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICB0aGlzLmNvbXBhcmUgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy52aWV3RGF0YS5saW1pdHNEYXRhLmxpbWl0cykgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHRoaXMudmlld0RhdGEubGltaXRzRGF0YS5saW1pdHNbXCLQmNGC0L7Qs1wiXVtrZXldIDwgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbFtrZXldKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcblxuXG4gICAgICAgIHRoaXMuYWRkRm9vZCA9IGZ1bmN0aW9uKGRheVRpbWVJZCwgZm9vZCkge1xuICAgICAgICAgICAgbGV0IGNvbGxlY3Rpb24gPSB0aGlzLnZpZXdEYXRhLmRheVRpbWVzW2RheVRpbWVJZF0uZm9vZHM7XG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvblswXS5lbXB0eSkgY29sbGVjdGlvbi5zcGxpY2UoMCwgMSk7XG5cbiAgICAgICAgICAgIGNvbGxlY3Rpb24ucHVzaChmb29kKTtcbiAgICAgICAgICAgIHRoaXMuY2FsY1Jlc3VsdChkYXlUaW1lSWQsIGZvb2QsIHRydWUpO1xuXG4gICAgICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuX2xhc3RTYXZlSWQpICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ19sYXN0U2F2ZUlkJyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW1vdmVGb29kID0gZnVuY3Rpb24oZGF5VGltZUlkLCBmb29kKSB7XG4gICAgICAgICAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMudmlld0RhdGEuZGF5VGltZXNbZGF5VGltZUlkXS5mb29kcztcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGNvbGxlY3Rpb24uaW5kZXhPZihmb29kKTtcbiAgICAgICAgICAgIGNvbGxlY3Rpb24uc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb24ubGVuZ3RoID09PSAwKSBjb2xsZWN0aW9uLnB1c2goZW1wdHkpO1xuICAgICAgICAgICAgdGhpcy5jYWxjUmVzdWx0KGRheVRpbWVJZCwgZm9vZCwgZmFsc2UpO1xuICAgICAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLl9sYXN0U2F2ZUlkKSAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdfbGFzdFNhdmVJZCcpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudG9nZ2xlRGF5VGltZSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICB0aGlzLnZpZXdEYXRhLmRheVRpbWVzW2lkXS5zaG93ID0gIXRoaXMudmlld0RhdGEuZGF5VGltZXNbaWRdLnNob3dcbiAgICAgICAgfTtcblxuXG4gICAgICAgIHRoaXMuY2FsY1Jlc3VsdCA9IGZ1bmN0aW9uIChkYXlUaW1lSWQsIGZvb2QsIGJvb2wpIHtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB0aGlzLnZpZXdEYXRhLmRheVRpbWVzW2RheVRpbWVJZF0ucmVzdWx0O1xuICAgICAgICAgICAgaWYgKGJvb2wpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldICs9IGZvb2Rba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbFtrZXldICs9IGZvb2Rba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gLT0gZm9vZFtrZXldO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsW2tleV0gLT0gZm9vZFtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IG1haW5WaWV3VGVtcGxhdGVcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbWFpblZpZXc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL2RpYXJ5LW1vZHVsZS9tYWluLXZpZXcvbWFpbi12aWV3LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwibWFpbi12aWV3XFxcIj5cXG4gICAgPGRheS10aW1lIG5nLXJlcGVhdD1cXFwidGltZSBpbiAkY3RybC52aWV3RGF0YS5kYXlUaW1lc1xcXCIgdGltZT1cXFwidGltZVxcXCIgYmFzZT1cXFwiJGN0cmwuYmFzZVxcXCIgZGF5LXRpbWUtbGltaXRzPVxcXCIkY3RybC52aWV3RGF0YS5saW1pdHNEYXRhXFxcIiBhZGQ9XFxcIiRjdHJsLmFkZEZvb2QoZGF5VGltZUlkLCBmb29kKVxcXCIgcmVtb3ZlPVxcXCIkY3RybC5yZW1vdmVGb29kKGRheVRpbWVJZCwgZm9vZClcXFwiIHRvZ2dsZT1cXFwiJGN0cmwudG9nZ2xlRGF5VGltZShpZClcXFwiPjwvZGF5LXRpbWU+XFxuXFxuICAgIDxkaXYgY2xhc3M9XFxcInJlc3VsdFxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXN1bHQtdGl0dGxlXFxcIj7QmNGC0L7Qs9C+PC9kaXY+XFxuXFxuICAgICAgICA8c2VjdGlvbiBjbGFzcz1cXFwidGFibGUtcmVzdWx0XFxcIj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0YWJsZS1yZXN1bHQtdGl0dGxlXFxcIj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInJlc3VsdC1uby1uYW1lXFxcIj4tLS0tLS0tLS0tLS0tLS0tPC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicG9ydGlvblxcXCI+0J/QvtGA0YbQuNGPKNCz0YApPC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiY2FyYm9oeWRcXFwiPtCj0LPQu9C10LLQvtC00Ys8L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJwcm90XFxcIj7QkdC10LvQutC4PC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiZmF0XFxcIj7QltC40YDRizwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImthbGxcXFwiPtCa0LDQu9C+0YDQuNC4PC9zcGFuPlxcbiAgICAgICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInJlc3VsdC1maW5hbFxcXCI+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJuYW1lXFxcIj48L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJwb3J0aW9uXFxcIj4tLS08L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjYXJib2h5ZFxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlLWxpbWl0JzogJGN0cmwuY29tcGFyZSgnY2FyYm9oeWQnKX1cXFwiPnt7ICRjdHJsLnZpZXdEYXRhLnJlc3VsdEZpbmFsLmNhcmJvaHlkIH19IHt7JygnICsgJGN0cmwudmlld0RhdGEubGltaXRzRGF0YS5saW1pdHNbXFxcItCY0YLQvtCzXFxcIl0uY2FyYm9oeWQgKyAnKScgfCBsaW1pdCB9fTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInByb3RcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ3Byb3QnKX1cXFwiPnt7ICRjdHJsLnZpZXdEYXRhLnJlc3VsdEZpbmFsLnByb3QgIH19IHt7JygnICsgJGN0cmwudmlld0RhdGEubGltaXRzRGF0YS5saW1pdHNbXFxcItCY0YLQvtCzXFxcIl0ucHJvdCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiZmF0XFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtbGltaXQnOiAkY3RybC5jb21wYXJlKCdmYXQnKX1cXFwiPnt7ICRjdHJsLnZpZXdEYXRhLnJlc3VsdEZpbmFsLmZhdCB9fSB7eycoJyArICRjdHJsLnZpZXdEYXRhLmxpbWl0c0RhdGEubGltaXRzW1xcXCLQmNGC0L7Qs1xcXCJdLmZhdCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwia2FsbFxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlLWxpbWl0JzogJGN0cmwuY29tcGFyZSgna2FsbCcpfVxcXCI+e3sgJGN0cmwudmlld0RhdGEucmVzdWx0RmluYWwua2FsbCB9fSB7eycoJyArICRjdHJsLnZpZXdEYXRhLmxpbWl0c0RhdGEubGltaXRzW1xcXCLQmNGC0L7Qs1xcXCJdLmthbGwgKyAnKScgfCBsaW1pdCB9fTwvc3Bhbj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgIDwvc2VjdGlvbj5cXG4gICAgPC9kaXY+XFxuPC9kaXY+XFxuPHNhdmUtbWVudSBkYXktdGltZXMtZGF0YT1cXFwiJGN0cmwudmlld0RhdGEuZGF5VGltZXNcXFwiIHJlc3VsdD1cXFwiJGN0cmwudmlld0RhdGEucmVzdWx0RmluYWxcXFwiPjwvc2F2ZS1tZW51PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJtYWluLXZpZXcuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvZGlhcnktbW9kdWxlL21haW4tdmlldy90ZW1wbGF0ZS9tYWluLXZpZXcuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDE5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBkYXlUaW1lVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL2RheS10aW1lLXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IGRheVRpbWUgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGJhc2U6ICc8JyxcclxuICAgICAgICBkYXl0aW1lczogJzwnLFxyXG4gICAgICAgIGFkZDogJyYnLFxyXG4gICAgICAgIHJlbW92ZTogJyYnLFxyXG4gICAgICAgIGRheVRpbWVMaW1pdHM6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGRhdGFTZXJ2aWNlLCB2YWxpZGF0aW9uU2VydmljZSwgY2FsY3VsYXRpb25TZXJ2aWNlLCAkc2NvcGUsICRzdGF0ZVBhcmFtcywgaW5kZXhTZXJ2aWNlKSB7XHJcbiAgICAgICAgbGV0IGRheXRpbWUgPSAkc3RhdGVQYXJhbXMuZGF5dGltZTtcclxuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXhTZXJ2aWNlKGRheXRpbWUpO1xyXG5cclxuICAgICAgICB2YXIgdGV4dCA9ICcnO1xyXG4gICAgICAgIHRoaXMub25JbnB1dCA9IGZ1bmN0aW9uKHN0cikge1xyXG4gICAgICAgICAgICB0ZXh0ID0gc3RyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubGltaXRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRheVRpbWVMaW1pdHMubGltaXRzKSByZXR1cm4gdGhpcy5kYXlUaW1lTGltaXRzLmxpbWl0c1t0aGlzLmRheXRpbWVzW3RoaXMuaW5kZXhdLmRheVRpbWVdO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY29tcGFyZSA9IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMubGltaXRzKCkpIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKHRoaXMubGltaXRzKClba2V5XSA8IHRoaXMuZGF5dGltZXNbdGhpcy5pbmRleF0ucmVzdWx0W2tleV0pIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMucmVtb3ZlRm9vZCA9IGZ1bmN0aW9uKGZvb2QpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmUoe2RheVRpbWVJZDogdGhpcy5pbmRleCwgZm9vZDogZm9vZH0pXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRGb29kID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBwb3J0aW9uID0gTWF0aC5yb3VuZCgrdGhpcy5wb3J0aW9uKTtcclxuICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmZvb2ROYW1lID8gdGhpcy5mb29kTmFtZS50aXRsZSA6IHRleHQ7XHJcblxyXG4gICAgICAgICAgICAvL9Cf0YDQvtCy0LXRgNC40YLRjCDQv9C+0LvRjyDQstCy0L7QtNCwLCDQstGL0YfQuNGB0LvQuNGC0Ywg0LfQvdCw0YfQtdC90LjRj1xyXG4gICAgICAgICAgICBpZiAoIXZhbGlkYXRpb25TZXJ2aWNlLmZvb2RBZGRWYWxpZGF0aW9uKG5hbWUsIHBvcnRpb24pKSByZXR1cm47XHJcbiAgICAgICAgICAgIHZhciBmb29kID0gY2FsY3VsYXRpb25TZXJ2aWNlLmNhbGN1bGF0ZVZhbHVlcyhuYW1lLCBwb3J0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIC8v0JTQvtCx0LDQstC40YLRjCDQsiDQvNCw0YHRgdC40LJcclxuICAgICAgICAgICAgdGhpcy5hZGQoe2RheVRpbWVJZDogdGhpcy5kYXl0aW1lc1t0aGlzLmluZGV4XS5pZCwgZm9vZDogZm9vZH0pO1xyXG5cclxuICAgICAgICAgICAgLy/QntGH0LjRgdGC0LjRgtGMINC/0L7Qu9GPINCy0LLQvtC00LBcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ2FuZ3Vjb21wbGV0ZS1hbHQ6Y2xlYXJJbnB1dCcpO1xyXG4gICAgICAgICAgICB0aGlzLnBvcnRpb24gPScnO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICB0aGlzLmVudGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgIT09IDEzKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuYWRkRm9vZCgpO1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGRheVRpbWVUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkYXlUaW1lO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvZGF5LXRpbWUvZGF5LXRpbWUtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJkYXktdGltZVxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImlucHV0XFxcIj5cXHJcXG4gICAgICAgIDxmb3JtPlxcclxcbiAgICAgICAgICAgIDxsYWJlbD7QndCw0LjQvNC10L3QvtCy0LDQvdC40LU6IDxhbmd1Y29tcGxldGUtYWx0IG5nLWtleXByZXNzPVxcXCIkY3RybC5lbnRlcigkZXZlbnQpXFxcIiBpZD1cXFwiZXgxXFxcIiBwbGFjZWhvbGRlcj1cXFwi0JLQstC10LTQuNGC0LUg0L/RgNC+0LTRg9C60YJcXFwiIHBhdXNlPVxcXCIxMDBcXFwiIHNlbGVjdGVkLW9iamVjdD1cXFwiJGN0cmwuZm9vZE5hbWVcXFwiIGxvY2FsLWRhdGE9XFxcIiRjdHJsLmJhc2UuZm9vZHMua2V5c1xcXCIgc2VhcmNoLWZpZWxkcz1cXFwiZm9vZE5hbWVcXFwiIHRpdGxlLWZpZWxkPVxcXCJmb29kTmFtZVxcXCIgbWlubGVuZ3RoPVxcXCIxXFxcIiBpbnB1dC1jaGFuZ2VkPVxcXCIkY3RybC5vbklucHV0XFxcIiBpbnB1dC1jbGFzcz1cXFwiZm9vZCBmb3JtLWNvbnRyb2wtc21hbGxcXFwiIG1hdGNoLWNsYXNzPVxcXCJoaWdobGlnaHRcXFwiPjwvYW5ndWNvbXBsZXRlLWFsdD48L2xhYmVsPlxcclxcbiAgICAgICAgICAgIDxicj5cXHJcXG5cXHJcXG4gICAgICAgICAgICA8bGFiZWw+0J/QvtGA0YbQuNGPKNCz0YApOiA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcInBvcnRpb24taW5wdXRcXFwiIHNpemU9XFxcIjJcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC5wb3J0aW9uXFxcIiBuZy1rZXlwcmVzcz1cXFwiJGN0cmwuZW50ZXIoJGV2ZW50KVxcXCIvPjwvbGFiZWw+XFxyXFxuICAgICAgICA8L2Zvcm0+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhZGQtYnV0dG9uXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuYWRkRm9vZCgpXFxcIj4rPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcblxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJ0YWJsZS1ib3JkZXJcXFwiPlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInRhYmxlLXRpdHRsZVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJuYW1lXFxcIj7QndCw0LjQvNC10L3QvtCy0LDQvdC40LUg0L/RgNC+0LTRg9C60YLQsDwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInBvcnRpb25cXFwiPtCf0L7RgNGG0LjRjyAo0LPRgCk8L3NwYW4+XFxyXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjYXJib2h5ZFxcXCI+0KPQs9C70LXQstC+0LTRizwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInByb3RcXFwiPtCR0LXQu9C60Lg8L3NwYW4+XFxyXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJmYXRcXFwiPtCW0LjRgNGLPC9zcGFuPlxcclxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwia2FsbFxcXCI+0JrQsNC70L7RgNC40Lg8L3NwYW4+XFxyXFxuICAgICAgICAgICAgPC9kaXY+XFxyXFxuXFxyXFxuXFxyXFxuICAgICAgICAgICAgPGZvb2QgbmctcmVwZWF0PVxcXCJmb29kIGluICRjdHJsLmRheXRpbWVzWyRjdHJsLmluZGV4XS5mb29kc1xcXCIgZm9vZD1cXFwiZm9vZFxcXCIgcmVtb3ZlPVxcXCIkY3RybC5yZW1vdmVGb29kKGZvb2QpXFxcIj48L2Zvb2Q+XFxyXFxuXFxyXFxuXFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwic3VtbWFyeVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJuYW1lXFxcIj7Qn9C+0LTRi9GC0L7Qszwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInBvcnRpb25cXFwiPi0tLTwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNhcmJvaHlkXFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtbGltaXQnOiAkY3RybC5jb21wYXJlKCdjYXJib2h5ZCcpfVxcXCI+e3sgJGN0cmwuZGF5dGltZXNbJGN0cmwuaW5kZXhdLnJlc3VsdC5jYXJib2h5ZCB9fSB7eycoJyArICRjdHJsLmxpbWl0cygpLmNhcmJvaHlkICsgJyknIHwgbGltaXQgfX08L3NwYW4+XFxyXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJwcm90XFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtbGltaXQnOiAkY3RybC5jb21wYXJlKCdwcm90Jyl9XFxcIj57eyAkY3RybC5kYXl0aW1lc1skY3RybC5pbmRleF0ucmVzdWx0LnByb3QgfX0ge3snKCcgKyAkY3RybC5saW1pdHMoKS5wcm90ICsgJyknIHwgbGltaXQgfX08L3NwYW4+XFxyXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJmYXRcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2ZhdCcpfVxcXCI+e3sgJGN0cmwuZGF5dGltZXNbJGN0cmwuaW5kZXhdLnJlc3VsdC5mYXQgfX0ge3snKCcgKyAkY3RybC5saW1pdHMoKS5mYXQgKyAnKScgfCBsaW1pdCB9fTwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImthbGxcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2thbGwnKX1cXFwiPnt7ICRjdHJsLmRheXRpbWVzWyRjdHJsLmluZGV4XS5yZXN1bHQua2FsbCB9fSB7eycoJyArICRjdHJsLmxpbWl0cygpLmthbGwgKyAnKScgfCBsaW1pdCB9fTwvc3Bhbj5cXHJcXG4gICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cXHJcXG48L2Rpdj5cXHJcXG5cXHJcXG5cXHJcXG48ZGl2IGNsYXNzPVxcXCJiclxcXCI+PC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcImRheS10aW1lLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9kYXktdGltZS90ZW1wbGF0ZS9kYXktdGltZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMjFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGZvb2RUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvZm9vZC10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBmb29kID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBmb29kOiAnPCcsXHJcbiAgICAgICAgcmVtb3ZlOiAnJidcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNoZWNrRW1wdHlGb29kID0gZnVuY3Rpb24oZm9vZCkge1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4oZm9vZC5rYWxsKSkgcmV0dXJuICdlbXB0eSdcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiBmb29kVGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZm9vZDtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvZGlhcnktbW9kdWxlL2Zvb2QvZm9vZC1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcImZvb2RcXFwiIG5nLWNsYXNzPVxcXCIkY3RybC5jaGVja0VtcHR5Rm9vZCgkY3RybC5mb29kKVxcXCI+XFxyXFxuICAgIDxzcGFuIGNsYXNzPVxcXCJuYW1lXFxcIj57eyAkY3RybC5mb29kLm5hbWUgfX08L3NwYW4+XFxyXFxuICAgIDxzcGFuIGNsYXNzPVxcXCJwb3J0aW9uXFxcIj57eyAkY3RybC5mb29kLnBvcnRpb24gfX08L3NwYW4+XFxyXFxuICAgIDxzcGFuIGNsYXNzPVxcXCJjYXJib2h5ZFxcXCI+e3sgJGN0cmwuZm9vZC5jYXJib2h5ZCB9fTwvc3Bhbj5cXHJcXG4gICAgPHNwYW4gY2xhc3M9XFxcInByb3RcXFwiPnt7ICRjdHJsLmZvb2QucHJvdCB9fTwvc3Bhbj5cXHJcXG4gICAgPHNwYW4gY2xhc3M9XFxcImZhdFxcXCI+e3sgJGN0cmwuZm9vZC5mYXQgfX08L3NwYW4+XFxyXFxuICAgIDxzcGFuIGNsYXNzPVxcXCJrYWxsXFxcIj57eyAkY3RybC5mb29kLmthbGwgfX08L3NwYW4+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcInJlbW92ZS1mb29kXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwucmVtb3ZlKHtmb29kOiAkY3RybC5mb29kfSlcXFwiPjwvZGl2PlxcclxcbjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJmb29kLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9mb29kL3RlbXBsYXRlL2Zvb2QtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDIzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBzYXZlTWVudVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9zYXZlLW1lbnUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3Qgc2F2ZU1lbnUgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGRheVRpbWVzRGF0YTogJzwnLFxyXG4gICAgICAgIHJlc3VsdDogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHdpbmRvdywgbW9kYWwpIHtcclxuXHJcbiAgICAgICAgdGhpcy5zYXZlRm9yUHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSAkd2luZG93LmxvY2FsU3RvcmFnZS5kYXlzRGF0YSA/IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZGF5c0RhdGEpIDogW107XHJcbiAgICAgICAgICAgIC8v0J/RgNC+0LLQtdGA0LrQuFxyXG4gICAgICAgICAgICBpZiAoZGF0YS5sZW5ndGggPiAwICYmIG5ldyBEYXRlKGRhdGFbZGF0YS5sZW5ndGggLSAxXS5zYXZlVGltZSkuZ2V0RGF5KCkgPT09IG5ldyBEYXRlKCkuZ2V0RGF5KCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhW2RhdGEubGVuZ3RoIC0gMV0uc2F2ZVRpbWVJZCA9PT0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UuX2xhc3RTYXZlSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ce0YjQuNCx0LrQsCDRgdC+0YXRgNCw0L3QtdC90LjRjycsIG1lc3NhZ2U6ICfQndC10YIg0L3QvtCy0YvRhSDQtNCw0L3QvdGL0YUg0LTQu9GPINGB0L7RhdGA0LDQvdC10L3QuNGPJ30sICdhbGVydCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBtb2RhbC5vcGVuKHt0aXRsZTogJ9Cf0L7QtNGC0LLQtdGA0LTQuNGC0LUnLCBtZXNzYWdlOiAn0J/QtdGA0LXQt9Cw0L/QuNGB0LDRgtGMINC00LDQvdC90YvQtSDQv9C10YfQsNGC0Lgg0YLQtdC60YPRiNC10LPQviDQtNC90Y8/J30sICdjb25maXJtJylcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucG9wKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL9Ch0L7RhdGA0LDQvdC10L3QuNC1XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlkID0gKE1hdGgucmFuZG9tKCkgKyAnJykuc2xpY2UoMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXlEYXRhID0ge3NhdmVUaW1lOiBkYXRlLCBkYXlUaW1lczogdGhpcy5kYXlUaW1lc0RhdGEsIHJlc3VsdDogdGhpcy5yZXN1bHQsIHNhdmVUaW1lSWQ6IGlkfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKGRheURhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5kYXlzRGF0YSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCA9IGlkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQodC+0YXRgNCw0L3QtdC90LjQtSDQtNCw0L3QvdGL0YUnLCBtZXNzYWdlOiAn0JTQsNC90L3Ri9C1INGD0YHQv9C10YjQvdC+INGB0L7RhdGA0LDQvdC10L3Riyd9LCAnYWxlcnQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy/QodC+0YXRgNCw0L3QtdC90LjQtVxyXG4gICAgICAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGlkID0gKE1hdGgucmFuZG9tKCkgKyAnJykuc2xpY2UoMik7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF5RGF0YSA9IHtzYXZlVGltZTogZGF0ZSwgZGF5VGltZXM6IHRoaXMuZGF5VGltZXNEYXRhLCByZXN1bHQ6IHRoaXMucmVzdWx0LCBzYXZlVGltZUlkOiBpZH07XHJcbiAgICAgICAgICAgICAgICBkYXRhLnB1c2goZGF5RGF0YSk7XHJcbiAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5kYXlzRGF0YSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UuX2xhc3RTYXZlSWQgPSBpZDtcclxuICAgICAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0KHQvtGF0YDQsNC90LXQvdC40LUg0LTQsNC90L3Ri9GFJywgbWVzc2FnZTogJ9CU0LDQvdC90YvQtSDRg9GB0L/QtdGI0L3QviDRgdC+0YXRgNCw0L3QtdC90YsnfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVQcmludFNhdmVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5kYXlzRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQo9C00LDQu9C10L3QuNC1JywgbWVzc2FnZTogJ9Cj0LTQsNC70LjRgtGMINGB0L7RhdGA0LDQvdC10L3QuNGPINC00LvRjyDQv9C10YfQsNGC0Lg/J30sICdjb25maXJtJylcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2RheXNEYXRhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ19sYXN0U2F2ZUlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5wcmV2aWV3ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZGF5c0RhdGE7XHJcbiAgICAgICAgICAgIGlmICghZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQodC+0YXRgNCw0L3QtdC90LjQtScsIG1lc3NhZ2U6ICfQodC+0YXRgNCw0L3QuNGC0Ywg0YLQtdC60YPRidC40LUg0LTQsNC90L3Ri9C1INC00LvRjyDQv9GA0L7RgdC80L7RgtGA0LA/J30sICdjb25maXJtJylcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZUZvclByaW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbignLi9wcmludC5odG1sJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ce0YjQuNCx0LrQsCDQv9GA0LXQtNC/0YDQvtGB0LzQvtGC0YDQsCcsIG1lc3NhZ2U6ICfQndC10YIg0LTQsNC90L3Ri9GFINC00LvRjyDQv9GA0L7RgdC80L7RgtGA0LAhJ30sICdhbGVydCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YVtkYXRhLmxlbmd0aCAtIDFdLnNhdmVUaW1lSWQgIT09ICR3aW5kb3cubG9jYWxTdG9yYWdlLl9sYXN0U2F2ZUlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQodC+0YXRgNCw0L3QtdC90LjQtScsIG1lc3NhZ2U6ICfQodC+0YXRgNCw0L3QuNGC0Ywg0YLQtdC60YPRidC40LUg0LTQsNC90L3Ri9C1INC00LvRjyDQv9GA0L7RgdC80L7RgtGA0LA/J30sICdjb25maXJtJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlRm9yUHJpbnQoKS50aGVuKCgpID0+ICR3aW5kb3cub3BlbignLi9wcmludC5odG1sJyksICgpID0+ICR3aW5kb3cub3BlbignLi9wcmludC5odG1sJykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4gJHdpbmRvdy5vcGVuKCcuL3ByaW50Lmh0bWwnKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbignLi9wcmludC5odG1sJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2F2ZURhdGEgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQodC+0YXRgNCw0L3QtdC90LjQtScsIG1lc3NhZ2U6ICfQodC+0YXRgNCw0L3QuNGC0Ywg0YLQtdC60YPRidC40LUg0LTQsNC90L3Ri9C1Pyd9LCAnY29uZmlybScpXHJcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZURhdGEgPSBKU09OLnN0cmluZ2lmeSh7ZGF5c0RhdGE6IHRoaXMuZGF5VGltZXNEYXRhLCByZXN1bHRGaW5hbDogdGhpcy5yZXN1bHR9KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zYXZlZExpbWl0cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlZExpbWl0cyA9ICR3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2F2ZWRMaW1pdHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zYXZlZExpbWl0cyAmJiAkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlZExpbWl0cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdzYXZlZExpbWl0cycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ch0L7RhdGA0LDQvdC10L3QuNC1INC00LDQvdC90YvRhScsIG1lc3NhZ2U6ICfQlNCw0L3QvdGL0LUg0YPRgdC/0LXRiNC90L4g0YHQvtGF0YDQsNC90LXQvdGLJ30sICdhbGVydCcpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogc2F2ZU1lbnVUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzYXZlTWVudTtcclxuXHJcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvc2F2ZS1tZW51L3NhdmUtbWVudS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcInNhdmUtbWVudVxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcInRpdGxlXFxcIj7Qo9C/0YDQsNCy0LvQtdC90LjQtSDQtNCw0L3QvdGL0LzQuDwvZGl2PlxcclxcblxcclxcbiAgICA8ZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYnV0dG9uIHNhdmUtYnV0dG9uXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2F2ZURhdGEoKVxcXCI+0KHQvtGF0YDQsNC90LjRgtGMINC40LfQvNC10L3QtdC90LjRjzwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYnV0dG9uIHJlbW92ZS1kYXRhXFxcIj7Qo9C00LDQu9C40YLRjCDRgdC+0YXRgNCw0L3QtdC90LjRjzwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwidGl0bGVcXFwiPtCU0LvRjyDQv9C10YfQsNGC0Lg8L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwicHJpbnQtbWVudVxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJidXR0b24gdG8tcHJpbnRcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5wcmV2aWV3KClcXFwiPtCf0YDQtdC00L/RgNC+0YHQvNC+0YLRgDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYnV0dG9uIHByaW50LXRvLWxvY2FsU3RvcmFnZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNhdmVGb3JQcmludCgpXFxcIj7QodC+0YXRgNCw0L3QuNGC0Ywg0LTQu9GPINC/0LXRh9Cw0YLQuDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYnV0dG9uIHJlbW92ZS1wcmludC1sb2NhbFN0b3JhZ2VcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5yZW1vdmVQcmludFNhdmVzKClcXFwiPtCj0LTQsNC70LjRgtGMINGB0L7RhdGA0LDQvdC10L3QuNGPPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcbjwvZGl2PlxcclxcblxcclxcblxcclxcbjxkaXYgY2xhc3M9XFxcImJyXFxcIj48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwic2F2ZS1tZW51LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9zYXZlLW1lbnUvdGVtcGxhdGUvc2F2ZS1tZW51LXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAyNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgcmVzdWx0VGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL3Jlc3VsdC10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCByZXN1bHQgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHJlc3VsdDogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24obGltaXRzU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMubGltaXRzRGF0YSA9IGxpbWl0c1NlcnZpY2UubGltaXRzRGF0YTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjUGVyY2VudCA9IGZ1bmN0aW9uKHZhbHVlLCBsaW1pdCkge1xyXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm4gJzAlJztcclxuICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSAvIChsaW1pdCAvIDEwMCkgKS50b0ZpeGVkKCkgKyAnJSc7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjR3JhcGggPSBmdW5jdGlvbih2YWx1ZSwgbGltaXQpIHtcclxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICBsZXQgcGVyY2VudCA9ICh2YWx1ZSAvIChsaW1pdCAvIDEwMCkgKS50b0ZpeGVkKCk7XHJcbiAgICAgICAgICAgIGxldCBjb2xvciA9IHBlcmNlbnQgPiAxMDAgPyAncmdiYSgyMDIsIDIyLCA0MSwgMC4yKScgOiAncmdiYSgyNywgMjAxLCAxNDIsIDAuMSknO1xyXG4gICAgICAgICAgICBpZiAocGVyY2VudCA+IDEwMCkgcGVyY2VudCA9IDEwMDtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6IGNvbG9yLFxyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogcGVyY2VudCArICclJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiByZXN1bHRUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSByZXN1bHQ7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL2RpYXJ5LW1vZHVsZS9yZXN1bHQtY29tcG9uZW50L3Jlc3VsdC1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcInJlc3VsdFxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcInJlc3VsdC10aXRsZVxcXCI+0JjRgtC+0LMg0LTQvdGPPC9kaXY+XFxyXFxuXFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcInJlc3VsdC10YWJsZVxcXCIgbmctcmVwZWF0PVxcXCIoa2V5LCBlbGVtZW50KSBpbiAkY3RybC5yZXN1bHRcXFwiPlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwidGl0bGVcXFwiIG5nLWNsYXNzPVxcXCJ7fVxcXCI+XFxyXFxuICAgICAgICAgICAge3tlbGVtZW50Lm5hbWV9fSA8c3BhbiBuZy1pZj1cXFwiISEkY3RybC5saW1pdHNEYXRhLmxpbWl0c1xcXCI+KG1heCB7eyRjdHJsLmxpbWl0c0RhdGEubGltaXRzWyfQmNGC0L7QsyddW2tleV19fSk8L3NwYW4+XFxyXFxuICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInZhbHVlXFxcIiBuZy1jbGFzcz1cXFwieydsaW1pdHMnOiAhISRjdHJsLmxpbWl0c0RhdGEubGltaXRzfVxcXCI+XFxyXFxuICAgICAgICAgICAge3tlbGVtZW50LnZhbHVlfX1cXHJcXG4gICAgICAgICAgICA8c3BhbiBuZy1pZj1cXFwiISEkY3RybC5saW1pdHNEYXRhLmxpbWl0c1xcXCI+e3sgJGN0cmwuY2FsY1BlcmNlbnQoZWxlbWVudC52YWx1ZSwgJGN0cmwubGltaXRzRGF0YS5saW1pdHNbJ9CY0YLQvtCzJ11ba2V5XSkgfX08L3NwYW4+XFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZ3JhcGhcXFwiIG5nLWlmPVxcXCIhISRjdHJsLmxpbWl0c0RhdGEubGltaXRzXFxcIiBuZy1zdHlsZT1cXFwiJGN0cmwuY2FsY0dyYXBoKGVsZW1lbnQudmFsdWUsICRjdHJsLmxpbWl0c0RhdGEubGltaXRzWyfQmNGC0L7QsyddW2tleV0pXFxcIj48L2Rpdj5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cXHJcXG5cXHJcXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwicmVzdWx0LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9yZXN1bHQtY29tcG9uZW50L3RlbXBsYXRlL3Jlc3VsdC10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMjdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHRhYmxlTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3RhYmxlJywgW10pO1xyXG5cclxudGFibGVNb2R1bGVcclxuICAgIC5jb21wb25lbnQoJ3RhYmxlVmlldycsIHJlcXVpcmUoJy4vdGFibGUtdmlldy1jb21wb25lbnQvdGFibGUtdmlldy1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ3RhYmxlQWRkJywgcmVxdWlyZSgnLi9hZGQtdG8tdGFibGUtY29tcG9uZW50L2FkZC10by10YWJsZS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ2Zvb2RUYWJsZScsIHJlcXVpcmUoJy4vdGFibGUtY29tcG9uZW50L3RhYmxlLWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgnc3RvcmFnZVRhYmxlJywgcmVxdWlyZSgnLi9zdG9yYWdlLXRhYmxlLWNvbXBvbmVudC9zdG9yYWdlLXRhYmxlLWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgndGFibGVzJywgcmVxdWlyZSgnLi9zaW5nbGUtcGFnZS10YWJsZXMtY29tcG9uZW50L3NpbmdsZS1wYWdlLXRhYmxlcy1jb21wb25lbnQnKSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRhYmxlTW9kdWxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvaW5kZXguanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHRhYmxlVmlld1RlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS90YWJsZS12aWV3LXRlbXBsYXRlLmh0bWwnKTtcblxuY29uc3QgdGFibGVWaWV3ID0ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGRhdGFTZXJ2aWNlLCAkd2luZG93KSB7XG4gICAgICAgIGRhdGFTZXJ2aWNlLmdldFRhYmxlRGF0YSgpXG4gICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9vZHNPYmpzID0gZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5teUZvb2RzKSB0aGlzLm15Rm9vZHMgPSBKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLm15Rm9vZHMpO1xuXG4gICAgICAgIHRoaXMucmVtb3ZlTXlGb29kID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMubXlGb29kc1tuYW1lXTtcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLm15Rm9vZHMgPSBKU09OLnN0cmluZ2lmeSh0aGlzLm15Rm9vZHMpO1xuXG4gICAgICAgICAgICBkYXRhU2VydmljZS5yZW1vdmVGcm9tQmFzZShuYW1lKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmFkZE15Rm9vZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlcykge1xuICAgICAgICAgICAgaWYgKHRoaXMubXlGb29kc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIGlmICghY29uZmlybSgn0J/QtdGA0LXQt9Cw0L/QuNGB0LDRgtGMINGB0YPRidC10YHRgtCy0YPRjtGJ0LjQuSDQv9GA0L7QtNGD0LrRgj8nKSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGRhdGFTZXJ2aWNlLnJlbW92ZUZyb21CYXNlKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5teUZvb2RzW25hbWVdID0gdmFsdWVzO1xuICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UubXlGb29kcyA9IEpTT04uc3RyaW5naWZ5KHRoaXMubXlGb29kcyk7XG5cbiAgICAgICAgICAgIGRhdGFTZXJ2aWNlLmFkZFRvQmFzZShuYW1lLCB2YWx1ZXMpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogdGFibGVWaWV3VGVtcGxhdGVcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB0YWJsZVZpZXc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS12aWV3LWNvbXBvbmVudC90YWJsZS12aWV3LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPHRhYmxlLWFkZCBhZGQtbXktZm9vZD1cXFwiJGN0cmwuYWRkTXlGb29kKG5hbWUsIHZhbHVlcylcXFwiPjwvdGFibGUtYWRkPlxcclxcblxcclxcbjxkaXYgY2xhc3M9XFxcInRhYmxlLWNvbnRhaW5lclxcXCI+XFxyXFxuICAgIDxmb29kLXRhYmxlIG5nLXJlcGVhdD1cXFwiZm9vZHNPYmogaW4gJGN0cmwuZm9vZHNPYmpzXFxcIiBmb29kcy1vYmo9XFxcImZvb2RzT2JqXFxcIj48L2Zvb2QtdGFibGU+XFxyXFxuICAgIDxzdG9yYWdlLXRhYmxlIG15LWZvb2RzPVxcXCIkY3RybC5teUZvb2RzXFxcIiByZW1vdmUtbXktZm9vZD1cXFwiJGN0cmwucmVtb3ZlTXlGb29kKG5hbWUpXFxcIj48L3N0b3JhZ2UtdGFibGU+XFxyXFxuPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcInRhYmxlLXZpZXctdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLXZpZXctY29tcG9uZW50L3RlbXBsYXRlL3RhYmxlLXZpZXctdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDMwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBhZGRUb1RhYmxlVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBhZGRUb1RhYmxlID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBteUZvb2RzOiAnPCcsXHJcbiAgICAgICAgcmVtb3ZlTXlGb29kOiAnJicsXHJcbiAgICAgICAgYWRkTXlGb29kOiAnJidcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAodmFsaWRhdGlvblNlcnZpY2UpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygndGVzdCcpO1xyXG4gICAgICAgIHRoaXMudmFsdWVzID0gWzAsIDAsIDAsIDAsIDBdO1xyXG5cclxuICAgICAgICB0aGlzLmFkZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudCAmJiBldmVudC5rZXlDb2RlICE9PSAxMykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52YWx1ZXMuZm9yRWFjaCgodmFsdWUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlc1tpbmRleF0gPSArdmFsdWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICghdmFsaWRhdGlvblNlcnZpY2UuYWRkTXlGb29kVmFsaWRhdGlvbih0aGlzLm5hbWUsIHRoaXMudmFsdWVzKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGRNeUZvb2Qoe25hbWU6IHRoaXMubmFtZSwgdmFsdWVzOiB0aGlzLnZhbHVlc30pO1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlcyA9IFswLCAwLCAwLCAwLCAwXTtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gJyc7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbihuYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTXlGb29kKHtuYW1lOiBuYW1lfSlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGFkZFRvVGFibGVUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBhZGRUb1RhYmxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvYWRkLXRvLXRhYmxlLWNvbXBvbmVudC9hZGQtdG8tdGFibGUtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJhZGQtdG8tdGFibGUtZm9ybVxcXCI+XFxyXFxuICAgIDxoMyBjbGFzcz1cXFwiYWRkLWZvcm0tdGl0bGVcXFwiPtCU0L7QsdCw0LLQuNGC0Ywg0L/RgNC+0LTRg9C60YIg0LIg0YLQsNCx0LvQuNGG0YM8L2gzPlxcclxcbiAgICA8Zm9ybSBjbGFzcz1cXFwidGFibGUtZm9ybVxcXCI+XFxyXFxuICAgICAgICA8dGFibGU+XFxyXFxuICAgICAgICAgICAgPHRyPjx0ZD48bGFiZWwgZm9yPVxcXCJmb29kLW5hbWVcXFwiPtCd0LDQuNC80LXQvdC+0LLQsNC90LjQtTo8L2xhYmVsPjwvdGQ+PHRkPjxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBpZD1cXFwiZm9vZC1uYW1lXFxcIiBuZy1tb2RlbD1cXFwiJGN0cmwubmFtZVxcXCIgbmcta2V5ZG93bj1cXFwiJGN0cmwuYWRkKCRldmVudClcXFwiLz48L3RkPjwvdHI+XFxyXFxuICAgICAgICAgICAgPHRyPjx0ZD48bGFiZWwgZm9yPVxcXCJ0YWJsZS1mb3JtLXBvcnRpb25cXFwiPtCf0L7RgNGG0LjRjyjQs9GAKTo8L2xhYmVsPjwvdGQ+PHRkPjxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBpZD1cXFwidGFibGUtZm9ybS1wb3J0aW9uXFxcIiBzaXplPVxcXCIyXFxcIiBuZy1tb2RlbD1cXFwiJGN0cmwudmFsdWVzWzBdXFxcIiBuZy1rZXlkb3duPVxcXCIkY3RybC5hZGQoJGV2ZW50KVxcXCIvPjwvdGQ+PC90cj5cXHJcXG4gICAgICAgICAgICA8dHI+PHRkPjxsYWJlbCBmb3I9XFxcInRhYmxlLWZvcm0tY2FyYm9oeWRcXFwiPtCj0LPQu9C10LLQvtC00Ys6PC9sYWJlbD48L3RkPjx0ZD48aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgaWQ9XFxcInRhYmxlLWZvcm0tY2FyYm9oeWRcXFwiIHNpemU9XFxcIjJcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC52YWx1ZXNbMV1cXFwiIG5nLWtleWRvd249XFxcIiRjdHJsLmFkZCgkZXZlbnQpXFxcIi8+PC90ZD48L3RyPlxcclxcbiAgICAgICAgICAgIDx0cj48dGQ+PGxhYmVsIGZvcj1cXFwidGFibGUtZm9ybS1wcm90XFxcIj7QkdC10LvQutC4OjwvbGFiZWw+PC90ZD48dGQ+PGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGlkPVxcXCJ0YWJsZS1mb3JtLXByb3RcXFwiIHNpemU9XFxcIjJcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC52YWx1ZXNbMl1cXFwiIG5nLWtleWRvd249XFxcIiRjdHJsLmFkZCgkZXZlbnQpXFxcIi8+PC90ZD48L3RyPlxcclxcbiAgICAgICAgICAgIDx0cj48dGQ+PGxhYmVsIGZvcj1cXFwidGFibGUtZm9ybS1mYXRcXFwiPtCW0LjRgNGLOjwvbGFiZWw+PC90ZD48dGQ+PGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGlkPVxcXCJ0YWJsZS1mb3JtLWZhdFxcXCIgc2l6ZT1cXFwiMlxcXCIgbmctbW9kZWw9XFxcIiRjdHJsLnZhbHVlc1szXVxcXCIgbmcta2V5ZG93bj1cXFwiJGN0cmwuYWRkKCRldmVudClcXFwiLz48L3RkPjwvdHI+XFxyXFxuICAgICAgICAgICAgPHRyPjx0ZD48bGFiZWwgZm9yPVxcXCJ0YWJsZS1mb3JtLWthbFxcXCI+0JrQsNC70L7RgNC40Lg6PC9sYWJlbD48L3RkPjx0ZD48aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgaWQ9XFxcInRhYmxlLWZvcm0ta2FsXFxcIiBzaXplPVxcXCIyXFxcIiBuZy1tb2RlbD1cXFwiJGN0cmwudmFsdWVzWzRdXFxcIiBuZy1rZXlkb3duPVxcXCIkY3RybC5hZGQoJGV2ZW50KVxcXCIvPjwvdGQ+PC90cj5cXHJcXG4gICAgICAgIDwvdGFibGU+XFxyXFxuXFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhZGQtdG8tdGFibGUtYnV0dG9uXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuYWRkKClcXFwiPis8L2Rpdj5cXHJcXG4gICAgPC9mb3JtPlxcclxcblxcclxcbjwvZGl2PlxcclxcblxcclxcbjxkaXYgY2xhc3M9XFxcIm15LXRhYmxlXFxcIj5cXHJcXG48c3RvcmFnZS10YWJsZSBteS1mb29kcz1cXFwiJGN0cmwubXlGb29kc1xcXCIgcmVtb3ZlPVxcXCIkY3RybC5yZW1vdmUobmFtZSlcXFwiPjwvc3RvcmFnZS10YWJsZT48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwiYWRkLXRvLXRhYmxlLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMzJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHRhYmxlVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL3RhYmxlLXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IHRhYmxlID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBmb29kc09iajogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiB0YWJsZVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRhYmxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvdGFibGUtY29tcG9uZW50L3RhYmxlLWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPHRhYmxlIGNsYXNzPVxcXCJ0YlxcXCI+XFxyXFxuICAgIDxjYXB0aW9uIGNsYXNzPVxcXCJ0Yi10aXRsZVxcXCI+e3sgJGN0cmwuZm9vZHNPYmoudGl0bGUgfX08L2NhcHRpb24+XFxyXFxuICAgIDx0ciBuZy1yZXBlYXQ9XFxcImZvb2QgaW4gJGN0cmwuZm9vZHNPYmouZm9vZHNcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5yZW1vdmUoe2Zvb2Q6IGZvb2QsIG9iajogJGN0cmwuZm9vZHNPYmouZm9vZHN9KVxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj5cXHJcXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwidGQtbmFtZSBuYW1lLWNvbG9yXFxcIiBuZy1jbGFzcz1cXFwiZm9vZC5jbGFzc05hbWVcXFwiPnt7IGZvb2QudmFsdWVzLm5hbWUgfX08L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJwb3J0aW9uLWNvbG9yXFxcIiBuZy1jbGFzcz1cXFwiZm9vZC5jbGFzc05hbWVcXFwiPnt7IGZvb2QudmFsdWVzLnBvcnRpb24gfX08L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJjYXJib2h5ZC1jb2xvclxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj57eyBmb29kLnZhbHVlcy5jYXJib2h5ZCB9fTwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcInByb3QtY29sb3JcXFwiIG5nLWNsYXNzPVxcXCJmb29kLmNsYXNzTmFtZVxcXCI+e3sgZm9vZC52YWx1ZXMucHJvdCB9fTwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcImZhdC1jb2xvclxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj57eyBmb29kLnZhbHVlcy5mYXQgfX08L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJrYWxsLWNvbG9yXFxcIiBuZy1jbGFzcz1cXFwiZm9vZC5jbGFzc05hbWVcXFwiPnt7IGZvb2QudmFsdWVzLmthbGwgfX08L3RkPlxcclxcbiAgICA8L3RyPlxcclxcbjwvdGFibGU+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcInRhYmxlLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS1jb21wb25lbnQvdGVtcGxhdGUvdGFibGUtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDM0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBzdG9yYWdlVGFibGVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvc3RvcmFnZS10YWJsZS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBzdG9yYWdlVGFibGUgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIG15Rm9vZHM6ICc8JyxcclxuICAgICAgICByZW1vdmU6ICcmJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2hvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMubXlGb29kcykgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5teUZvb2RzKS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogc3RvcmFnZVRhYmxlVGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc3RvcmFnZVRhYmxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvc3RvcmFnZS10YWJsZS1jb21wb25lbnQvc3RvcmFnZS10YWJsZS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjx0YWJsZSBjbGFzcz1cXFwidGJcXFwiIG5nLWlmPVxcXCIkY3RybC5zaG93KClcXFwiPlxcclxcbiAgICA8Y2FwdGlvbiBjbGFzcz1cXFwidGItdGl0bGVcXFwiPtCU0L7QsdCw0LLQu9C10L3Ri9C1INC/0YDQvtC00YPQutGC0Ys8L2NhcHRpb24+XFxyXFxuICAgIDx0cj5cXHJcXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwidGQtbmFtZSBuYW1lLWNvbG9yIGNvbG9yXFxcIj7QndCw0LjQvNC10L3QvtCy0LDQvdC40LUg0L/RgNC+0LTRg9C60YLQsDwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcInBvcnRpb24tY29sb3IgY29sb3JcXFwiPtCf0L7RgNGG0LjRjzwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcImNhcmJvaHlkLWNvbG9yIGNvbG9yXFxcIj7Qo9Cz0LvQtdCy0L7QtNGLPC90ZD5cXHJcXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwicHJvdC1jb2xvciBjb2xvclxcXCI+0JHQtdC70LrQuDwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcImZhdC1jb2xvciBjb2xvclxcXCI+0JbQuNGA0Ys8L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJrYWxsLWNvbG9yIGNvbG9yXFxcIj7QmtCw0LvQvtGA0LjQuDwvdGQ+XFxyXFxuICAgIDwvdHI+XFxyXFxuXFxyXFxuICAgIDx0ciBjbGFzcz1cXFwibXktZm9vZFxcXCIgbmctcmVwZWF0PVxcXCIoZm9vZE5hbWUsIHZhbHVlcykgaW4gJGN0cmwubXlGb29kc1xcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnJlbW92ZSh7bmFtZTogZm9vZE5hbWV9KVxcXCI+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcInRkLW5hbWVcXFwiPnt7IGZvb2ROYW1lIH19PC90ZD5cXHJcXG4gICAgICAgIDx0ZD57eyB2YWx1ZXNbMF0gfX08L3RkPlxcclxcbiAgICAgICAgPHRkPnt7IHZhbHVlc1sxXSB9fTwvdGQ+XFxyXFxuICAgICAgICA8dGQ+e3sgdmFsdWVzWzJdIH19PC90ZD5cXHJcXG4gICAgICAgIDx0ZD57eyB2YWx1ZXNbM10gfX08L3RkPlxcclxcbiAgICAgICAgPHRkPnt7IHZhbHVlc1s0XSB9fTwvdGQ+XFxyXFxuICAgIDwvdHI+XFxyXFxuPC90YWJsZT5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwic3RvcmFnZS10YWJsZS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC90YWJsZS1tb2R1bGUvc3RvcmFnZS10YWJsZS1jb21wb25lbnQvdGVtcGxhdGUvc3RvcmFnZS10YWJsZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMzZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9zaW5nbGUtcGFnZS10YWJsZXMtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgdGFibGVzID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBmb29kc09ianM6ICc8JyxcclxuICAgICAgICBteUZvb2RzOiAnPCcsXHJcbiAgICAgICAgcmVtb3ZlTXlGb29kOiAnJidcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkdGltZW91dCkge1xyXG4gICAgICAgIHRoaXMuc2hvd1RhYmxlID0gZnVuY3Rpb24oaGFzaEtleSkge1xyXG4gICAgICAgICAgICB0aGlzLiQkaGFzaEtleSA9IGhhc2hLZXk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHRpbWVvdXQoKCkgPT4gdGhpcy5zaG93VGFibGUodGhpcy5mb29kc09ianNbMF0uJCRoYXNoS2V5KSwwKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbihvYmopIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVNeUZvb2Qoe25hbWU6IG9ian0pXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93TXlGb29kVGl0bGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm15Rm9vZHMpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuICEhT2JqZWN0LmtleXModGhpcy5teUZvb2RzKS5sZW5ndGhcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXHJcbn0gO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0YWJsZXM7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3RhYmxlLW1vZHVsZS9zaW5nbGUtcGFnZS10YWJsZXMtY29tcG9uZW50L3NpbmdsZS1wYWdlLXRhYmxlcy1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcInRhYmxlcy1saXN0XFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwidGl0bGVcXFwiPtCi0LDQsdC70LjRhtGLPC9kaXY+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImxpc3RcXFwiPlxcclxcbiAgICAgICAgPGRpdiBuZy1yZXBlYXQ9XFxcIm9iaiBpbiAkY3RybC5mb29kc09ianNcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zaG93VGFibGUob2JqLiQkaGFzaEtleSlcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS10YWJsZS10aXRsZSc6ICRjdHJsLiQkaGFzaEtleSA9PT0gb2JqLiQkaGFzaEtleX1cXFwiPlxcclxcbiAgICAgICAgICAgIC0ge3tvYmoudGl0bGV9fVxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IG5nLWlmPVxcXCIkY3RybC5zaG93TXlGb29kVGl0bGUoKVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNob3dUYWJsZSgnYWRkLWZvb2QnKVxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlLXRhYmxlLXRpdGxlJzogJGN0cmwuJCRoYXNoS2V5ID09PSAnYWRkLWZvb2QnfVxcXCI+LSDQlNC+0LHQsNCy0LvQtdC90L3Ri9C1INC/0YDQvtC00YPQutGC0Ys8L2Rpdj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuPC9kaXY+XFxyXFxuXFxyXFxuPGRpdiBjbGFzcz1cXFwidGFibGUtY29udGFpbmVyXFxcIj5cXHJcXG4gICAgPGZvb2QtdGFibGUgbmctcmVwZWF0PVxcXCJmb29kc09iaiBpbiAkY3RybC5mb29kc09ianNcXFwiIGZvb2RzLW9iaj1cXFwiZm9vZHNPYmpcXFwiIG5nLWlmPVxcXCIkY3RybC4kJGhhc2hLZXkgPT09IGZvb2RzT2JqLiQkaGFzaEtleVxcXCI+PC9mb29kLXRhYmxlPlxcclxcbiAgICA8c3RvcmFnZS10YWJsZSBteS1mb29kcz1cXFwiJGN0cmwubXlGb29kc1xcXCIgcmVtb3ZlPVxcXCIkY3RybC5yZW1vdmUobmFtZSlcXFwiIG5nLWlmPVxcXCIkY3RybC4kJGhhc2hLZXkgPT09ICdhZGQtZm9vZCdcXFwiPjwvc3RvcmFnZS10YWJsZT5cXHJcXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwic2luZ2xlLXBhZ2UtdGFibGVzLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL3RhYmxlLW1vZHVsZS9zaW5nbGUtcGFnZS10YWJsZXMtY29tcG9uZW50L3RlbXBsYXRlL3NpbmdsZS1wYWdlLXRhYmxlcy10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMzhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAyKSByZXR1cm4gJyc7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9saW1pdHMtZmlsdGVyLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkaHR0cCwgJHdpbmRvdykge1xyXG4gICAgdmFyIGJhc2UgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRGb29kQmFzZSgpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcuL0pTT05kYXRhL2Zvb2QuanNvbicpLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgdmFyIGJhc2UgPSB7fSwga2V5cyA9IFtdO1xyXG4gICAgICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UubXlGb29kcykgZGF0YS5kYXRhLnB1c2goSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5teUZvb2RzKSk7XHJcblxyXG4gICAgICAgICAgICBkYXRhLmRhdGEuZm9yRWFjaCgob2JqKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gb2JqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ25hbWUnKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICBiYXNlW2tleV0gPSBvYmpba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGJhc2UpLmZvckVhY2goKGtleSkgPT4ga2V5cy5wdXNoKHtmb29kTmFtZToga2V5fSkpO1xyXG4gICAgICAgICAgICBiYXNlLmtleXMgPSBrZXlzO1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGdldEZvb2RCYXNlKCkudGhlbigoZGF0YSkgPT4gYmFzZS5mb29kcyA9IGRhdGEpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFkZFRvQmFzZShuYW1lLCB2YWx1ZXMpIHtcclxuICAgICAgICBiYXNlLmZvb2RzW25hbWVdID0gdmFsdWVzO1xyXG4gICAgICAgIGJhc2UuZm9vZHMua2V5cy5wdXNoKHtmb29kTmFtZTogbmFtZX0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbW92ZUZyb21CYXNlKG5hbWUpIHtcclxuICAgICAgICBkZWxldGUgYmFzZS5mb29kc1tuYW1lXTtcclxuXHJcbiAgICAgICAgYmFzZS5mb29kcy5rZXlzLmZvckVhY2goKG9iaiwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgaWYgKG9iai5mb29kTmFtZSA9PT0gbmFtZSkgYmFzZS5mb29kcy5rZXlzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRGb29kT2JqZWN0cygpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcuL0pTT05kYXRhL2Zvb2QuanNvbicpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0RGF5VGltZXNEYXRhKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy4vSlNPTmRhdGEvZGF5LXRpbWVzLWRhdGEuanNvbicpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0TGltaXRzRGF0YShkaWV0LCBwaGFzZSkge1xyXG4gICAgICAgIGxldCBwYXRoID0gJy4vSlNPTmRhdGEvbGltaXRzLWRhdGEvJyArIGRpZXQgKyAnLXBoYXNlJyArIHBoYXNlICsgJy5qc29uJztcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KHBhdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFRhYmxlRGF0YSgpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcuL0pTT05kYXRhL2Zvb2QuanNvbicpXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGFibGVEYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0YS5kYXRhLmZvckVhY2goKG9iaikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdPYmogPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb29kczogW11cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQgPSAyMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIG9iaikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAnbmFtZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld09iai50aXRsZSA9IG9iai5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjb3VudCA+PSAyMCApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0aXRsZURhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnY29sb3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAn0J3QsNC40LzQtdC90L7QstCw0L3QuNC1INC/0YDQvtC00YPQutGC0LAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3J0aW9uOiAn0J/QvtGA0YbQuNGPJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyYm9oeWQ6ICfQo9Cz0LvQtdCy0L7QtNGLJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdDogJ9CR0LXQu9C60LgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYXQ6ICfQltC40YDRiycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGthbGw6ICfQmtCw0LvQvtGA0LjQuCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3T2JqLmZvb2RzLnB1c2godGl0bGVEYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZm9vZCA9IHtjbGFzc05hbWU6ICcnLCB2YWx1ZXM6IHt9fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9vZC52YWx1ZXMubmFtZSA9IGtleTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9vZC52YWx1ZXMucG9ydGlvbiA9IG9ialtrZXldWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5jYXJib2h5ZCA9IG9ialtrZXldWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5wcm90ID0gb2JqW2tleV1bMl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvb2QudmFsdWVzLmZhdCA9IG9ialtrZXldWzNdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5rYWxsID0gb2JqW2tleV1bNF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld09iai5mb29kcy5wdXNoKGZvb2QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEYXRhLnB1c2gobmV3T2JqKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB0YWJsZURhdGE7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVEYXRhICYmICFjb25maXJtKCfQl9Cw0LPRgNGD0LfQuNGC0Ywg0YHQvtGF0YDQsNC90LXQvdC40Y8/JykpIHtcclxuICAgICAgICBpZiAoY29uZmlybSgn0KPQtNCw0LvQuNGC0Ywg0LjQvNC10Y7RidC40LXRgdGPINGB0L7RhdGA0LDQvdC10L3QuNGPPycpKSB7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3NhdmVEYXRhJyk7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3NhdmVkTGltaXRzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgYmFzZTogYmFzZSxcclxuICAgICAgICBhZGRUb0Jhc2U6IGFkZFRvQmFzZSxcclxuICAgICAgICByZW1vdmVGcm9tQmFzZTogcmVtb3ZlRnJvbUJhc2UsXHJcbiAgICAgICAgZ2V0Rm9vZEJhc2U6IGdldEZvb2RCYXNlLFxyXG4gICAgICAgIGdldEZvb2RPYmplY3RzOiBnZXRGb29kT2JqZWN0cyxcclxuICAgICAgICBnZXRUYWJsZURhdGE6IGdldFRhYmxlRGF0YSxcclxuICAgICAgICBnZXREYXlUaW1lc0RhdGE6IGdldERheVRpbWVzRGF0YSxcclxuICAgICAgICBnZXRMaW1pdHNEYXRhOiBnZXRMaW1pdHNEYXRhXHJcbiAgICB9O1xyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9kYXRhLXNlcnZpY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGFTZXJ2aWNlLCBtb2RhbCkge1xyXG4gICAgdmFyIGZvb2QgPSBkYXRhU2VydmljZS5iYXNlO1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBmb29kQWRkVmFsaWRhdGlvbihuYW1lLCBwb3J0aW9uKSB7XHJcbiAgICAgICAgaWYgKCFuYW1lKSB7XHJcbiAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwJywgbWVzc2FnZTogJ9CS0LLQtdC00LjRgtC1INC90LDQt9Cy0LDQvdC40LUg0L/RgNC+0LTRg9C60YLQsCd9LCAnYWxlcnQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCFmb29kLmZvb2RzW25hbWVdKSB7XHJcbiAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwJywgbWVzc2FnZTogJ9Ci0LDQutC+0LPQviDQv9GA0L7QtNGD0LrRgtCwINC90LXRgiDQsiDQsdCw0LfQtS4g0KHQviDRgdC/0LjRgdC60L7QvCDQv9GA0L7QtNGD0LrRgtC+0LIg0JLRiyDQvNC+0LbQtdGC0LUg0L7Qt9C90LDQutC+0LzQuNGC0YzRgdGPINCyINGA0LDQt9C00LXQu9C1IFwi0KLQsNCx0LvQuNGG0YtcIiwg0LvQuNCx0L4g0LTQvtCx0LDQstC40YLRjCDRgdCy0L7QuSDQv9GA0L7QtNGD0LrRgid9LCAnYWxlcnQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCFwb3J0aW9uKSB7XHJcbiAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwJywgbWVzc2FnZTogJ9CS0LLQtdC00LjRgtC1INC/0L7RgNGG0LjRjiDQsiDQs9GA0LDQvNC80LDRhSd9LCAnYWxlcnQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGlzTmFOKCtwb3J0aW9uKSkge1xyXG4gICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIG1lc3NhZ2U6ICfQkiDQv9C+0LvQtSBcItCf0L7RgNGG0LjRj1wiINCy0LLQtdC00LjRgtC1INGH0LjRgdC70L4nfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgfWVsc2UgaWYgKHBvcnRpb24gPD0gMCkge1xyXG4gICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIG1lc3NhZ2U6ICfQktCy0LXQtNC40YLQtSDRh9C40YHQu9C+INCx0L7Qu9GM0YjQtSDRh9C10LwgMCd9LCAnYWxlcnQnKTtcclxuICAgICAgICB9IGVsc2UgeyByZXR1cm4gdHJ1ZX1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB2YWxpZGF0ZUxpbWl0c0Nob29zZShkaWV0MSwgZGlldDIsIHBoYXNlQ2xhc3MpIHtcclxuICAgICAgICBpZiggKGRpZXQxIHx8IGRpZXQyKSAmJiBwaGFzZUNsYXNzICE9PSAnc3RhcnQnKSByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGRNeUZvb2RWYWxpZGF0aW9uKG5hbWUsIHZhbHVlcykge1xyXG4gICAgICAgIGxldCBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQntGI0LjQsdC60LAnLCBtZXNzYWdlOiAn0JLQstC10LTQuNGC0LUg0L3QsNC40LzQtdC90L7QstCw0L3QuNC1INC/0YDQvtC00YPQutGC0LAnfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWVzWzBdID09PSAwKSB7XHJcbiAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwJywgbWVzc2FnZTogJ9Cf0L7RgNGG0LjRjyDQvdC1INC80L7QttC10YIg0LHRi9GC0Ywg0YDQsNCy0L3QsCDQvdGD0LvRjid9LCAnYWxlcnQnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YWx1ZXMuZm9yRWFjaCgodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGlzTmFOKHZhbHVlKXx8IHZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQntGI0LjQsdC60LAnLCBtZXNzYWdlOiAn0JfQvdCw0YfQtdC90LjRjyDQtNC+0LvQttC90Ysg0LHRi9GC0Ywg0YfQuNGB0LvQsNC80Lgg0YHQviDQt9C90LDRh9C10L3QuNC10Lwg0LHQvtC70YzRiNC40Lwg0LjQu9C4INGA0LDQstC90YvQvCDQvdGD0LvRjid9LCAnYWxlcnQnKTtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZm9vZEFkZFZhbGlkYXRpb246IGZvb2RBZGRWYWxpZGF0aW9uLFxyXG4gICAgICAgIHZhbGlkYXRlTGltaXRzQ2hvb3NlOiB2YWxpZGF0ZUxpbWl0c0Nob29zZSxcclxuICAgICAgICBhZGRNeUZvb2RWYWxpZGF0aW9uOiBhZGRNeUZvb2RWYWxpZGF0aW9uXHJcbiAgICB9XHJcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3NlcnZpY2VzL3ZhbGlkYXRpb24tc2VydmljZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YVNlcnZpY2UpIHtcclxuICAgIHZhciBmb29kID0gZGF0YVNlcnZpY2UuYmFzZTtcclxuXHJcbiAgICBmdW5jdGlvbiBjYWxjdWxhdGVWYWx1ZXMoZm9vZE5hbWUsIHBvcnRpb24pIHtcclxuICAgICAgICBsZXQgdmFsdWVzID0gZm9vZC5mb29kc1tmb29kTmFtZV07XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbmFtZTogZm9vZE5hbWUsXHJcbiAgICAgICAgICAgIHBvcnRpb246IHBvcnRpb24sXHJcbiAgICAgICAgICAgIGNhcmJvaHlkOiBNYXRoLnJvdW5kKHZhbHVlc1sxXS92YWx1ZXNbMF0qcG9ydGlvbiksXHJcbiAgICAgICAgICAgIHByb3Q6IE1hdGgucm91bmQodmFsdWVzWzJdL3ZhbHVlc1swXSpwb3J0aW9uKSxcclxuICAgICAgICAgICAgZmF0OiBNYXRoLnJvdW5kKHZhbHVlc1szXS92YWx1ZXNbMF0qcG9ydGlvbiksXHJcbiAgICAgICAgICAgIGthbGw6IE1hdGgucm91bmQodmFsdWVzWzRdL3ZhbHVlc1swXSpwb3J0aW9uKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNhbGN1bGF0ZVZhbHVlczogY2FsY3VsYXRlVmFsdWVzXHJcbiAgICB9XHJcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3NlcnZpY2VzL2NhbGN1bGF0aW9uLXNlcnZpY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGFTZXJ2aWNlKSB7XHJcbiAgICB2YXIgbGltaXRzRGF0YSA9IHt9O1xyXG5cclxuICAgIGZ1bmN0aW9uIHNldExpbWl0cyhkaWV0LCBwaGFzZSkge1xyXG4gICAgICAgIGRhdGFTZXJ2aWNlLmdldExpbWl0c0RhdGEoZGlldCwgcGhhc2UpXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiBsaW1pdHNEYXRhLmxpbWl0cyA9IGRhdGEuZGF0YSlcclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gY2xlYXJMaW1pdHMoKSB7XHJcbiAgICAgICAgaWYgKGxpbWl0c0RhdGEubGltaXRzKSBkZWxldGUgbGltaXRzRGF0YS5saW1pdHNcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGxpbWl0c0RhdGE6IGxpbWl0c0RhdGEsXHJcbiAgICAgICAgc2V0TGltaXRzOiBzZXRMaW1pdHMsXHJcbiAgICAgICAgY2xlYXJMaW1pdHM6IGNsZWFyTGltaXRzXHJcbiAgICB9XHJcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3NlcnZpY2VzL2xpbWl0cy1zZXJ2aWNlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihkYXl0aW1lKSB7XHJcbiAgICAgICAgc3dpdGNoIChkYXl0aW1lKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ2JyZWFrZmFzdCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdmaXJzdC1zbmFjayc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdkaW5uZXInOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnc2Vjb25kLXNuYWNrJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAzO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2V2ZW5pbmctbWVhbCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvc2VydmljZXMvaW5kZXgtc2VydmljZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgYWN0aXZlQ2xhc3MgPSAnJztcclxuXHJcbiAgICBmdW5jdGlvbiBzZXRDbGFzc05hbWUoY2xhc3NOYW1lKSB7XHJcbiAgICAgICAgYWN0aXZlQ2xhc3MgPSAnYWN0aXZlLScgKyBjbGFzc05hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Q2xhc3NOYW1lKCkge1xyXG4gICAgICAgIHJldHVybiBhY3RpdmVDbGFzc1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0Q2xhc3NOYW1lOiBnZXRDbGFzc05hbWUsXHJcbiAgICAgICAgc2V0Q2xhc3NOYW1lOiBzZXRDbGFzc05hbWVcclxuICAgIH1cclxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvc2VydmljZXMvYWN0aXZlLWNsYXNzLXNlcnZpY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCR0aW1lb3V0LCB2YWxpZGF0aW9uU2VydmljZSwgbGltaXRzU2VydmljZSwgJHdpbmRvdywgbW9kYWwpIHtcclxuICAgIHZhciBkaWV0cyA9IHtcclxuICAgICAgICBjYXJib2h5ZHJhdGVzOiBmYWxzZSxcclxuICAgICAgICBwcm90ZWluczogZmFsc2VcclxuICAgIH0sXHJcbiAgICAgICAgY2xhc3NOYW1lID0ge25hbWU6ICdzdGFydCd9O1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBzZXREaWV0KGRpZXQpIHtcclxuICAgICAgICBpZiAoZGlldHNbZGlldF0pIHtcclxuICAgICAgICAgICAgZGlldHNbZGlldF0gPSBmYWxzZTtcclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4gZGlldHNbZGlldF0gPSB0cnVlLCAwKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkaWV0cy5jYXJib2h5ZHJhdGVzID0gZGlldCA9PT0gJ2NhcmJvaHlkcmF0ZXMnO1xyXG4gICAgICAgIGRpZXRzLnByb3RlaW5zID0gZGlldCA9PT0gJ3Byb3RlaW5zJztcclxuICAgICAgICBpZiAodmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVMaW1pdHNDaG9vc2UoZGlldHMuY2FyYm9oeWRyYXRlcywgZGlldHMucHJvdGVpbnMsIGNsYXNzTmFtZS5uYW1lKSkgc2V0TGltaXRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0Q2xhc3NOYW1lKHBoYXNlSWQpIHtcclxuICAgICAgICBjbGFzc05hbWUubmFtZSA9ICdhY3RpdmUnICsgcGhhc2VJZDtcclxuICAgICAgICBpZiAodmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVMaW1pdHNDaG9vc2UoZGlldHMuY2FyYm9oeWRyYXRlcywgZGlldHMucHJvdGVpbnMsIGNsYXNzTmFtZS5uYW1lKSkgc2V0TGltaXRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0TGltaXRzKCkge1xyXG4gICAgICAgIGxldCBkaWV0ID0gZGlldHMuY2FyYm9oeWRyYXRlcyA/ICdjYXJib2h5ZHJhdGVzJyA6ICdwcm90ZWlucycsXHJcbiAgICAgICAgICAgIHBoYXNlID0gY2xhc3NOYW1lLm5hbWUuc2xpY2UoLTEpO1xyXG4gICAgICAgIGxpbWl0c1NlcnZpY2Uuc2V0TGltaXRzKGRpZXQsIHBoYXNlKTtcclxuXHJcbiAgICAgICAgJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zYXZlZExpbWl0cyA9IEpTT04uc3RyaW5naWZ5KHtkaWV0OiBkaWV0LCBwaGFzZUlkOiBwaGFzZX0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlc2V0Q2hvb3NlKCkge1xyXG4gICAgICAgIGlmICghbGltaXRzU2VydmljZS5saW1pdHNEYXRhLmxpbWl0cykge1xyXG4gICAgICAgICAgICBkaWV0cy5jYXJib2h5ZHJhdGVzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRpZXRzLnByb3RlaW5zID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNsYXNzTmFtZS5uYW1lID0gJ3N0YXJ0JztcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Cf0L7QtNGC0LLQtdGA0LbQtNC10L3QuNC1JywgbWVzc2FnZTogJ9CS0Ysg0YLQvtGH0L3QviDRhdC+0YLQuNGC0LUg0YHQsdGA0L7RgdC40YLRjCDRg9GB0YLQsNC90L7QstC70LXQvdC90YvQtSDQu9C40LzQuNGC0Ys/J30sICdjb25maXJtJylcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZGlldHMuY2FyYm9oeWRyYXRlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZGlldHMucHJvdGVpbnMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZS5uYW1lID0gJ3N0YXJ0JztcclxuXHJcbiAgICAgICAgICAgICAgICAkd2luZG93LnNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ3NhdmVkTGltaXRzJyk7XHJcbiAgICAgICAgICAgICAgICBsaW1pdHNTZXJ2aWNlLmNsZWFyTGltaXRzKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlZExpbWl0cykge1xyXG4gICAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlZExpbWl0cyk7XHJcbiAgICAgICAgc2V0RGlldChkYXRhLmRpZXQpO1xyXG4gICAgICAgIHNldENsYXNzTmFtZShkYXRhLnBoYXNlSWQpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBkaWV0czogZGlldHMsXHJcbiAgICAgICAgY2xhc3NOYW1lOiBjbGFzc05hbWUsXHJcbiAgICAgICAgc2V0RGlldDogc2V0RGlldCxcclxuICAgICAgICBzZXRDbGFzc05hbWU6IHNldENsYXNzTmFtZSxcclxuICAgICAgICBzZXRMaW1pdHM6IHNldExpbWl0cyxcclxuICAgICAgICByZXNldENob29zZTogcmVzZXRDaG9vc2VcclxuICAgIH1cclxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvc2VydmljZXMvZGlldC1jaG9vc2Utc2VydmljZS5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwibW9kYWwtYmFja2dyb3VuZFxcXCIgbmctaWY9XFxcIiRjdHJsLmNoZWNrT3BlbigpXFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwid2luZG93IGFuXFxcIiBuZy1pZj1cXFwiJGN0cmwuY2hlY2tPcGVuKClcXFwiPlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwidGl0bGVcXFwiPnt7ICRjdHJsLm1vZGFsVmlld0RhdGEuZGF0YS50aXRsZSB9fTwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwibWVzc2FnZVxcXCI+e3sgJGN0cmwubW9kYWxWaWV3RGF0YS5kYXRhLm1lc3NhZ2UgfX08L2Rpdj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImJ1dHRvbnMgZ3JvdXBcXFwiPlxcclxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNvbmZpcm1cXFwiIG5nLWlmPVxcXCIkY3RybC5jaGVja1R5cGUoJ2NvbmZpcm0nKVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInJlamVjdFxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmNsb3NlKClcXFwiPtCe0YLQvNC10L3QsDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJva1xcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmNsb3NlKHRydWUpXFxcIj5PSzwvZGl2PlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImFsZXJ0XFxcIiBuZy1pZj1cXFwiJGN0cmwuY2hlY2tUeXBlKCdhbGVydCcpXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuY2xvc2UoKVxcXCI+0JfQsNC60YDRi9GC0Yw8L2Rpdj5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiY2xvc2VcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5jbG9zZSgpXFxcIj54PC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcbjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJtb2RhbC10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC9tYWluLW1vZHVsZS9tb2RhbC13aW5kb3ctY29tcG9uZW50L3RlbXBsYXRlL21vZGFsLXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAxMDBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHEpIHtcclxuICAgIGxldCBzdGF0ZSA9ICdjbG9zZScsXHJcbiAgICAgICAgdHlwZSA9IG51bGwsXHJcbiAgICAgICAgZGVmZXI7XHJcblxyXG4gICAgbGV0IG1vZGFsVmlld0RhdGEgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRTdGF0ZSgpIHtcclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gdHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBvcGVuKGRhdGEsIG1vZGFsX3R5cGUpIHtcclxuICAgICAgICBtb2RhbFZpZXdEYXRhLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIHR5cGUgPSBtb2RhbF90eXBlO1xyXG4gICAgICAgIHN0YXRlID0gJ29wZW4nO1xyXG4gICAgICAgIGlmIChtb2RhbF90eXBlID09PSAnY29uZmlybScpIHtcclxuICAgICAgICAgICAgZGVmZXIgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xvc2UoYm9vbCkge1xyXG4gICAgICAgIGlmIChib29sKSB7XHJcbiAgICAgICAgICAgIGRlZmVyLnJlc29sdmUoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjb25maXJtJykge1xyXG4gICAgICAgICAgICBkZWZlci5yZWplY3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhdGUgPSAnY2xvc2UnO1xyXG4gICAgICAgIHR5cGUgPSBudWxsO1xyXG4gICAgICAgIGRlbGV0ZSBtb2RhbFZpZXdEYXRhLmRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBtb2RhbFZpZXdEYXRhOiBtb2RhbFZpZXdEYXRhLFxyXG4gICAgICAgIGdldFN0YXRlOiBnZXRTdGF0ZSxcclxuICAgICAgICBnZXRUeXBlOiBnZXRUeXBlLFxyXG4gICAgICAgIG9wZW46IG9wZW4sXHJcbiAgICAgICAgY2xvc2U6IGNsb3NlXHJcbiAgICB9XHJcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3NlcnZpY2VzL21vZGFsLXNlcnZpY2UuanNcbiAqKi8iXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUN0Q0E7Ozs7OztBQ0FBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVVBOzs7Ozs7Ozs7Ozs7Ozs7QUNWQTtBQUNBOzs7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVhBO0FBYUE7QUFDQTs7QUFkQTtBQWlCQTtBQUNBO0FBQ0E7QUFDQTs7QUFwQkE7QUFDQTtBQXlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUZBO0FBT0E7QUFQQTtBQURBO0FBQ0E7QUFXQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFGQTtBQUFBO0FBREE7QUFDQTtBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFJQTtBQURBO0FBSUE7QUFKQTtBQUpBO0FBREE7QUFDQTtBQWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBREE7QUFDQTtBQVFBO0FBQ0E7QUFDQTtBQURBO0FBREE7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBREE7QUFHQTtBQUNBO0FBREE7QUFIQTtBQUNBO0FBT0E7QUFaQTtBQURBO0FBQ0E7O0FBckVBO0FBdUZBO0FBQ0E7QUFDQTtBQUhBO0FBQ0E7O0FBdkZBO0FBOEZBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQURBO0FBSUE7QUFKQTtBQUNBO0FBTUE7QUFDQTtBQURBO0FBSUE7QUFKQTtBQVJBO0FBQ0E7QUFlQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQU5BO0FBQ0E7QUFRQTs7QUFFQTtBQUVBO0FBREE7QUFIQTtBQUNBO0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUhBO0FBUUE7QUFSQTtBQVVBO0FBWkE7QUFDQTtBQWNBO0FBQ0E7OztBQURBO0FBS0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBREE7QUFLQTtBQUxBO0FBT0E7QUFuQkE7QUFDQTtBQXFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFIQTtBQUNBO0FBT0E7QUFDQTtBQUNBOztBQUVBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFEQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUZBO0FBU0E7QUFDQTtBQUNBO0FBREE7QUFGQTtBQU9BO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQVRBO0FBQ0E7QUFhQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBM0JBO0FBbEJBO0FBQ0E7QUFvREE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUNBOztBQUZBOztBQUFBO0FBQ0E7QUFTQTtBQVZBO0FBREE7QUFDQTtBQWNBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFLQTtBQUNBO0FBREE7QUFDQTtBQUlBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQURBO0FBQ0E7QUFLQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFJQTtBQUpBO0FBRkE7QUFDQTtBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUxBO0FBT0E7QUFSQTtBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUZBO0FBTkE7QUFGQTtBQWdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFGQTtBQU5BO0FBY0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQWZBO0FBc0JBO0FBQ0E7OztBQUdBO0FBSEE7QUFNQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBVkE7QUFEQTs7OztBQWtCQTtBQUNBO0FBREE7QUFsQkE7QUFEQTs7O0FBMEJBO0FBSEE7QUF6RUE7QUFDQTtBQStFQTtBQUNBOztBQUVBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFOQTtBQURBO0FBQ0E7QUFZQTs7QUFFQTtBQUNBO0FBREE7QUFDQTs7QUFIQTtBQVFBO0FBREE7QUFHQTtBQUNBO0FBREE7QUFJQTtBQUNBO0FBREE7QUFKQTtBQVZBO0FBQ0E7QUFtQkE7QUFDQTtBQUNBO0FBREE7QUFEQTtBQUNBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQWJBO0FBQ0E7QUFpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQU5BO0FBQ0E7QUFlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFIQTtBQUNBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUNBO0FBS0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQURBO0FBUkE7QUFZQTtBQW5CQTtBQUNBO0FBcUJBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQURBO0FBTUE7QUFWQTtBQUNBO0FBWUE7O0FBRUE7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFIQTtBQUtBO0FBQ0E7QUFSQTtBQURBO0FBYUE7QUFEQTtBQUdBO0FBSEE7QUFqQkE7QUFDQTtBQXVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBcEJBO0FBSEE7QUFnQ0E7QUFoQ0E7QUFDQTtBQWtDQTtBQUdBO0FBSEE7QUFLQTtBQURBO0FBR0E7QUFIQTtBQTFDQTtBQUNBO0FBZ0RBO0FBQ0E7QUFDQTtBQURBO0FBSUE7QUFEQTtBQUlBO0FBSkE7QUFKQTtBQUNBO0FBV0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBSkE7QUFDQTtBQVVBO0FBQ0E7QUFHQTtBQUhBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBREE7QUFGQTtBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQURBO0FBREE7QUFwQkE7QUFEQTtBQUNBO0FBNEJBO0FBQ0E7QUFDQTtBQURBO0FBREE7QUFDQTtBQUtBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFEQTtBQUlBO0FBSkE7QUFNQTtBQUNBO0FBZEE7QUFDQTtBQWdCQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBS0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBREE7QUFHQTtBQWJBO0FBQ0E7O0FBaG9CQTtBQWlwQkE7QUFEQTtBQUNBOztBQWpwQkE7QUFzcEJBO0FBREE7QUFDQTs7QUF0cEJBO0FBMnBCQTtBQURBO0FBQ0E7O0FBM3BCQTtBQWdxQkE7QUFEQTtBQUNBOztBQWhxQkE7QUFxcUJBO0FBREE7QUFDQTs7QUFycUJBOztBQTJxQkE7QUFDQTtBQURBO0FBSUE7QUFKQTtBQUZBO0FBQ0E7QUFTQTtBQUNBOztBQXByQkE7QUF1ckJBO0FBQ0E7QUFDQTtBQUNBOztBQTFyQkE7QUFDQTs7QUFEQTtBQWdzQkE7QUFDQTs7QUFqc0JBO0FBQ0E7O0FBREE7QUF1c0JBO0FBQ0E7QUFGQTtBQXRzQkE7QUFDQTtBQTJzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBbkNBO0FBcUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHQTtBQUpBO0FBTUE7QUFUQTtBQTNDQTtBQXR2QkE7Ozs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU1BO0FBQ0E7QUFFQTtBQUNBO0FBSEE7QUFNQTtBQUNBO0FBUEE7QUFVQTtBQUNBO0FBWEE7QUFjQTtBQUNBO0FBZkE7QUFrQkE7QUFDQTtBQW5CQTtBQXNCQTtBQUNBO0FBdkJBO0FBMEJBO0FBQ0E7QUEzQkE7QUFEQTtBQUNBO0FBK0JBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQUNBO0FBTUE7Ozs7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUUE7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUtBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBRkE7QUF0QkE7QUEyQkE7QUE1QkE7QUFDQTtBQThCQTs7Ozs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFYQTtBQWdCQTtBQWpCQTtBQUNBO0FBbUJBOzs7Ozs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHQTtBQUpBO0FBQ0E7QUFNQTs7Ozs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFQQTtBQUNBO0FBU0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFFQTtBQURBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFSQTtBQUNBO0FBZ0JBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEE7QUFDQTtBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFQQTtBQUNBO0FBVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQU1BO0FBQ0E7QUFDQTtBQUZBO0FBTkE7QUFGQTtBQUNBO0FBY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFWQTtBQUNBOzs7QUE1RkE7QUFBQTtBQStHQTtBQWhIQTtBQUNBO0FBa0hBOzs7Ozs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBWkE7QUFpQkE7QUFsQkE7QUFDQTtBQW9CQTs7Ozs7Ozs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBT0E7Ozs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFWQTtBQVlBO0FBYkE7QUFDQTtBQWVBOzs7Ozs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFQQTtBQUNBO0FBU0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFKQTtBQVJBO0FBQ0E7QUFnQkE7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFQQTtBQUNBO0FBU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBBO0FBQ0E7QUFTQTtBQUNBO0FBREE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7QUFNQTtBQUNBO0FBQ0E7QUFGQTtBQU5BO0FBRkE7QUFoRUE7QUErRUE7QUFoRkE7QUFDQTtBQWtGQTs7Ozs7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUxBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTs7QUFIQTtBQU1BO0FBQ0E7O0FBUEE7QUFDQTs7QUFEQTtBQWFBO0FBYkE7QUFDQTtBQWdCQTtBQUNBO0FBQ0E7QUFGQTtBQXZDQTtBQTRDQTtBQXBEQTtBQUNBO0FBc0RBOzs7Ozs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBS0E7QUFWQTtBQUNBO0FBWUE7Ozs7OztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTs7O0FBQ0E7O0FBREE7QUFJQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBRUE7QUFDQTs7QUFGQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWEE7QUFOQTs7QUF1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUE3QkE7QUFIQTtBQUNBO0FBb0NBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFGQTtBQUZBO0FBREE7QUFDQTtBQVVBOzs7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRkE7QUFJQTtBQURBO0FBTEE7QUFTQTtBQUNBO0FBQ0E7QUFFQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBREE7QUFHQTtBQUFBO0FBTEE7QUFPQTtBQVBBO0FBVkE7QUFGQTtBQUNBO0FBeUJBOzs7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFEQTtBQUdBO0FBUEE7QUFGQTtBQTVFQTtBQTBGQTtBQS9GQTtBQUNBO0FBaUdBOzs7Ozs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBTkE7QUFSQTtBQW9CQTtBQXhCQTtBQUNBO0FBMEJBOzs7Ozs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFNQTs7Ozs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQTtBQUVBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFDQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQVJBO0FBZkE7QUEwQkE7QUEzQkE7QUFDQTtBQThCQTs7Ozs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVZBO0FBQ0E7QUFZQTtBQUNBO0FBREE7QUFqQkE7QUFxQkE7QUEzQkE7QUFDQTtBQTZCQTs7Ozs7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBR0E7QUFQQTtBQUNBO0FBU0E7Ozs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQURBO0FBTUE7QUFYQTtBQUNBO0FBYUE7Ozs7OztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7OztBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUZBO0FBWEE7QUFnQkE7QUF0QkE7QUFDQTtBQXdCQTs7Ozs7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTs7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQU1BO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFaQTtBQURBO0FBQ0E7QUFnQkE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSEE7QUFDQTtBQU9BO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFOQTtBQUZBO0FBV0E7QUFDQTtBQWJBO0FBZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBNUJBO0FBQ0E7QUE4QkE7QUFyQ0E7QUFDQTtBQXVDQTtBQTNDQTtBQUZBO0FBQ0E7QUFnREE7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQURBO0FBQ0E7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFSQTtBQXhHQTs7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFEQTtBQUdBO0FBREE7QUFHQTtBQURBO0FBR0E7QUFEQTtBQUVBO0FBRkE7QUFUQTtBQUNBO0FBYUE7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBREE7QUFPQTtBQWxCQTtBQUNBO0FBb0JBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUEzQ0E7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFOQTtBQUZBO0FBQ0E7QUFXQTtBQUNBO0FBREE7QUFmQTs7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBRkE7QUFDQTtBQUtBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQWJBOzs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBTkE7QUFRQTtBQUNBO0FBVEE7QUFXQTtBQUNBO0FBWkE7QUFjQTtBQUNBO0FBZkE7QUFpQkE7QUFqQkE7QUFEQTtBQURBOzs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUZBO0FBWEE7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBQ0E7QUFSQTtBQUNBO0FBVUE7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUxBO0FBQ0E7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFKQTtBQU1BO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTkE7QUFSQTtBQUNBO0FBaUJBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTkE7QUF4REE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUpBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFSQTtBQUNBO0FBVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFwQ0E7OzsiLCJzb3VyY2VSb290IjoiIn0=