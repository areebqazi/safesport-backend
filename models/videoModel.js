import mongoose from 'mongoose';
const { Schema } = mongoose;

const videoSchema = new Schema({
  titleEng: {
    type: String,
    required: true,
  },
  descriptionEng: {
    type: String,
    required: true,
  },
  urlEng: {
    type: String,
    required: true,
  },
  posterEng: {
    type: String,
    required: true,
  },
  titleFre: {
    type: String,
    required: true,
  },
  descriptionFre: {
    type: String,
    required: true,
  },
  urlFre: {
    type: String,
    required: true,
  },
  posterFre: {
    type: String,
    required: true,
  },
});

const Video = mongoose.model('Video', videoSchema);

export default Video;