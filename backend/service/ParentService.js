const jwt = require('jwt-simple');

/**
 * azon servicek ősosztálya, melyek html requesteket dolgoznak fel
 */
class ParentService{
  model;

  /**
   * header és webtoken alapján ellenőrni, hogy az adott user jogosult-e az adott művelet végrehajtására
   */
  isAuthenticated= (req, res, next) => {
    if (!req.header('Authorization')) {
      return res.status(401).send({message: 'A belépésre nem jogosult!'});
    }
    let token = req.header('Authorization').split(' ')[1];
    let payload = jwt.decode(token, 'key');
    if (!payload) {
      return res.status(401).send({message: 'Nem jogosult a belépésre!'});
    }
    req.userId = payload._id;
    next();
  }
}

module.exports = ParentService
