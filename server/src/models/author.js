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


import mongoose from 'mongoose';

const schema = mongoose.Schema({
  firstName: String,
  lastName: String,
});

const Author = mongoose.model('Author', schema);

export default Author;
