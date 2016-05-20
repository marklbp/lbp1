$(function() {
    'use strict';

    QB.SiteMenu.activeOn('#refund-list');

    $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
      managerName: "交易管理",  
      name: "退款退货"
    }));

    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

    var merchant_id = $.urlParam("_merchant_user_id_");

    var temp = QB.templates['refund-list'];
    //helper
    Handlebars.registerHelper('add', function(num1, num2, options) {
        return num1 + num2; //add
    });
    Handlebars.registerHelper('formatTime', function(time, options) {
        var t = new Date(time);
        var fmt = [t.getFullYear(), t.getMonth() + 1, t.getDate()]
        return fmt.join("-");
    });
    Handlebars.registerHelper('getStatus', function(status, options) {
        var s = refund.getStatusDesc(status);
        return s;
    });
    Handlebars.registerHelper('getOption', function(status, options) {
        var op = refund.getStatusOption(status);
        return op;
    });
    Handlebars.registerHelper('setSp', function(m, options) {
        var mon = setM(m);
        return mon;
    });
    Handlebars.registerHelper('if_con', function(con1, con2, options) {
        if (con1 != con2) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper('if_pai', function(type, options) {
        if (type == 12) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper('if_baog', function(type, options) {
        if (type == 13) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper('checkBtn', function(status, sellerId, options) {
        var op = refund.getCheckBtn(status, sellerId);
        return op;
    });

    $("#startTime").val(cala());
    $("#endTime").val(getFullDay());

    function getFullDay(){
        var date = new Date();
        var month = date.getMonth() + 1;
        if( month < 10){ month = '0' + month;}
        return date.getFullYear() + '-' + month + '-' + date.getDate();
    }

     function getTime(time){
         var t = new Date(time);
         var fmt = [t.getFullYear(), t.getMonth() + 1, t.getDate()]
         return fmt.join("-");
     }
    function cala(){
        var ttt = new Date().getTime() - 6*24000*3600;
        var theday = new Date();
        theday.setTime(ttt);
        return theday.getFullYear()+"-"+(1+theday.getMonth())+"-"+theday.getDate();
    }

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
    }

    function setM(money) {
        if (!money) return false;
        var reg = /(\d{1,3})(?=(\d{3})+(?:$|\.))/g;
        return money.toString().replace(reg, "$1,");
    }
    var refund = {},
        page = {};

    //refund.url = "http://oc.qbao.com/order/seller/getRefuntList.html?_merchant_user_id_="+merchant_id;
    refund.url = "http://oc.qbao.com/order/seller/getRefuntList.html";
     //refund.url = "http://192.168.8.51:8080/order-app/order/seller/getRefuntList.html?_merchant_user_id_=2008330";
    refund.len = 10;

    refund.getStatusDesc = function(status) {
        var s = "",
            stu = [
                "<div style='float: right;margin-right: 10px;'>待退款</div>",
                "<div style='float: right;margin-right: 10px;'>待退货</div>",
                "<div  style='float: right;margin-right: 10px;'>退款成功</div>",
                "<div  style='float: right;margin-right: 10px;'>退货退款成功</div>",
                "<div style='float: right;margin-right: 10px;'>退货中</div>",
                "<div  style='float: right;margin-right: 10px;'>退货关闭</div>",
                "<div  style='float: right;margin-right: 10px;'>待发货</div>",
                "<div class='arbitrament' style='float: right;margin-right: 10px;'>仲裁待处理</div>",
                "<div class='arbitrament'  style='float: right;margin-right: 10px;'>仲裁结果</div>",
                "<div  style='float: right;margin-right: 10px;'>买家处理中</div>",
                "<div  style='float: right;margin-right: 10px;'>退货成功</div>",
                "<div class='arbitrament'  style='float: right;margin-right: 10px;'>仲裁商家胜</div>",
                "<div class='arbitrament'  style='float: right;margin-right: 10px;'>仲裁买家胜</div>",
                "<div class='arbitrament'  style='float: right;margin-right: 10px;'>钱宝赔付</div>",
                "<div class='arbitrament'  style='float: right;margin-right: 10px;'>仲裁审核中</div>"
            ];
        switch (status) {
            case 210:
            case 920:
                s = stu[0];
                break;
            case 2201:
            case 9202:
                s = stu[2];
                break;
            case 9300:
                s = stu[3];
                break;
            case 901:
            case 903:
            case 921:
            case 910:
            case 902:
            case 922:
                s = stu[1];
                if (status == 903 || status == 921) {
                    s += stu[9];
                }
                if (status == 902 || status == 922) {
                    s += stu[7];
                }
                break;
            case 9001:
            case 9201:
            case 9401:
            case 9403:
                s = stu[5];
                if (status == 9401) {
                    s += stu[11];
                }
                if (status == 9403) {
                    s += stu[13];
                }
                break;
            case 911:
            case 912:
                s = stu[4] + stu[7];
                break;
            case 9402:
                s = stu[10] + stu[12];
                break;
            case 202:
                s = stu[6] + stu[7];
                break;
            case 913:
            case 914:
                s = stu[1] + stu[15];
                break;
            default:
                break;
        }
        return s;
    }

    refund.getStatusOption = function(status) {
        var option = "",
            op = ["处理退款", "处理退货退款", "处理退款", "查看"];
        switch (status) {
            case 210:
                option = op[0];
                break;
            case 901:
                option = op[1];
                break;
            case 920:
                option = op[2];
                break;
            default:
                option = op[3];
                break;
        }
        return option;
    }

    refund.getCheckBtn = function(status, id) {
        var option = "";
        switch (status) {
            case 913:
            case 914:
                option = "<a class='cancelAudit' attr='"+id+"'>取消</a>";
                break;
            default:
                option = "";
                break;
        }
        return option;
    }



    page.current = function() {
        return $(".refund-page:eq(0)").attr("currentpage");
    }
    page.next = function() { //next
        var currentPage = parseInt(page.current()),
            totalPage = parseInt(page.totalPage());
        if (totalPage > currentPage) {
            currentPage = currentPage + 1;
            refund.getList(currentPage);
        } else {
            return false;
        }
    }

    page.prev = function() { //prev
        var currentPage = parseInt(page.current());
        if (currentPage > 1) {
            currentPage = currentPage - 1;
            refund.getList(currentPage);
        } else {
            return false;
        }
    }

    page.random = function(pageID) { //random page
        refund.getList(pageID);
    }

    page.totalPage = function() {
        var total = Number($(".refund-page:eq(0)").attr("total")),
            num = 0,
            p = parseInt(total / refund.len);
        return total % refund.len == 0 ? p : p + 1;
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
            $(".refund-page:eq(0)").hide()
        } else {
            $(".refund-page:eq(0)").show().html(perpage.join(""));
        }

    }


    refund.setList = function(data) {
        var d = {
            list: []
        };
        var len = data.length
        for (var i = 0; i < len; i++) {
            var current_data = data[i];
            list.list.push({
                "orderId": current_data["orderId"],
                "createTime": current_data["createTime"],
                "imgUrl": current_data["productList"][0]
            });
        }

    }

    refund.getList = function(pageID) { //@pageID
        var tem_position = $('#table_list');
        if (pageID == undefined) {
            tem_position.after('<div class="refund-none">无列表</div>');
            return false;
        }
        var orderCode = $.trim($("input[name='orderId']").val()),
            saleCode = $.trim($("input[name='buyerUserName']").val()),
            jystyle = $("#orderTypeStrHidden").val(),
            restyle = $("#auditStateDefault").val(),
            sTime = $("#startTime").val(),
            eTime = $("#endTime").val();

        $.ajax({
            type: "POST",
            url: refund.url,
            dataType: "json",
            data: {
                "iDisplayStart": (pageID - 1) * refund.len,
                "iDisplayLength": refund.len,
                "orderId": orderCode,
                "buyerUserName": saleCode,
                "orderTypeStr": jystyle,
                "status": restyle,
                "beginDate": sTime,
                "endDate": eTime
            },
            success: function(data) {
                if (data.success) {
                    var list = data.data,
                        total = list.itotalRecords;//商品个数
                        
                    //过滤默认型号
                    for (var i=0;i<list.data.length;i++) {
                    		if(list.data[i].productList&&list.data[i].productList.length&&list.data[i].productList.length==1){
                    			if(!list.data[i].productList[0].skuText){
                    				list.data[i].productList[0].skuText="默认型号";
                    			}
                    		}
                    }

                    //拼接字符串
                    //tem_position.empty().append(temp(list));
                    $.each(list.data,function(i,L){
                        tem_position.empty().append(refund.listdom(L,list.data));
                    })
                    $(".refund-page:eq(0)").attr({
                        "total": total,
                        "currentpage": pageID
                    });
                    page.init(pageID);

                } else {
                    tip(data.message);
                }
            },
            error: function(data) {
                tip("请求失败");
            }
        });
    }

    refund.listdom=function(o,alllist){
        var dome='';
        dome+='<div style="height: 10px;"></div>';
        dome+=  '<table>';

            dome+=  '<tr class="">';
                        dome+='<th colspan="5" class="order-code">';
                        dome+='<em>'+getTime(o.createTime)+'</em>';
                        o.refundOrderId? dome+='<span>退货单号：'+o.refundOrderId+'</span>': dome+='<span>订单编号：'+o.orderId+'</span>'
        dome+= '<a target="_blank" href="/portle/sellerShipping.html?orderId='+o.orderId+'&userId='+ o.buyerId+'&_merchant_user_id_='+ o.sellerId+'" style="float: right;color: #d03a24 !important; margin-right:10px;">'+ refund.getStatusOption(o.status)+'</a>'
        dome+='<span  style=" min-width:130px;float: right">'+ refund.getStatusDesc(o.status)+'</span>';//订单状态
                        dome+='</th>';
        dome+='</th>';
                dome+=   '</tr>';

        $.each(o.productList,function(i,p){

                dome+=   '<tr >';
                        dome+=   '<td class="order-content" style="border-top: 1px solid #eee;">';

                        dome+=  '<div>';
                        dome+=  '<a href="http://goods.qbao.com/info/product-detail.htm?spuId='+ p.productId+'">';
                        dome+=  '<div class="order-pic"><img src="'+ p.imgUrl+'" />';
                        if(o.orderType==12){
                           dome+=  '<div class="pai"></div>';
                        }
                        if(o.orderType==13){
                            dome+=  '<div class="baog"></div>';
                        }
                        dome+=   '</div>';
                        dome+=    '<div class="order-name">';
                        dome+=    '<p>'+p.productName+'</p><p class="type">型号：'+p.skuText+'</p>';
                          if(o.buyerNickName==null){
                              dome+= '<div>买家：'+o.buyerNickName+'</div>';
                          }else{
                              dome+= '<div>买家：'+ o.buyerUserName+'</div>';
                          }
                        dome+=   '</div>';
                        dome+=   '</a>';
                        dome+=   '</div>';

                        dome+=   '</td>';

                        dome+=    '<td class="order-sum" style="border-top: 1px solid #eee;">';
                        dome+=    '<div><strong>'+ setM(p.prePrice)+'</strong>';
                        dome+=    '</div>';
                        dome+=    '</td>';
                        dome+=    '<td class="order-sum" style="border-top: 1px solid #eee;">';
                        dome+=    '<div><strong>'+ setM(p.prePrice)+'</strong>';
                        dome+=    '</div>';
                        dome+=    '</td>'

                        //dome+=     '<td class="refund-state" style="border-top: 1px solid #eee;">'+ refund.getStatusDesc(o.status)+'</td>';//订单状态
                        dome+=     '<td class="refund-state" style="border-top: 1px solid #eee;"></td>';//订单状态----

                        dome+=     ' <td style="border-top: 1px solid #eee;">';
                        //dome+=     '<a target="_blank" href="/portle/sellerShipping.html?orderId='+o.orderId+'&userId='+ o.buyerId+'&_merchant_user_id_='+ o.sellerId+'">'+ refund.getStatusOption(o.status)+'</a>'
                        //dome+=    '{{checkBtn status sellerId}}'
                        dome+=    refund.getCheckBtn(o.status,o.orderId);
                        dome+=     '</td>'

                dome+=     ' </tr>';

        })

        dome+=    '</table>';
        if(alllist.lenght=0) dome+=     '<div class="refund-none">无列表</div>';


        return dome;
    }

    refund.getList(1);

    $(".refund-page").delegate("em", "click", function() {
        var pageID = parseInt($(this).html());
        page.random(pageID);
        page.init(pageID);
        $(".refund-page").attr("currentpage", pageID)
    });
    $(".refund-page").delegate("b:first", "click", function() {
        var pageID = parseInt($(".refund-page").attr("currentpage"));
        page.prev(pageID);
    });
    $(".refund-page").delegate("b:last", "click", function() {
        var pageID = parseInt($(".refund-page").attr("currentpage"));
        page.next(pageID);
    });


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

    $(".cancelAudit").click(function(){
        var _this = $(this),
         sellId = parseInt(_this.attr("attr"));
         popHtml( sellId );
    });

    function popHtml( id ) {
          var font;
          var ary = [];

          ary.push('<div class="qb-mask"></div>');
          ary.push('<div class="qb-popup">');
          ary.push('<div class="wrap">');
          ary.push('<div class="title">');
          ary.push('<strong>提示</strong>');
          ary.push('<span class="close" title="关闭" id="popClose"></span>');
          ary.push('</div>');
          ary.push('<div class="content">');
          ary.push('<div class="info">');
          ary.push('<p>您确定取消审核？</p>');
          ary.push('</div></div>');
          ary.push('<div class="btn-box">');
          ary.push('<a href="javascript:;" class="cr-btn" id="confirmBtn">确定</a>');
          ary.push('<a href="javascript:;" class="cr-btn-disable" id="cancelBtn">取消</a>');
          ary.push('</div>');
          ary.push('</div>');
          ary.push('</div>');

          $('body').append(ary.join(''));

          $(".qb-mask").show();
          $(".qb-popup").show();

          $("#confirmBtn").on("click", function() {
              popHide();
              cancelAuditFun( id );
              
          });

          $("#cancelBtn,#popClose").on("click", function() {
              popHide();
          });
      }

      function popHide() {
          $(".qb-mask").remove();
          $(".qb-popup").remove();
      }

      function cancelAuditFun( id ){
        $.ajax({
            type: "POST",
            url: '/order/seller/exportCheck.html',
            dataType: "json",
            data: {},
            success: function(data) {
                refund.getList(1);
            },
            error: function(){
                alert("请稍后再试");
            }
        });
      }

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

    function submitQuery(t){
        var startTime = $.trim($('#startTime').val());
        var endTime = $.trim($('#endTime').val());
        if((new Date(endTime).getTime() - new Date(startTime).getTime())/(24 * 60 * 60 * 1000) > 30) {
            alert('查询跨度不能超过30天');
            return;
        }
        if(t == 1){
            refund.getList(1);
        } else {
            exportCheck();
        }
    }

    $("#checkBtn").click(function(){
        submitQuery(1);
    });

    $("#rchargeBtn").click(function(){
        submitQuery(2);
    });

    function exportCheck(){
        $.ajax({
            type: "POST",
            url: '/order/seller/exportCheck.html',
            dataType: "json",
            data: {},
            success: function(data) {
                $('#queryForm').attr('action','/order/seller/download.html');
                $('#queryForm').submit();
            },
            error: function(){
                alert("请稍后再试");
            }
        });
        // HYIP.ajax('/order/seller/exportCheck.html',
        // {},function(data){
        //     $('#queryForm').attr('action','/order/seller/download.html');
        //     $('#queryForm').submit();
        // },function(data){
        //     alert("请稍后再试");
        // });
    }
    
});

