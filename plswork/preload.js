
// Get the session data:
if (typeof session === "undefined") session = getRest("/rest/system/session");

// Checks a string for a list of characters
function getScore(pw, check) {
  var result = 0;
  var l = 0;
  for (var i = 0; i < pw.length; i++) {
    var t = pw.charCodeAt(i);
    var b = i > 0 && t - l < 2 && l - t < 2;
    l = t;
    if(b) continue;
    if(check.indexOf(pw.charAt(i)) >= 0) result += check.length;
  }
  // alert(pw + result);
  return result;
}

function settHeadClass(id, head) {
  if(document.getElementsByTagName) {
    var table = document.getElementById(id);
    var rows = table.getElementsByTagName("tr");
    if(rows.length > 0) {
      rows[0].className = head;
    }
  }
}

function securePassword(pw) {
  // * is replaced with some real random stuff later anyway:
  if(pw == "*") return true;
  return passStrength(pw);
}

function passStrength(pw) {
  var method = "none";
  var allow = "false";
  var score = 0;
  score += getScore(pw, "0123456789");
  score += getScore(pw, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  score += getScore(pw, "abcdefghijklmnopqrstuvwxyz");
  score += getScore(pw, ";:-_=+\\|/?^&!.@#*()%~<$>{}[]");

  if(method == "medium") {
    return score >= 120 && pw.length >= 6;
  }

  if(method == "high") {
    return score >= 200 && pw.length >= 8;
  }

  // Check if we allow empty passwords:
  if(allow == "true") return true;

  // Make sure there is at least something:
  return score > 0;
}

function securePin(pw) {
  // * is replaced with some real random stuff later anyway:
  if(pw == "*") return true;
  return pinStrength(pw);
}

function pinStrength(pw) {
  var method = "none";
  var score = 0;
  var l = parseInt(pw[0]);
  for (var i = 1; i < pw.length; i++) {
    var c = parseInt(pw[i]);
    var d = c - l;
    if(d > 1 || d < -1) score += 2;
    else if(d != 0) score += 1;
    l = c;
  }

  if(method == "medium") {
    return pw.length >= 4 && score >= 4;
  }

  if(method == "high") {
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
  if(p1.defaultValue == p1.value && p2.defaultValue == p2.value) return true;
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
	if (hash == hist[i].split("/")[0]) {
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

function setInnerText(element, text) {
  if (typeof (element) == "string") element = document.getElementById(element);
  element.innerHTML = "";
  element.appendChild(document.createTextNode(text));
}

// This is used in conjuction with the checkbox rows, e.g., the accounts table
// Select all the rows
function select_all(table_id) {
  // get all the rows
  var rows = document.getElementById(table_id).getElementsByTagName('tr');
  for (var r = 0; r < rows.length; r++) {
    // set the checkbox to 'selected'
    var row = rows[r];
    var cols = row.getElementsByTagName('td');
    for (var c = 0; c < cols.length; c++) {
      var col = cols[c];
      if(col.childNodes.length > 0) {
        var type = col.childNodes[0].type;
        if(type == 'checkbox')
          col.childNodes[0].checked = true;
      }
    }
  }
}

// This is used in conjuction with the checkbox rows, e.g., the accounts table
// Unselect all the rows
function deselect_all(table_id) {
  // get all the rows
  var rows = document.getElementById(table_id).getElementsByTagName('tr');
  for (var r = 0; r < rows.length; r++) {
    // set the checkbox to 'selected'
    var row = rows[r];
    var cols = row.getElementsByTagName('td');
    for (var c = 0; c < cols.length; c++) {
      var col = cols[c];
      if(col.childNodes.length > 0) {
        var type = col.childNodes[0].type;
        if(type == 'checkbox')
          col.childNodes[0].checked = false;
      }
    }
  }
}

// enable all the radio button fields in the table
function enable_all(tbl)
{
  var rows = document.getElementById(tbl).getElementsByTagName('tr');
  var checked_rows = 0;
  for (var r = 0; r < rows.length; r++)
  {
    // set the checkbox to 'selected'
    var row = rows[r];
    var cols = row.getElementsByTagName('td');
    for (var c = 0; c < cols.length; c++)
    {
      var col = cols[c];
      if(col.childNodes.length > 0)
      {
        var type = col.childNodes[0].type;
        if(type == 'radio')
        {
          col.childNodes[0].checked = true;
        }
      }
    }
  }
}

// disable all the radio button fields in the table
function disable_all(tbl)
{
  var rows = document.getElementById(tbl).getElementsByTagName('tr');
  var checked_rows = 0;
  for (var r = 0; r < rows.length; r++)
  {
    // set the checkbox to 'selected'
    var row = rows[r];
    var cols = row.getElementsByTagName('td');
    for (var c = 0; c < cols.length; c++)
    {
      var col = cols[c];
      if(col.childNodes.length > 0)
      {
        var type = col.childNodes[0].type;
        if(type == 'radio')
        {
          col.childNodes[2].checked = true;
        }
      }
    }
  }
}

function present_html(s) {
  if(s == null) return "";
  var c = {'<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#039;', '#':'&#035;' };
  return s.replace( /[<&>'"#]/g, function(s) { return c[s]; } );
}

function setInput(form, element, val) {
  var obj = document.forms[form].elements[element];
  obj.value = val;
  if(typeof(enablesave) == "function" && obj.onchange == null) obj.onchange = function () { enablesave(); }
}

function setRadio(form, element, val, def) {
  var radio_obj = document.forms[form].elements[element];
  if(!radio_obj) return;
  var radio_length = radio_obj.length;
  if(radio_length == undefined) {
    radio_obj.checked = radio_obj.value == val;
    return;
  }
  var found = false;
  for(var i = 0; i < radio_length; i++) {
    var set = radio_obj[i].value == val;
    radio_obj[i].checked = set;
    if(set) found = true;
    if(typeof(enablesave) == "function" && radio_obj[i].onchange == null) radio_obj[i].onchange = function () { enablesave(); }
  }
  if(!found) {
    for(var i = 0; i < radio_length; i++) {
      if(radio_obj[i].value == def) radio_obj[i].checked = true;
    }
  }
}

function setButton(id, item) {
  var e = document.getElementById(id);
  e.value = lang("button", item);
  // Check if we are in edit more:
  if(session.edit) {
    e.fn = [ "button", item ];
    e.oncontextmenu = function() { redit(this); return false; }
  }
}

function get_radio(form, element) {
  var radio_obj = document.forms[form].elements[element];
  if(!radio_obj) return;
  var radio_length = radio_obj.length;
  if(radio_length == undefined) return radio_obj.value;
  for(var i = 0; i < radio_length; i++) {
    if(radio_obj[i].checked) return radio_obj[i].value;
  }
  return ""; // Nothing checked ?!
}

function setSelect(form, element, val) {
  var obj = document.forms[form].elements[element];
  if(!obj) return;
  if(typeof(enablesave) == "function" && obj.onchange == null) obj.onchange = function () { enablesave(); }
  var o = obj.options;
  var len = o.length;
  var found = false;
  for(var i = 0; i < len; i++) {
    var set = o[i].value == val;
    o[i].selected = set;
    if(set) found = true;
  }
  if(!found) {
    for(var i = 0; i < len; i++) {
      if(o[i].getAttribute("isdefault") != null) o[i].selected = true;
    }
  }
}

function setInnerText(element, text) {
  if(typeof(element) == "string") element = document.getElementById(element);
  element.innerHTML = "";
  element.appendChild(document.createTextNode(text));
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

// Keep the list of files to be translated golbal, so that we can also add fines that we need.
var translateFiles = {};
var filename = "";

function translate_items() {
  var tags = ["span", "label", "option", "title", "p", "h1", "h2", "h3", "div", "td"];
  var help = {}; // The neccessary help items
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

  list = []; for(i in translateFiles) list.push(i == "" ? "-" : i);
  loadLang(list);
  list = ""; for(i in help) list += "," + i;
  help = getRest("/rest/system/help/" + session.lang + "/" + list.substring(1));

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
        if(session.edit) {
          items[j].fn = [ fn, nn ];
          items[j].oncontextmenu = function() { redit(this); return false; }
        }
      }
      else if (txt.substring(0, 5) == "help:") {
        items[j].innerHTML = "<a href=\"" + help[txt.substring(5).toLowerCase()] + "\" target=\"_blank\"><img src=\"img/help2.gif\" alt=\"Help\" /></a>";
      }
    }
  }

  // Hack hack: Do the hardwired help links here:
  var helptop= document.getElementById("helptop");
  if(helptop) helptop.href = help["#"];
  var helpbottom = document.getElementById("helpbottom");
  if(helpbottom) helpbottom.href = help["#"];
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

// Set the timezone select: This requires that the file "" has been loaded
function setLanguage(form, element, val, langauges) {
  var select = document.forms[form].elements[element];
  if (!select) return;
  if (typeof (enablesave) == "function" && select.onchange == null) select.onchange = function () { enablesave(); }
  for (var i = 0; i < langauges.length; i++) {
    var opt = document.createElement('option');
    opt.value = langauges[i];
    setInnerText(opt, lang("", opt.value));
    if (val == opt.value) opt.selected = true;
    select.appendChild(opt);
  }
}

function show_us_number(n) {
  if("" != "1") return n;
  if(n.substr(0, 1) != "+") return n;
  if(n.substr(0, 2) == "+1") return n.substr(2, 3) + "-" + n.substr(5, 3) + "-" + n.substr(8, 4);
  return "011" + n.substr(1);
}

// "bla bla" <sip:53453@domain.com;user=phone> -> bla bla (53453)
function prettify_from_to_spec(f, d) {
  // Check if this is something with user=phone:
  var userphone = new RegExp('([^<]*)<sip:(\\+?[*0-9a-z]*)@.*;user=phone;?.*?>', 'i');
  var result = userphone.exec(f);
  if(result != null) {
    var display = result[1].replace(/ *$/, "").replace(/^"/, "").replace(/"$/, "");
    if(display != "")
      return display + " (" + show_us_number(result[2]) + ")";
    else
      return show_us_number(result[2]);
  }

  if(d != "") {
    var domain = d.replace(/\./g, "\\.");
    var from_to_spec = new RegExp('([^<]*)<sip:(\\+?[*0-9a-z]*)@' + domain + '(;user=phone;?.*)?>', 'i');
    var result = from_to_spec.exec(f);
    if(result != null) {
      var display = result[1].replace(/ *$/, "").replace(/^"/, "").replace(/"$/, "");
      if(display != "")
        return display + " (" + show_us_number(result[2]) + ")";
      else
        return show_us_number(result[2]);
    }
  }
  else {
    var from_to_spec = new RegExp('([^<]*)<sip:(\\+?[*0-9a-z]*)@([^;>]*)(;user=phone;?.*)?>', 'i');
    var result = from_to_spec.exec(f);
    if(result != null) {
      var display = result[1].replace(/ *$/, "").replace(/^"/, "").replace(/"$/, "");
      if(display != "")
        return display + " (" + show_us_number(result[2]) + "@" + result[3] + ")";
      else
        return show_us_number(result[2]) + "@" + result[3];
    }
  }
  return f;
}

// Edit something:
function jedit(t, p) {
  // We do need AJAX:
  if(!window.XMLHttpRequest) return;

  // Remember t:
  document.getElementById("te-element").value = t;
  document.getElementById("te-page").value = p;

  // Bring the prompt to the top:
  var txtedit = document.getElementById("texteditor");
  txtedit.style.display = "";
  txtedit.style.top = (event.pageY + 20) + "px";
  txtedit.style.left = event.pageX + "px";

  // Get the English content:
  var to = document.getElementById("te-old");
  var request = new XMLHttpRequest();
  var content = { "action": "dict-load", "id": t.substr(4), "page": p };
  request.open("POST", "json", false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(content));
  var response = JSON.parse(request.responseText);
  to.innerHTML = response.original;
  document.getElementById("te-index").innerHTML = "Item: " + p + "/" + t.substr(4);

  // Copy the current content into the textarea field:
  var tn = document.getElementById("te-new");
  var e = document.getElementById(t);
  tn.value = response.translation;
}

// Save what has been edited:
function jsave() {
  // Make the form disappear:
  document.getElementById("texteditor").style.display = "none";
  var t = document.getElementById("te-element").value;
  var p = document.getElementById("te-page").value;
  var n = document.getElementById("te-new").value;
  var e = document.getElementById(t);
  e.innerHTML = n;
  
  // Send the request to the PBX:
  var request = new XMLHttpRequest();
  var content = { "action": "dict-save", "id": t.substr(4), "page": p, "text": n };
  request.open("POST", "json", false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(content));
}

// Edit something:
function redit(o) {
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
  var en = getRest("/rest/system/dict/en/" + p + "/" + t);
  var xx = getRest("/rest/system/dict/" + session.lang + "/" + p + "/" + t);
  setInnerText(to, en);
  document.getElementById("te-index").innerHTML = "Item: #" + p + " " + t;

  // Copy the current content into the textarea field:
  var tn = document.getElementById("te-new");
  var e = document.getElementById(t);
  tn.value = xx;
}

// Save what has been edited:
function rsave() {
  // Make the form disappear:
  document.getElementById("texteditor").style.display = "none";
  var t = document.getElementById("te-element").value;
  var p = document.getElementById("te-page").value;
  var n = document.getElementById("te-new").value;
  var e = document.getElementById("te-object").obj;
  setInnerText(e, n);
  putRest("/rest/system/dict/" + session.lang + "/" + p + "/" + t, n);
}

function json_ajax(content) {
  var request = new XMLHttpRequest();
  request.open("POST", "json", false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(content));
  var response = JSON.parse(request.responseText);
  return response;
}

function getRest(url) {
  var request = new XMLHttpRequest();
  request.open("GET", url, false);
  request.send("");
  try {
    var response = JSON.parse(request.responseText);
    return response;
  }
  catch(e) {
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
  catch(e) {
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
  catch(e) {
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
  catch(e) {
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

function addDomainsToSelect(select, domains) {
  for(var i in domains) {
    select.options[select.options.length] = new Option(domains[i].name, i);
  }
}

function add_paginator(element, length, page, func, group, extension, missed) {
  missed = missed || "false";
  var html = "";
  for(var i = 0; i < length; i += page) {
    var i0 = i + 1;
    var i1 = length;
    var i2 = i + page;
    var i3 = i1 < i2 ? i1 : i2;
    html += " <a href=\"javascript:" + func + "(" + i + ", " + page + ", " + group + ", " + extension + ", " + missed + ");\">" + i0;
    if(i3 > i0) html += ".." + i3;
    html += "</a>";
  }
  document.getElementById(element).innerHTML = html;
}

function display_messages(tbl, msg, hasaudio) {
  var i, t = document.getElementById(tbl);
  var domain = "tanda.telegate.net.au";
  for(i in msg) {
    var m = msg[i];
    if(msg.type == "com") continue;
    var tr = document.createElement("tr");
    var d = new Date(m.start * 1000);
    var html = "<td><input type=\"checkbox\" name=\"delete[]\" value=\"" + i + "\" /></td>";
    html += "<td>" + d.toLocaleString() + "</td>";
    html += "<td>" + present_html(prettify_from_to_spec(m.from, domain)) + "</td>";
    html += "<td style=\"text-align:right\">" + show_hh_mm(m.duration) + "</td>";
    html += "<td>";
    if(m.type == "rec") html += "<img src=\"img/record.png\" />";
    if(m.type == "fax") html += " FAX ";
    if(m.attribute == "urgent") html += "<img src=\"img/urgent.png\" />";
    if(m.attribute == "private") html += "<img src=\"img/private.png\" />";
    if(m.isnew == "true") html += "<img src=\"img/new.gif\" />";
    html += "</td>";
    if(hasaudio) {
      html += "<td><img src=\"img/speaker.png\" onclick=\"start_playback('audio.wav?type=voicemail&id=" + i + "');\" draggable=\"false\" /></td>\n";
    }
    tr.innerHTML = html;
    t.appendChild(tr);
  }
}

function display_recs(start, size, group, extension, params) {
  var recs;
  if(group > 0) 
    recs = json_ajax({"action":"load-recordings","start":start,"length":size,"group":group});
  else if(extension > 0) 
    recs = json_ajax({"action":"load-recordings","start":start,"length":size,"extension":extension});
  else
    recs = json_ajax({"action":"load-recordings","start":start,"length":size});
  var users = {"action":"domain-list","accounts":[{"id":1992,"account":"521","alias":["521","61731063521","61731063521"],"ani":"","type":"extensions","disabled":"false","license":"","visible":"","name":"521","pnp":0,"mac":"","regs":0,"cell":"","email":"","dnd":false,"cfa":"","last":"1435802163.984","vm":"4/0 (0/0)"},
{"id":1993,"account":"522","alias":["522","61731063522"],"ani":"0731063522","type":"extensions","disabled":"false","license":"","visible":"","name":"Marissa","pnp":0,"mac":"00156562CC1E","regs":1,"cell":"","email":"","dnd":false,"cfa":"","last":"1463540188.709","vm":"12/0 (0/0)"},
{"id":1998,"account":"523","alias":["523","61731063523"],"ani":"0731063523","type":"extensions","disabled":"","license":"","visible":"","name":"Ivy","pnp":0,"mac":"001565791063","regs":1,"cell":"","email":"","dnd":false,"cfa":"","last":"1463540227.293","vm":"19/0 (0/0)"},
{"id":1999,"account":"524","alias":["524","61731063524"],"ani":"0731063524","type":"extensions","disabled":"","license":"","visible":"","name":"Eidz","pnp":0,"mac":"","regs":3,"cell":"","email":"","dnd":false,"cfa":"","last":"1463540207.247","vm":"20/0 (0/0)"},
{"id":2000,"account":"525","alias":["525","61731063525"],"ani":"0731063525","type":"extensions","disabled":"","license":"","visible":"","name":"Jelly","pnp":0,"mac":"00156562CC1E","regs":0,"cell":"","email":"","dnd":false,"cfa":"","last":"1463540136.615","vm":"20/0 (0/0)"},
{"id":2001,"account":"526","alias":["526","61731063526"],"ani":"0731063526","type":"extensions","disabled":"","license":"","visible":"","name":"526","pnp":0,"mac":"","regs":0,"cell":"","email":"","dnd":false,"cfa":"","last":"1461900903.541","vm":"9/0 (0/0)"},
{"id":2073,"account":"527","alias":["527"],"ani":"","type":"extensions","disabled":"","license":"","visible":"","name":"527","pnp":0,"mac":"001565154588","regs":0,"cell":"","email":"","dnd":false,"cfa":"","last":"1439856199.959","vm":""},
{"id":2138,"account":"480","alias":["480","61735558480"],"ani":"","type":"extensions","disabled":"","license":"","visible":"","name":"480","pnp":0,"mac":"","regs":0,"cell":"","email":"","dnd":false,"cfa":"","last":"1451960532.515","vm":"1/0 (0/0)"},
{"id":2139,"account":"481","alias":["481","61735558481"],"ani":"0735558481","type":"extensions","disabled":"","license":"","visible":"","name":"Tasmin","pnp":0,"mac":"","regs":0,"cell":"","email":"","dnd":false,"cfa":"","last":"1463042900.650","vm":"13/0 (0/0)"},
{"id":2140,"account":"482","alias":["482","61735558482"],"ani":"0735558482","type":"extensions","disabled":"","license":"","visible":"","name":"Sales","pnp":0,"mac":"0015651551C4","regs":0,"cell":"","email":"","dnd":false,"cfa":"","last":"1463539919.865","vm":"14/1 (0/0)"},
{"id":2141,"account":"483","alias":["483","61735558483"],"ani":"0735558483","type":"extensions","disabled":"","license":"","visible":"","name":"483","pnp":0,"mac":"001565790E2B","regs":0,"cell":"","email":"","dnd":false,"cfa":"","last":"1461740466.608","vm":"0/0 (0/0)"},
{"id":2142,"account":"484","alias":["484","61735558484"],"ani":"0735558484","type":"extensions","disabled":"","license":"","visible":"","name":"Test","pnp":0,"mac":"","regs":0,"cell":"","email":"","dnd":false,"cfa":"","last":"1463540227.278","vm":"9/0 (0/0)"},
{"id":2143,"account":"485","alias":["485","61735558485"],"ani":"0735558485","type":"extensions","disabled":"","license":"","visible":"","name":"Jake","pnp":0,"mac":"00156514C42D","regs":0,"cell":"","email":"","dnd":false,"cfa":"","last":"1463030007.19","vm":"3/0 (0/0)"},
{"id":2144,"account":"486","alias":["486","61735558486"],"ani":"0735558486","type":"extensions","disabled":"","license":"","visible":"","name":"Wayne","pnp":0,"mac":"","regs":1,"cell":"","email":"","dnd":false,"cfa":"","last":"1463540185.724","vm":"0/1 (0/0)"},
{"id":2145,"account":"487","alias":["487","61731063520"],"ani":"0731063520","type":"extensions","disabled":"","license":"","visible":"","name":"Josh","pnp":0,"mac":"","regs":0,"cell":"","email":"","dnd":false,"cfa":"","last":"1463104122.699","vm":"1/0 (0/0)"},
{"id":2146,"account":"488","alias":["488","61735558488"],"ani":"0735558488","type":"extensions","disabled":"","license":"","visible":"","name":"Brianna","pnp":0,"mac":"","regs":0,"cell":"","email":"","dnd":false,"cfa":"0734830467","last":"1463526956.460","vm":"1/0 (0/0)"},
{"id":2147,"account":"489","alias":["489","61735558489"],"ani":"","type":"extensions","disabled":"","license":"","visible":"","name":"Sales","pnp":0,"mac":"","regs":0,"cell":"","email":"","dnd":false,"cfa":"","last":"1460503868.562","vm":""}],"change":"false"};
  var domain = "tanda.telegate.net.au";

  var html = "<tr>\n";
  html += "  <td><input type=\"checkbox\" onclick=\"return sel_unsel(this, 'tbl_rec');\" /></td>\n";
  html += "  <td>Start&nbsp;</td>\n";
  html += "  <td>From&nbsp;</td>\n";
  html += "  <td>To&nbsp;</td>\n";
  html += "  <td>Agent&nbsp;</td>\n";
  html += "  <td>Play</td>\n";
  html += "</tr>\n";
  for(var i = 0; i < recs.length; i++) {
    html += "<tr>";
    html += "  <td><input type=\"checkbox\" name=\"playfile[]\" value=\"" + recs[i].file + "\"/></td>\n";
    
    var d = new Date(recs[i].time * 1000);
    html += "  <td>" + d.toLocaleString() + "&nbsp;</td>\n";
    html += "  <td>" + present_html(prettify_from_to_spec(recs[i].from, domain)) + "&nbsp;</td>\n";
    html += "  <td>" + present_html(prettify_from_to_spec(recs[i].to, domain)) + "&nbsp;</td>\n";

    html += "  <td>";
    for(var j = 0; j < users.accounts.length; j++) {
      if(users.accounts[j].id == recs[i].agent) {
        html += present_html(users.accounts[j].account) + "&nbsp;";
        break;
      }
    }
    html += "</td>\n";

    html += "  <td>";
    if(recs[i].status == "") html += "<img src=\"img/new.gif\" /> ";
    html += "<img src=\"img/speaker.png\" onclick=\"start_playback('audio.wav?type=recording&id=" + recs[i].file + "', '" + params + "');\" draggable=\"false\" /></td>\n";
    html += "</tr>";

  }
  document.getElementById("tbl_rec").innerHTML = html;
}

function start_playback(file, instance) {
  if(arguments.length < 2) instance = "";
  else if(isNaN(instance)) instance = "";
  var player = "player" + instance;
  var wavsource = "wavsource" + instance;
  var audio = document.getElementById(player);
  audio.style.display = "";
  var source = document.getElementById(wavsource);
  source.setAttribute("src", file);
  audio.load();
}

function two_digits(number) {
  var result = "";
  if(number < 10) result += "0";
  result += number;
  return result;
}

function show_time(secs) {
  secs = Math.floor(secs);
  var hours = Math.floor(secs / 3600);
  secs -= hours * 3600;
  var minutes = Math.floor(secs / 60);
  secs -= minutes * 60;
  var result = two_digits(hours) + ":";
  result += two_digits(minutes);
  return result;
}
function show_hh_mm(secs) {
  if(isNaN(parseFloat(secs))) return "";
  secs = Math.floor(secs);
  var hours = Math.floor(secs / 3600);
  secs -= hours * 3600;
  var minutes = Math.floor(secs / 60);
  secs -= minutes * 60;
  var result = "";
  if(hours > 0) result += two_digits(hours) + ":";
  result += two_digits(minutes) + ":";
  result += two_digits(secs);
  return result;
}

function display_cdr(start, size, domain, userpresent, missed) {
  userpresent = userpresent || "false";
  missed = missed || "false";
  var cdrs = json_ajax({"action":"load-cdr-summary","start":start,"length":size,"domain":domain, "user":userpresent, "missed":missed});
  var domain = "tanda.telegate.net.au";

  var html = "<tr>\n";
  html += "  <td>Start&nbsp;</td>\n";
  html += "  <td>From&nbsp;</td>\n";
  html += "  <td>To&nbsp;</td>\n";
  html += "  <td>Duration&nbsp;</td>\n";
  html += "  <td>Trunk&nbsp;</td>\n";
  html += "</tr>\n";

  for(var i = 0; i < cdrs.length; i++) {
    var cdr = cdrs[i];
    html += "<tr>";
    
    var d = new Date(cdr.start * 1000);
    html += "  <td style=\"white-space: nowrap;\">" + d.toLocaleString() + "&nbsp;</td>\n";
    html += "  <td>" + present_html(prettify_from_to_spec(cdr.from, domain)) + "&nbsp;</td>\n";
    html += "  <td>" + present_html(prettify_from_to_spec(cdr.to, domain)) + "&nbsp;</td>\n";

    html += "  <td style=\"text-align:right\">";
    if(cdr.connect > 0) {
      html += show_hh_mm(Math.floor((cdr.end - cdr.connect))) + "&nbsp;";
    }
    html += "</td>";

    html += "  <td>";
    var sorttrunk = { }; 
    for(var j = 0; j < cdr.trunks.length; j++) sorttrunk[cdr.trunks[j]]++;
    for(j in sorttrunk) {
      if(j in trunks) {
        html += present_html(trunks[j].name) + "&nbsp;";
      }
    }
    html += "</td>";

    html += "</tr>";
  }
  document.getElementById("tbl_cdr").innerHTML = html;
}

function add_trunks(t, name) {
  var html = "";

  // Do the header:
  html += "<tr>\n";
  html += "  <td><input type=\"checkbox\" onclick=\"return sel_unsel(this, '" + name + "');\" /></td>\n";
  html += "  <td class=\"name\">Name&nbsp;</td>\n";
  html += "  <td class=\"account\">Account&nbsp;</td>\n";
  html += "  <td class=\"proxy\">Proxy&nbsp;</td>\n";
  html += "  <td class=\"status\">Status&nbsp;</td>\n";
  html += "  <td class=\"type\">Type&nbsp;</td>\n";
  html += "  <td class=\"dir\">Dir&nbsp;</td>\n";
  html += "  <td class=\"ani\">Outbound number (ANI)&nbsp;</td>\n";
  html += "  <td class=\"global\">Global&nbsp;</td>\n";
  html += "  <td class=\"action\">Action&nbsp;</td>\n";
  html += "</tr>\n";

  // Do the trunks:
  for(var i = 0; i < t.length; i++) {
    html += "<tr><td><input type=\"checkbox\" name=\"trunk[]\" value=\"" + t[i].id + "\"></td>";
    html += "  <td class=\"name\"><a href=\"dom_trunk_edit.htm?trunk=" + t[i].id + "\"";
    if(t[i].disabled == "true") html += " style=\"text-decoration: line-through;\"";
    html += ">" + present_html(t[i].name) + "</a>&nbsp;</td>";
    html += "  <td class=\"account\">" + present_html(t[i].account) + "&nbsp;</td>";
    html += "  <td class=\"proxy\">" + present_html(t[i].proxy) + "&nbsp;</td>";
    html += "  <td class=\"status\">" + present_html(t[i].status1);
    if(t[i].status2 != "") html += " (" + present_html(t[i].status2) + ")";
    html += "&nbsp;</td>";
    html += "  <td class=\"type\">" + present_html(t[i].type) + "&nbsp;</td>";
    html += "  <td class=\"dir\">" + present_html(t[i].direction) + "&nbsp;</td>";
    html += "  <td class=\"ani\">" + present_html(t[i].ani) + "&nbsp;</td>";
    html += "  <td class=\"global\">" + present_html(t[i].global) + "&nbsp;</td>";
    html += "  <td class=\"action\">";
    if(t[i].type == "register") {
      html += "<a href=\"dom_sip_trunks.htm?trunkreg=" + t[i].id + "\">REGISTER</a>";
    }
    else if(t[i].type == "wrtc") {
      html += "<a href=\"dom_gencode.htm?trunk=" + t[i].id + "\">GENERATE</a>";
    }
    html += "</td></tr>";
  }
  document.getElementById(name).innerHTML = html;
}
function loadsysconfig(data, settings) {
  for(var i = 0; i < settings.length; i++) {
    document.getElementById(settings[i]).value = data[settings[i]];
  }
}
function savesysconfig(b, settings) {
  b.disabled = true;
  var data = {};
  for(var i = 0; i < settings.length; i++) {
    data[settings[i]] = document.getElementById(settings[i]).value;
  }
  putRest("/rest/system/config", data);
  b.disabled = false;
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

// The global dictionary:
var translations = {};
var loaded_translations = {}; // Make sure we don't load twice

// Add the file to the dictionary items (l):
function loadLang(file) {
  var f = "";
  if(Object.prototype.toString.call(file) === "[object Array]") {
    f = "";
    for(var i = 0; i < file.length; i++) {
      if(loaded_translations[file[i]] > 0) continue;
      loaded_translations[file[i]] = 1;
      if(i > 0) f += ",";
      f += file[i];
    }
  }
  else {
    if(loaded_translations[file] > 0) return;
    loaded_translations[file] = 1;
    f = file;
  }
  if(f == "") return;
  var n = getRest("/rest/system/translation/" + session.lang + "/" + f);
  for(var i in n) {
    translations[i] = n[i];
  }
}

function lang(file, item, arg0, arg1) {
  // Get the translation:
  var txt = translations[file + "#" + item];

  // Check if there is any replacement:
  if(arg0) {
    txt = txt.replace("{0}", arg0);
    if(arg1) {
      txt = txt.replace("{1}", arg1);
    }
  }

  return txt;
}

// Add all the help links to the page
function addHelpLinks() {
  var elements = document.getElementsByTagName("a");
  for(var i = 0; i < elements.length; i++) {
    var a = elements[i];
    var link = a.getAttribute("data-link");
    if(!link) continue;
    a.href = "http://vodia.com/documentation/" + link;
    a.target = "_blank";
    a.innerHTML = "<img src=\"img/help2.gif\" />";
  }
}

// Offer time of day routing:
function offerTimeOfDay(redir, setting, element) {
  // We need to make sure that we have the neccessary translations:
  loadLang("usr_core_redirection.htm");

  // Check if we have already loaded the available service flags in the domain:
  if (typeof serviceflags === 'undefined') {
    serviceflags = getRest("/rest/domain/" + encodeURIComponent(session.cdomain) + "/srvflags");
  }

  var table = document.createElement("table");
  var tr = document.createElement("tr");

  var td = document.createElement("td");
  td.colSpan = 2;
  var ref = { hidden: document.getElementById(setting) };
  ref.curr = document.getElementById(redir);
  ref.curr.onchange = function() { changeTimeOfDay(ref); }
  ref.selectrow = document.getElementById(element);

  // Load the current value:
  if(ref.hidden.value == "")
    var values = { selected: "" }
  else
    var values = JSON.parse(ref.hidden.value);

  // <select id="cell_night" name="cell_night" onChange="update_fields(this);" class="cCombo">
  // <option value="">No specific time excluded</option>
  // <option value="specify">Explicitly specify available times</option>
  // <option value="17">9-to-5 w/o Holidays</option>
  // </select>
  ref.select = document.createElement("select");
  ref.select.onchange = function() { changeTimeOfDay(ref); }
  ref.select.className="cCombo";

  var option = document.createElement("option");
  setInnerText(option, lang("usr_core_redirection.htm", "cell_night_always"));
  option.value = "";
  ref.select.options[0] = option;

  option = document.createElement("option");
  setInnerText(option, lang("usr_core_redirection.htm", "cell_night_specify"));
  option.value = "specify";
  if(values.selected == option.value) option.selected = true;
  ref.select.options[1] = option;

  option = document.createElement("option");
  setInnerText(option, lang("usr_core_redirection.htm", "cell_day_specify")); // Explicitly exclude times
  option.value = "specify2";
  if(values.selected == option.value) option.selected = true;
  ref.select.options[2] = option;

  for(var i in serviceflags) {
    option = document.createElement("option");
    setInnerText(option, serviceflags[i]);
    option.value = i;
    if(values.selected == option.value) option.selected = true;
    ref.select.options[ref.select.options.length] = option;
  }

  td.appendChild(ref.select);
  tr.appendChild(td);
  table.appendChild(tr);

  var days = ["day_mon","day_tue","day_wed","day_thu","day_fri","day_sat","day_sun","holiday"];
  ref.days = [];
  ref.trs = [];
  for(var i = 0; i < days.length; i++) {
    tr = document.createElement("tr");
    td = document.createElement("td");
    td.className = "cText";
    setInnerText(td, lang("usr_core_redirection.htm", days[i]));
    tr.appendChild(td);
    td = document.createElement("td");
    var input = document.createElement("input");
    input.type="text";
    input.className="cText150";
    if(i < days.length - 1)
      input.value = "days" in values && i < values.days.length ? values.days[i] : "";
    else
      input.value = "holidays" in values ? values.holidays : "";
    input.onchange = function() { changeTimeOfDay(ref); }
    td.appendChild(input);
    ref.days.push(input);
    ref.trs.push(tr);
    tr.appendChild(td);
    table.appendChild(tr);
  }

  changeTimeOfDay(ref);
  document.getElementById(element).appendChild(table);
}

// Change the time of day
function changeTimeOfDay(ref) {
  // Adjust the visibility:
  var display = ref.curr.value != "" && (ref.select.value == "specify" || ref.select.value == "specify2") ? "" : "none";
  ref.selectrow.parentElement.style.display = ref.curr.value != "" ? "" : "none";
  for(var i = 0; i < ref.trs.length; i++) {
    ref.trs[i].style.display = display;
  }

  var settings = { selected: ref.select.value };
  if(display == "") {
    // Do the days
    settings.days = [];
    var timeexp = new RegExp('^([0-9]+):?([0-9]*)([ap]?)m?', 'i');
    for(var i = 0; i < ref.days.length - 1; i++) {
      // Take this opportunity to beautify the input:
      var t = ref.days[i].value.toUpperCase().split(" ");
      var r = [];
      for(var j = 0; j < t.length; j++) {
        if (t[j].length == 0) continue;
        var p = t[j].split("-");
        if (p.length < 2) continue;
        var q = [];
        for(var k = 0; k < 2; k++) {
          if(p[k] == "") p[k] = k == 0 ? "0" : 24;
          var result = timeexp.exec(p[k]);
          if(result == null) continue;
          var hh = Number(result[1]);
          var mm = Number(result[2]);
          if(mm < 0) mm = 0; else if (mm > 59) mm = 59;
          if(result[3] == "") { // 24-hour format
            if(hh < 0) hh = 0; else if (hh > 23) { hh = 24; mm = 0; }
          }
          else { // 12-hour format
            if(hh < 1) hh = 1; else if (hh > 12) hh = 12;
          }
          
          q.push(hh + ":" + ("0" + mm).slice(-2) + result[3]);
        }
        r.push(q.join("-"));
      }
      var range = r.join(" ");
      ref.days[i].value = range;
      settings.days[i] = range;
    }

    // Do the holidays:
    var holexp = new RegExp('^([0-9]+)/([0-9]+)', 'i');
    var h = ref.days[ref.days.length - 1].value.split(" ");
    var r = [];
    for(var i = 0; i < h.length; i++) {
      if (h[i].length == 0) continue;
      var result = holexp.exec(h[i]);
      if(result == null) continue;
      var mm = Number(result[1]);
      var dd = Number(result[2]);
      if(mm < 1) mm = 1; else if(mm > 12) mm = 12;
      if(dd < 1) dd = 1; else if(dd > 31) dd = 31; // Well not exact but should help
      r.push(mm + "/" + dd);
    }
    settings.holidays = ref.days[ref.days.length - 1].value = r.join(" ");
  }
  ref.hidden.value = JSON.stringify(settings);
}
