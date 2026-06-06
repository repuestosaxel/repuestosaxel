"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

import { LoginBrandShowcase } from "@/components/login/login-brand-showcase";
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

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="w-full max-w-[1080px]"
        >
          <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-panel backdrop-blur-xl lg:grid-cols-[0.92fr_1.08fr]">
            <div className="carbon relative hidden flex-col justify-between border-r border-white/10 p-8 xl:p-10 lg:flex">
              <LoginBrandShowcase variant="desktop" />

              <div className="rounded-2xl border border-racing-red/35 bg-racing-red/10 p-5 xl:p-6">
                <p className="font-display text-3xl font-bold leading-tight text-white xl:text-4xl">
                  Control total.
                  <br />
                  Ritmo de pista.
                </p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/58 xl:text-base">
                  Stock, ventas, clientes, taller y finanzas en un solo panel.
                </p>
              </div>
            </div>

            <Card className="rounded-none border-0 bg-transparent px-5 py-7 shadow-none sm:px-8 sm:py-9 lg:px-10 lg:py-10">
              <div className="lg:hidden">
                <LoginBrandShowcase variant="mobile" />
              </div>

              <div className="mt-7 lg:mt-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-racing-red/30 bg-racing-red/12 px-3 py-1.5 text-xs font-bold text-red-100">
                  <ShieldCheck className="size-3.5 shrink-0" />
                  Acceso al sistema
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-white sm:text-3xl lg:mt-3 lg:text-[1.35rem] lg:font-semibold xl:text-2xl">
                  Ingresá al panel
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/55 sm:text-base lg:mt-1.5 lg:text-sm">
                  Usá tus credenciales para continuar.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
                    <Mail className="size-4 text-racing-red" />
                    Usuario
                  </span>
                  <Input
                    className="h-11 text-base"
                    placeholder="tu@email.com"
                    autoComplete="username"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
                    <LockKeyhole className="size-4 text-racing-red" />
                    Contraseña
                  </span>
                  <Input
                    className="h-11 text-base"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </label>
                <Button asChild className="mt-1 h-11 w-full text-base sm:h-12">
                  <Link href="/dashboard">
                    Entrar al sistema
                    <ArrowRight />
                  </Link>
                </Button>
              </div>

              <p className="mt-6 text-center text-xs leading-5 text-white/38 lg:text-left">
                Primero configurá categorías y proveedores, luego cargá productos con imagen desde tu PC.
              </p>
            </Card>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
