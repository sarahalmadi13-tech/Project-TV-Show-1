// ==================== GLOBAL STATE ====================
let allShows = [];
let currentEpisodes = [];
const cachedEpisodes = {};

// ==================== SHOWS VIEW ====================

async function loadAllShows() {
  try {
    const showsContainer = document.getElementById("shows-container");
    showsContainer.innerHTML = "<p style='padding: 20px; text-align: center;'>Loading shows...</p>";

    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) throw new Error("Failed to fetch shows");

    allShows = await response.json();
    allShows.sort((a, b) => a.name.localeCompare(b.name));

    renderShowCards(allShows);
    setupShowSearch();
  } catch (error) {
    document.getElementById("shows-container").innerHTML = 
      `<p style="color: red; padding: 20px;">⚠️ Error loading shows: ${error.message}</p>`;
  const container = document.getElementById("shows-container");
  container.innerHTML = "";

  if (shows.length === 0) {
    container.innerHTML = "<p>No shows found</p>";
    return;
  }

  shows.forEach((show) => {
    const card = document.createElement("div");
    card.className = "show-card";

    const imageUrl = show.image?.medium || "";
    const genresText = show.genres.join(", ") || "N/A";
    const ratingText = show.rating?.average || "N/A";
    const summaryText = show.summary
      ? show.summary.replace(/<[^>]+>/g, "").substring(0, 120) + "..."
      : "No summary";

    card.innerHTML = `
      <h3>${show.name}</h3>
      <img src="${imageUrl}" alt="${show.name}" />
      <p>${summaryText}</p>
      <p><strong>Genres:</strong> ${genresText}</p>
      <p><strong>Status:</strong> ${show.status}</p>
      <p><strong>Rating:</strong> ${ratingText}</p>
      <p><strong>Runtime:</strong> ${show.runtime || "N/A"} min</p>
    `;

    card.addEventListener("click", () => onShowSelected(show.id));
    container.appendChild(card);
  });
}

function setupShowSearch() {
  const searchInput = document.getElementById("showSearch");
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();

    const filtered = allShows.filter((show) => {
      const name = show.name.toLowerCase();
      const genres = show.genres.join(" ").toLowerCase();
      const summary = (show.summary || "").toLowerCase();

      return (
        name.includes(term) || genres.includes(term) || summary.includes(term)
      );
    });

    renderShowCards(filtered);
  });
}

// ==================== EPISODES VIEW ====================

async function onShowSelected(showId) {
  const episodesView = document.getElementById("episodes-view");
  const showsView = document.getElementById("shows-view");

  episodesView.style.display = "block";
  showsView.style.display = "none";

  const root = document.getElementById("root");
  root.innerHTML = "<p>Loading episodes...</p>";

  try {
    if (!cachedEpisodes[showId]) {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`,
      );
      if (!response.ok) throw new Error("Failed to fetch episodes");
      cachedEpisodes[showId] = await response.json();
    }

    currentEpisodes = cachedEpisodes[showId];
    makePageForEpisodes(currentEpisodes);
    setupSearch();
    setupEpisodeSelector();
  } catch (error) {
    root.innerHTML = `<p style="color: red;">Error loading episodes: ${error.message}</p>`;
    console.error(error);
  }
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  episodeList.forEach((episode) => {
    const card = createEpisodeCard(episode);
    rootElem.appendChild(card);
  });
}

function createEpisodeCard(episode) {
  const card = document.createElement("section");
  card.classList.add("episode-card");
  card.id = `episode-${episode.id}`;

  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  const episodeCode = `S${season}E${number}`;

  const title = document.createElement("h2");
  title.textContent = `${episode.name} - ${episodeCode}`;
  card.appendChild(title);

  const img = document.createElement("img");
  img.src = episode.image?.medium || "";
  img.alt = `${episode.name} cover`;
  card.appendChild(img);

  const summary = document.createElement("div");
  summary.classList.add("episode-summary");
  summary.innerHTML = episode.summary || "No summary available";
  card.appendChild(summary);

  return card;
}

// ==================== EPISODE SEARCH & FILTER ====================

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  const matchCount = document.getElementById("matchCount");

  // Clear previous listeners by recreating
  const newSearchInput = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(newSearchInput, searchInput);

  newSearchInput.addEventListener("input", () => {
    const term = newSearchInput.value.toLowerCase();

    const filtered = currentEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(term) ||
        (ep.summary || "").toLowerCase().includes(term),
    );

    matchCount.textContent = `showing ${filtered.length} / ${currentEpisodes.length} episodes`;
    makePageForEpisodes(filtered);
  });
}

// ==================== EPISODE SELECTOR ====================

function setupEpisodeSelector() {
  const selector = document.getElementById("episodeSelector");

  // Clear previous options
  selector.innerHTML = '<option value="">Select an episode...</option>';

  currentEpisodes.forEach((ep) => {
    const season = String(ep.season).padStart(2, "0");
    const number = String(ep.number).padStart(2, "0");
    const code = `S${season}E${number}`;

    const option = document.createElement("option");
    option.value = `episode-${ep.id}`;
    option.textContent = `${code} - ${ep.name}`;
    selector.appendChild(option);
  });

  // Remove old listeners and add new
  const newSelector = selector.cloneNode(true);
  selector.parentNode.replaceChild(newSelector, selector);

  newSelector.addEventListener("change", () => {
    const selectedId = newSelector.value;
    if (!selectedId) return;

    const element = document.getElementById(selectedId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  });
}

// ==================== BACK BUTTON ====================

function setupBackButton() {
  const backBtn = document.getElementById("back-btn");
  backBtn.addEventListener("click", () => {
    const episodesView = document.getElementById("episodes-view");
    const showsView = document.getElementById("shows-view");

    episodesView.style.display = "none";
    showsView.style.display = "block";

    // Reset search and selector
    document.getElementById("searchInput").value = "";
    document.getElementById("episodeSelector").value = "";
    document.getElementById("matchCount").textContent = "";
  });
}

// ==================== START APP ====================

window.onload = () => {
  setupBackButton();
  loadAllShows();
};
