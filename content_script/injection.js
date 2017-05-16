console.log("Code Injected");

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
$.ajax({// list files in current folder and get their fs_id
	url: "/api/list?dir="+getURLParameter('path')+"&bdstoken="+yunData.MYBDSTOKEN+"&num=100&order=time&desc=1&clienttype=0&showempty=0&web=1&page=1",
	success: function(res){
		console.log('links retrieved');
		var dict = {};
		res.list.forEach(function(e){
			dict[e.fs_id] = e.path;
		})

		var fidlist = res.list.map(function(d){return d.fs_id})
		console.log('Passing links');
		$.ajax({// retrieve download links of files in current folder
			type: "POST",
			url: "/api/download?sign="+sign+"&timestamp="+yunData.timestamp+"&fidlist="+JSON.stringify(fidlist)+"&bdstoken="+yunData.MYBDSTOKEN,
			success: function(d){
				if(d.errno!=0)result = {feedback: 'Failure'}
				else{
					d.dlink.forEach(function(e){
						e.path = dict[e.fs_id];
						e.hlink = "";
					})
					result = {feedback: 'Success', links: d.dlink}
				}

				// send download links to sandbox
				var event = new CustomEvent("passLinks", {detail: result});
				window.dispatchEvent(event);
			}
		})
	}
})

function get_hlink(new_yunData, frame, shareid){
	console.log(new_yunData);
	$.ajax({
		type: "POST",
		url: "/api/sharedownload?sign="+new_yunData.SIGN+"&timestamp="+new_yunData.TIMESTAMP,
		data: "encrypt=0&product=share&uk="+new_yunData.SHARE_UK+"&primaryid="+new_yunData.SHARE_ID+"&fid_list=%5B"+new_yunData.FS_ID+"%5D",
		dataType: "json",
		success: function(d){
			console.log(d);
			if(d.errno != 0){
				console.log(d);
				var err_msg = "Warning: can't get high speed link";
				if(d.errno == -20){
					err_msg = "Error: your action is too frequent";
					unshare(shareid, frame);
				}
				var event = new CustomEvent("error", {detail: err_msg});
				window.dispatchEvent(event);
				return
			}
			console.log("Link received");
			var event = new CustomEvent("passNewLink", {detail: d.list[0].dlink});
			window.dispatchEvent(event);
			unshare(shareid, frame)
		}
	});
}
function unshare(shareid, frame){
	$.ajax({
		type: "POST",
		url: "/share/cancel?bdstoken="+yunData.MYBDSTOKEN+"&channel=chunlei&web=1&clienttype=0",
		data: "shareid_list=%5B"+shareid+"%5D",
		dataType: "json",
		success: function(d){
			if(d.errno != 0){
				console.log(d);
				var err_msg = "Warning: can't auto unshare the file";
				var event = new CustomEvent("error", {detail: err_msg});
				window.dispatchEvent(event);
				return
			}
			frame.remove();
			console.log("Unshare success");
		}
	})
}
