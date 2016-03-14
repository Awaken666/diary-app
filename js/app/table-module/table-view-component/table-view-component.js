'use strict';

const tableViewTemplate = require('./template/table-view-template.html');

const tableView = {
    controller: function(dataService) {
        dataService.getTableData()
            .then((data) => {
                this.foodsObjs = data;
            });
    },
    template: tableViewTemplate
};


module.exports = tableView;