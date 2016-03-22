'use strict';

const saveMenuTemplate = require('./template/save-menu-template.html');

const saveMenu = {
    bindings: {
        dayTimesData: '<',
        result: '<'
    },
    controller: function($window, modal) {

        this.saveForPrint = function() {
            let data = $window.localStorage.daysData ? JSON.parse($window.localStorage.daysData) : [];
            //Проверки
            if (data.length > 0 && new Date(data[data.length - 1].saveTime).getDay() === new Date().getDay()) {
                if (data[data.length - 1].saveTimeId === $window.localStorage._lastSaveId) {
                    modal.open({title: 'Ошибка сохранения', message: 'Нет новых данных для сохранения'}, 'alert');
                    return;
                }
                return modal.open({title: 'Подтвердите', message: 'Перезаписать данные печати текушего дня?'}, 'confirm')
                    .then(() => {
                        data.pop();

                        //Сохранение
                        let date = new Date();
                        let id = (Math.random() + '').slice(2);
                        let dayData = {saveTime: date, dayTimes: this.dayTimesData, result: this.result, saveTimeId: id};
                        data.push(dayData);
                        $window.localStorage.daysData = JSON.stringify(data);
                        $window.localStorage._lastSaveId = id;

                        modal.open({title: 'Сохранение данных', message: 'Данные успешно сохранены'}, 'alert');
                    });


            } else {
                //Сохранение
                let date = new Date();
                let id = (Math.random() + '').slice(2);
                let dayData = {saveTime: date, dayTimes: this.dayTimesData, result: this.result, saveTimeId: id};
                data.push(dayData);
                $window.localStorage.daysData = JSON.stringify(data);
                $window.localStorage._lastSaveId = id;
                modal.open({title: 'Сохранение данных', message: 'Данные успешно сохранены'}, 'alert');
            }

        };

        this.removePrintSaves = function() {
            if ($window.localStorage.daysData) {
                modal.open({title: 'Удаление', message: 'Удалить сохранения для печати?'}, 'confirm')
                    .then(() => {
                        $window.localStorage.removeItem('daysData');
                        $window.localStorage.removeItem('_lastSaveId');
                    });
            }
        };


        this.preview = function() {
            let data = $window.localStorage.daysData;
            if (!data) {
                modal.open({title: 'Сохранение', message: 'Сохранить текущие данные для просмотра?'}, 'confirm')
                    .then(() => {
                        this.saveForPrint();
                        $window.open('./print.html');
                    }, () => {
                        modal.open({title: 'Ошибка предпросмотра', message: 'Нет данных для просмотра!'}, 'alert');
                    });
            } else {
                data = JSON.parse(data);
                if (data[data.length - 1].saveTimeId !== $window.localStorage._lastSaveId) {
                    modal.open({title: 'Сохранение', message: 'Сохранить текущие данные для просмотра?'}, 'confirm')
                        .then(() => {
                            this.saveForPrint().then(() => $window.open('./print.html'), () => $window.open('./print.html'));

                        }, () => $window.open('./print.html'));
                } else {
                    $window.open('./print.html');
                }
            }


        };

        this.saveData = function() {
            modal.open({title: 'Сохранение', message: 'Сохранить текущие данные?'}, 'confirm')
                .then(() => {
                    $window.localStorage.saveData = JSON.stringify({daysData: this.dayTimesData, resultFinal: this.result});
                    if ($window.sessionStorage.savedLimits) {
                        $window.localStorage.savedLimits = $window.sessionStorage.savedLimits;
                    } else if (!$window.sessionStorage.savedLimits && $window.localStorage.savedLimits) {
                        $window.localStorage.removeItem('savedLimits');
                    }
                    modal.open({title: 'Сохранение данных', message: 'Данные успешно сохранены'}, 'alert');
                });
        };

        this.removeData = function() {
            if($window.localStorage.saveData) {
                modal.open({title: 'Удаление', message: 'Удалить сохраненные данные?'}, 'confirm')
                    .then(() => {
                        $window.localStorage.removeItem('saveData');
                        $window.localStorage.removeItem('savedLimits');
                        modal.open({title: 'Удаление', message: 'Данные успешно удалены'}, 'alert');
                    });
            } else {
                modal.open({title: 'Ошибка', message: 'Нет сохраненных данных'}, 'alert');
            }
        }
    },
    template: saveMenuTemplate
};

module.exports = saveMenu;

