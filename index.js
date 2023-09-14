import { isAbsolute, join, sep } from "path";
import { existsSync, readFileSync } from "fs";
import express from "express";
import sharp from "sharp";

const port = 19092;

const allowedOutFormats = new Set(["jpeg", "png", "webp", "gif", "avif", "tiff"]);

const app = express();

app.get("/", async (req, res) => {
	try {
		if (!req.query.filepath || !req.query.format) return res.status(400).send("Bad Request");

		const filePath = req.query.filepath,
			format = req.query.format;

		if (!isAbsolute(filePath) || !existsSync(filePath) || !allowedOutFormats.has(format)) {
			return res.status(400).send("Bad Request");
		}

		const fileParts = filePath.split(sep),
			fileDir = fileParts.slice(0, fileParts.length - 1).join(sep),
			fileName = fileParts[fileParts.length - 1],
			fileNoExt = fileName.split(".")[0];

		if (existsSync(join(fileDir, `${fileNoExt}.${format}`))) return res.status(200).send("OK");

		const file = readFileSync(filePath);
		await sharp(file)
			.toFormat(format)
			.toFile(join(fileDir, `${fileNoExt}.${format}`));

		return res.status(200).send("OK");
	} catch (err) {
		console.error(err);
		return res.status(500).send("Internal Server Error");
	}
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
