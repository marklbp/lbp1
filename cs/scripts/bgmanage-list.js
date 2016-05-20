(function($) {
  $.extend({
    formatMoney: function(num) {
      if (($.trim(num + "") == "") || (isNaN(num))) {
        return "";
      }
      num = num + "";
      if (/^.*\..*$/.test(num)) {
        varpointIndex = num.lastIndexOf(".");
        varintPart = num.substring(0, pointIndex);
        varpointPart = num.substring(pointIndex + 1, num.length);
        intPart = intPart + "";
        var re = /(-?\d+)(\d{3})/
        while (re.test(intPart)) {
          intPart = intPart.replace(re, "$1,$2");
        }
        num = intPart + "." + pointPart;
      } else {
        num = num + "";
        var re = /(-?\d+)(\d{3})/;
        while (re.test(num)) {
          num = num.replace(re, "$1,$2");
        }
      }
      return num;
    },
    unformatMoney: function(num) {
      if ($.trim(num + "") == "") {
        return "";
      }
      num = num.replace(/,/gi, '');
      return num;
    }

  });
})(jQuery);


//reset
(function(factory) {

  //引入jQuery.
  factory(window.jQuery);

})(function($) {

  $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
    managerName: "商品管理",
    name: "宝购管理"
  }));


  QB.SiteMenu.activeOn('#bgmanage-list');

  jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

  var merchant_id = $.urlParam("_merchant_user_id_");

  var listId = '';
  var $listObj = null;

  //删除按钮弹框
  $(document).on('click', '#a_delete', function() {
    $(".confirm-info").html('您确定删除该申请记录？');
    $("#dialog_delete,.shadow").show();
    listId = $(this).parent().siblings(".list_goodsid").text();
    $listObj = $(this).parent().parent('li');
  });

  $(".dialog-close,.cancle-btn").click(function() {
    $("#dialog_delete,.shadow").hide();
  });

  //删除功能
  $(".confirm-btn").click(function() {
    deleteProduct();
    $("#dialog_delete,.shadow").hide();
  });

  function deleteProduct() {
    $.ajax({
      type: "POST",
      url: QB.domain.raise + "/shopProduct/updateIsDelete.html?_merchant_user_id_="+merchant_id,
      dataType: "json",
      data: {
        id: listId
      },
      success: function(data) {
        if (data.success) {
          $listObj.remove();

        } else {
          alert("删除失败");
        }
      },
      error: function() {
        alert("删除失败");
      }
    });
  }

  //搜索功能
  var $searchId = $('#searchId');

  var schData = {
    id: '',
    status: '-1'
  };

  //搜索ID
  $searchId.find('.md_form_text > input')
    .on('blur', function() {
      schData.id = $(this).val();
    });

  //隐藏显示选择菜单
  $searchId.find('.md_form_select')
    .on('mouseover', function() {
      $searchId.find('.md_form_select_options')
        .show();
    })
    .on('mouseout', function() {
      $searchId.find('.md_form_select_options')
        .hide();
    });

  //选择菜单赋值
  $searchId.find('.md_form_select_options span')
    .on('click', function() {
      var text = $(this).html();
      $searchId.find('.md_form_select_txt')
        .html(text);

      $searchId.find('.md_form_select_options')
        .hide();

      schData.status = $(this).attr('data-status');;
    });

  //搜索按钮事件
  $searchId.find('.tool-btn')
    .on('click', function() {
      loadList();
    });

  //加载页面功能
  function loadList() {

    //创建列表
    new QB.widget.DataTable({
      $el: $('.bg_gllist'),
      listStyle: true,
      perPage: 10,
      drawFn: function(content, $row) {
        var str = '&nbsp;';
        var classAdd = '';
        if (content.status == 0) {
          str = "待审核";
        } else if (content.status == 2) {
          str = "审核不通过";
          classAdd = ' red';
        } else if (content.status == 1) {
          str = "已发布";
        } else if (content.status == 3) {
          str = "已结束";
        }

        var str_detail = '';
        if (content.status == 0 || content.status == 2) {
          str_detail = "wait";
        } else if (content.status == 1 || content.status == 3) {
          str_detail = "ok";
        }
        var rowHtml = [];
        rowHtml.push('<div class="list_goodsid">' + content.id + '</div>');
        rowHtml.push('<div class="list_goodsmess">');
        rowHtml.push('<span class="messa"><img src=' + content.productPicUrls[0] + ' /></span>');
        rowHtml.push('<span class="messb">');
        rowHtml.push('<i class="f-colora">' + content.productName + '</i>');
        rowHtml.push('<i class="f-colorb">ID: ' + content.productSpuId + '</i>');
        rowHtml.push('</span>');
        rowHtml.push('</div>');
        rowHtml.push('<div class="list_goodstprice">' + (content.productSalePrice/100).toFixed(2) + '</div>');
        rowHtml.push('<div class="list_goodsposi">宝购大厅</div>');
        rowHtml.push('<div class="list_goodsstaus' + classAdd + '">' + str + '</div>');
        rowHtml.push('<div class="list_goodsdo">');
        rowHtml.push('<a target="_blank" href="/detail-' + str_detail + '.htm?id=' + content.id + '&_merchant_user_id_='+merchant_id+'">查看</a>');
        if (content.status == 2) {
          rowHtml.push('<a href="javascript:void(0)" class="apply-delete" id="a_delete">删除</a>');
        }
        if (content.status == 0) {
          rowHtml.push('<a href="javascript:void(0)" class="apply-delete" id="a_revoke">撤销</a>');
        };
        rowHtml.push('</div>');
        $row.html(rowHtml.join(''));
      },
      loadFn: function(index) {
        var retDfd = $.Deferred();
        var dataQ = {
          iDisplayStart: index * 10,
          iDisplayLength: 10
        };

        $.ajax({
          type: 'POST',
          url: QB.domain.raise + '/shopProduct/shopProductList.html?_merchant_user_id_='+merchant_id,
          dataType: 'json',
          data: {
            status: schData.status,
            productName: schData.id,
            index: index + 1
          }
        }).done(function(resp) {
          if (!resp.success) {
            console.error('Query detail error: ' + resp);
            retDfd.reject();
            return;
          }
          retDfd.resolve({
            //XHR-priview，success传回中需要的值，data放入drawFn的content中
            total: resp.data.page.total,
            data: resp.data.list
          });
        }).fail(function() {
          var record = resp.data;
          if (record.returnCode && record.returnCode == -1) {
            var strFullPath = window.document.location.href;
            var strPath = window.document.location.pathname;
            var pos = strFullPath.indexOf(strPath);
            var prePath1 = strFullPath.substring(0, pos);
            var prePath = strFullPath.substring(pos);
            var str = encodeURIComponent(prePath);
            //alert(str);
            window.location.href = prePath1 + "/account/loginSession.html?url=" + str;
            return;
          }
          retDfd.reject();
        });
        return retDfd;
      }
    });
  }

  loadList();


  //撤销申请按钮弹框
  $(document).on('click', '#a_revoke', function() {
    $(".confirm-info").html('您确定撤销该申请记录？');
    $("#dialog_delete,.shadow").show();
    listId = $(this).parent().siblings(".list_goodsid").text();
    $listObj = $(this).parent().parent('li');
  });
});
