import {
  useEffect,
  useRef,
  useState,
} from "react";

function useFadeIn(duration = 700) {
  const [opacity, setOpacity] = useState(0);

  const animationFrameRef =
    useRef<number | null>(null);

  useEffect(() => {
    let startingTime: number | undefined;

    const animate = (currentTime: number) => {
      if (startingTime === undefined) {
        startingTime = currentTime;
      }

      const progress = Math.min(
        (currentTime - startingTime) / duration,
        1,
      );

      const easedProgress =
        1 - Math.pow(1 - progress, 3);

      setOpacity(easedProgress);

      if (progress < 1) {
        animationFrameRef.current =
          window.requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current =
      window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        );
      }
    };
  }, [duration]);

  return opacity;
}

export default useFadeIn;