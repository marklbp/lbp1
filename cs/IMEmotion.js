  (function(global,a){

      var ExpressionPlugin=a();

      //表情模块初始化
      ExpressionPlugin.init(function(){

        var that=this;

        //大小表情切换
        $("#smile_panel").on("click","#tab_Smile>li", function() {

          if($(this).hasClass("active"))return;
          $(this).addClass("active").siblings("li").removeClass("active");
          $("#smile_panel>.panel-body>.row").eq($(this).index()).show().siblings(".row").hide()

        }).on("click", "#normalSmile .thumbnail",function() {

          //小表情点击

          var ele = $(this);
          var smile = ele.attr("name");
          smile = "[" + smile + "]";
          that.insertAtCaret($("#input_message").get(0), smile);
          that.openSmilePanel();

        }).on("click","#bigSmile .thumbnail",  function() {

          //大表情点击

          var ele = $(this);
          var smile = ele.attr("name");
          smile = "[smiley][#" + smile + "][\/smiley]";
          im.commitBigExpress(smile);
          that.openSmilePanel();

        });

        //开启表情框
        $("#span-face").click(function() {
          that.openSmilePanel();
        });

        //点击页面其他地方关闭表情框
        $(document).on("click", function(e) {
            var $target=$(e.target);
            var $len=$target.parents("#smile_panel").length;
            if("span-face"==e.target.id||$len>0)return;
            that.closeSmilePanel();
        });

      });


      if("function"==typeof define){
        return define(function(){
          return ExpressionPlugin
        })
      }else{
        global.__ExpressionPlugin=global.ExpressionPlugin;
        global.ExpressionPlugin=ExpressionPlugin;
      }


  })(this,function(){

      var inited = false;

      //表情插件
      return {

         //表情基地址
        smile_url : "http://enterprise.qbao.com/webChat/business-center/images/"

        //小表情数组
        ,baseData: [
          ["微笑", "expression_01.png"],
          ["郁闷", "expression_02.png"],
          ["花心", "expression_03.png"],
          ["惊讶", "expression_04.png"],
          ["流泪", "expression_05.png"],
          ["害羞", "expression_06.png"],
          ["无语", "expression_07.png"],
          ["尴尬", "expression_08.png"],
          ["生气", "expression_09.png"],
          ["鬼脸", "expression_10.png"],
          ["奸笑", "expression_11.png"],
          ["抓狂", "expression_12.png"],
          ["兴奋", "expression_13.png"],
          ["坏笑", "expression_14.png"],
          ["苦笑", "expression_15.png"],
          ["冷汗", "expression_16.png"],
          ["不满", "expression_17.png"],
          ["鄙视", "expression_18.png"],
          ["挖鼻", "expression_19.png"],
          ["亲亲", "expression_20.png"],
          ["瞌睡", "expression_21.png"],
          ["赞同", "expression_22.png"],
          ["反对", "expression_23.png"],
          ["鼓掌", "expression_24.png"],
          ["爱心", "expression_25.png"],
          ["鲜花", "expression_26.png"],
          ["猪头", "expression_27.png"],
          ["酷哥", "expression_28.png"]
        ]

        //大表情数组
        ,extraData: [
          ["加油", "qb_jy.png"],
          ["可爱", "qb_keai.png"],
          ["困", "qb_kun.png"],
          ["坏笑", "qb_hxiao.png"],
          ["大哭", "qb_dk.png"],
          ["庆祝", "qb_qz.png"],
          ["微笑", "qb_wx.png"],
          ["惊讶", "qb_jya.png"],
          ["晕", "qb_yun.png"],
          ["流汗", "qb_lh.png"],
          ["生气", "qb_sq.png"],
          ["疑问", "qb_yw.png"],
          ["着急", "qb_zj.png"],
          ["花心", "qb_hx.png"],
          ["足球", "qb_zq.png"],
          ["钱多多", "qb_qdd.png"]
        ]

        //初始化表情模块
        ,init:function(callback){
          if(!inited){
            this.createSmilePanel();
            inited = true;
          }
          "function" == typeof callback&&callback.call(this);
          return this;
        }

        //隐藏或显示表情框
        ,openSmilePanel: function() {
          var display = document.getElementById("smile_panel").style.display;
          if (display == "" || display == "none") {
            document.getElementById("smile_panel").style.display = "block";
          } else {
            document.getElementById("smile_panel").style.display = "none";
          }
        }

        //隐藏表情框
        ,closeSmilePanel: function() {
          document.getElementById("smile_panel").style.display = "none";
        }

        //表情框dom渲染
        ,createSmilePanel: function() {
          var html = "";
          for (var i = 0; i < this.baseData.length; i++) {
            html   += '<div class="div-face-list">'
                   +   '<a href="javascript:void(0)" name="' + this.baseData[i][0] + '"class="thumbnail" style="margin:3px;">'
                   +     '<img src="' + this.smile_url + this.baseData[i][1] + '"  style="" />'
                   +   '</a>'
                   + '</div>'
          }
          //初始化小表情
          $("#normalSmile").html(html);

          var html2 = "";
          for (var i = 0; i < this.extraData.length; i++) {
            html2   += '<div class="div-face-list">'
                    +   '<a href="javascript:void(0)" name="' + this.extraData[i][0] + '"class="thumbnail" style="margin:3px;">'
                    +     '<img src="' + this.smile_url + this.extraData[i][1] + '" style="" />'
                    +   '</a>'
                    + '</div>'
          }
          //初始化大表情
          $("#bigSmile").html(html2);

        }

        //输入框焦点位置插入表情
        ,insertAtCaret: function(ele, myValue) {
          var $t = $(ele)[0];
          if (document.selection) {
            ele.focus();
            sel = document.selection.createRange();
            sel.text = myValue;
            ele.focus();
          } else
          if ($t.selectionStart || $t.selectionStart == '0') {
            var startPos = $t.selectionStart;
            var endPos = $t.selectionEnd;
            var scrollTop = $t.scrollTop;
            $t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
            ele.focus();
            $t.selectionStart = startPos + myValue.length;
            $t.selectionEnd = startPos + myValue.length;
            $t.scrollTop = scrollTop;
          } else {
            ele.value += myValue;
            ele.focus();
          }
        }

        ,extend:function(a){
          return $.extend(this,a||{})
        }
        
      };


  })

