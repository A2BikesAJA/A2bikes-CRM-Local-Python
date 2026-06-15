import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, animate, useDragControls } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

// Mobile bottom sheet with three snap detents: peek / half / full.
// The handle is the only drag affordance so the body can scroll freely.
const SHEET_VH = 0.84; // sheet height as fraction of viewport
const PEEK_VISIBLE_VH = 0.26; // how much shows at the lowest detent

export function BottomSheet({ children }: { children: ReactNode }) {
  const y = useMotionValue(0);
  const controls = useDragControls();
  const reduced = usePrefersReducedMotion();
  const detents = useRef<number[]>([0, 0, 0]);

  useEffect(() => {
    const compute = () => {
      const h = window.innerHeight;
      const sheet = h * SHEET_VH;
      const full = 0;
      const peek = sheet - h * PEEK_VISIBLE_VH;
      const half = (full + peek) / 2;
      detents.current = [full, half, peek];
      // start at half
      y.set(half);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [y]);

  const snap = () => {
    const cur = y.get();
    const nearest = detents.current.reduce((a, b) =>
      Math.abs(b - cur) < Math.abs(a - cur) ? b : a
    );
    animate(y, nearest, {
      type: reduced ? "tween" : "spring",
      duration: reduced ? 0 : undefined,
      stiffness: 320,
      damping: 34,
    });
  };

  return (
    <motion.aside
      className="panel"
      style={{ height: `${SHEET_VH * 100}vh`, y }}
      drag="y"
      dragListener={false}
      dragControls={controls}
      dragConstraints={{
        top: detents.current[0],
        bottom: detents.current[2],
      }}
      dragElastic={0.04}
      onDragEnd={snap}
    >
      <div
        className="sheet-handle"
        onPointerDown={(e) => controls.start(e)}
        style={{ touchAction: "none", cursor: "grab" }}
        role="button"
        aria-label="Drag to resize panel"
        tabIndex={0}
      />
      {children}
    </motion.aside>
  );
}
