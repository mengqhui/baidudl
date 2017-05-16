// variant base64 encoding function, copy from pan.baidu.com
function b64(t) {
	var e, r, a, n, o, i, s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	for (a = t.length,
	r = 0,
	e = ""; a > r; ) {
		if (n = 255 & t.charCodeAt(r++),
		r == a) {
			e += s.charAt(n >> 2),
			e += s.charAt((3 & n) << 4),
			e += "==";
		break
		}
		if (o = t.charCodeAt(r++),
		r == a) {
			e += s.charAt(n >> 2),
			e += s.charAt((3 & n) << 4 | (240 & o) >> 4),
			e += s.charAt((15 & o) << 2),
			e += "=";
			break
		}
		i = t.charCodeAt(r++),
		e += s.charAt(n >> 2),
		e += s.charAt((3 & n) << 4 | (240 & o) >> 4),
		e += s.charAt((15 & o) << 2 | (192 & i) >> 6),
		e += s.charAt(63 & i)
	}
	return e
};
u = new Function("return " + yunData.sign2)()

// get sign parameter
sign = b64(u(yunData.sign5, yunData.sign1));

// get path parameter from url
function getURLParameter(name) {
	var x = location.hash.split('/');
	var y = x[x.length-1].split('&')
	for(var i=0; i<y.length; i++){
		var e = y[i];
		e = e.split('=');
		if(e[0]==name)return e[1];
	}
	return null;
}

// retrieve download links
console.log('Retrieving links');
$.ajax({ 
	url: "/api/list?dir="+getURLParameter('path')+"&bdstoken="+yunData.MYBDSTOKEN+"&num=100&order=time&desc=1&clienttype=0&showempty=0&web=1&page=1",
	success: function(res){
		console.log('links retrieved');
		var dict = {};
		res.list.forEach(function(e){
			dict[e.fs_id] = e.path;
		})

		var fidlist = res.list.map(function(d){return d.fs_id})
		console.log('Passing links');
		$.ajax({
			type: "POST",
			url: uri = "/api/download?sign="+sign+"&timestamp="+yunData.timestamp+"&fidlist="+JSON.stringify(fidlist)+"&bdstoken="+yunData.MYBDSTOKEN,
			success: function(d){
				if(d.errno!=0)result = {feedback: 'Failure'}
				else{
					d.dlink.forEach(function(e){
						e.path = dict[e.fs_id];
						delete e['fs_id']
					})
					result = {feedback: 'Success', links: d.dlink}
				}

				// send download links to content script 
				var event = new CustomEvent("passMessage", {detail: result});
				window.dispatchEvent(event);
			}
		})
	}
})
