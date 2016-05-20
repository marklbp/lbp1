
(function() {
    'use strict';

    $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
      managerName: "雷拍管理",
      name: "雷拍详情"
    }));

    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

    var merchant_id = $.urlParam("_merchant_user_id_");

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
        $("#error_tip").css("margin-left", -h / 2).html(message).show();
        setTimeout(function() {
            $("#error_tip").hide().html("");
        }, 3000);
    };

    function getT(s) {
        return s.toString().length == 2 ? s : "0" + s
    }

    function timeFormat(time) {
        if (time.length == 0) {
            return {
                date: "",
                time: "",
                allTime: ""
            }
        }
        var d = new Date(time),
            day = [d.getFullYear(), getT(d.getMonth() + 1), getT(d.getDate())],
            times = [getT(d.getHours()), getT(d.getMinutes()), getT(d.getSeconds())];
        return {
            date: day.join("-"),
            time: times.join(":"),
            allTime: day.join("-") + " " + times.join(":")
        }
    }

    function setHeng(s) {
        if (s) return s;
        else return "--";
    }

    function getInfor() {

        var getDetialId = function(name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return result[1];
        };

        function check(name) {
            return name ? name : "";
        };

        return (function() {
            $.ajax({
                type: "POST",
                url: "http://paipai.qbao.com/manageAucApply/getAuctionInfoFromApply.html?_merchant_user_id_"+merchant_id,
                dataType: "json",
                data: {
                    applyRecordId: getDetialId("applyRecordId")
                },
                success: function(data) {
                    if (data.success) {
                        var part_one = $("#infor_one").val(),
                            //part_two = $("#infor_two").val(),
                            part_three = $("#infor_three").val(),
                            part_four = $("#infor_four").val(),
                            d = data.data,
                            detailP = $("#auctionDetail"),
                            have = 0;
                        var actDetail = {
                                id: check(d.applyRecord.id),
                                status: check(d.applyRecord.statusDesc),
                                time: timeFormat(check(d.applyRecord.applyTime)).allTime,
                                startP: (check(d.applyRecord.startPrice)/100).toFixed(2),
                                lowerP: (check(d.applyRecord.lowestPrice)/100).toFixed(2),
                                //aucStatus: check(d.aucStatusDesc),
                                //periodTime: check(d.periodTime.date + " " + d.periodTime.dropDownDesc),
                                //begin: timeFormat(check(d.aucStartTime)).allTime,
                                reason: check(d.applyRecord.reason),
                                applyTime: timeFormat(check(d.applyRecord.applyTime)).allTime,
                                checkTime: timeFormat(check(d.applyRecord.checkTime)).allTime,
                                num: check(d.applyRecord.goodsNum)
                            },
                            productDetail = {
                                id: check(d.goodsId),
                                name: check(d.productName),
                                type: check(d.specification),
                                label: check(d.labelName),
                                photo: check(d.filePath),
                                des: check(d.detailDesc),
                                mainPath: d.mainImg
                            };
                        var imgPath = [];
                        for (var h = 0; h < productDetail.photo.length; h++) {
                            if (productDetail.photo[h] == productDetail.mainPath && have == 0) {
                                imgPath.push('<li><img src="' + productDetail.photo[h] + '" /><span></span></li>');
                                have = 1;
                            } else {
                                imgPath.push('<li><img src="' + productDetail.photo[h] + '" /></li>');
                            }
                        }
                        detailP.find("li:eq(0)").append(part_one.template(actDetail.id, actDetail.applyTime, actDetail.num, actDetail.startP, actDetail.lowerP));
                        //detailP.find("li:eq(1)").append(part_two.template(actDetail.aucStatus, actDetail.periodTime, actDetail.begin));
                        detailP.find("li:eq(1)").append(part_three.template(productDetail.id, productDetail.name, productDetail.type, productDetail.label, imgPath.join(""), productDetail.des));
                        detailP.find(">ul>li:eq(2)").append(part_four.template(actDetail.status, setHeng(actDetail.checkTime), setHeng(actDetail.reason)));
                    } else {
                        tip("信息加载失败");
                    }
                },
                error: function() {
                    tip("信息加载失败");
                }
            });
        })();
    };

    getInfor();
    QB.SiteMenu.activeOn('#auction-list');
})();
