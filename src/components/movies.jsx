import React, { Component } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import _ from "lodash";
import MoviesTable from "./moviesTable";
import Pagination from "./common/pagination";
import ListGroup from "./common/listGroup";
import SearchBox from "./common/searchBox";
import { paginate } from "../utils/paginate";
import { getMovies, deleteMovie } from "../services/movieService";
import { getGenres } from "./../services/genreService";

class Movies extends Component {
  state = {
    movies: [],
    genres: [],
    selectedGenre: null,
    currentPage: 1,
    pageSize: 4,
    sort: { path: "title", order: "asc" },
    searchQuery: "",
    isLoading: true
  };

  async componentDidMount() {
    const defaultGenre = { _id: "", name: "All genres" };

    // getGenres().then(({ data }) => {
    //   const genres = [defaultGenre, ...data];
    //   this.setState({
    //     movies: getMovies(),
    //     genres: genres,
    //     selectedGenre: defaultGenre
    //   });
    // });

    const { data } = await getGenres();
    const genres = [defaultGenre, ...data];
    const { data: movies } = await getMovies();

    this.setState({
      movies,
      genres,
      selectedGenre: defaultGenre,
      isLoading: false
    });
  }

  handleDelete = async movie => {
    const originalMovies = this.state.movies;
    const movies = this.state.movies.filter(m => m._id !== movie._id);
    this.setState({ movies });

    try {
      await deleteMovie(movie._id);
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        toast.error("This movie has already been deleted.");
      this.setState({ movies: originalMovies });
    }
  };

  handleLike = movie => {
    const movies = [...this.state.movies];
    const index = movies.indexOf(movie);
    movies[index] = { ...movie };
    movies[index].liked = !movies[index].liked;
    this.setState({ movies });
  };

  handlePageChange = page => {
    this.setState({ currentPage: page });
  };

  handleGenreSelect = genre => {
    this.setState({ selectedGenre: genre, searchQuery: "", currentPage: 1 });
  };

  handleSort = sort => {
    this.setState({ sort });
  };

  handleSearch = query => {
    this.setState({ searchQuery: query, selectedGenre: null, currentPage: 1 });
  };

  getPageData = () => {
    const {
      pageSize,
      currentPage,
      movies: allMovies,
      selectedGenre,
      searchQuery,
      sort
    } = this.state;

    let filtered = allMovies;

    if (searchQuery) {
      filtered = allMovies.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (selectedGenre && selectedGenre._id) {
      filtered = allMovies.filter(m => m.genre._id === selectedGenre._id);
    }

    const sorted = _.orderBy(filtered, [sort.path], [sort.order]);

    const movies = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, data: movies };
  };

  render() {
    const { pageSize, currentPage, sort, searchQuery, isLoading } = this.state;
    const { user } = this.props;

    const { totalCount, data } = this.getPageData();

    return (
      <React.Fragment>
        {!isLoading ? (
          <div className="row">
            <div className="col-2">
              <ListGroup
                items={this.state.genres}
                onItemSelect={this.handleGenreSelect}
                selectedItem={this.state.selectedGenre}
              />
            </div>
            <div className="col">
              {user && user.isAdmin && (
                <Link to="movies/new/" className="btn btn-primary">
                  New Movie
                </Link>
              )}
              <p>Showing {totalCount} movies in the database.</p>
              <SearchBox value={searchQuery} onChange={this.handleSearch} />
              <MoviesTable
                movies={data}
                onLike={this.handleLike}
                onDelete={this.handleDelete}
                sortColumn={sort}
                onSort={this.handleSort}
              />
              <Pagination
                itemsCount={totalCount}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={this.handlePageChange}
              />
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </React.Fragment>
    );
  }
}

export default Movies;
