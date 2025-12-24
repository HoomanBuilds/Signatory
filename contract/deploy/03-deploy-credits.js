const { network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    log("----------------------------------------------------")
    log("Deploying AgentCredits...")

    const credits = await deploy("AgentCredits", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: networkConfig[chainId]?.blockConfirmations || 1,
    })

    log(`AgentCredits deployed at ${credits.address}`)
    log("----------------------------------------------------")
}

module.exports.tags = ["all", "credits", "main"]
