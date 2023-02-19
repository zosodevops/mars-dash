require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))


// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

// Rover manifests to pull required information to display and narrow down img api call
app.get('/manifest/curiosity', async (req,res) => {
    try {
        let url = `https://api.nasa.gov/mars-photos/api/v1/manifests/curiosity?api_key=${process.env.API_KEY}`
        let manifest = await fetch(url)
            .then(res => res.json())
            .then(json => json.photo_manifest)
        res.send({ manifest })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/manifest/opportunity', async (req,res) => {
    try {
        let url = `https://api.nasa.gov/mars-photos/api/v1/manifests/opportunity?api_key=${process.env.API_KEY}`
        let manifest = await fetch(url)
            .then(res => res.json())
            .then(json => json.photo_manifest)
        res.send({ manifest })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/manifest/spirit', async (req,res) => {
    try {
        let url = `https://api.nasa.gov/mars-photos/api/v1/manifests/spirit?api_key=${process.env.API_KEY}`
        let manifest = await fetch(url)
            .then(res => res.json())
            .then(json => json.photo_manifest)
        res.send({ manifest })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))