![Wallet Logo](assets/logo.png)

# Cache Wallet

This is the official wallet for the **cache** cryptocurrency. **cache** is built on the [NEM blockchain](https://nem.io). This is a CLI version of the wallet and requires Node 8.0+ to run.

Cache works on top of XEM and you will need a small amount of it to cover fees for transferring cache. Download the NEM Nano Wallet to get some XEM:

[![xem](/assets/xem-wallet.png?raw=true)](https://nem.io/downloads/])

# Getting Started

To install run `npm i -g cache-wallet`.

To see common commands run: `cache` in your terminal. 

Other commands:

To check **cache** balance: `cache balance`

To send **cache** run: `cache send <amt> <public address>` ie `cache send 12.345 TCUPK5-XWIWZK-PZIKKR-7XJ5EO-L6XJJJ-JSYX4X-IQP6`

# Can I Use This Wallet For My Own Cryptocurrency?

Yes! Simply create a namespace and mosaic on the [Nano Wallet](https://nem.io/downloads/) and then replace the data in `src/mosaic-settings.json` with your own data.


# MultiSig

The current version of this app allows creation of a SimpleWallet. Creating BrainWallets or MultiSig accounts is not built yet. If you want to use an existing MultiSig account, export it from the NanoWallet and put it in the wallet path for this app.

# Test vs Production

The npm package for cache-wallet is on the MainNet (production)

This repo is set on the TestNet. You can change this any time.