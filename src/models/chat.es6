import Model        from '../model/index';
import SchemaLoader from '../schema';

export default function (client, options = {}) {
	let schema = SchemaLoader.load('chat');
	let db     = client._db;

	if (!options.collectionName) options.collectionName = 'chat';

	class Chat extends Model {
		constructor(...args) {
			super(...args);

			super.initialize(options);
		}

		setCreator(creator) {
			this.set('creatorId', creator);
			this.addMember(creator);

			return this;
		}

		addMember(member) {
			this.members.addToSet(member);

			return this;
		}

		// TODO: test with multiple clients. Static method can be invoked from the property `constructor` of the parent class;
		static collection() { return options.collectionName; }
		static db() { return db; }
		static schema() { return schema; }

		collection() { return options.collectionName; }
		db() { return db; }
		schema() { return schema; }
	}

	Model.ensureIndex(Chat);

	return Chat;
};