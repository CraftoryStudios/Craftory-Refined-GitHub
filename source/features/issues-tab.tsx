import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {getRepo} from '../github-helpers';
import features from '.';
import SearchQuery from '../github-helpers/search-query';
import abbreviateNumber from '../helpers/abbreviate-number';
import * as api from '../github-helpers/api';
import cache from 'webext-storage-cache';

const countIssues = cache.function(async (): Promise<number> => {
	const {search} = await api.v4(`
		search(type: ISSUE, query: "-label:bug -label:feature is:open is:issue repo:${getRepo()!.nameWithOwner}") {
			issueCount
		}
	`);

	return search.issueCount;
}, {
	maxAge: {minutes: 30},
	staleWhileRevalidate: {days: 4},
	cacheKey: (): string => __filebasename + ':' + getRepo()!.nameWithOwner
});

async function init(): Promise<void | false> {
	const countPromise = countIssues();

	const issuesTab = (await elementReady('.js-repo-nav [data-hotkey="g i"]', {waitForChildren: false}))?.parentElement;
	if (!issuesTab) {
		// Repo is archived
		return false;
	}

	// Set temporary counter
	const issuesCounter = select('.Counter', issuesTab)!;
	issuesCounter.textContent = '0';
	issuesCounter.title = '';

	const issuesLink = select('a', issuesTab)!;
	new SearchQuery(issuesLink).add('-label:feature -label:bug');

	// Update bugs count
	try {
		issuesCounter.textContent = abbreviateNumber(await countPromise);
	} catch (error: unknown) {
		issuesCounter.remove();
		features.error(__filebasename, error);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo
	],
	awaitDomReady: false,
	init
});
