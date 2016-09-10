var Cards = (function () {
  var collection = new Mongo.Collection("cards");
  
  
  function gather(options) {
    var defaults = {
      blacklist : [],
    }
    
    options = Object.assign({},defaults,options);
  
    var {blacklist,inSets,count} = options;
    
    if(!count) {
      throw new Meteor.Error("gather_no_count");
    }
    
    if(!inSets) {
      throw new Meteor.Error("gather_no_sets");
    }
    
    return collection.find({
      _id: {$nin:blacklist},
      set : {$in:inSets}
    },{
      limit:count
    }).fetch();
  }
  
  return {
    _collection : collection,
    gather
  };
}());

export default Cards;