const { network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    log("----------------------------------------------------")
    log("Deploying RevenueShare...")

    // Get AgentNFT address (deployed in previous step)
    const agentNFT = await get("AgentNFT")

    const revenueShare = await deploy("RevenueShare", {
        from: deployer,
        args: [agentNFT.address],
        log: true,
        waitConfirmations: networkConfig[chainId]?.blockConfirmations || 1,
    })

    log(`RevenueShare deployed at ${revenueShare.address}`)
    log(`RevenueShare linked to AgentNFT at ${agentNFT.address}`)
    log("----------------------------------------------------")
}

module.exports.tags = ["all", "revenue", "main"]
