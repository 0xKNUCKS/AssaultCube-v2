'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

router.post('/', (req, res) => {
    const body = JSON.parse(Object.keys(req.body)[0]);
    console.log("Recieved POST request: ", body);
    res.send(body)
})

module.exports = router;
