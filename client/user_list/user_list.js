Template.user_list.onCreated(function(){

});

Template.user_list.onRendered(function(){

});

Template.user_list.helpers({
	users : function(roomId) {
		return Meteor.users.find({
			room : roomId
		});
	}
});


Template.user_list.helpers({

});
