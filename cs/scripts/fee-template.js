QB.SiteMenu.activeOn('#fee-template');

String.prototype.trim = function() {
    return this.replace(/(^\s+)|(\s+$)/g, "");
}

$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
    managerName: "商品管理",
    name: "运费管理"
}));

jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

var merchant_id = $.urlParam("_merchant_user_id_");

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
}

function check(getInfor, initInfor, isnumber) {
    if (getInfor.trim().length == 0 || getInfor.trim() == initInfor.trim()) {
        tip("请填写模板信息！");
        return false;
    }
    if (isnumber) {
        var reg = /^[0-9]+?[0-9]*$/;
        if (!reg.test(getInfor)) {
            tip("请填写正确格式！");
            return false;
        }
    }
    return true;
}

var fee = {},
    dialog = {};

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
fee.url = {
    list: "http://goods.qbao.com/goods/postage/postageTemplateList.html?_merchant_user_id_="+merchant_id,
    add: "http://goods.qbao.com/goods/postage/addTemplate.html?_merchant_user_id_="+merchant_id,
    update: "http://goods.qbao.com/goods/postage/editTemplate.html?_merchant_user_id_="+merchant_id,
    delete: "http://goods.qbao.com/goods/postage/deleteTemplate.html?_merchant_user_id_="+merchant_id
}
fee.option = {
    delete: '<a href="javascript:void(0);" class="fee-delete">删除</a>',
    edit: '<a href="javascript:void(0);" class="fee-edit">编辑</a>',
    update: '<a href="javascript:void(0);" class="fee-update">保存</a>',
    deleteNull: '<a href="javascript:void(0);" class="fee-delete-null">删除</a>'
}
fee.len = 0;
fee.getList = function(fn) {
    //get fee list template
    $.ajax({
        type: "POST",
        url: fee.url.list, //fee.url.list
        dataType: "json",
        success: function(data) {
            if (data.success) {
                var list = $.parseJSON(data.data),
                    len = list.length,
                    template = [];
                if (len) {
                    fee.len = len;
                    for (var i = 0; i < len; i++) {
                        if (i % 2 == 1) {
                            template.push("<tr class='even' templateId = '" + list[i].id + "' id='template_list" + list[i].id + "'>");
                        } else {
                            template.push("<tr templateId = '" + list[i].id + "' id='template_list" + list[i].id + "'>");
                        }

                        template.push('<td><div class="template-name">' + list[i].templateName + '</div></td>');
                        template.push('<td><div class="postage" postage="' + (list[i].postage/100).toFixed(2) + '">' + (list[i].postage/100).toFixed(2) + '</div></td>');
                        if (list[i].defaultTemp) {
                            template.push('<td>&nbsp;</td>');
                        } else {
                            template.push('<td><div>' + fee.option.edit + fee.option.delete + '</div></td>');
                        }
                        template.push("</tr>");
                    }
                    $("#template table>tbody").append(template.join(""));
                    template.length = 0;
                    fn.call(this, len);
                } else {
                    $("#template").append("<div class='no-template'>没有运费模板，请添加！</div>");
                }
            } else {
                tip(data.message);
            }
        }
    });
}

fee.add = function(templateName, postage, fn) {
    //add new fee template @templateName @postage
    var r = /^[0-9]+?[0-9]*$/;
    if (templateName.trim().length > 10 || templateName.trim().length == 0) {
        tip("请填写正确的运费模板！");
        return false;
    }
    if (!r.test(postage)) {
        tip("请填写正确的运费价格！");
        return false;
    }
    $.ajax({
        type: "POST",
        url: fee.url.add,
        data: {
            "templateName": templateName,
            "postage": postage
        },
        dataType: "json",
        success: function(data) {
            if (data.success) {
                if (fn) {
                    fn.call(this, data.data);
                }
            } else {
                tip(data.message);
            }
        }
    });
}

fee.delete = function(id, fn) {
    //delete fee template @id
    $.ajax({
        type: "POST",
        url: fee.url.delete,
        data: {
            "id": id
        },
        dataType: "json",
        success: function(data) {
            if (data.success) {
                if (data.data == 1) {
                    if (fn) {
                        fn.call(this, arguments);
                    }
                }
            } else {
                tip(data.message);
            }

        }
    });
}

fee.update = function(id, templateName, postage, fn) {
    //update fee template @id @templateName @postage
    if (templateName.trim().length > 10 || templateName.trim().length == 0) {
        tip("请填写正确的运费模板！");
        return false;
    }
    if (Number(postage) != 0 && !Number(postage)) {
        tip("请填写正确的运费价格！");
        return false;
    }
    $.ajax({
        type: "POST",
        url: fee.url.update,
        data: {
            "id": id,
            "templateName": templateName,
            "postage": postage
        },
        dataType: "json",
        success: function(data) {
            if (data.success) {
                if (data.data == 1) {
                    if (fn) {
                        fn.call(this, arguments);
                    }
                }
            } else {
                tip(data.message);
            }
        }
    });
}

function feeOption() {
    //get fee list
    fee.getList(function(len) {
        //add template
        $(".template-btn").on('click', function() {
            if (fee.len >= 10) {
                tip("最多10条运费模板！");
                return false;
            }
            //todo
            var newTR = [];
            newTR.push("<tr>");
            newTR.push('<td><div class="template-name"><input type="text" maxlength="10" defaultV="请输入模板名称" value="请输入模板名称" /></div></td>');
            newTR.push('<td><div class="postage" postage=""><input type="text" maxlength="9" defaultV="请输入价格" value="请输入价格" /></div></td>');
            newTR.push('<td><div>' + fee.option.update + fee.option.deleteNull + '</div></td>');
            newTR.push("</tr>");
            $("#template table>tbody").append(newTR.join(""));
            fee.len = fee.len + 1;
        });
    });

    //edit
    $('#template').delegate('.fee-edit', 'click', function() {
        var tr = $(this).parents("tr"),
            name = $(".template-name", tr).html(),
            postage = $(".postage", tr).attr("postage");
        $(".template-name", tr).html('<input type="text" maxlength="10" defaultV="请输入模板名称" value="' + name + '" />');
        $(".postage", tr).html('<input type="text" maxlength="9" defaultV="请输入价格" value="' + postage + '" />');
        $("td:last", tr).html('<div>' + fee.option.update + fee.option.delete + '</div>');
    });

    //update &  add
    $('#template').delegate('.fee-update', 'click', function() {
        var tr = $(this).parents("tr"),
            id = tr.attr("templateId"),
            name = $(".template-name>input", tr).val(),
            postage = $(".postage>input", tr).val();
        if (!check(name, "请输入模板名称")) {
            return false;
        }
        if (!check(postage, "请输入价格", 1)) {
            return false;
        }
        if (id) {
            fee.update(id, name, postage, function() {
                $(".template-name", tr).html(name);
                $(".postage", tr).attr("postage", postage).html(postage);
                $("td:last", tr).html('<div>' + fee.option.edit + fee.option.delete + '</div>');
            });
        } else {
            fee.add(name, postage, function(id) {
                tr.attr({
                    "templateId": id,
                    "id": "template_list" + id
                });
                $(".template-name", tr).html(name);
                $(".postage", tr).attr("postage", postage).html(postage);
                $("td:last", tr).html('<div>' + fee.option.edit + fee.option.delete + '</div>');
            });
        }
    });

    //delete
    $('#template').delegate('.fee-delete', 'click', function() {
        var id = $(this).parents("tr").attr("templateId");
        $("#dialog_tip").attr("cid", id);
        dialog.open($("#dialog_tip"));
    });
    $("#dialog_tip .confirm_btn:eq(0)").on('click', function() {
        var id = $("#dialog_tip").attr("cid");
        fee.delete(id, function() {
            $("#template_list" + id).remove();
            $("#dialog_tip").attr("cid", "");
            dialog.close($("#dialog_tip"));
            fee.len = fee.len - 1;
        });
    });
    $("#dialog_tip .cancle_btn:eq(0),.dialog_close").on('click', function() {
        $("#dialog_tip").attr("cid", "");
        dialog.close($("#dialog_tip"));
    });

    $("#template").delegate('.fee-delete-null', 'click', function() {
        $(this).parents("tr").remove();
        fee.len = fee.len - 1;
    });

    //input focus blur
    $("#template").delegate('input', 'focus', function() {
        if ($(this).val().trim() == $(this).attr("defaultV").trim()) {
            $(this).val("");
        }
    });
    $("#template").delegate('input', 'blur', function() {
        if ($(this).val().trim().length == 0) {
            $(this).val("");
        }
    });
}

feeOption(); //初始化
