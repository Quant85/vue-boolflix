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
		searchResults:{},
		search:"",
		pageMovies: 1,//inserito di default in chiamata - lo teniamo fino a nuova soluzione o variazione -
		pageSerieTV: 1,//inserito di default in chiamata - lo teniamo fino a nuova soluzione o variazione -per scorrere/caricare ulteriori risultati
		language:"it-IT",
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
			

			//destrutturiamo la promais 
			promise.then(([resp1,resp2,resp3]) => {
				console.log(resp1,resp2,resp3);

				function listResults() {}
				const objRisults = new listResults();

				function listResultsMovies() {}//definisco l'oggetto
				const objRisultatiMovies = new listResultsMovies();//creo e assegno l'oggetto di nome listResult - equivale ad usare un costructor tipo oggettoRisultati = Object.create(listResultsMovies.prototype);

				function listResultsSeries() {}//definisco l'oggetto
				const objRisultatiSeries = new listResultsSeries();//come per film cosi per serie tv

				//questa funzione mi permette di assegmare degli oggetti ad un oggetto origine che è il primo 
				function addElement(objRisultati,moviesList,seriesList,pageTot,startPage) {
					let newList = Object.assign(objRisultati, moviesList,seriesList);
					return newList;
				}

				function getObjArray(array,arrayPush,img,title,originTitle,originaleLanguage,vote,flagLink){
					array.forEach(element => {
						let keyObj = {
							backgroungImgPoster: element[img],
							title: element[title],
							originalTitle:element[originTitle],
							originaleLanguage:element[originaleLanguage],
							vote:(Math.ceil(element[vote]/2)),
							flag:element[flagLink]
						};
						arrayPush.push(keyObj);
					});
				}
				

				//Movies ------------
				let moviesRes = resp1.data.results;//faccio una richiesta per i film
				//this.totalPageMovies = resp1.data.total_pages;//---da eliminare
				
				let arrayMovies = [];//mi creo un array di appoggio per poi creare un oggetto di ogetti contenenti tutti i risultati dei film
				getObjArray(moviesRes,arrayMovies,'poster_path','title','original_title','original_language','vote_average');

				objRisultatiMovies.arrayMovies = arrayMovies;			
				objRisultatiMovies.totalPageMovies = resp1.data.total_pages;
				
				//console.log(objRisultatiMovies);

				//Serie TV ---------
				let seriesRes = resp2.data.results;//faccio una richiesta per le serie tv
				//this.totalPageSerieTV = resp2.data.total_pages;//---da eliminare perchè richamata nel nuovo oggetto creato

				let arraySeries = [];//mi creo un array di appoggio per i risultati delle serie tv
				getObjArray(seriesRes,arraySeries,'poster_path','name','original_name','original_language','vote_average');

				objRisultatiSeries.arraySeries = arraySeries;			
				objRisultatiSeries.totalPageSerieTV = resp2.data.total_pages;

				//console.log(objRisultatiMovies);

				addElement(objRisults,objRisultatiMovies,objRisultatiSeries);

				//console.log(objRisults);

				//this.moviesList = objRisultatiMovies;//opzionale - per futuri sviluppi
				//this.serieTVList = objRisultatiSeries;//opzionale -per futuri sviluppi
				this.searchResults = objRisults;

				//chiamata APY Country REST - associazione bandiere - lingua
					
				/* gestione dell'errore - dovuto all'incongruenza di associare isoCode lingueistici a delle bandiere */
				/* creando un oggetto contenente come valore key il code linguistico e come valore il code bandiera associato, in caso di futuri errori riscontrati o cambiamenti associativi di bandiere lingua si potra aggiungere un nuovo elemento all'oggetto o variare quelli presenti */

				/* questi sono solo alcuni errori facilmente e direttamente riscontrati - questo vuol esser una possibile dimostrazione della sua gestione */
				let country = resp3.data;

				let errorFlag = {
					ar: "ae",
					cs: "cz",
					da: "dk",
					en: "gb",
					el: "gr",
					et: "ee",
					hu: "ua",
					ja: "jp",
					ko: "kr",
					vi: "vn",
					ta: "lk",
					zh: "cn",
				};

				getFlagLink(arraySeries,errorFlag);
				getFlagLink(arrayMovies,errorFlag);
				
				function errorCheckerFlags(readyArray,errorCheckerObj){
					let arrayKeyObj = Object.keys(errorCheckerObj);
					let molt = (readyArray.length * arrayKeyObj.length);//anche se ho un solo risultato partiranno almeno tot cicli qunti sono le potenziali correzioni
					for (let z = 0; z < (molt); z++) {
						for (let i = 0; i < molt; i++) {
							let keyObj = arrayKeyObj[i];
							let check = readyArray.indexOf(keyObj);
							if (check != -1) {
								readyArray[check] = errorCheckerObj[keyObj];	
							}
						}
					}
				}			
				function getFlagLink(arrayType,errorCheckerObj){
					let flagalphA2Code = country.map(e => [e.alpha2Code.toLowerCase(),e.flag]);
					let arrayLang = arrayType.map(e => e.originaleLanguage);
					errorCheckerFlags(arrayLang,errorCheckerObj);
					for (let n = 0; n < arrayType.length; n++) {
						let isoLang = arrayLang[n];
						for (let i = 0; i < flagalphA2Code.length; i++) {
							let alphA2Code = flagalphA2Code[i][0];
							let flagLink = flagalphA2Code[i][1];
							if (isoLang == alphA2Code) {
								arrayType[n].flag = flagLink;
							}
						}
					}
				}
				
			})
			.catch(error => {
					console.log(error);
			});
		},
		searchMovies(search){
			if (search!="") {
				this.pageMovies = 1;
				this.pageSerieTV = 1;
				this.callAPIMovies();
			}
		},
		//trasformare in funzioni riutilizzabili - trovare il modo di legare la page number per evitare la sovrascrizione del valore alla generazione della chiamata
		pageNext(){
			if((this.pageMovies) !== (this.searchResults.totalPageMovies)){
				this.pageMovies++;
				this.callAPIMovies();
			}
		},
		pagePrevious(){
			if(this.pageMovies !== 1){
				this.pageMovies--;
				this.callAPIMovies();
			}
		},
		pageNextSerieTV(){
			if(this.pageSerieTV !== this.searchResults.totalPageSerieTV){
				this.pageSerieTV++;
				this.callAPIMovies();
			}
		},
		pagePreviousSerieTV(){
			if(this.pageSerieTV !== 1){
				this.callAPIMovies();
				this.pageSerieTV--;
			}
		},
	},
});