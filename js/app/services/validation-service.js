'use strict';

module.exports = function(dataService, modal) {
    var food = dataService.base;


    function foodAddValidation(name, portion) {
        if (!name) {
            modal.open({title: 'Ошибка', message: 'Введите название продукта'}, 'alert');
        } else if (!food.foods[name]) {
            modal.open({title: 'Ошибка', message: 'Такого продукта нет в базе. Со списком продуктов Вы можете ознакомиться в разделе "Таблицы", либо добавить свой продукт'}, 'alert');
        } else if (!portion) {
            modal.open({title: 'Ошибка', message: 'Введите порцию в граммах'}, 'alert');
        } else if (isNaN(+portion)) {
            modal.open({title: 'Ошибка', message: 'В поле "Порция" введите число'}, 'alert');
        }else if (portion <= 0) {
            modal.open({title: 'Ошибка', message: 'Введите число больше чем 0'}, 'alert');
        } else { return true}
    }

    function validateLimitsChoose(diet1, diet2, phaseClass) {
        if( (diet1 || diet2) && phaseClass !== 'start') return true;
    }

    function addMyFoodValidation(name, values) {
        let success = true;
        if (!name) {
            modal.open({title: 'Ошибка', message: 'Введите наименование продукта'}, 'alert');
            success = false;
            return;
        }
        if (values[0] === 0) {
            modal.open({title: 'Ошибка', message: 'Порция не может быть равна нулю'}, 'alert');
            success = false;
            return;
        }
        values.forEach((value) => {
            if (isNaN(value)|| value < 0) {
                modal.open({title: 'Ошибка', message: 'Значения должны быть числами со значением большим или равным нулю'}, 'alert');
                success = false;
                return;
            }
        });
        return success;
    }

    return {
        foodAddValidation: foodAddValidation,
        validateLimitsChoose: validateLimitsChoose,
        addMyFoodValidation: addMyFoodValidation
    }
};