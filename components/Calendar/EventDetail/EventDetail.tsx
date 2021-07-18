import Button from '../../Button/Button';
import styles from './EventDetail.module.scss';

interface Props {
	event: CalendarEvent;
	edit: () => void;
	del: () => void;
}

const EventDetail: React.FC<Props> = ({ event, edit, del }) => {
	return (
		<div className={styles.main}>
			<h4 className={styles.name}>{event.name}</h4>
			<p className={styles.desc}>{event.description}</p>
			<p>
				Start: {event.start.toLocaleDateString()} {event.start.toLocaleTimeString()}
			</p>
			<p>
				End: {event.end.toLocaleDateString()} {event.end.toLocaleTimeString()}
			</p>
			<Button onClick={edit}>Edit</Button>
			<Button onClick={del}>Delete</Button>
		</div>
	);
};

export default EventDetail;
