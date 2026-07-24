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

function createPlaceCard(place) {
  const article = document.createElement("article");
  article.className = "operation-place";

  const title = document.createElement("h5");
  title.textContent = place.nombre || "Lugar sin nombre";
  article.appendChild(title);

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

function enableOperationCategories() {
  const buttons =
    document.querySelectorAll(".operation-category");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((otherButton) => {
        otherButton.classList.remove("active");
      });

      button.classList.add("active");

      selectOperationCategory(
        button.dataset.category
      );
    });
  });

  selectOperationCategory("all");
}

async function startApp() {
  await loadDestination();

  await loadComponent(
    "map-component",
    "components/map.html"
  );

  enableFolders();
  enableOperationCategories();
}

startApp();