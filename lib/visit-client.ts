"use client";

import { useEffect } from "react";

export function trackVisit(body: {
  branchId?: string;
  page: string;
  source?: string;
}) {
  void fetch("/api/visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => undefined);
}

export function VisitTracker(props: {
  branchId?: string;
  page: string;
  source?: string;
}) {
  useEffect(() => {
    trackVisit(props);
  }, [props.branchId, props.page, props.source]);
  return null;
}
