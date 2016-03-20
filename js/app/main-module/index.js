'use strict';

const main = angular.module('main', ['ui.router']);

main
    .component('leftSideMenu', require('./left-side-menu-component/left-side-menu-component'))
    .component('daytimeChoose', require('./daytime-choose-component/daytime-choose-component'))
    .component('home', require('./home-page-module/home-page-component'))
    .component('view', require('./view-component/view-component'));

main.config(function($stateProvider) {
    $stateProvider
        .state('home', {
            url: '/home',
            template: '<home></home>'
        })
        .state('diary', {
            url: '/diary/:daytime',
            template: '<day-time base="$ctrl.base" daytimes="$ctrl.viewData.dayTimes" add="$ctrl.addFood(dayTimeId, food)" remove="$ctrl.removeFood(dayTimeId, food)" day-time-limits="$ctrl.viewData.limitsData"></day-time>'
        })
        .state('settings', {
            url: '/settings',
            template: '<menu></menu>'
        })
        .state('result', {
            url: '/result',
            template: '<result result="$ctrl.viewData.resultFinal"></result>'
        });
});

main.run(function($rootScope, activeClassService, $state, $stateParams) {
    $rootScope.$on('$stateChangeSuccess', () => {
        var className = $state.current.name === 'diary'? $stateParams.daytime : $state.current.name;
        activeClassService.setClassName(className);
    })
});

module.exports = main;

