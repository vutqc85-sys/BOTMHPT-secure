var reqid = 1;
var userInfos = [];
var dotInfo = [];
var events = [];
var currentShop = [];
var adsLimits = [];
var userSettings = [];
var type = "";
var shop = "";

async function initWebSocket2(accessToken, server) {
    return new Promise((resolve, reject) => {
        var serv = server.toString().padStart(3, '0');
        console.log(serv);
        console.log("initWebSocket2 server");

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

              action = "user logged";
              writeLogs(action);
              resolve(event);
            } else{
              writeLogs("Missing game version");
              ws.close();
            }            
        });

        ws.addEventListener('message', async function(event) {           

            let eventD = onMessageRecieve(event)['d'];
            let route = eventD['t'];
            
            

            //console.log("### eventD ###");
            //console.log(eventD);

            if(route == "u.b"){                
                userInfos = eventD['d'];
                console.log("#### userInfos ####");
                console.log(userInfos);
                userInfos['heros'].forEach(function(hero) {
                    hero.totalTal = calculateTotalTal(hero);
                });

                // 3. Réorganiser le tableau en fonction de totalTal
                userInfos['heros'].sort(function(a, b) {
                    return b.totalTal - a.totalTal; // Pour trier par ordre décroissant
                });
            }

            if(route == "at.a"){
              console.log("setting up events var");
              events = onMessageRecieve(event)['d']['d'];
            }
            if(route == "s.a"){
              console.log("setting up currentShop var");
              currentShop = onMessageRecieve(event)['d'];
              console.log(shop);
              console.log(currentShop);
              if(shop == "sect"){
                limit = currentShop['d']['list'].find(element => element.id === 101)['limit'];
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


            if(route == "ca.a"){
              console.log("worship");
              console.log("settings['doWorshipId']")
              worshipStatus = onMessageRecieve(event)['d']['d']['isWorship'];
              if(worshipStatus == 0 ){
                    console.log(userSettings['doWorshipId']);
                    reqid +=1;
                    worshipRoute = {
                      "worshipUId": userSettings['doWorshipId'],
                      "reqId": reqid,
                      "route": "ca.b"
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
                              console.log("error worship");
                              reject(error);
                          };
                      });
              }
            }
            if(route == "ca.b"){
                writeLogs("worship done");
                console.log(onMessageRecieve(event)['d']);
            }

            if(route == "bs.a"){
                console.log("beastSeal");
                beastSeal = onMessageRecieve(event)['d']['d'];
                beastSealNum = beastSeal['num'];
                if(beastSealNum>0){
                    let currentDay = getCurrentDay();
                    for (var i = 1; i <= beastSealNum; i++) {                        
                        if (currentDay !== 0 && currentDay !== 6) {
                            beastRoute = {
                                "id": currentDay,
                                "lv": parseInt(userSettings['beastLevel']),
                                "reqId": reqid + 1,
                                "route": "bs.b"
                            };
                        } else {
                            beastRoute = {
                                "id": 3,
                                "lv": parseInt(userSettings['beastLevel']),
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
                //console.log(beastSeal);
            }

            if(route == "bs.b"){
                console.log("beastSeal Done");
                writeLogs("beastSeal Done");
            }



            if(route == "gld.g"){
              console.log("alliance get alliance woodbuild limit");
              woodBuildLimit = onMessageRecieve(event)['d']['d']['l'][0]['num'];
              woodNeeded = 2000*woodBuildLimit;

              if(woodBuildLimit>0){
                nbBuildPossible = Math.floor(userInfos['i']['wdc']/2000);
                console.log("nbBuildPossible");
                console.log(nbBuildPossible);
                writeLogs("Can do alliance build wood "+nbBuildPossible.toString()+"/"+woodBuildLimit.toString()+ " with available wood");
                for (var i = 0; i < nbBuildPossible; i++) {
                    woodBuildRoute = {
                        "id": 1,
                        "reqId": reqid + 1,
                        "route": "gld.h"
                    }; 
                    let wsBuildWood = ws;
                    console.log(woodBuildRoute);
                    woodBuildRoute = prepareRequest(woodBuildRoute);
                    let promise = new Promise((resolve, reject) => {
                        wsBuildWood.send(woodBuildRoute);
                        wsBuildWood.onmessage = (event) => {
                            resolve(onMessageRecieve(event.data));
                        };
                        wsBuildWood.onerror = (error) => {
                            console.log("error alliance build wood");
                            reject(error);
                        };
                    });        
                }
              }
            }

            if (route == "gld.h") {
                console.log("alliance gld.h");
                woodBuildDone = onMessageRecieve(event);
                console.log(woodBuildDone);
                writeLogs("alliance wood build done");
            }
            if (route == "fd.a") {
                console.log("FL fd.a");
                flStatus = onMessageRecieve(event)['d']['d']['i'];
                console.log(flStatus);
                if (flStatus['practiceCount']>0 && flStatus['status'] == 0) {
                    flCultivateRoute = {
                        "reqId": reqid + 1,
                        "route": "fd.b"
                    }; 
                    let wsFLcultivate = ws;
                    flCultivateRoute = prepareRequest(flCultivateRoute);
                    let promise = new Promise((resolve, reject) => {
                        wsFLcultivate.send(flCultivateRoute);
                        wsFLcultivate.onmessage = (event) => {
                            resolve(onMessageRecieve(event.data));
                        };
                        wsFLcultivate.onerror = (error) => {
                            console.log("error cultivate FL");
                            reject(error);
                        };
                    });
                }
            }

            if (route == "fd.b"){                
                console.log("alliance fd.b");
                doFL = onMessageRecieve(event);
                writeLogs("started cultivating in FL");
            }
            if (route == "jjc.a"){                
                console.log("jjc.a");
                competeLimit = onMessageRecieve(event)['d']['d']['i']['pkNum'];
                if (competeLimit>0) {
                    console.log("competeLimit > 0");
                }
            }
            if (route == "gp.g"){                
                console.log("gp.g");
                meritTOG = onMessageRecieve(event);
                console.log(meritTOG);
            }

            if(route == "gldw.a"){
                console.log("#### Dot ####");
                console.log(eventD['d']);
                console.log("#### nb day ####");
                console.log(dotInfo['nbDay']);
                dotInfo['rBattle'] = [];
                // timestamp début du DoT
                let statusStartTime = eventD['d']['statusStartTime'];

                // Conversion le timestamp en millisecondes (Date utilise des millisecondes)
                let statusStartTimeMilliseconds = statusStartTime * 1000;

                // Créez un objet Date pour la date actuelle en utilisant le fuseau horaire de Hong Kong
                let currentDate = new Date();
                currentDate.setUTCHours(currentDate.getUTCHours() + 8);
                console.log(currentDate.getDate());
                // Créez un objet Date pour la date de statusStartTime en utilisant le fuseau horaire de Hong Kong
                let startDate = new Date(statusStartTimeMilliseconds);
                startDate.setUTCHours(startDate.getUTCHours() + 8);
                console.log(startDate);

                console.log(startDate.getDate());

                let endDate = new Date(eventD['d']['leftTime']*1000);
                endDate.setUTCHours(endDate.getUTCHours() + 8);
                console.log(endDate);
                if(dotInfo['nbDay'] == 2 && currentDate > startDate ){
                    if(currentDate.getDate() == startDate.getDate()){
                        for (var i = 0; i < 4; i++) {
                            if(dotInfo['list'][i]['fightNum'] == 0){                                
                                console.log(userInfos['heros'][i]);
                                console.log(dotInfo['list'][i]);
                                battle = [];
                                battle['hId'] = userInfos['heros'][i]['cId'];
                                battle['eId'] = dotInfo['list'][i]['uId'];
                                dotInfo['rBattle'].push(battle);

                            }
                        }
                    }
                    if(currentDate.getDate() == startDate.getDate()+1){
                        for (var i = 4; i < 8; i++) {                                                         
                                console.log(userInfos['heros'][i]);
                                console.log(dotInfo['list'][i]);
                                battle = [];
                                battle['hId'] = userInfos['heros'][i]['cId'];
                                battle['eId'] = dotInfo['list'][i]['uId'];
                                dotInfo['rBattle'].push(battle);
                        }
                    }
                } else if (dotInfo['nbDay'] == 3 && currentDate > startDate){
                    if(currentDate.getDate() == startDate.getDate()){
                        for (var i = 0; i < 4; i++) {
                            if(dotInfo['list'][i]['fightNum'] == 0){                                
                                console.log(userInfos['heros'][i]);
                                console.log(dotInfo['list'][i]);
                                battle = [];
                                battle['hId'] = userInfos['heros'][i]['cId'];
                                battle['eId'] = dotInfo['list'][i]['uId'];
                                dotInfo['rBattle'].push(battle);

                            }
                        }
                    }
                    if(currentDate.getDate() == startDate.getDate()+1){
                        for (var i = 4; i < 8; i++) {                                                         
                                console.log(userInfos['heros'][i]);
                                console.log(dotInfo['list'][i]);
                                battle = [];
                                battle['hId'] = userInfos['heros'][i]['cId'];
                                battle['eId'] = dotInfo['list'][i]['uId'];
                                dotInfo['rBattle'].push(battle);
                        }
                    }
                    if(currentDate.getDate() == startDate.getDate()+2){
                        for (var i = 8; i < 12; i++) {                                                         
                                console.log(userInfos['heros'][i]);
                                console.log(dotInfo['list'][i]);
                                battle = [];
                                battle['hId'] = userInfos['heros'][i]['cId'];
                                battle['eId'] = dotInfo['list'][i]['uId'];
                                dotInfo['rBattle'].push(battle);
                        }
                    }
                }
               
            }
            if(route == "gldw.c"){
                console.log("#### Dot ops list####");
                console.log(eventD);
                if(eventD['d']['l'].length == 8 ){
                    dotInfo['nbDay'] = 2;
                } else if(eventD['d']['l'].length == 12){
                    dotInfo['nbDay'] = 3;
                }
                dotInfo['list'] = eventD['d']['l'];
            }

            if(route == "gldw.i"){
                console.log("### gldw.i ###");
                console.log(eventD);
            }
            if(route == "gldw.j"){
                console.log("### gldw.j ###");                
                console.log(eventD);
            }
            if(route == "gldw.l"){
                console.log("### gldw.l ###");                
                console.log(eventD['d']['score']);
                writeLogs("DotScore: "+ eventD['d']['score']);
            }

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

async function doApath(path){
  reqid += 1;
  sfPath = {   
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

  result = {};

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

async function getCurrentAllianceShop(){
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
          resolve(onMessageRecieve(event.data));
      };
      sfWs.onerror = (error) => {
          console.log("error autoRestoreBabyPet");
          reject(error);
      };
  });
}

function calculateTotalTal(hero) {
    return hero.atk + hero.datk + hero.matk + hero.travel;
}

async function autoDot(id){
  dotRoute = {
      "id": id,
      "buyType":1,
      "reqId": reqid + 1,
      "route": "gldw.l"
  };

  let wsHell = ws;
  dotRoute = prepareRequest(dotRoute);
  let promise = new Promise((resolve, reject) => {
      wsHell.send(dotRoute);
      wsHell.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      wsHell.onerror = (error) => {
          console.log("error hell");
          reject(error);
      };
  });
}
async function doDotfBoost(){
  dotRoute = {
      "id": 110,
      "reqId": reqid + 1,
      "route": "gldw.j"
  };

  let wsHell = ws;
  dotRoute = prepareRequest(dotRoute);
  let promise = new Promise((resolve, reject) => {
      wsHell.send(dotRoute);
      wsHell.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      wsHell.onerror = (error) => {
          console.log("error hell");
          reject(error);
      };
  });
}

async function checkDot(){
  dotRoute = {
      "reqId": reqid + 1,
      "route": "gldw.a"
  };

  let wsHell = ws;
  dotRoute = prepareRequest(dotRoute);
  let promise = new Promise((resolve, reject) => {
      wsHell.send(dotRoute);
      wsHell.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      wsHell.onerror = (error) => {
          console.log("error hell");
          reject(error);
      };
  });
}


async function launchDot(hId,eId){
  dotRoute = {
    "hId":hId,
    "tId":eId,
    "type":0,
    "reqId": reqid + 1,
    "route": "gldw.i"
  };

  let wsHell = ws;
  dotRoute = prepareRequest(dotRoute);
  let promise = new Promise((resolve, reject) => {
      wsHell.send(dotRoute);
      wsHell.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      wsHell.onerror = (error) => {
          console.log("error hell");
          reject(error);
      };
  });
}

async function checkDotOpsList(){
  dotRoute = {
      "reqId": reqid + 1,
      "route": "gldw.c"
  };

  let wsHell = ws;
  dotRoute = prepareRequest(dotRoute);
  let promise = new Promise((resolve, reject) => {
      wsHell.send(dotRoute);
      wsHell.onmessage = (event) => {
          resolve(onMessageRecieve(event.data));
      };
      wsHell.onerror = (error) => {
          console.log("error hell");
          reject(error);
      };
  });
}

async function prepDot(){
    await checkDotOpsList();
    await checkDot(); 
}

async function runRequests3(userName, password, server, settings) {
    console.log("settings");
    console.log(settings);
    if (settings != null) {
        let accessToken = await getToken(userName, password, server);
        try {
            await initWebSocket2(accessToken, server);
            
            await new Promise(resolve => setTimeout(resolve,2000))
            await getUserInfo();
            await getEvents();
            await doShopPath("guild","s.a");
            await new Promise(resolve => setTimeout(resolve,500));
            console.log("GET RESULTS");
            console.log("userInfos");
            console.log(userInfos);
            console.log("events");
            console.log(events);
            console.log("currentShop");
            console.log(currentShop);

            await doTypePath("centerFp","gp.g");
            await doTypePath("centerHeroFp","gp.g");
            await doTypePath("centerTreeLv","gp.g");

            shop = "sect";
            await doShopPath("sect","s.a");
            await new Promise(resolve => setTimeout(resolve,500));

            
            if (settings['doWorshipCheckbox'] == true && settings['doWorshipId'] != null) {
                userSettings['doWorshipId'] = settings['doWorshipId'].toString();
                await doApath("ca.a");
            }

           if (settings['doBeastCheckbox'] == true && settings['beastLevel'] != null) {
                userSettings['beastLevel'] = settings['beastLevel'];
                await doApath("bs.a");
            }
            if (settings['doBuildWoodCheckbox'] == true){
                await doApath("gld.g");
            }
            if (settings['doFLCheckbox'] == true){
                await doApath("fd.a");
            }
            if (settings['doCompeteCheckbox'] == true){
                console.log("WIP");
                await doApath("jjc.a");
            }
            if (settings['doBreatheCheckbox'] == true){
                console.log("WIP");
                breathNum=userInfos['c']['User.getInfo']['i']['@s.breathNum'];
                if (breathNum>0) {
                    console.log("breathNum");
                    console.log(breathNum);
                }
            }
           //  if (settings['doAdventureCheckbox'] == true){
           //      await new Promise(resolve => setTimeout(resolve,1000));
           //      console.log("Do adventure");
           //      await checkAndLaunchAdventure();
           //  }
           //  if (settings['doXtdCheckbox'] == true){
           //      await new Promise(resolve => setTimeout(resolve,1000));
           //      console.log("Do doXtdCheckbox");
           //      await doXTinvasion();
           //  }
           //  if (settings['doHellCheckbox'] == true && settings['hellNumber'] != null){
           //      await new Promise(resolve => setTimeout(resolve,1000));
           //      console.log("Do Hell");
           //      await doHell(settings['hellNumber']);
           //  }
           //  if (settings['doSPCheckbox'] == true && settings['spNumber'] != null){
           //      await new Promise(resolve => setTimeout(resolve,1000));
           //      console.log("Do spirit pact");
           //      await doSpiritPact(settings['spNumber']);
           //  }
           //  if (settings['doSTCheckbox'] == true && settings['stNumber'] != null){
           //      await new Promise(resolve => setTimeout(resolve,1000));
           //      console.log("Do spirit troop");
           //      await doSpiritTroop(settings['stNumber']);
           //  }
           //  if (settings['doVVCheckbox'] == true && settings['vvNumber'] != null){
           //      await new Promise(resolve => setTimeout(resolve,1000));
           //      console.log("Do VV");
           //      await doVV(settings['vvNumber']);
           //      await doVV(settings['vvNumber']);
           //  }
           //  if (settings['doInteractEventCheckbox'] == true && settings['doInteractEventNumber'] != null){
           //      await new Promise(resolve => setTimeout(resolve,1000));
           //      console.log("doInteractEvent");
           //      await doInteractEvent(settings['doInteractEventNumber']);
           //  }

           //  if (settings['doPchatCheckbox'] == true && settings['pantheonWord'] != null && pantheonChatDone == false){
           //      await new Promise(resolve => setTimeout(resolve,1000));
           //      console.log("Do pantheon chat");
           //      await doPantheonChat(settings['pantheonWord']);
           //      await new Promise(resolve => setTimeout(resolve,500));                
           //      await getPantheonChatReward();
           //  }
           //  if (settings['doVisitCheckbox'] == true){
           //      await new Promise(resolve => setTimeout(resolve,1000));
           //      console.log("doVisit");
           //      await getVisitNumber();
           //  }
           //  if (settings['doInteractCheckbox'] == true){
           //      await new Promise(resolve => setTimeout(resolve,1000));

           //      console.log("doInteract");
           //      await getInteractNumber();
           //  }
           //  if (settings['doBrewCheckbox'] == true){
           //      await new Promise(resolve => setTimeout(resolve,1000));
           //      console.log("doBrew");
           //      await doBrew();
           //  }
           //  if (settings['doBUmapCheckbox'] == true){
           //      await new Promise(resolve => setTimeout(resolve,1000));
           //      console.log("doBUmap");
           //      await doBUmap();
           //  }
           //  if (settings['doAccompanyCheckbox'] == true){
           //      await new Promise(resolve => setTimeout(resolve,1000));
           //      console.log("doAccompanyCheckbox");
           //      await doAccompanyPets();
           //  }
           //  if (settings['beastForageCheckbox'] == true && settings['beastForageQuantity'] != null && settings['beastForageQuantity']*500 <= userI['mcb']){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    console.log("getBeastFoodLimit");
           //    await buyBeastMarketResources(402,settings['beastForageQuantity']);
           //  }
           //  if (settings['heavenIntPillCheckbox'] == true && settings['heavenIntPillQuantity'] != null && settings['heavenIntPillQuantity']*300 <= userI['mcb']){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    console.log("getBeastFoodLimit");
           //    await buyBeastMarketResources(405,settings['heavenIntPillQuantity']);
           //  }
           //  if (settings['headenCrystalCheckbox'] == true && settings['headenCrystalQuantity'] != null && settings['headenCrystalQuantity']*1500 <= userI['mcb']){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    console.log("getBeastFoodLimit");
           //    await buyBeastMarketResources(406,settings['headenCrystalQuantity']);
           //  }
           //  if (settings['buyLimitedAllianceShopCheckbox'] == true &&  userI['fcb'] >= 38600){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    console.log("buyLimitedAllianceShopCheckbox");
           //    await doLimitedAllianceShop();
           //  }
           //  if (settings['buyLimitedRuinShopCheckbox'] == true && userI['recb'] >= 330000){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    console.log("buyLimitedRuinShopCheckbox");
           //    try{
           //      await buyRuinShop();

           //    } catch(error){
           //      console.log("error ruin");
           //      console.log(error);
           //    }
           //  }            


           //  if (settings['originEssenceCheckbox'] == true && settings['originEssenceQuantity'] != null ){
           //    await new Promise(resolve => setTimeout(resolve,1000));
           //    if(OEprice['price']<=getCurrentAlliancePriceUnlimited(100, 20,settings['originEssenceQuantity'])){
           //      console.log("doUnlimitedAllianceShop essence");
           //      await doUnlimitedAllianceShop(204,settings['originEssenceQuantity']);
           //    }              
           //  }

           //  if (settings['originSoulCheckbox'] == true && settings['originSoulQuantity'] != null){
           //    await new Promise(resolve => setTimeout(resolve,1000));
           //    if(OSprice['price']<=getCurrentAlliancePriceUnlimited(100, 20,settings['originSoulQuantity'])){
           //      console.log("doUnlimitedAllianceShop soul");
           //      await doUnlimitedAllianceShop(205,settings['originSoulQuantity']);
           //    }   

              
           //  }


           //  if (settings['originPsicrystalCheckbox'] == true && settings['originPsicrystalQuantity'] != null){
           //    await new Promise(resolve => setTimeout(resolve,1000));
           //    if(OSprice['price']<=getCurrentAlliancePriceUnlimited(200, 20,settings['originPsicrystalQuantity'])){
           //      console.log("doUnlimitedAllianceShop grit");
           //      await doUnlimitedAllianceShop(206,settings['originPsicrystalQuantity']);
           //    }               
           //  }

           //  if (settings['originGritCheckbox'] == true && settings['originGritQuantity'] != null){
           //    await new Promise(resolve => setTimeout(resolve,1000));
           //    if(gritPrice['price']<=getCurrentAlliancePriceUnlimited(400, 40,settings['originGritQuantity'])){
           //      console.log("doUnlimitedAllianceShop grit");
           //      await doUnlimitedAllianceShop(207,settings['originGritQuantity']);
           //    }   
           //  }

           //  if (settings['hellBfCheckbox'] == true && settings['hellBfQuantity'] != null && settings['hellBfQuantity']*15 <= userI['mgcc']){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    console.log("do hell Shop bf");
           //    await doHellShop(2,settings['hellBfQuantity']);
           //  }
           //  if (settings['hellHpCheckbox'] == true && settings['hellHpQuantity'] != null && settings['hellHpQuantity']*10 <= userI['mgcc']){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    console.log("do hell Shop heavenIntPill");
           //    await doHellShop(5,settings['hellHpQuantity']);
           //  }
           //  if (settings['hellHcCheckbox'] == true && settings['hellHcQuantity'] != null && settings['hellHcQuantity']*50 <= userI['mgcc']){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    console.log("do hell Shop heavenly crystal");
           //    await doHellShop(6,settings['hellHcQuantity']);
           //  }
           //  if (settings['doBoutiqueCheckbox'] == true){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    console.log("doBoutique");
           //    await doBoutique();
           //  }
           //  if (settings['useBoutiqueKeyCheckbox'] == true){
           //    await new Promise(resolve => setTimeout(resolve,1000));
           //    console.log("useBoutiqueKey");
           //    await useBoutiqueKeys();
           //  }
           //  if (settings['buyCompeteP4H1Checkbox'] == true){
           //    await new Promise(resolve => setTimeout(resolve,1000));
           //    console.log("buyCompeteP4H1Checkbox");
           //    await buyCompeteShop(113,2);
           //  }
           //  if (settings['buyCompeteTPP1Checkbox'] == true){
           //    await new Promise(resolve => setTimeout(resolve,1000));
           //    console.log("buyCompeteTPP1Checkbox");
           //    await buyCompeteShop(114,2);
           //  }
           //  if (settings['buyCompeteP4H2Checkbox'] == true){
           //    await new Promise(resolve => setTimeout(resolve,1000));
           //    console.log("buyCompeteP4H2Checkbox");
           //    await buyCompeteShop(115,3);
           //  }
           //  if (settings['buyCompeteTPP2Checkbox'] == true){
           //    await new Promise(resolve => setTimeout(resolve,1000));
           //    console.log("buyCompeteTPP2Checkbox");
           //    await buyCompeteShop(116,3);
           //  }
            

           //  if (settings['doXTshopCheckbox'] == true && userI['xingTianSc'] > 9000){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    console.log("doXtShop");
           //    await doXTShop();
           //  }
           //  if (settings['doManLocCotCheckbox'] == true){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    await manualCotLocal();
           //  }

           //  if (settings['doManCSCotCheckbox'] == true){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    await manualCotCS();
           //  }


           //  if (settings['doManStormCotCheckbox'] == true){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    await manualCotStorm();
           //  }

           //  if (settings['doManHeavenlyCotCheckbox'] == true){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    await manualCotHeavenly();
           //  }

           //  if (settings['doManACSCotCheckbox'] == true){
           //    await new Promise(resolve => setTimeout(resolve,1000));

           //    await manualCotACS();
           //  }
           //  if (settings['doChaosCheckbox'] == true){
           //    await new Promise(resolve => setTimeout(resolve,1000));
           //    await doChaos();
           //  }
            
           //  if (settings['doAllAdsCheckbox'] == true && (adsLimits['xianGe'] != 10 || adsLimits['blackMarket'] != 10 || adsLimits['home'] != 10 || adsLimits['robe'] != 8 || adsLimits['shopRecharge'] != 8) ){
           //    await new Promise(resolve => setTimeout(resolve,1000));
           //    //await doAds(adsLimit);
           //    await doAds();
           //  }

           //  if (settings['usePCandITCheckbox'] == true){
           //      await new Promise(resolve => setTimeout(resolve,1000));
           //      console.log("usePCandIT");
           //      await usePCandIT();
           //  }
           //  if (settings['doRuinCheckbox'] == true){
           //      await new Promise(resolve => setTimeout(resolve,1000));

           //      console.log("doRuinCheckbox");
           //      await doRuin();
           //  }
           //  if (settings['doRobFLCheckbox'] == true){
           //      await new Promise(resolve => setTimeout(resolve,1000));

           //      console.log("doRobFLCheckbox");
           //      await doRobFL();
           //  }

           //  if (settings['doPantheonRewardCheckbox'] == true){
           //    await new Promise(resolve => setTimeout(resolve,2000))
           //    console.log("get pantheon rewards");
           //    await doPantheonReward();
           //    await new Promise(resolve => setTimeout(resolve,2000))
           //    console.log("get pantheon rewards chest");
           //    await doPantheonRewardChest();
           //  }
           //  if(settings['readAndDelMailsCheckBox'] == true){
           //    await new Promise(resolve => setTimeout(resolve,1000));
           //    console.log("readAndDelMails");
           //    try{
           //      await readAndDelMails();
           //    }catch(error){
           //      ws.close();
           //    }
           //  }

            await new Promise(resolve => setTimeout(resolve,1000));
            await getUserInfo();

            await new Promise(resolve => setTimeout(resolve,1000));
            
            
            ws.close();

        } catch (error) {
            console.error('An error occurred: ' + error);
            writeLogs("Unlogged due to an error");
            auto();
        }
        

    } else {
        writeLogs("No settings selected");
    }

}

async function autoNew3() {
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
        await runRequests3(userName, password, serv, settings);

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}



