"use client";

import { useMax, useMaxUser } from "@/lib/max";
import { Card, Button, Loading } from "@/components/ui";
import { Navigation } from "@/components/layout/Navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ProfilePage(): React.ReactElement {
  const { isReady, colorScheme, showAlert, showConfirm, showPopup } = useMax();
  const user = useMaxUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isReady) {
      setIsLoading(false);
    }
  }, [isReady]);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const handleShareProfile = (): void => {
    showAlert("Функция поделиться профилем будет доступна в следующей версии");
  };

  const handleEditProfile = (): void => {
    showConfirm("Вы хотите изменить профиль?", (confirmed: boolean) => {
      if (confirmed) {
        showAlert("Редактирование профиля будет доступно в следующей версии");
      }
    });
  };

  const handleSettings = (): void => {
    showPopup(
      {
        title: "Настройки",
        message: "Выберите действие",
        buttons: [
          { id: "notifications", text: "Уведомления", type: "default" },
          { id: "privacy", text: "Приватность", type: "default" },
          { id: "cancel", text: "Отмена", type: "cancel" },
        ],
      },
      (buttonId: string) => {
        if (buttonId === "notifications") {
          showAlert("Настройки уведомлений будут доступны в следующей версии");
        } else if (buttonId === "privacy") {
          showAlert("Настройки приватности будут доступны в следующей версии");
        }
      }
    );
  };

  return (
    <>
      <main
        style={{ backgroundColor: colorScheme.bg_color ?? "#ffffff", color: colorScheme.text_color ?? "#000000" }}
        className="pb-20"
      >
        <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Профиль</h1>
        </div>

        {user ? (
          <div className="space-y-4">
            <Card>
              <div className="flex items-center space-x-4 mb-6">
                {user.photo_url ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden">
                    <Image
                      src={user.photo_url}
                      alt={`${user.first_name ?? ""} ${user.last_name ?? ""}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                    style={{
                      backgroundColor: colorScheme.button_color ?? "#3390ec",
                      color: colorScheme.button_text_color ?? "#ffffff",
                    }}
                  >
                    {user.first_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-semibold">
                    {user.first_name ?? ""} {user.last_name ?? ""}
                  </h2>
                  {user.username && (
                    <p className="opacity-70">@{user.username}</p>
                  )}
                  {user.is_premium && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs rounded bg-yellow-500 text-white">
                      Premium
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div>
                  <strong>ID:</strong> {user.id}
                </div>
                {user.language_code && (
                  <div>
                    <strong>Язык:</strong> {user.language_code.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button onClick={handleEditProfile} fullWidth>
                  Редактировать профиль
                </Button>
                <Button onClick={handleShareProfile} variant="secondary" fullWidth>
                  Поделиться профилем
                </Button>
                <Button onClick={handleSettings} variant="outline" fullWidth>
                  Настройки
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <Card>
            <p className="opacity-80">Информация о пользователе недоступна</p>
          </Card>
        )}
        </div>
      </main>
      <Navigation />
    </>
  );
}

