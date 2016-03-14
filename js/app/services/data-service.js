'use strict';

module.exports = function($http, $window) {
    function getFoodBase() {
        return $http.get('./JSONdata/food.json').then((data) => {
            var base = {}, keys = [];
            data.data.forEach((obj) => {
                for (let key in obj) {
                    if (key === 'name') continue;
                    base[key] = obj[key];
                }
            });
            Object.keys(base).forEach((key) => keys.push({foodName: key}));
            base.keys = keys;
            return base;
        })
    }

    function getFoodObjects() {
        return $http.get('./JSONdata/food.json')
    }

    function getDayTimesData() {
        return $http.get('./JSONdata/day-times-data.json')
    }

    function getLimitsData(diet, phase) {
        let path = './JSONdata/limits-data/' + diet + '-phase' + phase + '.json';
        return $http.get(path);
    }

    function getTableData() {
        return $http.get('./JSONdata/food.json')
            .then((data) => {
                let tableData = [];

                data.data.forEach((obj) => {
                    let newObj = {
                            foods: []
                        },
                        count = 20;

                    for (let key in obj) {
                        if (key === 'name') {
                            newObj.title = obj.name;
                            continue;
                        }
                        if ( count >= 20 ) {
                            let titleData = {
                                className: 'color',
                                values: {
                                    name: 'Наименование продукта',
                                    portion: 'Порция',
                                    carbohyd: 'Углеводы',
                                    prot: 'Белки',
                                    fat: 'Жиры',
                                    kall: 'Калории'
                                }
                            };
                            newObj.foods.push(titleData);
                            count = 0;
                        }
                        let food = {className: '', values: {}};
                        food.values.name = key;
                        food.values.portion = obj[key][0];
                        food.values.carbohyd = obj[key][1];
                        food.values.prot = obj[key][2];
                        food.values.fat = obj[key][3];
                        food.values.kall = obj[key][4];
                        newObj.foods.push(food);
                        count += 1;
                    }

                    tableData.push(newObj);
                });

                return tableData;
            })
    }

    if ($window.localStorage.saveData && !confirm('Загрузить сохранения?')) {
        if (confirm('Удалить имеющиеся сохранения?')) {
            $window.localStorage.removeItem('saveData');
            $window.localStorage.removeItem('savedLimits');
        }
    }

    return {
        getFoodBase: getFoodBase,
        getFoodObjects: getFoodObjects,
        getTableData: getTableData,
        getDayTimesData: getDayTimesData,
        getLimitsData: getLimitsData
    };
};