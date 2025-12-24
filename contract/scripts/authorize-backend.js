const { ethers } = require("hardhat")
require("dotenv").config()

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Authorizing backend wallet with account:", deployer.address)

    // Get backend wallet address from env
    const backendPrivateKey = process.env.BACKEND_PRIVATE_KEY
    if (!backendPrivateKey) {
        throw new Error("BACKEND_PRIVATE_KEY not set in .env file")
    }

    const backendWallet = new ethers.Wallet(backendPrivateKey)
    const backendAddress = backendWallet.address
    console.log("Backend wallet address:", backendAddress)

    // Get deployed contract address
    const networkName = network.name
    let creditsAddress

    if (networkName === "localhost" || networkName === "hardhat") {
        // For localhost, read from deployments
        try {
            const deployment = require(`../deployments/${networkName}/AgentCredits.json`)
            creditsAddress = deployment.address
        } catch (error) {
            console.error("Could not find deployment. Make sure contracts are deployed.")
            process.exit(1)
        }
    } else {
        // For other networks
        const deployment = require(`../deployments/${networkName}/AgentCredits.json`)
        creditsAddress = deployment.address
    }

    console.log("AgentCredits contract:", creditsAddress)

    // Get contract instance
    const credits = await ethers.getContractAt("AgentCredits", creditsAddress)

    // Check if already authorized
    const isAuthorized = await credits.authorizedSpenders(backendAddress)
    console.log("Currently authorized:", isAuthorized)

    if (isAuthorized) {
        console.log("✅ Backend wallet is already authorized!")
        return
    }

    // Authorize backend wallet
    console.log("\nAuthorizing backend wallet...")
    const tx = await credits.setAuthorizedSpender(backendAddress, true)
    console.log("Transaction hash:", tx.hash)

    await tx.wait()
    console.log("✅ Backend wallet authorized successfully!")

    // Verify
    const nowAuthorized = await credits.authorizedSpenders(backendAddress)
    console.log("Verification - Now authorized:", nowAuthorized)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
