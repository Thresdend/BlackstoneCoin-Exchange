require('babel-register');
require('babel-polyfill');
const Web3 = require("web3");
const { projectUrl, mnemonicPhrase } = require('./secrets.json');
const HDWalletProvider = require("@truffle/hdwallet-provider");
 
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: mnemonicPhrase
        }, 
        providerOrUrl: projectUrl
      }),
      network_id: '3'
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',

  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
