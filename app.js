require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const validUrl = require('valid-url');
const { nanoid } = require('nanoid');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const app = express();

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({optionsSuccessStatus: 200}));
app.use(express.static('public'));

// CONNECT TO DB
mongoose.connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true }
);
const Link = require('./models/Link');

// ROUTES
app.get('/', (req, res) => {
    res.sendFile('index.html');
});

app.get('/api/shorturl/:short_url', (req, res) => {
    Link.findOne({ short_url: req.params.short_url }, (err, url) => {
        if (err) {
            console.log(err);
            res.json({message: err});
            return;
        }

        if (url) {
            res.redirect(url.original_url);
        } else {
            res.json({error:"No short URL found for the given input"});
        }
    });
});

app.post('/api/shorturl', async (req, res) => {
    // Check if valid URL
    if (validUrl.isWebUri(req.body.url)) {
        // Check if already in DB
        const duplicate = await Link.findOne({ original_url: req.body.url }).exec();
        if (duplicate) {
            res.json({
                original_url: duplicate.original_url, 
                short_url: duplicate.short_url
            });

        } else {
            // Create new entry
            const link = new Link({
                original_url: req.body.url,
                short_url: nanoid(10)
            });
            try {
                const savedLink = await link.save();
                res.json({
                    original_url: savedLink.original_url,
                    short_url: savedLink.short_url
                });
            } catch (err) {
                res.json({ message: err });
            }
        }

    } else {
        res.json({error:'Invalid URL'});
    }
});

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}...`);
});