//Default home route
FlowRouter.route("/",{
	action : function () {
	BlazeLayout.render("home");
},
	name:"home"
});

//Main room route
FlowRouter.route("/room/:roomId",{

	action : function () {
		console.log("Running room route",this.params);
		var roomId = FlowRouter.getParam("roomId");

		//TODO Minimize reruns
		//If theres no id given, return to homepage //TODO: Make room instead
		if(!roomId) {
			console.log("No roomID, going home");
			//FlowRouter.go("home");
			return;
		} else {
			BlazeLayout.render("room_page");
		}
	},

	name : "room"

	//this.wait(Meteor.subscribe("room_single",roomId));
	//this.wait(Meteor.subscribe("room_users",roomId));
	//TODO: Don't wait, show fancy animations
/*
	if(this.ready()) {
		var room = Rooms.findOne(roomId);
		console.log("Got room",room);

		if(!room) {
			//If theres no room, make a new one
			Meteor.call("roomCreate",roomId);
			this.render("loading");
		} else {
			this.render("room",{data:room});
		}

	//If we're not ready, render a loading template
	} else {
		this.render("loading");
	}
	*/
});
