jsKontagent: A (prototype.js) Javascript Wrapper for the Kontagent Analytics API.
=================================================================================

How does it work?
-----------------
jsKontagent allows you to make calls to the Kontagent REST api through Javascript. 

I've opted to integrate with Kontagent using JavaScript for the following reasons:
1. This is how most analytics packages work.
2. It is easier to test: Just watch the traffic on Charles.
    You can argue that we can write unit tests on the server, but those will not be
    straightforward because we'll be queuing the calls.
3. It's cheaper: Browsers are doing the work. We have to pay for CPU cycles on the server.
 
Basic usage:
------------ 
You need to define the following global variables:
    
    VA_DOMAIN: The kontagent domain url. Like:
    "http://api.geo.kontagent.net/api/v1"
    or 
    "http://test-server.kontagent.com/api/v1" (test server)
 
    VA_KEY: The kontagent api key.
 
Usage examples:
---------------
 
    var params = {channel_type: 'stream', subtype_1: 'popup', subtype_2: 'score_share', sender: current_user.facebook_id, u: va.trackingCode};
    va.fire("post", params);
    or
    va.fire("invite", params);
