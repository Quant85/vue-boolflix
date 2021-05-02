/* Milestone 2:
In questa milestone come prima cosa aggiungiamo la copertina del film o della serie
al nostro elenco. Ci viene passata dall’API solo la parte finale dell’URL, questo
perché poi potremo generare da quella porzione di URL tante dimensioni diverse.
Dovremo prendere quindi l’URL base delle immagini di TMDB:
https://image.tmdb.org/t/p/ per poi aggiungere la dimensione che vogliamo generare
(troviamo tutte le dimensioni possibili a questo link:
https://www.themoviedb.org/talk/53c11d4ec3a3684cf4006400 ) per poi aggiungere la
parte finale dell’URL passata dall’API.
Esempio di URL:
https://image.tmdb.org/t/p/w342/wwemzKWzjKYJFfCeiB57q3r4Bcm.png */

let appMoviesSearch = new Vue ({
	el:'#appMoviesSearch',
	data: {
		key: '3da5e6e7a04f636199811dd74636e80d',
		searchResults:{},
		search:"",
		adult:false,
		pageMovies: 1,//inserito di default in chiamata - lo teniamo fino a nuova soluzione o variazione -
		pageSerieTV: 1,//inserito di default in chiamata - lo teniamo fino a nuova soluzione o variazione -per scorrere/caricare ulteriori risultati
		language:"it-IT",
		visible:true,
	},
	methods: {
		getData(url){
				return axios.get(url);
		},
		callAPIMovies: function() {
			/* quando guardiamo nella scheda rete si può notare che con due richieste separate separate una dopo l'altra, cioè sfalsata - richiedendo più tempo e potenzialmente creare problemi di latenze e virtualizzazioni con Vue. Se le due richieste non sono dipendenti, possiamo utilizzare il promise.all() che ci consnete di accettare più promesse in un array, le esegue simultaneamente e restituisce una serie di risposte come promessa */

			/******* Si crea dipendenza nella generazione ******/
			/* Promise.all () accetta più promesse in un array, le esegue simultaneamente e restituisce una serie di risposte come promessa. */
			let prefixMovies,prefixSerieTv,suffixMovies,suffixSerieTv,movies,serieTv,countryRest;

			if (this.search !== ""){
				 prefixMovies = "https://api.themoviedb.org/3/search/movie";
				 prefixSerieTv = "https://api.themoviedb.org/3/search/tv";
				 suffixMovies = `&query=${this.search}&page=${this.pageMovies}&include_adult=${this.adult}`;
				 suffixSerieTv = `&query=${this.search}&page=${this.pageMovies}&include_adult=${this.adult}`;
			} else {
				 prefixMovies = "https://api.themoviedb.org/3/movie/popular";
				 prefixSerieTv = "https://api.themoviedb.org/3/tv/popular";
				 suffixMovies = ``;
				 suffixSerieTv = ``;
			}

			movies = `${prefixMovies}?api_key=${this.key}&language=${this.language}${suffixMovies}`;
			serieTv = `${prefixSerieTv}?api_key=${this.key}&language=${this.language}${suffixSerieTv}`;
			countryRest = `https://restcountries.eu/rest/v2/all`;

			const promise = Promise.all([this.getData(movies), this.getData(serieTv), this.getData(countryRest)]);
			

			//destrutturiamo la promais 
			promise.then(([resp1,resp2,resp3]) => {
				console.log(resp1,resp2,resp3);

				function sectionsType() {}
				let objsectionsType = new sectionsType();

				function listResultsMovies() {}//definisco l'oggetto
				const objRisultatiMovies = new listResultsMovies();//creo e assegno l'oggetto di nome listResult - equivale ad usare un costructor tipo oggettoRisultati = Object.create(listResultsMovies.prototype);

				function listResultsSeries() {}//definisco l'oggetto
				const objRisultatiSeries = new listResultsSeries();//come per film cosi per serie tv

				//questa funzione mi permette di assegmare degli oggetti ad un oggetto origine che è il primo 
				/* function addElement(objRisultati,moviesList,seriesList,pageTot,startPage) {
					let newList = Object.assign(objRisultati, moviesList,seriesList);
				}  --- sostituita per aggiornamento nello schema di creazione degli oggetti*/

				function getObjArray(array,arrayPush,img,title,originTitle,originaleLanguage,vote,flagLink,description){
					array.forEach(element => {
						let keyObj = {
							backgroungImgPoster: element[img],
							title: element[title],
							originalTitle:element[originTitle],
							originaleLanguage:element[originaleLanguage],
							vote:(Math.ceil(element[vote]/2)),
							flag:element[flagLink],
							overview: element['overview'],
						};
						arrayPush.push(keyObj);
					});
				}
				

				//Movies ------------
				let moviesRes = resp1.data.results;//faccio una richiesta per i film
				//this.totalPageMovies = resp1.data.total_pages;//---da eliminare
				
				let arrayMovies = [];//mi creo un array di appoggio per poi creare un oggetto di ogetti contenenti tutti i risultati dei film
				getObjArray(moviesRes,arrayMovies,'poster_path','title','original_title','original_language','vote_average','overview'); 

				objRisultatiMovies.results = arrayMovies;			
				

				//Serie TV ---------
				let seriesRes = resp2.data.results;//faccio una richiesta per le serie tv

				let arraySeries = [];//mi creo un array di appoggio per i risultati delle serie tv
				getObjArray(seriesRes,arraySeries,'poster_path','name','original_name','original_language','vote_average','overview');

				objRisultatiSeries.results = arraySeries;
				
				/* ----------- raggruppiamo i risultati in un unico blocco facilmente reiterabile ---------- */

				/* qui posso aggiungere future implementazioni di ricerca come per popolarità - ultime uscite ecc */

				objsectionsType = {
					objRisultatiMovies:objRisultatiMovies,
					objRisultatiSeries:objRisultatiSeries,
				};

				this.searchResults = objsectionsType;
				this.searchResults.objRisultatiMovies.totalPage = resp1.data.total_pages;
				this.searchResults.objRisultatiMovies.nameCategory = "Flickes";
				this.searchResults.objRisultatiSeries.totalPage = resp2.data.total_pages;
				this.searchResults.objRisultatiSeries.nameCategory = "Series TV";

				
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
		pageNext(categoriTotPag){
			if (categoriTotPag == this.searchResults.objRisultatiSeries.totalPage) {
				if(this.pageSerieTV !== this.searchResults.objRisultatiSeries.totalPage){
				this.pageSerieTV++;
				this.callAPIMovies();
				}
			}else if (categoriTotPag == this.searchResults.objRisultatiMovies.totalPage){
				if((this.pageMovies) !== (this.searchResults.objRisultatiMovies.totalPage)){
					this.pageMovies++;
					this.callAPIMovies();
				}
			}
		},
		pagePrevious(categoriTotPag){
			if (categoriTotPag == this.searchResults.objRisultatiSeries.totalPage) {
				if(this.pageSerieTV !== 1){
					this.pageSerieTV--;
					this.callAPIMovies();
				}
			}else if (categoriTotPag == this.searchResults.objRisultatiMovies.totalPage ) {
				if(this.pageMovies !== 1){
					this.pageMovies--;
					this.callAPIMovies();
				}		
			}
		},
		changeThisPage(index,z){
			if (index == this.searchResults.objRisultatiSeries.totalPage) {
				this.pageSerieTV = z+1;
				this.callAPIMovies();
			} else if (index == this.searchResults.objRisultatiMovies.totalPage){
				this.pageMovies = z+1;
				this.callAPIMovies();
			}
		}
	},
	async mounted() {
		this.callAPIMovies();
	}
});
