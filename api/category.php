<?php
require_once './lib/global.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$DB = D();

$sql = "SELECT * FROM categories";

$results = $DB->fetch_all_into_array($sql);

output($results);
exit;
?>