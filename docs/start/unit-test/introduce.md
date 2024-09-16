# NCF Unit Testing Introduction

## Introduction

NCF provides a unit testing framework for all modules to ensure code quality. Unit testing is a testing method used to verify the correctness of code.

In NCF, we adhere to the standard DDD (Domain-Driven Design) pattern, completely isolating databases and data from different domains at different stages. On one hand, NCF's unit testing design allows developers to focus on business logic testing and provides a complete underlying support system, making it very convenient for developers to conduct unit tests. It also supports automated testing in the CI/CD process of DevOps, and even uses Agents for automated testing and optimization. On the other hand, the basic framework provided by NCF also offers good support for TDD (Test-Driven Development).

## Unit Testing Basic Module

Nuget Package: [Senparc.Ncf.UnitTestExtension](https://www.nuget.org/packages/Senparc.Ncf.UnitTestExtension)

Source Code: [Senparc.Ncf.UnitTestExtension](https://github.com/NeuCharFramework/NcfPackageSources/blob/32ee9ce35609a9c7886096429263daa9f32d13c9/src/Basic/Senparc.Ncf.UnitTestExtension/)
