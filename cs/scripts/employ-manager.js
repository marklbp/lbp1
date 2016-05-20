$(function() {

  'use strict';

  var ajaxUrl = {
    getUrl: "http://enterprise.qbao.com:7070/employManage/listMyEmployers.html",
    acceptUrl: "http://enterprise.qbao.com:7070/employManage/acceptEmployInvite.html",
    rejectUrl: "http://enterprise.qbao.com:7070/employManage/rejectEmployInvite.html"
  };

  var page = {};  
    page.len = 10;

  var indexEvent = {
      $crumbs: $(".crumbs"),
      $btn: $("#searchBtn"),
      _currentType: -1,
      init: function() {
          indexEvent.$crumbs.replaceWith(QB.templates['operate-crumbs']({
            name: "商家管理"
          }));

          indexEvent.selectItem();

          indexEvent.getList(1,indexEvent._currentType);

          indexEvent.$btn.on("click",function() {
              indexEvent.getList(1,indexEvent._currentType);
          });
      },
      selectItem: function() {
        // var actions = [
        //   {
        //     actionId: -1,
        //     name: '全部'
        //   },{
        //     actionId: 0,
        //     name: '待接受'
        //   },{
        //     actionId: 1,
        //     name: '雇佣中'
        //   },{
        //     actionId: 2,
        //     name: '已拒绝'
        //   },{
        //     actionId: 3,
        //     name: '冻结中'
        //   },{
        //     actionId: 4,
        //     name: '已结束'
        //   }
        // ];

        

        // new QB.widget.DataSelector({
        //   $el: $('.data-selector').show(),
        //   options: $.map(actions, function(action) {
        //     return action.name;
        //   }),
        //   callback: function(index) {
        //     indexEvent._currentType = actions[index].actionId;
        //   }
        // });
      },
      getList: function(num, state) {
          var dataJson = "pageNum="+num+"&state="+state+"";

          $.ajax({
            url: ajaxUrl.getUrl,
            type: "POST",
            dataType: "json",
            data: dataJson,
            success: function(data) {
                if( data.success ) {
                    $("#page").attr("total",data.data.itotalRecords);
                    indexEvent.getListAjaxBack(data.data,num);
                } else {
                    indexEvent.errortip("请求错误！");
                }
            },
            error: function() {
                indexEvent.errortip("请求错误！");
            }
        });
      },
      getListAjaxBack: function(data, num) {
          $(".operate-table").children().remove();
          var html = '', dataList = data.aaData, length = dataList.length, className = "", color = "";
          if( length == 0 && num === 1) {
              html += '<tr><td colspan="8">暂无雇佣信息！</td></tr>';
          } else {
              for( var i = 0; i < length; i++){
                  if(dataList[i].state == 2) {
                      className = "";
                      color = "";
                  } else {
                      className = "none";
                      color = "";
                      if(dataList[i].state == 1) {
                          color = "color8";
                      }
                  }
                  html += '<tr attr='+ dataList[i].id +'>'+
                              '<td class="w140">'+ dataList[i].id +'</td>'+
                              '<td class="w60"><span>'+ dataList[i].shopName +'</span></td>'+
                              '<td class="w70">'+ indexEvent.checkPhoneFunc( dataList[i].shopPhone ) +'</td>'+
                              '<td class="w100">'+ indexEvent.timeFunc( dataList[i].inviteTimeStr ) +'</td>'+
                              '<td class="w100">'+ indexEvent.timeFunc(  dataList[i].startTimeStr ) +'</td>'+
                              '<td class="w100">'+ indexEvent.timeFunc( dataList[i].endTimeStr ) +'</td>'+
                              '<td class="w80 '+color+'">'+ dataList[i].stateStr +'</td>'+
                              '<td class="w146">'+
                                  '<a class="user-edit '+className+'">接受</a>'+
                                  '<a class="user-delete '+className+'">拒绝</a>'+
                              '</td>'+
                          '</tr>';
              }
          }
          $(".operate-table").append( html );

          $(".user-edit").on("click", function() {
              var _this  = $(this);
              var id = parseInt(_this.parents("tr").attr("attr"));
              indexEvent.accpetFunc( id );
          });

          $(".user-delete").on("click", function() {
              var _this  = $(this);
              var id = parseInt(_this.parents("tr").attr("attr"));
              indexEvent.rejectFunc( id );
          });
      },
      checkPhoneFunc: function( phone ) {
        if( phone ) {
            return phone;
          } else {
            return "";
          }
      },
      timeFunc: function( time ) {
          if( time ) {
            var t = new Date( time );
            var fmt = [t.getFullYear(), t.getMonth() + 1, t.getDate()];
            return fmt.join("-");
          } else {
            return "";
          }
      },
      accpetFunc: function(id) {
        var dataJson = "id="+id+"";
          $.ajax({
            url: ajaxUrl.acceptUrl,
            type: "POST",
            dataType: "json",
            data: dataJson,
            success: function(data) {
                if( data.success ) {
                    indexEvent.getList(1,indexEvent._currentType);
                } else {
                    indexEvent.errortip(data.message);
                }
            },
            error: function() {
                indexEvent.errortip("请求错误！");
            }
        });
      },
      rejectFunc: function(id) {
        var dataJson = "id="+id+"";
          $.ajax({
            url: ajaxUrl.rejectUrl,
            type: "POST",
            dataType: "json",
            data: dataJson,
            success: function(data) {
                if( data.success ) {
                    indexEvent.getList(1,indexEvent._currentType);
                } else {
                    indexEvent.errortip("请求错误！");
                }
            },
            error: function() {
                indexEvent.errortip("请求错误！");
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
          operateEvent.operateListAjax(currentPage-1, indexEvent._currentType);
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
          operateEvent.operateListAjax(currentPage-1, indexEvent._currentType);
          page.init(currentPage);
          $("#page").attr("currentpage", currentPage);
      } else {
          return false;
      }
  }

  page.random = function(pageID) { //random page
      operateEvent.operateListAjax(pageID-1, indexEvent._currentType);
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

  indexEvent.init();

});