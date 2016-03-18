'use strict';

const dayTimeTemplate = require('./template/day-time-template.html');

const dayTime = {
    bindings: {
        base: '<',
        daytimes: '<',
        add: '&',
        remove: '&',
        dayTimeLimits: '<'
    },
    controller: function(dataService, validationService, calculationService, $scope, $stateParams, indexService) {
        let daytime = $stateParams.daytime;
        this.index = indexService(daytime);

        var text = '';
        this.onInput = function(str) {
            text = str;
        };

        this.limits = function() {
            if (this.dayTimeLimits.limits) return this.dayTimeLimits.limits[this.daytimes[this.index].dayTime];
        };

        this.compare = function(key) {
            if (!this.limits()) return;
            if (this.limits()[key] < this.daytimes[this.index].result[key]) return true;
        };

        this.removeFood = function(food) {
            this.remove({dayTimeId: this.daytimes[this.index].id, food: food})
        };

        this.addFood = function() {
            let portion = Math.round(+this.portion);
            let name = this.foodName ? this.foodName.title : text;

            //Проверить поля ввода, вычислить значения
            if (!validationService.foodAddValidation(name, portion)) return;
            var food = calculationService.calculateValues(name, portion);

            //Добавить в массив
            this.add({dayTimeId: this.daytimes[this.index].id, food: food});

            //Очистить поля ввода
            $scope.$broadcast('angucomplete-alt:clearInput');
            this.portion ='';
        };


        this.enter = function(event) {
            if (event.keyCode !== 13) return;
            this.addFood();
        };
    },
    template: dayTimeTemplate
};

module.exports = dayTime;