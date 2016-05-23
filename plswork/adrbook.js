function load_adressbook(adrbook, checkbox, dialbutton, link) {
  var tt = document.getElementById("tt");
  load_adr(adrbook, checkbox, dialbutton, link, tt);
}

function load_adressbook2(adrbook, checkbox, dialbutton, link) {
  var tt = document.getElementById("tt2");
  load_adr(adrbook, checkbox, dialbutton, link, tt);
}

function load_adr(adrbook, checkbox, dialbutton, link, tt) {
  var even = true;
  for(var i = 0; i < adrbook.length; i++) {
    var d = adrbook[i];
    var tr = document.createElement("tr");
    tr.className = even ? "table_even" : "table_odd";
    even = !even;
    var html = "";
    if(checkbox) {
      html += "<td><input type=\"checkbox\" name=\"adrbook[]\" value=\"" + d.id + "\"></td>";
      html += "<td><a href=\"" + link + "?adrbook=" + d.id + "\"><img src=\"img/edit.gif\"></a></td>";
    }
    if(d.number != "") {
      html += "<td>" + "<span style='cursor:pointer;' onclick=dialNumber('number:" + process_telnum("", d.number) + "')>" + present_html(process_telnum("", d.number)) + "</span>" + " ";
      if(dialbutton) html += "<a href=\"remote_call.htm?dest=" + encodeURIComponent(d.number) + "\"><img src=\"img/call.png\"></a>";
      html += "&nbsp;</td>";
    }
    else {
      html += "<td></td>";
    }
    if(d.mobile != "") {
      html += "<td>" + "<span style='cursor:pointer;' onclick=dialNumber('number:" + process_telnum("", d.mobile) + "')>" + present_html(process_telnum("", d.mobile)) + "</span>" + " ";
      if(dialbutton) html += "<a href=\"remote_call.htm?dest=" + encodeURIComponent(d.mobile) + "\"><img src=\"img/call.png\"></a>";
      html += "&nbsp;</td>";
    }
    else {
      html += "<td></td>";
    }
    html += "<td>" + present_html(d.first) + "&nbsp;</td>";
    html += "<td>" + present_html(d.last) + "&nbsp;</td>";
    html += "<td>" + present_html(d.cmc) + "&nbsp;</td>";
    html += "<td>" + present_html(d.speed) + "</td>";
    tr.innerHTML = html;
    tt.appendChild(tr);
  }
}
