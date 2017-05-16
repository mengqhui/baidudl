// initialize angular model
var app = angular.module('app', []);
var i;
app.controller('control', ['$scope', function($scope){
	$scope.message = 'Ready...';
	$scope.status = false;
	$scope.func = function(x){
		var fs_id = x.fs_id;
		i = $scope.links.indexOf(x);
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {fs_id: fs_id}, function(response) {
				console.log(response);
			});
		});
	}
}])

// add listener to handle received download links
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	$scope = angular.element(document.getElementById('app')).scope();
	if(request.type == "passLinks"){
		$scope.$apply(function(){
			if(request.result.feedback != 'Success'){
				console.log(request);
				$scope.message = 'It\'s empty!';
			}else{
				$scope.links = request.result.links;
				$scope.status = true;
			}
		});
		sendResponse('Success');
	}
	if(request.type == "passNewLink"){
		var hlink = request.result;
		$scope.$apply(function(){
			$scope.links[i].hlink = hlink;
		})
	}
})
// execute content script
chrome.tabs.executeScript({file: "content_script/inject.js"});
