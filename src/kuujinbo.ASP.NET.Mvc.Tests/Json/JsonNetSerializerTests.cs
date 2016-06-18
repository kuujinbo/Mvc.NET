﻿using System;
using System.Linq;
using kuujinbo.ASP.NET.Mvc.Json;
using Xunit;

namespace kuujinbo.ASP.NET.Mvc.Tests.Json
{
    public class JsonNetSerializerTests
    {
        private JsonNetSerializer _jsonNetSerializer;
        private DateTime _date;

        public JsonNetSerializerTests()
        {
            _jsonNetSerializer = new JsonNetSerializer();
            _date = DateTime.Now;
        }

        [Fact]
        public void Get_WithNullObject_ThrowsArgumentNullException()
        {
            var exception = Assert.Throws<ArgumentNullException>(
                () => _jsonNetSerializer.Get(null)
            );

            Assert.Equal<string>("value", exception.ParamName);
        }

        [Fact]
        public void Get_WithBadDateFormat_ThrowsFormatException()
        {
            var exception = Assert.Throws<FormatException>(
                () => _jsonNetSerializer.Get("", "invalid date format")
            );

            Assert.Equal<string>(
                JsonNetSerializer.BAD_DATE_FORMAT, exception.Message
            );
        }

        [Fact]
        public void Get_WithSingleParameter_ReturnsCorrectDateToString()
        {
            var _date = DateTime.Now;

            var json = _jsonNetSerializer.Get(_date);
            var dateParts = json.Trim(new char[] { '"' })
                .Split(new char[] { '/' }, StringSplitOptions.None)
                .Select(x => Int32.Parse(x))
                .ToArray();

            Assert.Equal(3, dateParts.Length);
            Assert.Equal(_date.Month, dateParts[0]);
            Assert.Equal(_date.Day, dateParts[1]);
            Assert.Equal(_date.Year, dateParts[2]);
        }

        [Fact]
        public void Get_WithStringEmptyDateFormat_ReturnsCorrectDateToString()
        {
            var dateParts = GetDatePartsFromJsonWithDefaultDateFormat(
                _jsonNetSerializer.Get(_date, string.Empty)
            );

            Assert.Equal(3, dateParts.Length);
            Assert.Equal(_date.Month, dateParts[0]);
            Assert.Equal(_date.Day, dateParts[1]);
            Assert.Equal(_date.Year, dateParts[2]);
        }

        [Fact]
        public void Get_WithAllWhiteSpaceDateFormat_ReturnsCorrectDateToString()
        {
            var dateParts = GetDatePartsFromJsonWithDefaultDateFormat(
                _jsonNetSerializer.Get(_date, "     ")
            );

            Assert.Equal(3, dateParts.Length);
            Assert.Equal(_date.Month, dateParts[0]);
            Assert.Equal(_date.Day, dateParts[1]);
            Assert.Equal(_date.Year, dateParts[2]);
        }

        // or any valid DateTime format...
        [Fact]
        public void Get_WithDateTimeIsoFormat_ReturnsCorrectDateToString()
        {
            var json = _jsonNetSerializer.Get(_date, "yyyy-MM-dd");
            var dateParts = json.Trim(new char[] { '"' })
                .Split(new char[] { '-' }, StringSplitOptions.None)
                .Select(x => Int32.Parse(x))
                .ToArray();

            Assert.Equal(3, dateParts.Length);
            Assert.Equal(_date.Year, dateParts[0]);
            Assert.Equal(_date.Month, dateParts[1]);
            Assert.Equal(_date.Day, dateParts[2]);
        }

        private int[] GetDatePartsFromJsonWithDefaultDateFormat(string json)
        {
            return json.Trim(new char[] { '"' })
                .Split(new char[] { '/' }, StringSplitOptions.None)
                .Select(x => Int32.Parse(x))
                .ToArray();
        }

        public class TestClass 
        {
            public string Name { get; set; }
            public TestEnum TestEnum { get; set; }
        }
        public enum TestEnum { TestEnum }

        [Fact]
        public void SimpleEnumConverter_WriteJsonNull_WritesNullString()
        {
            Assert.Equal<string>(
                "\"Test Enum\"", _jsonNetSerializer.Get(TestEnum.TestEnum)
            );
        }
    }
}