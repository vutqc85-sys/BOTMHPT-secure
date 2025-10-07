// Récupérer la liste des auths depuis le localStorage
let auths = JSON.parse(window.localStorage.getItem('auths')) || [];

// Récupérer le conteneur de la liste des auths dans le DOM
let authList = document.getElementById('auths-container');

function displayAuths() {
  // Vider le conteneur pour éviter les duplications
  let authList = document.getElementById("auths-list");
  authList.innerHTML = '';

  // Créer un tableau pour stocker les données des auths
  let table = document.createElement("table");
  table.classList.add("table", "table-bordered"); // Ajouter les classes Bootstrap pour le style
  table.style.borderCollapse = "collapse"; // Fusionner les bordures adjacentes

  // Créer les en-têtes de colonne
  let headers = table.createTHead().insertRow();
  let nameHeader = headers.insertCell();
  nameHeader.textContent = "name";
  let serverHeader = headers.insertCell();
  serverHeader.textContent = "server";
  let pageHeader = headers.insertCell();
  pageHeader.textContent = "auto page";

  // Boucler sur la liste des auths et créer une ligne pour chaque élément
  auths.forEach((auth, index) => {
    let row = table.insertRow();
    let nameCell = row.insertCell();
    nameCell.textContent = auth.displayName;
    let serverCell = row.insertCell();
    serverCell.textContent = auth.server;
    let pageCell = row.insertCell();
    let button = document.createElement("button");
    button.classList.add("btn", "btn-primary"); // Ajouter les classes Bootstrap pour le style
    button.textContent = "Open";
    button.addEventListener("click", () => {
      window.open(`user.html?userIndex=${index}`, '_blank');
    });
    pageCell.appendChild(button);
    let editUser = document.createElement("button");
    
    editUser.classList.add("btn", "btn-primary", "mx-2"); // Ajouter les classes Bootstrap pour le style
    editUser.textContent = "Edit";
    editUser.addEventListener("click", () => {
      window.open(`edit.html?userIndex=${index}`, '_blank');
    });
    pageCell.appendChild(editUser);
    let webVersion = document.createElement("button");    
    webVersion.classList.add("btn", "btn-info", "mx-2"); // Ajouter les classes Bootstrap pour le style
    webVersion.textContent = "webVersion";
    webVersion.addEventListener("click", () => {
      webBrowser(auth.username,auth.password);
    });
    pageCell.appendChild(webVersion);
    let moveUpButton = document.createElement("button");
    moveUpButton.classList.add("btn", "btn-success", "mx-2");
    moveUpButton.textContent = "Up";
    moveUpButton.addEventListener("click", () => {
      if (index > 0) {
        // Échanger l'élément avec l'élément précédent
        [auths[index], auths[index - 1]] = [auths[index - 1], auths[index]];
        // Mettre à jour le localStorage
        window.localStorage.setItem('auths', JSON.stringify(auths));
        // Réafficher la liste
        displayAuths();
      }
    });

    let moveDownButton = document.createElement("button");
    moveDownButton.classList.add("btn", "btn-warning", "mx-2");
    moveDownButton.textContent = "Down";
    moveDownButton.addEventListener("click", () => {
    if (index < auths.length - 1) {
      // Échanger l'élément avec l'élément suivant
      [auths[index], auths[index + 1]] = [auths[index + 1], auths[index]];
      // Mettre à jour le localStorage
      window.localStorage.setItem('auths', JSON.stringify(auths));
      // Réafficher la liste
      displayAuths();
    }
  });

  pageCell.appendChild(moveUpButton);
  pageCell.appendChild(moveDownButton);
  });

  // Ajouter le tableau au conteneur
  authList.appendChild(table);

  // Ajouter un événement pour filtrer les résultats
  let searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", () => {
    let filter = searchInput.value.toUpperCase();
    let rows = table.getElementsByTagName("tr");
    for (let i = 0; i < rows.length; i++) {
      let cells = rows[i].getElementsByTagName("td");
      let visible = false;
      for (let j = 0; j < cells.length; j++) {
        let cell = cells[j];
        if (cell.textContent.toUpperCase().indexOf(filter) > -1) {
          visible = true;
          break;
        }
      }
      rows[i].style.display = visible ? "" : "none";
    }
  });


}



// Appeler la fonction pour afficher la liste des utilisateurs au chargement de la page
displayAuths();