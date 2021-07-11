require('dotenv').config()
const key = process.env.REACT_APP_PINATA_KEY
const secret = process.env.REACT_APP_PINATA_SECRET

const axios = require('axios')

export const pinJSONToIPFS = async (JSONBody) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`
  //making axios POST request to Pinata ⬇️
  console.log('PinToIPFS')
  return axios
    .post(url, JSONBody, {
      headers: {
        pinata_api_key: key,
        pinata_secret_api_key: secret,
      },
    })
    .then(function (response) {
      console.log('Sucess' + response)
      return {
        success: true,
        pinataUrl:
          'https://gateway.pinata.cloud/ipfs/' + response.data.IpfsHash,
      }
    })
    .catch(function (error) {
      console.log(error)
      return {
        success: false,
        message: error.message,
      }
    })
}

export const pinFileToIPFS = (data) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`

  //we gather a local file for this example, but any valid readStream source will work here.
  //let data = new FormData()
  //data.append('file', fs.createReadStream('./yourfile.png'))

  //You'll need to make sure that the metadata is in the form of a JSON object that's been convered to a string
  //metadata is osptional
  const metadata = JSON.stringify({
    name: 'testname',
    keyvalues: {
      exampleKey: 'exampleValue',
    },
  })
  data.append('pinataMetadata', metadata)

  //pinataOptions are optional
  const pinataOptions = JSON.stringify({
    cidVersion: 0,
    customPinPolicy: {
      regions: [
        {
          id: 'FRA1',
          desiredReplicationCount: 1,
        },
        {
          id: 'NYC1',
          desiredReplicationCount: 2,
        },
      ],
    },
  })
  data.append('pinataOptions', pinataOptions)

  return axios
    .post(url, data, {
      maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: key,
        pinata_secret_api_key: secret,
      },
    })
    .then(function (response) {
      console.log('Sucess' + response)
      return {
        success: true,
        pinataUrl:
          'https://gateway.pinata.cloud/ipfs/' + response.data.IpfsHash,
      }
    })
    .catch(function (error) {
      console.log(error)
      return {
        success: false,
        message: error.message,
      }
    })
}
