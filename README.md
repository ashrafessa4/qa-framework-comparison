# UI Automation Framework Comparison

[![Framework comparison](https://github.com/ashrafessa4/qa-framework-comparison/actions/workflows/comparison.yml/badge.svg)](https://github.com/ashrafessa4/qa-framework-comparison/actions/workflows/comparison.yml)
[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4)](https://dotnet.microsoft.com/)

The same five SauceDemo scenarios implemented independently in Playwright, Cypress, and Selenium WebDriver with C#/NUnit. This repository demonstrates practical familiarity with all three tools and explains when I would choose each one.

## Identical scenario set

1. A valid user signs in.
2. A locked user receives the expected error.
3. A product can be added to the cart.
4. Products sort by ascending price.
5. A customer completes checkout.

Each implementation uses stable `data-test` selectors, explicit assertions, isolated browser state, headless CI execution, and failure evidence.

## Implementations

| Framework | Language/runtime | Structure | Failure evidence |
| --- | --- | --- | --- |
| Playwright | TypeScript / Node.js 24 | Config, page object, five tests | HTML report, trace, screenshot, video |
| Cypress | TypeScript / Node.js 24 | Config, custom command, five tests | Command log, screenshot, video |
| Selenium | C# 14 / .NET 10 / NUnit | Solution, page object, fixture, five tests | TRX report, screenshot |

## Run locally

Install JavaScript dependencies and the Playwright browser:

```bash
npm ci
npx playwright install chromium
```

Run each implementation:

```bash
npm run test:playwright
npm run test:cypress
dotnet test QaFrameworkComparison.sln --configuration Release
```

Prerequisites are Node.js 24, Chrome, and the .NET 10 SDK. `BASE_URL` can override the default public SauceDemo endpoint.

## Measured comparison

Run all implementations sequentially and record wall-clock duration, including framework startup:

```bash
npm run benchmark
```

The latest local result is stored in [`results/latest.md`](results/latest.md). It is deliberately labeled as one-machine evidence rather than a universal benchmark; public-site latency, browser caching, and machine load all affect the numbers.

## Engineering assessment

| Concern | Playwright | Cypress | Selenium + C# |
| --- | --- | --- | --- |
| Setup | Small; browsers managed by CLI | Small; bundled runner and interactive UI | More explicit project and driver setup |
| Waiting model | Auto-waiting locators and assertions | Retriable command queue and assertions | Explicit waits are essential |
| Cross-browser | Chromium, Firefox, WebKit | Chrome-family, Firefox, Electron | Broad WebDriver ecosystem |
| Debugging | Trace Viewer is the strongest post-run artifact | Excellent interactive command timeline | Familiar debugger plus screenshots/TRX |
| Best fit | Modern cross-browser web E2E | Front-end teams wanting fast interactive feedback | .NET enterprises, grids, and established WebDriver estates |

For a new general-purpose web project, I would start with Playwright because its isolation, browser management, and traces reduce framework code. I would choose Cypress where its interactive workflow and component-testing ecosystem match the front-end team. Selenium remains a sound choice for existing C# suites, Selenium Grid, and organizations standardized on WebDriver.

## CI

GitHub Actions runs all three implementations in independent jobs on every push and pull request. This keeps failures attributable to one framework and publishes each framework's native evidence as an artifact.

## License

MIT
