var express = require('express');
var router = express.Router();
var feedFinder = require('feed-finder');
var feedRead = require('feed-read');
var readable = require('node-readability');
var request = require('request');
const cheerio = require('cheerio');


/* GET home page. */
router.get('/:domain', function (req, res, next) {
    feedFinder(req.params.domain, function (err, feedUrls) {
        if (err) return console.error(err);

        /*feedUrls.forEach(function (feedUrl) {
         feedRead(feedUrl, function (err, articles) {
         if (err) throw err;
         // Each article has the following properties:
         //
         //   * "title"     - The article title (String).
         //   * "author"    - The author's name (String).
         //   * "link"      - The original article link (String).
         //   * "content"   - The HTML content of the article (String).
         //
         });
         });*/
        console.log(feedUrls);
        try {
            render_content(res, feedUrls[0], true);
        } catch (err) {
            console.log("whoops");
            res.send("whoops");
        }
    });

});

module.exports = router;

function render_content(res, url, first_attempt) {
    console.log(url);
    var read = 0;
    var buffer = [];
    feedRead(url, function (err, articles) {
        if ((err)&&(first_attempt)) {
            try {
                request(url, function (error, response, body) {
                    var $ = cheerio.load(body);
                    if($("a[href*='/rss/']").length>0) {
                        url = $("a[href*='/rss/']").attr('href');
                    } else if($("a[href*='/feed/']").length>0) {
                        url = $("a[href*='/feed/']").attr('href');
                    }
                    console.log(url);
                    render_content(res, url, false);
                });
            } catch (err) {
                console.log(err);
            }
            return;
        }
        // Each article has the following properties:
        //
        //   * "title"     - The article title (String).
        //   * "author"    - The author's name (String).
        //   * "link"      - The original article link (String).
        //   * "content"   - The HTML content of the article (String).
        //
        if(typeof articles !== "undefined") {
            //articles = articles.slice(0, 2);
            articles.forEach(function (article) {
                console.log(article);
                readable(article.link, function (err, article, meta) {
                    try {
                        // Main Article
                        //console.log(article.content);
                        // Title
                        //console.log(article.title);

                        // HTML Source Code
                        //console.log(article.html);
                        // DOM
                        //console.log(article.document);

                        // Response Object from Request Lib
                        //console.log(meta);

                        buffer.push({title: article.title, content: article.content});
                        // Close article to clean up jsdom and prevent leaks
                        article.close();
                    } catch (err) {
                        console.log(err);
                    }

                    read++;
                    if (read === articles.length) {
                        res.render('index', {articles: buffer});
                    }
                });
            });
        } else {
            res.render('index', {articles: [{title: "Error", content: "No Feed Found"}]});
        }

    });
}