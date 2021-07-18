type MutatorCallback<T> = import('swr/dist/types').MutatorCallback<T>;

type Friend = Pick<User, '_id' | 'username'>;
type Strength = 'Too weak' | 'Weak' | 'Medium' | 'Strong';
type DateString = `${string}-${string}-${string}T${string}:${string}:${string}`;
type AMPM = 'AM' | 'PM';
type Mutator<T> = (data?: T | Promise<T> | MutatorCallback<T> | undefined, shouldRevalidate?: boolean | undefined) => Promise<T | undefined>;

interface User {
	_id: string;
	token: string;
	username: string;
	friends: Friend[];
}

interface DBUser {
	_id: string;
	token: string;
	password: string;
	username: string;
	friends: string[];
	salt: string;
}

interface PostCalendarEvent {
	name: string;
	start: DateString;
	end: DateString;
	description: string;
}

interface TransferCalendarEvent {
	_id: string;
	ownerId: string;
	name: string;
	start: DateString;
	end: DateString;
	description: string;
}

interface CalendarEvent {
	_id: string;
	ownerId: string;
	name: string;
	start: Date;
	end: Date;
	description: string;
}

interface DBCalendarEvent {
	_id: string;
	ownerId: string;
	name: string;
	start: DateString;
	end: DateString;
	description: string;
}

interface EventIdentifier {
	_id: string;
}

interface DropdownOption<T> {
	name: string;
	value: T;
}
