const networkConfig = {
    31337: {
        name: "hardhat",
        blockConfirmations: 1,
    },
    11155111: {
        name: "sepolia",
        blockConfirmations: 6,
    },
    338: {
        name: "cronosTestnet",
        blockConfirmations: 6,
    },
    25: {
        name: "cronos",
        blockConfirmations: 6,
    },
    97: {
        name: "bscTestnet",
        blockConfirmations: 3,
    },
    56: {
        name: "bsc",
        blockConfirmations: 5,
    },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
}
