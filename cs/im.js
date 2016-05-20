   



  slideHandler($(".business-name").next(".col1"), "down");


  $("#business-list").on("click",".business-name",  function(eve) {
    //展开页面
    slideHandler($(this).next(".col1"), "toggle");

  }).on("click",".fans-title",  function() {
    //当前商家id//全局
    currentShopId = getIdByElementId(this.id); 
    currentGid = null;
    IMWin.getFansList(1, currentShopId)
    IMWin.getFansArea(currentShopId);
    IMWin.closeAllWindow();
    currentTalkUserId = "";
    $("#dialogue-area").show();
  });

  if (!IM_VAR.isGetLastMsg) {

    if (LoginUser.imRole == 1) { 

      //0无角色 1个人 2商家 3小二
      IMWin.setPersonRecentMsgList();

    } else if (LoginUser.imRole == 2) {

      IMWin.setBussinessRecentMsgList();

    } else if (LoginUser.imRole == 3) {

      IMWin.setBussinessRecentMsgList();

      IMWin.setPersonRecentMsgList();
    }

    IM_VAR.isGetLastMsg = true;

  }

  // 商家个人切换
  $("#group-panel").find(".group-item").on("click", function(eve) {

    var id = eve.currentTarget.id;
    $("#group-panel").find(".group-item").removeClass("select-banner");
    if (LoginUser.imRole == 3)
      $("#" + id).addClass("select-banner");
    $(".group-area").css("display", "none");
    var target = $("#" + id).attr("target");
    document.getElementById(target).style.display = "block";

  });



  // 粉丝按钮点击事件
  $('#dialogue-list-area').delegate(".btn-contact", "click", function(e) {

    IMWin.closeHistoryWindow();
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






  //粉丝分页按钮绑定事件
  var pageIndex = 1;  
 
  // 上一页
  var btnSwitch = true;

  //粉丝分页
  $("#ul-paginator").delegate("#paginator-prev-warp", "click", function() {
    if (pageIndex <= 1)
      return;
    pageIndex--;
    IMWin.getFansList(pageIndex, currentShopId);
  });
  $("#ul-paginator").delegate("#paginator-next-warp", "click", function() {
    if (pageIndex >= pageSum)
      return;
    pageIndex++;
    IMWin.getFansList(pageIndex, currentShopId);
  });
  $("#ul-paginator").delegate(".pagebtn", "click", function(eve) {
    pageIndex = parseInt(eve.currentTarget.innerHTML);
    IMWin.getFansList(pageIndex, currentShopId);
  });



  //关闭当前聊天窗口
  $("close-talk-dlg-btn").click(function() {
    $('.buyer-list-a').removeClass('active');
    document.getElementById("message_container").style.display = "none";
    currentTalkUserId = "";
  })

  //聊天更多按钮
  $("#more").click(function() {

    IMWin.getHistoryTalkRecord();

  });




  //关闭历史记录窗口
  $("close-record-btn").click(function() {

    document.getElementById("message_contents").style.right = "0px";
    document.getElementById("messageform").style.right = "0px";
    document.getElementById("talk-record-area").style.display = "none";

  })

  //聊天栏右边的历史纪录按钮
  $("#talk-record-btn").click(function() {

    var isOpen = document.getElementById("talk-record-area").style.display;
    if (isOpen == "" || isOpen == "none") {
      var recordpageIndex = 1;
      IMWin.getTalkRecord();
      document.getElementById("message_contents").style.right = "251px";
      document.getElementById("messageform").style.right = "251px";
      document.getElementById("talk-record-area").style.display = "block";
    } else {
      IMWin.closeHistoryWindow();
    }

  })

   //历史记录分页按钮绑定事件
  var recordpageIndex = 1;
    //聊天记录分页
  $("#record-paginator").delegate("#paginator-prev-warp", "click", function() {
    if (recordpageIndex <= 1)
      return;
    recordpageIndex--;
    IMWin.getTalkRecord(recordpageIndex);
    //    IMWin.openBtnSwitch();
  });
  $("#record-paginator").delegate("#paginator-next-warp", "click", function() {
    if (recordpageIndex >= pageSum)
      return;
    recordpageIndex++;
    IMWin.getTalkRecord(recordpageIndex);
  });
  $("#record-paginator").delegate(".pagebtn", "click", function(eve) {
    recordpageIndex = parseInt(eve.currentTarget.innerHTML);
    IMWin.getTalkRecord(recordpageIndex);
  });


  setInterval(keepAlive, 1000 * 60 * 60);

  
  $("#message_contents").delegate(".order-item", "click", function(eve) {

    var id = eve.currentTarget.id;
    var buyerid = $(eve.currentTarget).attr("buyerid");
    if (!id)return;
    window.open("http://oc.qbao.com/order/seller/detail/" + id + ".html?buyerId=" + buyerid + "&_merchant_user_id_=" + currentShopId);
  
  });
