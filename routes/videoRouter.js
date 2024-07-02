import express from 'express';
import Video from '../models/videoModel.js';
import verifyToken from '../utils/verifyToken.js';
import fileUpload from 'express-fileupload';
import path from 'path';
const router = express.Router();




router.use(fileUpload());
// Create a new video
router.post('/', verifyToken, async (req, res) => {
  const allVideos = (await Video.find()).length;
  if (allVideos >= 10) {
    return res.status(400).send({ error: 'You can only have 10 videos' });
  }
  const video = new Video(req.body);
  try {
    await video.save();
    res.status(201).send(video);
  } catch (error) {
    res.status(400).send(error);
  }
}
);

// Get all videos
router.get('/', async (req, res) => {
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
// router.delete('/:id', verifyToken, async (req, res) => {
//   try {
//     const video = await Video.findByIdAndDelete(req.params.id);

//     if (!video) {
//       return res.status(404).send();
//     }

//     res.status(200).send(video);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

export default router;
