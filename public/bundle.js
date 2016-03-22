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
/* 25 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"save-menu\">\r\n    <div class=\"title\">Управление данными</div>\r\n\r\n    <div>\r\n        <div class=\"button save-button\" ng-click=\"$ctrl.saveData()\">Сохранить изменения</div>\r\n        <div class=\"button remove-data\" ng-click=\"$ctrl.removeData()\">Удалить сохранения</div>\r\n    </div>\r\n\r\n    <div class=\"title\">Для печати</div>\r\n\r\n    <div class=\"print-menu\">\r\n        <div class=\"button to-print\" ng-click=\"$ctrl.preview()\">Предпросмотр</div>\r\n        <div class=\"button print-to-localStorage\" ng-click=\"$ctrl.saveForPrint()\">Сохранить для печати</div>\r\n        <div class=\"button remove-print-localStorage\" ng-click=\"$ctrl.removePrintSaves()\">Удалить сохранения</div>\r\n    </div>\r\n</div>\r\n\r\n\r\n<div class=\"br\"></div>";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIDg5ODAyYWM4OGI5YzMwMGI5MDgyIiwid2VicGFjazovLy9qcy9kaWFyeUFwcC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL2luZGV4LmpzIiwid2VicGFjazovLy9ub2RlX21vZHVsZXMvYW5ndWNvbXBsZXRlLWFsdC9hbmd1Y29tcGxldGUtYWx0LmpzIiwid2VicGFjazovLy9qcy9hcHAvbWFpbi1tb2R1bGUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9tYWluLW1vZHVsZS9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQvbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9tYWluLW1vZHVsZS9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQvdGVtcGxhdGUvbGVmdC1zaWRlLW1lbnUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL21haW4tbW9kdWxlL2RheXRpbWUtY2hvb3NlLWNvbXBvbmVudC9kYXl0aW1lLWNob29zZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL21haW4tbW9kdWxlL2RheXRpbWUtY2hvb3NlLWNvbXBvbmVudC90ZW1wbGF0ZS9kYXl0aW1lLWNob29zZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvbWFpbi1tb2R1bGUvaG9tZS1wYWdlLW1vZHVsZS9ob21lLXBhZ2UtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9tYWluLW1vZHVsZS9ob21lLXBhZ2UtbW9kdWxlL3RlbXBsYXRlL2hvbWUtcGFnZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvbWFpbi1tb2R1bGUvdmlldy1jb21wb25lbnQvdmlldy1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL21haW4tbW9kdWxlL3ZpZXctY29tcG9uZW50L3RlbXBsYXRlL3ZpZXctdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL21haW4tbW9kdWxlL21vZGFsLXdpbmRvdy1jb21wb25lbnQvbW9kYWwtd2luZG93LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9tZW51L21lbnUtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9kaWFyeS1tb2R1bGUvbWVudS90ZW1wbGF0ZS9tZW51LXRlbXBsYXRlLmh0bWwiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9kaWFyeS1tb2R1bGUvbWFpbi12aWV3L21haW4tdmlldy1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9tYWluLXZpZXcvdGVtcGxhdGUvbWFpbi12aWV3Lmh0bWwiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9kaWFyeS1tb2R1bGUvZGF5LXRpbWUvZGF5LXRpbWUtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9kaWFyeS1tb2R1bGUvZGF5LXRpbWUvdGVtcGxhdGUvZGF5LXRpbWUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9mb29kL2Zvb2QtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9kaWFyeS1tb2R1bGUvZm9vZC90ZW1wbGF0ZS9mb29kLXRlbXBsYXRlLmh0bWwiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9kaWFyeS1tb2R1bGUvc2F2ZS1tZW51L3NhdmUtbWVudS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9zYXZlLW1lbnUvdGVtcGxhdGUvc2F2ZS1tZW51LXRlbXBsYXRlLmh0bWwiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9kaWFyeS1tb2R1bGUvcmVzdWx0LWNvbXBvbmVudC9yZXN1bHQtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9kaWFyeS1tb2R1bGUvcmVzdWx0LWNvbXBvbmVudC90ZW1wbGF0ZS9yZXN1bHQtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS12aWV3LWNvbXBvbmVudC90YWJsZS12aWV3LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLXZpZXctY29tcG9uZW50L3RlbXBsYXRlL3RhYmxlLXZpZXctdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L2FkZC10by10YWJsZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLWNvbXBvbmVudC90YWJsZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS1jb21wb25lbnQvdGVtcGxhdGUvdGFibGUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9zdG9yYWdlLXRhYmxlLWNvbXBvbmVudC9zdG9yYWdlLXRhYmxlLWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvdGFibGUtbW9kdWxlL3N0b3JhZ2UtdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL3N0b3JhZ2UtdGFibGUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9zaW5nbGUtcGFnZS10YWJsZXMtY29tcG9uZW50L3NpbmdsZS1wYWdlLXRhYmxlcy1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL3RhYmxlLW1vZHVsZS9zaW5nbGUtcGFnZS10YWJsZXMtY29tcG9uZW50L3RlbXBsYXRlL3NpbmdsZS1wYWdlLXRhYmxlcy10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvc2VydmljZXMvbGltaXRzLWZpbHRlci5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2RhdGEtc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL3ZhbGlkYXRpb24tc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2NhbGN1bGF0aW9uLXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9zZXJ2aWNlcy9saW1pdHMtc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2luZGV4LXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9zZXJ2aWNlcy9hY3RpdmUtY2xhc3Mtc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2RpZXQtY2hvb3NlLXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL21haW4tbW9kdWxlL21vZGFsLXdpbmRvdy1jb21wb25lbnQvdGVtcGxhdGUvbW9kYWwtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL21vZGFsLXNlcnZpY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCA4OTgwMmFjODhiOWMzMDBiOTA4MlxuICoqLyIsInJlcXVpcmUoJy4vYXBwJyk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvZGlhcnlBcHAuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcbmNvbnN0IGF1dG9jb21wbGl0ZSA9IHJlcXVpcmUoJ2FuZ3Vjb21wbGV0ZS1hbHQnKTtcclxuY29uc3QgbWFpbk1vZHVsZSA9IHJlcXVpcmUoJy4vbWFpbi1tb2R1bGUnKTtcclxuY29uc3QgZGlhcnlNb2R1bGUgPSByZXF1aXJlKCcuL2RpYXJ5LW1vZHVsZScpO1xyXG5jb25zdCB0YWJsZU1vZHVsZSA9IHJlcXVpcmUoJy4vdGFibGUtbW9kdWxlJyk7XHJcblxyXG5jb25zdCBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWydtYWluJywgJ2RpYXJ5JywgJ3RhYmxlJywgJ25nQW5pbWF0ZScsICdhbmd1Y29tcGxldGUtYWx0J10pO1xyXG5cclxuYXBwLmZpbHRlcignbGltaXQnLCByZXF1aXJlKCcuL3NlcnZpY2VzL2xpbWl0cy1maWx0ZXInKSk7XHJcbmFwcFxyXG4gICAgLmZhY3RvcnkoJ2RhdGFTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9kYXRhLXNlcnZpY2UnKSlcclxuICAgIC5mYWN0b3J5KCd2YWxpZGF0aW9uU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvdmFsaWRhdGlvbi1zZXJ2aWNlJykpXHJcbiAgICAuZmFjdG9yeSgnY2FsY3VsYXRpb25TZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9jYWxjdWxhdGlvbi1zZXJ2aWNlJykpXHJcbiAgICAuZmFjdG9yeSgnbGltaXRzU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvbGltaXRzLXNlcnZpY2UnKSlcclxuICAgIC5mYWN0b3J5KCdpbmRleFNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL2luZGV4LXNlcnZpY2UnKSlcclxuICAgIC5mYWN0b3J5KCdhY3RpdmVDbGFzc1NlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL2FjdGl2ZS1jbGFzcy1zZXJ2aWNlJykpXHJcbiAgICAuZmFjdG9yeSgnZGlldENob29zZScsIHJlcXVpcmUoJy4vc2VydmljZXMvZGlldC1jaG9vc2Utc2VydmljZScpKVxyXG4gICAgLmZhY3RvcnkoJ21vZGFsJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9tb2RhbC1zZXJ2aWNlJykpO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYXBwO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9pbmRleC5qc1xuICoqLyIsIi8qXG4gKiBhbmd1Y29tcGxldGUtYWx0XG4gKiBBdXRvY29tcGxldGUgZGlyZWN0aXZlIGZvciBBbmd1bGFySlNcbiAqIFRoaXMgaXMgYSBmb3JrIG9mIERhcnlsIFJvd2xhbmQncyBhbmd1Y29tcGxldGUgd2l0aCBzb21lIGV4dHJhIGZlYXR1cmVzLlxuICogQnkgSGlkZW5hcmkgTm96YWtpXG4gKi9cblxuLyohIENvcHlyaWdodCAoYykgMjAxNCBIaWRlbmFyaSBOb3pha2kgYW5kIGNvbnRyaWJ1dG9ycyB8IExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSAqL1xuXG5cbid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FuZ3Vjb21wbGV0ZS1hbHQnLCBbXSkuZGlyZWN0aXZlKCdhbmd1Y29tcGxldGVBbHQnLCBbJyRxJywgJyRwYXJzZScsICckaHR0cCcsICckc2NlJywgJyR0aW1lb3V0JywgJyR0ZW1wbGF0ZUNhY2hlJywgJyRpbnRlcnBvbGF0ZScsIGZ1bmN0aW9uICgkcSwgJHBhcnNlLCAkaHR0cCwgJHNjZSwgJHRpbWVvdXQsICR0ZW1wbGF0ZUNhY2hlLCAkaW50ZXJwb2xhdGUpIHtcbiAgLy8ga2V5Ym9hcmQgZXZlbnRzXG4gIHZhciBLRVlfRFcgPSA0MDtcbiAgdmFyIEtFWV9SVCA9IDM5O1xuICB2YXIgS0VZX1VQID0gMzg7XG4gIHZhciBLRVlfTEYgPSAzNztcbiAgdmFyIEtFWV9FUyA9IDI3O1xuICB2YXIgS0VZX0VOID0gMTM7XG4gIHZhciBLRVlfVEFCID0gOTtcblxuICB2YXIgTUlOX0xFTkdUSCA9IDM7XG4gIHZhciBNQVhfTEVOR1RIID0gNTI0Mjg4OyAgLy8gdGhlIGRlZmF1bHQgbWF4IGxlbmd0aCBwZXIgdGhlIGh0bWwgbWF4bGVuZ3RoIGF0dHJpYnV0ZVxuICB2YXIgUEFVU0UgPSA1MDA7XG4gIHZhciBCTFVSX1RJTUVPVVQgPSAyMDA7XG5cbiAgLy8gc3RyaW5nIGNvbnN0YW50c1xuICB2YXIgUkVRVUlSRURfQ0xBU1MgPSAnYXV0b2NvbXBsZXRlLXJlcXVpcmVkJztcbiAgdmFyIFRFWFRfU0VBUkNISU5HID0gJ9Cf0L7QuNGB0LouLi4nO1xuICB2YXIgVEVYVF9OT1JFU1VMVFMgPSAn0J3QtdGCINGB0L7QstC/0LDQtNC10L3QuNC5JztcbiAgdmFyIFRFTVBMQVRFX1VSTCA9ICcvYW5ndWNvbXBsZXRlLWFsdC9pbmRleC5odG1sJztcblxuICAvLyBTZXQgdGhlIGRlZmF1bHQgdGVtcGxhdGUgZm9yIHRoaXMgZGlyZWN0aXZlXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChURU1QTEFURV9VUkwsXG4gICAgJzxkaXYgY2xhc3M9XCJhbmd1Y29tcGxldGUtaG9sZGVyXCIgbmctY2xhc3M9XCJ7XFwnYW5ndWNvbXBsZXRlLWRyb3Bkb3duLXZpc2libGVcXCc6IHNob3dEcm9wZG93bn1cIj4nICtcbiAgICAnICA8aW5wdXQgaWQ9XCJ7e2lkfX1fdmFsdWVcIiBuYW1lPVwie3tpbnB1dE5hbWV9fVwiIHRhYmluZGV4PVwie3tmaWVsZFRhYmluZGV4fX1cIiBuZy1jbGFzcz1cIntcXCdhbmd1Y29tcGxldGUtaW5wdXQtbm90LWVtcHR5XFwnOiBub3RFbXB0eX1cIiBuZy1tb2RlbD1cInNlYXJjaFN0clwiIG5nLWRpc2FibGVkPVwiZGlzYWJsZUlucHV0XCIgdHlwZT1cInt7aW5wdXRUeXBlfX1cIiBwbGFjZWhvbGRlcj1cInt7cGxhY2Vob2xkZXJ9fVwiIG1heGxlbmd0aD1cInt7bWF4bGVuZ3RofX1cIiBuZy1mb2N1cz1cIm9uRm9jdXNIYW5kbGVyKClcIiBjbGFzcz1cInt7aW5wdXRDbGFzc319XCIgbmctZm9jdXM9XCJyZXNldEhpZGVSZXN1bHRzKClcIiBuZy1ibHVyPVwiaGlkZVJlc3VsdHMoJGV2ZW50KVwiIGF1dG9jYXBpdGFsaXplPVwib2ZmXCIgYXV0b2NvcnJlY3Q9XCJvZmZcIiBhdXRvY29tcGxldGU9XCJvZmZcIiBuZy1jaGFuZ2U9XCJpbnB1dENoYW5nZUhhbmRsZXIoc2VhcmNoU3RyKVwiLz4nICtcbiAgICAnICA8ZGl2IGlkPVwie3tpZH19X2Ryb3Bkb3duXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtZHJvcGRvd25cIiBuZy1zaG93PVwic2hvd0Ryb3Bkb3duXCI+JyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYW5ndWNvbXBsZXRlLXNlYXJjaGluZ1wiIG5nLXNob3c9XCJzZWFyY2hpbmdcIiBuZy1iaW5kPVwidGV4dFNlYXJjaGluZ1wiPjwvZGl2PicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1zZWFyY2hpbmdcIiBuZy1zaG93PVwiIXNlYXJjaGluZyAmJiAoIXJlc3VsdHMgfHwgcmVzdWx0cy5sZW5ndGggPT0gMClcIiBuZy1iaW5kPVwidGV4dE5vUmVzdWx0c1wiPjwvZGl2PicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1yb3dcIiBuZy1yZXBlYXQ9XCJyZXN1bHQgaW4gcmVzdWx0c1wiIG5nLWNsaWNrPVwic2VsZWN0UmVzdWx0KHJlc3VsdClcIiBuZy1tb3VzZWVudGVyPVwiaG92ZXJSb3coJGluZGV4KVwiIG5nLWNsYXNzPVwie1xcJ2FuZ3Vjb21wbGV0ZS1zZWxlY3RlZC1yb3dcXCc6ICRpbmRleCA9PSBjdXJyZW50SW5kZXh9XCI+JyArXG4gICAgJyAgICAgIDxkaXYgbmctaWY9XCJpbWFnZUZpZWxkXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtaW1hZ2UtaG9sZGVyXCI+JyArXG4gICAgJyAgICAgICAgPGltZyBuZy1pZj1cInJlc3VsdC5pbWFnZSAmJiByZXN1bHQuaW1hZ2UgIT0gXFwnXFwnXCIgbmctc3JjPVwie3tyZXN1bHQuaW1hZ2V9fVwiIGNsYXNzPVwiYW5ndWNvbXBsZXRlLWltYWdlXCIvPicgK1xuICAgICcgICAgICAgIDxkaXYgbmctaWY9XCIhcmVzdWx0LmltYWdlICYmIHJlc3VsdC5pbWFnZSAhPSBcXCdcXCdcIiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1pbWFnZS1kZWZhdWx0XCI+PC9kaXY+JyArXG4gICAgJyAgICAgIDwvZGl2PicgK1xuICAgICcgICAgICA8ZGl2IGNsYXNzPVwiYW5ndWNvbXBsZXRlLXRpdGxlXCIgbmctaWY9XCJtYXRjaENsYXNzXCIgbmctYmluZC1odG1sPVwicmVzdWx0LnRpdGxlXCI+PC9kaXY+JyArXG4gICAgJyAgICAgIDxkaXYgY2xhc3M9XCJhbmd1Y29tcGxldGUtdGl0bGVcIiBuZy1pZj1cIiFtYXRjaENsYXNzXCI+e3sgcmVzdWx0LnRpdGxlIH19PC9kaXY+JyArXG4gICAgJyAgICAgIDxkaXYgbmctaWY9XCJtYXRjaENsYXNzICYmIHJlc3VsdC5kZXNjcmlwdGlvbiAmJiByZXN1bHQuZGVzY3JpcHRpb24gIT0gXFwnXFwnXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtZGVzY3JpcHRpb25cIiBuZy1iaW5kLWh0bWw9XCJyZXN1bHQuZGVzY3JpcHRpb25cIj48L2Rpdj4nICtcbiAgICAnICAgICAgPGRpdiBuZy1pZj1cIiFtYXRjaENsYXNzICYmIHJlc3VsdC5kZXNjcmlwdGlvbiAmJiByZXN1bHQuZGVzY3JpcHRpb24gIT0gXFwnXFwnXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtZGVzY3JpcHRpb25cIj57e3Jlc3VsdC5kZXNjcmlwdGlvbn19PC9kaXY+JyArXG4gICAgJyAgICA8L2Rpdj4nICtcbiAgICAnICA8L2Rpdj4nICtcbiAgICAnPC9kaXY+J1xuICApO1xuXG4gIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW0sIGF0dHJzLCBjdHJsKSB7XG4gICAgdmFyIGlucHV0RmllbGQgPSBlbGVtLmZpbmQoJ2lucHV0Jyk7XG4gICAgdmFyIG1pbmxlbmd0aCA9IE1JTl9MRU5HVEg7XG4gICAgdmFyIHNlYXJjaFRpbWVyID0gbnVsbDtcbiAgICB2YXIgaGlkZVRpbWVyO1xuICAgIHZhciByZXF1aXJlZENsYXNzTmFtZSA9IFJFUVVJUkVEX0NMQVNTO1xuICAgIHZhciByZXNwb25zZUZvcm1hdHRlcjtcbiAgICB2YXIgdmFsaWRTdGF0ZSA9IG51bGw7XG4gICAgdmFyIGh0dHBDYW5jZWxsZXIgPSBudWxsO1xuICAgIHZhciBkZCA9IGVsZW1bMF0ucXVlcnlTZWxlY3RvcignLmFuZ3Vjb21wbGV0ZS1kcm9wZG93bicpO1xuICAgIHZhciBpc1Njcm9sbE9uID0gZmFsc2U7XG4gICAgdmFyIG1vdXNlZG93bk9uID0gbnVsbDtcbiAgICB2YXIgdW5iaW5kSW5pdGlhbFZhbHVlO1xuICAgIHZhciBkaXNwbGF5U2VhcmNoaW5nO1xuICAgIHZhciBkaXNwbGF5Tm9SZXN1bHRzO1xuXG4gICAgZWxlbS5vbignbW91c2Vkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0LmlkKSB7XG4gICAgICAgIG1vdXNlZG93bk9uID0gZXZlbnQudGFyZ2V0LmlkO1xuICAgICAgICBpZiAobW91c2Vkb3duT24gPT09IHNjb3BlLmlkICsgJ19kcm9wZG93bicpIHtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xpY2tvdXRIYW5kbGVyRm9yRHJvcGRvd24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgbW91c2Vkb3duT24gPSBldmVudC50YXJnZXQuY2xhc3NOYW1lO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2NvcGUuY3VycmVudEluZGV4ID0gc2NvcGUuZm9jdXNGaXJzdCA/IDAgOiBudWxsO1xuICAgIHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xuICAgIHVuYmluZEluaXRpYWxWYWx1ZSA9IHNjb3BlLiR3YXRjaCgnaW5pdGlhbFZhbHVlJywgZnVuY3Rpb24gKG5ld3ZhbCkge1xuICAgICAgaWYgKG5ld3ZhbCkge1xuICAgICAgICAvLyByZW1vdmUgc2NvcGUgbGlzdGVuZXJcbiAgICAgICAgdW5iaW5kSW5pdGlhbFZhbHVlKCk7XG4gICAgICAgIC8vIGNoYW5nZSBpbnB1dFxuICAgICAgICBoYW5kbGVJbnB1dENoYW5nZShuZXd2YWwsIHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2NvcGUuJHdhdGNoKCdmaWVsZFJlcXVpcmVkJywgZnVuY3Rpb24gKG5ld3ZhbCwgb2xkdmFsKSB7XG4gICAgICBpZiAobmV3dmFsICE9PSBvbGR2YWwpIHtcbiAgICAgICAgaWYgKCFuZXd2YWwpIHtcbiAgICAgICAgICBjdHJsW3Njb3BlLmlucHV0TmFtZV0uJHNldFZhbGlkaXR5KHJlcXVpcmVkQ2xhc3NOYW1lLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghdmFsaWRTdGF0ZSB8fCBzY29wZS5jdXJyZW50SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgaGFuZGxlUmVxdWlyZWQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGhhbmRsZVJlcXVpcmVkKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzY29wZS4kb24oJ2FuZ3Vjb21wbGV0ZS1hbHQ6Y2xlYXJJbnB1dCcsIGZ1bmN0aW9uIChldmVudCwgZWxlbWVudElkKSB7XG4gICAgICBpZiAoIWVsZW1lbnRJZCB8fCBlbGVtZW50SWQgPT09IHNjb3BlLmlkKSB7XG4gICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IG51bGw7XG4gICAgICAgIGNhbGxPckFzc2lnbigpO1xuICAgICAgICBoYW5kbGVSZXF1aXJlZChmYWxzZSk7XG4gICAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2NvcGUuJG9uKCdhbmd1Y29tcGxldGUtYWx0OmNoYW5nZUlucHV0JywgZnVuY3Rpb24gKGV2ZW50LCBlbGVtZW50SWQsIG5ld3ZhbCkge1xuICAgICAgaWYgKCEhZWxlbWVudElkICYmIGVsZW1lbnRJZCA9PT0gc2NvcGUuaWQpIHtcbiAgICAgICAgaGFuZGxlSW5wdXRDaGFuZ2UobmV3dmFsKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZUlucHV0Q2hhbmdlKG5ld3ZhbCwgaW5pdGlhbCkge1xuICAgICAgaWYgKG5ld3ZhbCkge1xuICAgICAgICBpZiAodHlwZW9mIG5ld3ZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBzY29wZS5zZWFyY2hTdHIgPSBleHRyYWN0VGl0bGUobmV3dmFsKTtcbiAgICAgICAgICBjYWxsT3JBc3NpZ24oe29yaWdpbmFsT2JqZWN0OiBuZXd2YWx9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbmV3dmFsID09PSAnc3RyaW5nJyAmJiBuZXd2YWwubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IG5ld3ZhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY29uc29sZSAmJiBjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdUcmllZCB0byBzZXQgJyArICghIWluaXRpYWwgPyAnaW5pdGlhbCcgOiAnJykgKyAnIHZhbHVlIG9mIGFuZ3Vjb21wbGV0ZSB0bycsIG5ld3ZhbCwgJ3doaWNoIGlzIGFuIGludmFsaWQgdmFsdWUnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBoYW5kbGVSZXF1aXJlZCh0cnVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAjMTk0IGRyb3Bkb3duIGxpc3Qgbm90IGNvbnNpc3RlbnQgaW4gY29sbGFwc2luZyAoYnVnKS5cbiAgICBmdW5jdGlvbiBjbGlja291dEhhbmRsZXJGb3JEcm9wZG93bihldmVudCkge1xuICAgICAgbW91c2Vkb3duT24gPSBudWxsO1xuICAgICAgc2NvcGUuaGlkZVJlc3VsdHMoZXZlbnQpO1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrb3V0SGFuZGxlckZvckRyb3Bkb3duKTtcbiAgICB9XG5cbiAgICAvLyBmb3IgSUU4IHF1aXJraW5lc3MgYWJvdXQgZXZlbnQud2hpY2hcbiAgICBmdW5jdGlvbiBpZThFdmVudE5vcm1hbGl6ZXIoZXZlbnQpIHtcbiAgICAgIHJldHVybiBldmVudC53aGljaCA/IGV2ZW50LndoaWNoIDogZXZlbnQua2V5Q29kZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxsT3JBc3NpZ24odmFsdWUpIHtcbiAgICAgIGlmICh0eXBlb2Ygc2NvcGUuc2VsZWN0ZWRPYmplY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc2NvcGUuc2VsZWN0ZWRPYmplY3QodmFsdWUpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNjb3BlLnNlbGVjdGVkT2JqZWN0ID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBoYW5kbGVSZXF1aXJlZCh0cnVlKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBoYW5kbGVSZXF1aXJlZChmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsbEZ1bmN0aW9uT3JJZGVudGl0eShmbikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBzY29wZVtmbl0gPyBzY29wZVtmbl0oZGF0YSkgOiBkYXRhO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRJbnB1dFN0cmluZyhzdHIpIHtcbiAgICAgIGNhbGxPckFzc2lnbih7b3JpZ2luYWxPYmplY3Q6IHN0cn0pO1xuXG4gICAgICBpZiAoc2NvcGUuY2xlYXJTZWxlY3RlZCkge1xuICAgICAgICBzY29wZS5zZWFyY2hTdHIgPSBudWxsO1xuICAgICAgfVxuICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXh0cmFjdFRpdGxlKGRhdGEpIHtcbiAgICAgIC8vIHNwbGl0IHRpdGxlIGZpZWxkcyBhbmQgcnVuIGV4dHJhY3RWYWx1ZSBmb3IgZWFjaCBhbmQgam9pbiB3aXRoICcgJ1xuICAgICAgcmV0dXJuIHNjb3BlLnRpdGxlRmllbGQuc3BsaXQoJywnKVxuICAgICAgICAubWFwKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICAgIHJldHVybiBleHRyYWN0VmFsdWUoZGF0YSwgZmllbGQpO1xuICAgICAgICB9KVxuICAgICAgICAuam9pbignICcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4dHJhY3RWYWx1ZShvYmosIGtleSkge1xuICAgICAgdmFyIGtleXMsIHJlc3VsdDtcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAga2V5cyA9IGtleS5zcGxpdCgnLicpO1xuICAgICAgICByZXN1bHQgPSBvYmo7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdFtrZXlzW2ldXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IG9iajtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmluZE1hdGNoU3RyaW5nKHRhcmdldCwgc3RyKSB7XG4gICAgICB2YXIgcmVzdWx0LCBtYXRjaGVzLCByZTtcbiAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvR3VpZGUvUmVndWxhcl9FeHByZXNzaW9uc1xuICAgICAgLy8gRXNjYXBlIHVzZXIgaW5wdXQgdG8gYmUgdHJlYXRlZCBhcyBhIGxpdGVyYWwgc3RyaW5nIHdpdGhpbiBhIHJlZ3VsYXIgZXhwcmVzc2lvblxuICAgICAgcmUgPSBuZXcgUmVnRXhwKHN0ci5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpLCAnaScpO1xuICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCF0YXJnZXQubWF0Y2ggfHwgIXRhcmdldC5yZXBsYWNlKSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldC50b1N0cmluZygpO1xuICAgICAgfVxuICAgICAgbWF0Y2hlcyA9IHRhcmdldC5tYXRjaChyZSk7XG4gICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICByZXN1bHQgPSB0YXJnZXQucmVwbGFjZShyZSxcbiAgICAgICAgICAnPHNwYW4gY2xhc3M9XCInICsgc2NvcGUubWF0Y2hDbGFzcyArICdcIj4nICsgbWF0Y2hlc1swXSArICc8L3NwYW4+Jyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gdGFyZ2V0O1xuICAgICAgfVxuICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwocmVzdWx0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVSZXF1aXJlZCh2YWxpZCkge1xuICAgICAgc2NvcGUubm90RW1wdHkgPSB2YWxpZDtcbiAgICAgIHZhbGlkU3RhdGUgPSBzY29wZS5zZWFyY2hTdHI7XG4gICAgICBpZiAoc2NvcGUuZmllbGRSZXF1aXJlZCAmJiBjdHJsICYmIHNjb3BlLmlucHV0TmFtZSkge1xuICAgICAgICBjdHJsW3Njb3BlLmlucHV0TmFtZV0uJHNldFZhbGlkaXR5KHJlcXVpcmVkQ2xhc3NOYW1lLCB2YWxpZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2V5dXBIYW5kbGVyKGV2ZW50KSB7XG4gICAgICB2YXIgd2hpY2ggPSBpZThFdmVudE5vcm1hbGl6ZXIoZXZlbnQpO1xuICAgICAgaWYgKHdoaWNoID09PSBLRVlfTEYgfHwgd2hpY2ggPT09IEtFWV9SVCkge1xuICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHdoaWNoID09PSBLRVlfVVAgfHwgd2hpY2ggPT09IEtFWV9FTikge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAod2hpY2ggPT09IEtFWV9EVykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoIXNjb3BlLnNob3dEcm9wZG93biAmJiBzY29wZS5zZWFyY2hTdHIgJiYgc2NvcGUuc2VhcmNoU3RyLmxlbmd0aCA+PSBtaW5sZW5ndGgpIHtcbiAgICAgICAgICBpbml0UmVzdWx0cygpO1xuICAgICAgICAgIHNjb3BlLnNlYXJjaGluZyA9IHRydWU7XG4gICAgICAgICAgc2VhcmNoVGltZXJDb21wbGV0ZShzY29wZS5zZWFyY2hTdHIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmICh3aGljaCA9PT0gS0VZX0VTKSB7XG4gICAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlucHV0RmllbGQudmFsKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChtaW5sZW5ndGggPT09IDAgJiYgIXNjb3BlLnNlYXJjaFN0cikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc2NvcGUuc2VhcmNoU3RyIHx8IHNjb3BlLnNlYXJjaFN0ciA9PT0gJycpIHtcbiAgICAgICAgICBzY29wZS5zaG93RHJvcGRvd24gPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChzY29wZS5zZWFyY2hTdHIubGVuZ3RoID49IG1pbmxlbmd0aCkge1xuICAgICAgICAgIGluaXRSZXN1bHRzKCk7XG5cbiAgICAgICAgICBpZiAoc2VhcmNoVGltZXIpIHtcbiAgICAgICAgICAgICR0aW1lb3V0LmNhbmNlbChzZWFyY2hUaW1lcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2NvcGUuc2VhcmNoaW5nID0gdHJ1ZTtcblxuICAgICAgICAgIHNlYXJjaFRpbWVyID0gJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VhcmNoVGltZXJDb21wbGV0ZShzY29wZS5zZWFyY2hTdHIpO1xuICAgICAgICAgIH0sIHNjb3BlLnBhdXNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWxpZFN0YXRlICYmIHZhbGlkU3RhdGUgIT09IHNjb3BlLnNlYXJjaFN0ciAmJiAhc2NvcGUuY2xlYXJTZWxlY3RlZCkge1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsT3JBc3NpZ24oKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZU92ZXJyaWRlU3VnZ2VzdGlvbnMoZXZlbnQpIHtcbiAgICAgIGlmIChzY29wZS5vdmVycmlkZVN1Z2dlc3Rpb25zICYmICEoc2NvcGUuc2VsZWN0ZWRPYmplY3QgJiYgc2NvcGUuc2VsZWN0ZWRPYmplY3Qub3JpZ2luYWxPYmplY3QgPT09IHNjb3BlLnNlYXJjaFN0cikpIHtcbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhbmNlbCBzZWFyY2ggdGltZXJcbiAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHNlYXJjaFRpbWVyKTtcbiAgICAgICAgLy8gY2FuY2VsIGh0dHAgcmVxdWVzdFxuICAgICAgICBjYW5jZWxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgIHNldElucHV0U3RyaW5nKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJvcGRvd25Sb3dPZmZzZXRIZWlnaHQocm93KSB7XG4gICAgICB2YXIgY3NzID0gZ2V0Q29tcHV0ZWRTdHlsZShyb3cpO1xuICAgICAgcmV0dXJuIHJvdy5vZmZzZXRIZWlnaHQgK1xuICAgICAgICBwYXJzZUludChjc3MubWFyZ2luVG9wLCAxMCkgKyBwYXJzZUludChjc3MubWFyZ2luQm90dG9tLCAxMCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJvcGRvd25IZWlnaHQoKSB7XG4gICAgICByZXR1cm4gZGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICtcbiAgICAgICAgcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShkZCkubWF4SGVpZ2h0LCAxMCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJvcGRvd25Sb3coKSB7XG4gICAgICByZXR1cm4gZWxlbVswXS5xdWVyeVNlbGVjdG9yQWxsKCcuYW5ndWNvbXBsZXRlLXJvdycpW3Njb3BlLmN1cnJlbnRJbmRleF07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJvcGRvd25Sb3dUb3AoKSB7XG4gICAgICByZXR1cm4gZHJvcGRvd25Sb3coKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgLVxuICAgICAgICAoZGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICtcbiAgICAgICAgcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShkZCkucGFkZGluZ1RvcCwgMTApKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcm9wZG93blNjcm9sbFRvcFRvKG9mZnNldCkge1xuICAgICAgZGQuc2Nyb2xsVG9wID0gZGQuc2Nyb2xsVG9wICsgb2Zmc2V0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUlucHV0RmllbGQoKSB7XG4gICAgICB2YXIgY3VycmVudCA9IHNjb3BlLnJlc3VsdHNbc2NvcGUuY3VycmVudEluZGV4XTtcbiAgICAgIGlmIChzY29wZS5tYXRjaENsYXNzKSB7XG4gICAgICAgIGlucHV0RmllbGQudmFsKGV4dHJhY3RUaXRsZShjdXJyZW50Lm9yaWdpbmFsT2JqZWN0KSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaW5wdXRGaWVsZC52YWwoY3VycmVudC50aXRsZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2V5ZG93bkhhbmRsZXIoZXZlbnQpIHtcbiAgICAgIHZhciB3aGljaCA9IGllOEV2ZW50Tm9ybWFsaXplcihldmVudCk7XG4gICAgICB2YXIgcm93ID0gbnVsbDtcbiAgICAgIHZhciByb3dUb3AgPSBudWxsO1xuXG4gICAgICBpZiAod2hpY2ggPT09IEtFWV9FTiAmJiBzY29wZS5yZXN1bHRzKSB7XG4gICAgICAgIGlmIChzY29wZS5jdXJyZW50SW5kZXggPj0gMCAmJiBzY29wZS5jdXJyZW50SW5kZXggPCBzY29wZS5yZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgc2NvcGUuc2VsZWN0UmVzdWx0KHNjb3BlLnJlc3VsdHNbc2NvcGUuY3VycmVudEluZGV4XSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaGFuZGxlT3ZlcnJpZGVTdWdnZXN0aW9ucyhldmVudCk7XG4gICAgICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICB9IGVsc2UgaWYgKHdoaWNoID09PSBLRVlfRFcgJiYgc2NvcGUucmVzdWx0cykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoKHNjb3BlLmN1cnJlbnRJbmRleCArIDEpIDwgc2NvcGUucmVzdWx0cy5sZW5ndGggJiYgc2NvcGUuc2hvd0Ryb3Bkb3duKSB7XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCsrO1xuICAgICAgICAgICAgdXBkYXRlSW5wdXRGaWVsZCgpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKGlzU2Nyb2xsT24pIHtcbiAgICAgICAgICAgIHJvdyA9IGRyb3Bkb3duUm93KCk7XG4gICAgICAgICAgICBpZiAoZHJvcGRvd25IZWlnaHQoKSA8IHJvdy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5ib3R0b20pIHtcbiAgICAgICAgICAgICAgZHJvcGRvd25TY3JvbGxUb3BUbyhkcm9wZG93blJvd09mZnNldEhlaWdodChyb3cpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAod2hpY2ggPT09IEtFWV9VUCAmJiBzY29wZS5yZXN1bHRzKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChzY29wZS5jdXJyZW50SW5kZXggPj0gMSkge1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXgtLTtcbiAgICAgICAgICAgIHVwZGF0ZUlucHV0RmllbGQoKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChpc1Njcm9sbE9uKSB7XG4gICAgICAgICAgICByb3dUb3AgPSBkcm9wZG93blJvd1RvcCgpO1xuICAgICAgICAgICAgaWYgKHJvd1RvcCA8IDApIHtcbiAgICAgICAgICAgICAgZHJvcGRvd25TY3JvbGxUb3BUbyhyb3dUb3AgLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2NvcGUuY3VycmVudEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICAgICAgaW5wdXRGaWVsZC52YWwoc2NvcGUuc2VhcmNoU3RyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh3aGljaCA9PT0gS0VZX1RBQikge1xuICAgICAgICBpZiAoc2NvcGUucmVzdWx0cyAmJiBzY29wZS5yZXN1bHRzLmxlbmd0aCA+IDAgJiYgc2NvcGUuc2hvd0Ryb3Bkb3duKSB7XG4gICAgICAgICAgaWYgKHNjb3BlLmN1cnJlbnRJbmRleCA9PT0gLTEgJiYgc2NvcGUub3ZlcnJpZGVTdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgLy8gaW50ZW50aW9uYWxseSBub3Qgc2VuZGluZyBldmVudCBzbyB0aGF0IGl0IGRvZXMgbm90XG4gICAgICAgICAgICAvLyBwcmV2ZW50IGRlZmF1bHQgdGFiIGJlaGF2aW9yXG4gICAgICAgICAgICBoYW5kbGVPdmVycmlkZVN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNjb3BlLmN1cnJlbnRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjb3BlLnNlbGVjdFJlc3VsdChzY29wZS5yZXN1bHRzW3Njb3BlLmN1cnJlbnRJbmRleF0pO1xuICAgICAgICAgICAgc2NvcGUuJGRpZ2VzdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBubyByZXN1bHRzXG4gICAgICAgICAgLy8gaW50ZW50aW9uYWxseSBub3Qgc2VuZGluZyBldmVudCBzbyB0aGF0IGl0IGRvZXMgbm90XG4gICAgICAgICAgLy8gcHJldmVudCBkZWZhdWx0IHRhYiBiZWhhdmlvclxuICAgICAgICAgIGlmIChzY29wZS5zZWFyY2hTdHIgJiYgc2NvcGUuc2VhcmNoU3RyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGhhbmRsZU92ZXJyaWRlU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAod2hpY2ggPT09IEtFWV9FUykge1xuICAgICAgICAvLyBUaGlzIGlzIHZlcnkgc3BlY2lmaWMgdG8gSUUxMC8xMSAjMjcyXG4gICAgICAgIC8vIHdpdGhvdXQgdGhpcywgSUUgY2xlYXJzIHRoZSBpbnB1dCB0ZXh0XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaHR0cFN1Y2Nlc3NDYWxsYmFja0dlbihzdHIpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAocmVzcG9uc2VEYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICAvLyBub3JtYWxpemUgcmV0dXJuIG9iZWpjdCBmcm9tIHByb21pc2VcbiAgICAgICAgaWYgKCFzdGF0dXMgJiYgIWhlYWRlcnMgJiYgIWNvbmZpZyAmJiByZXNwb25zZURhdGEuZGF0YSkge1xuICAgICAgICAgIHJlc3BvbnNlRGF0YSA9IHJlc3BvbnNlRGF0YS5kYXRhO1xuICAgICAgICB9XG4gICAgICAgIHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xuICAgICAgICBwcm9jZXNzUmVzdWx0cyhcbiAgICAgICAgICBleHRyYWN0VmFsdWUocmVzcG9uc2VGb3JtYXR0ZXIocmVzcG9uc2VEYXRhKSwgc2NvcGUucmVtb3RlVXJsRGF0YUZpZWxkKSxcbiAgICAgICAgICBzdHIpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBodHRwRXJyb3JDYWxsYmFjayhlcnJvclJlcywgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIC8vIGNhbmNlbGxlZC9hYm9ydGVkXG4gICAgICBpZiAoc3RhdHVzID09PSAwIHx8IHN0YXR1cyA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBub3JtYWxpemUgcmV0dXJuIG9iZWpjdCBmcm9tIHByb21pc2VcbiAgICAgIGlmICghc3RhdHVzICYmICFoZWFkZXJzICYmICFjb25maWcpIHtcbiAgICAgICAgc3RhdHVzID0gZXJyb3JSZXMuc3RhdHVzO1xuICAgICAgfVxuICAgICAgaWYgKHNjb3BlLnJlbW90ZVVybEVycm9yQ2FsbGJhY2spIHtcbiAgICAgICAgc2NvcGUucmVtb3RlVXJsRXJyb3JDYWxsYmFjayhlcnJvclJlcywgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUuZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdodHRwIGVycm9yJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5jZWxIdHRwUmVxdWVzdCgpIHtcbiAgICAgIGlmIChodHRwQ2FuY2VsbGVyKSB7XG4gICAgICAgIGh0dHBDYW5jZWxsZXIucmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFJlbW90ZVJlc3VsdHMoc3RyKSB7XG4gICAgICB2YXIgcGFyYW1zID0ge30sXG4gICAgICAgIHVybCA9IHNjb3BlLnJlbW90ZVVybCArIGVuY29kZVVSSUNvbXBvbmVudChzdHIpO1xuICAgICAgaWYgKHNjb3BlLnJlbW90ZVVybFJlcXVlc3RGb3JtYXR0ZXIpIHtcbiAgICAgICAgcGFyYW1zID0ge3BhcmFtczogc2NvcGUucmVtb3RlVXJsUmVxdWVzdEZvcm1hdHRlcihzdHIpfTtcbiAgICAgICAgdXJsID0gc2NvcGUucmVtb3RlVXJsO1xuICAgICAgfVxuICAgICAgaWYgKCEhc2NvcGUucmVtb3RlVXJsUmVxdWVzdFdpdGhDcmVkZW50aWFscykge1xuICAgICAgICBwYXJhbXMud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGNhbmNlbEh0dHBSZXF1ZXN0KCk7XG4gICAgICBodHRwQ2FuY2VsbGVyID0gJHEuZGVmZXIoKTtcbiAgICAgIHBhcmFtcy50aW1lb3V0ID0gaHR0cENhbmNlbGxlci5wcm9taXNlO1xuICAgICAgJGh0dHAuZ2V0KHVybCwgcGFyYW1zKVxuICAgICAgICAuc3VjY2VzcyhodHRwU3VjY2Vzc0NhbGxiYWNrR2VuKHN0cikpXG4gICAgICAgIC5lcnJvcihodHRwRXJyb3JDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UmVtb3RlUmVzdWx0c1dpdGhDdXN0b21IYW5kbGVyKHN0cikge1xuICAgICAgY2FuY2VsSHR0cFJlcXVlc3QoKTtcblxuICAgICAgaHR0cENhbmNlbGxlciA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIHNjb3BlLnJlbW90ZUFwaUhhbmRsZXIoc3RyLCBodHRwQ2FuY2VsbGVyLnByb21pc2UpXG4gICAgICAgIC50aGVuKGh0dHBTdWNjZXNzQ2FsbGJhY2tHZW4oc3RyKSlcbiAgICAgICAgLmNhdGNoKGh0dHBFcnJvckNhbGxiYWNrKTtcblxuICAgICAgLyogSUU4IGNvbXBhdGlibGVcbiAgICAgICBzY29wZS5yZW1vdGVBcGlIYW5kbGVyKHN0ciwgaHR0cENhbmNlbGxlci5wcm9taXNlKVxuICAgICAgIFsndGhlbiddKGh0dHBTdWNjZXNzQ2FsbGJhY2tHZW4oc3RyKSlcbiAgICAgICBbJ2NhdGNoJ10oaHR0cEVycm9yQ2FsbGJhY2spO1xuICAgICAgICovXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xlYXJSZXN1bHRzKCkge1xuICAgICAgc2NvcGUuc2hvd0Ryb3Bkb3duID0gZmFsc2U7XG4gICAgICBzY29wZS5yZXN1bHRzID0gW107XG4gICAgICBpZiAoZGQpIHtcbiAgICAgICAgZGQuc2Nyb2xsVG9wID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0UmVzdWx0cygpIHtcbiAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IGRpc3BsYXlTZWFyY2hpbmc7XG4gICAgICBzY29wZS5jdXJyZW50SW5kZXggPSBzY29wZS5mb2N1c0ZpcnN0ID8gMCA6IC0xO1xuICAgICAgc2NvcGUucmVzdWx0cyA9IFtdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldExvY2FsUmVzdWx0cyhzdHIpIHtcbiAgICAgIHZhciBpLCBtYXRjaCwgcywgdmFsdWUsXG4gICAgICAgIHNlYXJjaEZpZWxkcyA9IHNjb3BlLnNlYXJjaEZpZWxkcy5zcGxpdCgnLCcpLFxuICAgICAgICBtYXRjaGVzID0gW107XG4gICAgICBpZiAodHlwZW9mIHNjb3BlLnBhcnNlSW5wdXQoKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgc3RyID0gc2NvcGUucGFyc2VJbnB1dCgpKHN0cik7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgc2NvcGUubG9jYWxEYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG1hdGNoID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChzID0gMDsgcyA8IHNlYXJjaEZpZWxkcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgIHZhbHVlID0gZXh0cmFjdFZhbHVlKHNjb3BlLmxvY2FsRGF0YVtpXSwgc2VhcmNoRmllbGRzW3NdKSB8fCAnJztcbiAgICAgICAgICBtYXRjaCA9IG1hdGNoIHx8ICh2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzdHIudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpKSA+PSAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIG1hdGNoZXNbbWF0Y2hlcy5sZW5ndGhdID0gc2NvcGUubG9jYWxEYXRhW2ldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF0Y2hlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja0V4YWN0TWF0Y2gocmVzdWx0LCBvYmosIHN0cikge1xuICAgICAgaWYgKCFzdHIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAob2JqW2tleV0udG9Mb3dlckNhc2UoKSA9PT0gc3RyLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICBzY29wZS5zZWxlY3RSZXN1bHQocmVzdWx0KTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlYXJjaFRpbWVyQ29tcGxldGUoc3RyKSB7XG4gICAgICAvLyBCZWdpbiB0aGUgc2VhcmNoXG4gICAgICBpZiAoIXN0ciB8fCBzdHIubGVuZ3RoIDwgbWlubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChzY29wZS5sb2NhbERhdGEpIHtcbiAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgbWF0Y2hlcztcbiAgICAgICAgICBpZiAodHlwZW9mIHNjb3BlLmxvY2FsU2VhcmNoKCkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBtYXRjaGVzID0gc2NvcGUubG9jYWxTZWFyY2goKShzdHIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXRjaGVzID0gZ2V0TG9jYWxSZXN1bHRzKHN0cik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xuICAgICAgICAgIHByb2Nlc3NSZXN1bHRzKG1hdGNoZXMsIHN0cik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoc2NvcGUucmVtb3RlQXBpSGFuZGxlcikge1xuICAgICAgICBnZXRSZW1vdGVSZXN1bHRzV2l0aEN1c3RvbUhhbmRsZXIoc3RyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdldFJlbW90ZVJlc3VsdHMoc3RyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcm9jZXNzUmVzdWx0cyhyZXNwb25zZURhdGEsIHN0cikge1xuICAgICAgdmFyIGksIGRlc2NyaXB0aW9uLCBpbWFnZSwgdGV4dCwgZm9ybWF0dGVkVGV4dCwgZm9ybWF0dGVkRGVzYztcblxuICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICBzY29wZS5yZXN1bHRzID0gW107XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHJlc3BvbnNlRGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChzY29wZS50aXRsZUZpZWxkICYmIHNjb3BlLnRpdGxlRmllbGQgIT09ICcnKSB7XG4gICAgICAgICAgICB0ZXh0ID0gZm9ybWF0dGVkVGV4dCA9IGV4dHJhY3RUaXRsZShyZXNwb25zZURhdGFbaV0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRlc2NyaXB0aW9uID0gJyc7XG4gICAgICAgICAgaWYgKHNjb3BlLmRlc2NyaXB0aW9uRmllbGQpIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gZm9ybWF0dGVkRGVzYyA9IGV4dHJhY3RWYWx1ZShyZXNwb25zZURhdGFbaV0sIHNjb3BlLmRlc2NyaXB0aW9uRmllbGQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGltYWdlID0gJyc7XG4gICAgICAgICAgaWYgKHNjb3BlLmltYWdlRmllbGQpIHtcbiAgICAgICAgICAgIGltYWdlID0gZXh0cmFjdFZhbHVlKHJlc3BvbnNlRGF0YVtpXSwgc2NvcGUuaW1hZ2VGaWVsZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNjb3BlLm1hdGNoQ2xhc3MpIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZFRleHQgPSBmaW5kTWF0Y2hTdHJpbmcodGV4dCwgc3RyKTtcbiAgICAgICAgICAgIGZvcm1hdHRlZERlc2MgPSBmaW5kTWF0Y2hTdHJpbmcoZGVzY3JpcHRpb24sIHN0cik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2NvcGUucmVzdWx0c1tzY29wZS5yZXN1bHRzLmxlbmd0aF0gPSB7XG4gICAgICAgICAgICB0aXRsZTogZm9ybWF0dGVkVGV4dCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBmb3JtYXR0ZWREZXNjLFxuICAgICAgICAgICAgaW1hZ2U6IGltYWdlLFxuICAgICAgICAgICAgb3JpZ2luYWxPYmplY3Q6IHJlc3BvbnNlRGF0YVtpXVxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NvcGUucmVzdWx0cyA9IFtdO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2NvcGUuYXV0b01hdGNoICYmIHNjb3BlLnJlc3VsdHMubGVuZ3RoID09PSAxICYmXG4gICAgICAgIGNoZWNrRXhhY3RNYXRjaChzY29wZS5yZXN1bHRzWzBdLFxuICAgICAgICAgIHt0aXRsZTogdGV4dCwgZGVzYzogZGVzY3JpcHRpb24gfHwgJyd9LCBzY29wZS5zZWFyY2hTdHIpKSB7XG4gICAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmIChzY29wZS5yZXN1bHRzLmxlbmd0aCA9PT0gMCAmJiAhZGlzcGxheU5vUmVzdWx0cykge1xuICAgICAgICBzY29wZS5zaG93RHJvcGRvd24gPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2hvd0FsbCgpIHtcbiAgICAgIGlmIChzY29wZS5sb2NhbERhdGEpIHtcbiAgICAgICAgcHJvY2Vzc1Jlc3VsdHMoc2NvcGUubG9jYWxEYXRhLCAnJyk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChzY29wZS5yZW1vdGVBcGlIYW5kbGVyKSB7XG4gICAgICAgIGdldFJlbW90ZVJlc3VsdHNXaXRoQ3VzdG9tSGFuZGxlcignJyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZ2V0UmVtb3RlUmVzdWx0cygnJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NvcGUub25Gb2N1c0hhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2NvcGUuZm9jdXNJbikge1xuICAgICAgICBzY29wZS5mb2N1c0luKCk7XG4gICAgICB9XG4gICAgICBpZiAobWlubGVuZ3RoID09PSAwICYmICghc2NvcGUuc2VhcmNoU3RyIHx8IHNjb3BlLnNlYXJjaFN0ci5sZW5ndGggPT09IDApKSB7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IHNjb3BlLmZvY3VzRmlyc3QgPyAwIDogc2NvcGUuY3VycmVudEluZGV4O1xuICAgICAgICBzY29wZS5zaG93RHJvcGRvd24gPSB0cnVlO1xuICAgICAgICBzaG93QWxsKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNjb3BlLmhpZGVSZXN1bHRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG1vdXNlZG93bk9uICYmXG4gICAgICAgIChtb3VzZWRvd25PbiA9PT0gc2NvcGUuaWQgKyAnX2Ryb3Bkb3duJyB8fFxuICAgICAgICBtb3VzZWRvd25Pbi5pbmRleE9mKCdhbmd1Y29tcGxldGUnKSA+PSAwKSkge1xuICAgICAgICBtb3VzZWRvd25PbiA9IG51bGw7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaGlkZVRpbWVyID0gJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoc2NvcGUuc2VhcmNoU3RyICYmIHNjb3BlLnNlYXJjaFN0ci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGlucHV0RmllbGQudmFsKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIEJMVVJfVElNRU9VVCk7XG4gICAgICAgIGNhbmNlbEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgaWYgKHNjb3BlLmZvY3VzT3V0KSB7XG4gICAgICAgICAgc2NvcGUuZm9jdXNPdXQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzY29wZS5vdmVycmlkZVN1Z2dlc3Rpb25zKSB7XG4gICAgICAgICAgaWYgKHNjb3BlLnNlYXJjaFN0ciAmJiBzY29wZS5zZWFyY2hTdHIubGVuZ3RoID4gMCAmJiBzY29wZS5jdXJyZW50SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICBoYW5kbGVPdmVycmlkZVN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNjb3BlLnJlc2V0SGlkZVJlc3VsdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoaGlkZVRpbWVyKSB7XG4gICAgICAgICR0aW1lb3V0LmNhbmNlbChoaWRlVGltZXIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBzY29wZS5ob3ZlclJvdyA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gaW5kZXg7XG4gICAgfTtcblxuICAgIHNjb3BlLnNlbGVjdFJlc3VsdCA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgIC8vIFJlc3RvcmUgb3JpZ2luYWwgdmFsdWVzXG4gICAgICBpZiAoc2NvcGUubWF0Y2hDbGFzcykge1xuICAgICAgICByZXN1bHQudGl0bGUgPSBleHRyYWN0VGl0bGUocmVzdWx0Lm9yaWdpbmFsT2JqZWN0KTtcbiAgICAgICAgcmVzdWx0LmRlc2NyaXB0aW9uID0gZXh0cmFjdFZhbHVlKHJlc3VsdC5vcmlnaW5hbE9iamVjdCwgc2NvcGUuZGVzY3JpcHRpb25GaWVsZCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzY29wZS5jbGVhclNlbGVjdGVkKSB7XG4gICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IG51bGw7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2NvcGUuc2VhcmNoU3RyID0gcmVzdWx0LnRpdGxlO1xuICAgICAgfVxuICAgICAgY2FsbE9yQXNzaWduKHJlc3VsdCk7XG4gICAgICBjbGVhclJlc3VsdHMoKTtcbiAgICB9O1xuXG4gICAgc2NvcGUuaW5wdXRDaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgaWYgKHN0ci5sZW5ndGggPCBtaW5sZW5ndGgpIHtcbiAgICAgICAgY2FuY2VsSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChzdHIubGVuZ3RoID09PSAwICYmIG1pbmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBzY29wZS5zZWFyY2hpbmcgPSBmYWxzZTtcbiAgICAgICAgc2hvd0FsbCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2NvcGUuaW5wdXRDaGFuZ2VkKSB7XG4gICAgICAgIHN0ciA9IHNjb3BlLmlucHV0Q2hhbmdlZChzdHIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9O1xuXG4gICAgLy8gY2hlY2sgcmVxdWlyZWRcbiAgICBpZiAoc2NvcGUuZmllbGRSZXF1aXJlZENsYXNzICYmIHNjb3BlLmZpZWxkUmVxdWlyZWRDbGFzcyAhPT0gJycpIHtcbiAgICAgIHJlcXVpcmVkQ2xhc3NOYW1lID0gc2NvcGUuZmllbGRSZXF1aXJlZENsYXNzO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIG1pbiBsZW5ndGhcbiAgICBpZiAoc2NvcGUubWlubGVuZ3RoICYmIHNjb3BlLm1pbmxlbmd0aCAhPT0gJycpIHtcbiAgICAgIG1pbmxlbmd0aCA9IHBhcnNlSW50KHNjb3BlLm1pbmxlbmd0aCwgMTApO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIHBhdXNlIHRpbWVcbiAgICBpZiAoIXNjb3BlLnBhdXNlKSB7XG4gICAgICBzY29wZS5wYXVzZSA9IFBBVVNFO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGNsZWFyU2VsZWN0ZWRcbiAgICBpZiAoIXNjb3BlLmNsZWFyU2VsZWN0ZWQpIHtcbiAgICAgIHNjb3BlLmNsZWFyU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayBvdmVycmlkZSBzdWdnZXN0aW9uc1xuICAgIGlmICghc2NvcGUub3ZlcnJpZGVTdWdnZXN0aW9ucykge1xuICAgICAgc2NvcGUub3ZlcnJpZGVTdWdnZXN0aW9ucyA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIHJlcXVpcmVkIGZpZWxkXG4gICAgaWYgKHNjb3BlLmZpZWxkUmVxdWlyZWQgJiYgY3RybCkge1xuICAgICAgLy8gY2hlY2sgaW5pdGlhbCB2YWx1ZSwgaWYgZ2l2ZW4sIHNldCB2YWxpZGl0aXR5IHRvIHRydWVcbiAgICAgIGlmIChzY29wZS5pbml0aWFsVmFsdWUpIHtcbiAgICAgICAgaGFuZGxlUmVxdWlyZWQodHJ1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaGFuZGxlUmVxdWlyZWQoZmFsc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNjb3BlLmlucHV0VHlwZSA9IGF0dHJzLnR5cGUgPyBhdHRycy50eXBlIDogJ3RleHQnO1xuXG4gICAgLy8gc2V0IHN0cmluZ3MgZm9yIFwiU2VhcmNoaW5nLi4uXCIgYW5kIFwiTm8gcmVzdWx0c1wiXG4gICAgc2NvcGUudGV4dFNlYXJjaGluZyA9IGF0dHJzLnRleHRTZWFyY2hpbmcgPyBhdHRycy50ZXh0U2VhcmNoaW5nIDogVEVYVF9TRUFSQ0hJTkc7XG4gICAgc2NvcGUudGV4dE5vUmVzdWx0cyA9IGF0dHJzLnRleHROb1Jlc3VsdHMgPyBhdHRycy50ZXh0Tm9SZXN1bHRzIDogVEVYVF9OT1JFU1VMVFM7XG4gICAgZGlzcGxheVNlYXJjaGluZyA9IHNjb3BlLnRleHRTZWFyY2hpbmcgPT09ICdmYWxzZScgPyBmYWxzZSA6IHRydWU7XG4gICAgZGlzcGxheU5vUmVzdWx0cyA9IHNjb3BlLnRleHROb1Jlc3VsdHMgPT09ICdmYWxzZScgPyBmYWxzZSA6IHRydWU7XG5cbiAgICAvLyBzZXQgbWF4IGxlbmd0aCAoZGVmYXVsdCB0byBtYXhsZW5ndGggZGVhdWx0IGZyb20gaHRtbFxuICAgIHNjb3BlLm1heGxlbmd0aCA9IGF0dHJzLm1heGxlbmd0aCA/IGF0dHJzLm1heGxlbmd0aCA6IE1BWF9MRU5HVEg7XG5cbiAgICAvLyByZWdpc3RlciBldmVudHNcbiAgICBpbnB1dEZpZWxkLm9uKCdrZXlkb3duJywga2V5ZG93bkhhbmRsZXIpO1xuICAgIGlucHV0RmllbGQub24oJ2tleXVwJywga2V5dXBIYW5kbGVyKTtcblxuICAgIC8vIHNldCByZXNwb25zZSBmb3JtYXR0ZXJcbiAgICByZXNwb25zZUZvcm1hdHRlciA9IGNhbGxGdW5jdGlvbk9ySWRlbnRpdHkoJ3JlbW90ZVVybFJlc3BvbnNlRm9ybWF0dGVyJyk7XG5cbiAgICAvLyBzZXQgaXNTY3JvbGxPblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjc3MgPSBnZXRDb21wdXRlZFN0eWxlKGRkKTtcbiAgICAgIGlzU2Nyb2xsT24gPSBjc3MubWF4SGVpZ2h0ICYmIGNzcy5vdmVyZmxvd1kgPT09ICdhdXRvJztcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgcmVxdWlyZTogJ14/Zm9ybScsXG4gICAgc2NvcGU6IHtcbiAgICAgIHNlbGVjdGVkT2JqZWN0OiAnPScsXG4gICAgICBkaXNhYmxlSW5wdXQ6ICc9JyxcbiAgICAgIGluaXRpYWxWYWx1ZTogJz0nLFxuICAgICAgbG9jYWxEYXRhOiAnPScsXG4gICAgICBsb2NhbFNlYXJjaDogJyYnLFxuICAgICAgcmVtb3RlVXJsUmVxdWVzdEZvcm1hdHRlcjogJz0nLFxuICAgICAgcmVtb3RlVXJsUmVxdWVzdFdpdGhDcmVkZW50aWFsczogJ0AnLFxuICAgICAgcmVtb3RlVXJsUmVzcG9uc2VGb3JtYXR0ZXI6ICc9JyxcbiAgICAgIHJlbW90ZVVybEVycm9yQ2FsbGJhY2s6ICc9JyxcbiAgICAgIHJlbW90ZUFwaUhhbmRsZXI6ICc9JyxcbiAgICAgIGlkOiAnQCcsXG4gICAgICB0eXBlOiAnQCcsXG4gICAgICBwbGFjZWhvbGRlcjogJ0AnLFxuICAgICAgcmVtb3RlVXJsOiAnQCcsXG4gICAgICByZW1vdGVVcmxEYXRhRmllbGQ6ICdAJyxcbiAgICAgIHRpdGxlRmllbGQ6ICdAJyxcbiAgICAgIGRlc2NyaXB0aW9uRmllbGQ6ICdAJyxcbiAgICAgIGltYWdlRmllbGQ6ICdAJyxcbiAgICAgIGlucHV0Q2xhc3M6ICdAJyxcbiAgICAgIHBhdXNlOiAnQCcsXG4gICAgICBzZWFyY2hGaWVsZHM6ICdAJyxcbiAgICAgIG1pbmxlbmd0aDogJ0AnLFxuICAgICAgbWF0Y2hDbGFzczogJ0AnLFxuICAgICAgY2xlYXJTZWxlY3RlZDogJ0AnLFxuICAgICAgb3ZlcnJpZGVTdWdnZXN0aW9uczogJ0AnLFxuICAgICAgZmllbGRSZXF1aXJlZDogJz0nLFxuICAgICAgZmllbGRSZXF1aXJlZENsYXNzOiAnQCcsXG4gICAgICBpbnB1dENoYW5nZWQ6ICc9JyxcbiAgICAgIGF1dG9NYXRjaDogJ0AnLFxuICAgICAgZm9jdXNPdXQ6ICcmJyxcbiAgICAgIGZvY3VzSW46ICcmJyxcbiAgICAgIGZpZWxkVGFiaW5kZXg6ICdAJyxcbiAgICAgIGlucHV0TmFtZTogJ0AnLFxuICAgICAgZm9jdXNGaXJzdDogJ0AnLFxuICAgICAgcGFyc2VJbnB1dDogJyYnXG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgVEVNUExBVEVfVVJMO1xuICAgIH0sXG4gICAgY29tcGlsZTogZnVuY3Rpb24gKHRFbGVtZW50KSB7XG4gICAgICB2YXIgc3RhcnRTeW0gPSAkaW50ZXJwb2xhdGUuc3RhcnRTeW1ib2woKTtcbiAgICAgIHZhciBlbmRTeW0gPSAkaW50ZXJwb2xhdGUuZW5kU3ltYm9sKCk7XG4gICAgICBpZiAoIShzdGFydFN5bSA9PT0gJ3t7JyAmJiBlbmRTeW0gPT09ICd9fScpKSB7XG4gICAgICAgIHZhciBpbnRlcnBvbGF0ZWRIdG1sID0gdEVsZW1lbnQuaHRtbCgpXG4gICAgICAgICAgLnJlcGxhY2UoL1xce1xcey9nLCBzdGFydFN5bSlcbiAgICAgICAgICAucmVwbGFjZSgvXFx9XFx9L2csIGVuZFN5bSk7XG4gICAgICAgIHRFbGVtZW50Lmh0bWwoaW50ZXJwb2xhdGVkSHRtbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGluaztcbiAgICB9XG4gIH07XG59XSk7XG5cblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogbm9kZV9tb2R1bGVzL2FuZ3Vjb21wbGV0ZS1hbHQvYW5ndWNvbXBsZXRlLWFsdC5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IG1haW4gPSBhbmd1bGFyLm1vZHVsZSgnbWFpbicsIFsndWkucm91dGVyJ10pO1xyXG5cclxubWFpblxyXG4gICAgLmNvbXBvbmVudCgnbGVmdFNpZGVNZW51JywgcmVxdWlyZSgnLi9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQvbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdkYXl0aW1lQ2hvb3NlJywgcmVxdWlyZSgnLi9kYXl0aW1lLWNob29zZS1jb21wb25lbnQvZGF5dGltZS1jaG9vc2UtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdob21lJywgcmVxdWlyZSgnLi9ob21lLXBhZ2UtbW9kdWxlL2hvbWUtcGFnZS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ3ZpZXcnLCByZXF1aXJlKCcuL3ZpZXctY29tcG9uZW50L3ZpZXctY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdtb2RhbCcsIHJlcXVpcmUoJy4vbW9kYWwtd2luZG93LWNvbXBvbmVudC9tb2RhbC13aW5kb3ctY29tcG9uZW50JykpO1xyXG5cclxubWFpbi5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAgICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAgICAgLnN0YXRlKCdob21lJywge1xyXG4gICAgICAgICAgICB1cmw6ICcvaG9tZScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGhvbWU+PC9ob21lPidcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZSgnZGlhcnknLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9kaWFyeS86ZGF5dGltZScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRheS10aW1lIGJhc2U9XCIkY3RybC5iYXNlXCIgZGF5dGltZXM9XCIkY3RybC52aWV3RGF0YS5kYXlUaW1lc1wiIGFkZD1cIiRjdHJsLmFkZEZvb2QoZGF5VGltZUlkLCBmb29kKVwiIHJlbW92ZT1cIiRjdHJsLnJlbW92ZUZvb2QoZGF5VGltZUlkLCBmb29kKVwiIGRheS10aW1lLWxpbWl0cz1cIiRjdHJsLnZpZXdEYXRhLmxpbWl0c0RhdGFcIj48L2RheS10aW1lPidcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZSgnc2V0dGluZ3MnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncycsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPG1lbnU+PC9tZW51PidcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZSgncmVzdWx0Jywge1xyXG4gICAgICAgICAgICB1cmw6ICcvcmVzdWx0JyxcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8cmVzdWx0IHJlc3VsdD1cIiRjdHJsLnZpZXdEYXRhLnJlc3VsdEZpbmFsXCI+PC9yZXN1bHQ+J1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKCd0YWJsZXMnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy90YWJsZXMnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzx0YWJsZXMgZm9vZHMtb2Jqcz1cIiRjdHJsLnZpZXdEYXRhLnRhYmxlc0RhdGEuZm9vZHNPYmpzXCIgbXktZm9vZHM9XCIkY3RybC52aWV3RGF0YS50YWJsZXNEYXRhLm15Rm9vZHNcIiByZW1vdmUtbXktZm9vZD1cIiRjdHJsLnJlbW92ZU15Rm9vZChuYW1lKVwiPjwvdGFibGVzPidcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZSgnYWRkLWZvb2QnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9hZGQtZm9vZCcsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPHRhYmxlLWFkZCBteS1mb29kcz1cIiRjdHJsLnZpZXdEYXRhLnRhYmxlc0RhdGEubXlGb29kc1wiIHJlbW92ZS1teS1mb29kPVwiJGN0cmwucmVtb3ZlTXlGb29kKG5hbWUpXCIgYWRkLW15LWZvb2Q9XCIkY3RybC5hZGRNeUZvb2QobmFtZSwgdmFsdWVzKVwiPjwvdGFibGUtYWRkPidcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZSgnc2F2ZScsIHtcclxuICAgICAgICAgICAgdXJsOiAnL3NhdmUnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxzYXZlLW1lbnUgZGF5LXRpbWVzLWRhdGE9XCIkY3RybC52aWV3RGF0YS5kYXlUaW1lc1wiIHJlc3VsdD1cIiRjdHJsLnZpZXdEYXRhLnJlc3VsdEZpbmFsXCI+PC9zYXZlLW1lbnU+J1xyXG4gICAgICAgIH0pO1xyXG59KTtcclxuXHJcbm1haW4ucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsIGFjdGl2ZUNsYXNzU2VydmljZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMpIHtcclxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdWNjZXNzJywgKCkgPT4ge1xyXG4gICAgICAgIHZhciBjbGFzc05hbWUgPSAkc3RhdGUuY3VycmVudC5uYW1lID09PSAnZGlhcnknPyAkc3RhdGVQYXJhbXMuZGF5dGltZSA6ICRzdGF0ZS5jdXJyZW50Lm5hbWU7XHJcbiAgICAgICAgYWN0aXZlQ2xhc3NTZXJ2aWNlLnNldENsYXNzTmFtZShjbGFzc05hbWUpO1xyXG4gICAgfSlcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1haW47XHJcblxyXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvbWFpbi1tb2R1bGUvaW5kZXguanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBsZWZ0U2lkZU1lbnVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvbGVmdC1zaWRlLW1lbnUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgbGVmdFNpZGVNZW51ID0ge1xyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzdGF0ZSwgYWN0aXZlQ2xhc3NTZXJ2aWNlLCBtb2RhbCkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlQ2xhc3MgPSBhY3RpdmVDbGFzc1NlcnZpY2UuZ2V0Q2xhc3NOYW1lO1xyXG5cclxuICAgICAgICB0aGlzLm1lbnVJdGVtcyA9IFtcclxuICAgICAgICAgICAge2NsYXNzTmFtZTogJ2hvbWUnLCB0b29sdGlwOiAn0J3QsCDQs9C70LDQstC90YPRjicsIHRvb2x0aXBTaG93OiBmYWxzZX0sXHJcbiAgICAgICAgICAgIHtjbGFzc05hbWU6ICdzZXR0aW5ncycsIHRvb2x0aXA6ICfQndCw0YHRgtGA0L7QudC60LgnLCB0b29sdGlwU2hvdzogZmFsc2V9LFxyXG4gICAgICAgICAgICB7Y2xhc3NOYW1lOiAncmVzdWx0JywgdG9vbHRpcDogJ9CY0YLQvtCzINC00L3RjycsIHRvb2x0aXBTaG93OiBmYWxzZX0sXHJcbiAgICAgICAgICAgIHtjbGFzc05hbWU6ICdzYXZlJywgdG9vbHRpcDogJ9Ch0L7RhdGA0LDQvdC40YLRjCcsIHRvb2x0aXBTaG93OiBmYWxzZX0sXHJcbiAgICAgICAgICAgIHtjbGFzc05hbWU6ICd0YWJsZXMnLCB0b29sdGlwOiAn0KLQsNCx0LvQuNGG0YsnLCB0b29sdGlwU2hvdzogZmFsc2V9LFxyXG4gICAgICAgICAgICB7Y2xhc3NOYW1lOiAnYWRkLWZvb2QnLCB0b29sdGlwOiAn0JTQvtCx0LDQstC40YLRjCDQtdC00YMg0LIg0YLQsNCx0LvQuNGG0YMnLCB0b29sdGlwU2hvdzogZmFsc2V9XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgdGhpcy50b2dnbGUgPSBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmNsYXNzTmFtZSA9PT0gdGhpcy5hY3RpdmVDbGFzcykgcmV0dXJuO1xyXG4gICAgICAgICAgICBpdGVtLnRvb2x0aXBTaG93ID0gIWl0ZW0udG9vbHRpcFNob3c7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbihjbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgKCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IG51bWIgPSBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIDMpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tJY29uQ2xhc3NOYW1lID0gJ2ljb24nICsgbnVtYjtcclxuICAgICAgICB9KSgpXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGxlZnRTaWRlTWVudVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGxlZnRTaWRlTWVudTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvbWFpbi1tb2R1bGUvbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50L2xlZnQtc2lkZS1tZW51LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwibGVmdC1zaWRlLW1lbnVcXFwiPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJ0by1hbm90aGVyLWRlc2lnblxcXCIgbmctY2xhc3M9XFxcIiRjdHJsLmJhY2tJY29uQ2xhc3NOYW1lXFxcIj48L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwibWVudS1pdGVtXFxcIiBuZy1yZXBlYXQ9XFxcIml0ZW0gaW4gJGN0cmwubWVudUl0ZW1zXFxcIiBuZy1jbGFzcz1cXFwiW2l0ZW0uY2xhc3NOYW1lLCAkY3RybC5hY3RpdmVDbGFzcygpXVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldFN0YXRlKGl0ZW0uY2xhc3NOYW1lKVxcXCIgbmctbW91c2VlbnRlcj1cXFwiJGN0cmwudG9nZ2xlKGl0ZW0pXFxcIiBuZy1tb3VzZWxlYXZlPVxcXCIkY3RybC50b2dnbGUoaXRlbSlcXFwiPlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwidG9vbHRpcFxcXCIgbmctaWY9XFxcIml0ZW0udG9vbHRpcFNob3dcXFwiPnt7aXRlbS50b29sdGlwfX08L2Rpdj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuXFxyXFxuPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcImxlZnQtc2lkZS1tZW51LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL21haW4tbW9kdWxlL2xlZnQtc2lkZS1tZW51LWNvbXBvbmVudC90ZW1wbGF0ZS9sZWZ0LXNpZGUtbWVudS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgZGF5dGltZUNob29zZVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9kYXl0aW1lLWNob29zZS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBkYXl0aW1lQ2hvb3NlID0ge1xyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHN0YXRlLCBhY3RpdmVDbGFzc1NlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLmRheXRpbWVzID0gW1xyXG4gICAgICAgICAgICB7dGltZTogJ9CX0LDQstGC0YDQsNC6JywgY2xhc3NOYW1lOiAnYnJlYWtmYXN0Jywgc3RhdGU6ICdicmVha2Zhc3QnfSxcclxuICAgICAgICAgICAge3RpbWU6ICfQn9C10YDQtdC60YPRgSAxJywgY2xhc3NOYW1lOiBmYWxzZSwgc3RhdGU6ICdmaXJzdC1zbmFjayd9LFxyXG4gICAgICAgICAgICB7dGltZTogJ9Ce0LHQtdC0JywgY2xhc3NOYW1lOiBmYWxzZSwgc3RhdGU6ICdkaW5uZXInfSxcclxuICAgICAgICAgICAge3RpbWU6ICfQn9C10YDQtdC60YPRgSAyJywgY2xhc3NOYW1lOiBmYWxzZSwgc3RhdGU6ICdzZWNvbmQtc25hY2snfSxcclxuICAgICAgICAgICAge3RpbWU6ICfQo9C20LjQvScsIGNsYXNzTmFtZTogZmFsc2UsIHN0YXRlOiAnZXZlbmluZy1tZWFsJ31cclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB0aGlzLmFjdGl2ZUNsYXNzID0gYWN0aXZlQ2xhc3NTZXJ2aWNlLmdldENsYXNzTmFtZTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSA9IGZ1bmN0aW9uKGRheXRpbWUpIHtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKCdkaWFyeScsIHtkYXl0aW1lOiBkYXl0aW1lLnN0YXRlfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGRheXRpbWVDaG9vc2VUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkYXl0aW1lQ2hvb3NlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9tYWluLW1vZHVsZS9kYXl0aW1lLWNob29zZS1jb21wb25lbnQvZGF5dGltZS1jaG9vc2UtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJkYXl0aW1lLWNob29zZVxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImRheXRpbWVcXFwiIG5nLXJlcGVhdD1cXFwiZGF5dGltZSBpbiAkY3RybC5kYXl0aW1lc1xcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldFN0YXRlKGRheXRpbWUpXFxcIiBuZy1jbGFzcz1cXFwiWyRjdHJsLmFjdGl2ZUNsYXNzKCksIGRheXRpbWUuc3RhdGVdXFxcIj57eyBkYXl0aW1lLnRpbWUgfX08L2Rpdj5cXHJcXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwiZGF5dGltZS1jaG9vc2UtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvbWFpbi1tb2R1bGUvZGF5dGltZS1jaG9vc2UtY29tcG9uZW50L3RlbXBsYXRlL2RheXRpbWUtY2hvb3NlLXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSA3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBob21lUGFnZVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9ob21lLXBhZ2UtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgaG9tZVBhZ2UgPSB7XHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGhvbWVQYWdlVGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gaG9tZVBhZ2U7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL21haW4tbW9kdWxlL2hvbWUtcGFnZS1tb2R1bGUvaG9tZS1wYWdlLWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwiaG9tZS1wYWdlXFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiZGF5dGltZS1zZWxlY3QtdG9vbHRpcFxcXCI+0JLRi9Cx0LXRgNC10YLQtSDQstGA0LXQvNGPINC00L3RjyxcXHJcXG4gICAgICAgINGH0YLQvtCx0Ysg0L/RgNC40YHRgtGD0L/QuNGC0Ywg0Log0LfQsNC/0L7Qu9C90LXQvdC40Y4g0LTQvdC10LLQvdC40LrQsDwvZGl2PlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJob21lLWhlYWRlclxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJsZWZ0LWxpbmVcXFwiPjwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwicmlnaHQtbGluZVxcXCI+PC9kaXY+XFxyXFxuICAgICAgICA8aDI+0JTQvdC10LLQvdC40Log0L/QuNGC0LDQvdC40Y88L2gyPlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwibWVudS1zZWxlY3QtdG9vbHRpcFxcXCI+0KfRgtC+0LHRiyDRg9GB0YLQsNC90L7QstC40YLRjCDQu9C40LzQuNGC0YssXFxyXFxuICAgICAgICDRgdC+0YXRgNCw0L3QuNGC0Ywg0LTQsNC90L3Ri9C1LCDQtNC+0LHQsNCy0LjRgtGMINC10LTRgyDQu9C40LHQvlxcclxcbiAgICAgICAg0L/RgNC+0YHQvNC+0YLRgNC10YLRjCDQuNGC0L7QsyDQuCDRgtCw0LHQu9C40YbRiyDQstC+0YHQv9C+0LvRjNC30YPQudGC0LXRgdGMINC80LXQvdGOPC9kaXY+XFxyXFxuPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcImhvbWUtcGFnZS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC9tYWluLW1vZHVsZS9ob21lLXBhZ2UtbW9kdWxlL3RlbXBsYXRlL2hvbWUtcGFnZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3Qgdmlld1RlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS92aWV3LXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IHZpZXcgPSB7XHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoZGF0YVNlcnZpY2UsIGxpbWl0c1NlcnZpY2UsICR3aW5kb3csIG1vZGFsLCBkaWV0Q2hvb3NlKSB7XHJcbiAgICAgICAgY29uc3QgZW1wdHkgPSB7XHJcbiAgICAgICAgICAgIGVtcHR5OiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lOiAnLS0tLS0tLS0tJyxcclxuICAgICAgICAgICAgcG9ydGlvbjogJy0tLScsXHJcbiAgICAgICAgICAgIGNhcmJvaHlkOiAnLS0tJyxcclxuICAgICAgICAgICAgcHJvdDogJy0tLScsXHJcbiAgICAgICAgICAgIGZhdDogJy0tLScsXHJcbiAgICAgICAgICAgIGthbGw6ICctLS0nXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5iYXNlID0gZGF0YVNlcnZpY2UuYmFzZTtcclxuICAgICAgICB0aGlzLnZpZXdEYXRhID0ge1xyXG4gICAgICAgICAgICBsaW1pdHNEYXRhOiBsaW1pdHNTZXJ2aWNlLmxpbWl0c0RhdGEsXHJcbiAgICAgICAgICAgIHRhYmxlc0RhdGE6IHt9LFxyXG4gICAgICAgICAgICByZXN1bHRGaW5hbDoge1xyXG4gICAgICAgICAgICAgICAgY2FyYm9oeWQ6IHtuYW1lOiAn0KPQs9C00LXQstC+0LTRiycsIHZhbHVlOiAwfSxcclxuICAgICAgICAgICAgICAgIHByb3Q6IHtuYW1lOiAn0J/RgNC+0YLQtdC40L3RiycsIHZhbHVlOiAwfSxcclxuICAgICAgICAgICAgICAgIGZhdDoge25hbWU6ICfQltC40YDRiycsIHZhbHVlOiAwfSxcclxuICAgICAgICAgICAgICAgIGthbGw6IHtuYW1lOiAn0JrQsNC70L7RgNC40LgnLCB2YWx1ZTogMH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRhdGFTZXJ2aWNlLmdldFRhYmxlRGF0YSgpXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnRhYmxlc0RhdGEuZm9vZHNPYmpzID0gZGF0YTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgZGF0YVNlcnZpY2UuZ2V0RGF5VGltZXNEYXRhKClcclxuICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHRoaXMudmlld0RhdGEuZGF5VGltZXMgPSBkYXRhLmRhdGEpO1xyXG5cclxuXHJcblxyXG4gICAgICAgIHRoaXMuY29tcGFyZSA9IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnZpZXdEYXRhLmxpbWl0c0RhdGEubGltaXRzKSByZXR1cm47XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZpZXdEYXRhLmxpbWl0c0RhdGEubGltaXRzW1wi0JjRgtC+0LNcIl1ba2V5XSA8IHRoaXMudmlld0RhdGEucmVzdWx0RmluYWxba2V5XSkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuYWRkRm9vZCA9IGZ1bmN0aW9uIChkYXlUaW1lSWQsIGZvb2QpIHtcclxuICAgICAgICAgICAgbGV0IGNvbGxlY3Rpb24gPSB0aGlzLnZpZXdEYXRhLmRheVRpbWVzW2RheVRpbWVJZF0uZm9vZHM7XHJcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9uWzBdLmVtcHR5KSBjb2xsZWN0aW9uLnNwbGljZSgwLCAxKTtcclxuXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb24ucHVzaChmb29kKTtcclxuICAgICAgICAgICAgdGhpcy5jYWxjUmVzdWx0KGRheVRpbWVJZCwgZm9vZCwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuX2xhc3RTYXZlSWQpICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ19sYXN0U2F2ZUlkJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVGb29kID0gZnVuY3Rpb24gKGRheVRpbWVJZCwgZm9vZCkge1xyXG4gICAgICAgICAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMudmlld0RhdGEuZGF5VGltZXNbZGF5VGltZUlkXS5mb29kcztcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gY29sbGVjdGlvbi5pbmRleE9mKGZvb2QpO1xyXG4gICAgICAgICAgICBjb2xsZWN0aW9uLnNwbGljZShpbmRleCwgMSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbi5sZW5ndGggPT09IDApIGNvbGxlY3Rpb24ucHVzaChlbXB0eSk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsY1Jlc3VsdChkYXlUaW1lSWQsIGZvb2QsIGZhbHNlKTtcclxuICAgICAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLl9sYXN0U2F2ZUlkKSAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdfbGFzdFNhdmVJZCcpO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICB0aGlzLmNhbGNSZXN1bHQgPSBmdW5jdGlvbiAoZGF5VGltZUlkLCBmb29kLCBib29sKSB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB0aGlzLnZpZXdEYXRhLmRheVRpbWVzW2RheVRpbWVJZF0ucmVzdWx0O1xyXG4gICAgICAgICAgICBpZiAoYm9vbCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldICs9IGZvb2Rba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsW2tleV0udmFsdWUgKz0gZm9vZFtrZXldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldIC09IGZvb2Rba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsW2tleV0udmFsdWUgLT0gZm9vZFtrZXldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVNeUZvb2QgPSBmdW5jdGlvbiAobmFtZSkge1xyXG5cclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMudmlld0RhdGEudGFibGVzRGF0YS5teUZvb2RzW25hbWVdO1xyXG4gICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5teUZvb2RzID0gSlNPTi5zdHJpbmdpZnkodGhpcy52aWV3RGF0YS50YWJsZXNEYXRhLm15Rm9vZHMpO1xyXG5cclxuICAgICAgICAgICAgZGF0YVNlcnZpY2UucmVtb3ZlRnJvbUJhc2UobmFtZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRNeUZvb2QgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMudmlld0RhdGEudGFibGVzRGF0YS5teUZvb2RzKSB0aGlzLnZpZXdEYXRhLnRhYmxlc0RhdGEubXlGb29kcyA9IHt9O1xyXG4gICAgICAgICAgICBpZiAodGhpcy52aWV3RGF0YS50YWJsZXNEYXRhLm15Rm9vZHNbbmFtZV0pIHtcclxuICAgICAgICAgICAgICAgIGlmICghY29uZmlybSgn0J/QtdGA0LXQt9Cw0L/QuNGB0LDRgtGMINGB0YPRidC10YHRgtCy0YPRjtGJ0LjQuSDQv9GA0L7QtNGD0LrRgj8nKSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgZGF0YVNlcnZpY2UucmVtb3ZlRnJvbUJhc2UobmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy52aWV3RGF0YS50YWJsZXNEYXRhLm15Rm9vZHNbbmFtZV0gPSB2YWx1ZXM7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLm15Rm9vZHMgPSBKU09OLnN0cmluZ2lmeSh0aGlzLnZpZXdEYXRhLnRhYmxlc0RhdGEubXlGb29kcyk7XHJcblxyXG4gICAgICAgICAgICBkYXRhU2VydmljZS5hZGRUb0Jhc2UobmFtZSwgdmFsdWVzKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvL0xTXHJcblxyXG4gICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5teUZvb2RzKSB0aGlzLnZpZXdEYXRhLnRhYmxlc0RhdGEubXlGb29kcyA9IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2UubXlGb29kcyk7XHJcblxyXG5cclxuXHJcbiAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVEYXRhKSB7XHJcbiAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0JfQsNCz0YDRg9C30LrQsCcsIG1lc3NhZ2U6ICfQl9Cw0LPRgNGD0LfQuNGC0Ywg0YHQvtGF0YDQsNC90LXQvdC90YvQtSDQtNCw0L3QvdGL0LU/J30sICdjb25maXJtJylcclxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZURhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld0RhdGEuZGF5VGltZXMgPSBkYXRhLmRheXNEYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld0RhdGEucmVzdWx0RmluYWwgPSBkYXRhLnJlc3VsdEZpbmFsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkaWV0Q2hvb3NlLmxvYWRMaW1pdHMoKVxyXG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0JfQsNCz0YDRg9C30LrQsCcsIG1lc3NhZ2U6ICfQo9C00LDQu9C40YLRjCDRgdC+0YXRgNCw0L3QtdC90L3Ri9C1INC00LDQvdC90YvQtT8nfSwgJ2NvbmZpcm0nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdzYXZlRGF0YScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnc2F2ZWRMaW1pdHMnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuXHJcblxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiB2aWV3VGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldztcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvbWFpbi1tb2R1bGUvdmlldy1jb21wb25lbnQvdmlldy1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxsZWZ0LXNpZGUtbWVudT48L2xlZnQtc2lkZS1tZW51PlxcclxcbjxkYXl0aW1lLWNob29zZT48L2RheXRpbWUtY2hvb3NlPlxcclxcblxcclxcbjxkaXYgY2xhc3M9XFxcIm1haW4tdmlld1xcXCIgdWktdmlldz48L2Rpdj5cXHJcXG5cXHJcXG48bW9kYWw+PC9tb2RhbD5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwidmlldy10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC9tYWluLW1vZHVsZS92aWV3LWNvbXBvbmVudC90ZW1wbGF0ZS92aWV3LXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAxMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgbW9kYWxUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvbW9kYWwtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgbW9kYWwgPSB7XHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihtb2RhbCkge1xyXG4gICAgICAgIHRoaXMubW9kYWxWaWV3RGF0YSA9IG1vZGFsLm1vZGFsVmlld0RhdGE7XHJcbiAgICAgICAgdGhpcy5jaGVja09wZW4gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZGFsLmdldFN0YXRlKCkgPT09ICdvcGVuJztcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuY2hlY2tUeXBlID0gZnVuY3Rpb24odHlwZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kYWwuZ2V0VHlwZSgpID09PSB0eXBlO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy50eXBlID0gbW9kYWwuZ2V0VHlwZTtcclxuXHJcbiAgICAgICAgdGhpcy5jbG9zZSA9IG1vZGFsLmNsb3NlO1xyXG5cclxuICAgICAgICB0aGlzLnN0b3BQcm9wYWdhdGlvbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IG1vZGFsVGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbW9kYWw7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL21haW4tbW9kdWxlL21vZGFsLXdpbmRvdy1jb21wb25lbnQvbW9kYWwtd2luZG93LWNvbXBvbmVudC5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGRpYXJ5TW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ2RpYXJ5JywgW10pO1xyXG5cclxuZGlhcnlNb2R1bGVcclxuICAgIC5jb21wb25lbnQoJ21lbnUnLCByZXF1aXJlKCcuL21lbnUvbWVudS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ21haW5WaWV3JywgcmVxdWlyZSgnLi9tYWluLXZpZXcvbWFpbi12aWV3LWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgnZGF5VGltZScsIHJlcXVpcmUoJy4vZGF5LXRpbWUvZGF5LXRpbWUtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdmb29kJywgcmVxdWlyZSgnLi9mb29kL2Zvb2QtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdzYXZlTWVudScsIHJlcXVpcmUoJy4vc2F2ZS1tZW51L3NhdmUtbWVudS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ3Jlc3VsdCcsIHJlcXVpcmUoJy4vcmVzdWx0LWNvbXBvbmVudC9yZXN1bHQtY29tcG9uZW50JykpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkaWFyeU1vZHVsZTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvZGlhcnktbW9kdWxlL2luZGV4LmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIG1lbnVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvbWVudS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBtZW51ID0ge1xyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCR3aW5kb3csIGRpZXRDaG9vc2UpIHtcclxuICAgICAgICB0aGlzLmRpZXRzID0gZGlldENob29zZS5kaWV0cztcclxuICAgICAgICB0aGlzLnNldERpZXQgPSBkaWV0Q2hvb3NlLnNldERpZXQ7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9IGRpZXRDaG9vc2UuY2xhc3NOYW1lO1xyXG4gICAgICAgIHRoaXMuc2V0Q2xhc3NOYW1lID0gZGlldENob29zZS5zZXRDbGFzc05hbWU7XHJcblxyXG5cclxuICAgICAgICB0aGlzLnNldExpbWl0cyA9IGRpZXRDaG9vc2Uuc2V0TGltaXRzO1xyXG4gICAgICAgIHRoaXMucmVzZXRDaG9vc2UgPSBkaWV0Q2hvb3NlLnJlc2V0Q2hvb3NlO1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiBtZW51VGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbWVudTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvZGlhcnktbW9kdWxlL21lbnUvbWVudS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgaWQ9XFxcIm1lbnVcXFwiPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJkaWV0LW1lbnVcXFwiPlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiZGlldC10aXR0bGVcXFwiPtCS0LjQtCDQtNC40LXRgtGLOjwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiZGlldC1jaG9vc2VcXFwiPlxcclxcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJkaWV0XFxcIiBuZy1jbGFzcz1cXFwie2FjdGl2ZTogJGN0cmwuZGlldHMucHJvdGVpbnN9XFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2V0RGlldCgncHJvdGVpbnMnKVxcXCI+0JLRi9GB0L7QutC+0L/RgNC+0YLQtdC40L3QvtCy0LDRjyDQutC+0LzQsdC40L3QsNGG0LjRjyDQt9Cw0LzQtdC9PC9zcGFuPlxcclxcbiAgICAgICAgICAgIDxicj5cXHJcXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiZGlldFxcXCIgbmctY2xhc3M9XFxcInthY3RpdmU6ICRjdHJsLmRpZXRzLmNhcmJvaHlkcmF0ZXN9XFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2V0RGlldCgnY2FyYm9oeWRyYXRlcycpXFxcIj7QktGL0YHQvtC60L7Rg9Cz0LvQtdCy0L7QtNC90LDRjyDQutC+0LzQsdC40L3QsNGG0LjRjyDQt9Cw0LzQtdC9PC9zcGFuPlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJwaGFzZS1tZW51XFxcIj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInBoYXNlLXRpdHRsZVxcXCI+0JLRi9Cx0LXRgNC10YLQtSDQktCw0YjRgyDRhNCw0LfRgzo8L2Rpdj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInBoYXNlLWNob29zZVxcXCI+XFxyXFxuXFxyXFxuICAgICAgICAgICAgPGRpdiBuZy1jbGFzcz1cXFwiJGN0cmwuY2xhc3NOYW1lLm5hbWVcXFwiIGNsYXNzPVxcXCJmaXJzdC1waGFzZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldENsYXNzTmFtZSgxKVxcXCI+PHNwYW4+LTwvc3Bhbj4gMSA8c3Bhbj4tPC9zcGFuPjwvZGl2PlxcclxcbiAgICAgICAgICAgIDxkaXYgbmctY2xhc3M9XFxcIiRjdHJsLmNsYXNzTmFtZS5uYW1lXFxcIiBjbGFzcz1cXFwic2Vjb25kLXBoYXNlXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2V0Q2xhc3NOYW1lKDIpXFxcIj48c3Bhbj4tPC9zcGFuPiAyIDxzcGFuPi08L3NwYW4+PC9kaXY+XFxyXFxuICAgICAgICAgICAgPGRpdiBuZy1jbGFzcz1cXFwiJGN0cmwuY2xhc3NOYW1lLm5hbWVcXFwiIGNsYXNzPVxcXCJ0aGlyZC1waGFzZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldENsYXNzTmFtZSgzKVxcXCI+PHNwYW4+LTwvc3Bhbj4gMyA8c3Bhbj4tPC9zcGFuPjwvZGl2PlxcclxcblxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcblxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJjbGVhci1saW1pdHNcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5yZXNldENob29zZSgpXFxcIj7QodCx0YDQvtGB0LjRgtGMINC70LjQvNC40YLRizwvZGl2PlxcclxcbjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJtZW51LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9tZW51L3RlbXBsYXRlL21lbnUtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDE3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IG1haW5WaWV3VGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL21haW4tdmlldy5odG1sJyk7XG5cbmNvbnN0IG1haW5WaWV3ID0ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIChkYXRhU2VydmljZSwgbGltaXRzU2VydmljZSwgJHdpbmRvdykge1xuICAgICAgICBjb25zdCBlbXB0eSA9IHtcbiAgICAgICAgICAgIGVtcHR5OiB0cnVlLFxuICAgICAgICAgICAgbmFtZTogJy0tLS0tLS0tLScsXG4gICAgICAgICAgICBwb3J0aW9uOiAnLS0tJyxcbiAgICAgICAgICAgIGNhcmJvaHlkOiAnLS0tJyxcbiAgICAgICAgICAgIHByb3Q6ICctLS0nLFxuICAgICAgICAgICAgZmF0OiAnLS0tJyxcbiAgICAgICAgICAgIGthbGw6ICctLS0nXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5iYXNlID0gZGF0YVNlcnZpY2UuYmFzZTtcbiAgICAgICAgdGhpcy52aWV3RGF0YSA9IHtcbiAgICAgICAgICAgIGxpbWl0c0RhdGE6IGxpbWl0c1NlcnZpY2UubGltaXRzRGF0YVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlRGF0YSkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVEYXRhKTtcbiAgICAgICAgICAgIHRoaXMudmlld0RhdGEuZGF5VGltZXMgPSBkYXRhLmRheXNEYXRhO1xuICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbCA9IGRhdGEucmVzdWx0RmluYWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXRhU2VydmljZS5nZXREYXlUaW1lc0RhdGEoKVxuICAgICAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB0aGlzLnZpZXdEYXRhLmRheVRpbWVzID0gZGF0YS5kYXRhKTtcblxuICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbCA9IHtcbiAgICAgICAgICAgICAgICBjYXJib2h5ZDogMCxcbiAgICAgICAgICAgICAgICBwcm90OiAwLFxuICAgICAgICAgICAgICAgIGZhdDogMCxcbiAgICAgICAgICAgICAgICBrYWxsOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIHRoaXMuY29tcGFyZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnZpZXdEYXRhLmxpbWl0c0RhdGEubGltaXRzKSByZXR1cm47XG4gICAgICAgICAgICBpZiAodGhpcy52aWV3RGF0YS5saW1pdHNEYXRhLmxpbWl0c1tcItCY0YLQvtCzXCJdW2tleV0gPCB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsW2tleV0pIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgdGhpcy5hZGRGb29kID0gZnVuY3Rpb24oZGF5VGltZUlkLCBmb29kKSB7XG4gICAgICAgICAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMudmlld0RhdGEuZGF5VGltZXNbZGF5VGltZUlkXS5mb29kcztcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9uWzBdLmVtcHR5KSBjb2xsZWN0aW9uLnNwbGljZSgwLCAxKTtcblxuICAgICAgICAgICAgY29sbGVjdGlvbi5wdXNoKGZvb2QpO1xuICAgICAgICAgICAgdGhpcy5jYWxjUmVzdWx0KGRheVRpbWVJZCwgZm9vZCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCkgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnX2xhc3RTYXZlSWQnKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZUZvb2QgPSBmdW5jdGlvbihkYXlUaW1lSWQsIGZvb2QpIHtcbiAgICAgICAgICAgIGxldCBjb2xsZWN0aW9uID0gdGhpcy52aWV3RGF0YS5kYXlUaW1lc1tkYXlUaW1lSWRdLmZvb2RzO1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gY29sbGVjdGlvbi5pbmRleE9mKGZvb2QpO1xuICAgICAgICAgICAgY29sbGVjdGlvbi5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbi5sZW5ndGggPT09IDApIGNvbGxlY3Rpb24ucHVzaChlbXB0eSk7XG4gICAgICAgICAgICB0aGlzLmNhbGNSZXN1bHQoZGF5VGltZUlkLCBmb29kLCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuX2xhc3RTYXZlSWQpICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ19sYXN0U2F2ZUlkJyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy50b2dnbGVEYXlUaW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIHRoaXMudmlld0RhdGEuZGF5VGltZXNbaWRdLnNob3cgPSAhdGhpcy52aWV3RGF0YS5kYXlUaW1lc1tpZF0uc2hvd1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgdGhpcy5jYWxjUmVzdWx0ID0gZnVuY3Rpb24gKGRheVRpbWVJZCwgZm9vZCwgYm9vbCkge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHRoaXMudmlld0RhdGEuZGF5VGltZXNbZGF5VGltZUlkXS5yZXN1bHQ7XG4gICAgICAgICAgICBpZiAoYm9vbCkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gKz0gZm9vZFtrZXldO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsW2tleV0gKz0gZm9vZFtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSAtPSBmb29kW2tleV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld0RhdGEucmVzdWx0RmluYWxba2V5XSAtPSBmb29kW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogbWFpblZpZXdUZW1wbGF0ZVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBtYWluVmlldztcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvZGlhcnktbW9kdWxlL21haW4tdmlldy9tYWluLXZpZXctY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJtYWluLXZpZXdcXFwiPlxcbiAgICA8ZGF5LXRpbWUgbmctcmVwZWF0PVxcXCJ0aW1lIGluICRjdHJsLnZpZXdEYXRhLmRheVRpbWVzXFxcIiB0aW1lPVxcXCJ0aW1lXFxcIiBiYXNlPVxcXCIkY3RybC5iYXNlXFxcIiBkYXktdGltZS1saW1pdHM9XFxcIiRjdHJsLnZpZXdEYXRhLmxpbWl0c0RhdGFcXFwiIGFkZD1cXFwiJGN0cmwuYWRkRm9vZChkYXlUaW1lSWQsIGZvb2QpXFxcIiByZW1vdmU9XFxcIiRjdHJsLnJlbW92ZUZvb2QoZGF5VGltZUlkLCBmb29kKVxcXCIgdG9nZ2xlPVxcXCIkY3RybC50b2dnbGVEYXlUaW1lKGlkKVxcXCI+PC9kYXktdGltZT5cXG5cXG4gICAgPGRpdiBjbGFzcz1cXFwicmVzdWx0XFxcIj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInJlc3VsdC10aXR0bGVcXFwiPtCY0YLQvtCz0L48L2Rpdj5cXG5cXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzPVxcXCJ0YWJsZS1yZXN1bHRcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInRhYmxlLXJlc3VsdC10aXR0bGVcXFwiPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicmVzdWx0LW5vLW5hbWVcXFwiPi0tLS0tLS0tLS0tLS0tLS08L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJwb3J0aW9uXFxcIj7Qn9C+0YDRhtC40Y8o0LPRgCk8L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjYXJib2h5ZFxcXCI+0KPQs9C70LXQstC+0LTRizwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInByb3RcXFwiPtCR0LXQu9C60Lg8L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJmYXRcXFwiPtCW0LjRgNGLPC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwia2FsbFxcXCI+0JrQsNC70L7RgNC40Lg8L3NwYW4+XFxuICAgICAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwicmVzdWx0LWZpbmFsXFxcIj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm5hbWVcXFwiPjwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInBvcnRpb25cXFwiPi0tLTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNhcmJvaHlkXFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtbGltaXQnOiAkY3RybC5jb21wYXJlKCdjYXJib2h5ZCcpfVxcXCI+e3sgJGN0cmwudmlld0RhdGEucmVzdWx0RmluYWwuY2FyYm9oeWQgfX0ge3snKCcgKyAkY3RybC52aWV3RGF0YS5saW1pdHNEYXRhLmxpbWl0c1tcXFwi0JjRgtC+0LNcXFwiXS5jYXJib2h5ZCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicHJvdFxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlLWxpbWl0JzogJGN0cmwuY29tcGFyZSgncHJvdCcpfVxcXCI+e3sgJGN0cmwudmlld0RhdGEucmVzdWx0RmluYWwucHJvdCAgfX0ge3snKCcgKyAkY3RybC52aWV3RGF0YS5saW1pdHNEYXRhLmxpbWl0c1tcXFwi0JjRgtC+0LNcXFwiXS5wcm90ICsgJyknIHwgbGltaXQgfX08L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJmYXRcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2ZhdCcpfVxcXCI+e3sgJGN0cmwudmlld0RhdGEucmVzdWx0RmluYWwuZmF0IH19IHt7JygnICsgJGN0cmwudmlld0RhdGEubGltaXRzRGF0YS5saW1pdHNbXFxcItCY0YLQvtCzXFxcIl0uZmF0ICsgJyknIHwgbGltaXQgfX08L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJrYWxsXFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtbGltaXQnOiAkY3RybC5jb21wYXJlKCdrYWxsJyl9XFxcIj57eyAkY3RybC52aWV3RGF0YS5yZXN1bHRGaW5hbC5rYWxsIH19IHt7JygnICsgJGN0cmwudmlld0RhdGEubGltaXRzRGF0YS5saW1pdHNbXFxcItCY0YLQvtCzXFxcIl0ua2FsbCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcbiAgICAgICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgPC9zZWN0aW9uPlxcbiAgICA8L2Rpdj5cXG48L2Rpdj5cXG48c2F2ZS1tZW51IGRheS10aW1lcy1kYXRhPVxcXCIkY3RybC52aWV3RGF0YS5kYXlUaW1lc1xcXCIgcmVzdWx0PVxcXCIkY3RybC52aWV3RGF0YS5yZXN1bHRGaW5hbFxcXCI+PC9zYXZlLW1lbnU+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcIm1haW4tdmlldy5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC9kaWFyeS1tb2R1bGUvbWFpbi12aWV3L3RlbXBsYXRlL21haW4tdmlldy5odG1sXG4gKiogbW9kdWxlIGlkID0gMTlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGRheVRpbWVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvZGF5LXRpbWUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgZGF5VGltZSA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgYmFzZTogJzwnLFxyXG4gICAgICAgIGRheXRpbWVzOiAnPCcsXHJcbiAgICAgICAgYWRkOiAnJicsXHJcbiAgICAgICAgcmVtb3ZlOiAnJicsXHJcbiAgICAgICAgZGF5VGltZUxpbWl0czogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oZGF0YVNlcnZpY2UsIHZhbGlkYXRpb25TZXJ2aWNlLCBjYWxjdWxhdGlvblNlcnZpY2UsICRzY29wZSwgJHN0YXRlUGFyYW1zLCBpbmRleFNlcnZpY2UpIHtcclxuICAgICAgICBsZXQgZGF5dGltZSA9ICRzdGF0ZVBhcmFtcy5kYXl0aW1lO1xyXG4gICAgICAgIHRoaXMuaW5kZXggPSBpbmRleFNlcnZpY2UoZGF5dGltZSk7XHJcblxyXG4gICAgICAgIHZhciB0ZXh0ID0gJyc7XHJcbiAgICAgICAgdGhpcy5vbklucHV0ID0gZnVuY3Rpb24oc3RyKSB7XHJcbiAgICAgICAgICAgIHRleHQgPSBzdHI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5saW1pdHMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF5VGltZUxpbWl0cy5saW1pdHMpIHJldHVybiB0aGlzLmRheVRpbWVMaW1pdHMubGltaXRzW3RoaXMuZGF5dGltZXNbdGhpcy5pbmRleF0uZGF5VGltZV07XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jb21wYXJlID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5saW1pdHMoKSkgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5saW1pdHMoKVtrZXldIDwgdGhpcy5kYXl0aW1lc1t0aGlzLmluZGV4XS5yZXN1bHRba2V5XSkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVGb29kID0gZnVuY3Rpb24oZm9vZCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZSh7ZGF5VGltZUlkOiB0aGlzLmluZGV4LCBmb29kOiBmb29kfSlcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEZvb2QgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHBvcnRpb24gPSBNYXRoLnJvdW5kKCt0aGlzLnBvcnRpb24pO1xyXG4gICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZm9vZE5hbWUgPyB0aGlzLmZvb2ROYW1lLnRpdGxlIDogdGV4dDtcclxuXHJcbiAgICAgICAgICAgIC8v0J/RgNC+0LLQtdGA0LjRgtGMINC/0L7Qu9GPINCy0LLQvtC00LAsINCy0YvRh9C40YHQu9C40YLRjCDQt9C90LDRh9C10L3QuNGPXHJcbiAgICAgICAgICAgIGlmICghdmFsaWRhdGlvblNlcnZpY2UuZm9vZEFkZFZhbGlkYXRpb24obmFtZSwgcG9ydGlvbikpIHJldHVybjtcclxuICAgICAgICAgICAgdmFyIGZvb2QgPSBjYWxjdWxhdGlvblNlcnZpY2UuY2FsY3VsYXRlVmFsdWVzKG5hbWUsIHBvcnRpb24pO1xyXG5cclxuICAgICAgICAgICAgLy/QlNC+0LHQsNCy0LjRgtGMINCyINC80LDRgdGB0LjQslxyXG4gICAgICAgICAgICB0aGlzLmFkZCh7ZGF5VGltZUlkOiB0aGlzLmRheXRpbWVzW3RoaXMuaW5kZXhdLmlkLCBmb29kOiBmb29kfSk7XHJcblxyXG4gICAgICAgICAgICAvL9Ce0YfQuNGB0YLQuNGC0Ywg0L/QvtC70Y8g0LLQstC+0LTQsFxyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnYW5ndWNvbXBsZXRlLWFsdDpjbGVhcklucHV0Jyk7XHJcbiAgICAgICAgICAgIHRoaXMucG9ydGlvbiA9Jyc7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuZW50ZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSAhPT0gMTMpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5hZGRGb29kKCk7XHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogZGF5VGltZVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRheVRpbWU7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL2RpYXJ5LW1vZHVsZS9kYXktdGltZS9kYXktdGltZS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcImRheS10aW1lXFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiaW5wdXRcXFwiPlxcclxcbiAgICAgICAgPGZvcm0+XFxyXFxuICAgICAgICAgICAgPGxhYmVsPtCd0LDQuNC80LXQvdC+0LLQsNC90LjQtTogPGFuZ3Vjb21wbGV0ZS1hbHQgbmcta2V5cHJlc3M9XFxcIiRjdHJsLmVudGVyKCRldmVudClcXFwiIGlkPVxcXCJleDFcXFwiIHBsYWNlaG9sZGVyPVxcXCLQktCy0LXQtNC40YLQtSDQv9GA0L7QtNGD0LrRglxcXCIgcGF1c2U9XFxcIjEwMFxcXCIgc2VsZWN0ZWQtb2JqZWN0PVxcXCIkY3RybC5mb29kTmFtZVxcXCIgbG9jYWwtZGF0YT1cXFwiJGN0cmwuYmFzZS5mb29kcy5rZXlzXFxcIiBzZWFyY2gtZmllbGRzPVxcXCJmb29kTmFtZVxcXCIgdGl0bGUtZmllbGQ9XFxcImZvb2ROYW1lXFxcIiBtaW5sZW5ndGg9XFxcIjFcXFwiIGlucHV0LWNoYW5nZWQ9XFxcIiRjdHJsLm9uSW5wdXRcXFwiIGlucHV0LWNsYXNzPVxcXCJmb29kIGZvcm0tY29udHJvbC1zbWFsbFxcXCIgbWF0Y2gtY2xhc3M9XFxcImhpZ2hsaWdodFxcXCI+PC9hbmd1Y29tcGxldGUtYWx0PjwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgPGJyPlxcclxcblxcclxcbiAgICAgICAgICAgIDxsYWJlbD7Qn9C+0YDRhtC40Y8o0LPRgCk6IDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwicG9ydGlvbi1pbnB1dFxcXCIgc2l6ZT1cXFwiMlxcXCIgbmctbW9kZWw9XFxcIiRjdHJsLnBvcnRpb25cXFwiIG5nLWtleXByZXNzPVxcXCIkY3RybC5lbnRlcigkZXZlbnQpXFxcIi8+PC9sYWJlbD5cXHJcXG4gICAgICAgIDwvZm9ybT5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImFkZC1idXR0b25cXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5hZGRGb29kKClcXFwiPis8L2Rpdj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuXFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcInRhYmxlLWJvcmRlclxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0YWJsZVxcXCI+XFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidGFibGUtdGl0dGxlXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm5hbWVcXFwiPtCd0LDQuNC80LXQvdC+0LLQsNC90LjQtSDQv9GA0L7QtNGD0LrRgtCwPC9zcGFuPlxcclxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicG9ydGlvblxcXCI+0J/QvtGA0YbQuNGPICjQs9GAKTwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNhcmJvaHlkXFxcIj7Qo9Cz0LvQtdCy0L7QtNGLPC9zcGFuPlxcclxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicHJvdFxcXCI+0JHQtdC70LrQuDwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImZhdFxcXCI+0JbQuNGA0Ys8L3NwYW4+XFxyXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJrYWxsXFxcIj7QmtCw0LvQvtGA0LjQuDwvc3Bhbj5cXHJcXG4gICAgICAgICAgICA8L2Rpdj5cXHJcXG5cXHJcXG5cXHJcXG4gICAgICAgICAgICA8Zm9vZCBuZy1yZXBlYXQ9XFxcImZvb2QgaW4gJGN0cmwuZGF5dGltZXNbJGN0cmwuaW5kZXhdLmZvb2RzXFxcIiBmb29kPVxcXCJmb29kXFxcIiByZW1vdmU9XFxcIiRjdHJsLnJlbW92ZUZvb2QoZm9vZClcXFwiPjwvZm9vZD5cXHJcXG5cXHJcXG5cXHJcXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJzdW1tYXJ5XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm5hbWVcXFwiPtCf0L7QtNGL0YLQvtCzPC9zcGFuPlxcclxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicG9ydGlvblxcXCI+LS0tPC9zcGFuPlxcclxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiY2FyYm9oeWRcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2NhcmJvaHlkJyl9XFxcIj57eyAkY3RybC5kYXl0aW1lc1skY3RybC5pbmRleF0ucmVzdWx0LmNhcmJvaHlkIH19IHt7JygnICsgJGN0cmwubGltaXRzKCkuY2FyYm9oeWQgKyAnKScgfCBsaW1pdCB9fTwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInByb3RcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ3Byb3QnKX1cXFwiPnt7ICRjdHJsLmRheXRpbWVzWyRjdHJsLmluZGV4XS5yZXN1bHQucHJvdCB9fSB7eycoJyArICRjdHJsLmxpbWl0cygpLnByb3QgKyAnKScgfCBsaW1pdCB9fTwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImZhdFxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlLWxpbWl0JzogJGN0cmwuY29tcGFyZSgnZmF0Jyl9XFxcIj57eyAkY3RybC5kYXl0aW1lc1skY3RybC5pbmRleF0ucmVzdWx0LmZhdCB9fSB7eycoJyArICRjdHJsLmxpbWl0cygpLmZhdCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcclxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwia2FsbFxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlLWxpbWl0JzogJGN0cmwuY29tcGFyZSgna2FsbCcpfVxcXCI+e3sgJGN0cmwuZGF5dGltZXNbJGN0cmwuaW5kZXhdLnJlc3VsdC5rYWxsIH19IHt7JygnICsgJGN0cmwubGltaXRzKCkua2FsbCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcblxcclxcbjwvZGl2PlxcclxcblxcclxcblxcclxcbjxkaXYgY2xhc3M9XFxcImJyXFxcIj48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwiZGF5LXRpbWUtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvZGlhcnktbW9kdWxlL2RheS10aW1lL3RlbXBsYXRlL2RheS10aW1lLXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAyMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgZm9vZFRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9mb29kLXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IGZvb2QgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGZvb2Q6ICc8JyxcclxuICAgICAgICByZW1vdmU6ICcmJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY2hlY2tFbXB0eUZvb2QgPSBmdW5jdGlvbihmb29kKSB7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihmb29kLmthbGwpKSByZXR1cm4gJ2VtcHR5J1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGZvb2RUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmb29kO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvZm9vZC9mb29kLWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwiZm9vZFxcXCIgbmctY2xhc3M9XFxcIiRjdHJsLmNoZWNrRW1wdHlGb29kKCRjdHJsLmZvb2QpXFxcIj5cXHJcXG4gICAgPHNwYW4gY2xhc3M9XFxcIm5hbWVcXFwiPnt7ICRjdHJsLmZvb2QubmFtZSB9fTwvc3Bhbj5cXHJcXG4gICAgPHNwYW4gY2xhc3M9XFxcInBvcnRpb25cXFwiPnt7ICRjdHJsLmZvb2QucG9ydGlvbiB9fTwvc3Bhbj5cXHJcXG4gICAgPHNwYW4gY2xhc3M9XFxcImNhcmJvaHlkXFxcIj57eyAkY3RybC5mb29kLmNhcmJvaHlkIH19PC9zcGFuPlxcclxcbiAgICA8c3BhbiBjbGFzcz1cXFwicHJvdFxcXCI+e3sgJGN0cmwuZm9vZC5wcm90IH19PC9zcGFuPlxcclxcbiAgICA8c3BhbiBjbGFzcz1cXFwiZmF0XFxcIj57eyAkY3RybC5mb29kLmZhdCB9fTwvc3Bhbj5cXHJcXG4gICAgPHNwYW4gY2xhc3M9XFxcImthbGxcXFwiPnt7ICRjdHJsLmZvb2Qua2FsbCB9fTwvc3Bhbj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwicmVtb3ZlLWZvb2RcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5yZW1vdmUoe2Zvb2Q6ICRjdHJsLmZvb2R9KVxcXCI+PC9kaXY+XFxyXFxuPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcImZvb2QtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvZGlhcnktbW9kdWxlL2Zvb2QvdGVtcGxhdGUvZm9vZC10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMjNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHNhdmVNZW51VGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL3NhdmUtbWVudS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBzYXZlTWVudSA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgZGF5VGltZXNEYXRhOiAnPCcsXHJcbiAgICAgICAgcmVzdWx0OiAnPCdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkd2luZG93LCBtb2RhbCkge1xyXG5cclxuICAgICAgICB0aGlzLnNhdmVGb3JQcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9ICR3aW5kb3cubG9jYWxTdG9yYWdlLmRheXNEYXRhID8gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5kYXlzRGF0YSkgOiBbXTtcclxuICAgICAgICAgICAgLy/Qn9GA0L7QstC10YDQutC4XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA+IDAgJiYgbmV3IERhdGUoZGF0YVtkYXRhLmxlbmd0aCAtIDFdLnNhdmVUaW1lKS5nZXREYXkoKSA9PT0gbmV3IERhdGUoKS5nZXREYXkoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZGF0YS5sZW5ndGggLSAxXS5zYXZlVGltZUlkID09PSAkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwINGB0L7RhdGA0LDQvdC10L3QuNGPJywgbWVzc2FnZTogJ9Cd0LXRgiDQvdC+0LLRi9GFINC00LDQvdC90YvRhSDQtNC70Y8g0YHQvtGF0YDQsNC90LXQvdC40Y8nfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J/QvtC00YLQstC10YDQtNC40YLQtScsIG1lc3NhZ2U6ICfQn9C10YDQtdC30LDQv9C40YHQsNGC0Ywg0LTQsNC90L3Ri9C1INC/0LXRh9Cw0YLQuCDRgtC10LrRg9GI0LXQs9C+INC00L3Rjz8nfSwgJ2NvbmZpcm0nKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wb3AoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v0KHQvtGF0YDQsNC90LXQvdC40LVcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaWQgPSAoTWF0aC5yYW5kb20oKSArICcnKS5zbGljZSgyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRheURhdGEgPSB7c2F2ZVRpbWU6IGRhdGUsIGRheVRpbWVzOiB0aGlzLmRheVRpbWVzRGF0YSwgcmVzdWx0OiB0aGlzLnJlc3VsdCwgc2F2ZVRpbWVJZDogaWR9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goZGF5RGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLmRheXNEYXRhID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLl9sYXN0U2F2ZUlkID0gaWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ch0L7RhdGA0LDQvdC10L3QuNC1INC00LDQvdC90YvRhScsIG1lc3NhZ2U6ICfQlNCw0L3QvdGL0LUg0YPRgdC/0LXRiNC90L4g0YHQvtGF0YDQsNC90LXQvdGLJ30sICdhbGVydCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvL9Ch0L7RhdGA0LDQvdC10L3QuNC1XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSAoTWF0aC5yYW5kb20oKSArICcnKS5zbGljZSgyKTtcclxuICAgICAgICAgICAgICAgIGxldCBkYXlEYXRhID0ge3NhdmVUaW1lOiBkYXRlLCBkYXlUaW1lczogdGhpcy5kYXlUaW1lc0RhdGEsIHJlc3VsdDogdGhpcy5yZXN1bHQsIHNhdmVUaW1lSWQ6IGlkfTtcclxuICAgICAgICAgICAgICAgIGRhdGEucHVzaChkYXlEYXRhKTtcclxuICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLmRheXNEYXRhID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCA9IGlkO1xyXG4gICAgICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQodC+0YXRgNCw0L3QtdC90LjQtSDQtNCw0L3QvdGL0YUnLCBtZXNzYWdlOiAn0JTQsNC90L3Ri9C1INGD0YHQv9C10YjQvdC+INGB0L7RhdGA0LDQvdC10L3Riyd9LCAnYWxlcnQnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZVByaW50U2F2ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLmRheXNEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Cj0LTQsNC70LXQvdC40LUnLCBtZXNzYWdlOiAn0KPQtNCw0LvQuNGC0Ywg0YHQvtGF0YDQsNC90LXQvdC40Y8g0LTQu9GPINC/0LXRh9Cw0YLQuD8nfSwgJ2NvbmZpcm0nKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnZGF5c0RhdGEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnX2xhc3RTYXZlSWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICB0aGlzLnByZXZpZXcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSAkd2luZG93LmxvY2FsU3RvcmFnZS5kYXlzRGF0YTtcclxuICAgICAgICAgICAgaWYgKCFkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ch0L7RhdGA0LDQvdC10L3QuNC1JywgbWVzc2FnZTogJ9Ch0L7RhdGA0LDQvdC40YLRjCDRgtC10LrRg9GJ0LjQtSDQtNCw0L3QvdGL0LUg0LTQu9GPINC/0YDQvtGB0LzQvtGC0YDQsD8nfSwgJ2NvbmZpcm0nKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlRm9yUHJpbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcuL3ByaW50Lmh0bWwnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwINC/0YDQtdC00L/RgNC+0YHQvNC+0YLRgNCwJywgbWVzc2FnZTogJ9Cd0LXRgiDQtNCw0L3QvdGL0YUg0LTQu9GPINC/0YDQvtGB0LzQvtGC0YDQsCEnfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhW2RhdGEubGVuZ3RoIC0gMV0uc2F2ZVRpbWVJZCAhPT0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UuX2xhc3RTYXZlSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ch0L7RhdGA0LDQvdC10L3QuNC1JywgbWVzc2FnZTogJ9Ch0L7RhdGA0LDQvdC40YLRjCDRgtC10LrRg9GJ0LjQtSDQtNCw0L3QvdGL0LUg0LTQu9GPINC/0YDQvtGB0LzQvtGC0YDQsD8nfSwgJ2NvbmZpcm0nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVGb3JQcmludCgpLnRoZW4oKCkgPT4gJHdpbmRvdy5vcGVuKCcuL3ByaW50Lmh0bWwnKSwgKCkgPT4gJHdpbmRvdy5vcGVuKCcuL3ByaW50Lmh0bWwnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiAkd2luZG93Lm9wZW4oJy4vcHJpbnQuaHRtbCcpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcuL3ByaW50Lmh0bWwnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zYXZlRGF0YSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ch0L7RhdGA0LDQvdC10L3QuNC1JywgbWVzc2FnZTogJ9Ch0L7RhdGA0LDQvdC40YLRjCDRgtC10LrRg9GJ0LjQtSDQtNCw0L3QvdGL0LU/J30sICdjb25maXJtJylcclxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlRGF0YSA9IEpTT04uc3RyaW5naWZ5KHtkYXlzRGF0YTogdGhpcy5kYXlUaW1lc0RhdGEsIHJlc3VsdEZpbmFsOiB0aGlzLnJlc3VsdH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkd2luZG93LnNlc3Npb25TdG9yYWdlLnNhdmVkTGltaXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVkTGltaXRzID0gJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zYXZlZExpbWl0cztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCEkd2luZG93LnNlc3Npb25TdG9yYWdlLnNhdmVkTGltaXRzICYmICR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVkTGltaXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3NhdmVkTGltaXRzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0KHQvtGF0YDQsNC90LXQvdC40LUg0LTQsNC90L3Ri9GFJywgbWVzc2FnZTogJ9CU0LDQvdC90YvQtSDRg9GB0L/QtdGI0L3QviDRgdC+0YXRgNCw0L3QtdC90YsnfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZURhdGEgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0KPQtNCw0LvQtdC90LjQtScsIG1lc3NhZ2U6ICfQo9C00LDQu9C40YLRjCDRgdC+0YXRgNCw0L3QtdC90L3Ri9C1INC00LDQvdC90YvQtT8nfSwgJ2NvbmZpcm0nKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnc2F2ZURhdGEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnc2F2ZWRMaW1pdHMnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQo9C00LDQu9C10L3QuNC1JywgbWVzc2FnZTogJ9CU0LDQvdC90YvQtSDRg9GB0L/QtdGI0L3QviDRg9C00LDQu9C10L3Riyd9LCAnYWxlcnQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwJywgbWVzc2FnZTogJ9Cd0LXRgiDRgdC+0YXRgNCw0L3QtdC90L3Ri9GFINC00LDQvdC90YvRhSd9LCAnYWxlcnQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogc2F2ZU1lbnVUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzYXZlTWVudTtcclxuXHJcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvc2F2ZS1tZW51L3NhdmUtbWVudS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcInNhdmUtbWVudVxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcInRpdGxlXFxcIj7Qo9C/0YDQsNCy0LvQtdC90LjQtSDQtNCw0L3QvdGL0LzQuDwvZGl2PlxcclxcblxcclxcbiAgICA8ZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYnV0dG9uIHNhdmUtYnV0dG9uXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2F2ZURhdGEoKVxcXCI+0KHQvtGF0YDQsNC90LjRgtGMINC40LfQvNC10L3QtdC90LjRjzwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYnV0dG9uIHJlbW92ZS1kYXRhXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwucmVtb3ZlRGF0YSgpXFxcIj7Qo9C00LDQu9C40YLRjCDRgdC+0YXRgNCw0L3QtdC90LjRjzwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwidGl0bGVcXFwiPtCU0LvRjyDQv9C10YfQsNGC0Lg8L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwicHJpbnQtbWVudVxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJidXR0b24gdG8tcHJpbnRcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5wcmV2aWV3KClcXFwiPtCf0YDQtdC00L/RgNC+0YHQvNC+0YLRgDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYnV0dG9uIHByaW50LXRvLWxvY2FsU3RvcmFnZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNhdmVGb3JQcmludCgpXFxcIj7QodC+0YXRgNCw0L3QuNGC0Ywg0LTQu9GPINC/0LXRh9Cw0YLQuDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYnV0dG9uIHJlbW92ZS1wcmludC1sb2NhbFN0b3JhZ2VcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5yZW1vdmVQcmludFNhdmVzKClcXFwiPtCj0LTQsNC70LjRgtGMINGB0L7RhdGA0LDQvdC10L3QuNGPPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcbjwvZGl2PlxcclxcblxcclxcblxcclxcbjxkaXYgY2xhc3M9XFxcImJyXFxcIj48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwic2F2ZS1tZW51LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9zYXZlLW1lbnUvdGVtcGxhdGUvc2F2ZS1tZW51LXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAyNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgcmVzdWx0VGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL3Jlc3VsdC10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCByZXN1bHQgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIHJlc3VsdDogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24obGltaXRzU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMubGltaXRzRGF0YSA9IGxpbWl0c1NlcnZpY2UubGltaXRzRGF0YTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjUGVyY2VudCA9IGZ1bmN0aW9uKHZhbHVlLCBsaW1pdCkge1xyXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm4gJzAlJztcclxuICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSAvIChsaW1pdCAvIDEwMCkgKS50b0ZpeGVkKCkgKyAnJSc7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjR3JhcGggPSBmdW5jdGlvbih2YWx1ZSwgbGltaXQpIHtcclxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICBsZXQgcGVyY2VudCA9ICh2YWx1ZSAvIChsaW1pdCAvIDEwMCkgKS50b0ZpeGVkKCk7XHJcbiAgICAgICAgICAgIGxldCBjb2xvciA9IHBlcmNlbnQgPiAxMDAgPyAncmdiYSgyMDIsIDIyLCA0MSwgMC4yKScgOiAncmdiYSgyNywgMjAxLCAxNDIsIDAuMSknO1xyXG4gICAgICAgICAgICBpZiAocGVyY2VudCA+IDEwMCkgcGVyY2VudCA9IDEwMDtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6IGNvbG9yLFxyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogcGVyY2VudCArICclJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiByZXN1bHRUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSByZXN1bHQ7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL2RpYXJ5LW1vZHVsZS9yZXN1bHQtY29tcG9uZW50L3Jlc3VsdC1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcInJlc3VsdFxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcInJlc3VsdC10aXRsZVxcXCI+0JjRgtC+0LMg0LTQvdGPPC9kaXY+XFxyXFxuXFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcInJlc3VsdC10YWJsZVxcXCIgbmctcmVwZWF0PVxcXCIoa2V5LCBlbGVtZW50KSBpbiAkY3RybC5yZXN1bHRcXFwiPlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwidGl0bGVcXFwiIG5nLWNsYXNzPVxcXCJ7fVxcXCI+XFxyXFxuICAgICAgICAgICAge3tlbGVtZW50Lm5hbWV9fSA8c3BhbiBuZy1pZj1cXFwiISEkY3RybC5saW1pdHNEYXRhLmxpbWl0c1xcXCI+KG1heCB7eyRjdHJsLmxpbWl0c0RhdGEubGltaXRzWyfQmNGC0L7QsyddW2tleV19fSk8L3NwYW4+XFxyXFxuICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInZhbHVlXFxcIiBuZy1jbGFzcz1cXFwieydsaW1pdHMnOiAhISRjdHJsLmxpbWl0c0RhdGEubGltaXRzfVxcXCI+XFxyXFxuICAgICAgICAgICAge3tlbGVtZW50LnZhbHVlfX1cXHJcXG4gICAgICAgICAgICA8c3BhbiBuZy1pZj1cXFwiISEkY3RybC5saW1pdHNEYXRhLmxpbWl0c1xcXCI+e3sgJGN0cmwuY2FsY1BlcmNlbnQoZWxlbWVudC52YWx1ZSwgJGN0cmwubGltaXRzRGF0YS5saW1pdHNbJ9CY0YLQvtCzJ11ba2V5XSkgfX08L3NwYW4+XFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZ3JhcGhcXFwiIG5nLWlmPVxcXCIhISRjdHJsLmxpbWl0c0RhdGEubGltaXRzXFxcIiBuZy1zdHlsZT1cXFwiJGN0cmwuY2FsY0dyYXBoKGVsZW1lbnQudmFsdWUsICRjdHJsLmxpbWl0c0RhdGEubGltaXRzWyfQmNGC0L7QsyddW2tleV0pXFxcIj48L2Rpdj5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cXHJcXG5cXHJcXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwicmVzdWx0LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9yZXN1bHQtY29tcG9uZW50L3RlbXBsYXRlL3Jlc3VsdC10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMjdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHRhYmxlTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3RhYmxlJywgW10pO1xyXG5cclxudGFibGVNb2R1bGVcclxuICAgIC5jb21wb25lbnQoJ3RhYmxlVmlldycsIHJlcXVpcmUoJy4vdGFibGUtdmlldy1jb21wb25lbnQvdGFibGUtdmlldy1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ3RhYmxlQWRkJywgcmVxdWlyZSgnLi9hZGQtdG8tdGFibGUtY29tcG9uZW50L2FkZC10by10YWJsZS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ2Zvb2RUYWJsZScsIHJlcXVpcmUoJy4vdGFibGUtY29tcG9uZW50L3RhYmxlLWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgnc3RvcmFnZVRhYmxlJywgcmVxdWlyZSgnLi9zdG9yYWdlLXRhYmxlLWNvbXBvbmVudC9zdG9yYWdlLXRhYmxlLWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgndGFibGVzJywgcmVxdWlyZSgnLi9zaW5nbGUtcGFnZS10YWJsZXMtY29tcG9uZW50L3NpbmdsZS1wYWdlLXRhYmxlcy1jb21wb25lbnQnKSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRhYmxlTW9kdWxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvaW5kZXguanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHRhYmxlVmlld1RlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS90YWJsZS12aWV3LXRlbXBsYXRlLmh0bWwnKTtcblxuY29uc3QgdGFibGVWaWV3ID0ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGRhdGFTZXJ2aWNlLCAkd2luZG93KSB7XG4gICAgICAgIGRhdGFTZXJ2aWNlLmdldFRhYmxlRGF0YSgpXG4gICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9vZHNPYmpzID0gZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5teUZvb2RzKSB0aGlzLm15Rm9vZHMgPSBKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLm15Rm9vZHMpO1xuXG4gICAgICAgIHRoaXMucmVtb3ZlTXlGb29kID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMubXlGb29kc1tuYW1lXTtcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLm15Rm9vZHMgPSBKU09OLnN0cmluZ2lmeSh0aGlzLm15Rm9vZHMpO1xuXG4gICAgICAgICAgICBkYXRhU2VydmljZS5yZW1vdmVGcm9tQmFzZShuYW1lKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmFkZE15Rm9vZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlcykge1xuICAgICAgICAgICAgaWYgKHRoaXMubXlGb29kc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIGlmICghY29uZmlybSgn0J/QtdGA0LXQt9Cw0L/QuNGB0LDRgtGMINGB0YPRidC10YHRgtCy0YPRjtGJ0LjQuSDQv9GA0L7QtNGD0LrRgj8nKSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGRhdGFTZXJ2aWNlLnJlbW92ZUZyb21CYXNlKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5teUZvb2RzW25hbWVdID0gdmFsdWVzO1xuICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UubXlGb29kcyA9IEpTT04uc3RyaW5naWZ5KHRoaXMubXlGb29kcyk7XG5cbiAgICAgICAgICAgIGRhdGFTZXJ2aWNlLmFkZFRvQmFzZShuYW1lLCB2YWx1ZXMpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogdGFibGVWaWV3VGVtcGxhdGVcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB0YWJsZVZpZXc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS12aWV3LWNvbXBvbmVudC90YWJsZS12aWV3LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPHRhYmxlLWFkZCBhZGQtbXktZm9vZD1cXFwiJGN0cmwuYWRkTXlGb29kKG5hbWUsIHZhbHVlcylcXFwiPjwvdGFibGUtYWRkPlxcclxcblxcclxcbjxkaXYgY2xhc3M9XFxcInRhYmxlLWNvbnRhaW5lclxcXCI+XFxyXFxuICAgIDxmb29kLXRhYmxlIG5nLXJlcGVhdD1cXFwiZm9vZHNPYmogaW4gJGN0cmwuZm9vZHNPYmpzXFxcIiBmb29kcy1vYmo9XFxcImZvb2RzT2JqXFxcIj48L2Zvb2QtdGFibGU+XFxyXFxuICAgIDxzdG9yYWdlLXRhYmxlIG15LWZvb2RzPVxcXCIkY3RybC5teUZvb2RzXFxcIiByZW1vdmUtbXktZm9vZD1cXFwiJGN0cmwucmVtb3ZlTXlGb29kKG5hbWUpXFxcIj48L3N0b3JhZ2UtdGFibGU+XFxyXFxuPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcInRhYmxlLXZpZXctdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLXZpZXctY29tcG9uZW50L3RlbXBsYXRlL3RhYmxlLXZpZXctdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDMwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBhZGRUb1RhYmxlVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBhZGRUb1RhYmxlID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBteUZvb2RzOiAnPCcsXHJcbiAgICAgICAgcmVtb3ZlTXlGb29kOiAnJicsXHJcbiAgICAgICAgYWRkTXlGb29kOiAnJidcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAodmFsaWRhdGlvblNlcnZpY2UpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygndGVzdCcpO1xyXG4gICAgICAgIHRoaXMudmFsdWVzID0gWzAsIDAsIDAsIDAsIDBdO1xyXG5cclxuICAgICAgICB0aGlzLmFkZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudCAmJiBldmVudC5rZXlDb2RlICE9PSAxMykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52YWx1ZXMuZm9yRWFjaCgodmFsdWUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlc1tpbmRleF0gPSArdmFsdWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICghdmFsaWRhdGlvblNlcnZpY2UuYWRkTXlGb29kVmFsaWRhdGlvbih0aGlzLm5hbWUsIHRoaXMudmFsdWVzKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGRNeUZvb2Qoe25hbWU6IHRoaXMubmFtZSwgdmFsdWVzOiB0aGlzLnZhbHVlc30pO1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlcyA9IFswLCAwLCAwLCAwLCAwXTtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gJyc7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbihuYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTXlGb29kKHtuYW1lOiBuYW1lfSlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGFkZFRvVGFibGVUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBhZGRUb1RhYmxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvYWRkLXRvLXRhYmxlLWNvbXBvbmVudC9hZGQtdG8tdGFibGUtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJhZGQtdG8tdGFibGUtZm9ybVxcXCI+XFxyXFxuICAgIDxoMyBjbGFzcz1cXFwiYWRkLWZvcm0tdGl0bGVcXFwiPtCU0L7QsdCw0LLQuNGC0Ywg0L/RgNC+0LTRg9C60YIg0LIg0YLQsNCx0LvQuNGG0YM8L2gzPlxcclxcbiAgICA8Zm9ybSBjbGFzcz1cXFwidGFibGUtZm9ybVxcXCI+XFxyXFxuICAgICAgICA8dGFibGU+XFxyXFxuICAgICAgICAgICAgPHRyPjx0ZD48bGFiZWwgZm9yPVxcXCJmb29kLW5hbWVcXFwiPtCd0LDQuNC80LXQvdC+0LLQsNC90LjQtTo8L2xhYmVsPjwvdGQ+PHRkPjxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBpZD1cXFwiZm9vZC1uYW1lXFxcIiBuZy1tb2RlbD1cXFwiJGN0cmwubmFtZVxcXCIgbmcta2V5ZG93bj1cXFwiJGN0cmwuYWRkKCRldmVudClcXFwiLz48L3RkPjwvdHI+XFxyXFxuICAgICAgICAgICAgPHRyPjx0ZD48bGFiZWwgZm9yPVxcXCJ0YWJsZS1mb3JtLXBvcnRpb25cXFwiPtCf0L7RgNGG0LjRjyjQs9GAKTo8L2xhYmVsPjwvdGQ+PHRkPjxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBpZD1cXFwidGFibGUtZm9ybS1wb3J0aW9uXFxcIiBzaXplPVxcXCIyXFxcIiBuZy1tb2RlbD1cXFwiJGN0cmwudmFsdWVzWzBdXFxcIiBuZy1rZXlkb3duPVxcXCIkY3RybC5hZGQoJGV2ZW50KVxcXCIvPjwvdGQ+PC90cj5cXHJcXG4gICAgICAgICAgICA8dHI+PHRkPjxsYWJlbCBmb3I9XFxcInRhYmxlLWZvcm0tY2FyYm9oeWRcXFwiPtCj0LPQu9C10LLQvtC00Ys6PC9sYWJlbD48L3RkPjx0ZD48aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgaWQ9XFxcInRhYmxlLWZvcm0tY2FyYm9oeWRcXFwiIHNpemU9XFxcIjJcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC52YWx1ZXNbMV1cXFwiIG5nLWtleWRvd249XFxcIiRjdHJsLmFkZCgkZXZlbnQpXFxcIi8+PC90ZD48L3RyPlxcclxcbiAgICAgICAgICAgIDx0cj48dGQ+PGxhYmVsIGZvcj1cXFwidGFibGUtZm9ybS1wcm90XFxcIj7QkdC10LvQutC4OjwvbGFiZWw+PC90ZD48dGQ+PGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGlkPVxcXCJ0YWJsZS1mb3JtLXByb3RcXFwiIHNpemU9XFxcIjJcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC52YWx1ZXNbMl1cXFwiIG5nLWtleWRvd249XFxcIiRjdHJsLmFkZCgkZXZlbnQpXFxcIi8+PC90ZD48L3RyPlxcclxcbiAgICAgICAgICAgIDx0cj48dGQ+PGxhYmVsIGZvcj1cXFwidGFibGUtZm9ybS1mYXRcXFwiPtCW0LjRgNGLOjwvbGFiZWw+PC90ZD48dGQ+PGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGlkPVxcXCJ0YWJsZS1mb3JtLWZhdFxcXCIgc2l6ZT1cXFwiMlxcXCIgbmctbW9kZWw9XFxcIiRjdHJsLnZhbHVlc1szXVxcXCIgbmcta2V5ZG93bj1cXFwiJGN0cmwuYWRkKCRldmVudClcXFwiLz48L3RkPjwvdHI+XFxyXFxuICAgICAgICAgICAgPHRyPjx0ZD48bGFiZWwgZm9yPVxcXCJ0YWJsZS1mb3JtLWthbFxcXCI+0JrQsNC70L7RgNC40Lg6PC9sYWJlbD48L3RkPjx0ZD48aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgaWQ9XFxcInRhYmxlLWZvcm0ta2FsXFxcIiBzaXplPVxcXCIyXFxcIiBuZy1tb2RlbD1cXFwiJGN0cmwudmFsdWVzWzRdXFxcIiBuZy1rZXlkb3duPVxcXCIkY3RybC5hZGQoJGV2ZW50KVxcXCIvPjwvdGQ+PC90cj5cXHJcXG4gICAgICAgIDwvdGFibGU+XFxyXFxuXFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhZGQtdG8tdGFibGUtYnV0dG9uXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuYWRkKClcXFwiPis8L2Rpdj5cXHJcXG4gICAgPC9mb3JtPlxcclxcblxcclxcbjwvZGl2PlxcclxcblxcclxcbjxkaXYgY2xhc3M9XFxcIm15LXRhYmxlXFxcIj5cXHJcXG48c3RvcmFnZS10YWJsZSBteS1mb29kcz1cXFwiJGN0cmwubXlGb29kc1xcXCIgcmVtb3ZlPVxcXCIkY3RybC5yZW1vdmUobmFtZSlcXFwiPjwvc3RvcmFnZS10YWJsZT48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwiYWRkLXRvLXRhYmxlLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMzJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHRhYmxlVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL3RhYmxlLXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IHRhYmxlID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBmb29kc09iajogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiB0YWJsZVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRhYmxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvdGFibGUtY29tcG9uZW50L3RhYmxlLWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPHRhYmxlIGNsYXNzPVxcXCJ0YlxcXCI+XFxyXFxuICAgIDxjYXB0aW9uIGNsYXNzPVxcXCJ0Yi10aXRsZVxcXCI+e3sgJGN0cmwuZm9vZHNPYmoudGl0bGUgfX08L2NhcHRpb24+XFxyXFxuICAgIDx0ciBuZy1yZXBlYXQ9XFxcImZvb2QgaW4gJGN0cmwuZm9vZHNPYmouZm9vZHNcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5yZW1vdmUoe2Zvb2Q6IGZvb2QsIG9iajogJGN0cmwuZm9vZHNPYmouZm9vZHN9KVxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj5cXHJcXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwidGQtbmFtZSBuYW1lLWNvbG9yXFxcIiBuZy1jbGFzcz1cXFwiZm9vZC5jbGFzc05hbWVcXFwiPnt7IGZvb2QudmFsdWVzLm5hbWUgfX08L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJwb3J0aW9uLWNvbG9yXFxcIiBuZy1jbGFzcz1cXFwiZm9vZC5jbGFzc05hbWVcXFwiPnt7IGZvb2QudmFsdWVzLnBvcnRpb24gfX08L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJjYXJib2h5ZC1jb2xvclxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj57eyBmb29kLnZhbHVlcy5jYXJib2h5ZCB9fTwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcInByb3QtY29sb3JcXFwiIG5nLWNsYXNzPVxcXCJmb29kLmNsYXNzTmFtZVxcXCI+e3sgZm9vZC52YWx1ZXMucHJvdCB9fTwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcImZhdC1jb2xvclxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj57eyBmb29kLnZhbHVlcy5mYXQgfX08L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJrYWxsLWNvbG9yXFxcIiBuZy1jbGFzcz1cXFwiZm9vZC5jbGFzc05hbWVcXFwiPnt7IGZvb2QudmFsdWVzLmthbGwgfX08L3RkPlxcclxcbiAgICA8L3RyPlxcclxcbjwvdGFibGU+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcInRhYmxlLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS1jb21wb25lbnQvdGVtcGxhdGUvdGFibGUtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDM0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBzdG9yYWdlVGFibGVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvc3RvcmFnZS10YWJsZS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBzdG9yYWdlVGFibGUgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIG15Rm9vZHM6ICc8JyxcclxuICAgICAgICByZW1vdmU6ICcmJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2hvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMubXlGb29kcykgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5teUZvb2RzKS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogc3RvcmFnZVRhYmxlVGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc3RvcmFnZVRhYmxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvc3RvcmFnZS10YWJsZS1jb21wb25lbnQvc3RvcmFnZS10YWJsZS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjx0YWJsZSBjbGFzcz1cXFwidGJcXFwiIG5nLWlmPVxcXCIkY3RybC5zaG93KClcXFwiPlxcclxcbiAgICA8Y2FwdGlvbiBjbGFzcz1cXFwidGItdGl0bGVcXFwiPtCU0L7QsdCw0LLQu9C10L3Ri9C1INC/0YDQvtC00YPQutGC0Ys8L2NhcHRpb24+XFxyXFxuICAgIDx0cj5cXHJcXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwidGQtbmFtZSBuYW1lLWNvbG9yIGNvbG9yXFxcIj7QndCw0LjQvNC10L3QvtCy0LDQvdC40LUg0L/RgNC+0LTRg9C60YLQsDwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcInBvcnRpb24tY29sb3IgY29sb3JcXFwiPtCf0L7RgNGG0LjRjzwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcImNhcmJvaHlkLWNvbG9yIGNvbG9yXFxcIj7Qo9Cz0LvQtdCy0L7QtNGLPC90ZD5cXHJcXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwicHJvdC1jb2xvciBjb2xvclxcXCI+0JHQtdC70LrQuDwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcImZhdC1jb2xvciBjb2xvclxcXCI+0JbQuNGA0Ys8L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJrYWxsLWNvbG9yIGNvbG9yXFxcIj7QmtCw0LvQvtGA0LjQuDwvdGQ+XFxyXFxuICAgIDwvdHI+XFxyXFxuXFxyXFxuICAgIDx0ciBjbGFzcz1cXFwibXktZm9vZFxcXCIgbmctcmVwZWF0PVxcXCIoZm9vZE5hbWUsIHZhbHVlcykgaW4gJGN0cmwubXlGb29kc1xcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnJlbW92ZSh7bmFtZTogZm9vZE5hbWV9KVxcXCI+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcInRkLW5hbWVcXFwiPnt7IGZvb2ROYW1lIH19PC90ZD5cXHJcXG4gICAgICAgIDx0ZD57eyB2YWx1ZXNbMF0gfX08L3RkPlxcclxcbiAgICAgICAgPHRkPnt7IHZhbHVlc1sxXSB9fTwvdGQ+XFxyXFxuICAgICAgICA8dGQ+e3sgdmFsdWVzWzJdIH19PC90ZD5cXHJcXG4gICAgICAgIDx0ZD57eyB2YWx1ZXNbM10gfX08L3RkPlxcclxcbiAgICAgICAgPHRkPnt7IHZhbHVlc1s0XSB9fTwvdGQ+XFxyXFxuICAgIDwvdHI+XFxyXFxuPC90YWJsZT5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwic3RvcmFnZS10YWJsZS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC90YWJsZS1tb2R1bGUvc3RvcmFnZS10YWJsZS1jb21wb25lbnQvdGVtcGxhdGUvc3RvcmFnZS10YWJsZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMzZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9zaW5nbGUtcGFnZS10YWJsZXMtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgdGFibGVzID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBmb29kc09ianM6ICc8JyxcclxuICAgICAgICBteUZvb2RzOiAnPCcsXHJcbiAgICAgICAgcmVtb3ZlTXlGb29kOiAnJidcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkdGltZW91dCkge1xyXG4gICAgICAgIHRoaXMuc2hvd1RhYmxlID0gZnVuY3Rpb24oaGFzaEtleSkge1xyXG4gICAgICAgICAgICB0aGlzLiQkaGFzaEtleSA9IGhhc2hLZXk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHRpbWVvdXQoKCkgPT4gdGhpcy5zaG93VGFibGUodGhpcy5mb29kc09ianNbMF0uJCRoYXNoS2V5KSwwKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbihvYmopIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVNeUZvb2Qoe25hbWU6IG9ian0pXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93TXlGb29kVGl0bGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm15Rm9vZHMpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuICEhT2JqZWN0LmtleXModGhpcy5teUZvb2RzKS5sZW5ndGhcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXHJcbn0gO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0YWJsZXM7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3RhYmxlLW1vZHVsZS9zaW5nbGUtcGFnZS10YWJsZXMtY29tcG9uZW50L3NpbmdsZS1wYWdlLXRhYmxlcy1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcInRhYmxlcy1saXN0XFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwidGl0bGVcXFwiPtCi0LDQsdC70LjRhtGLPC9kaXY+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImxpc3RcXFwiPlxcclxcbiAgICAgICAgPGRpdiBuZy1yZXBlYXQ9XFxcIm9iaiBpbiAkY3RybC5mb29kc09ianNcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zaG93VGFibGUob2JqLiQkaGFzaEtleSlcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS10YWJsZS10aXRsZSc6ICRjdHJsLiQkaGFzaEtleSA9PT0gb2JqLiQkaGFzaEtleX1cXFwiPlxcclxcbiAgICAgICAgICAgIC0ge3tvYmoudGl0bGV9fVxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IG5nLWlmPVxcXCIkY3RybC5zaG93TXlGb29kVGl0bGUoKVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNob3dUYWJsZSgnYWRkLWZvb2QnKVxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlLXRhYmxlLXRpdGxlJzogJGN0cmwuJCRoYXNoS2V5ID09PSAnYWRkLWZvb2QnfVxcXCI+LSDQlNC+0LHQsNCy0LvQtdC90L3Ri9C1INC/0YDQvtC00YPQutGC0Ys8L2Rpdj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuPC9kaXY+XFxyXFxuXFxyXFxuPGRpdiBjbGFzcz1cXFwidGFibGUtY29udGFpbmVyXFxcIj5cXHJcXG4gICAgPGZvb2QtdGFibGUgbmctcmVwZWF0PVxcXCJmb29kc09iaiBpbiAkY3RybC5mb29kc09ianNcXFwiIGZvb2RzLW9iaj1cXFwiZm9vZHNPYmpcXFwiIG5nLWlmPVxcXCIkY3RybC4kJGhhc2hLZXkgPT09IGZvb2RzT2JqLiQkaGFzaEtleVxcXCI+PC9mb29kLXRhYmxlPlxcclxcbiAgICA8c3RvcmFnZS10YWJsZSBteS1mb29kcz1cXFwiJGN0cmwubXlGb29kc1xcXCIgcmVtb3ZlPVxcXCIkY3RybC5yZW1vdmUobmFtZSlcXFwiIG5nLWlmPVxcXCIkY3RybC4kJGhhc2hLZXkgPT09ICdhZGQtZm9vZCdcXFwiPjwvc3RvcmFnZS10YWJsZT5cXHJcXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwic2luZ2xlLXBhZ2UtdGFibGVzLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL3RhYmxlLW1vZHVsZS9zaW5nbGUtcGFnZS10YWJsZXMtY29tcG9uZW50L3RlbXBsYXRlL3NpbmdsZS1wYWdlLXRhYmxlcy10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMzhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAyKSByZXR1cm4gJyc7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9saW1pdHMtZmlsdGVyLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkaHR0cCwgJHdpbmRvdykge1xyXG4gICAgdmFyIGJhc2UgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRGb29kQmFzZSgpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcuL0pTT05kYXRhL2Zvb2QuanNvbicpLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgdmFyIGJhc2UgPSB7fSwga2V5cyA9IFtdO1xyXG4gICAgICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UubXlGb29kcykgZGF0YS5kYXRhLnB1c2goSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5teUZvb2RzKSk7XHJcblxyXG4gICAgICAgICAgICBkYXRhLmRhdGEuZm9yRWFjaCgob2JqKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gb2JqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ25hbWUnKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICBiYXNlW2tleV0gPSBvYmpba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGJhc2UpLmZvckVhY2goKGtleSkgPT4ga2V5cy5wdXNoKHtmb29kTmFtZToga2V5fSkpO1xyXG4gICAgICAgICAgICBiYXNlLmtleXMgPSBrZXlzO1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGdldEZvb2RCYXNlKCkudGhlbigoZGF0YSkgPT4gYmFzZS5mb29kcyA9IGRhdGEpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFkZFRvQmFzZShuYW1lLCB2YWx1ZXMpIHtcclxuICAgICAgICBiYXNlLmZvb2RzW25hbWVdID0gdmFsdWVzO1xyXG4gICAgICAgIGJhc2UuZm9vZHMua2V5cy5wdXNoKHtmb29kTmFtZTogbmFtZX0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbW92ZUZyb21CYXNlKG5hbWUpIHtcclxuICAgICAgICBkZWxldGUgYmFzZS5mb29kc1tuYW1lXTtcclxuXHJcbiAgICAgICAgYmFzZS5mb29kcy5rZXlzLmZvckVhY2goKG9iaiwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgaWYgKG9iai5mb29kTmFtZSA9PT0gbmFtZSkgYmFzZS5mb29kcy5rZXlzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRGb29kT2JqZWN0cygpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcuL0pTT05kYXRhL2Zvb2QuanNvbicpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0RGF5VGltZXNEYXRhKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy4vSlNPTmRhdGEvZGF5LXRpbWVzLWRhdGEuanNvbicpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0TGltaXRzRGF0YShkaWV0LCBwaGFzZSkge1xyXG4gICAgICAgIGxldCBwYXRoID0gJy4vSlNPTmRhdGEvbGltaXRzLWRhdGEvJyArIGRpZXQgKyAnLXBoYXNlJyArIHBoYXNlICsgJy5qc29uJztcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KHBhdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFRhYmxlRGF0YSgpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcuL0pTT05kYXRhL2Zvb2QuanNvbicpXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGFibGVEYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0YS5kYXRhLmZvckVhY2goKG9iaikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdPYmogPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb29kczogW11cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQgPSAyMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIG9iaikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAnbmFtZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld09iai50aXRsZSA9IG9iai5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjb3VudCA+PSAyMCApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0aXRsZURhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnY29sb3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAn0J3QsNC40LzQtdC90L7QstCw0L3QuNC1INC/0YDQvtC00YPQutGC0LAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3J0aW9uOiAn0J/QvtGA0YbQuNGPJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyYm9oeWQ6ICfQo9Cz0LvQtdCy0L7QtNGLJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdDogJ9CR0LXQu9C60LgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYXQ6ICfQltC40YDRiycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGthbGw6ICfQmtCw0LvQvtGA0LjQuCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3T2JqLmZvb2RzLnB1c2godGl0bGVEYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZm9vZCA9IHtjbGFzc05hbWU6ICcnLCB2YWx1ZXM6IHt9fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9vZC52YWx1ZXMubmFtZSA9IGtleTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9vZC52YWx1ZXMucG9ydGlvbiA9IG9ialtrZXldWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5jYXJib2h5ZCA9IG9ialtrZXldWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5wcm90ID0gb2JqW2tleV1bMl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvb2QudmFsdWVzLmZhdCA9IG9ialtrZXldWzNdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5rYWxsID0gb2JqW2tleV1bNF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld09iai5mb29kcy5wdXNoKGZvb2QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEYXRhLnB1c2gobmV3T2JqKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB0YWJsZURhdGE7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGJhc2U6IGJhc2UsXHJcbiAgICAgICAgYWRkVG9CYXNlOiBhZGRUb0Jhc2UsXHJcbiAgICAgICAgcmVtb3ZlRnJvbUJhc2U6IHJlbW92ZUZyb21CYXNlLFxyXG4gICAgICAgIGdldEZvb2RCYXNlOiBnZXRGb29kQmFzZSxcclxuICAgICAgICBnZXRGb29kT2JqZWN0czogZ2V0Rm9vZE9iamVjdHMsXHJcbiAgICAgICAgZ2V0VGFibGVEYXRhOiBnZXRUYWJsZURhdGEsXHJcbiAgICAgICAgZ2V0RGF5VGltZXNEYXRhOiBnZXREYXlUaW1lc0RhdGEsXHJcbiAgICAgICAgZ2V0TGltaXRzRGF0YTogZ2V0TGltaXRzRGF0YVxyXG4gICAgfTtcclxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvc2VydmljZXMvZGF0YS1zZXJ2aWNlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhU2VydmljZSwgbW9kYWwpIHtcclxuICAgIHZhciBmb29kID0gZGF0YVNlcnZpY2UuYmFzZTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gZm9vZEFkZFZhbGlkYXRpb24obmFtZSwgcG9ydGlvbikge1xyXG4gICAgICAgIGlmICghbmFtZSkge1xyXG4gICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIG1lc3NhZ2U6ICfQktCy0LXQtNC40YLQtSDQvdCw0LfQstCw0L3QuNC1INC/0YDQvtC00YPQutGC0LAnfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgfSBlbHNlIGlmICghZm9vZC5mb29kc1tuYW1lXSkge1xyXG4gICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIG1lc3NhZ2U6ICfQotCw0LrQvtCz0L4g0L/RgNC+0LTRg9C60YLQsCDQvdC10YIg0LIg0LHQsNC30LUuINCh0L4g0YHQv9C40YHQutC+0Lwg0L/RgNC+0LTRg9C60YLQvtCyINCS0Ysg0LzQvtC20LXRgtC1INC+0LfQvdCw0LrQvtC80LjRgtGM0YHRjyDQsiDRgNCw0LfQtNC10LvQtSBcItCi0LDQsdC70LjRhtGLXCIsINC70LjQsdC+INC00L7QsdCw0LLQuNGC0Ywg0YHQstC+0Lkg0L/RgNC+0LTRg9C60YInfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgfSBlbHNlIGlmICghcG9ydGlvbikge1xyXG4gICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIG1lc3NhZ2U6ICfQktCy0LXQtNC40YLQtSDQv9C+0YDRhtC40Y4g0LIg0LPRgNCw0LzQvNCw0YUnfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc05hTigrcG9ydGlvbikpIHtcclxuICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQntGI0LjQsdC60LAnLCBtZXNzYWdlOiAn0JIg0L/QvtC70LUgXCLQn9C+0YDRhtC40Y9cIiDQstCy0LXQtNC40YLQtSDRh9C40YHQu9C+J30sICdhbGVydCcpO1xyXG4gICAgICAgIH1lbHNlIGlmIChwb3J0aW9uIDw9IDApIHtcclxuICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQntGI0LjQsdC60LAnLCBtZXNzYWdlOiAn0JLQstC10LTQuNGC0LUg0YfQuNGB0LvQviDQsdC+0LvRjNGI0LUg0YfQtdC8IDAnfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgfSBlbHNlIHsgcmV0dXJuIHRydWV9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdmFsaWRhdGVMaW1pdHNDaG9vc2UoZGlldDEsIGRpZXQyLCBwaGFzZUNsYXNzKSB7XHJcbiAgICAgICAgaWYoIChkaWV0MSB8fCBkaWV0MikgJiYgcGhhc2VDbGFzcyAhPT0gJ3N0YXJ0JykgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkTXlGb29kVmFsaWRhdGlvbihuYW1lLCB2YWx1ZXMpIHtcclxuICAgICAgICBsZXQgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgaWYgKCFuYW1lKSB7XHJcbiAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwJywgbWVzc2FnZTogJ9CS0LLQtdC00LjRgtC1INC90LDQuNC80LXQvdC+0LLQsNC90LjQtSDQv9GA0L7QtNGD0LrRgtCwJ30sICdhbGVydCcpO1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlc1swXSA9PT0gMCkge1xyXG4gICAgICAgICAgICBtb2RhbC5vcGVuKHt0aXRsZTogJ9Ce0YjQuNCx0LrQsCcsIG1lc3NhZ2U6ICfQn9C+0YDRhtC40Y8g0L3QtSDQvNC+0LbQtdGCINCx0YvRgtGMINGA0LDQstC90LAg0L3Rg9C70Y4nfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFsdWVzLmZvckVhY2goKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpc05hTih2YWx1ZSl8fCB2YWx1ZSA8IDApIHtcclxuICAgICAgICAgICAgICAgIG1vZGFsLm9wZW4oe3RpdGxlOiAn0J7RiNC40LHQutCwJywgbWVzc2FnZTogJ9CX0L3QsNGH0LXQvdC40Y8g0LTQvtC70LbQvdGLINCx0YvRgtGMINGH0LjRgdC70LDQvNC4INGB0L4g0LfQvdCw0YfQtdC90LjQtdC8INCx0L7Qu9GM0YjQuNC8INC40LvQuCDRgNCw0LLQvdGL0Lwg0L3Rg9C70Y4nfSwgJ2FsZXJ0Jyk7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gc3VjY2VzcztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGZvb2RBZGRWYWxpZGF0aW9uOiBmb29kQWRkVmFsaWRhdGlvbixcclxuICAgICAgICB2YWxpZGF0ZUxpbWl0c0Nob29zZTogdmFsaWRhdGVMaW1pdHNDaG9vc2UsXHJcbiAgICAgICAgYWRkTXlGb29kVmFsaWRhdGlvbjogYWRkTXlGb29kVmFsaWRhdGlvblxyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy92YWxpZGF0aW9uLXNlcnZpY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGFTZXJ2aWNlKSB7XHJcbiAgICB2YXIgZm9vZCA9IGRhdGFTZXJ2aWNlLmJhc2U7XHJcblxyXG4gICAgZnVuY3Rpb24gY2FsY3VsYXRlVmFsdWVzKGZvb2ROYW1lLCBwb3J0aW9uKSB7XHJcbiAgICAgICAgbGV0IHZhbHVlcyA9IGZvb2QuZm9vZHNbZm9vZE5hbWVdO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5hbWU6IGZvb2ROYW1lLFxyXG4gICAgICAgICAgICBwb3J0aW9uOiBwb3J0aW9uLFxyXG4gICAgICAgICAgICBjYXJib2h5ZDogTWF0aC5yb3VuZCh2YWx1ZXNbMV0vdmFsdWVzWzBdKnBvcnRpb24pLFxyXG4gICAgICAgICAgICBwcm90OiBNYXRoLnJvdW5kKHZhbHVlc1syXS92YWx1ZXNbMF0qcG9ydGlvbiksXHJcbiAgICAgICAgICAgIGZhdDogTWF0aC5yb3VuZCh2YWx1ZXNbM10vdmFsdWVzWzBdKnBvcnRpb24pLFxyXG4gICAgICAgICAgICBrYWxsOiBNYXRoLnJvdW5kKHZhbHVlc1s0XS92YWx1ZXNbMF0qcG9ydGlvbilcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjYWxjdWxhdGVWYWx1ZXM6IGNhbGN1bGF0ZVZhbHVlc1xyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9jYWxjdWxhdGlvbi1zZXJ2aWNlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhU2VydmljZSkge1xyXG4gICAgdmFyIGxpbWl0c0RhdGEgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBzZXRMaW1pdHMoZGlldCwgcGhhc2UpIHtcclxuICAgICAgICBkYXRhU2VydmljZS5nZXRMaW1pdHNEYXRhKGRpZXQsIHBoYXNlKVxyXG4gICAgICAgICAgICAudGhlbigoZGF0YSkgPT4gbGltaXRzRGF0YS5saW1pdHMgPSBkYXRhLmRhdGEpXHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGNsZWFyTGltaXRzKCkge1xyXG4gICAgICAgIGlmIChsaW1pdHNEYXRhLmxpbWl0cykgZGVsZXRlIGxpbWl0c0RhdGEubGltaXRzXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsaW1pdHNEYXRhOiBsaW1pdHNEYXRhLFxyXG4gICAgICAgIHNldExpbWl0czogc2V0TGltaXRzLFxyXG4gICAgICAgIGNsZWFyTGltaXRzOiBjbGVhckxpbWl0c1xyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9saW1pdHMtc2VydmljZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oZGF5dGltZSkge1xyXG4gICAgICAgIHN3aXRjaCAoZGF5dGltZSkge1xyXG4gICAgICAgICAgICBjYXNlICdicmVha2Zhc3QnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZmlyc3Qtc25hY2snOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZGlubmVyJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAyO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NlY29uZC1zbmFjayc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdldmVuaW5nLW1lYWwnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3NlcnZpY2VzL2luZGV4LXNlcnZpY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGFjdGl2ZUNsYXNzID0gJyc7XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0Q2xhc3NOYW1lKGNsYXNzTmFtZSkge1xyXG4gICAgICAgIGFjdGl2ZUNsYXNzID0gJ2FjdGl2ZS0nICsgY2xhc3NOYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldENsYXNzTmFtZSgpIHtcclxuICAgICAgICByZXR1cm4gYWN0aXZlQ2xhc3NcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldENsYXNzTmFtZTogZ2V0Q2xhc3NOYW1lLFxyXG4gICAgICAgIHNldENsYXNzTmFtZTogc2V0Q2xhc3NOYW1lXHJcbiAgICB9XHJcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3NlcnZpY2VzL2FjdGl2ZS1jbGFzcy1zZXJ2aWNlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkdGltZW91dCwgdmFsaWRhdGlvblNlcnZpY2UsIGxpbWl0c1NlcnZpY2UsICR3aW5kb3csIG1vZGFsKSB7XHJcbiAgICB2YXIgZGlldHMgPSB7XHJcbiAgICAgICAgY2FyYm9oeWRyYXRlczogZmFsc2UsXHJcbiAgICAgICAgcHJvdGVpbnM6IGZhbHNlXHJcbiAgICB9LFxyXG4gICAgICAgIGNsYXNzTmFtZSA9IHtuYW1lOiAnc3RhcnQnfTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gc2V0RGlldChkaWV0KSB7XHJcbiAgICAgICAgaWYgKGRpZXRzW2RpZXRdKSB7XHJcbiAgICAgICAgICAgIGRpZXRzW2RpZXRdID0gZmFsc2U7XHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IGRpZXRzW2RpZXRdID0gdHJ1ZSwgMCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGlldHMuY2FyYm9oeWRyYXRlcyA9IGRpZXQgPT09ICdjYXJib2h5ZHJhdGVzJztcclxuICAgICAgICBkaWV0cy5wcm90ZWlucyA9IGRpZXQgPT09ICdwcm90ZWlucyc7XHJcbiAgICAgICAgaWYgKHZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlTGltaXRzQ2hvb3NlKGRpZXRzLmNhcmJvaHlkcmF0ZXMsIGRpZXRzLnByb3RlaW5zLCBjbGFzc05hbWUubmFtZSkpIHNldExpbWl0cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldENsYXNzTmFtZShwaGFzZUlkKSB7XHJcbiAgICAgICAgY2xhc3NOYW1lLm5hbWUgPSAnYWN0aXZlJyArIHBoYXNlSWQ7XHJcbiAgICAgICAgaWYgKHZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlTGltaXRzQ2hvb3NlKGRpZXRzLmNhcmJvaHlkcmF0ZXMsIGRpZXRzLnByb3RlaW5zLCBjbGFzc05hbWUubmFtZSkpIHNldExpbWl0cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldExpbWl0cygpIHtcclxuICAgICAgICBsZXQgZGlldCA9IGRpZXRzLmNhcmJvaHlkcmF0ZXMgPyAnY2FyYm9oeWRyYXRlcycgOiAncHJvdGVpbnMnLFxyXG4gICAgICAgICAgICBwaGFzZSA9IGNsYXNzTmFtZS5uYW1lLnNsaWNlKC0xKTtcclxuICAgICAgICBsaW1pdHNTZXJ2aWNlLnNldExpbWl0cyhkaWV0LCBwaGFzZSk7XHJcblxyXG4gICAgICAgICR3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2F2ZWRMaW1pdHMgPSBKU09OLnN0cmluZ2lmeSh7ZGlldDogZGlldCwgcGhhc2VJZDogcGhhc2V9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZXNldENob29zZSgpIHtcclxuICAgICAgICBpZiAoIWxpbWl0c1NlcnZpY2UubGltaXRzRGF0YS5saW1pdHMpIHtcclxuICAgICAgICAgICAgZGlldHMuY2FyYm9oeWRyYXRlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBkaWV0cy5wcm90ZWlucyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjbGFzc05hbWUubmFtZSA9ICdzdGFydCc7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQn9C+0LTRgtCy0LXRgNC20LTQtdC90LjQtScsIG1lc3NhZ2U6ICfQktGLINGC0L7Rh9C90L4g0YXQvtGC0LjRgtC1INGB0LHRgNC+0YHQuNGC0Ywg0YPRgdGC0LDQvdC+0LLQu9C10L3QvdGL0LUg0LvQuNC80LjRgtGLPyd9LCAnY29uZmlybScpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGRpZXRzLmNhcmJvaHlkcmF0ZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGRpZXRzLnByb3RlaW5zID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUubmFtZSA9ICdzdGFydCc7XHJcblxyXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKCdzYXZlZExpbWl0cycpO1xyXG4gICAgICAgICAgICAgICAgbGltaXRzU2VydmljZS5jbGVhckxpbWl0cygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBsb2FkTGltaXRzKCkge1xyXG4gICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlZExpbWl0cykge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZWRMaW1pdHMpO1xyXG4gICAgICAgICAgICBzZXREaWV0KGRhdGEuZGlldCk7XHJcbiAgICAgICAgICAgIHNldENsYXNzTmFtZShkYXRhLnBoYXNlSWQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGRpZXRzOiBkaWV0cyxcclxuICAgICAgICBjbGFzc05hbWU6IGNsYXNzTmFtZSxcclxuICAgICAgICBzZXREaWV0OiBzZXREaWV0LFxyXG4gICAgICAgIHNldENsYXNzTmFtZTogc2V0Q2xhc3NOYW1lLFxyXG4gICAgICAgIHNldExpbWl0czogc2V0TGltaXRzLFxyXG4gICAgICAgIHJlc2V0Q2hvb3NlOiByZXNldENob29zZSxcclxuICAgICAgICBsb2FkTGltaXRzOiBsb2FkTGltaXRzXHJcbiAgICB9XHJcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3NlcnZpY2VzL2RpZXQtY2hvb3NlLXNlcnZpY2UuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcIm1vZGFsLWJhY2tncm91bmRcXFwiIG5nLWlmPVxcXCIkY3RybC5jaGVja09wZW4oKVxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcIndpbmRvdyBhblxcXCIgbmctaWY9XFxcIiRjdHJsLmNoZWNrT3BlbigpXFxcIj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInRpdGxlXFxcIj57eyAkY3RybC5tb2RhbFZpZXdEYXRhLmRhdGEudGl0bGUgfX08L2Rpdj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcIm1lc3NhZ2VcXFwiPnt7ICRjdHJsLm1vZGFsVmlld0RhdGEuZGF0YS5tZXNzYWdlIH19PC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJidXR0b25zIGdyb3VwXFxcIj5cXHJcXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb25maXJtXFxcIiBuZy1pZj1cXFwiJGN0cmwuY2hlY2tUeXBlKCdjb25maXJtJylcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZWplY3RcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5jbG9zZSgpXFxcIj7QntGC0LzQtdC90LA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwib2tcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5jbG9zZSh0cnVlKVxcXCI+T0s8L2Rpdj5cXHJcXG4gICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhbGVydFxcXCIgbmctaWY9XFxcIiRjdHJsLmNoZWNrVHlwZSgnYWxlcnQnKVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmNsb3NlKClcXFwiPtCX0LDQutGA0YvRgtGMPC9kaXY+XFxyXFxuICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImNsb3NlXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuY2xvc2UoKVxcXCI+eDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwibW9kYWwtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvbWFpbi1tb2R1bGUvbW9kYWwtd2luZG93LWNvbXBvbmVudC90ZW1wbGF0ZS9tb2RhbC10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMTAwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRxKSB7XHJcbiAgICBsZXQgc3RhdGUgPSAnY2xvc2UnLFxyXG4gICAgICAgIHR5cGUgPSBudWxsLFxyXG4gICAgICAgIGRlZmVyO1xyXG5cclxuICAgIGxldCBtb2RhbFZpZXdEYXRhID0ge307XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0U3RhdGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb3BlbihkYXRhLCBtb2RhbF90eXBlKSB7XHJcbiAgICAgICAgbW9kYWxWaWV3RGF0YS5kYXRhID0gZGF0YTtcclxuICAgICAgICB0eXBlID0gbW9kYWxfdHlwZTtcclxuICAgICAgICBzdGF0ZSA9ICdvcGVuJztcclxuICAgICAgICBpZiAobW9kYWxfdHlwZSA9PT0gJ2NvbmZpcm0nKSB7XHJcbiAgICAgICAgICAgIGRlZmVyID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNsb3NlKGJvb2wpIHtcclxuICAgICAgICBpZiAoYm9vbCkge1xyXG4gICAgICAgICAgICBkZWZlci5yZXNvbHZlKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY29uZmlybScpIHtcclxuICAgICAgICAgICAgZGVmZXIucmVqZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXRlID0gJ2Nsb3NlJztcclxuICAgICAgICB0eXBlID0gbnVsbDtcclxuICAgICAgICBkZWxldGUgbW9kYWxWaWV3RGF0YS5kYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbW9kYWxWaWV3RGF0YTogbW9kYWxWaWV3RGF0YSxcclxuICAgICAgICBnZXRTdGF0ZTogZ2V0U3RhdGUsXHJcbiAgICAgICAgZ2V0VHlwZTogZ2V0VHlwZSxcclxuICAgICAgICBvcGVuOiBvcGVuLFxyXG4gICAgICAgIGNsb3NlOiBjbG9zZVxyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9tb2RhbC1zZXJ2aWNlLmpzXG4gKiovIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FDdENBOzs7Ozs7QUNBQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFVQTs7Ozs7Ozs7Ozs7Ozs7O0FDVkE7QUFDQTs7O0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFYQTtBQWFBO0FBQ0E7O0FBZEE7QUFpQkE7QUFDQTtBQUNBO0FBQ0E7O0FBcEJBO0FBQ0E7QUF5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFGQTtBQU9BO0FBUEE7QUFEQTtBQUNBO0FBV0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRkE7QUFBQTtBQURBO0FBQ0E7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSUE7QUFEQTtBQUlBO0FBSkE7QUFKQTtBQURBO0FBQ0E7QUFhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFKQTtBQURBO0FBQ0E7QUFRQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQURBO0FBR0E7QUFDQTtBQURBO0FBSEE7QUFDQTtBQU9BO0FBWkE7QUFEQTtBQUNBOztBQXJFQTtBQXVGQTtBQUNBO0FBQ0E7QUFIQTtBQUNBOztBQXZGQTtBQThGQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFEQTtBQUlBO0FBSkE7QUFDQTtBQU1BO0FBQ0E7QUFEQTtBQUlBO0FBSkE7QUFSQTtBQUNBO0FBZUE7QUFDQTtBQUNBO0FBREE7QUFEQTtBQUNBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFOQTtBQUNBO0FBUUE7O0FBRUE7QUFFQTtBQURBO0FBSEE7QUFDQTtBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFIQTtBQVFBO0FBUkE7QUFVQTtBQVpBO0FBQ0E7QUFjQTtBQUNBOzs7QUFEQTtBQUtBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQURBO0FBS0E7QUFMQTtBQU9BO0FBbkJBO0FBQ0E7QUFxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSEE7QUFDQTtBQU9BO0FBQ0E7QUFDQTs7QUFFQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBREE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFGQTtBQVNBO0FBQ0E7QUFDQTtBQURBO0FBRkE7QUFPQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFUQTtBQUNBO0FBYUE7QUFDQTtBQUNBO0FBREE7QUFEQTtBQTNCQTtBQWxCQTtBQUNBO0FBb0RBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTs7QUFGQTs7QUFBQTtBQUNBO0FBU0E7QUFWQTtBQURBO0FBQ0E7QUFjQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBS0E7QUFDQTtBQURBO0FBQ0E7QUFJQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUNBO0FBS0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSUE7QUFKQTtBQUZBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFMQTtBQU9BO0FBUkE7QUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFGQTtBQU5BO0FBRkE7QUFnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBRkE7QUFOQTtBQWNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7QUFmQTtBQXNCQTtBQUNBOzs7QUFHQTtBQUhBO0FBTUE7QUFDQTtBQURBO0FBR0E7QUFDQTtBQVZBO0FBREE7Ozs7QUFrQkE7QUFDQTtBQURBO0FBbEJBO0FBREE7OztBQTBCQTtBQUhBO0FBekVBO0FBQ0E7QUErRUE7QUFDQTs7QUFFQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBTkE7QUFEQTtBQUNBO0FBWUE7O0FBRUE7QUFDQTtBQURBO0FBQ0E7O0FBSEE7QUFRQTtBQURBO0FBR0E7QUFDQTtBQURBO0FBSUE7QUFDQTtBQURBO0FBSkE7QUFWQTtBQUNBO0FBbUJBO0FBQ0E7QUFDQTtBQURBO0FBREE7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFiQTtBQUNBO0FBaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUFOQTtBQUNBO0FBZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSEE7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFDQTtBQUtBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFEQTtBQVJBO0FBWUE7QUFuQkE7QUFDQTtBQXFCQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQU1BO0FBVkE7QUFDQTtBQVlBOztBQUVBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBSEE7QUFLQTtBQUNBO0FBUkE7QUFEQTtBQWFBO0FBREE7QUFHQTtBQUhBO0FBakJBO0FBQ0E7QUF1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFKQTtBQXBCQTtBQUhBO0FBZ0NBO0FBaENBO0FBQ0E7QUFrQ0E7QUFHQTtBQUhBO0FBS0E7QUFEQTtBQUdBO0FBSEE7QUExQ0E7QUFDQTtBQWdEQTtBQUNBO0FBQ0E7QUFEQTtBQUlBO0FBREE7QUFJQTtBQUpBO0FBSkE7QUFDQTtBQVdBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUpBO0FBQ0E7QUFVQTtBQUNBO0FBR0E7QUFIQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBRkE7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBcEJBO0FBREE7QUFDQTtBQTRCQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBQ0E7QUFLQTtBQUNBO0FBREE7QUFDQTtBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBREE7QUFJQTtBQUpBO0FBTUE7QUFDQTtBQWRBO0FBQ0E7QUFnQkE7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUtBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQURBO0FBR0E7QUFiQTtBQUNBOztBQWhvQkE7QUFpcEJBO0FBREE7QUFDQTs7QUFqcEJBO0FBc3BCQTtBQURBO0FBQ0E7O0FBdHBCQTtBQTJwQkE7QUFEQTtBQUNBOztBQTNwQkE7QUFncUJBO0FBREE7QUFDQTs7QUFocUJBO0FBcXFCQTtBQURBO0FBQ0E7O0FBcnFCQTs7QUEycUJBO0FBQ0E7QUFEQTtBQUlBO0FBSkE7QUFGQTtBQUNBO0FBU0E7QUFDQTs7QUFwckJBO0FBdXJCQTtBQUNBO0FBQ0E7QUFDQTs7QUExckJBO0FBQ0E7O0FBREE7QUFnc0JBO0FBQ0E7O0FBanNCQTtBQUNBOztBQURBO0FBdXNCQTtBQUNBO0FBRkE7QUF0c0JBO0FBQ0E7QUEyc0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW5DQTtBQXFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBR0E7QUFKQTtBQU1BO0FBVEE7QUEzQ0E7QUF0dkJBOzs7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFNQTtBQUNBO0FBRUE7QUFDQTtBQUhBO0FBTUE7QUFDQTtBQVBBO0FBVUE7QUFDQTtBQVhBO0FBY0E7QUFDQTtBQWZBO0FBa0JBO0FBQ0E7QUFuQkE7QUFzQkE7QUFDQTtBQXZCQTtBQTBCQTtBQUNBO0FBM0JBO0FBREE7QUFDQTtBQStCQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7QUFDQTtBQU1BOzs7Ozs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVFBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFLQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUZBO0FBdEJBO0FBMkJBO0FBNUJBO0FBQ0E7QUE4QkE7Ozs7OztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBWEE7QUFnQkE7QUFqQkE7QUFDQTtBQW1CQTs7Ozs7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBR0E7QUFKQTtBQUNBO0FBTUE7Ozs7OztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEE7QUFDQTtBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBSEE7QUFDQTtBQVVBO0FBRUE7QUFEQTtBQUdBO0FBQ0E7QUFBQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFQQTtBQUNBO0FBU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBBO0FBQ0E7QUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQURBO0FBTUE7QUFDQTtBQUNBO0FBRkE7QUFOQTtBQUZBO0FBQ0E7QUFjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMQTtBQUNBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQVZBO0FBQ0E7OztBQW5GQTtBQUNBO0FBb0dBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFPQTtBQUVBO0FBQ0E7QUFGQTtBQUZBO0FBUkE7QUFyR0E7QUEwSEE7QUEzSEE7QUFDQTtBQTZIQTs7Ozs7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQVpBO0FBaUJBO0FBbEJBO0FBQ0E7QUFvQkE7Ozs7Ozs7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU9BOzs7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBVkE7QUFZQTtBQWJBO0FBQ0E7QUFlQTs7Ozs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEE7QUFDQTtBQVNBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFSQTtBQUNBO0FBZ0JBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEE7QUFDQTtBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFQQTtBQUNBO0FBU0E7QUFDQTtBQURBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQURBO0FBTUE7QUFDQTtBQUNBO0FBRkE7QUFOQTtBQUZBO0FBaEVBO0FBK0VBO0FBaEZBO0FBQ0E7QUFrRkE7Ozs7OztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBSEE7QUFNQTtBQUNBOztBQVBBO0FBQ0E7O0FBREE7QUFhQTtBQWJBO0FBQ0E7QUFnQkE7QUFDQTtBQUNBO0FBRkE7QUF2Q0E7QUE0Q0E7QUFwREE7QUFDQTtBQXNEQTs7Ozs7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBREE7QUFEQTtBQUtBO0FBVkE7QUFDQTtBQVlBOzs7Ozs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7OztBQUNBOztBQURBO0FBSUE7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUVBO0FBQ0E7O0FBRkE7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVhBO0FBTkE7O0FBdUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBN0JBO0FBSEE7QUFDQTtBQW9DQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRkE7QUFGQTtBQURBO0FBQ0E7QUFVQTs7O0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUZBO0FBSUE7QUFEQTtBQUxBO0FBU0E7QUFDQTtBQUNBO0FBRUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQURBO0FBR0E7QUFBQTtBQUxBO0FBT0E7QUFQQTtBQVZBO0FBRkE7QUFDQTtBQXlCQTs7O0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBREE7QUFHQTtBQVBBO0FBRkE7QUFDQTtBQVlBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUhBO0FBRkE7QUFRQTtBQVJBO0FBREE7QUF6RkE7QUFzR0E7QUEzR0E7QUFDQTtBQTZHQTs7Ozs7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQU5BO0FBUkE7QUFvQkE7QUF4QkE7QUFDQTtBQTBCQTs7Ozs7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTUE7Ozs7OztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0E7QUFFQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBQ0E7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFSQTtBQWZBO0FBMEJBO0FBM0JBO0FBQ0E7QUE4QkE7Ozs7OztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFWQTtBQUNBO0FBWUE7QUFDQTtBQURBO0FBakJBO0FBcUJBO0FBM0JBO0FBQ0E7QUE2QkE7Ozs7OztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUdBO0FBUEE7QUFDQTtBQVNBOzs7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQU1BO0FBWEE7QUFDQTtBQWFBOzs7Ozs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBOzs7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFGQTtBQVhBO0FBZ0JBO0FBdEJBO0FBQ0E7QUF3QkE7Ozs7OztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7QUFNQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBWkE7QUFEQTtBQUNBO0FBZ0JBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUhBO0FBQ0E7QUFPQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTkE7QUFGQTtBQVdBO0FBQ0E7QUFiQTtBQWVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQTVCQTtBQUNBO0FBOEJBO0FBckNBO0FBQ0E7QUF1Q0E7QUEzQ0E7QUFGQTtBQUNBO0FBa0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVJBO0FBbkdBOzs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBREE7QUFHQTtBQURBO0FBR0E7QUFEQTtBQUdBO0FBREE7QUFHQTtBQURBO0FBRUE7QUFGQTtBQVRBO0FBQ0E7QUFhQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFEQTtBQU9BO0FBbEJBO0FBQ0E7QUFvQkE7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQTNDQTs7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU5BO0FBRkE7QUFDQTtBQVdBO0FBQ0E7QUFEQTtBQWZBOzs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFGQTtBQUNBO0FBS0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBYkE7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFOQTtBQVFBO0FBQ0E7QUFUQTtBQVdBO0FBQ0E7QUFaQTtBQWNBO0FBQ0E7QUFmQTtBQWlCQTtBQWpCQTtBQURBO0FBREE7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBRkE7QUFYQTs7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQVJBO0FBQ0E7QUFVQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBTUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFOQTtBQVJBO0FBQ0E7QUFpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBREE7QUFDQTtBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFQQTtBQTNEQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSkE7QUFDQTtBQVNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQVJBO0FBQ0E7QUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMQTtBQXBDQTs7OyIsInNvdXJjZVJvb3QiOiIifQ==