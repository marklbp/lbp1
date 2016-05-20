//2016.3.17 by tuxuan
'use strict';

$(function() {
    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}
  

 });
