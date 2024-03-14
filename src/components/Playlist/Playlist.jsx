import React, { Component } from 'react';
import TrackList from '../TrackList/TrackList';
import './Playlist.css'

class Playlist extends Component {
    constructor(props) {
        super(props);

        this.handleNameChange = this.handleNameChange.bind(this);
    }

    handleNameChange(event) {
        this.props.changePlaylistName(event.target.value);
    }

    render() {
        return (
            <div className="Playlist">
                <input defaultValue="New Playlist" onChange={this.handleNameChange} />
                <TrackList
                    tracks={this.props.playlistTracks}
                    onRemove={this.props.removeTrack}
                    isRemoval={true}
                />
                <button className="Playlist-save" onClick={this.props.savePlaylist}>SAVE TO SPOTIFY</button>
            </div>
        );
    }
}

export default Playlist;