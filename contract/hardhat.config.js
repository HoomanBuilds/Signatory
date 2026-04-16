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
const BSC_PRIVATE_KEY = process.env.BSC_PRIVATE_KEY
const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/your-api-key"
const CRONOS_TESTNET_RPC_URL = process.env.CRONOS_TESTNET_RPC_URL || "https://evm-t3.cronos.org"
const BSC_TESTNET_RPC_URL = process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545"
const BSC_MAINNET_RPC_URL = process.env.BSC_MAINNET_RPC_URL || "https://bsc-dataseed.binance.org"

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const CRONOSCAN_API_KEY = process.env.CRONOSCAN_API_KEY || ""
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || ""

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
        bscTestnet: {
            url: BSC_TESTNET_RPC_URL,
            accounts: BSC_PRIVATE_KEY ? [BSC_PRIVATE_KEY] : [],
            chainId: 97,
            blockConfirmations: 3,
        },
        bsc: {
            url: BSC_MAINNET_RPC_URL,
            accounts: BSC_PRIVATE_KEY ? [BSC_PRIVATE_KEY] : [],
            chainId: 56,
            blockConfirmations: 5,
        },
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
            cronosTestnet: CRONOSCAN_API_KEY,
            bscTestnet: BSCSCAN_API_KEY,
            bsc: BSCSCAN_API_KEY,
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
            {
                network: "bscTestnet",
                chainId: 97,
                urls: {
                    apiURL: "https://api-testnet.bscscan.com/api",
                    browserURL: "https://testnet.bscscan.com",
                },
            },
            {
                network: "bsc",
                chainId: 56,
                urls: {
                    apiURL: "https://api.bscscan.com/api",
                    browserURL: "https://bscscan.com",
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
            [networkConfig[97].name]: 0,
            [networkConfig[56].name]: 0,
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
