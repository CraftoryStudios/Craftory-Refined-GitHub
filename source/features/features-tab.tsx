import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {RubyIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepo} from '../github-helpers';
import SearchQuery from '../github-helpers/search-query';
import abbreviateNumber from '../helpers/abbreviate-number';

const countFeature = cache.function(async (): Promise<number> => {
	const {search} = await api.v4(`
		search(type: ISSUE, query: "label:feature is:open is:issue repo:${getRepo()!.nameWithOwner}") {
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
	// Query API as early as possible, even if it's not necessary on archived repos
	const countPromise = countFeature();

	// On a label:bug listing:
	// - always show the tab, as soon as possible
	// - update the count later
	// On other pages:
	// - only show the tab if needed
	const isFeaturePage = new SearchQuery(location.search).includes('label:feature');
	if (!isFeaturePage && await countPromise === 0) {
		return false;
	}

	const issuesTab = (await elementReady('.js-repo-nav [data-hotkey="g i"]', {waitForChildren: false}))?.parentElement;
	const pullRequestTab = (await elementReady('.js-repo-nav [data-hotkey="g p"]', {waitForChildren: false}))?.parentElement;
	if (!issuesTab) {
		// Repo is archived
		return false;
	}

	if (isFeaturePage) {
		// Hide pinned issues on the tab page, they might not belong there
		// eslint-disable-next-line promise/prefer-await-to-then -- Don't await; if there are no pinned issues, this would delay the bug count update
		void elementReady('.js-pinned-issues-reorder-container', {waitForChildren: false}).then(pinnedIssues => pinnedIssues?.remove());
	}

	// Copy Issues tab
	const featureTab = issuesTab.cloneNode(true);

	// Disable unwanted behavior #3001
	const featuresLink = select('a', featureTab)!;
	featuresLink.removeAttribute('data-hotkey');
	featuresLink.removeAttribute('data-selected-links');
	select('a', issuesTab)!.removeAttribute('data-selected-links');

	// Update its appearance
	const featureTabTitle = select('[data-content]', featureTab);
	if (featureTabTitle) {
		featureTabTitle.dataset.content = 'Features';
		featureTabTitle.textContent = 'Features';
		select('.octicon', featureTab)!.replaceWith(<RubyIcon className="UnderlineNav-octicon d-none d-sm-inline"/>);

		// Un-select one of the tabs if necessary
		const selectedTabLink = !isFeaturePage || pageDetect.isPRList() ? featuresLink : select('.selected', issuesTab);
		selectedTabLink?.classList.remove('selected');
		selectedTabLink?.removeAttribute('aria-current');
	} else {
		// Pre "Repository refresh" layout
		select('[itemprop="name"]', featureTab)!.textContent = 'Features';
		select('.octicon', featureTab)!.replaceWith(<RubyIcon/>);

		// Change the Selected tab if necessary
		featuresLink.classList.toggle('selected', isFeaturePage && !pageDetect.isPRList());
		select('.selected', issuesTab)?.classList.toggle('selected', !isFeaturePage);
	}

	// Set temporary counter
	const featuresCounter = select('.Counter', featureTab)!;
	featuresCounter.textContent = '0';
	featuresCounter.title = '';

	// Update Features link
	const query = new SearchQuery(featuresLink);
	query.add('label:feature');
	query.remove('-label:feature');
	query.remove('-label:bug');

	pullRequestTab?.before(featuresLink);

	// Update features count
	try {
		featuresCounter.textContent = abbreviateNumber(await countPromise);
	} catch (error: unknown) {
		featuresCounter.remove();
		features.error(__filebasename, error);
	}

	const labels: HTMLElement[] = select.all('[data-name="Feature"]')
	labels.forEach(label => {
		label.remove();
	})
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo
	],
	awaitDomReady: false,
	init
});
