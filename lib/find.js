(function() {
  module.exports = function(query, next) {
    var request = require('request');
    var cheerio = require('cheerio');

    var uri = 'http://9gag.com/search?query=' + query;

    var result = {
      query: null,
      sectionHeader: null,
      result: []
    };

    request({
      uri: uri,
      method: 'GET'
      }, function(err, res, html) {

      if (err) {
        return next(err, null);  
      }

      var $ = cheerio.load(html);
      
      result.query = query;
      result.sectionHeader = $('div.section-header h3').text();
      result.result = $('div.badge-entry-collection > article').map(function() {
        var item = {
          title: null,
          id: null,
          url: null,
          image: null,
          points: null,
          commentCount: null
        };
        item.title = $(this).children('header').children('a').children('h1.badge-item-title').text().trim();
        item.id = $(this).attr('data-entry-id');

        var link = $(this).children('div.post-container').children('a').attr('href');
        item.url = link.indexOf('9gag.com') === -1 ? ('http://9gag.com' + link) : link;
        item.image = $(this).children('div.post-container').children('a').children('img').attr('src');
        item.points = $(this).children('p.post-meta').children('a.badge-evt.point').children('span.badge-item-love-count').text().trim();
        item.commentCount = $(this).children('p.post-meta').children('a.badge-evt.comment').text().trim();
        item.commentCount = item.commentCount.substring(0, item.commentCount.indexOf(' comments'));

        return item;
      }).get();

      return next(null, result);
    });
  }
}());
