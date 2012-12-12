<?php
require_once './lib/global.php';

header('Access-Control-Allow-Origin: http://blogger.com');
header('Content-Type: application/json; charset=utf-8');

$DB = D();

$blogId = isset($_POST['blogId']) ? intval($_POST['blogId']) : 0;
$nickname = isset($_POST['nickname']) ? $_POST['nickname'] : '';
$content = isset($_POST['content']) ? $_POST['content'] : ''; 

if ($blogId == 0) {
	halt('无法发布评论: 缺少博文ID。', true);
	exit;		
}

if ($nickname == '') {
	halt('无法发布评论： 昵称没有填写。', true);
	exit;		
}

if ($content == '' || strlen($content) < 2) {
	halt('无法发布评论： 评论内容过短。', true);
	exit;
}

$add = "INSERT comments (blogId, nickname, content, pubdate) VALUE ({$blogId}, '{$nickname}', '{$content}', NOW())";
$DB->query($add);

$update = "UPDATE blogs SET comments=comments+1 WHERE blogId={$blogId}";
$DB->query($update);

$results = array();

//sleep(1);
output($results);
exit;
?>