import React, { Component } from 'react'
import Web3 from 'web3'
import Token from '../abis/Token.json'
import BlackstoneCoinSwap from '../abis/BlackstoneCoinSwap.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  } 

async loadBlockchainData() {
  const web3 = window.web3

  const accounts = await web3.eth.getAccounts()
  this.setState({ account: accounts[0] })
  console.log(this.state.account)

  const ethBalance = await web3.eth.getBalance(this.state.account)
  this.setState({ ethBalance })
  console.log(this.state.ethBalance)

  // Load token
  const networkId = await web3.eth.net.getId()
  const tokenData = Token.networks[networkId]
  if(tokenData) {
    const token = new web3.eth.Contract(Token.abi, tokenData.address)
    this.setState({ token })
    let tokenBalance = await token.methods.balanceOf(this.state.account).call()
    console.log('tokenBalance', tokenBalance.toString())
    this.setState({ tokenBalance: tokenBalance.toString()})
  } else {
    window.alert('Token contract not deployed to detected network.')
  }

// Load BlackstoneCoin Exchange
const exchangeData = BlackstoneCoinSwap.networks[networkId]
if(exchangeData) {
  const blackstoneCoinSwap = new web3.eth.Contract(BlackstoneCoinSwap.abi, exchangeData.address)
  this.setState({ blackstoneCoinSwap })
} else {
  window.alert('Exchange contract not deployed to detected network.')
}

console.log(this.state.blackstoneCoinSwap)
this.setState({loading: false})
}

async loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
            // Request account access if needed
            await window.ethereum.enable()
    }     
    else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
}

buyTokens = (etherAmount) => {
  this.setState ({loading: true})
  this.state.blackstoneCoinSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account}).on('transactionHash', (hash) => {
    this.setState ({ loading: false})
  })
}

sellTokens = (tokenAmount) => {
  this.setState ({loading: true})
  this.state.token.methods.approve(this.state.blackstoneCoinSwap.address, tokenAmount).send({ from: this.state.account}).on('transactionHash', (hash) => {
    this.state.blackstoneCoinSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account}).on('transactionHash', (hash) => {
    this.setState ({ loading: false})
  })
})
}
constructor(props) {
  super(props)
  this.state = { 
    account: '',
    token: {},
    blackstoneCoinSwap: {},
    ethBalance: '0',
    tokenBalance: '0',
    loading: true,
    buyTokens: '0',
    sellTokens: '0'
  }
}

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">"Page is loading. Please wait..."</p>
    } else {
      content = <Main 
      ethBalance={this.state.ethBalance}
      tokenBalance={this.state.tokenBalance}
      buyTokens = {this.buyTokens}
      sellTokens={this.sellTokens}
      />
    }
    return (
      <div>
        <Navbar account = {this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center" style={{maxWidth: '600 px'}}>
              <div className="content mr-auto ml-auto">
                {content}
                </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
