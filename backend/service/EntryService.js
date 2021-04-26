
const Entry = require('../model/entry');
const ParentService = require('./ParentService');
const User = require('../model/user')

/**
 * az entryService azokazt a függvényeket tzartalmazza melyek az entryvel kapcsolatos
 * html requesteket kezelik
 * az összes függvény aszinkron mongodb műveletet indít a request alapján,
 * és vissza is adja responsban az eredmémnyt/vagy hibát
 */
class EntryService extends ParentService {
  model = Entry;

  /**
   * visszadja az összes entry darabszámát
   */
  count = async (req, res) => {
    try {
      const result = await this.model.countDocuments();
      res.status(200).json(result);
    } catch (e) {
      return res.status(400).json({ error: e.message});
    }
  }

  /**
   * új entry beszúrása
   */
  insert = async (req, res) => {
    try {
      const result = await this.model(req.body).save();
      res.status(201).json(result);
    } catch (e) {
      return res.status(400).json(e.message);
    }
  }

  /**
   * egy entry visszadása
   */
  readOne = async (req, res) => {
    try {
      const result = await this.model.findOne({ _id: req.params.id});
      res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({error: e.message});
    }
  }

  /**
   * visszaad fix számú entry-t, eltolással
   */
  readOrderedByDate = async (req, res) => {
    try {
      let ownername = {};
      let result = await this.model.find().sort({date: -1}).skip(parseInt(req.query['from']))
          .limit(parseInt(req.query['limit']));
      for (let key in result)
      {
          if (!ownername.hasOwnProperty(result[key].owner))
          {
            let owner=await User.find({ _id: result[key].owner});
            ownername[result[key].owner]=owner[0].username;
          }
      }
      result = [result, ownername];
      res.status(200).json(result);
    } catch (e) {
      return res.status(400).json({error: e.message});
    }
  }

  /**
   * visszaadja az adott user entry-jeit
   */
  readOwned = async (req, res) => {
    try {
      let result = await this.model.find({owner: req.params['id']}).sort({date: -1})
      res.status(200).json(result);
    } catch (e) {
      return res.status(400).json({error: e.message});
    }
  }

  /**
   * adott entry-t módosítja
   */
  modify = async (req, res) => {
    try {
      await this.model.findOneAndUpdate({_id: req.params.id}, req.body);
      res.sendStatus(200);
    } catch (e) {
      return res.status(400).json({error: e.message});
    }
  }
}

module.exports = EntryService
