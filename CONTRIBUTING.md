# Contributing

Hey! Thank you for deciding to contribute to Mock Service Worker! This page will help you land your first contribution by giving you a better understanding about the project's structure, dependencies, and development workflow.

## Tools

Getting yourself familiar with the tools below will substantially ease your contribution experience.

- [TypeScript](https://www.typescriptlang.org/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

## Dependencies

Mock Service Worker depends on multiple other libraries.

| Library name                                            | Purpose                                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| [cookies](https://github.com/mswjs/cookies)             | Enables cookies persistence and inference between environments.          |
| [headers-utils](https://github.com/mswjs/headers-utils) | `Headers` polyfill to manage request/response headers.                   |
| [interceptors](https://github.com/mswjs/interceptors)   | Provisions request interception in Node.js (internals of `setupServer`). |

There are cases when an issue originates from one of the said dependencies. Don't hesitate to address it in the respective repository, as they all are governed by the same team.

## Getting started

### Fork the repository

Please use the GitHub UI to [fork this repository](https://github.com/mswjs/msw) (_read more about [Forking a repository](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo)_). Mock Service Worker has forked builds enabled in the CI, so you will see the build status of your fork's branch.

### Install

```bash
$ cd msw
$ pnpm install
$ pnpm start
```

> Please use [PNPM][pnpm-url] version 8.15 while working on this project.
> Guide on how to install a specific PNPM version can be [found here][pnpm-install-guide-url].

## Git workflow

```bash
# Checkout the default branch and ensure it's up-to-date
$ git checkout main
$ git pull --rebase

# Create a feature branch
$ git checkout -b feature/graphql-subscriptions

# Commit the changes
$ git add .
$ git commit
# Follow the interactive prompt to compose a commit message

# Push
$ git push -u origin feature/graphql-subscriptions
```

We are using [Conventional Commits](https://conventionalcommits.org/) naming convention. It helps us automate library releases and ensure clean and standardized commit tree. Please take a moment to read about the said convention before you name your commits.

> **Tip:** running `git commit` will open an interactive prompt in your terminal. Follow the prompt to compose a valid commit message.

Once you have pushed the changes to your remote feature branch, [create a pull request](https://github.com/open-draft/msw/compare) on GitHub. Undergo the process of code review, where the maintainers of the library will help you get the changes from good to great, and enjoy your implementation merged to the default branch.

> Please be respectful when requesting and going through the code review. Everyone on the team is interested in merging quality and well tested code, and we're hopeful that you have the same goal. It may take some time and iterations to get it right, and we will assist you throughout the process.

## Build

Build the library with the following command:

```bash
$ pnpm build
```

## Tests

### Testing levels

There are two levels of tests on the project:

- [Unit tests](#unit-tests), cover small independent functions.
- [Integration tests](#integration-tests), test in-browser usage scenarios.

**Always begin your implementation from tests**. When tackling an issue, a test for it must be missing, or is incomplete. When working on a feature, starting with a test allows you to model the feature's usage before diving into implementation.

### Unit tests

#### Writing a unit test

Unit tests are placed next to the tested code. For example, if you're testing a newly added `multiply` function, create a `multiply.test.ts` file next to where the function is located:

```bash
$ touch src/utils/multiply.test.ts
```

Proceed by writing a unit test that resembles the usage of the function. Make sure to cover all the scenarios

```ts
// src/utils/multiply.test.ts
import { multiply } from './multiply'

test('multiplies two given numbers', () => {
  expect(multiply(2, 3)).toEqual(6)
})
```

> Please [avoid nesting](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing/) while you're testing.

#### Running a single unit test

Once your test is written, run it in isolation.

```bash
$ pnpm test:unit src/utils/multiply.test.ts
```

At this point, the actual implementation is not ready yet, so you can expect your test to fail. **That's perfect**. Add the necessary modules and logic, and gradually see your test cases pass.

#### Running all unit tests

```bash
$ pnpm test:unit
```

### Integration tests

We follow an example-driven testing paradigm, meaning that each integration test represents a _usage example_. Mock Service Worker can be used in different environments (browser, Node.js), making such usage examples different.

> **Make sure that you [build the library](#build) before running the integration tests**. It's a good idea to keep the build running (`pnpm start`) while working on the tests. Keeping both compiler and test runner in watch mode boosts your productivity.

#### Browser integration tests

Browser integration tests run in [Vitest Browser Mode](https://vitest.dev/guide/browser/) with the Playwright provider. They live under `./test` next to the other integration tests. The file name says where a test runs:

- `*.test.ts` runs in both Node.js and the browser;
- `*.browser.test.ts` runs only in the browser;
- `*.pw.test.ts` uses Playwright directly for the tests that need the full page lifecycle or multiple tabs.

You can find the list of the test suites in [`./test/README.md`](./test/README.md).

Let's write an example integration test that asserts the interception of a GET request:

```ts
// test/protocols/http/example.browser.test.ts
import { http, HttpResponse } from 'msw'
import { defineTestNetwork, expect } from '../../setup/vitest-helpers'

const test = defineTestNetwork({
  handlers: [
    http.get('*/books', () => {
      return HttpResponse.json([
        {
          id: 'ea42ffcb-e729-4dd5-bfac-7a5b645cb1da',
          title: 'The Lord of the Rings',
          publishedAt: -486867600,
        },
      ])
    }),
  ],
})

test('returns a mocked response', async ({ fetch }) => {
  const response = await fetch('/books')

  await expect(response.json()).resolves.toEqual([
    {
      id: 'ea42ffcb-e729-4dd5-bfac-7a5b645cb1da',
      title: 'The Lord of the Rings',
      publishedAt: -486867600,
    },
  ])
})
```

`defineTestNetwork()` starts the worker and resets its handlers before each test. The running instance is available as the `network` fixture.

##### Running all browser tests

Make sure Playwright chromium has been installed before running browser tests.

```sh
pnpm exec playwright install chromium
pnpm test:browser
```

#### Running a single browser test

```sh
pnpm test:browser ./test/protocols/http/example.browser.test.ts
```

The Playwright-based suites have their own commands: `pnpm test:playwright` runs the `*.pw.test.ts` tests, and `pnpm test:modules:browser` runs the tests from `./test/modules/browser`.

#### Node.js integration test

Node.js integration tests live under `./test` as well and use the same `defineTestNetwork()` helper. Their file name ends with `*.node.test.ts` so that they run only in Node.js. A plain `*.test.ts` file, like the example above, runs in both Node.js and the browser.

##### Running all Node.js tests

```sh
pnpm test:node
```

##### Running a single Node.js test

```sh
pnpm test:node ./test/protocols/http/example.node.test.ts
```

## Build

Build the library with the following command:

```bash
$ pnpm build
```

[pnpm-url]: https://pnpm.io/
[page-with-url]: https://github.com/kettanaito/page-with
[pnpm-install-guide-url]: https://pnpm.io/8.x/installation#installing-a-specific-version
