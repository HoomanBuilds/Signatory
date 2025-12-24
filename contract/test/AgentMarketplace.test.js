const { expect } = require("chai")
const { ethers } = require("hardhat")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

describe("AgentMarketplace", function () {
    async function deployMarketplaceFixture() {
        const [owner, seller, buyer, user3] = await ethers.getSigners()

        // Deploy NFT contract
        const AgentNFT = await ethers.getContractFactory("AgentNFT")
        const agentNFT = await AgentNFT.deploy()

        // Deploy Marketplace
        const AgentMarketplace = await ethers.getContractFactory("AgentMarketplace")
        const marketplace = await AgentMarketplace.deploy()

        // Mint an agent for testing
        await agentNFT.connect(seller).mintAgent("TestAgent", "ipfs://QmTest", "QmTest", {
            value: ethers.parseEther("0.01"),
        })

        return { marketplace, agentNFT, owner, seller, buyer, user3 }
    }

    describe("Deployment", function () {
        it("Should set correct owner", async function () {
            const { marketplace, owner } = await loadFixture(deployMarketplaceFixture)

            expect(await marketplace.owner()).to.equal(owner.address)
        })

        it("Should set default marketplace fee to 5%", async function () {
            const { marketplace } = await loadFixture(deployMarketplaceFixture)

            expect(await marketplace.marketplaceFee()).to.equal(500)
        })

        it("Should initialize stats to zero", async function () {
            const { marketplace } = await loadFixture(deployMarketplaceFixture)

            const stats = await marketplace.getMarketplaceStats()
            expect(stats._totalListings).to.equal(0)
            expect(stats._totalSales).to.equal(0)
            expect(stats._totalVolume).to.equal(0)
        })
    })

    describe("Listing", function () {
        it("Should list an agent successfully", async function () {
            const { marketplace, agentNFT, seller } = await loadFixture(deployMarketplaceFixture)

            await agentNFT.connect(seller).approve(marketplace.target, 1)

            const price = ethers.parseEther("1")
            const tx = await marketplace.connect(seller).listAgent(agentNFT.target, 1, price)

            await expect(tx)
                .to.emit(marketplace, "AgentListed")
                .withArgs(agentNFT.target, 1, seller.address, price)

            const listing = await marketplace.getListing(agentNFT.target, 1)
            expect(listing.seller).to.equal(seller.address)
            expect(listing.price).to.equal(price)
            expect(listing.active).to.be.true
        })

        it("Should fail if price is zero", async function () {
            const { marketplace, agentNFT, seller } = await loadFixture(deployMarketplaceFixture)

            await agentNFT.connect(seller).approve(marketplace.target, 1)

            await expect(
                marketplace.connect(seller).listAgent(agentNFT.target, 1, 0),
            ).to.be.revertedWith("Price must be greater than 0")
        })

        it("Should fail if not the owner", async function () {
            const { marketplace, agentNFT, buyer } = await loadFixture(deployMarketplaceFixture)

            await expect(
                marketplace.connect(buyer).listAgent(agentNFT.target, 1, ethers.parseEther("1")),
            ).to.be.revertedWith("Not the owner")
        })

        it("Should fail if marketplace not approved", async function () {
            const { marketplace, agentNFT, seller } = await loadFixture(deployMarketplaceFixture)

            await expect(
                marketplace.connect(seller).listAgent(agentNFT.target, 1, ethers.parseEther("1")),
            ).to.be.revertedWith("Marketplace not approved")
        })

        it("Should fail if already listed", async function () {
            const { marketplace, agentNFT, seller } = await loadFixture(deployMarketplaceFixture)

            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, ethers.parseEther("1"))

            await expect(
                marketplace.connect(seller).listAgent(agentNFT.target, 1, ethers.parseEther("1")),
            ).to.be.revertedWith("Already listed")
        })
    })

    describe("Buying", function () {
        it("Should buy a listed agent successfully", async function () {
            const { marketplace, agentNFT, seller, buyer } =
                await loadFixture(deployMarketplaceFixture)

            const price = ethers.parseEther("1")

            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, price)

            const sellerBalanceBefore = await ethers.provider.getBalance(seller.address)

            const tx = await marketplace
                .connect(buyer)
                .buyAgent(agentNFT.target, 1, { value: price })

            await expect(tx)
                .to.emit(marketplace, "AgentSold")
                .withArgs(agentNFT.target, 1, seller.address, buyer.address, price)

            // Check NFT transferred
            expect(await agentNFT.ownerOf(1)).to.equal(buyer.address)

            // Check seller received payment (95% after 5% fee)
            const sellerBalanceAfter = await ethers.provider.getBalance(seller.address)
            const expectedProceeds = (price * 9500n) / 10000n
            expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(expectedProceeds)

            // Check listing deactivated
            const listing = await marketplace.getListing(agentNFT.target, 1)
            expect(listing.active).to.be.false
        })

        it("Should fail if agent not listed", async function () {
            const { marketplace, agentNFT, buyer } = await loadFixture(deployMarketplaceFixture)

            await expect(
                marketplace
                    .connect(buyer)
                    .buyAgent(agentNFT.target, 1, { value: ethers.parseEther("1") }),
            ).to.be.revertedWith("Agent not listed")
        })

        it("Should fail if insufficient payment", async function () {
            const { marketplace, agentNFT, seller, buyer } =
                await loadFixture(deployMarketplaceFixture)

            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, ethers.parseEther("1"))

            await expect(
                marketplace
                    .connect(buyer)
                    .buyAgent(agentNFT.target, 1, { value: ethers.parseEther("0.5") }),
            ).to.be.revertedWith("Insufficient payment")
        })

        it("Should fail if buyer is seller", async function () {
            const { marketplace, agentNFT, seller } = await loadFixture(deployMarketplaceFixture)

            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, ethers.parseEther("1"))

            await expect(
                marketplace
                    .connect(seller)
                    .buyAgent(agentNFT.target, 1, { value: ethers.parseEther("1") }),
            ).to.be.revertedWith("Cannot buy your own agent")
        })

        it("Should refund excess payment", async function () {
            const { marketplace, agentNFT, seller, buyer } =
                await loadFixture(deployMarketplaceFixture)

            const price = ethers.parseEther("1")
            const overpayment = ethers.parseEther("1.5")

            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, price)

            const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address)

            const tx = await marketplace
                .connect(buyer)
                .buyAgent(agentNFT.target, 1, { value: overpayment })

            const receipt = await tx.wait()
            const gasUsed = receipt.gasUsed * receipt.gasPrice

            const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address)

            // Buyer should only pay the listing price + gas
            expect(buyerBalanceBefore - buyerBalanceAfter).to.be.closeTo(
                price + gasUsed,
                ethers.parseEther("0.0001"),
            )
        })

        it("Should update marketplace stats", async function () {
            const { marketplace, agentNFT, seller, buyer } =
                await loadFixture(deployMarketplaceFixture)

            const price = ethers.parseEther("1")

            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, price)

            await marketplace.connect(buyer).buyAgent(agentNFT.target, 1, { value: price })

            const stats = await marketplace.getMarketplaceStats()
            expect(stats._totalListings).to.equal(1)
            expect(stats._totalSales).to.equal(1)
            expect(stats._totalVolume).to.equal(price)
        })
    })

    describe("Cancel Listing", function () {
        it("Should cancel listing successfully", async function () {
            const { marketplace, agentNFT, seller } = await loadFixture(deployMarketplaceFixture)

            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, ethers.parseEther("1"))

            const tx = await marketplace.connect(seller).cancelListing(agentNFT.target, 1)

            await expect(tx)
                .to.emit(marketplace, "ListingCancelled")
                .withArgs(agentNFT.target, 1, seller.address)

            const listing = await marketplace.getListing(agentNFT.target, 1)
            expect(listing.active).to.be.false
        })

        it("Should fail if not listed", async function () {
            const { marketplace, agentNFT, seller } = await loadFixture(deployMarketplaceFixture)

            await expect(
                marketplace.connect(seller).cancelListing(agentNFT.target, 1),
            ).to.be.revertedWith("Agent not listed")
        })

        it("Should fail if not the seller", async function () {
            const { marketplace, agentNFT, seller, buyer } =
                await loadFixture(deployMarketplaceFixture)

            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, ethers.parseEther("1"))

            await expect(
                marketplace.connect(buyer).cancelListing(agentNFT.target, 1),
            ).to.be.revertedWith("Not the seller")
        })
    })

    describe("Update Price", function () {
        it("Should update price successfully", async function () {
            const { marketplace, agentNFT, seller } = await loadFixture(deployMarketplaceFixture)

            const oldPrice = ethers.parseEther("1")
            const newPrice = ethers.parseEther("2")

            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, oldPrice)

            const tx = await marketplace.connect(seller).updatePrice(agentNFT.target, 1, newPrice)

            await expect(tx)
                .to.emit(marketplace, "PriceUpdated")
                .withArgs(agentNFT.target, 1, oldPrice, newPrice)

            const listing = await marketplace.getListing(agentNFT.target, 1)
            expect(listing.price).to.equal(newPrice)
        })

        it("Should fail if new price is zero", async function () {
            const { marketplace, agentNFT, seller } = await loadFixture(deployMarketplaceFixture)

            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, ethers.parseEther("1"))

            await expect(
                marketplace.connect(seller).updatePrice(agentNFT.target, 1, 0),
            ).to.be.revertedWith("Price must be greater than 0")
        })

        it("Should fail if not the seller", async function () {
            const { marketplace, agentNFT, seller, buyer } =
                await loadFixture(deployMarketplaceFixture)

            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, ethers.parseEther("1"))

            await expect(
                marketplace.connect(buyer).updatePrice(agentNFT.target, 1, ethers.parseEther("2")),
            ).to.be.revertedWith("Not the seller")
        })
    })

    describe("Admin Functions", function () {
        it("Should allow owner to update marketplace fee", async function () {
            const { marketplace, owner } = await loadFixture(deployMarketplaceFixture)

            await marketplace.connect(owner).setMarketplaceFee(300) // 3%

            expect(await marketplace.marketplaceFee()).to.equal(300)
        })

        it("Should fail if fee exceeds 10%", async function () {
            const { marketplace, owner } = await loadFixture(deployMarketplaceFixture)

            await expect(marketplace.connect(owner).setMarketplaceFee(1100)).to.be.revertedWith(
                "Fee cannot exceed 10%",
            )
        })

        it("Should allow owner to withdraw fees", async function () {
            const { marketplace, agentNFT, owner, seller, buyer } =
                await loadFixture(deployMarketplaceFixture)

            const price = ethers.parseEther("1")

            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, price)
            await marketplace.connect(buyer).buyAgent(agentNFT.target, 1, { value: price })

            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address)

            const tx = await marketplace.connect(owner).withdraw()
            const receipt = await tx.wait()
            const gasUsed = receipt.gasUsed * receipt.gasPrice

            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address)

            const expectedFee = (price * 500n) / 10000n // 5% fee
            expect(ownerBalanceAfter - ownerBalanceBefore + gasUsed).to.be.closeTo(
                expectedFee,
                ethers.parseEther("0.0001"),
            )
        })
    })

    describe("Query Functions", function () {
        it("Should check if agent is listed", async function () {
            const { marketplace, agentNFT, seller } = await loadFixture(deployMarketplaceFixture)

            expect(await marketplace.isListed(agentNFT.target, 1)).to.be.false

            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, ethers.parseEther("1"))

            expect(await marketplace.isListed(agentNFT.target, 1)).to.be.true
        })
    })

    describe("Top Seller Tracking", function () {
        it("Should track seller sales count after a sale", async function () {
            const { marketplace, agentNFT, seller, buyer } =
                await loadFixture(deployMarketplaceFixture)

            const price = ethers.parseEther("1")

            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, price)
            await marketplace.connect(buyer).buyAgent(agentNFT.target, 1, { value: price })

            const stats = await marketplace.getUserSalesStats(seller.address)
            expect(stats.salesCount).to.equal(1)
            expect(stats.salesVolume).to.equal(price)
        })

        it("Should track multiple sales from same seller", async function () {
            const { marketplace, agentNFT, seller, buyer } =
                await loadFixture(deployMarketplaceFixture)

            const price = ethers.parseEther("1")

            // Mint second NFT
            await agentNFT.connect(seller).mintAgent("TestAgent2", "ipfs://QmTest2", "QmTest2", {
                value: ethers.parseEther("0.01"),
            })

            // List and sell both NFTs
            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await agentNFT.connect(seller).approve(marketplace.target, 2)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, price)
            await marketplace.connect(seller).listAgent(agentNFT.target, 2, price)

            await marketplace.connect(buyer).buyAgent(agentNFT.target, 1, { value: price })
            await marketplace.connect(buyer).buyAgent(agentNFT.target, 2, { value: price })

            const stats = await marketplace.getUserSalesStats(seller.address)
            expect(stats.salesCount).to.equal(2)
            expect(stats.salesVolume).to.equal(price * 2n)
        })

        it("Should return top sellers by sales count", async function () {
            const { marketplace, agentNFT, owner, seller, buyer, user3 } =
                await loadFixture(deployMarketplaceFixture)

            const price = ethers.parseEther("1")

            // Seller already has 1 NFT, mint one for user3
            await agentNFT.connect(user3).mintAgent("User3Agent", "ipfs://QmTest3", "QmTest3", {
                value: ethers.parseEther("0.01"),
            })

            // Seller sells 1 NFT
            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, price)
            await marketplace.connect(buyer).buyAgent(agentNFT.target, 1, { value: price })

            // user3 sells 1 NFT
            await agentNFT.connect(user3).approve(marketplace.target, 2)
            await marketplace.connect(user3).listAgent(agentNFT.target, 2, price)
            await marketplace.connect(buyer).buyAgent(agentNFT.target, 2, { value: price })

            const [sellers, counts] = await marketplace.getTopSellersBySalesCount(10)
            expect(sellers.length).to.equal(2)
            expect(counts[0]).to.equal(1)
            expect(counts[1]).to.equal(1)
        })

        it("Should return top sellers by volume", async function () {
            const { marketplace, agentNFT, seller, buyer, user3 } =
                await loadFixture(deployMarketplaceFixture)

            // Mint NFT for user3
            await agentNFT.connect(user3).mintAgent("User3Agent", "ipfs://QmTest3", "QmTest3", {
                value: ethers.parseEther("0.01"),
            })

            // Seller sells for 1 ETH
            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, ethers.parseEther("1"))
            await marketplace
                .connect(buyer)
                .buyAgent(agentNFT.target, 1, { value: ethers.parseEther("1") })

            // user3 sells for 2 ETH
            await agentNFT.connect(user3).approve(marketplace.target, 2)
            await marketplace.connect(user3).listAgent(agentNFT.target, 2, ethers.parseEther("2"))
            await marketplace
                .connect(buyer)
                .buyAgent(agentNFT.target, 2, { value: ethers.parseEther("2") })

            const [sellers, volumes] = await marketplace.getTopSellersByVolume(10)
            expect(sellers.length).to.equal(2)
            // user3 should be first (higher volume)
            expect(sellers[0]).to.equal(user3.address)
            expect(volumes[0]).to.equal(ethers.parseEther("2"))
        })

        it("Should cap results at MAX_LEADERBOARD_LIMIT", async function () {
            const { marketplace } = await loadFixture(deployMarketplaceFixture)

            const maxLimit = await marketplace.MAX_LEADERBOARD_LIMIT()
            expect(maxLimit).to.equal(100)

            // Even if we request more, it should not error (returns 0 since no sales)
            const [sellers, counts] = await marketplace.getTopSellersBySalesCount(200)
            expect(sellers.length).to.equal(0)
        })

        it("Should return total sellers count", async function () {
            const { marketplace, agentNFT, seller, buyer } =
                await loadFixture(deployMarketplaceFixture)

            expect(await marketplace.getTotalSellersCount()).to.equal(0)

            const price = ethers.parseEther("1")
            await agentNFT.connect(seller).approve(marketplace.target, 1)
            await marketplace.connect(seller).listAgent(agentNFT.target, 1, price)
            await marketplace.connect(buyer).buyAgent(agentNFT.target, 1, { value: price })

            expect(await marketplace.getTotalSellersCount()).to.equal(1)
        })
    })
})
