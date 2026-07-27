"use strict";

const WHATTODO_PATH = "data/plans/whattodo.json";

async function loadWhatToDoData() {
  const response = await fetch(WHATTODO_PATH);

  if (!response.ok) {
    throw new Error(
      `No se pudo cargar whattodo.json: ${response.status}`
    );
  }

  const categories = await response.json();

  if (!Array.isArray(categories)) {
    throw new Error(
      "whattodo.json debe contener una lista de categorías"
    );
  }

  return categories;
}

function createWhatToDoAction({
  href,
  text,
  className = ""
}) {
  const link = document.createElement("a");

  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = text;

  if (className) {
    link.className = className;
  }

  return link;
}

function createWhatToDoCard(plan) {
  const article = document.createElement("article");
  article.className = "whattodo-card";

  const header = document.createElement("div");
  header.className = "whattodo-card-header";

  const icon = document.createElement("span");
  icon.className = "whattodo-card-icon";
  icon.textContent = plan.icono || "💡";

  const content = document.createElement("div");

  const title = document.createElement("h4");
  title.textContent = plan.nombre || "Idea sin nombre";

  content.appendChild(title);

  if (plan.comentario) {
    const comment = document.createElement("p");
    comment.textContent = plan.comentario;
    content.appendChild(comment);
  }

  header.appendChild(icon);
  header.appendChild(content);
  article.appendChild(header);

  const actions = document.createElement("div");
  actions.className = "whattodo-actions";

  if (plan.web) {
    actions.appendChild(
      createWhatToDoAction({
        href: plan.web,
        text: "🌐 Web",
        className: "whattodo-web-button"
      })
    );
  }

  if (plan.telefono) {
    const phoneLink = document.createElement("a");

    phoneLink.href = `tel:${plan.telefono}`;
    phoneLink.textContent = "📞 Llamar";
    phoneLink.className = "whattodo-call-button";

    actions.appendChild(phoneLink);
  }

  if (plan.googleMaps) {
    actions.appendChild(
      createWhatToDoAction({
        href: plan.googleMaps,
        text: "🧭 Cómo llegar",
        className: "whattodo-map-button"
      })
    );
  }

  if (actions.children.length > 0) {
    article.appendChild(actions);
  }

  return article;
}

function renderWhatToDoPlans(category, results) {
  results.innerHTML = "";

  const list = document.createElement("div");
  list.className = "whattodo-list";

  category.planes.forEach((plan) => {
    list.appendChild(createWhatToDoCard(plan));
  });

  results.appendChild(list);
}

function enableWhatToDoCategories(categories) {
  const categoriesContainer =
    document.getElementById("whattodo-categories");

  const results =
    document.getElementById("whattodo-results");

  if (!categoriesContainer || !results) {
    return;
  }

  categoriesContainer.innerHTML = "";

  categories.forEach((category) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "whattodo-category";
    button.dataset.category = category.id;

    button.innerHTML = `
      <span>${category.icono || "💡"}</span>
      <strong>${category.titulo}</strong>
    `;

    button.addEventListener("click", () => {
      const isActive =
        button.classList.contains("active");

      categoriesContainer
        .querySelectorAll(".whattodo-category")
        .forEach((otherButton) => {
          otherButton.classList.remove("active");
        });

      if (isActive) {
        results.hidden = true;
        results.innerHTML = "";
        return;
      }

      button.classList.add("active");
      results.hidden = false;

      renderWhatToDoPlans(category, results);

      button.insertAdjacentElement(
        "afterend",
        results
      );
    });

    categoriesContainer.appendChild(button);
  });

  results.hidden = true;
}

async function initWhatToDo() {
  const categoriesContainer =
    document.getElementById("whattodo-categories");

  if (!categoriesContainer) {
    return;
  }

  try {
    const categories = await loadWhatToDoData();
    enableWhatToDoCategories(categories);
  } catch (error) {
    console.error(error);

    categoriesContainer.innerHTML = `
      <p class="whattodo-error">
        No se han podido cargar las ideas.
      </p>
    `;
  }
}