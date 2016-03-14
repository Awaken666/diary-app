'use strict';

const diaryModule = angular.module('diary', []);

diaryModule
    .component('menu', require('./menu/menu-component'))
    .component('mainView', require('./main-view/main-view-component'))
    .component('dayTime', require('./day-time/day-time-component'))
    .component('food', require('./food/food-component'))
    .component('saveMenu', require('./save-menu/save-menu-component'));

module.exports = diaryModule;