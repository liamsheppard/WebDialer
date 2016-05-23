//
//  Scripts for the Vodia PBX
//  (C) Vodia Networks 2015
//
//  This file is property of Vodia Networks Inc. All rights reserved. 
//  For more information mail Vodia Networks Inc., info@vodia.com.
//

function Rest(path) {
  this.url = path;
  this.request = new XMLHttpRequest();
}

Rest.prototype.get = function (callback) {
  var self = this;
  self.request.open("GET", self.url, true);
  self.request.onload = function() {
    try {
      if(self.request.readyState == 4) {
        var response = JSON.parse(self.request.responseText);
	try {
          callback && callback(response);
	}
	catch (e) {
	  console.log("Error with the callback for " + self.url);
	}
      }
    }
    catch (e) {
      console.log("Error parsing " + self.request.responseText);
      callback && callback(null);
    }
  }
  self.request.send("");
}

Rest.prototype.post = function (data, callback) {
  var self = this;
  self.request.open("POST", self.url, true);
  self.request.onload = function() {
    try {
      if(self.request.readyState == 4) {
        var response = JSON.parse(self.request.responseText);
        callback(response);
      }
    }
    catch (e) {
      console.log("Error parsing " + self.request.responseText);
      callback(null);
    }
  }
  self.request.setRequestHeader("Content-Type", "application/json");
  self.request.send(JSON.stringify(content));
}
