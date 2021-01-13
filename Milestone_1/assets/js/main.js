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
		moviesList: [],
		search:" ",
		language:"it-IT",
		page:"1",
		totalPage: null,//potrei usare questo paramentro per far variare ad ogni ciclo il paramentro page cosi 
		totalResults: null,//restituire quanti risultati associati ha trovato
	},
	methods: {
		callAPIMovies: function() {
			axios
			.get(`https://api.themoviedb.org/3/search/movie?api_key=3da5e6e7a04f636199811dd74636e80d&language=${this.language}&query=${this.search}&page=${this.page}&include_adult=false`)
			.then(resp => {
				let movies = resp.data.results;//percorso in cui reperire gli "oggetti" di interesse
				this.moviesList = movies;
				this.totalPage = resp.data.total_pages;
			})
			.catch(error => {
					console.log(error);
			});
		},
		searchMovies(){
			this.page = 1;
			this.callAPIMovies();
		},
		pageNext(){
			if(this.page !== this.totalPage){
				this.page++;
				this.callAPIMovies();
			}
		},
		pagePrevious(){
			if(this.page !== 1){
				this.page--;
				this.callAPIMovies();
			}
		},
		numberPage(position){
			this.page = position;
		}
	},
});