
const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/song', async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing song query" });

    try {
        const result = await ytSearch(query);
        if (!result.videos.length) return res.status(404).json({ error: "No results found" });

        const video = result.videos[0];
        const info = await ytdl.getInfo(video.url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

        res.setHeader('Content-Disposition', `attachment; filename="${video.title}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');
        ytdl(video.url, { filter: 'audioonly' }).pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error downloading song" });
    }
});

app.get("/", (req, res) => {
    res.send("🎵 Rudra Song Downloader is Live!");
});

app.listen(port, () => {
    console.log(`🎶 Rudra Song Downloader running on port ${port}`);
});
