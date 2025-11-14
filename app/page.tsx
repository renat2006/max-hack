"use client";

import { useMax, useMaxUser } from "@/lib/max";
import { Card, Button, Loading } from "@/components/ui";
import { Navigation } from "@/components/layout/Navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home(): React.ReactElement {
  const { isReady, isAvailable, theme, colorScheme, expand, showAlert } = useMax();
  const user = useMaxUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isReady) {
      setIsLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.backgroundColor = colorScheme.bg_color ?? "#ffffff";
      document.body.style.color = colorScheme.text_color ?? "#000000";
    }
  }, [colorScheme]);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const handleExpand = (): void => {
    expand();
  };

  const handleTestAlert = (): void => {
    showAlert("Это тестовое уведомление от Спутника!");
  };

  return (
    <>
      <main
        style={{ backgroundColor: colorScheme.bg_color ?? "#ffffff", color: colorScheme.text_color ?? "#000000" }}
        className="pb-20"
      >
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Добро пожаловать в Спутник</h1>
            <p className="text-lg opacity-80">Современное мини-приложение для мессенджера Max</p>
          </div>

          {isAvailable ? (
            <div className="space-y-4">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Информация о подключении</h2>
                <div className="space-y-2">
                  <p>
                    <strong>Статус:</strong> Подключено к Max
                  </p>
                  <p>
                    <strong>Тема:</strong> {theme === "light" ? "Светлая" : "Тёмная"}
                  </p>
                  {user && (
                    <>
                      <p>
                        <strong>Пользователь:</strong> {user.first_name} {user.last_name ?? ""}
                      </p>
                      {user.username && (
                        <p>
                          <strong>Username:</strong> @{user.username}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
                <div className="space-y-3">
                  <Button onClick={handleExpand} fullWidth>
                    Развернуть приложение
                  </Button>
                  <Button onClick={handleTestAlert} variant="secondary" fullWidth>
                    Показать уведомление
                  </Button>
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-semibold mb-4">Разделы приложения</h2>
                <div className="space-y-3">
                  <Link href="/profile">
                    <Button variant="outline" fullWidth>
                      Профиль пользователя
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button variant="outline" fullWidth>
                      Возможности MAX API
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          ) : (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Приложение не запущено в Max</h2>
              <p className="opacity-80">Для полной функциональности откройте это приложение через мессенджер Max.</p>
            </Card>
          )}
        </div>
      </main>
      <Navigation />
    </>
  );
}
