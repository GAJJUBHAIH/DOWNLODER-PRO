"use client";

import React, { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

export function BackgroundEffects() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let w: number, h: number;
    let particles: any[] = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', resize);

    // Initialization logic for each theme
    const initParticles = () => {
      particles = [];
      if (theme === 'default') {
        // No particles
      } else if (theme === 'hearts') {
        for (let i = 0; i < 40; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 15 + 10,
            speedY: Math.random() * 1.5 + 0.5,
            rotation: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.5 + 0.2
          });
        }
      } else if (theme === 'snow') {
        for (let i = 0; i < 200; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 3 + 1,
            speedY: Math.random() * 1.5 + 0.5,
            speedX: (Math.random() - 0.5) * 1
          });
        }
      } else if (theme === 'matrix') {
        const columns = Math.floor(w / 20);
        for (let i = 0; i < columns; i++) {
          particles.push({
            x: i * 20,
            y: Math.random() * h,
            speed: Math.random() * 3 + 2,
            chars: []
          });
        }
      } else if (theme === 'galaxy') {
        for (let i = 0; i < 300; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 1.5,
            blink: Math.random() * 0.01 + 0.005
          });
        }
        for (let i = 0; i < 5; i++) {
          particles.push({
            type: 'shooting',
            x: Math.random() * w,
            y: Math.random() * h,
            length: Math.random() * 100 + 50,
            speed: Math.random() * 15 + 10,
            angle: Math.PI / 4
          });
        }
      } else if (theme === 'ocean') {
        for (let i = 0; i < 80; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 8 + 2,
            speedY: Math.random() * 2 + 1,
            wobble: Math.random() * Math.PI * 2
          });
        }
      } else if (theme === 'fire') {
        for (let i = 0; i < 150; i++) {
          particles.push({
            x: Math.random() * w,
            y: h + Math.random() * 100,
            size: Math.random() * 6 + 2,
            speedY: Math.random() * 4 + 1,
            speedX: (Math.random() - 0.5) * 3,
            life: Math.random() * 100
          });
        }
      } else if (theme === 'sakura') {
        for (let i = 0; i < 70; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 8 + 4,
            speedY: Math.random() * 1.5 + 0.5,
            speedX: Math.random() * 2 + 1,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.1
          });
        }
      } else if (theme === 'rain') {
        for (let i = 0; i < 300; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            length: Math.random() * 20 + 10,
            speedY: Math.random() * 15 + 10,
            speedX: Math.random() * 2 + 1
          });
        }
      } else if (theme === 'clouds') {
        for (let i = 0; i < 15; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * (h / 2),
            size: Math.random() * 150 + 50,
            speedX: Math.random() * 0.3 + 0.1,
            opacity: Math.random() * 0.1 + 0.05
          });
        }
      } else if (theme === 'neon') {
        for (let i = 0; i < 80; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 3,
            speedY: (Math.random() - 0.5) * 3,
            hue: Math.random() > 0.5 ? 320 : 180,
            life: Math.random() * Math.PI * 2
          });
        }
      }
    };

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
      ctx.save();
      ctx.beginPath();
      ctx.translate(x, y);
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
      ctx.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, 0);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.arc(0, 0, size, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(size, -size * 0.5, size * 0.8, Math.PI, Math.PI * 2);
      ctx.arc(size * 2, -size * 0.3, size * 0.6, Math.PI, Math.PI * 2);
      ctx.arc(size * 2.5, size * 0.2, size * 0.7, Math.PI * 1.5, Math.PI * 0.5);
      ctx.moveTo(0, size);
      ctx.lineTo(size * 2.5, size * 0.9);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
      ctx.restore();
    };

    const drawPetal = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(size, -size / 2, size, size / 2, 0, 0);
      ctx.fillStyle = 'rgba(255, 183, 197, 0.7)';
      ctx.fill();
      ctx.restore();
    };

    const render = (time: number) => {
      // Clear background
      if (theme === 'matrix') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      if (theme === 'hearts') {
        particles.forEach(p => {
          p.y -= p.speedY;
          if (p.y < -p.size) p.y = h + p.size;
          drawHeart(ctx, p.x, p.y, p.size, `rgba(255, 50, 50, ${p.opacity})`);
        });
      } else if (theme === 'snow') {
        ctx.fillStyle = 'white';
        particles.forEach(p => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y > h) p.y = -p.size;
          if (p.x > w) p.x = 0;
          if (p.x < 0) p.x = w;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (theme === 'matrix') {
        ctx.fillStyle = '#0f0';
        ctx.font = '15px monospace';
        particles.forEach(p => {
          const char = String.fromCharCode(0x30A0 + Math.random() * 96);
          ctx.fillText(char, p.x, p.y);
          p.y += p.speed;
          if (p.y > h && Math.random() > 0.975) {
            p.y = 0;
          }
        });
      } else if (theme === 'galaxy') {
        particles.forEach(p => {
          if (p.type === 'shooting') {
            p.x -= Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed;
            if (p.x < -100 || p.y > h + 100) {
              p.x = Math.random() * w * 1.5;
              p.y = -100;
              p.speed = Math.random() * 15 + 10;
            }
            const grad = ctx.createLinearGradient(p.x, p.y, p.x + Math.cos(p.angle) * p.length, p.y - Math.sin(p.angle) * p.length);
            grad.addColorStop(0, 'rgba(255,255,255,1)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + Math.cos(p.angle) * p.length, p.y - Math.sin(p.angle) * p.length);
            ctx.stroke();
          } else {
            ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(time * p.blink) * 0.3})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      } else if (theme === 'ocean') {
        particles.forEach(p => {
          p.y -= p.speedY;
          p.x += Math.sin(p.wobble) * 0.5;
          p.wobble += 0.05;
          if (p.y < -p.size) p.y = h + p.size;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      } else if (theme === 'fire') {
        particles.forEach((p, i) => {
          p.y -= p.speedY;
          p.x += p.speedX;
          p.life -= 1;
          if (p.life <= 0) {
            particles[i] = {
              x: Math.random() * w,
              y: h + 10,
              size: Math.random() * 6 + 2,
              speedY: Math.random() * 4 + 1,
              speedX: (Math.random() - 0.5) * 3,
              life: 100
            };
          } else {
            const alpha = p.life / 100;
            const g = Math.floor(Math.random() * 155 + 50);
            ctx.fillStyle = `rgba(255, ${g}, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      } else if (theme === 'sakura') {
        particles.forEach(p => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.angle += p.spin;
          if (p.y > h + 10 || p.x > w + 10) {
            p.y = -10;
            p.x = Math.random() * w;
          }
          drawPetal(ctx, p.x, p.y, p.size, p.angle);
        });
      } else if (theme === 'rain') {
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
        ctx.lineWidth = 1.5;
        particles.forEach(p => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y > h) {
            p.y = -20;
            p.x = Math.random() * w;
          }
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.speedX, p.y - p.length);
          ctx.stroke();
        });
      } else if (theme === 'clouds') {
        particles.forEach(p => {
          p.x += p.speedX;
          if (p.x > w + p.size * 3) p.x = -p.size * 3;
          drawCloud(ctx, p.x, p.y, p.size, p.opacity);
        });
      } else if (theme === 'neon') {
        particles.forEach(p => {
          p.x += p.speedX;
          p.y += p.speedY;
          p.life += 0.05;
          if (p.x < 0 || p.x > w) p.speedX *= -1;
          if (p.y < 0 || p.y > h) p.speedY *= -1;
          
          ctx.shadowBlur = 20;
          ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
          ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${0.5 + Math.sin(p.life) * 0.5})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    resize();
    render(0);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  // Adjust background color base based on theme
  let baseBg = 'bg-transparent';
  if (theme === 'default') baseBg = 'bg-transparent';
  else if (theme === 'hearts') baseBg = 'bg-[#1a050d]';
  else if (theme === 'matrix') baseBg = 'bg-black';
  else if (theme === 'galaxy') baseBg = 'bg-[#05051a]';
  else if (theme === 'ocean') baseBg = 'bg-[#001020]';
  else if (theme === 'fire') baseBg = 'bg-[#1a0500]';
  else if (theme === 'neon') baseBg = 'bg-[#0a001a]';
  else if (theme === 'clouds') baseBg = 'bg-[#002040]';
  else if (theme === 'rain') baseBg = 'bg-[#0a101a]';
  else if (theme === 'sakura') baseBg = 'bg-[#1a0a10]';
  else if (theme === 'snow') baseBg = 'bg-[#0a1520]';

  return (
    <div className={`fixed inset-0 z-[-1] pointer-events-none transition-colors duration-1000 ${baseBg}`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
