/*
Copyright 2019 Udacity, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Content derived from Cloudflare Developer Documentation. © 2019 Cloudflare, Inc.
*/

// Why is this a global augmentation?
//
// Because Cloudflare extends the Request object with additional attributes.
// ref: https://developers.cloudflare.com/workers/reference/request-attributes/

declare global {
    interface CfRequest {
      cf: CloudflareRequestAttributes; // extends, therefore includes CloudflareRequestFeatures
    }
  
    /**
     * Cloudflare Cache Storage
     *
     * The Cache API gives you fine grained control of reading and writing from
     * cache, and deciding exactly when to fetch data from your origin.
     *
     * ref: https://developers.cloudflare.com/workers/reference/cache-api/
     *
     * This global augmentation adds the Cloudflare Cache storage object to the
     * regular CacheStorage interface.
     */
    interface CacheStorage {
      /**
       * The Cloudflare Workers runtime exposes a single global Cache object,
       * caches.default. This differs from web browsers’ Cache API in that they do
       * not expose any default cache object.
       */
      default: CloudflareDefaultCacheStorage;
    }
  
    // Overload fetch to accept the CloudflareRequestInit interface
    interface GlobalFetch {
      fetch(input: RequestInfo, init?: CloudflareRequestInit): Promise<Response>;
    }
    interface WindowOrWorkerGlobalScope {
      fetch(input: RequestInfo, init?: CloudflareRequestInit): Promise<Response>;
    }
    function fetch(
      input: RequestInfo,
      init?: CloudflareRequestInit,
    ): Promise<Response>;
  
    // Overload Headers interface to manually add entries()
    // https://github.com/udacity/cloudflare-typescript-workers/issues/4
    interface Headers {
      /**
       * The Headers.entries() method returns an iterator allowing to go through
       * all key/value pairs contained in this object. The both the key and value
       * of each pairs are ByteString objects.
       *
       * Note: This override will exist until
       * https://github.com/microsoft/TSJS-lib-generator/issues/729 is fixed.
       */
      entries(): IterableIterator<[string, string]>;
    }
  }
  
  /**
   * CloudflareWorkerGlobalScope extends the ServiceWorkerGlobalScope to include
   * CloudflareWorkerGlobalScopePatch when created with makeCloudflareWorkerEnv().
   *
   * ServiceWorkerGlobalScope could be used instead of this empty extends, but
   * this makes the developer experience more consistent and allows for easier
   * upgrades if/when changes are implemented.
   */
  // tslint:disable-next-line:no-empty-interface
  export interface CloudflareWorkerGlobalScope extends ServiceWorkerGlobalScope {}
  export default CloudflareWorkerGlobalScope;
  
  export interface CloudflareCacheQueryOptions {
    /**
     * Consider the request method to be GET, regardless of its actual value.
     */
    ignoreMethod: boolean;
  }
  
  /**
   * A Cache object exposes three methods. Each method accepts a Request object or
   * string value as its first parameter. If a string is passed, it will be
   * interpreted as the URL for a new Request object.
   */
  export interface CloudflareDefaultCacheStorage {
    put(request: Request | string, response: Response): Promise<undefined>;
    match(
      request: Request | string,
      options?: CloudflareCacheQueryOptions,
    ): Promise<Response | undefined>;
    delete(
      request: Request | string,
      options?: CloudflareCacheQueryOptions,
    ): Promise<boolean>;
  }
  
  export interface CloudflareCacheStorage {
    default: CloudflareDefaultCacheStorage;
  }
  
  // Does not extend ServiceWorkerGlobalScope because we are entirely replacing to
  // match the Cloudflare implementation.
  export interface CloudflareWorkerGlobalScopePatch {
    caches: CloudflareCacheStorage;
  }
  
  // CloudflareWorkerGlobalKVPatch adds a KV name to the global scope
  export interface CloudflareWorkerGlobalKVPatch {
    [kv: string]: CloudflareWorkerKV;
  }
  
  /**
   * Cloudflare Request Attributes
   *
   * Workers allows you to run custom logic based for any incoming request. In
   * addition to the information available on the Request object, such as headers,
   * Cloudflare provides additional attributes of the request using the request.cf
   * object.
   *
   * Attributes available on request.cf:
   * * tlsVersion: the TLS version used on the connection to Cloudflare.
   * * tlsCipher: the cipher used on the connection to Cloudflare.
   * * country: the two letter country code on the request (this is the same value
   *   as the one provided by the CF-IPCountry header)
   * * colo: the three letter airport code of the colo the request hit.
   *
   * Attributes available through headers:
   * * Client IP: the client IP is available via the CF-Connecting-IP header.
   *
   * WARNING: Request Attributes do not currently work in the Worker Editor
   * Preview, resulting in an error: "Uncaught (in response) TypeError: Cannot
   * read property 'country' of undefined." See:
   * https://developers.cloudflare.com/workers/recipes/tls-version-blocking/
   *
   */
  export interface CloudflareRequestAttributes extends CloudflareRequestFeatures {
    /**
     * The TLS version used on the connection to Cloudflare.
     */
    readonly tlsVersion: string;
  
    /**
     * The cipher used on the connection to Cloudflare.
     */
    readonly tlsCipher: string;
  
    /**
     * The two letter country code on the request (this is the same value as
     * the one provided by the CF-IPCountry header.)
     */
    readonly country: string;
  
    /**
     * The three letter airport code of the colo the request hit.
     */
    readonly colo: string;
  }
  
  // An interface for controlling Cloudflare Features on Requests. Reference:
  // https://developers.cloudflare.com/workers/reference/cloudflare-features/
  export interface CloudflareRequestFeatures {
    /**
     * Sets Polish mode. The possible values are "lossy", "lossless", or "off".
     */
    polish?: string;
  
    /**
     * Enables or disables AutoMinify for various file types. The value is an
     * object containing boolean fields for javascript, css, and html.
     */
    minify?: {
      javascript?: boolean;
      css?: boolean;
      html?: boolean;
    };
  
    /**
     * Disables Mirage for this request. When you specify this option, the value
     * should always be false.
     */
    mirage?: boolean;
  
    /**
     * Disables ScrapeShield for this request. When you specify this option, the
     * value should always be false.
     */
    scrapeShield?: boolean;
  
    /**
     * Disables Cloudflare Apps for this request. When you specify this option,
     * the value should always be false.
     */
    apps?: boolean;
  
    /**
     *
     * Redirects the request to an alternate origin server. You can use this, for
     * example, to implement load balancing across several origins.
     *
     * You can achieve a similar effect by simply changing the request URL. For
     * example:
     *
     * let url = new URL(event.request.url)
     * url.hostname = 'us-east.example.com'
     * fetch(url, event.request)
     *
     * However, there is an important difference: If you use resolveOverride to
     * change the origin, then the request will be sent with a Host header
     * matching the original URL. Often, your origin servers will all expect the
     * Host header to specify your web site’s main hostname, not the hostname of
     * the specific replica. This is where resolveOverride is needed.
     *
     * For security reasons, resolveOverride is only honored when both the URL
     * hostname and the resolveOverride hostname are orange-cloud hosts within
     * your own zone. Otherwise, the setting is ignored. Note that CNAME hosts are
     * allowed. So, if you want to resolve to a hostname that is under a different
     * domain, first declare a CNAME record within your own zone’s DNS mapping to
     * the external hostname, then set resolveOverride to point to that CNAME
     * record.
     */
    resolveOverride?: string;
  
    /**
     * Set cache key for this request.
     *
     * A request’s cache key is what determines if two requests are "the same" for
     * caching purposes. If a request has the same cache key as some previous
     * request, then we can serve the same cached response for both.
     *
     * Normally, Cloudflare computes the cache key for a request based on the
     * request’s URL. Sometimes, though, you’d like different URLs to be treated
     * as if they were the same for caching purposes. For example, say your web
     * site content is hosted from both Amazon S3 and Google Cloud Storage – you
     * have the same content in both places, and you use a Worker to randomly
     * balance between the two. However, you don’t want to end up caching two
     * copies of your content! You could utilize custom cache keys to cache based
     * on the original request URL rather than the subrequest URL:
     *
     * addEventListener('fetch', event => {
     *   let url = new URL(event.request.url);
     *   if (Math.random() < 0.5) {
     *     url.hostname = 'example.s3.amazonaws.com'
     *   } else {
     *     url.hostname = 'example.storage.googleapis.com'
     *   }
     *
     *   let request = new Request(url, event.request)
     *   event.respondWith(fetch(request, {
     *     cf: { cacheKey: event.request.url }
     *   }))
     * })
     *
     * Notes:
     * * Each zone has its own private cache key namespace. That means that two
     *   workers operating within the same zone (even on different hostnames) may
     *   share cache using custom cache keys, but workers operating on behalf of
     *   different zones cannot affect each other’s cache.
     * * You can only override cache keys when making requests within your own
     *   zone, or requests to hosts that are not on Cloudflare. When making a
     *   request to another Cloudflare zone (e.g. belonging to a different
     *   Cloudflare customer), that zone fully controls how its own content is
     *   cached within Cloudflare; you cannot override it.
     * * URLs that are fetch()ed with a custom cache key cannot be purged using a
     *   URL purge. However you can use the Cache API and set a Cache Tag on the
     *   response object if you need to purge the URL.
     */
    cacheKey?: string;
  
    /**
     * This option forces Cloudflare to cache the response for this request,
     * regardless of what headers are seen on the response. This is equivalent to
     * setting two page rules: "Edge Cache TTL" and "Cache Level" (to "Cache
     * Everything").
     */
    cacheTtl?: number;
  
    /**
     * This option is a version of the cacheTtl feature which chooses a TTL based
     * on the response’s status code. If the response to this request has a status
     * code that matches, Cloudflare will cache for the instructed time, and
     * override cache instructives sent by the origin.
     *
     * This gives you control over how long assets will stay in the Cloudflare
     * cache based on the response code. For example, you could cache successful
     * fetches for longer, but continue to fetch assets from the origin in the
     * event of failures. You may also use this feature to cache redirects.
     *
     * You may still choose to have different rules based on request settings by
     * checking the URI or headers.
     *
     * TTL values:
     * * Positive TTL values indicate in seconds how long Cloudflare should cache
     *   the asset for
     * * 0 TTL will cause assets to get cached, but expire immediately (revalidate
     *   from origin every time)
     * * -1, or any negative value will instruct Cloudflare not to cache at all
     *
     * Please note, that Cloudflare will still adhere to standard cache levels,
     * so by default this will override cache behavior for static files. If you
     * wish to cache non-static
     */
    cacheTtlByStatus?: { [key: string]: number };
  
    /**
     * Setting the cache level to Cache Everything will override the default
     * “cacheability” of the asset. For TTL, Cloudflare will still rely on headers
     * set by the origin.
     *
     * Note: This feature is only listed on
     * https://developers.cloudflare.com/workers/recipes/vcl-conversion/controlling-the-cache/
     * and not the primary API documentation page.
     */
    cacheEverything?: boolean;
  }
  
  export interface CloudflareRequestInit extends RequestInit {
    /**
     * Controlling Cloudflare Features
     * You can use a Worker to control how other Cloudflare features affect the
     * request. Your Worker runs after security features, but before everything
     * else. Therefore, a Worker cannot affect the operation of security features
     * (since they already finished), but it can affect other features, like
     * Polish or ScrapeShield, or how Cloudflare caches the response.
     *
     * Cloudflare features are controlled through the cf property of a request.
     * Setting cf is kind of like setting headers. You can add cf to a request
     * object by making a copy:
     *
     * // Disable ScrapeShield for this request.
     * let request = new Request(event.request, { cf: { scrapeShield: false } })
     *
     * Alternatively, you can set cf directly on fetch():
     * // Disable ScrapeShield for this request.
     * fetch(event.request, { cf: { scrapeShield: false } })
     *
     * Note: Invalid or incorrectly-named settings in the cf object will be
     * silently ignored. Be careful to test that you are getting the behavior you
     * want. Currently, settings in the cf object cannot be tested in the live
     * preview.
     */
    cf: CloudflareRequestFeatures; // Features, not Attributes, because Attributes are readonly.
  }
  
  /**
   * Cloudflare Worker KV
   *
   * Workers KV is a global, low-latency, key-value data store. It supports exceptionally
   * high read volumes with low-latency, making it possible to build highly dynamic APIs
   * and websites which respond as quickly as a cached static file would.
   *
   * Workers KV is generally good for use-cases where you need to write relatively infrequently,
   * but read quickly and frequently. It is optimized for these high-read applications, only
   * reaching its full performance when data is being frequently read. Very infrequently read
   * values are stored centrally, while more popular values are maintained in all of our data
   * centers around the world.
   *
   * KV achieves this performance by being eventually-consistent. New key-value pairs are
   * immediately available everywhere, but value changes may take up to ten seconds to propagate.
   * Workers KV isn’t ideal for situations where you need support for atomic operations or where
   * values must be read and written in a single transaction.
   *
   * ref: https://developers.cloudflare.com/workers/kv
   *
   * Prerequisite
   * The first step is to bind one of your Namespaces to your Worker. This will make
   * that Namespace accessible from within the Worker at the variable name you specify.
   * ref: https://developers.cloudflare.com/workers/api/resource-bindings/
   */
  export interface CloudflareWorkerKV {
    /**
     * Read Value
     *
     * NAMESPACE.get(key, [type])
     *
     * The method returns a promise you can await to get the value.
     * If the key is not found, the promise will resolve with the literal value null.
     *
     * Type can be any of:
     *    "text" (default)
     *    "json"
     *    "arrayBuffer"
     *    "stream"
     *
     * The most performant way to read a KV value is directly from a Worker.
     * Read performance will generally get better the higher your read volume.
     *
     * For simple values it often makes sense to use the default "text" type which
     * provides you with your value as a string. For convenience a "json" type is also
     * specified which will convert your value into an object before returning it to you.
     * For large values you can request a ReadableStream, and for binary values an ArrayBuffer.
     */
    get(key: string, type?: 'text'): Promise<string>;
    get(key: string, type: 'json'): Promise<any>;
    get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer>;
    get(key: string, type: 'stream'): Promise<ReadableStream>;
  
    /**
     * Write Value
     *
     * You can write and delete values from a Worker, but you should note that it is an
     * eventually consistent data store. In practice, this means it is not uncommon for
     * an edge location to continue returning an old value for a key that has recently been
     * written in some other edge location. If, after considering that, it does make sense
     * to write values from your Worker, the API is:
     *
     * NAMESPACE.put(key, value, options?)
     *
     * The type is automatically inferred from value, and can be any of:
     *    string
     *    ReadableStream
     *    ArrayBuffer
     *    FormData
     *
     * All values are encrypted at rest with 256-bit AES-GCM, and only decrypted by the
     * process executing your Worker scripts.
     *
     * If you want the keys you write to be automatically deleted at some time in the future,
     * use the optional third parameter. It accepts an object with optional fields that allow
     * you to customize the behavior of the put. In particular, you can set either expiration
     * or expirationTtl, depending on how you would like to specify the key’s expiration time.
     * In other words, you’d run one of the two commands below to set an expiration when writing
     * a key from within a Worker:
     *
     * NAMESPACE.put(key, value, {expiration: secondsSinceEpoch})
     *
     * NAMESPACE.put(key, value, {expirationTtl: secondsFromNow})
     *
     * These assume that secondsSinceEpoch and secondsFromNow are variables defined elsewhere in
     * your Worker code.
     */
    put(
      key: string,
      value: string | ReadableStream | ArrayBuffer | FormData,
      options?: CloudflareWorkerKVOptions,
    ): Promise<void>;
  
    /**
     * Delete Value
     *
     * NAMESPACE.delete(key)
     *
     * As with all updates, deletes can take up to ten seconds to propagate globally.
     */
    delete(key: string): void;
  }
  
  /**
   * Cloudflare Worker KV Options
   * Worker KV accepts a third parameters to control the lifetime of the key
   * ref: https://developers.cloudflare.com/workers/kv/expiring-keys/
   *
   * Many common uses of Workers KV involve writing keys that are only meant to be valid
   * for a certain amount of time. Rather than requiring applications to remember to delete
   * such data at the appropriate time, Workers KV offers the ability to create keys that
   * automatically expire, either at a particular point in time or after a certain amount of
   * time has passed since the key was last modified.
   */
  export interface CloudflareWorkerKVOptions {
    /**
     * Set its “expiration”, using an absolute time specified in a number of seconds since the
     * UNIX epoch. For example, if you wanted a key to expire at 12:00AM UTC on April 1, 2019,
     * you would set the key’s expiration to 1554076800.
     */
    expiration?: number;
    /**
     * Set its “expiration TTL” (time to live), using a relative number of seconds from the
     * current time. For example, if you wanted a key to expire 10 minutes after creating it,
     * you would set its expiration TTL to 600.
     */
    expirationTtl?: number;
  }
  