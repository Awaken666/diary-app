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
	var diaryModule = __webpack_require__(10);
	var tableModule = __webpack_require__(21);

	var app = angular.module('app', ['main', 'diary', 'table', 'ngAnimate', 'angucomplete-alt']);

	app.filter('limit', __webpack_require__(30));
	app.factory('dataService', __webpack_require__(31)).factory('validationService', __webpack_require__(32)).factory('calculationService', __webpack_require__(33)).factory('limitsService', __webpack_require__(34)).factory('indexService', __webpack_require__(78));

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

	main.component('leftSideMenu', __webpack_require__(4)).component('daytimeChoose', __webpack_require__(6)).component('home', __webpack_require__(8)).component('view', __webpack_require__(76));

	main.config(function ($stateProvider) {
	    $stateProvider.state('home', {
	        url: '/home',
	        template: '<home></home>'
	    }).state('diary', {
	        url: '/diary/:daytime',
	        template: '<day-time base="$ctrl.base" daytimes="$ctrl.viewData.dayTimes" add="$ctrl.addFood(dayTimeId, food)" remove="$ctrl.removeFood(dayTimeId, food)" day-time-limits="$ctrl.viewData.limitsData"></day-time>'
	    });
	});

		module.exports = main;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var leftSideMenuTemplate = __webpack_require__(5);

	var leftSideMenu = {
	    controller: function controller($state) {
	        var _this = this;

	        this.menuItems = [{ className: 'home', tooltip: 'На главную', tooltipShow: false }, { className: 'settings', tooltip: 'Настройки', tooltipShow: false }, { className: 'result', tooltip: 'Итог дня', tooltipShow: false }, { className: 'print', tooltip: 'Для печати', tooltipShow: false }, { className: 'save', tooltip: 'Сохранить', tooltipShow: false }, { className: 'tables', tooltip: 'Таблицы', tooltipShow: false }, { className: 'add-food', tooltip: 'Добавить еду в таблицу', tooltipShow: false }];

	        this.toggle = function (item) {
	            if (item.className === this.activeClass) return;
	            item.tooltipShow = !item.tooltipShow;
	        };

	        this.setState = function (className) {
	            $state.go(className);
	            this.activeClass = 'active-' + className;
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
	var v1="<div class=\"left-side-menu\">\r\n    <div class=\"to-another-design\" ng-class=\"$ctrl.backIconClassName\"></div>\r\n\r\n    <div class=\"menu-item\" ng-repeat=\"item in $ctrl.menuItems\" ng-class=\"[item.className, $ctrl.activeClass]\" ng-click=\"$ctrl.setState(item.className)\" ng-mouseenter=\"$ctrl.toggle(item)\" ng-mouseleave=\"$ctrl.toggle(item)\">\r\n        <div class=\"tooltip\" ng-if=\"item.tooltipShow\">{{item.tooltip}}</div>\r\n    </div>\r\n\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("left-side-menu-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var daytimeChooseTemplate = __webpack_require__(7);

	var daytimeChoose = {
	    controller: function controller($state) {
	        this.daytimes = [{ time: 'Завтрак', active: false, state: 'breakfast' }, { time: 'Перекус 1', active: false, state: 'first-snack' }, { time: 'Обед', active: false, state: 'dinner' }, { time: 'Перекус 2', active: false, state: 'second-snack' }, { time: 'Ужин', active: false, state: 'evening-meal' }];

	        this.setState = function (daytime) {
	            $state.go('diary', { daytime: daytime.state });
	            this.daytimes.forEach(function (time) {
	                time.active = false;
	                if (time === daytime) time.active = true;
	            });
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
	var v1="<div class=\"daytime-choose\">\r\n    <div class=\"daytime\" ng-repeat=\"daytime in $ctrl.daytimes\" ng-click=\"$ctrl.setState(daytime)\" ng-class=\"{'daytime-active': daytime.active}\">{{ daytime.time }}</div>\r\n</div>";
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

	var diaryModule = angular.module('diary', []);

	diaryModule.component('menu', __webpack_require__(11)).component('mainView', __webpack_require__(13)).component('dayTime', __webpack_require__(15)).component('food', __webpack_require__(17)).component('saveMenu', __webpack_require__(19));

		module.exports = diaryModule;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var menuTemplate = __webpack_require__(12);

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
/* 12 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"menu-br\"></div>\n\n<div id=\"menu\">\n    <div class=\"diet-menu\">\n        <div class=\"diet-tittle\">Вид диеты:</div>\n        <div class=\"diet-choose\">\n            <span class=\"diet\" ng-class=\"{active: $ctrl.proteins}\" ng-click=\"$ctrl.setDiet('proteins')\">Высокопротеиновая комбинация замен</span>\n            <span class=\"slash\">/</span>\n            <span class=\"diet\" ng-class=\"{active: $ctrl.carbohydrates}\" ng-click=\"$ctrl.setDiet('carbohydrates')\">Высокоуглеводная комбинация замен</span>\n        </div>\n    </div>\n    <div class=\"phase-menu\">\n        <div class=\"phase-tittle\">Выберете Вашу фазу:</div>\n        <div class=\"phase-choose\">\n            <div id=\"arrow-left\" ng-class=\"$ctrl.className\" ng-click=\"$ctrl.moveLeft()\"></div>\n\n            <a href=\"#\" ng-class=\"$ctrl.className\" class=\"first-phase\" ng-click=\"$ctrl.setClassName(1)\">1</a>\n            <a href=\"#\" ng-class=\"$ctrl.className\" class=\"second-phase\" ng-click=\"$ctrl.setClassName(2)\">2</a>\n            <a href=\"#\" ng-class=\"$ctrl.className\" class=\"third-phase\" ng-click=\"$ctrl.setClassName(3)\">3</a>\n\n            <div id=\"arrow-right\" ng-class=\"$ctrl.className\" ng-click=\"$ctrl.moveRight()\"></div>\n        </div>\n    </div>\n</div>\n\n<div class=\"menu-br\"></div>";
	ngModule.run(["$templateCache",function(c){c.put("menu-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mainViewTemplate = __webpack_require__(14);

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
/* 14 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"main-view\">\n    <day-time ng-repeat=\"time in $ctrl.viewData.dayTimes\" time=\"time\" base=\"$ctrl.base\" day-time-limits=\"$ctrl.viewData.limitsData\" add=\"$ctrl.addFood(dayTimeId, food)\" remove=\"$ctrl.removeFood(dayTimeId, food)\" toggle=\"$ctrl.toggleDayTime(id)\"></day-time>\n\n    <div class=\"result\">\n        <div class=\"result-tittle\">Итого</div>\n\n        <section class=\"table-result\">\n            <div class=\"table-result-tittle\">\n                <span class=\"result-no-name\">----------------</span>\n                <span class=\"portion\">Порция(гр)</span>\n                <span class=\"carbohyd\">Углеводы</span>\n                <span class=\"prot\">Белки</span>\n                <span class=\"fat\">Жиры</span>\n                <span class=\"kall\">Калории</span>\n            </div>\n\n            <div class=\"result-final\">\n                <span class=\"name\"></span>\n                <span class=\"portion\">---</span>\n                <span class=\"carbohyd\" ng-class=\"{'active-limit': $ctrl.compare('carbohyd')}\">{{ $ctrl.viewData.resultFinal.carbohyd }} {{'(' + $ctrl.viewData.limitsData.limits[\"Итог\"].carbohyd + ')' | limit }}</span>\n                <span class=\"prot\" ng-class=\"{'active-limit': $ctrl.compare('prot')}\">{{ $ctrl.viewData.resultFinal.prot  }} {{'(' + $ctrl.viewData.limitsData.limits[\"Итог\"].prot + ')' | limit }}</span>\n                <span class=\"fat\" ng-class=\"{'active-limit': $ctrl.compare('fat')}\">{{ $ctrl.viewData.resultFinal.fat }} {{'(' + $ctrl.viewData.limitsData.limits[\"Итог\"].fat + ')' | limit }}</span>\n                <span class=\"kall\" ng-class=\"{'active-limit': $ctrl.compare('kall')}\">{{ $ctrl.viewData.resultFinal.kall }} {{'(' + $ctrl.viewData.limitsData.limits[\"Итог\"].kall + ')' | limit }}</span>\n            </div>\n\n        </section>\n    </div>\n</div>\n<save-menu day-times-data=\"$ctrl.viewData.dayTimes\" result=\"$ctrl.viewData.resultFinal\"></save-menu>";
	ngModule.run(["$templateCache",function(c){c.put("main-view.html",v1)}]);
	module.exports=v1;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var dayTimeTemplate = __webpack_require__(16);

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
	            this.remove({ dayTimeId: this.daytimes[this.index].id, food: food });
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
/* 16 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"day-time\">\n    <div class=\"input\">\n        <form>\n            <label>Наименование: <angucomplete-alt ng-keypress=\"$ctrl.enter($event)\" id=\"ex1\" placeholder=\"Введите продукт\" pause=\"100\" selected-object=\"$ctrl.foodName\" local-data=\"$ctrl.base.foods.keys\" search-fields=\"foodName\" title-field=\"foodName\" minlength=\"1\" input-changed=\"$ctrl.onInput\" input-class=\"food form-control-small\" match-class=\"highlight\"></angucomplete-alt></label>\n            <br>\n\n            <label>Порция(гр): <input type=\"text\" class=\"portion-input\" size=\"2\" ng-model=\"$ctrl.portion\" ng-keypress=\"$ctrl.enter($event)\"/></label>\n        </form>\n        <div class=\"add-button\" ng-click=\"$ctrl.addFood()\">+</div>\n    </div>\n\n    <div class=\"table-border\">\n        <div class=\"table\">\n            <div class=\"table-tittle\">\n                <span class=\"name\">Наименование продукта</span>\n                <span class=\"portion\">Порция(гр)</span>\n                <span class=\"carbohyd\">Углеводы</span>\n                <span class=\"prot\">Белки</span>\n                <span class=\"fat\">Жиры</span>\n                <span class=\"kall\">Калории</span>\n            </div>\n\n\n            <food ng-repeat=\"food in $ctrl.daytimes[$ctrl.index].foods\" food=\"food\" remove=\"$ctrl.removeFood(food)\"></food>\n\n\n            <div class=\"summary\">\n                <span class=\"name\">Подытог</span>\n                <span class=\"portion\">---</span>\n                <span class=\"carbohyd\" ng-class=\"{'active-limit': $ctrl.compare('carbohyd')}\">{{ $ctrl.daytimes[$ctrl.index].result.carbohyd }} {{'(' + $ctrl.limits().carbohyd + ')' | limit }}</span>\n                <span class=\"prot\" ng-class=\"{'active-limit': $ctrl.compare('prot')}\">{{ $ctrl.daytimes[$ctrl.index].result.prot }} {{'(' + $ctrl.limits().prot + ')' | limit }}</span>\n                <span class=\"fat\" ng-class=\"{'active-limit': $ctrl.compare('fat')}\">{{ $ctrl.daytimes[$ctrl.index].result.fat }} {{'(' + $ctrl.limits().fat + ')' | limit }}</span>\n                <span class=\"kall\" ng-class=\"{'active-limit': $ctrl.compare('kall')}\">{{ $ctrl.daytimes[$ctrl.index].result.kall }} {{'(' + $ctrl.limits().kall + ')' | limit }}</span>\n            </div>\n        </div>\n    </div>\n\n</div>\n\n\n<div class=\"br\"></div>";
	ngModule.run(["$templateCache",function(c){c.put("day-time-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var foodTemplate = __webpack_require__(18);

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
/* 18 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"food\" ng-class=\"$ctrl.checkEmptyFood($ctrl.food)\">\r\n    <span class=\"name\">{{ $ctrl.food.name }}</span>\r\n    <span class=\"portion\">{{ $ctrl.food.portion }}</span>\r\n    <span class=\"carbohyd\">{{ $ctrl.food.carbohyd }}</span>\r\n    <span class=\"prot\">{{ $ctrl.food.prot }}</span>\r\n    <span class=\"fat\">{{ $ctrl.food.fat }}</span>\r\n    <span class=\"kall\">{{ $ctrl.food.kall }}</span>\r\n    <div class=\"remove-food\" ng-click=\"$ctrl.remove({food: $ctrl.food})\"></div>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("food-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var saveMenuTemplate = __webpack_require__(20);

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
/* 20 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"save-menu group\">\n    <div class=\"print-button group\" ng-class=\"{'print-button-active': $ctrl.active}\" ng-click=\"$ctrl.toggle()\">Для печати</div>\n    <div class=\"save-button group\" ng-click=\"$ctrl.saveData()\">Сохранить изменения</div>\n    <div class=\"print-menu group\" ng-if=\"$ctrl.active\">\n        <div class=\"to-print\" ng-click=\"$ctrl.preview()\">Предпросмотр</div>\n        <div class=\"print-to-localStorage\" ng-click=\"$ctrl.saveForPrint()\">Сохранить для печати</div>\n        <div class=\"delte-print-localStorage\" ng-click=\"$ctrl.removePrintSaves()\">Удалить сохранения</div>\n    </div>\n</div>\n\n\n<div class=\"br\"></div>";
	ngModule.run(["$templateCache",function(c){c.put("save-menu-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var tableModule = angular.module('table', []);

	tableModule.component('tableView', __webpack_require__(22)).component('tableAdd', __webpack_require__(24)).component('foodTable', __webpack_require__(26)).component('storageTable', __webpack_require__(28));

		module.exports = tableModule;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var tableViewTemplate = __webpack_require__(23);

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
/* 23 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<table-add add-my-food=\"$ctrl.addMyFood(name, values)\"></table-add>\r\n\r\n<div class=\"table-container\">\r\n    <food-table ng-repeat=\"foodsObj in $ctrl.foodsObjs\" foods-obj=\"foodsObj\" remove=\"$ctrl.removeMyFood(food, obj)\"></food-table>\r\n    <storage-table my-foods=\"$ctrl.myFoods\" remove-my-food=\"$ctrl.removeMyFood(name)\"></storage-table>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("table-view-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var addToTableTemplate = __webpack_require__(25);

	var addToTable = {
	    bindings: {
	        addMyFood: '&'
	    },
	    controller: function controller(validationService) {
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
	    },
	    template: addToTableTemplate
	};

		module.exports = addToTable;

/***/ },
/* 25 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"add-to-table-form\">\n    <h3 class=\"add-form-title\">Добавить продукт в таблицу</h3>\n    <form class=\"table-form\">\n        <label>Наименование:\n            <input type=\"text\" class=\"food-name\" ng-model=\"$ctrl.name\" ng-keydown=\"$ctrl.add($event)\"/></label>\n        <label>Порция(гр):\n            <input type=\"text\" class=\"table-form-portion\" size=\"2\" ng-model=\"$ctrl.values[0]\" ng-keydown=\"$ctrl.add($event)\"/></label>\n        <label>Углеводы:\n            <input type=\"text\" class=\"table-form-carbohyd\" size=\"2\" ng-model=\"$ctrl.values[1]\" ng-keydown=\"$ctrl.add($event)\"/></label>\n        <label>Белки:\n            <input type=\"text\" class=\"table-form-prot\" size=\"2\" ng-model=\"$ctrl.values[2]\" ng-keydown=\"$ctrl.add($event)\"/></label>\n        <label>Жиры:\n            <input type=\"text\" class=\"table-form-fat\" size=\"2\" ng-model=\"$ctrl.values[3]\" ng-keydown=\"$ctrl.add($event)\"/></label>\n        <label>Калории:\n            <input type=\"text\" class=\"table-form-kal\" size=\"2\" ng-model=\"$ctrl.values[4]\" ng-keydown=\"$ctrl.add($event)\"/></label>\n        <div class=\"add-to-table-button\" ng-click=\"$ctrl.add()\">+</div>\n    </form>\n\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("add-to-table-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var tableTemplate = __webpack_require__(27);

	var table = {
	    bindings: {
	        foodsObj: '<',
	        remove: '&'
	    },
	    controller: function controller() {},
	    template: tableTemplate
	};

		module.exports = table;

/***/ },
/* 27 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<table class=\"tb\">\r\n    <caption class=\"tb-title\">{{ $ctrl.foodsObj.title }}</caption>\r\n    <tr ng-repeat=\"food in $ctrl.foodsObj.foods\" ng-click=\"$ctrl.remove({food: food, obj: $ctrl.foodsObj.foods})\" ng-class=\"food.className\">\r\n        <td class=\"td-name name-color\" ng-class=\"food.className\">{{ food.values.name }}</td>\r\n        <td class=\"portion-color\" ng-class=\"food.className\">{{ food.values.portion }}</td>\r\n        <td class=\"carbohyd-color\" ng-class=\"food.className\">{{ food.values.carbohyd }}</td>\r\n        <td class=\"prot-color\" ng-class=\"food.className\">{{ food.values.prot }}</td>\r\n        <td class=\"fat-color\" ng-class=\"food.className\">{{ food.values.fat }}</td>\r\n        <td class=\"kall-color\" ng-class=\"food.className\">{{ food.values.kall }}</td>\r\n    </tr>\r\n</table>";
	ngModule.run(["$templateCache",function(c){c.put("table-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var storageTableTemplate = __webpack_require__(29);

	var storageTable = {
	    bindings: {
	        myFoods: '<',
	        removeMyFood: '&'
	    },
	    controller: function controller() {
	        this.show = function () {
	            return Object.keys(this.myFoods).length > 0;
	        };
	    },
	    template: storageTableTemplate
	};

		module.exports = storageTable;

/***/ },
/* 29 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<table class=\"tb\" ng-if=\"$ctrl.show()\">\n    <caption class=\"tb-title\">Добавленые продукты</caption>\n    <tr>\n        <td class=\"td-name name-color color\">Наименование продукта</td>\n        <td class=\"portion-color color\">Порция</td>\n        <td class=\"carbohyd-color color\">Углеводы</td>\n        <td class=\"prot-color color\">Белки</td>\n        <td class=\"fat-color color\">Жиры</td>\n        <td class=\"kall-color color\">Калории</td>\n    </tr>\n\n    <tr class=\"my-food\" ng-repeat=\"(foodName, values) in $ctrl.myFoods\" ng-click=\"$ctrl.removeMyFood({name: foodName})\">\n        <td class=\"td-name\">{{ foodName }}</td>\n        <td>{{ values[0] }}</td>\n        <td>{{ values[1] }}</td>\n        <td>{{ values[2] }}</td>\n        <td>{{ values[3] }}</td>\n        <td>{{ values[4] }}</td>\n    </tr>\n</table>";
	ngModule.run(["$templateCache",function(c){c.put("storage-table-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 30 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
	    return function (value) {
	        if (value.length === 2) return '';
	        return value;
	    };
		};

/***/ },
/* 31 */
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
/* 32 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (dataService) {
	    var food = dataService.base;

	    function foodAddValidation(name, portion) {
	        if (!name) {
	            alert('Введите название продукта');
	        } else if (!food.foods[name]) {
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

	    function addMyFoodValidation(name, values) {
	        var success = true;
	        if (!name) {
	            alert('Введите наименование продукта');
	            success = false;
	            return;
	        }
	        values.forEach(function (value) {
	            if (isNaN(value) || value < 0) {
	                alert('Значения должны быть числами со значением большим или равным нулю');
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
/* 33 */
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
/* 34 */
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
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
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
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var viewTemplate = __webpack_require__(77);

	var view = {
	    controller: function controller(dataService, limitsService, $window, $stateParams, indexService) {
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

	        this.defineIndex = function () {

	            return this.viewData.dayTimes[index];
	        };
	    },
	    template: viewTemplate
	};

		module.exports = view;

/***/ },
/* 77 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<left-side-menu></left-side-menu>\r\n<daytime-choose></daytime-choose>\r\n\r\n<div class=\"main-view\" ui-view>\r\n\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("view-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 78 */
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

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIDFhOGU1M2Q2YWM0ODU2OWUyYzg5Iiwid2VicGFjazovLy9qcy9kaWFyeUFwcC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL2luZGV4LmpzIiwid2VicGFjazovLy9ub2RlX21vZHVsZXMvYW5ndWNvbXBsZXRlLWFsdC9hbmd1Y29tcGxldGUtYWx0LmpzIiwid2VicGFjazovLy9qcy9hcHAvbWFpbi1tb2R1bGUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9tYWluLW1vZHVsZS9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQvbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9tYWluLW1vZHVsZS9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQvdGVtcGxhdGUvbGVmdC1zaWRlLW1lbnUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL21haW4tbW9kdWxlL2RheXRpbWUtY2hvb3NlLWNvbXBvbmVudC9kYXl0aW1lLWNob29zZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL21haW4tbW9kdWxlL2RheXRpbWUtY2hvb3NlLWNvbXBvbmVudC90ZW1wbGF0ZS9kYXl0aW1lLWNob29zZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvbWFpbi1tb2R1bGUvaG9tZS1wYWdlLW1vZHVsZS9ob21lLXBhZ2UtbW9kdWxlLmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9tYWluLW1vZHVsZS9ob21lLXBhZ2UtbW9kdWxlL3RlbXBsYXRlL2hvbWUtcGFnZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvZGlhcnktbW9kdWxlL2luZGV4LmpzIiwid2VicGFjazovLy9qcy9hcHAvZGlhcnktbW9kdWxlL21lbnUvbWVudS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9tZW51L3RlbXBsYXRlL21lbnUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9tYWluLXZpZXcvbWFpbi12aWV3LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvZGlhcnktbW9kdWxlL21haW4tdmlldy90ZW1wbGF0ZS9tYWluLXZpZXcuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9kYXktdGltZS9kYXktdGltZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9kYXktdGltZS90ZW1wbGF0ZS9kYXktdGltZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvZGlhcnktbW9kdWxlL2Zvb2QvZm9vZC1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9mb29kL3RlbXBsYXRlL2Zvb2QtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9zYXZlLW1lbnUvc2F2ZS1tZW51LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvZGlhcnktbW9kdWxlL3NhdmUtbWVudS90ZW1wbGF0ZS9zYXZlLW1lbnUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS12aWV3LWNvbXBvbmVudC90YWJsZS12aWV3LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLXZpZXctY29tcG9uZW50L3RlbXBsYXRlL3RhYmxlLXZpZXctdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L2FkZC10by10YWJsZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLWNvbXBvbmVudC90YWJsZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS1jb21wb25lbnQvdGVtcGxhdGUvdGFibGUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9zdG9yYWdlLXRhYmxlLWNvbXBvbmVudC9zdG9yYWdlLXRhYmxlLWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvdGFibGUtbW9kdWxlL3N0b3JhZ2UtdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL3N0b3JhZ2UtdGFibGUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2xpbWl0cy1maWx0ZXIuanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9zZXJ2aWNlcy9kYXRhLXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9zZXJ2aWNlcy92YWxpZGF0aW9uLXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9zZXJ2aWNlcy9jYWxjdWxhdGlvbi1zZXJ2aWNlLmpzIiwid2VicGFjazovLy9qcy9hcHAvc2VydmljZXMvbGltaXRzLXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9tYWluLW1vZHVsZS92aWV3LWNvbXBvbmVudC92aWV3LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvbWFpbi1tb2R1bGUvdmlldy1jb21wb25lbnQvdGVtcGxhdGUvdmlldy10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvc2VydmljZXMvaW5kZXgtc2VydmljZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDFhOGU1M2Q2YWM0ODU2OWUyYzg5XG4gKiovIiwicmVxdWlyZSgnLi9hcHAnKTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9kaWFyeUFwcC5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuY29uc3QgYXV0b2NvbXBsaXRlID0gcmVxdWlyZSgnYW5ndWNvbXBsZXRlLWFsdCcpO1xyXG5jb25zdCBtYWluTW9kdWxlID0gcmVxdWlyZSgnLi9tYWluLW1vZHVsZScpO1xyXG5jb25zdCBkaWFyeU1vZHVsZSA9IHJlcXVpcmUoJy4vZGlhcnktbW9kdWxlJyk7XHJcbmNvbnN0IHRhYmxlTW9kdWxlID0gcmVxdWlyZSgnLi90YWJsZS1tb2R1bGUnKTtcclxuXHJcbmNvbnN0IGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ21haW4nLCAnZGlhcnknLCAndGFibGUnLCAnbmdBbmltYXRlJywgJ2FuZ3Vjb21wbGV0ZS1hbHQnXSk7XHJcblxyXG5hcHAuZmlsdGVyKCdsaW1pdCcsIHJlcXVpcmUoJy4vc2VydmljZXMvbGltaXRzLWZpbHRlcicpKTtcclxuYXBwXHJcbiAgICAuZmFjdG9yeSgnZGF0YVNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL2RhdGEtc2VydmljZScpKVxyXG4gICAgLmZhY3RvcnkoJ3ZhbGlkYXRpb25TZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy92YWxpZGF0aW9uLXNlcnZpY2UnKSlcclxuICAgIC5mYWN0b3J5KCdjYWxjdWxhdGlvblNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL2NhbGN1bGF0aW9uLXNlcnZpY2UnKSlcclxuICAgIC5mYWN0b3J5KCdsaW1pdHNTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9saW1pdHMtc2VydmljZScpKVxyXG4gICAgLmZhY3RvcnkoJ2luZGV4U2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvaW5kZXgtc2VydmljZScpKTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGFwcDtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvaW5kZXguanNcbiAqKi8iLCIvKlxuICogYW5ndWNvbXBsZXRlLWFsdFxuICogQXV0b2NvbXBsZXRlIGRpcmVjdGl2ZSBmb3IgQW5ndWxhckpTXG4gKiBUaGlzIGlzIGEgZm9yayBvZiBEYXJ5bCBSb3dsYW5kJ3MgYW5ndWNvbXBsZXRlIHdpdGggc29tZSBleHRyYSBmZWF0dXJlcy5cbiAqIEJ5IEhpZGVuYXJpIE5vemFraVxuICovXG5cbi8qISBDb3B5cmlnaHQgKGMpIDIwMTQgSGlkZW5hcmkgTm96YWtpIGFuZCBjb250cmlidXRvcnMgfCBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgKi9cblxuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdhbmd1Y29tcGxldGUtYWx0JywgW10pLmRpcmVjdGl2ZSgnYW5ndWNvbXBsZXRlQWx0JywgWyckcScsICckcGFyc2UnLCAnJGh0dHAnLCAnJHNjZScsICckdGltZW91dCcsICckdGVtcGxhdGVDYWNoZScsICckaW50ZXJwb2xhdGUnLCBmdW5jdGlvbiAoJHEsICRwYXJzZSwgJGh0dHAsICRzY2UsICR0aW1lb3V0LCAkdGVtcGxhdGVDYWNoZSwgJGludGVycG9sYXRlKSB7XG4gIC8vIGtleWJvYXJkIGV2ZW50c1xuICB2YXIgS0VZX0RXID0gNDA7XG4gIHZhciBLRVlfUlQgPSAzOTtcbiAgdmFyIEtFWV9VUCA9IDM4O1xuICB2YXIgS0VZX0xGID0gMzc7XG4gIHZhciBLRVlfRVMgPSAyNztcbiAgdmFyIEtFWV9FTiA9IDEzO1xuICB2YXIgS0VZX1RBQiA9IDk7XG5cbiAgdmFyIE1JTl9MRU5HVEggPSAzO1xuICB2YXIgTUFYX0xFTkdUSCA9IDUyNDI4ODsgIC8vIHRoZSBkZWZhdWx0IG1heCBsZW5ndGggcGVyIHRoZSBodG1sIG1heGxlbmd0aCBhdHRyaWJ1dGVcbiAgdmFyIFBBVVNFID0gNTAwO1xuICB2YXIgQkxVUl9USU1FT1VUID0gMjAwO1xuXG4gIC8vIHN0cmluZyBjb25zdGFudHNcbiAgdmFyIFJFUVVJUkVEX0NMQVNTID0gJ2F1dG9jb21wbGV0ZS1yZXF1aXJlZCc7XG4gIHZhciBURVhUX1NFQVJDSElORyA9ICfQn9C+0LjRgdC6Li4uJztcbiAgdmFyIFRFWFRfTk9SRVNVTFRTID0gJ9Cd0LXRgiDRgdC+0LLQv9Cw0LTQtdC90LjQuSc7XG4gIHZhciBURU1QTEFURV9VUkwgPSAnL2FuZ3Vjb21wbGV0ZS1hbHQvaW5kZXguaHRtbCc7XG5cbiAgLy8gU2V0IHRoZSBkZWZhdWx0IHRlbXBsYXRlIGZvciB0aGlzIGRpcmVjdGl2ZVxuICAkdGVtcGxhdGVDYWNoZS5wdXQoVEVNUExBVEVfVVJMLFxuICAgICc8ZGl2IGNsYXNzPVwiYW5ndWNvbXBsZXRlLWhvbGRlclwiIG5nLWNsYXNzPVwie1xcJ2FuZ3Vjb21wbGV0ZS1kcm9wZG93bi12aXNpYmxlXFwnOiBzaG93RHJvcGRvd259XCI+JyArXG4gICAgJyAgPGlucHV0IGlkPVwie3tpZH19X3ZhbHVlXCIgbmFtZT1cInt7aW5wdXROYW1lfX1cIiB0YWJpbmRleD1cInt7ZmllbGRUYWJpbmRleH19XCIgbmctY2xhc3M9XCJ7XFwnYW5ndWNvbXBsZXRlLWlucHV0LW5vdC1lbXB0eVxcJzogbm90RW1wdHl9XCIgbmctbW9kZWw9XCJzZWFyY2hTdHJcIiBuZy1kaXNhYmxlZD1cImRpc2FibGVJbnB1dFwiIHR5cGU9XCJ7e2lucHV0VHlwZX19XCIgcGxhY2Vob2xkZXI9XCJ7e3BsYWNlaG9sZGVyfX1cIiBtYXhsZW5ndGg9XCJ7e21heGxlbmd0aH19XCIgbmctZm9jdXM9XCJvbkZvY3VzSGFuZGxlcigpXCIgY2xhc3M9XCJ7e2lucHV0Q2xhc3N9fVwiIG5nLWZvY3VzPVwicmVzZXRIaWRlUmVzdWx0cygpXCIgbmctYmx1cj1cImhpZGVSZXN1bHRzKCRldmVudClcIiBhdXRvY2FwaXRhbGl6ZT1cIm9mZlwiIGF1dG9jb3JyZWN0PVwib2ZmXCIgYXV0b2NvbXBsZXRlPVwib2ZmXCIgbmctY2hhbmdlPVwiaW5wdXRDaGFuZ2VIYW5kbGVyKHNlYXJjaFN0cilcIi8+JyArXG4gICAgJyAgPGRpdiBpZD1cInt7aWR9fV9kcm9wZG93blwiIGNsYXNzPVwiYW5ndWNvbXBsZXRlLWRyb3Bkb3duXCIgbmctc2hvdz1cInNob3dEcm9wZG93blwiPicgK1xuICAgICcgICAgPGRpdiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1zZWFyY2hpbmdcIiBuZy1zaG93PVwic2VhcmNoaW5nXCIgbmctYmluZD1cInRleHRTZWFyY2hpbmdcIj48L2Rpdj4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJhbmd1Y29tcGxldGUtc2VhcmNoaW5nXCIgbmctc2hvdz1cIiFzZWFyY2hpbmcgJiYgKCFyZXN1bHRzIHx8IHJlc3VsdHMubGVuZ3RoID09IDApXCIgbmctYmluZD1cInRleHROb1Jlc3VsdHNcIj48L2Rpdj4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJhbmd1Y29tcGxldGUtcm93XCIgbmctcmVwZWF0PVwicmVzdWx0IGluIHJlc3VsdHNcIiBuZy1jbGljaz1cInNlbGVjdFJlc3VsdChyZXN1bHQpXCIgbmctbW91c2VlbnRlcj1cImhvdmVyUm93KCRpbmRleClcIiBuZy1jbGFzcz1cIntcXCdhbmd1Y29tcGxldGUtc2VsZWN0ZWQtcm93XFwnOiAkaW5kZXggPT0gY3VycmVudEluZGV4fVwiPicgK1xuICAgICcgICAgICA8ZGl2IG5nLWlmPVwiaW1hZ2VGaWVsZFwiIGNsYXNzPVwiYW5ndWNvbXBsZXRlLWltYWdlLWhvbGRlclwiPicgK1xuICAgICcgICAgICAgIDxpbWcgbmctaWY9XCJyZXN1bHQuaW1hZ2UgJiYgcmVzdWx0LmltYWdlICE9IFxcJ1xcJ1wiIG5nLXNyYz1cInt7cmVzdWx0LmltYWdlfX1cIiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1pbWFnZVwiLz4nICtcbiAgICAnICAgICAgICA8ZGl2IG5nLWlmPVwiIXJlc3VsdC5pbWFnZSAmJiByZXN1bHQuaW1hZ2UgIT0gXFwnXFwnXCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtaW1hZ2UtZGVmYXVsdFwiPjwvZGl2PicgK1xuICAgICcgICAgICA8L2Rpdj4nICtcbiAgICAnICAgICAgPGRpdiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS10aXRsZVwiIG5nLWlmPVwibWF0Y2hDbGFzc1wiIG5nLWJpbmQtaHRtbD1cInJlc3VsdC50aXRsZVwiPjwvZGl2PicgK1xuICAgICcgICAgICA8ZGl2IGNsYXNzPVwiYW5ndWNvbXBsZXRlLXRpdGxlXCIgbmctaWY9XCIhbWF0Y2hDbGFzc1wiPnt7IHJlc3VsdC50aXRsZSB9fTwvZGl2PicgK1xuICAgICcgICAgICA8ZGl2IG5nLWlmPVwibWF0Y2hDbGFzcyAmJiByZXN1bHQuZGVzY3JpcHRpb24gJiYgcmVzdWx0LmRlc2NyaXB0aW9uICE9IFxcJ1xcJ1wiIGNsYXNzPVwiYW5ndWNvbXBsZXRlLWRlc2NyaXB0aW9uXCIgbmctYmluZC1odG1sPVwicmVzdWx0LmRlc2NyaXB0aW9uXCI+PC9kaXY+JyArXG4gICAgJyAgICAgIDxkaXYgbmctaWY9XCIhbWF0Y2hDbGFzcyAmJiByZXN1bHQuZGVzY3JpcHRpb24gJiYgcmVzdWx0LmRlc2NyaXB0aW9uICE9IFxcJ1xcJ1wiIGNsYXNzPVwiYW5ndWNvbXBsZXRlLWRlc2NyaXB0aW9uXCI+e3tyZXN1bHQuZGVzY3JpcHRpb259fTwvZGl2PicgK1xuICAgICcgICAgPC9kaXY+JyArXG4gICAgJyAgPC9kaXY+JyArXG4gICAgJzwvZGl2PidcbiAgKTtcblxuICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtLCBhdHRycywgY3RybCkge1xuICAgIHZhciBpbnB1dEZpZWxkID0gZWxlbS5maW5kKCdpbnB1dCcpO1xuICAgIHZhciBtaW5sZW5ndGggPSBNSU5fTEVOR1RIO1xuICAgIHZhciBzZWFyY2hUaW1lciA9IG51bGw7XG4gICAgdmFyIGhpZGVUaW1lcjtcbiAgICB2YXIgcmVxdWlyZWRDbGFzc05hbWUgPSBSRVFVSVJFRF9DTEFTUztcbiAgICB2YXIgcmVzcG9uc2VGb3JtYXR0ZXI7XG4gICAgdmFyIHZhbGlkU3RhdGUgPSBudWxsO1xuICAgIHZhciBodHRwQ2FuY2VsbGVyID0gbnVsbDtcbiAgICB2YXIgZGQgPSBlbGVtWzBdLnF1ZXJ5U2VsZWN0b3IoJy5hbmd1Y29tcGxldGUtZHJvcGRvd24nKTtcbiAgICB2YXIgaXNTY3JvbGxPbiA9IGZhbHNlO1xuICAgIHZhciBtb3VzZWRvd25PbiA9IG51bGw7XG4gICAgdmFyIHVuYmluZEluaXRpYWxWYWx1ZTtcbiAgICB2YXIgZGlzcGxheVNlYXJjaGluZztcbiAgICB2YXIgZGlzcGxheU5vUmVzdWx0cztcblxuICAgIGVsZW0ub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgaWYgKGV2ZW50LnRhcmdldC5pZCkge1xuICAgICAgICBtb3VzZWRvd25PbiA9IGV2ZW50LnRhcmdldC5pZDtcbiAgICAgICAgaWYgKG1vdXNlZG93bk9uID09PSBzY29wZS5pZCArICdfZHJvcGRvd24nKSB7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrb3V0SGFuZGxlckZvckRyb3Bkb3duKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIG1vdXNlZG93bk9uID0gZXZlbnQudGFyZ2V0LmNsYXNzTmFtZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IHNjb3BlLmZvY3VzRmlyc3QgPyAwIDogbnVsbDtcbiAgICBzY29wZS5zZWFyY2hpbmcgPSBmYWxzZTtcbiAgICB1bmJpbmRJbml0aWFsVmFsdWUgPSBzY29wZS4kd2F0Y2goJ2luaXRpYWxWYWx1ZScsIGZ1bmN0aW9uIChuZXd2YWwpIHtcbiAgICAgIGlmIChuZXd2YWwpIHtcbiAgICAgICAgLy8gcmVtb3ZlIHNjb3BlIGxpc3RlbmVyXG4gICAgICAgIHVuYmluZEluaXRpYWxWYWx1ZSgpO1xuICAgICAgICAvLyBjaGFuZ2UgaW5wdXRcbiAgICAgICAgaGFuZGxlSW5wdXRDaGFuZ2UobmV3dmFsLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNjb3BlLiR3YXRjaCgnZmllbGRSZXF1aXJlZCcsIGZ1bmN0aW9uIChuZXd2YWwsIG9sZHZhbCkge1xuICAgICAgaWYgKG5ld3ZhbCAhPT0gb2xkdmFsKSB7XG4gICAgICAgIGlmICghbmV3dmFsKSB7XG4gICAgICAgICAgY3RybFtzY29wZS5pbnB1dE5hbWVdLiRzZXRWYWxpZGl0eShyZXF1aXJlZENsYXNzTmFtZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIXZhbGlkU3RhdGUgfHwgc2NvcGUuY3VycmVudEluZGV4ID09PSAtMSkge1xuICAgICAgICAgIGhhbmRsZVJlcXVpcmVkKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBoYW5kbGVSZXF1aXJlZCh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2NvcGUuJG9uKCdhbmd1Y29tcGxldGUtYWx0OmNsZWFySW5wdXQnLCBmdW5jdGlvbiAoZXZlbnQsIGVsZW1lbnRJZCkge1xuICAgICAgaWYgKCFlbGVtZW50SWQgfHwgZWxlbWVudElkID09PSBzY29wZS5pZCkge1xuICAgICAgICBzY29wZS5zZWFyY2hTdHIgPSBudWxsO1xuICAgICAgICBjYWxsT3JBc3NpZ24oKTtcbiAgICAgICAgaGFuZGxlUmVxdWlyZWQoZmFsc2UpO1xuICAgICAgICBjbGVhclJlc3VsdHMoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNjb3BlLiRvbignYW5ndWNvbXBsZXRlLWFsdDpjaGFuZ2VJbnB1dCcsIGZ1bmN0aW9uIChldmVudCwgZWxlbWVudElkLCBuZXd2YWwpIHtcbiAgICAgIGlmICghIWVsZW1lbnRJZCAmJiBlbGVtZW50SWQgPT09IHNjb3BlLmlkKSB7XG4gICAgICAgIGhhbmRsZUlucHV0Q2hhbmdlKG5ld3ZhbCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVJbnB1dENoYW5nZShuZXd2YWwsIGluaXRpYWwpIHtcbiAgICAgIGlmIChuZXd2YWwpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBuZXd2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgc2NvcGUuc2VhcmNoU3RyID0gZXh0cmFjdFRpdGxlKG5ld3ZhbCk7XG4gICAgICAgICAgY2FsbE9yQXNzaWduKHtvcmlnaW5hbE9iamVjdDogbmV3dmFsfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG5ld3ZhbCA9PT0gJ3N0cmluZycgJiYgbmV3dmFsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBzY29wZS5zZWFyY2hTdHIgPSBuZXd2YWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5lcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignVHJpZWQgdG8gc2V0ICcgKyAoISFpbml0aWFsID8gJ2luaXRpYWwnIDogJycpICsgJyB2YWx1ZSBvZiBhbmd1Y29tcGxldGUgdG8nLCBuZXd2YWwsICd3aGljaCBpcyBhbiBpbnZhbGlkIHZhbHVlJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaGFuZGxlUmVxdWlyZWQodHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gIzE5NCBkcm9wZG93biBsaXN0IG5vdCBjb25zaXN0ZW50IGluIGNvbGxhcHNpbmcgKGJ1ZykuXG4gICAgZnVuY3Rpb24gY2xpY2tvdXRIYW5kbGVyRm9yRHJvcGRvd24oZXZlbnQpIHtcbiAgICAgIG1vdXNlZG93bk9uID0gbnVsbDtcbiAgICAgIHNjb3BlLmhpZGVSZXN1bHRzKGV2ZW50KTtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGlja291dEhhbmRsZXJGb3JEcm9wZG93bik7XG4gICAgfVxuXG4gICAgLy8gZm9yIElFOCBxdWlya2luZXNzIGFib3V0IGV2ZW50LndoaWNoXG4gICAgZnVuY3Rpb24gaWU4RXZlbnROb3JtYWxpemVyKGV2ZW50KSB7XG4gICAgICByZXR1cm4gZXZlbnQud2hpY2ggPyBldmVudC53aGljaCA6IGV2ZW50LmtleUNvZGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsbE9yQXNzaWduKHZhbHVlKSB7XG4gICAgICBpZiAodHlwZW9mIHNjb3BlLnNlbGVjdGVkT2JqZWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNjb3BlLnNlbGVjdGVkT2JqZWN0KHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzY29wZS5zZWxlY3RlZE9iamVjdCA9IHZhbHVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgaGFuZGxlUmVxdWlyZWQodHJ1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaGFuZGxlUmVxdWlyZWQoZmFsc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGxGdW5jdGlvbk9ySWRlbnRpdHkoZm4pIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gc2NvcGVbZm5dID8gc2NvcGVbZm5dKGRhdGEpIDogZGF0YTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0SW5wdXRTdHJpbmcoc3RyKSB7XG4gICAgICBjYWxsT3JBc3NpZ24oe29yaWdpbmFsT2JqZWN0OiBzdHJ9KTtcblxuICAgICAgaWYgKHNjb3BlLmNsZWFyU2VsZWN0ZWQpIHtcbiAgICAgICAgc2NvcGUuc2VhcmNoU3RyID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4dHJhY3RUaXRsZShkYXRhKSB7XG4gICAgICAvLyBzcGxpdCB0aXRsZSBmaWVsZHMgYW5kIHJ1biBleHRyYWN0VmFsdWUgZm9yIGVhY2ggYW5kIGpvaW4gd2l0aCAnICdcbiAgICAgIHJldHVybiBzY29wZS50aXRsZUZpZWxkLnNwbGl0KCcsJylcbiAgICAgICAgLm1hcChmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgICAgICByZXR1cm4gZXh0cmFjdFZhbHVlKGRhdGEsIGZpZWxkKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmpvaW4oJyAnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHRyYWN0VmFsdWUob2JqLCBrZXkpIHtcbiAgICAgIHZhciBrZXlzLCByZXN1bHQ7XG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIGtleXMgPSBrZXkuc3BsaXQoJy4nKTtcbiAgICAgICAgcmVzdWx0ID0gb2JqO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICByZXN1bHQgPSByZXN1bHRba2V5c1tpXV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXN1bHQgPSBvYmo7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbmRNYXRjaFN0cmluZyh0YXJnZXQsIHN0cikge1xuICAgICAgdmFyIHJlc3VsdCwgbWF0Y2hlcywgcmU7XG4gICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L0d1aWRlL1JlZ3VsYXJfRXhwcmVzc2lvbnNcbiAgICAgIC8vIEVzY2FwZSB1c2VyIGlucHV0IHRvIGJlIHRyZWF0ZWQgYXMgYSBsaXRlcmFsIHN0cmluZyB3aXRoaW4gYSByZWd1bGFyIGV4cHJlc3Npb25cbiAgICAgIHJlID0gbmV3IFJlZ0V4cChzdHIucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKSwgJ2knKTtcbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghdGFyZ2V0Lm1hdGNoIHx8ICF0YXJnZXQucmVwbGFjZSkge1xuICAgICAgICB0YXJnZXQgPSB0YXJnZXQudG9TdHJpbmcoKTtcbiAgICAgIH1cbiAgICAgIG1hdGNoZXMgPSB0YXJnZXQubWF0Y2gocmUpO1xuICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgcmVzdWx0ID0gdGFyZ2V0LnJlcGxhY2UocmUsXG4gICAgICAgICAgJzxzcGFuIGNsYXNzPVwiJyArIHNjb3BlLm1hdGNoQ2xhc3MgKyAnXCI+JyArIG1hdGNoZXNbMF0gKyAnPC9zcGFuPicpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IHRhcmdldDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKHJlc3VsdCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlUmVxdWlyZWQodmFsaWQpIHtcbiAgICAgIHNjb3BlLm5vdEVtcHR5ID0gdmFsaWQ7XG4gICAgICB2YWxpZFN0YXRlID0gc2NvcGUuc2VhcmNoU3RyO1xuICAgICAgaWYgKHNjb3BlLmZpZWxkUmVxdWlyZWQgJiYgY3RybCAmJiBzY29wZS5pbnB1dE5hbWUpIHtcbiAgICAgICAgY3RybFtzY29wZS5pbnB1dE5hbWVdLiRzZXRWYWxpZGl0eShyZXF1aXJlZENsYXNzTmFtZSwgdmFsaWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGtleXVwSGFuZGxlcihldmVudCkge1xuICAgICAgdmFyIHdoaWNoID0gaWU4RXZlbnROb3JtYWxpemVyKGV2ZW50KTtcbiAgICAgIGlmICh3aGljaCA9PT0gS0VZX0xGIHx8IHdoaWNoID09PSBLRVlfUlQpIHtcbiAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh3aGljaCA9PT0gS0VZX1VQIHx8IHdoaWNoID09PSBLRVlfRU4pIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHdoaWNoID09PSBLRVlfRFcpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKCFzY29wZS5zaG93RHJvcGRvd24gJiYgc2NvcGUuc2VhcmNoU3RyICYmIHNjb3BlLnNlYXJjaFN0ci5sZW5ndGggPj0gbWlubGVuZ3RoKSB7XG4gICAgICAgICAgaW5pdFJlc3VsdHMoKTtcbiAgICAgICAgICBzY29wZS5zZWFyY2hpbmcgPSB0cnVlO1xuICAgICAgICAgIHNlYXJjaFRpbWVyQ29tcGxldGUoc2NvcGUuc2VhcmNoU3RyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAod2hpY2ggPT09IEtFWV9FUykge1xuICAgICAgICBjbGVhclJlc3VsdHMoKTtcbiAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpbnB1dEZpZWxkLnZhbChzY29wZS5zZWFyY2hTdHIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAobWlubGVuZ3RoID09PSAwICYmICFzY29wZS5zZWFyY2hTdHIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNjb3BlLnNlYXJjaFN0ciB8fCBzY29wZS5zZWFyY2hTdHIgPT09ICcnKSB7XG4gICAgICAgICAgc2NvcGUuc2hvd0Ryb3Bkb3duID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NvcGUuc2VhcmNoU3RyLmxlbmd0aCA+PSBtaW5sZW5ndGgpIHtcbiAgICAgICAgICBpbml0UmVzdWx0cygpO1xuXG4gICAgICAgICAgaWYgKHNlYXJjaFRpbWVyKSB7XG4gICAgICAgICAgICAkdGltZW91dC5jYW5jZWwoc2VhcmNoVGltZXIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNjb3BlLnNlYXJjaGluZyA9IHRydWU7XG5cbiAgICAgICAgICBzZWFyY2hUaW1lciA9ICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlYXJjaFRpbWVyQ29tcGxldGUoc2NvcGUuc2VhcmNoU3RyKTtcbiAgICAgICAgICB9LCBzY29wZS5wYXVzZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsaWRTdGF0ZSAmJiB2YWxpZFN0YXRlICE9PSBzY29wZS5zZWFyY2hTdHIgJiYgIXNjb3BlLmNsZWFyU2VsZWN0ZWQpIHtcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbE9yQXNzaWduKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVPdmVycmlkZVN1Z2dlc3Rpb25zKGV2ZW50KSB7XG4gICAgICBpZiAoc2NvcGUub3ZlcnJpZGVTdWdnZXN0aW9ucyAmJiAhKHNjb3BlLnNlbGVjdGVkT2JqZWN0ICYmIHNjb3BlLnNlbGVjdGVkT2JqZWN0Lm9yaWdpbmFsT2JqZWN0ID09PSBzY29wZS5zZWFyY2hTdHIpKSB7XG4gICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjYW5jZWwgc2VhcmNoIHRpbWVyXG4gICAgICAgICR0aW1lb3V0LmNhbmNlbChzZWFyY2hUaW1lcik7XG4gICAgICAgIC8vIGNhbmNlbCBodHRwIHJlcXVlc3RcbiAgICAgICAgY2FuY2VsSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICBzZXRJbnB1dFN0cmluZyhzY29wZS5zZWFyY2hTdHIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyb3Bkb3duUm93T2Zmc2V0SGVpZ2h0KHJvdykge1xuICAgICAgdmFyIGNzcyA9IGdldENvbXB1dGVkU3R5bGUocm93KTtcbiAgICAgIHJldHVybiByb3cub2Zmc2V0SGVpZ2h0ICtcbiAgICAgICAgcGFyc2VJbnQoY3NzLm1hcmdpblRvcCwgMTApICsgcGFyc2VJbnQoY3NzLm1hcmdpbkJvdHRvbSwgMTApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyb3Bkb3duSGVpZ2h0KCkge1xuICAgICAgcmV0dXJuIGRkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCArXG4gICAgICAgIHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUoZGQpLm1heEhlaWdodCwgMTApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyb3Bkb3duUm93KCkge1xuICAgICAgcmV0dXJuIGVsZW1bMF0ucXVlcnlTZWxlY3RvckFsbCgnLmFuZ3Vjb21wbGV0ZS1yb3cnKVtzY29wZS5jdXJyZW50SW5kZXhdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyb3Bkb3duUm93VG9wKCkge1xuICAgICAgcmV0dXJuIGRyb3Bkb3duUm93KCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wIC1cbiAgICAgICAgKGRkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCArXG4gICAgICAgIHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUoZGQpLnBhZGRpbmdUb3AsIDEwKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJvcGRvd25TY3JvbGxUb3BUbyhvZmZzZXQpIHtcbiAgICAgIGRkLnNjcm9sbFRvcCA9IGRkLnNjcm9sbFRvcCArIG9mZnNldDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVJbnB1dEZpZWxkKCkge1xuICAgICAgdmFyIGN1cnJlbnQgPSBzY29wZS5yZXN1bHRzW3Njb3BlLmN1cnJlbnRJbmRleF07XG4gICAgICBpZiAoc2NvcGUubWF0Y2hDbGFzcykge1xuICAgICAgICBpbnB1dEZpZWxkLnZhbChleHRyYWN0VGl0bGUoY3VycmVudC5vcmlnaW5hbE9iamVjdCkpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlucHV0RmllbGQudmFsKGN1cnJlbnQudGl0bGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGtleWRvd25IYW5kbGVyKGV2ZW50KSB7XG4gICAgICB2YXIgd2hpY2ggPSBpZThFdmVudE5vcm1hbGl6ZXIoZXZlbnQpO1xuICAgICAgdmFyIHJvdyA9IG51bGw7XG4gICAgICB2YXIgcm93VG9wID0gbnVsbDtcblxuICAgICAgaWYgKHdoaWNoID09PSBLRVlfRU4gJiYgc2NvcGUucmVzdWx0cykge1xuICAgICAgICBpZiAoc2NvcGUuY3VycmVudEluZGV4ID49IDAgJiYgc2NvcGUuY3VycmVudEluZGV4IDwgc2NvcGUucmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHNjb3BlLnNlbGVjdFJlc3VsdChzY29wZS5yZXN1bHRzW3Njb3BlLmN1cnJlbnRJbmRleF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhhbmRsZU92ZXJyaWRlU3VnZ2VzdGlvbnMoZXZlbnQpO1xuICAgICAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgICAgICB9XG4gICAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgICAgfSBlbHNlIGlmICh3aGljaCA9PT0gS0VZX0RXICYmIHNjb3BlLnJlc3VsdHMpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKChzY29wZS5jdXJyZW50SW5kZXggKyAxKSA8IHNjb3BlLnJlc3VsdHMubGVuZ3RoICYmIHNjb3BlLnNob3dEcm9wZG93bikge1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXgrKztcbiAgICAgICAgICAgIHVwZGF0ZUlucHV0RmllbGQoKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChpc1Njcm9sbE9uKSB7XG4gICAgICAgICAgICByb3cgPSBkcm9wZG93blJvdygpO1xuICAgICAgICAgICAgaWYgKGRyb3Bkb3duSGVpZ2h0KCkgPCByb3cuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tKSB7XG4gICAgICAgICAgICAgIGRyb3Bkb3duU2Nyb2xsVG9wVG8oZHJvcGRvd25Sb3dPZmZzZXRIZWlnaHQocm93KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHdoaWNoID09PSBLRVlfVVAgJiYgc2NvcGUucmVzdWx0cykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoc2NvcGUuY3VycmVudEluZGV4ID49IDEpIHtcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2NvcGUuY3VycmVudEluZGV4LS07XG4gICAgICAgICAgICB1cGRhdGVJbnB1dEZpZWxkKCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAoaXNTY3JvbGxPbikge1xuICAgICAgICAgICAgcm93VG9wID0gZHJvcGRvd25Sb3dUb3AoKTtcbiAgICAgICAgICAgIGlmIChyb3dUb3AgPCAwKSB7XG4gICAgICAgICAgICAgIGRyb3Bkb3duU2Nyb2xsVG9wVG8ocm93VG9wIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNjb3BlLmN1cnJlbnRJbmRleCA9PT0gMCkge1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPSAtMTtcbiAgICAgICAgICAgIGlucHV0RmllbGQudmFsKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAod2hpY2ggPT09IEtFWV9UQUIpIHtcbiAgICAgICAgaWYgKHNjb3BlLnJlc3VsdHMgJiYgc2NvcGUucmVzdWx0cy5sZW5ndGggPiAwICYmIHNjb3BlLnNob3dEcm9wZG93bikge1xuICAgICAgICAgIGlmIChzY29wZS5jdXJyZW50SW5kZXggPT09IC0xICYmIHNjb3BlLm92ZXJyaWRlU3VnZ2VzdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIGludGVudGlvbmFsbHkgbm90IHNlbmRpbmcgZXZlbnQgc28gdGhhdCBpdCBkb2VzIG5vdFxuICAgICAgICAgICAgLy8gcHJldmVudCBkZWZhdWx0IHRhYiBiZWhhdmlvclxuICAgICAgICAgICAgaGFuZGxlT3ZlcnJpZGVTdWdnZXN0aW9ucygpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzY29wZS5jdXJyZW50SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzY29wZS5zZWxlY3RSZXN1bHQoc2NvcGUucmVzdWx0c1tzY29wZS5jdXJyZW50SW5kZXhdKTtcbiAgICAgICAgICAgIHNjb3BlLiRkaWdlc3QoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gbm8gcmVzdWx0c1xuICAgICAgICAgIC8vIGludGVudGlvbmFsbHkgbm90IHNlbmRpbmcgZXZlbnQgc28gdGhhdCBpdCBkb2VzIG5vdFxuICAgICAgICAgIC8vIHByZXZlbnQgZGVmYXVsdCB0YWIgYmVoYXZpb3JcbiAgICAgICAgICBpZiAoc2NvcGUuc2VhcmNoU3RyICYmIHNjb3BlLnNlYXJjaFN0ci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBoYW5kbGVPdmVycmlkZVN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHdoaWNoID09PSBLRVlfRVMpIHtcbiAgICAgICAgLy8gVGhpcyBpcyB2ZXJ5IHNwZWNpZmljIHRvIElFMTAvMTEgIzI3MlxuICAgICAgICAvLyB3aXRob3V0IHRoaXMsIElFIGNsZWFycyB0aGUgaW5wdXQgdGV4dFxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGh0dHBTdWNjZXNzQ2FsbGJhY2tHZW4oc3RyKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHJlc3BvbnNlRGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgICAgLy8gbm9ybWFsaXplIHJldHVybiBvYmVqY3QgZnJvbSBwcm9taXNlXG4gICAgICAgIGlmICghc3RhdHVzICYmICFoZWFkZXJzICYmICFjb25maWcgJiYgcmVzcG9uc2VEYXRhLmRhdGEpIHtcbiAgICAgICAgICByZXNwb25zZURhdGEgPSByZXNwb25zZURhdGEuZGF0YTtcbiAgICAgICAgfVxuICAgICAgICBzY29wZS5zZWFyY2hpbmcgPSBmYWxzZTtcbiAgICAgICAgcHJvY2Vzc1Jlc3VsdHMoXG4gICAgICAgICAgZXh0cmFjdFZhbHVlKHJlc3BvbnNlRm9ybWF0dGVyKHJlc3BvbnNlRGF0YSksIHNjb3BlLnJlbW90ZVVybERhdGFGaWVsZCksXG4gICAgICAgICAgc3RyKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaHR0cEVycm9yQ2FsbGJhY2soZXJyb3JSZXMsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAvLyBjYW5jZWxsZWQvYWJvcnRlZFxuICAgICAgaWYgKHN0YXR1cyA9PT0gMCB8fCBzdGF0dXMgPT09IC0xKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gbm9ybWFsaXplIHJldHVybiBvYmVqY3QgZnJvbSBwcm9taXNlXG4gICAgICBpZiAoIXN0YXR1cyAmJiAhaGVhZGVycyAmJiAhY29uZmlnKSB7XG4gICAgICAgIHN0YXR1cyA9IGVycm9yUmVzLnN0YXR1cztcbiAgICAgIH1cbiAgICAgIGlmIChzY29wZS5yZW1vdGVVcmxFcnJvckNhbGxiYWNrKSB7XG4gICAgICAgIHNjb3BlLnJlbW90ZVVybEVycm9yQ2FsbGJhY2soZXJyb3JSZXMsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoY29uc29sZSAmJiBjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignaHR0cCBlcnJvcicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsSHR0cFJlcXVlc3QoKSB7XG4gICAgICBpZiAoaHR0cENhbmNlbGxlcikge1xuICAgICAgICBodHRwQ2FuY2VsbGVyLnJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRSZW1vdGVSZXN1bHRzKHN0cikge1xuICAgICAgdmFyIHBhcmFtcyA9IHt9LFxuICAgICAgICB1cmwgPSBzY29wZS5yZW1vdGVVcmwgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyKTtcbiAgICAgIGlmIChzY29wZS5yZW1vdGVVcmxSZXF1ZXN0Rm9ybWF0dGVyKSB7XG4gICAgICAgIHBhcmFtcyA9IHtwYXJhbXM6IHNjb3BlLnJlbW90ZVVybFJlcXVlc3RGb3JtYXR0ZXIoc3RyKX07XG4gICAgICAgIHVybCA9IHNjb3BlLnJlbW90ZVVybDtcbiAgICAgIH1cbiAgICAgIGlmICghIXNjb3BlLnJlbW90ZVVybFJlcXVlc3RXaXRoQ3JlZGVudGlhbHMpIHtcbiAgICAgICAgcGFyYW1zLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICB9XG4gICAgICBjYW5jZWxIdHRwUmVxdWVzdCgpO1xuICAgICAgaHR0cENhbmNlbGxlciA9ICRxLmRlZmVyKCk7XG4gICAgICBwYXJhbXMudGltZW91dCA9IGh0dHBDYW5jZWxsZXIucHJvbWlzZTtcbiAgICAgICRodHRwLmdldCh1cmwsIHBhcmFtcylcbiAgICAgICAgLnN1Y2Nlc3MoaHR0cFN1Y2Nlc3NDYWxsYmFja0dlbihzdHIpKVxuICAgICAgICAuZXJyb3IoaHR0cEVycm9yQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFJlbW90ZVJlc3VsdHNXaXRoQ3VzdG9tSGFuZGxlcihzdHIpIHtcbiAgICAgIGNhbmNlbEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgIGh0dHBDYW5jZWxsZXIgPSAkcS5kZWZlcigpO1xuXG4gICAgICBzY29wZS5yZW1vdGVBcGlIYW5kbGVyKHN0ciwgaHR0cENhbmNlbGxlci5wcm9taXNlKVxuICAgICAgICAudGhlbihodHRwU3VjY2Vzc0NhbGxiYWNrR2VuKHN0cikpXG4gICAgICAgIC5jYXRjaChodHRwRXJyb3JDYWxsYmFjayk7XG5cbiAgICAgIC8qIElFOCBjb21wYXRpYmxlXG4gICAgICAgc2NvcGUucmVtb3RlQXBpSGFuZGxlcihzdHIsIGh0dHBDYW5jZWxsZXIucHJvbWlzZSlcbiAgICAgICBbJ3RoZW4nXShodHRwU3VjY2Vzc0NhbGxiYWNrR2VuKHN0cikpXG4gICAgICAgWydjYXRjaCddKGh0dHBFcnJvckNhbGxiYWNrKTtcbiAgICAgICAqL1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFyUmVzdWx0cygpIHtcbiAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IGZhbHNlO1xuICAgICAgc2NvcGUucmVzdWx0cyA9IFtdO1xuICAgICAgaWYgKGRkKSB7XG4gICAgICAgIGRkLnNjcm9sbFRvcCA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdFJlc3VsdHMoKSB7XG4gICAgICBzY29wZS5zaG93RHJvcGRvd24gPSBkaXNwbGF5U2VhcmNoaW5nO1xuICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gc2NvcGUuZm9jdXNGaXJzdCA/IDAgOiAtMTtcbiAgICAgIHNjb3BlLnJlc3VsdHMgPSBbXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRMb2NhbFJlc3VsdHMoc3RyKSB7XG4gICAgICB2YXIgaSwgbWF0Y2gsIHMsIHZhbHVlLFxuICAgICAgICBzZWFyY2hGaWVsZHMgPSBzY29wZS5zZWFyY2hGaWVsZHMuc3BsaXQoJywnKSxcbiAgICAgICAgbWF0Y2hlcyA9IFtdO1xuICAgICAgaWYgKHR5cGVvZiBzY29wZS5wYXJzZUlucHV0KCkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHN0ciA9IHNjb3BlLnBhcnNlSW5wdXQoKShzdHIpO1xuICAgICAgfVxuICAgICAgZm9yIChpID0gMDsgaSA8IHNjb3BlLmxvY2FsRGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBtYXRjaCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAocyA9IDA7IHMgPCBzZWFyY2hGaWVsZHMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICB2YWx1ZSA9IGV4dHJhY3RWYWx1ZShzY29wZS5sb2NhbERhdGFbaV0sIHNlYXJjaEZpZWxkc1tzXSkgfHwgJyc7XG4gICAgICAgICAgbWF0Y2ggPSBtYXRjaCB8fCAodmFsdWUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc3RyLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSkgPj0gMCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICBtYXRjaGVzW21hdGNoZXMubGVuZ3RoXSA9IHNjb3BlLmxvY2FsRGF0YVtpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hlY2tFeGFjdE1hdGNoKHJlc3VsdCwgb2JqLCBzdHIpIHtcbiAgICAgIGlmICghc3RyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKG9ialtrZXldLnRvTG93ZXJDYXNlKCkgPT09IHN0ci50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgc2NvcGUuc2VsZWN0UmVzdWx0KHJlc3VsdCk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZWFyY2hUaW1lckNvbXBsZXRlKHN0cikge1xuICAgICAgLy8gQmVnaW4gdGhlIHNlYXJjaFxuICAgICAgaWYgKCFzdHIgfHwgc3RyLmxlbmd0aCA8IG1pbmxlbmd0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoc2NvcGUubG9jYWxEYXRhKSB7XG4gICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIG1hdGNoZXM7XG4gICAgICAgICAgaWYgKHR5cGVvZiBzY29wZS5sb2NhbFNlYXJjaCgpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgbWF0Y2hlcyA9IHNjb3BlLmxvY2FsU2VhcmNoKCkoc3RyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWF0Y2hlcyA9IGdldExvY2FsUmVzdWx0cyhzdHIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzY29wZS5zZWFyY2hpbmcgPSBmYWxzZTtcbiAgICAgICAgICBwcm9jZXNzUmVzdWx0cyhtYXRjaGVzLCBzdHIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHNjb3BlLnJlbW90ZUFwaUhhbmRsZXIpIHtcbiAgICAgICAgZ2V0UmVtb3RlUmVzdWx0c1dpdGhDdXN0b21IYW5kbGVyKHN0cik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnZXRSZW1vdGVSZXN1bHRzKHN0cik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvY2Vzc1Jlc3VsdHMocmVzcG9uc2VEYXRhLCBzdHIpIHtcbiAgICAgIHZhciBpLCBkZXNjcmlwdGlvbiwgaW1hZ2UsIHRleHQsIGZvcm1hdHRlZFRleHQsIGZvcm1hdHRlZERlc2M7XG5cbiAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2NvcGUucmVzdWx0cyA9IFtdO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCByZXNwb25zZURhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoc2NvcGUudGl0bGVGaWVsZCAmJiBzY29wZS50aXRsZUZpZWxkICE9PSAnJykge1xuICAgICAgICAgICAgdGV4dCA9IGZvcm1hdHRlZFRleHQgPSBleHRyYWN0VGl0bGUocmVzcG9uc2VEYXRhW2ldKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkZXNjcmlwdGlvbiA9ICcnO1xuICAgICAgICAgIGlmIChzY29wZS5kZXNjcmlwdGlvbkZpZWxkKSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9IGZvcm1hdHRlZERlc2MgPSBleHRyYWN0VmFsdWUocmVzcG9uc2VEYXRhW2ldLCBzY29wZS5kZXNjcmlwdGlvbkZpZWxkKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpbWFnZSA9ICcnO1xuICAgICAgICAgIGlmIChzY29wZS5pbWFnZUZpZWxkKSB7XG4gICAgICAgICAgICBpbWFnZSA9IGV4dHJhY3RWYWx1ZShyZXNwb25zZURhdGFbaV0sIHNjb3BlLmltYWdlRmllbGQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzY29wZS5tYXRjaENsYXNzKSB7XG4gICAgICAgICAgICBmb3JtYXR0ZWRUZXh0ID0gZmluZE1hdGNoU3RyaW5nKHRleHQsIHN0cik7XG4gICAgICAgICAgICBmb3JtYXR0ZWREZXNjID0gZmluZE1hdGNoU3RyaW5nKGRlc2NyaXB0aW9uLCBzdHIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNjb3BlLnJlc3VsdHNbc2NvcGUucmVzdWx0cy5sZW5ndGhdID0ge1xuICAgICAgICAgICAgdGl0bGU6IGZvcm1hdHRlZFRleHQsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZm9ybWF0dGVkRGVzYyxcbiAgICAgICAgICAgIGltYWdlOiBpbWFnZSxcbiAgICAgICAgICAgIG9yaWdpbmFsT2JqZWN0OiByZXNwb25zZURhdGFbaV1cbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjb3BlLnJlc3VsdHMgPSBbXTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNjb3BlLmF1dG9NYXRjaCAmJiBzY29wZS5yZXN1bHRzLmxlbmd0aCA9PT0gMSAmJlxuICAgICAgICBjaGVja0V4YWN0TWF0Y2goc2NvcGUucmVzdWx0c1swXSxcbiAgICAgICAgICB7dGl0bGU6IHRleHQsIGRlc2M6IGRlc2NyaXB0aW9uIHx8ICcnfSwgc2NvcGUuc2VhcmNoU3RyKSkge1xuICAgICAgICBzY29wZS5zaG93RHJvcGRvd24gPSBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoc2NvcGUucmVzdWx0cy5sZW5ndGggPT09IDAgJiYgIWRpc3BsYXlOb1Jlc3VsdHMpIHtcbiAgICAgICAgc2NvcGUuc2hvd0Ryb3Bkb3duID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY29wZS5zaG93RHJvcGRvd24gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNob3dBbGwoKSB7XG4gICAgICBpZiAoc2NvcGUubG9jYWxEYXRhKSB7XG4gICAgICAgIHByb2Nlc3NSZXN1bHRzKHNjb3BlLmxvY2FsRGF0YSwgJycpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoc2NvcGUucmVtb3RlQXBpSGFuZGxlcikge1xuICAgICAgICBnZXRSZW1vdGVSZXN1bHRzV2l0aEN1c3RvbUhhbmRsZXIoJycpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGdldFJlbW90ZVJlc3VsdHMoJycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNjb3BlLm9uRm9jdXNIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHNjb3BlLmZvY3VzSW4pIHtcbiAgICAgICAgc2NvcGUuZm9jdXNJbigpO1xuICAgICAgfVxuICAgICAgaWYgKG1pbmxlbmd0aCA9PT0gMCAmJiAoIXNjb3BlLnNlYXJjaFN0ciB8fCBzY29wZS5zZWFyY2hTdHIubGVuZ3RoID09PSAwKSkge1xuICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPSBzY29wZS5mb2N1c0ZpcnN0ID8gMCA6IHNjb3BlLmN1cnJlbnRJbmRleDtcbiAgICAgICAgc2NvcGUuc2hvd0Ryb3Bkb3duID0gdHJ1ZTtcbiAgICAgICAgc2hvd0FsbCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBzY29wZS5oaWRlUmVzdWx0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChtb3VzZWRvd25PbiAmJlxuICAgICAgICAobW91c2Vkb3duT24gPT09IHNjb3BlLmlkICsgJ19kcm9wZG93bicgfHxcbiAgICAgICAgbW91c2Vkb3duT24uaW5kZXhPZignYW5ndWNvbXBsZXRlJykgPj0gMCkpIHtcbiAgICAgICAgbW91c2Vkb3duT24gPSBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGhpZGVUaW1lciA9ICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjbGVhclJlc3VsdHMoKTtcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHNjb3BlLnNlYXJjaFN0ciAmJiBzY29wZS5zZWFyY2hTdHIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBpbnB1dEZpZWxkLnZhbChzY29wZS5zZWFyY2hTdHIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBCTFVSX1RJTUVPVVQpO1xuICAgICAgICBjYW5jZWxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgIGlmIChzY29wZS5mb2N1c091dCkge1xuICAgICAgICAgIHNjb3BlLmZvY3VzT3V0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2NvcGUub3ZlcnJpZGVTdWdnZXN0aW9ucykge1xuICAgICAgICAgIGlmIChzY29wZS5zZWFyY2hTdHIgJiYgc2NvcGUuc2VhcmNoU3RyLmxlbmd0aCA+IDAgJiYgc2NvcGUuY3VycmVudEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgaGFuZGxlT3ZlcnJpZGVTdWdnZXN0aW9ucygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBzY29wZS5yZXNldEhpZGVSZXN1bHRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGhpZGVUaW1lcikge1xuICAgICAgICAkdGltZW91dC5jYW5jZWwoaGlkZVRpbWVyKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2NvcGUuaG92ZXJSb3cgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IGluZGV4O1xuICAgIH07XG5cbiAgICBzY29wZS5zZWxlY3RSZXN1bHQgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAvLyBSZXN0b3JlIG9yaWdpbmFsIHZhbHVlc1xuICAgICAgaWYgKHNjb3BlLm1hdGNoQ2xhc3MpIHtcbiAgICAgICAgcmVzdWx0LnRpdGxlID0gZXh0cmFjdFRpdGxlKHJlc3VsdC5vcmlnaW5hbE9iamVjdCk7XG4gICAgICAgIHJlc3VsdC5kZXNjcmlwdGlvbiA9IGV4dHJhY3RWYWx1ZShyZXN1bHQub3JpZ2luYWxPYmplY3QsIHNjb3BlLmRlc2NyaXB0aW9uRmllbGQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2NvcGUuY2xlYXJTZWxlY3RlZCkge1xuICAgICAgICBzY29wZS5zZWFyY2hTdHIgPSBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IHJlc3VsdC50aXRsZTtcbiAgICAgIH1cbiAgICAgIGNhbGxPckFzc2lnbihyZXN1bHQpO1xuICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgfTtcblxuICAgIHNjb3BlLmlucHV0Q2hhbmdlSGFuZGxlciA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgIGlmIChzdHIubGVuZ3RoIDwgbWlubGVuZ3RoKSB7XG4gICAgICAgIGNhbmNlbEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoc3RyLmxlbmd0aCA9PT0gMCAmJiBtaW5sZW5ndGggPT09IDApIHtcbiAgICAgICAgc2NvcGUuc2VhcmNoaW5nID0gZmFsc2U7XG4gICAgICAgIHNob3dBbGwoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNjb3BlLmlucHV0Q2hhbmdlZCkge1xuICAgICAgICBzdHIgPSBzY29wZS5pbnB1dENoYW5nZWQoc3RyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHI7XG4gICAgfTtcblxuICAgIC8vIGNoZWNrIHJlcXVpcmVkXG4gICAgaWYgKHNjb3BlLmZpZWxkUmVxdWlyZWRDbGFzcyAmJiBzY29wZS5maWVsZFJlcXVpcmVkQ2xhc3MgIT09ICcnKSB7XG4gICAgICByZXF1aXJlZENsYXNzTmFtZSA9IHNjb3BlLmZpZWxkUmVxdWlyZWRDbGFzcztcbiAgICB9XG5cbiAgICAvLyBjaGVjayBtaW4gbGVuZ3RoXG4gICAgaWYgKHNjb3BlLm1pbmxlbmd0aCAmJiBzY29wZS5taW5sZW5ndGggIT09ICcnKSB7XG4gICAgICBtaW5sZW5ndGggPSBwYXJzZUludChzY29wZS5taW5sZW5ndGgsIDEwKTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayBwYXVzZSB0aW1lXG4gICAgaWYgKCFzY29wZS5wYXVzZSkge1xuICAgICAgc2NvcGUucGF1c2UgPSBQQVVTRTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayBjbGVhclNlbGVjdGVkXG4gICAgaWYgKCFzY29wZS5jbGVhclNlbGVjdGVkKSB7XG4gICAgICBzY29wZS5jbGVhclNlbGVjdGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgb3ZlcnJpZGUgc3VnZ2VzdGlvbnNcbiAgICBpZiAoIXNjb3BlLm92ZXJyaWRlU3VnZ2VzdGlvbnMpIHtcbiAgICAgIHNjb3BlLm92ZXJyaWRlU3VnZ2VzdGlvbnMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayByZXF1aXJlZCBmaWVsZFxuICAgIGlmIChzY29wZS5maWVsZFJlcXVpcmVkICYmIGN0cmwpIHtcbiAgICAgIC8vIGNoZWNrIGluaXRpYWwgdmFsdWUsIGlmIGdpdmVuLCBzZXQgdmFsaWRpdGl0eSB0byB0cnVlXG4gICAgICBpZiAoc2NvcGUuaW5pdGlhbFZhbHVlKSB7XG4gICAgICAgIGhhbmRsZVJlcXVpcmVkKHRydWUpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGhhbmRsZVJlcXVpcmVkKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzY29wZS5pbnB1dFR5cGUgPSBhdHRycy50eXBlID8gYXR0cnMudHlwZSA6ICd0ZXh0JztcblxuICAgIC8vIHNldCBzdHJpbmdzIGZvciBcIlNlYXJjaGluZy4uLlwiIGFuZCBcIk5vIHJlc3VsdHNcIlxuICAgIHNjb3BlLnRleHRTZWFyY2hpbmcgPSBhdHRycy50ZXh0U2VhcmNoaW5nID8gYXR0cnMudGV4dFNlYXJjaGluZyA6IFRFWFRfU0VBUkNISU5HO1xuICAgIHNjb3BlLnRleHROb1Jlc3VsdHMgPSBhdHRycy50ZXh0Tm9SZXN1bHRzID8gYXR0cnMudGV4dE5vUmVzdWx0cyA6IFRFWFRfTk9SRVNVTFRTO1xuICAgIGRpc3BsYXlTZWFyY2hpbmcgPSBzY29wZS50ZXh0U2VhcmNoaW5nID09PSAnZmFsc2UnID8gZmFsc2UgOiB0cnVlO1xuICAgIGRpc3BsYXlOb1Jlc3VsdHMgPSBzY29wZS50ZXh0Tm9SZXN1bHRzID09PSAnZmFsc2UnID8gZmFsc2UgOiB0cnVlO1xuXG4gICAgLy8gc2V0IG1heCBsZW5ndGggKGRlZmF1bHQgdG8gbWF4bGVuZ3RoIGRlYXVsdCBmcm9tIGh0bWxcbiAgICBzY29wZS5tYXhsZW5ndGggPSBhdHRycy5tYXhsZW5ndGggPyBhdHRycy5tYXhsZW5ndGggOiBNQVhfTEVOR1RIO1xuXG4gICAgLy8gcmVnaXN0ZXIgZXZlbnRzXG4gICAgaW5wdXRGaWVsZC5vbigna2V5ZG93bicsIGtleWRvd25IYW5kbGVyKTtcbiAgICBpbnB1dEZpZWxkLm9uKCdrZXl1cCcsIGtleXVwSGFuZGxlcik7XG5cbiAgICAvLyBzZXQgcmVzcG9uc2UgZm9ybWF0dGVyXG4gICAgcmVzcG9uc2VGb3JtYXR0ZXIgPSBjYWxsRnVuY3Rpb25PcklkZW50aXR5KCdyZW1vdGVVcmxSZXNwb25zZUZvcm1hdHRlcicpO1xuXG4gICAgLy8gc2V0IGlzU2Nyb2xsT25cbiAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY3NzID0gZ2V0Q29tcHV0ZWRTdHlsZShkZCk7XG4gICAgICBpc1Njcm9sbE9uID0gY3NzLm1heEhlaWdodCAmJiBjc3Mub3ZlcmZsb3dZID09PSAnYXV0byc7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgIHJlcXVpcmU6ICdeP2Zvcm0nLFxuICAgIHNjb3BlOiB7XG4gICAgICBzZWxlY3RlZE9iamVjdDogJz0nLFxuICAgICAgZGlzYWJsZUlucHV0OiAnPScsXG4gICAgICBpbml0aWFsVmFsdWU6ICc9JyxcbiAgICAgIGxvY2FsRGF0YTogJz0nLFxuICAgICAgbG9jYWxTZWFyY2g6ICcmJyxcbiAgICAgIHJlbW90ZVVybFJlcXVlc3RGb3JtYXR0ZXI6ICc9JyxcbiAgICAgIHJlbW90ZVVybFJlcXVlc3RXaXRoQ3JlZGVudGlhbHM6ICdAJyxcbiAgICAgIHJlbW90ZVVybFJlc3BvbnNlRm9ybWF0dGVyOiAnPScsXG4gICAgICByZW1vdGVVcmxFcnJvckNhbGxiYWNrOiAnPScsXG4gICAgICByZW1vdGVBcGlIYW5kbGVyOiAnPScsXG4gICAgICBpZDogJ0AnLFxuICAgICAgdHlwZTogJ0AnLFxuICAgICAgcGxhY2Vob2xkZXI6ICdAJyxcbiAgICAgIHJlbW90ZVVybDogJ0AnLFxuICAgICAgcmVtb3RlVXJsRGF0YUZpZWxkOiAnQCcsXG4gICAgICB0aXRsZUZpZWxkOiAnQCcsXG4gICAgICBkZXNjcmlwdGlvbkZpZWxkOiAnQCcsXG4gICAgICBpbWFnZUZpZWxkOiAnQCcsXG4gICAgICBpbnB1dENsYXNzOiAnQCcsXG4gICAgICBwYXVzZTogJ0AnLFxuICAgICAgc2VhcmNoRmllbGRzOiAnQCcsXG4gICAgICBtaW5sZW5ndGg6ICdAJyxcbiAgICAgIG1hdGNoQ2xhc3M6ICdAJyxcbiAgICAgIGNsZWFyU2VsZWN0ZWQ6ICdAJyxcbiAgICAgIG92ZXJyaWRlU3VnZ2VzdGlvbnM6ICdAJyxcbiAgICAgIGZpZWxkUmVxdWlyZWQ6ICc9JyxcbiAgICAgIGZpZWxkUmVxdWlyZWRDbGFzczogJ0AnLFxuICAgICAgaW5wdXRDaGFuZ2VkOiAnPScsXG4gICAgICBhdXRvTWF0Y2g6ICdAJyxcbiAgICAgIGZvY3VzT3V0OiAnJicsXG4gICAgICBmb2N1c0luOiAnJicsXG4gICAgICBmaWVsZFRhYmluZGV4OiAnQCcsXG4gICAgICBpbnB1dE5hbWU6ICdAJyxcbiAgICAgIGZvY3VzRmlyc3Q6ICdAJyxcbiAgICAgIHBhcnNlSW5wdXQ6ICcmJ1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uIChlbGVtZW50LCBhdHRycykge1xuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8IFRFTVBMQVRFX1VSTDtcbiAgICB9LFxuICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0RWxlbWVudCkge1xuICAgICAgdmFyIHN0YXJ0U3ltID0gJGludGVycG9sYXRlLnN0YXJ0U3ltYm9sKCk7XG4gICAgICB2YXIgZW5kU3ltID0gJGludGVycG9sYXRlLmVuZFN5bWJvbCgpO1xuICAgICAgaWYgKCEoc3RhcnRTeW0gPT09ICd7eycgJiYgZW5kU3ltID09PSAnfX0nKSkge1xuICAgICAgICB2YXIgaW50ZXJwb2xhdGVkSHRtbCA9IHRFbGVtZW50Lmh0bWwoKVxuICAgICAgICAgIC5yZXBsYWNlKC9cXHtcXHsvZywgc3RhcnRTeW0pXG4gICAgICAgICAgLnJlcGxhY2UoL1xcfVxcfS9nLCBlbmRTeW0pO1xuICAgICAgICB0RWxlbWVudC5odG1sKGludGVycG9sYXRlZEh0bWwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxpbms7XG4gICAgfVxuICB9O1xufV0pO1xuXG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIG5vZGVfbW9kdWxlcy9hbmd1Y29tcGxldGUtYWx0L2FuZ3Vjb21wbGV0ZS1hbHQuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBtYWluID0gYW5ndWxhci5tb2R1bGUoJ21haW4nLCBbJ3VpLnJvdXRlciddKTtcclxuXHJcbm1haW5cclxuICAgIC5jb21wb25lbnQoJ2xlZnRTaWRlTWVudScsIHJlcXVpcmUoJy4vbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50L2xlZnQtc2lkZS1tZW51LWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgnZGF5dGltZUNob29zZScsIHJlcXVpcmUoJy4vZGF5dGltZS1jaG9vc2UtY29tcG9uZW50L2RheXRpbWUtY2hvb3NlLWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgnaG9tZScsIHJlcXVpcmUoJy4vaG9tZS1wYWdlLW1vZHVsZS9ob21lLXBhZ2UtbW9kdWxlJykpXHJcbiAgICAuY29tcG9uZW50KCd2aWV3JywgcmVxdWlyZSgnLi92aWV3LWNvbXBvbmVudC92aWV3LWNvbXBvbmVudCcpKTtcclxuXHJcbm1haW4uY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgICAkc3RhdGVQcm92aWRlclxyXG4gICAgICAgIC5zdGF0ZSgnaG9tZScsIHtcclxuICAgICAgICAgICAgdXJsOiAnL2hvbWUnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxob21lPjwvaG9tZT4nXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuc3RhdGUoJ2RpYXJ5Jywge1xyXG4gICAgICAgICAgICB1cmw6ICcvZGlhcnkvOmRheXRpbWUnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxkYXktdGltZSBiYXNlPVwiJGN0cmwuYmFzZVwiIGRheXRpbWVzPVwiJGN0cmwudmlld0RhdGEuZGF5VGltZXNcIiBhZGQ9XCIkY3RybC5hZGRGb29kKGRheVRpbWVJZCwgZm9vZClcIiByZW1vdmU9XCIkY3RybC5yZW1vdmVGb29kKGRheVRpbWVJZCwgZm9vZClcIiBkYXktdGltZS1saW1pdHM9XCIkY3RybC52aWV3RGF0YS5saW1pdHNEYXRhXCI+PC9kYXktdGltZT4nXHJcbiAgICAgICAgfSlcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1haW47XHJcblxyXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvbWFpbi1tb2R1bGUvaW5kZXguanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBsZWZ0U2lkZU1lbnVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvbGVmdC1zaWRlLW1lbnUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgbGVmdFNpZGVNZW51ID0ge1xyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMubWVudUl0ZW1zID0gW1xyXG4gICAgICAgICAgICB7Y2xhc3NOYW1lOiAnaG9tZScsIHRvb2x0aXA6ICfQndCwINCz0LvQsNCy0L3Rg9GOJywgdG9vbHRpcFNob3c6IGZhbHNlfSxcclxuICAgICAgICAgICAge2NsYXNzTmFtZTogJ3NldHRpbmdzJywgdG9vbHRpcDogJ9Cd0LDRgdGC0YDQvtC50LrQuCcsIHRvb2x0aXBTaG93OiBmYWxzZX0sXHJcbiAgICAgICAgICAgIHtjbGFzc05hbWU6ICdyZXN1bHQnLCB0b29sdGlwOiAn0JjRgtC+0LMg0LTQvdGPJywgdG9vbHRpcFNob3c6IGZhbHNlfSxcclxuICAgICAgICAgICAge2NsYXNzTmFtZTogJ3ByaW50JywgdG9vbHRpcDogJ9CU0LvRjyDQv9C10YfQsNGC0LgnLCB0b29sdGlwU2hvdzogZmFsc2V9LFxyXG4gICAgICAgICAgICB7Y2xhc3NOYW1lOiAnc2F2ZScsIHRvb2x0aXA6ICfQodC+0YXRgNCw0L3QuNGC0YwnLCB0b29sdGlwU2hvdzogZmFsc2V9LFxyXG4gICAgICAgICAgICB7Y2xhc3NOYW1lOiAndGFibGVzJywgdG9vbHRpcDogJ9Ci0LDQsdC70LjRhtGLJywgdG9vbHRpcFNob3c6IGZhbHNlfSxcclxuICAgICAgICAgICAge2NsYXNzTmFtZTogJ2FkZC1mb29kJywgdG9vbHRpcDogJ9CU0L7QsdCw0LLQuNGC0Ywg0LXQtNGDINCyINGC0LDQsdC70LjRhtGDJywgdG9vbHRpcFNob3c6IGZhbHNlfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHRoaXMudG9nZ2xlID0gZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5jbGFzc05hbWUgPT09IHRoaXMuYWN0aXZlQ2xhc3MpIHJldHVybjtcclxuICAgICAgICAgICAgaXRlbS50b29sdGlwU2hvdyA9ICFpdGVtLnRvb2x0aXBTaG93O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbihjbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlQ2xhc3MgPSAnYWN0aXZlLScgKyBjbGFzc05hbWU7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgKCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IG51bWIgPSBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIDMpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tJY29uQ2xhc3NOYW1lID0gJ2ljb24nICsgbnVtYjtcclxuICAgICAgICB9KSgpXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGxlZnRTaWRlTWVudVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGxlZnRTaWRlTWVudTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvbWFpbi1tb2R1bGUvbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50L2xlZnQtc2lkZS1tZW51LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwibGVmdC1zaWRlLW1lbnVcXFwiPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJ0by1hbm90aGVyLWRlc2lnblxcXCIgbmctY2xhc3M9XFxcIiRjdHJsLmJhY2tJY29uQ2xhc3NOYW1lXFxcIj48L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwibWVudS1pdGVtXFxcIiBuZy1yZXBlYXQ9XFxcIml0ZW0gaW4gJGN0cmwubWVudUl0ZW1zXFxcIiBuZy1jbGFzcz1cXFwiW2l0ZW0uY2xhc3NOYW1lLCAkY3RybC5hY3RpdmVDbGFzc11cXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zZXRTdGF0ZShpdGVtLmNsYXNzTmFtZSlcXFwiIG5nLW1vdXNlZW50ZXI9XFxcIiRjdHJsLnRvZ2dsZShpdGVtKVxcXCIgbmctbW91c2VsZWF2ZT1cXFwiJGN0cmwudG9nZ2xlKGl0ZW0pXFxcIj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInRvb2x0aXBcXFwiIG5nLWlmPVxcXCJpdGVtLnRvb2x0aXBTaG93XFxcIj57e2l0ZW0udG9vbHRpcH19PC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcblxcclxcbjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJsZWZ0LXNpZGUtbWVudS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC9tYWluLW1vZHVsZS9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQvdGVtcGxhdGUvbGVmdC1zaWRlLW1lbnUtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGRheXRpbWVDaG9vc2VUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvZGF5dGltZS1jaG9vc2UtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgZGF5dGltZUNob29zZSA9IHtcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMuZGF5dGltZXMgPSBbXHJcbiAgICAgICAgICAgIHt0aW1lOiAn0JfQsNCy0YLRgNCw0LonLCBhY3RpdmU6IGZhbHNlLCBzdGF0ZTogJ2JyZWFrZmFzdCd9LFxyXG4gICAgICAgICAgICB7dGltZTogJ9Cf0LXRgNC10LrRg9GBIDEnLCBhY3RpdmU6IGZhbHNlLCBzdGF0ZTogJ2ZpcnN0LXNuYWNrJ30sXHJcbiAgICAgICAgICAgIHt0aW1lOiAn0J7QsdC10LQnLCBhY3RpdmU6IGZhbHNlLCBzdGF0ZTogJ2Rpbm5lcid9LFxyXG4gICAgICAgICAgICB7dGltZTogJ9Cf0LXRgNC10LrRg9GBIDInLCBhY3RpdmU6IGZhbHNlLCBzdGF0ZTogJ3NlY29uZC1zbmFjayd9LFxyXG4gICAgICAgICAgICB7dGltZTogJ9Cj0LbQuNC9JywgYWN0aXZlOiBmYWxzZSwgc3RhdGU6ICdldmVuaW5nLW1lYWwnfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbihkYXl0aW1lKSB7XHJcbiAgICAgICAgICAgICRzdGF0ZS5nbygnZGlhcnknLCB7ZGF5dGltZTogZGF5dGltZS5zdGF0ZX0pO1xyXG4gICAgICAgICAgICB0aGlzLmRheXRpbWVzLmZvckVhY2goKHRpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRpbWUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodGltZSA9PT0gZGF5dGltZSkgdGltZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogZGF5dGltZUNob29zZVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRheXRpbWVDaG9vc2U7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL21haW4tbW9kdWxlL2RheXRpbWUtY2hvb3NlLWNvbXBvbmVudC9kYXl0aW1lLWNob29zZS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcImRheXRpbWUtY2hvb3NlXFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiZGF5dGltZVxcXCIgbmctcmVwZWF0PVxcXCJkYXl0aW1lIGluICRjdHJsLmRheXRpbWVzXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2V0U3RhdGUoZGF5dGltZSlcXFwiIG5nLWNsYXNzPVxcXCJ7J2RheXRpbWUtYWN0aXZlJzogZGF5dGltZS5hY3RpdmV9XFxcIj57eyBkYXl0aW1lLnRpbWUgfX08L2Rpdj5cXHJcXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwiZGF5dGltZS1jaG9vc2UtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvbWFpbi1tb2R1bGUvZGF5dGltZS1jaG9vc2UtY29tcG9uZW50L3RlbXBsYXRlL2RheXRpbWUtY2hvb3NlLXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSA3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBob21lUGFnZVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9ob21lLXBhZ2UtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgaG9tZVBhZ2UgPSB7XHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGhvbWVQYWdlVGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gaG9tZVBhZ2U7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL21haW4tbW9kdWxlL2hvbWUtcGFnZS1tb2R1bGUvaG9tZS1wYWdlLW1vZHVsZS5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwiaG9tZS1wYWdlXFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiZGF5dGltZS1zZWxlY3QtdG9vbHRpcFxcXCI+0JLRi9Cx0LXRgNC10YLQtSDQstGA0LXQvNGPINC00L3RjyxcXHJcXG4gICAgICAgINGH0YLQvtCx0Ysg0L/RgNC40YHRgtGD0L/QuNGC0Ywg0Log0LfQsNC/0L7Qu9C90LXQvdC40Y4g0LTQvdC10LLQvdC40LrQsDwvZGl2PlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJob21lLWhlYWRlclxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJsZWZ0LWxpbmVcXFwiPjwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwicmlnaHQtbGluZVxcXCI+PC9kaXY+XFxyXFxuICAgICAgICA8aDI+0JTQvdC10LLQvdC40Log0L/QuNGC0LDQvdC40Y88L2gyPlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwibWVudS1zZWxlY3QtdG9vbHRpcFxcXCI+0KfRgtC+0LHRiyDRg9GB0YLQsNC90L7QstC40YLRjCDQu9C40LzQuNGC0YssXFxyXFxuICAgICAgICDRgdC+0YXRgNCw0L3QuNGC0Ywg0LTQsNC90L3Ri9C1LCDQtNC+0LHQsNCy0LjRgtGMINC10LTRgyDQu9C40LHQvlxcclxcbiAgICAgICAg0L/RgNC+0YHQvNC+0YLRgNC10YLRjCDQuNGC0L7QsyDQuCDRgtCw0LHQu9C40YbRiyDQstC+0YHQv9C+0LvRjNC30YPQudGC0LXRgdGMINC80LXQvdGOPC9kaXY+XFxyXFxuPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcImhvbWUtcGFnZS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC9tYWluLW1vZHVsZS9ob21lLXBhZ2UtbW9kdWxlL3RlbXBsYXRlL2hvbWUtcGFnZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgZGlhcnlNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnZGlhcnknLCBbXSk7XHJcblxyXG5kaWFyeU1vZHVsZVxyXG4gICAgLmNvbXBvbmVudCgnbWVudScsIHJlcXVpcmUoJy4vbWVudS9tZW51LWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgnbWFpblZpZXcnLCByZXF1aXJlKCcuL21haW4tdmlldy9tYWluLXZpZXctY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdkYXlUaW1lJywgcmVxdWlyZSgnLi9kYXktdGltZS9kYXktdGltZS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ2Zvb2QnLCByZXF1aXJlKCcuL2Zvb2QvZm9vZC1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ3NhdmVNZW51JywgcmVxdWlyZSgnLi9zYXZlLW1lbnUvc2F2ZS1tZW51LWNvbXBvbmVudCcpKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZGlhcnlNb2R1bGU7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL2RpYXJ5LW1vZHVsZS9pbmRleC5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBtZW51VGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL21lbnUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgbWVudSA9IHtcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkd2luZG93LCAkdGltZW91dCwgdmFsaWRhdGlvblNlcnZpY2UsIGxpbWl0c1NlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLmNhcmJvaHlkcmF0ZXMgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnByb3RlaW5zID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0RGlldCA9IGZ1bmN0aW9uIChkaWV0KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzW2RpZXRdKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzW2RpZXRdID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiB0aGlzW2RpZXRdID0gdHJ1ZSwgMCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYXJib2h5ZHJhdGVzID0gZGlldCA9PT0gJ2NhcmJvaHlkcmF0ZXMnO1xyXG4gICAgICAgICAgICB0aGlzLnByb3RlaW5zID0gZGlldCA9PT0gJ3Byb3RlaW5zJztcclxuICAgICAgICAgICAgaWYgKHZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlTGltaXRzQ2hvb3NlKHRoaXMuY2FyYm9oeWRyYXRlcywgdGhpcy5wcm90ZWlucywgdGhpcy5jbGFzc05hbWUpKSB0aGlzLnNldExpbWl0cygpO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICdzdGFydCc7XHJcblxyXG5cclxuICAgICAgICB0aGlzLnNldENsYXNzTmFtZSA9IGZ1bmN0aW9uIChwaGFzZUlkKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNsYXNzTmFtZSAhPT0gJ3N0YXJ0JykgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLmNsYXNzTmFtZSA9ICdhY3RpdmUnICsgcGhhc2VJZDtcclxuICAgICAgICAgICAgaWYgKHZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlTGltaXRzQ2hvb3NlKHRoaXMuY2FyYm9oeWRyYXRlcywgdGhpcy5wcm90ZWlucywgdGhpcy5jbGFzc05hbWUpKSB0aGlzLnNldExpbWl0cygpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5tb3ZlTGVmdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IG51bWIgPSArdGhpcy5jbGFzc05hbWUuc2xpY2UoLTEpO1xyXG4gICAgICAgICAgICBudW1iIC09IDE7XHJcbiAgICAgICAgICAgIGlmICghbnVtYikgbnVtYiA9IDM7XHJcbiAgICAgICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ2FjdGl2ZScgKyBudW1iO1xyXG4gICAgICAgICAgICBpZiAodmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVMaW1pdHNDaG9vc2UodGhpcy5jYXJib2h5ZHJhdGVzLCB0aGlzLnByb3RlaW5zLCB0aGlzLmNsYXNzTmFtZSkpIHRoaXMuc2V0TGltaXRzKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLm1vdmVSaWdodCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IG51bWIgPSArdGhpcy5jbGFzc05hbWUuc2xpY2UoLTEpO1xyXG4gICAgICAgICAgICBudW1iICs9IDE7XHJcbiAgICAgICAgICAgIGlmIChudW1iID4gMykgbnVtYiA9IDE7XHJcbiAgICAgICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ2FjdGl2ZScgKyBudW1iO1xyXG4gICAgICAgICAgICBpZiAodmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVMaW1pdHNDaG9vc2UodGhpcy5jYXJib2h5ZHJhdGVzLCB0aGlzLnByb3RlaW5zLCB0aGlzLmNsYXNzTmFtZSkpIHRoaXMuc2V0TGltaXRzKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRMaW1pdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBkaWV0ID0gdGhpcy5jYXJib2h5ZHJhdGVzID8gJ2NhcmJvaHlkcmF0ZXMnIDogJ3Byb3RlaW5zJyxcclxuICAgICAgICAgICAgICAgIHBoYXNlID0gdGhpcy5jbGFzc05hbWUuc2xpY2UoLTEpO1xyXG4gICAgICAgICAgICBsaW1pdHNTZXJ2aWNlLnNldExpbWl0cyhkaWV0LCBwaGFzZSk7XHJcblxyXG4gICAgICAgICAgICAkd2luZG93LnNlc3Npb25TdG9yYWdlLnNhdmVkTGltaXRzID0gSlNPTi5zdHJpbmdpZnkoe2RpZXQ6IGRpZXQsIHBoYXNlSWQ6IHBoYXNlfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVkTGltaXRzKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlZExpbWl0cyk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RGlldChkYXRhLmRpZXQpO1xyXG4gICAgICAgICAgICB0aGlzLnNldENsYXNzTmFtZShkYXRhLnBoYXNlSWQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogbWVudVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1lbnU7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL2RpYXJ5LW1vZHVsZS9tZW51L21lbnUtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJtZW51LWJyXFxcIj48L2Rpdj5cXG5cXG48ZGl2IGlkPVxcXCJtZW51XFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiZGlldC1tZW51XFxcIj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImRpZXQtdGl0dGxlXFxcIj7QktC40LQg0LTQuNC10YLRizo8L2Rpdj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImRpZXQtY2hvb3NlXFxcIj5cXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiZGlldFxcXCIgbmctY2xhc3M9XFxcInthY3RpdmU6ICRjdHJsLnByb3RlaW5zfVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldERpZXQoJ3Byb3RlaW5zJylcXFwiPtCS0YvRgdC+0LrQvtC/0YDQvtGC0LXQuNC90L7QstCw0Y8g0LrQvtC80LHQuNC90LDRhtC40Y8g0LfQsNC80LXQvTwvc3Bhbj5cXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwic2xhc2hcXFwiPi88L3NwYW4+XFxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImRpZXRcXFwiIG5nLWNsYXNzPVxcXCJ7YWN0aXZlOiAkY3RybC5jYXJib2h5ZHJhdGVzfVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldERpZXQoJ2NhcmJvaHlkcmF0ZXMnKVxcXCI+0JLRi9GB0L7QutC+0YPQs9C70LXQstC+0LTQvdCw0Y8g0LrQvtC80LHQuNC90LDRhtC40Y8g0LfQsNC80LXQvTwvc3Bhbj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwicGhhc2UtbWVudVxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJwaGFzZS10aXR0bGVcXFwiPtCS0YvQsdC10YDQtdGC0LUg0JLQsNGI0YMg0YTQsNC30YM6PC9kaXY+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJwaGFzZS1jaG9vc2VcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgaWQ9XFxcImFycm93LWxlZnRcXFwiIG5nLWNsYXNzPVxcXCIkY3RybC5jbGFzc05hbWVcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5tb3ZlTGVmdCgpXFxcIj48L2Rpdj5cXG5cXG4gICAgICAgICAgICA8YSBocmVmPVxcXCIjXFxcIiBuZy1jbGFzcz1cXFwiJGN0cmwuY2xhc3NOYW1lXFxcIiBjbGFzcz1cXFwiZmlyc3QtcGhhc2VcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zZXRDbGFzc05hbWUoMSlcXFwiPjE8L2E+XFxuICAgICAgICAgICAgPGEgaHJlZj1cXFwiI1xcXCIgbmctY2xhc3M9XFxcIiRjdHJsLmNsYXNzTmFtZVxcXCIgY2xhc3M9XFxcInNlY29uZC1waGFzZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldENsYXNzTmFtZSgyKVxcXCI+MjwvYT5cXG4gICAgICAgICAgICA8YSBocmVmPVxcXCIjXFxcIiBuZy1jbGFzcz1cXFwiJGN0cmwuY2xhc3NOYW1lXFxcIiBjbGFzcz1cXFwidGhpcmQtcGhhc2VcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zZXRDbGFzc05hbWUoMylcXFwiPjM8L2E+XFxuXFxuICAgICAgICAgICAgPGRpdiBpZD1cXFwiYXJyb3ctcmlnaHRcXFwiIG5nLWNsYXNzPVxcXCIkY3RybC5jbGFzc05hbWVcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5tb3ZlUmlnaHQoKVxcXCI+PC9kaXY+XFxuICAgICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuPC9kaXY+XFxuXFxuPGRpdiBjbGFzcz1cXFwibWVudS1iclxcXCI+PC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcIm1lbnUtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvZGlhcnktbW9kdWxlL21lbnUvdGVtcGxhdGUvbWVudS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMTJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgbWFpblZpZXdUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvbWFpbi12aWV3Lmh0bWwnKTtcblxuY29uc3QgbWFpblZpZXcgPSB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gKGRhdGFTZXJ2aWNlLCBsaW1pdHNTZXJ2aWNlLCAkd2luZG93KSB7XG4gICAgICAgIGNvbnN0IGVtcHR5ID0ge1xuICAgICAgICAgICAgZW1wdHk6IHRydWUsXG4gICAgICAgICAgICBuYW1lOiAnLS0tLS0tLS0tJyxcbiAgICAgICAgICAgIHBvcnRpb246ICctLS0nLFxuICAgICAgICAgICAgY2FyYm9oeWQ6ICctLS0nLFxuICAgICAgICAgICAgcHJvdDogJy0tLScsXG4gICAgICAgICAgICBmYXQ6ICctLS0nLFxuICAgICAgICAgICAga2FsbDogJy0tLSdcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmJhc2UgPSBkYXRhU2VydmljZS5iYXNlO1xuICAgICAgICB0aGlzLnZpZXdEYXRhID0ge1xuICAgICAgICAgICAgbGltaXRzRGF0YTogbGltaXRzU2VydmljZS5saW1pdHNEYXRhXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVEYXRhKSB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZURhdGEpO1xuICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5kYXlUaW1lcyA9IGRhdGEuZGF5c0RhdGE7XG4gICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsID0gZGF0YS5yZXN1bHRGaW5hbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRhdGFTZXJ2aWNlLmdldERheVRpbWVzRGF0YSgpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHRoaXMudmlld0RhdGEuZGF5VGltZXMgPSBkYXRhLmRhdGEpO1xuXG4gICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsID0ge1xuICAgICAgICAgICAgICAgIGNhcmJvaHlkOiAwLFxuICAgICAgICAgICAgICAgIHByb3Q6IDAsXG4gICAgICAgICAgICAgICAgZmF0OiAwLFxuICAgICAgICAgICAgICAgIGthbGw6IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgdGhpcy5jb21wYXJlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMudmlld0RhdGEubGltaXRzRGF0YS5saW1pdHMpIHJldHVybjtcbiAgICAgICAgICAgIGlmICh0aGlzLnZpZXdEYXRhLmxpbWl0c0RhdGEubGltaXRzW1wi0JjRgtC+0LNcIl1ba2V5XSA8IHRoaXMudmlld0RhdGEucmVzdWx0RmluYWxba2V5XSkgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG5cblxuICAgICAgICB0aGlzLmFkZEZvb2QgPSBmdW5jdGlvbihkYXlUaW1lSWQsIGZvb2QpIHtcbiAgICAgICAgICAgIGxldCBjb2xsZWN0aW9uID0gdGhpcy52aWV3RGF0YS5kYXlUaW1lc1tkYXlUaW1lSWRdLmZvb2RzO1xuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb25bMF0uZW1wdHkpIGNvbGxlY3Rpb24uc3BsaWNlKDAsIDEpO1xuXG4gICAgICAgICAgICBjb2xsZWN0aW9uLnB1c2goZm9vZCk7XG4gICAgICAgICAgICB0aGlzLmNhbGNSZXN1bHQoZGF5VGltZUlkLCBmb29kLCB0cnVlKTtcblxuICAgICAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLl9sYXN0U2F2ZUlkKSAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdfbGFzdFNhdmVJZCcpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVtb3ZlRm9vZCA9IGZ1bmN0aW9uKGRheVRpbWVJZCwgZm9vZCkge1xuICAgICAgICAgICAgbGV0IGNvbGxlY3Rpb24gPSB0aGlzLnZpZXdEYXRhLmRheVRpbWVzW2RheVRpbWVJZF0uZm9vZHM7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSBjb2xsZWN0aW9uLmluZGV4T2YoZm9vZCk7XG4gICAgICAgICAgICBjb2xsZWN0aW9uLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9uLmxlbmd0aCA9PT0gMCkgY29sbGVjdGlvbi5wdXNoKGVtcHR5KTtcbiAgICAgICAgICAgIHRoaXMuY2FsY1Jlc3VsdChkYXlUaW1lSWQsIGZvb2QsIGZhbHNlKTtcbiAgICAgICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCkgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnX2xhc3RTYXZlSWQnKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnRvZ2dsZURheVRpbWUgPSBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5kYXlUaW1lc1tpZF0uc2hvdyA9ICF0aGlzLnZpZXdEYXRhLmRheVRpbWVzW2lkXS5zaG93XG4gICAgICAgIH07XG5cblxuICAgICAgICB0aGlzLmNhbGNSZXN1bHQgPSBmdW5jdGlvbiAoZGF5VGltZUlkLCBmb29kLCBib29sKSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy52aWV3RGF0YS5kYXlUaW1lc1tkYXlUaW1lSWRdLnJlc3VsdDtcbiAgICAgICAgICAgIGlmIChib29sKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSArPSBmb29kW2tleV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld0RhdGEucmVzdWx0RmluYWxba2V5XSArPSBmb29kW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldIC09IGZvb2Rba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbFtrZXldIC09IGZvb2Rba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRlbXBsYXRlOiBtYWluVmlld1RlbXBsYXRlXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1haW5WaWV3O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvbWFpbi12aWV3L21haW4tdmlldy1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcIm1haW4tdmlld1xcXCI+XFxuICAgIDxkYXktdGltZSBuZy1yZXBlYXQ9XFxcInRpbWUgaW4gJGN0cmwudmlld0RhdGEuZGF5VGltZXNcXFwiIHRpbWU9XFxcInRpbWVcXFwiIGJhc2U9XFxcIiRjdHJsLmJhc2VcXFwiIGRheS10aW1lLWxpbWl0cz1cXFwiJGN0cmwudmlld0RhdGEubGltaXRzRGF0YVxcXCIgYWRkPVxcXCIkY3RybC5hZGRGb29kKGRheVRpbWVJZCwgZm9vZClcXFwiIHJlbW92ZT1cXFwiJGN0cmwucmVtb3ZlRm9vZChkYXlUaW1lSWQsIGZvb2QpXFxcIiB0b2dnbGU9XFxcIiRjdHJsLnRvZ2dsZURheVRpbWUoaWQpXFxcIj48L2RheS10aW1lPlxcblxcbiAgICA8ZGl2IGNsYXNzPVxcXCJyZXN1bHRcXFwiPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwicmVzdWx0LXRpdHRsZVxcXCI+0JjRgtC+0LPQvjwvZGl2PlxcblxcbiAgICAgICAgPHNlY3Rpb24gY2xhc3M9XFxcInRhYmxlLXJlc3VsdFxcXCI+XFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidGFibGUtcmVzdWx0LXRpdHRsZVxcXCI+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJyZXN1bHQtbm8tbmFtZVxcXCI+LS0tLS0tLS0tLS0tLS0tLTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInBvcnRpb25cXFwiPtCf0L7RgNGG0LjRjyjQs9GAKTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNhcmJvaHlkXFxcIj7Qo9Cz0LvQtdCy0L7QtNGLPC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicHJvdFxcXCI+0JHQtdC70LrQuDwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImZhdFxcXCI+0JbQuNGA0Ys8L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJrYWxsXFxcIj7QmtCw0LvQvtGA0LjQuDwvc3Bhbj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXN1bHQtZmluYWxcXFwiPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwibmFtZVxcXCI+PC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicG9ydGlvblxcXCI+LS0tPC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiY2FyYm9oeWRcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2NhcmJvaHlkJyl9XFxcIj57eyAkY3RybC52aWV3RGF0YS5yZXN1bHRGaW5hbC5jYXJib2h5ZCB9fSB7eycoJyArICRjdHJsLnZpZXdEYXRhLmxpbWl0c0RhdGEubGltaXRzW1xcXCLQmNGC0L7Qs1xcXCJdLmNhcmJvaHlkICsgJyknIHwgbGltaXQgfX08L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJwcm90XFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtbGltaXQnOiAkY3RybC5jb21wYXJlKCdwcm90Jyl9XFxcIj57eyAkY3RybC52aWV3RGF0YS5yZXN1bHRGaW5hbC5wcm90ICB9fSB7eycoJyArICRjdHJsLnZpZXdEYXRhLmxpbWl0c0RhdGEubGltaXRzW1xcXCLQmNGC0L7Qs1xcXCJdLnByb3QgKyAnKScgfCBsaW1pdCB9fTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImZhdFxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlLWxpbWl0JzogJGN0cmwuY29tcGFyZSgnZmF0Jyl9XFxcIj57eyAkY3RybC52aWV3RGF0YS5yZXN1bHRGaW5hbC5mYXQgfX0ge3snKCcgKyAkY3RybC52aWV3RGF0YS5saW1pdHNEYXRhLmxpbWl0c1tcXFwi0JjRgtC+0LNcXFwiXS5mYXQgKyAnKScgfCBsaW1pdCB9fTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImthbGxcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2thbGwnKX1cXFwiPnt7ICRjdHJsLnZpZXdEYXRhLnJlc3VsdEZpbmFsLmthbGwgfX0ge3snKCcgKyAkY3RybC52aWV3RGF0YS5saW1pdHNEYXRhLmxpbWl0c1tcXFwi0JjRgtC+0LNcXFwiXS5rYWxsICsgJyknIHwgbGltaXQgfX08L3NwYW4+XFxuICAgICAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICA8L3NlY3Rpb24+XFxuICAgIDwvZGl2PlxcbjwvZGl2PlxcbjxzYXZlLW1lbnUgZGF5LXRpbWVzLWRhdGE9XFxcIiRjdHJsLnZpZXdEYXRhLmRheVRpbWVzXFxcIiByZXN1bHQ9XFxcIiRjdHJsLnZpZXdEYXRhLnJlc3VsdEZpbmFsXFxcIj48L3NhdmUtbWVudT5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwibWFpbi12aWV3Lmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9tYWluLXZpZXcvdGVtcGxhdGUvbWFpbi12aWV3Lmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAxNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBkYXlUaW1lVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL2RheS10aW1lLXRlbXBsYXRlLmh0bWwnKTtcblxuY29uc3QgZGF5VGltZSA9IHtcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBiYXNlOiAnPCcsXG4gICAgICAgIGRheXRpbWVzOiAnPCcsXG4gICAgICAgIGFkZDogJyYnLFxuICAgICAgICByZW1vdmU6ICcmJyxcbiAgICAgICAgZGF5VGltZUxpbWl0czogJzwnXG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihkYXRhU2VydmljZSwgdmFsaWRhdGlvblNlcnZpY2UsIGNhbGN1bGF0aW9uU2VydmljZSwgJHNjb3BlLCAkc3RhdGVQYXJhbXMsIGluZGV4U2VydmljZSkge1xuICAgICAgICBsZXQgZGF5dGltZSA9ICRzdGF0ZVBhcmFtcy5kYXl0aW1lO1xuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXhTZXJ2aWNlKGRheXRpbWUpO1xuXG4gICAgICAgIHZhciB0ZXh0ID0gJyc7XG4gICAgICAgIHRoaXMub25JbnB1dCA9IGZ1bmN0aW9uKHN0cikge1xuICAgICAgICAgICAgdGV4dCA9IHN0cjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxpbWl0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF5VGltZUxpbWl0cy5saW1pdHMpIHJldHVybiB0aGlzLmRheVRpbWVMaW1pdHMubGltaXRzW3RoaXMuZGF5dGltZXNbdGhpcy5pbmRleF0uZGF5VGltZV07XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jb21wYXJlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubGltaXRzKCkpIHJldHVybjtcbiAgICAgICAgICAgIGlmICh0aGlzLmxpbWl0cygpW2tleV0gPCB0aGlzLmRheXRpbWVzW3RoaXMuaW5kZXhdLnJlc3VsdFtrZXldKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZUZvb2QgPSBmdW5jdGlvbihmb29kKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZSh7ZGF5VGltZUlkOiB0aGlzLmRheXRpbWVzW3RoaXMuaW5kZXhdLmlkLCBmb29kOiBmb29kfSlcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmFkZEZvb2QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCBwb3J0aW9uID0gTWF0aC5yb3VuZCgrdGhpcy5wb3J0aW9uKTtcbiAgICAgICAgICAgIGxldCBuYW1lID0gdGhpcy5mb29kTmFtZSA/IHRoaXMuZm9vZE5hbWUudGl0bGUgOiB0ZXh0O1xuXG4gICAgICAgICAgICAvL9Cf0YDQvtCy0LXRgNC40YLRjCDQv9C+0LvRjyDQstCy0L7QtNCwLCDQstGL0YfQuNGB0LvQuNGC0Ywg0LfQvdCw0YfQtdC90LjRj1xuICAgICAgICAgICAgaWYgKCF2YWxpZGF0aW9uU2VydmljZS5mb29kQWRkVmFsaWRhdGlvbihuYW1lLCBwb3J0aW9uKSkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIGZvb2QgPSBjYWxjdWxhdGlvblNlcnZpY2UuY2FsY3VsYXRlVmFsdWVzKG5hbWUsIHBvcnRpb24pO1xuXG4gICAgICAgICAgICAvL9CU0L7QsdCw0LLQuNGC0Ywg0LIg0LzQsNGB0YHQuNCyXG4gICAgICAgICAgICB0aGlzLmFkZCh7ZGF5VGltZUlkOiB0aGlzLmRheXRpbWVzW3RoaXMuaW5kZXhdLmlkLCBmb29kOiBmb29kfSk7XG5cbiAgICAgICAgICAgIC8v0J7Rh9C40YHRgtC40YLRjCDQv9C+0LvRjyDQstCy0L7QtNCwXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnYW5ndWNvbXBsZXRlLWFsdDpjbGVhcklucHV0Jyk7XG4gICAgICAgICAgICB0aGlzLnBvcnRpb24gPScnO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgdGhpcy5lbnRlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSAhPT0gMTMpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuYWRkRm9vZCgpO1xuICAgICAgICB9O1xuICAgIH0sXG4gICAgdGVtcGxhdGU6IGRheVRpbWVUZW1wbGF0ZVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkYXlUaW1lO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvZGF5LXRpbWUvZGF5LXRpbWUtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJkYXktdGltZVxcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcImlucHV0XFxcIj5cXG4gICAgICAgIDxmb3JtPlxcbiAgICAgICAgICAgIDxsYWJlbD7QndCw0LjQvNC10L3QvtCy0LDQvdC40LU6IDxhbmd1Y29tcGxldGUtYWx0IG5nLWtleXByZXNzPVxcXCIkY3RybC5lbnRlcigkZXZlbnQpXFxcIiBpZD1cXFwiZXgxXFxcIiBwbGFjZWhvbGRlcj1cXFwi0JLQstC10LTQuNGC0LUg0L/RgNC+0LTRg9C60YJcXFwiIHBhdXNlPVxcXCIxMDBcXFwiIHNlbGVjdGVkLW9iamVjdD1cXFwiJGN0cmwuZm9vZE5hbWVcXFwiIGxvY2FsLWRhdGE9XFxcIiRjdHJsLmJhc2UuZm9vZHMua2V5c1xcXCIgc2VhcmNoLWZpZWxkcz1cXFwiZm9vZE5hbWVcXFwiIHRpdGxlLWZpZWxkPVxcXCJmb29kTmFtZVxcXCIgbWlubGVuZ3RoPVxcXCIxXFxcIiBpbnB1dC1jaGFuZ2VkPVxcXCIkY3RybC5vbklucHV0XFxcIiBpbnB1dC1jbGFzcz1cXFwiZm9vZCBmb3JtLWNvbnRyb2wtc21hbGxcXFwiIG1hdGNoLWNsYXNzPVxcXCJoaWdobGlnaHRcXFwiPjwvYW5ndWNvbXBsZXRlLWFsdD48L2xhYmVsPlxcbiAgICAgICAgICAgIDxicj5cXG5cXG4gICAgICAgICAgICA8bGFiZWw+0J/QvtGA0YbQuNGPKNCz0YApOiA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcInBvcnRpb24taW5wdXRcXFwiIHNpemU9XFxcIjJcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC5wb3J0aW9uXFxcIiBuZy1rZXlwcmVzcz1cXFwiJGN0cmwuZW50ZXIoJGV2ZW50KVxcXCIvPjwvbGFiZWw+XFxuICAgICAgICA8L2Zvcm0+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhZGQtYnV0dG9uXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuYWRkRm9vZCgpXFxcIj4rPC9kaXY+XFxuICAgIDwvZGl2PlxcblxcbiAgICA8ZGl2IGNsYXNzPVxcXCJ0YWJsZS1ib3JkZXJcXFwiPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwidGFibGVcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInRhYmxlLXRpdHRsZVxcXCI+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJuYW1lXFxcIj7QndCw0LjQvNC10L3QvtCy0LDQvdC40LUg0L/RgNC+0LTRg9C60YLQsDwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInBvcnRpb25cXFwiPtCf0L7RgNGG0LjRjyjQs9GAKTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNhcmJvaHlkXFxcIj7Qo9Cz0LvQtdCy0L7QtNGLPC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicHJvdFxcXCI+0JHQtdC70LrQuDwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImZhdFxcXCI+0JbQuNGA0Ys8L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJrYWxsXFxcIj7QmtCw0LvQvtGA0LjQuDwvc3Bhbj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG5cXG5cXG4gICAgICAgICAgICA8Zm9vZCBuZy1yZXBlYXQ9XFxcImZvb2QgaW4gJGN0cmwuZGF5dGltZXNbJGN0cmwuaW5kZXhdLmZvb2RzXFxcIiBmb29kPVxcXCJmb29kXFxcIiByZW1vdmU9XFxcIiRjdHJsLnJlbW92ZUZvb2QoZm9vZClcXFwiPjwvZm9vZD5cXG5cXG5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJzdW1tYXJ5XFxcIj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm5hbWVcXFwiPtCf0L7QtNGL0YLQvtCzPC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicG9ydGlvblxcXCI+LS0tPC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiY2FyYm9oeWRcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2NhcmJvaHlkJyl9XFxcIj57eyAkY3RybC5kYXl0aW1lc1skY3RybC5pbmRleF0ucmVzdWx0LmNhcmJvaHlkIH19IHt7JygnICsgJGN0cmwubGltaXRzKCkuY2FyYm9oeWQgKyAnKScgfCBsaW1pdCB9fTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInByb3RcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ3Byb3QnKX1cXFwiPnt7ICRjdHJsLmRheXRpbWVzWyRjdHJsLmluZGV4XS5yZXN1bHQucHJvdCB9fSB7eycoJyArICRjdHJsLmxpbWl0cygpLnByb3QgKyAnKScgfCBsaW1pdCB9fTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImZhdFxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlLWxpbWl0JzogJGN0cmwuY29tcGFyZSgnZmF0Jyl9XFxcIj57eyAkY3RybC5kYXl0aW1lc1skY3RybC5pbmRleF0ucmVzdWx0LmZhdCB9fSB7eycoJyArICRjdHJsLmxpbWl0cygpLmZhdCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwia2FsbFxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlLWxpbWl0JzogJGN0cmwuY29tcGFyZSgna2FsbCcpfVxcXCI+e3sgJGN0cmwuZGF5dGltZXNbJGN0cmwuaW5kZXhdLnJlc3VsdC5rYWxsIH19IHt7JygnICsgJGN0cmwubGltaXRzKCkua2FsbCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgPC9kaXY+XFxuICAgIDwvZGl2PlxcblxcbjwvZGl2PlxcblxcblxcbjxkaXYgY2xhc3M9XFxcImJyXFxcIj48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwiZGF5LXRpbWUtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvZGlhcnktbW9kdWxlL2RheS10aW1lL3RlbXBsYXRlL2RheS10aW1lLXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAxNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgZm9vZFRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9mb29kLXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IGZvb2QgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGZvb2Q6ICc8JyxcclxuICAgICAgICByZW1vdmU6ICcmJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY2hlY2tFbXB0eUZvb2QgPSBmdW5jdGlvbihmb29kKSB7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihmb29kLmthbGwpKSByZXR1cm4gJ2VtcHR5J1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogZm9vZFRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZvb2Q7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL2RpYXJ5LW1vZHVsZS9mb29kL2Zvb2QtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJmb29kXFxcIiBuZy1jbGFzcz1cXFwiJGN0cmwuY2hlY2tFbXB0eUZvb2QoJGN0cmwuZm9vZClcXFwiPlxcclxcbiAgICA8c3BhbiBjbGFzcz1cXFwibmFtZVxcXCI+e3sgJGN0cmwuZm9vZC5uYW1lIH19PC9zcGFuPlxcclxcbiAgICA8c3BhbiBjbGFzcz1cXFwicG9ydGlvblxcXCI+e3sgJGN0cmwuZm9vZC5wb3J0aW9uIH19PC9zcGFuPlxcclxcbiAgICA8c3BhbiBjbGFzcz1cXFwiY2FyYm9oeWRcXFwiPnt7ICRjdHJsLmZvb2QuY2FyYm9oeWQgfX08L3NwYW4+XFxyXFxuICAgIDxzcGFuIGNsYXNzPVxcXCJwcm90XFxcIj57eyAkY3RybC5mb29kLnByb3QgfX08L3NwYW4+XFxyXFxuICAgIDxzcGFuIGNsYXNzPVxcXCJmYXRcXFwiPnt7ICRjdHJsLmZvb2QuZmF0IH19PC9zcGFuPlxcclxcbiAgICA8c3BhbiBjbGFzcz1cXFwia2FsbFxcXCI+e3sgJGN0cmwuZm9vZC5rYWxsIH19PC9zcGFuPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJyZW1vdmUtZm9vZFxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnJlbW92ZSh7Zm9vZDogJGN0cmwuZm9vZH0pXFxcIj48L2Rpdj5cXHJcXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwiZm9vZC10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC9kaWFyeS1tb2R1bGUvZm9vZC90ZW1wbGF0ZS9mb29kLXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAxOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3Qgc2F2ZU1lbnVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvc2F2ZS1tZW51LXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IHNhdmVNZW51ID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBkYXlUaW1lc0RhdGE6ICc8JyxcclxuICAgICAgICByZXN1bHQ6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCR3aW5kb3csIHZhbGlkYXRpb25TZXJ2aWNlKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy50b2dnbGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSAhdGhpcy5hY3RpdmU7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zYXZlRm9yUHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSAkd2luZG93LmxvY2FsU3RvcmFnZS5kYXlzRGF0YSA/IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZGF5c0RhdGEpIDogW107XHJcbiAgICAgICAgICAgIC8v0J/RgNC+0LLQtdGA0LrQuFxyXG4gICAgICAgICAgICBpZiAoZGF0YS5sZW5ndGggPiAwICYmIG5ldyBEYXRlKGRhdGFbZGF0YS5sZW5ndGggLSAxXS5zYXZlVGltZSkuZ2V0RGF5KCkgPT09IG5ldyBEYXRlKCkuZ2V0RGF5KCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhW2RhdGEubGVuZ3RoIC0gMV0uc2F2ZVRpbWVJZCA9PT0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UuX2xhc3RTYXZlSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGVydCgn0J3QtdGCINC90L7QstGL0YUg0LTQsNC90L3Ri9GFINC00LvRjyDRgdC+0YXRgNCw0L3QtdC90LjRjycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghY29uZmlybSgn0J/QtdGA0LXQt9Cw0L/QuNGB0LDRgtGMINC00LDQvdC90YvQtSDQv9C10YfQsNGC0Lgg0YLQtdC60YPRiNC10LPQviDQtNC90Y8/JykpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGRhdGEucG9wKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy/QodC+0YXRgNCw0L3QtdC90LjQtVxyXG4gICAgICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgIGxldCBpZCA9IChNYXRoLnJhbmRvbSgpICsgJycpLnNsaWNlKDIpO1xyXG4gICAgICAgICAgICBsZXQgZGF5RGF0YSA9IHtzYXZlVGltZTogZGF0ZSwgZGF5VGltZXM6IHRoaXMuZGF5VGltZXNEYXRhLCByZXN1bHQ6IHRoaXMucmVzdWx0LCBzYXZlVGltZUlkOiBpZH07XHJcbiAgICAgICAgICAgIGRhdGEucHVzaChkYXlEYXRhKTtcclxuICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZGF5c0RhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcclxuICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UuX2xhc3RTYXZlSWQgPSBpZDtcclxuICAgICAgICAgICAgYWxlcnQoJ9CU0LDQvdC90YvQtSDRg9GB0L/QtdGI0L3QviDRgdC+0YXRgNCw0L3QtdC90YsnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZVByaW50U2F2ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLmRheXNEYXRhICYmIGNvbmZpcm0oJ9Cj0LTQsNC70LjRgtGMINGB0L7RhdGA0LDQvdC10L3QuNGPINC00LvRjyDQv9C10YfQsNGC0Lg/JykpIHtcclxuICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2RheXNEYXRhJyk7XHJcbiAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdfbGFzdFNhdmVJZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMucHJldmlldyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9ICR3aW5kb3cubG9jYWxTdG9yYWdlLmRheXNEYXRhO1xyXG4gICAgICAgICAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjb25maXJtKCfQodC+0YXRgNCw0L3QuNGC0Ywg0YLQtdC60YPRidC40LUg0LTQsNC90L3Ri9C1INC00LvRjyDQv9GA0L7RgdC80L7RgtGA0LA/JykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVGb3JQcmludCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGVydCgn0J3QtdGCINC00LDQvdC90YvRhSDQtNC70Y8g0L/RgNC+0YHQvNC+0YLRgNCwIScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZGF0YS5sZW5ndGggLSAxXS5zYXZlVGltZUlkICE9PSAkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCAmJiBjb25maXJtKCfQodC+0YXRgNCw0L3QuNGC0Ywg0LTQsNC90L3Ri9C1INC00LvRjyDQv9GA0L7RgdC80L7RgtGA0LA/JykpIHRoaXMuc2F2ZUZvclByaW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICR3aW5kb3cub3BlbignLi9wcmludC5odG1sJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zYXZlRGF0YSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoY29uZmlybSgn0KHQvtGF0YDQsNC90LjRgtGMINGC0LXQutGD0YnQuNC1INC00LDQvdC90YvQtT8nKSkge1xyXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZURhdGEgPSBKU09OLnN0cmluZ2lmeSh7ZGF5c0RhdGE6IHRoaXMuZGF5VGltZXNEYXRhLCByZXN1bHRGaW5hbDogdGhpcy5yZXN1bHR9KTtcclxuICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVkTGltaXRzID0gJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zYXZlZExpbWl0cztcclxuICAgICAgICAgICAgICAgIGFsZXJ0KCfQlNCw0L3QvdGL0LUg0YPRgdC/0LXRiNC90L4g0YHQvtGF0YDQsNC90LXQvdGLJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IHNhdmVNZW51VGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc2F2ZU1lbnU7XHJcblxyXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvZGlhcnktbW9kdWxlL3NhdmUtbWVudS9zYXZlLW1lbnUtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJzYXZlLW1lbnUgZ3JvdXBcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJwcmludC1idXR0b24gZ3JvdXBcXFwiIG5nLWNsYXNzPVxcXCJ7J3ByaW50LWJ1dHRvbi1hY3RpdmUnOiAkY3RybC5hY3RpdmV9XFxcIiBuZy1jbGljaz1cXFwiJGN0cmwudG9nZ2xlKClcXFwiPtCU0LvRjyDQv9C10YfQsNGC0Lg8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwic2F2ZS1idXR0b24gZ3JvdXBcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zYXZlRGF0YSgpXFxcIj7QodC+0YXRgNCw0L3QuNGC0Ywg0LjQt9C80LXQvdC10L3QuNGPPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcInByaW50LW1lbnUgZ3JvdXBcXFwiIG5nLWlmPVxcXCIkY3RybC5hY3RpdmVcXFwiPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwidG8tcHJpbnRcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5wcmV2aWV3KClcXFwiPtCf0YDQtdC00L/RgNC+0YHQvNC+0YLRgDwvZGl2PlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwicHJpbnQtdG8tbG9jYWxTdG9yYWdlXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2F2ZUZvclByaW50KClcXFwiPtCh0L7RhdGA0LDQvdC40YLRjCDQtNC70Y8g0L/QtdGH0LDRgtC4PC9kaXY+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJkZWx0ZS1wcmludC1sb2NhbFN0b3JhZ2VcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5yZW1vdmVQcmludFNhdmVzKClcXFwiPtCj0LTQsNC70LjRgtGMINGB0L7RhdGA0LDQvdC10L3QuNGPPC9kaXY+XFxuICAgIDwvZGl2PlxcbjwvZGl2PlxcblxcblxcbjxkaXYgY2xhc3M9XFxcImJyXFxcIj48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwic2F2ZS1tZW51LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9zYXZlLW1lbnUvdGVtcGxhdGUvc2F2ZS1tZW51LXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAyMFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgdGFibGVNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgndGFibGUnLCBbXSk7XHJcblxyXG50YWJsZU1vZHVsZVxyXG4gICAgLmNvbXBvbmVudCgndGFibGVWaWV3JywgcmVxdWlyZSgnLi90YWJsZS12aWV3LWNvbXBvbmVudC90YWJsZS12aWV3LWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgndGFibGVBZGQnLCByZXF1aXJlKCcuL2FkZC10by10YWJsZS1jb21wb25lbnQvYWRkLXRvLXRhYmxlLWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgnZm9vZFRhYmxlJywgcmVxdWlyZSgnLi90YWJsZS1jb21wb25lbnQvdGFibGUtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdzdG9yYWdlVGFibGUnLCByZXF1aXJlKCcuL3N0b3JhZ2UtdGFibGUtY29tcG9uZW50L3N0b3JhZ2UtdGFibGUtY29tcG9uZW50JykpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0YWJsZU1vZHVsZTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvdGFibGUtbW9kdWxlL2luZGV4LmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCB0YWJsZVZpZXdUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvdGFibGUtdmlldy10ZW1wbGF0ZS5odG1sJyk7XG5cbmNvbnN0IHRhYmxlVmlldyA9IHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihkYXRhU2VydmljZSwgJHdpbmRvdykge1xuICAgICAgICBkYXRhU2VydmljZS5nZXRUYWJsZURhdGEoKVxuICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvb2RzT2JqcyA9IGRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UubXlGb29kcykgdGhpcy5teUZvb2RzID0gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5teUZvb2RzKTtcblxuICAgICAgICB0aGlzLnJlbW92ZU15Rm9vZCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm15Rm9vZHNbbmFtZV07XG4gICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5teUZvb2RzID0gSlNPTi5zdHJpbmdpZnkodGhpcy5teUZvb2RzKTtcblxuICAgICAgICAgICAgZGF0YVNlcnZpY2UucmVtb3ZlRnJvbUJhc2UobmFtZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5hZGRNeUZvb2QgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm15Rm9vZHNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbmZpcm0oJ9Cf0LXRgNC10LfQsNC/0LjRgdCw0YLRjCDRgdGD0YnQtdGB0YLQstGD0Y7RidC40Lkg0L/RgNC+0LTRg9C60YI/JykpIHJldHVybjtcbiAgICAgICAgICAgICAgICBkYXRhU2VydmljZS5yZW1vdmVGcm9tQmFzZShuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubXlGb29kc1tuYW1lXSA9IHZhbHVlcztcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLm15Rm9vZHMgPSBKU09OLnN0cmluZ2lmeSh0aGlzLm15Rm9vZHMpO1xuXG4gICAgICAgICAgICBkYXRhU2VydmljZS5hZGRUb0Jhc2UobmFtZSwgdmFsdWVzKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHRhYmxlVmlld1RlbXBsYXRlXG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gdGFibGVWaWV3O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvdGFibGUtdmlldy1jb21wb25lbnQvdGFibGUtdmlldy1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjx0YWJsZS1hZGQgYWRkLW15LWZvb2Q9XFxcIiRjdHJsLmFkZE15Rm9vZChuYW1lLCB2YWx1ZXMpXFxcIj48L3RhYmxlLWFkZD5cXHJcXG5cXHJcXG48ZGl2IGNsYXNzPVxcXCJ0YWJsZS1jb250YWluZXJcXFwiPlxcclxcbiAgICA8Zm9vZC10YWJsZSBuZy1yZXBlYXQ9XFxcImZvb2RzT2JqIGluICRjdHJsLmZvb2RzT2Jqc1xcXCIgZm9vZHMtb2JqPVxcXCJmb29kc09ialxcXCIgcmVtb3ZlPVxcXCIkY3RybC5yZW1vdmVNeUZvb2QoZm9vZCwgb2JqKVxcXCI+PC9mb29kLXRhYmxlPlxcclxcbiAgICA8c3RvcmFnZS10YWJsZSBteS1mb29kcz1cXFwiJGN0cmwubXlGb29kc1xcXCIgcmVtb3ZlLW15LWZvb2Q9XFxcIiRjdHJsLnJlbW92ZU15Rm9vZChuYW1lKVxcXCI+PC9zdG9yYWdlLXRhYmxlPlxcclxcbjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJ0YWJsZS12aWV3LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS12aWV3LWNvbXBvbmVudC90ZW1wbGF0ZS90YWJsZS12aWV3LXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAyM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgYWRkVG9UYWJsZVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9hZGQtdG8tdGFibGUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgYWRkVG9UYWJsZSA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgYWRkTXlGb29kOiAnJidcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAodmFsaWRhdGlvblNlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLnZhbHVlcyA9IFswLCAwLCAwLCAwLCAwXTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQgJiYgZXZlbnQua2V5Q29kZSAhPT0gMTMpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudmFsdWVzLmZvckVhY2goKHZhbHVlLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZXNbaW5kZXhdID0gK3ZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoIXZhbGlkYXRpb25TZXJ2aWNlLmFkZE15Rm9vZFZhbGlkYXRpb24odGhpcy5uYW1lLCB0aGlzLnZhbHVlcykpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWRkTXlGb29kKHtuYW1lOiB0aGlzLm5hbWUsIHZhbHVlczogdGhpcy52YWx1ZXN9KTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZXMgPSBbMCwgMCwgMCwgMCwgMF07XHJcbiAgICAgICAgICAgIHRoaXMubmFtZSA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogYWRkVG9UYWJsZVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGFkZFRvVGFibGU7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L2FkZC10by10YWJsZS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcImFkZC10by10YWJsZS1mb3JtXFxcIj5cXG4gICAgPGgzIGNsYXNzPVxcXCJhZGQtZm9ybS10aXRsZVxcXCI+0JTQvtCx0LDQstC40YLRjCDQv9GA0L7QtNGD0LrRgiDQsiDRgtCw0LHQu9C40YbRgzwvaDM+XFxuICAgIDxmb3JtIGNsYXNzPVxcXCJ0YWJsZS1mb3JtXFxcIj5cXG4gICAgICAgIDxsYWJlbD7QndCw0LjQvNC10L3QvtCy0LDQvdC40LU6XFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJmb29kLW5hbWVcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC5uYW1lXFxcIiBuZy1rZXlkb3duPVxcXCIkY3RybC5hZGQoJGV2ZW50KVxcXCIvPjwvbGFiZWw+XFxuICAgICAgICA8bGFiZWw+0J/QvtGA0YbQuNGPKNCz0YApOlxcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwidGFibGUtZm9ybS1wb3J0aW9uXFxcIiBzaXplPVxcXCIyXFxcIiBuZy1tb2RlbD1cXFwiJGN0cmwudmFsdWVzWzBdXFxcIiBuZy1rZXlkb3duPVxcXCIkY3RybC5hZGQoJGV2ZW50KVxcXCIvPjwvbGFiZWw+XFxuICAgICAgICA8bGFiZWw+0KPQs9C70LXQstC+0LTRizpcXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcInRhYmxlLWZvcm0tY2FyYm9oeWRcXFwiIHNpemU9XFxcIjJcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC52YWx1ZXNbMV1cXFwiIG5nLWtleWRvd249XFxcIiRjdHJsLmFkZCgkZXZlbnQpXFxcIi8+PC9sYWJlbD5cXG4gICAgICAgIDxsYWJlbD7QkdC10LvQutC4OlxcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwidGFibGUtZm9ybS1wcm90XFxcIiBzaXplPVxcXCIyXFxcIiBuZy1tb2RlbD1cXFwiJGN0cmwudmFsdWVzWzJdXFxcIiBuZy1rZXlkb3duPVxcXCIkY3RybC5hZGQoJGV2ZW50KVxcXCIvPjwvbGFiZWw+XFxuICAgICAgICA8bGFiZWw+0JbQuNGA0Ys6XFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJ0YWJsZS1mb3JtLWZhdFxcXCIgc2l6ZT1cXFwiMlxcXCIgbmctbW9kZWw9XFxcIiRjdHJsLnZhbHVlc1szXVxcXCIgbmcta2V5ZG93bj1cXFwiJGN0cmwuYWRkKCRldmVudClcXFwiLz48L2xhYmVsPlxcbiAgICAgICAgPGxhYmVsPtCa0LDQu9C+0YDQuNC4OlxcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwidGFibGUtZm9ybS1rYWxcXFwiIHNpemU9XFxcIjJcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC52YWx1ZXNbNF1cXFwiIG5nLWtleWRvd249XFxcIiRjdHJsLmFkZCgkZXZlbnQpXFxcIi8+PC9sYWJlbD5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImFkZC10by10YWJsZS1idXR0b25cXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5hZGQoKVxcXCI+KzwvZGl2PlxcbiAgICA8L2Zvcm0+XFxuXFxuPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcImFkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC90YWJsZS1tb2R1bGUvYWRkLXRvLXRhYmxlLWNvbXBvbmVudC90ZW1wbGF0ZS9hZGQtdG8tdGFibGUtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDI1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCB0YWJsZVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS90YWJsZS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCB0YWJsZSA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgZm9vZHNPYmo6ICc8JyxcclxuICAgICAgICByZW1vdmU6ICcmJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogdGFibGVUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0YWJsZTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLWNvbXBvbmVudC90YWJsZS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjx0YWJsZSBjbGFzcz1cXFwidGJcXFwiPlxcclxcbiAgICA8Y2FwdGlvbiBjbGFzcz1cXFwidGItdGl0bGVcXFwiPnt7ICRjdHJsLmZvb2RzT2JqLnRpdGxlIH19PC9jYXB0aW9uPlxcclxcbiAgICA8dHIgbmctcmVwZWF0PVxcXCJmb29kIGluICRjdHJsLmZvb2RzT2JqLmZvb2RzXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwucmVtb3ZlKHtmb29kOiBmb29kLCBvYmo6ICRjdHJsLmZvb2RzT2JqLmZvb2RzfSlcXFwiIG5nLWNsYXNzPVxcXCJmb29kLmNsYXNzTmFtZVxcXCI+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcInRkLW5hbWUgbmFtZS1jb2xvclxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj57eyBmb29kLnZhbHVlcy5uYW1lIH19PC90ZD5cXHJcXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwicG9ydGlvbi1jb2xvclxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj57eyBmb29kLnZhbHVlcy5wb3J0aW9uIH19PC90ZD5cXHJcXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwiY2FyYm9oeWQtY29sb3JcXFwiIG5nLWNsYXNzPVxcXCJmb29kLmNsYXNzTmFtZVxcXCI+e3sgZm9vZC52YWx1ZXMuY2FyYm9oeWQgfX08L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJwcm90LWNvbG9yXFxcIiBuZy1jbGFzcz1cXFwiZm9vZC5jbGFzc05hbWVcXFwiPnt7IGZvb2QudmFsdWVzLnByb3QgfX08L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJmYXQtY29sb3JcXFwiIG5nLWNsYXNzPVxcXCJmb29kLmNsYXNzTmFtZVxcXCI+e3sgZm9vZC52YWx1ZXMuZmF0IH19PC90ZD5cXHJcXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwia2FsbC1jb2xvclxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj57eyBmb29kLnZhbHVlcy5rYWxsIH19PC90ZD5cXHJcXG4gICAgPC90cj5cXHJcXG48L3RhYmxlPlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJ0YWJsZS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC90YWJsZS1tb2R1bGUvdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL3RhYmxlLXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAyN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3Qgc3RvcmFnZVRhYmxlVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL3N0b3JhZ2UtdGFibGUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3Qgc3RvcmFnZVRhYmxlID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBteUZvb2RzOiAnPCcsXHJcbiAgICAgICAgcmVtb3ZlTXlGb29kOiAnJidcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNob3cgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMubXlGb29kcykubGVuZ3RoID4gMDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IHN0b3JhZ2VUYWJsZVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHN0b3JhZ2VUYWJsZTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvdGFibGUtbW9kdWxlL3N0b3JhZ2UtdGFibGUtY29tcG9uZW50L3N0b3JhZ2UtdGFibGUtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8dGFibGUgY2xhc3M9XFxcInRiXFxcIiBuZy1pZj1cXFwiJGN0cmwuc2hvdygpXFxcIj5cXG4gICAgPGNhcHRpb24gY2xhc3M9XFxcInRiLXRpdGxlXFxcIj7QlNC+0LHQsNCy0LvQtdC90YvQtSDQv9GA0L7QtNGD0LrRgtGLPC9jYXB0aW9uPlxcbiAgICA8dHI+XFxuICAgICAgICA8dGQgY2xhc3M9XFxcInRkLW5hbWUgbmFtZS1jb2xvciBjb2xvclxcXCI+0J3QsNC40LzQtdC90L7QstCw0L3QuNC1INC/0YDQvtC00YPQutGC0LA8L3RkPlxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJwb3J0aW9uLWNvbG9yIGNvbG9yXFxcIj7Qn9C+0YDRhtC40Y88L3RkPlxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJjYXJib2h5ZC1jb2xvciBjb2xvclxcXCI+0KPQs9C70LXQstC+0LTRizwvdGQ+XFxuICAgICAgICA8dGQgY2xhc3M9XFxcInByb3QtY29sb3IgY29sb3JcXFwiPtCR0LXQu9C60Lg8L3RkPlxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJmYXQtY29sb3IgY29sb3JcXFwiPtCW0LjRgNGLPC90ZD5cXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwia2FsbC1jb2xvciBjb2xvclxcXCI+0JrQsNC70L7RgNC40Lg8L3RkPlxcbiAgICA8L3RyPlxcblxcbiAgICA8dHIgY2xhc3M9XFxcIm15LWZvb2RcXFwiIG5nLXJlcGVhdD1cXFwiKGZvb2ROYW1lLCB2YWx1ZXMpIGluICRjdHJsLm15Rm9vZHNcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5yZW1vdmVNeUZvb2Qoe25hbWU6IGZvb2ROYW1lfSlcXFwiPlxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJ0ZC1uYW1lXFxcIj57eyBmb29kTmFtZSB9fTwvdGQ+XFxuICAgICAgICA8dGQ+e3sgdmFsdWVzWzBdIH19PC90ZD5cXG4gICAgICAgIDx0ZD57eyB2YWx1ZXNbMV0gfX08L3RkPlxcbiAgICAgICAgPHRkPnt7IHZhbHVlc1syXSB9fTwvdGQ+XFxuICAgICAgICA8dGQ+e3sgdmFsdWVzWzNdIH19PC90ZD5cXG4gICAgICAgIDx0ZD57eyB2YWx1ZXNbNF0gfX08L3RkPlxcbiAgICA8L3RyPlxcbjwvdGFibGU+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcInN0b3JhZ2UtdGFibGUtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvdGFibGUtbW9kdWxlL3N0b3JhZ2UtdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL3N0b3JhZ2UtdGFibGUtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDI5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMikgcmV0dXJuICcnO1xyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvc2VydmljZXMvbGltaXRzLWZpbHRlci5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJGh0dHAsICR3aW5kb3cpIHtcclxuICAgIHZhciBiYXNlID0ge307XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Rm9vZEJhc2UoKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnLi9KU09OZGF0YS9mb29kLmpzb24nKS50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBiYXNlID0ge30sIGtleXMgPSBbXTtcclxuICAgICAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLm15Rm9vZHMpIGRhdGEuZGF0YS5wdXNoKEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2UubXlGb29kcykpO1xyXG5cclxuICAgICAgICAgICAgZGF0YS5kYXRhLmZvckVhY2goKG9iaikgPT4ge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIG9iaikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09ICduYW1lJykgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFzZVtrZXldID0gb2JqW2tleV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhiYXNlKS5mb3JFYWNoKChrZXkpID0+IGtleXMucHVzaCh7Zm9vZE5hbWU6IGtleX0pKTtcclxuICAgICAgICAgICAgYmFzZS5rZXlzID0ga2V5cztcclxuICAgICAgICAgICAgcmV0dXJuIGJhc2U7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBnZXRGb29kQmFzZSgpLnRoZW4oKGRhdGEpID0+IGJhc2UuZm9vZHMgPSBkYXRhKTtcclxuXHJcbiAgICBmdW5jdGlvbiBhZGRUb0Jhc2UobmFtZSwgdmFsdWVzKSB7XHJcbiAgICAgICAgYmFzZS5mb29kc1tuYW1lXSA9IHZhbHVlcztcclxuICAgICAgICBiYXNlLmZvb2RzLmtleXMucHVzaCh7Zm9vZE5hbWU6IG5hbWV9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZW1vdmVGcm9tQmFzZShuYW1lKSB7XHJcbiAgICAgICAgZGVsZXRlIGJhc2UuZm9vZHNbbmFtZV07XHJcblxyXG4gICAgICAgIGJhc2UuZm9vZHMua2V5cy5mb3JFYWNoKChvYmosIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChvYmouZm9vZE5hbWUgPT09IG5hbWUpIGJhc2UuZm9vZHMua2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Rm9vZE9iamVjdHMoKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnLi9KU09OZGF0YS9mb29kLmpzb24nKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldERheVRpbWVzRGF0YSgpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcuL0pTT05kYXRhL2RheS10aW1lcy1kYXRhLmpzb24nKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldExpbWl0c0RhdGEoZGlldCwgcGhhc2UpIHtcclxuICAgICAgICBsZXQgcGF0aCA9ICcuL0pTT05kYXRhL2xpbWl0cy1kYXRhLycgKyBkaWV0ICsgJy1waGFzZScgKyBwaGFzZSArICcuanNvbic7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChwYXRoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRUYWJsZURhdGEoKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnLi9KU09OZGF0YS9mb29kLmpzb24nKVxyXG4gICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRhYmxlRGF0YSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGRhdGEuZGF0YS5mb3JFYWNoKChvYmopID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3T2JqID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9vZHM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMjA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBvYmopIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ25hbWUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdPYmoudGl0bGUgPSBvYmoubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY291bnQgPj0gMjAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGl0bGVEYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2NvbG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ9Cd0LDQuNC80LXQvdC+0LLQsNC90LjQtSDQv9GA0L7QtNGD0LrRgtCwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9ydGlvbjogJ9Cf0L7RgNGG0LjRjycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmJvaHlkOiAn0KPQs9C70LXQstC+0LTRiycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3Q6ICfQkdC10LvQutC4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmF0OiAn0JbQuNGA0YsnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrYWxsOiAn0JrQsNC70L7RgNC40LgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld09iai5mb29kcy5wdXNoKHRpdGxlRGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZvb2QgPSB7Y2xhc3NOYW1lOiAnJywgdmFsdWVzOiB7fX07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvb2QudmFsdWVzLm5hbWUgPSBrZXk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvb2QudmFsdWVzLnBvcnRpb24gPSBvYmpba2V5XVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9vZC52YWx1ZXMuY2FyYm9oeWQgPSBvYmpba2V5XVsxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9vZC52YWx1ZXMucHJvdCA9IG9ialtrZXldWzJdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5mYXQgPSBvYmpba2V5XVszXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9vZC52YWx1ZXMua2FsbCA9IG9ialtrZXldWzRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdPYmouZm9vZHMucHVzaChmb29kKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlRGF0YS5wdXNoKG5ld09iaik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFibGVEYXRhO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlRGF0YSAmJiAhY29uZmlybSgn0JfQsNCz0YDRg9C30LjRgtGMINGB0L7RhdGA0LDQvdC10L3QuNGPPycpKSB7XHJcbiAgICAgICAgaWYgKGNvbmZpcm0oJ9Cj0LTQsNC70LjRgtGMINC40LzQtdGO0YnQuNC10YHRjyDRgdC+0YXRgNCw0L3QtdC90LjRjz8nKSkge1xyXG4gICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdzYXZlRGF0YScpO1xyXG4gICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdzYXZlZExpbWl0cycpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGJhc2U6IGJhc2UsXHJcbiAgICAgICAgYWRkVG9CYXNlOiBhZGRUb0Jhc2UsXHJcbiAgICAgICAgcmVtb3ZlRnJvbUJhc2U6IHJlbW92ZUZyb21CYXNlLFxyXG4gICAgICAgIGdldEZvb2RCYXNlOiBnZXRGb29kQmFzZSxcclxuICAgICAgICBnZXRGb29kT2JqZWN0czogZ2V0Rm9vZE9iamVjdHMsXHJcbiAgICAgICAgZ2V0VGFibGVEYXRhOiBnZXRUYWJsZURhdGEsXHJcbiAgICAgICAgZ2V0RGF5VGltZXNEYXRhOiBnZXREYXlUaW1lc0RhdGEsXHJcbiAgICAgICAgZ2V0TGltaXRzRGF0YTogZ2V0TGltaXRzRGF0YVxyXG4gICAgfTtcclxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvc2VydmljZXMvZGF0YS1zZXJ2aWNlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGFTZXJ2aWNlKSB7XG4gICAgdmFyIGZvb2QgPSBkYXRhU2VydmljZS5iYXNlO1xuXG5cbiAgICBmdW5jdGlvbiBmb29kQWRkVmFsaWRhdGlvbihuYW1lLCBwb3J0aW9uKSB7XG4gICAgICAgIGlmICghbmFtZSkge1xuICAgICAgICAgICAgYWxlcnQoJ9CS0LLQtdC00LjRgtC1INC90LDQt9Cy0LDQvdC40LUg0L/RgNC+0LTRg9C60YLQsCcpO1xuICAgICAgICB9IGVsc2UgaWYgKCFmb29kLmZvb2RzW25hbWVdKSB7XG4gICAgICAgICAgICBhbGVydCgn0KLQsNC60L7Qs9C+INC/0YDQvtC00YPQutGC0LAg0L3QtdGCINCyINCx0LDQt9C1LiDQodC+INGB0L/QuNGB0LrQvtC8INC/0YDQvtC00YPQutGC0L7QsiDQktGLINC80L7QttC10YLQtSDQvtC30L3QsNC60L7QvNC40YLRjNGB0Y8g0LIg0YDQsNC30LTQtdC70LUnICtcbiAgICAgICAgICAgICAgICAnXCLQotCw0LHQu9C40YbRi1wiLCDQu9C40LHQviDQtNC+0LHQsNCy0LjRgtGMINGB0LLQvtC5INC/0YDQvtC00YPQutGCJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXBvcnRpb24pIHtcbiAgICAgICAgICAgIGFsZXJ0KCfQktCy0LXQtNC40YLQtSDQv9C+0YDRhtC40Y4g0LIg0LPRgNCw0LzQvNCw0YUnKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc05hTigrcG9ydGlvbikpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfQkiDQv9C+0LvQtSBcItCf0L7RgNGG0LjRj1wiINCy0LLQtdC00LjRgtC1INGH0LjRgdC70L4nKTtcbiAgICAgICAgfWVsc2UgaWYgKHBvcnRpb24gPD0gMCkge1xuICAgICAgICAgICAgYWxlcnQoJ9CS0LLQtdC00LjRgtC1INGH0LjRgdC70L4g0LHQvtC70YzRiNC1INGH0LXQvCAwJylcbiAgICAgICAgfSBlbHNlIHsgcmV0dXJuIHRydWV9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmFsaWRhdGVMaW1pdHNDaG9vc2UoZGlldDEsIGRpZXQyLCBwaGFzZUNsYXNzKSB7XG4gICAgICAgIGlmKCAoZGlldDEgfHwgZGlldDIpICYmIHBoYXNlQ2xhc3MgIT09ICdzdGFydCcpIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZE15Rm9vZFZhbGlkYXRpb24obmFtZSwgdmFsdWVzKSB7XG4gICAgICAgIGxldCBzdWNjZXNzID0gdHJ1ZTtcbiAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgICBhbGVydCgn0JLQstC10LTQuNGC0LUg0L3QsNC40LzQtdC90L7QstCw0L3QuNC1INC/0YDQvtC00YPQutGC0LAnKTtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZXMuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmIChpc05hTih2YWx1ZSl8fCB2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgICAgICBhbGVydCgn0JfQvdCw0YfQtdC90LjRjyDQtNC+0LvQttC90Ysg0LHRi9GC0Ywg0YfQuNGB0LvQsNC80Lgg0YHQviDQt9C90LDRh9C10L3QuNC10Lwg0LHQvtC70YzRiNC40Lwg0LjQu9C4INGA0LDQstC90YvQvCDQvdGD0LvRjicpO1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc3VjY2VzcztcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBmb29kQWRkVmFsaWRhdGlvbjogZm9vZEFkZFZhbGlkYXRpb24sXG4gICAgICAgIHZhbGlkYXRlTGltaXRzQ2hvb3NlOiB2YWxpZGF0ZUxpbWl0c0Nob29zZSxcbiAgICAgICAgYWRkTXlGb29kVmFsaWRhdGlvbjogYWRkTXlGb29kVmFsaWRhdGlvblxuICAgIH1cbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3NlcnZpY2VzL3ZhbGlkYXRpb24tc2VydmljZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YVNlcnZpY2UpIHtcclxuICAgIHZhciBmb29kID0gZGF0YVNlcnZpY2UuYmFzZTtcclxuXHJcbiAgICBmdW5jdGlvbiBjYWxjdWxhdGVWYWx1ZXMoZm9vZE5hbWUsIHBvcnRpb24pIHtcclxuICAgICAgICBsZXQgdmFsdWVzID0gZm9vZC5mb29kc1tmb29kTmFtZV07XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbmFtZTogZm9vZE5hbWUsXHJcbiAgICAgICAgICAgIHBvcnRpb246IHBvcnRpb24sXHJcbiAgICAgICAgICAgIGNhcmJvaHlkOiBNYXRoLnJvdW5kKHZhbHVlc1sxXS92YWx1ZXNbMF0qcG9ydGlvbiksXHJcbiAgICAgICAgICAgIHByb3Q6IE1hdGgucm91bmQodmFsdWVzWzJdL3ZhbHVlc1swXSpwb3J0aW9uKSxcclxuICAgICAgICAgICAgZmF0OiBNYXRoLnJvdW5kKHZhbHVlc1szXS92YWx1ZXNbMF0qcG9ydGlvbiksXHJcbiAgICAgICAgICAgIGthbGw6IE1hdGgucm91bmQodmFsdWVzWzRdL3ZhbHVlc1swXSpwb3J0aW9uKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNhbGN1bGF0ZVZhbHVlczogY2FsY3VsYXRlVmFsdWVzXHJcbiAgICB9XHJcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3NlcnZpY2VzL2NhbGN1bGF0aW9uLXNlcnZpY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGFTZXJ2aWNlKSB7XHJcbiAgICB2YXIgbGltaXRzRGF0YSA9IHt9O1xyXG5cclxuICAgIGZ1bmN0aW9uIHNldExpbWl0cyhkaWV0LCBwaGFzZSkge1xyXG4gICAgICAgIGRhdGFTZXJ2aWNlLmdldExpbWl0c0RhdGEoZGlldCwgcGhhc2UpXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiBsaW1pdHNEYXRhLmxpbWl0cyA9IGRhdGEuZGF0YSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGxpbWl0c0RhdGE6IGxpbWl0c0RhdGEsXHJcbiAgICAgICAgc2V0TGltaXRzOiBzZXRMaW1pdHNcclxuICAgIH1cclxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvc2VydmljZXMvbGltaXRzLXNlcnZpY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCB2aWV3VGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL3ZpZXctdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgdmlldyA9IHtcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIChkYXRhU2VydmljZSwgbGltaXRzU2VydmljZSwgJHdpbmRvdywgJHN0YXRlUGFyYW1zLCBpbmRleFNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgY29uc3QgZW1wdHkgPSB7XHJcbiAgICAgICAgICAgIGVtcHR5OiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lOiAnLS0tLS0tLS0tJyxcclxuICAgICAgICAgICAgcG9ydGlvbjogJy0tLScsXHJcbiAgICAgICAgICAgIGNhcmJvaHlkOiAnLS0tJyxcclxuICAgICAgICAgICAgcHJvdDogJy0tLScsXHJcbiAgICAgICAgICAgIGZhdDogJy0tLScsXHJcbiAgICAgICAgICAgIGthbGw6ICctLS0nXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5iYXNlID0gZGF0YVNlcnZpY2UuYmFzZTtcclxuICAgICAgICB0aGlzLnZpZXdEYXRhID0ge1xyXG4gICAgICAgICAgICBsaW1pdHNEYXRhOiBsaW1pdHNTZXJ2aWNlLmxpbWl0c0RhdGFcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZURhdGEpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVEYXRhKTtcclxuICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5kYXlUaW1lcyA9IGRhdGEuZGF5c0RhdGE7XHJcbiAgICAgICAgICAgIHRoaXMudmlld0RhdGEucmVzdWx0RmluYWwgPSBkYXRhLnJlc3VsdEZpbmFsO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRhdGFTZXJ2aWNlLmdldERheVRpbWVzRGF0YSgpXHJcbiAgICAgICAgICAgICAgICAudGhlbigoZGF0YSkgPT4gdGhpcy52aWV3RGF0YS5kYXlUaW1lcyA9IGRhdGEuZGF0YSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsID0ge1xyXG4gICAgICAgICAgICAgICAgY2FyYm9oeWQ6IDAsXHJcbiAgICAgICAgICAgICAgICBwcm90OiAwLFxyXG4gICAgICAgICAgICAgICAgZmF0OiAwLFxyXG4gICAgICAgICAgICAgICAga2FsbDogMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5jb21wYXJlID0gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMudmlld0RhdGEubGltaXRzRGF0YS5saW1pdHMpIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKHRoaXMudmlld0RhdGEubGltaXRzRGF0YS5saW1pdHNbXCLQmNGC0L7Qs1wiXVtrZXldIDwgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbFtrZXldKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5hZGRGb29kID0gZnVuY3Rpb24gKGRheVRpbWVJZCwgZm9vZCkge1xyXG4gICAgICAgICAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMudmlld0RhdGEuZGF5VGltZXNbZGF5VGltZUlkXS5mb29kcztcclxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb25bMF0uZW1wdHkpIGNvbGxlY3Rpb24uc3BsaWNlKDAsIDEpO1xyXG5cclxuICAgICAgICAgICAgY29sbGVjdGlvbi5wdXNoKGZvb2QpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGNSZXN1bHQoZGF5VGltZUlkLCBmb29kLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCkgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnX2xhc3RTYXZlSWQnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZUZvb2QgPSBmdW5jdGlvbiAoZGF5VGltZUlkLCBmb29kKSB7XHJcbiAgICAgICAgICAgIGxldCBjb2xsZWN0aW9uID0gdGhpcy52aWV3RGF0YS5kYXlUaW1lc1tkYXlUaW1lSWRdLmZvb2RzO1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBjb2xsZWN0aW9uLmluZGV4T2YoZm9vZCk7XHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb24uc3BsaWNlKGluZGV4LCAxKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9uLmxlbmd0aCA9PT0gMCkgY29sbGVjdGlvbi5wdXNoKGVtcHR5KTtcclxuICAgICAgICAgICAgdGhpcy5jYWxjUmVzdWx0KGRheVRpbWVJZCwgZm9vZCwgZmFsc2UpO1xyXG4gICAgICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuX2xhc3RTYXZlSWQpICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ19sYXN0U2F2ZUlkJyk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuY2FsY1Jlc3VsdCA9IGZ1bmN0aW9uIChkYXlUaW1lSWQsIGZvb2QsIGJvb2wpIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHRoaXMudmlld0RhdGEuZGF5VGltZXNbZGF5VGltZUlkXS5yZXN1bHQ7XHJcbiAgICAgICAgICAgIGlmIChib29sKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gKz0gZm9vZFtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld0RhdGEucmVzdWx0RmluYWxba2V5XSArPSBmb29kW2tleV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gLT0gZm9vZFtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld0RhdGEucmVzdWx0RmluYWxba2V5XSAtPSBmb29kW2tleV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmRlZmluZUluZGV4ID0gZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmlld0RhdGEuZGF5VGltZXNbaW5kZXhdO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IHZpZXdUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9tYWluLW1vZHVsZS92aWV3LWNvbXBvbmVudC92aWV3LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGxlZnQtc2lkZS1tZW51PjwvbGVmdC1zaWRlLW1lbnU+XFxyXFxuPGRheXRpbWUtY2hvb3NlPjwvZGF5dGltZS1jaG9vc2U+XFxyXFxuXFxyXFxuPGRpdiBjbGFzcz1cXFwibWFpbi12aWV3XFxcIiB1aS12aWV3PlxcclxcblxcclxcbjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJ2aWV3LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL21haW4tbW9kdWxlL3ZpZXctY29tcG9uZW50L3RlbXBsYXRlL3ZpZXctdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDc3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRheXRpbWUpIHtcclxuICAgICAgICBzd2l0Y2ggKGRheXRpbWUpIHtcclxuICAgICAgICAgICAgY2FzZSAnYnJlYWtmYXN0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2ZpcnN0LXNuYWNrJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2Rpbm5lcic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdzZWNvbmQtc25hY2snOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZXZlbmluZy1tZWFsJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9pbmRleC1zZXJ2aWNlLmpzXG4gKiovIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FDdENBOzs7Ozs7QUNBQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPQTs7Ozs7Ozs7Ozs7Ozs7O0FDUEE7QUFDQTs7O0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFYQTtBQWFBO0FBQ0E7O0FBZEE7QUFpQkE7QUFDQTtBQUNBO0FBQ0E7O0FBcEJBO0FBQ0E7QUF5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFGQTtBQU9BO0FBUEE7QUFEQTtBQUNBO0FBV0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRkE7QUFBQTtBQURBO0FBQ0E7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSUE7QUFEQTtBQUlBO0FBSkE7QUFKQTtBQURBO0FBQ0E7QUFhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFKQTtBQURBO0FBQ0E7QUFRQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQURBO0FBR0E7QUFDQTtBQURBO0FBSEE7QUFDQTtBQU9BO0FBWkE7QUFEQTtBQUNBOztBQXJFQTtBQXVGQTtBQUNBO0FBQ0E7QUFIQTtBQUNBOztBQXZGQTtBQThGQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFEQTtBQUlBO0FBSkE7QUFDQTtBQU1BO0FBQ0E7QUFEQTtBQUlBO0FBSkE7QUFSQTtBQUNBO0FBZUE7QUFDQTtBQUNBO0FBREE7QUFEQTtBQUNBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFOQTtBQUNBO0FBUUE7O0FBRUE7QUFFQTtBQURBO0FBSEE7QUFDQTtBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFIQTtBQVFBO0FBUkE7QUFVQTtBQVpBO0FBQ0E7QUFjQTtBQUNBOzs7QUFEQTtBQUtBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQURBO0FBS0E7QUFMQTtBQU9BO0FBbkJBO0FBQ0E7QUFxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSEE7QUFDQTtBQU9BO0FBQ0E7QUFDQTs7QUFFQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBREE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFGQTtBQVNBO0FBQ0E7QUFDQTtBQURBO0FBRkE7QUFPQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFUQTtBQUNBO0FBYUE7QUFDQTtBQUNBO0FBREE7QUFEQTtBQTNCQTtBQWxCQTtBQUNBO0FBb0RBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTs7QUFGQTs7QUFBQTtBQUNBO0FBU0E7QUFWQTtBQURBO0FBQ0E7QUFjQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBS0E7QUFDQTtBQURBO0FBQ0E7QUFJQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUNBO0FBS0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSUE7QUFKQTtBQUZBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFMQTtBQU9BO0FBUkE7QUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFGQTtBQU5BO0FBRkE7QUFnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBRkE7QUFOQTtBQWNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7QUFmQTtBQXNCQTtBQUNBOzs7QUFHQTtBQUhBO0FBTUE7QUFDQTtBQURBO0FBR0E7QUFDQTtBQVZBO0FBREE7Ozs7QUFrQkE7QUFDQTtBQURBO0FBbEJBO0FBREE7OztBQTBCQTtBQUhBO0FBekVBO0FBQ0E7QUErRUE7QUFDQTs7QUFFQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBTkE7QUFEQTtBQUNBO0FBWUE7O0FBRUE7QUFDQTtBQURBO0FBQ0E7O0FBSEE7QUFRQTtBQURBO0FBR0E7QUFDQTtBQURBO0FBSUE7QUFDQTtBQURBO0FBSkE7QUFWQTtBQUNBO0FBbUJBO0FBQ0E7QUFDQTtBQURBO0FBREE7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFiQTtBQUNBO0FBaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUFOQTtBQUNBO0FBZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSEE7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFDQTtBQUtBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFEQTtBQVJBO0FBWUE7QUFuQkE7QUFDQTtBQXFCQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQU1BO0FBVkE7QUFDQTtBQVlBOztBQUVBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBSEE7QUFLQTtBQUNBO0FBUkE7QUFEQTtBQWFBO0FBREE7QUFHQTtBQUhBO0FBakJBO0FBQ0E7QUF1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFKQTtBQXBCQTtBQUhBO0FBZ0NBO0FBaENBO0FBQ0E7QUFrQ0E7QUFHQTtBQUhBO0FBS0E7QUFEQTtBQUdBO0FBSEE7QUExQ0E7QUFDQTtBQWdEQTtBQUNBO0FBQ0E7QUFEQTtBQUlBO0FBREE7QUFJQTtBQUpBO0FBSkE7QUFDQTtBQVdBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUpBO0FBQ0E7QUFVQTtBQUNBO0FBR0E7QUFIQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBRkE7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBcEJBO0FBREE7QUFDQTtBQTRCQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBQ0E7QUFLQTtBQUNBO0FBREE7QUFDQTtBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBREE7QUFJQTtBQUpBO0FBTUE7QUFDQTtBQWRBO0FBQ0E7QUFnQkE7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUtBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQURBO0FBR0E7QUFiQTtBQUNBOztBQWhvQkE7QUFpcEJBO0FBREE7QUFDQTs7QUFqcEJBO0FBc3BCQTtBQURBO0FBQ0E7O0FBdHBCQTtBQTJwQkE7QUFEQTtBQUNBOztBQTNwQkE7QUFncUJBO0FBREE7QUFDQTs7QUFocUJBO0FBcXFCQTtBQURBO0FBQ0E7O0FBcnFCQTs7QUEycUJBO0FBQ0E7QUFEQTtBQUlBO0FBSkE7QUFGQTtBQUNBO0FBU0E7QUFDQTs7QUFwckJBO0FBdXJCQTtBQUNBO0FBQ0E7QUFDQTs7QUExckJBO0FBQ0E7O0FBREE7QUFnc0JBO0FBQ0E7O0FBanNCQTtBQUNBOztBQURBO0FBdXNCQTtBQUNBO0FBRkE7QUF0c0JBO0FBQ0E7QUEyc0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW5DQTtBQXFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBR0E7QUFKQTtBQU1BO0FBVEE7QUEzQ0E7QUF0dkJBOzs7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFLQTtBQUNBO0FBRUE7QUFDQTtBQUhBO0FBTUE7QUFDQTtBQVBBO0FBREE7QUFDQTtBQVdBOzs7Ozs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQTtBQUNBO0FBU0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFGQTtBQXJCQTtBQTBCQTtBQTNCQTtBQUNBO0FBNkJBOzs7Ozs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBRkE7QUFUQTtBQWtCQTtBQW5CQTtBQUNBO0FBcUJBOzs7Ozs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHQTtBQUpBO0FBQ0E7QUFNQTs7Ozs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFNQTs7Ozs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBUkE7QUFDQTtBQVdBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMQTtBQUNBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUEvQ0E7QUFzREE7QUF2REE7QUFDQTtBQXlEQTs7Ozs7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEE7QUFDQTtBQVNBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFSQTtBQUNBO0FBZ0JBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEE7QUFDQTtBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFQQTtBQUNBO0FBU0E7QUFDQTtBQURBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQURBO0FBTUE7QUFDQTtBQUNBO0FBRkE7QUFOQTtBQUZBO0FBaEVBO0FBK0VBO0FBaEZBO0FBQ0E7QUFrRkE7Ozs7OztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBSEE7QUFNQTtBQUNBOztBQVBBO0FBQ0E7O0FBREE7QUFhQTtBQWJBO0FBQ0E7QUFnQkE7QUFDQTtBQUNBO0FBRkE7QUF2Q0E7QUE0Q0E7QUFwREE7QUFDQTtBQXNEQTs7Ozs7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBREE7QUFEQTtBQUtBO0FBVkE7QUFDQTtBQVlBOzs7Ozs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7O0FBREE7QUFJQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFOQTs7QUFIQTtBQWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWxCQTtBQUNBO0FBb0JBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQUNBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUpBO0FBREE7QUFRQTtBQUNBO0FBVEE7QUFDQTtBQVdBO0FBZEE7QUFDQTtBQWdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFEQTtBQXJEQTtBQTZEQTtBQWxFQTtBQUNBO0FBb0VBOzs7Ozs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFLQTs7Ozs7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQTtBQUVBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFDQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQVJBO0FBZkE7QUEwQkE7QUEzQkE7QUFDQTtBQThCQTs7Ozs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVZBO0FBSEE7QUFnQkE7QUFwQkE7QUFDQTtBQXNCQTs7Ozs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFHQTtBQVJBO0FBQ0E7QUFVQTs7Ozs7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBS0E7QUFWQTtBQUNBO0FBWUE7Ozs7OztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7QUFNQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBWkE7QUFEQTtBQUNBO0FBZ0JBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUhBO0FBQ0E7QUFPQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTkE7QUFGQTtBQVdBO0FBQ0E7QUFiQTtBQWVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQTVCQTtBQUNBO0FBOEJBO0FBckNBO0FBQ0E7QUF1Q0E7QUEzQ0E7QUFGQTtBQUNBO0FBZ0RBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQUNBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUkE7QUF4R0E7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBREE7QUFJQTtBQURBO0FBR0E7QUFEQTtBQUdBO0FBREE7QUFFQTtBQUZBO0FBVkE7QUFDQTtBQWNBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFEQTtBQU9BO0FBZEE7QUFDQTtBQWdCQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBeENBOzs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTkE7QUFGQTtBQUNBO0FBV0E7QUFDQTtBQURBO0FBZkE7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFGQTtBQVJBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBUkE7QUFDQTtBQWdCQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEE7QUFDQTtBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7QUFNQTtBQUNBO0FBQ0E7QUFGQTtBQU5BO0FBRkE7QUFDQTtBQWNBO0FBQ0E7QUFDQTtBQUZBO0FBNUVBO0FBa0ZBO0FBbkZBO0FBQ0E7QUFxRkE7Ozs7OztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFOQTtBQVFBO0FBQ0E7QUFUQTtBQVdBO0FBQ0E7QUFaQTtBQWNBO0FBQ0E7QUFmQTtBQWlCQTtBQWpCQTtBQURBO0FBREE7OzsiLCJzb3VyY2VSb290IjoiIn0=