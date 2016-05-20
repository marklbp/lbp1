String.prototype.trim = function() {
    return this.replace(/(^\s+)|(\s+$)/g, "");
}

function getQueryStringByName(name) {
    var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
    if (result == null || result.length < 1) {
        return "";
    }
    return result[1];
}

QB.SiteMenu.activeOn('#refund-list');

$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
  managerName: "交易管理",
  name: "物流管理"
}));

jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

var merchant_id = $.urlParam("_merchant_user_id_");

var delivery = {};

delivery.listTemplate = function(data) {
    var list = [],
        len = data.length;
    if (len == 0) {
        list.push("<li>没有可查询的物流信息</li>");
    } else {
        for (var i = len - 1; i >= 0; i--) {
            list.push("<li><span>" + data[i]["time"] + "</span><em>" + data[i]["context"] + "</em></li>");
        }
    }
    return list.join("");
}

delivery.flow = function(codeID) { //@codeID
    $.ajax({
        type: "POST",
        url: "/express/detail.html?_merchant_user_id_="+merchant_id+"",
        data: {
            "expressNumber": getQueryStringByName("expressNumber")
        },
        dataType: "json",
        success: function(data) {
            var list = data.data;
            if (list && list.company.trim().length != 0) {
                $(".logistics-code>span:eq(0)").html(getQueryStringByName("orderId"));
                $(".logistics-code>span:eq(1)").html(list.company);
                $(".logistics-code>span:eq(2)").html(getQueryStringByName("expressNumber"));
                var temp = delivery.listTemplate(list.details);
                $("#logistics_flow>ul:eq(0)").append(temp);
                console.log(list.company.trim());
                if (list.status.trim() == "签收") {
                    $("#logistics_flow li:last>em").css("color", "#0d8bc5");
                }
            }
        }
    });
}
delivery.flow();
