function requireDocument(id,collection) {
  var doc = collection.findOne({_id:id});
  if(!doc) {
    throw new Meteor.Error("document_not_found","Document could not be found",{id,collection});
  }
  return doc;
}

export default requireDocument;