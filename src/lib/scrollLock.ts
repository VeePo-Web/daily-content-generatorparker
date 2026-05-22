let lockCount = 0;
let savedScrollY = 0;

export function lockScroll() {
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    document.documentElement.style.setProperty('--scroll-y', `-${savedScrollY}px`);
    document.documentElement.classList.add('scroll-locked');
  }
  lockCount++;
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.classList.remove('scroll-locked');
    document.documentElement.style.removeProperty('--scroll-y');
    window.scrollTo(0, savedScrollY);
  }
}
