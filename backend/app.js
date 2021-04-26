
/*
*  express betöltése
*  middleware-k betöltése - naplózás, cors, routing, urlfeldolgozás
*  mongodb/mongoose csatlakozás
 */

const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const routing = require('./routing/routing');
const mongoose = require('mongoose');
const app = express();

async function mainApp(){
    try {
        mongoose.connect('mongodb://localhost/nodefinal',
            {useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify:false
            });
        app.set('port', 3000);
        app.use(cors())
        app.use(express.json());
        app.use(express.urlencoded({ extended: false}));
        app.use(morgan('dev'));
        app.use(routing);
        app.listen(app.get('port'));
        console.log("server OK")
    } catch (e) {
        console.log(e);
    }
}

mainApp();
