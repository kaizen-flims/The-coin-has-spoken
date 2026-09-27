export function attachGesture(button, onToss) {
  let down = null;
  let lastPointerUp = 0;
  button.addEventListener('pointerdown', e => {
    if (button.disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
    down = { id: e.pointerId, x: e.clientX, y: e.clientY, time: performance.now() };
    button.setPointerCapture(e.pointerId);
    button.classList.add('touched');
  });
  button.addEventListener('pointerup', e => {
    if (!down || down.id !== e.pointerId) return;
    const dy = down.y - e.clientY;
    const dx = Math.abs(down.x - e.clientX);
    const dt = Math.max(16, performance.now() - down.time);
    down = null;
    lastPointerUp = performance.now();
    button.classList.remove('touched');
    if (button.disabled) return;
    const swipe = dy > 30 && dy > dx * .7 && dy / dt > .16;
    onToss(swipe ? Math.min(1, Math.max(0, (dy - 30) / 170 + (dy / dt - .16) / 2.5)) : 0);
  });
  button.addEventListener('pointercancel', () => { down = null; button.classList.remove('touched'); });
  button.addEventListener('click', e => {
    // Keyboard / assistive activation produces click without a pointer sequence.
    if (e.detail === 0 && performance.now() - lastPointerUp > 80) onToss(0);
  });
}
