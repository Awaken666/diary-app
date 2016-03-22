'use strict';

const tableModule = angular.module('table', []);

tableModule
    .component('tableAdd', require('./add-to-table-component/add-to-table-component'))
    .component('foodTable', require('./table-component/table-component'))
    .component('storageTable', require('./storage-table-component/storage-table-component'))
    .component('tables', require('./single-page-tables-component/single-page-tables-component'));

module.exports = tableModule;