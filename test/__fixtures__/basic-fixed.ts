import { gql } from "gql";

gql`
  query Thing {
    something
  }
` as import("./__generated__/thing").ThingDocument;
