import Link from 'next/link';
import AdminLoginForm from './AdminLoginForm';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-brand-pink/30 bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-center text-2xl font-bold text-brand-dark">
            Admin Login
          </h1>
          <AdminLoginForm />
          <div className="mt-6 text-center">
            <Link
              href="/lv"
              className="text-sm text-brand-grey transition-colors hover:text-brand-dark"
            >
              &larr; Back to catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
