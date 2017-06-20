var Slack = require('slack-client');
var urban = require('urban');
var _ = require('underscore');

var token = ''; // Enter your Slack API token here
 
var slack = new Slack(token, true, true);

var makeMention = function(userId) {
    return '<@' + userId + '>';
};
 
var isDirect = function(userId, messageText) {
    var userTag = makeMention(userId);
    return messageText &&
           messageText.length >= userTag.length &&
           messageText.substr(0, userTag.length) === userTag;
};
 
slack.on('open', function () {
    var channels = Object.keys(slack.channels)
        .map(function (k) { return slack.channels[k]; })
        .filter(function (c) { return c.is_member; })
        .map(function (c) { return c.name; });
 
    var groups = Object.keys(slack.groups)
        .map(function (k) { return slack.groups[k]; })
        .filter(function (g) { return g.is_open && !g.is_archived; })
        .map(function (g) { return g.name; });
 
    console.log('Welcome to Slack. You are ' + slack.self.name + ' of ' + slack.team.name);
 
    if (channels.length > 0) {
        console.log('You are in: ' + channels.join(', '));
    }
    else {
        console.log('You are not in any channels.');
    }
 
    if (groups.length > 0) {
       console.log('As well as: ' + groups.join(', '));
    }
})
 
slack.on('message', function(message) {
    
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
 
    if (message.type === 'message' && isDirect(slack.self.id, message.text)) {
        
        var trimmedMessage = message.text.substr(message.text.indexOf(" ") + 1).trim();
		var userWord = urban(trimmedMessage);

		userWord.first(function(json) {
				//channel.send(json);
				var message = (!_.isUndefined(json) && !_.isUndefined(json.definition) ? "_*"+trimmedMessage+"*_: " + json.definition : "Definition not found, try again!");
				channel.send(message)
		});
					
				
        
    }
});
 
slack.login();