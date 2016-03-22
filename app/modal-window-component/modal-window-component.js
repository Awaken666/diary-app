'use strict';

const modalTemplate = require('./template/modal-template.html');

const modal = {
    controller: function(modal, $timeout) {
        this.modalViewData = modal.modalViewData;
        this.checkOpen = function() {
            return modal.getState() === 'open';
        };
        this.checkType = function(type) {
            return modal.getType() === type;
        };
        this.type = modal.getType;

        this.close = modal.close;

        this.stopPropagation = function(event) {
            event.stopImmediatePropagation();
        };


        $timeout(() => {
            modal.open({title: 'Дневник питания', message: 'Пожалуйста, выберите версию'}, 'confirm')
                .then(() => document.location.href = './second-version', () => document.location.href = './first-version');
        }, 0)
    },
    template: modalTemplate
};

module.exports = modal;