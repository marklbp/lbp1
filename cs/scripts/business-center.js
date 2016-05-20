'use strict';
var QB = this.QB = this.QB || {};

QB.widget = this.QB.widget || {};

/**
 * User center data tab widget.
 */
var DataTab = QB.widget.DataTab = function(options) {
  this.$el = options.$el;
  this.tabs = options.tabs;
  this.filters = options.filters || [];
  this.callbackFn = options.callback || function() {};
  this.currentTab = 0;

  this.initDOM();
  this.initTabs();
  this.initFilters();
  this.selectTab(0);
};

DataTab.prototype.initDOM = function() {
  this.$el.empty()
    .append(QB.templates['data-tab']({
      tabs: this.tabs,
      filters: this.filters
    }));
};

DataTab.prototype.initTabs = function() {
  var self = this;

  this.$tabLine = this.$el.find('.line');
  this.$tabContainer = this.$el.find('.tabs')
    .hover(null, function() {
      self.$tabLine
        .stop(true, true)
        .animate({
          left: $(self.$tabs[self.currentTab]).position().left
        }, 'fast');
    });
  this.$tabs = this.$tabContainer.find('li');
  for (var i = 0; i < this.$tabs.length; i++) {
    $(this.$tabs[i]).click((function(index) {
        return function() {
          self.selectTab(index);
        };
      })(i))
      .hover((function(index) {
        return function() {
          self.$tabLine
            .stop(true, true)
            .animate({
              left: $(self.$tabs[index]).position().left
            }, 'fast');
        };
      })(i));
  }
};

DataTab.prototype.initFilters = function() {
  this.$filterContainers = this.$el.find('.filters');
  this.$filterContainers.hide();
};

DataTab.prototype.selectTab = function(index) {
  var self = this;

  this.$tabs.removeClass('selected');
  $(this.$tabs[index]).addClass('selected');
  this.currentTab = index;

  if (this.filters.length) {
    this.$filterContainers.hide();
    $(this.$filterContainers[index]).show();
    this.$filters = $(this.$filterContainers[index]).find('li');

    for (var i = 0; i < this.$filters.length; i++) {
      $(this.$filters[i]).click((function(index) {
        return function() {
          self.selectFilter(index);
        }
      })(i));
    }
    this.selectFilter(0);
  } else {
    this.callbackFn(index);
  }
};

DataTab.prototype.selectFilter = function(index) {
  this.$filters.removeClass('selected');
  $(this.$filters[index]).addClass('selected');
  this.callbackFn(this.currentTab, index);
};

/**
 * User center data filter widget.
 */
var DataFilter = QB.widget.DataFilter = function(options) {
  this.$el = options.$el;
  this.startDate = options.startDate || moment().startOf('month');
  this.endDate = options.endDate || moment();
  this.callbackFn = options.callback || function() {};
  this.disableShortcut = !!options.disableShortcut;

  this.initDOM();
  this.initDatePicker();
  this.initDateFilter();
  this.initButton();

  this.triggerFilter();
};

DataFilter.prototype.initDOM = function() {
  this.$el.empty();

  if (!this.disableShortcut) {
    this.$el.addClass('clearfix');
    this.$el.append([
      '<ul>',
      '  <li data-filter="today"><span>今天</span></li>',
      '  <i>|</i>',
      '  <li data-filter="sevenDay">最近7天</li>',
      '  <i>|</i>',
      '  <li data-filter="thirtyDay">最近30天</li>',
      '  <i>|</i>',
      '  <li data-filter="threeMonth">最近3个月</li>',
      '</ul>'
    ].join(''));
  }

  this.$el.append([
    '<span>起止时间：</span>',
    '<input id="start-time"/>',
    '<span class="divider"> - </span>',
    '<input id="end-time"/>',
    '<span class="button">查询</span>'
  ].join(''));
};

DataFilter.prototype.initDatePicker = function() {
  var self = this;

  this.startDateInput = new Pikaday({
    field: document.getElementById('start-time'),
    defaultDate: this.startDate.toDate(),
    setDefaultDate: true,
    maxDate: this.endDate.toDate(),
    i18n: {
      months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      weekdaysShort: ['日', '一', '二', '三', '四', '五', '六']
    },
    firstDay: 1,
    format: 'YYYY-MM-DD',
    onSelect: function() {
      console.log(this.getMoment().format('Do MMMM YYYY'));
      self.startDate = this.getMoment();
      self.endDateInput.setMinDate(self.startDate.toDate());
    }
  });

  this.endDateInput = new Pikaday({
    field: document.getElementById('end-time'),
    defaultDate: this.endDate.toDate(),
    setDefaultDate: true,
    minDate: this.startDate.toDate(),
    i18n: {
      months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      weekdaysShort: ['日', '一', '二', '三', '四', '五', '六']
    },
    firstDay: 1,
    format: 'YYYY-MM-DD',
    onSelect: function() {
      console.log(this.getMoment().format('Do MMMM YYYY'));
      self.endDate = this.getMoment();
      self.startDateInput.setMaxDate(self.endDate.toDate());
    }
  });
};

DataFilter.prototype.initDateFilter = function() {
  var $filters = this.$el.find('li'),
    self = this;

  $filters.click(function() {
    var filter = $(this).data().filter;

    $filters.removeClass('selected');
    $(this).addClass('selected');

    switch (filter) {
      case 'today':
        self.startDateInput.setMoment(moment());
        self.endDateInput.setMoment(moment());
        break;
      case 'sevenDay':
        self.startDateInput.setMoment(moment().subtract(6, 'days'));
        self.endDateInput.setMoment(moment());
        break;
      case 'thirtyDay':
        self.startDateInput.setMoment(moment().subtract(29, 'days'));
        self.endDateInput.setMoment(moment());
        break;
      case 'threeMonth':
        self.startDateInput.setMoment(moment().subtract(3, 'months'));
        self.endDateInput.setMoment(moment());
        break;
      default:
        break;
    }

    self.currentFilter = filter;
    self.triggerFilter();
  });
};

DataFilter.prototype.initButton = function() {
  var self = this;

  this.$el.find('.button').click(function() {
    self.triggerFilter();
  });
};

DataFilter.prototype.triggerFilter = function() {
  this.callbackFn({
    startDate: this.startDateInput.getMoment(),
    endDate: this.endDateInput.getMoment()
  });
};

/**
 * User center data table widget.
 */
var DataTable = QB.widget.DataTable = function(options) {
  this.$el = options.$el;
  this.selectorCallbackFn = options.selectorCallback;
  this.columns = options.columns;
  this.rowTypes = options.rowTypes;
  this.perPage = options.perPage || 10;
  this.disablePaginator = !!options.disablePaginator;
  this.rows = [];
  this.template = QB.templates['data-table'];
  this.loadFn = options.loadFn;
  this.drawFn = options.drawFn;
  this.listStyle = options.listStyle;

  this.initTable();
};

DataTable.prototype.initTable = function() {
  var self = this,
    total = 0;

  this.loadFn(0).done(function(resp) {
    // TODO: Refactor this?
    total = resp.totalCount || resp.total;
    self.rows = new Array(total);

    self.$el.empty().append(self.template({
      listStyle: self.listStyle,
      columns: self.columns,
      rows: self.rows
    }));

    if (self.listStyle) {
      self.$rows = self.$el.find('#data-table-body > li');
    } else {
      self.$rows = self.$el.find('#data-table-body > tr');
    }

    self.appendData(0, resp.data);

    if (!self.disablePaginator && resp.data.length > 0) {
      $('.data-paginator').jPages({
        containerID: 'data-table-body',
        previous: '1',
        next: '1',
        midRange: 3,
        perPage: self.perPage,
        callback: function(pages) {
          var start = (pages.current - 1) * self.perPage + 1,
            end = (total > pages.current * self.perPage) ? (pages.current * self.perPage) : total;

          self.$el.find('.data-status')
            .text('当前显示' + start + '到' + end + '条记录，总共' + total + '条');
          if (pages.current === 1) {
            return;
          }
          self.loadFn(pages.current - 1).done(function(resp) {
            self.appendData(pages.current - 1, resp.data);
          });
        }
      });
    }
  }).fail(function() {
    self.$el.empty().append(self.template({
      listStyle: self.listStyle,
      columns: self.columns
    }));
  });
};

DataTable.prototype.appendData = function(index, data) {
  var $row,
    $custRow,
    content,
    backupStyle;

  for (var i = 0; i < data.length; i++) {
    $row = $(this.$rows[index * this.perPage + i]);
    if ($row.children().length === 0) {
      if (!this.drawFn) {
        for (var j = 0; j < this.rowTypes.length; j++) {
          if (data[i][this.rowTypes[j]] === 0) {
            content = 0;
          } else {
            content = data[i][this.rowTypes[j]] || '';
          }
          $row.append($('<td>').text(content));
        }
        if (i % 2 === 1) {
          $row.addClass('odd');
        }
      } else {
        $(this.drawFn(data[i], $row, index * this.perPage + i));
      }
    }
  }
};

/**
 * User center selector widget.
 */
var DataSelector = QB.widget.DataSelector = function(options) {
  this.$el = options.$el;
  this.options = options.options;
  this.callbackFn = options.callback || function() {};

  this.$el.empty().append('<p class="filter"></p>');

  var $display = this.$el.find('.filter'),
    $filterList = $('<ul>').appendTo(this.$el).hide(),
    self = this;

  this.$el.hover(function() {
    $filterList.show();
  }, function() {
    $filterList.hide();
  });

  $display.text(this.options[0]);

  for (var i = 0; i < this.options.length; i++) {
    $('<li>').text(this.options[i])
      .appendTo($filterList)
      .click((function(index) {
        return function() {
          $display.text(self.options[index]);
          $filterList.hide();
          self.callbackFn(index, self.options[index]);
        };
      })(i));
  }
};

