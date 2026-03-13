const songs = [
    "music.mp3",
    "chac em da quen roi.mp3",
    "cam vi tat ca.mp3",
    "yen vo hiet.mp3"
];

let currentSongIndex = 0;
let isPlaying = false;
const audio = new Audio();

audio.volume = 1.0;

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

let shuffledSongs = shuffleArray(songs);

function initMusicPlayer() {
    // Random bài hát đầu tiên khi khởi tạo
    currentSongIndex = Math.floor(Math.random() * shuffledSongs.length);
    loadSong(currentSongIndex);
    audio.addEventListener('ended', nextSong);
}

function startMusicAfterTerminal() {
    isPlaying = true;
    audio.play()
        .catch(error => {
            console.error("Music playback error:", error);
            setTimeout(() => {
                audio.play().catch(e => console.error("Retry error:", e));
            }, 1000);
        });
}

function loadSong(index) {
    audio.src = `./assets/music/${shuffledSongs[index]}`;
    
    if (isPlaying) {
        audio.play().catch(error => console.error("Play error:", error));
    }
}

function nextSong() {
    // Random bài tiếp theo
    currentSongIndex = Math.floor(Math.random() * shuffledSongs.length);
    loadSong(currentSongIndex);
}

document.addEventListener('DOMContentLoaded', () => {
    shuffledSongs = shuffleArray([...songs]);
    initMusicPlayer(); // Chỉ khởi tạo và random bài hát, không tự động phát
});

window.MusicPlayer = {
    start: startMusicAfterTerminal, // Phải gọi hàm này mới phát nhạc
    getAudio: () => audio
};