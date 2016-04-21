﻿var configTable = function() {
    var _table;
    var _tableId = '#jquery-data-table';
    var _loadingElement = "<h1 class='dataTablesLoading'>Loading data <span class='glyphicon glyphicon-refresh spin-infinite' /></h1>";
    var _checkAllSelector = '#datatable-check-all';
    var _checkboxChecked = 'input[type="checkbox"]:checked';
    var _checkboxUnchecked = 'input[type="checkbox"]:not(:checked)';
    var _selectRowClass = 'datatable-select-row';
    var _actionButtonSelector = '#data-table-actions button.btn';
    var _buttonSpin = 'glyphicon glyphicon-refresh spin-infinite'.split(/\s+/);
    var _xsrf = '__RequestVerificationToken';

    return {
        /* -----------------------------------------------------------------
            selectors and DOM elements
        */
        getTableId: function() { return _tableId; },
        // DataTables API instance => $().DataTable() - note CASE
        setTable: function(table) {
            _table = table;
            return this;
        },
        getLoadingElement: function() { return _loadingElement; },
        /* -----------------------------------------------------------------
            helper functions
        */
        clearCheckAll: function() {
            // ajax call only updates tbody
            var n = document.querySelector(_checkAllSelector);
            if (n !== null) n.checked = false;
        },
        clearSearchBoxes: function() {
            var nodes = document.querySelectorAll('tfoot input[type=text]');
            for (i = 0; i < nodes.length; ++i) nodes[i].value = '';
        },
        doSearch: function() {
            // now we can search
            var searchCount = 0;
            var nodes = document.querySelectorAll('input[type=text]');
            for (i = 0; i < nodes.length; ++i) {
                if (nodes[i].value !== '') {
                    ++searchCount;
                    _table.column(nodes[i].dataset.columnNumber)
                        .search(nodes[i].value);
                }
            }
            if (searchCount > 0) {
                configTable.clearCheckAll();
                _table.draw();
            }
        },
        getSelectedRowIds: function() {
            var selectedIds = [];
            _table.rows().every(function(rowIdx, tableLoop, rowLoop) {
                var cb = this.node().querySelector(_checkboxChecked);
                if (cb !== null && cb.checked) {
                    selectedIds.push(this.data()[0]);
                }
            });
            return selectedIds;
        },
        getXsrfToken: function() {
            var token = document.querySelector('input[name=' + _xsrf + ']');
            if (token !== null) {
                var xsrf = {};
                xsrf[_xsrf] = token.value;
                return xsrf;
            }
            return null;
        },
        buttonProcessing: function(element, doAdd) {
            var span = element.querySelector('span');
            if (span != null) {
                if (doAdd) {
                    _buttonSpin.forEach(function(i) { span.classList.add(i) });
                }
                else {
                    _buttonSpin.forEach(function(i) { span.classList.remove(i) });
                }
            }
        },
        sendXhr: function(element, url, data) {
            configTable.buttonProcessing(element, true);
            $.ajax({
                url: url,
                headers: configTable.getXsrfToken(),
                data: data ? data : null,
                type: 'POST'
            })
            // TODO: add modal or bootstrap message
            .done(function(data, textStatus, jqXHR) {
                alert(data);
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                alert('XHR request (' + url + ') failed:' + errorThrown);
            })
            // http://api.jquery.com/deferred.always/
            .always(function() { 
                configTable.buttonProcessing(element)
            });
        },
        /* -----------------------------------------------------------------
            event listeners
        */
        actionButtonClick: function(e) {
            e.preventDefault();
            var ids = configTable.getSelectedRowIds();
            var url = this.dataset.url;

            // TODO: add create logic (no checkbox selected)
            if (url) {
                if (ids.length > 0) {
                    configTable.sendXhr(this, url, { ids: ids });
                } else {
                    alert('\nNO ROWS SELECTED\n')
                }
            }
            else {
                configTable.sendXhr(this, url);
            }

            return false;
        },
        checkAll: function(e) {
            if (this.checked) {
                var nodes = document.querySelectorAll(_checkboxUnchecked);
                for (i = 0; i < nodes.length; ++i) nodes[i].click();
            } else {
                var nodes = document.querySelectorAll(_checkboxChecked);
                for (i = 0; i < nodes.length; ++i) nodes[i].click();
            }
        },
        // search icons in <span>
        searchIconsClick: function(e) {
            if (this.classList.contains('glyphicon-search')) {
                configTable.doSearch();
            }
            else if (this.classList.contains('glyphicon-remove')) {
                configTable.clearSearchBoxes();
            }
        },
        // search when ENTER key pressed in <input> textbox
        searchBoxKeyup: function(e) {
            if (e.which === 13) {
                configTable.doSearch();
            }
        },
        footerSearchFocusin: function(e) {
            // configTable.clearSearchBoxes();
        },
        tableClick: function(e) {
            var target = e.target;
            // single checkbox click
            if (target.type === 'checkbox') {
                var row = target.parentNode.parentNode;
                if (row && row.tagName.toLowerCase() === 'tr') {
                    if (target.checked) {
                        row.classList.add(_selectRowClass);
                    } else {
                        row.classList.remove(_selectRowClass);
                    }
                }
            }
            // edit & delete links
            else if (target.tagName.toLowerCase() === 'span' && target.classList.contains('glyphicon')) {
                var row = target.parentNode.parentNode;
                if (target.classList.contains('glyphicon-remove-circle')) {
                    // TODO: ajax call to delete record from datatbase...
                    alert('CLICKED DELETE with record id: ' + _table.row(row).data()[0]);
                    configTable.sendXhr(
                        target, serverVars.deleteRowUrl, { id: _table.row(row).data()[0] }
                    );

                    // send XHR to request updated view
                    // _table.row(row).remove().draw();
                    configTable.clearCheckAll();
                }
                else if (target.classList.contains('glyphicon-edit')) {
                    document.location.href = serverVars.editRowUrl + '/' + _table.row(row).data()[0];
                }
            }
        },

        /* -----------------------------------------------------------------
            initialize DataTable and event listeners
        */
        init: function() {
            // allow ENTER in search boxes, otherwise possible form submit
            document.onkeypress = function(e) {
                if ((e.which === 13) && (e.target.type === 'text')) { return false; }
            };

            // action buttons
            var buttons = document.querySelectorAll(_actionButtonSelector);
            for (i = 0 ; i < buttons.length ; i++) {
                buttons[i].addEventListener('click', configTable.actionButtonClick, false);
            }

            // 'check all' checkbox
            var checkAll = document.querySelector(_checkAllSelector);
            if (checkAll != null) checkAll.addEventListener('click', configTable.checkAll, false);

            // datatable clicks
            var tableClick = document.querySelector(_tableId);
            if (tableClick != null) tableClick.addEventListener('click', configTable.tableClick, false);

            // inject search icons & add event listeners
            var footers = document.querySelectorAll(_tableId + ' tfoot th');
            footers[footers.length - 1].innerHTML =
                "<span class='search-icons glyphicon glyphicon-search' title='Search'></span>"
                + "<span class='search-icons glyphicon glyphicon-remove' title='Clear Search'></span>";
            var searchIcons = document.querySelectorAll('tfoot span.search-icons');
            for (var i = 0; i < searchIcons.length; i++) {
                searchIcons[i].addEventListener('click', configTable.searchIconsClick, false);
            }

            /* ---------------------------------------------------------------
                first column checkbox, last column edit & delete icon links
                -- inject search textboxes
                -- add event listeners to perform search on ENTER key press
            */
            var footerSearchBoxes = document.querySelectorAll(_tableId + ' tfoot th');
            for (var i = 1; i < footerSearchBoxes.length - 1; i++) {
                footerSearchBoxes[i].innerHTML =
                    "<input style='width:100% !important;display: block !important;'"
                    + " data-column-number='" + i + "'"
                    + " class='form-control' type='text' placeholder='Search' />";
                //footerSearchBoxes[i]
                //    .addEventListener('focusin', configTable.footerSearchFocusin, false);
                footerSearchBoxes[i]
                    .addEventListener('keyup', configTable.searchBoxKeyup, false);
            }
        }
    }
}();

$(document).ready(function() {
    var table = $(configTable.getTableId()).DataTable({
        processing: true,
        serverSide: true,
        deferRender: true,
        dom: 'lrtip',
        pagingType: 'full_numbers',
        // autoWidth: true,
        order: [[1, 'asc']],
        language: {
            processing: configTable.getLoadingElement(),
            paginate: {
                previous: "<span class='glyphicon glyphicon-chevron-left' title='PREVIOUS' />",
                next: "<span class='glyphicon glyphicon-chevron-right'  title='NEXT' />",
                first: "<span class='glyphicon glyphicon-fast-backward' title='FIRST' />",
                last: "<span class='glyphicon glyphicon-fast-forward' title='LAST' />"
            }
        },
        /* ----------------------------------------------------------------
            V1.10.11 does **NOT** support .done/.fail /.always, so must use 
            deprecated API to handle things
        */ 
        ajax: {
            url: serverVars.dataUrl,
            type: 'POST',
            headers: configTable.getXsrfToken(),
            error: function(jqXHR, responseText, errorThrown) {
                // explicitly hide on error, or loading element never goes away
                var n = document.querySelector('div.dataTables_processing')
                if (n !== null) n.style.display = 'none';

                // TODO: modal message
                console.log(errorThrown);
            },
            complete: function(data, textStatus, jqXHR) {
                configTable.clearCheckAll();
            }
        },
        columnDefs: [{
            targets: 0,
            searchable: false,
            orderable: false,
            render: function(data, type, full, meta) { return "<input type='checkbox'>"; }
        },
        {
            targets: serverVars.lastColumnIndex,
            searchable: false,
            orderable: false,
            render: function(data, type, full, meta) {
                return "<span class='glyphicon glyphicon-edit green link-icons'></span>"
                + " <span class='glyphicon glyphicon-remove-circle red link-icons'><span></span></span>";
            }
        }]
    });
    configTable.setTable(table).init();
});