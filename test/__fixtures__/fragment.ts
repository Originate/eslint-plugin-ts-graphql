import { gql } from "gql";

const fields = gql`
  fragment Fields on Thing {
    id
    something
  }
`

gql`
  ${fields}
  query GetThing {
    ...Fields
  }
`
