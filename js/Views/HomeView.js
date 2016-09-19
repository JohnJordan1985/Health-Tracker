// /js/Views/HomeView.js

/**
  * @desc File that creates tab that displays the Home page for the application
  * @author John Jordan johnjordan1985@gmail.com
  * @date 12 September 2016
  */

var app = app || {};

app.HomeView = Backbone.View.extend({
	tagName: 'section',

	template: _.template($('#home-template').html()),

	initialize: function() {
		// body...
		_.bindAll(this, 'render');
		this.homeView = $(this.el);
		this.render();
	},

	render: function(){
		this.homeView.html(this.template());
		return this;
	}

});