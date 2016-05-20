$(function() {

  'use strict';
  var indexEvent = {
      $crumbs: $(".crumbs"),
      init: function() {
          indexEvent.$crumbs.replaceWith(QB.templates['operate-crumbs']({
            name: "商家管理"
          }));
      },
  };
  indexEvent.init();

});