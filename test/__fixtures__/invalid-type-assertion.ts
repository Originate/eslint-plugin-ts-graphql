import { gql } from "gql";

gql`
  query Thing {
    something
  }
` as SomeType<
  import("./__generated__/thing").Thing,
  import("./__generated__/thing").ThingVariables
>;

gql`
  query Thing {
    something
  }
` as import("@graphql-typed-document-node/core").TypedDocumentNode<
  import("./__generated__/thing").WrongThing,
  import("./__generated__/thing").ThingVariables
>;

gql`
  query Thing {
    something
  }
` as import("@graphql-typed-document-node/core").TypedDocumentNode<
  import("./__generated__/thing").Thing,
  import("./__generated__/wrong-thing").ThingVariables
>;
