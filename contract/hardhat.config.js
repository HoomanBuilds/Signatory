require("@nomicfoundation/hardhat-ethers")
require("@nomicfoundation/hardhat-chai-matchers")
require("hardhat-deploy")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("solidity-coverage")
require("@nomicfoundation/hardhat-verify")
require("dotenv").config()

const { networkConfig } = require("./helper-hardhat-config")

const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY
const CRONOS_PRIVATE_KEY = process.env.CRONOS_PRIVATE_KEY
const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/your-api-key"
const CRONOS_TESTNET_RPC_URL = process.env.CRONOS_TESTNET_RPC_URL || "https://evm-t3.cronos.org"

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const CRONOSCAN_API_KEY = process.env.CRONOSCAN_API_KEY || ""

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            allowUnlimitedContractSize: true,
        },
        localhost: {
            chainId: 31337,
            allowUnlimitedContractSize: true,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: SEPOLIA_PRIVATE_KEY ? [SEPOLIA_PRIVATE_KEY] : [],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        cronosTestnet: {
            url: CRONOS_TESTNET_RPC_URL,
            accounts: CRONOS_PRIVATE_KEY ? [CRONOS_PRIVATE_KEY] : [],
            chainId: 338,
            blockConfirmations: 6,
        },
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
            cronosTestnet: CRONOSCAN_API_KEY,
        },
        customChains: [
            {
                network: "cronosTestnet",
                chainId: 338,
                urls: {
                    apiURL: "https://explorer-api.cronos.org/testnet/api",
                    browserURL: "https://explorer.cronos.org/testnet",
                },
            },
        ],
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
    },
    namedAccounts: {
        deployer: {
            default: 0,
            // Use networkConfig to set deployer per network
            [networkConfig[31337].name]: 0,
            [networkConfig[11155111].name]: 0,
            [networkConfig[338].name]: 0,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    mocha: {
        timeout: 500000,
    },
}
