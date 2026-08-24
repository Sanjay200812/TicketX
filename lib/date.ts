export function getIndiaCurrentDateStr(offsetDays: number = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d);
}

export function getTodayDateStr(): string {
  return getIndiaCurrentDateStr(0);
}

export function getTomorrowDateStr(): string {
  return getIndiaCurrentDateStr(1);
}

export function getNextDayDateStr(): string {
  return getIndiaCurrentDateStr(2);
}

export function getThreeDynamicDates(): { dateStr: string; label: string; subLabel: string }[] {
  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();
  const nextDayStr = getNextDayDateStr();

  const parseSafe = (str: string) => new Date(`${str}T12:00:00`);

  const formatSubLabel = (str: string) => {
    const d = parseSafe(str);
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    return `${weekday}, ${day} ${month}`;
  };

  return [
    {
      dateStr: todayStr,
      label: 'Today',
      subLabel: formatSubLabel(todayStr),
    },
    {
      dateStr: tomorrowStr,
      label: 'Tomorrow',
      subLabel: formatSubLabel(tomorrowStr),
    },
    {
      dateStr: nextDayStr,
      label: parseSafe(nextDayStr).toLocaleDateString('en-US', { weekday: 'short' }),
      subLabel: `${parseSafe(nextDayStr).getDate()} ${parseSafe(nextDayStr).toLocaleDateString('en-US', { month: 'short' })}`,
    },
  ];
}
