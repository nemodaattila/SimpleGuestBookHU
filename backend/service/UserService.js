const User = require('../model/user');
const ParentService = require('./ParentService');
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
const Entry = require('../model/entry')

/**
 * a userService azokazt a függvényeket tzartalmazza melyek az userrel kapcsolatos
 * html requesteket kezelik
 * az összes függvény aszinkron mongodb műveletet indít a request alapján,
 * és vissza is adja responsban az eredmémnyt/vagy hibát
 */

class UserService extends ParentService{
    model= User

    /**
     * user adatai alapján egyedit web token generélása és elküldése
     */
    generateAndSendToken(res, data) {
      let token = jwt.encode({_id: data._id, username: data.username, email: data.email, rank: data.rank}, 'key');
      res.status(200).send({ token });
    }

    /**
     * user beléptetése
     * validálás jwt token generálás
     */
    login = async (req, res)=>{
      try {
          const data = await this.model.findOne({email: req.body.email })
          if (!data){
              return res.status(500).json("LOGIN_USER : USER_NOT_EXISTS");
          }
          if (data.username === "DELETED_USER")
          {
               return res.status(500).json("LOGIN_USER : LOGIN_WITH_THIS_USER_iS_FORBIDDEN");
          }
          const isCorrect= await data.comparePasswords(req.body.password)
          if (!isCorrect) {
              return res.status(500).json("LOGIN_USER : BAD_USERNAME_OR_PASSWORD");
          }
          this.generateAndSendToken(res, data)
      }
      catch (e) {
          return res.status(500).json(e.message);
      }
    }

    /**
     * user beregisztálása
     * validálás
     * webtoken generálás
     */
    register=(req,res)=>{
      try{
          User(req.body).save((err, newUser) => {
              if (err)
              {
                  return res.status(500).json(err.message);
              }
              if (!newUser){
                  return res.status(500).json("REGISTER_USER : REGISTER_ERROR");
              }
              this.generateAndSendToken(res, newUser)
          });
      }
      catch (e) {
          return res.status(500).json( e.message);
      }
    }

    /**
     * user módosítása
     * validálás, jelszóhash, webtoken frissítés
     */
    modify = async (req, res) => {
        try {
            if (req.body.hasOwnProperty('oldpassword'))
            {
                let data = await this.model.findOne({_id: req.body._id })
                let correct = data.comparePasswords(req.body.oldpassword);
                if (!correct) {
                    return res.status(500).json("MOODIFY_USER_PASSWORD : BAD_ORIGINAL_PASWORD");
                }
                delete req.body.oldpassword;
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        return res.status(500).json("MOODIFY_USER_PASSWORD : SALT_ERROR");
                    }
                    bcrypt.hash(req.body.password, salt, null,async (error, hash) => {
                        if (error) {
                            return res.status(500).json("MOODIFY_USER_PASSWORD : HASH_ERROR");
                        }
                        req.body.password = hash;
                        await this.model.findOneAndUpdate({_id: req.body._id}, req.body);
                        const data = await this.model.findOne({_id: req.body._id});
                        this.generateAndSendToken(res, data)
                    });
                });
            }
            else
            {
                await this.model.findOneAndUpdate({_id: req.body._id}, req.body);
                const data = await this.model.findOne({_id: req.body._id});
                this.generateAndSendToken(res, data)
            }
        } catch (e) {
            return res.status(400).json({error: e.message});
        }
    }

    /**
     * user törlése
     * a törlendő user entry-jeinek ID-ját a Deleted_useréhez állítja
     */
    delete = async (req, res) => {
        try {
            const deluser = await this.model.findOne({username: "DELETED_USER" })
            const newdata = {owner: deluser.id};
            await Entry.updateMany({owner: req.params.id}, newdata);
            await this.model.findOneAndRemove({_id: req.params.id});
            res.sendStatus(200);
        } catch (e) {
            return res.status(400).json({error: e.message});
        }
    }

    /**
     * ellenőrzi hogy a megadott jelszó egyezik-e a shémában lévővel
     */
    checkPassword = async (req, res) => {
        try {
            let data = await this.model.findOne({_id: req.body._id})
            let correct = data.comparePasswords(req.body.password);
            if (!correct) {
                return res.status(500).json("DELETE_USER : INCORRECT_PASSWORD");
            }
            return res.status(200).json('OK');
        } catch (e) {
            return res.status(400).json({error: e.message});
        }
    }
}

module.exports = UserService
