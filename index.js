require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('node:dns');
const mongoose = require('mongoose');
const ShortUrl = require('./models/url.model.js');
const urlParser = require('url');
// Basic Configuration
const port = process.env.PORT || 3000;


app.use(express.urlencoded({
  extended: false
}));

mongoose.connect(process.env.MONGO_URI).then(() => console.log(`Connected to Database`));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

function isValidURL(string) {
  const urlRegex = /^https?:\/\//;
  return urlRegex.test(string);
}

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async function (req, res) {
  let original_url;
  let short_url;

  const { url } = req.body;

  const isUrlValid = isValidURL(url);

  if (!isUrlValid) {
    return res.json({
      error: "invalid url"
    })
  }

  dns.lookup(urlParser.parse(url).hostname, async (err, address) => {
  
    if(!address) {
      return res.status(404).json({
        error: "Invalid Hostname"
      });
    }

    original_url = url;
    const urlCount = await ShortUrl.countDocuments({});
    short_url = urlCount + 1;

  const existingShortUrl = await ShortUrl.findOne({
      original_url
    });

    if(!existingShortUrl){

      const newShortUrl = new ShortUrl({
        original_url,
        short_url
      });

    const savedUrl = await newShortUrl.save();

      return res.json({
        original_url: savedUrl.original_url,
        short_url: savedUrl.short_url,
      });
    }

    return res.json({
      original_url: existingShortUrl.original_url,
      short_url: existingShortUrl.short_url
    })

  })
});

app.get('/api/shorturl/:short_url', async function (req, res) {
   const { short_url } = req.params;

   const regex = /^\d+$/;

   const isValidDigit = regex.test(short_url);

   if(!isValidDigit){
    return res.status(400).json({
      error: "Wrong Format"
    })
   }
   const url = await ShortUrl.findOne({
    short_url
   });

   if(!url) {
    return res.status(404).json({
      "error": "No short URL found for the given input"
    })
   }

   return res.redirect(url.original_url)
   
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
 