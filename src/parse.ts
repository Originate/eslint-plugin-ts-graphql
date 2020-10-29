import { TSESLint, TSESTree } from "@typescript-eslint/experimental-utils";
import { MessageId } from ".";

export interface QuickDocument {
  operationName: string | null;
  operationType: string;
}

const operationNameRegex = /^\s*(query|mutation|subscription|fragment)[\s\r\n]*([_A-Za-z][_0-9A-Za-z]*)?/gim;

// This is not a real parser - just a quick-and-dirty regex.
function parseOperationNames(node: TSESTree.TemplateLiteral): QuickDocument[] {
  return node.quasis.flatMap((quasi) => {
    const matches = operationNameRegex[Symbol.matchAll](quasi.value.cooked);
    return Array.from(matches).map(([, operationType, operationName]) => ({
      operationName,
      operationType,
    }));
  });
}

export function handleTemplateTag(
  node: TSESTree.TaggedTemplateExpression,
  report: TSESLint.RuleContext<MessageId, any>["report"]
): QuickDocument | undefined {
  const documents = parseOperationNames(node.quasi);
  if (documents.length > 1) {
    report({
      messageId: "singleOperation",
      node,
    });
    return;
  }
  if (documents.length === 0) {
    report({
      messageId: "operationOrSingleFragment",
      node,
    });
    return;
  }
  return documents[0];
}
