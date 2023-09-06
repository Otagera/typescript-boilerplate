import {
	FilterQuery,
	Model,
	ObjectId,
	QueryOptions,
	UpdateQuery,
	UpdateWriteOpResult,
} from "mongoose";
import { IGenericRepository } from "./generic-repository.abstract";

export class MongoGenericRepository<T> implements IGenericRepository<T> {
	private _repository: Model<T>;

	constructor(repository: Model<T>) {
		this._repository = repository;
	}

	fetchAll(
		filter: FilterQuery<T>,
		queryOption: QueryOptions = {}
	): Promise<T[]> {
		return this._repository.find(filter, null, queryOption).exec();
	}

	async fetch(id: ObjectId): Promise<T> {
		return this._repository
			.findById(id)
			.exec()
			.then((doc: any) => {
				if (!doc) return null;
				return doc.toJSON() as T;
			});
	}

	async fetchOneByQuery(
		query: FilterQuery<T>,
		queryOptions: QueryOptions,
		customOptions: { select: any; populate: any }
	): Promise<T> {
		const doc = await this._repository
			.findOne({ isDeleted: false, ...query }, null, queryOptions)
			.select(customOptions?.select || {})
			.populate(customOptions?.populate || "")
			.lean()
			.exec();

		if (!doc) return null;

		return doc as T;
	}

	async create(item: T): Promise<T> {
		return this._repository.create(item);
	}

	update(id: ObjectId, item: T) {
		return this._repository.findByIdAndUpdate(id, item);
	}

	findAndUpdate(filter: FilterQuery<T>, item: T) {
		return this._repository.findOneAndUpdate(filter, item);
	}

	async upsert(
		query: FilterQuery<T>,
		updateQuery: UpdateQuery<T>,
		options: QueryOptions = { upsert: true }
	): Promise<UpdateWriteOpResult> {
		return this._repository.updateOne(query, updateQuery, options).exec();
	}

	remove(id: ObjectId) {
		return this._repository.findByIdAndUpdate(id, { isDeleted: true });
	}
}
