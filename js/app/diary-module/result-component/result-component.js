'use strict';

const resultTemplate = require('./template/result-template.html');

const result = {
    bindings: {
        result: '<'
    },
    controller: function(limitsService) {
        this.limitsData = limitsService.limitsData;

        this.calcPercent = function(value, limit) {
            if (!value) return '0%';
            return (value / (limit / 100) ).toFixed() + '%';
        };

        this.calcGraph = function(value, limit) {
            if (!value) return;
            let percent = (value / (limit / 100) ).toFixed();
            let color = percent > 100 ? 'rgba(202, 22, 41, 0.2)' : 'rgba(27, 201, 142, 0.1)';
            if (percent > 100) percent = 100;

            return {
                'background-color': color,
                'width': percent + '%'
            }
        }
    },
    template: resultTemplate
};

module.exports = result;