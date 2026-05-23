function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function generateDailyColors(): string[] {
  const colors: string[] = [];
  const basePalette = [
    '8B1A1A', '2A9D8F', 'E9C46A', '264653', 'F4A261', '457B9D', 'E63946', '06D6A0',
    '118AB2', 'FFB703', 'FB8500', '8338EC', '3A86FF', 'FF006E', 'B5179E', '560BAD',
    '0077B6', '00B4D8', '90E0EF', '023E8A', 'D62828', 'F77F00', 'FCBF49', 'EAE2B7',
    '606C38', '283618', 'FEFAE0', 'DDA15E', 'BC6C25', 'CDB4DB', 'FFC8DD', 'FFAFCC',
  ];

  for (let i = 0; i < 365; i++) {
    if (i < basePalette.length) {
      colors.push(basePalette[i]);
      continue;
    }
    const hue = Math.round((i * 137.508) % 360);
    const sat = 45 + (i % 5) * 8;
    const light = 38 + (Math.floor(i / 7) % 6) * 5;
    colors.push(hslToHex(hue, sat, light));
  }

  return colors;
}

export const DAILY_COLORS: readonly string[] = generateDailyColors();
