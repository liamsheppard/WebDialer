//
//  Scripts for the Vodia PBX
//  (C) Vodia Networks 2015
//
//  This file is property of Vodia Networks Inc. All rights reserved. 
//  For more information mail Vodia Networks Inc., info@vodia.com.
//

var cur_section = "home";
var cur_settings = {};
var dict = {};
var session = getRest("/rest/system/session");

function translatePage() {
  translateFiles["usr_index.js"] = 1;
  translateFiles["usr_index.htm"] = 1;
  translateFiles["usr_core_settings.htm"] = 1;
  translateFiles["usr_core_redirection.htm"] = 1;
  translateFiles["usr_header.htm"] = 1;
  translateFiles["dom_ext3.htm"] = 1;
  translateFiles["usr_core_feature_codes.htm"] = 1;
  translateFiles["dom_hunt.htm"] = 1;
  translateFiles["dom_acd.htm"] = 1;
  translateFiles["usr_core_email.htm"] = 1;
  translateFiles["usr_core_mailbox.htm"] = 1;
  translateFiles["dom_settings.htm"] = 1;
  translateFiles["usr_adrbook.htm"] = 1;
  translateFiles["usr_adrbook2.htm"] = 1;
  translateFiles["usr_buttons.htm"] = 1;
  translateFiles["usr_feature_codes.htm"] = 1;
  translateFiles["usr_status.htm"] = 1;
  translateFiles["usr_activesync.htm"] = 1;
  translateFiles["dom_locations.htm"] = 1;
  translateFiles["usr_core_location.htm"] = 1;
  translateFiles["dom_adrbook.htm"] = 1;
  translateFiles["usr_conf.htm"] = 1;
  translateFiles["usr_lists.htm"] = 1;
  translateFiles["usr_im.htm"] = 1;
  translateFiles["usr_recording.htm"] = 1;
  translateFiles["timezones.xml"] = 1;
  translateFiles["preload.js"] = 1;
  translateFiles["-"] = 1;
  translateItems2();
}

function get_section_settings(section) {
  var settings;
  if (section == "accinfo") settings = new Array("first_name", "display_name", "position");
  else if (section == "timezone") settings = new Array("tz");
  else if (section == "lang") settings = new Array("lang_audio", "lang_web");
  else if (section == "pic") settings = new Array("picture");
  else if (section == "ringtone") settings = new Array("melody");
  else if (section == "monitor") settings = new Array("presence", "dialog_subscribe", "pickups", "orbits", "block_cid", "cw", "wakeup");
  else if (section == "lync") settings = new Array("lync_username", "lync_authname");
  else if (section == "adrbook") settings = new Array("adrbook_pref", "include_local");
  else if (section == "moh") settings = new Array("moh");
  else if (section == "mobile") settings = new Array("cell_dis", "no_vpa", "cell_always", "cell_never", "cell_time", "cell_conn", "cell_night", "cell_hunt", "cell_acd", "cell_c2d", "hours_mon", "hours_tue", "hours_wed", "hours_thu", "hours_fri", "hours_sat", "hours_sun", "hours_holiday");
  else if (section == "dnd") settings = new Array("dnd");
  else if (section == "anonymous") settings = new Array("anonymous");
  else if (section == "hotdesk") settings = new Array("cfr");
  else if (section == "forwarding") settings = new Array("cfa", "cfd", "cfb", "cfn", "cfn_timeout");
  else if (section == "email") settings = new Array("email_address", "email_vmail", "vmail_option", "email_missed", "email_mb_full", "email_all", "email_status", "email_black_call", "wakeup_fail_email");
  else if (section == "locations") settings = new Array("name", "ttype", "tvalue", "e911_num", "e911_ani", "street", "city", "state", "zip", "country");
  else if (section == "mailbox") settings = new Array("mb_enable", "mb_timeout", "mb_size", "mailbox_access", "mwi", "cell_mwi", "name_use", "mailbox_escape", "mailbox_group", "mb_offer_cell", "mb_play_env");
  else if (section == "activesync") settings = new Array("actsync_username", "actsync_address", "actsync_calendar", "actsync_timer", "actsync_cert");
  else if (section == "carddav") settings = new Array("carddav_email", "carddav_authcode", "carddav_logout");
  else if (section == "crm") settings = new Array("crm_username", "crm_address", "crm_type");
  //mailbox_escape rec_hunt rec_acd rec_extension rec_internal rec_external
  return settings;
}

function showgroup(g) { cur_section = g; displayed_acd = ""; loadsettings(); }

function settingobject(table, settings) {
  this.table = table;
  this.settings = settings;
}

function settingpair(name, value) {
  this.name = name;
  this.value = value;
}

function savesettings() {
  // Check the SIP password:
  if (cur_section == "accinfo") {
    // 
    // 

    if (!checkDefaults('pin1', 'pin2') && !checkPassword('pin1', 'pin1', 'pin2', 'pin1_result', false, true)) {
      alert("The passwords do not match, please correct this and try again.");
      document.doc.pin1.focus();
      return false;
    }
  }
  else if (cur_section == "lync") {
    // 
    if (!checkDefaults('lync_password1', 'lync_password2') && !checkPassword('lync_password1', 'lync_password1', 'lync_password2', 'lync_password1_result', false, true)) {
      alert("The passwords do not match, please correct this and try again.");
      document.doc.lync_password1.focus();
      return false;
    }
    // 
  }
  else if (cur_section == "activesync") {
    if (!checkDefaults('actsync_password1', 'actsync_password2') && !checkPassword('actsync_password1', 'actsync_password1', 'actsync_password2', 'actsync_password1_result', false, true)) {
      alert("The passwords do not match, please correct this and try again.");
      document.doc.activesync_password1.focus();
      return false;
    }
  }
  else if (cur_section == "crm") {
    if (!checkDefaults('crm_password1', 'crm_password2') && !checkPassword('crm_password1', 'crm_password1', 'crm_password2', 'crm_password1_result', false, true)) {
      alert("The passwords do not match, please correct this and try again.");
      document.doc.crm_password1.focus();
      return false;
    }
  }

  var settings = get_section_settings(cur_section);

  var set = new Array();
  for (var i = 0; i < settings.length; i++) {
    var setting = settings[i];
    //var id = document.getElementsByName(settings[i])[0];
    var elem = document.getElementById(settings[i]);
    if (elem != undefined) {
      if (elem.type == "radio") {
        if (elem.checked == true) { set[i] = new settingpair(setting, "true"); }
        else { set[i] = new settingpair(setting, "false"); }
      }
      else {
        set[i] = new settingpair(setting, elem.value);
      }
    }
    else {
      alert(setting + " id = " + elem);
      set[i] = new settingpair(setting, "");
    }
  }

  var j = 0;
  if (cur_section == "accinfo") {
    // 
    // 
    if (!checkDefaults('pin1', 'pin2')) set[settings.length + j++] = new settingpair("mb_pin", document.getElementById("pin1").value);
  }
  else if (cur_section == "lync") {
    // 
    if (!checkDefaults('lync_password1', 'lync_password2')) set[settings.length + j++] = new settingpair("lync_password", document.getElementById("lync_password1").value);
    // 
  }
  else if (cur_section == "activesync") {
    if (!checkDefaults('actsync_password1', 'actsync_password2')) set[settings.length + j++] = new settingpair("actsync_password", document.getElementById("actsync_password1").value);
  }
  else if (cur_section == "crm") {
    if (!checkDefaults('crm_password1', 'crm_password2')) set[settings.length + j++] = new settingpair("crm_password", document.getElementById("crm_password1").value);
  }

  var savedata = new settingobject("users", set);
  //alert(JSON.stringify(savedata));
  putRest("/rest/domain/self/account/self/user_settings", savedata);
  loadsettings();
  return true;
}

function loadsettings() {
  var translationElem = document.getElementById("translation_items");
  if(translationElem) translationElem.style.display = "none";
  var data = getRest("/rest/domain/self/account/self/user_settings");
  cur_settings = data.settings;

  // Does the user need to change password:
  if(data.settings.change_password) {
    cur_section = "accinfo";
  }
  
  var htmlpage;
  if (cur_section == "accinfo") {
    htmlpage = {
      section: { name: "section", value: "", type: "header1", display: "#usr_core_settings.htm af" },
      first_name: { name: "first_name", value: "", type: "input", display: "#usr_core_settings.htm first" },
      display_name: { name: "display_name", value: "", type: "input", display: "#usr_core_settings.htm last" },
      position: { name: "position", value: "", type: "input", display: "#usr_core_settings.htm position" },
      // 
      // 
      pin1: { name: "pin1", value: "", type: "password_pin1", display: "#usr_core_settings.htm pin", onkeyup: "if(!checkDefaults('pin1', 'pin2')) checkPassword('pin1', 'pin1', 'pin2', 'pin1_result', true, true);" },
      pin2: { name: "pin2", value: "", type: "password_pin2", display: "#usr_core_settings.htm pin2", onkeyup: "if(!checkDefaults('pin1', 'pin2')) checkPassword('pin1', 'pin1', 'pin2', 'pin1_result', true, true);" }
    };
  }
  else if (cur_section == "timezone") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_header.htm tz" },
          tz: { name: "tz", value: "", type: "select", display: "#usr_core_settings.htm timezone", combolist: "list_timezones,extensions:tz,def" }
      };
  }
  else if (cur_section == "lang") {
      if(session.edit) {
          document.getElementById("translation_items").style.display = "";
      }
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_header.htm lang" },
          lang_audio: { name: "lang_audio", value: "", type: "select", display: "#usr_core_settings.htm lang_audio", combolist: "list_languages,lang_audio,languages_audio,def_audio,usr_core_settings.htm" },
          lang_web: { name: "lang_web", value: "", type: "select", display: "#usr_core_settings.htm lang_web", combolist: "list_languages,lang_web,languages_web,def_web,usr_core_settings.htm" }
      };
  }
  else if (cur_section == "pic") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_core_settings.htm pic" },
          picture: { name: "picture", type: "picture", display: "" }
      };
  }
  else if (cur_section == "ringtone") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_core_settings.htm rt" },
          melody: { name: "melody", value: "", type: "select", display: "#dom_hunt.htm 12", combolist: "list_melodies,extensions:melody,default" }
      };
  }
  else if (cur_section == "monitor") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_core_settings.htm monitoring" },
          presence: { name: "presence", value: "", type: "input", display: "#usr_core_settings.htm presence" },
          dialog_subscribe: { name: "dialog_subscribe", value: "", type: "input", display: "#usr_core_settings.htm permission" },
          pickups: { name: "pickups", value: "", type: "input", display: "#usr_core_settings.htm pickups" },
          section2: { name: "section2", value: "", type: "header2", display: "#usr_core_settings.htm p_and_p" },
          orbits: { name: "orbits", value: "", type: "input", display: "#usr_core_settings.htm orbits" },
          section3: { name: "section3", value: "", type: "header2", display: "#usr_core_feature_codes.htm 25" },
          block_cid: { name: "block_cid", value: "", type: "radio", display: "#usr_core_settings.htm block_cid", first: "# yes", second: "# no", def: "second" },
          cw: { name: "cw", value: "", type: "radio", display: "#dom_ext3.htm callwaiting", first: "# on", second: "# off", def: "first" },
          wakeup: { name: "wakeup", value: "", type: "input", display: "#usr_core_settings.htm wakeup" }
      };
  }
  else if (cur_section == "lync") {
      htmlpage = {
          // 
          section: { name: "section", value: "", type: "header1", display: "#usr_core_settings.htm ms_lync" },
          lync_username: { name: "lync_username", value: "", type: "input", display: "#usr_core_settings.htm l_username" },
          lync_authname: { name: "lync_authname", value: "", type: "input", display: "#usr_core_settings.htm l_authname" },
          lync_password1: { name: "lync_password1", value: "", type: "password_p1", display: "#usr_core_settings.htm l_pass" },
          lync_password2: { name: "lync_password2", value: "", type: "password_p2", display: "#usr_core_settings.htm l_pass_repeat" }
          // 
      };
  }
  else if (cur_section == "adrbook") {
      htmlpage = {
          // 
      };
  }
  else if (cur_section == "moh") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_header.htm moh" },
          moh: { name: "moh", value: "", type: "select", display: "#dom_acd.htm moh_source", combolist: "list_moh,extensions:moh:user,moh,moh_def,dom_acd.htm" }
      };
  }
  else if (cur_section == "mobile") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_core_redirection.htm cell" },
          cell_dis: { name: "cell_dis", value: "", type: "input", display: "#usr_core_redirection.htm cell" },
          cell_conn: { name: "cell_conn", value: "", type: "select2", display: "#usr_core_redirection.htm cell_conn", combolist: { list: [
                     { name: "# no", value: "" },
                     { name: "# yes", value: "1" }
          ]}},
          no_vpa: { name: "no_vpa", value: "", type: "select2", display: "#usr_core_redirection.htm no_vpa", combolist: { list: [
                     { name: "#usr_core_redirection.htm vpa", value: "false" },
                     { name: "#usr_core_redirection.htm no_vpa", value: "true" }
          ]}},
          cell_time: { name: "cell_time", value: "", type: "select2", display: "#usr_core_redirection.htm cell_time", combolist: { list: [
                     { name: "#usr_core_redirection.htm cell_time_0", value: "" },
                     { name: "#usr_core_redirection.htm cell_time_1", value: "0" },
                     { name: "#usr_core_redirection.htm cell_time_1a", value: "1" },
                     { name: "#usr_core_redirection.htm cell_time_1b", value: "2" },
                     { name: "#usr_core_redirection.htm cell_time_2", value: "5" },
                     { name: "#usr_core_redirection.htm cell_time_3", value: "10" },
                     { name: "#usr_core_redirection.htm cell_time_4", value: "15" },
                     { name: "#usr_core_redirection.htm cell_time_5", value: "20" },
                     { name: "#usr_core_redirection.htm cell_time_6", value: "25" },
                     { name: "#usr_core_redirection.htm cell_time_7", value: "30" }
          ]}},
          cell_hunt: { name: "cell_hunt", value: "", type: "select2", display: "#usr_core_redirection.htm cell_hunt", combolist: { list: [
                     { name: "#usr_core_redirection.htm cell_hunt_1", value: "false" },
                     { name: "#usr_core_redirection.htm cell_hunt_2", value: "true" },
                     { name: "#usr_core_redirection.htm unreg", value: "unreg" }
          ]}},
          cell_acd: { name: "cell_acd", value: "", type: "select2", display: "#usr_core_redirection.htm cell_acd", combolist: { list: [
                    { name: "#usr_core_redirection.htm cell_acd_1", value: "false" },
                    { name: "#usr_core_redirection.htm cell_acd_2", value: "true" },
                    { name: "#usr_core_redirection.htm unreg", value: "unreg" }
          ]}},
          cell_c2d: { name: "cell_c2d", value: "", type: "select2", display: "#usr_core_redirection.htm cell_c2d", combolist: { list: [
                    { name: "#usr_core_redirection.htm cell_c2d_1", value: "false" },
                    { name: "#usr_core_redirection.htm cell_c2d_2", value: "true" },
                    { name: "#usr_core_redirection.htm unreg", value: "unreg" }
          ]}},
          cell_night: { name: "cell_night", value: "", type: "select", display: "#usr_core_redirection.htm flag", combolist: "list_flags,cell_night,cell_night_always,cell_night_specify,update_fields,usr_core_redirection.htm" },
          hours_mon: { name: "hours_mon", value: "", type: "input", display: "#usr_core_redirection.htm day_mon" },
          hours_tue: { name: "hours_tue", value: "", type: "input", display: "#usr_core_redirection.htm day_tue" },
          hours_wed: { name: "hours_wed", value: "", type: "input", display: "#usr_core_redirection.htm day_wed" },
          hours_thu: { name: "hours_thu", value: "", type: "input", display: "#usr_core_redirection.htm day_thu" },
          hours_fri: { name: "hours_fri", value: "", type: "input", display: "#usr_core_redirection.htm day_fri" },
          hours_sat: { name: "hours_sat", value: "", type: "input", display: "#usr_core_redirection.htm day_sat" },
          hours_sun: { name: "hours_sun", value: "", type: "input", display: "#usr_core_redirection.htm day_sun" },
          hours_holiday: { name: "hours_holiday", value: "", type: "input", display: "#usr_core_redirection.htm holiday" },
          cell_always: { name: "cell_always", value: "", type: "input", display: "#usr_core_redirection.htm cell_always" },
          cell_never: { name: "cell_never", value: "", type: "input", display: "#usr_core_redirection.htm cell_never" }
      };
  }
  else if (cur_section == "dnd") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_core_settings.htm dnd" },
          dnd: { name: "dnd", value: "", type: "radio", display: "#usr_core_settings.htm dnd", first: "# yes", second: "# no", def: "second" }
      };
  }
  else if (cur_section == "anonymous") {
      htmlpage = {
          // 
      };
  }
  else if (cur_section == "hotdesk") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_header.htm hot" },
          cfr: { name: "cfr", value: "", type: "input", display: "#usr_core_redirection.htm cfr" }
      };
  }
  else if (cur_section == "forwarding") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_header.htm for" },
          cfa: { name: "cfa", value: "", type: "input", display: "#usr_core_redirection.htm cfa" },
          cfb: { name: "cfb", value: "", type: "input", display: "#usr_core_redirection.htm cfb" },
          cfn: { name: "cfn", value: "", type: "input", display: "#usr_core_redirection.htm cfn" },
          // 
          cfd: { name: "cfd", value: "", type: "input", display: "#usr_core_redirection.htm cfd" }
      };
  }
  else if (cur_section == "email") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_header.htm email" },
          email_address: { name: "email_address", value: "", type: "input", display: "#usr_core_email.htm address" },
          // 
          // 
          email_missed: { name: "email_missed", value: "", type: "radio", display: "#usr_core_email.htm email_missed", first: "# yes", second: "# no", def: "first" },
          email_all: { name: "email_all", value: "", type: "radio", display: "#usr_core_email.htm email_all", first: "# yes", second: "# no", def: "second" },
          email_status: { name: "email_status", value: "", type: "radio", display: "#usr_core_email.htm email_status", first: "# yes", second: "# no", def: "first" }, // todo: Must be a select
          email_mb_full: { name: "email_mb_full", value: "", type: "radio", display: "#usr_core_email.htm email_mb_full", first: "# yes", second: "# no", def: "first" },
          email_black_call: { name: "email_black_call", value: "", type: "radio", display: "#usr_core_email.htm email_black_call", first: "# yes", second: "# no", def: "first" },
          wakeup_fail_email: { name: "wakeup_fail_email", value: "", type: "input", display: "#usr_core_email.htm wakeup_fail_email" }
      };
  }
  else if (cur_section == "mailbox") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_header.htm vms" },
          // 
          // 
          // 
          name_use: { name: "name_use", value: "", type: "select2", display: "#usr_core_mailbox.htm 19", combolist: { list: [
                             { name: "#usr_core_mailbox.htm 20", value: "false" },
                             { name: "#usr_core_mailbox.htm 21", value: "true" }
          ]
          }
          },
          mailbox_access: { name: "mailbox_access", value: "", type: "input", display: "#usr_core_mailbox.htm 23" },
          mwi: { name: "mwi", value: "", type: "radio", display: "#usr_core_mailbox.htm mwi", first: "# yes", second: "# no", def: "first" },
          cell_mwi: { name: "cell_mwi", value: "", type: "select2", display: "#usr_core_mailbox.htm cell_mwi", combolist: { list: [
                             { name: "# no", value: "false" },
                             { name: "# yes", value: "true" },
                             { name: "#dom_settings.htm pr_20", value: "20" },
                             { name: "#dom_settings.htm pr_40", value: "40" },
                             { name: "#dom_settings.htm pr_60", value: "60" },
                             { name: "#dom_settings.htm pr_120", value: "120" },
                             { name: "#dom_settings.htm pr_180", value: "180" },
                             { name: "#dom_settings.htm pr_240", value: "240" },
                             { name: "#dom_settings.htm pr_300", value: "300" },
                             { name: "#dom_settings.htm pr_600", value: "600" },
                             { name: "#dom_settings.htm pr_1200", value: "1200" }]}
          },
        // 
          mailbox_group: { name: "mailbox_group", value: "", type: "input", display: "#usr_core_mailbox.htm groupext" },
          mb_play_env: { name: "mb_play_env", value: "", type: "select2", display: "#dom_settings.htm play_env", combolist: { list: [
                             { name: "# default", value: "" },
                             { name: "# yes", value: "true" },
                             { name: "# no", value: "false" }
          ]
          }
          },
          mb_offer_cell: { name: "mb_offer_cell", value: "", type: "radio", display: "#dom_settings.htm mb_offer_cell", first: "# yes", second: "# no", def: "first" },
          mailbox: { name: "mailbox", type: "mailbox", display: "" }
      };
  }
  else if (cur_section == "personal_contacts") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_adrbook.htm pab" },
          first: { name: "first", value: "", type: "input2", display: "#usr_adrbook.htm first" },
          last: { name: "last", value: "", type: "input2", display: "#usr_adrbook.htm last" },
          number: { name: "number", value: "", type: "input2", display: "#usr_adrbook.htm number" },
          mobile: { name: "mobile", value: "", type: "input2", display: "#usr_adrbook_edit.htm mobile" },
          speed: { name: "speed", value: "", type: "input2", display: "#usr_adrbook.htm speed" },
          cmc: { name: "cmc", value: "", type: "input2", display: "#usr_adrbook.htm cmc" },
          type: { name: "type", value: "", type: "select2", display: "#usr_adrbook.htm type", combolist: { list: [
                                 { name: "#usr_adrbook.htm type_none", value: "" },
                                 { name: "#usr_adrbook.htm type_white", value: "white" },
                                 { name: "#usr_adrbook.htm type_black", value: "black" }
          ]}},
          noref: { name: "noref", type: "noref", display: "", savename: "addadrbook", savedisp: "$button#create" }
      };
  }
  else if (cur_section == "callhist") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#callhistory" },
          callhist: { name: "callhist", type: "calltable", display: "" }
      };
  }
  else if (cur_section == "missed") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#missedcalls" },
          missed: { name: "missed", type: "calltable", display: "" }
      };
  }
  else if (cur_section == "home") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "", display2: document.getElementById("hometitle").innerHTML + '<img style="cursor:pointer;" onclick="show_pic()" src="img/arrow_down.png" alt="down"/>' },
          home: { name: "home", type: "home", display: "" },
          location: { name: "location", type: "select", display: "", combolist: "list_locations_set,dom_def,usr_core_settings.htm" }
      };
  }
  else if (cur_section == "buttons") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_buttons.htm welcome" },
          section2: { name: "section2", value: "", type: "text", display: "#usr_buttons.htm explain" },
          buttons: { name: "buttons", type: "buttons", display: "" }
      };
  }
  else if (cur_section == "starcodes") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_feature_codes.htm star_list" },
          starcodes: { name: "starcodes", type: "starcodes", display: "" }
      };
  }
  else if (cur_section == "status") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_status.htm welcome" },
          status: { name: "status", type: "status", display: "" }
      };
  }
  else if (cur_section == "usr_adrbook") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_adrbook.htm pab" },
          section2: { name: "section2", value: "", type: "text", display: "#usr_adrbook.htm expl" },
          usr_adrbook: { name: "usr_adrbook", type: "usr_adrbook", display: "" }
      };
  }
  else if (cur_section == "usr_adrbook2") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#usr_adrbook2.htm pab" },
          section2: { name: "section2", value: "", type: "text", display: "#usr_adrbook2.htm expl" },
          usr_adrbook2: { name: "usr_adrbook2", type: "usr_adrbook2", display: "" }
      };
  }
  else if (cur_section == "activesync") {
    htmlpage = {
      section: { name: "section", value: "", type: "header1", display: "#usr_activesync.htm title" },
      section2: { name: "section2", value: "", type: "text", display: "#usr_activesync.htm exp1" },
      section3: { name: "section3", value: "", type: "text", display: "#usr_activesync.htm exp2" },
      section4: { name: "section4", value: "", type: "text", display: "#usr_activesync.htm exp3" },
      actsync_username: { name: "actsync_username", value: "", type: "input", display: "#usr_activesync.htm user" },
      actsync_password1: { name: "actsync_password1", value: "", type: "password_p1", display: "#usr_activesync.htm pass1", onkeyup: "if(!checkDefaults('actsync_password1', 'actsync_password2')) checkPassword('actsync_password1', 'actsync_password1', 'actsync_password2', 'actsync_password1_result', true, true);" },
      actsync_password2: { name: "actsync_password2", value: "", type: "password_p2", display: "#usr_activesync.htm pass2", onkeyup: "if(!checkDefaults('actsync_password1', 'actsync_password2')) checkPassword('actsync_password1', 'actsync_password1', 'actsync_password2', 'actsync_password1_result', true, true);" },
      actsync_address: { name: "actsync_address", value: "", type: "input", display: "#usr_activesync.htm addr" },
      actsync_cert: { name: "actsync_cert", value: "", type: "radio", display: "#usr_activesync.htm cert", first: "# yes", second: "# no", def: "first"  },
      actsync_calendar: { name: "actsync_calendar", value: "", type: "radio", display: "#usr_activesync.htm cal", first: "# yes", second: "# no", def: "second" },
      actsync_room: { name: "actsync_room", value: "", type: "select", display: "#usr_activesync.htm room", combolist: "list_confrooms,id,actsync_room,no_room,usr_conf.htm" },
      actsync_timer: { name: "actsync_timer", value: "", type: "select2", display: "#usr_activesync.htm timer", combolist: { list: [
                         { name: "# off", value: "0" },
                         { name: "15", value: "15" },
                         { name: "30", value: "30" },
                         { name: "45", value: "45" },
                         { name: "60", value: "60" }
                         ]}},
      activesync: { name: "activesync", type: "activesync", display: "" }
    };
  }
  else if (cur_section == "carddav") {
      htmlpage = {
          section: { name: "section", value: "", type: "header1", display: "#carddav_title"},
          section2: { name: "section2", value: "", type: "text", display: "#carddav_info" },
          carddav: { name: "carddav", type: "carddav", display: "" }
      };
  }
  else if (cur_section == "crm") {
    htmlpage = {
      section: { name: "section", value: "", type: "header1", display: "#usr_crm.htm title" },
      section2: { name: "section2", value: "", type: "text", display: "#usr_crm.htm exp1" },
      crm_username: { name: "crm_username", value: "", type: "input", display: "#usr_crm.htm user" },
      crm_password1: { name: "crm_password1", value: "", type: "password_p1", display: "#usr_crm.htm pass1", onkeyup: "if(!checkDefaults('crm_password1', 'crm_password2')) checkPassword('crm_password1', 'crm_password1', 'crm_password2', 'crm_password1_result', true, true);" },
      crm_password2: { name: "crm_password2", value: "", type: "password_p2", display: "#usr_crm.htm pass2", onkeyup: "if(!checkDefaults('crm_password1', 'crm_password2')) checkPassword('crm_password1', 'crm_password1', 'crm_password2', 'crm_password1_result', true, true);" },
      crm_address: { name: "crm_address", value: "", type: "input", display: "#usr_crm.htm addr" },
      crm_type: { name: "crm_type", value: "", type: "select2", display: "CRM: ", combolist: { list: [
                         { name: "SalesForce", value: "sf" },
                         { name: "SugarCRM", value: "sugar" }
      ]}}
    };
  }
  else if (cur_section == "recording") {
    htmlpage = {
      section: { name: "section", value: "", type: "header1", display: "#usr_recording.htm title"},
      section2: { name: "section2", value: "", type: "text", display: "#usr_recording.htm info" },
      recording: { name: "recording", type: "recording", display: "" }
    };
  }
  else if (cur_section == "locations") {
    htmlpage = {
      section: { name: "section", value: "", type: "header1", display: "#usr_core_location.htm 10" },
      name: { name: "name", value: "", type: "input2", display: "#usr_core_location.htm name" },
      ttype: { name: "ttype", value: "", type: "select2", display: "#usr_core_location.htm type", combolist: { list: [
                             { name: "#usr_core_location.htm type_none", value: "" },
                             { name: "#usr_core_location.htm macadr", value: "mac_adr" },
                             { name: "#usr_core_location.htm username", value: "user" },
                             { name: "UUID", value: "uuid" }
                             ]
      }
      },
      tvalue: { name: "tvalue", value: "", type: "input2", display: "#usr_core_location.htm value" },
      e911_num: { name: "e911_num", value: "", type: "input2", display: "#usr_core_location.htm e911number" },
      e911_ani: { name: "e911_ani", value: "", type: "input2", display: "#usr_core_location.htm e911ani" },
      street: { name: "street", value: "", type: "input2", display: "#usr_core_location.htm e911street" },
      city: { name: "city", value: "", type: "input2", display: "#usr_core_location.htm e911city" },
      state: { name: "state", value: "", type: "input2", display: "#usr_core_location.htm e911state" },
      zip: { name: "zip", value: "", type: "input2", display: "#usr_core_location.htm e911zip" },
      country: { name: "country", value: "", type: "select2", display: "#usr_core_location.htm e911country", combolist: { list: [
                             { name: "# usa", value: "usa" },
                             { name: "# canada", value: "canada" }
                             ]
      }
      },
      locations: { name: "locations", type: "locations", display: "" }
    };
  }
  else if (cur_section == "actsync_contacts") {
    htmlpage = {
      section: { name: "section", value: "", type: "header1", display: "#actsynccontacts" },
      searchcon: { name: "searchcon", value: "", type: "input2", display: "#dom_adrbook.htm search" },
      maxcon: { name: "maxcon", value: "", type: "select2", display: "#dom_adrbook.htm maxlen", combolist: { list: [
                             { name: "10", value: "10" },
                             { name: "20", value: "20" },
                             { name: "50", value: "50" },
                             { name: "100", value: "100" },
                             { name: "250", value: "250" },
                             { name: "dom_settings.htm#all", value: "1000" }
                             ]
      }
      },
      actsync_contacts: { name: "actsync_contacts", type: "actsync_contacts", display: "" }
    };
  }
  else if (cur_section == "conf") {
    htmlpage = {
      section: { name: "section", value: "", type: "header1", display: "", display2: document.getElementById("conftitle").innerHTML },
      conf: { name: "conf", value: "", type: "conf", display: '' }
    };
  }
  else if (cur_section == "voicemail") {
    htmlpage = {
      section: { name: "section", value: "", type: "header1", display: "#usr_lists.htm welcome" },
      voicemail: { name: "voicemail", value: "", type: "voicemail", display: '' }
    };
  }
  else if (cur_section == "im") {
    htmlpage = {
      section: { name: "section", value: "", type: "header1", display: "#usr_im.htm intro" },
      im: { name: "im", value: "", type: "im", display: '' }
    };
  }

  build_html(htmlpage, cur_settings);
  translatePage();

  // Alert the user that the password needs to be changed:
  if (data.settings.change_password) {
    alert(lang("usr_index.htm", "ask_change_password"));
    document.getElementById("passw1").focus();
  }
}

function set_head(text, direct) {
  var tbl_head = document.getElementById("head");
  tbl_head.innerHTML = "";
  var tr = document.createElement("tr");
  var td = document.createElement("td");
  td.className = "headerText";
  if(direct) td.innerHTML = text;
  else setInnerText(td, text);
  tr.appendChild(td);
  tbl_head.appendChild(tr);
}

function hide_all_sections() {
  // Clear all sections:
  var cleared = [ "settings_output", "tbl_cdr", "paginator", "locations_output", "action_buttons", "contacts_output"];
  for(var i = 0; i < cleared.length; i++) {
    var e = document.getElementById(cleared[i]);
    e.innerHTML = "";
    e.style = "";
  }

  // Hide the rest:
  var sections = [ "home", "picture", "usr_buttons", "starcodes", "status", "usr_adrbook", "usr_adrbook2", "activesync", "recording", "conf", "voicemail", "im", "mailbox", "acd1", "settings_output" ];
  for(var s = 0; s < sections.length; s++) {
    var sec = document.getElementById(sections[s]);
    if(sec != null) sec.style.display = "none";
    else alert("Section " + sections[s] + " is missing.");
  }
}

function build_html(htmlpage, recvd_settings) {
  var classheader1 = "headerText";
  var classheader2 = "header2Text";
  var classtext = "cText";
  var classinput = "cText250";
  var classradio = "cText";
  var savebutton = document.getElementById("savebutton_id");
  savebutton.style.display = "";
  hide_all_sections();
  var tbl_head = document.getElementById("head");
  var tab = document.getElementById("settings_output");
  var tbl_cdr = document.getElementById("tbl_cdr");
  var tbl_loc = document.getElementById("locations_output");
  var tbl_act = document.getElementById("action_buttons");
  var tbl_con = document.getElementById("contacts_output");
  var tbl_home = document.getElementById("home");
  var tbl_picture = document.getElementById("picture");
  var tbl_buttons = document.getElementById("usr_buttons");
  var tbl_codes = document.getElementById("starcodes");
  var tbl_status = document.getElementById("status");
  var tbl_usradrbook = document.getElementById("usr_adrbook");
  var tbl_usradrbook2 = document.getElementById("usr_adrbook2");
  var tbl_activesync = document.getElementById("activesync");
  var tbl_recording = document.getElementById("recording");
  var tbl_conf = document.getElementById("conf");
  var tbl_vm = document.getElementById("voicemail");
  var tbl_im = document.getElementById("im");
  var tbl_mailbox = document.getElementById("mailbox");

  for (var key in htmlpage) {
    if (htmlpage.hasOwnProperty(key)) {
      var setting = htmlpage[key];

      // Handle the header seperately
      /*if(key == "section") {
        if(setting.display in dict) {
          set_head(dict[setting.display], false);
        }
        else {
          // Well, hack hack: Set the HTML directly. Cross fingers nobody is using HTML chars in the text
          set_head(setting.display2, true);
        }
        continue;
      }*/

      tab.style.display = "";
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      if (setting.display != "")
        //td.innerHTML = dict[setting.display];
        td.innerHTML = setting.display;
      if (setting.hasOwnProperty("display2")) 
        td.innerHTML += setting.display2;
      if (setting.type == "header1") {
        tbl_head.innerHTML = "";
        td.setAttribute("class", classheader1);
        td.setAttribute("height", "40");
        tr.appendChild(td);
        tbl_head.appendChild(tr);
        continue;
      }
      else if (setting.type == "header2") {
        td.setAttribute("class", classheader2);
      }
      else if(setting.type == "text") {
        td.setAttribute("class", classtext);
        tr.appendChild(td);
        tbl_head.appendChild(tr);
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        tr.appendChild(td);
        tab.appendChild(tr);
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        tr.appendChild(td);
        tab.appendChild(tr);
        continue;
      }
      else {
        td.setAttribute("class", classtext);
      }
      tr.appendChild(td);
      var td = document.createElement("td");
      var input = document.createElement("input");
      input.setAttribute("class", classinput);
      if (setting.type == "input") {
        if (recvd_settings.hasOwnProperty(setting.name)) {
          input.setAttribute("id", recvd_settings[setting.name].name);
          input.setAttribute("name", recvd_settings[setting.name].name);
          input.setAttribute("value", recvd_settings[setting.name].value);
        }
        td.appendChild(input);
        tr.appendChild(td);
      }
      else if (setting.type == "input2") {
        input.setAttribute("id", setting.name);
        input.setAttribute("name", setting.name);
        td.appendChild(input);
        tr.appendChild(td);
      }
      else if (setting.type.split("_")[0] == "password") {
        input.setAttribute("type", "password");
        input.setAttribute("id", setting.name);
        if (setting.type.split("_")[1] == "p1") {
          input.setAttribute("onkeyup", setting.onkeyup);
          input.setAttribute("value", "+-+-+-+-+-");
        }
        else if (setting.type.split("_")[1] == "p2") {
          input.setAttribute("onkeyup", setting.onkeyup);
          input.setAttribute("value", "-+-+-+-+-+");
        }
        else if (setting.type.split("_")[1] == "pin1") {
          input.setAttribute("onkeyup", setting.onkeyup);
          input.setAttribute("value", "+-+-+-");
        }
        else if (setting.type.split("_")[1] == "pin2") {
          input.setAttribute("onkeyup", setting.onkeyup);
          input.setAttribute("value", "-+-+-+");
        }
        td.appendChild(input);
        tr.appendChild(td);
        td = document.createElement("td");
        td.setAttribute("id", setting.name + "_result");
        tr.appendChild(td);
      }
      else if (setting.type == "select") {
        var combolist = getRest("/rest/domain/self/account/self/list/" + setting.combolist);
        var select = document.createElement("select");
        select.setAttribute("id", setting.name);
        select.setAttribute("name", setting.name);
        if (combolist.hasOwnProperty("list")) {
          var l = combolist.list;
          for (var i = 0; i < l.length; i++) {
            var option = document.createElement("option");
            option.innerHTML = l[i].name;
            option.setAttribute("value", l[i].value);
            if (l[i].selected == "true")
              option.setAttribute("selected", "selected");
            select.appendChild(option);
          }
        }
        td.appendChild(select);
        if (setting.name == "location") {
          var t = document.getElementById("locationid");
          while (t.firstChild) t.removeChild(t.firstChild);
          t.appendChild(select);
          return;
        }
        tr.appendChild(td);
      }
      else if (setting.type == "select2") {
        var combolist = setting.combolist;
        var select = document.createElement("select");
        select.setAttribute("id", setting.name);
        select.setAttribute("name", setting.name);
        if (combolist.hasOwnProperty("list")) {
          var l = combolist.list;
          for (var i = 0; i < l.length; i++) {
            var option = document.createElement("option");
            if(l[i].name.indexOf("#") > -1 )
              //option.innerHTML = dict[l[i].name];
              option.innerHTML = l[i].name;
            else
              option.innerHTML = l[i].name;
            option.setAttribute("value", l[i].value);
            if (recvd_settings.hasOwnProperty(setting.name)) {
              if (recvd_settings[setting.name].value == l[i].value)
                option.setAttribute("selected", "selected");
            }
            select.appendChild(option);
          }
        }
        td.appendChild(select);
        tr.appendChild(td);
      }
      else if (setting.type == "select3") {
        var options;
        var loc = getRest("/rest/system/localization");
        if(setting.name == "tz") options = loc.zones;
        var select = document.createElement("select");
        select.setAttribute("id", setting.name);
        select.setAttribute("name", setting.name);
        var option = document.createElement("option");
        option.innerHTML = "";
        option.setAttribute("value", "");
        select.appendChild(option);
        for (var i=0; i < options.length; i++) {
          var option = document.createElement("option");
          option.innerHTML = options[i];
          option.setAttribute("value", options[i]);
          if (recvd_settings.hasOwnProperty(setting.name)) {
            if (recvd_settings[setting.name].value == options[i])
              option.setAttribute("selected", "selected");
          }
          select.appendChild(option);
        }
        td.appendChild(select);
        tr.appendChild(td);
      }
      else if (setting.type == "radio") {
        td.setAttribute("class", classradio);
        var radio1 = document.createElement("input");
        radio1.setAttribute("type", "radio");
        if (recvd_settings.hasOwnProperty(setting.name)) {
          radio1.setAttribute("id", recvd_settings[setting.name].name);
          radio1.setAttribute("name", recvd_settings[setting.name].name);
          radio1.setAttribute("value", recvd_settings[setting.name].value);
        }
        if (radio1.value == "true") radio1.setAttribute("checked", "true");
        td.appendChild(radio1);
        //td.appendChild(document.createTextNode(dict[setting.first]));
        var label = document.createElement("label");
        label.innerHTML = setting.first;
        td.appendChild(label);
        var radio2 = document.createElement("input");
        radio2.setAttribute("type", "radio");
        if (recvd_settings.hasOwnProperty(setting.name)) {
          radio2.setAttribute("name", recvd_settings[setting.name].name);
        }
        if (radio1.value == "false") radio2.setAttribute("checked", "true");
        td.appendChild(radio2);
        //td.appendChild(document.createTextNode(dict[setting.second]));
        var label = document.createElement("label");
        label.innerHTML = setting.second;
        td.appendChild(label);
        tr.appendChild(td);

        if(!radio1.checked && !radio2.checked) {
          if(setting.def == "second") radio2.checked = true;
          else radio1.checked = true;
        }
      }
      else if (setting.type == "noref") {
        var no_refresh = document.createElement("input");
        no_refresh.setAttribute("id", "do_not_refresh_page");
        no_refresh.setAttribute("name", "do_not_refresh_page");
        no_refresh.setAttribute("value", "true");
        no_refresh.style.display = "none";
        td.appendChild(no_refresh);
        tr.appendChild(td);
        tab.appendChild(tr);
        savebutton.style.display = "none";
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        var b = document.createElement("input");
        b.setAttribute("type", "submit");
        b.setAttribute("name", setting.savename);
        b.setAttribute("value", setting.savedisp);
        td.appendChild(b);
        td.setAttribute("class", classtext);
        tr.appendChild(td);
      }
      else if (setting.type == "calltable") {
        if (setting.name == "callhist") {
          var count = json_ajax({ "action": "count-cdr-summary", "start": 0, "length": 1000, "domain": true, "user": true });
          add_paginator("paginator", count, 50, "display_cdr", true, true);
          display_cdr(0, 50, true, true);
        }
        else {
          var count = json_ajax({ "action": "count-cdr-summary", "start": 0, "length": 1000, "domain": true, "user": true, "missed": true });
          add_paginator("paginator", count, 50, "display_cdr", true, true, true);
          display_cdr(0, 50, true, true, true);
        }
        savebutton.style.display = "none";
      }
      else if (setting.type == "home") {
        tbl_home.style.display = "";
        tbl_home.setAttribute("class", classtext);
        savebutton.style.display = "none";
      }
      else if (setting.type == "picture") {
        tbl_picture.style.display = "";
        tbl_picture.setAttribute("class", classtext);
        savebutton.style.display = "none";
      }
      else if (setting.type == "buttons") {
        tbl_buttons.style.display = "";
        tbl_buttons.setAttribute("class", classtext);
        savebutton.style.display = "none";
        translatePage();
        createbuttons();
      }
      else if (setting.type == "starcodes") {
        tbl_codes.style.display = "";
        tbl_codes.setAttribute("class", classtext);
        savebutton.style.display = "none";
      }
      else if (setting.type == "status") {
        tbl_status.style.display = "";
        tbl_status.setAttribute("class", classtext);
        savebutton.style.display = "none";
      }
      else if (setting.type == "usr_adrbook") {
        tbl_usradrbook.style.display = "";
        tbl_usradrbook.setAttribute("class", classtext);
        savebutton.style.display = "none";
      }
      else if (setting.type == "usr_adrbook2") {
        tbl_usradrbook2.style.display = "";
        tbl_usradrbook2.setAttribute("class", classtext);
        savebutton.style.display = "none";
      }
      else if (setting.type == "activesync") {
        tbl_activesync.style.display = "";
        tbl_activesync.setAttribute("class", classtext);
      }
      else if (setting.type == "carddav") {
        savebutton.style.display = "none";
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.setAttribute("class", classtext);
        td.innerHTML = "#carddav_email";
        tr.appendChild(td);
        var td = document.createElement("td");
        var i = document.createElement("input");
        i.setAttribute("class", classinput);
        i.setAttribute("id", recvd_settings["carddav_email"].name);
        i.setAttribute("name", recvd_settings["carddav_email"].name);
        i.setAttribute("value", recvd_settings["carddav_email"].value);
        td.appendChild(i);
        tr.appendChild(td);
        var td = document.createElement("td");
        td.setAttribute("class", classtext);
        var b = document.createElement("button");
        b.setAttribute("onclick", "carddavAuth()");
        b.innerHTML = "<label>#get_auth_code</label>";
        td.appendChild(b);
        tr.appendChild(td);
        tab.appendChild(tr);
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.setAttribute("class", classtext);
        td.innerHTML = "#auth_code";
        tr.appendChild(td);
        var td = document.createElement("td");
        var i = document.createElement("input");
        i.setAttribute("class", classinput);
        i.setAttribute("id", "carddav_authcode");
        td.appendChild(i);
        tr.appendChild(td);
        var td = document.createElement("td");
        td.setAttribute("class", classtext);
        var b = document.createElement("button");
        b.setAttribute("onclick", "savesettings()");
        b.innerHTML = "<label>#go</label>";
        td.appendChild(b);
        tr.appendChild(td);
        tab.appendChild(tr);
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.setAttribute("class", classtext);
        var b = document.createElement("button");
        b.setAttribute("name", "carddav_logout");
        b.setAttribute("id", "carddav_logout");
        b.setAttribute("value", "");
        b.setAttribute("onclick", "carddavLogout()");
        b.innerHTML = "<label>#carddav_logout</label>";
        td.appendChild(b);
        tr.appendChild(td);
      }
      else if (setting.type == "recording") {
        tbl_recording.style.display = "";
        tbl_recording.setAttribute("class", classtext);
        savebutton.style.display = "none";
      }
      else if (setting.type == "locations") {
        load_locations();
      }
      else if (setting.type == "actsync_contacts") {
        var b = document.createElement("button");
        b.setAttribute("onclick", "load_contacts()");
        b.innerHTML = "<label>#search</label>";
        td.appendChild(b);
        tr.appendChild(td);
        document.getElementById("settings_output").appendChild(tr);
        load_contacts();
        savebutton.style.display = "none";
      }
      else if (setting.type == "conf") {
        tbl_conf.style.display = "";
        tbl_conf.setAttribute("class", classtext);
        savebutton.style.display = "none";
      }
      else if (setting.type == "voicemail") {
        tbl_vm.style.display = "";
        tbl_vm.setAttribute("class", classtext);
        savebutton.style.display = "none";
      }
      else if (setting.type == "im") {
        tbl_im.style.display = "";
        tbl_im.setAttribute("class", classtext);
        savebutton.style.display = "none";
      }
      else if (setting.type == "mailbox") {
        tbl_mailbox.style.display = "";
        tbl_mailbox.setAttribute("class", classtext);
      }
      tab.appendChild(tr);
    }
  }
}

function save(n, b) {
  if(b == "delete_address") {
    if(!confirm_selection('tt','address','delete_selected')) return false;
  }
  else if(b == "white_list") {
    if(!confirm_selection('tt','address','white_list')) return false;
  }
  else if(b == "black_list") {
    if(!confirm_selection('tt','address','black_list')) return false;
  }
  else if(b == "delete_recording") {
    if(!confirm("Do you want to delete selected recording(s)?")) return false;
  }
  saveform(n, b);
  return true;
}

function saveform(n, b) {
  var data = [];
  var j = 0;
  var inputs = document.forms[n].getElementsByTagName("input");
  var selects = document.forms[n].getElementsByTagName("select");

  for (var i=0; i<inputs.length+selects.length; i++) {
    var element = (i<inputs.length ? inputs[i] : selects[i-inputs.length]);
    var name = element.name;
    var value = element.value;
    if(name.substring(name.length-2, name.length) == "[]") name = name.substring(0, name.length-2);
    if(element.type == "checkbox") {
      if(element.checked == true) {
        data[j] = new settingpair(name, value);
        j++;
      }
    }
    else {
      data[j] = new settingpair(name, value);
      j++;
    }
  }
  if(b != "") {
    data[j] = new settingpair(b, b);
    j++;
  }
  var jdata = {}
  jdata["list"] = data;
  //alert(JSON.stringify(jdata));
  putRest("/rest/domain/self/account/self/list/saveform", jdata);
  show_adrbook();
  return false;
}

function show_adrbook() {
  var tt = document.getElementById("tt");
  var tt2 = document.getElementById("tt2");
  var tt4 = document.getElementById("tt4");

  while (tt.firstChild) {
    tt.removeChild(tt.firstChild);
  }
  tt.innerHTML = "<tr><td style='display:none;'></td></tr>";

  while (tt2.firstChild) {
    tt2.removeChild(tt2.firstChild);
  }
  tt2.innerHTML = "<tr><td style='display:none;'></td></tr>";

  while (tt4.firstChild) {
    tt4.removeChild(tt4.firstChild);
  }

  var l = getRest("/rest/domain/self/account/self/list/list_adrbook,false");
  load_adressbook(l, true, true, "usr_adrbook_edit.htm");
  var l2 = getRest("/rest/domain/self/account/self/list/list_adrbook,true");
  load_adressbook2(l2, false, true, "usr_adrbook_edit.htm");
  display_messages("tt4", getRest("/rest/user/self/messages"), true);
}

function show_wavfiles(wav) {
  for (var file in wav) {
    if (wav[file] != "") {
      var id = "wav_" + file;
      document.getElementById(id).innerHTML = wav[file] +
        "<a href=\"playback.wav?file=" + file + "\" target=\"_blank\"><img src=\"img/speaker.png\"/></a>" +
        "<a href=\"usr_index.htm?deletewav=true&file=" + file + "\" onclick=\"return confirm_delete();\"><img src=\"img/delete.gif\" /></a>";
    }
  }
}

function mysort(a, b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}

var cboxes = new Array();
function load_locations() {
  cboxes = [];
  var d = getRest("/rest/domain/self/account/self/list/list_locations");
  var t = d.list;
  t.sort(mysort);
  var html = "<td><input type='checkbox' id='loc_id' onclick='select_all_locations()' />&nbsp;&nbsp;</td>";
  html += "<td>#usr_locations.htm name</td>";
  html += "<td>#usr_locations.htm token</td>";
  html += "<td>#usr_locations.htm street</td>";
  html += "<td>#usr_locations.htm city</td>";
  html += "<td>#usr_locations.htm state</td>";
  html += "<td>#usr_locations.htm country</td></tr>";

  for (var i = 0; i < t.length; i++) {
    var r = t[i];
    cboxes[i] = r.id;
    html += "<tr><td>" + "<input type='checkbox' id='loc_" + r.id + "' onclick='delete_location(this.id)' />&nbsp;&nbsp;" + "</td>";
    html += "<td>" + present_html(r.name) + "&nbsp;&nbsp;" + "</td>";
    html += "<td>" + present_html(r.token) + "&nbsp;&nbsp;" + "</td>";
    html += "<td>" + present_html(r.street) + "&nbsp;&nbsp;" + "</td>";
    html += "<td>" + present_html(r.city) + "&nbsp;&nbsp;" + "</td>";
    html += "<td>" + present_html(r.state) + "&nbsp;&nbsp;" + "</td>";
    html += "<td>" + present_html(r.country) + "&nbsp;&nbsp;" + "</td>";
    html += "</td></tr>";
  }
  document.getElementById("locations_output").innerHTML = html;
  document.getElementById("action_buttons").innerHTML = "<tr><td class='cText'><input type='button' value='Delete' onclick='delete_list()' /></td></tr>";
}

function select_all_locations() {
  for (var i = 0; i < cboxes.length; i++) {
    var id = "loc_" + cboxes[i];
    document.getElementById(id).checked = document.getElementById("loc_id").checked;
    delete_location(id);
  }
}

var delete_locations = "";
function delete_location(id) {
  if (document.getElementById(id).checked) {
    delete_locations += id + ",";
  }
  else {
    delete_locations = delete_locations.replace(id + ",", "");
  }
}

function delete_list() {
  if (delete_locations.length > 0) {
    delete_locations = delete_locations.substring(0, delete_locations.length - 1);
    var dl = delete_locations.split(",");
    var l = new Array();
    for (var i = 0; i < dl.length; i++) {
      document.getElementById(dl[i]).checked = false;
      var d = new Object();
      d.id = dl[i];
      l[i] = d;
    }
    var data = new Object();
    data.table = "locations";
    data.list = l;
    putRest("/rest/domain/self/account/self/list/delete_locations", data);
    delete_locations = "";
    load_locations();
  }
}

function namesort(a, b) {
  if (a.firstname < b.firstname)
    return -1;
  if (a.firstname > b.firstname)
    return 1;
  return 0;
}

function load_contacts() {
  var max = document.getElementById("maxcon");
  var search = document.getElementById("searchcon");
  var d = getRest("/rest/domain/self/account/self/list/list_actsync" + "," + max.value + "," + search.value);
  var t = d.list;
  t.sort(namesort);
  html = "<td>#dom_adrbook.htm f</td>";
  html += "<td>#dom_adrbook.htm l</td>";
  html += "<td>#dom_adrbook.htm 5</td>";
  html += "<td>#dom_adrbook.htm secondnum</td>";
  html += "<td>#dom_adrbook.htm mobnum</td></tr>";

  for (var i = 0; i < t.length; i++) {
    var r = t[i];
    var n = (r.number == "") ? "" : "<a href=\"remote_call.htm?dest=" + encodeURIComponent(r.number) + "\"><img src=\"img/call.png\"></a>";
    var m = (r.mobile == "") ? "" : "<a href=\"remote_call.htm?dest=" + encodeURIComponent(r.mobile) + "\"><img src=\"img/call.png\"></a>";
    html += "<tr><td>" + present_html(r.firstname) + "&nbsp;&nbsp;" + "</td>";
    html += "<td>" + present_html(r.lastname) + "&nbsp;&nbsp;" + "</td>";
    html += "<td>" + "<span style='cursor:pointer;' onclick=dialNumber('number:" + process_telnum("", r.number) + "')>" + present_html(r.number) + "</span>" + n + "&nbsp;&nbsp;" + "</td>";
    html += "<td>" + "<span style='cursor:pointer;' onclick=dialNumber('number:" + process_telnum("", r.number2) + "')>" + present_html(r.number2) + "</span>" + "&nbsp;&nbsp;" + "</td>";
    html += "<td>" + "<span style='cursor:pointer;' onclick=dialNumber('number:" + process_telnum("", r.mobile) + "')>" + present_html(r.mobile) + "</span>" + m + "&nbsp;&nbsp;" + "</td>";
    html += "<td>" + present_html(r.type) + "&nbsp;&nbsp;" + "</td>";
    html += "</td></tr>";
  }
  document.getElementById("contacts_output").innerHTML = html;
}

function confirm_delete() {
  var msg = "Are sure to delete this scheduled conference?";
  return confirm(msg);
}

function show_details(id) {
  var row = document.getElementById(id);
  if (row.style.display == '') row.style.display = 'none';
  else row.style.display = '';
}

function check_room() {
  var r = document.getElementById('room');
  if (r.options[r.selectedIndex].value == '-') {
    alert("No conference room available");
  }
}

// Keep that as a global object:
var recs;

function show_recordings() {
  recs = new Recordings(session.cdomain, "progress", "tbl_rec", "player2", session.cuser);
  recs.loadDir(function() {
    recs.showTabs("tabs", function(page) {
      recs.loadPage(page);
      return false;
    });
    recs.loadPage(0);
  });
}

// ACD stuff
function show_available_acd() {
  var homewrapper = document.getElementById("homewrapper");
  var acds = getRest("/rest/user/" + encodeURIComponent(session.cuser + "@" + session.cdomain) + "/wallboard");
  var all = [];
  for(var i = 0; i < acds.length; i++) {
    // <div class="ui_submenu" onclick="showgroup('home')">Home</div>
    var div = document.createElement("div");
    div.className = "ui_submenu";
    div.setAttribute("acd", acds[i].name);
    div.onclick = function() { var acd = this.getAttribute("acd"); displayed_acd = acd; showacd(acd); }
    if(acds[i].display == "")
      setInnerText(div, acds[i].name);
    else
      setInnerText(div, acds[i].name + " (" + acds[i].display + ")");
    homewrapper.appendChild(div);
    all.push(acds[i].name);
  }
  all = all.join(",");
  var div = document.createElement("div");
  div.className = "ui_submenu";
  div.onclick = function() { displayed_acd = "-"; showacd(all); }
  setInnerText(div, "#usr_index.htm allacd");
  homewrapper.appendChild(div);
}

function rightAlign(td) {
  td.style.textAlign="right";
}

displayed_acd = "";

function show_acd_calls(acd, all) {
  // Add the current calls for the ACD:
  var table, tr, td;
  table = document.createElement("table");
  table.className="toggtbl";

  // Header:
  tr = document.createElement("tr");
  td = document.createElement("td"); setInnerText(td, lang("email_queue.htm", "start")); tr.appendChild(td);
  td = document.createElement("td"); setInnerText(td, lang("email_queue.htm", "from")); tr.appendChild(td);
  td = document.createElement("td"); setInnerText(td, lang("email_queue.htm", "agent")); tr.appendChild(td);
  if(all) { td = document.createElement("td"); setInnerText(td, lang("dom_acclist.htm", "12")); tr.appendChild(td); }
  table.appendChild(tr);

  for(var c = 0; c < acd.current.length; c++) {
    var h = acd.current[c];
    var d = new Date(h.start * 1000);
    tr = document.createElement("tr");
    td = document.createElement("td"); setInnerText(td, d.toLocaleString()); tr.appendChild(td);
    td = document.createElement("td"); setInnerText(td, prettify_from_to_spec(h.from, session.cdomain)); tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, h.agent); tr.appendChild(td);
    if(all) {td = document.createElement("td"); rightAlign(td); setInnerText(td, h.acd || ""); tr.appendChild(td);} 
    table.appendChild(tr);
  }

  return table;
}

function show_call_statistics(acd, all) {
  // Table with general call statistics:
  var table, tr, td, a;
  table = document.createElement("table");
  table.className="toggtbl";

  tr = document.createElement("tr");
  if(all) {
    td = document.createElement("td");
    setInnerText(td, lang("dom_acclist.htm", "12"));
    tr.appendChild(td);
  }
  td = document.createElement("td");
  setInnerText(td, lang("dom_acd3.htm", "calls")); // Hang up while waiting
  tr.appendChild(td);
  td = document.createElement("td");
  setInnerText(td, lang("dom_acd2.htm", "connected")); // Hang up while waiting
  tr.appendChild(td);
  td = document.createElement("td");
  setInnerText(td, lang("dom_acd3.htm", "dropout")); // Hang up while waiting
  tr.appendChild(td);
  td = document.createElement("td");
  setInnerText(td, lang("dom_acd3.htm", "hangup")); // Hang up while waiting
  tr.appendChild(td);
  td = document.createElement("td");
  setInnerText(td, lang("dom_acd3.htm", "wait")); // Redirect while waiting
  tr.appendChild(td);
  td = document.createElement("td");
  setInnerText(td, lang("dom_acd3.htm", "redirect")); // Redirect while waiting
  tr.appendChild(td);
  td = document.createElement("td");
  setInnerText(td, lang("dom_acd3.htm", "userexit")); // Edit by user
  tr.appendChild(td);
  table.appendChild(tr);

  for(a in acd.acds) {
    tr = document.createElement("tr");
    if(all) {
      td = document.createElement("td");
      td.style.textAlign = "right";
      setInnerText(td, a);
      tr.appendChild(td);
    }

    td = document.createElement("td");
    td.style.textAlign = "right";
    setInnerText(td, acd.acds[a].calls.count);
    tr.appendChild(td);

    td = document.createElement("td");
    td.style.textAlign = "right";
    setInnerText(td, acd.acds[a].calls.completed);
    tr.appendChild(td);

    td = document.createElement("td");
    td.style.textAlign = "right";
    setInnerText(td, acd.acds[a].hangup.waiting);
    tr.appendChild(td);

    td = document.createElement("td");
    td.style.textAlign = "right";
    setInnerText(td, acd.acds[a].hangup.ringing);
    tr.appendChild(td);

    td = document.createElement("td");
    td.style.textAlign = "right";
    setInnerText(td, acd.acds[a].redirect.waiting);
    tr.appendChild(td);

    td = document.createElement("td");
    td.style.textAlign = "right";
    setInnerText(td, acd.acds[a].redirect.ringing);
    tr.appendChild(td);

    td = document.createElement("td");
    td.style.textAlign = "right";
    setInnerText(td, acd.acds[a].exit.user);
    tr.appendChild(td);
    table.appendChild(tr);
  }

  // Put the table on the page:
  return table;
}

function show_connection_times(acd, all) {
  // Table with the call durations:
  //         | idle | ivr| ring| talk | hold
  // Sum     |
  // Average |
  var table, tr, td;
  table = document.createElement("table");
  table.className="toggtbl";

  // Header:
  tr = document.createElement("tr");
  if(all) {td = document.createElement("td"); tr.appendChild(td);}
  td = document.createElement("td"); rightAlign(td); setInnerText(td, lang("dom_acd2.htm", "state")); tr.appendChild(td);
  td = document.createElement("td"); rightAlign(td); setInnerText(td, lang("dom_acd3.htm", "idle")); tr.appendChild(td);
  td = document.createElement("td"); rightAlign(td); setInnerText(td, lang("dom_acd2.htm", "waiting")); tr.appendChild(td);
  td = document.createElement("td"); rightAlign(td); setInnerText(td, lang("dom_acd2.htm", "ringing")); tr.appendChild(td);
  td = document.createElement("td"); rightAlign(td); setInnerText(td, lang("dom_acd2.htm", "connected")); tr.appendChild(td);
  td = document.createElement("td"); rightAlign(td); setInnerText(td, lang("dom_acd3.htm", "hold"));  tr.appendChild(td);
  table.appendChild(tr);

  for(a in acd.acds) {
    tr = document.createElement("tr");
    if(all) {td = document.createElement("td"); setInnerText(td, a); tr.appendChild(td);}
    td = document.createElement("td"); td.innerHTML = "&Sigma;"; tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(acd.acds[a].duration.sum.idle));  tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(acd.acds[a].duration.sum.ivr)); tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(acd.acds[a].duration.sum.ring)); tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(acd.acds[a].duration.sum.talk)); tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(acd.acds[a].duration.sum.hold)); tr.appendChild(td);
    table.appendChild(tr);

    tr = document.createElement("tr");
    if(all) { td = document.createElement("td"); tr.appendChild(td); }
    td = document.createElement("td"); td.innerHTML = "&empty;"; tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(acd.acds[a].duration.average.idle));  tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(acd.acds[a].duration.average.ivr)); tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(acd.acds[a].duration.average.ring)); tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(acd.acds[a].duration.average.talk)); tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(acd.acds[a].duration.average.hold)); tr.appendChild(td);
    table.appendChild(tr);
  }
  // Put the table on the page:
  return table;
}

function show_acd_agents(acd, all) {
  var table, tr, td;

  // Now loop throug the agents:
  table = document.createElement("table");
  table.className="toggtbl";

  // Header:
  tr = document.createElement("tr");
  td = document.createElement("td"); setInnerText(td, lang("dom_acd3.htm", "name")); tr.appendChild(td);
  td = document.createElement("td"); tr.appendChild(td);
  td = document.createElement("td"); tr.appendChild(td);
  td = document.createElement("td"); rightAlign(td); setInnerText(td, lang("dom_acd3.htm", "idle")); tr.appendChild(td);
  td = document.createElement("td"); rightAlign(td); setInnerText(td, lang("dom_acd2.htm", "connected")); tr.appendChild(td);
  td = document.createElement("td"); rightAlign(td); setInnerText(td, lang("dom_acd3.htm", "hold")); tr.appendChild(td);
  if(!all) {td = document.createElement("td"); rightAlign(td); setInnerText(td, lang("dom_acd3.htm", "break")); tr.appendChild(td);}
  table.appendChild(tr);

  for(var a = 0; a < acd.agents.length; a++) {
    var agent = acd.agents[a];
    // Table with the call durations:
    // Name    | idle | ivr| ring| talk | hold
    // Sum     |
    // Average |
    tr = document.createElement("tr");
    var unavail = [];
    for(var seg = 0; seg < agent.work.segments.length; seg++) {
      var seg_begin = show_time(agent.work.segments[seg][0] - agent.work.begin);
      var seg_end = show_hh_mm(agent.work.segments[seg][1] - agent.work.segments[seg][0]);
      unavail.push(seg_begin + " (" + seg_end + ")");
    }
    var since = "";
    if("since" in agent.work) {
      var seg_begin = show_time(agent.work.since - agent.work.begin);
      var seg_end = show_hh_mm(agent.work.now - agent.work.since);
      unavail.push(seg_begin + "... (" + seg_end + ")");
    }
    
    td = document.createElement("td");
    setInnerText(td, agent.name + " ");
    tr.appendChild(td);

    td = document.createElement("td");
    if(agent.dnd) {
      var img = document.createElement("img");
      img.src = "/img/dnd.gif";
      td.appendChild(img);
    }

    var loggedIn = false;
    var loggedAgents = acd.logged_agents;
    for(var i=0; i<loggedAgents.length; i++) {
      if(agent.account === loggedAgents[i].toString()) {
        loggedIn = true;
      }
    }

    var img = document.createElement("img");
    if(loggedIn) {
      img.src = "/img/idle_person.png";
    }
    else {
      img.src = "/img/busy_phone.png";
    }
    td.appendChild(img);

    tr.appendChild(td);
    td = document.createElement("td"); td.innerHTML = "&Sigma;"; tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(agent.duration.idle));  tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(agent.duration.talk)); tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(agent.duration.hold)); tr.appendChild(td);
    if(!all) { td = document.createElement("td"); td.style.width="500px"; td.rowSpan = "2"; rightAlign(td); setInnerText(td, unavail.join(", ")); tr.appendChild(td); }
    table.appendChild(tr);

    tr = document.createElement("tr");
    td = document.createElement("td"); setInnerText(td, agent.account); tr.appendChild(td);
    td = document.createElement("td"); tr.appendChild(td);
    td = document.createElement("td"); td.innerHTML = "&empty;"; tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(agent.average.idle));  tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(agent.average.talk)); tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(agent.average.hold)); tr.appendChild(td);
    table.appendChild(tr);
  }
  return table;
}

function show_acd_history(acd, all) {
  var table, tr, td;

  // Add the history for the ACD:
  table = document.createElement("table");
  table.className="toggtbl";

  // Header:
  tr = document.createElement("tr");
  td = document.createElement("td"); setInnerText(td, lang("email_queue.htm", "start")); tr.appendChild(td);
  td = document.createElement("td"); setInnerText(td, lang("email_queue.htm", "from")); tr.appendChild(td);
  td = document.createElement("td"); setInnerText(td, lang("email_queue.htm", "agent")); tr.appendChild(td);
  td = document.createElement("td"); rightAlign(td); setInnerText(td, lang("email_queue.htm", "duration")); tr.appendChild(td);
  table.appendChild(tr);

  for(var c = 0; c < acd.history.length; c++) {
    var h = acd.history[c];
    var d = new Date(h.start * 1000);
    tr = document.createElement("tr");
    td = document.createElement("td"); setInnerText(td, d.toLocaleString()); tr.appendChild(td);
    td = document.createElement("td"); setInnerText(td, prettify_from_to_spec(h.from, session.cdomain)); tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, h.agent); tr.appendChild(td);
    td = document.createElement("td"); rightAlign(td); setInnerText(td, show_hh_mm(h.duration)); tr.appendChild(td);
    table.appendChild(tr);
  }

  return table;
}

function add_acd_section_header(file, tag) {
  var p = document.createElement("p");
  p.appendChild(document.createTextNode(lang(file, tag)));
  p.className="header2Text";
  return p;
}

// Show the ACD
function showacd(groups) {
  var multiple = groups.split(",").length > 1;
  loadLang(["dom_acclist.htm","dom_acd3.htm","dom_acd2.htm","email_queue.htm","usr_header.htm","menu","email_performance.htm"]);
  set_head(multiple ? lang("usr_index.htm", "allacd") : groups);

  // Get the information about that ACD: {"redirect":{"waiting":0,"ringing":0},"hangup":{"waiting":0,"ringing":0},"exit":{"user":0,"application":0},"duration":{"sum":{"ivr":0,"ring":0,"talk":0,"hold":0,"idle":0},"average":{"ivr":0,"ring":0,"talk":0,"hold":0,"idle":0}},"calls":{"count":0,"completed":0},"agents":[{"account":"40","name":"Forty Zero","work":{},"calls":0,"duration":{"talk":0,"hold":0,"idle":0},"average":{"talk":0,"hold":0,"idle":0}},{"account":"41","name":"Forty One","work":{},"calls":0,"duration":{"talk":0,"hold":0,"idle":0},"average":{"talk":0,"hold":0,"idle":0}}]}
  var acd = getRest("/rest/user/" + encodeURIComponent(session.cuser + "@" + session.cdomain) + "/wallboard/" + encodeURIComponent(groups));
  hide_all_sections();

  var table, tr, td;
  var acd1 = document.getElementById("acd1");
  acd1.style.display = "";
  acd1.innerHTML = "";

  acd1.appendChild(add_acd_section_header("usr_header.htm", "calls"));
  acd1.appendChild(show_acd_calls(acd, multiple));
  acd1.appendChild(add_acd_section_header("email_performance.htm", "callstat"));
  acd1.appendChild(show_call_statistics(acd, multiple));
  acd1.appendChild(add_acd_section_header("email_queue.htm", "duration"));
  acd1.appendChild(show_connection_times(acd, multiple));
  acd1.appendChild(add_acd_section_header("menu", "agents"));
  acd1.appendChild(show_acd_agents(acd, multiple));
  acd1.appendChild(add_acd_section_header("menu", "history"));
  acd1.appendChild(show_acd_history(acd, multiple));
}

var translateFiles = {};
var filename = "";
function translateItems2() {
  var optranslate = document.getElementById("options_translations");
  optranslate.innerHTML = "";
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

  list = []; for (i in translateFiles) list.push(i || "-");
  loadLang(list);
  list = ""; for (i in help) list += "," + i;
  if(list != "") help = getRest("/rest/system/help/" + session.lang + "/" + list.substring(1));

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
          if(tags[i] != "option") {
            items[j].oncontextmenu = function () { editTranslation2(this); return false; }
          }
          else {
            var tr = document.createElement("tr");
            var td = document.createElement("td");
            td.innerHTML = items[j].innerHTML;
            td.fn = items[j].fn;
            td.oncontextmenu = function () { editTranslation2(this); return false; }
            tr.appendChild(td);
            optranslate.appendChild(tr);
          }
        }
      }
      else if (txt.substring(0, 5) == "help:") {
        items[j].innerHTML = "<a href=\"" + help[txt.substring(5).toLowerCase()] + "\" target=\"_blank\"><img src=\"img/help2.gif\" alt=\"Help\" /></a>";
      }
    }
  }

  // Hack hack: Do the hardwired help links here:
  var helptop = document.getElementById("helptop");
  if (helptop) helptop.href = help["#"];
  var helpbottom = document.getElementById("helpbottom");
  if (helpbottom) helpbottom.href = help["#"];
}

// Edit something:
function editTranslation2(o) {
  var t = o.fn[1];
  var p = o.fn[0];

  // Remember t:
  document.getElementById("te-element2").value = t;
  document.getElementById("te-page2").value = p;
  document.getElementById("te-object2").obj = o;

  // Bring the prompt to the top:
  var txtedit = document.getElementById("texteditor2");
  txtedit.style.display = "";
  txtedit.style.top = (event.pageY + 20) + "px";
  txtedit.style.left = event.pageX + "px";

  // Get the English content:
  var to = document.getElementById("te-old2");
  var xp = (p == "" ? p : p + "/");
  var pe = "/rest/system/dict/en/" + xp + t;
  var px = "/rest/system/dict/" + session.lang + "/" + xp + t;
  var en = getRest(pe);
  var xx = pe == px ? en : getRest(px);
  setInnerText(to, en);
  document.getElementById("te-index2").innerHTML = "Item: #" + p + " " + t;

  // Copy the current content into the textarea field:
  var tn = document.getElementById("te-new2");
  var e = document.getElementById(t);
  tn.value = xx;
}

function saveTranslation2() {
  // Make the form disappear:
  document.getElementById("texteditor2").style.display = "none";
  var t = document.getElementById("te-element2").value;
  var p = document.getElementById("te-page2").value;
  var n = document.getElementById("te-new2").value;
  var e = document.getElementById("te-object2").obj;
  setInnerText(e, n);
  var xp = (p == "" ? p : p + "/");
  putRest("/rest/system/dict/" + session.lang + "/" + xp + t, n);
}

function carddavAuth() {
    var authurl = 'https://accounts.google.com/o/oauth2/auth?';
    var tokenurl = 'https://accounts.google.com/o/oauth2/token';
    var scope = 'https://www.googleapis.com/auth/carddav';
    var clientId = '1051189380101-o0gsn0mkuaoh07an1ioemi8evegvch07.apps.googleusercontent.com';
    var redirect = 'urn:ietf:wg:oauth:2.0:oob';
    var logout = 'http://accounts.google.com/Logout';
    var type = 'code';
    var requrl = authurl + 'scope=' + scope + '&client_id=' + clientId + '&redirect_uri=' + redirect + '&response_type=' + type;
    var win = window.open(requrl, "windowname", 'width=800, height=600'); 
}

function carddavlogout() {
    var e = document.getElementById("carddav_logout");
    e.value = "logout";
    savesettings();
    var logout = 'http://accounts.google.com/Logout';
    var w = window.open(logout, "windowname", 'width=800, height=600');
}
