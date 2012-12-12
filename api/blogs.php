<?php
require_once './lib/global.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$DB = D();

//$sql = "SELECT A.*, B.categoryName,C.uid,C.name FROM blogs A LEFT JOIN categories B ON A.categoryId = B.categoryId LEFT JOIN users C ON A.userId=C.uid ORDER BY A.blogId DESC";
$sql = "SELECT C.categoryName, U.uid, U.name, B.* FROM blogs B, categories C, users U WHERE B.categoryId=C.categoryId AND B.userId=U.uid ORDER BY B.blogId DESC";
$result = $DB->fetch_all_into_array($sql);

$results = array();
foreach ($result as $r) {
	$r['timer'] = qtime(strtotime($r['pubdate']));
	$results[] = $r;
}
sleep(1);
output($results);
exit;
?>