To run this, cd into this directory and start a simple Python server. It won't work if you access it direct from a file:// URL since Chrome blocks audio/video on that protocol.

```
$ python -m SimpleHTTPServer
Serving HTTP on 0.0.0.0 port 8000 ...
```

Then navigate to the appropriate port (8000 in this case): http://localhost:8000

To make this work I grabbed all the JS from https://tanda.telegate.net.au/usr_phone.js, and a few functions from https://tanda.telegate.net.au/preload.js as I needed them. I also created the necessary HTML elements with IDs that match what the usr_phone.js script expected. Then I commented out a whole bunch of code that dealt with displaying the "call-state" since it depended on some other html elements code I hadn't bothered adding.

I inlined my js in my HTML to make it easier to work with but I wouldn't recommend that as a long term strategy.