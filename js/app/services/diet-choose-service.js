'use strict';

module.exports = function($timeout, validationService, limitsService, $window, modal) {
    var diets = {
        carbohydrates: false,
        proteins: false
    },
        className = {name: 'start'};


    function setDiet(diet) {
        if (diets[diet]) {
            diets[diet] = false;
            $timeout(() => diets[diet] = true, 0);
            return;
        }
        diets.carbohydrates = diet === 'carbohydrates';
        diets.proteins = diet === 'proteins';
        if (validationService.validateLimitsChoose(diets.carbohydrates, diets.proteins, className.name)) setLimits();
    }

    function setClassName(phaseId) {
        className.name = 'active' + phaseId;
        if (validationService.validateLimitsChoose(diets.carbohydrates, diets.proteins, className.name)) setLimits();
    }

    function setLimits() {
        let diet = diets.carbohydrates ? 'carbohydrates' : 'proteins',
            phase = className.name.slice(-1);
        limitsService.setLimits(diet, phase);

        $window.sessionStorage.savedLimits = JSON.stringify({diet: diet, phaseId: phase});
    }

    function resetChoose() {
        if (!limitsService.limitsData.limits) {
            diets.carbohydrates = false;
            diets.proteins = false;
            className.name = 'start';
            return;
        }
        modal.open({title: 'Подтверждение', message: 'Вы точно хотите сбросить установленные лимиты?'}, 'confirm')
            .then(() => {
                diets.carbohydrates = false;
                diets.proteins = false;
                className.name = 'start';

                $window.sessionStorage.removeItem('savedLimits');
                limitsService.clearLimits();
            });
    }

    function loadLimits() {
        if ($window.localStorage.savedLimits) {
            let data = JSON.parse($window.localStorage.savedLimits);
            setDiet(data.diet);
            setClassName(data.phaseId)
        }
    }


    return {
        diets: diets,
        className: className,
        setDiet: setDiet,
        setClassName: setClassName,
        setLimits: setLimits,
        resetChoose: resetChoose,
        loadLimits: loadLimits
    }
};