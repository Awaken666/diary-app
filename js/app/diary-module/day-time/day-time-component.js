'use strict';

const dayTimeTemplate = require('./template/day-time-template.html');

const dayTime = {
    bindings: {
        base: '<',
        time: '<',
        toggle: '&',
        add: '&',
        remove: '&',
        dayTimeLimits: '<'
    },
    controller: function(dataService, validationService, calculationService, $scope) {
        var text = '';
        this.onInput = function(str) {
            text = str;
        };

        this.limits = function() {
            if (this.dayTimeLimits.limits) return this.dayTimeLimits.limits[this.time.dayTime];
        };

        this.compare = function(key) {
            if (!this.limits()) return;
            if (this.limits()[key] < this.time.result[key]) return true;
        };

        this.removeFood = function(food) {
            this.remove({dayTimeId: this.time.id, food: food})
        };

        this.addFood = function() {
            let portion = Math.round(+this.portion);
            let name = this.foodName ? this.foodName.title : text;

            //Проверить поля ввода, вычислить значения
            if (!validationService.foodAddValidation(name, portion)) return;
            var food = calculationService.calculateValues(name, portion);

            //Добавить в массив
            this.add({dayTimeId: this.time.id, food: food});

            //Очистить поля ввода
            $scope.$broadcast('angucomplete-alt:clearInput');
            this.portion ='';

            //Открыть, если скрыто
            if (!this.time.show) this.toggle({id: this.time.id});
        };


        this.enter = function(event) {
            if (event.keyCode !== 13) return;
            this.addFood();
        };
    },
    template: dayTimeTemplate
};

module.exports = dayTime;