
// /js/Models/Article.js

/**
  * @desc File that creates Backbone Model for each article returned from NYT API
  * @author John Jordan johnjordan1985@gmail.com
  * @date 06 April 2016
*/

var app = app || {};

/**
  * Article returned from NYT API
  * @constructor
  */

app.Article = Backbone.Model.extend({
	defaults: {
	//search term entered that returned the article
	searchTerm: '',
	headline: '',
	paragraph: '',
	// needs to be prepended to the image url of each returned article
	imgUrl: 'http://www.nytimes.com/',
	}
});