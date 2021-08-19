import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'

import { CONTRACT_ADDRESS, ABI, V1_CONTRACT_ADDRESS, V1_ABI, V2_CONTRACT_ADDRESS, V2_ABI } from './config'

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
  }

  constructor(props) {
    super(props)
    this.state = { account: '' }
  }

  async startMigration() {
    console.log(Web3.givenProvider);
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

    await contract.methods.startMigration().send({
      from: this.state.account
    });
  }

  async swapV1ToV2() {
    const { account } = this.state;
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

    const v1Contract = new web3.eth.Contract(V1_ABI, V1_CONTRACT_ADDRESS);
    const v2Contract = new web3.eth.Contract(V2_ABI, V2_CONTRACT_ADDRESS);

    const allowance1 = await v1Contract.methods.allowance(account, CONTRACT_ADDRESS).call();
    if(parseInt(allowance1) === 0) {
      await v1Contract.methods.approve(CONTRACT_ADDRESS, web3.utils.toBN('10000000000000000000000000000000')).send({
        from: account
      });
    }

    const allowance2 = await v2Contract.methods.allowance(account, CONTRACT_ADDRESS).call();
    if(parseInt(allowance2) === 0) {
      await v2Contract.methods.approve(CONTRACT_ADDRESS, web3.utils.toBN('10000000000000000000000000000000')).send({
        from: account
      });
    }

    await contract.methods.migrateToV2(10).send({
      from: this.state.account
    });;
  }

  render() {
    return (
      <div className="container">
        <h1>Hello, World!</h1>
        <p>Your account: {this.state.account}</p>

        <button onClick={() => this.startMigration()}>Start migration</button>

        <button onClick={() => this.swapV1ToV2()}>Swap v1 to v2</button>
      </div>
    );
  }
}

export default App;