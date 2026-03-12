const songs = [
    "music.mp3",
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
    loadSong(currentSongIndex);
    audio.addEventListener('ended', nextSong);
}

// QUAN TRỌNG: Sửa hàm này
function startMusicAfterTerminal() {
    isPlaying = true;
    
    // Thử phát ngay lập tức - trên mobile nó sẽ hoạt động 
    // vì được gọi từ user gesture (click)
    audio.play()
        .then(() => {
            console.log("Music started successfully");
        })
        .catch(error => {
            console.error("Music playback error:", error);
            // Nếu vẫn lỗi, thử lại sau 100ms
            setTimeout(() => {
                audio.play().catch(e => console.log("Retry failed:", e));
            }, 100);
        });
}

function loadSong(index) {
    audio.src = `./assets/music/${shuffledSongs[index]}`;
    audio.load(); // Thêm load() để chuẩn bị
}

function nextSong() {
    if (shuffledSongs.length > 1) {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * shuffledSongs.length);
        } while (newIndex === currentSongIndex && shuffledSongs.length > 1);
        currentSongIndex = newIndex;
    } else {
        audio.currentTime = 0;
    }
    loadSong(currentSongIndex);
    
    if (isPlaying) {
        audio.play().catch(e => console.log("Auto-play next failed:", e));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    shuffledSongs = shuffleArray([...songs]);
    initMusicPlayer();
    
    // Preload nhạc để sẵn sàng
    audio.load();
});

window.MusicPlayer = {
    start: startMusicAfterTerminal,
    getAudio: () => audio
};
