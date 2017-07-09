var express = require('express');
var router = express.Router();
var request = require('request');
//var pdf = require('html-pdf');
var fs = require('fs');
//var phantom = require('phantom');
var conversion = require("phantom-html-to-pdf")({
    phantomPath: require("phantomjs-prebuilt").path
});

/* GET users listing. */
router.get('/:domain', function (req, res, next) {
    request('http://localhost:3000/' + req.params.domain, function (error, response, body) {
        conversion(
            {
                html: body,
                fitToPage: true,
                waitForJS: false,
                viewportSize: {
                    width: 1024,
                    height: 768
                }
            }, function (err, pdf) {
                console.log(pdf.logs);
                console.log(pdf.numberOfPages);
                pdf.stream.pipe(res);
            });
    });
});

module.exports = router;
