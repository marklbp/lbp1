(function() {
    'use strict';

    $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
        managerName: "商家管理",
        name: "店铺信息"
    }));

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

    function check(value) {
        if (value) {
            return value;
        } else {
            return "";
        }
    }

    function getInformation() {
        var url = "http://enterprise.qbao.com/company/merchant/shop/info/get.html",
            t = $("#information").val();
        $.ajax({
            type: "POST",
            url: url,
            dataType: "json",
            success: function(data) {
                console.log(1);
                if (data.data) {
                    var d = data.data;
                    $("#companyInfor").html(t.template(check(d.companyName), check(d.shopName), check(d.contactUser), check(d.contactPhone), check(d.accountNum), check(d.bankName), check(d.companyName)));
                }
            },
            error: function(message) {
                tip(message);
            }
        });
    }
    getInformation();
})(window)

QB.SiteMenu.activeOn('#shop-finish');
