const movieSearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');

async function loadMovies(searchTerm){
    const URL = `https://www.omdbapi.com/?s=${searchTerm}&page=1&apikey=fc1fef96`;
    try {
        const res = await fetch(URL);
        if (!res.ok) {
            throw new Error(`Network response was not ok ${res.statusText}`);
        }
        const data = await res.json();
        if(data.Response === "True") {
            displayMovieList(data.Search);
        } else {
            searchList.innerHTML = `<p class="no-result">${data.Error}</p>`;
        }
    } catch (error) {
        console.error("Error fetching movies:", error);
        searchList.innerHTML = `<p class="error-message">Something went wrong. Please try again later.</p>`;
    }
}

function findMovies(){
    const searchTerm = movieSearchBox.value.trim();
    if(searchTerm.length > 0){
        searchList.classList.remove('hide-search-list');
        loadMovies(searchTerm);
    } else {
        searchList.classList.add('hide-search-list');
    }
}

function debounce(func, delay){
    let timeout;
    return function(){
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

const debouncedFindMovies = debounce(findMovies, 500);

function displayMovieList(movies){
    searchList.innerHTML = "";
    for(const movie of movies){
        const movieListItem = document.createElement('div');
        movieListItem.dataset.id = movie.imdbID;  
        movieListItem.classList.add('search-list-item');
        const moviePoster = movie.Poster !== "N/A" ? movie.Poster : "image_not_found.png";
        movieListItem.innerHTML = `
            <div class="search-item-thumbnail">
                <img src="${moviePoster}" alt="movie poster">
            </div>
            <div class="search-item-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
            </div>
        `;
        searchList.appendChild(movieListItem);
    }
    loadMovieDetails();
}

function loadMovieDetails(){
    const searchListMovies = searchList.querySelectorAll('.search-list-item');
    searchListMovies.forEach(movie => {
        movie.addEventListener('click', async () => {
            searchList.classList.add('hide-search-list');
            movieSearchBox.value = "";
            try {
                const result = await fetch(`https://www.omdbapi.com/?i=${movie.dataset.id}&apikey=fc1fef96`);
                if (!result.ok) {
                    throw new Error(`Network response was not ok ${result.statusText}`);
                }
                const movieDetails = await result.json();
                displayMovieDetails(movieDetails);
            } catch (error) {
                console.error("Error fetching movie details:", error);
                resultGrid.innerHTML = `<p class="error-message">Unable to load movie details. Please try again later.</p>`;
            }
        });
    });
}

function displayMovieDetails(details){
    resultGrid.innerHTML = `
        <div class="movie-poster">
            <img src="${details.Poster !== "N/A" ? details.Poster : "image_not_found.png"}" alt="movie poster">
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${details.Title}</h3>
            <ul class="movie-misc-info">
                <li class="year">Year: ${details.Year}</li>
                <li class="rated">Ratings: ${details.Rated}</li>
                <li class="released">Released: ${details.Released}</li>
            </ul>
            <p class="genre"><b>Genre:</b> ${details.Genre}</p>
            <p class="writer"><b>Writer:</b> ${details.Writer}</p>
            <p class="actors"><b>Actors:</b> ${details.Actors}</p>
            <p class="plot"><b>Plot:</b> ${details.Plot}</p>
            <p class="language"><b>Language:</b> ${details.Language}</p>
            <p class="awards"><b><i class="fas fa-award"></i></b> ${details.Awards}</p>
        </div>
    `;
}

window.addEventListener('click', (event) => {
    if(event.target.className !== "form-control"){
        searchList.classList.add('hide-search-list');
    }
});

movieSearchBox.addEventListener('input', debouncedFindMovies);
