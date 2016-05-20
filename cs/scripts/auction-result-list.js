
(function() {
    'use strict';

    $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
      managerName: "雷拍管理",
       name: "竞拍结果查询"
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
    //tip
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

    function check(name) {
        return name ? name : "";
    };

    function getT(s) {
        return s.toString().length == 2 ? s : "0" + s
    }

    function timeFormat(time) {
        if (!time) return "--";
        var d = new Date(time),
            day = [d.getFullYear(), getT(d.getMonth() + 1), getT(d.getDate())],
            times = [getT(d.getHours()), getT(d.getMinutes()), getT(d.getSeconds())];
        return day.join("-") + " " + times.join(":");
    }

    function getKey(pageID) {
        var reg2 = /^[0-9]+$/,
            value = $("#goodsID").val().trim();
        if (!reg2.test(value) && value.length != 0) {
            tip("请输入正确的商品ID！");
            return false;
        }
        page.getList({
            pageID: pageID,
            applyId: $("#applyId").val(),
            pageSize: page.len
        });
    }

    function setM(money) {
        var reg = /(\d{1,3})(?=(\d{3})+(?:$|\.))/g;
        return money.toString().replace(reg, "$1,");
    };
    var getDetialId = function(name) {
        var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
        if (result == null || result.length < 1) {
            return "";
        }
        return result[1];
    };

    function getS(state) {
        switch (state) {
            case 0:
                return "待开拍";
                break;
            case 1:
                return "竞拍中";
                break;
            case 2:
                return "已结束";
                break;
            case 3:
                return "已结束";
                break;
            default:
                return "";
                break;
        }
    };

    function result(state, result) {
        switch (state) {
            case -1:
                return "超卖";
                break;
            case 0:
                return "全部拍卖";
                break;
            case 1:
                return "部分拍卖";
                break;
            case 2:
                var r = result;
                if (r == 2 || r == 3) {
                    return "流拍";
                } else {
                    return "--"
                }
                break;
            default:
                return "--";
                break;
        }
    };
    var page = {}
    page.url = {
        getproduct: "http://paipai.qbao.com/manageAucInfo/listAuctionInfoDetails.html?_merchant_user_id_="+merchant_id
    };
    page.len = 10;
    page.pageNum = 0;
    page.current = function() {
        return $("#page").attr("currentpage");
    }
    page.next = function() { //next
        var currentPage = parseInt(page.current()),
            totalPage = parseInt(page.totalPage());
        if (totalPage > currentPage) {
            currentPage = currentPage + 1;
            getKey(currentPage);
        } else {
            return false;
        }
    }

    page.prev = function() { //prev
        var currentPage = parseInt(page.current());
        if (currentPage > 1) {
            currentPage = currentPage - 1;
            getKey(currentPage);
        } else {
            return false;
        }
    }

    page.random = function(pageID) { //random page
        getKey(pageID);
    }

    page.totalPage = function() {
        return page.pageNum;
    }
    page.centerPages = function(pageID) {
        var centerPages = [];
        centerPages.push("<em>" + (pageID - 1) + "</em>");
        centerPages.push("<span>" + pageID + "</span>");
        centerPages.push("<em>" + (pageID + 1) + "</em>");
        return centerPages.join("");
    }
    page.outPages = function(pageID, setLen) {
        var outPages = [];
        if (setLen == undefined) {
            setLen = 4;
        }
        for (var i = 1; i <= setLen; i++) {
            if (pageID == i) {
                outPages.push("<span>" + i + "</span>");
            } else {
                outPages.push("<em>" + i + "</em>");
            }
        }
        return outPages.join("");
    }
    page.rightPages = function(pageID, total) {
        var rightPages = [];
        for (var i = total - 3; i <= total; i++) {
            if (pageID == i) {
                rightPages.push("<span>" + i + "</span>");
            } else {
                rightPages.push("<em>" + i + "</em>");
            }
        }
        return rightPages.join("");
    }

    page.init = function(pageID) {
        var perpage = [],
            totalPage = page.totalPage();

        perpage.push("<b>prev</b>");
        if (totalPage < 6) {
            perpage.push(page.outPages(pageID, totalPage));
        } else {
            if (pageID <= 3) {
                perpage.push(page.outPages(pageID));
                perpage.push("<i>...</i>");
                perpage.push("<em>" + totalPage + "</em>");
            } else if (pageID >= totalPage - 2) {
                perpage.push("<em>1</em>");
                perpage.push("<i>...</i>");
                perpage.push(page.rightPages(pageID, totalPage));
            } else {
                perpage.push("<em>1</em>");
                perpage.push("<i>...</i>");
                perpage.push(page.centerPages(pageID));
                perpage.push("<i>...</i>");
                perpage.push("<em>" + totalPage + "</em>");
            }
        }
        perpage.push("<b>next</b>");

        if (totalPage <= 1) {
            $("#page").hide()
        } else {
            $("#page").show().html(perpage.join(""));
        }

    }

    page.getList = function(option) { //@pageID
        var tem_position = $('#table_list table');
        if (option.pageID == undefined || option.pageID == "") {
            tem_position.empty().append('<tr><td colspan="7" style="padding:50px 0;">没有关联商品</td></tr>');
            return false;
        }

        $.ajax({
            type: "POST",
            url: page.url.getproduct,
            dataType: "json",
            data: {
                pageSize: option.pageSize,
                applyId: option.applyId,
                pageNum: option.pageID
            },
            success: function(data) {
                if (data.success) {
                    var d = data.data.aaData,
                        total = data.data.itotalRecords,
                        pTemp = $("#tableList").val(),
                        pList = [];
                    if (total) {
                        for (var i = 0; i < d.length; i++) {
                            var even = "",
                                data = "",
                                dropDownDesc = "";
                            even = (i + 1) % 2 == 0 ? "even" : "";
                            var lab = "",
                                len = d[i].goodsInfoView.labelName.length;
                            for (var j = 0; j < len; j++) {
                                lab += ("<span>" + d[i].goodsInfoView.labelName[j] + "</span>");
                                if (j < len - 1) {
                                    lab += "<em>|</em>";
                                }
                            }
                            pList.push(pTemp.template(even, d[i].auctionNum, d[i].goodsInfoView.mainImg, d[i].goodsInfoView.productName, d[i].goodsId, lab, timeFormat(d[i].startTime), timeFormat(d[i].endTime), getS(d[i].aucStatus), result(d[i].result, d[i].aucStatus), d[i].auctionNum, merchant_id));

                        }
                    } else {
                        tem_position.empty().append('<tr><td colspan="7" style="padding:50px 0;">无数据</td></tr>');
                        $("#page").hide().html("");
                        return false;
                    }
                    page.pageNum = total % page.len == 0 ? parseInt(total / page.len) : parseInt(total / page.len) + 1;
                    tem_position.empty().append(pList.join(""));
                    $("#page").attr({
                        "currentpage": option.pageID
                    });
                    page.init(option.pageID);
                } else {
                    tip(data.message);
                }
            },
            error: function(data) {
                tip("请求失败");
            }
        });
    }

    page.getList({
        applyId: getDetialId("applyId"),
        pageSize: page.len,
        pageID: 1
    });

    $("#page").delegate("em", "click", function() {
        var pageID = parseInt($(this).html());
        page.random(pageID);
        page.init(pageID);
        $("#page").attr("currentpage", pageID)
    });
    $("#page").delegate("b:first", "click", function() {
        var pageID = parseInt($("#page").attr("currentpage"));
        page.prev(pageID);
    });
    $("#page").delegate("b:last", "click", function() {
        var pageID = parseInt($("#page").attr("currentpage"));
        page.next(pageID);
    });

    QB.SiteMenu.activeOn('#auction-list');

})();
