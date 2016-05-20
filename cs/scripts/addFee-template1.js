$(function(){

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

    var tep = {};
    var h = "http://goods.qbao.com/";
    tep.url = {
        add: h + "postage/createPostageTmp.html"
    };

    tep.areaArr = [];

    tep.obj = "";

    tep.init = function(){
        $(".pay_list_c1").on("click",function(){
          var _this = $(this);
          _this.addClass("on").siblings().removeClass("on");
          if(_this.find("input").val() == 1){
            $($(".J_PostageDetail")[0]).parent().hide();
          } else {
            $($(".J_PostageDetail")[0]).parent().show();
          }
        });

        $(".pay_list_c2").on("click",function(){
          $(this).addClass("on").siblings().removeClass("on");
        });

        $(".pay_list_c3").on("click",function(){
          var _this = $(this);
          if( _this.hasClass("on")){
            _this.removeClass("on");
            _this.parents("dl").find("dl").hide();
          } else {
            $(this).addClass("on");
            _this.parents("dl").find("dl").show();
          }
        });

        $("#itip").click(function(){
            $(this).hide();
            $(".tempName").focus();
        });

        $("input[name='express_start']").blur(function(){
            var _this = $(this), es = _this.val();
            if(es == "" || es.length == 0){
                tep.showTip($(".J_DefaultMessage"),"请完善模板信息！")
                tep.showBg(_this);
                return;
            } else {
                if(/^\d{1,4}$/.test(es)){
                    if(es < 1){
                        tep.showTip($(".J_DefaultMessage"),"首件应输入1至9999的数字！")
                        tep.showBg(_this);
                        return;
                    } else {
                        tep.hideTip($(".J_DefaultMessage"));
                        tep.hideBg(_this);
                    }
                } else {
                    tep.showTip($(".J_DefaultMessage"),"首件应输入1至9999的数字！");
                    tep.showBg(_this);
                    return;
                    
                }
            }
        });

        $("input[name='express_start']").focus(function(){
            var _this = $(this);
            tep.hideBg(_this);
        });

        $("input[name='express_postage']").blur(function(){
            var _this = $(this), ep = _this.val();
            if(ep == "" || ep.length == 0){
                tep.showTip($(".J_DefaultMessage"),"请完善模板信息！");
                tep.showBg(_this);
                return;
            } else {
                if(/^\d{1,4}$/.test(ep)){
                    tep.hideTip($(".J_DefaultMessage"));
                    tep.hideBg(_this);
                } else {
                    tep.showTip($(".J_DefaultMessage"),"首费应输入0至9999的数字！");
                    tep.showBg(_this);
                    return;
                }
            }
        });

        $("input[name='express_postage']").focus(function(){
            var _this = $(this);
            tep.hideBg(_this);
        });

        $("input[name='express_plus']").focus(function(){
            var _this = $(this);
            tep.hideBg(_this);
        });

        $("input[name='express_postageplus']").focus(function(){
            var _this = $(this);
            tep.hideBg(_this);
        });

        $("input[name='express_plus']").blur(function(){
            var _this = $(this), eps = _this.val();
            if(eps == "" || eps.length == 0){
                tep.showTip($(".J_DefaultMessage"),"请完善模板信息！");
                tep.showBg(_this);
                return;
            } else {
                if(/^\d{1,4}$/.test(eps)){
                    if(eps < 1){
                        tep.showTip($(".J_DefaultMessage"),"续件应输入1至9999的数字！");
                        tep.showBg(_this);
                        return;
                    } else {
                        tep.hideTip($(".J_DefaultMessage"));
                        tep.hideBg(_this);
                    }
                } else {
                    tep.showTip($(".J_DefaultMessage"),"续件应输入1至9999的数字！");
                    tep.showBg(_this);
                    return;
                }
            }
        });

        $("input[name='express_postageplus']").blur(function(){
            var _this = $(this), epgs = _this.val();
            if(epgs == "" || epgs.length == 0){
                tep.showTip($(".J_DefaultMessage"),"请完善模板信息！");
                tep.showBg(_this);
                return;
            } else {
                if(/^\d{1,4}$/.test(epgs)){
                    tep.hideTip($(".J_DefaultMessage"));
                    tep.hideBg(_this);
                } else {
                    tep.showTip($(".J_DefaultMessage"),"续费应输入0至9999的数字！");
                    tep.showBg(_this);
                    return;
                }
            }
        });


        $(".tempName").blur(function(){
            var _this = $(this);
            var val = $.trim( _this.val() );
            var str = "";
            for (var i = 0; i < val.length; i++) {
                if(/[\u4E00-\u9FA5]/.test(val[i])){
                  str = str + "X";
                } else {
                  str = str + val[i];
                }
            }
            if(str == "" || str.length == 0){
                $("#itip").show();
                $("#error").show().find("em").text("请输入模板名称！");
                $("#itip").hide();
                $(".tempName").focus();
                return;
            } else {
                if( str.length > 10) {
                    $("#itip").show();
                    $("#error").show().find("em").text("模板名称格式不正确！");
                    $("#itip").hide();
                    $(".tempName").focus();
                    return;
                } else if( !(/^[0-9a-zA-Z]+$/.test( str )) ){
                    $("#itip").show();
                    $("#error").show().find("em").text("模板名称格式不正确！");
                    $("#itip").hide();
                    $(".tempName").focus();
                    return;
                } else {
                    $("#itip").hide();
                    $("#error").hide().find("em").text("");
                }
            }
        });

        $(".submitBtn").click(function(){
            var n = $.trim( $(".tempName").val());
            var v1 = $(".pay_list_c1.on").find("input").val();
            var v2 = $(".pay_list_c2.on").find("input").val();
            var v3 = $(".pay_list_c3.on"), v3l = $(".pay_list_c3.on").length;
            var expressRule = new Array(), isDefault = 1, ru = {};
            var str = "";
            for (var i = 0; i < n.length; i++) {
                if(/[\u4E00-\u9FA5]/.test(n[i])){
                  str = str + "X";
                } else {
                  str = str + n[i];
                }
            }
            if(str == "" || str.length == 0){
                $("#itip").show();
                $("#error").show().find("em").text("请输入模板名称！");
                return;
            } else {
                if( str.length > 10) {
                    $("#itip").show();
                    $("#error").show().find("em").text("模板名称格式不正确！");
                    return;
                } else if( !(/^[0-9a-zA-Z]+$/.test( str )) ){
                    $("#itip").show();
                    $("#error").show().find("em").text("模板名称格式不正确！");
                    return;
                } else {
                    $("#itip").hide();
                    $("#error").hide().find("em").text("");
                }
            }
            if( v1 == 1 ){
                if(v3l > 0){
                    for(var i = 0; i < v3l; i++){
                        var ex = $(v3[i]).find("input[type='checkbox']").val();
                        ru = {
                            'expressType':ex,
                            'optType':1,
                            'isAssign':0,
                            'start':1,
                            'postageFirst':0,
                            'plus':1,
                            'postagePlus':0,
                            'areaCode':'',
                            'areaName':''
                        };
                        expressRule.push(ru);
                    }
                } else {
                    tip("运送方式至少选择一个！");
                }
            } else {
                if(v3l > 0){
                    for(var i = 0; i < v3l; i++){
                        var ex = $(v3[i]).parent().find("input[type='checkbox']").val();
                        var es = $.trim( $(v3[i]).parents("dl").find("input[name='express_start']").val());
                        var ep = $.trim( $(v3[i]).parents("dl").find("input[name='express_postage']").val());
                        var eps = $.trim( $(v3[i]).parents("dl").find("input[name='express_plus']").val());
                        var epgs = $.trim( $(v3[i]).parents("dl").find("input[name='express_postageplus']").val());

                        if(es == "" || es.length == 0){
                            tep.showTip($(v3[i]).parents("dl").find(".J_DefaultMessage"),"请完善模板信息！");
                            tep.showBg($(v3[i]).parents("dl").find(".J_DefaultSet input[name='express_start']"));
                            return;
                        } else {
                            if(/^\d{1,4}$/.test(es)){
                                if(es < 1){
                                    tep.showTip($(v3[i]).parents("dl").find(".J_DefaultMessage"),"首件应输入1至9999的数字！");
                                    tep.showBg($(v3[i]).parents("dl").find(".J_DefaultSet input[name='express_start']"));
                                    return;
                                } else {
                                    tep.hideTip($(v3[i]).parents("dl").find(".J_DefaultMessage"));
                                    tep.hideBg($(v3[i]).parents("dl").find(".J_DefaultSet input[name='express_start']"));
                                }
                            } else {
                                tep.showBg($(v3[i]).parents("dl").find(".J_DefaultSet input[name='express_start']"));
                                tep.showTip($(v3[i]).parents("dl").find(".J_DefaultMessage"),"首件应输入1至9999的数字！");
                                return;
                                
                            }
                        }

                        if(ep == "" || ep.length == 0){
                            tep.showTip($(v3[i]).parents("dl").find(".J_DefaultMessage"),"请完善模板信息！");
                            tep.showBg($(v3[i]).parents("dl").find(".J_DefaultSet input[name='express_postage']"));
                            return;
                        } else {
                            if(/^\d{1,4}$/.test(ep)){
                                tep.hideTip($(v3[i]).parents("dl").find(".J_DefaultMessage"));
                                tep.hideBg($(v3[i]).parents("dl").find(".J_DefaultSet input[name='express_postage']"));
                            } else {
                                tep.showTip($(v3[i]).parents("dl").find(".J_DefaultMessage"),"首费应输入0至9999的数字！");
                                tep.showBg($(v3[i]).parents("dl").find(".J_DefaultSet input[name='express_postage']"));
                                return;
                            }
                        }

                        if(eps == "" || eps.length == 0){
                            tep.showTip($(v3[i]).parents("dl").find(".J_DefaultMessage"),"请完善模板信息！");
                            tep.showBg($(v3[i]).parents("dl").find(".J_DefaultSet input[name='express_plus']"));
                            return;
                        } else {
                            if(/^\d{1,4}$/.test(eps)){
                                if(eps < 1){
                                    tep.showTip($(v3[i]).parents("dl").find(".J_DefaultMessage"),"续件应输入1至9999的数字！");
                                    tep.showBg($(v3[i]).parents("dl").find(".J_DefaultSet input[name='express_plus']"));
                                    return;
                                } else {
                                    tep.hideTip($(v3[i]).parents("dl").find(".J_DefaultMessage"));
                                    tep.hideBg($(v3[i]).parents("dl").find(".J_DefaultSet input[name='express_postage']"));
                                }
                            } else {
                                tep.showTip($(v3[i]).parents("dl").find(".J_DefaultMessage"),"续件应输入1至9999的数字！");
                                tep.showBg($(v3[i]).parents("dl").find(".J_DefaultSet input[name='express_plus']"));
                                return;
                            }
                        }

                        if(epgs == "" || epgs.length == 0){
                            tep.showTip($(v3[i]).parents("dl").find(".J_DefaultMessage"),"请完善模板信息！");
                            tep.showBg($(v3[i]).parents("dl").find(".J_DefaultSet input[name='express_postageplus']"));
                            return;
                        } else {
                            if(/^\d{1,4}$/.test(epgs)){
                                tep.hideTip($(v3[i]).parents("dl").find(".J_DefaultMessage"));
                                tep.hideBg($(v3[i]).parents("dl").find(".J_DefaultSet input[name='express_postageplus']"));
                            } else {
                                tep.showTip($(v3[i]).parents("dl").find(".J_DefaultMessage"),"续费应输入0至9999的数字！");
                                tep.showBg($(v3[i]).parents("dl").find(".J_DefaultSet input[name='express_postageplus']"));
                                return;
                            }
                        }
                        
                        if($(v3[i]).parents("dl").find(".J_PostageDetail").find(".tbl-except").is(":visible")){
                            isDefault = 0;
                            var $tr = $(v3[i]).parents("dl").find(".J_PostageDetail").find(".tbl-except").find("tr");
                            var l = $tr.length - 1;
                            for(var i = 0 ; i < l; i++) {
                                var s = $.trim( $($tr[i+1]).find("input[name='express_start_n2']").val() );
                                if(s == "" || s.length == 0) {
                                    tep.showTip($(v3[i]).parents("dl").find(".J_SpecialMessage"),"请完善模板信息！");
                                    tep.showBg($($tr[i+1]).find("input[name='express_start_n2']"));
                                    return;
                                } else {
                                    if(/^\d{1,4}$/.test(s)){
                                        if(s < 1){
                                            tep.showTip($(v3[i]).parents("dl").find(".J_SpecialMessage"),"首件应输入1至9999的数字！");
                                            tep.showBg($($tr[i+1]).find("input[name='express_start_n2']"));
                                            return;
                                        }else{
                                            tep.hideTip($(v3[i]).find(".J_SpecialMessage"));
                                            tep.hideBg($($tr[i+1]).find("input[name='express_start_n2']"));
                                        }
                                    }else{
                                        tep.showTip($(v3[i]).parents("dl").find(".J_SpecialMessage"),"首件应输入1至9999的数字！");
                                        tep.showBg($($tr[i+1]).find("input[name='express_start_n2']"));
                                        return;
                                    }
                                }

                                var p = $.trim( $($tr[i+1]).find("input[name='express_postage_n2']").val() );
                                if(p == "" || p.length == 0) {
                                    tep.showTip($(v3[i]).parents("dl").find(".J_SpecialMessage"),"请完善模板信息！");
                                    tep.showBg($($tr[i+1]).find("input[name='express_postage_n2']"));
                                    return;
                                } else {
                                    if(/^\d{1,4}$/.test(p)){
                                        tep.hideTip($(v3[i]).parents("dl").find(".J_SpecialMessage"));
                                        tep.hideBg($($tr[i+1]).find("input[name='express_postage_n2']"));
                                    }else{
                                        tep.showTip($(v3[i]).parents("dl").find(".J_SpecialMessage"),"首费应输入0至9999的数字！");
                                        tep.showBg($($tr[i+1]).find("input[name='express_postage_n2']"));
                                        return;
                                    }
                                }

                                var pl = $.trim( $($tr[i+1]).find("input[name='express_plus_n2']").val() );
                                if(pl == "" || pl.length == 0) {
                                    tep.showTip($(v3[i]).parents("dl").find(".J_SpecialMessage"),"请完善模板信息！");
                                    tep.showBg($($tr[i+1]).find("input[name='express_plus_n2']"));
                                    return;
                                } else {
                                    if(/^\d{1,4}$/.test(pl)){
                                        if(pl < 1){
                                            tep.showTip($(v3[i]).parents("dl").find(".J_SpecialMessage"),"续件应输入1至9999的数字！");
                                            tep.showBg($($tr[i+1]).find("input[name='express_plus_n2']"));
                                            return;
                                        } else {
                                            tep.hideTip($(v3[i]).parents("dl").find(".J_SpecialMessage"));
                                            tep.hideBg($($tr[i+1]).find("input[name='express_plus_n2']"));
                                        }
                                    }else{
                                        tep.showTip($(v3[i]).parents("dl").find(".J_SpecialMessage"),"续件应输入1至9999的数字！");
                                        tep.showBg($($tr[i+1]).find("input[name='express_plus_n2']"));
                                        return;
                                    }
                                }

                                var po = $.trim( $($tr[i+1]).find("input[name='express_postageplus_n2']").val() );
                                if(po == "" || po.length == 0) {
                                    tep.showTip($(v3[i]).parents("dl").find(".J_SpecialMessage"),"请完善模板信息！");
                                    tep.showBg($($tr[i+1]).find("input[name='express_postageplus_n2']"));
                                    return;
                                } else {
                                    if(/^\d{1,4}$/.test(pl)){
                                        tep.hideTip($(v3[i]).parents("dl").find(".J_SpecialMessage"));
                                        tep.hideBg($($tr[i+1]).find("input[name='express_postageplus_n2']"));
                                    }else{
                                        tep.showTip($(v3[i]).parents("dl").find(".J_SpecialMessage"),"续费应输入0至9999的数字！");
                                        tep.showBg($($tr[i+1]).find("input[name='express_postageplus_n2']"));
                                        return;
                                    }
                                }
                                var area = $($tr[i+1]).find(".area-group").find("p").text();
                                var ar = $.trim( $($tr[i+1]).find("input[name='express_areas_n2']").val() );
                                if(ar == "" || ar.length == 0) {
                                    tep.showTip($(v3[i]).parents("dl").find(".J_SpecialMessage"),"指定地区城市为空或错误！");
                                    tep.showBg($($tr[i+1]).find("input[name='express_areas_n2']"));
                                    return;
                                } else {
                                    tep.hideTip($(v3[i]).parents("dl").find(".J_SpecialMessage"));
                                    tep.hideBg($($tr[i+1]).find("input[name='express_areas_n2']"));
                                }

                                ru = {
                                    'expressType':ex,
                                    'optType':1,
                                    'isAssign':1,
                                    'start':s,
                                    'postageFirst':p,
                                    'plus':pl,
                                    'postagePlus':po,
                                    'areaCode': ar,
                                    'areaName': area
                                };
                                expressRule.push(ru);

                            }

                            ru = {
                                'expressType':ex,
                                'optType':1,
                                'isAssign':0,
                                'start':es,
                                'postageFirst':ep,
                                'plus':eps,
                                'postagePlus':epgs,
                                'areaCode':'',
                                'areaName':''
                            };
                            expressRule.push(ru);

                        } else {
                            isDefault = 1;
                            ru = {
                                'expressType':ex,
                                'optType':1,
                                'isAssign':0,
                                'start':es,
                                'postageFirst':ep,
                                'plus':eps,
                                'postagePlus':epgs,
                                'areaCode':'',
                                'areaName':''
                            };
                            expressRule.push(ru);
                        }
                    }
                }else{
                    tip("运送方式至少选择一个！");
                } 
            }
            var data = {
                'templateName': n,
                'isPostage': v1,
                'calCategory': v2,
                // 'isDefault': isDefault,
                'expressRule':JSON.stringify(expressRule)
            };
            $.ajax({
                type: "POST",
                url: tep.url.add, //tep.url.add
                dataType: "json",
                data: data,
                success: function(data) {
                    if (data.success) {
                        //alert(0);
                        location.href="http://goods.qbao.com/goods/postage/toIndex.html?_merchant_user_id_="+merchant_id;
                        
                    } else {
                        tip(data.message);
                    }
                },
                error: function(data){
                    tip("请求错误!");
                }
            });

        });

        $(".cancelBtn").click(function(){
            location.href="http://goods.qbao.com/goods/postage/toIndex.html?_merchant_user_id_="+merchant_id;
        });

        $(".J_AddRule").click(function(){
            var html = "";
            var _this = $(this);
            if( !_this.parents(".J_PostageDetail").find(".tbl-except").is(":visible")){
                html += '<div class="tbl-except">'+
                            '<table border="0" cellpadding="0" cellspacing="0">'+
                                '<colgroup>'+
                                    '<col class="col-area">'+
                                    '<col class="col-start">'+
                                    '<col class="col-postage">'+
                                    '<col class="col-plus">'+
                                    '<col class="col-postageplus">'+
                                    '<col class="col-action">'+
                                '</colgroup>'+
                                '<thead>'+
                                    '<tr>'+
                                        '<th>地址城市</th>'+
                                        '<th>首件(件)</th>'+
                                        '<th>运费(宝币)</th>'+
                                        '<th>续件(件)</th>'+
                                        '<th>运费(宝币)</th>'+
                                        '<th>操作</th>'+
                                    '</tr>'+
                                '</thead>'+
                                '<tbody>'+
                                    '<tr data-group="n1">'+
                                        '<td class="cell-area">'+
                                            '<a href="javascript:;" class="acc_popup edit J_EditArea" title="编辑运送区域">编辑</a>'+
                                            '<div class="area-group">'+
                                                '<p>未添加地区</p>'+
                                            '</div>'+
                                            '<input type="hidden" name="express_areas_n2" value="">'+
                                        '</td>'+
                                        '<td>'+
                                            '<input type="text" name="express_start_n2" data-field="start" value="1" class="input-text " autocomplete="off" maxlength="4" aria-label="首件">'+
                                        '</td>'+
                                        '<td>'+
                                            '<input type="text" name="express_postage_n2" data-field="postage" value="" class="input-text " autocomplete="off" maxlength="4" aria-label="首费">'+
                                        '</td>'+
                                        '<td>'+
                                            '<input type="text" name="express_plus_n2" data-field="plus" value="1" class="input-text " autocomplete="off" maxlength="4" aria-label="续件">'+
                                        '</td>'+
                                        '<td>'+
                                            '<input type="text" name="express_postageplus_n2" data-field="postageplus" value="" class="input-text " autocomplete="off" maxlength="4" aria-label="续费">'+
                                        '</td>'+
                                        '<td>'+
                                            '<a href="javascript:;" class="J_DeleteRule">删除</a>'+
                                        '</td>'+
                                    '</tr>'+
                                '</tbody>'+
                            '</table>'+
                        '</div>';
                _this.parents("dl").find(".J_DefaultSet").append(html);
            } else {
                html += '<tr data-group="n2">'+
                            '<td class="cell-area">'+
                                '<a href="javascript:;" class="acc_popup edit J_EditArea" title="编辑运送区域">编辑</a>'+
                                '<div class="area-group">'+
                                    '<p>未添加地区</p>'+
                                '</div>'+
                                '<input type="hidden" name="express_areas_n2" value="">'+
                            '</td>'+
                            '<td>'+
                                '<input type="text" name="express_start_n2" data-field="start" value="1" class="input-text " autocomplete="off" maxlength="4" aria-label="首件">'+
                            '</td>'+
                            '<td>'+
                                '<input type="text" name="express_postage_n2" data-field="postage" value="" class="input-text " autocomplete="off" maxlength="4" aria-label="首费">'+
                            '</td>'+
                            '<td>'+
                                '<input type="text" name="express_plus_n2" data-field="plus" value="1" class="input-text " autocomplete="off" maxlength="4" aria-label="续件">'+
                            '</td>'+
                            '<td>'+
                                '<input type="text" name="express_postageplus_n2" data-field="postageplus" value="" class="input-text " autocomplete="off" maxlength="4" aria-label="续费">'+
                            '</td>'+
                            '<td>'+
                                '<a href="javascript:;" class="J_DeleteRule">删除</a>'+
                            '</td>'+
                        '</tr>';
                _this.parents(".J_PostageDetail").find(".tbl-except").find("table").find("tbody").append(html)
            }

            $(".J_DeleteRule").click(function(){/*删除事件*/
                var _this = $(this);
                tep.show(_this);
            });

            $(".J_EditArea").click(function(){
                var _this = $(this);
                tep.obj = _this;
                tep.cityshow();
            });

            $("input[name='express_start_n2']").blur(function(){
                var _this = $(this), s = _this.val();
                if(s == "" || s.length == 0) {
                    tep.showTip($(".J_SpecialMessage"),"请完善模板信息！");
                    tep.showBg(_this);
                    return;
                } else {
                    if(/^\d{1,4}$/.test(s)){
                        if(s < 1){
                            tep.showTip($(".J_SpecialMessage"),"首件应输入1至9999的数字！");
                            tep.showBg(_this);
                            return;
                        } else {
                            tep.hideTip($(".J_SpecialMessage"));
                            tep.hideBg(_this);
                        }
                    }else{
                        tep.showTip($(".J_SpecialMessage"),"首件应输入1至9999的数字！");
                        tep.showBg(_this);
                        return;
                    }
                }
            });

            $("input[name='express_start_n2']").focus(function(){
                var _this = $(this);
                tep.hideBg(_this);
            });

            $("input[name='express_postage_n2']").focus(function(){
                var _this = $(this);
                tep.hideBg(_this);
            });

            $("input[name='express_plus_n2']").focus(function(){
                var _this = $(this);
                tep.hideBg(_this);
            });

            $("input[name='express_postageplus_n2']").focus(function(){
                var _this = $(this);
                tep.hideBg(_this);
            });

            $("input[name='express_postage_n2']").blur(function(){
                var _this = $(this), p = _this.val();
                if(p == "" || p.length == 0) {
                    tep.showTip($(".J_SpecialMessage"),"请完善模板信息！");
                    tep.showBg(_this);
                    return;
                } else {
                    if(/^\d{1,4}$/.test(p)){
                        tep.hideTip($(".J_SpecialMessage"));
                        tep.hideBg(_this);
                    }else{
                        tep.showTip($(".J_SpecialMessage"),"首费应输入0至9999的数字！");
                        tep.showBg(_this);
                        return;
                    }
                }
            });

            $("input[name='express_plus_n2']").blur(function(){
                var _this = $(this), pl = _this.val();
                if(pl == "" || pl.length == 0) {
                    tep.showTip($(".J_SpecialMessage"),"请完善模板信息！");
                    tep.showBg(_this);
                    return;
                } else {
                    if(/^\d{1,4}$/.test(pl)){
                        if(pl < 1){
                            tep.showTip($(".J_SpecialMessage"),"续件应输入1至9999的数字！");
                            tep.showBg(_this);
                            return;
                        } else {
                            tep.hideTip($(".J_SpecialMessage"));
                            tep.hideBg(_this);
                        }
                    }else{
                        tep.showTip($(".J_SpecialMessage"),"续件应输入1至9999的数字！");
                        tep.showBg(_this);
                        return;
                    }
                }
            });

            $("input[name='express_postageplus_n2']").blur(function(){
                var _this = $(this), po = _this.val();
                if(po == "" || po.length == 0) {
                    tep.showTip($(".J_SpecialMessage"),"请完善模板信息！");
                    tep.showBg(_this);
                    return;
                } else {
                    if(/^\d{1,4}$/.test(po)){
                        tep.hideTip($(".J_SpecialMessage"));
                        tep.hideBg(_this);
                    }else{
                        tep.showTip($(".J_SpecialMessage"),"续费应输入0至9999的数字！");
                        tep.showBg(_this);
                        return;
                    }
                }
            });
        });

        tep.addCity();
    };

    tep.delete = function(obj){
        var l = obj.parents(".J_PostageDetail").find(".tbl-except").find("table").find("tbody").find("tr").length;
        if(l <= 1){
            obj.parents(".J_PostageDetail").find(".tbl-except").remove();
        } else{
            obj.parents("tr").remove();
        }
        tep.hide();
    }

    tep.showBg = function(obj){
        obj.css("background","#FDA6A6");
    }

    tep.hideBg = function(obj){
        obj.css("background","#fff");
    }

    tep.showTip = function(obj,txt){
        obj.text(txt);
    }

    tep.hideTip = function(obj){
        obj.text("");
    }

    tep.show = function(obj){
        $("#dialog_tip").show();
        $(".shadow").show();
        $(".confirm_btn").click(function(){
            tep.delete(obj);
        });
        $(".confirm_btn").click(function(){
            tep.hide();
        });
    };

    tep.hide = function(){
        $("#dialog_tip").hide();
        $(".shadow").hide();
    };

    tep.cityshow = function(){
        $(".city-shadow").show();
        $(".ks-dialog").show();
        $(".showCityPop").removeClass("showCityPop");

        var value = tep.obj.parents(".cell-area").find("input").val();
        var o = $("#J_CityList").find("input[type='checkbox']"), ol = o.length;
        for(var i = 0; i < ol; i++){
            $(o[i]).removeAttr("checked");
            $(o[i]).removeAttr("disabled");
        }
        $(".check_num").text("");
        tep.areaArr = tep.getArea(tep.obj);
        if(tep.areaArr.length != 0){
            
            /*有值*/
            var v = tep.areaArr, l = v.length;
            var o = $("#J_CityList").find("input[type='checkbox']"), ol = o.length;
            for(var i = 0; i < l; i++){
                for(var j = 0; j < ol; j++){
                    if(v[i] == $(o[j]).val()){
                        $(o[j]).prop("checked",true);
                        $(o[j]).prop("disabled",true);
                        break;
                    }
                }
            }

            var c = $("#J_CityList").find(".province-list").find(".citys"),cl = c.length;
            for(var j = 0; j < cl; j++){
                var l1 = $(c[j]).find(".areas").find("input[type='checkbox']:checked").length;
                if(l1 > 0){
                    $(c[j]).parents(".ecity").find(".check_num").text("("+l1+")");
                } else {
                    $(c[j]).parents(".ecity").find(".check_num").text("");
                }
            }

            var d = $("#J_CityList").find(".dcity"), dl = d.length;
            for(var i = 0; i < dl; i++){
                var k = $(d[i]).find(".province-list").find(".ecity"), kl = k.length;
                for(var j = 0; j < kl; j++){
                    var kl1 = $(k[j]).find(".citys").find("input[type='checkbox']").length;
                    var n = $(k[j]).find(".gareas").find(".check_num").text();
                    var n1 = parseInt(n.substring(1,n.length-1));
                    if(kl1 == n1){
                        $(k[j]).find(".gareas").find("input").attr("disabled",true);
                        $(k[j]).find(".gareas").find("input").prop("checked",true);
                    } else {
                        if( n1 > 0){
                            $(k[j]).find(".gareas").find("input").prop("disabled",true);
                            $(k[j]).find(".gareas").find("input").removeAttr("checked");
                        } else {
                            $(k[j]).find(".gareas").find("input").removeAttr("disabled");
                            $(k[j]).find(".gareas").find("input").removeAttr("checked");
                        }
                    }
                }
            }

            for(var i = 0; i < dl; i++){
                var k = $(d[i]).find(".province-list").find(".ecity").find(".gareas").find("input").length;
                var il = $(d[i]).find(".province-list").find(".ecity").find(".gareas").find("input:disabled").length;
                if(il <= 0){
                    $(d[i]).find(".gcity").find("input[type='checkbox']").removeAttr("checked");
                    $(d[i]).find(".gcity").find("input[type='checkbox']").removeAttr("disabled");
                } else {
                    if(k == il){
                        $(d[i]).find(".gcity").find("input[type='checkbox']").attr("disabled",true);
                        $(d[i]).find(".gcity").find("input[type='checkbox']").prop("checked",true);
                    } else {
                        if( il > 0){
                            $(d[i]).find(".gcity").find("input[type='checkbox']").attr("disabled",true);
                            $(d[i]).find(".gcity").find("input[type='checkbox']").removeAttr("checked");
                        } else {
                            $(d[i]).find(".gcity").find("input[type='checkbox']").removeAttr("disabled");
                            $(d[i]).find(".gcity").find("input[type='checkbox']").removeAttr("checked");
                        }
                    }
                }

                if($(d[i]).find('.gcity').find("input[type='checkbox']")[0].disabled == true){
                    $(d[i]).find(".province-list").find(".ecity").find(".gareas").find("input[type='checkbox']").attr("disabled",true);
                } else {
                    $(d[i]).find(".province-list").find(".ecity").find(".gareas").find("input[type='checkbox']").removeAttr("disabled");
                }
            }
            if(value == ""){/*第一次没有值*/
            } else {/*有值*/
                tep.checkCity(value);
            }
        } else {
            if(value == ""){/*第一次没有值*/
            } else {/*有值*/
                tep.checkCity(value);
            }
        }

        tep.checkCity = function( value ){
            var v = value.split(","), l = v.length;
            var o = $("#J_CityList").find("input[type='checkbox']"), ol = o.length;
            for(var i = 0; i < l; i++){
                for(var j = 0; j < ol; j++){
                    if(v[i] == $(o[j]).val()){
                        $(o[j]).prop("checked",true);
                        break;
                    }
                }
            }

            var c = $("#J_CityList").find(".province-list").find(".citys"),cl = c.length;
            for(var j = 0; j < cl; j++){
                var l1 = $(c[j]).find(".areas").find("input[type='checkbox']:checked").length;
                if(l1 > 0){
                    $(c[j]).parents(".ecity").find(".check_num").text("("+l1+")");
                } else {
                    $(c[j]).parents(".ecity").find(".check_num").text("");
                }
            }

            var d = $("#J_CityList").find(".dcity"), dl = d.length;
            for(var i = 0; i < dl; i++){
                var k = $(d[i]).find(".province-list").find(".ecity"), kl = k.length;
                for(var j = 0; j < kl; j++){
                    var kl1 = $(k[j]).find(".citys").find("input[type='checkbox']").length;
                    var n = $(k[j]).find(".gareas").find(".check_num").text();
                    var n1 = parseInt(n.substring(1,n.length-1));
                    if(kl1 == n1){
                        $(k[j]).find(".gareas").find("input").attr("disabled",true);
                        $(k[j]).find(".gareas").find("input").prop("checked",true);
                    } else {
                        if(n1 > 0){
                            $(k[j]).find(".gareas").find("input").attr("disabled",true);
                            $(k[j]).find(".gareas").find("input").removeAttr("checked");
                        } else {
                            $(k[j]).find(".gareas").find("input").removeAttr("disabled");
                            $(k[j]).find(".gareas").find("input").removeAttr("checked");
                        }
                        
                    }
                }
            }

            for(var i = 0; i < dl; i++){
                var k = $(d[i]).find(".province-list").find(".ecity").find(".gareas").find("input").length;
                var il = $(d[i]).find(".province-list").find(".ecity").find(".gareas").find("input:disabled").length;
                if(il <= 0){
                    $(d[i]).find(".gcity").find("input[type='checkbox']").removeAttr("checked");
                    $(d[i]).find(".gcity").find("input[type='checkbox']").removeAttr("disabled");
                } else {
                    if(k == il){
                        $(d[i]).find(".gcity").find("input[type='checkbox']").prop("disabled",true);
                        $(d[i]).find(".gcity").find("input[type='checkbox']").prop("checked",true);
                    } else {
                        if( il > 0){
                            $(d[i]).find(".gcity").find("input[type='checkbox']").prop("disabled",true);
                            $(d[i]).find(".gcity").find("input[type='checkbox']").removeAttr("checked");
                        } else {
                            $(d[i]).find(".gcity").find("input[type='checkbox']").removeAttr("disabled");
                            $(d[i]).find(".gcity").find("input[type='checkbox']").removeAttr("checked");
                        }
                    }
                }

                if($(d[i]).find('.gcity').find("input[type='checkbox']")[0].disabled == true){
                    $(d[i]).find(".province-list").find(".ecity").find(".gareas").find("input[type='checkbox']").attr("disabled",true);
                } else {
                    $(d[i]).find(".province-list").find(".ecity").find(".gareas").find("input[type='checkbox']").removeAttr("disabled");
                }
            }
        };
        

        $(".ks-ext-close,.J_Cancel").click(function(){
            tep.cityhide();
        });

        $(".J_Submit").click(function(e){/*确定按钮事件*/
            var arr = [], arrt = [], arri = [], arrk = [];
            var o = $("#J_CityList").find(".province-list").find(".citys");
            var l = o.length;
            for(var i = 0; i < l; i++){
                var in1 = $(o[i]).find("input[type='checkbox']");
                var l1 = in1.length, n = $(o[i]).find("input[type='checkbox']").length, s = $(o[i]).parents(".ecity").find(".check_num").text();
                var s1 = parseInt(s.substring(1,s.length-1));
                for(var j = 0; j < l1; j++){
                    if(in1[j].checked == true && in1[j].disabled == false){
                        arr.push($(in1[j]).val());
                    }
                }
                if(n == 0){
                } else {
                    if(n == s1){
                        var t = $(o[i]).parents(".ecity").find(".gareas").find("input")[0];
                        if(t.checked == true && t.disabled == true){ 
                            var l6 = 0, l7 = 0, isDisabledArr = [], disabledArr = [],isnew = [];
                            for(var j = 0; j < l1; j++){
                                if(in1[j].checked == true && in1[j].disabled == false){
                                    l6++;
                                    isDisabledArr.push($(in1[j]).parent().find("label").text());
                                } else if(in1[j].checked == true && in1[j].disabled == true){
                                    l7++;
                                }
                            }

                            if(l7 == s1 && l6 == s1){
                                arri.push($(o[i]).parents(".ecity").find(".gareas").find("label").text());
                            } else {
                                arrt = arrt.concat(isDisabledArr);
                            }

                        } else {
                            var l6 = 0, l7 = 0, isDisabledArr = [], disabledArr = [];
                            for(var j = 0; j < l1; j++){
                                if(in1[j].checked == true && in1[j].disabled == false){
                                    l6++;
                                    isDisabledArr.push($(in1[j]).parent().find("label").text());
                                } else if(in1[j].checked == true && in1[j].disabled == true){
                                    l7++;
                                }
                            }

                            if(l6 == s1){
                                arri.push($(o[i]).parents(".ecity").find(".gareas").find("label").text());
                            } else {
                                arrt = arrt.concat(isDisabledArr);
                            }
                        }
                    } else {
                        for(var j = 0; j < l1; j++){
                            if(in1[j].checked == true && in1[j].disabled == false){
                                arrt.push($(in1[j]).parent().find("label").text());
                            }
                        }
                    }
                }
            }
            
            tep.obj.parents(".cell-area").find("input").val(arr.join(","));
            var tt = "";
            if(arri.length == 0){
                tt = arri.join("、") + arrt.join("、");
            } else {
                if(arrt.length == 0){
                    tt = arri.join("、") + arrt.join("、");
                } else {
                    tt = arri.join("、")+"、"+arrt.join("、");
                }
            }
            
            if(tt == "") {tt = "未添加地区";}
            tep.obj.parents(".cell-area").find(".area-group").find("p").text(tt);
            tep.cityhide();
            e.preventDefault();
            e.stopPropagation();
        });

        $(".dcity .gcity .J_Group").click(function(e){/*华东、华北等大地区选择事件*/
            var _this = $(this);
            if(_this[0].checked == true){
                _this.parents(".dcity").find(".province-list").find("input[type='checkbox']").prop("checked",true);
                var o = _this.parents(".dcity").find(".province-list").find(".ecity").find(".citys");
                var l = o.length;
                for(var i = 0; i < l; i++){
                    var l1 = $(o[i]).find(".areas").find("input[type='checkbox']:checked").length;
                    $(o[i]).parents(".ecity").find(".check_num").text("("+l1+")");
                }
            } else {
                _this.parents(".dcity").find(".province-list").find("input[type='checkbox']").removeAttr("checked");
                _this.parents(".dcity").find(".province-list").find(".ecity").find(".check_num").text("");
            }
        });

        $(".dcity .province-list .gareas img,.dcity .province-list .gareas label,.dcity .province-list .gareas span").click(function(){/*省图标事件，显示弹出框*/
            var _this = $(this);
            $(".showCityPop").removeClass("showCityPop");
            _this.parents(".ecity").addClass("showCityPop");
            _this.parents(".ecity").find(".close_button").click(function(){/*弹出框关闭按钮事件*/
                _this.parents(".ecity").removeClass("showCityPop");
            });

            _this.parents(".ecity").find(".areas").find("input[type='checkbox']").click(function(){/*弹出框复选框事件*/
                var _esp = $(this);
                var l = _esp.parents(".citys").find("input[type='checkbox']:checked").length;
                var l1 = _esp.parents(".citys").find("input[type='checkbox']").length;
                if( l == l1){
                    _esp.parents(".ecity").find(".gareas").find("input[type='checkbox']").prop("checked",true);
                } else {
                    _esp.parents(".ecity").find(".gareas").find("input[type='checkbox']").removeAttr("checked");
                }

                if( l <= 0){
                    _esp.parents(".ecity").find(".check_num").text("");
                } else {
                    _esp.parents(".ecity").find(".check_num").text("("+l+")");
                }

                var l2 = _this.parents(".province-list").find(".gareas").find("input[type='checkbox']:checked").length;
                var l3 = _this.parents(".province-list").find(".gareas").find("input[type='checkbox']").length;
                if(l2 == l3){
                    _this.parents(".dcity").find(".group-label").find("input[type='checkbox']").prop("checked",true);
                } else {
                    _this.parents(".dcity").find(".group-label").find("input[type='checkbox']").removeAttr("checked");
                }
            });
        });

        $(".J_Province").click(function(){/*省复选框事件*/
            var _this = $(this);
            if(_this[0].checked == true){
                _this.parents(".ecity").find(".citys").find("input[type='checkbox']").prop("checked",true);
            } else {
                _this.parents(".ecity").find(".citys").find("input[type='checkbox']").removeAttr("checked");
            }

            var l = _this.parents(".province-list").find(".gareas").find("input[type='checkbox']:checked").length;
            var l1 = _this.parents(".province-list").find(".gareas").find("input[type='checkbox']").length;
            if(l == l1){
                _this.parents(".dcity").find(".gcity").find("input[type='checkbox']").prop("checked",true);
            } else {
                _this.parents(".dcity").find(".gcity").find("input[type='checkbox']").removeAttr("checked");
            }

            var l2 = _this.parents(".ecity").find(".citys").find("input[type='checkbox']:checked").length;

            if( l2 <= 0){
                _this.parents(".ecity").find(".check_num").text("");
            } else {
                _this.parents(".ecity").find(".check_num").text("("+l2+")");
            }
            
        });
    };

    tep.getArea = function(obj){
        var inp = obj.parents("table").find("input[name='express_areas_n2']"),l = inp.length;
        var ar = [];
        for(var i = 0; i < l; i++){
            ar = ar.concat($(inp[i]).val().split(","));
        }
        var no = obj.parent().find("input[name='express_areas_n2']").val().split(","), l1 = no.length;
        var l2 = ar.length;
        for(var i = 0; i < l2; i++){
            for(var j = 0; j < l1; j++){
                if( ar[i] == no[j]){
                    ar.splice(i,1);
                }
            }
        }
        return ar;
    };

    tep.cityhide = function(){
        $(".city-shadow").hide();
        $(".ks-dialog").hide();
    };

    tep.addCity = function(){

        var url = "http://m.qbao.com/api/v30/provinceCity/queryProvinceCity";
        // var url = "http://192.168.124.85:9096/api/v30/provinceCity/queryProvinceCity";
        $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            success: function(data) {
                if( data.responseCode == 1000 ) {
                    var html = '',r = data.data.list, l = r.length;
                    for(var i = 0; i < l; i++){
                        switch(r[i].name){
                            case "上海":
                                tep.addAjax(r[i].list,$("#sh"));
                                break;
                            case "江苏省":
                                tep.addAjax(r[i].list,$("#js"));
                                break;
                            case "浙江省":
                                tep.addAjax(r[i].list,$("#zj"));
                                break;
                            case "安徽省":
                                tep.addAjax(r[i].list,$("#ah"));
                                break;
                            case "江西省":
                                tep.addAjax(r[i].list,$("#jx"));
                                break;
                            case "北京":
                                tep.addAjax(r[i].list,$("#bj"));
                                break;
                            case "天津":
                                tep.addAjax(r[i].list,$("#tj"));
                                break;
                            case "山西省":
                                tep.addAjax(r[i].list,$("#sx"));
                                break;
                            case "山东省":
                                tep.addAjax(r[i].list,$("#sd"));
                                break;
                            case "河北省":
                                tep.addAjax(r[i].list,$("#hb"));
                                break;
                            case "内蒙古":
                                tep.addAjax(r[i].list,$("#nmg"));
                                break;
                            case "湖南省":
                                tep.addAjax(r[i].list,$("#hn"));
                                break;
                            case "湖北省":
                                tep.addAjax(r[i].list,$("#hub"));
                                break;
                            case "河南省":
                                tep.addAjax(r[i].list,$("#hen"));
                                break;
                            case "广东省":
                                tep.addAjax(r[i].list,$("#gd"));
                                break;
                            case "广西":
                                tep.addAjax(r[i].list,$("#gx"));
                                break;
                            case "福建省":
                                tep.addAjax(r[i].list,$("#fj"));
                                break;
                            case "海南省":
                                tep.addAjax(r[i].list,$("#han"));
                                break;
                            case "辽宁省":
                                tep.addAjax(r[i].list,$("#ln"));
                                break;
                            case "吉林省":
                                tep.addAjax(r[i].list,$("#jl"));
                                break;
                            case "黑龙江省":
                                tep.addAjax(r[i].list,$("#hlj"));
                                break;
                            case "陕西省":
                                tep.addAjax(r[i].list,$("#sax"));
                                break;
                            case "新疆":
                                tep.addAjax(r[i].list,$("#xj"));
                                break;
                            case "甘肃省":
                                tep.addAjax(r[i].list,$("#gs"));
                                break;
                            case "宁夏":
                                tep.addAjax(r[i].list,$("#nx"));
                                break;
                            case "青海省":
                                tep.addAjax(r[i].list,$("#qh"));
                                break;
                            case "重庆":
                                tep.addAjax(r[i].list,$("#cq"));
                                break;
                            case "云南省":
                                tep.addAjax(r[i].list,$("#yn"));
                                break;
                            case "贵州省":
                                tep.addAjax(r[i].list,$("#gz"));
                                break;
                            case "西藏":
                                tep.addAjax(r[i].list,$("#xz"));
                                break;
                            case "四川省":
                                tep.addAjax(r[i].list,$("#sc"));
                                break;
                            default:
                                break;
                        }
                    }
                } else {
                    tip(data.message);
                }
            },
            error: function() {
                tip("请求错误！");
            }
        });

        // tep.addAjax(2,$("#sh"));/*上海*/

        // tep.addAjax(11,$("#js"));/*江苏*/

        // tep.addAjax(12,$("#zj"));/*浙江*/

        // tep.addAjax(13,$("#ah"));/*安徽*/

        // tep.addAjax(15,$("#jx"));/*江西*/

        // tep.addAjax(1,$("#bj"));/*北京*/

        // tep.addAjax(3,$("#tj"));/*天津*/

        // tep.addAjax(6,$("#sx"));/*山西*/

        // tep.addAjax(16,$("#sd"));/*山东*/

        // tep.addAjax(5,$("#hb"));/*河北*/

        // tep.addAjax(7,$("#nmg"));/*内蒙古*/

        // tep.addAjax(19,$("#hn"));/*湖南*/

        // tep.addAjax(18,$("#hub"));/*湖北*/

        // tep.addAjax(17,$("#hen"));/*河南*/

        // tep.addAjax(20,$("#gd"));/*广东*/

        // tep.addAjax(21,$("#gx"));/*广西*/

        // tep.addAjax(14,$("#fj"));/*福建*/

        // tep.addAjax(22,$("#han"));/*海南*/

        // tep.addAjax(8,$("#ln"));/*辽宁*/

        // tep.addAjax(9,$("#jl"));/*吉林*/

        // tep.addAjax(10,$("#hlj"));/*黑龙江*/

        // tep.addAjax(27,$("#sx"));/*陕西*/

        // tep.addAjax(31,$("#xj"));/*新疆*/

        // tep.addAjax(28,$("#gs"));/*甘肃*/

        // tep.addAjax(30,$("#nx"));/*宁夏*/

        // tep.addAjax(29,$("#qh"));/*青海*/

        // tep.addAjax(4,$("#cq"));/*重庆*/

        // tep.addAjax(25,$("#yn"));/*云南*/

        // tep.addAjax(24,$("#gz"));/*贵州*/

        // tep.addAjax(26,$("#xz"));/*西藏*/

        // tep.addAjax(23,$("#sc"));/*四川*/
    };

    tep.addAjax = function(r, obj){
        var l = r.length, html = '';
        for(var i = 0; i < l; i++){
            var l1 = (r[i].id.toString()).length, nid = '';
            if(l1 < 6){
                switch(l1){
                    case 1:
                        nid = "00000" + r[i].id;
                        break;
                    case 2:
                        nid = "0000" + r[i].id;
                        break;
                    case 3:
                        nid = "000" + r[i].id;
                        break;
                    case 4:
                        nid = "00" + r[i].id;
                        break;
                    case 5:
                        nid = "0" + r[i].id;
                        break;
                    case 6:
                        nid = r[i].id;
                        break;
                    default:
                        break;
                }
            }
            html += '<span class="areas"><input type="checkbox" value="'+nid+'" class="J_City"><label>'+r[i].name+'</label></span>';
        }
        obj.find(".citys").prepend(html);
    };

    tep.init();
});