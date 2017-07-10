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
    request('http://' + req.get('host') + '/' + req.params.domain, function (error, response, body) {
        conversion(
            {
                html: body,
                fitToPage: false,
                waitForJS: false,
                viewportSize: {
                    width: 1024*2,
                    height: 1320*2
                },
                paperSize:  {
                    width: '8.5in',
                    height: '11in'
                },
                css: 'http://' + req.get('host') + '/stylesheets/phantom.css'
            }, function (err, pdf) {
                //console.log(pdf.logs);
                console.log(pdf.numberOfPages);
                res.attachment(req.params.domain + '.pdf');
                pdf.stream.pipe(res);
            });
    });
});

module.exports = router;
