Template.home_page.onCreated(function(){

});

Template.home_page.onRendered(function(){

});

Template.home_page.events({

});

Template.home_page.helpers({

});

Template.new_room_button.events({
	"click [data-action=new_room]" : function (e,tmp) {
		Meteor.call("roomCreate",function(error,result){
			if(!error) {
				Meteor.call("roomAddUser",result);

				FlowRouter.go("/room/"+result);
			} else {
				throw error;
			}
		});


	}
});
