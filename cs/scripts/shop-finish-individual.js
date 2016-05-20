

function tip(message) {
    if(message==''||message==undefined||message.length==0||typeof (message)!='string')return false;
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

(function() {
    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}
     var merchant_user_id = $.urlParam('_merchant_user_id_');
    //var merchant_user_id = '8343192';
    var typeModule= $('.tabs').find('.active').attr('type')=='web'? 1 : 2;
    try{
         $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
             managerName: "商家管理",
             name: "店铺装修"
         }));
    }catch(e){
        console.log(e);
    }

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
    }

    var userAgent = navigator.userAgent.toLowerCase(); 
    var browser = { 
        version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1], 
        safari: /webkit/.test( userAgent ), 
        opera: /opera/.test( userAgent ), 
        msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ), 
        mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent ) 
    };

    function uploadLogo(o, file, progress, fn) {
        var iframe = false;
        if(browser.msie  && browser.version < 10){
            iframe = true;
        }
        o.fileupload({
            url: banner.url.head + banner.url.uploadImg,
            dataType: 'json',
            iframe: iframe,
            formData: {
                name: file
            }
        }).on('fileuploadprogressall', function(e, data) {
            //todo
            progress.call(this, arguments);
        }).on('fileuploaddone', function(e, data) {
            //todo
            if ( data.result ) {
                if (data.result.data) {
                    fn.call(this, data);
                } else {
                    tip(data.result.message);
                    $uploadObj.find(".upload-image-name").html("<img src='" + uploadImgUrl + "' />")
                }
            } else {
                tip("上传错误!");
            }
            console.log(getNaturalWidth(uploadImgUrl));
        }).on('fileuploadfail', function(e, data) {
            tip("上传错误!");
        });
    };

    function uploadImg(o, file) {
        var iframe = false;
        if(browser.msie  && browser.version < 10){
            iframe = true;
        }
        o.fileupload({
            url: banner.url.head + banner.url.uploadImg,
            dataType: 'json',
            iframe: iframe,
            dataType: 'json',
            formData: {
                name: file
            }
        }).on('fileuploadprogressall', function(e, data) {
            //todo
            var p = $(this).parents("tr");
            if ( p.find(".upload-image-name img").length == 0 ) {
            } else {
                uploadImgUrl = p.find(".upload-image-name").find("img")[0].src;
            }
            p.find(".upload-wrap").css("background", "url(/images/rzwait.gif) center center no-repeat")
            p.find(".upload-image-name").html("").attr("key", 0);
        }).on('fileuploaddone', function(e, data) {
            if ( data.result ) {
                if (!data.result.data) {
                    var p = $(this).parents("tr");
                    p.find(".upload-image-name").html("<img src='" + uploadImgUrl + "' />").attr("key", 1);
                    tip(data.result.message);
                } else {
                    var p = $(this).parents("tr"),
                        d = data.result,
                        key = Number(p.find(".join-product").attr("key")),
                        havaRecode = p.attr("have"),
                        btn = "";
                    if (p.find(".empty-upload")) {
                        p.find(".empty-upload").remove();
                    }
                    p.find(".upload-wrap").css("background-image", "none");
                    p.find(".upload-image-name").html("<img src='" + d.data.imageUrl + "' />").attr("key", 1);
                    p.find(".upload-wrap").addClass("have-banner");
                    if (havaRecode == "ok") {
                        btn = banner.option.btn.template("use-btn save-btn", "", "保存");
                    } else {
                        if (key) {
                            btn = banner.option.btn.template("use-btn save-btn", "", "保存");
                        } else {
                            btn = banner.option.btn.template("save-btn", "disabled", "保存");
                        }
                    }
                    p.find("td:eq(4)").html(btn);
                }
            } else {
                tip("上传错误!");
            }
            

        }).on('fileuploadfail', function(e, data) {
            tip("上传错误!");
        });
    };

    var dialog = {},
        banner = {};
    var uploadImgUrl = "", $uploadObj = $("#shopCover");

    dialog.setPosition = function(obj) {
        if (!obj) return false;
        var height = obj.height();
        obj.css("margin-top", -height / 2);
    }
    dialog.open = function(obj) {
        $(obj).find('.dialog-search').find('input').val('');
        $(obj).find('tbody').html('');
        dialog.setPosition(obj);
        obj.show();
        $(".shadow:eq(0)").show();
    }
    dialog.close = function(obj) {

        obj.hide();
        $(".shadow:eq(0)").hide();
    }
    banner.url = {
         head: "http://enterprise.qbao.com",
        //head: "http://192.168.75.36:80",
        initPage: "/cooperatorShop/decoration/getShopLogoAndCover.html?_merchant_user_id_="+merchant_user_id,  //加载logo 封面
        // getList: "/company/merchant/banner/list.html?_merchant_user_id_="+merchant_user_id,
        getList: "/cooperatorShop/decoration/listBanner.html?_merchant_user_id_="+merchant_user_id,
        add: "/cooperatorShop/decoration/updateShopBanner.html?_merchant_user_id_="+merchant_user_id,
        update: "/cooperatorShop/decoration/updateShopBanner.html?_merchant_user_id_="+merchant_user_id,
        check: "/company/merchant/banner/approval/check.html?_merchant_user_id_="+merchant_user_id,
        uploadImg: "/qiniu/image/upload.html?_merchant_user_id_="+merchant_user_id,
        // logo: "/company/merchant/shop/logo/update.html?_merchant_user_id_="+merchant_user_id, //标识
        logo: "/cooperatorShop/decoration/updateShopImg.html?_merchant_user_id_="+merchant_user_id, //标识
        cover: "/cooperatorShop/decoration/updateShopImg.html?_merchant_user_id_="+merchant_user_id, //封面 
        del: "/cooperatorShop/decoration/removeBanner.html?_merchant_user_id_="+merchant_user_id,
        shStatus : "/cooperatorShop/decoration/getShopLogoApply.html?_merchant_user_id_="+merchant_user_id,
        getShops : "/cooperatorShop/decoration/listBusinessPartner.html?_merchant_user_id_="+merchant_user_id, //获取生意圈列表
        deleteShops : "/cooperatorShop/decoration/removeBusinessPartner.html?_merchant_user_id_="+merchant_user_id, //删除生意圈
        getListShop :"/cooperatorShop/decoration/businessPartner.html?_merchant_user_id_="+merchant_user_id,
        addShops: "/cooperatorShop/decoration/makeBusinessPartner.html?_merchant_user_id_="+merchant_user_id

    };
    // 获取logo审核状态
    function getShStatus(){ 
        $.ajax({
            url:banner.url.head+banner.url.shStatus,
            type:'post',
            async:false,
            success:function(resp){
                if(!resp.success)return false;
                if (resp.data.logoPath) {
                    $("#shopLogo>div").css("background-image", "none").addClass("have-banner");
                    $("#shopLogo .upload-image-name").html('<img src="' + resp.data.logoPath + '" />');
                }
                switch(resp.data.status){
                    case 0:
                        $('#sh-status').html('审核中').attr('class','shz');
                        $('#disable-logo').show();
                        break;
                    case 1:
                        $('#sh-status').html('审核通过').attr('class','shtg');
                        break;
                    case 2:
                        $('#sh-status').html('审核不通过（'+resp.data.description+'）').attr('class','shz');
                        break;
                }

            }
        });
    }
    function tabsReload(){
        // initPage();
        banner.option.getList();
    }
    banner.option = {
        btn: '<input class="tool-btn {optionbtn}" {disabled} type="button" name="" value="{toolbtn}" />',
        getList: function() {
            $("#bannerList tbody").children().remove();
            var temp = $("#addBanner").val(),
                empty = $("#nullBanner").val()
            $.ajax({
                type: "POST",
                url: banner.url.head + banner.url.getList,
                dataType: "json",
                async:false,
                data:{'display':typeModule},
                success: function(data) {
                    getShStatus();
                    if (data.success) {
                        var c = data.data,
                            d = c.list,
                            len = d.length,
                            tem = "",
                            j = 0;
                        for (var i = 0; i < 5; i++) {
                            if (i < len) {
                                var joinBtn = "",
                                    joinproduct = '<h3>' + d[i].goodsName + '</h3><p pid="' + d[i].goodsId + '">ID：' + d[i].goodsId + '</p>';
                                if (d[i].checkStatus != 1) {
                                    joinBtn = banner.option.btn.template("use-btn join-btn", "", "替换"); //status(d[i].checkStatus)["desc"].template(d[i].checkTime) , status(d[i].checkStatus)["btn"]
                                    tem = temp.template(i + 1, d[i].id, "have-banner", d[i].imgPath, i, d[i].goodsImg, joinBtn, joinproduct);
                                } else {
                                    joinBtn = banner.option.btn.template("join-btn", "disabled", "替换")
                                    tem = temp.template(i + 1, d[i].id, "", d[i].imgPath, i, d[i].goodsImg, joinBtn, joinproduct, status(d[i].checkStatus)["desc"].template(d[i].checkTime), status(d[i].checkStatus)["btn"]);
                                }
                                $("#bannerList tbody").append(tem);
                            } else {
                                $("#bannerList tbody").append(empty.template(i + 1, i, i));
                                uploadImg($("#bannerList .empty-upload").eq(j), "file" + i);
                                j++;
                            }
                            uploadImg($("#bannerList .reupload").eq(i), "reupload" + i);
                        }
                        if (c.cover) {
                            $("#shopCover>div").addClass("have-banner");
                            $("#shopCover .upload-image-name").html('<img src="' + c.cover + '" />');
                        }else{
                            $("#shopCover>div").css("background-image", "http://enterprise.qbao.com/business-center/images/add-df.png").removeClass("have-banner");
                            $("#shopCover .upload-image-name").html('<img/>');
                        }
                        $(".deleteBtn").on("click", function() {
                            var _this = $(this);
                            var bannerId = parseFloat( _this.parents("tr").find("td").eq(1).text() );
                            if(confirm('是否删除？')){
                                var url = banner.url.head + banner.url.del;
                                var dataJson ={'id':bannerId};
                                $.ajax({
                                    type: "POST",
                                    url: url,
                                    dataType: "json",
                                    async:false,
                                    data: dataJson,
                                    success: function(data) {
                                        if (data.success) {
                                            banner.option.getList();
                                        } else {
                                            tip(data.message);
                                        }
                                    },
                                    error: function(message) {
                                        tip(message);
                                    }
                                });
                            }
                        });
                    }else{
                        if(data.data==-1){
                            $('#disable').show();
                        }
                    }

                },
                error: function(message) {
                    tip(message);
                }
            });

        },
        add: function(url, goodsID, p) {
            $.ajax({
                type: "POST",
                url: banner.url.head + banner.url.add,
                dataType: "json",
                async:false,
                data: {
                    imgPath: url,
                    goodsId: goodsID,
                    type:0,
                    display:typeModule
                },
                success: function(data) {
                    if (data.success) {
                        banner.option.getList();
                    } else {
                        tip(data.message);
                    }
                },
                error: function(message) {
                    tip(message);
                }
            });
        },

        update: function(id, url, goodsID, p) {
            $.ajax({
                type: "POST",
                url: banner.url.head + banner.url.update,
                async:false,
                dataType: "json",
                data: {
                    id: id,
                    imgPath: url,
                    goodsId: goodsID,
                    type:1,
                    display:typeModule
                },
                success: function(data) {
                    if (data.success) {
                        banner.option.getList();
                    } else {
                        tip(data.message);
                    }
                },
                error: function(message) {
                    tip(message);
                }
            });
        },

        check: function(id, fn) {
            $.ajax({
                type: "POST",
                url: banner.url.head + banner.url.check,
                dataType: "json",
                async:false,
                data: {
                    id: id
                },
                success: function(data) {
                    if (data.success) {
                        fn.call(this, data);
                    }
                },
                error: function(message) {
                    tip(message);
                }
            });
        },

        ckType: function(status) {
            if (status.toString().length == 0) return false;
            var desc = '',
                btn = banner.option.btn,
                reason = "<p>很抱歉，您上传的banner不符合规范，无法通过审核，请您重新上传。<i></i></p>";
            switch (status) {
                case 0:
                    desc = "";
                    btn = btn.template("use-btn check-btn", "", "提交审核");
                    break;
                case 1:
                    desc = '<div class="upload-check">审核中</div>';
                    btn = btn.template("check-btn", "disabled", "提交审核");
                    break;
                case 2:
                    desc = '<div class="upload-check">审核通过</div><div class="check-time">{time}</div>';
                    btn = btn.template("check-btn", "disabled", "提交审核");
                    break;
                case 3:
                    desc = '<div class="upload-check">审核未通过' + reason + '</div><div class="check-time">{time}</div>';
                    btn = btn.template("check-btn", "disabled", "提交审核");
                    break;
                default:
                    desc = "";
                    btn = btn.template("use-btn check-btn", "", "提交审核");
                    break;
            }
            return {
                desc: desc,
                btn: btn
            };
        },
        updateImg: function(url, option) {
            $.ajax({
                type: "POST",
                url: banner.url.head + url,
                dataType: "json",
                async:false,
                data: option,
                success: function(data) {
                    if (data.success) {
                        getShStatus();
                    }
                },
                error: function(message) {
                    tip(message);
                }
            });
        }
    };

    //初始化
    banner.option.getList();
    //商家标识
    uploadLogo($("#bz"), "newbz", function() {
        if ($("#shopLogo .upload-image-name img").length == 0) {
        } else {
            uploadImgUrl = $("#shopLogo .upload-image-name img")[0].src;
        }
        $("#shopLogo .upload-image-name img")[0].height
        $uploadObj = $("#shopLogo");
        $("#shopLogo .upload-image-name").html("");
        $("#shopLogo>div").css("background-image", "url(/images/rzwait.gif)");
    }, function(data) {
        var imgUrl = data.result.data.imageUrl;
        $(this).remove();
        $("#shopLogo>div").css("background-image", "none").addClass("have-banner");
        $("#shopLogo .upload-image-name").html('<img src="' + imgUrl + '" />');
        banner.option.updateImg(banner.url.logo, {
            imgPath: imgUrl,
            type:1 //1:logo 2:cover
        });
    });
    function getNaturalWidth(img) {
        var image = new Image()
        image.src = img.src
        var naturalWidth = image.width
        var naturalHeight= image.height;
        return {
            height:naturalWidth,
            width:naturalHeight
        }
    }


    uploadLogo($("#rebz"), "bz", function() {
        if ($("#shopLogo .upload-image-name img").length == 0) {
        } else {
            uploadImgUrl = $("#shopLogo .upload-image-name img")[0].src;
        }
        $uploadObj = $("#shopLogo");
        $("#shopLogo .upload-image-name").html("");
        $("#shopLogo>div").css("background-image", "url(/images/rzwait.gif)");
    }, function(data) {
        var imgUrl = data.result.data.imageUrl;
        $("#shopLogo>div").css("background-image", "none").addClass("have-banner");
        $("#shopLogo .upload-image-name").html('<img src="' + imgUrl + '" />');
        banner.option.updateImg(banner.url.logo, {
            imgPath: imgUrl,
            type:typeModule
        });
        //getShStatus();
    });
    //商家封面
    uploadLogo($("#cov"), "newcov", function() {
        // $("#shopCover .upload-image-name").html("");
        if ($("#shopCover .upload-image-name img").length == 0) {
        } else {
            uploadImgUrl = $("#shopCover .upload-image-name img")[0].src;
        }
        $uploadObj = $("#shopCover");
        $("#shopCover .upload-image-name").html("");
        $("#shopCover>div").css("background-image", "url(/images/rzwait.gif)");
    }, function(data) {
        var imgUrl = data.result.data.imageUrl;
        $(this).remove();
        $("#shopCover>div").css("background-image", "none").addClass("have-banner");
        $("#shopCover .upload-image-name").html('<img src="' + imgUrl + '" />');
        banner.option.updateImg(banner.url.cover, {
            imgPath: imgUrl,
            type:2, //loge:1 cover:2
            display: typeModule
        });
    });

    uploadLogo($("#recov"), "cov", function() {
        //$("#shopCover .upload-image-name").html("");
        if ($("#shopCover .upload-image-name img").length == 0) {
        } else {
            uploadImgUrl = $("#shopCover .upload-image-name img")[0].src;
        }
        $uploadObj = $("#shopCover");
        $("#shopCover .upload-image-name").html("");
        $("#shopCover>div").css("background-image", "url(/images/rzwait.gif)");
    }, function(data) {
        var imgUrl = data.result.data.imageUrl;
        $("#shopCover>div").css("background-image", "none").addClass("have-banner");
        $("#shopCover .upload-image-name").html('<img src="' + imgUrl + '" />');
        banner.option.updateImg(banner.url.cover, {
            imgPath: imgUrl,
            type:2,
            display: typeModule
        });

    });
    document.onkeydown=function(event){
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if(e.keyCode === 9){
            var a=$('.tabs').find('.active');
            if($(a).hasClass('app')){
                $('.tabs').find('.pc').addClass('active');
                $('.tabs').find('.app').removeClass('active');
            }else{
                $('.tabs').find('.pc').removeClass('active');
                $('.tabs').find('.app').addClass('active');
            }
            typeModule=$('.tabs .active').attr('type')=='web'?1:2;
            //初始化
            if(typeModule === 1){
                $('#app-size').hide();
                $('#pc-size').show();
                $('#disable-logo').hide();
            }else{
                $('#app-size').show();
                $('#pc-size').hide();
                $('#disable-logo').show();
            }
            var d=$('.dialog').eq(0);
            dialog.close(d);
            var dialogBox = $(".dialog-shops").eq(0);
            dialog.close(dialogBox);
            banner.option.getList();
            var len=$('#shy').find('tbody').find('tr').length;
            if(len>=8||typeModule===2){
                //tip('关联朋友圈不能超过11个');
                $('#addshy').hide();
                return false;
            }else{
                $('#addshy').show();
            }
            return false;
        }
    };

    $("#bannerList").delegate('.save-btn', 'click', function() {
        var p = $(this).parents("tr"),
            goodsID = p.find(".join-info>p").attr("pid"),
            imgUrl = p.find(".upload-image-name>img").attr('src'),
            havaRecode = p.attr("have");
        if (havaRecode == "ok") {
            banner.option.update(p.find("td:eq(1)").html(), imgUrl, goodsID, p);
        } else {
            banner.option.add(imgUrl, goodsID, p);
        }

    });

    $("#bannerList").delegate('.check-btn', 'click', function() {
        var p = $(this).parents("tr"),
            id = p.find("td:eq(1)").html(),
            ck = banner.option.ckType(1);
        banner.option.check(id, function(data) {
            banner.option.getList();
        });

    });

    //关联商品 
    $("#bannerList").delegate('.join-btn', 'click', function() {
        var dialogBox = $(".dialog").eq(0);
        dialog.setPosition(dialogBox);
        dialog.open(dialogBox);
        $("#mainContent input[type='radio']").attr("checked", false);
        $("#bannerSelect").attr("bannerID", $(this).parents("tr").index());
    });
    $(".dialog-close,.cancle-btn").bind("click", function() {
        var dialogBox = $(".dialog").eq(0);
        dialog.close(dialogBox);
    });

    $("#mainContent").delegate("input[type='radio']", 'change', function() {
        var index = $(this).parents("tr").index(),
            value = [];
        value.push($(this).parents("tr").find(".image-box>img").attr("src"));
        value.push($(this).parents("tr").find(".product-detail>h4").html());
        value.push($(this).parents("tr").find(".product-id>span").html());
        $("#bannerSelect").val(value.join(","));
    });

    $("#confirmBtn").bind('click', function() {
        var v = $("#bannerSelect").val().trim().split(","),
            dialogBox = $(".dialog").eq(0),
            index = $("#bannerSelect").attr("bannerID");
        if ($("#bannerSelect").val().trim().length != 0) {
            var o = $("#bannerList tbody tr").eq(index),
                key = Number(o.find(".upload-image-name").attr("key")),
                havaRecode = o.attr("have"),
                btn = "";
            o.find(".join-image>div").html("<div class='imgbox'><img src='" + v[0] + "' /></div>");
            o.find(".join-btn").val("替换");
            o.find(".join-info>h3").html(v[1]);
            o.find(".join-info>p").html("ID:" + v[2]).attr("pid", v[2]);
            $("#bannerSelect").val("").attr("bannerID", "");
            o.find(".join-product").attr("key", 1);
            if (havaRecode == "ok") {
                btn = banner.option.btn.template("use-btn save-btn", "", "保存");
            } else {
                if (key) {
                    btn = banner.option.btn.template("use-btn save-btn", "", "保存");
                } else {
                    btn = banner.option.btn.template("use-btn save-btn", "disabled", "保存");
                }
            }
            o.find("td:eq(4)").html(btn);
            dialog.close(dialogBox);
        } else {
            tip("请选择商品！");
        }

    });

    function timeFormat(time) {
        var d = new Date(time),
            day = [d.getFullYear(), d.getMonth() + 1, d.getDate()],
            times = [d.getHours(), d.getMinutes(), d.getSeconds()]
        return day.join("-") + " " + times.join(":");
    }

    function timeFormatStr(time) {
        return time.split(" ")[0] + " " + time.split(" ")[1];
    }

    function getKey(pageID) {

        var key = $("#mainContent .select-search:eq(0)").attr("key"),
            value = $("#productCondition").val().trim();
        if (key == "name") {
            var reg1 = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
            if (!reg1.test(value) && value.length != 0) {
                tip("请输入合法的商品名称！");
                return false;
            }
            page.pageNum=pageID;
            page.getList(pageID, value,"");
        } else {
            var reg2 = /^[0-9]+$/;
            if (!reg2.test(value) && value.length != 0) {
                tip("请输入正确的商品ID！");
                return false;
            }
            page.pageNum=pageID;
            page.getList(pageID, "", value);
        }
    }

    function setM(money) {
        var reg = /(\d{1,3})(?=(\d{3})+(?:$|\.))/g;
        try{
            return money.toString().replace(reg, "$1,");
        }catch(e){
            return '价格面议';
        }
    }

    var page = {};
    page.url = {
        // getproduct:banner.url.head+'/cooperatorShop/decoration/getProducts'
        //getproduct:"http://enterprise.qbao.com/merchant/shop/qry/getProducts.html?set=1"

        //getproduct:"http://enterprise.qbao.com/merchant/shop/qry/searchProducts.html"
        getproduct:"http://enterprise.qbao.com/merchant/shop/qry/searchProductsByNameOrId.html"
        // getproduct:"http://192.168.103.132:9020/api/shop/product.html?shopUserId=1779040&userId=0&sortBy=1&orderBy=1&pageIndex=1"
        // getproduct: "http://goods.qbao.com/goodsProduct/getSpuFromSolr.html?_merchant_user_id_=3972532" //merchant_user_id //获取商品list
    };

    page.len = 3;
    page.pageNum = 1;
    page.current = function() {
        return $("#page").attr("currentpage");
    }
    page.next = function() { //next
        var currentPage = parseInt(page.current()),
            totalPage = parseInt(page.totalPage());
        if (totalPage > currentPage) {
            currentPage = currentPage + 1;
            //page.getList(currentPage, option.name, option.id);
            getKey(currentPage);
        } else {
            return false;
        }
    }

    page.prev = function() { //prev
        var currentPage = parseInt(page.current());
        if (currentPage > 1) {
            currentPage = currentPage - 1;
            //page.getList(currentPage, option.name, option.id);
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

    page.getList = function(pageID, supName, supId) { //@pageID
        var tem_position = $('#mainContent tbody');
        if (pageID == undefined) {
            tem_position.empty().append('<tr><td colspan="6" style="padding:20px 0;">没有关联商品</td></tr>');
            return false;
        }
        var option={
            "shopUserId":merchant_user_id,
            "currentPage":page.pageNum,
            "pageSize":page.len
        };
        if(supName==undefined||supName.length==0){
            option.spuId=supId;
        }
        if(supId==undefined||supId.length==0){
            option.supName=supName;
        }
        $.ajax({
            type: "POST",
            url: page.url.getproduct,
            data:option,
            async:false,
            success: function(data) {
                var succ=data.success;
                var oldData=data;
                if(option.spuId){
                    try{
                        data=page.foramtData(data.data);
                    }catch(e){
                        console.log(e);
                    }
                }
                if (succ) {
                    var total = 0;
                    if(data.data.totalCount % page.len===0){
                        total =data.data.totalCount/page.len;
                    }else{
                        total =parseInt(data.data.totalCount/page.len)+1;
                    }
                    var list = data.data.products,
                        pTemp = $("#productTemp").val(),
                        pList = [];
                    if (total) {
                        for (var i = 0; i < list.length; i++) {
                            var p = list[i];                //timeFormatStr()
                            pList.push(pTemp.template(p.mainImg, p.spuName, p.id, p.viewPrice == 0 ? "面议" : setM(p.viewPrice)));
                        }
                    } else {
                        tem_position.empty().append('<tr><td colspan="6" style="padding:20px 0;">没有关联商品</td></tr>');
                        $("#page").hide().html("");
                        return false;
                    }
                    page.pageNum = total;
                    tem_position.empty().append(pList.join(""));
                    $("#page").attr({
                        "currentpage": pageID
                    });
                    page.init(pageID);
                } else {
                    tip(oldData.message);
                }
            },
            error: function(data) {
                tip("请求失败");
            }
        });
    }

    page.foramtData=function(d){
        var data={};
        data['data']=new Object();
        data.data['totalCount']=1;
        data.data['products']=new Array();
        data.data.products=[{
            id: d.productId,
            mainImg:d.mainImg,
            spuName:d.productName,
            viewPrice: d.productPriceFen
        }];
        data.message= d.message;

        return data;
    }


    //page.getList(1);

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

    $("#mainContent .dialog-search").find("span").hover(function() {
        $(">dl", $(this)).show();
    }, function() {
        $(">dl", $(this)).hide();
    });

    $("#mainContent dd").bind('click', function() {
        $(".select-search").eq(0).html($(this).html()).attr("key", $(this).attr("value"));
        $(this).parent().hide();
    });

    $("#searchBtn").bind('click', function() {
        getKey(1);
    });
    $('.tabs').delegate('.menu','click',function(){
          $('.tabs li').removeClass('active');
          $(this).addClass('active');
          typeModule=$(this).attr('type')=='web'?1:2;
        if(typeModule === 1){
            $('#app-size').hide();
            $('#pc-size').show();
            $('#disable-logo').hide();
        }else{
            $('#app-size').show();
            $('#pc-size').hide();
            $('#disable-logo').show();
        }
        var len=$('#shy').find('tbody').find('tr').length;
        if(len>=8||typeModule===2){
            //tip('关联朋友圈不能超过11个');
            $('#addshy').hide();
        }else{
            $('#addshy').show();
        }
          //初始化
          banner.option.getList();
    });
    //编辑
    $('#shy').delegate('.edit','click',function(){
        var p = $(this).parents("tr");
        var html = '';
        html+='<td>';
        html+='<div class="upload-wrap">';
        html+='<div class="upload-image-name" key="0">';
        html+='<img src="images/add.png" alt="添加图片" />';
        html+='</div>';
        html+='<div class="upload-shadow"></div>';
        html+='<div class="upload-image-option">';
        html+='';
        //html+='<input type="file" name="reupload{i}" value="" class="upload-banner reupload" />';
        html+='</div>';
        html+='<input type="file" name="file{i}" value="" class="upload-banner empty-upload" />';
        html+='</div>';
        //html+='<p class="upload-tip"></p>';
        html+='</td>';
        html+='<td><input name="account" type="text" value=""/>';
        html+='</td>';
        html+='<td><input name="status" type="text" value=""/></td>';
        html+='<td>';
        html+='<input class="tool-btn use-btn save" type="button" name="" value="保存" />';
        html+='</td>';
        $(p).html(html);
        $('')
    });
    //删除
    $('#shy').delegate('.delete','click',function(){
        if(typeModule === 2 ){
            tip('app装修不能删除生意圈');
            return false;
        }
        if(confirm('是否删除?')){
            deleteShops($(this).attr('key'));
        }
    });
    //新增
    $('#shy').delegate('.add','click',function(){
        initShyDialog();
        if(typeModule === 2 ){
            tip('app装修不能新增生意圈');
            return false;
        }
        var len=$('#shy').find('tbody').find('tr').length;
        if(len>=8){
            //tip('关联朋友圈不能超过11个');
            $('#addshy').hide();
            return false;
        }
        var dialogBox = $(".dialog-shops").eq(0);
        dialog.setPosition(dialogBox);
        dialog.open(dialogBox);
    });

    function initShyDialog(){
        $('#shops-dialog tbody').html('');
        $('#shopName').val('');
        $('#account').val('');
    }

    $(".dialog-shops-close,.cancle-shop-btn").bind("click", function() {
        var dialogBox = $(".dialog-shops").eq(0);
        dialog.close(dialogBox);
    });
    $('#shops-dialog').delegate('.shops-add','click',function(){
        var checks=$('#shops-dialog').find('input[name="checkshop"]:checked');
        if(checks.length===0){
            tip('至少选择一个');
            return false;
        }
        for(var i=0;i<checks.length;i++){
            var account=$(checks[i]).attr('account');
            var status=$(checks[i]).attr('key');
            var shopId=$(checks[i]).val();
            addShops({account:account,status:status,shopId:shopId});
        }
        var dialogBox = $(".dialog-shops").eq(0);
        dialog.close(dialogBox);
        loadListShops();
    });
    $('#shops-dialog').delegate('.search','click',function(){
        getShops();
    });
    //加载生意圈
    function loadListShops(){
        $.ajax({
            url:banner.url.head+banner.url.getShops,
            type:'post',
            success:function(data){
                if(data.success){
                    var html=[];
                    $(data.data).each(function(){
                        html.push(tr(this));
                    });
                    $('#shy tbody').html(html.join(''));
                    var len=data.data.length;
                    if(len>=8||typeModule===2){
                        //tip('关联朋友圈不能超过11个');
                        $('#addshy').hide();
                        return false;
                    }else{
                        $('#addshy').show();
                    }
                }else{
                    tip(data.message);
                }
            }
        });
    }
    function deleteShops(id){
        $.ajax({
            url:banner.url.head+banner.url.deleteShops,
            type:'post',
            data:{id:id},
            success:function(data){
                if(data.success){
                    tip('删除成功');
                    loadListShops();
                    var len=$('#shy').find('tbody').find('tr').length;
                    if(len>=8){
                        //tip('关联朋友圈不能超过11个');
                        $('#addshy').hide();
                        return false;
                    }
                }else{
                    tip(data.messgae);
                }
            }
        });
    }
    loadListShops();
    //创建一行
    function tr(data){
        var html=[];
        html.push('<tr>');
        html.push('  <td><img onerror="this.src=\'http://enterprise.qbao.com/business-center/images/userpicnone.gif\'" src="'+data.logo+'" alt="" style="float:left;padding-left:20px;"/>');
        html.push('    <div  style="float: left;width: 200px;text-align: left;padding: 10px;word-break:break-all;">'+data.shopName+'</div>');
        html.push('          </td>');
        html.push('     <td>'+data.account);
        html.push(' </td>');
        var txt='';
        switch (data.status){
            case 0:
                txt='普通';
                break;
            case 1:
                txt='认证';
                break;
            case 2:
                txt='金牌';
                break;
            case 3:
                txt='企业';
                break;
        }
        html.push('<td>'+txt+'商家</td>');
        html.push('<td> <input key="'+data.id+'" class="tool-btn use-btn delete" type="button" name="" value="删除" /></td>');
        html.push(' </tr>')
        return html.join('');
    }
    //获取店铺信息
    function getShops(){
        $.ajax({
            url:banner.url.head+banner.url.getListShop,
            type:'post',
            data:{
                shopName:$('#shopName').val(),
                account:$('#account').val()
            },
            success:function(resp){
                if(resp.success){
                    var html=[];
                    $(resp.data).each(function(){
                        html.push(createTr(this));
                    });
                    if(html.length===0){
                        html.push('<tr><td colspan="4" align="center"><h3>没有数据<h3></td></tr>');
                    }
                    $('#shops-dialog tbody').html(html.join(''));
                }else{
                    tip(resp.message);
                }
            }
        });
    }
    function addShops(option){
        $.ajax({
            url:banner.url.head+banner.url.addShops,
            type:'post',
            async:false,
            data:{
                account:option.account,
                status:option.status,
                shopId:option.shopId
            },
            success:function(data){
                if(data.success){
                    tip('添加成功');
                }else{
                    tip(data.message);
                }
            }
        });
    }

    function createTr(data){
        var html=[];
        var key=3;
        if(data.status==0||data.status==1||data.status==2){
            key=1;
        }
        html.push('<tr>');
        html.push('<td><input account="'+data.account+'"  value="'+data.shopId+'" key="'+key+'" name="checkshop" type="checkbox"/></td>');
        html.push('<td><img onerror="this.src=\'http://enterprise.qbao.com/business-center/images/userpicnone.gif\'" src="'+data.logo+'" alt="" style="float:left;padding-left:20px;"/>');
        html.push('<div  style="float: left;width: 100px;text-align: left;padding: 10px;word-break:break-all;">'+data.shopName+'</div>');
        html.push('</td>');
        html.push('<td>'+data.account+'</td>');
        var txt='';
        switch (data.status){
            case 0:
                txt='个人';
                break;
            case 1:
                txt='认证';
                break;
            case 2:
                txt='金牌';
                break;
            case 3:
                txt='企业';
                break;
        }
        html.push('<td>'+txt+'商家</td>');
        return html.join('');
    }
})(window);

QB.SiteMenu.activeOn('#shop-finish');
