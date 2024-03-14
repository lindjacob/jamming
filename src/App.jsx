import React, { Component } from 'react';
import SearchBar from './components/SearchBar/SearchBar';
import SearchResults from './components/SearchResults/SearchResults';
import Playlist from './components/Playlist/Playlist';
import Spotify from './util/Spotify';
import './App.css';

class componentName extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            searchResults: [],
            playlistName: 'New Playlist',
            playlistTracks: [],
        };

        this.changePlaylistName = this.changePlaylistName.bind(this);
        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.savePlaylist = this.savePlaylist.bind(this);
        this.search = this.search.bind(this);
    }

    componentDidMount() {
        // Check if the URL contains an access token
        let accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const storedSearchTerm = localStorage.getItem('search_term');

        if (accessTokenMatch && storedSearchTerm) {
            // Clear the search term from local storage to avoid repeated searches on future visits
            localStorage.removeItem('search_term');
            // Perform the search with the stored search term
            this.search(storedSearchTerm);
        }
    }

    addTrack(track) {
        let tracks = this.state.playlistTracks;
        if (tracks.find(savedTrack => savedTrack.id === track.id)) {
            return;
        } else {
            tracks.push(track);
            this.setState({ playlistTracks: tracks });
        }
    }

    removeTrack(track) {
        let tracks = this.state.playlistTracks;
        tracks = tracks.filter(currentTrack => currentTrack.id !== track.id);
        this.setState ({ playlistTracks: tracks });
    }

    changePlaylistName(name) {
        this.setState({ playlistName: name });
    }
    
    savePlaylist() {
        const trackURIs = this.state.playlistTracks.map(track => track.URI);
        Spotify.savePlaylist(this.state.playlistName, trackURIs)
        .then(() => {
            this.setState({ 
                playlistName: 'New Playlist',
                playlistTracks: []
            });
        });
    }

    search(term) {
        Spotify.search(term).then(searchResults => {
            this.setState({ searchResults: searchResults });
        });
    }
    
    render() {
        return (
            <div className="jamming">
                <h1>Ja<span className="highlight">mm</span>ing</h1>
                <div>
                    <SearchBar
                    onSearch={this.search}
                    setSearchParam={this.setSearchParam}
                    />
                    <div className="App-playlist">
                    <SearchResults
                    addTrack={this.addTrack}
                    searchResults={this.state.searchResults}
                    />
                    <Playlist
                    playlistName={this.state.playlistName}
                    playlistTracks={this.state.playlistTracks}
                    changePlaylistName={this.changePlaylistName}
                    removeTrack={this.removeTrack}
                    savePlaylist={this.savePlaylist}
                    />
                    </div>
                </div>
            </div>
        );
    }
}

export default componentName;
