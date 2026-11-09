import type { Metadata } from "next";

import SavedAnalyses from "../../components/SavedAnalyses";
import { SiteFooter, SiteHeader, SkipLink } from "../../components/ui";

export const metadata: Metadata = {
  title: "Saved chats | TalkTracker",
  description: "The chat results you chose to keep.",
};

export default function SavedPage() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="saved" />

      <main id="main-content">
        <SavedAnalyses />
      </main>

      <SiteFooter />
    </>
  );
}
