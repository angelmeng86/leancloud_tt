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
	    console.log('like status done.');
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
	    console.log('like post done.');
	});
})

AV.Cloud.afterSave('ForumComments', function(request) {
	var query = new AV.Query('ForumPosts');
	query.get(request.object.get('post').id).then(function(post) {
	    post.increment('commentCount');
	    post.save();
	    console.log('comment done.');
	});
})
/*
AV.Cloud.beforeSave('ForumCommentReplies', function(request, response) {
  var reply = request.object;
  if (reply) {
    var acl = new AV.ACL();
    acl.setPublicReadAccess(true);
    acl.setWriteAccess(reply.get('comment').id,true);

    post.setACL(acl);

    // 保存到数据库中
    response.success();
  } else {
    // 不保存数据，并返回错误
    response.error('未发现有效的对象；');
  }
});
*/
AV.Cloud.afterSave('ForumCommentReplies', function(request) {
	var query = new AV.Query('ForumComments');
	query.get(request.object.get('comment').id).then(function(model) {
	    model.add('replies', request.object);
	    model.save();
	    console.log('add reply done.');
	});
})