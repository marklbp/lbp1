var QB = this.QB = this.QB || {};

QB.config = {};

QB.domain = {
  qhb: 'http://qhb.qbao.com',
  qbao: 'http://www.qbao.com',
  user: 'http://user.qbao.com',
  help: 'http://help.qbao.com',
  goods: 'http://goods.qbao.com',
  raise: 'http://bc.qbao.com',
  ticket: 'http://bq.qbao.com',
  events: 'http://events.qbao.com',
  auction: 'http://paipai.qbao.com',
  passport: 'http://passport.qbao.com',
  bizorder: 'http://bizorder.qbao.com',
  order: 'http://oc.qbao.com',
  qwang: 'http://www.qianw.com',
  cdn: 'http://www.qbcdn.com',
  store: 'http://store.qbao.com',
  mz: 'http://mzxy.qbao.com',
  paipai: 'http://paipai.qbao.com',
  mp: 'https://mp.qbao.com',
  bc: 'http://bc.qbao.com',
  task: 'http://task.qbao.com',
  enterprise: 'http://enterprise.qbao.com',
  imgUrl: "http://enterprise.qbao.com/webChat/business-center/"
};


if (this.Handlebars) {
  Handlebars.registerHelper('domain', function(name) {
    return QB.domain[name];
  });
}

/**
 * Utilities
 */
QB.utils = {
  addCommas: function(nStr) {
    nStr += '';
    var x = nStr.split('.'),
      x1 = x[0],
      x2 = x.length > 1 ? '.' + x[1] : '',
      rgx = /(\d+)(\d{3})/;

    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }
};

if (this.Handlebars) {
  Handlebars.registerHelper('commas', function(nStr) {
    return QB.utils.addCommas(nStr);
  });
}

/**
 * Ajax Config
 */
if (this.jQuery) {
  //$(document).ajaxComplete(function(event, xhr) {
  //  if (xhr.responseText.indexOf('<title>用户登录－钱宝网</title>') >= 0) {
  //    console.log('Ajax error, redirect!');
  //    window.location.href = QB.domain.passport + '/cas/qianbaoLogin?service=' + window.location.href;
  //    return;
  //  }
  //});
}
