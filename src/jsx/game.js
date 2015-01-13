var initRoutes = require("./Routes");
var CodeSample = require("./CodeSample.js");
var LevelView = require("./LevelView.js");
var ResultsView = require("./ResultsView.js");

function renderGame(component){
	React.render(component, document.getElementById("gameContainer"));
}

var Game = function(){
	this.run = function(){
		this.levelIndex = 0;
		this.score = 0;
		this.maxScore = 0;
		$.getJSON("data/data.json", function(data) {
			this.levelsData = data;
			this.levels = _.map(data, function(c) { return new CodeSample(c); });
			initRoutes(this);
		}.bind(this));
	};
	
	this.setLevelIndex = function(levelIndex){
		if (levelIndex < 0 || levelIndex >= this.levels.length)
			return false;
		this.levelIndex = levelIndex;
		return true;
	};

	this.currentLevel = function(){
		if (this.levelIndex >= this.levels.length)
			throw new Error("Game is finished");
		return this.levels[this.levelIndex];
	};

	this.start = function(levelIndex){
		_gaq.push(['_trackEvent', 'start', 'start-from.' + levelIndex, '']);
		this.score = 0;
		if (levelIndex > 0 && levelIndex < this.levels.length)
			this.levelIndex = levelIndex;
		else
			this.levelIndex = 0;
		this.maxScore = this.currentLevel().bugsCount;
		this.renderLevel();
	};

	this.renderLevel = function(){
		renderGame(<LevelView
			key={"level_" + this.levelIndex}
			level={this.levelIndex}
			score={this.score}
			codeSample={this.currentLevel()}
			onNext={this.handleNext} />);
	};

	this.playAgain = function(){
		this.start(0);
	}.bind(this);

	this.renderResults = function(){
		_gaq.push(['_trackEvent', 'result', 'result.' + this.score, '']);
		renderGame(<ResultsView	
			score={this.score}
			maxScore={this.maxScore}
			onPlayAgain={this.playAgain}/>);
	};

	this.handleNext = function(score){
		_gaq.push(['_trackEvent', 'level-solved', 'level-solved.' + this.levelIndex, '']);
		this.score = score;
		if (this.levelIndex >= this.levels.length-1)
			this.renderResults();
		else {
			this.levelIndex++;
			this.renderLevel();
			this.maxScore += this.currentLevel().bugsCount;
		}
	}.bind(this);


}

module.exports = Game;