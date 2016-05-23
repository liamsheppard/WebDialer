/*
 * File     : client_side_scripts.js
 * Content  : This file contains all the client side scripts for the PBX
 * Note     : Any input validations that needs to be done at the client side(html)
 *            should be added to this file.
 */
 
/* checks syntax for the URL */
function validate_url(input) {
    var ret_url = "";
    if (input.length > 0){
        var v = new RegExp();
        //http:// is optional. Takes IP address and domain with optional port in either case
        v.compile("^[A-Za-z://]*[A-Za-z0-9-_]+\\.?[A-Za-z0-9-_%&\?\/.=]+[:0-9]*[A-Za-z0-9-_%&\?\/.=]+$");
        if (!v.test(input)) {
            alert("You must supply a valid URL (e.g. \"http://xyz.com\")");
            return ret_url;
        }
    }
    return input;
}

/* chek the syntax of the e-mail address */
function validate_email(str) {
    var ret_email = "";
    if (str.length > 0) {
    // you have to have @
      if (!(str.indexOf("@") > 0)) {
        alert("You must supply valid email address");
        return ret_email;
      }
      // split the string into 2
      var temp = new Array();
      temp = str.split('@');
      if ((temp[0].length < 1) || (temp[1].length < 1)) {
        alert("You must supply valid email address");
        return ret_email;
      }
      if (temp[1].indexOf(".") < 1) {
        alert("You must supply valid email address");
        return ret_email;
      }
    }
    return str;
}

function validate_number(valid_chars, input){
   var isNumber=true;
   var c; 
   for (var i = 0; i < input.length && isNumber == true; i++) { 
      c = input.charAt(i); 
      if (valid_chars.indexOf(c) == -1){
         isNumber = false;
         break;
      }
   }  
   return isNumber;
}

function valid_number(field) {
  if (field.value.length == 0) return true;
  var isNum = /^-?\d+$/.test(field.value);
  if (!isNum) {
    alert(field.value + " is not a number");
    field.value = '';
    field.focus();
  }
  return true;
}

function validate_voicemail_size(str){
    var valid_chars = "0123456789";
    var ret_size="";
    if (validate_number(valid_chars, str)){
        //it is number. Now lets set some partical value
        var vmail_size = parseInt(str);
        if (vmail_size > 50){
            var user_action = confirm("Do you really need" + vmail_size + " voice mails\nClick OK to confirm, Cancel to input a different value");
            if (user_action == true){
                //user wants a number greater than 50
                ret_size = str;
            }
        }
        else{
            //user wants a number greater than 50
            ret_size = str;
        }
    }
    else{
        alert(str + " is not a number");
    }
    return ret_size;
}

// US-Mode
// (978) 123 4567 -> 978-123-4567
// +1-123-456-7890 -> 123-456-7890
//
function process_telnum(country, number) {
    // Get the numbers out:
    var numbers = "";
    var nospace = "";
    for(var i = 0; i < number.length; i++) {
      c = number.charAt(i);
      if((c >= "0" && c <= "9") || (i == 0 && c == "+")) numbers += c;
      if(c != " ") nospace += c;
    }

    // Anything?
    if(numbers == "") return nospace;

    if(country == "1") {
        // 011xxx -> +xxx
        if(numbers.substr(0, 3) == "011") numbers = "+" + numbers.substr(3);
        if(numbers.substr(0, 2) == "+1") numbers = numbers.substr(2);
        if(numbers.length == 10) {
            return numbers.substr(0, 3) + "-" + numbers.substr(3, 3) + "-" + numbers.substr(6, 4);
        }
        else if(numbers.length == 11 && (numbers.charAt(0) == "1" || numbers.charAt(0) == "9")) {
            return numbers.substr(1, 3) + "-" + numbers.substr(4, 3) + "-" + numbers.substr(7, 4);
        }
    }

    // At least strip the spaces out:
    return nospace;
}

function process_telnums(country, number) {
  var nums = number.split(" ");
  var result = "";
  for(var i in nums) {
    if(result.length > 0) result += " ";
    result += process_telnum(country, nums[i]);
  }
  return result;
} // process_telnums

function strip_invalid_tel_chars(input){
    var valid_tel_chars ="+0123456789";
    var final_string = "";
    var c;
    for(var i = 0; i < input.length; i++){
        c = input.charAt(i);
        if (valid_tel_chars.indexOf(c) != -1){
            final_string += c;
        }
    }
    return final_string;
}

/*
 * Function to validate the MAC address.
 */
function validate_mac_address(mac) 
 {
    if(mac.length == 0) return;
    if(mac == "*" || mac == "?" || mac == "$") return;
    var valid_chars = "0123456789abcdefABCDEF";
    var nums = mac.split(" ");
    for(var x = 0; x < nums.length; x++) {
       var m = nums[x]; 
       var len = m.length;
       var count = 0;
       for(var i = 0; i < len; i++) {
          var c = m.charAt(i);
          if((i - 2) % 3 == 0 && (c == ':' || c == '-')) continue; // 00:12:34:56:78:90 or 00-12-34-56-78-90
          if(valid_chars.indexOf(c) == -1) {
            alert("Invalid Media Access Control Address");
            return;
          }
          count++;
        }
        if(count != 12) {
          alert("MAC Address: Invalid length" + " " + m + " " + count);
          return;
        }
    }
    return;
 }

 function validate_ip_port(input) {
     var pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\:(\d{1,5})$/;
     var ret = input.match(pattern);
     if (ret == null) return false;
     return true;
 }

 // confirm the action - check boxes
 function confirm_selection(tbl, type1, oper)
 {
     var rows = document.getElementById(tbl).getElementsByTagName('tr');
     var checked_rows = 0;
     for(var r = 0; r < rows.length; r++)
     {
         // set the checkbox to 'selected'
         var row = rows[r];
         var cols = row.getElementsByTagName('td');
         for(var c = 0; c < cols.length; c++)
         {
             var col = cols[c];
             if (col.childNodes.length > 0)
             {
                 var type = col.childNodes[0].type;
                 if (type == 'checkbox')
                 {
                     if (col.childNodes[0].checked == true)
                     {
                         checked_rows++;
                     }
                 }
             }
         }
     }
     if (checked_rows == 0) {
         var msg;
         if (type1 == 'accounts') msg  = "No account(s) selected";
         else if (type1 == 'trunks') msg = "No trunk(s) selected";
         else if (type1 == 'address') msg = "No address(es) selected";
         else if (type1 == 'voicemail') msg = "No voicemail(s) selected";
         else if (type1 == 'recording') msg = "No recording(s) selected";
         else if (type1 == 'dialplan') msg = "No dialplan(s) selected";
         else if (type1 == 'domain') msg = "No domain(s) selected";
         else if (type1 == 'moh') msg = "No MoH(s) selected";
         else if (type1 == 'audio') msg = "No audiofile selected";
         else if (type1 == 'outbound') msg = "No outbound calling number selected";
         else if (type1 == 'location') msg = "No location selected";
         else if (type1 == 'access') msg = "No entry selected";

         alert(msg);
         return false;
     }
     var conf = null;
     if (type1 == 'accounts') {
       if (oper == 'delete_selected') {
         conf = "Do you want to delete selected account(s)?";
       }
       else if (oper == 'reboot_selected') {
         conf = "Do you want to reboot selected account(s)?";
       }
       else if (oper == 'open_pnp') {
         conf = "Are you sure that you want to open the accounts for provisioning?";
       }
       else if (oper == 'resync_selected') {
         conf = "Do you want to resync selected device(s)?";
       }
       else if (oper == 'disable_selected') {
         conf = "Do you want to disable selected account(s)?";
       }
       else if (oper == 'enable_selected') {
         conf = "Do you want to enable selected account(s)?";
       }
       else if (oper == 'remove_cellphone') {
         conf = "Do you want to unassign cellphone from selected account(s)?";
       }
       else if (oper == 'remove_email') {
         conf = "Do you want to unassign email from selected account(s)?";
       }
       else if (oper == 'clear_reg') {
         conf = "Do you want to clear all registration of selected account(s)?";
       }
       else if (oper == 'remove_mac') {
         conf = "Do you want to unassign MAC address from selected account(s)?";
       }
       else if (oper == 'reset_dnd') {
         conf = "Do you want to reset DND status of selected account(s)";
       }
       else if (oper == 'adrbook_on') {
         conf = "Do you want to make the selected account(s) visible?";
       }
       else if (oper == 'adrbook_off') {
         conf = "Do you want to make the selected account(s) invisible?";
       }
       else if (oper == 'turnoff_vpa') {
         conf = "Do you want to turn off VPA of selected account(s)";
       }
       else if (oper == 'intercom_all') {
         conf = "Do you want to enable intercom on selected account(s)?";
       }
       else if (oper == 'secure_extension') {
         conf = "Do you want to make the selected account(s) secure";
       }
       else if (oper == 'welcome_email') {
         conf = "Do you want to send welcome emails to the selected account(s)?";
       }
       else if (oper == 'cleanup_ext') {
         conf = "Do you want to cleanup the selected extension(s)?";
       }
       else if (oper == 'delete_vmail') {
         conf = "Do you want to delete voicemails of selected extension(s)?";
       }
     }
     else if (type1 == 'trunks') {
       if (oper == 'delete_selected') {
         conf = "Do you want to delete selected trunk(s)?";
       }
       else if (oper == 'disable_selected') {
         conf = "Do you want to disable selected trunk(s)?";
       }
       else if (oper == 'enable_selected') {
         conf = "Do you want to enable selected trunk(s)?";
       }
     }
     else if (type1 == 'address') {
       if (oper == 'delete_selected') {
         conf = "Do you want to delete selected address(es)?";
       }
       else if (oper == 'white_list') {
         conf = "Do you want to whitelist selected address(es)?";
       }
       else if (oper == 'black_list') {
         conf = "Do you want to blacklist selected address(es)?";
       }
     }
     else if (type1 == 'voicemail') {
       if (oper == 'delete_selected') {
         conf = "Do you want to delete selected voicemail(s)?";
       }
     }
     else if (type1 == 'dialplan') {
       if (oper == 'delete_selected') {
         conf = "Do you want to delete selected dialplan(s)?";
       }
     }
     else if (type1 == 'domain') {
       if (oper == 'delete_selected') {
         conf = "Do you want to delete selected domain(s)?";
       }
     }
     else if (type1 == 'moh') {
       if (oper == 'delete_selected') {
         conf = "Do you want to delete selected MoH(s)?";
       }
     }
     else if (type1 == 'audio') {
       if (oper == 'delete_selected') {
         conf = "Do you want to delete selected audio file(s)?";
       }
     }
     else if (type1 == 'recording') {
       if (oper == 'delete_selected') {
         conf = "Do you want to delete selected recording(s)?";
       }
     }
     else if (type1 == 'outbound') {
       if (oper == 'delete_selected') {
         conf = "Do you want to delete selected outbound number(s)?";
       }
       if (oper == 'reset_selected') {
         conf = "Do you want to reset the status of selected outbound number(s)?";
       }
     }
     else if (type1 == 'location') {
       if (oper == 'delete_selected') {
         conf = "Do you want to delete selected location(s)?";
       }
     }
     else if (type1 == 'access') {
       if (oper == 'delete_selected') {
         conf = "Do you want to delete the selected entry?";
       }
     }
     return confirm(conf);
 }

 // select or unselect check box click
 function sel_unsel(obj, tbl)
 {
     if (obj.checked == true)
     {
         return select_all(tbl);
     }
     else
     {
         return deselect_all(tbl);
     }
 }

 // this function is called when you loose focus on the "Name" field on the dom_extb.htm or dom_buttons_edit.htm
 // Note that this function name is hardcoded in the server side. So you can't change the function name
 function validate_name(obj) {
   return true;
 }

 // cross-browser reason
 document.getElementsByClassName = function (cl) {
   var retnode = [];
   var myclass = new RegExp('\\b' + cl + '\\b');
   var elem = this.getElementsByTagName('*');
   for(var i = 0; i < elem.length; i++) {
     var classes = elem[i].className;
     if (myclass.test(classes)) retnode.push(elem[i]);
   }
   return retnode;
 };

 // this fucntion is called when you hit the 'save' button or hit enter in any of the fields
 // Note that this function name is passed from the HTML page below.
 function validate_names() {
   return true;
 }

 // this fucntion is called when you hit the 'save' button or hit enter in any of the fields
 // Note that this function name is passed from the HTML page below.
 function validate_names_extn() {
   if (validate_names()) {
     return confirm("You are setting up a extension specific button profile");
   }
   else {
     return false;
   }
 }

 // function to show or hide column
 function toggleColumn(form_name, col_name, chkbox, init) {
   var showMode = 'table-cell';
   if (document.all) showMode = 'block';

   btn_clicked = document.forms[form_name].elements[chkbox];
   if(btn_clicked == null) return;
   if (!btn_clicked.checked && init == true) { // if this is during the page load, get the cookie
     var c_name = form_name + '#' + chkbox;
     btn_clicked.checked = getCookie(c_name);
   }
   mode = btn_clicked.checked ? showMode : 'none';
   cells = document.getElementsByName(col_name);

   elements = document.getElementsByTagName('*'); // get everything
   for(var j = 1; j < elements.length; j++) {
     if (elements[j].className == col_name) {
       elements[j].style.display = mode;
     }
   }
   if (init == false) {
     var c_name = form_name + '#' + chkbox;
     if (btn_clicked.checked) {
       setCookie(c_name, btn_clicked.checked, 1); // at the end save the state in the cookie for a day
     }
     else {
       deleteCookie(c_name);
     }
   }
 }

 // Search the table columns. 
 // TODO: needs some refinements. Currently it searches the everything on the HTML, including the class names, style etc.
 // It should just search the actual displayable field texts.
 function table_search(tbl) {
   var sb = document.getElementById("search_box");
   var input = sb.value.toLowerCase();
   var tbl = document.getElementById(tbl);
   var rows = tbl.rows;

   for(var i = 1 /* Skip the header row */; i < rows.length; i++) {
     var found = 0;
     var tds = rows[i].getElementsByTagName("td");
     if (tds.length < 1) continue;
     for(var col = 0; col < tds.length; col++) {
       col_text = tds[col].innerHTML.toLowerCase();
       if (col_text) {
         if (input.length == 0 || (input.length < 3 && col_text.indexOf(input) >= 0) || (input.length >= 3 && col_text.indexOf(input) > -1)) {
           rows[i].style.display = "";
           found = 1;
           break;
         }
       }
     }
     if (found == 0) {
       rows[i].style.display = "none";
     }
   }
 }

// to validate SIP error codes 4xx-6xx
function validate_sip_error_codes(field) {
  if (field.value.length == 0) return true;
  var err = false;
  var result = "";
  var err_str = "";
  var codes = field.value.split(' ');
  for(var loop = 0; loop < codes.length; loop++) {
    if (codes[loop] > 399 && codes[loop] < 700) {
      if (result.length == 0) result += codes[loop];
      else result = result + " " + codes[loop];
      continue;
    }
    else {
      err = true;      
      if (err_str.length == 0) err_str += codes[loop];
      else err_str = err_str + " " + codes[loop];
    }
  }
  if (err) {
    alert("Invalid SIP error code " + err_str);
  }
  field.value = result;
  return !err;
}

//button section start: Functions in this section for all for creating/modifying phone buttons and their values
function selected(i, value) {
  b = 'd' + i.toString();
  s = document.getElementById(b).value;
  if (value == s) return "selected='selected'";
  else return "";
}

function createbuttons() {
  hide = document.getElementById("hidenumber").innerHTML;
  if (hide == "true") {
    document.getElementById("number_id").style.display = "none";
  }
  max_buttons = document.getElementById("linecount").innerHTML;
  for(var i = 1; i <= max_buttons; i++) {
    id_index = "e" + i.toString();
    j = document.getElementById(id_index).innerHTML;
    id_select = "b" + j.toString();
    Combo1Change(document.getElementById(id_select).value, id_select); //initialization
  }
}

function Combo1Change(v, passed_id) {
  index = passed_id.substring(1);
  b = 'd' + index;
  v2 = document.getElementById(b).value;

  id_select = "c" + index;
  id = "y" + index;
  if (v == "keyevent") {
    document.getElementById(id).innerHTML = "<select class='cCombo' style='width:150px' name='" + id_select + "'>" +
                                              "<option value='none' " + selected(index, 'none') + ">None</option>" +
                                              "<option value='F_ABS' " + selected(index, 'F_ABS') + ">ABS</option>" +
                                              "<option value='F_ACCEPTED_LIST' " + selected(index, 'F_ACCEPTED_LIST') + ">Accepted Calls</option>" +
                                              "<option value='F_CALL_LIST' " + selected(index, 'F_CALL_LIST') + ">Call Lists</option>" +
                                              "<option value='F_REGS' " + selected(index, 'F_REGS') + ">Change Active Id</option>" +
                                              "<option value='F_CONFERENCE' " + selected(index, 'F_CONFERENCE') + ">Conference</option>" +
                                              "<option value='F_CONTACTS' " + selected(index, 'F_CONTACTS') + ">Contacts</option>" +
                                              "<option value='F_ADR_BOOK' " + selected(index, 'F_ADR_BOOK') + ">Directory</option>" +
                                              "<option value='F_DND' " + selected(index, 'F_DND') + ">DND</option>" +
                                              "<option value='F_FAVORITES' " + selected(index, 'F_FAVOURITES') + ">Favorites</option>" +
                                              "<option value='F_REDIRECT' " + selected(index, 'F_REDIRECT') + ">Forward all</option>" +
                                              "<option value='F_SUPPORT' " + selected(index, 'F_SUPPORT') + ">Help</option>" +
                                              "<option value='F_HOLD' " + selected(index, 'F_HOLD') + ">Hold</option>" +
                                              "<option value='F_HOLD_PRIVATE' " + selected(index, 'F_HOLD_PRIVATE') + ">Hold private</option>" +
                                              "<option value='F_DIRECTORY_SEARCH' " + selected(index, 'F_DIRECTORY_SEARCH') + ">LDAP Directory</option>" +
                                              "<option value='F_LOGOFF_ALL' " + selected(index, 'F_LOGOFF_ALL') + ">Logoff Identities</option>" +
                                              "<option value='F_SETTINGS' " + selected(index, 'F_SETTINGS') + ">Menu</option>" +
                                              "<option value='F_MISSED_LIST' " + selected(index, 'F_MISSED_LIST') + ">Missed Calls</option>" +
                                              "<option value='F_DIALOG' " + selected(index, 'F_DIALOG') + ">Monitor Calls</option>" +
                                              "<option value='F_MUTE' " + selected(index, 'F_MUTE') + ">Mute</option>" +
                                              "<option value='F_NEXT_ID' " + selected(index, 'F_NEXT_ID') + ">Next Outgoing ID</option>" +
                                              "<option value='F_OCIP' " + selected(index, 'F_OCIP') + ">OCIP</option>" +
                                              "<option value='F_PRESENCE' " + selected(index, 'F_PRESENCE') + ">Presence State</option>" +
                                              "<option value='F_PREV_ID' " + selected(index, 'F_PREV_ID') + ">Prev. Outgoing ID</option>" +
                                              "<option value='F_REBOOT' " + selected(index, 'F_REBOOT') + ">Reboot</option>" +
                                              "<option value='F_REC' " + selected(index, 'F_REC') + ">Record</option>" +
                                              "<option value='F_REDIAL' " + selected(index, 'F_REDIAL') + ">Redial</option>" +
                                              "<option value='F_RETRIEVE' " + selected(index, 'F_RETRIEVE') + ">Retrieve</option>" +
                                              "<option value='F_STATUS' " + selected(index, 'F_STATUS') + ">Status messages</option>" +
                                              "<option value='F_TRANSFER' " + selected(index, 'F_TRANSFER') + ">Transfer</option>" +
                                              "</select>";
  }
  else {
    if (typeof v2 !== "undefined")
      document.getElementById(id).innerHTML = "<input value='" + v2 + "' class='cText250' style='width:100px' name='" + id_select + "'/>";
    else
      document.getElementById(id).innerHTML = "<input value='' class='cText250' style='width:100px' name='" + id_select + "'/>";
  }
}
//button section end

function make_visible(turn_on, turn_off) {
  if(turn_on != null) {
    for(var i = 0; i < turn_on.length; i++) {
      document.getElementById(turn_on[i]).style.display = "";
    }
  }
  if(turn_off != null) {
    for(var i = 0; i < turn_off.length; i++) {
      document.getElementById(turn_off[i]).style.display = "none";
    }
  }
}
