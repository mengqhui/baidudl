// initialize angular model
var app = angular.module('app', []);
app.controller('control', ['$scope', function($scope){
	$scope.message = 'Ready.';
	$scope.status = false;
	
	// function to generate high speed link
	$scope.generate = function(i){
		$scope.message = "Running...";
		var x = $scope.links[i];
		var fs_id = x.fs_id;
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {fs_id: fs_id}, function(response) {
				$scope.$apply(function(){
					$scope.links[i].hlink = response;
					$scope.message = "Ready.";
				})
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
	if(request.type == "error"){
		$scope.$apply(function(){
			$scope.message = request.result;
		})
	}
})
// execute content script
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	chrome.tabs.sendMessage(tabs[0].id, {greeting: "yes"}, function(response) {
		if(!response){
			chrome.tabs.executeScript({file: "content_script/sandbox.js"});
		}else{
			chrome.tabs.executeScript({code: "reload_js(chrome.extension.getURL('/content_script/injection.js'))"});
		}
	})
})
