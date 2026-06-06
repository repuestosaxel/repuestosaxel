"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-racing-grid bg-[length:38px_38px] opacity-50" />
      <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-racing-red/18 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-[430px] w-[430px] rounded-full bg-racing-dark/24 blur-3xl" />
      <div className="absolute left-0 top-24 h-px w-full bg-gradient-to-r from-transparent via-racing-red to-transparent opacity-60" />

      <section className="relative z-10 grid min-h-screen place-items-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="w-full max-w-[1080px]"
        >
          <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-panel backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
            <div className="carbon relative hidden min-h-[640px] border-r border-white/10 p-8 lg:block">
              <BrandLogo />
              <div className="absolute inset-x-8 bottom-8">
                <div className="rounded-2xl border border-racing-red/35 bg-racing-red/10 p-5">
                  <p className="font-display text-4xl font-bold leading-tight text-white">
                    Control total.
                    <br />
                    Ritmo de pista.
                  </p>
                  <p className="mt-4 max-w-md text-sm leading-6 text-white/58">
                    Stock, ventas, clientes, taller y finanzas en una interfaz diseñada para tomar decisiones sin fricción.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {["Stock", "Ventas", "Taller"].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border border-white/10 bg-black/30 p-3 text-center font-display text-sm font-bold"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Card className="rounded-none border-0 bg-transparent p-6 shadow-none sm:p-10 lg:p-14">
              <div className="lg:hidden">
                <BrandLogo />
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-racing-red/30 bg-racing-red/12 px-3 py-1.5 text-xs font-bold text-red-100">
                  <ShieldCheck className="size-4" /> Sistema de gestión
                </div>
                <h1 className="mt-5 font-display text-4xl font-bold tracking-normal text-white md:text-5xl">
                  Bienvenido a AYG Motor Racing
                </h1>
                <p className="mt-4 text-base leading-7 text-white/58">
                  Accedé al panel para gestionar repuestos, ventas y taller.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/68">
                    <Mail className="size-4 text-racing-red" /> Usuario
                  </span>
                  <Input placeholder="tu@email.com" autoComplete="username" />
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/68">
                    <LockKeyhole className="size-4 text-racing-red" /> Contraseña
                  </span>
                  <Input type="password" placeholder="••••••••" autoComplete="current-password" />
                </label>
                <Button asChild className="h-12 w-full text-base">
                  <Link href="/dashboard">
                    Entrar al sistema <ArrowRight />
                  </Link>
                </Button>
              </div>

              <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.045] p-4">
                <p className="text-sm font-semibold text-white">Primeros pasos</p>
                <p className="mt-1 text-sm leading-6 text-white/50">
                  Configurá categorías y proveedores, luego cargá productos con imagen desde tu PC. Los datos se guardan en la base de datos en tiempo real.
                </p>
              </div>
            </Card>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
