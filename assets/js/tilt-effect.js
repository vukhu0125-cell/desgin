document.addEventListener('DOMContentLoaded', function() {
  const blurredBox = document.getElementById('blurred-box');
  if (!blurredBox) return;

  // Kiểm tra thiết bị mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  
  // Nếu là mobile, tắt hiệu ứng
  if (isMobile) {
    blurredBox.style.transform = 'none';
    blurredBox.style.transition = 'none';
    console.log('Tilt effect disabled on mobile');
    return;
  }

  const config = {
    sensitivity: 25,
    hoverEasing: 0.15,
    returnEasing: 0.02,
    returnDuration: 2000,
    maxAngle: 8, // Giảm góc nghiêng
    precision: 0.001,
    delayBeforeReturn: 300,
    disableOnScroll: true // Thêm option tắt khi scroll
  };

  let target = { x: 0, y: 0 };
  let current = { x: 0, y: 0 };
  let isHovering = false;
  let animationId = null;
  let returnTimeout = null;
  let isScrolling = false;
  let scrollTimeout = null;

  // Tạo style element để thêm CSS transforms
  const style = document.createElement('style');
  style.textContent = `
    #blurred-box {
      transition: box-shadow 0.3s ease;
      will-change: transform;
      transform-style: preserve-3d;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      pointer-events: auto;
      z-index: 100;
      position: relative;
    }
    
    /* Fix cho mobile */
    @media (max-width: 768px) {
      #blurred-box {
        transform: none !important;
        transition: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  const applyTransform = () => {
    if (!isScrolling) {
      const transform = `perspective(1000px) rotateX(${current.x}deg) rotateY(${current.y}deg) scale(1.02)`;
      blurredBox.style.transform = transform;
      
      // Thêm hiệu ứng shadow theo góc nghiêng
      const shadowX = current.y * 2;
      const shadowY = current.x * 2;
      blurredBox.style.boxShadow = `${shadowX}px ${shadowY}px 20px rgba(0,0,0,0.3)`;
    }
  };

  const updateTilt = (e) => {
    const rect = blurredBox.getBoundingClientRect();
    
    // Tính toán vị trí chuột tương đối
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    
    // Giới hạn góc nghiêng
    target = {
      x: Math.max(-config.maxAngle, Math.min(config.maxAngle, y * config.maxAngle * 0.8)),
      y: Math.max(-config.maxAngle, Math.min(config.maxAngle, -x * config.maxAngle))
    };
  };

  const animate = () => {
    const ease = isHovering ? config.hoverEasing : config.returnEasing;
    
    // Smooth animation
    current.x += (target.x - current.x) * ease;
    current.y += (target.y - current.y) * ease;
    
    // Precision check
    const diff = Math.abs(current.x - target.x) + Math.abs(current.y - target.y);
    
    applyTransform();
    
    if ((isHovering || diff > config.precision) && !isScrolling) {
      animationId = requestAnimationFrame(animate);
    } else {
      animationId = null;
      if (!isHovering && !isScrolling) {
        current.x = current.y = 0;
        applyTransform();
      }
    }
  };

  const startAnimation = () => {
    if (!animationId && !isScrolling) {
      animationId = requestAnimationFrame(animate);
    }
  };

  const stopAnimation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  // Xử lý scroll
  const handleScroll = () => {
    isScrolling = true;
    stopAnimation();
    current.x = current.y = 0;
    applyTransform();
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      target = { x: 0, y: 0 };
      startAnimation();
    }, 150);
  };

  if (config.disableOnScroll) {
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Event listeners
  blurredBox.addEventListener('mouseenter', (e) => {
    if (isScrolling) return;
    isHovering = true;
    clearTimeout(returnTimeout);
    updateTilt(e);
    startAnimation();
  });

  blurredBox.addEventListener('mousemove', (e) => {
    if (isHovering && !isScrolling) {
      updateTilt(e);
    }
  });

  blurredBox.addEventListener('mouseleave', () => {
    if (isScrolling) return;
    isHovering = false;
    target = { x: 0, y: 0 };
    
    clearTimeout(returnTimeout);
    returnTimeout = setTimeout(() => {
      if (!isHovering && !isScrolling) {
        startAnimation();
      }
    }, config.delayBeforeReturn);
  });

  // Touch events cho mobile (disable)
  blurredBox.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Ngăn chặn touch event
  });

  blurredBox.addEventListener('touchmove', (e) => {
    e.preventDefault();
  });

  blurredBox.addEventListener('touchend', (e) => {
    e.preventDefault();
  });

  // Cleanup function
  const cleanup = () => {
    stopAnimation();
    clearTimeout(returnTimeout);
    clearTimeout(scrollTimeout);
    window.removeEventListener('scroll', handleScroll);
  };

  window.addEventListener('beforeunload', cleanup);

  // Khởi tạo
  applyTransform();
  
  // Thêm resize listener để kiểm tra lại mobile/desktop
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newIsMobile = window.innerWidth <= 768;
      if (newIsMobile !== isMobile) {
        window.location.reload(); // Reload nếu chuyển đổi giữa mobile/desktop
      }
    }, 250);
  });
});