import express from 'express';
import Video from '../models/videoModel.js';
import verifyToken from '../utils/verifyToken.js';
import fileUpload from 'express-fileupload';
import path from 'path';
const router = express.Router();




router.use(fileUpload());
// Create a new video
router.post('/', verifyToken, async (req, res) => {
    try {
        // Destructure fields from request body
        const { titleEng, descriptionEng, urlEng, titleFre, descriptionFre, urlFre } = req.body;

        // Ensure all required fields are present
        if (!titleEng || !descriptionEng || !urlEng || !titleFre || !descriptionFre || !urlFre) {
            return res.status(400).send({ error: 'All fields are required' });
        }

        // Ensure files are uploaded
        if (!req.files || !req.files.posterEng || !req.files.posterFre) {
            return res.status(400).send({ error: 'Poster images are required' });
        }

        // Handle file upload
        const posterEngFile = req.files.posterEng;
        const posterFreFile = req.files.posterFre;

        // Generate unique filenames with extension
        const posterEngFileName = `posterEng_${Date.now()}${path.extname(posterEngFile.name)}`;
        const posterFreFileName = `posterFre_${Date.now()}${path.extname(posterFreFile.name)}`;

        // Absolute path to 'uploads' directory
        const uploadDir = path.join(__dirname, '../uploads');

        // Move files to 'uploads' directory
        await posterEngFile.mv(path.join(uploadDir, posterEngFileName));
        await posterFreFile.mv(path.join(uploadDir, posterFreFileName));

        // Save video details to database
        const video = new Video({
            titleEng,
            descriptionEng,
            urlEng,
            posterEng: `/uploads/${posterEngFileName}`,
            titleFre,
            descriptionFre,
            urlFre,
            posterFre: `/uploads/${posterFreFileName}`,
        });

        // Save video object to MongoDB
        await video.save();

        // Respond with the saved video object
        res.status(201).send(video);
    } catch (error) {
        // Handle any errors
        console.error('Error uploading video:', error);
        res.status(500).send({ error: 'Failed to upload video' });
    }
});

// Get all videos
router.get('/', verifyToken, async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).send(videos);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a video by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).send();
    }
    res.status(200).send(video);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a video by ID
router.patch('/:id', verifyToken, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['titleEng', 'descriptionEng', 'urlEng', 'posterEng', 'titleFre', 'descriptionFre', 'urlFre', 'posterFre'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).send();
    }

    updates.forEach(update => video[update] = req.body[update]);
    await video.save();
    res.status(200).send(video);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a video by ID
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);

    if (!video) {
      return res.status(404).send();
    }

    res.status(200).send(video);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
