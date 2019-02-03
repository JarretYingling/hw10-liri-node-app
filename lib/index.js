//node npm dotenv
require('dotenv').config();
//node npm node-spotify-api
const Spotify = require('node-spotify-api');
//node npm axios...
//...in leiu of node npm bandsintown
//...in lieu of mode npm omdb
const axios = require('axios');
//node npm moment
const moment = require('moment');

const keyword = process.argv[2];
const searchTerms = process.argv.splice(3).join(" ");

// create instance from Spotify constructor
const spotify = new Spotify({
    id: process.env.SPOTIFY_API_ID,
    secret: process.env.SPOTIFY_API_SECRET
});

//apiSpotify songs
function apiSpotify(songOrArtist) {
    spotify.search({
        type: 'track',
        query: songOrArtist,
        limit: 1
    }, function (errorSpotify, dataSpotify) {
        if (errorSpotify) {
            return console.log(`Spotify api error: ${errorSpotify}`);
        }
        if (dataSpotify.tracks.items.length > 0) {
            dataSpotify.tracks.items.forEach(function (element) {
                console.log(`\n`,
                    `Artist: ${element.artists[0].name}\n`,
                    `Song: ${element.name}\n`,
                    `Link: ${element.external_urls.spotify}\n`,
                    `Album: ${element.album.name}`
                );
            });
        } else {
            console.log('Song not found');
            console.log('Searching instead for The Sign by Ace of Base');
            apiSpotify('the sign ace of base');
        }
    });
}

//apiBandsInTown concerts
function apiBandsInTown(artist) {
    const url = `https://rest.bandsintown.com/artists/${artist}/events?`;
    axios.get(url, {
        params: {
            app_id: process.env.BANDSINTOWN_API_ID,
            date: "upcoming"
        }
    }).then(function (dataBandsInTown) {
        if (typeof dataBandsInTown.data !== 'string') {
            for (i = 0; i < 5 && i < dataBandsInTown.data.length; i++) {
                console.log(`\n`,
                    `Venue: ${dataBandsInTown.data[i].venue.name}\n`,
                    `${dataBandsInTown.data[i].venue.city}, ${dataBandsInTown.data[i].venue.region} ${dataBandsInTown.data[i].venue.country}\n`,
                    `${moment(dataBandsInTown.data[i].datetime,'YYYY-MM-DDTHH:mm:ss').format('MM/DD/YYYY')}`
                );
            }
        } else {
            console.log('\nArtist not found or no concerts scheduled')
        }
    }).catch(function (errorBandsInTown) {
        console.log(`BandsInTown api error: ${errorBandsInTown}`);
    });
}

//apiOMDB movies
function apiOMDB(movie) {
    const url = `http://www.omdbapi.com/?`;
    axios.get(url, {
        params: {
            apikey: process.env.OMDB_API_KEY,
            t: movie,
            type: 'movie',
            plot: 'full'
        }
    }).then(function (dataOMDB) {
        if (dataOMDB.data.Response == 'True') {
            console.log(`\nTitle: ${dataOMDB.data.Title}\n`);
            console.log(`Year: ${dataOMDB.data.Year}`);
            console.log(`IMDB Rating: ${dataOMDB.data.imdbRating}`);
            if (dataOMDB.data.Ratings.length > 1) {
                console.log(`Rotten Tomatoes Rating: ${dataOMDB.data.Ratings[1].Value}`);
            } else {
                console.log(`Rotten Tomatoes Rating: N/A`);
            }
            console.log(`Country Produced: ${dataOMDB.data.Country}`);
            console.log(`Languages: ${dataOMDB.data.Language}\n`);
            console.log(`Plot: ${dataOMDB.data.Plot}\n`);
            console.log(`Actors: ${dataOMDB.data.Actors}`);
        } else {
            console.log('Movie not found');
            console.log('Searching instead for Mr. Nobody');
            apiOMDB('Mr. Nobody');
        }
    }).catch(function (errorOMDB) {
        console.log(`OMDB api error: ${errorOMDB}`);
    });
}

switch (keyword) {
    case 'spotify-this-song':
        apiSpotify(searchTerms);
        break;
    case 'concert-this':
        apiBandsInTown(searchTerms);
        break;
    case 'movie-this':
        apiOMDB(searchTerms);
        break;
    case 'do-what-it-says':
        // ???
        break;
    default:
        console.log(`
            Error: keyword "${keyword}" not recognized
            Try one of the following node commands (without the brackets)\n
            node index.js spotify-this-song [name of song] or [name of artist]
            node index.js concert-this [name of artist]
            node index.js movie-this [name of movie]
            node index.js do-what-it-says [???]
        `);
};