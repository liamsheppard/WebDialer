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
  putRest("/rest/system/session", vars);
  session = getRest("/rest/system/session");
  switch (session.type) {
  document.location = "index.html"; break;
  }
}

// Restore the cookie from last time?
function tryLogin() {
  var loginName = getCookie("loginname");
  if (loginName == "") return false;
  var loginHash = getCookie("loginhash");
  var vars = { name: "auth", value: loginName + " " + loginHash };
  var sessId = putRest("/rest/system/session", vars);
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
  sessId = putRest("/rest/system/session", vars);
  if (sessId != "") {
    document.cookie = "session=" + sessId;
    var lang = document.getElementById("login_lang").value;
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
    setInnerText("warning", lang("login.htm", "3"));
  }
  return false;
}
