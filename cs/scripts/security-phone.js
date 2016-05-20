(function() { //business-nav-account
    QB.SiteMenu.activeOn('#security-index');

    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

    var merchant_id = $.urlParam("_merchant_user_id_");
    
    var requestUrl = {};
    requestUrl = {
        getCode: "http://enterprise.qbao.com/accountSetup/securityCode4bindMobile.html?_merchant_user_id_="+merchant_id,
        bindPhone: "http://enterprise.qbao.com/accountSetup/mobileBind.html?_merchant_user_id_="+merchant_id,
        getBindMoblieAndUsername: "http://enterprise.qbao.com/accountSetup/getBindMoblieAndUsername.html?_merchant_user_id_="+merchant_id,
        checkMobileReBind: "http://enterprise.qbao.com/accountSetup/checkMobileReBind.html?_merchant_user_id_="+merchant_id, //one
        mobileReBind: "http://enterprise.qbao.com/accountSetup/mobileReBind.html?_merchant_user_id_="+merchant_id //two
    };

    $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
        managerName: "安全中心",
        name: "绑定手机"
    }));

    function request(url, option, fn) {
        $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            data: option,
            success: function(data) {
                fn.call(this, data);
            },
            error: function() {}
        });
    };

    //get phone
    if ($("#getPhone")[0]) {
        request(requestUrl.getBindMoblieAndUsername, {},
            function(data) {
                if (data.success) {
                    if ($("#getPhone")[0]) {
                        var ph = data.data.mobile;
                        $("#getPhone").html(ph.replace(ph.substr(3, 4), "****"));
                        $("#phoneInput").val(data.data.mobile);
                    }
                } else {
                    alert("请求错误！");
                }
            });
    }

    //倒计时
    function countTime(o, time) {
        this.time = time;
        this.o = o;
    };
    countTime.prototype = {
        timeCunt: function() {
            this.time = this.time - 1;
            this.o.val(this.time + "s后重新获取");
        },

        timeOut: function(fn) {
            if (this.time <= 0) {
                fn.call(this, window);
            }
        },
        init: function() {
            var _this = this,
                t = null;
            this.o.attr("disabled", true).val(this.time + "s后重新获取");
            t = setInterval(function() {
                _this.timeCunt();
                _this.timeOut(function() {
                    clearInterval(t);
                    _this.o.attr("disabled", false).val("获取验证码");
                });
            }, 1000);
        }
    };

    //get code
    $("#getCode").bind('click', function() {
        //check phone
        request(requestUrl.getCode, {
                mobile: $("#phoneInput").val()
            },
            function(data) {
                if (data.success) {
                    //倒计时
                    new countTime($("#getCode"), 60).init();
                } else {
                    alert(data.message);
                }
            });
    });

    //bind phone
    $("#bindPhone").bind('click', function() {
        //check phone & code
        request(requestUrl.bindPhone, {
                mobile: $("#phoneInput").val(),
                userCode: $("#setCode").val()
            },
            function(data) {
                if (data.success) {
                    $("#dialog_tip i").removeClass().addClass("success");
                    $(".confirm-info:eq(0)").html('<h2>恭喜！手机号码绑定成功。</h2>');
                } else {
                    $("#dialog_tip i").removeClass().addClass("fail");
                    $(".confirm-info:eq(0)").html('<h2>手机号码绑定失败,' + data.message + '</h2>');
                }
                $("#dialog_tip").show();
                $(".shadow:eq(0)").show();
            });
    });

    //step one
    $("#stepOne").bind('click', function() {
        request(requestUrl.checkMobileReBind, {
                mobile: $("#phoneInput").val(),
                userCode: $("#setCode").val()
            },
            function(data) {
                if (data.success) {
                    window.location.href = "http://enterprise.qbao.com/accountSetup/toModifyPhoneTwo.html?_merchant_user_id_="+merchant_id;
                } else {
                    alert(data.message);
                }
            });
    });

    //step two
    $("#stepTwo").bind('click', function() {
        request(requestUrl.mobileReBind, {
                mobile: $("#phoneInput").val(),
                userCode: $("#setCode").val()
            },
            function(data) {
                if (data.success) {
                    window.location.href = "http://enterprise.qbao.com/accountSetup/toModifyPhoneThree.html?_merchant_user_id_="+merchant_id;
                } else {
                    alert(data.message);
                }
            });
    });

    $(".dialog-close,.confirm-btn").bind('click', function() {
        $("#dialog_tip").hide();
        $(".shadow:eq(0)").hide();
        if ($("#dialog_tip i").hasClass("success")) {
            window.location.href = "http://enterprise.qbao.com/security-index.htm?_merchant_user_id_="+merchant_id;
        }
    });


})(window);
