import "reflect-metadata";
import { AppRouter } from "../AppRouter";
import { Methods } from "./Methods";
import { MetadataKeys } from "./MetadataKeys";
import { bodyValidators } from "../middlewares/bodyValidators";

export function controller(routePrefix: string) {
	return function (target: Function) {
		const router = AppRouter.getInstance();
		for (let key in Object.getOwnPropertyDescriptors(target.prototype)) {
			const routeHandler = target.prototype[key];
			const path = Reflect.getMetadata(
				MetadataKeys.path,
				target.prototype,
				key
			);
			const method: Methods = Reflect.getMetadata(
				MetadataKeys.method,
				target.prototype,
				key
			);
			const middlewares =
				Reflect.getMetadata(MetadataKeys.middleware, target.prototype, key) ||
				[];
			const requiredBodyProps =
				Reflect.getMetadata(MetadataKeys.validator, target.prototype, key) ||
				[];

			const validator = bodyValidators(requiredBodyProps);

			if (path) {
				const temp = router[method](
					`${routePrefix}${path}`,
					...middlewares,
					validator,
					routeHandler
				);
			}
		}
	};
}
