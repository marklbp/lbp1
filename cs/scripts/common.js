$(function() {
    $(".bussiness-shop-con .shop-list").hover(function(){
    	var _this = $(this), width = _this.width() + 43;
    	var left = _this.offset().left - 1, top = _this.offset().top - 1;
    	_this.addClass("dialogShow");
    	if(( left-1000 ) < 0){
    		$(".bussiness-shop-dialog").show().css({"width":width+"px",left:left+"px",top:top+"px"});
        	$(".bussiness-shop-dialog").find(".shop-count").css("padding-left",22+"px");
    	}
    	if(	left < 0 ) {
    		$(".shop-dialog").hide();
    	}
        if(_this.hasClass("dialogShow")){
        	$(".bussiness-shop-dialog").hover(function(){
        		$(this).show();
                if(_this.hasClass("dialogShow")){
                    if(!_this.hasClass("shopOn")){
                        $(".c333").removeClass("c333");
                        _this.find(".name").addClass("c333");
                    }
                }
        	},function(){
        		$(this).hide();
                if(_this.hasClass("dialogShow")){
                    if(!_this.hasClass("shopOn")){
                        _this.find(".name").removeClass("c333");
                    }
                }
        	});

        	$(".bussiness-shop-dialog").on("click",function(){
        		$(".shopOn").removeClass("shopOn");
		    	if(_this.hasClass("shopOn")){
		    		_this.removeClass("shopOn");
		    	} else {
		    		_this.addClass("shopOn");
		    	}
        	});

        }
    },function() {
        $(".bussiness-shop-dialog").hide();
    });

    $(".bussiness-shop-con .shop-list").on("click", function(e) {
    	var _this = $(this);
    	
    	if(_this.hasClass("shopOn")){
    		_this.removeClass("shopOn");
    	} else {
    		var left = _this.offset().left - 1, width = _this.width() + 43;
    		if(( left-1000 ) < width){
    		} else {
    			$(".shopOn").removeClass("shopOn");
    			_this.addClass("shopOn");
    		}
    	}
    	e.stopPropagation();
    });

    $(".bussiness-aside .aside-list li a,.bussiness-aside .aside-list li em").on("click", function(){
    	var _this = $(this);
    	if(_this.parents("li").hasClass("clickOn")){
    		_this.parents("li").removeClass("clickOn");
    		_this.parents("li").find("ul").show();
    		_this.parents("li").find("em").removeClass("eOn");
    	} else {
    		_this.parents("li").addClass("clickOn");
    		_this.parents("li").find("ul").hide();
    		_this.parents("li").find("em").addClass("eOn");
    	}
    });

    num = 0;
    maxwidth = 1650;
    $(".bussiness-shop-con>div").css("width",maxwidth+"px");
    $(".bussiness-shop-crumbs .leftBtn").on("click", function() {
    	var $shop = $(".bussiness-shop-con"),width = 0;
    	var shopLength = $shop.find(".shop-list").length;
    	for(var i = 0; i < shopLength; i++) {
    		width = width + $($shop.find(".shop-list")[i]).width();
    	}
    	
    	if( width < 960 ) {
    		return;
    	} else {
    		num = $shop.find(".srollOn").index() - 1;
    		if( num <= -1) { return; }
    		$(".srollOn").removeClass("srollOn");
    		$shop.find(".shop-list").eq(num).addClass("srollOn");
    		var marginL = 0;
    		for( var j = 0 ; j < num; j ++ ) { 
    			marginL = marginL + $($shop.find(".shop-list")[j]).width() + 44;
    		}
    		$(".bussiness-shop-con>div").animate({"margin-left":-marginL+"px"});
    	}
    });

    $(".bussiness-shop-crumbs .rightBtn").on("click", function() {
    	var $shop = $(".bussiness-shop-con"),width = 0;
    	var shopLength = $shop.find(".shop-list").length;
    	for(var i = 0; i < shopLength; i++) {
    		width = width + $($shop.find(".shop-list")[i]).width();
    	}
    	
    	if( width < 960 ) {
    		return;
    	} else {
    		num = $shop.find(".srollOn").index() + 1;
			var marginL = 0;
			for( var j = 0 ; j < num; j ++ ) { 
				marginL = marginL + $($shop.find(".shop-list")[j]).width() + 44;
			}
			if( (maxwidth - marginL) < 980){
				marginL = maxwidth - 980;
			} else {
				$(".srollOn").removeClass("srollOn");
				$shop.find(".shop-list").eq(num).addClass("srollOn");
			}
			$(".bussiness-shop-con>div").animate({"margin-left":-marginL+"px"});
    	}
    });
});