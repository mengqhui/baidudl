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
window.addEventListener('passMessage', function(req){
	chrome.runtime.sendMessage({result: req.detail}, function(res){
		console.log(res);
	})
})
