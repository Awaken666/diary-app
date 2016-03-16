'use strict';

const tableViewTemplate = require('./template/table-view-template.html');

const tableView = {
    controller: function(dataService, $window) {
        dataService.getTableData()
            .then((data) => {
                this.foodsObjs = data;
            });

        if ($window.localStorage.myFoods) this.myFoods = JSON.parse($window.localStorage.myFoods);

        this.removeMyFood = function(name) {
            delete this.myFoods[name];
            $window.localStorage.myFoods = JSON.stringify(this.myFoods);

            dataService.removeFromBase(name);
        };

        this.addMyFood = function(name, values) {
            if (this.myFoods[name]) {
                if (!confirm('Перезаписать существующий продукт?')) return;
                dataService.removeFromBase(name);
            }
            this.myFoods[name] = values;
            $window.localStorage.myFoods = JSON.stringify(this.myFoods);

            dataService.addToBase(name, values);
        }
    },
    template: tableViewTemplate
};


module.exports = tableView;