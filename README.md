# eslint-plugin-ts-graphql

This ESLint plugin is intended to be used in combination with
[ts-graphql-plugin][] which generates TypeScript interfaces to match GraphQL
queries in TypeScript code. This plugin provides an autofix that applies type
assertions those GraphQL queries. With the type assertion queries can be passed
to functions from, for example, Apollo Client, and (with a little setup) result
data types, and query variable types will propagate correctly.

The plugin also makes checks to enforce some properties that are required for
smooth operation:

- Every `gql` template tag must include exactly one GraphQL operation or
  fragment.
- Every GraphQL operation (`query`, `mutation`, or `subscription`) must be
  named.

This plugin is based on code from [@ts-gql/eslint-plugin][].

[ts-graphql-plugin]: https://github.com/Quramy/ts-graphql-plugin
[@ts-gql/eslint-plugin]: https://github.com/Thinkmill/ts-gql

## Prerequisites

This plugin requires `graphql` v15.4.0 or later, and `ts-graphql-plugin` v2.1.0
or later. `ts-graphql-plugin` must be configured to use its bundled
`typed-query-document` add-on as documented
[here](https://github.com/Quramy/ts-graphql-plugin#typed-query-document).

## Setup

Install:

    $ yarn add --dev @originate/eslint-plugin-ts-graphql

Configure `eslintrc.js`:

```js
module.exports = {
  parserOptions: {
    project: "./tsconfig.json",
  },
  env: {
    node: true,
  },
  plugins: ["@originate/ts-graphql"],
  rules: {
    "@originate/ts-graphql/gql-type-assertion": "error",
  },
};
```

Configure `ts-graphql-plugin` to use the relevant add-on by setting up your
`tsconfig.json` like this:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "ts-graphql-plugin",
        "tag": "gql",
        "schema": "schema.graphql",
        "typegen": {
          "addons": ["ts-graphql-plugin/addons/typed-query-document"]
        }
      }
    ]
  }
}
```

## Example usage

Given a source file with content like this:

```ts
import { gql } from "@apollo/client";

export const getRecipesQuery = gql`
  query GetRecipes {
    recipes {
      id
      title
      description
    }
  }
`;
```

Running ESLint with the `--fix` option will update the file to look like this:

```ts
import { gql } from "@apollo/client";

export const getRecipesQuery = gql`
  query GetRecipes {
    recipes {
      id
      title
      description
    }
  }
` as import("./__generated__/get-recipes").GetRecipesDocument;
```

## Consuming the `TypedQueryDocumentNode` type

The type that is applied to `gql` template expressions (for example
`GetRecipesDocument` in the example above) is an alias for the
[`TypedQueryDocumentNode`](https://github.com/graphql/graphql-js/blob/master/src/utilities/typedQueryDocumentNode.d.ts)
type from `graphql-js` with type parameters for result data and variables filled
in. This type was added to `graphql-js` very recently; so at the time of this
writing there are no libraries that are set up to consume the type. But some
libraries, such as Apollo Client, can consume a similar, third party type called
`TypedDocumentNode`.

You can make Apollo Client's functions (such as `useQuery`) process
`TypedQueryDocumentNode` correctly by augmenting `TypedDocumentNode` so that
`TypedQueryDocumentNode` is assignable to `TypedDocumentNode`. To do so include
this typing file in your project:

```ts
// typed-document-node.d.ts

import { DocumentNode } from "graphql";

declare module "@graphql-typed-document-node/core" {
  export interface TypedDocumentNode<
    Result = {
      [key: string]: any;
    },
    Variables = {
      [key: string]: any;
    }
  > extends DocumentNode {
    /**
     * This type is used to ensure that the variables you pass in to the query
     * are assignable to Variables and that the Result is assignable to whatever
     * you pass your result to. The method is never actually implemented, but the
     * type is valid because we list it as optional
     */
    __ensureTypesOfVariablesAndResultMatching?: (
      variables: Variables
    ) => Result;
  }
}
```

Alternatively you can write your own wrapper functions that hook up type
inference. You can do this with any library that consumes the `DocumentNode` or
`TypedDocumentNode` types. Here is an example wrapper for Apollo Client's
`useQuery`:

```ts
import { gql, QueryHookOptions, QueryResult, useQuery } from "@apollo/client";
import { TypedQueryDocumentNode } from "graphql";

function useTypedQuery<ResponseData, Variables>(
  query: TypedQueryDocumentNode<ResponseData, Variables>,
  options: QueryHookOptions<ResponseData, Variables>
): QueryResult<ResponseData, Variables> {
  return useQuery(query, options);
}

// example usage
const { data } = useTypedQuery(query, { variables: { take: 100 } });
//      ^                                          ^
//      inferred type is `MyQuery`                 |
//                                                 |
//                                        inferred type is `MyQueryVariables`
```

## Automated releases

This project uses an automated release system which requires that pull requests
be merged in a special way. Please read the [contributing
guidelines](./CONTRIBUTING.md) before merging pull requests.
