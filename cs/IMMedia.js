  (function(global,a){

    var IMMedia = a();

    IMMedia.init(function(){

        var that = this;

        //声音点击事件
        $("#talk-content-list-area,#record-list").delegate(".audiolink", "click", function(eve) {
            that.handler_play(eve.currentTarget, 0);
        });

    })

    //供模块加载使用
    if("function"==typeof define){
      return define(function(){
        return IMMedia
      })
    }else{
    //抛出当前执行环境的下全局变量
      global.__IMMedia = global.IMMedia;
      global.IMMedia=IMMedia;
    }

  })(this,function(){

    var inited=false;

    return {
      
      /*
        播放状态标识
        0 -> 未播放
        1 -> 正在播放
      */
      isplay: 0
      
      //上一次播放的媒体文件id，用于判断是否为同一媒体文件
      ,isbroadcastid: ''

      //返回IMMedia初次初始化标识
      ,inited:function(){

        return inited;

      }

      //存储静态变量
      ,vars:{
        sound_ico     :   "im-sound-new.png"
        ,voice_l_ico  :   "im-voice-left.gif"
        ,voice_r_ico  :   "im-voice-right.gif"
        ,swf_path     :   ""
      }

      //初始化入口
      ,init:function(options,callback){

          callback = "function" == $.type(options) ? options : callback;   

          options = "object" == $.type(options) ? options : {}

          if(!inited){

            //初次初始化执行逻辑
            this.vars = $.extend(this.vars,options);

            inited=true;
          }

          "function" == typeof callback && callback.call(this);

          return this;
      }

      //媒体播放初始化函数
      ,playAudio: function(voiceUrl, id, isLeft) {

        var that = this;
        var swf_path = that.vars.swf_path

        $("#audio_play").jPlayer("destroy");

        $("#audio_play").jPlayer({
          ready: function(event) {
            $(this).jPlayer("setMedia", {
              mp3: voiceUrl
            }).jPlayer("play");
          },

          preload: "metadata",
          swfPath: swf_path,
          supplied: "mp3",
          solution: "flash,html",

          pause: function() {
            that.isplay = 0; //暂停播放
          },

          play: function() { //开始播放
            that.isplay = 1;
          },

          ended: function() { //播放完毕
            that.isplay = 0;
            that.callback_end(id, isLeft);
          }
        });
      }

      //媒体播放处理函数
      ,handler_play: function(ele, isLeft) {

        var that = this;
        var voiceUrl = $(ele).attr("voiceurl");
        if (voiceUrl == '' || typeof voiceUrl == 'undefined') return false;

        var currentVoiceId = $(ele).attr("id");

        if (that.isbroadcastid != '') { 
          //正在载入的音频
          if (currentVoiceId == that.isbroadcastid) {
            if (that.isplay == 1) { 
              //正在播放，执行暂停操作
              $("#audio_play").jPlayer("pause");
              that.changeStatus(0, isLeft, currentVoiceId);
            } else {
              $("#audio_play").jPlayer("play");
              that.changeStatus(1, isLeft, currentVoiceId);
            }
            return false;
          } else { 
            //操作的语音不是同一个
            $("#audio_play").jPlayer("stop");
            that.changeStatus(0, isLeft, that.isbroadcastid);
          }
        }

        that.playAudio(voiceUrl, currentVoiceId, isLeft);
        that.isbroadcastid = currentVoiceId; //重新载入正在播放的音频ID
        that.changeStatus(1, isLeft, currentVoiceId);

      }

      //媒体播放状态显示
      ,changeStatus: function(status, isLeft, id) {

        if (status == 0) {

          /*if (isLeft) {
            $("#" + id + " span").css("background", "url("+this.vars.sound_ico+") no-repeat scroll 0 0 rgba(0, 0, 0, 0)");
          } else {
            $("#" + id + " span").css("background", "url("+this.vars.sound_ico+") no-repeat scroll -18px -1px rgba(0, 0, 0, 0)");
          }*/

          return this.callback_end(id,isLeft)

        } else if (status == 1) {

          if (isLeft) {
            $("#" + id + " span").css("background-image", "url("+this.vars.voice_l_ico+")");
          } else {
            $("#" + id + " span").css("background", "url("+this.vars.voice_r_ico+") no-repeat scroll 16px 0 rgba(0, 0, 0, 0)");
          }

        }
        $("#" + id + " span").css("background-position-y", "8px");

      }

      ,callback_end: function(id, isLeft) {

        if (isLeft) {
          $("#" + id + " span").css("background", "url("+this.vars.sound_ico+") no-repeat scroll 0 0 rgba(0, 0, 0, 0)");
        } else {
          $("#" + id + " span").css("background", "url("+this.vars.sound_ico+") no-repeat scroll -18px -1px rgba(0, 0, 0, 0)");
        }
        $("#" + id + " span").css("background-position-y", "8px");

      }

      ,extend:function(a){
        return $.extend(this,a||{})
      }

  };
})