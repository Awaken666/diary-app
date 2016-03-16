'use strict';

const storageTableTemplate = require('./template/storage-table-template.html');

const storageTable = {
    bindings: {
        myFoods: '<',
        removeMyFood: '&'
    },
    controller: function() {
        this.show = function() {
            return Object.keys(this.myFoods).length > 0;
        }
    },
    template: storageTableTemplate
};

module.exports = storageTable;