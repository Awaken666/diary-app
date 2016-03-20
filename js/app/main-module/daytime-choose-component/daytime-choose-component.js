'use strict';

const daytimeChooseTemplate = require('./template/daytime-choose-template.html');

const daytimeChoose = {
    controller: function($state, activeClassService) {
        this.daytimes = [
            {time: 'Завтрак', className: 'breakfast', state: 'breakfast'},
            {time: 'Перекус 1', className: false, state: 'first-snack'},
            {time: 'Обед', className: false, state: 'dinner'},
            {time: 'Перекус 2', className: false, state: 'second-snack'},
            {time: 'Ужин', className: false, state: 'evening-meal'}
        ];

        this.activeClass = activeClassService.getClassName;

        this.setState = function(daytime) {
            $state.go('diary', {daytime: daytime.state});
        };

    },
    template: daytimeChooseTemplate
};

module.exports = daytimeChoose;