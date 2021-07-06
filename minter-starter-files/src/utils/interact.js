import { pinJSONToIPFS } from './pinata.js'

require('dotenv').config()
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY
const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const web3 = createAlchemyWeb3(alchemyKey)

const contract = require('../artifacts/contracts/MyNFT.sol/MyNFT.json')
const contractAddress = '0x6584f79c5146031Ffc36b38d6d6C8F3ebAa4CBD5'

export const estimateGas = async (url, name, description) => {
  const tokenURI = ''
  window.contract = await new web3.eth.Contract(contract.abi, contractAddress)

  web3.eth
    .estimateGas({
      to: contractAddress,
      data: window.contract.methods
        .mintNFT(window.ethereum.selectedAddress, tokenURI)
        .encodeABI(),
    })
    .then(console.log)

  return {
    success: true,
    status:
      '✅ Check out your transaction on Etherscan: https://rinkeby.etherscan.io/tx/',
  }
}

export const mintNFT = async (url, name, description, recipient) => {
  if (url.trim() == '' || name.trim() == '' || description.trim() == '') {
    return {
      success: false,
      status: '❗Please make sure all fields are completed before minting.',
    }
  }

  //make metadata
  const metadata = new Object()
  metadata.name = name
  metadata.image = url
  metadata.description = description

  //make pinata call
  const pinataResponse = await pinJSONToIPFS(metadata)
  if (!pinataResponse.success) {
    return {
      success: false,
      status: '😢 Something went wrong while uploading your tokenURI.',
    }
  }

  const tokenURI = pinataResponse.pinataUrl

  window.contract = await new web3.eth.Contract(contract.abi, contractAddress)
  //set up your Ethereum transaction

  /*const gasEstimate = await window.contract.methods
    .mintNFT(window.ethereum.selectedAddress, tokenURI)
    .estimateGas() // estimate gas
*/

  if (recipient.trim() == '') {
    recipient = window.ethereum.selectedAddress
  }

  // TODO: How to estimate Gas Price?
  console.log(
    'Estimate Gas ',
    await window.contract.methods.mintNFT(recipient, tokenURI).estimateGas(),
  )

  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    data: window.contract.methods.mintNFT(recipient, tokenURI).encodeABI(), //make call to NFT smart contract
    gasLimit: await window.contract.methods
      .mintNFT(window.ethereum.selectedAddress, tokenURI)
      .estimateGas(),
  }

  //sign the transaction via Metamask
  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    })
    return {
      success: true,
      status:
        '✅ Check out your transaction on Etherscan: https://rinkeby.etherscan.io/tx/' +
        txHash,
    }
  } catch (error) {
    return {
      success: false,
      status: '😥 Something went wrong: ' + error.message,
    }
  }
}

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      const obj = {
        status: '👆🏽 Write a message in the text-field above.',
        address: addressArray[0],
      }
      return obj
    } catch (err) {
      return {
        address: '',
        status: '😥 ' + err.message,
      }
    }
  } else {
    return {
      address: '',
      status: (
        <span>
          <p>
            {' '}
            🦊{' '}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    }
  }
}

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: 'eth_accounts',
      })
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: '👆🏽 Write a message in the text-field above.',
        }
      } else {
        return {
          address: '',
          status: '🦊 Connect to Metamask using the top right button.',
        }
      }
    } catch (err) {
      return {
        address: '',
        status: '😥 ' + err.message,
      }
    }
  } else {
    return {
      address: '',
      status: (
        <span>
          <p>
            {' '}
            🦊{' '}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    }
  }
}
