"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Pause, Play, RotateCcw, Users, UserRound } from "lucide-react";

import styles from "./picky-pong.module.css";

type GameMode = 1 | 2;
type GameStatus = "idle" | "running" | "paused" | "point";

type Game = {
  ballX: number;
  ballY: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  leftY: number;
  rightY: number;
  topX: number;
  bottomX: number;
};

const paddleHeight = 0.23;
const paddleWidth = 0.022;
const verticalPaddleLength = 0.28;
const verticalPaddleThickness = 0.018;
const verticalTopY = 0.085;
const verticalBottomY = 1 - verticalTopY - verticalPaddleThickness;
const ballRadius = 0.018;
const leftX = 0.045;
const rightX = 1 - leftX - paddleWidth;
const initialBallSpeed = 0.35;
const speedIncreasePerHit = 0.0035;
const speedIncreasePerSecond = 0.0045;
const maximumBallSpeed = 0.62;

function freshGame(vertical = false, direction = Math.random() > 0.5 ? 1 : -1): Game {
  const secondarySpeed = (Math.random() * 0.13 + 0.07) * (Math.random() > 0.5 ? 1 : -1);
  const primarySpeed = Math.sqrt(initialBallSpeed ** 2 - secondarySpeed ** 2) * direction;
  return {
    ballX: 0.5,
    ballY: 0.5,
    velocityX: vertical ? secondarySpeed : primarySpeed,
    velocityY: vertical ? primarySpeed : secondarySpeed,
    speed: initialBallSpeed,
    leftY: 0.5 - paddleHeight / 2,
    rightY: 0.5 - paddleHeight / 2,
    topX: 0.5 - verticalPaddleLength / 2,
    bottomX: 0.5 - verticalPaddleLength / 2,
  };
}

function clampPaddle(value: number, length = paddleHeight) {
  return Math.max(0.025, Math.min(0.975 - length, value));
}

export function PickyPong() {
  const consoleRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game>(freshGame());
  const modeRef = useRef<GameMode>(1);
  const statusRef = useRef<GameStatus>("idle");
  const verticalRef = useRef(false);
  const keysRef = useRef(new Set<string>());
  const pointTimerRef = useRef<number | null>(null);
  const [mode, setMode] = useState<GameMode>(1);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [online, setOnline] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [vertical, setVertical] = useState(false);

  const updateStatus = useCallback((next: GameStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const resetBall = useCallback((direction?: number) => {
    const previous = gameRef.current;
    const next = freshGame(verticalRef.current, direction);
    next.leftY = previous.leftY;
    next.rightY = previous.rightY;
    next.topX = previous.topX;
    next.bottomX = previous.bottomX;
    gameRef.current = next;
  }, []);

  const start = useCallback((nextMode: GameMode) => {
    if (pointTimerRef.current) window.clearTimeout(pointTimerRef.current);
    modeRef.current = nextMode;
    setMode(nextMode);
    setScore([0, 0]);
    gameRef.current = freshGame(verticalRef.current);
    updateStatus("running");
    window.requestAnimationFrame(() => canvasRef.current?.focus());
  }, [updateStatus]);

  const replay = useCallback(() => {
    if (pointTimerRef.current) window.clearTimeout(pointTimerRef.current);
    setScore([0, 0]);
    gameRef.current = freshGame(verticalRef.current);
    updateStatus("running");
  }, [updateStatus]);

  const closeExpanded = useCallback(async () => {
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch { /* The fixed fallback still closes. */ }
    }
    setExpanded(false);
  }, []);

  const toggleExpanded = useCallback(async () => {
    if (expanded) {
      await closeExpanded();
      return;
    }
    setExpanded(true);
    try { await consoleRef.current?.requestFullscreen?.(); } catch { /* Some mobile browsers use the fixed fallback. */ }
  }, [closeExpanded, expanded]);

  useEffect(() => {
    const setConnection = () => setOnline(navigator.onLine);
    setConnection();
    window.addEventListener("online", setConnection);
    window.addEventListener("offline", setConnection);
    return () => {
      window.removeEventListener("online", setConnection);
      window.removeEventListener("offline", setConnection);
    };
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setExpanded(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.fullscreenElement) void closeExpanded();
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onEscape);
    };
  }, [closeExpanded, expanded]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let last = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nextVertical = rect.height > rect.width;
      if (nextVertical !== verticalRef.current) {
        verticalRef.current = nextVertical;
        setVertical(nextVertical);
        const previous = gameRef.current;
        const next = freshGame(nextVertical);
        next.leftY = previous.leftY;
        next.rightY = previous.rightY;
        next.topX = previous.topX;
        next.bottomX = previous.bottomX;
        gameRef.current = next;
      }
      const density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * density));
      canvas.height = Math.max(1, Math.round(rect.height * density));
      context.setTransform(density, 0, 0, density, 0, 0);
      context.imageSmoothingEnabled = false;
    };

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const game = gameRef.current;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#FDE3AD";
      context.fillRect(0, 0, width, height);

      context.fillStyle = "#741314";
      const paddleRadius = 3;
      const drawPaddle = (x: number, y: number, paddleWidthPx: number, paddleHeightPx: number) => {
        context.beginPath();
        context.roundRect(x * width, y * height, paddleWidthPx * width, paddleHeightPx * height, paddleRadius);
        context.fill();
      };
      if (verticalRef.current) {
        const dashWidth = Math.max(5, width * 0.035);
        for (let x = dashWidth; x < width; x += dashWidth * 2.2) {
          context.fillRect(x, height / 2 - 1, dashWidth, 2);
        }
        drawPaddle(game.topX, verticalTopY, verticalPaddleLength, verticalPaddleThickness);
        drawPaddle(game.bottomX, verticalBottomY, verticalPaddleLength, verticalPaddleThickness);
      } else {
        const dashHeight = Math.max(5, height * 0.035);
        for (let y = dashHeight; y < height; y += dashHeight * 2.2) {
          context.fillRect(width / 2 - 1, y, 2, dashHeight);
        }
        drawPaddle(leftX, game.leftY, paddleWidth, paddleHeight);
        drawPaddle(rightX, game.rightY, paddleWidth, paddleHeight);
      }

      context.beginPath();
      context.arc(game.ballX * width, game.ballY * height, Math.max(4, ballRadius * width), 0, Math.PI * 2);
      context.fill();
    };

    const awardPoint = (side: 0 | 1) => {
      updateStatus("point");
      setScore((current) => side === 0 ? [current[0] + 1, current[1]] : [current[0], current[1] + 1]);
      if (pointTimerRef.current) window.clearTimeout(pointTimerRef.current);
      pointTimerRef.current = window.setTimeout(() => {
        resetBall(verticalRef.current ? (side === 0 ? -1 : 1) : (side === 0 ? 1 : -1));
        updateStatus("running");
      }, 650);
    };

    const bounce = (contact: number, primaryDirection: 1 | -1) => {
      const game = gameRef.current;
      game.speed = Math.min(game.speed + speedIncreasePerHit, maximumBallSpeed);
      const secondary = Math.max(-0.72, Math.min(0.72, contact)) * game.speed;
      const primary = Math.sqrt(Math.max(0.01, game.speed ** 2 - secondary ** 2)) * primaryDirection;
      if (verticalRef.current) {
        game.velocityX = secondary;
        game.velocityY = primary;
      } else {
        game.velocityX = primary;
        game.velocityY = secondary;
      }
    };

    const update = (elapsed: number) => {
      if (statusRef.current !== "running") return;
      const game = gameRef.current;
      const keys = keysRef.current;
      const keyboardSpeed = elapsed * 0.72;
      const nextSpeed = Math.min(game.speed + speedIncreasePerSecond * elapsed, maximumBallSpeed);
      const currentVelocity = Math.hypot(game.velocityX, game.velocityY);
      if (nextSpeed > game.speed && currentVelocity > 0) {
        const velocityScale = nextSpeed / currentVelocity;
        game.velocityX *= velocityScale;
        game.velocityY *= velocityScale;
        game.speed = nextSpeed;
      }
      if (verticalRef.current) {
        if (modeRef.current === 2) {
          if (keys.has("a")) game.topX = clampPaddle(game.topX - keyboardSpeed, verticalPaddleLength);
          if (keys.has("d")) game.topX = clampPaddle(game.topX + keyboardSpeed, verticalPaddleLength);
        } else {
          const target = game.ballX - verticalPaddleLength / 2;
          const difference = target - game.topX;
          const maximumStep = elapsed * 0.29;
          game.topX = clampPaddle(game.topX + Math.max(-maximumStep, Math.min(maximumStep, difference)), verticalPaddleLength);
        }
        if (keys.has("arrowleft")) game.bottomX = clampPaddle(game.bottomX - keyboardSpeed, verticalPaddleLength);
        if (keys.has("arrowright")) game.bottomX = clampPaddle(game.bottomX + keyboardSpeed, verticalPaddleLength);
      } else {
        if (keys.has("w")) game.leftY = clampPaddle(game.leftY - keyboardSpeed);
        if (keys.has("s")) game.leftY = clampPaddle(game.leftY + keyboardSpeed);
        if (modeRef.current === 2) {
          if (keys.has("arrowup")) game.rightY = clampPaddle(game.rightY - keyboardSpeed);
          if (keys.has("arrowdown")) game.rightY = clampPaddle(game.rightY + keyboardSpeed);
        } else {
          const target = game.ballY - paddleHeight / 2;
          const difference = target - game.rightY;
          const maximumStep = elapsed * 0.29;
          game.rightY = clampPaddle(game.rightY + Math.max(-maximumStep, Math.min(maximumStep, difference)));
        }
      }

      game.ballX += game.velocityX * elapsed;
      game.ballY += game.velocityY * elapsed;
      if (verticalRef.current) {
        if (game.ballX - ballRadius <= 0 || game.ballX + ballRadius >= 1) {
          game.ballX = Math.max(ballRadius, Math.min(1 - ballRadius, game.ballX));
          game.velocityX *= -1;
        }
        const hitsTop = game.velocityY < 0
          && game.ballY - ballRadius <= verticalTopY + verticalPaddleThickness
          && game.ballY > verticalTopY
          && game.ballX + ballRadius >= game.topX
          && game.ballX - ballRadius <= game.topX + verticalPaddleLength;
        const hitsBottom = game.velocityY > 0
          && game.ballY + ballRadius >= verticalBottomY
          && game.ballY < verticalBottomY + verticalPaddleThickness
          && game.ballX + ballRadius >= game.bottomX
          && game.ballX - ballRadius <= game.bottomX + verticalPaddleLength;
        if (hitsTop || hitsBottom) {
          const paddleX = hitsTop ? game.topX : game.bottomX;
          game.ballY = hitsTop ? verticalTopY + verticalPaddleThickness + ballRadius : verticalBottomY - ballRadius;
          bounce((game.ballX - (paddleX + verticalPaddleLength / 2)) / (verticalPaddleLength / 2), hitsTop ? 1 : -1);
        }
        if (game.ballY < -ballRadius) awardPoint(0);
        else if (game.ballY > 1 + ballRadius) awardPoint(1);
      } else {
        if (game.ballY - ballRadius <= 0 || game.ballY + ballRadius >= 1) {
          game.ballY = Math.max(ballRadius, Math.min(1 - ballRadius, game.ballY));
          game.velocityY *= -1;
        }
        const hitsLeft = game.velocityX < 0
          && game.ballX - ballRadius <= leftX + paddleWidth
          && game.ballX > leftX
          && game.ballY + ballRadius >= game.leftY
          && game.ballY - ballRadius <= game.leftY + paddleHeight;
        const hitsRight = game.velocityX > 0
          && game.ballX + ballRadius >= rightX
          && game.ballX < rightX + paddleWidth
          && game.ballY + ballRadius >= game.rightY
          && game.ballY - ballRadius <= game.rightY + paddleHeight;
        if (hitsLeft || hitsRight) {
          const paddleY = hitsLeft ? game.leftY : game.rightY;
          game.ballX = hitsLeft ? leftX + paddleWidth + ballRadius : rightX - ballRadius;
          bounce((game.ballY - (paddleY + paddleHeight / 2)) / (paddleHeight / 2), hitsLeft ? 1 : -1);
        }
        if (game.ballX < -ballRadius) awardPoint(1);
        else if (game.ballX > 1 + ballRadius) awardPoint(0);
      }
    };

    const loop = (now: number) => {
      const elapsed = Math.min((now - last) / 1000, 0.035);
      last = now;
      update(elapsed);
      draw();
      frame = window.requestAnimationFrame(loop);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    frame = window.requestAnimationFrame(loop);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      if (pointTimerRef.current) window.clearTimeout(pointTimerRef.current);
    };
  }, [resetBall, updateStatus]);

  const movePaddle = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || statusRef.current === "idle") return;
    const rect = canvas.getBoundingClientRect();
    if (verticalRef.current) {
      const x = clampPaddle((clientX - rect.left) / rect.width - verticalPaddleLength / 2, verticalPaddleLength);
      if (modeRef.current === 2 && clientY - rect.top < rect.height / 2) gameRef.current.topX = x;
      else gameRef.current.bottomX = x;
    } else {
      const y = clampPaddle((clientY - rect.top) / rect.height - paddleHeight / 2);
      if (modeRef.current === 2 && clientX - rect.left > rect.width / 2) gameRef.current.rightY = y;
      else gameRef.current.leftY = y;
    }
  };

  const statusLabel = !online
    ? "Sin conexión. Sigue jugando."
    : status === "idle" ? "Elige cómo jugar"
      : status === "paused" ? "Pausa"
        : status === "point" ? "Punto"
          : "Empieza la partida";

  return <div ref={consoleRef} className={`${styles.console} ${expanded ? styles.consoleExpanded : ""}`}>
    <div className={styles.consoleTop}>
      <Image className={styles.gameLogo} src="/logo/LogoNuevo_Negativo.svg" alt="Pickyalo" width={86} height={29} />
      <span className={styles.consoleActions}>
        <span className={styles.power} data-online={online} aria-hidden="true" />
        <button type="button" className={styles.expandButton} aria-label={expanded ? "Salir de pantalla completa" : "Ampliar Picky Pong a pantalla completa"} aria-expanded={expanded} onClick={() => void toggleExpanded()}>
          {expanded ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
        </button>
      </span>
    </div>
    <div className={styles.gameHeading}>
      <div><p>PICKY PONG</p><h3>¿Tienes un minuto?</h3></div>
      <span>{mode === 1 ? "1P" : "2P"}</span>
    </div>
    <div className={styles.screen}>
      <Image className={styles.screenLogo} src="/logo/LogoNuevo.svg" alt="" width={170} height={58} aria-hidden="true" />
      <div className={styles.score} aria-label={`Marcador ${score[0]} a ${score[1]}`}><span>{score[0]}</span><i>:</i><span>{score[1]}</span></div>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label={vertical ? "Picky Pong vertical. Mueve la barra inferior tocando o arrastrando. En modo dos jugadores, cada persona controla un extremo." : "Picky Pong. Mueve la barra izquierda tocando o arrastrando. En modo dos jugadores, cada persona controla su mitad."}
        role="application"
        tabIndex={0}
        onKeyDown={(event) => {
          const key = event.key.toLowerCase();
          if (["w", "s", "a", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
          if (key === " " && (statusRef.current === "running" || statusRef.current === "paused")) {
            updateStatus(statusRef.current === "running" ? "paused" : "running");
          }
          keysRef.current.add(key);
        }}
        onKeyUp={(event) => keysRef.current.delete(event.key.toLowerCase())}
        onBlur={() => keysRef.current.clear()}
        onPointerDown={(event) => { event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); movePaddle(event.clientX, event.clientY); }}
        onPointerMove={(event) => { if (event.buttons || event.pointerType === "touch") movePaddle(event.clientX, event.clientY); }}
      />
      {status === "idle" && <div className={styles.startOverlay}><strong>Picky Pong</strong><span>Juega una rápida.</span></div>}
      <div className={styles.status} aria-live="polite">{statusLabel}</div>
    </div>
    <div className={styles.modeButtons} aria-label="Modo de juego">
      <button type="button" className={mode === 1 && status !== "idle" ? styles.selected : undefined} onClick={() => start(1)}>
        <UserRound size={18} aria-hidden="true" /><span><strong>Jugar solo</strong><small>Contra Pickyalo</small></span>
      </button>
      <button type="button" className={mode === 2 && status !== "idle" ? styles.selected : undefined} onClick={() => start(2)}>
        <Users size={18} aria-hidden="true" /><span><strong>Jugar a dos</strong><small>Uno en cada extremo</small></span>
      </button>
    </div>
    <div className={styles.gameControls}>
      <button type="button" disabled={status === "idle" || status === "point"} onClick={() => updateStatus(status === "running" ? "paused" : "running")}>
        {status === "paused" ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}{status === "paused" ? "Seguir" : "Pausa"}
      </button>
      <button type="button" disabled={status === "idle"} onClick={replay}><RotateCcw size={15} aria-hidden="true" />Vuelve a jugar</button>
    </div>
    <p className={styles.instructions}>{vertical
      ? mode === 2 ? "Arrastra arriba y abajo · Teclas A/D y ←/→" : "Arrastra la pala inferior · Teclas ←/→"
      : mode === 2 ? "Arrastra en cada mitad · Teclas W/S y ↑/↓" : "Arrastra o usa W/S para mover tu barra"}</p>
  </div>;
}
