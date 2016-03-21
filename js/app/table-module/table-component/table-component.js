'use strict';

const tableTemplate = require('./template/table-template.html');

const table = {
    bindings: {
        foodsObj: '<'
    },
    controller: function() {

    },
    template: tableTemplate
};

module.exports = table;