# Implement Your Own Business Logic

## Establish Requirements

Below we will give an example to implement the User functionality.

## Database

First, let's determine the fields needed for the table.

### Database Design

| Table Name           | Table Comment |
| -------------------- | ------------- |
| `Senparc_Admin_User` | User          |

### Senparc_Admin_User (User Table)

| Field Name       | Data Type | Comment                    | Type Length | Detailed Comment |
| ---------------- | --------- | -------------------------- | ----------- | ---------------- |
| `Id`             | int       | Primary Key Id             | -           |
| `Flag`           | bool      | Flag                       | -           |
| `AddTime`        | DateTime  | Add Time                   | -           |
| `LastUpdateTime` | DateTime  | Last Update Time           | -           |
| `AdminRemark`    | string    | Admin Remark               | 50          |
| `Remark`         | string    | Remark                     | 50          |
| `UnionId`        | string    | WeChat UnionId             | 50          |
| `WxOpenId`       | string    | WeChat OpenId              | 50          |
| `WxNickName`     | string    | WeChat Nickname            | 100         |
| `Thumb`          | string    | Avatar                     | 200         |
| `Gender`         | int       | Gender (1-Male; 2-Female;) | -           |
| `Country`        | string    | Country                    | 100         |
| `Province`       | string    | Province                   | 100         |
| `City`           | string    | City                       | 100         |

## Create Model

In the custom path of the Xncf Module

Create \Models\DatabaseModel\User.cs

The source code is as follows:

```csharp
using Senparc.Ncf.Core.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

using Senparc.Xncf.Admin.Models.DatabaseModel.Dto;

namespace Senparc.Xncf.Admin.Models.DatabaseModel
{
    /// <summary>
    /// User entity class
    /// </summary>
    [Table(Register.DATABASE_PREFIX + nameof(User))]//Must add prefix to prevent conflicts in the entire system
    [Serializable]
    public class User : EntityBase<string>
    {
        public User()
        {
            Id = Guid.NewGuid().ToString();
            AddTime = DateTime.Now;
            this.LastUpdateTime = AddTime;
        }

        public User(UserDto userDto) : this()
        {
            LastUpdateTime = userDto.LastUpdateTime;
            UnionId = userDto.UnionId;
            WxOpenId = userDto.WxOpenId;
            WxNickName = userDto.WxNickName;
            Thumb = userDto.Thumb;
            Gender = userDto.Gender;
            Country = userDto.Country;
            Province = userDto.Province;
            City = userDto.City;
        }

        public void Update(UserDto userDto)
        {
            LastUpdateTime = userDto.LastUpdateTime;
            UnionId = userDto.UnionId;
            WxOpenId = userDto.WxOpenId;
            WxNickName = userDto.WxNickName;
            Thumb = userDto.Thumb;
            Gender = userDto.Gender;
            Country = userDto.Country;
            Province = userDto.Province;
            City = userDto.City;
        }

        /// <summary>
        /// WeChat UnionId
        /// </summary>
        [MaxLength(50)]
        public string UnionId { get; set; }

        /// <summary>
        /// WeChat OpenId
        /// </summary>
        [MaxLength(50)]
        public string WxOpenId { get; set; }

        /// <summary>
        /// WeChat Nickname
        /// </summary>
        [MaxLength(100)]
        public string WxNickName { get; set; }

        /// <summary>
        /// Avatar
        /// </summary>
        [MaxLength(200)]
        public string Thumb { get; set; }

        /// <summary>
        /// Gender (1-Male; 2-Female;)
        /// </summary>
        public int Gender { get; set; }

        /// <summary>
        /// Country
        /// </summary>
        [MaxLength(100)]
        public string Country { get; set; }

        /// <summary>
        /// Province
        /// </summary>
        [MaxLength(100)]
        public string Province { get; set; }

        /// <summary>
        /// City
        /// </summary>
        [MaxLength(100)]
        public string City { get; set; }

    }
}
```

创建 \Models\DatabaseModel\Dto\UserDto.cs

源码如下：

```csharp
using Senparc.Ncf.Core.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Senparc.Xncf.Admin.Models.DatabaseModel.Dto
{
    public class UserDto : DtoBase
    {
        public UserDto()
        {
        }

        public UserDto(string id, string unionId, string wxOpenId, string wxNickName, string thumb, int gender, string country, string province, string city)
        {
            Id = id;
            UnionId = unionId;
            WxOpenId = wxOpenId;
            WxNickName = wxNickName;
            Thumb = thumb;
            Gender = gender;
            Country = country;
            Province = province;
            City = city;
        }

        public string Id { get; set; }

        /// <summary>
        /// WeChat UnionId
        /// </summary>
        [MaxLength(50)]
        public string UnionId { get; set; }

        /// <summary>
        /// WeChat OpenId
        /// </summary>
        [MaxLength(50)]
        public string WxOpenId { get; set; }

        /// <summary>
        /// WeChat Nickname
        /// </summary>
        [MaxLength(100)]
        public string WxNickName { get; set; }

        /// <summary>
        /// Avatar
        /// </summary>
        [MaxLength(200)]
        public string Thumb { get; set; }

        /// <summary>
        /// Gender (1-Male; 2-Female;)
        /// </summary>
        public int Gender { get; set; }

        /// <summary>
        /// Country
        /// </summary>
        [MaxLength(100)]
        public string Country { get; set; }

        /// <summary>
        /// Province
        /// </summary>
        [MaxLength(100)]
        public string Province { get; set; }

        /// <summary>
        /// City
        /// </summary>
        [MaxLength(100)]
        public string City { get; set; }

    }
}
```

创建 \Models\DatabaseModel\Mapping\Admin_UserConfigurationMapping.cs
创建 \Models\DatabaseModel\Mapping\Admin_UserConfigurationMapping.cs

源码如下：

```csharp
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Senparc.Ncf.Core.Models.DataBaseModel;
using Senparc.Ncf.XncfBase.Attributes;
using Senparc.Xncf.Admin.Models.DatabaseModel;
namespace Senparc.Xncf.Admin.Models
{
    [XncfAutoConfigurationMapping]
    public class Admin_UserConfigurationMapping : ConfigurationMappingWithIdBase<User, string>
    {
        public override void Configure(EntityTypeBuilder<User> builder)
        {
            // do something
        }
    }
}
```

修改 \Models\DatabaseModel\AdminSenparcEntities.cs

```csharp
using Microsoft.EntityFrameworkCore;
using Senparc.Ncf.Database;
using Senparc.Ncf.Core.Models;
using Senparc.Ncf.XncfBase.Database;

namespace Senparc.Xncf.Admin.Models.DatabaseModel
{
    public class AdminSenparcEntities : XncfDatabaseDbContext
    {
        public AdminSenparcEntities(DbContextOptions dbContextOptions) : base(dbContextOptions)
        {
        }


        //DOT REMOVE OR MODIFY THIS LINE 请勿移除或修改本行 - Entities Point
        //ex. public DbSet<Color> Colors { get; set; }

        public DbSet<User> Users { get; set; }

        //如无特殊需需要，OnModelCreating 方法可以不用写，已经在 Register 中要求注册
        //protected override void OnModelCreating(ModelBuilder modelBuilder)
        //{
        //}
    }
}

```

## Web Page Section

The web page section in the module is located at

<img src="./images/xncf-module-area1.png" />

The page layout can be customized according to your actual needs.

### html

index.cshtml source code:

```razor
@page
@model Senparc.Xncf.Admin.Areas.Admin.Pages.User.IndexModel
@{
    ViewData["Title"] = "User Page";
    Layout = "_Layout_Vue";
}

@section Style{
    <link href="~/css/Admin/User/User.css" rel="stylesheet" />
}

@section breadcrumbs {
    <el-breadcrumb-item>Extension Module</el-breadcrumb-item>
    <el-breadcrumb-item>User Management</el-breadcrumb-item>
    <el-breadcrumb-item>User List</el-breadcrumb-item>
}

<div>
    <div class="admin-role">
        <el-row class="filter-condition" :gutter="18">
            <el-col :span="4"><el-input v-model="keyword" placeholder="Please enter keyword"></el-input></el-col>
            <el-col :span="6">
                <el-button type="primary" @@click="handleSearch()">Search</el-button>
                <el-button type="primary" @@click="resetCondition()">Reset</el-button>
            </el-col>
        </el-row>
        <div class="filter-container">
            <el-button class="filter-item" size="mini" type="primary" icon="el-icon-plus" @@click="handleEdit('', '', 'add')">Add</el-button>
        </div>
        <el-table :data="tableData"
                  style="width: 100%;margin-bottom: 20px;"
                  row-key="id"
                  border
                  ref="multipleTable"
                  @@selection-change="handleSelectionChange">
            <el-table-column label="No." width="65">
                <template scope="scope">
                    <el-radio :label="scope.$index" v-model="radio" @@change.native="getCurrentRow(scope.row)"></el-radio>
                </template>
            </el-table-column>

            <el-table-column prop="unionId" align="left" label="WeChat UnionId"></el-table-column>
            <el-table-column prop="wxOpenId" align="left" label="WeChat OpenId"></el-table-column>
            <el-table-column prop="wxNickName" align="left" label="WeChat Nickname"></el-table-column>
            <el-table-column prop="thumb" align="center" label="Avatar">
                <template slot-scope="scope">
                    <a :href="scope.row.thumb ? scope.row.thumb : 'demo.png'" target="_blank">
                        <img :src="scope.row.thumb ? scope.row.thumb : 'demo.png'">
                    </a>
                </template>
            </el-table-column>
            <el-table-column prop="gender" align="left" label="Gender"></el-table-column>
            <el-table-column prop="country" align="left" label="Country"></el-table-column>
            <el-table-column prop="province" align="left" label="Province"></el-table-column>
            <el-table-column prop="city" align="left" label="City"></el-table-column>
            <el-table-column align="center"
                             label="Add Time">
                <template slot-scope="scope">
                    {{formaTableTime(scope.row.addTime)}}
                </template>
            </el-table-column>
            <el-table-column label="Actions" align="center" fixed="right" width="150">
                <template slot-scope="scope">
                    <el-button size="mini"
                               type="primary"
                               @@click="handleEdit(scope.$index, scope.row,'edit')">Edit</el-button>
                    <el-popconfirm placement="top" title="Are you sure to delete this user?" @@on-confirm="handleDelete(scope.$index, scope.row)">
                        <el-button size="mini" type="danger" slot="reference">Delete</el-button>
                    </el-popconfirm>
                </template>
            </el-table-column>
        </el-table>

        <pagination :total="paginationQuery.total"
                    :page.sync="listQuery.pageIndex"
                    :limit.sync="listQuery.pageSize"
                    @@pagination="getList"></pagination>
        <!-- Edit, Add -->
        <el-dialog :title="dialog.title"
                   :visible.sync="dialog.visible"
                   :close-on-click-modal="false"
                   width="700px">
            <el-form ref="dataForm"
                     :rules="dialog.rules"
                     :model="dialog.data"
                     :disabled="dialog.disabled"
                     label-position="left"
                     label-width="100px"
                     style="max-width: 200px; margin-left:50px;">
                <el-form-item label="WeChat UnionId" prop="unionId">
                    <el-input v-model="dialog.data.unionId" clearable placeholder="Please enter WeChat UnionId" />
                </el-form-item>

                <el-form-item label="WeChat OpenId" prop="wxOpenId">
                    <el-input v-model="dialog.data.wxOpenId" clearable placeholder="Please enter WeChat OpenId" />
                </el-form-item>

                <el-form-item label="WeChat Nickname" prop="wxNickName">
                    <el-input v-model="dialog.data.wxNickName" clearable placeholder="Please enter WeChat Nickname" />
                </el-form-item>

                <el-form-item label="Avatar">
                    <el-upload action="@Model.UpFileUrl"
                               list-type="picture-card"
                               show-file-list="true"
                               accept="image/png, image/jpeg"
                               :on-success="uploadSuccess"
                               :on-error="uploadError"
                               :on-preview="handlePictureCardPreview"
                               :on-remove="handleRemove">
                        <i class="el-icon-plus"></i>
                        <div class="el-upload__tip" slot="tip">Cannot exceed 100MB</div>
                    </el-upload>
                    <img width="100%" :src="dialogImageUrl" alt="">
                    <el-input class="hidden" v-model="dialog.data.thumb" clearable placeholder="Avatar" />
                </el-form-item>
                <el-form-item label="Gender">
                    <el-input v-model="dialog.data.gender" clearable placeholder="Please enter gender" />
                </el-form-item>

                <el-form-item label="Country" prop="country">
                    <el-input v-model="dialog.data.country" clearable placeholder="Please enter country" />
                </el-form-item>

                <el-form-item label="Province" prop="province">
                    <el-input v-model="dialog.data.province" clearable placeholder="Please enter province" />
                </el-form-item>

                <el-form-item label="City" prop="city">
                    <el-input v-model="dialog.data.city" clearable placeholder="Please enter city" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @@click="dialog.visible=false">Cancel</el-button>
                <el-button :loading="dialog.updateLoading" :disabled="dialog.disabled" type="primary" @@click="updateData">Confirm</el-button>
            </div>
        </el-dialog>
    </div>
</div>
@section scripts
{
    <script src="~/js/Admin/Pages/User/user.js"></script>
}
```

index.cshtml.cs 源码

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Senparc.Ncf.Service;
using Microsoft.Extensions.DependencyInjection;
using Senparc.Ncf.Core.Models;
using Senparc.CO2NET.Trace;
using Senparc.Ncf.Utility;
using Senparc.Xncf.Admin.Models.DatabaseModel.Dto;
using Senparc.Xncf.Admin.Services;

namespace Senparc.Xncf.Admin.Areas.Admin.Pages.User
{
    public class IndexModel : Senparc.Ncf.AreaBase.Admin.AdminXncfModulePageModelBase
    {
        private readonly UserService _userService;
        private readonly IServiceProvider _serviceProvider;
        public UserDto userDto { get; set; }
        public string Token { get; set; }
        public string UpFileUrl { get; set; }
        public string BaseUrl { get; set; }

        public IndexModel(Lazy<XncfModuleService> xncfModuleService, UserService userService, IServiceProvider serviceProvider) : base(xncfModuleService)
        {
            CurrentMenu = "User";
            this._userService = userService;
            this._serviceProvider = serviceProvider;
        }

        [BindProperty(SupportsGet = true)]
        public int PageIndex { get; set; } = 1;
        public PagedList<Models.DatabaseModel.User> User { get; set; }

        public Task OnGetAsync()
        {
            BaseUrl = $"{Request.Scheme}://{Request.Host.Value}";
            UpFileUrl = $"{BaseUrl}/api/v1/common/upload";
            return Task.CompletedTask;
        }

        public async Task<IActionResult> OnGetUserAsync(string keyword, string orderField, int pageIndex, int pageSize)
        {
            var seh = new SenparcExpressionHelper<Models.DatabaseModel.User>();
            seh.ValueCompare.AndAlso(!string.IsNullOrEmpty(keyword), _ => _.WxNickName.Contains(keyword));
            var where = seh.BuildWhereExpression();
            var response = await _userService.GetObjectListAsync(pageIndex, pageSize, where, orderField);
            return Ok(new
            {
                response.TotalCount,
                response.PageIndex,
                List = response.Select(_ => new
                {
                    _.Id,
                    _.LastUpdateTime,
                    _.Remark,
                    _.UnionId,
                    _.WxOpenId,
                    _.WxNickName,
                    _.Thumb,
                    _.Gender,
                    _.Country,
                    _.Province,
                    _.City,
                    _.AddTime
                })
            });
        }
    }
}
```

Edit.cshtml源码

```razor
@page
@model Senparc.Xncf.Admin.Areas.Admin.Pages.User.EditModel
@{
    ViewData["Title"] = $"{ (!string.IsNullOrEmpty(Model.Id.ToString()) ? "Edit" : "Add")} User";
}
```

Edit.cshtml.cs 源码

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Senparc.Ncf.Service;
using Senparc.CO2NET.Trace;
using Senparc.CO2NET.Extensions;
using Senparc.Xncf.Admin.Models.DatabaseModel.Dto;
using Senparc.Xncf.Admin.Services;

namespace Senparc.Xncf.Admin.Areas.Admin.Pages.User
{
    public class EditModel : Senparc.Ncf.AreaBase.Admin.AdminXncfModulePageModelBase
    {
        private readonly UserService _userService;
        public EditModel(UserService userService, Lazy<XncfModuleService> xncfModuleService) : base(xncfModuleService)
        {
            CurrentMenu = "User";
            _userService = userService;
        }

        [BindProperty(SupportsGet = true)]
        public string Id { get; set; }
        public UserDto UserDto { get; set; }

        /// <summary>
        /// Handler=Save
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> OnPostSaveAsync([FromBody] UserDto userDto)
        {
            if (userDto == null)
            {
                return Ok(false);
            }
            await _userService.CreateOrUpdateAsync(userDto);
            return Ok(true);
        }

        public async Task<IActionResult> OnPostDeleteAsync([FromBody] string[] ids)
        {
            var entity = await _userService.GetFullListAsync(_ => ids.Contains(_.Id));
            await _userService.DeleteAllAsync(entity);
            IEnumerable<string> unDeleteIds = ids.Except(entity.Select(_ => _.Id));
            return Ok(unDeleteIds);
        }
    }
}

```

### style

创建 \wwwroot\css\Admin\User\User.css

源码如下：

```css
.el-dialog .el-form-item .el-input,
.el-dialog .el-form-item .el-textarea {
  width: 30rem;
}

.el-form-item__content {
  width: 30rem;
}

.filter-condition {
  margin-bottom: 1rem;
}

.hidden {
  display: none;
}

.col-thumb img {
  width: 6rem;
  height: 4rem;
}

.col-file video {
  width: 8rem;
  height: 5rem;
}

.col-file audio {
  width: 10rem;
  height: 5rem;
}

.item .item-left {
  text-align: right;
  padding-right: 1rem;
  background: #909399;
  color: #fff;
  height: 2rem;
  line-height: 2rem;
}

.item .item-right {
  text-align: left;
  padding-left: 1rem;
  /*background: #909399;*/
  border: 1px solid #909399;
  color: #000;
  height: 2rem;
  line-height: 2rem;
}

.item-right img,
.item-right video {
  width: 15rem;
  -webkit-filter: drop-shadow(
    10px 10px 10px rgba(0, 0, 0, 0.5)
  ); /*考虑浏览器兼容性：兼容 Chrome, Safari, Opera */
  filter: drop-shadow(10px 10px 10px rgba(0, 0, 0, 0.5));
}

.el-row {
  padding-bottom: 1rem;
}

.el-form-item {
  margin-bottom: 5px;
}
```

### javascript

创建 \wwwroot\js\Admin\Pages\User\user.js

源码如下:

```js
new Vue({
  el: '#app',
  data() {
    var validateCode = (rule, value, callback) => {
      callback()
    }
    return {
      defaultMSG: null,
      editorData: '',
      form: {
        content: '',
      },
      config: {
        initialFrameHeight: 500,
      },
      //分页参数
      paginationQuery: {
        total: 5,
      },
      //分页接口传参
      listQuery: {
        pageIndex: 1,
        pageSize: 20,
        keyword: '',
        orderField: '',
      },
      keyword: '',
      multipleSelection: '',
      radio: '',
      props: { multiple: true },
      // 表格数据
      tableData: [],
      uid: '',
      fileList: [],
      dialogImageUrl: '',
      dialogVisible: false,
      dialog: {
        title: '新增用户',
        visible: false,
        data: {
          id: '',
          unionId: '',
          wxOpenId: '',
          wxNickName: '',
          thumb: '',
          gender: 0,
          country: '',
          province: '',
          city: '',
        },
        rules: {
          name: [
            { required: true, message: '用户名称为必填项', trigger: 'blur' },
          ],
        },
        updateLoading: false,
        disabled: false,
        checkStrictly: true, // 是否严格的遵守父子节点不互相关联
      },
    }
  },
  created: function () {
    let that = this
    that.getList()
  },
  watch: {
    'dialog.visible': function (val, old) {
      // 关闭dialog，清空
      if (!val) {
        this.dialog.data = {
          id: '',
          unionId: '',
          wxOpenId: '',
          wxNickName: '',
          thumb: '',
          gender: 0,
          country: '',
          province: '',
          city: '',
        }
        this.dialog.updateLoading = false
        this.dialog.disabled = false
      }
    },
  },
  methods: {
    handleChange(value) {
      console.log(value)
    },
    handleRemove(file, fileList) {
      log(file, fileList, 2)
    },
    handlePictureCardPreview(file) {
      let that = this
      that.dialogImageUrl = file.url
      that.dialogVisible = true
    },
    uploadSuccess(res, file, fileList) {
      let that = this
      that.fileList = fileList
      if (res.code == 200) {
        that.$notify({
          title: '成功',
          message: '恭喜你，上传成功',
          type: 'success',
        })
        that.dialog.data.cover = res.data
      } else {
        that.$notify.error({
          title: '失败',
          message: '上传失败，请重新上传',
        })
      }
    },
    uploadError() {
      let that = this
      that.$notify.error({
        title: '失败',
        message: '上传失败，请重新上传',
      })
    },
    // 获取列表
    async getList() {
      let that = this
      let { pageIndex, pageSize, keyword, orderField } = that.listQuery
      if (orderField == '' || orderField == undefined) {
        orderField = 'AddTime Desc'
      }
      if (that.keyword != '' && that.keyword != undefined) {
        keyword = that.keyword
      }

      await service
        .get(
          `/Admin/User/Index?handler=User&pageIndex=${pageIndex}&pageSize=${pageSize}&keyword=${keyword}&orderField=${orderField}`,
        )
        .then((res) => {
          that.tableData = res.data.data.list
          that.paginationQuery.total = res.data.data.totalCount
        })
    },
    // 编辑 // 新增用户 // 增加下一级
    handleEdit(index, row, flag) {
      let that = this
      that.dialog.visible = true
      if (flag === 'add') {
        // 新增
        that.dialog.title = '新增用户'
        that.dialogImageUrl = ''
        return
      }
      // 编辑
      let {
        id,
        unionId,
        wxOpenId,
        wxNickName,
        thumb,
        gender,
        country,
        province,
        city,
      } = row
      that.dialog.data = {
        id,
        unionId,
        wxOpenId,
        wxNickName,
        thumb,
        gender,
        country,
        province,
        city,
      }
      if (flag === 'edit') {
        that.dialog.title = '编辑用户'
      }
    },
    // 设置父级菜单默认显示 递归
    recursionFunc(row, source, dest) {
      if (row.categoryId === null) {
        return
      }
      for (let i in source) {
        let ele = source[i]
        if (row.categoryId === ele.id) {
          this.recursionFunc(ele, this.categoryData, dest)
          dest.push(ele.id)
        } else {
          this.recursionFunc(row, ele.children, dest)
        }
      }
    },
    // 更新新增、编辑
    updateData() {
      let that = this
      that.dialog.updateLoading = true
      that.$refs['dataForm'].validate((valid) => {
        // 表单校验
        if (valid) {
          that.dialog.updateLoading = true
          let data = {
            Id: that.dialog.data.id,
            UnionId: that.dialog.data.unionId,
            WxOpenId: that.dialog.data.wxOpenId,
            WxNickName: that.dialog.data.wxNickName,
            Thumb: that.dialog.data.thumb,
            Gender: that.dialog.data.gender,
            Country: that.dialog.data.country,
            Province: that.dialog.data.province,
            City: that.dialog.data.city,
          }
          service.post('/Admin/User/Edit?handler=Save', data).then((res) => {
            if (res.data.success) {
              that.getList()
              that.$notify({
                title: 'Success',
                message: '成功',
                type: 'success',
                duration: 2000,
              })
              that.dialog.visible = false
            }
          })
        }
      })
    },
    // 删除
    handleDelete(index, row) {
      let that = this
      let ids = [row.id]
      service.post('/Admin/User/edit?handler=Delete', ids).then((res) => {
        if (res.data.success) {
          that.getList()
          that.$notify({
            title: 'Success',
            message: '删除成功',
            type: 'success',
            duration: 2000,
          })
        }
      })
    },
    getCurrentRow(row) {
      let that = this
      that.multipleSelection = row
    },
    handleSearch() {
      let that = this
      that.getList()
    },
    resetCondition() {
      let that = this
      that.keyword = ''
    },
  },
})
```

## Permission Configuration

Modify \Register.Area.cs

Source code as follows:

```csharp
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Senparc.CO2NET.Trace;
using Senparc.Ncf.Core.Areas;
using Senparc.Ncf.Core.Config;
using System;
using Senparc.Ncf.XncfBase;
using System.Collections.Generic;
using System.IO;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Builder;
using Senparc.CO2NET.RegisterServices;
using Microsoft.Extensions.FileProviders;
using System.Reflection;

namespace Senparc.Xncf.Admin
{
	public partial class Register : IAreaRegister, //Register XNCF page interface (optional)
									IXncfRazorRuntimeCompilation  //Enable RazorPage runtime compilation
	{
		#region IAreaRegister Interface

		public string HomeUrl => "/Admin/Admin/Index";

		public List<AreaPageMenuItem> AareaPageMenuItems => new List<AreaPageMenuItem>() {
			 new AreaPageMenuItem(GetAreaHomeUrl(),"Home","fa fa-laptop"),
			 //Newly added menu
			 new AreaPageMenuItem(GetAreaUrl($"/Admin/User/Index"),"User","fa fa-bookmark-o"),
		};

		public IMvcBuilder AuthorizeConfig(IMvcBuilder builder, IHostEnvironment env)
		{
			builder.AddRazorPagesOptions(options =>
			{
				//Page permissions can be configured here
			});

			SenparcTrace.SendCustomLog("Admin Startup", "Completed Area:AllTheCode.Xncf.Admin Registration");

			return builder;
		}

        public override IApplicationBuilder UseXncfModule(IApplicationBuilder app, IRegisterService registerService)
        {
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new ManifestEmbeddedFileProvider(Assembly.GetExecutingAssembly(), "wwwroot")
            });

            return base.UseXncfModule(app, registerService);
        }

        #endregion

        #region IXncfRazorRuntimeCompilation Interface
        public string LibraryPath => Path.GetFullPath(Path.Combine(SiteConfig.WebRootPath, "..", "..", "Senparc.Xncf.Admin"));
		#endregion
	}
}
```

Using the above creation methods, you can complete any required functionality in the system.
