module.exports = function(env){

  if(!env){
    env = 'development';
  }

  var nickname = 'coldwar';

  var server = {
    host: '0.0.0.0',
    port: 3002,
    mount: ''
  }

  return {
    nickname: nickname,
    env: env,
    ga_id: '',
    server: server,
    docroot: ''
  };

}
