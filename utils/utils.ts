export function makeStrengthStatus(strength: Strength): string {
	switch (strength) {
		case 'VERY_WEAK':
			return 'Pathetic...';
		case 'WEAK':
			return 'You can do better.';
		case 'REASONABLE':
			return 'Getting there...';
		case 'STRONG':
			return 'Good Enough.';
		case 'VERY_STRONG':
			return 'Excellent!';
	}
}

export function getDays(month: number, year: number): number {
	switch (month + 1) {
		case 1:
		case 3:
		case 5:
		case 7:
		case 8:
		case 10:
		case 12:
			return 31;
		case 4:
		case 6:
		case 9:
		case 11:
			return 30;
		case 2:
			return year % 4 === 0 ? 29 : 28;
		default:
			throw new Error('Invalid month!');
	}
}

export function evtInDay(evt: CalendarEvent, day: Date): boolean {
	return !(evt.end <= day || evt.start.getTime() >= day.getTime() + 86400000);
}

export function padNum(number: number): string {
	return number < 10 ? '0' + number : number.toString();
}

export function parseDate(date: DateString): Date {
	const [datePart, timePart] = date.split('T');
	const [year, month, day] = datePart.split('-').map((value) => parseInt(value));
	const [hours, minutes, seconds] = timePart.split(':').map((value) => parseInt(value));

	return new Date(year, month, day, hours, minutes, seconds);
}

export function getDateString(date: Date): DateString {
	return `${padNum(date.getFullYear())}-${padNum(date.getMonth())}-${padNum(date.getDate())}T${padNum(date.getHours())}:${padNum(
		date.getMinutes()
	)}:${padNum(date.getSeconds())}`;
}

export function makeEvent(start: Date, end: Date, name: string, description: string): PostCalendarEvent {
	if (name.trim().length === 0) {
		throw new Error('Name must not be empty!');
	}
	if (start >= end) {
		throw new Error('Start time must be before end time!');
	}

	return {
		start: getDateString(start),
		end: getDateString(end),
		name,
		description
	};
}
