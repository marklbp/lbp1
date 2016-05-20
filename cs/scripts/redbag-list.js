$(function() {
    'use strict';

    QB.widget.UCMenu.active('#account-detail-menu', '#frozen-charge-menu');

    //时间戳转换为时间并增加天数
    function getReTime(dateStr, days) {
        var data = new Date(dateStr).valueOf();
        data = data + days * 24 * 60 * 60 * 1000;
        data = new Date(data);
        var y = data.getFullYear() + '-',
            m = ((data.getMonth() + 1 < 10) ? ('0' + (data.getMonth() + 1)) : (data.getMonth() + 1)) + '-',
            d = ((data.getDate() < 10) ? ('0' + data.getDate()) : data.getDate());
        return y + m + d;
    }

    var startDate = moment().startOf('month'),
        endDate = moment();

    new QB.widget.DataFilter({
        $el: $('.data-filter'),
        disableShortcut: true,
        startDate: startDate,
        endDate: endDate,
        callback: function(filter) {
            startDate = filter.startDate;
            endDate = filter.endDate;
            loadHistory();
        }
    });

    function loadHistory() {
        new QB.widget.DataTable({
            $el: $('.data-table'),
            columns: ['序号', '金额（钱宝币）', '时间', '当日总资产'],
            rowTypes: ['id', 'dayCharge', 'chargeDate', 'dayBalance'],

            loadFn: function(index) {
                var retDfd = $.Deferred();

                $.ajax({
                    type: 'POST',
                    // url: QB.domain.qbao + '/wallet/listFreezedRecord.html',
                    url: 'http://192.168.169.19:8080/querycharge/querychargedetail.html',
                    data: {
                        sEcho: 2,
                        iColumns: 4,
                        sColumns: '',
                        iDisplayStart: index * 10,
                        iDisplayLength: 10,
                        sSearch: '',
                        bRegex: false,
                        sSearch_0: '',
                        bRegex_0: false,
                        bSearchable_0: true,
                        sSearch_1: '',
                        bRegex_1: false,
                        bSearchable_1: true,
                        sSearch_2: '',
                        bRegex_2: false,
                        bSearchable_2: true,
                        sSearch_3: '',
                        bRegex_3: false,
                        bSearchable_3: true,
                        unfreezedStartTime: startDate.format('YYYYMMDD'),
                        unfreezedEndTime: endDate.format('YYYYMMDD'),
                        searchType: ''
                    },
                    dataType: 'json'
                }).done(function(resp) {
                    if (!resp.success) {
                        console.error('Query detail error: ' + resp);
                        retDfd.reject();
                        return;
                    }

                    $("#countFreeze").text(QB.utils.addCommas(resp.data.countFreeze));

                    var temp_Data = resp.data.paginationView.aaData,
                        temp_Length = temp_Data.length;
                    for (var i = 0; i < temp_Length; i++) {

                        temp_Data[i].chargeDate = (function(date) {
                            return date.replace(/(\d{4})/, function($1) {
                                    return $1 + '-';
                                })
                                .replace(/-\d{2}/, function($1) {
                                    return $1 + '-';
                                });
                        }(temp_Data[i].chargeDate));
                    }

                    retDfd.resolve({
                        total: resp.data.paginationView.itotalRecodes,
                        data: temp_Data
                    });
                }).fail(function() {
                    retDfd.reject();
                });

                return retDfd;
            }
        });
    }
});
