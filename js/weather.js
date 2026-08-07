"use strict";

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=40.3574" +
  "&longitude=0.4069" +
  "&current=weather_code" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
  "&timezone=auto" +
  "&forecast_days=16";

function getWeatherIcon(code) {
  if (code === 0) return "☀️";

  if ([1, 2].includes(code)) return "🌤️";

  if (code === 3) return "☁️";

  if ([45, 48].includes(code)) return "🌫️";

  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";

  if (
    [61, 63, 65, 66, 67, 80, 81, 82].includes(code)
  ) {
    return "🌧️";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "❄️";
  }

  if ([95, 96, 99].includes(code)) return "⛈️";

  return "🌤️";
}function updateHeroWeather(code) {
  const hero = document.querySelector(".hero");

  if (!hero) {
    return;
  }

  hero.classList.remove(
    "weather-sunny",
    "weather-cloudy",
    "weather-rainy",
    "weather-storm"
  );

  if ([0, 1].includes(code)) {
    hero.classList.add("weather-sunny");
    return;
  }

  if ([2, 3, 45, 48].includes(code)) {
    hero.classList.add("weather-cloudy");
    return;
  }

  if ([95, 96, 99].includes(code)) {
    hero.classList.add("weather-storm");
    return;
  }

  if (
    [
      51, 53, 55, 56, 57,
      61, 63, 65, 66, 67,
      80, 81, 82
    ].includes(code)
  ) {
    hero.classList.add("weather-rainy");
  }
}function updateHeroWeather(code) {
  const hero = document.querySelector(".hero");

  if (!hero) {
    return;
  }

  hero.classList.remove(
    "weather-sunny",
    "weather-cloudy",
    "weather-rainy",
    "weather-storm"
  );

  if ([0, 1].includes(code)) {
    hero.classList.add("weather-sunny");
    return;
  }

  if ([2, 3, 45, 48].includes(code)) {
    hero.classList.add("weather-cloudy");
    return;
  }

  if ([95, 96, 99].includes(code)) {
    hero.classList.add("weather-storm");
    return;
  }

  if (
    [
      51, 53, 55, 56, 57,
      61, 63, 65, 66, 67,
      80, 81, 82
    ].includes(code)
  ) {
    hero.classList.add("weather-rainy");
  }
}

async function loadWeather() {
  try {
    const response = await fetch(WEATHER_URL);

    if (!response.ok) {
      throw new Error(
        `No se pudo cargar el tiempo: ${response.status}`
      );
    }

    const data = await response.json();
    if (
  data.current &&
  Number.isFinite(data.current.weather_code)
) {
  updateHeroWeather(data.current.weather_code);
}

    const tripDates = [
      "2026-08-10",
      "2026-08-11",
      "2026-08-12",
      "2026-08-13",
      "2026-08-14",
      "2026-08-15",
      "2026-08-16"
    ];

    const cards =
      document.querySelectorAll(".forecast-day");

    tripDates.forEach((date, index) => {
      const weatherIndex =
        data.daily.time.indexOf(date);

      if (weatherIndex === -1 || !cards[index]) {
        return;
      }

      const max =
        Math.round(
          data.daily.temperature_2m_max[weatherIndex]
        );

      const min =
        Math.round(
          data.daily.temperature_2m_min[weatherIndex]
        );

      const code =
        data.daily.weather_code[weatherIndex];

      const icon =
        cards[index].querySelector(".weather-icon");

      const temperature =
        cards[index].querySelector("small");

      /*
       * El 12 de agosto conservamos el icono
       * especial del eclipse.
       */
      if (date !== "2026-08-12" && icon) {
        icon.textContent = getWeatherIcon(code);
      }

      if (temperature) {
        temperature.textContent = `${max}° / ${min}°`;
      }
    });

    const weatherNote =
      document.querySelector(".weather-note");

    if (weatherNote) {
      const now = new Date();

const time = now.toLocaleTimeString("es-ES", {
  hour: "2-digit",
  minute: "2-digit"
});

weatherNote.textContent =
  `Previsión actualizada a las ${time}`;
    }
  } catch (error) {
    console.error(error);

    const weatherNote =
      document.querySelector(".weather-note");

    if (weatherNote) {
      weatherNote.textContent =
        "No se ha podido actualizar la previsión.";
    }
  }
}