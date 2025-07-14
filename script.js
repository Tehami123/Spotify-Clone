console.log("lets write jaavscript");
let currentSong = new Audio();
let songs;
let currfolder;
function formatTime(seconds) {
  // Ensure input is a number and not negative
  seconds = Math.max(0, parseInt(seconds, 10) || 0);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  // Pad minutes and seconds with leading zeros if needed
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(secs).padStart(2, "0");

  return `${paddedMinutes}:${paddedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  


  // show all the songs in the playlists

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";

  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li><img class="invert" src="music.svg" alt="">
  <div class="info">
    <div class="songname"> ${song.replaceAll("%20", " ")}</div>
    <div class="songartist">Eminem</div>
  </div>
  <div class="playnow">
    <span>Play Now</span>
    <img class="invert" src="playbar.svg" alt="">
  </div>
    </li>`;
  }

  // attach an event listener to each song

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      //console.log(e.querySelector(".info").firstElementChild.innerHTML)
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track)
  currentSong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }

  // currentSong.play()

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};


async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-2)[0];
      // Get the meta data of the folders
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      cardcontainer.innerHTML =
        cardcontainer.innerHTML +
        ` <div data-folder="${folder}" class="card">
                <div class="play">
  <svg xmlns="http://www.w3.org/2000/svg" 
       viewBox="0 0 24 24" 
       width="24" 
       height="24" 
       fill="none" 
       style="color: black;">
    <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" fill="#000" 
          stroke="currentColor" 
          stroke-width="1.5" 
          stroke-linejoin="round" />
  </svg>
</div>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`;
    }
  }
  //Load te playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0])
    });
  });
}

async function main() {
  //get the list of ALL THE SONGS
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  // display all the albums on the page
  displayAlbums();

  // attach an eventlistener to play, next and previous song

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "playbar.svg";
    }
  });
  // listen for time update  event so basically it updates the time if you use this function you can check on console.log
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime,currentSong.duration)
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )}/${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
  //  add an event listener to the seekbar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // add an event listener for the menu to pop out from the left when the menu/hamburger icon is clicked

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });

  // add an event listener for the menu to close from the left when the close icon is clicked
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add an event listener to previous and next svg
  previous.addEventListener("click", () => {
    // console.log("Previous clicked")
    // thiis basically find the index of the song
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    currentSong.pause();
    // console.log("Next clicked")
    // thiis basically find the index of the song
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // displays the Loginpage and singup page on the screen
  document.querySelector(".loginbtn").addEventListener("click", () => {
    document.querySelector(".login-container").style.display = "block";
  });
  document.querySelector(".loginbtn").addEventListener("dblclick", () => {
    document.querySelector(".login-container").style.display = "none";
  });
  document.querySelector(".signupbtn").addEventListener("click", () => {
    document.querySelector(".signup-container").style.display = "block";
  });
  document.querySelector(".signupbtn").addEventListener("dblclick", () => {
    document.querySelector(".signup-container").style.display = "none";
  });
}

main();
