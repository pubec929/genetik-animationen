// Only replace frame scheduling; production animation state stays private.
async function installAnimationClock(page) {
  await page.addInitScript(() => {
    let now = 1000, next = 0;
    const callbacks = new Map();
    window.requestAnimationFrame = callback => { callbacks.set(++next, callback); return next; };
    window.cancelAnimationFrame = id => callbacks.delete(id);
    window.pendingAnimationFrames = () => callbacks.size;
    window.advanceAnimation = milliseconds => {
      for (let elapsed = 0; elapsed < milliseconds; elapsed += 50) {
        now += Math.min(50, milliseconds - elapsed);
        const pending = [...callbacks.values()];
        callbacks.clear();
        pending.forEach(callback => callback(now));
      }
    };
  });
}

module.exports = { installAnimationClock };
