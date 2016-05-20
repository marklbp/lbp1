

$(function() {

  'use strict';

  QB.SiteMenu.activeOn('#operate-list');

  jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

  var merchant_id = $.urlParam("_merchant_user_id_");

  var date  = new Date();
  var dateTime = date.getTime();

  var ajaxUrl = {
    checkUrl: "http://enterprise.qbao.com/company/waiter/preCheck.html?_merchant_user_id_="+merchant_id,
    rolesUrl: "http://enterprise.qbao.com/company/waiter/listRoles.html?_merchant_user_id_="+merchant_id,
    editUrl: "http://enterprise.qbao.com/company/waiter/modifyWaiter.html?_merchant_user_id_="+merchant_id,
    getWaiterInfoUrl: "http://enterprise.qbao.com/company/waiter/getWaiterInfo.html?_merchant_user_id_="+merchant_id,
    addUrl:"http://enterprise.qbao.com/company/waiter/bindEmp.html?_merchant_user_id_="+merchant_id,
    getShopUrl: "http://enterprise.qbao.com/company/waiter/listShops.html?_merchant_user_id_="+merchant_id,
  }

  var email_pattern = new RegExp(/^([a-z0-9_A-Z]+[-|\.]?)+[a-z0-9_A-Z]?@([a-z0-9_A-Z]+(-[a-z0-9_A-Z]+)?\.)+[a-zA-Z_]{2,}$/i),
      phone_pattern = new RegExp(/^1\d{10}$/);

  var detailEvent = {
      _id: $.urlParam("id"),
      $userCount: $(".user-count"),
      $btn: $(".operate-submit"),
      $operate: $(".operate-role"),
      $userName: $("#user-name"),
      $userNickName: $("#user-nickname"),
      $crumbs: $(".bussiness-crumbs"),
      $commonTitle: $(".common-title"),
      $mask: $(".mask"),
      $pop: $(".qb-popup"),
      _shopId: "",
      _state: 0,
      _status: 0,
      _isPass: true,
      _isCheck: true,
      init: function() {
          if( detailEvent._id == "null" ) {
            detailEvent.$crumbs.replaceWith(QB.templates['operate-crumbs']({
              managerName: "小二管理",
              name: "添加关联店小二"
            }));

            detailEvent.$commonTitle.html("添加关联店小二");

            detailEvent.addDetail();

            detailEvent.getShop();
          }else {
            detailEvent.$crumbs.replaceWith(QB.templates['operate-crumbs']({
              managerName: "小二管理",
              name: "修改关联店小二"
            }));

            detailEvent.$commonTitle.html("修改关联店小二");

            detailEvent.editDetail(detailEvent._id);
          }

          detailEvent.$btn.on("click", function() {
              detailEvent.submitFunc();
          });

          detailEvent.$operate.find("i").on("click", function() {//分配角色复选
            var _this = $(this);
            if(_this.hasClass("checked")){
              _this.removeClass("checked");
            } else {
              _this.addClass("checked");
            }
          });

          detailEvent.inputBlur();

          detailEvent.$operate.find("i").addClass("checked");
          //detailEvent.rolesList();
      },
      getShop: function() {
        $.ajax({
            url: ajaxUrl.getShopUrl,
            type: "POST",
            dataType: "json",
            success: function(data) {
                if( data.success ) {
                    $("#user-main").text(data.data[1]);
                    detailEvent._shopId = data.data[0];
                } else {
                    detailEvent.errortip("请求错误！");
                }
            },
            error: function() {
                detailEvent.errortip("请求错误！");
            }
        });
      },
      rolesList: function() {
        $.ajax({
            url: ajaxUrl.rolesUrl,
            type: "POST",
            dataType: "json",
            success: function(data) {
                if( data.success ) {
                    detailEvent.rolesListAjax(data.data);
                } else {
                    detailEvent.errortip("请求错误！");
                }
            },
            error: function() {
                detailEvent.errortip("请求错误！");
            }
        });
      },
      rolesListAjax: function( data ) {
        var length = data.length, html = '';
        for( var i = 0; i < length; i++) {
            html += '<dd attr="'+data[i].roleId+'">'+
                        '<i class=""></i>'+
                        '<span>'+data[i].roleName+'</span>'+
                    '</dd>';
        }
        html += '<dd><span class="error-infor"></span></dd>';
        detailEvent.$operate.append( html );
      },
      editDetail: function(id) {
        detailEvent.$userCount.hide();
        detailEvent.$userCount.eq(0).show();
        var dataJson = "id="+id+"";
        $.ajax({
            url: ajaxUrl.getWaiterInfoUrl,
            type: "POST",
            dataType: "json",
            data: dataJson,
            success: function(data) {
                if( data.success ) {
                    $("#user-main").html(data.data.shopName);
                    detailEvent.$userCount.eq(0).find("span").eq(0).html(data.data.userName);
                    detailEvent.$userCount.eq(0).find("span").eq(1).html(data.data.trueName);
                    detailEvent.$userCount.eq(0).find("span").eq(2).html(data.data.telephone);
                    detailEvent.$userNickName.val(data.data.nickName);
                    detailEvent.rolesListCheck(data.data.roleList);
                    detailEvent._state = data.data.state;
                } else {
                    detailEvent.errortip("请求错误！");
                }
            },
            error: function() {
                detailEvent.errortip("请求错误！");
            }
        });
      },
      rolesListCheck: function(list) {
        $(".checked").removeClass("checked");
        for( var i = 0; i < list.length; i++) {
          detailEvent.$operate.find("i").eq(list[i]-1).addClass("checked");
        }
      },
      addDetail: function() {
        detailEvent.$userCount.hide();
        detailEvent.$userCount.eq(1).show();
      },
      submitFunc: function() {
          var userName = detailEvent.$userName.val();
          var userNickName = detailEvent.$userNickName.val();
          var userArry = detailEvent.$operate.find("i"), length = userArry.length, checkLength = 0;
          if( detailEvent._id == "null" ) {

            if( !userName ) {
                detailEvent.$userCount.eq(1).find(".user-meg").html("");
                detailEvent.$userName.parent().find(".error-infor").html("关联账号不能为空！");
                return;
            } else {
               if( userName.indexOf("_") == 0) {
                  detailEvent.$userCount.eq(1).find(".user-meg").html("");
                  detailEvent.$userName.parent().find(".error-infor").html("关联账号格式不正确！");
                  return;
               } else {
                  if( userName.indexOf("%") >= 0 || userName.indexOf("％") >= 0) {
                      detailEvent.$userCount.eq(1).find(".user-meg").html("");
                      detailEvent.$userName.parent().find(".error-infor").html("关联账号格式不正确！");
                  } else {
                      if(detailEvent._status){
                      } else {
                         detailEvent.$userName.parent().find(".error-infor").html("");
                      }
                  }
               }
            } 
          }

          var str = "";
          for (var i = 0; i < userNickName.length; i++) {
            if(/[\u4E00-\u9FA5]/.test(userNickName[i])){
              str = str + "X";
            } else {
              str = str + userNickName[i];
            }
          }
          if( !userNickName ) {
              detailEvent.$userNickName.parent().find(".error-infor").html("小二昵称不能为空！");
              return;
          } else {
              if( str.length > 10) {
                  detailEvent.$userNickName.parent().find(".error-infor").html("小二昵称格式不正确");
                  return;
              } else if( !(/^[0-9a-zA-Z]+$/.test( str )) ){
                  detailEvent.$userNickName.parent().find(".error-infor").html("小二昵称格式不正确");
                  return;
              } else {
                  detailEvent.$userNickName.parent().find(".error-infor").html("");
              }
          }
          
          var checkList = [];
          for( var i = 0; i < length; i++ ){
              if($(userArry[i]).hasClass("checked")){
                  checkLength++;
                  checkList.push($(userArry[i]).parent().attr("attr"));
              }
          }

          if( checkLength == 0) {
              detailEvent.popHtml( 100, checkLength, userName, userNickName, checkList, "" );
              detailEvent._isCheck = false;
          } else {
              detailEvent._isCheck = true;
          }

          var dataJson = {};
          var url = "", meg = "";
          if( detailEvent._isCheck) {
            if( detailEvent._id == "null" ) {
              if(detailEvent._status == 3 || detailEvent._status == 4 || detailEvent._status == 2 || detailEvent._status == 5 || checkLength == 0 || detailEvent._status == 1 || detailEvent._status == 6){
                  detailEvent.popHtml( detailEvent._status, checkLength, userName, userNickName, checkList, meg )
              } else {
                  url = ajaxUrl.addUrl;
                  dataJson = "userName="+userName+"&nickName="+userNickName+"&roleIds="+checkList+"";

                  $.ajax({
                    url: url,
                    type: "POST",
                    dataType: "json",
                    data: dataJson,
                    success: function(data) {
                        if( data.success ) {
                            location.href = "http://enterprise.qbao.com/merchantUser/operate-list.html?_merchant_user_id_="+merchant_id + "&t=" + dateTime;
                        } else {
                            if(data.message.indexOf("|")>=0){
                                if( data.message.split("|")[0] == "ZH" ) {
                                    detailEvent.$userCount.eq(1).find(".user-meg").html("");
                                    detailEvent.$userCount.eq(1).find(".error-infor").html(data.message.split("|")[1]);
                                } else {
                                    detailEvent.popHtml(data.message.split("|")[0],100, "", "", [], data.message);
                                }
                            } else {
                                detailEvent.errortip("请求错误！");
                            }
                            
                        }
                    },
                    error: function() {
                        detailEvent.errortip("请求错误！");
                    }
                  });
              }
            }else {
              if( checkLength == 0){
              } else {
                if( detailEvent._state == "3" ) {
                    url = ajaxUrl.addUrl;
                    userName = detailEvent.$userCount.eq(0).find("span").eq(0).text();
                    dataJson = "userName="+userName+"&nickName="+userNickName+"&roleIds="+checkList+"&id="+detailEvent._id+"";
                    $.ajax({
                      url: url,
                      type: "POST",
                      dataType: "json",
                      data: dataJson,
                      success: function(data) {
                          if( data.success ) {
                              location.href = "http://enterprise.qbao.com/merchantUser/operate-list.html?_merchant_user_id_="+merchant_id + "&t=" + dateTime;
                          } else {
                              detailEvent.errortip(data.message);
                          }
                      },
                      error: function() {
                          detailEvent.errortip("请求错误！");
                      }
                    });
                } else {
                  url = ajaxUrl.editUrl;
                  dataJson = "nickName="+userNickName+"&roleIds="+checkList+"&id="+detailEvent._id+"";
                  $.ajax({
                    url: url,
                    type: "POST",
                    dataType: "json",
                    data: dataJson,
                    success: function(data) {
                        if( data.success ) {
                            location.href = "http://enterprise.qbao.com/merchantUser/operate-list.html?_merchant_user_id_="+merchant_id + "&t=" + dateTime;
                        } else {
                            detailEvent.errortip(data.message);
                        }
                    },
                    error: function() {
                        detailEvent.errortip("请求错误！");
                    }
                  });
                }
              } 
            }
         }     
      },
      inputBlur: function() {
          detailEvent.$userName.blur(function() {
                var _this = $(this);
                var value = _this.val();
                if( !value ) {
                    detailEvent.$userCount.eq(1).find(".user-meg").html("");
                    _this.parents(".user-count-box").find(".error-infor").html("关联账号不能为空！");
                } else {
                   if( value.indexOf("_") == 0) {
                      detailEvent.$userCount.eq(1).find(".user-meg").html("");
                      _this.parents(".user-count-box").find(".error-infor").html("关联账号格式不正确！");
                   } else {
                      if( value.indexOf("%") >= 0 || value.indexOf("％") >= 0) {
                          detailEvent.$userCount.eq(1).find(".user-meg").html("");
                          _this.parents(".user-count-box").find(".error-infor").html("关联账号格式不正确！");
                      } else {
                          _this.parents(".user-count-box").find(".error-infor").html("");
                          detailEvent.checkUserName( value );
                      }
                   }
                }
          });

          detailEvent.$userNickName.blur(function() {
                var _this = $(this);
                var value = _this.val();
                var str = "";
                for (var i = 0; i < value.length; i++) {
                  if(/[\u4E00-\u9FA5]/.test(value[i])){
                    str = str + "X";
                  } else {
                    str = str + value[i];
                  }
                }
                if( !value ) {
                    _this.parents(".user-count-box").find(".error-infor").html("小二昵称不能为空！");
                } else {
                    if( str.length > 10) {
                        _this.parents(".user-count-box").find(".error-infor").html("小二昵称格式不正确");
                    } else if( !(/^[0-9a-zA-Z]+$/).test( str ) ){
                        _this.parents(".user-count-box").find(".error-infor").html("小二昵称格式不正确");
                    } else {
                        _this.parents(".user-count-box").find(".error-infor").html("");
                    }
                }
          });
      },
      checkUserName: function( value ) {
          var dataJson = "empUserName="+value+"";
          $.ajax({
              url: ajaxUrl.checkUrl,
              type: "POST",
              dataType: "json",
              data: dataJson,
              success: function(data) {
                  if(data.success) {
                      var text = "", meg = "";
                      switch(data.data.status) {
                        case 0:
                          text = data.data.realName + "  " + data.data.telephone;
                          meg = "";
                          break;
                        case 1:
                          meg = "您输入的账号不存在！";
                          text = "";
                          break;
                        case 2:
                          meg = "该账号未实名认证、未绑定手机，关联后有风险";
                          text = "";
                          break;
                        case 3:
                          meg = "该账号未绑定手机，关联后有风险";
                          text = data.data.realName;
                          break;
                        case 4:
                          meg = "该账号未实名认证，关联后有风险";
                          text = data.data.telephone;
                          break;
                        case 5:
                          meg = "您输入的账号异常！";
                          text = "";
                          break;
                        case 6:
                          meg = "您不可以关联企业账号为您的小二账号！";
                          text = "";
                          break;
                        case 9:
                          meg = "获取数据异常！";
                          text = "";
                          break;
                        default:
                          break;
                      }
                      detailEvent._isPass = true;
                      detailEvent._status = data.data.status;
                      detailEvent.$userCount.eq(1).find(".user-meg").html(text);
                      detailEvent.$userCount.eq(1).find(".error-infor").html(meg);
                  } else {
                    detailEvent._isPass = false;
                    detailEvent.$userCount.eq(1).find(".user-meg").html("");
                    detailEvent.$userCount.eq(1).find(".error-infor").html(data.message);
                    //detailEvent.errortip(data.message);
                  }
              },
              error: function() {
                  detailEvent.errortip("请求错误！");
              }
          });
      },
      errortip: function(message) {
          var tip = "<div id='error_tip' class='error-tip'></div>";
          if (!$("#error_tip")[0]) {
              $("body").append(tip);
          }
          var h = $("#error_tip").width();
          $("#error_tip").css("margin-left", -h / 2).html(message).show();
          setTimeout(function() {
              $("#error_tip").hide().html("");
          }, 3000);
      },
      popHtml: function( type, length, username, usernickname, list, message ) {
        if( detailEvent._isPass ){
          var ary = [];
          ary.push('<div class="mask"></div>');
          ary.push('<div class="qb-popup">');
          ary.push('<div class="wrap">');

          ary.push('<div class="title">');
            ary.push('<strong>提示</strong>');
            ary.push('<span class="close" title="关闭" id="popClose"></span>');
          ary.push('</div>');

          ary.push('<div class="content">');
            ary.push('<div class="info">');
              ary.push('<div class="icon erricon"></div>');
              ary.push('<div class="icon sucicon none"></div>');
              ary.push('<p></p>');
            ary.push('</div>');

            ary.push('<div class="info">');
              ary.push('<p class="p1">该账号关联后有风险。<br/>您确定要关联该账号为您的店小二吗？</p>');
              ary.push('<div class="checkBox">');
                ary.push('<dd attr="3">');
                ary.push('<i></i><span>实名认证</span>');
                ary.push('<dd attr="4">');
                ary.push('<i></i><span>绑定手机</span>');
              ary.push('</div>');
            ary.push('</div>');

          ary.push('</div>');

          ary.push('<div class="btn-box">');
            ary.push('<a href="javascript:;" class="cr-btn" id="confirmBtn">确定</a>');
            ary.push('<a href="javascript:;" class="cr-btn-disable" id="cancelBtn">取消</a>');
          ary.push('</div>');
          ary.push('<div class="btn-box none bmargin">');
            ary.push('<a href="javascript:;" class="cr-btn" id="closeBtn">确定</a>');
          ary.push('</div>')

          ary.push('</div>');
          ary.push('</div>');

        $('body').append(ary.join(''));
        $(".mask").show();
        $(".qb-popup").show();
        if( type == 3 || type == 4 || type == 2) {
            if( type == 3 ){
               if( length == 0) {
                    detailEvent.checkShow();
               } else {
                    $(".qb-popup").find(".btn-box").hide();
                    $(".qb-popup").find(".btn-box").eq(0).show();
                    $(".qb-popup").find(".info").hide();
                    $(".qb-popup").find(".info").eq(1).show();
                    $(".qb-popup").find(".checkBox").find("i").eq(0).addClass("checked");
               } 
            } else if( type == 4) {
               if( length == 0) {
                    detailEvent.checkShow();
               } else {
                    $(".qb-popup").find(".btn-box").hide();
                    $(".qb-popup").find(".btn-box").eq(0).show();
                    $(".qb-popup").find(".info").hide();
                    $(".qb-popup").find(".info").eq(1).show();
                    $(".qb-popup").find(".checkBox").find("i").eq(1).addClass("checked");
               }
            } else {
               if( length == 0) {
                    detailEvent.checkShow();
               } else {
                    $(".qb-popup").find(".btn-box").hide();
                    $(".qb-popup").find(".btn-box").eq(0).show();
                    $(".qb-popup").find(".info").hide();
                    $(".qb-popup").find(".info").eq(1).show();
               }
            }
        } else if( type == 5) {
            if( length == 0) {
                    detailEvent.checkShow();
            } else {
                    $(".qb-popup").find(".btn-box").hide();
                    $(".qb-popup").find(".btn-box").eq(1).show();
                    $(".qb-popup").find(".info").hide();
                    $(".qb-popup").find(".info").eq(0).show();
                    $(".qb-popup").find(".info").eq(0).find(".icon").hide();
                    $(".qb-popup").find(".info").eq(0).find(".erricon").show();
                    $(".qb-popup").find(".info").eq(0).find("p").html("您输入的账号状态异常！");
            }
        } else if (type == 1 ) {
          if( length == 0) {
                    detailEvent.checkShow();
            } else {
                    $(".qb-popup").find(".btn-box").hide();
                    $(".qb-popup").find(".btn-box").eq(1).show();
                    $(".qb-popup").find(".info").hide();
                    $(".qb-popup").find(".info").eq(0).show();
                    $(".qb-popup").find(".info").eq(0).find(".icon").hide();
                    $(".qb-popup").find(".info").eq(0).find(".erricon").show();
                    $(".qb-popup").find(".info").eq(0).find("p").html("您输入的账号不存在！");
            }
        } else if (type == 6 ) {
          if( length == 0) {
                    detailEvent.checkShow();
            } else {
                    $(".qb-popup").find(".btn-box").hide();
                    $(".qb-popup").find(".btn-box").eq(1).show();
                    $(".qb-popup").find(".info").hide();
                    $(".qb-popup").find(".info").eq(0).show();
                    $(".qb-popup").find(".info").eq(0).find(".icon").hide();
                    $(".qb-popup").find(".info").eq(0).find(".erricon").show();
                    $(".qb-popup").find(".info").eq(0).find("p").html("您不可以关联企业账号为您的小二账号！");
            }
        } else if ( type == "OK" ) {
            $(".qb-popup").find(".btn-box").hide();
            $(".qb-popup").find(".btn-box").eq(1).show();
            $(".qb-popup").find(".info").hide();
            $(".qb-popup").find(".info").eq(0).show();
            $(".qb-popup").find(".info").eq(0).find(".icon").hide();
            $(".qb-popup").find(".info").eq(0).find(".erricon").show();
            $(".qb-popup").find(".info").eq(0).find("p").html(message.split("|")[1]);
        } else if ( type == "NO" ) {
            $(".qb-popup").find(".btn-box").hide();
            $(".qb-popup").find(".btn-box").eq(1).show();
            $(".qb-popup").find(".info").hide();
            $(".qb-popup").find(".info").eq(0).show();
            $(".qb-popup").find(".info").eq(0).find(".icon").hide();
            $(".qb-popup").find(".info").eq(0).find(".erricon").show();
            $(".qb-popup").find(".info").eq(0).find("p").html(message.split("|")[1]);
        } else if ( type == 100) {
           detailEvent.checkShow();
        } else {}

        $("#confirmBtn").on("click", function() {
                switch( type ) {
                  case 3:
                  case 4:
                  case 2:
                    detailEvent.confirmAdd( username, usernickname, list);
                    break;
                  case 5:
                  case 1:
                  case 6:
                  case "OK":
                  case "NO":
                    detailEvent.popHide();
                    break;
                  default:
                    break;
                }
        });

        $("#cancelBtn,#popClose,#closeBtn").on("click", function() {
            detailEvent.popHide();
        });
       } else {
       }
      },
      popHide: function() {
          $(".mask").remove();
          $(".qb-popup").remove();
      },
      checkShow: function() {
          $(".qb-popup").find(".btn-box").hide();
          $(".qb-popup").find(".btn-box").eq(1).show();
          $(".qb-popup").find(".info").hide();
          $(".qb-popup").find(".info").eq(0).show();
          $(".qb-popup").find(".info").eq(0).find(".icon").hide();
          $(".qb-popup").find(".info").eq(0).find(".erricon").show();
          $(".qb-popup").find(".info").eq(0).find("p").html("请为您的店小二分配权限！");
      },
      confirmAdd: function( userName, userNickName, checkList ) {
          var url = ajaxUrl.addUrl;
          var dataJson = "userName="+userName+"&nickName="+userNickName+"&roleIds="+checkList+"";
          $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            data: dataJson,
            success: function(data) {
                if( data.success ) {
                    detailEvent.popHide();
                    location.href = "http://enterprise.qbao.com/merchantUser/operate-list.html?_merchant_user_id_="+merchant_id + "&t=" + dateTime;
                } else {
                    detailEvent.popHtml(data.message.split("|")[0],100, "", "", [], data.message);
                }
            },
            error: function() {
                detailEvent.errortip("请求错误！");
            }
          });
      }
  };
  
  detailEvent.init();

});