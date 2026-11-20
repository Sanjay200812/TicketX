import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-32 text-center">
      <p className="font-mono text-sm text-marquee">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">This screen is dark</h1>
      <p className="mt-2 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="mt-6 inline-flex h-10 items-center rounded-lg bg-marquee px-5 text-sm font-semibold text-white hover:bg-marquee-deep">
        Back to home
      </Link>
    </div>
  );
}
