const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("AgentPKP", function () {
    let agentNFT
    let agentPKP
    let owner
    let user1
    let user2

    // Sample PKP data
    const samplePKPPublicKey = "0x04" + "a".repeat(128) // 65 bytes in hex
    const sampleWalletAddress = "0x361257c63080700Ac6554996AAacEe11E68B8Dd4"
    const samplePKPTokenId = ethers.keccak256(ethers.toUtf8Bytes("sample-pkp-token"))

    beforeEach(async function () {
        ;[owner, user1, user2] = await ethers.getSigners()

        // Deploy AgentNFT
        const AgentNFT = await ethers.getContractFactory("AgentNFT")
        agentNFT = await AgentNFT.deploy()
        await agentNFT.waitForDeployment()

        // Deploy AgentPKP
        const AgentPKP = await ethers.getContractFactory("AgentPKP")
        agentPKP = await AgentPKP.deploy(await agentNFT.getAddress())
        await agentPKP.waitForDeployment()
    })

    describe("Deployment", function () {
        it("Should set the correct AgentNFT address", async function () {
            expect(await agentPKP.agentNFT()).to.equal(await agentNFT.getAddress())
        })

        it("Should set the correct owner", async function () {
            expect(await agentPKP.owner()).to.equal(owner.address)
        })

        it("Should start with zero registrations", async function () {
            expect(await agentPKP.totalRegistered()).to.equal(0)
        })
    })

    describe("Register PKP", function () {
        let tokenId

        beforeEach(async function () {
            // Mint an agent first
            const mintFee = await agentNFT.mintingFee()
            const tx = await agentNFT
                .connect(user1)
                .mintAgent("Test Agent", "ipfs://test-uri", "test-hash", { value: mintFee })
            const receipt = await tx.wait()
            tokenId = 1 // First token
        })

        it("Should register PKP for an agent", async function () {
            await expect(
                agentPKP.registerPKP(
                    tokenId,
                    samplePKPPublicKey,
                    sampleWalletAddress,
                    samplePKPTokenId,
                ),
            )
                .to.emit(agentPKP, "PKPRegistered")
                .withArgs(tokenId, sampleWalletAddress, samplePKPPublicKey, samplePKPTokenId)

            expect(await agentPKP.hasPKP(tokenId)).to.be.true
            expect(await agentPKP.getAgentWallet(tokenId)).to.equal(sampleWalletAddress)
            expect(await agentPKP.totalRegistered()).to.equal(1)
        })

        it("Should fail if agent does not exist", async function () {
            await expect(
                agentPKP.registerPKP(
                    999,
                    samplePKPPublicKey,
                    sampleWalletAddress,
                    samplePKPTokenId,
                ),
            ).to.be.revertedWith("Agent does not exist")
        })

        it("Should fail if PKP already registered", async function () {
            await agentPKP.registerPKP(
                tokenId,
                samplePKPPublicKey,
                sampleWalletAddress,
                samplePKPTokenId,
            )

            const newWallet = "0x1234567890123456789012345678901234567890"
            await expect(
                agentPKP.registerPKP(tokenId, samplePKPPublicKey, newWallet, samplePKPTokenId),
            ).to.be.revertedWith("PKP already registered")
        })

        it("Should fail if wallet already registered to another agent", async function () {
            await agentPKP.registerPKP(
                tokenId,
                samplePKPPublicKey,
                sampleWalletAddress,
                samplePKPTokenId,
            )

            // Mint another agent
            const mintFee = await agentNFT.mintingFee()
            await agentNFT
                .connect(user1)
                .mintAgent("Agent 2", "ipfs://test2", "hash2", { value: mintFee })

            await expect(
                agentPKP.registerPKP(2, samplePKPPublicKey, sampleWalletAddress, samplePKPTokenId),
            ).to.be.revertedWith("Wallet already registered")
        })

        it("Should fail if called by non-owner", async function () {
            await expect(
                agentPKP
                    .connect(user1)
                    .registerPKP(
                        tokenId,
                        samplePKPPublicKey,
                        sampleWalletAddress,
                        samplePKPTokenId,
                    ),
            ).to.be.revertedWithCustomError(agentPKP, "OwnableUnauthorizedAccount")
        })

        it("Should fail with invalid PKP public key length", async function () {
            const badKey = "0x1234" // Too short
            await expect(
                agentPKP.registerPKP(tokenId, badKey, sampleWalletAddress, samplePKPTokenId),
            ).to.be.revertedWith("Invalid PKP public key length")
        })
    })

    describe("Update PKP", function () {
        let tokenId
        const newWallet = "0x1234567890123456789012345678901234567890"
        const newPKPKey = "0x04" + "b".repeat(128)
        const newPKPTokenId = ethers.keccak256(ethers.toUtf8Bytes("new-pkp-token"))

        beforeEach(async function () {
            // Mint and register
            const mintFee = await agentNFT.mintingFee()
            await agentNFT
                .connect(user1)
                .mintAgent("Test Agent", "ipfs://test", "hash", { value: mintFee })
            tokenId = 1
            await agentPKP.registerPKP(
                tokenId,
                samplePKPPublicKey,
                sampleWalletAddress,
                samplePKPTokenId,
            )
        })

        it("Should update PKP", async function () {
            await expect(agentPKP.updatePKP(tokenId, newPKPKey, newWallet, newPKPTokenId))
                .to.emit(agentPKP, "PKPUpdated")
                .withArgs(tokenId, sampleWalletAddress, newWallet)

            expect(await agentPKP.getAgentWallet(tokenId)).to.equal(newWallet)
        })

        it("Should clear old wallet reverse lookup", async function () {
            await agentPKP.updatePKP(tokenId, newPKPKey, newWallet, newPKPTokenId)

            expect(await agentPKP.getAgentByWallet(sampleWalletAddress)).to.equal(0)
            expect(await agentPKP.getAgentByWallet(newWallet)).to.equal(tokenId)
        })

        it("Should fail if PKP not registered", async function () {
            await expect(
                agentPKP.updatePKP(999, newPKPKey, newWallet, newPKPTokenId),
            ).to.be.revertedWith("PKP not registered")
        })
    })

    describe("Query Functions", function () {
        let tokenId

        beforeEach(async function () {
            const mintFee = await agentNFT.mintingFee()
            await agentNFT
                .connect(user1)
                .mintAgent("Test Agent", "ipfs://test", "hash", { value: mintFee })
            tokenId = 1
            await agentPKP.registerPKP(
                tokenId,
                samplePKPPublicKey,
                sampleWalletAddress,
                samplePKPTokenId,
            )
        })

        it("Should return correct PKP info", async function () {
            const info = await agentPKP.getPKPInfo(tokenId)
            expect(info._evmAddress).to.equal(sampleWalletAddress)
            expect(info.agentOwner).to.equal(user1.address)
        })

        it("Should return agent by wallet", async function () {
            expect(await agentPKP.getAgentByWallet(sampleWalletAddress)).to.equal(tokenId)
        })

        it("Should return zero for unknown wallet", async function () {
            expect(await agentPKP.getAgentByWallet(user2.address)).to.equal(0)
        })
    })

    describe("Admin Functions", function () {
        it("Should update AgentNFT address", async function () {
            const newAddress = user2.address // Just using as placeholder
            await expect(agentPKP.setAgentNFT(newAddress))
                .to.emit(agentPKP, "AgentNFTUpdated")
                .withArgs(newAddress)
        })

        it("Should fail to set zero address", async function () {
            await expect(agentPKP.setAgentNFT(ethers.ZeroAddress)).to.be.revertedWith(
                "Invalid AgentNFT address",
            )
        })
    })
})
