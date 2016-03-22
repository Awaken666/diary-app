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

	var index = angular.module('index', []);

	index.component('modal', __webpack_require__(2));
	index.factory('modal', __webpack_require__(4));

	module.exports = index;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var modalTemplate = __webpack_require__(3);

	var modal = {
	    controller: function controller(modal, $timeout) {
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

	        $timeout(function () {
	            modal.open({ title: 'Дневник питания', message: 'Пожалуйста, выберите версию' }, 'confirm').then(function () {
	                return document.location.href = './second-version';
	            }, function () {
	                return document.location.href = './first-version';
	            });
	        }, 0);
	    },
	    template: modalTemplate
	};

		module.exports = modal;

/***/ },
/* 3 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"modal-background\" ng-if=\"$ctrl.checkOpen()\"> <div class=\"window an\" ng-if=\"$ctrl.checkOpen()\"> <div class=\"title\">{{ $ctrl.modalViewData.data.title }}</div> <div class=\"message\">{{ $ctrl.modalViewData.data.message }}</div> <div class=\"buttons group\"> <div class=\"confirm\" ng-if=\"$ctrl.checkType('confirm')\"> <div class=\"reject\" ng-click=\"$ctrl.close()\">Версия <b>1</b></div> <div class=\"ok\" ng-click=\"$ctrl.close(true)\">Версия 2</div> </div> <div class=\"alert\" ng-if=\"$ctrl.checkType('alert')\" ng-click=\"$ctrl.close()\">Закрыть</div> </div> </div> </div>";
	ngModule.run(["$templateCache",function(c){c.put("modal-template.html",v1)}]);
	module.exports=v1;

/***/ },
/* 4 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIGM3NWUxYzQ4ZDk2MmE2ZDdkODI3Iiwid2VicGFjazovLy9hcHAvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL2FwcC9hcHAuanMiLCJ3ZWJwYWNrOi8vL2FwcC9tb2RhbC13aW5kb3ctY29tcG9uZW50L21vZGFsLXdpbmRvdy1jb21wb25lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vYXBwL21vZGFsLXdpbmRvdy1jb21wb25lbnQvdGVtcGxhdGUvbW9kYWwtdGVtcGxhdGUuaHRtbCIsIndlYnBhY2s6Ly8vYXBwL21vZGFsLXdpbmRvdy1jb21wb25lbnQvc2VydmljZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIGM3NWUxYzQ4ZDk2MmE2ZDdkODI3XG4gKiovIiwicmVxdWlyZSgnLi9hcHAnKTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiBhcHAvaW5kZXguanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBpbmRleCA9IGFuZ3VsYXIubW9kdWxlKCdpbmRleCcsIFtdKTtcclxuXHJcbmluZGV4LmNvbXBvbmVudCgnbW9kYWwnLCByZXF1aXJlKCcuL21vZGFsLXdpbmRvdy1jb21wb25lbnQvbW9kYWwtd2luZG93LWNvbXBvbmVudCcpKTtcclxuaW5kZXguZmFjdG9yeSgnbW9kYWwnLCByZXF1aXJlKCcuL21vZGFsLXdpbmRvdy1jb21wb25lbnQvc2VydmljZScpKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gaW5kZXg7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogYXBwL2FwcC5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IG1vZGFsVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlL21vZGFsLXRlbXBsYXRlLmh0bWwnKTtcclxuXHJcbmNvbnN0IG1vZGFsID0ge1xyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24obW9kYWwsICR0aW1lb3V0KSB7XHJcbiAgICAgICAgdGhpcy5tb2RhbFZpZXdEYXRhID0gbW9kYWwubW9kYWxWaWV3RGF0YTtcclxuICAgICAgICB0aGlzLmNoZWNrT3BlbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kYWwuZ2V0U3RhdGUoKSA9PT0gJ29wZW4nO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5jaGVja1R5cGUgPSBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2RhbC5nZXRUeXBlKCkgPT09IHR5cGU7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBtb2RhbC5nZXRUeXBlO1xyXG5cclxuICAgICAgICB0aGlzLmNsb3NlID0gbW9kYWwuY2xvc2U7XHJcblxyXG4gICAgICAgIHRoaXMuc3RvcFByb3BhZ2F0aW9uID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgbW9kYWwub3Blbih7dGl0bGU6ICfQlNC90LXQstC90LjQuiDQv9C40YLQsNC90LjRjycsIG1lc3NhZ2U6ICfQn9C+0LbQsNC70YPQudGB0YLQsCwg0LLRi9Cx0LXRgNC40YLQtSDQstC10YDRgdC40Y4nfSwgJ2NvbmZpcm0nKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gZG9jdW1lbnQubG9jYXRpb24uaHJlZiA9ICcuL3NlY29uZC12ZXJzaW9uJywgKCkgPT4gZG9jdW1lbnQubG9jYXRpb24uaHJlZiA9ICcuL2ZpcnN0LXZlcnNpb24nKTtcclxuICAgICAgICB9LCAwKVxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlOiBtb2RhbFRlbXBsYXRlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1vZGFsO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIGFwcC9tb2RhbC13aW5kb3ctY29tcG9uZW50L21vZGFsLXdpbmRvdy1jb21wb25lbnQuanNcbiAqKi8iLCJ2YXIgYW5ndWxhcj13aW5kb3cuYW5ndWxhcixuZ01vZHVsZTtcbnRyeSB7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoW1wibmdcIl0pfVxuY2F0Y2goZSl7bmdNb2R1bGU9YW5ndWxhci5tb2R1bGUoXCJuZ1wiLFtdKX1cbnZhciB2MT1cIjxkaXYgY2xhc3M9XFxcIm1vZGFsLWJhY2tncm91bmRcXFwiIG5nLWlmPVxcXCIkY3RybC5jaGVja09wZW4oKVxcXCI+IDxkaXYgY2xhc3M9XFxcIndpbmRvdyBhblxcXCIgbmctaWY9XFxcIiRjdHJsLmNoZWNrT3BlbigpXFxcIj4gPGRpdiBjbGFzcz1cXFwidGl0bGVcXFwiPnt7ICRjdHJsLm1vZGFsVmlld0RhdGEuZGF0YS50aXRsZSB9fTwvZGl2PiA8ZGl2IGNsYXNzPVxcXCJtZXNzYWdlXFxcIj57eyAkY3RybC5tb2RhbFZpZXdEYXRhLmRhdGEubWVzc2FnZSB9fTwvZGl2PiA8ZGl2IGNsYXNzPVxcXCJidXR0b25zIGdyb3VwXFxcIj4gPGRpdiBjbGFzcz1cXFwiY29uZmlybVxcXCIgbmctaWY9XFxcIiRjdHJsLmNoZWNrVHlwZSgnY29uZmlybScpXFxcIj4gPGRpdiBjbGFzcz1cXFwicmVqZWN0XFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuY2xvc2UoKVxcXCI+0JLQtdGA0YHQuNGPIDxiPjE8L2I+PC9kaXY+IDxkaXYgY2xhc3M9XFxcIm9rXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuY2xvc2UodHJ1ZSlcXFwiPtCS0LXRgNGB0LjRjyAyPC9kaXY+IDwvZGl2PiA8ZGl2IGNsYXNzPVxcXCJhbGVydFxcXCIgbmctaWY9XFxcIiRjdHJsLmNoZWNrVHlwZSgnYWxlcnQnKVxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmNsb3NlKClcXFwiPtCX0LDQutGA0YvRgtGMPC9kaXY+IDwvZGl2PiA8L2Rpdj4gPC9kaXY+XCI7XG5uZ01vZHVsZS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihjKXtjLnB1dChcIm1vZGFsLXRlbXBsYXRlLmh0bWxcIix2MSl9XSk7XG5tb2R1bGUuZXhwb3J0cz12MTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vYXBwL21vZGFsLXdpbmRvdy1jb21wb25lbnQvdGVtcGxhdGUvbW9kYWwtdGVtcGxhdGUuaHRtbFxuICoqIG1vZHVsZSBpZCA9IDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHEpIHtcclxuICAgIGxldCBzdGF0ZSA9ICdjbG9zZScsXHJcbiAgICAgICAgdHlwZSA9IG51bGwsXHJcbiAgICAgICAgZGVmZXI7XHJcblxyXG4gICAgbGV0IG1vZGFsVmlld0RhdGEgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRTdGF0ZSgpIHtcclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0VHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gdHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBvcGVuKGRhdGEsIG1vZGFsX3R5cGUpIHtcclxuICAgICAgICBtb2RhbFZpZXdEYXRhLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIHR5cGUgPSBtb2RhbF90eXBlO1xyXG4gICAgICAgIHN0YXRlID0gJ29wZW4nO1xyXG4gICAgICAgIGlmIChtb2RhbF90eXBlID09PSAnY29uZmlybScpIHtcclxuICAgICAgICAgICAgZGVmZXIgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xvc2UoYm9vbCkge1xyXG4gICAgICAgIGlmIChib29sKSB7XHJcbiAgICAgICAgICAgIGRlZmVyLnJlc29sdmUoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjb25maXJtJykge1xyXG4gICAgICAgICAgICBkZWZlci5yZWplY3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhdGUgPSAnY2xvc2UnO1xyXG4gICAgICAgIHR5cGUgPSBudWxsO1xyXG4gICAgICAgIGRlbGV0ZSBtb2RhbFZpZXdEYXRhLmRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBtb2RhbFZpZXdEYXRhOiBtb2RhbFZpZXdEYXRhLFxyXG4gICAgICAgIGdldFN0YXRlOiBnZXRTdGF0ZSxcclxuICAgICAgICBnZXRUeXBlOiBnZXRUeXBlLFxyXG4gICAgICAgIG9wZW46IG9wZW4sXHJcbiAgICAgICAgY2xvc2U6IGNsb3NlXHJcbiAgICB9XHJcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogYXBwL21vZGFsLXdpbmRvdy1jb21wb25lbnQvc2VydmljZS5qc1xuICoqLyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQ3RDQTs7Ozs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBRkE7QUFqQkE7QUFzQkE7QUF2QkE7QUFDQTtBQXlCQTs7Ozs7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBQ0E7QUFHQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFKQTtBQUNBO0FBU0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBUkE7QUFDQTtBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUxBO0FBcENBOzs7Iiwic291cmNlUm9vdCI6IiJ9
