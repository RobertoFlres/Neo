"use client";

import ButtonLead from "@/components/ButtonLead";
import { Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-24 md:py-32 bg-gradient-to-br from-[#08112b] via-[#0a1d40] to-[#0c2d66] text-white">
      {/* Ambient halos */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.22),transparent_60%),radial-gradient(circle_at_bottom,rgba(34,121,255,0.2),transparent_60%)]"></div>

      {/* Full background grid */}
      <div className="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,#0f223f_1px,transparent_1px),linear-gradient(to_bottom,#0f223f_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      {/* Glow blobs */}
      <div className="absolute -top-[22%] left-[-12%] w-[28rem] h-[28rem] bg-sky-400/25 blur-[180px]"></div>
      <div className="absolute top-[-18%] right-[-8%] w-[34rem] h-[34rem] bg-blue-500/22 blur-[200px]"></div>
      <div className="absolute bottom-[-26%] right-[18%] w-[26rem] h-[26rem] bg-cyan-400/18 blur-[190px]"></div>

      <div className="relative w-full max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 border border-white/10 text-xs md:text-sm uppercase tracking-[0.3em] text-blue-100/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          1,200+ profesionales ya leen neo
        </div>

        {/* Headline */}
        <h1 className="mt-10 text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-tight text-blue-50">
          Noticias tech al instante
          <span className={`${greatVibes.className} block text-5xl md:text-6xl lg:text-[4.6rem] text-cyan-200 mt-1`}>
            simplificadas
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-base md:text-lg text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
          Recibe cada mañana una selección curada de startups, tecnología y emprendimiento.
        </p>

        {/* CTA stack */}
        <div className="mt-10 w-full max-w-xl mx-auto flex flex-col items-center gap-4">
          <ButtonLead extraStyle="w-full" />
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs md:text-sm text-blue-100/60 uppercase tracking-[0.3em]">
          <span>Sin spam</span>
          <span>Lectura 5 min</span>
          <span>Cancela cuando quieras</span>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full border-t border-white/15 pt-10 text-center">
          <div>
            <div className="text-3xl font-semibold text-cyan-200">+1K</div>
            <p className="text-xs uppercase tracking-[0.32em] text-blue-100/60 mt-2">suscriptores</p>
          </div>
          <div>
            <div className="text-3xl font-semibold text-blue-200">365</div>
            <p className="text-xs uppercase tracking-[0.32em] text-blue-100/60 mt-2">envíos al año</p>
          </div>
          <div>
            <div className="text-3xl font-semibold text-blue-200">$0</div>
            <p className="text-xs uppercase tracking-[0.32em] text-blue-100/60 mt-2">para siempre</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
