<?php
require_once './lib/global.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$DB = D();

$blogId = isset($_GET['blogId']) ? intval($_GET['blogId']) : 0;

if ($blogId == 0) {
	halt('无法加载评论: 缺少博文ID。', true);
	exit;		
}

$sql = "SELECT * FROM comments WHERE blogId={$blogId} ORDER BY commentId DESC";

$result = $DB->fetch_all_into_array($sql);

$results = array();
foreach($result as $r) {
	$r['timer'] = qtime(strtotime($r['pubdate']));	
	$results[] = $r;
}

//sleep(1);
output($results);
exit;
?>