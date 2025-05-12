import { ReactNode } from "react";

interface LayoutProps {
    children: ReactNode;
}

export const metadata = {
    title: "Reviewers Section",
    description: "Follow this link to start reviewing proposals."
};

export default function Layout({ children }: LayoutProps) {
    return <>{children}</>;
}
