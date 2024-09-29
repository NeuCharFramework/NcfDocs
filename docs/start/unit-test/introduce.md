# NCF Unit Test Introduction

## Introduction

NCF provides a unit test framework for all modules to ensure code quality. Unit testing is a testing method used to verify the correctness of the code.

In NCF, we adhere to the standard DDD (Domain-Driven Design) pattern, completely isolating databases and data from different domains at different stages. On one hand, the unit test design of NCF allows developers to focus on business logic testing and provides a complete set of underlying support systems, making it very convenient for developers to conduct unit tests. It also supports automated testing in the CI/CD process in DevOps, and even uses Agents for automated testing and optimization. On the other hand, the basic framework provided by NCF also offers good support for TDD (Test-Driven Development).

## Unit Test Basic Module

Nuget Package: [Senparc.Ncf.UnitTestExtension](https://www.nuget.org/packages/Senparc.Ncf.UnitTestExtension)

Source Code: [Senparc.Ncf.UnitTestExtension](https://github.com/NeuCharFramework/NcfPackageSources/blob/32ee9ce35609a9c7886096429263daa9f32d13c9/src/Basic/Senparc.Ncf.UnitTestExtension/)
