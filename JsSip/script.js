// Create our JsSIP instance and run it:

var configuration = {
  ws_servers: 'ws://128.199.94.236:8088/ws?KEY=password', //128.199.94.236
  uri: 'sip:484@tanda.telegate.net.au:8088',
  password: '#484Tanda',
    realm: 'asterisk',
    hack_via_ws: true,
    hack_ip_in_contact: true,
    hack_via_tcp: true,
    traceSip:true,
};
JsSIP.debug.enable('JsSIP:*');

var phone = new JsSIP.UA(configuration);

phone.start();


// Make an audio/video call:
var session = null;

// Register callbacks to desired call events
var eventHandlers = {
  'progress': function(e){
    console.log('call is in progress');
  },
  'failed': function(e){
    console.log('call failed with cause: ', e.cause);
  },
  'ended': function(e){
    console.log('call ended with cause: ', e.cause);
  },
  'confirmed': function(e){
    var local_stream = session.connection.getLocalStreams()[0];

    console.log('call confirmed');

  },
  'addstream': function(e){
    var stream = e.stream;

    console.log('remote stream added');

  }
};

var options = {
  'eventHandlers': eventHandlers,
  'mediaConstraints': {'audio': true}
};

alert("READY")
session = phone.call('sip:61468799230@tanda.telegate.net.au:8088', options);