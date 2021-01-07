const { assert } = require('chai');
const { default: Web3 } = require('web3');

const Token = artifacts.require("Token");
const BlackstoneCoinSwap = artifacts.require("BlackstoneCoinSwap");

require('chai')
.use(require('chai-as-promised'))
.should()


let token, blackstoneCoinSwap

before(async () => {
    token = await Token.new()
    blackstoneCoinSwap = await BlackstoneCoinSwap.new(token.address)
    //Transfer all token to BlackstoneCoinSwap
    await token.transfer(blackstoneCoinSwap.address, '1000000000000000000000000')
})

contract('BlackstoneCoinSwap', ([deployer, investor]) => {

    describe('Token deployment', async () => {
        it('contract has a name', async () => {
            const name = await token.name()
            assert.equal(name, 'BlackstoneCoin')
        })
    })

    describe('BlackstoneCoinSwap deployment', async () => {
        it('contract has a name', async () => {
            const name = await blackstoneCoinSwap.name()
            assert.equal(name, 'BlackstoneCoin Instant Exchange')
        })

        it('contract has tokens', async () => {
  let balance = await token.balanceOf(blackstoneCoinSwap.address)
  assert.equal(balance.toString(), '1000000000000000000000000')
        })
    })

describe('buyTokens()', async () => {
    let result

    before(async () => {
        // Purchase tokens before each example
        result = await blackstoneCoinSwap.buyTokens({ from: investor, value: '1000000000000000000'})
    })
    it("Allows user to instantly purchase tokens for a fixed price", async () => {
        // Check investor token value after purchase
        let investorBalance = await token.balanceOf(investor)
        assert.equal(investorBalance.toString(), '100000000000000000000')

        // Check blackstoneCoinSwap balance after purchase
        let blackstoneCoinSwapBalance
        blackstoneCoinSwapBalance = await token.balanceOf(blackstoneCoinSwap.address)
        assert.equal(blackstoneCoinSwapBalance.toString(), '999900000000000000000000')
        blackstoneCoinSwapBalance = await web3.eth.getBalance(blackstoneCoinSwap.address)
        assert.equal(blackstoneCoinSwapBalance.toString(), '1000000000000000000')

        // Check logs to ansure event was emitted with correct data
        const event = result.logs[0].args
        assert.equal(event.account, investor)
        assert.equal(event.token, token.address)
        assert.equal(event.amount.toString(), '100000000000000000000'.toString())
        assert.equal(event.rate.toString(), '100')
    })
})

describe('sellTokens()', async () => {
    let result

    before(async () => {
        // Investor must approve tokens before purchase
        await token.approve(blackstoneCoinSwap.address, '100000000000000000000', {from: investor});
        // Investor sells tokens
        result = await blackstoneCoinSwap.sellTokens('100000000000000000000', {from: investor});
    })

    it("Allows user to instantly sell tokens to BlackstoneCoinSwap for a fixed price", async () => {
        // Check investor token balance after purchase
        let investorBalance = await token.balanceOf(investor)
        assert.equal(investorBalance.toString(), '0')
        
         // Check blackstoneCoinSwap balance after purchase
         let blackstoneCoinSwapBalance
         blackstoneCoinSwapBalance = await token.balanceOf(blackstoneCoinSwap.address)
         assert.equal(blackstoneCoinSwapBalance.toString(), '1000000000000000000000000')
         blackstoneCoinSwapBalance = await web3.eth.getBalance(blackstoneCoinSwap.address)
         assert.equal(blackstoneCoinSwapBalance.toString(), '0')

         // Check logs to ensure event was emitted with correct data
         const event = result.logs[0].args
        assert.equal(event.account, investor)
        assert.equal(event.token, token.address)
        assert.equal(event.amount.toString(), '100000000000000000000'.toString())
        assert.equal(event.rate.toString(), '100')

        // FAILURE: Investor can't sell more tokens than they have
        await blackstoneCoinSwap.sellTokens('500000000000000000000', { from: investor }).should.be.rejected;
    })
})
})