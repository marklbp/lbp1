$(function() {
  initSiteTop();
  initSiteNav();
  initUCMenu();
  initBCMenu();
  adjustLinkUs();
});

// 联系我们，临时修正
function adjustLinkUs() {
  $('.contactUS .sinaWeibo a').attr('href', 'mailto:kefu@qbao.com');
}

// 顶部菜单变更
function initSiteTop() {
  // 注册送28元
  var registerIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAMCAYAAAD79EROAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3NpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0MTJmYTZlMy1mNGI1LTQzMzUtYTlmMy02YzEyZDc0NDA5Y2EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODRBMjQ5RTQ1Qjc0MTFFNTk5MjhGRDg3NDZDRDFDRTEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODRBMjQ5RTM1Qjc0MTFFNTk5MjhGRDg3NDZDRDFDRTEiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ZmU4YTg3ZGEtMTRhYi00YWNlLTk4ZjctMWMzNmYwZjQ5M2M2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjQxMmZhNmUzLWY0YjUtNDMzNS1hOWYzLTZjMTJkNzQ0MDljYSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pjtub9IAAADfSURBVHjaYnyuIccABR+AmJ9hEAMWbILCKzYyvI3wh7NBAMRHZqOrRwbI8vjksMmjA2T1jNhCFtmx2DyAzTJiPIfLs6SGLDMQMxEKGWyWkWsxuY4FOXQhEPNicxByqFDbYYSSAHqAgJLBMiAdiS3K8RlGTJIgJs3iyifY1IFCFuTYQCDmwOcgckIWW5qlJIZA6XQLEPsB8R98lhIKaUozD7GOBYHdQPyVUPTgcjAtHYpsHwuhUER3AL5yEpkNUgczB10cX4CQXClgKxtxyROyBJ88vhjBZi/jUKpuAQIMAP8RlVxYwMqWAAAAAElFTkSuQmCC';
      $registerPrompt = $('<a />').attr({
        href: 'http://www.qbao.com/announcement/announce-detail.htm?id=100980',
        target: '_blank'
      }).append($('<img />').attr('src', registerIcon));

  var appendPrompt = function() {
    var $register = $('.site-header .menu-login'),
        $userName = $('.site-header .user-name');

    if ($register.length !== 0) {
      $register.append($registerPrompt);
    } else if ($userName.is(':hidden')) {
      setTimeout(appendPrompt, 500);
    }
  }

  setTimeout(appendPrompt, 500);
}

// 主导航变更
function initSiteNav() {
  var $newIcon = $('<em class="new"></em>');

  $('#site-menu-store').append($newIcon);
  // 天天薪喜
  // $newIcon.addClass('p2c');
  // $('#site-menu-activity').append($newIcon);
  // 疯狂两小时
  // $newIcon.addClass('auction');
  // $('#site-menu-auction').append($newIcon);

  // 雷拍域名变更
  $('#site-menu-auction a').attr('href', 'http://paipai.qbao.com');
}

// 用户中心菜单变更
function initUCMenu() {
  // 隐藏废弃的菜单
  $('#auction-order-menu').hide();
  $('#auction-history-menu').hide();
  // 加入新菜单
  if (!$('#auction-old-history-menu').length) {
    $('#auction-management-menu ul')
      .append($('<li class="submenu-item" id="auction-old-history-menu">' +
                  '<a href="http://paipai.qbao.com/order/listUserOldAuction.html">竞拍记录查询</a>' +
                '</li>'));
  }
}

// 商家平台菜单变更
function initBCMenu() {
}
