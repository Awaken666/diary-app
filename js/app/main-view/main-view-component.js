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
        this.viewData = {
            resultFinal: {
                carbohyd: 0,
                prot: 0,
                fat: 0,
                kall: 0
            }
        };



        dataService.getFoodBase()
            .then((data) => this.base.foods = data);

        dataService.getDayTimesData()
            .then((data) => this.viewData.dayTimes = data.data);



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