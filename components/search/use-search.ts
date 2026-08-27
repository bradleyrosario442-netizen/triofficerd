"use client";

import { useEffect, useRef, useState } from "react";

export interface SearchProductHit {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number | null;
  previousPrice: number | null;
  subcategory: string;
}

export interface SearchResponse {
  query: string;
  total: number;
  products: SearchProductHit[];
  categories: { slug: string; name: string; count: number }[];
  brands: { slug: string; name: string }[];
  suggestions: { label: string; href: string; parent: string }[];
}

const empty: SearchResponse = {
  query: "",
  total: 0,
  products: [],
  categories: [],
  brands: [],
  suggestions: [],
};

/** Búsqueda predictiva con anti-rebote y cancelación de peticiones previas. */
export function useSearch(query: string, enabled = true) {
  const [results, setResults] = useState<SearchResponse>(empty);
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!enabled || trimmed.length < 2) {
      setResults(empty);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      controller.current?.abort();
      const next = new AbortController();
      controller.current = next;

      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: next.signal })
        .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
        .then((data: SearchResponse) => {
          setResults(data);
          setLoading(false);
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setResults(empty);
          setLoading(false);
        });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [query, enabled]);

  useEffect(() => () => controller.current?.abort(), []);

  return { results, loading };
}
