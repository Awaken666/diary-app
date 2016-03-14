'use strict';

const saveMenuTemplate = require('./template/save-menu-template.html');

const saveMenu = {
    bindings: {
        dayTimesData: '<',
        result: '<'
    },
    controller: function($window, validationService) {
        this.active = false;

        this.toggle = function() {
            this.active = !this.active;
        };

        this.saveForPrint = function() {
            let data = $window.localStorage.daysData ? JSON.parse($window.localStorage.daysData) : [];
            //Проверки
            if (data.length > 0 && new Date(data[data.length - 1].saveTime).getDay() === new Date().getDay()) {
                if (data[data.length - 1].saveTimeId === $window.localStorage._lastSaveId) {
                    alert('Нет новых данных для сохранения');
                    return;
                }
                if (!confirm('Перезаписать данные печати текушего дня?')) return;
                data.pop();
            }
            //Сохранение
            let date = new Date();
            let id = (Math.random() + '').slice(2);
            let dayData = {saveTime: date, dayTimes: this.dayTimesData, result: this.result, saveTimeId: id};
            data.push(dayData);
            $window.localStorage.daysData = JSON.stringify(data);
            $window.localStorage._lastSaveId = id;
            alert('Данные успешно сохранены');
        };

        this.removePrintSaves = function() {
            if ($window.localStorage.daysData && confirm('Удалить сохранения для печати?')) {
                $window.localStorage.removeItem('daysData');
                $window.localStorage.removeItem('_lastSaveId');
            }
        };


        this.preview = function() {
            let data = $window.localStorage.daysData;
            if (!data) {
                if (confirm('Сохранить текущие данные для просмотра?')) {
                    this.saveForPrint();
                } else {
                    alert('Нет данных для просмотра!');
                    return;
                }
            } else {
                data = JSON.parse(data);
                if (data[data.length - 1].saveTimeId !== $window.localStorage._lastSaveId && confirm('Сохранить данные для просмотра?')) this.saveForPrint();
            }

            $window.open('./print.html');
        };

        this.saveData = function() {
            if (confirm('Сохранить текущие данные?')) {
                $window.localStorage.saveData = JSON.stringify({daysData: this.dayTimesData, resultFinal: this.result});
                $window.localStorage.savedLimits = $window.sessionStorage.savedLimits;
                alert('Данные успешно сохранены');
            }
        }
    },
    template: saveMenuTemplate
};

module.exports = saveMenu;

