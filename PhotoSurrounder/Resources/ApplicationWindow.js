var PhotoViewerWindow = require('PhotoViewerWindow');

function ApplicationWindow() {
	var FLICKR_KEY = Ti.App.Properties.getString('flickr.key');
	
	var self = Ti.UI.createWindow({
		backgroundColor: '#fffbd0',
		navBarHidden: true
	});
	
	Ti.Geolocation.purpose = 'Location will be used for photosearch';
	Ti.Geolocation.preferredProvider = Titanium.Geolocation.PROVIDER_GPS;
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
	Titanium.Geolocation.distanceFilter = 10;
	
	if( Titanium.Geolocation.locationServicesEnabled === false ) {
	    Ti.API.debug('Your device has GPS turned off. Please turn it on.');
	}
	
	var header = Ti.UI.createView({
		top: 0,
		width: Ti.UI.FILL,
		height: 50,
		backgroundColor: '#c13100'
	});
	
	header.add(Ti.UI.createLabel({
		text: 'Photo Surrounder',
		color: '#fff',
		left: 10,
		font: {
			fontSize: '22sp',
			fontWeight: 'bold'
		}
	}));
	
	var btnRefresh = Ti.UI.createImageView({
		image: 'refresh.png',
		right: 3
	});
	
	btnRefresh.addEventListener('click', function() {
		self.refreshData();
	});
	
	header.add(btnRefresh);
	
	self.add(header);
	
	var photoTemplate = {
		properties: {
			height: 60,
			accesoryType: Ti.UI.LIST_ACCESSORY_TYPE_DETAIL
		},
		childTemplates: [{
			type: 'Ti.UI.ImageView',
			bindId: 'thumb',
			properties: {
				left: 0,
				width: 45
			}
		},
		{
			type: 'Ti.UI.Label',
			bindId: 'rowtitle',
			properties: {
				left: 48,
				top: 1,
				color: '#cc6600'
			}
		},
		{
			type: 'Ti.UI.Label',
			bindId: 'coordinates',
			properties: {
				left: 48,
				bottom: 2,
				width: '75%',
				textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
				color: '#fff',
				backgroundColor: '#ff9900',
				font: {
					size: '6sp'
				}
			}
		}]
	};
	
	var listView = Ti.UI.createListView({
		top: 50,
		templates: {
			'photo': photoTemplate
		},
		defaultItemTemplate: 'photo'
	});
	
	listView.addEventListener('itemclick', function(e) {
		var photoWin = new PhotoViewerWindow(e.itemId);
		
		photoWin.open();
	});
	
	var xhr = Ti.Network.createHTTPClient();
	
	xhr.onload = function() {
		var json = JSON.parse(this.responseText),
			jsonImages = json.photos.photo,
			image,
			images = [],
			preview = [];
		
		for (index in jsonImages) {
			image = jsonImages[index];
			images[index] = image;
			preview[index] = image.url_t;
		}
		
		var data = [];
		
		for (var i = 0; i < images.length; i++) {
			data.push({
				rowtitle: {
					text: images[i].title
				},
				thumb: {
					image: preview[i]
				},
				coordinates: {
					text: images[i].longitude + ', ' + images[i].latitude
				},
				properties: {
					itemId: JSON.stringify(images[i])
				}
			});
		}
		
		var section = Ti.UI.createListSection({
			items: data
		});
		
		listView.appendSection(section);
	};
	
	self.add(listView);
	
	self.refreshData = function() {
		Ti.Geolocation.getCurrentPosition(function(e) {
			if (!e.success || e.error) {
				Ti.API.error(JSON.stringify(e.error));
				alert('error ' + JSON.stringify(e.error));
				
				return;
			}
			
			Ti.App.fireEvent('app:got.location', e);
			
			Ti.API.info('Geolocation: '
				+ 'long ' + e.coords.longitude
				+ ' lat ' + e.coords.latitude);
			
			xhr.open('GET', 'https://api.flickr.com/services/rest/'
				+ '?method=flickr.photos.search'
				+ '&api_key=' + FLICKR_KEY
				+ '&has_geo=true'
				+ '&lat=' + e.coords.latitude
				+ '&lon=' + e.coords.longitude
				+ '&extras=geo%2Curl_t%2Curl_n'
				+ '&format=json'
				+ '&nojsoncallback=1');
			xhr.send();
			
			listView.deleteSectionAt(0);
		});
	};
	
	Ti.App.addEventListener('app:got.location', function(e) {
		Ti.API.debug(JSON.stringify(e));
		Ti.Geolocation.removeEventListener('location', self.refreshData);
	});
	
	self.addEventListener('open', function() {
		self.refreshData();
	});
	
	Titanium.Geolocation.addEventListener('location', self.refreshData);
	
	return self;
}

module.exports = ApplicationWindow;
