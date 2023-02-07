# Message Signing App

This is a React Native app using [Mobile Wallet Adapter (MWA)](https://github.com/solana-mobile/mobile-wallet-adapter) to demonstrate the proposed [Solana Pay message signing specification](https://github.com/solana-labs/solana-pay/blob/master/message-signing-spec.md)

Note that only Android is currently supported

## Demo

https://user-images.githubusercontent.com/1711350/217323682-cb1e897a-90f9-41d0-b0cc-44271032050e.mp4

## Features

- Scan a message signing QR code. You can generate these using [the signing prototype dapp](https://github.com/mcintyre94/signing-prototype-dapp)
- Perform the API requests described in the spec
- Use MWA to sign the message using any installed wallet

## Prerequisites

1. Set up the Android development environment by following the [environment setup instructions](https://reactnative.dev/docs/environment-setup) for your OS.
2. Install at least one mobile wallet adapter compliant wallet app on your device/simulator. You can build and install [`fakewallet`](../../android/fakewallet/) for testing purposes.

## Quick Start

### Android

1. Install dependencies and build the client libraries locally with `yarn`.
2. Start the React Native packager, build the application, and start the simulator with `yarn android`.
