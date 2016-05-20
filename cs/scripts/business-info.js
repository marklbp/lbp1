

(function() {

    String.prototype.tem = function(option) {
        return this.replace(/{([^}]+)?}/g, function(q, b) {
            return option[b];
        });
    };

    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

    var user_id = $.urlParam('_merchant_user_id_');

    $(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
        managerName: "商家管理",
        name: "商家信息"
    }));

    var requestUrl = {};
    requestUrl = {
        url: "http://enterprise.qbao.com/company/merchant/showCompanyMerchant.html?_merchant_user_id_="+user_id+""
    };

    function request(url, option, fn) {
        $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            data: option,
            success: function(data) {
                fn.call(this, data);
            },
            error: function() {
                //alert("请求错误！");
            }
        });
    };

    function ck(o) {
        if (!o) {
            return "";
        }
        return o;
    }

    function getState(state) {
        if (!state) {
            return "";
        }
        switch (Number(state)) {
            case 1:
                return "国企";
                break;
            case 2:
                return "民营";
                break;
            case 3:
                return "外资";
                break;
            case 4:
                return "合资";
                break;
            default:
                return "";
                break;
        }
    }

    function timeCut(time) {
        if (!time) return false;
        var t = time.split(" ");
        return t[0];
    }

    request(requestUrl.url, {},
        function(data) {

            if (data.success) {
                var comp = $("#companyInfo").val(),
                    count = $("#countInfo").val(),
                    shop = $("#shopInfo").val(),
                    user=$('#shopuserInfo').val(),
                    d = data.data;

                $("#companyTitle").after(comp.tem({
                    companyName: ck(d.companyName),
                    companyType: getState(ck(d.companyType)),
                    registTime: timeCut(ck(d.registTime)),
                    principalName: ck(d.principalName),
                    principalPhone: ck(d.principalPhone),
                    principalEmail: ck(d.principalEmail),
                    busnissAlloted: d.busnissAllotedTimeStart ? timeCut(ck(d.busnissAllotedTimeStart)) + "-" + timeCut(ck(d.busnissAllotedTimeEnd)) : "",
                    businessLicensePath: d.businessLicensePath ? "<img src='" + d.businessLicensePath + "' />" : "",
                    taxNo: ck(d.taxNo),
                    taxImgPath: d.taxImgPath ? "<img src='" + d.taxImgPath + "' />" : "",
                    businessLicense: ck(d.businessLicense),
                    orgCode: ck(d.orgCode),
                    orgImgPath: d.orgImgPath ? "<img src='" + d.orgImgPath + "' />" : "",
                    legalPerson: ck(d.legalPerson),
                    legalPersonPhone: ck(d.legalPersonPhone),
                    legalPersonIdCard:ck(d.legalPersonIdCard),
                    legalPersonIdFrontImgPath: d.legalPersonIdFrontImgPath ? "<img src='" + d.legalPersonIdFrontImgPath + "' />" : ""

                }));
                $("#countTitle").after(count.tem({
                    accountNumber: ck(d.accountNumber),
                    subBank: ck(d.bankAccountName),
                    bankId: ck(d.subBank),
                    bankAccountProofImgPath: d.bankAccountProofImgPath ? "<img src='" + d.bankAccountProofImgPath + "' />" : "",
                    bankInfoProofPath: d.bankInfoProofPath ? "<img src='" + d.bankInfoProofPath + "' />" : ""
                }));
                $("#shopuserTitle").after(user.tem({
                    username: ck(d.username)
                }));
                $("#shopTitle").after(shop.tem({
                    shopName: ck(d.shopName),
                    street: ck(d.street),
                    shopContactUser: ck(d.shopContactUser),
                    contactPhone: ck(d.contactPhone),
                    contactEmail: ck(d.contactEmail)
                }));
            } else {
                alert("信息错误！");
            }

        });
       QB.SiteMenu.activeOn('#business-info');
    
}(window));
