chrome.tabs.executeScript({file: "content_script/inject.js"}, callback);

function callback(){
	if(chrome.runtime.lastError){
		console.log(chrome.runtime.lastError.message);
	}
}
