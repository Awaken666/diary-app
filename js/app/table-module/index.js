'use strict';

const tableModule = angular.module('table', []);

tableModule
    .component('tableView', require('./table-view-component/table-view-component'))
    .component('tableAdd', require('./add-to-table-component/add-to-table-component'))
    .component('foodTable', require('./table-component/table-component'))
    .component('storageTable', require('./storage-table-component/storage-table-component'));

module.exports = tableModule;