import { verifyToken } from "@clerk/backend";

export async function clerkAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing token" });
        }

        const token = authHeader.replace("Bearer ", "");

        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        // attach useful data to request
        req.userId = payload.sub;
        req.sessionId = payload.sid;

        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
