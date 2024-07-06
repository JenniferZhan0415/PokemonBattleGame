/**
 * Get pokemon data from API
 * @param {Number} id
 * @returns
 */

async function getPokemon(id) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await response.json();
  return data;
}

/**
 * init 50 Pokemon Selection
 */
async function initPokemonSelect() {
  const pokemonSelect = document.getElementById("pokemon");
  for (let i = 1; i <= 50; i++) {
    const pokemon = await getPokemon(i);
    // console.log(pokemon);
    const option = document.createElement("option");
    option.value = pokemon.id;
    option.text = pokemon.name;
    pokemonSelect.appendChild(option);
  }
}

/**
 * User select Pokemon
 */
async function selectUserPokemon() {
  const selectedPokemonId = document.getElementById("pokemon").value;
  const userPokemon = await getPokemon(selectedPokemonId);
  displayPokemonCard(userPokemon, "user-pokemon-container", "Your Pokemon");
  checkBattleReady();
}

/**
 * random select enemy pokemon
 */
async function selectEnemyPokemon() {
  const randomPokemonId = Math.floor(Math.random() * 151) + 1; // 随机选择一个宝可梦
  const enemyPokemon = await getPokemon(randomPokemonId);
  displayPokemonCard(enemyPokemon, "enemy-pokemon-container", "Enemy Pokemon");
  checkBattleReady(randomPokemonId);
}

// display pokemon Card and health-bar
function displayPokemonCard(pokemon, containerId, title) {
  const container = document.getElementById(containerId);
  container.innerHTML = ""; // clean previous data
  const cardDiv = document.createElement("div");
  cardDiv.className = "pokemon-card";

  cardDiv.innerHTML = `
        <h3>${title}</h3>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p>${pokemon.name}</p>
        <div class="health-bar">
            <div class="health-bar-inner" style="width: 100%"></div>
        </div>
    `;

  container.appendChild(cardDiv);
}

/**
 * calculate the battle result
 * @param {Object} pokemon1
 * @param {Object} pokemon2
 */
function calculateBattle(pokemon1, pokemon2) {
  const hp1Max = pokemon1.stats.find(
    (stat) => stat.stat.name === "hp"
  ).base_stat;
  const hp2Max = pokemon2.stats.find(
    (stat) => stat.stat.name === "hp"
  ).base_stat;

  const attack1 = pokemon1.stats.find(
    (stat) => stat.stat.name === "attack"
  ).base_stat;
  const attack2 = pokemon2.stats.find(
    (stat) => stat.stat.name === "attack"
  ).base_stat;

  // first round
  console.log(`Enemy's hp before the attach: ${hp2Max}`);
  const hp2 = hp2Max - attack1;
  console.log(`Enemy's hp after the attach: ${hp2}`);

  // updateHealthBar("user-pokemon-container", hp1);
  updateHealthBar("enemy-pokemon-container", hp2, hp2Max);

  // battle shaking effect
  const userCard = document.getElementById("user-pokemon-container").firstChild;
  const enemyCard = document.getElementById(
    "enemy-pokemon-container"
  ).firstChild;
  enemyCard.classList.add("shake");
  userCard.classList.add("shake");
  setTimeout(() => enemyCard.classList.remove("shake"), 1000);
  setTimeout(() => userCard.classList.remove("shake"), 1000);

  // after 1.5sec remove shaking effect
  setTimeout(() => {
    userCard.classList.add("shake");
    enemyCard.classList.add("shake");
    setTimeout(() => userCard.classList.remove("shake"), 1000);
    setTimeout(() => enemyCard.classList.remove("shake"), 1000);

    // Second round
    console.log(`User's hp before the attach: ${hp1Max}`);
    const hp1 = hp1Max - attack2;
    console.log(`User's hp after the attach: ${hp1}`);

    // update the final health bar
    // updateHealthBar("enemy-pokemon-container", hp2);
    updateHealthBar("user-pokemon-container", hp1, hp1Max);

    // check win or loss
    if (hp1 > hp2) {
      endBattle(
        "user-pokemon-container",
        "enemy-pokemon-container",
        pokemon1,
        pokemon2
      );
    } else if (hp1 < hp2) {
      endBattle(
        "enemy-pokemon-container",
        "user-pokemon-container",
        pokemon2,
        pokemon1
      );
    } else {
      const resultDiv = document.createElement("h2");
      resultDiv.textContent = "It's a tie!";
      document.querySelector(".battle-result").appendChild(resultDiv);
    }
  }, 1500); // after 1.5sec start the second round
}

// Update health bar value
function updateHealthBar(containerId, hp, maxHp) {
  const healthBar = document
    .getElementById(containerId)
    .querySelector(".health-bar-inner");
  const normalHp = Math.max(0, hp);
  const hpPercent = (normalHp / maxHp) * 100;
  healthBar.style.width = `${hpPercent}%`;
}

function restoreHealthBar(containerId) {
  const healthBar = document
    .getElementById(containerId)
    .querySelector(".health-bar-inner");
  healthBar.style.width = `100%`;
}

// ending battle
function endBattle(
  winnerContainerId,
  loserContainerId,
  winnerPokemon,
  loserPokemon
) {
  const resultDiv = document.createElement("h2");
  resultDiv.textContent = `${winnerPokemon.name} wins!`;
  document.querySelector(".battle-result").appendChild(resultDiv);

  // highlight the winner card
  document
    .getElementById(winnerContainerId)
    .firstChild.classList.add("highlight");
  document
    .getElementById(loserContainerId)
    .firstChild.classList.add("grayscale");

  // display reset button
  function resetBattle() {
    const resetButton = document.querySelector(".restart-button");
    resetButton.classList.add("restart-button--active");
    resetButton.addEventListener("click", () => {
      document.querySelector(".battle-result").innerHTML = "";
      const userContainerId = "user-pokemon-container";
      const enemyContainerId = "enemy-pokemon-container";
      const userContainer = document.getElementById(userContainerId);
      const enemyContainer = document.getElementById(enemyContainerId);
      userContainer.innerHTML = "";
      enemyContainer.innerHTML = "";
      resetButton.classList.remove("restart-button--active");
      const battleButton = document.querySelector(".battle-button");
      battleButton.style.display = "none";
    });
  }
  resetBattle();
}

// check battle is ready
function checkBattleReady(enemyPokemonId) {
  const userCard = document.getElementById("user-pokemon-container").innerHTML;
  const enemyCard = document.getElementById(
    "enemy-pokemon-container"
  ).innerHTML;
  const battleButton = document.querySelector(".battle-button");

  if (userCard && enemyCard) {
    battleButton.style.display = "block";
    battleButton.onclick = () => startBattle(enemyPokemonId);
  } else {
    battleButton.style.display = "none";
  }
}

// start battle
async function startBattle(enemyPokemonId) {
  // clear previous data
  document.querySelector(".battle-result").innerHTML = "";

  const selectedPokemonId = document.getElementById("pokemon").value;
  const userPokemon = await getPokemon(selectedPokemonId);
  const enemyPokemon = await getPokemon(enemyPokemonId);

  // first round：user attack
  calculateBattle(userPokemon, enemyPokemon);
}

// init pokemon selection
initPokemonSelect();
