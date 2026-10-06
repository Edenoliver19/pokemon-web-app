const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0";

const pokemonGrid = document.getElementById("pokemonGrid");
const searchInput = document.getElementById("searchInput");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error");
const noResults = document.getElementById("noResults");

let allPokemon = [];


/*
    Get the first 20 Pokémon from PokéAPI
*/
async function fetchPokemon() {
    try {
        loading.classList.remove("hidden");
        errorMessage.classList.add("hidden");

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch Pokémon list");
        }

        const data = await response.json();

        /*
            The first API request gives us the names
            and URLs of the 20 Pokémon.
        */
        const pokemonDetails = await Promise.all(
            data.results.map(async (pokemon) => {

                const response = await fetch(pokemon.url);

                if (!response.ok) {
                    throw new Error("Failed to fetch Pokémon details");
                }

                return await response.json();
            })
        );

        allPokemon = pokemonDetails;

        displayPokemon(allPokemon);

    } catch (error) {

        console.error(error);

        errorMessage.classList.remove("hidden");

    } finally {

        loading.classList.add("hidden");
    }
}


/*
    Display Pokémon cards
*/
function displayPokemon(pokemonList) {

    pokemonGrid.innerHTML = "";

    if (pokemonList.length === 0) {
        noResults.classList.remove("hidden");
        return;
    }

    noResults.classList.add("hidden");

    pokemonList.forEach((pokemon) => {

        const card = document.createElement("article");

        card.className = "pokemon-card";

        const image =
            pokemon.sprites.other["official-artwork"].front_default;

        const ability =
            pokemon.abilities[0].ability.name;

        card.innerHTML = `
            <p class="pokemon-number">
                #${String(pokemon.id).padStart(3, "0")}
            </p>

            <img
                class="pokemon-image"
                src="${image}"
                alt="${pokemon.name}"
            >

            <h2 class="pokemon-name">
                ${pokemon.name}
            </h2>

            <button class="ability-button">
                Show Ability
            </button>

            <p class="ability-message hidden">
                I am ${pokemon.name} and I have
                ${ability}.
            </p>
        `;

        const button = card.querySelector(".ability-button");
        const message = card.querySelector(".ability-message");

        button.addEventListener("click", () => {

            message.classList.toggle("hidden");

            if (message.classList.contains("hidden")) {
                button.textContent = "Show Ability";
            } else {
                button.textContent = "Hide Ability";
            }
        });

        pokemonGrid.appendChild(card);
    });
}


/*
    Search Pokémon by name

    IMPORTANT:
    We filter the Pokémon already loaded.
    We do NOT call the API every time the user types.
*/
searchInput.addEventListener("input", () => {

    const searchTerm = searchInput.value
        .toLowerCase()
        .trim();

    const filteredPokemon = allPokemon.filter((pokemon) => {

        return pokemon.name
            .toLowerCase()
            .includes(searchTerm);
    });

    displayPokemon(filteredPokemon);
});


/*
    Start the application
*/
fetchPokemon();
