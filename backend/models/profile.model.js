import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
  school: {
    type: String,
    default: '',
  },
  degree: {
    type: String,
    default: '',
  },
  fieldOfStudy: {
    type: String,
    default: '',
  },
  startYear: {
    type: String,
    default: '',
  },
  endYear: {
    type: String,
    default: '',
  }
});

const workSchema = new mongoose.Schema({
    company: {
        type: String,
        default: '',
    },
    position: {
        type: String,
        default: '',
    },
    years: {
        type: String,
        default: '',
    },
    current: {
        type: Boolean,
        default: false,
    }
});

const ProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    headline: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    about: {
        type: String,
        default: ''
    },
    currentPost: {
        type: String,
        default: ''
    },
    skills: {
        type: [String],
        default: []
    },
    website: {
        type: String,
        default: ''
    },
    pastWork: {
        type: [workSchema],
        default: []
    },
    education: {
        type: [educationSchema],
        default: []
    },
    profileViews: {
        type: Number,
        default: 0
    },
    postImpressions: {
        type: Number,
        default: 0
    }
});


const Profile = mongoose.model("Profile",ProfileSchema);

export default Profile;