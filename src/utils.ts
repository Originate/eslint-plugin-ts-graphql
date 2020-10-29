// `decamelize` and `dasherize` are copied from `ts-graphql-plugin`. `dasherize`
// maps operation names to file names, and the mapping in this package must
// match the mapping in `ts-graphql-plugin`.

const STRING_DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g;
const STRING_DASHERIZE_REGEXP = /[ _]/g;

export function decamelize(str: string): string {
  return str.replace(STRING_DECAMELIZE_REGEXP, "$1_$2").toLowerCase();
}

export function dasherize(str: string): string {
  return decamelize(str).replace(STRING_DASHERIZE_REGEXP, "-");
}
