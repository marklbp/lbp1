 (function(global,a){

      var ImageSend=a();

      ImageSend.init(function(){

        var that=this;

        //注册上传点击事件，并传递到
        $("#span-img").click( function() {

          $("#image_upload_input").trigger("click");
          
        });

        //注册input[file]的change事件
        $("#image_upload_input").change(function(eve) {

          that.asyncUploadImage(eve);
          $(this).val('');

        });

      })

      if("function"==typeof define){
        return define(function(){
          return ImageSend
        })
      }else{
        global.__ImageSend=global.ImageSend;
        global.ImageSend=ImageSend;
      }

 })(this,function(){

    var inited = false;

    //图片发送对象
    return {

        isImagePanelOpen: false

        //初始化上传组件
        ,init:function(callback){

          if(!inited){

            //预留上传组件初始化时的业务逻辑
          
             inited = true;
          }
          
          "function" == typeof callback&&callback.call(this);
          
          return this;
        }

        ,asyncUploadImage: function(e) {

          $("#image_upload_processing").css("display", "inline-block");
          var formData = new FormData();
          formData.append('image_upload', e.target.files[0]);
          $.ajax({
            method: 'POST',
            url: 'http://enterprise.qbao.com/merchantUser/webchat/fileupload.html',
            data: formData,
            dataType: 'json',
            cache: false,
            contentType: false,
            processData: false,
          }).done(function(resp) {
            if (resp.success) {
              var img = "[img]" + resp.message + "[/img]";
              im.commitBigExpress($('#messageform'), img);
              $("#image_upload_processing").css("display", "none");
              $("#upload_panel").css("display", "none");
            } else {
              //        $("#image_upload_processing").css("display", "none");
              //        openTip("图片上传失败",1000);
            }
          });

        }

        ,openImagePanel: function() {

          if (this.isImagePanelOpen) {
            $("#upload_panel").css("display", "none");
            this.isImagePanelOpen = false;
          } else {
            document.getElementById("upload_panel").style.display = "block";
            this.isImagePanelOpen = true;
            //        $("#smile_panel").css("display", "none");
            this.isSmilePanelOpen = false;
          }

        }

        ,extend:function(a){
          return $.extend(this,a||{})
        }

    };

 })

