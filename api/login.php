<?php
require './lib/global.php';

header('Access-Control-Allow-Origin: http://blogger.com');
header('Content-Type: application/json; charset=utf-8');

$DB = D();

$email = isset($_POST['email']) ? $_POST['email'] : '';
$passwd = isset($_POST['passwd']) ? $_POST['passwd'] : '';

if ($email == '') {
    halt('无法登录: 缺少邮箱地址。', TRUE);
    exit;       
}

if ($passwd == '' || strlen($passwd) < 6) {
    halt('无法登陆： 缺少密码。', TRUE);
    exit;
}

$email = addslashes($email);
$md5Pwd = md5($passwd);

$user = $DB->result("select * FROM users WHERE email='{$email}'");

if (!$user) {
    halt('无法登陆：邮箱地址或密码错误。', TRUE);
    exit;
}

if ($user['passwd'] != $md5Pwd) {
    halt('无法登陆：邮箱地址或密码错误。', TRUE);
    exit;
}

$results = array('uid'=>$user['uid'], 'name'=>$user['name'], 'email' => $user['email'], 'groupId' => $user['groupId']);

session_start();

$_SESSION['uid'] = $user['uid'];
$_SESSION['user'] = $results; 

output($_SESSION['user']);
exit;
?>