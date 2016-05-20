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

jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

var merchant_id = $.urlParam("_merchant_user_id_");

// (function() {
//     //header
//     function getComp() {
//         $.ajax({
//             type: "get",
//             async: true,
//             url: 'http://enterprise.qbao.com/api/company/merchant/isMerchant/jsonp.html?_merchant_user_id_='+merchant_id,
//             dataType: 'jsonp',
//             jsonp: "jsonpCallback",
//             jsonpCallback: 'success_jsonpCallback',
//             success: function(record) {
//                 if (record.data) {
//                     $("#business-nav-advertise").attr("href", "#");
//                 } else {
//                     $(".site-header:eq(0)").show();
//                 }
//             },
//             error: function(data) {
//                 //todo
//             }
//         });
//     };
//     getComp();
// })();
(function() {

    $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
      managerName: "商品管理",
      name: "商品发布"
    }));

    $("#business-nav-goods").addClass("hover");
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
    };

    function getQueryStringByName(name) {
        var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
        if (result == null || result.length < 1) {
            return "";
        }
        return result[1];
    };

    var dialog = {},
        form = {},
        fee = {};

    dialog.setPosition = function(obj) {
        if (!obj) return false;
        var height = obj.height();
        obj.css("margin-top", -height / 2);
    };

    dialog.open = function(obj) {
        dialog.setPosition(obj);
        obj.show();
        $(".shadow:eq(0)").show();
    };
    dialog.close = function(obj) {
        obj.hide();
        $(".shadow:eq(0)").hide();
    };

    form.url = {
        head: "http://goods.qbao.com",
        getHotTip: "/goodsLabel/getSys.html?_merchant_user_id_="+merchant_id,
        add: "/goodsLabel/addUserLabel.html?_merchant_user_id_="+merchant_id,
        search: "/goodsLabel/getLabelByKey.html?_merchant_user_id_="+merchant_id,
        getFee: "/goodsProduct/postageTemplate.html?_merchant_user_id_="+merchant_id,
        upload: "/photo/upload.html?_merchant_user_id_="+merchant_id,
        addprodcut: "/goodsProduct/doSubmit.html?_merchant_user_id_="+merchant_id,
        getProduct: "/goodsProduct/info.html?_merchant_user_id_="+merchant_id,
        xhedit: "/photo/xhEditorUpload.html?_merchant_user_id_="+merchant_id
    }

    form.temp = {
        "deleteTemp": "<div tipID='{id}' class='tag-name tag-delete'><span><b>{tagName}</b><em></em></span></div>",
        "temp": "<div id='{id}' class='tag-name {option}'><span><i></i><b>{tagName}</b></span></div>"
    };
    form.time = null;
    form.tip = {
        addTip: function(tipName, id, temp) {
            return temp.template(id, tipName);
        },
        deleteTip: function(id, tipIdList) {
            var len = tipIdList.length;
            for (var i = 0; i < len; i++) {
                if (tipIdList[i] == id) {
                    return true;
                }
            }
            return false;
        },
        recommendTip: function(labels) {
            var tipArr = [],
                tipId = [];
            $.ajax({
                type: "POST",
                url: form.url.head + form.url.getHotTip,
                dataType: "json",
                success: function(data) {
                    if (data.data) {
                        var d = data.data,
                            len = d.length;

                        if (!labels) {
                            for (var i = 0; i < len; i++) {
                                tipArr.push(form.temp.temp.template(d[i].id, "option-add", d[i].labelName));
                                tipId.push(d[i].id);
                            }
                        } else {
                            var k = labels.split(","),
                                kLen = k.length;

                            for (var i = 0; i < len; i++) {
                                for (var h = 0; h < kLen; h++) {
                                    if (k[h] == d[i].id) {
                                        tipArr.push(form.temp.temp.template(d[i].id, "option-complete", d[i].labelName));
                                        break;
                                    }
                                }
                                if (!tipArr[i]) {
                                    tipArr.push(form.temp.temp.template(d[i].id, kLen >= 3 ? "option-disabled" : "option-add", d[i].labelName));
                                }

                                tipId.push(d[i].id);
                            }
                        }
                        $(".tagList:eq(0)").append(tipArr.join(""));
                        $("#tipListId").val(tipId.join("-"));
                    }
                }
            });
        },
        addedTip: function() {
            var pid = [];
            $("#addTag").find(".tag-delete").each(function(i) {
                pid.push($(this).attr("tipID"));
            });
            return pid;
        },
        add: function(name, fn) {
            $.ajax({
                type: "POST",
                url: form.url.head + form.url.add,
                dataType: "json",
                data: {
                    labelName: name
                },
                success: function(data) {
                    if (data.data) {
                        fn.call(this, data.data);
                    } else {
                        tip(data.message);
                    }
                }
            });
        },
        search: function(key, fn) {
            $.ajax({
                type: "POST",
                url: form.url.head + form.url.search,
                dataType: "json",
                data: {
                    key: key
                },
                success: function(data) {
                    if (data.data) {
                        fn.call(this, data.data);
                    } else {
                        tip(data.message);
                    }
                }
            });
        }
    };

    fee.getList = function() {
        var feeTemp = '<tr fid="{id}"><td width="10%"><input type="checkbox" name="checkbox" /></td><td width="45%">{type}</td><td>{price}</td></tr>',
            feeList = [];
        $.ajax({
            type: "POST",
            url: form.url.head + form.url.getFee,
            dataType: "json",
            success: function(data) {
                if (data.success) {
                    var list = data.data;
                    for (var i = 0; i < list.length; i++) {
                        feeList.push(feeTemp.template(list[i].id, list[i].templateName, list[i].postage));
                    }
                    $(".template-list:eq(0) tbody").html(feeList.join(""));
                    $(".btn-wrap:eq(0)").show();
                    $("#allCheck").attr("disabled", false)
                }
            }
        });
    };

    //upload

    $("#filedata").fileupload({
        url: form.url.head + form.url.upload,
        dataType: 'json'
    }).on('fileuploadprogressall', function(e, data) {
        //todo

    }).on('fileuploaddone', function(e, data) {
        //todo
        console.log(data);
        if (data.result.success) {
            var d = data.result.data,
                t = $("#addImg").val();
            $(this).parent().before(t.template("have-banner", 0, d, "hide"));
            if ($(this).parent().parent().find("li").size() >= 10) {
                $(this).parent().hide();
            }
        } else {
            tip("上传错误!");
        }
    }).on('fileuploadfail', function(e, data) {
        tip("上传错误!");
    });

    // 从推荐中添加 tip
    $("#productForm").delegate(".option-add", 'click', function() {
        var len = $("#productForm").find(".tag-delete").size(),
            name = $(this).find("b").html();
        $(this).addClass("option-complete").removeClass("option-add");
        $("#addTag").append(form.tip.addTip(name, $(this).attr("id"), form.temp.deleteTemp));
        if (len >= 2) {
            $("#productForm").find(".option-add").addClass("option-disabled").removeClass("option-add");
        }
    });
    // 手动输入添加 tip
    $("#productForm").delegate(".addtip-btn", 'click', function() {
        var len = $("#productForm").find(".tag-delete").size();
        if (len < 3) {
            var reg = /^[\/0-9a-zA-Z\u4e00-\u9fa5]+$/;
            if (!reg.test($("#tipInput").val())) {
                tip("请输入正确格式的标签！");
                return false;
            }
            form.tip.add($("#tipInput").val().trim(), function(d) {

                var t = form.tip.addTip(d.labelName, d.id, form.temp.deleteTemp),
                    list = form.tip.addedTip();
                if ($("#" + d.id)[0]) {
                    $("#" + d.id).addClass("option-complete").removeClass("option-add");
                }

                if (form.tip.deleteTip(d.id, list)) {
                    tip("你添加的标签已存在，请重新填写！");
                    return false;
                }

                $("#addTag").append(t);
                $(".addtip-btn").addClass("disable-btn").removeClass("use-btn").attr("disabled", true);

                if ($("#productForm").find(".tag-delete").size() == 3) {
                    $("#productForm").find(".option-add").addClass("option-disabled").removeClass("option-add");
                }

                $("#tipInput").val("");
            });
        }
    });
    //添加模糊匹配
    $("#productForm").delegate("#tipInput", 'focus', function() {
        var len = $("#searchList dd").size();
        $("#searchList").css({
            "top": $(this).offset().top + 29,
            "left": $(this).offset().left
        })
        if (len) {
            $("#searchList").show();
        }
    });
    $("#productForm").delegate("#tipInput", 'blur', function() {
        form.time = setTimeout(function() {
            $("#searchList").hide();
        }, 0);
    });
    $("#searchList").hover(function() {
        $("#tipInput").blur();
        clearTimeout(form.time);
        $("#searchList").show();
    }, function() {
        $("#searchList").hide();
    })
    $("#searchList").delegate("dd", 'click', function() {
        $("#tipInput").val($(this).html()).attr("tid", $(this).attr("tid"));
        $("#searchList").hide();
        $(".addtip-btn").addClass("use-btn").removeClass("disable-btn").attr("disabled", false);
    });
    // input 填写 tip
    $("#productForm").delegate("#tipInput", 'keyup', function() {
        var key = $(this).val().trim(),
            len = $("#productForm").find(".tag-delete").size();
        clearTimeout(form.time);
        form.time = setTimeout(function() {
            form.tip.search(key, function(d) {
                var len = d.length,
                    ddArr = [];
                if (len == 0) {
                    $("#searchList").hide();
                    return;
                }
                for (var i = 0; i < len; i++) {
                    ddArr.push("<dd tid='" + d[i].id + "'>" + d[i].labelName + "</dd>");
                }
                $("#searchList").html(ddArr.join("")).show();
            });
        }, 500);

        if ($(this).val().trim().length != 0) {
            if (len < 3) {
                $(".addtip-btn").removeClass("disable-btn").addClass("use-btn").attr("disabled", false);
            }
        } else {
            $(".addtip-btn").addClass("disable-btn").removeClass("use-btn").attr("disabled", true);
        }
    });

    //tip 删除
    $("#productForm").delegate(".tag-delete", 'click', function() {
        var tipId = $(this).attr("tipID");
        var k = form.tip.deleteTip(tipId, $("#tipListId").val().split("-"));
        $(this).remove();
        if (k) {
            $("#" + tipId).addClass("option-add").removeClass("option-complete")
        }
        $("#productForm").find(".option-disabled").addClass("option-add").removeClass("option-disabled");
    });

    //图片操作
    $("#productForm").delegate(".product-option > em", 'click', function() {
        var p = $(this).parent().parent();
        $(this).parents("li").find("[type='1']").addClass("have-banner").attr("type", 0);
        $(this).parents("li").find(".upload-hot").hide();
        p.find(".upload-hot").show();
        $(this).parents("li").removeClass("have-banner");
        p.attr("type", 1);
    });

    $("#productForm").delegate(".product-option > span", 'click', function() {
        var p = $(this).parent().parent();
        p.remove();
        $("#imgfile").parent().show();
    });

    $("#productForm").delegate("#productDescription", 'keyup', function() {
        var p = $(this).next(".description-size").find("span");
        p.html($(this).val().length);
    });

    //运费模板
    $("#productForm").delegate(".add-template>a", 'click', function(e) {
        var dialogBox = $(".dialog").eq(0);
        dialog.setPosition(dialogBox);
        dialog.open(dialogBox);
        e.preventDefault()
    });

    $(".dialog-close,.cancle-btn").bind("click", function() {
        $("#mainContent input[name='checkbox']").prop("checked", false);
        var dialogBox = $(".dialog").eq(0);
        dialog.close(dialogBox);
    });

    $("#confirmBtn").bind('click', function() {
        var list = $("#mainContent >.template-list input:checked");
        if (list.size() == 0) {
            tip("请选择运费模板！");
        } else {
            var feeList = [],
                fid = [];
            for (var i = 0; i < list.size(); i++) {
                var pk = list.eq(i).parent().parent();
                fid.push(pk.attr("fid"));
                feeList.push("<li>" + pk.find("td:eq(1)").html() + ":&nbsp;" + pk.find("td:eq(2)").html() + "  钱宝币</li>");
            }
            $(".fee-template:eq(0)").html(feeList.join(""));
            $("#selectFee").val(fid.join(","));
            $("#mainContent input[name='checkbox']").prop("checked", false);
            var dialogBox = $(".dialog").eq(0);
            dialog.close(dialogBox);
        }
    });

    $("#allCheck").bind("change", function() {
        var o = $("#mainContent input[name='checkbox']");
        if ($(this).prop("checked")) {
            o.prop("checked", true);
        } else {
            o.prop("checked", false);
        }
    })

    //添加商品型号
    $("#productForm").delegate("#addType", 'click', function() {
        var size = "请输入颜色、尺寸等属性，限100字",
            price = "请填写商品单价",
            num = "不填写默认为999";
        $("#productForm .default-product-type").hide();
        if ($("#productForm .add-product").size() == 0) {
            price = $(".default-product-type input[name='productPrice']").val();
            num = $(".default-product-type input[name='productNum']").val();
        }
        $(this).parent().before($("#addProduct").val().template(size, price, num));
    });

    //add-product
    $("#productForm").delegate(".add-product >em", 'click', function() {
        if ($("#productForm > .add-product").size() == 1) {
            var p = $("#productForm > .add-product").find("input[name='productPrice']").val(),
                n = $("#productForm > .add-product").find("input[name='productNum']").val();
            $(".default-product-type input[name='productPrice']").val(p);
            $(".default-product-type input[name='productNum']").val(n);
        }
        $(this).parent().remove();
        var len = $("#productForm > .add-product").size();
        if (len == 0) {
            $(".default-product-type").show();
        }
    });

    $("#productForm").delegate("input[type='text']", 'focus', function() {
        if ($(this).val().trim() == $(this).attr("defaultV").trim()) {
            $(this).val("");
        }
    });
    $("#productForm").delegate("input[type='text']", 'blur', function() {
        if ($(this).val().trim().length == 0) {
            $(this).val($(this).attr("defaultV"));
        }
    });
    $("#productForm").delegate("input[name='productPrice']", 'blur', function() {
        var v = $(this).val().trim(),
            dv = $(this).attr("defaultV").trim().length;
        var reg = /^[0-9]+?[0-9]*$/;
        if (!reg.test(v) && v.length != 0 && v.length != dv) {
            tip("请填写正确格式的价格！");
            $(this).focus();
            return false;
        }else if ( v*1 == 0 ) {
            tip("价格不可以为0！");
            $(this).focus();
            return false;
        };
    });
    $("#productForm").delegate("input[name='productNum']", 'blur', function() {
        var v = $(this).val().trim(),
            dv = $(this).attr("defaultV").trim().length;
        var reg = /^[0-9]+?[0-9]*$/;
        if (!reg.test(v) && v.length != 0 && v.length != dv) {
            tip("请填写正确格式的库存！");
            $(this).focus();
            return false;
        }
    });

    //编辑器
    var toolArr = [
        'Blocktag', 'Fontface',
        'FontSize', 'Bold', 'Italic', 'Underline', 'Strikethrough',
        'FontColor', 'BackColor', 'SelectAll', 'Removeformat', 'Align',
        'List', 'Outdent', 'Indent', 'Img'
    ];
    var xheditor = $("#description").xheditor({
        height: 200,
        tools: toolArr.join(','),
        skin: 'default',
        upMultiple: true,
        cleanPaste: 3,
        upImgUrl: form.url.head + form.url.xhedit,
        upImgExt: 'jpg,jpeg,gif,bmp,png,JPG,JPEG,GIF,BMP,PNG',
        onUpload: function(msg) {
            console.warn(msg);
        },
        html5Upload: false
    });
    xheditor.getSource();

    $("#productForm").delegate("#publish", 'click', function() {
        var regT = /\s/,
            pNames = $("#productForm input[name='productName']").val().trim(),
            pPrice = $("#productForm input[name='productPrice']").val().trim(),

        if (pNames == $("#productForm input[name='productName']").attr("defaultV")) {
            tip("请填写正确格式的商品名称,限30字！");
            return false;
        }
        if ( pPrice == $("#productForm input[name='productPrice']").attr("defaultV") ) {
            tip("请填写商品单价！");
            return false;
        };
        if ($("#productForm .tag-delete").size() == 0) {
            tip("至少添加一个商品标签");
            return false;
        }
        if ($("#productForm .fee-template>li").size() == 0) {
            tip("请选择一条运费！");
            return false;
        }
        if ($("#productForm .product-list > li").size() < 2) {
            tip("请上传图片");
            return false;
        }
        if ($("#productForm .product-list > li[type='1']").size() == 0) {
            tip("请设置上传图片封面");
            return false;
        }
        if ($("#description").val().length > 5000) {
            tip("超过最大限制5000！");
            return false;
        }
        //$(this).attr("disabled", true);
        var labels = [],
            photos = [],
            skus = [];

        $("#productForm .tag-delete").each(function(i) {
            labels.push($(this).attr("tipID"));
        });

        $("#productForm .product-list > .imglist").each(function(i) {
            photos[i] = {
                "sortNum": i,
                "filePath": $(this).find("img").attr("src"),
                "imgType": Number($(this).attr("type"))
            }
        });

        if ($("#productForm .add-product").size() != 0) {
            var num = $("#productForm .add-product input[name='productNum']"),
                size = $("#productForm .add-product input[name='productSize']");
            $("#productForm .add-product input[name='productPrice']").each(function(i) {
                skus[i] = {
                    "skuPrice": $(this).val().trim() == $(this).attr("defaultV") ? "" : $(this).val(),
                    "specification": size.eq(i).val() == size.eq(i).attr("defaultV") ? "" : size.eq(i).val(),
                    "stockNum": num.eq(i).val() == num.eq(i).attr("defaultV") ? "" : num.eq(i).val(),
                    "skuId": $($('.add-product')[i]).data('skuId') || ''
                    // "skuId": $("#skuid").val().split(",")[i]
                }
                if (i === 0 && skus[i].skuId === '') {
                    skus[i].skuId = $('#skuid').val();
                }
            });
        } else {
            var pri = $("#productForm input[name='productPrice']"),
                num = $("#productForm input[name='productNum']");
            skus[0] = {
                "skuPrice": pri.val().trim() == pri.attr("defaultV") ? "" : pri.val().trim(),
                "specification": "",
                "stockNum": num.val().trim() == num.attr("defaultV") ? "" : num.val().trim(),
                "skuId": $("#skuid").val()
            };
        }
        $.ajax({
            type: "POST",
            url: form.url.head + form.url.addprodcut,
            dataType: "json",
            data: {
                spuName: $("#productForm input[name='productName']").val().trim(),
                skus: JSON.stringify(skus),
                postages: JSON.stringify($("#selectFee").val().split(",")),
                filmPhotos: JSON.stringify(photos),
                labels: JSON.stringify(labels),
                advertorial: $("#productDescription").val(),
                detailDesc: $("#description").val(),
                spuId: getQueryStringByName("spuId").trim() == '' ? '' : getQueryStringByName("spuId")
            },
            success: function(data) {
                //todo
                if (data.success) {
                    $(this).attr("disabled", true);
                    window.location.href = form.url.head + "/goodsProduct/toResult.html?_merchant_user_id_="+merchant_id+"&auditStatus=" + data.data;
                } else {
                    $(this).attr("disabled", false);
                    tip(data.message);
                }

            },
            error: function(data) {
                tip("发布出问题！");
                $(this).attr("disabled", false);
            }
        });
    });

    function checkNull(name) {
        if (name) {
            return true;
        } else {
            return false;
        }
        if (name.length == 0) {
            return false;
        } else {
            return true;
        }
    }

    function getProductInformation() {
        $.ajax({
            type: "POST",
            url: form.url.head + form.url.getProduct,
            dataType: "json",
            data: {
                "spuId": getQueryStringByName("spuId")
            },
            success: function(data) {
                if (data.success) {
                    var d = data.data;
                    //数据生成
                    $("input[name='productName']").val(d["spuName"]);
                    $("#productDescription").val(d["advertorial"] ? d["advertorial"] : "");
                    $("#description").val(d["detailDesc"] ? d["detailDesc"] : "");
                    //labels
                    var labels = d["labels"],
                        labelsId = [];
                    for (var i = 0; i < labels.length; i++) {
                        labelsId.push(labels[i].id);
                        $("#addTag").append(form.temp.deleteTemp.template(labels[i].id, labels[i].labelName));
                    }
                    //fee template
                    var fid = [],
                        feeList = [],
                        //postage = d["postageTemplate"];
                        postage = d["postageTemplateNew"];
                    if ( postage ) {
                        for (var j = 0; j < postage.length; j++) {
                            fid.push(postage[j].id);
                            feeList.push("<li>" + postage[j].templateName + ":&nbsp;" + postage[j].postage + "  钱宝币</li>");
                        }
                    };
                    $("#selectFee").val(fid.join(","));
                    $(".fee-template:eq(0)").html(feeList.join(""));
                    //图片列表
                    var photo = $("#addImg").val(),
                        photoList = d["photos"];
                    for (var v = 0; v < photoList.length; v++) {
                        $("#filedata").parent().before(photo.template(photoList[v].imgType == 1 ? "" : "have-banner", photoList[v].imgType, photoList[v].filePath, photoList[v].imgType == 1 ? "" : "hide"));
                    }
                    //规格参数
                    var cs = d["skus"],
                        skuid = [];
                    if (cs.length > 1 || checkNull(cs[0].specification)) {
                        $(".default-product-type").hide();
                        for (var l = 0; l < cs.length; l++) {
                            var propri = !cs[l].skuPrice ? "请填写商品单价" : cs[l].skuPrice;
                            $("#addType").parent().before($("#addProduct").val().template(cs[l].specification, propri, cs[l].stockNum));
                            $($('.add-product')[l]).data('skuId', cs[l].id);
                            skuid.push(cs[0].id);
                        }
                    } else {
                        $(".default-product-type input[name='productPrice']").val(!cs[0].skuPrice ? $(this).attr("defaultV") : cs[0].skuPrice);
                        $(".default-product-type input[name='productNum']").val(cs[0].stockNum);
                        $("#skuid").val(cs[0].id);
                    }

                    //推荐生成
                    form.tip.recommendTip(labelsId.join(","));
                    //运费模板
                    fee.getList();
                } else {
                    tip("信息错误！");
                }
            }
        });
    };
    if (getQueryStringByName("spuId") == "") {
        //推荐生成
        form.tip.recommendTip();
        //运费模板
        fee.getList();
    } else {
        getProductInformation();
    }

    QB.SiteMenu.activeOn('#product-publish');

})(window);
