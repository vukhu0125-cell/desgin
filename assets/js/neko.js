const NEKO_WIDTH = 32
const NEKO_HEIGHT = 32
const NEKO_HALF_WIDTH = NEKO_WIDTH / 2
const NEKO_HALF_HEIGHT = NEKO_HEIGHT / 2
const NEKO_SPEED = 8  // Tăng speed lên 8 để chạy nhanh hơn
const FRAME_RATE = 100 // Giảm frame rate để cập nhật nhanh hơn
const Z_INDEX = Number.MAX_SAFE_INTEGER
const ALERT_TIME = 3
const IDLE_THRESHOLD = 3
const IDLE_ANIMATION_CHANCE = 1 / 20
const MIN_DISTANCE = 50
const SPRITE_GAP = 1
const BACKGROUND_TARGET_COLOR = [0, 174, 240]
const AXIS_THRESHOLD = 4

class Neko {
  isMouseMoving = false
  mouseMoveTimeoutId = null
  dragAnimationLastTimestamp = null
  currentScratchSprite = null

  constructor({ nekoName, nekoImageUrl, initialPosX, initialPosY }) {
    this.nekoName = nekoName
    this.nekoImageUrl = nekoImageUrl
    this.posX = initialPosX !== undefined ? initialPosX : NEKO_HALF_WIDTH
    this.posY = initialPosY !== undefined ? initialPosY : NEKO_HALF_HEIGHT
    this.initialPosX = initialPosX !== undefined ? initialPosX : this.posX
    this.initialPosY = initialPosY !== undefined ? initialPosY : this.posY
    this.mouseX = 0
    this.mouseY = 0
    this.frameCount = 0
    this.idleTime = 0
    this.idleAnimation = null
    this.idleAnimationFrame = 0
    this.isFollowing = false
    this.isReturningToOrigin = false
    this.nekoElement = null
    this.lastFrameTimestamp = null
    this.animationFrameId = null
    this.isReducedMotion = window.matchMedia(
      `(prefers-reduced-motion: reduce)`
    ).matches
    this.isDragging = false
    this.wasDragged = false
    this.lastMouseX = 0
    this.lastMouseY = 0
    this.currentScratchSprite = null
    
    // Variables cho di chuyển random
    this.targetX = this.posX
    this.targetY = this.posY
    this.moveCounter = 0
    this.idleCounter = 0
    this.isMoving = true
    this.behaviorState = 'moving' // 'moving' hoặc 'idle'
    this.idleAnimationList = [
      "sleeping",
      "scratchSelf",
      "lickPaw",
      "scratchWallW",
      "scratchWallN",
      "scratchWallE",
      "scratchWallS"
    ]
    
    this.spriteSets = {
      idle: [[0, 0]],
      alert: [[7, 0]],
      lickPaw: [[1, 0]],
      scratchSelf: [
        [2, 0],
        [3, 0]
      ],
      scratchWallS: [
        [0, 3],
        [1, 3]
      ],
      scratchWallE: [
        [2, 3],
        [3, 3]
      ],
      scratchWallN: [
        [4, 3],
        [5, 3]
      ],
      scratchWallW: [
        [6, 3],
        [7, 3]
      ],
      tired: [[4, 0]],
      sleeping: [
        [5, 0],
        [6, 0]
      ],
      S: [
        [0, 1],
        [1, 1]
      ],
      SE: [
        [2, 1],
        [3, 1]
      ],
      E: [
        [4, 1],
        [5, 1]
      ],
      NE: [
        [6, 1],
        [7, 1]
      ],
      N: [
        [0, 2],
        [1, 2]
      ],
      NW: [
        [2, 2],
        [3, 2]
      ],
      W: [
        [4, 2],
        [5, 2]
      ],
      SW: [
        [6, 2],
        [7, 2]
      ]
    }
  }

  init() {
    if (this.isReducedMotion) return
    if (document.getElementById(this.nekoName)) return

    this.createNekoElement()
    this.addEventListeners()
    this.setNewRandomTarget()
    this.animationLoop()
  }

  setNewRandomTarget() {
    // Tạo target ngẫu nhiên trong màn hình
    this.targetX = NEKO_HALF_WIDTH + Math.random() * (window.innerWidth - NEKO_WIDTH)
    this.targetY = NEKO_HALF_HEIGHT + Math.random() * (window.innerHeight - NEKO_HEIGHT)
    
    // Đảm bảo target không quá gần vị trí hiện tại
    const distToTarget = Math.hypot(this.targetX - this.posX, this.targetY - this.posY)
    if (distToTarget < 100) {
      // Nếu quá gần, đặt target xa hơn
      this.targetX = Math.min(window.innerWidth - NEKO_HALF_WIDTH, 
        Math.max(NEKO_HALF_WIDTH, this.posX + (Math.random() * 200 - 100)))
      this.targetY = Math.min(window.innerHeight - NEKO_HALF_HEIGHT, 
        Math.max(NEKO_HALF_HEIGHT, this.posY + (Math.random() * 200 - 100)))
    }
  }

  static async makeTransparent(imageUrl, targetColor) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageUrl;

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas not supported");

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (r === targetColor[0] && g === targetColor[1] && b === targetColor[2]) {
              data[i + 3] = 0;
            }
          }

          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (error) {
          reject(error);
        }
      };
    });
  }

  async createNekoElement() {
    this.nekoElement = document.createElement("div")

    this.nekoElement.id = this.nekoName
    this.nekoElement.ariaHidden = "true"
    this.nekoElement.style.width = `${NEKO_WIDTH}px`
    this.nekoElement.style.height = `${NEKO_HEIGHT}px`
    this.nekoElement.style.position = "fixed"
    this.nekoElement.style.pointerEvents = "auto"
    this.nekoElement.style.imageRendering = "pixelated"
    this.nekoElement.style.left = `${this.posX - NEKO_HALF_WIDTH}px`
    this.nekoElement.style.top = `${this.posY - NEKO_HALF_HEIGHT}px`
    this.nekoElement.style.zIndex = Z_INDEX.toString()
    this.nekoElement.style.backgroundImage = `url("${this.nekoImageUrl}")`
    this.nekoElement.style.cursor = "grab"

    try {
      const transparentImageUrl = await Neko.makeTransparent(
        this.nekoImageUrl,
        BACKGROUND_TARGET_COLOR
      )

      if (this.nekoElement) {
        this.nekoElement.style.backgroundImage = `url("${transparentImageUrl}")`
      }

      if (this.nekoElement) {
        document.body.appendChild(this.nekoElement)
      } else {
        throw new Error("Neko element is null, cannot append to document.")
      }
    } catch (err) {
      console.error("Failed to process the image:", err)
    }

    const idleSprite = this.spriteSets["idle"]
      ? this.spriteSets["idle"][0]
      : null
    if (idleSprite && this.nekoElement) {
      const posX = idleSprite[0] * (NEKO_WIDTH + SPRITE_GAP)
      const posY = idleSprite[1] * (NEKO_HEIGHT + SPRITE_GAP)
      this.nekoElement.style.backgroundPosition = `-${posX}px -${posY}px`
    }
  }

  updateDraggingSprite(dx, dy, timeStamp) {
    if (!this.isMouseMoving) {
      return
    }

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    let spriteName

    if (absDx - absDy > AXIS_THRESHOLD) {
      if (dx > 0) {
        spriteName = "scratchWallW"
      } else {
        spriteName = "scratchWallE"
      }
    } else if (absDy - absDx > AXIS_THRESHOLD) {
      if (dy > 0) {
        spriteName = "scratchWallN"
      } else {
        spriteName = "scratchWallS"
      }
    } else {
      spriteName = this.currentScratchSprite || "idle"
    }

    this.currentScratchSprite = spriteName

    if (this.dragAnimationLastTimestamp === null) {
      this.dragAnimationLastTimestamp = timeStamp
    }

    const timeSinceLastFrame = timeStamp - this.dragAnimationLastTimestamp

    const DRAG_ANIMATION_FRAME_INTERVAL = 100

    if (timeSinceLastFrame >= DRAG_ANIMATION_FRAME_INTERVAL) {
      this.idleAnimationFrame += 1
      this.dragAnimationLastTimestamp = timeStamp
    }

    const frameIndex =
      (this.spriteSets[spriteName]?.length ?? 0) > 0
        ? this.idleAnimationFrame % (this.spriteSets[spriteName]?.length ?? 1)
        : 0
    this.setSprite(spriteName, frameIndex)
  }

  handleMouseMove = event => {
    if (this.isDragging) {
      const dx = event.clientX - this.lastMouseX
      const dy = event.clientY - this.lastMouseY
      const movementDistance = Math.hypot(dx, dy)

      const MOVEMENT_THRESHOLD = 2

      if (!this.wasDragged) {
        if (movementDistance > MOVEMENT_THRESHOLD) {
          this.wasDragged = true
        } else {
          this.setSprite("alert", 0)
          this.render()

          this.lastMouseX = event.clientX
          this.lastMouseY = event.clientY
          return
        }
      }

      this.isMouseMoving = true

      if (this.mouseMoveTimeoutId !== null) {
        clearTimeout(this.mouseMoveTimeoutId)
      }

      this.mouseMoveTimeoutId = window.setTimeout(() => {
        this.isMouseMoving = false

        this.setSprite("alert", 0)
        this.render()
      }, 100)

      this.posX = event.clientX
      this.posY = event.clientY

      this.updateDraggingSprite(dx, dy, event.timeStamp)

      this.lastMouseX = event.clientX
      this.lastMouseY = event.clientY

      this.render()
    } else {
      this.mouseX = event.clientX
      this.mouseY = event.clientY
    }
  }

  handleMouseDown = event => {
    this.isDragging = true
    this.wasDragged = false
    this.lastMouseX = event.clientX
    this.lastMouseY = event.clientY
    this.idleAnimationFrame = 0
    this.dragAnimationLastTimestamp = null
    this.isMouseMoving = false

    if (this.nekoElement) {
      this.nekoElement.style.cursor = "grabbing"
    }

    this.setSprite("alert", 0)
    this.render()
    event.preventDefault()
  }

  handleMouseUp = () => {
    this.isDragging = false
    this.idleAnimationFrame = 0
    this.dragAnimationLastTimestamp = null
    this.isMouseMoving = false
    this.currentScratchSprite = null

    if (this.nekoElement) {
      this.nekoElement.style.cursor = "grab"
    }

    if (this.mouseMoveTimeoutId !== null) {
      clearTimeout(this.mouseMoveTimeoutId)
      this.mouseMoveTimeoutId = null
    }
  }

  addEventListeners() {
    if (!this.nekoElement) return

    this.nekoElement.addEventListener("click", () => {
      if (!this.wasDragged) {
        this.isFollowing = !this.isFollowing
        if (this.isFollowing) {
          this.isReturningToOrigin = false
        } else {
          this.isReturningToOrigin = true
        }
      }
    })

    this.nekoElement.addEventListener("mousedown", this.handleMouseDown)
    document.addEventListener("mouseup", this.handleMouseUp)
    document.addEventListener("mousemove", this.handleMouseMove)
  }

  animationLoop() {
    const loop = timestamp => {
      if (this.lastFrameTimestamp === null) {
        this.lastFrameTimestamp = timestamp
      }

      const delta = timestamp - this.lastFrameTimestamp

      if (this.isDragging || delta > FRAME_RATE) {
        this.lastFrameTimestamp = timestamp
        this.updateState()

        if (!this.isDragging) {
          this.render()
        }
      }

      this.animationFrameId = window.requestAnimationFrame(loop)
    }
    this.animationFrameId = window.requestAnimationFrame(loop)
  }

  updateState() {
    if (this.isDragging) return

    this.frameCount++
    
    if (this.behaviorState === 'moving') {
      this.moveCounter++
      this.moveRandomly()
      
      // Sau 5s (50 frame với FRAME_RATE=100ms) thì chuyển sang idle
      if (this.moveCounter > 50) {
        this.behaviorState = 'idle'
        this.moveCounter = 0
        this.idleCounter = 0
        // Chọn random cử chỉ
        this.idleAnimation = this.idleAnimationList[
          Math.floor(Math.random() * this.idleAnimationList.length)
        ]
      }
    } else if (this.behaviorState === 'idle') {
      this.idleCounter++
      this.performIdleAnimation()
      
      // Sau khi làm cử chỉ xong (khoảng 2s)
      if (this.idleCounter > 20) {
        this.behaviorState = 'moving'
        this.idleAnimation = null
        this.setNewRandomTarget()
      }
    }
  }

  moveRandomly() {
    const diffX = this.targetX - this.posX
    const diffY = this.targetY - this.posY
    const distance = Math.hypot(diffX, diffY)

    // Nếu đến gần target thì chọn target mới
    if (distance < NEKO_SPEED) {
      this.setNewRandomTarget()
      return
    }

    // Xác định hướng di chuyển
    let direction = ""
    const angle = Math.atan2(diffY, diffX)
    const deg = angle * 180 / Math.PI
    
    if (deg > -67.5 && deg <= -22.5) direction = "NE"
    else if (deg > -112.5 && deg <= -67.5) direction = "N"
    else if (deg > -157.5 && deg <= -112.5) direction = "NW"
    else if (deg > 112.5 && deg <= 157.5) direction = "SW"
    else if (deg > 67.5 && deg <= 112.5) direction = "S"
    else if (deg > 22.5 && deg <= 67.5) direction = "SE"
    else if (deg > -22.5 && deg <= 22.5) direction = "E"
    else direction = "W"

    this.setSprite(direction, this.frameCount)

    // Di chuyển
    const moveX = (diffX / distance) * NEKO_SPEED
    const moveY = (diffY / distance) * NEKO_SPEED
    
    this.posX += moveX
    this.posY += moveY

    // Giới hạn trong màn hình
    this.posX = Math.max(NEKO_HALF_WIDTH, Math.min(this.posX, window.innerWidth - NEKO_HALF_WIDTH))
    this.posY = Math.max(NEKO_HALF_HEIGHT, Math.min(this.posY, window.innerHeight - NEKO_HALF_HEIGHT))
  }

  performIdleAnimation() {
    if (!this.idleAnimation) return

    switch (this.idleAnimation) {
      case "sleeping":
        if (this.idleCounter < 5) {
          this.setSprite("tired", 0)
        } else if (this.idleCounter < 10) {
          this.setSprite("idle", 0)
        } else {
          this.setSprite("sleeping", Math.floor(this.idleCounter / 4) % 2)
        }
        break
      case "lickPaw":
        this.setSprite("lickPaw", 0)
        break
      case "scratchSelf":
        this.setSprite("scratchSelf", this.idleCounter % 2)
        break
      case "scratchWallN":
        this.setSprite("scratchWallN", this.idleCounter % 2)
        break
      case "scratchWallS":
        this.setSprite("scratchWallS", this.idleCounter % 2)
        break
      case "scratchWallE":
        this.setSprite("scratchWallE", this.idleCounter % 2)
        break
      case "scratchWallW":
        this.setSprite("scratchWallW", this.idleCounter % 2)
        break
    }
  }

  render() {
    if (!this.nekoElement) return
    this.nekoElement.style.left = `${this.posX - NEKO_HALF_WIDTH}px`
    this.nekoElement.style.top = `${this.posY - NEKO_HALF_HEIGHT}px`
  }

  setSprite(name, frame) {
    if (!this.nekoElement) return
    const spriteSet = this.spriteSets[name]
    if (!spriteSet) return
    const sprite = spriteSet[frame % spriteSet.length]
    if (sprite) {
      const posX = sprite[0] * (NEKO_WIDTH + SPRITE_GAP)
      const posY = sprite[1] * (NEKO_HEIGHT + SPRITE_GAP)
      this.nekoElement.style.backgroundPosition = `-${posX}px -${posY}px`
    }
  }

  destroy() {
    if (this.nekoElement) {
      this.nekoElement.removeEventListener("mousedown", this.handleMouseDown)
      this.nekoElement.remove()
      this.nekoElement = null
    }
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId)
    }
    document.removeEventListener("mousemove", this.handleMouseMove)
    document.removeEventListener("mouseup", this.handleMouseUp)
  }
}

window.Neko = Neko;