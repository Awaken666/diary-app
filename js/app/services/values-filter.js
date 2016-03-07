'use strict';

module.exports = function() {
    return function(value) {
        if (value === '---') return value;
        value = +value;
        return value === Math.round(value) ? value : value.toFixed(1);
    }
};