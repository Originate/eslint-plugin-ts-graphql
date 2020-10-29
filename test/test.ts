import { SnapshotCreator } from "eslint-snapshot-test";
import fs from "fs";
import path from "path";
import { rules } from "../src";

let snapshotCreator = new SnapshotCreator({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: "module",
  },
});

let fixturesPath = path.join(__dirname, "__fixtures__");

let fixtures = fs.readdirSync(fixturesPath);

for (const fixture of fixtures) {
  test(fixture, async () => {
    const fixturePath = path.join(fixturesPath, fixture);
    const code = fs.readFileSync(fixturePath, "utf8");
    let result = snapshotCreator
      .mark({
        code,
        rule: rules["gql-type-assertion"],
        ruleName: "gql-type-assertion",
      })
      .withFileName(fixturePath)
      .render();
    if (result.fixedOutput === code) {
      delete result.fixedOutput;
    }
    expect(result).toMatchSnapshot();
  });
}
