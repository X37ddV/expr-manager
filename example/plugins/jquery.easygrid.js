// JQuery EasyGrid 1.0
// Tue Jan 17 2017 19:55:47 GMT+0800 (CST)

// Copyright 2017 X37ddV. All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:

//    1. Redistributions of source code must retain the above
//       copyright notice, this list of conditions and the following
//       disclaimer.

//    2. Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials
//       provided with the distribution.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

(function($) {

	$.fn.easygrid = function(options) {
		var jQueryContext = this;
		var easyGrid = new EasyGrid(jQueryContext, options);

		return easyGrid;
	};

	$.fn.easygrid.defaults = {
	    isAllowRemoveCol: false,
        isAllowMoveCol: true,
	    isAllowSort: true,
	    isAllowKeyboard: false,
		isAllowEdit: false,
        minColumnWidth: 60,
        emptyText: '',
        columns: [],
        onColumnChange: null,
        onSortChange: null,
		onSelectedRowChange: null,
		onSelectedColChange: null,
        data: [],
		idField: '_id',
		childrenField: '_children'
	};

	/* Example */
    // this.$easygrid = this.$(".xxx-easygrid");
    // this.easygrid = this.$easygrid.easygrid({
    //     columns: [{
    //         type: '',   // 1.'' 2.'checkbox' 3.'radio' 4.'tree'
    //         text: 'Column Name',
    //         dataField: 'columnname',
    //         width: 190,
    //         sort: '',   // 1.'' 2.'desc' 3.'asc'
	//         valueClass: ''	// 'none-text-ellipsis' 'text-center' 'text-right'
    //     }],
    //     onColumnChange: (function(me) {
    //         return function(columns) {}
    //     })(this),
    //     onSortChange: (function(me) {
    //         return function(sort) {}
    //     })(this),
	//     onSelectedRowChange: (function(me) {
    //         return function(id) {}
    //     })(this),
	//     onSelectedColChange: (function(me) {
    //         return function(dataField) {}
    //     })(this),
	//     onEdit: (function(me) {
    //         return function(id, dataField) {}
    //     })(this),
    //     data: []
    // });
    // this.easygrid.loadData([{
    //     _id: 1, columnname: "text-1",
    //     _children: [{
    //         _id: 2, columnname: "text-1-1",
    //     }]
    // }]);

	var EasyGrid = function(jQueryContext, options) {
        var _next_id = -1;

		this.init = function(jQueryContext, options) {

			this.$el = jQueryContext;
			this.$el.data('easygrid', this);

			this.options = $.extend({}, $.fn.easygrid.defaults, options);

			init(this);
			this.initColumns(this.options.columns);

			return this.loadData(this.options.data);
		};

		//public helpers

		this.loadData = function(data) {
			var rows = this.$rows;
			if (data && data.length > 0) {
				this.$emptyText.hide();
				var minWidth = 0,
                    columns = this.options.columns;
				$.each(columns, function(j, m) {
					minWidth += m.width;
				});
				rows.css('min-width', minWidth);
				rows.html(buildRows(this.options.idField, this.options.childrenField, columns, data));
			} else {
				rows.html('');
				this.$emptyText.show();
			}
			this.options.data = data;
			return this;
		};
		this.initColumns = function(columns) {
			this.options.columns = columns;
			this.columnMap = {};
			$.each(columns, function(me) {
				return function(i, n) {
                    // default value
                    if (n.type == 'checkbox' || n.type == 'radio') {
                        n.width = n.width || 30;
                        n.dataField = '_' + n.type;
                    } else {
                        n.width = n.width || 190;
                    }
                    n.dataField = n.dataField || '';
                    n.text = n.text || '';
                    n.sort = n.sort || '';
					me.columnMap[n.dataField] = n;
				}
			}(this));
			buildColumns(this, columns);
			return this
		};
		this.addColumn = function(column) {
			if (!this.columnMap[column.dataField]) {
				this.options.columns.push(column);
				this.columnMap[column.dataField] = column;
				buildColumns(this, this.options.columns);
				this.loadData(this.options.data);
				columnChange(this);
			}
			return this
		};
		this.removeColumn = function(dataField) {
			if (this.columnMap[dataField]) {
				var index = this.options.columns.indexOf(this.columnMap[dataField]);
				this.options.columns.splice(index, 1);
				delete this.columnMap[dataField];
			}
			buildColumns(this, this.options.columns);
			this.loadData(this.options.data);
			columnChange(this);
			return this
		};
		this.columnWidth = function(dataField, width) {
			var column = this.columnMap[dataField];
			if (column) {
				if (width === undefined) {
					return column.width;
				} else {
					column.width = width;
					var cols = this.$cols;
					var rows = this.$rows;
					var minWidth = 0;
					$.each(this.options.columns, function(i, n) {
						minWidth += n.width;
					});
					cols.css('min-width', minWidth);
					rows.css('min-width', minWidth);
					this.$el.find('[data-field=' + dataField + ']').css('width', width);
					columnChange(this);
				}
			}
			return this
		};
		this.moveColumn = function(dataField, index) {
			var column = this.columnMap[dataField],
				list = [];
			for (var i = 0, c; i < this.options.columns.length; i++) {
				c = this.options.columns[i];
				if (column == c && (i == index || i == index - 1)) {
					return this
				}
				if (i == index) {
					list.push(column);
				}
				if (c.dataField != dataField) {
					list.push(c);
				}
			}

			var insertAction = 'insertBefore',
				insertIndex = index;
			if (index == this.options.columns.length) {
				list.push(column);
				insertAction = 'insertAfter';
				insertIndex = index - 1;
			}
			this.options.columns = list;
			this.$el.find('[data-field=' + dataField + ']').each(function(i, n) {
				var t = $(n).parent().children()[insertIndex];
				$(n).remove()[insertAction](t);
			});
			columnChange(this);
			return this
		};
		this.sortColumn = function(dataField, sort) {
			var column = this.columnMap[dataField];
			if (column && column.sort != sort) {
				column.sort = sort;
				this.$el.find('[data-field=' + dataField + ']').each(function(i, n) {
					$(n).removeClass('asc').removeClass('desc').addClass(sort)
				});
				sortChange(this);
			}
			columnChange(this);
			return this
		};
        this.eachData = function(callback) {
            var each = (function(me) {
                return function(data, parent) {
                    data && $.each(data, function(i, n) {
                        var r = callback.call(me, n, parent);
                        if (r !== false) {
							r = each(n[me.options.childrenField], n);
                        }
                        if (r === false) {
                            return r
                        }
                    });
                }
            })(this);
            each(this.options.data, undefined);
            return this
        };
		this.getSort = function() {
			var s = '',
				cs = this.options.columns;
			for (var i = 0; i < cs.length; i++) {
				if (cs[i].sort) {
					if (s) {
						s += ',';
					}
					s += cs[i].dataField + ' ' + cs[i].sort;
				}
			}
			return s
		};
        this.getRowsData = function(parentId) {
            var items;
            if (parentId === undefined) {
                items = this.options.data;
            } else {
                var item = this.getRowData(parentId);
                if (item) {
                    item[this.options.childrenField] = item[this.options.childrenField] || [];
                    items = item[this.options.childrenField];
                }
            }
            return items
        };
		this.getRowData = function(id) {
            var item;
			this.eachData((function(idField) {
				return function(n) {
					if (n[idField] == id) {
						item = n;
						return false
					}
				}
			})(this.options.idField));
            return item
		};
        this.getParentId = function(id) {
            var pid;
			this.eachData((function(idField) {
				return function(n, p) {
					if (n[idField] == id) {
						p && (pid = p[idField]);
						return false
					}
				}
			})(this.options.idField));
            return pid
        };
        this.getSelectedId = function() {
            return this.$rows.find('.easygrid-content-row-content.selected').parent().data('id')
        };
		this.getSelectedField = function() {
			return this.$header.find('.easygrid-header-column.selected').data('field')
		};
        this.getSelectedRadioId = function() {
            var ids = $.map(this.$rows.find('.easygrid-content-value-radio:checked'), function(n) {
                return $(n).data('id')
            });
            return ids.length > 0 ? ids[0] : undefined
        };
        this.getSelectedCheckboxIds = function() {
            return $.map(this.$rows.find('.easygrid-content-value-checkbox:checked'), function(n) {
                return $(n).data('id')
            })
        };
		this.removeRow = function(id) {
            var pid = this.getParentId(id);
            var prow = this.getRowData(pid);
            var rows = this.getRowsData(pid);
            var row = this.getRowData(id);
            if (prow) {
                prow[this.options.childrenField] = _.without(rows, row);
                prow[this.options.childrenField].length == 0 && this.$rows.find('.easygrid-content-row[data-id="' + pid + '"]').children('.easygrid-content-row-content').addClass('no-children');
            } else {
                this.options.data = _.without(this.options.data, row);
            }
            this.$rows.find('.easygrid-content-row[data-id="' + id + '"]').remove();
            return this
		};
		this.addRow = function(row, parentId) {
            var parentData = this.getRowsData(parentId);
            if (parentData) {
                parentData.push(row);
                var parentRows, parentChecked, level;
                var build = (function(cols, r) {
                    return function(level) {
                        var html = buildRow(this.options.idField, this.options.childrenField, cols, r, level);
                        parentRows.append(html);
                    }
                })(this.options.columns, row);
                if (parentId !== undefined) {
                    var parentRow = this.$rows.find('.easygrid-content-row[data-id="' + parentId + '"]');
                    parentRow.children('.easygrid-content-row-content').removeClass('no-children');
                    parentRows = parentRow.children('.easygrid-content-row-children');
                    level = parentRow.parents('.easygrid-content-row').length + 1;
                    build(level);
                    parentChecked = $(this.getSelectedCheckboxIds()).index(parentId) >= 0;
                    parentChecked && this.selectRowCheckbox(parentId);
                } else {
                    parentRows = this.$rows;
                    level = 0;
                    build(level);
                    parentChecked = this.$header.find('.easygrid-header-checkbox').prop('checked');
                    parentChecked && this.selectAllCheckbox();
                }
                if (this.$emptyText.is(':visible')) {
                    this.$emptyText.hide();
                }
            }
			return this
		};
		this.refreshRow = function(id, dataField) {
			var rowData = this.getRowData(id);
			if (rowData) {
				var row = this.$rows.find('.easygrid-content-row[data-id="' + id + '"]');
				if (dataField) {
					var cell = row.find('.easygrid-content-cell[data-field="' + dataField + '"] .easygrid-content-value');
					cell.html(rowData[dataField]);
				} else {
					for (var f in rowData) {
						if (rowData.hasOwnProperty(f)) {
							var cell = row.find('.easygrid-content-cell[data-field="' + dataField + '"] .easygrid-content-value');
							cell.html(rowData[f]);
						}
					}
				}
			}
            return this
		};
		this.showFocusCell = function() {
			var focusCell = this.$el.find(".easygrid-content-row-content.selected .easygrid-content-cell.selected");
			if (focusCell.length > 0) {
				var height = this.$content.outerHeight();
				var width = this.$content.outerWidth();
				var top = this.$content.scrollTop();
				var left = this.$content.scrollLeft();
				var position = focusCell.position();
				if (position.top < 0) {
					this.$content.scrollTop(top + position.top);
				} else if (position.top + focusCell.outerHeight() > height) {
					this.$content.scrollTop(top + position.top + focusCell.outerHeight() - height);
				}
				if (position.left < 0) {
					this.$content.scrollLeft(left + position.left);
				} else if (position.left + focusCell.outerWidth() > width) {
					this.$content.scrollLeft(left + position.left + focusCell.outerWidth() - width);
				}
			}
		};
		this.selectRow = function(id, isSilent) {
			var row = this.$rows.find('.easygrid-content-row[data-id="' + id + '"]');
            this.$el.find('.easygrid-content-row-content').removeClass('selected');
            row.children('.easygrid-content-row-content').addClass('selected');
			!isSilent && selectedRowChange(this);
            return this
		};
		this.selectCol = function(dataField, isSilent) {
			var col = this.$header.find('.easygrid-header-column[data-field="' + dataField + '"]');
			this.$el.find('.easygrid-header-column').removeClass('selected');
			col.addClass('selected');
			col = this.$rows.find('.easygrid-content-cell[data-field="' + dataField + '"]');
			this.$el.find('.easygrid-content-cell').removeClass('selected');
			col.addClass('selected');
			!isSilent && selectedColChange(this);
			return this
		};
        this.selectRowRadio = function(id, select) {
            this.$rows.find('.easygrid-content-value-radio[value="' + id + '"]').prop('checked', select);
            return this
        };
        this.selectRowCheckbox = function(id, select) {
            select = select !== false;
            var row = this.$rows.find('.easygrid-content-row[data-id="' + id + '"]');
            row.find('.easygrid-content-value-checkbox').prop('checked', select);
            if (select) {
                row.parents('.easygrid-content-row').each(function(i, n) {
                    var children = $(n).children('.easygrid-content-row-children');
                    $(n).children('.easygrid-content-row-content').find('.easygrid-content-value-checkbox').prop('checked',
                        children.find('.easygrid-content-value-checkbox').length ==
                        children.find('.easygrid-content-value-checkbox:checked').length
                    );
                });
                this.$el.find('.easygrid-header-checkbox').prop('checked',
                    this.$rows.find('.easygrid-content-value-checkbox').length ==
                    this.$rows.find('.easygrid-content-value-checkbox:checked').length
                );
            } else {
                row.parents('.easygrid-content-row').children('.easygrid-content-row-content').find('.easygrid-content-value-checkbox').prop('checked', select);
                this.$el.find('.easygrid-header-checkbox').prop('checked', select);
            }
            return this
        };
        this.selectAllCheckbox = function(select) {
            this.$el.find('.easygrid-header-checkbox').prop('checked', select !== false);
            this.$el.find('.easygrid-content-value-checkbox').prop('checked', select !== false);
            return this
        };
        this.expandRow = function(id, expand) {
            var row = this.$rows.find('.easygrid-content-row[data-id="' + id + '"]');
            var content = row.children('.easygrid-content-row-content');
            var children = row.children('.easygrid-content-row-children');
            if (expand !== false) {
                content.addClass('expand');
                children.show();
            } else {
                content.removeClass('expand');
                children.hide();
            }
            return this
        };
		this.beginEdit = function() {
			if (this.options.isAllowEdit && !this.$edit) {
				var id = this.getSelectedId();
				var dataField = this.getSelectedField();
				var cell = this.$rows.find('.easygrid-content-row[data-id="' + id + '"] .easygrid-content-cell[data-field="' + dataField + '"]');
				if (cell.length === 1 && !cell.hasClass("read-only")) {
					this.$edit = $('<div class="easygrid-editor-cell"></div>');
					this.$edit.appendTo(cell);
					edit(this, this.$edit, id, dataField);
				}
			}
			return this
		};
		this.endEdit = function() {
			if (this.$edit) {
				this.$edit.remove();
				this.$edit = null;
			}
			return this
		};
		this.getValue = function(id, dataField) {
			return this.getRowData(id)[dataField]
		};
		this.setValue = function(id, dataField, value) {
			this.getRowData(id)[dataField] = value;
			return this.refreshRow(id, dataField)
		};

		// events

		function columnChange(grid) {
			if (grid && grid.options && grid.options.onColumnChange) {
				grid.options.onColumnChange.call(grid, grid.options.columns);
			}
		}

		function sortChange(grid) {
			if (grid && grid.options && grid.options.onSortChange) {
				grid.options.onSortChange.call(grid, grid.getSort());
			}
		}

		function selectedRowChange(grid) {
			if (grid && grid.options && grid.options.onSelectedRowChange) {
				grid.options.onSelectedRowChange.call(grid, grid.getSelectedId());
			}
		}

		function selectedColChange(grid) {
			if (grid && grid.options && grid.options.onSelectedColChange) {
				grid.options.onSelectedColChange.call(grid, grid.getSelectedField());
			}
		}

		function edit(grid, cell, id, dataField) {
			if (grid && grid.options && grid.options.onEdit) {
				grid.options.onEdit.call(grid, cell, id, dataField);
			}
		}

		// dnd

		function dragStart(e) {
			var t = $(e.target),
				col;
			var _dnd = window._easygrid_once;
			_dnd.easygrid = t.parents('.easygrid').data('easygrid');
			if (t.hasClass('easygrid-header-split')) {
				// 拖动列宽
				$(window.document.body).addClass('noselect');
				_dnd.enabledSplit = true;
				_dnd.easygrid.$el.addClass('split-dragging');
				col = t.parents('.easygrid-header-column');
				var colLeft = col.offset().left - _dnd.easygrid.$el.offset().left;
				var x = colLeft + col.width();
				_dnd.minX = colLeft + _dnd.easygrid.options.minColumnWidth;
				_dnd.dataField = col.data('field');
				_dnd.easygrid.$splitSolid.show().css('left', x);
				_dnd.easygrid.$splitDotted.show().css('left', x);
			} else if ((_dnd.easygrid && _dnd.easygrid.options.isAllowMoveCol !== false) && (t.hasClass('easygrid-header-column-wrap') || t.hasClass('easygrid-header-title') || t.hasClass('easygrid-header-sort') || t.hasClass('easygrid-header-column'))) {
				// 拖动列顺序
				$(window.document.body).addClass('noselect');
				_dnd.enabledCloumn = true;
				_dnd.easygrid.$el.addClass('column-dragging');
				col = t.parents('.easygrid-header-column');
				_dnd.dataField = col.data('field');
				_dnd.easygrid.$dragColumn.width(col.width());
				_dnd.easygrid.$dragColumnTitle.text(col.find('.easygrid-header-title').text());
			}
			_dnd.offsetX = e.offsetX;
			_dnd.offsetY = e.offsetY;
			_dnd.dragged = false;
		}
		function drag(e) {
			var _dnd = window._easygrid_once;
			if (_dnd.enabledSplit) {
				// 拖动列宽
				var x = e.clientX - _dnd.easygrid.$el.offset().left;
				if (x <= _dnd.minX) {
					x = _dnd.minX;
				}
				_dnd.easygrid.$splitDotted.css('left', x);
				_dnd.newWidth = x - _dnd.minX + _dnd.easygrid.options.minColumnWidth;
			} else if (_dnd.enabledCloumn) {
				// 拖动列顺序或者删除某个列
				var grid = _dnd.easygrid;
				var topOffset = e.pageY - e.clientY;
				var x = e.clientX - grid.$el.offset().left;
				var y = e.clientY - grid.$el.offset().top + topOffset;

				grid.$dragColumn.css('left', x - _dnd.offsetX);
				grid.$dragColumn.css('top', y - _dnd.offsetY);

				var cursorLeft = x - _dnd.easygrid.$cols.offset().left + _dnd.easygrid.$el.offset().left;
				var targetLeft = 0;
				var index = 0;
				_dnd.easygrid.$header.find('.easygrid-header-column').each(function(i, n) {
					var w = $(n).outerWidth();
					if (targetLeft + w > cursorLeft) {
						if (w / 2 < cursorLeft - targetLeft) {
							targetLeft += w;
							index++;
						}
						return false
					} else {
						targetLeft += w;
						index++;
					}
				});
				_dnd.targetIndex = index;
				_dnd.easygrid.$dragTarget.css('left', targetLeft - _dnd.easygrid.$content.scrollLeft());
				if (_dnd.offsetX != e.offsetX || _dnd.offsetY != e.offsetY) {
					_dnd.easygrid.$dragTarget.show();
					_dnd.easygrid.$dragColumn.show();
				}
			}
			if (_dnd.offsetX != e.offsetX || _dnd.offsetY != e.offsetY) {
				_dnd.dragged = true;
			}
		}
		function dragEnd(e) {
			var _dnd = window._easygrid_once;
			if (_dnd.enabledSplit) {
				// 拖动列宽
				$(window.document.body).removeClass('noselect');
				_dnd.easygrid.$splitSolid.hide();
				_dnd.easygrid.$splitDotted.hide();
				_dnd.dragged && _dnd.easygrid.columnWidth(_dnd.dataField, _dnd.newWidth);
				_dnd.easygrid.$el.removeClass('split-dragging');
				_dnd.enabledSplit = false;
			} else if (_dnd.enabledCloumn) {
				// 拖动列顺序
				var grid = _dnd.easygrid;
				var isAllow = grid.options.isAllowRemoveCol;
				$(window.document.body).removeClass('noselect');
				_dnd.easygrid.$dragColumn.hide();
				_dnd.easygrid.$dragTarget.hide();
				if ((isEffecDistance(grid.$dragColumn, grid) && isAllow === true) || (!isAllow)) { //判断拖动的div是否在grid的范围内如果不在，就触发删除事件
					_dnd.dragged && _dnd.easygrid.moveColumn(_dnd.dataField, _dnd.targetIndex);
				} else {
					_dnd.easygrid.removeColumn(_dnd.dataField);
				}
				_dnd.easygrid.$el.removeClass('column-dragging');
				_dnd.enabledCloumn = false;
			}
		}

        // click

        function getClickTarget(q, cls) {
            var r = null;
            if (q.hasClass(cls)) {
                r = q;
            } else {
                r = q.parents('.' + cls).first();
                if (r.length == 0) {
                    r = null;
                }
            }
            return r
        }
		function doClick(e) {
			var t = $(e.target);
			var target, easygrid = getClickTarget(t, 'easygrid');
            if (easygrid) {
                easygrid = easygrid.data('easygrid');
            } else {
                return;
            }

            // 单选
            target = getClickTarget(t, 'easygrid-content-value-radio');
            if (target) {
                var rowId = getClickTarget(target, 'easygrid-content-row').data('id');
                return easygrid.selectRowRadio(rowId, target.is(':checked'));
            }
            // 多选
            target = getClickTarget(t, 'easygrid-header-checkbox');
            if (target) {
                return easygrid.selectAllCheckbox(target.is(':checked'));
            }
            target = getClickTarget(t, 'easygrid-content-value-checkbox');
            if (target) {
                var rowId = getClickTarget(target, 'easygrid-content-row').data('id');
                return easygrid.selectRowCheckbox(rowId, target.is(':checked'));
            }
            // 展开 ／ 收起
            target = getClickTarget(t, 'easygrid-tree-expand');
            if (target) {
                var rowId = getClickTarget(target, 'easygrid-content-row').data('id');
                var content = getClickTarget(target, 'easygrid-content-row-content');
                easygrid.expandRow(rowId, !content.hasClass('expand'));
                if (!content.hasClass('no-children')) {
					if (content.hasClass('expand') || !content.siblings('.easygrid-content-row-children').find('.easygrid-content-row-content.selected').length > 0) {
						return;
					}
                }
            }
            // 选择行/列
            target = getClickTarget(t, 'easygrid-content-cell');
			if (target) {
                var rowId = getClickTarget(target, 'easygrid-content-row').data('id');
				return easygrid.selectRow(rowId).selectCol(target.data('field'));
			}
            // 排序
            target = getClickTarget(t, 'easygrid-header-column');
            if (target) {
				if (easygrid.options.isAllowSort) {
					var sort = '';
					if (target.hasClass('asc')) {
						sort = 'desc';
					} else if (!target.hasClass('desc')) {
						sort = 'asc';
					}
					return easygrid.sortColumn(target.data('field'), sort);
				} else {
					return easygrid.selectCol(target.data('field'));
				}
            }
		}

		function doDblClick(e) {
			var easygrid = getClickTarget($(e.target), 'easygrid');
            if (easygrid) {
                easygrid = easygrid.data('easygrid');
				easygrid && easygrid.beginEdit();
            }
		}

		// keyboard

		function keyboard(grid, cmd) {
			var id = grid.getSelectedId();
			var row = grid.$rows.find('.easygrid-content-row[data-id="' + id + '"]');
			var rowContent = row.children('.easygrid-content-row-content');
			var rows = grid.$rows.find('.easygrid-content-row:visible');
			var rowIndex = rows.index(row);
			var field = grid.getSelectedField();
			var col = grid.$header.find('.easygrid-header-column[data-field="' + field + '"]');
			var cols = grid.$header.find('.easygrid-header-column:visible');
			var colIndex = cols.index(col);
			var succ = false;
			if (rowContent) {
				var nextId;
				var nextField;
				switch (cmd) {
					case 'up':
						if (rowIndex > 0) {
							nextId = $(rows[rowIndex - 1]).data('id');
						}
						break;
					case 'right':
						if (colIndex < cols.length - 1) {
							nextField = $(cols[colIndex + 1]).data('field');
						}
						break;
					case 'meta+right':
						if (rowContent.hasClass('expand')) {
							if (rowIndex < rows.length - 1) {
								nextId = $(rows[rowIndex + 1]).data('id');
							}
						} else if (!rowContent.hasClass('no-children')) {
							grid.expandRow(id, true);
							succ = true;
						}
						break;
					case 'down':
						if (rowIndex < rows.length - 1) {
							nextId = $(rows[rowIndex + 1]).data('id');
						}
						break;
					case 'left':
						if (colIndex > 0) {
							nextField = $(cols[colIndex - 1]).data('field');
						}
						break;
					case 'meta+left':
						if (rowContent.hasClass('expand')) {
							grid.expandRow(id, false);
							succ = true;
						} else if (!rowContent.hasClass('level0')) {
							nextId = row.parents('.easygrid-content-row').first().data('id');
						}
						break;
				}
				if (nextId !== undefined) {
					grid.selectRow(nextId);
					succ = true;
				}
				if (nextField !== undefined) {
					grid.selectCol(nextField);
					succ = true;
				}
				if (succ) {
					grid.showFocusCell();
				}
			}
			return succ
		}
		function doKeyDown(e) {
			$.each($.find('.easygrid.selected'), function(i, n) {
				var easygrid = $(n).data('easygrid');
				if (easygrid && easygrid.options && easygrid.options.isAllowKeyboard &&
					!easygrid.$edit && !e.shiftKey && !e.altKey && !e.ctrlKey) {
					var stop = false;
					switch (e.keyCode) {
						case 13: // 回车
							easygrid.beginEdit();
							break;
						case 27: // 取消
							easygrid.endEdit();
							break;
						case 37: // 左
							if (!e.metaKey) {
								stop = keyboard(easygrid, 'left');
							} else {
								stop = keyboard(easygrid, 'meta+left');
							}
							break;
						case 38: // 上
							if (!e.metaKey) {
								stop = keyboard(easygrid, 'up');
							}
							break;
						case 39: // 右
							if (!e.metaKey) {
								stop = keyboard(easygrid, 'right');
							} else {
								stop = keyboard(easygrid, 'meta+right');
							}
							break;
						case 40: // 下
							if (!e.metaKey) {
								stop = keyboard(easygrid, 'down');
							}
							break;
						default:
							break;
					}
					if (stop === true) {
						e.stopPropagation();
						e.preventDefault();
					}
				}
			});
		}

		// rendering

        function getNextId() {
            return _next_id--
        }
		function buildColumns(grid, columns) {
			var html = '';
			var headerColumns = grid.$cols;
			var minWidth = 0, w;
			$.each(columns, function(i, n) {
                var isCheckbox = n.type == 'checkbox';
                var isRadio = n.type == 'radio';
                var w = n.width;
				minWidth += w;
				html += '<div class="easygrid-header-column' +
					(n.readOnly ? ' read-only' : '') +
					(n.sort ? ' ' + n.sort : '') +
                    (n.type ? ' ' + n.type + '-column' : '') +
					'" style="width:' + w + 'px;" data-width="' + w + '" data-field="' + n.dataField + '">';
				if (!(isCheckbox || isRadio)) {
                    html += '<div class="easygrid-header-column-wrap">';
				    html += '<div class="easygrid-header-title">' + n.text + '</div>';
                    html += '<div class="easygrid-header-sort"><div class="easygrid-triangle-top"></div><div class="easygrid-triangle-bottom"></div></div>';
                    html += '<div class="easygrid-header-split"></div>';
                    html += '</div>';
                } else if (isCheckbox) {
                    html += '<input class="easygrid-header-checkbox" type="checkbox"/>';
                }
				html += '</div>';
			});
			headerColumns.css('min-width', minWidth).html(html);
		}
		function buildRow(idField, childrenField, columns, row, level) {
            level = level || 0;
			var children = row[childrenField];
            var hasChildren = children && children.length > 0;
            var id = row[idField] === undefined ? getNextId() : row[idField];
            var html = '<div class="easygrid-content-row" data-id="' + id + '">';
            html += '<div class="easygrid-content-row-content level' + level + (hasChildren ? "" : " no-children") + '">';
			$.each(columns, function(j, m) {
                var isCheckbox = m.type == 'checkbox';
                var isRadio = m.type == 'radio';
				html += '<div class="easygrid-content-cell' +
					(m.readOnly ? ' read-only' : '') +
					'" data-field="' + m.dataField + '" style="width:' + m.width + 'px;">';
				if (m.type == 'tree') {
                    for (var i = 0; i < level; i++) {
                        html += '<div class="easygrid-tree-indent"></div>';
                    }
                    html += '<div class="easygrid-tree-expand glyphicon"></div>';
                }
                if (isCheckbox) {
                    html += '<input class="easygrid-content-value-checkbox" type="checkbox" value="' + id + '" data-id="' + id + '" />';
                } else if (isRadio) {
                    html += '<input class="easygrid-content-value-radio" type="radio" name="easygrid-radio" value="' + id + '" data-id="' + id + '" />';
                } else {
                    html += '<div class="easygrid-content-value' + (m.valueClass ? (' ' + m.valueClass) : '') + '">';
                    html += row[m.dataField] || '';
                    html += '</div>';
                }
				html += '</div>';
			});
			html += '</div>';
            html += '<div class="easygrid-content-row-children" style="display:none;">';
            if (hasChildren) {
                html += buildRows(idField, childrenField, columns, children, level + 1);
            }
            html += '</div>';
            html += '</div>';
			return html
		}
        function buildRows(idField, childrenField, columns, data, level) {
            level = level || 0;
            var html = '';
            $.each(data, function(cols, l) {
                return function(i, n) {
                    html += buildRow(idField, childrenField, cols, n, l);
                }
            }(columns, level));
            return html
        }

		// initialisation

		function init(grid) {
			var html = '';
			html += '<div class="easygrid-split-solid"></div>';
			html += '<div class="easygrid-split-dotted"></div>';
			html += '<div class="easygrid-drag-column"><div class="easygrid-header-title"></div></div>';
			html += '<div class="easygrid-drag-target"></div>';
			html += '<div class="easygrid-view">';
			html += '<div class="easygrid-header"><div class="easygrid-header-columns"></div></div>';
			html += '<div class="easygrid-content"><div class="easygrid-content-rows"></div><div class="easygrid-empty-text"><span>' + grid.options.emptyText + '</span></div></div>';
			html += '</div>';
			grid.$el.addClass('easygrid').html(html);
			grid.$header = grid.$el.find('.easygrid-header');
			grid.$content = grid.$el.find('.easygrid-content');
			grid.$cols = grid.$header.find('.easygrid-header-columns');
            grid.$rows = grid.$content.find('.easygrid-content-rows');
			grid.$splitSolid = grid.$el.find('.easygrid-split-solid');
			grid.$splitDotted = grid.$el.find('.easygrid-split-dotted');
			grid.$dragTarget = grid.$el.find('.easygrid-drag-target');
			grid.$dragColumn = grid.$el.find('.easygrid-drag-column');
			grid.$dragColumnTitle = grid.$dragColumn.find('.easygrid-header-title');
			grid.$emptyText = grid.$content.find('.easygrid-empty-text');

			grid.$content.scroll(function(columns) {
				return function(e) {
					columns.css('left', -e.target.scrollLeft);
				}
			}(grid.$cols));

			if (!window._easygrid_once) {
				window._easygrid_once = {};
				$(document).on('mousedown', dragStart);
				$(document).on('mousemove', drag);
				$(document).on('mouseup', dragEnd);
				$(document).on('click', doClick);
				$(document).on('dblclick', doDblClick);
				$(document).on('keydown', doKeyDown);
			}
		}
		function isEffecDistance(el, grid) {
			var o = {
				left: 0,
				top: 36,
				right: 0,
				bottom: 0
			};
			var gridEl = grid.$el;
			var elWidth = el.width();
			var elHeight = el.height();
			var left = el.css('left');
			var top = el.css('top');
			if (parseInt(left) + elWidth + o.left > 0 &&
				parseInt(top) + elHeight + o.top > 0 &&
				parseInt(left) - o.right < gridEl.width() &&
				parseInt(top) - o.bottom < gridEl.height()) {
				return true;
			} else {
				return false;
			}
		}

		// other

		function log(message) {
			console.log(message);
		}
		this.init(jQueryContext, options);
	}
}(jQuery));
