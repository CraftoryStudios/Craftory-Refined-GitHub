import OptionsSyncPerDomain from 'webext-options-sync-per-domain';

export type RGHOptions = typeof defaults;

// eslint-disable-next-line prefer-object-spread -- TypeScript doesn't merge the definitions so `...` is not equivalent.
const defaults = Object.assign({
	customCSS: '',
	personalToken: '',
	logging: false
}, Object.fromEntries(__features__.map(id => [`feature:${id}`, true])));

const migrations = [
	// Removed features will be automatically removed from the options as well
	OptionsSyncPerDomain.migrations.removeUnused
];

export const perDomainOptions = new OptionsSyncPerDomain({defaults, migrations});
export default perDomainOptions.getOptionsForOrigin();
