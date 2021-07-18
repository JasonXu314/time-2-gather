import styles from './EventBanner.module.scss';

interface Props {
	event: CalendarEvent;
	openDetails: () => void;
}

const EventBanner: React.FC<Props> = ({ event, openDetails }) => {
	return (
		<div className={styles.main} onClick={openDetails}>
			{event.name}
		</div>
	);
};

export default EventBanner;
