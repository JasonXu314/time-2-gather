type MutatorCallback<T> = import('swr/dist/types').MutatorCallback<T>;

type Friend = Pick<User, '_id' | 'username'>;
type Strength = 'VERY_WEAK' | 'WEAK' | 'REASONABLE' | 'STRONG' | 'VERY_STRONG';
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

declare module 'tai-password-strength' {
	export const commonPasswords: string[];
	export const trigraphs: PasswordStrengthTrigraphMap;

	export class PasswordStrength {
		charsets: PasswordStrengthGroups;
		commonPasswords: null | string[];
		trigraph: null | PasswordStrengthTrigraphMap;

		addCommonPasswords(passwords: string[] | string): this;
		addTrigraphMap(map: PasswordStrengthTrigraphMap): this;
		charsetGroups(password: string): { [key: string]: boolean | string };
		charsetSize(groups: PasswordStrengthGroups): number;
		check(password: string): PasswordStrengthStatistics;
		checkCommonPasswords(password: string): boolean;
		checkTrigraph(password: string, charsetSize: number): number;
		determineStrength(status: PasswordStrengthStatistics): PasswordStrengthCode;
		nistScore(password: string): number;
		otherChars(password: string): string;
		shannonScore(password: string): number;
	}

	export interface PasswordStrengthGroups {
		[key: string]: string;
	}

	export interface PasswordStrengthTrigraphMap {
		[key: string]: number;
	}

	export interface PasswordStrengthStatistics {
		charsetSize: number;
		commonPassword: boolean;
		nistEntropyBits: number;
		passwordLength: number;
		shannonEntropyBits: number;
		strengthCode: PasswordStrengthCode;
		trigraphEntropyBits: null | number;
		charsets: Record<string, string | RegExp>;
	}

	export enum PasswordStrengthCode {
		VERY_WEAK = 'VERY_WEAK',
		WEAK = 'WEAK',
		REASONABLE = 'REASONABLE',
		STRONG = 'STRONG',
		VERY_STRONG = 'VERY_STRONG'
	}
}
