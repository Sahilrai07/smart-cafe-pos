'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  DEFAULT_HERO_LAYOUT,
  HeroLayoutConfig,
  PRESETS,
} from '@/lib/heroLayout';
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Move,
  Maximize2,
  Sparkles,
  Layers,
  Check,
  ChevronRight,
  Sliders,
  Type,
  Grid,
  ExternalLink,
  Laptop,
} from 'lucide-react';

type SelectedElement = 'heroText' | 'card1' | 'card2' | 'card3' | null;

export default function HeroEditorPage() {
  const [layout, setLayout] = useState<HeroLayoutConfig>(DEFAULT_HERO_LAYOUT);
  const [selected, setSelected] = useState<SelectedElement>('heroText');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Measure actual lines of the headline dynamically
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const [headlineLineCount, setHeadlineLineCount] = useState<number>(3);

  // Dragging state
  const [dragging, setDragging] = useState<{
    target: SelectedElement;
    startX: number;
    startY: number;
    elemStartX: number;
    elemStartY: number;
  } | null>(null);

  // Resizing state for hero text width
  const [resizingWidth, setResizingWidth] = useState<{
    startX: number;
    startWidth: number;
  } | null>(null);

  // Canvas container reference
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Load layout from API or localStorage on mount
  useEffect(() => {
    async function loadLayout() {
      try {
        const res = await fetch('/api/hero-layout');
        if (res.ok) {
          const data = await res.json();
          setLayout(data);
        }
      } catch (err) {
        console.error('Error fetching layout, fallback to default:', err);
      }
    }
    loadLayout();
  }, []);

  // Recalculate line count of headline when layout.heroText.width or fontSize changes
  useEffect(() => {
    if (headlineRef.current) {
      const height = headlineRef.current.offsetHeight;
      const computedLineHeight = parseFloat(
        window.getComputedStyle(headlineRef.current).lineHeight
      ) || (layout.heroText.fontSize * 1.15);
      const lines = Math.round(height / computedLineHeight);
      setHeadlineLineCount(lines > 0 ? lines : 1);
    }
  }, [layout.heroText.width, layout.heroText.fontSize, layout.heroText.scale]);

  // Pointer move handler on the canvas window
  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragging && dragging.target) {
      const deltaX = e.clientX - dragging.startX;
      const deltaY = e.clientY - dragging.startY;

      let newX = Math.round(dragging.elemStartX + deltaX);
      let newY = Math.round(dragging.elemStartY + deltaY);

      // Boundaries
      newX = Math.max(-50, Math.min(1440 - 200, newX));
      newY = Math.max(0, Math.min(layout.canvasHeight - 100, newY));

      // Snap to canvas horizontal center (720px) for heroText
      if (dragging.target === 'heroText') {
        const centerOffset = 720 - Math.round(layout.heroText.width / 2);
        if (Math.abs(newX - centerOffset) < 14) {
          newX = centerOffset;
        }
      }

      setLayout((prev) => ({
        ...prev,
        [dragging.target!]: {
          ...prev[dragging.target!],
          x: newX,
          y: newY,
        },
      }));
    }

    if (resizingWidth) {
      const deltaX = (e.clientX - resizingWidth.startX) * 2; // symmetric resize from center
      let newWidth = Math.round(resizingWidth.startWidth + deltaX);
      newWidth = Math.max(380, Math.min(1000, newWidth));

      // Re-center x if centered
      const centerOffset = 720 - Math.round(newWidth / 2);

      setLayout((prev) => ({
        ...prev,
        heroText: {
          ...prev.heroText,
          width: newWidth,
          x: centerOffset,
        },
      }));
    }
  };

  const handlePointerUp = () => {
    setDragging(null);
    setResizingWidth(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/hero-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layout),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to save layout:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (presetKey: string) => {
    if (PRESETS[presetKey]) {
      setLayout(PRESETS[presetKey]);
    }
  };

  const setLinesPreset = (lines: 2 | 3 | 4) => {
    if (lines === 2) {
      const width = 880;
      setLayout((prev) => ({
        ...prev,
        heroText: {
          ...prev.heroText,
          width,
          x: 720 - Math.round(width / 2),
          fontSize: 56,
        },
      }));
    } else if (lines === 3) {
      const width = 640;
      setLayout((prev) => ({
        ...prev,
        heroText: {
          ...prev.heroText,
          width,
          x: 720 - Math.round(width / 2),
          fontSize: 58,
        },
      }));
    } else if (lines === 4) {
      const width = 480;
      setLayout((prev) => ({
        ...prev,
        heroText: {
          ...prev.heroText,
          width,
          x: 720 - Math.round(width / 2),
          fontSize: 54,
        },
      }));
    }
  };

  // Nudge selected element by delta
  const nudge = (dx: number, dy: number) => {
    if (!selected) return;
    setLayout((prev) => ({
      ...prev,
      [selected]: {
        ...prev[selected],
        x: Math.round(prev[selected].x + dx),
        y: Math.round(prev[selected].y + dy),
      },
    }));
  };

  const currentElementConfig = selected ? layout[selected] : null;

  return (
    <div
      className="min-h-screen bg-[#07080B] text-[#EDE7DF] flex flex-col select-none overflow-x-hidden font-sans"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* =========================================================================
          TOP STUDIO TOOLBAR
         ========================================================================= */}
      <header className="sticky top-0 z-50 h-16 bg-[#0B0D14]/95 border-b border-white/[0.08] backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-bold text-[#A1A1AA] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Site</span>
          </Link>

          <div className="h-5 w-[1px] bg-white/[0.1]" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white tracking-tight">
              Restro<span className="text-[#F59E0B]">OS</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-[#F59E0B] border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
              Hero Studio Editor
            </span>
          </div>
        </div>

        {/* Center: Headline Line Helpers & Presets */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#12141F] p-1 rounded-xl border border-white/[0.08]">
            <span className="text-[11px] font-bold text-[#71717A] px-2 flex items-center gap-1">
              <Type className="w-3 h-3 text-[#F59E0B]" />
              <span>Headline:</span>
            </span>
            <button
              onClick={() => setLinesPreset(2)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                headlineLineCount === 2
                  ? 'bg-[#F59E0B] text-black shadow-md'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              2 Lines
            </button>
            <button
              onClick={() => setLinesPreset(3)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                headlineLineCount === 3
                  ? 'bg-[#F59E0B] text-black shadow-md'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              3 Lines (Mockup)
            </button>
            <button
              onClick={() => setLinesPreset(4)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                headlineLineCount === 4
                  ? 'bg-[#F59E0B] text-black shadow-md'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              4 Lines
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-[#12141F] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => applyPreset('option1-mockup')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Reset Mockup
            </button>
            <button
              onClick={() => applyPreset('two-lines-wide')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Wide Stance
            </button>
          </div>
        </div>

        {/* Right: Preview & Save Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-xl border transition-colors ${
              showGrid
                ? 'bg-amber-500/15 border-amber-500/40 text-[#F59E0B]'
                : 'bg-white/[0.04] border-white/[0.08] text-[#71717A] hover:text-white'
            }`}
            title="Toggle alignment grid"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
              previewMode
                ? 'bg-amber-500/20 border-amber-500 text-[#F59E0B]'
                : 'bg-white/[0.05] border-white/[0.08] text-[#A1A1AA] hover:text-white'
            }`}
          >
            {previewMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{previewMode ? 'Editing' : 'Clean Preview'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#F59E0B] hover:bg-[#FBBF24] text-[#090A0F] font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Published!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Publish to Homepage</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Success Notification Bar */}
      {saveSuccess && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 flex items-center justify-center gap-3 text-emerald-300 text-xs font-bold animate-in fade-in">
          <span>✓ Layout published live to homepage!</span>
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-white flex items-center gap-1"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* =========================================================================
          STUDIO WORKSPACE (Canvas + Side Inspector)
         ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* MAIN CANVAS AREA (Scrollable & Scalable) */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-start justify-center bg-[#07080B]">
          <div
            ref={canvasRef}
            style={{
              width: '1440px',
              height: `${layout.canvasHeight}px`,
            }}
            className="relative bg-[#08090D] rounded-3xl border border-white/[0.1] shadow-2xl overflow-hidden shrink-0 select-none"
            onClick={(e) => {
              if (e.target === canvasRef.current) {
                setSelected(null);
              }
            }}
          >
            {/* Background Atmosphere & Constellation Network */}
            <div className="absolute inset-0 pointer-events-none z-0">
              {/* Amber Glow */}
              <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-b from-[#F59E0B]/18 via-[#EA580C]/8 to-transparent rounded-full blur-[140px]" />
              {/* Violet Glow */}
              <div className="absolute top-[28%] left-[-8%] w-[500px] h-[500px] bg-[#8B5CF6]/10 rounded-full blur-[160px]" />
              {/* Right Flare */}
              <div className="absolute top-[32%] right-[-8%] w-[550px] h-[550px] bg-[#F59E0B]/12 rounded-full blur-[160px]" />

              {/* Grid Lines if active */}
              {showGrid && (
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, #F59E0B 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />
              )}

              {/* Center Alignment Guide */}
              {!previewMode && (
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-amber-500/20 border-r border-dashed border-amber-500/40 pointer-events-none">
                  <span className="absolute top-2 left-2 text-[9px] font-mono text-amber-500/50">
                    Center (X: 720)
                  </span>
                </div>
              )}
            </div>

            {/* ===================================================================
                DRAGGABLE ELEMENT: HERO TEXT BLOCK
               =================================================================== */}
            <div
              style={{
                position: 'absolute',
                left: `${layout.heroText.x}px`,
                top: `${layout.heroText.y}px`,
                width: `${layout.heroText.width}px`,
                transform: `scale(${layout.heroText.scale}) rotate(${layout.heroText.rotation}deg)`,
                transformOrigin: 'center center',
                zIndex: layout.heroText.zIndex,
              }}
              className={`cursor-move transition-shadow ${
                !previewMode && selected === 'heroText'
                  ? 'ring-2 ring-[#F59E0B] ring-offset-4 ring-offset-[#08090D] rounded-2xl bg-white/[0.02]'
                  : 'hover:ring-1 hover:ring-white/30 rounded-2xl'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setSelected('heroText');
              }}
              onPointerDown={(e) => {
                if (previewMode) return;
                setSelected('heroText');
                setDragging({
                  target: 'heroText',
                  startX: e.clientX,
                  startY: e.clientY,
                  elemStartX: layout.heroText.x,
                  elemStartY: layout.heroText.y,
                });
              }}
            >
              {/* Top Drag Handle Bar (Visible when selected) */}
              {!previewMode && selected === 'heroText' && (
                <div className="absolute -top-7 left-0 right-0 flex items-center justify-between text-[10px] font-bold text-amber-400 bg-[#161824] px-2 py-0.5 rounded-t-lg border border-b-0 border-[#F59E0B]/50 shadow-md">
                  <span className="flex items-center gap-1">
                    <Move className="w-3 h-3" />
                    <span>Hero Text • {layout.heroText.width}px • {headlineLineCount} Lines</span>
                  </span>
                  <span>(X: {layout.heroText.x}, Y: {layout.heroText.y})</span>
                </div>
              )}

              {/* The Actual Headline & Content */}
              <div className="p-4 text-center">
                <h1
                  ref={headlineRef}
                  style={{
                    fontSize: `${layout.heroText.fontSize}px`,
                    lineHeight: 1.12,
                  }}
                  className="font-black tracking-tight text-white select-none text-center"
                >
                  Next-Gen Operating System for Modern Cafes
                </h1>

                <p className="text-base text-[#A1A1AA] max-w-xl mx-auto leading-relaxed mt-4 font-normal">
                  {layout.heroText.subtitleText}
                </p>

                <div className="flex items-center justify-center gap-4 pt-6">
                  <div className="px-8 py-3.5 rounded-full bg-[#F59E0B] text-[#090A0F] font-black text-xs uppercase tracking-wider shadow-[0_0_35px_rgba(245,158,11,0.55)]">
                    Request Free Demo
                  </div>
                  <div className="px-7 py-3.5 rounded-full bg-[#11131C] text-white font-bold text-xs uppercase tracking-wider border border-white/[0.18] shadow-lg">
                    Explore Platform
                  </div>
                </div>
              </div>

              {/* Horizontal Stretch Handle (Right Edge) */}
              {!previewMode && selected === 'heroText' && (
                <div
                  className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-12 rounded-full bg-[#F59E0B] text-black flex items-center justify-center cursor-ew-resize shadow-lg hover:scale-110 transition-transform z-30"
                  title="Drag left or right to stretch text width into 2, 3, or 4 lines"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setResizingWidth({
                      startX: e.clientX,
                      startWidth: layout.heroText.width,
                    });
                  }}
                >
                  <Maximize2 className="w-3.5 h-3.5 rotate-45 stroke-[3]" />
                </div>
              )}
            </div>

            {/* ===================================================================
                DRAGGABLE ELEMENT: CARD 1 (Contactless QR Table Ordering)
               =================================================================== */}
            <div
              style={{
                position: 'absolute',
                left: `${layout.card1.x}px`,
                top: `${layout.card1.y}px`,
                width: `${layout.card1.width}px`,
                transform: `scale(${layout.card1.scale}) rotate(${layout.card1.rotation}deg)`,
                transformOrigin: 'center center',
                zIndex: layout.card1.zIndex,
              }}
              className={`cursor-move transition-shadow ${
                !previewMode && selected === 'card1'
                  ? 'ring-2 ring-[#F59E0B] ring-offset-4 ring-offset-[#08090D] rounded-3xl'
                  : 'hover:ring-1 hover:ring-white/30 rounded-3xl'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setSelected('card1');
              }}
              onPointerDown={(e) => {
                if (previewMode) return;
                setSelected('card1');
                setDragging({
                  target: 'card1',
                  startX: e.clientX,
                  startY: e.clientY,
                  elemStartX: layout.card1.x,
                  elemStartY: layout.card1.y,
                });
              }}
            >
              {!previewMode && selected === 'card1' && (
                <div className="absolute -top-7 left-0 right-0 flex items-center justify-between text-[10px] font-bold text-amber-400 bg-[#161824] px-2 py-0.5 rounded-t-lg border border-b-0 border-[#F59E0B]/50 shadow-md">
                  <span className="flex items-center gap-1">
                    <Move className="w-3 h-3" />
                    <span>Card 1: QR Ordering</span>
                  </span>
                  <span>(X: {layout.card1.x}, Y: {layout.card1.y})</span>
                </div>
              )}

              <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/[0.08] pointer-events-none">
                <img
                  src="/designs/card1-qr.png"
                  alt="Contactless QR Table Ordering"
                  className="w-full h-auto block select-none"
                  draggable={false}
                />
              </div>
            </div>

            {/* ===================================================================
                DRAGGABLE ELEMENT: CARD 2 (Instant Billing Metrics)
               =================================================================== */}
            <div
              style={{
                position: 'absolute',
                left: `${layout.card2.x}px`,
                top: `${layout.card2.y}px`,
                width: `${layout.card2.width}px`,
                transform: `scale(${layout.card2.scale}) rotate(${layout.card2.rotation}deg)`,
                transformOrigin: 'center center',
                zIndex: layout.card2.zIndex,
              }}
              className={`cursor-move transition-shadow ${
                !previewMode && selected === 'card2'
                  ? 'ring-2 ring-[#8B5CF6] ring-offset-4 ring-offset-[#08090D] rounded-3xl'
                  : 'hover:ring-1 hover:ring-white/30 rounded-3xl'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setSelected('card2');
              }}
              onPointerDown={(e) => {
                if (previewMode) return;
                setSelected('card2');
                setDragging({
                  target: 'card2',
                  startX: e.clientX,
                  startY: e.clientY,
                  elemStartX: layout.card2.x,
                  elemStartY: layout.card2.y,
                });
              }}
            >
              {!previewMode && selected === 'card2' && (
                <div className="absolute -top-7 left-0 right-0 flex items-center justify-between text-[10px] font-bold text-purple-400 bg-[#161824] px-2 py-0.5 rounded-t-lg border border-b-0 border-[#8B5CF6]/50 shadow-md">
                  <span className="flex items-center gap-1">
                    <Move className="w-3 h-3" />
                    <span>Card 2: Billing Metrics</span>
                  </span>
                  <span>(X: {layout.card2.x}, Y: {layout.card2.y})</span>
                </div>
              )}

              <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/[0.08] pointer-events-none">
                <img
                  src="/designs/card2-metrics.png"
                  alt="Instant Billing Metrics"
                  className="w-full h-auto block select-none"
                  draggable={false}
                />
              </div>
            </div>

            {/* ===================================================================
                DRAGGABLE ELEMENT: CARD 3 (Live Kitchen Display KDS)
               =================================================================== */}
            <div
              style={{
                position: 'absolute',
                left: `${layout.card3.x}px`,
                top: `${layout.card3.y}px`,
                width: `${layout.card3.width}px`,
                transform: `scale(${layout.card3.scale}) rotate(${layout.card3.rotation}deg)`,
                transformOrigin: 'center center',
                zIndex: layout.card3.zIndex,
              }}
              className={`cursor-move transition-shadow ${
                !previewMode && selected === 'card3'
                  ? 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-[#08090D] rounded-3xl'
                  : 'hover:ring-1 hover:ring-white/30 rounded-3xl'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setSelected('card3');
              }}
              onPointerDown={(e) => {
                if (previewMode) return;
                setSelected('card3');
                setDragging({
                  target: 'card3',
                  startX: e.clientX,
                  startY: e.clientY,
                  elemStartX: layout.card3.x,
                  elemStartY: layout.card3.y,
                });
              }}
            >
              {!previewMode && selected === 'card3' && (
                <div className="absolute -top-7 left-0 right-0 flex items-center justify-between text-[10px] font-bold text-emerald-400 bg-[#161824] px-2 py-0.5 rounded-t-lg border border-b-0 border-emerald-500/50 shadow-md">
                  <span className="flex items-center gap-1">
                    <Move className="w-3 h-3" />
                    <span>Card 3: Kitchen KDS</span>
                  </span>
                  <span>(X: {layout.card3.x}, Y: {layout.card3.y})</span>
                </div>
              )}

              <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/[0.08] pointer-events-none">
                <img
                  src="/designs/card3-kitchen.png"
                  alt="Live Kitchen Display (KDS)"
                  className="w-full h-auto block select-none"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT INSPECTOR & FINE CONTROLS PANEL
           ========================================================================= */}
        <aside className="w-80 bg-[#0B0D14] border-l border-white/[0.08] p-5 flex flex-col gap-6 overflow-y-auto shrink-0 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#F59E0B]" />
              <span>Element Inspector</span>
            </span>
            {selected && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-amber-400">
                {selected}
              </span>
            )}
          </div>

          {selected ? (
            <div className="space-y-6 text-xs">
              {/* Position Nudge Controls */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                  Fine Position (Nudge)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#12141F] p-2.5 rounded-xl border border-white/[0.08]">
                    <span className="text-[10px] text-[#71717A] block">X Coordinate</span>
                    <span className="text-sm font-black text-white">{currentElementConfig?.x} px</span>
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => nudge(-10, 0)}
                        className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => nudge(-1, 0)}
                        className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => nudge(1, 0)}
                        className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => nudge(10, 0)}
                        className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold"
                      >
                        +10
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#12141F] p-2.5 rounded-xl border border-white/[0.08]">
                    <span className="text-[10px] text-[#71717A] block">Y Coordinate</span>
                    <span className="text-sm font-black text-white">{currentElementConfig?.y} px</span>
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => nudge(0, -10)}
                        className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => nudge(0, -1)}
                        className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => nudge(0, 1)}
                        className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => nudge(0, 10)}
                        className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Width / Stretch (Special for heroText) */}
              {selected === 'heroText' && (
                <div className="space-y-2 bg-[#12141F] p-3 rounded-xl border border-amber-500/20">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      Headline Width & Lines
                    </label>
                    <span className="text-xs font-black text-white">
                      {layout.heroText.width} px ({headlineLineCount} Lines)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="380"
                    max="980"
                    step="10"
                    value={layout.heroText.width}
                    onChange={(e) => {
                      const width = parseInt(e.target.value, 10);
                      const centerOffset = 720 - Math.round(width / 2);
                      setLayout((prev) => ({
                        ...prev,
                        heroText: {
                          ...prev.heroText,
                          width,
                          x: centerOffset,
                        },
                      }));
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#71717A] pt-1">
                    <span>Tight (5 Lines)</span>
                    <span className="text-amber-400 font-bold">Standard (3 Lines)</span>
                    <span>Wide (2 Lines)</span>
                  </div>

                  {/* Font Size Slider */}
                  <div className="pt-3 border-t border-white/[0.06]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-[#A1A1AA] font-bold">Font Size</span>
                      <span className="text-xs font-black text-white">
                        {layout.heroText.fontSize} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="72"
                      value={layout.heroText.fontSize}
                      onChange={(e) => {
                        setLayout((prev) => ({
                          ...prev,
                          heroText: {
                            ...prev.heroText,
                            fontSize: parseInt(e.target.value, 10),
                          },
                        }));
                      }}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Rotation Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                    Rotation Tilt
                  </label>
                  <span className="text-xs font-black text-white">
                    {currentElementConfig?.rotation}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={currentElementConfig?.rotation || 0}
                  onChange={(e) => {
                    const rot = parseInt(e.target.value, 10);
                    setLayout((prev) => ({
                      ...prev,
                      [selected]: {
                        ...prev[selected],
                        rotation: rot,
                      },
                    }));
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Scale / Size Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                    Element Scale
                  </label>
                  <span className="text-xs font-black text-white">
                    {Math.round((currentElementConfig?.scale || 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={currentElementConfig?.scale || 1}
                  onChange={(e) => {
                    const sc = parseFloat(e.target.value);
                    setLayout((prev) => ({
                      ...prev,
                      [selected]: {
                        ...prev[selected],
                        scale: sc,
                      },
                    }));
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Layer Z-Index */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                  Layer Ordering
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setLayout((prev) => ({
                        ...prev,
                        [selected]: {
                          ...prev[selected],
                          zIndex: Math.max(1, prev[selected].zIndex - 1),
                        },
                      }));
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold transition-colors"
                  >
                    Send Back
                  </button>
                  <button
                    onClick={() => {
                      setLayout((prev) => ({
                        ...prev,
                        [selected]: {
                          ...prev[selected],
                          zIndex: prev[selected].zIndex + 2,
                        },
                      }));
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] border border-amber-500/30 hover:bg-[#F59E0B]/30 text-xs font-bold transition-colors"
                  >
                    Bring Front
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#71717A] space-y-3">
              <Move className="w-8 h-8 mx-auto text-[#3F3F46]" />
              <p className="text-xs leading-relaxed">
                Click on the <strong>Hero Text</strong> or any of the <strong>3 Cards</strong> in the canvas to drag, rotate, scale, or stretch.
              </p>
            </div>
          )}

          {/* Quick Select Buttons */}
          <div className="mt-auto pt-4 border-t border-white/[0.08] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block">
              Direct Select
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setSelected('heroText')}
                className={`p-2 rounded-xl text-left text-xs font-bold transition-colors ${
                  selected === 'heroText'
                    ? 'bg-[#F59E0B] text-black'
                    : 'bg-white/[0.04] text-[#A1A1AA] hover:text-white'
                }`}
              >
                Hero Text
              </button>
              <button
                onClick={() => setSelected('card1')}
                className={`p-2 rounded-xl text-left text-xs font-bold transition-colors ${
                  selected === 'card1'
                    ? 'bg-[#F59E0B] text-black'
                    : 'bg-white/[0.04] text-[#A1A1AA] hover:text-white'
                }`}
              >
                Card 1 (QR)
              </button>
              <button
                onClick={() => setSelected('card2')}
                className={`p-2 rounded-xl text-left text-xs font-bold transition-colors ${
                  selected === 'card2'
                    ? 'bg-[#F59E0B] text-black'
                    : 'bg-white/[0.04] text-[#A1A1AA] hover:text-white'
                }`}
              >
                Card 2 (Metrics)
              </button>
              <button
                onClick={() => setSelected('card3')}
                className={`p-2 rounded-xl text-left text-xs font-bold transition-colors ${
                  selected === 'card3'
                    ? 'bg-[#F59E0B] text-black'
                    : 'bg-white/[0.04] text-[#A1A1AA] hover:text-white'
                }`}
              >
                Card 3 (KDS)
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
