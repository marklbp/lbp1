
(function() {
    'use strict';

    QB.SiteMenu.activeOn('#operate-list');
    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

    var merchant_id = $.urlParam("_merchant_user_id_");

    var ajaxUrl = {
      listUrl: "http://enterprise.qbao.com/company/waiter/listWaiter.html?_merchant_user_id_="+merchant_id,
      frozenUrl: "http://enterprise.qbao.com/company/waiter/freezeWaiter.html?_merchant_user_id_="+merchant_id,
      deleteUrl: "http://enterprise.qbao.com/company/waiter/deleteWaiter.html?_merchant_user_id_="+merchant_id
    };

    var page = {};  
    page.len = 10;

    var operateEvent = {
      $userfrozen: $(".user-frozen"),
      $crumbs: $(".bussiness-crumbs"),
      $mask: $(".mask"),
      $pop: $(".qb-popup"),
      operateInit: function() {
        //$(".operate-table").children().remove();
        operateEvent.operateListAjax(page.len,1);

        operateEvent.$crumbs.replaceWith(QB.templates['operate-crumbs']({
          name: "小二管理"
        }));
        var date  = new Date();
        var dateTime = date.getTime();
        $(".operate-top .add-operate")[0].href = $(".operate-top .add-operate")[0].href.split("=")[0] + "=" + merchant_id + "&t=" + dateTime;
      },
      userfrozenFunc: function( obj, type, id ) {
          var dataJson = "flag="+type+"&id="+id+"";
          $.ajax({
              url: ajaxUrl.frozenUrl,
              type: "POST",
              dataType: "json",
              data: dataJson,
              success: function(data) {
                  if(data.success) {
                      operateEvent.operateListAjax(page.len,1);
                  } else {
                      operateEvent.errortip("请求错误！");
                  }
              },
              error: function() {
                  operateEvent.errortip("请求错误！");
              }
          });
      },
      operateListAjax: function(num,pageNum){
        var dataJson = {
          "pageSize": num,
          "num": pageNum
        };

        $.ajax({
              url: ajaxUrl.listUrl,
              type: "POST",
              dataType: "json",
              data: dataJson,
              success: function(data) {
                    if(data.success) {
                        $("#page").attr("total",data.data.waiterSize);
                        operateEvent.operateListAjaxBack(data.data,pageNum);
                    } else {
                        operateEvent.errortip("请求错误！");
                    }
              },
              error: function() {
                  operateEvent.errortip("请求错误！");
              }
          });
      },
      operateListAjaxBack: function(data,num) {
          $(".operate-table").children().remove();
            var html = '', dataList = data.waiterList, length = dataList.length;//roleIds是数组
            if( length == 0 && num === 1) {
                html += '<tr><td colspan="7">没有信息！点击添加小二！</td></tr>';
            } else {
                for( var i = 0; i < length; i++){
                    var isState = "", isColor = "",isFrozen = "", disabledE = "", disabledF = "", disabledD = "";
                    if( dataList[i].state == 0){
                        isState = "正常";
                        isColor = "";
                        isFrozen = "冻结";
                        disabledE = disabledF = disabledD = "";
                    } else if ( dataList[i].state == 1) {
                        isState = "已冻结";
                        isColor = "color8";
                        isFrozen = "解冻";
                        disabledE = "disabled color8";
                        disabledF = disabledD = "";
                    } else if ( dataList[i].state == 2 ) {
                        isState = "待小二接受";
                        disabledE = disabledF = disabledD = "disabled color8";
                        isColor = "";
                        isFrozen = "冻结";
                    } else {
                        isState = "小二已拒绝";
                        disabledF = "disabled color8";
                        disabledE = disabledD = "";
                        isFrozen = "冻结";
                    }
                    html += '<tr attr='+ dataList[i].merShopEmpId +'>'+
                                '<td class="w140"><span>'+ operateEvent.checkNull( dataList[i].userName ) +'</span></td>'+
                                '<td class="w60">'+ operateEvent.checkNull( dataList[i].nickName ) +'</td>'+
                                '<td class="w70">'+ operateEvent.checkNull( dataList[i].empName ) +'</td>'+
                                '<td class="w100">'+ operateEvent.checkNull( dataList[i].telephone ) +'</td>'+
                                '<td class="w146 le">'+ operateEvent.roleIdsFunc(dataList[i].roles) +'</td>'+
                                '<td class="w80 is-state '+isColor+'">'+ isState +'</td>'+
                                '<td class="w146">'+
                                    '<a class="'+disabledE+' user-edit">修改</a>'+
                                    '<a class="user-delete '+disabledD+'">删除</a>'+
                                    '<a class="user-frozen '+disabledF+'" type="'+dataList[i].state+'">'+isFrozen+'</a>'+
                                '</td>'+
                            '</tr>';
                }
            }
            $(".operate-table").append( html );
          if( num === 1 ){
              page.init(1,page.len);
          }

          $(".user-edit").on("click", function() {
              var _this = $(this);
              if(_this.hasClass("disabled")){
                  return;
              }
              var userid = parseInt(_this.parents("tr").attr("attr"));
              location.href="http://enterprise.qbao.com/merchantUser/operate-detail.html?id="+userid+"&_merchant_user_id_="+$.urlParam("_merchant_user_id_");
          });

          $(".user-frozen").on("click", function() {
              var _this = $(this);
              if(_this.hasClass("disabled")){
                  return;
              }
              var type = parseInt(_this.attr("type"));
              var userid = parseInt(_this.parents("tr").attr("attr"));
              if(type == 0) { type = 1;} else { type = 0;}
              operateEvent.popHtml( _this, type, userid );
          });

          $(".user-delete").on("click", function() {
              var _this = $(this);
              if(_this.hasClass("disabled")){
                  return;
              }
              var userid = parseInt(_this.parents("tr").attr("attr"));
              operateEvent.popHtml( _this, 2, userid );
          });
      },
      checkNull: function( value ) {
         if( value ) {
            return value;
         } else {
            return "-";
         }
      },
      popHtml: function( obj, dataFont, id ) {
          var font;
          var ary = [];

          switch (dataFont) {
              case 1:
                  font = '确定冻结小二账号？';
                  break;
              case 0:
                  font = '确定解冻小二账号？';
                  break;
              case 2:
                  font = '确定删除小二账号？';
                  break
              default:
                  break;
          }

          ary.push('<div class="mask"></div>');
          ary.push('<div class="qb-popup">');
          ary.push('<div class="wrap">');
          ary.push('<div class="title">');
          ary.push('<strong>提示</strong>');
          ary.push('<span class="close" title="关闭" id="popClose"></span>');
          ary.push('</div>');
          ary.push('<div class="content">');
          ary.push('<div class="info">')
          ary.push('<p>' + font + '</p>');
          ary.push('</div></div>');
          ary.push('<div class="btn-box">');
          ary.push('<a href="javascript:;" class="cr-btn" id="confirmBtn">确定</a>');
          ary.push('<a href="javascript:;" class="cr-btn-disable" id="cancelBtn">取消</a>');
          ary.push('</div>')
          ary.push('</div>')
          ary.push('</div>');

          $('body').append(ary.join(''));

          $(".mask").show();
          $(".qb-popup").show().find(".info").find("p").html(font);

          $("#confirmBtn").on("click", function() {
              operateEvent.popHide();
              if( dataFont == 2 ) {
                  operateEvent.deleteUser(obj, id);
              } else {
                  operateEvent.userfrozenFunc( obj, dataFont, id );
              }
              
          });

          $("#cancelBtn,#popClose").on("click", function() {
              operateEvent.popHide();
          });
      },

      popHide: function() {
          $(".mask").remove();
          $(".qb-popup").remove();
      },
      roleIdsFunc: function(name) {
          var length = name.length;
          var html = "";
          for( var i = 0; i < length; i++){
              html += name[i]+"/";
          }
          return html.substring(0,html.length-1);
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
      deleteUser: function(obj, id) {
          var dataJson = "id="+id+"";
          $.ajax({
              url: ajaxUrl.deleteUrl,
              type: "POST",
              dataType: "json",
              data: dataJson,
              success: function(data) {
                    if(data.success) {
                        operateEvent.operateListAjax(page.len,0);
                    } else {
                        operateEvent.errortip("请求错误！");
                    }
              },
              error: function() {
                  operateEvent.errortip("请求错误！");
              }
          });
      }
    };

    page.current = function() {
        return $("#page").attr("currentpage");
    }
    page.next = function() { //next
        var currentPage = parseInt(page.current()),
            totalPage = parseInt(page.totalPage());
        if (totalPage > currentPage) {
            currentPage = currentPage + 1;
            operateEvent.operateListAjax(page.len,currentPage);
            page.init(currentPage);
            $("#page").attr("currentpage", currentPage);
        } else {
            return false;
        }
    }

    page.prev = function() { //prev
        var currentPage = parseInt(page.current());
        if (currentPage > 1) {
            currentPage = currentPage - 1;
            operateEvent.operateListAjax(page.len,currentPage);
            page.init(currentPage);
            $("#page").attr("currentpage", currentPage);
        } else {
            return false;
        }
    }

    page.random = function(pageID) { //random page
        operateEvent.operateListAjax(page.len,pageID);
    }

    page.totalPage = function() {
        var total = Number($("#page").attr("total")),
            num = 0,
            p = parseInt(total / page.len);
        return total % page.len == 0 ? p : p + 1;
    }
    page.centerPages = function(pageID) {
        var centerPages = [];
        centerPages.push("<em>" + (pageID - 1) + "</em>");
        centerPages.push("<span>" + pageID + "</span>");
        centerPages.push("<em>" + (pageID + 1) + "</em>");
        return centerPages.join("");
    }
    page.outPages = function(pageID, setLen) {
        var outPages = [];
        if (setLen == undefined) {
            setLen = 4;
        }
        for (var i = 1; i <= setLen; i++) {
            if (pageID == i) {
                outPages.push("<span>" + i + "</span>");
            } else {
                outPages.push("<em>" + i + "</em>");
            }
        }
        return outPages.join("");
    }
    page.rightPages = function(pageID, total) {
        var rightPages = [];
        for (var i = total - 3; i <= total; i++) {
            if (pageID == i) {
                rightPages.push("<span>" + i + "</span>");
            } else {
                rightPages.push("<em>" + i + "</em>");
            }
        }
        return rightPages.join("");
    }

    page.init = function(pageID) {
        var perpage = [],total = Number($("#page").attr("total")),
            totalPage = page.totalPage();
        perpage.push("<div>当前显示1到10条记录，总共<span>"+total+"</span>条</div><b class='b1'>prev</b>");
        if (totalPage < 6) {
            perpage.push(page.outPages(pageID, totalPage));
        } else {
            if (pageID <= 3) {
                perpage.push(page.outPages(pageID));
                perpage.push("<i>...</i>");
                perpage.push("<em>" + totalPage + "</em>");
            } else if (pageID >= totalPage - 2) {
                perpage.push("<em>1</em>");
                perpage.push("<i>...</i>");
                perpage.push(page.rightPages(pageID, totalPage));
            } else {
                perpage.push("<em>1</em>");
                perpage.push("<i>...</i>");
                perpage.push(page.centerPages(pageID));
                perpage.push("<i>...</i>");
                perpage.push("<em>" + totalPage + "</em>");
            }
        }
        perpage.push("<b>next</b>");
        if (totalPage <= 1) {
            $("#page").hide()
        } else {
            $("#page").show().html(perpage.join(""));
        }
    }

    $("#page").delegate("em", "click", function() {
        var pageID = parseInt($(this).html());
        page.random(pageID);
        page.init(pageID);
        $("#page").attr("currentpage", pageID);
    });
    $("#page").delegate("b:first", "click", function() {
        var pageID = parseInt($("#page").attr("currentpage"));
        page.prev(pageID);
    });
    $("#page").delegate("b:last", "click", function() {
        var pageID = parseInt($("#page").attr("currentpage"));
        page.next(pageID);
    });

    operateEvent.operateInit();

})();
