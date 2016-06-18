﻿using System.Diagnostics.CodeAnalysis;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Autofac;
using Autofac.Integration.Mvc;
using kuujinbo.ASP.NET.Mvc.Controllers;
using kuujinbo.ASP.NET.Mvc.Services;

namespace kuujinbo.ASP.NET.Mvc
{
    [ExcludeFromCodeCoverage]
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            InitAutofac();
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        private void InitAutofac()
        {
            var builder = new ContainerBuilder();
            builder.RegisterType<CacInfo>().As<ICacInfo>();
            builder.RegisterType<ClientCertificate>().As<IClientCertificate>();

            // register all controllers using assembly scanning
            // builder.RegisterControllers(typeof(MvcApplication).Assembly);

            // register single controller
            builder.RegisterType<CacInfoController>().InstancePerRequest();

            var container = builder.Build();
            DependencyResolver.SetResolver(new AutofacDependencyResolver(container));
        }
    }
}