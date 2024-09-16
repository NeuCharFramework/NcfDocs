# Senparc.Ncf.Repository

## Overview

Senparc.Ncf.Repository is a core component of the NeuCharFramework (NCF) system. It provides a set of standardized data access interfaces and implementations, which facilitate the development and maintenance of applications.

## Features

- **Unified Interface**: Provides a unified data access interface, reducing the learning curve for developers.
- **Extensibility**: Supports custom extensions, allowing developers to extend functionality as needed.
- **Compatibility**: Compatible with various databases, making it easy to switch between different database systems.

## Installation

To install Senparc.Ncf.Repository, you can use the following command:

```bash
dotnet add package Senparc.Ncf.Repository
```

## Usage

### Basic Usage

Below is an example of how to use Senparc.Ncf.Repository in your project:

```csharp
using Senparc.Ncf.Repository;

public class MyService
{
    private readonly IRepository<MyEntity> _repository;

    public MyService(IRepository<MyEntity> repository)
    {
        _repository = repository;
    }

    public void AddEntity(MyEntity entity)
    {
        _repository.Insert(entity);
    }

    public MyEntity GetEntity(int id)
    {
        return _repository.GetObject(id);
    }
}
```

### Advanced Usage

For more advanced usage, you can refer to the official documentation at [NCF Documentation](https://www.senparc.com/).

## Contributing

If you wish to contribute to the project, please follow the guidelines outlined in the [CONTRIBUTING.md](https://github.com/Senparc/NeuCharFramework/blob/master/CONTRIBUTING.md) file.

## License

Senparc.Ncf.Repository is licensed under the MIT License. For more details, please refer to the [LICENSE](https://github.com/Senparc/NeuCharFramework/blob/master/LICENSE) file.

## Contact

For any questions or feedback, please contact us at [support@senparc.com](mailto:support@senparc.com).

![Senparc Logo](https://www.senparc.com/images/logo.png)
