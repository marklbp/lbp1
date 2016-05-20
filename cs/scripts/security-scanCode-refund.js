$(function(){

  function setKeyPos(o){
    $(".ui-keyboard").css({
        "left":o.offset().left-285,
        "top":o.offset().top+24
    })
  }
  $("#password").keyboard({
      openOn : null,
      stayOpen : true,
      layout : 'qwerty',
      display:{'lock':'Caps'}
  })

  $("#rnKey").bind("click",function(){
      var _this = $(this);
      if($(".ui-keyboard").length){
          return false;
      } 
      $("#password").getkeyboard().reveal();

      setKeyPos(_this);
      $(window).resize(function(){
          setKeyPos(_this);
      })
  })

  var ssr = {};
  var ssrData = {
    buyerId:'',
    totalAmountData:'',
    usernameData:'',
    ssrbbData:'',
    ssrbqData:''
  }

  //placeholder
  ssr.inputFocus = function(){
    //判断浏览器是否支持placeholder属性
    supportPlaceholder='placeholder'in document.createElement('input'),
    placeholder=function(input){
      var text = input.attr('placeholder'),
      defaultValue = input.defaultValue;
   
      if(!defaultValue){
        input.val(text).addClass("phcolor");
      }
   
      input.focus(function(){
        if(input.val() == text){
          $(this).val("");
        }
      });
   
      input.blur(function(){
        if(input.val() == ""){
          $(this).val(text).addClass("phcolor");
        }
      });
   
      //输入的字符不为灰色
      input.keydown(function(){
        $(this).removeClass("phcolor");
      });
    };
   
    //当浏览器不支持placeholder属性时，调用placeholder函数
    if(!supportPlaceholder){
      $('input').each(function(){
        text = $(this).attr("placeholder");
        if($(this).attr("type") == "text"){
          placeholder($(this));
        }
      });
    }
  };
  ssr.inputFocus();

  $(".searchBtn").click(function(){
      commissionEvent.commissionListAjax();
  });

  var ajaxUrl = {
    queryListUrl: "http://oc.qbao.com/order/seller/o2o/refund/query.html",
    refundUrl:"http://oc.qbao.com/order/seller/o2o/refund/refund.html"
  };

  //订单查询
  var commissionEvent = {
    commissionListAjax: function(){
      var buyerAccnum = $.trim($("input[name='buyerAccnum']").val()),
          orderNum = $.trim($("input[name='orderNum']").val());
          if ( buyerAccnum == '' ) {
              commissionEvent.errortip("账号不能为空！");
              return;
          }else if ( orderNum == '' ) {
              commissionEvent.errortip("订单号不能为空！");
              return;
          };
          ssrData.usernameData = buyerAccnum;
      if( /^[0-9]*$/.test(orderNum)){
          var dataJson = {
            "userName":buyerAccnum,
            "orderId":orderNum
          };
          
          $.ajax({
                url: ajaxUrl.queryListUrl,
                type: "post",
                dataType: "json",
                data: dataJson,
                async: false,
                success: function(msg) {
                    commissionEvent.commissionListAjaxBack(msg);
                },
                error: function() {
                    commissionEvent.errortip("请求错误！");
                }
            });
      } else {
          commissionEvent.errortip("订单编号只能输入数字，请重新输入！");
      }
    },
    commissionListAjaxBack: function(data) {
        $(".listMain").children().remove();
        var html = '';//roleIds是数组
        if( !data.success ) {
            html += '<ul class="listTit"><li>买家账号</li><li>支付（元）</li><li>支付宝券</li>'+
                      '<li>支付总额</li><li>操作</li></ul>'+
                      '<p class="orderTip">'+ data.message +'</p>'
        } else {
            ssrData.buyerId = data.data.buyerId;
            ssrData.totalAmountData = data.data.totalAmount;
            ssrData.ssrbbData = data.data.qbAmount;
            ssrData.ssrbqData = data.data.bqAmount;
            $(".totalRefund").text( data.data.totalAmount );
            $(".ssr-refundBb").text( $.trim($("input[name='rnInput']").val()) );
            $(".ssr-refundBq").text( data.data.bqAmount );
            html += '<ul class="listTit"><li>买家账号</li><li>支付（元）</li><li>支付宝券</li>'+
                      '<li>支付总额</li><li>操作</li></ul>'+
                    '<ul class="listContent">'+
                      '<li>'+ data.data.buyerName +'</li>'+
                      '<li>'+ data.data.qbAmount +'</li>'+
                      '<li>'+ data.data.bqAmount +'</li>'+
                      '<li style="color:#e77d00;">'+ data.data.totalAmount +'</li>'+
                      '<li class="refundBtn" style="color:#e77d00;">退款</li>'+
                    '</ul>';
        }
        $(".listMain").append( html );
           $(".refundBtn").on("click",function(){
            $(".ssr-refundAmount").show();
            $(".ssr-blackBg").show();
          })

    },
    errortip: function(message) {
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
  };

  var viewHeight = $(document).height();
  $(".ssr-blackBg").css({
    height:viewHeight
  })
  
  $(".popBox-close,.popBox-cancel").bind("click",function(){
    $(".ssr-blackBg").hide();
    $("#rnInput").val("");
    $("#password").val("");
    $(this).parents(".ssr-popBox").css("display","none");
  })

  //退款
  var refundEvent = {
    refundAjax:function(){
      var rnInput = parseFloat($.trim($("input[name='rnInput']").val()))*100,
          orderNum = $.trim($("input[name='orderNum']").val()),
          password = $.trim($("input[name='password']").val());
          /*password = $.md5(password + "{" + ssrData.usernameData + "}");
          password = password.substr(-32);*/
      var refundDataJson={
          "buyerId":ssrData.buyerId,
          "returnAmount":rnInput,
          "orderId":orderNum,
          "password":password
      };
      
      $.ajax({
          url: ajaxUrl.refundUrl,
          type: "POST",
          dataType: "json",
          async: false,
          data: refundDataJson,
          success: function(data) {
            if ( data.success ) {
              $(".ssr-refundAmount").hide();
              $(".ssr-refundSuccess").show();
            }else{
              refundEvent.errorTipPopbox(data);
            }
          },
          error: function() {
              commissionEvent.errortip("请求错误！");
          }
        })
    },
    errorTipPopbox:function(data){
      var html = '';
      $(".ssr-refundfail").find(".popBox-main").children().remove();
      html += '<div class="popBox-fail">'+
                '<img src="/images/ssr-fail.png" />'+
                '<p>退款失败</p>'+
                '<span>原因：'+ data.message +'</span>'+
              '</div>';
      $(".ssr-refundfail").find(".popBox-main").append( html );
      $(".ssr-refundfail").show();
    },
    limitNumTwo:function(num,tar){
            var inputVal =  $(tar).val(),dotNum = inputVal.replace(/[^\d\.]/g,"");
            if ( dotNum.match( /\./g ) ) {
                if ( dotNum.match( /\./g ).length > 1 ) {
                    dotNum = dotNum.substring(0,dotNum.length-1);
                }
           }
            if ( dotNum.indexOf(".")>-1 && dotNum.split(".")[1].length > 2 ) {
                dotNum = dotNum.substring(0,dotNum.length-1);
            }
            $(tar).val( dotNum );
        },
    rnInputCheck:function(){
      $("#rnInput").bind("keydown keyup",function(e){
        var rnInputVal = $("#rnInput").val();
        
        if ( parseFloat(rnInputVal) > parseFloat(ssrData.totalAmountData) ) {
          e.preventDefault();
          $("#rnInput").val( rnInputVal.substring(0,rnInputVal.length-1) );
        };
        refundEvent.limitNumTwo( rnInputVal,e.target );
      })
    }
  }
  refundEvent.rnInputCheck();



  $(".popBox-sure").bind("click",function(){
    $(".ssr-refundAmount").hide();
    refundEvent.refundAjax();
  })

  var sqc = {};
  sqc.getqrCode = function(){
    jQuery.urlParam = function(name){
      var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,''])[1];
      return "http://o2o.qbao.com/pay/"+decodeURIComponent(result);
    }
   // console.log( $.urlParam("_merchant_user_id_") )
    $(".sqc-codeImg").qrcode({
        render : "table",
        width  : 130,       
        height : 130,
        text   : $.urlParam("_merchant_user_id_")
    });
    $(".sqc-codeImg").on("mousemove","table",function(){
      $(this).attr("title", $.urlParam("_merchant_user_id_"))
    })
  }
  sqc.getqrCode();
})
