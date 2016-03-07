'use strict';

const mainViewTemplate = require('./template/main-view.html');

const mainView = {
    controller: function() {
        this.dayTimes = [
            {dayTime: 'Завтрак', show: true, id: 0},
            {dayTime: 'Перекус 1', show: false, id: 1},
            {dayTime: 'Обед', show: false, id: 2},
            {dayTime: 'Перекус 2', show: false, id: 3},
            {dayTime: 'Ужин', show: false, id: 4}
        ];
        this.toggleDayTime = function(id) {
            this.dayTimes[id].show = !this.dayTimes[id].show;
        };
        this.result = [0, 0, 0, 0];
        this.calcResult = function(array, bool) {
            if (bool) for (let i = 0; i < 4; i +=1) this.result[i] += array[i];
            else for (let i = 0; i < 4; i +=1) this.result[i] -= array[i];
        }
    },
    template: mainViewTemplate
};

module.exports = mainView;