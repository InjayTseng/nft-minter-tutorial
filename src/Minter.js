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

// or less ideally
import { Button, Container, Row, Col } from 'react-bootstrap'

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

const FormData = require('form-data')

const Minter = (props) => {
  return <Home />
}

function Home() {
  //State variables
  const [walletAddress, setWallet] = useState('')
  const [network, setNetwork] = useState('')
  const [status, setStatus] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [recipient, setRecipient] = useState('')
  const [url, setURL] = useState('')
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

  async function uploadImage() {
    if (!isImageSelectedForUploadImage) return
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
      <Container>
        <Row>
          <Col sm={8}>
            <p id="status">{status}</p>
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
            <input
              type="file"
              name="file"
              onChange={changeHandlerForUploadImage}
            />

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

            <Button variant="outline-dark" onClick={onMintPressed}>
              Mint NFT
            </Button>
            <p id="status">{status}</p>
          </Col>
          <Col sm={4}>
            {' '}
            <Button
              variant="secondary"
              id="networkButton"
              onClick={networkButtonPressed}
            >
              {network.length > 0 ? network : <span>Network</span>}
            </Button>
            <Button
              variant="primary"
              id="walletButton"
              onClick={connectWalletPressed}
            >
              {walletAddress.length > 0 ? (
                'Connected: ' +
                String(walletAddress).substring(0, 6) +
                '...' +
                String(walletAddress).substring(38)
              ) : (
                <span>Connect Wallet</span>
              )}
            </Button>
            {isImageSelectedForUploadImage ? (
              <div>
                <p>Size in bytes: {selectedImageForUploadImage.size}</p>
                <p>
                  <img
                    src={URL.createObjectURL(selectedImageForUploadImage)}
                    alt="alternatetext"
                    height="300"
                  />
                </p>
                <p>Click the button to upload.</p>
                <Button onClick={uploadImage}>Upload image</Button>
              </div>
            ) : (
              <p>Select a image file to show details</p>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

function About() {
  return <h2>About</h2>
}

function Users() {
  return <h2>Users</h2>
}

export default Minter
