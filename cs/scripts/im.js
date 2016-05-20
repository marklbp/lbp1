$(function() {
  var urlAddress = "http://enterprise.qbao.com/";
  // var websocket_host = "192.168.7.42:12346";
  var websocket_host = "im.qbao.com:12346";
  var smile_url = "http://enterprise.qbao.com/webChat/business-center/images/"; //测试环境
  var swf_path = 'http://enterprise.qbao.com/webChat/business-center/scripts/im/jplayer'; // 测试环境
  var heartBeatSecond = 60; //心跳周期

  if (!checkBrowser()) {
    var main = $("#container_main");
    main.css("height", 696);
    main.css("text-align", "center");
    main.css("background", "#FFFFFF");
    var html = '<img src="' + smile_url + 'im-unsupport.png" style="margin:260px auto 10px auto;">';
    html += '<p style="color:#bcc3cb;font-size:14px;line-height:40px;">系统检测到您目前的浏览器暂不支持IM聊天功能，</p>';
    html += '<p style="color:#bcc3cb;font-size:14px;line-height:40px;">建议您使用Chrome浏览器、Firefox浏览器、IE10浏览器、IE11浏览器。</p>';
    document.getElementById("container_main").innerHTML = html;
    return;
  }

  var errorheadimg = "im-default-head-img.gif";
  var myUserId, myTicket, currentShopId, currentTalkUserId, currentTalkUserNickName, talkType, myNickName, currentGid, pageSum; //shopid发送id，talkid接收id
  var talkModel = {
    businessModel: 3,
    personModel: 4
  }; //对话模式  个人/商家
  var _version = "1.0";
  var _m_seq = 1; //消息来往序列号 自增
  var _mt_delivery_report = 1;
  var _mt_content_messages = 2;
  var _mt_response = 3;
  var _mt_heartbeat_req = 4;
  var _mt_heartbeat_resp = 5;
  var _mt_auth_req = 6;
  var _mt_sys_cmd = 7;
  var heartbeatTimeOut = 1000 * 60;
  var bufferpack = new BufferPack(); //转换流式文件
  var oriCollapse = 0;

  var _auth_seq = 2;

  var isGetLastMsg = false;


  var totalMsgCount = 0;
  var newMsgTitInterval;
  var oriTitle = "钱宝网-看广告，做任务，赚外快";
  var newTitle = "你有新消息  ";
  var imRole = 0; //0无角色 1个人 2商家 3小二

  var heartbeatInterval = {};
  var reconnectCount = 0;
  var maxReConnectCount = 7;


  var AudioPlay = {
    isplay: 0,
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
        swfPath: swf_path,
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
          $("#" + id + " span").css("background", "url('" + smile_url + "im-sound-new.png') no-repeat scroll 0 0 rgba(0, 0, 0, 0)");
        } else {
          $("#" + id + " span").css("background", "url('" + smile_url + "im-sound-new.png') no-repeat scroll -18px -1px rgba(0, 0, 0, 0)");
        }
      } else if (status == 1) {
        if (isLeft) {
          $("#" + id + " span").css("background-image", "url('" + smile_url + "im-voice-left.gif')");
        } else {
          $("#" + id + " span").css("background", "url('" + smile_url + "im-voice-right.gif') no-repeat scroll 16px 0 rgba(0, 0, 0, 0)");
        }
      }
      $("#" + id + " span").css("background-position-y", "8px");
    },
    callback_end: function(id, isLeft) {
      if (isLeft) {
        $("#" + id + " span").css("background", "url('" + smile_url + "im-sound-new.png') no-repeat scroll 0 0 rgba(0, 0, 0, 0)");
      } else {
        $("#" + id + " span").css("background", "url('" + smile_url + "im-sound-new.png') no-repeat scroll -18px -1px rgba(0, 0, 0, 0)");
      }
      $("#" + id + " span").css("background-position-y", "8px");
    }
  };


  //表情插件
  var ExpressionPlugin = {
    baseData: [
      ["微笑", "expression_01.png"],
      ["郁闷", "expression_02.png"],
      ["花心", "expression_03.png"],
      ["惊讶", "expression_04.png"],
      ["流泪", "expression_05.png"],
      ["害羞", "expression_06.png"],
      ["无语", "expression_07.png"],
      ["尴尬", "expression_08.png"],
      ["生气", "expression_09.png"],
      ["鬼脸", "expression_10.png"],
      ["奸笑", "expression_11.png"],
      ["抓狂", "expression_12.png"],
      ["兴奋", "expression_13.png"],
      ["坏笑", "expression_14.png"],
      ["苦笑", "expression_15.png"],
      ["冷汗", "expression_16.png"],
      ["不满", "expression_17.png"],
      ["鄙视", "expression_18.png"],
      ["挖鼻", "expression_19.png"],
      ["亲亲", "expression_20.png"],
      ["瞌睡", "expression_21.png"],
      ["赞同", "expression_22.png"],
      ["反对", "expression_23.png"],
      ["鼓掌", "expression_24.png"],
      ["爱心", "expression_25.png"],
      ["鲜花", "expression_26.png"],
      ["猪头", "expression_27.png"],
      ["酷哥", "expression_28.png"]
    ],
    extraData: [
      ["加油", "qb_jy.png"],
      ["可爱", "qb_keai.png"],
      ["困", "qb_kun.png"],
      ["坏笑", "qb_hxiao.png"],
      ["大哭", "qb_dk.png"],
      ["庆祝", "qb_qz.png"],
      ["微笑", "qb_wx.png"],
      ["惊讶", "qb_jya.png"],
      ["晕", "qb_yun.png"],
      ["流汗", "qb_lh.png"],
      ["生气", "qb_sq.png"],
      ["疑问", "qb_yw.png"],
      ["着急", "qb_zj.png"],
      ["花心", "qb_hx.png"],
      ["足球", "qb_zq.png"],
      ["钱多多", "qb_qdd.png"]
    ],
    openSmilePanel: function() {
      var display = document.getElementById("smile_panel").style.display;
      if (display == "" || display == "none") {
        document.getElementById("smile_panel").style.display = "block";
      } else {
        document.getElementById("smile_panel").style.display = "none";
      }
    },
    closeSmilePanel: function() {
      document.getElementById("smile_panel").style.display = "none";
    },
    createSmilePanel: function() {
      var html = "";
      var imgurl = "";
      var smileurl = "";
      for (var i = 0; i < this.baseData.length; i++) {
        html += '<div class="div-face-list">';
        html += '<a href="javascript:void(0)" name="' + this.baseData[i][0] + '"class="thumbnail" style="margin:3px;">';
        smileurl = '<img src="' + smile_url + this.baseData[i][1] + '"  style="" />';
        html += smileurl;
        html += '</a>';
        html += '</div>';
      }
      $("#normalSmile").html(html);
      var html2 = "";
      var imgurl2 = "";
      var smileurl2 = "";

      for (var i = 0; i < this.extraData.length; i++) {
        html2 += '<div class="div-face-list">';
        html2 += '<a href="javascript:void(0)" name="' + this.extraData[i][0] + '"class="thumbnail" style="margin:3px;">';
        smileurl2 = '<img src="' + smile_url + this.extraData[i][1] + '" style="" />';
        html2 += smileurl2;
        html2 += '</a>';
        html2 += '</div>';
      }
      $("#bigSmile").html(html2);
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
    }
  };


  //图片发送对象
  var ImageSend = {
    isImagePanelOpen: false,
    asyncUploadImage: function(e) {
      $("#image_upload_processing").css("display", "inline-block");
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
          var img = "[img]" + resp.message + "[/img]";
          im.commitBigExpress($('#messageform'), img);
          $("#image_upload_processing").css("display", "none");
          $("#upload_panel").css("display", "none");
        } else {
          //				$("#image_upload_processing").css("display", "none");
          //				openTip("图片上传失败",1000);
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
        //				$("#smile_panel").css("display", "none");
        this.isSmilePanelOpen = false;
      }
    }
  };

  function SocketPlugin() {
    return SocketPlugin.prototype.init();
  }


  SocketPlugin.prototype = {
    init: function() {
      return this;
    },
    socket: {},
    connected: false,
    heartBeatTime: {},
    heartBeatCount: 0,
    heartBeatCountOut: 2,
    lastMessageRecieved: 0,

    closeSocket: function() {
      //关闭连接
      this.socket.close();
    },
    genSeq: function() {
      _m_seq = (_m_seq + 1) % 4294967296;
      return _m_seq;
    },
    startSocket: function() {
      var thisobj = this;
      var https = 'https:' == document.location.protocol ? true : false;
      var url = "ws://" + websocket_host;

      try {
        this.socket = new WebSocket(url);//申请一个WebSocket对象
        if (this.socket == undefined || this.socket == null) {
          logout(true);
        }
      } catch (err) {
        openTip("连接错误");
        return;
      }

      this.socket.onopen = function(event) {//当websocket创建成功时，即会触发onopen事件
        openTip("正在连接,请稍候...");
        thisobj.connected = true;
        heartBeat();
        // heartbeatInterval = setInterval(heartBeat, heartbeatTimeOut);
        heartbeatInterval = setInterval(heartBeat, heartBeatSecond * 1000);//不停关闭在连接
        authSocket();
      };

      this.socket.onclose = function(event) {//当客户端收到服务端发送的关闭连接的请求时，触发onclose事件
        thisobj.connected = false;
        clearInterval(heartbeatInterval);
        if (reconnectCount <= maxReConnectCount) {
          setTimeout(function() {
            console.log("reconnecting...");
            thisobj.closeSocket();
            reconnectCount++;
            thisobj.startSocket();
          }, 1000 * 5);
        } else {
          openTip("连接已断开");
          document.title = "连接已断开";
        }
      };

      this.socket.onerror = function(event) {//如果出现连接，处理，接收，发送数据失败的时候就会触发onerror事件
        clearInterval(heartbeatInterval);
        thisobj.connected = false;
        openTip("连接出错,正在重连..");
        if (reconnectCount < maxReConnectCount) {//最多连接次数
          setTimeout(function() {
            console.log("reconnecting...");
            thisobj.closeSocket();
            reconnectCount++;
            thisobj.startSocket();
          }, 1000 * 5);
        } else {
          openTip("连接已断开");
          document.title = "连接已断开";
        }
      };

      this.socket.onmessage = function(event) {//当客户端收到服务端发来的消息时，会触发onmessage事件，参数evt.data中包含server传输过来的数据

          var str = base64.decode(event.data);
          var originMessage = im.parseMessage(str);
        if (originMessage.body.M) {
          console.log(originMessage.body.M[0].P);
        }

        thisobj.lastMessageRecieved = Date.parse(new Date());
        if (originMessage) {//接收消息的内容
            thisobj.judgeMsgType(originMessage);
        }
      }
    },


    judgeMsgType: function(originMessage) {
      switch (originMessage.mtype) {
        case _mt_content_messages: //正常的接收消息
          this.response(originMessage); //回复给服务器提示消息已经接收到了
          //获得缓存对象名称，将拿到的数据放入js缓存对象中，根据名称获得聊天列表
          for (var i = originMessage.body.M.length - 1; i >= 0; i--) {
            if (!originMessage.body.M[i].BID) { //没有BID代表的是全网推送的消息web端要过滤掉
                 continue;
            }
            if (originMessage.body.M[i].MT != 3 && originMessage.body.M[i].MT != 4) {
              continue;
            }
            var name = im.getNameByMessage(originMessage.body.M[i]);
            im.setCache(name, originMessage.body.M[i], "you");
            im.cache[name].notReadCount++;

            //如果是当前打开窗口的消息的话，则直接将消息内容放入对话框
            if (name == im.getCurrentName()) {
              var obj = im.getCache(name).data;
              im.cache[name].notReadCount = 0;
              var html = im.createMessageHtml(obj[obj.length - 1]);//------------------------------------------------------------------------------------------------显示消息内容
              $("#message_contents").find("#talk-content-list-area").append(html);
              im.readMsg(originMessage.body.M[0].S);

              //如果有图片文件的话要给最后的图片文件加上 load 事件
              if (html.indexOf("content-img") > -1) {
                $("#message_contents").find(".content-img").last().load(function() {
                  im.scrollBottom();
                });
              }

            } else {
              totalMsgCount++;
            }
            //接着刷新列表
            im.setMsgList(name);
            im.setNewMsgTitle();
          }
          break;
        case _mt_heartbeat_req: //心跳
          this.echo(originMessage);
          break;
        case _mt_heartbeat_resp: //心跳响应
          this.heartBeatCount--;
          break;
        case _mt_sys_cmd: //系统命令
          var payload = JSON && JSON.parse(originMessage.body.P) || $.parseJSON(originMessage.body.P);
          if (payload.CMD == 1) {
            if (payload.EC == -1) {
              openTip("认证失败");
              this.startSocket();
              reconnectCount++;
            } else if (payload.EC == -2) {
              // openTip("已在其他地方登陆,如需重新登陆请刷新页面...");
	          	this.closeSocket();
	          	window.location.href = 'http://enterprise.qbao.com/merchantUser/merchantUcIndex.html' + window.location.search;
            } else if (payload.EC == -3) {
              openTip("服务器忙");
              this.closeSocket();
              this.startSocket();
              reconnectCount++;
            } else {
              openTip("未知错误!");
            }
          }
          break;
        case _mt_response:
          if (originMessage.body.I == _auth_seq) {
            if (originMessage.body.EC != 0) {
              console.log("登录聊天服务器失败！");
              openTip("socket 认证失败!")
              console.log(originMessage.body.EM);
            } else {
              _authed = true;
              console.log("登录聊天服务器成功！");
              openTip("连接成功..", 1000)
              reconnectCount = 0;
              var ids = im.getCache("businessIds").join();
              im.putOffLineMsg(myUserId, ids);
            }
          }
          break;
        default:
          break;
      }
      im.scrollBottom();
    },

    response: function(message) {
      var body = {
        "I": message.body.I,
        "EC": 0
      };
      this.send(_mt_response, body);
    },

    echo: function(message) {
      var body = {
        "I": message.body.I,
        "P": message.body.P
      };
      this.send(_mt_heartbeat_resp, body);
    },

    send: function(messagetype, message) {
      if (this.connected) {
        var msg = this.createMessage(messagetype, message);
        for (var i = 0; i < msg.length; i++) {
          this.socket.send(msg[i]);
          console.log(i + " msg: " + msg[i]);
        }
      }
    },

    createMessage: function(messagetype, body) {
      body = JSON.stringify(body);
      var format = '!LBB';
      var values = [body.length, messagetype, 0];
      var packed = bufferpack.pack(format, values);
      return [packed, "\r\n", body];
    }
  };

//信息接收的处理方法------------------------------------------------------------------------------------------------------------------------------------------
  function IMplugin() {
    return IMplugin.prototype.init();
  }

  IMplugin.prototype = {
    init: function() {
      return this;
    },
    timeFalg: 0,
    cache: {},
    fansLimit: 7, //每页显示的粉丝数
    talkRecordLimit: 20,
    getCookie: function(name) {
      var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
      if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
      else
        return null;
    },
    setCookie: function(name, value) {
      var Days = 30;
      var exp = new Date();
      exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
      document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
    },
    delCookie: function(name, path, domain) {
      if (getCookie(name)) {
        document.cookie = name + "=" +
          ((path) ? ";path=" + path : "") +
          ((domain) ? ";domain=" + domain : "") +
          ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
      }
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
        cache: false,
        async: async,
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          console.error("请求失败");
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
    closeHistoryWindow: function() {
      //历史记录右侧边框
      document.getElementById("message_contents").style.right = "0px";
      document.getElementById("messageform").style.right = "0px";
      document.getElementById("talk-record-area").style.display = "none";
    },
    getIdByElementId: function(eleId) {
      if (!eleId)
        return null;
      eleId = eleId.split("-");
      return eleId[eleId.length - 1];
    },
    slideHandler: function(ele, dir) {
      ele = $(ele);
      var eleDir = ele.prev().find(".collapse-dir");
      if (dir == "down") {
        ele.slideDown();
        eleDir.attr("src", smile_url + "im-collapse-up.png");
      } else if (dir == "up") {
        ele.slideUp();
        eleDir.attr("src", smile_url + "im-collapse-down.png");
      } else {
        ele.slideToggle();
        var img = eleDir.attr("src");
        if (img.indexOf("collapse-up") > -1) {
          eleDir.attr("src", smile_url + "im-collapse-down.png");
        } else {
          eleDir.attr("src", smile_url + "im-collapse-up.png");
        }
      }
    },
    getBusinessList: function() {
      var resData = this.getRemoteData("merchantUser/webchat/listShopIdAndShopName.html");
      if (!resData || !resData.data)
        return;
      var data = resData.data.employers;
      this.setCache("recentMsgList", data);

      //次对象放入缓存中,用于根据当前聊天对象的 id 来获得当前发送人的昵称.
      var nameCache = {};
      nameCache[resData.data.personalMerUserId] = resData.data.getPersonalMerUserName;
      var businessIds = [];
      //		myNickName = resData.data.getPersonalMerUserName;
      var htmlStr = ""; //currentShopId: "27"shopName: "113"
      for (var i = 0; i < data.length; i++) {
        businessIds.push(data[i].merUserId);
        htmlStr += '<li class="business-li">';
        htmlStr += '  <div class="business-name checkstyle">';
        htmlStr += '    <img class="bussiness-head" src="' + smile_url + 'im-hotel-banner.png"/>';
        htmlStr += '    <span>' + data[i].shopName + '</span>';
        htmlStr += '    <img class="collapse-dir" src="' + smile_url + 'im-collapse-down.png"/>';
        htmlStr += '  </div>';
        htmlStr += '  <div class="col col1" id="col-business-' + data[i].merUserId + '">';
        htmlStr += '    <div class="fans-title checkstyle" id="fans-title-' + data[i].merUserId + '">';
        htmlStr += '      <img src="' + smile_url + 'im-fans-banner_03.png"/>关注粉丝'
        htmlStr += '    </div>';
        htmlStr += '    <div class="buyer-title checkstyle" id="buyer-title-' + data[i].merUserId + '">买家 <span id="buyer-title-count-' + data[i].merUserId + '"></span>' + '</div>';
        htmlStr += '    <div class="col col3">';
        htmlStr += '      <ul class="buyer-list" id="buyer-list-' + data[i].merUserId + '">' + '</ul>';
        htmlStr += '    </div>';
        htmlStr += '  </div>';
        htmlStr += '</li>';
        var nickName = data[i].nickName ? data[i].nickName : data[i].shopName;
        nameCache[data[i].merUserId] = nickName;
      }
      document.getElementById("business-list").innerHTML = htmlStr;
      this.setCache("nameCache", nameCache);
      this.setCache("businessIds", businessIds);
      $(".fans-title").on("click", function(eve) {
        var thisobj = $(eve.currentTarget);
        $('.buyer-list-a').removeClass('active');
        $(".fans-title").removeClass("fans-title-hover");
        thisobj.addClass("fans-title-hover");
      });
    },
    getRecentlyList: function(id) {
      var res = im.getRemoteData("merchantUser/webchat/getRecentContacts.html?sellerids=" + id);
      return res;
    },
    setPersonRecentMsgList: function() {
      var res = this.getRecentlyList(myUserId);
      res = $.parseJSON(res.message);
      if (!res.data.dialogs || res.data.dialogs.length == 0) {
        return;
      } else {
        res = res.data.dialogs[0][myUserId];
      }
      for (var k = res.length - 1; k >= 0; k--) {
        var name = "4_" + myUserId + "_" + res[k].clientid;
        var badges = res[k].badges;
        if (!badges)
          badges = 0;

        var msg = "";
        if (!res[k].lm || res[k].lm == "") {
          var content = '{"CTT":1,"TXT":"","M":"","ST":1}';
          msg = {
            BID: myUserId,
            CT: res[k].lts,
            MT: 4,
            NN: res[k].nn,
            P: content,
            S: res[k].clientid,
            T: "4:" + myUserId + ":" + res[k].clientid,
            role: "you"
          };
        } else {
          msg = $.parseJSON(res[k].lm);
        }
        //这里判断是sender是不是当前登录帐号如果是的话 则是自己发的 否则是对方发的
        var role = "you";
        if (myUserId == msg.S) {
          role = "me";
          if (res[k].nn) {
            msg.NN = res[k].nn;
          }
        }
        // 过滤掉错误的消息
        if (msg.MT == 3) {
          continue;
        }
        this.setCache(name, msg, role, badges);
        this.setMsgList(name);
      }
    },

    setBussinessRecentMsgList: function() {
      var data = this.getCache("recentMsgList");
      for (var i = 0; i < data.length; i++) {
        var res = this.getRecentlyList(data[i].merUserId);
        res = $.parseJSON(res.message);
        if (!res.data.dialogs || res.data.dialogs.length == 0) {
          continue;
        } else {
          res = res.data.dialogs[0][data[i].merUserId];
        }
        for (var k = res.length - 1; k >= 0; k--) {
          var name = "3_" + data[i].merUserId + "_" + res[k].clientid;
          var badges = res[k].badges;
          if (!badges)
            badges = 0;

          var msg = "";
          if (!res[k].lm || res[k].lm == "") {
            var content = '{"CTT":1,"TXT":"","M":"","ST":1}';
            msg = {
              BID: data[i].merUserId,
              CT: res[k].lts,
              MT: 3,
              NN: res[k].nn,
              P: content,
              S: res[k].clientid,
              T: "3:" + data[i].merUserId + ":" + res[k].clientid,
              role: "you"
            };
          } else {
            msg = $.parseJSON(res[k].lm);
            if (res[k].nn) {
            	msg.NN = res[k].nn;
            }
          }
          //这里判断是sender是不是当前登录帐号如果是的话 则是自己发的 否则是对方发的
          var role = "you";
          if (myUserId == msg.S) {
            role = "me";
          }
          this.setCache(name, msg, role, badges);
          this.setMsgList(name);
        }
      }
    },
    getFansList: function(pageIndex, id) { //获得粉丝页面
      var offset = (pageIndex - 1) * this.fansLimit;
      var params = "merUserId=" + id + "&offset=" + offset + "&limit=" + this.fansLimit;
      if (currentGid) {
        params += "&gid=" + currentGid;
      }
      var resData = this.getRemoteData("merchantUser/webchat/fans.html", params);
      if (!resData.message || resData.message == "验证失败") {
        this.fillNoneFans(id);
        return false;
      }
      if (!resData.success)
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
      document.getElementById("dialogue-list-area").innerHTML = "<img src='" + smile_url + "im-fensi.png' style='margin:200px auto;display:block;'>";
    },
    fillFansList: function(id, items) {
      var htmlStr = "<ul>";

      for (var i = 0; i < items.length; i++) {
        var name = items[i].nickName;
        if (items[i].remark) {
          name = items[i].remark + "(" + name + ")"
        }

        htmlStr += '<li>';
        htmlStr += '  <img src="http://user.qbcdn.com/user/avatar/queryMyAvata65/' + items[i].userId + '/nosrc/1" class="img-head" onerror="this.src=\'' + smile_url + errorheadimg + '\'"/>';
        htmlStr += '  <span class="fans-name">' + name + '</span>';
        htmlStr += '  <input type="button" nickname="' + name + '" shopid="' + id + '" id="fans-' + items[i].userId + '" value="联系粉丝" class="btn-contact" />';
        htmlStr += '</li>';
      }
      htmlStr += "</ul>"
      document.getElementById("dialogue-list-area").innerHTML = htmlStr;
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
      this.fillFansArea(id, resData);
    },
    fillFansArea: function(id, data) {
      var items = data.items;
      var sumFans = 0;;
      var htmlStr = '';
      for (var i = 0; i < items.length; i++) {
      	if (i === 0) {
          htmlStr += '<li class="active" id="area-' + items[i].gid + '"><span>' + items[i].gname + '(' + items[i].fans_num + ')</span></li>';
      	} else {
          htmlStr += '<li id="area-' + items[i].gid + '"><span>' + items[i].gname + '(' + items[i].fans_num + ')</span></li>';
      	}
        sumFans += items[i].fans_num;
      }
      var noGroupFans = parseInt(data.total_count) - sumFans;

      document.getElementById("area-list").innerHTML = htmlStr;
      $('#area-list li').click(function() {
      	$('#area-list li').removeClass('active');
      	$(this).addClass('active');
        console.log($(this).attr('id'));
        currentGid = $(this).attr('id').split('-')[1];
        if (currentGid == 'null') {
          currentGid = null;
        }
        im.getFansList(1, currentShopId)
      });
    },
    getHistoryData: function(talkCount) {
      var res = this.getRemoteData("merchantUser/webchat/chatHistory.html", "merUserId=" + currentShopId + "&clientid=" + currentTalkUserId + "&offset=" + talkCount + "&limit=" + this.talkRecordLimit);
      return res;
    },
    getTalkRecord: function() {
      var offset = (recordpageIndex - 1) * this.talkRecordLimit;
      var res = this.getHistoryData(offset);
      if (res.message) {
        res = $.parseJSON(res.message);
        this.fillTalkRecord(res.data);
      } else {
        console.error("历史列表获取错误");
      }
    },
    fillTalkRecord: function(talkList) {
      var totalCount = talkList.total_count;
      talkList = talkList.items;
      var html = "";
      var day = "";
      for (var i = talkList.length - 1; i >= 0; i--) {
        var name = this.transUniCode(talkList[i].NN);

        var content = this.getMessgaeByType(talkList[i], true);

        var time = parseInt(talkList[i].CT);
        time = new Date(time * 1000);
        var timedate = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate();
        if (day != timedate) {
          html += '<li class="record-date">日期：' + timedate + '</li>';
          day = timedate;
        }
        html += '<li class="record-contain">';
        html += '<span class="record-name">' + name + '&nbsp;' + formatDate(time) + '</span>';
        html += '<span class="record-content">' + content + '</span>';
        html += '</li>';
      }
      document.getElementById("record-list").innerHTML = html;
      pageSum = parseInt(totalCount / this.talkRecordLimit); //全局变量
      if (totalCount % this.talkRecordLimit > 0) {
        pageSum++;
      }
      this.pagenation(recordpageIndex, "record-paginator");
    },
    getCurrentName: function() {
      return talkType + "_" + currentShopId + "_" + currentTalkUserId;
    },
    openTalkDialog: function() {
      this.timeFalg = 0; //以秒为单位
      var name = this.getCurrentName();
      var html = this.cache[name];

      if (html) {
        if (html.firstView) {
          var uuid = html.data[0].U;
          for (var i = 1; i < html.data.length; i++) {
            if (html.data[i].U == uuid) {
              this.cache[name].data.shift();
              break;
            }
          }
          this.cache[name].firstView = false;

          var notReadCount = parseInt(html.notReadCount, 10);
          var badges = notReadCount - html.data.length;

          if (html.notReadCount > html.data.length) {
            var res = this.getRemoteData("merchantUser/webchat/chatHistory.html", "merUserId=" + html.data[0].BID + "&clientid=" + html.data[0].S + "&waiterid=" + myUserId + "&offset=" + html.data.length + "&limit=" + badges);

            res = JSON.parse(res.message);

            for (var i = 0; i < res.data.items.length; i++) {
            	var item = res.data.items[i];
            	var role = 'me';

            	if (item.R == myUserId) {
            		role = 'you';
            	}

              this.setCache(name, item, role, badges, true /*insert*/);
            }
          }
        }
        //先将此条记录的未读数变成0
        if (html.notReadCount > 0)
          this.cache[name].notReadCount = 0;

        //然后再判断消息类型,如果是商家消息就减商家消息的总数,个人消息就减去个人消息的总数
        if (html.data[0].MT == 3) {
          var businessMsgCount = this.getBusinessNotRead();
          if (businessMsgCount <= 0) {
            $("#group-item-business").find(".red-point").css("display", "none");
            businessMsgCount = 0;
          }
        } else {
          var personMsgCount = this.getPersonNotRead();
          if (personMsgCount <= 0) {
            $("#group-item-person").find(".red-point").css("display", "none");
            personMsgCount = 0;
          }
        }
        html = this.getTalkHtmlByObject(html);
        document.getElementById("more").style.display = "block";
      } else {
        html = '';
        document.getElementById("more").style.display = "none";
      }

      $("#talk-content-list-area").html(html);
      $("#message_contents_head").html(currentTalkUserNickName);
      $("#message_container").css("display", "block");
      this.readMsg(currentTalkUserId);
      im.scrollBottom();
    },
    getBusinessNotRead: function() {
      var businessMsgCount = 0;
      for (var name in this.cache) {
        if (name.indexOf("3_") == 0) {
          businessMsgCount += this.cache[name].notReadCount;
        }
      }
      return businessMsgCount;
    },
    getPersonNotRead: function() {
      var personMsgCount = 0;
      for (var name in this.cache) {
        if (name.indexOf("4_") == 0) {
          personMsgCount += this.cache[name].notReadCount;
        }
      }
      return personMsgCount;
    },

    getTalkHtmlByObject: function(obj) { //根据缓存对象获得html内容
      if (!obj || !obj.data.length)
        return "";
      obj = obj.data;
      var html = "";
      for (var i = 0; i < obj.length; i++) {
        html += this.createMessageHtml(obj[i]);//------------------------------------------------------------------------------------------------显示消息内容
      }
      return html;
    },

    createMessageHtml: function(item) {//------------------------------------------------------------------------------------------------显示消息内容
      var html = "";
      var sendTime = new Date();
      if (parseInt(item.CT) - (60 * 5) > this.timeFalg) {
        sendTime.setTime(parseInt(item.CT) * 1000);
        html += '<li class="time">' + formatDate(sendTime) + '<li>'
        this.timeFalg = parseInt(item.CT);
      }

      html += '<li class="list-group-item ' + item.role + '">';
      html += '<div class="chatItemContent">';
      html += '<img click="showProfile" src="http://user.qbcdn.com/user/avatar/queryMyAvata65/' + item.S + '/nosrc/1" class="talk-head" onerror="this.src=\'http://www.qbcdn.com/images/userpicnone.gif\'">';
      html += '<div class="cloud cloudText">';
      html += '<div class="cloudContent">' + this.getMessgaeByType(item) + '</div>';
      html += '<div class="cloudAngle"></div>';
      html += '</div></div>';
      html += '</li>';
      return html;
    },


    getMessgaeByType: function(message, history) {//-------------------------------------------------------------------------------------------解析服务端的内容
      var msg = "";
      var content = $.parseJSON(message.P);

      switch (parseInt(content.CTT)) {
        case 1:
        case 2:
          /*此处判断是针对于表情*/
          for (var i = 0; i < ExpressionPlugin.baseData.length; i++) {
            var str = "[" + ExpressionPlugin.baseData[i][0] + "]";
            var begin = content.M.indexOf(str);
            if (begin > -1) {
              var imghtml = '<img class="smile-img" src="' + smile_url + ExpressionPlugin.baseData[i][1] + '">';
              content.M = replaceAll(content.M, str, imghtml);
            }
          }

          msg = content.M;
          msg = this.transUniCode(content.M);
          msg = msg.replace(/\r\n/g, '<br>');
          break;
        case 3:
          msg = '<img class="content-img" src="' + content.M.substring(5, content.M.length - 6) + '?imageMogr2/format/png"/>';
          break;
        case 4:
          msg = content.M;
          msg = msg.replace("[voice]", "").replace("[/voice]", "");
          msg = '<a href="javascript:void(0)" class="audiolink" id="' + message.U + '" voiceurl="' + msg + '"><span class="span-voice">  </span></a>';
          break;
        case 5: //表情
          for (var i = 0; i < ExpressionPlugin.extraData.length; i++) {
            var str = "[smiley][#" + ExpressionPlugin.extraData[i][0] + "][/smiley]";
            var begin = content.M.indexOf(str);
            if (begin > -1) {
              var imghtml = '<img class="express-img" src="' + smile_url + ExpressionPlugin.extraData[i][1] + '">';
              content.M = replaceAll(content.M, str, imghtml);
            }
          }
          msg = content.M;
          msg = this.transUniCode(content.M);
          msg = msg.replace(/\r\n/g, '<br>');
          break;
        case 6: //其他消息类型
          var style = '';
          var stylewapper = "";
          if (history) {
            style = 'style="left:0px"';
            stylewapper = 'style=width:186px';
          }

          switch (parseInt(content.ST)) {
            case 601:
              msg = "多图文链接";
              break;
            case 602:
              msg = "单图文链接";
              break;
            case 701:
              //msg = "HTML链接";
                var product = $.parseJSON(content.M);
                msg = product.url;
              break;
            case 901:
              var product = $.parseJSON(content.M);
              msg = '<div ' + stylewapper + ' class="product-item">';
              //msg = '<div '+stylewapper+' class="product-item" onclick="openNewProductTab(\''+product.id+'\')">';
              if (!history)
                msg += '  <img src="' + product.img_url + '"/>';
              msg += '  <p ' + style + ' class="product-title">商品名称:&nbsp;' + product.title + '</p>';

              if (parseInt(product.price) == 0) {
                msg += '  <p ' + style + ' class="product-price">价格面议</p>';
              } else {
                msg += '  <p ' + style + ' class="product-price">' + Math.round(parseFloat(product.price) * 100) + ' 钱宝币</p>';
              }
              msg += '</div>';
              break;
            case 902:
              var order = $.parseJSON(content.M);
              msg = '<div ' + stylewapper + ' class="order-item" buyerid="' + order.buyer_id + '" id="' + order.id + '">';
              if (!history)
                msg += '  <img src="' + order.img_url + '"/>';
              msg += '  <p ' + style + ' class="order-title">订单号:&nbsp;' + order.id + '</p>';
              msg += '  <p ' + style + ' class="order-num">数量:&nbsp;' + order.number + '件</p>';
              msg += '  <p ' + style + ' class="order-state">状态:&nbsp;' + order.state + '</p>';
              if (parseInt(order.total) == 0)
                msg += '  <p ' + style + ' class="order-price">价格面议</p>';
              else
                msg += '  <p ' + style + ' class="order-price">' + parseFloat(order.total) * 100 + '&nbsp;钱宝币</p>';
              msg += '</div>';
              break;
          }
          break;
        case 7: //地理位置
          msg = "[当前网页不支持地理信息!]";
          break;
      }
      return msg;
    },



    parseMessage: function(message) {
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
        //if (headers && utf8ByteLength(body) == headers[0]) {
        try {
          return {
            "mtype": headers[1],
            "body": JSON.parse(body)
          };
        } catch (err) {
          throw err;
        }
        //				}
      }
      return false;
    },


    setCache: function(name, message, role, badges, insert) { //badge参数只有在最开始读取最近联系人消息的时候才应该加上
      if (!badges)
        badges = 0;
      if (role) {
        if (!this.cache[name]) {
          this.cache[name] = {};
          this.cache[name].data = new Array();
        }
        if (!this.cache[name].notReadCount)
          this.cache[name].notReadCount = parseInt(badges, 10);
        if (!this.cache[name].firstView)
          this.cache[name].firstView = true;
        message.role = role;
        if (insert) {
          this.cache[name].data.unshift(message);
        } else {
          this.cache[name].data.push(message);
        }
      } else {
        this.cache[name] = message;
      }
    },
    getCache: function(name) {
      return this.cache[name];
    },


    setMsgList: function(name, nickName) {//-------------------------------------------------------------------------------------------------------------------setMsgList
      /*name是缓存对象的名称 nickName是直接制定聊天对象的名称，
       * 由于发送完毕获取到发送人的昵称是当前账号的昵称，而真正需要的昵称是当前聊天对象的昵称，
       * 所以在发送完毕后需要的昵称参数需要格外添加*/
      var talkRecord = this.getCache(name);
      var message = talkRecord.data[talkRecord.data.length - 1];
      var content = JSON && JSON.parse(message.P) || $.parseJSON(message.P);
      var msg = "";
      switch (parseInt(content.CTT)) {
        case 1:
        case 2:
          msg = this.transUniCode(content.M);
          break;
        case 3:
          msg = "图片"
          break;
        case 4:
          msg = "声音";
          break;
        case 5: //表情
          msg = "表情"
          break;
        case 6: //其他消息类型
          switch (parseInt(content.ST)) {
            case 601:
              msg = "多图文链接";
              break;
            case 602:
              msg = "单图文链接";
              break;
            case 701:
              msg = "HTML链接";
              break;
            case 901:
              msg = "商品消息";
              break;
            case 902:
              msg = "订单消息";
              break;
          }
          break;
        case 7: //地理位置
          msg = "[地理位置]";
          break;
      }
      //判断当前对话人id
      var picId = message.CID ? message.CID : message.S;

      var html = '<li class="buyer-list-a" id="talkList-' + name + '">';
      if (name == this.getCurrentName()) {
        html = '<li class="buyer-list-a active" id="talkList-' + name + '">';
      }
      html += '<img src="http://user.qbcdn.com/user/avatar/queryMyAvata65/' + picId + '/nosrc/1" onerror="this.src=\'http://enterprise.qbao.com/webChat/business-center/images/im-default-head-img.gif\'" class="img-circle">';
      if (parseInt(talkRecord.notReadCount) > 0)
        html += '<span class="new_icon">' + talkRecord.notReadCount + '</span>';
      if (!nickName) {
        nickName = this.transUniCode(message.NN);
      }
      if (nickName.indexOf("\"") == 0 && nickName.lastIndexOf("\"") == nickName.length - 1) {
        nickName = nickName.substring(1, nickName.length - 1);
      }
      html += '<h4 class="list-group-item-heading">' + nickName + '</h4>';
      html += '<p class="list-group-item-text">' + msg + '</p>';
      html += '</li>';

      var item = $("#talkList-" + name);
      if (item)
        item.remove();

      if (message.MT == 2 || message.MT == 4) { //||myUserId==message.BID
        if (((message.CID != currentTalkUserId && message.S != currentTalkUserId) || !currentTalkUserId) && talkRecord.notReadCount > 0) {
          $("#group-item-person").find(".red-point").css("display", "block");
        }
        $("#person-talk-list").prepend(html);
        document.getElementById("group-item-person").click();
      } else if (message.MT == 3) {
        if (((message.CID != currentTalkUserId && message.S != currentTalkUserId) || !currentTalkUserId) && talkRecord.notReadCount > 0) {
          var ids = this.getCache("businessIds"); //过滤掉多余的企业信息,因为会有垃圾数据的BID指向的不是当前小儿关联商家的ID
          for (var i = 0; i < ids.length; i++) {
            if (ids[i] == talkRecord.data[0].BID) {
              $("#group-item-business").find(".red-point").css("display", "block");
            }
          }
        }
        $("#buyer-list-" + message.BID).prepend(html);
        document.getElementById("group-item-business").click();
        this.slideHandler("#col-business-" + message.BID, "down");
        $("#col-business-" + message.BID).slideDown();

        //买家后面要加数字
        var count = $("#buyer-list-" + message.BID).find(".buyer-list-a").length;
        $("#buyer-title-count-" + message.BID).html("(" + count + ")");
      }
    },
    transUniCode: function(str) {
      if (!str)
        return "";
      if (str.indexOf("\\u") >= 0) {
        str = eval(str);
      }
      return str;
    },
    setNewMsgTitle: function() {
      //			newTitle="你有新消息";
      //			newMsgTitInterval=setInterval(newMsgTit,200);
    },
    setOriTitle: function() {
      //			clearInterval(newMsgTitInterval);
      //			document.title=oriTitle;
    },
    getNameByMessage: function(message) { //根据消息获得缓存名称
      var name = "";
      message.CID ? name = message.CID : name = message.S;
      return message.MT + "_" + message.BID + "_" + name;
    },
    commitBigExpress: function(msg, imgMsg) {
      var thisobj = this;
      var contentType = 5;
      if (imgMsg) {
        openTip("图片发送中....")
        contentType = 3
        msg = imgMsg;
      }
      $.ajax({
        type: "POST",
        url: urlAddress + "/merchantUser/webchat/sendMessage.html",
        data: {
          merUserId: currentShopId,
          toid: currentTalkUserId,
          message: msg,
          contenttype: contentType,
          nn: this.cache['nameCache'][currentShopId],
        },
        success: function(data) {
          closeTip();
          var resp = data;
          if (resp.success) {
            var msg = $.parseJSON(resp.message).data;
            if (msg.exception) {
              console.error("发送错误");
              return;
            }
            thisobj.setCache(thisobj.getCurrentName(), msg, "me");

            var name = thisobj.getCurrentName();
            im.setMsgList(name, currentTalkUserNickName);

            var talkCache = thisobj.getCache(name);
            if (talkCache && talkCache.data) {
              talkCache = talkCache.data;
              var html = thisobj.createMessageHtml(talkCache[talkCache.length - 1]);
              $("#message_contents").find("#talk-content-list-area").append(html);
              thisobj.scrollBottom();
              //如果有图片文件的话要给最后的图片文件加上 load 事件
              if (html.indexOf("content-img") > -1) {
                $("#message_contents").find(".content-img").last().load(function() {
                  im.scrollBottom();
                });
              }
              return;
            }
          } else if (resp.status == -1) {
            console.error("太快了，怎么受的了");
          } else {

          }
        },
        failure: function(errMsg) {
          console.error(errMsg);
        }
      });
      $("#input_message").select();
    },


    commitForm: function(form, imgMsg, contentType) {//-----------------------------------------------------------------------发送消息-
      var message = form.formToDict();
      if (!contentType) {
        imgMsg ? contentType = 3 : contentType = 1;
      }
      message.message = message.message.replace(/(^\s*)|(\s*$)/g, "");
      //空消息
      if ((!message.message || message.message == "") && !imgMsg)
        return;
      var ids = [talkType, currentShopId, currentTalkUserId];
      if (imgMsg) {
        message["message"] = imgMsg;
      }
      var thisobj = this;
      $.ajax({
        type: "POST",
        url: urlAddress + "/merchantUser/webchat/sendMessage.html",
        data: {
          merUserId: ids[1],
          toid: ids[2],
          message: message.message,
          contenttype: contentType,
          nn: this.cache['nameCache'][currentShopId]
        },
        success: function(data) {
          var resp = data;
          if (resp.success) {
            var msg = $.parseJSON(resp.message).data;
            if (msg.exception) {
              console.error("发送错误");
              return;
            }
            thisobj.setCache(thisobj.getCurrentName(), msg, "me");

            var name = thisobj.getCurrentName();
            im.setMsgList(name, currentTalkUserNickName);

            var talkCache = thisobj.getCache(name);
            if (talkCache && talkCache.data) {
              talkCache = talkCache.data;
              var html = thisobj.createMessageHtml(talkCache[talkCache.length - 1]);
              $("#message_contents").find("#talk-content-list-area").append(html);
              thisobj.scrollBottom();
              return;
            }
          } else if (resp.status == -1) {
            console.error("太快了，怎么受的了");
          } else {

          }
        },
        failure: function(errMsg) {
          console.error(errMsg);
        }
      });
      form.find("input[type=text]").val("").select();
      $("#input_message").val("").select();
    },


    getHistoryTalkRecord: function() {
      var talkCount = $("#talk-content-list-area").find(".list-group-item").length;
      var res = this.getRemoteData("merchantUser/webchat/chatHistory.html", "merUserId=" + currentShopId + "&clientid=" + currentTalkUserId + "&waiterid=" + myUserId + "&offset=" + talkCount + "&limit=" + this.talkRecordLimit);

      res = $.parseJSON(res.message).data.items;

      if (res.length == 0) {
        document.getElementById("more").style.display = "none";
        //				console.error("没有更多历史消息!");
        return;
      }


      this.timeFalg = 0;
      var html = ""
      for (var i = res.length - 1; i >= 0; i--) {
      	console.log('S = ' + res[i].S + ' myUserId = ' + myUserId + ' BID = ' + res[i].BID);
        if (res[i].S == res[i].BID) {
          res[i].role = "me";
        } else {
          res[i].role = "you";
        }
        html += this.createMessageHtml(res[i]);
      }
      $("#message_contents").find("#talk-content-list-area").prepend(html);
    },
    scrollBottom: function() {
      //对话框滚动到底部
      var dd = document.getElementById("message_contents");
      dd.scrollTop = dd.scrollHeight - dd.offsetHeight;
    },
    getNoReadMsg: function(id) {
      var res = im.getRemoteData("merchantUser/webchat/badge.html?merUserId=" + id);
      return res;
    },
    isPersonAndCompany: function() {
      var res = im.getRemoteData("merchantUser/webchat/caculateTab.html");
      document.getElementById("group-item-person").style.display = "none";
      document.getElementById("group-item-business").style.display = "none";

      if (!res.data) {
        openTip("连接错误!");
      }

      //  width: 100%;border-bottom: 1px solid #d0d6e2 !important;
      if (res && res.data && res.data.showCompanyMerchantTab && res.data.showPersonalMerchantTab) {
        document.getElementById("group-item-business").style.display = "block";
        document.getElementById("group-item-person").style.display = "block";
        imRole = 3; //0无角色 1个人 2商家 3小二
      } else {
        if (res && res.data && res.data.showCompanyMerchantTab) {
          document.getElementById("group-item-business").style.display = "block";
          document.getElementById("group-item-business").style.width = "100%";
          document.getElementById("group-item-business").style.borderBottom = "1px solid #d0d6e2";
          imRole = 2; //0无角色 1个人 2商家 3小二
        } else if (res && res.data.showPersonalMerchantTab) {
          document.getElementById("group-item-person").style.display = "block";
          document.getElementById("group-item-person").style.width = "100%";
          document.getElementById("group-item-person").style.borderBottom = "1px solid #d0d6e2";
          imRole = 1; //0无角色 1个人 2商家 3小二
        }
      }
    },
    readMsg: function(clientId) {
      var res = this.getRemoteData("merchantUser/webchat/ack.html?clientid=" + clientId + "&waiterid=" + myUserId + "&merUserId=" + currentShopId);
      return res;
    },
    putOffLineMsg: function(waiterid, sellerids) {
      // this.getRemoteData("merchantUser/webchat/getOffline.html?waiterid=" + waiterid + "&sellerids=" + sellerids);
    }
  };



  // 插件调用
  var im = new IMplugin();
  im.getBusinessList();
  im.isPersonAndCompany();



  // 初始样式
  im.closeAllWindow();
  // 显示默认对话
  $("#talk-default").css("display", "block");

  //获得ticket和UID
  var res = im.getRemoteData("merchantUser/webchat/getHashKey.html");
  if (!res)
    return;
  res = res.data;
  myUserId = res[1];
  myTicket = res[0];



  // 手风琴－－商家
  function collapse(parentNode, colElement, expandElement, fansElement, isExpand) {
    var col = $("" + colElement + "");
    var parentElement = $("" + parentNode + "");
    //判断是否展开手风琴
    if (isExpand) {
      im.slideHandler(col.next("" + expandElement + ""), "down");
    } else {
      im.slideHandler(col.next("" + expandElement + ""), "up");
    }
    parentElement.delegate(colElement, "click", function(eve) {
      //展开页面
      im.slideHandler($(eve.currentTarget).next("" + expandElement + ""), "toggle");
    });
    parentElement.delegate("" + fansElement + "", "click", function(eve) {
      //当前商家id
      currentShopId = im.getIdByElementId(eve.currentTarget.id); //全局
      currentGid = null;
      im.getFansList(1, currentShopId)
      im.getFansArea(currentShopId);
      im.closeAllWindow();
      currentTalkUserId = "";
      document.getElementById("dialogue-area").style.display = "block";
    });
  }
  collapse("#business-list", ".business-name", ".col1", ".fans-title", true);
  if (!isGetLastMsg) {
    if (imRole == 1) { //0无角色 1个人 2商家 3小二
      im.setPersonRecentMsgList();
    } else if (imRole == 2) {
      im.setBussinessRecentMsgList();
    } else if (imRole == 3) {
      im.setBussinessRecentMsgList();
      im.setPersonRecentMsgList();
    }
    isGetLastMsg = true;
  }

  // 商家个人切换
  $("#group-panel").find(".group-item").on("click", function(eve) {
    var id = eve.currentTarget.id;
    $("#group-panel").find(".group-item").removeClass("select-banner");
    if (imRole == 3)
      $("#" + id).addClass("select-banner");
    $(".group-area").css("display", "none");
    var target = $("#" + id).attr("target");
    document.getElementById(target).style.display = "block";
  });




  /*
   * 粉丝按钮点击事件
   */
  $('#dialogue-list-area').delegate(".btn-contact", "click", function(e) {
    im.closeHistoryWindow();
    var currentObj = $(e.currentTarget);
    currentShopId = currentObj.attr("shopid");
    currentTalkUserId = e.currentTarget.id.split("-")[1];
    currentTalkUserNickName = currentObj.attr("nickname");
    //切换为商家聊天模式
    talkType = talkModel.businessModel;

    $(".fans-title").removeClass("fans-title-hover");
    $('.buyer-list-a').removeClass('active');
    $('#talkList-' + talkType + '_' + currentShopId + '_' + currentTalkUserId).addClass('active').find(".new_icon").css("display", "none");

    //打开聊天框
    im.openTalkDialog();
  });



  /*聊天列表点击事件*/
  $("#person-talk-list,.buyer-list").delegate(".buyer-list-a", "click", function(eve) {
    var id = eve.currentTarget.id;
    var idArr = id.split("-");
    id = idArr[1].split("_");

    // im.cache[idArr[1]].notReadCount = 0;
    $(eve.currentTarget).find(".new_icon").css("display", "none");

    $(".fans-title").removeClass("fans-title-hover");
    $('.buyer-list-a').removeClass('active');
    $(eve.currentTarget).addClass('active');

    talkType = id[0];
    currentShopId = id[1];
    currentTalkUserId = id[2];
    currentTalkUserNickName = $(eve.currentTarget).find(".list-group-item-heading").html();
    im.openTalkDialog();
    im.closeHistoryWindow();

    //	//还原标题
    //	var count = $(eve.currentTarget).find(".new_icon").html();
    //	totalMsgCount -= parseInt(count);
    //	if (totalMsgCount <= 0) {
    //		totalMsgCount = 0;
    //		im.setOriTitle();
    //	}
  });


  //粉丝分页按钮绑定事件
  var pageIndex = 1;
  // 上一页
  var btnSwitch = true;
  $("#ul-paginator").delegate("#paginator-prev-warp", "click", function() {
    if (pageIndex <= 1)
      return;
    pageIndex--;
    im.getFansList(pageIndex, currentShopId);
  });

  // 下一页
  $("#ul-paginator").delegate("#paginator-next-warp", "click", function() {
    if (pageIndex >= pageSum)
      return;
    pageIndex++;
    im.getFansList(pageIndex, currentShopId);
  });

  // 数字按钮
  $("#ul-paginator").delegate(".pagebtn", "click", function(eve) {
    pageIndex = parseInt(eve.currentTarget.innerHTML);
    im.getFansList(pageIndex, currentShopId);
  });

  //历史记录分页按钮绑定事件
  var recordpageIndex = 1;
  // 上一页
  var btnSwitch = true;
  $("#record-paginator").delegate("#paginator-prev-warp", "click", function() {
    if (recordpageIndex <= 1)
      return;
    recordpageIndex--;
    im.getTalkRecord(recordpageIndex);
    //		im.openBtnSwitch();
  });

  // 下一页
  $("#record-paginator").delegate("#paginator-next-warp", "click", function() {
    if (recordpageIndex >= pageSum)
      return;
    recordpageIndex++;
    im.getTalkRecord(recordpageIndex);
  });

  // 数字按钮
  $("#record-paginator").delegate(".pagebtn", "click", function(eve) {
    recordpageIndex = parseInt(eve.currentTarget.innerHTML);
    im.getTalkRecord(recordpageIndex);
  });

  if ($('#group-item-business').is(':hidden')) {
    document.getElementById("group-item-person").click();
  } else {
    document.getElementById("group-item-business").click();
  }
  //聊天栏上方的历史纪录按钮
  document.getElementById("more").onclick = function() {
    im.getHistoryTalkRecord();
  };

  //聊天栏右边的历史纪录按钮
  document.getElementById("talk-record-btn").onclick = function() {
      var isOpen = document.getElementById("talk-record-area").style.display;
      if (isOpen == "" || isOpen == "none") {
        var recordpageIndex = 1;
        im.getTalkRecord();
        document.getElementById("message_contents").style.right = "251px";
        document.getElementById("messageform").style.right = "251px";
        document.getElementById("talk-record-area").style.display = "block";
      } else {
        im.closeHistoryWindow();
      }
    }
    //关闭历史记录窗口
  document.getElementById("close-record-btn").onclick = function() {
      document.getElementById("message_contents").style.right = "0px";
      document.getElementById("messageform").style.right = "0px";
      document.getElementById("talk-record-area").style.display = "none";
    }


    //关闭聊天窗口
  document.getElementById("close-talk-dlg-btn").onclick = function() {
    $('.buyer-list-a').removeClass('active');
    document.getElementById("message_container").style.display = "none";
    currentTalkUserId = "";
  }

  $("#messageform").bind("submit", function() {
    im.commitForm($("#messageform"));//发送消息
  });
  $("#messageform").bind("keypress", function(e) {
    if (e.ctrlKey && (e.keyCode == 13 || e.keyCode == 10)) {
      var html = $("#input_message").val();
      $("#input_message").val(html + "\r\n");
      e.preventDefault();
    } else if (e.keyCode == 13) {
      im.commitForm($("#messageform"));
      e.preventDefault();
    }
  });
  $("#enter-msg").on("click", function() {
    im.commitForm($("#messageform"));
  });



  //启动socket-------------------------------------------------------------------------------------------------------------------------------------------------------
  var soc = new SocketPlugin();
  soc.startSocket();



    //点击选择大图标还是小图标
  $("#tab_Smile").find("li").on("click", function(eve) {
    $("#tab_Smile").find("li").removeClass("active");
    if (eve.currentTarget.id == "tabli_normalSmile") {
      $("#normalSmile").css("display", "block");
      $("#bigSmile").css("display", "none");
    } else {
      $("#normalSmile").css("display", "none");
      $("#bigSmile").css("display", "block");
    }
    $(eve.currentTarget).addClass("active");
  });


  //bind open express panel event
  document.getElementById("span-face").onclick = function() {
    ExpressionPlugin.openSmilePanel();
  };
  //create express html
  ExpressionPlugin.createSmilePanel();
  //bind express event
  $("#normalSmile").delegate(".thumbnail", "click", function(eve) {
    var ele = $(eve.currentTarget);
    var smile = ele.attr("name");
    smile = "[" + smile + "]";
    ExpressionPlugin.insertAtCaret($("#input_message").get(0), smile);
    ExpressionPlugin.openSmilePanel();
  });
  $("#bigSmile").delegate(".thumbnail", "click", function(eve) {
    var ele = $(eve.currentTarget);
    var smile = ele.attr("name");
    smile = "[smiley][#" + smile + "][\/smiley]";
    im.commitBigExpress(smile);
    ExpressionPlugin.openSmilePanel();
  });

  $("#container_main").on("click", function(eve) {
    if (eve.target.id != "span-face" && eve.target.parentNode.className != "thumbnail") {
      ExpressionPlugin.closeSmilePanel();
    }
  });

  //bind img btn click
  document.getElementById("span-img").onclick = function() {
    document.getElementById("image_upload_input").click();
  };
  document.getElementById("image_upload_input").onchange = function(eve) {
    ImageSend.asyncUploadImage(eve);
    $(this).val('');
  };

  //声音点击事件
  $("#talk-content-list-area,#record-list").delegate(".audiolink", "click", function(eve) {
    AudioPlay.handler_play(eve.currentTarget, 0);
  });

  /*几个工具类*/
  function formatDate(date) {
    var year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds();

    if (hour < 10) {
      hour = '0' + hour;
    }
    if (minute < 10) {
      minute = '0' + minute;
    }
    if (second < 10) {
      second = '0' + second;
    }

    return year + '-' + month + '-' + day + '&nbsp;' + hour + ':' + minute + ':' + second;
  }

  function utf8ByteLength(str) {
    if (!str) return 0;
    var escapedStr = encodeURI(str);
    var match = escapedStr.match(/%/g);
    return match ? (escapedStr.length - match.length * 2) : escapedStr.length;
  }

  function authSocket() {
    var _m_seq = soc.genSeq();
    if (myTicket != undefined && myUserId != undefined) {
      var ap = {
        "COOKIE": myTicket,
        "ID": parseInt(myUserId)
      }
      var body = {
        "I": _m_seq,
        "V": _version,
        "AT": 2,
        "AP": JSON.stringify(ap)
      };
      soc.send(_mt_auth_req, body);
    }
  }

  function heartBeat() {
    if (soc.heartBeatCount >= soc.heartBeatCountOut) {
      soc.close();
      soc.start();
    }
    if (soc.lastMessageRecieved != 0 && (Date.parse(new Date()) - soc.lastMessageRecieved) / 1000 > heartBeatSecond) {
      soc.heartBeatCount++;
      var _auth_seq = soc.genSeq();
      var body = {
        "I": _auth_seq,
        "P": "" + Date.parse(new Date())
      };
      soc.send(_mt_heartbeat_req, body);
    }
  }


  jQuery.fn.formToDict = function() {
    var fields = this.serializeArray();//序列化表单值
    var json = {}
    for (var i = 0; i < fields.length; i++) {
      json[fields[i].name] = fields[i].value;
    }
    if (json.next) delete json.next;
    return json;
  };
  $("#message_contents").delegate(".order-item", "click", function(eve) {
    var id = eve.currentTarget.id;
    var buyerid = $(eve.currentTarget).attr("buyerid");
    if (!id)
      return;
    window.open("http://oc.qbao.com/order/seller/detail/" + id + ".html?buyerId=" + buyerid + "&_merchant_user_id_=" + currentShopId);
  });


  function openNewProductTab(id) {
    window.open("http://m.qianbao666.com/store/product.htm?sourceType=1&location=1&productId=" + id);
  }

  function newMsgTit() {
    var titArr = newTitle.split("");
    titArr.unshift(titArr[titArr.length - 1]);
    titArr.splice(titArr.length - 1, 1);
    newTitle = titArr.join("");
    document.title = newTitle;
  }


  //防止session失效的接口
  function keepAlive() {
    $.ajax({
      type: "get",
      url: urlAddress + "keepAlive.html",
      async: true,
      success: function(res) {

      }
    });
  }
  setInterval(keepAlive, 1000 * 60 * 60);

  //out
  function logout(isfresh) {
    /*
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

  function replaceAll(str, s1, s2) {
    str = str.replace(s1, s2);
    if (str.indexOf(s1) > -1) {
      str = replaceAll(str, s1, s2)
    }
    return str;
  }
  //检查浏览器

  function checkBrowser() {
    if (!!window.ActiveXObject || "ActiveXObject" in window) {
      heartBeatSecond = 10;
    }
    if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.indexOf("MSIE 6.") > -1) {
      return false;
    } else if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.indexOf("MSIE 7.") > -1) {
      return false;
    } else if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.indexOf("MSIE 8.") > -1) {
      return false;
    } else if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.indexOf("MSIE 9.") > -1) {
      return false;
    } else if (navigator.userAgent.indexOf("Opera") != -1 || navigator.userAgent.indexOf('OPR') != -1) {
      return false;
    }
    return true;
  }
  // 添加提示
  $("body").append("<div id='tip-alert-shadow'></div><div id='tip-alert-warp'><div id='tip-alert-box'><img style='margin:50px auto;' src='" + smile_url + "im-loading.gif' /><div id='tip-alert-content'></div></div></div>");

  function openTip(msg, timeout) {
    $("#tip-alert-content").html(msg);
    if ($("#tip-alert-shadow").css("display") != "block") {
      $("#tip-alert-shadow").fadeIn(200);
      $("#tip-alert-warp").fadeIn(200);
    }
    if (timeout) {
      setTimeout(closeTip, timeout);
    }
  }

  function closeTip() {
    $("#tip-alert-shadow").fadeOut(200);
    $("#tip-alert-warp").fadeOut(200);
  }
  $("#tip-alert-warp").onclick = function() {
    closeTip();
  }
});
