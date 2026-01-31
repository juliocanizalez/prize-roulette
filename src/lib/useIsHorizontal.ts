import { useState, useEffect } from 'react';

const MQ_WIDTH = '(min-width: 768px)';
const MQ_ASPECT = '(min-aspect-ratio: 4/3)';

export function useIsHorizontal(): boolean {
  const [horizontal, setHorizontal] = useState(false);

  useEffect(() => {
    const mqWidth = window.matchMedia(MQ_WIDTH);
    const mqAspect = window.matchMedia(MQ_ASPECT);

    function update() {
      setHorizontal(mqWidth.matches || mqAspect.matches);
    }

    update();
    mqWidth.addEventListener('change', update);
    mqAspect.addEventListener('change', update);

    return () => {
      mqWidth.removeEventListener('change', update);
      mqAspect.removeEventListener('change', update);
    };
  }, []);

  return horizontal;
}
