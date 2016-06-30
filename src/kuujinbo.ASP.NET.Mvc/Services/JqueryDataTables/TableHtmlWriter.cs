﻿/* ============================================================================
 * HTML/JavaScript written to Partial View:
 * ~/views/shared/_jQueryDataTables.cshtml
 * ============================================================================
 */
using System;
using System.Linq;
using System.Text;
using kuujinbo.ASP.NET.Mvc.Helpers;
using kuujinbo.ASP.NET.Mvc.Services.Json;

namespace kuujinbo.ASP.NET.Mvc.Services.JqueryDataTables
{
    public partial class Table
    {
        public string ActionButtonsHtml()
        {
            return ActionButtons.Count > 0
                ? string.Join("", ActionButtons.Select(x => x.GetHtml()))
                : string.Empty;
        }

        public string GetTableHtml()
        {
            if (Columns == null || Columns.Count() < 1)
            {
                throw new ArgumentNullException("Columns");
            }

            var showCheckboxColumn = ShowCheckboxColumn();
            StringBuilder s = new StringBuilder("<thead><tr>");
            GetTheadHtml(s, showCheckboxColumn);
            s.AppendLine("</tr></thead>");

            s.AppendLine("<tfoot><tr>");
            GetTfootHtml(s, showCheckboxColumn);
            s.Append("</tr></tfoot>");

            return s.ToString();
        }

        private void GetTheadHtml(StringBuilder s, bool showCheckboxColumn)
        {
            s.AppendLine(@"
<th style='white-space:nowrap;text-align:left !important;padding:2px !important'>
<input id='datatable-check-all' type='checkbox' />
</th>"
            );

            foreach (var c in Columns)
            {
                var widthCss = c.DisplayWidth == 0
                    ? ""
                    : string.Format(" style='width:{0}%'", c.DisplayWidth);
                if (c.Display) s.AppendFormat("<th{0}>{1}</th>\n", widthCss, c.Name);
            }

            s.AppendLine("<th></th>");
        }

        private void GetTfootHtml(StringBuilder s, bool showCheckboxColumn)
        {
            // first column checkbox, so we start at 1 instead of 0
            var i = 1;
            s.AppendLine("<th></th>");

            foreach (var c in Columns)
            {
                if (c.Type == typeof(bool) || c.Type == typeof(bool?))
                {
                    s.AppendFormat("<th data-is-searchable='{0}' data-type='{1}'>",
                        c.IsSearchable ? c.IsSearchable.ToString().ToLower() : string.Empty,
                        c.Type
                    );
                    // NOTE: MS hard-codes bool ToString(): 'True' and 'False'
                    s.AppendFormat(@"
<select name='select' class='form-control input-sm' data-column-number='{0}'>
    <option value='' selected='selected'></option> 
    <option value='true'>{1}</option>
    <option value='false'>{2}</option>
</select></th>",

                        i,
                        DisplaySettings.Settings.BoolTrue,
                        DisplaySettings.Settings.BoolFalse
                    );
                }
                else if (c.Type != null && c.Type.IsEnum)
                {
                    s.AppendFormat("<th data-is-searchable='{0}' data-type='{1}'>",
                        c.IsSearchable ? c.IsSearchable.ToString().ToLower() : string.Empty,
                        c.Type
                    );
                    s.AppendFormat(@"
<select name='select' class='form-control input-sm' data-column-number='{0}'>
<option value='' selected='selected'></option>"
                    , i);
                    foreach (var e in Enum.GetValues(c.Type))
                    {
                        s.AppendFormat("<option value='{0}'>{1}</option>\n",
                            e, RegexUtils.PascalCaseSplit(e.ToString())
                        );
                    }
                    s.Append("</select></th>");
                }
                else
                {
                    s.AppendFormat("<th data-is-searchable='{0}' data-type='{1}'>",
                        c.IsSearchable ? c.IsSearchable.ToString().ToLower() : string.Empty,
                        c.Type
                    );
                    s.AppendFormat(@"
<input style='width:100% !important;display: block !important;' data-column-number='{0}'
class='form-control input-sm' type='text' placeholder='Search' /></th>"
                    , i);
                }
                ++i;

            }
            s.AppendLine("<th style='white-space: nowrap;'>");
            s.Append("<span class='btn search-icons glyphicon glyphicon-search' title='Search'></span>");
            s.Append("<span class='btn search-icons glyphicon glyphicon-repeat' title='Clear Search and Reload'></span>");
            s.Append("<span id='datatable-save-as' class='btn btn-default glyphicon glyphicon-download-alt' title='Save As...'></span>\n");
            s.Append("</th>");
        }

        public string GetJavaScriptConfig()
        {
            if (string.IsNullOrEmpty(DataUrl))
                throw new ArgumentNullException("DataUrl");

            return new JsonNetSerializer().Get(new
            {
                dataUrl = DataUrl,
                infoRowUrl = InfoRowUrl,
                deleteRowUrl = DeleteRowUrl,
                editRowUrl = EditRowUrl,
                showCheckboxColumn = ShowCheckboxColumn(),
                allowMultiColumnSorting = AllowMultiColumnSorting
            });
        }
    }
}