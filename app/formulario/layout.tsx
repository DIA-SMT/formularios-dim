export default function FormularioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="theme-public min-h-screen bg-background">{children}</div>;
}
