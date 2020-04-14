import { createWebhookModule } from 'sipgateio';
import socketIo from 'socket.io';

(async (): Promise<void> => {
	const port = Number(process.env.PORT) || 8080;
	const serverAddress = process.env.SIPGATE_WEBHOOK_SERVER_ADDRESS || '';

	const webhookModule = createWebhookModule();
	webhookModule
		.createServer({
			port,
			serverAddress,
		})
		.then(webhookServer => {
			console.log(`Server running at ${serverAddress}`);

			const websocketServer = socketIo(webhookServer.getHttpServer(), {
				serveClient: false,
				origins: '*:*',
			});

			webhookServer.onNewCall(newCallEvent => {
				if (newCallEvent['user[]'].includes('voicemail')) {
					return
				}
				const maskedNumber = normalizeNumber(newCallEvent.from);
				console.log('incoming_call', maskedNumber);
				websocketServer.emit('incoming_call', maskedNumber);
			});

			webhookServer.onHangUp(hangupEvent => {
				if (hangupEvent.cause === 'forwarded') {
					return;
				}
				const maskedNumber = normalizeNumber(hangupEvent.from);
				console.log('hangup_call', maskedNumber);
				websocketServer.emit('hangup_call', maskedNumber);
			});

			webhookServer.onAnswer(answerEvent => {
				const maskedNumber = normalizeNumber(answerEvent.from);
				console.log('answer_call', maskedNumber);
				websocketServer.emit('answer_call', maskedNumber);
			});

			websocketServer.on('connection', () => {
				console.log('A new user connected to the Websocket...');
			});
			websocketServer.on('disconnect', () => {
				console.log('A user disconnected to the Websocket...');
			});
		});
})();

const normalizeNumber = (phoneNumber: string): string => {
	if (phoneNumber === 'anonymous') {
		return phoneNumber;
	}

	return `+${phoneNumber.slice(0, phoneNumber.length - 3)}XXX`;
};
