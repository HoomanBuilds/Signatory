const { network } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, get } = deployments
    const { deployer } = await getNamedAccounts()

    // Get AgentNFT address
    const agentNFT = await get("AgentNFT")

    console.log("Deploying AgentPKP...")
    console.log("AgentNFT address:", agentNFT.address)

    const agentPKP = await deploy("AgentPKP", {
        from: deployer,
        args: [agentNFT.address],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    console.log("AgentPKP deployed to:", agentPKP.address)
}

module.exports.tags = ["AgentPKP", "all"]
module.exports.dependencies = ["AgentNFT"]
