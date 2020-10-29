module.exports = {
  moduleFileExtensions: ["js", "ts"],
  rootDir: ".",
  testRegex: "test.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  testEnvironment: "node",
};
