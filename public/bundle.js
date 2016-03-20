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
	app.factory('dataService', __webpack_require__(31)).factory('validationService', __webpack_require__(32)).factory('calculationService', __webpack_require__(33)).factory('limitsService', __webpack_require__(34)).factory('indexService', __webpack_require__(78)).factory('activeClassService', __webpack_require__(96)).factory('dietChoose', __webpack_require__(99));

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

	main.component('leftSideMenu', __webpack_require__(4)).component('daytimeChoose', __webpack_require__(6)).component('home', __webpack_require__(100)).component('view', __webpack_require__(76));

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
	    controller: function controller($state, activeClassService) {
	        var _this = this;

	        this.activeClass = activeClassService.getClassName;

	        this.menuItems = [{ className: 'home', tooltip: 'На главную', tooltipShow: false }, { className: 'settings', tooltip: 'Настройки', tooltipShow: false }, { className: 'result', tooltip: 'Итог дня', tooltipShow: false }, { className: 'print', tooltip: 'Для печати', tooltipShow: false }, { className: 'save', tooltip: 'Сохранить', tooltipShow: false }, { className: 'tables', tooltip: 'Таблицы', tooltipShow: false }, { className: 'add-food', tooltip: 'Добавить еду в таблицу', tooltipShow: false }];

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
/* 8 */,
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

	diaryModule.component('menu', __webpack_require__(11)).component('mainView', __webpack_require__(13)).component('dayTime', __webpack_require__(15)).component('food', __webpack_require__(17)).component('saveMenu', __webpack_require__(19)).component('result', __webpack_require__(101));

		module.exports = diaryModule;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var menuTemplate = __webpack_require__(12);

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
/* 12 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div id=\"menu\">\n    <div class=\"diet-menu\">\n        <div class=\"diet-tittle\">Вид диеты:</div>\n        <div class=\"diet-choose\">\n            <span class=\"diet\" ng-class=\"{active: $ctrl.diets.proteins}\" ng-click=\"$ctrl.setDiet('proteins')\">Высокопротеиновая комбинация замен</span>\n            <br>\n            <span class=\"diet\" ng-class=\"{active: $ctrl.diets.carbohydrates}\" ng-click=\"$ctrl.setDiet('carbohydrates')\">Высокоуглеводная комбинация замен</span>\n        </div>\n    </div>\n    <div class=\"phase-menu\">\n        <div class=\"phase-tittle\">Выберете Вашу фазу:</div>\n        <div class=\"phase-choose\">\n\n            <div ng-class=\"$ctrl.className.name\" class=\"first-phase\" ng-click=\"$ctrl.setClassName(1)\"><span>-</span> 1 <span>-</span></div>\n            <div ng-class=\"$ctrl.className.name\" class=\"second-phase\" ng-click=\"$ctrl.setClassName(2)\"><span>-</span> 2 <span>-</span></div>\n            <div ng-class=\"$ctrl.className.name\" class=\"third-phase\" ng-click=\"$ctrl.setClassName(3)\"><span>-</span> 3 <span>-</span></div>\n\n        </div>\n    </div>\n\n    <div class=\"clear-limits\" ng-click=\"$ctrl.resetChoose()\">Сбросить лимиты</div>\n</div>";
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
	            debugger;
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
/* 16 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"day-time\">\r\n    <div class=\"input\">\r\n        <form>\r\n            <label>Наименование: <angucomplete-alt ng-keypress=\"$ctrl.enter($event)\" id=\"ex1\" placeholder=\"Введите продукт\" pause=\"100\" selected-object=\"$ctrl.foodName\" local-data=\"$ctrl.base.foods.keys\" search-fields=\"foodName\" title-field=\"foodName\" minlength=\"1\" input-changed=\"$ctrl.onInput\" input-class=\"food form-control-small\" match-class=\"highlight\"></angucomplete-alt></label>\r\n            <br>\r\n\r\n            <label>Порция(гр): <input type=\"text\" class=\"portion-input\" size=\"2\" ng-model=\"$ctrl.portion\" ng-keypress=\"$ctrl.enter($event)\"/></label>\r\n        </form>\r\n        <div class=\"add-button\" ng-click=\"$ctrl.addFood()\">+</div>\r\n    </div>\r\n\r\n    <div class=\"table-border\">\r\n        <div class=\"table\">\r\n            <div class=\"table-tittle\">\r\n                <span class=\"name\">Наименование продукта</span>\r\n                <span class=\"portion\">Порция (гр)</span>\r\n                <span class=\"carbohyd\">Углеводы</span>\r\n                <span class=\"prot\">Белки</span>\r\n                <span class=\"fat\">Жиры</span>\r\n                <span class=\"kall\">Калории</span>\r\n            </div>\r\n\r\n\r\n            <food ng-repeat=\"food in $ctrl.daytimes[$ctrl.index].foods\" food=\"food\" remove=\"$ctrl.removeFood(food)\"></food>\r\n\r\n\r\n            <div class=\"summary\">\r\n                <span class=\"name\">Подытог</span>\r\n                <span class=\"portion\">---</span>\r\n                <span class=\"carbohyd\" ng-class=\"{'active-limit': $ctrl.compare('carbohyd')}\">{{ $ctrl.daytimes[$ctrl.index].result.carbohyd }} {{'(' + $ctrl.limits().carbohyd + ')' | limit }}</span>\r\n                <span class=\"prot\" ng-class=\"{'active-limit': $ctrl.compare('prot')}\">{{ $ctrl.daytimes[$ctrl.index].result.prot }} {{'(' + $ctrl.limits().prot + ')' | limit }}</span>\r\n                <span class=\"fat\" ng-class=\"{'active-limit': $ctrl.compare('fat')}\">{{ $ctrl.daytimes[$ctrl.index].result.fat }} {{'(' + $ctrl.limits().fat + ')' | limit }}</span>\r\n                <span class=\"kall\" ng-class=\"{'active-limit': $ctrl.compare('kall')}\">{{ $ctrl.daytimes[$ctrl.index].result.kall }} {{'(' + $ctrl.limits().kall + ')' | limit }}</span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n</div>\r\n\r\n\r\n<div class=\"br\"></div>";
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

/***/ },
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
/* 96 */
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
/* 97 */,
/* 98 */,
/* 99 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function ($timeout, validationService, limitsService, $window) {
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
	        diets.carbohydrates = false;
	        diets.proteins = false;
	        className.name = 'start';

	        limitsService.clearLimits();
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
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var homePageTemplate = __webpack_require__(9);

	var homePage = {
	    controller: function controller() {},
	    template: homePageTemplate
	};

		module.exports = homePage;

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var resultTemplate = __webpack_require__(102);

	var result = {
	    bindings: {
	        result: '<'
	    },
	    controller: function controller(limitsService) {
	        this.limits = limitsService.limitsData;
	    },
	    template: resultTemplate
	};

		module.exports = result;

/***/ },
/* 102 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"result\">\r\n    <div class=\"title\">Итог дня</div>\r\n</div>";
	ngModule.run(["$templateCache",function(c){c.put("result-template.html",v1)}]);
	module.exports=v1;

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIDVjOWQ0NDk5MTM1NDUxNWU0YjExIiwid2VicGFjazovLy9qcy9kaWFyeUFwcC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL2luZGV4LmpzIiwid2VicGFjazovLy9ub2RlX21vZHVsZXMvYW5ndWNvbXBsZXRlLWFsdC9hbmd1Y29tcGxldGUtYWx0LmpzIiwid2VicGFjazovLy9qcy9hcHAvbWFpbi1tb2R1bGUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9tYWluLW1vZHVsZS9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQvbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC9tYWluLW1vZHVsZS9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQvdGVtcGxhdGUvbGVmdC1zaWRlLW1lbnUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL21haW4tbW9kdWxlL2RheXRpbWUtY2hvb3NlLWNvbXBvbmVudC9kYXl0aW1lLWNob29zZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL21haW4tbW9kdWxlL2RheXRpbWUtY2hvb3NlLWNvbXBvbmVudC90ZW1wbGF0ZS9kYXl0aW1lLWNob29zZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy8uL2pzL2FwcC9tYWluLW1vZHVsZS9ob21lLXBhZ2UtbW9kdWxlL3RlbXBsYXRlL2hvbWUtcGFnZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvZGlhcnktbW9kdWxlL2luZGV4LmpzIiwid2VicGFjazovLy9qcy9hcHAvZGlhcnktbW9kdWxlL21lbnUvbWVudS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9tZW51L3RlbXBsYXRlL21lbnUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9tYWluLXZpZXcvbWFpbi12aWV3LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvZGlhcnktbW9kdWxlL21haW4tdmlldy90ZW1wbGF0ZS9tYWluLXZpZXcuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9kYXktdGltZS9kYXktdGltZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9kYXktdGltZS90ZW1wbGF0ZS9kYXktdGltZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvZGlhcnktbW9kdWxlL2Zvb2QvZm9vZC1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9mb29kL3RlbXBsYXRlL2Zvb2QtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9zYXZlLW1lbnUvc2F2ZS1tZW51LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvZGlhcnktbW9kdWxlL3NhdmUtbWVudS90ZW1wbGF0ZS9zYXZlLW1lbnUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS12aWV3LWNvbXBvbmVudC90YWJsZS12aWV3LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLXZpZXctY29tcG9uZW50L3RlbXBsYXRlL3RhYmxlLXZpZXctdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L2FkZC10by10YWJsZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLWNvbXBvbmVudC90YWJsZS1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS1jb21wb25lbnQvdGVtcGxhdGUvdGFibGUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3RhYmxlLW1vZHVsZS9zdG9yYWdlLXRhYmxlLWNvbXBvbmVudC9zdG9yYWdlLXRhYmxlLWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvdGFibGUtbW9kdWxlL3N0b3JhZ2UtdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL3N0b3JhZ2UtdGFibGUtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2xpbWl0cy1maWx0ZXIuanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9zZXJ2aWNlcy9kYXRhLXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9zZXJ2aWNlcy92YWxpZGF0aW9uLXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9zZXJ2aWNlcy9jYWxjdWxhdGlvbi1zZXJ2aWNlLmpzIiwid2VicGFjazovLy9qcy9hcHAvc2VydmljZXMvbGltaXRzLXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vL2pzL2FwcC9tYWluLW1vZHVsZS92aWV3LWNvbXBvbmVudC92aWV3LWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAvbWFpbi1tb2R1bGUvdmlldy1jb21wb25lbnQvdGVtcGxhdGUvdmlldy10ZW1wbGF0ZS5odG1sIiwid2VicGFjazovLy9qcy9hcHAvc2VydmljZXMvaW5kZXgtc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL3NlcnZpY2VzL2FjdGl2ZS1jbGFzcy1zZXJ2aWNlLmpzIiwid2VicGFjazovLy9qcy9hcHAvc2VydmljZXMvZGlldC1jaG9vc2Utc2VydmljZS5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL21haW4tbW9kdWxlL2hvbWUtcGFnZS1tb2R1bGUvaG9tZS1wYWdlLWNvbXBvbmVudC5qcyIsIndlYnBhY2s6Ly8vanMvYXBwL2RpYXJ5LW1vZHVsZS9yZXN1bHQtY29tcG9uZW50L3Jlc3VsdC1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwL2RpYXJ5LW1vZHVsZS9yZXN1bHQtY29tcG9uZW50L3RlbXBsYXRlL3Jlc3VsdC10ZW1wbGF0ZS5odG1sIl0sInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgNWM5ZDQ0OTkxMzU0NTE1ZTRiMTFcbiAqKi8iLCJyZXF1aXJlKCcuL2FwcCcpO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2RpYXJ5QXBwLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5jb25zdCBhdXRvY29tcGxpdGUgPSByZXF1aXJlKCdhbmd1Y29tcGxldGUtYWx0Jyk7XHJcbmNvbnN0IG1haW5Nb2R1bGUgPSByZXF1aXJlKCcuL21haW4tbW9kdWxlJyk7XHJcbmNvbnN0IGRpYXJ5TW9kdWxlID0gcmVxdWlyZSgnLi9kaWFyeS1tb2R1bGUnKTtcclxuY29uc3QgdGFibGVNb2R1bGUgPSByZXF1aXJlKCcuL3RhYmxlLW1vZHVsZScpO1xyXG5cclxuY29uc3QgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnbWFpbicsICdkaWFyeScsICd0YWJsZScsICduZ0FuaW1hdGUnLCAnYW5ndWNvbXBsZXRlLWFsdCddKTtcclxuXHJcbmFwcC5maWx0ZXIoJ2xpbWl0JywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9saW1pdHMtZmlsdGVyJykpO1xyXG5hcHBcclxuICAgIC5mYWN0b3J5KCdkYXRhU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvZGF0YS1zZXJ2aWNlJykpXHJcbiAgICAuZmFjdG9yeSgndmFsaWRhdGlvblNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL3ZhbGlkYXRpb24tc2VydmljZScpKVxyXG4gICAgLmZhY3RvcnkoJ2NhbGN1bGF0aW9uU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMvY2FsY3VsYXRpb24tc2VydmljZScpKVxyXG4gICAgLmZhY3RvcnkoJ2xpbWl0c1NlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL2xpbWl0cy1zZXJ2aWNlJykpXHJcbiAgICAuZmFjdG9yeSgnaW5kZXhTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9pbmRleC1zZXJ2aWNlJykpXHJcbiAgICAuZmFjdG9yeSgnYWN0aXZlQ2xhc3NTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcy9hY3RpdmUtY2xhc3Mtc2VydmljZScpKVxyXG4gICAgLmZhY3RvcnkoJ2RpZXRDaG9vc2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzL2RpZXQtY2hvb3NlLXNlcnZpY2UnKSk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBhcHA7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL2luZGV4LmpzXG4gKiovIiwiLypcbiAqIGFuZ3Vjb21wbGV0ZS1hbHRcbiAqIEF1dG9jb21wbGV0ZSBkaXJlY3RpdmUgZm9yIEFuZ3VsYXJKU1xuICogVGhpcyBpcyBhIGZvcmsgb2YgRGFyeWwgUm93bGFuZCdzIGFuZ3Vjb21wbGV0ZSB3aXRoIHNvbWUgZXh0cmEgZmVhdHVyZXMuXG4gKiBCeSBIaWRlbmFyaSBOb3pha2lcbiAqL1xuXG4vKiEgQ29weXJpZ2h0IChjKSAyMDE0IEhpZGVuYXJpIE5vemFraSBhbmQgY29udHJpYnV0b3JzIHwgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlICovXG5cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYW5ndWNvbXBsZXRlLWFsdCcsIFtdKS5kaXJlY3RpdmUoJ2FuZ3Vjb21wbGV0ZUFsdCcsIFsnJHEnLCAnJHBhcnNlJywgJyRodHRwJywgJyRzY2UnLCAnJHRpbWVvdXQnLCAnJHRlbXBsYXRlQ2FjaGUnLCAnJGludGVycG9sYXRlJywgZnVuY3Rpb24gKCRxLCAkcGFyc2UsICRodHRwLCAkc2NlLCAkdGltZW91dCwgJHRlbXBsYXRlQ2FjaGUsICRpbnRlcnBvbGF0ZSkge1xuICAvLyBrZXlib2FyZCBldmVudHNcbiAgdmFyIEtFWV9EVyA9IDQwO1xuICB2YXIgS0VZX1JUID0gMzk7XG4gIHZhciBLRVlfVVAgPSAzODtcbiAgdmFyIEtFWV9MRiA9IDM3O1xuICB2YXIgS0VZX0VTID0gMjc7XG4gIHZhciBLRVlfRU4gPSAxMztcbiAgdmFyIEtFWV9UQUIgPSA5O1xuXG4gIHZhciBNSU5fTEVOR1RIID0gMztcbiAgdmFyIE1BWF9MRU5HVEggPSA1MjQyODg7ICAvLyB0aGUgZGVmYXVsdCBtYXggbGVuZ3RoIHBlciB0aGUgaHRtbCBtYXhsZW5ndGggYXR0cmlidXRlXG4gIHZhciBQQVVTRSA9IDUwMDtcbiAgdmFyIEJMVVJfVElNRU9VVCA9IDIwMDtcblxuICAvLyBzdHJpbmcgY29uc3RhbnRzXG4gIHZhciBSRVFVSVJFRF9DTEFTUyA9ICdhdXRvY29tcGxldGUtcmVxdWlyZWQnO1xuICB2YXIgVEVYVF9TRUFSQ0hJTkcgPSAn0J/QvtC40YHQui4uLic7XG4gIHZhciBURVhUX05PUkVTVUxUUyA9ICfQndC10YIg0YHQvtCy0L/QsNC00LXQvdC40LknO1xuICB2YXIgVEVNUExBVEVfVVJMID0gJy9hbmd1Y29tcGxldGUtYWx0L2luZGV4Lmh0bWwnO1xuXG4gIC8vIFNldCB0aGUgZGVmYXVsdCB0ZW1wbGF0ZSBmb3IgdGhpcyBkaXJlY3RpdmVcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFRFTVBMQVRFX1VSTCxcbiAgICAnPGRpdiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1ob2xkZXJcIiBuZy1jbGFzcz1cIntcXCdhbmd1Y29tcGxldGUtZHJvcGRvd24tdmlzaWJsZVxcJzogc2hvd0Ryb3Bkb3dufVwiPicgK1xuICAgICcgIDxpbnB1dCBpZD1cInt7aWR9fV92YWx1ZVwiIG5hbWU9XCJ7e2lucHV0TmFtZX19XCIgdGFiaW5kZXg9XCJ7e2ZpZWxkVGFiaW5kZXh9fVwiIG5nLWNsYXNzPVwie1xcJ2FuZ3Vjb21wbGV0ZS1pbnB1dC1ub3QtZW1wdHlcXCc6IG5vdEVtcHR5fVwiIG5nLW1vZGVsPVwic2VhcmNoU3RyXCIgbmctZGlzYWJsZWQ9XCJkaXNhYmxlSW5wdXRcIiB0eXBlPVwie3tpbnB1dFR5cGV9fVwiIHBsYWNlaG9sZGVyPVwie3twbGFjZWhvbGRlcn19XCIgbWF4bGVuZ3RoPVwie3ttYXhsZW5ndGh9fVwiIG5nLWZvY3VzPVwib25Gb2N1c0hhbmRsZXIoKVwiIGNsYXNzPVwie3tpbnB1dENsYXNzfX1cIiBuZy1mb2N1cz1cInJlc2V0SGlkZVJlc3VsdHMoKVwiIG5nLWJsdXI9XCJoaWRlUmVzdWx0cygkZXZlbnQpXCIgYXV0b2NhcGl0YWxpemU9XCJvZmZcIiBhdXRvY29ycmVjdD1cIm9mZlwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiIG5nLWNoYW5nZT1cImlucHV0Q2hhbmdlSGFuZGxlcihzZWFyY2hTdHIpXCIvPicgK1xuICAgICcgIDxkaXYgaWQ9XCJ7e2lkfX1fZHJvcGRvd25cIiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1kcm9wZG93blwiIG5nLXNob3c9XCJzaG93RHJvcGRvd25cIj4nICtcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJhbmd1Y29tcGxldGUtc2VhcmNoaW5nXCIgbmctc2hvdz1cInNlYXJjaGluZ1wiIG5nLWJpbmQ9XCJ0ZXh0U2VhcmNoaW5nXCI+PC9kaXY+JyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYW5ndWNvbXBsZXRlLXNlYXJjaGluZ1wiIG5nLXNob3c9XCIhc2VhcmNoaW5nICYmICghcmVzdWx0cyB8fCByZXN1bHRzLmxlbmd0aCA9PSAwKVwiIG5nLWJpbmQ9XCJ0ZXh0Tm9SZXN1bHRzXCI+PC9kaXY+JyArXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYW5ndWNvbXBsZXRlLXJvd1wiIG5nLXJlcGVhdD1cInJlc3VsdCBpbiByZXN1bHRzXCIgbmctY2xpY2s9XCJzZWxlY3RSZXN1bHQocmVzdWx0KVwiIG5nLW1vdXNlZW50ZXI9XCJob3ZlclJvdygkaW5kZXgpXCIgbmctY2xhc3M9XCJ7XFwnYW5ndWNvbXBsZXRlLXNlbGVjdGVkLXJvd1xcJzogJGluZGV4ID09IGN1cnJlbnRJbmRleH1cIj4nICtcbiAgICAnICAgICAgPGRpdiBuZy1pZj1cImltYWdlRmllbGRcIiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1pbWFnZS1ob2xkZXJcIj4nICtcbiAgICAnICAgICAgICA8aW1nIG5nLWlmPVwicmVzdWx0LmltYWdlICYmIHJlc3VsdC5pbWFnZSAhPSBcXCdcXCdcIiBuZy1zcmM9XCJ7e3Jlc3VsdC5pbWFnZX19XCIgY2xhc3M9XCJhbmd1Y29tcGxldGUtaW1hZ2VcIi8+JyArXG4gICAgJyAgICAgICAgPGRpdiBuZy1pZj1cIiFyZXN1bHQuaW1hZ2UgJiYgcmVzdWx0LmltYWdlICE9IFxcJ1xcJ1wiIGNsYXNzPVwiYW5ndWNvbXBsZXRlLWltYWdlLWRlZmF1bHRcIj48L2Rpdj4nICtcbiAgICAnICAgICAgPC9kaXY+JyArXG4gICAgJyAgICAgIDxkaXYgY2xhc3M9XCJhbmd1Y29tcGxldGUtdGl0bGVcIiBuZy1pZj1cIm1hdGNoQ2xhc3NcIiBuZy1iaW5kLWh0bWw9XCJyZXN1bHQudGl0bGVcIj48L2Rpdj4nICtcbiAgICAnICAgICAgPGRpdiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS10aXRsZVwiIG5nLWlmPVwiIW1hdGNoQ2xhc3NcIj57eyByZXN1bHQudGl0bGUgfX08L2Rpdj4nICtcbiAgICAnICAgICAgPGRpdiBuZy1pZj1cIm1hdGNoQ2xhc3MgJiYgcmVzdWx0LmRlc2NyaXB0aW9uICYmIHJlc3VsdC5kZXNjcmlwdGlvbiAhPSBcXCdcXCdcIiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1kZXNjcmlwdGlvblwiIG5nLWJpbmQtaHRtbD1cInJlc3VsdC5kZXNjcmlwdGlvblwiPjwvZGl2PicgK1xuICAgICcgICAgICA8ZGl2IG5nLWlmPVwiIW1hdGNoQ2xhc3MgJiYgcmVzdWx0LmRlc2NyaXB0aW9uICYmIHJlc3VsdC5kZXNjcmlwdGlvbiAhPSBcXCdcXCdcIiBjbGFzcz1cImFuZ3Vjb21wbGV0ZS1kZXNjcmlwdGlvblwiPnt7cmVzdWx0LmRlc2NyaXB0aW9ufX08L2Rpdj4nICtcbiAgICAnICAgIDwvZGl2PicgK1xuICAgICcgIDwvZGl2PicgK1xuICAgICc8L2Rpdj4nXG4gICk7XG5cbiAgZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbSwgYXR0cnMsIGN0cmwpIHtcbiAgICB2YXIgaW5wdXRGaWVsZCA9IGVsZW0uZmluZCgnaW5wdXQnKTtcbiAgICB2YXIgbWlubGVuZ3RoID0gTUlOX0xFTkdUSDtcbiAgICB2YXIgc2VhcmNoVGltZXIgPSBudWxsO1xuICAgIHZhciBoaWRlVGltZXI7XG4gICAgdmFyIHJlcXVpcmVkQ2xhc3NOYW1lID0gUkVRVUlSRURfQ0xBU1M7XG4gICAgdmFyIHJlc3BvbnNlRm9ybWF0dGVyO1xuICAgIHZhciB2YWxpZFN0YXRlID0gbnVsbDtcbiAgICB2YXIgaHR0cENhbmNlbGxlciA9IG51bGw7XG4gICAgdmFyIGRkID0gZWxlbVswXS5xdWVyeVNlbGVjdG9yKCcuYW5ndWNvbXBsZXRlLWRyb3Bkb3duJyk7XG4gICAgdmFyIGlzU2Nyb2xsT24gPSBmYWxzZTtcbiAgICB2YXIgbW91c2Vkb3duT24gPSBudWxsO1xuICAgIHZhciB1bmJpbmRJbml0aWFsVmFsdWU7XG4gICAgdmFyIGRpc3BsYXlTZWFyY2hpbmc7XG4gICAgdmFyIGRpc3BsYXlOb1Jlc3VsdHM7XG5cbiAgICBlbGVtLm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC50YXJnZXQuaWQpIHtcbiAgICAgICAgbW91c2Vkb3duT24gPSBldmVudC50YXJnZXQuaWQ7XG4gICAgICAgIGlmIChtb3VzZWRvd25PbiA9PT0gc2NvcGUuaWQgKyAnX2Ryb3Bkb3duJykge1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGlja291dEhhbmRsZXJGb3JEcm9wZG93bik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBtb3VzZWRvd25PbiA9IGV2ZW50LnRhcmdldC5jbGFzc05hbWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzY29wZS5jdXJyZW50SW5kZXggPSBzY29wZS5mb2N1c0ZpcnN0ID8gMCA6IG51bGw7XG4gICAgc2NvcGUuc2VhcmNoaW5nID0gZmFsc2U7XG4gICAgdW5iaW5kSW5pdGlhbFZhbHVlID0gc2NvcGUuJHdhdGNoKCdpbml0aWFsVmFsdWUnLCBmdW5jdGlvbiAobmV3dmFsKSB7XG4gICAgICBpZiAobmV3dmFsKSB7XG4gICAgICAgIC8vIHJlbW92ZSBzY29wZSBsaXN0ZW5lclxuICAgICAgICB1bmJpbmRJbml0aWFsVmFsdWUoKTtcbiAgICAgICAgLy8gY2hhbmdlIGlucHV0XG4gICAgICAgIGhhbmRsZUlucHV0Q2hhbmdlKG5ld3ZhbCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzY29wZS4kd2F0Y2goJ2ZpZWxkUmVxdWlyZWQnLCBmdW5jdGlvbiAobmV3dmFsLCBvbGR2YWwpIHtcbiAgICAgIGlmIChuZXd2YWwgIT09IG9sZHZhbCkge1xuICAgICAgICBpZiAoIW5ld3ZhbCkge1xuICAgICAgICAgIGN0cmxbc2NvcGUuaW5wdXROYW1lXS4kc2V0VmFsaWRpdHkocmVxdWlyZWRDbGFzc05hbWUsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCF2YWxpZFN0YXRlIHx8IHNjb3BlLmN1cnJlbnRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICBoYW5kbGVSZXF1aXJlZChmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaGFuZGxlUmVxdWlyZWQodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNjb3BlLiRvbignYW5ndWNvbXBsZXRlLWFsdDpjbGVhcklucHV0JywgZnVuY3Rpb24gKGV2ZW50LCBlbGVtZW50SWQpIHtcbiAgICAgIGlmICghZWxlbWVudElkIHx8IGVsZW1lbnRJZCA9PT0gc2NvcGUuaWQpIHtcbiAgICAgICAgc2NvcGUuc2VhcmNoU3RyID0gbnVsbDtcbiAgICAgICAgY2FsbE9yQXNzaWduKCk7XG4gICAgICAgIGhhbmRsZVJlcXVpcmVkKGZhbHNlKTtcbiAgICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzY29wZS4kb24oJ2FuZ3Vjb21wbGV0ZS1hbHQ6Y2hhbmdlSW5wdXQnLCBmdW5jdGlvbiAoZXZlbnQsIGVsZW1lbnRJZCwgbmV3dmFsKSB7XG4gICAgICBpZiAoISFlbGVtZW50SWQgJiYgZWxlbWVudElkID09PSBzY29wZS5pZCkge1xuICAgICAgICBoYW5kbGVJbnB1dENoYW5nZShuZXd2YWwpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gaGFuZGxlSW5wdXRDaGFuZ2UobmV3dmFsLCBpbml0aWFsKSB7XG4gICAgICBpZiAobmV3dmFsKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbmV3dmFsID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IGV4dHJhY3RUaXRsZShuZXd2YWwpO1xuICAgICAgICAgIGNhbGxPckFzc2lnbih7b3JpZ2luYWxPYmplY3Q6IG5ld3ZhbH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBuZXd2YWwgPT09ICdzdHJpbmcnICYmIG5ld3ZhbC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgc2NvcGUuc2VhcmNoU3RyID0gbmV3dmFsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUuZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RyaWVkIHRvIHNldCAnICsgKCEhaW5pdGlhbCA/ICdpbml0aWFsJyA6ICcnKSArICcgdmFsdWUgb2YgYW5ndWNvbXBsZXRlIHRvJywgbmV3dmFsLCAnd2hpY2ggaXMgYW4gaW52YWxpZCB2YWx1ZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGhhbmRsZVJlcXVpcmVkKHRydWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vICMxOTQgZHJvcGRvd24gbGlzdCBub3QgY29uc2lzdGVudCBpbiBjb2xsYXBzaW5nIChidWcpLlxuICAgIGZ1bmN0aW9uIGNsaWNrb3V0SGFuZGxlckZvckRyb3Bkb3duKGV2ZW50KSB7XG4gICAgICBtb3VzZWRvd25PbiA9IG51bGw7XG4gICAgICBzY29wZS5oaWRlUmVzdWx0cyhldmVudCk7XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xpY2tvdXRIYW5kbGVyRm9yRHJvcGRvd24pO1xuICAgIH1cblxuICAgIC8vIGZvciBJRTggcXVpcmtpbmVzcyBhYm91dCBldmVudC53aGljaFxuICAgIGZ1bmN0aW9uIGllOEV2ZW50Tm9ybWFsaXplcihldmVudCkge1xuICAgICAgcmV0dXJuIGV2ZW50LndoaWNoID8gZXZlbnQud2hpY2ggOiBldmVudC5rZXlDb2RlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGxPckFzc2lnbih2YWx1ZSkge1xuICAgICAgaWYgKHR5cGVvZiBzY29wZS5zZWxlY3RlZE9iamVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzY29wZS5zZWxlY3RlZE9iamVjdCh2YWx1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2NvcGUuc2VsZWN0ZWRPYmplY3QgPSB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIGhhbmRsZVJlcXVpcmVkKHRydWUpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGhhbmRsZVJlcXVpcmVkKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxsRnVuY3Rpb25PcklkZW50aXR5KGZuKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHNjb3BlW2ZuXSA/IHNjb3BlW2ZuXShkYXRhKSA6IGRhdGE7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldElucHV0U3RyaW5nKHN0cikge1xuICAgICAgY2FsbE9yQXNzaWduKHtvcmlnaW5hbE9iamVjdDogc3RyfSk7XG5cbiAgICAgIGlmIChzY29wZS5jbGVhclNlbGVjdGVkKSB7XG4gICAgICAgIHNjb3BlLnNlYXJjaFN0ciA9IG51bGw7XG4gICAgICB9XG4gICAgICBjbGVhclJlc3VsdHMoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHRyYWN0VGl0bGUoZGF0YSkge1xuICAgICAgLy8gc3BsaXQgdGl0bGUgZmllbGRzIGFuZCBydW4gZXh0cmFjdFZhbHVlIGZvciBlYWNoIGFuZCBqb2luIHdpdGggJyAnXG4gICAgICByZXR1cm4gc2NvcGUudGl0bGVGaWVsZC5zcGxpdCgnLCcpXG4gICAgICAgIC5tYXAoZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgICAgcmV0dXJuIGV4dHJhY3RWYWx1ZShkYXRhLCBmaWVsZCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5qb2luKCcgJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXh0cmFjdFZhbHVlKG9iaiwga2V5KSB7XG4gICAgICB2YXIga2V5cywgcmVzdWx0O1xuICAgICAgaWYgKGtleSkge1xuICAgICAgICBrZXlzID0ga2V5LnNwbGl0KCcuJyk7XG4gICAgICAgIHJlc3VsdCA9IG9iajtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgcmVzdWx0ID0gcmVzdWx0W2tleXNbaV1dO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gb2JqO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaW5kTWF0Y2hTdHJpbmcodGFyZ2V0LCBzdHIpIHtcbiAgICAgIHZhciByZXN1bHQsIG1hdGNoZXMsIHJlO1xuICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9HdWlkZS9SZWd1bGFyX0V4cHJlc3Npb25zXG4gICAgICAvLyBFc2NhcGUgdXNlciBpbnB1dCB0byBiZSB0cmVhdGVkIGFzIGEgbGl0ZXJhbCBzdHJpbmcgd2l0aGluIGEgcmVndWxhciBleHByZXNzaW9uXG4gICAgICByZSA9IG5ldyBSZWdFeHAoc3RyLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyksICdpJyk7XG4gICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIXRhcmdldC5tYXRjaCB8fCAhdGFyZ2V0LnJlcGxhY2UpIHtcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnRvU3RyaW5nKCk7XG4gICAgICB9XG4gICAgICBtYXRjaGVzID0gdGFyZ2V0Lm1hdGNoKHJlKTtcbiAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgIHJlc3VsdCA9IHRhcmdldC5yZXBsYWNlKHJlLFxuICAgICAgICAgICc8c3BhbiBjbGFzcz1cIicgKyBzY29wZS5tYXRjaENsYXNzICsgJ1wiPicgKyBtYXRjaGVzWzBdICsgJzwvc3Bhbj4nKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXN1bHQgPSB0YXJnZXQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbChyZXN1bHQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZVJlcXVpcmVkKHZhbGlkKSB7XG4gICAgICBzY29wZS5ub3RFbXB0eSA9IHZhbGlkO1xuICAgICAgdmFsaWRTdGF0ZSA9IHNjb3BlLnNlYXJjaFN0cjtcbiAgICAgIGlmIChzY29wZS5maWVsZFJlcXVpcmVkICYmIGN0cmwgJiYgc2NvcGUuaW5wdXROYW1lKSB7XG4gICAgICAgIGN0cmxbc2NvcGUuaW5wdXROYW1lXS4kc2V0VmFsaWRpdHkocmVxdWlyZWRDbGFzc05hbWUsIHZhbGlkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBrZXl1cEhhbmRsZXIoZXZlbnQpIHtcbiAgICAgIHZhciB3aGljaCA9IGllOEV2ZW50Tm9ybWFsaXplcihldmVudCk7XG4gICAgICBpZiAod2hpY2ggPT09IEtFWV9MRiB8fCB3aGljaCA9PT0gS0VZX1JUKSB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAod2hpY2ggPT09IEtFWV9VUCB8fCB3aGljaCA9PT0gS0VZX0VOKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICh3aGljaCA9PT0gS0VZX0RXKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICghc2NvcGUuc2hvd0Ryb3Bkb3duICYmIHNjb3BlLnNlYXJjaFN0ciAmJiBzY29wZS5zZWFyY2hTdHIubGVuZ3RoID49IG1pbmxlbmd0aCkge1xuICAgICAgICAgIGluaXRSZXN1bHRzKCk7XG4gICAgICAgICAgc2NvcGUuc2VhcmNoaW5nID0gdHJ1ZTtcbiAgICAgICAgICBzZWFyY2hUaW1lckNvbXBsZXRlKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHdoaWNoID09PSBLRVlfRVMpIHtcbiAgICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaW5wdXRGaWVsZC52YWwoc2NvcGUuc2VhcmNoU3RyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKG1pbmxlbmd0aCA9PT0gMCAmJiAhc2NvcGUuc2VhcmNoU3RyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzY29wZS5zZWFyY2hTdHIgfHwgc2NvcGUuc2VhcmNoU3RyID09PSAnJykge1xuICAgICAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHNjb3BlLnNlYXJjaFN0ci5sZW5ndGggPj0gbWlubGVuZ3RoKSB7XG4gICAgICAgICAgaW5pdFJlc3VsdHMoKTtcblxuICAgICAgICAgIGlmIChzZWFyY2hUaW1lcikge1xuICAgICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHNlYXJjaFRpbWVyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzY29wZS5zZWFyY2hpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgc2VhcmNoVGltZXIgPSAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWFyY2hUaW1lckNvbXBsZXRlKHNjb3BlLnNlYXJjaFN0cik7XG4gICAgICAgICAgfSwgc2NvcGUucGF1c2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbGlkU3RhdGUgJiYgdmFsaWRTdGF0ZSAhPT0gc2NvcGUuc2VhcmNoU3RyICYmICFzY29wZS5jbGVhclNlbGVjdGVkKSB7XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbGxPckFzc2lnbigpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlT3ZlcnJpZGVTdWdnZXN0aW9ucyhldmVudCkge1xuICAgICAgaWYgKHNjb3BlLm92ZXJyaWRlU3VnZ2VzdGlvbnMgJiYgIShzY29wZS5zZWxlY3RlZE9iamVjdCAmJiBzY29wZS5zZWxlY3RlZE9iamVjdC5vcmlnaW5hbE9iamVjdCA9PT0gc2NvcGUuc2VhcmNoU3RyKSkge1xuICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2FuY2VsIHNlYXJjaCB0aW1lclxuICAgICAgICAkdGltZW91dC5jYW5jZWwoc2VhcmNoVGltZXIpO1xuICAgICAgICAvLyBjYW5jZWwgaHR0cCByZXF1ZXN0XG4gICAgICAgIGNhbmNlbEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgc2V0SW5wdXRTdHJpbmcoc2NvcGUuc2VhcmNoU3RyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcm9wZG93blJvd09mZnNldEhlaWdodChyb3cpIHtcbiAgICAgIHZhciBjc3MgPSBnZXRDb21wdXRlZFN0eWxlKHJvdyk7XG4gICAgICByZXR1cm4gcm93Lm9mZnNldEhlaWdodCArXG4gICAgICAgIHBhcnNlSW50KGNzcy5tYXJnaW5Ub3AsIDEwKSArIHBhcnNlSW50KGNzcy5tYXJnaW5Cb3R0b20sIDEwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcm9wZG93bkhlaWdodCgpIHtcbiAgICAgIHJldHVybiBkZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgK1xuICAgICAgICBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKGRkKS5tYXhIZWlnaHQsIDEwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcm9wZG93blJvdygpIHtcbiAgICAgIHJldHVybiBlbGVtWzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5hbmd1Y29tcGxldGUtcm93Jylbc2NvcGUuY3VycmVudEluZGV4XTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcm9wZG93blJvd1RvcCgpIHtcbiAgICAgIHJldHVybiBkcm9wZG93blJvdygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCAtXG4gICAgICAgIChkZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgK1xuICAgICAgICBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKGRkKS5wYWRkaW5nVG9wLCAxMCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyb3Bkb3duU2Nyb2xsVG9wVG8ob2Zmc2V0KSB7XG4gICAgICBkZC5zY3JvbGxUb3AgPSBkZC5zY3JvbGxUb3AgKyBvZmZzZXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlSW5wdXRGaWVsZCgpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gc2NvcGUucmVzdWx0c1tzY29wZS5jdXJyZW50SW5kZXhdO1xuICAgICAgaWYgKHNjb3BlLm1hdGNoQ2xhc3MpIHtcbiAgICAgICAgaW5wdXRGaWVsZC52YWwoZXh0cmFjdFRpdGxlKGN1cnJlbnQub3JpZ2luYWxPYmplY3QpKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpbnB1dEZpZWxkLnZhbChjdXJyZW50LnRpdGxlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBrZXlkb3duSGFuZGxlcihldmVudCkge1xuICAgICAgdmFyIHdoaWNoID0gaWU4RXZlbnROb3JtYWxpemVyKGV2ZW50KTtcbiAgICAgIHZhciByb3cgPSBudWxsO1xuICAgICAgdmFyIHJvd1RvcCA9IG51bGw7XG5cbiAgICAgIGlmICh3aGljaCA9PT0gS0VZX0VOICYmIHNjb3BlLnJlc3VsdHMpIHtcbiAgICAgICAgaWYgKHNjb3BlLmN1cnJlbnRJbmRleCA+PSAwICYmIHNjb3BlLmN1cnJlbnRJbmRleCA8IHNjb3BlLnJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBzY29wZS5zZWxlY3RSZXN1bHQoc2NvcGUucmVzdWx0c1tzY29wZS5jdXJyZW50SW5kZXhdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBoYW5kbGVPdmVycmlkZVN1Z2dlc3Rpb25zKGV2ZW50KTtcbiAgICAgICAgICBjbGVhclJlc3VsdHMoKTtcbiAgICAgICAgfVxuICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgIH0gZWxzZSBpZiAod2hpY2ggPT09IEtFWV9EVyAmJiBzY29wZS5yZXN1bHRzKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICgoc2NvcGUuY3VycmVudEluZGV4ICsgMSkgPCBzY29wZS5yZXN1bHRzLmxlbmd0aCAmJiBzY29wZS5zaG93RHJvcGRvd24pIHtcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2NvcGUuY3VycmVudEluZGV4Kys7XG4gICAgICAgICAgICB1cGRhdGVJbnB1dEZpZWxkKCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAoaXNTY3JvbGxPbikge1xuICAgICAgICAgICAgcm93ID0gZHJvcGRvd25Sb3coKTtcbiAgICAgICAgICAgIGlmIChkcm9wZG93bkhlaWdodCgpIDwgcm93LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbSkge1xuICAgICAgICAgICAgICBkcm9wZG93blNjcm9sbFRvcFRvKGRyb3Bkb3duUm93T2Zmc2V0SGVpZ2h0KHJvdykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh3aGljaCA9PT0gS0VZX1VQICYmIHNjb3BlLnJlc3VsdHMpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHNjb3BlLmN1cnJlbnRJbmRleCA+PSAxKSB7XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleC0tO1xuICAgICAgICAgICAgdXBkYXRlSW5wdXRGaWVsZCgpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKGlzU2Nyb2xsT24pIHtcbiAgICAgICAgICAgIHJvd1RvcCA9IGRyb3Bkb3duUm93VG9wKCk7XG4gICAgICAgICAgICBpZiAocm93VG9wIDwgMCkge1xuICAgICAgICAgICAgICBkcm9wZG93blNjcm9sbFRvcFRvKHJvd1RvcCAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzY29wZS5jdXJyZW50SW5kZXggPT09IDApIHtcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gLTE7XG4gICAgICAgICAgICBpbnB1dEZpZWxkLnZhbChzY29wZS5zZWFyY2hTdHIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHdoaWNoID09PSBLRVlfVEFCKSB7XG4gICAgICAgIGlmIChzY29wZS5yZXN1bHRzICYmIHNjb3BlLnJlc3VsdHMubGVuZ3RoID4gMCAmJiBzY29wZS5zaG93RHJvcGRvd24pIHtcbiAgICAgICAgICBpZiAoc2NvcGUuY3VycmVudEluZGV4ID09PSAtMSAmJiBzY29wZS5vdmVycmlkZVN1Z2dlc3Rpb25zKSB7XG4gICAgICAgICAgICAvLyBpbnRlbnRpb25hbGx5IG5vdCBzZW5kaW5nIGV2ZW50IHNvIHRoYXQgaXQgZG9lcyBub3RcbiAgICAgICAgICAgIC8vIHByZXZlbnQgZGVmYXVsdCB0YWIgYmVoYXZpb3JcbiAgICAgICAgICAgIGhhbmRsZU92ZXJyaWRlU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoc2NvcGUuY3VycmVudEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2NvcGUuc2VsZWN0UmVzdWx0KHNjb3BlLnJlc3VsdHNbc2NvcGUuY3VycmVudEluZGV4XSk7XG4gICAgICAgICAgICBzY29wZS4kZGlnZXN0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIG5vIHJlc3VsdHNcbiAgICAgICAgICAvLyBpbnRlbnRpb25hbGx5IG5vdCBzZW5kaW5nIGV2ZW50IHNvIHRoYXQgaXQgZG9lcyBub3RcbiAgICAgICAgICAvLyBwcmV2ZW50IGRlZmF1bHQgdGFiIGJlaGF2aW9yXG4gICAgICAgICAgaWYgKHNjb3BlLnNlYXJjaFN0ciAmJiBzY29wZS5zZWFyY2hTdHIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaGFuZGxlT3ZlcnJpZGVTdWdnZXN0aW9ucygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh3aGljaCA9PT0gS0VZX0VTKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgdmVyeSBzcGVjaWZpYyB0byBJRTEwLzExICMyNzJcbiAgICAgICAgLy8gd2l0aG91dCB0aGlzLCBJRSBjbGVhcnMgdGhlIGlucHV0IHRleHRcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBodHRwU3VjY2Vzc0NhbGxiYWNrR2VuKHN0cikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChyZXNwb25zZURhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgIC8vIG5vcm1hbGl6ZSByZXR1cm4gb2JlamN0IGZyb20gcHJvbWlzZVxuICAgICAgICBpZiAoIXN0YXR1cyAmJiAhaGVhZGVycyAmJiAhY29uZmlnICYmIHJlc3BvbnNlRGF0YS5kYXRhKSB7XG4gICAgICAgICAgcmVzcG9uc2VEYXRhID0gcmVzcG9uc2VEYXRhLmRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGUuc2VhcmNoaW5nID0gZmFsc2U7XG4gICAgICAgIHByb2Nlc3NSZXN1bHRzKFxuICAgICAgICAgIGV4dHJhY3RWYWx1ZShyZXNwb25zZUZvcm1hdHRlcihyZXNwb25zZURhdGEpLCBzY29wZS5yZW1vdGVVcmxEYXRhRmllbGQpLFxuICAgICAgICAgIHN0cik7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGh0dHBFcnJvckNhbGxiYWNrKGVycm9yUmVzLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgLy8gY2FuY2VsbGVkL2Fib3J0ZWRcbiAgICAgIGlmIChzdGF0dXMgPT09IDAgfHwgc3RhdHVzID09PSAtMSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIG5vcm1hbGl6ZSByZXR1cm4gb2JlamN0IGZyb20gcHJvbWlzZVxuICAgICAgaWYgKCFzdGF0dXMgJiYgIWhlYWRlcnMgJiYgIWNvbmZpZykge1xuICAgICAgICBzdGF0dXMgPSBlcnJvclJlcy5zdGF0dXM7XG4gICAgICB9XG4gICAgICBpZiAoc2NvcGUucmVtb3RlVXJsRXJyb3JDYWxsYmFjaykge1xuICAgICAgICBzY29wZS5yZW1vdGVVcmxFcnJvckNhbGxiYWNrKGVycm9yUmVzLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5lcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2h0dHAgZXJyb3InKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbmNlbEh0dHBSZXF1ZXN0KCkge1xuICAgICAgaWYgKGh0dHBDYW5jZWxsZXIpIHtcbiAgICAgICAgaHR0cENhbmNlbGxlci5yZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UmVtb3RlUmVzdWx0cyhzdHIpIHtcbiAgICAgIHZhciBwYXJhbXMgPSB7fSxcbiAgICAgICAgdXJsID0gc2NvcGUucmVtb3RlVXJsICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cik7XG4gICAgICBpZiAoc2NvcGUucmVtb3RlVXJsUmVxdWVzdEZvcm1hdHRlcikge1xuICAgICAgICBwYXJhbXMgPSB7cGFyYW1zOiBzY29wZS5yZW1vdGVVcmxSZXF1ZXN0Rm9ybWF0dGVyKHN0cil9O1xuICAgICAgICB1cmwgPSBzY29wZS5yZW1vdGVVcmw7XG4gICAgICB9XG4gICAgICBpZiAoISFzY29wZS5yZW1vdGVVcmxSZXF1ZXN0V2l0aENyZWRlbnRpYWxzKSB7XG4gICAgICAgIHBhcmFtcy53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgY2FuY2VsSHR0cFJlcXVlc3QoKTtcbiAgICAgIGh0dHBDYW5jZWxsZXIgPSAkcS5kZWZlcigpO1xuICAgICAgcGFyYW1zLnRpbWVvdXQgPSBodHRwQ2FuY2VsbGVyLnByb21pc2U7XG4gICAgICAkaHR0cC5nZXQodXJsLCBwYXJhbXMpXG4gICAgICAgIC5zdWNjZXNzKGh0dHBTdWNjZXNzQ2FsbGJhY2tHZW4oc3RyKSlcbiAgICAgICAgLmVycm9yKGh0dHBFcnJvckNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRSZW1vdGVSZXN1bHRzV2l0aEN1c3RvbUhhbmRsZXIoc3RyKSB7XG4gICAgICBjYW5jZWxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICBodHRwQ2FuY2VsbGVyID0gJHEuZGVmZXIoKTtcblxuICAgICAgc2NvcGUucmVtb3RlQXBpSGFuZGxlcihzdHIsIGh0dHBDYW5jZWxsZXIucHJvbWlzZSlcbiAgICAgICAgLnRoZW4oaHR0cFN1Y2Nlc3NDYWxsYmFja0dlbihzdHIpKVxuICAgICAgICAuY2F0Y2goaHR0cEVycm9yQ2FsbGJhY2spO1xuXG4gICAgICAvKiBJRTggY29tcGF0aWJsZVxuICAgICAgIHNjb3BlLnJlbW90ZUFwaUhhbmRsZXIoc3RyLCBodHRwQ2FuY2VsbGVyLnByb21pc2UpXG4gICAgICAgWyd0aGVuJ10oaHR0cFN1Y2Nlc3NDYWxsYmFja0dlbihzdHIpKVxuICAgICAgIFsnY2F0Y2gnXShodHRwRXJyb3JDYWxsYmFjayk7XG4gICAgICAgKi9cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGVhclJlc3VsdHMoKSB7XG4gICAgICBzY29wZS5zaG93RHJvcGRvd24gPSBmYWxzZTtcbiAgICAgIHNjb3BlLnJlc3VsdHMgPSBbXTtcbiAgICAgIGlmIChkZCkge1xuICAgICAgICBkZC5zY3JvbGxUb3AgPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRSZXN1bHRzKCkge1xuICAgICAgc2NvcGUuc2hvd0Ryb3Bkb3duID0gZGlzcGxheVNlYXJjaGluZztcbiAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IHNjb3BlLmZvY3VzRmlyc3QgPyAwIDogLTE7XG4gICAgICBzY29wZS5yZXN1bHRzID0gW107XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0TG9jYWxSZXN1bHRzKHN0cikge1xuICAgICAgdmFyIGksIG1hdGNoLCBzLCB2YWx1ZSxcbiAgICAgICAgc2VhcmNoRmllbGRzID0gc2NvcGUuc2VhcmNoRmllbGRzLnNwbGl0KCcsJyksXG4gICAgICAgIG1hdGNoZXMgPSBbXTtcbiAgICAgIGlmICh0eXBlb2Ygc2NvcGUucGFyc2VJbnB1dCgpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBzdHIgPSBzY29wZS5wYXJzZUlucHV0KCkoc3RyKTtcbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBzY29wZS5sb2NhbERhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbWF0Y2ggPSBmYWxzZTtcblxuICAgICAgICBmb3IgKHMgPSAwOyBzIDwgc2VhcmNoRmllbGRzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgdmFsdWUgPSBleHRyYWN0VmFsdWUoc2NvcGUubG9jYWxEYXRhW2ldLCBzZWFyY2hGaWVsZHNbc10pIHx8ICcnO1xuICAgICAgICAgIG1hdGNoID0gbWF0Y2ggfHwgKHZhbHVlLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHN0ci50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpID49IDApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgbWF0Y2hlc1ttYXRjaGVzLmxlbmd0aF0gPSBzY29wZS5sb2NhbERhdGFbaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXRjaGVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrRXhhY3RNYXRjaChyZXN1bHQsIG9iaiwgc3RyKSB7XG4gICAgICBpZiAoIXN0cikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChvYmpba2V5XS50b0xvd2VyQ2FzZSgpID09PSBzdHIudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgIHNjb3BlLnNlbGVjdFJlc3VsdChyZXN1bHQpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2VhcmNoVGltZXJDb21wbGV0ZShzdHIpIHtcbiAgICAgIC8vIEJlZ2luIHRoZSBzZWFyY2hcbiAgICAgIGlmICghc3RyIHx8IHN0ci5sZW5ndGggPCBtaW5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHNjb3BlLmxvY2FsRGF0YSkge1xuICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciBtYXRjaGVzO1xuICAgICAgICAgIGlmICh0eXBlb2Ygc2NvcGUubG9jYWxTZWFyY2goKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIG1hdGNoZXMgPSBzY29wZS5sb2NhbFNlYXJjaCgpKHN0cik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1hdGNoZXMgPSBnZXRMb2NhbFJlc3VsdHMoc3RyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2NvcGUuc2VhcmNoaW5nID0gZmFsc2U7XG4gICAgICAgICAgcHJvY2Vzc1Jlc3VsdHMobWF0Y2hlcywgc3RyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChzY29wZS5yZW1vdGVBcGlIYW5kbGVyKSB7XG4gICAgICAgIGdldFJlbW90ZVJlc3VsdHNXaXRoQ3VzdG9tSGFuZGxlcihzdHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2V0UmVtb3RlUmVzdWx0cyhzdHIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByb2Nlc3NSZXN1bHRzKHJlc3BvbnNlRGF0YSwgc3RyKSB7XG4gICAgICB2YXIgaSwgZGVzY3JpcHRpb24sIGltYWdlLCB0ZXh0LCBmb3JtYXR0ZWRUZXh0LCBmb3JtYXR0ZWREZXNjO1xuXG4gICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNjb3BlLnJlc3VsdHMgPSBbXTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcmVzcG9uc2VEYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHNjb3BlLnRpdGxlRmllbGQgJiYgc2NvcGUudGl0bGVGaWVsZCAhPT0gJycpIHtcbiAgICAgICAgICAgIHRleHQgPSBmb3JtYXR0ZWRUZXh0ID0gZXh0cmFjdFRpdGxlKHJlc3BvbnNlRGF0YVtpXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGVzY3JpcHRpb24gPSAnJztcbiAgICAgICAgICBpZiAoc2NvcGUuZGVzY3JpcHRpb25GaWVsZCkge1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBmb3JtYXR0ZWREZXNjID0gZXh0cmFjdFZhbHVlKHJlc3BvbnNlRGF0YVtpXSwgc2NvcGUuZGVzY3JpcHRpb25GaWVsZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaW1hZ2UgPSAnJztcbiAgICAgICAgICBpZiAoc2NvcGUuaW1hZ2VGaWVsZCkge1xuICAgICAgICAgICAgaW1hZ2UgPSBleHRyYWN0VmFsdWUocmVzcG9uc2VEYXRhW2ldLCBzY29wZS5pbWFnZUZpZWxkKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2NvcGUubWF0Y2hDbGFzcykge1xuICAgICAgICAgICAgZm9ybWF0dGVkVGV4dCA9IGZpbmRNYXRjaFN0cmluZyh0ZXh0LCBzdHIpO1xuICAgICAgICAgICAgZm9ybWF0dGVkRGVzYyA9IGZpbmRNYXRjaFN0cmluZyhkZXNjcmlwdGlvbiwgc3RyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzY29wZS5yZXN1bHRzW3Njb3BlLnJlc3VsdHMubGVuZ3RoXSA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBmb3JtYXR0ZWRUZXh0LFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGZvcm1hdHRlZERlc2MsXG4gICAgICAgICAgICBpbWFnZTogaW1hZ2UsXG4gICAgICAgICAgICBvcmlnaW5hbE9iamVjdDogcmVzcG9uc2VEYXRhW2ldXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY29wZS5yZXN1bHRzID0gW107XG4gICAgICB9XG5cbiAgICAgIGlmIChzY29wZS5hdXRvTWF0Y2ggJiYgc2NvcGUucmVzdWx0cy5sZW5ndGggPT09IDEgJiZcbiAgICAgICAgY2hlY2tFeGFjdE1hdGNoKHNjb3BlLnJlc3VsdHNbMF0sXG4gICAgICAgICAge3RpdGxlOiB0ZXh0LCBkZXNjOiBkZXNjcmlwdGlvbiB8fCAnJ30sIHNjb3BlLnNlYXJjaFN0cikpIHtcbiAgICAgICAgc2NvcGUuc2hvd0Ryb3Bkb3duID0gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKHNjb3BlLnJlc3VsdHMubGVuZ3RoID09PSAwICYmICFkaXNwbGF5Tm9SZXN1bHRzKSB7XG4gICAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NvcGUuc2hvd0Ryb3Bkb3duID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzaG93QWxsKCkge1xuICAgICAgaWYgKHNjb3BlLmxvY2FsRGF0YSkge1xuICAgICAgICBwcm9jZXNzUmVzdWx0cyhzY29wZS5sb2NhbERhdGEsICcnKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHNjb3BlLnJlbW90ZUFwaUhhbmRsZXIpIHtcbiAgICAgICAgZ2V0UmVtb3RlUmVzdWx0c1dpdGhDdXN0b21IYW5kbGVyKCcnKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBnZXRSZW1vdGVSZXN1bHRzKCcnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzY29wZS5vbkZvY3VzSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzY29wZS5mb2N1c0luKSB7XG4gICAgICAgIHNjb3BlLmZvY3VzSW4oKTtcbiAgICAgIH1cbiAgICAgIGlmIChtaW5sZW5ndGggPT09IDAgJiYgKCFzY29wZS5zZWFyY2hTdHIgfHwgc2NvcGUuc2VhcmNoU3RyLmxlbmd0aCA9PT0gMCkpIHtcbiAgICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gc2NvcGUuZm9jdXNGaXJzdCA/IDAgOiBzY29wZS5jdXJyZW50SW5kZXg7XG4gICAgICAgIHNjb3BlLnNob3dEcm9wZG93biA9IHRydWU7XG4gICAgICAgIHNob3dBbGwoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2NvcGUuaGlkZVJlc3VsdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAobW91c2Vkb3duT24gJiZcbiAgICAgICAgKG1vdXNlZG93bk9uID09PSBzY29wZS5pZCArICdfZHJvcGRvd24nIHx8XG4gICAgICAgIG1vdXNlZG93bk9uLmluZGV4T2YoJ2FuZ3Vjb21wbGV0ZScpID49IDApKSB7XG4gICAgICAgIG1vdXNlZG93bk9uID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBoaWRlVGltZXIgPSAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChzY29wZS5zZWFyY2hTdHIgJiYgc2NvcGUuc2VhcmNoU3RyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgaW5wdXRGaWVsZC52YWwoc2NvcGUuc2VhcmNoU3RyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgQkxVUl9USU1FT1VUKTtcbiAgICAgICAgY2FuY2VsSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICBpZiAoc2NvcGUuZm9jdXNPdXQpIHtcbiAgICAgICAgICBzY29wZS5mb2N1c091dCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNjb3BlLm92ZXJyaWRlU3VnZ2VzdGlvbnMpIHtcbiAgICAgICAgICBpZiAoc2NvcGUuc2VhcmNoU3RyICYmIHNjb3BlLnNlYXJjaFN0ci5sZW5ndGggPiAwICYmIHNjb3BlLmN1cnJlbnRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGhhbmRsZU92ZXJyaWRlU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2NvcGUucmVzZXRIaWRlUmVzdWx0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChoaWRlVGltZXIpIHtcbiAgICAgICAgJHRpbWVvdXQuY2FuY2VsKGhpZGVUaW1lcik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNjb3BlLmhvdmVyUm93ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICBzY29wZS5jdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICB9O1xuXG4gICAgc2NvcGUuc2VsZWN0UmVzdWx0ID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgLy8gUmVzdG9yZSBvcmlnaW5hbCB2YWx1ZXNcbiAgICAgIGlmIChzY29wZS5tYXRjaENsYXNzKSB7XG4gICAgICAgIHJlc3VsdC50aXRsZSA9IGV4dHJhY3RUaXRsZShyZXN1bHQub3JpZ2luYWxPYmplY3QpO1xuICAgICAgICByZXN1bHQuZGVzY3JpcHRpb24gPSBleHRyYWN0VmFsdWUocmVzdWx0Lm9yaWdpbmFsT2JqZWN0LCBzY29wZS5kZXNjcmlwdGlvbkZpZWxkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNjb3BlLmNsZWFyU2VsZWN0ZWQpIHtcbiAgICAgICAgc2NvcGUuc2VhcmNoU3RyID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzY29wZS5zZWFyY2hTdHIgPSByZXN1bHQudGl0bGU7XG4gICAgICB9XG4gICAgICBjYWxsT3JBc3NpZ24ocmVzdWx0KTtcbiAgICAgIGNsZWFyUmVzdWx0cygpO1xuICAgIH07XG5cbiAgICBzY29wZS5pbnB1dENoYW5nZUhhbmRsZXIgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICBpZiAoc3RyLmxlbmd0aCA8IG1pbmxlbmd0aCkge1xuICAgICAgICBjYW5jZWxIdHRwUmVxdWVzdCgpO1xuICAgICAgICBjbGVhclJlc3VsdHMoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHN0ci5sZW5ndGggPT09IDAgJiYgbWlubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xuICAgICAgICBzaG93QWxsKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzY29wZS5pbnB1dENoYW5nZWQpIHtcbiAgICAgICAgc3RyID0gc2NvcGUuaW5wdXRDaGFuZ2VkKHN0cik7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH07XG5cbiAgICAvLyBjaGVjayByZXF1aXJlZFxuICAgIGlmIChzY29wZS5maWVsZFJlcXVpcmVkQ2xhc3MgJiYgc2NvcGUuZmllbGRSZXF1aXJlZENsYXNzICE9PSAnJykge1xuICAgICAgcmVxdWlyZWRDbGFzc05hbWUgPSBzY29wZS5maWVsZFJlcXVpcmVkQ2xhc3M7XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgbWluIGxlbmd0aFxuICAgIGlmIChzY29wZS5taW5sZW5ndGggJiYgc2NvcGUubWlubGVuZ3RoICE9PSAnJykge1xuICAgICAgbWlubGVuZ3RoID0gcGFyc2VJbnQoc2NvcGUubWlubGVuZ3RoLCAxMCk7XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgcGF1c2UgdGltZVxuICAgIGlmICghc2NvcGUucGF1c2UpIHtcbiAgICAgIHNjb3BlLnBhdXNlID0gUEFVU0U7XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgY2xlYXJTZWxlY3RlZFxuICAgIGlmICghc2NvcGUuY2xlYXJTZWxlY3RlZCkge1xuICAgICAgc2NvcGUuY2xlYXJTZWxlY3RlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIG92ZXJyaWRlIHN1Z2dlc3Rpb25zXG4gICAgaWYgKCFzY29wZS5vdmVycmlkZVN1Z2dlc3Rpb25zKSB7XG4gICAgICBzY29wZS5vdmVycmlkZVN1Z2dlc3Rpb25zID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgcmVxdWlyZWQgZmllbGRcbiAgICBpZiAoc2NvcGUuZmllbGRSZXF1aXJlZCAmJiBjdHJsKSB7XG4gICAgICAvLyBjaGVjayBpbml0aWFsIHZhbHVlLCBpZiBnaXZlbiwgc2V0IHZhbGlkaXRpdHkgdG8gdHJ1ZVxuICAgICAgaWYgKHNjb3BlLmluaXRpYWxWYWx1ZSkge1xuICAgICAgICBoYW5kbGVSZXF1aXJlZCh0cnVlKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBoYW5kbGVSZXF1aXJlZChmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NvcGUuaW5wdXRUeXBlID0gYXR0cnMudHlwZSA/IGF0dHJzLnR5cGUgOiAndGV4dCc7XG5cbiAgICAvLyBzZXQgc3RyaW5ncyBmb3IgXCJTZWFyY2hpbmcuLi5cIiBhbmQgXCJObyByZXN1bHRzXCJcbiAgICBzY29wZS50ZXh0U2VhcmNoaW5nID0gYXR0cnMudGV4dFNlYXJjaGluZyA/IGF0dHJzLnRleHRTZWFyY2hpbmcgOiBURVhUX1NFQVJDSElORztcbiAgICBzY29wZS50ZXh0Tm9SZXN1bHRzID0gYXR0cnMudGV4dE5vUmVzdWx0cyA/IGF0dHJzLnRleHROb1Jlc3VsdHMgOiBURVhUX05PUkVTVUxUUztcbiAgICBkaXNwbGF5U2VhcmNoaW5nID0gc2NvcGUudGV4dFNlYXJjaGluZyA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogdHJ1ZTtcbiAgICBkaXNwbGF5Tm9SZXN1bHRzID0gc2NvcGUudGV4dE5vUmVzdWx0cyA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogdHJ1ZTtcblxuICAgIC8vIHNldCBtYXggbGVuZ3RoIChkZWZhdWx0IHRvIG1heGxlbmd0aCBkZWF1bHQgZnJvbSBodG1sXG4gICAgc2NvcGUubWF4bGVuZ3RoID0gYXR0cnMubWF4bGVuZ3RoID8gYXR0cnMubWF4bGVuZ3RoIDogTUFYX0xFTkdUSDtcblxuICAgIC8vIHJlZ2lzdGVyIGV2ZW50c1xuICAgIGlucHV0RmllbGQub24oJ2tleWRvd24nLCBrZXlkb3duSGFuZGxlcik7XG4gICAgaW5wdXRGaWVsZC5vbigna2V5dXAnLCBrZXl1cEhhbmRsZXIpO1xuXG4gICAgLy8gc2V0IHJlc3BvbnNlIGZvcm1hdHRlclxuICAgIHJlc3BvbnNlRm9ybWF0dGVyID0gY2FsbEZ1bmN0aW9uT3JJZGVudGl0eSgncmVtb3RlVXJsUmVzcG9uc2VGb3JtYXR0ZXInKTtcblxuICAgIC8vIHNldCBpc1Njcm9sbE9uXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNzcyA9IGdldENvbXB1dGVkU3R5bGUoZGQpO1xuICAgICAgaXNTY3JvbGxPbiA9IGNzcy5tYXhIZWlnaHQgJiYgY3NzLm92ZXJmbG93WSA9PT0gJ2F1dG8nO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0VBJyxcbiAgICByZXF1aXJlOiAnXj9mb3JtJyxcbiAgICBzY29wZToge1xuICAgICAgc2VsZWN0ZWRPYmplY3Q6ICc9JyxcbiAgICAgIGRpc2FibGVJbnB1dDogJz0nLFxuICAgICAgaW5pdGlhbFZhbHVlOiAnPScsXG4gICAgICBsb2NhbERhdGE6ICc9JyxcbiAgICAgIGxvY2FsU2VhcmNoOiAnJicsXG4gICAgICByZW1vdGVVcmxSZXF1ZXN0Rm9ybWF0dGVyOiAnPScsXG4gICAgICByZW1vdGVVcmxSZXF1ZXN0V2l0aENyZWRlbnRpYWxzOiAnQCcsXG4gICAgICByZW1vdGVVcmxSZXNwb25zZUZvcm1hdHRlcjogJz0nLFxuICAgICAgcmVtb3RlVXJsRXJyb3JDYWxsYmFjazogJz0nLFxuICAgICAgcmVtb3RlQXBpSGFuZGxlcjogJz0nLFxuICAgICAgaWQ6ICdAJyxcbiAgICAgIHR5cGU6ICdAJyxcbiAgICAgIHBsYWNlaG9sZGVyOiAnQCcsXG4gICAgICByZW1vdGVVcmw6ICdAJyxcbiAgICAgIHJlbW90ZVVybERhdGFGaWVsZDogJ0AnLFxuICAgICAgdGl0bGVGaWVsZDogJ0AnLFxuICAgICAgZGVzY3JpcHRpb25GaWVsZDogJ0AnLFxuICAgICAgaW1hZ2VGaWVsZDogJ0AnLFxuICAgICAgaW5wdXRDbGFzczogJ0AnLFxuICAgICAgcGF1c2U6ICdAJyxcbiAgICAgIHNlYXJjaEZpZWxkczogJ0AnLFxuICAgICAgbWlubGVuZ3RoOiAnQCcsXG4gICAgICBtYXRjaENsYXNzOiAnQCcsXG4gICAgICBjbGVhclNlbGVjdGVkOiAnQCcsXG4gICAgICBvdmVycmlkZVN1Z2dlc3Rpb25zOiAnQCcsXG4gICAgICBmaWVsZFJlcXVpcmVkOiAnPScsXG4gICAgICBmaWVsZFJlcXVpcmVkQ2xhc3M6ICdAJyxcbiAgICAgIGlucHV0Q2hhbmdlZDogJz0nLFxuICAgICAgYXV0b01hdGNoOiAnQCcsXG4gICAgICBmb2N1c091dDogJyYnLFxuICAgICAgZm9jdXNJbjogJyYnLFxuICAgICAgZmllbGRUYWJpbmRleDogJ0AnLFxuICAgICAgaW5wdXROYW1lOiAnQCcsXG4gICAgICBmb2N1c0ZpcnN0OiAnQCcsXG4gICAgICBwYXJzZUlucHV0OiAnJidcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbiAoZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCBURU1QTEFURV9VUkw7XG4gICAgfSxcbiAgICBjb21waWxlOiBmdW5jdGlvbiAodEVsZW1lbnQpIHtcbiAgICAgIHZhciBzdGFydFN5bSA9ICRpbnRlcnBvbGF0ZS5zdGFydFN5bWJvbCgpO1xuICAgICAgdmFyIGVuZFN5bSA9ICRpbnRlcnBvbGF0ZS5lbmRTeW1ib2woKTtcbiAgICAgIGlmICghKHN0YXJ0U3ltID09PSAne3snICYmIGVuZFN5bSA9PT0gJ319JykpIHtcbiAgICAgICAgdmFyIGludGVycG9sYXRlZEh0bWwgPSB0RWxlbWVudC5odG1sKClcbiAgICAgICAgICAucmVwbGFjZSgvXFx7XFx7L2csIHN0YXJ0U3ltKVxuICAgICAgICAgIC5yZXBsYWNlKC9cXH1cXH0vZywgZW5kU3ltKTtcbiAgICAgICAgdEVsZW1lbnQuaHRtbChpbnRlcnBvbGF0ZWRIdG1sKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsaW5rO1xuICAgIH1cbiAgfTtcbn1dKTtcblxuXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBub2RlX21vZHVsZXMvYW5ndWNvbXBsZXRlLWFsdC9hbmd1Y29tcGxldGUtYWx0LmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgbWFpbiA9IGFuZ3VsYXIubW9kdWxlKCdtYWluJywgWyd1aS5yb3V0ZXInXSk7XHJcblxyXG5tYWluXHJcbiAgICAuY29tcG9uZW50KCdsZWZ0U2lkZU1lbnUnLCByZXF1aXJlKCcuL2xlZnQtc2lkZS1tZW51LWNvbXBvbmVudC9sZWZ0LXNpZGUtbWVudS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ2RheXRpbWVDaG9vc2UnLCByZXF1aXJlKCcuL2RheXRpbWUtY2hvb3NlLWNvbXBvbmVudC9kYXl0aW1lLWNob29zZS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ2hvbWUnLCByZXF1aXJlKCcuL2hvbWUtcGFnZS1tb2R1bGUvaG9tZS1wYWdlLWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgndmlldycsIHJlcXVpcmUoJy4vdmlldy1jb21wb25lbnQvdmlldy1jb21wb25lbnQnKSk7XHJcblxyXG5tYWluLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICAgJHN0YXRlUHJvdmlkZXJcclxuICAgICAgICAuc3RhdGUoJ2hvbWUnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9ob21lJyxcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8aG9tZT48L2hvbWU+J1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKCdkaWFyeScsIHtcclxuICAgICAgICAgICAgdXJsOiAnL2RpYXJ5LzpkYXl0aW1lJyxcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGF5LXRpbWUgYmFzZT1cIiRjdHJsLmJhc2VcIiBkYXl0aW1lcz1cIiRjdHJsLnZpZXdEYXRhLmRheVRpbWVzXCIgYWRkPVwiJGN0cmwuYWRkRm9vZChkYXlUaW1lSWQsIGZvb2QpXCIgcmVtb3ZlPVwiJGN0cmwucmVtb3ZlRm9vZChkYXlUaW1lSWQsIGZvb2QpXCIgZGF5LXRpbWUtbGltaXRzPVwiJGN0cmwudmlld0RhdGEubGltaXRzRGF0YVwiPjwvZGF5LXRpbWU+J1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKCdzZXR0aW5ncycsIHtcclxuICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzJyxcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8bWVudT48L21lbnU+J1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKCdyZXN1bHQnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9yZXN1bHQnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxyZXN1bHQgcmVzdWx0PVwiJGN0cmwudmlld0RhdGEucmVzdWx0RmluYWxcIj48L3Jlc3VsdD4nXHJcbiAgICAgICAgfSk7XHJcbn0pO1xyXG5cclxubWFpbi5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSwgYWN0aXZlQ2xhc3NTZXJ2aWNlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcykge1xyXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCAoKSA9PiB7XHJcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9ICRzdGF0ZS5jdXJyZW50Lm5hbWUgPT09ICdkaWFyeSc/ICRzdGF0ZVBhcmFtcy5kYXl0aW1lIDogJHN0YXRlLmN1cnJlbnQubmFtZTtcclxuICAgICAgICBhY3RpdmVDbGFzc1NlcnZpY2Uuc2V0Q2xhc3NOYW1lKGNsYXNzTmFtZSk7XHJcbiAgICB9KVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbWFpbjtcclxuXHJcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9tYWluLW1vZHVsZS9pbmRleC5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGxlZnRTaWRlTWVudVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9sZWZ0LXNpZGUtbWVudS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBsZWZ0U2lkZU1lbnUgPSB7XHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHN0YXRlLCBhY3RpdmVDbGFzc1NlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZUNsYXNzID0gYWN0aXZlQ2xhc3NTZXJ2aWNlLmdldENsYXNzTmFtZTtcclxuXHJcbiAgICAgICAgdGhpcy5tZW51SXRlbXMgPSBbXHJcbiAgICAgICAgICAgIHtjbGFzc05hbWU6ICdob21lJywgdG9vbHRpcDogJ9Cd0LAg0LPQu9Cw0LLQvdGD0Y4nLCB0b29sdGlwU2hvdzogZmFsc2V9LFxyXG4gICAgICAgICAgICB7Y2xhc3NOYW1lOiAnc2V0dGluZ3MnLCB0b29sdGlwOiAn0J3QsNGB0YLRgNC+0LnQutC4JywgdG9vbHRpcFNob3c6IGZhbHNlfSxcclxuICAgICAgICAgICAge2NsYXNzTmFtZTogJ3Jlc3VsdCcsIHRvb2x0aXA6ICfQmNGC0L7QsyDQtNC90Y8nLCB0b29sdGlwU2hvdzogZmFsc2V9LFxyXG4gICAgICAgICAgICB7Y2xhc3NOYW1lOiAncHJpbnQnLCB0b29sdGlwOiAn0JTQu9GPINC/0LXRh9Cw0YLQuCcsIHRvb2x0aXBTaG93OiBmYWxzZX0sXHJcbiAgICAgICAgICAgIHtjbGFzc05hbWU6ICdzYXZlJywgdG9vbHRpcDogJ9Ch0L7RhdGA0LDQvdC40YLRjCcsIHRvb2x0aXBTaG93OiBmYWxzZX0sXHJcbiAgICAgICAgICAgIHtjbGFzc05hbWU6ICd0YWJsZXMnLCB0b29sdGlwOiAn0KLQsNCx0LvQuNGG0YsnLCB0b29sdGlwU2hvdzogZmFsc2V9LFxyXG4gICAgICAgICAgICB7Y2xhc3NOYW1lOiAnYWRkLWZvb2QnLCB0b29sdGlwOiAn0JTQvtCx0LDQstC40YLRjCDQtdC00YMg0LIg0YLQsNCx0LvQuNGG0YMnLCB0b29sdGlwU2hvdzogZmFsc2V9XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgdGhpcy50b2dnbGUgPSBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmNsYXNzTmFtZSA9PT0gdGhpcy5hY3RpdmVDbGFzcykgcmV0dXJuO1xyXG4gICAgICAgICAgICBpdGVtLnRvb2x0aXBTaG93ID0gIWl0ZW0udG9vbHRpcFNob3c7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbihjbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgKCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IG51bWIgPSBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIDMpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tJY29uQ2xhc3NOYW1lID0gJ2ljb24nICsgbnVtYjtcclxuICAgICAgICB9KSgpXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGxlZnRTaWRlTWVudVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGxlZnRTaWRlTWVudTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvbWFpbi1tb2R1bGUvbGVmdC1zaWRlLW1lbnUtY29tcG9uZW50L2xlZnQtc2lkZS1tZW51LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwibGVmdC1zaWRlLW1lbnVcXFwiPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJ0by1hbm90aGVyLWRlc2lnblxcXCIgbmctY2xhc3M9XFxcIiRjdHJsLmJhY2tJY29uQ2xhc3NOYW1lXFxcIj48L2Rpdj5cXHJcXG5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwibWVudS1pdGVtXFxcIiBuZy1yZXBlYXQ9XFxcIml0ZW0gaW4gJGN0cmwubWVudUl0ZW1zXFxcIiBuZy1jbGFzcz1cXFwiW2l0ZW0uY2xhc3NOYW1lLCAkY3RybC5hY3RpdmVDbGFzcygpXVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldFN0YXRlKGl0ZW0uY2xhc3NOYW1lKVxcXCIgbmctbW91c2VlbnRlcj1cXFwiJGN0cmwudG9nZ2xlKGl0ZW0pXFxcIiBuZy1tb3VzZWxlYXZlPVxcXCIkY3RybC50b2dnbGUoaXRlbSlcXFwiPlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwidG9vbHRpcFxcXCIgbmctaWY9XFxcIml0ZW0udG9vbHRpcFNob3dcXFwiPnt7aXRlbS50b29sdGlwfX08L2Rpdj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuXFxyXFxuPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcImxlZnQtc2lkZS1tZW51LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL21haW4tbW9kdWxlL2xlZnQtc2lkZS1tZW51LWNvbXBvbmVudC90ZW1wbGF0ZS9sZWZ0LXNpZGUtbWVudS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgZGF5dGltZUNob29zZVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9kYXl0aW1lLWNob29zZS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBkYXl0aW1lQ2hvb3NlID0ge1xyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHN0YXRlLCBhY3RpdmVDbGFzc1NlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLmRheXRpbWVzID0gW1xyXG4gICAgICAgICAgICB7dGltZTogJ9CX0LDQstGC0YDQsNC6JywgY2xhc3NOYW1lOiAnYnJlYWtmYXN0Jywgc3RhdGU6ICdicmVha2Zhc3QnfSxcclxuICAgICAgICAgICAge3RpbWU6ICfQn9C10YDQtdC60YPRgSAxJywgY2xhc3NOYW1lOiBmYWxzZSwgc3RhdGU6ICdmaXJzdC1zbmFjayd9LFxyXG4gICAgICAgICAgICB7dGltZTogJ9Ce0LHQtdC0JywgY2xhc3NOYW1lOiBmYWxzZSwgc3RhdGU6ICdkaW5uZXInfSxcclxuICAgICAgICAgICAge3RpbWU6ICfQn9C10YDQtdC60YPRgSAyJywgY2xhc3NOYW1lOiBmYWxzZSwgc3RhdGU6ICdzZWNvbmQtc25hY2snfSxcclxuICAgICAgICAgICAge3RpbWU6ICfQo9C20LjQvScsIGNsYXNzTmFtZTogZmFsc2UsIHN0YXRlOiAnZXZlbmluZy1tZWFsJ31cclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB0aGlzLmFjdGl2ZUNsYXNzID0gYWN0aXZlQ2xhc3NTZXJ2aWNlLmdldENsYXNzTmFtZTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSA9IGZ1bmN0aW9uKGRheXRpbWUpIHtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKCdkaWFyeScsIHtkYXl0aW1lOiBkYXl0aW1lLnN0YXRlfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGRheXRpbWVDaG9vc2VUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkYXl0aW1lQ2hvb3NlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9tYWluLW1vZHVsZS9kYXl0aW1lLWNob29zZS1jb21wb25lbnQvZGF5dGltZS1jaG9vc2UtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJkYXl0aW1lLWNob29zZVxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImRheXRpbWVcXFwiIG5nLXJlcGVhdD1cXFwiZGF5dGltZSBpbiAkY3RybC5kYXl0aW1lc1xcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldFN0YXRlKGRheXRpbWUpXFxcIiBuZy1jbGFzcz1cXFwiWyRjdHJsLmFjdGl2ZUNsYXNzKCksIGRheXRpbWUuc3RhdGVdXFxcIj57eyBkYXl0aW1lLnRpbWUgfX08L2Rpdj5cXHJcXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwiZGF5dGltZS1jaG9vc2UtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvbWFpbi1tb2R1bGUvZGF5dGltZS1jaG9vc2UtY29tcG9uZW50L3RlbXBsYXRlL2RheXRpbWUtY2hvb3NlLXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSA3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcImhvbWUtcGFnZVxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImRheXRpbWUtc2VsZWN0LXRvb2x0aXBcXFwiPtCS0YvQsdC10YDQtdGC0LUg0LLRgNC10LzRjyDQtNC90Y8sXFxyXFxuICAgICAgICDRh9GC0L7QsdGLINC/0YDQuNGB0YLRg9C/0LjRgtGMINC6INC30LDQv9C+0LvQvdC10L3QuNGOINC00L3QtdCy0L3QuNC60LA8L2Rpdj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiaG9tZS1oZWFkZXJcXFwiPlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwibGVmdC1saW5lXFxcIj48L2Rpdj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInJpZ2h0LWxpbmVcXFwiPjwvZGl2PlxcclxcbiAgICAgICAgPGgyPtCU0L3QtdCy0L3QuNC6INC/0LjRgtCw0L3QuNGPPC9oMj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuXFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcIm1lbnUtc2VsZWN0LXRvb2x0aXBcXFwiPtCn0YLQvtCx0Ysg0YPRgdGC0LDQvdC+0LLQuNGC0Ywg0LvQuNC80LjRgtGLLFxcclxcbiAgICAgICAg0YHQvtGF0YDQsNC90LjRgtGMINC00LDQvdC90YvQtSwg0LTQvtCx0LDQstC40YLRjCDQtdC00YMg0LvQuNCx0L5cXHJcXG4gICAgICAgINC/0YDQvtGB0LzQvtGC0YDQtdGC0Ywg0LjRgtC+0LMg0Lgg0YLQsNCx0LvQuNGG0Ysg0LLQvtGB0L/QvtC70YzQt9GD0LnRgtC10YHRjCDQvNC10L3RjjwvZGl2PlxcclxcbjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJob21lLXBhZ2UtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvbWFpbi1tb2R1bGUvaG9tZS1wYWdlLW1vZHVsZS90ZW1wbGF0ZS9ob21lLXBhZ2UtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGRpYXJ5TW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ2RpYXJ5JywgW10pO1xyXG5cclxuZGlhcnlNb2R1bGVcclxuICAgIC5jb21wb25lbnQoJ21lbnUnLCByZXF1aXJlKCcuL21lbnUvbWVudS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ21haW5WaWV3JywgcmVxdWlyZSgnLi9tYWluLXZpZXcvbWFpbi12aWV3LWNvbXBvbmVudCcpKVxyXG4gICAgLmNvbXBvbmVudCgnZGF5VGltZScsIHJlcXVpcmUoJy4vZGF5LXRpbWUvZGF5LXRpbWUtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdmb29kJywgcmVxdWlyZSgnLi9mb29kL2Zvb2QtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdzYXZlTWVudScsIHJlcXVpcmUoJy4vc2F2ZS1tZW51L3NhdmUtbWVudS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ3Jlc3VsdCcsIHJlcXVpcmUoJy4vcmVzdWx0LWNvbXBvbmVudC9yZXN1bHQtY29tcG9uZW50JykpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkaWFyeU1vZHVsZTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvZGlhcnktbW9kdWxlL2luZGV4LmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIG1lbnVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvbWVudS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBtZW51ID0ge1xyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCR3aW5kb3csIGRpZXRDaG9vc2UpIHtcclxuICAgICAgICB0aGlzLmRpZXRzID0gZGlldENob29zZS5kaWV0cztcclxuICAgICAgICB0aGlzLnNldERpZXQgPSBkaWV0Q2hvb3NlLnNldERpZXQ7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmNsYXNzTmFtZSA9IGRpZXRDaG9vc2UuY2xhc3NOYW1lO1xyXG4gICAgICAgIHRoaXMuc2V0Q2xhc3NOYW1lID0gZGlldENob29zZS5zZXRDbGFzc05hbWU7XHJcblxyXG5cclxuICAgICAgICB0aGlzLnNldExpbWl0cyA9IGRpZXRDaG9vc2Uuc2V0TGltaXRzO1xyXG4gICAgICAgIHRoaXMucmVzZXRDaG9vc2UgPSBkaWV0Q2hvb3NlLnJlc2V0Q2hvb3NlO1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiBtZW51VGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbWVudTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvZGlhcnktbW9kdWxlL21lbnUvbWVudS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgaWQ9XFxcIm1lbnVcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJkaWV0LW1lbnVcXFwiPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiZGlldC10aXR0bGVcXFwiPtCS0LjQtCDQtNC40LXRgtGLOjwvZGl2PlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiZGlldC1jaG9vc2VcXFwiPlxcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJkaWV0XFxcIiBuZy1jbGFzcz1cXFwie2FjdGl2ZTogJGN0cmwuZGlldHMucHJvdGVpbnN9XFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2V0RGlldCgncHJvdGVpbnMnKVxcXCI+0JLRi9GB0L7QutC+0L/RgNC+0YLQtdC40L3QvtCy0LDRjyDQutC+0LzQsdC40L3QsNGG0LjRjyDQt9Cw0LzQtdC9PC9zcGFuPlxcbiAgICAgICAgICAgIDxicj5cXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiZGlldFxcXCIgbmctY2xhc3M9XFxcInthY3RpdmU6ICRjdHJsLmRpZXRzLmNhcmJvaHlkcmF0ZXN9XFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2V0RGlldCgnY2FyYm9oeWRyYXRlcycpXFxcIj7QktGL0YHQvtC60L7Rg9Cz0LvQtdCy0L7QtNC90LDRjyDQutC+0LzQsdC40L3QsNGG0LjRjyDQt9Cw0LzQtdC9PC9zcGFuPlxcbiAgICAgICAgPC9kaXY+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJwaGFzZS1tZW51XFxcIj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInBoYXNlLXRpdHRsZVxcXCI+0JLRi9Cx0LXRgNC10YLQtSDQktCw0YjRgyDRhNCw0LfRgzo8L2Rpdj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInBoYXNlLWNob29zZVxcXCI+XFxuXFxuICAgICAgICAgICAgPGRpdiBuZy1jbGFzcz1cXFwiJGN0cmwuY2xhc3NOYW1lLm5hbWVcXFwiIGNsYXNzPVxcXCJmaXJzdC1waGFzZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldENsYXNzTmFtZSgxKVxcXCI+PHNwYW4+LTwvc3Bhbj4gMSA8c3Bhbj4tPC9zcGFuPjwvZGl2PlxcbiAgICAgICAgICAgIDxkaXYgbmctY2xhc3M9XFxcIiRjdHJsLmNsYXNzTmFtZS5uYW1lXFxcIiBjbGFzcz1cXFwic2Vjb25kLXBoYXNlXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuc2V0Q2xhc3NOYW1lKDIpXFxcIj48c3Bhbj4tPC9zcGFuPiAyIDxzcGFuPi08L3NwYW4+PC9kaXY+XFxuICAgICAgICAgICAgPGRpdiBuZy1jbGFzcz1cXFwiJGN0cmwuY2xhc3NOYW1lLm5hbWVcXFwiIGNsYXNzPVxcXCJ0aGlyZC1waGFzZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNldENsYXNzTmFtZSgzKVxcXCI+PHNwYW4+LTwvc3Bhbj4gMyA8c3Bhbj4tPC9zcGFuPjwvZGl2PlxcblxcbiAgICAgICAgPC9kaXY+XFxuICAgIDwvZGl2PlxcblxcbiAgICA8ZGl2IGNsYXNzPVxcXCJjbGVhci1saW1pdHNcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5yZXNldENob29zZSgpXFxcIj7QodCx0YDQvtGB0LjRgtGMINC70LjQvNC40YLRizwvZGl2PlxcbjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJtZW51LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9tZW51L3RlbXBsYXRlL21lbnUtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDEyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IG1haW5WaWV3VGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL21haW4tdmlldy5odG1sJyk7XG5cbmNvbnN0IG1haW5WaWV3ID0ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIChkYXRhU2VydmljZSwgbGltaXRzU2VydmljZSwgJHdpbmRvdykge1xuICAgICAgICBjb25zdCBlbXB0eSA9IHtcbiAgICAgICAgICAgIGVtcHR5OiB0cnVlLFxuICAgICAgICAgICAgbmFtZTogJy0tLS0tLS0tLScsXG4gICAgICAgICAgICBwb3J0aW9uOiAnLS0tJyxcbiAgICAgICAgICAgIGNhcmJvaHlkOiAnLS0tJyxcbiAgICAgICAgICAgIHByb3Q6ICctLS0nLFxuICAgICAgICAgICAgZmF0OiAnLS0tJyxcbiAgICAgICAgICAgIGthbGw6ICctLS0nXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5iYXNlID0gZGF0YVNlcnZpY2UuYmFzZTtcbiAgICAgICAgdGhpcy52aWV3RGF0YSA9IHtcbiAgICAgICAgICAgIGxpbWl0c0RhdGE6IGxpbWl0c1NlcnZpY2UubGltaXRzRGF0YVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlRGF0YSkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVEYXRhKTtcbiAgICAgICAgICAgIHRoaXMudmlld0RhdGEuZGF5VGltZXMgPSBkYXRhLmRheXNEYXRhO1xuICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbCA9IGRhdGEucmVzdWx0RmluYWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXRhU2VydmljZS5nZXREYXlUaW1lc0RhdGEoKVxuICAgICAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB0aGlzLnZpZXdEYXRhLmRheVRpbWVzID0gZGF0YS5kYXRhKTtcblxuICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbCA9IHtcbiAgICAgICAgICAgICAgICBjYXJib2h5ZDogMCxcbiAgICAgICAgICAgICAgICBwcm90OiAwLFxuICAgICAgICAgICAgICAgIGZhdDogMCxcbiAgICAgICAgICAgICAgICBrYWxsOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIHRoaXMuY29tcGFyZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnZpZXdEYXRhLmxpbWl0c0RhdGEubGltaXRzKSByZXR1cm47XG4gICAgICAgICAgICBpZiAodGhpcy52aWV3RGF0YS5saW1pdHNEYXRhLmxpbWl0c1tcItCY0YLQvtCzXCJdW2tleV0gPCB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsW2tleV0pIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgdGhpcy5hZGRGb29kID0gZnVuY3Rpb24oZGF5VGltZUlkLCBmb29kKSB7XG4gICAgICAgICAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMudmlld0RhdGEuZGF5VGltZXNbZGF5VGltZUlkXS5mb29kcztcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9uWzBdLmVtcHR5KSBjb2xsZWN0aW9uLnNwbGljZSgwLCAxKTtcblxuICAgICAgICAgICAgY29sbGVjdGlvbi5wdXNoKGZvb2QpO1xuICAgICAgICAgICAgdGhpcy5jYWxjUmVzdWx0KGRheVRpbWVJZCwgZm9vZCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCkgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnX2xhc3RTYXZlSWQnKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZUZvb2QgPSBmdW5jdGlvbihkYXlUaW1lSWQsIGZvb2QpIHtcbiAgICAgICAgICAgIGxldCBjb2xsZWN0aW9uID0gdGhpcy52aWV3RGF0YS5kYXlUaW1lc1tkYXlUaW1lSWRdLmZvb2RzO1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gY29sbGVjdGlvbi5pbmRleE9mKGZvb2QpO1xuICAgICAgICAgICAgY29sbGVjdGlvbi5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbi5sZW5ndGggPT09IDApIGNvbGxlY3Rpb24ucHVzaChlbXB0eSk7XG4gICAgICAgICAgICB0aGlzLmNhbGNSZXN1bHQoZGF5VGltZUlkLCBmb29kLCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuX2xhc3RTYXZlSWQpICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ19sYXN0U2F2ZUlkJyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy50b2dnbGVEYXlUaW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIHRoaXMudmlld0RhdGEuZGF5VGltZXNbaWRdLnNob3cgPSAhdGhpcy52aWV3RGF0YS5kYXlUaW1lc1tpZF0uc2hvd1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgdGhpcy5jYWxjUmVzdWx0ID0gZnVuY3Rpb24gKGRheVRpbWVJZCwgZm9vZCwgYm9vbCkge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHRoaXMudmlld0RhdGEuZGF5VGltZXNbZGF5VGltZUlkXS5yZXN1bHQ7XG4gICAgICAgICAgICBpZiAoYm9vbCkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gKz0gZm9vZFtrZXldO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsW2tleV0gKz0gZm9vZFtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSAtPSBmb29kW2tleV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld0RhdGEucmVzdWx0RmluYWxba2V5XSAtPSBmb29kW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogbWFpblZpZXdUZW1wbGF0ZVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBtYWluVmlldztcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvZGlhcnktbW9kdWxlL21haW4tdmlldy9tYWluLXZpZXctY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJtYWluLXZpZXdcXFwiPlxcbiAgICA8ZGF5LXRpbWUgbmctcmVwZWF0PVxcXCJ0aW1lIGluICRjdHJsLnZpZXdEYXRhLmRheVRpbWVzXFxcIiB0aW1lPVxcXCJ0aW1lXFxcIiBiYXNlPVxcXCIkY3RybC5iYXNlXFxcIiBkYXktdGltZS1saW1pdHM9XFxcIiRjdHJsLnZpZXdEYXRhLmxpbWl0c0RhdGFcXFwiIGFkZD1cXFwiJGN0cmwuYWRkRm9vZChkYXlUaW1lSWQsIGZvb2QpXFxcIiByZW1vdmU9XFxcIiRjdHJsLnJlbW92ZUZvb2QoZGF5VGltZUlkLCBmb29kKVxcXCIgdG9nZ2xlPVxcXCIkY3RybC50b2dnbGVEYXlUaW1lKGlkKVxcXCI+PC9kYXktdGltZT5cXG5cXG4gICAgPGRpdiBjbGFzcz1cXFwicmVzdWx0XFxcIj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInJlc3VsdC10aXR0bGVcXFwiPtCY0YLQvtCz0L48L2Rpdj5cXG5cXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzPVxcXCJ0YWJsZS1yZXN1bHRcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInRhYmxlLXJlc3VsdC10aXR0bGVcXFwiPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicmVzdWx0LW5vLW5hbWVcXFwiPi0tLS0tLS0tLS0tLS0tLS08L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJwb3J0aW9uXFxcIj7Qn9C+0YDRhtC40Y8o0LPRgCk8L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjYXJib2h5ZFxcXCI+0KPQs9C70LXQstC+0LTRizwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInByb3RcXFwiPtCR0LXQu9C60Lg8L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJmYXRcXFwiPtCW0LjRgNGLPC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwia2FsbFxcXCI+0JrQsNC70L7RgNC40Lg8L3NwYW4+XFxuICAgICAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwicmVzdWx0LWZpbmFsXFxcIj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm5hbWVcXFwiPjwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInBvcnRpb25cXFwiPi0tLTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNhcmJvaHlkXFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtbGltaXQnOiAkY3RybC5jb21wYXJlKCdjYXJib2h5ZCcpfVxcXCI+e3sgJGN0cmwudmlld0RhdGEucmVzdWx0RmluYWwuY2FyYm9oeWQgfX0ge3snKCcgKyAkY3RybC52aWV3RGF0YS5saW1pdHNEYXRhLmxpbWl0c1tcXFwi0JjRgtC+0LNcXFwiXS5jYXJib2h5ZCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwicHJvdFxcXCIgbmctY2xhc3M9XFxcInsnYWN0aXZlLWxpbWl0JzogJGN0cmwuY29tcGFyZSgncHJvdCcpfVxcXCI+e3sgJGN0cmwudmlld0RhdGEucmVzdWx0RmluYWwucHJvdCAgfX0ge3snKCcgKyAkY3RybC52aWV3RGF0YS5saW1pdHNEYXRhLmxpbWl0c1tcXFwi0JjRgtC+0LNcXFwiXS5wcm90ICsgJyknIHwgbGltaXQgfX08L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJmYXRcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2ZhdCcpfVxcXCI+e3sgJGN0cmwudmlld0RhdGEucmVzdWx0RmluYWwuZmF0IH19IHt7JygnICsgJGN0cmwudmlld0RhdGEubGltaXRzRGF0YS5saW1pdHNbXFxcItCY0YLQvtCzXFxcIl0uZmF0ICsgJyknIHwgbGltaXQgfX08L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJrYWxsXFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtbGltaXQnOiAkY3RybC5jb21wYXJlKCdrYWxsJyl9XFxcIj57eyAkY3RybC52aWV3RGF0YS5yZXN1bHRGaW5hbC5rYWxsIH19IHt7JygnICsgJGN0cmwudmlld0RhdGEubGltaXRzRGF0YS5saW1pdHNbXFxcItCY0YLQvtCzXFxcIl0ua2FsbCArICcpJyB8IGxpbWl0IH19PC9zcGFuPlxcbiAgICAgICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgPC9zZWN0aW9uPlxcbiAgICA8L2Rpdj5cXG48L2Rpdj5cXG48c2F2ZS1tZW51IGRheS10aW1lcy1kYXRhPVxcXCIkY3RybC52aWV3RGF0YS5kYXlUaW1lc1xcXCIgcmVzdWx0PVxcXCIkY3RybC52aWV3RGF0YS5yZXN1bHRGaW5hbFxcXCI+PC9zYXZlLW1lbnU+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcIm1haW4tdmlldy5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC9kaWFyeS1tb2R1bGUvbWFpbi12aWV3L3RlbXBsYXRlL21haW4tdmlldy5odG1sXG4gKiogbW9kdWxlIGlkID0gMTRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGRheVRpbWVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvZGF5LXRpbWUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgZGF5VGltZSA9IHtcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgYmFzZTogJzwnLFxyXG4gICAgICAgIGRheXRpbWVzOiAnPCcsXHJcbiAgICAgICAgYWRkOiAnJicsXHJcbiAgICAgICAgcmVtb3ZlOiAnJicsXHJcbiAgICAgICAgZGF5VGltZUxpbWl0czogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oZGF0YVNlcnZpY2UsIHZhbGlkYXRpb25TZXJ2aWNlLCBjYWxjdWxhdGlvblNlcnZpY2UsICRzY29wZSwgJHN0YXRlUGFyYW1zLCBpbmRleFNlcnZpY2UpIHtcclxuICAgICAgICBsZXQgZGF5dGltZSA9ICRzdGF0ZVBhcmFtcy5kYXl0aW1lO1xyXG4gICAgICAgIHRoaXMuaW5kZXggPSBpbmRleFNlcnZpY2UoZGF5dGltZSk7XHJcblxyXG4gICAgICAgIHZhciB0ZXh0ID0gJyc7XHJcbiAgICAgICAgdGhpcy5vbklucHV0ID0gZnVuY3Rpb24oc3RyKSB7XHJcbiAgICAgICAgICAgIHRleHQgPSBzdHI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5saW1pdHMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF5VGltZUxpbWl0cy5saW1pdHMpIHJldHVybiB0aGlzLmRheVRpbWVMaW1pdHMubGltaXRzW3RoaXMuZGF5dGltZXNbdGhpcy5pbmRleF0uZGF5VGltZV07XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jb21wYXJlID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5saW1pdHMoKSkgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5saW1pdHMoKVtrZXldIDwgdGhpcy5kYXl0aW1lc1t0aGlzLmluZGV4XS5yZXN1bHRba2V5XSkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVGb29kID0gZnVuY3Rpb24oZm9vZCkge1xyXG4gICAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmUoe2RheVRpbWVJZDogdGhpcy5pbmRleCwgZm9vZDogZm9vZH0pXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRGb29kID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBwb3J0aW9uID0gTWF0aC5yb3VuZCgrdGhpcy5wb3J0aW9uKTtcclxuICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmZvb2ROYW1lID8gdGhpcy5mb29kTmFtZS50aXRsZSA6IHRleHQ7XHJcblxyXG4gICAgICAgICAgICAvL9Cf0YDQvtCy0LXRgNC40YLRjCDQv9C+0LvRjyDQstCy0L7QtNCwLCDQstGL0YfQuNGB0LvQuNGC0Ywg0LfQvdCw0YfQtdC90LjRj1xyXG4gICAgICAgICAgICBpZiAoIXZhbGlkYXRpb25TZXJ2aWNlLmZvb2RBZGRWYWxpZGF0aW9uKG5hbWUsIHBvcnRpb24pKSByZXR1cm47XHJcbiAgICAgICAgICAgIHZhciBmb29kID0gY2FsY3VsYXRpb25TZXJ2aWNlLmNhbGN1bGF0ZVZhbHVlcyhuYW1lLCBwb3J0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIC8v0JTQvtCx0LDQstC40YLRjCDQsiDQvNCw0YHRgdC40LJcclxuICAgICAgICAgICAgdGhpcy5hZGQoe2RheVRpbWVJZDogdGhpcy5kYXl0aW1lc1t0aGlzLmluZGV4XS5pZCwgZm9vZDogZm9vZH0pO1xyXG5cclxuICAgICAgICAgICAgLy/QntGH0LjRgdGC0LjRgtGMINC/0L7Qu9GPINCy0LLQvtC00LBcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ2FuZ3Vjb21wbGV0ZS1hbHQ6Y2xlYXJJbnB1dCcpO1xyXG4gICAgICAgICAgICB0aGlzLnBvcnRpb24gPScnO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICB0aGlzLmVudGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgIT09IDEzKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuYWRkRm9vZCgpO1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGRheVRpbWVUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkYXlUaW1lO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvZGF5LXRpbWUvZGF5LXRpbWUtY29tcG9uZW50LmpzXG4gKiovIiwidmFyIGFuZ3VsYXI9d2luZG93LmFuZ3VsYXIsbmdNb2R1bGU7XG50cnkge25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFtcIm5nXCJdKX1cbmNhdGNoKGUpe25nTW9kdWxlPWFuZ3VsYXIubW9kdWxlKFwibmdcIixbXSl9XG52YXIgdjE9XCI8ZGl2IGNsYXNzPVxcXCJkYXktdGltZVxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImlucHV0XFxcIj5cXHJcXG4gICAgICAgIDxmb3JtPlxcclxcbiAgICAgICAgICAgIDxsYWJlbD7QndCw0LjQvNC10L3QvtCy0LDQvdC40LU6IDxhbmd1Y29tcGxldGUtYWx0IG5nLWtleXByZXNzPVxcXCIkY3RybC5lbnRlcigkZXZlbnQpXFxcIiBpZD1cXFwiZXgxXFxcIiBwbGFjZWhvbGRlcj1cXFwi0JLQstC10LTQuNGC0LUg0L/RgNC+0LTRg9C60YJcXFwiIHBhdXNlPVxcXCIxMDBcXFwiIHNlbGVjdGVkLW9iamVjdD1cXFwiJGN0cmwuZm9vZE5hbWVcXFwiIGxvY2FsLWRhdGE9XFxcIiRjdHJsLmJhc2UuZm9vZHMua2V5c1xcXCIgc2VhcmNoLWZpZWxkcz1cXFwiZm9vZE5hbWVcXFwiIHRpdGxlLWZpZWxkPVxcXCJmb29kTmFtZVxcXCIgbWlubGVuZ3RoPVxcXCIxXFxcIiBpbnB1dC1jaGFuZ2VkPVxcXCIkY3RybC5vbklucHV0XFxcIiBpbnB1dC1jbGFzcz1cXFwiZm9vZCBmb3JtLWNvbnRyb2wtc21hbGxcXFwiIG1hdGNoLWNsYXNzPVxcXCJoaWdobGlnaHRcXFwiPjwvYW5ndWNvbXBsZXRlLWFsdD48L2xhYmVsPlxcclxcbiAgICAgICAgICAgIDxicj5cXHJcXG5cXHJcXG4gICAgICAgICAgICA8bGFiZWw+0J/QvtGA0YbQuNGPKNCz0YApOiA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcInBvcnRpb24taW5wdXRcXFwiIHNpemU9XFxcIjJcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC5wb3J0aW9uXFxcIiBuZy1rZXlwcmVzcz1cXFwiJGN0cmwuZW50ZXIoJGV2ZW50KVxcXCIvPjwvbGFiZWw+XFxyXFxuICAgICAgICA8L2Zvcm0+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhZGQtYnV0dG9uXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuYWRkRm9vZCgpXFxcIj4rPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcblxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJ0YWJsZS1ib3JkZXJcXFwiPlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInRhYmxlLXRpdHRsZVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJuYW1lXFxcIj7QndCw0LjQvNC10L3QvtCy0LDQvdC40LUg0L/RgNC+0LTRg9C60YLQsDwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInBvcnRpb25cXFwiPtCf0L7RgNGG0LjRjyAo0LPRgCk8L3NwYW4+XFxyXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjYXJib2h5ZFxcXCI+0KPQs9C70LXQstC+0LTRizwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInByb3RcXFwiPtCR0LXQu9C60Lg8L3NwYW4+XFxyXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJmYXRcXFwiPtCW0LjRgNGLPC9zcGFuPlxcclxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwia2FsbFxcXCI+0JrQsNC70L7RgNC40Lg8L3NwYW4+XFxyXFxuICAgICAgICAgICAgPC9kaXY+XFxyXFxuXFxyXFxuXFxyXFxuICAgICAgICAgICAgPGZvb2QgbmctcmVwZWF0PVxcXCJmb29kIGluICRjdHJsLmRheXRpbWVzWyRjdHJsLmluZGV4XS5mb29kc1xcXCIgZm9vZD1cXFwiZm9vZFxcXCIgcmVtb3ZlPVxcXCIkY3RybC5yZW1vdmVGb29kKGZvb2QpXFxcIj48L2Zvb2Q+XFxyXFxuXFxyXFxuXFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwic3VtbWFyeVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJuYW1lXFxcIj7Qn9C+0LTRi9GC0L7Qszwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInBvcnRpb25cXFwiPi0tLTwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNhcmJvaHlkXFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtbGltaXQnOiAkY3RybC5jb21wYXJlKCdjYXJib2h5ZCcpfVxcXCI+e3sgJGN0cmwuZGF5dGltZXNbJGN0cmwuaW5kZXhdLnJlc3VsdC5jYXJib2h5ZCB9fSB7eycoJyArICRjdHJsLmxpbWl0cygpLmNhcmJvaHlkICsgJyknIHwgbGltaXQgfX08L3NwYW4+XFxyXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJwcm90XFxcIiBuZy1jbGFzcz1cXFwieydhY3RpdmUtbGltaXQnOiAkY3RybC5jb21wYXJlKCdwcm90Jyl9XFxcIj57eyAkY3RybC5kYXl0aW1lc1skY3RybC5pbmRleF0ucmVzdWx0LnByb3QgfX0ge3snKCcgKyAkY3RybC5saW1pdHMoKS5wcm90ICsgJyknIHwgbGltaXQgfX08L3NwYW4+XFxyXFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJmYXRcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2ZhdCcpfVxcXCI+e3sgJGN0cmwuZGF5dGltZXNbJGN0cmwuaW5kZXhdLnJlc3VsdC5mYXQgfX0ge3snKCcgKyAkY3RybC5saW1pdHMoKS5mYXQgKyAnKScgfCBsaW1pdCB9fTwvc3Bhbj5cXHJcXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImthbGxcXFwiIG5nLWNsYXNzPVxcXCJ7J2FjdGl2ZS1saW1pdCc6ICRjdHJsLmNvbXBhcmUoJ2thbGwnKX1cXFwiPnt7ICRjdHJsLmRheXRpbWVzWyRjdHJsLmluZGV4XS5yZXN1bHQua2FsbCB9fSB7eycoJyArICRjdHJsLmxpbWl0cygpLmthbGwgKyAnKScgfCBsaW1pdCB9fTwvc3Bhbj5cXHJcXG4gICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cXHJcXG48L2Rpdj5cXHJcXG5cXHJcXG5cXHJcXG48ZGl2IGNsYXNzPVxcXCJiclxcXCI+PC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcImRheS10aW1lLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9kYXktdGltZS90ZW1wbGF0ZS9kYXktdGltZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMTZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IGZvb2RUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvZm9vZC10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBmb29kID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBmb29kOiAnPCcsXHJcbiAgICAgICAgcmVtb3ZlOiAnJidcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNoZWNrRW1wdHlGb29kID0gZnVuY3Rpb24oZm9vZCkge1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4oZm9vZC5rYWxsKSkgcmV0dXJuICdlbXB0eSdcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiBmb29kVGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZm9vZDtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvZGlhcnktbW9kdWxlL2Zvb2QvZm9vZC1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcImZvb2RcXFwiIG5nLWNsYXNzPVxcXCIkY3RybC5jaGVja0VtcHR5Rm9vZCgkY3RybC5mb29kKVxcXCI+XFxyXFxuICAgIDxzcGFuIGNsYXNzPVxcXCJuYW1lXFxcIj57eyAkY3RybC5mb29kLm5hbWUgfX08L3NwYW4+XFxyXFxuICAgIDxzcGFuIGNsYXNzPVxcXCJwb3J0aW9uXFxcIj57eyAkY3RybC5mb29kLnBvcnRpb24gfX08L3NwYW4+XFxyXFxuICAgIDxzcGFuIGNsYXNzPVxcXCJjYXJib2h5ZFxcXCI+e3sgJGN0cmwuZm9vZC5jYXJib2h5ZCB9fTwvc3Bhbj5cXHJcXG4gICAgPHNwYW4gY2xhc3M9XFxcInByb3RcXFwiPnt7ICRjdHJsLmZvb2QucHJvdCB9fTwvc3Bhbj5cXHJcXG4gICAgPHNwYW4gY2xhc3M9XFxcImZhdFxcXCI+e3sgJGN0cmwuZm9vZC5mYXQgfX08L3NwYW4+XFxyXFxuICAgIDxzcGFuIGNsYXNzPVxcXCJrYWxsXFxcIj57eyAkY3RybC5mb29kLmthbGwgfX08L3NwYW4+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcInJlbW92ZS1mb29kXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwucmVtb3ZlKHtmb29kOiAkY3RybC5mb29kfSlcXFwiPjwvZGl2PlxcclxcbjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJmb29kLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL2RpYXJ5LW1vZHVsZS9mb29kL3RlbXBsYXRlL2Zvb2QtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDE4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBzYXZlTWVudVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9zYXZlLW1lbnUtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3Qgc2F2ZU1lbnUgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGRheVRpbWVzRGF0YTogJzwnLFxyXG4gICAgICAgIHJlc3VsdDogJzwnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHdpbmRvdywgdmFsaWRhdGlvblNlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSA9ICF0aGlzLmFjdGl2ZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNhdmVGb3JQcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9ICR3aW5kb3cubG9jYWxTdG9yYWdlLmRheXNEYXRhID8gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5kYXlzRGF0YSkgOiBbXTtcclxuICAgICAgICAgICAgLy/Qn9GA0L7QstC10YDQutC4XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA+IDAgJiYgbmV3IERhdGUoZGF0YVtkYXRhLmxlbmd0aCAtIDFdLnNhdmVUaW1lKS5nZXREYXkoKSA9PT0gbmV3IERhdGUoKS5nZXREYXkoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZGF0YS5sZW5ndGggLSAxXS5zYXZlVGltZUlkID09PSAkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KCfQndC10YIg0L3QvtCy0YvRhSDQtNCw0L3QvdGL0YUg0LTQu9GPINGB0L7RhdGA0LDQvdC10L3QuNGPJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFjb25maXJtKCfQn9C10YDQtdC30LDQv9C40YHQsNGC0Ywg0LTQsNC90L3Ri9C1INC/0LXRh9Cw0YLQuCDRgtC10LrRg9GI0LXQs9C+INC00L3Rjz8nKSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgZGF0YS5wb3AoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL9Ch0L7RhdGA0LDQvdC10L3QuNC1XHJcbiAgICAgICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgbGV0IGlkID0gKE1hdGgucmFuZG9tKCkgKyAnJykuc2xpY2UoMik7XHJcbiAgICAgICAgICAgIGxldCBkYXlEYXRhID0ge3NhdmVUaW1lOiBkYXRlLCBkYXlUaW1lczogdGhpcy5kYXlUaW1lc0RhdGEsIHJlc3VsdDogdGhpcy5yZXN1bHQsIHNhdmVUaW1lSWQ6IGlkfTtcclxuICAgICAgICAgICAgZGF0YS5wdXNoKGRheURhdGEpO1xyXG4gICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5kYXlzRGF0YSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xyXG4gICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5fbGFzdFNhdmVJZCA9IGlkO1xyXG4gICAgICAgICAgICBhbGVydCgn0JTQsNC90L3Ri9C1INGD0YHQv9C10YjQvdC+INGB0L7RhdGA0LDQvdC10L3RiycpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMucmVtb3ZlUHJpbnRTYXZlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZGF5c0RhdGEgJiYgY29uZmlybSgn0KPQtNCw0LvQuNGC0Ywg0YHQvtGF0YDQsNC90LXQvdC40Y8g0LTQu9GPINC/0LXRh9Cw0YLQuD8nKSkge1xyXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnZGF5c0RhdGEnKTtcclxuICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ19sYXN0U2F2ZUlkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5wcmV2aWV3ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZGF5c0RhdGE7XHJcbiAgICAgICAgICAgIGlmICghZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpcm0oJ9Ch0L7RhdGA0LDQvdC40YLRjCDRgtC10LrRg9GJ0LjQtSDQtNCw0L3QvdGL0LUg0LTQu9GPINC/0YDQvtGB0LzQvtGC0YDQsD8nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZUZvclByaW50KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KCfQndC10YIg0LTQsNC90L3Ri9GFINC00LvRjyDQv9GA0L7RgdC80L7RgtGA0LAhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YVtkYXRhLmxlbmd0aCAtIDFdLnNhdmVUaW1lSWQgIT09ICR3aW5kb3cubG9jYWxTdG9yYWdlLl9sYXN0U2F2ZUlkICYmIGNvbmZpcm0oJ9Ch0L7RhdGA0LDQvdC40YLRjCDQtNCw0L3QvdGL0LUg0LTQu9GPINC/0YDQvtGB0LzQvtGC0YDQsD8nKSkgdGhpcy5zYXZlRm9yUHJpbnQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcuL3ByaW50Lmh0bWwnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNhdmVEYXRhID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChjb25maXJtKCfQodC+0YXRgNCw0L3QuNGC0Ywg0YLQtdC60YPRidC40LUg0LTQsNC90L3Ri9C1PycpKSB7XHJcbiAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlRGF0YSA9IEpTT04uc3RyaW5naWZ5KHtkYXlzRGF0YTogdGhpcy5kYXlUaW1lc0RhdGEsIHJlc3VsdEZpbmFsOiB0aGlzLnJlc3VsdH0pO1xyXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZWRMaW1pdHMgPSAkd2luZG93LnNlc3Npb25TdG9yYWdlLnNhdmVkTGltaXRzO1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoJ9CU0LDQvdC90YvQtSDRg9GB0L/QtdGI0L3QviDRgdC+0YXRgNCw0L3QtdC90YsnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogc2F2ZU1lbnVUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzYXZlTWVudTtcclxuXHJcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9kaWFyeS1tb2R1bGUvc2F2ZS1tZW51L3NhdmUtbWVudS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcInNhdmUtbWVudSBncm91cFxcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcInByaW50LWJ1dHRvbiBncm91cFxcXCIgbmctY2xhc3M9XFxcInsncHJpbnQtYnV0dG9uLWFjdGl2ZSc6ICRjdHJsLmFjdGl2ZX1cXFwiIG5nLWNsaWNrPVxcXCIkY3RybC50b2dnbGUoKVxcXCI+0JTQu9GPINC/0LXRh9Cw0YLQuDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJzYXZlLWJ1dHRvbiBncm91cFxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnNhdmVEYXRhKClcXFwiPtCh0L7RhdGA0LDQvdC40YLRjCDQuNC30LzQtdC90LXQvdC40Y88L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwicHJpbnQtbWVudSBncm91cFxcXCIgbmctaWY9XFxcIiRjdHJsLmFjdGl2ZVxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0by1wcmludFxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnByZXZpZXcoKVxcXCI+0J/RgNC10LTQv9GA0L7RgdC80L7RgtGAPC9kaXY+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJwcmludC10by1sb2NhbFN0b3JhZ2VcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5zYXZlRm9yUHJpbnQoKVxcXCI+0KHQvtGF0YDQsNC90LjRgtGMINC00LvRjyDQv9C10YfQsNGC0Lg8L2Rpdj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImRlbHRlLXByaW50LWxvY2FsU3RvcmFnZVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnJlbW92ZVByaW50U2F2ZXMoKVxcXCI+0KPQtNCw0LvQuNGC0Ywg0YHQvtGF0YDQsNC90LXQvdC40Y88L2Rpdj5cXG4gICAgPC9kaXY+XFxuPC9kaXY+XFxuXFxuXFxuPGRpdiBjbGFzcz1cXFwiYnJcXFwiPjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJzYXZlLW1lbnUtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvZGlhcnktbW9kdWxlL3NhdmUtbWVudS90ZW1wbGF0ZS9zYXZlLW1lbnUtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDIwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCB0YWJsZU1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCd0YWJsZScsIFtdKTtcclxuXHJcbnRhYmxlTW9kdWxlXHJcbiAgICAuY29tcG9uZW50KCd0YWJsZVZpZXcnLCByZXF1aXJlKCcuL3RhYmxlLXZpZXctY29tcG9uZW50L3RhYmxlLXZpZXctY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCd0YWJsZUFkZCcsIHJlcXVpcmUoJy4vYWRkLXRvLXRhYmxlLWNvbXBvbmVudC9hZGQtdG8tdGFibGUtY29tcG9uZW50JykpXHJcbiAgICAuY29tcG9uZW50KCdmb29kVGFibGUnLCByZXF1aXJlKCcuL3RhYmxlLWNvbXBvbmVudC90YWJsZS1jb21wb25lbnQnKSlcclxuICAgIC5jb21wb25lbnQoJ3N0b3JhZ2VUYWJsZScsIHJlcXVpcmUoJy4vc3RvcmFnZS10YWJsZS1jb21wb25lbnQvc3RvcmFnZS10YWJsZS1jb21wb25lbnQnKSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRhYmxlTW9kdWxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvaW5kZXguanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHRhYmxlVmlld1RlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS90YWJsZS12aWV3LXRlbXBsYXRlLmh0bWwnKTtcblxuY29uc3QgdGFibGVWaWV3ID0ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGRhdGFTZXJ2aWNlLCAkd2luZG93KSB7XG4gICAgICAgIGRhdGFTZXJ2aWNlLmdldFRhYmxlRGF0YSgpXG4gICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9vZHNPYmpzID0gZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5teUZvb2RzKSB0aGlzLm15Rm9vZHMgPSBKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLm15Rm9vZHMpO1xuXG4gICAgICAgIHRoaXMucmVtb3ZlTXlGb29kID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMubXlGb29kc1tuYW1lXTtcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLm15Rm9vZHMgPSBKU09OLnN0cmluZ2lmeSh0aGlzLm15Rm9vZHMpO1xuXG4gICAgICAgICAgICBkYXRhU2VydmljZS5yZW1vdmVGcm9tQmFzZShuYW1lKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmFkZE15Rm9vZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlcykge1xuICAgICAgICAgICAgaWYgKHRoaXMubXlGb29kc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIGlmICghY29uZmlybSgn0J/QtdGA0LXQt9Cw0L/QuNGB0LDRgtGMINGB0YPRidC10YHRgtCy0YPRjtGJ0LjQuSDQv9GA0L7QtNGD0LrRgj8nKSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGRhdGFTZXJ2aWNlLnJlbW92ZUZyb21CYXNlKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5teUZvb2RzW25hbWVdID0gdmFsdWVzO1xuICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UubXlGb29kcyA9IEpTT04uc3RyaW5naWZ5KHRoaXMubXlGb29kcyk7XG5cbiAgICAgICAgICAgIGRhdGFTZXJ2aWNlLmFkZFRvQmFzZShuYW1lLCB2YWx1ZXMpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogdGFibGVWaWV3VGVtcGxhdGVcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB0YWJsZVZpZXc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS12aWV3LWNvbXBvbmVudC90YWJsZS12aWV3LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPHRhYmxlLWFkZCBhZGQtbXktZm9vZD1cXFwiJGN0cmwuYWRkTXlGb29kKG5hbWUsIHZhbHVlcylcXFwiPjwvdGFibGUtYWRkPlxcclxcblxcclxcbjxkaXYgY2xhc3M9XFxcInRhYmxlLWNvbnRhaW5lclxcXCI+XFxyXFxuICAgIDxmb29kLXRhYmxlIG5nLXJlcGVhdD1cXFwiZm9vZHNPYmogaW4gJGN0cmwuZm9vZHNPYmpzXFxcIiBmb29kcy1vYmo9XFxcImZvb2RzT2JqXFxcIiByZW1vdmU9XFxcIiRjdHJsLnJlbW92ZU15Rm9vZChmb29kLCBvYmopXFxcIj48L2Zvb2QtdGFibGU+XFxyXFxuICAgIDxzdG9yYWdlLXRhYmxlIG15LWZvb2RzPVxcXCIkY3RybC5teUZvb2RzXFxcIiByZW1vdmUtbXktZm9vZD1cXFwiJGN0cmwucmVtb3ZlTXlGb29kKG5hbWUpXFxcIj48L3N0b3JhZ2UtdGFibGU+XFxyXFxuPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcInRhYmxlLXZpZXctdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvdGFibGUtbW9kdWxlL3RhYmxlLXZpZXctY29tcG9uZW50L3RlbXBsYXRlL3RhYmxlLXZpZXctdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDIzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBhZGRUb1RhYmxlVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBhZGRUb1RhYmxlID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBhZGRNeUZvb2Q6ICcmJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICh2YWxpZGF0aW9uU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMudmFsdWVzID0gWzAsIDAsIDAsIDAsIDBdO1xyXG5cclxuICAgICAgICB0aGlzLmFkZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudCAmJiBldmVudC5rZXlDb2RlICE9PSAxMykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52YWx1ZXMuZm9yRWFjaCgodmFsdWUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlc1tpbmRleF0gPSArdmFsdWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICghdmFsaWRhdGlvblNlcnZpY2UuYWRkTXlGb29kVmFsaWRhdGlvbih0aGlzLm5hbWUsIHRoaXMudmFsdWVzKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGRNeUZvb2Qoe25hbWU6IHRoaXMubmFtZSwgdmFsdWVzOiB0aGlzLnZhbHVlc30pO1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlcyA9IFswLCAwLCAwLCAwLCAwXTtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiBhZGRUb1RhYmxlVGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYWRkVG9UYWJsZTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvdGFibGUtbW9kdWxlL2FkZC10by10YWJsZS1jb21wb25lbnQvYWRkLXRvLXRhYmxlLWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwiYWRkLXRvLXRhYmxlLWZvcm1cXFwiPlxcbiAgICA8aDMgY2xhc3M9XFxcImFkZC1mb3JtLXRpdGxlXFxcIj7QlNC+0LHQsNCy0LjRgtGMINC/0YDQvtC00YPQutGCINCyINGC0LDQsdC70LjRhtGDPC9oMz5cXG4gICAgPGZvcm0gY2xhc3M9XFxcInRhYmxlLWZvcm1cXFwiPlxcbiAgICAgICAgPGxhYmVsPtCd0LDQuNC80LXQvdC+0LLQsNC90LjQtTpcXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcImZvb2QtbmFtZVxcXCIgbmctbW9kZWw9XFxcIiRjdHJsLm5hbWVcXFwiIG5nLWtleWRvd249XFxcIiRjdHJsLmFkZCgkZXZlbnQpXFxcIi8+PC9sYWJlbD5cXG4gICAgICAgIDxsYWJlbD7Qn9C+0YDRhtC40Y8o0LPRgCk6XFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJ0YWJsZS1mb3JtLXBvcnRpb25cXFwiIHNpemU9XFxcIjJcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC52YWx1ZXNbMF1cXFwiIG5nLWtleWRvd249XFxcIiRjdHJsLmFkZCgkZXZlbnQpXFxcIi8+PC9sYWJlbD5cXG4gICAgICAgIDxsYWJlbD7Qo9Cz0LvQtdCy0L7QtNGLOlxcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwidGFibGUtZm9ybS1jYXJib2h5ZFxcXCIgc2l6ZT1cXFwiMlxcXCIgbmctbW9kZWw9XFxcIiRjdHJsLnZhbHVlc1sxXVxcXCIgbmcta2V5ZG93bj1cXFwiJGN0cmwuYWRkKCRldmVudClcXFwiLz48L2xhYmVsPlxcbiAgICAgICAgPGxhYmVsPtCR0LXQu9C60Lg6XFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJ0YWJsZS1mb3JtLXByb3RcXFwiIHNpemU9XFxcIjJcXFwiIG5nLW1vZGVsPVxcXCIkY3RybC52YWx1ZXNbMl1cXFwiIG5nLWtleWRvd249XFxcIiRjdHJsLmFkZCgkZXZlbnQpXFxcIi8+PC9sYWJlbD5cXG4gICAgICAgIDxsYWJlbD7QltC40YDRizpcXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcInRhYmxlLWZvcm0tZmF0XFxcIiBzaXplPVxcXCIyXFxcIiBuZy1tb2RlbD1cXFwiJGN0cmwudmFsdWVzWzNdXFxcIiBuZy1rZXlkb3duPVxcXCIkY3RybC5hZGQoJGV2ZW50KVxcXCIvPjwvbGFiZWw+XFxuICAgICAgICA8bGFiZWw+0JrQsNC70L7RgNC40Lg6XFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJ0YWJsZS1mb3JtLWthbFxcXCIgc2l6ZT1cXFwiMlxcXCIgbmctbW9kZWw9XFxcIiRjdHJsLnZhbHVlc1s0XVxcXCIgbmcta2V5ZG93bj1cXFwiJGN0cmwuYWRkKCRldmVudClcXFwiLz48L2xhYmVsPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYWRkLXRvLXRhYmxlLWJ1dHRvblxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmFkZCgpXFxcIj4rPC9kaXY+XFxuICAgIDwvZm9ybT5cXG5cXG48L2Rpdj5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwiYWRkLXRvLXRhYmxlLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL3RhYmxlLW1vZHVsZS9hZGQtdG8tdGFibGUtY29tcG9uZW50L3RlbXBsYXRlL2FkZC10by10YWJsZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMjVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHRhYmxlVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL3RhYmxlLXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IHRhYmxlID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBmb29kc09iajogJzwnLFxyXG4gICAgICAgIHJlbW92ZTogJyYnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiB0YWJsZVRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRhYmxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvdGFibGUtY29tcG9uZW50L3RhYmxlLWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPHRhYmxlIGNsYXNzPVxcXCJ0YlxcXCI+XFxyXFxuICAgIDxjYXB0aW9uIGNsYXNzPVxcXCJ0Yi10aXRsZVxcXCI+e3sgJGN0cmwuZm9vZHNPYmoudGl0bGUgfX08L2NhcHRpb24+XFxyXFxuICAgIDx0ciBuZy1yZXBlYXQ9XFxcImZvb2QgaW4gJGN0cmwuZm9vZHNPYmouZm9vZHNcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5yZW1vdmUoe2Zvb2Q6IGZvb2QsIG9iajogJGN0cmwuZm9vZHNPYmouZm9vZHN9KVxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj5cXHJcXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwidGQtbmFtZSBuYW1lLWNvbG9yXFxcIiBuZy1jbGFzcz1cXFwiZm9vZC5jbGFzc05hbWVcXFwiPnt7IGZvb2QudmFsdWVzLm5hbWUgfX08L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJwb3J0aW9uLWNvbG9yXFxcIiBuZy1jbGFzcz1cXFwiZm9vZC5jbGFzc05hbWVcXFwiPnt7IGZvb2QudmFsdWVzLnBvcnRpb24gfX08L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJjYXJib2h5ZC1jb2xvclxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj57eyBmb29kLnZhbHVlcy5jYXJib2h5ZCB9fTwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcInByb3QtY29sb3JcXFwiIG5nLWNsYXNzPVxcXCJmb29kLmNsYXNzTmFtZVxcXCI+e3sgZm9vZC52YWx1ZXMucHJvdCB9fTwvdGQ+XFxyXFxuICAgICAgICA8dGQgY2xhc3M9XFxcImZhdC1jb2xvclxcXCIgbmctY2xhc3M9XFxcImZvb2QuY2xhc3NOYW1lXFxcIj57eyBmb29kLnZhbHVlcy5mYXQgfX08L3RkPlxcclxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJrYWxsLWNvbG9yXFxcIiBuZy1jbGFzcz1cXFwiZm9vZC5jbGFzc05hbWVcXFwiPnt7IGZvb2QudmFsdWVzLmthbGwgfX08L3RkPlxcclxcbiAgICA8L3RyPlxcclxcbjwvdGFibGU+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcInRhYmxlLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL3RhYmxlLW1vZHVsZS90YWJsZS1jb21wb25lbnQvdGVtcGxhdGUvdGFibGUtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDI3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBzdG9yYWdlVGFibGVUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUvc3RvcmFnZS10YWJsZS10ZW1wbGF0ZS5odG1sJyk7XHJcblxyXG5jb25zdCBzdG9yYWdlVGFibGUgPSB7XHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIG15Rm9vZHM6ICc8JyxcclxuICAgICAgICByZW1vdmVNeUZvb2Q6ICcmJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2hvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5teUZvb2RzKS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogc3RvcmFnZVRhYmxlVGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc3RvcmFnZVRhYmxlO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC90YWJsZS1tb2R1bGUvc3RvcmFnZS10YWJsZS1jb21wb25lbnQvc3RvcmFnZS10YWJsZS1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjx0YWJsZSBjbGFzcz1cXFwidGJcXFwiIG5nLWlmPVxcXCIkY3RybC5zaG93KClcXFwiPlxcbiAgICA8Y2FwdGlvbiBjbGFzcz1cXFwidGItdGl0bGVcXFwiPtCU0L7QsdCw0LLQu9C10L3Ri9C1INC/0YDQvtC00YPQutGC0Ys8L2NhcHRpb24+XFxuICAgIDx0cj5cXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwidGQtbmFtZSBuYW1lLWNvbG9yIGNvbG9yXFxcIj7QndCw0LjQvNC10L3QvtCy0LDQvdC40LUg0L/RgNC+0LTRg9C60YLQsDwvdGQ+XFxuICAgICAgICA8dGQgY2xhc3M9XFxcInBvcnRpb24tY29sb3IgY29sb3JcXFwiPtCf0L7RgNGG0LjRjzwvdGQ+XFxuICAgICAgICA8dGQgY2xhc3M9XFxcImNhcmJvaHlkLWNvbG9yIGNvbG9yXFxcIj7Qo9Cz0LvQtdCy0L7QtNGLPC90ZD5cXG4gICAgICAgIDx0ZCBjbGFzcz1cXFwicHJvdC1jb2xvciBjb2xvclxcXCI+0JHQtdC70LrQuDwvdGQ+XFxuICAgICAgICA8dGQgY2xhc3M9XFxcImZhdC1jb2xvciBjb2xvclxcXCI+0JbQuNGA0Ys8L3RkPlxcbiAgICAgICAgPHRkIGNsYXNzPVxcXCJrYWxsLWNvbG9yIGNvbG9yXFxcIj7QmtCw0LvQvtGA0LjQuDwvdGQ+XFxuICAgIDwvdHI+XFxuXFxuICAgIDx0ciBjbGFzcz1cXFwibXktZm9vZFxcXCIgbmctcmVwZWF0PVxcXCIoZm9vZE5hbWUsIHZhbHVlcykgaW4gJGN0cmwubXlGb29kc1xcXCIgbmctY2xpY2s9XFxcIiRjdHJsLnJlbW92ZU15Rm9vZCh7bmFtZTogZm9vZE5hbWV9KVxcXCI+XFxuICAgICAgICA8dGQgY2xhc3M9XFxcInRkLW5hbWVcXFwiPnt7IGZvb2ROYW1lIH19PC90ZD5cXG4gICAgICAgIDx0ZD57eyB2YWx1ZXNbMF0gfX08L3RkPlxcbiAgICAgICAgPHRkPnt7IHZhbHVlc1sxXSB9fTwvdGQ+XFxuICAgICAgICA8dGQ+e3sgdmFsdWVzWzJdIH19PC90ZD5cXG4gICAgICAgIDx0ZD57eyB2YWx1ZXNbM10gfX08L3RkPlxcbiAgICAgICAgPHRkPnt7IHZhbHVlc1s0XSB9fTwvdGQ+XFxuICAgIDwvdHI+XFxuPC90YWJsZT5cIjtcbm5nTW9kdWxlLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGMpe2MucHV0KFwic3RvcmFnZS10YWJsZS10ZW1wbGF0ZS5odG1sXCIsdjEpfV0pO1xubW9kdWxlLmV4cG9ydHM9djE7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL2pzL2FwcC90YWJsZS1tb2R1bGUvc3RvcmFnZS10YWJsZS1jb21wb25lbnQvdGVtcGxhdGUvc3RvcmFnZS10YWJsZS10ZW1wbGF0ZS5odG1sXG4gKiogbW9kdWxlIGlkID0gMjlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAyKSByZXR1cm4gJyc7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9saW1pdHMtZmlsdGVyLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkaHR0cCwgJHdpbmRvdykge1xyXG4gICAgdmFyIGJhc2UgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRGb29kQmFzZSgpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcuL0pTT05kYXRhL2Zvb2QuanNvbicpLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgdmFyIGJhc2UgPSB7fSwga2V5cyA9IFtdO1xyXG4gICAgICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UubXlGb29kcykgZGF0YS5kYXRhLnB1c2goSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5teUZvb2RzKSk7XHJcblxyXG4gICAgICAgICAgICBkYXRhLmRhdGEuZm9yRWFjaCgob2JqKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gb2JqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ25hbWUnKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICBiYXNlW2tleV0gPSBvYmpba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGJhc2UpLmZvckVhY2goKGtleSkgPT4ga2V5cy5wdXNoKHtmb29kTmFtZToga2V5fSkpO1xyXG4gICAgICAgICAgICBiYXNlLmtleXMgPSBrZXlzO1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGdldEZvb2RCYXNlKCkudGhlbigoZGF0YSkgPT4gYmFzZS5mb29kcyA9IGRhdGEpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFkZFRvQmFzZShuYW1lLCB2YWx1ZXMpIHtcclxuICAgICAgICBiYXNlLmZvb2RzW25hbWVdID0gdmFsdWVzO1xyXG4gICAgICAgIGJhc2UuZm9vZHMua2V5cy5wdXNoKHtmb29kTmFtZTogbmFtZX0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbW92ZUZyb21CYXNlKG5hbWUpIHtcclxuICAgICAgICBkZWxldGUgYmFzZS5mb29kc1tuYW1lXTtcclxuXHJcbiAgICAgICAgYmFzZS5mb29kcy5rZXlzLmZvckVhY2goKG9iaiwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgaWYgKG9iai5mb29kTmFtZSA9PT0gbmFtZSkgYmFzZS5mb29kcy5rZXlzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRGb29kT2JqZWN0cygpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcuL0pTT05kYXRhL2Zvb2QuanNvbicpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0RGF5VGltZXNEYXRhKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy4vSlNPTmRhdGEvZGF5LXRpbWVzLWRhdGEuanNvbicpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0TGltaXRzRGF0YShkaWV0LCBwaGFzZSkge1xyXG4gICAgICAgIGxldCBwYXRoID0gJy4vSlNPTmRhdGEvbGltaXRzLWRhdGEvJyArIGRpZXQgKyAnLXBoYXNlJyArIHBoYXNlICsgJy5qc29uJztcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KHBhdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFRhYmxlRGF0YSgpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcuL0pTT05kYXRhL2Zvb2QuanNvbicpXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGFibGVEYXRhID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0YS5kYXRhLmZvckVhY2goKG9iaikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdPYmogPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb29kczogW11cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQgPSAyMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIG9iaikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAnbmFtZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld09iai50aXRsZSA9IG9iai5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjb3VudCA+PSAyMCApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0aXRsZURhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnY29sb3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAn0J3QsNC40LzQtdC90L7QstCw0L3QuNC1INC/0YDQvtC00YPQutGC0LAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3J0aW9uOiAn0J/QvtGA0YbQuNGPJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyYm9oeWQ6ICfQo9Cz0LvQtdCy0L7QtNGLJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdDogJ9CR0LXQu9C60LgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYXQ6ICfQltC40YDRiycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGthbGw6ICfQmtCw0LvQvtGA0LjQuCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3T2JqLmZvb2RzLnB1c2godGl0bGVEYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZm9vZCA9IHtjbGFzc05hbWU6ICcnLCB2YWx1ZXM6IHt9fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9vZC52YWx1ZXMubmFtZSA9IGtleTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9vZC52YWx1ZXMucG9ydGlvbiA9IG9ialtrZXldWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5jYXJib2h5ZCA9IG9ialtrZXldWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5wcm90ID0gb2JqW2tleV1bMl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvb2QudmFsdWVzLmZhdCA9IG9ialtrZXldWzNdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb29kLnZhbHVlcy5rYWxsID0gb2JqW2tleV1bNF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld09iai5mb29kcy5wdXNoKGZvb2QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGFibGVEYXRhLnB1c2gobmV3T2JqKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB0YWJsZURhdGE7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVEYXRhICYmICFjb25maXJtKCfQl9Cw0LPRgNGD0LfQuNGC0Ywg0YHQvtGF0YDQsNC90LXQvdC40Y8/JykpIHtcclxuICAgICAgICBpZiAoY29uZmlybSgn0KPQtNCw0LvQuNGC0Ywg0LjQvNC10Y7RidC40LXRgdGPINGB0L7RhdGA0LDQvdC10L3QuNGPPycpKSB7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3NhdmVEYXRhJyk7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3NhdmVkTGltaXRzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgYmFzZTogYmFzZSxcclxuICAgICAgICBhZGRUb0Jhc2U6IGFkZFRvQmFzZSxcclxuICAgICAgICByZW1vdmVGcm9tQmFzZTogcmVtb3ZlRnJvbUJhc2UsXHJcbiAgICAgICAgZ2V0Rm9vZEJhc2U6IGdldEZvb2RCYXNlLFxyXG4gICAgICAgIGdldEZvb2RPYmplY3RzOiBnZXRGb29kT2JqZWN0cyxcclxuICAgICAgICBnZXRUYWJsZURhdGE6IGdldFRhYmxlRGF0YSxcclxuICAgICAgICBnZXREYXlUaW1lc0RhdGE6IGdldERheVRpbWVzRGF0YSxcclxuICAgICAgICBnZXRMaW1pdHNEYXRhOiBnZXRMaW1pdHNEYXRhXHJcbiAgICB9O1xyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9kYXRhLXNlcnZpY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YVNlcnZpY2UpIHtcbiAgICB2YXIgZm9vZCA9IGRhdGFTZXJ2aWNlLmJhc2U7XG5cblxuICAgIGZ1bmN0aW9uIGZvb2RBZGRWYWxpZGF0aW9uKG5hbWUsIHBvcnRpb24pIHtcbiAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgICBhbGVydCgn0JLQstC10LTQuNGC0LUg0L3QsNC30LLQsNC90LjQtSDQv9GA0L7QtNGD0LrRgtCwJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoIWZvb2QuZm9vZHNbbmFtZV0pIHtcbiAgICAgICAgICAgIGFsZXJ0KCfQotCw0LrQvtCz0L4g0L/RgNC+0LTRg9C60YLQsCDQvdC10YIg0LIg0LHQsNC30LUuINCh0L4g0YHQv9C40YHQutC+0Lwg0L/RgNC+0LTRg9C60YLQvtCyINCS0Ysg0LzQvtC20LXRgtC1INC+0LfQvdCw0LrQvtC80LjRgtGM0YHRjyDQsiDRgNCw0LfQtNC10LvQtScgK1xuICAgICAgICAgICAgICAgICdcItCi0LDQsdC70LjRhtGLXCIsINC70LjQsdC+INC00L7QsdCw0LLQuNGC0Ywg0YHQstC+0Lkg0L/RgNC+0LTRg9C60YInKTtcbiAgICAgICAgfSBlbHNlIGlmICghcG9ydGlvbikge1xuICAgICAgICAgICAgYWxlcnQoJ9CS0LLQtdC00LjRgtC1INC/0L7RgNGG0LjRjiDQsiDQs9GA0LDQvNC80LDRhScpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzTmFOKCtwb3J0aW9uKSkge1xuICAgICAgICAgICAgYWxlcnQoJ9CSINC/0L7Qu9C1IFwi0J/QvtGA0YbQuNGPXCIg0LLQstC10LTQuNGC0LUg0YfQuNGB0LvQvicpO1xuICAgICAgICB9ZWxzZSBpZiAocG9ydGlvbiA8PSAwKSB7XG4gICAgICAgICAgICBhbGVydCgn0JLQstC10LTQuNGC0LUg0YfQuNGB0LvQviDQsdC+0LvRjNGI0LUg0YfQtdC8IDAnKVxuICAgICAgICB9IGVsc2UgeyByZXR1cm4gdHJ1ZX1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2YWxpZGF0ZUxpbWl0c0Nob29zZShkaWV0MSwgZGlldDIsIHBoYXNlQ2xhc3MpIHtcbiAgICAgICAgaWYoIChkaWV0MSB8fCBkaWV0MikgJiYgcGhhc2VDbGFzcyAhPT0gJ3N0YXJ0JykgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkTXlGb29kVmFsaWRhdGlvbihuYW1lLCB2YWx1ZXMpIHtcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgICAgIGFsZXJ0KCfQktCy0LXQtNC40YLQtSDQvdCw0LjQvNC10L3QvtCy0LDQvdC40LUg0L/RgNC+0LTRg9C60YLQsCcpO1xuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlcy5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzTmFOKHZhbHVlKXx8IHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCfQl9C90LDRh9C10L3QuNGPINC00L7Qu9C20L3RiyDQsdGL0YLRjCDRh9C40YHQu9Cw0LzQuCDRgdC+INC30L3QsNGH0LXQvdC40LXQvCDQsdC+0LvRjNGI0LjQvCDQuNC70Lgg0YDQsNCy0L3Ri9C8INC90YPQu9GOJyk7XG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGZvb2RBZGRWYWxpZGF0aW9uOiBmb29kQWRkVmFsaWRhdGlvbixcbiAgICAgICAgdmFsaWRhdGVMaW1pdHNDaG9vc2U6IHZhbGlkYXRlTGltaXRzQ2hvb3NlLFxuICAgICAgICBhZGRNeUZvb2RWYWxpZGF0aW9uOiBhZGRNeUZvb2RWYWxpZGF0aW9uXG4gICAgfVxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvc2VydmljZXMvdmFsaWRhdGlvbi1zZXJ2aWNlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhU2VydmljZSkge1xyXG4gICAgdmFyIGZvb2QgPSBkYXRhU2VydmljZS5iYXNlO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZVZhbHVlcyhmb29kTmFtZSwgcG9ydGlvbikge1xyXG4gICAgICAgIGxldCB2YWx1ZXMgPSBmb29kLmZvb2RzW2Zvb2ROYW1lXTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBuYW1lOiBmb29kTmFtZSxcclxuICAgICAgICAgICAgcG9ydGlvbjogcG9ydGlvbixcclxuICAgICAgICAgICAgY2FyYm9oeWQ6IE1hdGgucm91bmQodmFsdWVzWzFdL3ZhbHVlc1swXSpwb3J0aW9uKSxcclxuICAgICAgICAgICAgcHJvdDogTWF0aC5yb3VuZCh2YWx1ZXNbMl0vdmFsdWVzWzBdKnBvcnRpb24pLFxyXG4gICAgICAgICAgICBmYXQ6IE1hdGgucm91bmQodmFsdWVzWzNdL3ZhbHVlc1swXSpwb3J0aW9uKSxcclxuICAgICAgICAgICAga2FsbDogTWF0aC5yb3VuZCh2YWx1ZXNbNF0vdmFsdWVzWzBdKnBvcnRpb24pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY2FsY3VsYXRlVmFsdWVzOiBjYWxjdWxhdGVWYWx1ZXNcclxuICAgIH1cclxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvc2VydmljZXMvY2FsY3VsYXRpb24tc2VydmljZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YVNlcnZpY2UpIHtcclxuICAgIHZhciBsaW1pdHNEYXRhID0ge307XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0TGltaXRzKGRpZXQsIHBoYXNlKSB7XHJcbiAgICAgICAgZGF0YVNlcnZpY2UuZ2V0TGltaXRzRGF0YShkaWV0LCBwaGFzZSlcclxuICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IGxpbWl0c0RhdGEubGltaXRzID0gZGF0YS5kYXRhKVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBjbGVhckxpbWl0cygpIHtcclxuICAgICAgICBpZiAobGltaXRzRGF0YS5saW1pdHMpIGRlbGV0ZSBsaW1pdHNEYXRhLmxpbWl0c1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbGltaXRzRGF0YTogbGltaXRzRGF0YSxcclxuICAgICAgICBzZXRMaW1pdHM6IHNldExpbWl0cyxcclxuICAgICAgICBjbGVhckxpbWl0czogY2xlYXJMaW1pdHNcclxuICAgIH1cclxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvc2VydmljZXMvbGltaXRzLXNlcnZpY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCB2aWV3VGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL3ZpZXctdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgdmlldyA9IHtcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIChkYXRhU2VydmljZSwgbGltaXRzU2VydmljZSwgJHdpbmRvdywgJHN0YXRlUGFyYW1zLCAkc3RhdGUsICR0aW1lb3V0KSB7XHJcbiAgICAgICAgY29uc3QgZW1wdHkgPSB7XHJcbiAgICAgICAgICAgIGVtcHR5OiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lOiAnLS0tLS0tLS0tJyxcclxuICAgICAgICAgICAgcG9ydGlvbjogJy0tLScsXHJcbiAgICAgICAgICAgIGNhcmJvaHlkOiAnLS0tJyxcclxuICAgICAgICAgICAgcHJvdDogJy0tLScsXHJcbiAgICAgICAgICAgIGZhdDogJy0tLScsXHJcbiAgICAgICAgICAgIGthbGw6ICctLS0nXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5iYXNlID0gZGF0YVNlcnZpY2UuYmFzZTtcclxuICAgICAgICB0aGlzLnZpZXdEYXRhID0ge1xyXG4gICAgICAgICAgICBsaW1pdHNEYXRhOiBsaW1pdHNTZXJ2aWNlLmxpbWl0c0RhdGFcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLnNhdmVEYXRhKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5zYXZlRGF0YSk7XHJcbiAgICAgICAgICAgIHRoaXMudmlld0RhdGEuZGF5VGltZXMgPSBkYXRhLmRheXNEYXRhO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsID0gZGF0YS5yZXN1bHRGaW5hbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkYXRhU2VydmljZS5nZXREYXlUaW1lc0RhdGEoKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHRoaXMudmlld0RhdGEuZGF5VGltZXMgPSBkYXRhLmRhdGEpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52aWV3RGF0YS5yZXN1bHRGaW5hbCA9IHtcclxuICAgICAgICAgICAgICAgIGNhcmJvaHlkOiAwLFxyXG4gICAgICAgICAgICAgICAgcHJvdDogMCxcclxuICAgICAgICAgICAgICAgIGZhdDogMCxcclxuICAgICAgICAgICAgICAgIGthbGw6IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHRoaXMuY29tcGFyZSA9IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnZpZXdEYXRhLmxpbWl0c0RhdGEubGltaXRzKSByZXR1cm47XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZpZXdEYXRhLmxpbWl0c0RhdGEubGltaXRzW1wi0JjRgtC+0LNcIl1ba2V5XSA8IHRoaXMudmlld0RhdGEucmVzdWx0RmluYWxba2V5XSkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuYWRkRm9vZCA9IGZ1bmN0aW9uIChkYXlUaW1lSWQsIGZvb2QpIHtcclxuICAgICAgICAgICAgbGV0IGNvbGxlY3Rpb24gPSB0aGlzLnZpZXdEYXRhLmRheVRpbWVzW2RheVRpbWVJZF0uZm9vZHM7XHJcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9uWzBdLmVtcHR5KSBjb2xsZWN0aW9uLnNwbGljZSgwLCAxKTtcclxuXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb24ucHVzaChmb29kKTtcclxuICAgICAgICAgICAgdGhpcy5jYWxjUmVzdWx0KGRheVRpbWVJZCwgZm9vZCwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuX2xhc3RTYXZlSWQpICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ19sYXN0U2F2ZUlkJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVGb29kID0gZnVuY3Rpb24gKGRheVRpbWVJZCwgZm9vZCkge1xyXG4gICAgICAgICAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMudmlld0RhdGEuZGF5VGltZXNbZGF5VGltZUlkXS5mb29kcztcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gY29sbGVjdGlvbi5pbmRleE9mKGZvb2QpO1xyXG4gICAgICAgICAgICBjb2xsZWN0aW9uLnNwbGljZShpbmRleCwgMSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbi5sZW5ndGggPT09IDApIGNvbGxlY3Rpb24ucHVzaChlbXB0eSk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsY1Jlc3VsdChkYXlUaW1lSWQsIGZvb2QsIGZhbHNlKTtcclxuICAgICAgICAgICAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLl9sYXN0U2F2ZUlkKSAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdfbGFzdFNhdmVJZCcpO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICB0aGlzLmNhbGNSZXN1bHQgPSBmdW5jdGlvbiAoZGF5VGltZUlkLCBmb29kLCBib29sKSB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB0aGlzLnZpZXdEYXRhLmRheVRpbWVzW2RheVRpbWVJZF0ucmVzdWx0O1xyXG4gICAgICAgICAgICBpZiAoYm9vbCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldICs9IGZvb2Rba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsW2tleV0gKz0gZm9vZFtrZXldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldIC09IGZvb2Rba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdEYXRhLnJlc3VsdEZpbmFsW2tleV0gLT0gZm9vZFtrZXldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IHZpZXdUZW1wbGF0ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9tYWluLW1vZHVsZS92aWV3LWNvbXBvbmVudC92aWV3LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGxlZnQtc2lkZS1tZW51PjwvbGVmdC1zaWRlLW1lbnU+XFxyXFxuPGRheXRpbWUtY2hvb3NlPjwvZGF5dGltZS1jaG9vc2U+XFxyXFxuXFxyXFxuPGRpdiBjbGFzcz1cXFwibWFpbi12aWV3XFxcIiB1aS12aWV3PlxcclxcblxcclxcbjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJ2aWV3LXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vanMvYXBwL21haW4tbW9kdWxlL3ZpZXctY29tcG9uZW50L3RlbXBsYXRlL3ZpZXctdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDc3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRheXRpbWUpIHtcclxuICAgICAgICBzd2l0Y2ggKGRheXRpbWUpIHtcclxuICAgICAgICAgICAgY2FzZSAnYnJlYWtmYXN0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2ZpcnN0LXNuYWNrJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2Rpbm5lcic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdzZWNvbmQtc25hY2snOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZXZlbmluZy1tZWFsJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9pbmRleC1zZXJ2aWNlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBhY3RpdmVDbGFzcyA9ICcnO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNldENsYXNzTmFtZShjbGFzc05hbWUpIHtcclxuICAgICAgICBhY3RpdmVDbGFzcyA9ICdhY3RpdmUtJyArIGNsYXNzTmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDbGFzc05hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIGFjdGl2ZUNsYXNzXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRDbGFzc05hbWU6IGdldENsYXNzTmFtZSxcclxuICAgICAgICBzZXRDbGFzc05hbWU6IHNldENsYXNzTmFtZVxyXG4gICAgfVxyXG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGpzL2FwcC9zZXJ2aWNlcy9hY3RpdmUtY2xhc3Mtc2VydmljZS5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHRpbWVvdXQsIHZhbGlkYXRpb25TZXJ2aWNlLCBsaW1pdHNTZXJ2aWNlLCAkd2luZG93KSB7XHJcbiAgICB2YXIgZGlldHMgPSB7XHJcbiAgICAgICAgY2FyYm9oeWRyYXRlczogZmFsc2UsXHJcbiAgICAgICAgcHJvdGVpbnM6IGZhbHNlXHJcbiAgICB9LFxyXG4gICAgICAgIGNsYXNzTmFtZSA9IHtuYW1lOiAnc3RhcnQnfTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gc2V0RGlldChkaWV0KSB7XHJcbiAgICAgICAgaWYgKGRpZXRzW2RpZXRdKSB7XHJcbiAgICAgICAgICAgIGRpZXRzW2RpZXRdID0gZmFsc2U7XHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IGRpZXRzW2RpZXRdID0gdHJ1ZSwgMCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGlldHMuY2FyYm9oeWRyYXRlcyA9IGRpZXQgPT09ICdjYXJib2h5ZHJhdGVzJztcclxuICAgICAgICBkaWV0cy5wcm90ZWlucyA9IGRpZXQgPT09ICdwcm90ZWlucyc7XHJcbiAgICAgICAgaWYgKHZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlTGltaXRzQ2hvb3NlKGRpZXRzLmNhcmJvaHlkcmF0ZXMsIGRpZXRzLnByb3RlaW5zLCBjbGFzc05hbWUubmFtZSkpIHNldExpbWl0cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldENsYXNzTmFtZShwaGFzZUlkKSB7XHJcbiAgICAgICAgY2xhc3NOYW1lLm5hbWUgPSAnYWN0aXZlJyArIHBoYXNlSWQ7XHJcbiAgICAgICAgaWYgKHZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlTGltaXRzQ2hvb3NlKGRpZXRzLmNhcmJvaHlkcmF0ZXMsIGRpZXRzLnByb3RlaW5zLCBjbGFzc05hbWUubmFtZSkpIHNldExpbWl0cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldExpbWl0cygpIHtcclxuICAgICAgICBsZXQgZGlldCA9IGRpZXRzLmNhcmJvaHlkcmF0ZXMgPyAnY2FyYm9oeWRyYXRlcycgOiAncHJvdGVpbnMnLFxyXG4gICAgICAgICAgICBwaGFzZSA9IGNsYXNzTmFtZS5uYW1lLnNsaWNlKC0xKTtcclxuICAgICAgICBsaW1pdHNTZXJ2aWNlLnNldExpbWl0cyhkaWV0LCBwaGFzZSk7XHJcblxyXG4gICAgICAgICR3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2F2ZWRMaW1pdHMgPSBKU09OLnN0cmluZ2lmeSh7ZGlldDogZGlldCwgcGhhc2VJZDogcGhhc2V9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZXNldENob29zZSgpIHtcclxuICAgICAgICBkaWV0cy5jYXJib2h5ZHJhdGVzID0gZmFsc2U7XHJcbiAgICAgICAgZGlldHMucHJvdGVpbnMgPSBmYWxzZTtcclxuICAgICAgICBjbGFzc05hbWUubmFtZSA9ICdzdGFydCc7XHJcblxyXG4gICAgICAgIGxpbWl0c1NlcnZpY2UuY2xlYXJMaW1pdHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZWRMaW1pdHMpIHtcclxuICAgICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2F2ZWRMaW1pdHMpO1xyXG4gICAgICAgIHNldERpZXQoZGF0YS5kaWV0KTtcclxuICAgICAgICBzZXRDbGFzc05hbWUoZGF0YS5waGFzZUlkKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZGlldHM6IGRpZXRzLFxyXG4gICAgICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lLFxyXG4gICAgICAgIHNldERpZXQ6IHNldERpZXQsXHJcbiAgICAgICAgc2V0Q2xhc3NOYW1lOiBzZXRDbGFzc05hbWUsXHJcbiAgICAgICAgc2V0TGltaXRzOiBzZXRMaW1pdHMsXHJcbiAgICAgICAgcmVzZXRDaG9vc2U6IHJlc2V0Q2hvb3NlXHJcbiAgICB9XHJcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL3NlcnZpY2VzL2RpZXQtY2hvb3NlLXNlcnZpY2UuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBob21lUGFnZVRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9ob21lLXBhZ2UtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgaG9tZVBhZ2UgPSB7XHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IGhvbWVQYWdlVGVtcGxhdGVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gaG9tZVBhZ2U7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKioganMvYXBwL21haW4tbW9kdWxlL2hvbWUtcGFnZS1tb2R1bGUvaG9tZS1wYWdlLWNvbXBvbmVudC5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHJlc3VsdFRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS9yZXN1bHQtdGVtcGxhdGUuaHRtbCcpO1xyXG5cclxuY29uc3QgcmVzdWx0ID0ge1xyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICByZXN1bHQ6ICc8J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGxpbWl0c1NlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLmxpbWl0cyA9IGxpbWl0c1NlcnZpY2UubGltaXRzRGF0YTtcclxuXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IHJlc3VsdFRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlc3VsdDtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBqcy9hcHAvZGlhcnktbW9kdWxlL3Jlc3VsdC1jb21wb25lbnQvcmVzdWx0LWNvbXBvbmVudC5qc1xuICoqLyIsInZhciBhbmd1bGFyPXdpbmRvdy5hbmd1bGFyLG5nTW9kdWxlO1xudHJ5IHtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShbXCJuZ1wiXSl9XG5jYXRjaChlKXtuZ01vZHVsZT1hbmd1bGFyLm1vZHVsZShcIm5nXCIsW10pfVxudmFyIHYxPVwiPGRpdiBjbGFzcz1cXFwicmVzdWx0XFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwidGl0bGVcXFwiPtCY0YLQvtCzINC00L3RjzwvZGl2PlxcclxcbjwvZGl2PlwiO1xubmdNb2R1bGUucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYyl7Yy5wdXQoXCJyZXN1bHQtdGVtcGxhdGUuaHRtbFwiLHYxKX1dKTtcbm1vZHVsZS5leHBvcnRzPXYxO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9qcy9hcHAvZGlhcnktbW9kdWxlL3Jlc3VsdC1jb21wb25lbnQvdGVtcGxhdGUvcmVzdWx0LXRlbXBsYXRlLmh0bWxcbiAqKiBtb2R1bGUgaWQgPSAxMDJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQ3RDQTs7Ozs7O0FDQUE7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBU0E7Ozs7Ozs7Ozs7Ozs7OztBQ1RBO0FBQ0E7OztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWEE7QUFhQTtBQUNBOztBQWRBO0FBaUJBO0FBQ0E7QUFDQTtBQUNBOztBQXBCQTtBQUNBO0FBeUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBRkE7QUFPQTtBQVBBO0FBREE7QUFDQTtBQVdBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUZBO0FBQUE7QUFEQTtBQUNBO0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUlBO0FBREE7QUFJQTtBQUpBO0FBSkE7QUFEQTtBQUNBO0FBYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFEQTtBQUNBO0FBUUE7QUFDQTtBQUNBO0FBREE7QUFEQTtBQUNBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFEQTtBQUdBO0FBQ0E7QUFEQTtBQUhBO0FBQ0E7QUFPQTtBQVpBO0FBREE7QUFDQTs7QUFyRUE7QUF1RkE7QUFDQTtBQUNBO0FBSEE7QUFDQTs7QUF2RkE7QUE4RkE7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBREE7QUFJQTtBQUpBO0FBQ0E7QUFNQTtBQUNBO0FBREE7QUFJQTtBQUpBO0FBUkE7QUFDQTtBQWVBO0FBQ0E7QUFDQTtBQURBO0FBREE7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBTkE7QUFDQTtBQVFBOztBQUVBO0FBRUE7QUFEQTtBQUhBO0FBQ0E7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSEE7QUFRQTtBQVJBO0FBVUE7QUFaQTtBQUNBO0FBY0E7QUFDQTs7O0FBREE7QUFLQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFEQTtBQUtBO0FBTEE7QUFPQTtBQW5CQTtBQUNBO0FBcUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUhBO0FBQ0E7QUFPQTtBQUNBO0FBQ0E7O0FBRUE7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQURBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBRkE7QUFTQTtBQUNBO0FBQ0E7QUFEQTtBQUZBO0FBT0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBVEE7QUFDQTtBQWFBO0FBQ0E7QUFDQTtBQURBO0FBREE7QUEzQkE7QUFsQkE7QUFDQTtBQW9EQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7O0FBRkE7O0FBQUE7QUFDQTtBQVNBO0FBVkE7QUFEQTtBQUNBO0FBY0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUtBO0FBQ0E7QUFEQTtBQUNBO0FBSUE7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBREE7QUFDQTtBQUtBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUlBO0FBSkE7QUFGQTtBQUNBO0FBU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBTEE7QUFPQTtBQVJBO0FBVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBRkE7QUFOQTtBQUZBO0FBZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUZBO0FBTkE7QUFjQTtBQUNBO0FBQ0E7QUFGQTtBQURBO0FBZkE7QUFzQkE7QUFDQTs7O0FBR0E7QUFIQTtBQU1BO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFWQTtBQURBOzs7O0FBa0JBO0FBQ0E7QUFEQTtBQWxCQTtBQURBOzs7QUEwQkE7QUFIQTtBQXpFQTtBQUNBO0FBK0VBO0FBQ0E7O0FBRUE7QUFDQTtBQURBO0FBR0E7QUFDQTtBQU5BO0FBREE7QUFDQTtBQVlBOztBQUVBO0FBQ0E7QUFEQTtBQUNBOztBQUhBO0FBUUE7QUFEQTtBQUdBO0FBQ0E7QUFEQTtBQUlBO0FBQ0E7QUFEQTtBQUpBO0FBVkE7QUFDQTtBQW1CQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBYkE7QUFDQTtBQWlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FBTkE7QUFDQTtBQWVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUhBO0FBQ0E7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBQ0E7QUFLQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBREE7QUFSQTtBQVlBO0FBbkJBO0FBQ0E7QUFxQkE7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7QUFNQTtBQVZBO0FBQ0E7QUFZQTs7QUFFQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUhBO0FBS0E7QUFDQTtBQVJBO0FBREE7QUFhQTtBQURBO0FBR0E7QUFIQTtBQWpCQTtBQUNBO0FBdUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFwQkE7QUFIQTtBQWdDQTtBQWhDQTtBQUNBO0FBa0NBO0FBR0E7QUFIQTtBQUtBO0FBREE7QUFHQTtBQUhBO0FBMUNBO0FBQ0E7QUFnREE7QUFDQTtBQUNBO0FBREE7QUFJQTtBQURBO0FBSUE7QUFKQTtBQUpBO0FBQ0E7QUFXQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFKQTtBQUNBO0FBVUE7QUFDQTtBQUdBO0FBSEE7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFEQTtBQUZBO0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBREE7QUFEQTtBQXBCQTtBQURBO0FBQ0E7QUE0QkE7QUFDQTtBQUNBO0FBREE7QUFEQTtBQUNBO0FBS0E7QUFDQTtBQURBO0FBQ0E7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQURBO0FBSUE7QUFKQTtBQU1BO0FBQ0E7QUFkQTtBQUNBO0FBZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFLQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFEQTtBQUdBO0FBYkE7QUFDQTs7QUFob0JBO0FBaXBCQTtBQURBO0FBQ0E7O0FBanBCQTtBQXNwQkE7QUFEQTtBQUNBOztBQXRwQkE7QUEycEJBO0FBREE7QUFDQTs7QUEzcEJBO0FBZ3FCQTtBQURBO0FBQ0E7O0FBaHFCQTtBQXFxQkE7QUFEQTtBQUNBOztBQXJxQkE7O0FBMnFCQTtBQUNBO0FBREE7QUFJQTtBQUpBO0FBRkE7QUFDQTtBQVNBO0FBQ0E7O0FBcHJCQTtBQXVyQkE7QUFDQTtBQUNBO0FBQ0E7O0FBMXJCQTtBQUNBOztBQURBO0FBZ3NCQTtBQUNBOztBQWpzQkE7QUFDQTs7QUFEQTtBQXVzQkE7QUFDQTtBQUZBO0FBdHNCQTtBQUNBO0FBMnNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFuQ0E7QUFxQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdBO0FBSkE7QUFNQTtBQVRBO0FBM0NBO0FBdHZCQTs7Ozs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBS0E7QUFDQTtBQUVBO0FBQ0E7QUFIQTtBQU1BO0FBQ0E7QUFQQTtBQVVBO0FBQ0E7QUFYQTtBQWNBO0FBQ0E7QUFmQTtBQURBO0FBQ0E7QUFtQkE7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQURBO0FBQ0E7QUFNQTs7Ozs7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBS0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFGQTtBQXZCQTtBQTRCQTtBQTdCQTtBQUNBO0FBK0JBOzs7Ozs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQVhBO0FBZ0JBO0FBakJBO0FBQ0E7QUFtQkE7Ozs7OztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU9BOzs7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBVkE7QUFZQTtBQWJBO0FBQ0E7QUFlQTs7Ozs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEE7QUFDQTtBQVNBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFSQTtBQUNBO0FBZ0JBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEE7QUFDQTtBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFQQTtBQUNBO0FBU0E7QUFDQTtBQURBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQURBO0FBTUE7QUFDQTtBQUNBO0FBRkE7QUFOQTtBQUZBO0FBaEVBO0FBK0VBO0FBaEZBO0FBQ0E7QUFrRkE7Ozs7OztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTs7QUFIQTtBQU1BO0FBQ0E7O0FBUEE7QUFDQTs7QUFEQTtBQWFBO0FBYkE7QUFDQTtBQWdCQTtBQUNBO0FBQ0E7QUFGQTtBQXhDQTtBQTZDQTtBQXJEQTtBQUNBO0FBdURBOzs7Ozs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBS0E7QUFWQTtBQUNBO0FBWUE7Ozs7OztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTs7QUFEQTtBQUlBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQU5BOztBQUhBO0FBYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBbEJBO0FBQ0E7QUFvQkE7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQURBO0FBQ0E7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBSkE7QUFEQTtBQVFBO0FBQ0E7QUFUQTtBQUNBO0FBV0E7QUFkQTtBQUNBO0FBZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQURBO0FBckRBO0FBNkRBO0FBbEVBO0FBQ0E7QUFvRUE7Ozs7OztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUtBOzs7Ozs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBO0FBRUE7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFKQTtBQUNBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBUkE7QUFmQTtBQTBCQTtBQTNCQTtBQUNBO0FBOEJBOzs7Ozs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVkE7QUFIQTtBQWdCQTtBQXBCQTtBQUNBO0FBc0JBOzs7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUdBO0FBUkE7QUFDQTtBQVVBOzs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQURBO0FBREE7QUFLQTtBQVZBO0FBQ0E7QUFZQTs7Ozs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTs7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQU1BO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFaQTtBQURBO0FBQ0E7QUFnQkE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBSEE7QUFDQTtBQU9BO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFOQTtBQUZBO0FBV0E7QUFDQTtBQWJBO0FBZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBNUJBO0FBQ0E7QUE4QkE7QUFyQ0E7QUFDQTtBQXVDQTtBQTNDQTtBQUZBO0FBQ0E7QUFnREE7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQURBO0FBQ0E7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFSQTtBQXhHQTs7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFEQTtBQUlBO0FBREE7QUFHQTtBQURBO0FBR0E7QUFEQTtBQUVBO0FBRkE7QUFWQTtBQUNBO0FBY0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQURBO0FBT0E7QUFkQTtBQUNBO0FBZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUF4Q0E7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFOQTtBQUZBO0FBQ0E7QUFXQTtBQUNBO0FBREE7QUFmQTs7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBRkE7QUFDQTtBQUtBO0FBQ0E7QUFEQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQWJBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBUkE7QUFDQTtBQWdCQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEE7QUFDQTtBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBREE7QUFNQTtBQUNBO0FBQ0E7QUFGQTtBQU5BO0FBRkE7QUE3REE7QUE2RUE7QUE5RUE7QUFDQTtBQWdGQTs7Ozs7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQU5BO0FBUUE7QUFDQTtBQVRBO0FBV0E7QUFDQTtBQVpBO0FBY0E7QUFDQTtBQWZBO0FBaUJBO0FBakJBO0FBREE7QUFEQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUZBO0FBWEE7Ozs7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQVJBO0FBQ0E7QUFVQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUxBO0FBQ0E7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU5BO0FBOUNBOzs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHQTtBQUpBO0FBQ0E7QUFNQTs7Ozs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFEQTtBQUlBO0FBUkE7QUFDQTtBQVVBOzs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OzsiLCJzb3VyY2VSb290IjoiIn0=