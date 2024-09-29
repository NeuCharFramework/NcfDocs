# Xncf Module Development

NCF Underlying Support Library Official Nuget Package Source Code

## Xncf Single Function Execution Module Development

> 1. Create a new Dotnet Core Class Library project

![create_dotnet_core_class_library](./images/xncf_module/create_dotnet_core_class_library.png)

> 2. Enter the name of the Class Library and click Create

![Image text](./images/xncf_module/input_dotnet_core_class_library_name.png)

> 3. Create Register.cs

![Image text](./images/xncf_module/create_register_and_functions_folder.png)

> 4. Configure the necessary content in Register

| Name        | Description                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------- |
| Name        | Module name                                                                                                         |
| Uid         | Global unique identifier, preferably generated using a tool                                                         |
| Version     | Module version number (used to identify updates)                                                                    |
| MenuName    | Name displayed in the menu after installation in NCF                                                                |
| Icon        | [Font icon](https://colorlib.com/polygon/gentelella/icons.html) displayed next to the menu                          |
| Description | Description of the module, which can be used to understand the specific functions of the module before installation |

![Image text](./images/xncf_module/register_content.png)

> 5. Create a custom method class

![Image text](./images/xncf_module/create_functions_class_library.png)

> 6. Complete the custom method

```csharp
public MyFunction(IServiceProvider serviceProvider) : base(serviceProvider)
{
}

public class Parameters : IFunctionParameter
{
    [Required]
    [MaxLength(50)]
    [Description("名称||双竖线之前为参数名称，双竖线之后为参数注释")]
    public string Name { get; set; }

    [Required]
    [Description("数字||数字1")]
    public int Number1 { get; set; }


    [Required]
    [Description("数字||数字2")]
    public int Number2 { get; set; }

    [Description("运算符||")]//下拉列表
    public SelectionList Operator { get; set; } = new SelectionList(SelectionType.DropDownList, new[] {
            new SelectionItem("+","加法","数字1 + 数字2",false),
            new SelectionItem("-","减法","数字1 - 数字2",true),
            new SelectionItem("×","乘法","数字1 × 数字2",false),
            new SelectionItem("÷","除法","数字1 ÷ 数字2",false)
    });

    [Description("计算平方||")]//多选框
    public SelectionList Power { get; set; } = new SelectionList(SelectionType.CheckBoxList, new[] {
            new SelectionItem("2","平方","计算上述结果之后再计算平方",false),
            new SelectionItem("3","三次方","计算上述结果之后再计算三次方",false)
    });
}


public override string Name => "我的函数";

public override string Description => "我的函数的注释";

public override Type FunctionParameterType => typeof(Parameters);

public override FunctionResult Run(IFunctionParameter param)
{
    return FunctionHelper.RunFunction<Parameters>(param, (typeParam, sb, result) =>
    {
        /* 页面上点击“执行”后，将调用这里的方法
            *
            * 参数说明：
            * param：IFunctionParameter 类型对象
            * typeParam：Senparc.Xncf.Application.MyFunction.Parameters 类型对象
            * sb：日志
            * result：返回结果
            */

        double calcResult = typeParam.Number1;
        var theOperator = typeParam.Operator.SelectedValues.FirstOrDefault();
        switch (theOperator)
        {
            case "+":
                calcResult = calcResult + typeParam.Number2;
                break;
            case "-":
                calcResult = calcResult - typeParam.Number2;
                break;
            case "×":
                calcResult = calcResult * typeParam.Number2;
                break;
            case "÷":
                if (typeParam.Number2 == 0)
                {
                    result.Success = false;
                    result.Message = "被除数不能为0！";
                    return;
                }
                calcResult = calcResult / typeParam.Number2;
                break;
            default:
                result.Success = false;
                result.Message = $"未知的运算符：{theOperator}";
                return;
        }

        sb.AppendLine($"进行运算：{typeParam.Number1} {theOperator} {typeParam.Number2} = {calcResult}");

        Action<int> raisePower = power =>
        {
            if (typeParam.Power.SelectedValues.Contains(power.ToString()))
            {
                var oldValue = calcResult;
                calcResult = Math.Pow(calcResult, power);
                sb.AppendLine($"进行{power}次方运算：{oldValue}{(power == 2 ? "²" : "³")} = {calcResult}");
            }
        };

        raisePower(2);
        raisePower(3);

        result.Message = $"计算结果：{calcResult}。计算过程请看日志";
    });
}
```

&gt; 7. Register the custom method class in Register

![Image text](./images/xncf_module/register_add_functions.png)

&gt; 8. Publish Nuget, detailed steps to publish Nuget

## Xncf Custom Module Development with Page Functionality

&gt; 1. Create a new DotnetCore Class Library project and enter the project name

![Image text](./images/xncf_module/page_create_dotnet_core_class_library.png)

![Image text](./images/xncf_module/page_create_dotnet_core_class_library_input_name.png)

&gt; &gt; 1.1 Directory name as follows

![Image text](./images/xncf_module/page_folder_struct.png)

&gt; &gt; 1.2 Set the project to support RazorPage functionality

![Image text](./images/xncf_module/page_project_support_razor.png)

&gt; 2. Create a new Color model class in Senparc.Xncf.ExtensionAreaTemplate

```csharp
using Senparc.Ncf.Core.Models;
using Senparc.Xncf.ExtensionAreaTemplate.Models.DatabaseModel.Dto;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Senparc.Xncf.ExtensionAreaTemplate
{
    /// <summary>
    /// Color entity class
    /// </summary>
    [Table(Register.DATABASE_PREFIX + nameof(Color))]//Must add prefix to prevent conflicts in the entire system
    [Serializable]
    public class Color : EntityBase<int>
    {
        /// <summary>
        /// Color code, 0-255
        /// </summary>
        public int Red { get; private set; }
        /// <summary>
        /// Color code, 0-255
        /// </summary>
        public int Green { get; private set; }

        /// <summary>
        /// Color code, 0-255
        /// </summary>
        public int Blue { get; private set; }

        /// <summary>
        /// Additional column, test multiple database Migrate
        /// </summary>
        public string AdditionNote { get; private set; }

        private Color() { }

        public Color(int red, int green, int blue)
        {
            if (red < 0 || green < 0 || blue < 0)
            {
                Random();//Random
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
            Red = colorDto.Red;
            Green = colorDto.Green;
            Blue = colorDto.Blue;
        }

        public void Random()
        {
            //Randomly generate color codes
            var radom = new Random();
            Func<int> getRadomColorCode = () => radom.Next(0, 255);
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
```

&gt; 3. Create a new ColorDto class in Senparc.Xncf.ExtensionAreaTemplate.Models.DatabaseModel.Dto

![Image text](./images/xncf_module/page_create_dto_file_path.png)

```csharp
using Senparc.Ncf.Core.Models;

namespace Senparc.Xncf.ExtensionAreaTemplate.Models.DatabaseModel.Dto
{
    public class ColorDto : DtoBase
    {
        /// <summary>
        /// Color code, 0-255
        /// </summary>
        public int Red { get; private set; }
        /// <summary>
        /// Color code, 0-255
        /// </summary>
        public int Green { get; private set; }
        /// <summary>
        /// Color code, 0-255
        /// </summary>
        public int Blue { get; private set; }

        private ColorDto() { }
    }
}
```

&gt; 4. Add the following code to AutoMapperConfigs

![Image text](./images/xncf_module/page_create_mapping_file_path.png)

```csharp
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Senparc.Ncf.Core.Models.DataBaseModel;
using Senparc.Ncf.XncfBase.Attributes;

namespace Senparc.Xncf.ExtensionAreaTemplate.Models
{
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
}
```

&gt; 5. Create pages under Senparc.Xncf.ExtensionAreaTemplate.Areas.ExtensionAreaTemplate.Pages and change the inheritance of Index to Senparc.Ncf.AreaBase.Admin.AdminXncfModulePageModelBase

![Image text](./images/xncf_module/page_create_pages_file_path.png)

```csharp
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
            var color = _colorService.GetObject(z =&gt; true, z =&gt; z.Id, OrderingType.Descending);
            var colorDto = _colorService.Mapper.Map&lt;ColorDto&gt;(color);
            //return Task.CompletedTask;
            return Ok(new { colorDto, XncfModuleDto });
        }

        public async Task&lt;IActionResult&gt; OnGetBrightenAsync()
        {
            var colorDto = await _colorService.Brighten().ConfigureAwait(false);
            return Ok(colorDto);
        }

        public async Task&lt;IActionResult&gt; OnGetDarkenAsync()
        {
            var colorDto = await _colorService.Darken().ConfigureAwait(false);
            return Ok(colorDto);
        }
        public async Task&lt;IActionResult&gt; OnGetRandomAsync()
        {
            var colorDto = await _colorService.Random().ConfigureAwait(false);
            return Ok(colorDto);
        }
    }
}
```

&gt; 6. Add Service class

![Image text](./images/xncf_module/page_create_service_file_path.png)

```csharp
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
            //TODO:异步方法需要添加排序功能
            var obj = this.GetObject(z =&gt; true, z =&gt; z.Id, OrderingType.Descending);
            obj.Brighten();
            await base.SaveObjectAsync(obj).ConfigureAwait(false);
            return base.Mapper.Map&lt;ColorDto&gt;(obj);
        }

        public async Task&lt;ColorDto&gt; Darken()
        {
            //TODO:异步方法需要添加排序功能
            var obj = this.GetObject(z =&gt; true, z =&gt; z.Id, OrderingType.Descending);
            obj.Darken();
            await base.SaveObjectAsync(obj).ConfigureAwait(false);
            return base.Mapper.Map&lt;ColorDto&gt;(obj);
        }

        public async Task&lt;ColorDto&gt; Random()
        {
            //TODO:异步方法需要添加排序功能
            var obj = this.GetObject(z =&gt; true, z =&gt; z.Id, OrderingType.Descending);
            obj.Random();
            await base.SaveObjectAsync(obj).ConfigureAwait(false);
            return base.Mapper.Map&lt;ColorDto&gt;(obj);
        }

        //TODO: 更多业务方法可以写到这里
    }
}
```

&gt; 7. Add to ExtensionAreaTemplateSenparcEntities in Senparc.Xncf.ExtensionAreaTemplate.Models.DatabaseModel

```csharp
using Microsoft.EntityFrameworkCore;
using Senparc.Ncf.XncfBase;
using Senparc.Ncf.XncfBase.Database;

namespace Senparc.Xncf.ExtensionAreaTemplate.Models.DatabaseModel
{
    public class ExtensionAreaTemplateSenparcEntities : XncfDatabaseDbContext
    {
        public override IXncfDatabase XncfDatabaseRegister =&gt; new Register();
        public ExtensionAreaTemplateSenparcEntities(DbContextOptions&lt;ExtensionAreaTemplateSenparcEntities&gt; dbContextOptions) : base(dbContextOptions)
        {
        }

        public DbSet&lt;Color&gt; Colors { get; set; }

        //DOT REMOVE OR MODIFY THIS LINE 请勿移除或修改本行 - Entities Point
        //ex. public DbSet&lt;Color&gt; Colors { get; set; }

        //如无特殊需需要，OnModelCreating 方法可以不用写，已经在 Register 中要求注册
        //protected override void OnModelCreating(ModelBuilder modelBuilder)
        //{
        //}
    }
}
```

![Image text](./images/xncf_module/page_create_entity_file_path.png)

&gt; 8. Execute in Senparc.Web

![Image text](./images/xncf_module/page_dbcontext.png)

```csharp
using Senparc.Xncf.ExtensionAreaTemplate.Models.DatabaseModel;
using Senparc.Ncf.XncfBase.Database;
using System;
using System.IO;

namespace Senparc.Xncf.ExtensionAreaTemplate
{
    /// <summary>
    /// Design-time DbContext creation (only used for creating Code-First database Migrations during development, not executed in production)
    /// </summary>
    public class SenparcDbContextFactory : SenparcDesignTimeDbContextFactoryBase&lt;ExtensionAreaTemplateSenparcEntities, Register&gt;
    {
        /// <summary>
        /// Used to find the App_Data folder to locate the database connection string configuration information
        /// </summary>
        public override string RootDictionaryPath =&gt; Path.Combine(AppContext.BaseDirectory, &quot;..\\..\\..\\&quot;/*Project root directory*/, &quot;..\\Senparc.Web&quot;/*Find the Web directory to get the unified database connection string configuration*/);
    }
}
```

&gt; 9. Add database update command based on the actual name of the Entities

![Image text](./images/xncf_module/page_entity_name.png)

```shell
add-migration Xncf_AreaTemplate_Init2 -Context ExtensionAreaTemplateSenparcEntities
```

&gt; 10. To update the newly added database tables and fields, simply run the NCF main program, update the referenced module, or reinstall the module.

## Welcome to contribute code!

[NeuCharFramework](https://github.com/NeuCharFramework/NCF)
