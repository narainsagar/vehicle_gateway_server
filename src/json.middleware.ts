import { Request, Response, NextFunction } from "express";

export function jsonMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.method === "POST" || req.method === "PUT") {
    // Parse the request body as JSON
    try {
      if (typeof req.body === "string") {
        req.body = JSON.parse(req.body);
      } else if (typeof req.body === `object`) {
        // console.log('already json')
      } else {
        console.error('invalid request body:', req.body)
      }
    } catch (err) {
      res.status(400).json({ error: "Invalid JSON" });
      return;
    }
  }

  // Set the response Content-Type header to application/json
  // res.setHeader("Content-Type", "application/json");

  // Call the next middleware or controller function
  next();
}
