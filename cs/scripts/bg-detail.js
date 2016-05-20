$(function() {
  'use strict';

  $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
    manager:"商品管理",
    managerName: "宝购管理",
    name: "宝购详情"
  }));

  QB.SiteMenu.activeOn('#bgmanage-list');

  jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

  var merchant_id = $.urlParam("_merchant_user_id_");

  getDetailbg(getQueryString('id'));

  function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return unescape(r[2]);
    }
    return null;
  }

  function getDetailbg(id) {

  $.ajax({
    type: "POST",
    url: QB.domain.raise + "/shopProduct/get.html?_merchant_user_id_="+merchant_id,
    data: {
      id: id
    },
    dataType: "json",
    success: function(data) {
      var _data = data.data.shopProduct;
      var str = '&nbsp;';
      if (_data.status == 0) {
        str = "待审核";
      } else if (_data.status == 2) {
        str = "【审核不通过】";
      } else if (_data.status == 1) {
        str = "已发布";
      } else if (_data.status == 3) {
        str = "已结束";
      }
      $("#productName").text(_data.productName);
      $("#applyId").text(_data.id);
      $("#salesPrice").text(_data.productSalePrice);
      $("#total-num").text(_data.productTotalNum);
      $("#apply-time").text(_data.applyTime);
      $("#status").text(str);
      $("#auditReason").text(_data.auditReason);
      $("#tuan-starttime").text(data.data.beginTime);
      $("#tuan-endtime").text(data.data.endTime);
      $("#tuan-numdy").text(data.data.renGouSucceedTotal);
      $("#tuan-people").text(data.data.renGouSucceedNumber);
      $("#spuId").text(_data.productSpuId);
      $("#spuName").text(_data.productName);
      $("#skuId").text(_data.productSkuName);
      $("#sellingPoint1").text(_data.sellingPoint1);
      $("#sellingPoint2").text(_data.sellingPoint2);
      $("#sellingPoint3").text(_data.sellingPoint3);
      // $("#goodsLabel").text(status);

      // $('.sellPointr').each(function() {
      //   var _sellKeyNull = $(this).text();
      //   if (_sellKeyNull == "") {
      //     $(this).hide();
      //   }
      // })

      var _goodsImgs = '';
      for (var i = 0; i < _data.productPicUrls.length; i++) {
        if (i == 0) {
          _goodsImgs += '<em><img src="' + _data.productPicUrls[i] + '" /><i class="cover"></i></em>';
        } else {
          _goodsImgs += '<em><img src="' + _data.productPicUrls[i] + '" /></em>';
        }
      }
      $("#goodsImg").html(_goodsImgs);
      $("#goodsDesc").html(_data.productDesc);

    },
    error: function(message) {
      //  alert("执行失败");

    }
  });


}
});
