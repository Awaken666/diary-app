'use strict';

module.exports = function(dataService) {
    var limitsData = {};

    function setLimits(diet, phase) {
        dataService.getLimitsData(diet, phase)
            .then((data) => limitsData.limits = data.data)
    }


    function clearLimits() {
        if (limitsData.limits) delete limitsData.limits
    }

    return {
        limitsData: limitsData,
        setLimits: setLimits,
        clearLimits: clearLimits
    }
};