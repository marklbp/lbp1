(function() {
    QB.SiteMenu.activeOn('#security-index');

    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

    var merchant_id = $.urlParam("_merchant_user_id_");
    
    var requestUrl = {};
    requestUrl = {
        isBindMoblieOrSetTradePwd: "http://enterprise.qbao.com/accountSetup/isBindMoblieOrSetTradePwd.html?_merchant_user_id_="+merchant_id
    };

    $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
      name: "安全中心"
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

    //check bind phone & password
    request(requestUrl.isBindMoblieOrSetTradePwd, {}, function(data) {
        if (data.success) {
            $("#safeInfo span:first").html(data.data.username);
            if (data.data.mobile) {
                $("#bindPhone b").html(data.data.phone);
                $("#bindPhone").show();
            } else {
                $("#unbindPhone").show();
            }
            if (data.data.tradePwd) {
                $("#modifyPassword").show();
            } else {
                $("#setPassword").show();
            }
        } else {
            alert(data.message);
        }
    });


})(window);
