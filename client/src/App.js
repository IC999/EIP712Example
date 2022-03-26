import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import "./App.css";
var ethUtil = require('ethereumjs-util');
var sigUtil = require('eth-sig-util');

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      console.log("componwentdidmount called");
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      // const deployedNetwork = SimpleStorageContract.networks[networkId];

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    console.log("run example called");
    // const { accounts } = this.state;
    // // Get the value from the contract to prove it worked.
    // const response = await contract.methods.get().call();
    // // Update state with the result.
    // this.setState({ storageValue: response });
  };

  signData = async () => {
    const { web3, accounts } = this.state;
    var signer = accounts[0];
    var deadline = Date.now() + 100000;
    console.log(deadline);
    var x = 157;

    web3.currentProvider.sendAsync({
      method: 'net_version',
      params: [],
      jsonrpc: "2.0"
    }, function (err, result) {
      const netId = result.result;
      console.log("netId", netId);
      const msgParams = JSON.stringify({types: {
        GPDomain: [
            {
                name: "name",
                type: "string"
            },
            {
                name: "version",
                type: "string"
            },
            {
                name: "salt",
                type: "bytes32"
            }
        ],
        GPBatchSubDomainTransaction: [
            {
                name: "name",
                type: "string[]"
            },
            {
                name: "label",
                type: "string[]"
            },
            {
                name: "owner",
                type: "address[]"
            },
            {
                name: "chainid",
                type: "uint256"
            },
            {
                name: "sender",
                type: "address"
            }
        ]
      },
      domain: {
          name: "EIP-712GeneralPurposeDomain",
          version: "1",
          salt: "0x7cf4c8112fb7ffc1fc4226030109130b48d3f947cfd6789f1b9cf974c6a7c22d"
      },
      primaryType: "GPBatchSubDomainTransaction",
      message: {
          name: [
              "ic1", "ic2"
          ],
          label: [
              "b", "c"
          ],
          owner: [
              "0x654b39f5a9fc17340ee711b0c7fc0423108251e7", "0x654b39f5a9fc17340ee711b0c7fc0423108251e7"
          ],
          chainid: 4,
          sender: "0x4CeBBdbBdFe8A1BB3F62A75B5fe9ebaE5D105f8F"
      }
      })

      var from = signer;
    
      console.log('CLICKED, SENDING PERSONAL SIGN REQ', 'from', from, msgParams)
      var params = [from, msgParams]
      console.dir(params)
      var method = 'eth_signTypedData_v4'
    
      web3.currentProvider.sendAsync({
        method,
        params,
        from,
      }, async function (err, result) {
        if (err) return console.dir(err)
        if (result.error) {
          alert(result.error.message)
        }
        if (result.error) return console.error('ERROR', result)
        console.log('TYPED SIGNED:' + JSON.stringify(result.result))
    
        const recovered = sigUtil.recoverTypedSignature_v4({ data: JSON.parse(msgParams), sig: result.result })
    
        if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
          alert('Successfully ecRecovered signer as ' + from)
        } else {
          alert('Failed to verify signer when comparing ' + result + ' to ' + from)
        }

        //getting r s v from a signature
        // const signature = result.result.substring(2);
        // const r = "0x" + signature.substring(0, 64);
        // const s = "0x" + signature.substring(64, 128);
        // const v = parseInt(signature.substring(128, 130), 16);
        // console.log("r:", r);
        // console.log("s:", s);
        // console.log("v:", v);

      }) 
    })
  }
  render() {
    console.log("render called");
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h2>EIP 712 Example</h2>
        <p>
          Try changing the value stored on <strong>line 51</strong> of App.js.
        </p>
        <div>The stored value is: {this.state.storageValue}</div>
        <button onClick={() => this.signData()}> Press to sign </button>
      </div>
    );
  }
}

export default App;
