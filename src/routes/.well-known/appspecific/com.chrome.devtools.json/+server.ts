export async function GET() {
	return new Response('{}', {
		headers: {
			'content-type': 'application/json'
		}
	});
}