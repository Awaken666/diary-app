describe('Food component tests', function() {
    beforeEach(module('app'));

    var element,
        $scope,
        isolatSscope,
        controller;

    beforeEach(inject(function ($rootScope, $compile) {
        element = angular.element('<food></food>');
        $scope = $rootScope.$new();
        $compile(element)($scope);
        isolatSscope = element.isolateScope();
        controller = isolatSscope.$ctrl;
    }));

    it('check checkEmptyFood method', function() {
        var str = controller.checkEmptyFood({kall: '---'});
        expect(str).toBe('empty');

        str = controller.checkEmptyFood({kall: 90});
        expect(str).toBeUndefined();
    })
});