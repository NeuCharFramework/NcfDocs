# Xncf Module Development

NCF Base Library Official Nuget Package Source Code

## Xncf Single Function Execution Module Development

> 1. 创建一个新的 Dotnet Core Class Library 项目

![create_dotnet_core_class_library](./images/xncf_module/create_dotnet_core_class_library.png)

> 2. 输入 Class Library 的名称并点击创建

![Image text](./images/xncf_module/input_dotnet_core_class_library_name.png)

> 3. 创建 Register.cs

![Image text](./images/xncf_module/create_register_and_functions_folder.png)

> 4. 在 Register 中配置必要的内容

| Name        | Description                                                                         |
| ----------- | ----------------------------------------------------------------------------------- |
| Name        | 模块名称                                                                            |
| Uid         | 全局唯一标识符，最好使用工具生成                                                    |
| Version     | 模块版本号（用于识别更新）                                                          |
| MenuName    | 安装到 NCF 后在菜单中显示的名称                                                     |
| Icon        | 菜单旁边显示的图标 [Font Icons](https://colorlib.com/polygon/gentelella/icons.html) |
| Description | 模块描述，可以在安装前用于了解具体功能                                              |

![Image text](./images/xncf_module/register_content.png)

> 5. 创建自定义方法类

![Image text](./images/xncf_module/create_functions_class_library.png)

> 6. 完成自定义方法

    public MyFunction(IServiceProvider serviceProvider) : base(serviceProvider)
    {
    }

    public class Parameters : IFunctionParameter
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; }

        [Required]
        [Description("Number||Number1")]

[Description("Name||Parameter name before the double vertical line, parameter comment after the double vertical line")]
public int Number1 { get; set; }
[Required]
[Description("Number||Number2")]
public int Number2 { get; set; }
[Description("Operator||")]//Drop-down list
public SelectionList Operator { get; set; } = new SelectionList(SelectionType.DropDownList, new[] {
new SelectionItem("+","Addition","Number1 + Number2",false),
new SelectionItem("-","Subtraction","Number1 - Number2",true),
new SelectionItem("×","Multiplication","Number1 × Number2",false),
new SelectionItem("÷","Division","Number1 ÷ Number2",false)
[Description("Calculate Power||")]//Checkbox
public SelectionList Power { get; set; } = new SelectionList(SelectionType.CheckBoxList, new[] {
new SelectionItem("2","Square","Calculate the square after the above result",false),
new SelectionItem("3","Cube","Calculate the cube after the above result",false)
});
}

    public override string Name => "My Function";

    public override string Description => "Comment for my function";

    public override Type FunctionParameterType => typeof(Parameters);

    public override FunctionResult Run(IFunctionParameter param)
    {
        return FunctionHelper.RunFunction<Parameters>(param, (typeParam, sb, result) =>
        {
            /* This method will be called after clicking "Execute" on the page
                *
                * Parameter description:
                * param: IFunctionParameter type object
                * typeParam: Senparc.Xncf.Application.MyFunction.Parameters type object
                * sb: log
                * result: return result
                */

            double calcResult = typeParam.Number1;
            var theOperator = typeParam.Operator.SelectedValues.FirstOrDefault();
            {
            }

switch (theOperator)
case &quot;+&quot;:
calcResult = calcResult + typeParam.Number2;
break;
case &quot;-&quot;:
calcResult = calcResult - typeParam.Number2;
break;
case &quot;&#215;&quot;:
calcResult = calcResult \* typeParam.Number2;
break;
case &quot;&#247;&quot;:
if (typeParam.Number2 == 0)
{
result.Success = false;
result.Message = &quot;The divisor cannot be 0!&quot;;
return;
}
calcResult = calcResult / typeParam.Number2;
break;
default:
result.Success = false;
result.Message = $&quot;Unknown operator: {theOperator}&quot;;
                    return;
            sb.AppendLine($&quot;Performing calculation: {typeParam.Number1} {theOperator} {typeParam.Number2} = {calcResult}&quot;);

            Action&lt;int&gt; raisePower = power =&gt;
            {
                if (typeParam.Power.SelectedValues.Contains(power.ToString()))
                {
                    var oldValue = calcResult;
                    calcResult = Math.Pow(calcResult, power);
                    sb.AppendLine($&quot;Performing {power} power calculation: {oldValue}{(power == 2 ? &quot;&#178;&quot; : &quot;&#179;&quot;)} = {calcResult}&quot;);
                }
            };

            raisePower(2);
            raisePower(3);

            result.Message = $&quot;Calculation result: {calcResult}. Please see the log for the calculation process&quot;;
        });
    }

&gt; 7. Register the custom method class in Register

![Image text](./images/xncf_module/register_add_functions.png)

&gt; 8. Publish Nuget, detailed steps to publish Nuget

## Xncf Custom Page Function Module Development

&gt; 1. Create a new DotnetCore Class Library project and enter the project name

&gt; &gt; 1.1 Directory name as follows

    using System;

![Image text](./images/xncf_module/page_create_dotnet_core_class_library.png)
![Image text](./images/xncf_module/page_create_dotnet_core_class_library_input_name.png)
![Image text](./images/xncf_module/page_folder_struct.png)
&gt; &gt; 1.2 Set the project to support RazorPage functionality
![Image text](./images/xncf_module/page_project_support_razor.png)
&gt; 2. Create a new Color model class in Senparc.Xncf.ExtensionAreaTemplate
using Senparc.Ncf.Core.Models;
using Senparc.Xncf.ExtensionAreaTemplate.Models.DatabaseModel.Dto;
using System.ComponentModel.DataAnnotations.Schema;
namespace Senparc.Xncf.ExtensionAreaTemplate
{
/// &lt;summary&gt;
/// 颜色实体类
/// &lt;/summary&gt;
[Table(Register.DATABASE_PREFIX + nameof(Color))]//必须添加前缀，以防止在整个系统中发生冲突
[Serializable]
public class Color : EntityBase&lt;int&gt;
{
/// &lt;summary&gt;
/// 颜色代码，0-255
/// &lt;/summary&gt;
public int Red { get; private set; }
/// &lt;summary&gt;
/// 颜色代码，0-255
/// &lt;/summary&gt;
public int Green { get; private set; }

            /// &lt;summary&gt;
            /// 颜色代码，0-255
            /// &lt;/summary&gt;
            public int Blue { get; private set; }

            /// &lt;summary&gt;
            /// 额外列，测试多数据库迁移
            /// &lt;/summary&gt;
            public string AdditionNote { get; private set; }

            private Color() { }

            public Color(int red, int green, int blue)
            {
                if (red &lt; 0 || green &lt; 0 || blue &lt; 0)
                {
                    Random();//随机
                }
                else
                {
                    Red = red;
                    Green = green;
                    Blue = blue;
                }
            }

            public Color(ColorDto colorDto)
            {
            }

            {

Red = colorDto.Red;
Green = colorDto.Green;
Blue = colorDto.Blue;
public void Random()
//Randomly generate color codes
var radom = new Random();
Func&lt;int&gt; getRadomColorCode = () =&gt; radom.Next(0, 255);
Red = getRadomColorCode();
Green = getRadomColorCode();
Blue = getRadomColorCode();
}
public void Brighten()
{
Red = Math.Min(255, Red + 10);
Green = Math.Min(255, Green + 10);
Blue = Math.Min(255, Blue + 10);
}
public void Darken()
{
Red = Math.Max(0, Red - 10);
Green = Math.Max(0, Green - 10);
Blue = Math.Max(0, Blue - 10);
}
}
}
&gt; 3. Create a new ColorDto class in Senparc.Xncf.ExtensionAreaTemplate.Models.DatabaseModel.Dto
![Image text](./images/xncf_module/page_create_dto_file_path.png)
using Senparc.Ncf.Core.Models;
namespace Senparc.Xncf.ExtensionAreaTemplate.Models.DatabaseModel.Dto
{
public class ColorDto : DtoBase
{
/// &lt;summary&gt;
/// 颜色代码，0-255
/// &lt;/summary&gt;
public int Red { get; private set; }
/// &lt;summary&gt;
/// 颜色代码，0-255
/// &lt;/summary&gt;
public int Green { get; private set; }
/// &lt;summary&gt;
/// 颜色代码，0-255
/// &lt;/summary&gt;
public int Blue { get; private set; }

            private ColorDto() { }
        }
    }

&gt; 4. Add the following code to AutoMapperConfigs

![Image text](./images/xncf_module/page_create_mapping_file_path.png)

    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using Senparc.Ncf.Core.Models.DataBaseModel;
    using Senparc.Ncf.XncfBase.Attributes;

    namespace Senparc.Xncf.ExtensionAreaTemplate.Models
    {
    }

[XncfAutoConfigurationMapping]
public class ExtensionAreaTemplate_ColorConfigurationMapping : ConfigurationMappingWithIdBase&lt;Color, int&gt;
{
public override void Configure(EntityTypeBuilder&lt;Color&gt; builder)
{
builder.Property(e =&gt; e.Red).IsRequired();
builder.Property(e =&gt; e.Green).IsRequired();
builder.Property(e =&gt; e.Blue).IsRequired();
}
}
&gt; 5. Create pages under Senparc.Xncf.ExtensionAreaTemplate.Areas.ExtensionAreaTemplate.Pages and change Index inheritance to Senparc.Ncf.AreaBase.Admin.AdminXncfModulePageModelBase
![Image text](./images/xncf_module/page_create_pages_file_path.png)
using Microsoft.AspNetCore.Mvc;
using Senparc.Ncf.Core.Enums;
using Senparc.Ncf.Service;
using Senparc.Xncf.ExtensionAreaTemplate.Models.DatabaseModel.Dto;
using Senparc.Xncf.ExtensionAreaTemplate.Services;
using System;
using System.Threading.Tasks;

    namespace Senparc.Xncf.ExtensionAreaTemplate.Areas.ExtensionAreaTemplate.Pages
    {
        public class DatabaseSample : Senparc.Ncf.AreaBase.Admin.AdminXncfModulePageModelBase
        {
            public ColorDto ColorDto { get; set; }

            private readonly ColorService _colorService;
            private readonly IServiceProvider _serviceProvider;
            public DatabaseSample(IServiceProvider serviceProvider, ColorService colorService, Lazy&lt;XncfModuleService&gt; xncfModuleService)
                : base(xncfModuleService)
            {
                _colorService = colorService;
                _serviceProvider = serviceProvider;
            }

            public Task OnGetAsync()
            {
                var color = _colorService.GetObject(z =&gt; true, z =&gt; z.Id, OrderingType.Descending);
                ColorDto = _colorService.Mapper.Map&lt;ColorDto&gt;(color);
                return Task.CompletedTask;
            }

            public IActionResult OnGetDetail()
            {


    }

var color = \_colorService.GetObject(z =&gt; true, z =&gt; z.Id, OrderingType.Descending);
var colorDto = \_colorService.Mapper.Map&lt;ColorDto&gt;(color);
//return Task.CompletedTask;
return Ok(new { colorDto, XncfModuleDto });
}
public async Task&lt;IActionResult&gt; OnGetBrightenAsync()
{
var colorDto = await \_colorService.Brighten().ConfigureAwait(false);
return Ok(colorDto);
}
public async Task&lt;IActionResult&gt; OnGetDarkenAsync()
{
var colorDto = await \_colorService.Darken().ConfigureAwait(false);
return Ok(colorDto);
}
public async Task&lt;IActionResult&gt; OnGetRandomAsync()
{
var colorDto = await \_colorService.Random().ConfigureAwait(false);
return Ok(colorDto);
}
}
&gt; 6. Add Service class
![Image text](./images/xncf_module/page_create_service_file_path.png)

    using Senparc.Ncf.Core.Enums;
    using Senparc.Ncf.Repository;
    using Senparc.Ncf.Service;
    using Senparc.Xncf.ExtensionAreaTemplate.Models.DatabaseModel.Dto;
    using System;
    using System.Threading.Tasks;

    namespace Senparc.Xncf.ExtensionAreaTemplate.Services
    {
        public class ColorService : ServiceBase&lt;Color&gt;
        {
            public ColorService(IRepositoryBase&lt;Color&gt; repo, IServiceProvider serviceProvider)
                : base(repo, serviceProvider)
            {
            }

            public async Task&lt;ColorDto&gt; CreateNewColor()
            {
                Color color = new Color(-1, -1, -1);
                await base.SaveObjectAsync(color).ConfigureAwait(false);
                ColorDto colorDto = base.Mapper.Map&lt;ColorDto&gt;(color);
                return colorDto;
            }

            public async Task&lt;ColorDto&gt; Brighten()
            {
                //TODO: Asynchronous methods need to add sorting functionality

var obj = this.GetObject(z =&amp;gt; true, z =&amp;gt; z.Id, OrderingType.Descending);
obj.Brighten();
await base.SaveObjectAsync(obj).ConfigureAwait(false);
return base.Mapper.Map&amp;lt;ColorDto&amp;gt;(obj);
}

            public async Task&amp;lt;ColorDto&amp;gt; Darken()
            {
                //TODO: Asynchronous methods need to add sorting functionality
                var obj = this.GetObject(z =&amp;gt; true, z =&amp;gt; z.Id, OrderingType.Descending);
                obj.Darken();
                await base.SaveObjectAsync(obj).ConfigureAwait(false);
                return base.Mapper.Map&amp;lt;ColorDto&amp;gt;(obj);
            }

            public async Task&amp;lt;ColorDto&amp;gt; Random()
            {
                //TODO: Asynchronous methods need to add sorting functionality
                var obj = this.GetObject(z =&amp;gt; true, z =&amp;gt; z.Id, OrderingType.Descending);
                obj.Random();
                await base.SaveObjectAsync(obj).ConfigureAwait(false);
                return base.Mapper.Map&amp;lt;ColorDto&amp;gt;(obj);
            }

            //TODO: More business methods can be written here
        }
    }

&amp;gt; 7. Add to ExtensionAreaTemplateSenparcEntities in Senparc.Xncf.ExtensionAreaTemplate.Models.DatabaseModel

![Image text](./images/xncf_module/page_create_entity_file_path.png)

    using Microsoft.EntityFrameworkCore;
    using Senparc.Ncf.XncfBase;
    using Senparc.Ncf.XncfBase.Database;

    namespace Senparc.Xncf.ExtensionAreaTemplate.Models.DatabaseModel
    {
        public class ExtensionAreaTemplateSenparcEntities : XncfDatabaseDbContext
        {
            public override IXncfDatabase XncfDatabaseRegister =&amp;gt; new Register();
            public ExtensionAreaTemplateSenparcEntities(DbContextOptions&amp;lt;ExtensionAreaTemplateSenparcEntities&amp;gt; dbContextOptions) : base(dbContextOptions)
            {
            }

            public DbSet&amp;lt;Color&amp;gt; Colors { get; set; }

            //DOT REMOVE OR MODIFY THIS LINE 请勿移除或修改本行 - Entities Point

            //{

```html
//ex. public DbSet<Color>
  Colors { get; set; } //If there is no special need, the OnModelCreating method
  does not need to be written, it has been required to register in Register
  //protected override void OnModelCreating(ModelBuilder modelBuilder) //} } }
  &gt; 8. Execute under Senparc.Web ![Image
  text](./images/xncf_module/page_dbcontext.png) using
  Senparc.Xncf.ExtensionAreaTemplate.Models.DatabaseModel; using
  Senparc.Ncf.XncfBase.Database; using System; using System.IO; namespace
  Senparc.Xncf.ExtensionAreaTemplate { /// &lt;summary&gt; /// Design-time
  DbContext creation (only used for creating Code-First database Migration
  during development, will not execute in production environment) ///
  &lt;/summary&gt; public class SenparcDbContextFactory :
  SenparcDesignTimeDbContextFactoryBase&lt;ExtensionAreaTemplateSenparcEntities,
  Register&gt; { /// &lt;summary&gt; /// Used to find the App_Data folder to get
  the database connection string configuration information /// &lt;/summary&gt;
  public override string Root</Color
>
```
