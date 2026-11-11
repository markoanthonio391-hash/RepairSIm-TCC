let ctx = null;

function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

function beep({ freq = 600, endFreq, duration = 0.08, type = 'sine', volume = 0.2, delay = 0 }) {
    const ac = getCtx();
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration);

    const v = Math.max(volume, 0.0002); // rampa exponencial que não permite zero
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(v, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
}

export const sounds = {
    click: (v) => {
        beep({ freq: 1000, endFreq: 650, duration: 0.06, type: 'square', volume: 0.10 * v });
        beep({ freq: 2000, endFreq: 1500, duration: 0.03, type: 'sine', volume: 0.06 * v });
    },
    hover: (v) => {
        beep({ freq: 1400, duration: 0.025, type: 'sine', volume: 0.035 * v });
    },
    back: (v) => {
        beep({ freq: 700, endFreq: 350, duration: 0.12, type: 'triangle', volume: 0.18 * v });
    },
    toggle: (v) => {
        beep({ freq: 900, duration: 0.05, type: 'square', volume: 0.08 * v });
        beep({ freq: 1200, duration: 0.07, type: 'square', volume: 0.08 * v, delay: 0.06 });
    },
    success: (v) => {
        beep({ freq: 660, duration: 0.10, type: 'sine', volume: 0.20 * v });
        beep({ freq: 880, duration: 0.10, type: 'sine', volume: 0.20 * v, delay: 0.10 });
        beep({ freq: 1320, duration: 0.20, type: 'sine', volume: 0.20 * v, delay: 0.20 });
    },
    error: (v) => {
        beep({ freq: 220, endFreq: 110, duration: 0.28, type: 'sawtooth', volume: 0.15 * v });
    },
};
