// (function() {
//     //header
//     function getComp() {
//         $.ajax({
//             type: "get",
//             async: true,
//             url: 'http://enterprise.qbao.com/api/company/merchant/isMerchant/jsonp.html',
//             dataType: 'jsonp',
//             jsonp: "jsonpCallback",
//             jsonpCallback: 'success_jsonpCallback',
//             success: function(record) {
//                 if (record.data) {
//                     $(".site-header:eq(0)").hide();
//                     $("#business-nav-advertise").attr("href", "#");
//                 } else {
//                     $(".site-header:eq(0)").show();
//                 }
//             },
//             error: function(data) {

//             }
//         });
//     };
//     getComp();
// })();
