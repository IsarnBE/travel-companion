"use strict";

const CONFIG_PATH =
  "data/destinations/peniscola/config.json";

{
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

  await loadComponent(
  "whattodo-component",
  "components/whattodo.html"
);

  enableFolders();

await initOperations();
initWhatToDo();

updateTripCountdown();
}

startApp();