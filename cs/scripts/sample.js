$(function() {

  QB.SiteHeader = QB.SiteHeader = {};

QB.SiteHeader.floatMenu = function() {
  'use strict';
  var elementId = document.getElementById("site-menu-fixed");

  window.onscroll = function() {
    var top = document.documentElement.scrollTop || document.body.scrollTop;
    if (top > 134) {
      if (elementId.className === '') {
        elementId.className = 'site-menu-fixed';
      }
    } else {
      if (elementId.className !== '') {
        elementId.className = '';
      }
    }
  };
};

QB.SiteHeader.active = function(menu) {
  'use strict';

  $('.site-menu').find(menu).addClass('current');
};


$(function() {
  'use strict';

  if (!$('.site-header').length) {
    return;
  }

  loadLeftMenu();

  function loadLeftMenu() {
    $.ajax({
      url: QB.domain.qbao + '/account/latestInfo.html',
      jsonp: 'jsonpCallback',
      dataType: 'jsonp'
    }).done(function(resp) {
      QB.config.userId = resp.id;
      QB.config.userName = resp.username;
      if (resp.username.length >= 6) {
        resp.displayName = resp.username.substring(0, 3) + "******" + resp.username.substring(resp.username.length - 2);
      } else {
        resp.displayName = resp.username;
      }
      resp.balance = QB.utils.addCommas(resp.balance);
      $('.user-name').replaceWith(QB.templates['data-header'](resp));

      refreshMessage();
      // setInterval(refreshMessage, 60 * 1000);
    }).fail(function() {
      $('.user-name').replaceWith(QB.templates['data-header']({
        username: null
      }));
    });
  }

  function refreshMessage() {
    $.ajax({
      url: QB.domain.user + '/usercenter/message/unread/jsonp.html',
      jsonp: 'jsonpCallback',
      dataType: 'jsonp'
    }).done(function(resp) {
      if (resp.data && resp.data.unreadMessageNumber > 0) {
        if (resp.data.unreadMessageNumber > 99) {
          resp.data.unreadMessageNumber = '99+';
        }
        $.each(resp.data.messageList, function(index, message) {
          // message.displayContent = message.body.replace(/<[^>]+>/g, "");
          switch (message.messageType) {
            case 0:
              message.className = 'site-header-sprite site-header-sprite-header-notice';
              message.showClass = 'notice';
              message.showName = '通知';
              break;
            case 1:
              message.className = 'site-header-sprite site-header-sprite-header-activity';
              message.showClass = 'activity';
              message.showName = '活动';
              break;
            case 2:
              message.className = 'site-header-sprite site-header-sprite-header-system';
              message.showClass = 'system';
              message.showName = '系统';
              break;
          }
          // Disable img src for http url.
          message.body = message.body.replace(/src=/g, 'unknown=');
          message.body = $('<p>' + message.body + '</p>').text();
          // 如果内容大于38个字，则后边显示省略号
          if (message.body.length > 87) {
            message.body = message.body.substr(0, 87) + '...';
          }
          message.url = QB.domain.qbao + '/messageboard/my/message.html?messageType=' + message.messageType + '&userMessageId=' + message.id;
        });
      }
      $('.user-news').replaceWith(QB.templates['user-message'](resp.data));
    }).fail(function() {
      console.log('no message');
    });
  }

  function initMenu() {
    var siteTopId = document.getElementById('siteTopId'),
      siteNewsUpBtn = document.getElementById('siteNewsUpBtn'),
      siteNewsLayoutId = document.getElementById('siteNewsLayoutId'),
      className = siteTopId.className;

    window.setTimeout(function() {
      siteNewsLayoutId.style.top = 0 + 'px';
    }, 1);

    siteNewsUpBtn.onclick = function() {
      if (className.indexOf('site-init') >= 0) {
        siteNewsLayoutId.style.top = -800 + 'px';
      }
      window.setTimeout(function() {
        siteNewsLayoutId.removeAttribute('style');
        siteNewsLayoutId.parentNode.style.height = 0 + 'px';
        siteTopId.className = className.replace('site-init', '');
        window.setTimeout(function() {
          siteNewsLayoutId.removeAttribute('style');
          siteNewsLayoutId.parentNode.removeAttribute('style');
        }, 600);
      }, 300);
    };
  }
});
});