// ---------------------------------------------
// LEVEL 400: GLOBAL CACHE & SHOW FETCHING
// ---------------------------------------------
let showsCache = {}; // stores all shows and episodes per show
let allEpisodes = []; // will be updated when show changes

async function loadShows() {
  if (!showsCache.allShows) {
    const res = await fetch("https://api.tvmaze.com/shows");
    const data = await res.json();

    // sort alphabetically (case-insensitive)
    showsCache.allShows = data.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );
  }
  return showsCache.allShows;
}

async function loadEpisodes(showId) {
  if (!showsCache[showId]) {
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    showsCache[showId] = await res.json();
  }
  return showsCache[showId];
}

// ---------------------------------------------
/* LEVEL 500: SHOWS LISTING VIEW */
// ---------------------------------------------
async function showShowsListing() {
  const showsView = document.getElementById("showsView");
  const episodesView = document.getElementById("episodesView");

  showsView.style.display = "block";
  episodesView.style.display = "none";

  const showsContainer = document.getElementById("showsContainer");
  showsContainer.innerHTML = "";

  const shows = await loadShows();

  shows.forEach((show) => {
    const card = createShowCard(show);
    showsContainer.appendChild(card);
  });
}

// ---------------------------------------------
// LEVEL 500: CREATE SHOW CARD
// ---------------------------------------------
function createShowCard(show) {
  const card = document.createElement("div");
  card.classList.add("show-card");

  card.innerHTML = `
    <h2>${show.name}</h2>
    <img src="${show.image?.medium || ""}" alt="${show.name}">
    <p>${show.summary}</p>
    <p><strong>Genres:</strong> ${show.genres.join(", ")}</p>
    <p><strong>Status:</strong> ${show.status}</p>
    <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
    <p><strong>Runtime:</strong> ${show.runtime} min</p>
  `;

  card.addEventListener("click", () => {
    showEpisodesView(show.id);
  });

  return card;
}

// ---------------------------------------------
// LEVEL 500: SHOW EPISODES VIEW
// ---------------------------------------------
async function showEpisodesView(showId) {
  const showsView = document.getElementById("showsView");
  const episodesView = document.getElementById("episodesView");

  showsView.style.display = "none";
  episodesView.style.display = "block";

  allEpisodes = await loadEpisodes(showId);

  makePageForEpisodes(allEpisodes);
  setupEpisodeSelector();
  setupSearch();
}

// ---------------------------------------------
// LEVEL 500: BACK BUTTON
// ---------------------------------------------
function setupBackButton() {
  const backBtn = document.getElementById("backToShows");
  backBtn.addEventListener("click", showShowsListing);
}

// ---------------------------------------------
// LEVEL 500: SHOW SEARCH
// ---------------------------------------------
function setupShowSearch() {
  const input = document.getElementById("showSearch");
  const container = document.getElementById("showsContainer");

  input.addEventListener("input", async () => {
    const term = input.value.toLowerCase();
    const shows = await loadShows();

    const filtered = shows.filter(
      (show) =>
        show.name.toLowerCase().includes(term) ||
        show.summary.toLowerCase().includes(term) ||
        show.genres.join(" ").toLowerCase().includes(term),
    );

    container.innerHTML = "";
    filtered.forEach((show) => container.appendChild(createShowCard(show)));
  });
}

// populate the page with episode cards
//Episode Rendering
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // clear existing content
  rootElem.innerHTML = "";

  // create and append a card for each episode
  episodeList.forEach((episode) => {
    const card = createEpisodeCard(episode);
    rootElem.appendChild(card);
  });
}

function createEpisodeCard(episode) {
  const card = document.createElement("section");
  card.classList.add("episode-card");

  //give each card an ID for scrolling.
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
  summary.innerHTML = episode.summary;
  card.appendChild(summary);

  return card;
}

//---------------------------------
//level 200: Search and filter
//--------------------------------

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  const matchCount = document.getElementById("matchCount");

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();

    const filtered = allEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(term) ||
        ep.summary.toLowerCase().includes(term),
    );
    matchCount.textContent = `showing ${filtered.length} / ${allEpisodes.length} episodes`;
    makePageForEpisodes(filtered);
  });
}
function resetSearch() {
  document.getElementById("searchInput").value = "";
  document.getElementById("matchCount").textContent = "";
}
//---------------------------------
//level 300: Episode selector
//--------------------------------
function setupEpisodeSelector() {
  const selector = document.getElementById("episodeSelector");

  // clear old options
  selector.innerHTML = `<option value="">Select an episode...</option>`;

  allEpisodes.forEach((ep) => {
    const season = String(ep.season).padStart(2, "0");
    const number = String(ep.number).padStart(2, "0");
    const code = `S${season}E${number}`;

    const option = document.createElement("option");
    option.value = `episode-${ep.id}`;
    option.textContent = `${code} - ${ep.name}`;
    selector.appendChild(option);
  });

  selector.addEventListener("change", () => {
    const selectedId = selector.value;
    if (!selectedId) return;

    const element = document.getElementById(selectedId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  });
}

// ---------------------------------------------
// LEVEL 500: NEW setup()
// ---------------------------------------------
async function setup() {
  await loadShows();
  setupShowSearch();
  setupBackButton();
  showShowsListing();
}
// start the app
window.onload = setup;
