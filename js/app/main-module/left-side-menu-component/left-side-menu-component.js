'use strict';

const leftSideMenuTemplate = require('./template/left-side-menu-template.html');

const leftSideMenu = {
    controller: function () {
        this.menuItems = [
            {className: 'home', tooltip: 'На главную', tooltipShow: false},
            {className: 'settings', tooltip: 'Настройки', tooltipShow: false},
            {className: 'result', tooltip: 'Итог дня', tooltipShow: false},
            {className: 'print', tooltip: 'Для печати', tooltipShow: false},
            {className: 'save', tooltip: 'Сохранить', tooltipShow: false},
            {className: 'tables', tooltip: 'Таблицы', tooltipShow: false},
            {className: 'add-food', tooltip: 'Добавить еду в таблицу', tooltipShow: false}
        ];

        this.toggle = function(item) {
            if (item.className === this.activeClass) return;
            item.tooltipShow = !item.tooltipShow;
        };

        this.setState = function(className) {
            this.activeClass = 'active-' + className;
        };

        (() => {
            let numb = Math.ceil(Math.random() * 3);
            this.backIconClassName = 'icon' + numb;
        })()
    },
    template: leftSideMenuTemplate
};

module.exports = leftSideMenu;