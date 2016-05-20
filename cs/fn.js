
  /*几个工具类*/
  function getIdByElementId(eleId) {
    if (!eleId)return null;
    eleId = eleId.split("-");
    return eleId[eleId.length - 1];
  }

  function slideHandler(ele, dir) {
    var eleDir = $(ele).prev().find(".collapse-dir")
        ,smile_url = IM_VAR.smile_url;
    if (dir == "down") {
      $(ele).slideDown();
      eleDir.attr("src", smile_url + "im-collapse-up.png");
    } else if (dir == "up") {
      $(ele).slideUp();
      eleDir.attr("src", smile_url + "im-collapse-down.png");
    } else {
      $(ele).slideToggle();
      var img = eleDir.attr("src");
      if (img.indexOf("collapse-up") > -1) {
        eleDir.attr("src", smile_url + "im-collapse-down.png");
      } else {
        eleDir.attr("src", smile_url + "im-collapse-up.png");
      }
    }
  }

  function formatDate(date) {
    var year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds();

    if (hour < 10) {
      hour = '0' + hour;
    }
    if (minute < 10) {
      minute = '0' + minute;
    }
    if (second < 10) {
      second = '0' + second;
    }

    return year + '-' + month + '-' + day + '&nbsp;' + hour + ':' + minute + ':' + second;
  }

  function utf8ByteLength(str) {
    if (!str) return 0;
    var escapedStr = encodeURI(str);
    var match = escapedStr.match(/%/g);
    return match ? (escapedStr.length - match.length * 2) : escapedStr.length;
  }

  function authSocket() {
    var _m_seq = soc.genSeq();
    if (myTicket != undefined && myUserId != undefined) {
      var ap = {
        "COOKIE": myTicket,
        "ID": parseInt(myUserId)
      }
      var body = {
        "I": _m_seq,
        "V": _version,
        "AT": 2,
        "AP": JSON.stringify(ap)
      };
      soc.send(_mt_auth_req, body);
    }
  }

  function heartBeat() {
    if (soc.heartBeatCount >= soc.heartBeatCountOut) {
      soc.close();
      soc.start();
    }
    if (soc.lastMessageRecieved != 0 && (Date.parse(new Date()) - soc.lastMessageRecieved) / 1000 > heartBeatSecond) {
      soc.heartBeatCount++;
      var _auth_seq = soc.genSeq();
      var body = {
        "I": _auth_seq,
        "P": "" + Date.parse(new Date())
      };
      soc.send(_mt_heartbeat_req, body);
    }
  }



  function replaceAll(str, s1, s2) {
    str = str.replace(s1, s2);
    if (str.indexOf(s1) > -1) {
      str = replaceAll(str, s1, s2)
    }
    return str;
  }

  //检查浏览器
  function checkBrowser() {
    if (!!window.ActiveXObject || "ActiveXObject" in window) {
      heartBeatSecond = 10;
    }
    if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.indexOf("MSIE 6.") > -1) {
      return false;
    } else if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.indexOf("MSIE 7.") > -1) {
      return false;
    } else if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.indexOf("MSIE 8.") > -1) {
      return false;
    } else if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.indexOf("MSIE 9.") > -1) {
      return false;
    } else if (navigator.userAgent.indexOf("Opera") != -1 || navigator.userAgent.indexOf('OPR') != -1) {
      return false;
    }
    return true;
  }



  function openNewProductTab(id) {
    window.open("http://m.qianbao666.com/store/product.htm?sourceType=1&location=1&productId=" + id);
  }

  //新消息提示
  function newMsgTit() {
    var titArr = newTitle.split("");
    titArr.unshift(titArr[titArr.length - 1]);
    titArr.splice(titArr.length - 1, 1);
    newTitle = titArr.join("");
    document.title = newTitle;
  }


  //防止session失效的接口
  function keepAlive() {

    $.ajax({
      type: "get",
      url: urlAddress + "keepAlive.html",
      async: true,
      success: function(res) {

      }
    });

  }



































  

  /*
  
  function openTip(msg, timeout) {
    $("#tip-alert-content").html(msg);
    if ($("#tip-alert-shadow").css("display") != "block") {
      $("#tip-alert-shadow").fadeIn(200);
      $("#tip-alert-warp").fadeIn(200);
    }
    if (timeout) {
      setTimeout(closeTip, timeout);
    }
  }

  function closeTip() {
    $("#tip-alert-shadow").fadeOut(200);
    $("#tip-alert-warp").fadeOut(200);
  }



  IMPlugin
    getCookie: function(name) {
      var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
      if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
      else
        return null;
    },

    setCookie: function(name, value) {
      var Days = 30;
      var exp = new Date();
      exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
      document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
    },

    delCookie: function(name, path, domain) {
      if (getCookie(name)) {
        document.cookie = name + "=" +
          ((path) ? ";path=" + path : "") +
          ((domain) ? ";domain=" + domain : "") +
          ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
      }
    },


  */