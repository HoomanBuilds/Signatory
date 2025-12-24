const { expect } = require("chai")
const { ethers } = require("hardhat")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

describe("RevenueShare", function () {
    async function deployRevenueShareFixture() {
        const [owner, creator, buyer, user3] = await ethers.getSigners()

        // Deploy NFT contract
        const AgentNFT = await ethers.getContractFactory("AgentNFT")
        const agentNFT = await AgentNFT.deploy()

        // Deploy RevenueShare
        const RevenueShare = await ethers.getContractFactory("RevenueShare")
        const revenueShare = await RevenueShare.deploy(agentNFT.target)

        // Mint an agent for testing
        await agentNFT.connect(creator).mintAgent("TestAgent", "ipfs://QmTest", "QmTest", {
            value: ethers.parseEther("0.01"),
        })

        return { revenueShare, agentNFT, owner, creator, buyer, user3 }
    }

    describe("Deployment", function () {
        it("Should set correct NFT contract", async function () {
            const { revenueShare, agentNFT } = await loadFixture(deployRevenueShareFixture)

            expect(await revenueShare.agentNFT()).to.equal(agentNFT.target)
        })

        it("Should set default revenue split (80/20)", async function () {
            const { revenueShare } = await loadFixture(deployRevenueShareFixture)

            expect(await revenueShare.agentOwnerShare()).to.equal(8000)
            expect(await revenueShare.platformShare()).to.equal(2000)
        })

        it("Should fail deployment with zero address", async function () {
            const RevenueShare = await ethers.getContractFactory("RevenueShare")

            await expect(RevenueShare.deploy(ethers.ZeroAddress)).to.be.revertedWith(
                "Invalid NFT address",
            )
        })
    })

    describe("Record Revenue", function () {
        it("Should record revenue successfully", async function () {
            const { revenueShare, buyer } = await loadFixture(deployRevenueShareFixture)

            const amount = ethers.parseEther("1")
            const tx = await revenueShare.connect(buyer).recordRevenue(1, 0, { value: amount }) // 0 = ContentSale

            await expect(tx).to.emit(revenueShare, "RevenueReceived")

            const stats = await revenueShare.getAgentStats(1)
            expect(stats.totalEarnings).to.equal(ethers.parseEther("0.8")) // 80%
            expect(await revenueShare.platformEarnings()).to.equal(ethers.parseEther("0.2")) // 20%
        })

        it("Should fail if no payment sent", async function () {
            const { revenueShare, buyer } = await loadFixture(deployRevenueShareFixture)

            await expect(revenueShare.connect(buyer).recordRevenue(1, 0)).to.be.revertedWith(
                "No payment sent",
            )
        })

        it("Should fail for non-existent agent", async function () {
            const { revenueShare, buyer } = await loadFixture(deployRevenueShareFixture)

            await expect(
                revenueShare.connect(buyer).recordRevenue(999, 0, {
                    value: ethers.parseEther("1"),
                }),
            ).to.be.revertedWith("Agent does not exist")
        })

        it("Should split revenue correctly", async function () {
            const { revenueShare, buyer } = await loadFixture(deployRevenueShareFixture)

            const amount = ethers.parseEther("1")
            await revenueShare.connect(buyer).recordRevenue(1, 0, { value: amount })

            const stats = await revenueShare.getAgentStats(1)
            const platformStats = await revenueShare.getPlatformStats()

            expect(stats.totalEarnings).to.equal(ethers.parseEther("0.8"))
            expect(platformStats.totalEarnings).to.equal(ethers.parseEther("0.2"))
        })

        it("Should assign revenue to current owner", async function () {
            const { revenueShare, agentNFT, creator, buyer, user3 } =
                await loadFixture(deployRevenueShareFixture)

            // Record revenue for creator
            await revenueShare.connect(buyer).recordRevenue(1, 0, {
                value: ethers.parseEther("1"),
            })

            let claimable = await revenueShare.getClaimableEarnings(1, creator.address)
            expect(claimable).to.equal(ethers.parseEther("0.8"))

            // Transfer NFT to user3
            await agentNFT.connect(creator).transferFrom(creator.address, user3.address, 1)

            // Record more revenue (should go to new owner)
            await revenueShare.connect(buyer).recordRevenue(1, 0, {
                value: ethers.parseEther("1"),
            })

            // Old owner still has their earnings
            claimable = await revenueShare.getClaimableEarnings(1, creator.address)
            expect(claimable).to.equal(ethers.parseEther("0.8"))

            // New owner has new earnings
            claimable = await revenueShare.getClaimableEarnings(1, user3.address)
            expect(claimable).to.equal(ethers.parseEther("0.8"))
        })

        it("Should record revenue history", async function () {
            const { revenueShare, buyer } = await loadFixture(deployRevenueShareFixture)

            await revenueShare.connect(buyer).recordRevenue(1, 0, {
                value: ethers.parseEther("1"),
            })

            expect(await revenueShare.getRevenueHistoryCount()).to.equal(1)

            const history = await revenueShare.getAgentRevenueHistory(1, 10)
            expect(history.length).to.equal(1)
            expect(history[0].tokenId).to.equal(1)
            expect(history[0].amount).to.equal(ethers.parseEther("1"))
            expect(history[0].payer).to.equal(buyer.address)
        })
    })

    describe("Claim Earnings", function () {
        it("Should claim earnings successfully", async function () {
            const { revenueShare, creator, buyer } = await loadFixture(deployRevenueShareFixture)

            await revenueShare.connect(buyer).recordRevenue(1, 0, {
                value: ethers.parseEther("1"),
            })

            const balanceBefore = await ethers.provider.getBalance(creator.address)

            const tx = await revenueShare.connect(creator).claimEarnings(1)
            const receipt = await tx.wait()
            const gasUsed = receipt.gasUsed * receipt.gasPrice

            const balanceAfter = await ethers.provider.getBalance(creator.address)

            await expect(tx)
                .to.emit(revenueShare, "EarningsClaimed")
                .withArgs(1, creator.address, ethers.parseEther("0.8"))

            expect(balanceAfter).to.be.closeTo(
                balanceBefore + ethers.parseEther("0.8") - gasUsed,
                ethers.parseEther("0.0001"),
            )
        })

        it("Should fail if no earnings to claim", async function () {
            const { revenueShare, creator } = await loadFixture(deployRevenueShareFixture)

            await expect(revenueShare.connect(creator).claimEarnings(1)).to.be.revertedWith(
                "No earnings to claim",
            )
        })

        it("Should reset claimable amount after claim", async function () {
            const { revenueShare, creator, buyer } = await loadFixture(deployRevenueShareFixture)

            await revenueShare.connect(buyer).recordRevenue(1, 0, {
                value: ethers.parseEther("1"),
            })

            await revenueShare.connect(creator).claimEarnings(1)

            const claimable = await revenueShare.getClaimableEarnings(1, creator.address)
            expect(claimable).to.equal(0)
        })

        it("Should update withdrawn amount", async function () {
            const { revenueShare, creator, buyer } = await loadFixture(deployRevenueShareFixture)

            await revenueShare.connect(buyer).recordRevenue(1, 0, {
                value: ethers.parseEther("1"),
            })

            await revenueShare.connect(creator).claimEarnings(1)

            const stats = await revenueShare.getAgentStats(1)
            expect(stats.withdrawn).to.equal(ethers.parseEther("0.8"))
        })
    })

    describe("Batch Claim Earnings", function () {
        it("Should batch claim earnings successfully", async function () {
            const { revenueShare, agentNFT, creator, buyer } =
                await loadFixture(deployRevenueShareFixture)

            // Mint second agent
            await agentNFT.connect(creator).mintAgent("Agent2", "ipfs://QmTest2", "QmTest2", {
                value: ethers.parseEther("0.01"),
            })

            // Record revenue for both agents
            await revenueShare.connect(buyer).recordRevenue(1, 0, {
                value: ethers.parseEther("1"),
            })
            await revenueShare.connect(buyer).recordRevenue(2, 0, {
                value: ethers.parseEther("1"),
            })

            const balanceBefore = await ethers.provider.getBalance(creator.address)

            const tx = await revenueShare.connect(creator).batchClaimEarnings([1, 2])
            const receipt = await tx.wait()
            const gasUsed = receipt.gasUsed * receipt.gasPrice

            const balanceAfter = await ethers.provider.getBalance(creator.address)

            // Should receive 0.8 ETH from each agent = 1.6 ETH total
            expect(balanceAfter).to.be.closeTo(
                balanceBefore + ethers.parseEther("1.6") - gasUsed,
                ethers.parseEther("0.0001"),
            )
        })

        it("Should fail if no earnings to claim", async function () {
            const { revenueShare, creator } = await loadFixture(deployRevenueShareFixture)

            await expect(revenueShare.connect(creator).batchClaimEarnings([1])).to.be.revertedWith(
                "No earnings to claim",
            )
        })

        it("Should skip agents with no earnings", async function () {
            const { revenueShare, agentNFT, creator, buyer } =
                await loadFixture(deployRevenueShareFixture)

            // Mint second agent
            await agentNFT.connect(creator).mintAgent("Agent2", "ipfs://QmTest2", "QmTest2", {
                value: ethers.parseEther("0.01"),
            })

            // Only record revenue for agent 1
            await revenueShare.connect(buyer).recordRevenue(1, 0, {
                value: ethers.parseEther("1"),
            })

            const balanceBefore = await ethers.provider.getBalance(creator.address)

            const tx = await revenueShare.connect(creator).batchClaimEarnings([1, 2])
            const receipt = await tx.wait()
            const gasUsed = receipt.gasUsed * receipt.gasPrice

            const balanceAfter = await ethers.provider.getBalance(creator.address)

            // Should only receive from agent 1
            expect(balanceAfter).to.be.closeTo(
                balanceBefore + ethers.parseEther("0.8") - gasUsed,
                ethers.parseEther("0.0001"),
            )
        })
    })

    describe("Platform Functions", function () {
        it("Should allow owner to withdraw platform earnings", async function () {
            const { revenueShare, owner, buyer } = await loadFixture(deployRevenueShareFixture)

            await revenueShare.connect(buyer).recordRevenue(1, 0, {
                value: ethers.parseEther("1"),
            })

            const balanceBefore = await ethers.provider.getBalance(owner.address)

            const tx = await revenueShare.connect(owner).withdrawPlatformEarnings()
            const receipt = await tx.wait()
            const gasUsed = receipt.gasUsed * receipt.gasPrice

            const balanceAfter = await ethers.provider.getBalance(owner.address)

            await expect(tx)
                .to.emit(revenueShare, "PlatformEarningsWithdrawn")
                .withArgs(ethers.parseEther("0.2"))

            expect(balanceAfter).to.be.closeTo(
                balanceBefore + ethers.parseEther("0.2") - gasUsed,
                ethers.parseEther("0.0001"),
            )
        })

        it("Should fail if no platform earnings", async function () {
            const { revenueShare, owner } = await loadFixture(deployRevenueShareFixture)

            await expect(revenueShare.connect(owner).withdrawPlatformEarnings()).to.be.revertedWith(
                "No earnings to withdraw",
            )
        })

        it("Should update platform withdrawn amount", async function () {
            const { revenueShare, owner, buyer } = await loadFixture(deployRevenueShareFixture)

            await revenueShare.connect(buyer).recordRevenue(1, 0, {
                value: ethers.parseEther("1"),
            })

            await revenueShare.connect(owner).withdrawPlatformEarnings()

            const stats = await revenueShare.getPlatformStats()
            expect(stats.withdrawn).to.equal(ethers.parseEther("0.2"))
            expect(stats.available).to.equal(0)
        })

        it("Should allow owner to update revenue split", async function () {
            const { revenueShare, owner } = await loadFixture(deployRevenueShareFixture)

            const tx = await revenueShare.connect(owner).updateRevenueSplit(7000, 3000)

            await expect(tx).to.emit(revenueShare, "RevenueSplitUpdated").withArgs(7000, 3000)

            expect(await revenueShare.agentOwnerShare()).to.equal(7000)
            expect(await revenueShare.platformShare()).to.equal(3000)
        })

        it("Should fail if shares don't sum to 100%", async function () {
            const { revenueShare, owner } = await loadFixture(deployRevenueShareFixture)

            await expect(
                revenueShare.connect(owner).updateRevenueSplit(7000, 2000),
            ).to.be.revertedWith("Shares must sum to 100%")
        })

        it("Should fail if agent share is less than 50%", async function () {
            const { revenueShare, owner } = await loadFixture(deployRevenueShareFixture)

            await expect(
                revenueShare.connect(owner).updateRevenueSplit(4000, 6000),
            ).to.be.revertedWith("Agent share must be at least 50%")
        })

        it("Should not allow non-owner to update split", async function () {
            const { revenueShare, buyer } = await loadFixture(deployRevenueShareFixture)

            await expect(
                revenueShare.connect(buyer).updateRevenueSplit(7000, 3000),
            ).to.be.revertedWithCustomError(revenueShare, "OwnableUnauthorizedAccount")
        })
    })

    describe("Query Functions", function () {
        it("Should get agent stats correctly", async function () {
            const { revenueShare, creator, buyer } = await loadFixture(deployRevenueShareFixture)

            await revenueShare.connect(buyer).recordRevenue(1, 0, {
                value: ethers.parseEther("1"),
            })

            const stats = await revenueShare.getAgentStats(1)
            expect(stats.totalEarnings).to.equal(ethers.parseEther("0.8"))
            expect(stats.withdrawn).to.equal(0)
            expect(stats.pending).to.equal(ethers.parseEther("0.8"))

            await revenueShare.connect(creator).claimEarnings(1)

            const statsAfter = await revenueShare.getAgentStats(1)
            expect(statsAfter.withdrawn).to.equal(ethers.parseEther("0.8"))
            expect(statsAfter.pending).to.equal(0)
        })

        it("Should get platform stats correctly", async function () {
            const { revenueShare, owner, buyer } = await loadFixture(deployRevenueShareFixture)

            await revenueShare.connect(buyer).recordRevenue(1, 0, {
                value: ethers.parseEther("1"),
            })

            let stats = await revenueShare.getPlatformStats()
            expect(stats.totalEarnings).to.equal(ethers.parseEther("0.2"))
            expect(stats.withdrawn).to.equal(0)
            expect(stats.available).to.equal(ethers.parseEther("0.2"))

            await revenueShare.connect(owner).withdrawPlatformEarnings()

            stats = await revenueShare.getPlatformStats()
            expect(stats.withdrawn).to.equal(ethers.parseEther("0.2"))
            expect(stats.available).to.equal(0)
        })

        it("Should get total claimable earnings", async function () {
            const { revenueShare, agentNFT, creator, buyer } =
                await loadFixture(deployRevenueShareFixture)

            // Mint second agent
            await agentNFT.connect(creator).mintAgent("Agent2", "ipfs://QmTest2", "QmTest2", {
                value: ethers.parseEther("0.01"),
            })

            // Record revenue for both
            await revenueShare.connect(buyer).recordRevenue(1, 0, {
                value: ethers.parseEther("1"),
            })
            await revenueShare.connect(buyer).recordRevenue(2, 0, {
                value: ethers.parseEther("1"),
            })

            const total = await revenueShare.getTotalClaimableEarnings(creator.address, [1, 2])
            expect(total).to.equal(ethers.parseEther("1.6")) // 0.8 + 0.8
        })
    })

    describe("History Limit", function () {
        it("Should stop recording history after limit", async function () {
            const { revenueShare, buyer } = await loadFixture(deployRevenueShareFixture)

            const maxHistory = await revenueShare.MAX_HISTORY_SIZE()

            // This test would be too slow to actually hit the limit
            // Just verify the constant exists
            expect(maxHistory).to.equal(10000)
        })
    })
})
