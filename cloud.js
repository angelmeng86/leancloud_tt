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

	    var query2 = new AV.Query('_Conversation');
		query2.get('5955040cac502e006077817b').then(function(model) {
			model.send(request.object.get('user').id
			,'{\"_lctype\":2,\"_lctext\":\"给你的心情点了赞\",\"_lcattrs\":{\"typeTitle\":\"您有一条通知\"}}'
			, {"toClients":[status.get('creater').id]});

		    console.log('send status message.');
		});
	});
})

AV.Cloud.afterSave('ForumPostsLikes', function(request) {
	var query = new AV.Query('ForumPosts');
	query.get(request.object.get('post').id).then(function(post) {
	    post.increment('praise');
	    post.save();
	    console.log('like post done.');

	    var query2 = new AV.Query('_Conversation');
		query2.get('5955040cac502e006077817b').then(function(model) {
			model.send(request.object.get('user').id
			,'{\"_lctype\":2,\"_lctext\":\"给你的帖子点了赞\",\"_lcattrs\":{\"typeTitle\":\"您有一条通知\"}}'
			, {"toClients":[status.get('creater').id]});

		    console.log('send post message.');
		});
	});
})

AV.Cloud.afterSave('ForumComments', function(request) {
	var query = new AV.Query('ForumPosts');
	query.get(request.object.get('post').id).then(function(post) {
	    post.increment('commentCount');
	    post.save();
	    console.log('comment done.');

	    var query2 = new AV.Query('_Conversation');
		query2.get('595503e58fd9c5005f250b01').then(function(model) {
			model.send(request.object.get('creater').id
			,'{\"_lctype\":2,\"_lctext\":\"刚刚评论了你的帖子\",\"_lcattrs\":{\"typeTitle\":\"您有一条通知\"}}'
			, {"toClients":[post.get('creater').id]});

		    console.log('send comment message.');
		});
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
	query.get(request.object.get('comment').id).then(function(comment) {
	    comment.add('replies', request.object);
	    comment.save();
	    console.log('add reply done.');

	    if(request.object.get('creater').id != comment.get('creater').id) {
	    	var query2 = new AV.Query('_Conversation');
			query2.get('595503e58fd9c5005f250b01').then(function(model) {
				model.send(request.object.get('creater').id
				,'{\"_lctype\":2,\"_lctext\":\"刚刚回复了你的评论\",\"_lcattrs\":{\"typeTitle\":\"您有一条通知\"}}'
				, {"toClients":[comment.get('creater').id]});

			    console.log('send reply message.');
			});
	    }
	});
})