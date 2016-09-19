
// /js/Views/ArticleView.js

/**
  * @desc File that creates 'News' tab for display of articles related to tracked foods
  * @author John Jordan johnjordan1985@gmail.com
  * @date 06 April 2016
  */

var app = app || {};

/**
  * @constructor
  */
app.ArticleView = Backbone.View.extend({

	tagName: 'li',

	className: 'article-item',

	model: app.Article,

	events: {
		'click img.article-thumbnail': 'openArticle'
	},

	template: _.template( $('#article-template').html() ),

	initialize: function(){
		_.bindAll(this, 'render', 'openArticle');

	},

	render: function(){
		$(this.el).html( this.template(this.model.attributes) );
		return this;
	},

	/** Function that opens an article's URL in a new window the when image-associated with article is clicked */
	openArticle: function(){
		window.open(document.getElementById(this.model.get('id')).href);
	}
});