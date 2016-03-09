'use strict';

var menuTemplate = require('./template/menu-template.html');

const menu = {
    controller: function($timeout) {
        this.carbohydrates = false;
        this.proteins = false;

        this.setDiet = function(diet) {
            if(this[diet]) {
                this[diet] = false;
                $timeout(() => this[diet] = true, 0);
                return;
            }
            this.carbohydrates = diet === 'carbohydrates';
            this.proteins = diet === 'proteins'
        };


        this.className = 'start';


        this.setClassName = function(phaseId) {
            if (this.className !== 'start') return;
            this.className = 'active' + phaseId;
        };
        this.moveLeft = function() {
            let numb = +this.className.slice(-1);
            numb -= 1;
            if (!numb) numb = 3;
            this.className = 'active' + numb;
        };
        this.moveRight = function() {
            let numb = +this.className.slice(-1);
            numb += 1;
            if (numb > 3) numb = 1;
            this.className = 'active' + numb;
        }

    },
    template: menuTemplate
};

module.exports = menu;