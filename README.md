# Mosaic CLI Wallet

This is a CLI wallet for managing XEM or your own mosaics/cryptocurrencies. This wallet is built on the [NEM blockchain](https://nem.io). Requires Node 8.0+ to run.


# Can I Use This Wallet For My Own Cryptocurrency?

Yes! Simply create a namespace and mosaic on the [Nano Wallet](https://nem.io/downloads/) and then replace the data in `src/mosaic-settings.json` with your own data.


# MultiSig

The current version of this app allows creation of a SimpleWallet. Creating BrainWallets or MultiSig accounts is not built yet. If you want to use an existing MultiSig account, export it from the NanoWallet and put it in the wallet path for this app.

# Test vs Production

The npm package for mosaic-cli-wallet is on the MainNet (production)

This repo is set on the TestNet. You can change this any time.
