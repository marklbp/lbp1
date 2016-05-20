(function() {
    var dialog = {};

    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

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
      name: "商家认证"
    }));

    var id = $.urlParam('_merchant_user_id_');

    function request(url, fn) {
        $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            async: false,
            success: function(data) {
                fn.call(this, data);
            },
            error: function() {
                alert("请求错误！");
            }
        });
    };

    var checkUrl = "http://enterprise.qbao.com/merchant/certify/validate.html";

    $("#confirmRule").bind('click', function() {
        request(checkUrl+"?type=0&_merchant_user_id_="+id, function(data) {

            if (data.success) {
                dialog.open($("#rule-tip"));
            } else {
                var d = data.data;
                for (var i = 0; i < d.length; i++) {
                    $("#rule li").eq(d[i]).addClass("no-pass");
                }
                dialog.open($("#rule"));
            }
        });

    });

    $("#passBtn").on("click", function() {
        request(checkUrl+"?type=1&_merchant_user_id_="+id, function(data) {
            if( data.success ) {
                window.location.href = "http://enterprise.qbao.com/merchant/certify/toAuthority.html?type=1&_merchant_user_id_="+id;
            }
        });
    });

    $("#passBtn1").on("click", function() {
        dialog.close($("#rule"));
        window.location.href = "http://enterprise.qbao.com/merchant/certify/toAuthority.html?type=1&_merchant_user_id_="+id;
    });

    $("#nextBtn").on("click", function() {
        dialog.close($("#rule-tip"));
        window.location.href = "http://enterprise.qbao.com/merchant/certify/toAuthority.html?type=0&_merchant_user_id_="+id;
    });

    $("#sureBtn").on("click", function() {
        dialog.close($("#rule-tip"));
        window.location.href = "http://enterprise.qbao.com/merchant/certify/toAuthority.html?type=1&_merchant_user_id_="+id;
    });

    $("#closeTip").on("click", function() {
        dialog.close($("#rule-tip"));
    });

    $("#confirmBtn,#close").bind('click', function() {
        dialog.close($("#rule"));
    });

    $("#errorClose,#errorBtn").on("click", function() {
        dialog.close($("#error"));
    });

    var ruleEvent = {
        $order: $("#order"),
        $turnCount: $("#turnCount"),
        $productCount: $("#productCount"),
        $money: $("#money"),
        $count:$("#count"),
        $product:$("#product"),
        $orderList: $("#orderList"),
        $money1: $("#money1"),
        ruleUrl: "http://enterprise.qbao.com/merchant/certify/getCompanyCetifyQulification.html",
        ruleInit: function() {
            $.ajax({
                url: ruleEvent.ruleUrl+"?type=0&_merchant_user_id_="+id,
                type: "POST",
                dataType: "json",
                success: function(data) {
                    if( data.success ){
                        ruleEvent.$order.html(parseInt(data.data.minTotalCount));
                        ruleEvent.$turnCount.html(parseInt(data.data.minTotalAmount));
                        ruleEvent.$productCount.html(parseInt(data.data.minSellNum));
                    }
                },
                error: function() {
                    alert("请求错误！");
                }
            });

            $.ajax({
                url: ruleEvent.ruleUrl+"?type=1&_merchant_user_id_="+id,
                type: "POST",
                dataType: "json",
                success: function(data) {
                    if( data.success ){
                        ruleEvent.$money.html(parseInt(data.data.gurantyAmount));
                    }
                },
                error: function() {
                    alert("请求错误！");
                }
            });

            $.ajax({
                url: ruleEvent.ruleUrl+"?type=2&_merchant_user_id_="+id,
                type: "POST",
                dataType: "json",
                success: function(data) {
                    if( data.success ){
                        ruleEvent.$orderList.html(parseInt(data.data.minTotalCount));
                        ruleEvent.$count.html(parseInt(data.data.minTotalAmount));
                        ruleEvent.$product.html(parseInt(data.data.minSellNum));
                        ruleEvent.$money1.html(parseInt(data.data.gurantyAmount));
                    }
                },
                error: function() {
                    alert("请求错误！");
                }
            });
        }
    };

    ruleEvent.ruleInit();

})();
