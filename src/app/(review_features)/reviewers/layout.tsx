import { AuthProvider } from '@/contexts/AuthContext';
// Removed ReviewerLayout import as it will be applied in individual pages or a nested layout

export const metadata = {
    title: "Reviewers Section",
    description: "Follow this link to start reviewing proposals."
};

export default function ReviewersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider userType="reviewer">
      {/* ReviewerLayout is applied in protected pages, not here */}
      {children}
    </AuthProvider>
  );
}
