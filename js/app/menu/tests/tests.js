describe('Menu component tests', function() {
    beforeEach(module('diary'));

    var element,
        $scope,
        isolatSscope,
        controller,
        $timeout,
        limitsService,
        validationService;

    beforeEach(inject(function ($rootScope, $compile, _$timeout_, _limitsService_, _validationService_, $httpBackend) {
        $timeout = _$timeout_;
        limitsService = _limitsService_;
        validationService = _validationService_;

        spyOn(limitsService, 'setLimits');
        spyOn(validationService, 'validateLimitsChoose');

        element = angular.element('<menu></menu>');
        $scope = $rootScope.$new();
        $compile(element)($scope);
        isolatSscope = element.isolateScope();
        controller = isolatSscope.$ctrl;

        $httpBackend.whenGET('./JSONdata/food.json').respond('');
    }));

    it('check properties', function() {
        expect(controller.carbohydrates).toBe(false);
        expect(controller.proteins).toBe(false);
        expect(controller.className).toBe('start');
    });

    it('check set proteins Diet ', function(done) {
        controller.setDiet('proteins');
        setTimeout(() => {
            expect(controller.carbohydrates).toBe(false);
            expect(controller.proteins).toBe(true);
            controller.setDiet('proteins');
            done()
        }, 100);
        $timeout.flush();
    });

    it('check set proteins Diet ', function(done) {
        controller.setDiet('carbohydrates');
        setTimeout(() => {
            expect(controller.carbohydrates).toBe(true);
            expect(controller.proteins).toBe(false);
            done()
        }, 100);
        $timeout.flush();
    });

    it('check setClassName method', function() {
        controller.setClassName(1);
        expect(controller.className).toBe('active1');

        controller.setClassName(3);
        expect(controller.className).toBe('active1');
    });

    it('check moveLeft method', function() {
        controller.setClassName(2);

        controller.moveLeft();
        expect(controller.className).toBe('active1');

        controller.moveLeft();
        expect(controller.className).toBe('active3');
    });

    it('check moveRight method', function() {
        controller.setClassName(2);

        controller.moveRight();
        expect(controller.className).toBe('active3');

        controller.moveRight();
        expect(controller.className).toBe('active1');
    });

    it('check setLimits method', function() {
        controller.setLimits();

        expect(limitsService.setLimits).toHaveBeenCalled();
    })
});