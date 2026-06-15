"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Loader2 } from "lucide-react";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError("Неверный email или пароль");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="size-16 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-4">
            <Lock className="size-7 text-background" />
          </div>
          <Image
            src="/logo.jpg"
            alt="Долина молока"
            width={100}
            height={40}
            className="h-10 w-auto object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-heading font-bold text-foreground">Панель администратора</h1>
          <p className="text-muted-foreground text-sm mt-1">Введите данные для входа</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="dolinamoloka50@gmail.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="bg-secondary border-border"
              autoFocus
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">Пароль</label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              aria-invalid={!!error}
              className="bg-secondary border-border"
              required
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground hover:bg-foreground/80 text-background gap-2"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Войти
          </Button>
        </form>
      </div>
    </div>
  );
}
