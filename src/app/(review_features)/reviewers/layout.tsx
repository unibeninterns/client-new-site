import { AuthProvider } from '@/contexts/AuthContext';

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
      {children}
    </AuthProvider>
  );
}