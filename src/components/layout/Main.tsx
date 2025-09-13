import type { HTMLAttributes, ReactNode } from "react";

const Main = ({
  children,
}: { children: ReactNode } & HTMLAttributes<HTMLElement>) => {
  return (
    <main className="flex-1 bg-white dark:bg-muted-900 pt-16 md:pt-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">{children}</div>
    </main>
  );
};

export default Main;
