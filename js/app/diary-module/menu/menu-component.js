'use strict';

var menuTemplate = require('./template/menu-template.html');

const menu = {
    controller: function ($window, dietChoose) {
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