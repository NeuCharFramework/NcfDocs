# Multi-Database Principle

As we all know, Microsoft's database migration tool Entity Framework (EF) Core is unparalleled by any other tool, very easy to use and highly compatible.

## Overview

Entity Framework (EF) Core is a lightweight, extensible, open-source, and cross-platform version of the commonly used Entity Framework data access technology.

EF Core can be used as an Object-Relational Mapper (O/RM), which enables the following:

Allows .NET developers to work with databases using .NET objects.

Eliminates the need to write most of the data access code as usual.

EF Core supports multiple database engines.

NCF provides the best data migration for developers based on EF Core.

## Working Principle

Create DbContext instance

Create Models

Manually code the models to conform to the database

After creating the models, use EF migrations to create the database from the models. When the models change, migrations allow the database to evolve continuously.

Inject DbContext into the Service, and the Service obtains the authority to operate and migrate the database. According to different database requirements, migrate to different databases.
