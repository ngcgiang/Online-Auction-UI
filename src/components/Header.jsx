import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-foreground">Auction</h1>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost">Đăng nhập</Button>
            <Button variant="default">Đăng ký</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
