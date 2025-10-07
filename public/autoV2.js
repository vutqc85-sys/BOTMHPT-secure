var reqid = 1;
var userInfos = [];
var dotInfo = [];
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

        ws.addEventListener('message', function(event) {           

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
                                battle['hId'] = userInfos['heros'][i-4]['cId'];
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

async function runRequests2(userName, password, server, settings) {
    console.log("settings");
    console.log(settings);
    if (settings != null) {
        let accessToken = await getToken(userName, password, server);
        try {
            await initWebSocket2(accessToken, server);

            
            await new Promise(resolve => setTimeout(resolve,2000))
            await getUserInfo();
            await prepDot();
            await new Promise(resolve => setTimeout(resolve,1000));
            console.log(dotInfo);
            if(dotInfo['rBattle'].length > 0){
                for (var i = 0; i < dotInfo['rBattle'].length; i++) {
                    await launchDot(dotInfo['rBattle'][i]['hId'],dotInfo['rBattle'][i]['eId']);
                    await doDotfBoost();
                    await autoDot(dotInfo['rBattle'][i]['eId']);
                    await new Promise(resolve => setTimeout(resolve,500));

                }
            }
            

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

async function autoNew() {
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
        await runRequests2(userName, password, serv, settings);

    } catch (error) {
        console.error('An error occurred: ' + error);
    }
}