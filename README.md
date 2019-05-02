# PCHAIN Wallet<sup>1.0.2</sup>

### Dependencies

To run PCHAIN Wallet in development you need:

- [Node.js](https://nodejs.org) `v8.x` (use the preferred installation method for your OS)
- [Yarn](https://yarnpkg.com/) package manager


### Installation

Now you're ready to initialize PCHAIN Wallet for development:

```bash
$ git clone https://github.com/pchain-org/wallet.git
$ cd wallet
$ yarn
```

### Post-installation

To build libraries for your specific platform, use one of the following flags:

```bash
$ yarn build:linux #for Linux
$ yarn build:mac   #for Mac
$ yarn build:win   #for Windows
```

### Run PCHAIN Wallet

```bash
$ yarn start
```

### Generate packages

To build binaries for your specific platform, use one of the following flags:

```bash
$ yarn packager:linux #for Linux
$ yarn packager:mac   #for Mac
$ yarn packager:win   #for Windows
```

### Config folder

The data folder for Pchain wallet depends on your operating system:

- Windows `%APPDATA%\piwallet`
- macOS `~/Library/Application\ Support/piwallet`
