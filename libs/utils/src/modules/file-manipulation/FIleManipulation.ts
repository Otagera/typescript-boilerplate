import fs from "fs";
import path from "path";
import { RecursivelyListDirCallback } from "../type";

export class FileManipulation {
	static recursivelyListDir = (
		dir: string,
		callback: RecursivelyListDirCallback
	) => {
		fs.readdirSync(dir).forEach((f) => {
			let dirPath = path.join(dir, f);
			let isDirectory = fs.statSync(dirPath).isDirectory();
			isDirectory
				? this.recursivelyListDir(dirPath, callback)
				: callback(path.join(dir, f));
		});
	};

	static loadupModels = (pathToCheckModels: string) => {
		const filesInModules: string[] = [];

		this.recursivelyListDir(pathToCheckModels, (filePath: string) => {
			filesInModules.push(filePath);
		});
		filesInModules
			.filter(
				(file) => file.indexOf(".") !== 0 && file.slice(-9) === ".model.ts"
			)
			.forEach((file) => {
				// eslint-disable-next-line global-require, import/no-dynamic-require
				require(`${file}`);
			});
	};
}
