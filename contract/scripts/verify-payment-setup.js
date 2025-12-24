const { ethers } = require("hardhat")
require("dotenv").config()

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Verifying payment setup...")

    // 1. Get Contract Addresses
    const networkName = network.name
    let creditsAddress, revenueShareAddress, nftAddress

    if (networkName === "localhost" || networkName === "hardhat") {
        creditsAddress = require(`../deployments/${networkName}/AgentCredits.json`).address
        revenueShareAddress = require(`../deployments/${networkName}/RevenueShare.json`).address
        nftAddress = require(`../deployments/${networkName}/AgentNFT.json`).address
    } else {
        creditsAddress = require(`../deployments/${networkName}/AgentCredits.json`).address
        revenueShareAddress = require(`../deployments/${networkName}/RevenueShare.json`).address
        nftAddress = require(`../deployments/${networkName}/AgentNFT.json`).address
    }

    console.log("AgentCredits:", creditsAddress)
    console.log("RevenueShare:", revenueShareAddress)

    // 2. Check Linking
    const credits = await ethers.getContractAt("AgentCredits", creditsAddress)
    const linkedRevenueShare = await credits.revenueShareContract()

    console.log("Linked RevenueShare in Credits:", linkedRevenueShare)

    if (linkedRevenueShare !== revenueShareAddress) {
        console.error("❌ MISMATCH: AgentCredits is linked to the WRONG RevenueShare contract!")
    } else {
        console.log("✅ Linking correct.")
    }

    // 3. Check Agent Wallet Registration (for Agent ID 2, 3, 4 - common ones)
    const revenueShare = await ethers.getContractAt("RevenueShare", revenueShareAddress)
    const agentNFT = await ethers.getContractAt("AgentNFT", nftAddress)

    const agentIds = [2, 3, 4]

    for (const id of agentIds) {
        try {
            const wallet = await revenueShare.agentWallets(id)
            const owner = await agentNFT.ownerOf(id)
            console.log(`\nAgent ID ${id}:`)
            console.log(`- Registered Wallet: ${wallet}`)
            console.log(`- NFT Owner: ${owner}`)

            if (wallet === "0x0000000000000000000000000000000000000000") {
                console.log("⚠️  No wallet registered. Funds will go to NFT Owner.")
            } else {
                console.log("✅ Wallet registered. Funds should go here.")
            }
        } catch (e) {
            console.log(`Agent ${id} does not exist or error fetching data.`)
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
