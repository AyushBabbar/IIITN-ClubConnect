const bodyParser = require('body-parser')
const express = require('express')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const url = process.env.MONGODB_URI;
const router = express.Router();


router.use(bodyParser.urlencoded({
    extended: true
}));

router.use(bodyParser.json());

router.get('/', (req, res, next) => {
    res.render('loginpage')
});

router.post('/admin', (req, res, next) => {
    MongoClient.connect(url, (err, db) => {
        if (err) {
            throw err;
        }
        const dbo = db.db('iiitn_gymkhana');

        const obj = {
            username: req.body.username,
            password: req.body.password
        }
        bcrypt.hash(obj.password, 8).then((encPass) => {
            console.log("encryptedPass",encPass)

        });
        const query = {username: obj.username}

        dbo.collection('LoginDetails').find(query).toArray((err, adminInDB) => {
            if (err) {
                throw err
            }
            if (adminInDB.length === 0) {
                res.redirect('/login')
            } else {
                const JWT_SECRET = process.env.JWT_SECRET;
                const admin = adminInDB[0];
                const correctPassword = bcrypt.compare(obj.password, admin.password);
                if (!correctPassword) {
                    res.redirect('/login')
                }
                console.log("Password CORRECT, loading jwt====")

                const token = jwt.sign(admin, JWT_SECRET, {expiresIn: '1h'});
                res.cookie('token', token, {httpOnly: true});
                console.log("Setting jwt token to cookies")
                res.redirect('/login/admin/events')
            }

            db.close();
        })

    })
})

router.get('/admin/events', (req, res, next) => {
    console.log("Getting admin/events")

    const JWT_SECRET = process.env.JWT_SECRET;
    const token = req.cookies.token;
    if (!token) {
        res.redirect('/login')
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.render('clubInfo', {code: 1})

    } catch (err) {
        res.redirect('/login')
    }
})

router.post('/admin/events', (req, res, next) => {
    MongoClient.connect(url, (err, db) => {
        if (err) {
            throw err;
        }
        const dbo = db.db('iiitn_gymkhana');

        const obj = {
            name: req.body.name,
            club: req.body.society,
            startDate: req.body.startDate,
            endDate: req.body.endDate
        }

        dbo.collection('Eventdata').insertOne(obj, (err, result) => {
            if (err) {
                throw err;
            }
            db.close();
        })

    })
    res.redirect('/login/admin/events');
})

router.get('/admin/logout', (req, res, next) => {
    res.clearCookie('token')
    res.redirect('/');
})


module.exports = router