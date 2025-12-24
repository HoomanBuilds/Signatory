const { network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    log("----------------------------------------------------")
    log("Deploying AgentNFT...")

    const agentNFT = await deploy("AgentNFT", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: networkConfig[chainId]?.blockConfirmations || 1,
    })

    log(`AgentNFT deployed at ${agentNFT.address}`)
    log("----------------------------------------------------")
}

module.exports.tags = ["all", "nft", "main"]
