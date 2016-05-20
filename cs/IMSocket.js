(function(global,a){

    var IMSocket = a();

    IMSocket.init(function(){


    })

    //供模块加载使用
    if("function"==typeof define){
      return define(function(){
        return IMSocket
      })
    }else{
    //抛出当前执行环境的下全局变量
      global.__IMSocket = global.IMSocket;
      global.IMSocket=IMSocket;
    } 

})(this,function(){

    var inited = false;

    return {

        init: function(callback) {
          var that=this;
          if(!inited){

            var fire=function(e){
              that.fire(e.type,e)
            };

            this.socket.onopen = fire
            this.socket.onclose = fire;
            this.socket.onerror = fire;
            this.socket.onmessage = fire;

            //启动socket用于收消息
            this.startSocket();

            inited=true
          }

          "function" == typeof callback && callback.call(this)
          return this;
        }

        ,socket: {}

        ,connected: false

        ,heartBeatTime: {}

        ,heartBeatCount: 0

        ,heartBeatCountOut: 2

        ,lastMessageRecieved: 0

        ,vars:{

          reconnectCount : 0
          ,maxReConnectCount : 7
          ,socket_url:"ws://im.qbao.com:12346"

        }

        ,closeSocket: function() {
          //关闭连接
          this.socket.close();
        }

        ,genSeq: function() {
          _m_seq = (_m_seq + 1) % 4294967296;
          return _m_seq;
        }

        ,startSocket: function() {
          
          var thisobj = this;
          
          //var https = 'https:' == document.location.protocol ? true : false;

          var url = this.vars.socket_url;

          try {
            this.socket = new WebSocket(url);//申请一个WebSocket对象
            if (this.socket == undefined || this.socket == null) {
              logout(true);
            }
          } catch (err) {
            openTip("连接错误");
            return;
          }

          this.on("open",function(){

              //当websocket创建成功时，即会触发onopen事件
              openTip("正在连接,请稍候...");
              this.connected = true;
              heartBeat();
              // heartbeatInterval = setInterval(heartBeat, heartbeatTimeOut);
              heartbeatInterval = setInterval(heartBeat, heartBeatSecond * 1000);//不停关闭在连接
              authSocket();

          })

          this.on("close",function(){
              //当客户端收到服务端发送的关闭连接的请求时，触发onclose事件
              this.connected = false;
              clearInterval(heartbeatInterval);
              if (this.vars.reconnectCount <= this.vars.maxReConnectCount) {
                setTimeout(function() {
                  console.log("reconnecting...");
                  this.closeSocket();
                  this.vars.reconnectCount++;
                  this.startSocket();
                }, 1000 * 5);
              } else {
                openTip("连接已断开");
                document.title = "连接已断开";
              }            
          })

          this.on("error",function(event){

              //如果出现连接，处理，接收，发送数据失败的时候就会触发onerror事件
              clearInterval(heartbeatInterval);
              this.connected = false;
              openTip("连接出错,正在重连..");
              if (this.vars.reconnectCount < this.vars.maxReConnectCount) {//最多连接次数
                setTimeout(function() {
                  console.log("reconnecting...");
                  this.closeSocket();
                  this.vars.reconnectCount++;
                  this.startSocket();
                }, 1000 * 5);
              } else {
                openTip("连接已断开");
                document.title = "连接已断开";
              }

          })

          //scoket接受消息
          this.on("message",function(event){

            //当客户端收到服务端发来的消息时，会触发onmessage事件，参数evt.data中包含server传输过来的数据
            var str = base64.decode(event.data);
            var originMessage = im.parseMessage(str);
              
            if (originMessage.body.M) {
              console.log(originMessage.body.M[0].P);
            }

            this.lastMessageRecieved = Date.parse(new Date());
            if (originMessage) {//接收消息的内容
                this.judgeMsgType(originMessage);
            }

          })

        }

        ,getEvtCallbacks:function(evt){
            var callbacks;
            var events=this.events||(this.events={});
            callbacks=events[evt]||(events[evt]=[]);
            return callbacks
        }

        ,on:function(evt,callback){
          var callbacks=this.getEvtCallbacks(evt);
          if("function" == $.type(callback) )callbacks.push(callback);
          return this;
        }

        ,off:function(evt,cbName){
          if(cbName){
            var callbacks=getEvtCallbacks(evt)
                ,i=0;
            while(i<callbacks.length){
              if(callbacks[i]===cbName){
                callbacks.splice(callbacks[i],1);
                i-=1;
              }
              i++;
            }
          }else{
            callbacks=[];
          }
          return this;
        }

        ,fire:function(evt,e){
            var callbacks=this.getEvtCallbacks(evt);
            for (var i = 0,len=evts.length,cb; i < len; i++) {
              cb.call(this,e)
            }
        }

        ,judgeMsgType: function(originMessage) {
          switch (originMessage.mtype) {
            case _mt_content_messages: 
            //正常的接收消息
            //回复给服务器提示消息已经接收到了
              this.response(originMessage); 

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
                  thisobj.vars.reconnectCount++;
                } else if (payload.EC == -2) {
                  // openTip("已在其他地方登陆,如需重新登陆请刷新页面...");
                  this.closeSocket();
                  window.location.href = 'http://enterprise.qbao.com/merchantUser/merchantUcIndex.html' + window.location.search;
                } else if (payload.EC == -3) {
                  openTip("服务器忙");
                  this.closeSocket();
                  this.startSocket();
                  thisobj.vars.reconnectCount++;
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
                  thisobj.vars.reconnectCount = 0;

                }
              }
              break;
            default:
              break;
          }
          im.scrollBottom();
        }

        ,response: function(message) {
          var body = {
            "I": message.body.I,
            "EC": 0
          };
          this.send(_mt_response, body);
        }

        ,echo: function(message) {
          var body = {
            "I": message.body.I,
            "P": message.body.P
          };
          this.send(_mt_heartbeat_resp, body);
        }

        //socket发送消息
        ,send: function(messagetype, message) {

          if (this.connected) {
            var msg = this.createMessage(messagetype, message);
            for (var i = 0; i < msg.length; i++) {
              this.socket.send(msg[i]);
              console.log(i + " msg: " + msg[i]);
            }
          }

          
        }

        ,createMessage: function(messagetype, body) {
          body = JSON.stringify(body);
          var format = '!LBB';
          var values = [body.length, messagetype, 0];
          var packed = bufferpack.pack(format, values);
          return [packed, "\r\n", body];
        }
      
    };

})