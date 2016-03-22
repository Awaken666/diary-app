'use strict';

const template = require('./template/single-page-tables-template.html');

const tables = {
    bindings: {
        foodsObjs: '<',
        myFoods: '<',
        removeMyFood: '&'
    },
    controller: function($timeout) {
        this.showTable = function(hashKey) {
            this.$$hashKey = hashKey;
        };

        $timeout(() => this.showTable(this.foodsObjs[0].$$hashKey),0);

        this.remove = function(obj) {
            this.removeMyFood({name: obj})
        };

        this.showMyFoodTitle = function() {
            if (!this.myFoods) return false;
            return !!Object.keys(this.myFoods).length
        }
    },
    template: template
} ;

module.exports = tables;