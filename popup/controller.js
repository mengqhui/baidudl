// initialize angular model
var app = angular.module('app', []);
app.controller('control', function($scope){
	$scope.message = 'Ready...';
	$scope.status = false;
})

// add listener to handle received message 
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

// execute content script
chrome.tabs.executeScript({file: "content_script/inject.js"}, function(){
	if(chrome.runtime.lastError){
		console.log(chrome.runtime.lastError.message);
	}
});
