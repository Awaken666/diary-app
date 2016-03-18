'use strict';

const daytimeChooseTemplate = require('./template/daytime-choose-template.html');

const daytimeChoose = {
    controller: function($state) {
        this.daytimes = [
            {time: 'Завтрак', active: false, state: 'breakfast'},
            {time: 'Перекус 1', active: false, state: 'first-snack'},
            {time: 'Обед', active: false, state: 'dinner'},
            {time: 'Перекус 2', active: false, state: 'second-snack'},
            {time: 'Ужин', active: false, state: 'evening-meal'}
        ];

        this.setState = function(daytime) {
            $state.go('diary', {daytime: daytime.state});
            this.daytimes.forEach((time) => {
                time.active = false;
                if (time === daytime) time.active = true;
            });
        };

    },
    template: daytimeChooseTemplate
};

module.exports = daytimeChoose;