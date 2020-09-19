# PCHAIN Wallet<sup>1.3.0</sup>

## Dependencies

To run PCHAIN Wallet in development you need:

- [Node.js](https://nodejs.org) `v8.x` (use the preferred installation method for your OS)
- [Yarn](https://yarnpkg.com/) package manager


## Initialization

Now you're ready to initialize PCHAIN Wallet for development:

```bash
git clone https://github.com/pchain-org/wallet.git
cd wallet
yarn
```

## Build PCHAIN Wallet

### For Linux

```bash
yarn build:linux
```

### For Mac

```bash
yarn build:mac
```

### For Windows

```bash
yarn build:win
```

## Run PCHAIN Wallet

```bash
yarn start
```


## Generate packages

To build binaries for specific platforms, use the following flags:

### For Linux

```bash
yarn packager:linux
```

### For Mac

```bash
yarn packager:mac
```

### For Windows

```bash
yarn packager:win
```

## Config folder

The data folder for Pchain wallet depends on your operating system:

- Windows `%APPDATA%\piwallet`
- macOS `~/Library/Application\ Support/piwallet`
