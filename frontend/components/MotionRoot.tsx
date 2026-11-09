"use client";

import { useLayoutEffect } from "react";

// Section entrances. Anything marked data-reveal rises into place the first
// time it scrolls into view; give siblings --i: 0, 1, 2… to stagger them.
//
// An inline script in <head> adds html.js before the first paint, so marked
// parts start hidden (globals.css). This component plays each part's
// entrance with the Web Animations API, which never touches attributes
// React manages, so it can't cause hydration mismatches in parts of the
// page that hydrate later. It also adds html.motion-ready; if that never
// happens (the script bundle failed), CSS reveals everything after a
// moment. Under reduced motion CSS shows everything at once and nothing
// is animated. Elements added later (results, a new page) are picked up
// by the mutation observer.
export default function MotionRoot() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("js", "motion-ready");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const played = new WeakSet<Element>();

    const reveal = (element: Element) => {
      if (played.has(element)) return;
      played.add(element);

      const index = parseFloat(getComputedStyle(element).getPropertyValue("--i")) || 0;

      element.animate(
        [
          { opacity: 0, transform: "translateY(24px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 700,
          delay: index * 75,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        },
      );
    };

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach(reveal);
      return;
    }

    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          intersection.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const watch = (scope: ParentNode) => {
      scope.querySelectorAll("[data-reveal]").forEach((element) => {
        if (!played.has(element)) intersection.observe(element);
      });
    };

    watch(document);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches("[data-reveal]") && !played.has(node)) intersection.observe(node);
          watch(node);
        });
      }
    });

    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      intersection.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
