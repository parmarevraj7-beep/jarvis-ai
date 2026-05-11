import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isListening: boolean;
  barCount?: number;
}

export function AudioVisualizer({
  isListening,
  barCount = 28,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isListening) {
      // Draw flat bars on stop
      cancelAnimationFrame(animFrameRef.current);
      analyserRef.current = null;
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) track.stop();
        streamRef.current = null;
      }
      drawFlat();
      return;
    }

    let active = true;

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        if (!active) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }
        streamRef.current = stream;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.7;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyserRef.current = analyser;
        drawBars();
      } catch {
        // Permission denied or no mic — show animated placeholder
        drawAnimated();
      }
    }

    function drawBars() {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser || !active) return;

      const bufferLength = analyser.frequencyBinCount;
      const data = new Uint8Array(bufferLength);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      function frame() {
        if (!active || !analyser || !ctx || !canvas) return;
        analyser.getByteFrequencyData(data);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;
        const count = barCount;
        const gap = 3;
        const barW = Math.max(2, (w - gap * (count - 1)) / count);

        for (let i = 0; i < count; i++) {
          const sample = data[Math.floor((i / count) * bufferLength)] / 255;
          const barH = Math.max(3, sample * h * 0.9);
          const x = i * (barW + gap);
          const y = (h - barH) / 2;

          const gradient = ctx.createLinearGradient(x, y, x, y + barH);
          gradient.addColorStop(
            0,
            `oklch(0.65 0.18 200 / ${0.4 + sample * 0.6})`,
          );
          gradient.addColorStop(
            0.5,
            `oklch(0.65 0.18 200 / ${0.7 + sample * 0.3})`,
          );
          gradient.addColorStop(
            1,
            `oklch(0.65 0.18 200 / ${0.4 + sample * 0.6})`,
          );

          ctx.fillStyle = gradient;
          ctx.shadowColor = "oklch(0.65 0.18 200)";
          ctx.shadowBlur = sample > 0.4 ? 6 : 2;
          ctx.beginPath();
          ctx.roundRect(x, y, barW, barH, 1);
          ctx.fill();
        }

        animFrameRef.current = requestAnimationFrame(frame);
      }

      animFrameRef.current = requestAnimationFrame(frame);
    }

    function drawAnimated() {
      const canvas = canvasRef.current;
      const ctx2d = canvas?.getContext("2d");
      if (!canvas || !ctx2d) return;
      let tick = 0;

      function frame() {
        if (!active || !ctx2d || !canvas) return;
        tick++;
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;
        const count = barCount;
        const gap = 3;
        const barW = Math.max(2, (w - gap * (count - 1)) / count);

        for (let i = 0; i < count; i++) {
          const phase = (i / count) * Math.PI * 2;
          const sample = (Math.sin(tick * 0.06 + phase) + 1) / 2;
          const barH = Math.max(3, sample * h * 0.6);
          const x = i * (barW + gap);
          const y = (h - barH) / 2;

          ctx2d.fillStyle = `oklch(0.65 0.18 200 / ${0.3 + sample * 0.5})`;
          ctx2d.shadowColor = "oklch(0.65 0.18 200)";
          ctx2d.shadowBlur = 4;
          ctx2d.beginPath();
          ctx2d.roundRect(x, y, barW, barH, 1);
          ctx2d.fill();
        }

        animFrameRef.current = requestAnimationFrame(frame);
      }

      animFrameRef.current = requestAnimationFrame(frame);
    }

    init();

    return () => {
      active = false;
      cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) track.stop();
        streamRef.current = null;
      }
    };
  }, [isListening, barCount]);

  function drawFlat() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const count = barCount;
    const gap = 3;
    const barW = Math.max(2, (w - gap * (count - 1)) / count);

    for (let i = 0; i < count; i++) {
      const barH = 3;
      const x = i * (barW + gap);
      const y = (h - barH) / 2;
      ctx.fillStyle = "oklch(0.65 0.18 200 / 0.2)";
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 1);
      ctx.fill();
    }
  }

  return (
    <div
      className="transition-all duration-300"
      style={{
        opacity: isListening ? 1 : 0,
        height: isListening ? "40px" : "0px",
        overflow: "hidden",
        pointerEvents: "none",
      }}
      aria-hidden
      data-ocid="jarvis.audio_visualizer"
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={40}
        className="w-full h-10"
        style={{ display: "block" }}
      />
    </div>
  );
}
