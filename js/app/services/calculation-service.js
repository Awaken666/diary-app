'use strict';

module.exports = function(dataService) {
    var food;
    dataService.getFoodBase()
        .then((data) => food = data);

    function calculateValues(foodName, portion) {
        let values = food[foodName];
        return {
            name: foodName,
            portion: portion,
            carbohyd: values[1]/values[0]*portion,
            prot: values[2]/values[0]*portion,
            fat: values[3]/values[0]*portion,
            kall: values[4]/values[0]*portion
        }
    }

    return {
        calculateValues: calculateValues
    }
};