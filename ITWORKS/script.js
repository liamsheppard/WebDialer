function prettify_from_to_spec(f, d) { // from https://tanda.telegate.net.au/preload.js
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

function show_us_number(n) { // from https://tanda.telegate.net.au/preload.js
  if("" != "1") return n;
  if(n.substr(0, 1) != "+") return n;
  if(n.substr(0, 2) == "+1") return n.substr(2, 3) + "-" + n.substr(5, 3) + "-" + n.substr(8, 4);
  return "011" + n.substr(1);
}

// <!--
var IDLE = "idle";
var RINGING = "ringing";
var CONNECTED = "connected";
var CALLER = "caller";
var CALLEE = "callee";
var NONE = "none"

var output;
var spaces = "&nbsp;&nbsp;";
var callDir = NONE;
var callStatus = IDLE;
var notification;
var redialNumber = "";

// var currAccount = getRest("/rest/domain/self/account/self/list/list_identity").user;
var refreshImages = true;

var dtmfSender;

function show_pic() {
  var e = document.getElementById("pic");
  var d = e.style.display;

  if (d == 'block') {
    e.style.display = 'none';
  }
  else {
    e.style.display = 'block';
  }
}

function custom_script(ele) {
  if (ele.options[ele.selectedIndex].value == "custom") {
    document.location.href = "usr_locations.htm";
  }
}

function startWebSocket() {
  // Get the right URL: http://localhost/usr_index.htm
  // var url = document.URL.split("/");
  // var ws = url[0] == "https:" ? "wss://" : "ws://";
  // socket = new WebSocket(ws + url[2]);
  socket = new WebSocket("wss://tanda.telegate.net.au")
  socket.onopen = function(evt) { onOpen(evt) };
  socket.onclose = function(evt) { onClose(evt) };
  socket.onmessage = function(evt) { onMessage(evt) };
  socket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt) {
  var msg = { action: "get-users" };
  doSend(JSON.stringify(msg));
  msg = { action: "get-calls" };
  doSend(JSON.stringify(msg));
  //register();
  if (typeof firstregister === "function") {
    setTimeout(firstregister, 2000);
  }
}

function onClose(evt) {
  if (typeof reconnect === "function") {
    reconnect();
  }
  writeToScreen("DISCONNECTED");
}

function addMsg(u, name, dir, m) {
  var from;
  var msg = $('#htmlescape').text(m).html();
  if (dir == "send") {
    from = "me: ";
  }
  else {
    var n = name.split(' ')[0];
    from = n.length > 8 ? n.substr(0, 8) + "...: " : n + ": ";
  }
  var msgs = $('#chat-messages-' + u).html();
  $('#chat-messages-' + u).html(msgs + "<p><strong>" + from + "</strong>" + msg + "</p>");
  $('#chat-messages-' + u).scrollTop($('#chat-messages-' + u)[0].scrollHeight);
}

function sendChatMsg(u) {
  var m = $('#chat-message-' + u).val();
  if (m === "") return;
  $('#chat-message-' + u).val("");
  addMsg(u, "", "send", m);
  var msg = {};
  msg.action = "chat";
  msg.src = currAccount;
  msg.dest = u;
  msg.message = m;
  doSend(JSON.stringify(msg));
}

function recvChatMsg(u, msg) {
  for (var i = 0; i < allAccounts.length; i++) {
    if (allAccounts[i].account === u) {
      user = allAccounts[i];
      break;
    }
  }

  if ($('#chat-box-' + u).length === 0) {
    openChatbox(user);
  }
  addMsg(u, user.name, "recieve", msg);

  if (!document.hasFocus()) {
    if ("Notification" in window) {
      /*if (Notification.permission !== 'denied') {
        var chatnotify = new Notification(user.name, { icon: "rest/domain/self/account/" + user.account + "/image/picture/150x150?" + new Date().getTime(), body: msg });
        chatnotify.onclick = function () { window.focus(); };
        chatnotify.onclose = function () { };
        setTimeout(function () {
          chatnotify.close();
        }, 5000);
      }*/
    }
  }
}

function openChatbox(user) {
  var u = user.account;

  if (user.type !== "extensions") return;
  if ($('#chat-box-' + u).length) return;

  var s = "<div class='chat-box' id='chat-box-" + u + "'>" +
          "<div class='chat-title' id='chat-title-" + u + "'></div>" +
          "<div class='chat-messages' id='chat-messages-" + u + "'></div>" +
          "<textarea class='chat-message' id='chat-message-" + u + "'></textarea>" +
          "</div>";

  $('#chat-bar').html($('#chat-bar').html() + s);
  $('#chat-title-' + u).html(user.name + "<img src='' class='chat-close' id='chat-close-" + u + "'>");
  $('#chat-message-' + u).focus();
  $(document.body).on('keypress', '#chat-message-'+u, function (event) {
    if (event.which == 13) {
      event.preventDefault();
      sendChatMsg(u);
    }
  });

  $(document.body).on('click', '#chat-title-'+u, function () {
    $('#chat-messages-' + u).toggle();
    $('#chat-message-' + u).toggle();
  });

  $(document.body).on('click', '#chat-close-'+u, function () {
    $('#chat-box-' + u).remove();
  });

  $('#chat-bar').bind("DOMSubtreeModified", function () {
    $('#chat-messages-' + u).scrollTop($('#chat-messages-' + u)[0].scrollHeight);
  });

  $('#user-'+u).bind("DOMSubtreeModified", function () {
    if (this.data.chatstatus === "online") {
      $('#chat-title-' + u).css('background-color', 'green');
      $('#chat-message-' + u).removeAttr('readonly');
    }
    else {
      $('#chat-title-' + u).css('background-color', 'red');
      $('#chat-message-' + u).attr('readonly', 'readonly');
    }
  });
}

function chatbox(ev, user) {
  ev.stopPropagation();
  openChatbox(user);
}

function viewUpdate() {
  var output = document.getElementById("output");
  output.innerHTML = "";
  output.appendChild(generateTable(allAccounts, columns));
}

function checkboxUpdate(e) {
  if (e.checked) {
    viewSettings.accounts[e.id].show = "true";
  }
  else {
    viewSettings.accounts[e.id].show = "false";
  }
  viewUpdate();
}

function radioUpdate(e) {
  viewSettings.sort = e.value;
  viewUpdate();
}

var columns = 4;
var allAccounts;
var viewSettings = {};
viewSettings.accounts = {};
viewSettings.sort = "";
function setViewSettings() {
  var div = document.createElement("div");
  var p = document.createElement("p");
  p.id = "sortby";
  div.appendChild(p);
  var label = document.createElement("label");
  label.id = "accountnumber";
  label.setAttribute("class", "cText");
  div.appendChild(label);
  var radio = document.createElement("input");
  radio.type = "radio";
  radio.name = "sortorder";
  radio.setAttribute("value", "account");
  radio.setAttribute("onclick", "radioUpdate(this)");
  if (viewSettings.sort !== "alphabetical")
    radio.setAttribute("checked", "");
  div.appendChild(radio);
  var label = document.createElement("label");
  label.id = "alphabetical";
  label.setAttribute("class", "cText");
  div.appendChild(label);
  var radio = document.createElement("input");
  radio.type = "radio";
  radio.name = "sortorder";
  radio.setAttribute("value", "alphabetical");
  radio.setAttribute("onclick", "radioUpdate(this)");
  if (viewSettings.sort === "alphabetical")
    radio.setAttribute("checked", "");
  div.appendChild(radio);
  var p = document.createElement("p");
  p.id = "accountstoshow";
  div.appendChild(p);
  var tab = document.createElement("table");
  tab.setAttribute("class", "cText");

  var tr = document.createElement("tr");
  var td = document.createElement("td");
  var input = document.createElement("input");
  input.type = "checkbox";
  input.id = "checkbox-select-all";
  td.appendChild(input);
  tr.appendChild(td);
  var td = document.createElement("td");
  var p = document.createElement("p");
  p.id = "all-text";
  td.appendChild(p);
  tr.appendChild(td);
  tab.appendChild(tr);

  for (var i = 0; i < allAccounts.length; i++) {
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    var input = document.createElement("input");
    input.type = "checkbox";
    if (viewSettings.accounts[allAccounts[i].account] === undefined) {
      input.setAttribute("checked", "true");
      viewSettings.accounts[allAccounts[i].account] = { show: "true"};
    }
    else {
      if (viewSettings.accounts[allAccounts[i].account].show === "true") {
        input.setAttribute("checked", "true");
      }
    }
    input.id = allAccounts[i].account;
    input.setAttribute("class", "selected-account");
    input.setAttribute("onclick", "checkboxUpdate(this)");
    td.appendChild(input);
    tr.appendChild(td);
    var td = document.createElement("td");
    td.innerHTML = allAccounts[i].account + ":" + allAccounts[i].name;
    tr.appendChild(td);
    tab.appendChild(tr);
  }
  div.appendChild(tab);

  $(document.body).on('click', '#checkbox-select-all', function () {
    if (this.checked) {
      $('.selected-account').each(function () {
        if(this.checked === false)
          this.click();
      });
    }
    else {
      $('.selected-account').each(function () {
        if(this.checked === true)
          this.click();
      });
    }
  });

  $("#dialog-accounts").html(div.innerHTML);
  $("#dialog-accounts").dialog({
    resizable: false,
    modal: true,
    title: "Accounts View",
    height: 450,
    width: 400,
    buttons: {
      "Save": function () {
        saveView();
        $(this).dialog('close');
      },
      "Cancel": function () {
        cancelView();
        $(this).dialog('close');
      }
    },
    close: function () {
      cancelView();
    }
  });

  var trans = getRest("/rest/system/translation/" + session.lang + "/usr_core_settings.htm,usr_index.js,-");
  var e = document.getElementById("ui-id-1");
  setInnerText(e, trans["usr_index.js#accountsview"]);
  var e = document.getElementById("sortby");
  setInnerText(e, trans["usr_index.js#sortby"]);
  var e = document.getElementById("accountnumber");
  setInnerText(e, trans["usr_index.js#accountnumber"]);
  var e = document.getElementById("alphabetical");
  setInnerText(e, trans["usr_index.js#alphabetical"]);
  var e = document.getElementById("accountstoshow");
  setInnerText(e, trans["usr_index.js#accountstoshow"]);
  var e = document.getElementById("all-text");
  setInnerText(e, trans["#all"]);
  var e = $(".ui-button-text").get(1);
  setInnerText(e, trans["usr_index.js#save"]);
  e.setAttribute("style", "padding:5px");
  var e = $(".ui-button-text").get(2);
  setInnerText(e, trans["usr_index.js#cancel"]);
  e.setAttribute("style", "padding:5px");
}

function saveView() {
  var saveData = { table: "users", settings: [{ name: "view_settings", value: JSON.stringify(viewSettings) }] };
  putRest("/rest/domain/self/account/self/user_settings", saveData);
}

function cancelView() {
  var data = getRest("/rest/domain/self/account/self/user_settings");
  if (data.settings.view_settings.value !== "")
    viewSettings = JSON.parse(data.settings.view_settings.value);
  viewUpdate();
}

function loadView() {
  // var data = getRest("/rest/domain/self/account/self/user_settings");
  // if(data.settings.view_settings.value !== "")
  //   viewSettings = JSON.parse(data.settings.view_settings.value);

  // If websocket is supported, do this here:
  if ("WebSocket" in window) {
    output = document.getElementById("output");
    window.addEventListener("load", startWebSocket, false);
  }

  checkPermission();
}

loadView();

function getColor(user) {
  var color = "#CCC";
  if(user.type == "extensions") {
    if(user.registered) {
      if(user.code != null)
        color = "#E00";
      else
        color = "#0E0";
    }
  }
  else {
    if(user.calls != null)
      color = "#E00";
  }
  return color;
}

function getUserElement(user) {
  var tab = document.createElement("table");
  tab.cellPadding = 0;
  tab.cellSpacing = 0;
  var tr = document.createElement("tr");
  tr.id = "acct4:" + user.account;
  tr.setAttribute('ondrop', 'drop(event)');
  tr.setAttribute('ondragenter', 'onDragEnter(event)');
  tr.setAttribute('ondragover', 'allowDrop(event)');
  tr.setAttribute('ondragleave', 'onDragLeave(event)');
  var td = document.createElement("td");
  td.setAttribute('class', 'acctbox');
  td.id = "acct:" + user.account;
  //td.style.cssText = "width:50px;height:50px;background:" + getColor(user) + ";";

  var tab2 = document.createElement("table");
  tab2.cellPadding = "0";
  tab2.cellSpacing = "0";
  var tr2 = document.createElement("tr");
  var td2 = document.createElement("td");
  td2.style.background = getColor(user);
  td2.style.width = "8";
  tr2.appendChild(td2);
  var td2 = document.createElement("td");
  td2.id = "acct2:" + user.account;
  var img = document.createElement("img");
  img.id = "img:" + user.account;
  img.style.height = "40px";
  img.style.width = "40px";
  /*if(refreshImages)
    img.src = "rest/domain/self/account/" + user.account + "/image/picture/150x150?" + new Date().getTime();
  else
    img.src = "rest/domain/self/account/" + user.account + "/image/picture/150x150";*/
  td2.appendChild(img);
  tr2.appendChild(td2);
  td2 = document.createElement("td");
  td2.id = "acct3:" + user.account;
  td2.style.paddingLeft = "4";
  td2.style.verticalAlign = "top";
  td2.width = "120px";
  if (user.name.length > 15) user.name = user.name.substr(0, 15) + "...";
  if (user.account.length > 15) user.account = user.account.substr(0, 15) + "...";
  var label = document.createElement("label");
  label.id = "label:" + user.account;
  label.style.fontSize = "0.85em";
  label.style.fontWeight = "bold";
  label.appendChild(document.createTextNode(user.name));
  td2.appendChild(label);
  td2.appendChild(document.createElement("br"));
  var label = document.createElement("label");
  label.id = "label2:" + user.account;
  label.style.fontSize = "0.85em";
  label.appendChild(document.createTextNode(user.account));
  td2.appendChild(label);
  if (user.dnd) {
    var dnd = document.createElement("img");
    dnd.src = "/img/dnd.gif";
    td2.appendChild(dnd);
  }
  tr2.appendChild(td2);
  var td2 = document.createElement("td");
  var img = document.createElement("img");
  img.id = "img2:" + user.account;
  if(user.chatstatus === "online")
    img.src = "/img/im.png";
  img.setAttribute("onclick", "chatbox(event, " + JSON.stringify(user) + ")");
  td2.appendChild(img);
  tr2.appendChild(td2);
  tab2.appendChild(tr2);
  td.appendChild(tab2);

  td.setAttribute('onclick', 'dialNumber(this.id)');
  td.setAttribute('style', 'cursor: pointer;');
  td.setAttribute('onclick', 'dialNumber(this.id)');
  td.setAttribute('style', 'cursor: pointer;');
  tr.appendChild(td);
  tab.appendChild(tr);
  if(user.calls) {
    for(var i = 0; i < user.calls.length; i++) {
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      td.setAttribute("colspan", "3");
      td.appendChild(document.createTextNode(prettify_from_to_spec(user.calls[i].from, "tanda.telegate.net.au")));
      tr.appendChild(td);
      tab.appendChild(tr);
    }
  }
  return tab;
}

function generateTable(users, columns) {
  if (viewSettings.sort === "alphabetical")
    users.sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
  else
    users.sort(function(a,b) { return a.account < b.account ? -1 : a.account > b.account ? 1 : 0; });

  var users2 = [];
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    var acct = viewSettings.accounts[u.account];
    if (acct !== undefined && acct.show !== "true")
      continue;
    users2.push(u);
  }

  var table = document.createElement("table");
  for (var i = 0; i < users2.length; i += columns) {
    var tr = document.createElement("tr");
    for(var j = 0; j < columns; j++) {
      if(i + j < users2.length) {
        var u = users2[i + j];
        var td = document.createElement("td");
        td.id = "user-" + u.account;
        td.data = u;
        td.style.width = 100 / columns + " %";
        td.appendChild(getUserElement(td.data));
        tr.appendChild(td);
      }
    }
    table.appendChild(tr);
  }
  return table;
}

function onMessage(evt) {
  var msg = JSON.parse(evt.data);
  if(msg.sdp) {
    //console.info(msg.sdp);
    if(callStatus != IDLE) {
      if(callStatus == RINGING)
        callStatus = CONNECTED;
      return;
    }
    var d = new RTCSessionDescription({ type: "answer", sdp: msg.sdp });
    peercon.setRemoteDescription(d, remoteSDPSucceeded, remoteSDPFailed);
    callStatus = RINGING;
    if (typeof changetoendcall === "function")
      changetoendcall();
    return;
  }
  else if(msg.candidate) {
    //console.info(msg.candidate);
    //peercon.addIceCandidate(new RTCIceCandidate({ candidate: msg.candidate }));
    peercon.addIceCandidate(new RTCIceCandidate({ candidate: msg.candidate, sdpMid:"", sdpMLineIndex:0 }),
      function() {},
      function(error) { console.info("Candidate failed: " + JSON.stringify(error)); });
    return;
  }
  else if(msg.bye) {
    //console.info(msg.bye);
    endcall(false, "bye-response");
    return;
  }
  else if (msg.cancel) {
    //console.info(msg.cancel);
    if (typeof mobileInterface !== "function") {
      if (notification != undefined) notification.close();
    }
    endcall(false, "cancel-response");
    return;
  }
  else if(msg.cancelresponse) {
    //console.info(msg.cancelresponse);
    endcall(false, "");
    return;
  }
  else if(msg.invitesdp) {
    //console.info(msg.invitesdp);
    if(callStatus != IDLE) return;
    openrecvcall();
    var d = new RTCSessionDescription({ type: "offer", sdp: msg.invitesdp });
    peercon.setRemoteDescription(d, remoteSDPSucceeded, remoteSDPFailed);
    doSend(JSON.stringify({ action: "sip-ringing" }));
    callDir = CALLEE;
    callStatus = RINGING;
    incomingCall(prettify_from_to_spec(msg.from, "tanda.telegate.net.au"), prettify_from_to_spec(msg.to, "tanda.telegate.net.au"));
    return;
  }
  // writeToScreen('<span style="color: blue;">' + evt.data.replace(new RegExp("<", "g"), "&lt;").replace(new RegExp(">", "g"), "&gt;") + '</span>');
  switch (msg.action) {
    case "crmcontact":
      if (typeof mobileInterface !== "function") {
        if ("Notification" in window) {
          if (Notification.permission !== 'denied') {
            var j = JSON.parse(msg.data);
            var r = j.records;
            if (r.length > 0) {
              var n;
              var outbound = (msg.direction === "Outbound");
              if(outbound)
                n = new Notification("Outgoing Call", { icon: "img/my_phone.png", body: "To CRM Contact: " + r[0].Name + "\n" + "Click to go to the contact" });
              else
                n = new Notification("Incoming Call", { icon: "img/my_phone.png", body: "From CRM Contact: " + r[0].Name + "\n" + "Click to go to the contact" });
              var surl = msg.serverurl;
              var u = r[0].attributes.url.split('/');
              if (u.length > 6) {
                var contact = u[6].substr(0, u[6].length - 3);
                var url = surl + "/" + contact;
                n.onclick = function () { window.open(url); };
              }
            }
          }
        }
      }
      break;
    case "chat":
      recvChatMsg(msg.dest, msg.message);
      break;
    case "user-state":
      if (msg.account != null) {
        if (typeof presenceData === "function") {
          presenceData("", msg);
          return;
        }
        var td = document.getElementById("user-" + msg.account);
        if (td === null) break;
        td.data.code = msg.code;
        td.data.chatstatus = msg.chatstatus;
        if(msg.type == "acds") {
          // Check if we should update the ACD statistics
          if(msg.account == displayed_acd) showacd(msg.account);
          else if(displayed_acd == "-") showallacd();
        }
        td.data.calls = msg.calls;
        if(msg.dnd != null) td.data.dnd = msg.dnd;
        if(msg.registered != null) td.data.registered = msg.registered;
        if(msg.tag != null) td.data.tag = msg.tag;
        if(td.hasChildNodes()) {
          td.replaceChild(getUserElement(td.data), td.childNodes[0]);
        }
        else {
          td.appendChild(getUserElement(td.data));
        }
      }
      break;
    case "domain-state":
      // Get an overview what accounts we have:
      var ext = [], grp = [], cnf = [], oth = [], all = [];
      for(var i = 0; i < msg.accounts.length; i++) {
        switch(msg.accounts[i].type) {
          case "extensions":
            ext.push(msg.accounts[i]);
            all.push(msg.accounts[i]);
            break;
          case "attendants":
          case "acds":
          case "hunts":
            grp.push(msg.accounts[i]);
            all.push(msg.accounts[i]);
            break;
          case "conferences":
            cnf.push(msg.accounts[i]);
            all.push(msg.accounts[i]);
            break;
          default:
            oth.push(msg.accounts[i]);
            all.push(msg.accounts[i]);
            break;
        }
      }

      if (typeof presenceData === "function") {
        presenceData(ext);
        return;
      }

      allAccounts = all;
      // Create the extension table:
      var output = document.getElementById("output");
      //output.appendChild(generateTable(ext, columns));
      //output.appendChild(generateTable(grp, columns));
      //output.appendChild(generateTable(cnf, columns));
      //output.appendChild(generateTable(oth, columns));
      output.appendChild(generateTable(all, columns));
      refreshImages = false;
      break;

    case "call-state":
	    console.log("skip for now")
      // if (typeof mobileInterface === "function") {
      //   return;
      // }
      // var ringing_tab = document.getElementById("ringing_calls");
      // var calls_tab = document.getElementById("active_calls");
      // var onhold_tab = document.getElementById("onhold_calls");
      // var ringing = document.createElement("table");
      // ringing.setAttribute("style", "color: blue;");
      // var tab = document.createElement("table");
      // tab.setAttribute("style", "color: blue;");
      // var onhold = document.createElement("table");
      // onhold.setAttribute("style", "color: blue;");

      // for(var i = 0; i < msg.calls.length; i++) {
      //   var c = msg.calls[i];
      //   var from, to, fa, ta;
      //   var f = prettify_from_to_spec(c.from, "").split('('); // abc (123@example.com) -> abc,123@example.com) OR 123@example.com -> 123@example.com
      //   if(f[1]) from = f[1].split(')')[0]; // abc,123@example.com) -> 123@example.com
      //   else from = f[0]; // 123@example.com
      //   fa = from.split('@')[0]; // 123@example.com -> 123
      //   var t = prettify_from_to_spec(c.to, "").split('(');
      //   if(t[1]) to = t[1].split(')')[0];
      //   else to = t[0];
      //   ta = to.split('@')[0];
      //   tr = document.createElement("tr");
      //   td = document.createElement("img");
      //   td.setAttribute('style', 'cursor: pointer; width:32px; height:auto;');
      //   td.id = c.id;
      //   td.src = "img/cross.png";
      //   td.setAttribute('onclick','clearcall(this.id)');
      //   tr.appendChild(td);
      //   if (c.callstate === "ringback" || c.callstate === "alerting") {
      //     var image = "img/answer.png";
      //     td = document.createElement("img");
      //     td.id = "accept:" + c.id;
      //     td.src = image;
      //     td.setAttribute('style', 'cursor: pointer; width:32px; height:auto;');
      //     td.setAttribute('onclick','acceptphonecall(this.id)');
      //     tr.appendChild(td);
      //   }
      //   if (c.callstate === "connected") {
      //     td = document.createElement("img");
      //     if(from == "484 61735558484".split(" ")[0])
      //       td.id = c.id + ":" + to + ":" + from;
      //     else
      //       td.id = c.id + ":" + from + ":" + to;
      //     td.src = "img/transfer.png";
      //     td.setAttribute('style', 'width:32px; height:auto;');
      //     td.setAttribute('draggable', 'true');
      //     td.setAttribute('ondragstart','drag(event)');
      //     tr.appendChild(td);
      //   }
      //   else if (c.callstate === "onhold" || c.callstate === "holding") {
      //     td = document.createElement("img");
      //     if(from == "484 61735558484".split(" ")[0])
      //       td.id = c.id + ":" + to + ":" + from;
      //     else
      //       td.id = c.id + ":" + from + ":" + to;
      //     td.src = "img/transfer.png";
      //     td.setAttribute('style', 'width:32px; height:auto;');
      //     td.setAttribute('ondrop', 'drop_att_xfer(event)');
      //     td.setAttribute('ondragover', 'allowDrop(event)');
      //     //tr.appendChild(td);
      //   }
      //   if (c.callstate !== "ringback" && c.callstate !== "alerting") {
      //     var image = (c.callstate === "connected") ? "img/hold.png" : "img/resume.png";
      //     td = document.createElement("img");
      //     td.id = "hold:" + c.id;
      //     td.src = image;
      //     td.setAttribute('style', 'cursor: pointer; width:32px; height:auto;');
      //     td.setAttribute('onclick','holdcall(this.id)');
      //     tr.appendChild(td);
      //   }
      //   td = document.createElement("td");
      //   if(from !== "484 61735558484".split(" ")[0]) {
      //     td.innerHTML = present_html(prettify_from_to_spec(c.from, "tanda.telegate.net.au")) + spaces;
      //   }
      //   else {
      //     td.innerHTML = present_html(prettify_from_to_spec(c.to, "tanda.telegate.net.au")) + spaces;
      //   }
      //   if(from == "484 61735558484".split(" ")[0])
      //     td.id = c.id + ":" + to + ":" + from;
      //   else
      //     td.id = c.id + ":" + from + ":" + to;
      //   td.setAttribute('ondrop', 'drop_att_xfer(event)');
      //   td.setAttribute('ondragenter', 'onDragEnter(event)');
      //   td.setAttribute('ondragover', 'allowDrop(event)');
      //   td.setAttribute('ondragleave', 'onDragLeave(event)');
      //   tr.appendChild(td);

      //   /*td = document.createElement("td");
      //   var d = new Date(c.start * 1000);
      //   var time = d.toLocaleString().split(' ');
      //   td.innerHTML = time[1] + " " + time[2] + spaces;
      //   tr.appendChild(td);
      //   td = document.createElement("td");
      //   td.id = "cmc:" + c.id;
      //   //td.setAttribute('onclick','changecmc(this.id)');
      //   if(c.cmc == "") {
      //       td.innerHTML = "None" + spaces;
      //   }
      //   else {
      //       td.innerHTML = c.cmc + spaces;
      //   }
      //   tr.appendChild(td);*/

      //   var td = document.createElement("td");
      //   var img = document.createElement("img");
      //   img.id = "rec:" + c.id;
      //   img.setAttribute('onclick','reccall(this.id)');
      //   if(c.rec == "adhoc") {
      //       img.rec = "on";
      //       img.src = "img/busy_phone.png";
      //   }
      //   else {
      //       img.rec = "off";
      //       img.src = "img/idle_person.png";
      //   }
      //   td.appendChild(img);
      //   tr.appendChild(td);

      //   if (c.callstate === "connected") {
      //     tab.appendChild(tr);
      //   }
      //   else if (c.callstate === "onhold" || c.callstate === "holding") {
      //     onhold.appendChild(tr);
      //   }
      //   else {
      //     ringing.appendChild(tr);
      //   }
      //   //
      //   //
      //   //
      // }
      // if(calls_tab.hasChildNodes()) {
      //   calls_tab.replaceChild(tab, calls_tab.childNodes[0]);
      // }
      // else {
      //   calls_tab.appendChild(tab);
      // }
      // if(onhold_tab.hasChildNodes()) {
      //   onhold_tab.replaceChild(onhold, onhold_tab.childNodes[0]);
      // }
      // else {
      //   onhold_tab.appendChild(onhold);
      // }
      // if(ringing_tab.hasChildNodes()) {
      //   ringing_tab.replaceChild(ringing, ringing_tab.childNodes[0]);
      // }
      // else {
      //   ringing_tab.appendChild(ringing);
      // }
      break;

    default:
      writeToScreen('<span style="color: blue;">Unknown action</span>');
      break;
  }
}

function onError(evt) {
  writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
  socket.close();
}

function doSend(message) {
  socket.send(message);
}

function writeToScreen(message) {
  var pre = document.createElement("p");
  pre.style.wordWrap = "break-word";
  pre.innerHTML = message;
  document.getElementById("output").appendChild(pre);
}

// If websocket is supported, do this here:
/*if("WebSocket" in window) {
  output = document.getElementById("output");
  window.addEventListener("load", startWebSocket, false);
}*/
// ]]

function addtocrm(id) {
  var s = document.getElementById("subject");
  var d = document.getElementById("description");
  var callid = id.split(':') [1];
  msg = { action: "add-to-crm"};
  msg["sub"] = s.value;
  msg["des"] = d.value;
  msg["id"] = callid;
  doSend(JSON.stringify(msg));
}

function makecall() {
  var e = document.getElementById("dialed_number");
  msg = { action: "make-call"};
  msg["to"] = e.value;
  doSend(JSON.stringify(msg));
}

function holdcall(id) {
  var d = id.split(':')[1];
  msg = { action: "hold-call"};
  msg["id"] = d;
  doSend(JSON.stringify(msg));
}

function acceptphonecall(id) {
  var data = id.split(':') [1];
  msg = { action: "accept-call"};
  msg["id"] = data;
  doSend(JSON.stringify(msg));
}

function clearcall(id) {
  var data = id;
  msg = { action: "clear-call"};
  msg["id"] = data;
  if(callStatus == CONNECTED)
    msg["connected"] = "true";
  else
    msg["connected"] = "false";
  doSend(JSON.stringify(msg));
}

function reccall(id) {
  var d = id.split(':')[1];
  var a;
  var e = document.getElementById(id);
  if(e.rec === "off") a = "on";
  else a = "off";
  msg = { action: "rec-call"};
  msg["id"] = d;
  msg["startstop"] = a;
  doSend(JSON.stringify(msg));
}

//////drag/drop
function onmousedown(ev) {
  //ev.preventDefault();
}

function onDragEnter(ev) {
  //ev.target.style.backgroundColor = "orange";
  event.target.style.border = "2px dotted red";
}

function allowDrop(ev) {
  ev.preventDefault();
}

function onDragLeave(ev) {
  //ev.target.style.backgroundColor = "#f1f1f1";
  event.target.style.border = "";
}

function drag(ev) {
  ev.dataTransfer.setData("Text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.target.id.split(':')[1];
  var dragdata = ev.dataTransfer.getData("Text");
  msg = { action: "blind-transfer"};
  msg["id"] = dragdata.split(":")[0];
  msg["from"] = dragdata.split(":")[1];
  msg["to"] = data;
  doSend(JSON.stringify(msg));
}

function drop_att_xfer(ev) {
  /*ev.preventDefault();
  var data = ev.target.id;
  var dragdata = ev.dataTransfer.getData("Text");
  msg = { action: "att-transfer"};
  msg["id"] = dragdata.split(":")[0];
  msg["from"] = dragdata.split(":")[2];
  msg["id2"] = data.split(':')[1];
  msg["to"] = data.split(':')[2];
  doSend(JSON.stringify(msg));*/
  ev.preventDefault();
  var data = ev.target.id;
  var dragdata = ev.dataTransfer.getData("Text");
  msg = { action: "att-transfer"};
  msg["id"] = data.split(":")[0];
  msg["from"] = data.split(":")[1];
  msg["id2"] = dragdata.split(":")[0];
  msg["to"] = dragdata.split(":")[1];
  doSend(JSON.stringify(msg));
}
///////////////

///////////////
var peercon;
var localStream;

try {
  if (!webkitRTCPeerConnection) {
    navigator.webkitGetUserMedia = navigator.getUserMedia;
    webkitRTCPeerConnection = RTCPeerConnection;
    RTCSessionDescription = RTCSessionDescription
    RTCIceCandidate = RTCIceCandidate;
  }
}
catch (e) {
  navigator.webkitGetUserMedia = navigator.mozGetUserMedia;
  webkitRTCPeerConnection = mozRTCPeerConnection;
  RTCSessionDescription = mozRTCSessionDescription
  RTCIceCandidate = mozRTCIceCandidate;
}

function remoteSDPSucceeded() {
  //console.info("Set remote sdp succeeded.");
}

function remoteSDPFailed(err) {
  console.error("Set remote sdp failed error = " + JSON.stringify(err));
}

function localSDPSucceeded() {
  //console.info("Set local sdp succeeded.");
}

function localSDPFailed(err) {
  console.error("Set local sdp failed error = " + JSON.stringify(err));
}

function stopcall() {
  localStream.stop();
}

function endcall(local, msg) {
  if(localStream)
    localStream.stop();

  if (local) {
    if(callDir == CALLER)
      doSend(JSON.stringify({ action: "sip-bye", caller: "true" }));
    else
      doSend(JSON.stringify({ action: "sip-bye", caller: "false" }));
  }
  else {
    if (msg)
      doSend(JSON.stringify({ action: msg }));
  }

  callDir = NONE;
  callStatus = IDLE;
  ff_accept = false;
  if (typeof mobileInterface === "function") {
    Android.stopMedia();
    var cf = document.getElementById("callfrom");
    if (cf) cf.innerHTML = "";
    var co = document.getElementById("calloptions");
    if (co) co.style.display = "none";
    if (typeof changetomakecall === "function")
      changetomakecall();
  }

  // Call Start/End Buttons
  var call_button_start = document.getElementById("call-btn");
  call_button_start.classList.remove("btn-hide");
  var call_button_end = document.getElementById("endcall-btn");
  call_button_end.classList.add("btn-hide");
}

function openrecvcall() {
  //var DTLS = {"optional": [{'DtlsSrtpKeyAgreement': 'false'}]};
  var DTLS = {"optional": [{'DtlsSrtpKeyAgreement': 'true'}]};
  peercon = new webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] }, DTLS);
  //peercon = new webkitRTCPeerConnection(null);

  // send any ice candidates to the other peer
  peercon.onicecandidate = function (evt) {
    doSend(JSON.stringify({ action: "ice-candidate", "candidate": evt.candidate }));
  }

  // once remote stream arrives, this is called
  peercon.onaddstream = function (evt) {
    var audio = document.getElementById("remoteAudio");
    audio.src = URL.createObjectURL(evt.stream);
  }
}

function recvcall() {
  if(callStatus != RINGING) return;

  var a = document.getElementById("remoteAudio");
  a.play();

  navigator.webkitGetUserMedia({ "audio": true, "video": false }, function (stream) {
    peercon.addStream(stream);
    //localStream = stream;
    localStream = stream.getTracks()[0];

    //peercon.createAnswer(peercon.remoteDescription, onDescriptionReady);
    //peercon.createAnswer(onDescriptionReady, null, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': false } });
    peercon.createAnswer(onDescriptionReady, function (err) { console.info("createAnswer failed. Error: " + JSON.stringify(err)); }, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': false } });
    //peercon.createAnswer(onDescriptionReady, function(){}, { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': false } );

    function onDescriptionReady(desc) {
      //console.info("local sdp:" + desc.sdp);
      peercon.setLocalDescription(desc, localSDPSucceeded, localSDPFailed);
      doSend(JSON.stringify({ action: "sdp-200ok", "sdp": desc }));
      callStatus = CONNECTED;
      if (typeof changetoendcall === "function")
        changetoendcall();
    }
  }, function () { alert("media error"); console.info("Media error: " + JSON.stringify(err)); } );
}

function dialNumber(n) {
  var number = n.split(":")[1].replace(/[()-\s]/g, "");
  if (typeof mobileDialNumber === "function") {
    mobileDialNumber(number);
    return;
  }
  var yes = confirm("Call: " + number + " ?");
  if (yes) {
    var dial_elem = document.getElementById("dialed_number");
    dial_elem.value = number;
    makecall2(true);
  }
}

function makecall2(isCaller) {
  if(!navigator.webkitGetUserMedia || !webkitRTCPeerConnection) return;
  if(callStatus != IDLE) return;
  if(isCaller) callDir = CALLER;
  var dial_elem = document.getElementById("dialed_number");

  if (dial_elem.value === "") {
    endcall(true);
    alert("Enter a number to dial first.");
    return;
} else {
    // Call Start/End Buttons
    var call_button_start = document.getElementById("call-btn");
    call_button_start.classList.add("btn-hide");
    var call_button_end = document.getElementById("endcall-btn");
    call_button_end.classList.remove("btn-hide");
}
  redialNumber = dial_elem.value;

  //var DTLS = {"optional": [{'DtlsSrtpKeyAgreement': 'false'}]};
  var DTLS = {"optional": [{'DtlsSrtpKeyAgreement': 'true'}]};
  peercon = new webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] }, DTLS);
  //peercon = new webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] });
  //peercon = new webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:stun.services.mozilla.com" }] });
  //peercon = new webkitRTCPeerConnection(null);

  // send any ice candidates to the other peer
  peercon.onicecandidate = function (evt) {
    //console.info("local candidate:" + evt.candidate.candidate);
    //console.info("local candidate:" + JSON.stringify(evt.candidate));
    doSend(JSON.stringify({ action: "ice-candidate", "candidate": evt.candidate }));
  }

  // once remote stream arrives, this is called
  peercon.onaddstream = function (evt) {
    var audio = document.getElementById("remoteAudio");
    audio.src = URL.createObjectURL(evt.stream);
    audio.play();
    //remoteView.src = URL.createObjectURL(evt.stream);
    //var audioContext = new window.webkitAudioContext();
    //var mediaStreamSourceNode = audioContext.createMediaStreamSource(evt.stream);
    //mediaStreamSourceNode.connect(audioContext.destination);
  }

  // get the local stream, and send it
  navigator.webkitGetUserMedia({ "audio": true, "video": false }, function (stream) {
    peercon.addStream(stream);
    //localStream = stream;
    localStream = stream.getTracks()[0];

    if (typeof peercon.createDTMFSender === "function")
      dtmfSender = peercon.createDTMFSender(stream.getAudioTracks()[0]);

    if (isCaller) {
      //peercon.createOffer(onDescriptionReady);
      //peercon.createOffer(onDescriptionReady, null, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': false } });
      if (typeof mobileInterface === "function") {
        peercon.createOffer(onDescriptionReady, function failed(err) { console.info("createOffer failed. Error: " + JSON.stringify(err)); }, { optional:[], mandatory: { OfferToReceiveAudio: true, OfferToReceiveVideo: false }});
      }
      else {
        peercon.createOffer(onDescriptionReady, function failed(err) { console.info("createOffer failed. Error: " + JSON.stringify(err)); }, { 'offerToReceiveAudio': true, 'offerToReceiveVideo': false });
      }
    }
    else {
      peercon.createAnswer(peercon.remoteDescription, onDescriptionReady);
    }

    function onDescriptionReady(desc) {
      //console.info("local sdp:" + desc.sdp);
      peercon.setLocalDescription(desc, localSDPSucceeded, localSDPFailed);
      //peercon.setRemoteDescription(desc);
      doSend(JSON.stringify({ action: "sdp-packet", "to" : dial_elem.value, "sdp": desc }));
    }
  }, function (err) { alert("media error"); console.info("Media error: " + JSON.stringify(err)); } );
}

function register(p) {
  if (navigator.webkitGetUserMedia && webkitRTCPeerConnection) {
    doSend(JSON.stringify({ action: "sip-register" }));
  }
  if(p != false)
    checkPermission();
}

var ff_accept = false; // temporary fix for firefox notification which calls both onclick and onclose when you click it
function acceptcall() {
  var a = document.getElementById("alertPlayer");
  if (a) a.pause();
  window.focus();
  if (typeof mobileInterface === "function") {
    Android.stopMedia();
  }
  recvcall();
  ff_accept = true;
}

function rejectcall() {
  if (!ff_accept) {
    //var a = document.getElementById("alertPlayer");
    //if (a) a.pause();
    window.focus();
    doSend(JSON.stringify({ action: "sip-busy" }));
    callStatus = IDLE;
    if (typeof mobileInterface === "function") {
      Android.stopMedia();
    }
  }
  ff_accept = false;
}

function checkPermission() {
  var f = document.URL.split('/')[3];
  if (f !== "usr_phone.htm") {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (status) {
        if (Notification.permission !== status) {
          Notification.permission = status;
        }
      });
    }
  }
}

function incomingCall(from, to) {
  if (typeof mobileInterface !== "function") {
    if ("Notification" in window) {
      if (Notification.permission !== 'denied') {
        notification = new Notification("Incoming Call", { icon: "img/my_phone.png", body: "From: " + from + "\n" + "To: " + to + "\n" + "Click for Accept, Cancel for Reject" });
        notification.onclick = acceptcall;
        notification.onclose = rejectcall;
      }
    }
  }
  else {
    /*var a = document.getElementById("alertPlayer");
    var s = document.getElementById("alertSource");
    s.setAttribute("src", "tftp/alert.wav");
    a.load();
    a.onended = function () {
      if (callStatus === RINGING)
        a.load();
    }*/
    var cf = document.getElementById("callfrom");
    cf.innerHTML = "From: " + from;
    var calloptions = document.getElementById("calloptions");
    calloptions.style.display = "";
    //callOptions();
    if (typeof mobileInterface === "function") {
      Android.playMedia();
      Android.incomingCall(from);
    }
  }
}

function callOptions() {
  //window.focus();
  var accept = confirm("Accept or Reject?");
  if(accept)
    acceptcall();
  else
    rejectcall();
};
