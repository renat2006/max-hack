"use client";

import { useMax } from "@/lib/max";
import { Card, Button, Loading } from "@/components/ui";
import { Navigation } from "@/components/layout/Navigation";
import { useEffect, useState } from "react";

export default function FeaturesPage(): React.ReactElement {
  const { isReady, colorScheme, expand, showAlert, showConfirm, showPopup, openLink, sendData } = useMax();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isReady) {
      setIsLoading(false);
    }
  }, [isReady]);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const handleExpand = (): void => {
    expand();
  };

  const handleTestAlert = (): void => {
    showAlert("Это тестовое уведомление от Спутника!");
  };

  const handleTestConfirm = (): void => {
    showConfirm("Вы уверены, что хотите выполнить это действие?", (confirmed: boolean) => {
      if (confirmed) {
        showAlert("Действие подтверждено!");
      } else {
        showAlert("Действие отменено");
      }
    });
  };

  const handleTestPopup = (): void => {
    showPopup(
      {
        title: "Выберите действие",
        message: "Что вы хотите сделать?",
        buttons: [
          { id: "option1", text: "Вариант 1", type: "default" },
          { id: "option2", text: "Вариант 2", type: "default" },
          { id: "cancel", text: "Отмена", type: "cancel" },
        ],
      },
      (buttonId: string) => {
        showAlert(`Выбран вариант: ${buttonId}`);
      }
    );
  };

  const handleOpenLink = (): void => {
    openLink("https://max.mail.ru", { try_instant_view: true });
  };

  const handleSendData = (): void => {
    sendData(JSON.stringify({ action: "test", timestamp: Date.now() }));
    showAlert("Данные отправлены!");
  };

  const features = [
    {
      title: "Развернуть приложение",
      description: "Развернуть приложение на весь экран",
      action: handleExpand,
      variant: "primary" as const,
    },
    {
      title: "Показать уведомление",
      description: "Демонстрация функции showAlert",
      action: handleTestAlert,
      variant: "secondary" as const,
    },
    {
      title: "Подтверждение действия",
      description: "Демонстрация функции showConfirm",
      action: handleTestConfirm,
      variant: "secondary" as const,
    },
    {
      title: "Всплывающее окно",
      description: "Демонстрация функции showPopup",
      action: handleTestPopup,
      variant: "secondary" as const,
    },
    {
      title: "Открыть ссылку",
      description: "Открыть внешнюю ссылку через MAX",
      action: handleOpenLink,
      variant: "outline" as const,
    },
    {
      title: "Отправить данные",
      description: "Отправить данные обратно в бота",
      action: handleSendData,
      variant: "outline" as const,
    },
  ];

  return (
    <>
      <main
        style={{ backgroundColor: colorScheme.bg_color ?? "#ffffff", color: colorScheme.text_color ?? "#000000" }}
        className="pb-20"
      >
        <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Возможности MAX API</h1>
          <p className="text-lg opacity-80">
            Демонстрация всех доступных функций платформы Max
          </p>
        </div>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <Card key={index}>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="opacity-70 mb-4">{feature.description}</p>
              <Button onClick={feature.action} variant={feature.variant} fullWidth>
                Попробовать
              </Button>
            </Card>
          ))}
        </div>
        </div>
      </main>
      <Navigation />
    </>
  );
}

