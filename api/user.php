<?php
require './lib/global.php';

header('Access-Control-Allow-Origin: http://blogger.com');
header('Content-Type: application/json; charset=utf-8');

session_start();

$_SESSION['uid'] = 1;
$_SESSION['user'] = array(
    'uid' => 1,
    'name' => 'Andy.Lee',
    'email' => 'andy.li@teein.com',
    'groupId' => 2,
    'statis' => array(
        'blogs' => 415,
        'comments' => 2158
    )
);

$results = array();

if (isset($_SESSION['uid']) && isset($_SESSION['user'])) {
    $results = $_SESSION['user'];
}

output($results);
exit;
?>
