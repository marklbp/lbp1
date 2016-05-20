$(function() {
    'use strict';

    //QB.BusinessHeader.active('#business-nav-deal');

    $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
      managerName: "交易管理",
      name: "仲裁"
    }));

    jQuery.urlParam = function(name){
        var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];
        return decodeURIComponent(result);
    }

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

    var refundProduct = QB.templates['refund-product'];
    Handlebars.registerHelper('formatTime', function(time, options) {
        var t = new Date(time);
        var fmt = [t.getFullYear(), t.getMonth() + 1, t.getDate()],
            fk = [t.getHours(), t.getMinutes(), t.getSeconds()];
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

    function setStatus(option) {
        var ov = '<h3 class="refund-state">当前状态：{statusDesc}</h3>';
        switch (option.status) {
            case 300:
            case 303:
                var zc = $("#zc").val();
                $(".refund-option:first").html(zc.template('<textarea id="zcReason" name="zc-reason"></textarea>'));
                $('#upload').fileupload({
                    url: "/imageManage/uploadImg.html?_merchant_user_id_="+merchant_id,
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
                break;
            case 302:
                $(".refund-option:first").html(ov.template("仲裁中<span>（商家发起仲裁）</span>"));
                break;
            case 3401:
                $(".refund-option:first").html(ov.template("交易成功，商家胜诉"));
                break;
            case 3402:
                $(".refund-option:first").html(ov.template("交易关闭，买家胜诉"));
                break;
            case 3403:
                $(".refund-option:first").html(ov.template("交易关闭，钱宝赔付"));
                break;
            default:
                break;
        }
    }

    function getDetail() {
        $.ajax({
            type: "POST",
            url: "/order/seller/getSellerOrderInfo.html?_merchant_user_id_="+merchant_id,
            dataType: "JSON",
            data: {
                "orderId": getQueryStringByName("orderId"),
                "userId": getQueryStringByName("userId")
            },
            success: function(data) {
                if (data.success) {
                    var skuText = data.data.data.productList[0].skuText;
                    data.data.data.productList[0].sellType = skuText.length ? skuText : '默认型号';
                    $(".refund-product").html(refundProduct(data));
                    setStatus({
                        status: data.data.data.status
                    });
                } else {
                    tip(data.message);
                }
            }
        });
    };

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
            url: "/order/seller/applyArbitration.html?_merchant_user_id_="+merchant_id,
            dataType: "JSON",
            data: {
                "orderId": Number(getQueryStringByName("orderId")),
                "userId": getQueryStringByName("userId"),
                "comment": $("#zcReason").val(),
                "mobile": $("#phoneNumber").val(),
                "picUrls": $("#piclist").val()
            },
            success: function(data) {
                if (data.success) {
                    $(".refund-option:first").html('<div class="success-option"><div>仲裁申请已提交</div><p>我们将在<em>5</em>个工作日内与您联系，请保持您的电话通畅。</p></div>');
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

    getDetail();
});
