'use strict';

const storageTableTemplate = require('./template/storage-table-template.html');

const storageTable = {
    bindings: {
        myFoods: '<',
        remove: '&'
    },
    controller: function() {
        this.show = function() {
            if (!this.myFoods) return false;
            return Object.keys(this.myFoods).length > 0;
        }
    },
    template: storageTableTemplate
};

module.exports = storageTable;