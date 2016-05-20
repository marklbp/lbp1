"use strict";
var websocket_host = "im.qbao.com:12346";
//var websocket_host_ssl = "im.qbao.com:12346";
var websocket_host = "192.168.7.173:12346";
var smile_url = "http://im.qbao.com/static/smiles";
var _mt_delivery_report = 1;
var _mt_content_messages = 2;
var _mt_response = 3;
var _mt_heartbeat_req = 4;
var _mt_heartbeat_resp = 5;
var _mt_auth_req = 6;
var _mt_sys_cmd = 7;
var _mt_sys_report = 8;

var _version = "1.0";
var _cookie_uid = "uid";
var _cookie_jid = "jSessionId";
var _cookie_hash = "hash"
var _cookie_ticket = "ticket";
var _cookie_uuid = "uuid";
var _cookie_threads = "threads";
var _m_seq = 1;
var _auth_seq = 2;
var _authed = false;
var _three_minute_timeout = null;
var _login_check_timeout = null;
var _debug = true;
var _heartbeat_time_out = 10000; //心跳的间隔时间
var _heartbeat_count_out = 2; //多少次心跳无回应，任务已经断开，重连
var _last_message_recieved = 0;
var bufferpack = new BufferPack();

var currentGid = null;

var currentShopId,pageSum,message;

//放入默认的userid，ticket
//setCookie(_cookie_uid, "3412580");
//setCookie(_cookie_ticket, "hash123456");


var urlAddress = "http://enterprise.qbao.com/";
var im;
var currentShopId,currentTalkUserId,currentTalkUserNickName,talkType,myNickName,thread;
var currentTalkMsg;
var currentRecordPageIndex;
var myNickName;
//初始化方法
$(function() {
	//对话插件
	var userId = getCookie(_cookie_uid);

	function IMplugin() {
		return IMplugin.prototype.init();
	}
	IMplugin.prototype = {
		init: function() {
			return this;
		},
		fansLimit: 7, //每页显示的粉丝数
		btnSwitch: true,
		closeBtnSwitch: function() {
			if (!this.btnSwitch) {
				return false;
			}
			this.btnSwitch = false;
			return true;
		},
		openBtnSwitch: function() {
			this.btnSwitch = true;
		},
		messageTHandler:function(msg){
			if(msg&&msg.body&&msg.body.M&&msg.body.M.length){
				var obj=msg.body.M[0];
				
				var type=$.parseJSON(obj.P);
				if(type.CTT&&type.CTT==6){
					return msg;
				}
				
				var name =obj.NN;
				name=eval(obj.NN);
				msg.body.M[0].NN=name;
				if(obj.MT=="4"){
					var bid=obj.BID?obj.BID:obj.R;
					msg.body.M[0].T=obj.MT+":"+bid+":"+obj.S;
				}
			}
			return msg;
		},
		getRemoteData: function(dataurl, param, type, async) {
			//data: "name=John&location=Boston",
			var res = "";
			if (!type) {
				type = "GET";
			}
			if (!async) {
				async = false;
			}
			if (!param) {
				param = "";
			}
			$.ajax({
				url: urlAddress + dataurl,
				data: param,
				type: type,
				async: async,
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					alert("请求失败");
					res = false;
				},
				success: function(resdata) {
					res = resdata;
				}
			});
			return res;
		},
		closeAllWindow: function() {
			//粉丝
			document.getElementById("dialogue-area").style.display = "none";
			//对话
			document.getElementById("message_container").style.display = "none";
		},
		closeHistoryWindow:function(){
			//历史记录右侧边框
			document.getElementById("message_contents").style.right="0px";
			document.getElementById("messageform").style.right="0px";
			document.getElementById("talk-record-area").style.display="none";
		},
		getIdByElementId: function(eleId) {
			if (!eleId)
				return null;
			eleId = eleId.split("-");
			return eleId[eleId.length - 1];
		},
		getBusinessList: function() {
			var resData = this.getRemoteData("merchantUser/webchat/listShopIdAndShopName.html");
			if (!resData || !resData.data)
				return;
			myNickName=resData.data.getPersonalMerUserName;
			var data = resData.data.employers;
			var htmlStr = ""; //currentShopId: "27"shopName: "113"
			for (var i = 0; i < data.length; i++) {
				htmlStr += '<li class="business-li">';
				htmlStr += '  <div class="business-name checkstyle">';
				htmlStr += '    <img src="images/im-hotel-banner.png"/>';
				htmlStr += '    <span>' + data[i].shopName + '</span>';
				htmlStr += '  </div>';
				htmlStr += '  <div class="col col1" id="col-business-' + data[i].merUserId + '">';
				htmlStr += '    <div class="fans-title checkstyle" id="fans-title-' + data[i].merUserId + '">';
				htmlStr += '      <img src="images/im-fans-banner_03.png"/>关注粉丝'
				htmlStr += '    </div>';
				htmlStr += '    <div class="buyer-title checkstyle" id="buyer-title-' + data[i].merUserId + '">买家' + '</div>';
				htmlStr += '    <div class="col col3">';
				htmlStr += '      <div class="buyer-list" id="buyer-list-' + data[i].merUserId + '">' + '</div>';
				htmlStr += '    </div>';
				htmlStr += '  </div>';
				htmlStr += '</li>';
			}
			document.getElementById("business-list").innerHTML = htmlStr;
		},
		getFansList: function(pageIndex, id) { //获得粉丝页面
			var offset = (pageIndex - 1) * this.fansLimit;
			var params = "merUserId=" + id + "&offset=" + offset + "&limit=" + this.fansLimit;
			if (currentGid) {
				params += "&gid=" + currentGid;
			}
			var resData = this.getRemoteData("merchantUser/webchat/fans.html", params);
			if (!resData.message||resData.message=="验证失败") {
				this.fillNoneFans(id);
				return false;
			}
			if(!resData.success)
				return false;
			resData = $.parseJSON(resData.message);
			if (!resData.data.items || !resData.data.items.length) {
				this.fillNoneFans(id);
				return false;
			}
			resData.data.pageIndex = pageIndex;
			this.fillFansList(id, resData.data.items);
			pageSum = parseInt(resData.data.total_count / this.fansLimit); //全局变量
			if (resData.data.total_count % this.fansLimit > 0) {
				pageSum++;
			}
			this.pagenation(pageIndex, "ul-paginator");
			return true;
		},
		fillNoneFans: function(id) {
			document.getElementById("dialogue-list-area").innerHTML = "<h2 style='line-height:580px;text-align:center'>没有粉丝</h2>";
		},
		fillFansList: function(id, items) {
			var htmlStr = "<ul>";
			for (var i = 0; i < items.length; i++) {
				htmlStr += '<li>';
				htmlStr += '  <img src="http://user.qbcdn.com/user/avatar/queryMyAvata65/' + items[i].userId + '/nosrc/1" class="img-head" onerror="this.src=\'http://www.qbcdn.com/images/userpicnone.gif\'"/>';
				htmlStr += '  <span class="fans-name">' + items[i].nickName + '</span>';
				htmlStr += '  <input type="button" shopid="' + id + '" id="fans-' + items[i].userId + '-' + items[i].nickName + '" value="联系粉丝" class="btn-contact" />';
				htmlStr += '</li>';
			}
			htmlStr += "</ul>"
			document.getElementById("dialogue-list-area").innerHTML = htmlStr;
			$('#dialogue-list-area .btn-contact').click(function(e) {
				currentShopId = $(e.currentTarget).attr("shopid");
				currentTalkUserId = e.currentTarget.id.split("-")[1];

				console.log($(this).attr('id'));
				var info = $(this).attr('id').split('-');
				var userData = {
					userId: info[1],
					nickName: info[2]
				};
				updater.showNewChat(userData);
			});
		},
		pagenation: function(pageIndex, id, total) {
			var ignoreHtml = "<li>...</li>";
			var htmlStr = '<li id="paginator-prev-warp"><div id="paginator-prev"></div></li>';
			if (pageSum > 5) { //分页条总数
				if (pageIndex < 4) {
					for (var i = 1; i < 4; i++) {
						if (i == pageIndex)
							htmlStr += '<li class="current-page">' + i + '</li>';
						else
							htmlStr += '<li class="pagebtn">' + i + '</li>';
					}
					htmlStr += ignoreHtml + '<li class="pagebtn">' + pageSum + '</li>';
				} else if (pageSum - pageIndex < 3) {
					htmlStr += '<li class="pagebtn">' + 1 + '</li>' + ignoreHtml;
					for (var i = pageSum - 2; i <= pageSum; i++) {
						if (pageIndex == i) {
							htmlStr += '<li class="current-page">' + i + '</li>';
						} else {
							htmlStr += '<li class="pagebtn">' + i + '</li>';
						}
					}
				} else {
					htmlStr += '<li class="pagebtn">1</li>' + ignoreHtml;
					for (var i = pageIndex - 2; i <= pageIndex + 2; i++) {
						if (pageIndex == i) {
							htmlStr += '<li class="current-page">' + i + '</li>';
						} else {
							htmlStr += '<li class="pagebtn">' + i + '</li>';
						}
					}
					htmlStr += ignoreHtml + '<li class="pagebtn">' + pageSum + '</li>';
				}
			} else {
				for (var i = 1; i <= pageSum; i++) {
					if (i == pageIndex)
						htmlStr += '<li class="current-page">' + i + '</li>';
					else
						htmlStr += '<li class="pagebtn">' + i + '</li>';
				}
			}
			htmlStr += '<li class="" id="paginator-next-warp"><div id="paginator-next"></div></li>';
			document.getElementById(id).innerHTML = htmlStr;
		},
		getFansArea: function(id) { //获取粉丝区域列表
			var resData = this.getRemoteData("merchantUser/webchat/fangroups.html?merUserId=" + id);
			if (!resData.success) {
				console.error("请求失败！");
			}
			resData = $.parseJSON(resData.message).data;
			this.fillFansArea(id, resData.items);
		},
		fillFansArea: function(id, items) {
			var sumFans = 0;
			var htmlStr = '';
			for (var i = 0; i < items.length; i++) {
				htmlStr += '<li id="area-' + items[i].gid + '"><span>' + items[i].gname + '(' + items[i].fans_num + ')</span></li>';
				sumFans += items[i].fans_num;
			}
			var firstStr = '<li id="area-0" class="select-color1"><span>全部粉丝（' + sumFans + '）</span></li>';
			document.getElementById("area-list").innerHTML = firstStr + htmlStr;
			$('#area-list li').click(function() {
				console.log($(this).attr('id'));
				currentGid = $(this).attr('id').split('-')[1];
				if (currentGid === '0') {
					currentGid = null;
				}
				im.getFansList(1, currentShopId)
			});
		},
		getHistoryTalkRecord: function() {
			var talkCount = $(".list-group").find("li").length;
			var res=this.getHistoryData(talkCount);
			res = $.parseJSON(res.message).data.items;
			for (var i = 0; i < res.length; i++) {
				var content = $.parseJSON(res[i].P);
				var uid = getCookie(_cookie_uid);
				if (res[i].BID == res[i].S) {
					this.fillItem(content.M, "me");
				} else {
					this.fillItem(content.M, "you");
				}
			}
		},
		getHistoryData:function(talkCount){
			var res = this.getRemoteData("merchantUser/webchat/chatHistory.html", "merUserId=" + currentShopId + "&clientid=" + currentTalkUserId + "&offset=" + talkCount + "&limit="+this.fansLimit);
			return res;
		},
		fillItem: function(content, role) {
			if (content.indexOf("[img]") > -1) {
				content = '<img style="max-width:200px;" src="' + content.substring(5, content.length - 6) + '">';
			}
			var html = "";
			html += '<li class="list-group-item '+role+'" style="border:none">';
			html += '<div class="chatItemContent">';
			if(role=="me")
				html += '<img click="showProfile" src="http://www.qbcdn.com/images/userpicnone.gif" class="avatar img-circle3" onerror="this.src=\'http://www.qbcdn.com/images/userpicnone.gif\'">';
			else
				html += '<img click="showProfile" src="http://www.qbcdn.com/images/userpicnone.gif" class="avatar img-circle2" onerror="this.src=\'http://www.qbcdn.com/images/userpicnone.gif\'">';
			
			html += '<div class="cloud cloudText">';
			html += '<div class="sendStatus"></div>';
			html += '<div class="cloudContent">' + content + '</div>';
			if(role=="me")
				html += '<img class="cloudArrow" src="images/im-talk-right-angle.png">';
			else
				html += '<img class="cloudArrow" src="images/im-talk-left-angle.png">';
			html += '</div>';
			html += '</div>';
			html += '</li>';
			$(".list-group").prepend(html);
		},
		getTalkRecord:function(){
			var offset=(recordpageIndex-1)*this.fansLimit;
			var res=this.getHistoryData(offset);
			if(res.message){
				res=$.parseJSON(res.message);
				this.fillTalkRecord(res.data);
			}else{
				alert("历史列表获取错误");
			}
		},
		fillTalkRecord:function(talkList){
			var totalCount=talkList.total_count;
			talkList=talkList.items; 
			var html="";
			var day="";
			for (var i = 0;i<talkList.length;i++) {
				var name="";
				if(talkList[i].NN.indexOf("\\")>-1){
					name=eval(talkList[i].NN);	
				}else{
					name=talkList[i].NN;
				}
				
				var content=$.parseJSON(talkList[i].P).M;
				
				if (content.indexOf("[img]") > -1) {
					content = '<img style="max-width:200px;" src="' + content.substring(5, content.length - 6) + '">';
				}
				
				var time=parseInt(talkList[i].CT);
				time=new Date(time*1000);
				var timedate=time.getFullYear()+"-"+(time.getMonth()+1)+"-"+time.getDate();
				if(day!=timedate){
					html+='<li class="record-date">日期：'+timedate+'</li>';
					day=timedate;
				}
				html+='<li class="record-contain">';
				html+='<span class="record-name">'+name+'&nbsp;'+timedate+'&nbsp;'+time.getHours()+':'+time.getMinutes()+':'+time.getSeconds()+'</span>';
				html+='<span class="record-content">'+content+'</span>';
				html+='</li>';
			}
			document.getElementById("record-list").innerHTML=html;
			pageSum = parseInt(totalCount / this.fansLimit); //全局变量
			if (totalCount % this.fansLimit > 0) {
				pageSum++;
			}
			this.pagenation(recordpageIndex,"record-paginator");
		}
	};

	// 插件调用
	im = new IMplugin();
	im.getBusinessList();

	// 初始样式
	im.closeAllWindow();
	// 显示默认对话
	$("#talk-default").css("display", "block");

	//获得ticket和UID
	var res = im.getRemoteData("merchantUser/webchat/getHashKey.html");
	if (!res)
		return;
	res = res.data;
	setCookie(_cookie_uid, res[1]);
	setCookie(_cookie_ticket, res[0]);
	//	setCookie(_cookie_uid, "3412580");
	//	setCookie(_cookie_ticket, "hash123456");


	// 手风琴－－商家
	function collapse(parentNode, colElement, expandElement, fansElement, isExpand) {
		var col = $("" + colElement + "");
		var parentElement = $("" + parentNode + "");
		//判断是否展开手风琴
		if (isExpand) {
			col.next("" + expandElement + "").slideDown(0);
		} else {
			col.next("" + expandElement + "").slideUp(0);
		}
		parentElement.delegate(colElement, "click", function(eve) {
			//展开页面
			$(eve.currentTarget).next("" + expandElement + "").slideToggle();
		});
		parentElement.delegate("" + fansElement + "", "click", function(eve) {
			//当前商家id
			currentShopId = im.getIdByElementId(eve.currentTarget.id); //全局
			currentGid = null;
			im.getFansList(1, currentShopId)
			im.getFansArea(currentShopId);
			im.closeAllWindow();
			document.getElementById("dialogue-area").style.display = "block";
		});
	}
	collapse("#business-list", ".business-name", ".col1", ".fans-title", false);

	// 分页按钮绑定事件
	var pageIndex = 1;
	// 上一页
	var btnSwitch = true;
	$("#ul-paginator").delegate("#paginator-prev-warp", "click", function() {
		if (!im.closeBtnSwitch())
			return;
		if (pageIndex <= 1)
			return;
		pageIndex--;
		im.getFansList(pageIndex, currentShopId);
		im.openBtnSwitch();
	});

	// 下一页
	$("#ul-paginator").delegate("#paginator-next-warp", "click", function() {
		if (!im.closeBtnSwitch())
			return;
		if (pageIndex >= pageSum)
			return;
		pageIndex++;
		im.getFansList(pageIndex, currentShopId);
		im.openBtnSwitch();
	});

	// 数字按钮
	$("#ul-paginator").delegate(".pagebtn", "click", function(eve) {
		if (!im.closeBtnSwitch())
			return;
		pageIndex = parseInt(eve.currentTarget.innerHTML);
		im.getFansList(pageIndex, currentShopId);
		im.openBtnSwitch();
	});
	
	//历史记录分页按钮绑定事件
	var recordpageIndex = 1;
	// 上一页
	var btnSwitch = true;
	$("#record-paginator").delegate("#paginator-prev-warp", "click", function() {
//		if (!im.closeBtnSwitch())
//			return;
		if (recordpageIndex <= 1)
			return;
		recordpageIndex--;
		im.getTalkRecord(recordpageIndex);
//		im.openBtnSwitch();
	});

	// 下一页
	$("#record-paginator").delegate("#paginator-next-warp", "click", function() {
//		if (!im.closeBtnSwitch())
//			return;
		if (recordpageIndex >= pageSum)
			return;
		recordpageIndex++;
		im.getTalkRecord(recordpageIndex);
//		im.openBtnSwitch();
	});

	// 数字按钮
	$("#record-paginator").delegate(".pagebtn", "click", function(eve) {
//		if (!im.closeBtnSwitch())
//			return;
		recordpageIndex = parseInt(eve.currentTarget.innerHTML);
		im.getTalkRecord(recordpageIndex);
//		im.openBtnSwitch();
	});
	
	
	
	
	
	
	

	// 商家个人切换
	$("#group-panel").find(".group-item").on("click", function(eve) {
		var id = eve.currentTarget.id;
		$("#group-panel").find(".group-item").removeClass("select-banner");
		$("#group-panel").find(".group-item").find(".red-point").css("display", "none");
		$("#" + id).addClass("select-banner");
		$("#" + id).find(".red-point").css("display", "block");
		$(".group-area").css("display", "none");
		var target = $("#" + id).attr("target");
		document.getElementById(target).style.display = "block";
	});

	document.getElementById("group-item-business").click();
	//聊天栏上方的历史纪录按钮
	document.getElementById("more").onclick = function() {
		im.getHistoryTalkRecord();
	};
	
	//聊天栏右边的历史纪录按钮
	document.getElementById("talk-record-btn").onclick=function(){
		var isOpen=document.getElementById("talk-record-area").style.display;
		if(isOpen==""||isOpen=="none"){
			var recordpageIndex = 1;
			im.getTalkRecord();
			document.getElementById("message_contents").style.right="251px";
			document.getElementById("messageform").style.right="251px";
			document.getElementById("talk-record-area").style.display="block";
		}else{
			im.closeHistoryWindow();
		}
	}
	
	document.getElementById("close-record-btn").onclick=function(){
		document.getElementById("message_contents").style.right="0px";
		document.getElementById("messageform").style.right="0px";
		document.getElementById("talk-record-area").style.display="none";
	}
	
	document.getElementById("close-talk-dlg-btn").onclick=function(){
		document.getElementById("message_container").style.display = "none";
	}
});




function get_image_size(img_url, left) {
	var img = new Image();
	img.src = img_url;
	if (img.complete) {
		getImgOriginalSize(img, left);
		img = null;
	} else {
		img.onload = function() {
			getImgOriginalSize(img, left);
			img = null;
		};
	}
}

function getImgOriginalSize(img, left) {
	if (img.width > img.height) {
		if (img.width > 800) {
			$("#slidePic").animate({
				top: '30px',
				left: left,
				width: '800px'
			});
		} else {
			$("#slidePic").animate({
				top: '30px',
				left: left,
				width: img.width
			});
		}
	} else {
		if (img.height > 500) {
			$("#slidePic").animate({
				top: '30px',
				left: left,
				height: '500px'
			});
		} else {
			$("#slidePic").animate({
				top: '30px',
				left: left,
				height: img.height
			});
		}
	}
}

function open_image(img_url, ele) {
	$("#mask").css("display", "block");
	$("#slidePic").css("display", "block");
	$("#slidePic img").attr("src", img_url)
	var oRect = ele.getBoundingClientRect();
	x = oRect.left;
	y = oRect.top;
	$("#slidePic").css("left", "" + x + "px").css("top", "" + y + "px").css("width", "100px");
	var left = ($("body").width() - 300) / 2;
	get_image_size(img_url, left);

}

function close_mask() {
	$("#slidePic").css("display", "none");
	$("#mask").css("display", "none");
}

$('#image_upload_input').on('change', function(e) {
	ImageSend.asyncUploadImage(e);
	$(this).val('');
});

$("#span-img").on("click", function(eve) {
	// ImageSend.openImagePanel();
	// eve.stopPropagation();
	$('#image_upload_input').click();
});

var ImageSend = {
	isImagePanelOpen: false,
	asyncUploadImage: function(e) {
		$("#image_upload_processing").css("display", "inline-block");
		// $("#image_upload_form").submit();
		var formData = new FormData();

		formData.append('image_upload', e.target.files[0]);

		$.ajax({
			method: 'POST',
			url: 'http://enterprise.qbao.com/merchantUser/webchat/fileupload.html',
			data: formData,
			dataType: 'json',
			cache: false,
			contentType: false,
			processData: false,
		}).done(function(resp) {
			if (resp.success) {
				// ImageSend.sendImgMsg(resp.message);
				var img = "[img]" + resp.message + "[/img]";
				newMessage($('#messageform'), img);
				$("#image_upload_processing").css("display", "none");
				$("#upload_panel").css("display", "none");
			} else {
				$("#image_upload_processing").css("display", "none");
				alert("图片上传失败");
			}
		})
	},
	sendImgMsg: function(imgurl) {
		var img = "[img]" + imgurl + "[/img]";
		var form = $("#messageform");
		var message = form.formToDict();
		message["message"] = img;
		$.ajax({
			type: "POST",
			url: "/messages/private?jSessionId=" + getCookie(_cookie_jid),
			data: message,
			success: function(data) {
				var resp = data;
				if (resp.status == 1) {
					var msg = resp.message;
					var arrThread = msg.T.split(":");
					var temMsgs = {};
					temMsgs[msg.U] = msg;
					if (updater.recievedMessages[msg.T] == undefined) {
						updater.recievedMessages[msg.T] = {};
						updater.recievedMessages[msg.T][msg.U] = msg;
					} else {
						updater.recievedMessages[msg.T][msg.U] = msg;
					}
					updater.showMessage(temMsgs);
					updater.showMessageList();
				} else if (resp.status == -1) {
					alert("太快了，怎么受的了");
				} else {}
			},
			failure: function(errMsg) {
				alert(errMsg);
			}
		});
	},
	openImagePanel: function() {
		if (this.isImagePanelOpen) {
			$("#upload_panel").css("display", "none");
			this.isImagePanelOpen = false;
		} else {
			document.getElementById("upload_panel").style.display = "block";
			this.isImagePanelOpen = true;
			$("#smile_panel").css("display", "none");
			this.isSmilePanelOpen = false;
		}
	}
}

var AudioPlay = {
	isplay: 0,
	swf_path: './scripts/im/jplayer',
	isbroadcastid: '',
	playAudio: function(voiceUrl, id, isLeft) {
		$("#audio_play").jPlayer("destroy");
		$("#audio_play").jPlayer({
			ready: function(event) {
				$(this).jPlayer("setMedia", {
					mp3: voiceUrl
				}).jPlayer("play");
			},
			preload: "metadata",
			swfPath: AudioPlay.swf_path,
			supplied: "mp3",
			solution: "flash,html",
			pause: function() {
				AudioPlay.isplay = 0; //暂停播放
			},
			play: function() { //开始播放
				AudioPlay.isplay = 1;
			},
			ended: function() { //播放完毕
				AudioPlay.isplay = 0;
				AudioPlay.callback_end(id, isLeft);
			}
		});
	},
	handler_play: function(ele, isLeft) {
		var voiceUrl = $(ele).attr("voiceurl");
		if (voiceUrl == '' || typeof voiceUrl == 'undefined') return false;
		var currentVoiceId = $(ele).attr("id");
		if (AudioPlay.isbroadcastid != '') { //正在载入的音频
			if (currentVoiceId == AudioPlay.isbroadcastid) {
				if (AudioPlay.isplay == 1) { //正在播放，执行暂停操作
					$("#audio_play").jPlayer("pause");
					AudioPlay.changeStatus(0, isLeft, currentVoiceId);
				} else {
					$("#audio_play").jPlayer("play");
					AudioPlay.changeStatus(1, isLeft, currentVoiceId);
				}
				return false;
			} else { //操作的语音不是同一个
				$("#audio_play").jPlayer("stop");
				AudioPlay.changeStatus(0, isLeft, AudioPlay.isbroadcastid);
			}
		}
		AudioPlay.playAudio(voiceUrl, currentVoiceId, isLeft);
		AudioPlay.isbroadcastid = currentVoiceId; //重新载入正在播放的音频ID
		AudioPlay.changeStatus(1, isLeft, currentVoiceId);
	},
	changeStatus: function(status, isLeft, id) {
		if (status == 0) {
			if (isLeft) {
				$("#" + id + " span").css("background", "url('images/im-sound-new.png') no-repeat scroll 0 0 rgba(0, 0, 0, 0)");
			} else {
				$("#" + id + " span").css("background", "url('images/im-sound-new.png') no-repeat scroll -18px -1px rgba(0, 0, 0, 0)");
			}
		} else if (status == 1) {
			if (isLeft) {
				$("#" + id + " span").css("background-image", "url('images/im-voice-left.gif')");
			} else {
				$("#" + id + " span").css("background", "url('images/im-voice-right.gif') no-repeat scroll 16px 0 rgba(0, 0, 0, 0)");
			}
		}
	},
	callback_end: function(id, isLeft) {
		if (isLeft) {
			$("#" + id + " span").css("background", "url('images/im-sound-new.png') no-repeat scroll 0 0 rgba(0, 0, 0, 0)");
		} else {
			$("#" + id + " span").css("background", "url('images/im-sound-new.png') no-repeat scroll -18px -1px rgba(0, 0, 0, 0)");
		}
	}
};

var SMileParse = {
	selectSmilePanel: null,
	isSmilePanelOpen: false,
	getExtraData: function() {
		var extra = [
			["加油", "加油.png"],
			["可爱", "可爱.png"],
			["困", "困.png"],
			["坏笑", "坏笑.png"],
			["大哭", "大哭.png"],
			["庆祝", "庆祝.png"],
			["微笑", "微笑.png"],
			["惊讶", "惊讶.png"],
			["晕", "晕.png"],
			["流汗", "流汗.png"],
			["生气", "生气.png"],
			["疑问", "疑问.png"],
			["着急", "着急.png"],
			["花心", "花心.png"],
			["足球", "足球.png"],
			["钱多多", "钱多多.png"]
		];
		return extra;
	},

	getBaseData: function() {
		var base = [
			["亲亲", "亲亲.png"],
			["努力", "努力.png"],
			["呲牙", "呲牙.png"],
			["哭", "哭.png"],
			["困", "困.png"],
			["大哭", "大哭.png"],
			["害羞", "害羞.png"],
			["微笑", "微笑.png"],
			["惊讶", "惊讶.png"],
			["愤怒", "愤怒.png"],
			["抓狂", "抓狂.png"],
			["晕", "晕.png"],
			["滴汗", "滴汗.png"],
			["疑问", "疑问.png"],
			["翻白眼", "翻白眼.png"],
			["花心", "花心.png"],
			["衰", "衰.png"],
			["闭嘴", "闭嘴.png"],
			["难过", "难过.png"],
			["鬼脸", "鬼脸.png"]
		];
		return base;
	},

	getFacePngByCode: function(msg, isBase) {
		var smileurl = "";
		var smilecode = "";
		if (isBase) {
			for (var i = 0; i < this.getBaseData().length; i++) {
				smileurl = '<img src="' + smile_url + '/baseb/' + this.getBaseData()[i][1] + '" style="height:48px;" />';
				smilecode = "\\[" + this.getBaseData()[i][0] + "\\]";
				msg = msg.replace(new RegExp(smilecode, "gm"), smileurl)
					//msg = msg.replace(smilecode,smileurl);
			}
			return msg;
		} else {
			for (var i = 0; i < this.getExtraData().length; i++) {
				smileurl = '<img src="' + smile_url + '/extra1b/' + this.getExtraData()[i][1] + '" style="height:60px" />';
				smilecode = "[smiley][#" + this.getExtraData()[i][0] + "][/smiley]";
				msg = msg.replace(smilecode, smileurl);
			}
			return msg
		}
	},

	createSmilePanel: function() {
		var html = "";
		var imgurl = "";
		var smileurl = "";
		for (var i = 0; i < this.getBaseData().length; i++) {
			html += '<div class="div-face-list">';
			html += '<a href="javascript:void(0)" name="' + this.getBaseData()[i][0] + '"class="thumbnail" style="margin:3px;" onclick="SMileParse.handler_normalSmile(this)">';
			smileurl = '<img src="' + smile_url + '/baseb/' + this.getBaseData()[i][1] + '" style="" />';
			html += smileurl;
			html += '</a>';
			html += '</div>';
		}
		$("#normalSmile").html(html);
		html = "";
		for (var i = 0; i < this.getExtraData().length; i++) {
			html += '<div class="col-sm-6 col-md-3" style="padding:0 2px">';
			html += '<a href="javascript:void(0)" name="' + this.getExtraData()[i][0] + '" class="thumbnail" style="margin:3px" onclick="SMileParse.handler_bigSmile(this)">';
			smileurl = '<img src="' + smile_url + '/extra1b/' + this.getExtraData()[i][1] + '" style="height:48px;" />';
			html += smileurl;
			html += '</a>';
			html += '</div>';
		}
		$("#bigSmile").html(html);
	},

	handler_normalSmile: function(ele) {
		var jEle = $(ele);
		var smile = jEle.attr("name");
		smile = "[" + smile + "]";
		this.insertAtCaret($("#input_message").get(0), smile);
		this.openSmilePanel();
	},

	handler_bigSmile: function(ele) {
		var jEle = $(ele);
		var smile = jEle.attr("name");
		smile = "[smiley][#" + smile + "][/smiley]";
		var form = $("#messageform");
		var message = form.formToDict();
		message["message"] = smile;
		$.ajax({
			type: "POST",
			url: "/messages/private?jSessionId=" + getCookie(_cookie_jid),
			data: message,
			success: function(data) {
				//var resp = JSON && JSON.parse(data) || $.parseJSON(data); 
				var resp = data;
				if (resp.status == 1) {
					var msg = resp.message;
					var arrThread = msg.T.split(":");
					//                        if(arrThread[0] != 2){
					var temMsgs = {};
					temMsgs[msg.U] = msg;
					if (updater.recievedMessages[msg.T] == undefined) {
						updater.recievedMessages[msg.T] = {};
						updater.recievedMessages[msg.T][msg.U] = msg;
					} else {
						updater.recievedMessages[msg.T][msg.U] = msg;
					}
					updater.showMessage(temMsgs);
					updater.showMessageList();
					//                        }
				} else if (resp.status == -1) {
					alert("太快了，怎么受的了");
				} else {}
			},
			failure: function(errMsg) {
				alert(errMsg);
			}
		});

	},
	insertAtCaret: function(ele, myValue) {
		var $t = $(ele)[0];
		if (document.selection) {
			ele.focus();
			sel = document.selection.createRange();
			sel.text = myValue;
			ele.focus();
		} else
		if ($t.selectionStart || $t.selectionStart == '0') {
			var startPos = $t.selectionStart;
			var endPos = $t.selectionEnd;
			var scrollTop = $t.scrollTop;
			$t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
			ele.focus();
			$t.selectionStart = startPos + myValue.length;
			$t.selectionEnd = startPos + myValue.length;
			$t.scrollTop = scrollTop;
		} else {
			ele.value += myValue;
			ele.focus();
		}
	},
	smilePanelToggle: function() {
		var that = this;
		$("#tab_Smile li").click(function(evnt) {
			var currentTarget = $(evnt.currentTarget);
			if (currentTarget.attr("class") == 'active')
				return;
			if (that.selectSmilePanel == null) {
				that.selectSmilePanel = currentTarget;
				$("#tab_Smile li:nth-child(2)").attr("class", "active");
				$("#tab_Smile li:nth-child(1)").attr("class", "");
			} else {
				that.selectSmilePanel.attr("class", "")
				currentTarget.attr("class", "active");
				that.selectSmilePanel = currentTarget;
			}
			if (that.selectSmilePanel.attr("id") == "tabli_normalSmile") {
				$("#normalSmile").css("display", "block");
				$("#bigSmile").css("display", "none");
			} else if (that.selectSmilePanel.attr("id") == "tabli_bigSmile") {
				$("#normalSmile").css("display", "none");
				$("#bigSmile").css("display", "block");
			}
		});
	},

	openSmilePanel: function() {
		if (this.isSmilePanelOpen) {
			$("#smile_panel").css("display", "none");
			this.isSmilePanelOpen = false;
		} else {
			$("#smile_panel").css("display", "block");
			this.isSmilePanelOpen = true;
			$("#upload_panel").css("display", "none");
			ImageSend.isImagePanelOpen = false;
		}
	},
};

function checkBrowser() {
	//Detect browser and write the corresponding name
	if (navigator.userAgent.search("MSIE") >= 0) {
		var position = navigator.userAgent.search("MSIE") + 5;
		var end = navigator.userAgent.search("; Windows");
		var version = navigator.userAgent.substring(position, end);
		return false;
	} else if (navigator.userAgent.search("Chrome") >= 0) {
		var position = navigator.userAgent.search("Chrome") + 7;
		var end = navigator.userAgent.search(" Safari");
		var version = navigator.userAgent.substring(position, end);
		return true;
	} else if (navigator.userAgent.search("Firefox") >= 0) {
		var position = navigator.userAgent.search("Firefox") + 8;
		var version = navigator.userAgent.substring(position);
		return true;
	} else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) { //<< Here
		var position = navigator.userAgent.search("Version") + 8;
		var end = navigator.userAgent.search(" Safari");
		var version = navigator.userAgent.substring(position, end);
		return true;
	} else if (navigator.userAgent.search("Opera") >= 0) {
		var position = navigator.userAgent.search("Version") + 8;
		var version = navigator.userAgent.substring(position);
		return false;
	} else {
		return false;
	}
}
$(document).ready(function() {

	if (!checkBrowser()) {
		document.write("<a href='https://www.mozilla.org/zh-CN/firefox/new/?icn=tabz'>火狐</a>和<a href='http://www.google.com/intl/en/chrome/browser/?dclid=CP20yJ-SgMACFYFxvAod8JAAeg#brand=CHMB&utm_campaign=en&utm_source=en-ha-na-us-sk&utm_medium=ha'>chrome</a>,以及与chrome同内核的浏览器");
		return;
	}
	if (!window.console) window.console = {};
	if (!window.console.log) window.console.log = function() {};

	$("#messageform").bind("submit", function() {
		newMessage($("#messageform"));
		return false;
	});
	$("#messageform").bind("keypress", function(e) {
		if (e.keyCode == 13) {
			newMessage($("#messageform"));
			return false;
		}
	});
	//  $("body").click(function(eve){
	//       if(eve.target.id=="span-face")
	//            return;
	//     $("#smile_panel").css("display","none"); 
	//     SMileParse.isSmilePanelOpen = false;
	//     $("#upload_panel").css("display","none");
	//     ImageSend.isImagePanelOpen = false; 
	//  });

	$("#tab_contact_message li").click(tabToggle);
	$("#message").select();
	if (getCookie(_cookie_jid) != undefined) {
		$(window).on("beforeunload", function(evt) {
			return "确定离开吗";
		});
	}
	SMileParse.createSmilePanel();
	SMileParse.smilePanelToggle();
	$(window).on("unload", function(evt) {});
	if ($("#container_main").css("display") != "block") {
		_three_minute_timeout = setTimeout("document.location.reload()", 180000);
		_login_check_timeout = setTimeout("checkLogin()", 5000);
	} else {
		var threads = getCookie(_cookie_threads);
		if (threads != undefined && threads != "") {
			threads = threads.split("|");
			doBeforeThreads(threads);
		}
		// getFriendsList();
		updater.start();
	}
});

function logout(isfresh) {
	/**
	$(window).off("beforeunload");
	$.getJSON("/logout", {
	  jSessionId: getCookie(_cookie_jid)
	}, function(data) {
	  if (data["meta"]["code"] == 0) {
	    delCookie("ticket");
	    delCookie("uid");
	    delCookie("uuid");
	    delCookie("jSessionId");
	    if (isfresh) {
	      document.location.reload();
	    }
	  } else {}
	});
	*/
}

function doBeforeThreads(threads) {
	for (var i = 0; i < threads.length; i++) {
		var thread = threads[i].replace(new RegExp("-", "gm"), ":");
		updater.clientThreads[i] = thread;
	}
}

function checkLogin() {
	$.getJSON("/checklogin", {
		uuid: getCookie(_cookie_uuid)
	}, function(data) {
		if (data["meta"]["code"] == 0) {
			$("#container_index").css("display", "none");
			$("#container_main").css("display", "block");
			var threads = data["data"]["threads"];
			doBeforeThreads(threads);
			getFriendsList();
			updater.start();
			if (_three_minute_timeout != null) {
				clearTimeout(_three_minute_timeout);
			}
			$(window).on("beforeunload", function(evt) {
				return "确定离开吗";
			});
			updater.showMessageList();
		} else {
			clearTimeout(_login_check_timeout);
			_login_check_timeout = setTimeout("checkLogin()", 5000);
		}
	});

}
var selectTarget = null;

function tabToggle(event) {
	currentTarget = $(event.currentTarget);
	//if(currentTarget.attr("class") == 'active')
	//   return ;
	if (selectTarget == null) {
		selectTarget = currentTarget;
		selectTarget.attr("class", "active");
		if (currentTarget.attr("id") == "tabli_message") {
			$("tabli_contact").css("class", "");
		} else {
			$("tabli_message").css("class", "");
		}
		$("#tab_contact_message li:nth-child(2)").attr("class", "active");
		$("#tab_contact_message li:nth-child(1)").attr("class", "");
	} else {
		selectTarget.attr("class", "")
		currentTarget.attr("class", "active");
		selectTarget = currentTarget;
	}
	if (selectTarget.attr("id") == "tabli_message") {
		$("#current_message").css("display", "block");
		$("#contact").css("display", "none");
	} else if (selectTarget.attr("id") == "tabli_contact") {
		$("#current_message").css("display", "none");
		$("#contact").css("display", "block");
	}
}

function search_contact(ele) {
	if ($(ele).val() != undefined && $(ele).val() != "") {
		var keyWord = $(ele).val();
		var html = "";
		var i = 0;
		var user = null;
		var group = null;
		for (var item in updater.Users) {
			user = updater.Users[item];
			if (-1 != user.nickName.indexOf(keyWord)) {
				html += createContactItem(user);
			}
		}
		for (var item in updater.Groups) {
			group = updater.Groups[item];
			if (-1 != group.name.indexOf(keyWord)) {
				html += createContactItem(group);
			}
		}
		if (html != "") {
			$("#current_message").css("display", "none");
			$("#contact").css("display", "block");
			$("#contact .list-group").html(html);
		}
	} else {
		$("#contact .list-group").html(updater.contactHtml);
		return;
	}

}

function getFriendsList() {
	$.getJSON("/friendslist", {
		jSessionId: getCookie(_cookie_jid)
	}, function(data) {
		if (data["count"] == undefined) {
			if (data["meta"]["code"] == 500 || data["meta"]["code"] == 401 || data["meta"]["code"] == 403) {
				logout(true);
			}
			return;
		}
		var count = data.count;
		var items = data.items;
		Pinyin.initialize({});
		/**items = items.sort(function(x,y){
		        if(x.nickName == "")
		            x.nickName = "无";
		        if(y.nickName == "")
		            y.nickName = "无"; 
		        return Pinyin.getCamelChars(x.nickName).charAt(0).toUpperCase() > Pinyin.getCamelChars(y.nickName).charAt(0).toUpperCase();
		   });*/

		var firstAlpha = "";
		var item = null;
		//pinyin.getCamelChars(this.value);
		var html = "";
		for (var i = 0; i < items.length; i++) {
			var uid = getCookie(_cookie_uid);
			item = items[i];

			updater.Users[item.userId] = item;
			//except me
			if (item.userId == uid)
				continue;
			if (item.userId != uid) {
				if (firstAlpha == "") {
					firstAlpha = Pinyin.getCamelChars(item.nickName).charAt(0).toUpperCase();
					html += createAlphaItem(firstAlpha);
					html += createContactItem(item);
				} else {
					currentAlpha = Pinyin.getCamelChars(item.nickName).charAt(0).toUpperCase();
					if (currentAlpha != firstAlpha) {
						html += createAlphaItem(currentAlpha);
						html += createContactItem(item);
						firstAlpha = currentAlpha;
					} else {
						html += createContactItem(item);
					}
				}
			}
		}
		//me 
		var uid = getCookie(_cookie_uid);
		var myinfo = updater.Users[uid];
		var myHtml = '<img class="img-circle" src="' + myinfo.avatarPic + '" style="width:42px;height:42px" />';
		myHtml += "&nbsp;&nbsp;&nbsp;&nbsp;" + myinfo.nickName;
		$("#my_content").html(myHtml);
		getGroupsList(html);
	});
}

function getGroupsList(contactHtml) {
	$.getJSON("/groups", {
		jSessionId: getCookie(_cookie_jid)
	}, function(data) {
		var count = data.count;
		var items = data.items;
		var html = "";
		html += createAlphaItem("群组");
		if (items != undefined) {
			for (var i = 0; i < items.length; i++) {
				item = items[i];
				updater.Groups[item.id] = item;
				html += createContactItem(item);
			}
		}
		html = html + contactHtml;
		updater.contactHtml = html;
		$("#contact .list-group").html(html);
		updater.showMessageList();
	});
}

function createAlphaItem(alpha) {
	var html = '<a href="" class="list-group-item alpha" style="border:none;background-color:#f5f5f5">';
	html += alpha;
	html += '</a>';
	return html;
}

function createContactItem(item) {
	var thread = item.thread;
	var arrThread = thread.split(":");
	if (parseInt(arrThread[0]) == 2) { //group
		var html = '<a href="javascript:void(0);" onclick="updater.handler_contactcontents_change(\'' + item.thread + '\',true)" class="list-group-item" style="border:none">';
		html += '<img class="img-circle" src="' + item.avatar + '" style="width:50px;height:50px" />';
		html += '&nbsp;&nbsp;&nbsp;&nbsp;<strong>' + updater.subString(item.name, 10, true) + '</strong> ';
		html += '</a>';
	} else {
		var html = '<a href="javascript:void(0);" onclick="updater.handler_contactcontents_change(\'' + item.thread + '\',false)" class="list-group-item" style="border:none">';
		html += '<img class="img-circle" src="' + item.avatarPic + '" style="width:50px;height:50px" />';
		html += '&nbsp;&nbsp;&nbsp;&nbsp;<strong>' + item.nickName + '</strong> ';
		html += '</a>';
	}
	return html;
}

function utf8ByteLength(str) {
	if (!str) return 0;
	var escapedStr = encodeURI(str);
	var match = escapedStr.match(/%/g);
	return match ? (escapedStr.length - match.length * 2) : escapedStr.length;
}

function genSeq() {
	_m_seq = (_m_seq + 1) % 4294967296;
	return _m_seq;
}

function getCookie(name) {
	//  var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
	//  r=document.cookie
	//  return r ? r[1] : undefined;
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if (arr = document.cookie.match(reg))
		return unescape(arr[2]);
	else
		return null;
}

function setCookie(name, value) {
	var Days = 30;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

function delCookie(name, path, domain) {
	if (getCookie(name)) {
		document.cookie = name + "=" +
			((path) ? ";path=" + path : "") +
			((domain) ? ";domain=" + domain : "") +
			";expires=Thu, 01 Jan 1970 00:00:01 GMT";
	}
}

function createMessage(messagetype, body) {
	var body = JSON.stringify(body);
	var format = '!LBB';
	var values = [body.length, messagetype, 0];
	var packed = bufferpack.pack(format, values);
	return [packed, "\r\n", body];
}

function parseMessage(message) {
	var msgs = message.split("\r\n");
	if (msgs.length >= 2) {
		var header = msgs[0];
		var buffer = new Uint8Array(header.length);
		for (var i = 0; i < header.length; i++) {
			var char_ = header.charCodeAt(i);
			buffer[i] = char_;
		}

		var format = '!LBB';
		var headers = bufferpack.unpack(format, buffer, 0);
		var body = message.substring(msgs[0].length + 2); // "\r\n"
		if (headers && utf8ByteLength(body) == headers[0]) {
			try {
				return {
					"mtype": headers[1],
					"body": JSON.parse(body)
				};
			} catch (err) {
				throw err;
				//
			}
		}
	}
	return false;
}

function newMessage(form, imgMsg) {
	var message = form.formToDict();
	var ids = message.thread.split(":")
	if (imgMsg) {
		message["message"] = imgMsg;
	}
	$.ajax({
		type: "POST",
		url: urlAddress + "/merchantUser/webchat/sendMessage.html",
		// The key needs to match your method's input parameter (case-sensitive).
		data: {
			merUserId: ids[1],
			toid: ids[2],
			message: message.message,
			contenttype: imgMsg ? 3 : 1,
			nn:myNickName,
		},
		success: function(data) {
			var resp = data;
			if (resp.success) {
				var msg = $.parseJSON(resp.message).data;
				if(msg.exception){
					alert("发送错误");
					return;
				}
				//因为发送消息没有返回当前对话用户的昵称，所以要在这里加上nn
				msg.NN = currentTalkUserNickName;

				var arrThread = msg.T.split(":");
				//                if(arrThread[0] != 2){
				var temMsgs = {};
				temMsgs[msg.U] = msg;
				if (updater.recievedMessages[msg.T] == undefined) {
					updater.recievedMessages[msg.T] = {};
					updater.recievedMessages[msg.T][msg.U] = msg;
				} else {
					updater.recievedMessages[msg.T][msg.U] = msg;
				}
				updater.showMessage(temMsgs);
				updater.showMessageList();
				
			} else if (resp.status == -1) {
				alert("太快了，怎么受的了");
			} else {

			}
		},
		failure: function(errMsg) {
			alert(errMsg);
		}
	});
	form.find("input[type=text]").val("").select();
	$("#input_message").val("").select();
}

jQuery.fn.formToDict = function() {
	var fields = this.serializeArray();
	var json = {}
	for (var i = 0; i < fields.length; i++) {
		json[fields[i].name] = fields[i].value;
	}
	if (json.next) delete json.next;
	return json;
};
function openNewOrderTab(id){
	window.open("http://oc.qbao.com/order/detail/"+id+".html");
}
function openNewProductTab(id){
	window.open("");
}
var updater = {
	socket: null,
	recievedMessages: {},
	recievedCount: {},
	recievedTotalCount: 0,
	clientThreads: [],
	Strangers: {},
	Users: {},
	Groups: {},
	contactHtml: "",
	current_thread: "",
	title_text: "",
	title_timerID: null,
	connected: false,
	heartbeat_time: null,
	heartbeat_count: 0,
	reconnect_count: 0,
	handler_heartbeat: function() {
		if (_debug) {
			console.log("setTimeout");
		}
		if (updater.heartbeat_count >= _heartbeat_count_out) {
			updater.close();
			updater.start();
		}
		clearTimeout(updater.heartbeat_time);
		if (_last_message_recieved != 0 && (Date.parse(new Date()) - _last_message_recieved) / 1000 > 60) {
			updater.heartbeat_count++;
			var _auth_seq = genSeq();
			var body = {
				"I": _auth_seq,
				"P": Date.parse(new Date())
			};
			if (_debug) {
				console.log("发送心跳");
			}
			updater.send(_mt_heartbeat_req, body);
		}
		updater.heartbeat_time = setTimeout(updater.handler_heartbeat, _heartbeat_time_out);
	},
	newtext: function() {
		clearTimeout(this.title_timerID)
		document.title = updater.title_text.substring(1, updater.title_text.length) + updater.title_text.substring(0, 1)
		updater.title_text = document.title.substring(0, updater.title_text.length)
		if (updater.recievedTotalCount > 0) {
			this.title_timerID = setTimeout(updater.newtext, 300);
		} else {
			document.title = "钱宝IM网页端";
		}
	},
	process_content_msg: function(originMessage) {
		var messages = originMessage.body.M;
		var message = null;
		for (var i = 0; i < messages.length; i++) {
			message = messages[i];
			//     if(message.S == getCookie(_cookie_uid))
			//         continue;
			if (message.MT == 1 || message.MT == 9)
				continue;
			if (updater.recievedMessages[message.T] == undefined) {
				updater.recievedMessages[message.T] = {};
				updater.recievedMessages[message.T][message.U] = message;
				var arrThread = message.T.split(":");
				if (arrThread[0] == 2) {
					if (message.S != getCookie(_cookie_uid)) {
						updater.recievedCount[message.T] = 1;
						updater.recievedTotalCount++;
					} else {
						updater.recievedCount[message.T] = 0;
					}
				} else {
					updater.recievedCount[message.T] = 1;
					updater.recievedTotalCount++;
				}
			} else {
				if (updater.recievedMessages[message.T][message.U] == undefined) {
					updater.recievedMessages[message.T][message.U] = message;
					var arrThread = message.T.split(":");
					if (arrThread[0] == 2) {
						if (message.S != getCookie(_cookie_uid)) {
							updater.recievedCount[message.T] ++;
							updater.recievedTotalCount++;
						}
					} else {
						updater.recievedCount[message.T] ++;
						updater.recievedTotalCount++;
					}
				}
			}
			if (updater.recievedTotalCount > 0) {
				updater.title_text = "你有新消息";
				document.title = updater.title_text;
				updater.title_timerID = setTimeout(updater.newtext, 100)
			}
			if (message.T == updater.current_thread) {
				var temMsgs = {};
				temMsgs[message.U] = message;
				updater.showMessage(temMsgs);
			}
		}
		updater.showMessageList();
	},
	process: function(originMessage) {
		switch (originMessage.mtype) {
			case _mt_content_messages:
				updater.response(originMessage);
				// @TODO
				updater.process_content_msg(originMessage);
				break;
			case _mt_response:
				if (originMessage.body.I == _auth_seq) {
					if (originMessage.body.EC != 0) {
						if (_debug) {
							console.log("登录聊天服务器失败！");
							console.log(originMessage.body.EM);
						}
					} else {
						_authed = true;
						if (_debug) {
							console.log("登录聊天服务器成功！");
						}
					}
				}
				break;
			case _mt_heartbeat_req:
				updater.echo(originMessage);
				break;
			case _mt_heartbeat_resp:
				this.heartbeat_count--;
				if (_debug) {
					console.log("心跳回复");
				}
				break;
			case _mt_sys_cmd:
				var payload = JSON && JSON.parse(originMessage.body.P) || $.parseJSON(originMessage.body.P);
				if (payload.CMD == 1) {
					$(window).off("beforeunload");
					logout(true);
				}
				break;
			default:
				break;
		}
	},
	start: function() {
		var https = 'https:' == document.location.protocol ? true : false;
		if (https) {
			var url = "wss://" + websocket_host_ssl;
		} else {
			var url = "ws://" + websocket_host;
		}
		try {
			updater.socket = new WebSocket(url);
			if (updater.socket == undefined || updater.socket == null) {
				logout(true);
			}
		} catch (err) {
			logout(true);
			return;
		}
		updater.socket.onopen = function(event) {
			updater.connected = true;
			_last_message_recieved = Date.parse(new Date());
			updater.heartbeat_time = setTimeout(updater.handler_heartbeat, _heartbeat_time_out);
			updater.auth();
		};

		updater.socket.onclose = function(event) {
			if (_debug) {
				console.log("websocket closed");
				console.log(event);
			}
			updater.connected = false;
			clearTimeout(updater.handler_heartbeat);
			if (updater.reconnect_count < 5) {
				console.log("reconnect after 3 second");
				setTimeout(function() {
					console.log("reconnecting...");
					updater.close();
					updater.reconnect_count++;
					updater.start();
				}, 3000);
			} else {
				logout(true);
			}
		};

		updater.socket.onerror = function(event) {
			if (_debug) {
				console.log("error occur")
				console.log(event);
			}
			clearTimeout(updater.handler_heartbeat);
			updater.connected = false;
			if (updater.reconnect_count < 5) {
				console.log("reconnect after 3 second");
				setTimeout(function() {
					console.log("reconnecting...");
					updater.close();
					updater.reconnect_count++;
					updater.start();
				}, 3000);
			} else {
				logout(true);
			}
		};

		updater.socket.onmessage = function(event) {
			var str = base64.decode(event.data);
			var originMessage = parseMessage(str);
			
			originMessage=im.messageTHandler(originMessage);
			_last_message_recieved = Date.parse(new Date());
			if (_debug) {
				console.log(originMessage);
			}
			if (originMessage) {
				updater.process(originMessage);
			}
		};
	},
	close: function() {
		updater.socket.close();
	},

	parseSmile: function(smilecode) {
		if (typeof smilecode == "string") {
			if (/\[smiley\]/.test(smilecode)) {
				// [smiley][#坏笑][/smiley]
				/\[smiley\]\[#(.*)\]\[\/smiley\]/.test(smilecode);
				var name = RegExp.$1;
				var url = smile_url + "/" + name + ".png";
			} else {
				/\[(.*)\]/.test(smilecode);
				var name = RegExp.$1;
				var url = smile_url + "/" + name + ".png";
			}
			return url;
		} else {
			return "";
		}
	},


	showMessage: function(messages) {
		var right = "";
		var html = "";
		var temMessages = [];
		var i = 0;
		for (var item in messages) {
			temMessages[i++] = messages[item];
		}
		temMessages.sort(function(x, y) {
			return x['CT'] > y["CT"];
		})
		for (var i = 0; i < temMessages.length; i++) {
			message = temMessages[i];
			if (message.MT == 2 || message.MT == 4) {
				html += updater.processMsg(message);
			} else if (message.MT == 3) {
				html += updater.processPubMsg(message);
			}
		}
		$("#message_contents").find(".list-group").append(html);
		//对话框滚动到底部
		var dd=document.getElementById("message_contents");
		dd.scrollTop=dd.scrollHeight-dd.offsetHeight;
	},


	processPubMsg: function(message) {
		var payload = JSON && JSON.parse(message.P) || $.parseJSON(message.P);
		var uid = getCookie(_cookie_uid);
		var html = "";
		var isRight = false;
		if (uid == message.S) {
			isRight = true;
		}
		var userinfo = null;
		var arrThread = message.T.split(":");
		if (arrThread[0] == 2) {
			userinfo = updater.getUserInfo(message.S);
		} else if (arrThread[0] == 3) {
			if (message.S == undefined) {
				userinfo = updater.getUserInfo(thread[1]);
			} else {
				userinfo = updater.getUserInfo(message.S);
			}
		} else {
			if (isRight) {
				userinfo = updater.getUserInfo(parseInt(uid));
			} else {
				var sendId = arrThread[1];
				if (sendId == parseInt(uid)) {
					sendId = arrThread[2];
				}
				userinfo = updater.getUserInfo(sendId);
			}
		}
		userinfo.nickName = message.NN;
		userinfo.avatarPic = message.S;
		switch (parseInt(payload.CTT)) {
			case 1:
			case 2:
				var msg = SMileParse.getFacePngByCode(payload.M, true);
				msg = msg.replace("<script", "").replace("</script>", "");
				if (isRight) {
					html += updater.createMeBubbleMsg(userinfo.avatarPic, msg);
				} else {
					html += updater.createYouBubbleMsg(userinfo.avatarPic, msg)
				}
				break;
			case 3: //img
				var img_src = payload.M;
				img_src = img_src.replace("[img]", "").replace("[/img]", "");
				if (isRight) {
					img_src = '<a href="javascript:void(0)" onclick="open_image(\'' + img_src + '\',this)"  title=""><img src="' + img_src + '" style="max-width:200px" alt="" /> </a>';
					html += updater.createMeBubbleMsg(userinfo.avatarPic, img_src);
				} else {
					img_src = '<a href="javascript:void(0)" onclick="open_image(\'' + img_src + '\',this)" title=""><img src="' + img_src + '" style="max-width:200px" alt="" /> </a>';
					html += updater.createYouBubbleMsg(userinfo.avatarPic, img_src);
				}

				break;
			case 4: //voice
				var voice_src = payload.M;
				voice_src = voice_src.replace("[voice]", "").replace("[/voice]", "");
				if (isRight) {
					voice_src = '<a href="javascript:void(0)" onclick="AudioPlay.handler_play(this,0)" id="' + message.U + '" voiceurl="' + voice_src + '"><span style="display:inline-block;width:48px;height:20px;float:right;cursor:pointer;background: url(\'images/im-sound-new.png\') no-repeat scroll -18px -1px rgba(0, 0, 0, 0);">  </span></a>';
					html += updater.createMeBubbleMsg(userinfo.avatarPic, voice_src);
				} else {
					voice_src = '<a href="javascript:void(0)" onclick="AudioPlay.handler_play(this,1)" id="' + message.U + '" voiceurl="' + voice_src + '"><span style="display:inline-block;width:25px;height:20px;float:left;cursor:pointer;background: url(\'images/im-sound-new.png\') no-repeat scroll 0px 0px rgba(0, 0, 0, 0);">  </span></a>';
					html += updater.createYouBubbleMsg(userinfo.avatarPic, voice_src);
				}
				break;
			case 5: //smile
				var msg = SMileParse.getFacePngByCode(payload.M, false);
				if (isRight) {
					html += updater.createMeBubbleMsg(userinfo.avatarPic, msg);
				} else {
					html += updater.createYouBubbleMsg(userinfo.avatarPic, msg);
				}
				break;
			case 6: //json
				switch (parseInt(payload.ST)) {
					case 601:
						html += updater.createPubMultiMsg(payload)
						break;
					case 602:
						html += updater.createPubItemMsg(payload, message.CT);
						break;
					case 701:
						html = updater.createLink(payload, userinfo.avatarPic, isRight);
						break;
					case 901:
						html = updater.createProduct(userinfo.avatarPic, payload);
						break;
					case 902:
						html = updater.createOrder(userinfo.avatarPic, payload);
					break;
				}
				break;
			case 7: //location
				var M = JSON && JSON.parse(payload.M) || $.parseJSON(playload.M);
				var location = '<div style="display:inline-block;width:320px"><img src="http://api.map.baidu.com/staticimage?center=' + M.lng + ',' + M.lat + '&width=300&height=200&zoom=17" /><br />' + M.address + '</div>';
				if (isRight) {
					html += '<li class="list-group-item me" style="border:none;' + right + '">' + location + '&nbsp;&nbsp;&nbsp;&nbsp;<div style="display:inline-block;width:55px"><img src="' + userinfo.avatarPic + '" style="width:50px;height:50px" class="img-circle" /></div></li>';
				} else {
					html += '<li class="list-group-item me" style="border:none"><div style="display:inline-block;width:55px"><img src="' + userinfo.avatarPic + '" style="width:50px;height:50px" class="img-circle" /></div>&nbsp;&nbsp;&nbsp;&nbsp;' + location + "</li>";
				}
				break;

		}
		return html;
	},


	createPubMultiMsg: function(payload) {
		var M = JSON && JSON.parse(payload.M) || $.parseJSON(payload.M);
		var html = '';
		var i = 0;
		html += '<li class="list-group-item me" style="border:none;text-align:center">';
		html += '<div class="media">';
		html += '    <div class="mediaPanel">';
		for (var item in M.items) {
			if (i == 0) {
				html += '        <a target="_blank" href="' + M.items[item].url + '">';
				html += '            <div class="mediaImg">';
				html += '                <div class="mediaImgPanel"> <img style="visibility: inherit; height: 182.5px; width: 365px; top: -9.25px; left: 0px;" src="' + M.items[item].img_url + '"> </div>';
				html += '                <div class="mediaImgFooter">';
				html += '                    <p class="mesgTitleTitle left">' + M.items[item].title + '</p>';
				html += '                    <div class="clr"></div>';
				html += '                </div>';
				html += '            </div>';
				html += '         </a>';
			} else {
				if (i == 1) {
					html += '         <div class="mediaContent">';
				}
				html += '            <a target="_blank" href="' + M.items[item].url + '" style="height:58px;">';
				html += '                <div class="mediaMesg"> <span class="mediaMesgDot"></span>';
				html += '                    <div class="mediaMesgTitle left">';
				html += '                        <p class="left">' + M.items[item].title + '</p>';
				html += '                        <div class="clr"></div>';
				html += '                    </div>';
				html += '                    <div class="mediaMesgIcon right"> <img src="' + M.items[item].img_url + '"> </div>';
				html += '                    <div class="clr"></div>';
				html += '                </div>';
				html += '            </a>';
			}
			i++;
		}
		html += '        </div>';
		html += '    </div>';
		html += '</div>';
		html += '</li>';
		return html;
	},

	createProduct: function(avatarPic, payload) {
		var product = JSON && JSON.parse(payload.M) || $.parseJSON(payload.M);
		var html = '';

		html += '<div class="product-item" onclick="openNewProductTab(\''+product.id+'\')">';
		html += '  <img src="' + product.img_url + '"/>';
		html += '  <p class="product-title">' + product.title + '</p>';
		html += '  <p class="product-price">' + product.price + ' 钱宝币</p>';
		html += '</div>';

		html = updater.createYouBubbleMsg(avatarPic, html);

		return html;
	},
	
	createOrder: function(avatarPic, payload) {
		var product = JSON && JSON.parse(payload.M) || $.parseJSON(payload.M);
		var html = '';

		html += '<div class="order-item" onclick="openNewOrderTab(\''+product.id+'\')">';
		html += '  <img src="' + product.img_url + '"/>';
		html += '  <p class="order-title">订单号:&nbsp;' + product.id + '</p>';
		html += '  <p class="order-num">数量:&nbsp;' + product.number + '件</p>';
		html += '  <p class="order-state">状态:&nbsp;' + product.state + '</p>';
		html += '  <p class="order-price">' + parseInt(product.total)*100 + '&nbsp;钱宝币</p>';
		html += '</div>';

		html = updater.createYouBubbleMsg(avatarPic, html);

		return html;
	},

	createPubItemMsg: function(payload, CT) {
		var M = JSON && JSON.parse(payload.M) || $.parseJSON(payload.M);
		var html = '';
		html += '<li class="list-group-item  me" style="border:none;text-align:center">';
		html += '<div class="media">';
		html += '    <div class="mediaPanel">';
		html += '<a target="_blank" style="text-decoration: none;" href="' + M.url + '">';
		html += '    <div class="mediaHead">';
		html += '        <span class="title left">' + M.title + '</span>';
		html += '        <span class="time right">' + updater.getLocalDate(CT) + '</span>';
		html += '        <div class="clr"></div>';
		html += '    </div>';
		html += '    <div class="mediaImg">';
		html += '        <img style="visibility: inherit; height: 648.889px; width: 365px; top: -242.444px; left: 0px;" src="' + M.img_url + '">';
		html += '    </div>';
		html += '    <div class="mediaContent mediaContentP">';
		html += '    <p>' + M.digest + '</p>';
		html += '</div>';
		html += '</a>';
		html += '<div class="mediaFooter">';
		html += '    <a target="_blank" style="text-decoration: none;" href="' + M.url + '"></a>';
		html += '    <a target="_blank" style="text-decoration: none;" href="' + M.url + '">';
		html += '        <span class="mesgIcon left"></span><span style="line-height:39px;" class="left">查看全文</span>';
		html += '        <div class="clr"></div>';
		html += '    </a>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
		html += '</li>';
		return html;
	},


	processMsg: function(message) {
		var uid = getCookie(_cookie_uid);
		var payload = JSON && JSON.parse(message.P) || $.parseJSON(message.P);
		var isRight = false;
		var html = "";
		if (uid == message.S) {
			isRight = true;
		}
		if (isRight) {
			right = "text-align:right"
		}
		var userinfo = null;
		var arrThread = message.T.split(":");
		if (arrThread[0] == 2) {
			userinfo = updater.getUserInfo(message.S);
		} else if (arrThread[0] == 3) {
			if (message.S == undefined) {
				userinfo = updater.getUserInfo(arrThread[1]);
			} else {
				userinfo = updater.getUserInfo(message.S);
			}
		} else {
			if (isRight) {
				userinfo = updater.getUserInfo(parseInt(uid));
			} else {
				var sendId = arrThread[1];
				if (sendId == parseInt(uid)) {
					sendId = arrThread[2];
				}
				userinfo = updater.getUserInfo(sendId);
			}
		}
		userinfo.nickName = message.NN;
		userinfo.avatarPic = message.S;
		switch (parseInt(payload.CTT)) {
			case 1:
			case 2:
				var msg = SMileParse.getFacePngByCode(payload.M, true);
				msg = msg.replace("<script", "").replace("</script>", "");
				if (isRight) {
					html += updater.createMeBubbleMsg(userinfo.avatarPic, msg);
				} else {
					html += updater.createYouBubbleMsg(userinfo.avatarPic, msg)
				}
				break;
			case 3: //img
				var img_src = payload.M;
				img_src = img_src.replace("[img]", "").replace("[/img]", "");
				if (isRight) {
					img_src = '<a href="javascript:void(0)" onclick="open_image(\'' + img_src + '\',this)" title=""><img src="' + img_src + '" style="max-width:200px" alt="" /> </a>';
					html += updater.createMeBubbleMsg(userinfo.avatarPic, img_src);
				} else {
					img_src = '<a href="javascript:void(0)" onclick="open_image(\'' + img_src + '\',this)" title=""><img src="' + img_src + '" style="max-width:200px" alt="" /> </a>';
					html += updater.createYouBubbleMsg(userinfo.avatarPic, img_src);
				}
				break;
			case 4: //voice
				var voice_src = payload.M;
				voice_src = voice_src.replace("[voice]", "").replace("[/voice]", "");
				if (isRight) {
					voice_src = '<a href="javascript:void(0)" onclick="AudioPlay.handler_play(this,0)" id="' + message.U + '" voiceurl="' + voice_src + '"><span style="display:inline-block;width:48px;height:20px;float:right;cursor:pointer;background: url(\'images/im-sound-new.png\') no-repeat scroll -18px -1px rgba(0, 0, 0, 0);">  </span></a>';
					html += updater.createMeBubbleMsg(userinfo.avatarPic, voice_src);
				} else {
					voice_src = '<a href="javascript:void(0)" onclick="AudioPlay.handler_play(this,1)" id="' + message.U + '" voiceurl="' + voice_src + '"><span style="display:inline-block;width:25px;height:20px;float:left;cursor:pointer;background: url(\'images/im-sound-new.png\') no-repeat scroll 0px 0px rgba(0, 0, 0, 0);">  </span></a>';
					html += updater.createYouBubbleMsg(userinfo.avatarPic, voice_src);
				}
				break;
			case 5: //smile
				var msg = SMileParse.getFacePngByCode(payload.M, false);
				if (isRight) {
					html += updater.createMeBubbleMsg(userinfo.avatarPic, msg);
				} else {
					html += updater.createYouBubbleMsg(userinfo.avatarPic, msg);
				}
				break;
			case 6: //json
				if (message.MT == 2) {
					html += updater.doGroupJsonMessage(payload, userinfo.avatarPic, isRight);
				} else if (message.MT == 4) {
					html += updater.doPrivateJsonMessage(payload, userinfo.avatarPic, isRight);
				}
				break;
			case 7: //location
				var M = JSON && JSON.parse(payload.M) || $.parseJSON(playload.M);
				var location = '<div style="display:inline-block;width:320px"><img src="http://api.map.baidu.com/staticimage?center=' + M.lng + ',' + M.lat + '&width=300&height=200&zoom=17" /><br />' + M.address + '</div>';
				if (isRight) {
					html += '<li class="list-group-item me" style="border:none;' + right + '">' + location + '&nbsp;&nbsp;&nbsp;&nbsp;<div style="display:inline-block;width:55px"><img src="' + userinfo.avatarPic + '" style="width:50px;height:50px" class="img-circle" /></div></li>';
				} else {
					html += '<li class="list-group-item me" style="border:none"><div style="display:inline-block;width:55px"><img src="' + userinfo.avatarPic + '" style="width:50px;height:50px" class="img-circle" /></div>&nbsp;&nbsp;&nbsp;&nbsp;' + location + "</li>";
				}
				break;
		}
		return html;
	},


	doGroupJsonMessage: function(payload, avatarPic, isRight) {
		var M = JSON && JSON.parse(payload.M) || $.parseJSON(playload.M);
		var html = "";
		switch (parseInt(payload.ST)) {
			case 301:
				html = '<li class="list-group-item me" style="border:none;text-align:center">' + M.desc + '</div></li>';
				break;
			case 302:
				html = '<li class="list-group-item  me" style="border:none;text-align:center">' + M.desc + '</div></li>';
				break;
			case 303:
				html = '<li class="list-group-item  me" style="border:none;text-align:center">' + M.desc + '</div></li>';
				break;
			case 304:
				html = '<li class="list-group-item  me" style="border:none;text-align:center">' + M.desc + '</div></li>';
				break;
			case 401:
				html = updater.createCard(M, avatarPic, isRight);
				break;
			case 701:
				html = updater.createLink(payload, avatarPic, isRight);
				break;
		}
		return html;
	},


	doPrivateJsonMessage: function(payload, avatarPic, isRight) {
		var M = JSON && JSON.parse(payload.M) || $.parseJSON(playload.M);
		var html="";
		switch (parseInt(payload.ST)) {
			case 201:
				html = '<li class="list-group-item  me" style="border:none;text-align:center">' + M.desc + '</div></li>';
				break;
			case 202:
				html = '<li class="list-group-item  me" style="border:none;text-align:center">' + M.desc + '</div></li>';
				break;
			case 204:
				html = '<li class="list-group-item  me" style="border:none;text-align:center">' + M.desc + '</div></li>';
				break;
			case 205:
				html = '<li class="list-group-item  me" style="border:none;text-align:center">' + M.desc + '</div></li>';
				break;
			case 401:
				html = updater.createCard(M, avatarPic, isRight);
				break;
			case 701:
				html = updater.createLink(payload, avatarPic, isRight);
				break;
		}
		return html;
	},
	createLink: function(payload, avatarPic, isRight) {
		var M = JSON && JSON.parse(payload.M) || $.parseJSON(playload.M);
		var html = '';
		if (isRight) {
			html += updater.createMeLinkMsg(avatarPic, M.txt, M.description, M.img_url, M.url);
		} else {
			html += updater.createYouLinkMsg(avatarPic, M.txt, M.description, M.img_url, M.url);
		}
		return html;
	},
	createMeLinkMsg: function(avatar, title, desc, img_url, url) {
		var html = '<li class="list-group-item  me" style="border:none">';
		html += '<div class="chatItemContent">';
		html += '<img click="showProfile" src="http://user.qbcdn.com/user/avatar/queryMyAvata65/' + avatar + '/nosrc/1" class="avatar img-circle3" onerror="this.src=\'http://www.qbcdn.com/images/userpicnone.gif\'">';
		html += '<div class="cloud cloudMesg cloudMesgLink">';
		html += '<div style="" class="cloudPannel">';
		html += '<div class="cloudBody">';
		html += '<div class="cloudContent left" style="border:none;width: 210px;">';
		html += '<div class="cloudMesgPanel">';
		html += '<a target="_blank" href="' + url + '">';
		html += '<div class="cloudMesgLinkFilePanel">';
		html += '<img src="' + img_url + '" class="cloudMesgIcon left">';
		html += '<div class="cloudMesgContent left" >';
		html += '<p>' + title + '</p>';
		html += '<span>' + desc + '</span>';
		html += '</div>';
		html += '<div class="clr"></div>';
		html += '</div>';
		html += '</a>';
		html += '</div>';
		html += '</div>';
		html += '<div class="clr"></div>';
		html += '</div>';
		html += '<img class="cloudArrow" src="images/im-talk-right-angle.png" >';
		html += '</div>';
		html += '</div>';
		html += '</div>';
		html += '</li>';
		return html;
	},


	createYouLinkMsg: function(avatar, title, desc, img_url, url) {
		var html = '<li class="list-group-item you" style="border:none">';
		html += '<div class="time" style="display:none">';
		html += '<span class="timeBg left"></span> 1:05';
		html += '<span class="timeBg right"></span>';
		html += '</div>';
		html += '<div class="chatItemContent">';
		html += '<img click="showProfile" src="http://user.qbcdn.com/user/avatar/queryMyAvata65/' + avatar + '/nosrc/1" class="avatar img-circle2" onerror="this.src=\'http://www.qbcdn.com/images/userpicnone.gif\'">';

		html += '<div class="cloud cloudMesg cloudMesgLink" style="width: 221px;">';
		html += '<div style="" class="cloudPannel">';
		html += '<div class="cloudBody" style="width: 219px;">';
		html += '<div class="cloudContent left" style="width: 210px;">';
		html += '<div class="cloudMesgPanel">';
		html += '<a target="_blank" href="' + url + '">';
		html += '<div class="cloudMesgLinkFilePanel">';
		html += '<img src="' + img_url + '" class="cloudMesgIcon left">';
		html += '<div class="cloudMesgContent left">';
		html += '<p>' + title + '</p>';
		html += '<span>' + desc + '</span>';
		html += '</div>';
		html += '<div class="clr"></div>';
		html += '</div>';
		html += '</a>';
		html += '</div>';
		html += '</div>';
		html += '<div class="clr"></div>';
		html += '</div>';
		html += '<img class="cloudArrow" src="images/im-talk-right-angle.png" >';
		html += '</div>';
		html += '</div>';

		html += '</div>';
		html += '</li>';
		return html;
	},
	createCard: function(M, avatarPic, isRight) {
		var html = "";
		html = '<div style="width:200px;">';
		html += '<p style="color: #aeaeae;font-size: 14px;font-weight: bold;">';
		html += "&nbsp;名片";
		html += '</p>';
		html += '<hr style="height:1px;border:none;border-top:1px solid #dddddd;margin:5px;" />';
		html += '<p style="padding:5px">';
		html += '<img src="' + M.avatarPic + '" style="width:50px;height:50px;" class="img-circle" />';
		html += '<span style="color: #777;font-size: 14px;font-weight: bold;">&nbsp;&nbsp;' + M.nickName + '</span>';
		html += '</p>';
		html += '</div>';
		if (isRight) {
			html = updater.createMeBubbleMsg(avatarPic, html);
		} else {
			html = updater.createYouBubbleMsg(avatarPic, html);
		}
		return html;
	},

	createMeBubbleMsg: function(avatar, content) {
		var html = '<li class="list-group-item  me" style="border:none">';
		html += '<div class="chatItemContent">';
		html += '<img click="showProfile" src="http://user.qbcdn.com/user/avatar/queryMyAvata65/' + avatar + '/nosrc/1" class="avatar img-circle3" onerror="this.src=\'http://www.qbcdn.com/images/userpicnone.gif\'">';
		html += '<div class="cloud cloudText">';
		html += '<div class="sendStatus">   </div>';
		html += '<div class="cloudContent">';
		html += content;
		html += '</div>';
		html += '<img class="cloudArrow" src="images/im-talk-right-angle.png" >';
		html += '</div>';
		html += '</div>';
		html += '</li>';
		return html;
	},

	createYouBubbleMsg: function(avatar, content) {
		var html = '<li class="list-group-item you" style="border:none">';
		html += '<div class="time" style="display:none">';
		html += '<span class="timeBg left"></span> 1:05';
		html += '<span class="timeBg right"></span>';
		html += '</div>';
		html += '<div class="chatItemContent">';
		html += '<img click="showProfile" src="http://user.qbcdn.com/user/avatar/queryMyAvata65/' + avatar + '/nosrc/1" class="avatar img-circle2" onerror="this.src=\'http://www.qbcdn.com/images/userpicnone.gif\'">';
		html += '<div class="cloud cloudText">';
		html += '<div class="sendStatus"></div>';
		html += '<div class="cloudContent">';
		html += content;
		html += '</div>';
		html += '<img class="cloudArrow" src="images/im-talk-left-angle.png" >';
		html += '</div>';
		html += '</div>';
		html += '</li>';
		return html;
	},

	showMessageList: function() {
		var html = "";
		var message = null;
		var messages = null;
		//@TODO 排序
		var contentMessages = [];
		var posContent = 0;
		for (var item in updater.recievedMessages) { 
			messages = updater.recievedMessages[item];
			message = null;
			for (var item1 in messages) {
				message = messages[item1];
			}
			if (message == null) {
				message = {};
				message.T = item;
				message.CT = 0;
				contentMessages[posContent++] = message;
			} else {
				contentMessages[posContent++] = message;
			}
		}
		for (var i = 0; i < updater.clientThreads.length; i++) {
			if (updater.recievedMessages[updater.clientThreads[i]] == undefined) {
				message = {};
				message.T = updater.clientThreads[i]
				message.CT = updater.clientThreads.length - i;
				contentMessages[posContent++] = message;
			}
		}
		contentMessages.sort(function(x, y) {
			return x['CT'] < y['CT'];
		});
		if (updater.recievedTotalCount == undefined || updater.recievedTotalCount == 0) {
			$("#msg_total_count").css("display", "none");
		} else {
			$("#msg_total_count").html(updater.recievedTotalCount);
			$("#msg_total_count").css("display", "block");
		}
		for (var item in contentMessages) {
			var thread = contentMessages[item].T;
			messages = updater.recievedMessages[thread];
			message = null;
			for (var item1 in messages) {
				message = messages[item1];
			}
			if (message == null) {
				message = {};
				message.T = thread;
				message.CT = 0;
			}
			var html = updater.createMessageItem(message, updater.recievedCount[thread]);
			var shopid = message ? message.BID : currentShopId;
			var userId = getCookie(_cookie_uid);
			
			if(0==parseInt(item)){
				document.getElementById("person-talk-list").innerHTML = "";
				$("#buyer-list-" + shopid).html("");
			}
			if (message && message.MT == "4"||message.BID==userId) {
				document.getElementById("person-talk-list").innerHTML = document.getElementById("person-talk-list").innerHTML+html;
				document.getElementById("group-item-person").click();
			} else { //MT=3
				document.getElementById("group-item-business").click();
				$("#buyer-list-" + shopid).html($("#buyer-list-" + shopid).html()+html);
				$("#col-business-" + shopid).slideDown();
			}
		}
	},


	getLocalTime: function(timestamp) {
		var myDate = new Date(parseInt(timestamp) * 1000);
		var time = "";
		time += myDate.getHours() + ":" + myDate.getMinutes();
		return time;
	},


	getLocalDate: function(timestamp) {
		var myDate = new Date(parseInt(timestamp) * 1000);
		var time = "";
		time += myDate.getMonth() + "-" + myDate.getDate();
		return time;
	},

	createMessageItem: function(message, count) {
		if (message.P == undefined) {
			var payload = {};
			payload.M = "";
		} else {
			var payload = JSON && JSON.parse(message.P) || $.parseJSON(message.P);
			payload.M = payload.M.replace("[img]", "图片   ");
			payload.M = payload.M.replace("[smiley]", "表情 ");
			payload.M = payload.M.replace("[voice]", "语音   ");
			if (payload.CTT == 7) {
				payload.M = "地理位置";
			}
		}
		var arrThread = message.T.split(":");
		var html="";
		if (parseInt(arrThread[0]) == 2) {
			var groupinfo = updater.getGroupInfo(arrThread[1]);
			html = '<a href="javascript:void(0);" onclick="updater.handler_messagecontents_change(\'' + message.T + '\')" class="buyer-list-a">';
			html += '<div class="col-md-4">';
			html += '<img src="http://user.qbcdn.com/user/avatar/queryMyAvata65/' + arrThread[2] + '/nosrc/1" onerror="this.src=\'http://www.qbcdn.com/images/userpicnone.gif\'" class="img-circle"/>'
			if (!(count == undefined || count == 0)) {
				html += '<span class="new_icon">' + count + '</span>';
			}
			html += '</div>';
			html += '<div class="col-md-7" style="padding-top:7px">';
			if (message.CT != 0) {
				html += '<h4 class="list-group-item-heading">' + updater.subString(groupinfo.name, 4, true) + ' <span style="font-size:12px;color:#47778d">' + updater.getLocalTime(message.CT) + '</span></h4>';
			} else {
				html += '<h4 class="list-group-item-heading">' + updater.subString(groupinfo.name, 4, true) + ' <span style="font-size:12px;color:#47778d"></span></h4>';
			}
			if (payload.M != "") {
				if (payload.CTT == 6) {
					html += '<p class="list-group-item-text">系统通知</p>';
				} else {
					html += '<p class="list-group-item-text">' + updater.subString(payload.M, 16, true) + '</p>';
				}
			} else {
				html += '<p class="list-group-item-text"></p>';
			}
			html += '</div>';
			html += '</a>';
		} else {
			if (parseInt(arrThread[0]) == 3) {
				if (message.S == undefined) {
					var uid = arrThread[1];
				} else {
					var uid = message.S;
				}
			} else {
				var uid = arrThread[1]
				if (parseInt(uid) == getCookie(_cookie_uid)) {
					uid = arrThread[2];
				}
			}
			var userinfo = updater.getUserInfo(uid);
			html = '<a href="javascript:void(0);" onclick="updater.getCurrentTalkUserID(\'' + message.T + '\',this)" class="buyer-list-a">';
			html += '<img src="http://user.qbcdn.com/user/avatar/queryMyAvata65/' + arrThread[2] + '/nosrc/1" onerror="this.src=\'http://www.qbcdn.com/images/userpicnone.gif\'" class="img-circle"/>'
			if (!(count == undefined || count == 0)) {
				html += '<span class="new_icon">' + count + '</span>';
			}
			if (!message.NN) {
				message.NN = "未知用户";
			}
			
			if(message.NN.indexOf("\"\\")>-1)
				message.NN=eval(message.NN);
				
			if (message.CT != 0) {
				html += '<h4 class="list-group-item-heading">' + message.NN + '</h4>';
			} else {
				html += '<h4 class="list-group-item-heading">' + message.NN + '</h4>';
			}
			if (payload.M != "") {
				if (payload.CTT == 6) {
					html += '<p class="list-group-item-text">系统通知</p>';
				} else {
					html += '<p class="list-group-item-text">' + updater.subString(payload.M, 16, true) + '</p>';
				}
			} else {
				html += '<p class="list-group-item-text"></p>';
			}
			html += '</a>';
		}
		return html;
	},


	getMsgTitle: function(thread) {
		var arrThread = thread.split(":");
		if (parseInt(arrThread[0]) == 2) {
			var groupinfo = updater.getGroupInfo(arrThread[1]);
			var desc = "来自群 " + groupinfo["name"] + " 的消息";
		} else {
			var opUid = arrThread[1];
			var uid = getCookie(_cookie_uid);
			if (opUid == uid) {
				opUid = arrThread[2];
			}
			var userinfo = updater.getUserInfo(opUid);
			var desc = "跟 " + currentTalkUserNickName + " 对话";
		}
		return desc;
	},

	showNewChat: function(userData) {
		currentTalkUserId = userData.userId;
		currentTalkUserNickName = userData.nickName;
//		currentTalkUserNickName=unescape(currentTalkUserNickName);
		updater.handler_messagecontents_change([1, currentShopId, currentTalkUserId].join(':'));
	},

	getCurrentTalkUserID: function(mes, obj) {
		im.closeHistoryWindow();
		currentRecordPageIndex = 0;
		thread = mes.split(":");
		currentTalkMsg = thread;
		currentTalkUserId = thread && thread[2] ? thread[2] : null;
		currentShopId=thread && thread[1] ? thread[1] : null;
		currentTalkUserNickName = $(obj).find(".list-group-item-heading").html();
//		currentTalkUserNickName=unescape(currentTalkUserNickName);
		updater.handler_messagecontents_change(mes);
	},

	handler_messagecontents_change: function(thread) {
		if (updater.recievedMessages[thread] != undefined) {
			$("#message_contents").find(".list-group").html("");
			updater.showMessage(updater.recievedMessages[thread]);
			if (updater.recievedCount[thread] != undefined) {
				updater.recievedTotalCount = updater.recievedTotalCount - updater.recievedCount[thread];
			}
			updater.recievedCount[thread] = 0;
			updater.current_thread = thread;
			updater.showMessageList();

			$("#message_contents_head").html(updater.getMsgTitle(thread));
			$("#_current_thread").val(thread);
//			im.closeAllWindow();
			$("#message_container").css("display", "block");
		} else {
			$("#message_contents").find(".list-group").html("");
			updater.showMessage(updater.recievedMessages[thread]);
			updater.recievedCount[thread] = 0;
			updater.recievedTotalCount = updater.recievedTotalCount - updater.recievedCount[thread];
			updater.current_thread = thread;
			updater.showMessageList();

			$("#message_contents_head").html(updater.getMsgTitle(thread));
			$("#_current_thread").val(thread);
//			im.closeAllWindow();
			$("#message_container").css("display", "block");
		}
	},


	handler_contactcontents_change: function(thread, isGroup) {
		$("#message_contents").find(".list-group").html("");
		updater.showMessage(updater.recievedMessages[thread]);
		updater.recievedCount[thread] = 0;
		updater.recievedTotalCount = updater.recievedTotalCount - updater.recievedCount[thread];
		updater.current_thread = thread;
		updater.showMessageList();

		$("#message_contents_head").html(updater.getMsgTitle(thread));
		$("#_current_thread").val(thread);
		im.closeAllWindow();
		$("#message_container").css("display", "block");
	},

	getUserInfo: function(uid) {
		if (updater.Users[uid] != undefined) {
			return updater.Users[uid];
		} else if (updater.Strangers[uid] != undefined) {
			return updater.Strangers[uid];
		} else {
			/**
			$.getJSON("/userinfo", {
			  jSessionId: getCookie(_cookie_jid),
			  "userId": uid
			}, function(data) {
			  if (data["status"] == undefined) {
			    updater.Strangers[data.user["userId"]] = data.user;
			    updater.showMessageList();
			    if (updater.current_thread != "") {
			      updater.handler_messagecontents_change(updater.current_thread);
			    }
			  } else {
			    if (_debug) {
			      console.log(data.msg);
			    }
			  }
			});
			*/
			return {
				"avatarPic": "",
				"nickName": uid
			};
		}
	},

	getGroupInfo: function(groupId) {
		if (updater.Groups[groupId] != undefined) {
			return updater.Groups[groupId];
		} else {
			$.getJSON("/groups", {
				jSessionId: getCookie(_cookie_jid),
				"group_id": groupId
			}, function(data) {
				if (data["status"] == undefined) {
					updater.Groups[data.group["id"]] = data.group;
					updater.showMessageList();
				} else {
					if (_debug) {
						console.log(data.msg);
					}
				}
			});
			return {
				"avatar": "",
				"name": "未知"
			};
		}
	},


	getCurrentTime: function() {
		var myDate = new Date();
		var time = "";
		time += myDate.getHours() + ":" + myDate.getMinutes();
		return time;
	},


	auth: function() {
		_auth_seq = genSeq();
		var uid = getCookie(_cookie_uid);
		var ticket = getCookie(_cookie_ticket);

		if (ticket != undefined && uid != undefined) {
			var ap = {
				"COOKIE": ticket,
				"ID": parseInt(uid)
			}
			var body = {
				"I": _auth_seq,
				"V": _version,
				"AT": 2,
				"AP": JSON.stringify(ap)
			};
			updater.send(_mt_auth_req, body);
		}
	},


	subString: function(str, len, hasDot) {
		var newLength = 0;
		var newStr = "";
		var chineseRegex = /[^\x00-\xff]/g;
		var singleChar = "";
		var strLength = str.replace(chineseRegex, "**").length;
		for (var i = 0; i < strLength; i++) {
			singleChar = str.charAt(i).toString();
			if (singleChar.match(chineseRegex) != null) {
				newLength += 2;
			} else {
				newLength++;
			}
			if (newLength > len) {
				break;
			}
			newStr += singleChar;
		}

		if (hasDot && strLength > len) {
			newStr += "...";
		}
		return newStr;
	},


	response: function(message) {
		var body = {
			"I": message.body.I,
			"EC": 0
		};
		updater.send(_mt_response, body);
	},

	echo: function(message) {
		var body = {
			"I": message.body.I,
			"P": message.body.P
		};
		if (_debug) {
			console.log("握手请求！");
		}
		updater.send(_mt_heartbeat_resp, body);
	},


	send: function(messagetype, message) {
		if (updater.connected) {
			var msg = createMessage(messagetype, message);
			for (var i = 0; i < msg.length; i++) {
				updater.socket.send(msg[i]);
			}
		}
	}
};