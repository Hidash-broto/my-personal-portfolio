const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Menu bar clock: "Sun 1 Nov  2:13 PM" (two non-breaking spaces before the time). */
export function formatClock(date: Date): string {
    const h24 = date.getHours();
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const mm = String(date.getMinutes()).padStart(2, "0");
    const meridiem = h24 < 12 ? "AM" : "PM";
    return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}  ${h12}:${mm} ${meridiem}`;
}

/** Milliseconds until the next minute boundary. */
export function msToNextMinute(date: Date): number {
    return 60_000 - (date.getSeconds() * 1000 + date.getMilliseconds());
}
