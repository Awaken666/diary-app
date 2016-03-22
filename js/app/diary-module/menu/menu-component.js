'use strict';

var menuTemplate = require('./template/menu-template.html');

const menu = {
    controller: function ($window, $timeout, validationService, limitsService, dataService) {
        this.carbohydrates = false;
        this.proteins = false;

        this.setDiet = function (diet) {
            if (this[diet]) {
                this[diet] = false;
                $timeout(() => this[diet] = true, 0);
                return;
            }
            this.carbohydrates = diet === 'carbohydrates';
            this.proteins = diet === 'proteins';
            if (validationService.validateLimitsChoose(this.carbohydrates, this.proteins, this.className)) this.setLimits();
        };


        this.className = 'start';


        this.setClassName = function (phaseId) {
            if (this.className !== 'start') return;
            this.className = 'active' + phaseId;
            if (validationService.validateLimitsChoose(this.carbohydrates, this.proteins, this.className)) this.setLimits();
        };
        this.moveLeft = function () {
            let numb = +this.className.slice(-1);
            numb -= 1;
            if (!numb) numb = 3;
            this.className = 'active' + numb;
            if (validationService.validateLimitsChoose(this.carbohydrates, this.proteins, this.className)) this.setLimits();
        };
        this.moveRight = function () {
            let numb = +this.className.slice(-1);
            numb += 1;
            if (numb > 3) numb = 1;
            this.className = 'active' + numb;
            if (validationService.validateLimitsChoose(this.carbohydrates, this.proteins, this.className)) this.setLimits();
        };

        this.setLimits = function () {
            let diet = this.carbohydrates ? 'carbohydrates' : 'proteins',
                phase = this.className.slice(-1);
            limitsService.setLimits(diet, phase);

            $window.sessionStorage.savedLimits = JSON.stringify({diet: diet, phaseId: phase});
        };

        if ($window.localStorage.savedLimits && dataService.loading) {
            let data = JSON.parse($window.localStorage.savedLimits);
            this.setDiet(data.diet);
            this.setClassName(data.phaseId)
        }

    },
    template: menuTemplate
};

module.exports = menu;