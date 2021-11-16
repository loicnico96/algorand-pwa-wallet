module.exports = {
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
  ],
  coverageReporters: [
    "html",
    "text-summary",
  ],
  moduleNameMapper: {
    ".+\\.(css|png|jpg)$": "<rootDir>/jest/fileMock.js",
  },
  setupFiles: [
    "<rootDir>/jest/setupTest.js",
  ],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "babel-jest",
      {
        presets: [
          "next/babel"
        ]
      }
    ]
  }
}
