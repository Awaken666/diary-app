'use strict';

module.exports = function() {
    var activeClass = '';

    function setClassName(className) {
        activeClass = 'active-' + className;
    }

    function getClassName() {
        return activeClass
    }

    return {
        getClassName: getClassName,
        setClassName: setClassName
    }
};