# Contributing

## Prequisites

This project uses [Node.js](https://nodejs.org) to run, so make sure you've got a recent version installed.

[Yarn](https://yarnpkg.com) is used to manage dependencies and run scripts.
After cloning the repository you can use this command to install dependencies:

```sh
yarn
```

## Building

Run the `build` script to compile the TypeScript source code into JavaScript in the `tsc_output` folder.

## Style

This project uses [Prettier](https://prettier.io) to validate the formatting and style across the codebase.

You can run Prettier in the project with this command:

```sh
yarn run style
```

## Linting

This project uses [XO](https://github.com/xojs/xo) (which uses [ESLint](https://eslint.org) and some plugins internally) to perform static analysis of the source code.
It reports issues like unused variables or not following best practices to ensure the project is well-written.

```sh
yarn run lint
```
