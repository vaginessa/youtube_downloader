(function () {
  "use strict";


  function process_xml(xml) {
    window.xml = xml;
  }

  var domparser = new DOMParser();
  var URL = "https://manifest.googlevideo.com/api/manifest/dash/sver/3/mv/m/signature/1125D87C2C29B613322A16EC55AC76505A5F3474.CE89956EBBDECA0B5F0949DD102B9038703827A4/pl/20/expire/1426646811/key/yt5/mm/31/sparams/as%2Cid%2Cip%2Cipbits%2Citag%2Cmm%2Cms%2Cmv%2Cpl%2Cplayback_host%2Csource%2Cexpire/id/o-AB6ioZlLkOF4_1C9ulYHcbSutZ0sPy3_ZKb8Hfy9kk7M/itag/0/as/fmp4_audio_clear%2Cwebm_audio_clear%2Cfmp4_sd_hd_clear%2Cwebm_sd_hd_clear%2Cwebm2_sd_hd_clear/ipbits/0/playback_host/r8---sn-nhpax-ua8z.googlevideo.com/fexp/900720%2C904846%2C907263%2C927622%2C930409%2C937434%2C9406922%2C9406974%2C9407103%2C9407927%2C948124%2C951511%2C951703%2C952302%2C952612%2C952901%2C955301%2C957201%2C957507%2C959701%2C961404%2C964749/ms/au/ip/77.126.203.81/upn/oNMokVkuMKI/source/youtube/mt/1426625080&___=11";

  var xhr = new XMLHttpRequest();
  xhr.responseType = "text";
  xhr.open('GET', URL, true);
  xhr.onreadystatechange = xhr.onprogress = function (e) {
    var xhr = e.target;

    if (xhr.DONE !== xhr.readyState) return;

    var xml = domparser.parseFromString(xhr.responseText, "text/xml");
    window.xml = xml;


  };
  xhr.send();
}());