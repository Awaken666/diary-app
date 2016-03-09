describe('Day Time component tests', function() {

    beforeEach(module('diary'));

    var element,
        $scope,
        isolatSscope,
        controller,
        $httpBackend,
        validationService,
        calculationService;

    beforeEach(inject(function ($rootScope, $compile, _$httpBackend_, _validationService_, _calculationService_) {
        $httpBackend = _$httpBackend_;
        validationService = _validationService_;
        calculationService = _calculationService_;

        spyOn(validationService, 'foodAddValidation').and.returnValue(true);
        spyOn(calculationService, 'calculateValues');

        element = angular.element('<day-time></day-time>');
        $scope = $rootScope.$new();
        $compile(element)($scope);
        isolatSscope = element.isolateScope();
        controller = isolatSscope.$ctrl;
    }));

    it('check addFood method', function() {
        spyOn(controller, 'add');
        controller.time= {
            id: 0
            };
        controller.portion = '90';
        controller.onInput('test');

        controller.addFood();

        expect(validationService.foodAddValidation).toHaveBeenCalled();
        expect(calculationService.calculateValues).toHaveBeenCalled();
        expect(controller.add).toHaveBeenCalled();
        expect(controller.portion).toBe('');
    });

    it('check removeFood method', function() {
        controller.time= {
            id: 0
        };
        spyOn(controller, 'remove');

        controller.removeFood();

        expect(controller.remove).toHaveBeenCalled();
    });

    it('check enter method', function() {
        spyOn(controller, 'addFood');

        controller.enter({keyCode: 10});
        expect(controller.addFood).not.toHaveBeenCalled();

        controller.enter({keyCode: 13});
        expect(controller.addFood).toHaveBeenCalled();
    })
});