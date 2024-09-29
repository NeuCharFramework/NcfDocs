# Multi-Database Principle

As we all know, Microsoft's database migration tool Entity Framework (EF) Core is unparalleled by any other tool, very easy to use and highly compatible.

## Overview

Entity Framework (EF) Core is a lightweight, extensible, open-source, and cross-platform version of the popular Entity Framework data access technology.

EF Core can be used as an object-relational mapper (O/RM), which can achieve the following two points:

Enable .NET developers to work with databases using .NET objects.

Eliminate the need to write most of the data access code as usual.

EF Core supports multiple database engines.

NCF provides the best data migration for developers based on EF Core.

## Working Principle

Create DbContext instance

Create Models

Manually code the models to conform to the database

After creating the model, use EF migration to create the database from the model. When the model changes, migration allows the database to evolve continuously.

Inject DbContext into the Service, the Service obtains the authority to operate the migration database, and migrate to different databases according to different database requirements
