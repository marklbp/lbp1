
(function() {
    'use strict';

    QB.SiteMenu.activeOn('#commission-info');
    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

    var merchant_id = $.urlParam("_merchant_user_id_");

    $("#startTime").val(cala());
    $("#endTime").val(getFullDay());

    $("#startTime1").val(cala1());
    
    function getFullDay(){
        var date = new Date();
        var month = date.getMonth() + 1;
        if( month < 10){ month = '0' + month;}
        return date.getFullYear() + '-' + month + '-' + date.getDate();
    }

    function cala(){
        var ttt = new Date().getTime() - 6*24000*3600;
        var theday = new Date();
        theday.setTime(ttt);
        return theday.getFullYear()+"-"+(1+theday.getMonth())+"-"+theday.getDate();
    }

    function cala1(){
        return "";
    }

    /*审核状态*/
        
    $("#goodsManageSelectAuditBtn").on('click', function() {
        $("#goodsManageSelectAuditUl li").on('mousedown', function() {
            var _thisText=$(this).text();
            $("#goodsManageAudit").val(_thisText);
            $("#auditStateDefault").val($(this).attr('value'));
            $("#goodsManageSelectAuditUl").hide();
        });
        $("#goodsManageSelectAuditUl").show();
    });
    
    /*商品类型*/
    $("#orderTypeStrBtn").on('click', function() {
        $("#orderTypeStrUl li").on('mousedown', function() {
            var _thisText=$(this).text();
            $("#orderTypeStrDefault").val(_thisText);
            $("#orderTypeStrHidden").val($(this).attr('value'));
            $("#orderTypeStrUl").hide();
        });
        $("#orderTypeStrUl").show();
    });
    
    $("body").on('click',function(e){
        var target = e.target;
        if( target.id != "goodsManageSelectAuditBtn" ){
            $("#goodsManageSelectAuditUl").hide();
        }
        if( target.id != "orderTypeStrBtn" ){
            $("#orderTypeStrUl").hide();
        }
    });

    $.datepicker.setDefaults($.datepicker.regional['zh-CN']);
    var dates = $('#startTime, #endTime').datepicker({
        dateFormat: 'yy-mm-dd',
        onSelect: function(selectedDate) {
            var option = this.id == "startTime" ? "minDate" : "maxDate";
            var instance = $(this).data("datepicker");
            var date = $.datepicker.parseDate(instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
            dates.not(this).datepicker("option", option, date);
        },
        maxDate: getFullDay()
    });

    var dates1 = $('#startTime1').datepicker({
        dateFormat: 'yy-mm-dd',
        onSelect: function(selectedDate) {
            var option = this.id == "startTime1" ? "minDate" : "maxDate";
            var instance = $(this).data("datepicker");
            var date = $.datepicker.parseDate(instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
            dates1.not(this).datepicker("option", option, date);
        }
    });

    function submitQuery(t){
        var startTime = $.trim($('#startTime').val());
        var endTime = $.trim($('#endTime').val());
        if((new Date(endTime).getTime() - new Date(startTime).getTime())/(24 * 60 * 60 * 1000) > 30) {
            alert('查询跨度不能超过30天');
            return;
        }
        if(t == 1){
            commissionEvent.commissionListAjax(page.len,1);
        }
    }

    $("#checkBtn").click(function(){
        submitQuery(1);
    });

    var ajaxUrl = {
      listUrl: "http://oc.qbao.com/shopOrderBrokerage/query.html?_merchant_user_id_="+merchant_id
      //listUrl: "http://oc.qbao.com/order/seller/shopOrderBrokerage/query.html?_merchant_user_id_="+merchant_id
    };

    var page = {};  
    page.len = 10;

    var commissionEvent = {

      commissionInit: function() {
        commissionEvent.commissionListAjax(page.len,1);

        $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
          managerName: "费用管理",
          name: "佣金管理"
        }));
      },
      commissionListAjax: function(num,pageNum){

        var orderCode = $.trim($("input[name='orderId']").val()),
            jystyle = $("#orderTypeStrHidden").val(),
            restyle = $("#auditStateDefault").val(),
            sTime = $("#startTime").val(),
            eTime = $("#endTime").val(),
            eTime1 = $("#startTime1").val();
        if( /^[0-9]*$/.test(orderCode)){
            var dataJson = {
              "pageSize": num,
              "num": pageNum,
              "orderId":orderCode,
              "brkStatus":restyle,
              "orderType":jystyle,
              "createStartTime":sTime,
              "createEndTime":eTime,
              "retEndTime":eTime1
            };

            $.ajax({
                  url: ajaxUrl.listUrl,
                  type: "POST",
                  dataType: "json",
                  data: dataJson,
                  success: function(data) {
                        if(data.success) {
                            $("#page").attr("total",data.data.total);
                            commissionEvent.commissionListAjaxBack(data.data,pageNum);
                        } else {
                            commissionEvent.errortip(data.message);
                        }
                  },
                  error: function() {
                      commissionEvent.errortip("请求错误！");
                  }
              });
        } else {
            commissionEvent.errortip("订单编号只能输入数字，请重新输入！");
        } 
      },
      commissionListAjaxBack: function(data,num) {
          $(".operate-table").children().remove();
            var html = '', dataList = data.rows, length = dataList.length;//roleIds是数组
            if( length == 0 && num === 1) {
                html += '<tr><td colspan="10">暂无佣金管理信息！</td></tr>';
            } else {
                for( var i = 0; i < length; i++){
                    html += '<tr>'+
                                '<td class="w140">'+ commissionEvent.checkDd(dataList[i].orderTime) +'</td>'+
                                '<td class="w60"><em>'+ dataList[i].orderId +'</em></td>'+
                                '<td class="w70"><span>'+ dataList[i].goodsName +'</span></td>'+
                                '<td class="w146" style="width:25px;">'+ commissionEvent.checkType(dataList[i].orderType) +'</td>'+
                                '<td class="w80">'+ dataList[i].orderAmount +'</td>'+
                                '<td class="w146">'+ dataList[i].brkRate +'</td>'+
                                '<td class="w80">'+ dataList[i].brkAmount +'</td>'+
                                '<td class="w80">'+ commissionEvent.checkMoney(dataList[i].brkStatus,dataList[i].returnBrkAmount) +'</td>'+
                                '<td class="w80">'+commissionEvent.checkDate(dataList[i].brkStatus,dataList[i].retDate)+'</td>'+
                            '</tr>';
                }
            }
            $(".operate-table").append( html );
          if( num === 1 ){
              page.init(1,page.len);
          }
      },
      checkMoney: function(a,o){
        if(a === 2){
            return o;
        }else if(a === 1){
            return "";
        }else{}
      },
      checkDd: function(o){
         var date = new Date(o);
         return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
      },
      checkType: function(o){
        if(o === 11){
            return "微商";
        } else if(o === 12){
            return "雷拍";
        } else if(o === 13){
            return "宝购";
        } else{}
      },
      checkDate: function( a,dd){
            var h = "";
            var date = new Date(dd);
            var d = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
            if(a === 2){
                h = "已结算<br/>" + d;
            } else if(a === 1) {
                h = "待结算";
            } else {};
            return h;
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
            commissionEvent.commissionListAjax(page.len,currentPage);
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
            commissionEvent.commissionListAjax(page.len,currentPage);
            page.init(currentPage);
            $("#page").attr("currentpage", currentPage);
        } else {
            return false;
        }
    }

    page.random = function(pageID) { //random page
        commissionEvent.commissionListAjax(page.len,pageID);
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
        $('body,html').animate({
          scrollTop: 0
        }, 500);
    });
    $("#page").delegate("b:first", "click", function() {
        var pageID = parseInt($("#page").attr("currentpage"));
        page.prev(pageID);
        $('body,html').animate({
          scrollTop: 0
        }, 500);
    });
    $("#page").delegate("b:last", "click", function() {
        var pageID = parseInt($("#page").attr("currentpage"));
        page.next(pageID);
        $('body,html').animate({
          scrollTop: 0
        }, 500);
    });

    commissionEvent.commissionInit();

})();
