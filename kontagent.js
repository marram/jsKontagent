/**
 * Integration script with Kontagent.
 * 
 * I'm opting to integrate with Kontagent using JavaScript for the following reasons:
 * 1. This is how we do the rest of the analytics.
 * 2. It is easier to test: Just watch the traffic on Charles.
 *    You can argue that we can write unit tests on the server, but those will not be
 *    straightforward because we'll be queuing the calls.
 * 3. It's cheaper: Browsers are doing the work. We have to pay for CPU cycles on the server.
 * 
 * Basic usage:
 * You need to define the following global variables:
 * VA_DOMAIN: The kontagent domain url. Like:
 * "http://api.geo.kontagent.net/api/v1"
 * or 
 * "http://test-server.kontagent.com/api/v1" (test server)
 * 
 * VA_KEY: The kontagent api key.
 * var params = {channel_type: 'stream', subtype_1: 'popup', subtype_2: 'score_share', 
 * 			sender: current_user.facebook_id, u: va.trackingCode};
 * va.fire("post", params);
 * or
 * va.fire("invite", params);
 */

 //cached instance of VA (viral analytics).
 __va = null;
 var va = {
     // Kontagent var map.
     // A lookup map for all the kontagent calls. I don't want to have to remember the trite variable names.
     VAR_MAP: {
        'uid': 'u',
        'u': 'u',
        'timestamp': 'ts',
        'post': 'pst',
        'invite': 'ins',
        'sender': 's',
        'recipients': 'r',
        'recipient': 'r',
        'template_id': 't',
        'tracking_tag': 'u',
        'short_tracking_tag': 'su',
        'subtype_1': 'st1',
        'subtype_2': 'st2',
        'subtype_3': 'st3',
        'channel_type': 'tu',
        'ip_address': 'ip',
        'page_address': 'u',
        'birth_year': 'b',
        'gender': 'g',
        'city': 'ly',
        'country': 'lc',
        'state': 'ls',
        'postal': 'lp',
        'friend_count': 'f',
        'goal_count_id': 'gcn',
        'value': 'v',
        'installed': 'i'
    },     
    /**
     * Translates the readable parameters into the (K)ryptic keys used by Kontagent.
     */
    __translate_params: function(params){
        var p = {};
        $H(params).each(function(pair){
            if(pair.value){
                p[va.VAR_MAP[pair.key]] = pair.value;    
            }
        });
        return p;
    },
    
    /**
     * Fires Viral Analytics.
     */    
    fire: function(call, params){
        if (!__va){
            __va = new __KS(VA_DOMAIN, VA_KEY);
        }
        // If the call name needs translation, eg: "invite" rather than "ins".
        if (va.VAR_MAP[call]) {
           call = va.VAR_MAP[call];
        }

         var p = va.__translate_params(params); 
         // Defer execution until the interpeter is free.
         (function(){__va._fire(call, p)}).defer();
         
     },
     
     /**
      * Creates a 16 byte tracking code for Kontagent. This is used as a unique identifier for each
      * call and it is used to close the loop for two way interactions, such as invitations ... etc.
      */
     trackingCode: function(){
        return Math.uuid(16);
     },
     
     /**
      * Adds tracking information to a link that should go out to Facebook.
      * @param link: The link you want to add tracking to.
      * @param params: the parameters you want to add to the link. You must use the readable names
      * defined in VAR_MAP.
      */
     trackLink: function(link, params){        
         // Now, we need to make the parameters cryptic, so that people can't guess what
         // they are. So we'll just reverse the lookup we do in .fire.
         var p = va.__translate_params(params);
         link = link.replace(ABSOLUTE_FB_PATH, ABSOLUTE_FB_PATH+"/va")
         var sep = (link.indexOf('?') == -1) ? "?":"&";
         // Note the /va/ prefix is to direct all requests to the viral analytics handler.
         return link+sep+$H(p).toQueryString();
     }
 };

 /**
  * A mini-class to actually fire analytics calls to Kontagent. The calls are fired by
  * requesting a 1x1px image. This works cross-domain because we do not need to inspect the
  * response.
  * 
  * KS stands for: kontagent slug
  */
 var __KS = Class.create({
     /**
      * Viral analytics. We use Kontagent.
      * Use one instance per call.
      * 
      * @param key: API key.
      */
     initialize: function(domain, key){
         this.img = new Element("img", {style: 'width: 1px; height: 1px; position: absolute; left: -5px;'});
         $(document.body).insert(this.img);
         this.domain = domain;
         this.key = key;
     },
     
     _fire: function(call, params){
         var url = this.domain+"/"+this.key+"/"+call+"/?"+$H(params).toQueryString();
         this.img.src = url;
     }    
 })
 