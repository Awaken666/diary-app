'use strict';

describe('Services tests', function() {

    beforeEach(module('app'));

    describe('Calculation service tests', function() {

        var calculationService,
            $httpBackend;

        beforeEach(inject(function(_$httpBackend_, _calculationService_) {
            calculationService = _calculationService_;
            $httpBackend = _$httpBackend_;

            var obj = [{'test':[1,2,3,4,5]}];
            $httpBackend.whenGET('./JSONdata/food.json').respond(obj);
            $httpBackend.whenGET('./JSONdata/day-times-data.json').respond([1,2,3,4,5]);
            $httpBackend.flush();
        }));

        it('should return food object', function() {
            var foodObj = calculationService.calculateValues('test', 10);
            expect(foodObj.name).toBe('test');
            expect(foodObj.carbohyd).toBe(20);
        });

    });

    describe('Data service tests', function() {

        var obj = [
                {'test': [1,2,3,4,5], name: 'test'},
                {'test2': [6,7,8,9,10]}
            ],
            $httpBackend,
            dataService;

        beforeEach(inject(function(_$httpBackend_, _dataService_) {
            $httpBackend = _$httpBackend_;
            dataService = _dataService_;

            $httpBackend.whenGET('./JSONdata/food.json').respond(obj);
            $httpBackend.whenGET('./JSONdata/day-times-data.json').respond([{},{},{},{},{}]);
            $httpBackend.whenGET('./JSONdata/limits-data/proteins-phase1.json').respond('test');
        }));

        it('should load food base', function() {
            var foodBase;
            dataService.getFoodBase()
                .then((base) => {
                    foodBase = base;

                    expect(foodBase.test).toBeDefined();
                    expect(foodBase.test2).toBeDefined();
                });

            $httpBackend.flush();
        });

        it('should load food objects', function() {
            var foodObj;
            dataService.getFoodObjects()
                .then((objs) => {
                    foodObj = objs.data;

                    expect(foodObj.length).toBe(2);
                });

            $httpBackend.flush();
        });

        it('shold load day times data', function() {
            var dayTimeData;
            dataService.getDayTimesData()
                .then((data) => {
                    dayTimeData = data.data;

                    expect(dayTimeData.length).toBe(5);
                });

            $httpBackend.flush();
        });

        it('should load limits', function() {
            var limits;
            dataService.getLimitsData('proteins', 1)
                .then((data) => {
                    limits = data.data;

                    expect(limits).toBe('test');
                });

            $httpBackend.flush();
        })
    });

    describe('Validation service tests', function() {

        var validationService,
            $httpBackend;

        beforeEach(inject(function(_$httpBackend_, _validationService_) {
            validationService = _validationService_;
            $httpBackend = _$httpBackend_;

            var obj = [{'test':[1,2,3,4,5]}];
            $httpBackend.whenGET('./JSONdata/food.json').respond(obj);
            $httpBackend.flush();
        }));


        it('should return undefined', function() {
            spyOn(window, 'alert').and.callThrough();

            let bool_1 = validationService.foodAddValidation('', '');
            expect(window.alert).toHaveBeenCalled();
            expect(bool_1).toBeUndefined();

            let bool_2 = validationService.foodAddValidation('ere', '');
            expect(window.alert).toHaveBeenCalled();
            expect(bool_2).toBeUndefined();

            let bool_3 = validationService.foodAddValidation('test', '');
            expect(window.alert).toHaveBeenCalled();
            expect(bool_3).toBeUndefined();

            let bool_4 = validationService.foodAddValidation('test', 'mk');
            expect(window.alert).toHaveBeenCalled();
            expect(bool_4).toBeUndefined();

            let bool_5 =validationService.foodAddValidation('test', '-34');
            expect(window.alert).toHaveBeenCalled();
            expect(bool_5).toBeUndefined();
        });

        it('should return true', function() {
            var bool = validationService.foodAddValidation('test', '90');

            expect(bool).toBe(true);
        })

    });

    describe('Limits service tests', function() {

        var $httpBackend,
            limitsService,
            dataService;

        beforeEach(inject(function(_$httpBackend_, _limitsService_, _dataService_) {
            $httpBackend = _$httpBackend_;
            limitsService = _limitsService_;
            dataService =_dataService_;

            spyOn(dataService, 'getLimitsData').and.callThrough();
            $httpBackend.whenGET('./JSONdata/limits-data/proteins-phase1.json').respond('test');
            $httpBackend.whenGET('./JSONdata/food.json').respond([{},{}]);
        }));

        it('check setLimits method', function() {
            expect(limitsService.limitsData).toEqual({});
            limitsService.setLimits('proteins', 1);
            $httpBackend.flush();

            expect(dataService.getLimitsData).toHaveBeenCalled();
            expect(limitsService.limitsData.limits).toBeDefined();

        });
    });
});