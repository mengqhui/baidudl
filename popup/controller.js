var app = angular.module('app', []);
app.controller('control', function($scope){
	$scope.message = 'Running...';
	$scope.status = false;
})
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	$scope = angular.element(document.getElementById('app')).scope();
	$scope.$apply(function(){
		if(request.result.feedback != 'Success'){
			$scope.message = 'It\'s empty!';
		}else{
			$scope.links = request.result.links;
			$scope.status = true;
		}
	});
	sendResponse('Success');
})
