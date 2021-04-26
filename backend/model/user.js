/*
 * fórum userek moongoose shemája
 * username: felhasználónév
 * email: email cim
 * password: jelszó
 * rank: admin / (egyszerű) user
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  email: {type: String, unique: true, lowercase: true},
  password: String,
  rank: String
});

/**
 * minden felhasználó mentés előtt lefut
 * salt generálás, és a password hashalése
 */
userSchema.pre('save', function(next) {
  const user = this;
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, null,(error, hash) => {
      if (error) {
        return next(error);
      }
      user.password = hash;
      next();
    });
  });
});

/**
 * beirt jelszó összehasonlítása a mentettel
 * @param typedPassword a beírt jelszó
 * @returns {*} bool egyenlő e a két jelszó
 */
userSchema.methods.comparePasswords = function(typedPassword) {
  return bcrypt.compareSync(typedPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
