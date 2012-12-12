<?php
require './lib/global.php';

header('Access-Control-Allow-Origin: http://blogger.com');
header('Content-Type: application/json; charset=utf-8');

session_start();
unset($_SESSION['uid']);
unset($_SESSION['user']);

$results = array();
output($results);
exit;
?>
