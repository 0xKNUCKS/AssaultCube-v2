'use strict';
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

router.post('/', (req, res) => {
    console.log("Recieved POST request: ", req.body);

    res.status(200).set({
        'Content-Type': 'text/plain',
    }).send(`Get back your god damn request gng ${JSON.stringify(req.body)}`)
})

module.exports = router;
