<?php
require_once './lib/global.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$DB = D();

$blogId = isset($_GET['blogId']) ? intval($_GET['blogId']) : 0;

if ($blogId == 0) {
	halt('无法加载博文: 缺少博文ID。', true);
	exit;		
}

$sql = "SELECT A.*, B.categoryName, U.name FROM blogs A LEFT JOIN categories B ON A.categoryId = B.categoryId LEFT JOIN users U ON A.userId=U.uid WHERE blogId={$blogId} ORDER BY A.blogId DESC";
$result = $DB->result($sql);

if (empty($result)) {
	halt('无法加载博文: 博文不存在。', true);
	exit;
}
$result['timer'] = qtime(strtotime($result['pubdate']));

$commentsql = "SELECT * FROM comments WHERE blogId={$blogId} ORDER BY commentId DESC";
$comments = $DB->fetch_all_into_array($commentsql);

$commentResults = array();
foreach ($comments as $r) {
	$r['timer'] = qtime(strtotime($r['pubdate']));
	$commentResults[] = $r;
}

$result['comments'] = $commentResults;

output($result);
exit;
?>