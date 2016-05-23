//
//  Scripts for the Vodia PBX
//  (C) Vodia Networks 2015
//
//  This file is property of Vodia Networks Inc. All rights reserved. 
//  For more information mail Vodia Networks Inc., info@vodia.com.
//

function Recordings(domain, p, t, a, user) {
  this.domain = domain;
  this.progress = p;
  this.table = t;
  this.player = a;
  this.user = user;
  this.pagesize = 50;
  this.chunks = 200;
}

// Load the directory overview:
Recordings.prototype.loadDir = function (callback) {
  this.recs = [];
  var uri = this.user ? "/rest/user/" + encodeURIComponent(this.user + "@" + this.domain) : "/rest/domain/" + encodeURIComponent(this.domain);
  uri += "/recs";
  var r = new Rest(uri);
  var self = this;
  r.get(function(a) {
    self.total = a && a.length || 0;
    if(a) self.loadDetails(a, callback);
    else callback();
  });
}

Recordings.prototype.loadDetails = function (a, callback) {
  var self = this;
  var f = [];
  while(a && a.length > 0 && f.length < self.chunks) f.push(a.shift());
  if(f.length > 0) {
    var uri = this.user ? "/rest/user/" + encodeURIComponent(this.user + "@" + this.domain) : "/rest/domain/" + encodeURIComponent(this.domain);
    uri += "/recs/" + f.join(",");
    var r = new Rest(uri);
    r.get(function(l) {
      l && l.forEach(function(e) { self.recs.push(e); });
      self.showProgress(self.total - a.length);
      self.loadDetails(a, callback);
    });
  }
  else {
    self.unfiltered = self.recs;
    self.showProgress(self.total);
    callback();
  }
}

Recordings.prototype.showProgress = function (count) {
  var p = document.getElementById(this.progress);
  var percent = this.total > 0 ? count / this.total : 0;
  if(percent < 1) {
    p.innerHTML = Math.round(100 * percent) + "%";
    p.parentElement.style.display = "";
  }
  else {
    p.parentElement.style.display = "none";
  }
}

Recordings.prototype.loadPage = function (page) {
  var i, d, tr, td, input, img;
  var table = document.getElementById(this.table);
  while(table.rows.length > 1) table.deleteRow(table.rows.length - 1);
  for(i = page * this.pagesize; i < this.recs.length && i < (page + 1) * this.pagesize; i++) {
    tr = document.createElement("tr");
    td = document.createElement("td");
    input = document.createElement("input");
    input.type = "checkbox";
    input.name = "playfile[]";
    input.value = this.recs[i].file;
    td.appendChild(input);
    tr.appendChild(td);
      
    d = new Date(this.recs[i].time * 1000);
    td = document.createElement("td");
    td.appendChild(document.createTextNode(d.toLocaleString()));
    tr.appendChild(td);

    td = document.createElement("td");
    td.appendChild(document.createTextNode(prettify_from_to_spec(this.recs[i].from, session.cdomain)));
    tr.appendChild(td);
    
    td = document.createElement("td");
    td.appendChild(document.createTextNode(prettify_from_to_spec(this.recs[i].to, session.cdomain)));
    tr.appendChild(td);

    td = document.createElement("td");
    td.appendChild(document.createTextNode(this.recs[i].agent));
    tr.appendChild(td);

    td = document.createElement("td");
    if(this.recs[i].status == "") {
      img = document.createElement("img");
      img.style.cursor = "pointer";
      img.src = "img/new.gif";
      td.appendChild(img);
    }
    img = document.createElement("img");
    img.style.cursor = "pointer";
    img.src = "img/speaker.png";
    img.onclick = this.startPlayback.bind(this, i);
    img.draggable = false;
    td.appendChild(img);
    tr.appendChild(td);

    table.appendChild(tr);
  }
}

Recordings.prototype.filterCallid = function (callid, date, agent) {
  callid = callid.toLowerCase() || "";
  date = date || "";
  agent = agent.toLowerCase() || "";

  var self = this;
  self.recs = [];
  self.unfiltered && self.unfiltered.forEach(function(u) {
    var c = !callid || (u.from.toLowerCase().indexOf(callid) >= 0 || u.to.toLowerCase().indexOf(callid) >= 0);
    var d = !date || new Date(u.time * 1000).toLocaleString().indexOf(date) >= 0;
    var a = !agent || u.agent.toLowerCase().indexOf(agent) >= 0;
    if(c && d && a) self.recs.push(u);
  });
  self.loadPage(0);
}

Recordings.prototype.startPlayback = function (item) {
  var file = "audio.wav?type=recording&id=" + this.recs[item].file;
  var audio = document.getElementById(this.player);
  audio.style.display = "";
  var source = audio.getElementsByTagName("source")[0];
  source.setAttribute("src", file);
  audio.load();
}

Recordings.prototype.showTabs = function(elemName, func) {
  // Clear the element:
  var div = document.getElementById(elemName);
  if(div === null) return;
  var p = div.parentNode;
  div.innerHTML = '';

  if(this.recs.length < this.pagesize) {
    p.style.display = "none";
  }
  else {
    p.style.display = "";
    for(var i = 0; i < this.recs.length; i += this.pagesize) {
      if(i > 0) div.appendChild(document.createTextNode(" "));
      var a = document.createElement("a");
      a.href = '#';
      a.onclick = func.bind(this, i / this.pagesize);
      a.appendChild(document.createTextNode(i / this.pagesize + 1));
      div.appendChild(a);
    }
  }
}
