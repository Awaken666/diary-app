'use strict';

const viewTemplate = require('./template/view-template.html');

const view = {
    controller: function (dataService, limitsService, $window, modal, dietChoose) {
        const empty = {
            empty: true,
            name: '---------',
            portion: '---',
            carbohyd: '---',
            prot: '---',
            fat: '---',
            kall: '---'
        };

        this.base = dataService.base;
        this.viewData = {
            limitsData: limitsService.limitsData,
            tablesData: {},
            resultFinal: {
                carbohyd: {name: 'Угдеводы', value: 0},
                prot: {name: 'Протеины', value: 0},
                fat: {name: 'Жиры', value: 0},
                kall: {name: 'Калории', value: 0}
            }
        };

        dataService.getTableData()
            .then((data) => {
                this.viewData.tablesData.foodsObjs = data;
            });
        dataService.getDayTimesData()
            .then((data) => this.viewData.dayTimes = data.data);



        this.compare = function (key) {
            if (!this.viewData.limitsData.limits) return;
            if (this.viewData.limitsData.limits["Итог"][key] < this.viewData.resultFinal[key]) return true;
        };


        this.addFood = function (dayTimeId, food) {
            let collection = this.viewData.dayTimes[dayTimeId].foods;
            if (collection[0].empty) collection.splice(0, 1);

            collection.push(food);
            this.calcResult(dayTimeId, food, true);

            if ($window.localStorage._lastSaveId) $window.localStorage.removeItem('_lastSaveId');
        };

        this.removeFood = function (dayTimeId, food) {
            let collection = this.viewData.dayTimes[dayTimeId].foods;
            let index = collection.indexOf(food);
            collection.splice(index, 1);

            if (collection.length === 0) collection.push(empty);
            this.calcResult(dayTimeId, food, false);
            if ($window.localStorage._lastSaveId) $window.localStorage.removeItem('_lastSaveId');
        };


        this.calcResult = function (dayTimeId, food, bool) {
            let result = this.viewData.dayTimes[dayTimeId].result;
            if (bool) {
                for (let key in result) {
                    result[key] += food[key];
                    this.viewData.resultFinal[key].value += food[key];
                }
            } else {
                for (let key in result) {
                    result[key] -= food[key];
                    this.viewData.resultFinal[key].value -= food[key];
                }
            }
        };

        this.removeMyFood = function (name) {

            delete this.viewData.tablesData.myFoods[name];
            $window.localStorage.myFoods = JSON.stringify(this.viewData.tablesData.myFoods);

            dataService.removeFromBase(name);
        };

        this.addMyFood = function (name, values) {
            debugger;
            if (!this.viewData.tablesData.myFoods) this.viewData.tablesData.myFoods = {};
            if (this.viewData.tablesData.myFoods[name]) {
                if (!confirm('Перезаписать существующий продукт?')) return;
                dataService.removeFromBase(name);
            }
            this.viewData.tablesData.myFoods[name] = values;
            $window.localStorage.myFoods = JSON.stringify(this.viewData.tablesData.myFoods);

            dataService.addToBase(name, values);
        };

        //LS

        if ($window.localStorage.myFoods) this.viewData.tablesData.myFoods = JSON.parse($window.localStorage.myFoods);



        if ($window.localStorage.saveData) {
            modal.open({title: 'Загрузка', message: 'Загрузить сохраненные данные?'}, 'confirm')
                .then(() => {
                    let data = JSON.parse($window.localStorage.saveData);
                    this.viewData.dayTimes = data.daysData;
                    this.viewData.resultFinal = data.resultFinal;

                    dietChoose.loadLimits()
                }, () => {
                    modal.open({title: 'Загрузка', message: 'Удалить сохраненные данные?'}, 'confirm')
                        .then(() => {
                            $window.localStorage.removeItem('saveData');
                            $window.localStorage.removeItem('savedLimits');
                        });
                });

        }



    },
    template: viewTemplate
};

module.exports = view;