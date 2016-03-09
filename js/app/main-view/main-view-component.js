'use strict';

const mainViewTemplate = require('./template/main-view.html');

const mainView = {
    controller: function (dataService) {
        const empty = {
            empty: true,
            name: '---------',
            portion: '---',
            carbohyd: '---',
            prot: '---',
            fat: '---',
            kall: '---'
        };

        this.base = {};
        dataService.getFoodBase()
            .then((data) => this.base.foods = data);

         var dayTimes = [
            {
                dayTime: 'Завтрак',
                show: true, id: 0,
                foods: [empty],
                result: {
                    carbohyd: 0,
                    prot: 0,
                    fat: 0,
                    kall: 0
                }
            },
            {
                dayTime: 'Перекус 1',
                show: false, id: 1,
                foods: [empty],
                result: {
                    carbohyd: 0,
                    prot: 0,
                    fat: 0,
                    kall: 0
                }
            },
            {
                dayTime: 'Обед',
                show: false,
                id: 2,
                foods: [empty],
                result: {
                    carbohyd: 0,
                    prot: 0,
                    fat: 0,
                    kall: 0
                }
            },
            {
                dayTime: 'Перекус 2',
                show: false,
                id: 3,
                foods: [empty],
                result: {
                    carbohyd: 0,
                    prot: 0,
                    fat: 0,
                    kall: 0
                }
            },
            {
                dayTime: 'Ужин',
                show: false,
                id: 4,
                foods: [empty],
                result: {
                    carbohyd: 0,
                    prot: 0,
                    fat: 0,
                    kall: 0
                }
            }
        ];

        this.viewData = {
            dayTimes: dayTimes,
            resultFinal: {
                carbohyd: 0,
                prot: 0,
                fat: 0,
                kall: 0
            }
        };

        this.addFood = function(dayTimeId, food) {
            let collection = this.viewData.dayTimes[dayTimeId].foods;
            if (collection[0].empty) collection.splice(0, 1);

            collection.push(food);
            this.calcResult(dayTimeId, food, true);
        };

        this.removeFood = function(dayTimeId, food) {
            let collection = this.viewData.dayTimes[dayTimeId].foods;
            let index = collection.indexOf(food);
            collection.splice(index, 1);

            if (collection.length === 0) collection.push(empty);
            this.calcResult(dayTimeId, food, false);
        };

        this.toggleDayTime = function(id) {
            this.viewData.dayTimes[id].show = !this.viewData.dayTimes[id].show
        };


        this.calcResult = function (dayTimeId, food, bool) {
            let result = this.viewData.dayTimes[dayTimeId].result;
            if (bool) {
                for (let key in result) {
                    result[key] += food[key];
                    this.viewData.resultFinal[key] += food[key];
                }
            } else {
                for (let key in result) {
                    result[key] -= food[key];
                    this.viewData.resultFinal[key] -= food[key];
                }
            }
        }
    },
    template: mainViewTemplate
};

module.exports = mainView;