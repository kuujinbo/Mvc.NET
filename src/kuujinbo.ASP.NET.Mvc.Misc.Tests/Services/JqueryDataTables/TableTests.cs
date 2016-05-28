﻿using System;
using System.Collections.Generic;
using System.Linq;
using kuujinbo.ASP.NET.Mvc.Misc.Services.JqueryDataTables;
using Xunit;

namespace kuujinbo.ASP.NET.Mvc.Misc.Tests.Services.JqueryDataTables
{
    /* --------------------------------------------------------------------
     * test model
     * --------------------------------------------------------------------
     */
    public class TestModel : IIdentifiable
    {
        public TestModel()
        {
            Hobbies = new List<TestHobby>();
        }

        public int Id { get; set; }
        
        [DataTableColumn(DisplayOrder = 1)]
        public string Name { get; set; }
        
        [DataTableColumn(DisplayOrder = 2)]
        public string Office { get; set; }
        
        [DataTableColumn(DisplayOrder = 3, DisplayName = "Start Date")]
        public DateTime? StartDate { get; set; }

        [DataTableColumn(DisplayOrder = 4, FieldAccessor = "Amount")]
        public TestSalary Salary { get; set; }

        [DataTableColumn(DisplayOrder = 5, FieldAccessor = "Name")]
        public ICollection<TestHobby> Hobbies { get; set; }
    }
    public class TestSalary
    {
        public int Amount { get; set; }
    }
    public class TestHobby
    {
        public string Name { get; set; }
    }

    /* --------------------------------------------------------------------
     * model data and DataTableColumnAttribute
     * --------------------------------------------------------------------
     */
    public class TableTests
    {
        Table _table;
        IEnumerable<TestModel> _modelData;
        public TableTests()
        {
            _modelData = new List<TestModel>() { SATO, RAMOS, GREER };
        }

        public static readonly TestModel SATO = new TestModel
        {
            Id = 1,
            Name = "Satou, Airi",
            Office = "Tokyo",
            StartDate = new DateTime(2008, 11, 28),
            Salary = new TestSalary() { Amount = 80000 },
            Hobbies = new List<TestHobby>() 
            { 
                new TestHobby() { Name = "1"}, new TestHobby() { Name = "2"}
            }
        };
        public static readonly TestModel RAMOS = new TestModel
        {
            Id = 25,
            Name = "Ramos, Angelica",
            Office = "London",
            StartDate = new DateTime(2010, 1, 1),
            Salary = new TestSalary() { Amount = 70000 },
            Hobbies = new List<TestHobby>() 
            { 
                new TestHobby() { Name = "3"}, new TestHobby() { Name = "4"}
            }
        };
        public static readonly TestModel GREER = new TestModel
        {
            Id = 20,
            Name = "Greer, Bradley",
            Office = "London",
            Salary = new TestSalary() { Amount = 50000 },
            Hobbies = new List<TestHobby>() 
            { 
                new TestHobby() { Name = "5"}
            }
        };

        /// <summary>
        /// act and assert for current [Fact]
        /// </summary>
        /// <param name="entities">
        /// entity collection in **EXPECTED** order 
        /// </param>
        /// <remarks>perform arrange in **CURRENT** [Fact]</remarks>
        private void ActAndAssert(params TestModel[] entities)
        {
            // arrange
            int entityCount = entities.Length;
            var totalRecords = _modelData.Count();

            // act
            dynamic result = _table.GetData<TestModel>(_modelData);

            // assert
            for (int i = 0; i < entityCount; ++i)
            {
                Assert.Equal(totalRecords, result.recordsTotal);
                // recordsFiltered != recordsTotal when searching
                Assert.Equal(entityCount, result.recordsFiltered);

                Assert.IsType<List<List<object>>>(result.data);

                Assert.Equal(entities[i].Id, result.data[i][0]);
                Assert.Equal(entities[i].Name, result.data[i][1]);
                Assert.Equal(entities[i].Office, result.data[i][2]);
                Assert.Equal(entities[i].StartDate, result.data[i][3]);
                Assert.Equal(entities[i].Salary.Amount, result.data[i][4]);
                Assert.Equal(
                    string.Join(", ", entities[i].Hobbies.Select(x => x.Name)),
                    result.data[i][5]
                );
            }
        }

        [Fact]
        public void SetColumns_WhenCalled_AddsColumnsToTable()
        {
            _table = new Table();

            _table.SetColumns<TestModel>();

            Assert.Equal(5, _table.Columns.Count());
            Assert.Equal("Name", _table.Columns.ElementAt(0).Name);
            Assert.Equal("Office", _table.Columns.ElementAt(1).Name);
            Assert.Equal("Start Date", _table.Columns.ElementAt(2).Name);
            Assert.Equal("Salary", _table.Columns.ElementAt(3).Name);
            Assert.Equal("Hobbies", _table.Columns.ElementAt(4).Name);
        }

        // no sort or search criteria
        [Fact]
        public void GetData_DefaultCall_ReturnsModelWithSpecifiedProperties()
        {
            _table = new Table()
            {
                Draw = 1,
                Start = 0,
                Length = 10,
                SortOrders = new List<SortOrder>()
            };
            _table.SetColumns<TestModel>();

            ActAndAssert(SATO, RAMOS, GREER);
        }

        [Fact]
        public void GetData_SortCriteriaNoSearchCriteria_ReturnsAscendingSort()
        {
            _table = new Table()
            {
                Draw = 1,
                Start = 0,
                Length = 10,
                SortOrders = new List<SortOrder>() 
                { 
                    // sort ascending => 'Name' property
                    new SortOrder { ColumnIndex = 0, Direction = DataTableModelBinder.ORDER_ASC } 
                }
            };
            _table.SetColumns<TestModel>();

            ActAndAssert(GREER, RAMOS, SATO);
        }

        [Fact]
        public void GetData_SortNonAscCriteriaNoSearchCriteria_ReturnsDescendingSort()
        {
            _table = new Table()
            {
                Draw = 1,
                Start = 0,
                Length = 10,
                SortOrders = new List<SortOrder>() 
                { 
                    // sort ascending => 'Name' property
                    // anything other than DataTableModelBinder.ORDER_ASC is descnding 
                    new SortOrder { ColumnIndex = 0, Direction = "anything other than 'asc'" } 
                }
            };
            _table.SetColumns<TestModel>();

            ActAndAssert(SATO, RAMOS, GREER);
        }

        [Fact]
        public void GetData_SearchNullOrEmptyCriteria_IgnoresSearchAndReturnsAllData()
        {
            _table = new Table()
            {
                Draw = 1,
                Start = 0,
                Length = 10,
                SortOrders = new List<SortOrder>()
            };
            _table.SetColumns<TestModel>();
            _table.Columns.ElementAt(1).Search = new Search() { Value = "  ", ColumnIndex = 1 };
            _table.Columns.ElementAt(2).Search = new Search() {ColumnIndex = 2};

            ActAndAssert(SATO, RAMOS, GREER);
        }

        [Fact]
        public void GetData_SearchCriteriaNoSortCriteria_ReturnsSearchMatchInOriginalOrder()
        {
            _table = new Table()
            {
                Draw = 1,
                Start = 0,
                Length = 10,
                SortOrders = new List<SortOrder>()
            };
            _table.SetColumns<TestModel>();
            // search 'Name' property => case-insensitive
            _table.Columns.ElementAt(0).Search = new Search() { Value = "g", ColumnIndex = 0 };

            ActAndAssert(RAMOS, GREER);
        }

        [Fact]
        public void GetData_SortAndSearchCriteria_ReturnsSearchMatchInRequestedOrder()
        {
            _table = new Table()
            {
                Draw = 1,
                Start = 0,
                Length = 10,
                SortOrders = new List<SortOrder>() 
                { 
                    // sort ascending => 'StartDate' property
                    new SortOrder { ColumnIndex = 2, Direction = DataTableModelBinder.ORDER_ASC },
                    /*
                     * sort descending => 'Name' property, which should be
                     * ignored, since 'StartDate' is evaluated first
                     */
                    new SortOrder { ColumnIndex = 0, Direction = "other" },
                }
            };
            _table.SetColumns<TestModel>();
            // search 'Office' property => case-insensitive
            _table.Columns.ElementAt(1).Search = new Search() { Value = "lon", ColumnIndex = 1 };

            ActAndAssert(GREER, RAMOS);
        }
    }
}