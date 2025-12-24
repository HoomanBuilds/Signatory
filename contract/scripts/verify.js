const { run } = require("hardhat")

async function verify(contractAddress, args) {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
        console.log("Contract verified!")
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log("Verification failed:", e)
        }
    }
}

async function main() {
    // Replace these with your deployed contract addresses
    const AGENT_NFT_ADDRESS = process.env.AGENT_NFT_ADDRESS || ""
    const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_ADDRESS || ""
    const CREDITS_ADDRESS = process.env.CREDITS_ADDRESS || ""
    const REVENUE_SHARE_ADDRESS = process.env.REVENUE_SHARE_ADDRESS || ""

    if (!AGENT_NFT_ADDRESS) {
        console.log("Please set contract addresses in .env file")
        process.exit(1)
    }

    console.log("Starting verification...\n")

    // Verify AgentNFT
    console.log("Verifying AgentNFT at:", AGENT_NFT_ADDRESS)
    await verify(AGENT_NFT_ADDRESS, [])

    // Verify AgentMarketplace
    console.log("\n Verifying AgentMarketplace at:", MARKETPLACE_ADDRESS)
    await verify(MARKETPLACE_ADDRESS, [])

    // Verify AgentCredits
    console.log("\n Verifying AgentCredits at:", CREDITS_ADDRESS)
    await verify(CREDITS_ADDRESS, [])

    // Verify RevenueShare (needs AgentNFT address as constructor arg)
    console.log("\n Verifying RevenueShare at:", REVENUE_SHARE_ADDRESS)
    await verify(REVENUE_SHARE_ADDRESS, [AGENT_NFT_ADDRESS])

    console.log("\n All contracts verified!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
