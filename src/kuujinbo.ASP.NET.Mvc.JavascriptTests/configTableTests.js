﻿/// <reference path="./../../src/kuujinbo.ASP.NET.Mvc/Scripts/lib/DataTables/jquery.dataTables.js" />
/// <reference path="./../../src/kuujinbo.ASP.NET.Mvc/Scripts/lib/DataTables/dataTables.bootstrap.js" />
/// <reference path="./../../src/kuujinbo.ASP.NET.Mvc/Scripts/lib/jquery-ui-1.11.4.js" />
/// <reference path="./../../src/kuujinbo.ASP.NET.Mvc/Scripts/jQueryDataTable/configTable.js" />
'use strict';

describe('configTable', function () {
    beforeEach(function () {
        var configValues = {
            dataUrl: '/',
            infoRowUrl: '/info',
            editRowUrl: '/edit',
            deleteRowUrl: '/delete',
            allowMultiColumnSorting: true
        };
        configTable.setConfigValues(configValues);
    });

    describe('selectors and DOM', function () {
        it('should initialize the table objects', function () {
            expect(configTable).toBeDefined();
            expect(configTable.getTableId()).toEqual('#jquery-data-table');
            expect(configTable.getCheckAllId()).toEqual('#datatable-check-all');

            // setTable() && setConfigValues() return 'this' to allow chaining
            expect(
                configTable.setTable({}).setConfigValues({})
            ).toEqual(configTable);

            expect(configTable.getLoadingElement()).toEqual(
                "<h1 class='dataTablesLoading'>Loading data "
                + "<span class='glyphicon glyphicon-refresh spin-infinite' /></h1>"
            );
        });

        it('should have the correct CSS selectors', function () {
            expect(configTable.getActionButtonSelector()).toEqual('#data-table-actions button.btn');
            expect(configTable.getSearchFilterSelector()).toEqual('th input[type=text], th select');
            expect(configTable.getCheckedSelector()).toEqual('input[type="checkbox"]:checked');
            expect(configTable.getUncheckedSelector()).toEqual('input[type="checkbox"]:not(:checked)');
        });

        it('should have the correct class names', function () {
            expect(configTable.getSelectedRowClass()).toEqual('datatable-select-row');

            var spinClasses = configTable.getSpinClasses();
            expect(spinClasses.length).toEqual(3);
            expect(spinClasses[0]).toEqual('glyphicon');
            expect(spinClasses[1]).toEqual('glyphicon-refresh');
            expect(spinClasses[2]).toEqual('spin-infinite');
        });
    });

    describe('clearCheckAll', function () {
        it('should uncheck checkAll', function () {
            var template = document.createElement('div');
            template.innerHTML = '<input id="'
                + configTable.getCheckAllId()
                + '" type="checkbox" />';
            document.body.appendChild(template);
            var checkbox = template.firstChild;

            configTable.clearCheckAll();

            expect(checkbox.checked).toEqual(false);
        });
    });

    // jasmine-jquery
    describe('clearSearchFilters', function () {
        it('should clear all filter values', function () {
            setFixtures(
                '<tfoot><tr>'
                + "<th><input type='text' value='00' /></th>"
                + "<th><input type='text' value='11' /></th>"
                + '<th><select name="select">'
                    + '<option value=""></option>'
                    + '<option selected="selected" value="true">Yes</option>'
                    + '<option value="false">No</option>'
                + '</select></th>'
                + '</tr></tfoot>'
            );
            spyOn(configTable, 'clearSearchColumns');

            var filters = document.querySelectorAll(
                configTable.getSearchFilterSelector()
            );
            configTable.clearSearchFilters();

            expect(filters.length).toEqual(3);
            expect(filters[0].value).toEqual('');
            expect(filters[1].value).toEqual('');
            expect(filters[2].value).toEqual('');
            expect(configTable.clearSearchColumns).toHaveBeenCalledTimes(1);
        });
    });

    // jasmine-jquery
    describe('getXsrfToken', function () {
        it('should return null when hidden field not in DOM', function () {
            expect(configTable.getXsrfToken()).toBeNull()
        });

        it('should return token when hidden field in DOM', function () {
            setFixtures(
                "<input name='__RequestVerificationToken' type='hidden' value='XXX' />"
            );

            var xsrf = configTable.getXsrfToken();

            expect(xsrf).not.toBeNull();
            expect(xsrf.__RequestVerificationToken).toEqual('XXX');
        });
    });

    // jasmine-jquery
    describe('search', function () {
        beforeEach(function () {
            spyOn(configTable, 'setSearchColumn');
            spyOn(configTable, 'drawAndGoToPage1');
        });

        it('should not search when textboxes are empty or whitespace', function () {
            setFixtures(
                '<th>'
                + "<input type='text' placeholder='Search' data-column-number='1' />"
                + "<input type='text' placeholder='Search' data-column-number='2' value='   ' />"
                + '</th>'
            );
            var resultTextboxes = document.querySelectorAll('input[type=text]');

            configTable.search();

            expect(configTable.setSearchColumn.calls.count()).toEqual(2);
            expect(configTable.drawAndGoToPage1.calls.count()).toEqual(0);
            expect(resultTextboxes.length).toEqual(2);
            expect(resultTextboxes[0].value).toEqual('');
            expect(resultTextboxes[1].value).toEqual('');
        });

        it('should search when any textbox is not empty or whitespace', function () {
            spyOn(configTable, 'clearCheckAll');
            setFixtures(
                '<th>'
                + "<input type='text' placeholder='Search' data-column-number='1' />"
                + "<input type='text' placeholder='Search' data-column-number='2' value='   ' />"
                + "<input type='text' placeholder='Search' data-column-number='3' value='03' />"
                + "<input type='text' placeholder='Search' data-column-number='4' value='04' />"
                + '</th>'
            );
            var resultTextboxes = document.querySelectorAll('input[type=text]');

            configTable.search();

            expect(configTable.setSearchColumn.calls.count()).toEqual(4);
            expect(configTable.clearCheckAll.calls.count()).toEqual(1);
            expect(configTable.drawAndGoToPage1.calls.count()).toEqual(1);
            expect(resultTextboxes.length).toEqual(4);
            expect(resultTextboxes[0].value).toEqual('');
            expect(resultTextboxes[1].value).toEqual('');
            expect(resultTextboxes[2].value).toEqual('03');
            expect(resultTextboxes[3].value).toEqual('04');
        });

        it('should not search when the default select option is selected', function () {
            setFixtures(
                '<th>'
                + "<select name='select'>"
                + "<option value='' selected='selected'></option>"
                + "<option value='true'>Yes</option>"
                + "<option value='false'>No</option>"
                + "</select></th>"
            );
            var result = document.querySelectorAll('select');

            configTable.search();

            expect(configTable.setSearchColumn.calls.count()).toEqual(1);
            expect(configTable.drawAndGoToPage1.calls.count()).toEqual(0);
            expect(result.length).toEqual(1);
        });

        it('should search when any selected select is not empty or whitespace', function () {
            spyOn(configTable, 'clearCheckAll');
            setFixtures(
                "<th><select name='select'>"
                + "<option value=''></option>"
                + "<option value='true' selected='selected'>Yes</option>"
                + "<option value='false'>No</option>"
                + '</select></th>'
                + "<th><select name='select'>"
                + "<option value='' selected='selected'></option>"
                + "<option value='true'>Yes</option>"
                + "<option value='false'>No</option>"
                + '</select></th>'
                + "<th><select name='select'>"
                + "<option value=''></option>"
                + "<option value='true' selected='selected'>Yes</option>"
                + "<option value='false'>No</option>"
                + '</select></th>'
            );
            var result = document.querySelectorAll('input[type=text]');

            configTable.search();

            expect(configTable.setSearchColumn.calls.count()).toEqual(3);
            expect(configTable.clearCheckAll.calls.count()).toEqual(1);
            expect(configTable.drawAndGoToPage1.calls.count()).toEqual(1);
        });

    });

    // add / remove processing spinner (jasmine-jquery)
    describe('showSpin', function () {
        var spinClasses;
        beforeEach(function () {
            spinClasses = configTable.getSpinClasses();
        });

        it('should add the expected spin classes', function () {
            setFixtures('<div><span></span></div>');
            var domContainer = document.querySelector('div');

            configTable.showSpin(domContainer, true);
            var span = domContainer.querySelector('span');

            expect(spinClasses.length).toEqual(3);
            for (var i = 0; i < spinClasses.length; ++i) {
                expect(span.classList.contains(spinClasses[i])).toEqual(true);
            }
        });

        it('should remove the spin classes', function () {
            setFixtures(
                '<div><span class="' + spinClasses.join(' ') + '"></span></div>'
            );
            var domContainer = document.querySelector('div');

            configTable.showSpin(domContainer);
            var span = domContainer.querySelector('span');

            for (var i = 0; i < spinClasses.length; ++i) {
                expect(span.classList.contains(spinClasses[i])).toEqual(false);
            }
        });
    });

    describe('sendXhr', function () {
        var deferred, element;
        beforeEach(function () {
            deferred = new jQuery.Deferred();
            element = document.createElement('button');
            spyOn(jQuery, 'ajax').and.returnValue(deferred);
            spyOn(configTable, 'showSpin');
            spyOn(configTable, 'getXsrfToken');
        });

        it('should call jQuery.ajax()', function () {
            var expectedArgs = {
                url: '/', headers: undefined, data: {}, type: 'POST'
            };
            configTable.sendXhr(element, '/', {});

            expect(jQuery.ajax.calls.count()).toEqual(1);
            expect(jQuery.ajax).toHaveBeenCalledWith(expectedArgs);
        });

        it('should call showSpin before sending the XHR', function () {
            configTable.sendXhr(element, '/', {});

            // mock XHR has **NOT** returned
            expect(deferred.state()).toEqual("pending");
            expect(configTable.showSpin.calls.count()).toEqual(1);
            expect(configTable.showSpin).toHaveBeenCalledWith(element, true);
            expect(configTable.getXsrfToken).toHaveBeenCalledTimes(1);
        });

        it('should call jqModalError and showSpin when promise is rejected', function () {
            spyOn(configTable, 'jqModalError');
            var httpResponseMsg = 'HTTP response error';
            var jqXHR = { responseJSON: httpResponseMsg };
            configTable.sendXhr(element, '/', {});

            deferred.reject(jqXHR);

            // ajax.fail()
            expect(configTable.jqModalError.calls.count()).toEqual(1);
            expect(configTable.jqModalError).toHaveBeenCalledWith(httpResponseMsg);
            expect(configTable.showSpin.calls.count()).toEqual(2);
            expect(configTable.getXsrfToken).toHaveBeenCalledTimes(1);
            // ajax.always()
            expect(configTable.showSpin).toHaveBeenCalledWith(element);
        });

        it('should call jqModalOK, showSpin, and draw when promise is fulfilled for bulk action', function () {
            spyOn(configTable, 'jqModalOK');
            spyOn(configTable, 'draw');
            var httpResponseMsg = 'HTTP response success';
            configTable.sendXhr(element, '/', {});

            deferred.resolve(httpResponseMsg);

            // ajax.done()
            expect(configTable.jqModalOK.calls.count()).toEqual(1);
            expect(configTable.jqModalOK).toHaveBeenCalledWith(httpResponseMsg);
            expect(configTable.draw).toHaveBeenCalledTimes(1);
            expect(configTable.showSpin.calls.count()).toEqual(2);
            expect(configTable.getXsrfToken).toHaveBeenCalledTimes(1);
            // ajax.always()
            expect(configTable.showSpin).toHaveBeenCalledWith(element);
        });

        it('should call jqPartialViewModalOK and showSpin when promise is fulfilled for partial view action', function () {
            spyOn(configTable, 'jqPartialViewModalOK');
            var partialHtmlResponse = '<h1>Partial View</h1>';
            var buttonText = 'Submit';
            element.textContent = buttonText;

            configTable.sendXhr(element, '/', null, 'GET');

            deferred.resolve(partialHtmlResponse);

            // ajax.done()
            expect(configTable.jqPartialViewModalOK.calls.count()).toEqual(1);
            expect(configTable.jqPartialViewModalOK)
                .toHaveBeenCalledWith(partialHtmlResponse, buttonText);
            expect(configTable.showSpin.calls.count()).toEqual(2);
            expect(configTable.getXsrfToken).toHaveBeenCalledTimes(1);
            // ajax.always()
            expect(configTable.showSpin).toHaveBeenCalledWith(element);
        });
    });

    describe('init', function () {
        var id = 'id';
        it('should call the setup functions', function () {
            spyOn(configTable, 'getTableId').and.returnValue(id);
            spyOn(configTable, 'addListeners');
            configTable.init();

            expect(configTable.getTableId.calls.count()).toEqual(1);
            expect(configTable.addListeners.calls.count()).toEqual(1);
            expect(configTable.addListeners).toHaveBeenCalledWith(id);
        });
    });

    /* ========================================================================
       verify event listeners are registered in init()
       event listener functions themsleves are tested in isolation below
       ========================================================================
    */
    describe('EventTarget registration', function () {
        var tableId;
        beforeEach(function () {
            tableId = configTable.getTableId();
            setFixtures(
            "<div id='data-table-actions'>"
            + "<a id='IGNORE-link' href='#'>link</a>"
            + "<button id='BUTTON-ACTION' class='btn'>a</button>"
            + "<button id='IGNORE-button'>b</button>"
            + '</div>'
            + "<table id='jquery-data-table'>"
                + "<thead><tr>"
                    + "<th><input id='datatable-check-all' type='checkbox'></th>"
                    + "<th>Col 00</th>"
                    + "<th>Col 01</th>"
                    + "<th>Col 02</th>"
                    + "<th></th>"
                + "</tr></thead>"
                + "<tfoot><tr>"
                    + "<th></th>"
                    + "<th data-is-searchable='true'><input type='text' value='00' /></th>"
                    + "<th data-is-searchable='true'><input type='text' value='00' /></th>"
                    + "<th style='white-space: nowrap;'>"
                    + "<span class='search-icons glyphicon glyphicon-search' title='Search'></span>"
                    + "<span class='search-icons glyphicon glyphicon-repeat' title='Clear Search and reload page'></span>"
                    + "</th>"
                + "</tr></tfoot>"
                + "<tbody><tr>"
                    + "<td><input type='checkbox' /></td>"
                    + "<td>Row 1 data cell 00</td>"
                    + "<td>Row 1 data cell 01</td>"
                    + "<td>Row 1 data cell 02</td>"
                    + "<td>"
                        + "<span class='glyphicon-edit'></span>"
                        + "<span class='glyphicon-remove-circle'><span></span></span>"
                    + "</td>"
                + "</tr></tbody>"
            + "</table>"
            );
        });

        it('should call the click handler for action buttons', function () {
            spyOn(configTable, 'clickActionButton');

            configTable.init();
            // not a button => ignore
            var linkIgnore = document.querySelector('#IGNORE-link');
            linkIgnore.dispatchEvent(new Event('click'));
            // button without class 'btn' => ignore
            var buttonIgnore = document.querySelector('#IGNORE-button');
            buttonIgnore.dispatchEvent(new Event('click'));
            // target match => handle event
            var actionButtonMatch = document.querySelector('#BUTTON-ACTION');
            actionButtonMatch.dispatchEvent(new Event('click'));

            expect(configTable.clickActionButton.calls.count()).toEqual(1);
        });

        it('should call the click handler for checkAll checkbox', function () {
            spyOn(configTable, 'clickCheckAll');

            configTable.init();
            var checkAll = document.querySelector(configTable.getCheckAllId());
            checkAll.dispatchEvent(new Event('click'));

            expect(checkAll.tagName).toMatch(/^input$/i);
            expect(checkAll.getAttribute('type')).toBe('checkbox');
            expect(configTable.clickCheckAll.calls.count()).toEqual(1);
        });

        it('should call the handler for any click on the table', function () {
            spyOn(configTable, 'clickTable');

            configTable.init();
            // addEventListener() with last parameter === false
            // so no need to test child elements
            var table = document.querySelector(tableId);
            table.dispatchEvent(new Event('click'));

            expect(table.tagName).toMatch(/^table$/i);
            expect(configTable.clickTable.calls.count()).toEqual(1);
        });

        it('should call the click handler for the search icons', function () {
            spyOn(configTable, 'clickSearch');

            configTable.init();
            var searchIcons = document.querySelectorAll('tfoot span.search-icons');
            searchIcons[0].dispatchEvent(new Event('click'));
            searchIcons[1].dispatchEvent(new Event('click'));

            expect(searchIcons.length).toEqual(2);
            expect(configTable.clickSearch.calls.count()).toEqual(2);
        });

        it('should call the keyup handler for the search input fields', function () {
            spyOn(configTable, 'keyupSearch');

            configTable.init();
            var searchBoxes = document.querySelectorAll(tableId + ' tfoot input[type=text]');
            searchBoxes[0].dispatchEvent(new Event('keyup'));
            searchBoxes[1].dispatchEvent(new Event('keyup'));

            expect(searchBoxes.length).toEqual(2);
            expect(configTable.keyupSearch.calls.count()).toBe(2);
        });
    });

    /* ========================================================================
       event listener functions - verify EventTarget and correct behavior
       ========================================================================
    */
    describe('clickActionButton', function () {
        var template, event;
        beforeEach(function () {
            template = document.createElement('div');
            event = {
                preventDefault: jasmine.createSpy()
            };
            spyOn(configTable, 'sendXhr');
        });

        it('should be an error when a button does not have a data URL', function () {
            spyOn(configTable, 'getSelectedRowIds')
            spyOn(configTable, 'jqModalError');
            template.innerHTML = '<button class="btn btn-primary">Batch Update<span></span></button>';
            event.target = template.firstChild;

            var result = configTable.clickActionButton(event);

            expect(result).toEqual(false);
            expect(event.preventDefault).toHaveBeenCalledTimes(1);
            expect(configTable.getSelectedRowIds).not.toHaveBeenCalled();
            expect(configTable.sendXhr).not.toHaveBeenCalled();
            expect(configTable.jqModalError).toHaveBeenCalledWith(
                configTable.getInvalidUrlMessage()
            );
        });

        it('should be an error when no rows are selected for a bulk action', function () {
            spyOn(configTable, 'getSelectedRowIds').and.returnValue([]);
            spyOn(configTable, 'jqModalError');
            template.innerHTML = '<button class="btn btn-primary" data-url="/action">Batch Update<span></span></button>';
            event.target = template.firstChild;

            var result = configTable.clickActionButton(event);

            expect(result).toEqual(false);
            expect(event.preventDefault).toHaveBeenCalledTimes(1);
            expect(configTable.getSelectedRowIds).toHaveBeenCalledTimes(1);
            expect(configTable.sendXhr).not.toHaveBeenCalled();
            expect(configTable.jqModalError.calls.mostRecent().args[0]).toMatch('<h2>No Records Selected</h2>');
        });

        it('should send XHR when rows are selected for a bulk action', function () {
            spyOn(configTable, 'getSelectedRowIds').and.returnValue([1, 2]);
            template.innerHTML = '<button class="btn btn-primary" data-url="/action">Batch Update<span></span></button>';
            event.target = template.firstChild;

            var result = configTable.clickActionButton(event);

            expect(result).toEqual(false);
            expect(event.preventDefault).toHaveBeenCalledTimes(1);
            expect(configTable.getSelectedRowIds).toHaveBeenCalledTimes(1);
            expect(configTable.sendXhr).toHaveBeenCalledWith(
                event.target, '/action', { ids: [1, 2] }
            );
        });

        it('should send XHR GET with null data for a partial view action', function () {
            template.innerHTML = "<button class='btn btn-primary' data-url='/action'"
                + ' partial-view="">'
                + '<span></span></button>';
            event.target = template.firstChild;

            var result = configTable.clickActionButton(event);

            expect(result).toEqual(false);
            expect(event.preventDefault).toHaveBeenCalledTimes(1);
            expect(configTable.sendXhr).toHaveBeenCalledWith(
                event.target, '/action', null, 'GET' 
            );
        });
    });

    // click 'datatable-check-all' checkbox - [un]check all checkboxes 
    // (jasmine-jquery)
    describe('clickCheckAll', function () {
        var event, checked, unchecked, checkAllId;
        beforeEach(function () {
            event = {};
            checked = configTable.getCheckedSelector();
            unchecked = configTable.getUncheckedSelector();
            checkAllId = configTable.getCheckAllId();
            setFixtures(
                "<div><input id='datatable-check-all' type='checkbox' /></div>"
                + "<div id='WANTED'>"
                + "<input type='checkbox' />"
                + "<input type='checkbox' checked='checked' />"
                + '</div>'
            );
        });

        it('should result in all checkboxes unchecked when clickAll is unchecked', function () {
            event.target = document.querySelector(checkAllId);

            configTable.clickCheckAll(event);
            var checkboxes = document.querySelectorAll('#WANTED input[type=checkbox]');

            expect(checkboxes.length).toBe(2);
            for (var i = 0; i < checkboxes.length; ++i) {
                expect(checkboxes[i].checked).toBe(false);
            }
        });

        it('should result in all checkboxes checked when clickAll is checked', function () {
            var checkAll = document.querySelector(checkAllId);
            checkAll.checked = true;
            event.target = checkAll;

            configTable.clickCheckAll(event);
            var checkboxes = document.querySelectorAll('#WANTED input[type=checkbox]');

            expect(checkboxes.length).toBe(2);
            for (var i = 0; i < checkboxes.length; ++i) {
                expect(checkboxes[i].checked).toBe(true);
            }
        });
    });

    describe('clickSearch', function () {
        var template, event;
        beforeEach(function () {
            template = document.createElement('div');
            event = {};
        });

        it('should not search a non macthing event target', function () {
            spyOn(configTable, 'search');
            spyOn(configTable, 'clearSearchFilters');
            spyOn(configTable, 'reload');
            template.innerHTML = "<span class='NO-MATCH' title='Search'></span>";
            event.target = template.firstChild;

            configTable.clickSearch(event);
            expect(configTable.search).not.toHaveBeenCalled();
            expect(configTable.clearSearchFilters).not.toHaveBeenCalled();
            expect(configTable.reload).not.toHaveBeenCalled();
        });

        it('should search when icon is clicked', function () {
            spyOn(configTable, 'search');
            template.innerHTML = "<span class='search-icons glyphicon glyphicon-search' title='Search'></span>";
            event.target = template.firstChild;

            configTable.clickSearch(event);
            expect(configTable.search).toHaveBeenCalledTimes(1);
        });

        it('should clear the search and reload data when icon is clicked', function () {
            spyOn(configTable, 'clearSearchFilters');
            spyOn(configTable, 'reload');
            template.innerHTML = "<span class='search-icons glyphicon glyphicon-repeat title='Clear Search'></span>";
            event.target = template.firstChild;

            configTable.clickSearch(event);
            expect(configTable.clearSearchFilters).toHaveBeenCalledTimes(1);
            expect(configTable.reload).toHaveBeenCalledTimes(1);
        });
    });

    // (jasmine-jquery)
    describe('clickTable link', function () {
        var event, config, recordId;
        beforeEach(function () {
            var infoLink =
                "<span class='glyphicon glyphicon-info-sign blue link-icons' data-action='"
                + configTable.getInfoAction()
                + "' title='Information'></span>";

            var editLink =
                "<span class='glyphicon glyphicon-edit green link-icons' data-action='"
                + configTable.getEditAction()
                + "' title='Edit'></span>";

            var deleteLink =
                "<span class='glyphicon glyphicon-remove-circle red link-icons' data-action='"
                + configTable.getDeleteAction()
                + "' title='Delete'><span></span></span>";

            event = {};
            config = configTable.getConfigValues();
            setFixtures('<table><tr><td>'
                + [infoLink, editLink, deleteLink].join(' ')
                + "<span class='NO-MATCH'><span></span></span>"
                + '</td></tr></table>'
            );
            recordId = 1;
            spyOn(configTable, 'getRowData').and.returnValue(recordId);
            spyOn(configTable, 'getConfigValues').and.returnValue(config);
        });

        it('should ignore a non-matching event target', function () {
            spyOn(configTable, 'sendXhr');
            spyOn(configTable, 'redirect');
            spyOn(configTable, 'clearCheckAll');

            event.target = document.querySelector('span.NO-MATCH');
            configTable.clickTable(event);

            expect(event.target.tagName.toLowerCase()).toEqual('span');
            expect(configTable.sendXhr).not.toHaveBeenCalled();
            expect(configTable.redirect).not.toHaveBeenCalled();
            expect(configTable.getConfigValues).not.toHaveBeenCalled();
            expect(configTable.getRowData).not.toHaveBeenCalled();
            expect(configTable.clearCheckAll).not.toHaveBeenCalled();
        });

        it('should redirect to the info page', function () {
            spyOn(configTable, 'redirect');

            event.target = document.querySelector('span[data-action=info]');
            // event.target = document.querySelector('span.glyphicon-edit');
            var row = document.querySelector('tr');
            configTable.clickTable(event);

            expect(event.target.tagName.toLowerCase()).toEqual('span');
            expect(configTable.getConfigValues).toHaveBeenCalledTimes(1);
            expect(configTable.getRowData).toHaveBeenCalledWith(row);
            expect(configTable.redirect).toHaveBeenCalledWith(
                config.infoRowUrl + '/' + recordId
            );
        });

        it('should redirect to the edit page', function () {
            spyOn(configTable, 'redirect');

            event.target = document.querySelector('span[data-action=edit]');
            var row = document.querySelector('tr');
            configTable.clickTable(event);

            expect(event.target.tagName.toLowerCase()).toEqual('span');
            expect(configTable.getConfigValues).toHaveBeenCalledTimes(1);
            expect(configTable.getRowData).toHaveBeenCalledWith(row);
            expect(configTable.redirect).toHaveBeenCalledWith(
                config.editRowUrl + '/' + recordId
            );
        });

        it('should delete the selected record', function () {
            spyOn(configTable, 'sendXhr');
            spyOn(configTable, 'clearCheckAll');

            var span = document.querySelector('span[data-action=delete]');
            var row = document.querySelector('tr');
            event.target = span;
            configTable.clickTable(event);

            expect(event.target.tagName.toLowerCase()).toEqual('span');
            expect(configTable.sendXhr).toHaveBeenCalledWith(
                span, config.deleteRowUrl, { id: recordId }
            );
            expect(configTable.getConfigValues).toHaveBeenCalledTimes(1);
            expect(configTable.getRowData).toHaveBeenCalledWith(row);
            expect(configTable.clearCheckAll).toHaveBeenCalledTimes(1);
        });
    });

    // (jasmine-jquery)
    describe('clickTable checkbox', function () {
        var event, selectedClass;
        beforeEach(function () {
            event = {};
            selectedClass = configTable.getSelectedRowClass();
            spyOn(configTable, 'getSelectedRowClass')
                .and.returnValue(selectedClass);
        });

        it('should add selected row class when checkbox is checked', function () {
            setFixtures('<tr>'
                + "<td><input type='checkbox' checked='checked' /></td>"
                + "<td></td>"
                + '</tr>'
            );
            var row = document.querySelector('tr');
            var checkbox = row.querySelector('input[type="checkbox"]:checked');
            event.target = checkbox;

            configTable.clickTable(event);

            expect(event.target.type).toEqual('checkbox');
            expect(event.target.checked).toEqual(true);
            expect(configTable.getSelectedRowClass).toHaveBeenCalledTimes(1);
            expect(row.classList.contains(selectedClass)).toEqual(true);
        });

        it('should remove selected row class when checkbox is not', function () {
            setFixtures('<tr class="' + selectedClass + '">'
                + "<td><input type='checkbox' /></td>"
                + "<td></td>"
                + '</tr>'
            );
            var row = document.querySelector('tr');
            var checkbox = row.querySelector('input[type="checkbox"]:not(:checked)');
            event.target = checkbox;

            configTable.clickTable(event);

            expect(event.target.type).toEqual('checkbox');
            expect(event.target.checked).toEqual(false);
            expect(configTable.getSelectedRowClass).toHaveBeenCalledTimes(1);
            expect(row.classList.length).toEqual(0);
        });
    });

    describe('keyupSearch', function () {
        var event;
        beforeEach(function () {
            spyOn(configTable, 'search');
            event = {};
        });

        it('should search when KeyboardEvent.key is [Enter]', function () {
            event.key = 'Enter';

            configTable.keyupSearch(event);
            expect(configTable.search).toHaveBeenCalledTimes(1);
        });

        it('should not search when KeyboardEvent.key is not [Enter]', function () {
            event.key = 'Escape';

            configTable.keyupSearch(event);
            expect(configTable.search).not.toHaveBeenCalled();
        });
    });

    /* ========================================================================
       utility functions
       ========================================================================
    */
});