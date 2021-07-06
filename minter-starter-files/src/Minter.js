import { useEffect, useState } from 'react'
import {
  connectWallet,
  getCurrentWalletConnected,
  mintNFT,
} from './utils/interact'

import ImageUploader from './utils/ImageUploader'

const Minter = (props) => {
  //State variables
  const [walletAddress, setWallet] = useState('')
  const [status, setStatus] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [recipient, setRecipient] = useState('')
  const [url, setURL] = useState('')

  useEffect(async () => {
    //TODO: implement
    const { address, status } = await getCurrentWalletConnected()
    setWallet(address)
    setStatus(status)
    addWalletListener()
  }, [])

  const connectWalletPressed = async () => {
    //TODO: implement
    const walletResponse = await connectWallet()
    setStatus(walletResponse.status)
    setWallet(walletResponse.address)
  }

  const onMintPressed = async () => {
    //TODO: implement
    const { status } = await mintNFT(url, name, description, recipient)
    setStatus(status)
  }

  const onImageChange = async (e) => {
    //TODO: implement
    console.log(e.images)
  }

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0])
          setStatus('👆🏽 Write a message in the text-field above.')
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

      <br></br>
      <h1 id="title">🧙‍♂️ My NFT Minter</h1>
      <p>
        Simply add your asset's link, name, and description, then press "Mint."
      </p>
      <h2>🖼 Image </h2>
      <div className="ImageUploader">
        <ImageUploader onChange={(event) => onImageChange}></ImageUploader>
      </div>
      <form>
        <h2>or Link to asset: </h2>
        <input
          type="text"
          placeholder="e.g. https://gateway.pinata.cloud/ipfs/<hash>"
          onChange={(event) => setURL(event.target.value)}
        />
        <h2>🤔 Name: </h2>
        <input
          type="text"
          placeholder="e.g. My first NFT!"
          onChange={(event) => setName(event.target.value)}
        />
        <h2>✍️ Description: </h2>
        <input
          type="text"
          placeholder="e.g. Even cooler than cryptokitties ;)"
          onChange={(event) => setDescription(event.target.value)}
        />
        <h2>🍺 Recipient: </h2>
        <input
          type="text"
          placeholder="e.g. 0x26Ea0b1d8a0258265Ca5e838cb8a161E5d709031 ;)"
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
