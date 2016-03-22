'use strict';

const index = angular.module('index', []);

index.component('modal', require('./modal-window-component/modal-window-component'));
index.factory('modal', require('./modal-window-component/service'));

module.exports = index;