# Lottie Animation Module

Best practice модуль для работы с Lottie анимациями в Next.js приложении.

## 📦 Установка

Модуль уже установлен с зависимостью `lottie-react`.

## 🚀 Быстрый старт

### Базовое использование

```tsx
import { LottieAnimation } from "@/lib/lottie";
import animationData from "@/public/lottie/loading/spinner.json";

function MyComponent() {
  return (
    <LottieAnimation
      animationData={animationData}
      loop
      autoplay
      width={200}
      height={200}
    />
  );
}
```

### С управлением через хук

```tsx
import { LottieAnimation, useLottie } from "@/lib/lottie";
import animationData from "@/public/lottie/success/checkmark.json";

function MyComponent() {
  const { lottieRef, play, pause, stop } = useLottie({
    autoplay: false,
    loop: false,
  });

  return (
    <div>
      <LottieAnimation
        animationData={animationData}
        lottieRef={lottieRef}
        width={200}
        height={200}
      />
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### С встроенными контролами

```tsx
import { LottiePlayer } from "@/lib/lottie";
import animationData from "@/public/lottie/illustrations/robot.json";

function MyComponent() {
  return (
    <LottiePlayer
      animationData={animationData}
      showControls
      controlPosition="bottom"
      clickToPause
      loop
      width={300}
      height={300}
    />
  );
}
```

## 🎨 Пресеты

Используйте готовые настройки для типичных случаев:

```tsx
import { LottieAnimation, getPresetConfig } from "@/lib/lottie";
import loadingAnimation from "@/public/lottie/loading.json";

function LoadingState() {
  const config = getPresetConfig("loading");

  return (
    <LottieAnimation
      animationData={loadingAnimation}
      {...config}
    />
  );
}
```

Доступные пресеты:
- `loading` - для индикаторов загрузки
- `success` - для успешных действий
- `error` - для ошибок
- `warning` - для предупреждений
- `info` - для информационных сообщений
- `celebration` - для празднований
- `empty-state` - для пустых состояний
- `interactive` - для интерактивных элементов

## 🔧 Утилиты

### Валидация данных

```tsx
import { isValidLottieData, getAnimationMetadata } from "@/lib/lottie";

const data = await fetch("/lottie/animation.json").then(r => r.json());

if (isValidLottieData(data)) {
  const metadata = getAnimationMetadata(data);
  console.log(`Duration: ${metadata.duration}s`);
  console.log(`Frames: ${metadata.totalFrames}`);
}
```

### Предзагрузка анимаций

```tsx
import { preloadAnimations } from "@/lib/lottie";

const animations = await preloadAnimations([
  "/lottie/loading.json",
  "/lottie/success.json",
  "/lottie/error.json",
]);
```

### Ленивая загрузка

```tsx
import { LottieAnimation, useLazyLottie } from "@/lib/lottie";

function MyComponent() {
  const { animationData, isLoading, loadAnimation } = useLazyLottie(
    "/lottie/heavy-animation.json"
  );

  useEffect(() => {
    loadAnimation();
  }, [loadAnimation]);

  if (isLoading) return <div>Loading animation...</div>;

  return <LottieAnimation animationData={animationData} />;
}
```

## 🎯 Продвинутое использование

### Управление сегментами

```tsx
import { LottieAnimation, createSegments } from "@/lib/lottie";

function SegmentedAnimation() {
  const segments = createSegments([[0, 2], [3, 5]], 30); // 30fps

  return (
    <LottieAnimation
      animationData={animationData}
      segments={segments}
      loop={false}
    />
  );
}
```

### Оптимизация производительности

```tsx
import { LottieAnimation, PERFORMANCE_RENDERER_SETTINGS } from "@/lib/lottie";

function HighPerformanceAnimation() {
  return (
    <LottieAnimation
      animationData={animationData}
      rendererSettings={PERFORMANCE_RENDERER_SETTINGS}
      loop
    />
  );
}
```

### События анимации

```tsx
import { LottieAnimation } from "@/lib/lottie";

function AnimationWithEvents() {
  return (
    <LottieAnimation
      animationData={animationData}
      onComplete={() => console.log("Animation completed")}
      onLoopComplete={() => console.log("Loop completed")}
      onEnterFrame={() => console.log("Frame entered")}
      loop
    />
  );
}
```

## 📱 Адаптивность

```tsx
import { LottieAnimation, calculateDimensions } from "@/lib/lottie";

function ResponsiveAnimation() {
  const dimensions = calculateDimensions(800, 600, 400); // max width 400px

  return (
    <LottieAnimation
      animationData={animationData}
      width={dimensions.width}
      height={dimensions.height}
    />
  );
}
```

## 🎭 Интерактивность

### Пауза при наведении

```tsx
import { LottiePlayer } from "@/lib/lottie";

function HoverAnimation() {
  return (
    <LottiePlayer
      animationData={animationData}
      hoverToPause
      loop
    />
  );
}
```

### Клик для управления

```tsx
import { LottiePlayer } from "@/lib/lottie";

function ClickableAnimation() {
  return (
    <LottiePlayer
      animationData={animationData}
      clickToPause
      loop
    />
  );
}
```

## 📊 API Reference

### LottieAnimation Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animationData` | `LottieAnimationData` | - | JSON данные анимации |
| `path` | `string` | - | Путь к JSON файлу |
| `loop` | `boolean \| number` | `true` | Зацикливание анимации |
| `autoplay` | `boolean` | `true` | Автоматический старт |
| `speed` | `number` | `1` | Скорость воспроизведения |
| `isPaused` | `boolean` | `false` | Пауза анимации |
| `isStopped` | `boolean` | `false` | Остановка анимации |
| `width` | `number \| string` | `"100%"` | Ширина |
| `height` | `number \| string` | `"100%"` | Высота |

### useLottie Hook

Возвращает объект с методами управления:

- `play()` - запустить анимацию
- `pause()` - поставить на паузу
- `stop()` - остановить и сбросить
- `setSpeed(speed)` - изменить скорость
- `setDirection(direction)` - изменить направление (1 или -1)
- `goToAndStop(frame)` - перейти к кадру и остановиться
- `goToAndPlay(frame)` - перейти к кадру и начать воспроизведение
- `playSegments(segments, force)` - воспроизвести сегменты
- `getDuration(inFrames)` - получить длительность

## 🎨 Где брать анимации

1. **LottieFiles** - https://lottiefiles.com/
2. **IconScout** - https://iconscout.com/lottie-animations
3. **Lottie Lab** - https://lottielab.com/

## ⚡ Best Practices

1. **Размер файлов**: держите анимации < 500KB
2. **Оптимизация**: используйте `optimizeAnimationData()` для крупных файлов
3. **Lazy Loading**: загружайте тяжелые анимации по требованию
4. **Мобильные устройства**: проверяйте `isMobileFriendly()` для адаптивности
5. **Производительность**: для сложных анимаций используйте canvas renderer
6. **Кеширование**: храните JSON в `/public/lottie/` для статического кеширования
7. **Типизация**: всегда используйте TypeScript типы из модуля

## 📝 Примеры использования

См. примеры в директории `/public/lottie/README.md`

## 🔍 Troubleshooting

### Анимация не отображается

1. Проверьте валидность JSON: `isValidLottieData(data)`
2. Убедитесь, что путь к файлу правильный
3. Проверьте консоль на ошибки

### Плохая производительность

1. Используйте `PERFORMANCE_RENDERER_SETTINGS`
2. Оптимизируйте JSON: `optimizeAnimationData(data)`
3. Уменьшите размер анимации
4. Используйте `loop: false` где возможно

### Проблемы с размерами

1. Используйте `calculateDimensions()` для правильных пропорций
2. Задавайте явные width/height
3. Проверьте оригинальные размеры через `getAnimationMetadata()`
