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
sign = encodeURIComponent(sign);

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
		console.log("/api/download?sign="+sign+"&timestamp="+yunData.timestamp+"&fidlist="+JSON.stringify(fidlist)+"&bdstoken="+yunData.MYBDSTOKEN);
		$.ajax({
			type: "POST",
			url: "/api/download?sign="+sign+"&timestamp="+yunData.timestamp+"&fidlist="+JSON.stringify(fidlist)+"&bdstoken="+yunData.MYBDSTOKEN,
			success: function(d){
				console.log(d);
				if(d.errno!=0)result = {feedback: 'Failure'}
				else{
					d.dlink.forEach(function(e){
						e.path = dict[e.fs_id];
						e.hlink = "";
					})
					result = {feedback: 'Success', links: d.dlink}
				}

				// send download links to content script 
				var event = new CustomEvent("passLinks", {detail: result});
				window.dispatchEvent(event);
			}
		})
	}
})

window.addEventListener('receiveFs', function(req){
	var fs_id = req.detail.fs_id;
	$.ajax({
		type: "POST",
		url: "/share/set?web=1&channel=chunlei&web=1&bdstoken="+yunData.MYBDSTOKEN+"&clienttype=0",
		data: "fid_list=%5B"+fs_id+"%5D&schannel=0&channel_list=%5B%5D&period=0",
		dataType: "json",
		success: function(d){
			console.log("Share success");
			console.log(d);
			var shareid = d.shareid;
			var frame = $("<iframe>", {id: "test_iframe_id", src: d.shorturl, type: "hidden"})
			$("body").append(frame)
			$(function(){
				$("#test_iframe_id").on('load', function(){
					var new_yunData = this.contentWindow.yunData;
					$.ajax({
						type: "POST",
						url: "/api/sharedownload?sign="+new_yunData.SIGN+"&timestamp="+new_yunData.TIMESTAMP,
						data: "encrypt=0&product=share&uk="+new_yunData.SHARE_UK+"&primaryid="+new_yunData.SHARE_ID+"&fid_list=%5B"+new_yunData.FS_ID+"%5D",
						dataType: "json",
						success: function(d){
							console.log("Link received");
							var event = new CustomEvent("passNewLink", {detail: d.list[0].dlink});
							window.dispatchEvent(event);
							$.ajax({
								type: "POST",
								url: "/share/cancel?bdstoken="+yunData.MYBDSTOKEN+"&channel=chunlei&web=1&clienttype=0",
								data: "shareid_list=%5B"+shareid+"%5D",
								dataType: "json",
								success: function(d){
									frame.remove();
									console.log("Unshare success");
								}
							})
						}
					});
				})
			})
		}
	});
})
