'use strict';

const modalTemplate = require('./template/modal-template.html');

const modal = {
    controller: function(modal) {
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
        }

    },
    template: modalTemplate
};

module.exports = modal;