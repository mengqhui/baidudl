// inject function, inject core.js to pan.baidu.com
console.log('Injecting code');
$.ajax({
	url: chrome.extension.getURL('/content_script/core.js'),
	success: function(res){
		console.log('Code injected');
		var s = document.createElement('script');
		s.textContent = res;
		document.documentElement.appendChild(s);
	}
})

// receive download links from web and send them to popup
window.addEventListener('passLinks', function(req){
	chrome.runtime.sendMessage({result: req.detail, type: "passLinks"}, function(res){
		console.log(res);
	})
})

window.addEventListener('passNewLink', function(req){
	chrome.runtime.sendMessage({result: req.detail, type: "passNewLink"}, function(res){
		console.log(res);
	})
})

chrome.runtime.onMessage.addListener(function(req, sender, sendResponse){
	var event = new CustomEvent("receiveFs", {detail: req});
	window.dispatchEvent(event);
	sendResponse({farewell: 'bye'});
})
