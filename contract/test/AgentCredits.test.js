const { expect } = require("chai")
const { ethers } = require("hardhat")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

describe("AgentCredits", function () {
    async function deployCreditsFixture() {
        const [owner, user1, user2, backend] = await ethers.getSigners()

        const AgentCredits = await ethers.getContractFactory("AgentCredits")
        const credits = await AgentCredits.deploy()

        return { credits, owner, user1, user2, backend }
    }

    describe("Deployment", function () {
        it("Should set correct token name and symbol", async function () {
            const { credits } = await loadFixture(deployCreditsFixture)

            expect(await credits.name()).to.equal("Agent Credits")
            expect(await credits.symbol()).to.equal("ACRED")
        })

        it("Should set default credit price", async function () {
            const { credits } = await loadFixture(deployCreditsFixture)

            expect(await credits.creditPrice()).to.equal(ethers.parseEther("0.0001"))
        })

        it("Should set default free tier credits", async function () {
            const { credits } = await loadFixture(deployCreditsFixture)

            expect(await credits.freeTierCredits()).to.equal(10)
        })

        it("Should initialize 3 default plans", async function () {
            const { credits } = await loadFixture(deployCreditsFixture)

            expect(await credits.planCount()).to.equal(3)

            const plan0 = await credits.getPlan(0)
            expect(plan0.credits).to.equal(100)
            expect(plan0.price).to.equal(ethers.parseEther("0.009"))
            expect(plan0.discountPercent).to.equal(10)
            expect(plan0.active).to.be.true
        })
    })

    describe("Purchase Credits", function () {
        it("Should purchase credits successfully", async function () {
            const { credits, user1 } = await loadFixture(deployCreditsFixture)

            const amount = 100
            const cost = ethers.parseEther("0.01") // 100 * 0.0001

            const tx = await credits.connect(user1).purchaseCredits(amount, { value: cost })

            await expect(tx)
                .to.emit(credits, "CreditsPurchased")
                .withArgs(user1.address, amount, cost)

            expect(await credits.balanceOf(user1.address)).to.equal(amount)
        })

        it("Should fail if amount is zero", async function () {
            const { credits, user1 } = await loadFixture(deployCreditsFixture)

            await expect(
                credits.connect(user1).purchaseCredits(0, { value: ethers.parseEther("0.01") }),
            ).to.be.revertedWith("Amount must be greater than 0")
        })

        it("Should fail if insufficient payment", async function () {
            const { credits, user1 } = await loadFixture(deployCreditsFixture)

            await expect(
                credits.connect(user1).purchaseCredits(100, { value: ethers.parseEther("0.005") }),
            ).to.be.revertedWith("Insufficient payment")
        })

        it("Should refund excess payment", async function () {
            const { credits, user1 } = await loadFixture(deployCreditsFixture)

            const amount = 100
            const cost = ethers.parseEther("0.01")
            const overpayment = ethers.parseEther("0.02")

            const balanceBefore = await ethers.provider.getBalance(user1.address)

            const tx = await credits.connect(user1).purchaseCredits(amount, { value: overpayment })

            const receipt = await tx.wait()
            const gasUsed = receipt.gasUsed * receipt.gasPrice

            const balanceAfter = await ethers.provider.getBalance(user1.address)

            expect(balanceBefore - balanceAfter).to.be.closeTo(
                cost + gasUsed,
                ethers.parseEther("0.0001"),
            )
        })
    })

    describe("Purchase Plans", function () {
        it("Should purchase plan successfully", async function () {
            const { credits, user1 } = await loadFixture(deployCreditsFixture)

            const plan = await credits.getPlan(0)
            const tx = await credits.connect(user1).purchasePlan(0, { value: plan.price })

            await expect(tx)
                .to.emit(credits, "PlanPurchased")
                .withArgs(user1.address, 0, plan.credits, plan.price)

            expect(await credits.balanceOf(user1.address)).to.equal(plan.credits)
        })

        it("Should fail for invalid plan ID", async function () {
            const { credits, user1 } = await loadFixture(deployCreditsFixture)

            await expect(
                credits.connect(user1).purchasePlan(999, { value: ethers.parseEther("0.01") }),
            ).to.be.revertedWith("Invalid plan ID")
        })

        it("Should fail if plan is not active", async function () {
            const { credits, owner, user1 } = await loadFixture(deployCreditsFixture)

            await credits.connect(owner).updatePlanStatus(0, false)

            const plan = await credits.getPlan(0)
            await expect(
                credits.connect(user1).purchasePlan(0, { value: plan.price }),
            ).to.be.revertedWith("Plan is not active")
        })

        it("Should fail if insufficient payment", async function () {
            const { credits, user1 } = await loadFixture(deployCreditsFixture)

            await expect(
                credits.connect(user1).purchasePlan(0, { value: ethers.parseEther("0.001") }),
            ).to.be.revertedWith("Insufficient payment")
        })
    })

    describe("Free Tier", function () {
        it("Should claim free tier successfully", async function () {
            const { credits, user1 } = await loadFixture(deployCreditsFixture)

            const tx = await credits.connect(user1).claimFreeTier()

            await expect(tx).to.emit(credits, "FreeTierClaimed").withArgs(user1.address, 10)

            expect(await credits.balanceOf(user1.address)).to.equal(10)
            expect(await credits.hasClaimedFreeTier(user1.address)).to.be.true
        })

        it("Should fail if already claimed", async function () {
            const { credits, user1 } = await loadFixture(deployCreditsFixture)

            await credits.connect(user1).claimFreeTier()

            await expect(credits.connect(user1).claimFreeTier()).to.be.revertedWith(
                "Free tier already claimed",
            )
        })
    })

    describe("Spend Credits", function () {
        it("Should spend credits successfully", async function () {
            const { credits, owner, user1, backend } = await loadFixture(deployCreditsFixture)

            // Authorize backend
            await credits.connect(owner).setAuthorizedSpender(backend.address, true)

            // User buys credits
            await credits.connect(user1).purchaseCredits(100, { value: ethers.parseEther("0.01") })

            // Backend spends credits
            const tx = await credits
                .connect(backend)
                .spendCredits(user1.address, 5, "AI chat message")

            await expect(tx)
                .to.emit(credits, "CreditsSpent")
                .withArgs(user1.address, 5, "AI chat message")

            expect(await credits.balanceOf(user1.address)).to.equal(95)
        })

        it("Should fail if not authorized", async function () {
            const { credits, user1, user2 } = await loadFixture(deployCreditsFixture)

            await credits.connect(user1).purchaseCredits(100, { value: ethers.parseEther("0.01") })

            await expect(
                credits.connect(user2).spendCredits(user1.address, 5, "test"),
            ).to.be.revertedWith("Not authorized to spend credits")
        })

        it("Should fail if insufficient credits", async function () {
            const { credits, owner, user1, backend } = await loadFixture(deployCreditsFixture)

            await credits.connect(owner).setAuthorizedSpender(backend.address, true)

            await credits.connect(user1).purchaseCredits(10, { value: ethers.parseEther("0.001") })

            await expect(
                credits.connect(backend).spendCredits(user1.address, 20, "test"),
            ).to.be.revertedWith("Insufficient credits")
        })
    })

    describe("Admin Functions", function () {
        it("Should allow owner to create new plan", async function () {
            const { credits, owner } = await loadFixture(deployCreditsFixture)

            const tx = await credits.connect(owner).createPlan(2000, ethers.parseEther("0.14"), 30)

            await expect(tx)
                .to.emit(credits, "PlanCreated")
                .withArgs(3, 2000, ethers.parseEther("0.14"), 30)

            expect(await credits.planCount()).to.equal(4)
        })

        it("Should allow owner to update plan status", async function () {
            const { credits, owner } = await loadFixture(deployCreditsFixture)

            const tx = await credits.connect(owner).updatePlanStatus(0, false)

            await expect(tx).to.emit(credits, "PlanStatusUpdated").withArgs(0, false)

            const plan = await credits.getPlan(0)
            expect(plan.active).to.be.false
        })

        it("Should allow owner to update credit price", async function () {
            const { credits, owner } = await loadFixture(deployCreditsFixture)

            const newPrice = ethers.parseEther("0.0002")
            const tx = await credits.connect(owner).setCreditPrice(newPrice)

            await expect(tx).to.emit(credits, "CreditPriceUpdated").withArgs(newPrice)

            expect(await credits.creditPrice()).to.equal(newPrice)
        })

        it("Should fail to set zero credit price", async function () {
            const { credits, owner } = await loadFixture(deployCreditsFixture)

            await expect(credits.connect(owner).setCreditPrice(0)).to.be.revertedWith(
                "Price must be greater than 0",
            )
        })

        it("Should allow owner to update free tier credits", async function () {
            const { credits, owner } = await loadFixture(deployCreditsFixture)

            const tx = await credits.connect(owner).setFreeTierCredits(20)

            await expect(tx).to.emit(credits, "FreeTierCreditsUpdated").withArgs(20)

            expect(await credits.freeTierCredits()).to.equal(20)
        })

        it("Should allow owner to authorize spender", async function () {
            const { credits, owner, backend } = await loadFixture(deployCreditsFixture)

            const tx = await credits.connect(owner).setAuthorizedSpender(backend.address, true)

            await expect(tx)
                .to.emit(credits, "AuthorizedSpenderUpdated")
                .withArgs(backend.address, true)

            expect(await credits.authorizedSpenders(backend.address)).to.be.true
        })

        it("Should fail to authorize zero address", async function () {
            const { credits, owner } = await loadFixture(deployCreditsFixture)

            await expect(
                credits.connect(owner).setAuthorizedSpender(ethers.ZeroAddress, true),
            ).to.be.revertedWith("Invalid spender address")
        })

        it("Should allow owner to withdraw funds", async function () {
            const { credits, owner, user1 } = await loadFixture(deployCreditsFixture)

            await credits.connect(user1).purchaseCredits(100, { value: ethers.parseEther("0.01") })

            const balanceBefore = await ethers.provider.getBalance(owner.address)

            const tx = await credits.connect(owner).withdraw()
            const receipt = await tx.wait()
            const gasUsed = receipt.gasUsed * receipt.gasPrice

            const balanceAfter = await ethers.provider.getBalance(owner.address)

            expect(balanceAfter).to.be.closeTo(
                balanceBefore + ethers.parseEther("0.01") - gasUsed,
                ethers.parseEther("0.0001"),
            )
        })

        it("Should allow owner to emergency refund", async function () {
            const { credits, owner, user1 } = await loadFixture(deployCreditsFixture)

            await credits.connect(user1).purchaseCredits(100, { value: ethers.parseEther("0.01") })

            const balanceBefore = await ethers.provider.getBalance(user1.address)

            await credits.connect(owner).emergencyRefund(user1.address, 50)

            const balanceAfter = await ethers.provider.getBalance(user1.address)

            expect(await credits.balanceOf(user1.address)).to.equal(50)
            expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("0.005"))
        })

        it("Should fail emergency refund for zero address", async function () {
            const { credits, owner } = await loadFixture(deployCreditsFixture)

            await expect(
                credits.connect(owner).emergencyRefund(ethers.ZeroAddress, 50),
            ).to.be.revertedWith("Invalid user address")
        })
    })

    describe("Query Functions", function () {
        it("Should get user credits", async function () {
            const { credits, user1 } = await loadFixture(deployCreditsFixture)

            await credits.connect(user1).purchaseCredits(100, { value: ethers.parseEther("0.01") })

            expect(await credits.getUserCredits(user1.address)).to.equal(100)
        })

        it("Should get active plans", async function () {
            const { credits, owner } = await loadFixture(deployCreditsFixture)

            const activePlans = await credits.getActivePlans()
            expect(activePlans.length).to.equal(3)

            // Deactivate one plan
            await credits.connect(owner).updatePlanStatus(0, false)

            const newActivePlans = await credits.getActivePlans()
            expect(newActivePlans.length).to.equal(2)
        })
    })

    describe("Non-owner restrictions", function () {
        it("Should not allow non-owner to create plan", async function () {
            const { credits, user1 } = await loadFixture(deployCreditsFixture)

            await expect(
                credits.connect(user1).createPlan(1000, ethers.parseEther("0.1"), 10),
            ).to.be.revertedWithCustomError(credits, "OwnableUnauthorizedAccount")
        })

        it("Should not allow non-owner to update plan status", async function () {
            const { credits, user1 } = await loadFixture(deployCreditsFixture)

            await expect(
                credits.connect(user1).updatePlanStatus(0, false),
            ).to.be.revertedWithCustomError(credits, "OwnableUnauthorizedAccount")
        })

        it("Should not allow non-owner to set credit price", async function () {
            const { credits, user1 } = await loadFixture(deployCreditsFixture)

            await expect(
                credits.connect(user1).setCreditPrice(ethers.parseEther("0.0002")),
            ).to.be.revertedWithCustomError(credits, "OwnableUnauthorizedAccount")
        })

        it("Should not allow non-owner to withdraw", async function () {
            const { credits, user1 } = await loadFixture(deployCreditsFixture)

            await expect(credits.connect(user1).withdraw()).to.be.revertedWithCustomError(
                credits,
                "OwnableUnauthorizedAccount",
            )
        })
    })
})
