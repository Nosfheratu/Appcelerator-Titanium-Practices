var PreferenceService = function() {};

PreferenceService.prototype.saveObjective = function(value) {
	Ti.App.Properties.setInt('objective', value);
};

PreferenceService.prototype.getObjective = function() {
	return Ti.App.Properties.getInt('objective', 1);
};

PreferenceService.prototype.getPortfolioValue = function() {
	return Ti.App.Properties.getInt('portfolioValue', 0);
};

var saveStocks = function(list) {
	Ti.App.Properties.setList('stocks', list);
	updatePortfolioValue(list);
};

PreferenceService.prototype.saveStocks = saveStocks;

var getStocks = function() {
	return Ti.App.Properties.getList('stocks', []);
};

PreferenceService.prototype.getStocks = getStocks;

PreferenceService.prototype.updateStock = function(updateStock) {
	var allStocks = getStocks();
	
	for (var i=0; i < allStocks.length; i++) {
		if (allStocks[i].symbol === updateStock.symbol) {
			allStocks[i] = updateStock;
		}
	}
	
	saveStocks(allStocks);
};

function updatePortfolioValue(stocks) {
	var totalValue = 0.00;
	
	for (var i=0; i < stocks.length; i++) {
	  var s = stocks[i];
	  
	  totalValue += (s.price * s.quantity);
	}
	
	Ti.App.Properties.setInt('portfolioValue', totalValue);
}

var pref = new PreferenceService();
module.exports = pref;
