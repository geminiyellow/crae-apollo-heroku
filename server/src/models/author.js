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
    .then((author) => {
      if (author) {
        console.log('author already exists');
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

const Author = mongoose.model('Author', schema);

export default Author;

/*
fbProfile example:

id: '702022729945072',
username: undefined,
displayName: undefined,
name:
{ familyName: undefined,
  givenName: undefined,
  middleName: undefined },
gender: undefined,
profileUrl: undefined,
emails: [ { value: 'federodes2@gmail.com' } ],
provider: 'facebook',
*/

/*
  services: {
    facebook: {
      accessToken: String,
      expiresAt: Number,
      id: String,
      email: String,
      name: String,
      firstName: String,
      lastName: String,
      link: String,
      gender: String,
      locale: String,
      ageRange: {
        min: Number,
      },
    },
    resume: {
      loginTokens: [String],
    },
  },
*/


/* import mongoose from 'mongoose';

const schema = mongoose.Schema({
  firstName: String,
  lastName: String,
});

const Author = mongoose.model('Author', schema);

export default Author; */
