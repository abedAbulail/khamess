"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { Branch } from "@/lib/types";
import { VisitTracker } from "@/lib/visit-client";

export function BranchPicker({
  nablus,
  jenin,
}: {
  nablus: Branch;
  jenin: Branch;
}) {
  const reduce = useReducedMotion();

  return (
    <main className="min-h-svh bg-black text-ink">
      <VisitTracker page="home" />
      <div className="flex min-h-svh flex-col lg:flex-row">
        <BranchDoor branch={jenin} href="/jenin" reduce={Boolean(reduce)} delay={0} />
        <BranchDoor branch={nablus} href="/nablus" reduce={Boolean(reduce)} delay={0.08} />
      </div>
    </main>
  );
}

function BranchDoor({
  branch,
  href,
  reduce,
  delay,
}: {
  branch: Branch;
  href: string;
  reduce: boolean;
  delay: number;
}) {
  return (
    <motion.div
      className="relative min-h-[50svh] flex-1 border-line lg:border-r"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay }}
    >
      <Link href={href} className="group absolute inset-0 block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={branch.heroImage}
          alt={branch.nameAr}
          className="absolute inset-0 size-full object-cover opacity-50 grayscale transition duration-700 group-hover:scale-105 group-hover:opacity-70 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
          <div>
            <p className="text-[12px] tracking-[0.35em] text-gold">مطعم خميس</p>
            <h1 className="mt-2 text-4xl font-semibold sm:text-6xl">{branch.city}</h1>
            <p className="mt-2 text-[15px] text-muted">{branch.address}</p>
            <span className="mt-6 inline-flex min-h-12 min-w-40 items-center justify-center bg-gold px-6 text-[15px] font-semibold text-black">
              ادخل الفرع
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
