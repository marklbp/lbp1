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

$(".template-btn").click(function(){
    location.href = "/addFee-template.htm?_merchant_user_id_="+merchant_id;
});

var fee = {},
    dialog = {};

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
fee.url = {
    list: "http://goods.qbao.com/postage/listPostageTmp.html",
    delete: "http://goods.qbao.com/postage/delPostageTmp.html"
};

fee.len = 0;

fee.init = function(){
    fee.getList(1);
};

fee.show = function(obj){
    $("#dialog_tip").show();
    $(".shadow").show();
    $(".confirm_btn").click(function(){
        var id = obj.parents(".listWarp").attr("attr");
        fee.delete(id);
    });
    $(".cancle_btn,.dialog_close").click(function(){
        fee.hide();
    });
};

fee.hide = function(){
    $("#dialog_tip").hide();
    $(".shadow").hide();
};

fee.getList = function(n) {
    //get fee list template
    var data = {
        'pageIndex':n,
        'pageSize':10
    };
    $.ajax({
        type: "POST",
        url: fee.url.list, //fee.url.list
        dataType: "json",
        data: data,
        success: function(data) {
            if (data.success) {
                fee.getListAjaxBack(data.data,n);
            } else {
                tip(data.message);
            }
        },
        error: function(data){
            tip("请求错误!");
        }
    });
};

fee.getListAjaxBack = function(data, num){
    $(".template-list").children().remove();
    var html = '', l = data.length, t = '';
    if( l == 0 && num === 1) {
        html += '<tr><td colspan="10">暂无运费模板信息！</td></tr>';
    } else {
        for(var i = 0; i < l; i++){
            var e = data[i].expRules, k = e.length;
            html += '<div class="listWarp" attr='+data[i].id+' isDefault='+data[i].isDefault+'>'+
                        '<div>'+
                            '<table width="100%" class="tb">'+
                                '<thead>'+
                                    '<tr>'+
                                        '<th width="60%" class="first">'+data[i].templateName+'</th>'+
                                        '<th width="30%">模板更新时间 '+fee.checkTime(data[i].updateTime)+'</th>'+
                                        '<th><a class="eidtFree" href="/editFee-template.htm?id='+data[i].id+'&_merchant_user_id_='+merchant_id+'">修改</a></th>';
                                        if(data[i].isDefault == 1 || data[i].isDefault == '1'){html+='<th>&nbsp;&nbsp;&nbsp;&nbsp;</th>';}else{html+='<th><a class="deleteFree">删除</a></th>';}
                                    html +='</tr>'+
                                '</thead>'+
                            '</table>'+
                        '</div>'+
                        '<table class="tb1">';
                        if(data[i].calCategory == 1){
                            html += '<thead>'+
                                '<tr>'+
                                    '<th width="40%" class="first">运费区域</th>'+
                                    '<th width="15%">首件（件）</th>'+
                                    '<th width="15%">运费（宝币）</th>'+
                                    '<th width="15%">续件（件）</th>'+
                                    '<th width="15%">运费（宝币）</th>'+
                                '</tr>'+
                            '</thead>';
                        } else if( data[i].calCategory == 2){
                            html += '<thead>'+
                                '<tr>'+
                                    '<th width="40%" class="first">运费区域</th>'+
                                    '<th width="15%">首重（kg）</th>'+
                                    '<th width="15%">运费（宝币）</th>'+
                                    '<th width="15%">续重（kg）</th>'+
                                    '<th width="15%">运费（宝币）</th>'+
                                '</tr>'+
                            '</thead>';
                        } else {
                            html += '<thead>'+
                                '<tr>'+
                                    '<th width="40%" class="first">运费区域</th>'+
                                    '<th width="15%">首体积（m³）</th>'+
                                    '<th width="15%">运费（宝币）</th>'+
                                    '<th width="15%">续件（m³）</th>'+
                                    '<th width="15%">运费（宝币）</th>'+
                                '</tr>'+
                            '</thead>';
                        }
                            
                            html += '<tbody>';
                            for(var j = 0; j < k; j++) {
                                if( e[j].areaName == '' || e[j].areaName == null || e[j].areaName == undefined){
                                    t = '全国';
                                } else {
                                    t = e[j].areaName;
                                }
                                html += '<tr>'+
                                            '<td width="40%" class="first">'+t+'</td>'+
                                            '<td width="15%">'+e[j].start+'</td>'+
                                            '<td width="15%">'+e[j].postageFirst+'</td>'+
                                            '<td width="15%">'+e[j].plus+'</td>'+
                                            '<td width="15%">'+e[j].postagePlus+'</td>'+
                                        '</tr>';
                            }
                            
                            html += '</tbody>'+
                        '</table>'+
                    '</div>';
        }
        $(".template-list").append( html );
        $(".deleteFree").click(function(){
            var _this = $(this), isDelete = parseInt(_this.parents(".listWarp").attr("isdefault"));
            if(isDelete === 1 || isDelete == 1){
                tip("此模版为默认模版，不能删除此模版！");
            } else {
                fee.show(_this);
            }
        });
    }
};

fee.checkTime = function(o){
    var date = new Date(o);
    return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
};

fee.delete = function(id) {
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
                fee.getList(1);
                fee.hide();
            } else {
                tip(data.message);
                fee.hide();
            }
        },
        error: function(data){
            tip("请求错误!");
        }
    });
};

fee.init(); //初始化
