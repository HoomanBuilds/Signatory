const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { log, get } = deployments
    const { deployer } = await getNamedAccounts()

    log("----------------------------------------------------")
    log("Linking Contracts...")

    const agentCreditsDeployment = await get("AgentCredits")
    const revenueShareDeployment = await get("RevenueShare")

    const agentCredits = await ethers.getContractAt("AgentCredits", agentCreditsDeployment.address)

    // Check if already set to avoid unnecessary transaction
    const currentRevenueShare = await agentCredits.revenueShareContract()

    if (currentRevenueShare !== revenueShareDeployment.address) {
        log(`Setting RevenueShare address in AgentCredits to ${revenueShareDeployment.address}...`)
        const tx = await agentCredits.setRevenueShareContract(revenueShareDeployment.address)
        await tx.wait(1)
        log("Successfully linked AgentCredits to RevenueShare!")
    } else {
        log("AgentCredits already linked to correct RevenueShare address.")
    }

    log("----------------------------------------------------")
}

module.exports.tags = ["all", "link", "main"]
