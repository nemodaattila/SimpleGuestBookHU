/*
 * router betöltése, létező route-k
 */

const express = require('express')
const UserService = require('../service/UserService')
const EntryService = require('../service/EntryService')

const router = express.Router();
const entryService = new EntryService();
const userService = new UserService();

//entry
router.get('/entries', entryService.readOrderedByDate)
router.get('/ownedentries/:id', entryService.readOwned);
router.get('/entries/count', entryService.count);
router.get('/entry/:id', entryService.readOne);
router.post('/entry', entryService.isAuthenticated, entryService.insert);
router.put('/entry/:id', entryService.isAuthenticated, entryService.modify);

//user
router.post('/login', userService.login);
router.post('/register', userService.register);
router.post('/checkuserpassword', userService.isAuthenticated, userService.checkPassword);
router.put('/user', userService.isAuthenticated, userService.modify);
router.delete('/user/:id', userService.delete);

module.exports = router
