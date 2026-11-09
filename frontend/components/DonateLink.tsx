export const DONATE_URL = "https://ko-fi.com/zuuhaib";

// The button that goes to Ko-fi, in a new tab so results stay open.
export default function DonateLink({ className = "" }: { className?: string }) {
  return (
    <a href={DONATE_URL} target="_blank" rel="noopener noreferrer" className={`send send-accent text-lg ${className}`}>
      pls donate
    </a>
  );
}
