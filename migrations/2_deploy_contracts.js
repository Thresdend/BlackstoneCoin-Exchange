const Token = artifacts.require("Token");
const BlackstoneCoinSwap = artifacts.require("BlackstoneCoinSwap");

module.exports = async function(deployer) {
    //Deploy Token
    await deployer.deploy(Token);
    const token = await Token.deployed()

    //Deploy BlackstoneCoinSwap
  await deployer.deploy(BlackstoneCoinSwap, token.address);
  const blackstoneCoinSwap = await BlackstoneCoinSwap.deployed()
  //Transfer all tokens to BlackstoneCoinSwap (1 million)
  await token.transfer(blackstoneCoinSwap.address, '1000000000000000000000000') 
};