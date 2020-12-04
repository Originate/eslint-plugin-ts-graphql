import { gql } from "gql";

gql`
  query Thing {
    something
  }
` as SomeType;

gql`
  query Thing {
    something
  }
` as import("./__generated__/thing").WrongThing;

gql`
  query Thing {
    something
  }
` as import("./__generated__/wrong-thing").ThingDocument;
