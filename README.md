## PlayCanvas codemods

This repo contains any codemods to help with migration of PlayCanvas specific code.

The codemods use jscodeshift and are intended to run with [codemod](https://www.npmjs.com/package/@codemod/cli) or the [codemod vscode extension](https://marketplace.visualstudio.com/items?itemName=codemod.codemod-vscode-extension).

### Available codemods

- [esm-script](./esm-scripts/) - codemod for migrating older `pc.createScript()` scripts to their ESM equivalent.