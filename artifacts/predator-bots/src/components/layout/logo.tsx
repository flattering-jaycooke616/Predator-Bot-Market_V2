export default function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A0A0F" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 6H11C13.2091 6 15 7.79086 15 10C15 12.2091 13.2091 14 11 14H9V18H6V6Z" fill="currentColor" />
      <path d="M9 9H10.5C11.3284 9 12 9.67157 12 10.5C12 11.3284 11.3284 12 10.5 12H9V9Z" fill="#0A0A0F" />
      <path d="M16 6L19 9L16 12V6Z" fill="currentColor" opacity="0.5" />
      <path d="M16 12L19 15L16 18V12Z" fill="currentColor" opacity="0.25" />
    </svg>
  );
}
