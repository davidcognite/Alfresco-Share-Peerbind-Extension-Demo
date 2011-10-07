/**
 * Peer Bind Demo Code
 * 
 */
$(function(){

   /* Utility Methods */
   var util = function Peerbind_util()
   {
      // Use a private object to store user data
      var srcIds = {},
         methods =
         {
            setId: function Peerbind_util_setId(id, userName)
            {
               srcIds[id] =
               {
                  userName: userName
               }
            },
            getUserName: function Peerbind_util_getId(id)
            {
               return srcIds[id].userName;
            },
            removeId: function Peerbind_util_removeId(id)
            {
              delete srcIds[id];
            },
            count: function Peerbind_util_countId()
            {
               var count = 0,
                  i;
               for (i in srcIds)
               {
                  ++count;
               }
               return count;
            },
            list: function Peerbind_util_list()
            {
               var userNames = []
               for (i in srcIds)
               {
                  userNames.push(srcIds[i].userName);
               }
            }
         }

      return methods;
   }()

   /* Online Status */

   // Trigger an online message & listen for responses.
   var removeFromOnlineList = function peerBind_removeFromOnlineList(id)
      {
         $("#peerbindStatus .online ul li[rel=" + id + "]").remove();
      },
      addToOnlineList = function peerBind_addToOnlineList(id, userName)
      {

         $("#peerbindStatus .online ul").append('<li rel="' + id + '">' + userName + '</li>');
      },
      newClient = function peerBind_newClient(e, ack)
      {
         // events are triggered on both local and remote clients.
         // if there's a srcPeer identifier, then it's a remote client.
         if ( e.srcPeer )
         {
            // Remember the ID and store the username against it.
            util.setId(e.srcPeer, e.peerData);
            addToOnlineList(e.srcPeer, e.peerData);
            // send back an acknowledgement so they know we're online too, but don't send it back if we receive an ack.
            if (!ack)
            {
               $(document.body).peertrigger("onlineAck", Alfresco.constants.USERNAME, e.srcPeer);
            }
         }
      }

   // Set listeners for online actions:
   // - online is effectively a broadcast ping
   $(document.body).peerbind("online", function Peerbind_online(e)
   {
      newClient(e, false);
   });

   // - onlineAck is response received from the clients.
   $(document.body).peerbind("onlineAck", function Peerbind_onlineAck(e)
   {
      newClient(e, true);
   });

   // - offline: A client is disappearing.
   $(document.body).peerbind("offline", function Peerbind_offline(e)
   {
      // remove id from online list
      removeFromOnlineList(e.srcPeer);

      util.removeId(e.srcPeer);
   });

   // Trigger the offline action when the window closes.
   // TODO: This doesn't always trigger.
   $(window).unload(function()
   {
      $(document.body).peertrigger("offline");
   });

   // Tell everyone we've just joined and let them know our username.
   $(document.body).peertrigger("online", Alfresco.constants.USERNAME);


   /* Chat Window */

   // Cache chat root node and define local function.
   var $chat = $("#peerbindChat"),
      addChat = function Peerbind_addChat(msg)
      {
         // using append not prepend to put new messages below old messages, like other chat clients.
         $chat.find(".chats").append("<br>"+msg);
      };

   // The chat window starts off hidden, but clicking the title expands it all to show everything.
   $chat.find("h1").click(function()
   {
      $chat.find(".chatWindow").toggle("slow");
   })

   // the object with peer and local functions indicates that the callback has different methods depending on if the event
   // was triggered by the local client or a remote peer. It avoids the need for an "if (e.srcPeer)" statement.
   $chat.find("input").peerbind("change",
   {
      peer: function(e)
      {
         addChat(util.getUserName(e.srcPeer) + ": " + e.peerData);
      },
      local: function(e)
      {
         // TODO: This and other hardcoded strings should be internationalised.
         addChat("You: " + e.peerData);
         // empties the input field.
         $(this).val("");
      }
   });

})