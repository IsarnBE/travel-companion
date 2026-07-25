"use strict";

const CONFIG_PATH =
  "data/destinations/peniscola/config.json";

const OPERATIONS_PATH = "data/operations";

const operationCategories = {
  principal: {
    title: "Principal",
    file: "principal.json"
  },
  services: {
    title: "Servicios",
    file: "services.json"
  },
  places: {
    title: "Lugares de interés",
    file: "places.json"
  },
  beaches: {
    title: "Playas",
    file: "beaches.json"
  },
  restaurants: {
    title: "Restaurantes",
    file: "restaurants.json"
  },
  icecreams: {
    title: "Heladerías",
    file: "icecreams.json"
  },
  bars: {
    title: "Bares y Beach Clubs",
    file: "bars.json"
  }
};

async function loadDestination() {
  try {
    const response = await fetch(CONFIG_PATH);

    if (!response.ok) {
      throw new Error(
        `No se pudo cargar config.json: ${response.status}`
      );
    }

    const config = await response.json();

    document.getElementById("destination-name").textContent =
      config.name;

    document.getElementById("destination-dates").textContent =
      config.dateLabel;

    document.getElementById("destination-subtitle").textContent =
      config.subtitle;

    document.title = `${config.name} · Travel Companion`;
  } catch (error) {
    console.error(error);

    document.getElementById("destination-name").textContent =
      "Peñíscola";

    document.getElementById("destination-dates").textContent =
      "10–16 agosto 2026";

    document.getElementById("destination-subtitle").textContent =
      "No se ha podido leer config.json";
  }
}

async function loadComponent(elementId, filePath) {
  const container = document.getElementById(elementId);

  if (!container) {
    console.error(`No existe el contenedor #${elementId}`);
    return;
  }

  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(
        `No se pudo cargar ${filePath}: ${response.status}`
      );
    }

    container.innerHTML = await response.text();
  } catch (error) {
    console.error(error);

    container.innerHTML =
      "<p>No se ha podido cargar esta sección.</p>";
  }
}

function enableFolders() {
  const folders = document.querySelectorAll(".folder");

  folders.forEach((folder) => {
    const button = folder.querySelector(".folder-tab");

    if (!button) {
      return;
    }

    button.addEventListener("click", () => {
      const wasOpen = folder.classList.contains("open");

      folders.forEach((otherFolder) => {
        otherFolder.classList.remove("open");
      });

      if (!wasOpen) {
        folder.classList.add("open");
      }
    });
  });
}

async function fetchOperationFile(fileName) {
  const response = await fetch(
    `${OPERATIONS_PATH}/${fileName}`
  );

  if (!response.ok) {
    throw new Error(
      `No se pudo cargar ${fileName}: ${response.status}`
    );
  }

  const places = await response.json();

  if (!Array.isArray(places)) {
    throw new Error(`${fileName} debe contener una lista JSON`);
  }

  return places;
}

async function getOperations(category) {
  if (category !== "all") {
    const configuration = operationCategories[category];

    if (!configuration) {
      return [];
    }

    const places = await fetchOperationFile(
      configuration.file
    );

    return places.map((place) => ({
      ...place,
      category
    }));
  }

  const entries = Object.entries(operationCategories);

  const results = await Promise.all(
    entries.map(async ([categoryKey, configuration]) => {
      const places = await fetchOperationFile(
        configuration.file
      );

      return places.map((place) => ({
        ...place,
        category: categoryKey
      }));
    })
  );

  return results.flat();
}
let currentPosition = null;

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371;

  const latitudeDifference = toRadians(lat2 - lat1);
  const longitudeDifference = toRadians(lng2 - lng1);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c = 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );

  return earthRadiusKm * c;
}

function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1).replace(".", ",")} km`;
}

function requestUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        resolve(currentPosition);
      },
      (error) => {
        console.warn(
          "No se ha podido obtener la ubicación:",
          error
        );

        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}
function createPlaceCard(place) {
  const article = document.createElement("article");
  article.className = "operation-place";

  const title = document.createElement("h5");
  title.textContent = place.nombre || "Lugar sin nombre";
  article.appendChild(title);
if (
  currentPosition &&
  Number.isFinite(place.lat) &&
  Number.isFinite(place.lng)
) {
  const distanceKm = calculateDistance(
    currentPosition.lat,
    currentPosition.lng,
    place.lat,
    place.lng
  );

  const distance = document.createElement("span");
  distance.className = "operation-distance";
  distance.textContent =
    `📍 A ${formatDistance(distanceKm)}`;

  article.appendChild(distance);
}
  if (place.comentario) {
    const comment = document.createElement("p");
    comment.textContent = place.comentario;
    article.appendChild(comment);
  }

  const actions = document.createElement("div");
  actions.className = "operation-actions";

  if (place.googleMaps) {
    const mapLink = document.createElement("a");
    mapLink.href = place.googleMaps;
    mapLink.target = "_blank";
    mapLink.rel = "noopener noreferrer";
    mapLink.textContent = "🧭 Cómo llegar";
    actions.appendChild(mapLink);
  }

  if (place.telefono) {
    const phoneLink = document.createElement("a");
    phoneLink.href = `tel:${place.telefono}`;
    phoneLink.className = "call-button";
    phoneLink.textContent = "📞 Llamar";
    actions.appendChild(phoneLink);
  }

  if (actions.children.length > 0) {
    article.appendChild(actions);
  }

  return article;
}

function renderOperations(places, title) {
  const list = document.getElementById("operations-list");
  const titleElement =
    document.getElementById("operations-title");
  const countElement =
    document.getElementById("operations-count");

  titleElement.textContent = title;
  countElement.textContent =
    `${places.length} ${places.length === 1 ? "lugar" : "lugares"}`;

  list.innerHTML = "";

  if (places.length === 0) {
    list.innerHTML = `
      <p class="operations-empty">
        Todavía no hay lugares en esta categoría.
      </p>
    `;
    return;
  }

  places.forEach((place) => {
    list.appendChild(createPlaceCard(place));
  });
}

async function selectOperationCategory(category) {
  const list = document.getElementById("operations-list");

  list.innerHTML = `
    <p class="operations-empty">
      Cargando lugares...
    </p>
  `;

  const title =
    category === "all"
      ? "Todo"
      : operationCategories[category]?.title || "Lugares";

  try {
    const places = await getOperations(category);

if (category === "restaurants" && currentPosition) {
  places.sort((placeA, placeB) => {
    const distanceA =
      Number.isFinite(placeA.lat) &&
      Number.isFinite(placeA.lng)
        ? calculateDistance(
            currentPosition.lat,
            currentPosition.lng,
            placeA.lat,
            placeA.lng
          )
        : Infinity;

    const distanceB =
      Number.isFinite(placeB.lat) &&
      Number.isFinite(placeB.lng)
        ? calculateDistance(
            currentPosition.lat,
            currentPosition.lng,
            placeB.lat,
            placeB.lng
          )
        : Infinity;

    return distanceA - distanceB;
  });
}

renderOperations(places, title);
  } catch (error) {
    console.error(error);

    document.getElementById("operations-title").textContent =
      title;

    document.getElementById("operations-count").textContent =
      "Error";

    list.innerHTML = `
      <p class="operations-error">
        No se han podido cargar los lugares.
        Comprueba que los archivos JSON contienen [].
      </p>
    `;
  }
}

function moveOperationsResults(button) {
  const results =
    document.getElementById("operations-results");

  const row =
    button.closest(".operations-row");

  if (!results || !row) {
    return;
  }

  row.appendChild(results);
}

function enableOperationCategories() {
  const buttons =
    document.querySelectorAll(".operation-category");

  const results =
    document.getElementById("operations-results");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const isActive =
        button.classList.contains("active");

      buttons.forEach((otherButton) => {
        otherButton.classList.remove("active");
      });

      if (isActive) {
        if (results) {
          results.hidden = true;
        }

        return;
      }

      button.classList.add("active");

      if (results) {
        results.hidden = false;
      }

      moveOperationsResults(button);

      selectOperationCategory(
        button.dataset.category
      );
    });
  });

  const initialButton =
    document.querySelector(
      '.operation-category[data-category="all"]'
    );

  if (initialButton) {
    initialButton.classList.remove("active");
    moveOperationsResults(initialButton);
  }

  if (results) {
    results.hidden = true;
  }
}

  const initialButton =
    document.querySelector(
      '.operation-category[data-category="all"]'
    );

  if (initialButton) {
    moveOperationsResults(initialButton);
  }

  selectOperationCategory("all");

function updateTripCountdown() {
  const numberElement =
    document.getElementById("trip-number");

  const messageElement =
    document.getElementById("trip-message");

  const unitElement =
    document.querySelector(".countdown-unit");

  if (!numberElement || !messageElement || !unitElement) {
    return;
  }

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const arrival = new Date(2026, 7, 10);
  const departure = new Date(2026, 7, 16);

  const oneDay = 1000 * 60 * 60 * 24;

  if (today < arrival) {
    const daysLeft = Math.ceil(
      (arrival - today) / oneDay
    );

    numberElement.textContent = daysLeft;
    unitElement.textContent =
      daysLeft === 1 ? "DÍA" : "DÍAS";

    messageElement.textContent =
      "para vernos en Peñíscola";

    return;
  }

  if (today >= arrival && today <= departure) {
    const tripDay =
      Math.floor((today - arrival) / oneDay) + 1;

    numberElement.textContent = tripDay;
    unitElement.textContent = "DÍA";

    messageElement.textContent =
      tripDay === 1
        ? "¡Ya estamos en Peñíscola!"
        : tripDay === 7
          ? "Último día · ¡A disfrutarlo!"
          : `de 7 en Peñíscola`;

    return;
  }

  numberElement.textContent = "✓";
  unitElement.textContent = "PEÑÍSCOLA 2026";
  messageElement.textContent =
    "El viaje ha terminado · Revive los recuerdos";
}
async function startApp() {
  await loadDestination();

  await loadComponent(
    "map-component",
    "components/map.html"
  );

  await requestUserLocation();
  
  enableFolders();
  enableOperationCategories();
  updateTripCountdown();
}

startApp();