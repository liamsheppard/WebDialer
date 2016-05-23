//
//  Scripts for the Vodia PBX
//  (C) Vodia Networks 2013
//
//  This file is property of Vodia Networks Inc. All rights reserved. 
//  For more information mail Vodia Networks Inc., info@vodia.com.
//

//
// Things related to the language and translation.
//

// Keep the list of files to be translated golbal, so that we can also add fines that we need.
var translateFiles = {};
var filename = "";
var helpLinks = {};

function translateItems() {
  var tags = ["span", "label", "option", "title", "p", "h1", "h2", "h3", "div", "td", "button", "b"];
  var help = {"index":1}; // The neccessary help items
  var i, j, list;
  filename = document.location.pathname.split("?")[0].split("/").pop();

  // Find out what we need:
  for (i = 0; i < tags.length; i++) {
    var items = document.getElementsByTagName(tags[i]);
    for (j = 0; j < items.length; j++) {
      var txt = items[j].innerHTML;
      if (txt.substring(0, 1) == "#") {
        var a = txt.substr(1).split(" ");
        if (a.length == 1) translateFiles[filename] = 1;
        else if (a.length == 2) translateFiles[a[0]] = 1;
      }
      else if (txt.substring(0, 5) == "help:") {
        help[txt.substring(5).toLowerCase()] = 1;
      }
    }
  }

  list = []; for (i in translateFiles) list.push(i == "" ? "-" : i);
  loadLang(list);
  list = []; for (i in help) list.push(i);
  helpLinks = getRest("/rest/system/help/" + session.lang + "/" + list.join(","));

  // Go through all relevant entries:
  for (i = 0; i < tags.length; i++) {
    var items = document.getElementsByTagName(tags[i]);
    for (j = 0; j < items.length; j++) {
      var txt = items[j].innerHTML;
      if (txt.substring(0, 1) == "#") {
        var a = txt.substr(1).split(" ");
        var fn, nn;
        if (a.length == 1) { fn = filename; nn = a[0]; }
        else if (a.length == 2) { fn = a[0]; nn = a[1]; }
        setInnerText(items[j], lang(fn, nn));
        if (session.edit) {
          items[j].fn = [fn, nn];
          items[j].oncontextmenu = function () { editTranslation(this); return false; }
        }
      }
      else if (txt.substring(0, 5) == "help:") {
        items[j].innerHTML = "<a href=\"" + helpLinks[txt.substring(5).toLowerCase()] + "\" target=\"_blank\"><img src=\"img/help2.gif\" alt=\"Help\" /></a>";
      }
    }
  }

  // Hack hack: Do the hardwired help links here:
  var helptop = document.getElementById("helptop");
  if (helptop) helptop.href = helpLinks["#"];
  var helpbottom = document.getElementById("helpbottom");
  if (helpbottom) helpbottom.href = helpLinks["#"];
}

// If we are in edit mode, show all the translated items in a table for editing:
function getTranslationTable() {
  var table = document.getElementById("transtbl");
  if(!table) return;
  table.innerHTML = "";
  var tr = document.createElement("tr");
  appendTdToTr(tr, "Item");
  appendTdToTr(tr, "Text");
  table.appendChild(tr);
  for (var i in usedItems) {
    tr = document.createElement("tr");
    td = document.createElement("td");
    td.style.verticalAlign = "top";
    setInnerText(td, i);
    var img = document.createElement("img");
    img.src="/img/edit.gif";
    img.fn = usedItems[i];
    img.onclick = function () { editTranslation(this); return false; }
    td.appendChild(img);
    tr.appendChild(td);
    td = document.createElement("td");
    setInnerText(td, translations[i]);
    tr.appendChild(td);
    table.appendChild(tr);
  }
  return table;
}

// Edit something:
function editTranslation(o) {
  var t = o.fn[1];
  var p = o.fn[0];

  // Remember t:
  document.getElementById("te-element").value = t;
  document.getElementById("te-page").value = p;
  document.getElementById("te-object").obj = o;

  // Bring the prompt to the top:
  var txtedit = document.getElementById("texteditor");
  txtedit.style.display = "";
  txtedit.style.top = (event.pageY + 20) + "px";
  txtedit.style.left = event.pageX + "px";

  // Get the English content:
  var to = document.getElementById("te-old");
  var xp = (p == "" ? p : p + "/");
  var pe = "/rest/system/dict/en/" + xp + t;
  var px = "/rest/system/dict/" + session.lang + "/" + xp + t;
  var en = getRest(pe);
  var xx = pe == px ? en : getRest(px);
  setInnerText(to, en);
  document.getElementById("te-index").innerHTML = "Item: #" + p + " " + t;

  // Copy the current content into the textarea field:
  var tn = document.getElementById("te-new");
  var e = document.getElementById(t);
  tn.value = xx;
}

// Save what has been edited:
function saveTranslation() {
  // Make the form disappear:
  document.getElementById("texteditor").style.display = "none";
  var t = document.getElementById("te-element").value;
  var p = document.getElementById("te-page").value;
  var n = document.getElementById("te-new").value;
  var e = document.getElementById("te-object").obj;
  setInnerText(e, n);
  var xp = (p == "" ? p : p + "/");
  putRest("/rest/system/dict/" + session.lang + "/" + xp + t, n);
}

// The global dictionary:
var translations = {};
var loadedTranslations = {}; // Make sure we don't load twice
var usedItems = {};

// Add the file to the dictionary items (l):
function loadLang(file) {
  if (file instanceof Array) {
    var f = "";
    for (var i = 0; i < file.length; i++) {
      if (file[i] in loadedTranslations) continue;
      loadedTranslations[file[i]] = 1;
      if (i > 0) f += ",";
      f += file[i];
    }
    if (f == "") return; // Everything already loaded
  }
  else {
    if (loadedTranslations[file] > 0) return;
    loadedTranslations[file] = 1;
    var f = file;
  }

  var n = getRest("/rest/system/translation/" + session.lang + "/" + f);
  for (var i in n) {
    translations[i] = n[i];
  }
}

function lang(file, item, arg0, arg1) {
  // Get the translation:
  var idx = file + "#" + item;
  usedItems[idx] = [file, item];
  if (!(idx in translations))
    return "[" + idx + "]";
  var txt = translations[idx];

  // Check if there is any replacement:
  if (arg0) {
    txt = txt.replace("{0}", arg0);
    if (arg1) {
      txt = txt.replace("{1}", arg1);
    }
  }

  return txt;
}

function setInnerText(element, text) {
  if (typeof (element) == "string") element = document.getElementById(element);
  element.innerHTML = "";
  element.appendChild(document.createTextNode(text));
}

function appendTdToTr(element, text) {
  var td = document.createElement("td");
  td.appendChild(document.createTextNode(text));
  element.appendChild(td);
}

function showHHMM(secs) {
  var days = Math.floor(secs / (24 * 3600));
  secs = Math.floor(secs);
  secs -= days * 24 * 3600;
  var hours = Math.floor(secs / 3600);
  secs -= hours * 3600;
  var minutes = Math.floor(secs / 60);
  secs -= minutes * 60;
  var result = "";
  if (days > 0) result += days + "d ";
  if (days > 0 || hours > 0) result += ("0" + hours).slice(-2) + ":";
  result += ("0" + minutes).slice(-2) + ":" + ("0" + secs).slice(-2);
  return result;
}

// Add all the help links to the page
function addHelpLinks() {
  var elements = document.getElementsByTagName("a");
  for (var i = 0; i < elements.length; i++) {
    var a = elements[i];
    var link = a.getAttribute("data-link");
    if (!link) continue;
    var base = helpLinks["#"] || "http://vodia.com/doc/";
    a.href = base + link;
    a.target = "_blank";
    a.innerHTML = "<img src=\"img/help2.gif\" />";
  }
}

// "bla bla" <sip:53453@domain.com;user=phone> -> bla bla (53453)
function prettifyFromToSpec(f, d) {
  // Check if this is something with user=phone:
  var userphone = new RegExp('([^<]*)<sip:(\\+?[*0-9a-z]*)@.*;user=phone;?.*?>', 'i');
  var result = userphone.exec(f);
  if (result != null) {
    var display = result[1].replace(/ *$/, "").replace(/^"/, "").replace(/"$/, "");
    if (display != "")
      return display + " (" + showNanpaNumber(result[2]) + ")";
    else
      return showNanpaNumber(result[2]);
  }

  if (d != "") {
    var domain = d.replace(/\./g, "\\.");
    var from_to_spec = new RegExp('([^<]*)<sip:(\\+?[*0-9a-z]*)@' + domain + '(;user=phone;?.*)?>', 'i');
    var result = from_to_spec.exec(f);
    if (result != null) {
      var display = result[1].replace(/ *$/, "").replace(/^"/, "").replace(/"$/, "");
      if (display != "")
        return display + " (" + showNanpaNumber(result[2]) + ")";
      else
        return showNanpaNumber(result[2]);
    }
  }
  else {
    var from_to_spec = new RegExp('([^<]*)<sip:(\\+?[*0-9a-z]*)@([^;>]*)(;user=phone;?.*)?>', 'i');
    var result = from_to_spec.exec(f);
    if (result != null) {
      var display = result[1].replace(/ *$/, "").replace(/^"/, "").replace(/"$/, "");
      if (display != "")
        return display + " (" + showNanpaNumber(result[2]) + "@" + result[3] + ")";
      else
        return showNanpaNumber(result[2]) + "@" + result[3];
    }
  }
  return f;
}

function showNanpaNumber(n) {
  if (session.country != "1") return n;
  if (n.substr(0, 1) != "+") return n;
  if (n.substr(0, 2) == "+1") return n.substr(2, 3) + "-" + n.substr(5, 3) + "-" + n.substr(8, 4);
  return "011" + n.substr(1);
}

//
// Stuff related to HTML5/audio:
//

function startPlayback(file) {
  var audio = document.getElementById("player");
  audio.style.display = "";
  var source = document.getElementById("wavsource");
  source.setAttribute("src", file);
  audio.load();
}

//
// Filling out forms
//

function setButton(id, item) {
  var e = document.getElementById(id);
  e.value = lang("button", item);
  // Check if we are in edit more:
  if (session.edit) {
    e.fn = ["button", item];
    e.oncontextmenu = function () { editTranslation(this); return false; }
  }
}

function setInput(form, element, val) {
  var obj = document.forms[form].elements[element];
  if (!obj) return;
  obj.value = val;
  if (typeof (enablesave) == "function" && obj.onchange == null) obj.onchange = function () { enablesave(); }
}

function setRadio(form, element, val, def) {
  var radio_obj = document.forms[form].elements[element];
  if (!radio_obj) return;
  var radio_length = radio_obj.length;
  if (radio_length == undefined) {
    radio_obj.checked = radio_obj.value == val;
    return;
  }
  var found = false;
  for (var i = 0; i < radio_length; i++) {
    var set = radio_obj[i].value == val;
    radio_obj[i].checked = set;
    if (set) found = true;
    if (typeof (enablesave) == "function" && radio_obj[i].onchange == null) radio_obj[i].onchange = function () { enablesave(); }
  }
  if (!found) {
    for (var i = 0; i < radio_length; i++) {
      if (radio_obj[i].value == def) radio_obj[i].checked = true;
    }
  }
}

// Add an option for a select box:
function addOption(form, element, text, value, current, clear) {
  var select = document.forms[form].elements[element];
  if (clear) select.innerHTML = "";
  var opt = document.createElement('option');
  opt.value = value;
  setInnerText(opt, text);
  if (value == current) opt.selected = true;
  select.appendChild(opt);
}

function setSelect(form, element, val) {
  var obj = document.forms[form].elements[element];
  if (!obj) return;
  if (typeof (enablesave) == "function" && obj.onchange == null) obj.onchange = function () { enablesave(); }
  var o = obj.options;
  var len = o.length;
  var found = false;
  for (var i = 0; i < len; i++) {
    var set = o[i].value == val;
    o[i].selected = set;
    if (set) found = true;
  }
  if (!found) {
    for (var i = 0; i < len; i++) {
      if (o[i].getAttribute("isdefault") != null) o[i].selected = true;
    }
  }
}

// Set the timezone select: This requires that the file "" has been loaded
function setLanguage(form, element, val, languages) {
  var select = document.forms[form].elements[element];
  if (!select) return;
  if (typeof (enablesave) == "function" && select.onchange == null) select.onchange = function () { enablesave(); }
  for (var i = 0; i < languages.length; i++) {
    var opt = document.createElement('option');
    opt.value = languages[i];
    setInnerText(opt, lang("", opt.value));
    if (val == opt.value) opt.selected = true;
    select.appendChild(opt);
  }
}

// Set the timezone select: This requires that the file "timezones.xml" has been loaded
function setTimezone(form, element, val, zones) {
  var select = document.forms[form].elements[element];
  if (!select) return;
  if (typeof (enablesave) == "function" && select.onchange == null) select.onchange = function () { enablesave(); }
  for (var i = 0; i < zones.length; i++) {
    var opt = document.createElement('option');
    opt.value = zones[i];
    setInnerText(opt, lang("timezones.xml", opt.value));
    if (val == opt.value) opt.selected = true;
    select.appendChild(opt);
  }
}

// Load the array of names from the form and return it as object:
function getFormData(form, vars) {
  var result = {};
  for (var i = 0; i < vars.length; i++) {
    var obj = document.forms[form].elements[vars[i]];
    var value = "";
    if (obj.nodeName) {
      value = obj.value;
    }
    else {
      if (obj.length == 0) continue;
      for (var j = 0; j < obj.length; j++) {
        if (obj[j].checked) value = obj[j].value;
      }
    }
    result[vars[i]] = value;
  }
  return result;
}

// Checks a string for a list of characters
function getScore(pw, check) {
  var result = 0;
  var l = 0;
  for (var i = 0; i < pw.length; i++) {
    var t = pw.charCodeAt(i);
    var b = i > 0 && t - l < 2 && l - t < 2;
    l = t;
    if (b) continue;
    if (check.indexOf(pw.charAt(i)) >= 0) result += check.length;
  }
  // alert(pw + result);
  return result;
}
function securePassword(pw) {
  // * is replaced with some real random stuff later anyway:
  if (pw == "*") return true;
  return passStrength(pw);
}

function passStrength(pw) {
  var method = session.password_policy;
  var score = 0;
  score += getScore(pw, "0123456789");
  score += getScore(pw, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  score += getScore(pw, "abcdefghijklmnopqrstuvwxyz");
  score += getScore(pw, ";:-_=+\\|/?^&!.@#*()%~<$>{}[]");

  if (method == "medium") {
    return score >= 120 && pw.length >= 6;
  }

  if (method == "high") {
    return score >= 200 && pw.length >= 8;
  }

  // If the method is unknown return true (no check)
  return score > 0;
}

function securePin(pw) {
  // * is replaced with some real random stuff later anyway:
  if (pw == "*") return true;
  return pinStrength(pw);
}

function pinStrength(pw) {
  var method = session.password_policy;
  var score = 0;
  var l = parseInt(pw[0]);
  for (var i = 1; i < pw.length; i++) {
    var c = parseInt(pw[i]);
    var d = c - l;
    if (d > 1 || d < -1) score += 2;
    else if (d != 0) score += 1;
    l = c;
  }

  if (method == "medium") {
    return pw.length >= 4 && score >= 4;
  }

  if (method == "high") {
    return pw.length >= 6 && score >= 6;
  }

  // If the method is unknown return true (no check)
  return true;
}

// Check if both passwords still have the same value:
function checkDefaults(pass1, pass2) {
  // Check if anything has changed:
  var p1 = document.getElementById(pass1);
  var p2 = document.getElementById(pass2);
  if (p1 && p2 && p1.defaultValue == p1.value && p2.defaultValue == p2.value) return true;
  return false;
}

function checkPassword(hidden, pass1, pass2, result, password, policy, history) {
  try {
    // Get the current values?
    var p1 = document.getElementById(pass1);
    var p2 = document.getElementById(pass2);

    // Include the result in the form:
    var r = document.getElementById(hidden);
    var h = document.getElementById(result);

    // Check if the password/PIN is strong enough:
    if (policy) {
      if (password) {
	if (!passStrength(p1.value)) {
          r.name = "";
          setInnerText(h, lang("preload.js", "pw_weak"));
          return false;
	}
      }
      else {
	if (!pinStrength(p1.value)) {
          r.name = "";
          setInnerText(h, lang("preload.js", "pw_weak"));
          return false;
	}
      }
    }

    h.innerHTML = "";

    // Is the result the same?
    if (p1.value != p2.value) {
      r.name = "";
      setInnerText(h, lang("preload.js", "pw_nomatch"));
      return false;
    }

    // Check if the password is in the history:
    if (history) {
      var hist = history.split(" ");
      var hash = CryptoJS.SHA256(p1.value);
      for (var i = 0; i < hist.length; i++) {
	if (hash == hist[i].split("/")[0]){
	  setInnerText(h, lang("preload.js", "pw_hist"));
	  return false;
	}
      }
    }

    // Okay:
    setInnerText(h, lang("preload.js", "pw_acceptable"));
    r.name = hidden;
    r.value = p1.value;
    return true;
  }
  catch(e) {
    console.log("Problem checking password: " + e);
    return false;
  }
}

function addDomainsToSelect(select, domains) {
  for (var i in domains) {
    select.options[select.options.length] = new Option(domains[i].name, i);
  }
}

//
// Things related to REST
//

function getRest(url) {
  var request = new XMLHttpRequest();
  request.open("GET", url, false);
  request.send("");
  try {
    var response = JSON.parse(request.responseText);
    return response;
  }
  catch (e) {
    console.log("Error parsing " + request.responseText);
    return null;
  }
}

function deleteRest(url) {
  var request = new XMLHttpRequest();
  request.open("DELETE", url, false);
  request.send("");
  try {
    var response = JSON.parse(request.responseText);
    return response;
  }
  catch (e) {
    console.log("Error parsing " + request.responseText);
    return null;
  }
}

function putRest(url, content) {
  var request = new XMLHttpRequest();
  request.open("PUT", url, false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(content));
  try {
    var response = JSON.parse(request.responseText);
    return response;
  }
  catch (e) {
    console.log("Error parsing " + request.responseText);
    return null;
  }
}

function postRest(url, content) {
  var request = new XMLHttpRequest();
  request.open("POST", url, false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(content));
  try {
    var response = JSON.parse(request.responseText);
    return response;
  }
  catch (e) {
    console.log("Error parsing " + request.responseText);
    return null;
  }
}

function putRestWav(url, file) {
  var request = new XMLHttpRequest();
  request.open("PUT", url, false);
  request.setRequestHeader("Content-Type", "audio/wav");
  request.send(file);
  return request.status >= 200 && request.status < 300;
}

function putRestImage(url, file, mime) {
  var request = new XMLHttpRequest();
  request.open("PUT", url, false);
  request.setRequestHeader("Content-Type", mime);
  request.send(file);
  return request.status >= 200 && request.status < 300;
}

// Log out.
function logout() {
  var d = new Date();
  d.setTime(d.getTime() - (24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = "loginname=; " + expires;
  document.cookie = "loginhash=; " + expires;
  document.cookie = "loginlang=; " + expires;
  document.cookie = "session=; " + expires;
  deleteRest("/rest/system/session");
  document.location = "login.htm";
}

//
// Stuff for handling the navigation bar:
//

function restoreMenuStates() {
  // Keeps the menu collapse state for the next page. Put all collapsible menu id's in the array below to retrieve their states.
  var collapseMenus = [ "ui_reg_gen", "ui_reg_sip", "ui_reg_email", "ui_reg_net", "ui_reg_sec", "ui_dom_other", "ui_usr_feat" ];
  var cookies = document.cookie.split(";");
  for (var i in collapseMenus) {
    for (var j in cookies) {
      var n = cookies[j].substring(1, cookies[j].indexOf("="));
      var v = cookies[j].substring(cookies[j].indexOf("=") + 1);
      if (collapseMenus[i] == n) {
        var menuState = v;
        if (menuState == "block")
          togMenu(collapseMenus[i] + "Head", collapseMenus[i]);
      }
    }
  }
}

function togMenu(headId, id) {
  var e0 = document.getElementById(id);
  if (e0 == null) return;
  var d = e0.style.display;
  var e1 = document.getElementById(headId);
  var s = e1.innerHTML;

  if (d == 'block') {
    e0.style.display = 'none';
    e1.innerHTML = "+ " + s.substr(2);
    document.cookie = id + "=" + 'none' + '; path=/';
  }
  else {
    e0.style.display = 'block';
    e1.innerHTML = "&ndash; " + s.substr(2);
    document.cookie = id + "=" + 'block' + '; path=/';
  }
}

// Select or unselect all table entries:
function selUnsel(obj, tbl) {
    // get all the rows
  var rows = document.getElementById(tbl).getElementsByTagName('tr');
  for (var r = 0; r < rows.length; r++) {
    // set the checkbox to 'selected'
    var row = rows[r];
    var cols = row.getElementsByTagName('td');
    for (var c = 0; c < cols.length; c++) {
      var col = cols[c];
      if (col.childNodes.length > 0) {
        if (col.childNodes[0].type == 'checkbox') col.childNodes[0].checked = obj.checked;
      }
    }
  }
}

//
// Codec selection
//

function loadCodecs(codecs, field1, field2) {
  var current = codecs.split(" ");
  var available = { "0": "G.711U", "2": "G.726", "3": "GSM 6.10", "8": "G.711A", "9": "G.722", "18": "G.729A" };
  var count = 0;

  // Load all codecs that are on the list:
  if (codecs != "") {
    sel = document.getElementById(field1);
    for (var i in current) {
      sel.options[count++] = new Option(available[current[i]], current[i]);
      available[current[i]] = null;
    }
  }

  // Load all codecs that are not on the list:
  sel = document.getElementById(field2);
  count = 0;
  for (var i in available) {
    if (available[i] == null) continue;
    sel.options[count++] = new Option(available[i], i);
  }
} // loadCodecs

function setCodecs(field1, field) {
  sel = document.getElementById(field1);
  var codecs = "";
  for (var i = 0; ; i++) {
    if (sel.options[i] == null) break;
    if (codecs != "") codecs = codecs + " ";
    codecs = codecs + sel.options[i].value;
  }
  c = document.getElementById(field);
  c.value = codecs;
} // setCodecs

function removeCodec(field1, field2, field) {
  sel1 = document.getElementById(field1);
  sel2 = document.getElementById(field2);
  if (sel1.selectedIndex >= 0) {
    sel2.options[sel2.length] = new Option(sel1.options[sel1.selectedIndex].text, sel1.options[sel1.selectedIndex].value);
    sel1.remove(sel1.selectedIndex);
    setCodecs(field1, field);
  }
} // removeCodec

function upCodec(field1, field) {
  sel1 = document.getElementById(field1);
  var idx = sel1.selectedIndex;
  if (idx > 0) {
    var op1 = new Option(sel1.options[idx - 1].text, sel1.options[idx - 1].value);
    var op2 = new Option(sel1.options[idx].text, sel1.options[idx].value);
    sel1.options[idx - 1] = op2;
    sel1.options[idx] = op1;
    sel1.selectedIndex = idx - 1;
    setCodecs(field1, field);
  }
  else {
    // alert("Select a codec to move up"); // need to add language
  }
} // upCodec

function downCodec(field1, field) {
  sel1 = document.getElementById(field1);
  var idx = sel1.selectedIndex;
  if (idx < 0) {
    // alert("Select a codec to move down"); // need to add language
  }
  else {
    if (idx < sel1.length - 1) {
      var op1 = new Option(sel1.options[idx].text, sel1.options[idx].value);
      var op2 = new Option(sel1.options[idx + 1].text, sel1.options[idx + 1].value);
      sel1.options[idx] = op2;
      sel1.options[idx + 1] = op1;
      sel1.selectedIndex = idx + 1;
      setCodecs(field1, field);
    }
  }
} // downCodec

function addCodec(field1, field2, field) {
  sel1 = document.getElementById(field1);
  sel2 = document.getElementById(field2);
  if (sel2.selectedIndex >= 0) {
    sel1.options[sel1.length] = new Option(sel2.options[sel2.selectedIndex].text, sel2.options[sel2.selectedIndex].value);
    sel2.remove(sel2.selectedIndex);
    setCodecs(field1, field);
  }
} // addCodec

function clearCodecInput(field) {
  sel = document.getElementById(field);
  sel.selectedIndex = -1;
} // clearCodecInput

//
// Websocket stuff:
//

function startWebSocket(action, callbackFunc) {
  // Get the right URL: http://localhost/usr_index.htm
  var url = document.URL.split("/");
  var ws = url[0] == "https:" ? "wss://" : "ws://";
  websocket = new WebSocket(ws + url[2]);
  websocket.myAction = action;
  websocket.myCallback = callbackFunc;
  websocket.onopen = function (evt) { wsOpen(evt) };
  websocket.onclose = function (evt) { wsClose(evt) };
  websocket.onmessage = function (evt) { evt.currentTarget.myCallback(JSON.parse(evt.data)) };
  websocket.onerror = function (evt) { wsError(evt) };
}

function wsOpen(evt) {
  var msg = { action: evt.currentTarget.myAction };
  wsSend(JSON.stringify(msg));
}

function wsClose(evt) {
  // Nothing. Add something here if you want.
}

function wsError(evt) {
  // Nothing. Add something here if you want.
  websocket.close();
}

function wsSend(message) {
  websocket.send(message);
}

// Execute something when the document is ready (similar to jQuery ready):
function onReady(f) {
  document.addEventListener("DOMContentLoaded", f, false);
}
