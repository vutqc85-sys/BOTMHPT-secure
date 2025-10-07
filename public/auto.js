var reqid = 1;
var competeStatus = false;
var buildWStatus = false;
var breatheStatus = false;
var beastSealStatus = false;
var pantheonRewardStatus = false;
var pantheonRewardDoneStatus = false;
var pantheonChatDone = false;
var manualVisitStatus = false;
var manualInteractStatus = false;
var marketShopStatus = false;
var marketShopDoneStatus = false;
var servantAdsDoneStatus = false;
var adsDoneStatus = false;
var adsPlace = "default";
var maxItems = 10;
var cotStarted = false;
var currentMiniOn = false; 
var currentMiniName = 'none';
var currentMiniBought = 0;
var currentMiniId = 0;
var currentMiniDone = false;
var emptyBoutiqueKey = false
var rdyCsCot = true;
var rdyStormCot = true;
var rdyACsCot = true;
var hellDone = false;
var userInfos = [];
var servListInfo = [];
var currentShop = [];
var events = [];
var shop = "";
// function writeLogs(message) {
//     const actionsEl = document.getElementById('actions');
//     actionsEl.innerHTML += message + "</br>";
// }
function writeLogs(message) {
  const actionsEl = document.getElementById('actions');
  const messageEl = document.createElement('div');
  messageEl.innerHTML = message;
  actionsEl.appendChild(messageEl);
  if(actionsEl.childNodes.length > maxItems){
    actionsEl.style.overflow = "scroll";
    actionsEl.scrollTop = actionsEl.scrollHeight;
  }
}




//heartBeat
async function DoHeartBeat() {
      reqid += 1;
      heartBeatRoute = {
        "reqId": reqid + 1,
        "route": "u.ac"
      };

      let wsheartbeat = ws;
      console.log(heartBeatRoute);
      heartBeatRoute = prepareRequest(heartBeatRoute);
      let promise = new Promise((resolve, reject) => {
          wsheartbeat.send(heartBeatRoute);
          wsheartbeat.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("heartbeat");
              resolve(onMessageRecieve(event.data));

          };
          wsheartbeat.onerror = (error) => {
              console.log("error heartbeat");
              reject(error);
          };
      });
    
}

async function initWebSocket(accessToken, server) {

    return new Promise((resolve, reject) => {
        var serv = server.toString().padStart(3, '0');

        console.log("initWebSocket server");

        url = 'wss://xztwgame.hkpctimes.com/21' + serv;
        ws = new WebSocket(url);

        ws.binaryType = "arraybuffer";
        ws.addEventListener('open', function(event) {
            console.log('WebSocket is open now.');
            console.log("game version");
            console.log(gameVersion);
            if(gameVersion != null){
              let jsonobject1 = {
                'sId': server,
                'hash': accessToken,
                'ver': gameVersion,
                'reqId': 1,
                'route': 'g.enter'
              };

              console.log("g.enter");
              console.log(jsonobject1);
              jsonobject1 = prepareRequest(jsonobject1);
              ws.send(jsonobject1);
              // ws.addEventListener('message', function(event) {
              //     console.log("g.enter");
              //     console.log(onMessageRecieve(event));
              // });

              action = "user logged";
              writeLogs(action);
              resolve(event);
            } else{
              writeLogs("Missing game version");
              ws.close();
            }
            
        });
        ws.addEventListener('message', function(event) {
            

            let eventD = onMessageRecieve(event)['d'];
            let route = eventD['t'];

             if(route == "u.b"){                
                servListInfo = eventD['d'];
                console.log("#### userInfos ####");
                console.log(userInfos);
                servListInfo['heros'].forEach(function(hero) {
                    hero.totalTal = calculateTotalTal(hero);
                });

                // 3. Réorganiser le tableau en fonction de totalTal
                servListInfo['heros'].sort(function(a, b) {
                    return b.totalTal - a.totalTal; // Pour trier par ordre décroissant
                });
            }

            if(route == "at.a"){
              console.log("setting up events var");
              events = onMessageRecieve(event);
            }

            if(route == "s.a"){
              console.log("setting up currentShop var");
              currentShop = onMessageRecieve(event);
              console.log(shop);
              console.log(currentShop);
              if(shop == "sect"){
                limit = currentShop['d']['d']['list'].find(element => element.id === 101)['limit'];
                console.log("####### limit #######");
                console.log(limit);
                if(limit>0){
                    reqid +=1;
                    worshipRoute = {
                      "id": 101,
                      "shopType": shop,
                      "num": limit,
                      "reqId": reqid,
                      "route": "s.b"
                    };
                    let wsWorship = ws;
                      console.log(worshipRoute);
                      worshipRoute = prepareRequest(worshipRoute);
                      let promise = new Promise((resolve, reject) => {
                          wsWorship.send(worshipRoute);
                          wsWorship.onmessage = (event) => {
                              resolve(onMessageRecieve(event.data));
                          };
                          wsWorship.onerror = (error) => {
                              console.log("error shop "+shop);
                              reject(error);
                          };
                      });

                }
              }
            }

            if (route == "gp.g"){                
                console.log("gp.g");
                meritTOG = onMessageRecieve(event);
                console.log(meritTOG);
            }

            if (route == "mt.a"){                
                console.log("###########mt.a##########");
                demonSeal = onMessageRecieve(event);
                var availableSeal = demonSeal['d']['d']['lingya'];
                console.log(demonSeal);
                demonSeal = demonSeal['d']['d']['monsterList'];
                demonSeal.forEach(function(demonId) {
                    if(demonId['schedule'] != 0 && demonId['schedule'] != -1){
                      console.log(demonId); 
                      if(availableSeal - demonId['schedule'] > 0){                        
                        availableSeal = availableSeal - demonId['schedule'];

                        reqid += 1;
                        sfPath = {   
                          "bId": demonId['id'],
                          "type":2,
                          "reqId": reqid,
                          "route": "mt.b"
                        };
                        let sfWs = ws;
                        console.log(sfPath);
                        sfPath = prepareRequest(sfPath);

                        let promise = new Promise((resolve, reject) => {
                            sfWs.send(sfPath);
                            sfWs.onmessage = (event) => {
                              resolve(onMessageRecieve(event.data));
                            };
                            sfWs.onerror = (error) => {
                                console.log("error test");
                                reject(error);
                            };
                        });
                      }                   
                    } 
                 

                });
            }

            if (route == "mt.b"){
              console.log("mt.b");
              demonSealres = onMessageRecieve(event);
              console.log(demonSealres);

            }
            if (route == "tra.b"){
              test = onMessageRecieve(event)['d']['d']['l'];
              console.log(test[3]);
            }


            if (route == "mw.j"){
              test = onMessageRecieve(event)['d'];
              console.log(test);
            }
            let msg = eventD['d']['msg'] ?? "null"
            if (msg !== "null") {
                console.log("with msg");                
                if(eventD['t'] == 'bs.b' && eventD['d']['msg'] == "Incoming parameters are incorrect or empty" && beastSealStatus == false){
                  beastSealStatus = true;
                  writeLogs("beast seal already done");
                } 
                if(eventD['t'] == 'gld.h' && eventD['d']['msg'] == "You have constructed for alliance." && buildWStatus == false){
                  buildWStatus = true;
                  writeLogs("Build already done");
                }
                if (eventD['t'] == 'fd.b' && eventD['d']['msg'] == "Cultivating…" ) {                  
                  writeLogs("Already cultivating in FL");
                }
                if (eventD['t'] == 'ca.b') {                  
                  writeLogs(eventD['d']['msg']);
                }
                if (eventD['t'] == 'y.o' && eventD['d']['msg'] == "Incoming parameters are incorrect or empty" && hellDone == false) {  

                  writeLogs("No more attempt for hell");
                  hellDone = true;
                }
                if (eventD['t'] == 'm.h' && eventD['d']['msg'] == "You Soul is wandering now" ) {                  
                  writeLogs("You Soul is already wandering");
                }
                if (eventD['t'] == 'jjc.b' && eventD['d']['msg'] == "No challenge attempt" && competeStatus == false) {
                  competeStatus = true;
                  writeLogs("No more compete attempt");
                }
                if (eventD['t'] == 'tn.a' && eventD['d']['msg'] == "Incoming parameters are incorrect or empty" && breatheStatus == false) {
                  breatheStatus = true;
                  writeLogs("No more breathe attempt");
                }
                if (eventD['t'] == 'sp.b' && eventD['d']['msg'] == "No more attempts of using spirit pact") {                  
                  writeLogs("No more attempt for spirit pact");
                }
                if (eventD['t'] == 'sp.c' && eventD['d']['msg'] == "No more attempts of using spirit pact") {                  
                  writeLogs("No more attempt for spirit troop");
                }
                if (eventD['t'] == 'sp.c' && eventD['d']['msg'] == "Need more resource") {                  
                  writeLogs("no enough spirit pact to make spirit troop");
                }
                if (eventD['t'] == 'cg.dtb' && pantheonRewardStatus == false) {  
                  pantheonRewardStatus = true;
                  writeLogs("Have not reached requirement to claim reward or No more reward");
                }
                if (eventD['t'] == 's.b'  && eventD['d']['mp'][1] == 'sect' && eventD['d']['mp'][2] == 402) {  
                  writeLogs("Can't buy " + eventD['d']['mp'][3] + " Beast forage since quantity left is either 0 or under this value");
                }
                if (eventD['t'] == 's.b'  && eventD['d']['mp'][1] == 'sect' && eventD['d']['mp'][2] == 405) { 
                  writeLogs("Can't buy " + eventD['d']['mp'][3] + " Heaven int. pill since quantity left is either 0 or under this value");
                }
                if (eventD['t'] == 's.b'  && eventD['d']['mp'][1] == 'sect' && eventD['d']['mp'][2] == 406) {  
                  writeLogs("Can't buy " + eventD['d']['mp'][3] + " Heaven Crystal  since quantity left is either 0 or under this value");
                }
                if (eventD['t'] == 's.b'  && eventD['d']['msg'] == "Need more resource") { 
                  if(eventD['d']['mp'][2] == 'mcb'){
                    writeLogs("Need more merit, require:" + eventD['d']['mp'][0] + " but only have: " + eventD['d']['mp'][1]);
                  } else {
                    writeLogs(eventD['d']['msg']);
                  }                  
                }           
                if(eventD['t'] == 'at.sb' && eventD['d']['msg'] == "Parameter error" && servantAdsDoneStatus == false){
                  servantAdsDoneStatus=true;
                  writeLogs("No more servant ads");
                };

                if(eventD['t'] == 'at.ay' && adsDoneStatus == false){
                  adsDoneStatus=true;
                  writeLogs(eventD['d']['msg']);
                  console.log("1 ads tried");
                  console.log(eventD);
                };
                if(eventD['t'] == 'at.ay' && eventD['d']['msg'] == "You don't have any more viewing time."){
                  writeLogs("ads already running");
                };
                if(eventD['t'] == 'at.ay' && eventD['d']['msg'] == "Parameter error"){
                  writeLogs("no more ads for this type of ads");
                };
                if(eventD['t'] == 'at.w' && eventD['d']['msg'] == "Insufficient Storage"){
                  console.log(eventD['d']['mp']['activityName'])
                  // currentMiniDone = true;
                  // currentMiniOn = true;
                  // writeLogs("No more mini event items in shop");   
                  // console.log(eventD['d']);               
                  // currentMiniId.push(eventD['d']['mp']['id']);
                  
                };
                if(eventD['t'] == 'at.lh' && eventD['d']['msg'] == "Insufficient items"){
                  writeLogs("Mini event already done");   
                };
                if(eventD['t'] == 'at.paha' && eventD['d']['msg'] == "Insufficient items"){
                  writeLogs("Peach event done");   
                };
                if(eventD['t'] == 'fan.b' && eventD['d']['msg'] == "Insufficient items"){
                  writeLogs("No more boutique keys to use");
                  emptyBoutiqueKey = true;   
                };

                if(eventD['t'] == 'xfcc.a' && eventD['d']['msg'] == "Incoming parameters are incorrect or empty"){
                  writeLogs("CS cot not on");
                  rdyCsCot = false;
                }
                if(eventD['t'] == 'xfc.a' && eventD['d']['msg'] == "Incoming parameters are incorrect or empty"){
                  writeLogs("ACS cot not on");
                  rdyACsCot = false;
                }
                if(eventD['t'] == 'm.m'){
                  console.log("in m.m");
                  console.log(eventD);
                }

                if(eventD['t'] == 'xsm.l' && eventD['d']['msg'] == "In cooldown time"){
                  writeLogs("SwordFly In cooldown time");
                }
                if(eventD['t'] == 'ml.e' && eventD['d']['msg'] == "Incoming parameters are incorrect or empty"){
                  writeLogs("No mail to delete");
                }
                if(eventD['t'] == 'abn.g' && eventD['d']['msg'] == "No challenge attempt"){
                  writeLogs("No more VV attempt");
                }


            } else {
                if(eventD['t'] == 'bs.b' && beastSealStatus == false){
                  beastSealStatus = true;
                  writeLogs("Beast seal done");
                };
                if(eventD['t'] == 'gld.h' && buildWStatus == false){
                  buildWStatus = true;
                  writeLogs("Build alliance wood done");
                };
                if(eventD['t'] == 'fd.b'){
                  writeLogs("FL started");
                };
                if(eventD['t'] == 'm.h'){
                  writeLogs("Adventure level 20 x60 started");
                };
                if(eventD['t'] == 'jjc.b' && competeStatus == false){
                  competeStatus = true;
                  writeLogs("Compete done");
                };
                if(eventD['t'] == 'tn.a' && breatheStatus == false){
                  breatheStatus = true;
                  writeLogs("Breathe done");
                };
                if(eventD['t'] == 'ca.b' ){
                  writeLogs("Worship done");
                };
                if(eventD['t'] == 'y.o' ){
                  writeLogs("Hell done");
                };
                if(eventD['t'] == 'sp.b' ){
                  writeLogs("spirit pact done");
                };
                if(eventD['t'] == 'sp.c' ){
                  writeLogs("spirit troop done");
                };
                if(eventD['t'] == 'ch.t' ){
                  writeLogs("pantheon chat done");
                };
                if(eventD['t'] == 'yf.a' ){
                  const visitPower = eventD['d']['power'];
                  if (visitPower != 0){
                    writeLogs(visitPower + " visit available");
                    doVisit(visitPower);
                  } else {
                    writeLogs("No visit attempt available");
                  }                  
                };
                if(eventD['t'] == 'yf.b' && manualVisitStatus == false){
                  manualVisitStatus = true;
                  writeLogs("manual visit done");
                };

                if(eventD['t'] == 'wo.u' ){
                  const interactNumber = eventD['d']['c']['Wood.getInfo']['@s.canNum'];
                  console.log("interactNumber");
                  console.log(interactNumber);
                  if (interactNumber != 0){
                     writeLogs(interactNumber + " interact available");
                     doInteract(interactNumber);
                  } else {
                    writeLogs("No interact attempt available");
                  }                 
                };

                if(eventD['t'] == 'wo.b' && manualInteractStatus == false){
                  manualInteractStatus = true;
                  writeLogs("manual interact done");
                };
                if(eventD['t'] == 'wo.c'){
                  writeLogs("accompany pet done");
                };
                if(eventD['t'] == 'cg.dtb' && pantheonRewardDoneStatus == false){
                  pantheonRewardDoneStatus = true;
                  writeLogs("get pantheon reward");
                };             
                if(eventD['t'] == 's.b' && marketShopDoneStatus == false){
                  marketShopDoneStatus = true;
                  writeLogs("Resources bought");
                };           
                if(eventD['t'] == 'at.sb'){
                  writeLogs("1 servant ads done");
                };
                try {
                  adsPlace = eventD['d']['c']['Activity.getList']['l']['@f_id_@shareSwitch']['ids'];
                } catch (error) {
                }
                if (adsPlace != "default" && adsPlace !== undefined){
                  if(eventD['t'] == 'at.ay' && adsPlace['xianGe'] !== undefined){
                  writeLogs("1 PavMarket ads done");
                  console.log("1 PavMarket done");
                  console.log(eventD);
                  };           
                  if(eventD['t'] == 'at.ay' && adsPlace['blackMarket'] !== undefined){
                    writeLogs("1 blackMarket ads done");
                    console.log("1 blackMarket ads done");
                    console.log(eventD);
                  };          
                  if(eventD['t'] == 'at.ay' && adsPlace['robe'] !== undefined){
                    writeLogs("1 boutique ads done");
                    console.log("1 boutique ads done");
                    console.log(eventD);
                  };          
                  if(eventD['t'] == 'at.ay' && adsPlace['shopRecharge'] !== undefined){
                    writeLogs("1 blackMarket SJ ads done");
                    console.log("1 blackMarket SJ ads done");
                    console.log(eventD);
                  };         
                  if(eventD['t'] == 'at.ay' && adsPlace['home'] !== undefined){
                    writeLogs("1 dwelling ads done");
                    console.log("1 dwelling ads done");
                    console.log(eventD);
                  };         
                  if(eventD['t'] == 'at.ay' && adsPlace['lingShanItem'] !== undefined){
                    writeLogs("1 mountain ads done");
                    console.log("1 mountain ads done");
                    console.log(eventD);
                  };
                } else{
                  if(eventD['t'] == 'at.ay'){
                    writeLogs("1 ads done");
                    console.log("-------- 1 done ---------");
                    console.log(eventD);
                  }; 
                }
                if(eventD['t'] == "onAdd"){
                  console.log("user logged");
                  try{
                    const merit = eventD['d']['c']['User.getInfo']['i']['@s.mcb']
                  }catch(error){}
                }

                if(eventD['t'] == 'xf.a' && eventD['d']['def']['eId'] == 0){

                  setTimeout(function() {
                    console.log("Après 1 seconde");
                    writeLogs("CoT Battle not rdy");
                  }, 1000);
                  
                };

                // if(eventD['t'] == 'xfcc.a' && eventD['d']['def']['eId'] == 0){

                //   setTimeout(function() {
                //     console.log("Après 1 seconde");
                //   }, 1000);
                //   writeLogs("CS CoT Battle not rdy");
                // };
                if(eventD['t'] == 'xf.a' && eventD['d']['def']['eId'] != 0 && cotStarted == false){
                  cotStarted = true;
                  writeLogs("Starting CoT Battle");
                };
                if(eventD['t'] == 'xf.a'){
                  reqid += 1;
                }
                if(eventD['t'] == 'u.b'){
                  userInfos = eventD;
                  console.log("------------- in u.b userinfos");
                  console.log(userInfos);
                }
                try{
                    if(eventD['t'] == 'xf.a' && eventD['d']['end'] == 1 && eventD['d']['fightLog']['w'] == 1){
                      //writeLogs("Local CoT won");
                      console.log("Local CoT win");
                      console.log(eventD['d']);
                    }
                    if(eventD['t'] == 'xf.a' && eventD['d']['end'] == 1 && eventD['d']['fightLog']['w'] == 0){
                      //writeLogs("Local CoT lost");
                      console.log("Local CoT loose");
                      console.log(eventD['d']);
                    }

                }catch(error){}

                try{
                    if(eventD['t'] == 'xf.c' && eventD['d']['end'] == 1 && eventD['d']['fightLog']['w'] == 1){
                      setTimeout(function() {
                        console.log("Après 1 seconde");
                        writeLogs("Local CoT won");

                      }, 1000);
                      console.log("Local CoT won");
                      console.log(eventD['d']);
                    }
                    if(eventD['t'] == 'xf.c' && eventD['d']['end'] == 1 && eventD['d']['fightLog']['w'] == 0){
                      setTimeout(function() {

                        var lastServId = eventD['d']['fightLog']['f']['def']['hId'];                      
                        var lastServMH = eventD['d']['fightLog']['f']['def']['attr']['maxHp'];                      
                        var lastServLvl = eventD['d']['fightLog']['f']['def']['lv'];                      
                        writeLogs("died vs " + servantList[lastServId-1]['name'] + "," + lastServMH.toLocaleString("da-DK") + "," + lastServLvl);

                        console.log("Après 1 seconde");
                        writeLogs("Local CoT lost");
                      }, 1000);
                      console.log("Local CoT lost");
                      
                      console.log(eventD['d']);
                    }

                }catch(error){}
                try{
                    if(eventD['t'] == 'xfcc.c' && eventD['d']['end'] == 1 && eventD['d']['fightLog']['w'] == 1){
                      setTimeout(function() {
                        console.log("Après 1 seconde");
                        writeLogs("CS CoT won");

                      }, 1000);
                      console.log("CS CoT won");
                      console.log(eventD['d']);
                    }
                    if(eventD['t'] == 'xfcc.c' && eventD['d']['end'] == 1 && eventD['d']['fightLog']['w'] == 0){
                      setTimeout(function() {
                        var lastServId = eventD['d']['fightLog']['f']['def']['hId'];                      
                        var lastServMH = eventD['d']['fightLog']['f']['def']['attr']['maxHp'];                      
                        var lastServLvl = eventD['d']['fightLog']['f']['def']['lv'];                      
                        writeLogs("died vs " + servantList[lastServId-1]['name'] + "," + lastServMH.toLocaleString("da-DK") + "," + lastServLvl);

                        console.log("Après 1 seconde");
                        writeLogs("CS CoT lost");


                      }, 1000);
                      console.log("CS CoT lost");
                      
                      console.log(eventD['d']);
                    }

                }catch(error){}
                try{
                    if(eventD['t'] == 'xfc.c' && eventD['d']['end'] == 1 && eventD['d']['fightLog']['w'] == 1){
                      setTimeout(function() {
                        console.log("Après 1 seconde");
                      }, 1000);
                      writeLogs("ACS CoT won");
                      console.log("ACS CoT won");
                      console.log(eventD['d']);
                    }
                    if(eventD['t'] == 'xfc.c' && eventD['d']['end'] == 1 && eventD['d']['fightLog']['w'] == 0){
                      setTimeout(function() {
                        console.log("Après 1 seconde");

                        var lastServId = eventD['d']['fightLog']['f']['def']['hId'];                      
                        var lastServMH = eventD['d']['fightLog']['f']['def']['attr']['maxHp'];                      
                        var lastServLvl = eventD['d']['fightLog']['f']['def']['lv'];                      
                        writeLogs("died vs " + servantList[lastServId-1]['name'] + "," + lastServMH.toLocaleString("da-DK") + "," + lastServLvl);                        
                        writeLogs("ACS CoT lost");
                        console.log("ACS CoT lost");
                      }, 1000);
                      
                      console.log(eventD['d']);
                    }

                }catch(error){}

                if(eventD['t'] == 'at.w' && currentMiniOn == false){
                  currentMiniOn = true;
                  var shopObject = eventD['d']['c']['Activity.getList']['l'];
                  // Récupérer la première clé de l'objet (ici "@f_id_@miningShop")
                  var ShopKey = Object.keys(shopObject)[0];
                  // Récupérer la deuxième clé de l'objet (ici "@f_id_@701")
                  var itemId = Object.keys(shopObject[ShopKey]["l"])[0];
                  // Récupérer la valeur de "@s.num"
                  currentMiniBought = shopObject[ShopKey]["l"][itemId]["@s.num"];
                  currentMiniName = Object.keys(shopObject).filter(key => key.match(/^@f_id_@(.+)/))[0].replace(/^@f_id_@/, '');
                  currentMiniId = Object.keys(shopObject[ShopKey]["l"]).filter(key => key.match(/^@f_id_@(.+)/))[0].replace(/^@f_id_@/, '');
                }
                if(eventD['t'] == 'at.lh'){
                  var score = eventD['d']['score'];
                  writeLogs("Mini event done, score: +"+score);
                }
                  // console.log("not msg");
                  // console.log(eventD);
                
                
                if(eventD['t'] == 'm.m'){
                  console.log("in m.m");
                  console.log(eventD);
                }

                if(eventD['t'] == 'ml.d'){
                  try{
                      console.log("ml.d writelog");
                      if(Object.keys(eventD['d']['c']['Mail.getList']['l']).length > 0){
                        writeLogs(Object.keys(eventD['d']['c']['Mail.getList']['l']).length + " mails read");
                      }
                  }catch(error){
                    writeLogs("No mail to read");
                  }
                }
                if(eventD['t'] == 'ml.e'){
                  try{
                      console.log("ml.e writelog");
                      if(Object.keys(eventD['d']['c']['Mail.getList']['l']).length > 0){
                        writeLogs(Object.keys(eventD['d']['c']['Mail.getList']['l']).length + " mails deleted");
                      }
                  }catch(error){
                    writeLogs("no mail to delete");
                  }
                }

                if(eventD['t'] == 'abn.g'){
                  writeLogs("VV done x5");
                }
            };


            // Vous pouvez ajouter ici la logique pour traiter la réponse reçue
        });
        ws.addEventListener('error', function(event) {
            console.log(onMessageRecieve(event));
            reject(event);
        });

        ws.addEventListener('close', (event) => {
          console.log(event);
          writeLogs('User unlogged');
        });
    });
}

function calculateTotalTal(hero) {
    return hero.atk + hero.datk + hero.matk + hero.travel;
}


async function sendRequest(jsonobject) {
    return new Promise((resolve, reject) => {
        if (ws.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket is not open.'));
        } else {
            jsonobject = prepareRequest(jsonobject);
            ws.send(jsonobject);
            ws.addEventListener('message', function(event) {
                console.log(onMessageRecieve(event));
                resolve(event);
            });
            ws.addEventListener('error', function(event) {
                reject(event);
            });
        }
    });
}

async function autoSealDemon(bid) {
      reqid += 1;
      sfPath = {   
        "bId": bId,
        "type":2,
        "reqId": reqid,
        "route": "mt.b"
      };
      let sfWs = ws;
      console.log(sfPath);
      sfPath = prepareRequest(sfPath);

      let promise = new Promise((resolve, reject) => {
          sfWs.send(sfPath);
          sfWs.onmessage = (event) => {
            resolve(onMessageRecieve(event.data));
          };
          sfWs.onerror = (error) => {
              console.log("error test");
              reject(error);
          };
      });
}
async function doShopPath(shopType,path) {
      reqid += 1;
      sfPath = {   
        "shopType": shopType,
        "reqId": reqid,
        "route": path
      };
      let sfWs = ws;
      console.log(sfPath);
      sfPath = prepareRequest(sfPath);

      let promise = new Promise((resolve, reject) => {
          sfWs.send(sfPath);
          sfWs.onmessage = (event) => {
            resolve(onMessageRecieve(event.data));
          };
          sfWs.onerror = (error) => {
              console.log("error test");
              reject(error);
          };
      });
}

async function weedTree(id, playerId) {
    playerId = playerId.toString();
    let weed = {
        "plType": 4,
        "id": id,
        "duId": playerId,
        "reqId": reqid,
        "route": "or.e"
    };

    weed = prepareRequest(weed);
    ws3 = ws;
    ws3.send(weed);
    return new Promise(resolve => {
        ws3.addEventListener('message', function(event) {
            resolve(event); // Renvoie une promesse résolue lorsque le message est reçu
        });
        reqid += 1;
    });
}


async function waterTree(id, playerId) {
    playerId = playerId.toString();
    let water = {
        "plType": 2,
        "id": id,
        "duId": playerId,
        "reqId": reqid,
        "route": "or.e"
    };

    console.log(water);
    water = prepareRequest(water);
    ws2 = ws;
    ws2.send(water);
    return new Promise(resolve => {
        ws2.addEventListener('message', function(event) {
            resolve(event); // Renvoie une promesse résolue lorsque le message est reçu
        });
        reqid += 1;
    });
}
async function doFriendTree(settings) {
    if (settings['doTreeCheckbox'] == true && settings['doTreeIds'] != null) {
        let idsArray = settings['doTreeIds'].split(",");
        for (let idarray of idsArray) {
            for (let i = 1; i < 5; i++) {
                try {
                    let result = await new Promise(resolve => {
                        setTimeout(async () => {
                            let waterResult = await waterTree(i, idarray);
                            resolve(waterResult);
                        }, 2000); // Attendre 2 secondes avant d'appeler waterTree
                    });
                    writeLogs("waterTree num: " + i + ", for id: " + idarray);
                    if (onMessageRecieve(result)['d']['d']['msg'] !== undefined) {
                        writeLogs(onMessageRecieve(result)['d']['d']['msg']);
                    }
                    //console.log(onMessageRecieve(result)['d']['d']['msg']); // Afficher le résultat de waterTree ici
                } catch (error) {
                    console.error(error); // Gérer les erreurs ici
                }
            }
            for (let i = 1; i < 5; i++) {
                try {
                    let resultweed = await new Promise(resolve => {
                        setTimeout(async () => {
                            let weedResult = await weedTree(i, idarray);
                            resolve(weedResult);
                        }, 2000); // Attendre 2 secondes avant d'appeler waterTree
                    });
                    console.log("result weedTree");
                    writeLogs("weedTree num: " + i + ", for id: " + idarray);
                    if (onMessageRecieve(resultweed)['d']['d']['msg'] !== undefined) {
                        console.log(onMessageRecieve(resultweed));
                        writeLogs(onMessageRecieve(resultweed)['d']['d']['msg']);
                    }
                    //console.log(onMessageRecieve(result)['d']['d']['msg']); // Afficher le résultat de waterTree ici
                } catch (error) {
                    console.error(error); // Gérer les erreurs ici
                }
            }
        }
    }

}



async function doTypePath(type,path){
  reqid += 1;
  sfPath = {   
    "type": type,
    "reqId": reqid,
    "route": path
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);


  let promise = new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
        resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error test");
          reject(error);
      };
  });
}


function getCurrentDay() {
    // Récupération de la date actuelle
    let date = new Date();

    // Création d'un objet de date avec la timezone de Hong Kong (GMT+8)
    let hongKongDate = new Date(date.toLocaleString('en-US', {
        timeZone: 'Asia/Hong_Kong'
    }));


    // Récupération du numéro du jour de la semaine
    let dayOfWeekIndex = hongKongDate.getDay();

    // Affichage du nom du jour de la semaine en anglais
    return dayOfWeekIndex;
}

async function doBeast(beastLevel) {
    let currentDay = getCurrentDay();
    let promises = [];
    console.log(currentDay);
    
    for (let i = 0; i < 3; i++) {
        if (currentDay !== 0 && currentDay !== 6) {
            beastRoute = {
                "id": currentDay,
                "lv": parseInt(beastLevel),
                "reqId": reqid + 1,
                "route": "bs.b"
            };
        } else {
            beastRoute = {
                "id": 3,
                "lv": parseInt(beastLevel),
                "reqId": reqid + 1,
                "route": "bs.b"
            };
        }

        let wsBeast = ws;
        console.log(beastRoute);
        beastRoute = prepareRequest(beastRoute);
        let promise = new Promise((resolve, reject) => {
            wsBeast.send(beastRoute);
            wsBeast.onmessage = (event) => {
                //console.log(onMessageRecieve(event.data));
                console.log("beast done");
                resolve(onMessageRecieve(event.data));

            };
            wsBeast.onerror = (error) => {
                console.log("error beast");
                reject(error);
            };
        });
    }
}

async function doBuildWood() {
  
    for (let i = 0; i < 5; i++) {
      buildWRoute = {
          "id": 1,
          "reqId": reqid + 1,
          "route": "gld.h"
      };

      let wsBuildWood = ws;
      console.log(buildWRoute);
      buildWRoute = prepareRequest(buildWRoute);
      let promise = new Promise((resolve, reject) => {
          wsBuildWood.send(buildWRoute);
          wsBuildWood.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("Build wood done");
              resolve(onMessageRecieve(event.data));

          };
          wsBuildWood.onerror = (error) => {
              console.log("error build wood");
              reject(error);
          };
      });
    }
}


async function doHellAction(){
  hellRoute = {
      "num": 1,
      "reqId": reqid + 1,
      "route": "y.o"
  };

  let wsHell = ws;
  console.log(hellRoute);
  hellRoute = prepareRequest(hellRoute);
  let promise = new Promise((resolve, reject) => {
      wsHell.send(hellRoute);
      wsHell.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("Hell done");
          resolve(onMessageRecieve(event.data));

      };
      wsHell.onerror = (error) => {
          console.log("error hell");
          reject(error);
      };
  });
}

async function doHell(atNum) {
  for(i=0;i<atNum;i++){
    await doHellAction();
    await new Promise(resolve => setTimeout(resolve,1000));
  }
}



async function doCompete() {
    for (let i = 0; i < 10; i++) {
      reqid += 1;
      competeRoute = {
          "rank":"200",
          "reqId": reqid + 1,
          "route": "jjc.b"
      };

      let wsCompete = ws;
      console.log(competeRoute);
      competeRoute = prepareRequest(competeRoute);
      let promise = new Promise((resolve, reject) => {
          wsCompete.send(competeRoute);
          wsCompete.onmessage = (event) => {
              console.log(onMessageRecieve(event.data));
              console.log("Compete done");
              resolve(onMessageRecieve(event.data));

          };
          wsCompete.onerror = (error) => {
              console.log("error compete");
              reject(error);
          };
      });
    }
}

async function doBreathe() {
    for (let i = 0; i < 5; i++) {
      reqid +=1;
      breatheRoute = {
          "reqId": reqid,
          "route": "tn.a"
      };

      let wsBreathe = ws;
      console.log(breatheRoute);
      breatheRoute = prepareRequest(breatheRoute);
      let promise = new Promise((resolve, reject) => {
          wsBreathe.send(breatheRoute);
          wsBreathe.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("Breathing done");
              resolve(onMessageRecieve(event.data));

          };
          wsBreathe.onerror = (error) => {
              console.log("error Breathing");
              reject(error);
          };
      });
    }
}


async function doWorship(worshipId) {
      reqid +=1;
      worshipRoute = {
          "worshipUId": worshipId,
          "reqId": reqid,
          "route": "ca.b"
      };

      let wsWorship = ws;
      console.log(worshipRoute);
      worshipRoute = prepareRequest(worshipRoute);
      let promise = new Promise((resolve, reject) => {
          wsWorship.send(worshipRoute);
          wsWorship.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("worship done");
              resolve(onMessageRecieve(event.data));

          };
          wsWorship.onerror = (error) => {
              console.log("error worship");
              reject(error);
          };
      });
}

async function doSpiritPact(numSP) {
      reqid +=1;
      spiritPactRoute = {
          "num": numSP,
          "reqId": reqid + 1,
          "route": "sp.b"
      };

      let wsSpiritPact = ws;
      console.log(spiritPactRoute);
      spiritPactRoute = prepareRequest(spiritPactRoute);
      let promise = new Promise((resolve, reject) => {
          wsSpiritPact.send(spiritPactRoute);
          wsSpiritPact.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log(numSP + " spirit pact done");
              resolve(onMessageRecieve(event.data));

          };
          wsSpiritPact.onerror = (error) => {
              console.log("error wsSpiritPact");
              reject(error);
          };
      });
}
async function doSpiritTroop(numST) {
      reqid +=1;
      spiritTroopRoute = {
          "num": numST,
          "reqId": reqid + 1,
          "route": "sp.c"
      };

      let wsSpiritTroop = ws;
      console.log(spiritTroopRoute);
      spiritTroopRoute = prepareRequest(spiritTroopRoute);
      let promise = new Promise((resolve, reject) => {
          wsSpiritTroop.send(spiritTroopRoute);
          wsSpiritTroop.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log(numST + " spirit troop done");
              resolve(onMessageRecieve(event.data));

          };
          wsSpiritTroop.onerror = (error) => {
              console.log("error wsSpiritTroop");
              reject(error);
          };
      });
}

async function flPage(){
  flCheck = {
      "reqId": reqid + 1,
      "route": "fd.a"
  };
  let wsCheckFL = ws;
  console.log(flCheck);
  flCheck = prepareRequest(flCheck);
  let promiseCheck = new Promise((resolve, reject) => {
      wsCheckFL.send(flCheck);
      wsCheckFL.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("check FL");
          resolve(onMessageRecieve(event.data));

      };
      wsCheckFL.onerror = (error) => {
          console.log("error check FL");
          reject(error);
      };
  });
}

async function flCurrentlyCultivating() {
  flCheck = {
      "reqId": reqid + 1,
      "route": "fd.f"
  };
  let wsCheckFL = ws;
  console.log(flCheck);
  flCheck = prepareRequest(flCheck);
  let promiseCheck = new Promise((resolve, reject) => {
      wsCheckFL.send(flCheck);
      wsCheckFL.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("check FL");
          resolve(onMessageRecieve(event.data));

      };
      wsCheckFL.onerror = (error) => {
          console.log("error check FL");
          reject(error);
      };
  });

}
async function flGetReward() {
  flCheck = {
    "type":1,
    "reqId": reqid + 1,
    "route": "fd.e"
  };
  let wsCheckFL = ws;
  console.log(flCheck);
  flCheck = prepareRequest(flCheck);
  let promiseCheck = new Promise((resolve, reject) => {
      wsCheckFL.send(flCheck);
      wsCheckFL.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("check FL");
          resolve(onMessageRecieve(event.data));

      };
      wsCheckFL.onerror = (error) => {
          console.log("error check FL");
          reject(error);
      };
  });

}



async function doFL() {
  
  await flPage();
  await flCurrentlyCultivating();
  await flGetReward();



  await new Promise(resolve => setTimeout(resolve,1000)) 

  reqid +=1;
  //cultivate FL
  FLRoute = {
      "reqId": reqid + 1,
      "route": "fd.b"
  };

  let wsDoFL = ws;
  console.log(FLRoute);
  FLRoute = prepareRequest(FLRoute);
  let promise = new Promise((resolve, reject) => {
      wsDoFL.send(FLRoute);
      wsDoFL.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("Do FL");
          resolve(onMessageRecieve(event.data));

      };
      wsDoFL.onerror = (error) => {
          console.log("error FL");
          reject(error);
      };
  });    
}



async function doPantheonChat(words) {
      reqid +=1;
      pantheonChatRoute = {
          "msg":words,
          "encode":1,
          "card":0,
          "rankType":"crossDebateRank",
          "reqId": reqid + 1,
          "route": "ch.t"
      };

      let wsPantheonChat = ws;
      console.log(pantheonChatRoute);
      pantheonChatRoute = prepareRequest(pantheonChatRoute);
      let promise = new Promise((resolve, reject) => {
          wsPantheonChat.send(pantheonChatRoute);
          wsPantheonChat.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("Do pantheon chat");
              resolve(onMessageRecieve(event.data));

          };
          wsPantheonChat.onerror = (error) => {
              console.log("error pantheon chat");
              reject(error);
          };
      });    
}


async function doPantheonReward() {
    for (let i = 1; i < 16; i++) {
      reqid +=1;
      console.log("pantheonReward " + i);
      pantheonRewardRoute = {
          "id": i,
          "reqId": reqid + 1,
          "route": "cg.dtb"
      };

      let wsPantheonReward = ws;
      console.log(pantheonRewardRoute);
      pantheonRewardRoute = prepareRequest(pantheonRewardRoute);
      let promise = new Promise((resolve, reject) => {
          wsPantheonReward.send(pantheonRewardRoute);
          wsPantheonReward.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("Pantheon reward done");
              resolve(onMessageRecieve(event.data));

          };
          wsPantheonReward.onerror = (error) => {
              console.log("error pantheon reward");
              reject(error);
          };
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    }
}

async function doPantheonRewardChest() {
    for (let i = 101; i < 106; i++) {
      reqid +=1;
      pantheonRewardChestRoute = {
          "id": i,
          "reqId": reqid + 1,
          "route": "cg.dtb"
      };

      let wsPantheonRewardChest = ws;
      console.log(pantheonRewardChestRoute);
      pantheonRewardChestRoute = prepareRequest(pantheonRewardChestRoute);
      let promise = new Promise((resolve, reject) => {
          wsPantheonRewardChest.send(pantheonRewardChestRoute);
          wsPantheonRewardChest.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("Pantheon reward chest done");
              resolve(onMessageRecieve(event.data));

          };
          wsPantheonRewardChest.onerror = (error) => {
              console.log("error pantheon reward chest");
              reject(error);
          };
      });
    }
}

async function getVisitNumber() {
    reqid +=1;
    visitPageRoute = {
          "reqId": reqid + 1,
          "route": "yf.a"
    };


    let wsVisit = ws;
    console.log(visitPageRoute);
    visitPageRoute = prepareRequest(visitPageRoute);
    let promiseVisit = new Promise((resolve, reject) => {
        wsVisit.send(visitPageRoute);
        wsVisit.onmessage = (event) => {
            //console.log(onMessageRecieve(event.data));
            console.log("VisitePage");
            resolve(onMessageRecieve(event.data));

        };
        wsVisit.onerror = (error) => {
            console.log("error VisitePage");
            reject(error);
        };
    });
}

async function doVisit(number) {
    for (let i = 0; i < number; i++) {
      reqid +=1;
      visitRoute = {
            "type":0,
            "reqId": reqid + 1,
            "route": "yf.b"
      };


      let wsVisit = ws;
      console.log(visitRoute);
      visitRoute = prepareRequest(visitRoute);
      let promiseVisit = new Promise((resolve, reject) => {
          wsVisit.send(visitRoute);
          wsVisit.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("Visite manual");
              resolve(onMessageRecieve(event.data));

          };
          wsVisit.onerror = (error) => {
              console.log("error manual visit");
              reject(error);
          };
      });
    }
}

async function getInteractNumber() {
    reqid +=1;
    interactPageRoute = {
          "reqId": reqid + 1,
          "route": "wo.u"
    };


    let wsInteract = ws;
    console.log(interactPageRoute);
    interactPageRoute = prepareRequest(interactPageRoute);
    let promise = new Promise((resolve, reject) => {
        wsInteract.send(interactPageRoute);
        wsInteract.onmessage = (event) => {
            //console.log(onMessageRecieve(event.data));
            console.log("VisitePage");
            resolve(onMessageRecieve(event.data));

        };
        wsInteract.onerror = (error) => {
            console.log("error VisitePage");
            reject(error);
        };
    });
}

async function doInteract(number) {
    for (let i = 0; i < number; i++) {
      reqid +=1;
      interactRoute = {
            "reqId": reqid + 1,
            "route": "wo.b"
      };


      let wsDoInteract = ws;
      console.log(interactRoute);
      interactRoute = prepareRequest(interactRoute);
      let promiseVisit = new Promise((resolve, reject) => {
          wsDoInteract.send(interactRoute);
          wsDoInteract.onmessage = (event) => {
              console.log("Interact manual");
              resolve(onMessageRecieve(event.data));

          };
          wsDoInteract.onerror = (error) => {
              console.log("error manual interact");
              reject(error);
          };
      });
    }
}


//Market Immortal Beast resources
async function buyBeastMarketResources(id,quantity) {
    reqid +=1;
    marketPageRoute = {
      "id":id,
      "shopType": "sect",
      "num": quantity,
      "reqId": reqid + 1,
      "route": "s.b"
    };

    let wsCheckMarket = ws;
    console.log(marketPageRoute);
    marketPageRoute = prepareRequest(marketPageRoute);
    let test = new Promise((resolve, reject) => {
        wsCheckMarket.send(marketPageRoute);
        wsCheckMarket.onmessage = (event) => {
            resolve(onMessageRecieve(event.data));
        };
        wsCheckMarket.onerror = (error) => {
            console.log("error buy market beast resources");
            reject(error);
        };
    });
}

async function doUnlimitedAllianceShop(idProp,quantity) {
      reqid +=1;
      guildShoproute = {
        "id": idProp,
        "num":quantity,
        "shopType":"guild",
        "reqId": reqid + 1,
        "route": "s.b"
      };  
      let wsAllianceShop = ws;
      console.log(guildShoproute);
      guildShoproute = prepareRequest(guildShoproute);
      let promise = new Promise((resolve, reject) => {
          wsAllianceShop.send(guildShoproute);
          wsAllianceShop.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("limited shop done");
              resolve(onMessageRecieve(event.data));

          };
          wsAllianceShop.onerror = (error) => {
              console.log("error limited shop");
              reject(error);
          };
      });
    
}


async function doHellShop(idProp,quantity) {
      reqid +=1;
      hellShoproute = {
        "id": idProp,
        "num":quantity,
        "shopType":"jiuyou",
        "reqId": reqid + 1,
        "route": "s.b"
      };  
      let wsHellShop = ws;
      console.log(hellShoproute);
      hellShoproute = prepareRequest(hellShoproute);
      let promise = new Promise((resolve, reject) => {
          wsHellShop.send(hellShoproute);
          wsHellShop.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("limited shop done");
              resolve(onMessageRecieve(event.data));

          };
          wsHellShop.onerror = (error) => {
              console.log("error limited shop");
              reject(error);
          };
      });    
}

async function doXTShop() {
    let ids = [1,2,3,4,5,6,7,8];
    for (let i = 0; i < ids.length; i++) {
      reqid +=1;
      if(ids[i] == 1 || ids[i] == 2){
        xtShoproute = {
          "id": ids[i],
          "num":1,
          "shopType":"worldBoss",
          "reqId": reqid + 1,
          "route": "s.b"
        };
      } else {
        xtShoproute = {
          "id": ids[i],
          "num":3,
          "shopType":"worldBoss",
          "reqId": reqid + 1,
          "route": "s.b"
        };
      }


      let wsXTShop = ws;
      console.log(xtShoproute);
      xtShoproute = prepareRequest(xtShoproute);
      let promise = new Promise((resolve, reject) => {
          wsXTShop.send(xtShoproute);
          wsXTShop.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("limited XT shop done");
              resolve(onMessageRecieve(event.data));

          };
          wsXTShop.onerror = (error) => {
              console.log("error limited XT shop");
              reject(error);
          };
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    }
}



async function doLimitedAllianceShop() {
    let ids = [201,203,221,222,223,224,225,226,227,228,229];
    for (let i = 0; i < ids.length; i++) {
      reqid +=1;
      if(ids[i] == 201){
        guildShoproute = {
          "id": ids[i],
          "num":5,
          "shopType":"guild",
          "reqId": reqid + 1,
          "route": "s.b"
        };
      } else if (ids[i] == 203) {
        guildShoproute = {
          "id": ids[i],
          "num":2,
          "shopType":"guild",
          "reqId": reqid + 1,
          "route": "s.b"
        };
      } else {
        guildShoproute = {
          "id": ids[i],
          "num":3,
          "shopType":"guild",
          "reqId": reqid + 1,
          "route": "s.b"
        };
      }


      let wsAllianceShop = ws;
      console.log(guildShoproute);
      guildShoproute = prepareRequest(guildShoproute);
      let promise = new Promise((resolve, reject) => {
          wsAllianceShop.send(guildShoproute);
          wsAllianceShop.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("limited shop done");
              resolve(onMessageRecieve(event.data));

          };
          wsAllianceShop.onerror = (error) => {
              console.log("error limited shop");
              reject(error);
          };
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    }
}

async function doBoutique() {
  reqid +=1;
  boutiqueShoproute = {
    "id": 1012,
    "num":5,
    "shopType":"skin",
    "reqId": reqid + 1,
    "route": "s.b"
  };
  let wsBoutiqueShop = ws;
    console.log(boutiqueShoproute);
    boutiqueShoproute = prepareRequest(boutiqueShoproute);
    let promise = new Promise((resolve, reject) => {
        wsBoutiqueShop.send(boutiqueShoproute);
        wsBoutiqueShop.onmessage = (event) => {
            //console.log(onMessageRecieve(event.data));
            console.log("Boutique shop done");
            resolve(onMessageRecieve(event.data));

        };
        wsBoutiqueShop.onerror = (error) => {
            console.log("error Boutique shop");
            reject(error);
        };
    });
}

async function doPavAds() {
      reqid +=1;
      // await DoHeartBeat();
      otherAds = {
        "label":"xianGe",
        "cId":10,
        "watchAd":1,
        "reqId": reqid + 1,
        "route": "at.ay"
      };

      let wsOtherAds = ws;
      console.log(otherAds);
      otherAds = prepareRequest(otherAds);
      let promise = new Promise((resolve, reject) => {
          wsOtherAds.send(otherAds);
          wsOtherAds.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("pav ads done");
              resolve(onMessageRecieve(event.data));

          };
          wsOtherAds.onerror = (error) => {
              console.log("error other ads");
              reject(error);
          };
      });            
}

async function doHmarketAds() {
      // await DoHeartBeat();
      reqid +=1;
      otherAds = {
        "label":"blackMarket",
        "cId":9,
        "watchAd":1,
        "reqId": reqid + 1,
        "route": "at.ay"
      };

      let wsOtherAds = ws;
      console.log(otherAds);
      otherAds = prepareRequest(otherAds);
      let promise = new Promise((resolve, reject) => {
          wsOtherAds.send(otherAds);
          wsOtherAds.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("market ads done");
              resolve(onMessageRecieve(event.data));

          };
          wsOtherAds.onerror = (error) => {
              console.log("error other ads");
              reject(error);
          };
      });            
}

async function doDwellingAds() {
      // await DoHeartBeat();
      reqid +=1;
      otherAds = {
        "label":"home",
        "cId":14,
        "watchAd":1,
        "reqId": reqid + 1,
        "route": "at.ay"
      };

      let wsOtherAds = ws;
      console.log(otherAds);
      otherAds = prepareRequest(otherAds);
      let promise = new Promise((resolve, reject) => {
          wsOtherAds.send(otherAds);
          wsOtherAds.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("dwelling ads done");
              resolve(onMessageRecieve(event.data));

          };
          wsOtherAds.onerror = (error) => {
              console.log("error other ads");
              reject(error);
          };
      });            
}

async function doBoutiqueAds() {
      // await DoHeartBeat();
      reqid +=1;
      otherAds = {
        "label":"robe",
        "cId":15,
        "watchAd":1,
        "reqId": reqid + 1,
        "route": "at.ay"
      };

      let wsOtherAds = ws;
      console.log(otherAds);
      otherAds = prepareRequest(otherAds);
      let promise = new Promise((resolve, reject) => {
          wsOtherAds.send(otherAds);
          wsOtherAds.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("boutique ads done");
              resolve(onMessageRecieve(event.data));

          };
          wsOtherAds.onerror = (error) => {
              console.log("error other ads");
              reject(error);
          };
      });            
}
async function doSJAds() {
      // await DoHeartBeat();
      reqid +=1;
      otherAds = {
        "label":"shopRecharge",
        "cId":24,
        "watchAd":1,
        "reqId": reqid + 1,
        "route": "at.ay"
      };

      let wsOtherAds = ws;
      console.log(otherAds);
      otherAds = prepareRequest(otherAds);
      let promise = new Promise((resolve, reject) => {
          wsOtherAds.send(otherAds);
          wsOtherAds.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("sj ads done");
              resolve(onMessageRecieve(event.data));

          };
          wsOtherAds.onerror = (error) => {
              console.log("error other ads");
              reject(error);
          };
      });            
}

async function doServantAds() {
  // await DoHeartBeat();
  reqid +=1;
  otherAds = {
      "watchAd":1,
      "reqId": reqid + 1,
      "route": "at.sb"
  };

  let wsOtherAds = ws;
  console.log(otherAds);
  otherAds = prepareRequest(otherAds);
  let promise = new Promise((resolve, reject) => {
      wsOtherAds.send(otherAds);
      wsOtherAds.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("servant ads done");
          resolve(onMessageRecieve(event.data));

      };
      wsOtherAds.onerror = (error) => {
          console.log("error other ads");
          reject(error);
      };
  });            
}
async function doSectGreetAds() {
  // await DoHeartBeat();
  reqid +=1;
  otherAds = {
      "watchAd":1,
      "reqId": reqid + 1,
      "route": "un.d"
  };

  let wsOtherAds = ws;
  console.log(otherAds);
  otherAds = prepareRequest(otherAds);
  let promise = new Promise((resolve, reject) => {
      wsOtherAds.send(otherAds);
      wsOtherAds.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("servant ads done");
          resolve(onMessageRecieve(event.data));

      };
      wsOtherAds.onerror = (error) => {
          console.log("error other ads");
          reject(error);
      };
  });            
}
async function doMountainAds() {
  // await DoHeartBeat();
  reqid +=1;
  otherAds = {
        "label":"lingShanItem",
        "cId":44,
        "watchAd":1,
        "reqId": reqid + 1,
        "route": "at.ay"
      };

  let wsOtherAds = ws;
  console.log(otherAds);
  otherAds = prepareRequest(otherAds);
  let promise = new Promise((resolve, reject) => {
      wsOtherAds.send(otherAds);
      wsOtherAds.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("servant ads done");
          resolve(onMessageRecieve(event.data));

      };
      wsOtherAds.onerror = (error) => {
          console.log("error other ads");
          reject(error);
      };
  });            
}

async function doAds() {
  for (let i = 1; i < 11; i++){
    reqid += 1;
    await doPavAds();
    await new Promise(resolve => setTimeout(resolve,2000));
    await doHmarketAds();
    await new Promise(resolve => setTimeout(resolve,2000));
    await doDwellingAds();
    await new Promise(resolve => setTimeout(resolve,2000));
    if(i<9){
      await doBoutiqueAds();
      await new Promise(resolve => setTimeout(resolve,2000));
      await doSJAds();
      await new Promise(resolve => setTimeout(resolve,2000));
    }
    if(i<6){
      await doServantAds();
      await new Promise(resolve => setTimeout(resolve,2000));
      await doMountainAds();
    }
    for (var j = 0; j <24; j++) { 
        console.log("try heartbeat");
        await DoHeartBeat();  
        if(j == 0){
          await new Promise(resolve => setTimeout(resolve,1000))         
          writeLogs("waiting 120s for next ads");
        } else {
           await new Promise(resolve => setTimeout(resolve,1000))
        }
        await new Promise(resolve => setTimeout(resolve,4000))
    }
  }
}

async function doManualCotLocal(id,eid){
  reqid +=1;
  servRoute = {
        "id":id,
        "dId":eid,
        "reqId": reqid + 1,
        "route": "xf.c"
      };

  let wsOtherAds = ws;
  console.log(servRoute);
  servRoute = prepareRequest(servRoute);
  return new Promise((resolve, reject) => {
      wsOtherAds.send(servRoute);
      wsOtherAds.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("local cot done");
          resolve(onMessageRecieve(event.data));

      };
      wsOtherAds.onerror = (error) => {
          console.log("error local cot");
          reject(error);
      };
  });     
}

async function getCurrentOps(){
  reqid +=1;
  currentOpsCot = {
      "reqId": reqid + 1,
      "route": "xf.a"
  };

  let wsCurrentOps = ws;
  console.log(currentOpsCot);
  currentOpsCot = prepareRequest(currentOpsCot);
  return new Promise((resolve, reject) => {
      wsCurrentOps.send(currentOpsCot);
      wsCurrentOps.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("get local cot ops");
          console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));

      };
      wsCurrentOps.onerror = (error) => {
          console.log("error local cot");
          reject(error);
      };
  });;           
}
async function exitCot(){
  reqid +=1;
  exitCot = {
      "reqId": reqid + 1,
      "route": "xf.i"
  };

  let wsCurrentOps = ws;
  console.log(exitCot);
  exitCot = prepareRequest(exitCot);
  return new Promise((resolve, reject) => {
      wsCurrentOps.send(exitCot);
      wsCurrentOps.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("exit local");
          resolve(onMessageRecieve(event.data));

      };
      wsCurrentOps.onerror = (error) => {
          console.log("error exit local cot");
          reject(error);
      };
  });;           
}

async function get50pBuff(){
  reqid +=1;
  return new Promise((resolve, reject) => {
        let buy50buff = {
            "id": 110,
            "reqId": reqid,
            "route": "xf.d"
        };
        let wsBuy50buff = ws;
        buy50buff = prepareRequest(buy50buff);
        wsBuy50buff.send(buy50buff);
        reqid += 1;

        wsBuy50buff.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsBuy50buff.onerror = (error) => {
            reject(error);
        };
    });
}

async function manualCotLocal() {
  reqid +=1;
  var ops = await getCurrentOps();
  await new Promise(resolve => setTimeout(resolve,500));
  while(ops['d']['t'] != "xf.a"){
        ops = await getCurrentOps();
        await new Promise(resolve => setTimeout(resolve,500));
        console.log("get ops again if route != xf.a");
        console.log(ops);
  }   
  console.log("-------------------- current OPS -----------------");
  console.log(ops);
  var opsDef = ops['d']['d']['def'];
  if(opsDef['eId'] != 0){
    //buy 50% bonus atk
    if(ops['d']['d']['hasBuffs'].length == 0){
      var buff = await get50pBuff();
      try{
        console.log("------------ check buff ------------");
        console.log(buff);
      }catch (error){}
    }      
      
    console.log("check dienum object");
    console.log(opsDef);
    await new Promise(resolve => setTimeout(resolve,500));
    var defDieNum = opsDef['dieNum'];
    var defHeroNum = opsDef['heroNum'];
    var defId = opsDef['eId'];

    console.log("--------------- check current ops for eId --------------");
    console.log(opsDef)
    writeLogs("Cot ops: " + opsDef['eName'] + " ,ID: " + defId + " ,Serv num: " + opsDef['heroNum']);
    while (opsDef['eId'] != 0){
      // while( )
      while(ops['d']['t'] != "xf.a"){
        ops = await getCurrentOps();
        await new Promise(resolve => setTimeout(resolve,500));
        console.log("get ops again if route != xf.a");
        console.log(ops);
      }

      opsDef = ops['d']['d']['def'];
      console.log("before dieNum");
      console.log(ops);

      defDieNum = opsDef['dieNum'];
      var currentOpsServ = opsDef['fHids'];
      console.log("currentOpsServ");
      console.log(currentOpsServ);

      var opsRisk = 1;
      var bestChoiceId = 0;
      currentOpsServ.forEach((element,index,arr)=> {
        if(index == 0){
          bestChoiceId = element['cId'];
          opsRisk = servantList[bestChoiceId-1]['risk'];
        } else if(index == 1 && servantList[element['cId']-1]['risk'] < opsRisk){
          bestChoiceId = element['cId'];
          opsRisk = servantList[bestChoiceId-1]['risk'];     
        }else if(index == 2 && servantList[element['cId']-1]['risk'] < opsRisk){            
          bestChoiceId = element['cId'];
          opsRisk = servantList[bestChoiceId-1]['risk'];   
        }
      });
      try{
        console.log("-------- Final choice -----------");
        console.log(servantList[bestChoiceId-1]['name']);
        //writeLogs(servantList[bestChoiceId-1]['name']);
        console.log(bestChoiceId);
        console.log(defId);
      } catch(error){}

      await new Promise(resolve => setTimeout(resolve,500));   
      var battle = await doManualCotLocal(bestChoiceId,defId);
      await new Promise(resolve => setTimeout(resolve,1000));
      console.log("----------- battle result --------");
      console.log(battle);
      try{
        console.log("----------- battle test try result --------");
        defOpsInfo = battle['d']['d']['fightLog']['f']['def'];
        console.log(defOpsInfo);
        //['fightLog']['def']
        // writeLogs(servantList[bestChoiceId-1]['name'] + ","+ defOpsInfo['attr']['maxHp'].toLocaleString("da-DK") + "," + defOpsInfo['lv'] +",ops assistHp: "+ defOpsInfo['attr']['assistHp'].toLocaleString("da-DK"));
        writeLogs(servantList[bestChoiceId-1]['name'] + ","+ defOpsInfo['attr']['maxHp'].toLocaleString("da-DK") + "," + defOpsInfo['lv']);
      } catch(error){}
      await new Promise(resolve => setTimeout(resolve,500));
      ops = await getCurrentOps();
      console.log("get ops at the end");
      console.log(ops);
      await new Promise(resolve => setTimeout(resolve,500));

      while(ops['d']['t'] == "m.m"){
        ops = await getCurrentOps();
        await new Promise(resolve => setTimeout(resolve,1000));
        console.log("get ops again if route = m.m");
        console.log(ops);
      }

      try{
        if(battle['d']['t'] == "push.spvp" && battle['d']['d']['winNum'] != undefined){
          opsDef['eId'] = 0;
          writeLogs("Manual cot over, killed: " + battle['d']['d']['winNum'] + " out of "+defHeroNum);
        }

        if(battle['d']['d']['end'] !== undefined && battle['d']['d']['end'] == 1)
        {

            opsDef['eId'] = 0;
            if(battle['d']['d']['fightLog']['w'] == 0){
              var cotRes = "Loose";
              var cotResNbkill = defDieNum;
              var cotResTotalServ = defHeroNum;
              var cotResScore = defDieNum - 1;
              writeLogs("Manual cot local done, end with "+cotRes+ " killed "+cotResNbkill+ " out of " + defHeroNum + ", final score: " + cotResScore );
            } 
            if(battle['d']['d']['fightLog']['w'] == 1){

              var cotRes = "Win";
              var cotResTotalServ = defHeroNum;
              var cotResScore = defHeroNum + battle['d']['d']['score'];
              writeLogs("Manual cot local done, end with "+cotRes+ " killed "+defHeroNum+ " out of " + defHeroNum + ", final score: " + cotResScore );
            }
        } 
      }catch(error){}
      

        // if(battle['d']['t'] == "push.spvp"){
        //   ops = await getCurrentOps();
        //   console.log("--------- check new getOps push.spvp----------");
        //   console.log(ops);
        // }
        // if(battle['d']['t'] == "xf.c"){
        //   ops = await getCurrentOps();
        //   console.log("--------- check new getOps no push.spvp----------");
        //   console.log(ops);
        //   await new Promise(resolve => setTimeout(resolve,1000));
        // }

    } //end while
  } else { 
    await exitCot();    
  }
}

//CS COT
async function getCurrentOpsCS(){
  reqid +=1;
  currentOpsCotCS = {
      "actName":"crossDebateRank2",
      "reqId": reqid + 1,
      "route": "xfcc.a"
  };

  let wsCurrentOpsCS = ws;
  console.log(currentOpsCotCS);
  currentOpsCotCS = prepareRequest(currentOpsCotCS);
  return new Promise((resolve, reject) => {
      wsCurrentOpsCS.send(currentOpsCotCS);
      wsCurrentOpsCS.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("get CS cot ops");
          console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));

      };
      wsCurrentOpsCS.onerror = (error) => {
          console.log("error CS cot");
          reject(error);
      };
  });;           
}


async function doManualCotCS(id,eid){
  reqid +=1;
  servRoute = {
        "actName":"crossDebateRank2",
        "id":id,
        "dId":eid,
        "reqId": reqid + 1,
        "route": "xfcc.c"
      };

  let wsOtherAds = ws;
  console.log(servRoute);
  servRoute = prepareRequest(servRoute);
  return new Promise((resolve, reject) => {
      wsOtherAds.send(servRoute);
      wsOtherAds.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("CS cot done");
          resolve(onMessageRecieve(event.data));

      };
      wsOtherAds.onerror = (error) => {
          console.log("error CS cot");
          reject(error);
      };
  });     
}

async function get50pBuffCS(){
  reqid +=1;
  return new Promise((resolve, reject) => {
        let buy50buff = {
            "actName":"crossDebateRank2",
            "id": 110,
            "reqId": reqid,
            "route": "xfcc.d"
        };
        let wsBuy50buff = ws;
        buy50buff = prepareRequest(buy50buff);
        wsBuy50buff.send(buy50buff);
        reqid += 1;

        wsBuy50buff.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsBuy50buff.onerror = (error) => {
            reject(error);
        };
    });
}

async function tryAtk(){
  reqid +=1;
  return new Promise((resolve, reject) => {
        let tryAtk = {
            "actName":"crossDebateRank2",
            "reqId": reqid,
            "route": "xfcc.i"
        };
        let wsTryAtk = ws;
        tryAtk = prepareRequest(tryAtk);
        wsTryAtk.send(tryAtk);
        reqid += 1;

        wsTryAtk.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsTryAtk.onerror = (error) => {
            reject(error);
        };
    });
}

async function manualCotCS() {
  reqid +=1;
  var ops = await getCurrentOpsCS();
  await new Promise(resolve => setTimeout(resolve,1000)); 
  if(rdyCsCot){
    console.log("-------------------- current OPS -----------------");
    console.log(ops);
    var opsDef = ops['d']['d']['def'];
    if(opsDef['eId'] == 0){
      try{
        console.log("-------------------- try xfcc.i -----------------");

        var opsTry = await tryAtk();
        await new Promise(resolve => setTimeout(resolve,1000)); 
        ops = await getCurrentOpsCS();
        await new Promise(resolve => setTimeout(resolve,1000)); 
        opsDef = ops['d']['d']['def'];
        console.log("-------------------- try xfcc.i opsDef-----------------");
        console.log(opsDef)
      }catch (error){}
    }

    if(opsDef['eId'] != 0){
      //buy 50% bonus atk
      if(ops['d']['d']['hasBuffs'].length == 0){
        var buff = await get50pBuffCS();
        try{
          console.log("------------ check buff ------------");
          console.log(buff);
        }catch (error){}
      }      
        
      console.log("check dienum object");
      console.log(opsDef);
      await new Promise(resolve => setTimeout(resolve,500));
      var defDieNum = opsDef['dieNum'];
      var defHeroNum = opsDef['heroNum'];
      var defId = opsDef['eId'];

      console.log("--------------- check current ops for eId --------------");
      console.log(opsDef)
      writeLogs("CS Cot ops: " + opsDef['eName'] + " ,ID: " + defId + " ,Serv num: " + opsDef['heroNum']);
      while (opsDef['eId'] != 0){
        // while( )
        while(ops['d']['t'] != "xfcc.a"){
          ops = await getCurrentOpsCS();
          await new Promise(resolve => setTimeout(resolve,500));
          console.log("get ops again if route != xfcc.a");
          console.log(ops);
        }

        opsDef = ops['d']['d']['def'];
        console.log("before dieNum");
        console.log(ops);

        defDieNum = opsDef['dieNum'];
        var currentOpsServ = opsDef['fHids'];
        console.log("currentOpsServ");
        console.log(currentOpsServ);

        var opsRisk = 1;
        var bestChoiceId = 0;
        currentOpsServ.forEach((element,index,arr)=> {
          if(index == 0){
            bestChoiceId = element['cId'];
            opsRisk = servantList[bestChoiceId-1]['risk'];
          } else if(index == 1 && servantList[element['cId']-1]['risk'] < opsRisk){
            bestChoiceId = element['cId'];
            opsRisk = servantList[bestChoiceId-1]['risk'];     
          }else if(index == 2 && servantList[element['cId']-1]['risk'] < opsRisk){            
            bestChoiceId = element['cId'];
            opsRisk = servantList[bestChoiceId-1]['risk'];   
          }
        });
        try{
          console.log("-------- Final choice -----------");
          console.log(servantList[bestChoiceId-1]['name']);
          //writeLogs(servantList[bestChoiceId-1]['name']);
          console.log(bestChoiceId);
          console.log(defId);
        } catch(error){}

        await new Promise(resolve => setTimeout(resolve,500));   
        var battle = await doManualCotCS(bestChoiceId,defId);
        await new Promise(resolve => setTimeout(resolve,1000));
        console.log("----------- battle result --------");
        console.log(battle);
        try{
          console.log("----------- battle test try result --------");
          defOpsInfo = battle['d']['d']['fightLog']['f']['def'];
          console.log(defOpsInfo);
          //['fightLog']['def']
          // writeLogs(servantList[bestChoiceId-1]['name'] + ","+ defOpsInfo['attr']['maxHp'].toLocaleString("da-DK") + "," + defOpsInfo['lv'] +",ops assistHp: "+ defOpsInfo['attr']['assistHp'].toLocaleString("da-DK"));
          writeLogs(servantList[bestChoiceId-1]['name'] + ","+ defOpsInfo['attr']['maxHp'].toLocaleString("da-DK") + "," + defOpsInfo['lv']);
        } catch(error){}
        await new Promise(resolve => setTimeout(resolve,500));
        ops = await getCurrentOpsCS();
        console.log("get ops at the end");
        console.log(ops);
        await new Promise(resolve => setTimeout(resolve,500));

        while(ops['d']['t'] == "m.m"){
          ops = await getCurrentOpsCS();
          await new Promise(resolve => setTimeout(resolve,1000));
          console.log("get ops again if route = m.m");
          console.log(ops);
        }

        try{
          if(battle['d']['t'] == "push.spvp" && battle['d']['d']['winNum'] != undefined){
            opsDef['eId'] = 0;
            writeLogs("Manual CS cot over, killed: " + battle['d']['d']['winNum'] + " out of "+defHeroNum);
          }

          if(battle['d']['d']['end'] !== undefined && battle['d']['d']['end'] == 1)
          {

              opsDef['eId'] = 0;
              if(battle['d']['d']['fightLog']['w'] == 0){
                var cotRes = "Loose";
                var cotResNbkill = defDieNum;
                var cotResTotalServ = defHeroNum;
                var cotResScore = defDieNum - 1;
                writeLogs("Manual CS cot done, end with "+cotRes+ " killed "+cotResNbkill+ " out of " + defHeroNum + ", final score: " + cotResScore );
              } 
              if(battle['d']['d']['fightLog']['w'] == 1){

                var cotRes = "Win";
                var cotResTotalServ = defHeroNum;
                var cotResScore = defHeroNum + battle['d']['d']['score'];
                writeLogs("Manual CS cot done, end with "+cotRes+ " killed "+defHeroNum+ " out of " + defHeroNum + ", final score: " + cotResScore );
              }
          } 
        }catch(error){}
        

          // if(battle['d']['t'] == "push.spvp"){
          //   ops = await getCurrentOps();
          //   console.log("--------- check new getOps push.spvp----------");
          //   console.log(ops);
          // }
          // if(battle['d']['t'] == "xf.c"){
          //   ops = await getCurrentOps();
          //   console.log("--------- check new getOps no push.spvp----------");
          //   console.log(ops);
          //   await new Promise(resolve => setTimeout(resolve,1000));
          // }

      } //end while
    }
  }     
}

//Storm COT
async function getCurrentOpsStorm(){
  reqid +=1;
  currentOpsCotStorm = {
      "actName":"contendDebateRank3",
      "reqId": reqid + 1,
      "route": "xfcc.a"
  };

  let wsCurrentOpsStorm = ws;
  console.log(currentOpsCotStorm);
  currentOpsCotStorm = prepareRequest(currentOpsCotStorm);
  return new Promise((resolve, reject) => {
      wsCurrentOpsStorm.send(currentOpsCotStorm);
      wsCurrentOpsStorm.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("get Storm cot ops");
          console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));

      };
      wsCurrentOpsStorm.onerror = (error) => {
          console.log("error Storm cot");
          reject(error);
      };
  });;           
}


async function doManualCotStorm(id,eid){
  reqid +=1;
  servRoute = {
        "actName":"contendDebateRank3",
        "id":id,
        "dId":eid,
        "reqId": reqid + 1,
        "route": "xfcc.c"
      };

  let wsOtherAds = ws;
  console.log(servRoute);
  servRoute = prepareRequest(servRoute);
  return new Promise((resolve, reject) => {
      wsOtherAds.send(servRoute);
      wsOtherAds.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("Storm cot done");
          resolve(onMessageRecieve(event.data));

      };
      wsOtherAds.onerror = (error) => {
          console.log("error Storm cot");
          reject(error);
      };
  });     
}

async function get50pBuffStorm(){
  reqid +=1;
  return new Promise((resolve, reject) => {
        let buy50buff = {
            "actName":"contendDebateRank3",
            "id": 110,
            "reqId": reqid,
            "route": "xfcc.d"
        };
        let wsBuy50buff = ws;
        buy50buff = prepareRequest(buy50buff);
        wsBuy50buff.send(buy50buff);
        reqid += 1;

        wsBuy50buff.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsBuy50buff.onerror = (error) => {
            reject(error);
        };
    });
}

async function tryAtkStorm(){
  reqid +=1;
  return new Promise((resolve, reject) => {
        let tryAtk = {
            "actName":"contendDebateRank3",
            "reqId": reqid,
            "route": "xfcc.i"
        };
        let wsTryAtk = ws;
        tryAtk = prepareRequest(tryAtk);
        wsTryAtk.send(tryAtk);
        reqid += 1;

        wsTryAtk.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsTryAtk.onerror = (error) => {
            reject(error);
        };
    });
}

async function manualCotStorm() {
  reqid +=1;
  var ops = await getCurrentOpsStorm();
  await new Promise(resolve => setTimeout(resolve,1000)); 
  if(rdyStormCot){
    console.log("-------------------- current OPS -----------------");
    console.log(ops);
    var opsDef = ops['d']['d']['def'];
    if(opsDef['eId'] == 0){
      try{
        console.log("-------------------- try xfcc.i -----------------");

        var opsTry = await tryAtkStorm();
        await new Promise(resolve => setTimeout(resolve,1000)); 
        ops = await getCurrentOpsStorm();
        await new Promise(resolve => setTimeout(resolve,1000)); 
        opsDef = ops['d']['d']['def'];
        console.log("-------------------- try xfcc.i opsDef-----------------");
        console.log(opsDef)
      }catch (error){}
    }

    if(opsDef['eId'] != 0){
      //buy 50% bonus atk
      if(ops['d']['d']['hasBuffs'].length == 0){
        var buff = await get50pBuffStorm();
        try{
          console.log("------------ check buff ------------");
          console.log(buff);
        }catch (error){}
      }      
        
      console.log("check dienum object");
      console.log(opsDef);
      await new Promise(resolve => setTimeout(resolve,500));
      var defDieNum = opsDef['dieNum'];
      var defHeroNum = opsDef['heroNum'];
      var defId = opsDef['eId'];

      console.log("--------------- check current ops for eId --------------");
      console.log(opsDef)
      writeLogs("Storm Cot ops: " + opsDef['eName'] + " ,ID: " + defId + " ,Serv num: " + opsDef['heroNum']);
      while (opsDef['eId'] != 0){
        // while( )
        while(ops['d']['t'] != "xfcc.a"){
          ops = await getCurrentOpsStorm();
          await new Promise(resolve => setTimeout(resolve,500));
          console.log("get ops again if route != xfcc.a");
          console.log(ops);
        }

        opsDef = ops['d']['d']['def'];
        console.log("before dieNum");
        console.log(ops);

        defDieNum = opsDef['dieNum'];
        var currentOpsServ = opsDef['fHids'];
        console.log("currentOpsServ");
        console.log(currentOpsServ);

        var opsRisk = 1;
        var bestChoiceId = 0;
        currentOpsServ.forEach((element,index,arr)=> {
          if(index == 0){
            bestChoiceId = element['cId'];
            opsRisk = servantList[bestChoiceId-1]['risk'];
          } else if(index == 1 && servantList[element['cId']-1]['risk'] < opsRisk){
            bestChoiceId = element['cId'];
            opsRisk = servantList[bestChoiceId-1]['risk'];     
          }else if(index == 2 && servantList[element['cId']-1]['risk'] < opsRisk){            
            bestChoiceId = element['cId'];
            opsRisk = servantList[bestChoiceId-1]['risk'];   
          }
        });
        try{
          console.log("-------- Final choice -----------");
          console.log(servantList[bestChoiceId-1]['name']);
          //writeLogs(servantList[bestChoiceId-1]['name']);
          console.log(bestChoiceId);
          console.log(defId);
        } catch(error){}

        await new Promise(resolve => setTimeout(resolve,500));   
        var battle = await doManualCotStorm(bestChoiceId,defId);
        await new Promise(resolve => setTimeout(resolve,1000));
        console.log("----------- battle result --------");
        console.log(battle);
        try{
          console.log("----------- battle test try result --------");
          defOpsInfo = battle['d']['d']['fightLog']['f']['def'];
          console.log(defOpsInfo);
          //['fightLog']['def']
          // writeLogs(servantList[bestChoiceId-1]['name'] + ","+ defOpsInfo['attr']['maxHp'].toLocaleString("da-DK") + "," + defOpsInfo['lv'] +",ops assistHp: "+ defOpsInfo['attr']['assistHp'].toLocaleString("da-DK"));
          writeLogs(servantList[bestChoiceId-1]['name'] + ","+ defOpsInfo['attr']['maxHp'].toLocaleString("da-DK") + "," + defOpsInfo['lv']);
        } catch(error){}
        await new Promise(resolve => setTimeout(resolve,500));
        ops = await getCurrentOpsStorm();
        console.log("get ops at the end");
        console.log(ops);
        await new Promise(resolve => setTimeout(resolve,500));

        while(ops['d']['t'] == "m.m"){
          ops = await getCurrentOpsStorm();
          await new Promise(resolve => setTimeout(resolve,1000));
          console.log("get ops again if route = m.m");
          console.log(ops);
        }

        try{
          if(battle['d']['t'] == "push.spvp" && battle['d']['d']['winNum'] != undefined){
            opsDef['eId'] = 0;
            writeLogs("Manual Storm cot over, killed: " + battle['d']['d']['winNum'] + " out of "+defHeroNum);
          }

          if(battle['d']['d']['end'] !== undefined && battle['d']['d']['end'] == 1)
          {

              opsDef['eId'] = 0;
              if(battle['d']['d']['fightLog']['w'] == 0){
                var cotRes = "Loose";
                var cotResNbkill = defDieNum;
                var cotResTotalServ = defHeroNum;
                var cotResScore = defDieNum - 1;
                writeLogs("Manual Storm cot done, end with "+cotRes+ " killed "+cotResNbkill+ " out of " + defHeroNum + ", final score: " + cotResScore );
              } 
              if(battle['d']['d']['fightLog']['w'] == 1){

                var cotRes = "Win";
                var cotResTotalServ = defHeroNum;
                var cotResScore = defHeroNum + battle['d']['d']['score'];
                writeLogs("Manual Storm cot done, end with "+cotRes+ " killed "+defHeroNum+ " out of " + defHeroNum + ", final score: " + cotResScore );
              }
          } 
        }catch(error){}
        

          // if(battle['d']['t'] == "push.spvp"){
          //   ops = await getCurrentOps();
          //   console.log("--------- check new getOps push.spvp----------");
          //   console.log(ops);
          // }
          // if(battle['d']['t'] == "xf.c"){
          //   ops = await getCurrentOps();
          //   console.log("--------- check new getOps no push.spvp----------");
          //   console.log(ops);
          //   await new Promise(resolve => setTimeout(resolve,1000));
          // }

      } //end while
    }
  }   
}


//Heavenly Cot
async function getCurrentOpsHeavenly(){
  reqid +=1;
  currentOpsCotHeavenly = {
      "actName":"crossDebateRank3",
      "reqId": reqid + 1,
      "route": "xfcc.a"
  };

  let wsCurrentOpsHeavenly = ws;
  console.log(currentOpsCotHeavenly);
  currentOpsCotHeavenly = prepareRequest(currentOpsCotHeavenly);
  return new Promise((resolve, reject) => {
      wsCurrentOpsHeavenly.send(currentOpsCotHeavenly);
      wsCurrentOpsHeavenly.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("get Heavenly cot ops");
          console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));

      };
      wsCurrentOpsHeavenly.onerror = (error) => {
          console.log("error Heavenly cot");
          reject(error);
      };
  });;           
}


async function doManualCotHeavenly(id,eid){
  reqid +=1;
  servRoute = {
        "actName":"crossDebateRank3",
        "id":id,
        "dId":eid,
        "reqId": reqid + 1,
        "route": "xfcc.c"
      };

  let wsOtherAds = ws;
  console.log(servRoute);
  servRoute = prepareRequest(servRoute);
  return new Promise((resolve, reject) => {
      wsOtherAds.send(servRoute);
      wsOtherAds.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("Heavenly cot done");
          resolve(onMessageRecieve(event.data));

      };
      wsOtherAds.onerror = (error) => {
          console.log("error Heavenly cot");
          reject(error);
      };
  });     
}

async function get50pBuffHeavenly(){
  reqid +=1;
  return new Promise((resolve, reject) => {
        let buy50buff = {
            "actName":"crossDebateRank3",
            "id": 110,
            "reqId": reqid,
            "route": "xfcc.d"
        };
        let wsBuy50buff = ws;
        buy50buff = prepareRequest(buy50buff);
        wsBuy50buff.send(buy50buff);
        reqid += 1;

        wsBuy50buff.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsBuy50buff.onerror = (error) => {
            reject(error);
        };
    });
}

async function tryAtkHeavenly(){
  reqid +=1;
  return new Promise((resolve, reject) => {
        let tryAtk = {
            "actName":"crossDebateRank3",
            "reqId": reqid,
            "route": "xfcc.i"
        };
        let wsTryAtk = ws;
        tryAtk = prepareRequest(tryAtk);
        wsTryAtk.send(tryAtk);
        reqid += 1;

        wsTryAtk.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsTryAtk.onerror = (error) => {
            reject(error);
        };
    });
}

async function manualCotHeavenly() {
  reqid +=1;
  var ops = await getCurrentOpsHeavenly();
  await new Promise(resolve => setTimeout(resolve,1000)); 
  if(rdyCsCot){
    console.log("-------------------- current OPS -----------------");
    console.log(ops);
    var opsDef = ops['d']['d']['def'];
    if(opsDef['eId'] == 0){
      try{
        console.log("-------------------- try r.i -----------------");

        var opsTry = await tryAtkHeavenly();
        await new Promise(resolve => setTimeout(resolve,1000)); 
        ops = await getCurrentOpsHeavenly();
        await new Promise(resolve => setTimeout(resolve,1000)); 
        opsDef = ops['d']['d']['def'];
        console.log("-------------------- try r.i opsDef-----------------");
        console.log(opsDef)
      }catch (error){}
    }

    if(opsDef['eId'] != 0){
      //buy 50% bonus atk
      if(ops['d']['d']['hasBuffs'].length == 0){
        var buff = await get50pBuffHeavenly();
        try{
          console.log("------------ check buff ------------");
          console.log(buff);
        }catch (error){}
      }      
        
      console.log("check dienum object");
      console.log(opsDef);
      await new Promise(resolve => setTimeout(resolve,500));
      var defDieNum = opsDef['dieNum'];
      var defHeroNum = opsDef['heroNum'];
      var defId = opsDef['eId'];

      console.log("--------------- check current ops for eId --------------");
      console.log(opsDef)
      writeLogs("Heavenly Cot ops: " + opsDef['eName'] + " ,ID: " + defId + " ,Serv num: " + opsDef['heroNum']);
      while (opsDef['eId'] != 0){
        // while( )
        while(ops['d']['t'] != "xfcc.a"){
          ops = await getCurrentOpsHeavenly();
          await new Promise(resolve => setTimeout(resolve,500));
          console.log("get ops again if route != r.a");
          console.log(ops);
        }

        opsDef = ops['d']['d']['def'];
        console.log("before dieNum");
        console.log(ops);

        defDieNum = opsDef['dieNum'];
        var currentOpsServ = opsDef['fHids'];
        console.log("currentOpsServ");
        console.log(currentOpsServ);

        var opsRisk = 1;
        var bestChoiceId = 0;
        currentOpsServ.forEach((element,index,arr)=> {
          if(index == 0){
            bestChoiceId = element['cId'];
            opsRisk = servantList[bestChoiceId-1]['risk'];
          } else if(index == 1 && servantList[element['cId']-1]['risk'] < opsRisk){
            bestChoiceId = element['cId'];
            opsRisk = servantList[bestChoiceId-1]['risk'];     
          }else if(index == 2 && servantList[element['cId']-1]['risk'] < opsRisk){            
            bestChoiceId = element['cId'];
            opsRisk = servantList[bestChoiceId-1]['risk'];   
          }
        });
        try{
          console.log("-------- Final choice -----------");
          console.log(servantList[bestChoiceId-1]['name']);
          //writeLogs(servantList[bestChoiceId-1]['name']);
          console.log(bestChoiceId);
          console.log(defId);
        } catch(error){}

        await new Promise(resolve => setTimeout(resolve,500));   
        var battle = await doManualCotHeavenly(bestChoiceId,defId);
        await new Promise(resolve => setTimeout(resolve,1000));
        console.log("----------- battle result --------");
        console.log(battle);
        try{
          console.log("----------- battle test try result --------");
          defOpsInfo = battle['d']['d']['fightLog']['f']['def'];
          console.log(defOpsInfo);
          //['fightLog']['def']
          // writeLogs(servantList[bestChoiceId-1]['name'] + ","+ defOpsInfo['attr']['maxHp'].toLocaleString("da-DK") + "," + defOpsInfo['lv'] +",ops assistHp: "+ defOpsInfo['attr']['assistHp'].toLocaleString("da-DK"));
          writeLogs(servantList[bestChoiceId-1]['name'] + ","+ defOpsInfo['attr']['maxHp'].toLocaleString("da-DK") + "," + defOpsInfo['lv']);
        } catch(error){}
        await new Promise(resolve => setTimeout(resolve,500));
        ops = await getCurrentOpsHeavenly();
        console.log("get ops at the end");
        console.log(ops);
        await new Promise(resolve => setTimeout(resolve,500));

        while(ops['d']['t'] == "m.m"){
          ops = await getCurrentOpsHeavenly();
          await new Promise(resolve => setTimeout(resolve,1000));
          console.log("get ops again if route = m.m");
          console.log(ops);
        }

        try{
          if(battle['d']['t'] == "push.spvp" && battle['d']['d']['winNum'] != undefined){
            opsDef['eId'] = 0;
            writeLogs("Manual Heavenly cot over, killed: " + battle['d']['d']['winNum'] + " out of "+defHeroNum);
          }

          if(battle['d']['d']['end'] !== undefined && battle['d']['d']['end'] == 1)
          {

              opsDef['eId'] = 0;
              if(battle['d']['d']['fightLog']['w'] == 0){
                var cotRes = "Loose";
                var cotResNbkill = defDieNum;
                var cotResTotalServ = defHeroNum;
                var cotResScore = defDieNum - 1;
                writeLogs("Manual Heavenly cot done, end with "+cotRes+ " killed "+cotResNbkill+ " out of " + defHeroNum + ", final score: " + cotResScore );
              } 
              if(battle['d']['d']['fightLog']['w'] == 1){

                var cotRes = "Win";
                var cotResTotalServ = defHeroNum;
                var cotResScore = defHeroNum + battle['d']['d']['score'];
                writeLogs("Manual Heavenly cot done, end with "+cotRes+ " killed "+defHeroNum+ " out of " + defHeroNum + ", final score: " + cotResScore );
              }
          } 
        }catch(error){}
        

          // if(battle['d']['t'] == "push.spvp"){
          //   ops = await getCurrentOps();
          //   console.log("--------- check new getOps push.spvp----------");
          //   console.log(ops);
          // }
          // if(battle['d']['t'] == "xf.c"){
          //   ops = await getCurrentOps();
          //   console.log("--------- check new getOps no push.spvp----------");
          //   console.log(ops);
          //   await new Promise(resolve => setTimeout(resolve,1000));
          // }

      } //end while
    }
  }   
}

async function getCurrentOpsACS(){
  reqid +=1;
  currentOpsCotCS = {
      "actName":"guildDebateRank2",
      "reqId": reqid + 1,
      "route": "xfc.a"
  };

  let wsCurrentOpsCS = ws;
  console.log(currentOpsCotCS);
  currentOpsCotCS = prepareRequest(currentOpsCotCS);
  return new Promise((resolve, reject) => {
      wsCurrentOpsCS.send(currentOpsCotCS);
      wsCurrentOpsCS.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("get ACS cot ops");
          console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));

      };
      wsCurrentOpsCS.onerror = (error) => {
          console.log("error CS cot");
          reject(error);
      };
  });;           
}


async function doManualCotACS(id,eid){
  reqid +=1;
  servRoute = {
        "actName":"guildDebateRank2",
        "id":id,
        "dId":eid,
        "reqId": reqid + 1,
        "route": "xfc.c"
      };

  let wsOtherAds = ws;
  console.log(servRoute);
  servRoute = prepareRequest(servRoute);
  return new Promise((resolve, reject) => {
      wsOtherAds.send(servRoute);
      wsOtherAds.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("ACS cot done");
          resolve(onMessageRecieve(event.data));

      };
      wsOtherAds.onerror = (error) => {
          console.log("error CS cot");
          reject(error);
      };
  });     
}

async function get50pBuffACS(){
  reqid +=1;
  return new Promise((resolve, reject) => {
        let buy50buff = {
            "actName":"guildDebateRank2",
            "id": 110,
            "reqId": reqid,
            "route": "xfc.d"
        };
        let wsBuy50buff = ws;
        buy50buff = prepareRequest(buy50buff);
        wsBuy50buff.send(buy50buff);
        reqid += 1;

        wsBuy50buff.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsBuy50buff.onerror = (error) => {
            reject(error);
        };
    });
}

async function tryAtkACS(){
  reqid +=1;
  return new Promise((resolve, reject) => {
        let tryAtk = {
            "actName":"guildDebateRank2",
            "reqId": reqid,
            "route": "xfc.i"
        };
        let wsTryAtk = ws;
        tryAtk = prepareRequest(tryAtk);
        wsTryAtk.send(tryAtk);
        reqid += 1;

        wsTryAtk.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsTryAtk.onerror = (error) => {
            reject(error);
        };
    });
}

async function manualCotACS() {
  reqid +=1;
  var ops = await getCurrentOpsACS();
  await new Promise(resolve => setTimeout(resolve,500));    
  console.log("-------------------- current ACS OPS -----------------");
  console.log(ops);
  var opsDef = ops['d']['d']['def'];
  if(opsDef['eId'] == 0){
    try{
      console.log("-------------------- try xfc.i -----------------");

      var opsTry = await tryAtkACS();
      await new Promise(resolve => setTimeout(resolve,500)); 
      ops = await getCurrentOpsACS();
      await new Promise(resolve => setTimeout(resolve,500)); 
      opsDef = ops['d']['d']['def'];
      console.log("-------------------- try xfc.i opsDef-----------------");
      console.log(opsDef)
    }catch (error){}
  }

  if(opsDef['eId'] != 0){
    //buy 50% bonus atk
    if(ops['d']['d']['hasBuffs'].length == 0){
      var buff = await get50pBuffACS();
      try{
        console.log("------------ check buff ------------");
        console.log(buff);
      }catch (error){}
    }      
      
    console.log("check dienum object");
    console.log(opsDef);
    await new Promise(resolve => setTimeout(resolve,500));
    var defDieNum = opsDef['dieNum'];
    var defHeroNum = opsDef['heroNum'];
    var defId = opsDef['eId'];

    console.log("--------------- check current ops for eId --------------");
    console.log(opsDef)
    writeLogs("ACS Cot ops: " + opsDef['eName'] + " ,ID: " + defId + " ,Serv num: " + opsDef['heroNum']);
    while (opsDef['eId'] != 0){
      // while( )
      while(ops['d']['t'] != "xfc.a"){
        ops = await getCurrentOpsACS();
        await new Promise(resolve => setTimeout(resolve,500));
        console.log("get ops again if route != xfc.a");
        console.log(ops);
      }

      opsDef = ops['d']['d']['def'];
      console.log("before dieNum");
      console.log(ops);

      defDieNum = opsDef['dieNum'];
      var currentOpsServ = opsDef['fHids'];
      console.log("currentOpsServ");
      console.log(currentOpsServ);

      var opsRisk = 1;
      var bestChoiceId = 0;
      currentOpsServ.forEach((element,index,arr)=> {
        if(index == 0){
          bestChoiceId = element['cId'];
          opsRisk = servantList[bestChoiceId-1]['risk'];
        } else if(index == 1 && servantList[element['cId']-1]['risk'] < opsRisk){
          bestChoiceId = element['cId'];
          opsRisk = servantList[bestChoiceId-1]['risk'];     
        }else if(index == 2 && servantList[element['cId']-1]['risk'] < opsRisk){            
          bestChoiceId = element['cId'];
          opsRisk = servantList[bestChoiceId-1]['risk'];   
        }
      });
      try{
        console.log("-------- Final choice -----------");
        console.log(servantList[bestChoiceId-1]['name']);
        //writeLogs(servantList[bestChoiceId-1]['name']);
        console.log(bestChoiceId);
        console.log(defId);
      } catch(error){}

      await new Promise(resolve => setTimeout(resolve,500));   
      var battle = await doManualCotACS(bestChoiceId,defId);
      await new Promise(resolve => setTimeout(resolve,1000));
      console.log("----------- battle result --------");
      console.log(battle);
      try{
        console.log("----------- battle test try result --------");
        defOpsInfo = battle['d']['d']['fightLog']['f']['def'];
        console.log(defOpsInfo);
        //['fightLog']['def']
        // writeLogs(servantList[bestChoiceId-1]['name'] + ","+ defOpsInfo['attr']['maxHp'].toLocaleString("da-DK") + "," + defOpsInfo['lv'] +",ops assistHp: "+ defOpsInfo['attr']['assistHp'].toLocaleString("da-DK"));
        writeLogs(servantList[bestChoiceId-1]['name'] + ","+ defOpsInfo['attr']['maxHp'].toLocaleString("da-DK") + "," + defOpsInfo['lv']);
      } catch(error){}
      await new Promise(resolve => setTimeout(resolve,500));
      ops = await getCurrentOpsACS();
      console.log("get ops at the end");
      console.log(ops);
      await new Promise(resolve => setTimeout(resolve,500));

      while(ops['d']['t'] == "m.m"){
        ops = await getCurrentOpsACS();
        await new Promise(resolve => setTimeout(resolve,1000));
        console.log("get ops again if route = m.m");
        console.log(ops);
      }

      try{
        if(battle['d']['t'] == "push.spvp" && battle['d']['d']['winNum'] != undefined){
          opsDef['eId'] = 0;
          writeLogs("Manual ACS cot over, killed: " + battle['d']['d']['winNum'] + " out of "+defHeroNum);
        }

        if(battle['d']['d']['end'] !== undefined && battle['d']['d']['end'] == 1)
        {

            opsDef['eId'] = 0;
            if(battle['d']['d']['fightLog']['w'] == 0){
              var cotRes = "Loose";
              var cotResNbkill = defDieNum;
              var cotResTotalServ = defHeroNum;
              var cotResScore = defDieNum - 1;
              writeLogs("Manual ACS cot done, end with "+cotRes+ " killed "+cotResNbkill+ " out of " + defHeroNum + ", final score: " + cotResScore );
            } 
            if(battle['d']['d']['fightLog']['w'] == 1){

              var cotRes = "Win";
              var cotResTotalServ = defHeroNum;
              var cotResScore = defHeroNum + battle['d']['d']['score'];
              writeLogs("Manual ACS cot done, end with "+cotRes+ " killed "+defHeroNum+ " out of " + defHeroNum + ", final score: " + cotResScore );
            }
        } 
      }catch(error){}
      
    } //end while
  }
}


async function buyMiniEventRessources(idItem,activityName){    
    console.log("id Item");
    console.log(idItem);
    miniEventShopRoute = {
        "id":idItem,
        "activityName":activityName,
        "reqId": reqid,
        "route": "at.w"
    };    
    let miniEvent = ws;
    console.log(miniEventShopRoute);
    miniEventShopRoute = prepareRequest(miniEventShopRoute);
    return new Promise((resolve, reject) => {
        miniEvent.send(miniEventShopRoute);
        miniEvent.onmessage = (event) => {
            //console.log(onMessageRecieve(event.data));
            console.log("buy mini event item for: " + activityName);
            resolve(onMessageRecieve(event.data));

        };
        miniEvent.onerror = (error) => {
            console.log("error mini event buy");
            reject(error);
        };
    });
}

async function doMiniEvent(id,activityName){
  reqid += 1;
  miniEventShopRoute = {
    "activityName": activityName,
    "cId":id,
    "num":10,
    "reqId": reqid,
    "route": "at.lh"
  };
  let miniEvent = ws;
  //console.log(miniEventShopRoute);
  miniEventShopRoute = prepareRequest(miniEventShopRoute);
  let promise = new Promise((resolve, reject) => {
      miniEvent.send(miniEventShopRoute);
      miniEvent.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("do mini event");
          console.log(onMessageRecieve(event.data));
          resolve(event);

      };
      miniEvent.onerror = (error) => {
          console.log("error event buy");
          reject(error);
      };
  });
}

async function buyAndDoMiniEvent(){
  miniEventList.forEach((element,index,arr)=> {
        console.log(element);
        reqid += 1;
        miniEventShopRoute = {
          "id": element['id'],
          "activityName":element['activityName'],
          "reqId": reqid,
          "route": "at.w"
        };
        let miniEvent = ws;
        //console.log(miniEventShopRoute);
        test = miniEventShopRoute;
        miniEventShopRoute = prepareRequest(miniEventShopRoute);
        let promise = new Promise((resolve, reject) => {
            miniEvent.send(miniEventShopRoute);
            miniEvent.onmessage = (event) => {
                //console.log(onMessageRecieve(event.data));
                console.log("buy mini event");
                console.log(test);
                console.log(onMessageRecieve(event.data));
                resolve(event);

            };
            miniEvent.onerror = (error) => {
                console.log("error event buy");
                reject(error);
            };
        });
  }); 
  await new Promise(resolve => setTimeout(resolve,1000));
  console.log(currentMiniId);

      if(currentMiniDone == false && currentMiniOn != false){
        for (var i = currentMiniBought; i <= 10; i++) {
          reqid += 1;
          await buyMiniEventRessources(currentMiniId,currentMiniName);
          await new Promise(resolve => setTimeout(resolve,1000));
        }
      }
      await new Promise(resolve => setTimeout(resolve,1000));
      console.log("---------- check currentMiniOn -----------");
      console.log(currentMiniOn);
      if (currentMiniOn != false){
        console.log(currentMiniId);
        try{
            let event = miniEventList.find(item => item.id === parseInt(currentMiniId));
            console.log("event");
            let { name, cId } = event;
            console.log("try to do mini");
            console.log(currentMiniOn);
            console.log(cId);
            console.log(name);
            await doMiniEvent(cId,name);
        }catch(error){
          console.log(error);
        }
      }

}

async function useBoutiqueKeys(){ 
  while(emptyBoutiqueKey != true){
    reqid += 1;
    boutiqueKeysRoute = {
        "type":4,
        "reqId": reqid,
        "route": "fan.b"
    };
    let boutiqueKeysWs = ws;
    console.log(boutiqueKeysRoute);
    boutiqueKeysRoute = prepareRequest(boutiqueKeysRoute);
    let promise = new Promise((resolve, reject) => {
        boutiqueKeysWs.send(boutiqueKeysRoute);
        boutiqueKeysWs.onmessage = (event) => {
            //console.log(onMessageRecieve(event.data));
            console.log(" Using 5 keys in boutique ");
            resolve(onMessageRecieve(event.data));

        };
        boutiqueKeysWs.onerror = (error) => {
            console.log("error using boutique keys");
            reject(error);
        };
    });

    await new Promise(resolve => setTimeout(resolve,500));
  }
}

async function getBossChaos(){
  reqid += 1;
  chaosGetBoss = {
    "reqId": reqid,
    "route": "sand.d"
  };
  let chaosGetBossWs = ws;
  //console.log(miniEventShopRoute);
  chaosGetBoss = prepareRequest(chaosGetBoss);
  return new Promise((resolve, reject) => {
      chaosGetBossWs.send(chaosGetBoss);
      chaosGetBossWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("get boss chaos");
          console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));

      };
      chaosGetBossWs.onerror = (error) => {
          console.log("error get boss");
          reject(error);
      };
  });
}

async function atkBoss(bossId,servId){
  reqid += 1;
  atkPath = {
    "hId": servId,
    "id": bossId,
    "reqId": reqid,
    "route": "sand.e"
  };
  let atkBossWs = ws;
  console.log(atkPath);
  atkPath = prepareRequest(atkPath);
  let promise = new Promise((resolve, reject) => {
      atkBossWs.send(atkPath);
      atkBossWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log(" atk boss chaos");
          console.log(onMessageRecieve(event.data))
          resolve(onMessageRecieve(event.data));
      };
      atkBossWs.onerror = (error) => {
          console.log("error atk boss");
          reject(error);
      };
  });
}


async function doChaos(){
  boss = await getBossChaos();
  await new Promise(resolve => setTimeout(resolve,500));
  console.log("BOSS");
  try{
    bossId=boss['d']['d']['boss'][0]['id'];
    writeLogs("Start Chaos");
    for (var i = 1; i <= 74; i++) {  
        if(i % 5 === 0){
          await DoHeartBeat();
          await new Promise(resolve => setTimeout(resolve,500));
        }    
        await atkBoss(bossId,i);
        await new Promise(resolve => setTimeout(resolve,500));
    }
    writeLogs("Chaos Done");
  } catch(error){
    writeLogs("No boss available in list");
  }
}

async function checkRuin(){
  reqid +=1;
  checkRuinPath = {
    "reqId": reqid,
    "route": "fw.c"
  }
  let crWs = ws;
  console.log(checkRuinPath);
  checkRuinPath = prepareRequest(checkRuinPath);
  return new Promise((resolve, reject) => {
      crWs.send(checkRuinPath);
      crWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("checkRuin");
          //console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      crWs.onerror = (error) => {
          console.log("error checkRuin");
          reject(error);
      };
  });
}

async function searchRuinLevel(){
  reqid +=1;
  checkRuinLevel = {
    "reqId": reqid,
    "route": "fw.k"
  }
    let crWs = ws;
  console.log(checkRuinLevel);
  checkRuinLevel = prepareRequest(checkRuinLevel);
  return new Promise((resolve, reject) => {
      crWs.send(checkRuinLevel);
      crWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("searchRuinLevel")
          //console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      crWs.onerror = (error) => {
          console.log("error search ruin");
          reject(error);
      };
  });
}

async function searchRuinMap(mapId){
  reqid +=1;
  checkRuinLevel = {
    "mapId": mapId,
    "reqId": reqid,
    "route": "fw.b"
  }
    let crWs = ws;
  console.log(checkRuinLevel);
  checkRuinLevel = prepareRequest(checkRuinLevel);
  return new Promise((resolve, reject) => {
      crWs.send(checkRuinLevel);
      crWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("searchRuinMap")
          //console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      crWs.onerror = (error) => {
          console.log("error searchRuinMap");
          reject(error);
      };
  });
}

async function putRuin(servId,ruinId){
    reqid +=1;
  checkRuinLevel = {
    "id": ruinId,
    "heroIdStr": servId,
    "reqId": reqid,
    "route": "fw.d"
  }
  let crWs = ws;
  console.log(checkRuinLevel);
  checkRuinLevel = prepareRequest(checkRuinLevel);
  return new Promise((resolve, reject) => {
      crWs.send(checkRuinLevel);
      crWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("putRuin")
          //console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      crWs.onerror = (error) => {
          console.log("error searchRuinMap");
          reject(error);
      };
  });
}

// async function doRuin() {
//   let currentRuin = await checkRuin();
//   //console.log(currentRuin);
//   await new Promise(resolve => setTimeout(resolve,500));

//   while(currentRuin['d']['t'] != "fw.c"){    
//     currentRuin = await checkRuin();
//     console.log("------------ debug current ruin -------------");
//     console.log(currentRuin);
//     await new Promise(resolve => setTimeout(resolve,1000));
//   }
//   try{
//     currentRuin = currentRuin['d']['d']['l'].length;  

//   }catch(error){
//     currentRuin = await checkRuin();
//     await new Promise(resolve => setTimeout(resolve,500));
//     currentRuin = currentRuin['d']['d']['l'].length; 
//   }
//   console.log(currentRuin);
//   while(currentRuin < 2){
//     currentRuinLevel = await searchRuinLevel(); 
//     await new Promise(resolve => setTimeout(resolve,500));
//     while(currentRuinLevel['d']['t'] != "fw.k"){    
//       currentRuinLevel = await searchRuinLevel(); 
//       console.log("------------ debug currentRuinLevel -------------");
//       console.log(currentRuinLevel);
//       await new Promise(resolve => setTimeout(resolve,1000));
//     }
//     currentRuinLevel = currentRuinLevel['d']['d']['l'];
//     //await new Promise(resolve => setTimeout(resolve,1000));
//     let premierNumInferieurA11 = null;
//     for (let i = 0; i < currentRuinLevel.length; i++) {
//       let element = currentRuinLevel[i];
      
//       if (element.num < 11) {
//         premierNumInferieurA11 = element;
//         break;
//       }
//     }

//     console.log("--------Ruin level available-----------");
//     console.log(premierNumInferieurA11);
//     await new Promise(resolve => setTimeout(resolve,1000));

//     checkMap = await searchRuinMap(premierNumInferieurA11['id']);
//     await new Promise(resolve => setTimeout(resolve,500));

//     while(checkMap['d']['t'] != "fw.b"){    
//       checkMap = await searchRuinMap(premierNumInferieurA11['id']);
//       console.log("------------ debug checkMap -------------");
//       console.log(checkMap);
//       await new Promise(resolve => setTimeout(resolve,1000));
//     }
//     try{
//       currentMap = checkMap['d']['d']['mapItem']['l'];
//     } catch(error){
//       console.log("here");
//     }

//     let availableRuin = null;
//     for (let i = currentMap.length - 1; i >= 0; i--) {
//       let element = currentMap[i];
      
//       if(element.uId == 0){
//         availableRuin = element.id;
//         break;
//       }
//     }
//     console.log("availableRuin");    
//     console.log(availableRuin);
//     if(currentRuin == 0){
//         //setup tang ruin
//         putRuinRes = await putRuin("58",availableRuin);
//         await new Promise(resolve => setTimeout(resolve,1000));

//     } else {
//       putRuinRes = await putRuin("64",availableRuin);
//       await new Promise(resolve => setTimeout(resolve,1000));
//     }
//     console.log("putRuinRes");
//     console.log(putRuinRes);
//     try {
//       if(putRuinRes['d']['d']['msg'] == "Incoming parameters are incorrect or empty" || putRuinRes['d']['d']['msg'] == "No open seats"){

//         break;
//       }

//     }catch{}
//     currentRuin = await checkRuin();
//     await new Promise(resolve => setTimeout(resolve,500));

//     while(currentRuin['d']['t'] != "fw.c"){    
//       currentRuin = await checkRuin();
//       console.log("------------ debug current ruin -------------");
//       console.log(currentRuin);
//       await new Promise(resolve => setTimeout(resolve,1000));
//     } 
//   }
//   writeLogs("Ruin done");
// }

async function doRuin() {
  let currentRuin = await checkRuin();
  console.log(currentRuin);
  //await new Promise(resolve => setTimeout(resolve,1000));
  try{
    currentRuin = currentRuin['d']['d']['l'].length;  

  }catch(error){
    currentRuin = await checkRuin();
  }
  console.log(currentRuin);
  while(currentRuin < 3){
    currentRuinLevel = await searchRuinLevel(); 

    currentRuinLevel = currentRuinLevel['d']['d']['l'];
    //await new Promise(resolve => setTimeout(resolve,1000));
    let premierNumInferieurA11 = null;
    try{
      for (let i = 0; i < currentRuinLevel.length; i++) {
        let element = currentRuinLevel[i];
        
        if (element.num < 11) {
          premierNumInferieurA11 = element;
          break;
        }
      }
    } catch (error){
      console.log("error currentRuinLevel.length");
      console.log(currentRuinLevel);
    }
    

    console.log("--------Ruin level available-----------");
    console.log(premierNumInferieurA11);
    await new Promise(resolve => setTimeout(resolve,1000));

    checkMap = await searchRuinMap(premierNumInferieurA11['id']);

    //await new Promise(resolve => setTimeout(resolve,1000));
    try{
      currentMap = checkMap['d']['d']['mapItem']['l'];

    } catch(error){
      console.log("error currentMap");
      checkMap = await searchRuinMap(premierNumInferieurA11['id']);
      currentMap = checkMap['d']['d']['mapItem']['l']; 

    }

    // console.log("searchRuinMap");    
    // console.log(checkMap);
    let availableRuin = null;
    try{
      for (let i = currentMap.length - 1; i >= 0; i--) {
        let element = currentMap[i];
        
        if(element.uId == 0){
          availableRuin = element.id;
          break;
        }      
      }
    } catch (error){
      console.log("error currentMap.length");
      console.log(currentMap);
    }
    
    // console.log("availableRuin");    
    // console.log(availableRuin);
    if(currentRuin == 0){
        //setup tang ruin

        putRuinRes = await putRuin(servListInfo['heros'][0]['cId'].toString(),availableRuin);
        await new Promise(resolve => setTimeout(resolve,1000));

    }else if (currentRuin == 1) {
      putRuinRes = await putRuin(servListInfo['heros'][1]['cId'].toString(),availableRuin);
      await new Promise(resolve => setTimeout(resolve,1000));
    } 
    else {
      putRuinRes = await putRuin(servListInfo['heros'][2]['cId'],availableRuin);
      await new Promise(resolve => setTimeout(resolve,1000));
    }
    // console.log("putRuinRes");
    // console.log(putRuinRes);
    try {
      if(putRuinRes['d']['d']['msg'] == "Incoming parameters are incorrect or empty" || putRuinRes['d']['d']['msg'] == "No open seats"){

        break;
      }

    }catch{}
    currentRuin = await checkRuin();
    await new Promise(resolve => setTimeout(resolve,500));
    try{
      currentRuin = currentRuin['d']['d']['l'].length;
    } catch (error){
      currentRuin = await checkRuin();
      currentRuin = currentRuin['d']['d']['l'].length;      
    }
  }
  writeLogs("Ruin done");
}

async function mailPage(){
  reqid += 1;
  mailPagePath = {
    "reqId": reqid,
    "route": "ml.a"
  };
  let mailPageWS = ws;
  console.log(mailPagePath);
  mailPagePath = prepareRequest(mailPagePath);
  return new Promise((resolve, reject) => {
      mailPageWS.send(mailPagePath);
      mailPageWS.onmessage = (event) => {

          console.log("mail page ");
          //console.log(onMessageRecieve(event.data));
          //console.log("get User info");
          console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      mailPageWS.onerror = (error) => {
          console.log("error User info");
          reject(error);
      };
  });
}
async function autoReadMails(){
  reqid += 1;
  userInfo = {
    "reqId": reqid,
    "route": "ml.d"
  };
  let userInfoWs = ws;
  console.log(userInfo);
  userInfo = prepareRequest(userInfo);
  return new Promise((resolve, reject) => {
      userInfoWs.send(userInfo);
      userInfoWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          //console.log("get User info");
          //console.log(event.data);
          resolve(onMessageRecieve(event.data));
      };
      userInfoWs.onerror = (error) => {
          console.log("error User info");
          reject(error);
      };
  });
}

async function readMails(){
  var mail = await mailPage();
  //await new Promise(resolve => setTimeout(resolve,1000));

  console.log("mail page return");
  console.log(mail);
  var autoRead = await autoReadMails();
  //await new Promise(resolve => setTimeout(resolve,1000));
  console.log("auto read return");
  console.log(autoRead);
}

async function actionDeleteEmails(listDelete){
  reqid += 1;
  userInfo = {
    "ids": listDelete,
    "reqId": reqid,
    "route": "ml.e"
  };
  let userInfoWs = ws;
  console.log(userInfo);
  userInfo = prepareRequest(userInfo);
  return new Promise((resolve, reject) => {
      userInfoWs.send(userInfo);
      userInfoWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("delete mails" + listDelete);
          //console.log(event.data);
          resolve(onMessageRecieve(event.data));
      };
      userInfoWs.onerror = (error) => {
          console.log("error User info");
          reject(error);
      };
  });
}

async function deleteMails() {  
  var mail = await mailPage();
  //await new Promise(resolve => setTimeout(resolve,1000));

  console.log("mail page return");
  console.log(mail);
  var listMails = mail['d']['d']['l'];
  var listDelete = []
  for (var i = 0 ; i < listMails.length; i++) {
    if(listMails[i]['isAw'] == 1 && listMails[i]['isRe'] == 1){
      listDelete.push(listMails[i]['mId']);
    }
  }
  console.log(listDelete);

  var delMailsRes = await actionDeleteEmails(listDelete);
  //await new Promise(resolve => setTimeout(resolve,1000));
  console.log(delMailsRes);
}

async function readAndDelMails(){
  var rmails = await readMails();
  await new Promise(resolve => setTimeout(resolve,1000));

  var dmails = await deleteMails();
  //await new Promise(resolve => setTimeout(resolve,1000));  
}

async function getUserInfo(){
  reqid += 1;
  userInfo = {
    "label": 0,
    "reqId": reqid,
    "route": "u.b"
  };
  let userInfoWs = ws;
  console.log(userInfo);
  userInfo = prepareRequest(userInfo);
  return new Promise((resolve, reject) => {
      userInfoWs.send(userInfo);
      userInfoWs.onmessage = (event) => {
          console.log(onMessageRecieve(event.data));
          //console.log("get User info");
          //console.log(event.data);
          resolve(onMessageRecieve(event.data));
      };
      userInfoWs.onerror = (error) => {
          console.log("error User info");
          reject(error);
      };
  });
}

async function autoInspector(){
  reqid += 1;
  sfPath = {   
    "reqId": reqid,
    "route": "hu.e"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  let promise = new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("auto autoInspector");
          console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error autoInspector");
          reject(error);
      };
  });
}
async function ancRuinPraise(){
  reqid += 1;
  sfPath = {   
    "reqId": reqid,
    "route": "im.c"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  let promise = new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("auto autoInspector");
          console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error autoInspector");
          reject(error);
      };
  });
}

async function autoRestoreBabyPet(){
  reqid += 1;
  sfPath = {   
    "reqId": reqid,
    "route": "wo.aa"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  let promise = new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("autoRestoreBabyPet");
          console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error autoRestoreBabyPet");
          reject(error);
      };
  });
}

async function getRuinShopInfo(){
  reqid += 1;
  sfPath = {   
    "shopType": "relic",
    "reqId": reqid,
    "route": "s.a"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          // //console.log(onMessageRecieve(event.data));
          // console.log("test");
          // console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error test");
          reject(error);
      };
  });
}

async function buyItemRuinShop(itemId,numLimit){
  reqid += 1;
  sfPath = {   
    "id": itemId,
    "num": numLimit,
    "shopType": "relic",
    "reqId": reqid,
    "route": "s.b"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          // //console.log(onMessageRecieve(event.data));
          // console.log("test");
          // console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error test");
          reject(error);
      };
  });
}

async function buyRuinShop(){
  let listShop = await getRuinShopInfo();
  await new Promise(resolve => setTimeout(resolve,1000));
  console.log("list shop");
  console.log(listShop['d']['d']['list']);
  listShop = listShop['d']['d']['list'];
  // await new Promise(resolve => setTimeout(resolve,1000))
  for(i=7;i<14;i++){
    let limit=listShop[i]['limit'];
    let itemId = listShop[i]['id'];
    if(limit>0){
      await buyItemRuinShop(itemId,limit);
      await new Promise(resolve => setTimeout(resolve,1000));

    }

  }
}

async function doVV(stage){
  reqid += 1;
  var prefix = 10;
  var point = parseInt(prefix.toString()+stage.toString())  
  var passId = parseInt(prefix.toString()+stage.toString().substring(0, 2));
  vvPath = {
    "num":5,
    "point": point,   
    "passId": passId,   
    "reqId": reqid,
    "route": "abn.g"
  };
  let vvWs = ws;
  console.log(vvPath);
  vvPath = prepareRequest(vvPath);
  let promise = new Promise((resolve, reject) => {
      vvWs.send(vvPath);
      vvWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      vvWs.onerror = (error) => {
          console.log("error VV");
          reject(error);
      };
  });
}
async function doXTinvasion(){
  // Récupération de la date actuelle
  let date = new Date();

  // Création d'un objet de date avec la timezone de Hong Kong (GMT+8)
  let hongKongDate = new Date(date.toLocaleString('en-US', {
      timeZone: 'Asia/Hong_Kong'
  }));


  // Récupération du numéro du jour de la semaine
  let heure = hongKongDate.getHours();

  console.log(heure);
  // Vérification si l'heure est entre 14h et 17h
  if (heure >= 14 && heure < 16) {
    reqid += 1;
    xtdPath = {
      "hId":58,
      "id": 1,    
      "reqId": reqid,
      "route": "xt.d"
    };
    let xtdWs = ws;
    console.log(xtdPath);
    xtdPath = prepareRequest(xtdPath);
    let promise = new Promise((resolve, reject) => {
        xtdWs.send(xtdPath);
        xtdWs.onmessage = (event) => {
            resolve(onMessageRecieve(event.data));
        };
        xtdWs.onerror = (error) => {
            console.log("error doXTinvasion");
            reject(error);
        };
    });
  } else {
    console.log("L'heure n'est pas entre 14h et 16h à Hong Kong.");
  }  
}

async function getInteractNumber() {
    reqid +=1;
    interactPageRoute = {
          "reqId": reqid + 1,
          "route": "wo.u"
    };


    let wsInteract = ws;
    console.log(interactPageRoute);
    interactPageRoute = prepareRequest(interactPageRoute);
    let promise = new Promise((resolve, reject) => {
        wsInteract.send(interactPageRoute);
        wsInteract.onmessage = (event) => {
            //console.log(onMessageRecieve(event.data));
            console.log("VisitePage");
            resolve(onMessageRecieve(event.data));

        };
        wsInteract.onerror = (error) => {
            console.log("error VisitePage");
            reject(error);
        };
    });
}

async function useInteractPill() {
    reqid +=1;
    interactPageRoute = {
      "propId":10326,
      "reqId": reqid + 1,
      "route": "wo.w"
    };


    let wsInteract = ws;
    console.log(interactPageRoute);
    interactPageRoute = prepareRequest(interactPageRoute);
    let promise = new Promise((resolve, reject) => {
        wsInteract.send(interactPageRoute);
        wsInteract.onmessage = (event) => {
            //console.log(onMessageRecieve(event.data));
            console.log("VisitePage");
            resolve(onMessageRecieve(event.data));

        };
        wsInteract.onerror = (error) => {
            console.log("error VisitePage");
            reject(error);
        };
    });
}

async function doManualInteract(number) {
    for (let i = 0; i < number; i++) {
      reqid +=1;
      interactRoute = {
            "reqId": reqid + 1,
            "route": "wo.b"
      };


      let wsDoInteract = ws;
      console.log(interactRoute);
      interactRoute = prepareRequest(interactRoute);
      let promiseVisit = new Promise((resolve, reject) => {
          wsDoInteract.send(interactRoute);
          wsDoInteract.onmessage = (event) => {
              console.log("Interact manual");
              resolve(onMessageRecieve(event.data));

          };
          wsDoInteract.onerror = (error) => {
              console.log("error manual interact");
              reject(error);
          };
      });
    }
}
async function doInteractEvent(number) {

  var numLeft = await getInteractNumber();
  console.log(numLeft);
  if (numLeft>0) {
    await doManualInteract(numLeft);
    await useInteractPill();    
  } else {
    await useInteractPill();
  }
  await new Promise(resolve => setTimeout(resolve,500));   

  for (var i = 0 ; i < number; i++) {
    console.log("for done: " + i);
    await useInteractPill();     
    await new Promise(resolve => setTimeout(resolve,500));   

    numLeft = await getInteractNumber();
    await new Promise(resolve => setTimeout(resolve,500));   

    await doManualInteract(numLeft);
    await new Promise(resolve => setTimeout(resolve,1000));   
  }
}

async function doAdventure() {
      reqid +=1;
      //cultivate FL
      advRoute = {
          "mId":20,
          "num":60,
          "reqId": reqid + 1,
          "route": "m.h"
      };

      let wsDoAdv = ws;
      console.log(advRoute);
      advRoute = prepareRequest(advRoute);
      let promise = new Promise((resolve, reject) => {
          wsDoAdv.send(advRoute);
          wsDoAdv.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("Do x60 Adventure done");
              resolve(onMessageRecieve(event.data));

          };
          wsDoAdv.onerror = (error) => {
              console.log("error adventure");
              reject(error);
          };
      });    
}
async function ensoul() {
      reqid +=1;
      //cultivate FL
      advRoute = {
          "reqId": reqid + 1,
          "route": "m.j"
      };

      let wsDoAdv = ws;
      console.log(advRoute);
      advRoute = prepareRequest(advRoute);
      let promise = new Promise((resolve, reject) => {
          wsDoAdv.send(advRoute);
          wsDoAdv.onmessage = (event) => {
              //console.log(onMessageRecieve(event.data));
              console.log("ensoul");
              resolve(onMessageRecieve(event.data));

          };
          wsDoAdv.onerror = (error) => {
              console.log("error adventure");
              reject(error);
          };
      });    
}


async function checkCurrentStatusAdventure(){
  reqid += 1;
  sfPath = {   
    "reqId": reqid,
    "route": "m.n"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);


  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));

          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error test");
          reject(error);
      };
  });
}

async function checkAndLaunchAdventure() {
  var status = await checkCurrentStatusAdventure();
  console.log("--------------------- status adventure ----------------------");
  try {
    status = status['d']['d']['c']['User.getInfo']['i']['mInfo'];
    console.log(status);
    var currentTimestamp = new Date().getTime();
    console.log("currentTimestamp");
    console.log(currentTimestamp);
    console.log("hangtime");
    console.log(status['@s.hangTime']);
    console.log("status['@s.hangTime']<currentTimestamp");
    console.log(status['@s.hangTime']<currentTimestamp);
    if(status['@s.hangNow']>0 && status['@s.hangTime']<currentTimestamp){
      console.log("--------------------- ensoul and run adventure ----------------------");

      await ensoul();
      await new Promise(resolve => setTimeout(resolve,500));

      await doAdventure();
    } else {
      if(status['@s.hangNow'] == 0){
        await doAdventure();
      }
    }
  }catch(error){
    console.log("error adventure");
  }
}

async function getEvents(){
  reqid += 1;
  sfPath = {   
    "reqId": reqid,
    "route": "at.a"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);


  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error test");
          reject(error);
      };
  });
}

async function servantAdsStatus(){
  reqid += 1;
  sfPath = {   
    "reqId": reqid,
    "route": "at.sa"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);


  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
        resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error test");
          reject(error);
      };
  });
}

async function openChest(idChest,numChest){
  reqid += 1;
  sfPath = {
    "cId": idChest,
    "num": numChest,   
    "reqId": reqid,
    "route": "prp.a"
  };

  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  let promise = new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("open Chest for inspector");
          console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error open Chest for inspector");
          reject(error);
      };
  });
}
async function useToken(numToken){
  reqid += 1;
  sfPath = {
    "cId": 10319,
    "num": numToken,   
    "reqId": reqid,
    "route": "u.va"
  };

  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  let promise = new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("using inspector token");
          console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error using inspector token");
          reject(error);
      };
  });
}

async function usePCandIT(){

  await getUserInfo();
  await new Promise(resolve => setTimeout(resolve,1000));
  console.log("------------- userInfos --------------");
  if(userInfos['d']['props'].find(element => element.cId === 10419)){
    var chests = userInfos['d']['props'].find(element => element.cId === 10419);
    console.log(chests['num']);
    writeLogs(chests['num'].toString() + " Primordial Chest in the bag");
    await openChest(10419,chests['num']);
    await new Promise(resolve => setTimeout(resolve,1000));
  }
  await getUserInfo();
  await new Promise(resolve => setTimeout(resolve,1000));
  if(userInfos['d']['props'].find(element => element.cId === 10319)){
  var inspectorToken = userInfos['d']['props'].find(element => element.cId === 10319);
    console.log(inspectorToken['num']);
    writeLogs(inspectorToken['num'].toString() + " Inspector Token in the bag");
    await useToken(inspectorToken['num']);
    await new Promise(resolve => setTimeout(resolve,1000));
  }

}


async function getPantheonChatReward(){
  reqid += 1;
  sfPath = {
    "id": 15, 
    "reqId": reqid,
    "route": "cg.dtb"
  };

  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  let promise = new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("get pantheonChat reward");
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error get pantheonChat reward");
          reject(error);
      };
  });
}
async function getPantheonRewardStatus(){
  reqid += 1;
  sfPath = {
    "reqId": reqid,
    "route": "cg.dta"
  };

  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("getPantheonRewardStatus");
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error getPantheonRewardStatus");
          reject(error);
      };
  });
}

async function checkPantheonChatStatus(){

  //await getPantheonChatReward();

  pantheonRewards = await getPantheonRewardStatus();
  await new Promise(resolve => setTimeout(resolve,1000));
  console.log(pantheonRewards);
  chatStatus = pantheonRewards['d']['d']['l'].find(element => element.id === 15);
  console.log(chatStatus);
  if (chatStatus['awded'] == 1) {
    pantheonChatDone = true;
  }

}

async function buyDaisyGob(){
  reqid += 1;
  sfPath = {
    "id": 3,
    "reqId": reqid,
    "route": "b.o"
  };

  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          console.log("buy daisy gobelet");
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error buy daisy gobelet");
          reject(error);
      };
  });
}

async function buy10Booze(){
  reqid += 1;
  sfPath = {
    "id": 2,
    "reqId": reqid,
    "route": "b.k"
  };

  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          console.log("buy 10 booze");
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error buy 10 booze");
          reject(error);
      };
  });
}

async function doBrew(){

  await getUserInfo();
  await new Promise(resolve => setTimeout(resolve,1000));
  var boozeNum=0;
  console.log("------------- userInfos --------------");
  if(userInfos['d']['props'].find(element => element.cId === 1069)){
    var booze = userInfos['d']['props'].find(element => element.cId === 1069);
    console.log(booze['num']);
    boozeNum=booze['num'];
    await new Promise(resolve => setTimeout(resolve,1000));
  }

  if(boozeNum>0){
    await buyDaisyGob();
  } else {
    await buy10Booze();
    await new Promise(resolve => setTimeout(resolve,500));    
    await buyDaisyGob();
  }

}


async function buylv2map(){
  reqid += 1;
  sfPath = {
    "id": 11010,
    "shopType":"lingbao",
    "num":1,
    "reqId": reqid,
    "route": "s.b"
  };

  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          console.log("buy 1 lvl 2 map");
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error buy 1 lvl 2 map");
          reject(error);
      };
  });
}

async function uselv2map(){
  reqid += 1;
  sfPath = {
    "cId":10295,
    "num":10,
    "reqId": reqid,
    "route": "tr.e"
  };

  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          console.log("uselv2map");
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error uselv2map");
          reject(error);
      };
  });
}

async function doBUmap(){
  await buylv2map();
  await new Promise(resolve => setTimeout(resolve,500));
  await uselv2map();
}

async function checkPets(){
  reqid += 1;
  sfPath = {
    "reqId": reqid,
    "route": "wo.a"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error checkPets");
          reject(error);
      };
  });
}

async function accompanyPet(petId){
  reqid += 1;
  sfPath = {
    "cId": petId,
    "reqId": reqid,
    "route": "wo.c"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  let promise = new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error accompanyPet");
          reject(error);
      };
  });
}

async function doAccompanyPets() {
  var petStatus = await checkPets();
  await new Promise(resolve => setTimeout(resolve,500));
  console.log(petStatus);
  petStatus=petStatus['d']['d']['woods'];
  petsTodo = [];

  for (var i = 0; i < 4; i++) {
    if(petStatus[i]['wNum'] == 0){
      petsTodo.push(petStatus[i]['id']);
    }
  }

  console.log(petsTodo);
  if(petsTodo.length>0){    
    for (var i = 0; i < petsTodo.length; i++) {
      await accompanyPet(petsTodo[i]);
      await new Promise(resolve => setTimeout(resolve,500));
    }
    writeLogs("free pets accompany done");
  } else {
    writeLogs("no free pets accompany available");

  }

}

async function getFLstatus(){
  reqid += 1;
  sfPath = {
    "reqId": reqid,
    "route": "fd.a"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error autoRestoreBabyPet");
          reject(error);
      };
  });
}
async function checkFL(){
  reqid += 1;
  sfPath = {
    "reqId": reqid,
    "route": "fd.f"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error autoRestoreBabyPet");
          reject(error);
      };
  });
}


async function robFL(uid){
  reqid += 1;
  sfPath = {
    "dUid":uid,
    "reqId": reqid,
    "route": "fd.d"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  let promise = new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error autoRestoreBabyPet");
          reject(error);
      };
  });
}

async function doRobFL(){
  var fightLimit = await getFLstatus();
  await new Promise(resolve => setTimeout(resolve,500));
  if(fightLimit['d']['d']['i']['snatchCount'] > 0){
    var flList = await checkFL();
    await new Promise(resolve => setTimeout(resolve,1000));
    console.log(flList);
    try{
      var resultat = flList['d']['d']['l'].find(element => element.name === 'hero@rn1');
      await robFL(resultat['uId']);
      await new Promise(resolve => setTimeout(resolve,500));
      writeLogs("1 rob done in FL against IA");

    } catch(error) {
      writeLogs("No rob done because no IA available");
    }
  }  
}

async function buyCompeteShop(id,num){
  reqid += 1;
  sfPath = {
    "id":id,
    "shopType":"arena",
    "num":num,
    "reqId": reqid,
    "route": "s.b"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  let promise = new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          console.log("buyCompeteShop");
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error buyCompeteShop");
          reject(error);
      };
  });
}

function getCurrentAlliancePriceUnlimited(startPrice,inc,num){
  let price = startPrice;
  for (let i = 1; i <= num; i++) {
    price = (startPrice + inc * (i-1));
  } 
  return price;
}

async function doMaxDemonSeal(){
  reqid += 1;
  sfPath = {
    "reqId": reqid,
    "route": "mt.a"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error demonSeal");
          reject(error);
      };
  });
}

async function useProps(cId,num){
  reqid += 1;
  sfPath = {
    "cId": cId,
    "num": num,
    "reqId": reqid,
    "route": "prp.a"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error use props");
          reject(error);
      };
  });
}

async function runRequests(userName, password, server, settings) {
    console.log("settings");
    console.log(settings);
    if (settings != null) {
        let accessToken = await getToken(userName, password, server);
        try {
            await initWebSocket(accessToken, server);
            await new Promise(resolve => setTimeout(resolve,1000));
            // const userInfos = await getUserInfo();
            await getUserInfo();
            await new Promise(resolve => setTimeout(resolve,1000));
            console.log("------------- userInfos --------------");
            console.log(userInfos);
            await getEvents();
            try{
              await checkPantheonChatStatus();

            } catch(error){
              console.log("not in pantheon");
            }
            await new Promise(resolve => setTimeout(resolve,1000));

            console.log("--------event---------");
            var adsLimitsStatus = events['d']['d']['l'];
            adsIndex = adsLimitsStatus.findIndex(element => element.id === 'shareSwitchTask');
            adsLimitsStatus = adsLimitsStatus[adsIndex]['list'];
            var adsLimits = {}
            adsLimits['xianGe'] = adsLimitsStatus['xianGe']['num'];
            adsLimits['blackMarket'] = adsLimitsStatus['blackMarket']['num'];
            adsLimits['home'] = adsLimitsStatus['home']['num'];
            adsLimits['robe'] = adsLimitsStatus['robe']['num'];
            adsLimits['shopRecharge'] = adsLimitsStatus['shopRecharge']['num'];
            console.log(adsLimits);
            const servantAdsStat = await servantAdsStatus();

            await new Promise(resolve => setTimeout(resolve,1000));
            // const userI = userInfos['d']['d']['i'];
            console.log("--------------- test userInfos ---------------");
            console.log(userInfos);
            const userI = userInfos['d']['i'];
            

            

            var eventsList = events['d']['d']['l'];
            // let adsLimit = events['d']['d']['l'].find(element => element.id === 'shareSwitch');
            // adsLimit = adsLimit['ids'];
            // let servantAdsLimit = servantAdsStat['d']['d'];
            if (settings['doTreeCheckbox'] == true && settings['doTreeIds'] != null) {
              await new Promise(resolve => setTimeout(resolve,1000));
              await doFriendTree(settings);
            }
            //await new Promise(resolve => setTimeout(resolve,1000));
            //test = await getUserInfo();
            //console.log(test);


            //await getCurrentAllianceShop();
            shop = "guild";
            await new Promise(resolve => setTimeout(resolve,500));            
            await doShopPath(shop,"s.a");
            await new Promise(resolve => setTimeout(resolve,1000));
            console.log(currentShop['d']['d']['list']);
            var oeprice = currentShop['d']['d']['list'].find(element => element.id === 204);
            var osprice = currentShop['d']['d']['list'].find(element => element.id === 205);
            var opprice = currentShop['d']['d']['list'].find(element => element.id === 206);
            var gritPrice = currentShop['d']['d']['list'].find(element => element.id === 207);
            console.log(oeprice['price']);
            console.log(getCurrentAlliancePriceUnlimited(oeprice,10,settings['originEssenceQuantity']));
            console.log(oeprice['price'] <= getCurrentAlliancePriceUnlimited(100, 10,settings['originEssenceQuantity']))
            console.log("valeur de getCurrentAlliancePriceUnlimited avec 150");
            console.log(getCurrentAlliancePriceUnlimited(100,10,150));

            await new Promise(resolve => setTimeout(resolve,1000));
            await buyAndDoMiniEvent();

            await new Promise(resolve => setTimeout(resolve,1000));
            await autoRestoreBabyPet();

            await new Promise(resolve => setTimeout(resolve,1000));
            await autoInspector();
            await ancRuinPraise();
            await doTypePath("centerFp","gp.g");
            await doTypePath("centerHeroFp","gp.g");
            await doTypePath("centerTreeLv","gp.g");
            

            shop = "sect";
            await new Promise(resolve => setTimeout(resolve,500));            
            await doShopPath(shop,"s.a");
            await new Promise(resolve => setTimeout(resolve,1000));
            shop = "";
            await new Promise(resolve => setTimeout(resolve,500));

            //Take care of props in bag
            const bag = userInfos['d']['props'];
            const cIds = [1047, 1002, 1003, 1005, 1033, 1035, 1034, 14053];
            const filteredItems = bag.filter(item => cIds.includes(item.cId));

            const result = filteredItems.reduce((acc, item) => {
                acc[item.cId] = item.num;
                return acc;
            }, {});

            // Vérifier si result n'est pas vide
            if (Object.keys(result).length !== 0) {
                // Parcourir les cIds et afficher les valeurs num correspondantes
                cIds.forEach(cId => {
                    if (result.hasOwnProperty(cId)) {
                        const num = result[cId];
                        console.log(`cId: ${cId}, num: ${num}`);
                        useProps(cId,num);
                    } else {
                        console.log(`cId: ${cId} not in result.`);
                    }
                });
            } else {
                console.log("result is empty");
            }
            // end of taking care of props in bag


            if (settings['doWorshipCheckbox'] == true && settings['doWorshipId'] != null) {
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("doWorship");
                await doWorship(settings['doWorshipId']);
            }
            if (settings['doBeastCheckbox'] == true && settings['beastLevel'] != null) {
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("doBeast");
                await doBeast(settings['beastLevel']);
            }
            if (settings['doBuildWoodCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("build alliance wood");
                await doBuildWood();
            }
            if (settings['doFLCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("Do FL");
                await doFL();
            }
            if (settings['doCompeteCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("Do compete");
                await doCompete();
            }
            if (settings['doBreatheCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("Do breathe");
                await doBreathe();
            }
            if (settings['doAdventureCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("Do adventure");
                await checkAndLaunchAdventure();
            }
            if (settings['doXtdCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("Do doXtdCheckbox");
                await doXTinvasion();
            }
            if (settings['doHellCheckbox'] == true && settings['hellNumber'] != null){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("Do Hell");
                await doHell(settings['hellNumber']);
            }
            if (settings['doSPCheckbox'] == true && settings['spNumber'] != null){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("Do spirit pact");
                await doSpiritPact(settings['spNumber']);
            }
            if (settings['doSTCheckbox'] == true && settings['stNumber'] != null){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("Do spirit troop");
                await doSpiritTroop(settings['stNumber']);
            }
            if (settings['doVVCheckbox'] == true && settings['vvNumber'] != null){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("Do VV");
                await doVV(settings['vvNumber']);
                await doVV(settings['vvNumber']);
            }
            if (settings['doInteractEventCheckbox'] == true && settings['doInteractEventNumber'] != null){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("doInteractEvent");
                await doInteractEvent(settings['doInteractEventNumber']);
            }

            if (settings['doPchatCheckbox'] == true && settings['pantheonWord'] != null && pantheonChatDone == false){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("Do pantheon chat");
                await doPantheonChat(settings['pantheonWord']);
                await new Promise(resolve => setTimeout(resolve,500));                
                await getPantheonChatReward();
            }
            if (settings['doVisitCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("doVisit");
                await getVisitNumber();
            }
            if (settings['doMaxDemonSealCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("########doMaxDemonSeal#########");
                await doMaxDemonSeal();
            }
            if (settings['doInteractCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));

                console.log("doInteract");
                await getInteractNumber();
            }
            if (settings['doBrewCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("doBrew");
                await doBrew();
            }
            if (settings['doBUmapCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("doBUmap");
                await doBUmap();
            }
            if (settings['doAccompanyCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("doAccompanyCheckbox");
                await doAccompanyPets();
            }
            if (settings['beastForageCheckbox'] == true && settings['beastForageQuantity'] != null && settings['beastForageQuantity']*500 <= userI['mcb']){
              await new Promise(resolve => setTimeout(resolve,1000));

              console.log("getBeastFoodLimit");
              await buyBeastMarketResources(402,settings['beastForageQuantity']);
            }
            if (settings['heavenIntPillCheckbox'] == true && settings['heavenIntPillQuantity'] != null && settings['heavenIntPillQuantity']*300 <= userI['mcb']){
              await new Promise(resolve => setTimeout(resolve,1000));

              console.log("getBeastFoodLimit");
              await buyBeastMarketResources(405,settings['heavenIntPillQuantity']);
            }
            if (settings['headenCrystalCheckbox'] == true && settings['headenCrystalQuantity'] != null && settings['headenCrystalQuantity']*1500 <= userI['mcb']){
              await new Promise(resolve => setTimeout(resolve,1000));

              console.log("getBeastFoodLimit");
              await buyBeastMarketResources(406,settings['headenCrystalQuantity']);
            }
            if (settings['buyLimitedAllianceShopCheckbox'] == true &&  userI['fcb'] >= 38600){
              await new Promise(resolve => setTimeout(resolve,1000));

              console.log("buyLimitedAllianceShopCheckbox");
              await doLimitedAllianceShop();
            }
            if (settings['buyLimitedRuinShopCheckbox'] == true && userI['recb'] >= 330000){
              await new Promise(resolve => setTimeout(resolve,1000));

              console.log("buyLimitedRuinShopCheckbox");
              try{
                await buyRuinShop();

              } catch(error){
                console.log("error ruin");
                console.log(error);
              }
            }            


            if (settings['originEssenceCheckbox'] == true && settings['originEssenceQuantity'] != null && oeprice['price'] == 100){
              await new Promise(resolve => setTimeout(resolve,1000));
              if(oeprice['price']<=getCurrentAlliancePriceUnlimited(100, 10,settings['originEssenceQuantity'])){

                console.log("############# OE PRICE");
                console.log(oeprice['price']);
                console.log("############# getCurrentAlliancePriceUnlimited");
                console.log(getCurrentAlliancePriceUnlimited(100, 10,settings['originEssenceQuantity']));
                console.log("doUnlimitedAllianceShop essence");
                await doUnlimitedAllianceShop(204,settings['originEssenceQuantity']);
              }              
            }

            if (settings['originSoulCheckbox'] == true && settings['originSoulQuantity'] != null){
              await new Promise(resolve => setTimeout(resolve,1000));
              if(osprice['price']<=getCurrentAlliancePriceUnlimited(100, 10,settings['originSoulQuantity'])){
                console.log("doUnlimitedAllianceShop soul");
                await doUnlimitedAllianceShop(205,settings['originSoulQuantity']);
              }   

              
            }


            if (settings['originPsicrystalCheckbox'] == true && settings['originPsicrystalQuantity'] != null){
              await new Promise(resolve => setTimeout(resolve,1000));
              if(opprice['price']<=getCurrentAlliancePriceUnlimited(200, 20,settings['originPsicrystalQuantity'])){

                console.log("doUnlimitedAllianceShop grit");
                await doUnlimitedAllianceShop(206,settings['originPsicrystalQuantity']);
              }               
            }

            if (settings['originGritCheckbox'] == true && settings['originGritQuantity'] != null && gritPrice['price'] == 400){
              console.log("grit test");
              await new Promise(resolve => setTimeout(resolve,1000));
              if(gritPrice['price']<=getCurrentAlliancePriceUnlimited(400, 40,settings['originGritQuantity'])){
                console.log("############# GRIT PRICE");
                console.log(gritPrice['price']);
                console.log("############# getCurrentAlliancePriceUnlimited");
                console.log(getCurrentAlliancePriceUnlimited(400, 40,settings['originGritQuantity']));
                console.log("doUnlimitedAllianceShop grit");
                await doUnlimitedAllianceShop(207,settings['originGritQuantity']);
              }   
            }

            if (settings['hellBfCheckbox'] == true && settings['hellBfQuantity'] != null && settings['hellBfQuantity']*15 <= userI['mgcc']){
              await new Promise(resolve => setTimeout(resolve,1000));

              console.log("do hell Shop bf");
              await doHellShop(2,settings['hellBfQuantity']);
            }
            if (settings['hellHpCheckbox'] == true && settings['hellHpQuantity'] != null && settings['hellHpQuantity']*10 <= userI['mgcc']){
              await new Promise(resolve => setTimeout(resolve,1000));

              console.log("do hell Shop heavenIntPill");
              await doHellShop(5,settings['hellHpQuantity']);
            }
            if (settings['hellHcCheckbox'] == true && settings['hellHcQuantity'] != null && settings['hellHcQuantity']*50 <= userI['mgcc']){
              await new Promise(resolve => setTimeout(resolve,1000));

              console.log("do hell Shop heavenly crystal");
              await doHellShop(6,settings['hellHcQuantity']);
            }
            if (settings['doBoutiqueCheckbox'] == true){
              await new Promise(resolve => setTimeout(resolve,1000));

              console.log("doBoutique");
              await doBoutique();
            }
            if (settings['useBoutiqueKeyCheckbox'] == true){
              await new Promise(resolve => setTimeout(resolve,1000));
              console.log("useBoutiqueKey");
              await useBoutiqueKeys();
            }
            if (settings['buyCompeteP4H1Checkbox'] == true){
              await new Promise(resolve => setTimeout(resolve,1000));
              console.log("buyCompeteP4H1Checkbox");
              await buyCompeteShop(113,2);
            }
            if (settings['buyCompeteTPP1Checkbox'] == true){
              await new Promise(resolve => setTimeout(resolve,1000));
              console.log("buyCompeteTPP1Checkbox");
              await buyCompeteShop(114,2);
            }
            if (settings['buyCompeteP4H2Checkbox'] == true){
              await new Promise(resolve => setTimeout(resolve,1000));
              console.log("buyCompeteP4H2Checkbox");
              await buyCompeteShop(115,3);
            }
            if (settings['buyCompeteTPP2Checkbox'] == true){
              await new Promise(resolve => setTimeout(resolve,1000));
              console.log("buyCompeteTPP2Checkbox");
              await buyCompeteShop(116,3);
            }
            

            if (settings['doXTshopCheckbox'] == true && userI['xingTianSc'] > 9000){
              await new Promise(resolve => setTimeout(resolve,1000));

              console.log("doXtShop");
              await doXTShop();
            }
            if (settings['doManLocCotCheckbox'] == true){
              await new Promise(resolve => setTimeout(resolve,1000));

              await manualCotLocal();
            }

            if (settings['doManCSCotCheckbox'] == true){
              await new Promise(resolve => setTimeout(resolve,1000));

              await manualCotCS();
            }


            if (settings['doManStormCotCheckbox'] == true){
              await new Promise(resolve => setTimeout(resolve,1000));

              await manualCotStorm();
            }

            if (settings['doManHeavenlyCotCheckbox'] == true){
              await new Promise(resolve => setTimeout(resolve,1000));

              await manualCotHeavenly();
            }

            if (settings['doManACSCotCheckbox'] == true){
              await new Promise(resolve => setTimeout(resolve,1000));

              await manualCotACS();
            }
            if (settings['doChaosCheckbox'] == true){
              await new Promise(resolve => setTimeout(resolve,1000));
              await doChaos();
            }
            
            if (settings['doAllAdsCheckbox'] == true && (adsLimits['xianGe'] != 10 || adsLimits['blackMarket'] != 10 || adsLimits['home'] != 10 || adsLimits['robe'] != 8 || adsLimits['shopRecharge'] != 8) ){
              await new Promise(resolve => setTimeout(resolve,1000));
              //await doAds(adsLimit);
              await doAds();
            }

            if (settings['usePCandITCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));
                console.log("usePCandIT");
                await usePCandIT();
            }
            if (settings['doRuinCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));

                console.log("doRuinCheckbox");
                await doRuin();
            }
            if (settings['doRobFLCheckbox'] == true){
                await new Promise(resolve => setTimeout(resolve,1000));

                console.log("doRobFLCheckbox");
                await doRobFL();
            }

            if (settings['doPantheonRewardCheckbox'] == true){
              await new Promise(resolve => setTimeout(resolve,2000))
              console.log("get pantheon rewards");
              await doPantheonReward();
              await new Promise(resolve => setTimeout(resolve,2000))
              console.log("get pantheon rewards chest");
              await doPantheonRewardChest();
            }
            if(settings['readAndDelMailsCheckBox'] == true){
              await new Promise(resolve => setTimeout(resolve,1000));
              console.log("readAndDelMails");
              try{
                await readAndDelMails();
              }catch(error){
                ws.close();
              }
            }


            
            await new Promise(resolve => setTimeout(resolve,2000))
            ws.close();

        } catch (error) {
            console.error('An error occurred: ' + error);
            writeLogs("Unlogged due to an error");
            ws.close();
        }
        

    } else {
        writeLogs("No settings selected");
    }

}


async function auto() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequests(userName, password, serv, settings);

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}

// AUTO LOCAL COT

async function doCot(eId) {
    // Créer une promesse pour la première requête
    const buy50buffPromise = new Promise((resolve, reject) => {
        let buy50buff = {
            "id": 110,
            "reqId": reqid,
            "route": "xf.d"
        };
        let wsBuy50buff = ws;
        buy50buff = prepareRequest(buy50buff);
        wsBuy50buff.send(buy50buff);
        reqid += 1;

        wsBuy50buff.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsBuy50buff.onerror = (error) => {
            reject(error);
        };
    });

    // Envelopper la partie autoCot dans une nouvelle promesse
    const autoCotPromise = new Promise((resolve, reject) => {
        let autoCot = {
            "dId": eId,
            "buyType": 0,
            "reqId": reqid,
            "route": "xf.j"
        }

        let wsAutoCot = ws;
        autoCot = prepareRequest(autoCot);
        wsAutoCot.send(autoCot);
        reqid += 1;

        wsAutoCot.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsAutoCot.onerror = (error) => {
            reject(error);
        };
    });

    let autoCotResponse = await autoCotPromise;

    // Retourner un message
    return autoCotResponse;
}

function isReadyLocalCot() {
    console.log("isReadyLocalCot");
    return new Promise((resolve, reject) => {
        let cotRoute = {
            "reqId": reqid,
            "route": "xf.a"
        };
        let wsCot = ws;
        cotRoute = prepareRequest(cotRoute);
        wsCot.send(cotRoute);

        wsCot.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            console.log("response isReadyLocalCot");
            console.log(response);
            try {
                if (response['d']['d']['def']['eId'] !== 0) {
                    console.log("response['d']['d']['def']['eId']");
                    console.log(response['d']['d']['def']['eId']);
                    resolve(response['d']['d']['def']['eId']);
                } else {
                    reject('eId is 0');
                }
            } catch {
                console.log("error response cot");
                console.log(response);
            }
        };

        ws.onerror = (error) => {
            reject(error);
        };
    });
}

async function runRequestsCot(userName, password, server, settings) {

    let accessToken = await getToken(userName, password, server);
    console.log("accessToken");
    console.log(accessToken);
    try {
        await initWebSocket(accessToken, server);
        try {
            await new Promise(resolve => setTimeout(resolve,1000));
            let eId = await isReadyLocalCot(settings);
            await new Promise(resolve => setTimeout(resolve,1000));
            writeLogs("CoT is ready");
            let cotResult = await doCot(eId);
            console.log(cotResult);
            writeLogs("CoT is done");
            ws.close();
        } catch (error) {
            writeLogs("CoT not ready");
            console.error('Local cot not rdy');
            ws.close();
        }

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}


async function autoCot() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsCot(userName, password, serv, settings);
    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}

// AUTO CS COT
async function doCSCot(eId) {
    // Créer une promesse pour la première requête
    const buy50buffPromise = new Promise((resolve, reject) => {
        let buy50buff = {
            "actName":"crossDebateRank2",
            "id": 110,
            "reqId": reqid,
            "route": "xfcc.d"
        };
        let wsBuy50buff = ws;
        buy50buff = prepareRequest(buy50buff);
        wsBuy50buff.send(buy50buff);
        reqid += 1;

        wsBuy50buff.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsBuy50buff.onerror = (error) => {
            reject(error);
        };
    });

    // Envelopper la partie autoCot dans une nouvelle promesse
    const autoCotPromise = new Promise((resolve, reject) => {
        let autoCot = {
            "actName":"crossDebateRank2",
            "dId": eId,
            "buyType": 0,
            "reqId": reqid,
            "route": "xfcc.j"
        }

        let wsAutoCot = ws;
        autoCot = prepareRequest(autoCot);
        wsAutoCot.send(autoCot);
        reqid += 1;

        wsAutoCot.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsAutoCot.onerror = (error) => {
            reject(error);
        };
    });

    let autoCotResponse = await autoCotPromise;

    // Retourner un message
    return autoCotResponse;
}

function isReadyCsCot() {
    console.log("isReadyCSCot");
    return new Promise((resolve, reject) => {
        let cotRoute = {
            "actName":"crossDebateRank2",
            "reqId": reqid,
            "route": "xfcc.a"
        };
        let wsCot = ws;
        cotRoute = prepareRequest(cotRoute);
        wsCot.send(cotRoute);

        wsCot.onmessage = (event) => {
           let response = onMessageRecieve(event.data);
            console.log("response isReadyCsCot");
            console.log(response);
            try {
                if (response['d']['d']['def']['eId'] !== 0) {
                    console.log("response['d']['d']['def']['eId']");
                    console.log(response['d']['d']['def']['eId']);
                    resolve(response['d']['d']['def']['eId']);
                } else {
                    resolve(0);
                }
            } catch {
                console.log("error response cs cot");
                console.log(response);
            }
        };

        ws.onerror = (error) => {
            reject(error);
        };
    });
}

async function runRequestsCotCS(userName, password, server, settings) {

    let accessToken = await getToken(userName, password, server);
    console.log("accessToken");
    console.log(accessToken);
    try {
        await initWebSocket(accessToken, server);
        try {
            await new Promise(resolve => setTimeout(resolve,1000));
            let eId = await isReadyCsCot(settings);
            console.log("AUTO eID");
            console.log(eId);
            await new Promise(resolve => setTimeout(resolve,1000));
            if(eId == 0){
              try{
                await tryAtk();
                await new Promise(resolve => setTimeout(resolve,1000));
                eId = await isReadyCsCot(settings);
                await new Promise(resolve => setTimeout(resolve,1000));

              } catch(error){}
            } 
            writeLogs("CS CoT is ready");
            let cotResult = await doCSCot(eId);
            console.log(cotResult);
            writeLogs("CS CoT is done");
            ws.close();
        } catch (error) {
            writeLogs("CS CoT not ready");
            console.error('CS cot not rdy');
            ws.close();
        }

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}


async function autoCotCS() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsCotCS(userName, password, serv, settings);
    } catch (error) {
        console.error('An error occurred: ' + error);
    }


}


// AUTO storm COT
async function doStormCot(eId) {
    // Créer une promesse pour la première requête
    const buy50buffPromise = new Promise((resolve, reject) => {
        let buy50buff = {
            "actName":"contendDebateRank3",
            "id": 110,
            "reqId": reqid,
            "route": "xfcc.d"
        };
        let wsBuy50buff = ws;
        buy50buff = prepareRequest(buy50buff);
        wsBuy50buff.send(buy50buff);
        reqid += 1;

        wsBuy50buff.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsBuy50buff.onerror = (error) => {
            reject(error);
        };
    });

    // Envelopper la partie autoCot dans une nouvelle promesse
    const autoCotPromise = new Promise((resolve, reject) => {
        let autoCot = {
            "actName":"contendDebateRank3",
            "dId": eId,
            "buyType": 0,
            "reqId": reqid,
            "route": "xfcc.j"
        }

        let wsAutoCot = ws;
        autoCot = prepareRequest(autoCot);
        wsAutoCot.send(autoCot);
        reqid += 1;

        wsAutoCot.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsAutoCot.onerror = (error) => {
            reject(error);
        };
    });

    let autoCotResponse = await autoCotPromise;

    // Retourner un message
    return autoCotResponse;
}

function isReadyStormCot() {
    console.log("isReadyStormCot");
    return new Promise((resolve, reject) => {
        let cotRoute = {
            "actName":"contendDebateRank3",
            "reqId": reqid,
            "route": "xfcc.a"
        };
        let wsCot = ws;
        cotRoute = prepareRequest(cotRoute);
        wsCot.send(cotRoute);

        wsCot.onmessage = (event) => {
           let response = onMessageRecieve(event.data);
            console.log("response isReadyStormCot");
            console.log(response);
            try {
                if (response['d']['d']['def']['eId'] !== 0) {
                    console.log("response['d']['d']['def']['eId']");
                    console.log(response['d']['d']['def']['eId']);
                    resolve(response['d']['d']['def']['eId']);
                } else {
                    resolve(0);
                }
            } catch {
                console.log("error response cs cot");
                console.log(response);
            }
        };

        ws.onerror = (error) => {
            reject(error);
        };
    });
}

async function runRequestsCotStorm(userName, password, server, settings) {

    let accessToken = await getToken(userName, password, server);
    console.log("accessToken");
    console.log(accessToken);
    try {
        await initWebSocket(accessToken, server);
        try {
            await new Promise(resolve => setTimeout(resolve,1000));
            let eId = await isReadyStormCot(settings);
            console.log("AUTO eID");
            console.log(eId);
            await new Promise(resolve => setTimeout(resolve,1000));
            if(eId == 0){
              try{
                await tryAtk();
                await new Promise(resolve => setTimeout(resolve,1000));
                eId = await isReadyStormCot(settings);
                await new Promise(resolve => setTimeout(resolve,1000));

              } catch(error){}
            } 
            writeLogs("CS CoT is ready");
            let cotResult = await doStormCot(eId);
            console.log(cotResult);
            writeLogs("CS CoT is done");
            ws.close();
        } catch (error) {
            writeLogs("CS CoT not ready");
            console.error('CS cot not rdy');
            ws.close();
        }

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}


async function autoCotStorm() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsCotStorm(userName, password, serv, settings);
    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}

// AUTO ACS COT

async function doACSCot(eId) {
    // Créer une promesse pour la première requête
    const buy50buffPromise = new Promise((resolve, reject) => {
        let buy50buff = {
            "actName":"guildDebateRank2",
            "id": 110,
            "reqId": reqid,
            "route": "xfc.d"
        };
        let wsBuy50buff = ws;
        buy50buff = prepareRequest(buy50buff);
        wsBuy50buff.send(buy50buff);
        reqid += 1;

        wsBuy50buff.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsBuy50buff.onerror = (error) => {
            reject(error);
        };
    });

    // Envelopper la partie autoCot dans une nouvelle promesse
    const autoCotPromise = new Promise((resolve, reject) => {
        let autoCot = {
            "actName":"guildDebateRank2",
            "dId": eId,
            "buyType": 0,
            "reqId": reqid,
            "route": "xfc.j"
        }

        let wsAutoCot = ws;
        autoCot = prepareRequest(autoCot);
        wsAutoCot.send(autoCot);
        reqid += 1;

        wsAutoCot.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsAutoCot.onerror = (error) => {
            reject(error);
        };
    });

    let autoCotResponse = await autoCotPromise;

    // Retourner un message
    return autoCotResponse;
}

function isReadyACsCot() {
    console.log("isReadyACSCot");
    return new Promise((resolve, reject) => {
        let cotRoute = {
            "actName":"guildDebateRank2",
            "reqId": reqid,
            "route": "xfc.a"
        };
        let wsCot = ws;
        cotRoute = prepareRequest(cotRoute);
        wsCot.send(cotRoute);

        wsCot.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            console.log("response isReadyACsCot");
            console.log(response);
            try {
                if (response['d']['d']['def']['eId'] !== 0) {
                    console.log("response['d']['d']['def']['eId']");
                    console.log(response['d']['d']['def']['eId']);
                    resolve(response['d']['d']['def']['eId']);
                } else {
                    resolve(0);
                }
            } catch {
                console.log("error response cot");
                console.log(response);
                reject('eId is 0');
            }
        };

        ws.onerror = (error) => {
            reject(error);
        };
    });
}

async function runRequestsCotACS(userName, password, server, settings) {

    let accessToken = await getToken(userName, password, server);
    console.log("accessToken");
    console.log(accessToken);
    try {
       await initWebSocket(accessToken, server);
        try {
            await new Promise(resolve => setTimeout(resolve,500));
            let eId = await isReadyACsCot(settings);
            console.log("AUTO eID");
            console.log(eId);
            await new Promise(resolve => setTimeout(resolve,500));
            if(eId == 0){
              try{
                await tryAtkACS();
                await new Promise(resolve => setTimeout(resolve,500));
                eId = await isReadyACsCot(settings);
                await new Promise(resolve => setTimeout(resolve,500));

              } catch(error){}
            } 
            writeLogs("CS CoT is ready");
            let cotResult = await doACSCot(eId);
            console.log(cotResult);
            writeLogs("CS CoT is done");
            ws.close();
        } catch (error) {
            writeLogs("CS CoT not ready");
            console.error('CS cot not rdy');
            ws.close();
        }

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}


async function autoCotACS() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsCotACS(userName, password, serv, settings);
    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}



// MANUAL LOCAL COT
async function runRequestsManualCot(userName, password, server, settings) {

        let accessToken = await getToken(userName, password, server);
        try {
            await initWebSocket(accessToken, server);
            await new Promise(resolve => setTimeout(resolve,1000));
            await manualCotLocal();
            await new Promise(resolve => setTimeout(resolve,8000))
            ws.close();

        } catch (error) {
            console.error('An error occurred: ' + error);
        }
}



async function autoManualCot() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsManualCot(userName, password, serv, settings);

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}


// MANUAL CS COT
async function runRequestsManualCotCS(userName, password, server, settings) {

        let accessToken = await getToken(userName, password, server);
        try {
            await initWebSocket(accessToken, server);
            await new Promise(resolve => setTimeout(resolve,1000));
            await manualCotCS();
            await new Promise(resolve => setTimeout(resolve,8000))
            ws.close();

        } catch (error) {
            console.error('An error occurred: ' + error);
        }
}



async function autoManualCotCS() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsManualCotCS(userName, password, serv, settings);

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}

// MANUAL Storm COT
async function runRequestsManualCotStorm(userName, password, server, settings) {

        let accessToken = await getToken(userName, password, server);
        try {
            await initWebSocket(accessToken, server);
            await new Promise(resolve => setTimeout(resolve,1000));
            await manualCotStorm();
            await new Promise(resolve => setTimeout(resolve,8000))
            ws.close();

        } catch (error) {
            console.error('An error occurred: ' + error);
        }
}



async function autoManualCotStorm() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsManualCotStorm(userName, password, serv, settings);

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}


///////////// peach Event

async function choosePeachOption(){
  reqid += 1;
    peachRoute = {
      "optionId": 1,
      "reqId": reqid,
      "route": "at.pahc"
    };
    let peachEvent = ws;
    //console.log(miniEventShopRoute);
    peachRoute = prepareRequest(peachRoute);
    return new Promise((resolve, reject) => {
        peachEvent.send(peachRoute);
        peachEvent.onmessage = (event) => {
            //console.log(onMessageRecieve(event.data));
            console.log("choose option 1");
            console.log(onMessageRecieve(event.data));
            resolve(event);

        };
        peachEvent.onerror = (error) => {
            console.log("error choose option");
            reject(error);
        };
    });
}

async function doPeachAction(){  
    reqid += 1;
    peachRoute = {
      "reqId": reqid,
      "route": "at.paha"
    };
    let peachEvent = ws;
    //console.log(miniEventShopRoute);
    peachRoute = prepareRequest(peachRoute);
    return new Promise((resolve, reject) => {
        peachEvent.send(peachRoute);
        peachEvent.onmessage = (event) => {
            //console.log(onMessageRecieve(event.data));
            console.log("do Peach event");
            console.log(onMessageRecieve(event.data));
            resolve(onMessageRecieve(event));

        };
        peachEvent.onerror = (error) => {
            console.log("error peach event");
            reject(error);
        };
    });
    
  
}

async function doPeachEvent(){
  let max=50;
  for (var i = 0; i < max; i++) {

    let action = await doPeachAction();
    try{
      console.log("action");
      console.log(action);
      if(action['d']['d']['msg'] == "Not done yet"){
        console.log("Not done yet");
        await choosePeachOption();
        i--;
      }
      if(action['d']['d']['msg'] == "Insufficient items"){
        i = max;
      }
    }catch(error){}
    await new Promise(resolve => setTimeout(resolve,500));
  }  
}

async function runRequestsPeachEvent(userName, password, server, settings) {

        let accessToken = await getToken(userName, password, server);
        try {
            await initWebSocket(accessToken, server);
            await new Promise(resolve => setTimeout(resolve,1000));
            await doPeachEvent();
            await new Promise(resolve => setTimeout(resolve,10000))
            ws.close();

        } catch (error) {
            console.error('An error occurred: ' + error);
        }
}



async function autoPeachEvent() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsPeachEvent(userName, password, serv, settings);

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}


////////// Xingtian //////////////

async function atkXingtian(servId){
  reqid += 1;
  atkPath = {
    "hId": servId,
    "reqId": reqid,
    "route": "xt.c"
  };
  let atkBossWs = ws;
  console.log(atkPath);
  atkPath = prepareRequest(atkPath);
  let promise = new Promise((resolve, reject) => {
      atkBossWs.send(atkPath);
      atkBossWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log(" atk xingtian");
          console.log(onMessageRecieve(event.data))
          resolve(onMessageRecieve(event.data));
      };
      atkBossWs.onerror = (error) => {
          console.log("error atk xingtian");
          reject(error);
      };
  });
}


async function doXingtian(){
    for (var i = 1; i <= 74; i++) {  
        if(i % 5 === 0){
          await DoHeartBeat();
          await new Promise(resolve => setTimeout(resolve,500));
        }    
        await atkXingtian(i);
        await new Promise(resolve => setTimeout(resolve,500));
    }
}

async function runRequestsXingtian(userName, password, server, settings) {

        let accessToken = await getToken(userName, password, server);
        try {
            await initWebSocket(accessToken, server);
            await new Promise(resolve => setTimeout(resolve,1000));
            await doXingtian();
            await new Promise(resolve => setTimeout(resolve,8000))
            ws.close();

        } catch (error) {
            console.error('An error occurred: ' + error);
        }
}

async function autoXingtian() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsXingtian(userName, password, serv, settings);

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}
////////// SwordFly //////////////

async function doSwordFly(){
  var min = 195;
  var max = 206;
  var randomInt = Math.floor(Math.random() * (max - min + 1)) + min;
  var props = []
  var instance = 2880

  reqid += 1;
  sfPath = {
    "props": props,
    "hit": randomInt,
    "instance":instance = 2880,
    "reqId": reqid,
    "route": "xsm.l"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  let promise = new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("swordfly");
          console.log(onMessageRecieve(event.data))
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error swordfly");
          reject(error);
      };
  });
}

async function runRequestsSwordFly(userName, password, server, settings) {

        let accessToken = await getToken(userName, password, server);
        try {
            await initWebSocket(accessToken, server);
            await new Promise(resolve => setTimeout(resolve,1000));
            await doSwordFly();
            await new Promise(resolve => setTimeout(resolve,1000))
            ws.close();

        } catch (error) {
            console.error('An error occurred: ' + error);
        }
}

async function autoSwordFly() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsSwordFly(userName, password, serv, settings);

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}

async function runRequestsChaos(userName, password, server, settings) {

        let accessToken = await getToken(userName, password, server);
        try {
            await initWebSocket(accessToken, server);
            await new Promise(resolve => setTimeout(resolve,1000));
            await doChaos();
            await new Promise(resolve => setTimeout(resolve,1000))
            ws.close();

        } catch (error) {
            console.error('An error occurred: ' + error);
        }
}

async function autoChaosBattle() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsChaos(userName, password, serv, settings);

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}










// AUTO Heavenly COT
async function doHeavenlyCot(eId) {
    // Créer une promesse pour la première requête
    const buy50buffPromise = new Promise((resolve, reject) => {
        let buy50buff = {
            "actName":"crossDebateRank3",
            "id": 110,
            "reqId": reqid,
            "route": "xfcc.d"
        };
        let wsBuy50buff = ws;
        buy50buff = prepareRequest(buy50buff);
        wsBuy50buff.send(buy50buff);
        reqid += 1;

        wsBuy50buff.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsBuy50buff.onerror = (error) => {
            reject(error);
        };
    });

    // Envelopper la partie autoCot dans une nouvelle promesse
    const autoCotPromise = new Promise((resolve, reject) => {
        let autoCot = {
            "actName":"crossDebateRank3",
            "dId": eId,
            "buyType": 0,
            "reqId": reqid,
            "route": "xfcc.j"
        }

        let wsAutoCot = ws;
        autoCot = prepareRequest(autoCot);
        wsAutoCot.send(autoCot);
        reqid += 1;

        wsAutoCot.onmessage = (event) => {
            let response = onMessageRecieve(event.data);
            resolve(response);
        };

        wsAutoCot.onerror = (error) => {
            reject(error);
        };
    });

    let autoCotResponse = await autoCotPromise;

    // Retourner un message
    return autoCotResponse;
}

function isReadyHeavenlyCot() {
    console.log("isReadyHeavenlyCot");
    return new Promise((resolve, reject) => {
        let cotRoute = {
            "actName":"crossDebateRank3",
            "reqId": reqid,
            "route": "xfcc.a"
        };
        let wsCot = ws;
        cotRoute = prepareRequest(cotRoute);
        wsCot.send(cotRoute);

        wsCot.onmessage = (event) => {
           let response = onMessageRecieve(event.data);
            console.log("response isReadyHeavenlyCot");
            console.log(response);
            try {
                if (response['d']['d']['def']['eId'] !== 0) {
                    console.log("response['d']['d']['def']['eId']");
                    console.log(response['d']['d']['def']['eId']);
                    resolve(response['d']['d']['def']['eId']);
                } else {
                    resolve(0);
                }
            } catch {
                console.log("error response cs cot");
                console.log(response);
            }
        };

        ws.onerror = (error) => {
            reject(error);
        };
    });
}

async function runRequestsCotHeavenly(userName, password, server, settings) {

    let accessToken = await getToken(userName, password, server);
    console.log("accessToken");
    console.log(accessToken);
    try {
        await initWebSocket(accessToken, server);
        try {
            await new Promise(resolve => setTimeout(resolve,1000));
            let eId = await isReadyHeavenlyCot(settings);
            console.log("AUTO eID");
            console.log(eId);
            await new Promise(resolve => setTimeout(resolve,1000));
            if(eId == 0){
              try{
                await tryAtkHeavenly();
                await new Promise(resolve => setTimeout(resolve,1000));
                eId = await isReadyHeavenlyCot(settings);
                await new Promise(resolve => setTimeout(resolve,1000));

              } catch(error){}
            } 
            writeLogs("Heavenly CoT is ready");
            let cotResult = await doHeavenlyCot(eId);
            console.log(cotResult);
            writeLogs("Heavenly CoT is done");
            ws.close();
        } catch (error) {
            writeLogs("Heavenly CoT not ready");
            console.error('Heavenly cot not rdy');
            ws.close();
        }

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}


async function autoCotHeavenly() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsCotHeavenly(userName, password, serv, settings);
    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}





async function getDotOpsList(){
  reqid += 1;
  sfPath = {   
    "reqId": reqid,
    "route": "gldw.c"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
        resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error test");
          reject(error);
      };
  });
}

async function remainingOps(opsList){
  remainingOps = 0;
  for(i=0;i<opsList.length;i++){
    if(opsList[i]['fightNum'] == 0){
      remainingOps++;
    }
  }
  return remainingOps;
}

async function doDot(order) {
  let listOps = await getDotOpsList();
  listOps = listOps['d']['d']['l'];
  // await new Promise(resolve => setTimeout(resolve,1000));
  console.log(listOps);
  let totalOps = listOps.length;
  await new Promise(resolve => setTimeout(resolve,1000));
  let NumberRemainingOps = await remainingOps(listOps);

  console.log("totalOps");
  console.log(totalOps);
  console.log("remainingOps");
  console.log(NumberRemainingOps);
}




async function currentEvents(){
  eventsList = await getEvents();

}

async function advStateTest(){
   reqid += 1;
  sfPath = {   
    "reqId": reqid,
    "route": "m.n"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);


  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error test");
          reject(error);
      };
  });
}

// async function testReq(){
//   status = await advStateTest();
//   await new Promise(resolve => setTimeout(resolve,500));

//   // status = status['d']['d']['c']['User.getInfo']['i']['mInfo'];
//   console.log(JSON.stringify(status));
//   // var currentTimestamp = new Date().getTime();
//   // console.log("currentTimestamp");
//   // console.log(currentTimestamp);
//   // console.log("hangtime");
//   // console.log(status['@s.hangTime']);
//   // console.log("eval currentTimestamp and hantime");
//   // console.log(status['@s.hangTime']<currentTimestamp);
// }

async function getPantheonInfo(){
  reqid += 1;
  sfPath = {   
    "reqId": reqid,
    "route": "tt.a"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);


  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
        resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error test");
          reject(error);
      };
  });
}

async function getListPantheonIsland(idPantheon,pantheonMap){
  var availableIslands = []
  for (var i = 0; i < pantheonMap.length; i++) {
    if(pantheonMap[i]['crossGuildId'] == idPantheon && pantheonMap[i]['status'] == 2){
      console.log(pantheonMap[i]);
      availableIslands.push(pantheonMap[i]['id']);
    }
  }
  return availableIslands;
}

async function getEachLimit(id){
  reqid += 1;
  sfPath = {   
    "id":id,
    "reqId": reqid,
    "route": "tt.c"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);


  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
        resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error test");
          reject(error);
      };
  });
}

async function doBuild(idIsland,idTask){
    reqid += 1;
    sfPath = {   
      "id":idIsland,
      "cId":idTask,
      "reqId": reqid,
      "route": "tt.d"
    };
    let sfWs = ws;
    console.log(sfPath);
    sfPath = prepareRequest(sfPath);


    return new Promise((resolve, reject) => {
        sfWs.send(sfPath);
        sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
        };
        sfWs.onerror = (error) => {
            console.log("error test");
            reject(error);
        };
    });
}

async function getPantheonId(){
    reqid += 1;
    sfPath = {   
      "reqId": reqid,
      "route": "cg.h"
    };
    let sfWs = ws;
    console.log(sfPath);
    sfPath = prepareRequest(sfPath);


    return new Promise((resolve, reject) => {
        sfWs.send(sfPath);
        sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
        };
        sfWs.onerror = (error) => {
            console.log("error test");
            reject(error);
        };
    });
}

async function pantheonConquest(listIslands){
  try{
    for (var i = 0; i < listIslands.length; i++) {
      //console.log(listIslands[i]);
      let islandInfos = await getEachLimit(listIslands[i]);
      //console.log(islandInfos);
      console.log("---------- islandInfos ------------");
      console.log(islandInfos);
      while(islandInfos['d']['t'] != "tt.c"){
        islandInfos = await getEachLimit(listIslands[i]);
      }
      await new Promise(resolve => setTimeout(resolve,500))

      islandInfos = islandInfos['d']['d']['tasks'];
      try{
        for (var j = 0; j < islandInfos.length; j++) {
          limit = islandInfos[j]['personal'];
          let taskId = islandInfos[j]['id'];
          // console.log("taskId");
          // console.log(taskId);
          console.log("limit");
          console.log(limit);
          if (limit<10) {
            for (limit; limit < 10; limit++){
              await doBuild(listIslands[i],taskId);
              // await new Promise(resolve => setTimeout(resolve,200))
              //console.log(listIslands[i],taskId);
            }
          }
        }
      } catch (error){
        console.log("pantheonConquest 2st listIslands.length");
        console.log(error);
      }
      
      await new Promise(resolve => setTimeout(resolve,500))

    }
  } catch (error){
    console.log("pantheonConquest 1st listIslands.length");
    console.log(error);
  }
  
}


async function runRequestsBuildConquestReq(userName, password, server, settings) {

        let accessToken = await getToken(userName, password, server);
        try {
            await initWebSocket(accessToken, server);
            await new Promise(resolve => setTimeout(resolve,1000));
            //await checkAndLaunchAdventure();
            let conquestMap = await getPantheonInfo();
            //console.log(test);
            let pantheonId = await getPantheonId();
            pantheonId = pantheonId['d']['d']['cgId'];
            await new Promise(resolve => setTimeout(resolve,500))

            let listIsland = await getListPantheonIsland(pantheonId,conquestMap['d']['d']['l']);
            console.log("-------------- listIsland ------------");
            console.log(listIsland);
            await pantheonConquest(listIsland);
            await new Promise(resolve => setTimeout(resolve,1000))
            ws.close();

        } catch (error) {
            console.error('An error occurred: ' + error);
        }
}

async function autoBuildConquestReq() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsBuildConquestReq(userName, password, serv, settings);

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}


async function getDispatchNum(id){
  reqid += 1;
    sfPath = {  
      "id": id, 
      "reqId": reqid,
      "route": "tt.c"
    };
    let sfWs = ws;
    console.log(sfPath);
    sfPath = prepareRequest(sfPath);


    return new Promise((resolve, reject) => {
        sfWs.send(sfPath);
        sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
        };
        sfWs.onerror = (error) => {
            console.log("error test");
            reject(error);
        };
    });
}

async function addTroopsConquest(id,num){
    reqid += 1;
    sfPath = {  
      "id": id,
      "num": num, 
      "reqId": reqid,
      "route": "tt.i"
    };
    let sfWs = ws;
    console.log(sfPath);
    sfPath = prepareRequest(sfPath);


    return new Promise((resolve, reject) => {
        sfWs.send(sfPath);
        sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
        };
        sfWs.onerror = (error) => {
            console.log("error test");
            reject(error);
        };
    });
}

async function runRequestsPutTroopsConquestReq(userName, password, server, settings) {

        let accessToken = await getToken(userName, password, server);
        try {
             await initWebSocket(accessToken, server);
            await new Promise(resolve => setTimeout(resolve,1000));
            let conquestMap = await getPantheonInfo();
            let pantheonId = await getPantheonId();
            pantheonId = pantheonId['d']['d']['cgId'];
            await new Promise(resolve => setTimeout(resolve,500))
            conquestMap = conquestMap['d']['d']['l'];

            console.log(settings['atkTroopsConquestValue']);
            try{
              for (var j = 0; j < conquestMap.length; j++) {
                if(conquestMap[j]['status'] == 4 && conquestMap[j]['atkCgId'] == pantheonId){
                  console.log(conquestMap[j]);
                  let dispatchNum = await getDispatchNum(conquestMap[j]['id']);
                  await new Promise(resolve => setTimeout(resolve,500));
                  console.log("dispatchNum['d']['d']['dispatchNum']")
                  console.log(dispatchNum['d']['d']['dispatchNum']);
                  dispatchNum = dispatchNum['d']['d']['dispatchNum'];
                  for (var y = 0; y < dispatchNum; y++) {
                    console.log(y);
                    await addTroopsConquest(conquestMap[j]['id'],settings['atkTroopsConquestValue']);
                    //await new Promise(resolve => setTimeout(resolve,100));

                  }
                  await new Promise(resolve => setTimeout(resolve,1000));
                };
              }
            } catch (error){
              console.log("pantheonConquest 2st listIslands.length");
              console.log(error);
            }

            await new Promise(resolve => setTimeout(resolve,1000))
            ws.close();

        } catch (error) {
            console.error('An error occurred: ' + error);
        }
}

async function autoPutTroopsConquestReq() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsPutTroopsConquestReq(userName, password, serv, settings);

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}
async function runRequestsPutDefTroopsConquestReq(userName, password, server, settings) {

        let accessToken = await getToken(userName, password, server);
        try {
             await initWebSocket(accessToken, server);
            await new Promise(resolve => setTimeout(resolve,1000));
            let conquestMap = await getPantheonInfo();
            let pantheonId = await getPantheonId();
            pantheonId = pantheonId['d']['d']['cgId'];
            await new Promise(resolve => setTimeout(resolve,500))
            conquestMap = conquestMap['d']['d']['l'];

            try{
              for (var j = 0; j < conquestMap.length; j++) {
                if(conquestMap[j]['status'] == 4 && conquestMap[j]['crossGuildId'] == pantheonId){
                  console.log(conquestMap[j]);
                  let dispatchNum = await getDispatchNum(conquestMap[j]['id']);
                  await new Promise(resolve => setTimeout(resolve,500));
                  console.log("dispatchNum['d']['d']['dispatchNum']")
                  console.log(dispatchNum['d']['d']['dispatchNum']);
                  dispatchNum = dispatchNum['d']['d']['dispatchNum'];
                  for (var y = 0; y < dispatchNum; y++) {
                    console.log(y);
                    await addTroopsConquest(conquestMap[j]['id'],settings['defTroopsConquestValue']);
                    //await new Promise(resolve => setTimeout(resolve,100));

                  }
                  await new Promise(resolve => setTimeout(resolve,1000));
                };
              }
            } catch (error){
              console.log("pantheonConquest 2st listIslands.length");
              console.log(error);
            }

            await new Promise(resolve => setTimeout(resolve,1000))
            ws.close();

        } catch (error) {
            console.error('An error occurred: ' + error);
        }
}

async function autoPutDefTroopsConquestReq() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsPutDefTroopsConquestReq(userName, password, serv, settings);

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}


////////// test //////////////


async function getOpsAllianceInfo(allianceId){
  reqid += 1;
  sfPath = {  
    "gId": allianceId, 
    "reqId": reqid,
    "route": "gpvp.h"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);


  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
        try {
          resolve(onMessageRecieve(event.data));

        } catch (error) {
          console.error('Erreur lors de la décompression :', error);
          reject(error);
        }
      };
      sfWs.onerror = (error) => {
          console.log("error test");
          reject(error);
      };
  });
}
async function getPromotionMatch(){
  reqid += 1;
  sfPath = {   
    "reqId": reqid,
    "route": "gpvp.g"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);


  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
        try {
          //console.log(onMessageRecieve(event.data));

          resolve(onMessageRecieve(event.data));
        } catch (error) {
          console.error('Erreur lors de la décompression :', error);
          reject(error);
        }
      };
      sfWs.onerror = (error) => {
          console.log("error test");
          reject(error);
      };
  });
}
async function getTop(){
  reqid += 1;
  sfPath = {   
    "reqId": reqid,
    "route": "gpvp.f"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);


  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
        try {
          console.log(onMessageRecieve(event.data));

          resolve(onMessageRecieve(event.data));
        } catch (error) {
          console.error('Erreur lors de la décompression :', error);
          reject(error);
        }
      };
      sfWs.onerror = (error) => {
          console.log("error test");
          reject(error);
      };
  });
}

async function allianceFight(){
  let listPromotionMatch = await getPromotionMatch();
  listPromotionMatch = listPromotionMatch['d']['d']['l'];
  console.log(listPromotionMatch);
  battles = {}
  
  for(i=0;i<listPromotionMatch.length;i++){
      let allianceInfo = {};
      let opsInfo = await getOpsAllianceInfo(listPromotionMatch[i]['defGuildId']);
      // console.log("opsInfo");
      // console.log(opsInfo);
      try{
        console.log(opsInfo['d']);
        allianceInfo[opsInfo['d']['d']['guildName']]= opsInfo['d']['d']['totalHp'].toLocaleString("da-DK");
        battles["round "+listPromotionMatch[i]['round']] = allianceInfo;
      } catch(error){
        console.log("error");
      }
      //await new Promise(resolve => setTimeout(resolve,1000));

  }
  console.log(battles);
}

async function checkBag(){
  reqid += 1;
  sfPath = {
    "score": 8001,
    "num": 1,   
    "reqId": reqid,
    "route": "wo.ag"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  let promise = new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          console.log("autoRestoreBabyPet");
          console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error autoRestoreBabyPet");
          reject(error);
      };
  });
}
async function test(num){
  reqid += 1;
  sfPath = {
    "type": "treeLv:"+num,
    "reqId": reqid,
    "route": "r.a"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          //console.log("--------test--------" + num);
          //console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error autoRestoreBabyPet");
          reject(error);
      };
  });
}



//keep to check peoples mana
// async function runRequestsAutoTestReq(userName, password, server, settings) {

//         let accessToken = await getToken(userName, password, server);
//         try {
//             await initWebSocket(accessToken, server);
//             await new Promise(resolve => setTimeout(resolve,1000));
//             name = "LiXin";         
//             writeLogs(name);
//             var k = "";
//             var j = 1;
//             for (var i = 1; i <17; i++) {
//               switch (i % 4) {
//                   case 1:
//                       k = "I";
//                       break;
//                   case 2:
//                       k = "P";
//                       break;
//                   case 3:
//                       k = "S";
//                       break;
//                   case 0:
//                       k = "D";
//                       break;
//               }
//               resultMana = await test(i.toString());
//               await new Promise(resolve => setTimeout(resolve,1000));
//               console.log(resultMana);
//               try {
                
//                 resultMana = resultMana['d']['d']['l'].find(element => element.oldName === name);
//                 console.log(resultMana);
//                 writeLogs("pet "+ k + " " + j + ", rank: "+ resultMana['rank'].toString());
//                 writeLogs(resultMana['score']);
//               } catch (error) {
//                 writeLogs("pet "+ k + " " + j);
//                 writeLogs('not in top 100');
//                 console.log('not in top 100');
//               }
              
//               await new Promise(resolve => setTimeout(resolve,1000));
//               if (k=="D") {
//                 j++;
//               }
//             }
//             ws.close();

//         } catch (error) {
//             console.error('An error occurred: ' + error);
//         }
// }



async function getCurrentAllianceShop(num){
  reqid += 1;
  sfPath = {
    "shopType":"guild",
    "reqId": reqid,
    "route": "s.a"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          //console.log(onMessageRecieve(event.data));
          //console.log("--------test--------" + num);
          //console.log(onMessageRecieve(event.data));
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error autoRestoreBabyPet");
          reject(error);
      };
  });
}

//GET ACS BRACKET
// async function testFunction(){
//   reqid += 1;
//   sfPath = {
//     "type":"guildDebateRank2",
//     "reqId": reqid,
//     "route": "r.f"
//   };
//   let sfWs = ws;
//   console.log(sfPath);
//   sfPath = prepareRequest(sfPath);
//   return new Promise((resolve, reject) => {
//       sfWs.send(sfPath);
//       sfWs.onmessage = (event) => {
//           //console.log(onMessageRecieve(event.data));
//           //console.log("--------test--------" + num);
//           //console.log(onMessageRecieve(event.data));
//           resolve(onMessageRecieve(event.data));
//       };
//       sfWs.onerror = (error) => {
//           console.log("error autoRestoreBabyPet");
//           reject(error);
//       };
//   });
// }

// async function runRequestsAutoTestReq(userName, password, server, settings) {

//         let accessToken = await getToken(userName, password, server);
//         try {
//             await initWebSocket(accessToken, server);
//             await new Promise(resolve => setTimeout(resolve,1000));
//             //await doRobFL();     
//             var test = await testFunction();     
//             await new Promise(resolve => setTimeout(resolve,500));
//             console.log(test);
//             var tmp = "";
//             for (var i = 0; i < test['d']['d']['l'].length; i++) {
//               console.log(test['d']['d']['l'][i]);
//               tmp = tmp+test['d']['d']['l'][i]+",";
//             }
//             writeLogs(tmp);
//             await new Promise(resolve => setTimeout(resolve,500));

//             ws.close();

//         } catch (error) {
//             console.error('An error occurred: ' + error);
//         }
// }

//test sectTrade
// async function testFunction(id){
//   reqid += 1;
//   sfPath = {
//     "sectId": id,
//     "reqId": reqid,
//     "route": "tra.b"
//   };
//   let sfWs = ws;
//   console.log(sfPath);
//   sfPath = prepareRequest(sfPath);
//   return new Promise((resolve, reject) => {
//       sfWs.send(sfPath);
//       sfWs.onmessage = (event) => {
//           resolve(onMessageRecieve(event.data));
//       };
//       sfWs.onerror = (error) => {
//           console.log("error autoRestoreBabyPet");
//           reject(error);
//       };
//   });
// }

//test pantheon otherwordly beast event
async function testFunction(){
  reqid += 1;
  sfPath = {
    "shopType":"xianzhi",
    "reqId": reqid,
    "route": "s.a"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error autoRestoreBabyPet");
          reject(error);
      };
  });
}

//can change
// async function testFunction2(){
//   reqid += 1;
//   sfPath = {
//     "score": 8001,
//     "num": 1,
//     "reqId": reqid,
//     "route": "wo.ag"
//   };
//   let sfWs = ws;
//   console.log(sfPath);
//   sfPath = prepareRequest(sfPath);
//   return new Promise((resolve, reject) => {
//       sfWs.send(sfPath);
//       sfWs.onmessage = (event) => {
//           resolve(onMessageRecieve(event.data));
//       };
//       sfWs.onerror = (error) => {
//           console.log("error autoRestoreBabyPet");
//           reject(error);
//       };
//   });
// }

//can change
async function testFunction2(){
  reqid += 1;
  sfPath = {
    "reqId": reqid,
    "route": "wo.af"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error autoRestoreBabyPet");
          reject(error);
      };
  });
}
//can change
async function testCouple(id){
  reqid += 1;
  sfPath = {
    "dId": id,
    "reqId": reqid,
    "route": "h.f"
  };
  let sfWs = ws;
  console.log(sfPath);
  sfPath = prepareRequest(sfPath);
  return new Promise((resolve, reject) => {
      sfWs.send(sfPath);
      sfWs.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error autoRestoreBabyPet");
          reject(error);
      };
  });
}



async function runRequestsAutoTestReq(userName, password, server, settings) {

        let accessToken = await getToken(userName, password, server);
        try {
            await initWebSocket(accessToken, server);
            await new Promise(resolve => setTimeout(resolve,1000));
            await getUserInfo();
            // await new Promise(resolve => setTimeout(resolve,500));
            // console.log("------------- userInfos --------------");
            // console.log(userInfos);
            //await doRobFL();     
            
            //test sect trade
            // for (var i = 1; i < 31; i++) {
            //   var test = await testFunction(i);     
            //   await new Promise(resolve => setTimeout(resolve,500));

            // }
            test = await testCouple(45);
            console.log(test);
            //await allianceFight();
            //await new Promise(resolve => setTimeout(resolve,1000));
            //await testFunction();
            // var test = await testFunction2();     
            // await new Promise(resolve => setTimeout(resolve,500));
            // console.log(test);
            // test['d']['d']['l'].forEach(function(hero) {
            //   //if(hero['name'].substring(0,3) == "s49"){
            //     console.log(hero['rank']+" "+hero['name']+" "+hero['score']);
            //   //}
            // });
            await new Promise(resolve => setTimeout(resolve,500));
            // for (var i = 0; i < 43; i++) {
            //   writeLogs(test['d']['d']['l'][i]['name']);
            // }


            //

            ws.close();

        } catch (error) {
            console.error('An error occurred: ' + error);
        }
}

async function autoTestReq() {
    // Récupération de l'index de l'utilisateur sélectionné depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('userIndex');

    // Récupération des informations de tous les utilisateurs depuis le localStorage
    const auths = JSON.parse(localStorage.getItem('auths'));

    // Sélection de l'utilisateur correspondant à l'index
    const auth = auths[index];
    console.log(auth);
    let userName = auth['username'];
    let password = auth['password'];
    let serv = auth['server'];
    let settings = auth['formdata'];

    console.log(serv);
    try {
        await runRequestsAutoTestReq(userName, password, serv, settings);

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}

