'use strict';

module.exports = function(dataService) {
    var limitsData = {};

    function setLimits(diet, phase) {
        dataService.getLimitsData(diet, phase)
            .then((data) => limitsData.limits = data.data)
    }

    return {
        limitsData: limitsData,
        setLimits: setLimits
    }
};