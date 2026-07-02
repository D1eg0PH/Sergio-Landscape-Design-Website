'use client';
import { motion } from "framer-motion";

export default function IndependenceBanner() {
  return (
<motion.section
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.8,
    delay: 0.2,
  }} className="relative pt-20 overflow-hidden bg-[#FDFBF7] border-y border-gray-200">      {/* Fondo muy sutil */}
    
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff,transparent_70%)] opacity-80" />


      {/* Bandera izquierda */}
        <div className="absolute left-0 inset-y-0 w-55 overflow-hidden pointer-events-none">
        <img
            src="/holiday/flag1.png"
            alt=""
            className="
            absolute
            -left-15
            top-1/2
            translate-15               
            w-90
            opacity-60
            ribbon-wave
            drop-shadow-xl
            select-none
            "
        />
        </div>

      {/* Bandera derecha */}
        <div className="absolute right-0 inset-y-0 w-55 overflow-hidden pointer-events-none">

        <img
            src="/holiday/flag2.png"
            alt=""
            className="
            absolute
            -right-1.25
            top-1/2
            translate-4                  
            w-90
            opacity-60
            ribbon-wave
            drop-shadow-xl
            select-none
            "
        />
        </div>

      {/* Contenido */}
    <div className="relative max-w-5xl mx-auto px-6 py-6 text-center">
        <p className="uppercase tracking-[0.35em] text-sm font-bold text-[#163A70]">
          ★ Independence Day ★
        </p>

        <h2 className="mt-4 text-4xl md:text-6xl font-black tracking-tight">

          <span className="text-[#163A70]">
            Happy
          </span>

          {" "}

          <span className="text-[#C62828]">
            4th
          </span>

          {" "}

          <span className="text-[#163A70]">
            of July!
          </span>

        </h2>

        <div className="flex justify-center items-center gap-4 mt-6">

          <div className="w-20 h-0.5 bg-[#163A70]" />

          <div className="w-3 h-3 rounded-full bg-[#163A70]" />

          <div className="w-20 h-0.5 bg-[#C62828]" />

        </div>

        <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Wishing our clients, neighbors, and community
          a safe, joyful, and memorable Independence Day.
        </p>

    </div>

    </motion.section>
  );
}