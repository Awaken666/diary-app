'use strict';
const autocomplite = require('angucomplete-alt');

const diaryApp = angular.module('diary', ['ngAnimate', 'angucomplete-alt']);

diaryApp.filter('limit', require('./services/limits-filter'));
diaryApp
    .factory('dataService', require('./services/data-service'))
    .factory('validationService', require('./services/validation-service'))
    .factory('calculationService', require('./services/calculation-service'))
    .factory('limitsService', require('./services/limits-service'));

diaryApp
    .component('menu', require('./menu/menu-component'))
    .component('mainView', require('./main-view/main-view-component'))
    .component('dayTime', require('./day-time/day-time-component'))
    .component('food', require('./food/food-component'))
    .component('saveMenu', require('./save-menu/save-menu-component'));

module.exports = diaryApp;