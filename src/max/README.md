# Telegram Notification System

Система красивых уведомлений для Telegram бота с динамическими SVG-картинками.

## Структура

- `notification-config.ts` - конфигурация всех сообщений и достижений
- `notification-service.ts` - сервис отправки уведомлений
- `image-generator.ts` - генерация SVG-изображений
- `/app/api/telegram/image/route.ts` - API endpoint для картинок

## Использование

### Базовое уведомление

```typescript
import { sendNotification } from "@/lib/telegram/notification-service";

await sendNotification({
  chatId: userId,
  type: "game_complete",
  params: {
    score: 25,
    totalScore: 150,
  },
});
```

### Типы уведомлений

1. **first_game** - первая игра пользователя
2. **game_complete** - завершение игры
3. **score_milestone** - достижение вехи по очкам (10, 50, 100, 250, 500, 1000)
4. **streak_milestone** - серия побед
5. **achievement_unlock** - разблокировка достижения
6. **leaderboard_rank** - новая позиция в рейтинге
7. **daily_reminder** - ежедневное напоминание

### Достижения

```typescript
await sendNotification({
  chatId: userId,
  type: "achievement_unlock",
  achievementId: "perfectionist",
  withImage: true,
});
```

Доступные достижения:

- `first_steps` - первая игра
- `speed_demon` - рекордное время
- `perfectionist` - 100% точность
- `night_owl` - игра после полуночи
- `dedication` - 7 дней подряд
- `century` - 100+ очков
- `top_ten` - топ-10 рейтинга
- `champion` - 1 место

### Картинки

Картинки генерируются автоматически для типов:

- `achievement` - достижения
- `stats` - статистика
- `streak` - серия побед
- `rank` - позиция в рейтинге

Пример:

```
https://your-app.com/api/telegram/image?type=stats&data={"score":150,"totalGames":20,"accuracy":85}
```

## Конфигурация

Добавь в `.env.local`:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
NEXT_PUBLIC_APP_URL=https://t.me/your_bot/app
```

## Редактирование сообщений

Все тексты находятся в `notification-config.ts`:

```typescript
export const NOTIFICATIONS: Record<NotificationType, NotificationTemplate> = {
  first_game: {
    title: '🎮 Первая игра!',
    message: 'Отличное начало! Ты только что завершил свою первую мини-игру.',
    emoji: '🎮',
    withImage: true,
    imageType: 'achievement',
  },
  ...
}
```

Переменные в сообщениях:

- `{score}` - очки
- `{totalScore}` - общий счёт
- `{streakDays}` - дней подряд
- `{rank}` - место в рейтинге
- `{achievementName}` - название достижения
- `{achievementDescription}` - описание достижения

## Кнопки

Кнопки добавляются автоматически в зависимости от типа уведомления:

```typescript
export const BUTTON_LABELS = {
  play_now: "🎮 Играть сейчас",
  view_stats: "📊 Статистика",
  leaderboard: "🏆 Рейтинг",
  share: "📤 Поделиться",
};
```

## Batch отправка

Для массовой рассылки:

```typescript
import { sendBatchNotifications } from "@/lib/telegram/notification-service";

await sendBatchNotifications([
  { chatId: user1, type: "daily_reminder" },
  { chatId: user2, type: "daily_reminder" },
]);
```

Задержка между сообщениями: 50ms (защита от rate limit).
