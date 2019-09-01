


export async function handleRequest(request: Request): Promise<Response> {
    console.log("GOT REQUEST", request)

    // Response in Deno domTypes is different?
    return new Response('', 200, [], -1, false, null);
}


