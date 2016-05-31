//
//  Scripts for the Vodia PBX
//  (C) Vodia Networks 2015
//
//  This file is property of Vodia Networks Inc. All rights reserved. 
//  For more information mail Vodia Networks Inc., info@vodia.com.
//

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return "";
}

// After we successful logged in, call this:
function loggedIn(lang) {
  if (lang == "") lang = "en";
  var vars = { name: "lang", value: lang };
  putRest("https://tanda.telegate.net.au/rest/system/session", vars);
  session = getRest("https://tanda.telegate.net.au/rest/system/session");
  /*switch (session.type) {
  case "admin":
    var license = getRest("http://tanda.telegate.net.au/rest/system/license");
    if (license.licensed)
      document.location = "reg_domains.htm"; 
    else
      document.location = "reg_license.htm";
    break;
  //case "domain": document.location = "dom_accounts.htm"; break;
  //case "user": document.location = "usr_index.htm"; break;
  }*/
}

// Restore the cookie from last time?
function tryLogin() {
  var loginName = getCookie("loginname");
  if (loginName == "") return false;
  var loginHash = getCookie("loginhash");
  var vars = { name: "auth", value: loginName + " " + loginHash };
  var sessId = putRest("https://tanda.telegate.net.au/rest/system/session", vars);
  if (sessId == "") return false;
  document.cookie = "session=" + sessId;
  loggedIn(getCookie("loginlang"));
  return true;
}

function executeLogin() {
  var account = document.getElementById("login_account").value;
  var password = document.getElementById("login_password").value;
  var hash = password == "" ? password : CryptoJS.MD5(password);
  var vars = { name: "auth", value: account + " " + hash };
  sessId = putRest("https://tanda.telegate.net.au/rest/system/session", vars);
  if (sessId != "") {
    document.cookie = "session=" + sessId;
    var lang = "en"; //document.getElementById("login_lang").value;
    if (document.getElementById("login_cookie").checked) {
      var d = new Date();
      d.setTime(d.getTime() + (14 * 24 * 60 * 60 * 1000));
      var expires = "expires=" + d.toGMTString();
      document.cookie = "loginname=" + account + "; " + expires;
      document.cookie = "loginhash=" + hash + "; " + expires;
      document.cookie = "loginlang=" + lang + "; " + expires;
    }
    loggedIn(lang);
  }
  else {
    //setInnerText("warning", lang("login.htm", "3"));
  }
  return false;
}

// Send a password reminder:
function recoverPassword() {
  if(!confirm(lang("login.htm", "recover_confirm", document.getElementById("login_account").value))) return;
  var user = document.getElementById("login_account").value;
  if(putRest("https://tanda.telegate.net.au/rest/system/session", { name: "reset", value: user })) {
    setInnerText("warning", lang("login.htm", "recover_ok"));
  }
  else {
    setInnerText("warning", lang("login.htm", "recover_fail"));
  }
  document.getElementById("warning").style.display = "";
}

onReady(function() {
  try {
    var logo = document.getElementsByClassName("headerimage")[0];
    logo.style.backgroundImage="url(/rest/domain/" + encodeURIComponent(window.location.hostname) + "/image/banner/430x68)";
  }
  catch(e) {
    console.log("Could not set the header image URL");
  }
  
  if (!tryLogin()) {
    session = getRest("https://tanda.telegate.net.au/rest/system/session");
    localization = getRest("https://tanda.telegate.net.au/rest/system/localization");
    var config = getRest("https://tanda.telegate.net.au/rest/system/config");
    loadLang(["-","login.htm"]);
    translateItems();
    setInnerText("copyright", lang("", "copyright", "2016"));
    document.getElementById("copyright").href = config && config.app_link || "http://vodia.com";
    document.getElementById("login").value = lang("", "login");
    setLanguage("doc", "login_lang", session.lang, localization.web);
    document.doc.login_account.focus();
  }
});