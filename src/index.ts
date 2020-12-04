import {
  ESLintUtils,
  TSESLint,
  TSESTree,
} from "@typescript-eslint/experimental-utils";
import { isMatch } from "lodash";
import { getNodes } from "./get-nodes";
import { handleTemplateTag, QuickDocument } from "./parse";
import { dasherize } from "./utils";

// TODO:
const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/Originate/eslint-plugin-ts-graphql/blob/master/docs/rules/${name}.md`
);

const messages = {
  singleOperation: "GraphQL documents must have only one operation",
  mustBeNamed: "GraphQL operations must have a name",
  mustUseAs: "You must cast gql tags with the generated type",
  mustUseAsCorrectly:
    "The type assertion on a gql tag is not in the expected format",
  operationOrSingleFragment:
    "GraphQL documents must either have a single operation or a single fragment",
};

export type MessageId = keyof typeof messages;

function checkFragment(
  document: QuickDocument,
  node: TSESTree.TaggedTemplateExpression,
  context: TSESLint.RuleContext<MessageId, any>
) {
  addNameToGqlTag(document, node, context);
}

function addNameToGqlTag(
  document: QuickDocument,
  node: TSESTree.TaggedTemplateExpression,
  context: TSESLint.RuleContext<MessageId, any>
) {
  if (!document.operationName) {
    context.report({
      messageId: "mustBeNamed",
      node,
    });
    return false;
  }

  if (document.operationType === "fragment") {
    // Fragments do not need a type assertion
    return true;
  }

  const name = document.operationName;
  const pathname = `./__generated__/${dasherize(name)}`;
  const documentTypeName = `${name}Document`;

  const type = `import(${JSON.stringify(pathname)}).${documentTypeName}`;

  // Add a type assertion if there isn't one.
  if (node.parent?.type !== "TSAsExpression") {
    context.report({
      messageId: "mustUseAs",
      node,
      fix(fix) {
        return fix.insertTextAfter(node, ` as ${type}`);
      },
    });
    return false;
  }

  // The gql template has a type assertion - check if it has the correct format.
  if (
    !isMatch(node.parent.typeAnnotation, {
      type: "TSImportType",
      parameter: {
        literal: {
          value: pathname,
        },
      },
      qualifier: {
        type: "Identifier",
        name: documentTypeName,
      },
    })
  ) {
    const typeAnnotation = node.parent.typeAnnotation;
    context.report({
      messageId: "mustUseAsCorrectly",
      node: typeAnnotation,
      fix(fix) {
        return fix.replaceText(typeAnnotation, type);
      },
    });
    return false;
  }
  return true;
}

function checkDocument(
  document: QuickDocument,
  node: TSESTree.TaggedTemplateExpression,
  context: TSESLint.RuleContext<MessageId, any>
) {
  if (document.operationType === "fragment") {
    checkFragment(document, node, context);
    return;
  }
  addNameToGqlTag(document, node, context);
}

export const rules = {
  "gql-type-assertion": createRule<[], MessageId>({
    name: "gql-type-assertion",
    meta: {
      fixable: "code",
      docs: {
        requiresTypeChecking: true,
        category: "Best Practices",
        recommended: "error",
        description:
          "Fixing this error adds a type assertion to gql template tags that provides accurate type inference for query variables, and for result data.",
      },
      messages,
      type: "problem",
      schema: [],
    },
    defaultOptions: [],
    create(context) {
      return {
        Program(programNode) {
          let report: typeof context["report"] = (arg) => {
            return context.report(arg);
          };

          for (const node of getNodes(context, programNode)) {
            if (node.type === "TaggedTemplateExpression") {
              if (node.tag.type === "Identifier" && node.tag.name === "gql") {
                const document = handleTemplateTag(node, report);
                if (document) {
                  checkDocument(document, node, context);
                }
              }
            }
          }
        },
      };
    },
  }),
};
