'use strict';

const homePageTemplate = require('./template/home-page-template.html');

const homePage = {
    controller: function($timeout) {
        this.classDaytime = false;
        this.classMenu = false;

        $timeout(() => this.classDaytime = true, 0);
        $timeout(() => this.classMenu = true, 1000);
    },
    template: homePageTemplate
};

module.exports = homePage;