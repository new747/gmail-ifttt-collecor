var maxMessageCount = 100;
function ifttt() {
	var qryCondition = '!(in:trash) label:ifttt-tw';
	var messages = collectMessages(qryCondition);
	if (messages) {
		messages.send();
		messages.moveToTrash();
	}
}

function collectMessages(qryCondition) {
	var msgs = []; 
	var threads = GmailApp.search(qryCondition, 0, maxMessageCount).reverse();
	Logger.log(threads.length);
	for (var i = 0; i < Math.min(maxMessageCount, threads.length); i++) {
		msgs = msgs.concat(threads[i].getMessages());
	}
	Logger.log("collected" + msgs.length);
	
	return msgs.length ? {
		send: function() {
			GmailApp.sendEmail(
				msgs[0].getTo(),
				"【gas】" + msgs.length + "件 at " + new Date(),
				(function() {
					var sendMessageBody = "";
					for (var j = 0; j < msgs.length; j++) {
						sendMessageBody += msgs[j].getBody().replace(/<[^>]*>/g, "");
						sendMessageBody += "--------------\n";
						if (!((j + 1) % 20)) {
							Logger.log("body created:" + j);
						}
					}
					return sendMessageBody;
				})());
		},
		moveToTrash: function() {
			for (var j = 0; j < msgs.length; j++) {
				msgs[j].moveToTrash();
				if (!((j + 1) % 20)) {
					Logger.log("move to trashed:" + j);
				}
			}
		}
	} : null;
}
