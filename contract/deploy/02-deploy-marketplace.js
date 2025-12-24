const { network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    log("----------------------------------------------------")
    log("Deploying AgentMarketplace...")

    const marketplace = await deploy("AgentMarketplace", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: networkConfig[chainId]?.blockConfirmations || 1,
    })

    log(`AgentMarketplace deployed at ${marketplace.address}`)
    log("----------------------------------------------------")
}

module.exports.tags = ["all", "marketplace", "main"]
