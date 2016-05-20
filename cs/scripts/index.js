//2015.12.10 by tuxuan
'use strict';

$(function() {
    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}
    var merchant_user_id = $.urlParam('shopUserId');
    var isorall=true;//是否是全部商品
    var scrollTop=740;
    var shopLable='认证';
    var clsName = 'lv1';
    var isLableType=false;
    var tagId=0;



    String.prototype.formatMoney=function(){
        var str=this.lostPrint();
        var strs = str.split('');
        var val = '' ;
        for(var i=0;i<strs.length;i++){
            if(i!=0&&i%3==0){
                val+=',';
            }
            val+= strs[i];
        }
        return val.lostPrint();
    }
    String.prototype.lostPrint=function(){
        var temp = this;
        var temps = temp.split('');
        var val = '';
        for(var i= temps.length-1;i>=0;i--){
            val += temps[i];
        }
        return val;
    }
    var url=(function(){
        var _base = "http://enterprise.qbao.com";
        //var _base = "http://192.168.74.242:80";
        //var merchant_user_id = '3897072';
        var display = 1;
        return{
            merchantType:{
                1:'个人商家',
                2:' 企业商家'
            },
            certifyLevel:{
                0:'',
                1:'普通',
                2:'金牌'
            },
            shoptype:{
                0:'ordinary',
                1:'authentication',
                2:'jinpai'
            },
            pageInfo:_base+'/merchant/shop/qry/getShopFrontPageInfo.html?display='+display+'&shopUserId='+merchant_user_id, //8343192
            shopList:_base+'/merchant/shop/qry/searchProducts.html?shopUserId='+merchant_user_id,    //加载全部商品
            shopTypes : _base +'/merchant/shop/qry/getProductsCategory.html?shopUserId='+merchant_user_id,   //商品分类 8343192
            newShopList : _base +'/merchant//shop/qry/getNewProducts.html?shopUserId='+merchant_user_id,
            shopDetail : _base +'/merchant/shop/qry/getShopDetail.html?shopUserId='+merchant_user_id,
            shopCount : _base +'/merchant/shop/qry/getProductsStatistics.html?shopUserId='+merchant_user_id,
            //newShopList : _base +'/searchProductsByTag.html?shopUserId='+merchant_user_id,//上新
            isorzx : _base + '/merchant/shop/qry/supportDecorateShop.html?shopUserId='+merchant_user_id,//是否支持装修 1 就是支持装修  0 就是不支持
            shyList : _base +'/merchant/shop/qry/listBusinessPartner.html?shopUserId='+merchant_user_id,//+merchant_user_id
            lableSearch : _base +'/merchant/shop/qry/searchProductsByTag.html?shopUserId='+merchant_user_id
        }
    }());
    var pageInfo={
        rzfalse :false,    //是否认证 false:未认证 true:认证
        fsfalse :false      //是否参与假一罚十 false:不参与 true:参与
    };
    var page = {}
    page.url = {
        getproduct: url.shopList
    };
    page.len = 8;
    page.pageNum = 0;
    page.sortBy = 2; //0:交易量,1:价格,2:上架时间
    page.orderBy = 0; //排序  0升序 1降序
    page.loadType = 0;  //全部：0 1：新品
    //page.current = function() {
    //    var val=$("#page").attr("currentpage")
    //    return parseInt(val);
    //}
    page.current = 1;
    $('.codeshow').hover(function(){
        if($(this).attr('vl') == 1) return false;
        $(this).addClass('codehover');
        $(this).find('p').show()
    },function(){
        if($(this).attr('vl') == 1) return false;
        $(this).removeClass('codehover');
        $(this).find('p').hide();
    });
    $('#page-photo').mouseenter(function(){
        $('#shop-desc').show(300);
    });
    $('#shop-desc').mouseleave(function(){
        $(this).hide(300);
    });
    $('.shop-type').mouseenter(function(){
        $('#shop-type-menu').show(300);
    });
    $('#shop-type').mouseleave(function(){
        $('#shop-type-menu').hide(300);
    });
    $('#pove-page').click(function(){
        if(page.current === page.pageNum)return false;
        //page.current-- ;
        page.next();
    });
    $('#photo-image').delegate('.close','click',function(){
        $('#photo-image').fadeOut(500);
    });
    function tip(msg){
        $('#page-tip').find('em').html(msg);
        $('#page-tip').show();
        setTimeout(function(){
            $('#page-tip').fadeOut(500);
        },3000);
    }
    $('.businessLicenseNumber').click(function(){
        var href=$(this).attr('key');
        //$('#photo-image');
        if(href){
            window.open(href);
        }else{
            tip('该商家尚未上传证书');
        }
    });
    $('#next-page').click(function(){
        if(page.current === 1) return false;
        //page.current ++ ;
        page.prev();
    });

    //价格排序
    $('#order-price').click(function(){
        var v = $(this).attr('curr');
        if(v == 'up'){
            $(this).attr('class','price-icon-down');
        }else{
            $(this).attr('class','price-icon-up');
        }
        $(this).attr('curr',v == 'up'?'down':'up');
        leftActivi(2);
        $('#keyword').removeAttr('tagId');
        page.orderBy= v=='up'?1:0;
        page.sortBy = 1;
        var val=$('#keyword').val();
        if(isLableType){
            page.getList({tagId:tagId,sortBy:page.sortBy,orderBy:page.orderBy});
        }else{
            page.getList({keyword:val,sortBy:page.sortBy,orderBy:page.orderBy});
        }
        //page.getList({keyword:val,sortBy:page.sortBy,orderBy:page.orderBy});
    });
    //综合
    $('#shop-all').click(function(){
        $('#order-price').attr('class','price-enable');
        leftActivi(0);
        $('#keyword').removeAttr('tagId');
        page.sortBy=2;
        page.orderBy=1;
        var val=$('keyword').val();
        if(isLableType){
            page.getList({tagId:tagId,sortBy:page.sortBy,orderBy:page.orderBy});
        }else{
            page.getList({keyword:val,sortBy:page.sortBy,orderBy:page.orderBy});
        }
    });
    $('#shop-lost-count').click(function(){
        $('#order-price').attr('class','price-enable');
        leftActivi(1);
        page.sortBy=0;
        page.orderBy=1;
        $('#keyword').removeAttr('tagId');
        var val=$('#keyword').val();
        if(isLableType){
            page.getList({tagId:tagId,sortBy:page.sortBy,orderBy:page.orderBy});
        }else{
            page.getList({keyword:val,sortBy:page.sortBy,orderBy:page.orderBy});
        }
        //page.getList({keyword:val,sortBy:page.sortBy,orderBy:page.orderBy});
    });
    $('#search').click(function(){
        $('#keyword').removeAttr('tagId');
        page.current=1;
        page.loadType = 0;
        var menus=$('#menus .type');
        isLableType=false;
        for(var i=0;i<menus.length;i++){
            var key=$(menus[i]).attr('key');
            if(key==0){
                $(menus[i]).addClass('select');
            }else{
                $(menus[i]).removeClass('select');
            }
        }
        $('.shop-tilte').show();
        var val = $('#keyword').val();
        page.getList({keyword:val,sortBy:page.sortBy,orderBy:page.orderBy});
        $('html, body, .content').animate({scrollTop: scrollTop}, 300);
    });
    $('#menus .type').click(function(){
        $('#menus .type').removeClass('select');
        $(this).addClass('select');
        var key = $(this).attr('key')==0;
        page.current = 1;
        isLableType=false;
        $('#keyword').val('');
        $('#keyword').removeAttr('tagId');
        var val = '';
        if(key){
            page.loadType = 0;
            //加载全部
            page.getList({keyword:val,sortBy:page.sortBy,orderBy:page.orderBy});
            $('.shop-tilte').show();
        }else{
            page.loadType = 1;
            //新品上架
            page.current=1;
            page.getNewList({keyword:val});
            $('.shop-tilte').hide();
        }
        $('html, body, .content').animate({scrollTop: scrollTop}, 300);
    });
    $('#shop-type-menu').delegate('li','mousemove',function(){
        $(this).addClass('move');
    });
    $('#shop-type-menu').delegate('li','mouseout',function(){
        $(this).removeClass('move');
    });
    $('#shop-type-menu').delegate('li','click',function(){
        var key=$(this).attr('key');
        var all=$('#menus').find('.select').attr('key')==0;
        $('#shop-type-menu li').removeClass('move');
        $(this).addClass('move');
        isLableType=true;
        tagId = key;
        if(all){
            page.loadType = 0;
            //加载全部
            page.current=1;
            page.getList({tagId:key,sortBy:page.sortBy,orderBy:page.orderBy});
            $('.shop-tilte').show();
        }else{
            page.loadType = 1;
            page.current=1;
            page.getList({tagId:key,sortBy:page.sortBy,orderBy:page.orderBy});
            $('.shop-tilte').show();
            //page.getNewList({keyword:key});
            //$('.shop-tilte').hide();
        }
        //$('#keyword').val($(this).text());
        //$('#keyword').attr('tagId',key);
        $('html, body, .content').animate({scrollTop: scrollTop}, 300);
    });
    //$('#shop-type-menu li').hover(function(){
    //
    //},function(){
    //
    //});
    function leftActivi(index){
        page.sortBy=index;
        page.current=1;
        $('.left-menu li').removeClass('shop-menu-activi');
        $('.left-menu li:eq('+index+')').addClass('shop-menu-activi');
    }

    var pageLoad=(function(){
        //加载店铺信息
        function shopInfo(fag){
            $.ajax({
                url:url.pageInfo,
                type:'post',
                success:function(resp){
                    if(resp.success){
                        var data=resp.data;
                        merInfoData(data,fag);
                    }else{
                        tip(resp.message);
                    }
                },
                error:function(XMLHttpRequest){
                    console.log("请求错误 商家没有信息");
                    if(XMLHttpRequest.status == 500){
                        //alert(XMLHttpRequest.readyState);
                        $("#banner, #page-syq").hide();
                    };
                }
            });
        }
        //获取商品数量
        function shopCount(){
            $.ajax({
                url:url.shopCount,
                type:'post',
                success:function(data){
                    if(data.success){
                        $('.goodsNumberOnSale').text(data.data.productsTotalCount);
                    }else{
                        tip(data.message);
                    }
                }
            });
        }
        //是否支持装修
        function isorzx(){
            $.ajax({
                url:url.isorzx,
                type:'post',
                async:false,
                success:function(data){
                    //console.log(data);
                    if(data.success){
                        if(data.data==1){
                            $('#banner').show();
                            $('#page-syq').show();
                        }else{
                            $('#banner').hide();
                            $('#page-syq').hide();
                        }
                        shopInfo(data.data==1);
                    }else{
                        tip(data.message);
                    }
                }
            });
        }
        function loadShopType(){
            $.ajax({
                url:url.shopTypes,
                type:'post',
                success:function(resp){
                    var data= resp.data;
                    if(resp.success){
                        if(data.length === 0){
                            //tip('没有更多分类标签');
                        }else{
                            bandShopTypes(data);
                        }
                    }else{
                        tip(resp.message);
                    }
                }
            });
        }
        function bandShopTypes(data){
            var html=[];
            for(var i=0;i<data.length;i++){
                html.push('<li key="'+data[i].labelId+'"><i></i>'+data[i].labelName+'</li>');
            }
            $('#shop-type-menu ul').html(html.join(''));
        }
        //绑定商家信息
        function merInfoData(data,fag){
            if(fag){
                if(data.cover){
                    $(".shopindextop").css("background-image","url("+data.cover+")");
                }
                if(data.logo){
                    $('.logo-icon').attr('src',data.logo);//替换logo
                }
            }else{
                if(scrollTop>400){
                    scrollTop-=350;
                }
            }
            $('.shopName').text(data.shopName);    //店铺名称
            $('.openTime').text(data.openTime.split(" ")[0]);    //开店时间
            $('.goodsNumberOnSale').text(data.goodsNumberOnSale); //商品数量
            if(data.merchantType==2){
                $('.certifyLevel-merchantType').text('企业商家');    //商家类型
                shopLable='企业';
                clsName='lv4';
            }else{
                //01个人普通  1个人认证  2个人金牌
                if(data.certifyLevel == 0){
                    $(".certifyLevel-merchantType").html("个人普通商家");
                    shopLable='普通';
                    clsName='lv2';
                }else if(data.certifyLevel == 1){
                    $(".certifyLevel-merchantType").html("个人认证商家");
                    shopLable='认证';
                    clsName='lv1';
                }else if(data.certifyLevel == 2){
                    shopLable='金牌';
                    clsName='lv3';
                    $(".certifyLevel-merchantType").html("个人金牌商家");
                };
            }
            $('.shoptype').addClass(clsName).text(shopLable);//商家等级
            if(data.merchantType === 1){
                $('.shop-enterprise').hide();
            }else{
                getEntInfo();
                $('.shop-enterprise').show();
            }
            $('.thumbsCount').text(data.thumbsCount);//赞
            var qrcode = new QRCode(document.getElementById("qrcode"), {
                width : 100,//设置宽高
                height : 100
            });
            try{
                qrcode.makeCode('http://enterprise.qbao.com/merchant/shop/qry/toWapShopHome.html?shopUserId='+merchant_user_id + "&interceptType=1");
            }catch(e){
                console.log(e);
            }
            //$('.shopQrCode').attr('src',data.shopQrCode);  //二维码
            pageInfo.fsfalse = data.falseOnePenaltyTen === 1;    //  1 是参与假一罚十
            pageInfo.rzfalse = data.certifyType === 1;           //  0 未认证  1已经认证
            banner.initBanner(data.displayBanners);//加载banner
            shopCount();
        }
        function getEntInfo(){
            $.ajax({
                url:url.shopDetail,
                type:'post',
                async:false,
                success:function(resp){
                    if(resp.success){
                        var data=resp.data;
                        $('.businessLicenseNumber').text(format(data.compantMerchantRegisterInfo.businessLicenseNumber,15)).attr('key',data.compantMerchantRegisterInfo.businessLicensePath);//营业执照
                        //$('#photo-image img').attr('src',);//图片
                        $('.compantMerchantRegisterInfo').text(format(data.compantMerchantRegisterInfo.taxNo,20)); //税务登记号
                        var stime = data.compantMerchantRegisterInfo.busnissAllotedTimeStart;
                        var etime = data.compantMerchantRegisterInfo.busnissAllotedTimeEnd;
                        if(stime == null && etime == null){
                            $(".businessTime").html("");
                        }else{
                            $(".businessTime").html(stime.split(" ")[0] + '&nbsp;至&nbsp;' + etime.split(" ")[0]);	          // 营业期限
                        };
                        //$('.businessTime').text(data.businessStartTime+'-'+data.businessEndTime); //有效期
                        $('.companyType').text(data.compantMerchantRegisterInfo.companyType);//公司类型
                        //个人普通  1个人认证商家  2个人金牌
                        //if(data.certifyLevel == 0){
                        //    $(".companyType").html("个人普通商家");
                        //}else if(data.certifyLevel == 1){
                        //    $(".companyType").html("个人认证商家");
                        //}else if(data.certifyLevel == 2){
                        //    $(".companyType").html("个人金牌商家");
                        //};
                        $('.principalName').text(data.compantMerchantRegisterInfo.principalName); //负责人
                    }else{
                        tip(resp.message);
                    }
                }
            });
        }


        //初始化
        function init(){
            $('#imlx').attr('href','http://enterprise.qbao.com/merchantUser/webchat/toIMIndex.html?_merchant_user_id_='+merchant_user_id+'&t=145138744888');
            //shopInfo();
            isorzx();
            loadShopType();
            loadCctj();
        }
        //加载橱窗推荐
        function loadCctj(){
            $.ajax({
                url:url.newShopList,
                type:'post',
                data:{currentPage: 1,
                    pageSize : 100},
                success:function(resp){
                    var html=[];
                    if(resp.success){
                        $(resp.data.products).each(function(i){
                            html.push(bandCctj(this,i));
                        });
                        if(html.length===0){
                            $('#cctj').hide();
                        }else{
                            var l=html.length%3;
                            for(var i=0;i<=l;i++){
                                html.push('<li class="enable"></li>');
                            }
                            $('#cctj ul').html(html.join(''));
                            $('#cctj').show();
                            var z=parseInt(html.length/3);
                            var h=[];
                            for(var i=0;i<z;i++){
                                h.push('<div class="curr"></div>');
                            }
                            $('#cctj').find('.shop-len').html(h.join(''));
                            $('#cctj').find('.shop-len').find('div:eq(0)').removeClass('curr');
                        }
                    }else{
                        $('#cctj').hide();
                        tip(resp.message);
                    }
                }
            });
        }
        //加载生意圈
        function loadShy(){
            $.ajax({
                url:url.shyList,
                type:'post',
                success:function(resp){
                    var html=[];
                    $(resp.data).each(function(){
                        var data=this;
                        html.push('<li>')
                        html.push('<a target="_blank" title="'+data.shopName+'" href="http://enterprise.qbao.com/merchant/shop/qry/toWebShopHome.html?shopUserId='+data.partnerUserId+'">');
                        html.push(' <div><img onerror="this.src=\'http://enterprise.qbao.com/business-center/images/userpicnone.gif\'" src="'+data.logo+'" alt=""/></div>');
                        html.push(' <div class="shop-name">'+format(data.shopName)+'</div>');
                        switch (data.status){
                            case 0:
                                html.push('<div class="shop-levle"><em class="lv2">普通</em></div>');
                                break;
                            case 1:
                                html.push('<div class="shop-levle"><em class="lv1">认证</em></div>');
                                break;
                            case 2:
                                html.push('<div class="shop-levle"><em class="lv3">金牌</em></div>');
                                break;
                            case 3:
                                html.push('<div class="shop-levle"><em class="lv4">企业</em></div>');
                                break;
                        }
                        html.push('</a>');
                        html.push('</li>');
                    });
                    $('#page-syq ul').html(html.join(''));
                    if(html.length===0){
                        $('#page-syq').hide();
                    }
                }
            });
        }
        function format(str,len){
            if(!len){
                len=6;
            }
            if(str&&str.length>len){
                return str.substring(0,len)+'...'
            }
            return str;
        }
        loadShy();
        init();
    }());
    //banner图滚动
    var banner=(function(){
        var banner= {};
        var index = 0;
        var $banner=$('#banner');
        var left = 1000;    //width
        var len  = $banner.find('ul li').length;
        var time = 5000;
        var click =true;
        function go(o){

            index = index < 0 ? 0 : index;
            var nowLeft = -index *left;
            //$banner.find('ul').stop(true,false).animate({"left":nowLeft},1000);
            //console.log(index);
            $banner.find('ul li:eq('+index+')').fadeIn(500).siblings('li').fadeOut(500);
            if(o === 1){
                //index = index >= len-1 ? 0 : index-1;
            }else{
                index = index >= len-1 ? 0 : index+1;
            }

        }
        var netGO = '';
        $('.icon').click(function(){
            window.clearInterval(netGO);
            var is = $(this).attr('op') == 'left';
            if(is){
                if(index === 0){
                    index = len-1;
                }else{
                    index--;
                }
                go(1);
            }else{
                index = click?1:index;
                click = false;
                go(null);
            };
            window.clearInterval(netGO);
            netGO=setInterval(function(){
                go(null);
            },time);
        });
        //初始化Banner
        banner.initBanner=function(displayBanners){
            var bars=[];
            if(displayBanners.length<=1){
                $('.icon').remove();
            }
            for(var i=0;i<displayBanners.length;i++){
                bars.push(' <li style="background-image:url('+displayBanners[i].imgPath+')"><div class="mengban"></div><a target="_blank" href="http://goods.qbao.com/info/product-detail.htm?spuId='+displayBanners[i].goodsId+'"> <img src="'+displayBanners[i].imgPath +'"/></a> </li>');
            }
            $('#banner ul').html(bars.join(''));
            len  = $banner.find('ul li').length;
            $('#banner ul li').hide();
            $('#banner ul').find('li:eq(0)').show();
            setInterval(function(){
                go(null);
            },time);
            $banner.find('li').mousemove(function(){
                window.clearInterval(netGO);
            }).mouseout(function(){
                netGO=setInterval(function(){
                    go(null);
                },time);
            });
            if(len===0){
                $('#banner').hide();
                scrollTop-=350;
            }
        }
        return banner;
    }());


    page.next = function() { //next
        var currentPage = page.current,
            totalPage = parseInt(page.totalPage());
        if (totalPage > currentPage) {
            page.current++;
            getKey();
        } else {
            return false;
        }
    }

    page.prev = function() { //prev
        var currentPage = page.current;
        if (currentPage > 1) {
            page.current = currentPage - 1;
            getKey();
        } else {
            return false;
        }
    }

    page.random = function(pageID) { //random page
        getKey(pageID);
    }

    page.totalPage = function() {
        return page.pageNum;
        //return 100;
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

    page.bandShop=function(data,index){
        var html = [];
        if(index %4=== 0){
            html.push('<li class="margin" shop-id="'+data.id+'">');
        }else{
            html.push('<li shop-id="'+data.id+'">');
        }
        html.push(' <a target="_blank" href="http://goods.qbao.com/info/product-detail.htm?spuId='+ data.id +'">');
        html.push(' <dl>');
        html.push('     <dt><img src="'+data.mainImg+'"/></dt>');
        html.push('     <dd>');
        html.push('         <div class="shop-tit">');
        html.push('             <div class="item-title">'+data.spuName+' </div>');
        html.push(          '<i class="rz '+clsName+'">'+shopLable+'</i>');
        html.push('         </div>');
        html.push('         <div class="item">');
        var txt = data.viewPrice==null?'<b>价格面议</b>':'<b>'+(data.viewPrice+'').formatMoney()+'</b>&nbsp;钱宝币';
        html.push('             <div class="money">'+txt+'</div>');
        html.push('             <div class="lost">已售<em>'+data.salesNumAggregated+'</em></div>');
        html.push('         </div>');
        html.push('         <div class="item">');
        html.push(              pageInfo.rzfalse ? '         <b class="j">劵</b>&nbsp;':'');
        html.push(              pageInfo.fsfalse ? '<b class="f">罚</b>':'');
        html.push('         </div>');
        html.push('     </dd>');
        html.push(' </dl>');
        html.push(' </a>');
        html.push('</li>');
        return html.join('');
    }
    //绑定橱窗推荐
    function bandCctj(data,index){
        var html = [];
        if(index %3=== 0){
            html.push('<li class="margin" shop-id="'+data.id+'">');
        }else{
            html.push('<li shop-id="'+data.id+'">');
        }
        html.push(' <a target="_blank" href="http://goods.qbao.com/info/product-detail.htm?spuId='+ data.id +'">');
        html.push(' <dl>');
        html.push('     <dt><img src="'+data.mainImg+'"/></dt>');
        html.push('     <dd>');
        html.push('         <div class="shop-tit">');
        //html.push('             <div class="item-title">'+data.spuName+' </div>');
        html.push('             <div class="item-title">随碟附送开发商来克服了是否是否是理发店地方 </div>');
        html.push(          '<i class="rz '+clsName+'">'+shopLable+'</i>');
        html.push('         </div>');
        html.push('         <div class="item">');
        var txt = data.viewPrice==null?'<b>价格面议</b>':'<b>'+(data.viewPrice+'').formatMoney()+'</b>&nbsp;钱宝币';
        html.push('             <div class="money">'+txt+'</div>');
        html.push('             <div class="lost">已售<em>'+data.salesNumAggregated+'</em></div>');
        html.push('         </div>');
        html.push('         <div class="item">');
        html.push(              pageInfo.rzfalse ? '         <b class="j">劵</b>&nbsp;':'');
        html.push(              pageInfo.fsfalse ? '<b class="f">罚</b>':'');
        html.push('         </div>');
        html.push('     </dd>');
        html.push(' </dl>');
        html.push(' </a>');
        html.push('</li>');
        return html.join('');
    }

    page.getList = function(option) { //@pageID
        var href=page.url.getproduct;
        var key=$('#keyword').attr('tagId');
        if(option.tagId||key){
            href=url.lableSearch;
        }
        $.ajax({
            type: "POST",
            url: href,
            dataType: "json",
            data: {
                keyWord: option.keyword,
                sortBy: option.sortBy,
                orderBy: option.orderBy,
                currentPage: page.current,
                pageSize : page.len,
                tagId :option.tagId
            },
            success: function(resp) {
                if (resp.success) {
                    var data = resp.data.products;
                    var totalCount = resp.data.totalCount;
                    page.pageNum = totalCount % page.len == 0 ? parseInt(totalCount / page.len) : parseInt(totalCount / page.len) + 1;
                    $('#page-status').text((page.pageNum===0?0:page.current)+'/'+page.pageNum);
                    if (totalCount) {
                        var shops=[];
                        for(var i = 0;i<data.length;i++){
                            shops.push(page.bandShop(data[i],i));
                        }
                        $('#shop-list .shop-list').html(shops.join(''));
                    } else {
                        $('#shop-list .shop-list').empty().append('<div class="not-shop">没有商品</div>');
                        page.pageNum=0;
                        page.init(0);
                        return false;
                    }
                    //tem_position.empty().append(pList.join(""));
                    page.init(page.current);
                } else {
                    tip(resp.message);
                }
            },
            error: function(data) {
                tip("请求失败");
            }
        });
    }
    page.getNewList=function(option){
        $.ajax({
            type: "POST",
            url: url.newShopList,
            dataType: "json",
            data: {
                keyWord: option.keyword,
                currentPage: page.current,
                pageSize : page.len
            },
            success: function(resp) {
                if (resp.success) {
                    var data = resp.data.products;
                    var totalCount = resp.data.totalCount;
                    page.pageNum = totalCount % page.len == 0 ? parseInt(totalCount / page.len) : parseInt(totalCount / page.len) + 1;
                    $('#page-status').text((page.pageNum===0?0:page.current)+'/'+page.pageNum);
                    if (totalCount) {
                        var shops=[];
                        for(var i = 0;i<data.length;i++){
                            shops.push(page.bandShop(data[i],i));
                        }
                        $('#shop-list .shop-list').html(shops.join(''));
                    } else {
                        page.pageNum=0;
                        page.init(0);
                        $('#shop-list .shop-list').empty().append('<div class="not-shop">没有商品</div>');
                        return false;
                    }
                    page.init(page.current);
                } else {
                    tip(resp.message);
                }
            },
            error: function(data) {
                tip("请求失败");
            }
        });
    }
    page.getList({keyword:'',sortBy:2,orderBy:1});

    $("#page").delegate("em", "click", function() {
        var pageID = parseInt($(this).html());
        page.current = pageID;
        page.init(pageID);
        getKey();
        $("#page").attr("currentpage", pageID);
    });
    //上一页
    $("#page").delegate("b:first", "click", function() {
        page.prev();
        page.init(page.current);
    });
    //下一页
    $("#page").delegate("b:last", "click", function() {
        page.next();
        page.init(page.current);
    });
    function getKey(){
        if(isLableType){
            page.getList({tagId:tagId,sortBy:page.sortBy,orderBy:page.orderBy});
        }else{
            if(page.loadType === 0){
                page.getList({keyword:'',sortBy:page.sortBy,orderBy:page.orderBy});
            }else{
                var val = $('#keyword').val();
                page.getNewList({keyword:val});
            }
        }
        $('html, body, .content').animate({scrollTop: scrollTop}, 300);
    };

    //  添加优惠券
    var addCoupon = {
        shopUserId:$.urlParam("shopUserId"),
        // shopUserId:3971104,
        //shopUserId:3971104,
        cpUuid:'',
        userId:QB.config.userId,
        userName:QB.config.userName,
        couponList:function(){
             if(addCoupon.userId == undefined || addCoupon.userName == undefined){
                addCoupon.userId = "";
                addCoupon.userName = "";
            }

            $.ajax({
                url: "http://enterprise.qbao.com/cart1/coupon/list.html?userId="+addCoupon.userId+"&userName="+addCoupon.userName+"&sellerId="+addCoupon.shopUserId+'&pageNum=1'+'&pageSize=100',
                type: "POST",
                async:false,
                contentType: "application/json; charset=utf-8",
                //data: '{"sellerId":' + addCoupon.shopUserId +',"pageNum":' + 1 +',"pageSize":'+ 100 +'}',
                success: function(data, status, jqXHR) {
                      if(data && data.code == 1000) {
                            var _data = data.data;
                            addCoupon.couponDataCtn(_data);  
                        } else {
                          console.log("Coupons interface without success！");
                      }
                  },
                  error: function(XMLHttpRequest){
                    console.log("Coupons request error！");
                  }
            });
        },
        couponDataCtn:function(data){
            var Html = '';
            for(var i=0; i<data.length; i++){ 
                Html += '<li class="newspecified" data-id="'+ data[i].cpUuid +'">'+
                            '<p class="money"><em>'+ data[i].ruleValue.split(",")[1] +'</em>钱宝币</p>'+
                            '<p>满'+ data[i].ruleValue.split(",")[0] +'钱宝币使用</p>'+
                            '<p class="data">有效期：'+ data[i].effectiveTimeStart.split(" ")[0] +'至'+ data[i].effectiveTimeEnd.split(" ")[0] +'</p>'+
                            '<div class="lq"><b>立即领取 <i class="arrow"></i> </b></div>'+
                        '</li>';
            }
            $("#coupon .list-li").append(Html);
            $("#coupon .list-li .lq b").hover(function(){
                $(this).find(".arrow").css("background-position","-25px 0");
            },function(){
                $(this).find(".arrow").css("background-position","-1px 0");
            });

            $("#coupon .list-li .lq b").click(function(){
                addCoupon.cpUuid = $(this).parents("li").data("id");

                if(JSON.stringify(QB.config) == "{}"){
                    var str = location.href;
                    location.href = "http://passport.qbao.com/cas/webQbaoLogin?service=" + str;
                }else{
                    addCoupon.userId = QB.config.userId;
                    addCoupon.userName = QB.config.userName;
                }

                $.ajax({
                    url: "http://enterprise.qbao.com/cart1/coupon/get.html?cpUuid="+ addCoupon.cpUuid+ "&userId="+ addCoupon.userId+"&userName"+addCoupon.userName,
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType:"json",
                    success: function(data, status, jqXHR) {
                        var _data = data;
                        if(_data.success) {
                                var tt = '<i class="ionic"></i>领取成功'
                                prompt(tt);
                            } else {
                                // var messText = _data.message;
                                // if(messText.indexOf("timeout")>=0){
                                //     var str = location.href;
                                //     location.href = "http://passport.qbao.com/cas/webQbaoLogin?service=" + str;
                                // }
                                prompt(_data.message);
                          };
                      },
                      error: function(XMLHttpRequest){
                        console.log("receive coupons error！");
                      }
                });
            });
            function prompt(text){
                $("body").append('<div class="promptCover">'+ text +'</div>');
                var width = $(".promptCover").outerWidth();
                $(".promptCover").css("margin-left",-(width/2)/100+"rem").fadeIn("slow");
                setTimeout(function(){
                    $(".promptCover").fadeOut("slow").remove();
                },1000);
            };

            var coupon=(function(){
                //li宽度
                var w_li=243;
                //间隔
                var mar_li=6;
                //ul宽度
                var w_ul=864;
                //总宽度
                var width=$('.list-li').find('li').length*(w_li+mar_li)-w_ul-mar_li;
                //每次移动
                var move=240;
                var currLeft=0;
                
                $('#coupon').delegate('.menu','click',function(){
                    if($(".list-li li").length > 4){
                        var key=$(this).attr('key');
                        if(key == 'left'){
                            left();
                        }else{
                            right();
                        }
                    };
                });
                 
                
                function left(){
                    currLeft-=move;
                    if(currLeft<=0||currLeft<move*2){
                        currLeft=0;
                    }
                    $('.list-li').stop(true,false).animate({"left":-currLeft},1000);
                }
                function right(){
                    currLeft+=move;
                    if(currLeft>=width){
                        currLeft=width;
                    }
                    $('.list-li').stop(true,false).animate({"left":-currLeft},1000);
                }
            }());
        },
    }

    addCoupon.couponList();

    //优惠卷
    
    //totalprice = String(totalprice).replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
 });
