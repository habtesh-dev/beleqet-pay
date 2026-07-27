import { Request, Response, NextFunction } from 'express';

/**
 * Captures raw request bytes onto req.rawBody for webhook routes only.
 * Chapa/Stripe HMAC signatures are computed over the literal bytes they
 * sent — verifying against a re-serialized JSON.parse() body will make
 * signature checks fail (or, worse, pass for the wrong payload). So: capture
 * bytes first, let the JSON body-parser run second.
 */
export function rawBodyMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (!req.path.includes('/webhooks/')) return next();

  const chunks: Buffer[] = [];
  req.on('data', (chunk: Buffer) => chunks.push(chunk));
  req.on('end', () => {
    (req as any).rawBody = Buffer.concat(chunks);
    next();
  });
}
