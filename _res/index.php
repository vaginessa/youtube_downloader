<?php
  date_default_timezone_set("Asia/Jerusalem");

  while (ob_get_level() > 0) ob_end_flush();
  mb_language("uni");
  @mb_internal_encoding('UTF-8');
  setlocale(LC_ALL, 'en_US.UTF-8');

  header('Time-Zone: Asia/Jerusalem');
  header('Charset: UTF-8');
  header('Content-Encoding: UTF-8');
  header('Content-Type: text/html; charset=UTF-8');
  header('Access-Control-Allow-Origin: *');

  $video_id = filter_input(INPUT_GET, 'video_id', FILTER_CALLBACK, ['options' => function ($value) {
    return preg_replace("#[^_0-9a-z\-]#im", "", $value);
  }]);


  /*
   * http://i1.ytimg.com/vi/BZT9AQdXnhk/mqdefault.jpg           266x150 [16:9 ratio]
   * http://i1.ytimg.com/vi/BZT9AQdXnhk/0.jpg | default.jpg     200x150 [3:4  ratio]
   * http://i1.ytimg.com/vi/BZT9AQdXnhk/1.jpg | 2.jpg           120x90  [3:4  ratio]
   */


  var_dump(
    $video_id
  );

//<html><head>
//  <style>
//    -webkit-user-select: none;
//    cursor: zoom-in;
//  </style>
//</head><body></body></html>