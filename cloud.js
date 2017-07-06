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
		model.send('NoticeMessage'
			,'{\"_lctype\":2,\"_lctext\":\"刚刚关注了你\",\"_lcattrs\":{\"type\":1,\"typeTitle\":\"您有一条通知\",\"fromId\":\"' + request.object.get('user').id +'\"}}'
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
			model.send('NoticeMessage'
			,'{\"_lctype\":2,\"_lctext\":\"给你的心情点了赞\",\"_lcattrs\":{\"type\":2,\"typeTitle\":\"您有一条通知\",\"fromId\":\"' + request.object.get('user').id +'\",\"sid\":\"' + request.object.get('status').id + '\"}}'
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
			model.send('NoticeMessage'
			,'{\"_lctype\":2,\"_lctext\":\"给你的帖子点了赞\",\"_lcattrs\":{\"type\":3,\"typeTitle\":\"您有一条通知\",\"fromId\":\"' + request.object.get('user').id +'\",\"pid\":\"' + request.object.get('post').id + '\"}}'
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
			model.send('NoticeMessage'
			,'{\"_lctype\":2,\"_lctext\":\"刚刚评论了你的帖子\",\"_lcattrs\":{\"type\":4,\"typeTitle\":\"您有一条通知\",\"fromId\":\"' + request.object.get('creater').id +'\",\"pid\":\"' + request.object.get('post').id +'\",\"cid\":\"' + request.object.id + '\"}}'
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
				model.send('NoticeMessage'
				,'{\"_lctype\":2,\"_lctext\":\"刚刚回复了你的评论\",\"_lcattrs\":{\"type\":5,\"typeTitle\":\"您有一条通知\",\"fromId\":\"' + request.object.get('creater').id +'\",\"pid\":\"' + comment.get('post').id +'\",\"cid\":\"' + comment.id + '\"}}'
				, {"toClients":[comment.get('creater').id]});

			    console.log('send reply message.');
			});
	    }
	});
})

AV.Cloud.afterSave('UserStatus', function(request) {
	if(request.object.get('category') == 1) {
		//当商家发起活动推送时，查询关注者并发送通知
		var query = new AV.Query('_Follower');
		query.equalTo('user',request.object.get('creater')).find().then(function(results) {
			console.log('query follower:' + results.length);
			if(results.length > 0) {
				var index;
				var arr = new Array(results.length);
				for(index in results) {
					//console.log('followerId:' + results[index].get('follower').id);
					arr[index] = results[index].get('follower').id;
				}

				//var str ='{\"_lctype\":2,\"_lctext\":\"' + request.object.get('pushTitle') +'\",\"_lcattrs\":{\"type\":6,\"typeTitle\":\"' + request.object.get('pushTitle') +'\",\"fromId\":\"' + request.object.get('creater').id +'\",\"sid\":\"' + request.object.id + '\"}}';
				//console.log('message:' + str);

				var query2 = new AV.Query('_Conversation');
				query2.get('595cfbe361ff4b006476c77c').then(function(model) {

					model.send('NoticeMessage'
						,'{\"_lctype\":2,\"_lctext\":\"' + request.object.get('pushTitle') +'\",\"_lcattrs\":{\"type\":6,\"typeTitle\":\"' + request.object.get('pushTitle') +'\",\"fromId\":\"' + request.object.get('creater').id +'\",\"sid\":\"' + request.object.id + '\"}}'
						, {"toClients": arr});

				    console.log('send activity message.');
				});
				
			}
		});
	}
})

AV.Cloud.afterUpdate('BusinessApply', function(request) {
  if(request.object.get('state') == 1) {
  	//当申请商户审核通过后，把信息更新至UserDetail表中
  	var query = new AV.Query('UserDetail');
  	query.equalTo('userId',request.object.get('creater').id).first().then(function(detail) {
  		detail.set("name", request.object.get('name'));
  		detail.set("address", request.object.get('area'));
  		detail.set("address2", request.object.get('address'));
  		detail.set("phone", request.object.get('phone'));
  		detail.set("brief", request.object.get('brief'));
  		detail.save();
  		console.log('update detail done.');
  	});
  }
});

AV.Cloud.onLogin(function(request) {
  if (request.object.get('active') == false) {
    // 如果是 error 回调，则用户无法登录（收到 401 响应）
    throw new AV.Cloud.Error('该用户已被禁用');
  }
});