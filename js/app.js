"use strict";

const CONFIG_PATH =
  "data/destinations/peniscola/config.json";

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

async function startApp() {
  await loadDestination();

  await loadComponent(
    "map-component",
    "components/map.html"
  );

  enableFolders();
}

startApp();