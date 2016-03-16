'use strict';

module.exports = function(dataService) {
    var food = dataService.base;

    function calculateValues(foodName, portion) {
        let values = food.foods[foodName];
        return {
            name: foodName,
            portion: portion,
            carbohyd: Math.round(values[1]/values[0]*portion),
            prot: Math.round(values[2]/values[0]*portion),
            fat: Math.round(values[3]/values[0]*portion),
            kall: Math.round(values[4]/values[0]*portion)
        }
    }

    return {
        calculateValues: calculateValues
    }
};