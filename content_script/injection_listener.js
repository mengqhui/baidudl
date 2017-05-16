// retrieve high speed link
window.addEventListener('receiveFs', function(req){
	var fs_id = req.detail.fs_id;
	$.ajax({
		type: "POST",
		url: "/share/set?web=1&channel=chunlei&web=1&bdstoken="+yunData.MYBDSTOKEN+"&clienttype=0",
		data: "fid_list=%5B"+fs_id+"%5D&schannel=0&channel_list=%5B%5D&period=0",
		dataType: "json",
		success: function(d){
			console.log(d);
			if(d.errno != 0){
				console.log(d);
				var err_msg = "Error: cant't share this file";
				if(d.errno == 110)err_msg = "Error: this file has been shared too frequently"
				var event = new CustomEvent("error", {detail: err_msg});
				window.dispatchEvent(event);
				return
			}
			console.log("Share success");
			var shareid = d.shareid;
			var frame = $("<iframe>", {id: "test_iframe_id", src: d.shorturl, type: "hidden"})
			$("body").append(frame)
			$(function(){
				$("#test_iframe_id").on('load', function(){
					var new_yunData = this.contentWindow.yunData;
					get_hlink(new_yunData, frame, shareid);
				})
			})
		}
	});
})
