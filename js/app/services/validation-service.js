'use strict';

module.exports = function(dataService) {
    var food = dataService.base;


    function foodAddValidation(name, portion) {
        if (!name) {
            alert('Введите название продукта');
        } else if (!food.foods[name]) {
            alert('Такого продукта нет в базе. Со списком продуктов Вы можете ознакомиться в разделе' +
                '"Таблицы", либо добавить свой продукт');
        } else if (!portion) {
            alert('Введите порцию в граммах');
        } else if (isNaN(+portion)) {
            alert('В поле "Порция" введите число');
        }else if (portion <= 0) {
            alert('Введите число больше чем 0')
        } else { return true}
    }

    function validateLimitsChoose(diet1, diet2, phaseClass) {
        if( (diet1 || diet2) && phaseClass !== 'start') return true;
    }

    function addMyFoodValidation(name, values) {
        let success = true;
        if (!name) {
            alert('Введите наименование продукта');
            success = false;
            return;
        }
        values.forEach((value) => {
            if (isNaN(value)|| value < 0) {
                alert('Значения должны быть числами со значением большим или равным нулю');
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