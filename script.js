// initialize application when DOM is loaded
function setup() {
  allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
  setupSearch();
  setupEpisodeSelector();
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

//---------------------------------
//level 300: Episode selector
//--------------------------------
function setupEpisodeSelector() {
  const selector = document.getElementById("episodeSelector");

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
// start the app
window.onload = setup;
