
// /js/Views/NewsView.js

/**
  * @desc File that creates tab for the display of the 'News' tab
  * @author John Jordan johnjordan1985@gmail.com
  * @date 12 April 2016
  */

var app = app || {};

// Variables for use in NYT API request

app.searchTerm = '';
app.nytBaseUrl = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=';
app.nytFilter = '&fq=news_desk: ("Health" "Dining" "Food")&limit=5';
app.nytApiKey = '2141985155bf38e1c8c4b50d991bffa1:13:73566414';
app.nytFullUrl = app.nytBaseUrl + app.searchTerm + app.nytFilter + '&sort=newest&api-key=' + app.nytApiKey;

app.articleCollection = new Backbone.Collection();
app.docs = [];
app.NewsView = Backbone.View.extend({

	tagName: 'section',

	events:{},

	template: '',

	initialize: function(collection){

		_.bindAll(this, 'render', 'getArticlesFromServer', 'buildModelsOfArticles', 'trigger');
		$(this.el).prepend('<h1 id="user-message"></h1>');
		$(this.el).prepend('<p>A selection of articles from the New York Times, automatically generated based on your daily tracked foods.');
		$(this.el).append('<img id="gif-loader" src="assets/images/ajax-loader.gif" alt="Loading GIF displayed">');
		$(this.el).append('<hr><ul id="list"></ul><hr>');
		this.gifLoader = $("#gif-loader", this.el);

		this.list = $('#list', this.el);
		// Cache reference to user-message div
		this.userMessage = $('#user-message', this.el);
		// Advises user of reason for blank article list, provided server can be reached

		this.listenTo(app.articleCollection, 'change add remove', this.render);

		this.trigger();
	},

	render: function(){

		this.list.empty();
		// Clear out previous messages, if any
		this.userMessage.empty();
		/** Following code was used to inform users if their tracked foods failed to return any articles
		  * from the NYT. After user testing, it was decided that it was always better to display
		  * something rather than nothing
		  */
		// if(app.articleCollection.models.length === 0 && app.dailyTrackedFoods.models.length === 0){
		// 	$('#user-message', this.el).text('You do not appear to have chosen any food items today. Hence, there are no articles to display.');
		// }
		// if(app.articleCollection.models.length === 0 && app.dailyTrackedFoods.models.length > 0){
		// 	$('#user-message', this.el).text('Whatever foods you have chosen today appear to be too obscure for even the normally \340 la mode New York Times to have articles about. Hence, there are no articles to display.');

		// } else if (app.articleCollection.models.length > 0) {
		// 	this.userMessage.empty();
		// }

		app.articleCollection.each(function(model){

			//Make a view from the model

			var articleView = new app.ArticleView({
				model: model
			});

			this.list.append( articleView.render().el);
		}, this);

		return this;
	},

	getArticlesFromServer: function(term){
		var self = this;
		app.nytFullUrl = app.nytBaseUrl + term + app.nytFilter + '&sort=newest&api-key=' + app.nytApiKey;
		$.ajax({
			'context': this,
			'type': 'GET',
			'url': app.nytFullUrl,
			'dataType': 'json',

			// When AJAX request completes, hide loading GIF

			complete: function(){
				this.gifLoader.hide();
			},

			success: function(data){
				// Hide GIF loading image
				this.gifLoader.hide();
				app.docs = data.response.docs;
				// Want to keep only first five articles returned, if five articles exist in array
				if ( app.docs.length > 5) {
					app.docs.length = 5;
				}
				self.buildModelsOfArticles();
			},

			error: function(){
				// Hide GIF loading image
				this.gifLoader.hide();
				//Notify user of error in connection
            	app.notifyUser("The New York Times couldn't be reached. Please check your internet connection and try again. That or buy a newspaper.", [], '#user-message', '#f22');
			}
		});
	},

	//Function that converts JSON data into models
	buildModelsOfArticles: function(){
		// Declare holding variable for id attribute outside for loop
		var idOfArticle;

		app.docs.forEach(function(item){
			/**
			  * Creates reference to article's unique id that will be used to programmatically
			  * click on the article's hyperlink when the user clicks on the article's image
			  */
			idOfArticle = item._id;

			//Catches objects returned from server that have an empty multimedia array
			if ( item.multimedia.length === 0) {
				item.multimedia.url = '';
			} else {
				/** Stores image URL for concatenation to default imgUrl of 'http://www.nytimes.com/'
				  * so image can be loaded
				  */
				item.multimedia.url = item.multimedia[0].url;
			}

			//Create models from app.doc elements
			var article = new app.Article ({
				// Sets unique id reference to article for further manipulation
				id: idOfArticle,
				searchTerm: app.searchTerm,
				headline: '<a id="' + idOfArticle + '" href="' + item.web_url + '" target="_blank">' + item.headline.main + '</a>',
				paragraph: item.lead_paragraph,
			});

			//Sets model attribute to download image
			article.set({'imgUrl': article.get('imgUrl') + item.multimedia.url});

			//Add article model to global collection
			app.articleCollection.add(article);

		}, this);
	},

	/** Helper function that allows getArticlesFromServer to be indirectly called
	  * by user input. Choose indirect handling of user input , as DOM element
	  * passed as first parameter and I wanted the 'searchTerm' to be passed
	  */

	trigger: function(){
		// Clear out app.articleCollection
		app.articleCollection.reset();
		// Iterate through the array of keywords gleaned from the 'dailyTrackedFood' Collection
		app.dailyViewSearchTerms.forEach(function(term){
			/** Pass each keyword through, to send to NYT servers
			  * In order to avoid XMLHttp errors due to null search term
			  * create a default search term of 'food'.
			  */
			if(term === '') {
				term = 'food';
			}
			this.getArticlesFromServer(term);
		}, this);
		/** Following code used if user's tracked foods failed to return any articles
		  * from the NYT. After user testing, it was decided that it was always better to display
		  * something rather than nothing.
		  */
		if(app.dailyViewSearchTerms.length === 0 || app.articleCollection.models.length === 0){
			this.getArticlesFromServer('food');
		}

		/** Following code displays a loading GIF in the user-message DOM element
		  * while awaiting response from server
		  */

	},
});