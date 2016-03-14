'use strict';

const foodTemplate = require('./template/food-template.html');

const food = {
    bindings: {
        food: '<',
        remove: '&'
    },
    controller: function() {
        this.checkEmptyFood = function(food) {
            if (isNaN(food.kall)) return 'empty'
        }
    },
    template: foodTemplate
};

module.exports = food;