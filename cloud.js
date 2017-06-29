var AV = require('leanengine');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function(request) {
  return 'Hello world!';
});

AV.Cloud.afterSave('_Followee', function(request) {
	var query = new AV.Query('_Conversation');
	query.get('5951c0bcac502e0060758c32').then(function(model) {
		model.send(request.object.get('user').id
			,'{\"_lctype\":2,\"_lctext\":\"刚刚关注了你\",\"_lcattrs\":{\"typeTitle\":\"您有一条通知\"}}'
			, {"toClients":[request.object.get('followee').id]});

	    //model.broadcast(request.object.get('user').id,'{\"_lctype\":2,\"_lctext\":\"刚刚关注了你\",\"_lcattrs\":{\"typeTitle\":\"您有一条通知\"}}');
		console.log('send followee message.');
	});
})

AV.Cloud.afterSave('UserStatusLikes', function(request) {
	var query = new AV.Query('UserStatus');
	query.get(request.object.get('status').id).then(function(status) {
	    status.increment('praise');
	    status.save();
	    console.log('increment status done.');
		/*
	    var query2 = new AV.Query('_Conversation');
		query2.get('5951c0bcac502e0060758c32').then(function(model) {
		    model.broadcast(request.object.get('user').id,'{\"_lctype\":2,\"_lctext\":\"给你的心情点了赞\",\"_lcattrs\":{\"typeTitle\":\"您有一条通知\"}}');
			console.log('send message.');
		});*/
	});
})

AV.Cloud.afterSave('ForumPostsLikes', function(request) {
	var query = new AV.Query('ForumPosts');
	query.get(request.object.get('post').id).then(function(post) {
	    post.increment('praise');
	    post.save();
	    console.log('increment post done.');
	});
})