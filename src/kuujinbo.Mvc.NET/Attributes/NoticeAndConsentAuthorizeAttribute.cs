﻿using System;
using System.Web.Mvc;
using System.Web.Routing;

namespace kuujinbo.Mvc.NET.Attributes
{
    [AttributeUsage(
        AttributeTargets.Method | AttributeTargets.Class,
        AllowMultiple = false,
        Inherited = true)
    ]
    public sealed class NoticeAndConsentAuthorizeAttribute : AuthorizeAttribute
    {
        public NoticeAndConsentAuthorizeAttribute(string controllerName, string actionName)
        {
            ControllerName = controllerName;
            ActionName = actionName;
        }

        /// <summary>
        /// Notice/Consent Acknowledgement controller name
        /// </summary>
        public string ControllerName { get; private set; }

        /// <summary>
        /// Notice/Consent Acknowledgement action name
        /// </summary>
        public string ActionName { get; private set; } 

        /// <summary>
        /// Deny access to any application page without user acknowledgment.
        /// </summary>
        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            var context = filterContext.HttpContext;
            var request = filterContext.HttpContext.Request;

            // force acknowledgement
            if (request.Cookies[HttpCookieFactory.NOTICE_AND_CONSENT] == null)
            {
                // redirect if return URL exists
                if (context.Response.Cookies[HttpCookieFactory.RETURN_URL] == null
                    || string.IsNullOrWhiteSpace(context.Response.Cookies[HttpCookieFactory.RETURN_URL].Value))
                {
                    context.Response.SetCookie(
                        HttpCookieFactory.Create(
                            HttpCookieFactory.RETURN_URL,
                            request.Url.PathAndQuery,
                            secure: request.Url.Scheme.Equals("https")
                        )
                    );
                }
                // redirect to application home
                filterContext.Result = new RedirectToRouteResult(
                    new RouteValueDictionary(new { controller = ControllerName, action = ActionName })
                );
            }
        }
    }
}