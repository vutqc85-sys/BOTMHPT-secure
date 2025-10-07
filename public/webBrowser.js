async function webBrowser(user,passwordAuth) {
  let userName = user;
  let password = passwordAuth;
  let region = "E";
  console.log(userName);
  console.log(password);

  var requestOptions = {
    method: "POST",
    redirect: "follow",
  };

  let accessToken = "";
  let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  userName = encodeURIComponent(userName);
  password = encodeURIComponent(password);
  var result = await fetch(
    `https://m-xmjen.hkpctimes.com/api/index.php?phone_brand=oneplus&device_no=${guid}&user_name=${userName}&password=${password}&action=user.login&lang=en-US&promote=17&game_id=1704`,
    requestOptions
  );
  console.log(result.status)
  if (result.status != 200) {
    return;
  }
  console.log(2);

  var body = await result.json();
  console.log(body)
  if (!body["status"]) {
    return;
  }
  accessToken = body["token"];
  console.log(3);

  var urlrequestOptions = {
    method: "GET",
    redirect: "follow",
  };
  console.log(4);

  var urlresult = await fetch(
    `https://m-xmjen.hkpctimes.com/api/index.php?phone_brand=oneplus&device_no=${guid}&token=${accessToken}&action=game.info&lang=en-US&promote=17&id=1704`,
    urlrequestOptions
  );
  if (urlresult.status != 200) {
    return;
  }
  console.log(5);

  var urlrequestbody = await urlresult.json();
  if (!urlrequestbody["status"]) {
    return;
  }
  let gameurl = urlrequestbody["down_url"];
  if (region == "E") gameurl = gameurl + "&timeZone=+5";
  console.log(gameurl)
  window.open(gameurl, "_blank");
  // location.href = gameurl;
}