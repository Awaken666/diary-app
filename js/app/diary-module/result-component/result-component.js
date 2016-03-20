'use strict';

const resultTemplate = require('./template/result-template.html');

const result = {
    bindings: {
        result: '<'
    },
    controller: function(limitsService) {
        this.limits = limitsService.limitsData;

    },
    template: resultTemplate
};

module.exports = result;