import { handleRequest } from './lib.ts';

addEventListener('fetch', event => {
    // @ts-ignore
    event.respondWith(handleRequest(event.request))
});


