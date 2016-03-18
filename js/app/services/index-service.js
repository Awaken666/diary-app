'use strict';

module.exports = function() {
    return function(daytime) {
        switch (daytime) {
            case 'breakfast':
                return 0;
                break;
            case 'first-snack':
                return 1;
                break;
            case 'dinner':
                return 2;
                break;
            case 'second-snack':
                return 3;
                break;
            case 'evening-meal':
                return 4;
                break;
            default:
                return false;
        }
    }
};