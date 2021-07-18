import { useMemo, useState } from 'react';
import { makeEvent, padNum } from '../../utils/utils';
import Button from '../Button/Button';
import Dropdown from '../Dropdown/Dropdown';
import Input from '../Input/Input';
import styles from './EventMenu.module.scss';

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
	submitEvent: (event: PostCalendarEvent) => Promise<void>;
	close: () => void;
}

const EventMenu: React.FC<Props> = ({ submitEvent, close }) => {
	const today = useMemo(() => new Date(), []);
	const [eventName, setEventName] = useState<string>('');
	const [eventDescription, setEventDescription] = useState<string>('');
	const [startYear, setStartYear] = useState<number>(today.getFullYear());
	const [startMonth, setStartMonth] = useState<number>(today.getMonth());
	const [startDay, setStartDay] = useState<number>(today.getDate());
	const [startHour, setStartHour] = useState<number>(0);
	const [startMinute, setStartMinute] = useState<number>(0);
	const [startAmPm, setStartAmPm] = useState<AMPM>('AM');
	const [endYear, setEndYear] = useState<number>(today.getFullYear());
	const [endMonth, setEndMonth] = useState<number>(today.getMonth());
	const [endDay, setEndDay] = useState<number>(today.getDate());
	const [endHour, setEndHour] = useState<number>(0);
	const [endMinute, setEndMinute] = useState<number>(0);
	const [endAmPm, setEndAmPm] = useState<AMPM>('AM');
	const [eventError, setEventError] = useState<string | null>(null);

	return (
		<div className={styles.main}>
			<h4>Create Event</h4>
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
			<Button
				onClick={() => {
					setEventError(null);

					try {
						const start = new Date(startYear, startMonth, startDay, startAmPm === 'AM' ? startHour : startHour + 12, startMinute);
						const end = new Date(endYear, endMonth, endDay, endAmPm === 'AM' ? endHour : endHour + 12, endMinute);
						const event = makeEvent(start, end, eventName, eventDescription);

						submitEvent(event)
							.then(() => {
								close();
							})
							.catch((err: string) => {
								setEventError(err);
							});
					} catch (err) {
						setEventError(err.message);
					}
				}}>
				Create!
			</Button>
			<Button
				onClick={() => {
					close();
				}}>
				Cancel
			</Button>
			{eventError && <div className={styles.error}>{eventError}</div>}
		</div>
	);
};

export default EventMenu;
