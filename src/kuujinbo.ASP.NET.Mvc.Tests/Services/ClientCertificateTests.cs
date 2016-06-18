﻿using System;
using System.Collections.Specialized;
using System.Web;
using kuujinbo.ASP.NET.Mvc.Services;
using Xunit;
using Moq;

namespace kuujinbo.ASP.NET.Mvc.Tests.Services
{
    public class ClientCertificateTests
    {
        ClientCertificate _clientCertificate;
        Mock<HttpRequestBase> _httpRequestBase;

        public ClientCertificateTests()
        {
            _clientCertificate = new ClientCertificate();
            _httpRequestBase = new Mock<HttpRequestBase>(MockBehavior.Strict);
        }

        [Fact]
        public void Get_IsLocalRequest_ReturnsByteArrayFromRequestCertificate()
        {
            //using (HttpRequestMessage request = new HttpRequestMessage())
            //{
                _httpRequestBase.Setup(x => x.IsLocal).Returns(true);

                var httpWorkerRequest = new Mock<HttpWorkerRequest>();
                httpWorkerRequest.Setup(x => x.GetRawUrl()).Returns("/");
                httpWorkerRequest.Setup(x => x.GetClientCertificate())
                    .Returns(new byte[0]);
                HttpContext context = new HttpContext(httpWorkerRequest.Object);
                _httpRequestBase.Setup(x => x.ClientCertificate)
                    .Returns(context.Request.ClientCertificate);

                Assert.IsType<byte[]>(
                    _clientCertificate.Get(_httpRequestBase.Object)
                );            
            // }
        }

        [Fact]
        public void Get_IsNotLocalRequest_ReturnsByteArrayFromRequestHeaders()
        {
            _httpRequestBase.Setup(x => x.IsLocal).Returns(false);

            var headers = new NameValueCollection();
            headers[ClientCertificate.CERT_HEADER] = Convert
                .ToBase64String(new byte[0]);
            _httpRequestBase.Setup(x => x.Headers).Returns(headers);

            Assert.IsType<byte[]>(
                _clientCertificate.Get(_httpRequestBase.Object)
            );
        }
    }
}