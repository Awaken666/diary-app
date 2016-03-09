'use strict';
const animate = require('angular-animate');
const autocomplite = require('angucomplete-alt');

const diaryApp = angular.module('diary', ['ngAnimate', 'angucomplete-alt']);

diaryApp.filter('value', require('./services/values-filter'));
diaryApp
    .factory('dataService', require('./services/data-service'))
    .factory('validationService', require('./services/validation-service'))
    .factory('calculationService', require('./services/calculation-service'));

diaryApp
    .component('menu', require('./menu/menu-component'))
    .component('mainView', require('./main-view/main-view-component'))
    .component('dayTime', require('./day-time/day-time-component'))
    .component('food', require('./food/food-component'));

module.exports = diaryApp;