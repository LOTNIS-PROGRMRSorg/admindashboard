import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from './api';

/**
 * GET a path and keep the result. `data` is the response's `data` (or the whole body when there is none).
 * Pass `null` as the path to skip the request. Call `reload()` after an action.
 */
export function useApi(path) {
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: '' });
  const key = `${nonce}:${path}`;

  useEffect(() => {
    if (!path) return undefined;
    let live = true;
    apiFetch(path)
      .then((body) => live && setResult({ key, data: body && typeof body === 'object' && 'data' in body ? body.data : body, error: '', total: body?.total, page: body?.page, limit: body?.limit }))
      .catch((e) => live && setResult({ key, data: null, error: e.message }));
    return () => { live = false; };
  }, [path, key]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const settled = result.key === key;
  return { data: settled ? result.data : (result.key && result.key.endsWith(`:${path}`) ? result.data : null), error: settled ? result.error : '', loading: !!path && !settled, total: result.total, page: result.page, limit: result.limit, reload };
}

/** POST/PATCH helper that unwraps the standard envelope. */
export const send = (path, method, body) => apiFetch(path, { method, body: body === undefined ? undefined : JSON.stringify(body) }).then((r) => (r && typeof r === 'object' && 'data' in r ? r.data : r));
