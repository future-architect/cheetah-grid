module.exports = {
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "json", "jsx"],
  globals: {
    "ts-jest": {
      isolatedModules: false,
    },
  },
  testEnvironment: "jsdom",
};
