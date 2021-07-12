import { useEffect, useState } from 'react'
import {
  connectWallet,
  getCurrentWalletConnected,
  mintNFT,
  uploadImageToIPFS,
  changeNetwork,
  checkCurrentNetwork,
} from './utils/interact'

const FormData = require('form-data')

const Minter = (props) => {
  //State variables
  const [walletAddress, setWallet] = useState('')
  const [network, setNetwork] = useState('')
  const [status, setStatus] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [recipient, setRecipient] = useState('')
  const [url, setURL] = useState('')

  //Detects network change
  window.ethereum.on('chainChanged', handleChainChanged)
  function handleChainChanged(_chainId) {
    // We recommend reloading the page, unless you must do otherwise
    //window.location.reload()
    //
    var networkName = ''
    switch (_chainId) {
      case '0x1':
        console.log('This is mainnet')
        networkName = 'Mainnet'
        break
      case '0x3':
        console.log('This is Ropsten')
        networkName = 'Ropsten'
        break
      case '0x4':
        console.log('This is Rinkeby')
        networkName = 'Rinkeby'
        break
      case '0x89':
        console.log('This is Matic Mainnet')
        networkName = 'Matic'
        break
      case '00x13881x89':
        console.log('This is Mumbai Testnet')
        networkName = 'Mumbai'
        break
      case '0x61':
        console.log('This is BSC Testnet')
        networkName = 'BSC Testnet'
        break
      case '0x38':
        console.log('This is BSC Mainnet')
        networkName = 'BSC'
        break
      default:
        console.log('This is an unknown network.')
    }

    setNetwork(networkName)
  }

  //Images
  const [
    selectedImageForUploadImage,
    setSelectedImageForUploadImage,
  ] = useState()
  const [
    isImageSelectedForUploadImage,
    setIsImageSelectedForUploadImage,
  ] = useState(false)
  const changeHandlerForUploadImage = (event) => {
    setSelectedImageForUploadImage(event.target.files[0])
    setIsImageSelectedForUploadImage(true)
  }

  useEffect(async () => {
    //TODO: implement
    const { address, status } = await getCurrentWalletConnected()
    await networkButtonPressed()
    setWallet(address)
    setStatus(status)
    addWalletListener()
  }, [])

  const networkButtonPressed = async () => {
    const networkName = await checkCurrentNetwork()
    setNetwork(networkName)
  }

  const connectWalletPressed = async () => {
    //TODO: implement
    const walletResponse = await connectWallet()

    setStatus(walletResponse.status)
    setWallet(walletResponse.address)
  }

  const onMintPressed = async () => {
    const { status } = await mintNFT(url, name, description, recipient)
    setStatus(status)
  }

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0])
          setStatus('👆🏽 Write a message in the text-field below.')
        } else {
          setWallet('')
          setStatus('🦊 Connect to Metamask using the top right button.')
        }
      })
    } else {
      setStatus(
        <p>
          {' '}
          🦊{' '}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>,
      )
    }
  }

  async function uploadImage() {
    if (!isImageSelectedForUploadImage) return

    //const api = `${API_BASE_URL}/image`

    const formData = new FormData()
    formData.append('file', selectedImageForUploadImage)

    const response = await uploadImageToIPFS(formData)

    if (response.success) {
      console.log('Here IPFS Hash: ' + response.pinataUrl)
      const assetUrl = response.pinataUrl
      setURL(assetUrl)
    }

    // fetch(api, {
    //   method: 'POST',
    //   body: formData,
    // })
    //   .then((response) => response.json())
    //   .then((result) => {
    //     console.log(`${api} success`, result)
    //     setTestApiResponse(JSON.stringify(result))
    //   })
    //   .catch((error) => {
    //     console.log(`${api} error: `, error)
    //     setTestApiResponse(JSON.stringify(error))
    //   })
  }

  return (
    <div className="Minter">
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          'Connected: ' +
          String(walletAddress).substring(0, 6) +
          '...' +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>
      <button id="networkButton" onClick={networkButtonPressed}>
        {network.length > 0 ? network : <span>Network</span>}
      </button>

      <br></br>
      <p id="status">{status}</p>
      <p>Simply upload the image, then press "Mint."</p>
      <button id="switchNetworkButton" onClick={changeNetwork}>
        <span>Switch Network to Rinkeby</span>
      </button>

      <h2>Step.1 Upload your Image to IPFS.</h2>
      <p>Select an Image and upload. </p>
      <input type="file" name="file" onChange={changeHandlerForUploadImage} />
      {isImageSelectedForUploadImage ? (
        <div>
          {/* <p>Filename: {selectedImageForUploadImage.name}</p>
          <p>Filetype: {selectedImageForUploadImage.type}</p>
          <p>Size in bytes: {selectedImageForUploadImage.size}</p>
          <p>
            lastModifiedDate:{' '}
            {selectedImageForUploadImage.lastModifiedDate.toLocaleDateString()}
          </p> */}
          <p>
            <img
              src={URL.createObjectURL(selectedImageForUploadImage)}
              alt="alternatetext"
              height="300"
            />
          </p>
          <p>Click the button to upload.</p>
          <button onClick={uploadImage}>Upload image</button>
        </div>
      ) : (
        <p>Select a image file to show details</p>
      )}

      <form>
        <h2>Step.2 Write something about this NFT</h2>
        <p>Name: </p>
        <input
          type="text"
          placeholder="e.g. My first NFT!"
          onChange={(event) => setName(event.target.value)}
        />
        <p>Description: </p>
        <input
          type="text"
          placeholder="e.g. Even cooler than cryptokitties ;)"
          onChange={(event) => setDescription(event.target.value)}
        />
        <h2>Step.3 Check your Preview </h2>
        <a target="_blank" rel="noopener noreferrer" href={url}>
          Check your image
        </a>
        <p>Or link to another image URL:</p>
        <input
          type="text"
          placeholder="e.g. https://gateway.pinata.cloud/ipfs/<hash>"
          value={url}
          onChange={(event) => setURL(event.target.value)}
        />

        <h2>Step.4 Set recipient</h2>
        <p>Gives NFT to:</p>
        <input
          type="text"
          placeholder="e.g. 0x26Ea0b1d8a0258265Ca5e838cb8a161E5d709031 ;)"
          value={walletAddress}
          onChange={(event) => setRecipient(event.target.value)}
        />
      </form>
      <button id="mintButton" onClick={onMintPressed}>
        Mint NFT
      </button>
      <p id="status">{status}</p>
    </div>
  )
}

export default Minter
