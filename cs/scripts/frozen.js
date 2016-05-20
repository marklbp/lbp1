
(function() {
    'use strict';

    jQuery.urlParam = function(name){var result = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];return decodeURIComponent(result);}

    var url = $.urlParam("initiator");
    setTimeout(function(){
    	$(".bussiness-header-width .header-im a")[0].href = location.href;
    },200);
    //var url = location.pathname.substring(1);
    switch( url.substring(1) ) {
    	case "merchantUser/merchantUcIndex.html":
    		$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        name: "首页"
		    }));
		    QB.SiteMenu.activeOn('#merchant-index');
			break;
		case "order/seller/orderList.html":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "交易管理",
		        name: "订单管理"
		    }));
		    QB.SiteMenu.activeOn('#order-list');
		    break;
		case "portle/refundList.html":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "交易管理",
		        name: "退款退货"
		    }));
		    QB.SiteMenu.activeOn('#refund-list');
		    break;
		case "goodsProduct/publish.html":
    		$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "商品管理",
		        name: "商品发布"
		    }));
		    QB.SiteMenu.activeOn('#product-publish');
			break;
		case "goodsManage/toIndex.html":
    		$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "商品管理",
		        name: "商品管理"
		    }));
		    QB.SiteMenu.activeOn('#product-list');
			break;
		case "manageAucApply/index.html":
    		$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "商品管理",
		        name: "雷拍管理"
		    }));
		    QB.SiteMenu.activeOn('#auction-list');
			break;
		case "goods/postage/toIndex.html":
    		$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "商品管理",
		        name: "运费管理"
		    }));
		    QB.SiteMenu.activeOn('#fee-template');
			break;
		case "company/merchant/toMerchantInfo.html":
    		$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "商家管理",
		        name: "商家信息"
		    }));
		    QB.SiteMenu.activeOn('#business-info');
			break;
		case "merchantUser/accountManage.html":
    		$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "商家管理",
		        name: "资产管理"
		    }));
		    QB.SiteMenu.activeOn('#account-manage');
			break;
		case "merchantUser/shopManage.html":
    		$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "商家管理",
		        name: "店铺资料"
		    }));
		    QB.SiteMenu.activeOn('#shop-manage');
			break;
		case "merchantUser/toShopFinish.html":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "商家管理",
		        name: "店铺装修"
		    }));
		    QB.SiteMenu.activeOn('#shop-finish');
		    break;
		case "accountSetup/toSecurityIndex.html":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "商家管理",
		        name: "安全中心"
		    }));
		    QB.SiteMenu.activeOn('#security-index');
		    break;
		case "merchantUser/operate-list.html":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "商家管理",
		        name: "小二管理"
		    }));
		    QB.SiteMenu.activeOn('#operate-list');
		    break;
		case "taskPlan/index.html":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "广告发布",
		        name: "计划管理"
		    }));
		    QB.SiteMenu.activeOn('#task-plan');
		    break;
		case "taskPlan/toAddTaskPlan.html":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "广告发布",
		        name: "添加计划"
		    }));
		    QB.SiteMenu.activeOn('#add-plan');
		    break;
		case "taskPlan/taskPlanMaterielList.html":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "广告发布",
		        name: "图片管理"
		    }));
		    QB.SiteMenu.activeOn('#task-image');
		    break;
		case "out/cr/toCRPage.html":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "我要贷款",
		        name: "我要贷款"
		    }));
		    QB.SiteMenu.activeOn('#to-crpage');
		    break;
		case "user/plan/manage":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "推广发布",
		        name: "推广管理"
		    }));
		    QB.SiteMenu.activeOn('#plan-manage');
		    break;
		case "user/plan/toCreate.html":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "推广发布",
		        name: "推广发布"
		    }));
		    QB.SiteMenu.activeOn('#plan-create');
		    break;
		case "couponManage/manage.html":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "促销优惠券",
		        name: "优惠券管理"
		    }));
		    QB.SiteMenu.activeOn('#coupon-manage');
		    break;
		case "couponManage/statistic.html":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "促销优惠券",
		        name: "优惠券统计"
		    }));
		    QB.SiteMenu.activeOn('#coupon-statistic');
		    break;
		case "order/seller/o2o/refund/list.html":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "付款码管理",
		        name: "扫码付退款"
		    }));
		    QB.SiteMenu.activeOn('#scanCode-refund');
		    break;
		case "merchant/o2o/toViewQrCode.html":
			$(".bussiness-crumbs").replaceWith(QB.templates['operate-crumbs']({
		        managerName: "付款码管理",
		        name: "我的付款码"
		    }));
		    QB.SiteMenu.activeOn('#seller-qr-code');
		    break;
		default:
			break;
    }
    
})();
