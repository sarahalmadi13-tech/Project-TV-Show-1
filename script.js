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

async function setupShowSelector() {
  const showSelect = document.getElementById("showSelector");
  const shows = await loadShows();

  // clear old options (important when switching)
  showSelect.innerHTML = `<option value="">Select a show...</option>`;

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  // When user selects a show → load episodes
  showSelect.addEventListener("change", async () => {
    const showId = showSelect.value;
    if (!showId) return;

    allEpisodes = await loadEpisodes(showId);

    makePageForEpisodes(allEpisodes);
    setupEpisodeSelector(); // rebuild episode dropdown
    resetSearch(); // clear search + match count
  });
}

// populate the page with episode cards
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
// LEVEL 400: NEW setup()
// ---------------------------------------------
async function setup() {
  await setupShowSelector(); // load shows first

  // pick the first show automatically
  const firstShowId = document.getElementById("showSelector").value;

  if (firstShowId) {
    allEpisodes = await loadEpisodes(firstShowId);
    makePageForEpisodes(allEpisodes);
    setupEpisodeSelector();
  }

  setupSearch();
}
// start the app
window.onload = setup;
