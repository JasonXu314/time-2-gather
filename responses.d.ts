type SignupResponse = SignupSuccessResponse | SignupFailureResponse;
type SigninResponse = SigninSuccessResponse | SigninFailureResponse;
type EventsIndexResponse =
	| EventsIndexSuccessResponse
	| EventCreateSuccessResponse
	| EventUpdateSuccesResponse
	| EventDeleteSuccessResponse
	| EventsIndexFailureResponse;
type UsersSelfResponse = UsersSelfSuccessResponse | UsersSelfFailureResponse;
type EventUpdateResponse = EventUpdateSuccessResponse | EventUpdateFailureResponse;
type EventDeleteResponse = EventDeleteSuccessResponse | EventDeleteFailureResponse;

interface SignupSuccessResponse {
	type: 'success';
	token: string;
}

interface SignupFailureResponse {
	type: 'failure';
	reason: string;
}

interface SigninSuccessResponse {
	type: 'success';
	user: User;
}

interface SigninFailureResponse {
	type: 'failure';
	reason: string;
}

interface EventsIndexSuccessResponse {
	type: 'success';
	events: DBCalendarEvent[];
}

interface EventCreateSuccessResponse {
	type: 'success';
	event: DBCalendarEvent;
}

interface EventCreateFailureResponse {
	type: 'failure';
	reason: string;
}

interface EventsIndexFailureResponse {
	type: 'failure';
	reason: string;
}

interface UsersSelfSuccessResponse {
	type: 'success';
	user: User;
}

interface UsersSelfFailureResponse {
	type: 'failure';
	reason: string;
}

interface EventUpdateSuccesResponse {
	type: 'success';
	event: DBCalendarEvent;
}

interface EventUpdateFailureResponse {
	type: 'failure';
	reason: string;
}

interface EventDeleteSuccessResponse {
	type: 'success';
	events: CalendarEvent[];
}

interface EventDeleteFailureResponse {
	type: 'failure';
	reason: string;
}
