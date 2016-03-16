'use strict';

const addToTableTemplate = require('./template/add-to-table-template.html');

const addToTable = {
    bindings: {
        addMyFood: '&'
    },
    controller: function (validationService) {
        this.values = [0, 0, 0, 0, 0];

        this.add = function(event) {
            if (event && event.keyCode !== 13) return;

            this.values.forEach((value, index) => {
                this.values[index] = +value
            });
            if (!validationService.addMyFoodValidation(this.name, this.values)) return;

            this.addMyFood({name: this.name, values: this.values});
            this.values = [0, 0, 0, 0, 0];
            this.name = '';
        }
    },
    template: addToTableTemplate
};

module.exports = addToTable;