//CharMode函数
//测试某个字符是属于哪一类
function CharMode(iN) {
    if (iN >= 48 && iN <= 57) //数字
        return 1;
    if (iN >= 65 && iN <= 90) //大写字母
        return 2;
    if (iN >= 97 && iN <= 122) //小写
        return 4;
    else
        return 8; //特殊字符
}

//bitTotal函数
//计算出当前密码当中一共有多少种模式
function bitTotal(num) {
    var modes = 0;
    for (var i = 0; i < 4; i++) {
        if (num & 1) modes++;
        num >>>= 1;
    }
    return modes;
}

//checkStrong函数
//返回密码的强度级别
function checkStrong(sPW) {
    if (sPW.length <= 4)
        return 0; //密码太短
    var Modes = 0;
    for (var i = 0; i < sPW.length; i++) {
        //测试每一个字符的类别并统计一共有多少种模式
        Modes |= CharMode(sPW.charCodeAt(i));
    }
    return bitTotal(Modes);
}

//pwStrength函数
//当用户放开键盘或密码输入框失去焦点时,根据不同的级别显示不同的颜色

function pwStrength(pwd) {
    var O_color = "#eeeeee";
    var L_color = "#fc1f04";
    var M_color = "#ff9d04";
    var H_color = "#90cb11";
    var Lcolor, Mcolor, Hcolor;
    if (pwd == null || pwd == "") {
        Lcolor = Mcolor = Hcolor = O_color;
        document.getElementById("strength_L").style.color = "#bbb";
        document.getElementById("strength_M").style.color = "#bbb";
        document.getElementById("strength_H").style.color = "#bbb";
    } else {
        var S_level = checkStrong(pwd);
        switch (S_level) {
            case 0:
                Lcolor = Mcolor = Hcolor = O_color;
                document.getElementById("strength_L").style.color = "#bbb";
                document.getElementById("strength_M").style.color = "#bbb";
                document.getElementById("strength_H").style.color = "#bbb";
            case 1:
                Lcolor = L_color;
                Mcolor = Hcolor = O_color;
                document.getElementById("strength_L").style.color = "#fff";
                document.getElementById("strength_M").style.color = "#bbb";
                document.getElementById("strength_H").style.color = "#bbb";
                break;
            case 2:
                Lcolor = Mcolor = M_color;
                Hcolor = O_color;
                document.getElementById("strength_M").style.color = "#fff";
                document.getElementById("strength_L").style.color = "#ff9d04";
                document.getElementById("strength_H").style.color = "#bbb";
                break;
            default:
                Lcolor = Mcolor = Hcolor = H_color;
                document.getElementById("strength_H").style.color = "#fff";
                document.getElementById("strength_L").style.color = "#90cb11";
                document.getElementById("strength_M").style.color = "#90cb11";
        }
    }
    document.getElementById("strength_L").style.background = Lcolor;
    document.getElementById("strength_M").style.background = Mcolor;
    document.getElementById("strength_H").style.background = Hcolor;
    return;
}



function checkPassword(str) {
    var cpTips = document.getElementById("checkPw");
    var cpExist = document.getElementById("checkPwExist");
    var uPw = /^([u4e00-u9fa5]|[ufe30-uffa0]|[a-za-z0-9_]){6,14}$/ //密码
    if (uPw.test(str)) {
        cpTips.innerHTML = "<span><\/span>";
        cpTips.className = "tips okTips mt10 fl db ";
        cpExist.style.display = "none";
        return true;
    } else {
        cpTips.innerHTML = "<span><\/span>密码长度或格式不正确";
        cpTips.className = "tips errTips mt10 fl db";
        cpExist.style.display = "none";
        return true;
    }
};

(function() {
    QB.SiteMenu.activeOn('#security-index');

    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

    var merchant_id = $.urlParam("_merchant_user_id_");
    
    var requestUrl = {};
    requestUrl = {
        setPassword: "http://enterprise.qbao.com/accountSetup/setTradPwd.html?_merchant_user_id_="+merchant_id,
        modifyPassword: "http://enterprise.qbao.com/accountSetup/changeTradePwd.html?_merchant_user_id_="+merchant_id,
        getBindMoblieAndUsername: "http://enterprise.qbao.com/accountSetup/getBindMoblieAndUsername.html?_merchant_user_id_="+merchant_id,
        verifyOldTradePwd: "http://enterprise.qbao.com/accountSetup/verifyOldTradePwd.html?_merchant_user_id_="+merchant_id
    };

    $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
        managerName: "安全中心",
        name: "修改交易密码"
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
            error: function() {
                //alert("请求错误！");
            }
        });
    };

    $("#psSb").bind('click', function() {
        if ($("#password").val().length == 0 || $("#repassword").val().length == 0) {
            $("#dialog_tip i").removeClass().addClass("fail");
            $(".confirm-info:eq(0)").html('("密码不能为空！');
            $("#dialog_tip").show();
            $(".shadow:eq(0)").show();
            return false;
        }
        if ($("#password").val() != $("#repassword").val()) {
            $("#dialog_tip i").removeClass().addClass("fail");
            $(".confirm-info:eq(0)").html('("请确认交易密码和确认密码是否一致！');
            $("#dialog_tip").show();
            $(".shadow:eq(0)").show();
            return false;
        }
        request(requestUrl.setPassword, {
                newPwd: $("#password").val(),
                confirmNewPwd: $("#repassword").val()
            },
            function(data) {
                if (data.success) {
                    $("#dialog_tip i").removeClass().addClass("success");
                    $(".confirm-info:eq(0)").html('<h2>恭喜！交易密码设置成功。</h2>');
                } else {
                    $("#dialog_tip i").removeClass().addClass("fail");
                    $(".confirm-info:eq(0)").html(data.message);
                }
                $("#dialog_tip").show();
                $(".shadow:eq(0)").show();
            });
    });

    //modify password
    $("#modifyPass").bind('click', function() {
        if ($("#currentPassword").val().length == 0) {
            $("#dialog_tip i").removeClass().addClass("fail");
            $(".confirm-info:eq(0)").html('当前交易密码不能为空！');
            $("#dialog_tip").show();
            $(".shadow:eq(0)").show();
            return false;
        }
        if ($("#currentPassword").val() === $("#password").val()) {
            $("#dialog_tip i").removeClass().addClass("fail");
            $(".confirm-info:eq(0)").html('新旧交易密码不能一致！');
            $("#dialog_tip").show();
            $(".shadow:eq(0)").show();
            return false;
        }
        if ($("#password").val().length == 0 || $("#repassword").val().length == 0) {
            $("#dialog_tip i").removeClass().addClass("fail");
            $(".confirm-info:eq(0)").html('交易密码不能为空！');
            $("#dialog_tip").show();
            $(".shadow:eq(0)").show();
            return false;
        }
        if ($("#password").val() != $("#repassword").val()) {
            $("#dialog_tip i").removeClass().addClass("fail");
            $(".confirm-info:eq(0)").html('请确认新交易密码和确认密码是否一致！');
            $("#dialog_tip").show();
            $(".shadow:eq(0)").show();
            return false;
        }


        request(requestUrl.verifyOldTradePwd, {
                oldPwd: $("#currentPassword").val(),
                newPwd: $("#password").val()
            },
            function(data) {
                if (data.success) {

                    request(requestUrl.modifyPassword, {
                            oldPwd: $("#currentPassword").val(),
                            newPwd: $("#password").val(),
                            confirmNewPwd: $("#repassword").val()
                        },
                        function(data) {
                            if (data.success) {
                                $("#dialog_tip i").removeClass().addClass("success");
                                $(".confirm-info:eq(0)").html('<h2>恭喜！交易密码设置成功。</h2>');
                            } else {
                                $("#dialog_tip i").removeClass().addClass("fail");
                                $(".confirm-info:eq(0)").html(data.message);
                            }
                            $("#dialog_tip").show();
                            $(".shadow:eq(0)").show();
                        });

                } else {
                    $("#dialog_tip i").removeClass().addClass("fail");
                    $(".confirm-info:eq(0)").html(data.message);
                    //alert(data.message);
                    $("#dialog_tip").show();
                    $(".shadow:eq(0)").show();
                }
            });



    });
    //get user name
    request(requestUrl.getBindMoblieAndUsername, {},
        function(data) {
            if (data.success) {
                $("#getUserName").html(data.data.username);
            } else {
                alert("请求错误！");
            }
        });


    $(".dialog-close,.confirm-btn").bind('click', function() {
        $("#dialog_tip").hide();
        $(".shadow:eq(0)").hide();
        if ($("#dialog_tip i").hasClass("success")) {
            window.location.href = "http://enterprise.qbao.com/security-index.htm?_merchant_user_id_="+merchant_id;
        }
    });
})(window);
