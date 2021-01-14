/*
Creare un layout base con una searchbar (una input e un button) in cui possiamo
scrivere completamente o parzialmente il nome di un film. Possiamo, cliccando il
bottone, cercare sull’API tutti i film che contengono ciò che ha scritto l’utente.
Vogliamo dopo la risposta dell’API visualizzare a schermo i seguenti valori per ogni
film trovato:
1. Titolo
2. Titolo Originale
3. Lingua
4. Voto */

let appMoviesSearch = new Vue ({
	el:'#appMoviesSearch',
	data: {
		key: '3da5e6e7a04f636199811dd74636e80d',
		searchResults:null,
		moviesList: [],
		serieTVList: [],//potrei creare un array di oggetti 
		search:"",
		pageMovies: 1,
		pageSerieTV: 1,
		language:"it-IT",
		totalPageMovies:0,
		totalPageSerieTV:0,
	},
	methods: {
		//ho inserito il variatore di scala direttamente del condizionale costruito mediante operatori ternari in html
/* 		arround() {
			this.moviesList.forEach(element => {
				element.vote_average = Math.ceil(element.vote_average/2);
				//console.log(element.vote_average);
			});
		}, */
		getData(url){
				return axios.get(url);
		},
		callAPIMovies: function() {
			/* quando guardiamo nella scheda rete si può notare che con due richieste separate separate una dopo l'altra, cioè sfalsata - richiedendo più tempo e potenzialmente creare problemi di latenze e virtualizzazioni con Vue. Se le due richieste non sono dipendenti, possiamo utilizzare il promise.all() che ci consnete di accettare più promesse in un array, le esegue simultaneamente e restituisce una serie di risposte come promessa */

			/******* Si crea dipendenza nella generazione ******/
			/* Promise.all () accetta più promesse in un array, le esegue simultaneamente e restituisce una serie di risposte come promessa. */

			let movies = `https://api.themoviedb.org/3/search/movie?api_key=3da5e6e7a04f636199811dd74636e80d&language=${this.language}&query=${this.search}&page=${this.pageMovies}&include_adult=true`;
			let serieTv = `https://api.themoviedb.org/3/search/tv?api_key=3da5e6e7a04f636199811dd74636e80d&language=${this.language}&query=${this.search}&page=${this.pageSerieTV}&include_adult=true`;
			let countryRest = `https://restcountries.eu/rest/v2/`;

			const promise = Promise.all([this.getData(movies), this.getData(serieTv), this.getData(countryRest)]);
			

			//destrutturia la promaise 
			promise.then(([resp1,resp2,resp3]) => {
				//console.log(resp1,resp2,resp3);

				//Movies
				this.moviesList = resp1.data.results;
				this.totalPageMovies = resp1.data.total_pages;

				//Serie TV 
				this.serieTVList = resp2.data.results;
				this.totalPageSerieTV = resp2.data.total_pages;

				//chiamata APY Country REST
				let country = resp3.data;
				console.log(country);
				for (let index = 0; index < this.moviesList.length; index++) {
					let movieCardLenguage = this.moviesList[index].original_language;
					console.log(movieCardLenguage);
					let country = resp3.data;
					for (let i = 0; i < country.length; i++) {
						const element = country[i].languages[0].iso639_1;
						console.log(element);
					}
				}
			})
			.catch(error => {
					console.log(error);
			});
		},
		searchMovies(){
			this.pageMovies = 1;
			this.pageSerieTV = 1;
			this.callAPIMovies();
		},

		//trasformare in funzioni riutilizzabili
		pageNext(){
			if(this.pageMovies !== this.totalPageMovies){
				this.pageMovies++;
				this.callAPIMovies();
			}
		},
		pagePrevious(){
			if(this.pageMovies !== 1){
				this.pageMovies--;
				this.callAPIMovies();
			}
		},pageNextSerieTV(){
			if(this.pageSerieTV !== this.totalPageSerieTV){
				this.pageSerieTV++;
				this.callAPIMovies();
			}
		},
		pagePreviousSerieTV(page){
			if(this.pageSerieTV !== 1){
				this.pageSerieTV--;
				this.callAPIMovies();
			}
		},
	},
});