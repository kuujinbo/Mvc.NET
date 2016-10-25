﻿var customFilter = function() {
    return {
        setupCustomFilters: function() {
            // return array => resolved && rejected jqXHR objects
            $.when([
                '/jQueryDataTables/CustomPositionFilter',
                '/jQueryDataTables/CustomOfficeFilter'
            ]
            .map(function(url) { return $.get(url); }))
            .always(function(arrayJqXHR) {
                arrayJqXHR.forEach(function(element, index, array) {
                    // resolved
                    element.then(function(data, textStatus, jqXHR) {
                        if (index === 0) {
                            configTable.addValuePicker("th > input[data-column-number='2']", data);
                        }
                        else {
                            configTable.addValuePicker("th > input[data-column-number='3']", data);
                        }
                    },
                    // rejected
                    function(jqXHR, textStatus, errorThrown) {
                        configTable.jqModalError(
                            'There was an error looking up Position or Office. Please try again.'
                        );
                    });
                });
            });
        }
    };
}();

customFilter.setupCustomFilters();