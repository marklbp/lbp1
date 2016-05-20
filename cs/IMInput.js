(function(global,a){
	
	var IMInput = a();

	IMInput.init(function(){

		  var that = this;

		  //输入表单事件处理
		  $("#messageform").bind("keypress submit click", function(e) {


		    if("submit"==e.type){

		        //注册表单提交事件
		        that.submit($(this));

		    }else if("keypress"==e.type){

		          //注册表单回车事件
		        if (e.ctrlKey && (e.keyCode == 13 || e.keyCode == 10)) {
		          //
		          var $input=$(this).find("textarea")
		          	  ,val = $input.val()

		          $input.val(val + "\r\n");

		          e.preventDefault();

		        } else if (e.keyCode == 13) {
		          //仅回车提交

		          that.submit($(this));
		          e.preventDefault();

		        }

		    }else if("click"==e.type){

		       if($(e.target).hasClass("enter-msg")){

		          //注册消息发送点击事件
		          that.submit($(this));

		       }

		    }

		  });


	})


	if("function"==typeof define){
	    return define(function(){
	      return IMInput
	    })
  	}else{
	    global.__IMInput=global.IMInput;
	    global.IMInput=IMInput;
	}


})(this,function() {

	var inited = false;

	return{

		init:function(callback){

			if(!inited){

				//预留初始化逻辑

				inited = true;
			}

			"function" == typeof callback && callback.call(this);

			return this;
		}


		formToDict:function (form) {
		    var fields = $(form).serializeArray();//序列化表单值
		    var json = {}
		    for (var i = 0; i < fields.length; i++) {
		      json[fields[i].name] = fields[i].value;
		    }
		    if (json.next) delete json.next;
		    return json;
		}


	    ,commitBigExpress: function(msg, imgMsg) {
	      var thisobj = this;
	      var contentType = 5;
	      if (imgMsg) {
	        openTip("图片发送中....")
	        contentType = 3
	        msg = imgMsg;
	      }
	      $.ajax({
	        type: "POST",
	        url: this.url.sendMsgUrl,
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
	        error: function(errMsg) {
	          console.error(errMsg);
	        }
	      });

	      $("#input_message").select();
	      
	    }

	    //表单提交
	    ,submit: function(form) {
	      var message = this.formToDict(form);
	      message.message = message.message.replace(/(^\s*)|(\s*$)/g, "");

	      //空消息
	      if ((!message.message || message.message == "") && !imgMsg)return;
		  form.find("input[type=text],textarea").val("").select();
		  
		  return IMWin.send(message);

	    }


		,extend:function(a){
			return $.extend(this,a||{})
		}

	}


})