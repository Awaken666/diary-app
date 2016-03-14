'use strict';
const autocomplite = require('angucomplete-alt');
const diaryModule = require('./diary-module');
const tableModule = require('./table-module');

const app = angular.module('app', ['diary', 'table', 'ngAnimate', 'angucomplete-alt']);

app.filter('limit', require('./services/limits-filter'));
app
    .factory('dataService', require('./services/data-service'))
    .factory('validationService', require('./services/validation-service'))
    .factory('calculationService', require('./services/calculation-service'))
    .factory('limitsService', require('./services/limits-service'));


module.exports = app;