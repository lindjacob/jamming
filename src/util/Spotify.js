const clientID = 'afd25d22977d476fa61267ff8c873b34';
const redirectURI = import.meta.env.VITE_APP_URL;
let accessToken;

const Spotify = {
    getAccessToken(term) {
        if (accessToken) {
            return accessToken;
        }
    
        // Try to retrieve the access token from local storage
        const storedToken = localStorage.getItem('spotify_access_token');
        const storedExpirationTime = localStorage.getItem('spotify_token_expires_at');
    
        if (storedToken && storedExpirationTime) {
            const expiresIn = new Date(storedExpirationTime) - new Date();
            if (expiresIn > 0) {
                accessToken = storedToken;
                // Set a timeout to clear the token from local storage when it expires
                window.setTimeout(() => {
                    accessToken = '';
                    localStorage.removeItem('spotify_access_token');
                    localStorage.removeItem('spotify_token_expires_at');
                }, expiresIn);
                return accessToken;
            }
        }
    
        let accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        let expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            const expirationTime = new Date(new Date().getTime() + expiresIn * 1000);
    
            // Store the access token and expiration time in local storage
            localStorage.setItem('spotify_access_token', accessToken);
            localStorage.setItem('spotify_token_expires_at', expirationTime.toISOString());
    
            window.setTimeout(() => {
                accessToken = '';
                localStorage.removeItem('spotify_access_token');
                localStorage.removeItem('spotify_token_expires_at');
            }, expiresIn * 1000);
    
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            localStorage.setItem('search_term', term);
            const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
            window.location = accessURL;
        }
    },

    search(term) {
        const accessToken = Spotify.getAccessToken(term);
        return fetch(`https://api.spotify.com/v1/search?q=${term}&type=track`, {
            headers: {
                Authorization: 'Bearer ' + accessToken
            },
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if (jsonResponse.tracks) {
                return jsonResponse.tracks.items.map(track => ({
                        id: track.id,
                        name: track.name,
                        artist: track.artists[0].name,
                        album: track.album.name,
                        URI: track.uri
                }));
            } else {
                return [];
            }
        });
    },

    savePlaylist(playlistName, trackURIs) {
        if (playlistName && trackURIs) {
            const accessToken = Spotify.getAccessToken();
            const headers = { Authorization: 'Bearer ' + accessToken }
            let userID;

            return fetch('https://api.spotify.com/v1/me', {headers: headers}
            ).then(response => {
                return response.json();
            }).then(jsonResponse => {
                userID = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ name: playlistName })
                }).then(response => {
                    return response.json();
                }).then(jsonResponse => {
                    const playlistID = jsonResponse.id;
                    fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
                        headers: headers,
                        method: 'POST',
                        body: JSON.stringify({ uris: trackURIs })
                    })
                }) 
            })
        } else {
            return;
        };
    },
};

export default Spotify;