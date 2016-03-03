'use strict';
const animate = require('angular-animate');

const diaryApp = angular.module('diary', ['ngAnimate']);

diaryApp.component('menu', require('./menu/menu-component'));