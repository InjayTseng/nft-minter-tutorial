import { pinJSONToIPFS, pinFileToIPFS } from './pinata.js'

require('dotenv').config()
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY
const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const web3 = createAlchemyWeb3(alchemyKey)

const contract = require('../artifacts/contracts/MyNFT.sol/MyNFT.json')
const contractAddress = '0x6584f79c5146031Ffc36b38d6d6C8F3ebAa4CBD5'

export const checkCurrentNetwork = async () => {
  if (typeof web3 !== 'undefined') {
    //console.log(window.ethereum.currentProvider)
    // Use Mist/MetaMask's provider
    //var web3js = new Web3(web3.currentProvider)
    const chainId = await window.ethereum.request({ method: 'eth_chainId' })

    console.log(chainId)
    switch (chainId) {
      case '0x1':
        console.log('This is mainnet')
        return 'Mainnet'
        break
      case '0x3':
        console.log('This is Ropsten')
        return 'Ropsten'
        break
      case '0x4':
        console.log('This is Rinkeby')
        return 'Rinkeby'
        break
      case '0x89':
        console.log('This is Matic Mainnet')
        return 'Matic'
        break
      case '00x13881x89':
        console.log('This is Mumbai Testnet')
        return 'Mumbai'
        break
      case '0x61':
        console.log('This is BSC Testnet')
        return 'BSC Testnet'
        break
      case '0x38':
        console.log('This is BSC Mainnet')
        return 'BSC'
        break
      default:
        console.log('This is an unknown network.')
    }
  }
}

export const changeNetwork = async () => {
  try {
    console.log('Try Swtich Network')
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xf00' }],
    })
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [
            {
              //To Rinkeby
              chainId: '0x4',
            },
          ],
        })
      } catch (addError) {
        // handle "add" error
      }
    }
    // handle other "switch" errors
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
      txHash: txHash,
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
        status: 'Write a message in the text-field below.',
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
          status: 'Write a message in the text-field below.',
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
export const uploadImageToIPFS = async (data) => {
  //make pinata call
  const pinataResponse = await pinFileToIPFS(data)
  console.log('Log:' + pinataResponse.pinataUrl)
  if (!pinataResponse.success) {
    return {
      success: false,
      status: '😢 Something went wrong while uploading your tokenURI.',
    }
  }
  return {
    success: true,
    pinataUrl: pinataResponse.pinataUrl,
  }
}
