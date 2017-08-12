import mongoose from 'mongoose';

const schema = mongoose.Schema({
  createdAt: Date,
  services: Object, // The provider with which the user authenticated (facebook, twitter, etc.).
  profile: {
    name: String,
    avatar: String,
    gender: String,
  },
  authProvider: String,
});

schema.statics.findOrCreate = function findOrCreate(profile, cb) {
  console.log('####profile');
  console.log(profile);
  this.findOne({ 'services.id': profile.id })
    .then((user) => {
      if (user) {
        console.log('user already exists', user);
        cb(null, user);
      } else {
        new this({
          createdAt: new Date(),
          services: profile,
          profile: {
            name: profile.displayName,
            avatar: profile.profileUrl,
            gender: profile.gender,
          },
        }).save(cb);
      }
    })
    .catch(() => { console.log('something went wrong'); });
};

const User = mongoose.model('User', schema);

export default User;
