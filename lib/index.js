"use strict";

require("dotenv").config();
const Spotify = require("node-spotify-api");
const axios = require("axios");
const moment = require("moment");
const inquirer = require("inquirer");
const fs = require("fs");

const spotify = new Spotify({
  id: process.env.SPOTIFY_API_ID,
  secret: process.env.SPOTIFY_API_SECRET
});

function reset() {
  console.log();
  searchType = "";
  searchCriteria = "";
  question = getQuestion(0);
  getSearchType();
}

//apiSpotify songs
function apiSpotify(songOrArtist) {
  return spotify
    .search({
      type: "track",
      query: songOrArtist,
      limit: 1
    })
    .then(function(dataSpotify) {
      if (dataSpotify.tracks.items.length > 0) {
        dataSpotify.tracks.items.forEach(function(element) {
          console.log(
            `\n`,
            `Artist: ${element.artists[0].name}\n`,
            `Song: ${element.name}\n`,
            `Link: ${element.external_urls.spotify}\n`,
            `Album: ${element.album.name}`
          );
        });
      } else {
        console.log("Song not found");
        console.log("Searching instead for The Sign by Ace of Base");
        //apiSpotify('the sign ace of base');
      }
    })
    .catch(function(errSpotify) {
      console.log("Spotify api error:", errSpotify);
    });
}

//apiBandsInTown concerts
function apiBandsInTown(artist) {
  const url = `https://rest.bandsintown.com/artists/${artist}/events?`;
  return axios
    .get(url, {
      params: {
        app_id: process.env.BANDSINTOWN_API_ID,
        date: "upcoming"
      }
    })
    .then(function(dataBandsInTown) {
      if (typeof dataBandsInTown.data !== "string") {
        for (let i = 0; i < 5 && i < dataBandsInTown.data.length; i++) {
          console.log(
            `\n`,
            `Venue: ${dataBandsInTown.data[i].venue.name}\n`,
            `${dataBandsInTown.data[i].venue.city}, ${
              dataBandsInTown.data[i].venue.region
            } ${dataBandsInTown.data[i].venue.country}\n`,
            `${moment(
              dataBandsInTown.data[i].datetime,
              "YYYY-MM-DDTHH:mm:ss"
            ).format("MM/DD/YYYY")}`
          );
        }
      } else {
        console.log("\nArtist not found or no concerts scheduled");
      }
    })
    .catch(function(errorBandsInTown) {
      console.log("BandsInTown api error:", errorBandsInTown);
    });
}

//apiOMDB movies
function apiOMDB(movie) {
  const url = `http://www.omdbapi.com/?`;
  return axios
    .get(url, {
      params: {
        apikey: process.env.OMDB_API_KEY,
        t: movie,
        type: "movie",
        plot: "full"
      }
    })
    .then(function(dataOMDB) {
      if (dataOMDB.data.Response == "True") {
        console.log(`\nTitle: ${dataOMDB.data.Title}\n`);
        console.log(`Year: ${dataOMDB.data.Year}`);
        console.log(`IMDB Rating: ${dataOMDB.data.imdbRating}`);
        if (dataOMDB.data.Ratings.length > 1) {
          console.log(
            `Rotten Tomatoes Rating: ${dataOMDB.data.Ratings[1].Value}`
          );
        } else {
          console.log(`Rotten Tomatoes Rating: N/A`);
        }
        console.log(`Country Produced: ${dataOMDB.data.Country}`);
        console.log(`Languages: ${dataOMDB.data.Language}\n`);
        console.log(`Plot: ${dataOMDB.data.Plot}\n`);
        console.log(`Actors: ${dataOMDB.data.Actors}`);
      } else {
        console.log("Movie not found");
        console.log("Searching instead for Mr. Nobody");
        apiOMDB("Mr. Nobody");
      }
    })
    .catch(function(errorOMDB) {
      console.log("OMDB api error:", errorOMDB);
    });
}

function getSearchResults() {
  switch (searchType) {
    case "song":
      apiSpotify(searchCriteria)
        .then(function() {
          reset();
        })
        .catch(function(err) {
          console.log(err);
        });
      break;
    case "concert":
      apiBandsInTown(searchCriteria)
        .then(function() {
          reset();
        })
        .catch(function(err) {
          console.log(err);
        });
      break;
    case "movie":
      apiOMDB(searchCriteria)
        .then(function() {
          reset();
        })
        .catch(function(err) {
          console.log(err);
        });
      break;
    default:
      apiSpotify(searchCriteria)
        .then(function() {
          reset();
        })
        .catch(function(err) {
          console.log(err);
        });
  }
}

function getSearchCriteria() {
  if (searchType === "you tell me") {
    fs.readFile("./random.txt", "utf8", function(err, data) {
      if (err) {
        throw err;
      } else {
        let fromFile = data.split(",", 2);
        searchType = fromFile[0];
        searchCriteria = fromFile[1];
        getSearchResults();
      }
    });
  } else {
    question = getQuestion(1);
    inquirer
      .prompt(question)
      .then(function(answer) {
        searchCriteria = answer.searchCriteria;
        getSearchResults();
      })
      .catch(function(errInquirer) {
        console.log("Inquirer error", errInquirer);
      });
  }
}

function getQuestion(i) {
  if (i == 0) {
    return [
      {
        type: "rawlist",
        name: "searchType",
        message: "Which would you like to search for?",
        choices: ["song", "concert", "movie", "you tell me"]
      }
    ];
  } else if (i == 1) {
    return [
      {
        type: "input",
        name: "searchCriteria",
        message: `What ${searchType} would you like to search for?`
      }
    ];
  }
}

function getSearchType() {
  inquirer
    .prompt(question)
    .then(function(answer) {
      searchType = answer.searchType;
      getSearchCriteria();
    })
    .catch(function(errInquirer) {
      console.log("Inquirer error:", errInquirer);
    });
}

let searchType = "";
let searchCriteria = "";
let question = getQuestion(0);
getSearchType();
