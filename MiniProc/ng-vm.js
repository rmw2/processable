var vm = angular.module('vm', [])
	.controller('processCtrl', function ($scope) {
		$scope.P = new Process([
			'push $1',
			'mov $1 %r1',
			'mov $2 %r2',
			'add %r1 %r2',
		]);
	});
