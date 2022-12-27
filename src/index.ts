// @ts-ignore
import indexHtml from './public/index.html';

type Environment = {
	DO_WEBSOCKET: DurableObjectNamespace;
};

export { WebSocketDurableObject } from './durable-object';

const worker: ExportedHandler<Environment> = {
	async fetch(request, env) {
		const url = new URL(request.url);

		// pass the request to Durable Object for any WebSocket connection
		if (request.headers.get('upgrade') === 'websocket') {
			const durableObjectId = env.DO_WEBSOCKET.idFromName(url.pathname);
			const durableObjectStub = env.DO_WEBSOCKET.get(durableObjectId);

			const headers = new Headers([...request.headers])

			headers.set('Content-Type', 'application/json')
			headers.set('itty-durable-idFromName', '50')

			// TRY COMMENTING THIS LINE OUT. You'll notice the DO sees a POST request! If it's uncommented
			// the DO sees ONLY GET requests!
			headers.delete('upgrade')

			return durableObjectStub.fetch(request.url, {
				method: 'POST',
				headers,
				cf: request.cf,
				body: JSON.stringify({yo: 'hi'}),
			});
		}

		// return static HTML
		return new Response(indexHtml, {
			headers: { 'content-type': 'text/html' },
		});
	},
};

export default worker;
