(function(global,a){

	var IMTip=a();


	IMTip.init('',function(){
		var that = this;
		  $("#tip-alert-warp").click(function() {
		    	that.closeTip();
		  })

	})

	if("function"==typeof define){
		return define(function(){
		  return IMTip
		})
	}else{
		global.__IMTip=global.IMTip;
		global.IMTip=IMTip;
	}


})(this,function(){

	var inited=false;

	return {

		HTML:  "<div id='tip-alert-shadow'></div>"
	          + "<div id='tip-alert-warp'>"
	          +   "<div id='tip-alert-box'>"
	          +     "<img style='margin:50px auto;' src='{{baseUrl}}im-loading.gif' />"
	          +     "<div id='tip-alert-content'></div>"
	          +   "</div>"
	          + "</div>"

	    ,init: function(baseUrl,callback){


	    	if(!inited){

	    		  $("body").append(this.HTML.replace(/{{[^{}]+}}/g,baseUrl));

	    		  inited = true;

	    	}

	    	

	    	"function" == typeof callback && callback.call(this);

	    	return this;

	    }

	    ,openTip: function (msg, timeout) {

		    $("#tip-alert-content").html(msg);
		    if ($("#tip-alert-shadow").is(":hidden")) {
		      $("#tip-alert-shadow").fadeIn(200);
		      $("#tip-alert-warp").fadeIn(200);
		    }
		    if (timeout) {
		      setTimeout($.proxy(closeTip,this), timeout);
		    }

		}

	    ,closeTip:  function () {

	    	$("#tip-alert-shadow").fadeOut(200);
	    	$("#tip-alert-warp").fadeOut(200);

	  	}

	  	,extend:function(a){
			return $.extend(this,a||{})
		}
	}

})