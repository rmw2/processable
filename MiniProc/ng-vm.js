var vm = angular.module('vm', [])
	.controller('processCtrl', function ($scope) {
		$scope.P = new Process([
			'push $1',
			'push $1 ',
			'mov $0 %r0',
			'loop: add $1 %r0',
			'mov 4(%rsp) %r1',
			'mov (%rsp) %r2',
			'add %r2 %r1',
			'push %r1',
			'jmp loop'
		]);
	});
