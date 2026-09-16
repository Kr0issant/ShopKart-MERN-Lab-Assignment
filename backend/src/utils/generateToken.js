import jwt from "jsonwebtoken";

export function genToken(userId) {
	return jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
};
