(function() {
    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

    String.prototype.trim = function() {
        return this.replace(/(^\s+)|(\s+$)/g, "");
    };

    String.prototype.tem = function(option) {
        return this.replace(/{([^}]+)?}/g, function(q, b) {
            return option[b];
        });
    };

    var dialog = {};

    dialog.setPosition = function(obj) {
        if (!obj) return false;
        var height = obj.height();
        obj.css("margin-top", -height / 2);
    }
    dialog.open = function(obj) {
        dialog.setPosition(obj);
        obj.show();
        $(".shadow:eq(0)").show();
    }
    dialog.close = function(obj) {
        obj.hide();
        $(".shadow:eq(0)").hide();
    }

    $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
      name: "商家认证信息"
    }));

    var id = $.urlParam('_merchant_user_id_');

    function request(url, option, fn) {
        $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            data: option,
            success: function(data) {
                fn.call(this, data);
            },
            error: function() {
                alert("请求错误！");
            }
        });
    };

    var uplaod = "http://enterprise.qbao.com/merchant/certify/uploadImg.html?_merchant_user_id_="+id;
    var apply = "http://enterprise.qbao.com/merchant/certify/apply.html?_merchant_user_id_="+id;

    $("#upload").fileupload({
        url: uplaod,
        dataType: 'json',
        formData: {
            idCardImgFile: "file"
        }
    }).on('fileuploadprogressall', function(e, data) {
        //todo

    }).on('fileuploaddone', function(e, data) {
        if (!data.result.data) {
            alert("上传错误了~");
        } else {
            $("#addUpload").hide();
            $("#complete").find("img").attr("src", data.result.data).end().show();
        }

    }).on('fileuploadfail', function(e, data) {
        alert("上传错误!");
    });

    $("#complete .delete-tip:eq(0)").bind('click', function() {
        $("#addUpload").show();
        $("#complete").find("img").attr("src", "").end().hide();
    });

    function checkError(state) {
        switch (state) {
            case 0:
                return "交易数量未达标";
                break;
            case 1:
                return "交易额未达标";
                break;
            case 2:
                return "订单数量未达标";
                break;
            case 3:
                return "信息错误！";
                break;
            case 4:
                return "支付失败！余额不足。";
                break;
            default:
                return "信息错误！";
                break;
        }
    }


    $("#confirmBtn").bind('click', function() {
        var sf = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
            ph = /^1\d{10}$/,
            card = $("#card").val(),
            phone = $("#phone").val(),
            qqVal = $("#qq").val(),
            qqReg = new RegExp("^[0-9]*$");
        //name
        if ($("#name").val().trim().length == 0) {
            alert("请输入姓名！");
            return false;
        }
        //QQ
        if ( qqVal == 0 ) {
            alert("请输入QQ号！");
            return false;
        } else if(!qqReg.test(qqVal)) {
            alert("QQ号不合法！");
            return false;
        }
        //phone
        if (ph.test(phone) === false) {
            alert("手机号码不合法！");
            return false;
        }
        //shenfen
        if (sf.test(card) === false) {
            alert("身份证不合法！");
            return false;
        }
        //img
        if ($("#complete img").attr("src").length == 0) {
            alert("请上传手持身份证电子照~");
            return false;
        }
        request(apply, {
                name: $("#name").val(),
                phone: phone,
                qqNum: qqVal,
                idCardImgPath: $("#complete img").attr("src"),
                idCard: card,
                applyDesc: $("#desc").val(),
                type: securityEvent._id
            },

            function(data) {
                var template = '<div class="result-icon {state}"></div><div>{reason}</div>';
                if (data.success) {
                    $("#tip .ct").html(template.tem({
                        state: "success",
                        reason: "支付成功！请等待认证审核。"
                    }));
                    $("#tip .dialog-close").hide();
                    dialog.open($("#tip"));
                } else {
                    if (data.data) {
                        $("#tip .ct").html(template.tem({
                            state: "fail",
                            reason: checkError(data.data[0])
                        }));
                    } else {
                        $("#tip .ct").html(template.tem({
                            state: "fail",
                            reason: checkError(data.message)
                        }));
                    }

                    $("#tip .dialog-close").show();
                    dialog.open($("#tip"));
                }
            });

    });
    $(".dialog-close").bind('click', function() {
        dialog.close($("#tip"));
    });
    $("#toolBtn").bind('click', function() {
        if ($("#tip .result-icon").hasClass("success")) {
            window.location.href = "http://enterprise.qbao.com/merchantUser/merchantUcIndex.html?_merchant_user_id_="+id;
        } else {
            dialog.close($("#tip"));
        }
    });

    //jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

    var securityEvent = {
        _id: $.urlParam('type'),
        init: function () {
            $.ajax({
            url: "http://enterprise.qbao.com/merchant/certify/getQulificationMoney.html?type="+securityEvent._id+"&_merchant_user_id_="+id,
            type: "POST",
            dataType: "json",
            async: false,
            success: function(data) {
                $("#confirmBtn").text("确认,并支付保证金"+data.data+"元");
            },
            error: function() {
                alert("请求错误！");
            }
        });
        }
    };

    securityEvent.init();

})();
