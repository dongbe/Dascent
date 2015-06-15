'use strict';

describe('Controller: MoncompteCtrl', function () {

  // load the controller's module
  beforeEach(module('dascentApp'));

  var MoncompteCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MoncompteCtrl = $controller('MoncompteCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
