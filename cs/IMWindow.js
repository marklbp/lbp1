(function(global,a){

  var IMWin = a();


  IMWin.init(function(){

    var that = this;

    /*聊天列表点击事件，开启与点击对象的聊天窗口，即聊天*/
    $("#person-talk-list").on("click",".buyer-list-a",  function(eve) {

        /*
            id : talkList-4_106001680_6412853
          
            talkType          = 4           //聊天类型
            currentShopId     = 106001680   //自己店名id
            currentTalkUserId = 6412853     //对话人的用户id
        */
        if($(this).hasClass("active"))return;
        var id = this.id.split("-")[1].split("_");
        //关闭该对象未读消息提示
        $(this).find(".new_icon").hide();

        $(".fans-title").removeClass("fans-title-hover");

        $('.buyer-list-a').removeClass('active');

        $(this).addClass('active');

        LoginUser.talkType = id[0];
        LoginUser.currentShopId = id[1];
        LoginUser.currentTalkUserId = id[2];

        LoginUser.currentTalkUserNickName = $(this).find(".list-group-item-heading").text();

        that.openTalkDialog();
        that.closeHistoryWindow();
    });


    //点击粉丝查看粉丝面板
    $('#person-area').on("click",".fans-title", function() {

        if($(this).hasClass("fans-title-hover"))return;
        $(this).addClass("fans-title-hover").siblings(".buyer-list-a").removeClass('active');
        $(".fans-title").removeClass("fans-title-hover");
        

        LoginUser.currentShopId = LoginUser.myShop.merUserId;

        that.getFansList(1, LoginUser.currentShopId);
        that.getFansArea(LoginUser.currentShopId);

        that.closeAllWindow();

        $("#dialogue-area").show();

    });


    $(".fans-title").on("click", function() {

      if($(this).hasClass("fans-title-hover"))return;
      $('.buyer-list-a').removeClass('active');
      $(".fans-title").removeClass("fans-title-hover");
      $(this).addClass("fans-title-hover");

    });


  })


  if("function"==typeof define){
    return define(function(){
      return IMWin
    })
  }else{
    global.__IMWin=global.IMWin;
    global.IMWin=IMWin;
  }



})(this,function(){

  var inited = false;

  return {

    init: function(callback) {

      if(!inited){

        inited=this.initIMWin().initTicketUid();

      }


      "function" == typeof callback && callback.call(this);

      return this;
    }

    ,url:{
      getBusinessListUrl   :  "/merchantUser/webchat/listShopIdAndShopName.html"
      ,getRecentlyListUrl  :  "/merchantUser/webchat/getRecentContacts.html?sellerids="
      ,getFansListUrl      :  "/merchantUser/webchat/fans.html"
      ,getFansAreaUrl      :  "/merchantUser/webchat/fangroups.html?merUserId="
      ,getHistoryDataUrl   :  "/merchantUser/webchat/chatHistory.html"
      ,caculateTabUrl      :  "/merchantUser/webchat/caculateTab1.html"
      ,readMsgUrl          :  "/merchantUser/webchat/ack.html?clientid="
      ,sendMsgUrl          :  "/merchantUser/webchat/sendMessage.html"
      ,getMsgBadge         :  "/merchantUser/webchat/badge.html?merUserId="
      ,getHashKeyUrl       :  "/merchantUser/webchat/getHashKey.html"

    }

    ,timeFalg: 0

    ,cache: {}

    ,fansLimit: 7 //每页显示的粉丝数

    ,talkRecordLimit: 20

    //初始化聊天窗口
    ,initIMWin:function(){

        this.isPersonAndCompany()

        this.getBusinessList();

        var myShop = LoginUser && LoginUser.myShop
            ,shopName = myShop && myShop.shopName
            ,merchantType = myShop && myShop.merchantType
            ,isMerchant = LoginUser && LoginUser.isMerchant
            ,isWaiter =LoginUser && LoginUser.isWaiter

        $('#group-item-person').text('我').hide();
        $('#group-item-business').text('雇主').hide();

        //企业商家时添加左侧“关注粉丝”
        if(merchantType == 2){
            this.displayFansFocusDom()
        }

        if (isMerchant&&isWaiter) {
            //是商家同时也是小二
            LoginUser.imRole = 3; 
            $("#group-item-business,#group-item-person").show();
            $('#my-friend-head').text(shopName);

        }else{

          if (isWaiter) {
            //商家 
            LoginUser.imRole = 2; 

            $("#group-item-business").css({
              "width":"100%"
              ,"border-bottom":"1px solid #d0d6e2"
            }).show()


          } else if (isMerchant) {
            //个人
            LoginUser.imRole = 1; 

            $("#group-item-person").css({
              "width":"100%"
              ,"border-bottom":"1px solid #d0d6e2"
            }).show();
            $('#my-friend-head').text(shopName);
          }

        }
          // 初始样式
        this.closeAllWindow();
        // 显示默认对话
        $("#talk-default").css("display", "block");

        return this;
    }

    //判断登录用户的身份  个人|商家
    ,isPersonAndCompany: function() {
     //var res = this.getRemoteData(this.url.caculateTabUrl);
      var res={
                data:{
                      employerShops:[]
                      ,isMerchant:true
                      ,isWaiter:false
                      ,myShop:{
                          merUserId:106001680
                          ,merchantType:1
                          ,shopName:"mc"
                      }
                    }
                ,message:null
                ,success:true
              }


      if (!res.data) return IMTip.openTip("连接错误!");

      $.extend(LoginUser,res.data||{});

      LoginUser.isPerSonAndCompany_res=res;

      return res;

    }

    ,getBusinessList: function() {

      if (!LoginUser._isPersonAndCompany_res||!LoginUser._isPersonAndCompany_res.data)return;

      var data = LoginUser.employerShops
          //次对象放入缓存中,用于根据当前聊天对象的 id 来获得当前发送人的昵称.
          ,nameCache = {}
          ,businessIds = []
          ,html = ""
          ,merUserId
          ,shopName
          ,merchantType
          ,nickName
          ,smile_url=IM_VAR.smile_url 

      this.setCache("recentMsgList", data);
      nameCache[LoginUser.personalMerUserId] = LoginUser.getPersonalMerUserName;

      for (var i = 0; i < data.length; i++) {

        merUserId = data[i].merUserId
        shopName = data[i].shopName
        merchantType = data[i].merchantType
        nickName  = data[i].nickName ? data[i].nickName : shopName
        businessIds.push(merUserId);
        nameCache[merUserId] = nickName;

        html += '<li class="business-li">'
                 + '  <div class="business-name checkstyle">'
                 + '    <img class="bussiness-head" src="' + smile_url + 'im-hotel-banner.png"/>'
                 + '    <span>' + shopName + '</span>'
                 + '    <img class="collapse-dir" src="' + smile_url + 'im-collapse-down.png"/>'
                 + '  </div>'
                 + '  <div class="col col1" id="col-business-' + merUserId + '">';

        if(merchantType == 2){
          html += '     <div class="fans-title checkstyle" id="fans-title-' + merUserId + '">'
                + '       <img src="' + smile_url + 'im-fans-banner_03.png"/>关注粉丝'
                + '     </div>';
        }              

        html += '       <div class="buyer-title checkstyle" id="buyer-title-' + merUserId + '">买家 <span id="buyer-title-count-' + merUserId + '"></span>' + '</div>'
                 + '    <div class="col col3">'
                 + '        <ul class="buyer-list" id="buyer-list-' + merUserId + '">' + '</ul>'
                 + '    </div>'
                 + '  </div>'
                 + '</li>';

      }

      $("#business-list").html(html);

      this.setCache("nameCache", nameCache);
      this.setCache("businessIds", businessIds);

    }

    //显示关注粉丝按钮
    ,displayFansFocusDom:function(merUserId,smile_url){

      var smile_url = IM_VAR.smile_url
          ,merUserId = LoginUser.myShop.merUserId

      var html = '<div class="fans-title checkstyle" id="fans-title-' + merUserId + '">'
               + '  <img src="' + smile_url + 'im-fans-banner_03.png"/>关注粉丝'
               + '</div>';
      $('#person-area').prepend(html);

    }

    //同步获取ticket和UID
    ,initTicketUid:function(){
      var res = this.getRemoteData({
        url:this.url.getHashKeyUrl
        ,async:false
      }).data;
      if(!res)return false;
      LoginUser.myUserId = res[1];
      LoginUser.myTicket = res[0];
      return true;
    }

    ,send:function(message){

        if (!message.contentType) {
          message.contentType =  1;
        }

        var ids = [talkType, currentShopId, currentTalkUserId];

        message.merUserId=currentShopId;

        message.toid=currentTalkUserId;

        message.nn=this.cache['nameCache'][currentShopId];

        var that = this;

        this.getRemoteData({
          type:"post"
          ,url:this.url.sendMsgUrl
          ,param:message
          ,always:function(resp){}
          ,ok:function(resp){

            if (resp.success) {

              var msg = $.parseJSON(resp.message).data;

              if (msg.exception) {
                console.error("发送错误");
                return;
              }

              that.setCache(that.getCurrentName(), msg, "me");

              var name = that.getCurrentName();

              that.setMsgList(name, currentTalkUserNickName);


              var talkCache = that.getCache(name);

              if (talkCache && talkCache.data) {

                talkCache = talkCache.data;

                var html = that.createMessageHtml(talkCache[talkCache.length - 1]);

                $("#talk-content-list-area").append(html);

                that.scrollBottom();

                return;
              }
            } else if (resp.status == -1) {

              console.error("太快了，怎么受的了");

            } else {

            }
          }
          ,error:function(error){}
        })

    }
    
    ,getRemoteData: function(url, param, type, async) {
      var res = false,
          cache = false;
      if (!type) {
        type = "GET";
      }
      if (!async) {
        async = false;
      }
      if (!param) {
        param = "";
      }

      if("object"==$.type(url)){
        url=url.url||url;
        type=url.type||type;
        param=url.param||param;
        async=url.hasOwnProperty('async')?url.async:true;
        before=url.before;
        cache=url.hasOwnProperty('cache')?url.cache:cache;
        ok=url.ok;
        error=url.error;
        always=url.always;
      }

      $.ajax({
        url: url,
        data: param,
        type: type,
        beforeSend:function(){
          "function"==typeof before && before();
          return true;
        },
        cache: cache,
        async: async
      }).always(function(resp){

        "function" == typeof always && always(resp);

      }).done(function(resp) {
        res = resp;
        "function" == typeof ok && ok(resp);
      }).fail(function(XMLHttpRequest, textStatus, errorThrown) {

        console.error("请求失败");

        var err="请求失败";

        "function" == typeof error && error(err);

      })

      return res;

    }

    ,closeAllWindow: function() {
      //粉丝
      $("#dialogue-area").hide()
      //对话
      $("#message_container").hide();
    }

    ,closeHistoryWindow: function() {
      //历史记录右侧边框
      $("#message_contents,#messageform").css("right",0);
      $("#talk-record-area").hide();
    }

    ,openTalkDialog: function() {

      //以秒为单位
      this.timeFalg = 0; 
      var name = this.getCurrentName()
          ,html = this.getCache(name)
          ,uuid
          ,myUserId = LoginUser.myUserId

      if (html) {

        if (html.firstView) {

            var length = html.data.length 

                ,notReadCount = parseInt(html.notReadCount, 10)

                ,badges = notReadCount - html.data.length

                ,param = "merUserId=" + html.data[0].BID 
                      + "&clientid=" + html.data[0].S 
                      + "&waiterid=" + myUserId 
                      + "&offset=" + html.data.length 
                      + "&limit=" + badges
                ,res

            uuid = html.data[0].U;

            for (var i = 1; i < html.data.length; i++) {

              if (html.data[i].U == uuid) {

                this.cache[name].data.shift();
                break;
              }

            }

            this.cache[name].firstView = false;

            if (notReadCount > length) {

                res = this.getRemoteData({
                            url : this.url.getHistoryDataUrl
                            ,param : param
                            ,async : false
                          });

                res = JSON.parse(res.message);

                for (var i = 0; i < res.data.items.length; i++) {

                  var item = res.data.items[i];
                  var role = 'me';

                  if (item.R == myUserId) {
                    role = 'you';
                  }

                  this.setCache(name, item, role, badges, true );
                }

            }

        }

        //先将此条记录的未读数变成0
        if (html.notReadCount > 0){
          this.cache[name].notReadCount = 0;
        }

        //显示或隐藏
        this.toggleRedPoint()

        




        $("#more").show();

        html = this.getTalkHtmlByObject(html);

        

      } else {

        html = '';
        $("#more").hide();

      }

      $("#talk-content-list-area").html(html);
      $("#message_contents_head").html(currentTalkUserNickName);
      $("#message_container").show();

      this.readMsg(currentTalkUserId);

      this.scrollBottom();

    }

    ,getCurrentName: function() {
      return LoginUser.talkType + "_" + LoginUser.currentShopId + "_" + LoginUser.currentTalkUserId;
    }

    ,setCache: function(name, message, role, badges, insert) { 
      //badge参数只有在最开始读取最近联系人消息的时候才应该加上
      
      if (!badges){
        badges = 0;
      }

      if (role) {

        if (!this.cache[name]) {
          this.cache[name] = {};
          this.cache[name].data = new Array();
        }

        if (!this.cache[name].notReadCount){
          this.cache[name].notReadCount = parseInt(badges, 10);
        }

        if (!this.cache[name].firstView){
          this.cache[name].firstView = true;
        }

        message.role = role;

        if (insert) {
          this.cache[name].data.unshift(message);
        } else {
          this.cache[name].data.push(message);
        }

      } else {

        this.cache[name] = message;

      }

    }

    ,getCache: function(name) {
      return this.cache[name];
    }

    ,getMsgNotReadCount: function(msgType) {

      var iMsgNotReadCount = 0;
      for (var name in this.cache) {

        if (name.indexOf(msgType+"_") == 0) {
          iMsgNotReadCount += this.cache[name].notReadCount;
        }

      }
      return iMsgNotReadCount;

    }

    ,toggleRedPoint:function(msgType){
        var iMsgNotReadCount = this.getMsgNotReadCount(msgType);
        if (msgType == 3) {
          if (iMsgNotReadCount <= 0) {
            $("#group-item-business .red-point").hide();
          }
        }else{
          if (iMsgNotReadCount <= 0) {
            $("#group-item-person .red-point").hide();
          }

        }
    }






































































    ,getRecentlyList: function(id) {
      var res = this.getRemoteData(this.url.getRecentlyListUrl + id);
      return res;
    }

    ,setPersonRecentMsgList: function() {
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
    }

    ,setBussinessRecentMsgList: function() {
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
    }

    ,getFansList: function(pageIndex, id) { //获得粉丝页面
      var offset = (pageIndex - 1) * this.fansLimit;
      var params = "merUserId=" + id + "&offset=" + offset + "&limit=" + this.fansLimit;
      if (currentGid) {
        params += "&gid=" + currentGid;
      }
      var resData = this.getRemoteData(this.url.getFansListUrl, params);
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
    }

    ,fillNoneFans: function(id) {
      document.getElementById("dialogue-list-area").innerHTML = "<img src='" + smile_url + "im-fensi.png' style='margin:200px auto;display:block;'>";
    }

    ,fillFansList: function(id, items) {
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
    }

    ,pagenation: function(pageIndex, id, total) {
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
    }

    ,getFansArea: function(id) { //获取粉丝区域列表
      var resData = this.getRemoteData(this.url.getFansAreaUrl + id);
      if (!resData.success) {
        console.error("请求失败！");
      }
      resData = $.parseJSON(resData.message).data;
      this.fillFansArea(id, resData);
    }

    ,fillFansArea: function(id, data) {
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

      $("#area-list").html( htmlStr);

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

    }

    ,getHistoryData: function(talkCount) {
      var param = "merUserId=" + LoginUser.currentShopId 
                + "&clientid=" + LoginUser.currentTalkUserId 
                + "&offset=" + talkCount 
                + "&limit=" + this.talkRecordLimit
      res = this.getRemoteData({
        url:this.url.getHistoryDataUrl
        ,param: param
      });
      return res;
    }

    ,getTalkRecord: function() {

      var offset = (recordpageIndex - 1) * this.talkRecordLimit;
      var res = this.getHistoryData(offset);
      if (res.message) {
        res = $.parseJSON(res.message);
        this.fillTalkRecord(res.data);
      } else {
        console.error("历史列表获取错误");
      }

    }

    ,fillTalkRecord: function(talkList) {

      var totalCount = talkList.total_count;
      var html = "";
      var day = "";

      talkList = talkList.items;

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

      $("#record-list").html(html);

      //全局变量
      pageSum = parseInt(totalCount / this.talkRecordLimit);

      if (totalCount % this.talkRecordLimit > 0) {
        pageSum++;
      }

      this.pagenation(recordpageIndex, "record-paginator");
    }




    ,createMsgFragment: function(obj) { 
      //根据缓存对象获得html内容
      var html = "";
      if (!obj || !obj.data.length){
        return html;
      }else{

        obj = obj.data;

        for (var i = 0,item,len=obj.length; i < len; i++) {
          item = obj[i]
          item.role = item.S == item.BID? "me" : "you"

          html += this.createMessageHtml(item);
        }

      }

      return html;
    }

    ,createMessageHtml: function(item) {
      //消息内容拼接成 html 片段
      var html = "";
      var sendTime = new Date();
      if (parseInt(item.CT) - (60 * 5) > this.timeFalg) {
        sendTime.setTime(parseInt(item.CT) * 1000);
        html += '<li class="time">' + formatDate(sendTime) + '</li>'
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

    }

    ,getMessgaeByType: function(message, history) {
    //解析服务端的内容

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
    }

    ,parseMessage: function(message) {
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
        //        }
      }
      return false;
    }


    ,setMsgList: function(name, nickName) {
      /*
       * name是缓存对象的名称 nickName是直接制定聊天对象的名称，
       * 由于发送完毕获取到发送人的昵称是当前账号的昵称，而真正需要的昵称是当前聊天对象的昵称，
       * 所以在发送完毕后需要的昵称参数需要格外添加
       */
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
      if (item)item.remove();

      if (message.MT == 2 || message.MT == 4) { 

        //||myUserId==message.BID
        if (((message.CID != currentTalkUserId && message.S != currentTalkUserId) || !currentTalkUserId) && talkRecord.notReadCount > 0) {
          $("#group-item-person").find(".red-point").css("display", "block");
        }
        $("#person-talk-list").prepend(html);
        document.getElementById("group-item-person").click();

      } else if (message.MT == 3) {

        if (((message.CID != currentTalkUserId && message.S != currentTalkUserId) || !currentTalkUserId) && talkRecord.notReadCount > 0) {
          //过滤掉多余的企业信息,因为会有垃圾数据的BID指向的不是当前小儿关联商家的ID
          var ids = this.getCache("businessIds"); 
          for (var i = 0; i < ids.length; i++) {
            if (ids[i] == talkRecord.data[0].BID) {
              $("#group-item-business").find(".red-point").css("display", "block");
            }
          }
        }

        $("#buyer-list-" + message.BID).prepend(html);

        document.getElementById("group-item-business").click();

        slideHandler("#col-business-" + message.BID, "down");

        $("#col-business-" + message.BID).slideDown();

        //买家后面要加数字
        var count = $("#buyer-list-" + message.BID).find(".buyer-list-a").length;
        $("#buyer-title-count-" + message.BID).html("(" + count + ")");
      }
    }

    ,transUniCode: function(str) {
      if (!str)
        return "";
      if (str.indexOf("\\u") >= 0) {
        str = eval(str);
      }
      return str;
    }

    ,setNewMsgTitle: function() {
      //      newTitle="你有新消息";
      //      newMsgTitInterval=setInterval(newMsgTit,200);
    }

    ,setOriTitle: function() {
      //      clearInterval(newMsgTitInterval);
      //      document.title=oriTitle;
    }

    ,getNameByMessage: function(message) { //根据消息获得缓存名称
      var name = "";
      message.CID ? name = message.CID : name = message.S;
      return message.MT + "_" + message.BID + "_" + name;
    }

/*    ,commitBigExpress: function(msg, imgMsg) {
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

    */

    ,getHistoryTalkRecord: function() {

      var talkCount = $("#talk-content-list-area .list-group-item").length

          ,param = "merUserId=" + LoginUser.currentShopId 
                + "&clientid=" + LoginUser.currentTalkUserId 
                + "&waiterid=" + LoginUser.myUserId 
                + "&offset=" + talkCount 
                + "&limit=" + this.talkRecordLimit

          ,res = this.getRemoteData({
                      url:this.url.getHistoryDataUrl
                      ,param:param
                      ,cache:false
                      ,async:false
                })

          ,html = ""

      res = $.parseJSON(res.message).data.items;

      if (res.length == 0) {
        return $("#more").hide();
      }

      this.timeFalg = 0;

      if(Array.prototype.reverse){
        res.reverse();
      }else{
        for (var i = res.length - 1,tempArr=[]; i >= 0; i--) {
          tempArr.push(res[i])
        }
        res=tempArr;
      }
      
      html += this.createMsgFragment({data:res});

      $("#message_contents").find("#talk-content-list-area").prepend(html);
    }

    ,scrollBottom: function() {
      //对话框滚动到底部
      var dd = document.getElementById("message_contents");
      dd.scrollTop = dd.scrollHeight - dd.offsetHeight;
    }

    ,getNoReadMsg: function(id) {
      var res = im.getRemoteData(this.url.getMsgBadge + id);
      return res;
    }


    ,readMsg: function(clientId) {

      var myUserId = LoginUser.myUserId
          ,currentShopId = LoginUser.currentShopId
          ,url = this.url.readMsgUrl

          ,param = clientId + "&waiterid=" + myUserId + "&merUserId=" + currentShopId

          ,res = this.getRemoteData({
                    url:url
                    ,param:param
                    ,async:false
                });

      return res;

    }


  };

})