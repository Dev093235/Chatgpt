const express = require('express');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// API Endpoint: /download?song=...
app.get('/download', async (req, res) => {
    const songName = req.query.song;

    if (!songName) {
        return res.status(400).send('❌ Error: Missing song name in query (?song=)');
    }

    try {
        const searchResult = await yts(songName);
        const video = searchResult.videos[0];

        if (!video) return res.status(404).send('❌ Error: No matching song found.');

        const url = video.url;
        const title = video.title.replace(/[^\w\s]/gi, '').slice(0, 50); // Safe filename

        res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        // Stream audio in medium quality
        ytdl(url, {
            filter: 'audioonly',
            quality: 'lowestaudio', // uses medium bitrate (≈48-64kbps), faster stream
        }).pipe(res);

    } catch (err) {
        console.error(err);
        res.status(500).send('❌ Internal Server Error while downloading song.');
    }
});

// Basic test route
app.get('/', (req, res) => {
    res.send('🎵 Rudra Song Downloader is Live! Use /download?song=YourSongName');
});

app.listen(port, () => {
    console.log(`✅ Rudra Song Downloader running on port ${port}`);
});
