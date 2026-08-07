"use strict";

const TRIP_EVENTS_PATH = "data/trip/events.json";

async function loadTripEvents() {
  const response = await fetch(TRIP_EVENTS_PATH);

  if (!response.ok) {
    throw new Error(
      `No se pudo cargar events.json: ${response.status}`
    );
  }

  const events = await response.json();

  if (!Array.isArray(events)) {
    throw new Error(
      "events.json debe contener una lista de eventos"
    );
  }

  return events;
}

function createTripEvent(event) {
  const article = document.createElement("article");
  article.className = "trip-event";

  const hasDetails =
    Array.isArray(event.detalle) &&
    event.detalle.length > 0;

  const header = document.createElement(
    hasDetails ? "button" : "div"
  );

  header.className = "trip-event-header";

  if (hasDetails) {
    header.type = "button";
  }

  const main = document.createElement("div");
  main.className = "trip-event-main";

  const icon = document.createElement("span");
  icon.className = "trip-event-icon";
  icon.textContent = event.icono || "📌";

  const text = document.createElement("div");

  const title = document.createElement("h4");
  title.textContent = event.nombre;

  text.appendChild(title);

  if (event.resumen) {
    const summary = document.createElement("p");
    summary.textContent = event.resumen;
    text.appendChild(summary);
  }

  main.appendChild(icon);
  main.appendChild(text);
  header.appendChild(main);

  if (hasDetails) {
    const arrow = document.createElement("span");
    arrow.className = "trip-event-arrow";
    arrow.textContent = "⌄";
    header.appendChild(arrow);
  }

  article.appendChild(header);

  if (hasDetails) {
    const details = document.createElement("div");
    details.className = "trip-event-details";
    details.hidden = true;

    event.detalle.forEach((item) => {
      const line = document.createElement("p");
      line.textContent = item;
      details.appendChild(line);
    });

    if (event.googleMaps) {
      const mapLink = document.createElement("a");

      mapLink.href = event.googleMaps;
      mapLink.target = "_blank";
      mapLink.rel = "noopener noreferrer";
      mapLink.className = "trip-map-button";
      mapLink.textContent = "🧭 Cómo llegar";

      details.appendChild(mapLink);
    }

    header.addEventListener("click", () => {
      const isOpen =
        article.classList.contains("open");

      document
        .querySelectorAll(".trip-event.open")
        .forEach((otherEvent) => {
          if (otherEvent !== article) {
            otherEvent.classList.remove("open");

            const otherDetails =
              otherEvent.querySelector(
                ".trip-event-details"
              );

            if (otherDetails) {
              otherDetails.hidden = true;
            }
          }
        });

      article.classList.toggle("open", !isOpen);
      details.hidden = isOpen;
    });

    article.appendChild(details);
  }

  return article;
}

async function initTripEvents() {
  const container =
    document.getElementById("trip-events");

  if (!container) {
    return;
  }

  try {
    const events = await loadTripEvents();

    container.innerHTML = "";

    events.forEach((event) => {
      container.appendChild(
        createTripEvent(event)
      );
    });
  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <p class="trip-error">
        No se ha podido cargar la información del viaje.
      </p>
    `;
  }
}