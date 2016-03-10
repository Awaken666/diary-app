'use strict';

module.exports = function() {
    return function(value) {
        if (value.length === 2) return '';
        return value;
    }
};