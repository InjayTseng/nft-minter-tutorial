import { useEffect, useState } from 'react'
import {
  connectWallet,
  getCurrentWalletConnected,
  mintNFT,
  uploadImageToIPFS,
  changeNetwork,
  checkCurrentNetwork,
  changeNetworkIDtoName,
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
  function handleChainChanged(_chainId) {
    // We recommend reloading the page, unless you must do otherwise
    //window.location.reload()
    changeNetworkIDtoName(_chainId).then((result) => {
      {
        //console.log('set' + result)
        setNetwork(result)
      }
    })
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
    window.ethereum.on('chainChanged', handleChainChanged)
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

  const onSwitchNewtorkClicked = async (e) => {
    console.log(e.target.value)
    changeNetwork(e.target.value)
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
      {/* <p>Simply upload the image, then press "Mint."</p>
      <button id="switchNetworkButton" onClick={changeNetwork}>
        <span>Switch Network to Rinkeby</span>
      </button> */}
      <span>Please switch Network to Rinkeby</span>

      <form onSubmit={() => {}}>
        <label>
          Choose your network:
          <select onChange={onSwitchNewtorkClicked}>
            <option value="0x1">Ethereum Mainnet</option>
            <option value="0x4">Rinkeby Network</option>
            <option value="0x38">BSC Mainnet</option>
            <option value="0x61">BSC Testnet</option>
            <option value="0x89">Polygon</option>
            <option value="0x13881">Mumbai Network</option>
          </select>
        </label>
      </form>
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
        <p>Or check the link below:</p>
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
