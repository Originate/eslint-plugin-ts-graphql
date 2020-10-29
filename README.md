# eslint-plugin-ts-graphql

This ESLint plugin is intended to be used in combination with
[ts-graphql-plugin][] which generates TypeScript interfaces to match GraphQL
queries in TypeScript code. This plugin provides an autofix that applies type
assertions those GraphQL queries. With the type assertion queries can be passed
to functions from, for example, Apollo Client, and result data types, and query
variable types will propagate correctly.

This plugin is based on code from [@ts-gql/eslint-plugin][].

[ts-graphql-plugin]: https://github.com/Quramy/ts-graphql-plugin
[@ts-gql/eslint-plugin]: https://github.com/Thinkmill/ts-gql
