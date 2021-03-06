/* Milestone 2:
Trasformiamo il voto da 1 a 10 decimale in un numero intero da 1 a 5, così da
permetterci di stampare a schermo un numero di stelle piene che vanno da 1 a 5,
lasciando le restanti vuote (troviamo le icone in FontAwesome).
Arrotondiamo sempre per eccesso all’unità successiva, non gestiamo icone mezze
piene (o mezze vuote :P)
Trasformiamo poi la stringa statica della lingua in una vera e propria bandiera della
nazione corrispondente, gestendo il caso in cui non abbiamo la bandiera della
nazione ritornata dall’API (le flag non ci sono in FontAwesome).
Allarghiamo poi la ricerca anche alle serie tv. Con la stessa azione di ricerca
dovremo prendere sia i film che corrispondono alla query, sia le serie tv, stando
attenti ad avere alla fine dei valori simili (le serie e i film hanno campi nel JSON di
risposta diversi, simili ma non sempre identici)
Qui un esempio di chiamata per le serie tv:
https://api.themoviedb.org/3/search/tv?api_key=e99307154c6dfb0b4750f6603256716d&language=it_IT&query=s
crubs
Milestone */

let appMoviesSearch = new Vue ({
	el:'#appMoviesSearch',
	data: {
		key: '3da5e6e7a04f636199811dd74636e80d',
		//searchResults:null,
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