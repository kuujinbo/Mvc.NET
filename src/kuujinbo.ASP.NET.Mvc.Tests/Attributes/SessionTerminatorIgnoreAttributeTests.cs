﻿using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using kuujinbo.ASP.NET.Mvc.Attributes;
using Moq;
using Xunit;

namespace kuujinbo.ASP.NET.Mvc.Tests.Attributes
{
    public class SessionTerminatorIgnoreAttributeTests
    {
        SessionTerminatorIgnoreAttribute _attribute;
        ActionExecutingContext _actionExecutingContext;

        public SessionTerminatorIgnoreAttributeTests()
        {
            _attribute = new SessionTerminatorIgnoreAttribute();
            var httpContext = new Mock<HttpContextBase>();
            var requestContext = new RequestContext(httpContext.Object, new RouteData());

            var controller = new Mock<ControllerBase>();
            controller.Object.TempData = new TempDataDictionary();

            _actionExecutingContext = new ActionExecutingContext(
                new ControllerContext(requestContext, controller.Object),
                new Mock<ActionDescriptor>().Object,
                new Dictionary<string, object>()
            );
        }

        [Fact]
        public void OnActionExecuting_WithAttribute_HasTempDataValue()
        {
            _attribute.OnActionExecuting(_actionExecutingContext);

            Assert.Equal(
                _actionExecutingContext.Controller.TempData[SessionTerminator.IGNORE_SESSION_TIMEOUT],
                true
            );
        }
    }
}