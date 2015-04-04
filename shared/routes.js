//Default home route
Router.route("/",function(){
	this.render("home");
},{
	name:"home"
});

//Main room route
Router.route("/room/:roomId",function(){
	console.log("Running room route");
	var roomId = (this.params.roomId);

	//If theres no id given, return to homepage //TODO: Make room instead
	if(!roomId) {
		console.log("No roomID, going home");
		this.render("home");
	}


	this.wait(Meteor.subscribe("room_single",roomId));
	this.wait(Meteor.subscribe("room_users",roomId));

	if(this.ready()) {
		var room = Rooms.findOne(roomId);

		if(!room) {
			//If theres no room, make a new one
			Meteor.call("roomCreate",roomId);
		} else {

			//Add user if user not in room
			if(!Utils.roomContainsUser(roomId,Meteor.userId())) {
				Meteor.call("roomAddUser",roomId);
			} else {
				//We're ready, got a room and all relevant data and we've added the user, render the room!
				this.render("room",{data:room});
			}


		}

	//If we're not ready, render a loading template
	} else {
		this.render("loading");
	}
},{
	name:"room"
});