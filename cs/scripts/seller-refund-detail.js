$(function() {
    'use strict';

    $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
      manager:"交易管理",
      managerName: "退款退货",
      name: "退款退货详情"
    }));

    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

    var merchant_id = $.urlParam("_merchant_user_id_");

    //simple replace
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
    }

    function getT(s) {
        return s.toString().length == 2 ? s : "0" + s
    }
    var refundProduct = QB.templates['refund-product'],
        refundFlow = QB.templates['refund-flow'];

    Handlebars.registerHelper('formatTime', function(time, options) {
        var t = new Date(time);
        var fmt = [t.getFullYear(), getT(t.getMonth() + 1), getT(t.getDate())],
            fk = [getT(t.getHours()), getT(t.getMinutes()), getT(t.getSeconds())];
        return fmt.join("-") + " " + fk.join(":");
    });

    Handlebars.registerHelper('setSp', function(m, options) {
        var mon = setM(m);
        return mon;
    });
    Handlebars.registerHelper('if_equre', function(m, options) {
        if (m != 0) {
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
    Handlebars.registerHelper('imglist', function(img, options) {
        var c = img.split(","),
            a = "";
        for (var i = 0; i < c.length; i++) {
            a = a + '<a rel="group" class="pop-img" href="' + c[i] + '"><img src="' + c[i] + '" /></a>';
        }
        return a;
    });

    String.prototype.tem = function(option) {
        return this.replace(/{([^}]+)?}/g, function(q, b) {
            return option[b];
        });
    };

    function timeCountDown(time) {
        if (!time) time = 0;
        this.time = parseInt(time / 1000);
    }

    timeCountDown.prototype = {
        getSec: function() {
            return this.time;
        },
        setSec: function() {
            this.time = this.time - 1;
            return this.time;
        },
        getTime: function(sec) {
            var sec = sec,
                day = 0,
                hour = 0,
                min = 0,
                second = 0;
            day = parseInt(sec / (24 * 60 * 60));
            hour = parseInt((sec - day * 24 * 60 * 60) / 3600);
            min = parseInt((sec - day * 24 * 60 * 60 - hour * 3600) / 60);
            second = sec - day * 24 * 60 * 60 - hour * 3600 - min * 60;
            return {
                day: day,
                hour: hour,
                min: min,
                second: second
            }
        },
        viewHtml: function(d, desc) {
            var timeTemp = [],
                time = "<em>{day}</em>天<em>{hour}</em>小时<em>{minutes}</em>分<em>{seconds}</em>秒后<span>{step}</span></div>";
            timeTemp.push('<div id="countdown" class="time-countdown"><i></i>');
            timeTemp.push(time.tem({
                day: d.day,
                hour: d.hour,
                minutes: d.min,
                seconds: d.second,
                step: desc
            }));
            return timeTemp;
        },
        init: function(desc) {
            var t = null,
                _this = this;
            if (parseInt(this.time) <= 0) {
                return false;
            }
            var d = this.getTime(this.time);
            $("#countdown").remove();
            if ($(".refund-detail .option-btn").length) {
                $(".refund-detail .option-btn").before(_this.viewHtml(d, desc).join(""));
            } else {
                if (!$(".refund-detail .zc-option").length) {
                    $(".refund-detail .success-option").append(_this.viewHtml(d, desc).join(""));
                }
            }

            t = setInterval(function() {
                var times = _this.setSec();
                var d = _this.getTime(times);
                $("#countdown").remove();
                if ($(".refund-detail .option-btn").length) {
                    $(".refund-detail .option-btn").before(_this.viewHtml(d, desc).join(""));
                } else {
                    if (!$(".refund-detail .zc-option").length) {
                        $(".refund-detail .success-option").append(_this.viewHtml(d, desc).join(""));
                    }
                }
                if (times <= 0) {
                    clearInterval(t);
                }
            }, 1000);

        }
    }

    function getQueryString() {
        var result = location.search.match(new RegExp("[\?\&][^\?\&]+=[^\?\&]+", "g"));
        if (result == null) {
            return "";
        }
        for (var i = 0; i < result.length; i++) {
            result[i] = result[i].substring(1);
        }
        return result;
    }

    function getQueryStringByName(name) {
        var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
        if (result == null || result.length < 1) {
            return "";
        }
        return result[1];
    }

    function setH(obj) {
        var h = obj.height();
        obj.css({
            "top": "50%",
            "margin-top": -h / 2
        });
    }

    function setM(money) {

        var reg = /(\d{1,3})(?=(\d{3})+(?:$|\.))/g;
        return money.toString().replace(reg, "$1,");
    }

    function tip(message) {
        var tip = "<div id='error_tip' class='error-tip'></div>";
        if (!$("#error_tip")[0]) {
            $("body").append(tip);
        }
        var h = $("#error_tip").width();
        $("#error_tip").html(message).css("margin-left", -h / 2).show();
        setTimeout(function() {
            $("#error_tip").hide().html("");
        }, 3000);
    }

    var flow = {};
    flow.head = "http://oc.qbao.com";
    flow.url = {
        //"detail": "/order/seller/detail.html?_merchant_user_id_="+merchant_id,
        "detail": "/order/seller/detail.html",//测试地址
        //"detail": "/order/seller/detail.html",//测试地址
        "refundMoney": "/order/seller/sellerAuditRefund.html?_merchant_user_id_="+merchant_id,
        "refundGoods": "/order/seller/sellerAuditReturn.html?_merchant_user_id_="+merchant_id,
        "confirmGoods": "/order/seller/confirmReceive.html?_merchant_user_id_="+merchant_id,
        "receiveGoods": "/order/seller/confirmDelivery.html?_merchant_user_id_="+merchant_id,
        "fee": "/order/seller/logistics.html?_merchant_user_id_="+merchant_id,
        "zc": "/order/seller/applyArbitration.html?_merchant_user_id_="+merchant_id,
        "upload": "/imageManage/uploadImg.html?_merchant_user_id_="+merchant_id,
        "delay": "/order/seller/sellerReturnDelay.html?_merchant_user_id_="+merchant_id
    }

    flow.getStatus = function(option) { //option status, optionList, orderInfor,price
        var temp = $("#step").val(),
            op = $("#optionStatus").val(),
            th = $("#th").val(),
            ov = $("#overStatus").val(),
            status = [
                '<div class="success-option"><div>{good}退款成功</div><p><em>{money}</em> 退款将直接退还至买家账户</p></div>',
                '<div class="success-option"><p class="option-refuse">退{s}申请已经拒绝，待买家处理</p></div>',
                '<p class="refund-order">退货单号：{refundOrder}</p>'
            ],
            btn = [
                '<a href="#" class="btn btn-confirm refund-dialog">同意退款</a>',
                '<a href="#" class="btn btn-confirm confirm-dialog">同意退款</a>',
                '<a href="#" class="btn btn-refuse shipping-dialog">立即发货</a>',
                '<a href="#" class="btn btn-refuse refuse-dialog">拒绝退款</a>',
                '<a href="#" class="btn btn-confirm confirmGoods-dialog">同意退货</a>',
                '<a href="#" class="btn btn-refuse refuseGoods-dialog">拒绝退货</a>',
                '<a href="#" class="btn btn-confirm receiving-dialog">确定收货</a>',
                '<a href="#" class="option-back arbitration-dialog">申请仲裁</a>',
                '<a href="#" class="option-back apply-delay">延长收货</a>'
            ],
            optionList = '',
            productInfor = '',
            statusInfor = '',
            f = {
                "p": "processed", //完成
                "pv": "processed-prev", //完成
                "d": "dealing", //当前
                "u": "untreated", //未处理
                "s": "refund-success", //成功
                "l": " step-last", //最后一步
                "t": "drop-shipping", //三步
                "f": "goods-received" //四步
            },
            w = {
                a: "买家申请退款",
                b: "商家处理申请",
                c: "退款成功",
                d: "买家申请退款（仅退款）",
                e: "买家申请退货退款",
                f: "商家家处理退货退款申请",
                g: "买家发货,商家确认收货",
                h: "退货退款成功"
            },
            refundOrder = $(".refund-option:first");
        $(".shadow").hide();
        $(".dialog").hide();
        $(".refund-step:eq(0)").show();
        $(".refund-order").remove();
        switch (option.status) {
            case 210:
                temp = temp.template(f.t, f.p, f.s, w.a, f.d, "", w.b, f.u + f.l, "", w.c);
                statusInfor = op.template("待退款<span>（商家处理中）</span>", "退款", option.reason, option.explain, btn[0] + btn[2]);
                refundOrder.html(statusInfor);
                new timeCountDown(option.extraTime).init("自动退款");
                break;
            case 2201:
                temp = temp.template(f.t, f.pv, f.s, w.a, f.p, f.s, w.b, f.d + f.l, "", w.c);
                refundOrder.html(status[0].template("", setM(option.totalPrice)));
                break;
            case 920:
                temp = temp.template(f.t, f.p, f.s, w.d, f.d, "", w.b, f.u + f.l, "", w.c);
                statusInfor = th.template("待退款<span>（商家处理中）</span>", "仅退款", "", option.explain, btn[1] + btn[3])
                refundOrder.before(status[2].template(option.refundOrderId)).html(statusInfor);
                refundOrder.find(".refund-reason:last").hide();
                new timeCountDown(option.extraTime).init("自动退款");
                break;
            case 921:
                temp = temp.template(f.t, f.d, "", w.d, f.u, "", w.b, f.u + f.l, "", w.c);
                refundOrder.before(status[2].template(option.refundOrderId)).html(status[1].template("款"));
                new timeCountDown(option.extraTime).init("自动撤销申请");
                break;
            case 9202:
                temp = temp.template(f.t, f.pv, f.s, w.d, f.p, f.s, w.b, f.d + f.l, "", w.c);
                refundOrder.before(status[2].template(option.refundOrderId)).html(status[0].template("", setM(option.price)));
                break;
            case 901:
                temp = temp.template(f.f, f.p, f.s, w.e, f.d, "", w.f, f.u, "", w.g, f.u + f.l, "", w.h);
                statusInfor = th.template("退货中<span>（待买家发货，确认收货后将退款给买家）</span>", "退货退款", "已收到货", option.explain, btn[4] + btn[5]);
                refundOrder.before(status[2].template(option.refundOrderId)).html(statusInfor);
                new timeCountDown(option.extraTime).init("自动同意退货");
                break;
            case 910:
                var getBtn = btn[6] + btn[7];
                if (option.sellerDelayNum > 0) {
                    getBtn = btn[6] + btn[7];
                } else {
                    getBtn = btn[6] + btn[7] + btn[8];
                }
                temp = temp.template(f.f, f.pv, f.s, w.e, f.p, f.s, w.f, f.d, "", w.g, f.u + f.l, "", w.h);
                statusInfor = th.template("待退款<span>（商家处理中）</span>", "退货退款", "已收到货", option.explain, getBtn);
                refundOrder.before(status[2].template(option.refundOrderId)).html(statusInfor);
                new timeCountDown(option.extraTime).init("自动确认收货");
                break;
            case 903:
                temp = temp.template(f.f, f.d, "", w.e, f.u, "", w.f, f.u, "", w.g, f.u + f.l, "", w.h);
                refundOrder.before(status[2].template(option.refundOrderId)).html(status[1].template("货"));
                new timeCountDown(option.extraTime).init("自动撤销申请");
                break;
            case 9300:
                temp = temp.template(f.f, f.pv, f.s, w.e, f.pv, f.s, w.f, f.p, f.s, w.g, f.d + f.l, "", w.h);
                refundOrder.before(status[2].template(option.refundOrderId)).html(status[0].template("", setM(option.price)));
                break;
            case 9001:
            case 9201:
                statusInfor = ov.template("退货关闭", "", option.reason, "");
                refundOrder.before(status[2].template(option.refundOrderId)).html(statusInfor);
                refundOrder.find(".option-btn").hide();
                $(".refund-step:eq(0)").hide();
                refundOrder.find(".refund-reason").hide();
                break;
            case 911:
            case 902:
            case 922:
            case 202:
                statusInfor = ov.template("仲裁中<span>（买家发起仲裁）</span>", "", "", "");
                if (option.refundOrderId) {
                    refundOrder.before(status[2].template(option.refundOrderId));
                }
                refundOrder.html(statusInfor);
                refundOrder.find(".refund-reason").hide();
                $(".refund-step:eq(0)").hide();
                break;
            case 912:
                statusInfor = ov.template("仲裁中<span>（商家发起仲裁）</span>", "", "", "");
                refundOrder.before(status[2].template(option.refundOrderId)).html(statusInfor);
                refundOrder.find(".refund-reason").hide();
                $(".refund-step:eq(0)").hide();
                break;
            case 9401:
            case 9402:
            case 9403:
                if (option.status == 9401) {
                    statusInfor = ov.template("交易成功，商家胜诉", "", "", "");
                } else if (option.status == 9402) {
                    statusInfor = ov.template("交易关闭，买家胜诉", "", "", "");
                } else {
                    statusInfor = ov.template("交易关闭，钱宝赔付", "", "", "");
                }

                if (option.refundOrderId != option.orderId) {
                    refundOrder.before(status[2].template(option.refundOrderId));
                }
                refundOrder.html(statusInfor);
                refundOrder.find(".refund-reason").hide();
                $(".refund-step:eq(0)").hide();
                break;
            default:
                window.location.href = QB.domain.order + "/portle/refundList.html?_merchant_user_id_="+merchant_id;
                break;
        }

        $(".refund-step:eq(0)").html(temp);
    };
    //物流公司api
    flow.feeList = function() {
        var feeTem = $("#feeList");
        $("#mainContent").html($("#feeList").val());
        $.ajax({
            type: "POST",
            url: flow.head + flow.url.fee,
            dataType: "JSON",
            success: function(data) {
                if (data.success) {
                    var list = [],
                        d = data.data;
                    for (var i = 0; i < d.length; i++) {
                        list.push("<dd value=" + d[i]["code"] + ">" + d[i]["name"] + "</dd>");
                    }
                    $("#mainContent dl").append(list.join(""));
                } else {
                    tip("data.message");
                }
            }
        });
    };


    //detail
    flow.getApiInfor = function() {
        $.ajax({
            type: "POST",
            url: flow.head + flow.url.detail,
            dataType: "JSON",
            //data: {
            //    "orderId": getQueryStringByName("orderId"),
            //    "userId": getQueryStringByName("userId")
            //},
            data: {
                "orderId": 1100000000027325,
                "userId": 3973332
            },
            success: function(data) {
                var info = data.data;
                if (data.success) {
                    var returnInfor = info.returnInfo;
                    //var skuText = data.data.data.productList[0].skuText;
                    //data.data.data.productList[0].sellType = skuText.length ? skuText : '默认型号';
                    $("#childrenOrderId").val(returnInfor.refundOrderId);
                    $("#money").val(returnInfor.refundAmount + returnInfor.refundCoupon);
                    $("#moneyOnly").val(info.data.totalAmount);
                    $(".refund-product").html(refundProduct(data));
                    $(".option-list").html(refundFlow(info));
                    flow.getStatus({
                        status: returnInfor.refundStatus,
                        price: returnInfor.refundAmount + returnInfor.refundCoupon,
                        refundOrderId: returnInfor.refundOrderId,
                        reason: returnInfor.reason,
                        orderId: info.data.orderId,
                        totalPrice: info.data.totalAmount,
                        explain: returnInfor.refundComment.trim().length == 0 ? "无" : returnInfor.refundComment,
                        extraTime: info.data.expiredTime,
                        sellerDelayNum: returnInfor.sellerReturnDelayNum
                    });

                    $('.pop-img').fancybox({
                        type: 'image',
                        afterLoad: function() {},
                        tpl: {
                            error: '<p class="fancybox-error">无法加载图片！</p>',
                            closeBtn: '<a title="关闭" class="fancybox-item fancybox-close" href="javascript:;"></a>',
                            next: '<a title="下一页" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
                            prev: '<a title="上一页" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
                        }
                    });

                } else {
                    tip(data.message);
                }
            }
        });
    };
    //同意退款 未发货
    $(".refund-option:eq(0)").delegate('.refund-dialog:eq(0)', 'click', function(e) {
        e.preventDefault();
        $("#mainContent").html($("#tk").val().template("", "你确定要将 <em>" + setM($("#moneyOnly").val()) + "</em> 钱宝币退还买家账户？"));
        setH($(".dialog"));
        $(".confirm-btn").attr("id", "w_agree");
        $(".dialog").show();
        $(".shadow").show();
    });
    $(".dialog").delegate('#w_agree', 'click', function() {
        $.ajax({
            type: "POST",
            url: flow.head + flow.url.refundMoney,
            dataType: "JSON",
            data: {
                "orderId": getQueryStringByName("orderId"),
                "buyerId": getQueryStringByName("userId"),
                "type": 1,
                "password": $("#refund_password").val()
            },
            success: function(data) {
                if (data.success) {
                    //flow.getApiInfor();
                    window.location.reload();
                } else {
                    tip(data.message);
                }
            }
        });
    });

    //立即发货 未发货 物流选择
    $(".refund-option:eq(0)").delegate('.shipping-dialog:eq(0)', 'click', function(e) {
        e.preventDefault();
        flow.feeList();
        setH($(".dialog"));
        $(".confirm-btn").attr("id", "fee_select");
        $(".dialog").show();
        $(".shadow").show();
    });

    $(".dialog").delegate('.get-list', 'mouseover', function() {
        $(this).find("dl").show();
    });
    $(".dialog").delegate('.get-list', 'mouseout', function() {
        $(this).find("dl").hide();
    });
    $(".dialog").delegate('dd', 'click', function() {
        $("#dispatchCorpName").val($(this).html());
        $("#dispatchCorpId").val($(this).attr("value"));
        $(".get-list span").html($(this).html());
        $(this).parent().hide();
        if ($(this).attr("value") == "dummy") {
            $("#fee_codeID").hide();
        } else {
            $("#fee_codeID").show();
        }
        if ($(this).attr("value") == "other") {
            $(".fee-other").show();
        } else {
            $(".fee-other").hide();
        }
    });
    $(".dialog").delegate('#fee_select', 'click', function() {
        var dispatchCorpName = "",
            dispatchCorpId = "",
            dispatchSeq = "";
        if ($("#dispatchCorpId").val().trim().length == 0) {
            tip("请选择物流！");
            return false;
        }
        if ($("#dispatchCorpId").val() == "other") {
            if ($("#otherName").val().trim().length == 0) {
                tip("请填写其他物流名称！");
                return false;
            }
            dispatchCorpName = $("#othername").val();
        } else {
            dispatchCorpName = $("#dispatchCorpName").val();
        }
        if ($("#dispatchCorpId").val() == "dummy") {
            dispatchCorpName = "";
            dispatchSeq = "";
        } else {
            if ($("#dispatchSeq").val().trim().length == 0) {
                tip("请填写快递单号！");
                return false;
            }
            dispatchSeq = $("#dispatchSeq").val();
        }

        $.ajax({
            type: "POST",
            url: flow.head + flow.url.receiveGoods,
            dataType: "JSON",
            data: {
                "orderId": getQueryStringByName("orderId"),
                "buyerId": getQueryStringByName("userId"),
                "dispatchCorpId": $("#dispatchCorpId").val(),
                "dispatchCorpName": dispatchCorpName,
                "dispatchSeq": dispatchSeq
            },
            success: function(data) {
                if (data.success) {
                    $(".dialog .dialog-close").remove();
                    $(".dialog .dialog-content").html('<div class="success-option"><div style="padding:60px 40px;font-size:20px;">发货成功</div></div>');
                    setTimeout(function() {
                        window.location.href = QB.domain.order + "/portle/refundList.html?_merchant_user_id_="+merchant_id;
                    }, 3000);
                } else {
                    tip(data.message);
                }
            }
        });
    });



    //同意退款 仅退款
    $(".refund-option:eq(0)").delegate('.confirm-dialog:eq(0)', 'click', function(e) {
        e.preventDefault();
        $("#mainContent").html($("#tk").val().template("", "你确定要将 <em>" + setM($("#money").val()) + "</em> 钱宝币退还买家账户？"));
        setH($(".dialog"));
        $(".confirm-btn").attr("id", "j_agree");
        $(".dialog").show();
        $(".shadow").show();
    });
    $(".dialog").delegate('#j_agree', 'click', function() {
        $.ajax({
            type: "POST",
            url: flow.head + flow.url.refundGoods,
            dataType: "JSON",
            data: {
                "childrenOrderId": Number($("#childrenOrderId").val()),
                "buyerId": getQueryStringByName("userId"),
                "type": 1,
                "password": $("#refund_password").val()
            },
            success: function(data) {
                if (data.success) {
                    //flow.getApiInfor();
                    window.location.reload();
                } else {
                    tip(data.message);
                }
            }
        });
    });

    //拒绝退款 仅退款
    $(".refund-option:eq(0)").delegate('.refuse-dialog:eq(0)', 'click', function(e) {
        e.preventDefault();
        $("#mainContent").html($("#rs").val().template('<textarea id="refuseReason" name="refuseReason" defalutV="输入拒绝退货的理由，限定500字符"></textarea>'));
        setH($(".dialog"));
        $(".confirm-btn").attr("id", "j_refuse");
        $(".dialog").show();
        $(".shadow").show();
    });
    $(".dialog").delegate('#j_refuse', 'click', function() {
        var reason = $("#refuseReason").val().trim();
        if (reason.length == 0 || reason.length > 200) {
            tip("拒绝原因不能为空，且在200字以内！");
            return false;
        }
        $.ajax({
            type: "POST",
            url: flow.head + flow.url.refundGoods,
            dataType: "JSON",
            data: {
                "childrenOrderId": Number($("#childrenOrderId").val()),
                "buyerId": getQueryStringByName("userId"),
                "type": 2,
                "password": $("#refund_password").val(),
                "comment": $("#refuseReason").val()
            },
            success: function(data) {
                if (data.success) {
                    //flow.getApiInfor();
                    window.location.reload();
                } else {
                    tip(data.message);
                }
            }
        });
    });





    //同意退货
    $(".refund-option:eq(0)").delegate('.confirmGoods-dialog:eq(0)', 'click', function(e) {
        e.preventDefault();
        $("#mainContent").html($("#tk").val().template("", "您确认同意买家退货申请？"));
        setH($(".dialog"));
        $(".confirm-btn").attr("id", "a_agree");
        $(".dialog").show();
        $(".shadow").show();
    });
    $(".dialog").delegate('#a_agree', 'click', function() {
        $.ajax({
            type: "POST",
            url: flow.head + flow.url.refundGoods,
            dataType: "JSON",
            data: {
                "childrenOrderId": Number($("#childrenOrderId").val()),
                "buyerId": getQueryStringByName("userId"),
                "type": 1,
                "password": $("#refund_password").val()
            },
            success: function(data) {
                if (data.success) {
                    //flow.getApiInfor();
                    window.location.reload();
                } else {
                    tip(data.message);
                }
            }
        });
    });

    //拒绝退货
    $(".refund-option:eq(0)").delegate('.refuseGoods-dialog:eq(0)', 'click', function(e) {
        e.preventDefault();
        $("#mainContent").html($("#rs").val().template('<textarea id="refuseReason" name="refuseReason" defalutV="输入拒绝退货的理由，限定500字符"></textarea>'));
        setH($(".dialog"));
        $(".confirm-btn").attr("id", "a_refuse");
        $(".dialog").show();
        $(".shadow").show();
    });
    $(".dialog").delegate('#a_refuse', 'click', function() {
        var reason = $("#refuseReason").val().trim();
        if (reason.length == 0 || reason.length > 200) {
            tip("拒绝原因不能为空，且在200字以内！");
            return false;
        }
        $.ajax({
            type: "POST",
            url: flow.head + flow.url.refundGoods,
            dataType: "JSON",
            data: {
                "childrenOrderId": Number($("#childrenOrderId").val()),
                "buyerId": getQueryStringByName("userId"),
                "type": 2,
                "password": $("#refund_password").val(),
                "comment": $("#refuseReason").val()
            },
            success: function(data) {
                if (data.success) {
                    //flow.getApiInfor();
                    window.location.reload();
                } else {
                    tip(data.message);
                }
            }
        });
    });

    //确定收货
    $(".refund-option:eq(0)").delegate('.receiving-dialog:eq(0)', 'click', function(e) {
        e.preventDefault();
        $("#mainContent").html($("#tk").val().template("tl", "您确认已经收到买家退还的货物,并将" + setM($("#money").val()) + "钱宝币退还买家账户？"));
        setH($(".dialog"));
        $(".confirm-btn").attr("id", "receving_goods");
        $(".dialog").show();
        $(".shadow").show();
    });
    $(".dialog").delegate('#receving_goods', 'click', function() {
        $.ajax({
            type: "POST",
            url: flow.head + flow.url.confirmGoods,
            dataType: "JSON",
            data: {
                "childrenOrderId": Number($("#childrenOrderId").val()),
                "buyerId": getQueryStringByName("userId"),
                "password": $("#refund_password").val()
            },
            success: function(data) {
                if (data.success) {
                    //flow.getApiInfor();
                    window.location.reload();
                } else {
                    tip(data.message);
                }
            }
        });
    });
    //延长收货
    $(".refund-option:eq(0)").delegate('.apply-delay:eq(0)', 'click', function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: flow.head + flow.url.delay,
            dataType: "JSON",
            data: {
                "orderId": getQueryStringByName("orderId"),
                "buyerId": getQueryStringByName("userId")
            },
            success: function(data) {
                if (data.success) {
                    //flow.getApiInfor();
                    window.location.reload();
                } else {
                    tip(data.message);
                }
            }
        });
    });

    //申请仲裁 
    $(".refund-option:eq(0)").delegate('.arbitration-dialog:eq(0)', 'click', function(e) {
        e.preventDefault();
        $(".refund-step:eq(0)").hide();
        var zc = $("#zc").val();
        $(".refund-option:first").html(zc.template('<textarea id="zcReason" name="zc-reason"></textarea>'));

        $('#upload').fileupload({
            url: flow.head + flow.url.upload,
            dataType: 'json'
        }).on('fileuploadprogressall', function(e, data) {
            //todo
        }).on('fileuploaddone', function(e, data) {
            // data.result.data
            var data = data.result;
            if (!data.success) {
                tip(data.message);
            } else {
                var list = '<div class="zc-piclist zc-list"><img src="{url}" alt="" /><div class="upload-delete">删除</div></div>';
                if ($("#piclist").val() != "") {
                    var piclist = $("#piclist").val().split(",");
                } else {
                    var piclist = [];
                }
                $(".zc-upload").before(list.template(data.data.imageUrl));
                piclist.push(data.data.imageUrl);
                $("#piclist").val(piclist.join(","));
                if (piclist.length > 2) {
                    $(".zc-upload").hide();
                }

            }
        }).on('fileuploadfail', function(e, data) {
            tip("上传错误!");
        });

    });
    $(".refund-option:eq(0)").delegate('.zc-btn', 'click', function() {
        var re = $("#zcReason").val().trim(),
            phone = $("#phoneNumber").val().trim(),
            reg = /^1\d{10}$/;
        if (re.length == 0 || re.length > 200) {
            tip("申请原因不能为空，且在200字以内！");
            return false;
        }
        if (!reg.test(phone)) {
            tip("输入正确的手机号码！");
            return false;
        }
        //提交
        $.ajax({
            type: "POST",
            url: flow.head + flow.url.zc,
            dataType: "JSON",
            data: {
                "orderId": Number($("#childrenOrderId").val()),
                "userId": getQueryStringByName("userId"),
                "comment": $("#zcReason").val(),
                "mobile": $("#phoneNumber").val(),
                "picUrls": $("#piclist").val()
            },
            success: function(data) {
                if (data.success) {
                    $(".refund-option:first").html('<div class="success-option zc-option"><div>仲裁申请已提交</div><p>我们将在<em>5</em>个工作日内与您联系，请保持您的电话通畅。</p></div>');
                } else {
                    tip(data.message);
                }
            }
        });
    });

    $(".refund-option:eq(0)").delegate('.upload-delete', 'click', function() {
        $(this).parent().remove();
        var l = [];
        if ($(".zc-list").size() < 3) {
            $(".zc-upload").show();
        }
        $(".zc-list").each(function() {
            console.log($(this).find("img").attr("src"));
            l.push($(this).find("img").attr("src"));
        });
        $("#piclist").val(l.join(","));
    });


    $(".confirm-btn").bind('click', function() {
        setH($(".dialog"));
    });

    $(".cancle-btn,.dialog-close").bind('click', function() {
        $('.dialog').hide();
        $('.shadow').hide();
    });
    flow.getApiInfor();

});
