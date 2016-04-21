﻿using System.Web.Mvc;

namespace kuujinbo.ASP.NET.Mvc.Misc
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
            FilterProviders.Providers.Add(XsrfFilter.Get());
        }
    }
}