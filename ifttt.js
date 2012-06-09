var maxMessageCount = 100;
var threshold = 80;
var qryCondition = '!(in:trash) label:ifttt-tw';
var triggerCondition = '!(in:trash) label:ifttt-trigger';
var triggerHourOnWeekDays = [7, 11];
var triggerMinuteOnWeekDays = 45;

function getCollectTriggerTitle(collectThreads) {
	if (collectThreads.length > threshold) {
		return "閾";
	}

	var triggerThreads = GmailApp.search(triggerCondition);
	if (triggerThreads.length) {
		moveToTrash(triggerThreads);
		return "文";
	}
	var dd = new Date();
	if (dd.getDay() == 0 || dd.getDay() == 6) {
		return "";
	}
	if (dd.getMinutes() < triggerMinuteOnWeekDays) {
		return "";
	}
	for (var i = 0; i < triggerHourOnWeekDays.length; i++) {
		if (triggerHourOnWeekDays[i] == dd.getHours()) {
			return "時";
		}
	}
	return "";
}

function ifttt() {
	var messages = collectMessages();
	if (messages) {
		messages.send();
		messages.moveToTrash();
	}
}

function moveToTrash(movableArray) {
	for (var j = 0; j < movableArray.length; j++) {
		movableArray[j].moveToTrash();
	}
}

function collectMessages() {
	var msgs = []; 
	var threads = GmailApp.search(qryCondition, 0, maxMessageCount).reverse();
	var triggerTitle = getCollectTriggerTitle(threads);

	Logger.log(triggerTitle + ":" + threads.length);
	if (!triggerTitle.length) {
		return null;
	}

	for (var i = 0; i < threads.length; i++) {
		msgs = msgs.concat(threads[i].getMessages());
	}
	
	return msgs.length ? {
		send: function() {
			GmailApp.sendEmail(
				msgs[0].getTo(),
				"【gas】" + msgs.length + "件:" + triggerTitle + "@" + new Date(),
				(function() {
					var sendMessageBody = "";
					for (var j = 0; j < msgs.length; j++) {
						sendMessageBody += msgs[j].getBody().replace(/<[^>]*>/g, "");
						sendMessageBody += "----\n";
					}
					return sendMessageBody;
				})());
		},
		moveToTrash: function() {
			moveToTrash(msgs);
		}
	} : null;
}
