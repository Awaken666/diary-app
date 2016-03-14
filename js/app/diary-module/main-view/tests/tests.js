describe('Main View component tests', function () {

    beforeEach(module('diary'));

    var empty = {
        empty: true,
        name: '---------',
        portion: '---',
        carbohyd: '---',
        prot: '---',
        fat: '---',
        kall: '---'
    };

    var element,
        $scope,
        isolatSscope,
        controller,
        $httpBackend,
        dataService;

    beforeEach(inject(function ($rootScope, $compile, _$httpBackend_, _dataService_) {
        $httpBackend = _$httpBackend_;
        dataService = _dataService_;

        spyOn(dataService, 'getFoodBase').and.callThrough();
        spyOn(dataService, 'getDayTimesData').and.callThrough();

        element = angular.element('<main-view></main-view>');
        $scope = $rootScope.$new();
        $compile(element)($scope);
        isolatSscope = element.isolateScope();
        controller = isolatSscope.$ctrl;

        $httpBackend.whenGET('./JSONdata/day-times-data.json').respond([{
            foods: [empty],
            show: true,
            result: {
                carbohyd: 0,
                prot: 0,
                fat: 0,
                kall: 0
            }
        }]);
        $httpBackend.whenGET('./JSONdata/food.json').respond([{'test': [1, 2, 3, 4, 5]}, {'test2': [1, 2, 3, 4, 5]}]);
        $httpBackend.flush();
    }));

    it('check properties', function () {
        expect(controller.base).toBeDefined();
        expect(controller.viewData.resultFinal).toBeDefined();
        expect(dataService.getFoodBase).toHaveBeenCalled();
        expect(dataService.getDayTimesData).toHaveBeenCalled();
    });

    it('check add food method', function () {
        spyOn(controller, 'calcResult');

        controller.addFood(0, {test: 'test'});

        expect(controller.viewData.dayTimes[0].foods[0].empty).toBeUndefined();
        expect(controller.viewData.dayTimes[0].foods[0]).toEqual({test: 'test'});
        expect(controller.calcResult).toHaveBeenCalled()
    });

    it('check remove food method', function () {
        spyOn(controller, 'calcResult');
        var food = {test: 'test'};
        controller.addFood(0, food);

        controller.removeFood(0, food);

        expect(controller.viewData.dayTimes[0].foods[0].empty).toBeDefined();
        expect(controller.viewData.dayTimes[0].foods.indexOf(food)).toBe(-1);
        expect(controller.calcResult).toHaveBeenCalled()
    });

    it('check toggleDayTime method', function () {
        expect(controller.viewData.dayTimes[0].show).toBe(true);
        controller.toggleDayTime(0);
        expect(controller.viewData.dayTimes[0].show).toBe(false);
        controller.toggleDayTime(0);
        expect(controller.viewData.dayTimes[0].show).toBe(true);
    });

    it('check calcResult method', function () {
        var food = {
            carbohyd: 10,
            prot: 10,
            fat: 10,
            kall: 10
        };
        controller.calcResult(0, food, true);

        expect(controller.viewData.dayTimes[0].result.prot).toBe(10);

        controller.calcResult(0, food, false);

        expect(controller.viewData.dayTimes[0].result.prot).toBe(0);
    })
});
