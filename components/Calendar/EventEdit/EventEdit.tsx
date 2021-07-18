import axios, { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { getDateString, padNum } from '../../../utils/utils';
import Button from '../../Button/Button';
import Dropdown from '../../Dropdown/Dropdown';
import Input from '../../Input/Input';
import styles from './EventEdit.module.scss';

const monthOptions = [
	{ name: 'January', value: 0 },
	{ name: 'February', value: 1 },
	{ name: 'March', value: 2 },
	{ name: 'April', value: 3 },
	{ name: 'May', value: 4 },
	{ name: 'June', value: 5 },
	{ name: 'July', value: 6 },
	{ name: 'August', value: 7 },
	{ name: 'September', value: 8 },
	{ name: 'October', value: 9 },
	{ name: 'November', value: 10 },
	{ name: 'December', value: 11 }
];

const ampmOptions = [
	{ name: 'AM', value: 'AM' },
	{ name: 'PM', value: 'PM' }
] as DropdownOption<AMPM>[];

interface Props {
	event: CalendarEvent;
	mutator: Mutator<CalendarEvent[]>;
	revalidator: () => Promise<boolean>;
	close: () => void;
}

const EventEdit: React.FC<Props> = ({ event, mutator, revalidator, close }) => {
	const [eventName, setEventName] = useState<string>(event.name);
	const [eventDescription, setEventDescription] = useState<string>(event.description);
	const [startYear, setStartYear] = useState<number>(event.start.getFullYear());
	const [startMonth, setStartMonth] = useState<number>(event.start.getMonth());
	const [startDay, setStartDay] = useState<number>(event.start.getDate());
	const [startHour, setStartHour] = useState<number>(event.start.getHours() % 12);
	const [startMinute, setStartMinute] = useState<number>(event.start.getMinutes());
	const [startAmPm, setStartAmPm] = useState<AMPM>(event.start.getHours() >= 12 ? 'PM' : 'AM');
	const [endYear, setEndYear] = useState<number>(event.end.getFullYear());
	const [endMonth, setEndMonth] = useState<number>(event.end.getMonth());
	const [endDay, setEndDay] = useState<number>(event.end.getDate());
	const [endHour, setEndHour] = useState<number>(event.end.getHours() % 12);
	const [endMinute, setEndMinute] = useState<number>(event.end.getMinutes());
	const [endAmPm, setEndAmPm] = useState<AMPM>(event.end.getHours() >= 12 ? 'PM' : 'AM');
	const [eventError, setEventError] = useState<string | null>(null);

	const tryEdit = useCallback(() => {
		setEventError(null);
		try {
			const start = new Date(startYear, startMonth, startDay, startAmPm === 'AM' ? startHour : startHour + 12, startMinute);
			const end = new Date(endYear, endMonth, endDay, endAmPm === 'AM' ? endHour : endHour + 12, endMinute);
			const edits: Partial<TransferCalendarEvent> = { _id: event._id };

			if (eventName !== event.name) {
				edits.name = eventName;
			}
			if (eventDescription !== event.description) {
				edits.description = eventDescription;
			}
			if (start.getTime() !== event.start.getTime()) {
				edits.start = getDateString(start);
			}
			if (end.getTime() !== event.end.getTime()) {
				edits.end = getDateString(end);
			}

			axios
				.patch<EventUpdateSuccesResponse>('/api/events', edits)
				.then(() => {
					revalidator();
					close();
				})
				.catch((err: AxiosError<EventUpdateFailureResponse>) => {
					if (err.response) {
						console.log(err.response.data);
						setEventError(err.response.data.reason);
					}
					console.log(err);
					throw new Error('Unknown error occured');
				});
			mutator((events) => events?.map((oldEvt) => (oldEvt._id !== event._id ? oldEvt : { ...oldEvt, ...edits, start, end })));
		} catch (err) {
			setEventError(err.message);
		}
	}, [
		endAmPm,
		endDay,
		endHour,
		endMinute,
		endMonth,
		endYear,
		eventDescription,
		eventName,
		startAmPm,
		startDay,
		startHour,
		startMinute,
		startMonth,
		startYear,
		mutator,
		revalidator,
		close,
		event
	]);

	return (
		<div className={styles.main}>
			<h4>Edit Event</h4>
			<Input
				onChange={(evt) => {
					setEventName(evt.target.value);
				}}
				label="Event Name"
				value={eventName}
			/>
			<h4>Description</h4>
			<textarea onChange={(evt) => setEventDescription(evt.target.value)} value={eventDescription}></textarea>
			<div className={styles.row}>
				<h4>Starts</h4>
				<Input
					className={styles.year}
					onChange={(evt) => {
						setStartYear(parseInt(evt.target.value));
					}}
					label="YYYY"
					value={startYear}
				/>
				<Dropdown
					options={monthOptions}
					onChange={(evt) => {
						setStartMonth(parseInt(evt.target.value));
					}}
					value={startMonth}
					className={styles.month}
				/>
				<Input
					className={styles.day}
					onChange={(evt) => {
						setStartDay(parseInt(evt.target.value));
					}}
					label="DD"
					value={startDay}
				/>
				<Input
					className={styles.hour}
					onChange={(evt) => {
						setStartHour(parseInt(evt.target.value));
					}}
					label="Hour"
					value={padNum(startHour)}
				/>
				<span className={styles.colon}>:</span>
				<Input
					className={styles.minute}
					onChange={(evt) => {
						setStartMinute(parseInt(evt.target.value));
					}}
					label="Minute"
					value={padNum(startMinute)}
				/>
				<Dropdown
					options={ampmOptions}
					onChange={(evt) => {
						setStartAmPm(evt.target.value as AMPM);
					}}
					value={startAmPm}
				/>
			</div>
			<div className={styles.row}>
				<h4>Ends</h4>
				<Input
					className={styles.year}
					onChange={(evt) => {
						setEndYear(parseInt(evt.target.value));
					}}
					label="YYYY"
					value={endYear}
				/>
				<Dropdown
					options={monthOptions}
					onChange={(evt) => {
						setEndMonth(parseInt(evt.target.value));
					}}
					value={endMonth}
					className={styles.month}
				/>
				<Input
					className={styles.day}
					onChange={(evt) => {
						setEndDay(parseInt(evt.target.value));
					}}
					label="DD"
					value={endDay}
				/>
				<Input
					className={styles.hour}
					onChange={(evt) => {
						setEndHour(parseInt(evt.target.value));
					}}
					label="Hour"
					value={padNum(endHour)}
				/>
				<span className={styles.colon}>:</span>
				<Input
					className={styles.minute}
					onChange={(evt) => {
						setEndMinute(parseInt(evt.target.value));
					}}
					label="Minute"
					value={padNum(endMinute)}
				/>
				<Dropdown
					options={ampmOptions}
					onChange={(evt) => {
						setEndAmPm(evt.target.value as AMPM);
					}}
					value={endAmPm}
				/>
			</div>
			{eventError && <div className={styles.error}>{eventError}</div>}
			<Button onClick={tryEdit}>Save</Button>
			<Button
				onClick={() => {
					axios
						.delete<EventDeleteSuccessResponse>('/api/events', { data: { _id: event._id } })
						.then(() => {
							revalidator();
							close();
						})
						.catch((err: AxiosError<EventCreateFailureResponse>) => {
							if (err.response) {
								console.log(err.response.data);
								throw err.response.data.reason;
							}
							console.log(err);
							throw 'Unknown error occured';
						});
					mutator((events) => events?.filter((evt) => evt._id !== event._id));
				}}>
				Delete
			</Button>
		</div>
	);
};

export default EventEdit;
