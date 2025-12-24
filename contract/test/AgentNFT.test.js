const { expect } = require("chai")
const { ethers } = require("hardhat")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

describe("AgentNFT", function () {
    // Fixture to deploy contract
    async function deployAgentNFTFixture() {
        const [owner, user1, user2, user3] = await ethers.getSigners()

        const AgentNFT = await ethers.getContractFactory("AgentNFT")
        const agentNFT = await AgentNFT.deploy()

        return { agentNFT, owner, user1, user2, user3 }
    }

    describe("Deployment", function () {
        it("Should set the correct name and symbol", async function () {
            const { agentNFT } = await loadFixture(deployAgentNFTFixture)

            expect(await agentNFT.name()).to.equal("AI Agent NFT")
            expect(await agentNFT.symbol()).to.equal("AGENT")
        })

        it("Should set the correct owner", async function () {
            const { agentNFT, owner } = await loadFixture(deployAgentNFTFixture)

            expect(await agentNFT.owner()).to.equal(owner.address)
        })

        it("Should set default minting fee", async function () {
            const { agentNFT } = await loadFixture(deployAgentNFTFixture)

            expect(await agentNFT.mintingFee()).to.equal(ethers.parseEther("0.01"))
        })

        it("Should start with token ID 1", async function () {
            const { agentNFT } = await loadFixture(deployAgentNFTFixture)

            expect(await agentNFT.getNextTokenId()).to.equal(1)
        })
    })

    describe("Minting", function () {
        it("Should mint an agent successfully", async function () {
            const { agentNFT, user1 } = await loadFixture(deployAgentNFTFixture)

            const tx = await agentNFT
                .connect(user1)
                .mintAgent("CyberFox", "ipfs://QmTest123", "QmTest123", {
                    value: ethers.parseEther("0.01"),
                })

            await expect(tx)
                .to.emit(agentNFT, "AgentMinted")
                .withArgs(1, user1.address, "CyberFox", "QmTest123")

            expect(await agentNFT.ownerOf(1)).to.equal(user1.address)
            expect(await agentNFT.totalSupply()).to.equal(1)
        })

        it("Should fail if minting fee is insufficient", async function () {
            const { agentNFT, user1 } = await loadFixture(deployAgentNFTFixture)

            await expect(
                agentNFT.connect(user1).mintAgent("CyberFox", "ipfs://QmTest123", "QmTest123", {
                    value: ethers.parseEther("0.005"),
                }),
            ).to.be.revertedWith("Insufficient minting fee")
        })

        it("Should fail if name is empty", async function () {
            const { agentNFT, user1 } = await loadFixture(deployAgentNFTFixture)

            await expect(
                agentNFT.connect(user1).mintAgent("", "ipfs://QmTest123", "QmTest123", {
                    value: ethers.parseEther("0.01"),
                }),
            ).to.be.revertedWith("Name cannot be empty")
        })

        it("Should fail if token URI is empty", async function () {
            const { agentNFT, user1 } = await loadFixture(deployAgentNFTFixture)

            await expect(
                agentNFT.connect(user1).mintAgent("CyberFox", "", "QmTest123", {
                    value: ethers.parseEther("0.01"),
                }),
            ).to.be.revertedWith("Token URI cannot be empty")
        })

        it("Should store correct metadata", async function () {
            const { agentNFT, user1 } = await loadFixture(deployAgentNFTFixture)

            await agentNFT.connect(user1).mintAgent("CyberFox", "ipfs://QmTest123", "QmTest123", {
                value: ethers.parseEther("0.01"),
            })

            const metadata = await agentNFT.getAgentMetadata(1)

            expect(metadata.name).to.equal("CyberFox")
            expect(metadata.personalityHash).to.equal("QmTest123")
            expect(metadata.creator).to.equal(user1.address)
            expect(metadata.chatCount).to.equal(0)
            expect(metadata.level).to.equal(1)
        })

        it("Should increment token IDs correctly", async function () {
            const { agentNFT, user1, user2 } = await loadFixture(deployAgentNFTFixture)

            await agentNFT.connect(user1).mintAgent("Agent1", "ipfs://QmTest1", "QmTest1", {
                value: ethers.parseEther("0.01"),
            })

            await agentNFT.connect(user2).mintAgent("Agent2", "ipfs://QmTest2", "QmTest2", {
                value: ethers.parseEther("0.01"),
            })

            expect(await agentNFT.totalSupply()).to.equal(2)
            expect(await agentNFT.ownerOf(1)).to.equal(user1.address)
            expect(await agentNFT.ownerOf(2)).to.equal(user2.address)
        })
    })

    describe("Chat Recording", function () {
        it("Should record chat and increment count", async function () {
            const { agentNFT, owner, user1 } = await loadFixture(deployAgentNFTFixture)

            await agentNFT.connect(user1).mintAgent("CyberFox", "ipfs://QmTest123", "QmTest123", {
                value: ethers.parseEther("0.01"),
            })

            const tx = await agentNFT.connect(owner).recordChat(1)

            await expect(tx).to.emit(agentNFT, "ChatRecorded").withArgs(1, 1)

            const metadata = await agentNFT.getAgentMetadata(1)
            expect(metadata.chatCount).to.equal(1)
        })

        it("Should level up after 100 chats", async function () {
            const { agentNFT, owner, user1 } = await loadFixture(deployAgentNFTFixture)

            await agentNFT.connect(user1).mintAgent("CyberFox", "ipfs://QmTest123", "QmTest123", {
                value: ethers.parseEther("0.01"),
            })

            // Record 100 chats
            for (let i = 0; i < 100; i++) {
                await agentNFT.connect(owner).recordChat(1)
            }

            const metadata = await agentNFT.getAgentMetadata(1)
            expect(metadata.chatCount).to.equal(100)
            expect(metadata.level).to.equal(2)
        })

        it("Should only allow owner to record chats", async function () {
            const { agentNFT, user1, user2 } = await loadFixture(deployAgentNFTFixture)

            await agentNFT.connect(user1).mintAgent("CyberFox", "ipfs://QmTest123", "QmTest123", {
                value: ethers.parseEther("0.01"),
            })

            await expect(agentNFT.connect(user2).recordChat(1)).to.be.revertedWithCustomError(
                agentNFT,
                "OwnableUnauthorizedAccount",
            )
        })

        it("Should fail for non-existent agent", async function () {
            const { agentNFT, owner } = await loadFixture(deployAgentNFTFixture)

            await expect(agentNFT.connect(owner).recordChat(999)).to.be.revertedWith(
                "Agent does not exist",
            )
        })
    })

    describe("Query Functions", function () {
        it("Should return agents by owner", async function () {
            const { agentNFT, user1 } = await loadFixture(deployAgentNFTFixture)

            await agentNFT.connect(user1).mintAgent("Agent1", "ipfs://QmTest1", "QmTest1", {
                value: ethers.parseEther("0.01"),
            })

            await agentNFT.connect(user1).mintAgent("Agent2", "ipfs://QmTest2", "QmTest2", {
                value: ethers.parseEther("0.01"),
            })

            const agents = await agentNFT.getAgentsByOwner(user1.address)
            expect(agents.length).to.equal(2)
            expect(agents[0]).to.equal(1)
            expect(agents[1]).to.equal(2)
        })

        it("Should return agents by creator", async function () {
            const { agentNFT, user1 } = await loadFixture(deployAgentNFTFixture)

            await agentNFT.connect(user1).mintAgent("Agent1", "ipfs://QmTest1", "QmTest1", {
                value: ethers.parseEther("0.01"),
            })

            const agents = await agentNFT.getAgentsByCreator(user1.address)
            expect(agents.length).to.equal(1)
            expect(agents[0]).to.equal(1)
        })

        it("Should check if token exists", async function () {
            const { agentNFT, user1 } = await loadFixture(deployAgentNFTFixture)

            await agentNFT.connect(user1).mintAgent("Agent1", "ipfs://QmTest1", "QmTest1", {
                value: ethers.parseEther("0.01"),
            })

            expect(await agentNFT.exists(1)).to.be.true
            expect(await agentNFT.exists(999)).to.be.false
        })
    })

    describe("Admin Functions", function () {
        it("Should allow owner to update minting fee", async function () {
            const { agentNFT, owner } = await loadFixture(deployAgentNFTFixture)

            const newFee = ethers.parseEther("0.02")
            await agentNFT.connect(owner).setMintingFee(newFee)

            expect(await agentNFT.mintingFee()).to.equal(newFee)
        })

        it("Should not allow non-owner to update minting fee", async function () {
            const { agentNFT, user1 } = await loadFixture(deployAgentNFTFixture)

            await expect(
                agentNFT.connect(user1).setMintingFee(ethers.parseEther("0.02")),
            ).to.be.revertedWithCustomError(agentNFT, "OwnableUnauthorizedAccount")
        })

        it("Should allow owner to withdraw funds", async function () {
            const { agentNFT, owner, user1 } = await loadFixture(deployAgentNFTFixture)

            await agentNFT.connect(user1).mintAgent("Agent1", "ipfs://QmTest1", "QmTest1", {
                value: ethers.parseEther("0.01"),
            })

            const balanceBefore = await ethers.provider.getBalance(owner.address)

            const tx = await agentNFT.connect(owner).withdraw()
            const receipt = await tx.wait()
            const gasUsed = receipt.gasUsed * receipt.gasPrice

            const balanceAfter = await ethers.provider.getBalance(owner.address)

            expect(balanceAfter).to.be.closeTo(
                balanceBefore + ethers.parseEther("0.01") - gasUsed,
                ethers.parseEther("0.0001"),
            )
        })
    })

    describe("Burning", function () {
        it("Should allow owner to burn their agent", async function () {
            const { agentNFT, user1 } = await loadFixture(deployAgentNFTFixture)

            await agentNFT.connect(user1).mintAgent("Agent1", "ipfs://QmTest1", "QmTest1", {
                value: ethers.parseEther("0.01"),
            })

            await agentNFT.connect(user1).burn(1)

            expect(await agentNFT.exists(1)).to.be.false
        })

        it("Should not allow non-owner to burn agent", async function () {
            const { agentNFT, user1, user2 } = await loadFixture(deployAgentNFTFixture)

            await agentNFT.connect(user1).mintAgent("Agent1", "ipfs://QmTest1", "QmTest1", {
                value: ethers.parseEther("0.01"),
            })

            await expect(agentNFT.connect(user2).burn(1)).to.be.revertedWith("Not the owner")
        })
    })

    describe("Top Agents By Chats", function () {
        it("Should return top agents sorted by chat count", async function () {
            const { agentNFT, owner, user1, user2 } = await loadFixture(deployAgentNFTFixture)

            // Mint two agents
            await agentNFT.connect(user1).mintAgent("Agent1", "ipfs://QmTest1", "QmTest1", {
                value: ethers.parseEther("0.01"),
            })
            await agentNFT.connect(user2).mintAgent("Agent2", "ipfs://QmTest2", "QmTest2", {
                value: ethers.parseEther("0.01"),
            })

            // Agent 2 has more chats
            await agentNFT.connect(owner).recordChat(1) // 1 chat
            await agentNFT.connect(owner).recordChat(2) // 1 chat
            await agentNFT.connect(owner).recordChat(2) // 2 chats
            await agentNFT.connect(owner).recordChat(2) // 3 chats

            const [tokenIds, chatCounts, names] = await agentNFT.getTopAgentsByChats(10)

            expect(tokenIds.length).to.equal(2)
            // Agent2 should be first (more chats)
            expect(tokenIds[0]).to.equal(2)
            expect(chatCounts[0]).to.equal(3)
            expect(names[0]).to.equal("Agent2")
            // Agent1 second
            expect(tokenIds[1]).to.equal(1)
            expect(chatCounts[1]).to.equal(1)
            expect(names[1]).to.equal("Agent1")
        })

        it("Should return empty arrays when no agents exist", async function () {
            const { agentNFT } = await loadFixture(deployAgentNFTFixture)

            const [tokenIds, chatCounts, names] = await agentNFT.getTopAgentsByChats(10)

            expect(tokenIds.length).to.equal(0)
            expect(chatCounts.length).to.equal(0)
            expect(names.length).to.equal(0)
        })

        it("Should cap results at MAX_LEADERBOARD_LIMIT", async function () {
            const { agentNFT } = await loadFixture(deployAgentNFTFixture)

            const maxLimit = await agentNFT.MAX_LEADERBOARD_LIMIT()
            expect(maxLimit).to.equal(100)

            // Should not error even with high limit request
            const [tokenIds, chatCounts, names] = await agentNFT.getTopAgentsByChats(200)
            expect(tokenIds.length).to.equal(0) // No agents minted
        })

        it("Should respect limit parameter", async function () {
            const { agentNFT, user1, user2, user3 } = await loadFixture(deployAgentNFTFixture)

            // Mint 3 agents
            await agentNFT.connect(user1).mintAgent("Agent1", "ipfs://QmTest1", "QmTest1", {
                value: ethers.parseEther("0.01"),
            })
            await agentNFT.connect(user2).mintAgent("Agent2", "ipfs://QmTest2", "QmTest2", {
                value: ethers.parseEther("0.01"),
            })
            await agentNFT.connect(user3).mintAgent("Agent3", "ipfs://QmTest3", "QmTest3", {
                value: ethers.parseEther("0.01"),
            })

            // Request only top 2
            const [tokenIds, chatCounts, names] = await agentNFT.getTopAgentsByChats(2)

            expect(tokenIds.length).to.equal(2)
        })

        it("Should exclude burned agents from leaderboard", async function () {
            const { agentNFT, owner, user1, user2 } = await loadFixture(deployAgentNFTFixture)

            // Mint two agents
            await agentNFT.connect(user1).mintAgent("Agent1", "ipfs://QmTest1", "QmTest1", {
                value: ethers.parseEther("0.01"),
            })
            await agentNFT.connect(user2).mintAgent("Agent2", "ipfs://QmTest2", "QmTest2", {
                value: ethers.parseEther("0.01"),
            })

            // Add chats to both
            await agentNFT.connect(owner).recordChat(1)
            await agentNFT.connect(owner).recordChat(2)

            // Burn agent 1
            await agentNFT.connect(user1).burn(1)

            const [tokenIds, chatCounts, names] = await agentNFT.getTopAgentsByChats(10)

            // Only agent 2 should appear
            expect(tokenIds.length).to.equal(1)
            expect(tokenIds[0]).to.equal(2)
        })

        it("Should return paginated agents with chat counts", async function () {
            const { agentNFT, user1 } = await loadFixture(deployAgentNFTFixture)

            // Mint 3 agents
            await agentNFT.connect(user1).mintAgent("Agent1", "ipfs://QmTest1", "QmTest1", {
                value: ethers.parseEther("0.01"),
            })
            await agentNFT.connect(user1).mintAgent("Agent2", "ipfs://QmTest2", "QmTest2", {
                value: ethers.parseEther("0.01"),
            })
            await agentNFT.connect(user1).mintAgent("Agent3", "ipfs://QmTest3", "QmTest3", {
                value: ethers.parseEther("0.01"),
            })

            // Get second page (offset 1, limit 2)
            const [tokenIds, chatCounts] = await agentNFT.getAgentsWithChatCounts(1, 2)

            expect(tokenIds.length).to.equal(2)
            expect(tokenIds[0]).to.equal(2)
            expect(tokenIds[1]).to.equal(3)
        })
    })
})
