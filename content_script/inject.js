$.ajax({
	url: chrome.extension.getURL('/content_script/core.js'),
	success: function(res){
		var s = document.createElement('script');
		s.textContent = res;
		document.documentElement.appendChild(s);
		console.log('Code injected');
	}
})

window.addEventListener('passMessage', function(req){
	chrome.runtime.sendMessage({result: req.detail}, function(res){
		console.log(res);
	})
})
