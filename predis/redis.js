var redis = require('redis');
    // 클라이언트 객체 생성
    var client = redis.createClient();
    client.on('error', function (err) {
       console.log('Error ' + err);
    });

    // 값을 저장 (일반, 해쉬 테이블 저장)
    client.set('String Key', 'String Value', redis.print);
    client.hset('Hash Key', 'HashTest 1', '1', redis.print);
    client.hset(['Hash Key', 'HashTest 2', '2'], redis.print);

    // 값을 가져옴
    client.get('String Key', function (err, reply) {
       console.log(reply.toString());
    });

    // 해시 테이블의 값을 가져옴
    client.hkeys('Hash Key', function (err, replies) {
       console.log(replies.length + ' replies:');
       replies.forEach(function (reply, i) {
          console.log('  ' + i + ': ' + reply);
       });

    });

    // 키값으로 배열 형태로 얻음.
    client.hgetall('Hash Key', function (err, obj) {
       console.dir(obj);
    });