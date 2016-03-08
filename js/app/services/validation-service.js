'use strict';

module.exports = function(dataService) {
    var food;
    dataService.getFoodBase()
        .then((data) => food = data);

    setTimeout(() => console.log(food), 3000);

    function foodAddValidation(name, portion) {
        if (!name) {
            alert('Введите название продукта');
        } else if (!food[name]) {
            alert('Такого продукта нет в базе. Со списком продуктов Вы можете ознакомиться в разделе' +
                '"Таблицы", либо добавить свой продукт');
        } else if (!portion) {
            alert('Введите порцию в граммах');
        } else if (isNaN(+portion)) {
            alert('В поле "Порция" введите число');
        } else { return true}
    }

    return {
        foodAddValidation: foodAddValidation
    }
};