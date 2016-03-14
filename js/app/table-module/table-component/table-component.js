'use strict';

const tableTemplate = require('./template/table-template.html');

const table = {
    bindings: {
        foodsObj: '<'
    },
    controller: function() {
        setTimeout(() => console.log(this.foodsObj), 10000)
    },
    template: tableTemplate
};

module.exports = table;