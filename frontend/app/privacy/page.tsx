import type { Metadata } from "next";
import Link from "next/link";

import { ContactLink, LegalPage, LegalSection } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy | TalkTracker",
  description: "What TalkTracker collects, what it sends where, and what it keeps.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="privacy policy"
      intro="TalkTracker analyzes the chats you upload and keeps as little as it can. Here's exactly what that means, in plain English."
    >
      <LegalSection title="the short version">
        <ul>
          <li>Your account is your email address and a password, or your Google sign-in.</li>
          <li>Chats you upload are analyzed and then not kept. TalkTracker doesn&rsquo;t save them.</li>
          <li>
            For the AI commentary, participant names, statistics, and a sample of messages are sent
            to OpenAI.
          </li>
          <li>There are no ads, no analytics, and no tracking cookies.</li>
        </ul>
      </LegalSection>

      <LegalSection title="your account">
        <p>
          Accounts are run by Supabase, a sign-in provider. When you create one, Supabase stores
          your email address and a securely hashed version of your password. If you sign in with
          Google, Supabase receives your email address and the basic profile details Google shares,
          such as your name and profile picture. Google never shares your Google password.
        </p>
        <p>
          This is used only to let you sign in and to make sure only signed-in people can analyze
          chats. It isn&rsquo;t used for marketing and isn&rsquo;t sold or shared with anyone else.
        </p>
      </LegalSection>

      <LegalSection title="the chats you upload">
        <p>
          When you upload a chat export, it&rsquo;s sent to the TalkTracker server, which reads it
          to calculate statistics, awards, and activity charts. The results are shown in your
          browser.
        </p>
        <p>
          TalkTracker&rsquo;s code doesn&rsquo;t save your chat or the results to a database or
          file. Once the analysis is done, they&rsquo;re gone, apart from whatever temporary
          handling the hosting providers below do while processing a request. Leave the page and
          the results go with it.
        </p>
        <p>
          Only upload conversations you have permission to share. Chats contain other people&rsquo;s
          messages too.
        </p>
      </LegalSection>

      <LegalSection title="AI analysis and OpenAI">
        <p>
          The AI commentary (who&rsquo;s funnier, texting styles, recurring topics) is written by
          OpenAI&rsquo;s models. To do that, TalkTracker sends OpenAI the participant names as
          they appear in the chat, the calculated statistics, and selected messages: short chats in
          full, longer ones as a sample of up to 200 messages, each cut to 500 characters.
        </p>
        <p>
          OpenAI handles that data under its own{" "}
          <a
            href="https://openai.com/policies/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            privacy policy
          </a>
          . TalkTracker doesn&rsquo;t control how long OpenAI keeps it. Names are not currently
          replaced with pseudonyms before sending.
        </p>
        <p>
          Daily allowances limit how often AI analysis runs, for each account and for the site as
          a whole. The counters are stored with Upstash. They contain no chat content, and your
          account appears only as a scrambled code (a one-way hash of your email address), never
          the address itself.
        </p>
      </LegalSection>

      <LegalSection title="cookies">
        <p>
          TalkTracker only uses the cookies needed to keep you signed in. There are no advertising,
          analytics, or tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="who else is involved">
        <p>TalkTracker relies on these services to run:</p>
        <ul>
          <li>Supabase, for accounts and sign-in</li>
          <li>Google, if you choose to sign in with Google</li>
          <li>
            Cloudflare Turnstile, which checks that sign-ups and log-ins come from a person. It
            reads basic browser and device signals and isn&rsquo;t used for advertising.
          </li>
          <li>OpenAI, for the AI commentary</li>
          <li>Vercel, which hosts the website</li>
          <li>Render, which hosts the analysis server</li>
          <li>Upstash, which stores the daily AI usage counter</li>
        </ul>
        <p>
          Like most hosting providers, Vercel and Render may keep standard request logs, such as IP
          addresses and timestamps, for security and reliability.
        </p>
      </LegalSection>

      <LegalSection title="your choices">
        <p>
          You can stop using TalkTracker at any time. To delete your account and the email address
          tied to it, or to ask what&rsquo;s stored about you, email <ContactLink />. Requests are
          handled within 30 days.
        </p>
      </LegalSection>

      <LegalSection title="children">
        <p>
          TalkTracker isn&rsquo;t meant for children under 13, and doesn&rsquo;t knowingly collect
          their information.
        </p>
      </LegalSection>

      <LegalSection title="changes and contact">
        <p>
          If this policy changes, the date at the top changes with it. Questions go to{" "}
          <ContactLink />. The rules for using the site are in the{" "}
          <Link href="/terms" className="text-link">
            terms of service
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
