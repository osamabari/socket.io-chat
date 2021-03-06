## Example

```javascript
var server = http.createServer();

var chat = require('socket.io-chat');
var chatClient = new chat.Client(server);

chat.setConnect(dbConnect); // mongodb connect
```

## Authenticate

```javascript
chatClient.on('authenticate', function (socket, data, next) {
   dbConnect.getCollection('users').findOne({
        email: data.email,
        password: data.password
   }, function (err, doc) {
        if (err) { 
            return next(new Error('unknown error'))
        }
        
        if (!doc) {
            return next(new Error('user not found'))
        }
        
        // important, fields `auth` and `user` is required;        
        socket.user = doc._id;
        socket.auth = true;
        
        next();
   })
});
```

## Events

* authenticate
    `On authenticate user`
* create
    `On create new chat`
* enter
    `On enter in chat`
* leave
    `On leave from chat`
* addMember
    `On add member in chat`
* removeMember
    `On remove member from chat`
* newMessage
    `On add message in chat`
* newSystemMessage
    `Optional system messages (add/remove/leave member, change title)`
* changeTitle
    `On change title of chat`
* findMessagesLast/findMessagesFrom/findMessagesAt
    `On find messages of chat`
* findChats/findChat
    `On find chat(s)`
    
## Validate

```javascript
chatClient.validate('newMessage', function (socket, options, next) {
    dbConnect.getCollections('users')
        .findById(options.performer, function (err, doc) {
            if (err) return next(err);
            
            if (doc.roles.indexOf('ContentManager') !== -1) {
                options.flag = chatClient.FLAGS.OTHER;
            }
            
            if (doc.roles.indexOf('Guest') !== -1) {
                return next(new Error('Guest cannot send messages'));
            }
            
            next();
        }) 
    
    //chat, message, performer, flag
})
```
## Client options

```javascript
new chat.Client(server, options = {})
```

* options.collectionChat
    `name of chat collection in mongodb`
* options.collectionMessage
    `name of messages collection in mongodb`
* options.eventPrefix
    `prefix to all event names`
* options.EVENTS
    `enum of all event names in upper case`
```javascript
    {
        AUTHENTICATE: 'foo',
        CREATE: 'create chat',
        ENTER: 'enter chat',
        LEAVE: 'leave from chat',
        ...
    }
```
* options.schemaChat - json schema to extend the base chat schema
* options.schemaMessage - json schema to extend the base messages schema
```javascript
        schemaChat: {
            properties: {
                foo: {
                    "type": "string"
                }
            }
        }
```

## FLAGS

Access flags for the execution of operations by the performer

* AUTHOR
    Performer must be a author of chat
* MEMBER
    Performer must be a member of chat
* OTHER
    The performer is not checked. Access is permitted
* RECEIVER
    Not used yet

Add custom flag:

client.action.addValidator(someFlag, function (options) {
    return options.chat.creatorId.equals(someId);
});

> FLAGS.AUTHOR, FLAGS.MEMBER, FLAGS.OTHER have numbers 1,2,3,4 respectively

> Each message have array of receivers. It means, after leave or remove user from chat, this user can read messages 
> where he was the receiver.

## Api of chat client:

* use(cb)
    `It's a io.use()`
* validate(path, cb)
* create(data, creator)
* addMember(chat, member, performer = null, flag = FLAGS.MEMBER)
* removeMember(chat, member, performer = null, flag = FLAGS.AUTHOR)
* newMessage(chat, messageData, performer = null, flag = FLAGS.MEMBER)
* changeTitle(chat, title, performer = null, flag = FLAGS.MEMBER)
* leave(chat, performer, flag = FLAGS.MEMBER)
* newSystemMessage(chat, data)
* findLastMessages(chatId, user, count, flag = FLAGS.RECEIVER) `flag not used`
* findFromMessages(chatId, messageId, user, count, flag = FLAGS.RECEIVER) `flag not used`
* findAtMessages(chatId, messageId, user, count, flag = FLAGS.RECEIVER) `flag not used`
* findChats(user, count = 10)
* findChatById(user, chatId)
* destroy()
    `Close socket.io connection and remove all listeners from the client`
* model(name)
    `Returns a reference to the model of the chat/message`
    `client.model('chat').findById(chatId).then(resolve, reject)`
* get eventNames
    `Return list of event names`
* set eventNames(names)
    `Set event names`
* socket.emitResult.transform(eventdata, next)
    `Transform socket result answer`
    ```javascript
        client.socket.emitResult.transform = function (data, next) {
            delete data.chatId;
            next(data);
        }    
    ``` 
* socket.emitError.transform(data, next)
    `Transform socket error answer`
    ```javascript
        client.socket.emitError.transform = function (data, next) {
            next({ statusCode: 500, message: data.message });
        }    
    ```
* socket.emitResult.transformOn(eventName, callback)
    ```javascript
        client.socket.emitResult.transformOn('create', function (data, next) {
            next(data);
        });
    ```
* socket.emitError.transformOn(eventName, callback)
    ```javascript
        client.socket.emitError.transformOn('create', function (data, next) {
            next(data);
        });
    ```

## Changelog

* 0.0.6
 * added socket.emitError.transformOn
 * extend json schema (see options.schemaMessage)
 * remove `enter` event on create chat. (Replaced by `addMember`)
 * fix events findMessagesLast/findMessagesFrom to use emitResult

## License
MIT