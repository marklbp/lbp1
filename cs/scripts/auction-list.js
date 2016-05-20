(function() {
  'use strict';

  $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
    name: "雷拍管理"
  }));

  jQuery.urlParam = function(name) {
    var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1];
    return decodeURIComponent(result);
  }

  var merchant_id = $.urlParam("_merchant_user_id_");

  //QB.BusinessHeader.active('#business-nav-goods');
  String.prototype.template = function() {
    var args = arguments,
      k = -1;
    return this.replace(/\{(\w+)\}/g, function() {
      k++;
      return args[k];
    });
  };
  String.prototype.trim = function() {
    return this.replace(/(^\s+)|(\s+$)/g, "");
  };
  //tip
  function tip(message) {
    var tip = "<div id='error_tip' class='error-tip'></div>";
    if (!$("#error_tip")[0]) {
      $("body").append(tip);
    }
    var h = $("#error_tip").width();
    $("#error_tip").css("margin-left", -h / 2).html(message).show();
    setTimeout(function() {
      $("#error_tip").hide().html("");
    }, 3000);
  };

  function check(name) {
    return name ? name : "";
  };

  var dialog = {};

  dialog.setPosition = function(obj) {
    if (!obj) return false;
    var height = obj.height();
    obj.css("margin-top", -height / 2);
  };
  dialog.open = function(obj) {
    dialog.setPosition(obj);
    obj.show();
    $(".shadow:eq(0)").show();
  };
  dialog.close = function(obj) {
    obj.hide();
    $(".shadow:eq(0)").hide();
  };


  $("#table_list").delegate('.apply-delete', 'click', function(e) {
    e.preventDefault();
    dialog.open($("#dialog_delete"));
    $("#deleteID").val($(this).parents("tr").attr("id"));
  });
  $("#dialog_delete>.dialog-close,#dialog_delete .cancle-btn").bind('click', function() {
    dialog.close($("#dialog_delete"));
  });

  $("#table_list").delegate('.apply-cancel', 'click', function(e) {
    e.preventDefault();
    dialog.open($("#dialog_cancel"));
    $("#cancelID").val($(this).parents("tr").attr("id"));
  });
  $("#dialog_cancel>.dialog-close,#dialog_cancel .cancle-btn").bind('click', function() {
    dialog.close($("#dialog_cancel"));
  });

  //删除
  function deleteProduct(id) {
    $.ajax({
      type: "POST",
      url: "http://paipai.qbao.com/manageAucApply/delete.html?_merchant_user_id_=" + merchant_id,
      dataType: "json",
      data: {
        id: id
      },
      success: function(data) {
        if (data.success) {
          //todo
        } else {
          tip("删除失败");
        }
      },
      error: function(message) {
        tip(message);
      }
    });
  }

  //撤销申请
  function cancelProduct(id) {
    $.ajax({
      type: "POST",
      //url: "http://paipai.qbao.com/manageAucApply/cancel.html?_merchant_user_id_="+ merchant_id,

      url: "http://192.168.29.120:8080/manageAucApply/cancel.html?_merchant_user_id_=3893278", // + merchant_id,
      dataType: "json",
      data: {
        id: id
      },
      success: function(data) {
        if (data.success) {
          //todo
        } else {
          tip("撤销失败");
        }
      },
      error: function(message) {
        tip(message);
      }
    });
  }

  $("#dialog_delete .confirm-btn").bind('click', function() {
    $("#" + $("#deleteID").val()).remove();
    $("#table_list tr").removeClass("even");
    $("#table_list tr:odd").addClass("even");
    deleteProduct($("#deleteID").val());
    dialog.close($("#dialog_delete"));
  });

  $("#dialog_cancel .confirm-btn").bind('click', function() {
    $("#" + $("#cancelID").val()).remove();
    $("#table_list tr").removeClass("even");
    $("#table_list tr:odd").addClass("even");
    cancelProduct($("#cancelID").val());
    dialog.close($("#dialog_cancel"));
  });

  function timeFormat(time) {
    var d = new Date(time),
      day = [d.getFullYear(), d.getMonth() + 1, d.getDate()],
      times = [d.getHours(), d.getMinutes(), d.getSeconds()]
    return day.join("-") + " " + times.join(":");
  }

  function getKey(pageID) {
    var reg2 = /^[0-9]+$/,
      value = $("#goodsID").val().trim();
    if (!reg2.test(value) && value.length != 0) {
      tip("请输入正确的商品ID！");
      return false;
    }
    page.getList({
      pageID: pageID,
      checkStatus: $("#getStatus").attr("rel"),
      goodsId: $("#goodsID").val(),
      goodsName: $("#goodsName").val(),
      applyId: $("#applyId").val(),
      pageSize: page.len
    });
  }

  function setM(money) {
    var reg = /(\d{1,3})(?=(\d{3})+(?:$|\.))/g;
    return money.toString().replace(reg, "$1,");
  }

  $("#getStatus").bind('click', function() {
    $("#checkStatus").css({
      "top": $(this).offset().top + 31,
      "left": $(this).offset().left
    }).show();
  });
  $("#checkStatus").delegate('dd', 'click', function() {
    $("#getStatus").html($(this).html()).attr("rel", $(this).attr("rel"));
    $("#checkStatus").hide();
  });
  $("#checkStatus").hover(function() {}, function() {
    $(this).hide();
  });

  var page = {}
  page.url = {
    getproduct: "http://paipai.qbao.com/manageAucApply/listApplyRecordDetails.html?_merchant_user_id_="+merchant_id
    // getproduct: "http://192.168.29.120:8080/manageAucApply/listApplyRecordDetails.html?_merchant_user_id_=3893278"
  };
  page.len = 10;
  page.pageNum = 0;
  page.current = function() {
    return $("#page").attr("currentpage");
  }
  page.next = function() { //next
    var currentPage = parseInt(page.current()),
      totalPage = parseInt(page.totalPage());
    if (totalPage > currentPage) {
      currentPage = currentPage + 1;
      getKey(currentPage);
    } else {
      return false;
    }
  }

  page.prev = function() { //prev
    var currentPage = parseInt(page.current());
    if (currentPage > 1) {
      currentPage = currentPage - 1;
      getKey(currentPage);
    } else {
      return false;
    }
  }

  page.random = function(pageID) { //random page
    getKey(pageID);
  }

  page.totalPage = function() {
    return page.pageNum;
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
    var perpage = [],
      totalPage = page.totalPage();

    perpage.push("<b>prev</b>");
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

  page.getList = function(option) { //@pageID
    var tem_position = $('#table_list table');
    if (option.pageID == undefined || option.pageID == "") {
      tem_position.empty().append('<tr><td colspan="7" style="padding:50px 0;">没有关联商品</td></tr>');
      return false;
    }

    $.ajax({
      type: "POST",
      url: page.url.getproduct,
      dataType: "json",
      data: {
        checkStatus: option.checkStatus,
        goodsId: option.goodsId,
        pageSize: option.pageSize,
        goodsName: option.goodsName,
        applyId: option.applyId,
        pageNum: option.pageID
      },
      success: function(data) {
        if (data.success) {
          var list = data.data.aaData,
            total = data.data.itotalRecords,
            pTemp = $("#tableList").val(),
            pList = [],
            deleteBtn = "<a href='#' class='apply-delete'>删除</a>",
            seeListBtn = '<a target="_blank" href="/manageAucInfo/aucInfoList.html?applyId={id}&_merchant_user_id_=' + merchant_id + '">竞拍结果</a>',
            checkBtn = '<a target="_blank" href="/manageAucApply/detail.html?applyRecordId={id}&_merchant_user_id_=' + merchant_id + '">查看</a>',
            cancelApplyBtn = '<a href="javascript:;" class="apply-cancel">撤销申请</a>';
          if (total) {

            for (var i = 0; i < list.length; i++) {
              var pv = list[i].goodsInfoView,
                ap = list[i].applyRecord,
                pt = list[i].periodTime,
                dele = "",
                even = "",
                data = "",
                dropDownDesc = "",
                checkLink = "",
                seeList = "";
              if (pv) {
                checkLink = checkBtn.template(ap.id);
                var lab = "",
                  len = pv.labelName.length;
                for (var j = 0; j < len; j++) {
                  lab += ("<span>" + pv.labelName[j] + "</span>");
                  if (j < len - 1) {
                    lab += "<em>|</em>";
                  }
                }
                even = (i + 1) % 2 == 0 ? "even" : "";
                if (ap.checkStatus && ap.checkStatus == 2) {
                  dele = deleteBtn;
                }
                if (ap.checkStatus == 1) {
                  seeList = seeListBtn.template(ap.id);
                }
                if (ap.checkStatus == 0) {
                  dele = cancelApplyBtn;
                }
                if (pt) {
                  data = check(pt.date);
                  dropDownDesc = check(pt.dropDownDesc);
                }
                pList.push(pTemp.template(ap.id, even, ap.id, pv.mainImg, pv.productName, pv.spuId, lab, (ap.normalPrice/100).toFixed(2), (ap.startPrice/100).toFixed(2), (ap.lowestPrice/100).toFixed(2), ap.goodsNum, ap.statusDesc, dele, seeList, checkLink));
              }

            }
          } else {
            tem_position.empty().append('<tr><td colspan="7" style="padding:50px 0;">没有关联商品</td></tr>');
            $("#page").hide().html("");
            return false;
          }
          page.pageNum = total % page.len == 0 ? parseInt(total / page.len) : parseInt(total / page.len) + 1;
          tem_position.empty().append(pList.join(""));
          $("#page").attr({
            "currentpage": option.pageID
          });
          page.init(option.pageID);
        } else {
          tip(data.message);
        }
      },
      error: function(data) {
        tip("请求失败");
      }
    });
  }

  page.getList({
    checkStatus: -1,
    goodsId: "",
    applyId: "",
    goodsName: "",
    pageSize: page.len,
    pageID: 1
  });

  $("#page").delegate("em", "click", function() {
    var pageID = parseInt($(this).html());
    page.random(pageID);
    page.init(pageID);
    $("#page").attr("currentpage", pageID)
  });
  $("#page").delegate("b:first", "click", function() {
    var pageID = parseInt($("#page").attr("currentpage"));
    page.prev(pageID);
  });
  $("#page").delegate("b:last", "click", function() {
    var pageID = parseInt($("#page").attr("currentpage"));
    page.next(pageID);
  });

  $("#searchBtn").bind('click', function() {
    getKey(1);
  });

  QB.SiteMenu.activeOn('#auction-list');
})();
