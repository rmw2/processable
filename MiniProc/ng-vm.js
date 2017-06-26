var vm = angular.module('vm', [])
	.controller('processCtrl', function ($scope) {
		$scope.P = new Process([
			'push $1',
			'push $1 ',
			'mov 4(%rsp) %r0',
			'mov (%rsp) %r1',
			'add %r1 %r0',
			'push %r0',
			'jmp 2'
		]);
	});
