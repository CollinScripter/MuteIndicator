//META{"name":"MuteIndicator"}*//

class MuteIndicator {
	getName() { return "MuteIndicator"; }
	getDescription() { return "Indicator that pops on screen when you're muted and in voice chat."; }
	getVersion() { return "0.0.6"; }
	getAuthor() { return "CollinScripter"; }
	
	initConstructor() {
		this.muted = false;
		this.inVC = false;
		this.win = null;
		this.dimensions = null;
		this.mutationObserver = null;
		this.voiceObserver = null;
	}
	
	changeWindow() {
		var self = this;
		if (self.muted && self.inVC) self.enableWindow();
		if (!(self.muted && self.inVC)) self.disableWindow();
	}
	
	enableWindow() {
		var self = this;
		if (self.win == null) {
			const {BrowserWindow} = require('electron').remote;
			self.win = new BrowserWindow({
				width: self.dimensions.width, 
				height: self.dimensions.height, 
				frame: false, 
				alwaysOnTop: true,
				focusable: false,
				transparent: true
			});
			self.win.setIgnoreMouseEvents(true);
			self.win.loadURL(`file://${__dirname}/MuteIndicator.html`);
			self.win.webContents.on('did-finish-load', function() {
				self.win.show();
			});
		}
	}
	
	disableWindow() {
		var self = this;
		if (self.win != null) self.win.close();
		self.win = null;
	}
	
	
	start() {
		var self = this;
		var mute = document.getElementsByClassName("iconButtonDefault-2cKx7- iconButton-3V4WS5 da-iconButtonDefault da-iconButton button-2b6hmh da-button small--aHOfS");
		var channelBar = document.getElementsByClassName("channels-Ie2l6A vertical-V37hAW flex-1O1GKY directionColumn-35P_nr da-channels da-vertical da-flex da-directionColumn");
		const electron = require('electron').remote;
		self.dimensions = electron.screen.getPrimaryDisplay().size;
		
		if (mute[0].style.cssText == 'background-image: url("/assets/896770bf2d6ed0358ed0adefdbe96a24.svg");') {
			self.muted = true;
		}
		
		if (document.getElementsByClassName("container-1UB9sr").length > 0) {
			self.inVC = true;
		}
		
		self.changeWindow();
		
		self.muteObserver = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.oldValue == "Mute") {
					self.muted = true;
					self.changeWindow();
				} else if (mutation.oldValue == "Unmute") {
					self.muted = false;
					self.changeWindow();
				}
			});
		});
		
		self.muteObserver.observe(mute[0], {
			attributes: true,
			characterData: true,
			childList: true,
			subtree: false,
			attributeOldValue: true,
			characterDataOldValue: true
		});
		
		
		self.voiceObserver = new MutationObserver(function(mutations) {
			var voiceMenu = document.getElementsByClassName("container-1UB9sr");
			if (voiceMenu[0] && !self.inVC) {
				self.inVC = true;
			} else if (self.inVC) {
				self.inVC = false;
			}
			self.changeWindow();
		});
		
		self.voiceObserver.observe(channelBar[0], {
			childList: true,
			subtree: false
		});
	}

	stop() {
		this.disableWindow();
		this.muteObserver.disconnect();
		this.voiceObserver.disconnect();
	}
}