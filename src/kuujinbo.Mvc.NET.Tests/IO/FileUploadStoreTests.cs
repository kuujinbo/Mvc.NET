﻿using kuujinbo.Mvc.NET.IO;
using Moq;
using System;
using System.IO;
using System.Web;
using Xunit;

namespace kuujinbo.Mvc.NET.Tests.IO
{
    public class TestFileUploadStore : FileUploadStore 
    {
        public TestFileUploadStore(
            Uri basePath, 
            string fileNameWithoutExtension = null)
        : base(basePath, fileNameWithoutExtension) { }
    }

    public class FileUploadStoreTests
    {
        const string UploadFile = "test.txt";
        const string FileWithoutExtension = "NO-EXTENSION";
        static readonly Uri BasePath = new Uri(@"\\UNC-path\");

        TestFileUploadStore _testStore;
        Mock<HttpPostedFileBase> _httpPostedFileBase;

        public FileUploadStoreTests()
        {
            _testStore = new TestFileUploadStore(BasePath, FileWithoutExtension);
            _httpPostedFileBase = new Mock<HttpPostedFileBase>();
            _httpPostedFileBase.Setup(x => x.FileName).Returns(UploadFile);
            _httpPostedFileBase.Setup(x => x.ContentLength).Returns(100);
        }

        [Fact]
        public void Save_NullParameter_ReturnsFalse()
        {
            Assert.False(_testStore.Save(null));
            _httpPostedFileBase.Verify(x => x.SaveAs(It.IsAny<string>()), Times.Never());
        }

        [Fact]
        public void Save_ZeroContentLength_ReturnsFalse()
        {
            _httpPostedFileBase.Setup(x => x.ContentLength).Returns(0);

            Assert.False(_testStore.Save(_httpPostedFileBase.Object));
            _httpPostedFileBase.Verify(x => x.SaveAs(It.IsAny<string>()), Times.Never());
        }

        [Fact]
        public void Save_NullFileNameWithoutExtension_ReturnsTrue()
        {
            _testStore = new TestFileUploadStore(BasePath);

            Assert.True(_testStore.Save(_httpPostedFileBase.Object));
            _httpPostedFileBase.Verify(
                x => x.SaveAs(It.Is<string>(y => y.EndsWith(UploadFile))),
                Times.Once()
            );
        }

        [Fact]
        public void Save_FileNameWithoutExtension_ReturnsTrue()
        {
            var expectedName = string.Format(
                "{0}{1}", 
                FileWithoutExtension,
                Path.GetExtension(UploadFile)
            );

            Assert.True(_testStore.Save(_httpPostedFileBase.Object));
            _httpPostedFileBase.Verify(
                x => x.SaveAs(It.Is<string>(y => y.EndsWith(expectedName))), 
                Times.Once()
            );
        }
    }
}