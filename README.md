# eslint-plugin-ts-graphql

This ESLint plugin is intended to be used in combination with
[ts-graphql-plugin][] which generates TypeScript interfaces to match GraphQL
queries in TypeScript code. This plugin provides an autofix that applies type
assertions those GraphQL queries. With the type assertion queries can be passed
to functions from, for example, Apollo Client, and result data types, and query
variable types will propagate correctly.

The plugin also makes checks to enforce some properties that are required for
smooth operation:

- Every `gql` template tag must include exactly one GraphQL operation or
  fragment.
- Every GraphQL operation (`query`, `mutation`, or `subscription`) must be
  named.

This plugin is based on code from [@ts-gql/eslint-plugin][].

[ts-graphql-plugin]: https://github.com/Quramy/ts-graphql-plugin
[@ts-gql/eslint-plugin]: https://github.com/Thinkmill/ts-gql

## Example usage

Install:

    $ yarn add --dev @hallettj/eslint-plugin-ts-graphql

Configure `eslintrc.js`:

```js
module.exports = {
  parserOptions: {
    project: "./tsconfig.json",
  },
  env: {
    node: true,
  },
  plugins: ["@hallettj/ts-graphql"],
  rules: {
    "@hallettj/ts-graphql/gql-type-assertion": "error",
  },
};
```

Given a source file with content like this:

```ts
import { gql } from "@apollo/client";

export const getRecipesQuery = gql`
  query getRecipes {
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
  query getRecipes {
    recipes {
      id
      title
      description
    }
  }
` as import("@graphql-typed-document-node/core").TypedDocumentNode<
  import("./__generated__/get-recipes").getRecipes,
  import("./__generated__/get-recipes").getRecipesVariables
>;
```
