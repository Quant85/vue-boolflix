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
		searchResults:null,
		moviesList: [],
		serieTVList: [],//potrei creare un array di oggetti 
		search:"",
		pageMovies: 1,
		pageSerieTV: 1,
		language:"it-IT",
		totalPageMovies:0,
		totalPageSerieTV:0,
		arrayFlag:[],
	},
	methods: {

		getData(url){
				return axios.get(url);
		},
		callAPIMovies: function() {
			/* quando guardiamo nella scheda rete si può notare che con due richieste separate separate una dopo l'altra, cioè sfalsata - richiedendo più tempo e potenzialmente creare problemi di latenze e virtualizzazioni con Vue. Se le due richieste non sono dipendenti, possiamo utilizzare il promise.all() che ci consnete di accettare più promesse in un array, le esegue simultaneamente e restituisce una serie di risposte come promessa */

			/******* Si crea dipendenza nella generazione ******/
			/* Promise.all () accetta più promesse in un array, le esegue simultaneamente e restituisce una serie di risposte come promessa. */

			let movies = `https://api.themoviedb.org/3/search/movie?api_key=3da5e6e7a04f636199811dd74636e80d&language=${this.language}&query=${this.search}&page=${this.pageMovies}&include_adult=false`;
			let serieTv = `https://api.themoviedb.org/3/search/tv?api_key=3da5e6e7a04f636199811dd74636e80d&language=${this.language}&query=${this.search}&page=${this.pageSerieTV}&include_adult=false`;
			let countryRest = `https://restcountries.eu/rest/v2/all`;

			const promise = Promise.all([this.getData(movies), this.getData(serieTv), this.getData(countryRest)]);
			

			//destrutturi la promais 
			promise.then(([resp1,resp2,resp3]) => {
				console.log(resp1,resp2,resp3);

				//Movies
				this.moviesList = resp1.data.results;
				this.totalPageMovies = resp1.data.total_pages;

				//Serie TV 
				this.serieTVList = resp2.data.results;
				this.totalPageSerieTV = resp2.data.total_pages;

				//chiamata APY Country REST
				for (let index = 0; index < this.moviesList.length; index++) {
					let country = resp3.data;
					let movieCardLenguage = this.moviesList[index].original_language;


					/* let macroObj = country.filter((lang) => ((lang.alpha2Code).toLowerCase() == movieCardLenguage));
					let arrProvvisorio=[];
					macroObj.forEach(obj => {
						let prova=obj.population;
						arrProvvisorio.push(prova);
					}); */
					let restObj = [...country.filter((lang) => ((lang.alpha2Code).toLowerCase() == movieCardLenguage))];

					moviesList.forEach(element => {
						this.moviesList.flagLink = 
						
					});
					console.log(restObj[0].flag);
					
					// ------ricordati che sei in un ciclo for sopra ----

					

					/* let languagesAPI_ISO639_1 = [...new Set(country.map(item => {
						if ((item.alpha2Code).toLowerCase() == movieCardLenguage) 
							return item.flag;					
					} ))];
					console.log(languagesAPI_ISO639_1);
					this.arrayFlag.push(languagesAPI_ISO639_1[1]);
					let arraySupporto=this.arrayFlag;
					let arrayLink = arraySupporto.map(item =>  item.flag);
					console.log(arrayLink); */

					/* for (let i = 0; i < languagesAPI_ISO639_1.length; i++) {
						const flagLink = languagesAPI_ISO639_1[i].flag;
						console.log(flagLink);
						//this.moviesList obj["key3"] = "value3";
						
					} */
					//this.arrayFlag.push(languagesAPI_ISO639_1);
					//console.log(this.arrayFlag[0][1][1]);//questo è il link della bandiera trovata
					console.log(restObj);
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