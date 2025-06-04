import express from 'express';
import cors from 'cors';
import youtubedl from 'youtube-dl-exec';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).send('URL query param "url" is required');
  }

  try {
    // Streaming mp3 output from youtube-dl-exec CLI
    const stream = youtubedl.raw(videoUrl, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: '-', // output to stdout
      // Additional options:
      // audioQuality: 0, // best audio quality
      // quiet: true
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');

    stream.stdout.pipe(res);

    stream.stderr.on('data', (chunk) => {
      console.error('youtube-dl stderr:', chunk.toString());
    });

    stream.on('close', (code) => {
      if (code !== 0) {
        console.error(`youtube-dl process exited with code ${code}`);
        if (!res.headersSent) {
          res.status(500).send('Error downloading audio');
        }
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error occurred');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
