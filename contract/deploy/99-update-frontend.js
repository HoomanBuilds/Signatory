const { ethers, network } = require("hardhat")
const fs = require("fs")
const path = require("path")

const FRONTEND_ADDRESSES_FILE = path.join(
    __dirname,
    "../../frontend/src/constants/contractAddresses.json",
)
const FRONTEND_ABI_LOCATION = path.join(__dirname, "../../frontend/src/constants/")

module.exports = async ({ getNamedAccounts, deployments }) => {
    if (process.env.UPDATE_FRONTEND === "true") {
        console.log("Updating frontend...")
        await updateContractAddresses(deployments)
        await updateAbi()
        console.log("Frontend updated!")
    }
}

async function updateContractAddresses(deployments) {
    const { get } = deployments
    const chainId = network.config.chainId.toString()

    // Get all deployed contracts
    const agentNFT = await get("AgentNFT")
    const marketplace = await get("AgentMarketplace")
    const credits = await get("AgentCredits")
    const revenueShare = await get("RevenueShare")
    const agentPKP = await get("AgentPKP")

    const contractAddresses = {
        [chainId]: {
            AgentNFT: agentNFT.address,
            AgentMarketplace: marketplace.address,
            AgentCredits: credits.address,
            RevenueShare: revenueShare.address,
            AgentPKP: agentPKP.address,
        },
    }

    // Create directory if it doesn't exist
    const dir = path.dirname(FRONTEND_ADDRESSES_FILE)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    // Read existing addresses if file exists
    let currentAddresses = {}
    if (fs.existsSync(FRONTEND_ADDRESSES_FILE)) {
        currentAddresses = JSON.parse(fs.readFileSync(FRONTEND_ADDRESSES_FILE, "utf8"))
    }

    // Merge with new addresses
    const updatedAddresses = {
        ...currentAddresses,
        ...contractAddresses,
    }

    fs.writeFileSync(FRONTEND_ADDRESSES_FILE, JSON.stringify(updatedAddresses, null, 2))
    console.log(`Contract addresses written to ${FRONTEND_ADDRESSES_FILE}`)
}

async function updateAbi() {
    const contracts = ["AgentNFT", "AgentMarketplace", "AgentCredits", "RevenueShare", "AgentPKP"]

    // Create directory if it doesn't exist
    if (!fs.existsSync(FRONTEND_ABI_LOCATION)) {
        fs.mkdirSync(FRONTEND_ABI_LOCATION, { recursive: true })
    }

    for (const contractName of contracts) {
        const contract = await ethers.getContractFactory(contractName)
        const abi = contract.interface.formatJson()

        fs.writeFileSync(path.join(FRONTEND_ABI_LOCATION, `${contractName}.json`), abi)
        console.log(`${contractName} ABI written to ${FRONTEND_ABI_LOCATION}`)
    }
}

module.exports.tags = ["all", "frontend"]
