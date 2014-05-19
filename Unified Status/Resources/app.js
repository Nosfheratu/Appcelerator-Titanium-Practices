var fb = require('facebook');
var social = require('social_plus');

var twitter = social.create({
	consumerSecret: Ti.App.Properties.getString('twitter.consumerSecret'),
	consumerKey: Ti.App.Properties.getString('twitter.consumerKey')
});

var win = Ti.UI.createWindow({
	title: 'Unified Status',
	backgroundGradient: {
		startPoint: { x: '0%', y: '0%' },
		endPoint: { x: '0%', y: '100%' },
		colors: [{ color: '#813eba' }, { color: '#000' }]
	}
});

win.add(Ti.UI.createLabel({
	text: 'Post a Message',
	color: '#fff',
	top: 4,
	width: '90%',
	textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
	font: {
		fontSize: '22sp'
	}
}));

var txtStatus = Ti.UI.createTextArea({
	top: 37,
	width: '90%',
	height: 100,
	color: '#000',
	maxLength: 140,
	borderWidth: 3,
	borderRadius: 4,
	borderColor: '#401b60',
	font: {
		fontSize: '16sp'
	}
});

win.add(txtStatus);

txtStatus.addEventListener('change', function(e) {
	lblCount.text = e.value.length + '/140';
	
	if (e.value.length > 120) {
		lblCount.color = 'red';
	} else {
		lblCount.color = 'white';
	}
	
	btnPost.enabled = !(e.value.length === 0);
});

var lblCount = Ti.UI.createLabel({
	text: '0/140',
	top: 134,
	width: '90%',
	color: '#fff',
	textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT
});

win.add(lblCount);

var btnPost = Ti.UI.createButton({
	title: 'Post',
	top: 140,
	width: 150
});

win.add(btnPost);

btnPost.addEventListener('click', function() {
	if (fb.loggedIn) {
		postFacebookMessage(txtStatus.value);
	}
	
	if (twitter.isAuthorized()) {
		postTwitterMessage(txtStatus.value);
	}
	
	txtStatus.blur();
	
	txtStatus.value = '';
	lblCount.text = '0/140';
});

var bottomView = Ti.UI.createView({
	bottom: 4,
	width: '90%',
	height: Ti.UI.SIZE
});

var fbView = Ti.UI.createImageView({
	backgroundColor: '#3B5998',
	image: 'images/fb-logo-disabled.png',
	borderRadius: 4,
	width: 100, left: 10,
	height: 100
});

bottomView.add(fbView);

fbView.addEventListener('click', function() {
	toggleFacebook(!fb.loggedIn);
});

var twitView = Ti.UI.createImageView({
	backgroundColor: '#9AE4E8',
	image: 'images/twitter-logo-disabled.png',
	borderRadius: 4,
	width:100,
	right: 10,
	height: 100
});

bottomView.add(twitView);

twitView.addEventListener('click', function() {
	toggleTiwtter(!twitter.isAuthorized());
});

win.add(bottomView);

if (Ti.Platform.osname == 'android') {
	var activity = win.activity;//Ti.Android.currentActivity;
	
	activity.onCreateOptionsMenu = function(e) {
		var menu = e.menu;
		var menuItem = menu.add({
			title: 'Settings'
		});
		
		menuItem.setIcon(Ti.Android.R.drawable.ic_menu_preferences);
		
		menuItem.addEventListener('click', function(e) {
			Ti.UI.Android.openPreferences();
		});
	};
}

win.addEventListener('click', function() {
	txtStatus.blur();
});

loadSettings();

win.open();

fb.appid = Ti.App.Properties.getString('ti.facebook.appid');

fb.permissions = ['publish_actions'];

function toggleFacebook(isActive) {
	if (isActive) {
		if (!fb.loggedin) {
			fb.authorize();
		}
	} else {
		fb.logout();
	}
	
	Ti.App.Properties.setBool('facebook_preference', isActive);
}

fb.addEventListener('login', function(e) {
	if (e.success) {
		fbView.image = 'images/fb-logo.png';
	} else if (e.error) {
		alert(e.error);
	} else if (e.cancelled) {
		alert('Canceled');
	}
});

fb.addEventListener('logout', function(e) {
	fbView.image = 'images/fb-logo-disabled.png';
});

function postFacebookMessage(msg) {
	fb.requestWithGraphPath('me/feed', {
		message: msg
	}, 'POST', function(e) {
		if (e.success) {
			Ti.API.info("Success! " + e.result);
		} else {
			if (e.error) {
				alert(e.error);
			} else {
				alert('Unknown result');
			}
		}
	});
}

function toggleTiwtter(isActive) {
	if (isActive) {
		if (!twitter.isAuthorized()) {
			twitter.authorize(function() {
				twitView.image = 'images/twitter-logo.png';
			});
		} else {
			twitView.image = 'images/twitter-logo-disabled.png';
		}
	} else {
		twitter.deauthorize();
		twitView.image = 'images/twitter-logo-disabled.png';
	}
	
	Ti.App.Properties.setBool('twitter_preference', isActive);
}

function postTwitterMessage(msj) {
	twitter.share({
		message: msj,
		success: function() {
			Ti.API.info('Tweeted!');
		},
		error: function() {
			alert("Error from Twitter Tweeter");
		}
	});
}

function loadSettings() {
	var fb = Ti.App.Properties.getBool('facebook_preference', false);
	var tw = Ti.App.Properties.getBool('twitter_preference', false);
	
	toggleFacebook(fb);
	toggleTiwtter(tw);
}
