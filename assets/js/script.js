document.addEventListener('DOMContentLoaded', function() {
  const videoOverlay = document.createElement('div');
  videoOverlay.id = 'video-overlay';
  document.getElementById('video-background').appendChild(videoOverlay);
  var terminalContainer = document.getElementById('terminal');
  var terminalText = document.getElementById('terminal-text');
  var videoBackground = document.getElementById('myVideo');
  var closeButton = document.getElementById('close-button');

  var terminalTextContent = [
      "User:匿名",
      "IP: Loading...",
      "System: Loading...",
      "Bio Loading",
      "Chạm để bắt đầu",
  ];
  var currentIndex = 0;

  videoBackground.pause();

  function typeWriter() {
      var line = currentIndex === 0 ? getAsciiArt() : terminalTextContent[currentIndex - 1];
      var i = 0;

      function typeChar() {
          if (i < line.length) {
              terminalText.textContent += line.charAt(i);
              i++;
              setTimeout(typeChar, currentIndex === 0 ? 10 : 50);
          } else {
              terminalText.textContent += "\n";
              currentIndex++;
              if (currentIndex < terminalTextContent.length + 1) {
                  typeWriter();
              } else {
                  addEventListeners();
              }
          }
      }

      if (currentIndex === 0) {
          terminalText.style.transform = 'scale(5)';
          terminalText.style.opacity = '0';
          terminalText.style.transition = 'transform 1.5s ease-out, opacity 1.5s ease-out';
          void terminalText.offsetWidth;
          
          terminalText.style.transform = 'scale(1)';
          terminalText.style.opacity = '1';
      }

      typeChar();
  }

  function handleInput() {
      terminalContainer.style.display = 'none';
      document.getElementById('myVideo').play();
      document.getElementById('blurred-box').style.display = 'block';
      document.getElementById('music-controls').style.display = 'flex';
      removeEventListeners();
      document.body.classList.add('video-normal');
      window.MusicPlayer.start()
  }

  function addEventListeners() {
      document.addEventListener('keydown', handleKeyPress);
      terminalContainer.addEventListener('click', handleInput);
  }

  function removeEventListeners() {
      document.removeEventListener('keydown', handleKeyPress);
      terminalContainer.removeEventListener('click', handleInput);
  }

  function handleKeyPress(event) {
      if (event.key === 'Enter') {
          handleInput();
      }
  }

  closeButton.addEventListener('click', function() {
      handleInput();
  });

  fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
          var ipAddress = data.ip;
          terminalTextContent[1] = "IP: " + ipAddress;
          typeWriter();
      })
      .catch(error => {
          console.error('Error fetching IP address:', error);
          terminalTextContent[1] = "IP: Unable to fetch IP address";
          typeWriter();
      });

  var userAgent = navigator.userAgent;
  
  function getOperatingSystem() {
      if (userAgent.match(/Windows/)) {
          return getWindowsVersion();
      } else if (userAgent.match(/Macintosh/)) {
          return getMacOSVersion();
      } else if (userAgent.match(/Linux/)) {
          return "Linux";
      } else if (userAgent.match(/Android/)) {
          return getAndroidVersion();
      } else if (userAgent.match(/iPhone|iPad|iPod/)) {
          return getiOSVersion();
      } else {
          return "Unknown";
      }
  }
  
  function getWindowsVersion() {
      var version = userAgent.match(/Windows NT ([\d.]+)/);
      if (version) {
          version = version[1];
          switch (version) {
              case "5.1":
                  return "Windows XP";
              case "6.0":
                  return "Windows Vista";
              case "6.1":
                  return "Windows 7";
              case "6.2":
                  return "Windows 8";
              case "6.3":
                  return "Windows 8.1";
              case "10.0":
                  return "Windows 10";
              case "10.0":
                  return "Windows 11";
              default:
                  return "Windows";
          }
      } else {
          return "Windows";
      }
  }
  
  function getMacOSVersion() {
      var version = userAgent.match(/Mac OS X ([\d_]+)/);
      if (version) {
          version = version[1].replace(/_/g, '.');
          return "macOS " + version;
      } else {
          return "macOS";
      }
  }
  
  function getAndroidVersion() {
      var version = userAgent.match(/Android ([\d.]+)/);
      if (version) {
          return "Android " + version[1];
      } else {
          return "Android";
      }
  }
  
  function getiOSVersion() {
      var version = userAgent.match(/OS ([\d_]+)/);
      if (version) {
          version = version[1].replace(/_/g, '.');
          return "iOS " + version;
      } else {
          return "iOS";
      }
  }
  
  var operatingSystem = getOperatingSystem();
  terminalTextContent[2] = "System: " + operatingSystem;

  function centerTerminal() {
      var terminalWidth = terminalContainer.offsetWidth;
      var terminalHeight = terminalContainer.offsetHeight;
      var centerX = (window.innerWidth - terminalWidth) / 2;
      var centerY = (window.innerHeight - terminalHeight) / 2;

      terminalContainer.style.position = 'absolute';
      terminalContainer.style.left = centerX + 'px';
      terminalContainer.style.top = centerY + 'px';
  }

  centerTerminal();
  window.addEventListener('resize', centerTerminal);

  terminalText.style.textAlign = 'center';

  function getAsciiArt() {
      return `
    ⡟⠛⠻⠛⠻⣿⣿⡿⠛⠉⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
    ⡇⠐⡀⠂⢁⠟⢁⣠⣶⣿⡄⢹⣿⣿⣿⣿⣿⠿⠿⠛⣉⣉⡄⢹
    ⣿⣦⣄⡕⠁⣴⣿⣿⣿⡿⢋⣀⣤⡤⢀⠄⣤⣶⣾⣿⣿⣿⡇⠀
    ⣿⣿⡟⢠⣾⣿⣿⣿⣿⠁⢆⣾⣿⡁⢎⣾⣿⣿⣿⣿⣿⣿⡇⢠
    ⡿⠟⢠⣿⠟⠻⣿⣿⣿⣿⣾⣿⣿⣶⣾⣿⣿⣿⣿⣿⣿⣿⠃⣸
    ⡆⢻⣿⡿⠖⠀⠈⢻⣿⢻⣿⣿⣿⣷⣟⠿⠟⠛⠙⢿⣿⣿⠀⣿
    ⢁⣾⣿⣇⣤⣴⣾⣿⣿⣮⣭⣬⣭⣾⣧⢄⠀⠒⢶⣿⣿⣿⠧⠘
    ⠀⣿⠛⠡⠂⠀⡀⠈⠙⠟⠉⠉⠀⠀⢍⠺⣷⣦⣾⣿⣿⣿⣦⡉
    ⣧⠘⣈⣤⡀⠁⠄⡈⠄⡀⠂⠌⢐⣀⣀⠱⠘⣟⡿⣿⣿⣶⠉⣴
    ⡟⢰⣿⣿⣿⠀⠚⠄⠠⠐⢀⠂⣿⣿⣿⣿⣶⣬⡺⣹⢲⡞⠆⢹
    ⡇⢸⣿⣿⣟⠀⠀⠂⠁⠀⣂⠀⠹⣿⢿⣿⣿⣿⣿⣷⣭⡀⢴⣿
    ⣷⡌⠻⡿⠋⠄⠀⠀⠀⠐⠀⠃⠀⠙⢷⣿⣿⣿⣿⣾⣿⣿⣦⡙ 
  `;
  }

  document.body.classList.remove('video-normal');
  videoOverlay.style.display = 'block'; 
}); 