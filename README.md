Can we get deno bundles to run on cloudflare workers?


```
deno bundle main.js
wrangler publish 
```

An error (for now)

```
cmcfarland:deno-worker-test $ wrangler publish
 JavaScript project found. Skipping unnecessary build!
Error: Something went wrong! Status: 400 Bad Request, Details {
  "result": null,
  "success": false,
  "errors": [
    {
      "code": 10021,
      "message": "Uncaught ReferenceError: define is not defined\n  at line 1\n"
    }
  ],
  "messages": []
}
```
